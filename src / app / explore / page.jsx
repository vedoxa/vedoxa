"use client";
import Link from "next/link";
import { ChevronLeft, Globe } from "lucide-react";

export default function ExplorePage() {
  return (
    <div className="min-h-screen bg-[#06060a] text-gray-200 flex flex-col p-6">
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-yellow-500 font-bold hover:bg-yellow-500/10 px-4 py-2 rounded-xl transition">
          <ChevronLeft size={20} /> Back to Home
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-yellow-500/10 rounded-2xl border border-yellow-500/30 text-yellow-500">
            <Globe size={32} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white">Global Reading Stats</h1>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-6">
          <h2 className="text-xl font-bold text-yellow-500 mb-4">Did you know?</h2>
          <p className="text-gray-400 leading-relaxed mb-6">
            Worldwide, billions of people read books every year. In fact, literature shapes human consciousness on a global scale. Here are some quick stats:
          </p>

          <ul className="space-y-4">
            <li className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-gray-300">Active Readers Globally</span>
              <span className="font-bold text-white text-lg">~2.5 Billion</span>
            </li>
            <li className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-gray-300">Books Published Annually</span>
              <span className="font-bold text-white text-lg">~2.2 Million</span>
            </li>
            <li className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="text-gray-300">Average Books read per person</span>
              <span className="font-bold text-white text-lg">12 / Year</span>
            </li>
          </ul>
          
          <p className="text-sm text-gray-500 mt-6 italic">* Note: You can update this static page data later safely without touching the main UI logic.</p>
        </div>
      </div>
    </div>
  );
}
