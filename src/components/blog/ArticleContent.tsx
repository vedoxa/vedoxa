/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import Link from "next/link";

/* ═════════════ Icons (inline SVG, no extra dependency) ═════════════ */

const ICONS = {
  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),
  file: (
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8" />
    </>
  ),
  home: (
    <>
      <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M9 22V12h6v10" />
    </>
  ),
  book: <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />,
  link: (
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  up: <path d="M12 19V5M5 12l7-7 7 7" />,
  chevron: <path d="m6 9 6 6 6-6" />,
  share: (
    <>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98M15.41 6.51l-6.82 3.98" />
    </>
  ),
  headphones: (
    <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
  ),
  pause: <path d="M8 5v14M16 5v14" />,
  stop: <rect x="6" y="6" width="12" height="12" rx="2" />,
  chat: <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />,
  flag: (
    <>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
      <path d="M4 22v-7" />
    </>
  ),
  zap: <path d="M13 2 3 14h9l-1 8 10-12h-9z" />,
  star: <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />,
  reset: (
    <>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />,
  arrowRight: <path d="M5 12h14M12 5l7 7-7 7" />,
  arrowLeft: <path d="M19 12H5M12 19l-7-7 7-7" />,
  external: <path d="M7 17 17 7M7 7h10v10" />,
};

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  size = 16,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ flex: "none" }}
    >
      {ICONS[name]}
    </svg>
  );
}

/* ═════════════ Theme: white + light sky blue, flat soft cards, normal readable text ═════════════ */

