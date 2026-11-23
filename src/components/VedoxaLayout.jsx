// @ts-nocheck
"use client";
import Link from "next/link";
import { useState, useMemo, useEffect } from "react";
import {
  ShieldCheck, Globe, BookOpen, Lock, X, Zap, Search,
  ChevronRight, LogOut, UserCircle, Coins, Share2, Menu, Edit3, Heart, Sun, Moon, Crown, Sparkles,
  LayoutDashboard, Compass, Brain, BookMarked, Camera, ArrowUpRight, Check,
  Shuffle, Lightbulb, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ===== AVATAR ENGINE ===== */
const clamp255 = (n) => Math.max(0, Math.min(255, n));
const shade = (hex, amt) => {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((x) => x + x).join("") : h, 16);
  const r = clamp255((n >> 16) + amt);
  const g = clamp255(((n >> 8) & 255) + amt);
  const b = clamp255((n & 255) + amt);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
};
const svgUri = (svg) =>
  "data:image/svg+xml;charset=utf-8," +
  svg.replace(/"/g, "'").replace(/%/g, "%25").replace(/#/g, "%23").replace(/</g, "%3C").replace(/>/g, "%3E");

const SKIN = { fair: "#F8DCC4", light: "#F0C7A0", wheat: "#DDA676", tan: "#BE7E52", brown: "#8F5B3B", deep: "#5F3B27" };
const GOLD = "#fcd34d";

const star4 = (x, y, s, o = 0.7) =>
  `<path d="M${x} ${y - s}Q${x} ${y} ${x + s} ${y}Q${x} ${y} ${x} ${y + s}Q${x} ${y} ${x - s} ${y}Q${x} ${y} ${x} ${y - s}Z" fill="#fff" opacity="${o}"/>`;

const PATTERNS = {
  none: () => "",
  stars: () =>
    star4(16, 22, 6) + star4(104, 30, 4.5, 0.6) + star4(20, 74, 3.5, 0.5) + star4(102, 78, 6, 0.55) + star4(88, 11, 3.5, 0.7) + star4(9, 46, 3, 0.5) + star4(34, 10, 3, 0.45),
  dots: () =>
    Array.from({ length: 6 }, (_, r) =>
      Array.from({ length: 6 }, (_, c) => `<circle cx="${10 + c * 20}" cy="${10 + r * 20}" r="1.7" fill="#fff" opacity=".2"/>`).join("")
    ).join(""),
  rings: () =>
    [26, 40, 54, 68].map((r, i) => `<circle cx="60" cy="58" r="${r}" fill="none" stroke="#fff" stroke-opacity="${0.2 - i * 0.035}" stroke-width="1.6"/>`).join(""),
  rays: () =>
    Array.from({ length: 16 }, (_, i) => {
      const a1 = ((i * 22.5) * Math.PI) / 180;
      const a2 = ((i * 22.5 + 11.25) * Math.PI) / 180;
      const p = (a) => `${(60 + 110 * Math.cos(a)).toFixed(1)} ${(58 + 110 * Math.sin(a)).toFixed(1)}`;
      return `<path d="M60 58L${p(a1)}L${p(a2)}Z" fill="#fff" opacity=".1"/>`;
    }).join(""),
  mandala: () =>
    `<circle cx="60" cy="58" r="46" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="3" stroke-dasharray="1.5 6" stroke-linecap="round"/>` +
    `<circle cx="60" cy="58" r="56" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="1.5"/>` +
    Array.from({ length: 12 }, (_, i) => `<ellipse cx="60" cy="14" rx="4.6" ry="12" fill="#fff" opacity=".11" transform="rotate(${i * 30} 60 58)"/>`).join(""),
};

/* ----- hair ----- */
const HAIR = {
  none: () => ({ back: "", front: `<ellipse cx="55" cy="35" rx="12" ry="4" fill="#fff" opacity=".2" transform="rotate(-14 55 35)"/>` }),
  short: (h) => ({
    back: "",
    front: `<path d="M38.5 55C33 33 46 20 62 21C80 22 89 38 81.5 55C80 46 73 38 62 37C50 37 42 44 38.5 55Z" fill="${h}"/><path d="M48 27C54 23 62 22 70 24" stroke="#fff" stroke-opacity=".2" stroke-width="2" fill="none" stroke-linecap="round"/>`,
  }),
  side: (h) => ({
    back: "",
    front: `<path d="M38.5 56C32 32 48 19 64 20C82 21 90 40 81.5 56C81 47 76 41 66 39C58 44 46 44 38.5 56Z" fill="${h}"/>`,
  }),
  spiky: (h) => ({
    back: "",
    front: `<path d="M38.5 54L35 37L44 40L43 23L52 31L58 15L64 29L73 17L74 33L85 26L82 41L88 39L81.5 54C80 46 72 40 60 40C48 40 42 46 38.5 54Z" fill="${h}"/>`,
  }),
  long: (h) => ({
    back: `<path d="M35 56C30 26 48 15 62 15C78 15 92 28 85 58C87 78 91 96 86 114L34 114C29 96 33 78 35 56Z" fill="${shade(h, -12)}"/>`,
    front: `<path d="M38.5 56C32 32 48 19 64 20C82 21 90 40 81.5 56C81 47 76 41 66 39C58 44 46 44 38.5 56Z" fill="${h}"/>`,
  }),
  wavy: (h) => ({
    back: `<path d="M35 56C30 26 48 15 62 15C78 15 92 28 85 58C88 70 95 80 88 90C86 96 93 102 86 108C82 113 78 106 74 111L46 111C42 106 38 113 34 108C27 102 34 96 32 90C25 80 32 70 35 56Z" fill="${shade(h, -12)}"/>`,
    front: `<path d="M38.5 56C32 32 48 19 64 20C82 21 90 40 81.5 56C81 47 76 41 66 39C58 44 46 44 38.5 56Z" fill="${h}"/>`,
  }),
  bun: (h) => ({
    back: `<circle cx="60" cy="16" r="9.5" fill="${h}"/><ellipse cx="57" cy="13" rx="4" ry="2.6" fill="#fff" opacity=".18"/>`,
    front: `<path d="M38.5 55C33 33 46 21 62 21C80 22 89 38 81.5 55C80 46 73 38 62 37C50 37 42 44 38.5 55Z" fill="${h}"/>`,
  }),
  curly: (h) => ({
    back: [[40, 40, 9], [48, 30, 10], [60, 26, 11], [72, 30, 10], [80, 40, 9], [36, 52, 8], [84, 52, 8], [38, 64, 6], [82, 64, 6]]
      .map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${shade(h, i % 2 ? 8 : -6)}"/>`).join(""),
    front: [[45, 39, 7], [53, 34, 7], [62, 33, 7], [70, 34, 7], [77, 39, 6.5], [41, 46, 5]]
      .map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${shade(h, i % 2 ? 10 : -4)}"/>`).join(""),
  }),
  turban: (t, o) => ({
    back: "",
    front:
      `<path d="M36 52C33 28 46 12 62 12C79 12 89 30 84 52C76 43 46 43 36 52Z" fill="${t}"/>` +
      `<path d="M37 46C52 30 76 27 86 38" stroke="${shade(t, 38)}" stroke-width="2.2" fill="none" opacity=".7"/>` +
      `<path d="M36.5 50C54 34 78 33 85 45" stroke="${shade(t, -32)}" stroke-width="2.2" fill="none" opacity=".6"/>` +
      `<path d="M60 33C57 22 63 13 74 8C69 17 67 26 63 34Z" fill="${o.plume || "#f43f5e"}"/>` +
      `<circle cx="60" cy="35" r="4" fill="${GOLD}"/><circle cx="58.8" cy="33.8" r="1.2" fill="#fff" opacity=".8"/>`,
  }),
  beanie: (c) => ({
    back: "",
    front:
      `<path d="M37 50C35 26 50 17 62 17C76 17 87 27 83 50Z" fill="${c}"/>` +
      `<rect x="36" y="43" width="48" height="10" rx="5" fill="${shade(c, -28)}"/>` +
      `<circle cx="60" cy="14" r="5" fill="${shade(c, 30)}"/>`,
  }),
};

/* ----- face parts ----- */
const faceParts = (o) => {
  const s = o.eyeSize || 1;
  const ink = "#1b1230";
  const open = (cx) =>
    `<ellipse cx="${cx}" cy="56.5" rx="${2.5 * s}" ry="${3.1 * s}" fill="${ink}"/><circle cx="${cx + 0.9}" cy="55.3" r="${0.95 * s}" fill="#fff"/>`;
  const happy = (cx) => `<path d="M${cx - 3.6} 57.6Q${cx} 52.4 ${cx + 3.6} 57.6" stroke="${ink}" stroke-width="2.1" fill="none" stroke-linecap="round"/>`;
  const calm = (cx) => `<path d="M${cx - 3.6} 56Q${cx} 59.8 ${cx + 3.6} 56" stroke="${ink}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
  const E = { open: [open(51), open(69)], happy: [happy(51), happy(69)], calm: [calm(51), calm(69)], wink: [open(51), happy(69)] }[o.eyes || "open"];
  const bc = o.browColor || (["turban", "none", "beanie"].includes(o.style) ? "#2b1b12" : o.hair);
  const bw = o.brow || 1.8;
  const brows = `<path d="M46.2 50.4Q51 47.2 55.8 49.6M64.2 49.6Q69 47.2 73.8 50.4" stroke="${bc}" stroke-width="${bw}" fill="none" stroke-linecap="round"/>`;
  const lash = o.lash ? `<path d="M47 54.6L44.6 53.2M73 54.6L75.4 53.2" stroke="${ink}" stroke-width="1.5" stroke-linecap="round"/>` : "";
  const nose = `<path d="M60 58.5Q57.8 64 61.4 64.6" stroke="${shade(o.skin, -42)}" stroke-width="1.5" fill="none" stroke-linecap="round" opacity=".8"/>`;
  const lip = o.lip || "#8b3a3a";
  const mouth = {
    smile: `<path d="M53.4 68Q60 74 66.6 68" stroke="${lip}" stroke-width="2.1" fill="none" stroke-linecap="round"/>`,
    soft: `<path d="M55 69Q60 71.8 65 69" stroke="${lip}" stroke-width="2" fill="none" stroke-linecap="round"/>`,
    grin: `<path d="M52.4 67.4Q60 78 67.6 67.4Z" fill="${shade(lip, -30)}"/><path d="M54.2 68.2Q60 70.6 65.8 68.2L65.2 70Q60 72.2 54.8 70Z" fill="#fff"/>`,
  }[o.mouth || "smile"];
  const blush = `<ellipse cx="45.5" cy="64" rx="4.6" ry="2.8" fill="#ff6b81" opacity=".26"/><ellipse cx="74.5" cy="64" rx="4.6" ry="2.8" fill="#ff6b81" opacity=".26"/>`;
  return { eyes: E.join("") + lash, brows, nose, mouth, blush };
};

/* ----- accessories (head) ----- */
const crownSvg = (dy = 0) =>
  `<g transform="translate(0 ${dy})"><path d="M43 33L46 15L54 25L60 10L66 25L74 15L77 33Z" fill="${GOLD}" stroke="#b45309" stroke-width="1.2" stroke-linejoin="round"/>` +
  `<rect x="43" y="30" width="34" height="6" rx="2" fill="#f59e0b" stroke="#b45309" stroke-width="1"/>` +
  `<circle cx="60" cy="33" r="2.2" fill="#e11d48"/><circle cx="51" cy="33" r="1.6" fill="#38bdf8"/><circle cx="69" cy="33" r="1.6" fill="#38bdf8"/>` +
  `<circle cx="46" cy="15" r="1.8" fill="#fff"/><circle cx="60" cy="10" r="2" fill="#fff"/><circle cx="74" cy="15" r="1.8" fill="#fff"/></g>`;

const HEAD_EXTRAS = {
  crown: () => crownSvg(0),
  tiara: () =>
    `<path d="M45 30L49 21L54 28L60 17L66 28L71 21L75 30Q60 26 45 30Z" fill="${GOLD}" stroke="#b45309" stroke-width="1" stroke-linejoin="round"/><circle cx="60" cy="24" r="2" fill="#e11d48"/>`,
  glasses: (o) => {
    const c = o.frame || "#2a2438";
    return `<g fill="#fff" fill-opacity=".16" stroke="${c}" stroke-width="2"><circle cx="51" cy="56.5" r="7.6"/><circle cx="69" cy="56.5" r="7.6"/></g><path d="M58.6 55.8Q60 54.2 61.4 55.8M43.4 55L39.4 53.5M76.6 55L80.6 53.5" stroke="${c}" stroke-width="1.9" fill="none" stroke-linecap="round"/>`;
  },
  sunglasses: (o) => {
    const c = o.shades || "#12101e";
    return `<path d="M41 52.5H79V58C79 63.5 74 65.5 70 65.5C65.5 65.5 62.4 62.5 61.4 58.5H58.6C57.6 62.5 54.5 65.5 50 65.5C46 65.5 41 63.5 41 58Z" fill="${c}"/><path d="M44.5 55.4H50M64 55.4H69.5" stroke="#fff" stroke-opacity=".55" stroke-width="1.6" stroke-linecap="round"/>`;
  },
  headphones: (o) => {
    const c = o.phones || "#1f2937";
    return `<path d="M38 56C34 22 86 22 82 56" stroke="${c}" stroke-width="4.5" fill="none" stroke-linecap="round"/><rect x="32.5" y="50" width="9" height="16" rx="4.2" fill="${c}"/><rect x="78.5" y="50" width="9" height="16" rx="4.2" fill="${c}"/><rect x="34.2" y="53" width="2.6" height="9" rx="1.3" fill="#fff" opacity=".4"/><rect x="83.2" y="53" width="2.6" height="9" rx="1.3" fill="#fff" opacity=".4"/>`;
  },
  halo: () => `<ellipse cx="60" cy="14" rx="19" ry="5.2" fill="none" stroke="${GOLD}" stroke-width="3" opacity=".95"/><ellipse cx="60" cy="14" rx="19" ry="5.2" fill="none" stroke="#fff" stroke-width="1" opacity=".6"/>`,
  bindi: () => `<circle cx="60" cy="44.6" r="1.9" fill="#e11d48"/>`,
  tilak: () => `<path d="M60 36.5V46" stroke="#f97316" stroke-width="2.6" stroke-linecap="round"/><circle cx="60" cy="47.6" r="1.4" fill="#dc2626"/>`,
  headband: (o) => `<path d="M38.8 45Q60 36.5 81.2 45L81 50Q60 42 39 50Z" fill="${o.band || "#dc2626"}"/>`,
  earrings: () => `<circle cx="39" cy="65" r="2.3" fill="${GOLD}" stroke="#b45309" stroke-width=".6"/><circle cx="81" cy="65" r="2.3" fill="${GOLD}" stroke="#b45309" stroke-width=".6"/>`,
  flower: () =>
    [0, 72, 144, 216, 288].map((a) => `<ellipse cx="80" cy="30.5" rx="2.8" ry="4.6" fill="#fb7185" transform="rotate(${a} 80 34)"/>`).join("") +
    `<circle cx="80" cy="34" r="2.4" fill="#fde047"/>`,
  tophat: () =>
    `<rect x="45" y="6" width="30" height="24" rx="3" fill="#15131f"/><rect x="45" y="22" width="30" height="5" fill="#dc2626"/><ellipse cx="60" cy="31" rx="21" ry="4.4" fill="#15131f"/><rect x="49" y="9" width="3" height="11" rx="1.5" fill="#fff" opacity=".18"/>`,
  gradcap: () =>
    `<path d="M32 28L60 16L88 28L60 40Z" fill="#111827"/><path d="M46 34V42Q60 48 74 42V34L60 40Z" fill="#1f2937"/><path d="M84 30V42" stroke="${GOLD}" stroke-width="1.8"/><circle cx="84" cy="44" r="2.4" fill="${GOLD}"/>`,
};

/* ----- chest accessories ----- */
const CHEST = {
  necklace: () => `<path d="M46 87Q60 110 74 87" stroke="${GOLD}" stroke-width="2.8" fill="none" stroke-dasharray="0.1 4.4" stroke-linecap="round"/><circle cx="60" cy="99" r="2.8" fill="#e11d48" stroke="${GOLD}" stroke-width="1.2"/>`,
  mala: () => `<path d="M45 86Q60 114 75 86" stroke="#7c3f1d" stroke-width="3.8" fill="none" stroke-dasharray="0.1 5.4" stroke-linecap="round"/><circle cx="60" cy="100" r="3" fill="#92400e" stroke="${GOLD}" stroke-width="1"/>`,
  buttons: (o) =>
    `<path d="M60 100V124" stroke="${shade(o.outfit, -34)}" stroke-width="1.3"/>` + [106, 112.5, 119].map((y) => `<circle cx="60" cy="${y}" r="1.9" fill="${GOLD}" stroke="#b45309" stroke-width=".5"/>`).join(""),
  book: () =>
    `<g transform="rotate(-10 94 102)"><rect x="80" y="90" width="28" height="22" rx="2.5" fill="#7c3aed"/><rect x="80" y="90" width="5.5" height="22" rx="2" fill="#5b21b6"/><rect x="88" y="96" width="15" height="2.2" rx="1" fill="${GOLD}"/><rect x="88" y="101" width="10" height="2" rx="1" fill="${GOLD}" opacity=".7"/></g>`,
};

/* ----- main builder (human) ----- */
function buildAvatar(o) {
  const O = {
    bg: ["#312e81", "#7c3aed"], glow: "#fbbf24", pattern: "none", skin: SKIN.wheat, hair: "#1f1308", style: "short",
    outfit: "#7c3aed", neck: "v", eyes: "open", mouth: "smile", beard: null, stache: null, extras: [], chest: [], ...o,
  };
  const hairFn = HAIR[O.style] || HAIR.short;
  const hr = hairFn(O.hair, O);
  const f = faceParts(O);
  const sk = O.skin;
  const skD = shade(sk, -14);
  const neckline = {
    v: `<path d="M48.5 85L60 104L71.5 85Z" fill="${skD}"/><path d="M47 85L60 105L73 85" stroke="${shade(O.outfit, 26)}" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`,
    round: `<path d="M49 85Q60 100 71 85Z" fill="${skD}"/><path d="M48 85Q60 102 72 85" stroke="${shade(O.outfit, 26)}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    kurta: `<path d="M53.5 86Q60 93 66.5 86Z" fill="${skD}"/><path d="M52 85.5Q60 95 68 85.5" stroke="${shade(O.outfit, 30)}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
  }[O.neck];
  const beard = O.beard
    ? `<path d="M39.6 58C39 78 50 86 60 86C70 86 81 78 80.4 58C79 70 71 75 60 75C49 75 41 70 39.6 58Z" fill="${O.beard}"/>`
    : "";
  const stache = O.stache
    ? `<path d="M51.5 66.4Q56 62 60 65Q64 62 68.5 66.4Q64 69 60 67Q56 69 51.5 66.4Z" fill="${O.stache}"/>`
    : "";
  const head = (O.extras || []).map((k) => {
    const [name, arg] = k.split(":");
    if (name === "headband" && arg) return HEAD_EXTRAS.headband({ ...O, band: arg });
    if (name === "headphones" && arg) return HEAD_EXTRAS.headphones({ ...O, phones: arg });
    if (name === "sunglasses" && arg) return HEAD_EXTRAS.sunglasses({ ...O, shades: arg });
    return HEAD_EXTRAS[name] ? HEAD_EXTRAS[name](O) : "";
  }).join("");
  const chest = (O.chest || []).map((k) => (CHEST[k] ? CHEST[k](O) : "")).join("");

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">` +
    `<defs>` +
    `<linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${O.bg[0]}"/><stop offset="1" stop-color="${O.bg[1]}"/></linearGradient>` +
    `<radialGradient id="b" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="${O.glow}" stop-opacity=".6"/><stop offset="1" stop-color="${O.glow}" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(O.outfit, 14)}"/><stop offset="1" stop-color="${shade(O.outfit, -36)}"/></linearGradient>` +
    `<radialGradient id="v" cx=".5" cy=".5" r=".72"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></radialGradient>` +
    `</defs>` +
    `<rect width="120" height="120" fill="url(#a)"/><rect width="120" height="120" fill="url(#b)"/>` +
    (PATTERNS[O.pattern] || PATTERNS.none)() +
    hr.back +
    `<path d="M6 126C8 96 34 85 60 85C86 85 112 96 114 126Z" fill="url(#c)"/>` +
    `<path d="M50 62V84Q60 91 70 84V62Z" fill="${skD}"/>` +
    neckline +
    chest +
    `<ellipse cx="60" cy="75" rx="15" ry="5" fill="${shade(sk, -52)}" opacity=".32"/>` +
    `<ellipse cx="39" cy="57" rx="3.8" ry="5.2" fill="${sk}"/><ellipse cx="81" cy="57" rx="3.8" ry="5.2" fill="${sk}"/>` +
    `<path d="M39 52C39 38 48 30 60 30C72 30 81 38 81 52C81 66 72 78.5 60 79.5C48 78.5 39 66 39 52Z" fill="${sk}"/>` +
    `<path d="M44 40C48 34 54 31.4 60 31.4" stroke="#fff" stroke-opacity=".22" stroke-width="2.2" fill="none" stroke-linecap="round"/>` +
    f.blush +
    beard +
    f.nose + f.mouth + stache +
    f.brows + f.eyes +
    hr.front +
    head +
    `<rect width="120" height="120" fill="url(#v)"/>` +
    `</svg>`
  );
}

