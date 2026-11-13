// @ts-nocheck
/* eslint-disable */
// Place at: src/components/admin/BlogManager.tsx
"use client";
import { useState, useEffect, useMemo, useRef, useCallback, useDeferredValue } from "react";

/* =====================================================================
   VEDOXA — Blog Manager (Pro + Auto SEO Slug & Book Link Sync)
   Props: supabase, addNotification (optional), books = []
   Images: Supabase Storage bucket "blog-images" (pehle 11-blog-images.sql chalao)
   ===================================================================== */

// Sitemap.ts wale SITE_URL ke saath same rakho
const SITE_URL = "https://vedoxa.shop";
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const PAGE_SIZE = 12;
const BACKUP_PREFIX = "vedoxa_blog_backup_";
const VIEW_KEY = "vedoxa_blog_view";

/* Images. Pehle 11-blog-images.sql Supabase SQL editor me chalao (bucket + columns).
   FIX: SEO ke liye category aur tags ko true kar diya gaya hai (safe DB fallback ke saath). */
const BUCKET = "blog-images";
const IMG_FOLDER = "posts";
const MAX_IMG_MB = 5;
const FEATURES = { category: true, tags: true, cover_image: true };

const pad = (n) => String(n).padStart(2, "0");

/* ------------------------------ Hindi to Roman & Slug helpers ------------------------------ */
const HINDI_MAP = {
  अ: "a", आ: "aa", इ: "i", ई: "ee", उ: "u", ऊ: "oo", ऋ: "ri", ए: "e", ऐ: "ai", ओ: "o", औ: "au", अं: "an", अः: "ah",
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "n",
  च: "ch", छ: "chh", ज: "j", झ: "jh", ञ: "n",
  ट: "t", ठ: "th", ड: "d", ढ: "dh", ण: "n",
  त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m",
  य: "y", र: "r", ल: "l", व: "v", श: "sh", ष: "sh", स: "s", ह: "h",
  क्ष: "ksh", त्र: "tr", ज्ञ: "gya", श्र: "shr",
  ड़: "d", ढ़: "dh", क़: "q", ख़: "kh", ग़: "gh", ज़: "z", फ़: "f",
  "ा": "a", "ि": "i", "ी": "ee", "ु": "u", "ू": "oo", "ृ": "ri", "े": "e", "ै": "ai", "ो": "o", "ौ": "au",
  "ं": "n", "ँ": "n", "ः": "h", "्": "", "़": "",
  "०": "0", "१": "1", "२": "2", "३": "3", "४": "4", "५": "5", "६": "6", "७": "7", "८": "8", "९": "9",
};

function transliterateToRoman(input) {
  const str = String(input || "");
  if (!/[\u0900-\u097F]/.test(str)) return str;
  let out = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    const next = str[i + 1] || "";
    if (HINDI_MAP[ch + next] !== undefined) {
      out += HINDI_MAP[ch + next];
      i++;
      continue;
    }
    if (HINDI_MAP[ch] !== undefined) {
      const val = HINDI_MAP[ch];
      const isConsonant = ch >= "क" && ch <= "ह";
      const nextIsVowelSign = next >= "ा" && next <= "्";
      const nextIsSpaceOrEnd = !next || /[\s.,!?:;'"()\-–—/]/.test(next);
      if (isConsonant && !nextIsVowelSign && !nextIsSpaceOrEnd) {
        out += val + "a";
      } else {
        out += val;
      }
    } else {
      out += ch;
    }
  }
  return out;
}

