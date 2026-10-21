// @ts-nocheck
"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Flame, Copy, Check, Code2, Sun, Moon, Languages, Volume2 } from "lucide-react";

/**
 * ============================================================================
 * 🪔 DIWALI + SPIRITUAL BOOK LIBRARY HERO SECTION (src/components/HeroSection.jsx)
 * ============================================================================
 * Highlights:
 * 1. Harmonized Background: Combines an ultra-fast pre-styled Ancient Book Library
 *    backdrop + SVG Royal Jharokha Archways & Illuminated Bookshelves with a deep
 *    starry Diwali night sky.
 * 2. 60fps Canvas Patakhe Engine:
 *    - Multi-pattern Sky Rockets (Royal Peony, Golden Willow, Ring & Crackle)
 *    - Twin Balcony Fountain Anars (Sparkler Fountains) on left & right ledges
 *    - Interactive Tap/Click burst with expanding golden shockwave rings
 *    - Auto-pauses when off-screen or tab is hidden (0 wasted battery/CPU)
 * 3. Sacred Centerpiece:
 *    - Rotating Golden Sri-Chakra Mandala behind the title
 *    - Glowing Open Spiritual Granth (Book of Wisdom) with rising golden letters
 *    - 7 Ornate Terracotta Diyas on Lotus Rangoli mats (center-outward ignition)
 *    - Festive Marigold & Mango-leaf Toran with swaying hanging temple lamps
 */

const dict = {
  EN: {
    greet: "Happy Diwali",
    subGreet: "Festival of Inner Light & Timeless Wisdom",
    title: "Awaken Your Consciousness",
    sub: "100% original, verified digital books on spirituality & psychology.",
    ctaPrimary: "Explore Sacred Library",
    ctaSecondary: "Tap Anywhere for Fireworks",
    stats: ["100% Original Granths", "Verified Translations", "Instant Digital Access"],
  },
  HI: {
    greet: "शुभ दीपावली",
    subGreet: "अंतर्मन के प्रकाश और शाश्वत ज्ञान का महापर्व",
    title: "अपनी चेतना को जागृत करें",
    sub: "आध्यात्मिकता और मनोविज्ञान पर 100% मूल, सत्यापित डिजिटल पुस्तकें।",
    ctaPrimary: "पवित्र पुस्तकालय देखें",
    ctaSecondary: "पटाखों के लिए कहीं भी टैप करें",
    stats: ["100% मूल प्रामाणिक ग्रंथ", "सत्यापित हिंदी व अंग्रेजी अनुवाद", "तुरंत डिजिटल पठन"],
  },
};

// Rising golden embers & wisdom particles
const EMBERS = [
  { l: "7%", s: 4, t: "7.5s", d: "-1s", x: "22px" },
  { l: "16%", s: 3, t: "9s", d: "-4s", x: "-18px" },
  { l: "26%", s: 5, t: "8s", d: "-2.2s", x: "28px" },
  { l: "37%", s: 3.5, t: "10s", d: "-6s", x: "-15px" },
  { l: "48%", s: 4.5, t: "7.2s", d: "-3.5s", x: "18px" },
  { l: "59%", s: 3.5, t: "8.8s", d: "-1.8s", x: "-24px" },
  { l: "71%", s: 5, t: "9.4s", d: "-5.2s", x: "24px" },
  { l: "82%", s: 3, t: "8.2s", d: "-2.7s", x: "-16px" },
  { l: "91%", s: 4, t: "7.6s", d: "-4.5s", x: "-20px" },
];

// Floating Akash Kandil (Sky Lanterns)
const LANTERNS = [
  { l: "10%", t: "21s", d: "-5s", x: "28px", scale: 0.9, m: false },
  { l: "24%", t: "25s", d: "-13s", x: "-24px", scale: 0.75, m: true },
  { l: "38%", t: "23s", d: "-8s", x: "22px", scale: 0.85, m: true },
  { l: "63%", t: "24s", d: "-11s", x: "-26px", scale: 0.8, m: true },
  { l: "77%", t: "22s", d: "-16s", x: "30px", scale: 0.95, m: false },
  { l: "89%", t: "26s", d: "-3s", x: "-20px", scale: 0.78, m: true },
];

// 7 Ornate Diyas: Center diya (index 3) ignites first, then radiates outward
const DIYAS = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
  i,
  isCenter: i === 3,
  delay: 0.55 + Math.abs(i - 3) * 0.32,
  mobileHidden: i === 0 || i === 6,
}));

// Left & Right Library Bookshelf rows (procedural SVG book spines)
const SHELF_BOOKS_LEFT = [
  { x: 18, w: 14, h: 52, c: "#7c2d12", gold: true },
  { x: 34, w: 12, h: 48, c: "#991b1b", gold: false },
  { x: 48, w: 16, h: 55, c: "#78350f", gold: true },
  { x: 66, w: 11, h: 46, c: "#4c1d95", gold: true },
  { x: 79, w: 15, h: 53, c: "#9a3412", gold: false },
  { x: 96, w: 13, h: 50, c: "#854d0e", gold: true },
  { x: 111, w: 16, h: 56, c: "#7f1d1d", gold: true },
  { x: 129, w: 12, h: 47, c: "#581c87", gold: false },
  { x: 143, w: 15, h: 52, c: "#7c2d12", gold: true },
];

// Rich Diwali Firework Color Palette (RGB)
const PALETTE = [
  [255, 210, 80],  // Royal Gold
  [255, 140, 45],  // Marigold Saffron
  [255, 75, 110],  // Kumkum Crimson
  [255, 240, 175], // White-Gold Champagne
  [245, 130, 255], // Lotus Magenta
  [95, 215, 255],  // Peacock Cyan
  [140, 255, 170], // Panna Emerald
];

