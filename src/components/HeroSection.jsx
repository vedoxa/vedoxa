"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/*
 * Vedoxa immersive Diwali hero
 * Save as: src/components/HeroSection.jsx
 * No remote images, videos, fonts, or animation libraries are required.
 */

const COPY = {
  EN: {
    greet: "Happy Diwali",
    title: "Awaken Your Consciousness",
    sub: "Original digital books exploring spirituality, psychology, and a more meaningful life.",
    cta: "Explore Books",
    hint: "Tap anywhere to launch a firework ✨",
    bookLeft: "THE INNER\nUNIVERSE",
    bookRight: "WISDOM\nWITHIN",
  },
  HI: {
    greet: "शुभ दीपावली",
    title: "अपनी चेतना को जागृत करें",
    sub: "आध्यात्मिकता, मनोविज्ञान और बेहतर जीवन की खोज करती मौलिक डिजिटल पुस्तकें।",
    cta: "किताबें देखें",
    hint: "पटाखा चलाने के लिए स्क्रीन पर टैप करें ✨",
    bookLeft: "भीतर का\nब्रह्मांड",
    bookRight: "ज्ञान की\nरोशनी",
  },
};

const EMBERS = [
  { left: "7%", size: 4, duration: "8s", delay: "-2s", dx: "22px" },
  { left: "18%", size: 3, duration: "10s", delay: "-5s", dx: "-18px" },
  { left: "29%", size: 5, duration: "8.5s", delay: "-3s", dx: "26px" },
  { left: "42%", size: 3, duration: "11s", delay: "-7s", dx: "-14px" },
  { left: "58%", size: 4, duration: "9s", delay: "-4s", dx: "18px" },
  { left: "71%", size: 5, duration: "10s", delay: "-6s", dx: "-25px" },
  { left: "84%", size: 3, duration: "8.5s", delay: "-2.5s", dx: "17px" },
  { left: "94%", size: 4, duration: "9.5s", delay: "-5.5s", dx: "-19px" },
];

const LANTERNS = [
  { left: "11%", duration: "22s", delay: "-7s", dx: "28px", hideMobile: false },
  { left: "34%", duration: "25s", delay: "-15s", dx: "-26px", hideMobile: true },
  { left: "66%", duration: "23s", delay: "-10s", dx: "24px", hideMobile: true },
  { left: "88%", duration: "26s", delay: "-18s", dx: "-25px", hideMobile: false },
];

const DIYAS = [0, 1, 2, 3, 4, 5, 6].map((i) => ({
  id: i,
  delay: 0.65 + Math.abs(i - 3) * 0.32,
  hideMobile: i === 0 || i === 6,
}));

const COLORS = [
  [255, 200, 70],
  [255, 130, 40],
  [255, 80, 100],
  [255, 230, 150],
  [255, 140, 210],
  [130, 210, 255],
  [160, 255, 190],
];

