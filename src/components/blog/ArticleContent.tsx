/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { ReactNode } from "react";

/*
  Article ka text yahan se dikhta hai. BlogManager ke editor jaisi hi syntax:
  ## heading, ### heading, **bold**, *italic*, `code`, [text](link),
  - list, 1. list, > quote, ---, ![alt](image-url)
  Naya paragraph = ek khali line. Ek line ke andar single Enter line-break ban jata hai.
*/

const A_CLASS = "text-amber-400 underline underline-offset-4 hover:text-amber-300";

function renderInline(text: string): ReactNode[] {
  const re =
    /(\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\))|(\*\*([^*]+)\*\*)|(\*([^*\n]+)\*)|(`([^`]+)`)|(!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\))/g;
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = "k" + i;
    if (m[1]) {
      out.push(
        m[3].startsWith("/") ? (
          <Link key={key} href={m[3]} className={A_CLASS}>{m[2]}</Link>
        ) : (
          <a key={key} href={m[3]} target="_blank" rel="noopener noreferrer" className={A_CLASS}>{m[2]}</a>
        )
      );
    } else if (m[4]) out.push(<strong key={key} className="font-bold text-white">{m[5]}</strong>);
    else if (m[6]) out.push(<em key={key}>{m[7]}</em>);
    else if (m[8]) out.push(<code key={key} className="rounded bg-white/10 px-1.5 py-0.5 text-[0.9em] text-pink-300">{m[9]}</code>);
    else out.push(<img key={key} src={m[12]} alt={m[11]} loading="lazy" decoding="async" className="my-2 inline-block max-w-full rounded-lg" />);
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function ArticleContent({ content }: { content: string }) {
  const blocks = String(content || "").replace(/\r\n/g, "\n").split(/\n{2,}/);

  return (
    <div className="text-[17px]">
      {blocks.map((block, idx) => {
        const text = block.trim();
        if (!text) return null;

        const img = text.match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)$/);
        if (img)
          return (
            <figure key={idx} className="my-8">
              <img src={img[2]} alt={img[1]} loading="lazy" decoding="async" className="h-auto w-full rounded-2xl border border-white/10" />
              {img[1] && <figcaption className="mt-2 text-center text-sm text-slate-500">{img[1]}</figcaption>}
            </figure>
          );

        if (/^---+$/.test(text)) return <hr key={idx} className="my-10 border-white/10" />;
        if (text.startsWith("### ")) return <h3 key={idx} className="mb-3 mt-8 text-xl font-bold text-white">{renderInline(text.slice(4))}</h3>;
        if (text.startsWith("## ")) return <h2 key={idx} className="mb-4 mt-10 text-2xl font-bold text-white">{renderInline(text.slice(3))}</h2>;

        const lines = text.split("\n");

        if (lines.every((l) => l.trim().startsWith("> ")))
          return (
            <blockquote key={idx} className="my-6 border-l-4 border-amber-400/60 pl-4 italic text-slate-300">
              {renderInline(lines.map((l) => l.trim().slice(2)).join(" "))}
            </blockquote>
          );

        if (lines.every((l) => l.trim().startsWith("- ")))
          return (
            <ul key={idx} className="my-5 list-disc space-y-2 pl-6 text-slate-300">
              {lines.map((l, j) => <li key={j}>{renderInline(l.trim().slice(2))}</li>)}
            </ul>
          );

        if (lines.every((l) => /^\d+\.\s/.test(l.trim())))
          return (
            <ol key={idx} className="my-5 list-decimal space-y-2 pl-6 text-slate-300">
              {lines.map((l, j) => <li key={j}>{renderInline(l.trim().replace(/^\d+\.\s/, ""))}</li>)}
            </ol>
          );

        return (
          <p key={idx} className="my-5 whitespace-pre-line leading-8 text-slate-300">
            {renderInline(lines.join("\n"))}
          </p>
        );
      })}
    </div>
  );
}
