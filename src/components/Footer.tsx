// @ts-nocheck
'use client'; // Ye lagana zaroori hai kyunki hum current page/route check kar rahe hain

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// ---------------------------------------------------------------------------
// TIME-BASED LOOK: din ke time ke hisab se footer ka glow colour aur greeting badalta hai.
// (subah / din / shaam / raat) — har 1 minute me sirf ek chhota check hota hai, website par koi load nahi.
// ---------------------------------------------------------------------------
const GREETINGS = {
  morning: 'शुभ प्रभात',
  day: 'नमस्कार',
  evening: 'शुभ संध्या',
  night: 'शुभ रात्रि',
};

const getPhase = (hour) => {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 16) return 'day';
  if (hour >= 16 && hour < 19) return 'evening';
  return 'night';
};

// Quick Explore & SEO Links (Google Search Console me Internal Linking aur Indexing ke liye zaroori)
const EXPLORE_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/blog', label: 'Vedoxa Blog', isNew: true },
  { href: '/about', label: 'About Us' },
  { href: '/support', label: 'Help Center' },
];

// Legal links (same pages, same names as before) + Blog + Help & Support
const LEGAL_LINKS = [
  { href: '/blog', label: 'Vedoxa Blog', highlight: true },
  { href: '/contact', label: 'Contact Us' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/refund', label: 'Refund & Cancellation' },
  { href: '/support', label: 'Help & Support' },
];

// ---------------------------------------------------------------------------
// SUPPORT BOT (Veda): sirf footer ke andar rehta hai. Page ke upar / side me koi floating bot nahi hai.
// User scroll karke footer tak aata hai tabhi bot uchhal kar aata hai aur haath hilata hai.
// ---------------------------------------------------------------------------
const BOT_ROUTE = '/support';
const BLOG_ROUTE = '/blog';

// ---------------------------------------------------------------------------
// PERFORMANCE RULES used in all animations below:
//  - sirf transform + opacity animate hote hain (GPU par chalte hain, page ko slow nahi karte)
//  - koi heavy blur / backdrop-filter / drop-shadow animation nahi
//  - footer screen se bahar ho to saari animation pause ho jati hai
//  - prefers-reduced-motion wale users ke liye animation band
// ---------------------------------------------------------------------------
const FOOTER_CSS = `
@property --vx-a { syntax: '<color>'; inherits: true; initial-value: #6366f1; }
@property --vx-b { syntax: '<color>'; inherits: true; initial-value: #d4921a; }

.vx-footer {
  --vx-a: #6366f1;
  --vx-b: #d4921a;
  transition: --vx-a 4s ease, --vx-b 4s ease;
}
.vx-footer[data-phase=morning] { --vx-a: #f59e0b; --vx-b: #fb7185; }
.vx-footer[data-phase=day]     { --vx-a: #fbbf24; --vx-b: #60a5fa; }
.vx-footer[data-phase=evening] { --vx-a: #f97316; --vx-b: #c026d3; }
.vx-footer[data-phase=night]   { --vx-a: #6366f1; --vx-b: #d4921a; }

/* ---------- Background: slowly drifting glows (different speeds = pattern never repeats exactly) ---------- */
.vx-glow { position: absolute; border-radius: 9999px; pointer-events: none; will-change: transform; }
.vx-glow-a {
  width: min(580px, 95vw); height: min(580px, 95vw); left: -10%; top: -42%; opacity: .18;
  background: radial-gradient(closest-side, var(--vx-a), transparent);
  animation: vx-drift-a 23s ease-in-out infinite alternate;
}
.vx-glow-b {
  width: min(500px, 88vw); height: min(500px, 88vw); right: -8%; bottom: -48%; opacity: .16;
  background: radial-gradient(closest-side, var(--vx-b), transparent);
  animation: vx-drift-b 31s ease-in-out infinite alternate;
}
.vx-glow-c {
  width: min(340px, 72vw); height: min(340px, 72vw); left: 38%; top: 8%; opacity: .09;
  background: radial-gradient(closest-side, #fbbf24, transparent);
  animation: vx-drift-c 41s ease-in-out infinite alternate;
}
@keyframes vx-drift-a { from { transform: translate3d(0, 0, 0) scale(1); }    to { transform: translate3d(34vw, 8%, 0) scale(1.25); } }
@keyframes vx-drift-b { from { transform: translate3d(0, 0, 0) scale(1.1); }  to { transform: translate3d(-30vw, -12%, 0) scale(.9); } }
@keyframes vx-drift-c { from { transform: translate3d(-14vw, 0, 0) scale(1); } to { transform: translate3d(16vw, -10%, 0) scale(1.3); } }

/* faint dotted texture (static, painted once) */
.vx-dots {
  position: absolute; inset: 0; opacity: .55; pointer-events: none;
  background-image: radial-gradient(rgba(255,255,255,.09) 1px, transparent 1.2px);
  background-size: 22px 22px;
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 30%, #000 70%, transparent);
  mask-image: linear-gradient(to bottom, transparent, #000 30%, #000 70%, transparent);
}

/* Floating golden fireflies / ambient particles (GPU transform + opacity only) */
.vx-fireflies { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.vx-fireflies span {
  position: absolute; width: 4px; height: 4px; border-radius: 9999px;
  background: #fde68a; opacity: 0; will-change: transform, opacity;
  animation: vx-sparkle 9s ease-in-out infinite;
}
.vx-fireflies span:nth-child(1) { left: 12%; bottom: 18%; animation-delay: 0s; animation-duration: 8s; }
.vx-fireflies span:nth-child(2) { left: 28%; bottom: 35%; animation-delay: 1.8s; animation-duration: 10.5s; }
.vx-fireflies span:nth-child(3) { left: 52%; bottom: 15%; animation-delay: 3.4s; animation-duration: 9.2s; }
.vx-fireflies span:nth-child(4) { left: 74%; bottom: 28%; animation-delay: 0.9s; animation-duration: 11s; }
.vx-fireflies span:nth-child(5) { left: 88%; bottom: 22%; animation-delay: 2.6s; animation-duration: 8.7s; }
@keyframes vx-sparkle {
  0%, 100% { transform: translate3d(0, 0, 0) scale(.5); opacity: 0; }
  40% { opacity: .65; }
  70% { opacity: .35; }
  95% { transform: translate3d(12px, -65px, 0) scale(1.25); opacity: 0; }
}

/* light that keeps travelling along the top line */
.vx-sweep {
  position: absolute; top: 0; left: 0; height: 1.5px; width: 38%; pointer-events: none; will-change: transform;
  background: linear-gradient(90deg, transparent, var(--vx-b), #fde68a, var(--vx-a), transparent);
  animation: vx-sweep 9s linear infinite;
}
@keyframes vx-sweep { from { transform: translate3d(-100%, 0, 0); } to { transform: translate3d(300%, 0, 0); } }

/* ---------- Soft Luxury Glass Panels ---------- */
.vx-panel {
  position: relative; border-radius: 1.5rem; padding: 1.5rem 1.15rem;
  border: 1px solid rgba(255,255,255,.085);
  background: linear-gradient(180deg, rgba(255,255,255,.048), rgba(255,255,255,.012));
  box-shadow: 0 20px 45px -25px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.08);
  transition: border-color .4s ease, transform .35s cubic-bezier(.22, 1, .36, 1);
}
@media (min-width: 768px) {
  .vx-panel { border-radius: 1.75rem; padding: 2.15rem 2.4rem; }
}
@media (hover: hover) {
  .vx-panel:hover { border-color: rgba(251,191,36,.22); }
}

/* Top subtle highlight beam on each panel */
.vx-panel::after {
  content: ''; position: absolute; top: 0; left: 12%; right: 12%; height: 1px; pointer-events: none;
  background: linear-gradient(90deg, transparent, rgba(253,230,138,.28), transparent);
}

/* Brand: soft white -> gold gradient text with gentle shimmer */
.vx-brand {
  background: linear-gradient(100deg, #ffffff 10%, #fde68a 48%, var(--vx-b) 88%);
  -webkit-background-clip: text; background-clip: text;
  color: transparent; -webkit-text-fill-color: transparent;
}

/* ---------- Greeting pill (changes with time of day) ---------- */
.vx-pill {
  display: inline-flex; align-items: center; gap: .55rem; width: fit-content;
  padding: .34rem .85rem; border-radius: 9999px; font-size: 12px; color: #d4d4d8;
  border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.035);
  animation: vx-fade .8s ease both;
}
.vx-dot { position: relative; width: 6px; height: 6px; border-radius: 9999px; background: var(--vx-b); }
.vx-dot::after {
  content: ''; position: absolute; inset: 0; border-radius: 9999px; background: var(--vx-b);
  animation: vx-ping 2.6s cubic-bezier(0, 0, .2, 1) infinite;
}
@keyframes vx-ping { 0% { transform: scale(1); opacity: .75; } 80%, 100% { transform: scale(3.4); opacity: 0; } }
@keyframes vx-fade { from { opacity: 0; transform: translate3d(0, 6px, 0); } to { opacity: 1; transform: none; } }

/* ---------- VEDOXA BLOG SPOTLIGHT CARD (New SEO + Visual Upgrade) ---------- */
.vx-blog-card {
  position: relative; overflow: hidden; margin-bottom: 1rem; padding: 1.15rem 1.05rem;
  background: linear-gradient(135deg, rgba(251,191,36,.07) 0%, rgba(255,255,255,.03) 52%, rgba(99,102,241,.06) 100%);
}
@media (min-width: 768px) {
  .vx-blog-card { margin-bottom: 1.25rem; padding: 1.45rem 2rem; }
}
.vx-blog-grid {
  display: grid; grid-template-columns: auto 1fr; align-items: center; gap: .9rem 1rem;
}
@media (min-width: 768px) {
  .vx-blog-grid { grid-template-columns: auto 1fr auto; gap: 1.4rem; }
}
.vx-blog-icon {
  position: relative; display: grid; place-items: center; width: 58px; height: 58px; border-radius: 1.1rem;
  border: 1px solid rgba(251,191,36,.3);
  background: radial-gradient(circle at 30% 30%, rgba(253,230,138,.22), rgba(212,146,26,.06));
  color: #fde68a;
}
@media (min-width: 768px) {
  .vx-blog-icon { width: 68px; height: 68px; border-radius: 1.25rem; }
}
.vx-blog-book {
  animation: vb-float 3.8s ease-in-out infinite;
}
.vx-blog-badge {
  display: inline-flex; align-items: center; gap: .4rem; width: fit-content;
  padding: .2rem .65rem; border-radius: 9999px; font-size: 11px; font-weight: 500;
  color: #fde68a; border: 1px solid rgba(251,191,36,.3); background: rgba(251,191,36,.1);
}
.vx-blog-spark {
  width: 6px; height: 6px; border-radius: 9999px; background: #fbbf24;
  animation: vb-pulse 1.8s ease-in-out infinite;
}
.vx-blog-cta {
  position: relative; isolation: isolate; overflow: hidden; grid-column: 1 / -1;
  display: inline-flex; align-items: center; justify-content: center; gap: .55rem;
  width: 100%; min-height: 44px; padding: .7rem 1.2rem; border-radius: 9999px;
  font-size: 13.5px; font-weight: 600; color: #fef3c7;
  border: 1px solid rgba(251,191,36,.45);
  background: linear-gradient(135deg, rgba(251,191,36,.18), rgba(212,146,26,.28));
  -webkit-tap-highlight-color: transparent;
  transition: transform .25s cubic-bezier(.22, 1, .36, 1), border-color .3s ease, background .3s ease, color .3s ease;
}
@media (min-width: 768px) {
  .vx-blog-cta { grid-column: auto; width: auto; padding: .75rem 1.4rem; }
}
.vx-blog-cta:active { transform: scale(.97); }
@media (hover: hover) {
  .vx-blog-cta:hover {
    color: #0a0a0c; border-color: #fde68a;
    background: linear-gradient(135deg, #fde68a, #fbbf24 50%, #d4921a);
    transform: translate3d(0, -2px, 0);
  }
  .vx-blog-cta:hover .vx-btn-arrow { transform: translate3d(3px, -3px, 0); }
}

/* Quick Explore SEO Pills inside Blog Card */
.vx-explore-bar {
  display: flex; flex-wrap: wrap; align-items: center; gap: .45rem;
  margin-top: .95rem; padding-top: .85rem; border-top: 1px solid rgba(255,255,255,.06);
}
.vx-explore-label {
  font-size: 11px; color: #71717a; margin-right: .25rem; font-weight: 500; letter-spacing: .02em;
}
.vx-explore-link {
  display: inline-flex; align-items: center; gap: .35rem;
  padding: .28rem .7rem; border-radius: 9999px; font-size: 11.5px; color: #a1a1aa;
  border: 1px solid rgba(255,255,255,.07); background: rgba(255,255,255,.025);
  transition: color .25s ease, border-color .25s ease, background .25s ease, transform .2s ease;
}
.vx-explore-link:active { transform: scale(.95); }
@media (hover: hover) {
  .vx-explore-link:hover {
    color: #ffffff; border-color: rgba(251,191,36,.45); background: rgba(251,191,36,.1);
    transform: translate3d(0, -1px, 0);
  }
}
.vx-new-tag {
  padding: .05rem .38rem; border-radius: 9999px; font-size: 9.5px; font-weight: 700;
  color: #0a0a0c; background: linear-gradient(135deg, #fde68a, #fbbf24);
}

/* ---------- UNIQUE CLICK BUTTONS: "ink drop" ----------
   Har button me ek chhoti sunehri boond hai. Hover / tap karte hi wo phail kar poore button ko bhar deti hai,
   text dark ho jata hai, arrow ukhad kar aage badhta hai. Idle me boondon ke ird-gird ring ek-ek karke
   chamakti hai (wave), taaki button "click me" bolta rahe. */
.vx-btn.vx-btn {
  position: relative; display: inline-flex; align-items: center; justify-content: center; gap: .6rem;
  isolation: isolate; overflow: hidden;
  padding: .72rem 1.08rem .72rem 1.9rem; border-radius: 9999px; line-height: 1;
  border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.03);
  -webkit-tap-highlight-color: transparent;
  transition: color .35s ease, border-color .35s ease, box-shadow .35s ease, transform .25s cubic-bezier(.22, 1, .36, 1);
}
.vx-btn.vx-btn-highlight {
  border-color: rgba(251,191,36,.35);
  background: rgba(251,191,36,.06);
  color: #fef3c7;
}
.vx-btn::before {
  content: ''; position: absolute; left: .95rem; top: 50%; width: 6px; height: 6px; margin-top: -3px;
  border-radius: 9999px; z-index: -1; will-change: transform;
  background: linear-gradient(135deg, #fde68a, #fbbf24 45%, #d4921a);
  transition: transform .6s cubic-bezier(.22, 1, .36, 1);
}
.vx-btn::after {
  content: ''; position: absolute; left: calc(.95rem - 3px); top: 50%; width: 12px; height: 12px; margin-top: -6px;
  border-radius: 9999px; border: 1px solid rgba(251,191,36,.85); opacity: 0; z-index: -1; pointer-events: none;
  animation: vx-ring 7s ease-out infinite; animation-delay: calc(var(--i, 0) * 1.4s);
}
@keyframes vx-ring { 0% { transform: scale(.6); opacity: .9; } 18%, 100% { transform: scale(2.6); opacity: 0; } }

.vx-btn-arrow { flex: none; transition: transform .35s cubic-bezier(.22, 1, .36, 1); }

@media (hover: hover) {
  .vx-btn.vx-btn:hover { color: #0a0a0c; border-color: rgba(251,191,36,.9); box-shadow: 0 10px 30px -10px rgba(251,191,36,.6); }
  .vx-btn:hover::before { transform: scale(75); }
  .vx-btn:hover::after { animation: none; opacity: 0; }
  .vx-btn:hover .vx-btn-arrow { transform: translate3d(3px, -3px, 0); }
}
/* touch / click press feedback (works on mobile too) */
.vx-btn.vx-btn:active { color: #0a0a0c; border-color: rgba(251,191,36,.9); transform: scale(.95); }
.vx-btn:active::before { transform: scale(75); }
.vx-btn:focus-visible { outline: 2px solid #fbbf24; outline-offset: 3px; }

/* =====================================================================
   SUPPORT BOT "Veda"  (prefix vb-)  — footer support card
   ===================================================================== */
@keyframes vb-float { 0%, 100% { transform: translate3d(0, 0, 0) rotate(-2deg); } 50% { transform: translate3d(0, -6%, 0) rotate(2deg); } }
@keyframes vb-hop   { 0%, 100% { transform: translate3d(0, 0, 0) scale(1); } 50% { transform: translate3d(0, -10%, 0) scale(1.05, .97); } }
@keyframes vb-blink { 0%, 92%, 100% { transform: scaleY(1); } 96% { transform: scaleY(.1); } }
@keyframes vb-look  { 0%, 100% { transform: translate(0, 0); } 20% { transform: translate(-3px, 0); } 45% { transform: translate(3px, -1px); } 70% { transform: translate(2px, 2px); } }
@keyframes vb-wave  { 0%, 62%, 100% { transform: rotate(0); } 68% { transform: rotate(40deg); } 74% { transform: rotate(8deg); } 80% { transform: rotate(40deg); } 86% { transform: rotate(8deg); } 92% { transform: rotate(0); } }
@keyframes vb-pulse { 0%, 100% { opacity: .65; transform: scale(1); } 50% { opacity: 1; transform: scale(1.35); } }
@keyframes vb-spin  { to { transform: rotate(360deg); } }
@keyframes vb-ring  { 0% { transform: scale(1); opacity: .55; } 100% { transform: scale(1.75); opacity: 0; } }
@keyframes vb-ping  { 0% { transform: scale(1); opacity: .7; } 80%, 100% { transform: scale(2.6); opacity: 0; } }
@keyframes vb-enter { from { opacity: 0; transform: translate3d(0, 40%, 0) scale(.6); } to { opacity: 1; transform: none; } }
@keyframes vb-hi    { 0%, 100% { transform: rotate(0); } 20%, 60% { transform: rotate(40deg); } 40%, 80% { transform: rotate(8deg); } }
@keyframes vb-shine { 0%, 55% { transform: translate3d(-130%, 0, 0) skewX(-20deg); } 100% { transform: translate3d(360%, 0, 0) skewX(-20deg); } }
@keyframes vb-hello {
  0%, 15%, 100% { opacity: 0; transform: translate3d(0, 6px, 0) scale(.85); }
  25%, 55% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); }
}

/* the robot itself (inline SVG) */
.vb-face { display: block; width: 100%; height: 100%; }
.vb-bot { display: block; width: 100%; height: 100%; overflow: visible; transform-origin: 50% 100%; animation: vb-float 3.6s ease-in-out infinite; }
.vb-eyes { animation: vb-look 7s ease-in-out infinite; }
.vb-eye { transform-box: fill-box; transform-origin: center; animation: vb-blink 4.5s infinite; }
.vb-eye2 { animation-delay: .08s; }
.vb-arm { transform-box: fill-box; transform-origin: 50% 100%; animation: vb-wave 6s ease-in-out infinite; }
.vb-ant { transform-box: fill-box; transform-origin: center; animation: vb-pulse 1.8s ease-in-out infinite; }

/* Cute floating greeting bubble on Veda */
.vb-bubble {
  position: absolute; top: -4px; right: -6px; z-index: 2; pointer-events: none;
  padding: .14rem .42rem; border-radius: 9999px; font-size: 9.5px; font-weight: 700;
  color: #0a0a0c; background: linear-gradient(135deg, #fde68a, #fbbf24);
  box-shadow: 0 4px 12px rgba(251,191,36,.45);
  animation: vb-hello 7s ease-in-out infinite;
}

/* live (green) dot */
.vb-live { position: relative; flex: none; width: 8px; height: 8px; border-radius: 9999px; background: #34d399; }
.vb-live::after { content: ''; position: absolute; inset: 0; border-radius: 9999px; background: #34d399; animation: vb-ping 2.4s cubic-bezier(0, 0, .2, 1) infinite; }

/* ---------- Footer support card (compact, mobile-first) ---------- */
.vx-panel.vb-support { overflow: hidden; margin-bottom: 1rem; padding: 1.15rem 1.05rem; }
@media (min-width: 768px) { .vx-panel.vb-support { margin-bottom: 1.25rem; padding: 1.55rem 2rem; } }
.vb-support::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(420px 180px at 8% 0%, rgba(251,191,36,.12), transparent 70%);
  background: radial-gradient(420px 180px at 8% 0%, color-mix(in srgb, var(--vx-b) 22%, transparent), transparent 70%);
}
.vb-support > * { position: relative; }

/* mobile: [bot | text] then full-width button;  desktop: [bot | text | button] */
.vb-inner { display: grid; grid-template-columns: auto 1fr; align-items: center; gap: .9rem 1rem; }
@media (min-width: 768px) { .vb-inner { grid-template-columns: auto 1fr auto; gap: 1.5rem; } }

.vb-mascot { position: relative; display: grid; place-items: center; width: 78px; height: 78px; }
@media (min-width: 768px) { .vb-mascot { width: 104px; height: 104px; } }
.vb-mascot .vb-face { position: relative; z-index: 1; width: 62%; height: 62%; opacity: 0; transform: translate3d(0, 40%, 0) scale(.6); }
.vb-mascot.is-seen .vb-face { animation: vb-enter .8s cubic-bezier(.34, 1.56, .64, 1) both; }
.vb-mascot.is-seen .vb-arm { animation: vb-hi 1.4s ease-in-out .7s 1 both, vb-wave 6s ease-in-out 3.5s infinite; }
.vb-orbit { position: absolute; inset: 0; border-radius: 9999px; border: 1px dashed rgba(255,255,255,.12); animation: vb-spin 18s linear infinite; }
.vb-orbit i { position: absolute; border-radius: 9999px; background: #fbbf24; }
.vb-orbit i:nth-child(1) { top: -3px; left: 50%; width: 6px; height: 6px; margin-left: -3px; }
.vb-orbit i:nth-child(2) { bottom: 12%; right: 2%; width: 4px; height: 4px; opacity: .7; background: #fde68a; }
.vb-orbit i:nth-child(3) { bottom: 18%; left: -1%; width: 4px; height: 4px; opacity: .55; }
.vb-halo { position: absolute; inset: 12%; border-radius: 9999px; border: 1px solid rgba(251,191,36,.35); background: radial-gradient(closest-side, rgba(251,191,36,.2), transparent); }
.vb-halo::after { content: ''; position: absolute; inset: 0; border-radius: 9999px; border: 1px solid rgba(251,191,36,.5); animation: vb-ring 3.2s ease-out infinite; }

.vb-copy { min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: .4rem; text-align: left; }
.vb-chip {
  display: inline-flex; align-items: center; gap: .45rem; width: fit-content; padding: .22rem .65rem; border-radius: 9999px;
  font-size: 11px; color: #a1a1a6; border: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.03);
}

.vb-cta {
  position: relative; isolation: isolate; overflow: hidden; grid-column: 1 / -1; display: inline-flex; align-items: center; justify-content: center; gap: .55rem;
  width: 100%; min-height: 46px; padding: .75rem 1.25rem; border-radius: 9999px; font-size: 14px; font-weight: 600; color: #0a0a0c;
  background: linear-gradient(135deg, #fde68a, #fbbf24 45%, #d4921a);
  box-shadow: 0 12px 28px -14px rgba(251,191,36,.7), inset 0 1px 0 rgba(255,255,255,.5);
  -webkit-tap-highlight-color: transparent;
  transition: transform .25s cubic-bezier(.22, 1, .36, 1), box-shadow .3s ease;
}
@media (min-width: 768px) { .vb-cta { grid-column: auto; width: auto; padding: .8rem 1.5rem; } }
.vb-cta::after {
  content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 38%; pointer-events: none; will-change: transform;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent);
  transform: translate3d(-130%, 0, 0) skewX(-20deg); animation: vb-shine 4.5s ease-in-out infinite;
}
.vb-cta:active { transform: scale(.97); }
.vb-cta:focus-visible { outline: 2px solid #fbbf24; outline-offset: 3px; }
@media (hover: hover) {
  .vb-cta:hover { transform: translate3d(0, -2px, 0); box-shadow: 0 16px 36px -14px rgba(251,191,36,.9), inset 0 1px 0 rgba(255,255,255,.5); }
  .vb-support:hover .vb-bot { animation: vb-hop .6s ease-in-out infinite; }
}

/* trust points: 2 x 2 grid on mobile, one row on desktop */
.vb-trust { display: grid; grid-template-columns: 1fr 1fr; gap: .45rem; margin: 1rem 0 0; padding: .9rem 0 0; list-style: none; border-top: 1px solid rgba(255,255,255,.06); }
@media (min-width: 768px) { .vb-trust { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 1.25rem; padding-top: 1.1rem; } }
.vb-trust li {
  display: flex; align-items: center; justify-content: center; gap: .4rem; padding: .38rem .55rem;
  border-radius: 9999px; font-size: 11px; line-height: 1.2; color: #a1a1a6;
  border: 1px solid rgba(255,255,255,.06); background: rgba(255,255,255,.03);
  transition: border-color .25s ease, color .25s ease, transform .2s ease;
}
@media (min-width: 768px) { .vb-trust li { display: inline-flex; padding: .42rem .85rem; font-size: 12px; } }
@media (hover: hover) {
  .vb-trust li:hover { border-color: rgba(251,191,36,.35); color: #f4f4f5; transform: translate3d(0, -1px, 0); }
}
.vb-trust svg { flex: none; width: 13px; height: 13px; color: #fbbf24; }

/* Back to top button subtle bounce */
.vx-top-btn {
  display: inline-flex; align-items: center; gap: .5rem; border-radius: 9999px;
  border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.035);
  padding: .52rem 1.05rem; font-size: 12px; color: #a1a1aa;
  transition: border-color .25s ease, color .25s ease, background .25s ease, transform .2s ease;
}
.vx-top-btn:active { transform: scale(.95); }
@media (hover: hover) {
  .vx-top-btn:hover { border-color: rgba(251,191,36,.5); color: #ffffff; background: rgba(251,191,36,.08); transform: translate3d(0, -2px, 0); }
  .vx-top-btn:hover .vx-up-arrow { transform: translate3d(0, -2px, 0); color: #fbbf24; }
}
.vx-up-arrow { transition: transform .25s ease, color .25s ease; }

/* ---------- Performance & accessibility ---------- */
.vx-footer[data-active=false] *,
.vx-footer[data-active=false] *::before,
.vx-footer[data-active=false] *::after { animation-play-state: paused !important; }

@media (prefers-reduced-motion: reduce) {
  .vx-footer *, .vx-footer *::before, .vx-footer *::after { animation: none !important; transition-duration: .01ms !important; }
  .vb-mascot .vb-face { opacity: 1; transform: none; }
}
`;

// ---------------------------------------------------------------------------
// Small inline icons (no extra library needed)
// ---------------------------------------------------------------------------
const Icon = ({ name }) => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    {name === 'bolt' && <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />}
    {name === 'clock' && (<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>)}
    {name === 'globe' && (<><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></>)}
    {name === 'shield' && (<><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" /><path d="M9 12l2 2 4-4" /></>)}
    {name === 'chat' && <path d="M21 12a8 8 0 01-11.7 7L4 20l1.2-4.4A8 8 0 1121 12z" />}
    {name === 'book' && (<><path d="M2 4h6a4 4 0 014 4v13a3 3 0 00-3-3H2z" /><path d="M22 4h-6a4 4 0 00-4 4v13a3 3 0 013-3h7z" /></>)}
  </svg>
);

// ---------------------------------------------------------------------------
// The animated robot logo: floats, blinks, looks around, waves hello, antenna glows
// ---------------------------------------------------------------------------
const BotMark = ({ id }) => {
  const g = `vb-grad-${id}`;
  return (
    <span className="vb-face">
      <svg className="vb-bot" viewBox="0 0 100 100" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={g} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fde68a" />
            <stop offset="1" stopColor="#d4921a" />
          </linearGradient>
        </defs>
        <line x1="50" y1="22" x2="50" y2="11" stroke="#92600f" strokeWidth="3" strokeLinecap="round" />
        <circle className="vb-ant" cx="50" cy="9" r="4.5" fill="#fef3c7" />
        <rect x="6" y="42" width="9" height="20" rx="4.5" fill="#92600f" />
        <rect x="85" y="42" width="9" height="20" rx="4.5" fill="#92600f" />
        <g>
          <rect x="4" y="64" width="6" height="18" rx="3" fill="#92600f" />
          <circle cx="7" cy="62" r="5" fill="#fcd34d" />
        </g>
        <g className="vb-arm">
          <rect x="89" y="64" width="6" height="18" rx="3" fill="#92600f" />
          <circle cx="92" cy="62" r="5.5" fill="#fcd34d" />
        </g>
        <rect x="12" y="22" width="76" height="60" rx="26" fill={`url(#${g})`} />
        <rect x="20" y="30" width="60" height="44" rx="20" fill="#0b0b12" />
        <g className="vb-eyes">
          <ellipse className="vb-eye" cx="38" cy="49" rx="5" ry="7" fill="#facc15" />
          <ellipse className="vb-eye vb-eye2" cx="62" cy="49" rx="5" ry="7" fill="#facc15" />
        </g>
        <circle cx="29" cy="63" r="3.5" fill="#fb7185" opacity=".5" />
        <circle cx="71" cy="63" r="3.5" fill="#fb7185" opacity=".5" />
        <path d="M43 62 Q50 68 57 62" stroke="#facc15" strokeWidth="3" fill="none" strokeLinecap="round" />
      </svg>
    </span>
  );
};

const Footer = () => {
  const pathname = usePathname() || '/';
  const footerRef = useRef(null);
  const cardRef = useRef(null);
  // null = abhi time check nahi hua (server render), uske baad subah/din/shaam/raat
  const [phase, setPhase] = useState(null);
  // footer tak scroll hone par hi bot "entry" leta hai
  const [seen, setSeen] = useState(false);

  // Condition: Main page ('/'), About page ('/about'), aur Blog ('/blog') par pura footer dikhega
  // (Isse Google bot ko Home <-> Blog ke beech strong internal linking milegi)
  const showFullFooter =
    pathname === '/' ||
    pathname === '/about' ||
    pathname === '/blog' ||
    pathname.startsWith('/blog');

  // Time of day check — sirf phase badalne par hi re-render hota hai
  useEffect(() => {
    const update = () => setPhase(getPhase(new Date().getHours()));
    update();
    const id = setInterval(update, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Footer screen par na ho to animations pause (CPU / battery bachti hai)
  useEffect(() => {
    const el = footerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        el.dataset.active = entry.isIntersecting ? 'true' : 'false';
      },
      { rootMargin: '120px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [showFullFooter]);

  // Jab user scroll karke support card tak pahunche, tab bot uchhal kar aaye aur haath hilaye
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return undefined;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [showFullFooter]);

  // Agar user kisi dusre page par hai, toh footer nahi dikhega
  if (!showFullFooter) return null;

  // Pura Footer - Home, About aur Blog page ke liye
  return (
    <footer
      ref={footerRef}
      data-phase={phase || 'night'}
      className="vx-footer relative isolate overflow-hidden w-full bg-black border-t border-white/10 py-12 md:py-16 mt-16 md:mt-20"
    >
      <style dangerouslySetInnerHTML={{ __html: FOOTER_CSS }} />

      {/* Animated background (decorative only) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="vx-dots" />
        <div className="vx-glow vx-glow-a" />
        <div className="vx-glow vx-glow-b" />
        <div className="vx-glow vx-glow-c" />
        <div className="vx-fireflies">
          <span /><span /><span /><span /><span />
        </div>
        <span className="vx-sweep" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* ============ SUPPORT BOT CARD (compact) ============ */}
        <section ref={cardRef} className="vx-panel vb-support" aria-labelledby="vb-support-title">
          <div className="vb-inner">
            <div className={`vb-mascot${seen ? ' is-seen' : ''}`} aria-hidden="true">
              <span className="vb-orbit"><i /><i /><i /></span>
              <span className="vb-halo" />
              <span className="vb-bubble">नमस्ते!</span>
              <BotMark id="card" />
            </div>

            <div className="vb-copy">
              <span className="vb-chip">
                <span className="vb-live" aria-hidden="true" />
                <span>Veda<span className="hidden md:inline"> · Support assistant</span> · Online</span>
              </span>
              <h3 id="vb-support-title" className="text-[15px] md:text-xl font-semibold leading-snug text-gray-100 tracking-tight">
                Got a question? Veda answers in seconds.
              </h3>
              <p className="text-[12.5px] md:text-[14px] leading-relaxed text-[#a1a1a6] font-light">
                Ask in English, हिंदी or Hinglish — payments, books, rewards, login.
                <span className="hidden md:inline"> Not solved? Raise a ticket right from the chat.</span>
              </p>
            </div>

            <Link href={BOT_ROUTE} className="vb-cta">
              <Icon name="chat" />
              <span>Chat with Veda</span>
            </Link>
          </div>

          <ul className="vb-trust">
            <li><Icon name="bolt" /> Instant answers</li>
            <li><Icon name="clock" /> 48-hour ticket reply</li>
            <li><Icon name="globe" /> 3 languages</li>
            <li><Icon name="shield" /> Secure Web Reader</li>
          </ul>
        </section>

        {/* ============ VEDOXA BLOG SPOTLIGHT (SEO Internal Link + Reader Magnet) ============ */}
        <section className="vx-panel vx-blog-card" aria-labelledby="vx-blog-title">
          <div className="vx-blog-grid">
            <div className="vx-blog-icon" aria-hidden="true">
              <span className="vx-blog-book">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 4h6a4 4 0 014 4v13a3 3 0 00-3-3H2z" />
                  <path d="M22 4h-6a4 4 0 00-4 4v13a3 3 0 013-3h7z" />
                </svg>
              </span>
            </div>

            <div className="vb-copy">
              <span className="vx-blog-badge">
                <span className="vx-blog-spark" aria-hidden="true" />
                <span>Vedoxa Blog · नए हिंदी लेख</span>
              </span>
              <h3 id="vx-blog-title" className="text-[15px] md:text-lg font-semibold leading-snug text-white tracking-tight">
                Mindset, Spirituality aur Paise ki Samajh — Saral Hindi Me
              </h3>
              <p className="text-[12.5px] md:text-[13.5px] leading-relaxed text-[#a1a1a6] font-light">
                रिश्ते, आत्मविश्वास, ध्यान और फाइनेंशियल फ्रीडम पर खास रिसर्च किए गए लेख पढ़ें।
              </p>
            </div>

            <Link href={BLOG_ROUTE} className="vx-blog-cta">
              <Icon name="book" />
              <span>Vedoxa Blog पढ़ें</span>
              <svg
                className="vx-btn-arrow"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 9l6-6M4 3h5v5" />
              </svg>
            </Link>
          </div>

          {/* Direct crawlable internal links for Google Search Console */}
          <nav aria-label="Explore Vedoxa pages" className="vx-explore-bar">
            <span className="vx-explore-label">Quick Explore:</span>
            {EXPLORE_LINKS.map((item) => (
              <Link key={item.href} href={item.href} className="vx-explore-link">
                <span>{item.label}</span>
                {item.isNew && <span className="vx-new-tag">NEW</span>}
              </Link>
            ))}
          </nav>
        </section>

        {/* ============ BRAND + LEGAL ============ */}
        <div className="vx-panel">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10">
            {/* Brand Name & Copyright */}
            <div className="text-center md:text-left flex flex-col space-y-2.5">
              <Link href="/" className="inline-block focus:outline-none">
                <h2 className="vx-brand text-2xl md:text-[26px] font-semibold tracking-widest uppercase">
                  VEDOXA
                </h2>
              </Link>
              <p className="text-[#86868b] text-[13px] font-light">
                © {new Date().getFullYear()} Vedoxa Premium Library. All rights reserved.
              </p>
              {/* Time ke hisab se badalne wali greeting */}
              {phase && (
                <span className="vx-pill self-center md:self-start">
                  <span className="vx-dot" aria-hidden="true" />
                  <span>{GREETINGS[phase]}</span>
                </span>
              )}
            </div>

            {/* Legal & Blog Links - Razorpay Approval + Google Indexing ke liye ("ink drop" click buttons) */}
            <nav
              aria-label="Legal, blog and support"
              className="flex flex-wrap justify-center md:justify-end gap-2.5 sm:gap-3.5 text-[12.5px] sm:text-[13px] font-medium"
            >
              {LEGAL_LINKS.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`vx-btn ${item.highlight ? 'vx-btn-highlight' : 'text-[#86868b]'} hover:text-white transition-colors duration-300 ease-out`}
                  style={{ '--i': index }}
                >
                  <span>{item.label}</span>
                  <svg
                    className="vx-btn-arrow"
                    width="11"
                    height="11"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M3 9l6-6M4 3h5v5" />
                  </svg>
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Disclaimer for Digital Goods - Subtle & Minimal */}
        <div className="mt-10 md:mt-12 pt-6 border-t border-white/5 flex flex-col items-center gap-4 md:flex-row md:justify-between">
          <p className="text-center md:text-left text-[12px] text-[#555557] font-light tracking-wide">
            Strict No-Refund Policy applies to all digital library assets once accessed.
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="vx-top-btn"
          >
            <span className="vx-up-arrow" aria-hidden="true">↑</span>
            <span>Back to top</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
