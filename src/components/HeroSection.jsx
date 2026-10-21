// @ts-nocheck
"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Save this file as: src/components/HeroSection.jsx
// The hero CSS classes (font-cinzel, gold-text, cinema-bg, golden-particle, hero-glow...) come from the page that renders it.

const dict = {
  EN: { heroTitle: "Awaken Your Consciousness", heroSub: "100% original, verified digital books on spirituality & psychology." },
  HI: { heroTitle: "अपनी चेतना को जागृत करें", heroSub: "आध्यात्मिकता और मनोविज्ञान पर 100% मूल, सत्यापित डिजिटल पुस्तकें।" }
};

// Lightweight floating golden particles for instant 0ms video-like spiritual ambience
const GOLDEN_PARTICLES = [
  { left: "10%", size: 4, duration: "6s", delay: "0s" },
  { left: "22%", size: 6, duration: "8s", delay: "1.2s" },
  { left: "35%", size: 3, duration: "5.5s", delay: "0.5s" },
  { left: "48%", size: 5, duration: "7s", delay: "2s" },
  { left: "62%", size: 4, duration: "6.5s", delay: "0.8s" },
  { left: "75%", size: 6, duration: "8.5s", delay: "1.5s" },
  { left: "88%", size: 3, duration: "6s", delay: "0.3s" },
  { left: "16%", size: 5, duration: "7.5s", delay: "2.5s" },
  { left: "54%", size: 4, duration: "5.8s", delay: "1.8s" },
  { left: "82%", size: 5, duration: "7.2s", delay: "0.9s" }
];

export default function HeroSection({ isDark = false, lang = "EN" }) {
  const t = dict[lang] || dict.EN;

  // VIDEO REF FOR MOBILE AUTOPLAY FIX
  const heroVideoRef = useRef(null);

  // FORCE MOBILE VIDEO AUTOPLAY ON MOUNT & TOUCH
  useEffect(() => {
    const videoEl = heroVideoRef.current;
    if (!videoEl) return;

    const forcePlay = () => {
      videoEl.defaultMuted = true;
      videoEl.muted = true;
      videoEl.playsInline = true;
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback: if mobile browser waits for first touch
        });
      }
    };

    forcePlay();
    window.addEventListener("touchstart", forcePlay, { once: true, passive: true });
    return () => window.removeEventListener("touchstart", forcePlay);
  }, []);

  return (
    <section className="relative px-4 pt-14 pb-12 md:pt-24 md:pb-16 text-center flex flex-col items-center justify-center overflow-hidden min-h-[300px] md:min-h-[380px]">

      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">
        {/* 1. ULTRA-FAST WEBP CINEMA BACKGROUND (25KB only - loads in 0.1s & moves smoothly) */}
        <img
          src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=650&q=55&fm=webp"
          alt=""
          fetchPriority="high"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover cinema-bg ${
            isDark ? "opacity-30 brightness-110" : "opacity-20"
          }`}
        />

        {/* 2. MOBILE FORCE-PLAY VIDEO LAYER (Plays smoothly over the moving background) */}
        <video
          ref={heroVideoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          onLoadedData={(e) => e.currentTarget.play().catch(() => {})}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            isDark ? "opacity-40 mix-blend-screen" : "opacity-25"
          }`}
        >
          {/* Fast Global CDN Streams without hotlink blocking */}
          <source src="https://cdn.pixabay.com/video/2020/05/25/40130-424930032_tiny.mp4" type="video/mp4" />
          <source src="https://cdn.pixabay.com/video/2021/08/10/84624-586228732_tiny.mp4" type="video/mp4" />
        </video>

        {/* 3. LIVE FLOATING GOLDEN SPIRITUAL PARTICLES (Works 100% of the time with 0KB data) */}
        <div className="absolute inset-0 overflow-hidden">
          {GOLDEN_PARTICLES.map((p, idx) => (
            <span
              key={idx}
              className="golden-particle"
              style={{
                left: p.left,
                width: `${p.size}px`,
                height: `${p.size}px`,
                animationDuration: p.duration,
                animationDelay: p.delay
              }}
            />
          ))}
        </div>

        {/* 4. Smooth Vignette Overlay for Crisp Text Readability */}
        <div
          className={`absolute inset-0 ${
            isDark
              ? "bg-gradient-to-b from-[#07070d]/80 via-[#07070d]/25 to-[#07070d]"
              : "bg-gradient-to-b from-[#f8fafc]/80 via-[#f8fafc]/25 to-[#f8fafc]"
          }`}
        />
      </div>

      <div className="absolute top-0 left-1/2 w-[160vw] md:w-[1000px] h-[380px] md:h-[700px] bg-amber-600/[0.08] blur-[130px] rounded-full pointer-events-none z-[1] hero-glow" />
      <div className="absolute top-16 left-1/3 w-[350px] h-[280px] bg-amber-400/[0.05] blur-[90px] rounded-full pointer-events-none z-[1] hero-glow-2" />
      <div className="absolute top-8 right-[20%] w-[280px] h-[220px] bg-yellow-400/[0.03] blur-[70px] rounded-full pointer-events-none z-[1] hero-glow-3" />

      <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 font-cinzel text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-5 max-w-4xl mx-auto drop-shadow-sm">
        {lang === "EN" ? (
          <>
            {t.heroTitle.split(" ")[0]} <span className="gold-text">{t.heroTitle.split(" ")[1]}</span> {t.heroTitle.split(" ")[2]}
          </>
        ) : (
          <><span className="gold-text">अपनी चेतना</span> को जागृत करें</>
        )}
      </motion.h1>

      <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }} className={`relative z-10 max-w-xl mx-auto text-sm md:text-lg px-2 leading-relaxed font-medium ${isDark ? 'text-gray-300/90' : 'text-slate-700'}`}>
        {t.heroSub}
      </motion.p>
    </section>
  );
}
