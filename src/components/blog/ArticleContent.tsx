/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";

/* ═══════════════════════════════ Styles ═══════════════════════════════ */

const FOCUS_CLS =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70";

const LINK_CLS = `break-words rounded-sm font-semibold text-amber-400 underline decoration-amber-400/50 underline-offset-4 transition-colors hover:text-amber-300 hover:decoration-amber-300 ${FOCUS_CLS}`;

const BOOK_BTN_CLS = `inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 text-sm font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:from-amber-400 hover:to-orange-400 active:scale-[0.98] ${FOCUS_CLS}`;

const GHOST_BTN_CLS = `rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-gray-300 transition hover:border-amber-400/50 hover:text-amber-300 ${FOCUS_CLS}`;

/* ═══════════════════════════ Patterns / helpers ═══════════════════════════ */

const IMG_URL = String.raw`(https?:\/\/[^)\s]+|\/(?!\/)[^)\s]*)`;
const LINK_URL = String.raw`(https?:\/\/[^)\s]+|\/(?!\/)[^)\s]*|#[^)\s]*|mailto:[^)\s]+|tel:[^)\s]+)`;

// Groups: 1 alt, 2 img-url | 3 label, 4 href | 5 bold | 6 italic | 7 code
const INLINE_SRC = [
  String.raw`!\[([^\]]*)\]\(${IMG_URL}\)`,
  String.raw`\[([^\]]+)\]\(${LINK_URL}\)`,
  String.raw`\*\*(.+?)\*\*`,
  String.raw`\*([^*\n]+)\*`,
  "`([^`]+)`",
].join("|");

const CTA_LINK_SRC = String.raw`\[([^\]]+)\]\(${LINK_URL}\)`;

const IMG_BLOCK_RE = /^!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)$/;
const HR_RE = /^---+$/;
const HEADING_MD_RE = /^(#{1,6})(?:\s+(.*))?$/;
const QUOTE_RE = /^>\s?/;
const BULLET_RE = /^[-•*]\s+/;
const ORDERED_RE = /^\d{1,2}[.)]\s+/;
const SENTENCE_END_RE = /[।.]$/;
const COLON_END_RE = /[:：]$/;
// "u" flag => emoji (surrogate pairs) are matched as whole characters
const HEADING_END_RE = new RegExp("[!🏆🚀🔥✨💓🎯⚡]\\uFE0F?$", "u");
const CALLOUT_RE =
  /^(?:\*\*)?(नतीजा\?|सच्चाई\?|क्यों\?|याद रखें:|ध्यान दें:|ध्यान रखें:|नोट:|टिप:)(?:\*\*)?\s+(.+)$/;

const MAX_STEPS = 12;

