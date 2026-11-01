/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ReactNode } from "react";

/*
  Upgraded Smart Article Renderer (SEO + Auto-Formatting + Modern UI)
  - Standard Markdown: ## heading, ### heading, **bold**, *italic*, `code`, [text](url), ![alt](url)
  - Smart Auto-Detection: Single Enter (\n) par bhi headings (1. ...), Chat Bubbles (💬),
    Bold Labels (नाम: ...), aur Call-To-Action (👉) ko apne aap design kar deta hai.
*/

const A_CLASS =
  "font-medium text-amber-400 underline decoration-amber-400/50 underline-offset-4 transition-colors hover:text-amber-300 hover:decoration-amber-300";

// Heading ke liye SEO-friendly URL slug banane ka function
function createSlug(text: string, fallbackIndex: number): string {
  const clean = text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*`~_]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-");
  return clean || `section-${fallbackIndex}`;
}

// Inline Markdown (**bold**, *italic*, `code`, [link](url), ![img](url)) ko render karne ka error-free function
function renderInline(text: string): ReactNode[] {
  const re =
    /(!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\))|(\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\))|(\*\*([^*]+)\*\*)|(\*([^*\n]+)\*)|(`([^`]+)`)/g;

  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;

  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push(text.slice(last, m.index));
    }
    const key = `inl-${i}`;

    if (m[1]) {
      // Inline Image: ![alt](url)
      out.push(
        <img
          key={key}
          src={m[3]}
          alt={m[2] || "Article image"}
          loading="lazy"
          decoding="async"
          className="my-4 inline-block max-h-96 w-auto rounded-xl border border-white/10 shadow-md"
        />
      );
    } else if (m[4]) {
      // Link: [text](url)
      const isInternal = m[6].startsWith("/");
      out.push(
        isInternal ? (
          <Link key={key} href={m[6]} className={A_CLASS}>
            {m[5]}
          </Link>
        ) : (
          <a
            key={key}
            href={m[6]}
            target="_blank"
            rel="noopener noreferrer"
            className={A_CLASS}
          >
            {m[5]}
          </a>
        )
      );
    } else if (m[7]) {
      // Bold: **text**
      out.push(
        <strong key={key} className="font-semibold text-white">
          {m[8]}
        </strong>
      );
    } else if (m[9]) {
      // Italic: *text*
      out.push(
        <em key={key} className="italic text-amber-200/90">
          {m[10]}
        </em>
      );
    } else if (m[11]) {
      // Inline Code: `code`
      out.push(
        <code
          key={key}
          className="rounded-md bg-white/10 px-1.5 py-0.5 font-mono text-sm text-amber-300"
        >
          {m[12]}
        </code>
      );
    }

    last = m.index + m[0].length;
    i++;
  }

  if (last < text.length) {
    out.push(text.slice(last));
  }

  return out;
}

// Agar line "आम लड़का (रोहन): तुरंत..." jaisi hai, toh ":" se pehle wale hisse ko auto-highlight karega
function renderWithSmartLabel(line: string): ReactNode {
  const labelMatch = line.match(/^([^:\n]{2,42}):\s+(.+)$/);
  if (labelMatch && !labelMatch[1].includes("http")) {
    return (
      <>
        <strong className="font-semibold text-amber-300">
          {renderInline(labelMatch[1])}:
        </strong>{" "}
        {renderInline(labelMatch[2])}
      </>
    );
  }
  return renderInline(line);
}

// Check karta hai ki kya line numbered heading hai (jaise "1. स्टोरी रिप्लाई का जादू...")
function isSmartNumberedHeading(line: string): boolean {
  if (!/^\d+\.\s+\S/.test(line)) return false;
  if (line.length > 95) return false;
  // Agar line normal sentence ki tarah purn-viram (।) par khatam nahi hoti, toh wo heading hai
  return !/[।.]$/.test(line.trim());
}

type ParsedBlock =
  | { type: "h2"; text: string; num?: string; id: string }
  | { type: "h3"; text: string; id: string }
  | { type: "hr" }
  | { type: "img"; alt: string; src: string }
  | { type: "quote"; text: string }
  | { type: "chat"; text: string }
  | { type: "cta"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "labelCard"; label: string; body: string }
  | { type: "p"; text: string };

