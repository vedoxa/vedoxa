// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
// UI Icons ke liye lucide-react
import {
  ShieldCheck,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Sparkles,
  Bot,
  ChevronDown,
  Search,
  CreditCard
} from "lucide-react";
// Social Media Icons ke liye react-icons (FontAwesome 6)
import {
  FaInstagram,
  FaYoutube,
  FaXTwitter,
  FaFacebook
} from "react-icons/fa6";
import { createClient } from "@supabase/supabase-js";

// Sirf books ki live ginti ke liye (login/session ki zarurat nahi)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/* =========================================================
   STYLES (keyframes) - 'float' naam purane bot button ke liye same rakha hai
   ========================================================= */
const ABOUT_CSS = `
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
@keyframes ab-float-soft { 0%,100% { transform: translate3d(0,0,0) rotate(0deg); } 50% { transform: translate3d(0,-12px,0) rotate(5deg); } }
@keyframes ab-drift-a { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(6%,5%,0); } }
@keyframes ab-drift-b { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(-6%,-4%,0); } }
@keyframes ab-shimmer { 0% { background-position: 0% 50%; } 100% { background-position: 200% 50%; } }
@keyframes ab-glow { 0%,100% { opacity: .5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.07); } }
@keyframes ab-shine { 0% { transform: translateX(-150%) skewX(-20deg); } 55%,100% { transform: translateX(350%) skewX(-20deg); } }
@keyframes ab-ring { 0% { transform: scale(1); opacity: .45; } 100% { transform: scale(1.9); opacity: 0; } }
.ab-floater { animation: ab-float-soft 6s ease-in-out infinite; will-change: transform; }
.ab-orb { position: absolute; border-radius: 9999px; will-change: transform; }
.ab-orb-a { top: -18%; left: -22%; width: 72vmax; height: 72vmax; background: radial-gradient(circle, rgba(234,179,8,.12), transparent 62%); animation: ab-drift-a 24s ease-in-out infinite; }
.ab-orb-b { bottom: -22%; right: -22%; width: 72vmax; height: 72vmax; background: radial-gradient(circle, rgba(139,92,246,.15), transparent 62%); animation: ab-drift-b 28s ease-in-out infinite; }
.ab-shimmer-text { background-size: 200% auto; animation: ab-shimmer 6s linear infinite; }
.ab-glow { animation: ab-glow 2.3s ease-in-out infinite; will-change: transform, opacity; }
.ab-shine { animation: ab-shine 3.4s ease-in-out infinite; will-change: transform; }
.ab-ring { animation: ab-ring 2.6s ease-out infinite; }
@media (prefers-reduced-motion: reduce) {
  .ab-floater, .ab-orb, .ab-shimmer-text, .ab-glow, .ab-shine, .ab-ring, .ab-bot { animation: none !important; }
}
`;

const FLOATERS = [
  { Icon: BookOpen, cls: "left-[2%] top-[4%]", d: "0s", s: 28 },
  { Icon: Sparkles, cls: "right-[4%] top-[2%]", d: "1.2s", s: 22 },
  { Icon: ShieldCheck, cls: "left-[6%] bottom-[8%]", d: "2.2s", s: 24 },
  { Icon: Sparkles, cls: "right-[8%] bottom-[14%]", d: "0.7s", s: 18 },
];

/* =========================================================
   SMALL REUSABLE COMPONENTS
   ========================================================= */

// Scroll karne par smoothly dikhne wala wrapper (sirf ek baar chalta hai = fast)
function Reveal({ children, delay = 0, y = 24, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Number 0 se ginti shuru karke upar tak jata hai (screen par aate hi)
function CountUp({ to, duration = 1400 }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce || typeof IntersectionObserver === "undefined") {
      setVal(to);
      return;
    }
    let raf = 0;
    let started = false;
    const run = () => {
      const t0 = performance.now();
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        setVal(Math.round(to * (1 - Math.pow(1 - p, 3))));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          run();
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to, reduce]);

  return <span ref={ref}>{val}</span>;
}

