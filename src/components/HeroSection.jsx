// @ts-nocheck
"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// Save as: src/components/HeroSection.jsx
// "Moonlit Lotus Pond" - calm, fully-3D hero (pure CSS 3D + SVG: 0 images, 0 audio, 0 canvas, 0 new packages)
// Section ki height / padding bilkul pehle jaisi hai (min-h + pt/pb same), sirf andar ka scene naya hai.
//
// 3D kaise bana hai:
//  - Poora scene ek perspective "stage" me hai; har layer (taare, chand, pahaad, dhund, paani, kamal) alag depth (translateZ) par hai
//  - Desktop par mouse hilane se camera halka sa ghoomta hai (real parallax), mobile par camera khud dheere dheere sway karta hai
//  - Kamal ke har petal ka real 3D transform hai (rotateY + rotateX), load par khilta hai aur phir dheere ghoomta hai
//  - Chand ke aas-paas 3D orbit rings hain jo chand ke aage-peeche se guzarti hain
//  - Screen par tap/click karne par paani jaisi shaant ripple banti hai

const dict = {
  EN: {
    greet: "Peace begins within",
    title: "Awaken Your Consciousness",
    sub: "100% original, verified digital books on spirituality & psychology.",
  },
  HI: {
    greet: "शांति भीतर से शुरू होती है",
    title: "अपनी चेतना को जागृत करें",
    sub: "आध्यात्मिकता और मनोविज्ञान पर 100% मूल, सत्यापित डिजिटल पुस्तकें।",
  },
};

/* ═══════════ 3D Lotus data ═══════════ */
// 3 rings of petals: bahar wali zyada khuli, andar wali zyada band
const RINGS = [
  { n: 8, o: 72, pw: 0.36, ph: 0.5, off: 22.5, tone: "o", sp: 80, rev: false, dl: 0 },
  { n: 8, o: 48, pw: 0.32, ph: 0.47, off: 0, tone: "m", sp: 100, rev: true, dl: 0.35 },
  { n: 6, o: 26, pw: 0.27, ph: 0.4, off: 30, tone: "i", sp: 120, rev: false, dl: 0.7 },
];

// left = % of scene layer (scene layer section se 16% chaudi hai, isliye values adjust ki hain)
// hide = mobile par chhupa rahega (sirf md+ par dikhega)
const LOTUSES = [
  { k: "o1", size: "sr-xs", left: "19%", bl: 1.9, bd: "-2s", hide: true },
  { k: "m1", size: "sr-sm", left: "32.8%", bl: 1.3, bd: "-4.5s" },
  { k: "c", size: "sr-lg", left: "50%", bl: 0.5, bd: "0s" },
  { k: "m2", size: "sr-sm", left: "67.2%", bl: 1.3, bd: "-1s" },
  { k: "o2", size: "sr-xs", left: "81%", bl: 1.9, bd: "-6s", hide: true },
];

// Soft floating light motes (fireflies) - slow & sparse
const MOTES = [
  { l: "11%", b: "20%", s: 6, t: "17s", d: "-3s", x: "16px", c: "253,230,138" },
  { l: "24%", b: "30%", s: 8, t: "21s", d: "-9s", x: "-14px", c: "199,210,254" },
  { l: "38%", b: "16%", s: 5, t: "15s", d: "-6s", x: "12px", c: "153,246,228" },
  { l: "57%", b: "26%", s: 7, t: "19s", d: "-2s", x: "-18px", c: "253,230,138" },
  { l: "69%", b: "18%", s: 5, t: "16s", d: "-11s", x: "14px", c: "249,168,212" },
  { l: "82%", b: "28%", s: 8, t: "22s", d: "-7s", x: "-12px", c: "199,210,254" },
  { l: "92%", b: "20%", s: 5, t: "18s", d: "-4s", x: "10px", c: "153,246,228" },
];

