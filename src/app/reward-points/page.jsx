// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Coins, PlayCircle, RefreshCw, AlertTriangle, CheckCircle2, Wallet } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

// 🔴 APNA MONETAG DIRECT LINK YAHAN DAALEIN
const MONETAG_DIRECT_LINK = "https://www.profitablecpmrate.com/YOUR_DIRECT_LINK_ID";

export default function RewardPointsPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [toast, setToast] = useState(null);
  const [isConverting, setIsConverting] = useState(false);

  const DAILY_AD_LIMIT = 5; // 1 din me sirf 5 ads dekh sakte hain (Safety ke liye)

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      
      if (prof) {
        // Check if day changed to reset ad limit
        const today = new Date().toISOString().split('T')[0];
        if (prof.last_ad_date !== today) {
          const { data: updatedProf } = await supabase.from('profiles')
            .update({ ads_watched_today: 0, last_ad_date: today })
            .eq('id', session.user.id)
            .select().single();
          setProfile(updatedProf);
        } else {
          setProfile(prof);
        }
      }
    }
    setLoading(false);
  };

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleWatchAd = async () => {
    if (!user) {
      showToast("Please login first! (कृपया पहले लॉग इन करें)", "error");
      return;
    }
    if (profile?.ads_watched_today >= DAILY_AD_LIMIT) {
      showToast("Daily limit reached! Come back tomorrow. (आज की सीमा समाप्त हो गई है)", "error");
      return;
    }

    setIsWatchingAd(true);
    
    // Ad Naye Tab (New Tab) me khulegi
    window.open(MONETAG_DIRECT_LINK, "_blank");

    // Ad dekhne ka time (Dummy 10 seconds wait)
    showToast("Ad started! Please wait... (विज्ञापन चल रहा है...)", "info");
    
    setTimeout(async () => {
      // 10 seconds baad coins add karenge
      const newAdCoins = (profile.ad_coins || 0) + 10;
      const newAdsWatched = (profile.ads_watched_today || 0) + 1;

      const { error } = await supabase.from('profiles')
        .update({ ad_coins: newAdCoins, ads_watched_today: newAdsWatched })
        .eq('id', user.id);

      if (!error) {
        setProfile(prev => ({ ...prev, ad_coins: newAdCoins, ads_watched_today: newAdsWatched }));
        showToast("Success! 10 Coins added. (सफलता! 10 कॉइन्स जुड़ गए हैं)", "success");
      } else {
        showToast("Network error. Try again.", "error");
      }
      setIsWatchingAd(false);
    }, 10000); // 10 seconds
  };

  const handleConvertCoins = async () => {
    if (!profile || profile.ad_coins < 10) {
      showToast("Minimum 10 Coins required! (कम से कम 10 कॉइन्स चाहिए)", "error");
      return;
    }

    setIsConverting(true);
    
    // Logic: 10 Ad Coins = 1.5 Rupees (Reward Points)
    // Hum multiple of 10s me convert karenge (e.g. 20 coins = 3 Rs, 25 coins -> 20 convert honge, 5 bachenge)
    const coinsToConvert = Math.floor(profile.ad_coins / 10) * 10;
    const rupeesEarned = (coinsToConvert / 10) * 1.5;
    
    const remainingAdCoins = profile.ad_coins - coinsToConvert;
    const newRewardPoints = (profile.reward_points || 0) + rupeesEarned;

    const { error } = await supabase.from('profiles')
      .update({ ad_coins: remainingAdCoins, reward_points: newRewardPoints })
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => ({ ...prev, ad_coins: remainingAdCoins, reward_points: newRewardPoints }));
      showToast(`Converted successfully! ₹${rupeesEarned} added to your wallet.`, "success");
    } else {
      showToast("Conversion failed. Try again.", "error");
    }
    setIsConverting(false);
  };

  return (
    <div className="min-h-screen bg-[#06060a] text-gray-200 flex flex-col p-6 font-sans">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999]">
            <div className={`px-6 py-3 rounded-full shadow-2xl font-bold text-sm border flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : toast.type === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>} {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 font-bold hover:text-yellow-500 transition">
          <ChevronLeft size={20} /> Back to Home
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 rounded-full border border-yellow-500/30 text-yellow-500 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <Coins size={48} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 font-serif">Earn Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">Books</span></h1>
          <p className="text-gray-400">Watch short ads, collect coins, and convert them into real discounts. <br/> (विज्ञापन देखें, कॉइन्स इकट्ठा करें और असली छूट प्राप्त करें।)</p>
        </div>

        {!loading && user ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            
            {/* Ad Coins Card */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center text-center">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 blur-[50px] rounded-full"></div>
              <h3 className="text-gray-400 font-bold mb-2 uppercase tracking-widest text-xs">Ad Coins Balance</h3>
              <div className="text-5xl font-black text-white mb-6 flex items-center gap-3">
                {profile?.ad_coins || 0} <Coins size={28} className="text-yellow-500"/>
              </div>
              
              <p className="text-xs text-gray-500 mb-6">
                Earn 10 Coins per Ad. <br/> (1 ऐड देखने पर 10 कॉइन्स)
              </p>

              <button 
                onClick={handleWatchAd}
                disabled={isWatchingAd || profile?.ads_watched_today >= DAILY_AD_LIMIT}
                className="w-full relative group overflow-hidden rounded-2xl p-px disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-yellow-600 to-yellow-400 animate-[spin_3s_linear_infinite]" />
                <div className="relative bg-black px-6 py-4 rounded-[15px] flex items-center justify-center gap-3 transition-all group-hover:bg-black/80">
                  {isWatchingAd ? <RefreshCw className="animate-spin text-yellow-500" size={24}/> : <PlayCircle className="text-yellow-500" size={24}/>}
                  <span className="font-bold text-white text-lg">
                    {isWatchingAd ? "Watching Ad..." : "Watch Ad to Earn"}
                  </span>
                </div>
              </button>
              <div className="mt-4 text-xs font-bold text-gray-500 bg-white/5 px-4 py-2 rounded-full border border-white/5">
                Daily Limit: {profile?.ads_watched_today || 0} / {DAILY_AD_LIMIT} Ads Watched
              </div>
            </div>

            {/* Conversion Card */}
            <div className="bg-[#0d0d14] border border-emerald-500/20 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center text-center shadow-[0_0_20px_rgba(16,185,129,0.05)]">
              <h3 className="text-emerald-500/80 font-bold mb-2 uppercase tracking-widest text-xs">Wallet Balance (Rupees)</h3>
              <div className="text-5xl font-black text-white mb-6 flex items-center gap-3">
                ₹{profile?.reward_points || 0} <Wallet size={28} className="text-emerald-500"/>
              </div>

              <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 mb-6 text-sm text-emerald-400 font-medium">
                <strong>Rate:</strong> 10 Ad Coins = ₹1.5
                <br/>
                <span className="text-xs opacity-80">(Converted points are automatically used at checkout)</span>
              </div>

              <button 
                onClick={handleConvertCoins}
                disabled={isConverting || !profile || profile.ad_coins < 10}
                className="w-full mt-auto bg-emerald-500 hover:bg-emerald-400 text-black px-6 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConverting ? <RefreshCw className="animate-spin" size={20}/> : <RefreshCw size={20}/>} 
                Convert to Rupees
              </button>
            </div>

          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl">
             <p className="text-gray-400 mb-4">Please log in to your account to start earning coins.</p>
             <Link href="/" className="inline-block bg-yellow-500 text-black font-bold px-6 py-3 rounded-full hover:bg-yellow-400 transition">Go to Login</Link>
          </div>
        )}

        {/* Info Section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <h2 className="text-xl font-bold text-white mb-4">Why watch Ads? (हम विज्ञापन क्यों दिखाते हैं?)</h2>
          <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
            <p><strong>English:</strong> We want to make spiritual and psychological knowledge accessible to everyone, regardless of their financial situation. By watching ads, you help us maintain our servers and library, and in return, we give you real money (discounts) to purchase premium books for free!</p>
            <p><strong>हिंदी:</strong> हमारा उद्देश्य आध्यात्मिक और मनोवैज्ञानिक ज्ञान को सभी तक पहुँचाना है, चाहे उनकी आर्थिक स्थिति कैसी भी हो। विज्ञापन देखने से आपको 'Ad Coins' मिलते हैं, जिन्हें आप असली रुपयों में बदलकर हमारी प्रीमियम किताबें बिल्कुल मुफ़्त में खरीद सकते हैं!</p>
          </div>
        </div>

      </div>
    </div>
  );
}