function slugify(text) {
  const roman = transliterateToRoman(text);
  return String(roman || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    .replace(/-+$/, "");
}

// Check karta hai ki book/post ka slug kahin 'book-2dbcc52d' jaisa random ID toh nahi hai
function isRandomId(val) {
  if (!val) return true;
  const v = String(val).trim();
  return /^(book|post|article)-[a-f0-9]{6,}$/i.test(v) || /^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(v);
}

// Book ke link ke liye hamesha Book ka clean naam (slug) deta hai, random ID nahi
function getBookSlug(b) {
  if (!b) return "";
  const raw = b.slug ? String(b.slug).trim() : "";
  if (raw && !isRandomId(raw) && SLUG_RE.test(raw)) return raw;
  const fromTitle = slugify(b.title);
  if (fromTitle) return fromTitle;
  return raw || String(b.id || "");
}

function toLocalInput(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// now (ms) pass karte hain taaki scheduled article apne aap "live" ban jaye
function statusOf(p, now = Date.now()) {
  if (!p.published) return "draft";
  return new Date(p.published_at).getTime() > now ? "scheduled" : "published";
}

function countWords(t) {
  return String(t || "").trim().split(/\s+/).filter(Boolean).length;
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    return "";
  }
}

function relTime(iso, now) {
  const t = new Date(iso).getTime();
  if (!t) return "";
  const diff = t - now;
  const abs = Math.abs(diff);
  const m = Math.round(abs / 60000);
  if (m < 1) return "abhi";
  const h = Math.round(abs / 3600000);
  const d = Math.round(abs / 86400000);
  const txt = m < 60 ? `${m} min` : h < 24 ? `${h} ghante` : `${d} din`;
  return diff > 0 ? `${txt} me` : `${txt} pehle`;
}

function stripMd(t) {
  return String(t || "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,3}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^(-|\d+\.)\s+/gm, "")
    .replace(/^---+$/gm, "")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function autoDescription(content) {
  const s = stripMd(content);
  if (s.length <= 155) return s;
  const cut = s.slice(0, 155);
  const sp = cut.lastIndexOf(" ");
  return cut.slice(0, sp > 100 ? sp : 155).trim() + "…";
}

const countOcc = (hay, needle) => (needle ? hay.split(needle).length - 1 : 0);

function seoChecks({ title = "", description = "", content = "", slug = "", focus = "", cover = "" }) {
  const t = title.trim();
  const d = description.trim();
  const w = countWords(content);
  const list = [
    { ok: t.length >= 25 && t.length <= 70, text: `Title ${t.length} akshar (25-70 theek)` },
    { ok: d.length >= 120 && d.length <= 160, text: `Description ${d.length} akshar (120-160 theek)` },
    { ok: w >= 600, text: `${w} shabd (600+ achha)` },
    { ok: /(^|\n)## /.test(content), text: "Kam se kam ek ## heading" },
    { ok: content.includes("/book/"), text: "Kam se kam ek book ka link" },
    { ok: SLUG_RE.test(slug) && slug.length <= 60, text: "Slug chhota aur sahi (a-z, 0-9, -)" },
  ];
  if (FEATURES.cover_image) list.push({ ok: !!String(cover || "").trim(), text: "Cover image lagi hai" });
  const imgs = content.match(/!\[[^\]]*\]\([^)\s]+\)/g) || [];
  if (imgs.length) list.push({ ok: imgs.every((x) => !/^!\[\s*\]/.test(x)), text: "Article ki sabhi images me alt text hai" });
  const kw = focus.trim().toLowerCase();
  if (kw) {
    const low = content.toLowerCase();
    const density = w ? ((countOcc(low, kw) * kw.split(/\s+/).length) / w) * 100 : 0;
    list.push(
      { ok: t.toLowerCase().includes(kw), text: "Focus keyword title me hai", kw: true },
      { ok: d.toLowerCase().includes(kw), text: "Focus keyword description me hai", kw: true },
      { ok: slug.includes(slugify(kw)), text: "Focus keyword slug me hai", kw: true },
      { ok: low.slice(0, 600).includes(kw), text: "Focus keyword pehle paragraph me hai", kw: true },
      { ok: density >= 0.5 && density <= 3, text: `Keyword density ${density.toFixed(1)}% (0.5-3% theek)`, kw: true }
    );
  }
  return list;
}

const lsGet = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const lsDel = (k) => { try { localStorage.removeItem(k); } catch (e) {} };

function download(name, text, mime = "text/plain") {
  try {
    const blob = new Blob([text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  } catch (e) {}
}

// Image ko upload se pehle chhota karo (max 1600px, WebP) -> site fast rahegi
async function compressImage(file, maxW = 1600, quality = 0.82) {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file; // gif / avif jaisi files waise hi
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxW / bmp.width);
    const w = Math.max(1, Math.round(bmp.width * scale));
    const h = Math.max(1, Math.round(bmp.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
    const blob = await new Promise((res) => canvas.toBlob(res, "image/webp", quality));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch (e) {
    return file;
  }
}

const toMarkdown = (p) =>
  `---\ntitle: ${JSON.stringify(p.title || "")}\nslug: ${p.slug || ""}\ndescription: ${JSON.stringify(p.description || "")}\n${p.cover_image ? `cover: ${p.cover_image}\n` : ""}---\n\n${p.content || ""}\n`;

const EMPTY = { title: "", slug: "", description: "", content: "", publishAt: "", category: "", tags: "", cover: "" };
const snapOf = (f) => JSON.stringify([f.title, f.slug, f.description, f.content, f.publishAt, f.category, f.tags, f.cover]);

/* ------------------------------ templates ------------------------------ */
const TEMPLATES = [
  { id: "blank", icon: "📄", name: "Khali article", hint: "Zero se shuru", content: "" },
  {
    id: "howto", icon: "🧭", name: "How-to guide", hint: "Step-by-step guide",
    content: "Is article me aap seekhoge ki ... kaise karein, aur kin galtiyon se bachna hai.\n\n## Pehle ye jaan lo\n\nYahan background likho.\n\n## Step 1: Shuruaat\n\nPehla step samjhao.\n\n## Step 2: Agla kadam\n\nDusra step samjhao.\n\n## Aam galtiyan\n\n- Galti 1\n- Galti 2\n- Galti 3\n\n## Nishkarsh\n\nChhota summary aur ek achhi book ka link yahan jodo.",
  },
  {
    id: "list", icon: "🔢", name: "Top 5 list", hint: "Listicle article",
    content: "Chhota intro: ye list kyun zaroori hai.\n\n## 1. Pehla point\n\nSamjhao.\n\n## 2. Doosra point\n\nSamjhao.\n\n## 3. Teesra point\n\nSamjhao.\n\n## 4. Chautha point\n\nSamjhao.\n\n## 5. Paanchva point\n\nSamjhao.\n\n## Aakhri baat\n\nSabse zaroori seekh ek line me.",
  },
  {
    id: "review", icon: "📚", name: "Book review", hint: "Kitaab ka review",
    content: "Ek line me: ye kitaab kis ke liye hai.\n\n## Kitaab ke baare me\n\nLekhak, vishay, kya khaas hai.\n\n## Mujhe kya pasand aaya\n\n- Achhi baat 1\n- Achhi baat 2\n\n## Kya kam laga\n\n- Kami 1\n\n## Kise padhna chahiye\n\nSahi reader kaun hai.\n\n## Verdict\n\nRating aur final raay.",
  },
];

const TOOLS = [
  { label: "H2", title: "Bada heading", a: ["\n\n## ", "\n\n", "Bada heading"] },
  { label: "H3", title: "Chhota heading", a: ["\n\n### ", "\n\n", "Chhota heading"] },
  { label: "B", title: "Bold (Ctrl+B)", a: ["**", "**", "bold text"], cls: "font-black" },
  { label: "I", title: "Italic (Ctrl+I)", a: ["*", "*", "italic text"], cls: "italic" },
  { label: "• List", title: "Bullet list", a: ["\n\n- ", "\n- Point 2\n\n", "Point 1"] },
  { label: "1. List", title: "Numbered list", a: ["\n\n1. ", "\n2. Point 2\n\n", "Point 1"] },
  { label: "❝ Quote", title: "Quote", a: ["\n\n> ", "\n\n", "Koi achhi line"] },
  { label: "― Line", title: "Divider", a: ["\n\n---\n\n", "", ""] },
  { label: "🔗 Link", title: "Link (Ctrl+K)", a: ["[", "](https://)", "link ka text"] },
];

/* ------------------------------ preview renderer ------------------------------ */
function renderInline(text) {
  const re = /(\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\))|(\*\*([^*]+)\*\*)|(\*([^*\n]+)\*)|(`([^`]+)`)|(!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\))/g;
  const out = [];
  let last = 0;
  let i = 0;
  let m;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1]) {
      const external = m[3].startsWith("http");
      out.push(
        <a key={"k" + i} href={m[3]} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="text-amber-400 underline underline-offset-4 hover:text-amber-300">
          {m[2]}
        </a>
      );
    } else if (m[4]) out.push(<strong key={"k" + i} className="font-bold text-white">{m[5]}</strong>);
    else if (m[6]) out.push(<em key={"k" + i}>{m[7]}</em>);
    else if (m[10]) out.push(<img key={"k" + i} src={m[12]} alt={m[11]} loading="lazy" className="my-2 inline-block max-w-full rounded-lg" />);
    else out.push(<code key={"k" + i} className="rounded bg-slate-800 px-1.5 py-0.5 text-[0.85em] text-pink-300">{m[9]}</code>);
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderPreview(content) {
  const blocks = String(content || "").replace(/\r\n/g, "\n").split(/\n{2,}/);
  return blocks.map((block, idx) => {
    const text = block.trim();
    if (!text) return null;
    const img = text.match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)$/);
    if (img)
      return (
        <figure key={idx} className="my-6">
          <img src={img[2]} alt={img[1]} loading="lazy" className="w-full rounded-xl border border-indigo-500/20" />
          {img[1] && <figcaption className="mt-2 text-center text-xs text-slate-500">{img[1]}</figcaption>}
        </figure>
      );
    if (/^---+$/.test(text)) return <hr key={idx} className="my-8 border-indigo-500/30" />;
    if (text.startsWith("### ")) return <h3 key={idx} className="text-lg font-bold text-white mt-6 mb-2">{renderInline(text.slice(4))}</h3>;
    if (text.startsWith("## ")) return <h2 key={idx} className="text-xl font-bold text-white mt-8 mb-3">{renderInline(text.slice(3))}</h2>;
    const lines = text.split("\n");
    if (lines.every((l) => l.trim().startsWith("> ")))
      return <blockquote key={idx} className="my-4 border-l-4 border-amber-400/60 pl-4 italic text-slate-300">{renderInline(lines.map((l) => l.trim().slice(2)).join(" "))}</blockquote>;
    if (lines.every((l) => l.trim().startsWith("- ")))
      return (
        <ul key={idx} className="list-disc pl-6 my-4 space-y-1 text-slate-300">
          {lines.map((l, j) => <li key={j}>{renderInline(l.trim().slice(2))}</li>)}
        </ul>
      );
    if (lines.every((l) => /^\d+\.\s/.test(l.trim())))
      return (
        <ol key={idx} className="list-decimal pl-6 my-4 space-y-1 text-slate-300">
          {lines.map((l, j) => <li key={j}>{renderInline(l.trim().replace(/^\d+\.\s/, ""))}</li>)}
        </ol>
      );
    return <p key={idx} className="my-4 leading-8 text-slate-300 whitespace-pre-line">{renderInline(lines.join("\n"))}</p>;
  });
}

/* ------------------------------ styles & small components ------------------------------ */
const CSS = `
@keyframes bm-up{from{opacity:0;transform:translateY(14px) scale(.985)}to{opacity:1;transform:none}}
@keyframes bm-fade{from{opacity:0}to{opacity:1}}
@keyframes bm-pop{from{opacity:0;transform:translateY(26px) scale(.96)}to{opacity:1;transform:none}}
@keyframes bm-toast{from{opacity:0;transform:translateX(44px) scale(.95)}to{opacity:1;transform:none}}
@keyframes bm-shimmer{0%{background-position:-600px 0}100%{background-position:600px 0}}
@keyframes bm-float{0%,100%{transform:translate(0,0)}50%{transform:translate(22px,-16px)}}
@keyframes bm-glow{0%,100%{box-shadow:0 0 0 0 rgba(74,222,128,.55)}50%{box-shadow:0 0 0 6px rgba(74,222,128,0)}}
@keyframes bm-grad{0%{background-position:0% 50%}100%{background-position:200% 50%}}
@keyframes bm-spin{to{transform:rotate(360deg)}}
.bm-up{animation:bm-up .45s cubic-bezier(.22,1,.36,1) both}
.bm-fade{animation:bm-fade .25s ease both}
.bm-pop{animation:bm-pop .38s cubic-bezier(.22,1,.36,1) both}
.bm-toast{animation:bm-toast .35s cubic-bezier(.22,1,.36,1) both}
.bm-float{animation:bm-float 9s ease-in-out infinite}
.bm-live{animation:bm-glow 2s ease-in-out infinite}
.bm-grad-text{background-size:200% auto;animation:bm-grad 6s linear infinite}
.bm-spin{animation:bm-spin .8s linear infinite}
.bm-skel{background:linear-gradient(90deg,rgba(51,65,85,.4) 25%,rgba(99,102,241,.22) 40%,rgba(51,65,85,.4) 60%);background-size:1200px 100%;animation:bm-shimmer 1.5s linear infinite}
.bm-card{transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease,background-color .25s ease}
.bm-card:hover{transform:translateY(-2px);box-shadow:0 14px 40px -14px rgba(99,102,241,.5)}
.bm-btn{transition:transform .15s ease,background-color .2s ease,opacity .2s ease,box-shadow .2s ease,border-color .2s ease}
.bm-btn:hover:not(:disabled){transform:translateY(-1px)}
.bm-btn:active:not(:disabled){transform:scale(.95)}
.bm-scroll::-webkit-scrollbar{width:8px;height:8px}
.bm-scroll::-webkit-scrollbar-thumb{background:rgba(99,102,241,.35);border-radius:8px}
.bm-root :focus-visible{outline:2px solid rgba(96,165,250,.8);outline-offset:2px}
@media (prefers-reduced-motion:reduce){.bm-root *,.bm-root{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}}
`;

const STATUS_STYLE = {
  published: "bg-green-500/15 text-green-300 border-green-500/40",
  scheduled: "bg-blue-500/15 text-blue-300 border-blue-500/40",
  draft: "bg-slate-600/30 text-slate-300 border-slate-500/40",
};
const STATUS_LABEL = { published: "LIVE", scheduled: "SCHEDULED", draft: "DRAFT" };
const ACCENT = { published: "bg-green-400", scheduled: "bg-blue-400", draft: "bg-slate-500" };
const TOGGLE_LABEL = { published: "⏸️ Draft me", scheduled: "⚡ Abhi live", draft: "🚀 Live karo" };
const TOAST_STYLE = {
  success: "bg-green-900/80 border-green-500/50 text-green-100",
  error: "bg-red-900/80 border-red-500/50 text-red-100",
  info: "bg-slate-800/90 border-indigo-500/50 text-slate-100",
};

function useCountUp(value, ms = 700) {
  const [v, setV] = useState(0);
  const from = useRef(0);
  useEffect(() => {
    const a = from.current;
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      setV(Math.round(a + (value - a) * e));
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return v;
}

function Num({ value }) {
  const v = useCountUp(value);
  return <>{v}</>;
}

function StatusBadge({ st }) {
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${STATUS_STYLE[st]}`}>
      <span className={`h-1.5 w-1.5 rounded-full bg-current ${st === "published" ? "bm-live" : ""}`} />
      {STATUS_LABEL[st]}
    </span>
  );
}

function Ring({ value, total }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  const pct = total ? value / total : 0;
  const color = pct >= 0.85 ? "#4ade80" : pct >= 0.5 ? "#fbbf24" : "#f87171";
  return (
    <div className="relative h-[72px] w-[72px] shrink-0">
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="rgba(100,116,139,.25)" strokeWidth="6" />
        <circle
          cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - pct)}
          style={{ transition: "stroke-dashoffset .8s cubic-bezier(.22,1,.36,1), stroke .4s" }}
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-black text-white">{value}/{total}</span>
    </div>
  );
}

