'use client';

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function BrandPage() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 35 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 3 + Math.random() * 4,
        delay: Math.random() * 2,
        size: 2 + Math.random() * 3,
      }))
    );
  }, []);

  return (
    <div className="relative min-h-screen w-full bg-[#06060a] flex items-center justify-center p-4 overflow-hidden">
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: 0.7; }
          90% { opacity: 0.7; }
          100% { transform: translateY(-100vh) translateX(80px); opacity: 0; }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 30px rgba(234, 179, 8, 0.4), inset 0 0 20px rgba(234, 179, 8, 0.1); }
          50% { box-shadow: 0 0 60px rgba(234, 179, 8, 0.8), inset 0 0 40px rgba(234, 179, 8, 0.3); }
        }
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(234, 179, 8, 0.5), 0 0 40px rgba(234, 179, 8, 0.2); }
          50% { text-shadow: 0 0 40px rgba(234, 179, 8, 0.9), 0 0 80px rgba(234, 179, 8, 0.6); }
        }
        @keyframes spin-slow { from { transform: translate(-50%, -50%) rotate(0deg); } to { transform: translate(-50%, -50%) rotate(360deg); } }
        @keyframes spin-slow-rev { from { transform: translate(-50%, -50%) rotate(360deg); } to { transform: translate(-50%, -50%) rotate(0deg); } }
      `}</style>

      {/* Background Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl opacity-50 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-500/15 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 right-1/3 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }} />

        {/* Particles */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-yellow-400"
            style={{
              width: `${p.size}px`,
              height: `${p.size}px`,
              left: `${p.left}%`,
              top: `${p.top}%`,
              boxShadow: `0 0 ${p.size * 4}px rgba(234, 179, 8, 0.9)`,
              animation: `float-up ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
              opacity: 0.65,
            }}
          />
        ))}

        {/* Ring 1 */}
        <div
          className="absolute w-48 h-48 border-2 border-yellow-500/50 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            animation: 'spin-slow 25s linear infinite',
          }}
        />

        {/* Ring 2 */}
        <div
          className="absolute w-72 h-72 border-2 border-yellow-500/30 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            animation: 'spin-slow-rev 35s linear infinite',
          }}
        />

        {/* Ring 3 */}
        <div
          className="absolute w-96 h-96 border border-yellow-500/20 rounded-full"
          style={{
            top: '50%',
            left: '50%',
            animation: 'spin-slow 45s linear infinite',
          }}
        />
      </div>

      {/* Back Button */}
      <Link
        href="/"
        className="absolute top-8 left-8 text-gray-400 hover:text-yellow-400 flex items-center gap-2 transition duration-300 z-50"
      >
        <ArrowLeft size={20} />
        Back to Library
      </Link>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo */}
        <div
          className="w-32 h-32 md:w-48 md:h-48 relative mb-8 rounded-full p-3"
          style={{
            animation: 'glow-pulse 4s ease-in-out infinite',
          }}
        >
          <Image
            src="/logo.svg"
            alt="Logo"
            fill
            priority
            className="object-contain drop-shadow-2xl"
          />
        </div>

        {/* Title */}
        <h1
          className="font-cinzel text-5xl md:text-7xl font-black tracking-widest text-white mb-4"
          style={{
            animation: 'text-glow 3s ease-in-out infinite',
          }}
        >
          VEDOXA
        </h1>

        {/* Subtitle */}
        <p
          className="text-yellow-400 tracking-widest uppercase text-sm md:text-base font-bold"
          style={{
            textShadow: '0 0 15px rgba(234, 179, 8, 0.8)',
            animation: 'text-glow 2.5s ease-in-out infinite',
            animationDelay: '0.3s',
          }}
        >
          Awaken Your Consciousness
        </p>

        {/* Description */}
        <div
          className="max-w-xl text-center mt-12 text-gray-300 text-sm backdrop-blur-sm bg-black/30 p-6 rounded-xl border border-yellow-500/20"
          style={{
            boxShadow: '0 0 25px rgba(234, 179, 8, 0.15)',
          }}
        >
          <p>Details about the brand and mission will be added here soon...</p>
        </div>
      </div>
    </div>
  );
}
