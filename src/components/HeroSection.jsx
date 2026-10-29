// @ts-nocheck
"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Save as: src/components/HeroSection.jsx
// Ultra-Lite 3D Diwali Library Hero (0 images, 0 audio, 0 extra buttons)
// Mobile par sirf ~1/4 screen (compact banner) leta hai taaki niche ki books turant dikhein,
// aur Desktop/Laptop par grand 3D look deta hai.

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

// Lightweight 3D Rising Embers
const EMBERS = [
  { l: "10%", s: 4, t: "6.5s", d: "-1s", x: "16px" },
  { l: "26%", s: 3, t: "8s", d: "-3.5s", x: "-18px" },
  { l: "45%", s: 5, t: "7s", d: "-2s", x: "20px" },
  { l: "64%", s: 3.5, t: "8.5s", d: "-5s", x: "-15px" },
  { l: "80%", s: 4.5, t: "6.8s", d: "-2.5s", x: "18px" },
  { l: "91%", s: 3, t: "7.5s", d: "-4s", x: "-14px" },
];

// 7 3D Diyas (Mobile par 5 dikhenge, Center diya thoda aage aur bada 3D depth ke liye)
const DIYAS = [0, 1, 2, 3, 4, 5, 6].map((i) => {
  const dist = Math.abs(i - 3);
  return {
    i,
    delay: 0.3 + dist * 0.2,
    scale: 1.12 - dist * 0.07,
    yOff: dist * 2,
    mobileHidden: i === 0 || i === 6,
  };
});

const PALETTE = [
  [255, 210, 80],
  [255, 135, 45],
  [255, 80, 110],
  [255, 240, 170],
  [130, 215, 255],
  [180, 255, 195],
];

/* ═══════════ Fast Deterministic RNG ═══════════ */
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ═══════════ Pure SVG 3D Library & Arch (Built once, 0 network requests) ═══════════ */
function buildLibrary() {
  const r = rng(20261022);
  const PAL = [
    "#7f1d1d", "#9a3412", "#92400e", "#78350f", "#1e3a5f",
    "#1e40af", "#312e81", "#581c87", "#831843", "#14532d",
    "#115e59", "#a16207", "#7c2d12", "#9f1239",
  ];
  const WIN = { x1: 420, x2: 780, sill: 480, spring: 205, rad: 180 };
  const wall = `M0 0H1200V640H0Z M${WIN.x1} ${WIN.sill}V${WIN.spring}A${WIN.rad} ${WIN.rad} 0 0 1 ${WIN.x2} ${WIN.spring}V${WIN.sill}Z`;

  let s =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 640" preserveAspectRatio="xMidYMax slice" style="width:100%;height:100%;display:block" aria-hidden="true"><defs>` +
    `<linearGradient id="dvWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b87a3d"/><stop offset="1" stop-color="#47240c"/></linearGradient>` +
    `<linearGradient id="dvShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".65"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>` +
    `<radialGradient id="dvMoon"><stop offset="0" stop-color="#fff8db" stop-opacity=".75"/><stop offset="1" stop-color="#fff8db" stop-opacity="0"/></radialGradient></defs>`;

  // Moon inside window
  s += `<circle cx="680" cy="122" r="54" fill="url(#dvMoon)"/><circle cx="680" cy="122" r="18" fill="#fff8db"/>`;
  // Library Wall with Arch Window
  s += `<path d="${wall}" fill-rule="evenodd" fill="#13091c"/>`;

  // Bookshelves
  const baselines = [170, 320, 470, 620];
  for (const b of baselines) {
    const segs = b <= 470 ? [[12, WIN.x1 - 8], [WIN.x2 + 8, 1188]] : [[12, 1188]];
    for (const [start, end] of segs) {
      let x = start;
      while (x < end - 14) {
        if (r() < 0.05) {
          x += 14 + Math.floor(r() * 10);
          continue;
        }
        let w = 15 + Math.floor(r() * 17);
        if (x + w > end) w = end - x;
        if (w < 10) break;
        const h = 126 - Math.floor(r() * 44),
          y = b - h;
        const c = PAL[Math.floor(r() * PAL.length)];
        s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.8" fill="${c}"/>`;
        s += `<rect x="${x}" y="${y}" width="3" height="${h}" fill="#fff" opacity=".1"/>`;
        if (r() < 0.7) s += `<rect x="${x + 1}" y="${y + 10}" width="${w - 2}" height="2.6" fill="#fcd34d" opacity=".78"/>`;
        if (r() < 0.5) s += `<rect x="${x + 1}" y="${y + h - 13}" width="${w - 2}" height="2.6" fill="#fcd34d" opacity=".65"/>`;
        x += w + 1.5;
      }
      s +=
        `<rect x="${start - 8}" y="${b}" width="${end - start + 16}" height="9" fill="url(#dvWood)"/>` +
        `<rect x="${start - 8}" y="${b + 9}" width="${end - start + 16}" height="14" fill="url(#dvShade)"/>`;
    }
  }

  // Dim overlay for crisp foreground text
  s += `<path d="${wall}" fill-rule="evenodd" fill="rgba(9,4,18,.42)"/>`;

  // Golden 3D Arch Frame
  s +=
    `<path d="M${WIN.x1} ${WIN.sill}V${WIN.spring}A${WIN.rad} ${WIN.rad} 0 0 1 ${WIN.x2} ${WIN.spring}V${WIN.sill}" fill="none" stroke="url(#dvWood)" stroke-width="11"/>` +
    `<path d="M${WIN.x1} ${WIN.sill}V${WIN.spring}A${WIN.rad} ${WIN.rad} 0 0 1 ${WIN.x2} ${WIN.spring}V${WIN.sill}" fill="none" stroke="#fde68a" stroke-width="1.6" opacity=".65"/>` +
    `<rect x="${WIN.x1 - 14}" y="${WIN.sill}" width="${WIN.x2 - WIN.x1 + 28}" height="11" rx="2" fill="url(#dvWood)"/>`;

  return s + `</svg>`;
}

