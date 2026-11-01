/* eslint-disable @next/next/no-img-element */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode, RefObject } from "react";
import Link from "next/link";

/* ═════════════ Theme: white · light pink · light sky — glass tiles + raised ("ubhre hue") text ═════════════ */

const AC_CSS = `
.ac-root{--ac-ink:#232a4a;--ac-ink2:#414a70;--ac-ink3:#5b6488;--ac-pkd:#c2306f;--ac-skd:#1f6fb5;--ac-hd:var(--font-vx-display),var(--font-vx-body),'Noto Sans Devanagari',ui-sans-serif,sans-serif;color:var(--ac-ink2)}
.ac-root :is(a,button,input):focus-visible{outline:2px solid var(--ac-skd);outline-offset:3px}
.ac-root button{cursor:pointer}

/* tiles (nested glass: no backdrop-filter, parent panel already blurs) */
.ac-tile{position:relative;border-radius:1.25rem;border:1px solid rgba(255,255,255,.95);background:linear-gradient(145deg,rgba(255,255,255,.84),rgba(255,255,255,.5));box-shadow:0 14px 30px -20px rgba(110,130,220,.5),inset 0 1px 0 #fff,inset 0 0 20px rgba(255,255,255,.35)}
.ac-tile-pk{background:linear-gradient(145deg,rgba(255,241,248,.94),rgba(255,214,232,.5))}
.ac-tile-sk{background:linear-gradient(145deg,rgba(241,249,255,.96),rgba(207,233,255,.52))}

/* body text */
.ac-body{color:var(--ac-ink2);overflow-wrap:break-word;text-shadow:0 1px 0 rgba(255,255,255,.95),0 2px 8px rgba(110,130,200,.14);transition:font-size .3s ease}
.ac-s0{font-size:16px;line-height:1.85}
.ac-s1{font-size:17.5px;line-height:1.9}
.ac-s2{font-size:19.5px;line-height:1.95}
@media (max-width:640px){.ac-s1{font-size:16.5px}.ac-s2{font-size:18px}}
.ac-a{border-radius:.25rem;font-weight:600;color:var(--ac-pkd);text-decoration:underline;text-decoration-color:rgba(194,48,111,.3);text-underline-offset:4px;overflow-wrap:anywhere;transition:color .25s ease,text-decoration-color .25s ease}
.ac-a:hover{color:var(--ac-skd);text-decoration-color:rgba(31,111,181,.5)}
.ac-strong{font-weight:700;color:var(--ac-ink);text-shadow:0 1px 0 #fff,0 3px 8px rgba(236,120,180,.22)}
.ac-em{font-style:italic;color:var(--ac-pkd)}
.ac-code{padding:.1em .45em;border-radius:.5rem;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em;color:var(--ac-pkd);background:rgba(249,168,212,.22);text-shadow:none}
.ac-inimg{display:block;width:auto;height:auto;max-width:100%;max-height:24rem;margin:.75rem 0;border-radius:1rem;border:1px solid #fff;box-shadow:0 18px 36px -22px rgba(100,130,220,.6)}

/* lead */
.ac-lead{overflow:hidden;padding:1.2rem 1.2rem 1.2rem 1.55rem}
.ac-lead::before{content:"";position:absolute;inset:0 auto 0 0;width:5px;background:linear-gradient(180deg,#ffa3cd,#8fd0ff)}
.ac-lead p{font-size:1.08em;font-weight:500;line-height:1.9;color:var(--ac-ink)}

/* headings */
.ac-h2wrap{padding-top:2rem;scroll-margin-top:6rem}
.ac-h2row{position:relative;display:flex;align-items:flex-start;gap:.9rem;padding-bottom:1rem}
.ac-h2row::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;border-radius:2px;background:linear-gradient(90deg,rgba(255,163,205,.9),rgba(143,208,255,.9) 55%,transparent)}
.ac-num{flex:none;display:grid;place-items:center;width:2.6rem;height:2.6rem;border-radius:.9rem;font-family:var(--ac-hd);font-size:1.1rem;font-weight:800;color:var(--ac-ink);border:1.5px solid #fff;background:linear-gradient(145deg,#ffd0e5,#c4e5ff);box-shadow:0 12px 20px -10px rgba(236,120,180,.6),inset 0 2px 3px rgba(255,255,255,.9),inset 0 -3px 6px rgba(120,150,230,.2);text-shadow:0 1px 0 rgba(255,255,255,.9)}
.ac-bar{flex:none;width:6px;height:1.9rem;margin-top:.45rem;border-radius:99px;background:linear-gradient(180deg,#ffa3cd,#8fd0ff);box-shadow:0 6px 12px -4px rgba(255,150,200,.6)}
.ac-h2{font-family:var(--ac-hd);font-size:1.4rem;font-weight:800;line-height:1.35;color:var(--ac-ink);text-shadow:0 1px 0 #fff,0 4px 10px rgba(236,120,180,.22),0 12px 24px rgba(110,170,240,.28)}
@media (min-width:640px){.ac-h2{font-size:1.7rem}}
.ac-sub{margin-top:.35rem;font-weight:600;line-height:1.4;color:var(--ac-skd)}
.ac-h3{display:flex;align-items:center;gap:.65rem;padding-top:1rem;scroll-margin-top:6rem;font-family:var(--ac-hd);font-size:1.2rem;font-weight:800;line-height:1.4;color:var(--ac-pkd);text-shadow:0 1px 0 #fff,0 4px 10px rgba(236,120,180,.25)}
.ac-h3::before{content:"";flex:none;width:.7rem;height:.7rem;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,#ff9ac6 55%,#ec6aa8);box-shadow:0 4px 8px -1px rgba(236,120,180,.6)}
.ac-anchor{flex:none;display:grid;place-items:center;width:2.1rem;height:2.1rem;margin-left:auto;border-radius:50%;font-size:.85rem;border:1px solid #fff;background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(255,255,255,.6));box-shadow:0 8px 14px -8px rgba(120,140,220,.6),inset 0 1px 0 #fff;transition:transform .35s cubic-bezier(.22,1,.36,1)}

/* label cards (pink = red flag, sky = everything else) */
.ac-card{overflow:hidden}
.ac-card-h{display:flex;align-items:center;gap:.65rem;padding:.8rem 1.1rem;border-bottom:1px solid rgba(255,255,255,.9)}
.ac-tile-pk .ac-card-h{background:linear-gradient(90deg,rgba(255,206,228,.75),rgba(255,230,242,.3))}
.ac-tile-sk .ac-card-h{background:linear-gradient(90deg,rgba(190,225,255,.75),rgba(225,242,255,.3))}
.ac-ico{flex:none;display:grid;place-items:center;width:1.9rem;height:1.9rem;border-radius:.65rem;background:rgba(255,255,255,.88);box-shadow:0 6px 12px -6px rgba(120,140,220,.6),inset 0 1px 0 #fff}
.ac-card-t{font-family:var(--ac-hd);font-size:1.08rem;font-weight:800;line-height:1.35;text-shadow:0 1px 0 #fff,0 3px 8px rgba(120,140,220,.25)}
.ac-tile-pk .ac-card-t{color:var(--ac-pkd)}
.ac-tile-sk .ac-card-t{color:var(--ac-skd)}
.ac-card-b{padding:1rem 1.1rem;color:var(--ac-ink)}

/* tick-able checklist */
.ac-steps{display:grid;gap:.75rem;padding:.9rem}
.ac-steps-h{display:flex;align-items:center;justify-content:space-between;gap:.9rem;padding:0 .3rem;font-size:.85rem;font-weight:700;color:var(--ac-skd);text-shadow:0 1px 0 #fff}
.ac-meter{flex:1;max-width:9rem;height:6px;overflow:hidden;border-radius:99px;background:rgba(255,255,255,.85);box-shadow:inset 0 1px 2px rgba(120,140,220,.3)}
.ac-meter i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#ffa3cd,#8fd0ff);transition:width .6s cubic-bezier(.22,1,.36,1)}
.ac-steps-list{display:grid;gap:.6rem}
.ac-step{position:relative;display:flex;align-items:flex-start;gap:.85rem;padding:.85rem 1rem;border-radius:1rem;border:1px solid #fff;background:linear-gradient(145deg,rgba(255,255,255,.92),rgba(255,255,255,.6));box-shadow:0 8px 18px -12px rgba(110,130,220,.55),inset 0 1px 0 #fff;color:var(--ac-ink);cursor:pointer;transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease}
.ac-step input{position:absolute;width:1px;height:1px;margin:0;opacity:0;pointer-events:none}
.ac-box{flex:none;display:grid;place-items:center;width:1.6rem;height:1.6rem;margin-top:.12rem;border-radius:50%;border:2px solid #f3a7cb;background:#fff;font-size:.75rem;font-weight:800;color:var(--ac-pkd);text-shadow:none;transition:background .35s ease,border-color .35s ease,color .35s ease,box-shadow .35s ease}
.ac-c{display:none}
.ac-step input:checked~.ac-box{border-color:#fff;color:#fff;background:linear-gradient(135deg,#ff9ac6,#8fd0ff);box-shadow:0 6px 12px -4px rgba(236,120,180,.6)}
.ac-step input:checked~.ac-box .ac-n{display:none}
.ac-step input:checked~.ac-box .ac-c{display:inline}
.ac-step input:checked~.ac-stx{opacity:.6;text-decoration:line-through;text-decoration-color:rgba(194,48,111,.5)}
.ac-step input:focus-visible~.ac-box{outline:2px solid var(--ac-skd);outline-offset:3px}

/* chat bubble + callout */
.ac-chat{padding:1rem 1.1rem;border-radius:.35rem 1.25rem 1.25rem 1.25rem}
.ac-chat-t{font-weight:500;font-style:italic;color:var(--ac-ink)}
.ac-chip{display:inline-flex;align-items:center;gap:.35rem;padding:.25rem .75rem;border-radius:99px;font-size:.75rem;font-weight:700;color:var(--ac-pkd);border:1px solid #fff;background:linear-gradient(135deg,rgba(255,238,247,.96),rgba(255,206,228,.62));box-shadow:0 6px 14px -8px rgba(236,120,180,.6),inset 0 1px 0 #fff;text-shadow:0 1px 0 #fff}
.ac-ghost{padding:.3rem .8rem;border-radius:99px;font-size:.75rem;font-weight:700;color:var(--ac-ink2);border:1px solid #fff;background:linear-gradient(135deg,rgba(255,255,255,.95),rgba(255,255,255,.6));box-shadow:0 6px 12px -8px rgba(120,140,220,.6),inset 0 1px 0 #fff;text-shadow:0 1px 0 #fff;transition:transform .3s cubic-bezier(.22,1,.36,1),color .25s ease}
.ac-ghost:hover{color:var(--ac-pkd)}
.ac-callout{padding:1rem 1.1rem 1rem 1.25rem;border-left:4px solid #ff9ac6}
.ac-badge{display:inline-block;margin-right:.55rem;padding:.12rem .7rem;border-radius:.6rem;font-weight:800;color:var(--ac-ink);border:1px solid #fff;background:linear-gradient(135deg,#ffc2dd,#c4e5ff);box-shadow:0 6px 12px -6px rgba(236,120,180,.6),inset 0 1px 0 rgba(255,255,255,.9);text-shadow:0 1px 0 rgba(255,255,255,.9)}
.ac-callout-t{font-weight:500;color:var(--ac-ink)}

/* call to action */
.ac-cta{overflow:hidden;padding:1.75rem 1.25rem;text-align:center;border-radius:1.75rem;background:linear-gradient(135deg,rgba(255,214,232,.85),rgba(255,255,255,.78) 50%,rgba(196,228,255,.85))}
.ac-cta::before,.ac-cta::after{content:"";position:absolute;z-index:0;width:12rem;height:12rem;border-radius:50%;pointer-events:none}
.ac-cta::before{right:-3rem;top:-4rem;background:radial-gradient(circle,rgba(255,170,212,.55),transparent 68%)}
.ac-cta::after{left:-3rem;bottom:-4rem;background:radial-gradient(circle,rgba(150,210,255,.55),transparent 68%)}
.ac-cta>*{position:relative;z-index:1}
.ac-cta-t{font-family:var(--ac-hd);font-size:1.25rem;font-weight:800;line-height:1.5;color:var(--ac-ink);text-shadow:0 1px 0 #fff,0 4px 10px rgba(236,120,180,.22),0 10px 22px rgba(110,170,240,.28)}
.ac-btn{display:inline-flex;align-items:center;justify-content:center;gap:.5rem;padding:.7rem 1.45rem;border-radius:99px;font-size:.95rem;font-weight:800;color:var(--ac-ink);border:1px solid #fff;background:linear-gradient(135deg,#ffd0e5,#fff 50%,#c9e7ff);box-shadow:0 14px 26px -14px rgba(236,120,180,.7),0 6px 14px -8px rgba(100,170,240,.6),inset 0 1px 0 #fff;text-shadow:0 1px 0 #fff,0 3px 8px rgba(236,120,180,.25);transition:transform .4s cubic-bezier(.22,1,.36,1),box-shadow .4s ease}

/* lists, quote, figure, rule */
.ac-list{display:grid;gap:.85rem;padding:1rem 1.1rem}
.ac-list>li{display:flex;align-items:flex-start;gap:.8rem}
.ac-dot{flex:none;width:.6rem;height:.6rem;margin-top:.72em;border-radius:50%;background:radial-gradient(circle at 30% 30%,#fff,#ff9ac6 55%,#ec6aa8);box-shadow:0 3px 6px -1px rgba(236,120,180,.6)}
.ac-oln{flex:none;display:grid;place-items:center;min-width:1.7rem;height:1.7rem;margin-top:.2rem;padding:0 .3rem;border-radius:.6rem;font-size:.8rem;font-weight:800;color:var(--ac-pkd);border:1px solid #fff;background:linear-gradient(135deg,#fff0f7,#ffd6e8);box-shadow:inset 0 1px 0 #fff,0 4px 8px -4px rgba(236,120,180,.5);text-shadow:none}
.ac-quote{overflow:hidden;padding:1.1rem 1.25rem 1.1rem 1.55rem;font-style:italic;color:var(--ac-ink)}
.ac-quote::before{content:"";position:absolute;inset:0 auto 0 0;width:5px;background:linear-gradient(180deg,#8fd0ff,#ffa3cd)}
.ac-quote::after{content:"“";position:absolute;right:.9rem;top:-.3rem;font-family:Georgia,serif;font-size:4.5rem;line-height:1;color:rgba(143,208,255,.5);pointer-events:none}
.ac-fig{overflow:hidden;margin:.5rem 0;padding:.5rem;border-radius:1.5rem}
.ac-fig img{display:block;width:100%;height:auto;border-radius:1.1rem}
.ac-fig figcaption{padding:.65rem .5rem .2rem;text-align:center;font-size:.875rem;color:var(--ac-ink3)}
.ac-hr{height:2px;margin:.5rem 0;border:0;border-radius:2px;background:linear-gradient(90deg,transparent,rgba(255,163,205,.85),rgba(143,208,255,.85),transparent)}

/* toolbar + contents */
.ac-toolbar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:.75rem;margin-bottom:1.25rem;padding:.65rem .8rem .65rem 1rem;border-radius:1.5rem}
.ac-live{display:inline-flex;align-items:center;gap:.55rem;font-size:.85rem;font-weight:600;color:var(--ac-ink2);text-shadow:0 1px 0 #fff}
.ac-pulse{width:.55rem;height:.55rem;border-radius:50%;background:linear-gradient(135deg,#ff8fc0,#7cc6ff);box-shadow:0 0 0 4px rgba(255,163,205,.28);animation:ac-pulse 2.6s ease-in-out infinite}
@keyframes ac-pulse{50%{box-shadow:0 0 0 9px rgba(255,163,205,0)}}
.ac-seg{display:inline-flex;gap:.2rem;padding:.22rem;border-radius:99px;border:1px solid #fff;background:rgba(255,255,255,.6);box-shadow:inset 0 2px 5px rgba(120,140,220,.2)}
.ac-segb{min-width:2.3rem;height:2.1rem;padding:0 .65rem;border-radius:99px;font-weight:800;line-height:1;color:var(--ac-ink3);text-shadow:0 1px 0 #fff;transition:background .35s ease,box-shadow .35s ease,color .25s ease}
.ac-segb:hover{color:var(--ac-pkd)}
.ac-segb[aria-pressed="true"]{color:var(--ac-ink);background:linear-gradient(135deg,#ffd0e5,#c9e7ff);box-shadow:0 8px 14px -8px rgba(236,120,180,.7),inset 0 1px 0 #fff}
.ac-toc{margin-bottom:2.25rem;padding:1.1rem}
.ac-toc-h{display:flex;align-items:center;justify-content:space-between;gap:.75rem;width:100%;text-align:left}
.ac-toc-t{display:flex;align-items:center;gap:.65rem;font-family:var(--ac-hd);font-size:1.08rem;font-weight:800;color:var(--ac-ink);text-shadow:0 1px 0 #fff,0 4px 10px rgba(236,120,180,.22),0 10px 20px rgba(110,170,240,.25)}
.ac-toc-c{display:inline-flex;align-items:center;gap:.55rem;font-size:.78rem;font-weight:600;color:var(--ac-ink3);text-shadow:0 1px 0 #fff}
.ac-chev{display:inline-block;width:.5rem;height:.5rem;margin-top:-.2rem;border:solid currentColor;border-width:0 2px 2px 0;transform:rotate(45deg);transition:transform .45s cubic-bezier(.22,1,.36,1),margin .45s ease}
.ac-toc-h[aria-expanded="true"] .ac-chev{margin-top:.2rem;transform:rotate(-135deg)}
.ac-toc-body{display:grid;grid-template-rows:0fr;transition:grid-template-rows .5s cubic-bezier(.22,1,.36,1)}
.ac-toc-body[data-open="true"]{grid-template-rows:1fr}
.ac-toc-in{min-height:0;overflow:hidden;visibility:hidden;transition:visibility 0s linear .5s}
.ac-toc-body[data-open="true"] .ac-toc-in{visibility:visible;transition-delay:0s}
.ac-toc-list{display:grid;gap:.6rem;padding-top:1rem}
@media (min-width:640px){.ac-toc-list{grid-template-columns:1fr 1fr}}
.ac-toc-a{display:flex;align-items:center;gap:.7rem;height:100%;padding:.6rem .8rem;border-radius:1rem;font-size:.9rem;font-weight:500;line-height:1.35;color:var(--ac-ink2);border:1px solid #fff;background:linear-gradient(145deg,rgba(255,255,255,.9),rgba(255,255,255,.55));box-shadow:0 8px 16px -12px rgba(110,130,220,.6),inset 0 1px 0 #fff;text-shadow:0 1px 0 #fff;transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease,color .25s ease}
.ac-toc-a[aria-current="location"]{color:var(--ac-ink);background:linear-gradient(135deg,rgba(255,214,232,.92),rgba(207,233,255,.92));box-shadow:0 10px 20px -12px rgba(236,120,180,.7),inset 0 1px 0 #fff}
.ac-toc-n{flex:none;display:grid;place-items:center;width:1.7rem;height:1.7rem;border-radius:.6rem;font-size:.75rem;font-weight:800;color:var(--ac-pkd);background:linear-gradient(135deg,#fff0f7,#ffd6e8);box-shadow:inset 0 1px 0 #fff,0 4px 8px -4px rgba(236,120,180,.5);text-shadow:none}
.ac-toc-x{min-width:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}

/* floating reading dock (sticky, sirf article ke andar) */
.ac-dockwrap{position:sticky;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);z-index:30;display:flex;justify-content:center;margin-top:1.5rem;pointer-events:none;opacity:0;visibility:hidden;transform:translateY(14px);transition:opacity .4s ease,transform .5s cubic-bezier(.22,1,.36,1),visibility 0s linear .5s}
.ac-dockwrap[data-show="true"]{opacity:1;visibility:visible;transform:none;transition-delay:0s}
.ac-dock{position:relative;pointer-events:auto;display:flex;align-items:center;gap:.5rem;width:min(100%,25rem);padding:.4rem;border-radius:99px;border:1px solid rgba(255,255,255,.95);background:linear-gradient(135deg,rgba(255,255,255,.9),rgba(255,255,255,.62));-webkit-backdrop-filter:blur(16px) saturate(1.6);backdrop-filter:blur(16px) saturate(1.6);box-shadow:0 22px 40px -18px rgba(110,130,220,.6),0 8px 18px -10px rgba(244,114,182,.4),inset 0 1px 0 #fff}
.ac-ring{position:relative;flex:none;display:grid;place-items:center;width:2.6rem;height:2.6rem;border-radius:50%;background:conic-gradient(#ff9ac6 0deg,#8fd0ff calc(var(--p) * 1%),rgba(255,255,255,.8) 0deg)}
.ac-ring::before{content:"";position:absolute;inset:4px;border-radius:50%;background:linear-gradient(145deg,#fff,#f3f9ff);box-shadow:inset 0 2px 4px rgba(120,140,220,.2)}
.ac-ring b{position:relative;font-size:.7rem;font-weight:800;color:var(--ac-ink);text-shadow:0 1px 0 #fff}
.ac-dock-b{display:flex;flex:1;align-items:center;gap:.5rem;min-width:0;padding:.4rem .6rem;border-radius:99px;font-size:.85rem;font-weight:700;text-align:left;color:var(--ac-ink);text-shadow:0 1px 0 #fff}
.ac-dock-b span:first-child{min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.ac-up{flex:none;display:grid;place-items:center;width:2.4rem;height:2.4rem;border-radius:50%;font-weight:800;color:var(--ac-ink);border:1px solid #fff;background:linear-gradient(135deg,#ffd0e5,#c9e7ff);box-shadow:0 10px 18px -10px rgba(236,120,180,.7),inset 0 1px 0 #fff;transition:transform .35s cubic-bezier(.22,1,.36,1)}
.ac-sheet{position:absolute;left:0;right:0;bottom:calc(100% + .7rem);display:grid;gap:.4rem;max-height:min(50vh,22rem);overflow:auto;padding:.55rem;border-radius:1.5rem;border:1px solid rgba(255,255,255,.95);background:linear-gradient(145deg,rgba(255,255,255,.95),rgba(255,246,251,.9));box-shadow:0 26px 50px -20px rgba(110,130,220,.6),inset 0 1px 0 #fff;transform-origin:bottom center;animation:ac-pop .35s cubic-bezier(.22,1,.36,1) both}
@keyframes ac-pop{from{opacity:0;transform:translateY(8px) scale(.97)}to{opacity:1;transform:none}}
.ac-sheet-i{display:flex;align-items:center;gap:.7rem;padding:.55rem .65rem;border-radius:1rem;font-size:.88rem;font-weight:600;line-height:1.35;text-align:left;color:var(--ac-ink2);text-shadow:0 1px 0 #fff}
.ac-sheet-i[aria-current="location"]{color:var(--ac-ink);background:linear-gradient(135deg,rgba(255,214,232,.9),rgba(207,233,255,.9))}

@media (hover:hover){
  .ac-step:hover,.ac-toc-a:hover{transform:translateY(-2px);box-shadow:0 14px 22px -12px rgba(236,120,180,.55),inset 0 1px 0 #fff}
  .ac-toc-a:hover{color:var(--ac-pkd)}
  .ac-btn:hover{transform:translateY(-3px);box-shadow:0 24px 36px -16px rgba(236,120,180,.75),0 10px 22px -10px rgba(100,170,240,.6),inset 0 1px 0 #fff}
  .ac-ghost:hover,.ac-anchor:hover,.ac-up:hover{transform:translateY(-2px)}
  .ac-sheet-i:hover{background:rgba(255,214,232,.5)}
}
@media (prefers-reduced-transparency:reduce){.ac-dock{background:rgba(255,255,255,.97);-webkit-backdrop-filter:none;backdrop-filter:none}}
@media (prefers-reduced-motion:reduce){.ac-pulse,.ac-sheet{animation:none}.ac-root *{transition:none!important}}
`;

