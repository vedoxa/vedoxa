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

// Legal links (same pages, same names as before)
const LEGAL_LINKS = [
  { href: '/contact', label: 'Contact Us' },
  { href: '/terms', label: 'Terms & Conditions' },
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/refund', label: 'Refund & Cancellation' },
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

.vx-brand { text-shadow: 0 0 28px rgba(251,191,36,.22); }

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

/* ---------- Performance & accessibility ---------- */
.vx-footer[data-active=false] *,
.vx-footer[data-active=false] *::before,
.vx-footer[data-active=false] *::after { animation-play-state: paused !important; }

@media (prefers-reduced-motion: reduce) {
  .vx-footer *, .vx-footer *::before, .vx-footer *::after { animation: none !important; transition-duration: .01ms !important; }
}
`;

const Footer = () => {
  const pathname = usePathname();
  const footerRef = useRef(null);
  // null = abhi time check nahi hua (server render), uske baad subah/din/shaam/raat
  const [phase, setPhase] = useState(null);

  // Condition: Sirf Main page ('/') aur About page ('/about') par pura footer dikhega
  const showFullFooter = pathname === '/' || pathname === '/about';

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

  // Agar user kisi dusre page par hai, toh sirf ek patli premium line dikhegi
  if (!showFullFooter) return null;

  // Pura Footer - Home aur About page ke liye (Apple UI/UX Style)
  return (
    <footer
      ref={footerRef}
      data-phase={phase || 'night'}
      className="vx-footer relative isolate overflow-hidden w-full bg-black border-t border-white/10 py-14 mt-20"
    >
      <style dangerouslySetInnerHTML={{ __html: FOOTER_CSS }} />

      {/* Animated background (decorative only) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="vx-dots" />
        <div className="vx-glow vx-glow-a" />
        <div className="vx-glow vx-glow-b" />
        <div className="vx-glow vx-glow-c" />
        <span className="vx-sweep" />
      </div>

      <div className="max-w-6xl mx-auto px-6">
        <div className="vx-panel">
          <div className="flex flex-col md:flex-row justify-between items-center gap-10">
            
            {/* Brand Name & Copyright */}
            <div className="text-center md:text-left flex flex-col space-y-2">
              <h2 className="vx-brand text-2xl font-semibold text-gray-100 tracking-widest uppercase">
                VEDOXA
              </h2>
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
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-[13px] font-medium">
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
            </div>

          </div>
        </div>

        {/* Disclaimer for Digital Goods - Subtle & Minimal */}
        <div className="mt-12 pt-6 border-t border-white/5 text-center text-[12px] text-[#555557] font-light tracking-wide">
          <p>Strict No-Refund Policy applies to all digital library assets once accessed.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
