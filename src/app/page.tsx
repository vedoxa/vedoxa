// @ts-nocheck
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image"; 
import {
  ShieldCheck, Globe, BookOpen, Lock, X, Zap, Search,
  ChevronRight, RefreshCw, CheckCircle2,
  LogOut, UserCircle, Coins, MessageSquare, Star, Share2, Menu, Edit3, Settings, Handshake
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
// IMPORTING THE SEPARATED COMPONENT
import BookDetailsModal from "../components/BookDetailsModal";

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
  EN: { brand: "VEDOXA", login: "Login / Sign Up", heroTitle: "Awaken Your Consciousness", heroSub: "100% original, verified digital books on spirituality & psychology.", secure: "Safe & Secure", instant: "Instant PDF Auto-Download", premiumLib: "Premium Library", buyNow: "Buy Now", readNow: "Read Now", checkout: "Complete Purchase", haveCoupon: "Have a Coupon Code?", apply: "Apply", pay: "Pay Now", rewardPoints: "Reward Points", redeemPoints: "Redeem Points", rewardEarn: "You will earn", pdfReader: "Web Reader", close: "Close", reviews: "Customer Reviews", writeReview: "Write a Review", submitReview: "Submit", updateReview: "Update", noReviews: "No reviews yet. Be the first to review after purchasing!", journeyText: "True knowledge begins when you look within. Start your journey today." },
  HI: { brand: "वेडोक्सा", login: "लॉगिन / साइन अप", heroTitle: "अपनी चेतना को जागृत करें", heroSub: "आध्यात्मिकता और मनोविज्ञान पर 100% मूल, सत्यापित डिजिटल पुस्तकें।", secure: "सुरक्षित और भरोसेमंद", instant: "त्वरित पीडीएफ डाउनलोड", premiumLib: "प्रीमियम पुस्तकालय", buyNow: "अभी खरीदें", readNow: "अभी पढ़ें", checkout: "खरीदारी पूरी करें", haveCoupon: "क्या आपके पास कूपन है?", apply: "लागू करें", pay: "Pay Now", rewardPoints: "इनाम अंक", redeemPoints: "अंक भुनाएं", rewardEarn: "आपको मिलेंगे", pdfReader: "वेब रीडर", close: "बंद करें", reviews: "ग्राहक समीक्षा", writeReview: "समीक्षा लिखें", submitReview: "जमा करें", updateReview: "अपडेट करें", noReviews: "अभी तक कोई समीक्षा नहीं। खरीदने के बाद पहली समीक्षा लिखें!", journeyText: "सच्चा ज्ञान तब शुरू होता है जब आप अपने भीतर झांकते हैं। आज ही अपनी यात्रा शुरू करें।" }
};

