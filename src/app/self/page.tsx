// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Zap, ShieldAlert, Sparkles, Rocket } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SelfPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <div className="min-h-screen bg-[#06060a] text-gray-200 flex flex-col p-6 font-sans relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Navigation */}
      <nav className="mb-8 max-w-4xl mx-auto w-full">
        <Link href="/reward" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2.5 rounded-xl text-white font-bold transition shadow-lg">
          <ChevronLeft size={20} /> Back to Rewards
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        
        {/* Header */}
        <div className="text-center mb-12 mt-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-blue-600/20 to-purple-600/5 rounded-full border border-blue-500/30 text-blue-500 mb-6 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
          >
            <Zap size={48} />
          </motion.div>
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl md:text-5xl font-black text-white mb-4 font-serif"
          >
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-400">Self Zone</span>
          </motion.h1>
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-gray-400"
          >
            Exclusive tools and secret logic space. <br/> (यह आपका अपना प्राइवेट और सीक्रेट स्पेस है।)
          </motion.p>
        </div>

        {!loading && user ? (
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid md:grid-cols-2 gap-6"
          >
            
            {/* Placeholder Card 1 */}
            <div className="bg-black/40 border border-blue-500/20 rounded-3xl p-8 relative overflow-hidden group hover:border-blue-500/50 transition duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full group-hover:bg-blue-500/20 transition duration-300"></div>
              <Sparkles className="text-blue-400 w-10 h-10 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">New Feature Coming</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Yahan par hum wo "alag logic" set karenge jo tumne socha hai. Batao isme kya add karna hai?
              </p>
              <button disabled className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-6 py-2.5 rounded-xl font-bold text-sm w-full opacity-50 cursor-not-allowed">
                Locked
              </button>
            </div>

            {/* Placeholder Card 2 */}
            <div className="bg-black/40 border border-purple-500/20 rounded-3xl p-8 relative overflow-hidden group hover:border-purple-500/50 transition duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-[40px] rounded-full group-hover:bg-purple-500/20 transition duration-300"></div>
              <Rocket className="text-purple-400 w-10 h-10 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Self Tasks</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Agar yahan koi self-task, extra points, ya secret link ka system lagana hai, toh yahan banega.
              </p>
              <button disabled className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-6 py-2.5 rounded-xl font-bold text-sm w-full opacity-50 cursor-not-allowed">
                In Development
              </button>
            </div>

          </motion.div>
        ) : (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
             <ShieldAlert className="w-12 h-12 text-gray-500 mx-auto mb-4" />
             <p className="text-gray-400 mb-4">You need to log in to access the Self Zone.</p>
             <Link href="/" className="inline-block bg-blue-600 text-white font-bold px-6 py-3 rounded-full hover:bg-blue-500 transition shadow-lg">Go to Login</Link>
          </div>
        )}

      </div>
    </div>
  );
}

