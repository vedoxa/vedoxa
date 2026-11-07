// @ts-nocheck
"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Save as: src/components/HeroSection.jsx
// Ultra-Lite 3D Royal Diwali & Spiritual Library Hero (0 external images, 0 audio, 0 extra buttons)
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

// Lightweight 3D Rising Golden Embers (GPU transform + opacity only)
const EMBERS = [
  { l: "9%", s: 4, t: "6.5s", d: "-1s", x: "16px" },
  { l: "23%", s: 3, t: "8s", d: "-3.5s", x: "-18px" },
  { l: "38%", s: 4.5, t: "7.2s", d: "-2.2s", x: "14px" },
  { l: "54%", s: 5, t: "7s", d: "-4.1s", x: "-20px" },
  { l: "68%", s: 3.5, t: "8.4s", d: "-5s", x: "15px" },
  { l: "82%", s: 4.5, t: "6.8s", d: "-2.5s", x: "-16px" },
  { l: "92%", s: 3, t: "7.5s", d: "-4s", x: "12px" },
];

// 7 3D Lotus Brass Diyas (Mobile par 5 dikhenge, Center diya thoda aage aur bada 3D depth ke liye)
const DIYAS = [0, 1, 2, 3, 4, 5, 6].map((i) => {
  const dist = Math.abs(i - 3);
  return {
    i,
    delay: 0.25 + dist * 0.18,
    scale: 1.14 - dist * 0.07,
    yOff: dist * 2.2,
    mobileHidden: i === 0 || i === 6,
    isCenter: i === 3,
  };
});

