// @ts-nocheck
"use client";
import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Save as: src/components/HeroSection.jsx
// Ultra-Lite 3D Celestial Spiritual & Psychology Library Hero (0 external images, 0 audio, 0 extra buttons, SEO-Ready)
// Mobile par sirf ~1/4 screen (compact banner) leta hai taaki niche ki books turant dikhein,
// aur Desktop/Laptop par grand 3D peaceful sanctuary look deta hai.

const dict = {
  EN: {
    greet: "Sanctuary of Wisdom & Inner Peace",
    title: "Awaken Your Consciousness",
    sub: "100% original, verified digital books on spirituality & psychology.",
    seoKeywords:
      "spiritual books, psychology digital books, mindfulness, consciousness, self realization, mental peace, original ebooks",
  },
  HI: {
    greet: "आत्मज्ञान और मानसिक शांति का केंद्र",
    title: "अपनी चेतना को जागृत करें",
    sub: "आध्यात्मिकता और मनोविज्ञान पर 100% मूल, सत्यापित डिजिटल पुस्तकें।",
    seoKeywords:
      "आध्यात्मिक पुस्तकें, मनोविज्ञान डिजिटल पुस्तकें, मानसिक शांति, आत्मज्ञान, चेतना, ओरिजिनल ई-बुक्स",
  },
};

// Lightweight 3D Rising Prana & Aura Orbs (GPU transform + opacity only)
const PRANA_ORBS = [
  { l: "8%", s: 4.5, t: "9.5s", d: "-1.2s", x: "14px", c: "#fde68a" },
  { l: "21%", s: 3.5, t: "11s", d: "-4.5s", x: "-16px", c: "#5eead4" },
  { l: "36%", s: 5, t: "10.2s", d: "-2.8s", x: "12px", c: "#fef08a" },
  { l: "52%", s: 4, t: "9.8s", d: "-5.1s", x: "-14px", c: "#a7f3d0" },
  { l: "66%", s: 3.5, t: "11.4s", d: "-6s", x: "15px", c: "#fde68a" },
  { l: "81%", s: 4.5, t: "9.6s", d: "-3.2s", x: "-12px", c: "#99f6e4" },
  { l: "92%", s: 3.5, t: "10.5s", d: "-4.2s", x: "10px", c: "#fef08a" },
];

// 7 3D Blooming Zen Lotuses on Crystal Water Threshold (Mobile par 5 dikhenge, Center lotus bada aur aage 3D depth ke liye)
const LOTUSES = [0, 1, 2, 3, 4, 5, 6].map((i) => {
  const dist = Math.abs(i - 3);
  return {
    i,
    delay: 0.15 + dist * 0.16,
    scale: 1.18 - dist * 0.075,
    yOff: dist * 2.4,
    mobileHidden: i === 0 || i === 6,
    isCenter: i === 3,
  };
});

// Serene Mind-Calming 3D Palette (Celestial Gold, Prana Teal, Astral Cyan, Lotus Pearl, Soft Lavender)
const PALETTE = [
  [253, 230, 138], // Celestial Gold
  [94, 234, 212],  // Prana Aqua Teal
  [167, 243, 208], // Heart Chakra Mint
  [254, 249, 195], // Lotus Pearl
  [147, 197, 253], // Tranquil Sky Blue
  [216, 180, 254], // Crown Chakra Lavender
];

/* ═══════════ Fast Deterministic RNG (Hydration-Safe) ═══════════ */
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

