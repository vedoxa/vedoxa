// @ts-nocheck
"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Save this file as: src/components/HeroSection.jsx
// Instant 0ms render: Starry Diwali sky, illuminated Book Library wings, sacred open book,
// skyline, 7 ornate diyas & 60fps interactive Patakhe canvas.
// Tap/click anywhere on the hero section to burst a firework at that exact spot.

const dict = {
  EN: {
    greet: "Happy Diwali",
    title: "Awaken Your Consciousness",
    sub: "100% original, verified digital books on spirituality & psychology.",
  },
  HI: {
    greet: "शुभ दीपावली",
    title: "अपनी चेतना को जागृत करें",
    sub: "आध्यात्मिकता और मनोविज्ञान पर 100% मूल, सत्यापित डिजिटल पुस्तकें।",
  },
};

const EMBERS = [
  { l: "7%", s: 4, t: "7.5s", d: "-1s", x: "20px" },
  { l: "17%", s: 3, t: "9s", d: "-4s", x: "-22px" },
  { l: "28%", s: 5, t: "8s", d: "-2s", x: "26px" },
  { l: "39%", s: 3.5, t: "10s", d: "-6s", x: "-16px" },
  { l: "51%", s: 4.5, t: "7.4s", d: "-3s", x: "20px" },
  { l: "63%", s: 3.5, t: "9.2s", d: "-5s", x: "-24px" },
  { l: "75%", s: 5, t: "8.4s", d: "-2.5s", x: "18px" },
  { l: "86%", s: 3, t: "7.8s", d: "-4.5s", x: "-18px" },
  { l: "93%", s: 4, t: "8.8s", d: "-1.5s", x: "-14px" },
];

const LANTERNS = [
  { l: "11%", t: "21s", d: "-6s", x: "26px", s: 0.92, m: false },
  { l: "27%", t: "25s", d: "-14s", x: "-28px", s: 0.76, m: true },
  { l: "42%", t: "23s", d: "-9s", x: "22px", s: 0.82, m: true },
  { l: "64%", t: "22s", d: "-11s", x: "28px", s: 0.85, m: true },
  { l: "79%", t: "26s", d: "-18s", x: "-24px", s: 0.95, m: false },
  { l: "90%", t: "24s", d: "-4s", x: "-18px", s: 0.78, m: true },
];

// 7 Diyas: Center diya (index 3) lights up first, then radiates outward to both sides. Mobile shows 5.
const DIYAS = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
  i,
  isCenter: i === 3,
  delay: 0.6 + Math.abs(i - 3) * 0.35,
  mobileHidden: i === 0 || i === 6,
}));

// Procedural Library Bookshelf Spines (Left & Right Wings)
const SHELF_BOOKS = [
  { x: 16, w: 13, h: 50, c: "#7c2d12", g: true },
  { x: 31, w: 11, h: 46, c: "#991b1b", g: false },
  { x: 44, w: 15, h: 54, c: "#78350f", g: true },
  { x: 61, w: 11, h: 45, c: "#4c1d95", g: true },
  { x: 74, w: 14, h: 52, c: "#9a3412", g: false },
  { x: 90, w: 12, h: 49, c: "#854d0e", g: true },
  { x: 104, w: 15, h: 55, c: "#7f1d1d", g: true },
  { x: 121, w: 11, h: 46, c: "#581c87", g: false },
  { x: 134, w: 14, h: 51, c: "#7c2d12", g: true },
];

const PALETTE = [
  [255, 210, 80],  // Royal Gold
  [255, 138, 42],  // Marigold Saffron
  [255, 78, 108],  // Kumkum Crimson
  [255, 240, 175], // Champagne Gold
  [245, 135, 255], // Lotus Magenta
  [105, 215, 255], // Peacock Cyan
];

