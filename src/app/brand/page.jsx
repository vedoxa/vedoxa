'use client';

import React, { useEffect, useState } from "react";
import { ArrowLeft, Heart, Loader, Info, Shield, Zap, Terminal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Mocking Next.js components for the single-file Canvas environment ---
// Note: In your actual Next.js project, use your standard imports:
// import Image from "next/image";
// import Link from "next/link";
const Image = ({ src, alt, className, fill, priority }) => (
  <img 
    src={src} 
    alt={alt} 
    className={`object-contain ${className || ''}`} 
    style={fill ? { width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 } : {}} 
  />
);

const Link = ({ href, children, className, ...props }) => (
  <a href={href} className={className} {...props}>{children}</a>
);

// --- MAIN APP COMPONENT (Manages Navigation in this Canvas) ---
export default function App() {
  const [currentView, setCurrentView] = useState("brand"); // 'brand' | 'info'

  return (
    <div className="bg-[#06060a] min-h-screen text-white font-sans overflow-hidden">
      <AnimatePresence mode="wait">
        {currentView === "brand" && (
          <motion.div
            key="brand"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)", scale: 1.05 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="w-full min-h-screen absolute top-0 left-0"
          >
            <BrandPage onViewChange={setCurrentView} />
          </motion.div>
        )}
        
        {currentView === "info" && (
          <motion.div
            key="info"
            initial={{ opacity: 0, y: "100%", borderRadius: "100% 100% 0 0" }}
            animate={{ opacity: 1, y: 0, borderRadius: "0% 0% 0 0" }}
            exit={{ opacity: 0, y: "100%", borderRadius: "100% 100% 0 0" }}
            transition={{ type: "spring", stiffness: 60, damping: 20, mass: 1 }}
            className="w-full min-h-screen absolute top-0 left-0 z-50 bg-[#06060a]"
          >
            <InfoPage onViewChange={setCurrentView} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// 1. YOUR ORIGINAL BRAND PAGE (Safe & Untouched + Info Button Added)
// ============================================================================
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

function BrandPage({ onViewChange }) {
  const [particles, setParticles] = useState([]);
  const [donationAmount, setDonationAmount] = useState(100);
  const [isCelebration, setIsCelebration] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setParticles(
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 5,
        delay: Math.random() * 5,
        size: 2 + Math.random() * 3,
      }))
    );
  }, []);

  const handleDonate = async () => {
    if (donationAmount < 10) return; // Minimum 10 rupees logic
    setIsProcessing(true);
    
    const loaded = await loadRazorpayScript();
    if (!loaded) { setIsProcessing(false); return; }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy",
      amount: donationAmount * 100,
      currency: "INR",
      name: "VEDOXA Contribution",
      description: "Contribute to Enlightenment",
      theme: { color: "#eab308" },
      handler: async function (response) {
        setIsProcessing(false);
        setIsCelebration(true);
        setTimeout(() => setIsCelebration(false), 8000);
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
    setIsProcessing(false);
  };

  return (
    <div className={`relative min-h-screen w-full flex flex-col items-center justify-center p-6 overflow-hidden transition-all duration-1000 ${isCelebration ? 'bg-[#1a1405]' : 'bg-[#06060a]'}`}>
      
      {/* Celebration Mode Overlay */}
      <AnimatePresence>
        {isCelebration && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-2xl">
             <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center p-12 bg-gradient-to-b from-yellow-400/20 to-transparent rounded-[3rem] border border-yellow-500/30 shadow-[0_0_100px_rgba(234,179,8,0.3)]">
               <h2 className="text-5xl font-black text-yellow-400 mb-4">Gratitude! ✨</h2>
               <p className="text-white text-lg">Your light joins ours in this mission.</p>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <motion.div 
            key={p.id} 
            className="absolute rounded-full bg-yellow-500/30"
            initial={{ y: "100vh" }}
            animate={{ y: "-100vh" }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "linear"
            }}
            style={{ width: `${p.size}px`, height: `${p.size}px`, left: `${p.left}%`, top: `${p.top}%` }}
          />
        ))}
      </div>

      <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2 transition z-50 font-bold uppercase tracking-widest text-sm">
        <ArrowLeft size={18} /> Library
      </Link>

      {/* NEW: INFO BUTTON OPTION ADDED HERE */}
      <button 
        onClick={() => onViewChange("info")}
        className="absolute top-8 right-8 text-gray-400 hover:text-yellow-400 flex items-center gap-2 transition-all z-50 font-bold uppercase tracking-widest text-sm bg-white/5 px-5 py-2.5 rounded-full border border-white/10 hover:border-yellow-400/50 hover:bg-yellow-400/10 shadow-lg hover:shadow-[0_0_20px_rgba(234,179,8,0.2)] active:scale-95"
      >
        <Info size={18} /> System Info
      </button>

      {/* Main Brand Section */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-lg mt-12 md:mt-0">
        <div className="w-32 h-32 md:w-40 md:h-40 relative mb-6">
          {/* Defaulting to a placeholder circle if /logo.svg is missing in the environment, but it keeps your exact structure */}
          <div className="absolute inset-0 bg-yellow-500/10 rounded-full border border-yellow-500/30 animate-pulse"></div>
          <Image src="/logo.svg" alt="Logo" fill priority className="object-contain" />
        </div>
        <h1 className="font-serif text-6xl md:text-8xl font-black text-white mb-2 tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>VEDOXA</h1>
        <p className="text-yellow-500 font-bold uppercase tracking-[0.3em] text-sm mb-12">Awaken Your Consciousness</p>

        {/* Professional Contribution Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
          <h2 className="text-white text-2xl font-bold mb-6">Contribute to the Mission</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[100, 200, 500, 1000].map((amt) => (
              <button key={amt} onClick={() => setDonationAmount(amt)} className={`py-4 rounded-2xl font-bold border transition-all ${donationAmount === amt ? 'bg-yellow-500 text-black border-yellow-500 scale-[1.02] shadow-[0_0_15px_rgba(234,179,8,0.4)]' : 'bg-white/5 border-white/10 text-white hover:border-yellow-500/50 hover:bg-white/10'}`}>
                ₹{amt}
              </button>
            ))}
          </div>

          <div className="relative mb-6 group">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold group-focus-within:text-yellow-500 transition-colors">₹</span>
             <input 
               type="number" 
               value={donationAmount} 
               onChange={(e) => setDonationAmount(Number(e.target.value))} 
               className="w-full bg-black/40 border border-white/10 p-4 pl-10 rounded-2xl text-white font-bold text-lg outline-none focus:border-yellow-500 focus:bg-black/60 transition-all shadow-inner" 
             />
          </div>

          <button onClick={handleDonate} disabled={isProcessing} className="w-full py-5 rounded-2xl bg-yellow-500 text-black font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(234,179,8,0.3)] disabled:opacity-70 disabled:cursor-not-allowed">
            {isProcessing ? <Loader className="animate-spin" /> : <><Heart size={20} className="fill-black"/> Contribute Now</>}
          </button>
        </motion.div>
      </div>
    </div>
  );
}


// ============================================================================
// 2. THE NEW HIGH-ANIMATION INFO PAGE (Game Style)
// ============================================================================
function InfoPage({ onViewChange }) {
  // Framer Motion variants for cinematic staggered animations
  const containerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVars = {
    hidden: { opacity: 0, x: -50, filter: "blur(5px)" },
    show: { opacity: 1, x: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 80, damping: 15 } },
  };

  const lineVars = {
    hidden: { width: "0%" },
    show: { width: "100%", transition: { duration: 1.5, ease: "circOut" } }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#06060a] p-6 md:p-12 overflow-hidden flex flex-col justify-center">
       
       {/* High-tech Game-style Background Elements */}
       <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/15 via-[#06060a] to-[#06060a] pointer-events-none" />
       
       {/* Subtle grid pattern for technical feel */}
       <div 
         className="absolute inset-0 opacity-[0.03] pointer-events-none" 
         style={{ 
           backgroundImage: "linear-gradient(#eab308 1px, transparent 1px), linear-gradient(90deg, #eab308 1px, transparent 1px)", 
           backgroundSize: "40px 40px" 
         }} 
       />

       {/* Floating digital particles */}
       <motion.div 
         animate={{ rotate: 360 }} 
         transition={{ duration: 150, repeat: Infinity, ease: "linear" }}
         className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] rounded-full border border-yellow-500/5 border-dashed pointer-events-none"
       />

       {/* Close Button */}
       <button 
         onClick={() => onViewChange("brand")}
         className="absolute top-8 right-8 z-50 p-3 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:text-black hover:bg-yellow-500 hover:border-yellow-500 transition-all hover:rotate-90 hover:scale-110 shadow-xl group"
       >
         <X size={24} className="group-hover:drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
       </button>

       {/* Main Content Container */}
       <motion.div 
         variants={containerVars}
         initial="hidden"
         animate="show"
         className="relative z-10 max-w-6xl w-full mx-auto"
       >
          <motion.div variants={itemVars} className="mb-16 md:mb-20 border-l-4 border-yellow-500 pl-6 md:pl-8">
            <h1 className="text-5xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tighter uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
              System<br/>Codex
            </h1>
            <p className="text-yellow-500 font-mono tracking-[0.2em] mt-4 uppercase text-sm flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
              Initialization complete // VEDOXA v1.0.0
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <InfoCard 
               icon={<Shield size={36} />}
               title="Mission Directive"
               content="To awaken consciousness through immersive digital experiences. We blend ancient wisdom with cutting-edge technology to forge a new path of enlightenment."
            />
             <InfoCard 
               icon={<Zap size={36} />}
               title="Core Architecture"
               content="Powered by next-generation web technologies. Utilizing highly optimized components, cinematic physics engines, and seamless global integration networks."
            />
             <InfoCard 
               icon={<Terminal size={36} />}
               title="System Status"
               content="All systems optimal. Quantum servers online. Reality engines synchronized. Ready to process contributions and elevate user state immediately."
            />
          </div>
          
          <motion.div variants={lineVars} className="mt-16 w-full h-[1px] bg-gradient-to-r from-yellow-500/80 via-white/20 to-transparent shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
          
          <motion.div variants={itemVars} className="mt-8 flex flex-col md:flex-row items-center justify-between text-gray-500 font-mono text-xs uppercase tracking-widest gap-4">
            <div className="flex gap-6">
              <span className="hover:text-yellow-500 cursor-crosshair transition-colors">Data Nodes: 4,092</span>
              <span className="hover:text-yellow-500 cursor-crosshair transition-colors">Uplink: Secure</span>
            </div>
            <span className="flex items-center gap-2">
              <LockIcon />
              © 2026 VEDOXA PROTOCOL
            </span>
          </motion.div>
       </motion.div>
    </div>
  )
}