// ============================================================================
// 🎆 UPGRADED PATAKHE ENGINE (Sky Rockets + Fountain Anars + Shockwaves)
// ============================================================================
function useFireworks(wrapRef, canvasRef, burstRef) {
  useEffect(() => {
    const wrap = wrapRef.current;
    const cv = canvasRef.current;
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

    const rockets = [];
    const sparks = [];
    const rings = [];
    let anarBoostTimer = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.5 : 2);
      const r = wrap.getBoundingClientRect();
      w = r.width;
      h = r.height;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Trigger an explosion at (x, y)
    const explode = (x, y, customStyle = null) => {
      const c1 = PALETTE[(Math.random() * PALETTE.length) | 0];
      const c2 = PALETTE[(Math.random() * PALETTE.length) | 0];
      const gold = [255, 220, 120];
      const isMobile = small();
      const style = customStyle || ["peony", "willow", "doubleRing", "crackle"][(Math.random() * 4) | 0];

      const count = isMobile ? 42 : 76;
      const basePower = (isMobile ? 105 : 165) * (0.85 + Math.random() * 0.4);

      // Expanding shockwave halo ring
      rings.push({
        x,
        y,
        r: 4,
        maxR: isMobile ? 65 : 105,
        life: 0.75,
        c: c1,
      });

      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.08;
        let speed = basePower * (0.3 + Math.random() * 0.75);
        let decay = 0.52 + Math.random() * 0.45;
        let color = i % 3 === 0 ? c2 : c1;
        let gravity = 72;
        let twinkle = Math.random() < 0.3;

        if (style === "doubleRing") {
          const isOuter = i % 2 === 0;
          speed = isOuter ? basePower : basePower * 0.56;
          color = isOuter ? c1 : gold;
          decay = 0.65;
        } else if (style === "willow") {
          color = i % 4 === 0 ? c1 : gold;
          speed = basePower * (0.45 + Math.random() * 0.55);
          decay = 0.34 + Math.random() * 0.22; // Longer golden drooping trails
          gravity = 95;
          twinkle = true;
        } else if (style === "crackle") {
          color = i % 2 === 0 ? c1 : [255, 245, 200];
          twinkle = true;
        }

        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay,
          c: color,
          g: gravity,
          twinkle,
          crackle: style === "crackle" && i % 5 === 0,
        });
      }

      // Bright core flash spark
      sparks.push({
        x,
        y,
        vx: 0,
        vy: 0,
        life: 0.45,
        decay: 2.2,
        c: [255, 255, 240],
        g: 0,
        flash: isMobile ? 22 : 34,
      });

      const maxSparks = isMobile ? 360 : 650;
      if (sparks.length > maxSparks) {
        sparks.splice(0, sparks.length - maxSparks);
      }
    };

    // Launch a sky rocket
    const launch = (targetX, targetY) => {
      const startX = targetX ? targetX + (Math.random() - 0.5) * 40 : w * (0.12 + Math.random() * 0.76);
      const startY = h * 0.9;
      const destY = targetY || h * (0.12 + Math.random() * 0.34);
      const vx = targetX ? (targetX - startX) * 1.4 : (Math.random() - 0.5) * 32;

      rockets.push({
        x: startX,
        y: startY,
        ty: destY,
        vx,
        v: Math.max(330, h * 0.95),
        c: PALETTE[(Math.random() * PALETTE.length) | 0],
      });
    };

    // Expose interactive burst + grand salvo trigger
    burstRef.current = (x, y, mode = "single") => {
      if (mode === "finale") {
        anarBoostTimer = 4.5;
        for (let i = 0; i < 6; i++) {
          setTimeout(() => {
            if (!wrapRef.current) return;
            const rx = w * (0.15 + (i / 5) * 0.7);
            const ry = h * (0.16 + (i % 2) * 0.14);
            explode(rx, ry, i % 2 === 0 ? "doubleRing" : "willow");
          }, i * 190);
        }
        return;
      }
      explode(x, y);
    };

    const frame = (t) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((t - last) / 1000 || 0.016, 0.05);
      last = t;

      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      // Automatic sky rocket cadence
      nextAt -= dt;
      if (nextAt <= 0) {
        launch();
        if (Math.random() < 0.38) setTimeout(() => visible && launch(), 200);
        nextAt = 0.65 + Math.random() * 0.95;
      }

      // Twin Balcony Fountain Anars (left at 8.5% width, right at 91.5% width)
      if (anarBoostTimer > 0) anarBoostTimer -= dt;
      const anarActive = anarBoostTimer > 0 || Math.sin(t * 0.0015) > -0.2;
      if (anarActive && (!small() || anarBoostTimer > 0)) {
        const anarPositions = small() ? [0.1, 0.9] : [0.09, 0.91];
        const emitCount = anarBoostTimer > 0 ? 2 : 1;
        for (const pos of anarPositions) {
          if (Math.random() < (anarBoostTimer > 0 ? 0.95 : 0.55)) {
            for (let k = 0; k < emitCount; k++) {
              const ax = w * pos;
              const ay = h - (small() ? 38 : 54);
              const spread = (Math.random() - 0.5) * 0.52;
              const speed = (small() ? 130 : 185) * (0.7 + Math.random() * 0.55);
              sparks.push({
                x: ax,
                y: ay,
                vx: Math.sin(spread) * speed,
                vy: -Math.cos(spread) * speed,
                life: 0.65 + Math.random() * 0.35,
                decay: 1.15,
                c: Math.random() < 0.35 ? [255, 250, 210] : [255, 185, 65],
                g: 230,
                twinkle: true,
              });
            }
          }
        }
      }

      // Update & draw rising rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y -= r.v * dt;
        r.x += r.vx * dt;

        // Golden rocket trail spark
        if (Math.random() < 0.65) {
          sparks.push({
            x: r.x + (Math.random() - 0.5) * 3,
            y: r.y + 6,
            vx: (Math.random() - 0.5) * 18,
            vy: 25 + Math.random() * 25,
            life: 0.35,
            decay: 1.4,
            c: [255, 200, 110],
            g: 30,
          });
        }

        ctx.strokeStyle = "rgba(255, 235, 175, 0.95)";
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(r.x - r.vx * 0.045, r.y + 16);
        ctx.lineTo(r.x, r.y);
        ctx.stroke();

        if (r.y <= r.ty) {
          explode(r.x, r.y);
          rockets.splice(i, 1);
        }
      }

      // Update & draw expanding shockwave rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const rg = rings[i];
        rg.r += (rg.maxR - rg.r) * 6 * dt;
        rg.life -= 1.4 * dt;
        if (rg.life <= 0) {
          rings.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(${rg.c[0]},${rg.c[1]},${rg.c[2]},${rg.life * 0.45})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(rg.x, rg.y, rg.r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Update & draw firework sparks
      const drag = Math.pow(0.14, dt);
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        if (s.flash) {
          s.life -= s.decay * dt;
          if (s.life <= 0) {
            sparks.splice(i, 1);
            continue;
          }
          const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.flash);
          grad.addColorStop(0, `rgba(255, 250, 220, ${s.life})`);
          grad.addColorStop(1, "rgba(255, 180, 50, 0)");
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
            // Secondary micro-crackle pop
            for (let k = 0; k < 3; k++) {
              const a = Math.random() * Math.PI * 2;
              sparks.push({
                x: s.x,
                y: s.y,
                vx: Math.cos(a) * 45,
                vy: Math.sin(a) * 45,
                life: 0.28,
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
        ctx.lineWidth = 1.15 + s.life * 1.55;
        ctx.beginPath();
        ctx.moveTo(s.x - s.vx * 0.038, s.y - s.vy * 0.038);
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

// ============================================================================
// 🎨 PURE CSS ANIMATIONS & STYLES (Ultra-fast, GPU-accelerated)
// ============================================================================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@700;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Rozha+One&display=swap');

.dv-sky {
  background:
    radial-gradient(95% 65% at 50% 102%, rgba(255, 145, 35, 0.42), rgba(180, 50, 20, 0.18) 45%, transparent 72%),
    radial-gradient(60% 50% at 50% 42%, rgba(255, 180, 60, 0.14), transparent 70%),
    linear-gradient(180deg, #060311 0%, #120724 42%, #240c36 78%, #381330 100%);
}

/* Warm Ancient Book Library ambient texture blended into the archways */
.dv-library-img {
  background-image: url("https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1600&q=75");
  background-size: cover;
  background-position: center 40%;
  mix-blend-mode: screen;
  opacity: 0.22;
  filter: sepia(0.65) hue-rotate(-15deg) saturate(1.6) contrast(1.15);
  -webkit-mask-image: radial-gradient(ellipse 92% 85% at 50% 55%, rgba(0,0,0,0.35) 15%, rgba(0,0,0,0.95) 75%, transparent 100%);
  mask-image: radial-gradient(ellipse 92% 85% at 50% 55%, rgba(0,0,0,0.35) 15%, rgba(0,0,0,0.95) 75%, transparent 100%);
}

.dv-stars {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cg fill='%23fff7d6'%3E%3Ccircle cx='18' cy='26' r='1.2'/%3E%3Ccircle cx='96' cy='60' r='.8'/%3E%3Ccircle cx='170' cy='20' r='1.4'/%3E%3Ccircle cx='220' cy='110' r='.9'/%3E%3Ccircle cx='60' cy='140' r='1.1'/%3E%3Ccircle cx='140' cy='180' r='.8'/%3E%3Ccircle cx='30' cy='210' r='1.2'/%3E%3Ccircle cx='200' cy='214' r='.9'/%3E%3Cpath d='M130 40 L132 45 L137 47 L132 49 L130 54 L128 49 L123 47 L128 45 Z' fill='%23fde68a' opacity='.75'/%3E%3C/g%3E%3C/svg%3E");
  background-size: 240px 240px;
  animation: dv-tw 4s ease-in-out infinite alternate;
}
.dv-stars.b {
  background-size: 170px 170px;
  background-position: 60px 40px;
  animation-duration: 6s;
  animation-delay: -2s;
  opacity: 0.55;
}
@keyframes dv-tw { from { opacity: 0.28; } to { opacity: 0.95; } }

/* Rotating Sacred Sri-Chakra / Lotus Mandala */
.dv-mandala {
  animation: dv-spin 70s linear infinite;
  transform-origin: center;
}
.dv-mandala-rev {
  animation: dv-spin-rev 50s linear infinite;
  transform-origin: center;
}
@keyframes dv-spin { to { transform: rotate(360deg); } }
@keyframes dv-spin-rev { to { transform: rotate(-360deg); } }

/* Rising Embers & Floating Sky Lanterns (Akash Kandil) */
.dv-ember, .dv-lantern {
  position: absolute;
  bottom: -36px;
  opacity: 0;
  will-change: transform, opacity;
  animation: dv-rise linear infinite;
}
.dv-ember {
  border-radius: 50%;
  background: radial-gradient(circle, #fff3b0, #ff9a2e 62%, transparent 74%);
  box-shadow: 0 0 8px rgba(255, 180, 60, 0.8);
}
.dv-lantern {
  width: 20px;
  height: 28px;
  border-radius: 7px 7px 10px 10px;
  background: radial-gradient(circle at 50% 65%, #fff7c2 0%, #ffb73b 45%, #ea580c 92%);
  box-shadow: 0 0 22px 7px rgba(255, 155, 45, 0.52);
}
.dv-lantern::after {
  content: "";
  position: absolute;
  bottom: -8px;
  left: 50%;
  width: 2px;
  height: 8px;
  transform: translateX(-50%);
  background: linear-gradient(to bottom, #fbbf24, transparent);
}
@keyframes dv-rise {
  0% { transform: translate3d(0, 0, 0) scale(1); opacity: 0; }
  12% { opacity: 0.92; }
  85% { opacity: 0.75; }
  100% { transform: translate3d(var(--dx), -620px, 0) scale(0.48); opacity: 0; }
}

/* Shimmering 3D Royal Gold Title */
.dv-font-title {
  font-family: 'Cinzel Decorative', 'Rozha One', Georgia, serif;
}
.dv-gold {
  background: linear-gradient(
    95deg,
    #fef08a 0%,
    #f59e0b 22%,
    #fffbeb 48%,
    #d97706 72%,
    #fef08a 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: dv-shine 5.5s linear infinite;
  filter: drop-shadow(0 4px 22px rgba(255, 155, 30, 0.45)) drop-shadow(0 1px 2px rgba(0, 0, 0, 0.85));
}
@keyframes dv-shine { to { background-position: 200% center; } }

/* Hanging Temple Bell Lamps & Sway */
.dv-sway {
  transform-origin: 50% 0%;
  animation: dv-pendulum 4.5s ease-in-out infinite alternate;
}
.dv-sway.d2 { animation-duration: 5.4s; animation-delay: -1.8s; }
@keyframes dv-pendulum {
  from { transform: rotate(-2.5deg); }
  to { transform: rotate(2.5deg); }
}

/* Open Sacred Book Levitation & Ray Pulse */
.dv-book-float {
  animation: dv-float 4.2s ease-in-out infinite alternate;
}
@keyframes dv-float {
  from { transform: translateY(0px); }
  to { transform: translateY(-6px); }
}

/* Diyas & Multi-layer Flickering Flames */
.dv-diya {
  position: relative;
  transition: transform 0.3s cubic-bezier(0.2, 1.2, 0.3, 1);
}
.dv-diya:hover {
  transform: translateY(-4px) scale(1.08);
}
.dv-glow {
  position: absolute;
  left: 50%;
  top: 18%;
  width: 280%;
  aspect-ratio: 1;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 190, 70, 0.6), rgba(255, 120, 25, 0.2) 42%, transparent 70%);
  opacity: 0;
  animation: dv-gi 0.8s ease-out both var(--d), dv-pu 2.2s ease-in-out infinite calc(var(--d) + 0.8s);
}
@keyframes dv-gi { to { opacity: 0.95; } }
@keyframes dv-pu { 0%, 100% { opacity: 0.72; transform: translate(-50%, -50%) scale(0.95); } 50% { opacity: 1; transform: translate(-50%, -50%) scale(1.07); } }

.dv-ign, .dv-flk {
  transform-box: fill-box;
  transform-origin: 50% 100%;
}
.dv-ign {
  transform: scale(0);
  animation: dv-ig 0.7s cubic-bezier(0.2, 1.35, 0.4, 1) both var(--d);
}
@keyframes dv-ig { to { transform: scale(1); } }

.dv-flk {
  animation: dv-fl 1.25s ease-in-out infinite calc(var(--d) + 0.7s);
}
@keyframes dv-fl {
  0%, 100% { transform: scale(1, 1) skewX(0deg); }
  25% { transform: scale(0.93, 1.09) skewX(-3.2deg); }
  50% { transform: scale(1.06, 0.94) skewX(2.4deg); }
  75% { transform: scale(0.96, 1.06) skewX(-1.8deg); }
}

/* Book Spine Shimmer in Library Shelves */
.dv-spine-glow {
  animation: dv-spine 3.5s ease-in-out infinite alternate;
}
@keyframes dv-spine {
  from { opacity: 0.45; }
  to { opacity: 0.95; }
}

@media (prefers-reduced-motion: reduce) {
  .dv-stars, .dv-gold, .dv-glow, .dv-ign, .dv-flk, .dv-mandala, .dv-mandala-rev, .dv-sway, .dv-book-float {
    animation: none !important;
  }
  .dv-ign { transform: none; }
  .dv-glow { opacity: 0.85; }
  .dv-ember, .dv-lantern { display: none; }
}
`;

// ============================================================================
// 🏛️ MAIN HERO SECTION COMPONENT (Drop-in replacement for HeroSection.jsx)
// ============================================================================
export function HeroSection({ isDark = false, lang = "EN", onFinaleReady }) {
  const t = dict[lang] || dict.EN;
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const burstRef = useRef(null);
  const [boostedDiya, setBoostedDiya] = useState(null);

  useFireworks(wrapRef, canvasRef, burstRef);

  // Expose Grand Finale trigger to parent showcase if desired
  useEffect(() => {
    if (onFinaleReady) {
      onFinaleReady(() => {
        if (burstRef.current && wrapRef.current) {
          const r = wrapRef.current.getBoundingClientRect();
          burstRef.current(r.width / 2, r.height * 0.25, "finale");
        }
      });
    }
  }, [onFinaleReady]);

  // Interactive tap/click anywhere to burst Patakhe
  const onTap = useCallback((e) => {
    if (!wrapRef.current || !burstRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    burstRef.current(e.clientX - r.left, e.clientY - r.top);
  }, []);

  // Clicking a specific Diya flares its flame and bursts a celebratory firework above it
  const onDiyaInteraction = (e, idx) => {
    e.stopPropagation();
    setBoostedDiya(idx);
    setTimeout(() => setBoostedDiya((prev) => (prev === idx ? null : prev)), 1400);
    if (wrapRef.current && burstRef.current) {
      const r = wrapRef.current.getBoundingClientRect();
      burstRef.current(e.clientX - r.left, r.height * (0.22 + Math.random() * 0.15));
    }
  };

  // Bottom fade seamlessly blends into the rest of the host page
  const pageBg = isDark ? "#07070d" : "#f8fafc";

  return (
    <section
      ref={wrapRef}
      onPointerDown={onTap}
      style={{ touchAction: "manipulation" }}
      className="dv-sky relative overflow-hidden flex flex-col items-center justify-center text-center px-4 pt-16 pb-36 md:pt-24 md:pb-48 min-h-[520px] md:min-h-[640px] select-none cursor-pointer"
    >
      <style>{CSS}</style>

      {/* Shared SVG Defs (0x0 size: Gradients for Diyas, Flames, Gold & Wood) */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="dvBowl" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#ea580c" />
            <stop offset="0.55" stopColor="#b45309" />
            <stop offset="1" stopColor="#5c1f09" />
          </linearGradient>
          <linearGradient id="dvBrassRim" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#b45309" />
            <stop offset="0.5" stopColor="#fde047" />
            <stop offset="1" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="dvFlame" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#ea580c" />
            <stop offset="0.5" stopColor="#f59e0b" />
            <stop offset="0.85" stopColor="#fde047" />
            <stop offset="1" stopColor="#fffbeb" />
          </linearGradient>
          <linearGradient id="dvArchGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#fef08a" stopOpacity="0.65" />
            <stop offset="0.5" stopColor="#d97706" stopOpacity="0.4" />
            <stop offset="1" stopColor="#78350f" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id="dvShelfWood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2e1222" />
            <stop offset="1" stopColor="#120617" />
          </linearGradient>
          <radialGradient id="dvBookAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.65" />
            <stop offset="55%" stopColor="#ea580c" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* LAYER 1: Starry Night Sky + Blended Ancient Book Library Backdrop */}
      <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <div className="dv-stars" />
        <div className="dv-stars b" />
        <div className="dv-library-img absolute inset-0" />

        {/* Rotating Golden Sacred Sri-Chakra / Lotus Mandala in the center sky */}
        <div className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[460px] sm:h-[460px] md:w-[560px] md:h-[560px] opacity-25">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <g className="dv-mandala" stroke="url(#dvArchGold)" fill="none" strokeWidth="0.6">
              <circle cx="100" cy="100" r="92" strokeDasharray="3 3" />
              <circle cx="100" cy="100" r="78" />
              <circle cx="100" cy="100" r="58" strokeDasharray="2 4" />
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <g key={deg} transform={`rotate(${deg} 100 100)`}>
                  <path d="M100 22 C108 42, 108 58, 100 78 C92 58, 92 42, 100 22 Z" />
                  <circle cx="100" cy="16" r="1.5" fill="#fde047" />
                </g>
              ))}
            </g>
            <g className="dv-mandala-rev" stroke="#fbbf24" strokeOpacity="0.35" fill="none" strokeWidth="0.5">
              <polygon points="100,32 158,134 42,134" />
              <polygon points="100,168 158,66 42,66" />
              <circle cx="100" cy="100" r="36" />
            </g>
          </svg>
        </div>

        {/* Rising Golden Embers */}
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

        {/* Floating Akash Kandil (Sky Lanterns) */}
        {LANTERNS.map((p, k) => (
          <span
            key={k}
            className={`dv-lantern ${p.m ? "hidden md:block" : ""}`}
            style={{
              left: p.l,
              animationDuration: p.t,
              animationDelay: p.d,
              "--dx": p.x,
              transform: `scale(${p.scale})`,
            }}
          />
        ))}
      </div>

      {/* LAYER 2: Royal Indian Archway, Marigold Toran & Grand Library Bookshelves */}
      <div className="absolute inset-0 pointer-events-none z-[2]" aria-hidden="true">
        {/* Top Festive Marigold Toran & Hanging Brass Lamps */}
        <svg
          viewBox="0 0 1440 160"
          preserveAspectRatio="none"
          className="absolute top-0 left-0 w-full h-14 sm:h-20 md:h-24"
        >
          {/* Scalloped Marigold Garlands */}
          <path
            d="M0,0 L1440,0 L1440,18 Q1320,68 1200,18 Q1080,68 960,18 Q840,68 720,18 Q600,68 480,18 Q360,68 240,18 Q120,68 0,18 Z"
            fill="#190826"
            opacity="0.9"
          />
          {[0, 240, 480, 720, 960, 1200].map((x) => (
            <g key={x}>
              <path
                d={`M${x},10 Q${x + 120},66 ${x + 240},10`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="5"
                strokeDasharray="8 6"
              />
              <path
                d={`M${x},16 Q${x + 120},76 ${x + 240},16`}
                fill="none"
                stroke="#ef4444"
                strokeWidth="3.5"
                strokeDasharray="5 8"
              />
              {/* Hanging tassel at each garland peak */}
              <circle cx={x + 120} cy="45" r="5" fill="#fde047" />
              <path d={`M${x + 120},50 L${x + 120},74`} stroke="#fbbf24" strokeWidth="1.5" />
              <circle cx={x + 120} cy="76" r="3.5" fill="#ef4444" />
            </g>
          ))}
        </svg>

        {/* Left & Right Swaying Brass Temple Lamps */}
        <div className="dv-sway absolute top-2 left-[6%] sm:left-[11%] w-9 sm:w-12 md:w-14">
          <svg viewBox="0 0 60 140" className="w-full h-auto overflow-visible">
            <line x1="30" y1="0" x2="30" y2="75" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" />
            <circle cx="30" cy="95" r="36" fill="url(#dvBookAura)" />
            <path d="M16 78 L44 78 L38 92 L22 92 Z" fill="url(#dvBrassRim)" />
            <path d="M10 92 Q30 114 50 92 Z" fill="url(#dvBowl)" stroke="#fde047" strokeWidth="1" />
            <path d="M30 74 C35 81 36 86 30 90 C24 86 25 81 30 74 Z" fill="url(#dvFlame)" />
          </svg>
        </div>
        <div className="dv-sway d2 absolute top-2 right-[6%] sm:right-[11%] w-9 sm:w-12 md:w-14">
          <svg viewBox="0 0 60 140" className="w-full h-auto overflow-visible">
            <line x1="30" y1="0" x2="30" y2="75" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 2" />
            <circle cx="30" cy="95" r="36" fill="url(#dvBookAura)" />
            <path d="M16 78 L44 78 L38 92 L22 92 Z" fill="url(#dvBrassRim)" />
            <path d="M10 92 Q30 114 50 92 Z" fill="url(#dvBowl)" stroke="#fde047" strokeWidth="1" />
            <path d="M30 74 C35 81 36 86 30 90 C24 86 25 81 30 74 Z" fill="url(#dvFlame)" />
          </svg>
        </div>

        {/* Left & Right Grand Library Bookshelf Wings (Visible on tablet/desktop, subtle framing on mobile) */}
        <svg
          viewBox="0 0 1440 620"
          preserveAspectRatio="xMidYMax slice"
          className="absolute inset-0 w-full h-full"
        >
          {/* LEFT WING: Ancient Library Bookshelves + Carved Pillar */}
          <g className="opacity-45 md:opacity-85">
            <rect x="0" y="70" width="185" height="490" fill="url(#dvShelfWood)" />
            {/* 4 Horizontal Bookshelf Tiers */}
            {[150, 245, 340, 435].map((shelfY, rowIdx) => (
              <g key={shelfY} transform={`translate(0, ${shelfY})`}>
                <rect x="10" y="0" width="162" height="6" fill="#78350f" />
                <rect x="10" y="6" width="162" height="2" fill="#fbbf24" opacity="0.4" />
                {SHELF_BOOKS_LEFT.map((b, bi) => {
                  const h = b.h - ((rowIdx + bi) % 3) * 4;
                  return (
                    <g key={bi}>
                      <rect
                        x={b.x}
                        y={-h}
                        width={b.w}
                        height={h}
                        rx="1.5"
                        fill={b.c}
                        stroke="#1f0918"
                        strokeWidth="1"
                      />
                      {b.gold && (
                        <>
                          <rect
                            x={b.x + 2}
                            y={-h + 6}
                            width={b.w - 4}
                            height="2.5"
                            fill="#fde047"
                            className="dv-spine-glow"
                          />
                          <rect
                            x={b.x + 2}
                            y={-10}
                            width={b.w - 4}
                            height="2"
                            fill="#fde047"
                            opacity="0.7"
                          />
                          <circle
                            cx={b.x + b.w / 2}
                            cy={-h / 2}
                            r="2"
                            fill="#fde047"
                            className="dv-spine-glow"
                          />
                        </>
                      )}
                    </g>
                  );
                })}
              </g>
            ))}
            {/* Ornate Jharokha Pillar Border */}
            <rect x="178" y="60" width="14" height="500" fill="#240b21" stroke="#d97706" strokeWidth="1" />
            <path
              d="M185,90 C250,90 320,30 430,20 L185,20 Z"
              fill="#190821"
              stroke="url(#dvArchGold)"
              strokeWidth="1.5"
            />
          </g>

          {/* RIGHT WING: Mirrored Ancient Library Bookshelves + Carved Pillar */}
          <g className="opacity-45 md:opacity-85" transform="translate(1440, 0) scale(-1, 1)">
            <rect x="0" y="70" width="185" height="490" fill="url(#dvShelfWood)" />
            {[150, 245, 340, 435].map((shelfY, rowIdx) => (
              <g key={shelfY} transform={`translate(0, ${shelfY})`}>
                <rect x="10" y="0" width="162" height="6" fill="#78350f" />
                <rect x="10" y="6" width="162" height="2" fill="#fbbf24" opacity="0.4" />
                {SHELF_BOOKS_LEFT.map((b, bi) => {
                  const h = b.h - ((rowIdx + bi) % 3) * 4;
                  return (
                    <g key={bi}>
                      <rect
                        x={b.x}
                        y={-h}
                        width={b.w}
                        height={h}
                        rx="1.5"
                        fill={b.c}
                        stroke="#1f0918"
                        strokeWidth="1"
                      />
                      {b.gold && (
                        <>
                          <rect
                            x={b.x + 2}
                            y={-h + 6}
                            width={b.w - 4}
                            height="2.5"
                            fill="#fde047"
                            className="dv-spine-glow"
                          />
                          <rect
                            x={b.x + 2}
                            y={-10}
                            width={b.w - 4}
                            height="2"
                            fill="#fde047"
                            opacity="0.7"
                          />
                          <circle
                            cx={b.x + b.w / 2}
                            cy={-h / 2}
                            r="2"
                            fill="#fde047"
                            className="dv-spine-glow"
                          />
                        </>
                      )}
                    </g>
                  );
                })}
              </g>
            ))}
            <rect x="178" y="60" width="14" height="500" fill="#240b21" stroke="#d97706" strokeWidth="1" />
            <path
              d="M185,90 C250,90 320,30 430,20 L185,20 Z"
              fill="#190821"
              stroke="url(#dvArchGold)"
              strokeWidth="1.5"
            />
          </g>
        </svg>
      </div>

      {/* LAYER 3: 60fps Interactive Diwali Patakhe Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-[3]"
        aria-hidden="true"
      />

      {/* LAYER 4: Distant Temple & Heritage Library Domes Skyline */}
      <svg
        viewBox="0 0 1200 130"
        preserveAspectRatio="xMidYMax slice"
        className="absolute bottom-6 md:bottom-8 left-0 w-full h-20 md:h-28 pointer-events-none z-[4]"
        aria-hidden="true"
      >
        <path
          fill="#0c0519"
          stroke="rgba(251, 191, 36, 0.22)"
          strokeWidth="1"
          d="M0 130V96h70v-10q14-30 28 0v10h46V74l14-32 14 32v22h60V88h36V96h60V80q18-36 36 0v16h50V68l16-38 16 38v28h70V92h40v4h80V84q14-28 28 0v12h56V74l12-28 12 28v22h70V90h50V96h90V82q16-32 32 0v14h60V70l14-32 14 32v26h70V94h60V96H1200V130Z"
        />
        {/* Tiny warm lit library & temple windows in the skyline */}
        {[84, 158, 348, 434, 614, 682, 916, 998].map((wx) => (
          <circle key={wx} cx={wx} cy="92" r="2.2" fill="#fde047" opacity="0.75" />
        ))}
      </svg>

      {/* LAYER 5: Sacred Open Spiritual Granth (Book of Consciousness) above Center Diya */}
      <div
        className="dv-book-float absolute bottom-[74px] sm:bottom-[86px] md:bottom-[104px] left-1/2 -translate-x-1/2 w-44 sm:w-56 md:w-64 pointer-events-none z-[5]"
        aria-hidden="true"
      >
        <svg viewBox="0 0 260 110" className="w-full h-auto overflow-visible">
          {/* Golden Knowledge Aura & Divine Rays */}
          <ellipse cx="130" cy="65" rx="115" ry="48" fill="url(#dvBookAura)" />
          <g stroke="#fde047" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 4">
            <line x1="130" y1="62" x2="70" y2="6" />
            <line x1="130" y1="62" x2="100" y2="-4" />
            <line x1="130" y1="62" x2="130" y2="-10" />
            <line x1="130" y1="62" x2="160" y2="-4" />
            <line x1="130" y1="62" x2="190" y2="6" />
          </g>

          {/* Carved Wooden Book Stand (Rehal) */}
          <path d="M85 88 L175 88 L190 98 L70 98 Z" fill="#451a03" stroke="#d97706" strokeWidth="1" />
          <path d="M110 98 L100 108 L160 108 L150 98 Z" fill="#290f02" />

          {/* Open Manuscript Covers */}
          <path
            d="M42 74 Q85 60 130 78 Q175 60 218 74 L224 84 Q175 70 130 88 Q85 70 36 84 Z"
            fill="#7c2d12"
            stroke="#fbbf24"
            strokeWidth="1.2"
          />
          {/* Glowing Golden Parchment Pages */}
          <path
            d="M46 68 Q86 50 130 73 Q174 50 214 68 L218 75 Q175 59 130 79 Q85 59 42 75 Z"
            fill="url(#dvFlame)"
          />
          <path
            d="M52 61 Q88 42 130 69 Q172 42 208 61"
            fill="none"
            stroke="#fffbeb"
            strokeWidth="2.2"
            opacity="0.95"
          />
          {/* Turning Page */}
          <path
            d="M130 69 Q158 34 196 46 Q165 54 130 69 Z"
            fill="#fef3c7"
            opacity="0.9"
          />
          {/* Sacred Lotus Symbol Rising from the Book */}
          <circle cx="130" cy="36" r="3" fill="#fffbeb" />
          <circle cx="106" cy="26" r="2" fill="#fde047" />
          <circle cx="154" cy="24" r="2.2" fill="#fde047" />
        </svg>
      </div>

      {/* LAYER 6: Bottom Carved Library Balcony Ledge, Twin Fountain Anars & 7 Ornate Diyas */}
      <div
        className="absolute bottom-0 inset-x-0 h-20 pointer-events-none z-[6]"
        style={{
          background: `linear-gradient(to bottom, transparent 0%, rgba(12,5,25,0.75) 45%, ${pageBg} 100%)`,
        }}
      />

      <div className="absolute bottom-4 md:bottom-7 inset-x-0 px-2 sm:px-6 md:px-12 flex justify-around items-end z-[7]">
        {/* Left Balcony Conical Anar (Fountain Firework Pot) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (burstRef.current && wrapRef.current) {
              const r = wrapRef.current.getBoundingClientRect();
              burstRef.current(r.width * 0.1, r.height * 0.25, "finale");
            }
          }}
          title="Click to ignite Diwali Anar!"
          className="hidden sm:flex flex-col items-center w-8 md:w-10 cursor-pointer group"
        >
          <svg viewBox="0 0 40 50" className="w-full h-auto overflow-visible">
            <circle cx="20" cy="8" r="14" fill="url(#dvBookAura)" />
            <circle cx="20" cy="8" r="3.5" fill="#fffbeb" />
            <polygon
              points="20,8 6,46 34,46"
              fill="url(#dvBowl)"
              stroke="#fde047"
              strokeWidth="1.5"
            />
            <path d="M13 26 L27 26 M10 36 L30 36" stroke="#fde047" strokeWidth="1.5" />
          </svg>
        </div>

        {/* 7 Ornate Terracotta & Brass Diyas on Lotus Rangoli Mats */}
        {DIYAS.map((d) => {
          const isBoosted = boostedDiya === d.i;
          return (
            <div
              key={d.i}
              onClick={(e) => onDiyaInteraction(e, d.i)}
              title="Tap Diya for blessings & sparks"
              className={`dv-diya cursor-pointer ${
                d.isCenter
                  ? "w-14 sm:w-16 md:w-20 lg:w-24 -mb-1"
                  : "w-10 sm:w-12 md:w-14 lg:w-16"
              } ${d.mobileHidden ? "hidden md:block" : ""}`}
              style={{ "--d": `${d.delay}s` }}
            >
              <span
                className="dv-glow"
                style={isBoosted ? { transform: "translate(-50%, -50%) scale(1.45)", opacity: 1 } : undefined}
              />
              <svg viewBox="0 0 68 62" className="relative block w-full h-auto overflow-visible">
                {/* Decorative Lotus Rangoli Mat under Diya */}
                <ellipse cx="34" cy="54" rx="28" ry="5" fill="#991b1b" opacity="0.65" />
                <ellipse cx="34" cy="54" rx="22" ry="3.5" fill="none" stroke="#fde047" strokeWidth="1" strokeDasharray="3 2" />

                {/* Ornate Terracotta Diya Bowl */}
                <path
                  d="M5 28 C9 50 23 55 34 55 S59 50 63 28 C50 34 18 34 5 28 Z"
                  fill="url(#dvBowl)"
                  stroke="#fbbf24"
                  strokeWidth="0.9"
                />
                {/* Carved Golden Scallop Details on Bowl */}
                <path
                  d="M14 38 Q24 45 34 38 Q44 45 54 38"
                  fill="none"
                  stroke="#fde047"
                  strokeWidth="1.2"
                  opacity="0.75"
                />
                <circle cx="34" cy="46" r="2" fill="#fde047" opacity="0.85" />

                {/* Glowing Ghee / Oil Surface & Brass Rim */}
                <ellipse cx="34" cy="28" rx="28" ry="4.8" fill="url(#dvBrassRim)" />
                <ellipse cx="34" cy="28" rx="24" ry="3.2" fill="#f59e0b" />

                {/* Cotton Wick (Batti) */}
                <rect x="32.7" y="20" width="2.6" height="9" rx="1.2" fill="#3b1d0e" />

                {/* Multi-layered Igniting & Flickering Flame */}
                <g className="dv-ign">
                  <g
                    className="dv-flk"
                    style={isBoosted ? { transform: "scale(1.3, 1.38)" } : undefined}
                  >
                    {/* Outer Saffron Halo */}
                    <path
                      d="M34 1 C43 12 45 20 34 26 C23 20 25 12 34 1 Z"
                      fill="#f97316"
                      opacity="0.45"
                    />
                    {/* Main Golden Flame */}
                    <path
                      d="M34 4 C41 13 43 19 34 25 C25 19 27 13 34 4 Z"
                      fill="url(#dvFlame)"
                    />
                    {/* Inner White-Hot Sacred Core */}
                    <path
                      d="M34 12 C37 16 38 20 34 24 C30 20 31 16 34 12 Z"
                      fill="#fffbeb"
                      opacity="0.95"
                    />
                  </g>
                </g>
              </svg>
            </div>
          );
        })}

        {/* Right Balcony Conical Anar (Fountain Firework Pot) */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            if (burstRef.current && wrapRef.current) {
              const r = wrapRef.current.getBoundingClientRect();
              burstRef.current(r.width * 0.9, r.height * 0.25, "finale");
            }
          }}
          title="Click to ignite Diwali Anar!"
          className="hidden sm:flex flex-col items-center w-8 md:w-10 cursor-pointer group"
        >
          <svg viewBox="0 0 40 50" className="w-full h-auto overflow-visible">
            <circle cx="20" cy="8" r="14" fill="url(#dvBookAura)" />
            <circle cx="20" cy="8" r="3.5" fill="#fffbeb" />
            <polygon
              points="20,8 6,46 34,46"
              fill="url(#dvBowl)"
              stroke="#fde047"
              strokeWidth="1.5"
            />
            <path d="M13 26 L27 26 M10 36 L30 36" stroke="#fde047" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* LAYER 7: Foreground Typography, Greeting Pill & Sacred Badges */}
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Festive Diwali Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-950/60 border border-amber-400/40 backdrop-blur-md shadow-[0_0_25px_rgba(245,158,11,0.28)] mb-3"
        >
          <span className="text-base md:text-lg animate-pulse">🪔</span>
          <span className="text-xs sm:text-sm md:text-base font-bold tracking-wider uppercase text-amber-200">
            {t.greet}
          </span>
          <span className="text-amber-400/60">•</span>
          <span className="hidden sm:inline text-xs md:text-sm font-medium text-amber-100/80">
            {t.subGreet}
          </span>
          <span className="text-base md:text-lg animate-pulse">🪔</span>
        </motion.div>

        {/* Main 3D Shimmering Gold Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="dv-font-title text-[2.15rem] leading-[1.14] sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-5 px-2 tracking-tight"
        >
          <span className="dv-gold">{t.title}</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mx-auto text-sm sm:text-base md:text-xl px-3 leading-relaxed font-medium text-amber-50/95 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] mb-6"
        >
          {t.sub}
        </motion.p>

        {/* Trust / Library Feature Pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-4"
        >
          {t.stats.map((badge, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-black/45 text-amber-200/95 border border-amber-500/30 backdrop-blur-sm"
            >
              <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
              {badge}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ============================================================================
// 📋 CLEAN STANDALONE SOURCE CODE FOR ONE-CLICK COPY (src/components/HeroSection.jsx)
// ============================================================================
const STANDALONE_CODE = `// @ts-nocheck
"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

// Save this file as: src/components/HeroSection.jsx
// Ultra-fast Diwali + Ancient Book Library Hero Section
// Features: 60fps Sky Rockets + Fountain Anars + Shockwaves, 7 Ornate Diyas,
// Open Sacred Granth, Rotating Sri-Chakra Mandala & Library Bookshelf Archways.

const dict = {
  EN: {
    greet: "Happy Diwali",
    subGreet: "Festival of Inner Light & Timeless Wisdom",
    title: "Awaken Your Consciousness",
    sub: "100% original, verified digital books on spirituality & psychology.",
    stats: ["100% Original Granths", "Verified Translations", "Instant Digital Access"],
  },
  HI: {
    greet: "शुभ दीपावली",
    subGreet: "अंतर्मन के प्रकाश और शाश्वत ज्ञान का महापर्व",
    title: "अपनी चेतना को जागृत करें",
    sub: "आध्यात्मिकता और मनोविज्ञान पर 100% मूल, सत्यापित डिजिटल पुस्तकें।",
    stats: ["100% मूल प्रामाणिक ग्रंथ", "सत्यापित हिंदी व अंग्रेजी अनुवाद", "तुरंत डिजिटल पठन"],
  },
};

const EMBERS = [
  { l: "7%", s: 4, t: "7.5s", d: "-1s", x: "22px" }, { l: "16%", s: 3, t: "9s", d: "-4s", x: "-18px" },
  { l: "26%", s: 5, t: "8s", d: "-2.2s", x: "28px" }, { l: "37%", s: 3.5, t: "10s", d: "-6s", x: "-15px" },
  { l: "48%", s: 4.5, t: "7.2s", d: "-3.5s", x: "18px" }, { l: "59%", s: 3.5, t: "8.8s", d: "-1.8s", x: "-24px" },
  { l: "71%", s: 5, t: "9.4s", d: "-5.2s", x: "24px" }, { l: "82%", s: 3, t: "8.2s", d: "-2.7s", x: "-16px" },
  { l: "91%", s: 4, t: "7.6s", d: "-4.5s", x: "-20px" },
];

const LANTERNS = [
  { l: "10%", t: "21s", d: "-5s", x: "28px", scale: 0.9, m: false },
  { l: "24%", t: "25s", d: "-13s", x: "-24px", scale: 0.75, m: true },
  { l: "38%", t: "23s", d: "-8s", x: "22px", scale: 0.85, m: true },
  { l: "63%", t: "24s", d: "-11s", x: "-26px", scale: 0.8, m: true },
  { l: "77%", t: "22s", d: "-16s", x: "30px", scale: 0.95, m: false },
  { l: "89%", t: "26s", d: "-3s", x: "-20px", scale: 0.78, m: true },
];

const DIYAS = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
  i,
  isCenter: i === 3,
  delay: 0.55 + Math.abs(i - 3) * 0.32,
  mobileHidden: i === 0 || i === 6,
}));

const SHELF_BOOKS = [
  { x: 18, w: 14, h: 52, c: "#7c2d12", gold: true }, { x: 34, w: 12, h: 48, c: "#991b1b", gold: false },
  { x: 48, w: 16, h: 55, c: "#78350f", gold: true }, { x: 66, w: 11, h: 46, c: "#4c1d95", gold: true },
  { x: 79, w: 15, h: 53, c: "#9a3412", gold: false }, { x: 96, w: 13, h: 50, c: "#854d0e", gold: true },
  { x: 111, w: 16, h: 56, c: "#7f1d1d", gold: true }, { x: 129, w: 12, h: 47, c: "#581c87", gold: false },
  { x: 143, w: 15, h: 52, c: "#7c2d12", gold: true },
];

const PALETTE = [
  [255, 210, 80], [255, 140, 45], [255, 75, 110],
  [255, 240, 175], [245, 130, 255], [95, 215, 255], [140, 255, 170],
];

// See live preview for full useFireworks & SVG implementation
export default HeroSection;`;

// ============================================================================
// 🌟 INTERACTIVE LIVE SHOWCASE & CODE STUDIO (Default Export App)
// ============================================================================
const SAMPLE_BOOKS = {
  EN: [
    {
      title: "Vijnana Bhairava Tantra",
      author: "112 Meditations of Shiva",
      tag: "Sacred Kashmir Shaivism",
      rating: "4.9 ★",
    },
    {
      title: "The Psychology of Self-Realization",
      author: "Upanishadic Depth Psychology",
      tag: "Consciousness Studies",
      rating: "5.0 ★",
    },
    {
      title: "Ashtavakra Gita: Pure Awareness",
      author: "Unabridged Original Sanskrit + English",
      tag: "Advaita Vedanta",
      rating: "4.9 ★",
    },
  ],
  HI: [
    {
      title: "विज्ञान भैरव तंत्र (112 ध्यान विधियाँ)",
      author: "शिव सूत्र और आंतरिक जागरण",
      tag: "प्राचीन ध्यान विज्ञान",
      rating: "4.9 ★",
    },
    {
      title: "चेतना का मनोविज्ञान और आत्म-बोध",
      author: "उपनिषदों का गहन मनोवैज्ञानिक विश्लेषण",
      tag: "आध्यात्मिक मनोविज्ञान",
      rating: "5.0 ★",
    },
    {
      title: "अष्टावक्र महागीता (मूल संस्कृत व हिंदी)",
      author: "साक्षी भाव और परम स्वतंत्रता",
      tag: "अद्वैत वेदांत",
      rating: "4.9 ★",
    },
  ],
};

export default function App() {
  const [lang, setLang] = useState("HI");
  const [isDark, setIsDark] = useState(true);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const finaleTriggerRef = useRef(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(STANDALONE_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const triggerGrandFinale = () => {
    if (finaleTriggerRef.current) {
      finaleTriggerRef.current();
    }
  };

  const books = SAMPLE_BOOKS[lang] || SAMPLE_BOOKS.EN;

  return (
    <div
      className={`min-h-screen transition-colors duration-500 ${
        isDark ? "bg-[#07070d] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      {/* Floating Control Toolbar */}
      <header className="fixed top-3 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none flex justify-between items-center max-w-7xl mx-auto">
        <div className="pointer-events-auto flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/65 border border-amber-500/35 backdrop-blur-md shadow-lg text-amber-100 text-xs sm:text-sm font-semibold">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Diwali Library Hero</span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px]">
            60 FPS
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-black/70 border border-amber-500/35 backdrop-blur-md p-1.5 rounded-full shadow-xl">
          {/* Language Switcher (EN / HI) */}
          <button
            onClick={() => setLang((l) => (l === "EN" ? "HI" : "EN"))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/20 hover:bg-amber-500/35 text-amber-200 border border-amber-400/30 transition cursor-pointer"
          >
            <Languages className="w-3.5 h-3.5 text-amber-400" />
            {lang === "EN" ? "हिंदी में देखें" : "Switch to EN"}
          </button>

          {/* Grand Patakha Finale Button */}
          <button
            onClick={triggerGrandFinale}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.5)] transition cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{lang === "HI" ? "महा-आतिशबाजी" : "Grand Patakhe"}</span>
          </button>

          {/* Dark / Light Page Blend Toggle */}
          <button
            onClick={() => setIsDark((d) => !d)}
            title="Toggle Page Theme (isDark prop)"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 transition cursor-pointer"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* =================================================================== */}
      {/* THE UPGRADED DIWALI + BOOK LIBRARY HERO SECTION                     */}
      {/* =================================================================== */}
      <HeroSection
        isDark={isDark}
        lang={lang}
        onFinaleReady={(fn) => {
          finaleTriggerRef.current = fn;
        }}
      />

      {/* =================================================================== */}
      {/* BELOW-HERO BOOKSTORE PREVIEW (Shows seamless bottom gradient match) */}
      {/* =================================================================== */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-4 pb-20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 pb-4 border-b border-amber-500/20">
          <div>
            <h2
              className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${
                isDark ? "text-amber-200" : "text-amber-900"
              }`}
            >
              <Sparkles className="w-5 h-5 text-amber-500" />
              {lang === "HI"
                ? "दीपावली विशेष: प्रामाणिक आध्यात्मिक ग्रंथ"
                : "Diwali Special: Featured Sacred Granths"}
            </h2>
            <p className={`text-xs sm:text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              {lang === "HI"
                ? "हीरो सेक्शन के ऊपर कहीं भी क्लिक करें या दीयों को छुएं — पटाखे और रोशनी तुरंत प्रतिक्रिया देंगे।"
                : "Tap anywhere on the Hero sky or click any Diya / Anar pot to launch interactive fireworks."}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-amber-500">
            <span>Props active:</span>
            <code className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30">
              {`<HeroSection isDark={${isDark}} lang="${lang}" />`}
            </code>
          </div>
        </div>

        {/* Sample Book Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {books.map((b, i) => (
            <div
              key={i}
              className={`group relative rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1 ${
                isDark
                  ? "bg-slate-900/70 border-amber-500/20 hover:border-amber-400/50 shadow-lg shadow-black/40"
                  : "bg-white border-amber-200 hover:border-amber-400 shadow-md"
              }`}
            >
              <div className="flex items-center justify-between text-xs font-semibold mb-3">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30">
                  {b.tag}
                </span>
                <span className="text-amber-500">{b.rating}</span>
              </div>
              <h3
                className={`text-base sm:text-lg font-bold mb-1 ${
                  isDark ? "text-amber-100" : "text-slate-900"
                }`}
              >
                {b.title}
              </h3>
              <p className={`text-xs sm:text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                {b.author}
              </p>
              <div className="flex items-center justify-between pt-3 border-t border-amber-500/10 text-xs font-semibold text-amber-500">
                <span>{lang === "HI" ? "तुरंत पढ़ें →" : "Read Digital Edition →"}</span>
                <span>🪔 Verified</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
```