/* ----- custom animal avatars ----- */
function buildOwl() {
  const feather = Array.from({ length: 12 }, (_, i) => {
    const x = 47 + (i % 4) * 7.4;
    const y = 82 + Math.floor(i / 4) * 8;
    return `<path d="M${x - 3.4} ${y}Q${x} ${y + 5} ${x + 3.4} ${y}" stroke="#b9854b" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;
  }).join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs>` +
    `<linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset="1" stop-color="#7c3aed"/></linearGradient>` +
    `<radialGradient id="b" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#fbbf24" stop-opacity=".5"/><stop offset="1" stop-color="#fbbf24" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="v" cx=".5" cy=".5" r=".72"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></radialGradient></defs>` +
    `<rect width="120" height="120" fill="url(#a)"/><rect width="120" height="120" fill="url(#b)"/>` + PATTERNS.stars() +
    `<ellipse cx="60" cy="86" rx="33" ry="36" fill="#8a5a2b"/>` +
    `<ellipse cx="60" cy="92" rx="21" ry="26" fill="#e9c58f"/>` + feather +
    `<path d="M34 50L36 22L54 38Z" fill="#7a4d22"/><path d="M86 50L84 22L66 38Z" fill="#7a4d22"/>` +
    `<ellipse cx="60" cy="54" rx="29" ry="26" fill="#9a6a35"/>` +
    `<circle cx="47" cy="53" r="14" fill="#fff7e6"/><circle cx="73" cy="53" r="14" fill="#fff7e6"/>` +
    `<circle cx="47" cy="53" r="8.2" fill="#f59e0b"/><circle cx="73" cy="53" r="8.2" fill="#f59e0b"/>` +
    `<circle cx="47" cy="53" r="4.4" fill="#1b1230"/><circle cx="73" cy="53" r="4.4" fill="#1b1230"/>` +
    `<circle cx="49" cy="51" r="1.6" fill="#fff"/><circle cx="75" cy="51" r="1.6" fill="#fff"/>` +
    `<path d="M60 58L54.5 67L60 74L65.5 67Z" fill="#f97316"/><path d="M60 58L60 74" stroke="#c2410c" stroke-width="1"/>` +
    `<g fill="none" stroke="#fcd34d" stroke-width="2"><circle cx="47" cy="53" r="14.6"/><circle cx="73" cy="53" r="14.6"/></g>` +
    HEAD_EXTRAS.gradcap().replace(/translate/g, "translate") +
    `<rect width="120" height="120" fill="url(#v)"/></svg>`
  );
}

function buildLion() {
  const mane = Array.from({ length: 14 }, (_, i) => {
    const a = (i * 360) / 14;
    const r = (a * Math.PI) / 180;
    return `<circle cx="${(60 + 27 * Math.cos(r)).toFixed(1)}" cy="${(60 + 27 * Math.sin(r)).toFixed(1)}" r="13" fill="${i % 2 ? "#b45309" : "#c2610f"}"/>`;
  }).join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs>` +
    `<linearGradient id="a" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7c2d12"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>` +
    `<radialGradient id="b" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#fde68a" stop-opacity=".6"/><stop offset="1" stop-color="#fde68a" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="v" cx=".5" cy=".5" r=".72"><stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></radialGradient></defs>` +
    `<rect width="120" height="120" fill="url(#a)"/><rect width="120" height="120" fill="url(#b)"/>` + PATTERNS.rays() +
    mane +
    `<circle cx="40" cy="38" r="8" fill="#f5b042"/><circle cx="80" cy="38" r="8" fill="#f5b042"/><circle cx="40" cy="38" r="4" fill="#f9a8a8"/><circle cx="80" cy="38" r="4" fill="#f9a8a8"/>` +
    `<circle cx="60" cy="62" r="25" fill="#f7b84b"/>` +
    `<ellipse cx="60" cy="71" rx="14" ry="10.5" fill="#fde7c4"/>` +
    `<path d="M54.5 64Q60 60.5 65.5 64Q62.5 70 60 70Q57.5 70 54.5 64Z" fill="#7c2d12"/>` +
    `<path d="M60 70V74M60 74Q56 78 52 75M60 74Q64 78 68 75" stroke="#7c2d12" stroke-width="1.8" fill="none" stroke-linecap="round"/>` +
    `<ellipse cx="50" cy="55" rx="3" ry="3.6" fill="#1b1230"/><ellipse cx="70" cy="55" rx="3" ry="3.6" fill="#1b1230"/><circle cx="51" cy="53.8" r="1.1" fill="#fff"/><circle cx="71" cy="53.8" r="1.1" fill="#fff"/>` +
    `<path d="M45 49Q50 46.4 55 48.6M65 48.6Q70 46.4 75 49" stroke="#8a4a10" stroke-width="2" fill="none" stroke-linecap="round"/>` +
    crownSvg(-6) +
    `<rect width="120" height="120" fill="url(#v)"/></svg>`
  );
}