function FaqItem({ q, a, open, onToggle }) {
  return (
    <div
      className={`rounded-2xl border transition-colors duration-300 ${
        open ? "border-yellow-500/30 bg-yellow-500/[0.05]" : "border-white/10 bg-white/5 hover:border-white/20"
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 p-5 text-left"
      >
        <span className="font-bold text-white">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="shrink-0 text-yellow-500"
        >
          <ChevronDown size={20} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="px-5 pb-5 text-sm leading-relaxed text-gray-400">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* =========================================================
   PAGE
   ========================================================= */
export default function AboutPage() {
  const reduce = useReducedMotion();

  const socialLinks = [
    { name: "Instagram", icon: <FaInstagram size={24} />, url: "https://www.instagram.com/vedoxa.shop?utm_source=qr&igsh=ZnNrbjUxeGI0NTM3", color: "hover:text-pink-500" },
    { name: "YouTube", icon: <FaYoutube size={24} />, url: "https://www.youtube.com/@vedoxa1", color: "hover:text-red-500" },
    { name: "X (Twitter)", icon: <FaXTwitter size={24} />, url: "https://x.com/Vedoxa", color: "hover:text-blue-400" },
    { name: "Facebook", icon: <FaFacebook size={24} />, url: "https://www.facebook.com/share/1AvX47PdWn/", color: "hover:text-blue-600" },
    { name: "ShareChat", icon: <MessageCircle size={24} />, url: "https://sharechat.com/profile/vedoxa?d=n", color: "hover:text-yellow-400" }
  ];

  const trustCards = [
    {
      Icon: ShieldCheck,
      title: "100% Secure & Verified",
      text: "Our digital library ensures bank-grade 256-bit secure payments and authentic content verified by experts.",
    },
    {
      Icon: Sparkles,
      title: "Instant Access",
      text: "Experience seamless learning with instant auto-downloads and our specialized built-in web reader.",
    },
    {
      Icon: BookOpen,
      title: "Try Before You Buy",
      text: "Flip through a free sample on the book page first, and buy only when it feels right for you.",
    },
    {
      Icon: Bot,
      title: "Always Here to Help",
      text: "Stuck anywhere? Tap the chat bot at the bottom-right corner and reach our support page in one tap.",
    },
  ];

  const steps = [
    { Icon: Search, title: "Find your book", text: "Browse the library and flip through a free sample to see if it speaks to you." },
    { Icon: CreditCard, title: "Buy in a few taps", text: "Check out securely and your book unlocks right away." },
    { Icon: BookOpen, title: "Read or download", text: "Read online in the built-in web reader, or download the PDF to keep." },
  ];

  const missionTopics = ["Spirituality", "Psychology", "Self-knowledge", "Mental peace"];

  const faqs = [
    {
      q: "What kind of books will I find on Vedoxa?",
      a: "Authentic spiritual and psychological knowledge, in original, verified and high-quality e-books made to help you understand life better.",
    },
    {
      q: "Can I preview a book before buying?",
      a: "Yes. Open any book and tap Free sample to flip through a few pages before you decide.",
    },
    {
      q: "How do I read my book after buying?",
      a: "Instantly. Read it online in the built-in web reader, or download the PDF from the book page.",
    },
    {
      q: "I need help. Where can I ask?",
      a: "Tap the chat bot button at the bottom-right corner of the screen and it will take you to our support page.",
    },
  ];

  const [bookCount, setBookCount] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);
  const [showTop, setShowTop] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const barRef = useRef(null);

  // Library me kitni books hain (live)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { count, error } = await supabase
          .from("books")
          .select("*", { count: "exact", head: true });
        if (!error && !cancelled && typeof count === "number") setBookCount(count);
      } catch (e) {
        console.error("Book count failed:", e);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Scroll progress bar + back-to-top (re-render sirf tab jab zarurat ho)
  useEffect(() => {
    let ticking = false;
    const update = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      const next = window.scrollY > 500;
      setShowTop((prev) => (prev === next ? prev : next));
      ticking = false;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Bot ke paas chhota sa madad wala message
  useEffect(() => {
    const t1 = setTimeout(() => setShowHint(true), 2200);
    const t2 = setTimeout(() => setShowHint(false), 9000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const stats = [
    bookCount > 0 && { value: <CountUp to={bookCount} />, label: "Books in library" },
    { value: <><CountUp to={100} />%</>, label: "Original content" },
    { value: <CountUp to={socialLinks.length} />, label: "Community platforms" },
    { value: "Instant", label: "Access to your books" },
  ].filter(Boolean);

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#06060a] font-sans text-gray-200 selection:bg-yellow-500/30">
      <style>{ABOUT_CSS}</style>

      {/* Scroll progress */}
      <div
        ref={barRef}
        aria-hidden="true"
        className="fixed left-0 top-0 z-[600] h-[3px] w-full origin-left bg-gradient-to-r from-yellow-500 via-amber-300 to-pink-400"
        style={{ transform: "scaleX(0)", willChange: "transform" }}
      />

      {/* Soft living background (gradients only = no lag) */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="ab-orb ab-orb-a" />
        <div className="ab-orb ab-orb-b" />
      </div>

      {/* Simple Header */}
      <motion.nav
        initial={reduce ? false : { y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="sticky top-0 z-[500] flex items-center justify-between border-b border-white/10 bg-black/70 px-4 py-4 backdrop-blur-lg md:px-8"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <ShieldCheck className="h-6 w-6 text-yellow-500 md:h-8 md:w-8" />
          <span className="font-serif text-lg font-black uppercase tracking-widest text-white md:text-2xl">Vedoxa</span>
        </div>
        <Link
          href="/"
          className="group flex items-center gap-2 rounded-full px-3 py-2 text-sm font-bold text-gray-400 transition hover:bg-white/5 hover:text-yellow-500"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to Home
        </Link>
      </motion.nav>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-4xl px-4 py-12 md:py-20">

        {/* Title Section */}
        <div className="relative mb-12 text-center md:mb-14">
          {FLOATERS.map(({ Icon, cls, d, s }, i) => (
            <span
              key={i}
              aria-hidden="true"
              className={`ab-floater pointer-events-none absolute ${cls} text-yellow-500/30`}
              style={{ animationDelay: d }}
            >
              <Icon size={s} />
            </span>
          ))}

          <h1 className="relative mb-4 font-serif text-4xl font-black text-white md:text-6xl">
            <motion.span
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-block"
            >
              About
            </motion.span>{" "}
            <motion.span
              initial={reduce ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: "easeOut" }}
              className="ab-shimmer-text inline-block bg-gradient-to-r from-yellow-500 via-yellow-200 to-yellow-500 bg-clip-text text-transparent"
            >
              Vedoxa
            </motion.span>
          </h1>

          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto max-w-2xl text-lg text-gray-400"
          >
            Awakening minds through the power of authentic spiritual and psychological knowledge.
          </motion.p>

          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.38 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-2"
          >
            {missionTopics.map((tp) => (
              <span
                key={tp}
                className="rounded-full border border-yellow-500/20 bg-yellow-500/[0.07] px-3.5 py-1.5 text-xs font-semibold text-yellow-200/90"
              >
                {tp}
              </span>
            ))}
          </motion.div>
        </div>

        {/* Quick stats */}
        <Reveal className="mb-14 md:mb-16">
          <div className="flex flex-wrap justify-center gap-3">
            {stats.map((s, i) => (
              <div
                key={i}
                className="w-[calc(50%-0.375rem)] rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center md:w-44"
              >
                <div className="font-serif text-2xl font-black text-white md:text-3xl">{s.value}</div>
                <div className="mt-1 text-xs font-medium text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Story Section */}
        <Reveal className="mb-12">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl md:p-12">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute right-0 top-0 h-72 w-72 rounded-full"
              style={{ background: "radial-gradient(circle, rgba(234,179,8,.14), transparent 65%)" }}
            />

            <div className="relative mb-6 flex items-center gap-4">
              <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-yellow-500/10 text-yellow-500">
                <span aria-hidden="true" className="ab-ring absolute inset-0 rounded-2xl border border-yellow-500/40" />
                <BookOpen className="h-7 w-7" />
              </span>
              <h2 className="text-2xl font-bold text-white">Our Mission</h2>
            </div>

            <div className="relative space-y-4 text-sm leading-relaxed text-gray-300 md:text-base">
              <Reveal delay={0.05} y={14}>
                <p>
                  वेडोक्सा (Vedoxa) सिर्फ एक डिजिटल ई-बुक स्टोर नहीं है, बल्कि यह आत्म-ज्ञान और मानसिक विकास की एक यात्रा है। हमारा मुख्य उद्देश्य आपको आध्यात्मिकता (Spirituality) और मनोविज्ञान (Psychology) का वो गहरा ज्ञान प्रदान करना है, जो जीवन को देखने का नज़रिया बदल सके।
                </p>
              </Reveal>
              <Reveal delay={0.15} y={14}>
                <p>
                  हम मानते हैं कि सही ज्ञान इंसान की चेतना (Consciousness) को जागृत कर सकता है। इसीलिए हम 100% ऑरिजिनल, वेरिफाइड और उच्च गुणवत्ता वाली ई-बुक्स आपके लिए लाते हैं, ताकि आप जीवन की उलझनों को समझ सकें और मानसिक शांति प्राप्त कर सकें।
                </p>
              </Reveal>
            </div>
          </div>
        </Reveal>

        {/* Why Trust Us Section */}
        <div className="mb-16 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          {trustCards.map(({ Icon, title, text }, i) => (
            <Reveal key={title} delay={(i % 2) * 0.1}>
              <div className="group h-full rounded-2xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-yellow-500/30 hover:bg-white/[0.07]">
                <span className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-yellow-500/10 text-yellow-500 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-7 w-7" />
                </span>
                <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
                <p className="text-sm text-gray-400">{text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* How it works */}
        <section className="mb-20">
          <Reveal className="mb-9 text-center">
            <h2 className="mb-2 font-serif text-2xl font-bold text-white md:text-3xl">How Vedoxa works</h2>
            <p className="text-sm text-gray-400">Teen aasan steps me apni pasand ki kitaab tak</p>
          </Reveal>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map(({ Icon, title, text }, i) => (
              <Reveal key={title} delay={i * 0.12}>
                <div className="relative h-full rounded-2xl border border-white/10 bg-white/5 p-6 pt-9 text-center">
                  <span className="absolute left-1/2 top-0 grid h-8 w-8 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-yellow-500 text-sm font-black text-black shadow-[0_0_20px_rgba(234,179,8,0.45)]">
                    {i + 1}
                  </span>
                  <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-yellow-500/10 text-yellow-500">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mb-2 text-lg font-bold text-white">{title}</h3>
                  <p className="text-sm text-gray-400">{text}</p>
                  {i < steps.length - 1 && (
                    <ArrowRight
                      aria-hidden="true"
                      size={18}
                      className="absolute top-1/2 -right-[25px] hidden -translate-y-1/2 text-yellow-500/40 md:block"
                    />
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Social Media Section */}
        <div className="text-center">
          <Reveal>
            <h2 className="mb-8 text-2xl font-bold text-white">Join Our Community</h2>
          </Reveal>
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((social, index) => (
              <Reveal key={index} delay={index * 0.07} y={18}>
                <a
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Vedoxa on ${social.name}`}
                  className={`flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-gray-300 transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_10px_20px_rgba(234,179,8,0.1)] active:scale-95 ${social.color}`}
                >
                  {social.icon}
                  <span>{social.name}</span>
                </a>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.2}>
            <p className="mt-8 text-sm text-gray-500">
              Stay connected with us on social media for daily insights, new book launches, and spiritual awakening quotes.
            </p>
          </Reveal>
        </div>

        {/* FAQ */}
        <section className="mt-20">
          <Reveal className="mb-8 text-center">
            <h2 className="mb-2 font-serif text-2xl font-bold text-white md:text-3xl">Questions you may have</h2>
            <p className="text-sm text-gray-400">Kuch bhi poochhna ho, shayad jawab yahin hai</p>
          </Reveal>
          <div className="mx-auto flex max-w-2xl flex-col gap-3">
            {faqs.map((f, i) => (
              <Reveal key={f.q} delay={i * 0.06} y={14}>
                <FaqItem
                  q={f.q}
                  a={f.a}
                  open={openFaq === i}
                  onToggle={() => setOpenFaq(openFaq === i ? null : i)}
                />
              </Reveal>
            ))}
          </div>
        </section>

        {/* Final call to action */}
        <Reveal className="mt-20">
          <div className="relative overflow-hidden rounded-3xl border border-yellow-500/20 bg-gradient-to-br from-yellow-500/[0.10] via-white/[0.03] to-transparent p-8 text-center md:p-12">
            <h2 className="mb-3 font-serif text-2xl font-black text-white md:text-4xl">Ready to begin your journey?</h2>
            <p className="mx-auto mb-8 max-w-md text-gray-400">
              Explore the library and find the book that speaks to you.
            </p>
            <div className="relative mx-auto w-full max-w-xs">
              <span
                aria-hidden="true"
                className="ab-glow pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 opacity-70 blur-xl"
              />
              <Link
                href="/"
                className="relative flex items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-400 px-6 py-4 text-lg font-black text-black shadow-lg ring-1 ring-yellow-200/40 transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
              >
                <span
                  aria-hidden="true"
                  className="ab-shine pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-white/40 blur-md"
                />
                <BookOpen size={20} className="relative" />
                <span className="relative">Explore the library</span>
                <ArrowRight size={20} className="relative" />
              </Link>
            </div>
          </div>
        </Reveal>

        {/* Footer */}
        <footer className="mt-16 flex flex-col items-center gap-3 border-t border-white/5 pt-8 text-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-yellow-500" />
            <span className="font-serif text-base font-black uppercase tracking-widest text-white">Vedoxa</span>
          </div>
          <div className="flex items-center gap-5 text-sm font-semibold text-gray-400">
            <Link href="/" className="transition hover:text-yellow-500">Home</Link>
            <Link href="/support" className="transition hover:text-yellow-500">Support</Link>
          </div>
          <p className="text-xs text-gray-600">© {new Date().getFullYear()} Vedoxa</p>
        </footer>

        {/* Back to top */}
        <AnimatePresence>
          {showTop && (
            <motion.button
              key="top"
              type="button"
              aria-label="Back to top"
              onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              className="fixed right-10 z-[4900] grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-[#14111f]/90 text-gray-300 shadow-lg transition-colors hover:border-yellow-500/50 hover:text-yellow-500"
              style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 6.5rem)" }}
            >
              <ArrowUp size={18} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Bot Button */}
        <div
          className="fixed bottom-8 right-8 z-[5000] flex flex-col items-center gap-4"
          style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 2rem)" }}
        >
          <AnimatePresence>
            {showHint && (
              <span key="hint" className="pointer-events-none absolute right-[4.25rem] top-1/2 -translate-y-1/2">
                <motion.div
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25 }}
                  className="whitespace-nowrap rounded-2xl rounded-br-sm border border-yellow-500/30 bg-[#14111f] px-4 py-2 text-sm font-semibold text-yellow-100 shadow-xl"
                >
                  Need help? Chat with us 💬
                </motion.div>
              </span>
            )}
          </AnimatePresence>

          <Link
            href="/support"
            aria-label="Open support chat"
            className="ab-bot relative flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-gradient-to-tr from-yellow-600 to-yellow-400 text-black shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-transform hover:scale-110"
            style={{ animation: "float 3s ease-in-out infinite" }}
          >
            <Bot size={28} className="drop-shadow-md" />
            <div className="absolute -right-1 -top-1 h-4 w-4 animate-pulse rounded-full border-2 border-black bg-red-500"></div>
          </Link>
        </div>

      </main>
    </div>
  );
}