function SkeletonCard({ i }) {
  return (
    <div className="bm-up rounded-2xl border border-indigo-500/10 bg-slate-900/60 p-5 space-y-3" style={{ animationDelay: `${i * 70}ms` }}>
      <div className="bm-skel h-4 w-24 rounded" />
      <div className="bm-skel h-6 w-2/3 rounded" />
      <div className="bm-skel h-3 w-1/3 rounded" />
      <div className="flex gap-2 pt-2">
        <div className="bm-skel h-8 w-20 rounded-lg" />
        <div className="bm-skel h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

function IconBtn({ title, onClick, danger, className = "", children, href }) {
  const cls = `bm-btn h-9 min-w-[2.25rem] px-2 grid place-items-center rounded-lg text-sm text-white ${danger ? "bg-red-600/70 hover:bg-red-500" : "bg-slate-700 hover:bg-slate-600"} ${className}`;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer" title={title} aria-label={title} className={cls}>{children}</a>;
  return <button type="button" title={title} aria-label={title} onClick={onClick} className={cls}>{children}</button>;
}

function ImageModal({ target, supabase, uploadImage, onPick, onClose, notify, ask }) {
  const isCover = target === "cover";
  const [tab, setTab] = useState("upload");
  const [alt, setAlt] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [items, setItems] = useState([]);
  const [libLoading, setLibLoading] = useState(false);
  const [libErr, setLibErr] = useState("");
  const [more, setMore] = useState(false);
  const fileRef = useRef(null);
  const inputCls = "w-full bg-slate-800/80 border border-indigo-500/30 focus:border-blue-400 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 outline-none transition";
  const validUrl = /^https?:\/\//i.test(url.trim());

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const pub = (name) => supabase.storage.from(BUCKET).getPublicUrl(`${IMG_FOLDER}/${name}`).data.publicUrl;

  const loadLib = async (reset = true) => {
    setLibLoading(true);
    setLibErr("");
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list(IMG_FOLDER, {
        limit: 36,
        offset: reset ? 0 : items.length,
        sortBy: { column: "created_at", order: "desc" },
      });
      if (error) throw error;
      const rows = (data || [])
        .filter((f) => f.name && !f.name.startsWith("."))
        .map((f) => ({ name: f.name, url: pub(f.name) }));
      setItems(reset ? rows : [...items, ...rows]);
      setMore((data || []).length >= 36);
    } catch (e) {
      setLibErr((e && e.message) || "Library load nahi hui");
    }
    setLibLoading(false);
  };
  useEffect(() => { if (tab === "library") loadLib(true); }, [tab]);

  const handleFiles = async (list) => {
    const files = Array.from(list || []).filter((f) => f.type && f.type.startsWith("image/"));
    if (!files.length) return notify("Sirf image file chuno (jpg, png, webp, gif)", "error");
    setBusy(true);
    const urls = [];
    for (const f of isCover ? files.slice(0, 1) : files) {
      try { urls.push(await uploadImage(f)); } catch (e) { notify(`${f.name}: ${e.message}`, "error"); }
    }
    setBusy(false);
    if (urls.length) onPick(urls, alt.trim());
  };

  const copyUrl = async (u) => {
    try { await navigator.clipboard.writeText(u); notify("Image link copy ho gaya ✅", "success"); }
    catch (e) { notify("Copy nahi hua", "error"); }
  };

  const removeItem = async (it) => {
    const ok = await ask({
      title: "Image delete karein?",
      message: "Agar ye kisi article me lagi hai to wahan toot jayegi.",
      confirmText: "Haan, delete karo",
      cancelText: "Rehne do",
      danger: true,
    });
    if (!ok) return;
    const { error } = await supabase.storage.from(BUCKET).remove([`${IMG_FOLDER}/${it.name}`]);
    if (error) return notify("Delete nahi hui: " + error.message, "error");
    setItems((a) => a.filter((x) => x.name !== it.name));
    notify("Image delete ho gayi 🗑️", "success");
  };

  return (
    <div className="bm-fade fixed inset-0 z-[60] flex items-end justify-center bg-slate-950/85 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="bm-pop bm-scroll max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-indigo-500/40 bg-slate-900 p-5 shadow-2xl sm:rounded-3xl sm:p-6"
      >
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-black text-white">{isCover ? "🖼️ Cover image chuno" : "🖼️ Article me image daalo"}</h4>
          <button onClick={onClose} aria-label="Band karo" className="bm-btn h-9 w-9 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700">✕</button>
        </div>

        <div className="flex rounded-xl border border-indigo-500/30 bg-slate-800/60 p-1">
          {[["upload", "⬆️ Upload"], ["library", "🗂️ Library"], ["url", "🔗 URL"]].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={`bm-btn flex-1 rounded-lg px-3 py-2 text-xs font-bold ${tab === k ? "bg-indigo-500/40 text-white" : "text-slate-400 hover:text-white"}`}>{l}</button>
          ))}
        </div>

        {!isCover && (
          <input value={alt} onChange={(e) => setAlt(e.target.value)} className={inputCls + " mt-4"} placeholder="Alt text / caption (SEO ke liye, optional)" />
        )}

        {tab === "upload" && (
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
            onClick={() => { if (!busy && fileRef.current) fileRef.current.click(); }}
            className={`mt-4 grid min-h-[12rem] cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-6 text-center transition ${drag ? "border-blue-400 bg-blue-500/10" : "border-indigo-500/40 bg-slate-800/40 hover:border-blue-400/70"}`}
          >
            {busy ? (
              <div className="space-y-3">
                <div className="bm-skel mx-auto h-16 w-24 rounded-xl" />
                <p className="text-sm font-bold text-indigo-200">Compress + upload ho raha hai...</p>
              </div>
            ) : (
              <div>
                <div className="text-4xl">📤</div>
                <p className="mt-2 text-sm font-bold text-white">Image yahan kheencho ya tap karo</p>
                <p className="mt-1 text-xs text-slate-400">JPG, PNG, WebP, GIF • max {MAX_IMG_MB}MB • auto WebP compress{!isCover ? " • ek saath kai images" : ""}</p>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple={!isCover}
              className="hidden"
              onChange={(e) => { handleFiles(e.target.files); e.target.value = ""; }}
            />
          </div>
        )}

        {tab === "library" && (
          <div className="mt-4">
            {libErr && (
              <p className="break-words rounded-xl border border-red-500/40 bg-red-900/30 p-3 text-xs text-red-200">
                {libErr} — 11-blog-images.sql chali hai aur aap admin ho?
              </p>
            )}
            {!libErr && libLoading && items.length === 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <div key={i} className="bm-skel aspect-square rounded-xl" />)}
              </div>
            )}
            {!libErr && !libLoading && items.length === 0 && (
              <p className="py-10 text-center text-sm text-slate-400">Abhi koi image upload nahi hui. Upload tab se shuru karo.</p>
            )}
            {items.length > 0 && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {items.map((it, i) => (
                  <div key={it.name} style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }} className="bm-up group relative aspect-square overflow-hidden rounded-xl border border-indigo-500/20 bg-slate-800">
                    <button type="button" onClick={() => onPick([it.url], alt.trim())} title={it.name} className="h-full w-full">
                      <img src={it.url} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-110" />
                    </button>
                    <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-gradient-to-t from-slate-950/90 to-transparent p-1.5 sm:opacity-0 sm:transition sm:group-hover:opacity-100">
                      <button type="button" onClick={() => copyUrl(it.url)} aria-label="Link copy" className="h-7 w-7 rounded-md bg-slate-800/90 text-xs">🔗</button>
                      <button type="button" onClick={() => removeItem(it)} aria-label="Delete" className="h-7 w-7 rounded-md bg-red-600/80 text-xs">🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {more && (
              <div className="mt-3 flex justify-center">
                <button onClick={() => loadLib(false)} disabled={libLoading} className="bm-btn rounded-xl border border-indigo-500/30 bg-slate-800 px-5 py-2.5 text-sm font-bold text-indigo-200 disabled:opacity-50">
                  {libLoading ? "Load ho raha hai..." : "Aur dikhao"}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "url" && (
          <div className="mt-4 space-y-3">
            <input value={url} onChange={(e) => setUrl(e.target.value)} className={inputCls} placeholder="https://example.com/image.jpg" />
            {validUrl && <img key={url} src={url.trim()} alt="" className="max-h-48 w-full rounded-xl border border-indigo-500/20 object-cover" />}
            <button
              onClick={() => (validUrl ? onPick([url.trim()], alt.trim()) : notify("Sahi image URL daalo (https://...)", "error"))}
              className="bm-btn w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-500"
            >
              Is URL ko lagao
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmModal({ dialog, onClose }) {
  useEffect(() => {
    if (!dialog) return;
    const h = (e) => { if (e.key === "Escape") onClose(false); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [dialog]);
  if (!dialog) return null;
  return (
    <div className="bm-fade fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm" onClick={() => onClose(false)}>
      <div role="alertdialog" aria-modal="true" className="bm-pop w-full max-w-md rounded-2xl border border-indigo-500/30 bg-slate-900 p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="text-3xl mb-2">{dialog.danger ? "⚠️" : "💬"}</div>
        <h4 className="text-lg font-black text-white">{dialog.title}</h4>
        <p className="text-sm text-slate-400 mt-2 break-words">{dialog.message}</p>
        <div className="flex gap-3 mt-6">
          <button autoFocus onClick={() => onClose(false)} className="bm-btn flex-1 rounded-xl bg-slate-700 hover:bg-slate-600 py-3 text-sm font-bold text-white">{dialog.cancelText || "Rehne do"}</button>
          <button onClick={() => onClose(true)} className={`bm-btn flex-1 rounded-xl py-3 text-sm font-bold text-white ${dialog.danger ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"}`}>{dialog.confirmText || "Haan"}</button>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================
   MAIN
   ==================================================================== */
export default function BlogManager({ supabase, addNotification, books = [] }) {
  /* ---------- notifications (parent ka addNotification, nahi ho to apna toast) ---------- */
  const [toasts, setToasts] = useState([]);
  const notify = useCallback(
    (m, t = "info") => {
      if (addNotification) {
        try { addNotification(m, t); return; } catch (e) {}
      }
      const id = Date.now() + Math.random();
      setToasts((a) => [...a.slice(-3), { id, m, t }]);
      setTimeout(() => setToasts((a) => a.filter((x) => x.id !== id)), 3600);
    },
    [addNotification]
  );

  /* ---------- data ---------- */
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  /* ---------- list UI ---------- */
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("list");
  const [onlyAttn, setOnlyAttn] = useState(false);
  const [selected, setSelected] = useState([]);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [tplOpen, setTplOpen] = useState(false);
  const [dialog, setDialog] = useState(null);
  const dialogRef = useRef(null);
  const searchRef = useRef(null);

  /* ---------- editor ---------- */
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [cover, setCover] = useState("");
  const [focusKw, setFocusKw] = useState("");
  const [mode, setMode] = useState("write"); // write | preview | split
  const [saving, setSaving] = useState(false);
  const [bookPick, setBookPick] = useState("");
  const [backup, setBackup] = useState(null);
  const [savedAt, setSavedAt] = useState(0);
  const [imgModal, setImgModal] = useState(null); // null | "content" | "cover"
  const [dragOver, setDragOver] = useState(false);
  const [upBusy, setUpBusy] = useState(false);
  const taRef = useRef(null);
  const baseRef = useRef(snapOf(EMPTY));
  const syncedBooksRef = useRef(false);

  /* ---------- confirm dialog (promise based) ---------- */
  const ask = (opts) => new Promise((resolve) => { dialogRef.current = resolve; setDialog(opts); });
  const closeDialog = (val) => {
    const r = dialogRef.current;
    dialogRef.current = null;
    setDialog(null);
    if (r) r(val);
  };

  /* ---------- load ---------- */
  const loadPosts = useCallback(async (silent = false) => {
    if (silent) setRefreshing(true);
    else setLoading(true);
    try {
      const { data, error } = await supabase.from("posts").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      setPosts(data || []);
      setLoadError("");

      // NEW: Agar kisi purane blog ka slug khali hai ya random ID hai, toh uske title se auto-save karein
      if (data && data.length > 0) {
        for (const p of data) {
          if (p.title && (!p.slug || isRandomId(p.slug))) {
            const autoSlug = slugify(p.title);
            if (autoSlug && SLUG_RE.test(autoSlug)) {
              supabase.from("posts").update({ slug: autoSlug }).eq("id", p.id).then(() => {});
            }
          }
        }
      }
    } catch (e) {
      setLoadError((e && e.message) || "Posts load nahi hue");
      if (!silent) setPosts([]);
    }
    setLoading(false);
    setRefreshing(false);
  }, [supabase]);

  useEffect(() => { loadPosts(); }, []);

  // NEW: Jin books me slug khali hai ya 'book-2dbcc52d' jaisa random ID hai, unka naam apne aap DB me save karega
  useEffect(() => {
    if (!supabase || !books || !books.length || syncedBooksRef.current) return;
    syncedBooksRef.current = true;
    (async () => {
      for (const b of books) {
        if (!b || !b.id || !b.title) continue;
        const currentSlug = b.slug ? String(b.slug).trim() : "";
        if (!currentSlug || isRandomId(currentSlug)) {
          const cleanBookSlug = slugify(b.title);
          if (cleanBookSlug && SLUG_RE.test(cleanBookSlug) && cleanBookSlug !== currentSlug) {
            try {
              await supabase.from("books").update({ slug: cleanBookSlug }).eq("id", b.id);
              b.slug = cleanBookSlug;
            } catch (err) {
              // Ignore if column/permission issue
            }
          }
        }
      }
    })();
  }, [supabase, books]);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => { const v = lsGet(VIEW_KEY); if (v === "grid" || v === "list") setView(v); }, []);
  useEffect(() => { setLimit(PAGE_SIZE); }, [filter, deferredSearch, sort, onlyAttn]);
  useEffect(() => { setSelected((s) => s.filter((id) => posts.some((p) => p.id === id))); }, [posts]);

  // "/" dabao to search me cursor
  useEffect(() => {
    const h = (e) => {
      if (editorOpen || dialog || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target && e.target.tagName) || "";
      if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
      if (e.key === "/") { e.preventDefault(); if (searchRef.current) searchRef.current.focus(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [editorOpen, dialog]);

  /* ---------- derived ---------- */
  const meta = useMemo(() => {
    const m = {};
    posts.forEach((p) => {
      const c = seoChecks({ title: p.title, description: p.description, content: p.content, slug: p.slug, cover: p.cover_image });
      m[p.id] = { words: countWords(p.content), score: c.filter((x) => x.ok).length, total: c.length };
    });
    return m;
  }, [posts]);

  const needsWork = (p) => !p.description || (meta[p.id] && meta[p.id].score < 4);

  const counts = useMemo(() => {
    const c = { all: posts.length, published: 0, scheduled: 0, draft: 0 };
    posts.forEach((p) => { c[statusOf(p, now)]++; });
    return c;
  }, [posts, now]);

  const insights = useMemo(() => {
    const d = new Date(now);
    let words = 0, scoreSum = 0, attn = 0, month = 0;
    posts.forEach((p) => {
      const mt = meta[p.id] || { words: 0, score: 0, total: 6 };
      words += mt.words;
      scoreSum += mt.total ? mt.score / mt.total : 0;
      if (!p.description || mt.score < 4) attn++;
      if (statusOf(p, now) === "published") {
        const pd = new Date(p.published_at);
        if (pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear()) month++;
      }
    });
    return { words, avg: posts.length ? Math.round((scoreSum / posts.length) * 100) : 0, attn, month };
  }, [posts, meta, now]);

  const visible = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
    const list = posts.filter((p) => {
      if (filter !== "all" && statusOf(p, now) !== filter) return false;
      if (onlyAttn && !needsWork(p)) return false;
      if (!q) return true;
      return (
        (p.title || "").toLowerCase().includes(q) ||
        (p.slug || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.content || "").toLowerCase().includes(q)
      );
    });
    const by = {
      newest: (a, b) => new Date(b.created_at) - new Date(a.created_at),
      oldest: (a, b) => new Date(a.created_at) - new Date(b.created_at),
      az: (a, b) => (a.title || "").localeCompare(b.title || ""),
      words: (a, b) => ((meta[b.id] || {}).words || 0) - ((meta[a.id] || {}).words || 0),
      seo: (a, b) => ((meta[b.id] || {}).score || 0) - ((meta[a.id] || {}).score || 0),
    };
    return list.sort(by[sort] || by.newest);
  }, [posts, deferredSearch, filter, sort, onlyAttn, now, meta]);

  const shown = visible.slice(0, limit);
  const editingPost = posts.find((p) => p.id === editingId) || null;
  const editStatus = editingPost ? statusOf(editingPost, now) : "new";
  const isLiveEdit = !!editingPost && editStatus !== "draft";

  const fields = { title, slug, description, content, publishAt, category, tags, cover };
  const snapshot = useMemo(() => snapOf(fields), [title, slug, description, content, publishAt, category, tags, cover]);
  const dirty = editorOpen && snapshot !== baseRef.current;
  const slugTaken = !!slug && posts.some((p) => p.slug === slug && p.id !== editingId);

  const words = countWords(content);
  const readMins = Math.max(1, Math.ceil(words / 200));
  const checks = seoChecks({ title, description, content, slug, focus: focusKw, cover });
  const score = checks.filter((c) => c.ok).length;
  const ratio = checks.length ? score / checks.length : 0;
  const scoreLabel = ratio >= 0.85 ? "Zabardast 🔥" : ratio >= 0.6 ? "Achha 👍" : "Sudhaar chahiye";
  const stats = {
    chars: content.length,
    paras: content.split(/\n{2,}/).filter((x) => x.trim()).length,
    heads: (content.match(/^#{2,3} /gm) || []).length,
    links: (content.match(/(^|[^!])\[[^\]]*\]\((https?:\/\/|\/)/g) || []).length,
    imgs: (content.match(/!\[[^\]]*\]\(/g) || []).length,
  };

  /* ---------- editor open / close ---------- */
  const applyFields = (f) => {
    setTitle(f.title); setSlug(f.slug); setDescription(f.description); setContent(f.content);
    setPublishAt(f.publishAt); setCategory(f.category); setTags(f.tags); setCover(f.cover);
  };

  const openWith = (f, id = null) => {
    applyFields(f);
    setEditingId(id);
    setSlugTouched(!!id);
    baseRef.current = snapOf(f);
    setMode("write");
    setBookPick("");
    setFocusKw("");
    setSavedAt(0);
    const b = lsGet(BACKUP_PREFIX + (id || "new"));
    setBackup(b && b.f && snapOf(b.f) !== snapOf(f) ? b : null);
    setEditorOpen(true);
  };

  const openNew = (tpl) => {
    setTplOpen(false);
    openWith({ ...EMPTY, content: (tpl && tpl.content) || "" });
  };

  const openEdit = (p) =>
    openWith(
      {
        title: p.title || "",
        slug: p.slug && !isRandomId(p.slug) ? p.slug : slugify(p.title || ""),
        description: p.description || "",
        content: p.content || "",
        publishAt: statusOf(p, Date.now()) === "scheduled" ? toLocalInput(p.published_at) : "",
        category: p.category || "",
        tags: Array.isArray(p.tags) ? p.tags.join(", ") : p.tags || "",
        cover: p.cover_image || "",
      },
      p.id
    );

  const requestClose = async () => {
    if (dirty) {
      const ok = await ask({
        title: "Bina save kiye band karein?",
        message: "Jo badlaav save nahi hue wo chale jayenge.",
        confirmText: "Haan, band karo",
        cancelText: "Wapas likho",
        danger: true,
      });
      if (!ok) return;
      lsDel(BACKUP_PREFIX + (editingId || "new"));
    }
    setEditorOpen(false);
  };

  // auto-backup (crash / refresh se bachane ke liye)
  useEffect(() => {
    if (!editorOpen || !dirty) return;
    const id = setTimeout(() => lsSet(BACKUP_PREFIX + (editingId || "new"), { f: fields, ts: Date.now() }), 900);
    return () => clearTimeout(id);
  }, [snapshot, editorOpen]);

  // unsaved badlaav ke saath tab band ho to warning
  useEffect(() => {
    if (!dirty) return;
    const h = (e) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);

  /* ---------- toolbar ---------- */
  const insertAtCursor = (before, after = "", placeholder = "") => {
    const ta = taRef.current;
    if (!ta) { setContent((c) => c + before + placeholder + after); return; }
    ta.focus();
    const s = ta.selectionStart;
    const e = ta.selectionEnd;
    const sel = ta.value.slice(s, e) || placeholder;
    const text = before + sel + after;
    let ok = false;
    try { ok = document.execCommand("insertText", false, text); } catch (err) {} // undo/redo (Ctrl+Z) chalta rahe
    if (!ok) setContent(ta.value.slice(0, s) + text + ta.value.slice(e));
    requestAnimationFrame(() => {
      try { ta.setSelectionRange(s + before.length, s + before.length + sel.length); } catch (err) {}
    });
  };

  // FIX: Book link me ab random ID ('book-2dbcc52d') ki jagah hamesha Book ka clean naam aayega!
  const insertBookLink = (bookId) => {
    setBookPick("");
    const b = books.find((x) => String(x.id) === String(bookId));
    if (b) {
      const cleanBookSlug = getBookSlug(b);
      insertAtCursor(`[${b.title}](/book/${cleanBookSlug})`);
    }
  };

  /* ---------- images ---------- */
  const uploadImage = async (file) => {
    if (!/^image\//.test(file.type || "")) throw new Error("Ye image file nahi hai");
    const f = await compressImage(file);
    if (f.size > MAX_IMG_MB * 1024 * 1024) throw new Error(`Image ${MAX_IMG_MB}MB se badi hai`);
    const ext = ((f.name.split(".").pop() || "webp").toLowerCase().replace(/[^a-z0-9]/g, "")) || "webp";
    const base = slugify(f.name.replace(/\.[^.]+$/, "")) || "image";
    const path = `${IMG_FOLDER}/${base.slice(0, 40)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, f, { cacheControl: "31536000", upsert: false, contentType: f.type });
    if (error) {
      const msg = error.message || "";
      if (/bucket not found|not found/i.test(msg)) throw new Error("blog-images bucket nahi mila — pehle 11-blog-images.sql chalao");
      if (/row-level|policy|unauthor|permission/i.test(msg)) throw new Error("Upload permission nahi mili (admins table / storage policy check karo)");
      throw new Error(msg);
    }
    return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  };

  const altDefault = () => title.trim().replace(/[\[\]]/g, "");
  const imageBlocks = (urls, a) => urls.map((u) => `\n\n![${a}](${u})\n\n`).join("");

  const pickImages = (urls, altText) => {
    const target = imgModal;
    setImgModal(null);
    if (!urls.length) return;
    if (target === "cover") {
      setCover(urls[0]);
      notify("Cover image set ho gayi 🖼️", "success");
      return;
    }
    const a = (altText || altDefault()).replace(/[\[\]]/g, "");
    setMode((m) => (m === "preview" ? "write" : m));
    setTimeout(() => insertAtCursor(imageBlocks(urls, a)), 60);
    notify(`${urls.length} image article me daal di 🖼️`, "success");
  };

  const imgFilesOf = (dt) => Array.from((dt && dt.files) || []).filter((f) => f.type && f.type.startsWith("image/"));

  const uploadAndInsert = async (files) => {
    setUpBusy(true);
    const urls = [];
    for (const f of files) {
      try { urls.push(await uploadImage(f)); } catch (e) { notify(`${f.name || "Image"}: ${e.message}`, "error"); }
    }
    setUpBusy(false);
    if (urls.length) {
      insertAtCursor(imageBlocks(urls, altDefault()));
      notify(`${urls.length} image article me daal di 🖼️`, "success");
    }
  };

  const onEditorPaste = (e) => {
    const fs = imgFilesOf(e.clipboardData);
    if (fs.length) { e.preventDefault(); uploadAndInsert(fs); }
  };
  const onEditorDrop = (e) => {
    setDragOver(false);
    const fs = imgFilesOf(e.dataTransfer);
    if (fs.length) { e.preventDefault(); uploadAndInsert(fs); }
  };
  const onEditorDragOver = (e) => {
    if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes("Files")) { e.preventDefault(); setDragOver(true); }
  };

  const onEditorKey = (e) => {
    if (!(e.metaKey || e.ctrlKey)) return;
    const k = e.key.toLowerCase();
    if (k === "b") { e.preventDefault(); insertAtCursor("**", "**", "bold text"); }
    else if (k === "i") { e.preventDefault(); insertAtCursor("*", "*", "italic text"); }
    else if (k === "k") { e.preventDefault(); insertAtCursor("[", "](https://)", "link ka text"); }
  };

  const setQuick = (kind) => {
    const d = new Date();
    if (kind === "today") { d.setHours(18, 0, 0, 0); if (d <= new Date()) d.setDate(d.getDate() + 1); }
    else if (kind === "tom9") { d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); }
    else if (kind === "tom18") { d.setDate(d.getDate() + 1); d.setHours(18, 0, 0, 0); }
    else if (kind === "week") { d.setDate(d.getDate() + 7); d.setHours(9, 0, 0, 0); }
    setPublishAt(toLocalInput(d.toISOString()));
  };

  /* ---------- save ---------- */
  const save = async (publish, stay = false) => {
    if (saving) return;
    const t = title.trim();
    if (!t) return notify("Title zaroori hai", "error");

    // FIX: Agar slug khali hai ya Hindi me likha gaya hai, toh apne aap Title se clean slug banao
    let s = slugify(slug.trim() || t);
    if (!s) s = slugify(t);
    if (s !== slug) setSlug(s);

    if (!SLUG_RE.test(s)) return notify("Slug sirf a-z, 0-9 aur - se bana ho (jaise paise-bachane-ke-tareeke)", "error");
    if (posts.some((p) => p.slug === s && p.id !== editingId)) {
      return notify("Ye slug pehle se kisi aur article me hai. Slug badlo.", "error");
    }
    if (!content.trim()) return notify("Article ka text khali hai", "error");
    if (publish && publishAt && isNaN(new Date(publishAt).getTime())) return notify("Publish date sahi nahi hai", "error");

    // FIX: Agar user ne description khali chhoda hai toh SEO ke liye apne aap article se 155 chars ka description banao
    const finalDesc = description.trim() || autoDescription(content) || null;
    if (!description.trim() && finalDesc) setDescription(finalDesc);

    const payload = { title: t, slug: s, description: finalDesc, content, published: publish };
    if (FEATURES.category && (category.trim() || (editingPost && editingPost.category))) payload.category = category.trim() || null;
    if (FEATURES.tags && (tags.trim() || (editingPost && editingPost.tags))) payload.tags = tags.trim() || null;
    // column tabhi bhejo jab zaroori ho (SQL chalane se pehle bhi baaki save chalta rahe)
    if (FEATURES.cover_image && (cover.trim() || (editingPost && editingPost.cover_image))) payload.cover_image = cover.trim() || null;

    if (publish) {
      if (publishAt) payload.published_at = new Date(publishAt).toISOString();
      else if (editingPost && statusOf(editingPost, Date.now()) === "published") payload.published_at = editingPost.published_at;
      else payload.published_at = new Date().toISOString();
    }

    setSaving(true);
    try {
      let res = editingId
        ? await supabase.from("posts").update(payload).eq("id", editingId).select("id")
        : await supabase.from("posts").insert([payload]).select("id");

      // Safe Fallback: Agar DB me category/tags column na ho toh bina unke dobara save karein taaki error na aaye
      if (res.error && /category|tags|schema cache/i.test(res.error.message || "")) {
        const safePayload = { ...payload };
        delete safePayload.category;
        delete safePayload.tags;
        res = editingId
          ? await supabase.from("posts").update(safePayload).eq("id", editingId).select("id")
          : await supabase.from("posts").insert([safePayload]).select("id");
      }

      if (res.error) {
        if (res.error.code === "23505") notify("Ye slug pehle se kisi aur article me hai. Slug badlo.", "error");
        else if (/cover_image|schema cache/i.test(res.error.message || "")) notify("Naya column nahi mila — pehle 11-blog-images.sql Supabase me chalao. (" + res.error.message + ")", "error");
        else notify("Save nahi hua: " + res.error.message, "error");
        return;
      }
      if (editingId && (!res.data || !res.data.length)) {
        notify("Save nahi hua: permission nahi mili (admins table / RLS check karo)", "error");
        return;
      }
      const newId = editingId || (res.data && res.data[0] && res.data[0].id) || null;
      lsDel(BACKUP_PREFIX + (editingId || "new"));
      const isFuture = publish && new Date(payload.published_at) > new Date();
      notify(!publish ? "Draft save ho gaya 📝" : isFuture ? "Article schedule ho gaya ⏰" : isLiveEdit ? "Article update ho gaya ✅" : "Article live ho gaya 🚀", "success");
      await loadPosts(true);
      if (stay && newId) {
        setEditingId(newId);
        baseRef.current = snapOf({ ...fields, slug: s, description: finalDesc || "" });
        setBackup(null);
        setSavedAt(Date.now());
      } else setEditorOpen(false);
    } catch (e) {
      notify("Error: " + (e && e.message), "error");
    } finally {
      setSaving(false);
    }
  };

  // Ctrl+S = quick save (status wahi rehta hai) · Ctrl+Enter = publish/update · Esc = band
  const live = useRef({});
  live.current = { save, requestClose, editingPost, dialog, imgModal };
  useEffect(() => {
    if (!editorOpen) return;
    const h = (e) => {
      const L = live.current;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === "s") { e.preventDefault(); L.save(L.editingPost ? !!L.editingPost.published : false, true); }
      else if (mod && e.key === "Enter") { e.preventDefault(); L.save(true); }
      else if (e.key === "Escape" && !L.dialog && !L.imgModal) L.requestClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [editorOpen]);

  /* ---------- list actions (optimistic = fast) ---------- */
  const mutate = async (ids, patch, okMsg, failMsg) => {
    const prev = posts;
    setPosts((ps) => ps.map((p) => (ids.includes(p.id) ? { ...p, ...patch } : p)));
    try {
      const { data, error } = await supabase.from("posts").update(patch).in("id", ids).select("id");
      if (error) throw error;
      if (!data || !data.length) throw new Error("permission nahi mili (admins table / RLS check karo)");
      notify(okMsg, "success");
      return true;
    } catch (e) {
      setPosts(prev);
      notify(`${failMsg}: ${e.message}`, "error");
      return false;
    }
  };

  const removePosts = async (ids, okMsg) => {
    const prev = posts;
    setPosts((ps) => ps.filter((p) => !ids.includes(p.id)));
    try {
      const { data, error } = await supabase.from("posts").delete().in("id", ids).select("id");
      if (error) throw error;
      if (!data || !data.length) throw new Error("permission nahi mili (admins table / RLS check karo)");
      setSelected((s) => s.filter((id) => !ids.includes(id)));
      notify(okMsg, "success");
    } catch (e) {
      setPosts(prev);
      notify("Delete nahi hua: " + e.message, "error");
    }
  };

  const togglePublish = (p) => {
    const st = statusOf(p, Date.now());
    const patch = st === "published" ? { published: false } : { published: true, published_at: new Date().toISOString() };
    mutate([p.id], patch, st === "published" ? "Article draft me gaya" : "Article live ho gaya 🚀", "Update nahi hua");
  };

  const duplicatePost = async (p) => {
    const copySlug = `${(p.slug || slugify(p.title) || "article").slice(0, 45)}-copy-${Math.random().toString(36).slice(2, 6)}`;
    const row = { title: `${p.title} (copy)`, slug: copySlug, description: p.description, content: p.content, published: false };
    if (FEATURES.category && p.category) row.category = p.category;
    if (FEATURES.tags && p.tags) row.tags = p.tags;
    if (FEATURES.cover_image && p.cover_image) row.cover_image = p.cover_image;
    const { error } = await supabase.from("posts").insert([row]);
    if (error) return notify("Duplicate nahi hua: " + error.message, "error");
    notify("Copy draft me ban gayi", "success");
    loadPosts(true);
  };

  const deletePost = async (p) => {
    const ok = await ask({
      title: "Article delete karein?",
      message: `"${p.title}" hamesha ke liye delete ho jayega. Isse wapas nahi la sakte.`,
      confirmText: "Haan, delete karo",
      cancelText: "Rehne do",
      danger: true,
    });
    if (ok) removePosts([p.id], "Article delete ho gaya 🗑️");
  };

  const copyText = async (text) => {
    try { await navigator.clipboard.writeText(text); notify("Copy ho gaya ✅", "success"); }
    catch (e) { notify("Copy nahi hua", "error"); }
  };

  const exportAll = () => {
    download(`vedoxa-blog-backup-${toLocalInput(new Date().toISOString()).slice(0, 10)}.json`, JSON.stringify(posts, null, 2), "application/json");
    notify(`${posts.length} article ka backup download ho raha hai 💾`, "success");
  };

  /* ---------- bulk ---------- */
  const allVisibleSelected = visible.length > 0 && visible.every((p) => selected.includes(p.id));
  const toggleSelectAll = () => {
    if (allVisibleSelected) setSelected((s) => s.filter((id) => !visible.some((p) => p.id === id)));
    else setSelected((s) => Array.from(new Set([...s, ...visible.map((p) => p.id)])));
  };
  const toggleSelect = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const bulkPublish = async () => {
    const ids = posts.filter((p) => selected.includes(p.id) && statusOf(p, Date.now()) !== "published").map((p) => p.id);
    if (!ids.length) return notify("Chune hue articles pehle se live hain", "error");
    if (await mutate(ids, { published: true, published_at: new Date().toISOString() }, `${ids.length} article live ho gaye 🚀`, "Bulk publish nahi hua")) setSelected([]);
  };
  const bulkDraft = async () => {
    const ids = posts.filter((p) => selected.includes(p.id) && statusOf(p, Date.now()) !== "draft").map((p) => p.id);
    if (!ids.length) return notify("Chune hue articles pehle se draft hain", "error");
    if (await mutate(ids, { published: false }, `${ids.length} article draft me gaye`, "Bulk draft nahi hua")) setSelected([]);
  };
  const bulkDelete = async () => {
    if (!selected.length) return;
    const ok = await ask({
      title: `${selected.length} article delete karein?`,
      message: "Ye sab hamesha ke liye delete ho jayenge.",
      confirmText: "Haan, sab delete karo",
      cancelText: "Rehne do",
      danger: true,
    });
    if (ok) removePosts(selected, `${selected.length} article delete ho gaye 🗑️`);
  };
  const bulkExport = () => {
    const rows = posts.filter((p) => selected.includes(p.id));
    download(`vedoxa-selected-${rows.length}-articles.json`, JSON.stringify(rows, null, 2), "application/json");
  };

  /* ---------- ui helpers ---------- */
  const inputCls = "w-full bg-slate-800/80 border border-indigo-500/30 focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(96,165,250,.15)] rounded-xl px-4 py-3 text-white placeholder-slate-500 outline-none transition";
  const toolBtn = "bm-btn px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-bold text-slate-200";
  const card = "rounded-2xl border border-indigo-500/20 bg-slate-800/40 p-4";
  const titleLen = title.trim().length;
  const descLen = description.trim().length;
  const descPct = Math.min(100, (descLen / 160) * 100);
  const descColor = descLen === 0 ? "bg-slate-600" : descLen >= 120 && descLen <= 160 ? "bg-green-400" : "bg-amber-400";
  const goalPct = Math.min(100, (words / 600) * 100);
  const primaryLabel = saving ? "Save ho raha hai..." : isLiveEdit ? (publishAt ? "⏰ Reschedule" : "💾 Update karo") : publishAt ? "⏰ Schedule karo" : "🚀 Publish karo";
  const secondaryLabel = isLiveEdit ? "⏸️ Draft me bhejo" : "📝 Draft save";
  const showWrite = mode !== "preview";
  const showPrev = mode !== "write";

  /* ====================================================================
     RENDER
     ==================================================================== */
  return (
    <div className="bm-root space-y-6">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Header */}
      <div className="bm-up relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-indigo-500/20 backdrop-blur-md">
        <div className="bm-float pointer-events-none absolute -top-16 -left-10 h-48 w-48 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="bm-float pointer-events-none absolute -bottom-20 right-10 h-52 w-52 rounded-full bg-purple-600/20 blur-3xl" style={{ animationDelay: "-4s" }} />
        <div className="relative">
          <h2 className="text-3xl font-black text-white flex items-center gap-2">
            <span>📝</span>
            <span className="bm-grad-text text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-blue-300">Blog Manager</span>
          </h2>
          <p className="text-indigo-300 text-sm mt-1">Article likho, schedule karo, SEO check karo, live ya draft karo.</p>
        </div>
        <div className="relative flex flex-wrap items-center gap-2">
          <IconBtn title="Refresh" onClick={() => loadPosts(true)} className="!h-11 !min-w-[2.75rem] !rounded-xl border border-indigo-500/30 !bg-slate-800/80">
            <span className={refreshing ? "bm-spin inline-block" : "inline-block"}>🔄</span>
          </IconBtn>
          <IconBtn title="Sab articles ka backup (JSON)" onClick={exportAll} className="!h-11 !min-w-[2.75rem] !rounded-xl border border-indigo-500/30 !bg-slate-800/80">💾</IconBtn>
          <div className="relative">
            <div className="flex">
              <button
                onClick={() => openNew(TEMPLATES[0])}
                className="bm-btn bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black pl-6 pr-4 py-3 rounded-l-xl shadow-[0_0_20px_rgba(139,92,246,0.4)]"
              >
                + Naya Article
              </button>
              <button
                onClick={() => setTplOpen((v) => !v)}
                aria-label="Templates"
                title="Template chuno"
                className="bm-btn bg-purple-600 hover:bg-purple-500 text-white font-black px-3 rounded-r-xl border-l border-white/20"
              >
                ▾
              </button>
            </div>
            {tplOpen && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setTplOpen(false)} />
                <div className="bm-pop absolute right-0 mt-2 z-40 w-72 rounded-2xl border border-indigo-500/30 bg-slate-900 p-2 shadow-2xl">
                  <p className="px-3 pt-2 pb-1 text-xs font-bold text-slate-400">Template se shuru karo</p>
                  {TEMPLATES.map((t) => (
                    <button key={t.id} onClick={() => openNew(t)} className="bm-btn flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left hover:bg-indigo-500/15">
                      <span className="text-xl">{t.icon}</span>
                      <span>
                        <span className="block text-sm font-bold text-white">{t.name}</span>
                        <span className="block text-xs text-slate-400">{t.hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stat / filter cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { id: "all", label: "Total", icon: "📚", color: "text-white", bar: "bg-indigo-400" },
          { id: "published", label: "Live", icon: "🟢", color: "text-green-300", bar: "bg-green-400" },
          { id: "scheduled", label: "Scheduled", icon: "⏰", color: "text-blue-300", bar: "bg-blue-400" },
          { id: "draft", label: "Drafts", icon: "📝", color: "text-slate-300", bar: "bg-slate-400" },
        ].map((s, i) => (
          <button
            key={s.id}
            onClick={() => setFilter(s.id)}
            style={{ animationDelay: `${i * 60}ms` }}
            className={`bm-up bm-card text-left p-4 rounded-2xl border ${filter === s.id ? "bg-indigo-500/20 border-blue-400/70" : "bg-slate-900/60 border-indigo-500/20 hover:border-indigo-400/50"}`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-400">{s.label}</p>
              <span>{s.icon}</span>
            </div>
            <p className={`text-3xl font-black mt-1 ${s.color}`}><Num value={counts[s.id]} /></p>
            <div className="mt-3 h-1 rounded-full bg-slate-700/60 overflow-hidden">
              <div className={`h-full rounded-full ${s.bar}`} style={{ width: `${counts.all ? (counts[s.id] / counts.all) * 100 : 0}%`, transition: "width .8s cubic-bezier(.22,1,.36,1)" }} />
            </div>
          </button>
        ))}
      </div>

      {/* Insights */}
      {posts.length > 0 && (
        <div className="bm-up grid grid-cols-2 lg:grid-cols-4 gap-3" style={{ animationDelay: "120ms" }}>
          <div className="rounded-xl border border-indigo-500/15 bg-slate-900/50 px-4 py-3">
            <p className="text-xs text-slate-400">✍️ Total shabd</p>
            <p className="text-xl font-black text-white"><Num value={insights.words} /></p>
          </div>
          <div className="rounded-xl border border-indigo-500/15 bg-slate-900/50 px-4 py-3">
            <p className="text-xs text-slate-400">📈 Average SEO</p>
            <p className="text-xl font-black text-white"><Num value={insights.avg} />%</p>
          </div>
          <div className="rounded-xl border border-indigo-500/15 bg-slate-900/50 px-4 py-3">
            <p className="text-xs text-slate-400">🗓️ Is mahine live</p>
            <p className="text-xl font-black text-white"><Num value={insights.month} /></p>
          </div>
          <button
            onClick={() => setOnlyAttn((v) => !v)}
            className={`bm-btn text-left rounded-xl border px-4 py-3 ${onlyAttn ? "border-amber-400/70 bg-amber-500/15" : "border-indigo-500/15 bg-slate-900/50 hover:border-amber-400/40"}`}
          >
            <p className="text-xs text-slate-400">⚠️ Sudhaar chahiye {onlyAttn ? "(filter ON)" : ""}</p>
            <p className="text-xl font-black text-amber-300"><Num value={insights.attn} /></p>
          </button>
        </div>
      )}

      {/* Search + sort + view */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title, slug ya article ke andar dhoondho...  ( / dabao )"
            className="w-full bg-slate-900/60 border border-indigo-500/30 focus:border-blue-400 rounded-xl pl-11 pr-10 py-4 text-white placeholder-slate-500 outline-none transition"
          />
          {search && (
            <button onClick={() => setSearch("")} aria-label="Clear" className="bm-btn absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full bg-slate-700 text-xs text-white">✕</button>
          )}
        </div>
        <div className="flex gap-3">
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="flex-1 md:flex-none bg-slate-900/60 border border-indigo-500/30 rounded-xl px-4 py-4 text-sm font-bold text-slate-200 outline-none">
            <option value="newest">Naye pehle</option>
            <option value="oldest">Purane pehle</option>
            <option value="az">A → Z</option>
            <option value="words">Sabse lamba</option>
            <option value="seo">Best SEO</option>
          </select>
          <div className="flex rounded-xl border border-indigo-500/30 bg-slate-900/60 p-1">
            {[["list", "☰"], ["grid", "▦"]].map(([v, ic]) => (
              <button
                key={v}
                aria-label={v === "list" ? "List view" : "Grid view"}
                onClick={() => { setView(v); lsSet(VIEW_KEY, v); }}
                className={`bm-btn w-11 rounded-lg text-lg ${view === v ? "bg-indigo-500/40 text-white" : "text-slate-400 hover:text-white"}`}
              >
                {ic}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk bar */}
      {selected.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-3">
          <div className="bm-pop pointer-events-auto flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-400/50 bg-slate-900/95 p-3 shadow-2xl backdrop-blur">
            <span className="px-2 text-sm font-bold text-indigo-200">{selected.length} chune hue</span>
            <button onClick={bulkPublish} className="bm-btn rounded-lg bg-green-600 hover:bg-green-500 px-3 py-2 text-xs font-bold text-white">🚀 Live karo</button>
            <button onClick={bulkDraft} className="bm-btn rounded-lg bg-slate-600 hover:bg-slate-500 px-3 py-2 text-xs font-bold text-white">📝 Draft</button>
            <button onClick={bulkExport} className="bm-btn rounded-lg bg-slate-700 hover:bg-slate-600 px-3 py-2 text-xs font-bold text-white">💾 Export</button>
            <button onClick={bulkDelete} className="bm-btn rounded-lg bg-red-600 hover:bg-red-500 px-3 py-2 text-xs font-bold text-white">🗑️ Delete</button>
            <button onClick={() => setSelected([])} className="bm-btn rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-slate-300">Hatao</button>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">{[0, 1, 2, 3].map((i) => <SkeletonCard key={i} i={i} />)}</div>
      ) : loadError ? (
        <div className="bm-up bg-red-900/30 border border-red-500/40 rounded-2xl p-5 text-sm text-red-200 space-y-2">
          <p className="font-bold">Articles load nahi hue:</p>
          <p className="font-mono text-xs break-words">{loadError}</p>
          <p className="text-red-300">Check karo: Supabase me 6-blog-posts.sql aur 10-admin-security.sql chali hain, aur aapka email admins table me hai.</p>
          <button onClick={() => loadPosts()} className="bm-btn mt-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold">Dobara try karo</button>
        </div>
      ) : visible.length === 0 ? (
        <div className="bm-up bg-slate-900/60 border border-indigo-500/20 rounded-2xl p-10 text-center">
          <div className="text-5xl mb-3">{posts.length === 0 ? "✍️" : "🔎"}</div>
          <p className="text-slate-200 font-bold">{posts.length === 0 ? "Abhi koi article nahi hai." : "Is filter me koi article nahi mila."}</p>
          <p className="text-slate-500 text-sm mt-1">{posts.length === 0 ? "Pehla article likho aur Google me dikhna shuru karo." : "Search ya filter badal ke dekho."}</p>
          {posts.length === 0 ? (
            <button onClick={() => openNew(TEMPLATES[0])} className="bm-btn mt-5 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold">Pehla article likho</button>
          ) : (
            <button onClick={() => { setSearch(""); setFilter("all"); setOnlyAttn(false); }} className="bm-btn mt-5 px-5 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold">Filter hatao</button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <label className="flex items-center gap-3 text-xs font-bold text-slate-400 cursor-pointer">
              <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} className="w-4 h-4 accent-blue-500" />
              Sabhi chuno ({visible.length})
            </label>
            <span className="text-xs text-slate-500">{shown.length} / {visible.length} dikh rahe hain</span>
          </div>

          <div className={view === "grid" ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
            {shown.map((p, i) => {
              const st = statusOf(p, now);
              const mt = meta[p.id] || { words: 0, score: 0, total: 6 };
              const cleanPostSlug = p.slug && !isRandomId(p.slug) ? p.slug : slugify(p.title || "");
              const url = `${SITE_URL}/blog/${cleanPostSlug}`;
              const checked = selected.includes(p.id);
              const pill = mt.score >= 5 ? "bg-green-500/15 text-green-300 border-green-500/30" : mt.score >= 3 ? "bg-amber-500/15 text-amber-300 border-amber-500/30" : "bg-red-500/15 text-red-300 border-red-500/30";
              return (
                <div
                  key={p.id}
                  style={{ animationDelay: `${Math.min(i, 10) * 45}ms` }}
                  className={`bm-up bm-card relative flex h-full flex-col overflow-hidden rounded-2xl border p-4 sm:p-5 ${checked ? "border-blue-400/70 bg-indigo-500/10" : "border-indigo-500/20 bg-slate-900/70 hover:border-blue-400/50"}`}
                >
                  <span className={`absolute left-0 top-0 h-full w-1 ${ACCENT[st]}`} />
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={checked} onChange={() => toggleSelect(p.id)} aria-label="Select" className="mt-1.5 w-4 h-4 accent-blue-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge st={st} />
                        <span className="text-xs text-slate-500">
                          {st === "draft" ? "Bana: " + formatDate(p.created_at) : (st === "scheduled" ? "Live hoga: " : "Live: ") + formatDate(p.published_at)}
                          {st !== "draft" && <span className="text-slate-400"> ({relTime(p.published_at, now)})</span>}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white mt-2 break-words">{p.title}</h3>
                      <p className="text-xs font-mono text-indigo-300 mt-1 break-all">/blog/{cleanPostSlug}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>{mt.words} shabd</span>
                        <span>• ~{Math.max(1, Math.ceil(mt.words / 200))} min</span>
                        <span className={`rounded-full border px-2 py-0.5 font-bold ${pill}`}>SEO {mt.score}/{mt.total}</span>
                        {!p.description && <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-amber-300">Description nahi</span>}
                        {FEATURES.category && p.category && <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 text-purple-300">{p.category}</span>}
                      </div>
                    </div>
                  {FEATURES.cover_image && (p.cover_image ? (
                      <img src={p.cover_image} alt="" loading="lazy" className="h-20 w-20 shrink-0 rounded-xl border border-indigo-500/20 object-cover sm:h-24 sm:w-24" />
                    ) : (
                      <div title="Cover image nahi lagi" className="grid h-20 w-20 shrink-0 place-items-center rounded-xl border border-dashed border-slate-600 text-xl opacity-50 sm:h-24 sm:w-24">🖼️</div>
                    ))}
                  </div>
                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
                    <button onClick={() => openEdit(p)} className="bm-btn h-9 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold">✏️ Edit</button>
                    <button onClick={() => togglePublish(p)} className="bm-btn h-9 px-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold">{TOGGLE_LABEL[st]}</button>
                    {st === "published" && <IconBtn title="Site par dekho" href={url}>👁️</IconBtn>}
                    <IconBtn title="Link copy" onClick={() => copyText(url)}>🔗</IconBtn>
                    <IconBtn title="Duplicate" onClick={() => duplicatePost(p)}>📄</IconBtn>
                    <IconBtn title="Markdown download" onClick={() => download(`${cleanPostSlug || "article"}.md`, toMarkdown(p), "text/markdown")}>⬇️</IconBtn>
                    <IconBtn title="Delete" danger onClick={() => deletePost(p)} className="ml-auto">🗑️</IconBtn>
                  </div>
                </div>
              );
            })}
          </div>

          {visible.length > shown.length && (
            <div className="flex justify-center pt-2">
              <button onClick={() => setLimit((l) => l + PAGE_SIZE)} className="bm-btn rounded-xl border border-indigo-500/30 bg-slate-800/80 px-6 py-3 text-sm font-bold text-indigo-200 hover:bg-slate-700">
                Aur dikhao ({visible.length - shown.length} baaki)
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===================== Editor ===================== */}
      {editorOpen && (
        <div className="bm-fade fixed inset-0 z-50 flex justify-center sm:items-center sm:p-4 bg-slate-950/90 backdrop-blur-sm">
          <div className="bm-pop bm-scroll w-full max-w-6xl h-full sm:h-auto sm:max-h-[95vh] overflow-y-auto bg-slate-900 border border-indigo-500/40 sm:rounded-3xl shadow-2xl">
            {/* top bar */}
            <div className="sticky top-0 z-20 flex flex-wrap items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 bg-slate-900/95 backdrop-blur border-b border-indigo-500/20">
              <h3 className="mr-auto flex items-center gap-2 text-lg sm:text-xl font-black text-white">
                {editingId ? "✏️ Edit" : "✨ Naya Article"}
                {editingPost && <StatusBadge st={editStatus} />}
              </h3>
              <span className={`text-xs font-bold ${dirty ? "text-amber-300" : "text-green-300"}`}>
                {dirty ? "● Unsaved" : savedAt ? `✓ Saved ${new Date(savedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}` : ""}
              </span>
              <button onClick={() => save(false, true)} disabled={saving} className="bm-btn rounded-xl bg-slate-700 hover:bg-slate-600 disabled:opacity-50 px-4 py-2.5 text-sm font-bold text-white">{secondaryLabel}</button>
              <button onClick={() => save(true)} disabled={saving} className="bm-btn rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 px-5 py-2.5 text-sm font-black text-white shadow-[0_0_18px_rgba(16,185,129,.35)]">{primaryLabel}</button>
              <button onClick={requestClose} aria-label="Band karo" title="Band (Esc)" className="bm-btn h-10 w-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300">✕</button>
            </div>

            {backup && (
              <div className="bm-up mx-4 sm:mx-6 mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                <span>🛟 Is article ka unsaved backup mila ({relTime(new Date(backup.ts).toISOString(), now)}).</span>
                <button onClick={() => { applyFields(backup.f); setSlugTouched(true); setBackup(null); }} className="bm-btn ml-auto rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-black text-slate-900">Restore karo</button>
                <button onClick={() => { lsDel(BACKUP_PREFIX + (editingId || "new")); setBackup(null); }} className="bm-btn rounded-lg bg-slate-700 px-3 py-1.5 text-xs font-bold text-white">Hatao</button>
              </div>
            )}

            <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_340px]">
              {/* ---- left: writing ---- */}
              <div className="min-w-0 space-y-5">
                <div>
                  <input
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); if (!slugTouched) setSlug(slugify(e.target.value)); }}
                    type="text"
                    aria-label="Title"
                    className="w-full bg-transparent border-0 border-b-2 border-indigo-500/30 focus:border-blue-400 px-1 py-3 text-2xl sm:text-3xl font-black text-white placeholder-slate-600 outline-none transition"
                    placeholder="Article ka title likho..."
                  />
                  <p className={`mt-1 text-right text-xs ${titleLen >= 25 && titleLen <= 70 ? "text-green-300" : "text-slate-500"}`}>{titleLen}/70</p>
                </div>

                <div>
                  <div className="flex gap-2">
                    <div className="flex min-w-0 flex-1 items-center rounded-xl border border-indigo-500/30 bg-slate-800/80 focus-within:border-blue-400 transition">
                      <span className="hidden sm:block pl-4 text-xs text-slate-500 whitespace-nowrap">{SITE_URL.replace("https://", "")}/blog/</span>
                      <input
                        value={slug}
                        onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }}
                        type="text"
                        aria-label="Slug"
                        className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm text-white outline-none"
                        placeholder="paise-bachane-ke-tareeke"
                      />
                    </div>
                    <button type="button" onClick={() => { setSlug(slugify(title)); setSlugTouched(true); }} className={toolBtn + " whitespace-nowrap"}>✨ Auto</button>
                  </div>
                  <p className={`mt-1 text-xs ${!slug ? "text-slate-500" : slugTaken ? "text-red-400" : SLUG_RE.test(slug) ? "text-green-300" : "text-amber-400"}`}>
                    {!slug ? "Slug title se apne aap ban jayega (Hindi title bhi apne aap English/Roman link me badal jayega)" : slugTaken ? "❌ Ye slug kisi aur article me use ho raha hai" : SLUG_RE.test(slug) ? "✅ Slug sahi hai" : "⚠️ Sirf a-z, 0-9 aur - chalega"}
                  </p>
                  {editingPost && editingPost.published && slug !== editingPost.slug && (
                    <p className="mt-1 text-xs text-amber-400">⚠️ Live article ka slug badalne se purana link band ho jayega (Google me ho to bhi).</p>
                  )}
                </div>

                <div>
                  {/* toolbar */}
                  <div className={`mb-2 flex flex-wrap items-center gap-2 transition-opacity ${mode === "preview" ? "pointer-events-none opacity-40" : ""}`}>
                    {TOOLS.map((t) => (
                      <button key={t.label} type="button" title={t.title} onClick={() => insertAtCursor(...t.a)} className={`${toolBtn} ${t.cls || ""}`}>{t.label}</button>
                    ))}
                    <button type="button" title="Image upload / library" onClick={() => setImgModal("content")} className={`${toolBtn} !border-purple-500/50 !text-purple-200`}>🖼️ Image</button>
                    <select
                      value={bookPick}
                      onChange={(e) => insertBookLink(e.target.value)}
                      className="max-w-[11rem] rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200"
                    >
                      <option value="">📚 Book link jodo</option>
                      {books.map((b) => <option key={b.id} value={b.id}>{b.title}</option>)}
                    </select>
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-300">Article *</span>
                    {upBusy && <span className="bm-up text-xs font-bold text-amber-300">⏳ Image upload ho rahi hai...</span>}
                    <div className="ml-auto flex rounded-xl border border-indigo-500/30 bg-slate-800/60 p-1">
                      {[["write", "✏️ Likho"], ["preview", "👁️ Preview"], ["split", "◫ Split"]].map(([m, l]) => (
                        <button key={m} type="button" onClick={() => setMode(m)} className={`bm-btn rounded-lg px-3 py-1.5 text-xs font-bold ${m === "split" ? "hidden lg:block" : ""} ${mode === m ? "bg-indigo-500/40 text-white" : "text-slate-400 hover:text-white"}`}>{l}</button>
                      ))}
                    </div>
                  </div>

                  <div className={mode === "split" ? "grid gap-3 lg:grid-cols-2" : ""}>
                    {showWrite && (
                      <textarea
                        ref={taRef}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onKeyDown={onEditorKey}
                        onPaste={onEditorPaste}
                        onDrop={onEditorDrop}
                        onDragOver={onEditorDragOver}
                        onDragLeave={() => setDragOver(false)}
                        spellCheck
                        className={`${inputCls} bm-scroll leading-7 resize-y ${dragOver ? "!border-blue-400 ring-4 ring-blue-400/30" : ""} ${mode === "split" ? "h-[32rem]" : "h-96 sm:h-[28rem]"}`}
                        placeholder={"Pehla paragraph yahan likho.\n\n## Pehla heading\n\nIska matlab..."}
                      />
                    )}
                    {showPrev && (
                      <div className={`bm-scroll overflow-y-auto rounded-xl border border-indigo-500/20 bg-slate-950/60 p-5 ${mode === "split" ? "h-[32rem]" : "min-h-[18rem] sm:min-h-[28rem]"}`}>
                        {cover && FEATURES.cover_image && <img src={cover} alt="" className="mb-4 max-h-56 w-full rounded-xl object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />}
                        <h1 className="mb-4 text-2xl font-black text-white">{title || "Title yahan dikhega"}</h1>
                        {content.trim() ? renderPreview(content) : <p className="text-slate-500">Abhi kuch likha nahi hai...</p>}
                      </div>
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="h-1.5 overflow-hidden rounded-full bg-slate-700/60">
                      <div className={`h-full rounded-full ${goalPct >= 100 ? "bg-green-400" : "bg-gradient-to-r from-blue-500 to-purple-500"}`} style={{ width: `${goalPct}%`, transition: "width .5s cubic-bezier(.22,1,.36,1)" }} />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">
                      {words} / 600 shabd • ~{readMins} min padhne me • {stats.chars} akshar • {stats.paras} paragraph • {stats.heads} heading • {stats.links} link • {stats.imgs} image
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Naya paragraph = ek khali line chhodo • Ctrl+S save • Ctrl+Enter publish • Esc band • Image paste ya drag-drop karo</p>
                  </div>
                </div>
              </div>

              {/* ---- right: sidebar ---- */}
              <aside className="bm-scroll space-y-4 lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(95vh-7rem)] lg:overflow-y-auto lg:pr-1">
                {/* Cover image */}
                {FEATURES.cover_image && (
                  <div className={card}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-bold text-indigo-300">🖼️ Cover image</p>
                      {cover && <button type="button" onClick={() => setCover("")} className="text-xs font-bold text-red-300 hover:text-red-200">✕ Hatao</button>}
                    </div>
                    {cover ? (
                      <button type="button" onClick={() => setImgModal("cover")} className="group relative block w-full overflow-hidden rounded-xl border border-indigo-500/30">
                        <img key={cover} src={cover} alt="" className="bm-fade h-36 w-full object-cover transition duration-300 group-hover:scale-105" />
                        <span className="absolute inset-0 grid place-items-center bg-slate-950/60 text-sm font-bold text-white opacity-0 transition group-hover:opacity-100">Badlo</span>
                      </button>
                    ) : (
                      <button type="button" onClick={() => setImgModal("cover")} className="bm-btn grid h-28 w-full place-items-center rounded-xl border-2 border-dashed border-indigo-500/40 bg-slate-900/50 text-center text-sm font-bold text-indigo-200 hover:border-blue-400">
                        <span>⬆️ Cover image lagao<span className="mt-1 block text-xs font-normal text-slate-500">Upload ya library se</span></span>
                      </button>
                    )}
                    <input value={cover} onChange={(e) => setCover(e.target.value)} className={inputCls + " mt-3 !py-2 text-xs"} placeholder="ya image URL paste karo" />
                  </div>
                )}

                {/* SEO */}
                <div className={card}>
                  <div className="flex items-center gap-4">
                    <Ring value={score} total={checks.length} />
                    <div>
                      <p className="text-sm font-black text-white">SEO score</p>
                      <p className={`text-sm font-bold ${ratio >= 0.85 ? "text-green-300" : ratio >= 0.6 ? "text-amber-300" : "text-red-300"}`}>{scoreLabel}</p>
                    </div>
                  </div>
                  <ul className="mt-4 space-y-1.5">
                    {checks.map((c, i) => (
                      <li key={i} className={`flex items-start gap-2 text-xs ${c.ok ? "text-green-300" : "text-amber-300"}`}>
                        <span>{c.ok ? "✅" : "⚠️"}</span>
                        <span>{c.text}</span>
                      </li>
                    ))}
                  </ul>
                  <input value={focusKw} onChange={(e) => setFocusKw(e.target.value)} className={inputCls + " mt-4 !py-2 text-sm"} placeholder="🎯 Focus keyword (optional)" />
                </div>

                {/* Description + SERP */}
                <div className={card}>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-bold text-indigo-300">Description (Google me dikhega)</label>
                    <button type="button" onClick={() => setDescription(autoDescription(content))} disabled={!content.trim()} className={toolBtn + " !py-1 disabled:opacity-40"}>✨ Auto</button>
                  </div>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} className={inputCls + " h-24 resize-none text-sm"} placeholder="120-160 akshar ka chhota summary" />
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-700/60">
                    <div className={`h-full rounded-full ${descColor}`} style={{ width: `${descPct}%`, transition: "width .4s ease, background-color .3s" }} />
                  </div>
                  <p className="mt-1 text-right text-xs text-slate-500">{descLen}/160</p>

                  <p className="mt-3 mb-2 text-xs font-bold text-indigo-300">Google preview</p>
                  <div className="rounded-xl bg-white p-3">
                    <p className="truncate text-[11px] text-slate-600">{SITE_URL.replace("https://", "")} › blog › {slug || "..."}</p>
                    <p className="mt-0.5 text-[15px] leading-snug text-[#1a0dab] break-words">{(title.trim() || "Aapka article title").slice(0, 60)}{title.trim().length > 60 ? "…" : ""}</p>
                    <p className="mt-0.5 text-xs leading-snug text-slate-600 break-words">{(description.trim() || autoDescription(content) || "Description yahan dikhega...").slice(0, 160)}</p>
                  </div>
                </div>

                {/* Schedule */}
                <div className={card}>
                  <label className="mb-2 block text-xs font-bold text-indigo-300">Publish time (khali = abhi live)</label>
                  <input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className={inputCls + " text-sm"} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[["today", "Aaj 6 PM"], ["tom9", "Kal 9 AM"], ["tom18", "Kal 6 PM"], ["week", "Agle hafte"]].map(([k, l]) => (
                      <button key={k} type="button" onClick={() => setQuick(k)} className={toolBtn + " !py-1.5"}>{l}</button>
                    ))}
                    {publishAt && <button type="button" onClick={() => setPublishAt("")} className={toolBtn + " !py-1.5 !text-red-300"}>✕ Abhi</button>}
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Bhavishya ki date daloge to article tab tak public nahi dikhega (site par 10 minute tak der lag sakti hai).</p>
                </div>

                {/* Optional fields */}
                {(FEATURES.category || FEATURES.tags) && (
                  <div className={card + " space-y-3"}>
                    {FEATURES.category && <input value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls + " !py-2 text-sm"} placeholder="📂 Category (e.g. Mindset, Relationship)" />}
                    {FEATURES.tags && <input value={tags} onChange={(e) => setTags(e.target.value)} className={inputCls + " !py-2 text-sm"} placeholder="🏷️ Tags (comma se alag: hindi books, mindset)" />}
                  </div>
                )}
              </aside>
            </div>
          </div>
        </div>
      )}

      {imgModal && (
        <ImageModal target={imgModal} supabase={supabase} uploadImage={uploadImage} onPick={pickImages} onClose={() => setImgModal(null)} notify={notify} ask={ask} />
      )}

      <ConfirmModal dialog={dialog} onClose={closeDialog} />

      {/* fallback toasts */}
      <div className="pointer-events-none fixed right-4 top-4 z-[80] space-y-2">
        {toasts.map((t) => (
          <div key={t.id} className={`bm-toast pointer-events-auto max-w-xs rounded-xl border px-4 py-3 text-sm font-semibold shadow-xl backdrop-blur ${TOAST_STYLE[t.t] || TOAST_STYLE.info}`}>{t.m}</div>
        ))}
      </div>
    </div>
  );
}
