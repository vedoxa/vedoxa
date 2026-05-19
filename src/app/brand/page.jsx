// @ts-nocheck
'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Loader, X, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

export default function BrandPage() {
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
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
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
          <div key={p.id} className="absolute rounded-full bg-yellow-500/30"
            style={{ width: `${p.size}px`, height: `${p.size}px`, left: `${p.left}%`, top: `${p.top}%`, animation: `float-up ${p.duration}s linear infinite`, animationDelay: `${p.delay}s` }}
          />
        ))}
      </div>

      <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2 transition z-50 font-bold uppercase tracking-widest text-sm">
        <ArrowLeft size={18} /> Library
      </Link>

      {/* Main Brand Section */}
      <div className="relative z-10 flex flex-col items-center text-center w-full max-w-lg">
        <div className="w-32 h-32 md:w-40 md:h-40 relative mb-6">
          <Image src="/logo.svg" alt="Logo" fill priority className="object-contain" />
        </div>
        <h1 className="font-cinzel text-6xl md:text-8xl font-black text-white mb-2 tracking-widest">VEDOXA</h1>
        <p className="text-yellow-500 font-bold uppercase tracking-[0.3em] text-sm mb-12">Awaken Your Consciousness</p>

        {/* Professional Contribution Card */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-[2.5rem] shadow-2xl">
          <h2 className="text-white text-2xl font-bold mb-6">Contribute to the Mission</h2>
          
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[100, 200, 500, 1000].map((amt) => (
              <button key={amt} onClick={() => setDonationAmount(amt)} className={`py-4 rounded-2xl font-bold border transition ${donationAmount === amt ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-white/5 border-white/10 text-white hover:border-yellow-500/50'}`}>
                ₹{amt}
              </button>
            ))}
          </div>

          <div className="relative mb-6">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
             <input 
               type="number" 
               value={donationAmount} 
               onChange={(e) => setDonationAmount(Number(e.target.value))} 
               className="w-full bg-black/40 border border-white/10 p-4 pl-10 rounded-2xl text-white font-bold text-lg outline-none focus:border-yellow-500" 
             />
          </div>

          <button onClick={handleDonate} disabled={isProcessing} className="w-full py-5 rounded-2xl bg-yellow-500 text-black font-black text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition shadow-[0_0_30px_rgba(234,179,8,0.3)]">
            {isProcessing ? <Loader className="animate-spin" /> : <><Heart size={20}/> Contribute Now</>}
          </button>
        </motion.div>
      </div>
    </div>
  );
}