function seededRandom(seed) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let t = Math.imul(value ^ (value >>> 15), 1 | value);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildLibrarySvg() {
  const rand = seededRandom(20261029);
  const bookColors = [
    "#7f1d1d", "#9a3412", "#92400e", "#78350f", "#1e3a5f",
    "#1e40af", "#312e81", "#581c87", "#831843", "#14532d",
    "#115e59", "#3f3f46", "#a16207", "#7c2d12", "#9f1239",
  ];
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 700" preserveAspectRatio="xMidYMax slice" style="width:100%;height:100%;display:block" aria-hidden="true">
    <defs>
      <linearGradient id="vdShelfWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a56b35"/><stop offset="1" stop-color="#45240f"/></linearGradient>
      <linearGradient id="vdWall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#20122a"/><stop offset="1" stop-color="#080511"/></linearGradient>
      <radialGradient id="vdMoonGlow"><stop offset="0" stop-color="#fff4c6" stop-opacity=".78"/><stop offset="1" stop-color="#fff4c6" stop-opacity="0"/></radialGradient>
      <linearGradient id="vdWindowGlow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#37264a"/><stop offset="1" stop-color="#0b1029"/></linearGradient>
    </defs>
    <rect width="1200" height="700" fill="url(#vdWall)"/>`;

  const shelves = [190, 350, 510, 670];
  for (const baseline of shelves) {
    const sections = baseline < 510 ? [[14, 420], [780, 1186]] : [[14, 1186]];
    for (const [start, end] of sections) {
      let x = start;
      while (x < end - 12) {
        if (rand() < 0.045) {
          x += 12 + Math.floor(rand() * 13);
          continue;
        }
        let width = 14 + Math.floor(rand() * 17);
        if (x + width > end) width = end - x;
        if (width < 9) break;
        const height = 106 + Math.floor(rand() * 40);
        const y = baseline - height;
        const color = bookColors[Math.floor(rand() * bookColors.length)];
        svg += `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="1.5" fill="${color}"/>`;
        svg += `<path d="M${x + 2} ${y + 3}V${baseline - 3}" stroke="#fff2c5" stroke-opacity=".08" stroke-width="1"/>`;
        if (rand() > 0.26) svg += `<rect x="${x}" y="${y + 10}" width="${width}" height="3" fill="#f8d68b" opacity=".68"/>`;
        if (rand() > 0.55) svg += `<rect x="${x}" y="${baseline - 14}" width="${width}" height="3" fill="#f8d68b" opacity=".52"/>`;
        if (rand() > 0.68) svg += `<rect x="${Math.round(x + width * .25)}" y="${Math.round(y + height * .4)}" width="${Math.max(3, Math.round(width * .45))}" height="${Math.round(height * .14)}" rx="1" fill="#f9e9c8" opacity=".38"/>`;
        x += width + 1;
      }
      svg += `<rect x="${start - 7}" y="${baseline}" width="${end - start + 14}" height="10" fill="url(#vdShelfWood)"/>`;
      svg += `<rect x="${start - 7}" y="${baseline + 10}" width="${end - start + 14}" height="12" fill="#000" opacity=".28"/>`;
    }
  }

  // Central arched window and moon are drawn above the books to create a clean focal point.
  svg += `<path d="M420 500V225A180 180 0 0 1 780 225V500Z" fill="url(#vdWindowGlow)"/>`;
  svg += `<circle cx="680" cy="155" r="112" fill="url(#vdMoonGlow)"/>`;
  svg += `<circle cx="680" cy="155" r="31" fill="#fff4c6"/>`;
  svg += `<circle cx="670" cy="146" r="5" fill="#e8d9a9" opacity=".6"/>`;
  for (let i = 0; i < 40; i++) {
    const x = 444 + rand() * 310;
    const y = 92 + rand() * 310;
    const r = rand() * 1.45 + 0.45;
    svg += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#fff1c4" opacity="${(0.2 + rand() * 0.68).toFixed(2)}"/>`;
  }
  svg += `<path d="M420 500V225A180 180 0 0 1 780 225V500" fill="none" stroke="#8e5c2e" stroke-width="10"/>`;
  svg += `<path d="M430 500V226A170 170 0 0 1 770 226V500" fill="none" stroke="#f1c66e" stroke-width="1.8" opacity=".6"/>`;
  svg += `<path d="M600 45V500M420 348H780" stroke="#7c522c" stroke-width="3" opacity=".8"/>`;
  svg += `<rect x="407" y="499" width="386" height="13" rx="2" fill="url(#vdShelfWood)"/>`;
  svg += `<rect x="0" y="0" width="10" height="700" fill="#120a12"/><rect x="1190" y="0" width="10" height="700" fill="#120a12"/>`;
  svg += `<rect width="1200" height="700" fill="#07040e" opacity=".19"/></svg>`;
  return svg;
}