export default function ArticleContent({ content }: { content: string }) {
  const rawLines = String(content || "")
    .replace(/\r\n/g, "\n")
    .split("\n");

  const parsedBlocks: ParsedBlock[] = [];
  const tocItems: { id: string; title: string }[] = [];

  let i = 0;
  while (i < rawLines.length) {
    const line = rawLines[i].trim();

    if (!line) {
      i++;
      continue;
    }

    // 1. Divider Line (---)
    if (/^---+$/.test(line)) {
      parsedBlocks.push({ type: "hr" });
      i++;
      continue;
    }

    // 2. Standalone Image: ![alt](url)
    const imgMatch = line.match(
      /^!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)$/
    );
    if (imgMatch) {
      parsedBlocks.push({ type: "img", alt: imgMatch[1], src: imgMatch[2] });
      i++;
      continue;
    }

    // 3. Markdown H3 (### Heading)
    if (line.startsWith("### ")) {
      const title = line.slice(4).trim();
      const id = createSlug(title, parsedBlocks.length);
      parsedBlocks.push({ type: "h3", text: title, id });
      i++;
      continue;
    }

    // 4. Markdown H2 (## Heading)
    if (line.startsWith("## ")) {
      const title = line.slice(3).trim();
      const id = createSlug(title, parsedBlocks.length);
      tocItems.push({ id, title: title.replace(/[*`]/g, "") });
      parsedBlocks.push({ type: "h2", text: title, id });
      i++;
      continue;
    }

    // 5. Smart Auto-Heading (jaise "1. स्टोरी रिप्लाई का जादू: रोहन बनाम सिद्धार्थ 📲✨")
    if (isSmartNumberedHeading(line)) {
      const numMatch = line.match(/^(\d+)\.\s+(.*)$/);
      const num = numMatch ? numMatch[1] : undefined;
      const title = numMatch ? numMatch[2].trim() : line;
      const id = createSlug(title, parsedBlocks.length);
      tocItems.push({
        id,
        title: `${num ? num + ". " : ""}${title.replace(/[*`]/g, "")}`,
      });
      parsedBlocks.push({ type: "h2", text: title, num, id });
      i++;
      continue;
    }

    // 6. Chat Bubble / Dialogue Line (💬 se shuru hone wali line)
    if (line.startsWith("💬")) {
      parsedBlocks.push({
        type: "chat",
        text: line.replace(/^💬\s*/, "").trim(),
      });
      i++;
      continue;
    }

    // 7. Call-To-Action Line (👉 se shuru hone wali line)
    if (line.startsWith("👉")) {
      parsedBlocks.push({
        type: "cta",
        text: line.replace(/^👉\s*/, "").trim(),
      });
      i++;
      continue;
    }

    // 8. Blockquote (> quote)
    if (line.startsWith("> ")) {
      const quoteLines: string[] = [];
      while (i < rawLines.length && rawLines[i].trim().startsWith("> ")) {
        quoteLines.push(rawLines[i].trim().slice(2));
        i++;
      }
      parsedBlocks.push({ type: "quote", text: quoteLines.join(" ") });
      continue;
    }

    // 9. Bullet List (- item ya • item)
    if (/^[-•]\s+/.test(line)) {
      const items: string[] = [];
      while (i < rawLines.length && /^[-•]\s+/.test(rawLines[i].trim())) {
        items.push(rawLines[i].trim().replace(/^[-•]\s+/, ""));
        i++;
      }
      parsedBlocks.push({ type: "ul", items });
      continue;
    }

    // 10. Numbered List (agar lagatar 2+ lines numbered list hon aur heading na hon)
    if (/^\d+\.\s+/.test(line) && !isSmartNumberedHeading(line)) {
      const items: string[] = [];
      while (
        i < rawLines.length &&
        /^\d+\.\s+/.test(rawLines[i].trim()) &&
        !isSmartNumberedHeading(rawLines[i].trim())
      ) {
        items.push(rawLines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      parsedBlocks.push({ type: "ol", items });
      continue;
    }

    // 11. Smart Subheading (Choti line jo ! ya 🚀🔥✨ par khatam ho, jaise "अब फैसला आपके हाथ में है! 🚀")
    if (
      line.length < 55 &&
      !/[।.]$/.test(line) &&
      /[!🚀🔥✨💓🎯⚡]$/.test(line)
    ) {
      const id = createSlug(line, parsedBlocks.length);
      parsedBlocks.push({ type: "h3", text: line, id });
      i++;
      continue;
    }

    // 12. Smart Label Highlight Point (jaise "आम लड़का (रोहन): तुरंत..." ya "निकनेम और रोलप्ले: ...")
    const labelMatch = line.match(/^([^:\n]{2,38}):\s+(.+)$/);
    if (
      labelMatch &&
      !labelMatch[1].includes("http") &&
      !labelMatch[1].startsWith("[")
    ) {
      parsedBlocks.push({
        type: "labelCard",
        label: labelMatch[1].trim(),
        body: labelMatch[2].trim(),
      });
      i++;
      continue;
    }

    // 13. Normal Paragraph
    parsedBlocks.push({ type: "p", text: line });
    i++;
  }

  return (
    <article
      itemScope
      itemType="https://schema.org/Article"
      className="mx-auto max-w-none text-base leading-relaxed text-slate-300 sm:text-lg"
    >
      {/* SEO Table of Contents: Agar article mein 2 ya zyada headings hain toh upar Quick Jump Box dikhega */}
      {tocItems.length >= 2 && (
        <nav
          aria-label="Table of Contents"
          className="mb-10 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-amber-950/20 p-5 shadow-lg backdrop-blur-sm sm:p-6"
        >
          <div className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400">
            <span>📌 Is Article Mein Kya Hai</span>
          </div>
          <ol className="space-y-2 text-sm sm:text-base">
            {tocItems.map((item, idx) => (
              <li key={idx}>
                <a
                  href={`#${item.id}`}
                  className="group flex items-start gap-2 text-slate-300 transition-colors hover:text-amber-300"
                >
                  <span className="text-amber-500/70 transition-transform group-hover:translate-x-0.5">
                    →
                  </span>
                  <span className="underline-offset-4 group-hover:underline">
                    {item.title}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Main Article Body */}
      <div itemProp="articleBody" className="space-y-5">
        {parsedBlocks.map((block, idx) => {
          switch (block.type) {
            case "hr":
              return (
                <hr
                  key={idx}
                  className="my-10 border-0 border-t border-white/10"
                />
              );

            case "img":
              return (
                <figure
                  key={idx}
                  className="my-8 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 shadow-xl"
                >
                  <img
                    src={block.src}
                    alt={block.alt || "Article visual"}
                    loading="lazy"
                    decoding="async"
                    className="h-auto w-full object-cover"
                  />
                  {block.alt && (
                    <figcaption className="border-t border-white/5 px-4 py-2.5 text-center text-sm text-slate-400">
                      {block.alt}
                    </figcaption>
                  )}
                </figure>
              );

            case "h2":
              return (
                <h2
                  key={idx}
                  id={block.id}
                  className="group relative mb-4 mt-12 scroll-mt-24 border-b border-white/10 pb-3 text-xl font-extrabold tracking-tight text-white sm:text-2xl"
                >
                  <span className="flex items-center gap-3">
                    {block.num && (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15 text-base font-bold text-amber-400 ring-1 ring-amber-500/30">
                        {block.num}
                      </span>
                    )}
                    <span>{renderInline(block.text)}</span>
                  </span>
                </h2>
              );

            case "h3":
              return (
                <h3
                  key={idx}
                  id={block.id}
                  className="mb-3 mt-9 scroll-mt-24 text-lg font-bold text-amber-300 sm:text-xl"
                >
                  {renderInline(block.text)}
                </h3>
              );

            case "chat":
              return (
                <div
                  key={idx}
                  className="my-5 flex items-start gap-3.5 rounded-2xl rounded-tl-sm border border-amber-500/25 bg-gradient-to-r from-amber-500/10 via-slate-900/80 to-slate-900/40 p-4 shadow-md"
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-base">
                    💬
                  </span>
                  <p className="italic leading-relaxed text-amber-100">
                    {renderInline(block.text)}
                  </p>
                </div>
              );

            case "quote":
              return (
                <blockquote
                  key={idx}
                  className="my-6 rounded-r-2xl border-l-4 border-amber-400 bg-white/[0.03] px-5 py-4 italic leading-relaxed text-slate-200 shadow-sm"
                >
                  {renderInline(block.text)}
                </blockquote>
              );

            case "labelCard":
              return (
                <div
                  key={idx}
                  className="my-3.5 rounded-xl border border-white/10 bg-white/[0.025] p-4 transition-colors hover:border-white/20"
                >
                  <span className="mr-2 inline-block font-bold text-amber-400">
                    ✦ {renderInline(block.label)}:
                  </span>
                  <span className="text-slate-200">
                    {renderInline(block.body)}
                  </span>
                </div>
              );

            case "cta":
              return (
                <div
                  key={idx}
                  className="my-8 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 p-5 text-center shadow-lg ring-1 ring-amber-500/20"
                >
                  <p className="text-base font-semibold text-white sm:text-lg">
                    👉 {renderInline(block.text)}
                  </p>
                </div>
              );

            case "ul":
              return (
                <ul
                  key={idx}
                  className="my-5 space-y-2.5 pl-2 text-slate-300"
                >
                  {block.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                      <span>{renderWithSmartLabel(item)}</span>
                    </li>
                  ))}
                </ul>
              );

            case "ol":
              return (
                <ol
                  key={idx}
                  className="my-5 list-decimal space-y-2.5 pl-6 text-slate-300 marker:font-bold marker:text-amber-400"
                >
                  {block.items.map((item, j) => (
                    <li key={j} className="pl-1">
                      {renderWithSmartLabel(item)}
                    </li>
                  ))}
                </ol>
              );

            case "p":
            default:
              return (
                <p
                  key={idx}
                  className="leading-8 tracking-wide text-slate-300"
                >
                  {renderWithSmartLabel(block.text)}
                </p>
              );
          }
        })}
      </div>
    </article>
  );
}
