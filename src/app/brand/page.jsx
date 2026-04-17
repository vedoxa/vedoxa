import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-[#06060a] flex flex-col items-center justify-center p-4 relative">
      {/* Back Button */}
      <Link href="/" className="absolute top-8 left-8 text-gray-400 hover:text-white flex items-center gap-2 transition">
         <ArrowLeft size={20} /> Back to Library
      </Link>

      {/* Main Logo Container */}
      <div className="w-32 h-32 md:w-48 md:h-48 relative mb-8">
        <Image 
          src="/logo.svg" 
          alt="Vedoxa Brand Logo" 
          fill 
          priority 
          className="object-contain drop-shadow-[0_0_30px_rgba(234,179,8,0.3)]"
        />
      </div>
      
      {/* Brand Text */}
      <h1 className="font-cinzel text-4xl md:text-6xl font-black tracking-widest text-white mb-4">VEDOXA</h1>
      <p className="text-yellow-500 tracking-widest uppercase text-sm md:text-base font-bold">Awaken Your Consciousness</p>
      
      {/* Placeholder for future details */}
      <div className="max-w-2xl text-center mt-12 text-gray-400 text-sm">
        <p>Details about the VEDOXA brand and mission will be added here soon...</p>
      </div>
    </div>
  );
}