function buildToran() {
  const cols = ["#ffd166", "#ff9f1c", "#ff5d8f", "#fff1b8"];
  let d = "M0 5",
    bulbs = "",
    n = 0;
  for (let i = 0; i < 4; i++) {
    const x0 = i * 300,
      x2 = x0 + 300,
      cx = x0 + 150,
      cy = 78,
      y0 = 5;
    d += ` Q${cx} ${cy} ${x2} ${y0}`;
    for (let k = 1; k <= 6; k++) {
      const t = k / 7,
        m = 1 - t;
      const x = (m * m * x0 + 2 * m * t * cx + t * t * x2).toFixed(1);
      const y = (m * m * y0 + 2 * m * t * cy + t * t * y0).toFixed(1);
      const c = cols[n % 4];
      const dl = ((n * 0.37) % 3).toFixed(2);
      bulbs +=
        `<circle cx="${x}" cy="${y}" r="8.5" fill="${c}" fill-opacity=".26" class="dv-bulb" style="animation-delay:-${dl}s"/>` +
        `<circle cx="${x}" cy="${y}" r="3.4" fill="${c}" class="dv-bulb" style="animation-delay:-${dl}s"/>`;
      n++;
    }
    if (i > 0) bulbs += `<circle cx="${x0}" cy="5" r="4" fill="#f59e0b"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 88" preserveAspectRatio="xMidYMin slice" style="width:100%;height:100%;display:block" aria-hidden="true"><path d="${d}" fill="none" stroke="#854d1e" stroke-width="1.6" opacity=".85"/>${bulbs}</svg>`;
}

const LIBRARY_SVG = buildLibrary();
const TORAN_SVG = buildToran();

/* ═══════════ Ultra-Lite 3D Out-of-Screen Fireworks Engine (Canvas) ═══════════ */
function useFireworks3D(wrapRef, canvasRef, apiRef) {
  useEffect(() => {
    const wrap = wrapRef.current,
      cv = canvasRef.current;
    if (!wrap || !cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const small = () => window.innerWidth < 640;
    let dpr = 1,
      w = 0,
      h = 0,
      raf = 0,
      last = 0,
      nextAt = 0.45,
      visible = true;
    const rockets = [],
      sparks = [],
      flashes = [];
    const FOV = 340; // 3D Perspective FOV so sparks pop out towards the viewer

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.35 : 1.85);
      const r = wrap.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const pickColor = () => PALETTE[(Math.random() * PALETTE.length) | 0];

    const explode = (x, y) => {
      const c = pickColor(),
        c2 = pickColor();
      const sm = small();
      const power = (sm ? 92 : 145) * (0.85 + Math.random() * 0.35);
      const n = sm ? 30 : 54;

      flashes.push({ x, y, life: 1, c });

      // 3D Spherical Burst (vz sends sparks towards the screen for 3D pop-out effect)
      for (let i = 0; i < n; i++) {
        const theta = (i / n) * Math.PI * 2 + Math.random() * 0.15;
        const phi = Math.acos(2 * Math.random() - 1);
        const sp = power * (0.35 + Math.random() * 0.65);
        const sinPhi = Math.sin(phi);
        sparks.push({
          x,
          y,
          z: 0,
          vx: Math.cos(theta) * sinPhi * sp,
          vy: Math.sin(theta) * sinPhi * sp,
          vz: Math.cos(phi) * sp * 1.25,
          life: 1,
          decay: 0.62 + Math.random() * 0.45,
          c: i % 3 === 0 ? c2 : c,
          g: 62,
          dr: 0.15,
          tl: 0.04,
          bokeh: i % 6 === 0,
        });
      }

      const cap = sm ? 180 : 340;
      if (sparks.length > cap) sparks.splice(0, sparks.length - cap);
    };

    const launch = (tx, ty) => {
      const aimed = typeof tx === "number";
      const sx = aimed ? tx : w * (0.12 + Math.random() * 0.76);
      rockets.push({
        x: sx,
        y: h * 0.96,
        ty: aimed ? Math.max(24, ty) : h * (0.12 + Math.random() * 0.34),
        vx: aimed ? 0 : (Math.random() - 0.5) * 18,
        v: Math.max(320, h * (aimed ? 1.45 : 1.05)),
      });
    };

    apiRef.current = { launch };

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
        nextAt = 0.85 + Math.random() * 1.15;
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const rk = rockets[i];
        rk.y -= rk.v * dt;
        rk.x += rk.vx * dt;
        ctx.strokeStyle = "rgba(255,230,165,.88)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(rk.x - rk.vx * 0.04, rk.y + 14);
        ctx.lineTo(rk.x, rk.y);
        ctx.stroke();

        if (rk.y <= rk.ty) {
          explode(rk.x, rk.y);
          rockets.splice(i, 1);
        }
      }

      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.life -= dt * 4.2;
        if (f.life <= 0) {
          flashes.splice(i, 1);
          continue;
        }
        const rad = 64 * (1.15 - f.life * 0.5);
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, rad);
        g.addColorStop(0, `rgba(${f.c[0]},${f.c[1]},${f.c[2]},${0.52 * f.life})`);
        g.addColorStop(1, `rgba(${f.c[0]},${f.c[1]},${f.c[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, rad, 0, 6.2832);
        ctx.fill();
      }

      const cx = w * 0.5,
        cy = h * 0.45;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        const drag = Math.pow(s.dr, dt);
        s.vx *= drag;
        s.vy = s.vy * drag + s.g * dt;
        s.vz *= drag;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.z = Math.min(FOV - 45, s.z + s.vz * dt);
        s.life -= s.decay * dt;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        // 3D Perspective Projection (sparks coming closer scale up like a 3D video!)
        const persp = FOV / Math.max(50, FOV - s.z);
        const sx = cx + (s.x - cx) * persp;
        const sy = cy + (s.y - cy) * persp;
        const px = cx + (s.x - s.vx * s.tl - cx) * persp;
        const py = cy + (s.y - s.vy * s.tl - cy) * persp;

        ctx.strokeStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${s.life})`;
        ctx.lineWidth = Math.min(5, (1 + s.life * 1.3) * persp);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        if (s.bokeh && persp > 1.15) {
          ctx.fillStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${s.life * 0.25})`;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.min(12, 3.6 * persp * s.life), 0, 6.2832);
          ctx.fill();
        }
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
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro && ro.observe(wrap);
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([e]) => {
            visible = e.isIntersecting;
            visible ? start() : stop();
          })
        : null;
    io && io.observe(wrap);
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop();
      ro && ro.disconnect();
      io && io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      apiRef.current = null;
    };
  }, [wrapRef, canvasRef, apiRef]);
}

const CSS = `
.dv-sky{
  perspective: 900px;
  background:
    radial-gradient(115% 70% at 50% 105%,rgba(255,140,40,.36),transparent 60%),
    linear-gradient(180deg,#080414 0%,#160929 55%,#280f34 100%);
}
.dv-stars{
  position:absolute;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cg fill='white'%3E%3Ccircle cx='18' cy='26' r='1.1'/%3E%3Ccircle cx='96' cy='60' r='.8'/%3E%3Ccircle cx='170' cy='20' r='1.2'/%3E%3Ccircle cx='60' cy='140' r='1'/%3E%3Ccircle cx='140' cy='180' r='.8'/%3E%3Ccircle cx='200' cy='190' r='1'/%3E%3C/g%3E%3C/svg%3E");
  background-size:220px 220px;
  animation:dv-tw 3.8s ease-in-out infinite alternate;
}
@keyframes dv-tw{from{opacity:.35}to{opacity:.95}}

/* Smooth 3D Video-like Camera Sway */
.dv-lib3d{
  transform-origin:50% 65%;
  will-change:transform;
  animation:dv-cam3d 16s ease-in-out infinite alternate;
}
@keyframes dv-cam3d{
  0%   { transform: scale(1.03) rotateX(1.5deg) rotateY(-2deg); }
  50%  { transform: scale(1.06) rotateX(-1deg) rotateY(0deg); }
  100% { transform: scale(1.03) rotateX(1.5deg) rotateY(2deg); }
}

.dv-rays{
  position:absolute;left:50%;top:0;width:72%;height:100%;
  transform:translateX(-50%);
  background:linear-gradient(180deg,rgba(255,196,110,.22),transparent 74%);
  clip-path:polygon(40% 0,60% 0,100% 100%,0 100%);
  animation:dv-ray 4.5s ease-in-out infinite alternate;
}
@keyframes dv-ray{from{opacity:.45}to{opacity:.95}}

.dv-bulb{animation:dv-bt 2.2s ease-in-out infinite alternate}
@keyframes dv-bt{from{opacity:.45}to{opacity:1}}

.dv-ember{
  position:absolute;bottom:-20px;opacity:0;
  border-radius:50%;
  background:radial-gradient(circle,#fffbeb,#fbbf24 55%,transparent 75%);
  box-shadow:0 0 8px rgba(251,191,36,.6);
  will-change:transform,opacity;
  animation:dv-rise linear infinite;
}
@keyframes dv-rise{
  0%{transform:translate3d(0,0,0) scale(.8);opacity:0}
  18%{opacity:.95}
  100%{transform:translate3d(var(--dx),-260px,0) scale(1.15);opacity:0}
}

/* 3D Pop-Out Gold Title */
.dv-gold{
  background:linear-gradient(92deg,#fef08a,#f59e0b,#fffbeb,#f59e0b,#fef08a);
  background-size:200% auto;
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
  animation:dv-shine 5s linear infinite;
  filter:
    drop-shadow(0 2px 0 rgba(120,53,15,.95))
    drop-shadow(0 6px 14px rgba(0,0,0,.85))
    drop-shadow(0 0 18px rgba(245,158,11,.45));
}
@keyframes dv-shine{to{background-position:200% center}}

.dv-chip{
  background:rgba(20,8,32,.62);
  border:1px solid rgba(252,211,77,.35);
  box-shadow:0 6px 20px -4px rgba(245,158,11,.45);
}
.dv-sub{text-shadow:0 2px 12px rgba(0,0,0,.9)}

.dv-diya{
  position:relative;
  filter:drop-shadow(0 6px 10px rgba(0,0,0,.8));
}
.dv-glow{
  position:absolute;left:50%;top:20%;width:250%;aspect-ratio:1;
  transform:translate(-50%,-50%);
  border-radius:50%;
  background:radial-gradient(circle,rgba(255,180,65,.55),rgba(255,120,30,.16) 42%,transparent 70%);
  opacity:0;
  animation:dv-gi .7s ease-out both var(--d),dv-pu 2.2s ease-in-out infinite calc(var(--d) + .7s);
}
@keyframes dv-gi{to{opacity:.92}}
@keyframes dv-pu{0%,100%{opacity:.7}50%{opacity:1}}
.dv-ign,.dv-flk{transform-box:fill-box;transform-origin:50% 100%}
.dv-ign{transform:scale(0);animation:dv-ig .6s cubic-bezier(.2,1.3,.4,1) both var(--d)}
@keyframes dv-ig{to{transform:scale(1)}}
.dv-flk{animation:dv-fl 1.2s ease-in-out infinite calc(var(--d) + .6s)}
@keyframes dv-fl{
  0%,100%{transform:scale(1,1) skewX(0)}
  25%{transform:scale(.94,1.08) skewX(-3deg)}
  50%{transform:scale(1.05,.95) skewX(2deg)}
  75%{transform:scale(.97,1.05) skewX(-1.5deg)}
}

@media (prefers-reduced-motion:reduce){
  .dv-stars,.dv-gold,.dv-glow,.dv-ign,.dv-flk,.dv-lib3d,.dv-rays,.dv-bulb{animation:none!important}
  .dv-ign{transform:none}.dv-glow{opacity:.8}.dv-ember{display:none}
}
`;

const EASE = [0.16, 1, 0.3, 1];

export default function HeroSection({ isDark = true, lang = "EN" }) {
  const t = dict[lang] || dict.EN;
  const wrapRef = useRef(null),
    canvasRef = useRef(null),
    apiRef = useRef(null);

  useFireworks3D(wrapRef, canvasRef, apiRef);

  const onTap = (e) => {
    const api = apiRef.current;
    if (!api || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    api.launch(e.clientX - r.left, e.clientY - r.top);
  };

  const pageBg = isDark ? "#07070d" : "#f8fafc";

  return (
    <section
      ref={wrapRef}
      onPointerDown={onTap}
      style={{ touchAction: "manipulation" }}
      className="dv-sky relative overflow-hidden flex flex-col items-center justify-center text-center px-3 pt-5 pb-11 sm:pt-8 sm:pb-14 md:pt-12 md:pb-20 min-h-[190px] sm:min-h-[240px] md:min-h-[340px] lg:min-h-[380px] select-none"
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Shared Diya SVG Gradients */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="dvBowl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f59e0b" />
            <stop offset=".5" stopColor="#b45309" />
            <stop offset="1" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id="dvFlame" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ea580c" />
            <stop offset=".6" stopColor="#facc15" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </svg>

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <div className="dv-stars" />
      </div>

      {/* 3D Animated Library + Arch Window + Moon */}
      <div
        className="dv-lib3d absolute inset-0 pointer-events-none z-[2]"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: LIBRARY_SVG }}
      />

      {/* Warm Light Rays & Soft Text Backdrop */}
      <div className="absolute inset-0 pointer-events-none z-[3]" aria-hidden="true">
        <div className="dv-rays" />
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 62% 50% at 50% 45%,rgba(9,5,22,.72),transparent 100%)",
          }}
        />
      </div>

      {/* 3D Perspective Fireworks Canvas (Popping out towards screen) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[4]"
        aria-hidden="true"
      />

      {/* Top Toran Lights */}
      <div
        className="absolute top-0 inset-x-0 h-7 sm:h-10 md:h-14 pointer-events-none z-[5]"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: TORAN_SVG }}
      />

      {/* Floating 3D Golden Embers */}
      <div className="absolute inset-0 pointer-events-none z-[5]" aria-hidden="true">
        {EMBERS.map((p, k) => (
          <span
            key={k}
            className="dv-ember"
            style={{
              left: p.l,
              width: p.s,
              height: p.s,
              animationDuration: p.t,
              animationDelay: p.d,
              "--dx": p.x,
            }}
          />
        ))}
      </div>

      {/* Smooth Bottom Fade into Website Background */}
      <div
        className="absolute bottom-0 inset-x-0 h-8 md:h-12 pointer-events-none z-[6]"
        style={{ background: `linear-gradient(to bottom, transparent, ${pageBg})` }}
      />

      {/* 3D Curved Diya Row at Bottom */}
      <div
        className="absolute bottom-1.5 sm:bottom-2.5 md:bottom-4 inset-x-0 px-3 md:px-12 flex justify-around items-end pointer-events-none z-[7]"
        aria-hidden="true"
      >
        {DIYAS.map((d) => (
          <div
            key={d.i}
            className={`dv-diya w-7 sm:w-9 md:w-12 lg:w-14 ${d.mobileHidden ? "hidden md:block" : ""}`}
            style={{
              "--d": `${d.delay}s`,
              transform: `translateY(${-d.yOff}px) scale(${d.scale})`,
            }}
          >
            <span className="dv-glow" />
            <svg viewBox="0 0 64 56" className="relative block w-full h-auto">
              <ellipse cx="32" cy="52" rx="20" ry="3" fill="#f59e0b" opacity=".3" />
              <path
                d="M4 24C8 46 22 52 32 52S56 46 60 24C48 30 16 30 4 24Z"
                fill="url(#dvBowl)"
                stroke="#fde68a"
                strokeWidth="0.6"
              />
              <path
                d="M12 34Q32 44 52 34"
                fill="none"
                stroke="#fde047"
                strokeWidth="1.2"
                opacity=".65"
                strokeLinecap="round"
              />
              <ellipse cx="32" cy="24" rx="27" ry="4.5" fill="#fbbf24" />
              <rect x="30.8" y="17" width="2.4" height="8" rx="1" fill="#3b1d0e" />
              <g className="dv-ign">
                <g className="dv-flk">
                  <path d="M32 1C40 11 42 17 32 22C22 17 24 11 32 1Z" fill="url(#dvFlame)" />
                  <path d="M32 10C35 15 36 18 32 21C28 18 29 15 32 10Z" fill="#fffbeb" opacity=".92" />
                </g>
              </g>
            </svg>
          </div>
        ))}
      </div>

      {/* Compact 3D Foreground Text */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="dv-chip relative z-10 mb-1.5 sm:mb-2.5 inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 sm:px-4 sm:py-1 text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide text-amber-200"
      >
        🪔 {t.greet} 🪔
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease: EASE }}
        className="relative z-10 font-cinzel text-xl leading-snug sm:text-3xl md:text-5xl lg:text-6xl font-black mb-1 sm:mb-2 max-w-4xl mx-auto"
      >
        <span className="dv-gold">{t.title}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16, ease: EASE }}
        className="dv-sub relative z-10 max-w-lg md:max-w-xl mx-auto text-xs sm:text-sm md:text-base px-2 leading-relaxed font-medium text-amber-50/90"
      >
        {t.sub}
      </motion.p>
    </section>
  );
}
