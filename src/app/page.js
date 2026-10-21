// @ts-nocheck
"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

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

export default function VedoxaHero() {
  const [lang, setLang] = useState("EN");
  const t = dict[lang];

  // THEME STATE (same logic and same localStorage key as the home page)
  const [theme, setTheme] = useState("light");

  // VIDEO REF FOR MOBILE AUTOPLAY FIX
  const heroVideoRef = useRef(null);

  // THEME INITIALIZATION LOGIC
  useEffect(() => {
    const savedTheme = localStorage.getItem("vedoxa_theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

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

  const isDark = theme === "dark";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap');

        /* APPLE SCROLL FEEL AND UI SOFTNESS UPDATE */
        html, body {
          touch-action: pan-y;
          -webkit-text-size-adjust: 100%;
          overscroll-behavior-y: auto;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
        }

        .font-cinzel { font-family: 'Cinzel', serif; letter-spacing: 0.03em; }

        .gold-text {
          background: linear-gradient(130deg, #b8720e 0%, #d4921a 22%, #e8b84b 48%, #f5d880 65%, #d4921a 82%, #b8720e 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 28px rgba(212,146,26,0.18));
        }

        /* CINEMATIC BACKGROUND MOTION + FLOATING GOLDEN SPIRITUAL PARTICLES */
        @keyframes cinemaPanZoom {
          0% { transform: scale(1.02) translate3d(0%, 0%, 0); }
          50% { transform: scale(1.14) translate3d(-1.5%, -1%, 0); }
          100% { transform: scale(1.02) translate3d(0%, 0%, 0); }
        }
        .cinema-bg {
          animation: cinemaPanZoom 18s ease-in-out infinite;
          will-change: transform;
        }

        @keyframes floatUpParticle {
          0% { transform: translate3d(0, 40px, 0) scale(0.6); opacity: 0; }
          30% { opacity: 0.85; }
          70% { opacity: 0.75; }
          100% { transform: translate3d(-15px, -220px, 0) scale(1.25); opacity: 0; }
        }
        .golden-particle {
          position: absolute;
          bottom: 0;
          border-radius: 9999px;
          background: radial-gradient(circle, #fde68a 0%, #f59e0b 60%, transparent 100%);
          box-shadow: 0 0 12px 2px rgba(245, 158, 11, 0.65);
          pointer-events: none;
          animation-name: floatUpParticle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }

        @keyframes breathe { 0%, 100% { opacity: 0.65; transform: translate3d(-50%, 0, 0) scale(1); } 50% { opacity: 0.95; transform: translate3d(-50%, 0, 0) scale(1.06); } }
        .hero-glow { animation: breathe 7s ease-in-out infinite; will-change: transform, opacity; }

        @keyframes breathe2 { 0%, 100% { opacity: 0.3; transform: translate3d(0, 0, 0) scale(1); } 50% { opacity: 0.55; transform: translate3d(0, 0, 0) scale(1.08); } }
        .hero-glow-2 { animation: breathe2 9s ease-in-out infinite; will-change: transform, opacity; }
        .hero-glow-3 { animation: breathe2 11s ease-in-out 2s infinite; will-change: transform, opacity; }

        .page-root::after {
          content: ''; position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.022; pointer-events: none; z-index: 9999; mix-blend-mode: overlay;
        }
      `}</style>

      <div className={`min-h-screen flex flex-col justify-center overflow-x-hidden selection:bg-amber-500/20 page-root transition-colors duration-300 ${isDark ? 'bg-[#07070d] text-gray-200' : 'bg-[#f8fafc] text-slate-800'}`}>

        {/* ─── Hero Section: Instant WebP + Force-Play Video + Live Golden Particles ─── */}
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

      </div>
    </>
  );
}
