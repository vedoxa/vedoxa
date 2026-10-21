// @ts-nocheck
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Background: sab code se bana hai (taare + ghumta mandala + nebula) => 0 KB download, turant load.
// Agar asli photo bhi chahiye to yahan URL daaliye (Unsplash me ?w=800&q=50&fm=webp&auto=format lagaayein).
const PHOTO = "";

const CARDS = [
  {
    href: "/explore/soul-circle", title: "Soul Circle", tag: "Live community",
    text: "A live global chat room. Meet fellow readers, share perspectives in real time, and grow through conversations with seekers across the world.",
    cta: "Enter Circle", accent: "#f5c76a", tint: "rgba(245,199,106,.13)", Art: CircleArt,
  },
  {
    href: "/explore/soul-echo", title: "Soul Echo", tag: "AI companion",
    text: "Your quiet companion. Share what you feel, struggle with, or wonder about, and talk to a friend who listens without judgement and remembers.",
    cta: "Talk to Echo", accent: "#8ab4ff", tint: "rgba(138,180,255,.14)", Art: EchoArt,
  },
];

const THOUGHTS = [
  "Be still. The answers you seek are already listening.",
  "Every breath is a quiet beginning.",
  "You are not behind. You are becoming.",
  "Peace is a place you can always return to.",
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } };

function CircleArt() {
  const dots = [0, 72, 144, 216, 288];
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
      <circle cx="50" cy="50" r="34" fill="none" stroke="#f5c76a" strokeOpacity=".3" strokeDasharray="2 4" />
      <g className="ex-orbit">
        {dots.map((a, i) => {
          const r = (a * Math.PI) / 180;
          return <circle key={a} cx={(50 + 34 * Math.sin(r)).toFixed(2)} cy={(50 - 34 * Math.cos(r)).toFixed(2)} r={i % 2 ? 3.4 : 4.6} fill={i % 2 ? "#fde7a8" : "#f5c76a"} />;
        })}
      </g>
      <circle cx="50" cy="50" r="19" fill="#f5c76a" fillOpacity=".14" />
      <circle cx="50" cy="50" r="9" fill="#f5c76a" />
    </svg>
  );
}

function EchoArt() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" aria-hidden="true">
      {[0, 1.2, 2.4].map((d) => (
        <circle key={d} className="ex-rip" cx="50" cy="50" r="44" fill="none" stroke="#8ab4ff" strokeWidth="1.5" style={{ "--d": `${d}s` }} />
      ))}
      <circle cx="50" cy="50" r="15" fill="#8ab4ff" fillOpacity=".15" />
      <path d="M50 37L53.5 46.5L63 50L53.5 53.5L50 63L46.5 53.5L37 50L46.5 46.5Z" fill="#d6e4ff" />
    </svg>
  );
}

function Mandala() {
  return (
    <svg viewBox="-400 -400 800 800" className="ex-spin w-full h-full" aria-hidden="true">
      <defs>
        <radialGradient id="exCore"><stop offset="0" stopColor="#f5c76a" stopOpacity=".35" /><stop offset="1" stopColor="#f5c76a" stopOpacity="0" /></radialGradient>
      </defs>
      <circle r="150" fill="url(#exCore)" />
      <g fill="none" stroke="#f5c76a" strokeWidth="1">
        {[70, 130, 190, 250, 320, 380].map((r) => <circle key={r} r={r} strokeOpacity=".22" />)}
        {Array.from({ length: 12 }, (_, i) => <ellipse key={`a${i}`} cy="-120" rx="34" ry="92" transform={`rotate(${i * 30})`} strokeOpacity=".4" />)}
        {Array.from({ length: 12 }, (_, i) => <ellipse key={`b${i}`} cy="-285" rx="26" ry="70" transform={`rotate(${i * 30 + 15})`} strokeOpacity=".28" />)}
      </g>
    </svg>
  );
}

function Thought() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % THOUGHTS.length), 7000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="h-12 flex items-center justify-center">
      <AnimatePresence mode="wait">
        <motion.p key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.6 }}
          className="italic text-sm md:text-base text-amber-100/70 text-center px-4">
          {THOUGHTS[i]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}