// Sub-component for the Info Cards with hover physics
function InfoCard({ icon, title, content }) {
   return (
      <motion.div 
        variants={{
          hidden: { opacity: 0, y: 50, scale: 0.9 },
          show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 100, damping: 12 } }
        }}
        whileHover={{ y: -10, scale: 1.02, borderColor: "rgba(234, 179, 8, 0.4)", backgroundColor: "rgba(255,255,255,0.05)" }}
        className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl backdrop-blur-md relative overflow-hidden group transition-all duration-300 shadow-2xl"
      >
        {/* Animated Background Glow on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/0 to-yellow-500/0 group-hover:from-yellow-500/10 group-hover:to-transparent transition-all duration-500 ease-out" />
        
        {/* Large faint icon in background */}
        <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-all duration-500 transform group-hover:scale-150 group-hover:rotate-12">
           {React.cloneElement(icon, { size: 120 })}
        </div>

        <div className="relative z-10">
          <div className="text-yellow-500 mb-6 group-hover:scale-110 group-hover:text-white transition-all duration-300 origin-left drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
            {icon}
          </div>
          <h3 className="text-xl font-bold text-white mb-4 uppercase tracking-widest font-serif">{title}</h3>
          <p className="text-gray-400 leading-relaxed text-sm font-sans group-hover:text-gray-300 transition-colors">
            {content}
          </p>
        </div>

        {/* Cyberpunk corner accent */}
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-yellow-500/0 group-hover:border-yellow-500/50 transition-all duration-300 rounded-br-3xl" />
      </motion.div>
   )
}

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
)
