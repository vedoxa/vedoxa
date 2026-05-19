// @ts-nocheck
'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, Loader, X, Check } from "lucide-react";
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
  const [showDonateModal, setShowDonateModal] = useState(false);
  const [donationAmount, setDonationAmount] = useState(100);
  const [isCelebration, setIsCelebration] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setParticles(
      Array.from({ length: 35 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 2 + Math.random() * 3, // Fast & Smooth
        delay: Math.random() * 2,
        size: 2 + Math.random() * 2,
      }))
    );
  }, []);

  const handleDonate = async () => {
    if (donationAmount < 1) return;
    setIsProcessing(true);
    
    const loaded = await loadRazorpayScript();
    if (!loaded) { setIsProcessing(false); return; }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: donationAmount * 100,
      currency: "INR",
      name: "VEDOXA - Support",
      description: "Contribution to Enlightenment",
      theme: { color: "#eab308" },
      handler: async function (response) {
        setIsProcessing(false);
        setShowDonateModal(false);
        setIsCelebration(true); // TRIGGER GOLDEN MODE!
        setTimeout(() => setIsCelebration(false), 8000); // 8 seconds golden glow
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
    setIsProcessing(false);
  };

  return (
    <div className={`relative min-h-screen w-full flex items-center justify-center p-4 overflow-hidden transition-all duration-1000 ${isCelebration ? 'bg-gradient-to-br from-amber-900 to-black' : 'bg-[#06060a]'}`}>
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { transform: translateY(-100vh) translateX(40px); opacity: 0; }
        }
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes spin-slow-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
      `}</style>

      {/* Celebration Overlay */}
      {isCelebration && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl">
           <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-center p-10 bg-yellow-500/10 border border-yellow-500/50 rounded-full shadow-[0_0_100px_rgba(234,179,8,0.5)]">
             <h2 className="text-4xl font-black text-yellow-400">Gratitude! ✨</h2>
             <p className="text-white mt-2">Your contribution supports the light of knowledge.</p>
           </motion.div>
        </motion.div>
      )}

      {/* Rings & Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div key={p.id} className="absolute rounded-full bg-yellow-400"
            style={{ width: `${p.size}px`, height: `${p.size}px`, left: `${p.left}%`, top: `${p.top}%`, opacity: 0.4, animation: `float-up ${p.duration}s linear infinite`, animationDelay: `${p.delay}s`, willChange: 'transform' }}
          />
        ))}
        <div className="absolute top-1/2 left-1/2 w-48 h-48 border-2 border-yellow-500/30 rounded-full animate-[spin_20s_linear_infinite]" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 border-2 border-yellow-500/20 rounded-full animate-[spin_30s_linear_infinite_reverse]" />
      </div>

      <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-yellow-400 flex items-center gap-2 transition z-50">
        <ArrowLeft size={20} /> Back
      </Link>

      {/* Donate Button */}
      <button onClick={() => setShowDonateModal(true)} className="absolute top-8 right-8 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-6 py-2 rounded-full font-bold hover:bg-yellow-500 hover:text-black transition flex items-center gap-2 z-50">
        <Heart size={16} /> Donate
      </button>

      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="w-40 h-40 relative mb-8 rounded-full p-1 border-2 border-yellow-500/30 shadow-[0_0_40px_rgba(234,179,8,0.3)]">
          <Image src="/logo.svg" alt="Logo" fill priority className="object-contain p-2" />
        </div>
        <h1 className="font-cinzel text-6xl font-black tracking-widest text-white mb-2">VEDOXA</h1>
        <p className="text-yellow-400 tracking-[0.2em] uppercase text-sm font-bold">Awaken Your Consciousness</p>
      </div>

      {/* Donation Modal */}
      <AnimatePresence>
        {showDonateModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#0a0a0d] border border-yellow-500/30 p-8 rounded-3xl w-full max-w-sm text-center">
               <h3 className="text-white text-2xl font-black mb-6">Contribute</h3>
               <div className="grid grid-cols-2 gap-3 mb-6">
                 {[100, 200, 500, 1000].map((amt) => (
                   <button key={amt} onClick={() => setDonationAmount(amt)} className={`py-3 rounded-xl border ${donationAmount === amt ? 'bg-yellow-500 text-black border-yellow-500' : 'bg-white/5 border-white/10 text-white hover:border-yellow-500/50'}`}>₹{amt}</button>
                 ))}
               </div>
               <input type="number" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 p-4 rounded-xl text-white text-center mb-6 outline-none focus:border-yellow-500" />
               <div className="flex gap-3">
                 <button onClick={() => setShowDonateModal(false)} className="flex-1 py-4 rounded-xl border border-white/10 text-white font-bold">Cancel</button>
                 <button onClick={handleDonate} className="flex-1 py-4 rounded-xl bg-yellow-500 text-black font-black flex items-center justify-center gap-2">
                   {isProcessing ? <Loader className="animate-spin" /> : <><Heart size={18}/> Pay Now</>}
                 </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