function stripMd(text: string): string {
  return text
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/\*\*|[*`]/g, "")
    .trim();
}

function renderLink(
  label: ReactNode,
  href: string,
  key: string,
  cls: string,
  arrow = false
): ReactNode {
  const isInternal = href.startsWith("/") && !href.startsWith("//");
  const isExternal = /^https?:\/\//i.test(href);

  if (isInternal) {
    return (
      <Link key={key} href={href} className={cls}>
        {label}
        {arrow && <span aria-hidden="true">→</span>}
      </Link>
    );
  }
  if (isExternal) {
    return (
      <a
        key={key}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cls}
      >
        {label}
        {arrow && <span aria-hidden="true">↗</span>}
      </a>
    );
  }
  // #anchor, mailto:, tel:
  return (
    <a key={key} href={href} className={cls}>
      {label}
    </a>
  );
}

function renderInline(text: string, keyPrefix = "inl"): ReactNode[] {
  const parts: ReactNode[] = [];
  const re = new RegExp(INLINE_SRC, "g");

  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const key = `${keyPrefix}-${i}`;

    if (m[2] !== undefined) {
      // Inline image
      parts.push(
        <img
          key={key}
          src={m[2]}
          alt={m[1] || "Article image"}
          loading="lazy"
          decoding="async"
          className="my-3 block h-auto max-h-96 w-auto max-w-full rounded-xl border border-white/10 shadow-md"
        />
      );
    } else if (m[4] !== undefined) {
      // Link (label may contain bold / italic / code)
      parts.push(renderLink(renderInline(m[3], `${key}-l`), m[4], key, LINK_CLS));
    } else if (m[5] !== undefined) {
      // Bold (may contain links)
      parts.push(
        <strong key={key} className="font-bold text-white">
          {renderInline(m[5], `${key}-b`)}
        </strong>
      );
    } else if (m[6] !== undefined) {
      // Italic
      parts.push(
        <em key={key} className="italic text-amber-200/90">
          {m[6]}
        </em>
      );
    } else if (m[7] !== undefined) {
      // Inline code
      parts.push(
        <code
          key={key}
          className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em] text-amber-300"
        >
          {m[7]}
        </code>
      );
    }

    last = m.index + m[0].length;
    i++;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

/** Splits "text [Button](/book/x)" into plain text + a list of links (for the CTA card). */
function splitCta(text: string): {
  plain: string;
  links: { label: string; href: string }[];
} {
  const links: { label: string; href: string }[] = [];
  const re = new RegExp(CTA_LINK_SRC, "g");
  const plain = text
    .replace(re, (_match: string, label: string, href: string) => {
      links.push({ label: stripMd(label), href });
      return "";
    })
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s:–—-]+|[\s–—-]+$/g, "")
    .trim();
  return { plain, links };
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through to legacy method
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

/* ═══════════════════════════════ Parser ═══════════════════════════════ */

export type ParsedBlock =
  | {
      t: "h2";
      num?: string;
      title: string;
      subtitle?: string;
      id: string;
    }
  | { t: "h3"; text: string; id: string }
  | { t: "lead"; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[]; start: number }
  | { t: "steps"; items: string[] }
  | { t: "quote"; text: string }
  | { t: "chat"; text: string }
  | { t: "cta"; text: string }
  | { t: "labelCard"; label: string; body: string; icon: string }
  | { t: "callout"; badge: string; body: string }
  | { t: "img"; alt: string; src: string }
  | { t: "hr" };

export type TocItem = { id: string; num?: string; text: string };

// Line like "**1. Title**" or "1. Title: subtitle" => major numbered heading
function matchNumberedHeading(rawLine: string): {
  num: string;
  title: string;
  subtitle?: string;
} | null {
  const cleaned = rawLine
    .trim()
    .replace(/^\*\*+/, "")
    .replace(/\*\*+$/, "")
    .trim();

  const m = cleaned.match(/^(\d{1,2})\.\s+(.+)$/);
  if (!m) return null;

  const num = m[1];
  const rest = m[2].trim();

  // Long lines / lines ending with a full stop are list items or paragraphs
  if (rest.length > 115 || SENTENCE_END_RE.test(rest)) return null;

  // "2. Title: subtitle" (skip when a link is present — its "https:" has a colon)
  if (!rest.includes("](")) {
    const colonIdx = rest.indexOf(":");
    if (colonIdx > 2 && colonIdx < rest.length - 2) {
      const title = rest.slice(0, colonIdx).replace(/\*\*/g, "").trim();
      const subtitle = rest.slice(colonIdx + 1).replace(/\*\*/g, "").trim();
      if (title && subtitle) return { num, title, subtitle };
    }
  }

  return { num, title: rest.replace(/\*\*/g, "").trim() };
}

function isSmartSubheading(line: string): boolean {
  const clean = line.replace(/\*\*/g, "").trim();
  return (
    clean.length > 0 &&
    clean.length < 62 &&
    !SENTENCE_END_RE.test(clean) &&
    HEADING_END_RE.test(clean) &&
    !clean.includes("http") &&
    !line.includes("](")
  );
}

// "'फेंकूचंद' सिंड्रोम: ..." or "**'CCTV बॉयफ्रेंड' बनना:** ..."
function matchLabelCard(line: string): { label: string; body: string } | null {
  const cleaned = line.replace(/^\*\*+/, "");
  const m = cleaned.match(/^([^:\n]{2,42}?)(?:\*\*)?:(?:\*\*)?\s+(.+)$/);
  if (!m) return null;

  const label = m[1].replace(/\*\*/g, "").trim();
  const body = m[2].replace(/\*\*$/, "").trim();

  if (
    !label ||
    label.startsWith("[") ||
    label.includes("http") ||
    /^\d+[.)]/.test(label) ||
    /[।.?!]/.test(label) ||
    label.split(/\s+/).length > 8 ||
    body.length < 10
  ) {
    return null;
  }
  return { label, body };
}

function pickCardIcon(label: string): string {
  const l = label.toLowerCase();
  if (
    l.includes("सिंड्रोम") ||
    l.includes("बॉयफ्रेंड") ||
    l.includes("ढिंढोरा") ||
    l.includes("रोतलू") ||
    l.includes("आम लड़का") ||
    l.includes("गलती") ||
    l.includes("red flag")
  ) {
    return "🚩";
  }
  if (
    l.includes("गेम चेंजर") ||
    l.includes("ब्रह्मास्त्र") ||
    l.includes("सीक्रेट") ||
    l.includes("हाई-पॉइंट") ||
    l.includes("निकनेम")
  ) {
    return "⚡";
  }
  return "✦";
}

/** True when the line starts any special (non-paragraph) block. */
function isBlockStart(line: string): boolean {
  return (
    IMG_BLOCK_RE.test(line) ||
    HR_RE.test(line) ||
    HEADING_MD_RE.test(line) ||
    line.startsWith("💬") ||
    line.startsWith("👉") ||
    QUOTE_RE.test(line) ||
    BULLET_RE.test(line) ||
    matchNumberedHeading(line) !== null ||
    isSmartSubheading(line) ||
    CALLOUT_RE.test(line) ||
    matchLabelCard(line) !== null
  );
}

/** Collects consecutive list lines (a single blank line between items is allowed). */
function collectRun(
  lines: string[],
  start: number,
  re: RegExp,
  accept?: (line: string) => boolean
): { items: string[]; next: number } {
  const items: string[] = [];
  let j = start;

  while (j < lines.length) {
    let k = j;
    while (k < lines.length && !lines[k].trim()) k++;
    if (k >= lines.length) break;

    const l = lines[k].trim();
    if (!re.test(l) || (accept && !accept(l))) break;

    items.push(l.replace(re, "").trim());
    j = k + 1;
  }

  return { items, next: j };
}

export function parseArticleContent(content: string): {
  blocks: ParsedBlock[];
  toc: TocItem[];
} {
  const blocks: ParsedBlock[] = [];
  const toc: TocItem[] = [];
  let hCount = 0;
  let expectChecklistSteps = false;

  const pushH2 = (h: { num?: string; title: string; subtitle?: string }) => {
    hCount += 1;
    const id = `section-${hCount}`;
    toc.push({
      id,
      num: h.num,
      text: stripMd(h.subtitle ? `${h.title}: ${h.subtitle}` : h.title),
    });
    blocks.push({
      t: "h2",
      num: h.num,
      title: h.title,
      subtitle: h.subtitle,
      id,
    });
  };

  const rawLines = String(content || "")
    .replace(/\r\n?/g, "\n")
    .split("\n");

  let i = 0;
  while (i < rawLines.length) {
    const line = rawLines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    // 1. Standalone image
    const img = line.match(IMG_BLOCK_RE);
    if (img) {
      expectChecklistSteps = false;
      blocks.push({ t: "img", alt: img[1], src: img[2] });
      i++;
      continue;
    }

    // 2. Divider (---)
    if (HR_RE.test(line)) {
      expectChecklistSteps = false;
      blocks.push({ t: "hr" });
      i++;
      continue;
    }

    // 3. Markdown headings (# / ## => H2, ### and deeper => H3)
    const hm = line.match(HEADING_MD_RE);
    if (hm) {
      expectChecklistSteps = false;
      const rawTitle = (hm[2] || "").trim();
      if (rawTitle) {
        if (hm[1].length >= 3) {
          hCount += 1;
          blocks.push({ t: "h3", text: rawTitle, id: `sub-${hCount}` });
        } else {
          pushH2(matchNumberedHeading(rawTitle) ?? { title: rawTitle });
        }
      }
      i++;
      continue;
    }

    // 4. Smart numbered heading (1. ..., **1. ...**, 2. ... : ...)
    const numbered = matchNumberedHeading(line);
    if (numbered) {
      expectChecklistSteps = false;
      pushH2(numbered);
      i++;
      continue;
    }

    // 5. Chat bubble (starts with 💬)
    if (line.startsWith("💬")) {
      expectChecklistSteps = false;
      blocks.push({ t: "chat", text: line.replace(/^💬\s*/, "").trim() });
      i++;
      continue;
    }

    // 6. Call-to-action banner (starts with 👉)
    if (line.startsWith("👉")) {
      expectChecklistSteps = false;
      blocks.push({ t: "cta", text: line.replace(/^👉\s*/, "").trim() });
      i++;
      continue;
    }

    // 7. Blockquote
    if (QUOTE_RE.test(line)) {
      expectChecklistSteps = false;
      const qLines: string[] = [];
      while (i < rawLines.length && QUOTE_RE.test(rawLines[i].trim())) {
        const q = rawLines[i].trim().replace(QUOTE_RE, "").trim();
        if (q) qLines.push(q);
        i++;
      }
      if (qLines.length) blocks.push({ t: "quote", text: qLines.join(" ") });
      continue;
    }

    // 8. Bullet list (- item / • item / * item)
    if (BULLET_RE.test(line)) {
      expectChecklistSteps = false;
      const run = collectRun(rawLines, i, BULLET_RE);
      blocks.push({ t: "ul", items: run.items });
      i = run.next;
      continue;
    }

    // 9. Ordered list (2+ consecutive "1. text." lines that are not headings)
    if (ORDERED_RE.test(line)) {
      const run = collectRun(
        rawLines,
        i,
        ORDERED_RE,
        (l) => matchNumberedHeading(l) === null
      );
      if (run.items.length >= 2) {
        expectChecklistSteps = false;
        blocks.push({
          t: "ol",
          items: run.items,
          start: parseInt(line, 10) || 1,
        });
        i = run.next;
        continue;
      }
    }

    // 10. Smart subheading (short line ending in "!" or 🏆🚀🔥✨💓🎯⚡)
    if (isSmartSubheading(line)) {
      expectChecklistSteps = false;
      hCount += 1;
      blocks.push({
        t: "h3",
        text: line.replace(/\*\*/g, "").trim(),
        id: `sub-${hCount}`,
      });
      i++;
      continue;
    }

    // 11. Smart callout ("नतीजा? ...", "सच्चाई? ...")
    const callout = line.match(CALLOUT_RE);
    if (callout) {
      expectChecklistSteps = false;
      blocks.push({ t: "callout", badge: callout[1], body: callout[2].trim() });
      i++;
      continue;
    }

    // 12. Smart feature card ("'फेंकूचंद' सिंड्रोम: ...")
    const card = matchLabelCard(line);
    if (card) {
      expectChecklistSteps = false;
      blocks.push({
        t: "labelCard",
        label: card.label,
        body: card.body,
        icon: pickCardIcon(card.label),
      });
      i++;
      continue;
    }

    // 13. Auto checklist: lines right after a paragraph that ends with ":"
    if (
      expectChecklistSteps &&
      line.length < 135 &&
      !COLON_END_RE.test(line) &&
      !line.includes("](/")
    ) {
      const stepItems: string[] = [];
      let j = i;
      while (j < rawLines.length && stepItems.length < MAX_STEPS) {
        const sLine = rawLines[j].trim();
        if (!sLine) {
          j++;
          continue;
        }
        if (
          sLine.length >= 135 ||
          COLON_END_RE.test(sLine) ||
          sLine.includes("](/") ||
          isBlockStart(sLine)
        ) {
          break;
        }
        stepItems.push(sLine.replace(ORDERED_RE, ""));
        j++;
      }
      expectChecklistSteps = false;
      if (stepItems.length >= 2) {
        blocks.push({ t: "steps", items: stepItems });
        i = j;
        continue;
      }
      // fewer than 2 lines => treat as a normal paragraph below
    }

    // A paragraph that ends with ":" makes the following short lines a checklist
    expectChecklistSteps = COLON_END_RE.test(line);

    // 14. First paragraph = editorial lead
    blocks.push(
      blocks.length === 0 ? { t: "lead", text: line } : { t: "p", text: line }
    );
    i++;
  }

  return { blocks, toc };
}

/* ═════════════════════════ Small client widgets ═════════════════════════ */

export function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onClick = async () => {
    const ok = await copyToClipboard(url);
    if (!ok) return;
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-live="polite"
      className={`rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-bold text-gray-200 transition-all hover:border-amber-400/60 hover:bg-amber-500/10 hover:text-amber-300 ${FOCUS_CLS}`}
    >
      {copied ? "✓ Link copy ho gaya" : "🔗 Link copy karo"}
    </button>
  );
}

/* ═══════════════════════════════ Component ═══════════════════════════════ */

export default function ArticleContent({ content }: { content: string }) {
  const [fontSize, setFontSize] = useState<"normal" | "large">("normal");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { blocks, toc } = useMemo(() => parseArticleContent(content), [content]);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const copyChatText = useCallback(async (rawText: string, idx: number) => {
    const clean = stripMd(rawText).replace(/^["“”]+|["“”]+$/g, "");
    const ok = await copyToClipboard(clean);
    if (!ok) return;
    setCopiedIdx(idx);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopiedIdx(null), 2000);
  }, []);

  const textSizeCls =
    fontSize === "large"
      ? "text-[18px] leading-[1.95] sm:text-[19.5px]"
      : "text-[16px] leading-[1.85] sm:text-[17.5px]";

  const renderBlock = (b: ParsedBlock, idx: number): ReactNode => {
    const k = `blk-${idx}`;

    switch (b.t) {
      case "lead":
        return (
          <div
            key={k}
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-5 pl-6 sm:p-6 sm:pl-8"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-amber-400 via-orange-500 to-rose-500" />
            <p className="text-[17px] font-medium leading-[1.9] text-gray-100 sm:text-[19px]">
              {renderInline(b.text, k)}
            </p>
          </div>
        );

      case "h2":
        return (
          <div key={k} id={b.id} className="scroll-mt-24 pt-8">
            <div className="flex items-start gap-3.5 border-b border-white/10 pb-4 sm:gap-4">
              {b.num ? (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 font-mono text-base font-black text-slate-950 shadow-md shadow-amber-500/20 sm:h-11 sm:w-11 sm:text-lg">
                  {b.num.padStart(2, "0")}
                </span>
              ) : (
                <span className="mt-1.5 h-7 w-1.5 shrink-0 rounded-full bg-gradient-to-b from-amber-400 to-orange-500" />
              )}
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-xl font-extrabold leading-[1.35] text-white sm:text-2xl">
                  {renderInline(b.title, `${k}-t`)}
                </h2>
                {b.subtitle && (
                  <p className="mt-1.5 text-[15px] font-semibold leading-snug text-amber-300 sm:text-base">
                    {renderInline(b.subtitle, `${k}-s`)}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case "h3":
        return (
          <h3
            key={k}
            id={b.id}
            className="flex scroll-mt-24 items-center gap-2.5 pt-4 font-serif text-lg font-extrabold leading-snug text-amber-300 sm:text-xl"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" />
            <span className="min-w-0">{renderInline(b.text, k)}</span>
          </h3>
        );

      case "labelCard": {
        const isRedFlag = b.icon === "🚩";
        return (
          <div
            key={k}
            className={`overflow-hidden rounded-2xl border ${
              isRedFlag
                ? "border-rose-500/25 bg-rose-500/[0.05]"
                : "border-amber-500/25 bg-amber-500/[0.05]"
            }`}
          >
            <div
              className={`flex items-center gap-2.5 border-b px-4 py-3 sm:px-5 ${
                isRedFlag
                  ? "border-rose-500/15 bg-rose-500/10"
                  : "border-amber-500/15 bg-amber-500/10"
              }`}
            >
              <span className="text-base" aria-hidden="true">
                {b.icon}
              </span>
              <h4
                className={`text-base font-extrabold leading-snug sm:text-lg ${
                  isRedFlag ? "text-rose-300" : "text-amber-300"
                }`}
              >
                {renderInline(b.label, `${k}-lbl`)}
              </h4>
            </div>
            <div className="p-4 text-gray-200 sm:p-5">
              {renderInline(b.body, `${k}-body`)}
            </div>
          </div>
        );
      }

      case "steps":
        return (
          <ol
            key={k}
            className="space-y-2.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.04] p-3.5 sm:p-4"
          >
            {b.items.map((item, j) => (
              <li
                key={j}
                className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-black/25 p-3.5"
              >
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-black text-emerald-300 ring-1 ring-emerald-500/40">
                  {j + 1}
                </span>
                <span className="min-w-0 flex-1 text-gray-100">
                  {renderInline(item, `${k}-stp-${j}`)}
                </span>
              </li>
            ))}
          </ol>
        );

      case "chat":
        return (
          <div
            key={k}
            className="rounded-2xl rounded-tl-sm border border-amber-500/25 bg-amber-500/[0.07] p-4 sm:p-5"
          >
            <div className="mb-2.5 flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300">
                💬 Chat example
              </span>
              <button
                type="button"
                onClick={() => copyChatText(b.text, idx)}
                aria-live="polite"
                className={GHOST_BTN_CLS}
              >
                {copiedIdx === idx ? "✓ Copy ho gaya" : "📋 Line copy karo"}
              </button>
            </div>
            <p className="font-medium italic text-amber-100">
              {renderInline(b.text, k)}
            </p>
          </div>
        );

      case "callout":
        return (
          <div
            key={k}
            className="rounded-2xl border border-amber-400/25 border-l-4 border-l-amber-400 bg-amber-500/[0.07] p-4 sm:p-5"
          >
            <span className="mr-2 inline-block rounded-md bg-amber-400 px-2 py-0.5 text-sm font-extrabold text-slate-950">
              {b.badge}
            </span>
            <span className="font-medium text-amber-100">
              {renderInline(b.body, k)}
            </span>
          </div>
        );

      case "cta": {
        const { plain, links } = splitCta(b.text);
        return (
          <div
            key={k}
            className="relative my-2 overflow-hidden rounded-3xl border border-amber-500/40 bg-gradient-to-br from-amber-500/15 via-white/[0.03] to-purple-600/10 p-6 text-center shadow-xl ring-1 ring-amber-400/20 sm:p-8"
          >
            <div
              className="pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-amber-500/20 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative">
              {plain && (
                <p className="text-lg font-bold leading-relaxed text-white sm:text-xl">
                  <span aria-hidden="true">👉 </span>
                  {renderInline(plain, `${k}-t`)}
                </p>
              )}
              {links.length > 0 && (
                <div
                  className={`flex flex-wrap items-center justify-center gap-3 ${
                    plain ? "mt-5" : ""
                  }`}
                >
                  {links.map((l, j) =>
                    renderLink(l.label, l.href, `${k}-btn-${j}`, BOOK_BTN_CLS, true)
                  )}
                </div>
              )}
            </div>
          </div>
        );
      }

      case "ul":
        return (
          <ul
            key={k}
            className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
          >
            {b.items.map((item, j) => (
              <li key={j} className="flex items-start gap-3">
                <span className="mt-[0.7em] h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                <span className="min-w-0 flex-1">
                  {renderInline(item, `${k}-${j}`)}
                </span>
              </li>
            ))}
          </ul>
        );

      case "ol":
        return (
          <ol
            key={k}
            start={b.start}
            className="list-decimal space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 pl-9 marker:font-bold marker:text-amber-400 sm:p-5 sm:pl-10"
          >
            {b.items.map((item, j) => (
              <li key={j} className="pl-1">
                {renderInline(item, `${k}-${j}`)}
              </li>
            ))}
          </ol>
        );

      case "quote":
        return (
          <blockquote
            key={k}
            className="rounded-r-2xl border-l-4 border-amber-400 bg-white/[0.04] py-4 pl-5 pr-4 italic text-gray-100"
          >
            {renderInline(b.text, k)}
          </blockquote>
        );

      case "img":
        return (
          <figure
            key={k}
            className="my-2 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] shadow-xl"
          >
            <img
              src={b.src}
              alt={b.alt}
              loading="lazy"
              decoding="async"
              className="h-auto w-full"
            />
            {b.alt && (
              <figcaption className="border-t border-white/5 px-4 py-2.5 text-center text-sm text-gray-400">
                {b.alt}
              </figcaption>
            )}
          </figure>
        );

      case "hr":
        return <hr key={k} className="my-4 border-white/10" />;

      case "p":
      default:
        return (
          <p key={k} className="whitespace-pre-line text-gray-300">
            {renderInline(b.text, k)}
          </p>
        );
    }
  };

  return (
    <div className="mt-6">
      {/* Reader toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2 text-xs font-medium text-gray-300 sm:text-sm">
          <span
            className="h-2 w-2 rounded-full bg-amber-400 motion-safe:animate-pulse"
            aria-hidden="true"
          />
          <span>Reader Mode</span>
        </div>
        <div
          className="flex items-center gap-1.5"
          role="group"
          aria-label="Text size"
        >
          <span className="mr-1 text-xs text-gray-400">Text size</span>
          <button
            type="button"
            onClick={() => setFontSize("normal")}
            aria-pressed={fontSize === "normal"}
            aria-label="Normal text size"
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${FOCUS_CLS} ${
              fontSize === "normal"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            A
          </button>
          <button
            type="button"
            onClick={() => setFontSize("large")}
            aria-pressed={fontSize === "large"}
            aria-label="Large text size"
            className={`rounded-lg px-2.5 py-1 text-sm font-bold transition ${FOCUS_CLS} ${
              fontSize === "large"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "bg-white/5 text-gray-300 hover:bg-white/10"
            }`}
          >
            A+
          </button>
        </div>
      </div>

      {/* Table of contents */}
      {toc.length >= 2 && (
        <nav
          aria-label="Table of contents"
          className="mb-10 rounded-2xl border border-amber-500/25 bg-gradient-to-br from-amber-500/[0.07] to-transparent p-5 shadow-xl sm:p-6"
        >
          <p className="mb-4 flex items-center gap-2.5 text-base font-extrabold text-amber-300">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-sm ring-1 ring-amber-500/40"
              aria-hidden="true"
            >
              📌
            </span>
            Is article ke mukhya raaz
          </p>
          <ol className="grid gap-2.5 sm:grid-cols-2">
            {toc.map((item, idx) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`group flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 px-3.5 py-2.5 text-sm text-gray-200 transition-colors hover:border-amber-500/40 hover:bg-amber-500/10 hover:text-white ${FOCUS_CLS}`}
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-amber-500/15 font-mono text-xs font-bold text-amber-400 transition-colors group-hover:bg-amber-500 group-hover:text-slate-950">
                    {item.num ? item.num.padStart(2, "0") : idx + 1}
                  </span>
                  <span className="line-clamp-1 font-medium">{item.text}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Article body */}
      <div
        className={`flex flex-col gap-6 break-words text-gray-200 ${textSizeCls}`}
      >
        {blocks.map((b, idx) => renderBlock(b, idx))}
      </div>
    </div>
  );
}
