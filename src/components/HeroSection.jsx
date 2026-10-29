
// @ts-nocheck
"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * ============================================================================
 * 🪔 ULTRA-3D DIWALI SPIRITUAL LIBRARY HERO SECTION (0 External Assets)
 * ============================================================================
 * Next.js me use karne ke liye niche wali line uncomment karein:
 * import Link from "next/link";
 *
 * Features:
 * 1. True 3D Multi-Plane Perspective (preserve-3d + Z-depth layers from -180px to +190px)
 * 2. 3D Projected Fireworks Engine (Rockets, Lotus, Saturn Rings, Golden Willows & Anar Fountains
 *    jinke sparks 3D camera ki taraf screen se bahar aate hain!)
 * 3. Floating 3D Animated Books (Hawa me tairti hui roshan aadhyatmik kitabein)
 * 4. Interactive Diyas & Rotating Sacred Rangoli (Diye par click karne par Maha-Aarti wave)
 * 5. Zero Image / Video / Font Blocking — 100% Instant Load Procedural SVG + Canvas
 */

// Safe Link wrapper so it works out-of-the-box in both Next.js and standard React previews
const SafeLink = ({ href, className, children, ...props }) => (
  <a href={href} className={className} {...props}>
    {children}
  </a>
);

const dict = {
  EN: {
    greet: "Shubh Deepawali",
    badgeSub: "Festival of Inner Light",
    title: "Awaken Your Consciousness",
    sub: "100% original, verified digital books on ancient spirituality, meditation & deep psychology.",
    cta: "Explore Sacred Library",
    finale: "Launch Grand Finale 🎆",
    hint: "Tap anywhere in the sky for 3D fireworks • Tap any Diya to bless ✨",
    stats: ["100% Original Texts", "Instant Digital Access", "Verified Wisdom"],
  },
  HI: {
    greet: "शुभ दीपावली",
    badgeSub: "अंतर्मन के प्रकाश का पर्व",
    title: "अपनी चेतना को जागृत करें",
    sub: "आध्यात्मिकता, ध्यान और गहन मनोविज्ञान पर 100% मूल एवं प्रामाणिक डिजिटल पुस्तकें।",
    cta: "पवित्र पुस्तकालय देखें",
    finale: "महा-आतिशबाजी चलाएं 🎆",
    hint: "3D पटाखों के लिए आकाश में टैप करें • आशीर्वाद के लिए दीयों को छुएं ✨",
    stats: ["100% मूल ग्रंथ", "तुरंत डिजिटल पठन", "प्रामाणिक ज्ञान"],
  },
};

// Foreground & Midground Floating 3D Embers (some fly very close to the lens for 3D pop-out)
const EMBERS = [
  { l: "6%", s: 6, t: "6.5s", d: "-1s", x: "24px", z: 140, blur: 1.5 },
  { l: "15%", s: 3.5, t: "8.5s", d: "-4s", x: "-22px", z: 40, blur: 0 },
  { l: "26%", s: 7, t: "7s", d: "-2s", x: "32px", z: 175, blur: 2 },
  { l: "38%", s: 4, t: "9.5s", d: "-6s", x: "-18px", z: 60, blur: 0 },
  { l: "52%", s: 5, t: "7.2s", d: "-3s", x: "25px", z: 120, blur: 1 },
  { l: "64%", s: 8, t: "6.8s", d: "-5s", x: "-30px", z: 185, blur: 2.5 },
  { l: "75%", s: 3.5, t: "8.8s", d: "-2.5s", x: "18px", z: 50, blur: 0 },
  { l: "86%", s: 6.5, t: "7.4s", d: "-4.5s", x: "-24px", z: 150, blur: 1.5 },
  { l: "94%", s: 4, t: "8s", d: "-1.8s", x: "15px", z: 80, blur: 0 },
];

// 3D Floating Akash Kandils (Sky Lanterns) at different Z-depths
const LANTERNS = [
  { l: "9%", t: "19s", d: "-4s", x: "30px", sc: 1.15, z: 90, m: false },
  { l: "24%", t: "24s", d: "-12s", x: "-28px", sc: 0.75, z: -40, m: true },
  { l: "42%", t: "27s", d: "-16s", x: "22px", sc: 0.65, z: -80, m: true },
  { l: "61%", t: "25s", d: "-9s", x: "-25px", sc: 0.7, z: -60, m: true },
  { l: "78%", t: "21s", d: "-14s", x: "32px", sc: 0.9, z: 30, m: true },
  { l: "90%", t: "18s", d: "-7s", x: "-26px", sc: 1.2, z: 105, m: false },
];

// 7 Ornate 3D Diyas arranged in a curved 3D altar arc (center diya comes closest to viewer)
const DIYAS = [0, 1, 2, 3, 4, 5, 6].map((i) => {
  const distFromCenter = Math.abs(i - 3);
  return {
    i,
    delay: 0.4 + distFromCenter * 0.25,
    zOffset: (3 - distFromCenter) * 18, // Center diyas pop forward in 3D
    yOffset: distFromCenter * 4,
    scale: 1.15 - distFromCenter * 0.08,
    mobileHidden: i === 0 || i === 6,
  };
});

const PALETTE = [
  [255, 215, 85],  // Royal Gold
  [255, 140, 45],  // Deep Saffron
  [255, 75, 115],  // Kumkum Rose
  [255, 240, 175], // White-Gold Spark
  [215, 120, 255], // Mystic Violet
  [90, 225, 255],  // Celestial Cyan
  [130, 255, 185], // Emerald Prana
];

/* ═══════════ Deterministic Fast RNG ═══════════ */
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

