'use client';

import React, { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, Heart, Loader2, Info, Shield, Zap, Terminal, X, Lock } from "lucide-react";

// Put this file at app/<your-route>/page.jsx
// Needs: framer-motion, lucide-react, tailwindcss, /public/logo.svg, NEXT_PUBLIC_RAZORPAY_KEY_ID in .env

/* ------------------------------------------------------------------ */
/* Root: switches between the brand view and the System Codex panel    */
/* ------------------------------------------------------------------ */
export default function VedoxaPage() {
  const [view, setView] = useState("brand"); // 'brand' | 'system'

  // Deep link (#system) + Esc to close
  useEffect(() => {
    if (window.location.hash === "#system") setView("system");
    const onKey = (e) => e.key === "Escape" && setView("brand");
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const url = view === "system" ? "#system" : window.location.pathname + window.location.search;
    window.history.replaceState(null, "", url);
  }, [view]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#06060a] font-sans text-white">
      <BrandPage onOpen={() => setView("system")} />

      <AnimatePresence>
        {view === "system" && (
          <motion.div
            key="system"
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 90, damping: 22 }}
            className="fixed inset-0 z-50 overflow-y-auto overscroll-contain rounded-t-[2.25rem] bg-gradient-to-b from-[#15110a] to-[#06060a]"
          >
            <SystemPanel onClose={() => setView("brand")} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Brand page                                                          */
/* ------------------------------------------------------------------ */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

const AMOUNTS = [100, 200, 500, 1000];

function BrandPage({ onOpen }) {
  const reduce = useReducedMotion();
  const [particles, setParticles] = useState([]);
  const [amount, setAmount] = useState(100);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [celebrate, setCelebrate] = useState(false);

  useEffect(() => {
    setParticles(
      Array.from({ length: 34 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        size: 2 + Math.random() * 3,
        duration: 8 + Math.random() * 9,
        delay: Math.random() * 8,
      }))
    );
  }, []);

  const donate = async () => {
    if (!amount || amount < 10) return setError("Minimum contribution is ₹10.");
    setError("");
    setProcessing(true);
    const ok = await loadRazorpayScript();
    if (!ok) {
      setProcessing(false);
      return setError("Couldn’t load the payment gateway. Check your connection and try again.");
    }
    const rzp = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
      amount: Math.round(amount * 100),
      currency: "INR",
      name: "VEDOXA Contribution",
      description: "Contribute to Enlightenment",
      theme: { color: "#eab308" },
      modal: { ondismiss: () => setProcessing(false) },
      handler: () => {
        setProcessing(false);
        setCelebrate(true);
        setTimeout(() => setCelebrate(false), 6000);
      },
    });
    rzp.open();
    // Keep the button busy until the checkout is dismissed or completed
  };

  return (
    <div
      className={`relative flex h-screen w-full flex-col items-center justify-center overflow-y-auto px-5 py-24 transition-colors duration-1000 ${
        celebrate ? "bg-[#1a1405]" : "bg-[#06060a]"
      }`}
    >
      {/* soft ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(234,179,8,0.12),transparent_60%)]" />

      {/* particles */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {particles.map((p) => (
            <motion.span
              key={p.id}
              className="absolute bottom-0 rounded-full bg-yellow-500/40"
              style={{ left: `${p.left}%`, width: p.size, height: p.size }}
              initial={{ y: 0, opacity: 0 }}
              animate={{ y: "-105vh", opacity: [0, 0.6, 0] }}
              transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "linear" }}
            />
          ))}
        </div>
      )}

      {/* top bar */}
      <Link
        href="/"
        className="absolute left-5 top-6 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-400 backdrop-blur-md transition hover:-translate-y-0.5 hover:text-white active:scale-95"
      >
        <ArrowLeft size={16} /> Library
      </Link>
      <button
        onClick={onOpen}
        aria-label="Open system info"
        className="absolute right-5 top-6 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-400 shadow-lg backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-yellow-400/50 hover:bg-yellow-400/10 hover:text-yellow-400 hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] active:scale-95"
      >
        <Info size={16} /> System
      </button>

      {/* hero */}
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <motion.div
          animate={reduce ? {} : { y: [0, -8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative mb-5 h-28 w-28 md:h-32 md:w-32"
        >
          {!reduce &&
            [0, 1.5].map((d) => (
              <motion.span
                key={d}
                className="absolute -inset-2 rounded-full border border-yellow-500/50"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 3, delay: d, repeat: Infinity, ease: "easeOut" }}
              />
            ))}
          <div className="absolute inset-0 rounded-full border border-yellow-500/30 bg-yellow-500/10 shadow-[0_0_50px_rgba(234,179,8,0.25)]" />
          <Image src="/logo.svg" alt="VEDOXA logo" fill priority className="object-contain p-5" />
        </motion.div>

        <h1
          className="mb-2 bg-[linear-gradient(100deg,#fff_30%,#eab308_50%,#fff_70%)] bg-[length:220%_100%] bg-clip-text pl-[0.14em] text-6xl font-black tracking-[0.14em] text-transparent md:text-7xl animate-[vshine_6s_linear_infinite]"
          style={{ fontFamily: "Cinzel, serif" }}
        >
          VEDOXA
        </h1>
        <p className="mb-10 text-sm font-bold uppercase tracking-[0.3em] text-yellow-500">
          Awaken Your Consciousness
        </p>

        {/* contribution card */}
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 90, damping: 16, delay: 0.15 }}
          className="relative w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 text-left shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
        >
          <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-yellow-500/70 to-transparent" />
          <h2 className="mb-1 text-xl font-bold">Contribute to the Mission</h2>
          <p className="mb-5 text-sm leading-relaxed text-gray-400">
            Every contribution keeps the library free, ad-light and growing.
          </p>

          <div className="mb-3 grid grid-cols-2 gap-3">
            {AMOUNTS.map((a) => (
              <motion.button
                key={a}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setAmount(a); setError(""); }}
                className={`rounded-2xl border py-3.5 font-bold transition-all ${
                  amount === a
                    ? "scale-[1.03] border-yellow-500 bg-yellow-500 text-black shadow-[0_10px_26px_-8px_rgba(234,179,8,0.7)]"
                    : "border-white/10 bg-white/5 text-white hover:-translate-y-0.5 hover:border-yellow-500/50"
                }`}
              >
                ₹{a}
              </motion.button>
            ))}
          </div>

          <div className="group relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 transition-colors group-focus-within:text-yellow-500">₹</span>
            <input
              type="number"
              inputMode="numeric"
              min={10}
              value={amount || ""}
              onChange={(e) => { setAmount(Number(e.target.value)); setError(""); }}
              aria-label="Contribution amount in rupees"
              className="w-full rounded-2xl border border-white/10 bg-black/40 p-4 pl-9 text-lg font-bold text-white outline-none transition-all focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/15"
            />
          </div>
          <p className="mb-3 mt-2 min-h-[1.25rem] text-xs text-red-400" role="alert">{error}</p>

          <button
            onClick={donate}
            disabled={processing}
            className="relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 py-4 text-base font-extrabold text-black shadow-[0_14px_34px_-10px_rgba(234,179,8,0.8)] transition-all hover:-translate-y-0.5 active:scale-[0.97] disabled:cursor-wait disabled:opacity-70"
          >
            {processing ? <Loader2 className="animate-spin" /> : <><Heart size={18} className="fill-black" /> Contribute now</>}
          </button>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {["UPI", "Cards", "Net Banking", "Secured by Razorpay"].map((c) => (
              <span key={c} className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-semibold text-gray-400">{c}</span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* thank-you overlay */}
      <AnimatePresence>
        {celebrate && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setCelebrate(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 160, damping: 14 }}
              className="rounded-[2.5rem] border border-yellow-500/40 bg-gradient-to-b from-yellow-400/20 to-transparent px-10 py-12 text-center shadow-[0_0_90px_rgba(234,179,8,0.35)]"
            >
              <h2 className="mb-3 text-4xl font-black text-yellow-400" style={{ fontFamily: "Cinzel, serif" }}>Gratitude ✨</h2>
              <p className="text-lg text-white">Your light joins ours in this mission.</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes vshine { to { background-position: -220% 0; } }
      `}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* System Codex panel                                                  */
/* ------------------------------------------------------------------ */
const container = { hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.25 } } };
const item = {
  hidden: { opacity: 0, y: 28, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 90, damping: 16 } },
};

const CARDS = [
  { icon: Shield, title: "Mission", text: "Awaken consciousness through calm, immersive digital experiences that blend ancient wisdom with modern craft." },
  { icon: Zap, title: "Architecture", text: "Built on Next.js with fluid motion, lightweight pages and encrypted checkout, so it stays fast on every device." },
  { icon: Terminal, title: "Status", text: "Platform online. Contributions are processed securely through Razorpay and confirmed instantly." },
];

const ALLOCATION = [
  { label: "Library & content", pct: 40 },
  { label: "Servers & security", pct: 35 },
  { label: "Community & outreach", pct: 25 },
];

const FAQ = [
  { q: "Is my payment safe?", a: "Yes. Payments run through Razorpay’s encrypted checkout. VEDOXA never sees or stores your card or UPI details." },
  { q: "What is the minimum contribution?", a: "The minimum is ₹10. Choose a preset or enter any amount above that." },
  { q: "Will I get a confirmation?", a: "You’ll see an instant confirmation on screen, and Razorpay sends a receipt to the contact you provide." },
];

function SystemPanel({ onClose }) {
  const [now, setNow] = useState("");
  useEffect(() => {
    const tick = () => setNow(new Date().toLocaleTimeString());
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative min-h-full px-5 pb-16 pt-24 md:px-12">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(#eab308 1px, transparent 1px), linear-gradient(90deg, #eab308 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />

      <button
        onClick={onClose}
        aria-label="Close system info"
        className="fixed right-5 top-6 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-300 shadow-xl backdrop-blur-md transition-all hover:bg-yellow-500 hover:text-black active:scale-95"
      >
        <X size={16} /> Close
      </button>

      <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 mx-auto max-w-5xl">
        <motion.div variants={item} className="flex flex-wrap items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          All systems operational <span className="text-gray-500">{now}</span>
        </motion.div>

        <motion.h1 variants={item} className="mb-3 mt-4 text-5xl font-extrabold leading-none tracking-wide text-white md:text-7xl" style={{ fontFamily: "Cinzel, serif" }}>
          System Codex
        </motion.h1>
        <motion.p variants={item} className="mb-10 max-w-xl leading-relaxed text-gray-400">
          VEDOXA is a quiet corner of the internet for reading, reflection and inner growth. Here’s how it works and where your support goes.
        </motion.p>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {CARDS.map(({ icon: Icon, title, text }) => (
            <motion.article
              key={title}
              variants={item}
              whileHover={{ y: -6 }}
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl backdrop-blur-md transition-colors hover:border-yellow-500/40"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-yellow-500/15 text-yellow-500">
                <Icon size={22} />
              </div>
              <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.14em]">{title}</h3>
              <p className="text-sm leading-relaxed text-gray-400">{text}</p>
            </motion.article>
          ))}
        </div>

        <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <motion.div variants={item}><BreatheSync /></motion.div>

          <motion.div variants={item} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-md">
            <h3 className="text-sm font-bold uppercase tracking-[0.14em]">Where support goes</h3>
            <p className="mb-2 text-xs text-gray-500">Indicative split of contributions.</p>
            {ALLOCATION.map((r, i) => (
              <div key={r.label} className="mt-5">
                <div className="mb-2 flex justify-between text-sm font-semibold">
                  <span>{r.label}</span><span className="text-yellow-500">{r.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${r.pct}%` }}
                    transition={{ duration: 1.3, delay: 0.7 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div variants={item} className="rounded-3xl border border-white/10 bg-white/[0.04] px-6 py-2 backdrop-blur-md">
          {FAQ.map((f) => <FaqRow key={f.q} {...f} />)}
        </motion.div>

        <motion.div variants={item} className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[11px] uppercase tracking-widest text-gray-500">
          <span className="flex items-center gap-2"><Lock size={12} /> Secure uplink</span>
          <span>© 2026 VEDOXA</span>
        </motion.div>
      </motion.div>
    </div>
  );
}

function FaqRow({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 py-4 text-left font-semibold">
        {q}
        <motion.span animate={{ rotate: open ? 45 : 0 }} className="text-xl leading-none text-yellow-500">+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden pb-4 text-sm leading-relaxed text-gray-400"
          >
            {a}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Breathe Sync: guided inhale / hold / exhale orb (4 rounds, ~56s) */
const PHASES = [
  { label: "Inhale", scale: 1, seconds: 4 },
  { label: "Hold", scale: 1, seconds: 4 },
  { label: "Exhale", scale: 0.62, seconds: 6 },
];

function BreatheSync() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(null);
  const [done, setDone] = useState(false);
  const timers = useRef([]);

  const clear = useCallback(() => { timers.current.forEach(clearTimeout); timers.current = []; }, []);
  useEffect(() => clear, [clear]);

  const stop = useCallback(() => { clear(); setRunning(false); setPhase(null); }, [clear]);

  const start = () => {
    clear();
    setDone(false);
    setRunning(true);
    let t = 0;
    for (let round = 0; round < 4; round++) {
      PHASES.forEach((p) => {
        timers.current.push(setTimeout(() => setPhase(p), t * 1000));
        t += p.seconds;
      });
    }
    timers.current.push(setTimeout(() => { stop(); setDone(true); }, t * 1000));
  };

  const current = phase || { label: done ? "Done" : "Ready", scale: 0.62, seconds: 0.6 };

  return (
    <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 text-center backdrop-blur-md">
      <h3 className="text-sm font-bold uppercase tracking-[0.14em]">Breathe Sync</h3>
      <p className="text-xs text-gray-500">A one-minute reset. Follow the orb.</p>
      <div className="flex h-52 items-center justify-center">
        <motion.div
          animate={{ scale: current.scale }}
          transition={{ duration: current.seconds, ease: "easeInOut" }}
          className="flex h-40 w-40 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff3b0,#eab308_45%,#a16207)] shadow-[0_0_60px_rgba(234,179,8,0.45)]"
        >
          <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#2a1c00]">{current.label}</span>
        </motion.div>
      </div>
      <button
        onClick={running ? stop : start}
        className="rounded-full border border-yellow-500 px-6 py-2 text-xs font-bold uppercase tracking-widest text-yellow-500 transition hover:bg-yellow-500 hover:text-black active:scale-95"
      >
        {running ? "Stop" : done ? "Again" : "Begin"}
      </button>
    </div>
  );
}