// Soft Royal Festive Palette for 3D Fireworks
const PALETTE = [
  [255, 216, 95],  // Royal Gold
  [255, 148, 56],  // Warm Saffron
  [255, 92, 128],  // Rose Lotus
  [254, 243, 199], // Champagne Pearl
  [147, 197, 253], // Celestial Blue
  [167, 243, 208], // Emerald Mint
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

/* ═══════════ Pure SVG 3D Royal Library, Sacred Mandala & Arch (0 network requests) ═══════════ */
function buildLibrary() {
  const r = rng(20261022);
  const PAL = [
    "#7f1d1d", "#9a3412", "#92400e", "#78350f", "#1e3a5f",
    "#1e40af", "#312e81", "#581c87", "#831843", "#14532d",
    "#115e59", "#a16207", "#7c2d12", "#9f1239",
  ];
  const WIN = { x1: 410, x2: 790, sill: 482, spring: 205, rad: 190 };
  const wall = `M0 0H1200V640H0Z M${WIN.x1} ${WIN.sill}V${WIN.spring}A${WIN.rad} ${WIN.rad} 0 0 1 ${WIN.x2} ${WIN.spring}V${WIN.sill}Z`;

  let s =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 640" preserveAspectRatio="xMidYMax slice" style="width:100%;height:100%;display:block" aria-hidden="true"><defs>` +
    `<linearGradient id="dvWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d4923a"/><stop offset=".5" stop-color="#854d1e"/><stop offset="1" stop-color="#3b1a08"/></linearGradient>` +
    `<linearGradient id="dvGoldRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fef08a"/><stop offset=".5" stop-color="#f59e0b"/><stop offset="1" stop-color="#92400e"/></linearGradient>` +
    `<linearGradient id="dvShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#04020a" stop-opacity=".72"/><stop offset="1" stop-color="#04020a" stop-opacity="0"/></linearGradient>` +
    `<radialGradient id="dvMoon"><stop offset="0" stop-color="#fffbeb" stop-opacity=".85"/><stop offset=".4" stop-color="#fde68a" stop-opacity=".28"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="dvArchGlow" cx="50%" cy="48%" r="52%"><stop offset="0" stop-color="#f59e0b" stop-opacity=".22"/><stop offset=".6" stop-color="#7c2d12" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>` +
    `</defs>`;

  // Warm Celestial Halo & Sacred Lotus Geometry inside the Arch Window
  s += `<circle cx="600" cy="275" r="210" fill="url(#dvArchGlow)"/>`;
  s += `<g opacity=".26" stroke="#fde68a" fill="none" stroke-width="1.1">` +
       `<circle cx="600" cy="260" r="128" stroke-dasharray="4 6"/>` +
       `<circle cx="600" cy="260" r="96" stroke-opacity=".55"/>` +
       `<circle cx="600" cy="260" r="64" stroke-dasharray="2 4"/>` +
       `</g>`;

  // Glowing Crescent Moon inside Window
  s += `<circle cx="688" cy="118" r="56" fill="url(#dvMoon)"/>` +
       `<circle cx="688" cy="118" r="17" fill="#fffbeb"/>` +
       `<circle cx="695" cy="113" r="14" fill="#120824" opacity=".18"/>`;

  // Hanging Temple Lanterns (Aakash Kandils) inside Arch Window
  const lanterns = [
    { x: 485, top: 82, rope: 58, scale: 0.85 },
    { x: 715, top: 96, rope: 44, scale: 0.85 },
  ];
  for (const l of lanterns) {
    const cy = l.top + l.rope;
    s += `<g opacity=".9">` +
         `<line x1="${l.x}" y1="${l.top - 30}" x2="${l.x}" y2="${cy}" stroke="#fbbf24" stroke-width="1.2" opacity=".6"/>` +
         `<circle cx="${l.x}" cy="${cy + 12}" r="26" fill="url(#dvMoon)" opacity=".55"/>` +
         `<polygon points="${l.x},${cy} ${l.x + 12},${cy + 12} ${l.x},${cy + 24} ${l.x - 12},${cy + 12}" fill="#f59e0b" stroke="#fef08a" stroke-width="1"/>` +
         `<polygon points="${l.x},${cy + 3} ${l.x + 7},${cy + 12} ${l.x},${cy + 21} ${l.x - 7},${cy + 12}" fill="#fffbeb"/>` +
         `<line x1="${l.x - 4}" y1="${cy + 24}" x2="${l.x - 5}" y2="${cy + 33}" stroke="#fbbf24" stroke-width="1"/>` +
         `<line x1="${l.x}" y1="${cy + 24}" x2="${l.x}" y2="${cy + 36}" stroke="#fef08a" stroke-width="1.2"/>` +
         `<line x1="${l.x + 4}" y1="${cy + 24}" x2="${l.x + 5}" y2="${cy + 33}" stroke="#fbbf24" stroke-width="1"/>` +
         `</g>`;
  }

  // Library Wall with Grand Royal Arch Window
  s += `<path d="${wall}" fill-rule="evenodd" fill="#11071a"/>`;

  // Bookshelves with 3D spines & gold foil stamping
  const baselines = [170, 320, 470, 620];
  for (const b of baselines) {
    const segs = b <= 470 ? [[12, WIN.x1 - 10], [WIN.x2 + 10, 1188]] : [[12, 1188]];
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
        s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${c}"/>`;
        s += `<rect x="${x}" y="${y}" width="3" height="${h}" fill="#fff" opacity=".12"/>`;
        if (r() < 0.72) s += `<rect x="${x + 1.5}" y="${y + 10}" width="${w - 3}" height="2.5" fill="#fde68a" opacity=".82"/>`;
        if (r() < 0.5) s += `<rect x="${x + 1.5}" y="${y + h - 13}" width="${w - 3}" height="2.4" fill="#fcd34d" opacity=".68"/>`;
        x += w + 1.6;
      }
      s +=
        `<rect x="${start - 8}" y="${b}" width="${end - start + 16}" height="9" rx="1.5" fill="url(#dvWood)"/>` +
        `<rect x="${start - 8}" y="${b}" width="${end - start + 16}" height="1.5" fill="#fde68a" opacity=".35"/>` +
        `<rect x="${start - 8}" y="${b + 9}" width="${end - start + 16}" height="14" fill="url(#dvShade)"/>`;
    }
  }

  // Soft vignette overlay over side bookshelves so foreground text pops effortlessly
  s += `<path d="${wall}" fill-rule="evenodd" fill="rgba(7,3,15,.46)"/>`;

  // Golden 3D Arch Frame + Corner Carvings
  s +=
    `<path d="M${WIN.x1} ${WIN.sill}V${WIN.spring}A${WIN.rad} ${WIN.rad} 0 0 1 ${WIN.x2} ${WIN.spring}V${WIN.sill}" fill="none" stroke="url(#dvWood)" stroke-width="12"/>` +
    `<path d="M${WIN.x1} ${WIN.sill}V${WIN.spring}A${WIN.rad} ${WIN.rad} 0 0 1 ${WIN.x2} ${WIN.spring}V${WIN.sill}" fill="none" stroke="url(#dvGoldRim)" stroke-width="2" opacity=".85"/>` +
    `<path d="M${WIN.x1 + 7} ${WIN.sill}V${WIN.spring}A${WIN.rad - 7} ${WIN.rad - 7} 0 0 1 ${WIN.x2 - 7} ${WIN.spring}V${WIN.sill}" fill="none" stroke="#fef08a" stroke-width="0.9" opacity=".4"/>` +
    `<rect x="${WIN.x1 - 16}" y="${WIN.sill}" width="${WIN.x2 - WIN.x1 + 32}" height="11" rx="2.5" fill="url(#dvWood)"/>` +
    `<rect x="${WIN.x1 - 16}" y="${WIN.sill}" width="${WIN.x2 - WIN.x1 + 32}" height="1.8" fill="#fde68a" opacity=".6"/>`;

  return s + `</svg>`;
}