// Paani par halki chamak ki lakeerein
const SPARKS = [
  { l: "16%", w: "14%", t: "28%", d: "0s" },
  { l: "60%", w: "18%", t: "42%", d: "-2s" },
  { l: "34%", w: "10%", t: "62%", d: "-3.5s" },
  { l: "74%", w: "12%", t: "74%", d: "-1s" },
  { l: "8%", w: "9%", t: "82%", d: "-4s" },
];

/* ═══════════ Pure SVG misty mountain ridges (0 network requests) ═══════════ */
function ridgePath(base, amp, f, ph, sharp, f2, a2, ph2) {
  let d = "M0 400";
  for (let x = 0; x <= 1200; x += 10) {
    const s = Math.sin(x * f + ph);
    const p = sharp ? 1 - Math.abs(s) : 0.5 + 0.5 * s;
    const y = base - amp * p - a2 * Math.sin(x * f2 + ph2);
    d += ` L${x} ${Math.round(y * 10) / 10}`;
  }
  return d + " L1200 400Z";
}

function mountainSVG(id, d, top, bottom, stroke) {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">` +
    `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs>` +
    `<path d="${d}" fill="url(#${id})"${stroke ? ` stroke="${stroke}" stroke-width="1.2" vector-effect="non-scaling-stroke"` : ""}/></svg>`
  );
}

// Beech me ghati (valley) rakhi hai taaki chand aur kamal saaf dikhein
const FAR_SVG = mountainSVG(
  "srFar",
  ridgePath(246, 86, 0.0085, 2.754, true, 0.031, 6, 0.5),
  "#5457b0",
  "#2b3070",
  "rgba(199,210,254,.30)"
);
const MID_SVG = mountainSVG(
  "srMid",
  ridgePath(288, 54, 0.0125, 3.496, false, 0.037, 5, 1.3),
  "#333a8c",
  "#1b2160",
  "rgba(165,180,252,.20)"
);
const NEAR_SVG = mountainSVG(
  "srNear",
  ridgePath(312, 26, 0.018, 0.196, false, 0.05, 3, 2.1),
  "#1b2158",
  "#0c1033",
  ""
);

/* ═══════════ One 3D lotus (CSS 3D petals) ═══════════ */
function Lotus({ size, left, bl, bd, hide }) {
  return (
    <div className={`sr-lotus ${size} ${hide ? "hidden md:block" : ""}`} style={{ left, "--bd": bd }}>
      <span className="sr-aura" />
      <span className="sr-refl" />
      <span className="sr-rip" />
      <span className="sr-rip sr-rip2" />
      <div className="sr-bob">
        <div className="sr-bloom">
          <span className="sr-pad" />
          {RINGS.map((r, ri) => (
            <div
              key={ri}
              className={`sr-ring sr-t-${r.tone}`}
              style={{ "--sp": `${r.sp}s`, "--dr": r.rev ? "reverse" : "normal", "--dl": `${bl + r.dl}s` }}
            >
              {Array.from({ length: r.n }).map((_, k) => (
                <i
                  key={k}
                  className="sr-p"
                  style={{
                    "--a": `${r.off + (k * 360) / r.n}deg`,
                    "--o": `${r.o}deg`,
                    "--pw": r.pw,
                    "--ph": r.ph,
                  }}
                />
              ))}
            </div>
          ))}
          <span className="sr-core" />
        </div>
      </div>
    </div>
  );
}