/* ═══════════ Procedural 3D Grand Library & Royal Jharokha Arch (Pure SVG) ═══════════ */
function buildLibrary() {
  const r = rng(20261108);
  const PAL = [
    "#7f1d1d", "#9a3412", "#92400e", "#78350f", "#1e3a5f",
    "#1e40af", "#312e81", "#581c87", "#831843", "#14532d",
    "#115e59", "#4c1d95", "#a16207", "#7c2d12", "#9f1239",
  ];
  const WIN = { x1: 420, x2: 780, sill: 485, spring: 215, rad: 180 };
  const wall = `M0 0H1200V640H0Z M${WIN.x1} ${WIN.sill}V${WIN.spring}A${WIN.rad} ${WIN.rad} 0 0 1 ${WIN.x2} ${WIN.spring}V${WIN.sill}Z`;

  let s =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 640" preserveAspectRatio="xMidYMax slice" style="width:100%;height:100%;display:block" aria-hidden="true">` +
    `<defs>` +
    `<linearGradient id="dvWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c28340"/><stop offset=".4" stop-color="#854d1e"/><stop offset="1" stop-color="#3b1d08"/></linearGradient>` +
    `<linearGradient id="dvGoldTrim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#92400e"/><stop offset=".5" stop-color="#fde68a"/><stop offset="1" stop-color="#92400e"/></linearGradient>` +
    `<linearGradient id="dvShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".75"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>` +
    `<radialGradient id="dvMoon"><stop offset="0" stop-color="#fffbeb" stop-opacity=".85"/><stop offset=".35" stop-color="#fde68a" stop-opacity=".35"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="dvWinGlow" cx="50%" cy="45%" r="55%"><stop offset="0" stop-color="#ff9e2c" stop-opacity=".28"/><stop offset="1" stop-color="#ff9e2c" stop-opacity="0"/></radialGradient>` +
    `</defs>`;

  // Glowing Moon & Halo inside the Jharokha window
  s +=
    `<circle cx="685" cy="118" r="78" fill="url(#dvMoon)"/>` +
    `<circle cx="685" cy="118" r="22" fill="#fffbeb"/>` +
    `<circle cx="677" cy="112" r="4" fill="#e9dcae" opacity=".55"/>` +
    `<circle cx="692" cy="125" r="2.5" fill="#e9dcae" opacity=".45"/>`;

  // Distant Palace Silhouette on Horizon inside Window
  s += `<path d="M420 485 L420 435 L445 435 L445 415 L460 398 L475 415 L475 435 L515 435 L515 410 L535 385 L555 410 L555 435 L645 435 L645 405 L665 380 L685 405 L685 435 L725 435 L725 418 L740 400 L755 418 L755 435 L780 435 L780 485 Z" fill="#0d0618" opacity=".85"/>`;

  // Main Library Wall with Arch Cutout
  s += `<path d="${wall}" fill-rule="evenodd" fill="#12091c"/>`;

  // Bookshelves & Ornate Books with 3D Spine Highlights
  const baselines = [165, 315, 465, 615];
  for (const b of baselines) {
    const segs =
      b <= 465
        ? [
            [18, WIN.x1 - 14],
            [WIN.x2 + 14, 1182],
          ]
        : [[18, 1182]];

    for (const [start, end] of segs) {
      // Shelf Backshadow
      s += `<rect x="${start}" y="${b - 135}" width="${end - start}" height="135" fill="#090410" opacity=".65"/>`;

      let x = start + 4;
      while (x < end - 14) {
        if (r() < 0.04) {
          x += 12 + Math.floor(r() * 10);
          continue;
        }
        let w = 13 + Math.floor(r() * 18);
        if (x + w > end - 4) w = end - 4 - x;
        if (w < 10) break;
        const h = 126 - Math.floor(r() * 44);
        const y = b - h;
        const c = PAL[Math.floor(r() * PAL.length)];

        // Book Spine Base + 3D Left Highlight
        s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2" fill="${c}"/>`;
        s += `<rect x="${x}" y="${y}" width="${Math.max(2, Math.round(w * 0.22))}" height="${h}" rx="1" fill="#ffffff" opacity=".12"/>`;
        s += `<rect x="${x + w - 3}" y="${y}" width="3" height="${h}" fill="#000000" opacity=".32"/>`;

        // Gold Foil Bands & Spiritual Symbols on Spines
        if (r() < 0.78) {
          s += `<rect x="${x + 1}" y="${y + 9}" width="${w - 2}" height="2.8" fill="#fcd34d" opacity=".82"/>`;
        }
        if (r() < 0.65) {
          s += `<rect x="${x + 1}" y="${y + h - 13}" width="${w - 2}" height="2.8" fill="#fcd34d" opacity=".7"/>`;
        }
        if (r() < 0.38) {
          const cy = Math.round(y + h * 0.46);
          const cx = (x + w / 2).toFixed(1);
          s += `<circle cx="${cx}" cy="${cy}" r="${Math.min(4.5, w * 0.25).toFixed(1)}" fill="none" stroke="#fde68a" stroke-width="1.2" opacity=".7"/>`;
        }
        x += w + 1.5;
      }

      // 3D Wooden Shelf Ledge + Gold Trim + Drop Shadow
      s +=
        `<rect x="${start - 8}" y="${b}" width="${end - start + 16}" height="11" rx="2" fill="url(#dvWood)"/>` +
        `<rect x="${start - 8}" y="${b + 2}" width="${end - start + 16}" height="1.6" fill="url(#dvGoldTrim)" opacity=".75"/>` +
        `<rect x="${start - 8}" y="${b + 11}" width="${end - start + 16}" height="18" fill="url(#dvShade)"/>`;
    }
  }

  // Subtle ambient vignette on wall so foreground 3D elements pop out
  s += `<path d="${wall}" fill-rule="evenodd" fill="rgba(8,3,18,.44)"/>`;
  s += `<circle cx="600" cy="290" r="290" fill="url(#dvWinGlow)"/>`;

  // Royal Rajasthani / Temple Jharokha Arch Frame
  s +=
    `<path d="M${WIN.x1} ${WIN.sill}V${WIN.spring}A${WIN.rad} ${WIN.rad} 0 0 1 ${WIN.x2} ${WIN.spring}V${WIN.sill}" fill="none" stroke="url(#dvWood)" stroke-width="14"/>` +
    `<path d="M${WIN.x1} ${WIN.sill}V${WIN.spring}A${WIN.rad} ${WIN.rad} 0 0 1 ${WIN.x2} ${WIN.spring}V${WIN.sill}" fill="none" stroke="#fcd34d" stroke-width="2" opacity=".75"/>` +
    `<path d="M${WIN.x1 + 10} ${WIN.sill}V${WIN.spring}A${WIN.rad - 10} ${WIN.rad - 10} 0 0 1 ${WIN.x2 - 10} ${WIN.spring}V${WIN.sill}" fill="none" stroke="#fde68a" stroke-width="1.2" stroke-dasharray="6 4" opacity=".55"/>` +
    `<rect x="${WIN.x1 - 18}" y="${WIN.sill}" width="${WIN.x2 - WIN.x1 + 36}" height="14" rx="3" fill="url(#dvWood)"/>` +
    `<rect x="${WIN.x1 - 14}" y="${WIN.sill + 2}" width="${WIN.x2 - WIN.x1 + 28}" height="2" fill="#fde68a" opacity=".8"/>`;

  return s + `</svg>`;
}

/* ═══════════ Procedural 3D Toran Lights & Marigold Garland (Pure SVG) ═══════════ */
function buildToran() {
  const cols = ["#ffd166", "#ff9f1c", "#ff4d79", "#fff3b0", "#38bdf8"];
  let d = "M0 8",
    d2 = "M0 14",
    bulbs = "",
    n = 0;

  for (let i = 0; i < 4; i++) {
    const x0 = i * 300,
      x2 = x0 + 300,
      cx = x0 + 150,
      cy = 96,
      y0 = 8;
    d += ` Q${cx} ${cy} ${x2} ${y0}`;
    d2 += ` Q${cx} ${cy + 16} ${x2} ${y0 + 6}`;

    for (let k = 1; k <= 7; k++) {
      const t = k / 8,
        m = 1 - t;
      const x = (m * m * x0 + 2 * m * t * cx + t * t * x2).toFixed(1);
      const y = (m * m * y0 + 2 * m * t * cy + t * t * y0).toFixed(1);
      const c = cols[n % cols.length];
      const dl = ((n * 0.31) % 2.8).toFixed(2);

      // Hanging Golden Bell / Tassel on center of each festoon
      if (k === 4) {
        bulbs +=
          `<line x1="${x}" y1="${y}" x2="${x}" y2="${Number(y) + 22}" stroke="#fbbf24" stroke-width="1.5"/>` +
          `<path d="M${Number(x) - 6} ${Number(y) + 26} Q${x} ${Number(y) + 16} ${Number(x) + 6} ${Number(y) + 26} Z" fill="#f59e0b"/>` +
          `<circle cx="${x}" cy="${Number(y) + 28}" r="2.2" fill="#fef08a"/>`;
      }

      bulbs +=
        `<circle cx="${x}" cy="${y}" r="11" fill="${c}" fill-opacity=".28" class="dv-bulb" style="animation-delay:-${dl}s"/>` +
        `<circle cx="${x}" cy="${y}" r="4.2" fill="${c}" class="dv-bulb" style="animation-delay:-${dl}s"/>` +
        `<circle cx="${x}" cy="${y}" r="1.8" fill="#ffffff"/>`;
      n++;
    }
    // Marigold Knot at Pillar Joints
    if (i > 0) {
      bulbs +=
        `<circle cx="${x0}" cy="10" r="8" fill="#ea580c"/>` +
        `<circle cx="${x0}" cy="10" r="4.5" fill="#facc15"/>`;
    }
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="xMidYMin slice" style="width:100%;height:100%;display:block" aria-hidden="true">` +
    `<path d="${d2}" fill="none" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3 5" opacity=".45"/>` +
    `<path d="${d}" fill="none" stroke="#92400e" stroke-width="2.2" opacity=".9"/>` +
    `${bulbs}</svg>`
  );
}

