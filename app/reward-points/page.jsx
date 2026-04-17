"use client";
import Link from "next/link";
import { ChevronLeft, Coins } from "lucide-react";

export default function RewardPointsPage() {
  return (
    <div className="min-h-screen bg-[#06060a] text-gray-200 flex flex-col p-6">
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-yellow-500 font-bold hover:bg-yellow-500/10 px-4 py-2 rounded-xl transition">
          <ChevronLeft size={20} /> Back to Home
        </Link>
      </nav>

      <div className="max-w-xl mx-auto w-full text-center">
        <div className="inline-flex items-center justify-center p-6 bg-yellow-500/10 rounded-full border border-yellow-500/30 text-yellow-500 mb-6">
          <Coins size={48} />
        </div>
        <h1 className="text-4xl font-black text-white mb-2">Reward Points Program</h1>
        <p className="text-gray-400 mb-10">Read more, earn more.</p>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 text-left flex flex-col gap-6">
          <h2 className="text-xl font-bold text-white border-b border-white/10 pb-4">How to Earn & Use Points</h2>
          
          <div className="space-y-4 text-sm text-gray-300">
            <p><strong>1. Purchase Books:</strong> Earn points equivalent to ~2% of the book value on every purchase.</p>
            <p><strong>2. Leave Reviews:</strong> Share your thoughts and get bonus points (Coming Soon).</p>
            <p><strong>3. Redeem:</strong> 1 Point = ₹1. Use them at checkout to get discounts on your next premium library purchase.</p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl mt-4">
             <p className="text-emerald-400 font-bold text-sm text-center">Check your dashboard to see your current balance!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
