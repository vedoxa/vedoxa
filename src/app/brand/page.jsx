import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";

export default function BrandPage() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate animated particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 2,
      size: 2 + Math.random() * 4,
      opacity: Math.random() * 0.6 + 0.2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-screen bg-[#06060a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px); opacity: 0; }
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.3; filter: blur(20px); }
          50% { opacity: 0.8; filter: blur(30px); }
        }

        @keyframes cosmic-rotation {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }

        @keyframes third-eye-glow {
          0%, 100% { 
            box-shadow: 0 0 30px rgba(234, 179, 8, 0.4),
                        0 0 60px rgba(234, 179, 8, 0.2),
                        inset 0 0 30px rgba(234, 179, 8, 0.1);
          }
          50% { 
            box-shadow: 0 0 60px rgba(234, 179, 8, 0.8),
                        0 0 100px rgba(234, 179, 8, 0.5),
                        inset 0 0 50px rgba(234, 179, 8, 0.3);
          }
        }

        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        @keyframes radial-wave {
          0% { 
            transform: scale(0);
            opacity: 1;
          }
          100% { 
            transform: scale(1);
            opacity: 0;
          }
        }

        @keyframes spiral-glow {
          0% { 
            transform: translate(-50%, -50%) rotate(0deg) scale(1);
            opacity: 0.6;
          }
          100% { 
            transform: translate(-50%, -50%) rotate(360deg) scale(1.5);
            opacity: 0;
          }
        }

        .cosmic-bg {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          background: radial-gradient(circle at 50% 50%, rgba(234, 179, 8, 0.1) 0%, transparent 70%),
                      radial-gradient(circle at 20% 30%, rgba(139, 69, 19, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 80% 70%, rgba(184, 134, 11, 0.1) 0%, transparent 50%);
          animation: cosmic-rotation 40s linear infinite;
          filter: blur(1px);
        }

        .glow-orb {
          position: absolute;
          border-radius: 50%;
          animation: glow-pulse 4s ease-in-out infinite;
        }

        .glow-orb-1 {
          width: 400px;
          height: 400px;
          top: -100px;
          right: -100px;
          background: radial-gradient(circle, rgba(234, 179, 8, 0.3) 0%, transparent 70%);
          animation: glow-pulse 5s ease-in-out infinite;
        }

        .glow-orb-2 {
          width: 300px;
          height: 300px;
          bottom: 50px;
          left: -100px;
          background: radial-gradient(circle, rgba(255, 165, 0, 0.25) 0%, transparent 70%);
          animation: glow-pulse 6s ease-in-out infinite 1s;
        }

        .glow-orb-3 {
          width: 250px;
          height: 250px;
          top: 30%;
          right: 10%;
          background: radial-gradient(circle, rgba(218, 165, 32, 0.2) 0%, transparent 70%);
          animation: glow-pulse 7s ease-in-out infinite 2s;
        }

        .particle {
          position: absolute;
          background: radial-gradient(circle, rgba(234, 179, 8, 0.9) 0%, rgba(234, 179, 8, 0.3) 70%);
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(234, 179, 8, 0.6);
          animation: float linear infinite;
        }

        .wave-ring {
          position: absolute;
          border: 2px solid rgba(234, 179, 8, 0.4);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          animation: radial-wave 3s ease-out infinite;
        }

        .wave-ring-1 { 
          width: 200px; 
          height: 200px; 
          animation-delay: 0s;
        }
        .wave-ring-2 { 
          width: 350px; 
          height: 350px; 
          animation-delay: 0.6s;
        }
        .wave-ring-3 { 
          width: 500px; 
          height: 500px; 
          animation-delay: 1.2s;
        }

        .spiral-emanation {
          position: absolute;
          width: 80px;
          height: 80px;
          background: conic-gradient(
            from 0deg,
            rgba(234, 179, 8, 0.8),
            rgba(255, 165, 0, 0.6),
            rgba(184, 134, 11, 0.4),
            rgba(234, 179, 8, 0.8)
          );
          border-radius: 50%;
          top: 50%;
          left: 50%;
          animation: spiral-glow 4s ease-out infinite;
        }

        .content-glow {
          position: relative;
          z-index: 10;
          filter: drop-shadow(0 0 20px rgba(234, 179, 8, 0.3));
          animation: flicker 0.15s ease-in-out infinite;
          animation-duration: 0.2s;
        }

        .logo-container {
          animation: third-eye-glow 4s ease-in-out infinite;
          border-radius: 50%;
          padding: 20px;
        }

        .back-btn {
          position: relative;
          z-index: 50;
        }

        .shimmer-text {
          background: linear-gradient(
            90deg,
            #ffffff,
            #ffd700,
            #ffffff
          );
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .energy-burst {
          position: absolute;
          width: 600px;
          height: 600px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: radial-gradient(
            circle,
            rgba(234, 179, 8, 0.15) 0%,
            rgba(234, 179, 8, 0.05) 30%,
            transparent 70%
          );
          border-radius: 50%;
          animation: glow-pulse 5s ease-in-out infinite;
          pointer-events: none;
        }

        .mystical-ring {
          position: absolute;
          border: 3px dashed rgba(234, 179, 8, 0.3);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          animation: cosmic-rotation 30s linear infinite;
        }

        .ring-1 { width: 150px; height: 150px; animation-duration: 20s; }
        .ring-2 { width: 280px; height: 280px; animation-duration: 30s; animation-direction: reverse; }
        .ring-3 { width: 400px; height: 400px; animation-duration: 40s; }

        @media (max-width: 768px) {
          .glow-orb-1 { width: 300px; height: 300px; }
          .glow-orb-2 { width: 200px; height: 200px; }
          .glow-orb-3 { width: 180px; height: 180px; }
        }
      `}</style>

      {/* Cosmic Background */}
      <div className="cosmic-bg" />

      {/* Energy Burst */}
      <div className="energy-burst" />

      {/* Glowing Orbs */}
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />
      <div className="glow-orb glow-orb-3" />

      {/* Mystical Rings */}
      <div className="mystical-ring ring-1" />
      <div className="mystical-ring ring-2" />
      <div className="mystical-ring ring-3" />

      {/* Wave Rings */}
      <div className="wave-ring wave-ring-1" />
      <div className="wave-ring wave-ring-2" />
      <div className="wave-ring wave-ring-3" />

      {/* Spiral Emanations */}
      {[0, 1, 2].map((i) => (
        <div key={`spiral-${i}`} className="spiral-emanation" style={{
          animationDelay: `${i * 0.8}s`,
          opacity: 0.6 - i * 0.15
        }} />
      ))}

      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="particle"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            opacity: particle.opacity,
            animation: `float ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Back Button */}
      <Link 
        href="/" 
        className="back-btn absolute top-8 left-8 text-gray-400 hover:text-yellow-400 flex items-center gap-2 transition duration-300 hover:drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]"
      >
        <ArrowLeft size={20} /> Back to Library
      </Link>

      {/* Main Content */}
      <div className="content-glow">
        {/* Main Logo Container */}
        <div className="w-32 h-32 md:w-48 md:h-48 relative mb-8">
          <div className="logo-container">
            <Image 
              src="/logo.svg" 
              alt="Brand Logo" 
              width={200}
              height={200}
              priority 
              className="object-contain"
            />
          </div>
        </div>
        
        {/* Brand Text */}
        <h1 className="shimmer-text font-cinzel text-5xl md:text-7xl font-black tracking-widest mb-4">
          VEDOXA
        </h1>
        <p className="text-yellow-400 tracking-widest uppercase text-sm md:text-base font-bold drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">
          Awaken Your Consciousness
        </p>
        
        {/* Placeholder for future details */}
        <div className="max-w-2xl text-center mt-12 text-gray-300 text-sm backdrop-blur-sm bg-black/30 p-6 rounded-lg">
          <p>Details about the brand and mission will be added here soon...</p>
        </div>
      </div>
    </div>
  );
}