const CSS = `
/* ── Sky ── */
.sr-sky{
  background:
    radial-gradient(90% 55% at 50% 104%,rgba(167,139,250,.34),transparent 68%),
    radial-gradient(50% 42% at 18% 30%,rgba(45,212,191,.10),transparent 72%),
    radial-gradient(46% 40% at 84% 24%,rgba(244,114,182,.09),transparent 72%),
    linear-gradient(180deg,#050816 0%,#0a1034 36%,#18205a 64%,#2f3280 86%,#473f8f 100%);
}

/* ── 3D stage: perspective + camera ── */
.sr-stage{
  position:absolute;inset:0;
  perspective:900px;perspective-origin:50% 62%;
  --md:92px;--wh:62px;
}
@media (min-width:640px){.sr-stage{--md:112px;--wh:74px}}
@media (min-width:768px){.sr-stage{--md:160px;--wh:112px}}
@media (min-width:1024px){.sr-stage{--md:190px;--wh:118px}}

.sr-world{
  position:absolute;inset:0;
  transform-style:preserve-3d;transform-origin:50% 62%;
  transform:rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg));
  transition:transform .6s cubic-bezier(.2,.8,.2,1);
  will-change:transform;
}
.sr-drift{
  position:absolute;inset:0;
  transform-style:preserve-3d;transform-origin:50% 62%;
  animation:sr-cam 20s ease-in-out infinite alternate;
}
@keyframes sr-cam{
  from{transform:rotateY(-1.6deg) rotateX(.6deg)}
  to{transform:rotateY(1.6deg) rotateX(-.6deg)}
}

/* Har layer apni depth par; scale = (900 + depth) / 900 taaki size same dikhe, sirf parallax mile */
.sr-layer{position:absolute;left:-8%;right:-8%;top:-3%;bottom:0;transform-origin:50% 62%}
.sr-layer svg{display:block;width:100%;height:100%}
.sr-z420{transform:translateZ(-420px) scale(1.4667)}
.sr-z360{transform:translateZ(-360px) scale(1.4)}
.sr-z300{transform:translateZ(-300px) scale(1.3333)}
.sr-z280{transform:translateZ(-280px) scale(1.3111)}
.sr-z240{transform:translateZ(-240px) scale(1.2667)}
.sr-z200{transform:translateZ(-200px) scale(1.2222)}
.sr-z160{transform:translateZ(-160px) scale(1.1778)}
.sr-z120{transform:translateZ(-120px) scale(1.1333)}
.sr-z90{transform:translateZ(-90px) scale(1.1)}
.sr-z40{transform:translateZ(-40px) scale(1.0444)}
.sr-z0{transform:translateZ(1px)}
.sr-zp90{transform:translateZ(90px) scale(.9)}

/* ── Stars (2 depths, very slow twinkle) ── */
.sr-stars{
  opacity:.8;
  -webkit-mask-image:linear-gradient(180deg,#000 30%,transparent 80%);
  mask-image:linear-gradient(180deg,#000 30%,transparent 80%);
}
.sr-stars.a{
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='260'%3E%3Cg fill='%23f5f3ff'%3E%3Ccircle cx='22' cy='30' r='1.2'/%3E%3Ccircle cx='118' cy='72' r='.9'/%3E%3Ccircle cx='205' cy='24' r='1.3'/%3E%3Ccircle cx='70' cy='168' r='1'/%3E%3Ccircle cx='168' cy='214' r='.9'/%3E%3Ccircle cx='240' cy='150' r='1.1'/%3E%3C/g%3E%3Cg fill='%23c7d2fe'%3E%3Ccircle cx='150' cy='120' r='.7'/%3E%3Ccircle cx='36' cy='226' r='.8'/%3E%3C/g%3E%3C/svg%3E");
  background-size:260px 260px;
  animation:sr-tw 7s ease-in-out infinite alternate;
}
.sr-stars.b{
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cg fill='%23e0e7ff'%3E%3Ccircle cx='14' cy='40' r='.8'/%3E%3Ccircle cx='92' cy='16' r='1'/%3E%3Ccircle cx='150' cy='88' r='.8'/%3E%3Ccircle cx='60' cy='120' r='.7'/%3E%3C/g%3E%3Cg fill='%23fde68a'%3E%3Ccircle cx='120' cy='160' r='.9'/%3E%3C/g%3E%3Cg fill='%23fbcfe8'%3E%3Ccircle cx='30' cy='150' r='.8'/%3E%3C/g%3E%3C/svg%3E");
  background-size:180px 180px;background-position:60px 40px;
  animation:sr-tw 11s ease-in-out infinite alternate-reverse;
}
@keyframes sr-tw{from{opacity:.35}to{opacity:.95}}

/* ── Moon (3D sphere) + halo + orbit rings ── */
.sr-mp{position:absolute;left:50%;top:40%;width:0;height:0;transform-style:preserve-3d;perspective:720px}
.sr-halo{
  position:absolute;
  left:calc(var(--md)*-1.5);top:calc(var(--md)*-1.5);
  width:calc(var(--md)*3);height:calc(var(--md)*3);
  border-radius:50%;
  background:radial-gradient(circle,rgba(165,180,252,.42) 0%,rgba(129,140,248,.15) 36%,transparent 66%);
  transform:translateZ(-2px);
  animation:sr-breathe 9s ease-in-out infinite alternate;
}
@keyframes sr-breathe{from{opacity:.62}to{opacity:1}}
.sr-moon{
  position:absolute;
  left:calc(var(--md)/-2);top:calc(var(--md)/-2);
  width:var(--md);height:var(--md);
  border-radius:50%;
  background:
    radial-gradient(circle at 63% 67%,rgba(30,27,75,.34) 0 9%,transparent 10%),
    radial-gradient(circle at 38% 55%,rgba(30,27,75,.26) 0 6%,transparent 7%),
    radial-gradient(circle at 71% 36%,rgba(30,27,75,.22) 0 5%,transparent 6%),
    radial-gradient(circle at 33% 29%,#f5f3ff 0%,#c7d2fe 22%,#8b94f5 50%,#4f46c8 76%,#241f6b 100%);
  box-shadow:
    inset calc(var(--md)*-.12) calc(var(--md)*-.16) calc(var(--md)*.34) rgba(15,10,60,.62),
    0 0 calc(var(--md)*.5) rgba(165,180,252,.5);
}
.sr-orb{
  position:absolute;
  left:calc(var(--r)/-2);top:calc(var(--r)/-2);
  width:var(--r);height:var(--r);
  border-radius:50%;
  border:1.5px solid rgba(199,210,254,.34);
  border-top-color:rgba(253,230,138,.95);
  transform:rotateX(var(--tx)) rotateY(var(--ty));
  animation:sr-orbit var(--os) linear infinite var(--od);
}
.sr-orb.a{--r:calc(var(--md)*1.85);--os:46s;--od:normal;--tx:72deg;--ty:-12deg}
.sr-orb.b{
  --r:calc(var(--md)*2.5);--os:70s;--od:reverse;--tx:76deg;--ty:14deg;
  border-color:rgba(251,207,232,.28);border-top-color:rgba(251,207,232,.9);
}
@keyframes sr-orbit{
  from{transform:rotateX(var(--tx)) rotateY(var(--ty)) rotateZ(0deg)}
  to{transform:rotateX(var(--tx)) rotateY(var(--ty)) rotateZ(360deg)}
}

/* ── Moonbeam ── */
.sr-beam{
  position:absolute;left:50%;top:0;width:70%;height:100%;
  transform:translateX(-50%);
  background:radial-gradient(ellipse 50% 78% at 50% 34%,rgba(199,210,254,.20),rgba(165,180,252,.06) 55%,transparent 78%);
  animation:sr-breathe 8s ease-in-out infinite alternate;
}

/* ── Mist (seamless slow drift) ── */
.sr-mist{
  position:absolute;left:0;width:200%;
  background:radial-gradient(ellipse 50% 100% at 50% 100%,rgba(186,200,255,.24),transparent 72%) repeat-x;
  background-size:25% 100%;
  animation:sr-slide 90s linear infinite;
}
.sr-mist.m1{bottom:29%;height:22%}
.sr-mist.m2{bottom:19%;height:18%;background-size:12.5% 100%;animation-duration:70s;animation-direction:reverse}
@keyframes sr-slide{to{transform:translateX(-50%)}}

/* ── Water ── */
.sr-water{
  position:absolute;left:0;right:0;bottom:0;height:var(--wh);
  background:linear-gradient(180deg,rgba(60,62,140,0) 0%,#252c78 5%,#161d5a 38%,#0a0f33 100%);
  box-shadow:0 -10px 26px -6px rgba(129,140,248,.35);
}
.sr-water::before{
  content:"";position:absolute;left:0;right:0;top:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(224,231,255,.5) 50%,transparent);
}
.sr-reflect{
  position:absolute;left:50%;top:0;width:calc(var(--md)*.55);height:100%;
  transform:translateX(-50%);
  background:radial-gradient(ellipse 50% 90% at 50% 0%,rgba(199,210,254,.5),rgba(165,180,252,.14) 55%,transparent 80%);
  animation:sr-breathe 6s ease-in-out infinite alternate;
}
.sr-spark{
  position:absolute;height:1px;
  background:linear-gradient(90deg,transparent,rgba(224,231,255,.7),transparent);
  animation:sr-spark 5s ease-in-out infinite alternate;
}
@keyframes sr-spark{from{opacity:.05;transform:translateX(-10px)}to{opacity:.7;transform:translateX(10px)}}

/* ── Lotus (real 3D petals) ── */
.sr-lotus{
  position:absolute;
  bottom:var(--lb);
  width:var(--w);height:calc(var(--w)*.8);
  margin-left:calc(var(--w)/-2);
}
.sr-lg{--w:46px;--lb:16px}
.sr-sm{--w:34px;--lb:14px}
.sr-xs{--w:40px;--lb:16px}
@media (min-width:640px){.sr-lg{--w:58px;--lb:20px}.sr-sm{--w:44px;--lb:18px}}
@media (min-width:768px){.sr-lg{--w:86px;--lb:28px}.sr-sm{--w:66px;--lb:24px}.sr-xs{--w:46px;--lb:22px}}
@media (min-width:1024px){.sr-lg{--w:102px;--lb:32px}.sr-sm{--w:78px;--lb:28px}.sr-xs{--w:54px;--lb:24px}}

.sr-aura{
  position:absolute;left:50%;bottom:calc(var(--w)*-.1);
  width:calc(var(--w)*2.6);height:calc(var(--w)*1.5);margin-left:calc(var(--w)*-1.3);
  background:radial-gradient(ellipse 50% 50% at 50% 55%,rgba(249,168,212,.42),rgba(167,139,250,.16) 50%,transparent 72%);
  animation:sr-breathe 7s ease-in-out infinite alternate var(--bd);
}
.sr-refl{
  position:absolute;left:50%;bottom:calc(var(--w)*-.38);
  width:calc(var(--w)*1.5);height:calc(var(--w)*.34);margin-left:calc(var(--w)*-.75);
  background:radial-gradient(ellipse 50% 50% at 50% 40%,rgba(249,168,212,.30),transparent 72%);
}
.sr-rip{
  position:absolute;left:50%;bottom:calc(var(--w)*-.12);
  width:calc(var(--w)*2.2);height:calc(var(--w)*.55);margin-left:calc(var(--w)*-1.1);
  border-radius:50%;border:1px solid rgba(224,231,255,.38);
  opacity:0;
  animation:sr-ripple 7s ease-out infinite var(--bd);
}
.sr-rip2{animation-delay:calc(var(--bd) - 3.5s)}
@keyframes sr-ripple{
  0%{transform:scale(.25);opacity:0}
  15%{opacity:.7}
  100%{transform:scale(1.15);opacity:0}
}
.sr-bob{
  position:absolute;inset:0;
  perspective:calc(var(--w)*3.2);perspective-origin:50% -25%;
  animation:sr-bob 8s ease-in-out infinite alternate var(--bd);
}
@keyframes sr-bob{from{transform:translateY(0)}to{transform:translateY(-3px)}}
.sr-bloom{
  position:absolute;left:50%;bottom:calc(var(--w)*.16);width:0;height:0;
  transform-style:preserve-3d;
  transform:rotateX(-14deg);
  animation:sr-sway 9s ease-in-out infinite alternate var(--bd);
}
@keyframes sr-sway{
  from{transform:rotateX(-12deg) rotateZ(-1.2deg)}
  to{transform:rotateX(-18deg) rotateZ(1.2deg)}
}
.sr-pad{
  position:absolute;
  left:calc(var(--w)*-.64);bottom:calc(var(--w)*-.64);
  width:calc(var(--w)*1.28);height:calc(var(--w)*1.28);
  border-radius:50%;
  transform:rotateX(90deg);
  background:radial-gradient(circle,#1fb5a5 0%,#0e7c76 38%,#0a4f58 68%,#0a3040 100%);
  box-shadow:inset 0 0 calc(var(--w)*.12) rgba(3,20,30,.7);
  -webkit-mask:conic-gradient(from 60deg,transparent 0 24deg,#000 24deg);
  mask:conic-gradient(from 60deg,transparent 0 24deg,#000 24deg);
}
.sr-ring{
  position:absolute;left:0;bottom:0;width:0;height:0;
  transform-style:preserve-3d;
  animation:sr-spin var(--sp) linear infinite var(--dr);
}
@keyframes sr-spin{to{transform:rotateY(360deg)}}
.sr-p{
  position:absolute;
  left:calc(var(--w)*var(--pw)/-2);bottom:0;
  width:calc(var(--w)*var(--pw));height:calc(var(--w)*var(--ph));
  transform-origin:50% 100%;
  transform:rotateY(var(--a)) rotateX(var(--o));
  border-radius:50% 50% 46% 46%/82% 82% 18% 18%;
  box-shadow:inset 0 0 calc(var(--w)*.1) rgba(190,24,93,.28);
  animation:sr-open 3.2s cubic-bezier(.2,.9,.25,1) var(--dl) both;
}
@keyframes sr-open{
  from{transform:rotateY(var(--a)) rotateX(4deg)}
  to{transform:rotateY(var(--a)) rotateX(var(--o))}
}
.sr-t-o .sr-p{background:linear-gradient(90deg,transparent 47%,rgba(255,255,255,.38) 50%,transparent 53%),linear-gradient(0deg,#fff0f6 0%,#f8b4d2 42%,#ea7fae 100%)}
.sr-t-m .sr-p{background:linear-gradient(90deg,transparent 47%,rgba(255,255,255,.38) 50%,transparent 53%),linear-gradient(0deg,#fff8fb 0%,#fbd0e3 46%,#f4a6c8 100%)}
.sr-t-i .sr-p{background:linear-gradient(90deg,transparent 47%,rgba(255,255,255,.45) 50%,transparent 53%),linear-gradient(0deg,#fff9df 0%,#fff0f6 40%,#fcc8de 100%)}
.sr-core{
  position:absolute;
  left:calc(var(--w)*-.085);bottom:calc(var(--w)*.02);
  width:calc(var(--w)*.17);height:calc(var(--w)*.17);
  border-radius:50%;
  transform:translateY(calc(var(--w)*-.08)) translateZ(calc(var(--w)*.04));
  background:radial-gradient(circle at 38% 32%,#fffbe0,#fcd34d 52%,#b45309);
  box-shadow:0 0 calc(var(--w)*.3) calc(var(--w)*.06) rgba(253,224,71,.6);
}

/* ── Fireflies ── */
.sr-mote{
  position:absolute;border-radius:50%;opacity:0;
  background:radial-gradient(circle,rgba(var(--mc),.95) 0%,rgba(var(--mc),.35) 42%,transparent 70%);
  animation:sr-float linear infinite;
}
@keyframes sr-float{
  0%{transform:translate3d(0,0,0) scale(.7);opacity:0}
  18%{opacity:.95}
  55%{transform:translate3d(var(--dx),-48px,0) scale(1.1);opacity:.85}
  100%{transform:translate3d(calc(var(--dx)*-.7),-110px,0) scale(.8);opacity:0}
}

/* ── Tap ripple ── */
.sr-tap{
  position:absolute;width:16px;height:16px;margin:-8px 0 0 -8px;
  border-radius:50%;
  border:1.5px solid rgba(224,231,255,.8);
  box-shadow:0 0 18px rgba(165,180,252,.6),inset 0 0 12px rgba(199,210,254,.35);
  animation:sr-tap 1.9s cubic-bezier(.16,1,.3,1) both;
}
@keyframes sr-tap{from{transform:scale(.3);opacity:.9}to{transform:scale(9);opacity:0}}

/* ── Text styling ── */
.sr-chip{
  background:linear-gradient(135deg,rgba(24,32,90,.62),rgba(12,16,52,.78));
  border:1px solid rgba(199,210,254,.28);
  box-shadow:0 6px 22px -6px rgba(129,140,248,.45),inset 0 1px 0 rgba(255,255,255,.14);
}
.sr-dot{width:5px;height:5px;border-radius:9999px;background:#f9a8d4;box-shadow:0 0 8px rgba(249,168,212,.9)}
.sr-h1{filter:drop-shadow(0 2px 0 rgba(23,20,80,.9)) drop-shadow(0 8px 20px rgba(2,4,20,.6))}
.sr-title{
  display:inline-block;
  background:linear-gradient(180deg,#ffffff 0%,#e4e9ff 40%,#c9bdff 78%,#f6c6df 100%);
  -webkit-background-clip:text;background-clip:text;color:transparent;
}
.sr-sub{text-shadow:0 2px 12px rgba(5,8,26,.95)}

@media (prefers-reduced-motion:reduce){
  .sr-drift,.sr-stars,.sr-halo,.sr-orb,.sr-beam,.sr-mist,.sr-reflect,.sr-spark,
  .sr-aura,.sr-rip,.sr-bob,.sr-bloom,.sr-ring,.sr-p,.sr-mote{animation:none!important}
  .sr-world{transition:none}
  .sr-mote,.sr-rip{display:none}
}
`;