/* ===== AVATAR LIBRARY ===== */
const mk = (id, cat, en, hi, tagEn, tagHi, svg) => ({ id, cat, en, hi, tagEn, tagHi, url: svgUri(svg) });

const AVATAR_LIBRARY = [
  /* Royal / शाही */
  mk("maharaja", "royal", "Maharaja", "महाराजा", "Rules the library", "लाइब्रेरी का राजा",
    buildAvatar({ bg: ["#5b0f1e", "#b45309"], glow: "#fcd34d", pattern: "rays", skin: SKIN.wheat, style: "turban", hair: "#d4921a", plume: "#f43f5e", outfit: "#8a1230", neck: "kurta", eyes: "open", mouth: "smile", stache: "#2a170c", extras: ["earrings"], chest: ["necklace", "buttons"] })),
  mk("maharani", "royal", "Maharani", "महारानी", "Grace with wisdom", "गरिमा और ज्ञान",
    buildAvatar({ bg: ["#6d1b5c", "#be185d"], glow: "#fbcfe8", pattern: "mandala", skin: SKIN.tan, style: "long", hair: "#150b08", outfit: "#9d174d", neck: "round", eyes: "open", mouth: "smile", lash: true, lip: "#be123c", extras: ["crown", "bindi", "earrings"], chest: ["necklace"] })),
  mk("rajkumar", "royal", "Raj Kumar", "राजकुमार", "Young and curious", "युवा और जिज्ञासु",
    buildAvatar({ bg: ["#1e3a8a", "#6366f1"], glow: "#bfdbfe", pattern: "stars", skin: SKIN.light, style: "turban", hair: "#1d4ed8", plume: "#f8fafc", outfit: "#1e40af", neck: "kurta", eyes: "happy", mouth: "grin", extras: ["earrings"], chest: ["buttons"] })),
  mk("rajkumari", "royal", "Raj Kumari", "राजकुमारी", "A story lover", "कहानियों की दीवानी",
    buildAvatar({ bg: ["#f9a8d4", "#a855f7"], glow: "#ffffff", pattern: "stars", skin: SKIN.fair, style: "wavy", hair: "#6b3a1e", outfit: "#ec4899", neck: "round", eyes: "happy", mouth: "smile", lash: true, lip: "#e11d48", extras: ["tiara"], chest: ["necklace"] })),
  mk("samrat", "royal", "Samrat", "सम्राट", "Master of all shelves", "हर शेल्फ़ का स्वामी",
    buildAvatar({ bg: ["#09090b", "#a16207"], glow: "#fde047", pattern: "rings", skin: SKIN.brown, style: "short", hair: "#0b0b0b", outfit: "#111827", neck: "v", eyes: "open", brow: 2.6, mouth: "soft", beard: "#0b0b0b", extras: ["crown"], chest: ["buttons"] })),
  mk("veer", "royal", "Veer", "वीर", "Fearless reader", "निडर पाठक",
    buildAvatar({ bg: ["#7f1d1d", "#ea580c"], glow: "#fed7aa", pattern: "rays", skin: SKIN.tan, style: "spiky", hair: "#111111", outfit: "#7c2d12", neck: "round", eyes: "open", brow: 2.8, mouth: "soft", stache: "#111111", extras: ["headband:#dc2626"] })),

  /* Spiritual / आध्यात्मिक */
  mk("yogi", "spiritual", "Yogi", "योगी", "Calm mind, deep focus", "शांत मन, गहरा ध्यान",
    buildAvatar({ bg: ["#c2410c", "#fbbf24"], glow: "#fff7ed", pattern: "mandala", skin: SKIN.tan, style: "bun", hair: "#e5e7eb", outfit: "#ea580c", neck: "round", eyes: "calm", mouth: "soft", beard: "#e5e7eb", extras: ["tilak"], chest: ["mala"] })),
  mk("sadhvi", "spiritual", "Sadhvi", "साध्वी", "Peace in every page", "हर पन्ने में शांति",
    buildAvatar({ bg: ["#0f766e", "#34d399"], glow: "#d1fae5", pattern: "mandala", skin: SKIN.wheat, style: "long", hair: "#2b1a10", outfit: "#f59e0b", neck: "round", eyes: "calm", mouth: "smile", lash: true, lip: "#b45309", extras: ["tilak", "halo"], chest: ["mala"] })),
  mk("rishi", "spiritual", "Rishi", "ऋषि", "Ancient wisdom", "प्राचीन ज्ञान",
    buildAvatar({ bg: ["#312e81", "#7c3aed"], glow: "#ddd6fe", pattern: "stars", skin: SKIN.wheat, style: "bun", hair: "#f1f5f9", outfit: "#e2e8f0", neck: "round", eyes: "calm", mouth: "soft", beard: "#f1f5f9", extras: ["halo"], chest: ["book"] })),
  mk("sannyasi", "spiritual", "Sannyasi", "संन्यासी", "Silent and serene", "मौन और शांत",
    buildAvatar({ bg: ["#7c2d12", "#f97316"], glow: "#fed7aa", pattern: "rings", skin: SKIN.brown, style: "none", outfit: "#ea580c", neck: "round", eyes: "calm", mouth: "smile", extras: ["tilak", "halo"], chest: ["mala"] })),
  mk("stargazer", "spiritual", "Star Gazer", "तारा दर्शक", "Reads the night sky", "रात के आसमान का पाठक",
    buildAvatar({ bg: ["#0f172a", "#1e3a8a"], glow: "#93c5fd", pattern: "stars", skin: SKIN.fair, style: "beanie", hair: "#6366f1", outfit: "#3730a3", neck: "round", eyes: "happy", mouth: "grin", extras: ["glasses"] })),
  mk("kavi", "spiritual", "Kavi", "कवि", "Words that flow", "बहते हुए शब्द",
    buildAvatar({ bg: ["#581c87", "#be185d"], glow: "#f9a8d4", pattern: "dots", skin: SKIN.wheat, style: "wavy", hair: "#1c1917", outfit: "#fef3c7", neck: "kurta", eyes: "open", mouth: "soft", extras: ["glasses"], chest: ["book"] })),
  mk("jadugar", "spiritual", "Jadugar", "जादूगर", "Every book is magic", "हर किताब एक जादू",
    buildAvatar({ bg: ["#2e1065", "#0f172a"], glow: "#c084fc", pattern: "stars", skin: SKIN.light, style: "short", hair: "#111111", outfit: "#16131f", neck: "v", eyes: "wink", mouth: "grin", stache: "#111111", extras: ["tophat"] })),

  /* Scholar / विद्वान */
  mk("pandit", "scholar", "Pandit", "पंडित", "Knows every verse", "हर श्लोक का ज्ञाता",
    buildAvatar({ bg: ["#92400e", "#f59e0b"], glow: "#fef3c7", pattern: "rays", skin: SKIN.wheat, style: "none", outfit: "#fff7ed", neck: "kurta", eyes: "open", mouth: "smile", extras: ["glasses", "tilak"], chest: ["book"] })),
  mk("acharya", "scholar", "Acharya", "आचार्य", "The guiding teacher", "मार्गदर्शक गुरु",
    buildAvatar({ bg: ["#14532d", "#65a30d"], glow: "#ecfccb", pattern: "dots", skin: SKIN.tan, style: "short", hair: "#9ca3af", outfit: "#166534", neck: "v", eyes: "open", mouth: "soft", stache: "#9ca3af", extras: ["glasses"], chest: ["book"] })),
  mk("vidushi", "scholar", "Vidushi", "विदुषी", "Learned and graceful", "विद्वान और सुशील",
    buildAvatar({ bg: ["#7c3aed", "#c4b5fd"], glow: "#ffffff", pattern: "stars", skin: SKIN.light, style: "bun", hair: "#2b1b12", outfit: "#6d28d9", neck: "round", eyes: "happy", mouth: "smile", lash: true, lip: "#be185d", extras: ["glasses", "bindi"], chest: ["book"] })),
  mk("bookworm", "scholar", "Book Worm", "किताबी कीड़ा", "One more chapter!", "बस एक और अध्याय!",
    buildAvatar({ bg: ["#0369a1", "#38bdf8"], glow: "#e0f2fe", pattern: "dots", skin: SKIN.fair, style: "curly", hair: "#7c4a1e", outfit: "#0284c7", neck: "round", eyes: "open", eyeSize: 1.15, mouth: "grin", extras: ["glasses"], chest: ["book"] })),
  mk("nightowl", "scholar", "Night Owl", "रात्रि पाठक", "Reads after midnight", "आधी रात के बाद भी पढ़ता है",
    buildAvatar({ bg: ["#020617", "#312e81"], glow: "#a5b4fc", pattern: "stars", skin: SKIN.wheat, style: "short", hair: "#1f2937", outfit: "#312e81", neck: "round", eyes: "happy", mouth: "smile", extras: ["headphones"], chest: ["book"] })),
  mk("topper", "scholar", "Topper", "टॉपर", "Always top of class", "हमेशा सबसे आगे",
    buildAvatar({ bg: ["#065f46", "#34d399"], glow: "#d1fae5", pattern: "rays", skin: SKIN.tan, style: "short", hair: "#111827", outfit: "#047857", neck: "v", eyes: "happy", mouth: "grin", extras: ["gradcap", "glasses"] })),

  /* Cool / कूल */
  mk("cooldude", "cool", "Cool Dude", "कूल डूड", "Calm and confident", "शांत और आत्मविश्वासी",
    buildAvatar({ bg: ["#0e7490", "#22d3ee"], glow: "#cffafe", pattern: "rings", skin: SKIN.tan, style: "spiky", hair: "#0b0b0b", outfit: "#0f172a", neck: "v", eyes: "open", mouth: "grin", extras: ["sunglasses"] })),
  mk("chillgirl", "cool", "Chill Girl", "चिल गर्ल", "Music and books", "म्यूज़िक और किताबें",
    buildAvatar({ bg: ["#fb7185", "#fdba74"], glow: "#fff1f2", pattern: "dots", skin: SKIN.light, style: "wavy", hair: "#f472b6", outfit: "#be123c", neck: "round", eyes: "wink", mouth: "smile", lash: true, lip: "#e11d48", extras: ["headphones:#f8fafc"] })),
  mk("neonrider", "cool", "Neon Rider", "नियॉन राइडर", "Glows in the dark", "अंधेरे में चमकता",
    buildAvatar({ bg: ["#0b0b1a", "#7e22ce"], glow: "#22d3ee", pattern: "rings", skin: SKIN.brown, style: "spiky", hair: "#22d3ee", outfit: "#111827", neck: "v", eyes: "open", mouth: "soft", extras: ["sunglasses:#e879f9"] })),
  mk("gamer", "cool", "Gamer", "गेमर", "Level up daily", "रोज़ एक नया लेवल",
    buildAvatar({ bg: ["#4c1d95", "#2563eb"], glow: "#a5b4fc", pattern: "dots", skin: SKIN.wheat, style: "curly", hair: "#18181b", outfit: "#1d4ed8", neck: "round", eyes: "happy", mouth: "grin", extras: ["headphones:#0ea5e9"] })),
  mk("rockstar", "cool", "Rockstar", "रॉकस्टार", "Loud and legendary", "धमाकेदार और लाजवाब",
    buildAvatar({ bg: ["#b91c1c", "#f97316"], glow: "#fde68a", pattern: "rays", skin: SKIN.light, style: "long", hair: "#111111", outfit: "#18181b", neck: "v", eyes: "open", mouth: "grin", extras: ["sunglasses"] })),
  mk("bosslady", "cool", "Boss Lady", "बॉस लेडी", "Leads with focus", "फोकस के साथ नेतृत्व",
    buildAvatar({ bg: ["#1e293b", "#b45309"], glow: "#fde68a", pattern: "rings", skin: SKIN.deep, style: "bun", hair: "#0b0b0b", outfit: "#0f172a", neck: "v", eyes: "open", mouth: "smile", lash: true, lip: "#9f1239", extras: ["earrings"], chest: ["necklace"] })),

  /* Cute / प्यारे */
  mk("littlereader", "cute", "Little Reader", "नन्हा पाठक", "Tiny but curious", "छोटा पर जिज्ञासु",
    buildAvatar({ bg: ["#fde047", "#fb923c"], glow: "#ffffff", pattern: "dots", skin: SKIN.wheat, style: "short", hair: "#3b2314", outfit: "#2563eb", neck: "round", eyes: "open", eyeSize: 1.25, mouth: "grin", chest: ["book"] })),
  mk("sunflower", "cute", "Sunflower", "सूरजमुखी", "Bright as sunshine", "धूप जैसी रौनक",
    buildAvatar({ bg: ["#bbf7d0", "#fde047"], glow: "#ffffff", pattern: "dots", skin: SKIN.light, style: "long", hair: "#92400e", outfit: "#16a34a", neck: "round", eyes: "happy", mouth: "smile", lash: true, extras: ["flower"] })),
  mk("cutiebun", "cute", "Cutie Bun", "क्यूट बन", "Sweet and cheerful", "मीठी और हँसमुख",
    buildAvatar({ bg: ["#fbcfe8", "#c4b5fd"], glow: "#ffffff", pattern: "stars", skin: SKIN.fair, style: "bun", hair: "#d97706", outfit: "#ec4899", neck: "round", eyes: "happy", eyeSize: 1.1, mouth: "smile", lash: true, extras: ["flower"] })),
  mk("wiseowl", "cute", "Wise Owl", "ज्ञानी उल्लू", "Wisdom with wings", "पंखों वाला ज्ञान", buildOwl()),
  mk("lioncub", "cute", "Lion Cub", "शेर का बच्चा", "Born to lead", "नेतृत्व के लिए जन्मा", buildLion()),
];