const AC_CSS = `
.ac-root{--ac-ink:#0f172a;--ac-tx:#334155;--ac-mute:#64748b;--ac-line:#dbe9f6;--ac-sky:#0284c7;--ac-skd:#0369a1;--ac-sk1:#e0f2fe;--ac-sk0:#f0f9ff;--ac-rose:#be123c;--ac-hd:var(--font-vx-display,var(--font-vx-body,ui-sans-serif)),'Noto Sans Devanagari',ui-sans-serif,system-ui,sans-serif;position:relative;color:var(--ac-tx)}
.ac-root :is(a,button,input):focus-visible{outline:2px solid var(--ac-sky);outline-offset:3px}
.ac-root button{cursor:pointer}

/* cards */
.ac-tile{position:relative;border-radius:1.25rem;border:1px solid var(--ac-line);background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.04),0 12px 28px -20px rgba(2,132,199,.3)}
.ac-sky{background:var(--ac-sk0);border-color:#cde6f9}
.ac-rose{background:#fff5f6;border-color:#fdd5db}

/* body text */
.ac-body{color:var(--ac-tx);overflow-wrap:break-word;transition:font-size .25s ease}
.ac-s0{font-size:16px;line-height:1.85}
.ac-s1{font-size:17.5px;line-height:1.9}
.ac-s2{font-size:19.5px;line-height:1.95}
@media (max-width:640px){.ac-s1{font-size:16.5px}.ac-s2{font-size:18px}}
.ac-a{border-radius:.25rem;font-weight:600;color:var(--ac-skd);text-decoration:underline;text-decoration-color:rgba(2,132,199,.35);text-underline-offset:4px;overflow-wrap:anywhere;transition:color .2s ease,text-decoration-color .2s ease}
.ac-a:hover{color:var(--ac-ink);text-decoration-color:var(--ac-sky)}
.ac-strong{font-weight:700;color:var(--ac-ink)}
.ac-em{font-style:italic;color:var(--ac-skd)}
.ac-code{padding:.1em .45em;border-radius:.5rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em;color:var(--ac-skd);background:var(--ac-sk1)}
.ac-inimg{display:block;width:auto;height:auto;max-width:100%;max-height:24rem;margin:.75rem 0;border-radius:1rem;border:1px solid var(--ac-line)}

/* lead paragraph */
.ac-lead{overflow:hidden;padding:1.25rem 1.3rem 1.25rem 1.6rem;background:linear-gradient(135deg,#fff,var(--ac-sk0))}
.ac-lead::before{content:"";position:absolute;inset:0 auto 0 0;width:4px;background:linear-gradient(180deg,#38bdf8,#0284c7)}
.ac-lead p{font-size:1.06em;font-weight:500;color:var(--ac-ink)}

/* headings */
.ac-h2wrap{padding-top:2rem;scroll-margin-top:5rem}
.ac-h2row{display:flex;align-items:flex-start;gap:.9rem;padding-bottom:.9rem;border-bottom:1px solid var(--ac-line)}
.ac-num{flex:none;display:grid;place-items:center;width:2.5rem;height:2.5rem;border-radius:.8rem;font-family:var(--ac-hd);font-size:1rem;font-weight:800;color:var(--ac-skd);background:var(--ac-sk1);border:1px solid #bfe0f7}
.ac-bar{flex:none;width:5px;height:1.8rem;margin-top:.4rem;border-radius:99px;background:linear-gradient(180deg,#38bdf8,#0284c7)}
.ac-h2{font-family:var(--ac-hd);font-size:1.35rem;font-weight:800;line-height:1.4;color:var(--ac-ink)}
@media (min-width:640px){.ac-h2{font-size:1.65rem}}
.ac-sub{margin-top:.3rem;font-size:.95rem;font-weight:600;line-height:1.5;color:var(--ac-skd)}
.ac-h3{display:flex;align-items:center;gap:.65rem;padding-top:.75rem;scroll-margin-top:5rem;font-family:var(--ac-hd);font-size:1.18rem;font-weight:800;line-height:1.45;color:var(--ac-ink)}
.ac-h3::before{content:"";flex:none;width:.4rem;height:1.3rem;border-radius:99px;background:linear-gradient(180deg,#38bdf8,#0284c7)}
.ac-anchor{flex:none;display:grid;place-items:center;width:2.1rem;height:2.1rem;margin-left:auto;border-radius:.7rem;color:var(--ac-mute);border:1px solid var(--ac-line);background:#fff;transition:color .2s ease,border-color .2s ease,opacity .2s ease}
.ac-anchor:hover{color:var(--ac-skd);border-color:#9fd0f3}
@media (hover:hover){.ac-anchor{opacity:0}.ac-h2row:hover .ac-anchor,.ac-anchor:focus-visible{opacity:1}}

/* label cards (rose = red flag, sky = everything else) */
.ac-card{overflow:hidden}
.ac-card-h{display:flex;align-items:center;gap:.65rem;padding:.75rem 1.1rem;border-bottom:1px solid var(--ac-line)}
.ac-sky .ac-card-h{background:rgba(224,242,254,.55)}
.ac-rose .ac-card-h{background:rgba(255,228,232,.6);border-bottom-color:#fdd5db}
.ac-ico{flex:none;display:grid;place-items:center;width:1.9rem;height:1.9rem;border-radius:.6rem;background:#fff;color:var(--ac-skd);border:1px solid var(--ac-line)}
.ac-rose .ac-ico{color:var(--ac-rose);border-color:#fdd5db}
.ac-card-t{font-family:var(--ac-hd);font-size:1.05rem;font-weight:800;line-height:1.4;color:var(--ac-ink)}
.ac-card-b{padding:1rem 1.1rem;color:var(--ac-tx)}

/* tick-able checklist */
.ac-steps{display:grid;gap:.75rem;padding:.9rem}
.ac-steps-h{display:flex;align-items:center;gap:.8rem;padding:0 .3rem;font-size:.85rem;font-weight:700;color:var(--ac-skd)}
.ac-meter{flex:1;max-width:9rem;height:6px;overflow:hidden;border-radius:99px;background:#d6e9f8}
.ac-meter i{display:block;height:100%;border-radius:inherit;background:var(--ac-sky);transition:width .5s cubic-bezier(.22,1,.36,1)}
.ac-steps-list{display:grid;gap:.55rem}
.ac-step{position:relative;display:flex;align-items:flex-start;gap:.85rem;padding:.8rem 1rem;border-radius:1rem;border:1px solid var(--ac-line);background:#fff;color:var(--ac-ink);cursor:pointer;transition:border-color .2s ease}
.ac-step:hover{border-color:#9fd0f3}
.ac-step input{position:absolute;width:1px;height:1px;margin:0;opacity:0;pointer-events:none}
.ac-box{flex:none;display:grid;place-items:center;width:1.6rem;height:1.6rem;margin-top:.12rem;border-radius:50%;border:2px solid #9fd0f3;background:#fff;font-size:.75rem;font-weight:800;color:var(--ac-skd);transition:background .25s ease,border-color .25s ease,color .25s ease}
.ac-c{display:none}
.ac-step input:checked~.ac-box{border-color:var(--ac-sky);background:var(--ac-sky);color:#fff}
.ac-step input:checked~.ac-box .ac-n{display:none}
.ac-step input:checked~.ac-box .ac-c{display:inline}
.ac-step input:checked~.ac-stx{opacity:.6;text-decoration:line-through;text-decoration-color:rgba(2,132,199,.5)}
.ac-step input:focus-visible~.ac-box{outline:2px solid var(--ac-sky);outline-offset:3px}

/* chat bubble + callout */
.ac-chat{padding:1rem 1.1rem;border-radius:.4rem 1.25rem 1.25rem 1.25rem}
.ac-chat-t{font-weight:500;color:var(--ac-ink)}
.ac-chip{display:inline-flex;align-items:center;gap:.4rem;padding:.25rem .7rem;border-radius:99px;font-size:.75rem;font-weight:700;color:var(--ac-skd);background:#fff;border:1px solid #bfe0f7}
.ac-ghost{display:inline-flex;align-items:center;justify-content:center;gap:.35rem;padding:.3rem .75rem;border-radius:99px;font-size:.75rem;font-weight:700;color:var(--ac-tx);background:#fff;border:1px solid var(--ac-line);transition:color .2s ease,border-color .2s ease}
.ac-ghost:hover{color:var(--ac-skd);border-color:#9fd0f3}
.ac-callout{padding:1rem 1.1rem 1rem 1.25rem;border-left:4px solid var(--ac-sky)}
.ac-badge{display:inline-block;margin-right:.55rem;padding:.1rem .65rem;border-radius:.55rem;font-weight:800;color:var(--ac-skd);background:#fff;border:1px solid #bfe0f7}
.ac-callout-t{font-weight:500;color:var(--ac-ink)}

/* call to action */
.ac-cta{overflow:hidden;padding:1.75rem 1.25rem;text-align:center;border-radius:1.5rem;border-color:#bfe0f7;background:linear-gradient(135deg,#e0f2fe,#fff 55%,#e0f2fe)}
.ac-cta-t{font-family:var(--ac-hd);font-size:1.2rem;font-weight:800;line-height:1.5;color:var(--ac-ink)}
.ac-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.75rem 1.5rem;border-radius:99px;font-size:.95rem;font-weight:700;color:#fff;background:var(--ac-skd);box-shadow:0 12px 24px -14px rgba(3,105,161,.8);transition:background .2s ease,transform .25s ease}
.ac-btn:hover{background:#075985}
.ac-btn-sm{padding:.45rem 1rem;font-size:.82rem;box-shadow:none}

/* lists, quote, figure, rule */
.ac-list{display:grid;gap:.85rem;padding:1rem 1.1rem}
.ac-list>li{display:flex;align-items:flex-start;gap:.8rem}
.ac-dot{flex:none;width:.5rem;height:.5rem;margin-top:.7em;border-radius:50%;background:var(--ac-sky)}
.ac-oln{flex:none;display:grid;place-items:center;min-width:1.7rem;height:1.7rem;margin-top:.2rem;padding:0 .3rem;border-radius:.6rem;font-size:.8rem;font-weight:800;color:var(--ac-skd);background:var(--ac-sk1)}
.ac-quote{overflow:hidden;padding:1.1rem 1.25rem 1.1rem 1.55rem;font-weight:500;color:var(--ac-ink)}
.ac-quote::before{content:"";position:absolute;inset:0 auto 0 0;width:4px;background:linear-gradient(180deg,#38bdf8,#0284c7)}
.ac-quote::after{content:"“";position:absolute;right:.9rem;top:-.3rem;font-family:Georgia,serif;font-size:4.5rem;line-height:1;color:rgba(56,189,248,.3);pointer-events:none}
.ac-fig{overflow:hidden;margin:.5rem 0;padding:.5rem;border-radius:1.5rem}
.ac-fig img{display:block;width:100%;height:auto;border-radius:1.1rem}
.ac-fig figcaption{padding:.65rem .5rem .2rem;text-align:center;font-size:.875rem;color:var(--ac-mute)}
.ac-hr{height:1px;margin:.5rem 0;border:0;background:linear-gradient(90deg,transparent,#bfe0f7,transparent)}

/* top progress bar */
.ac-topbar{position:fixed;top:0;left:0;right:0;z-index:60;height:3px;pointer-events:none;transform-origin:0 50%;will-change:transform;background:linear-gradient(90deg,#38bdf8,#0284c7)}

/* toolbar */
.ac-toolbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem;margin-bottom:1.1rem;padding:.6rem .7rem .6rem 1rem;border-radius:1.25rem}
.ac-live{display:inline-flex;align-items:center;gap:.55rem;font-size:.85rem;font-weight:700;color:var(--ac-ink)}
.ac-pulse{width:.5rem;height:.5rem;border-radius:50%;background:var(--ac-sky);box-shadow:0 0 0 4px rgba(56,189,248,.25);animation:ac-pulse 2.6s ease-in-out infinite}
@keyframes ac-pulse{50%{box-shadow:0 0 0 8px rgba(56,189,248,0)}}
.ac-tools{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem}
.ac-listen-grp{display:inline-flex;align-items:center;gap:.4rem}
.ac-listen{display:inline-flex;align-items:center;gap:.4rem;height:2.3rem;padding:0 .95rem;border-radius:99px;font-size:.82rem;font-weight:700;color:#fff;background:var(--ac-skd);transition:background .2s ease}
.ac-listen:hover{background:#075985}
.ac-seg{display:inline-flex;gap:.15rem;padding:.2rem;border-radius:99px;background:#e6f2fb}
.ac-segb{min-width:2.3rem;height:2rem;padding:0 .6rem;border-radius:99px;font-weight:800;line-height:1;color:var(--ac-mute);transition:background .2s ease,color .2s ease,box-shadow .2s ease}
.ac-segb:hover{color:var(--ac-ink)}
.ac-segb[aria-pressed="true"]{color:var(--ac-ink);background:#fff;box-shadow:0 1px 2px rgba(15,23,42,.1),0 4px 10px -4px rgba(2,132,199,.35)}

/* resume banner */
.ac-resume{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem;margin-bottom:1.25rem;padding:.8rem 1rem}
.ac-resume p{font-size:.9rem;font-weight:600;color:var(--ac-ink)}
.ac-resume-b{display:flex;align-items:center;gap:.5rem}

/* in-article contents */
.ac-toc{margin-bottom:1.5rem;padding:1.1rem}
.ac-toc-h{display:flex;align-items:center;justify-content:space-between;gap:.75rem;width:100%;text-align:left}
.ac-toc-t{display:flex;align-items:center;gap:.65rem;font-family:var(--ac-hd);font-size:1.05rem;font-weight:800;color:var(--ac-ink)}
.ac-toc-c{display:inline-flex;align-items:center;gap:.55rem;font-size:.78rem;font-weight:600;color:var(--ac-mute)}
.ac-chev{display:inline-block;width:.5rem;height:.5rem;margin-top:-.2rem;border:solid currentColor;border-width:0 2px 2px 0;transform:rotate(45deg);transition:transform .4s cubic-bezier(.22,1,.36,1),margin .4s ease}
.ac-toc-h[aria-expanded="true"] .ac-chev{margin-top:.2rem;transform:rotate(-135deg)}
.ac-toc-body{display:grid;grid-template-rows:0fr;transition:grid-template-rows .45s cubic-bezier(.22,1,.36,1)}
.ac-toc-body[data-open="true"]{grid-template-rows:1fr}
.ac-toc-in{min-height:0;overflow:hidden;visibility:hidden;transition:visibility 0s linear .45s}
.ac-toc-body[data-open="true"] .ac-toc-in{visibility:visible;transition-delay:0s}
.ac-toc-list{display:grid;gap:.5rem;padding-top:1rem}
@media (min-width:640px){.ac-toc-list{grid-template-columns:1fr 1fr}}
.ac-toc-a{display:flex;align-items:center;gap:.7rem;height:100%;padding:.55rem .75rem;border-radius:.9rem;font-size:.9rem;font-weight:500;line-height:1.35;color:var(--ac-tx);border:1px solid var(--ac-line);background:#fff;transition:border-color .2s ease,background .2s ease}
.ac-toc-a:hover{border-color:#9fd0f3}
.ac-toc-a[aria-current="location"]{color:var(--ac-ink);font-weight:700;background:var(--ac-sk1);border-color:#9fd0f3}
.ac-toc-n{flex:none;display:grid;place-items:center;width:1.7rem;height:1.7rem;border-radius:.55rem;font-size:.75rem;font-weight:800;color:var(--ac-skd);background:var(--ac-sk1)}
.ac-toc-x{min-width:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

/* progress ring (dock + side rail) */
.ac-ring{position:relative;flex:none;display:grid;place-items:center;width:2.6rem;height:2.6rem;border-radius:50%;background:conic-gradient(var(--ac-sky) calc(var(--p) * 1%),#dcecf8 0)}
.ac-ring::before{content:"";position:absolute;inset:4px;border-radius:50%;background:#fff}
.ac-ring b{position:relative;font-size:.7rem;font-weight:800;color:var(--ac-ink)}

/* floating dock (phones / tablets) */
.ac-dockwrap{position:sticky;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);z-index:30;display:flex;justify-content:center;margin-top:1.5rem;pointer-events:none;opacity:0;visibility:hidden;transform:translateY(14px);transition:opacity .35s ease,transform .45s cubic-bezier(.22,1,.36,1),visibility 0s linear .45s}
.ac-dockwrap[data-show="true"]{opacity:1;visibility:visible;transform:none;transition-delay:0s}
.ac-dock{position:relative;pointer-events:auto;display:flex;align-items:center;gap:.5rem;width:min(100%,26rem);padding:.4rem;border-radius:99px;border:1px solid var(--ac-line);background:rgba(255,255,255,.9);-webkit-backdrop-filter:blur(14px) saturate(1.4);backdrop-filter:blur(14px) saturate(1.4);box-shadow:0 18px 36px -18px rgba(2,132,199,.5),0 2px 6px rgba(15,23,42,.06)}
.ac-dock-b{display:flex;flex:1;align-items:center;justify-content:space-between;gap:.5rem;min-width:0;padding:.3rem .7rem;border-radius:99px;text-align:left;color:var(--ac-ink)}
.ac-dock-t{display:grid;min-width:0}
.ac-dock-t span{overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font-size:.85rem;font-weight:700}
.ac-dock-t small{font-size:.72rem;font-weight:600;color:var(--ac-mute)}
.ac-flip{transform:rotate(180deg)}
.ac-up{flex:none;display:grid;place-items:center;width:2.4rem;height:2.4rem;border-radius:50%;color:#fff;background:var(--ac-skd);transition:background .2s ease}
.ac-up:hover{background:#075985}
.ac-sheet{position:absolute;left:0;right:0;bottom:calc(100% + .7rem);display:grid;gap:.3rem;max-height:min(50vh,22rem);overflow:auto;padding:.5rem;border-radius:1.25rem;border:1px solid var(--ac-line);background:#fff;box-shadow:0 24px 48px -20px rgba(2,132,199,.45);transform-origin:bottom center;animation:ac-pop .3s cubic-bezier(.22,1,.36,1) both}
@keyframes ac-pop{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}
.ac-sheet-i{display:flex;align-items:center;gap:.7rem;padding:.5rem .6rem;border-radius:.9rem;font-size:.88rem;font-weight:600;line-height:1.35;text-align:left;color:var(--ac-tx)}
.ac-sheet-i:hover{background:var(--ac-sk0)}
.ac-sheet-i[aria-current="location"]{color:var(--ac-ink);background:var(--ac-sk1)}

/* desktop side rail (sticky "On this page") */
.ac-rail{display:none}
.ac-rail-top{display:flex;align-items:center;gap:.75rem}
.ac-rail-meta strong{display:block;font-size:.95rem;font-weight:800;color:var(--ac-ink)}
.ac-rail-meta span{font-size:.78rem;color:var(--ac-mute)}
.ac-rail-h{font-size:.8rem;font-weight:700;color:var(--ac-mute)}
.ac-rail-l{display:grid;gap:.1rem;margin-top:.5rem;border-left:2px solid var(--ac-line)}
.ac-rail-a{display:block;margin-left:-2px;padding:.4rem .7rem;border-left:2px solid transparent;font-size:.84rem;font-weight:500;line-height:1.4;color:var(--ac-mute);transition:color .2s ease,border-color .2s ease,background .2s ease}
.ac-rail-a:hover{color:var(--ac-ink)}
.ac-rail-a[aria-current="location"]{color:var(--ac-skd);font-weight:700;border-left-color:var(--ac-sky);background:rgba(224,242,254,.5)}
@media (min-width:1360px){
  .ac-rail{display:block;position:absolute;top:0;bottom:0;left:100%;width:15rem;margin-left:2rem}
  .ac-rail-in{position:sticky;top:1.5rem;display:grid;gap:1rem;max-height:calc(100vh - 3rem);overflow:auto;padding:1rem}
  .ac-dockwrap,.ac-toc{display:none}
}

@media (hover:hover){.ac-btn:hover{transform:translateY(-2px)}}
@media print{.ac-toolbar,.ac-toc,.ac-rail,.ac-dockwrap,.ac-topbar,.ac-resume,.ac-anchor{display:none!important}.ac-tile{box-shadow:none}}
@media (prefers-reduced-transparency:reduce){.ac-dock{background:#fff;-webkit-backdrop-filter:none;backdrop-filter:none}}
@media (prefers-reduced-motion:reduce){.ac-pulse,.ac-sheet{animation:none}.ac-root *{transition:none!important}}
`;