function buildToranSvg() {
  const colors = ["#ffd166", "#ff9f1c", "#ff5d8f", "#fff1b8"];
  let path = "M0 7";
  let bulbs = "";
  let index = 0;
  for (let segment = 0; segment < 4; segment++) {
    const x0 = segment * 300;
    const x2 = x0 + 300;
    const cx = x0 + 150;
    const y = 7;
    path += `Q${cx} 90 ${x2} ${y}`;
    for (let point = 1; point <= 6; point++) {
      const t = point / 7;
      const m = 1 - t;
      const x = m * m * x0 + 2 * m * t * cx + t * t * x2;
      const yy = m * m * y + 2 * m * t * 90 + t * t * y;
      const color = colors[index % colors.length];
      const delay = ((index * 0.37) % 2.8).toFixed(2);
      bulbs += `<circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="9" fill="${color}" fill-opacity=".25" class="dv-toran-bulb" style="animation-delay:-${delay}s"/><circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="3.5" fill="${color}" class="dv-toran-bulb" style="animation-delay:-${delay}s"/>`;
      index++;
    }
    if (segment > 0) bulbs += `<circle cx="${x0}" cy="7" r="4" fill="#f59e0b"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 100" preserveAspectRatio="xMidYMin slice" style="width:100%;height:100%;display:block" aria-hidden="true"><path d="${path}" fill="none" stroke="#7a4a1e" stroke-width="1.7" opacity=".9"/>${bulbs}</svg>`;
}

const LIBRARY_SVG = buildLibrarySvg();
const TORAN_SVG = buildToranSvg();

function useFireworks(wrapRef, canvasRef, apiRef) {
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return undefined;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return undefined;

    const isSmall = () => window.innerWidth < 640;
    let dpr = 1;
    let width = 0;
    let height = 0;
    let rafId = 0;
    let previousTime = 0;
    let elapsed = 0;
    let nextLaunch = 0.65;
    let secondLaunchAt = -1;
    let isVisible = true;
    const rockets = [];
    const sparks = [];
    const flashes = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, isSmall() ? 1.35 : 1.7);
      const rect = wrap.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const chooseColor = () => COLORS[(Math.random() * COLORS.length) | 0];

    const launch = (targetX, targetY) => {
      const aimed = Number.isFinite(targetX) && Number.isFinite(targetY);
      rockets.push({
        x: aimed ? Math.max(8, Math.min(width - 8, targetX)) : width * (0.1 + Math.random() * 0.8),
        y: height * 0.97,
        targetY: aimed ? Math.max(28, Math.min(height * 0.84, targetY)) : height * (0.12 + Math.random() * 0.28),
        vx: aimed ? 0 : (Math.random() - 0.5) * 18,
        speed: Math.max(330, height * (aimed ? 1.25 : 0.88)),
      });
    };

    const explode = (x, y) => {
      const primary = chooseColor();
      const secondary = chooseColor();
      const small = isSmall();
      const power = (small ? 90 : 135) * (0.82 + Math.random() * 0.42);
      const kind = Math.random();
      flashes.push({ x, y, life: 1, color: primary });

      if (kind < 0.5) {
        const count = small ? 30 : 52;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + Math.random() * 0.1;
          const speed = power * (0.32 + Math.random() * 0.68);
          sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, decay: 0.62 + Math.random() * 0.45, color: i % 3 === 0 ? secondary : primary, gravity: 58, drag: 0.18, tail: 0.032 });
        }
      } else if (kind < 0.78) {
        const count = small ? 22 : 36;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          sparks.push({ x, y, vx: Math.cos(angle) * power, vy: Math.sin(angle) * power, life: 1, decay: 0.72, color: primary, gravity: 56, drag: 0.18, tail: 0.032 });
          if (i % 2 === 0) sparks.push({ x, y, vx: Math.cos(angle) * power * 0.52, vy: Math.sin(angle) * power * 0.52, life: 1, decay: 0.82, color: secondary, gravity: 56, drag: 0.18, tail: 0.032 });
        }
      } else {
        const count = small ? 22 : 38;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + Math.random() * 0.16;
          const speed = power * 0.7 * (0.4 + Math.random() * 0.6);
          sparks.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: 1, decay: 0.28 + Math.random() * 0.15, color: [255, 205, 100], gravity: 98, drag: 0.42, tail: 0.065 });
        }
      }

      const limit = small ? 220 : 360;
      if (sparks.length > limit) sparks.splice(0, sparks.length - limit);
      if (flashes.length > 6) flashes.splice(0, flashes.length - 6);
    };

    apiRef.current = { launch };

    const render = (time) => {
      rafId = requestAnimationFrame(render);
      const dt = Math.min((time - previousTime) / 1000 || 0.016, 0.04);
      previousTime = time;
      elapsed += dt;

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";

      nextLaunch -= dt;
      if (nextLaunch <= 0) {
        launch();
        if (Math.random() < 0.22) secondLaunchAt = elapsed + 0.22;
        nextLaunch = 1.05 + Math.random() * 1.35;
      }
      if (secondLaunchAt > 0 && elapsed >= secondLaunchAt) {
        launch();
        secondLaunchAt = -1;
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const rocket = rockets[i];
        rocket.y -= rocket.speed * dt;
        rocket.x += rocket.vx * dt;
        ctx.strokeStyle = "rgba(255,225,160,.82)";
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.moveTo(rocket.x - rocket.vx * 0.05, rocket.y + 14);
        ctx.lineTo(rocket.x, rocket.y);
        ctx.stroke();
        ctx.fillStyle = "rgba(255,245,210,.95)";
        ctx.beginPath();
        ctx.arc(rocket.x, rocket.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
        if (rocket.y <= rocket.targetY) {
          explode(rocket.x, rocket.y);
          rockets.splice(i, 1);
        }
      }

      for (let i = flashes.length - 1; i >= 0; i--) {
        const flash = flashes[i];
        flash.life -= dt * 3.8;
        if (flash.life <= 0) {
          flashes.splice(i, 1);
          continue;
        }
        const radius = 54 * (1.15 - flash.life * 0.45);
        const gradient = ctx.createRadialGradient(flash.x, flash.y, 0, flash.x, flash.y, radius);
        gradient.addColorStop(0, `rgba(${flash.color[0]},${flash.color[1]},${flash.color[2]},${0.38 * flash.life})`);
        gradient.addColorStop(1, `rgba(${flash.color[0]},${flash.color[1]},${flash.color[2]},0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(flash.x, flash.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const spark = sparks[i];
        const drag = Math.pow(spark.drag, dt);
        spark.vx *= drag;
        spark.vy = spark.vy * drag + spark.gravity * dt;
        spark.x += spark.vx * dt;
        spark.y += spark.vy * dt;
        spark.life -= spark.decay * dt;
        if (spark.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.strokeStyle = `rgba(${spark.color[0]},${spark.color[1]},${spark.color[2]},${spark.life})`;
        ctx.lineWidth = 0.9 + spark.life * 1.2;
        ctx.beginPath();
        ctx.moveTo(spark.x - spark.vx * spark.tail, spark.y - spark.vy * spark.tail);
        ctx.lineTo(spark.x, spark.y);
        ctx.stroke();
      }
    };

    const start = () => {
      if (!rafId && isVisible && !document.hidden) {
        previousTime = performance.now();
        rafId = requestAnimationFrame(render);
      }
    };
    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    const resizeObserver = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    if (resizeObserver) resizeObserver.observe(wrap);
    const intersectionObserver = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([entry]) => {
          isVisible = entry.isIntersecting;
          if (isVisible) start();
          else stop();
        }, { threshold: 0.01 })
      : null;
    if (intersectionObserver) intersectionObserver.observe(wrap);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      if (resizeObserver) resizeObserver.disconnect();
      if (intersectionObserver) intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      apiRef.current = null;
    };
  }, [wrapRef, canvasRef, apiRef]);
}

const HERO_CSS = `
.dv-hero{--back-x:0px;--back-y:0px;--mid-x:0px;--mid-y:0px;--front-x:0px;--front-y:0px;position:relative;isolation:isolate;perspective:1250px;transform-style:preserve-3d;background:radial-gradient(ellipse 85% 55% at 50% 110%,rgba(255,132,34,.3),transparent 65%),linear-gradient(180deg,#080510 0%,#150824 48%,#281035 100%);}
.dv-hero *{box-sizing:border-box}
.dv-hero:before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;background:radial-gradient(ellipse at 50% 42%,rgba(255,182,76,.11),transparent 44%),linear-gradient(180deg,rgba(4,2,11,.12),rgba(5,2,14,.18));}
.dv-stars{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cg fill='white'%3E%3Ccircle cx='18' cy='26' r='1.1'/%3E%3Ccircle cx='96' cy='60' r='.8'/%3E%3Ccircle cx='170' cy='20' r='1.2'/%3E%3Ccircle cx='200' cy='110' r='.9'/%3E%3Ccircle cx='60' cy='140' r='1'/%3E%3Ccircle cx='140' cy='180' r='.8'/%3E%3Ccircle cx='30' cy='210' r='1.1'/%3E%3Ccircle cx='190' cy='195' r='.9'/%3E%3C/g%3E%3C/svg%3E");background-size:220px 220px;animation:dv-twinkle 4.5s ease-in-out infinite alternate;}
.dv-stars--far{background-size:310px 310px;background-position:71px 33px;opacity:.42;animation-duration:7s;animation-delay:-2s;}
@keyframes dv-twinkle{from{opacity:.25}to{opacity:.9}}
.dv-parallax{position:absolute;inset:0;pointer-events:none;transform-style:preserve-3d;will-change:transform;}
.dv-parallax--back{transform:translate3d(var(--back-x),var(--back-y),-70px) scale(1.06);}
.dv-parallax--mid{transform:translate3d(var(--mid-x),var(--mid-y),-20px);}
.dv-parallax--front{transform:translate3d(var(--front-x),var(--front-y),35px);}
.dv-library{position:absolute;inset:-1%;transform-origin:50% 65%;animation:dv-library-drift 34s ease-in-out infinite alternate;opacity:.96;}
@keyframes dv-library-drift{from{transform:scale(1)}to{transform:scale(1.045) translate3d(0,-.4%,0)}}
.dv-warm-lamp{position:absolute;top:14%;width:58%;height:80%;opacity:.78;filter:blur(1px);animation:dv-lamp-breathe 4.3s ease-in-out infinite alternate;}
.dv-warm-lamp--left{left:-18%;background:radial-gradient(ellipse at 35% 55%,rgba(255,148,43,.28),transparent 64%);}
.dv-warm-lamp--right{right:-18%;background:radial-gradient(ellipse at 65% 55%,rgba(255,148,43,.24),transparent 64%);animation-delay:-2.1s;}
@keyframes dv-lamp-breathe{from{opacity:.52}to{opacity:.95}}
.dv-rays{position:absolute;left:50%;top:-5%;height:110%;width:72%;transform:translateX(-50%);background:linear-gradient(180deg,rgba(255,199,112,.16),transparent 75%);clip-path:polygon(43% 0,57% 0,100% 100%,0 100%);animation:dv-rays-breathe 5.8s ease-in-out infinite alternate;}
@keyframes dv-rays-breathe{from{opacity:.3}to{opacity:.9}}
.dv-toran-bulb{animation:dv-bulb-flicker 2.2s ease-in-out infinite alternate;}
@keyframes dv-bulb-flicker{from{opacity:.45}to{opacity:1}}
.dv-ember,.dv-lantern{position:absolute;bottom:-32px;opacity:0;will-change:transform,opacity;animation:dv-rise linear infinite;}
.dv-ember{border-radius:50%;background:radial-gradient(circle,#fff0bd,#ff9a2e 58%,transparent 75%);box-shadow:0 0 8px rgba(255,173,65,.25);}
.dv-lantern{width:15px;height:23px;border-radius:6px 6px 9px 9px;background:linear-gradient(90deg,#e98417,#ffe29a 48%,#d86c12);box-shadow:0 0 17px 5px rgba(255,150,40,.28);}
.dv-lantern:after{content:"";position:absolute;left:50%;top:100%;height:8px;border-left:1px solid rgba(255,204,117,.55);}
@keyframes dv-rise{0%{transform:translate3d(0,0,0) scale(1);opacity:0}14%{opacity:.8}84%{opacity:.65}100%{transform:translate3d(var(--dx),-410px,0) scale(.48);opacity:0}}
.dv-chip{display:inline-flex;align-items:center;gap:.5rem;border:1px solid rgba(252,211,77,.3);background:rgba(20,8,30,.48);box-shadow:0 0 30px -8px rgba(255,170,50,.32),inset 0 1px rgba(255,255,255,.07);backdrop-filter:blur(9px);}
.dv-gold-text{background:linear-gradient(100deg,#fff0af 4%,#f8be45 28%,#fff8d8 48%,#f59e0b 68%,#ffe7a1 90%);background-size:230% auto;-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 4px 18px rgba(245,158,11,.18));animation:dv-gold-flow 7s linear infinite;}
@keyframes dv-gold-flow{to{background-position:230% center}}
.dv-subtext{text-shadow:0 2px 18px rgba(0,0,0,.92);}
.dv-hero-copy{position:relative;z-index:20;transform:translateZ(45px);transform-style:preserve-3d;}
.dv-entrance{animation:dv-enter .85s cubic-bezier(.16,1,.3,1) both;}
.dv-entrance--2{animation-delay:.09s}.dv-entrance--3{animation-delay:.18s}.dv-entrance--4{animation-delay:.28s}
@keyframes dv-enter{from{opacity:0;transform:translate3d(0,24px,38px)}to{opacity:1;transform:translate3d(0,0,45px)}}
.dv-cta{position:relative;isolation:isolate;overflow:hidden;background:linear-gradient(100deg,#fcd34d,#f59e0b,#fff0a8,#f59e0b);background-size:220% auto;color:#2a1205;box-shadow:0 9px 32px -7px rgba(245,158,11,.58),inset 0 1px 0 rgba(255,255,255,.62);transition:transform .24s ease,box-shadow .24s ease,background-position .6s ease;}
.dv-cta:before{content:"";position:absolute;inset:-40% auto -40% -35%;width:24%;transform:rotate(20deg);background:rgba(255,255,255,.5);filter:blur(8px);transition:left .65s ease;z-index:-1;}
.dv-cta:hover{transform:translateY(-3px) scale(1.035);background-position:100% 0;box-shadow:0 14px 40px -8px rgba(245,158,11,.74),inset 0 1px 0 rgba(255,255,255,.7);}
.dv-cta:hover:before{left:120%;}
.dv-cta:active{transform:scale(.975)}
.dv-hint{animation:dv-hint 7.5s ease-in-out 1.3s both;}
@keyframes dv-hint{0%{opacity:0;transform:translateY(5px)}12%,76%{opacity:.78;transform:translateY(0)}100%{opacity:0;transform:translateY(-3px)}}
.dv-diya{position:relative;transform:translateZ(30px);}
.dv-diya-glow{position:absolute;left:50%;top:22%;width:230%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,190,80,.5),rgba(255,120,30,.14) 41%,transparent 70%);opacity:.8;animation:dv-diya-pulse 2.4s ease-in-out infinite;animation-delay:var(--delay);}
@keyframes dv-diya-pulse{0%,100%{opacity:.58;transform:translate(-50%,-50%) scale(.93)}50%{opacity:1;transform:translate(-50%,-50%) scale(1.08)}}
.dv-flame{transform-box:fill-box;transform-origin:50% 100%;animation:dv-flame-dance 1.2s ease-in-out infinite;animation-delay:var(--delay);}
@keyframes dv-flame-dance{0%,100%{transform:scale(1,1) skewX(0)}25%{transform:scale(.94,1.09) skewX(-3deg)}50%{transform:scale(1.04,.96) skewX(2deg)}75%{transform:scale(.97,1.05) skewX(-1.5deg)}}
.dv-floating-book{position:absolute;width:clamp(100px,11vw,150px);height:clamp(145px,16vw,202px);perspective:850px;filter:drop-shadow(0 24px 22px rgba(0,0,0,.5));animation:dv-book-hover 7.2s ease-in-out infinite;}
.dv-floating-book--left{left:clamp(10px,7.5vw,110px);top:31%;transform:translateZ(90px) rotate(-9deg);animation-delay:-2s;}
.dv-floating-book--right{right:clamp(10px,7.5vw,110px);top:34%;transform:translateZ(115px) rotate(8deg);animation-delay:-4.1s;}
.dv-book-3d{position:relative;width:100%;height:100%;transform-style:preserve-3d;transform:rotateY(-20deg) rotateX(5deg);}
.dv-floating-book--right .dv-book-3d{transform:rotateY(20deg) rotateX(-4deg);}
.dv-book-pages{position:absolute;top:4%;bottom:3%;right:-7px;width:12px;background:repeating-linear-gradient(180deg,#f7e4bd 0 2px,#bba27b 2px 3px);transform:translateZ(-5px) rotateY(0deg);border-radius:0 3px 3px 0;box-shadow:inset -3px 0 3px rgba(0,0,0,.25);}
.dv-book-cover{position:absolute;inset:0;border:1px solid rgba(255,223,145,.6);border-radius:4px 8px 8px 4px;background:linear-gradient(138deg,#8a2d19,#40142c 58%,#170d24);box-shadow:inset 5px 0 7px rgba(255,220,150,.12),inset -7px 0 9px rgba(0,0,0,.23),0 0 0 1px rgba(255,190,82,.12);transform:translateZ(2px);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px 8px;color:#fce7af;text-align:center;}
.dv-floating-book--right .dv-book-cover{background:linear-gradient(140deg,#164e4a,#122d40 62%,#101426);}
.dv-book-cover:before{content:"";position:absolute;inset:8px;border:1px solid rgba(255,220,150,.45);border-radius:2px;}
.dv-book-mark{font-family:Georgia,serif;font-size:clamp(24px,3vw,40px);line-height:1;color:#f6d482;text-shadow:0 0 18px rgba(245,177,62,.32);margin-bottom:12px;}
.dv-book-title{position:relative;z-index:1;white-space:pre-line;font-family:Georgia,serif;font-size:clamp(10px,1.12vw,14px);font-weight:700;line-height:1.45;letter-spacing:.07em;text-transform:uppercase;}
.dv-book-publisher{position:absolute;bottom:16px;z-index:1;font-size:7px;letter-spacing:.22em;color:rgba(255,233,180,.72);}
@keyframes dv-book-hover{0%,100%{margin-top:0}50%{margin-top:-13px}}
.dv-bottom-fade{position:absolute;left:0;right:0;bottom:0;height:54px;pointer-events:none;z-index:18;}
.dv-fireworks{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:12;}
.dv-hero:focus-within .dv-cta{outline:2px solid #fff1b8;outline-offset:4px;}
@media(max-width:767px){.dv-floating-book{display:none}.dv-hero-copy{transform:translateZ(25px)}.dv-entrance{animation-duration:.68s}.dv-rays{width:100%}}
@media(max-width:480px){.dv-lantern{transform:scale(.82)}.dv-hero{perspective:900px}}
@media(prefers-reduced-motion:reduce){
  .dv-stars,.dv-library,.dv-warm-lamp,.dv-rays,.dv-toran-bulb,.dv-ember,.dv-lantern,.dv-gold-text,.dv-entrance,.dv-hint,.dv-diya-glow,.dv-flame,.dv-floating-book{animation:none!important;transition:none!important;}
  .dv-ember,.dv-lantern{display:none}.dv-floating-book{margin-top:0}.dv-hint{opacity:.75}.dv-hero-copy{transform:none}.dv-entrance{opacity:1;transform:none;}
}
`;

export default function HeroSection({ isDark = false, lang = "EN" }) {
  const text = COPY[lang] || COPY.EN;
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const apiRef = useRef(null);
  useFireworks(wrapRef, canvasRef, apiRef);

  const handlePointerDown = (event) => {
    if (event.target?.closest?.("a, button")) return;
    const api = apiRef.current;
    const section = wrapRef.current;
    if (!api || !section) return;
    const rect = section.getBoundingClientRect();
    api.launch(event.clientX - rect.left, event.clientY - rect.top);
  };

  const handlePointerMove = (event) => {
    if (event.pointerType === "touch") return;
    const section = wrapRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5;
    const y = (event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5;
    section.style.setProperty("--back-x", `${(-x * 4).toFixed(2)}px`);
    section.style.setProperty("--back-y", `${(-y * 3).toFixed(2)}px`);
    section.style.setProperty("--mid-x", `${(-x * 9).toFixed(2)}px`);
    section.style.setProperty("--mid-y", `${(-y * 7).toFixed(2)}px`);
    section.style.setProperty("--front-x", `${(x * 13).toFixed(2)}px`);
    section.style.setProperty("--front-y", `${(y * 10).toFixed(2)}px`);
  };

  const resetPointer = () => {
    const section = wrapRef.current;
    if (!section) return;
    ["--back-x", "--back-y", "--mid-x", "--mid-y", "--front-x", "--front-y"].forEach((name) => {
      section.style.setProperty(name, "0px");
    });
  };

  const pageBackground = isDark ? "#07070d" : "#f8fafc";

  return (
    <section
      ref={wrapRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      style={{ touchAction: "manipulation", minHeight: "clamp(440px, 58vw, 640px)" }}
      className="dv-hero relative flex flex-col items-center justify-center overflow-hidden px-4 pb-24 pt-16 text-center sm:pb-28 sm:pt-20"
      aria-label={text.greet}
    >
      <style>{HERO_CSS}</style>

      {/* Deep star layer */}
      <div className="dv-parallax dv-parallax--back z-[1]" aria-hidden="true">
        <div className="dv-stars" />
        <div className="dv-stars dv-stars--far" />
      </div>

      {/* Generated bookshelf, moonlit arch, and warm light */}
      <div className="dv-parallax dv-parallax--mid z-[2]" aria-hidden="true">
        <div className="dv-library" dangerouslySetInnerHTML={{ __html: LIBRARY_SVG }} />
        <div className="dv-warm-lamp dv-warm-lamp--left" />
        <div className="dv-warm-lamp dv-warm-lamp--right" />
        <div className="dv-rays" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 58% 48% at 50% 45%,rgba(8,4,20,.77),transparent 100%)" }} />
      </div>

      {/* Floating book covers create the foreground / 3D pop-out illusion */}
      <div className="dv-parallax dv-parallax--front z-[8]" aria-hidden="true">
        <div className="dv-floating-book dv-floating-book--left">
          <div className="dv-book-3d">
            <div className="dv-book-pages" />
            <div className="dv-book-cover">
              <span className="dv-book-mark">V</span>
              <span className="dv-book-title">{text.bookLeft}</span>
              <span className="dv-book-publisher">VEDOXA • ORIGINALS</span>
            </div>
          </div>
        </div>
        <div className="dv-floating-book dv-floating-book--right">
          <div className="dv-book-3d">
            <div className="dv-book-pages" />
            <div className="dv-book-cover">
              <span className="dv-book-mark">✦</span>
              <span className="dv-book-title">{text.bookRight}</span>
              <span className="dv-book-publisher">VEDOXA • ORIGINALS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lightweight canvas: no video file or external effects package */}
      <canvas ref={canvasRef} className="dv-fireworks" aria-hidden="true" />

      {/* Diwali toran */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[14] h-12 sm:h-16" aria-hidden="true" dangerouslySetInnerHTML={{ __html: TORAN_SVG }} />

      {/* Rising embers and lanterns */}
      <div className="pointer-events-none absolute inset-0 z-[14] overflow-hidden" aria-hidden="true">
        {EMBERS.map((ember, index) => (
          <span
            key={`ember-${index}`}
            className="dv-ember"
            style={{ left: ember.left, width: ember.size, height: ember.size, animationDuration: ember.duration, animationDelay: ember.delay, "--dx": ember.dx }}
          />
        ))}
        {LANTERNS.map((lantern, index) => (
          <span
            key={`lantern-${index}`}
            className={`dv-lantern ${lantern.hideMobile ? "hidden md:block" : ""}`}
            style={{ left: lantern.left, animationDuration: lantern.duration, animationDelay: lantern.delay, "--dx": lantern.dx }}
          />
        ))}
      </div>

      {/* Foreground diyas */}
      <div className="dv-parallax dv-parallax--front absolute inset-x-0 bottom-2 z-[16] flex items-end justify-around px-3 md:bottom-4 md:px-10" style={{ top: "auto", height: "auto", bottom: "0.5rem" }} aria-hidden="true">
        {DIYAS.map((diya) => (
          <div key={diya.id} className={`dv-diya w-8 sm:w-10 md:w-12 lg:w-14 ${diya.hideMobile ? "hidden md:block" : ""}`} style={{ "--delay": `${diya.delay}s` }}>
            <span className="dv-diya-glow" />
            <svg viewBox="0 0 64 56" className="relative block h-auto w-full">
              <path d="M4 24C8 46 22 52 32 52S56 46 60 24C48 30 16 30 4 24Z" fill="#a44818" />
              <path d="M7 26C15 32 49 32 57 26" fill="none" stroke="#f7b85d" strokeWidth="2" opacity=".8" />
              <path d="M12 34Q32 44 52 34" fill="none" stroke="#ffd48a" strokeWidth="1.2" opacity=".55" strokeLinecap="round" />
              <circle cx="22" cy="40" r="1.2" fill="#ffd48a" opacity=".55" />
              <circle cx="32" cy="44" r="1.2" fill="#ffd48a" opacity=".55" />
              <circle cx="42" cy="40" r="1.2" fill="#ffd48a" opacity=".55" />
              <ellipse cx="32" cy="24" rx="27" ry="4.5" fill="#ffb347" />
              <rect x="30.8" y="17" width="2.4" height="8" rx="1" fill="#3b1d0e" />
              <g className="dv-flame" style={{ "--delay": `${diya.delay}s` }}>
                <path d="M32 2C39 11 41 17 32 22C23 17 25 11 32 2Z" fill="#ffb52e" />
                <path d="M32 11C35 15 36 18 32 21C28 18 29 15 32 11Z" fill="#fff8dc" opacity=".94" />
              </g>
            </svg>
          </div>
        ))}
      </div>

      {/* Main message sits forward of the background to enhance depth */}
      <div className="dv-hero-copy mx-auto flex w-full max-w-5xl flex-col items-center">
        <p className="dv-chip dv-entrance relative z-20 mb-4 rounded-full px-4 py-2 text-xs font-semibold tracking-[.12em] text-amber-100 sm:text-sm">
          <span aria-hidden="true">🪔</span>
          <span>{text.greet}</span>
          <span aria-hidden="true">🪔</span>
        </p>

        <h1 className="dv-entrance dv-entrance--2 relative z-20 mb-4 max-w-5xl font-serif text-[clamp(2rem,5.3vw,4.8rem)] font-black leading-[1.08] tracking-[-.035em]">
          <span className="dv-gold-text">{text.title}</span>
        </h1>

        <p className="dv-subtext dv-entrance dv-entrance--3 relative z-20 mx-auto max-w-2xl px-3 text-sm font-medium leading-7 text-amber-50/90 sm:text-base sm:leading-8">
          {text.sub}
        </p>

        <div className="dv-entrance dv-entrance--4 relative z-20 mt-7 flex flex-col items-center gap-3">
          <Link href="/explore" className="dv-cta inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-extrabold sm:px-8 sm:py-3.5 sm:text-base">
            <span aria-hidden="true">📚</span>
            <span>{text.cta}</span>
            <span aria-hidden="true">↗</span>
          </Link>
          <span className="dv-hint text-[11px] tracking-wide text-amber-100/75 sm:text-xs">{text.hint}</span>
        </div>
      </div>

      <div className="dv-bottom-fade" style={{ background: `linear-gradient(to bottom, transparent, ${pageBackground})` }} aria-hidden="true" />
    </section>
  );
      }