function buildToran() {
  const cols = ["#ffd166", "#ff9f1c", "#ff5d8f", "#fff1b8"];
  let d = "M0 4",
    bulbs = "",
    n = 0;
  for (let i = 0; i < 4; i++) {
    const x0 = i * 300,
      x2 = x0 + 300,
      cx = x0 + 150,
      cy = 76,
      y0 = 4;
    d += ` Q${cx} ${cy} ${x2} ${y0}`;
    for (let k = 1; k <= 6; k++) {
      const t = k / 7,
        m = 1 - t;
      const x = (m * m * x0 + 2 * m * t * cx + t * t * x2).toFixed(1);
      const y = (m * m * y0 + 2 * m * t * cy + t * t * y0).toFixed(1);
      const c = cols[n % 4];
      const dl = ((n * 0.37) % 3).toFixed(2);
      bulbs +=
        `<circle cx="${x}" cy="${y}" r="8" fill="${c}" fill-opacity=".24" class="dv-bulb" style="animation-delay:-${dl}s"/>` +
        `<circle cx="${x}" cy="${y}" r="3.2" fill="${c}" class="dv-bulb" style="animation-delay:-${dl}s"/>`;
      n++;
    }
    // Golden pearl hangings between toran loops
    if (i > 0) {
      bulbs +=
        `<line x1="${x0}" y1="4" x2="${x0}" y2="28" stroke="#fbbf24" stroke-width="1.2" opacity=".7"/>` +
        `<circle cx="${x0}" cy="5" r="4.2" fill="#f59e0b"/>` +
        `<circle cx="${x0}" cy="18" r="2.5" fill="#fef08a"/>` +
        `<polygon points="${x0},25 ${x0 + 4},31 ${x0},37 ${x0 - 4},31" fill="#fbbf24"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 88" preserveAspectRatio="xMidYMin slice" style="width:100%;height:100%;display:block" aria-hidden="true"><path d="${d}" fill="none" stroke="#b45309" stroke-width="1.8" opacity=".88"/>${bulbs}</svg>`;
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
    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;

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
      flashes = [],
      rings = [];
    const FOV = 340; // 3D Perspective FOV so sparks pop out towards the viewer

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.25 : 1.75);
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
      const power = (sm ? 90 : 142) * (0.86 + Math.random() * 0.32);
      const n = sm ? 28 : 50;

      flashes.push({ x, y, life: 1, c });
      rings.push({ x, y, r: 4, maxR: sm ? 46 : 72, life: 1, c });

      // 3D Spherical Burst (vz sends sparks towards the screen for 3D pop-out effect)
      for (let i = 0; i < n; i++) {
        const theta = (i / n) * Math.PI * 2 + Math.random() * 0.14;
        const phi = Math.acos(2 * Math.random() - 1);
        const sp = power * (0.36 + Math.random() * 0.64);
        const sinPhi = Math.sin(phi);
        sparks.push({
          x,
          y,
          z: 0,
          vx: Math.cos(theta) * sinPhi * sp,
          vy: Math.sin(theta) * sinPhi * sp,
          vz: Math.cos(phi) * sp * 1.25,
          life: 1,
          decay: 0.64 + Math.random() * 0.42,
          c: i % 3 === 0 ? c2 : c,
          g: 60,
          dr: 0.16,
          tl: 0.042,
          bokeh: i % 6 === 0,
        });
      }

      const cap = sm ? 165 : 320;
      if (sparks.length > cap) sparks.splice(0, sparks.length - cap);
    };

    const launch = (tx, ty) => {
      const aimed = typeof tx === "number";
      const sx = aimed ? tx : w * (0.14 + Math.random() * 0.72);
      if (aimed) {
        rings.push({ x: tx, y: ty, r: 2, maxR: 28, life: 0.85, c: [254, 240, 138] });
      }
      rockets.push({
        x: sx,
        y: h * 0.96,
        ty: aimed ? Math.max(22, ty) : h * (0.12 + Math.random() * 0.34),
        vx: aimed ? 0 : (Math.random() - 0.5) * 16,
        v: Math.max(330, h * (aimed ? 1.5 : 1.08)),
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
        nextAt = 0.9 + Math.random() * 1.1;
      }

      // Rockets rising
      for (let i = rockets.length - 1; i >= 0; i--) {
        const rk = rockets[i];
        rk.y -= rk.v * dt;
        rk.x += rk.vx * dt;
        ctx.strokeStyle = "rgba(254,240,138,.9)";
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

      // Expanding shockwave rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const rg = rings[i];
        rg.life -= dt * 2.4;
        if (rg.life <= 0) {
          rings.splice(i, 1);
          continue;
        }
        rg.r += (rg.maxR - rg.r) * dt * 6;
        ctx.strokeStyle = `rgba(${rg.c[0]},${rg.c[1]},${rg.c[2]},${rg.life * 0.35})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(rg.x, rg.y, rg.r, 0, 6.2832);
        ctx.stroke();
      }

      // Soft bloom flashes
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.life -= dt * 4.2;
        if (f.life <= 0) {
          flashes.splice(i, 1);
          continue;
        }
        const rad = 60 * (1.15 - f.life * 0.5);
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, rad);
        g.addColorStop(0, `rgba(${f.c[0]},${f.c[1]},${f.c[2]},${0.48 * f.life})`);
        g.addColorStop(1, `rgba(${f.c[0]},${f.c[1]},${f.c[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, rad, 0, 6.2832);
        ctx.fill();
      }

      // 3D Sparks
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

        // 3D Perspective Projection
        const persp = FOV / Math.max(50, FOV - s.z);
        const sx = cx + (s.x - cx) * persp;
        const sy = cy + (s.y - cy) * persp;
        const px = cx + (s.x - s.vx * s.tl - cx) * persp;
        const py = cy + (s.y - s.vy * s.tl - cy) * persp;

        ctx.strokeStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${s.life})`;
        ctx.lineWidth = Math.min(4.8, (1 + s.life * 1.25) * persp);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        if (s.bokeh && persp > 1.15) {
          ctx.fillStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${s.life * 0.24})`;
          ctx.beginPath();
          ctx.arc(sx, sy, Math.min(11, 3.4 * persp * s.life), 0, 6.2832);
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
    radial-gradient(110% 72% at 50% 102%,rgba(251,146,60,.36),transparent 62%),
    radial-gradient(65% 55% at 50% 35%,rgba(124,45,18,.22),transparent 70%),
    linear-gradient(180deg,#060311 0%,#140826 54%,#260d33 100%);
}
.dv-stars{
  position:absolute;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cg fill='%23fef9c3'%3E%3Ccircle cx='18' cy='26' r='1.1'/%3E%3Ccircle cx='96' cy='60' r='.8'/%3E%3Ccircle cx='170' cy='20' r='1.2'/%3E%3Ccircle cx='60' cy='140' r='1'/%3E%3Ccircle cx='140' cy='180' r='.8'/%3E%3Ccircle cx='200' cy='190' r='1'/%3E%3C/g%3E%3C/svg%3E");
  background-size:220px 220px;
  will-change:opacity;
  animation:dv-tw 4s ease-in-out infinite alternate;
}
@keyframes dv-tw{from{opacity:.38}to{opacity:.95}}

/* Smooth GPU 3D Video-like Camera Sway */
.dv-lib3d{
  transform-origin:50% 65%;
  will-change:transform;
  animation:dv-cam3d 16s ease-in-out infinite alternate;
}
@keyframes dv-cam3d{
  0%   { transform: translate3d(0,0,0) scale(1.03) rotateX(1.4deg) rotateY(-1.8deg); }
  50%  { transform: translate3d(0,0,0) scale(1.055) rotateX(-0.8deg) rotateY(0deg); }
  100% { transform: translate3d(0,0,0) scale(1.03) rotateX(1.4deg) rotateY(1.8deg); }
}

.dv-rays{
  position:absolute;left:50%;top:0;width:74%;height:100%;
  transform:translateX(-50%);
  background:linear-gradient(180deg,rgba(253,224,71,.2),rgba(251,146,60,.06) 55%,transparent 78%);
  clip-path:polygon(38% 0,62% 0,100% 100%,0 100%);
  will-change:opacity;
  animation:dv-ray 4.5s ease-in-out infinite alternate;
}
@keyframes dv-ray{from{opacity:.45}to{opacity:.92}}

.dv-bulb{will-change:opacity;animation:dv-bt 2.2s ease-in-out infinite alternate}
@keyframes dv-bt{from{opacity:.45}to{opacity:1}}

.dv-ember{
  position:absolute;bottom:-16px;opacity:0;
  border-radius:50%;
  background:radial-gradient(circle,#fffbeb,#fbbf24 60%,transparent 78%);
  will-change:transform,opacity;
  animation:dv-rise linear infinite;
}
@keyframes dv-rise{
  0%{transform:translate3d(0,0,0) scale(.8);opacity:0}
  18%{opacity:.92}
  100%{transform:translate3d(var(--dx),-250px,0) scale(1.15);opacity:0}
}

/* Soft Luxury 3D Gold Foil Title (Zero heavy CSS filter lag on mobile) */
.dv-gold{
  display:inline-block;
  background:linear-gradient(95deg,#fffbeb 0%,#fde047 25%,#f59e0b 50%,#fef08a 75%,#fffbeb 100%);
  background-size:200% auto;
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
  will-change:background-position;
  animation:dv-shine 5.5s linear infinite;
  filter:drop-shadow(0 2px 0 rgba(120,53,15,.92)) drop-shadow(0 5px 14px rgba(0,0,0,.82));
}
@keyframes dv-shine{to{background-position:200% center}}

/* Royal Glass Greeting Chip */
.dv-chip{
  background:linear-gradient(135deg,rgba(30,12,48,.78),rgba(18,7,31,.88));
  border:1px solid rgba(253,224,71,.42);
  box-shadow:0 6px 22px -4px rgba(245,158,11,.42), inset 0 1px 0 rgba(255,255,255,.18);
}
.dv-chip-dot{
  width:5px;height:5px;border-radius:9999px;background:#fde047;
  box-shadow:0 0 8px #fbbf24;
}
.dv-sub{text-shadow:0 2px 10px rgba(0,0,0,.92)}

/* Hardware-Accelerated 3D Diyas */
.dv-diya{
  position:relative;
  will-change:transform;
}
.dv-glow{
  position:absolute;left:50%;top:18%;width:245%;aspect-ratio:1;
  transform:translate(-50%,-50%);
  border-radius:50%;
  background:radial-gradient(circle,rgba(253,224,71,.56),rgba(249,115,22,.18) 44%,transparent 72%);
  opacity:0;
  will-change:opacity;
  animation:dv-gi .65s ease-out both var(--d),dv-pu 2.3s ease-in-out infinite calc(var(--d) + .65s);
}
@keyframes dv-gi{to{opacity:.94}}
@keyframes dv-pu{0%,100%{opacity:.72}50%{opacity:1}}
.dv-ign,.dv-flk{transform-box:fill-box;transform-origin:50% 100%;will-change:transform}
.dv-ign{transform:scale(0);animation:dv-ig .55s cubic-bezier(.2,1.3,.4,1) both var(--d)}
@keyframes dv-ig{to{transform:scale(1)}}
.dv-flk{animation:dv-fl 1.25s ease-in-out infinite calc(var(--d) + .55s)}
@keyframes dv-fl{
  0%,100%{transform:scale(1,1) skewX(0)}
  25%{transform:scale(.94,1.08) skewX(-2.8deg)}
  50%{transform:scale(1.05,.95) skewX(2deg)}
  75%{transform:scale(.97,1.05) skewX(-1.4deg)}
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
      className="dv-sky relative overflow-hidden flex flex-col items-center justify-center text-center px-3 pt-5 pb-11 sm:pt-8 sm:pb-14 md:pt-12 md:pb-20 min-h-[190px] sm:min-h-[240px] md:min-h-[340px] lg:min-h-[380px] select-none cursor-pointer"
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Shared Diya SVG Gradients */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="dvBowl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fbbf24" />
            <stop offset=".48" stopColor="#b45309" />
            <stop offset="1" stopColor="#451a03" />
          </linearGradient>
          <linearGradient id="dvRim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fde68a" />
            <stop offset=".5" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#fde68a" />
          </linearGradient>
          <linearGradient id="dvFlame" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ea580c" />
            <stop offset=".58" stopColor="#facc15" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </svg>

      {/* Stars */}
      <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <div className="dv-stars" />
      </div>

      {/* 3D Animated Royal Library + Sacred Mandala Arch + Hanging Kandils + Moon */}
      <div
        className="dv-lib3d absolute inset-0 pointer-events-none z-[2]"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: LIBRARY_SVG }}
      />

      {/* Warm Light Rays & Soft Text Contrast Backdrop */}
      <div className="absolute inset-0 pointer-events-none z-[3]" aria-hidden="true">
        <div className="dv-rays" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 64% 52% at 50% 44%,rgba(8,4,20,.74),rgba(8,4,20,.32) 65%,transparent 100%)",
          }}
        />
      </div>

      {/* 3D Perspective Fireworks Canvas (Popping out towards screen) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[4]"
        aria-hidden="true"
      />

      {/* Top Toran Lights with Golden Pearl Hangings */}
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

      {/* 3D Curved Lotus Diya Row at Bottom */}
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
              transform: `translate3d(0,${-d.yOff}px,0) scale(${d.scale})`,
            }}
          >
            <span className="dv-glow" />
            <svg viewBox="0 0 64 58" className="relative block w-full h-auto">
              {/* Soft Ground Reflection (Replaces heavy CSS drop-shadow filter for 60fps speed) */}
              <ellipse cx="32" cy="54" rx="24" ry="3.5" fill="#000000" opacity=".55" />
              <ellipse cx="32" cy="53" rx="19" ry="2.8" fill="#f59e0b" opacity=".38" />
              {/* Subtle Golden Lotus Base Petals */}
              <path
                d="M14 49 Q22 55 32 53 Q42 55 50 49"
                fill="none"
                stroke="#fcd34d"
                strokeWidth="1.4"
                 opacity=".55"
                strokeLinecap="round"
              />
              {/* 3D Carved Brass Bowl */}
              <path
                d="M4 25C8 47 22 52 32 52S56 47 60 25C48 31 16 31 4 25Z"
                fill="url(#dvBowl)"
                stroke="#fde68a"
                strokeWidth="0.7"
              />
              <path
                d="M11 35Q32 45 53 35"
                fill="none"
                stroke="#fde047"
                strokeWidth="1.25"
                opacity=".72"
                strokeLinecap="round"
              />
              <ellipse cx="32" cy="25" rx="27" ry="4.5" fill="url(#dvRim)" />
              <ellipse cx="32" cy="25.3" rx="22" ry="2.8" fill="#78350f" opacity=".65" />
              <rect x="30.8" y="18" width="2.4" height="8" rx="1" fill="#3b1d0e" />
              {/* Igniting & Flickering Multi-Layer Flame */}
              <g className="dv-ign">
                <g className="dv-flk">
                  <path d="M32 1C40.5 11 42.5 17.5 32 23C21.5 17.5 23.5 11 32 1Z" fill="url(#dvFlame)" />
                  <path d="M32 9.5C35.2 15 36.2 18.2 32 21.5C27.8 18.2 28.8 15 32 9.5Z" fill="#fffbeb" opacity=".95" />
                  <circle cx="32" cy="18.5" r="1.6" fill="#60a5fa" opacity=".7" />
                </g>
              </g>
            </svg>
          </div>
        ))}
      </div>

      {/* Compact 3D Foreground Text (Same exact proportions & spacing) */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: EASE }}
        className="dv-chip relative z-10 mb-1.5 sm:mb-2.5 inline-flex items-center gap-2 rounded-full px-3.5 py-0.5 sm:px-4 sm:py-1 text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide text-amber-100"
      >
        <span className="dv-chip-dot" aria-hidden="true" />
        <span>🪔 {t.greet} 🪔</span>
        <span className="dv-chip-dot" aria-hidden="true" />
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.06, ease: EASE }}
        className="relative z-10 font-cinzel text-xl leading-snug sm:text-3xl md:text-5xl lg:text-6xl font-black mb-1 sm:mb-2 max-w-4xl mx-auto"
      >
        <span className="dv-gold">{t.title}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12, ease: EASE }}
        className="dv-sub relative z-10 max-w-lg md:max-w-xl mx-auto text-xs sm:text-sm md:text-base px-2 leading-relaxed font-medium text-amber-50/95"
      >
        {t.sub}
      </motion.p>
    </section>
  );
}