const EASE = [0.16, 1, 0.3, 1];

export default function HeroSection({ isDark = true, lang = "EN" }) {
  const t = dict[lang] || dict.EN;
  const wrapRef = useRef(null);
  const worldRef = useRef(null);
  const rafRef = useRef(0);
  const posRef = useRef(null);
  const idRef = useRef(0);
  const [ripples, setRipples] = useState([]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  // Desktop: mouse ke saath camera halka sa ghoomta hai (3D parallax)
  const onMove = (e) => {
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = wrapRef.current;
    if (!el || !worldRef.current) return;
    const r = el.getBoundingClientRect();
    posRef.current = {
      nx: ((e.clientX - r.left) / r.width) * 2 - 1,
      ny: ((e.clientY - r.top) / r.height) * 2 - 1,
    };
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0;
        const p = posRef.current;
        const w = worldRef.current;
        if (!p || !w) return;
        w.style.setProperty("--ry", `${(p.nx * 3.4).toFixed(2)}deg`);
        w.style.setProperty("--rx", `${(-p.ny * 1.8).toFixed(2)}deg`);
      });
    }
  };

  const onLeave = () => {
    posRef.current = null;
    const w = worldRef.current;
    if (!w) return;
    w.style.setProperty("--ry", "0deg");
    w.style.setProperty("--rx", "0deg");
  };

  // Tap / click: paani jaisi shaant ripple
  const onTap = (e) => {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const id = ++idRef.current;
    setRipples((a) => [...a.slice(-3), { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
  };

  const pageBg = isDark ? "#07070d" : "#f8fafc";

  return (
    <section
      ref={wrapRef}
      onPointerDown={onTap}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ touchAction: "manipulation" }}
      className="sr-sky relative overflow-hidden flex flex-col items-center justify-center text-center px-3 pt-5 pb-11 sm:pt-8 sm:pb-14 md:pt-12 md:pb-20 min-h-[190px] sm:min-h-[240px] md:min-h-[340px] lg:min-h-[380px] select-none"
    >
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* ═══ 3D stage: har layer alag depth par ═══ */}
      <div className="sr-stage pointer-events-none z-[2]" aria-hidden="true">
        <div ref={worldRef} className="sr-world">
          <div className="sr-drift">
            {/* Stars */}
            <div className="sr-layer sr-z420 sr-stars a" />
            <div className="sr-layer sr-z360 sr-stars b" />

            {/* Moon sphere + halo + 3D orbit rings */}
            <div className="sr-layer sr-z300 sr-moonlayer">
              <div className="sr-mp">
                <span className="sr-halo" />
                <span className="sr-moon" />
                <span className="sr-orb a" />
                <span className="sr-orb b" />
              </div>
            </div>

            {/* Moonbeam */}
            <div className="sr-layer sr-z280">
              <div className="sr-beam" />
            </div>

            {/* Far ridge -> mist -> mid ridge -> mist -> near hills */}
            <div className="sr-layer sr-z240" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: FAR_SVG }} />
            <div className="sr-layer sr-z200">
              <div className="sr-mist m1" />
            </div>
            <div className="sr-layer sr-z160" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: MID_SVG }} />
            <div className="sr-layer sr-z120">
              <div className="sr-mist m2" />
            </div>
            <div className="sr-layer sr-z90" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: NEAR_SVG }} />

            {/* Still water + moon reflection */}
            <div className="sr-layer sr-z40">
              <div className="sr-water">
                <span className="sr-reflect" />
                {SPARKS.map((s, i) => (
                  <span key={i} className="sr-spark" style={{ left: s.l, width: s.w, top: s.t, animationDelay: s.d }} />
                ))}
              </div>
            </div>

            {/* 3D Lotuses floating on the water */}
            <div className="sr-layer sr-z0">
              {LOTUSES.map((l) => (
                <Lotus key={l.k} size={l.size} left={l.left} bl={l.bl} bd={l.bd} hide={l.hide} />
              ))}
            </div>

            {/* Fireflies (closest layer = most parallax) */}
            <div className="sr-layer sr-zp90">
              {MOTES.map((m, i) => (
                <span
                  key={i}
                  className="sr-mote"
                  style={{
                    left: m.l,
                    bottom: m.b,
                    width: m.s,
                    height: m.s,
                    animationDuration: m.t,
                    animationDelay: m.d,
                    "--dx": m.x,
                    "--mc": m.c,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Soft text-contrast backdrop */}
      <div
        className="absolute inset-0 pointer-events-none z-[3]"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 46%,rgba(5,8,26,.6),rgba(5,8,26,.26) 64%,transparent 100%)",
        }}
      />

      {/* Tap ripples */}
      <div className="absolute inset-0 pointer-events-none z-[5]" aria-hidden="true">
        {ripples.map((r) => (
          <span
            key={r.id}
            className="sr-tap"
            style={{ left: r.x, top: r.y }}
            onAnimationEnd={() => setRipples((a) => a.filter((q) => q.id !== r.id))}
          />
        ))}
      </div>

      {/* Smooth bottom fade into website background */}
      <div
        className="absolute bottom-0 inset-x-0 h-8 md:h-12 pointer-events-none z-[6]"
        style={{ background: `linear-gradient(to bottom, transparent, ${pageBg})` }}
      />

      {/* Foreground text (same sizes & spacing as before) */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.48, ease: EASE }}
        className="sr-chip relative z-10 mb-1.5 sm:mb-2.5 inline-flex items-center gap-2 rounded-full px-3.5 py-0.5 sm:px-4 sm:py-1 text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide text-indigo-100"
      >
        <span className="sr-dot" aria-hidden="true" />
        <span>{t.greet}</span>
        <span className="sr-dot" aria-hidden="true" />
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.06, ease: EASE }}
        className="sr-h1 relative z-10 font-cinzel text-xl leading-snug sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-1 sm:mb-2 max-w-4xl mx-auto"
      >
        <span className="sr-title">{t.title}</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.12, ease: EASE }}
        className="sr-sub relative z-10 max-w-lg md:max-w-xl mx-auto text-xs sm:text-sm md:text-base px-2 leading-relaxed font-medium text-indigo-50/95"
      >
        {t.sub}
      </motion.p>
    </section>
  );
}