/* ═══════════ Pure SVG 3D Sanctuary Library, Himalayan Moonlit Arch & Sacred Geometry ═══════════ */
function buildSanctuaryLibrary() {
  const r = rng(20261110);
  const PAL = [
    "#1e3a5f", "#134e4a", "#312e81", "#1e293b", "#3b0764",
    "#14532d", "#78350f", "#0f766e", "#1d4ed8", "#4c1d95",
    "#065f46", "#854d0e", "#581c87", "#1e40af",
  ];
  const WIN = { x1: 405, x2: 795, sill: 486, spring: 205, rad: 195 };
  const wall = `M0 0H1200V640H0Z M${WIN.x1} ${WIN.sill}V${WIN.spring}A${WIN.rad} ${WIN.rad} 0 0 1 ${WIN.x2} ${WIN.spring}V${WIN.sill}Z`;

  let s =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 640" preserveAspectRatio="xMidYMax slice" style="width:100%;height:100%;display:block" aria-hidden="true"><defs>` +
    `<linearGradient id="snWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eab308"/><stop offset=".45" stop-color="#854d0e"/><stop offset="1" stop-color="#271705"/></linearGradient>` +
    `<linearGradient id="snGoldRim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fef9c3"/><stop offset=".5" stop-color="#f59e0b"/><stop offset="1" stop-color="#78350f"/></linearGradient>` +
    `<linearGradient id="snShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020617" stop-opacity=".78"/><stop offset="1" stop-color="#020617" stop-opacity="0"/></linearGradient>` +
    `<radialGradient id="snMoon"><stop offset="0" stop-color="#ffffff" stop-opacity=".95"/><stop offset=".35" stop-color="#ccfbf1" stop-opacity=".42"/><stop offset=".7" stop-color="#fde68a" stop-opacity=".15"/><stop offset="1" stop-color="#0f172a" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="snArchAura" cx="50%" cy="44%" r="54%"><stop offset="0" stop-color="#2dd4bf" stop-opacity=".22"/><stop offset=".48" stop-color="#f59e0b" stop-opacity=".12"/><stop offset="1" stop-color="#020617" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="snPeak1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#334155" stop-opacity=".55"/><stop offset="1" stop-color="#020617" stop-opacity=".95"/></linearGradient>` +
    `<linearGradient id="snPeak2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e293b" stop-opacity=".78"/><stop offset="1" stop-color="#020617" stop-opacity=".98"/></linearGradient>` +
    `</defs>`;

  // Tranquil Himalayan Aurora & Cosmic Halo inside Arch Window
  s += `<circle cx="600" cy="255" r="225" fill="url(#snArchAura)"/>`;

  // Rotating 3D Sacred Sri-Mandala of Consciousness (Pure SVG + CSS GPU spin)
  s += `<g class="sn-mandala-outer" opacity=".34" stroke="#fde68a" fill="none" stroke-width="1">` +
       `<circle cx="600" cy="240" r="142" stroke-dasharray="3 6"/>` +
       `<circle cx="600" cy="240" r="114" stroke="#5eead4" stroke-opacity=".55"/>` +
       `<polygon points="600,126 699,297 501,297" stroke="#fde68a" stroke-opacity=".4"/>` +
       `<polygon points="600,354 699,183 501,183" stroke="#5eead4" stroke-opacity=".4"/>` +
       `</g>`;
  s += `<g class="sn-mandala-inner" opacity=".38" stroke="#99f6e4" fill="none" stroke-width="1.1">` +
       `<circle cx="600" cy="240" r="82" stroke-dasharray="5 5"/>` +
       `<circle cx="600" cy="240" r="52" stroke="#fef08a" stroke-opacity=".6"/>` +
       `<rect x="542" y="182" width="116" height="116" rx="8" transform="rotate(45 600 240)" stroke="#fde68a" stroke-opacity=".35"/>` +
       `<rect x="542" y="182" width="116" height="116" rx="8" stroke="#5eead4" stroke-opacity=".35"/>` +
       `</g>`;

  // Serene Full Purnima Moon & Spiritual Core Orb inside the Arch
  s += `<circle cx="600" cy="128" r="64" fill="url(#snMoon)"/>` +
       `<circle cx="600" cy="128" r="16" fill="#fffbeb"/>` +
       `<circle cx="600" cy="128" r="24" fill="none" stroke="#fef08a" stroke-width=".8" opacity=".5"/>`;

  // Distant Tranquil Himalayan Meditation Peaks inside Window
  s += `<path d="M405 486 L475 368 L545 418 L615 338 L695 410 L745 362 L795 486 Z" fill="url(#snPeak1)"/>` +
       `<path d="M615 338 L638 362 L612 375 L595 360 Z" fill="#e2e8f0" opacity=".22"/>` +
       `<path d="M405 486 L450 412 L525 446 L588 388 L665 442 L732 396 L795 486 Z" fill="url(#snPeak2)"/>`;

  // Hanging Celestial Prana Pendulums (Crystal Consciousness Prisms) inside Arch
  const prisms = [
    { x: 476, top: 88, rope: 54 },
    { x: 724, top: 88, rope: 54 },
  ];
  for (const p of prisms) {
    const cy = p.top + p.rope;
    s += `<g opacity=".88">` +
         `<line x1="${p.x}" y1="${p.top - 30}" x2="${p.x}" y2="${cy}" stroke="#fde68a" stroke-width="1" opacity=".55"/>` +
         `<circle cx="${p.x}" cy="${cy + 12}" r="24" fill="url(#snMoon)" opacity=".55"/>` +
         `<polygon points="${p.x},${cy - 2} ${p.x + 10},${cy + 12} ${p.x},${cy + 26} ${p.x - 10},${cy + 12}" fill="#0d9488" stroke="#99f6e4" stroke-width="1"/>` +
         `<polygon points="${p.x},${cy + 2} ${p.x + 5.5},${cy + 12} ${p.x},${cy + 22} ${p.x - 5.5},${cy + 12}" fill="#fffbeb"/>` +
         `<circle cx="${p.x}" cy="${cy + 33}" r="2" fill="#fde68a"/>` +
         `</g>`;
  }

  // Grand Sanctuary Wall with Open Arch Cutout
  s += `<path d="${wall}" fill-rule="evenodd" fill="#050b16"/>`;

  // 3D Carved Library Bookshelves with Gold Foil Spines
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
        // 3D Spine Highlight
        s += `<rect x="${x}" y="${y}" width="3" height="${h}" fill="#fff" opacity=".13"/>`;
        s += `<rect x="${x + w - 2.5}" y="${y}" width="2.5" height="${h}" fill="#000" opacity=".28"/>`;
        // Gold & Silver Sacred Book Stamping
        if (r() < 0.74) s += `<rect x="${x + 2}" y="${y + 10}" width="${w - 4}" height="2.4" fill="#fde68a" opacity=".82"/>`;
        if (r() < 0.45) s += `<circle cx="${x + w * 0.5}" cy="${y + h * 0.5}" r="${Math.min(3.2, w * 0.2)}" fill="#5eead4" opacity=".55"/>`;
        if (r() < 0.52) s += `<rect x="${x + 2}" y="${y + h - 13}" width="${w - 4}" height="2.2" fill="#fcd34d" opacity=".68"/>`;
        x += w + 1.6;
      }
      // 3D Polished Teak & Gold Shelf Ledge
      s +=
        `<rect x="${start - 8}" y="${b}" width="${end - start + 16}" height="9" rx="1.5" fill="url(#snWood)"/>` +
        `<rect x="${start - 8}" y="${b}" width="${end - start + 16}" height="1.5" fill="#fef08a" opacity=".42"/>` +
        `<rect x="${start - 8}" y="${b + 9}" width="${end - start + 16}" height="14" fill="url(#snShade)"/>`;
    }
  }

  // Soft Ambient Depth Vignette over Side Bookshelves so Foreground Typography Shines
  s += `<path d="${wall}" fill-rule="evenodd" fill="rgba(3,7,18,.52)"/>`;

  // 3D Golden Sanctuary Arch Frame + Inner Sacred Trim
  s +=
    `<path d="M${WIN.x1} ${WIN.sill}V${WIN.spring}A${WIN.rad} ${WIN.rad} 0 0 1 ${WIN.x2} ${WIN.spring}V${WIN.sill}" fill="none" stroke="url(#snWood)" stroke-width="12"/>` +
    `<path d="M${WIN.x1} ${WIN.sill}V${WIN.spring}A${WIN.rad} ${WIN.rad} 0 0 1 ${WIN.x2} ${WIN.spring}V${WIN.sill}" fill="none" stroke="url(#snGoldRim)" stroke-width="2.2" opacity=".88"/>` +
    `<path d="M${WIN.x1 + 7} ${WIN.sill}V${WIN.spring}A${WIN.rad - 7} ${WIN.rad - 7} 0 0 1 ${WIN.x2 - 7} ${WIN.spring}V${WIN.sill}" fill="none" stroke="#99f6e4" stroke-width="0.9" opacity=".42"/>` +
    `<rect x="${WIN.x1 - 18}" y="${WIN.sill}" width="${WIN.x2 - WIN.x1 + 36}" height="11" rx="2.5" fill="url(#snWood)"/>` +
    `<rect x="${WIN.x1 - 18}" y="${WIN.sill}" width="${WIN.x2 - WIN.x1 + 36}" height="1.8" fill="#fef08a" opacity=".65"/>`;

  return s + `</svg>`;
}