const FALLBACK_PILL =
  "rounded-full border border-white bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md";

const SIZE_KEY = "vx-reader-size";

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
        {arrow && <span aria-hidden="true">→</span>}
      </Link>
    );
  }
  if (isExternal) {
    return (
      <a key={key} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
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

/* ═════════════════════════ Small client widgets ═════════════════════════ */

/** Style it from outside with `className` (e.g. the page's glass pill). */
export function CopyLinkButton({ url, className }: { url: string; className?: string }) {
  const [copied, flash] = useFlash();

  const onClick = async () => {
    if (await copyToClipboard(url)) flash();
  };

  return (
    <>
      <button type="button" onClick={onClick} className={className ?? FALLBACK_PILL}>
        {copied ? "✓ Link copy ho gaya" : "🔗 Link copy karo"}
      </button>
      <span className="sr-only" role="status">
        {copied ? "Link copy ho gaya" : ""}
      </span>
    </>
  );
}

/** Phone ka native share sheet — sirf wahin dikhta hai jahan browser support kare. */
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
      📤 Share karo
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
        aria-label="Is section ka link copy karo"
        title="Section ka link copy karo"
      >
        <span aria-hidden="true">{copied ? "✓" : "🔗"}</span>
      </button>
      <span className="sr-only" role="status">
        {copied ? "Section ka link copy ho gaya" : ""}
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
    <div className="ac-tile ac-tile-pk ac-chat">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <span className="ac-chip">💬 Chat example</span>
        <button type="button" onClick={onCopy} className="ac-ghost">
          {copied ? "✓ Copy ho gaya" : "📋 Line copy karo"}
        </button>
      </div>
      <p className="ac-chat-t">{renderInline(text, k)}</p>
      <span className="sr-only" role="status">
        {copied ? "Line copy ho gayi" : ""}
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
    <div className="ac-tile ac-tile-sk ac-steps">
      <div className="ac-steps-h">
        <span>
          ✅ Checklist: {count}/{items.length} pura
        </span>
        <span className="ac-meter" aria-hidden="true">
          <i style={{ width: `${pct}%` }} />
        </span>
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
        {count} / {items.length} complete
      </span>
    </div>
  );
}

