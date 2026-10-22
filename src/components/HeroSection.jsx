// @ts-nocheck
"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Save as: src/components/HeroSection.jsx
// 0 image / 0 video / 0 font download: library, aasmaan, toran-lights, diye, patakhe sab code se bante hain.
// Tap/click karne par us jagah rocket jaakar patakha fodta hai.

const dict = {
  EN: {
    greet: "Happy Diwali",
    title: "Awaken Your Consciousness",
    sub: "100% original, verified digital books on spirituality & psychology.",
    cta: "Explore Books",
    hint: "Tap anywhere for fireworks ✨",
  },
  HI: {
    greet: "शुभ दीपावली",
    title: "अपनी चेतना को जागृत करें",
    sub: "आध्यात्मिकता और मनोविज्ञान पर 100% मूल, सत्यापित डिजिटल पुस्तकें।",
    cta: "किताबें देखें",
    hint: "पटाखे देखने के लिए कहीं भी टैप करें ✨",
  },
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

const PALETTE = [[255, 200, 70], [255, 130, 40], [255, 80, 100], [255, 230, 150], [255, 140, 210], [130, 210, 255], [160, 255, 190]];

/* ═══════════ Book-library (pure SVG string, ek hi baar bana, ek hi baar parse) ═══════════ */
function rng(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildLibrary() {
  const r = rng(20261022);
  const PAL = ["#7f1d1d", "#9a3412", "#92400e", "#78350f", "#1e3a5f", "#1e40af", "#312e81", "#581c87", "#831843", "#14532d", "#115e59", "#3f3f46", "#a16207", "#7c2d12", "#9f1239"];
  const WIN = { x1: 430, x2: 770, sill: 470, spring: 200, rad: 170 };
  const wall = `M0 0H1200V640H0Z M${WIN.x1} ${WIN.sill}V${WIN.spring}A${WIN.rad} ${WIN.rad} 0 0 1 ${WIN.x2} ${WIN.spring}V${WIN.sill}Z`;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 640" preserveAspectRatio="xMidYMax slice" style="width:100%;height:100%;display:block" aria-hidden="true"><defs>`
    + `<linearGradient id="dvWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6531"/><stop offset="1" stop-color="#4a2a12"/></linearGradient>`
    + `<linearGradient id="dvShade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>`
    + `<radialGradient id="dvMoon"><stop offset="0" stop-color="#fff6d6" stop-opacity=".6"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient></defs>`;

  // Khidki me chaand
  s += `<circle cx="676" cy="124" r="46" fill="url(#dvMoon)"/><circle cx="676" cy="124" r="17" fill="#fff6d6"/><circle cx="670" cy="120" r="3" fill="#e9dcae" opacity=".6"/>`;
  // Deewar (khidki ke hole ke saath)
  s += `<path d="${wall}" fill-rule="evenodd" fill="#140b1b"/>`;

  // Kitabein
  const baselines = [170, 320, 470, 620];
  for (const b of baselines) {
    const segs = b <= 470 ? [[10, WIN.x1 - 4], [WIN.x2 + 4, 1190]] : [[10, 1190]];
    for (const [start, end] of segs) {
      let x = start;
      while (x < end - 12) {
        if (r() < 0.05) { x += 14 + Math.floor(r() * 10); continue; }
        let w = 14 + Math.floor(r() * 17);
        if (x + w > end) w = end - x;
        if (w < 10) break;
        const h = 128 - Math.floor(r() * 46), y = b - h;
        const c = PAL[Math.floor(r() * PAL.length)];
        s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${c}"/>`;
        if (r() < 0.7) s += `<rect x="${x}" y="${y + 10}" width="${w}" height="3" fill="#e9c46a" opacity=".75"/>`;
        if (r() < 0.5) s += `<rect x="${x}" y="${y + h - 14}" width="${w}" height="3" fill="#e9c46a" opacity=".6"/>`;
        if (r() < 0.3) s += `<rect x="${Math.round(x + w * 0.25)}" y="${Math.round(y + h * 0.38)}" width="${Math.round(w * 0.5)}" height="${Math.round(h * 0.2)}" rx="1" fill="#f5e6c8" opacity=".5"/>`;
        x += w + 1;
      }
      s += `<rect x="${start - 8}" y="${b}" width="${end - start + 16}" height="9" fill="url(#dvWood)"/><rect x="${start - 8}" y="${b + 9}" width="${end - start + 16}" height="14" fill="url(#dvShade)"/>`;
    }
  }

  // Deewar ko halka dim (kitabein peeche rahein, text saaf dikhe)
  s += `<path d="${wall}" fill-rule="evenodd" fill="rgba(10,5,20,.36)"/>`;

  // Khidki ka frame
  s += `<path d="M${WIN.x1} ${WIN.sill}V${WIN.spring}A${WIN.rad} ${WIN.rad} 0 0 1 ${WIN.x2} ${WIN.spring}V${WIN.sill}" fill="none" stroke="#8a5a2b" stroke-width="8"/>`
    + `<path d="M${WIN.x1 + 8} ${WIN.sill}V${WIN.spring}A${WIN.rad - 8} ${WIN.rad - 8} 0 0 1 ${WIN.x2 - 8} ${WIN.spring}V${WIN.sill}" fill="none" stroke="#f3c969" stroke-width="1.5" opacity=".45"/>`
    + `<path d="M600 34V${WIN.sill}M${WIN.x1} 330H${WIN.x2}" stroke="#6b3f1d" stroke-width="3" opacity=".85"/>`
    + `<rect x="${WIN.x1 - 12}" y="${WIN.sill}" width="${WIN.x2 - WIN.x1 + 24}" height="10" rx="2" fill="url(#dvWood)"/>`
    + `<rect x="0" y="0" width="8" height="640" fill="#2a1509"/><rect x="1192" y="0" width="8" height="640" fill="#2a1509"/>`;
  return s + `</svg>`;
}

function buildToran() {
  const cols = ["#ffd166", "#ff9f1c", "#ff5d8f", "#fff1b8"];
  let d = "M0 6", bulbs = "", n = 0;
  for (let i = 0; i < 4; i++) {
    const x0 = i * 300, x2 = x0 + 300, cx = x0 + 150, cy = 88, y0 = 6;
    d += `Q${cx} ${cy} ${x2} ${y0}`;
    for (let k = 1; k <= 6; k++) {
      const t = k / 7, m = 1 - t;
      const x = (m * m * x0 + 2 * m * t * cx + t * t * x2).toFixed(1);
      const y = (m * m * y0 + 2 * m * t * cy + t * t * y0).toFixed(1);
      const c = cols[n % 4];
      const dl = ((n * 0.37) % 3).toFixed(2);
      bulbs += `<circle cx="${x}" cy="${y}" r="9" fill="${c}" fill-opacity=".25" class="dv-bulb" style="animation-delay:-${dl}s"/><circle cx="${x}" cy="${y}" r="3.6" fill="${c}" class="dv-bulb" style="animation-delay:-${dl}s"/>`;
      n++;
    }
    if (i > 0) bulbs += `<circle cx="${x0}" cy="6" r="4" fill="#f59e0b"/>`;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 96" preserveAspectRatio="xMidYMin slice" style="width:100%;height:100%;display:block" aria-hidden="true"><path d="${d}" fill="none" stroke="#7a4a1e" stroke-width="1.6" opacity=".85"/>${bulbs}</svg>`;
}

const LIBRARY_SVG = buildLibrary();
const TORAN_SVG = buildToran();

/* ═══════════ Patakhe (canvas) ═══════════ */
function useFireworks(wrapRef, canvasRef, apiRef) {
  useEffect(() => {
    const wrap = wrapRef.current, cv = canvasRef.current;
    if (!wrap || !cv) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const small = () => window.innerWidth < 640;
    let dpr = 1, w = 0, h = 0, raf = 0, last = 0, nextAt = 0.6, visible = true;
    const rockets = [], sparks = [], flashes = [];

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, small() ? 1.5 : 2);
      const r = wrap.getBoundingClientRect();
      w = r.width; h = r.height;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const pickColor = () => PALETTE[(Math.random() * PALETTE.length) | 0];

    const explode = (x, y) => {
      const c = pickColor(), c2 = pickColor();
      const sm = small();
      const power = (sm ? 105 : 160) * (0.85 + Math.random() * 0.45);
      const roll = Math.random();
      flashes.push({ x, y, life: 1, c });

      if (roll < 0.5) {
        // Peony: gol fuvaara
        const n = sm ? 36 : 64;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + Math.random() * 0.12;
          const sp = power * (0.3 + Math.random() * 0.7);
          sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: 0.6 + Math.random() * 0.5, c: i % 3 === 0 ? c2 : c, g: 70, dr: 0.12, tl: 0.035 });
        }
      } else if (roll < 0.78) {
        // Double ring
        const n = sm ? 26 : 44;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2;
          sparks.push({ x, y, vx: Math.cos(a) * power, vy: Math.sin(a) * power, life: 1, decay: 0.75, c, g: 60, dr: 0.12, tl: 0.035 });
          if (i % 2 === 0) sparks.push({ x, y, vx: Math.cos(a) * power * 0.5, vy: Math.sin(a) * power * 0.5, life: 1, decay: 0.85, c: c2, g: 60, dr: 0.12, tl: 0.035 });
        }
      } else {
        // Willow: sunehri lambi jhadi
        const n = sm ? 28 : 48;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 + Math.random() * 0.2;
          const sp = power * 0.7 * (0.45 + Math.random() * 0.55);
          sparks.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, decay: 0.24 + Math.random() * 0.16, c: [255, 205, 100], g: 115, dr: 0.4, tl: 0.07 });
        }
      }
      const cap = sm ? 280 : 460;
      if (sparks.length > cap) sparks.splice(0, sparks.length - cap);
    };

    const launch = (tx, ty) => {
      const aimed = typeof tx === "number";
      rockets.push({
        x: aimed ? tx : w * (0.1 + Math.random() * 0.8),
        y: h * 0.96,
        ty: aimed ? ty : h * (0.1 + Math.random() * 0.32),
        vx: aimed ? 0 : (Math.random() - 0.5) * 22,
        v: Math.max(380, h * (aimed ? 1.35 : 0.95)),
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
        if (Math.random() < 0.3) setTimeout(launch, 240);
        nextAt = 0.8 + Math.random() * 1.2;
      }

      for (let i = rockets.length - 1; i >= 0; i--) {
        const rk = rockets[i];
        rk.y -= rk.v * dt; rk.x += rk.vx * dt;
        ctx.strokeStyle = "rgba(255,225,160,.85)";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(rk.x - rk.vx * 0.05, rk.y + 16); ctx.lineTo(rk.x, rk.y); ctx.stroke();
        ctx.fillStyle = "rgba(255,245,210,.95)";
        ctx.beginPath(); ctx.arc(rk.x, rk.y, 2.1, 0, 6.2832); ctx.fill();
        if (rk.y <= rk.ty) { explode(rk.x, rk.y); rockets.splice(i, 1); }
      }

      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.life -= dt * 4;
        if (f.life <= 0) { flashes.splice(i, 1); continue; }
        const rad = 70 * (1.15 - f.life * 0.5);
        const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, rad);
        g.addColorStop(0, `rgba(${f.c[0]},${f.c[1]},${f.c[2]},${0.55 * f.life})`);
        g.addColorStop(1, `rgba(${f.c[0]},${f.c[1]},${f.c[2]},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(f.x, f.y, rad, 0, 6.2832); ctx.fill();
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        const drag = Math.pow(s.dr, dt);
        s.vx *= drag; s.vy = s.vy * drag + s.g * dt;
        s.x += s.vx * dt; s.y += s.vy * dt;
        s.life -= s.decay * dt;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.strokeStyle = `rgba(${s.c[0]},${s.c[1]},${s.c[2]},${s.life})`;
        ctx.lineWidth = 1.1 + s.life * 1.4;
        ctx.beginPath(); ctx.moveTo(s.x - s.vx * s.tl, s.y - s.vy * s.tl); ctx.lineTo(s.x, s.y); ctx.stroke();
      }
    };

    const start = () => { if (!raf && visible && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const onVis = () => (document.hidden ? stop() : start());

    resize();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    ro && ro.observe(wrap);
    // Section screen se bahar ho ya tab hidden ho to animation ruk jaata hai (battery + speed).
    const io = typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(([e]) => { visible = e.isIntersecting; visible ? start() : stop(); })
      : null;
    io && io.observe(wrap);
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      stop(); ro && ro.disconnect(); io && io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      apiRef.current = null;
    };
  }, []); // eslint-disable-line
}

const CSS = `
.dv-sky{background:radial-gradient(120% 70% at 50% 108%,rgba(255,140,40,.34),transparent 60%),linear-gradient(180deg,#090516 0%,#170a2b 55%,#2a1036 100%)}
.dv-stars{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240'%3E%3Cg fill='white'%3E%3Ccircle cx='18' cy='26' r='1.1'/%3E%3Ccircle cx='96' cy='60' r='.8'/%3E%3Ccircle cx='170' cy='20' r='1.3'/%3E%3Ccircle cx='220' cy='110' r='.9'/%3E%3Ccircle cx='60' cy='140' r='1'/%3E%3Ccircle cx='140' cy='180' r='.8'/%3E%3Ccircle cx='30' cy='210' r='1.2'/%3E%3Ccircle cx='200' cy='214' r='.9'/%3E%3C/g%3E%3C/svg%3E");background-size:240px 240px;animation:dv-tw 4s ease-in-out infinite alternate}
.dv-stars.b{background-size:170px 170px;background-position:60px 40px;animation-duration:6s;animation-delay:-2s;opacity:.6}
@keyframes dv-tw{from{opacity:.3}to{opacity:1}}

.dv-lib{transform-origin:50% 70%;will-change:transform;animation:dv-kb 40s ease-in-out infinite alternate}
@keyframes dv-kb{from{transform:scale(1)}to{transform:scale(1.05)}}

.dv-lamp{position:absolute;top:18%;width:55%;height:80%;opacity:.8;animation:dv-lamp 3.8s ease-in-out infinite alternate}
.dv-lamp.l{left:-12%;background:radial-gradient(ellipse at 35% 55%,rgba(255,160,60,.3),transparent 62%)}
.dv-lamp.r{right:-12%;background:radial-gradient(ellipse at 65% 55%,rgba(255,160,60,.3),transparent 62%);animation-delay:-1.9s}
@keyframes dv-lamp{from{opacity:.55}to{opacity:1}}

.dv-rays{position:absolute;left:50%;top:0;width:70%;height:100%;transform:translateX(-50%);background:linear-gradient(180deg,rgba(255,196,110,.2),transparent 72%);clip-path:polygon(42% 0,58% 0,100% 100%,0 100%);animation:dv-ray 5s ease-in-out infinite alternate}
@keyframes dv-ray{from{opacity:.45}to{opacity:.95}}

.dv-bulb{animation:dv-bt 2.4s ease-in-out infinite alternate}
@keyframes dv-bt{from{opacity:.45}to{opacity:1}}

.dv-ember,.dv-lantern{position:absolute;bottom:-30px;opacity:0;will-change:transform,opacity;animation:dv-rise linear infinite}
.dv-ember{border-radius:50%;background:radial-gradient(circle,#ffe29a,#ff9a2e 60%,transparent 72%)}
.dv-lantern{width:16px;height:22px;border-radius:6px 6px 9px 9px;background:linear-gradient(#ffd27a,#ff8a1f);box-shadow:0 0 18px 6px rgba(255,150,40,.45)}
@keyframes dv-rise{0%{transform:translate3d(0,0,0) scale(1);opacity:0}15%{opacity:.9}100%{transform:translate3d(var(--dx),-380px,0) scale(.5);opacity:0}}

.dv-gold{background:linear-gradient(90deg,#fde68a,#f59e0b,#fff3c4,#f59e0b,#fde68a);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:dv-shine 6s linear infinite;filter:drop-shadow(0 0 14px rgba(255,170,50,.4))}
@keyframes dv-shine{to{background-position:200% center}}

.dv-chip{background:rgba(20,8,30,.45);border:1px solid rgba(252,211,77,.28);box-shadow:0 0 24px -6px rgba(255,170,50,.45)}
.dv-sub{text-shadow:0 2px 14px rgba(0,0,0,.7)}

.dv-cta{background:linear-gradient(90deg,#fcd34d,#f59e0b,#fde68a,#f59e0b);background-size:220% auto;color:#2a1205;box-shadow:0 8px 28px -6px rgba(245,158,11,.55),inset 0 1px 0 rgba(255,255,255,.5);transition:transform .25s ease,box-shadow .25s ease,background-position .6s ease}
.dv-cta:hover{transform:translateY(-2px) scale(1.04);background-position:100% 0;box-shadow:0 12px 34px -6px rgba(245,158,11,.7),inset 0 1px 0 rgba(255,255,255,.6)}
.dv-cta:active{transform:scale(.97)}

.dv-hint{opacity:0;animation:dv-hint 8s ease-in-out 1.6s forwards}
@keyframes dv-hint{0%{opacity:0;transform:translateY(6px)}12%{opacity:.85;transform:none}85%{opacity:.85}100%{opacity:0}}

.dv-diya{position:relative}
.dv-glow{position:absolute;left:50%;top:22%;width:260%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle,rgba(255,176,64,.5),rgba(255,120,30,.15) 40%,transparent 68%);opacity:0;animation:dv-gi .9s ease-out both var(--d),dv-pu 2.4s ease-in-out infinite calc(var(--d) + .9s)}
@keyframes dv-gi{to{opacity:.9}}
@keyframes dv-pu{0%,100%{opacity:.7}50%{opacity:1}}
.dv-ign,.dv-flk{transform-box:fill-box;transform-origin:50% 100%}
.dv-ign{transform:scale(0);animation:dv-ig .7s cubic-bezier(.2,1.3,.4,1) both var(--d)}
@keyframes dv-ig{to{transform:scale(1)}}
.dv-flk{animation:dv-fl 1.3s ease-in-out infinite calc(var(--d) + .7s)}
@keyframes dv-fl{0%,100%{transform:scale(1,1) skewX(0)}25%{transform:scale(.94,1.08) skewX(-3deg)}50%{transform:scale(1.05,.95) skewX(2deg)}75%{transform:scale(.97,1.05) skewX(-1.5deg)}}

@media (prefers-reduced-motion:reduce){
  .dv-stars,.dv-gold,.dv-glow,.dv-ign,.dv-flk,.dv-lib,.dv-lamp,.dv-rays,.dv-bulb,.dv-hint{animation:none!important}
  .dv-ign{transform:none}.dv-glow{opacity:.8}.dv-ember,.dv-lantern{display:none}.dv-hint{opacity:.8}
}
`;

const EASE = [0.16, 1, 0.3, 1];

export default function HeroSection({ isDark = false, lang = "EN" }) {
  const t = dict[lang] || dict.EN;
  const wrapRef = useRef(null), canvasRef = useRef(null), apiRef = useRef(null);
  useFireworks(wrapRef, canvasRef, apiRef);

  const onTap = (e) => {
    if (e.target.closest && e.target.closest("a,button")) return; // button dabane par patakha nahi
    const api = apiRef.current;
    if (!api || !wrapRef.current) return;
    const r = wrapRef.current.getBoundingClientRect();
    api.launch(e.clientX - r.left, e.clientY - r.top);
  };
  const pageBg = isDark ? "#07070d" : "#f8fafc"; // neeche ka fade aapke page ke rang me mil jaata hai

  return (
    <section
      ref={wrapRef}
      onPointerDown={onTap}
      style={{ touchAction: "manipulation" }}
      className="dv-sky relative overflow-hidden flex flex-col items-center justify-center text-center px-4 pt-12 pb-20 md:pt-14 md:pb-24 min-h-[360px] md:min-h-[420px]"
    >
      <style>{CSS}</style>

      {/* Diye ke gradients ek hi baar define (0 size svg) */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="dvBowl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e2691f" /><stop offset="1" stopColor="#7c2d12" /></linearGradient>
          <linearGradient id="dvFlame" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff7a18" /><stop offset=".6" stopColor="#ffc233" /><stop offset="1" stopColor="#fff3b0" /></linearGradient>
        </defs>
      </svg>

      {/* Taare (khidki ke peeche se dikhte hain) */}
      <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <div className="dv-stars" />
        <div className="dv-stars b" />
      </div>

      {/* Book library + khidki + chaand */}
      <div className="dv-lib absolute inset-0 pointer-events-none z-[2]" aria-hidden="true" dangerouslySetInnerHTML={{ __html: LIBRARY_SVG }} />

      {/* Garam roshni: lamp glow, khidki ki kirnein, text ke peeche halka andhera */}
      <div className="absolute inset-0 pointer-events-none z-[3]" aria-hidden="true">
        <div className="dv-lamp l" />
        <div className="dv-lamp r" />
        <div className="dv-rays" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 48% at 50% 46%,rgba(9,5,22,.72),transparent 100%)" }} />
      </div>

      {/* Patakhe */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-[4]" aria-hidden="true" />

      {/* Toran: jagmagati diwali lights */}
      <div className="absolute top-0 inset-x-0 h-10 md:h-16 pointer-events-none z-[5]" aria-hidden="true" dangerouslySetInnerHTML={{ __html: TORAN_SVG }} />

      {/* Urte angaare + aakash kandil */}
      <div className="absolute inset-0 pointer-events-none z-[5]" aria-hidden="true">
        {EMBERS.map((p, k) => (
          <span key={k} className="dv-ember" style={{ left: p.l, width: p.s, height: p.s, animationDuration: p.t, animationDelay: p.d, "--dx": p.x }} />
        ))}
        {LANTERNS.map((p, k) => (
          <span key={k} className={`dv-lantern ${p.m ? "hidden md:block" : ""}`} style={{ left: p.l, animationDuration: p.t, animationDelay: p.d, "--dx": p.x }} />
        ))}
      </div>

      {/* Neeche page ke rang me fade */}
      <div className="absolute bottom-0 inset-x-0 h-10 pointer-events-none z-[6]" style={{ background: `linear-gradient(to bottom, transparent, ${pageBg})` }} />

      {/* Diye */}
      <div className="absolute bottom-3 md:bottom-5 inset-x-0 px-3 md:px-10 flex justify-around items-end pointer-events-none z-[7]" aria-hidden="true">
        {DIYAS.map((d) => (
          <div key={d.i} className={`dv-diya w-8 sm:w-10 md:w-12 lg:w-14 ${d.mobileHidden ? "hidden md:block" : ""}`} style={{ "--d": `${d.delay}s` }}>
            <span className="dv-glow" />
            <svg viewBox="0 0 64 56" className="relative block w-full h-auto">
              <path d="M4 24C8 46 22 52 32 52S56 46 60 24C48 30 16 30 4 24Z" fill="url(#dvBowl)" />
              <path d="M12 34Q32 44 52 34" fill="none" stroke="#ffd48a" strokeWidth="1.2" opacity=".55" strokeLinecap="round" />
              <circle cx="22" cy="40" r="1.2" fill="#ffd48a" opacity=".55" /><circle cx="32" cy="44" r="1.2" fill="#ffd48a" opacity=".55" /><circle cx="42" cy="40" r="1.2" fill="#ffd48a" opacity=".55" />
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
        transition={{ duration: 0.6, ease: EASE }}
        className="dv-chip relative z-10 mb-3 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm md:text-base tracking-wide text-amber-200"
      >
        🪔 {t.greet} 🪔
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
        className="relative z-10 font-cinzel text-[1.75rem] leading-tight sm:text-4xl md:text-5xl lg:text-6xl font-black mb-3 max-w-5xl mx-auto"
      >
        <span className="dv-gold">{t.title}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
        className="dv-sub relative z-10 max-w-xl mx-auto text-sm md:text-base px-2 leading-relaxed font-medium text-amber-50/90"
      >
        {t.sub}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
        className="relative z-10 mt-5 flex flex-col items-center gap-2"
      >
        <Link href="/explore" className="dv-cta inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm md:text-base font-bold">
          📚 {t.cta}
        </Link>
        <span className="dv-hint text-[11px] md:text-xs text-amber-100/70 tracking-wide">{t.hint}</span>
      </motion.div>
    </section>
  );
}
