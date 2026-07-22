// @ts-nocheck
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image"; 
import dynamic from "next/dynamic"; // NEW ADDITION
import {
  ShieldCheck, Globe, BookOpen, Lock, X, Zap, Search,
  ChevronRight, RefreshCw, CheckCircle2,
  LogOut, UserCircle, Coins, MessageSquare, Star, Share2, Menu, Edit3, Settings, Handshake, Heart, Sun, Moon
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
// IMPORTING THE SEPARATED COMPONENT
import BookDetailsModal from "../components/BookDetailsModal";

// NEW ADDITION: Dynamic import ensures fast homepage loading. Flipbook only loads when clicked.
const FlipbookReader = dynamic(() => import("../components/FlipbookReader"), { 
  ssr: false,
  loading: () => (
    <div className="flex-1 w-full flex items-center justify-center bg-[#07070d]">
      <div className="text-amber-500 font-bold animate-pulse">Initializing Secure Reader...</div>
    </div>
  )
});

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
  EN: { brand: "VEDOXA", login: "Login / Sign Up", heroTitle: "Awaken Your Consciousness", heroSub: "100% original, verified digital books on spirituality & psychology.", secure: "Safe & Secure", instant: "Instant PDF Auto-Download", premiumLib: "Premium Library", buyNow: "Buy Now", readNow: "Read Now", checkout: "Complete Purchase", haveCoupon: "Have a Coupon Code?", apply: "Apply", pay: "Pay Now", rewardPoints: "Reward Points", redeemPoints: "Redeem Points", rewardEarn: "You will earn", pdfReader: "Web Reader", close: "Close", reviews: "Customer Reviews", writeReview: "Write a Review", submitReview: "Submit", updateReview: "Update", noReviews: "No reviews yet. Be the first to review after purchasing!" },
  HI: { brand: "वेडोक्सा", login: "लॉगिन / साइन अप", heroTitle: "अपनी चेतना को जागृत करें", heroSub: "आध्यात्मिकता और मनोविज्ञान पर 100% मूल, सत्यापित डिजिटल पुस्तकें।", secure: "सुरक्षित और भरोसेमंद", instant: "त्वरित पीडीएफ डाउनलोड", premiumLib: "प्रीमियम पुस्तकालय", buyNow: "अभी खरीदें", readNow: "अभी पढ़ें", checkout: "खरीदारी पूरी करें", haveCoupon: "क्या आपके पास कूपन है?", apply: "लागू करें", pay: "Pay Now", rewardPoints: "इनाम अंक", redeemPoints: "अंक भुनाएं", rewardEarn: "आपको मिलेंगे", pdfReader: "वेब रीडर", close: "बंद करें", reviews: "ग्राहक समीक्षा", writeReview: "समीक्षा लिखें", submitReview: "जमा करें", updateReview: "अपडेट करें", noReviews: "अभी तक कोई समीक्षा नहीं। खरीदने के बाद पहली समीक्षा लिखें!" }
};

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

  // THEME STATE ADDED HERE
  const [theme, setTheme] = useState("light");

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [toasts, setToasts] = useState([]);

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const [favorites, setFavorites] = useState([]);
  const [partnerData, setPartnerData] = useState(null);
  
  // LIVE DATE STATE
  const [liveDate, setLiveDate] = useState("");

  NProgress.configure({ showSpinner: false, speed: 400 });

  // THEME INITIALIZATION LOGIC
  useEffect(() => {
    const savedTheme = localStorage.getItem("vedoxa_theme");
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(prefersDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("vedoxa_theme", newTheme);
  };

  const isDark = theme === "dark";

  useEffect(() => {
    const preventZoom = (e) => { e.preventDefault(); };
    document.addEventListener('gesturestart', preventZoom);
    document.addEventListener('gesturechange', preventZoom);
    
    fetchBooks();
    initPartnerSystem(); 

    // SET LIVE DATE
    const updateDate = () => {
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      setLiveDate(new Date().toLocaleDateString(lang === "EN" ? "en-US" : "hi-IN", options));
    };
    updateDate();

    const handlePopState = (e) => {
      if (showBookDetails) {
        setShowBookDetails(false);
        window.history.pushState(null, "", window.location.pathname);
      }
    };
    window.addEventListener("popstate", handlePopState);

    supabase.auth.getSession().then(({ data: { session } }) => { if (session?.user) handleUserLogin(session.user); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) handleUserLogin(session.user);
      else { setUser(null); setProfile(null); setPurchasedBookIds([]); setIsSidebarOpen(false); }
    });

    return () => {
      document.removeEventListener('gesturestart', preventZoom);
      document.removeEventListener('gesturechange', preventZoom);
      window.removeEventListener("popstate", handlePopState);
      subscription.unsubscribe();
    };
  }, [showBookDetails, lang]);

  useEffect(() => {
    if (showBookDetails || showCheckout || showAuthModal || showReader || isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showBookDetails, showCheckout, showAuthModal, showReader, isSidebarOpen]);

  const initPartnerSystem = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    let pCode = urlParams.get('partner');
    
    if (pCode) {
      localStorage.setItem('vedoxa_partner', pCode.toUpperCase());
    } else {
      pCode = localStorage.getItem('vedoxa_partner');
    }

    if (pCode) {
      const { data, error } = await supabase.from('affiliate_codes').select('*').eq('code', pCode).eq('is_claimed', true).single();
      if (data && !error) {
        setPartnerData(data);
        const viewKey = `viewed_${pCode}`;
        if (!sessionStorage.getItem(viewKey)) {
          sessionStorage.setItem(viewKey, 'true');
          const { data: aff } = await supabase.from('affiliates').select('clicks').eq('partner_code', pCode).single();
          if (aff) await supabase.from('affiliates').update({ clicks: (aff.clicks || 0) + 1 }).eq('partner_code', pCode);
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
        await supabase.from('profiles').update({ avatar_url: randomAvatar }).eq('id', loggedUser.id);
        prof.avatar_url = randomAvatar;
      }
      setProfile(prof);
      setCheckoutData(prev => ({ ...prev, email: loggedUser.email, name: prof.name || prev.name, phone: prof.phone || prev.phone }));
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
      const { data, error } = await supabase.from("reviews").select("id, review_text, created_at, user_id, profiles(name), fake_author_name").eq("book_id", bookId).order("created_at", { ascending: false });
      if (!error && data) {
        setReviews(data);
        if (user) {
          const existing = data.find(r => r.user_id === user.id);
          if (existing) { setUserExistingReview(existing); setNewReviewText(existing.review_text); } 
          else { setUserExistingReview(null); setNewReviewText(""); }
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
        const { error } = await supabase.from("reviews").insert([{ book_id: selectedBook.id, user_id: user.id, review_text: newReviewText }]);
        if (error) throw error;
        addToast("Review submitted successfully!", "success");
      }
      fetchReviews(selectedBook.id); 
    } catch (err) { addToast("Review Error: " + (err.message || "Failed to save review."), "error"); }
  };

  const openBookDetails = (book) => {
    setSelectedBook(book); fetchReviews(book.id); setShowBookDetails(true);
    if (typeof window !== "undefined") window.history.pushState({ modal: "book-details" }, "", window.location.pathname);
  };

  // Naya function suggested books ke liye jo dono kaam karega
  const handleSuggestedBookChange = (book) => {
    setSelectedBook(book);
    fetchReviews(book.id);
  };

  const closeBookDetails = () => {
    setShowBookDetails(false);
    if (typeof window !== "undefined" && window.history.state?.modal === "book-details") window.history.back();
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
    await supabase.auth.signOut(); setShowLogoutConfirm(false); setIsSidebarOpen(false); addToast("Logged out securely", "info"); 
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
      addToast("Profile picture updated!", "success"); setShowAvatarPicker(false);
    } catch (error) { addToast("Error saving avatar.", "error"); }
  };

  const toggleFavorite = (e, bookId) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]);
  };

  let partnerDiscountAmount = 0;
  let baseForClient = selectedBook?.final_price || 0;
  
  if (partnerData && selectedBook) {
      partnerDiscountAmount = Math.round(baseForClient * (partnerData.discount_pct / 100));
      baseForClient -= partnerDiscountAmount;
  }

  let couponDiscountAmount = appliedCoupon ? Math.round(baseForClient * (appliedCoupon.discount / 100)) : 0;
  let clientFinalPrice = baseForClient - couponDiscountAmount;

  if (useRewards && profile?.reward_points > 0) clientFinalPrice = Math.max(0, clientFinalPrice - profile.reward_points);
  const earnedPoints = selectedBook ? Math.floor(baseForClient * 0.019) : 0;

  const creditAffiliate = async (amountPaid) => {
    if (!partnerData || amountPaid <= 0) return;
    const commission = Math.round(amountPaid * (partnerData.commission_pct / 100));
    try {
      const { data: aff } = await supabase.from('affiliates').select('sales, total_earned').eq('partner_code', partnerData.code).single();
      if (aff) await supabase.from('affiliates').update({ sales: (aff.sales || 0) + 1, total_earned: (aff.total_earned || 0) + commission }).eq('partner_code', partnerData.code);
    } catch (err) { console.error("Affiliate credit error", err); }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) { addToast("Please login to purchase", "error"); setShowCheckout(false); setShowAuthModal(true); return; }
    if (!checkoutData.name) checkoutData.name = profile?.name || "Vedoxa Reader";
    if (!checkoutData.phone) { addToast("Phone number is required", "error"); return; }
    if (checkoutData.countryCode === '+91' && checkoutData.phone.length !== 10) { addToast("Please enter a valid 10-digit Indian phone number.", "error"); return; }

    setIsProcessing(true); NProgress.start();

    try {
      await supabase.from('profiles').update({ name: checkoutData.name, phone: checkoutData.phone }).eq('id', user.id);
      setProfile(prev => ({ ...prev, name: checkoutData.name, phone: checkoutData.phone }));
    } catch (e) { console.error("Failed to update profile", e); }

    if (clientFinalPrice === 0) {
      try {
        const { error } = await supabase.from('orders').insert([{
          customer_id: user.id, customer_name: checkoutData.name, customer_email: user.email, book_id: selectedBook.id, book_title: selectedBook.title, base_price: selectedBook.base_price, final_price: 0, amount: 0, coupon_used: appliedCoupon?.code || null, payment_method: 'free_coupon', points_used: useRewards ? profile?.reward_points : 0
        }]);
        if (error) throw error;
        addToast("Book unlocked successfully! 🎉", "success");
        setPurchasedBookIds(prev => [...prev, selectedBook.id]);
        setShowCheckout(false); closeBookDetails(); openWebReader(selectedBook);
      } catch (err) { addToast("DB Error: " + err.message, "error"); } 
      finally { setIsProcessing(false); NProgress.done(); }
      return; 
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) { addToast("Payment gateway failed. Check network.", "error"); setIsProcessing(false); NProgress.done(); return; }

    try {
      const orderRes = await fetch('/api/payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_order', bookId: selectedBook.id, couponCode: appliedCoupon?.code, useRewards, userId: user.id, finalAmountOverride: clientFinalPrice })
      });
      if (!orderRes.ok) throw new Error("Order creation failed");
      const orderData = await orderRes.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, amount: orderData.amount * 100, currency: "INR", name: "VEDOXA", description: selectedBook.title, order_id: orderData.rzpOrderId,
        prefill: { name: checkoutData.name, email: user.email, contact: checkoutData.countryCode + checkoutData.phone },
        theme: { color: "#eab308" },
        handler: async function (response) {
          try {
            addToast("Verifying payment...", "info");
            const verifyRes = await fetch('/api/payment', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
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
              setShowCheckout(false); closeBookDetails(); openWebReader(selectedBook);
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
            // Removed Google Viewer integration, passing secure signed URL directly to Flipbook
            setReaderUrl(pdfData.signedUrl); setShowReader(true); 
        } else throw error;
    } catch(err) { addToast("Failed to load secure reader", "error"); }
    NProgress.done();
  };

  const handleShare = async () => {
    let urlToShare = window.location.href;
    if (partnerData) {
      const urlObj = new URL(window.location.href); urlObj.searchParams.set('partner', partnerData.code); urlToShare = urlObj.toString();
    }
    const shareData = { title: 'VEDOXA Premium Library', text: 'Awaken Your Consciousness with original, verified digital books on spirituality & psychology.', url: urlToShare };
    if (navigator.share) { try { await navigator.share(shareData); } catch (err) {} } 
    else { navigator.clipboard.writeText(urlToShare); addToast("Website link copied to clipboard! 📋", "success"); }
  };

  // DICTIONARY STYLE SEARCH & SORTING LOGIC
  const filteredBooks = books.filter(b => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return ( b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query) || (b.tags && b.tags.some(tag => tag.toLowerCase().includes(query))) );
  });

  if (searchQuery) {
    filteredBooks.sort((a, b) => {
      const query = searchQuery.toLowerCase();
      const aTitle = a.title.toLowerCase();
      const bTitle = b.title.toLowerCase();
      
      const aStarts = aTitle.startsWith(query);
      const bStarts = bTitle.startsWith(query);

      // 1. Prioritize books that START with the search query
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // 2. Dictionary style sequence (Alphabetical Order)
      return aTitle.localeCompare(bTitle);
    });
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap');

        /* APPLE SCROLL FEEL AND UI SOFTNESS UPDATE */
        html, body {
          touch-action: pan-y;
          -webkit-text-size-adjust: 100%;
          overscroll-behavior-y: auto; /* Re-enabled for Apple Bounce */
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .font-cinzel { font-family: 'Cinzel', serif; letter-spacing: 0.03em; }

        .gold-text {
          background: linear-gradient(130deg, #b8720e 0%, #d4921a 22%, #e8b84b 48%, #f5d880 65%, #d4921a 82%, #b8720e 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 28px rgba(212,146,26,0.18));
        }

        .btn-gold {
          background: linear-gradient(145deg, #e8b84b 0%, #c07d10 55%, #d4921a 100%);
          color: #150800;
          font-weight: 800;
          letter-spacing: 0.025em;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 1px 0 rgba(255,220,120,0.55) inset, 0 -1px 0 rgba(0,0,0,0.35) inset, 0 4px 24px rgba(180,100,10,0.22), 0 1px 4px rgba(0,0,0,0.4);
        }
        .btn-gold:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.025);
          box-shadow: 0 1px 0 rgba(255,220,120,0.55) inset, 0 -1px 0 rgba(0,0,0,0.35) inset, 0 12px 40px rgba(212,146,26,0.55), 0 2px 8px rgba(0,0,0,0.4);
        }
        .btn-gold:active:not(:disabled) {
          transform: translateY(0px) scale(0.985);
          box-shadow: 0 1px 0 rgba(255,220,120,0.3) inset, 0 2px 10px rgba(212,146,26,0.3);
        }

        #nprogress .bar { background: #d4921a !important; height: 2px !important; }
        #nprogress .peg { box-shadow: 0 0 14px #d4921a, 0 0 6px #d4921a !important; }

        @keyframes scrollLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-scroll { animation: scrollLeft 28s linear infinite; display: inline-block; white-space: nowrap; }

        .discount-badge {
          background: rgba(255,255,255,0.97) !important;
          color: #92400e !important;
          box-shadow: 0 4px 18px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06);
          font-weight: 900; letter-spacing: 0.03em;
        }

        /* SOFT UI UPDATE: Smoother easing matching Apple's standard transition curve */
        .fast-anim { transition: all 0.5s cubic-bezier(0.32, 0.72, 0, 1); }

        .luminary-card { position: relative; isolation: isolate; }
        .luminary-card::before {
          content: ''; position: absolute; inset: 0; border-radius: 1.5rem;
          background: radial-gradient(ellipse at 20% 10%, rgba(255,255,255,0.07) 0%, transparent 55%);
          pointer-events: none; z-index: 0; opacity: 0; transition: opacity 0.5s ease;
        }
        .luminary-card:hover::before { opacity: 1; }
        .luminary-card:hover {
          box-shadow: 0 0 0 1px rgba(212,146,26,0.2), 0 28px 72px rgba(0,0,0,0.75), 0 0 50px rgba(212,146,26,0.06);
        }
        .luminary-card > * { position: relative; z-index: 1; }

        @keyframes breathe { 0%, 100% { opacity: 0.65; transform: translateX(-50%) scale(1); } 50% { opacity: 0.95; transform: translateX(-50%) scale(1.06); } }
        .hero-glow { animation: breathe 7s ease-in-out infinite; }

        @keyframes breathe2 { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.55; transform: scale(1.08); } }
        .hero-glow-2 { animation: breathe2 9s ease-in-out infinite; }
        .hero-glow-3 { animation: breathe2 11s ease-in-out 2s infinite; }

        .page-root::after {
          content: ''; position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.022; pointer-events: none; z-index: 9999; mix-blend-mode: overlay;
        }

        ::-webkit-scrollbar { width: 3px; background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,146,26,0.22); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(212,146,26,0.42); }

        input:focus, select:focus { outline: none; box-shadow: 0 0 0 2px rgba(212,146,26,0.2), 0 0 16px rgba(212,146,26,0.06); }
      `}</style>

      {/* Floating Toasts */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 50, scale: 0.92 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.88, x: 20 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={`px-5 py-3 rounded-2xl text-sm font-bold backdrop-blur-xl border shadow-2xl ${
                toast.type === "success" ? "bg-emerald-950/80 border-emerald-500/25 text-emerald-400"
                  : toast.type === "error" ? "bg-red-950/80 border-red-500/25 text-red-400"
                  : "bg-amber-950/80 border-amber-500/25 text-amber-400"
              }`}
            >
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[5000]"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
              className={`fixed top-0 right-0 w-80 h-full border-l z-[5001] shadow-[−20px_0_80px_rgba(0,0,0,0.8)] flex flex-col ${isDark ? 'bg-[#0c0c1a] border-white/[0.07]' : 'bg-white border-slate-200'}`}
            >
              <div className={`p-6 border-b flex justify-between items-center ${isDark ? 'border-white/[0.06] bg-black/30' : 'border-slate-100 bg-slate-50'}`}>
                <span className={`font-bold flex items-center gap-2 text-sm tracking-wide ${isDark ? 'text-white/90' : 'text-slate-800'}`}>
                  <Settings size={16} className="text-amber-500/70"/> Dashboard
                </span>
                <button onClick={() => setIsSidebarOpen(false)} className={`p-1.5 rounded-xl transition ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/[0.08]' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200'}`}>
                  <X size={18}/>
                </button>
              </div>

              <div className={`p-6 flex flex-col items-center gap-4 border-b ${isDark ? 'border-white/[0.05]' : 'border-slate-100'}`}>
                <div className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
                  <div className={`w-24 h-24 rounded-full border border-amber-500/30 overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(212,146,26,0.1)] ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'}`}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle size={48} className="text-amber-500/40" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Edit3 size={18} className="text-white" />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile?.name || "Vedoxa Reader"}</h3>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-600' : 'text-slate-500'}`}>{user?.email}</p>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-3">
                <Link href="/reward-points" className="bg-amber-500/[0.08] border border-amber-500/[0.18] p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-amber-500/[0.14] transition-all">
                  <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                    <Coins size={18}/> Reward Points
                  </div>
                  <span className={`text-xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{profile?.reward_points || 0}</span>
                </Link>

                <div className={`p-4 rounded-2xl flex justify-between items-center border ${isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`font-semibold text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Language / भाषा</span>
                  <button onClick={() => setLang(lang === "EN" ? "HI" : "EN")} className="border border-amber-500/25 text-amber-500 px-3 py-1 rounded-full text-xs font-bold hover:bg-amber-500/[0.1] transition">
                    {lang === "EN" ? "Switch to हिन्दी" : "Switch to English"}
                  </button>
                </div>

                {/* THEME TOGGLE ADDED HERE */}
                <div className={`p-4 rounded-2xl flex justify-between items-center border ${isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-slate-50 border-slate-200'}`}>
                  <span className={`font-semibold text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>Theme / थीम</span>
                  <button onClick={toggleTheme} className="border border-amber-500/25 text-amber-500 px-3 py-1 rounded-full text-xs font-bold hover:bg-amber-500/[0.1] transition flex items-center gap-2">
                    {isDark ? <Sun size={14} /> : <Moon size={14} />}
                    {isDark ? "Light Mode" : "Dark Mode"}
                  </button>
                </div>

                <Link href="/explore" className={`p-4 rounded-2xl flex justify-between items-center cursor-pointer transition border ${isDark ? 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                  <span className={`font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Explore</span>
                  <ChevronRight size={16} className={isDark ? "text-gray-600" : "text-slate-400"} />
                </Link>

                <Link href="/quiz" className={`p-4 rounded-2xl flex justify-between items-center cursor-pointer transition border ${isDark ? 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07]' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                  <span className={`font-semibold text-sm ${isDark ? 'text-gray-300' : 'text-slate-700'}`}>Quiz</span>
                  <ChevronRight size={16} className={isDark ? "text-gray-600" : "text-slate-400"} />
                </Link>
              </div>

              <div className={`mt-auto p-6 border-t ${isDark ? 'border-white/[0.06]' : 'border-slate-200'}`}>
                {showLogoutConfirm ? (
                  <div className="bg-red-500/[0.08] border border-red-500/[0.18] p-4 rounded-2xl text-center">
                    <p className={`text-sm font-bold mb-3 ${isDark ? 'text-white' : 'text-slate-900'}`}>Are you sure you want to log out?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setShowLogoutConfirm(false)} className={`flex-1 text-xs font-bold py-2 rounded-xl transition ${isDark ? 'bg-white/[0.07] text-white hover:bg-white/[0.12]' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}>Cancel</button>
                      <button onClick={confirmLogout} className="flex-1 bg-red-500/80 text-white text-xs font-bold py-2 rounded-xl hover:bg-red-500 transition">Yes, Logout</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowLogoutConfirm(true)} className={`w-full font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition text-sm border ${isDark ? 'bg-white/[0.03] border-white/[0.07] text-red-400/80 hover:bg-white/[0.07] hover:text-red-400' : 'bg-white border-slate-200 text-red-500 hover:bg-slate-50'}`}>
                    <LogOut size={16}/> Logout securely
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
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[6000] backdrop-blur-md flex items-center justify-center p-4 ${isDark ? 'bg-black/90' : 'bg-slate-900/60'}`}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className={`border rounded-3xl p-6 w-full max-w-sm relative shadow-2xl ${isDark ? 'bg-[#0c0c1a] border-white/[0.08]' : 'bg-white border-slate-200'}`}
            >
              <button onClick={() => setShowAvatarPicker(false)} className={`absolute top-4 right-4 transition p-1.5 rounded-xl ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/[0.08]' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}>
                <X size={18}/>
              </button>
              <h3 className={`text-lg font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>Choose your Avatar</h3>
              <div className="grid grid-cols-3 gap-4">
                {AVATARS.map((url, idx) => (
                  <button key={idx} onClick={() => handleSaveAvatar(url)} className={`aspect-square rounded-full border hover:border-amber-500/60 hover:scale-110 hover:shadow-[0_0_20px_rgba(212,146,26,0.3)] transition-all duration-200 overflow-hidden ${isDark ? 'border-white/[0.08] bg-white/[0.04]' : 'border-slate-200 bg-slate-50'}`}>
                    <img src={url} alt={`avatar-${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* COMPONENT INTEGRATION: BOOK DETAILS MODAL */}
      <AnimatePresence>
        {showBookDetails && selectedBook && (
          <BookDetailsModal
            selectedBook={selectedBook}
            onBookChange={handleSuggestedBookChange} 
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
            theme={theme}
            isDark={isDark}
          />
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[2000] backdrop-blur-md flex items-center justify-center p-4 ${isDark ? 'bg-black/85' : 'bg-slate-900/60'}`}
          >
            <motion.div
              initial={{ scale: 0.92, y: 24, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, y: 24, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className={`border rounded-3xl p-8 w-full max-w-md relative shadow-2xl ${isDark ? 'bg-[#0c0c1a] border-white/[0.08]' : 'bg-white border-slate-200'}`}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent rounded-full" />
              <button onClick={() => setShowAuthModal(false)} className={`absolute top-4 right-4 p-2 rounded-xl transition ${isDark ? 'bg-white/[0.05] text-gray-500 hover:text-white hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}>
                <X size={17} />
              </button>
              <h2 className={`text-2xl font-extrabold mb-6 text-center tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {authForm.mode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h2>

              <form onSubmit={handleAuth} className="flex flex-col gap-3">
                <input required type="email" placeholder="Email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className={`w-full px-4 py-3 rounded-xl outline-none focus:border-amber-500/50 transition text-sm border ${isDark ? 'bg-white/[0.04] border-white/[0.09] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`} />
                <input required type="password" placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} className={`w-full px-4 py-3 rounded-xl outline-none focus:border-amber-500/50 transition text-sm border ${isDark ? 'bg-white/[0.04] border-white/[0.09] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`} />
                <button type="submit" className="btn-gold py-3 rounded-xl font-bold text-sm mt-2">
                  {authForm.mode === 'login' ? 'Login' : 'Sign Up'}
                </button>
              </form>

              <div className={`my-5 text-center text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>OR</div>
              <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} className={`w-full py-3 rounded-xl flex justify-center items-center gap-3 transition text-sm font-medium border ${isDark ? 'bg-white/[0.04] border-white/[0.09] text-gray-300 hover:bg-white/[0.08] hover:text-white' : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}>
                <Globe size={17} /> Continue with Google
              </button>

              <p className={`text-center mt-6 text-sm ${isDark ? 'text-gray-500' : 'text-slate-600'}`}>
                {authForm.mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <span onClick={() => setAuthForm({...authForm, mode: authForm.mode === 'login' ? 'signup' : 'login'})} className="text-amber-500 font-bold cursor-pointer hover:text-amber-400 transition">
                  {authForm.mode === 'login' ? 'Sign Up' : 'Login'}
                </span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && selectedBook && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className={`fixed inset-0 z-[3000] backdrop-blur-lg flex items-center justify-center p-4 ${isDark ? 'bg-black/88' : 'bg-slate-900/60'}`}
          >
            <motion.div
              initial={{ scale: 0.92, y: 32, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.92, y: 32, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className={`border rounded-3xl p-6 md:p-8 w-full max-w-md relative shadow-2xl ${isDark ? 'bg-[#0d0d1c] border-amber-500/[0.13]' : 'bg-white border-amber-500/30'}`}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent rounded-full" />
              <button onClick={() => setShowCheckout(false)} className={`absolute top-4 right-4 p-2 rounded-xl transition ${isDark ? 'bg-white/[0.05] text-gray-500 hover:text-white hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}>
                <X size={17} />
              </button>
              <h2 className={`text-xl md:text-2xl font-extrabold mb-1 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.checkout}</h2>
              <p className={`text-xs md:text-sm mb-6 ${isDark ? 'text-gray-500' : 'text-slate-600'}`}>
                {t.brand}: <span className="text-amber-500 font-bold">{selectedBook.title}</span>
              </p>

              <form onSubmit={handlePayment} className="flex flex-col gap-3">
                <input placeholder="Full Name (Optional)" value={checkoutData.name} onChange={(e) => setCheckoutData({...checkoutData, name: e.target.value})} className={`w-full px-4 py-3 rounded-xl outline-none focus:border-amber-500/40 transition text-sm border ${isDark ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`} />

                <div className="flex gap-2">
                  <select value={checkoutData.countryCode} onChange={(e) => setCheckoutData({...checkoutData, countryCode: e.target.value})} className={`w-24 px-2 py-3 rounded-xl outline-none focus:border-amber-500/40 transition cursor-pointer appearance-none text-sm border ${isDark ? 'bg-white/[0.04] border-white/[0.08] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
                    <option value="+91" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>🇮🇳 +91</option>
                    <option value="+1" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>🇺🇸 +1</option>
                    <option value="+44" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>🇬🇧 +44</option>
                    <option value="+61" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>🇦🇺 +61</option>
                    <option value="+971" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>🇦🇪 +971</option>
                  </select>
                  <input required type="tel" placeholder="Phone Number" value={checkoutData.phone} onChange={(e) => setCheckoutData({...checkoutData, phone: e.target.value.replace(/\D/g, '')})} maxLength={checkoutData.countryCode === '+91' ? 10 : 15} className={`flex-1 px-4 py-3 rounded-xl outline-none focus:border-amber-500/40 transition text-sm border ${isDark ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`} />
                </div>

                <div className="flex gap-2">
                  <input placeholder={t.haveCoupon} value={checkoutData.coupon} onChange={(e) => setCheckoutData({...checkoutData, coupon: e.target.value})} className="flex-1 px-4 py-3 rounded-xl bg-amber-500/[0.04] border border-dashed border-amber-500/25 text-amber-500 placeholder-amber-900 outline-none focus:border-amber-500/50 text-sm" />
                  <button type="button" onClick={verifyCoupon} className="px-5 rounded-xl bg-amber-500/[0.1] text-amber-500 font-bold hover:bg-amber-500/[0.2] transition text-sm border border-amber-500/20">
                    {t.apply}
                  </button>
                </div>

                {profile?.reward_points > 0 && (
                  <label className="flex items-center gap-3 bg-emerald-500/[0.05] p-3 rounded-xl border border-emerald-500/[0.18] cursor-pointer hover:bg-emerald-500/[0.08] transition">
                    <input type="checkbox" checked={useRewards} onChange={(e) => setUseRewards(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                    <span className="text-emerald-400 text-sm font-medium">{t.redeemPoints} ({profile.reward_points} pts)</span>
                  </label>
                )}

                <div className={`p-4 rounded-2xl mt-1 border ${isDark ? 'bg-white/[0.035] border-white/[0.07]' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex justify-between text-gray-500 text-sm mb-2"><span>Price:</span> <span>₹{selectedBook.final_price}</span></div>
                  {partnerData && <div className="flex justify-between text-blue-400 font-bold text-sm mb-2"><span>Partner Discount ({partnerData.discount_pct}%):</span><span>- ₹{partnerDiscountAmount}</span></div>}
                  {appliedCoupon && <div className="flex justify-between text-emerald-400 text-sm mb-2"><span>Coupon Discount:</span> <span>- ₹{couponDiscountAmount}</span></div>}
                  {useRewards && profile?.reward_points > 0 && <div className="flex justify-between text-emerald-400 text-sm mb-2"><span>Points Applied:</span> <span>- ₹{profile.reward_points}</span></div>}
                  <div className={`flex justify-between text-lg font-extrabold border-t pt-2 mt-2 ${isDark ? 'text-white border-white/[0.08]' : 'text-slate-900 border-slate-200'}`}>
                    <span>Total to Pay:</span> <span>₹{clientFinalPrice}</span>
                  </div>
                  <div className="text-right text-xs text-amber-500 mt-1 font-medium">{t.rewardEarn}: {earnedPoints} pts</div>
                </div>

                <button type="submit" disabled={isProcessing} className="btn-gold w-full py-4 rounded-xl flex justify-center items-center gap-2 text-sm font-extrabold mt-1">
                  {isProcessing ? <RefreshCw className="animate-spin" size={17} /> : <Lock size={17} />}
                  {isProcessing ? "Processing..." : `${t.pay} ₹${clientFinalPrice}`}
                </button>

                <div className="flex justify-center items-center gap-3 mt-2 opacity-50">
                  <div className="flex items-center gap-1 font-bold tracking-wide text-[10px] md:text-xs">
                    <svg viewBox="0 0 100 24" className="h-3 md:h-4 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12.44 19H7.13L16 2.776h5.36L12.44 19z" fill={isDark ? "#fff" : "#0f172a"}/>
                      <path d="M2.57 18.99l9-16.216h5.21l-9 16.216H2.57z" fill="#3395FF"/>
                      <text x="24" y="17" fill={isDark ? "#fff" : "#0f172a"} fontSize="16" fontWeight="bold" fontFamily="sans-serif">razorpay</text>
                    </svg>
                  </div>
                  <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded border ${isDark ? 'text-gray-400 border-white/[0.15]' : 'text-slate-500 border-slate-300'}`}>
                    <ShieldCheck size={10} className="text-green-500"/> 256-BIT SSL
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Web Reader Modal - NEW FLIPBOOK IMPLEMENTATION */}
      <AnimatePresence>
        {showReader && (
          <motion.div
            initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className={`fixed inset-0 z-[4000] flex flex-col ${isDark ? 'bg-[#07070d]' : 'bg-slate-50'}`}
          >
            <div className={`px-4 py-3.5 md:px-6 border-b flex justify-between items-center z-10 ${isDark ? 'bg-[#07070d] border-white/[0.07]' : 'bg-white border-slate-200'}`}>
              <div className="flex items-center gap-3">
                <BookOpen className="text-amber-500" size={20}/>
                <span className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.pdfReader}</span>
              </div>
              <button onClick={() => setShowReader(false)} className="bg-red-500/[0.1] border border-red-500/20 text-red-400 px-4 py-2 rounded-xl font-bold hover:bg-red-500/20 transition text-sm">
                {t.close}
              </button>
            </div>
            
            {/* SECURE CONTAINER WITH NO-RIGHT-CLICK AND NO-SELECT */}
            <div className="flex-1 w-full bg-[#07070d] relative overflow-hidden flex items-center justify-center select-none pointer-events-auto" onContextMenu={(e) => e.preventDefault()}>
              <FlipbookReader pdfUrl={readerUrl} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Layout ─────────────────────────────────────────── */}
      <div className={`min-h-screen flex flex-col overflow-x-hidden selection:bg-amber-500/20 page-root ${isDark ? 'bg-[#07070d] text-gray-200' : 'bg-[#f8fafc] text-slate-800'}`}>

        {partnerData && (
          <div className="w-full bg-blue-500/[0.12] border-b border-blue-500/25 py-2 px-4 text-center flex items-center justify-center gap-2">
            <Handshake size={15} className="text-blue-400"/>
            <span className="text-blue-300/90 text-xs md:text-sm font-bold tracking-wide uppercase">
              Partner Discount of {partnerData.discount_pct}% has been applied to all books!
            </span>
          </div>
        )}

        {/* Responsive Navbar */}
        <nav className={`sticky top-0 z-[500] px-4 py-4 md:px-8 backdrop-blur-2xl border-b flex justify-between items-center transition-colors duration-300 ${isDark ? 'bg-[#07070d]/92 border-white/[0.06]' : 'bg-white/90 border-slate-200 shadow-sm'}`}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/15 to-transparent" />

          <Link href="/brand" className="flex items-center gap-3 group">
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full border border-amber-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(212,146,26,0.5)] group-hover:shadow-[0_0_25px_rgba(212,146,26,0.8)] transition-all duration-300 ${isDark ? 'bg-[#0c0c1a]' : 'bg-white'}`}>
              <span className="font-cinzel text-lg md:text-xl font-black gold-text">V</span>
            </div>
            <span className={`font-cinzel text-lg md:text-2xl font-black tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.brand}
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className={`relative flex items-center border rounded-full px-3 py-1.5 transition-all duration-300 ${isSearchOpen ? 'w-48 md:w-64' : 'w-10'} ${isDark ? 'bg-white/[0.04] border-white/[0.08]' : 'bg-slate-100 border-slate-200'}`}>
              <Search size={17} className="text-gray-500 cursor-pointer shrink-0 hover:text-gray-300 transition" onClick={() => setIsSearchOpen(!isSearchOpen)} />
              {isSearchOpen && (
                <>
                  <input autoFocus type="text" placeholder="Search books..." className={`bg-transparent border-none outline-none text-xs ml-2 w-full ${isDark ? 'text-white placeholder-gray-600' : 'text-slate-900 placeholder-slate-400'}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  {/* DROP DOWN SEARCH SUGGESTIONS */}
                  {searchQuery && (
                    <div className={`absolute top-full mt-3 right-0 w-56 md:w-72 max-h-72 overflow-y-auto rounded-2xl border shadow-2xl z-[600] flex flex-col ${isDark ? 'bg-[#0c0c1a] border-white/[0.1]' : 'bg-white border-slate-200'}`}>
                      {filteredBooks.length > 0 ? (
                        filteredBooks.slice(0, 5).map(book => (
                          <div key={book.id} onClick={() => { openBookDetails(book); setIsSearchOpen(false); setSearchQuery(""); }} className={`px-4 py-3 text-sm cursor-pointer border-b last:border-b-0 transition-colors flex items-center gap-3 ${isDark ? 'border-white/[0.05] text-white hover:bg-white/[0.05]' : 'border-slate-100 text-slate-800 hover:bg-slate-50'}`}>
                            <Search size={14} className="text-amber-500/50 shrink-0" />
                            <div className="flex-1 overflow-hidden">
                              <div className="font-bold truncate">{book.title}</div>
                              <div className="text-[10px] opacity-70 truncate">by {book.author}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={`px-4 py-4 text-xs text-center ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>No matching books found</div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {user ? (
              <button onClick={() => setIsSidebarOpen(true)} className={`flex items-center gap-2 border px-2.5 py-1.5 rounded-full transition ${isDark ? 'bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.08] hover:border-white/[0.14]' : 'bg-slate-100 border-slate-200 hover:bg-slate-200 hover:border-slate-300'}`}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-5 h-5 rounded-full object-cover border border-amber-500/40" />
                ) : (
                  <UserCircle size={17} className="text-amber-500/80" />
                )}
                <Menu size={17} className={isDark ? "text-gray-400" : "text-slate-500"} />
              </button>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="btn-gold px-5 py-2 rounded-full text-xs font-bold">
                Login
              </button>
            )}
          </div>
        </nav>

        {/* ─── Hero Section ─────────────────────────────────────── */}
        <section className="relative px-4 pt-12 pb-10 md:pt-20 md:pb-14 text-center flex flex-col items-center justify-center overflow-hidden">
          
          <div 
            className={`absolute inset-0 bg-cover bg-center pointer-events-none transition-all duration-700 ease-in-out z-[1] ${isDark ? 'opacity-20 brightness-125' : 'opacity-20'}`}
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=2000&auto=format&fit=crop')" }}
          />

          <div className="absolute top-0 left-1/2 w-[160vw] md:w-[1000px] h-[380px] md:h-[700px] bg-amber-600/[0.07] blur-[140px] rounded-full pointer-events-none z-[1] hero-glow" />
          <div className="absolute top-16 left-1/3 w-[350px] h-[280px] bg-amber-400/[0.04] blur-[90px] rounded-full pointer-events-none z-[1] hero-glow-2" />
          <div className="absolute top-8 right-[20%] w-[280px] h-[220px] bg-yellow-400/[0.025] blur-[70px] rounded-full pointer-events-none z-[1] hero-glow-3" />

          <motion.h1 initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }} className="relative z-10 font-cinzel text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-5 max-w-4xl mx-auto">
            {lang === "EN" ? (
              <>
                {t.heroTitle.split(" ")[0]} <span className="gold-text">{t.heroTitle.split(" ")[1]}</span> {t.heroTitle.split(" ")[2]}
              </>
            ) : (
              <><span className="gold-text">अपनी चेतना</span> को जागृत करें</>
            )}
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.75, delay: 0.12, ease: [0.16, 1, 0.3, 1] }} className={`relative z-10 max-w-xl mx-auto text-sm md:text-lg px-2 leading-relaxed ${isDark ? 'text-gray-500' : 'text-slate-600'}`}>
            {t.heroSub}
          </motion.p>
        </section>

        {/* ─── Dynamic Book Library Grid ────────────────────────── */}
        <section className="px-4 py-8 md:py-14 w-full max-w-7xl mx-auto relative z-10">
          
          <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center mb-10 md:mb-16">
            <h2 className="font-cinzel text-2xl md:text-4xl font-bold text-center">
              {t.premiumLib.split(" ")[0]} <span className="gold-text">{t.premiumLib.split(" ")[1]}</span>
            </h2>
            
            {/* LIVE DATE BADGE ADDED HERE */}
            <div className={`mt-3 flex items-center gap-2 text-xs md:text-sm font-semibold tracking-wider px-4 py-1.5 rounded-full border shadow-sm ${isDark ? 'bg-white/[0.04] border-white/[0.08] text-amber-400/90' : 'bg-amber-50 border-amber-200/60 text-amber-600'}`}>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              {liveDate}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className={`border rounded-3xl p-6 h-[380px] flex flex-col gap-4 animate-pulse ${isDark ? 'bg-white/[0.025] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
                  <div className={`w-full h-44 rounded-2xl ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                  <div className={`w-3/4 h-5 rounded-lg mt-2 ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                  <div className={`w-1/2 h-4 rounded-lg ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                  <div className={`w-full h-11 rounded-xl mt-auto ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                </div>
              ))
            ) : (
              filteredBooks.map((book, i) => {
                const isPurchased = purchasedBookIds.includes(book.id);
                const originalPrice = book.final_price;
                const pDiscount = partnerData ? Math.round(originalPrice * (partnerData.discount_pct / 100)) : 0;
                const displayPrice = originalPrice - pDiscount;

                return (
                  <motion.div
                    layout initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.55, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    key={book.id} onClick={() => openBookDetails(book)}
                    className={`luminary-card border rounded-3xl p-6 relative flex flex-col group cursor-pointer fast-anim hover:-translate-y-3 ${isDark ? 'bg-white/[0.025] border-white/[0.065] hover:bg-white/[0.055] hover:border-amber-500/[0.22] shadow-[0_4px_24px_rgba(0,0,0,0.4)]' : 'bg-white border-slate-200 shadow-md hover:shadow-2xl hover:border-amber-500/40'}`}
                  >
                    {book.discount > 0 && !isPurchased && !partnerData && (
                      <div className="absolute top-4 right-4 discount-badge px-3 py-1 rounded-lg text-xs z-10">
                        {book.discount}% OFF
                      </div>
                    )}
                    {partnerData && !isPurchased && (
                      <div className="absolute top-4 right-4 bg-blue-500/[0.15] text-blue-400 px-3 py-1 rounded-lg text-xs font-black border border-blue-500/30 z-10 shadow-[0_0_14px_rgba(59,130,246,0.2)]">
                        -{partnerData.discount_pct}% (Partner)
                      </div>
                    )}

                    <div className="w-full h-44 mb-6">
                      {book.cover_path ? (
                        <div className="w-full h-full relative overflow-hidden rounded-xl">
                          <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${book.cover_path}`} alt={book.title} className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105" />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-amber-500/[0.08] to-amber-700/[0.04] flex items-center justify-center rounded-xl border border-amber-500/[0.15]">
                          <BookOpen size={46} className="text-amber-500/60" />
                        </div>
                      )}
                    </div>

                    <h3 className={`font-cinzel text-xl font-bold mb-1.5 leading-snug ${isDark ? 'text-white/95' : 'text-slate-900'}`}>
                      {book.title}
                    </h3>
                    
                    <div className="flex justify-between items-center mb-6">
                      <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>by {book.author}</p>
                      <button onClick={(e) => toggleFavorite(e, book.id)} className="focus:outline-none hover:scale-110 transition-transform" title="Add to Favorites">
                        <Heart size={18} className={`transition-colors duration-300 ${favorites.includes(book.id) ? 'text-red-500 fill-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]' : (isDark ? 'text-gray-500 hover:text-red-400' : 'text-slate-400 hover:text-red-500')}`} />
                      </button>
                    </div>

                    <div className={`mt-auto flex justify-between items-end border-t pt-5 ${isDark ? 'border-white/[0.06]' : 'border-slate-100'}`}>
                      <div>
                        {book.discount > 0 && !isPurchased && !partnerData && (
                          <div className={`text-xs line-through mb-1 ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>₹{book.base_price}</div>
                        )}
                        {partnerData && !isPurchased && (
                          <div className={`text-xs line-through mb-1 ${isDark ? 'text-gray-600' : 'text-slate-400'}`}>₹{originalPrice}</div>
                        )}
                        <div className={`text-2xl font-black ${isPurchased ? (isDark ? "text-emerald-400" : "text-emerald-600") : (isDark ? "text-white" : "text-slate-900")}`}>
                          {isPurchased ? 'Owned' : `₹${displayPrice}`}
                        </div>
                      </div>

                      {isPurchased ? (
                        <button onClick={(e) => { e.stopPropagation(); openWebReader(book); }} className="px-5 py-2.5 rounded-xl text-sm bg-emerald-500/[0.1] text-emerald-500 border border-emerald-500/25 flex items-center gap-2 font-bold hover:bg-emerald-500/[0.18] transition">
                          <CheckCircle2 size={15} /> {t.readNow}
                        </button>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setSelectedBook(book); setShowCheckout(true); }} className="btn-gold px-5 py-2.5 rounded-xl text-sm flex items-center gap-1.5 font-bold">
                          {t.buyNow} <ChevronRight size={15} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-12 w-full flex flex-col items-center gap-6 border-t mt-auto relative z-10 ${isDark ? 'bg-black/25 border-white/[0.06]' : 'bg-slate-50 border-slate-200'}`}>
          <Link href="/about" className={`border px-8 py-3 rounded-full text-sm font-bold transition-all shadow-sm ${isDark ? 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:bg-white/[0.08] hover:text-amber-500 hover:border-amber-500/25' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-amber-600 hover:border-amber-500/30'}`}>
            About Us
          </Link>

          <div className="flex justify-center gap-4 md:gap-8 flex-wrap px-4 mb-4">
            <div className={`flex items-center gap-2 text-xs md:text-sm font-semibold px-4 py-2 rounded-full border ${isDark ? 'text-gray-500 bg-white/[0.03] border-white/[0.07]' : 'text-slate-600 bg-white border-slate-200'}`}>
              <ShieldCheck size={15} className="text-amber-500"/> {t.secure}
            </div>
            <button onClick={() => user ? setIsSidebarOpen(true) : setShowAuthModal(true)} className={`flex items-center gap-2 text-xs md:text-sm font-semibold px-4 py-2 rounded-full border transition cursor-pointer ${isDark ? 'text-gray-500 bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.07] hover:text-gray-300' : 'text-slate-600 bg-white border-slate-200 hover:bg-slate-100 hover:text-slate-800'}`}>
              <Zap size={15} className="text-amber-500"/> {t.instant}
            </button>
          </div>
          
          {/* New Clean Share Button Appears Only in Footer */}
          <button onClick={handleShare} className={`mt-1 flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 border ${isDark ? 'bg-white/[0.02] border-white/[0.05] text-gray-500 hover:text-white hover:bg-white/[0.05] hover:border-white/[0.15]' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}>
            <Share2 size={15} /> Share Page
          </button>
        </footer>

        {/* Scrolling Line Loop */}
        <div className="w-full bg-amber-500/[0.03] border-t border-amber-500/[0.12] overflow-hidden cursor-pointer py-2 relative z-10" onClick={() => window.location.reload()}>
          <div className={`animate-scroll text-[10px] tracking-[0.25em] uppercase font-black flex w-max ${isDark ? 'text-amber-500/40' : 'text-amber-500/60'}`}>
            <span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span>
          </div>
        </div>

        {/* PURE SVG TRUST LOGOS SECTION */}
        <div className={`w-full py-7 flex flex-col items-center border-b relative z-10 ${isDark ? 'bg-[#090914] border-white/[0.04]' : 'bg-slate-100 border-slate-200'}`}>
          <p className={`text-[10px] font-bold mb-5 tracking-widest uppercase ${isDark ? 'text-gray-700' : 'text-slate-500'}`}>Trusted By & Verified Secure</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 opacity-70 hover:opacity-100 transition-all duration-500">
            <div className={`flex items-center gap-2 font-bold tracking-wide text-sm ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
              <svg viewBox="0 0 48 48" className="h-5 md:h-6 w-auto grayscale hover:grayscale-0 transition-all cursor-pointer">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Google Verified
            </div>
            <div className="flex items-center gap-1 font-bold tracking-wide text-sm">
              <svg viewBox="0 0 100 24" className="h-4 md:h-5 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.44 19H7.13L16 2.776h5.36L12.44 19z" fill={isDark ? "#fff" : "#334155"}/>
                <path d="M2.57 18.99l9-16.216h5.21l-9 16.216H2.57z" fill="#3395FF"/>
                <text x="24" y="17" fill={isDark ? "#fff" : "#334155"} fontSize="16" fontWeight="bold" fontFamily="sans-serif">razorpay</text>
              </svg>
            </div>
            <div className={`flex items-center gap-1.5 text-sm font-bold ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
              <ShieldCheck className="text-green-500" size={19}/> McAfee Secure
            </div>
            <div className={`flex items-center gap-1.5 text-sm font-bold ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
              <Lock className="text-amber-500" size={19}/> SSL 256-bit
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
