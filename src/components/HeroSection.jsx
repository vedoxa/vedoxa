// @ts-nocheck
"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Save this file as: src/components/HeroSection.jsx
// Koi image/video download nahi hota: sky, stars, skyline, diyas sab code se bante hain (0 KB network).
// Tap/click karne par us jagah patakha fut'ta hai.

const dict = {
  EN: { greet: "Happy Diwali", title: "Awaken Your Consciousness", sub: "100% original, verified digital books on spirituality & psychology." },
  HI: { greet: "शुभ दीपावली", title: "अपनी चेतना को जागृत करें", sub: "आध्यात्मिकता और मनोविज्ञान पर 100% मूल, सत्यापित डिजिटल पुस्तकें।" },
};

const EMBERS = [
  { l: "8%", s: 4, t: "7s", d: "-1s", x: "18px" }, { l: "19%", s: 3, t: "9s", d: "-4s", x: "-22px" },
  { l: "31%", s: 5, t: "8s", d: "-2s", x: "26px" }, { l: "44%", s: 3, t: "10s", d: "-6s", x: "-16px" },
  { l: "57%", s: 4, t: "7.5s", d: "-3s", x: "20px" }, { l: "69%", s: 5, t: "9.5s", d: "-5s", x: "-24px" },
  { l: "81%", s: 3, t: "8.5s", d: "-2.5s", x: "16px" }, { l: "92%", s: 4, t: "7s", d: "-4.5s", x: "-18px" },
];
const LANTERNS = [
  { l: "12%", t: "20s", d: "-6s", x: "26px", m: false }, { l: "34%", t: "24s", d: "-14s", x: "-30px", m: true },
  { l: "66%", t: "22s", d: "-9s", x: "28px", m: true }, { l: "87%", t: "26s", d: "-18s", x: "-24px", m: false },
];
// 7 diye: beech wala pehle jalta hai, phir dono taraf. Mobile par 5 dikhte hain.
const DIYAS = [0, 1, 2, 3, 4, 5, 6].map((i) => ({ i, delay: 0.9 + Math.abs(i - 3) * 0.4, mobileHidden: i === 0 || i === 6 }));

const PALETTE = [[255, 200, 70], [255, 130, 40], [255, 80, 100], [255, 230, 150], [255, 140, 210], [130, 210, 255]];