// 5 Premium Avatars
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

  // SEARCH BAR STATE
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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
  
  const [userExistingReview, setUserExistingReview] = useState(null);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  // =====================================
  // NEW HAMBURGER MENU STATE
  // =====================================
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState(null);

  // =====================================
  // PARTNER / AFFILIATE LOGIC 
  // =====================================
  const [partnerData, setPartnerData] = useState(null);

  NProgress.configure({ showSpinner: false, speed: 400 });

  useEffect(() => {
    const preventZoom = (e) => { e.preventDefault(); };
    document.addEventListener('gesturestart', preventZoom);
    document.addEventListener('gesturechange', preventZoom);
    
    fetchBooks();
    initPartnerSystem(); 

    // STRICT 1-CLICK BACK BUTTON LOGIC
    const handlePopState = (event) => {
      // If modal is currently open and back is pressed
      if (document.body.style.overflow === 'hidden') {
         // Close ALL Modals
         setShowBookDetails(false);
         setShowCheckout(false);
         setShowAuthModal(false);
         setShowReader(false);
         setShowAvatarPicker(false);
         setIsHamburgerOpen(false);
      }
    };
    window.addEventListener("popstate", handlePopState);

    supabase.auth.getSession().then(({ data: { session } }) => { if (session?.user) handleUserLogin(session.user); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) handleUserLogin(session.user);
      else { setUser(null); setProfile(null); setPurchasedBookIds([]); }
    });

    return () => {
      document.removeEventListener('gesturestart', preventZoom);
      document.removeEventListener('gesturechange', preventZoom);
      window.removeEventListener("popstate", handlePopState);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    // Keep scroll locked when ANY modal is open
    if (showBookDetails || showCheckout || showAuthModal || showReader || showAvatarPicker || isHamburgerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [showBookDetails, showCheckout, showAuthModal, showReader, showAvatarPicker, isHamburgerOpen]);

  const initPartnerSystem = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let pCode = urlParams.get('partner');
    
    if (pCode) {
      localStorage.setItem('vedoxa_partner', pCode.toUpperCase());
    } else {
      pCode = localStorage.getItem('vedoxa_partner');
    }

    if (pCode) {
      const { data, error } = await supabase
        .from('affiliate_codes')
        .select('*')
        .eq('code', pCode)
        .eq('is_claimed', true)
        .single();
        
      if (data && !error) {
        setPartnerData(data);
        const viewKey = `viewed_${pCode}`;
        if (!sessionStorage.getItem(viewKey)) {
          sessionStorage.setItem(viewKey, 'true');
          const { data: aff } = await supabase.from('affiliates').select('clicks').eq('partner_code', pCode).single();
          if (aff) {
            await supabase.from('affiliates').update({ clicks: (aff.clicks || 0) + 1 }).eq('partner_code', pCode);
          }
        }
      } else {
        localStorage.removeItem('vedoxa_partner'); 
      }
    }
  };

  const handleUserLogin = async (loggedUser) => {
    setUser(loggedUser);
    
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', loggedUser.id).single();
    if (prof) {
      if (!prof.avatar_url) {
        const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
        const { error } = await supabase.from('profiles').update({ avatar_url: randomAvatar }).eq('id', loggedUser.id);
        if (!error) prof.avatar_url = randomAvatar;
      }
      setProfile(prof);
      
      setCheckoutData(prev => ({ 
        ...prev, 
        email: loggedUser.email,
        name: prof.name || prev.name,
        phone: prof.phone || prev.phone
      }));
    } else {
      setCheckoutData(prev => ({ ...prev, email: loggedUser.email }));
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
        .select("id, review_text, created_at, user_id, profiles(name), fake_author_name")
        .eq("book_id", bookId)
        .order("created_at", { ascending: false });
      
      if (!error && data) {
        setReviews(data);
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
        const { error } = await supabase.from("reviews").update({ review_text: newReviewText }).eq("id", userExistingReview.id);
        if (error) throw error;
        addToast("Review updated successfully!", "success");
      } else {
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

  // HISTORY PUSH FIX FOR BACK BUTTON
  const openBookDetails = (book) => {
    setSelectedBook(book);
    fetchReviews(book.id);
    setShowBookDetails(true);
    if (typeof window !== "undefined") {
       window.history.pushState({ modalOpen: true }, "", window.location.pathname);
    }
  };

  const closeBookDetails = () => {
    setShowBookDetails(false);
    if (typeof window !== "undefined" && window.history.state?.modalOpen) {
       window.history.back(); // Clean the state
    }
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
    addToast("Logged out securely", "info"); 
    setIsHamburgerOpen(false);
  };

  const verifyCoupon = async () => {
    if (!checkoutData.coupon) return;
    const { data } = await supabase.from('coupons').select('*').eq('code', checkoutData.coupon.toUpperCase()).single();
    if (data && new Date(data.expiry) > new Date() && data.used < data.limit_count) {
      setAppliedCoupon(data); addToast("Coupon applied! 🎉", "success");
    } else { setAppliedCoupon(null); addToast("Invalid or expired coupon", "error"); }
  };

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

  let partnerDiscountAmount = 0;
  let baseForClient = selectedBook?.final_price || 0;
  
  if (partnerData && selectedBook) {
      partnerDiscountAmount = Math.round(baseForClient * (partnerData.discount_pct / 100));
      baseForClient -= partnerDiscountAmount;
  }

  let couponDiscountAmount = appliedCoupon ? Math.round(baseForClient * (appliedCoupon.discount / 100)) : 0;
  let clientFinalPrice = baseForClient - couponDiscountAmount;

  if (useRewards && profile?.reward_points > 0) {
      clientFinalPrice = Math.max(0, clientFinalPrice - profile.reward_points);
  }
  
  const earnedPoints = selectedBook ? Math.floor(baseForClient * 0.019) : 0;

  const creditAffiliate = async (amountPaid) => {
    if (!partnerData || amountPaid <= 0) return;
    const commission = Math.round(amountPaid * (partnerData.commission_pct / 100));
    try {
      const { data: aff } = await supabase.from('affiliates').select('sales, total_earned').eq('partner_code', partnerData.code).single();
      if (aff) {
        await supabase.from('affiliates').update({
          sales: (aff.sales || 0) + 1,
          total_earned: (aff.total_earned || 0) + commission
        }).eq('partner_code', partnerData.code);
      }
    } catch (err) { console.error("Affiliate credit error", err); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) { addToast("Please login to purchase", "error"); setShowCheckout(false); setShowAuthModal(true); return; }
    if (!checkoutData.name) checkoutData.name = profile?.name || "Vedoxa Reader"; // Auto handle blank name
    if (!checkoutData.phone) { addToast("Phone number is required", "error"); return; }
    
    if (checkoutData.countryCode === '+91' && checkoutData.phone.length !== 10) { 
      addToast("Please enter a valid 10-digit Indian phone number.", "error"); 
      return; 
    }

    setIsProcessing(true); NProgress.start();

    try {
      await supabase.from('profiles').update({ 
        name: checkoutData.name, 
        phone: checkoutData.phone 
      }).eq('id', user.id);
      
      setProfile(prev => ({ ...prev, name: checkoutData.name, phone: checkoutData.phone }));
    } catch (e) { console.error("Failed to update profile", e); }

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
        setShowCheckout(false); closeBookDetails();
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
        body: JSON.stringify({ action: 'create_order', bookId: selectedBook.id, couponCode: appliedCoupon?.code, useRewards, userId: user.id, finalAmountOverride: clientFinalPrice })
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
              
              if (partnerData) await creditAffiliate(orderData.amount);

              setPurchasedBookIds(prev => [...prev, selectedBook.id]);
              setShowCheckout(false);
              closeBookDetails();
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
    let urlToShare = window.location.href;
    if (partnerData) {
      const urlObj = new URL(window.location.href);
      urlObj.searchParams.set('partner', partnerData.code);
      urlToShare = urlObj.toString();
    }

    const shareData = {
      title: 'VEDOXA Premium Library',
      text: 'Awaken Your Consciousness with original, verified digital books on spirituality & psychology.',
      url: urlToShare,
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) {}
    } else {
      navigator.clipboard.writeText(urlToShare);
      addToast("Website link copied to clipboard! 📋", "success");
    }
  };

  // SMART FILTER LOGIC (English + Hindi + Tags)
  const filteredBooks = books.filter(b => {
    const query = searchQuery.toLowerCase();
    return (
      b.title.toLowerCase().includes(query) ||
      b.author.toLowerCase().includes(query) ||
      (b.tags && b.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  });

  return (
    <>
      <style>{`
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
        
        @keyframes scrollLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scrollLeft 20s linear infinite;
          display: inline-block;
          white-space: nowrap;
        }

        /* Solid White Discount Badge */
        .discount-badge {
            background-color: white !important;
            color: #b45309 !important; /* Bold Amber/Gold */
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            font-weight: 900;
        }
        .fast-anim { transition: all 0.15s ease-out; }
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

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
             <div className="bg-[#0a0a0d] border border-white/10 rounded-3xl p-6 w-full max-w-sm relative">
                <button onClick={() => setShowAvatarPicker(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20}/></button>
                <h3 className="text-lg font-bold text-white mb-6 text-center">Choose your Avatar</h3>
                <div className="grid grid-cols-3 gap-4 mb-8">
                  {AVATARS.map((url, idx) => (
                    <button key={idx} onClick={() => handleSaveAvatar(url)} className="aspect-square rounded-full border-2 border-white/10 hover:border-yellow-500 hover:scale-105 transition overflow-hidden bg-white/5">
                      <img src={url} alt={`avatar-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
                
                <div className="border-t border-white/10 pt-6">
                  <button onClick={confirmLogout} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition">
                    <LogOut size={18}/> Logout securely
                  </button>
                </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==============================================
          NEW RIGHT SIDEBAR HAMBURGER MENU 
      ============================================== */}
      <AnimatePresence>
        {isHamburgerOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              onClick={() => setIsHamburgerOpen(false)}
              className="fixed inset-0 z-[6500] bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            {/* Sidebar Drawer */}
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-72 bg-[#0d0d10] border-l border-white/10 z-[7000] shadow-2xl flex flex-col"
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Settings size={20} className="text-yellow-500" /> Menu
                  </h3>
                  <button onClick={() => setIsHamburgerOpen(false)} className="p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  {/* Collapsible Item 1: Profile & Preferences */}
                  <div className="mb-4 bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                    <button onClick={() => setExpandedMenu(expandedMenu === 'preferences' ? null : 'preferences')} className="w-full px-5 py-4 flex justify-between items-center text-gray-300 font-bold hover:text-yellow-500 transition">
                      <div className="flex items-center gap-3"><UserCircle size={18} /> Preferences</div>
                      <span>{expandedMenu === 'preferences' ? '-' : '+'}</span>
                    </button>
                    <AnimatePresence>
                      {expandedMenu === 'preferences' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-black/20">
                          <div className="px-5 pb-4 pt-2 flex flex-col gap-3">
                            <p className="text-sm text-gray-400 hover:text-white cursor-pointer transition flex items-center gap-2"><Globe size={14}/> Change Language</p>
                            <p className="text-sm text-gray-400 hover:text-white cursor-pointer transition flex items-center gap-2"><Edit3 size={14}/> Edit Profile Data</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Collapsible Item 2: Rewards & Points */}
                  <div className="mb-4 bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                    <button onClick={() => setExpandedMenu(expandedMenu === 'rewards' ? null : 'rewards')} className="w-full px-5 py-4 flex justify-between items-center text-gray-300 font-bold hover:text-yellow-500 transition">
                      <div className="flex items-center gap-3"><Coins size={18} /> Rewards</div>
                      <span>{expandedMenu === 'rewards' ? '-' : '+'}</span>
                    </button>
                    <AnimatePresence>
                      {expandedMenu === 'rewards' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-black/20">
                          <div className="px-5 pb-4 pt-2 flex flex-col gap-3">
                            <p className="text-sm text-yellow-500 font-bold flex justify-between">Available Points: <span>{profile?.reward_points || 0}</span></p>
                            <p className="text-sm text-gray-400 hover:text-white cursor-pointer transition mt-1">View Point History</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Collapsible Item 3: Support */}
                  <div className="mb-4 bg-white/5 rounded-2xl overflow-hidden border border-white/5">
                    <button onClick={() => setExpandedMenu(expandedMenu === 'support' ? null : 'support')} className="w-full px-5 py-4 flex justify-between items-center text-gray-300 font-bold hover:text-yellow-500 transition">
                      <div className="flex items-center gap-3"><MessageSquare size={18} /> Support</div>
                      <span>{expandedMenu === 'support' ? '-' : '+'}</span>
                    </button>
                    <AnimatePresence>
                      {expandedMenu === 'support' && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-black/20">
                          <div className="px-5 pb-4 pt-2 flex flex-col gap-3">
                            <p className="text-sm text-gray-400 hover:text-white cursor-pointer transition">Contact Us</p>
                            <p className="text-sm text-gray-400 hover:text-white cursor-pointer transition">FAQs</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {user && (
                  <div className="mt-auto pt-4 border-t border-white/10">
                    <button onClick={confirmLogout} className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition">
                      <LogOut size={18}/> Logout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* ============================================== */}

      {/* COMPONENT INTEGRATION: BOOK DETAILS MODAL */}
      <AnimatePresence>
        {showBookDetails && selectedBook && (
          <BookDetailsModal 
            selectedBook={selectedBook}
            partnerData={partnerData}
            purchasedBookIds={purchasedBookIds}
            t={t}
            user={user}
            userExistingReview={userExistingReview}
            newReviewText={newReviewText}
            setNewReviewText={setNewReviewText}
            loadingReviews={loadingReviews}
            reviews={reviews}
            handleSubmitReview={handleSubmitReview}
            setShowBookDetails={closeBookDetails}
            openWebReader={openWebReader}
            setShowCheckout={setShowCheckout}
          />
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
                <input placeholder="Full Name (Optional)" value={checkoutData.name} onChange={(e) => setCheckoutData({...checkoutData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-500 transition" />
                
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
                  {partnerData && <div className="flex justify-between text-blue-400 font-bold text-sm mb-2"><span>Partner Discount ({partnerData.discount_pct}%):</span> <span>- ₹{partnerDiscountAmount}</span></div>}
                  {appliedCoupon && <div className="flex justify-between text-emerald-400 text-sm mb-2"><span>Coupon Discount:</span> <span>- ₹{couponDiscountAmount}</span></div>}
                  {useRewards && profile?.reward_points > 0 && <div className="flex justify-between text-emerald-400 text-sm mb-2"><span>Points Applied:</span> <span>- ₹{profile.reward_points}</span></div>}
                  <div className="flex justify-between text-white text-lg font-extrabold border-t border-white/10 pt-2 mt-2"><span>Total to Pay:</span> <span>₹{clientFinalPrice}</span></div>
                  <div className="text-right text-xs text-yellow-500 mt-1 font-medium">{t.rewardEarn}: {earnedPoints} pts</div>
                </div>

                <button type="submit" disabled={isProcessing} className="btn-gold w-full py-4 rounded-xl flex justify-center items-center gap-2 text-base font-extrabold mt-2">
                  {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <Lock size={18} />}
                  {isProcessing ? "Processing..." : `${t.pay} ₹${clientFinalPrice}`}
                </button>
                
                {/* CHECKOUT MODAL PURE SVG RAZORPAY & SSL */}
                <div className="flex justify-center items-center gap-3 mt-3 opacity-60">
                   <div className="flex items-center gap-1 font-bold text-white tracking-wide text-[10px] md:text-xs">
                     <svg viewBox="0 0 100 24" className="h-3 md:h-4 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12.44 19H7.13L16 2.776h5.36L12.44 19z" fill="#fff"/>
                        <path d="M2.57 18.99l9-16.216h5.21l-9 16.216H2.57z" fill="#3395FF"/>
                        <text x="24" y="17" fill="#fff" fontSize="16" fontWeight="bold" fontFamily="sans-serif">razorpay</text>
                     </svg>
                   </div>
                   <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 border border-white/20 px-1.5 py-0.5 rounded"><ShieldCheck size={10} className="text-green-500"/> 256-BIT SSL</div>
                </div>

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
        
        {/* Dynamic Partner Banner */}
        {partnerData && (
          <div className="w-full bg-blue-500/20 border-b border-blue-500/40 py-2 px-4 text-center flex items-center justify-center gap-2">
            <Handshake size={16} className="text-blue-400"/>
            <span className="text-blue-300 text-xs md:text-sm font-bold tracking-wide uppercase">Partner Discount of {partnerData.discount_pct}% has been applied to all books!</span>
          </div>
        )}

        {/* Responsive Navbar */}
        <nav className="sticky top-0 z-[500] px-4 py-4 md:px-8 bg-black/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center">
          <Link href="/brand" className="flex items-center gap-3 group">
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

          <div className="flex items-center gap-3">
            {/* SEARCH BAR UI */}
            <div className={`flex items-center bg-white/5 border border-white/10 rounded-full px-3 py-1.5 transition-all ${isSearchOpen ? 'w-48 md:w-64' : 'w-10'}`}>
               <Search size={18} className="text-gray-400 cursor-pointer shrink-0" onClick={() => setIsSearchOpen(!isSearchOpen)} />
               {isSearchOpen && (
                 <input 
                   autoFocus
                   type="text" 
                   placeholder="Search books..." 
                   className="bg-transparent border-none outline-none text-xs ml-2 w-full text-white"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                 />
               )}
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <button onClick={() => setShowAvatarPicker(true)} className="flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1.5 rounded-full">
                  <div className="w-6 h-6 rounded-full bg-yellow-500/20 flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? <img src={profile.avatar_url} alt="profile" className="w-full h-full object-cover"/> : <UserCircle size={18} className="text-yellow-500"/>}
                  </div>
                </button>
                {/* HAMBURGER MENU BUTTON ADDED HERE */}
                <button onClick={() => setIsHamburgerOpen(true)} className="p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-white/10">
                  <Menu size={20} />
                </button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="btn-gold px-4 py-2 rounded-full text-xs font-bold">Login</button>
            )}
          </div>
        </nav>

        {/* Search open hone pe Hero Section hide ho jayega */}
        {!isSearchOpen && (
          <>
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

            {/* Animated Gap Section */}
            <section className="w-full max-w-4xl mx-auto px-4 py-2 md:py-4 flex flex-col items-center opacity-80">
              <div className="h-8 md:h-12 w-px bg-gradient-to-b from-yellow-500/0 via-yellow-500/50 to-yellow-500/0 animate-pulse"></div>
              <div className="border border-yellow-500/30 bg-yellow-500/5 px-6 py-2 rounded-full text-xs md:text-sm font-bold text-yellow-500 mt-2 tracking-widest uppercase text-center shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                {t.journeyText}
              </div>
              <div className="h-4 md:h-8 w-px bg-gradient-to-b from-yellow-500/0 via-yellow-500/50 to-yellow-500/0 mt-2"></div>
            </section>
          </>
        )}

        {/* Dynamic Book Library Grid */}
        <section className="px-4 py-8 md:py-12 w-full max-w-7xl mx-auto">
          {!isSearchOpen && (
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-cinzel text-2xl md:text-4xl font-bold mb-10 md:mb-16 text-center">
              {t.premiumLib.split(" ")[0]} <span className="gold-text">{t.premiumLib.split(" ")[1]}</span>
            </motion.h2>
          )}
          
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
              filteredBooks.map((book, i) => {
                const isPurchased = purchasedBookIds.includes(book.id);
                
                // Book Price display calculation for partners
                const originalPrice = book.final_price;
                const pDiscount = partnerData ? Math.round(originalPrice * (partnerData.discount_pct / 100)) : 0;
                const displayPrice = originalPrice - pDiscount;

                return (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, y: 40 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: i * 0.1 }} 
                    key={book.id} 
                    onClick={() => openBookDetails(book)} 
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 relative flex flex-col group cursor-pointer fast-anim hover:bg-white/10"
                  >
                    {book.discount > 0 && !isPurchased && !partnerData && (
                      <div className="absolute top-4 right-4 discount-badge px-3 py-1 rounded-lg text-xs z-10">
                        {book.discount}% OFF
                      </div>
                    )}
                    {partnerData && !isPurchased && <div className="absolute top-4 right-4 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-xs font-black border border-blue-500/40 z-10 shadow-[0_0_10px_rgba(59,130,246,0.3)]">-{partnerData.discount_pct}% (Partner)</div>}
                    
                    <div className="w-full h-44 mb-6 relative overflow-hidden rounded-xl">
                        <img 
                          src={`${supabaseUrl}/storage/v1/object/public/books-covers/${book.cover_path}`} 
                          alt={book.title}
                          className="w-full h-full object-contain"
                        />
                    </div>
                    
                    <h3 className="font-cinzel text-xl font-bold mb-2 text-white leading-snug">{book.title}</h3>
                    <p className="text-gray-400 text-sm mb-6">by {book.author}</p>
                    
                    <div className="mt-auto flex justify-between items-end border-t border-white/10 pt-5">
                      <div>
                        {book.discount > 0 && !isPurchased && !partnerData && <div className="text-xs text-gray-500 line-through mb-1">₹{book.base_price}</div>}
                        {partnerData && !isPurchased && <div className="text-xs text-gray-500 line-through mb-1">₹{originalPrice}</div>}
                        <div className={`text-2xl font-black ${isPurchased ? "text-emerald-400" : "text-white"}`}>{isPurchased ? 'Owned' : `₹${displayPrice}`}</div>
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
            <button onClick={() => user ? setIsHamburgerOpen(true) : setShowAuthModal(true)} className="flex items-center gap-2 text-gray-400 text-xs md:text-sm font-semibold bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 transition cursor-pointer"><Zap size={16} className="text-yellow-500"/> {t.instant}</button>
          </div>
        </footer>

        {/* Scrolling Line Loop at the very bottom */}
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

        {/* PURE SVG TRUST LOGOS SECTION */}
        <div className="w-full py-6 flex flex-col items-center bg-[#0a0a0d] border-b border-white/5">
           <p className="text-gray-500 text-[10px] font-bold mb-4 tracking-widest uppercase">Trusted By & Verified Secure</p>
           <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 opacity-70 hover:opacity-100 transition-all duration-300">
              
              {/* Google Verified Pure SVG */}
              <div className="flex items-center gap-2 font-bold text-white tracking-wide text-sm">
                <svg viewBox="0 0 48 48" className="h-5 md:h-6 w-auto grayscale hover:grayscale-0 transition-all cursor-pointer">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Google Verified
              </div>

              {/* Razorpay Pure SVG Text + Icon */}
              <div className="flex items-center gap-1 font-bold text-white tracking-wide text-sm">
                <svg viewBox="0 0 100 24" className="h-4 md:h-5 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.44 19H7.13L16 2.776h5.36L12.44 19z" fill="#fff"/>
                  <path d="M2.57 18.99l9-16.216h5.21l-9 16.216H2.57z" fill="#3395FF"/>
                  <text x="24" y="17" fill="#fff" fontSize="16" fontWeight="bold" fontFamily="sans-serif">razorpay</text>
                </svg>
              </div>
              
              {/* Lucide Vector Icons */}
              <div className="flex items-center gap-1.5 text-sm font-bold text-white"><ShieldCheck className="text-green-500" size={20}/> McAfee Secure</div>
              <div className="flex items-center gap-1.5 text-sm font-bold text-white"><Lock className="text-yellow-500" size={20}/> SSL 256-bit</div>
           </div>
        </div>

        {/* Floating Share Button */}
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
