// @ts-nocheck
"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, MessageSquare, Sparkles, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#06060a] text-gray-200 flex flex-col p-6 relative overflow-hidden">
      
      {/* PROFESSIONAL BACKGROUND: Reading Girl Aesthetic Glow Overlay */}
      <div className="absolute inset-0 opacity-20 pointer-events-none mix-blend-screen bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000')" }} />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-yellow-500/10 blur-[150px] rounded-full pointer-events-none" />

      <nav className="mb-8 max-w-5xl mx-auto w-full relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2.5 rounded-xl text-white font-bold transition shadow-lg text-sm">
          <ChevronLeft size={18} /> Back to Home
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col justify-center relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="font-cinzel text-4xl md:text-6xl font-black text-white mb-4 tracking-widest">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">Soul</span> Dimension
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            Connect with seekers globally or share your deepest thoughts with your personal AI companion.
          </p>
        </div>

        {/* Two Unique Features Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full mb-10">
          
          {/* OPTION 1: SOUL CIRCLE (COMMUNITY CHAT) */}
          <Link href="/explore/soul-circle">
            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="h-full bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between cursor-pointer relative overflow-hidden group hover:border-yellow-500/40 shadow-2xl backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none group-hover:scale-110 transition duration-300">
                <MessageSquare size={120} />
              </div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-500 mb-6 shadow-[0_0_20px_rgba(234,179,8,0.1)]">
                  <MessageSquare size={28} />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Soul Circle</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Live Global Chat Room. Meet fellow readers, share live perspectives, and engage in real-time cosmic discussions with seekers across the world.
                </p>
              </div>
              <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm group-hover:gap-3 transition-all mt-auto">
                Enter Circle <ChevronRight size={16} />
              </div>
            </motion.div>
          </Link>

          {/* OPTION 2: SOUL ECHO (AI FRIEND) */}
          <Link href="/explore/soul-echo">
            <motion.div 
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="h-full bg-gradient-to-b from-white/[0.04] to-transparent border border-white/10 rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between cursor-pointer relative overflow-hidden group hover:border-blue-500/40 shadow-2xl backdrop-blur-md"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5 text-white pointer-events-none group-hover:scale-110 transition duration-300">
                <Sparkles size={120} />
              </div>
              <div>
                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
                  <Sparkles size={28} />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Soul Echo</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  Your True AI Companion. Share your deep feelings, struggles, or thoughts. Speak to a friend who remembers everything and listens like no other.
                </p>
              </div>
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm group-hover:gap-3 transition-all mt-auto">
                Talk to Echo <ChevronRight size={16} />
              </div>
            </motion.div>
          </Link>

        </div>

      </div>
    </div>
  );
}

// Chhote helpers mapping ke liye
function ChevronRight({ size = 16 }) { return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>; }
