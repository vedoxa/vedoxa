// @ts-nocheck
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image"; 
import {
  ShieldCheck, Globe, BookOpen, Lock, X, Zap, 
  ChevronRight, RefreshCw, CheckCircle2,
  LogOut, UserCircle, Coins, MessageSquare, Star, Share2, Menu, Edit3, Settings
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const dict = {
  EN: { brand: "VEDOXA", login: "Login / Sign Up", heroTitle: "Awaken Your Consciousness", heroSub: "100% original, verified digital books on spirituality & psychology.", secure: "Safe & Secure", instant: "Instant PDF Auto-Download", premiumLib: "Premium Library", buyNow: "Buy Now", readNow: "Read Now", checkout: "Complete Purchase", haveCoupon: "Have a Coupon Code?", apply: "Apply", pay: "Secure Pay", rewardPoints: "Reward Points", redeemPoints: "Redeem Points", rewardEarn: "You will earn", pdfReader: "Web Reader", close: "Close", reviews: "Customer Reviews", writeReview: "Write a Review", submitReview: "Submit", updateReview: "Update", noReviews: "No reviews yet. Be the first to review after purchasing!", journeyText: "True knowledge begins when you look within. Start your journey today." },
  HI: { brand: "वेडोक्सा", login: "लॉगिन / साइन अप", heroTitle: "अपनी चेतना को जागृत करें", heroSub: "आध्यात्मिकता और मनोविज्ञान पर 100% मूल, सत्यापित डिजिटल पुस्तकें।", secure: "सुरक्षित और भरोसेमंद", instant: "त्वरित पीडीएफ डाउनलोड", premiumLib: "प्रीमियम पुस्तकालय", buyNow: "अभी खरीदें", readNow: "अभी पढ़ें", checkout: "खरीदारी पूरी करें", haveCoupon: "क्या आपके पास कूपन है?", apply: "लागू करें", pay: "सुरक्षित भुगतान", rewardPoints: "इनाम अंक", redeemPoints: "अंक भुनाएं", rewardEarn: "आपको मिलेंगे", pdfReader: "वेब रीडर", close: "बंद करें", reviews: "ग्राहक समीक्षा", writeReview: "समीक्षा लिखें", submitReview: "जमा करें", updateReview: "अपडेट करें", noReviews: "अभी तक कोई समीक्षा नहीं। खरीदने के बाद पहली समीक्षा लिखें!", journeyText: "सच्चा ज्ञान तब शुरू होता है जब आप अपने भीतर झांकते हैं। आज ही अपनी यात्रा शुरू करें।" }
};

// 5 Premium Avatars (DALL-E / Midjourney style placehoders)
const AVATARS = [
  "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Vedoxa1&backgroundColor=eab308",
  "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Karma&backgroundColor=059669",
  "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Dharma&backgroundColor=dc2626",
  "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Moksha&backgroundColor=2563eb",
  "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Gyan&backgroundColor=7c3aed"
];

export default function VedoxaHome() {
  const [lang, setLang] = useState("EN");
  const t = dict[lang];

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [purchasedBookIds, setPurchasedBookIds] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({ email: "", password: "", mode: "login" });

  const [showReader, setShowReader] = useState(false);
  const [readerUrl, setReaderUrl] = useState("");

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: "", email: "", phone: "", countryCode: "+91", coupon: "" });
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [useRewards, setUseRewards] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showBookDetails, setShowBookDetails] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [newReviewText, setNewReviewText] = useState("");
  const [loadingReviews, setLoadingReviews] = useState(false);
  
  // FIX: User ka existing review check karne ke liye state
  const [userExistingReview, setUserExistingReview] = useState(null);

  // FIX: Sidebar Dashboard States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  NProgress.configure({ showSpinner: false, speed: 400 });

  useEffect(() => {
    const preventZoom = (e) => { e.preventDefault(); };
    document.addEventListener('gesturestart', preventZoom);
    document.addEventListener('gesturechange', preventZoom);
    
    fetchBooks();
    supabase.auth.getSession().then(({ data: { session } }) => { if (session?.user) handleUserLogin(session.user); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) handleUserLogin(session.user);
      else { setUser(null); setProfile(null); setPurchasedBookIds([]); setIsSidebarOpen(false); }
    });

    return () => {
      document.removeEventListener('gesturestart', preventZoom);
      document.removeEventListener('gesturechange', preventZoom);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (showBookDetails || showCheckout || showAuthModal || showReader || isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showBookDetails, showCheckout, showAuthModal, showReader, isSidebarOpen]);

  const handleUserLogin = async (loggedUser) => {
    setUser(loggedUser);
    setCheckoutData(prev => ({ ...prev, email: loggedUser.email }));
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', loggedUser.id).single();
    if (prof) {
      // FIX: Auto-set Avatar if none exists
      if (!prof.avatar_url) {
        const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        const { error } = await supabase.from('profiles').update({ avatar_url: randomAvatar }).eq('id', loggedUser.id);
        if (!error) prof.avatar_url = randomAvatar;
      }
      setProfile(prof);
    }
    const { data: orders } = await supabase.from('orders').select('book_id').eq('customer_id', loggedUser.id);
    if (orders) setPurchasedBookIds(orders.map(o => o.book_id));
  };

  const fetchBooks = useCallback(async () => {
    NProgress.start(); setLoading(true);
    try {
      const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
      if (!error && data) setBooks(data);
    } catch (err) { console.error("Error fetching books:", err); }
    setLoading(false); NProgress.done();
  }, []);

  const fetchReviews = async (bookId) => {
    setLoadingReviews(true);
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("id, review_text, created_at, user_id, profiles(name)")
        .eq("book_id", bookId)
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setReviews(data);
        // FIX: Check if user already reviewed
        if (user) {
          const existing = data.find(r => r.user_id === user.id);
          if (existing) {
            setUserExistingReview(existing);
            setNewReviewText(existing.review_text);
          } else {
            setUserExistingReview(null);
            setNewReviewText("");
          }
        }
      }
    } catch (err) { console.error("Error fetching reviews:", err); }
    setLoadingReviews(false);
  };

  const handleSubmitReview = async () => {
    if (!newReviewText.trim()) return;
    try {
      if (userExistingReview) {
        // UPDATE existing review
        const { error } = await supabase.from("reviews").update({ review_text: newReviewText }).eq("id", userExistingReview.id);
        if (error) throw error;
        addToast("Review updated successfully!", "success");
      } else {
        // INSERT new review
        const { error } = await supabase.from("reviews").insert([
          { book_id: selectedBook.id, user_id: user.id, review_text: newReviewText }
        ]);
        if (error) throw error;
        addToast("Review submitted successfully!", "success");
      }
      fetchReviews(selectedBook.id); 
    } catch (err) {
      addToast("Review Error: " + (err.message || "Failed to save review."), "error");
    }
  };

  const openBookDetails = (book) => {
    setSelectedBook(book);
    fetchReviews(book.id);
    setShowBookDetails(true);
  };

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault(); NProgress.start();
    let res = authForm.mode === "signup" 
      ? await supabase.auth.signUp({ email: authForm.email, password: authForm.password })
      : await supabase.auth.signInWithPassword({ email: authForm.email, password: authForm.password });
    
    if (!res.error) { addToast(`Successfully ${authForm.mode === "signup" ? "signed up" : "logged in"}!`, "success"); setShowAuthModal(false); }
    else addToast(res.error.message, "error");
    NProgress.done();
  };

  const confirmLogout = async () => { 
    await supabase.auth.signOut(); 
    setShowLogoutConfirm(false);
    setIsSidebarOpen(false);
    addToast("Logged out securely", "info"); 
  };

  const verifyCoupon = async () => {
    if (!checkoutData.coupon) return;
    const { data } = await supabase.from('coupons').select('*').eq('code', checkoutData.coupon.toUpperCase()).single();
    if (data && new Date(data.expiry) > new Date() && data.used < data.limit_count) {
      setAppliedCoupon(data); addToast("Coupon applied! 🎉", "success");
    } else { setAppliedCoupon(null); addToast("Invalid or expired coupon", "error"); }
  };

  // FIX: Save New Avatar to DB
  const handleSaveAvatar = async (avatarUrl) => {
    try {
      const { error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
      if (error) throw error;
      setProfile({ ...profile, avatar_url: avatarUrl });
      addToast("Profile picture updated!", "success");
      setShowAvatarPicker(false);
    } catch (error) {
      addToast("Error saving avatar.", "error");
    }
  };

  let clientFinalPrice = appliedCoupon ? Math.round(selectedBook?.final_price - (selectedBook?.final_price * appliedCoupon.discount / 100)) : selectedBook?.final_price;
  if (useRewards && profile?.reward_points > 0) clientFinalPrice = Math.max(0, clientFinalPrice - profile.reward_points);
  const earnedPoints = selectedBook ? Math.floor(selectedBook.final_price * 0.019) : 0;

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) { addToast("Please login to purchase", "error"); setShowCheckout(false); setShowAuthModal(true); return; }
    if (!checkoutData.name || !checkoutData.phone) { addToast("Fill all details", "error"); return; }
    
    if (checkoutData.countryCode === '+91' && checkoutData.phone.length !== 10) { 
      addToast("Please enter a valid 10-digit Indian phone number.", "error"); 
      return; 
    }

    setIsProcessing(true); NProgress.start();

    if (clientFinalPrice === 0) {
      try {
        const { error } = await supabase.from('orders').insert([{
          customer_id: user.id,
          customer_name: checkoutData.name,       
          customer_email: user.email,             
          book_id: selectedBook.id,
          book_title: selectedBook.title,         
          base_price: selectedBook.base_price,    
          final_price: 0,                         
          amount: 0,
          coupon_used: appliedCoupon?.code || null,
          payment_method: 'free_coupon',
          points_used: useRewards ? profile?.reward_points : 0
        }]);
        
        if (error) throw error;
        
        addToast("Book unlocked successfully! 🎉", "success");
        setPurchasedBookIds(prev => [...prev, selectedBook.id]);
        setShowCheckout(false); setShowBookDetails(false);
        openWebReader(selectedBook);
      } catch (err) {
        addToast("DB Error: " + err.message, "error");
      } finally {
        setIsProcessing(false); NProgress.done();
      }
      return; 
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) { addToast("Payment gateway failed. Check network.", "error"); setIsProcessing(false); NProgress.done(); return; }

    try {
      const orderRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_order', bookId: selectedBook.id, couponCode: appliedCoupon?.code, useRewards, userId: user.id })
      });
      if (!orderRes.ok) throw new Error("Order creation failed");
      const orderData = await orderRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount * 100, 
        currency: "INR",
        name: "VEDOXA",
        description: selectedBook.title,
        order_id: orderData.rzpOrderId,
        prefill: { 
          name: checkoutData.name, 
          email: user.email, 
          contact: checkoutData.countryCode + checkoutData.phone 
        },
        theme: { color: "#eab308" },
        handler: async function (response) {
          try {
            addToast("Verifying payment...", "info");
            const verifyRes = await fetch('/api/payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'verify', rzpOrderId: response.razorpay_order_id, rzpPaymentId: response.razorpay_payment_id, rzpSignature: response.razorpay_signature,
                orderData: { customer_id: user.id, customer_name: checkoutData.name, customer_email: user.email, book_id: selectedBook.id, book_title: selectedBook.title, base_price: selectedBook.base_price, final_price: orderData.amount, coupon_used: appliedCoupon?.code || null, points_used: useRewards ? profile.reward_points : 0, payment_method: 'razorpay' }
              })
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              addToast("Payment Verified! Unlocking book...", "success");
              setPurchasedBookIds(prev => [...prev, selectedBook.id]);
              setShowCheckout(false);
              setShowBookDetails(false);
              openWebReader(selectedBook);
            } else throw new Error("Security verification failed!");
          } catch(err) { addToast(err.message, "error"); }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res) => addToast(res.error.description || "Payment failed.", "error"));
      rzp.open();
    } catch (err) { addToast(err.message, "error"); } 
    finally { setIsProcessing(false); NProgress.done(); }
  };

  const openWebReader = async (book) => {
    NProgress.start();
    try {
        const { data: pdfData, error } = await supabase.storage.from('books-pdfs').createSignedUrl(book.pdf_path, 3600);
        if (!error && pdfData?.signedUrl) { 
            const secureViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(pdfData.signedUrl)}&embedded=true`;
            setReaderUrl(secureViewerUrl); 
            setShowReader(true); 
        } 
        else throw error;
    } catch(err) { addToast("Failed to load secure reader", "error"); }
    NProgress.done();
  };

  const handleShare = async () => {
    const shareData = {
      title: 'VEDOXA Premium Library',
      text: 'Awaken Your Consciousness with original, verified digital books on spirituality & psychology.',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Sharing cancelled or failed");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast("Website link copied to clipboard! 📋", "success");
    }
  };

  return (
    <>
      <style>{`
        /* Stop zooming completely */
        html, body {
            touch-action: pan-y;
            -webkit-text-size-adjust: 100%;
            overscroll-behavior-y: none;
        }
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap');
        .font-cinzel { font-family: 'Cinzel', serif; }
        .gold-text { background: linear-gradient(135deg, #f59e0b 0%, #eab308 40%, #fcd34d 70%, #d97706 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .btn-gold { background: linear-gradient(135deg, #eab308, #d97706); color: #000; transition: all 0.25s ease; box-shadow: 0 4px 15px rgba(234,179,8,0.2); }
        .btn-gold:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(234,179,8,0.45); }
        #nprogress .bar { background: #eab308 !important; height: 3px !important; }
        #nprogress .peg { box-shadow: 0 0 10px #eab308, 0 0 5px #eab308 !important; }
        
        /* FIX: Marquee Animation */
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scrollLeft 20s linear infinite;
          display: inline-block;
          white-space: nowrap;
        }
      `}</style>

      {/* Floating Toasts */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div key={toast.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className={`px-5 py-3 rounded-xl text-sm font-bold backdrop-blur-md border ${toast.type === "success" ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400" : toast.type === "error" ? "bg-red-500/15 border-red-500/30 text-red-400" : "bg-yellow-500/15 border-yellow-500/30 text-yellow-400"}`}>
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sidebar Dashboard */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[5000]" 
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25 }}
              className="fixed top-0 right-0 w-80 h-full bg-[#0a0a0d] border-l border-white/10 z-[5001] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
                <span className="font-bold text-white flex items-center gap-2"><Settings size={18}/> Dashboard</span>
                <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10"><X size={20}/></button>
              </div>

              <div className="p-6 flex flex-col items-center gap-4 border-b border-white/5">
                <div className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
                   <div className="w-24 h-24 rounded-full border-2 border-yellow-500/50 overflow-hidden bg-white/5 flex items-center justify-center">
                     {profile?.avatar_url ? (
                       <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                     ) : (
                       <UserCircle size={48} className="text-yellow-500 opacity-50" />
                     )}
                   </div>
                   <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Edit3 size={20} className="text-white" />
                   </div>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-white text-lg">{profile?.name || "Vedoxa Reader"}</h3>
                  <p className="text-gray-500 text-xs">{user?.email}</p>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-4">
                {/* FIX: Link Component instead of div */}
                <Link href="/reward-points" className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-yellow-500/20 transition">
                  <div className="flex items-center gap-2 text-yellow-500 font-bold"><Coins size={20}/> Reward Points</div>
                  <span className="text-xl font-black text-white">{profile?.reward_points || 0}</span>
                </Link>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-gray-300 font-bold text-sm">Language / भाषा</span>
                  <button onClick={() => setLang(lang === "EN" ? "HI" : "EN")} className="border border-yellow-500/30 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold hover:bg-yellow-500/10 transition">
                    {lang === "EN" ? "Switch to हिन्दी" : "Switch to English"}
                  </button>
                </div>

                {/* FIX: New Explore & Quiz Options */}
                <Link href="/explore" className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-white/10 transition">
                  <span className="text-gray-300 font-bold text-sm">Explore</span>
                  <ChevronRight size={16} className="text-gray-500" />
                </Link>

                <Link href="/quiz" className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-white/10 transition">
                  <span className="text-gray-300 font-bold text-sm">Quiz</span>
                  <ChevronRight size={16} className="text-gray-500" />
                </Link>

              </div>

              <div className="mt-auto p-6 border-t border-white/10">
                {showLogoutConfirm ? (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
                    <p className="text-sm font-bold text-white mb-3">Are you sure you want to log out?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-white/10 text-white text-xs font-bold py-2 rounded-xl">Cancel</button>
                      <button onClick={confirmLogout} className="flex-1 bg-red-500 text-white text-xs font-bold py-2 rounded-xl">Yes, Logout</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowLogoutConfirm(true)} className="w-full bg-white/5 border border-white/10 text-red-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition">
                    <LogOut size={18}/> Logout securely
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-[#0a0a0d] border border-white/10 rounded-3xl p-6 w-full max-w-sm relative">
                <button onClick={() => setShowAvatarPicker(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
                <h3 className="text-lg font-bold text-white mb-6 text-center">Choose your Avatar</h3>
                <div className="grid grid-cols-3 gap-4">
                  {AVATARS.map((url, idx) => (
                    <button key={idx} onClick={() => handleSaveAvatar(url)} className="aspect-square rounded-full border-2 border-white/10 hover:border-yellow-500 hover:scale-105 transition overflow-hidden bg-white/5">
                      <img src={url} alt={`avatar-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAST BOOK DETAIL MODAL */}
      <AnimatePresence>
        {showBookDetails && selectedBook && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[800] bg-black/90 backdrop-blur-xl flex flex-col md:flex-row overflow-y-auto"
          >
            <button onClick={() => setShowBookDetails(false)} className="fixed top-6 right-6 z-[850] p-3 bg-white/10 rounded-full text-white hover:bg-red-500/80 transition-colors">
               <X size={24} />
            </button>

            {/* Book Info Section */}
            <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center border-r border-white/10">
               
               <div className="w-full h-64 md:h-96 mb-8 shadow-2xl">
                 {selectedBook.cover_path ? (
                   <div className="w-full h-full relative overflow-hidden rounded-3xl">
                     <img 
                       src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${selectedBook.cover_path}`} 
                       alt={selectedBook.title}
                       className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                     />
                   </div>
                 ) : (
                   <div className="w-full h-full bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 flex items-center justify-center rounded-3xl border border-yellow-500/20">
                     <BookOpen size={64} className="text-yellow-500 opacity-80" />
                   </div>
                 )}
               </div>

               <h1 className="font-cinzel text-3xl md:text-5xl font-black text-white mb-4">{selectedBook.title}</h1>
               <p className="text-xl text-yellow-500 mb-6">by {selectedBook.author}</p>
               <p className="text-gray-400 leading-relaxed mb-8 text-sm md:text-base">
                 {selectedBook.description || "Immerse yourself in this profound work. Verified and 100% original content."}
               </p>

               <div className="flex items-center gap-6 mt-auto">
                 <span className="text-4xl font-black text-white">₹{selectedBook.final_price}</span>
                 {purchasedBookIds.includes(selectedBook.id) ? (
                    <button onClick={() => { setShowBookDetails(false); openWebReader(selectedBook); }} className="flex-1 px-8 py-4 rounded-2xl text-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex justify-center items-center gap-3 font-bold hover:bg-emerald-500/25 transition">
                      <CheckCircle2 size={24} /> {t.readNow}
                    </button>
                  ) : (
                    <button onClick={() => setShowCheckout(true)} className="flex-1 btn-gold px-8 py-4 rounded-2xl text-lg flex justify-center items-center gap-3 font-black">
                      <Lock size={20}/> {t.buyNow}
                    </button>
                 )}
               </div>
            </div>

            {/* Reviews Section */}
            <div className="w-full md:w-1/2 p-8 md:p-16 bg-[#0a0a0d]">
               <div className="flex items-center gap-3 mb-8">
                 <MessageSquare className="text-yellow-500" />
                 <h2 className="text-2xl font-bold text-white">{t.reviews}</h2>
               </div>

               {/* FIX: Add/Edit Review Box */}
               {purchasedBookIds.includes(selectedBook.id) && (
                 <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-8">
                   <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                     <CheckCircle2 size={16}/> {userExistingReview ? "Update your review" : "You own this book"}
                   </h3>
                   <textarea 
                     value={newReviewText}
                     onChange={(e) => setNewReviewText(e.target.value)}
                     placeholder={t.writeReview}
                     className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-yellow-500 resize-none h-24 mb-3"
                   />
                   <button onClick={handleSubmitReview} className="btn-gold px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ml-auto">
                     {userExistingReview ? t.updateReview : t.submitReview}
                   </button>
                 </div>
               )}

               {/* Reviews List */}
               <div className="flex flex-col gap-4">
                 {loadingReviews ? (
                    <div className="text-gray-500 text-sm animate-pulse">Loading reviews...</div>
                 ) : reviews.length > 0 ? (
                    reviews.map(review => (
                      <div key={review.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl relative">
                        {review.user_id === user?.id && <div className="absolute top-4 right-4 text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">Your Review</div>}
                        <div className="flex justify-between items-start mb-2">
                           <div className="font-bold text-white text-sm flex items-center gap-2">
                             <UserCircle size={16} className="text-gray-400"/>
                             {review.profiles?.name || "Vedoxa Reader"}
                           </div>
                        </div>
                        <div className="flex text-yellow-500 mb-2"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                        <p className="text-gray-300 text-sm leading-relaxed">{review.review_text}</p>
                      </div>
                    ))
                 ) : (
                    <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl">
                       <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
                       <p>{t.noReviews}</p>
                    </div>
                 )}
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#0a0a0d] border border-white/10 rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
              <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition"><X size={18} /></button>
              <h2 className="text-2xl font-extrabold text-white mb-6 text-center">{authForm.mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              
              <form onSubmit={handleAuth} className="flex flex-col gap-4">
                <input required type="email" placeholder="Email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-500 transition" />
                <input required type="password" placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-500 transition" />
                <button type="submit" className="btn-gold py-3 rounded-xl font-bold text-base mt-2">{authForm.mode === 'login' ? 'Login' : 'Sign Up'}</button>
              </form>
              
              <div className="my-5 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">OR</div>
              <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white flex justify-center items-center gap-3 hover:bg-white/10 transition">
                <Globe size={18} /> Continue with Google
              </button>
              
              <p className="text-center mt-6 text-sm text-gray-400">
                {authForm.mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <span onClick={() => setAuthForm({...authForm, mode: authForm.mode === 'login' ? 'signup' : 'login'})} className="text-yellow-500 font-bold cursor-pointer hover:underline">{authForm.mode === 'login' ? 'Sign Up' : 'Login'}</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && selectedBook && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-[#0d0d10] border border-yellow-500/20 rounded-3xl p-6 md:p-8 w-full max-w-md relative shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
              <button onClick={() => setShowCheckout(false)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition"><X size={18} /></button>
              <h2 className="text-xl md:text-2xl font-extrabold text-white mb-2">{t.checkout}</h2>
              <p className="text-xs md:text-sm text-gray-400 mb-6">{t.brand}: <span className="text-yellow-500 font-bold">{selectedBook.title}</span></p>

              <form onSubmit={handlePayment} className="flex flex-col gap-4">
                <input required placeholder="Full Name" value={checkoutData.name} onChange={(e) => setCheckoutData({...checkoutData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-500 transition" />
                
                <div className="flex gap-2">
                  <select 
                    value={checkoutData.countryCode} 
                    onChange={(e) => setCheckoutData({...checkoutData, countryCode: e.target.value})}
                    className="w-24 px-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-500 transition cursor-pointer appearance-none"
                  >
                    <option value="+91" className="bg-black">🇮🇳 +91</option>
                    <option value="+1" className="bg-black">🇺🇸 +1</option>
                    <option value="+44" className="bg-black">🇬🇧 +44</option>
                    <option value="+61" className="bg-black">🇦🇺 +61</option>
                    <option value="+971" className="bg-black">🇦🇪 +971</option>
                  </select>
                  <input 
                    required 
                    type="tel" 
                    placeholder="Phone Number" 
                    value={checkoutData.phone} 
                    onChange={(e) => setCheckoutData({...checkoutData, phone: e.target.value.replace(/\D/g, '')})} 
                    maxLength={checkoutData.countryCode === '+91' ? 10 : 15}
                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-500 transition" 
                  />
                </div>
                
                <div className="flex gap-2">
                  <input placeholder={t.haveCoupon} value={checkoutData.coupon} onChange={(e) => setCheckoutData({...checkoutData, coupon: e.target.value})} className="flex-1 px-4 py-3 rounded-xl bg-yellow-500/5 border border-dashed border-yellow-500/30 text-yellow-500 outline-none focus:border-yellow-500" />
                  <button type="button" onClick={verifyCoupon} className="px-5 rounded-xl bg-yellow-500/15 text-yellow-500 font-bold hover:bg-yellow-500/25 transition">{t.apply}</button>
                </div>

                {profile?.reward_points > 0 && (
                  <label className="flex items-center gap-3 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20 cursor-pointer">
                    <input type="checkbox" checked={useRewards} onChange={(e) => setUseRewards(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                    <span className="text-emerald-400 text-sm font-medium">{t.redeemPoints} ({profile.reward_points} pts)</span>
                  </label>
                )}

                <div className="bg-white/5 p-4 rounded-xl mt-2">
                  <div className="flex justify-between text-gray-400 text-sm mb-2"><span>Price:</span> <span>₹{selectedBook.final_price}</span></div>
                  {appliedCoupon && <div className="flex justify-between text-emerald-400 text-sm mb-2"><span>Coupon Discount:</span> <span>- ₹{selectedBook.final_price - (selectedBook.final_price - (selectedBook.final_price * appliedCoupon.discount / 100))}</span></div>}
                  {useRewards && profile?.reward_points > 0 && <div className="flex justify-between text-emerald-400 text-sm mb-2"><span>Points Applied:</span> <span>- ₹{profile.reward_points}</span></div>}
                  <div className="flex justify-between text-white text-lg font-extrabold border-t border-white/10 pt-2 mt-2"><span>Total to Pay:</span> <span>₹{clientFinalPrice}</span></div>
                  <div className="text-right text-xs text-yellow-500 mt-1 font-medium">{t.rewardEarn}: {earnedPoints} pts</div>
                </div>

                <button type="submit" disabled={isProcessing} className="btn-gold w-full py-4 rounded-xl flex justify-center items-center gap-2 text-base font-extrabold mt-2">
                  {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <Lock size={18} />}
                  {isProcessing ? "Processing..." : `${t.pay} ₹${clientFinalPrice}`}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Web Reader Modal */}
      <AnimatePresence>
        {showReader && (
          <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed inset-0 z-[4000] bg-[#06060a] flex flex-col">
             <div className="px-4 py-4 md:px-6 md:py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                <div className="flex items-center gap-3"><BookOpen className="text-yellow-500" /> <span className="font-bold text-white text-lg">{t.pdfReader}</span></div>
                <button onClick={() => setShowReader(false)} className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg font-bold hover:bg-red-500/20 transition">{t.close}</button>
             </div>
             <iframe src={readerUrl} className="flex-1 w-full border-none bg-white" title="Web Reader" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout */}
      <div className="min-h-screen flex flex-col bg-[#06060a] text-gray-200 overflow-x-hidden selection:bg-yellow-500/30">
        
        {/* Responsive Navbar */}
        <nav className="sticky top-0 z-[500] px-4 py-4 md:px-8 bg-black/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 md:w-11 md:h-11 relative rounded-full p-0.5 border border-yellow-500/20 group-hover:border-yellow-500/50 transition">
              <Image 
                src="/logo.svg" 
                alt="Vedoxa Brand Logo" 
                fill 
                priority 
                className="object-contain"
              />
            </div>
            <span className="font-cinzel text-lg md:text-2xl font-black tracking-widest text-white">{t.brand}</span>
          </Link>

          <div className="flex items-center gap-3 md:gap-6">
            {!user && (
              <button onClick={() => setLang(lang === "EN" ? "HI" : "EN")} className="border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-white/10 transition">
                {lang === "EN" ? "हिन्दी" : "English"}
              </button>
            )}
            
            {user ? (
              // FIX: New Profile Button that opens sidebar
              <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1.5 md:px-3 rounded-full hover:bg-white/10 hover:border-yellow-500/30 transition">
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-yellow-500/20 flex items-center justify-center overflow-hidden">
                  {profile?.avatar_url ? <img src={profile.avatar_url} alt="profile" className="w-full h-full object-cover"/> : <UserCircle size={18} className="text-yellow-500"/>}
                </div>
                <Menu size={18} className="text-gray-400 mr-1" />
              </button>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="btn-gold px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm flex items-center gap-2 font-bold">
                <UserCircle size={16} /> <span className="hidden sm:inline">{t.login}</span><span className="sm:hidden">Login</span>
              </button>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative px-4 pt-10 pb-8 md:pt-16 md:pb-12 text-center flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150vw] md:w-[800px] h-[300px] md:h-[600px] bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
          
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="font-cinzel text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 max-w-4xl mx-auto">
            {lang === "EN" ? <>{t.heroTitle.split(" ")[0]} <span className="gold-text">{t.heroTitle.split(" ")[1]}</span> {t.heroTitle.split(" ")[2]}</> : <><span className="gold-text">अपनी चेतना</span> को जागृत करें</>}
          </motion.h1>
          
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-gray-400 max-w-2xl mx-auto text-sm md:text-lg px-2">
            {t.heroSub}
          </motion.p>
        </section>

        {/* FIX: Reduced Animated Gap Section */}
        <section className="w-full max-w-4xl mx-auto px-4 py-2 md:py-4 flex flex-col items-center opacity-80">
          <div className="h-8 md:h-12 w-px bg-gradient-to-b from-yellow-500/0 via-yellow-500/50 to-yellow-500/0 animate-pulse"></div>
          <div className="border border-yellow-500/30 bg-yellow-500/5 px-6 py-2 rounded-full text-xs md:text-sm font-bold text-yellow-500 mt-2 tracking-widest uppercase text-center shadow-[0_0_15px_rgba(234,179,8,0.1)]">
            {t.journeyText}
          </div>
          <div className="h-4 md:h-8 w-px bg-gradient-to-b from-yellow-500/0 via-yellow-500/50 to-yellow-500/0 mt-2"></div>
        </section>

        {/* Dynamic Book Library Grid */}
        <section className="px-4 py-8 md:py-12 w-full max-w-7xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-cinzel text-2xl md:text-4xl font-bold mb-10 md:mb-16 text-center">
            {t.premiumLib.split(" ")[0]} <span className="gold-text">{t.premiumLib.split(" ")[1]}</span>
          </motion.h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="bg-white/5 border border-white/10 rounded-3xl p-6 h-[380px] flex flex-col gap-4 animate-pulse">
                  <div className="w-full h-44 bg-white/10 rounded-2xl" />
                  <div className="w-3/4 h-6 bg-white/10 rounded mt-2" />
                  <div className="w-1/2 h-4 bg-white/10 rounded" />
                  <div className="w-full h-12 bg-white/10 rounded-xl mt-auto" />
                </div>
              ))
            ) : (
              books.map((book, i) => {
                const isPurchased = purchasedBookIds.includes(book.id);
                return (
                  <motion.div 
                    initial={{ opacity: 0, y: 40 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }} 
                    key={book.id} 
                    onClick={() => openBookDetails(book)} 
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 relative flex flex-col group cursor-pointer hover:bg-white/10 hover:border-yellow-500/30 transition-all duration-300 hover:-translate-y-2 shadow-lg"
                  >
                    {book.discount > 0 && !isPurchased && <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-lg text-xs font-black border border-yellow-500/30 z-10">{book.discount}% OFF</div>}
                    
                    <div className="w-full h-44 mb-6">
                      {book.cover_path ? (
                        <div className="w-full h-full relative overflow-hidden rounded-xl">
                          <img 
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${book.cover_path}`} 
                            alt={book.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 flex items-center justify-center rounded-xl border border-yellow-500/20">
                          <BookOpen size={48} className="text-yellow-500 opacity-80" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-cinzel text-xl font-bold mb-2 text-white leading-snug">{book.title}</h3>
                    <p className="text-gray-400 text-sm mb-6">by {book.author}</p>
                    
                    <div className="mt-auto flex justify-between items-end border-t border-white/10 pt-5">
                      <div>
                        {book.discount > 0 && !isPurchased && <div className="text-xs text-gray-500 line-through mb-1">₹{book.base_price}</div>}
                        <div className={`text-2xl font-black ${isPurchased ? "text-emerald-400" : "text-white"}`}>{isPurchased ? 'Owned' : `₹${book.final_price}`}</div>
                      </div>
                      
                      {isPurchased ? (
                        <button onClick={(e) => { e.stopPropagation(); openWebReader(book); }} className="px-5 py-2.5 rounded-xl text-sm bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-2 font-bold hover:bg-emerald-500/25 transition">
                          <CheckCircle2 size={16} /> {t.readNow}
                        </button>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setSelectedBook(book); setShowCheckout(true); }} className="btn-gold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 font-bold">
                          {t.buyNow} <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>

        <footer className="py-10 w-full flex flex-col items-center gap-6 border-t border-white/10 mt-auto bg-black/20">
          <Link href="/about" className="bg-white/5 border border-white/10 px-8 py-3 rounded-full text-sm font-bold text-gray-300 hover:bg-white/10 hover:text-yellow-500 hover:border-yellow-500/30 transition-all shadow-lg">
            About Us
          </Link>
          
          <div className="flex justify-center gap-4 md:gap-8 flex-wrap px-4 mb-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm font-semibold bg-white/5 px-4 py-2 rounded-full border border-white/10"><ShieldCheck size={16} className="text-yellow-500"/> {t.secure}</div>
            <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm font-semibold bg-white/5 px-4 py-2 rounded-full border border-white/10"><Zap size={16} className="text-yellow-500"/> {t.instant}</div>
          </div>
        </footer>

        {/* FIX: Scrolling Line Loop at the very bottom */}
        <div className="w-full bg-yellow-500/5 border-t border-yellow-500/20 overflow-hidden cursor-pointer py-1.5" onClick={() => window.location.reload()}>
           <div className="animate-scroll text-[10px] text-yellow-500/60 tracking-[0.2em] uppercase font-black flex w-max">
              <span className="px-8">Vedoxa Library</span>
              <span className="px-8">Vedoxa Library</span>
              <span className="px-8">Vedoxa Library</span>
              <span className="px-8">Vedoxa Library</span>
              <span className="px-8">Vedoxa Library</span>
              <span className="px-8">Vedoxa Library</span>
              <span className="px-8">Vedoxa Library</span>
              <span className="px-8">Vedoxa Library</span>
              <span className="px-8">Vedoxa Library</span>
              <span className="px-8">Vedoxa Library</span>
              <span className="px-8">Vedoxa Library</span>
              <span className="px-8">Vedoxa Library</span>
           </div>
        </div>

        <div className="fixed bottom-12 right-8 z-[4000] flex flex-col gap-4 items-center">
          <button 
            onClick={handleShare}
            className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all shadow-lg"
            title="Share Website"
          >
            <Share2 size={20} />
          </button>
        </div>

      </div>
    </>
  );
}
