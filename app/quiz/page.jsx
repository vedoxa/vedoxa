"use client";
import Link from "next/link";
import { ChevronLeft, HelpCircle } from "lucide-react";

export default function QuizPage() {
  return (
    <div className="min-h-screen bg-[#06060a] text-gray-200 flex flex-col p-6">
      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-yellow-500 font-bold hover:bg-yellow-500/10 px-4 py-2 rounded-xl transition">
          <ChevronLeft size={20} /> Back to Home
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto w-full text-center">
        <div className="inline-flex items-center justify-center p-6 bg-yellow-500/10 rounded-full border border-yellow-500/30 text-yellow-500 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
          <HelpCircle size={48} />
        </div>
        <h1 className="text-4xl font-black text-white mb-4">Knowledge Quiz</h1>
        <p className="text-gray-400 mb-8">Test your spiritual and psychological knowledge.</p>

        {/* Future Quiz Implementation Area */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6">
           <h2 className="text-xl font-bold text-white">Upcoming Quiz Module</h2>
           <p className="text-sm text-gray-500">
             Ye page humne alag se setup kar diya hai. Yahan par tum baad me apna question-answer logic, forms aur database integration add kar sakte ho easily.
           </p>
           <button className="bg-white/10 text-white font-bold py-3 rounded-xl cursor-not-allowed opacity-50">
             Start Quiz (Coming Soon)
           </button>
        </div>
      </div>
    </div>
  );
}