/* ===== LANGUAGE + COLOR HELPERS ===== */
const isHiLang = (lang) => String(lang || "").toUpperCase() === "HI";
const hasDevanagari = (v) => /[\u0900-\u097F]/.test(String(v == null ? "" : v));
/* lang prop wins; otherwise detect the language from the translated texts (t) the parent already passes */
const resolveLang = (lang, t) => {
  if (lang) return isHiLang(lang) ? "HI" : "EN";
  const probe = `${(t && t.secure) || ""}${(t && t.instant) || ""}${(t && t.brand) || ""}`;
  return hasDevanagari(probe) ? "HI" : "EN";
};
const pick = (L, en, hi) => (L === "HI" ? hi : en);
const onKeyActivate = (fn) => (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fn();
  }
};

/* Text colors tuned for BOTH themes (400 shades glow on dark, 600-700 shades stay readable on light) */
const tone = (d) => ({
  amber: d ? "text-amber-400" : "text-amber-700",
  gold: d ? "text-amber-500" : "text-amber-600",
  emerald: d ? "text-emerald-400" : "text-emerald-600",
  rose: d ? "text-rose-400" : "text-rose-600",
  sky: d ? "text-sky-400" : "text-sky-600",
  violet: d ? "text-violet-400" : "text-violet-600",
  muted: d ? "text-gray-400" : "text-slate-500",
  faint: d ? "text-gray-500" : "text-slate-400",
});

const AVATAR_CATS = [
  { id: "all", en: "All", hi: "सभी" },
  { id: "royal", en: "Royal", hi: "शाही" },
  { id: "spiritual", en: "Spiritual", hi: "आध्यात्मिक" },
  { id: "scholar", en: "Scholar", hi: "विद्वान" },
  { id: "cool", en: "Cool", hi: "कूल" },
  { id: "cute", en: "Cute", hi: "प्यारे" },
  { id: "classic", en: "Classic", hi: "क्लासिक" },
];