const FALLBACK_PILL =
  "inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-sky-400 hover:text-sky-700";

const SIZE_KEY = "vx-reader-size";
const RESUME_KEY = "vx-resume:";

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

function countWords(text: string): number {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function timeLeft(pct: number, mins: number): string {
  if (pct >= 98) return "Finished";
  const left = Math.max(1, Math.ceil(mins * (1 - pct / 100)));
  return `${left} min left`;
}

function motion(): ScrollBehavior {
  return typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
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
        {arrow && <Icon name="arrowRight" size={16} />}
      </Link>
    );
  }
  if (isExternal) {
    return (
      <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
        {label}
        {arrow && <Icon name="external" size={16} />}
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
      parts.push(
        <img
          key={key}
          src={m[2]}
          alt={m[1] || "Article image"}
          loading="lazy"
          decoding="async"
          className="ac-inimg"
        />
      );
    } else if (m[4] !== undefined) {
      // Link (label may contain bold / italic / code)
      parts.push(renderLink(renderInline(m[3], `${key}-l`), m[4], key, "ac-a"));
    } else if (m[5] !== undefined) {
      // Bold (may contain links)
      parts.push(
        <strong key={key} className="ac-strong">
          {renderInline(m[5], `${key}-b`)}
        </strong>
      );
    } else if (m[6] !== undefined) {
      parts.push(
        <em key={key} className="ac-em">
          {m[6]}
        </em>
      );
    } else if (m[7] !== undefined) {
      parts.push(
        <code key={key} className="ac-code">
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

/** true for `ms` milliseconds after flash() is called (copy feedback). */
function useFlash(ms = 2000) {
  const [on, setOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const flash = useCallback(() => {
    setOn(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOn(false), ms);
  }, [ms]);

  return [on, flash] as const;
}

/* ═══════════════════════════════ Parser ═══════════════════════════════ */

export type ParsedBlock =
  | { t: "h2"; num?: string; title: string; subtitle?: string; id: string }
  | { t: "h3"; text: string; id: string }
  | { t: "lead"; text: string }
  | { t: "p"; text: string }
  | { t: "ul"; items: string[] }
  | { t: "ol"; items: string[]; start: number }
  | { t: "steps"; items: string[] }
  | { t: "quote"; text: string }
  | { t: "chat"; text: string }
  | { t: "cta"; text: string }
  | { t: "labelCard"; label: string; body: string; icon: IconName }
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

function pickCardIcon(label: string): IconName {
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
    return "flag";
  }
  if (
    l.includes("गेम चेंजर") ||
    l.includes("ब्रह्मास्त्र") ||
    l.includes("सीक्रेट") ||
    l.includes("हाई-पॉइंट") ||
    l.includes("निकनेम")
  ) {
    return "zap";
  }
  return "star";
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

/** Collects consecutive list lines (blank lines between items are allowed). */
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
  let hasLead = false;

  const pushH2 = (h: { num?: string; title: string; subtitle?: string }) => {
    hCount += 1;
    const id = `section-${hCount}`;
    toc.push({
      id,
      num: h.num,
      text: stripMd(h.subtitle ? `${h.title}: ${h.subtitle}` : h.title),
    });
    blocks.push({ t: "h2", num: h.num, title: h.title, subtitle: h.subtitle, id });
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
      const run = collectRun(rawLines, i, ORDERED_RE, (l) => matchNumberedHeading(l) === null);
      if (run.items.length >= 2) {
        expectChecklistSteps = false;
        blocks.push({ t: "ol", items: run.items, start: parseInt(line, 10) || 1 });
        i = run.next;
        continue;
      }
    }

    // 10. Smart subheading (short line ending in "!" or 🏆🚀🔥✨💓🎯⚡)
    if (isSmartSubheading(line)) {
      expectChecklistSteps = false;
      hCount += 1;
      blocks.push({ t: "h3", text: line.replace(/\*\*/g, "").trim(), id: `sub-${hCount}` });
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

    // 14. First paragraph (only images / dividers before it) = editorial lead
    const asLead = !hasLead && blocks.every((x) => x.t === "img" || x.t === "hr");
    if (asLead) hasLead = true;
    blocks.push(asLead ? { t: "lead", text: line } : { t: "p", text: line });
    i++;
  }

  return { blocks, toc };
}

/* ═════════════════════ Listen (text-to-speech) ═════════════════════ */

/** Turns the parsed article into short, speakable chunks (long utterances get cut off by some browsers). */
function toSpeech(blocks: ParsedBlock[]): string[] {
  const out: string[] = [];

  const add = (raw: string) => {
    const clean = stripMd(raw)
      .replace(/[\u{1F000}-\u{1FAFF}\u2600-\u27BF\uFE0F]/gu, "")
      .replace(/\s+/g, " ")
      .trim();
    if (!clean) return;

    const parts = clean.match(/[^।.!?]+[।.!?]*/g) ?? [clean];
    let buf = "";
    for (const p of parts) {
      if (buf && (buf + p).length > 180) {
        out.push(buf.trim());
        buf = p;
      } else {
        buf += p;
      }
    }
    if (buf.trim()) out.push(buf.trim());
  };

  for (const b of blocks) {
    switch (b.t) {
      case "h2":
        add(b.subtitle ? `${b.title}. ${b.subtitle}` : b.title);
        break;
      case "h3":
      case "lead":
      case "p":
      case "quote":
      case "chat":
        add(b.text);
        break;
      case "ul":
      case "ol":
      case "steps":
        b.items.forEach(add);
        break;
      case "labelCard":
        add(`${b.label}. ${b.body}`);
        break;
      case "callout":
        add(`${b.badge} ${b.body}`);
        break;
      default:
        break;
    }
  }
  return out;
}

type SpeechStatus = "idle" | "playing" | "paused";

function useSpeech(chunks: string[]) {
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [supported, setSupported] = useState(false);
  const session = useRef(0);
  const pos = useRef(0);

  useEffect(() => {
    setSupported(typeof window !== "undefined" && "speechSynthesis" in window);
    return () => {
      session.current += 1;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const start = useCallback(
    (from: number) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window) || !chunks.length) return;
      const synth = window.speechSynthesis;
      const mine = ++session.current;
      synth.cancel();

      const run = (i: number) => {
        if (mine !== session.current) return;
        if (i >= chunks.length) {
          pos.current = 0;
          setStatus("idle");
          return;
        }
        pos.current = i;
        const u = new SpeechSynthesisUtterance(chunks[i]);
        u.lang = /[\u0900-\u097F]/.test(chunks[i]) ? "hi-IN" : "en-IN";
        u.rate = 0.95;
        u.onend = () => run(i + 1);
        u.onerror = () => {
          if (mine === session.current) setStatus("idle");
        };
        synth.speak(u);
      };

      run(from);
      setStatus("playing");
    },
    [chunks]
  );

  const pause = useCallback(() => {
    session.current += 1;
    window.speechSynthesis.cancel();
    setStatus("paused");
  }, []);

  const stop = useCallback(() => {
    session.current += 1;
    window.speechSynthesis.cancel();
    pos.current = 0;
    setStatus("idle");
  }, []);

  const toggle = useCallback(() => {
    if (status === "playing") pause();
    else if (status === "paused") start(pos.current);
    else start(0);
  }, [status, pause, start]);

  return { supported, status, toggle, stop };
}

/* ═════════════════════════ Small client widgets ═════════════════════════ */

/** Style it from outside with `className` (e.g. the page's share pill). */
export function CopyLinkButton({ url, className }: { url: string; className?: string }) {
  const [copied, flash] = useFlash();

  const onClick = async () => {
    if (await copyToClipboard(url)) flash();
  };

  return (
    <>
      <button type="button" onClick={onClick} className={className ?? FALLBACK_PILL}>
        <Icon name={copied ? "check" : "link"} />
        {copied ? "Link copied" : "Copy link"}
      </button>
      <span className="sr-only" role="status">
        {copied ? "Link copied" : ""}
      </span>
    </>
  );
}

/** Phone's native share sheet — only shown where the browser supports it. */
export function NativeShareButton({
  url,
  title,
  className,
}: {
  url: string;
  title: string;
  className?: string;
}) {
  const [can, setCan] = useState(false);

  useEffect(() => {
    setCan(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  if (!can) return null;

  const onClick = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      // user closed the share sheet
    }
  };

  return (
    <button type="button" onClick={onClick} className={className ?? FALLBACK_PILL}>
      <Icon name="share" />
      Share
    </button>
  );
}

function SectionLink({ id }: { id: string }) {
  const [copied, flash] = useFlash();

  const onClick = async () => {
    const { origin, pathname, search } = window.location;
    if (await copyToClipboard(`${origin}${pathname}${search}#${id}`)) flash();
  };

  return (
    <>
      <button
        type="button"
        onClick={onClick}
        className="ac-anchor"
        aria-label="Copy link to this section"
        title="Copy link to this section"
      >
        <Icon name={copied ? "check" : "link"} size={14} />
      </button>
      <span className="sr-only" role="status">
        {copied ? "Section link copied" : ""}
      </span>
    </>
  );
}

function ChatBlock({ text, k }: { text: string; k: string }) {
  const [copied, flash] = useFlash();

  const onCopy = async () => {
    const clean = stripMd(text).replace(/^["“”]+|["“”]+$/g, "");
    if (await copyToClipboard(clean)) flash();
  };

  return (
    <div className="ac-tile ac-sky ac-chat">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="ac-chip">
          <Icon name="chat" size={13} />
          Chat example
        </span>
        <button type="button" onClick={onCopy} className="ac-ghost">
          <Icon name={copied ? "check" : "copy"} size={13} />
          {copied ? "Copied" : "Copy line"}
        </button>
      </div>
      <p className="ac-chat-t">{renderInline(text, k)}</p>
      <span className="sr-only" role="status">
        {copied ? "Line copied" : ""}
      </span>
    </div>
  );
}

function StepsBlock({ items, k }: { items: string[]; k: string }) {
  const [done, setDone] = useState<boolean[]>(() => items.map(() => false));
  const count = done.filter(Boolean).length;
  const pct = Math.round((count / Math.max(items.length, 1)) * 100);
  const toggle = (j: number) => setDone((d) => d.map((v, i) => (i === j ? !v : v)));

  return (
    <div className="ac-tile ac-sky ac-steps">
      <div className="ac-steps-h">
        <span>
          Checklist: {count} of {items.length} done
        </span>
        <span className="ac-meter" aria-hidden="true">
          <i style={{ width: `${pct}%` }} />
        </span>
        {count > 0 && (
          <button
            type="button"
            className="ac-ghost"
            onClick={() => setDone(items.map(() => false))}
          >
            <Icon name="reset" size={13} />
            Reset
          </button>
        )}
      </div>
      <ol role="list" className="ac-steps-list">
        {items.map((item, j) => (
          <li key={j}>
            <label className="ac-step">
              <input type="checkbox" checked={!!done[j]} onChange={() => toggle(j)} />
              <span className="ac-box" aria-hidden="true">
                <span className="ac-n">{j + 1}</span>
                <span className="ac-c">✓</span>
              </span>
              <span className="ac-stx min-w-0 flex-1">{renderInline(item, `${k}-stp-${j}`)}</span>
            </label>
          </li>
        ))}
      </ol>
      <span className="sr-only" role="status">
        {count} of {items.length} complete
      </span>
    </div>
  );
}

function TocCard({ toc, activeId }: { toc: TocItem[]; activeId: string }) {
  const [open, setOpen] = useState(true);

  return (
    <nav aria-label="Table of contents" className="ac-tile ac-sky ac-toc">
      <button
        type="button"
        className="ac-toc-h"
        aria-expanded={open}
        aria-controls="ac-toc-list"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ac-toc-t">
          <span className="ac-ico" aria-hidden="true">
            <Icon name="list" size={16} />
          </span>
          In this article
        </span>
        <span className="ac-toc-c">
          <span>{toc.length} sections</span>
          <span className="ac-chev" aria-hidden="true" />
        </span>
      </button>
      <div className="ac-toc-body" data-open={open}>
        <div className="ac-toc-in">
          <ol id="ac-toc-list" role="list" className="ac-toc-list">
            {toc.map((item, idx) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="ac-toc-a"
                  aria-current={item.id === activeId ? "location" : undefined}
                >
                  <span className="ac-toc-n">{item.num ? item.num.padStart(2, "0") : idx + 1}</span>
                  <span className="ac-toc-x">{item.text}</span>
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </nav>
  );
}

type Reading = { pct: number; active: string; visible: boolean };

/** Scroll progress + current section (rAF-throttled, state only changes when a value changes). */
function useReadingProgress(bodyRef: RefObject<HTMLDivElement | null>, toc: TocItem[]): Reading {
  const [state, setState] = useState<Reading>({ pct: 0, active: "", visible: false });

  useEffect(() => {
    let raf = 0;

    const calc = () => {
      raf = 0;
      const el = bodyRef.current;
      if (!el) return;

      const vh = window.innerHeight;
      const r = el.getBoundingClientRect();
      const raw = (vh * 0.4 - r.top) / Math.max(r.height, 1);
      const pct = Math.round(Math.min(1, Math.max(0, raw)) * 100);

      let active = "";
      for (const t of toc) {
        const h = document.getElementById(t.id);
        if (!h) continue;
        if (h.getBoundingClientRect().top <= vh * 0.3) active = t.id;
        else break;
      }

      const visible = r.top < -160 && r.bottom > vh * 0.4;
      setState((s) =>
        s.pct === pct && s.active === active && s.visible === visible ? s : { pct, active, visible }
      );
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(calc);
    };

    calc();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [bodyRef, toc]);

  return state;
}

function ReadingDock({
  pct,
  visible,
  toc,
  activeId,
  label,
}: {
  pct: number;
  visible: boolean;
  toc: TocItem[];
  activeId: string;
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasSheet = toc.length >= 2;
  const active = toc.find((t) => t.id === activeId);

  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const goTop = () => window.scrollTo({ top: 0, behavior: motion() });
  const goTo = (id: string) => {
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: motion(), block: "start" });
  };

  return (
    <div className="ac-dockwrap" data-show={visible}>
      <div ref={ref} className="ac-dock">
        {open && hasSheet && (
          <div className="ac-sheet" role="dialog" aria-label="Article sections">
            {toc.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                className="ac-sheet-i"
                aria-current={t.id === activeId ? "location" : undefined}
                onClick={() => goTo(t.id)}
              >
                <span className="ac-toc-n">{t.num ? t.num.padStart(2, "0") : idx + 1}</span>
                <span className="min-w-0 flex-1">{t.text}</span>
              </button>
            ))}
          </div>
        )}

        <div
          className="ac-ring"
          style={{ "--p": pct } as CSSProperties}
          role="img"
          aria-label={`${pct}% read`}
        >
          <b>{pct}</b>
        </div>

        <button
          type="button"
          className="ac-dock-b"
          onClick={() => (hasSheet ? setOpen((o) => !o) : goTop())}
          aria-expanded={hasSheet ? open : undefined}
          aria-haspopup={hasSheet ? "dialog" : undefined}
        >
          <span className="ac-dock-t">
            <span>{hasSheet ? (active ? active.text : "Start of article") : `${pct}% read`}</span>
            <small>{label}</small>
          </span>
          {hasSheet && <Icon name="chevron" size={16} className={open ? undefined : "ac-flip"} />}
        </button>

        <button type="button" className="ac-up" onClick={goTop} aria-label="Back to top">
          <Icon name="up" size={16} />
        </button>
      </div>
    </div>
  );
}

function SideRail({
  pct,
  label,
  toc,
  activeId,
}: {
  pct: number;
  label: string;
  toc: TocItem[];
  activeId: string;
}) {
  const goTop = () => window.scrollTo({ top: 0, behavior: motion() });

  return (
    <aside className="ac-rail" aria-label="Reading progress and contents">
      <div className="ac-tile ac-rail-in">
        <div className="ac-rail-top">
          <div
            className="ac-ring"
            style={{ "--p": pct } as CSSProperties}
            role="img"
            aria-label={`${pct}% read`}
          >
            <b>{pct}</b>
          </div>
          <div className="ac-rail-meta">
            <strong>{pct}% read</strong>
            <span>{label}</span>
          </div>
        </div>

        {toc.length >= 2 && (
          <nav aria-label="On this page">
            <p className="ac-rail-h">On this page</p>
            <ol role="list" className="ac-rail-l">
              {toc.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    className="ac-rail-a"
                    aria-current={t.id === activeId ? "location" : undefined}
                  >
                    <span className="ac-toc-x">{t.text}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <button type="button" className="ac-ghost" onClick={goTop}>
          <Icon name="up" size={13} />
          Back to top
        </button>
      </div>
    </aside>
  );
}

/* ═══════════════════════════════ Block renderer ═══════════════════════════════ */

function renderBlock(b: ParsedBlock, idx: number): ReactNode {
  const k = `blk-${idx}`;

  switch (b.t) {
    case "lead":
      return (
        <div key={k} className="ac-tile ac-lead">
          <p>{renderInline(b.text, k)}</p>
        </div>
      );

    case "h2":
      return (
        <div key={k} id={b.id} className="ac-h2wrap">
          <div className="ac-h2row">
            {b.num ? (
              <span className="ac-num">{b.num.padStart(2, "0")}</span>
            ) : (
              <span className="ac-bar" aria-hidden="true" />
            )}
            <div className="min-w-0 flex-1">
              <h2 className="ac-h2">{renderInline(b.title, `${k}-t`)}</h2>
              {b.subtitle && <p className="ac-sub">{renderInline(b.subtitle, `${k}-s`)}</p>}
            </div>
            <SectionLink id={b.id} />
          </div>
        </div>
      );

    case "h3":
      return (
        <h3 key={k} id={b.id} className="ac-h3">
          <span className="min-w-0">{renderInline(b.text, k)}</span>
        </h3>
      );

    case "labelCard": {
      const tone = b.icon === "flag" ? "rose" : "sky";
      return (
        <div key={k} className={`ac-tile ac-${tone} ac-card`}>
          <div className="ac-card-h">
            <span className="ac-ico" aria-hidden="true">
              <Icon name={b.icon} size={16} />
            </span>
            <h4 className="ac-card-t">{renderInline(b.label, `${k}-lbl`)}</h4>
          </div>
          <div className="ac-card-b">{renderInline(b.body, `${k}-body`)}</div>
        </div>
      );
    }

    case "steps":
      return <StepsBlock key={k} items={b.items} k={k} />;

    case "chat":
      return <ChatBlock key={k} text={b.text} k={k} />;

    case "callout":
      return (
        <div key={k} className="ac-tile ac-sky ac-callout">
          <span className="ac-badge">{b.badge}</span>
          <span className="ac-callout-t">{renderInline(b.body, k)}</span>
        </div>
      );

    case "cta": {
      const { plain, links } = splitCta(b.text);
      return (
        <div key={k} className="ac-tile ac-cta">
          {plain && <p className="ac-cta-t">{renderInline(plain, `${k}-t`)}</p>}
          {links.length > 0 && (
            <div
              className={`flex flex-wrap items-center justify-center gap-3 ${plain ? "mt-5" : ""}`}
            >
              {links.map((l, j) => renderLink(l.label, l.href, `${k}-btn-${j}`, "ac-btn", true))}
            </div>
          )}
        </div>
      );
    }

    case "ul":
      return (
        <ul key={k} role="list" className="ac-tile ac-list">
          {b.items.map((item, j) => (
            <li key={j}>
              <span className="ac-dot" aria-hidden="true" />
              <span className="min-w-0 flex-1">{renderInline(item, `${k}-${j}`)}</span>
            </li>
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol key={k} start={b.start} role="list" className="ac-tile ac-list">
          {b.items.map((item, j) => (
            <li key={j}>
              <span className="ac-oln" aria-hidden="true">
                {b.start + j}
              </span>
              <span className="min-w-0 flex-1">{renderInline(item, `${k}-${j}`)}</span>
            </li>
          ))}
        </ol>
      );

    case "quote":
      return (
        <blockquote key={k} className="ac-tile ac-sky ac-quote">
          {renderInline(b.text, k)}
        </blockquote>
      );

    case "img":
      return (
        <figure key={k} className="ac-tile ac-fig">
          <img src={b.src} alt={b.alt} loading="lazy" decoding="async" />
          {b.alt && <figcaption>{b.alt}</figcaption>}
        </figure>
      );

    case "hr":
      return <hr key={k} className="ac-hr" />;

    case "p":
    default:
      return (
        <p key={k} className="whitespace-pre-line">
          {renderInline(b.text, k)}
        </p>
      );
  }
}

/* ═══════════════════════════════ Component ═══════════════════════════════ */

/**
 * `articleId` (the post slug) is optional — when passed, the reader's position is
 * remembered in their own browser so they can continue where they left off.
 */
export default function ArticleContent({
  content,
  articleId,
}: {
  content: string;
  articleId?: string;
}) {
  const [size, setSize] = useState<0 | 1 | 2>(1);
  const [resume, setResume] = useState<number | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  const { blocks, toc } = useMemo(() => parseArticleContent(content), [content]);
  // Body elements are memoised: scroll-progress updates never re-render the article text
  const nodes = useMemo(() => blocks.map((b, i) => renderBlock(b, i)), [blocks]);
  const chunks = useMemo(() => toSpeech(blocks), [blocks]);
  const totalMins = useMemo(() => Math.max(1, Math.ceil(countWords(stripMd(content)) / 200)), [content]);

  const reading = useReadingProgress(bodyRef, toc);
  const speech = useSpeech(chunks);
  const label = timeLeft(reading.pct, totalMins);

  // Saved text size
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SIZE_KEY);
      if (saved === "0" || saved === "1" || saved === "2") setSize(Number(saved) as 0 | 1 | 2);
    } catch {
      // storage blocked — default size is fine
    }
  }, []);

  // Saved reading position
  useEffect(() => {
    if (!articleId) return;
    try {
      const v = Number(window.localStorage.getItem(RESUME_KEY + articleId));
      if (v >= 8 && v <= 92) setResume(Math.round(v));
    } catch {
      // ignore
    }
  }, [articleId]);

  useEffect(() => {
    if (!articleId || reading.pct < 3) return;
    const t = setTimeout(() => {
      try {
        window.localStorage.setItem(RESUME_KEY + articleId, String(reading.pct >= 95 ? 0 : reading.pct));
      } catch {
        // ignore
      }
    }, 600);
    return () => clearTimeout(t);
  }, [articleId, reading.pct]);

  const pick = (v: 0 | 1 | 2) => {
    setSize(v);
    try {
      window.localStorage.setItem(SIZE_KEY, String(v));
    } catch {
      // ignore
    }
  };

  const continueReading = () => {
    const el = bodyRef.current;
    if (!el || resume === null) return;
    const r = el.getBoundingClientRect();
    const y = r.top + window.scrollY + (resume / 100) * r.height - window.innerHeight * 0.4;
    window.scrollTo({ top: Math.max(0, y), behavior: motion() });
    setResume(null);
  };

  const sizes = [
    { v: 0, label: "A−", aria: "Small text", fs: "0.78rem" },
    { v: 1, label: "A", aria: "Normal text", fs: "0.95rem" },
    { v: 2, label: "A+", aria: "Large text", fs: "1.12rem" },
  ] as const;

  return (
    <div className="ac-root">
      <style dangerouslySetInnerHTML={{ __html: AC_CSS }} />

      {/* Top reading progress */}
      <div
        className="ac-topbar"
        aria-hidden="true"
        style={{ transform: `scaleX(${reading.pct / 100})` }}
      />

      {/* Reader toolbar */}
      <div className="ac-tile ac-toolbar">
        <div className="ac-live">
          <span className="ac-pulse" aria-hidden="true" />
          <span>Reader Mode</span>
        </div>

        <div className="ac-tools">
          {speech.supported && chunks.length > 0 && (
            <div className="ac-listen-grp">
              <button
                type="button"
                className="ac-listen"
                onClick={speech.toggle}
                aria-label={
                  speech.status === "playing"
                    ? "Pause listening"
                    : speech.status === "paused"
                      ? "Resume listening"
                      : "Listen to this article"
                }
              >
                <Icon name={speech.status === "playing" ? "pause" : "headphones"} size={15} />
                {speech.status === "playing" ? "Pause" : speech.status === "paused" ? "Resume" : "Listen"}
              </button>
              {speech.status !== "idle" && (
                <button
                  type="button"
                  className="ac-ghost"
                  onClick={speech.stop}
                  aria-label="Stop listening"
                >
                  <Icon name="stop" size={13} />
                  Stop
                </button>
              )}
            </div>
          )}

          <div className="ac-seg" role="group" aria-label="Text size">
            {sizes.map((s) => (
              <button
                key={s.v}
                type="button"
                className="ac-segb"
                style={{ fontSize: s.fs }}
                onClick={() => pick(s.v)}
                aria-pressed={size === s.v}
                aria-label={s.aria}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table of contents (hidden on wide screens — the side rail takes over) */}
      {toc.length >= 2 && <TocCard toc={toc} activeId={reading.active} />}

      {/* Continue where you left off */}
      {resume !== null && reading.pct < 3 && (
        <div className="ac-tile ac-sky ac-resume" role="status">
          <p>Welcome back! You stopped at {resume}%.</p>
          <div className="ac-resume-b">
            <button type="button" className="ac-btn ac-btn-sm" onClick={continueReading}>
              Continue reading
            </button>
            <button type="button" className="ac-ghost" onClick={() => setResume(null)}>
              Start over
            </button>
          </div>
        </div>
      )}

      {/* Article body */}
      <div ref={bodyRef} className={`ac-body ac-s${size} flex flex-col gap-6`}>
        {nodes}
      </div>

      {/* Floating progress + section jumper (phones / tablets) */}
      <ReadingDock
        pct={reading.pct}
        visible={reading.visible}
        toc={toc}
        activeId={reading.active}
        label={label}
      />

      {/* Sticky side rail (wide screens) */}
      <SideRail pct={reading.pct} label={label} toc={toc} activeId={reading.active} />
    </div>
  );
}
