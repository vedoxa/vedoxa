// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, Coins, PlayCircle, RefreshCw, AlertTriangle, CheckCircle2, Wallet, Users, ArrowRight } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

// 🔴 APNA MONETAG DIRECT LINK YAHAN DAALEIN
const MONETAG_DIRECT_LINK = "https://omg10.com/4/10927258";

export default function RewardPointsPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const [toast, setToast] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  
  // Referral States
  const [referralInput, setReferralInput] = useState("");
  const [isApplyingReferral, setIsApplyingReferral] = useState(false);

  const DAILY_AD_LIMIT = 5; 

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      
      if (prof) {
        let updatedProfile = { ...prof };

        // 1. Check if day changed to reset ad limit
        const today = new Date().toISOString().split('T')[0];
        if (prof.last_ad_date !== today) {
          const { data: updatedProf } = await supabase.from('profiles')
            .update({ ads_watched_today: 0, last_ad_date: today })
            .eq('id', session.user.id)
            .select().single();
          updatedProfile = updatedProf;
        }

        // 2. Auto Generate Referral Code agar nahi hai
        if (!updatedProfile.referral_code) {
          // ID se starting ke 6 letters nikal kar code banayenge
          const newCode = session.user.id.replace(/-/g, '').substring(0, 6).toUpperCase();
          await supabase.from('profiles').update({ referral_code: newCode }).eq('id', session.user.id);
          updatedProfile.referral_code = newCode;
        }

        setProfile(updatedProfile);
      }
    }
    setLoading(false);
  };

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleWatchAd = async () => {
    if (!user) return showToast("Please login first! (कृपया पहले लॉग इन करें)", "error");
    if (profile?.ads_watched_today >= DAILY_AD_LIMIT) return showToast("Daily limit reached! Come back tomorrow. (आज की सीमा समाप्त हो गई है)", "error");

    setIsWatchingAd(true);
    window.open(MONETAG_DIRECT_LINK, "_blank");
    showToast("Ad started! Please wait... (विज्ञापन चल रहा है...)", "info");
    
    setTimeout(async () => {
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
    }, 10000); 
  };

  const handleConvertCoins = async () => {
    if (!profile || profile.ad_coins < 10) return showToast("Minimum 10 Coins required! (कम से कम 10 कॉइन्स चाहिए)", "error");

    setIsConverting(true);
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

  const handleApplyReferral = async () => {
    if (!referralInput.trim()) return showToast("Please enter a valid code!", "error");
    if (referralInput.toUpperCase() === profile?.referral_code) return showToast("You cannot use your own referral code!", "error");

    setIsApplyingReferral(true);
    try {
      // 1. Find the user whose code is entered
      const { data: referrer, error: refError } = await supabase
        .from('profiles')
        .select('id, reward_points')
        .eq('referral_code', referralInput.toUpperCase())
        .single();
      
      if (refError || !referrer) throw new Error("Invalid Referral Code! (गलत कोड)");

      // 2. Add ₹10 to referrer's wallet
      await supabase.from('profiles')
        .update({ reward_points: (referrer.reward_points || 0) + 10 })
        .eq('id', referrer.id);

      // 3. Mark current user as referred
      const { error: updateError } = await supabase.from('profiles')
        .update({ referred_by: referralInput.toUpperCase() })
        .eq('id', user.id);

      if (updateError) throw new Error("Failed to link referral.");

      setProfile(prev => ({ ...prev, referred_by: referralInput.toUpperCase() }));
      showToast("Code Applied! Your friend got ₹10. (रेफरल कोड लग गया!)", "success");
      setReferralInput("");

    } catch (err) {
      showToast(err.message, "error");
    }
    setIsApplyingReferral(false);
  };

  const handleShareCode = () => {
    const text = `Join Vedoxa Library and use my referral code: ${profile?.referral_code}`;
    if (navigator.share) {
      navigator.share({ title: "Vedoxa Referral", text });
    } else {
      navigator.clipboard.writeText(profile?.referral_code);
      showToast("Code copied to clipboard!", "success");
    }
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

      {/* Navigation - Chhote Buttons aur proper layout */}
      <nav className="mb-8 flex justify-between items-center max-w-4xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-xl text-white text-sm font-bold transition shadow-lg">
          <ChevronLeft size={18} /> Back to Home
        </Link>
        <Link href="/self" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white text-sm font-bold px-4 py-2 rounded-xl transition shadow-[0_0_15px_rgba(59,130,246,0.4)] hover:scale-105">
          Self <ArrowRight size={16} />
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-5 bg-gradient-to-br from-yellow-500/20 to-yellow-600/5 rounded-full border border-yellow-500/30 text-yellow-500 mb-6 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
            <Coins size={48} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 font-serif">Earn Free <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">Books</span></h1>
          <p className="text-gray-400">Watch short ads, collect coins, and convert them into real discounts. <br/> (विज्ञापन देखें, कॉइन्स इकट्ठा करें और असली छूट प्राप्त करें।)</p>
        </div>

        {/* Loading FIX: Pehle loading spinner dikhega */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <RefreshCw className="animate-spin text-yellow-500 mb-4" size={32} />
            <p className="text-gray-400 font-bold">Loading your dashboard...</p>
          </div>
        ) : user ? (
          <>
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

            {/* Refer & Earn Section */}
            <div className="bg-gradient-to-tr from-[#1a1a24] to-[#0a0a0d] border border-white/10 rounded-3xl p-8 mb-10 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Users size={120} />
              </div>
              <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-3"><Users className="text-yellow-500"/> Refer & Earn (रेफर करें और कमाएं)</h2>
              <p className="text-gray-400 text-sm mb-6 max-w-xl">
                Share your referral code with friends. When they enter your code, you will instantly get ₹10 in your wallet! 
                (अपने दोस्तों को रेफर करें, जैसे ही वो आपका कोड डालेंगे, आपको सीधे ₹10 मिलेंगे।)
              </p>

              <div className="grid md:grid-cols-2 gap-8">
                {/* User's Own Code - MOBILE RESPONSIVE FIX */}
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Your Referral Code</p>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 bg-white/5 border border-dashed border-yellow-500/50 text-yellow-500 font-mono text-xl text-center py-3 rounded-xl tracking-widest font-bold min-w-0">
                      {profile?.referral_code || "------"}
                    </div>
                    <button onClick={handleShareCode} className="bg-yellow-500 text-black font-bold px-6 py-3 rounded-xl hover:bg-yellow-400 transition whitespace-nowrap">
                      Share
                    </button>
                  </div>
                </div>

                {/* Enter Friend's Code - MOBILE RESPONSIVE FIX */}
                <div className="bg-black/40 border border-white/5 p-6 rounded-2xl">
                  <p className="text-xs font-bold text-gray-500 uppercase mb-2">Have a Referral Code?</p>
                  
                  {profile?.referred_by ? (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-2 font-bold text-sm">
                      <CheckCircle2 size={18} /> You have already used a code: {profile.referred_by}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input 
                          type="text" 
                          placeholder="Enter Code Here..." 
                          value={referralInput}
                          onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
                          maxLength={6}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-mono uppercase focus:border-yellow-500 outline-none min-w-0"
                        />
                        <button 
                          onClick={handleApplyReferral}
                          disabled={isApplyingReferral || !referralInput}
                          className="bg-white/10 hover:bg-white/20 text-white font-bold px-6 py-3 rounded-xl transition disabled:opacity-50 whitespace-nowrap flex justify-center items-center"
                        >
                          {isApplyingReferral ? <RefreshCw className="animate-spin" size={20}/> : "Apply"}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">Note: You can only use one referral code per account.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
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