function TocCard({ toc, activeId }: { toc: TocItem[]; activeId: string }) {
  const [open, setOpen] = useState(true);

  return (
    <nav aria-label="Table of contents" className="ac-tile ac-tile-pk ac-toc">
      <button
        type="button"
        className="ac-toc-h"
        aria-expanded={open}
        aria-controls="ac-toc-list"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ac-toc-t">
          <span className="ac-ico" aria-hidden="true">
            📌
          </span>
          Is article ke mukhya raaz
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
}: {
  pct: number;
  visible: boolean;
  toc: TocItem[];
  activeId: string;
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
          <div className="ac-sheet" role="dialog" aria-label="Article ke sections">
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
          aria-label={`${pct}% padha`}
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
          <span>{hasSheet ? (active ? active.text : "Article shuru") : `${pct}% padha`}</span>
          {hasSheet && <span className="ac-chev" aria-hidden="true" style={{ transform: open ? "rotate(-135deg)" : "rotate(45deg)" }} />}
        </button>

        <button type="button" className="ac-up" onClick={goTop} aria-label="Upar jao">
          ↑
        </button>
      </div>
    </div>
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
      const tone = b.icon === "🚩" ? "pk" : "sk";
      return (
        <div key={k} className={`ac-tile ac-tile-${tone} ac-card`}>
          <div className="ac-card-h">
            <span className="ac-ico" aria-hidden="true">
              {b.icon}
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
        <div key={k} className="ac-tile ac-tile-pk ac-callout">
          <span className="ac-badge">{b.badge}</span>
          <span className="ac-callout-t">{renderInline(b.body, k)}</span>
        </div>
      );

    case "cta": {
      const { plain, links } = splitCta(b.text);
      return (
        <div key={k} className="ac-tile ac-cta">
          {plain && (
            <p className="ac-cta-t">
              <span aria-hidden="true">👉 </span>
              {renderInline(plain, `${k}-t`)}
            </p>
          )}
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
        <blockquote key={k} className="ac-tile ac-tile-sk ac-quote">
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

export default function ArticleContent({ content }: { content: string }) {
  const [size, setSize] = useState<0 | 1 | 2>(1);
  const bodyRef = useRef<HTMLDivElement>(null);

  const { blocks, toc } = useMemo(() => parseArticleContent(content), [content]);
  // Body elements are memoised: scroll-progress updates never re-render the article text
  const nodes = useMemo(() => blocks.map((b, i) => renderBlock(b, i)), [blocks]);
  const reading = useReadingProgress(bodyRef, toc);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SIZE_KEY);
      if (saved === "0" || saved === "1" || saved === "2") setSize(Number(saved) as 0 | 1 | 2);
    } catch {
      // storage blocked — default size is fine
    }
  }, []);

  const pick = (v: 0 | 1 | 2) => {
    setSize(v);
    try {
      window.localStorage.setItem(SIZE_KEY, String(v));
    } catch {
      // ignore
    }
  };

  const sizes = [
    { v: 0, label: "A−", aria: "Chhota text", fs: "0.78rem" },
    { v: 1, label: "A", aria: "Normal text", fs: "0.95rem" },
    { v: 2, label: "A+", aria: "Bada text", fs: "1.12rem" },
  ] as const;

  return (
    <div className="ac-root">
      <style dangerouslySetInnerHTML={{ __html: AC_CSS }} />

      {/* Reader toolbar */}
      <div className="ac-tile ac-toolbar">
        <div className="ac-live">
          <span className="ac-pulse" aria-hidden="true" />
          <span>Reader Mode</span>
        </div>
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

      {/* Table of contents */}
      {toc.length >= 2 && <TocCard toc={toc} activeId={reading.active} />}

      {/* Article body */}
      <div ref={bodyRef} className={`ac-body ac-s${size} flex flex-col gap-6`}>
        {nodes}
      </div>

      {/* Floating progress + section jumper */}
      <ReadingDock pct={reading.pct} visible={reading.visible} toc={toc} activeId={reading.active} />
    </div>
  );
}
