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

// Legal links (same pages, same names as before) + Help & Support
const LEGAL_LINKS = [
  { href: '/contact', label: 'Contact Us' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/refund', label: 'Refund & Cancellation' },
  { href: '/support', label: 'Help & Support' },
];

// ---------------------------------------------------------------------------
// SUPPORT BOT (Veda)
// Floating bot button in pages par NAHI dikhega (jo page yahan likhe hon). Zarurat ho to aur routes add karein,
// jaise '/reader'. Baaki sab pages par chhota sa chalta-phirta bot dikhega jo /support page kholta hai.
// ---------------------------------------------------------------------------
const BOT_HIDDEN_ON = ['/support'];
const BOT_ROUTE = '/support';

// Bubble me ghoomti hui lines (English / हिंदी / Hinglish)
const BUBBLES = [
  'Need help? Ask me! 👋',
  'मदद चाहिए? मैं यहाँ हूँ!',
  'Help chahiye? Main yahin hoon 😊',
  'Payment, books, rewards — sab ka jawab 💛',
];

// ---------------------------------------------------------------------------
// PERFORMANCE RULES used in all animations below:
//  - sirf transform + opacity animate hote hain (GPU par chalte hain, page ko slow nahi karte)
//  - koi blur / backdrop-filter / drop-shadow animation nahi
//  - footer screen se bahar ho to saari animation pause ho jati hai
//  - prefers-reduced-motion wale users ke liye animation band
// ---------------------------------------------------------------------------
const FOOTER_CSS = `
@property --vx-a { syntax: '<color>'; inherits: true; initial-value: #6366f1; }
@property --vx-b { syntax: '<color>'; inherits: true; initial-value: #d4921a; }

.vx-footer { --vx-a: #6366f1; --vx-b: #d4921a; transition: --vx-a 4s ease, --vx-b 4s ease; }
.vx-footer[data-phase=morning] { --vx-a: #f59e0b; --vx-b: #fb7185; }
.vx-footer[data-phase=day]     { --vx-a: #fbbf24; --vx-b: #60a5fa; }
.vx-footer[data-phase=evening] { --vx-a: #f97316; --vx-b: #c026d3; }
.vx-footer[data-phase=night]   { --vx-a: #6366f1; --vx-b: #d4921a; }

/* ---------- Background: slowly drifting glows (different speeds = pattern never repeats exactly) ---------- */
.vx-glow { position: absolute; border-radius: 9999px; pointer-events: none; will-change: transform; }
.vx-glow-a {
  width: min(560px, 95vw); height: min(560px, 95vw); left: -10%; top: -45%; opacity: .17;
  background: radial-gradient(closest-side, var(--vx-a), transparent);
  animation: vx-drift-a 23s ease-in-out infinite alternate;
}
.vx-glow-b {
  width: min(480px, 85vw); height: min(480px, 85vw); right: -8%; bottom: -50%; opacity: .15;
  background: radial-gradient(closest-side, var(--vx-b), transparent);
  animation: vx-drift-b 31s ease-in-out infinite alternate;
}
.vx-glow-c {
  width: min(320px, 70vw); height: min(320px, 70vw); left: 40%; top: 5%; opacity: .08;
  background: radial-gradient(closest-side, #fbbf24, transparent);
  animation: vx-drift-c 41s ease-in-out infinite alternate;
}
@keyframes vx-drift-a { from { transform: translate3d(0, 0, 0) scale(1); }    to { transform: translate3d(34vw, 8%, 0) scale(1.25); } }
@keyframes vx-drift-b { from { transform: translate3d(0, 0, 0) scale(1.1); }  to { transform: translate3d(-30vw, -12%, 0) scale(.9); } }
@keyframes vx-drift-c { from { transform: translate3d(-14vw, 0, 0) scale(1); } to { transform: translate3d(16vw, -10%, 0) scale(1.3); } }

/* faint dotted texture (static, painted once) */
.vx-dots {
  position: absolute; inset: 0; opacity: .6; pointer-events: none;
  background-image: radial-gradient(rgba(255,255,255,.09) 1px, transparent 1.2px);
  background-size: 22px 22px;
  -webkit-mask-image: linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent);
  mask-image: linear-gradient(to bottom, transparent, #000 35%, #000 65%, transparent);
}

/* light that keeps travelling along the top line */
.vx-sweep {
  position: absolute; top: 0; left: 0; height: 1px; width: 35%; pointer-events: none; will-change: transform;
  background: linear-gradient(90deg, transparent, var(--vx-b), var(--vx-a), transparent);
  animation: vx-sweep 9s linear infinite;
}
@keyframes vx-sweep { from { transform: translate3d(-100%, 0, 0); } to { transform: translate3d(300%, 0, 0); } }

/* ---------- Glass panel ---------- */
.vx-panel {
  position: relative; border-radius: 1.75rem; padding: 2rem 1.25rem;
  border: 1px solid rgba(255,255,255,.08);
  background: linear-gradient(180deg, rgba(255,255,255,.045), rgba(255,255,255,.01));
  box-shadow: inset 0 1px 0 rgba(255,255,255,.06);
}
@media (min-width: 768px) { .vx-panel { padding: 2.25rem 2.5rem; } }

/* Brand: soft white -> gold gradient text */
.vx-brand {
  background: linear-gradient(100deg, #ffffff 8%, #fde68a 46%, var(--vx-b) 86%);
  -webkit-background-clip: text; background-clip: text;
  color: transparent; -webkit-text-fill-color: transparent;
}

/* ---------- Greeting pill (changes with time of day) ---------- */
.vx-pill {
  display: inline-flex; align-items: center; gap: .55rem; width: fit-content;
  padding: .3rem .8rem; border-radius: 9999px; font-size: 12px; color: #a1a1a6;
  border: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.03);
  animation: vx-fade .8s ease both;
}
.vx-dot { position: relative; width: 6px; height: 6px; border-radius: 9999px; background: var(--vx-b); }
.vx-dot::after {
  content: ''; position: absolute; inset: 0; border-radius: 9999px; background: var(--vx-b);
  animation: vx-ping 2.6s cubic-bezier(0, 0, .2, 1) infinite;
}
@keyframes vx-ping { 0% { transform: scale(1); opacity: .7; } 80%, 100% { transform: scale(3.4); opacity: 0; } }
@keyframes vx-fade { from { opacity: 0; } to { opacity: 1; } }

/* ---------- UNIQUE CLICK BUTTONS: "ink drop" ----------
   Har button me ek chhoti sunehri boond hai. Hover / tap karte hi wo phail kar poore button ko bhar deti hai,
   text dark ho jata hai, arrow ukhad kar aage badhta hai. Idle me boondon ke ird-gird ring ek-ek karke
   chamakti hai (wave), taaki button "click me" bolta rahe. */
.vx-btn.vx-btn {
  position: relative; display: inline-flex; align-items: center; gap: .65rem; isolation: isolate; overflow: hidden;
  padding: .72rem 1.1rem .72rem 1.95rem; border-radius: 9999px; line-height: 1;
  border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.03);
  -webkit-tap-highlight-color: transparent;
  transition: color .35s ease, border-color .35s ease, box-shadow .35s ease, transform .25s cubic-bezier(.22, 1, .36, 1);
}
.vx-btn::before {
  content: ''; position: absolute; left: 1rem; top: 50%; width: 6px; height: 6px; margin-top: -3px;
  border-radius: 9999px; z-index: -1; will-change: transform;
  background: linear-gradient(135deg, #fde68a, #fbbf24 45%, #d4921a);
  transition: transform .6s cubic-bezier(.22, 1, .36, 1);
}
.vx-btn::after {
  content: ''; position: absolute; left: calc(1rem - 3px); top: 50%; width: 12px; height: 12px; margin-top: -6px;
  border-radius: 9999px; border: 1px solid rgba(251,191,36,.85); opacity: 0; z-index: -1; pointer-events: none;
  animation: vx-ring 7s ease-out infinite; animation-delay: calc(var(--i, 0) * 1.6s);
}
@keyframes vx-ring { 0% { transform: scale(.6); opacity: .9; } 18%, 100% { transform: scale(2.6); opacity: 0; } }

.vx-btn-arrow { flex: none; transition: transform .35s cubic-bezier(.22, 1, .36, 1); }

@media (hover: hover) {
  .vx-btn.vx-btn:hover { color: #0a0a0c; border-color: rgba(251,191,36,.9); box-shadow: 0 10px 30px -10px rgba(251,191,36,.6); }
  .vx-btn:hover::before { transform: scale(70); }
  .vx-btn:hover::after { animation: none; opacity: 0; }
  .vx-btn:hover .vx-btn-arrow { transform: translate3d(3px, -3px, 0); }
}
/* touch / click press feedback (works on mobile too) */
.vx-btn.vx-btn:active { color: #0a0a0c; border-color: rgba(251,191,36,.9); transform: scale(.95); }
.vx-btn:active::before { transform: scale(70); }
.vx-btn:focus-visible { outline: 2px solid #fbbf24; outline-offset: 3px; }

/* =====================================================================
   SUPPORT BOT "Veda"  (prefix vb-)  — floating button + footer support card
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
@keyframes vb-pop   { from { opacity: 0; transform: translate3d(0, 8px, 0) scale(.92); } to { opacity: 1; transform: none; } }
@keyframes vb-shine { 0%, 55% { transform: translate3d(-130%, 0, 0) skewX(-20deg); } 100% { transform: translate3d(360%, 0, 0) skewX(-20deg); } }

/* the robot itself (inline SVG) */
.vb-face { display: block; width: 100%; height: 100%; }
.vb-bot { display: block; width: 100%; height: 100%; overflow: visible; transform-origin: 50% 100%; animation: vb-float 3.6s ease-in-out infinite; }
.vb-eyes { animation: vb-look 7s ease-in-out infinite; }
.vb-eye { transform-box: fill-box; transform-origin: center; animation: vb-blink 4.5s infinite; }
.vb-eye2 { animation-delay: .08s; }
.vb-arm { transform-box: fill-box; transform-origin: 50% 100%; animation: vb-wave 6s ease-in-out infinite; }
.vb-ant { transform-box: fill-box; transform-origin: center; animation: vb-pulse 1.8s ease-in-out infinite; }

/* live (green) dot */
.vb-live { position: relative; flex: none; width: 8px; height: 8px; border-radius: 9999px; background: #34d399; }
.vb-live::after { content: ''; position: absolute; inset: 0; border-radius: 9999px; background: #34d399; animation: vb-ping 2.4s cubic-bezier(0, 0, .2, 1) infinite; }

/* ---------- Floating launcher ---------- */
.vb-fab-wrap {
  position: fixed; z-index: 45; display: flex; flex-direction: column; align-items: flex-end; gap: .7rem;
  right: max(1rem, env(safe-area-inset-right)); bottom: max(1rem, env(safe-area-inset-bottom));
  visibility: hidden; opacity: 0; pointer-events: none; transform: translate3d(0, 18px, 0) scale(.85); transform-origin: 100% 100%;
  transition: opacity .4s ease, transform .55s cubic-bezier(.34, 1.56, .64, 1), visibility 0s linear .55s;
}
.vb-fab-wrap.is-in { visibility: visible; opacity: 1; pointer-events: auto; transform: none; transition-delay: 0s; }

.vb-bubble {
  position: relative; display: flex; align-items: center; gap: .5rem;
  max-width: min(270px, calc(100vw - 2.5rem)); padding: .6rem .5rem .6rem .95rem;
  border-radius: 1.1rem 1.1rem .3rem 1.1rem; font-size: 13px; font-weight: 500; line-height: 1.35; color: #f4f4f5;
  border: 1px solid rgba(251,191,36,.35); background: #14110a; box-shadow: 0 14px 34px -14px rgba(0,0,0,.85);
  animation: vb-pop .35s cubic-bezier(.22, 1, .36, 1) both;
}
.vb-bubble button {
  flex: none; display: grid; place-items: center; width: 22px; height: 22px; border-radius: 9999px;
  font-size: 14px; line-height: 1; color: #a1a1a6; background: rgba(255,255,255,.07); cursor: pointer;
}
.vb-bubble button:hover { color: #fff; }

.vb-fab {
  position: relative; isolation: isolate; display: grid; place-items: center; width: 62px; height: 62px; border-radius: 9999px;
  border: 1px solid rgba(251,191,36,.5); background: radial-gradient(circle at 30% 25%, #2a2210, #0b0b0e 70%);
  box-shadow: 0 16px 36px -12px rgba(251,191,36,.6), inset 0 1px 0 rgba(255,255,255,.12);
  -webkit-tap-highlight-color: transparent;
  transition: transform .3s cubic-bezier(.22, 1, .36, 1);
}
@media (min-width: 768px) { .vb-fab { width: 68px; height: 68px; } }
.vb-fab .vb-face { width: 42px; height: 42px; }
.vb-fab-ring { position: absolute; inset: 0; z-index: -1; border-radius: 9999px; border: 1px solid rgba(251,191,36,.55); pointer-events: none; animation: vb-ring 3s ease-out infinite; }
.vb-fab-ring2 { animation-delay: 1.5s; }
.vb-fab-live { position: absolute; top: 1px; right: 1px; width: 14px; height: 14px; border-radius: 9999px; background: #34d399; border: 2px solid #0b0b0e; }
.vb-fab-live::after { content: ''; position: absolute; inset: -2px; border-radius: 9999px; background: #34d399; z-index: -1; animation: vb-ping 2.4s cubic-bezier(0, 0, .2, 1) infinite; }
.vb-fab:active { transform: scale(.94); }
.vb-fab:focus-visible { outline: 2px solid #fbbf24; outline-offset: 4px; }
@media (hover: hover) {
  .vb-fab:hover { transform: translate3d(0, -3px, 0) scale(1.06); }
  .vb-fab:hover .vb-bot, .vb-support:hover .vb-bot { animation: vb-hop .6s ease-in-out infinite; }
}

/* ---------- Footer support card ---------- */
.vb-support { overflow: hidden; margin-bottom: 1.25rem; }
.vb-support::before {
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(560px 240px at 10% 0%, rgba(251,191,36,.14), transparent 70%);
  background: radial-gradient(560px 240px at 10% 0%, color-mix(in srgb, var(--vx-b) 24%, transparent), transparent 70%);
}
.vb-support > * { position: relative; }
.vb-inner { display: flex; flex-direction: column; align-items: center; gap: 1.25rem; text-align: center; }
@media (min-width: 768px) { .vb-inner { flex-direction: row; gap: 2rem; text-align: left; } }

.vb-mascot { position: relative; flex: none; display: grid; place-items: center; width: 108px; height: 108px; }
@media (min-width: 768px) { .vb-mascot { width: 128px; height: 128px; } }
.vb-mascot .vb-face { width: 60%; height: 60%; position: relative; z-index: 1; }
.vb-orbit { position: absolute; inset: 0; border-radius: 9999px; border: 1px dashed rgba(255,255,255,.1); animation: vb-spin 18s linear infinite; }
.vb-orbit i { position: absolute; border-radius: 9999px; background: #fbbf24; }
.vb-orbit i:nth-child(1) { top: -3px; left: 50%; width: 7px; height: 7px; margin-left: -3px; }
.vb-orbit i:nth-child(2) { bottom: 12%; right: 2%; width: 5px; height: 5px; opacity: .7; background: #fde68a; }
.vb-orbit i:nth-child(3) { bottom: 18%; left: -1%; width: 5px; height: 5px; opacity: .55; }
.vb-halo { position: absolute; inset: 12%; border-radius: 9999px; border: 1px solid rgba(251,191,36,.35); background: radial-gradient(closest-side, rgba(251,191,36,.2), transparent); }
.vb-halo::after { content: ''; position: absolute; inset: 0; border-radius: 9999px; border: 1px solid rgba(251,191,36,.5); animation: vb-ring 3.2s ease-out infinite; }

.vb-copy { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: .55rem; }
@media (min-width: 768px) { .vb-copy { align-items: flex-start; } }
.vb-chip {
  display: inline-flex; align-items: center; gap: .5rem; width: fit-content; padding: .28rem .75rem; border-radius: 9999px;
  font-size: 12px; color: #a1a1a6; border: 1px solid rgba(255,255,255,.08); background: rgba(255,255,255,.03);
}

.vb-cta {
  position: relative; isolation: isolate; overflow: hidden; flex: none; display: inline-flex; align-items: center; justify-content: center; gap: .6rem;
  min-height: 48px; padding: .85rem 1.5rem; border-radius: 9999px; font-size: 14px; font-weight: 600; color: #0a0a0c;
  background: linear-gradient(135deg, #fde68a, #fbbf24 45%, #d4921a);
  box-shadow: 0 14px 34px -14px rgba(251,191,36,.75), inset 0 1px 0 rgba(255,255,255,.5);
  -webkit-tap-highlight-color: transparent;
  transition: transform .25s cubic-bezier(.22, 1, .36, 1), box-shadow .3s ease;
}
.vb-cta::after {
  content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 38%; pointer-events: none; will-change: transform;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent);
  transform: translate3d(-130%, 0, 0) skewX(-20deg); animation: vb-shine 4.5s ease-in-out infinite;
}
.vb-cta:active { transform: scale(.96); }
.vb-cta:focus-visible { outline: 2px solid #fbbf24; outline-offset: 3px; }
@media (hover: hover) { .vb-cta:hover { transform: translate3d(0, -2px, 0); box-shadow: 0 18px 40px -14px rgba(251,191,36,.9), inset 0 1px 0 rgba(255,255,255,.5); } }

.vb-trust { display: flex; flex-wrap: wrap; justify-content: center; gap: .6rem; margin: 1.5rem 0 0; padding: 1.25rem 0 0; list-style: none; border-top: 1px solid rgba(255,255,255,.06); }
@media (min-width: 768px) { .vb-trust { justify-content: flex-start; } }
.vb-trust li { display: inline-flex; align-items: center; gap: .45rem; padding: .4rem .8rem; border-radius: 9999px; font-size: 12px; color: #a1a1a6; border: 1px solid rgba(255,255,255,.06); background: rgba(255,255,255,.03); }
.vb-trust svg { flex: none; color: #fbbf24; }

@media print { .vb-fab-wrap { display: none; } }

/* ---------- Performance & accessibility ---------- */
.vx-footer[data-active=false] *,
.vx-footer[data-active=false] *::before,
.vx-footer[data-active=false] *::after { animation-play-state: paused !important; }

@media (prefers-reduced-motion: reduce) {
  .vx-footer *, .vx-footer *::before, .vx-footer *::after,
  .vb-fab-wrap, .vb-fab-wrap *, .vb-fab-wrap *::before, .vb-fab-wrap *::after { animation: none !important; transition-duration: .01ms !important; }
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

// ---------------------------------------------------------------------------
// Floating launcher: har page par neeche-right me chhota bot, kabhi-kabhi bubble me "I'm here!" bolta hai
// ---------------------------------------------------------------------------
const SupportLauncher = ({ hidden }) => {
  const [ready, setReady] = useState(false);
  const [closed, setClosed] = useState(false);
  const [bubble, setBubble] = useState(null);

  useEffect(() => {
    try {
      if (sessionStorage.getItem('vb_bubble_closed') === '1') setClosed(true);
    } catch (e) {
      /* storage blocked — ignore */
    }
    const id = setTimeout(() => setReady(true), 1200);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (!ready || closed) return undefined;
    let i = 0;
    let hideTimer = null;
    const show = () => {
      setBubble(i % BUBBLES.length);
      i += 1;
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => setBubble(null), 4200);
    };
    const first = setTimeout(show, 1500);
    const loop = setInterval(show, 12000);
    return () => {
      clearTimeout(first);
      clearTimeout(hideTimer);
      clearInterval(loop);
    };
  }, [ready, closed]);

  const dismiss = () => {
    setClosed(true);
    setBubble(null);
    try {
      sessionStorage.setItem('vb_bubble_closed', '1');
    } catch (e) {
      /* ignore */
    }
  };

  const visible = ready && !hidden;

  return (
    <div className={`vb-fab-wrap${visible ? ' is-in' : ''}`}>
      {visible && bubble !== null && !closed && (
        <div className="vb-bubble" role="status">
          <span>{BUBBLES[bubble]}</span>
          <button type="button" onClick={dismiss} aria-label="Dismiss message">×</button>
        </div>
      )}
      <Link href={BOT_ROUTE} className="vb-fab" aria-label="Chat with Veda, the Vedoxa support assistant">
        <span className="vb-fab-ring" aria-hidden="true" />
        <span className="vb-fab-ring vb-fab-ring2" aria-hidden="true" />
        <BotMark id="fab" />
        <span className="vb-fab-live" aria-hidden="true" />
      </Link>
    </div>
  );
};

const Footer = () => {
  const pathname = usePathname();
  const footerRef = useRef(null);
  const cardRef = useRef(null);
  // null = abhi time check nahi hua (server render), uske baad subah/din/shaam/raat
  const [phase, setPhase] = useState(null);
  // footer ka support card screen par ho to floating bot chhup jata hai (do-do bot ek saath nahi dikhenge)
  const [cardInView, setCardInView] = useState(false);

  // Condition: Sirf Main page ('/') aur About page ('/about') par pura footer dikhega
  const showFullFooter = pathname === '/' || pathname === '/about';
  const path = pathname || '';
  const showLauncher = !BOT_HIDDEN_ON.some((p) => path === p || path.startsWith(`${p}/`));

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

  // Support card dikhe to floating bot hide
  useEffect(() => {
    const el = cardRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setCardInView(false);
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => setCardInView(entry.isIntersecting), { threshold: 0.35 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [showFullFooter]);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: FOOTER_CSS }} />

      {showLauncher && <SupportLauncher hidden={cardInView} />}

      {/* Pura Footer - sirf Home aur About page ke liye */}
      {showFullFooter && (
        <footer
          ref={footerRef}
          data-phase={phase || 'night'}
          className="vx-footer relative isolate overflow-hidden w-full bg-black border-t border-white/10 pt-14 pb-28 md:pb-14 mt-20"
        >
          {/* Animated background (decorative only) */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="vx-dots" />
            <div className="vx-glow vx-glow-a" />
            <div className="vx-glow vx-glow-b" />
            <div className="vx-glow vx-glow-c" />
            <span className="vx-sweep" />
          </div>

          <div className="max-w-6xl mx-auto px-6">
            {/* ============ SUPPORT BOT CARD ============ */}
            <section ref={cardRef} className="vx-panel vb-support" aria-labelledby="vb-support-title">
              <div className="vb-inner">
                <div className="vb-mascot" aria-hidden="true">
                  <span className="vb-orbit"><i /><i /><i /></span>
                  <span className="vb-halo" />
                  <BotMark id="card" />
                </div>

                <div className="vb-copy">
                  <span className="vb-chip">
                    <span className="vb-live" aria-hidden="true" />
                    Veda · Support assistant · Online
                  </span>
                  <h3 id="vb-support-title" className="text-xl md:text-2xl font-semibold text-gray-100 tracking-tight">
                    Got a question? Veda answers in seconds.
                  </h3>
                  <p className="text-[14px] leading-relaxed text-[#a1a1a6] font-light max-w-xl">
                    Ask in English, हिंदी or Hinglish — payments, book access, rewards or login. Not solved? Raise a ticket right from the chat.
                  </p>
                </div>

                <Link href={BOT_ROUTE} className="vb-cta">
                  <Icon name="chat" />
                  <span>Chat with Veda</span>
                </Link>
              </div>

              <ul className="vb-trust">
                <li><Icon name="bolt" /> Instant answers</li>
                <li><Icon name="clock" /> Tickets answered within 48 hours</li>
                <li><Icon name="globe" /> English · हिंदी · Hinglish</li>
                <li><Icon name="shield" /> Secure Web Reader</li>
              </ul>
            </section>

            {/* ============ BRAND + LEGAL ============ */}
            <div className="vx-panel">
              <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                {/* Brand Name & Copyright */}
                <div className="text-center md:text-left flex flex-col space-y-2">
                  <h2 className="vx-brand text-2xl font-semibold tracking-widest uppercase">VEDOXA</h2>
                  <p className="text-[#86868b] text-[13px] font-light">
                    © {new Date().getFullYear()} Vedoxa Premium Library. All rights reserved.
                  </p>
                  {/* Time ke hisab se badalne wali greeting */}
                  {phase && (
                    <span className="vx-pill self-center md:self-start">
                      <span className="vx-dot" aria-hidden="true" />
                      {GREETINGS[phase]}
                    </span>
                  )}
                </div>

                {/* Legal Links - Razorpay Approval ke liye zaroori (ab "ink drop" click buttons) */}
                <nav aria-label="Legal and support" className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[13px] font-medium">
                  {LEGAL_LINKS.map((item, index) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="vx-btn text-[#86868b] hover:text-white transition-colors duration-300 ease-out"
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
            <div className="mt-12 pt-6 border-t border-white/5 flex flex-col items-center gap-4 md:flex-row md:justify-between">
              <p className="text-center md:text-left text-[12px] text-[#555557] font-light tracking-wide">
                Strict No-Refund Policy applies to all digital library assets once accessed.
              </p>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[12px] text-[#86868b] transition hover:border-white/25 hover:text-white active:scale-95"
              >
                <span aria-hidden="true">↑</span> Back to top
              </button>
            </div>
          </div>
        </footer>
      )}
    </>
  );
};

export default Footer;