const LIBRARY_SVG = buildLibrary();
const TORAN_SVG = buildToran();

/* ═══════════ Optional Web Audio Synthesizer (0 Downloads, Pure Procedural Festive Sound) ═══════════ */
function createFestiveAudio() {
  let ctx = null;
  const init = () => {
    if (!ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) ctx = new AudioCtx();
    }
    if (ctx && ctx.state === "suspended") ctx.resume();
    return ctx;
  };

  const playSparkleChime = (freq = 528) => {
    try {
      const ac = init();
      if (!ac) return;
      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.45);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);
      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    } catch {}
  };

  const playFireworkPop = () => {
    try {
      const ac = init();
      if (!ac) return;
      const now = ac.currentTime;
      const bufferSize = ac.sampleRate * 0.18;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ac.sampleRate * 0.04));
      }
      const noise = ac.createBufferSource();
      noise.buffer = buffer;

      const filter = ac.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = 950 + Math.random() * 600;

      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);
      noise.start(now);
    } catch {}
  };

  return { playSparkleChime, playFireworkPop };
}

/* ═══════════ 3D Perspective Fireworks & Anar Fountains Engine (Canvas) ═══════════ */
function useFireworks3D(wrapRef, canvasRef, apiRef, soundEnabledRef, audioRef) {
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
      nextAt = 0.35,
      anarBurstTimer = 0,
      visible = true;

    const rockets = [],
      sparks = [],
      flashes = [],
      shockwaves = [];

    const FOV = 420; // 3D Camera Field of View for particles flying AT the screen

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.5 : 2);
      const r = wrap.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const pickColor = () => PALETTE[(Math.random() * PALETTE.length) | 0];

    const explode = (x, y, customPower) => {
      const c = pickColor(),
        c2 = pickColor();
      const sm = small();
      const power = (customPower || (sm ? 125 : 185)) * (0.9 + Math.random() * 0.4);
      const roll = Math.random();

      if (soundEnabledRef.current && audioRef.current) {
        audioRef.current.playFireworkPop();
      }

      // 3D Volumetric Flash + Expanding Perspective Shockwave Ring
      flashes.push({ x, y, life: 1, c });
      shockwaves.push({ x, y, r: 4, maxR: power * 1.15, life: 1, c });

      if (roll < 0.38) {
        // 1. TRUE 3D SPHERICAL PEONY (Sparks fly towards the viewer in Z-space!)
        const n = sm ? 44 : 80;
        for (let i = 0; i < n; i++) {
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const sp = power * (0.45 + Math.random() * 0.65);
          const sinPhi = Math.sin(phi);
          sparks.push({
            x,
            y,
            z: 0,
            vx: Math.cos(theta) * sinPhi * sp,
            vy: Math.sin(theta) * sinPhi * sp,
            vz: Math.cos(phi) * sp * 1.35, // Z-velocity towards/away from screen!
            life: 1,
            decay: 0.52 + Math.random() * 0.4,
            c: i % 3 === 0 ? c2 : c,
            g: 68,
            dr: 0.14,
            tl: 0.045,
            bokeh: i % 7 === 0, // Special foreground 3D lens orbs
          });
        }
      } else if (roll < 0.68) {
        // 2. 3D TILTED SATURN RING + CORE
        const n = sm ? 34 : 56;
        const tiltX = (Math.random() - 0.5) * 0.9;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          const rx = Math.cos(a) * power;
          const ry = Math.sin(a) * power * 0.45;
          const rz = Math.sin(a) * power * 1.1;
          sparks.push({
            x,
            y,
            z: 0,
            vx: rx,
            vy: ry + rz * tiltX,
            vz: rz,
            life: 1,
            decay: 0.65,
            c,
            g: 55,
            dr: 0.15,
            tl: 0.04,
            bokeh: i % 6 === 0,
          });
          if (i % 2 === 0) {
            sparks.push({
              x,
              y,
              z: 0,
              vx: Math.cos(a) * power * 0.45,
              vy: Math.sin(a) * power * 0.45,
              vz: (Math.random() - 0.5) * 140,
              life: 1,
              decay: 0.78,
              c: c2,
              g: 55,
              dr: 0.15,
              tl: 0.035,
              bokeh: false,
            });
          }
        }
      } else {
        // 3. ROYAL GOLDEN WILLOW CASCADE + FOREGROUND BOKEH
        const n = sm ? 36 : 64;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + Math.random() * 0.15;
          const sp = power * 0.82 * (0.45 + Math.random() * 0.6);
          sparks.push({
            x,
            y,
            z: 0,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp,
            vz: (Math.random() - 0.35) * sp * 1.2,
            life: 1,
            decay: 0.22 + Math.random() * 0.15,
            c: [255, 215, 110],
            g: 110,
            dr: 0.38,
            tl: 0.075,
            bokeh: i % 8 === 0,
          });
        }
      }

      const cap = sm ? 340 : 620;
      if (sparks.length > cap) sparks.splice(0, sparks.length - cap);
    };

    const launch = (tx, ty) => {
      const aimed = typeof tx === "number";
      const startX = aimed ? w * 0.5 + (tx - w * 0.5) * 0.35 : w * (0.12 + Math.random() * 0.76);
      const targetX = aimed ? tx : startX + (Math.random() - 0.5) * 70;
      const targetY = aimed ? Math.min(ty, h * 0.78) : h * (0.1 + Math.random() * 0.34);
      const distY = Math.max(80, h * 0.96 - targetY);
      const speed = Math.max(420, h * (aimed ? 1.45 : 1.05));
      const flightTime = distY / speed;

      rockets.push({
        x: startX,
        y: h * 0.96,
        ty: targetY,
        vx: (targetX - startX) / Math.max(0.15, flightTime),
        v: speed,
      });
    };

    // Launch a celebratory salvo across the sky
    const launchFinale = () => {
      for (let i = 0; i < 6; i++) {
        setTimeout(() => {
          if (!w || !h) return;
          launch(w * (0.15 + (i / 5) * 0.7), h * (0.14 + (i % 2) * 0.14));
        }, i * 150);
      }
      anarBurstTimer = 2.4; // Boost bottom Anar fountains!
    };

    // Trigger golden blessing wave from a clicked Diya
    const blessFromDiya = (dx, dy) => {
      if (soundEnabledRef.current && audioRef.current) {
        audioRef.current.playSparkleChime(528 + Math.random() * 140);
      }
      shockwaves.push({ x: dx, y: dy, r: 5, maxR: 190, life: 1, c: [255, 215, 90] });
      for (let i = 0; i < 36; i++) {
        const a = -Math.PI * (0.1 + 0.8 * Math.random());
        const sp = 90 + Math.random() * 170;
        sparks.push({
          x: dx,
          y: dy,
          z: 60,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 40,
          vz: 80 + Math.random() * 140, // Fly right out towards the user!
          life: 1,
          decay: 0.45 + Math.random() * 0.3,
          c: i % 2 === 0 ? [255, 220, 100] : [255, 140, 45],
          g: 95,
          dr: 0.25,
          tl: 0.05,
          bokeh: i % 3 === 0,
        });
      }
    };

    apiRef.current = { launch, launchFinale, blessFromDiya };

    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((t - last) / 1000 || 0.016, 0.05);
      last = t;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      // Auto Sky Fireworks
      nextAt -= dt;
      if (nextAt <= 0) {
        launch();
        if (Math.random() < 0.38) setTimeout(launch, 220);
        nextAt = 0.75 + Math.random() * 1.1;
      }

      // Continuous Subtle Anar (Flowerpot) Fountains on Left & Right Corners
      if (anarBurstTimer > 0) anarBurstTimer -= dt;
      const anarActive = anarBurstTimer > 0 || Math.random() < (small() ? 0.28 : 0.45);
      if (anarActive && sparks.length < (small() ? 240 : 480)) {
        const corners = [w * 0.06, w * 0.94];
        for (const cx of corners) {
          if (anarBurstTimer <= 0 && Math.random() > 0.45) continue;
          const a = -Math.PI * 0.5 + (Math.random() - 0.5) * 0.48;
          const sp = (anarBurstTimer > 0 ? 220 : 145) * (0.65 + Math.random() * 0.55);
          sparks.push({
            x: cx,
            y: h * 0.95,
            z: 40,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp,
            vz: (Math.random() - 0.2) * 130,
            life: 0.85,
            decay: 0.75 + Math.random() * 0.4,
            c: Math.random() < 0.7 ? [255, 215, 100] : [255, 150, 60],
            g: 180,
            dr: 0.4,
            tl: 0.035,
            bokeh: Math.random() < 0.15,
          });
        }
      }

      // Draw Ascending Rockets with Golden Comet Trails
      for (let i = rockets.length - 1; i >= 0; i--) {
        const rk = rockets[i];
        rk.y -= rk.v * dt;
        rk.x += rk.vx * dt;

        // Trail sparks behind rocket
        if (Math.random() < 0.65) {
          sparks.push({
            x: rk.x,
            y: rk.y + 4,
            z: 0,
            vx: (Math.random() - 0.5) * 28,
            vy: 30 + Math.random() * 40,
            vz: (Math.random() - 0.5) * 40,
            life: 0.45,
            decay: 1.4,
            c: [255, 200, 110],
            g: 40,
            dr: 0.5,
            tl: 0.02,
            bokeh: false,
          });
        }

        ctx.strokeStyle = "rgba(255,230,165,.92)";
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        ctx.moveTo(rk.x - rk.vx * 0.045, rk.y + 20);
        ctx.lineTo(rk.x, rk.y);
        ctx.stroke();

        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(rk.x, rk.y, 2.6, 0, 6.2832);
        ctx.fill();

        if (rk.y <= rk.ty) {
          explode(rk.x, rk.y);
          rockets.splice(i, 1);
        }
      }

      // Draw Expanding 3D Shockwave Rings
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.life -= dt * 1.85;
        if (sw.life <= 0) {
          shockwaves.splice(i, 1);
          continue;
        }
        sw.r += (sw.maxR - sw.r) * dt * 5.5;
        ctx.strokeStyle = `rgba(${sw.c[0]},${sw.c[1]},${sw.c[2]},${sw.life * 0.38})`;
        ctx.lineWidth = 1.8 * sw.life;
        ctx.beginPath();
        ctx.ellipse(sw.x, sw.y, sw.r, sw.r * 0.65, 0, 0, 6.2832);
        ctx.stroke();
      }

      // Draw Volumetric Sky Flashes
      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.life -= dt * 3.8;
        if (f.life <= 0) {
          flashes.splice(i, 1);
          continue;
        }
        const rad = 95 * (1.2 - f.life * 0.5);
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, rad);
        g.addColorStop(0, `rgba(${f.c[0]},${f.c[1]},${f.c[2]},${0.62 * f.life})`);
        g.addColorStop(1, `rgba(${f.c[0]},${f.c[1]},${f.c[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(f.x, f.y, rad, 0, 6.2832);
        ctx.fill();
      }

      // Draw 3D Perspective-Projected Sparks (Sparks with +Z grow larger & pop out of screen!)
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
        s.z = Math.min(FOV - 55, (s.z || 0) + (s.vz || 0) * dt);
        s.life -= s.decay * dt;

        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        // 3D Perspective Projection Math
        const persp = FOV / Math.max(60, FOV - s.z);
        const sx = cx + (s.x - cx) * persp;
        const sy = cy + (s.y - cy) * persp;
        const px = cx + (s.x - s.vx * s.tl - cx) * persp;
        const py = cy + (s.y - s.vy * s.tl - cy) * persp;

        ctx.strokeStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${s.life})`;
        ctx.lineWidth = Math.min(6.5, (1.1 + s.life * 1.5) * persp);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(sx, sy);
        ctx.stroke();

        // 3D Out-of-Screen Bokeh Glow for particles flying close to camera lens
        if (s.bokeh && persp > 1.18) {
          const br = Math.min(18, 4.5 * persp * s.life);
          ctx.fillStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${s.life * 0.28})`;
          ctx.beginPath();
          ctx.arc(sx, sy, br, 0, 6.2832);
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
  }, [wrapRef, canvasRef, apiRef, soundEnabledRef, audioRef]);
}

/* ═══════════ 3D CSS & Keyframes ═══════════ */
const CSS = `
.dv-stage{
  perspective: 1150px;
  background:
    radial-gradient(125% 75% at 50% 105%, rgba(255,145,35,.42), transparent 62%),
    radial-gradient(75% 55% at 50% 32%, rgba(139,92,246,.22), transparent 68%),
    linear-gradient(180deg, #060311 0%, #140826 52%, #2a0f35 100%);
}
.dv-scene3d{
  transform-style: preserve-3d;
  will-change: transform;
  animation: dv-cam-orbit 14s ease-in-out infinite alternate;
}
@keyframes dv-cam-orbit{
  0%   { transform: rotateX(calc(var(--rx, 0deg) + 1.8deg)) rotateY(calc(var(--ry, 0deg) - 2.6deg)) scale3d(1.02,1.02,1.02); }
  50%  { transform: rotateX(calc(var(--rx, 0deg) - 1.2deg)) rotateY(calc(var(--ry, 0deg) + 0deg))   scale3d(1.04,1.04,1.04); }
  100% { transform: rotateX(calc(var(--rx, 0deg) + 1.5deg)) rotateY(calc(var(--ry, 0deg) + 2.6deg)) scale3d(1.02,1.02,1.02); }
}

.dv-layer{
  position: absolute;
  inset: -4%;
  pointer-events: none;
  transform-style: preserve-3d;
}

.dv-stars{
  position:absolute;inset:0;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cg fill='white'%3E%3Ccircle cx='18' cy='26' r='1.2'/%3E%3Ccircle cx='96' cy='60' r='.9'/%3E%3Ccircle cx='170' cy='20' r='1.4'/%3E%3Ccircle cx='220' cy='110' r='1'/%3E%3Ccircle cx='60' cy='140' r='1.1'/%3E%3Ccircle cx='140' cy='180' r='.8'/%3E%3Ccircle cx='30' cy='210' r='1.3'/%3E%3Ccircle cx='200' cy='214' r='1'/%3E%3C/g%3E%3C/svg%3E");
  background-size:240px 240px;
  animation:dv-tw 3.6s ease-in-out infinite alternate;
}
.dv-stars.b{background-size:170px 170px;background-position:60px 40px;animation-duration:5.5s;animation-delay:-2s;opacity:.65}
@keyframes dv-tw{from{opacity:.3}to{opacity:1}}

.dv-chakra{
  animation: dv-spin 48s linear infinite;
}
.dv-chakra-rev{
  animation: dv-spin-rev 36s linear infinite;
}
@keyframes dv-spin{to{transform:rotate(360deg)}}
@keyframes dv-spin-rev{to{transform:rotate(-360deg)}}

.dv-lamp{position:absolute;top:15%;width:56%;height:82%;opacity:.85;animation:dv-lamp 3.5s ease-in-out infinite alternate}
.dv-lamp.l{left:-12%;background:radial-gradient(ellipse at 35% 55%,rgba(255,160,55,.34),transparent 62%)}
.dv-lamp.r{right:-12%;background:radial-gradient(ellipse at 65% 55%,rgba(255,160,55,.34),transparent 62%);animation-delay:-1.8s}
@keyframes dv-lamp{from{opacity:.55}to{opacity:1}}

.dv-rays{
  position:absolute;left:50%;top:2%;width:78%;height:98%;
  transform:translateX(-50%) translateZ(20px);
  background:conic-gradient(from 158deg at 50% 8%, transparent 0deg, rgba(255,205,115,.18) 12deg, transparent 22deg, rgba(255,185,90,.24) 32deg, transparent 44deg);
  filter: blur(8px);
  animation:dv-ray 5s ease-in-out infinite alternate;
}
@keyframes dv-ray{from{opacity:.5;transform:translateX(-50%) scaleX(.96)}to{opacity:1;transform:translateX(-50%) scaleX(1.05)}}

.dv-bulb{animation:dv-bt 2.1s ease-in-out infinite alternate}
@keyframes dv-bt{from{opacity:.45}to{opacity:1}}

/* 3D Floating Magical Books (Popping out in mid-air) */
.dv-book3d{
  transform-style: preserve-3d;
  animation: dv-book-float 5.5s ease-in-out infinite alternate;
  filter: drop-shadow(0 22px 28px rgba(0,0,0,.7)) drop-shadow(0 0 22px rgba(251,191,36,.35));
}
.dv-book3d.right{
  animation-delay: -2.7s;
}
@keyframes dv-book-float{
  0%   { transform: translateY(0px) rotateX(18deg) rotateY(-22deg) rotateZ(-4deg); }
  100% { transform: translateY(-16px) rotateX(26deg) rotateY(-10deg) rotateZ(4deg); }
}
.dv-wing-l{
  transform-origin: 50px 55px;
  animation: dv-flap-l 2.8s ease-in-out infinite alternate;
}
.dv-wing-r{
  transform-origin: 50px 55px;
  animation: dv-flap-r 2.8s ease-in-out infinite alternate;
}
@keyframes dv-flap-l{from{transform:rotate(-8deg)}to{transform:rotate(6deg)}}
@keyframes dv-flap-r{from{transform:rotate(8deg)}to{transform:rotate(-6deg)}}

/* Rising 3D Embers & Sky Lanterns */
.dv-ember,.dv-lantern{
  position:absolute;bottom:-30px;opacity:0;
  will-change:transform,opacity;
  animation:dv-rise linear infinite;
}
.dv-ember{
  border-radius:50%;
  background:radial-gradient(circle,#fffbeb,#fbbf24 45%,#ea580c 72%,transparent 78%);
  box-shadow: 0 0 12px 2px rgba(251,191,36,.65);
}
.dv-lantern{
  width:20px;height:28px;
  border-radius:7px 7px 10px 10px;
  background:radial-gradient(circle at 50% 65%,#fffbeb 5%,#fbbf24 45%,#ea580c 90%);
  box-shadow:0 0 24px 8px rgba(255,155,45,.55);
  border: 1px solid rgba(254,240,138,.6);
}
.dv-lantern::after{
  content:"";position:absolute;bottom:-3px;left:25%;width:50%;height:3px;
  border-radius:50%;background:#fef08a;box-shadow:0 0 8px 2px #fff;
}
@keyframes dv-rise{
  0%   { transform:translate3d(0,0,var(--z, 0px)) scale(.8); opacity:0; }
  15%  { opacity:.95; }
  85%  { opacity:.85; }
  100% { transform:translate3d(var(--dx),-460px,calc(var(--z, 0px) + 60px)) scale(1.15); opacity:0; }
}

/* 3D Extruded Liquid Gold Title */
.dv-gold{
  background:linear-gradient(95deg,#fef08a 0%,#f59e0b 25%,#ffffff 50%,#f59e0b 75%,#fef08a 100%);
  background-size:200% auto;
  -webkit-background-clip:text;
  background-clip:text;
  color:transparent;
  animation:dv-shine 5s linear infinite;
  filter:
    drop-shadow(0 2px 0 rgba(146,64,14,.95))
    drop-shadow(0 5px 0 rgba(69,26,3,.9))
    drop-shadow(0 12px 24px rgba(0,0,0,.85))
    drop-shadow(0 0 26px rgba(245,158,11,.55));
}
@keyframes dv-shine{to{background-position:200% center}}

.dv-chip{
  background:linear-gradient(135deg, rgba(35,14,52,.78), rgba(18,7,28,.85));
  border:1px solid rgba(253,224,71,.42);
  box-shadow:0 10px 30px -6px rgba(0,0,0,.7), 0 0 28px -4px rgba(245,158,11,.5), inset 0 1px 0 rgba(255,255,255,.25);
  backdrop-filter: blur(10px);
}
.dv-sub{text-shadow:0 4px 18px rgba(0,0,0,.95), 0 1px 3px rgba(0,0,0,.9)}

/* 3D Interactive CTA Button */
.dv-cta{
  position: relative;
  background:linear-gradient(92deg,#fde047,#f59e0b,#fffbeb,#f59e0b);
  background-size:220% auto;
  color:#270e03;
  box-shadow:
    0 6px 0 #92400e,
    0 14px 32px -4px rgba(245,158,11,.7),
    inset 0 2px 1px rgba(255,255,255,.75);
  transition:transform .22s cubic-bezier(.2,1.3,.4,1), box-shadow .22s ease, background-position .5s ease;
}
.dv-cta:hover{
  transform:translateY(-4px) scale(1.05);
  background-position:100% 0;
  box-shadow:
    0 9px 0 #92400e,
    0 22px 42px -4px rgba(245,158,11,.85),
    inset 0 2px 2px rgba(255,255,255,.9);
}
.dv-cta:active{
  transform:translateY(2px) scale(.98);
  box-shadow: 0 2px 0 #92400e, 0 8px 18px -4px rgba(245,158,11,.6);
}

.dv-sec-btn{
  background: rgba(24, 10, 38, 0.68);
  border: 1px solid rgba(251, 191, 36, 0.4);
  color: #fef3c7;
  box-shadow: 0 8px 24px -4px rgba(0,0,0,.6), inset 0 1px 0 rgba(255,255,255,.15);
  backdrop-filter: blur(8px);
  transition: all .22s ease;
}
.dv-sec-btn:hover{
  background: rgba(245, 158, 11, 0.22);
  border-color: rgba(253, 224, 71, 0.8);
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 12px 28px -4px rgba(245,158,11,.4);
}

/* 3D Floor Perspective Rangoli & Diya Reflections */
.dv-floor-rangoli{
  transform: translateX(-50%) rotateX(74deg) translateZ(-10px);
  transform-style: preserve-3d;
}

.dv-diya{
  position:relative;
  cursor: pointer;
  transition: transform .28s cubic-bezier(.2,1.4,.4,1), filter .28s ease;
  filter: drop-shadow(0 12px 14px rgba(0,0,0,.85));
}
.dv-diya:hover{
  transform: translateY(-8px) scale(1.18) !important;
  filter: drop-shadow(0 18px 20px rgba(0,0,0,.9)) drop-shadow(0 0 18px rgba(251,191,36,.8));
}
.dv-glow{
  position:absolute;left:50%;top:18%;width:290%;aspect-ratio:1;
  transform:translate(-50%,-50%);
  border-radius:50%;
  background:radial-gradient(circle,rgba(255,190,75,.62),rgba(255,125,30,.22) 42%,transparent 70%);
  opacity:0;
  animation:dv-gi .8s ease-out both var(--d),dv-pu 2.2s ease-in-out infinite calc(var(--d) + .8s);
}
@keyframes dv-gi{to{opacity:.95}}
@keyframes dv-pu{0%,100%{opacity:.72;transform:translate(-50%,-50%) scale(.95)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}}

.dv-ign,.dv-flk{transform-box:fill-box;transform-origin:50% 100%}
.dv-ign{transform:scale(0);animation:dv-ig .65s cubic-bezier(.2,1.35,.4,1) both var(--d)}
@keyframes dv-ig{to{transform:scale(1)}}
.dv-flk{animation:dv-fl 1.15s ease-in-out infinite calc(var(--d) + .65s)}
@keyframes dv-fl{
  0%,100%{transform:scale(1,1) skewX(0)}
  25%{transform:scale(.93,1.1) skewX(-4deg)}
  50%{transform:scale(1.06,.94) skewX(3deg)}
  75%{transform:scale(.96,1.07) skewX(-2deg)}
}

@media (prefers-reduced-motion:reduce){
  .dv-scene3d,.dv-stars,.dv-gold,.dv-glow,.dv-ign,.dv-flk,.dv-lamp,.dv-rays,.dv-bulb,.dv-chakra,.dv-chakra-rev,.dv-book3d{animation:none!important}
  .dv-ign{transform:none}.dv-glow{opacity:.85}.dv-ember,.dv-lantern{display:none}
}
`;

const EASE = [0.16, 1, 0.3, 1];

/* ═══════════ 3D Floating Magical Book SVG Component ═══════════ */
function FloatingBook3D({ side = "left" }) {
  const isLeft = side === "left";
  return (
    <div
      className={`dv-book3d ${isLeft ? "left" : "right"} pointer-events-none select-none`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 120 100" className="w-24 h-20 sm:w-32 sm:h-28 md:w-40 md:h-32 overflow-visible">
        {/* Magical Aura Halo under the floating book */}
        <ellipse cx="60" cy="68" rx="44" ry="14" fill="url(#dvBookAura)" />
        <ellipse
          cx="60"
          cy="68"
          rx="34"
          ry="10"
          fill="none"
          stroke="#fde68a"
          strokeWidth="0.8"
          strokeDasharray="4 3"
          opacity="0.7"
        />

        {/* Left Cover & Fluttering Pages */}
        <g className="dv-wing-l">
          <path d="M60 62 Q32 48 10 56 L16 32 Q38 24 60 40 Z" fill="#7c2d12" stroke="#f59e0b" strokeWidth="1.2" />
          <path d="M60 59 Q34 45 13 52 L19 30 Q40 22 60 38 Z" fill="#fef3c7" />
          <path d="M60 56 Q36 42 16 48 L22 27 Q42 20 60 36 Z" fill="#fffbeb" />
          {/* Golden Sanskrit-style Glowing Lines on Left Page */}
          <path d="M26 35 Q42 31 54 40 M24 41 Q40 37 54 46 M22 47 Q38 43 53 51" stroke="#d97706" strokeWidth="1.1" strokeLinecap="round" opacity=".75" fill="none" />
        </g>

        {/* Right Cover & Fluttering Pages */}
        <g className="dv-wing-r">
          <path d="M60 62 Q88 48 110 56 L104 32 Q82 24 60 40 Z" fill="#7c2d12" stroke="#f59e0b" strokeWidth="1.2" />
          <path d="M60 59 Q86 45 107 52 L101 30 Q80 22 60 38 Z" fill="#fef3c7" />
          <path d="M60 56 Q84 42 104 48 L98 27 Q78 20 60 36 Z" fill="#fffbeb" />
          {/* Glowing Lines on Right Page */}
          <path d="M94 35 Q78 31 66 40 M96 41 Q80 37 66 46 M98 47 Q82 43 67 51" stroke="#d97706" strokeWidth="1.1" strokeLinecap="round" opacity=".75" fill="none" />
        </g>

        {/* Book Spine Jewel & Rising Lotus Light */}
        <path d="M57 38 L63 38 L64 63 L56 63 Z" fill="#b45309" stroke="#fde68a" strokeWidth="0.9" />
        <circle cx="60" cy="30" r="9" fill="url(#dvBookAura)" />
        <path d="M60 16 C64 24 66 29 60 34 C54 29 56 24 60 16 Z" fill="url(#dvFlame)" />
        <circle cx="45" cy="20" r="1.6" fill="#fef08a" />
        <circle cx="75" cy="22" r="1.3" fill="#fef08a" />
        <circle cx="60" cy="10" r="1.8" fill="#ffffff" />
      </svg>
    </div>
  );
}

/* ═══════════ MAIN HERO SECTION COMPONENT ═══════════ */
export function HeroSection({ isDark = true, lang = "EN", onToggleLang }) {
  const t = dict[lang] || dict.EN;
  const wrapRef = useRef(null);
  const sceneRef = useRef(null);
  const canvasRef = useRef(null);
  const apiRef = useRef(null);
  const audioRef = useRef(null);
  const soundEnabledRef = useRef(false);

  const [soundOn, setSoundOn] = useState(false);
  const [blessingMsg, setBlessingMsg] = useState(null);

  useEffect(() => {
    audioRef.current = createFestiveAudio();
  }, []);

  useFireworks3D(wrapRef, canvasRef, apiRef, soundEnabledRef, audioRef);

  // Smooth 3D Mouse / Touch Tilt Parallax (Zero React Re-renders via CSS Variables)
  const handlePointerMove = useCallback((e) => {
    const el = wrapRef.current;
    const sc = sceneRef.current;
    if (!el || !sc) return;
    const r = el.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;  // -0.5 to +0.5
    const ny = (e.clientY - r.top) / r.height - 0.5; // -0.5 to +0.5
    sc.style.setProperty("--ry", `${(nx * 11).toFixed(2)}deg`);
    sc.style.setProperty("--rx", `${(-ny * 8).toFixed(2)}deg`);
  }, []);

  const handlePointerLeave = useCallback(() => {
    const sc = sceneRef.current;
    if (!sc) return;
    sc.style.setProperty("--ry", "0deg");
    sc.style.setProperty("--rx", "0deg");
  }, []);

  const onTap = (e) => {
    if (e.target.closest && e.target.closest("a,button,[data-interactive]")) return;
    const api = apiRef.current;
    if (!api || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    api.launch(e.clientX - r.left, e.clientY - r.top);
  };

  const handleDiyaClick = (e, idx) => {
    e.stopPropagation();
    const api = apiRef.current;
    if (api && wrapRef.current) {
      const r = wrapRef.current.getBoundingClientRect();
      const dr = e.currentTarget.getBoundingClientRect();
      api.blessFromDiya(dr.left + dr.width / 2 - r.left, dr.top + dr.height * 0.25 - r.top);
    }
    const blessingsEN = [
      "✨ Wisdom Light Awakened!",
      "🪔 Peace & Clarity Blessed!",
      "🌟 Inner Consciousness Ignited!",
    ];
    const blessingsHI = [
      "✨ ज्ञान का प्रकाश जागृत हुआ!",
      "🪔 सुख, शांति और प्रज्ञा का आशीर्वाद!",
      "🌟 अंतर्मन की चेतना प्रज्वलित हुई!",
    ];
    const list = lang === "HI" ? blessingsHI : blessingsEN;
    setBlessingMsg(list[idx % list.length]);
    setTimeout(() => setBlessingMsg(null), 2400);
  };

  const triggerFinale = (e) => {
    e.stopPropagation();
    if (apiRef.current) apiRef.current.launchFinale();
  };

  const toggleSound = (e) => {
    e.stopPropagation();
    const next = !soundOn;
    setSoundOn(next);
    soundEnabledRef.current = next;
    if (next && audioRef.current) {
      audioRef.current.playSparkleChime(587);
    }
  };

  const pageBg = isDark ? "#07070d" : "#f8fafc";

  return (
    <section
      ref={wrapRef}
      onPointerDown={onTap}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{ touchAction: "manipulation" }}
      className="dv-stage relative overflow-hidden flex flex-col items-center justify-center text-center px-4 pt-16 pb-28 md:pt-20 md:pb-32 min-h-[480px] md:min-h-[590px] select-none"
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* Shared Zero-Size SVG Gradients for Diyas, Sacred Mandala & Floating Books */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="dvBowl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f59e0b" />
            <stop offset=".45" stopColor="#c2410c" />
            <stop offset="1" stopColor="#431407" />
          </linearGradient>
          <linearGradient id="dvFlame" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ea580c" />
            <stop offset=".55" stopColor="#facc15" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
          <radialGradient id="dvBookAura" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#fde047" stopOpacity=".65" />
            <stop offset=".6" stopColor="#f59e0b" stopOpacity=".22" />
            <stop offset="1" stopColor="#f59e0b" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="dvRangoliGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#f59e0b" stopOpacity=".45" />
            <stop offset=".5" stopColor="#ec4899" stopOpacity=".18" />
            <stop offset="1" stopColor="#7c2d12" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* ═══════════ 3D SCENE MASTER CONTAINER (preserve-3d) ═══════════ */}
      <div
        ref={sceneRef}
        className="dv-scene3d absolute inset-0 pointer-events-none"
        aria-hidden="true"
      >
        {/* PLANE -3 (Z: -150px): Deep Cosmic Starfield */}
        <div className="dv-layer" style={{ transform: "translateZ(-150px) scale(1.18)" }}>
          <div className="dv-stars" />
          <div className="dv-stars b" />
        </div>

        {/* PLANE -2 (Z: -80px): 3D Procedural Library, Shelves, Moon & Royal Jharokha Arch */}
        <div
          className="dv-layer"
          style={{ transform: "translateZ(-80px) scale(1.1)" }}
          dangerouslySetInnerHTML={{ __html: LIBRARY_SVG }}
        />

        {/* PLANE -1 (Z: -30px): Rotating Sacred Sri-Chakra Mandala in the Arch + Warm Volumetric God-Rays */}
        <div className="dv-layer flex items-center justify-center" style={{ transform: "translateZ(-30px)" }}>
          <div className="dv-lamp l" />
          <div className="dv-lamp r" />
          <div className="dv-rays" />

          {/* Glowing Rotating Sacred Geometry Wheel behind the Hero Title */}
          <svg
            viewBox="0 0 260 260"
            className="w-[270px] h-[270px] sm:w-[340px] sm:h-[340px] md:w-[410px] md:h-[410px] opacity-30 -translate-y-6"
          >
            <g className="dv-chakra" style={{ transformOrigin: "130px 130px" }}>
              <circle cx="130" cy="130" r="118" fill="none" stroke="#fde047" strokeWidth="1" strokeDasharray="4 6" />
              <circle cx="130" cy="130" r="98" fill="none" stroke="#f59e0b" strokeWidth="1.2" />
              {Array.from({ length: 12 }).map((_, idx) => (
                <g key={idx} transform={`rotate(${idx * 30} 130 130)`}>
                  <path d="M130 14 Q144 42 130 68 Q116 42 130 14 Z" fill="none" stroke="#fde68a" strokeWidth="1.1" />
                  <circle cx="130" cy="22" r="2.2" fill="#fef08a" />
                </g>
              ))}
            </g>
            <g className="dv-chakra-rev" style={{ transformOrigin: "130px 130px" }}>
              <polygon points="130,36 211,177 49,177" fill="none" stroke="#fbbf24" strokeWidth="1.1" opacity=".75" />
              <polygon points="130,224 211,83 49,83" fill="none" stroke="#fbbf24" strokeWidth="1.1" opacity=".75" />
              <circle cx="130" cy="130" r="46" fill="none" stroke="#fef08a" strokeWidth="1" strokeDasharray="3 3" />
            </g>
          </svg>

          {/* Soft Depth Backdrop behind Typography for Crystal-Clear Readability */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 56% 44% at 50% 45%, rgba(8, 3, 20, 0.76), transparent 100%)",
            }}
          />
        </div>

        {/* PLANE +1 (Z: +55px): 3D Floating Magical Books (Popping out on Left & Right!) */}
        <div
          className="dv-layer flex items-center justify-between px-2 sm:px-8 md:px-16 lg:px-24"
          style={{ transform: "translateZ(55px)" }}
        >
          <div className="mt-12 sm:mt-6">
            <FloatingBook3D side="left" />
          </div>
          <div className="mt-12 sm:mt-6">
            <FloatingBook3D side="right" />
          </div>
        </div>

        {/* PLANE +2 (Z: +95px): 3D Floor Perspective Sacred Rangoli Mandala */}
        <div
          className="dv-floor-rangoli absolute left-1/2 bottom-[-115px] md:bottom-[-135px] w-[360px] h-[360px] md:w-[540px] md:h-[540px] pointer-events-none"
        >
          <svg viewBox="0 0 300 300" className="w-full h-full">
            <circle cx="150" cy="150" r="145" fill="url(#dvRangoliGlow)" />
            <g className="dv-chakra" style={{ transformOrigin: "150px 150px" }}>
              <circle cx="150" cy="150" r="128" fill="none" stroke="#fde047" strokeWidth="1.5" strokeDasharray="6 6" opacity=".65" />
              <circle cx="150" cy="150" r="96" fill="none" stroke="#fb923c" strokeWidth="2" opacity=".6" />
              {Array.from({ length: 16 }).map((_, k) => (
                <g key={k} transform={`rotate(${k * 22.5} 150 150)`}>
                  <path d="M150 22 C164 55 164 82 150 110 C136 82 136 55 150 22 Z" fill="#f59e0b" fillOpacity=".22" stroke="#fde047" strokeWidth="1.2" />
                  <circle cx="150" cy="36" r="3" fill="#fffbeb" opacity=".8" />
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* PLANE +3 (Z: +115px): Hanging Foreground Toran Garland & Floating Sky Lanterns */}
        <div
          className="absolute top-0 inset-x-0 h-14 md:h-20 pointer-events-none"
          style={{ transform: "translateZ(115px) scale(1.03)" }}
          dangerouslySetInnerHTML={{ __html: TORAN_SVG }}
        />

        {/* Multi-Depth 3D Embers & Akash Kandils (Some fly at Z: +185px right past the viewer!) */}
        <div className="dv-layer" style={{ transformStyle: "preserve-3d" }}>
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
                "--z": `${p.z}px`,
                filter: p.blur ? `blur(${p.blur}px)` : undefined,
              }}
            />
          ))}
          {LANTERNS.map((p, k) => (
            <span
              key={k}
              className={`dv-lantern ${p.m ? "hidden md:block" : ""}`}
              style={{
                left: p.l,
                animationDuration: p.t,
                animationDelay: p.d,
                "--dx": p.x,
                "--z": `${p.z}px`,
                transform: `scale(${p.sc})`,
              }}
            />
          ))}
        </div>
      </div>

      {/* ═══════════ 3D PERSPECTIVE FIREWORKS & ANAR CANVAS (Z-Index 6) ═══════════ */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[6]"
        aria-hidden="true"
      />

      {/* Top-Right Quick Interactive Controls (Sound Chime + Language Toggle) */}
      <div
        data-interactive="true"
        className="absolute top-3 right-3 md:top-5 md:right-6 z-20 flex items-center gap-2"
      >
        {onToggleLang && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLang();
            }}
            className="dv-sec-btn rounded-full px-3 py-1 text-xs font-bold tracking-wider uppercase"
            title="Switch Language (EN / HI)"
          >
            🌐 {lang === "EN" ? "हिंदी" : "EN"}
          </button>
        )}
        <button
          type="button"
          onClick={toggleSound}
          className="dv-sec-btn rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1.5"
          title="Toggle Festive Sound Effects"
        >
          <span>{soundOn ? "🔊" : "🔇"}</span>
          <span className="hidden sm:inline">{soundOn ? "Sound On" : "Sound"}</span>
        </button>
      </div>

      {/* ═══════════ FOREGROUND 3D HERO CONTENT (Pops forward in 3D space) ═══════════ */}
      <div
        className="relative z-10 flex flex-col items-center max-w-4xl mx-auto"
        style={{ transform: "translateZ(85px)" }}
      >
        {/* Festive 3D Glass Badge */}
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="dv-chip mb-3.5 inline-flex items-center gap-2.5 rounded-full px-4 py-1.5 text-xs sm:text-sm md:text-base font-semibold tracking-wide text-amber-200"
        >
          <span className="text-base md:text-lg animate-bounce">🪔</span>
          <span>{t.greet}</span>
          <span className="hidden sm:inline text-amber-400/60">•</span>
          <span className="hidden sm:inline text-xs text-amber-100/80 font-normal">{t.badgeSub}</span>
          <span className="text-base md:text-lg animate-bounce" style={{ animationDelay: "0.2s" }}>
            🪔
          </span>
        </motion.div>

        {/* 3D Extruded Liquid Gold Title */}
        <motion.h1
          key={t.title}
          initial={{ opacity: 0, y: 28, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.08, ease: EASE }}
          className="font-serif text-[1.95rem] leading-[1.15] sm:text-5xl md:text-6xl lg:text-[4rem] font-black mb-3.5 tracking-tight px-2"
        >
          <span className="dv-gold">{t.title}</span>
        </motion.h1>

        {/* Subtitle with High-Contrast Glow */}
        <motion.p
          key={t.sub}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.18, ease: EASE }}
          className="dv-sub max-w-2xl mx-auto text-sm sm:text-base md:text-lg px-3 leading-relaxed font-medium text-amber-50/95"
        >
          {t.sub}
        </motion.p>

        {/* Trust / Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.26, ease: EASE }}
          className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          {t.stats.map((st, idx) => (
            <span
              key={idx}
              className="text-[11px] sm:text-xs font-medium text-amber-200/90 bg-amber-950/45 border border-amber-400/25 rounded-full px-3 py-0.5 backdrop-blur-sm"
            >
              ✦ {st}
            </span>
          ))}
        </motion.div>

        {/* 3D Action Buttons (Explore Books + Launch Grand Finale) */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.34, ease: EASE }}
          className="mt-6 flex flex-wrap items-center justify-center gap-3.5"
        >
          <SafeLink
            href="/explore"
            className="dv-cta inline-flex items-center gap-2.5 rounded-full px-7 py-3 text-sm sm:text-base font-extrabold tracking-wide"
          >
            <span className="text-lg">📚</span>
            <span>{t.cta}</span>
          </SafeLink>

          <button
            type="button"
            onClick={triggerFinale}
            className="dv-sec-btn inline-flex items-center gap-2 rounded-full px-5 py-3 text-xs sm:text-sm font-bold tracking-wide cursor-pointer"
          >
            <span>{t.finale}</span>
          </button>
        </motion.div>

        {/* Interactive Hint or Blessing Toast */}
        <div className="h-7 mt-3 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {blessingMsg ? (
              <motion.span
                key={blessingMsg}
                initial={{ opacity: 0, y: 8, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-xs sm:text-sm font-bold text-amber-300 bg-amber-950/70 border border-amber-400/40 rounded-full px-4 py-1 shadow-lg"
              >
                {blessingMsg}
              </motion.span>
            ) : (
              <motion.span
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.85 }}
                exit={{ opacity: 0 }}
                className="text-[11px] sm:text-xs text-amber-100/75 tracking-wide"
              >
                {t.hint}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Smooth Bottom Gradient Blend into Page Background */}
      <div
        className="absolute bottom-0 inset-x-0 h-14 pointer-events-none z-[8]"
        style={{ background: `linear-gradient(to bottom, transparent, ${pageBg})` }}
      />

      {/* ═══════════ FOREGROUND 3D INTERACTIVE DIYA ALTAR ARC (Z-Index 15) ═══════════ */}
      <div
        data-interactive="true"
        className="absolute bottom-2 md:bottom-4 inset-x-0 px-3 md:px-12 flex justify-around items-end z-[15]"
      >
        {DIYAS.map((d) => (
          <div
            key={d.i}
            onClick={(e) => handleDiyaClick(e, d.i)}
            title="Click Diya for Golden Blessing Sparkles ✨"
            className={`dv-diya w-10 sm:w-12 md:w-14 lg:w-16 ${d.mobileHidden ? "hidden md:block" : ""}`}
            style={{
              "--d": `${d.delay}s`,
              transform: `translateY(${-d.yOffset}px) scale(${d.scale})`,
            }}
          >
            <span className="dv-glow pointer-events-none" />
            <svg viewBox="0 0 64 60" className="relative block w-full h-auto overflow-visible">
              {/* Floor Golden Reflection under each Diya */}
              <ellipse cx="32" cy="55" rx="22" ry="4" fill="#f59e0b" opacity=".35" />

              {/* Ornate 3D Terracotta & Brass Diya Bowl */}
              <path
                d="M4 26 C8 48 22 54 32 54 S56 48 60 26 C48 32 16 32 4 26 Z"
                fill="url(#dvBowl)"
                stroke="#fde68a"
                strokeWidth="0.7"
              />
              {/* Carved Temple Motifs on Bowl */}
              <path
                d="M11 35 Q32 46 53 35"
                fill="none"
                stroke="#fde047"
                strokeWidth="1.4"
                opacity=".75"
                strokeLinecap="round"
              />
              <circle cx="20" cy="42" r="1.5" fill="#fef08a" opacity=".8" />
              <circle cx="32" cy="45" r="1.8" fill="#fef08a" opacity=".9" />
              <circle cx="44" cy="42" r="1.5" fill="#fef08a" opacity=".8" />

              {/* Glowing Oil Pool & Rim */}
              <ellipse cx="32" cy="26" rx="27" ry="5" fill="#fbbf24" stroke="#fef08a" strokeWidth="0.8" />
              <ellipse cx="32" cy="26.5" rx="22" ry="3.2" fill="#d97706" opacity=".65" />

              {/* Cotton Wick */}
              <rect x="30.8" y="18" width="2.4" height="9" rx="1.2" fill="#451a03" />

              {/* Multi-layered Flickering 3D Flame */}
              <g className="dv-ign">
                <g className="dv-flk">
                  <path d="M32 0 C41 11 43 18 32 24 C21 18 23 11 32 0 Z" fill="url(#dvFlame)" />
                  <path d="M32 8 C36 14 37 18 32 22 C27 18 28 14 32 8 Z" fill="#fffbeb" opacity=".95" />
                  <circle cx="32" cy="18" r="2.2" fill="#38bdf8" opacity=".55" />
                </g>
              </g>
            </svg>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════ DEMO PREVIEW WRAPPER (Shows Hero + Language/Theme Controls) ═══════════ */
export default function App() {
  const [lang, setLang] = useState("HI");
  const [isDark, setIsDark] = useState(true);

  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{ backgroundColor: isDark ? "#07070d" : "#f8fafc" }}
    >
      {/* Upgraded 3D Hero Section */}
      <HeroSection
        isDark={isDark}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === "EN" ? "HI" : "EN"))}
      />

      {/* Sample Below-the-Fold Preview Bar so you can see the seamless bottom fade */}
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-wrap items-center justify-between gap-4">
        <div className={isDark ? "text-amber-100/80 text-sm" : "text-slate-700 text-sm"}>
          <span className="font-bold text-amber-500">✦ 3D Upgrade Ready:</span> Move your mouse (or touch) anywhere on the Hero for 3D camera parallax, click any Diya for a golden blessing burst, or click the sky for 3D rockets!
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLang((l) => (l === "EN" ? "HI" : "EN"))}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition"
          >
            Language: {lang === "HI" ? "हिंदी (HI)" : "English (EN)"}
          </button>
          <button
            onClick={() => setIsDark((d) => !d)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30 transition"
          >
            Page Bg: {isDark ? "Dark Mode" : "Light Mode"}
          </button>
        </div>
      </div>
    </div>
  );
}