/* ═══════════ Top Celestial Constellation & Sacred Arch Filigree (Replaces Diwali Toran) ═══════════ */
function buildCelestialCanopy() {
  const cols = ["#fde68a", "#5eead4", "#a7f3d0", "#fef9c3"];
  let d = "M0 2",
    nodes = "",
    n = 0;
  for (let i = 0; i < 4; i++) {
    const x0 = i * 300,
      x2 = x0 + 300,
      cx = x0 + 150,
      cy = 58,
      y0 = 2;
    d += ` Q${cx} ${cy} ${x2} ${y0}`;
    for (let k = 1; k <= 5; k++) {
      const t = k / 6,
        m = 1 - t;
      const x = (m * m * x0 + 2 * m * t * cx + t * t * x2).toFixed(1);
      const y = (m * m * y0 + 2 * m * t * cy + t * t * y0).toFixed(1);
      const c = cols[n % 4];
      const dl = ((n * 0.45) % 4).toFixed(2);
      nodes +=
        `<circle cx="${x}" cy="${y}" r="6.5" fill="${c}" fill-opacity=".18" class="sn-star-node" style="animation-delay:-${dl}s"/>` +
        `<circle cx="${x}" cy="${y}" r="2.2" fill="${c}" class="sn-star-node" style="animation-delay:-${dl}s"/>`;
      n++;
    }
    if (i > 0) {
      nodes +=
        `<line x1="${x0}" y1="2" x2="${x0}" y2="22" stroke="#5eead4" stroke-width="1" opacity=".55"/>` +
        `<polygon points="${x0},19 ${x0 + 4},25 ${x0},31 ${x0 - 4},25" fill="#fde68a" opacity=".85"/>`;
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 72" preserveAspectRatio="xMidYMin slice" style="width:100%;height:100%;display:block" aria-hidden="true"><path d="${d}" fill="none" stroke="#fde68a" stroke-width="1" stroke-dasharray="3 5" opacity=".48"/>${nodes}</svg>`;
}

const SANCTUARY_SVG = buildSanctuaryLibrary();
const CANOPY_SVG = buildCelestialCanopy();

/* ═══════════ Ultra-Lite 3D Zen Consciousness, Neural-Constellation & Lotus Ripple Engine ═══════════ */
function useZenCosmos3D(wrapRef, canvasRef, apiRef) {
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
      pulseTimer = 1.4,
      visible = true;

    const FOV = 320; // 3D Perspective Depth
    const motes = [];
    const ripples = [];
    const blooms = [];

    const pickColor = () => PALETTE[(Math.random() * PALETTE.length) | 0];

    const initMotes = () => {
      motes.length = 0;
      const count = small() ? 22 : 42;
      for (let i = 0; i < count; i++) {
        motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: (Math.random() - 0.35) * 210,
          vx: (Math.random() - 0.5) * 11,
          vy: -6 - Math.random() * 12,
          vz: 8 + Math.random() * 16,
          r: 1.3 + Math.random() * 1.9,
          phase: Math.random() * 6.28,
          c: pickColor(),
        });
      }
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.25 : 1.75);
      const r = wrap.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initMotes();
    };

    // Trigger a soothing 3D Zen Sound-Bowl Ripple + Floating Lotus Stardust Bloom
    const triggerZenPulse = (tx, ty) => {
      const aimed = typeof tx === "number";
      const x = aimed ? tx : w * (0.28 + Math.random() * 0.44);
      const y = aimed ? ty : h * (0.22 + Math.random() * 0.42);
      const c1 = PALETTE[0]; // Celestial Gold
      const c2 = PALETTE[1]; // Prana Aqua Teal

      // Concentric 3D Mind-Calming Sound Bowl Ripples
      ripples.push({ x, y, r: 4, maxR: small() ? 68 : 110, life: 1, c: c1 });
      ripples.push({ x, y, r: 2, maxR: small() ? 42 : 70, life: 0.85, c: c2 });

      // Gentle 3D Lotus Petal Stardust drifting toward the viewer
      const count = aimed ? (small() ? 16 : 26) : small() ? 10 : 16;
      for (let i = 0; i < count; i++) {
        const ang = (i / count) * Math.PI * 2 + Math.random() * 0.2;
        const spd = (small() ? 26 : 38) * (0.45 + Math.random() * 0.65);
        blooms.push({
          x,
          y,
          z: 20,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd - 10,
          vz: 45 + Math.random() * 55,
          life: 1,
          decay: 0.42 + Math.random() * 0.25,
          r: 1.5 + Math.random() * 2,
          c: i % 2 === 0 ? c1 : c2,
        });
      }
      if (blooms.length > 140) blooms.splice(0, blooms.length - 140);
    };

    apiRef.current = { triggerZenPulse };

    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((t - last) / 1000 || 0.016, 0.05);
      last = t;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      pulseTimer -= dt;
      if (pulseTimer <= 0) {
        triggerZenPulse();
        pulseTimer = 2.8 + Math.random() * 2.2;
      }

      const cx = w * 0.5,
        cy = h * 0.46;

      // 1. Ambient 3D Prana Motes & Subtle Neural/Constellation Connections
      const projected = [];
      for (let i = 0; i < motes.length; i++) {
        const m = motes[i];
        m.phase += dt * 1.8;
        m.x += (m.vx + Math.sin(m.phase) * 4) * dt;
        m.y += m.vy * dt;
        m.z += m.vz * dt;

        // Smooth 3D Wrap-around
        if (m.z > FOV - 55) {
          m.z = -140;
          m.x = Math.random() * w;
          m.y = h * (0.2 + Math.random() * 0.75);
        }
        if (m.y < -15) m.y = h + 10;
        if (m.x < -15) m.x = w + 10;
        if (m.x > w + 15) m.x = -10;

        const persp = FOV / Math.max(55, FOV - m.z);
        const sx = cx + (m.x - cx) * persp;
        const sy = cy + (m.y - cy) * persp;
        const alpha = Math.min(0.85, (0.35 + 0.35 * Math.sin(m.phase)) * Math.min(1.2, persp * 0.75));
        const rad = Math.min(5.5, m.r * persp);

        projected.push({ sx, sy, alpha, c: m.c });

        // Soft 3D Bokeh Halo
        ctx.fillStyle = `rgba(${m.c[0]},${m.c[1]},${m.c[2]},${alpha * 0.22})`;
        ctx.beginPath();
        ctx.arc(sx, sy, rad * 2.6, 0, 6.2832);
        ctx.fill();

        // Luminous Core
        ctx.fillStyle = `rgba(${m.c[0]},${m.c[1]},${m.c[2]},${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, rad * 0.9, 0, 6.2832);
        ctx.fill();
      }

      // Delicate Neural/Mind-Synapse Constellation Filaments between nearby 3D Motes
      const linkDistSq = small() ? 3800 : 6400;
      ctx.lineWidth = 0.65;
      for (let i = 0; i < projected.length; i++) {
        const a = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const b = projected[j];
          const dx = a.sx - b.sx,
            dy = a.sy - b.sy,
            d2 = dx * dx + dy * dy;
          if (d2 < linkDistSq) {
            const op = (1 - d2 / linkDistSq) * 0.16;
            ctx.strokeStyle = `rgba(153,246,228,${op})`;
            ctx.beginPath();
            ctx.moveTo(a.sx, a.sy);
            ctx.lineTo(b.sx, b.sy);
            ctx.stroke();
          }
        }
      }

      // 2. Soothing Zen Sound-Bowl Ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.life -= dt * 0.75;
        if (rp.life <= 0) {
          ripples.splice(i, 1);
          continue;
        }
        rp.r += (rp.maxR - rp.r) * dt * 2.4;
        ctx.strokeStyle = `rgba(${rp.c[0]},${rp.c[1]},${rp.c[2]},${rp.life * 0.34})`;
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, 6.2832);
        ctx.stroke();
      }

      // 3. 3D Out-of-Screen Lotus Stardust Blooms (on tap or periodic pulse)
      for (let i = blooms.length - 1; i >= 0; i--) {
        const b = blooms[i];
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.vy -= 8 * dt; // Gentle upward levitation
        b.z = Math.min(FOV - 48, b.z + b.vz * dt);
        b.life -= b.decay * dt;
        if (b.life <= 0) {
          blooms.splice(i, 1);
          continue;
        }
        const persp = FOV / Math.max(48, FOV - b.z);
        const sx = cx + (b.x - cx) * persp;
        const sy = cy + (b.y - cy) * persp;
        const rad = Math.min(6.5, b.r * persp);

        ctx.fillStyle = `rgba(${b.c[0]},${b.c[1]},${b.c[2]},${b.life * 0.25})`;
        ctx.beginPath();
        ctx.arc(sx, sy, rad * 2.2, 0, 6.2832);
        ctx.fill();

        ctx.fillStyle = `rgba(255,251,235,${b.life * 0.9})`;
        ctx.beginPath();
        ctx.arc(sx, sy, rad * 0.75, 0, 6.2832);
        ctx.fill();
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
.sn-sky{
  perspective: 950px;
  background:
    radial-gradient(110% 75% at 50% 102%,rgba(45,212,191,.24),transparent 62%),
    radial-gradient(68% 58% at 50% 34%,rgba(245,158,11,.15),transparent 70%),
    linear-gradient(180deg,#020617 0%,#08142c 54%,#0b2135 100%);
}
.sn-stars{
  position:absolute;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cg fill='%23e2e8f0'%3E%3Ccircle cx='18' cy='26' r='1.1'/%3E%3Ccircle cx='96' cy='60' r='.8'/%3E%3Ccircle cx='170' cy='20' r='1.2' fill='%23fde68a'/%3E%3Ccircle cx='60' cy='140' r='1' fill='%2399f6e4'/%3E%3Ccircle cx='140' cy='180' r='.8'/%3E%3Ccircle cx='200' cy='190' r='1'/%3E%3C/g%3E%3C/svg%3E");
  background-size:220px 220px;
  will-change:opacity;
  animation:sn-tw 5s ease-in-out infinite alternate;
}
@keyframes sn-tw{from{opacity:.35}to{opacity:.92}}

/* Smooth GPU 3D Breathing Camera Sway (Deep Mind-Calming Rhythm) */
.sn-lib3d{
  transform-origin:50% 62%;
  will-change:transform;
  animation:sn-cam3d 18s ease-in-out infinite alternate;
}
@keyframes sn-cam3d{
  0%   { transform: translate3d(0,0,0) scale(1.03) rotateX(1.3deg) rotateY(-1.6deg); }
  50%  { transform: translate3d(0,0,0) scale(1.055) rotateX(-0.7deg) rotateY(0deg); }
  100% { transform: translate3d(0,0,0) scale(1.03) rotateX(1.3deg) rotateY(1.6deg); }
}

/* Sacred Geometry Mandala Rotation inside Arch */
.sn-mandala-outer{
  transform-origin:600px 240px;
  will-change:transform;
  animation:sn-spin 64s linear infinite;
}
.sn-mandala-inner{
  transform-origin:600px 240px;
  will-change:transform;
  animation:sn-spin-rev 46s linear infinite;
}
@keyframes sn-spin{to{transform:rotate(360deg)}}
@keyframes sn-spin-rev{to{transform:rotate(-360deg)}}

.sn-rays{
  position:absolute;left:50%;top:0;width:76%;height:100%;
  transform:translateX(-50%);
  background:linear-gradient(180deg,rgba(153,246,228,.16),rgba(253,224,71,.07) 52%,transparent 80%);
  clip-path:polygon(37% 0,63% 0,100% 100%,0 100%);
  will-change:opacity;
  animation:sn-ray 5.5s ease-in-out infinite alternate;
}
@keyframes sn-ray{from{opacity:.4}to{opacity:.88}}

.sn-star-node{will-change:opacity;animation:sn-bt 3s ease-in-out infinite alternate}
@keyframes sn-bt{from{opacity:.38}to{opacity:.98}}

.sn-orb{
  position:absolute;bottom:-16px;opacity:0;
  border-radius:50%;
  will-change:transform,opacity;
  animation:sn-rise linear infinite;
}
@keyframes sn-rise{
  0%{transform:translate3d(0,0,0) scale(.8);opacity:0}
  20%{opacity:.85}
  100%{transform:translate3d(var(--dx),-250px,0) scale(1.18);opacity:0}
}

/* Soft Luxury 3D Celestial Gold & Pearl Title (Zero heavy CSS filter lag on mobile) */
.sn-gold{
  display:inline-block;
  background:linear-gradient(95deg,#ffffff 0%,#fef08a 24%,#f59e0b 48%,#99f6e4 74%,#fffbeb 100%);
  background-size:200% auto;
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
  will-change:background-position;
  animation:sn-shine 6.5s linear infinite;
  filter:drop-shadow(0 2px 0 rgba(15,23,42,.95)) drop-shadow(0 5px 16px rgba(0,0,0,.85));
}
@keyframes sn-shine{to{background-position:200% center}}

/* Peaceful Glass Sanctuary Badge Chip */
.sn-chip{
  background:linear-gradient(135deg,rgba(8,25,48,.82),rgba(6,38,48,.88));
  border:1px solid rgba(153,246,228,.38);
  box-shadow:0 6px 22px -4px rgba(20,184,166,.35), inset 0 1px 0 rgba(255,255,255,.16);
}
.sn-chip-dot{
  width:5px;height:5px;border-radius:9999px;background:#5eead4;
  box-shadow:0 0 8px #2dd4bf;
}
.sn-sub{text-shadow:0 2px 10px rgba(0,0,0,.94)}

/* Hardware-Accelerated 3D Blooming Zen Lotuses */
.sn-lotus{
  position:relative;
  will-change:transform;
}
.sn-lotus-glow{
  position:absolute;left:50%;top:32%;width:230%;aspect-ratio:1;
  transform:translate(-50%,-50%);
  border-radius:50%;
  background:radial-gradient(circle,rgba(94,234,212,.42),rgba(250,204,21,.18) 46%,transparent 72%);
  opacity:0;
  will-change:opacity;
  animation:sn-gi .7s ease-out both var(--d),sn-pu 3.2s ease-in-out infinite calc(var(--d) + .7s);
}
@keyframes sn-gi{to{opacity:.92}}
@keyframes sn-pu{0%,100%{opacity:.65}50%{opacity:1}}

.sn-bloom,.sn-breathe{transform-box:fill-box;transform-origin:50% 85%;will-change:transform}
.sn-bloom{transform:scale(0);animation:sn-bl .65s cubic-bezier(.2,1.25,.4,1) both var(--d)}
@keyframes sn-bl{to{transform:scale(1)}}
.sn-breathe{animation:sn-br 3.6s ease-in-out infinite calc(var(--d) + .65s)}
@keyframes sn-br{
  0%,100%{transform:translateY(0) scale(1,1)}
  50%{transform:translateY(-1.8px) scale(1.04,1.03)}
}

@media (prefers-reduced-motion:reduce){
  .sn-stars,.sn-gold,.sn-lotus-glow,.sn-bloom,.sn-breathe,.sn-lib3d,.sn-rays,.sn-star-node,.sn-mandala-outer,.sn-mandala-inner{animation:none!important}
  .sn-bloom{transform:none}.sn-lotus-glow{opacity:.8}.sn-orb{display:none}
}
`;

const EASE = [0.16, 1, 0.3, 1];

export default function HeroSection({ isDark = true, lang = "EN" }) {
  const t = dict[lang] || dict.EN;
  const wrapRef = useRef(null),
    canvasRef = useRef(null),
    apiRef = useRef(null);

  useZenCosmos3D(wrapRef, canvasRef, apiRef);

  const onTap = (e) => {
    const api = apiRef.current;
    if (!api || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    api.triggerZenPulse(e.clientX - r.left, e.clientY - r.top);
  };

  const pageBg = isDark ? "#07070d" : "#f8fafc";

  return (
    <section
      ref={wrapRef}
      onPointerDown={onTap}
      role="region"
      aria-labelledby="hero-consciousness-title"
      itemScope
      itemType="https://schema.org/WPHeader"
      style={{ touchAction: "manipulation" }}
      className="sn-sky relative overflow-hidden flex flex-col items-center justify-center text-center px-3 pt-5 pb-11 sm:pt-8 sm:pb-14 md:pt-12 md:pb-20 min-h-[190px] sm:min-h-[240px] md:min-h-[340px] lg:min-h-[380px] select-none cursor-pointer"
    >
      {/* SEO Metadata for Google Bots */}
      <meta itemProp="keywords" content={t.seoKeywords} />
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Shared 3D Sacred Lotus & Crystal Gradients */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="snPetalOuter" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fef08a" />
            <stop offset=".55" stopColor="#f59e0b" />
            <stop offset="1" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="snPetalInner" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset=".5" stopColor="#fde68a" />
            <stop offset="1" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="snPranaCore" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#0d9488" />
            <stop offset=".55" stopColor="#5eead4" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
        </defs>
      </svg>

      {/* Tranquil Starlight Field */}
      <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <div className="sn-stars" />
      </div>

      {/* 3D Animated Sanctuary Library + Himalayan Arch + Rotating Sacred Mandala */}
      <div
        className="sn-lib3d absolute inset-0 pointer-events-none z-[2]"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: SANCTUARY_SVG }}
      />

      {/* Serene Volumetric Moonlight Rays & Soft Text Contrast Backdrop */}
      <div className="absolute inset-0 pointer-events-none z-[3]" aria-hidden="true">
        <div className="sn-rays" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 64% 52% at 50% 44%,rgba(2,8,23,.76),rgba(2,8,23,.34) 65%,transparent 100%)",
          }}
        />
      </div>

      {/* 3D Interactive Zen Consciousness & Prana Stardust Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[4]"
        aria-hidden="true"
      />

      {/* Top Celestial Constellation & Sacred Arch Filigree */}
      <div
        className="absolute top-0 inset-x-0 h-7 sm:h-10 md:h-14 pointer-events-none z-[5]"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: CANOPY_SVG }}
      />

      {/* Floating 3D Prana & Aura Orbs */}
      <div className="absolute inset-0 pointer-events-none z-[5]" aria-hidden="true">
        {PRANA_ORBS.map((p, k) => (
          <span
            key={k}
            className="sn-orb"
            style={{
              left: p.l,
              width: p.s,
              height: p.s,
              animationDuration: p.t,
              animationDelay: p.d,
              "--dx": p.x,
              background: `radial-gradient(circle,#ffffff,${p.c} 62%,transparent 80%)`,
            }}
          />
        ))}
      </div>

      {/* Smooth Bottom Fade into Website Background */}
      <div
        className="absolute bottom-0 inset-x-0 h-8 md:h-12 pointer-events-none z-[6]"
        style={{ background: `linear-gradient(to bottom, transparent, ${pageBg})` }}
      />

      {/* 3D Curved Blooming Zen Lotuses on Crystal Water Reflection Deck */}
      <div
        className="absolute bottom-1.5 sm:bottom-2.5 md:bottom-4 inset-x-0 px-3 md:px-12 flex justify-around items-end pointer-events-none z-[7]"
        aria-hidden="true"
      >
        {LOTUSES.map((d) => (
          <div
            key={d.i}
            className={`sn-lotus w-7 sm:w-9 md:w-12 lg:w-14 ${d.mobileHidden ? "hidden md:block" : ""}`}
            style={{
              "--d": `${d.delay}s`,
              transform: `translate3d(0,${-d.yOff}px,0) scale(${d.scale})`,
            }}
          >
            <span className="sn-lotus-glow" />
            <svg viewBox="0 0 64 58" className="relative block w-full h-auto">
              {/* Calm Zen Water Ripples underneath each Lotus */}
              <ellipse cx="32" cy="53.5" rx="26" ry="3.4" fill="none" stroke="#5eead4" strokeWidth="0.9" opacity=".45" />
              <ellipse cx="32" cy="53.5" rx="19" ry="2.3" fill="#0f766e" opacity=".42" />
              <ellipse cx="32" cy="53.5" rx="12" ry="1.4" fill="#fde68a" opacity=".45" />

              {/* 3D Blooming Sacred Lotus + Levitating Prana Pearl */}
              <g className="sn-bloom">
                <g className="sn-breathe">
                  {/* Outer Base Petals */}
                  <path
                    d="M32 49 C17 49 7 40 5 29 C15 32 23 39 32 49 Z"
                    fill="url(#snPetalOuter)"
                    opacity=".9"
                  />
                  <path
                    d="M32 49 C47 49 57 40 59 29 C49 32 41 39 32 49 Z"
                    fill="url(#snPetalOuter)"
                    opacity=".9"
                  />
                  {/* Mid Layer Petals */}
                  <path
                    d="M32 48 C19 44 12 31 14 19 C22 25 27 34 32 48 Z"
                    fill="url(#snPetalInner)"
                    opacity=".92"
                  />
                  <path
                    d="M32 48 C45 44 52 31 50 19 C42 25 37 34 32 48 Z"
                    fill="url(#snPetalInner)"
                    opacity=".92"
                  />
                  {/* Center Sacred Crown Petal */}
                  <path
                    d="M32 12 C40 23 41 36 32 48 C23 36 24 23 32 12 Z"
                    fill="url(#snPetalInner)"
                    stroke="#fef9c3"
                    strokeWidth="0.6"
                  />
                  {/* Levitating Mind-Consciousness Crystal Orb */}
                  <circle cx="32" cy="14" r="5.5" fill="#5eead4" opacity=".28" />
                  <circle cx="32" cy="14" r="3" fill="url(#snPranaCore)" />
                  <circle cx="32" cy="13.2" r="1.2" fill="#ffffff" />
                </g>
              </g>
            </svg>
          </div>
        ))}
      </div>

      {/* Compact 3D Foreground Text (Same exact proportions & spacing, SEO semantic tags) */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: EASE }}
        className="sn-chip relative z-10 mb-1.5 sm:mb-2.5 inline-flex items-center gap-2 rounded-full px-3.5 py-0.5 sm:px-4 sm:py-1 text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide text-teal-100"
      >
        <span className="sn-chip-dot" aria-hidden="true" />
        <span>🪷 {t.greet} 🪷</span>
        <span className="sn-chip-dot" aria-hidden="true" />
      </motion.p>

      <motion.h1
        id="hero-consciousness-title"
        itemProp="headline"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.06, ease: EASE }}
        className="relative z-10 font-cinzel text-xl leading-snug sm:text-3xl md:text-5xl lg:text-6xl font-black mb-1 sm:mb-2 max-w-4xl mx-auto"
      >
        <span className="sn-gold">{t.title}</span>
      </motion.h1>

      <motion.p
        itemProp="description"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12, ease: EASE }}
        className="sn-sub relative z-10 max-w-lg md:max-w-xl mx-auto text-xs sm:text-sm md:text-base px-2 leading-relaxed font-medium text-slate-100/95"
      >
        {t.sub}
      </motion.p>
    </section>
  );
}