// ---------- Patakhe (canvas) ----------
function useFireworks(wrapRef, canvasRef, burstRef) {
  useEffect(() => {
    const wrap = wrapRef.current, cv = canvasRef.current;
    if (!wrap || !cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    const small = () => window.innerWidth < 640;
    let dpr = 1, w = 0, h = 0, raf = 0, last = 0, nextAt = 0.4, visible = true;
    const rockets = [], sparks = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.5 : 2);
      const r = wrap.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const explode = (x, y) => {
      const c = PALETTE[(Math.random() * PALETTE.length) | 0];
      const c2 = PALETTE[(Math.random() * PALETTE.length) | 0];
      const n = small() ? 34 : 64;
      const power = (small() ? 100 : 150) * (0.8 + Math.random() * 0.5);
      const ring = Math.random() < 0.35;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + Math.random() * 0.1;
        const s = ring ? power : power * (0.25 + Math.random() * 0.75);
        sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 1, decay: 0.55 + Math.random() * 0.5, c: i % 3 === 0 ? c2 : c });
      }
      if (sparks.length > 420) sparks.splice(0, sparks.length - 420);
    };
    burstRef.current = explode;

    const launch = () => {
      rockets.push({ x: w * (0.1 + Math.random() * 0.8), y: h * 0.92, ty: h * (0.12 + Math.random() * 0.33), vx: (Math.random() - 0.5) * 24, v: Math.max(300, h * 0.9) });
    };

    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((t - last) / 1000 || 0.016, 0.05);
      last = t;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      nextAt -= dt;
      if (nextAt <= 0) {
        launch();
        if (Math.random() < 0.3) setTimeout(launch, 220);
        nextAt = 0.7 + Math.random() * 1.1;
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y -= r.v * dt; r.x += r.vx * dt;
        ctx.strokeStyle = "rgba(255,225,160,.9)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(r.x - r.vx * 0.05, r.y + 14); ctx.lineTo(r.x, r.y); ctx.stroke();
        if (r.y <= r.ty) { explode(r.x, r.y); rockets.splice(i, 1); }
      }

      const drag = Math.pow(0.12, dt);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.vx *= drag; s.vy = s.vy * drag + 70 * dt;
        s.x += s.vx * dt; s.y += s.vy * dt;
        s.life -= s.decay * dt;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${s.life})`;
        ctx.lineWidth = 1.2 + s.life * 1.3;
        ctx.beginPath(); ctx.moveTo(s.x - s.vx * 0.035, s.y - s.vy * 0.035); ctx.lineTo(s.x, s.y); ctx.stroke();
      }
    };

    const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const onVis = () => (document.hidden ? stop() : start());

    resize();
    const ro = new ResizeObserver(resize); ro.observe(wrap);
    // Section screen se bahar ho ya tab hidden ho to animation ruk jaata hai (battery + speed).
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); });
    io.observe(wrap);
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => { stop(); ro.disconnect(); io.disconnect(); document.removeEventListener("visibilitychange", onVis); burstRef.current = null; };
  }, []);
}

const CSS = `
.dv-sky{background:radial-gradient(120% 70% at 50% 108%,rgba(255,140,40,.34),transparent 60%),linear-gradient(180deg,#090516 0%,#170a2b 55%,#2a1036 100%)}
.dv-stars{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cg fill='white'%3E%3Ccircle cx='18' cy='26' r='1.1'/%3E%3Ccircle cx='96' cy='60' r='.8'/%3E%3Ccircle cx='170' cy='20' r='1.3'/%3E%3Ccircle cx='220' cy='110' r='.9'/%3E%3Ccircle cx='60' cy='140' r='1'/%3E%3Ccircle cx='140' cy='180' r='.8'/%3E%3Ccircle cx='30' cy='210' r='1.2'/%3E%3Ccircle cx='200' cy='214' r='.9'/%3E%3C/g%3E%3C/svg%3E");background-size:240px 240px;animation:dv-tw 4s ease-in-out infinite alternate}
.dv-stars.b{background-size:170px 170px;background-position:60px 40px;animation-duration:6s;animation-delay:-2s;opacity:.6}
@keyframes dv-tw{from{opacity:.3}to{opacity:1}}
.dv-ember,.dv-lantern{position:absolute;bottom:-30px;opacity:0;will-change:transform,opacity;animation:dv-rise linear infinite}
.dv-ember{border-radius:50%;background:radial-gradient(circle,#ffe29a,#ff9a2e 60%,transparent 72%)}
.dv-lantern{width:16px;height:22px;border-radius:6px 6px 9px 9px;background:linear-gradient(#ffd27a,#ff8a1f);box-shadow:0 0 18px 6px rgba(255,150,40,.45)}
@keyframes dv-rise{0%{transform:translate3d(0,0,0) scale(1);opacity:0}15%{opacity:.9}100%{transform:translate3d(var(--dx),-560px,0) scale(.5);opacity:0}}
.dv-gold{background:linear-gradient(90deg,#fde68a,#f59e0b,#fff3c4,#f59e0b,#fde68a);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:dv-shine 6s linear infinite;filter:drop-shadow(0 0 14px rgba(255,170,50,.4))}
@keyframes dv-shine{to{background-position:200% center}}
.dv-diya{position:relative}
.dv-glow{position:absolute;left:50%;top:22%;width:260%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,176,64,.5),rgba(255,120,30,.15) 40%,transparent 68%);opacity:0;animation:dv-gi .9s ease-out both var(--d),dv-pu 2.4s ease-in-out infinite calc(var(--d) + .9s)}
@keyframes dv-gi{to{opacity:.9}}
@keyframes dv-pu{0%,100%{opacity:.7}50%{opacity:1}}
.dv-ign,.dv-flk{transform-box:fill-box;transform-origin:50% 100%}
.dv-ign{transform:scale(0);animation:dv-ig .7s cubic-bezier(.2,1.3,.4,1) both var(--d)}
@keyframes dv-ig{to{transform:scale(1)}}
.dv-flk{animation:dv-fl 1.3s ease-in-out infinite calc(var(--d) + .7s)}
@keyframes dv-fl{0%,100%{transform:scale(1,1) skewX(0)}25%{transform:scale(.94,1.08) skewX(-3deg)}50%{transform:scale(1.05,.95) skewX(2deg)}75%{transform:scale(.97,1.05) skewX(-1.5deg)}}
@media (prefers-reduced-motion:reduce){.dv-stars,.dv-gold,.dv-glow,.dv-ign,.dv-flk{animation:none!important}.dv-ign{transform:none}.dv-glow{opacity:.8}.dv-ember,.dv-lantern{display:none}}
`;

export default function HeroSection({ isDark = false, lang = "EN" }) {
  const t = dict[lang] || dict.EN;
  const wrapRef = useRef(null), canvasRef = useRef(null), burstRef = useRef(null);
  useFireworks(wrapRef, canvasRef, burstRef);

  const onTap = (e) => {
    const r = wrapRef.current.getBoundingClientRect();
    burstRef.current && burstRef.current(e.clientX - r.left, e.clientY - r.top);
  };
  const pageBg = isDark ? "#07070d" : "#f8fafc"; // neeche ka fade aapke page ke rang me mil jaata hai

  return (
    <section
      ref={wrapRef}
      onPointerDown={onTap}
      style={{ touchAction: "manipulation" }}
      className="dv-sky relative overflow-hidden flex flex-col items-center justify-center text-center px-4 pt-14 pb-28 md:pt-24 md:pb-40 min-h-[440px] md:min-h-[540px]"
    >
      <style>{CSS}</style>

      {/* Diye ke gradients ek hi baar define (0 size svg) */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="dvBowl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e2691f" /><stop offset="1" stopColor="#7c2d12" /></linearGradient>
          <linearGradient id="dvFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff7a18" /><stop offset=".6" stopColor="#ffc233" /><stop offset="1" stopColor="#fff3b0" /></linearGradient>
        </defs>
      </svg>

      {/* Aasmaan: taare, urte angaare, aakash kandil */}
      <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <div className="dv-stars" />
        <div className="dv-stars b" />
        {EMBERS.map((p, k) => (
          <span key={k} className="dv-ember" style={{ left: p.l, width: p.s, height: p.s, animationDuration: p.t, animationDelay: p.d, "--dx": p.x }} />
        ))}
        {LANTERNS.map((p, k) => (
          <span key={k} className={`dv-lantern ${p.m ? "hidden md:block" : ""}`} style={{ left: p.l, animationDuration: p.t, animationDelay: p.d, "--dx": p.x }} />
        ))}
      </div>

      {/* Patakhe */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-[2]" aria-hidden="true" />

      {/* Mandir/shehar ki skyline */}
      <svg viewBox="0 0 1200 120" preserveAspectRatio="xMidYMax slice" className="absolute bottom-0 left-0 w-full h-16 md:h-24 pointer-events-none z-[3]" aria-hidden="true">
        <path fill="#0a0614" d="M0 120V96h70v-10q14-30 28 0v10h46V74l14-30 14 30v22h60V88h36V96h60V80q18-34 36 0v16h50V70l16-36 16 36v26h70V92h40v4h80V84q14-26 28 0v12h56V76l12-26 12 26v20h70V90h50V96h90V82q16-30 32 0v14h60V72l14-30 14 30v24h70V94h60V96H1200V120Z" />
      </svg>
      <div className="absolute bottom-0 inset-x-0 h-14 pointer-events-none z-[4]" style={{ background: `linear-gradient(to bottom, transparent, ${pageBg})` }} />

      {/* Diye */}
      <div className="absolute bottom-5 md:bottom-8 inset-x-0 px-3 md:px-10 flex justify-around items-end pointer-events-none z-[6]" aria-hidden="true">
        {DIYAS.map((d) => (
          <div key={d.i} className={`dv-diya w-10 sm:w-12 md:w-14 lg:w-16 ${d.mobileHidden ? "hidden md:block" : ""}`} style={{ "--d": `${d.delay}s` }}>
            <span className="dv-glow" />
            <svg viewBox="0 0 64 56" className="relative block w-full h-auto">
              <path d="M4 24C8 46 22 52 32 52S56 46 60 24C48 30 16 30 4 24Z" fill="url(#dvBowl)" />
              <ellipse cx="32" cy="24" rx="27" ry="4.5" fill="#ffb347" />
              <rect x="30.8" y="17" width="2.4" height="8" rx="1" fill="#3b1d0e" />
              <g className="dv-ign">
                <g className="dv-flk">
                  <path d="M32 2C39 11 41 17 32 22C23 17 25 11 32 2Z" fill="url(#dvFlame)" />
                  <path d="M32 11C35 15 36 18 32 21C28 18 29 15 32 11Z" fill="#fff8dc" opacity=".9" />
                </g>
              </g>
            </svg>
          </div>
        ))}
      </div>

      {/* Text */}
      <motion.p
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mb-4 text-sm md:text-base tracking-wide text-amber-200/90"
      >
        🪔 {t.greet} 🪔
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 font-cinzel text-[2rem] leading-tight sm:text-5xl md:text-6xl lg:text-7xl font-black mb-5 max-w-4xl mx-auto"
      >
        <span className="dv-gold">{t.title}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-xl mx-auto text-sm md:text-lg px-2 leading-relaxed font-medium text-amber-50/90"
      >
        {t.sub}
      </motion.p>
    </section>
  );
}