/* ===== AVATAR PICKER (preview + categories + random + save) ===== */
function AvatarPickerModal({ isDark, L, profile, AVATARS, handleSaveAvatar, onClose }) {
  const T = (en, hi) => pick(L, en, hi);
  const c = tone(isDark);
  const currentUrl = (profile && profile.avatar_url) || null;

  const classic = useMemo(
    () =>
      (Array.isArray(AVATARS) ? AVATARS : [])
        .filter(Boolean)
        .map((url, i) => ({
          id: `classic-${i}`,
          cat: "classic",
          en: `Classic ${i + 1}`,
          hi: `क्लासिक ${i + 1}`,
          tagEn: "Original Vedoxa style",
          tagHi: "वेदोक्सा का मूल अंदाज़",
          url,
        })),
    [AVATARS]
  );
  const everyAvatar = useMemo(() => [...AVATAR_LIBRARY, ...classic], [classic]);
  const [cat, setCat] = useState("all");
  const [picked, setPicked] = useState(() => everyAvatar.find((a) => a.url === currentUrl) || null);

  const cats = AVATAR_CATS.filter((k) => k.id !== "classic" || classic.length > 0);
  const list = cat === "all" ? everyAvatar : everyAvatar.filter((a) => a.cat === cat);
  const previewUrl = picked ? picked.url : currentUrl;
  const canSave = !!picked && picked.url !== currentUrl;

  const surprise = () => {
    const pool = everyAvatar.filter((a) => !picked || a.url !== picked.url);
    const a = pool[Math.floor(Math.random() * pool.length)];
    if (a) {
      setPicked(a);
      setCat("all");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
      onClick={onClose}
      className={`fixed inset-0 z-[6000] flex items-center justify-center p-3 sm:p-4 ${isDark ? 'bg-black/85' : 'bg-slate-900/60'}`}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={T("Choose your Avatar", "अपना अवतार चुनें")}
        initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }}
        transition={{ type: "spring", stiffness: 420, damping: 32 }}
        className={`border rounded-3xl w-full max-w-md relative shadow-2xl flex flex-col max-h-[92vh] overflow-hidden ${isDark ? 'bg-[#0c0c1a] border-white/[0.1]' : 'bg-white border-slate-200'}`}
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent rounded-full" />
        <div className="absolute inset-x-0 top-0 h-40 pointer-events-none" style={{ background: isDark ? 'radial-gradient(110% 90% at 50% 0%, rgba(212,146,26,0.20) 0%, transparent 72%)' : 'radial-gradient(110% 90% at 50% 0%, rgba(245,184,75,0.30) 0%, transparent 72%)' }} />
        <button type="button" onClick={onClose} aria-label={T("Close", "बंद करें")} className={`absolute top-3.5 right-3.5 z-10 transition-colors p-1.5 rounded-xl cursor-pointer ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/[0.08]' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}>
          <X size={18}/>
        </button>

        {/* Title */}
        <div className="relative shrink-0 px-5 pt-5">
          <h3 className={`text-lg font-bold text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>{T("Choose your Avatar", "अपना अवतार चुनें")}</h3>
          <p className={`text-xs text-center mt-1 ${c.muted}`}>{T("Pick the one that feels like you", "वह चुनें जो आपको सबसे अच्छा लगे")}</p>
        </div>

        {/* Live preview */}
        <div className="relative shrink-0 flex items-center gap-4 px-5 pt-4 pb-3">
          <div className="relative w-20 h-20 shrink-0">
            <div className="avatar-ring absolute -inset-1 rounded-full opacity-95" />
            <div className={`absolute inset-0 rounded-full ${isDark ? 'bg-[#0c0c1a]' : 'bg-white'}`} />
            <div className="absolute inset-[3px] rounded-full overflow-hidden flex items-center justify-center">
              {previewUrl ? (
                <img src={previewUrl} alt={T("Selected avatar preview", "चुने हुए अवतार का प्रीव्यू")} decoding="async" className="w-full h-full object-cover" />
              ) : (
                <UserCircle size={40} className="text-amber-500/50" />
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            {picked ? (
              <>
                <div className="font-cinzel gold-text font-black text-base leading-tight truncate">{pick(L, picked.en, picked.hi)}</div>
                <div className={`text-[11px] font-semibold truncate ${c.muted}`}>{pick(L, picked.hi, picked.en)}</div>
                <div className={`text-[11px] mt-1 ${isDark ? 'text-gray-300' : 'text-slate-600'}`}>{pick(L, picked.tagEn, picked.tagHi)}</div>
              </>
            ) : (
              <>
                <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{T("Your current avatar", "आपका मौजूदा अवतार")}</div>
                <div className={`text-[11px] mt-1 ${c.muted}`}>{T("Tap any avatar below to preview it", "प्रीव्यू देखने के लिए नीचे कोई भी अवतार टैप करें")}</div>
              </>
            )}
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={surprise}
              className={`mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition-colors ${isDark ? 'bg-white/[0.05] border-white/[0.1] text-gray-200 hover:bg-white/[0.1]' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'}`}
            >
              <Shuffle size={12} className={c.amber} /> {T("Surprise me", "रैंडम चुनें")}
            </motion.button>
          </div>
        </div>

        {/* Category chips */}
        <div className="relative shrink-0 px-5 pb-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {cats.map((k) => {
              const on = cat === k.id;
              return (
                <button
                  key={k.id}
                  type="button"
                  onClick={() => setCat(k.id)}
                  aria-pressed={on}
                  className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-bold border transition-all cursor-pointer ${on ? "bg-gradient-to-r from-amber-300 to-amber-500 text-[#150800] border-transparent shadow-sm" : (isDark ? "bg-white/[0.04] border-white/[0.09] text-gray-300 hover:text-white hover:border-amber-500/40" : "bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:border-amber-500/50")}`}
                >
                  {pick(L, k.en, k.hi)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Avatar grid */}
        <div className="relative flex-1 min-h-0 overflow-y-auto custom-scrollbar px-5 pt-1 pb-3">
          <div className="grid grid-cols-4 gap-x-3 gap-y-3.5">
            {list.map((a) => {
              const isSel = !!picked && picked.url === a.url;
              const isCur = currentUrl === a.url;
              return (
                <motion.button
                  key={a.id}
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setPicked(a)}
                  onDoubleClick={() => handleSaveAvatar(a.url)}
                  aria-label={`${pick(L, a.en, a.hi)}`}
                  aria-pressed={isSel}
                  className="flex flex-col items-center gap-1 cursor-pointer min-w-0"
                >
                  <span className={`relative block w-full aspect-square rounded-full border-2 transition-all duration-200 ${isSel ? 'border-amber-500 shadow-[0_0_18px_rgba(212,146,26,0.45)]' : (isCur ? 'border-emerald-500/70' : (isDark ? 'border-white/[0.1] hover:border-amber-500/70' : 'border-slate-200 hover:border-amber-500/80'))}`}>
                    <img src={a.url} alt={pick(L, a.en, a.hi)} loading="lazy" decoding="async" className="w-full h-full object-cover rounded-full" />
                    {(isSel || isCur) && (
                      <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 ${isDark ? 'border-[#0c0c1a]' : 'border-white'} ${isSel ? 'bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800]' : 'bg-emerald-500 text-white'}`}>
                        <Check size={11} strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span className={`w-full text-center text-[10px] font-semibold leading-tight truncate ${isSel ? c.amber : c.muted}`}>{pick(L, a.en, a.hi)}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Save bar */}
        <div className={`relative shrink-0 px-5 pt-3 pb-4 border-t ${isDark ? 'border-white/[0.07] bg-black/30' : 'border-slate-200 bg-slate-50/90'}`}>
          <p className={`text-[10.5px] text-center mb-2.5 ${c.muted}`}>
            {T("Tap to preview, then press Save. Double-tap to save instantly.", "प्रीव्यू के लिए टैप करें, फिर सेव दबाएँ। तुरंत सेव करने के लिए डबल-टैप करें।")}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className={`flex-1 text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer ${isDark ? 'bg-white/[0.07] text-white hover:bg-white/[0.12]' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}>
              {T("Cancel", "रद्द करें")}
            </button>
            <button
              type="button"
              disabled={!canSave}
              onClick={() => { if (picked) handleSaveAvatar(picked.url); }}
              className="flex-[1.6] btn-gold text-xs font-extrabold py-2.5 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-45 disabled:cursor-not-allowed"
            >
              <Check size={14} strokeWidth={3} /> {T("Save Avatar", "अवतार सेव करें")}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function VedoxaDashboard({
  isSidebarOpen,
  setIsSidebarOpen,
  isDark,
  sidebarTab,
  setSidebarTab,
  purchasedBookIds,
  favorites,
  setShowAvatarPicker,
  profile,
  user,
  readerTier,
  readerProgress,
  nextTierText,
  sideCard,
  segBtn,
  lang,
  setLang,
  toggleTheme,
  ownedBooksList,
  favoriteBooksList,
  openWebReader,
  openBookDetails,
  supabaseUrl,
  showLogoutConfirm,
  setShowLogoutConfirm,
  confirmLogout,
  showAvatarPicker,
  AVATARS,
  handleSaveAvatar
}) {
  const L = isHiLang(lang) ? "HI" : "EN";
  const T = (en, hi) => pick(L, en, hi);
  const c = tone(isDark);
  const [showAuraHelp, setShowAuraHelp] = useState(false);

  const ownedIds = Array.isArray(purchasedBookIds) ? purchasedBookIds : [];
  const favIds = Array.isArray(favorites) ? favorites : [];
  const ownedList = Array.isArray(ownedBooksList) ? ownedBooksList : [];
  const favList = Array.isArray(favoriteBooksList) ? favoriteBooksList : [];
  const progress = Math.max(0, Math.min(100, Number(readerProgress) || 0));
  const shelfCount = ownedIds.length + favIds.length;

  const guideSteps = [
    { Icon: Compass, color: c.sky, en: "Explore", hi: "खोजें", dEn: "Find books you love", dHi: "अपनी पसंद की किताबें खोजें" },
    { Icon: Lock, color: c.amber, en: "Unlock", hi: "अनलॉक करें", dEn: "Unlock a book to read it instantly", dHi: "किताब अनलॉक करें और तुरंत पढ़ें" },
    { Icon: BookOpen, color: c.emerald, en: "Read", hi: "पढ़ें", dEn: "Open it from your Shelf anytime", dHi: "जब चाहें शेल्फ से खोलकर पढ़ें" },
    { Icon: Heart, color: c.rose, en: "Save", hi: "सेव करें", dEn: "Tap the heart to keep favorites", dHi: "दिल दबाकर पसंदीदा सेव करें" },
  ];

  /* Esc closes the top-most layer, and the page behind stays still while a panel is open */
  useEffect(() => {
    if (!isSidebarOpen && !showAvatarPicker) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (showAvatarPicker) setShowAvatarPicker(false);
      else if (showLogoutConfirm) setShowLogoutConfirm(false);
      else setIsSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSidebarOpen, showAvatarPicker, showLogoutConfirm, setIsSidebarOpen, setShowAvatarPicker, setShowLogoutConfirm]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (!isSidebarOpen && !showAvatarPicker) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isSidebarOpen, showAvatarPicker]);

  return (
    <>
      {/* Sidebar Dashboard (solid panel + GPU slide = opens instantly, no blur lag) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              key="reader-hub-backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/65 z-[5000]"
            />
            <motion.div
              key="reader-hub-panel"
              role="dialog"
              aria-label={T("Reader Hub", "रीडर हब")}
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              style={{ willChange: "transform" }}
              className={`fixed inset-y-0 right-0 w-[23.5rem] max-w-[92vw] border-l z-[5001] shadow-[-14px_0_44px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden rounded-l-[2.25rem] ${isDark ? 'bg-[#090915] border-white/[0.1] text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              {/* Soft Aurora Glow Behind Profile */}
              <div
                className="absolute inset-x-0 top-0 h-72 pointer-events-none"
                style={{ background: isDark
                  ? 'radial-gradient(125% 95% at 50% 0%, rgba(212,146,26,0.24) 0%, rgba(139,92,246,0.10) 48%, transparent 78%)'
                  : 'radial-gradient(125% 95% at 50% 0%, rgba(245,184,75,0.36) 0%, rgba(167,139,250,0.12) 48%, transparent 78%)' }}
              />

              {/* Header (No scroll) */}
              <div className="relative shrink-0 px-5 pt-5 pb-3 flex justify-between items-center gap-2 border-b border-transparent">
                <span className="flex items-center gap-2.5 text-sm font-extrabold tracking-wide min-w-0">
                  <span className={`w-9 h-9 shrink-0 rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 border border-amber-500/40 ${c.amber} flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.2)]`}>
                    <LayoutDashboard size={16}/>
                  </span>
                  <span className="truncate">{T("Reader Hub", "रीडर हब")}</span>
                </span>

                {/* Mini Tab Switcher inside Dashboard Header */}
                <div className={`flex p-1 rounded-full border text-[11px] font-bold shrink-0 ${isDark ? 'bg-black/45 border-white/[0.09]' : 'bg-slate-100 border-slate-200/90'}`}>
                  <button
                    type="button"
                    onClick={() => setSidebarTab("overview")}
                    aria-pressed={sidebarTab === "overview"}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${sidebarTab === "overview" ? "bg-gradient-to-r from-amber-300 to-amber-500 text-[#150800] font-extrabold shadow-sm" : (isDark ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-900")}`}
                  >
                    {T("Dashboard", "डैशबोर्ड")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarTab("shelf")}
                    aria-pressed={sidebarTab === "shelf"}
                    className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer ${sidebarTab === "shelf" ? "bg-gradient-to-r from-amber-300 to-amber-500 text-[#150800] font-extrabold shadow-sm" : (isDark ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-900")}`}
                  >
                    {T("Shelf", "शेल्फ")}
                    {shelfCount > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${sidebarTab === "shelf" ? "bg-black/20 text-[#150800]" : "bg-amber-500/20 " + c.amber}`}>
                        {shelfCount}
                      </span>
                    )}
                  </button>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label={T("Close dashboard", "डैशबोर्ड बंद करें")}
                  className={`p-2 shrink-0 rounded-2xl border transition-colors cursor-pointer ${isDark ? 'bg-white/[0.04] border-white/[0.09] text-gray-400 hover:text-white hover:bg-white/[0.1]' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'}`}
                >
                  <X size={17}/>
                </motion.button>
              </div>

              {/* Scrollable Content Area */}
              <div className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar px-5 pb-6">

                {/* Profile Section: gold ring + crown + camera chip */}
                <div className="flex flex-col items-center text-center pt-5">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    role="button"
                    tabIndex={0}
                    aria-label={T("Change avatar", "अवतार बदलें")}
                    className="relative w-28 h-28 group cursor-pointer"
                    onClick={() => setShowAvatarPicker(true)}
                    onKeyDown={onKeyActivate(() => setShowAvatarPicker(true))}
                  >
                    <div className="avatar-ring absolute -inset-1.5 rounded-full opacity-95" />
                    <div className={`absolute inset-0 rounded-full ${isDark ? 'bg-[#090915]' : 'bg-white'}`} />
                    <div className="absolute inset-[4px] rounded-full overflow-hidden flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="avatar" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <UserCircle size={52} className="text-amber-500/50" />
                      )}
                    </div>
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 -rotate-6 w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-[#150800] flex items-center justify-center shadow-[0_3px_12px_rgba(212,146,26,0.55)] ring-2 ring-white/30">
                      <Crown size={15} />
                    </span>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center border-[3px] shadow-md transition-transform group-hover:scale-110 ${isDark ? 'border-[#090915]' : 'border-white'}`}>
                      <Camera size={14} />
                    </span>
                  </motion.div>

                  <p className={`text-[11px] font-semibold mt-4 ${c.muted}`}>{T("Welcome back 🙏", "नमस्ते 🙏")}</p>
                  <h3 className="font-cinzel gold-text font-black text-xl sm:text-2xl mt-0.5 leading-tight max-w-full truncate px-2">
                    {profile?.name || T("Vedoxa Reader", "वेदोक्सा पाठक")}
                  </h3>
                  <p className={`text-xs mt-0.5 font-medium max-w-full truncate px-3 ${c.muted}`}>
                    {user?.email}
                  </p>

                  <div className="flex items-center gap-2 mt-2.5 flex-wrap justify-center">
                    <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/[0.15] border border-amber-500/40 shadow-[0_2px_10px_rgba(245,158,11,0.15)]">
                      <Sparkles size={12} className={c.amber} />
                      <span className={`text-[11px] font-extrabold tracking-wide ${c.amber}`}>{readerTier}</span>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAvatarPicker(true)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors cursor-pointer ${isDark ? 'bg-white/[0.04] border-white/[0.09] text-gray-300 hover:bg-white/[0.1]' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
                    >
                      <Edit3 size={10} /> {T("Avatar", "अवतार")}
                    </motion.button>
                  </div>

                  {/* Consciousness Progress Bar */}
                  <div className={`w-full mt-4 p-3.5 rounded-2xl border text-left ${sideCard}`}>
                    <div className="flex justify-between items-center text-[11px] font-bold mb-1.5">
                      <span className={`flex items-center gap-1.5 ${isDark ? "text-gray-300" : "text-slate-700"}`}>
                        {T("Reading Aura", "रीडिंग ऑरा")}
                        <button
                          type="button"
                          onClick={() => setShowAuraHelp((v) => !v)}
                          aria-label={T("What is Reading Aura?", "रीडिंग ऑरा क्या है?")}
                          aria-expanded={showAuraHelp}
                          className={`${c.muted} hover:text-amber-500 transition-colors cursor-pointer`}
                        >
                          <Info size={13} />
                        </button>
                      </span>
                      <span className={`${c.gold} font-extrabold`}>{progress}% {T("Awakened", "जागृत")}</span>
                    </div>
                    <div className={`w-full h-2.5 rounded-full overflow-hidden p-0.5 ${isDark ? "bg-white/[0.07]" : "bg-slate-200/90"}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.85, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      />
                    </div>
                    {nextTierText && <p className={`mt-1.5 text-[10px] font-semibold ${c.muted}`}>{nextTierText}</p>}
                    <AnimatePresence initial={false}>
                      {showAuraHelp && (
                        <motion.p
                          key="aura-help"
                          initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className={`overflow-hidden text-[10.5px] leading-relaxed mt-1.5 ${isDark ? "text-gray-300" : "text-slate-600"}`}
                        >
                          {T(
                            "Your Reading Aura shows how far you have come as a reader. Keep reading to grow it and reach the next level.",
                            "रीडिंग ऑरा दिखाता है कि आप एक पाठक के रूप में कितना आगे बढ़े हैं। पढ़ते रहिए, यह बढ़ता जाएगा और आप अगले स्तर तक पहुँचेंगे।"
                          )}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {sidebarTab === "overview" ? (
                    <motion.div
                      key="overview-tab"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
                    >
                      {/* Live stats (from existing state) - interactive to switch to shelf */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <motion.div
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          role="button"
                          tabIndex={0}
                          aria-label={T("Open my shelf", "मेरा शेल्फ खोलें")}
                          onClick={() => setSidebarTab("shelf")}
                          onKeyDown={onKeyActivate(() => setSidebarTab("shelf"))}
                          className={`rounded-2xl border p-3.5 cursor-pointer transition-all hover:border-emerald-500/45 ${sideCard}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 ${c.emerald} flex items-center justify-center border border-emerald-500/25`}>
                              <BookMarked size={17}/>
                            </span>
                            <ChevronRight size={14} className={c.faint} />
                          </div>
                          <div className="text-2xl font-black leading-none">{ownedIds.length}</div>
                          <div className={`text-[11px] font-semibold mt-1.5 ${c.muted}`}>{T("Books Owned", "मेरी किताबें")}</div>
                        </motion.div>

                        <motion.div
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          role="button"
                          tabIndex={0}
                          aria-label={T("Open my favorites", "मेरे पसंदीदा खोलें")}
                          onClick={() => setSidebarTab("shelf")}
                          onKeyDown={onKeyActivate(() => setSidebarTab("shelf"))}
                          className={`rounded-2xl border p-3.5 cursor-pointer transition-all hover:border-rose-500/45 ${sideCard}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400/25 to-rose-600/10 ${c.rose} flex items-center justify-center border border-rose-500/25`}>
                              <Heart size={17} className="fill-rose-500/30"/>
                            </span>
                            <ChevronRight size={14} className={c.faint} />
                          </div>
                          <div className="text-2xl font-black leading-none">{favIds.length}</div>
                          <div className={`text-[11px] font-semibold mt-1.5 ${c.muted}`}>{T("Favorites", "पसंदीदा")}</div>
                        </motion.div>
                      </div>

                      {/* Reward points */}
                      <Link href="/reward-points" onClick={() => setIsSidebarOpen(false)} className="group relative mt-3 flex items-center gap-3.5 rounded-2xl p-4 overflow-hidden border border-amber-500/40 bg-gradient-to-br from-amber-500/[0.22] via-amber-500/[0.08] to-transparent hover:border-amber-400/70 transition-all shadow-[0_6px_20px_rgba(212,146,26,0.12)]">
                        <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(212,146,26,0.4)]">
                          <Coins size={22}/>
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className={`block text-xs font-extrabold ${c.gold}`}>{T("Reward Points", "रिवॉर्ड पॉइंट्स")}</span>
                          <span className="block text-3xl font-black leading-tight">{profile?.reward_points || 0}</span>
                          <span className={`block text-[10px] font-medium ${c.muted}`}>{T("Tap to view your points", "अपने पॉइंट्स देखने के लिए टैप करें")}</span>
                        </span>
                        <span className={`w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/35 flex items-center justify-center ${c.amber} shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5`}>
                          <ArrowUpRight size={16} />
                        </span>
                      </Link>

                      {/* Preferences: segmented switches */}
                      <div className={`mt-3 rounded-2xl border p-3.5 flex flex-col gap-3.5 ${sideCard}`}>
                        <div className="flex justify-between items-center gap-2">
                          <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold"><Globe size={15} className={c.gold}/> Language / भाषा</span>
                          <div className={`flex p-0.5 rounded-full border ${isDark ? 'bg-black/35 border-white/[0.08]' : 'bg-white border-slate-200'}`}>
                            <button type="button" onClick={() => setLang("EN")} className={segBtn(L === "EN")}>EN</button>
                            <button type="button" onClick={() => setLang("HI")} className={segBtn(L === "HI")}>हिन्दी</button>
                          </div>
                        </div>
                        {/* THEME TOGGLE */}
                        <div className="flex justify-between items-center gap-2">
                          <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold">{isDark ? <Moon size={15} className={c.gold}/> : <Sun size={15} className={c.gold}/>} Theme / थीम</span>
                          <div className={`flex p-0.5 rounded-full border ${isDark ? 'bg-black/35 border-white/[0.08]' : 'bg-white border-slate-200'}`}>
                            <button type="button" onClick={() => { if (isDark) toggleTheme(); }} className={segBtn(!isDark)}><Sun size={13}/> {T("Light", "लाइट")}</button>
                            <button type="button" onClick={() => { if (!isDark) toggleTheme(); }} className={segBtn(isDark)}><Moon size={13}/> {T("Dark", "डार्क")}</button>
                          </div>
                        </div>
                      </div>

                      {/* Quick links (now close the dashboard when tapped) */}
                      <div className="mt-3 flex flex-col gap-2.5">
                        <Link href="/explore" onClick={() => setIsSidebarOpen(false)} className={`group flex items-center gap-3 rounded-2xl border p-3 transition-all ${sideCard} hover:border-amber-500/45`}>
                          <span className={`w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400/25 to-indigo-500/10 ${c.sky} border border-sky-400/25 flex items-center justify-center shrink-0`}><Compass size={19}/></span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-bold">{T("Explore", "एक्सप्लोर")}</span>
                            <span className={`block text-[11px] ${c.muted}`}>{T("Discover more books", "और किताबें खोजें")}</span>
                          </span>
                          <ChevronRight size={16} className={`transition-transform duration-200 group-hover:translate-x-0.5 ${c.faint}`} />
                        </Link>

                        <Link href="/quiz" onClick={() => setIsSidebarOpen(false)} className={`group flex items-center gap-3 rounded-2xl border p-3 transition-all ${sideCard} hover:border-amber-500/45`}>
                          <span className={`w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400/25 to-fuchsia-500/10 ${c.violet} border border-violet-400/25 flex items-center justify-center shrink-0`}><Brain size={19}/></span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-bold">{T("Quiz", "क्विज़")}</span>
                            <span className={`block text-[11px] ${c.muted}`}>{T("Play the quiz", "क्विज़ खेलें")}</span>
                          </span>
                          <ChevronRight size={16} className={`transition-transform duration-200 group-hover:translate-x-0.5 ${c.faint}`} />
                        </Link>
                      </div>

                      {/* Quick guide: how everything works in 4 simple steps */}
                      <div className={`mt-3 rounded-2xl border p-3.5 ${sideCard}`}>
                        <div className="flex items-center gap-2 mb-2.5">
                          <span className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                            <Lightbulb size={14} className={c.amber} />
                          </span>
                          <span className="text-xs font-extrabold">{T("Quick Guide", "आसान गाइड")}</span>
                        </div>
                        <div className="flex flex-col gap-2.5">
                          {guideSteps.map(({ Icon, color, en, hi, dEn, dHi }) => (
                            <div key={en} className="flex items-center gap-3">
                              <span className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${isDark ? 'bg-white/[0.04] border-white/[0.09]' : 'bg-white border-slate-200'} ${color}`}>
                                <Icon size={15} />
                              </span>
                              <span className="flex-1 min-w-0">
                                <span className="block text-xs font-bold">{pick(L, en, hi)}</span>
                                <span className={`block text-[10.5px] leading-snug ${c.muted}`}>{pick(L, dEn, dHi)}</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    /* INTERACTIVE QUICK SHELF TAB INSIDE DASHBOARD */
                    <motion.div
                      key="shelf-tab"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
                      className="mt-4 flex flex-col gap-4"
                    >
                      <p className={`text-[11px] leading-snug text-center ${c.muted}`}>
                        {T("Tap an owned book to read it. Tap a favorite to see its details.", "पढ़ने के लिए अपनी किताब पर टैप करें। जानकारी देखने के लिए पसंदीदा पर टैप करें।")}
                      </p>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-extrabold uppercase tracking-wider ${c.emerald} flex items-center gap-1.5`}>
                            <BookMarked size={13} /> {T("Owned Books", "मेरी किताबें")} ({ownedList.length})
                          </span>
                        </div>
                        {ownedList.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {ownedList.map((b) => (
                              <motion.div
                                key={b.id}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                role="button"
                                tabIndex={0}
                                onClick={() => { setIsSidebarOpen(false); openWebReader(b); }}
                                onKeyDown={onKeyActivate(() => { setIsSidebarOpen(false); openWebReader(b); })}
                                className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-colors hover:border-emerald-500/45 ${sideCard}`}
                              >
                                <div className="w-10 h-12 rounded-lg overflow-hidden bg-amber-500/10 border border-amber-500/20 shrink-0 flex items-center justify-center">
                                  {b.cover_path ? (
                                    <img src={`${supabaseUrl}/storage/v1/object/public/books-covers/${b.cover_path}`} alt={b.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                  ) : (
                                    <BookOpen size={16} className="text-amber-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold truncate">{b.title}</div>
                                  <div className={`text-[10px] truncate ${c.muted}`}>{T(`by ${b.author}`, `${b.author} द्वारा`)}</div>
                                </div>
                                <span className={`px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/35 ${c.emerald} text-[10px] font-extrabold shrink-0`}>
                                  {T("Read", "पढ़ें")}
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className={`rounded-2xl border p-4 text-center text-xs ${sideCard} ${isDark ? "text-gray-500" : "text-slate-500"}`}>
                            {T("No purchased books yet. Unlock any book to read it instantly!", "अभी तक कोई किताब नहीं खरीदी। कोई भी किताब अनलॉक करें और तुरंत पढ़ें!")}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs font-extrabold uppercase tracking-wider ${c.rose} flex items-center gap-1.5`}>
                            <Heart size={13} /> {T("Saved Favorites", "सेव किए पसंदीदा")} ({favList.length})
                          </span>
                        </div>
                        {favList.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {favList.map((b) => (
                              <motion.div
                                key={b.id}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                role="button"
                                tabIndex={0}
                                onClick={() => { setIsSidebarOpen(false); openBookDetails(b); }}
                                onKeyDown={onKeyActivate(() => { setIsSidebarOpen(false); openBookDetails(b); })}
                                className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-colors hover:border-amber-500/45 ${sideCard}`}
                              >
                                <div className="w-10 h-12 rounded-lg overflow-hidden bg-amber-500/10 border border-amber-500/20 shrink-0 flex items-center justify-center">
                                  {b.cover_path ? (
                                    <img src={`${supabaseUrl}/storage/v1/object/public/books-covers/${b.cover_path}`} alt={b.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                  ) : (
                                    <BookOpen size={16} className="text-amber-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold truncate">{b.title}</div>
                                  <div className={`text-[10px] truncate ${c.muted}`}>₹{b.final_price}</div>
                                </div>
                                <ChevronRight size={15} className="text-amber-500 shrink-0" />
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className={`rounded-2xl border p-4 text-center text-xs ${sideCard} ${isDark ? "text-gray-500" : "text-slate-500"}`}>
                            {T("Tap the heart icon on any book to save it here.", "किसी भी किताब पर दिल (♥) का आइकन दबाकर उसे यहाँ सेव करें।")}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer / Logout (No scroll) */}
              <div className={`relative shrink-0 p-4 border-t ${isDark ? 'border-white/[0.07] bg-black/35' : 'border-slate-200 bg-slate-50/90'}`} style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
                {showLogoutConfirm ? (
                  <div className="bg-red-500/[0.09] border border-red-500/[0.26] p-3.5 rounded-2xl text-center">
                    <p className={`text-xs font-bold mb-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{T("Are you sure you want to log out?", "क्या आप सच में लॉगआउट करना चाहते हैं?")}</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowLogoutConfirm(false)} className={`flex-1 text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer ${isDark ? 'bg-white/[0.07] text-white hover:bg-white/[0.12]' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}>{T("Cancel", "रद्द करें")}</button>
                      <button type="button" onClick={confirmLogout} className="flex-1 bg-red-500/90 text-white text-xs font-bold py-2 rounded-xl hover:bg-red-500 transition-colors cursor-pointer">{T("Yes, Logout", "हाँ, लॉगआउट")}</button>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogoutConfirm(true)}
                    className={`w-full font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm border cursor-pointer ${isDark ? 'bg-white/[0.03] border-white/[0.08] text-red-400/90 hover:bg-red-500/10 hover:text-red-400' : 'bg-white border-slate-200 text-red-500 hover:bg-red-50'}`}
                  >
                    <LogOut size={15}/> {T("Logout securely", "सुरक्षित लॉगआउट")}
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <AvatarPickerModal
            key="avatar-picker"
            isDark={isDark}
            L={L}
            profile={profile}
            AVATARS={AVATARS}
            handleSaveAvatar={handleSaveAvatar}
            onClose={() => setShowAvatarPicker(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export function VedoxaNavbar({
  isDark,
  t,
  lang,
  searchContainerRef,
  isSearchOpen,
  setIsSearchOpen,
  searchQuery,
  setSearchQuery,
  filteredBooks,
  openBookDetails,
  supabaseUrl,
  toggleTheme,
  user,
  profile,
  setIsSidebarOpen,
  setShowAuthModal
}) {
  const L = resolveLang(lang, t);
  const T = (en, hi) => pick(L, en, hi);
  const c = tone(isDark);
  const results = Array.isArray(filteredBooks) ? filteredBooks : [];
  const closeSearch = () => { setIsSearchOpen(false); setSearchQuery(""); };

  return (
    /* Responsive Navbar: solid on phones (fast), soft glass on desktop */
    <nav className={`sticky top-0 z-[500] px-3.5 py-3 md:px-8 md:py-3.5 md:backdrop-blur-xl border-b flex justify-between items-center transition-colors duration-300 ${isDark ? 'bg-[#07070d]/95 border-white/[0.08] shadow-[0_8px_28px_rgba(0,0,0,0.45)]' : 'bg-white/95 border-slate-200/90 shadow-sm'}`} style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/45 to-transparent" />

      <Link href="/brand" className="flex items-center gap-2.5 md:gap-3 group shrink-0">
        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full border border-amber-500/55 flex items-center justify-center shadow-[0_0_14px_rgba(212,146,26,0.38)] group-hover:shadow-[0_0_22px_rgba(245,158,11,0.65)] group-hover:scale-105 transition-all duration-300 ${isDark ? 'bg-[#0c0c1a]' : 'bg-white'}`}>
          <span className="font-cinzel text-lg md:text-xl font-black gold-text">V</span>
        </div>
        <span className={`font-cinzel text-base sm:text-lg md:text-2xl font-black tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t?.brand}
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Box with Outside-Click Close & Clear Button */}
        <div
          ref={searchContainerRef}
          className={`relative flex items-center border rounded-full px-3 py-1.5 transition-[width,border-color,box-shadow] duration-300 ease-out ${isSearchOpen ? 'w-44 sm:w-56 md:w-64 ring-2 ring-amber-500/30 border-amber-500/50' : 'w-10 hover:border-amber-500/45'} ${isDark ? 'bg-white/[0.05] border-white/[0.1]' : 'bg-slate-100/90 border-slate-200'}`}
        >
          <button
            type="button"
            aria-label={T("Search books", "किताबें खोजें")}
            aria-expanded={!!isSearchOpen}
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="flex items-center shrink-0 cursor-pointer text-amber-500/90 hover:text-amber-400 transition-colors"
          >
            <Search size={16} />
          </button>
          {isSearchOpen && (
            <>
              <input
                autoFocus
                type="text"
                placeholder={T("Search books...", "किताबें खोजें...")}
                aria-label={T("Search books", "किताबें खोजें")}
                className={`bg-transparent border-none outline-none text-xs ml-2 w-full ${isDark ? 'text-white placeholder-gray-500' : 'text-slate-900 placeholder-slate-400'}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") closeSearch();
                  else if (e.key === "Enter" && searchQuery && results[0]) { openBookDetails(results[0]); closeSearch(); }
                }}
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} aria-label={T("Clear search", "खोज साफ़ करें")} className="text-gray-400 hover:text-amber-500 p-0.5 shrink-0 cursor-pointer">
                  <X size={13} />
                </button>
              )}
              {/* DROP DOWN SEARCH SUGGESTIONS */}
              {searchQuery && (
                <div className={`absolute top-full mt-3 right-0 w-64 sm:w-72 max-h-72 overflow-y-auto custom-scrollbar rounded-2xl border shadow-[0_20px_50px_rgba(0,0,0,0.55)] z-[600] flex flex-col ${isDark ? 'bg-[#0c0c1a] border-white/[0.12]' : 'bg-white border-slate-200'}`}>
                  {results.length > 0 ? (
                    results.slice(0, 5).map(book => (
                      <div key={book.id} onClick={() => { openBookDetails(book); setIsSearchOpen(false); setSearchQuery(""); }} className={`px-3.5 py-2.5 text-sm cursor-pointer border-b last:border-b-0 transition-colors flex items-center gap-3 ${isDark ? 'border-white/[0.06] text-white hover:bg-white/[0.06]' : 'border-slate-100 text-slate-800 hover:bg-slate-50'}`}>
                        <div className="w-8 h-10 rounded-md overflow-hidden bg-amber-500/10 border border-amber-500/20 shrink-0 flex items-center justify-center">
                          {book.cover_path ? (
                            <img src={`${supabaseUrl}/storage/v1/object/public/books-covers/${book.cover_path}`} alt={book.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          ) : (
                            <Search size={13} className="text-amber-500/70" />
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="font-bold text-xs truncate">{book.title}</div>
                          <div className="text-[10px] opacity-70 truncate">{T(`by ${book.author}`, `${book.author} द्वारा`)}</div>
                        </div>
                        <span className={`text-xs font-extrabold ${c.gold} shrink-0`}>₹{book.final_price}</span>
                      </div>
                    ))
                  ) : (
                    <div className={`px-4 py-4 text-xs text-center ${c.faint}`}>{T("No matching books found", "कोई मिलती-जुलती किताब नहीं मिली")}</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Theme Pill on Mobile/Desktop Navbar */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.06, rotate: 12 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          aria-label={T("Toggle theme", "थीम बदलें")}
          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
            isDark
              ? "bg-white/[0.05] border-white/[0.1] text-amber-400 hover:bg-white/[0.1] hover:border-amber-400/40"
              : "bg-slate-100 border-slate-200 text-amber-600 hover:bg-slate-200"
          }`}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </motion.button>

        {/* Luxury Profile Capsule / Login CTA */}
        {user ? (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsSidebarOpen(true)}
            aria-label={T("Open dashboard", "डैशबोर्ड खोलें")}
            className={`group relative flex items-center gap-2 border pl-1 pr-2.5 sm:pr-3 py-1 rounded-full transition-all shrink-0 cursor-pointer shadow-[0_4px_14px_rgba(212,146,26,0.16)] ${
              isDark
                ? 'bg-gradient-to-r from-amber-500/[0.14] via-white/[0.05] to-white/[0.03] border-amber-500/40 hover:border-amber-400/70'
                : 'bg-gradient-to-r from-amber-50 via-white to-slate-50 border-amber-400/55 hover:border-amber-500'
            }`}
          >
            {/* Avatar with static conic gold ring + mini crown + online dot */}
            <span className="relative shrink-0">
              <span className="avatar-ring-static absolute -inset-[2px] rounded-full opacity-95" />
              <span className={`relative flex w-8 h-8 rounded-full overflow-hidden items-center justify-center border-2 ${isDark ? 'border-[#0c0c1a] bg-[#0c0c1a]' : 'border-white bg-white'}`}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt={T("Profile", "प्रोफ़ाइल")} decoding="async" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={20} className="text-amber-500/80" />
                )}
              </span>
              <span className="absolute -top-1.5 -left-1 w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center shadow-sm">
                <Crown size={9} />
              </span>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 ${isDark ? 'border-[#07070d]' : 'border-white'}`} />
            </span>

            {/* Mini Points & Name Chip */}
            <span className={`flex items-center gap-1 text-[11px] font-extrabold ${c.gold} bg-amber-500/12 border border-amber-500/30 px-2 py-0.5 rounded-full`} title={T("Reward Points", "रिवॉर्ड पॉइंट्स")}>
              <Coins size={11} />
              <span>{profile?.reward_points || 0}</span>
            </span>

            <Menu size={16} className={`transition-colors group-hover:text-amber-500 ${isDark ? "text-gray-300" : "text-slate-600"}`} />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowAuthModal(true)}
            className="btn-gold btn-shine px-4 sm:px-5 py-2 rounded-full text-xs font-extrabold shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={13} />
            <span>{T("Login", "लॉगिन")}</span>
          </motion.button>
        )}
      </div>
    </nav>
  );
}

export function VedoxaFooter({
  isDark,
  t,
  lang,
  addToast,
  user,
  setIsSidebarOpen,
  setShowAuthModal,
  handleShare
}) {
  const L = resolveLang(lang, t);
  const T = (en, hi) => pick(L, en, hi);
  const c = tone(isDark);
  const year = new Date().getFullYear();

  return (
    <>
      {/* Compact, Animated Footer Dock (About Us, Safe & Secure, Instant PDF, Share Page) */}
      <footer className={`py-6 px-4 w-full flex flex-col items-center border-t mt-auto relative z-10 ${isDark ? 'bg-gradient-to-b from-[#07070d] to-[#0a0a16] border-white/[0.07]' : 'bg-gradient-to-b from-slate-50 to-slate-100/80 border-slate-200'}`}>
        <div className={`w-full max-w-3xl rounded-3xl border p-3 sm:p-4 ${
          isDark
            ? 'bg-white/[0.03] border-white/[0.09] shadow-[0_10px_32px_rgba(0,0,0,0.45)]'
            : 'bg-white/95 border-slate-200/90 shadow-[0_8px_24px_rgba(15,23,42,0.06)]'
        }`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. About Us */}
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/about"
                className={`footer-action-pill h-full w-full px-3 py-2.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-extrabold shadow-sm ${
                  isDark
                    ? 'bg-white/[0.04] border-white/[0.09] text-gray-200 hover:border-amber-500/45 hover:text-amber-400'
                    : 'bg-slate-50/90 border-slate-200 text-slate-700 hover:border-amber-500/45 hover:text-amber-600'
                }`}
              >
                <span className={`w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 ${c.gold} flex items-center justify-center shrink-0`}>
                  <Sparkles size={13} />
                </span>
                <span className="truncate">{T("About Us", "हमारे बारे में")}</span>
              </Link>
            </motion.div>

            {/* 2. Safe & Secure */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              role="button"
              tabIndex={0}
              onClick={() => addToast(T("100% Verified & SSL Encrypted Library 🛡️", "100% वेरिफाइड और SSL एन्क्रिप्टेड लाइब्रेरी 🛡️"), "success")}
              onKeyDown={onKeyActivate(() => addToast(T("100% Verified & SSL Encrypted Library 🛡️", "100% वेरिफाइड और SSL एन्क्रिप्टेड लाइब्रेरी 🛡️"), "success"))}
              className={`footer-action-pill cursor-pointer px-3 py-2.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-extrabold shadow-sm ${
                isDark
                  ? 'bg-white/[0.04] border-white/[0.09] text-gray-200 hover:border-emerald-500/45 hover:text-emerald-400'
                  : 'bg-slate-50/90 border-slate-200 text-slate-700 hover:border-emerald-500/45 hover:text-emerald-600'
              }`}
            >
              <span className={`w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 ${c.emerald} flex items-center justify-center shrink-0`}>
                <ShieldCheck size={13} />
              </span>
              <span className="truncate">{t?.secure}</span>
            </motion.div>

            {/* 3. Instant PDF Auto-Download */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => user ? setIsSidebarOpen(true) : setShowAuthModal(true)}
              className={`footer-action-pill cursor-pointer px-3 py-2.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-extrabold shadow-sm ${
                isDark
                  ? 'bg-white/[0.04] border-white/[0.09] text-gray-200 hover:border-amber-500/45 hover:text-amber-400'
                  : 'bg-slate-50/90 border-slate-200 text-slate-700 hover:border-amber-500/45 hover:text-amber-600'
              }`}
            >
              <span className={`w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 ${c.amber} flex items-center justify-center shrink-0`}>
                <Zap size={13} />
              </span>
              <span className="truncate">{t?.instant}</span>
            </motion.button>

            {/* 4. Share Page */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className={`footer-action-pill btn-shine cursor-pointer px-3 py-2.5 rounded-2xl border border-amber-500/45 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 ${c.amber} hover:border-amber-400 flex items-center justify-center gap-2 text-xs font-extrabold shadow-[0_3px_14px_rgba(212,146,26,0.18)]`}
            >
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center shrink-0 shadow-sm">
                <Share2 size={12} />
              </span>
              <span className="truncate">{T("Share Page", "पेज शेयर करें")}</span>
            </motion.button>
          </div>
        </div>
      </footer>

      {/* Scrolling Line Loop (English + Hindi, seamless) */}
      <div className="w-full bg-amber-500/[0.03] border-t border-amber-500/[0.14] overflow-hidden cursor-pointer py-2 relative z-10" onClick={() => window.location.reload()}>
        <div className={`animate-scroll text-[10px] tracking-[0.25em] uppercase font-black flex w-max ${isDark ? 'text-amber-500/45' : 'text-amber-600/65'}`}>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="px-8">{i % 2 === 0 ? "✦ Vedoxa Library" : "✦ वेदोक्सा लाइब्रेरी"}</span>
          ))}
        </div>
      </div>

      {/* PURE SVG TRUST LOGOS SECTION */}
      <div className={`w-full py-5 flex flex-col items-center border-b relative z-10 ${isDark ? 'bg-[#090914] border-white/[0.04]' : 'bg-slate-100 border-slate-200'}`} style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
        <p className={`text-[10px] font-bold mb-3.5 tracking-widest uppercase ${c.faint}`}>{T("Trusted By & Verified Secure", "भरोसेमंद और सुरक्षित")}</p>
        <div className="flex flex-wrap justify-center items-center gap-5 md:gap-10 opacity-80 hover:opacity-100 transition-opacity duration-500 px-4">
          <div className={`flex items-center gap-2 font-bold tracking-wide text-xs sm:text-sm ${isDark ? 'text-white/85' : 'text-slate-700'}`}>
            <svg viewBox="0 0 48 48" className="h-4 sm:h-5 w-auto grayscale hover:grayscale-0 transition-all cursor-pointer">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google Verified
          </div>
          <div className="flex items-center gap-1 font-bold tracking-wide text-xs sm:text-sm">
            <svg viewBox="0 0 100 24" className="h-3.5 sm:h-4 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.44 19H7.13L16 2.776h5.36L12.44 19z" fill={isDark ? "#fff" : "#334155"}/>
              <path d="M2.57 18.99l9-16.216h5.21l-9 16.216H2.57z" fill="#3395FF"/>
              <text x="24" y="17" fill={isDark ? "#fff" : "#334155"} fontSize="16" fontWeight="bold" fontFamily="sans-serif">razorpay</text>
            </svg>
          </div>
          <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${isDark ? 'text-white/85' : 'text-slate-700'}`}>
            <ShieldCheck className="text-green-500" size={17}/> McAfee Secure
          </div>
          <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${isDark ? 'text-white/85' : 'text-slate-700'}`}>
            <Lock className="text-amber-500" size={17}/> SSL 256-bit
          </div>
        </div>
        <p className={`mt-4 text-[10px] font-medium text-center px-4 ${c.faint}`}>
          {T(`© ${year} Vedoxa Library. All rights reserved.`, `© ${year} वेदोक्सा लाइब्रेरी। सर्वाधिकार सुरक्षित।`)}
        </p>
      </div>
    </>
  );
}