const CSS = `
.ex-bg{background:linear-gradient(180deg,#0a0716 0%,#130b28 55%,#0a0716 100%)}
.ex-stars{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cg fill='white'%3E%3Ccircle cx='18' cy='26' r='1.1'/%3E%3Ccircle cx='96' cy='60' r='.8'/%3E%3Ccircle cx='170' cy='20' r='1.3'/%3E%3Ccircle cx='220' cy='110' r='.9'/%3E%3Ccircle cx='60' cy='140' r='1'/%3E%3Ccircle cx='140' cy='180' r='.8'/%3E%3Ccircle cx='30' cy='210' r='1.2'/%3E%3Ccircle cx='200' cy='214' r='.9'/%3E%3C/g%3E%3C/svg%3E");background-size:240px 240px;animation:ex-tw 5s ease-in-out infinite alternate}
@keyframes ex-tw{from{opacity:.25}to{opacity:.85}}
.ex-spin{animation:ex-rot 160s linear infinite;will-change:transform}
@keyframes ex-rot{to{transform:rotate(360deg)}}
.ex-orbit{transform-box:view-box;transform-origin:50% 50%;animation:ex-rot 16s linear infinite}
.ex-rip{transform-box:view-box;transform-origin:50% 50%;opacity:0;animation:ex-rp 3.6s ease-out infinite var(--d)}
@keyframes ex-rp{0%{transform:scale(.2);opacity:.8}100%{transform:scale(1);opacity:0}}
.ex-float{animation:ex-fl 6s ease-in-out infinite}
@keyframes ex-fl{50%{transform:translateY(-6px)}}
.ex-gold{background:linear-gradient(90deg,#fde68a,#f5c76a,#fff1c1,#f5c76a);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 0 16px rgba(245,199,106,.3))}
@media (prefers-reduced-motion:reduce){.ex-stars,.ex-spin,.ex-orbit,.ex-rip,.ex-float{animation:none!important}.ex-rip{opacity:.4}}
`;

export default function ExplorePage() {
  return (
    <div className="ex-bg relative min-h-[100svh] flex flex-col px-5 py-6 md:p-8 overflow-hidden text-gray-200">
      <style>{CSS}</style>

      {/* Background (sab pointer-events-none) */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute -top-32 -left-24 w-[70vmax] h-[70vmax] max-w-[800px] max-h-[800px]" style={{ background: "radial-gradient(circle, rgba(139,92,246,.22), transparent 65%)" }} />
        <div className="absolute -bottom-40 -right-24 w-[70vmax] h-[70vmax] max-w-[800px] max-h-[800px]" style={{ background: "radial-gradient(circle, rgba(56,120,246,.16), transparent 65%)" }} />
        <div className="ex-stars" />
        <div className="absolute left-1/2 top-[42%] w-[150vmin] max-w-[1100px] aspect-square -translate-x-1/2 -translate-y-1/2 opacity-60"
          style={{ WebkitMaskImage: "radial-gradient(circle, #000 25%, transparent 70%)", maskImage: "radial-gradient(circle, #000 25%, transparent 70%)" }}>
          <Mandala />
        </div>
        {PHOTO && <img src={PHOTO} alt="" decoding="async" fetchPriority="low" className="absolute inset-0 w-full h-full object-cover opacity-20" />}
      </div>

      <nav className="relative z-10 max-w-5xl mx-auto w-full mb-6 md:mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] hover:bg-white/10 active:scale-95 px-4 py-2 text-sm text-amber-50/90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60">
          <ChevronLeft size={16} /> Back to Home
        </Link>
      </nav>

      <motion.main variants={container} initial="hidden" animate="show" className="relative z-10 max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center">
        <motion.header variants={item} className="text-center mb-10 md:mb-14">
          <h1 className="font-cinzel text-3xl sm:text-5xl md:text-6xl font-black tracking-[0.1em] md:tracking-widest mb-4">
            <span className="ex-gold">The Soul Dimension</span>
          </h1>
          <p className="text-gray-300/75 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
            Connect with seekers around the world, or share your deepest thoughts with your personal AI companion.
          </p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 max-w-4xl mx-auto w-full mb-8">
          {CARDS.map(({ href, title, tag, text, cta, accent, tint, Art }) => (
            <motion.div key={href} variants={item}>
              <Link href={href} className="group block h-full rounded-[2rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50">
                <motion.article
                  whileHover={{ y: -6 }} whileTap={{ scale: 0.985 }} transition={{ duration: 0.25 }}
                  className="relative h-full overflow-hidden rounded-[2rem] border border-white/[0.08] group-hover:border-white/20 p-6 md:p-9 flex flex-col shadow-[0_24px_60px_-28px_rgba(0,0,0,.9)] transition-colors"
                  style={{ background: `linear-gradient(160deg, ${tint}, rgba(255,255,255,.025) 55%)` }}
                >
                  <span className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(70% 55% at 50% 0%, ${tint}, transparent 70%)` }} />
                  <div className="relative flex items-start justify-between mb-6">
                    <div className="ex-float w-20 h-20 md:w-24 md:h-24"><Art /></div>
                    <span className="rounded-full border px-3 py-1 text-xs" style={{ color: accent, borderColor: `${accent}40`, background: `${accent}14` }}>{tag}</span>
                  </div>
                  <h3 className="relative text-2xl md:text-3xl font-semibold text-white mb-3">{title}</h3>
                  <p className="relative text-gray-300/75 text-sm md:text-[15px] leading-relaxed mb-8">{text}</p>
                  <div className="relative mt-auto flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all" style={{ color: accent }}>
                    {cta} <ChevronRight size={16} />
                  </div>
                </motion.article>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div variants={item}>
          <Thought />
          <p className="text-center text-xs text-gray-400/70 max-w-md mx-auto mt-3 leading-relaxed">
            Soul Echo is an AI companion, not a replacement for professional help. If you are in distress, please reach out to someone you trust or a local helpline.
          </p>
        </motion.div>
      </motion.main>
    </div>
  );
}