// ---------- 60fps Diwali Patakhe Engine (Canvas) ----------
function useFireworks(wrapRef, canvasRef, burstRef) {
  useEffect(() => {
    const wrap = wrapRef.current,
      cv = canvasRef.current;
    if (!wrap || !cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = cv.getContext("2d", { alpha: true });
    const small = () => window.innerWidth < 640;
    let dpr = 1,
      w = 0,
      h = 0,
      raf = 0,
      last = 0,
      nextAt = 0.35,
      visible = true;
    const rockets = [],
      sparks = [],
      rings = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.5 : 2);
      const r = wrap.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const explode = (x, y) => {
      const c1 = PALETTE[(Math.random() * PALETTE.length) | 0];
      const c2 = PALETTE[(Math.random() * PALETTE.length) | 0];
      const gold = [255, 222, 125];
      const isMobile = small();
      const style = ["peony", "willow", "doubleRing", "crackle"][(Math.random() * 4) | 0];
      const n = isMobile ? 40 : 74;
      const power = (isMobile ? 105 : 160) * (0.85 + Math.random() * 0.45);

      // Expanding golden shockwave ring
      rings.push({ x, y, r: 4, maxR: isMobile ? 60 : 98, life: 0.7, c: c1 });

      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.09;
        let s = power * (0.28 + Math.random() * 0.72);
        let decay = 0.52 + Math.random() * 0.45;
        let color = i % 3 === 0 ? c2 : c1;
        let g = 72;
        let twinkle = Math.random() < 0.3;

        if (style === "doubleRing") {
          const outer = i % 2 === 0;
          s = outer ? power : power * 0.55;
          color = outer ? c1 : gold;
          decay = 0.62;
        } else if (style === "willow") {
          color = i % 4 === 0 ? c1 : gold;
          s = power * (0.45 + Math.random() * 0.55);
          decay = 0.35 + Math.random() * 0.22;
          g = 92;
          twinkle = true;
        } else if (style === "crackle") {
          color = i % 2 === 0 ? c1 : [255, 245, 200];
          twinkle = true;
        }

        sparks.push({
          x,
          y,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          life: 1,
          decay,
          c: color,
          g,
          twinkle,
          crackle: style === "crackle" && i % 6 === 0,
        });
      }

      // Center flash glow
      sparks.push({
        x,
        y,
        vx: 0,
        vy: 0,
        life: 0.42,
        decay: 2.1,
        c: [255, 255, 240],
        g: 0,
        flash: isMobile ? 20 : 32,
      });

      const maxSparks = isMobile ? 350 : 620;
      if (sparks.length > maxSparks) sparks.splice(0, sparks.length - maxSparks);
    };

    burstRef.current = explode;

    const launch = () => {
      rockets.push({
        x: w * (0.12 + Math.random() * 0.76),
        y: h * 0.92,
        ty: h * (0.12 + Math.random() * 0.33),
        vx: (Math.random() - 0.5) * 28,
        v: Math.max(320, h * 0.92),
      });
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
        if (Math.random() < 0.35) setTimeout(() => visible && launch(), 210);
        nextAt = 0.68 + Math.random() * 1.0;
      }

      // Rising rockets with golden spark trail
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y -= r.v * dt;
        r.x += r.vx * dt;

        if (Math.random() < 0.6) {
          sparks.push({
            x: r.x + (Math.random() - 0.5) * 2.5,
            y: r.y + 5,
            vx: (Math.random() - 0.5) * 16,
            vy: 22 + Math.random() * 24,
            life: 0.32,
            decay: 1.5,
            c: [255, 205, 115],
            g: 30,
          });
        }

        ctx.strokeStyle = "rgba(255,232,170,.95)";
        ctx.lineWidth = 2.1;
        ctx.beginPath();
        ctx.moveTo(r.x - r.vx * 0.045, r.y + 15);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();

        if (r.y <= r.ty) {
          explode(r.x, r.y);
          rockets.splice(i, 1);
        }
      }

      // Shockwave rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const rg = rings[i];
        rg.r += (rg.maxR - rg.r) * 6 * dt;
        rg.life -= 1.45 * dt;
        if (rg.life <= 0) {
          rings.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(${rg.c[0]},${rg.c[1]},${rg.c[2]},${rg.life * 0.42})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Explosion sparks
      const drag = Math.pow(0.13, dt);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        if (s.flash) {
          s.life -= s.decay * dt;
          if (s.life <= 0) {
            sparks.splice(i, 1);
            continue;
          }
          const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.flash);
          grad.addColorStop(0, `rgba(255,250,220,${s.life})`);
          grad.addColorStop(1, "rgba(255,180,50,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.flash, 0, Math.PI * 2);
          ctx.fill();
          continue;
        }

        s.vx *= drag;
        s.vy = s.vy * drag + (s.g || 70) * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= s.decay * dt;

        if (s.life <= 0) {
          if (s.crackle) {
            for (let k = 0; k < 2; k++) {
              const a = Math.random() * Math.PI * 2;
              sparks.push({
                x: s.x,
                y: s.y,
                vx: Math.cos(a) * 42,
                vy: Math.sin(a) * 42,
                life: 0.25,
                decay: 1.8,
                c: [255, 245, 190],
                g: 40,
              });
            }
          }
          sparks.splice(i, 1);
          continue;
        }

        const alpha = s.twinkle ? s.life * (0.55 + 0.45 * Math.sin(t * 0.035 + i)) : s.life;
        ctx.strokeStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${alpha})`;
        ctx.lineWidth = 1.15 + s.life * 1.45;
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 0.036, s.y - s.vy * 0.036);
        ctx.lineTo(s.x, s.y);
        ctx.stroke();
      }
    };

    const start = () => {
      if (!raf && visible && !document.hidden) {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const onVis = () => (document.hidden ? stop() : start());

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    // Pause animation when scrolled out of view or tab is hidden (saves battery & CPU)
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      visible ? start() : stop();
    });
    io.observe(wrap);
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      burstRef.current = null;
    };
  }, []);
}

const CSS = `
.dv-sky{background:radial-gradient(110% 70% at 50% 105%,rgba(255,142,35,.4),rgba(175,48,18,.18) 46%,transparent 70%),radial-gradient(60% 50% at 50% 42%,rgba(255,180,60,.13),transparent 70%),linear-gradient(180deg,#070312 0%,#140826 48%,#280e38 82%,#3a1330 100%)}
.dv-lib-bg{background-image:url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1500&q=75");background-size:cover;background-position:center 40%;mix-blend-mode:screen;opacity:.22;filter:sepia(.65) hue-rotate(-15deg) saturate(1.6) contrast(1.15);-webkit-mask-image:radial-gradient(ellipse 92% 85% at 50% 55%,rgba(0,0,0,.3) 15%,rgba(0,0,0,.95) 75%,transparent 100%);mask-image:radial-gradient(ellipse 92% 85% at 50% 55%,rgba(0,0,0,.3) 15%,rgba(0,0,0,.95) 75%,transparent 100%)}
.dv-stars{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cg fill='%23fff7d6'%3E%3Ccircle cx='18' cy='26' r='1.1'/%3E%3Ccircle cx='96' cy='60' r='.8'/%3E%3Ccircle cx='170' cy='20' r='1.3'/%3E%3Ccircle cx='220' cy='110' r='.9'/%3E%3Ccircle cx='60' cy='140' r='1'/%3E%3Ccircle cx='140' cy='180' r='.8'/%3E%3Ccircle cx='30' cy='210' r='1.2'/%3E%3Ccircle cx='200' cy='214' r='.9'/%3E%3Cpath d='M130 40L132 45L137 47L132 49L130 54L128 49L123 47L128 45Z' fill='%23fde68a' opacity='.7'/%3E%3C/g%3E%3C/svg%3E");background-size:240px 240px;animation:dv-tw 4s ease-in-out infinite alternate}
.dv-stars.b{background-size:170px 170px;background-position:60px 40px;animation-duration:6s;animation-delay:-2s;opacity:.55}
@keyframes dv-tw{from{opacity:.28}to{opacity:.95}}
.dv-mandala{animation:dv-spin 72s linear infinite;transform-origin:center}
@keyframes dv-spin{to{transform:rotate(360deg)}}
.dv-ember,.dv-lantern{position:absolute;bottom:-32px;opacity:0;will-change:transform,opacity;animation:dv-rise linear infinite}
.dv-ember{border-radius:50%;background:radial-gradient(circle,#fff3b0,#ff9a2e 62%,transparent 74%);box-shadow:0 0 8px rgba(255,180,60,.75)}
.dv-lantern{width:18px;height:25px;border-radius:6px 6px 9px 9px;background:radial-gradient(circle at 50% 65%,#fff7c2 0%,#ffb73b 45%,#ea580c 92%);box-shadow:0 0 20px 6px rgba(255,150,40,.48)}
@keyframes dv-rise{0%{transform:translate3d(0,0,0) scale(1);opacity:0}14%{opacity:.92}85%{opacity:.75}100%{transform:translate3d(var(--dx),-580px,0) scale(.48);opacity:0}}
.dv-gold{background:linear-gradient(92deg,#fde68a 0%,#f59e0b 24%,#fffbeb 50%,#d97706 76%,#fde68a 100%);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:dv-shine 5.5s linear infinite;filter:drop-shadow(0 4px 18px rgba(255,165,40,.45))}
@keyframes dv-shine{to{background-position:200% center}}
.dv-sway{transform-origin:50% 0%;animation:dv-pend 4.6s ease-in-out infinite alternate}
.dv-sway.b{animation-duration:5.4s;animation-delay:-1.8s}
@keyframes dv-pend{from{transform:rotate(-2.4deg)}to{transform:rotate(2.4deg)}}
.dv-book-float{animation:dv-bf 4s ease-in-out infinite alternate}
@keyframes dv-bf{from{transform:translateY(0)}to{transform:translateY(-5px)}}
.dv-diya{position:relative}
.dv-glow{position:absolute;left:50%;top:20%;width:270%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,185,65,.58),rgba(255,120,30,.18) 42%,transparent 70%);opacity:0;animation:dv-gi .85s ease-out both var(--d),dv-pu 2.3s ease-in-out infinite calc(var(--d) + .85s)}
@keyframes dv-gi{to{opacity:.95}}
@keyframes dv-pu{0%,100%{opacity:.72;transform:translate(-50%,-50%) scale(.96)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.06)}}
.dv-ign,.dv-flk{transform-box:fill-box;transform-origin:50% 100%}
.dv-ign{transform:scale(0);animation:dv-ig .7s cubic-bezier(.2,1.3,.4,1) both var(--d)}
@keyframes dv-ig{to{transform:scale(1)}}
.dv-flk{animation:dv-fl 1.25s ease-in-out infinite calc(var(--d) + .7s)}
@keyframes dv-fl{0%,100%{transform:scale(1,1) skewX(0)}25%{transform:scale(.93,1.08) skewX(-3deg)}50%{transform:scale(1.05,.95) skewX(2.2deg)}75%{transform:scale(.97,1.05) skewX(-1.6deg)}}
.dv-spine{animation:dv-sp 3.4s ease-in-out infinite alternate}
@keyframes dv-sp{from{opacity:.4}to{opacity:.95}}
@media (prefers-reduced-motion:reduce){.dv-stars,.dv-gold,.dv-glow,.dv-ign,.dv-flk,.dv-mandala,.dv-sway,.dv-book-float{animation:none!important}.dv-ign{transform:none}.dv-glow{opacity:.85}.dv-ember,.dv-lantern{display:none}}
`;

export default function HeroSection({ isDark = false, lang = "EN" }) {
  const t = dict[lang] || dict.EN;
  const wrapRef = useRef(null),
    canvasRef = useRef(null),
    burstRef = useRef(null);
  useFireworks(wrapRef, canvasRef, burstRef);

  const onTap = (e) => {
    const r = wrapRef.current.getBoundingClientRect();
    burstRef.current && burstRef.current(e.clientX - r.left, e.clientY - r.top);
  };
  const pageBg = isDark ? "#07070d" : "#f8fafc"; // Bottom fade blends into host page background

  return (
    <section
      ref={wrapRef}
      onPointerDown={onTap}
      style={{ touchAction: "manipulation" }}
      className="dv-sky relative overflow-hidden flex flex-col items-center justify-center text-center px-4 pt-14 pb-28 md:pt-24 md:pb-40 min-h-[440px] md:min-h-[540px] select-none cursor-pointer"
    >
      <style>{CSS}</style>

      {/* Shared SVG Gradients (0x0 size) */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="dvBowl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ea580c" />
            <stop offset=".55" stopColor="#b45309" />
            <stop offset="1" stopColor="#5c1f09" />
          </linearGradient>
          <linearGradient id="dvRim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#b45309" />
            <stop offset=".5" stopColor="#fde047" />
            <stop offset="1" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="dvFlame" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ea580c" />
            <stop offset=".55" stopColor="#ffc233" />
            <stop offset="1" stopColor="#fffbeb" />
          </linearGradient>
          <linearGradient id="dvShelf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a1021" />
            <stop offset="1" stopColor="#100516" />
          </linearGradient>
          <radialGradient id="dvAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity=".6" />
            <stop offset="55%" stopColor="#ea580c" stopOpacity=".18" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Layer 1: Starry Sky, Warm Book Library Backdrop, Sacred Mandala, Embers & Lanterns */}
      <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <div className="dv-stars" />
        <div className="dv-stars b" />
        <div className="dv-lib-bg absolute inset-0" />

        {/* Subtle Rotating Golden Mandala behind Title */}
        <div className="
```
