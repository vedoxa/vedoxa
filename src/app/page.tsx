// @ts-nocheck
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image"; 
import dynamic from "next/dynamic"; // NEW ADDITION
import {
  ShieldCheck, Globe, BookOpen, Lock, X, Zap, Search,
  ChevronRight, RefreshCw, CheckCircle2,
  LogOut, UserCircle, Coins, MessageSquare, Star, Share2, Menu, Edit3, Settings, Handshake, Heart, Sun, Moon, Crown, Sparkles, Eye,
  LayoutDashboard, Compass, Brain, BookMarked, Camera, ArrowUpRight, Check, ChevronDown, Tag, Flame, SlidersHorizontal, ArrowUp
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
// IMPORTING THE SEPARATED COMPONENT
import BookDetailsModal from "../components/BookDetailsModal";
// HERO SECTION (shared component, same hero is also available as its own page at /hero)
import HeroSection from "../components/HeroSection";

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

// NEW ADDITION: Google One Tap script loader (shows the Google accounts already signed in on the user's browser)
function loadGoogleScript() {
  return new Promise((resolve) => {
    if (window.google?.accounts?.id) return resolve(true);
    const existing = document.getElementById("gsi-client");
    if (existing) { existing.addEventListener("load", () => resolve(true)); return; }
    const script = document.createElement("script");
    script.id = "gsi-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const dict = {
  EN: { brand: "VEDOXA", login: "Login / Sign Up", heroTitle: "Awaken Your Consciousness", heroSub: "100% original, verified digital books on spirituality & psychology.", secure: "Safe & Secure", instant: "Instant PDF Auto-Download", premiumLib: "Premium Library", buyNow: "Buy Now", readNow: "Read Now", checkout: "Complete Purchase", haveCoupon: "Have a Coupon Code?", apply: "Apply", pay: "Pay Now", rewardPoints: "Reward Points", redeemPoints: "Redeem Points", rewardEarn: "You will earn", pdfReader: "Web Reader", close: "Close", reviews: "Customer Reviews", writeReview: "Write a Review", submitReview: "Submit", updateReview: "Update", noReviews: "No reviews yet. Be the first to review after purchasing!" },
  HI: { brand: "वेडोक्सा", login: "लॉगिन / साइन अप", heroTitle: "अपनी चेतना को जागृत करें", heroSub: "आध्यात्मिकता और मनोविज्ञान पर 100% मूल, सत्यापित डिजिटल पुस्तकें।", secure: "सुरक्षित और भरोसेमंद", instant: "त्वरित पीडीएफ डाउनलोड", premiumLib: "प्रीमियम पुस्तकालय", buyNow: "अभी खरीदें", readNow: "अभी पढ़ें", checkout: "खरीदारी पूरी करें", haveCoupon: "क्या आपके पास कूपन है?", apply: "लागू करें", pay: "Pay Now", rewardPoints: "इनाम अंक", redeemPoints: "अंक भुनाएं", rewardEarn: "आपको मिलेंगे", pdfReader: "वेब रीडर", close: "बंद करें", reviews: "ग्राहक समीक्षा", writeReview: "समीक्षा लिखें", submitReview: "जमा करें", updateReview: "अपडेट करें", noReviews: "अभी तक कोई समीक्षा नहीं। खरीदने के बाद पहली समीक्षा लिखें!" }
};

// Generate Data URI SVGs instead of external links for Avatars.
// UPGRADED: gradient background + soft light + small book badge for a more premium look.
const encodeSvg = (person, badge, from, to) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient><radialGradient id="s" cx="30%" cy="22%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="100" height="100" fill="url(#g)"/><rect width="100" height="100" fill="url(#s)"/><text x="50" y="50" font-size="54" text-anchor="middle" dominant-baseline="central">${person}</text><circle cx="77" cy="77" r="14" fill="#fff" fill-opacity=".96"/><text x="77" y="78" font-size="17" text-anchor="middle" dominant-baseline="central">${badge}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const AVATARS = [
  encodeSvg('👩🏻🏫', '📖', '#fbbf24', '#d97706'), // Amber, Woman reading
  encodeSvg('👨🏽🎓', '📘', '#34d399', '#047857'), // Green, Man graduating/reading
  encodeSvg('👩🏾💻', '📚', '#f87171', '#b91c1c'), // Red, Woman studying
  encodeSvg('👨🏻🏫', '📗', '#60a5fa', '#1d4ed8'), // Blue, Man reading
  encodeSvg('🧕🏼', '📖', '#a78bfa', '#6d28d9'),  // Purple, Diverse reading
  encodeSvg('🧘🏽♂️', '🪷', '#f472b6', '#9d174d')  // Pink, Meditation / lotus
];

// Lightweight floating golden particles for instant 0ms video-like spiritual ambience
const GOLDEN_PARTICLES = [
  { left: "10%", size: 4, duration: "6s", delay: "0s" },
  { left: "22%", size: 6, duration: "8s", delay: "1.2s" },
  { left: "35%", size: 3, duration: "5.5s", delay: "0.5s" },
  { left: "48%", size: 5, duration: "7s", delay: "2s" },
  { left: "62%", size: 4, duration: "6.5s", delay: "0.8s" },
  { left: "75%", size: 6, duration: "8.5s", delay: "1.5s" },
  { left: "88%", size: 3, duration: "6s", delay: "0.3s" },
  { left: "16%", size: 5, duration: "7.5s", delay: "2.5s" },
  { left: "54%", size: 4, duration: "5.8s", delay: "1.8s" },
  { left: "82%", size: 5, duration: "7.2s", delay: "0.9s" }
];

export default function VedoxaHome() {
  const [lang, setLang] = useState("EN");
  const t = dict[lang];

  // THEME STATE ADDED HERE
  const [theme, setTheme] = useState("light");

  // VIDEO REF FOR MOBILE AUTOPLAY FIX
  const heroVideoRef = useRef(null);
  const searchContainerRef = useRef(null);

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

  // NEW ADDITION: last used email (login suggestion chip) + collapsible coupon box in checkout
  const [savedEmail, setSavedEmail] = useState("");
  const [showCoupon, setShowCoupon] = useState(false);

  // NEW UI ENHANCEMENT STATES (Non-breaking additions for richer UX)
  const [activeBookFilter, setActiveBookFilter] = useState("all"); // 'all' | 'trending' | 'favorites' | 'owned'
  const [sortBy, setSortBy] = useState("default"); // 'default' | 'popular' | 'price_low' | 'price_high'
  const [sidebarTab, setSidebarTab] = useState("overview"); // 'overview' | 'shelf'
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [likedBurstId, setLikedBurstId] = useState(null);
  const deepLinkHandledRef = useRef(false);

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

  // NEW ADDITION: read the last used email so the login box can suggest it instantly
  useEffect(() => {
    try { setSavedEmail(localStorage.getItem("vedoxa_last_email") || ""); } catch (e) {}
  }, []);

  // CLOSE SEARCH DROPDOWN ON OUTSIDE CLICK + SCROLL-TO-TOP VISIBILITY
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 520);
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // FORCE MOBILE VIDEO AUTOPLAY ON MOUNT & TOUCH
  useEffect(() => {
    const videoEl = heroVideoRef.current;
    if (!videoEl) return;

    const forcePlay = () => {
      videoEl.defaultMuted = true;
      videoEl.muted = true;
      videoEl.playsInline = true;
      const playPromise = videoEl.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Fallback: if mobile browser waits for first touch
        });
      }
    };

    forcePlay();
    window.addEventListener("touchstart", forcePlay, { once: true, passive: true });
    return () => window.removeEventListener("touchstart", forcePlay);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("vedoxa_theme", newTheme);
  };

  const isDark = theme === "dark";

  // NEW ADDITION: shared style helpers for the Dashboard panel
  const sideCard = isDark
    ? 'bg-white/[0.035] border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.28)]'
    : 'bg-slate-50/90 border-slate-200/80 shadow-[0_8px_24px_rgba(15,23,42,0.04)]';
  const segBtn = (on) => `px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all duration-200 ${on ? 'bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] shadow-md scale-[1.02]' : (isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')}`;

  // FIX: this effect used to depend on [showBookDetails, lang], so it re-fetched books, re-subscribed auth
  // and showed the loading skeleton every time a modal opened or the language changed. Now split into 3 effects, all logic kept.
  useEffect(() => {
    const preventZoom = (e) => { e.preventDefault(); };
    document.addEventListener('gesturestart', preventZoom);
    document.addEventListener('gesturechange', preventZoom);
    
    fetchBooks();
    initPartnerSystem(); 

    supabase.auth.getSession().then(({ data: { session } }) => { if (session?.user) handleUserLogin(session.user); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) handleUserLogin(session.user);
      else { setUser(null); setProfile(null); setPurchasedBookIds([]); setFavorites([]); setIsSidebarOpen(false); }
    });

    return () => {
      document.removeEventListener('gesturestart', preventZoom);
      document.removeEventListener('gesturechange', preventZoom);
      subscription.unsubscribe();
    };
  }, []);

  // FIX FOR DEEP-LINKED BOOK URLs (e.g. /?book=a89... seen in mobile browser URL bar)
  useEffect(() => {
    if (!deepLinkHandledRef.current && books.length > 0 && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const bookParam = params.get("book");
      if (bookParam) {
        const matched = books.find((b) => String(b.id) === String(bookParam) || String(b.id).startsWith(String(bookParam)));
        if (matched) {
          deepLinkHandledRef.current = true;
          openBookDetails(matched);
        }
      }
    }
  }, [books]);

  useEffect(() => {
    // SET LIVE DATE
    const updateDate = () => {
      const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
      setLiveDate(new Date().toLocaleDateString(lang === "EN" ? "en-US" : "hi-IN", options));
    };
    updateDate();
  }, [lang]);

  useEffect(() => {
    const handlePopState = (e) => {
      if (showBookDetails) {
        setShowBookDetails(false);
        window.history.pushState(null, "", window.location.pathname + window.location.search);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [showBookDetails]);

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
    // NEW ADDITION: remember this email so the login box can suggest it next time
    try { if (loggedUser.email) { localStorage.setItem("vedoxa_last_email", loggedUser.email); setSavedEmail(loggedUser.email); } } catch (e) {}
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

    // Fetch user favorites from database on login (Using user_interactions exactly like BookDetailsModal)
    const { data: favs } = await supabase.from('user_interactions').select('book_id').eq('user_id', loggedUser.id).eq('interaction_type', 'like');
    if (favs) setFavorites(favs.map(f => f.book_id));
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
      const { data, error } = await supabase.from("reviews").select("id, review_text, rating, created_at, user_id, profiles(name), fake_author_name").eq("book_id", bookId).order("created_at", { ascending: false });
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

  const handleSubmitReview = async (ratingValue) => {
    if (!newReviewText.trim()) return;
    if (!user) {
      addToast("Please login to submit a review", "error");
      setShowAuthModal(true);
      return;
    }
    if (!selectedBook) return;
    
    try {
      if (userExistingReview) {
        const { error } = await supabase.from("reviews").update({ 
          review_text: newReviewText, 
          rating: ratingValue 
        }).eq("id", userExistingReview.id); 
        
        if (error) throw error;
        addToast("Review updated successfully!", "success");
      } else {
        const { error } = await supabase.from("reviews").insert([{ 
          book_id: selectedBook.id, 
          user_id: user.id, 
          review_text: newReviewText, 
          rating: ratingValue 
        }]); 
        
        if (error) throw error;
        addToast("Review submitted successfully!", "success");
      }
      
      fetchReviews(selectedBook.id); 
    } catch (err) { 
      addToast("Review Error: " + (err.message || "Failed to save review."), "error"); 
    }
  };

  const openBookDetails = async (book) => {
    setSelectedBook(book); fetchReviews(book.id); setShowBookDetails(true);
    if (typeof window !== "undefined") window.history.pushState({ modal: "book-details" }, "", window.location.pathname + window.location.search);

    // Increment Real Views in Database checking sessionStorage logic (Same as BookDetailsModal)
    const viewKey = `viewed_book_${book.id}`;
    if (!sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, 'true');
      try {
        const newViews = (book.views || 0) + 1;
        await supabase.from("books").update({ views: newViews }).eq("id", book.id);
        setBooks((prev) => prev.map((b) => (b.id === book.id ? { ...b, views: newViews } : b)));
      } catch (err) {
        console.error("View update error", err);
      }
    }
  };

  const handleSuggestedBookChange = async (book) => {
    setSelectedBook(book);
    fetchReviews(book.id);

    // Increment Real Views in Database checking sessionStorage logic
    const viewKey = `viewed_book_${book.id}`;
    if (!sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, 'true');
      try {
        const newViews = (book.views || 0) + 1;
        await supabase.from("books").update({ views: newViews }).eq("id", book.id);
        setBooks((prev) => prev.map((b) => (b.id === book.id ? { ...b, views: newViews } : b)));
      } catch (err) {
        console.error("View update error", err);
      }
    }
  };

  const closeBookDetails = () => {
    setShowBookDetails(false);
    if (typeof window !== "undefined" && window.history.state?.modal === "book-details") window.history.back();
  };

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  // NEW ADDITION: Google One Tap. When the Login/Sign Up box opens, Google shows the account(s) already signed in on
  // this browser; one tap logs in (or creates the account automatically). Needs NEXT_PUBLIC_GOOGLE_CLIENT_ID, silently skipped if missing.
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!showAuthModal || user || !clientId) return;
    let cancelled = false;

    const startOneTap = async () => {
      try {
        const rawNonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
        const hashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(rawNonce));
        const hashedNonce = Array.from(new Uint8Array(hashBuf)).map((b) => b.toString(16).padStart(2, "0")).join("");

        const ok = await loadGoogleScript();
        if (!ok || cancelled || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          nonce: hashedNonce,
          use_fedcm_for_prompt: true,
          callback: async (resp) => {
            NProgress.start();
            const { error } = await supabase.auth.signInWithIdToken({ provider: "google", token: resp.credential, nonce: rawNonce });
            if (error) addToast(error.message, "error");
            else { addToast("Successfully logged in with Google!", "success"); setShowAuthModal(false); }
            NProgress.done();
          }
        });
        window.google.accounts.id.prompt();
      } catch (err) { console.error("One Tap error:", err); }
    };

    startOneTap();
    return () => { cancelled = true; try { window.google?.accounts?.id?.cancel(); } catch (e) {} };
  }, [showAuthModal, user]);

  const handleAuth = async (e) => {
    e.preventDefault(); NProgress.start();
    let res = authForm.mode === "signup" 
      ? await supabase.auth.signUp({ email: authForm.email, password: authForm.password })
      : await supabase.auth.signInWithPassword({ email: authForm.email, password: authForm.password });
    
    if (!res.error) { addToast(`Successfully ${authForm.mode === "signup" ? "signed up" : "logged in"}!`, "success"); setShowAuthModal(false); }
    else addToast(res.error.message, "error");
    NProgress.done();
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    NProgress.start();
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    } catch (err) {
      addToast("Google login error. Please try again.", "error");
      setIsGoogleLoading(false);
      NProgress.done();
    }
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

  // Connected toggleFavorite to Realtime Database using user_interactions like BookDetailsModal
  const toggleFavorite = async (e, bookId) => {
    e.stopPropagation();
    if (!user) {
      addToast("Please login to save favorites", "error");
      setShowAuthModal(true);
      return;
    }

    const isFav = favorites.includes(bookId);
    const bookToUpdate = books.find((b) => b.id === bookId);
    const currentLikes = bookToUpdate?.likes || 0;

    if (!isFav) {
      setLikedBurstId(bookId);
      setTimeout(() => setLikedBurstId(null), 700);
    }

    // Optimistic UI update for instant feedback
    setFavorites((prev) => isFav ? prev.filter((id) => id !== bookId) : [...prev, bookId]);
    setBooks((prev) => prev.map((b) => b.id === bookId ? { ...b, likes: isFav ? Math.max(0, currentLikes - 1) : currentLikes + 1 } : b));

    try {
      if (isFav) {
        await supabase.from("user_interactions").delete().match({ user_id: user.id, book_id: bookId, interaction_type: 'like' });
        await supabase.from("books").update({ likes: Math.max(0, currentLikes - 1) }).eq("id", bookId);
      } else {
        await supabase.from("user_interactions").upsert({
          user_id: user.id,
          book_id: bookId,
          interaction_type: 'like'
        }, { onConflict: 'user_id, book_id' });
        await supabase.from("books").update({ likes: currentLikes + 1 }).eq("id", bookId);
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
      // Revert UI if database update fails
      setFavorites((prev) => isFav ? [...prev, bookId] : prev.filter((id) => id !== bookId));
      setBooks((prev) => prev.map((b) => b.id === bookId ? { ...b, likes: currentLikes } : b));
      addToast("Failed to update like status", "error");
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

  if (useRewards && profile?.reward_points > 0) clientFinalPrice = Math.max(0, clientFinalPrice - profile.reward_points);
  const earnedPoints = selectedBook ? Math.floor(baseForClient * 0.019) : 0;
  // NEW ADDITION: total saving shown in the checkout box (display only)
  const totalSaved = selectedBook ? Math.max(0, (selectedBook.final_price || 0) - clientFinalPrice) : 0;

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
          customer_id: user.id, customer_name: checkoutData.name, customer_email: user.email, book_id: selectedBook.id, book_title: selectedBook.title, base_price: selectedBook.base_price, final_price: 0, amount: 0, coupon_used: appliedCoupon?.code || null, payment_method: 'free_coupon', points_used: useRewards ? (profile?.reward_points || 0) : 0
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
                orderData: { customer_id: user.id, customer_name: checkoutData.name, customer_email: user.email, book_id: selectedBook.id, book_title: selectedBook.title, base_price: selectedBook.base_price, final_price: orderData.amount, coupon_used: appliedCoupon?.code || null, points_used: useRewards ? (profile?.reward_points || 0) : 0, payment_method: 'razorpay' }
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

  // DICTIONARY STYLE SEARCH & SORTING LOGIC (with null-safe guards)
  const filteredBooks = books.filter(b => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const titleStr = (b.title || "").toLowerCase();
    const authorStr = (b.author || "").toLowerCase();
    return ( titleStr.includes(query) || authorStr.includes(query) || (b.tags && b.tags.some(tag => (tag || "").toLowerCase().includes(query))) );
  });

  if (searchQuery) {
    filteredBooks.sort((a, b) => {
      const query = searchQuery.toLowerCase();
      const aTitle = (a.title || "").toLowerCase();
      const bTitle = (b.title || "").toLowerCase();
      
      const aStarts = aTitle.startsWith(query);
      const bStarts = bTitle.startsWith(query);

      // 1. Prioritize books that START with the search query
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;

      // 2. Dictionary style sequence (Alphabetical Order)
      return aTitle.localeCompare(bTitle);
    });
  }

  // DISPLAY BOOKS WITH INTERACTIVE CATEGORY PILLS & SORTING (preserves filteredBooks intact for search dropdown)
  const displayedBooks = [...filteredBooks].filter((b) => {
    if (activeBookFilter === "favorites") return favorites.includes(b.id);
    if (activeBookFilter === "owned") return purchasedBookIds.includes(b.id);
    if (activeBookFilter === "trending") return (b.views || 0) >= 0;
    return true;
  });

  if (activeBookFilter === "trending" || sortBy === "popular") {
    displayedBooks.sort((a, b) => ((b.views || 0) + (b.likes || 0) * 3) - ((a.views || 0) + (a.likes || 0) * 3));
  } else if (sortBy === "price_low") {
    displayedBooks.sort((a, b) => (a.final_price || 0) - (b.final_price || 0));
  } else if (sortBy === "price_high") {
    displayedBooks.sort((a, b) => (b.final_price || 0) - (a.final_price || 0));
  }

  // READER CONSCIOUSNESS LEVEL FOR DASHBOARD
  const readerScore = purchasedBookIds.length * 35 + favorites.length * 10 + Math.min(55, profile?.reward_points || 0);
  const readerProgress = Math.min(100, Math.max(14, readerScore));
  const readerTier = purchasedBookIds.length >= 5 ? "Enlightened Sage" : purchasedBookIds.length >= 2 ? "Awakened Luminary" : purchasedBookIds.length >= 1 ? "Conscious Reader" : "Spiritual Seeker";

  // OWNED & FAVORITE BOOKS FOR DASHBOARD QUICK SHELF
  const ownedBooksList = books.filter((b) => purchasedBookIds.includes(b.id));
  const favoriteBooksList = books.filter((b) => favorites.includes(b.id));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap');

        /* APPLE SCROLL FEEL AND UI SOFTNESS UPDATE */
        html, body {
          touch-action: pan-y;
          -webkit-text-size-adjust: 100%;
          overscroll-behavior-y: auto;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          text-rendering: optimizeLegibility;
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
          background: linear-gradient(145deg, #f3ca63 0%, #c48112 52%, #df9b22 100%);
          color: #150800;
          font-weight: 800;
          letter-spacing: 0.025em;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
          box-shadow: 0 1px 0 rgba(255,235,160,0.65) inset, 0 -1px 0 rgba(0,0,0,0.35) inset, 0 6px 24px rgba(180,100,10,0.28), 0 1px 4px rgba(0,0,0,0.35);
          will-change: transform;
        }
        .btn-gold:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.025);
          box-shadow: 0 1px 0 rgba(255,235,160,0.7) inset, 0 -1px 0 rgba(0,0,0,0.35) inset, 0 12px 40px rgba(212,146,26,0.55), 0 2px 8px rgba(0,0,0,0.4);
        }
        .btn-gold:active:not(:disabled) {
          transform: translateY(0px) scale(0.975);
          box-shadow: 0 1px 0 rgba(255,220,120,0.3) inset, 0 2px 10px rgba(212,146,26,0.3);
        }

        #nprogress .bar { background: #d4921a !important; height: 2px !important; }
        #nprogress .peg { box-shadow: 0 0 14px #d4921a, 0 0 6px #d4921a !important; }

        @keyframes scrollLeft { 0% { transform: translate3d(0, 0, 0); } 100% { transform: translate3d(-50%, 0, 0); } }
        .animate-scroll { animation: scrollLeft 28s linear infinite; display: inline-block; white-space: nowrap; will-change: transform; }

        .discount-badge {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%) !important;
          color: #92400e !important;
          box-shadow: 0 6px 20px rgba(0,0,0,0.45), 0 0 0 1px rgba(245,158,11,0.35);
          font-weight: 900; letter-spacing: 0.03em;
        }

        /* GPU ACCELERATED CARD TRANSITIONS FOR STABLE 60FPS UI */
        .fast-anim { 
          transition: transform 0.48s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.48s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.35s ease, background-color 0.35s ease;
          will-change: transform;
          backface-visibility: hidden;
          transform: translateZ(0);
        }

        .luminary-card { position: relative; isolation: isolate; }
        .luminary-card::before {
          content: ''; position: absolute; inset: 0; border-radius: 1.75rem;
          background: radial-gradient(ellipse at 25% 0%, rgba(245,158,11,0.14) 0%, rgba(255,255,255,0.04) 38%, transparent 70%);
          pointer-events: none; z-index: 0; opacity: 0; transition: opacity 0.45s ease;
        }
        .luminary-card:hover::before { opacity: 1; }
        .luminary-card:hover {
          box-shadow: 0 0 0 1px rgba(212,146,26,0.32), 0 24px 60px rgba(0,0,0,0.48), 0 0 42px rgba(212,146,26,0.12);
        }
        .luminary-card > * { position: relative; z-index: 1; }

        /* CINEMATIC BACKGROUND MOTION + FLOATING GOLDEN SPIRITUAL PARTICLES */
        @keyframes cinemaPanZoom {
          0% { transform: scale(1.02) translate3d(0%, 0%, 0); }
          50% { transform: scale(1.14) translate3d(-1.5%, -1%, 0); }
          100% { transform: scale(1.02) translate3d(0%, 0%, 0); }
        }
        .cinema-bg {
          animation: cinemaPanZoom 18s ease-in-out infinite;
          will-change: transform;
        }

        @keyframes floatUpParticle {
          0% { transform: translate3d(0, 40px, 0) scale(0.6); opacity: 0; }
          30% { opacity: 0.85; }
          70% { opacity: 0.75; }
          100% { transform: translate3d(-15px, -220px, 0) scale(1.25); opacity: 0; }
        }
        .golden-particle {
          position: absolute;
          bottom: 0;
          border-radius: 9999px;
          background: radial-gradient(circle, #fde68a 0%, #f59e0b 60%, transparent 100%);
          box-shadow: 0 0 12px 2px rgba(245, 158, 11, 0.65);
          pointer-events: none;
          animation-name: floatUpParticle;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          will-change: transform, opacity;
        }

        @keyframes breathe { 0%, 100% { opacity: 0.65; transform: translate3d(-50%, 0, 0) scale(1); } 50% { opacity: 0.95; transform: translate3d(-50%, 0, 0) scale(1.06); } }
        .hero-glow { animation: breathe 7s ease-in-out infinite; will-change: transform, opacity; }

        @keyframes breathe2 { 0%, 100% { opacity: 0.3; transform: translate3d(0, 0, 0) scale(1); } 50% { opacity: 0.55; transform: translate3d(0, 0, 0) scale(1.08); } }
        .hero-glow-2 { animation: breathe2 9s ease-in-out infinite; will-change: transform, opacity; }
        .hero-glow-3 { animation: breathe2 11s ease-in-out 2s infinite; will-change: transform, opacity; }

        .page-root::after {
          content: ''; position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
          opacity: 0.022; pointer-events: none; z-index: 9999; mix-blend-mode: overlay;
        }

        ::-webkit-scrollbar { width: 3px; height: 3px; background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,146,26,0.22); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(212,146,26,0.42); }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212,146,26,0.25); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        input:focus, select:focus { outline: none; box-shadow: 0 0 0 2px rgba(212,146,26,0.22), 0 0 18px rgba(212,146,26,0.08); }

        /* NEW ADDITION: profile avatar rings + checkout button shine + google hero spotlight */
        @keyframes spinSlow { to { transform: rotate(360deg); } }
        .avatar-ring { background: conic-gradient(from 0deg, #fde68a, #b8720e, #fff3c4, #d4921a, #f59e0b, #fde68a); animation: spinSlow 7s linear infinite; will-change: transform; }
        .avatar-ring-static { background: conic-gradient(from 200deg, #fde68a, #b8720e, #fff3c4, #d4921a, #fde68a); }
        @keyframes shineSweep { 0% { transform: translateX(-120%) skewX(-20deg); } 60%, 100% { transform: translateX(260%) skewX(-20deg); } }
        .btn-shine { position: relative; overflow: hidden; }
        .btn-shine::after { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent); animation: shineSweep 3.2s ease-in-out infinite; pointer-events: none; }

        /* GOOGLE HERO BUTTON PULSE GLOW */
        @keyframes googlePulse {
          0%, 100% { box-shadow: 0 10px 30px -5px rgba(245, 158, 11, 0.28), 0 0 0 1px rgba(251, 191, 36, 0.45); }
          50% { box-shadow: 0 14px 38px -4px rgba(245, 158, 11, 0.48), 0 0 0 2px rgba(251, 191, 36, 0.75); }
        }
        .google-hero-btn {
          animation: googlePulse 3s ease-in-out infinite;
        }

        /* FOOTER NEO-CAPSULE BUTTONS */
        .footer-action-pill {
          position: relative;
          overflow: hidden;
          transition: all 0.35s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .footer-action-pill::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 20%, rgba(245, 158, 11, 0.14) 50%, transparent 80%);
          transform: translateX(-100%);
          transition: transform 0.65s ease;
          pointer-events: none;
        }
        .footer-action-pill:hover::before, .footer-action-pill:active::before {
          transform: translateX(100%);
        }

        @media (prefers-reduced-motion: reduce) { .avatar-ring, .btn-shine::after, .google-hero-btn { animation: none; } }
      `}</style>

      {/* Floating Toasts */}
      <div className="fixed bottom-6 right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-[90vw]">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.88, y: 10 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
              className={`pointer-events-auto px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold backdrop-blur-2xl border shadow-[0_14px_40px_rgba(0,0,0,0.45)] flex items-center gap-2.5 ${
                toast.type === "success" ? "bg-emerald-950/90 border-emerald-400/35 text-emerald-300"
                  : toast.type === "error" ? "bg-red-950/90 border-red-400/35 text-red-300"
                  : "bg-amber-950/90 border-amber-400/35 text-amber-300"
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 animate-pulse ${toast.type === "success" ? "bg-emerald-400" : toast.type === "error" ? "bg-red-400" : "bg-amber-400"}`} />
              <span>{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Floating Scroll-To-Top Mobile-Friendly Button */}
      <AnimatePresence>
        {showScrollTop && !isSidebarOpen && !showBookDetails && !showCheckout && !showReader && (
          <motion.button
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 20 }}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className={`fixed bottom-5 left-4 sm:left-6 z-[490] w-11 h-11 rounded-2xl border backdrop-blur-xl flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.45)] transition-colors ${
              isDark
                ? "bg-[#111122]/85 border-amber-500/35 text-amber-400 hover:bg-amber-500/15"
                : "bg-white/90 border-amber-500/40 text-amber-600 hover:bg-amber-50"
            }`}
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar Dashboard (Super-Upgraded Soft Glassmorphic Experience) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-md z-[5000]"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 340, damping: 34 }}
              className={`fixed top-0 right-0 w-[23.5rem] max-w-[92vw] h-full border-l z-[5001] shadow-[-24px_0_80px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden rounded-l-[2rem] ${isDark ? 'bg-[#090915]/95 border-white/[0.09] text-white' : 'bg-white/95 border-slate-200 text-slate-900'} backdrop-blur-2xl`}
            >
              {/* Soft Multi-Layered Aurora Glow Behind Profile */}
              <div
                className="absolute inset-x-0 top-0 h-80 pointer-events-none"
                style={{ background: isDark
                  ? 'radial-gradient(125% 95% at 50% 0%, rgba(212,146,26,0.28) 0%, rgba(139,92,246,0.12) 48%, transparent 78%)'
                  : 'radial-gradient(125% 95% at 50% 0%, rgba(245,184,75,0.42) 0%, rgba(167,139,250,0.16) 48%, transparent 78%)' }}
              />

              {/* Header (No scroll) */}
              <div className="relative shrink-0 px-5 pt-5 pb-3 flex justify-between items-center border-b border-transparent">
                <span className="flex items-center gap-2.5 text-sm font-extrabold tracking-wide">
                  <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 border border-amber-500/35 text-amber-400 flex items-center justify-center shadow-[0_0_20px_rgba(212,146,26,0.25)]">
                    <LayoutDashboard size={16}/>
                  </span>
                  <span>Reader Hub</span>
                </span>

                {/* Mini Tab Switcher inside Dashboard Header */}
                <div className={`flex p-1 rounded-full border text-[11px] font-bold ${isDark ? 'bg-black/40 border-white/[0.08]' : 'bg-slate-100 border-slate-200/80'}`}>
                  <button
                    onClick={() => setSidebarTab("overview")}
                    className={`px-2.5 py-1 rounded-full transition-all ${sidebarTab === "overview" ? "bg-amber-500 text-[#150800] font-extrabold shadow-sm" : (isDark ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-900")}`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setSidebarTab("shelf")}
                    className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${sidebarTab === "shelf" ? "bg-amber-500 text-[#150800] font-extrabold shadow-sm" : (isDark ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-900")}`}
                  >
                    Shelf
                    {(purchasedBookIds.length + favorites.length) > 0 && (
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${sidebarTab === "shelf" ? "bg-black/20 text-[#150800]" : "bg-amber-500/20 text-amber-400"}`}>
                        {purchasedBookIds.length + favorites.length}
                      </span>
                    )}
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.06, rotate: 90 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`p-2 rounded-2xl border transition ${isDark ? 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.1]' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'}`}
                >
                  <X size={17}/>
                </motion.button>
              </div>

              {/* Scrollable Content Area */}
              <div className="relative flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar px-5 pb-6">

                {/* Profile Section: spinning gold ring + crown + camera chip */}
                <div className="flex flex-col items-center text-center pt-5">
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="relative w-28 h-28 group cursor-pointer"
                    onClick={() => setShowAvatarPicker(true)}
                  >
                    <div className="avatar-ring absolute -inset-1.5 rounded-full opacity-95 shadow-[0_0_35px_rgba(212,146,26,0.4)]" />
                    <div className={`absolute inset-0 rounded-full ${isDark ? 'bg-[#090915]' : 'bg-white'}`} />
                    <div className="absolute inset-[4px] rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(212,146,26,0.35)]">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="avatar" loading="lazy" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <UserCircle size={52} className="text-amber-500/50" />
                      )}
                    </div>
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 -rotate-6 w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-[#150800] flex items-center justify-center shadow-[0_4px_14px_rgba(212,146,26,0.65)] ring-2 ring-white/30">
                      <Crown size={15} />
                    </span>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center border-[3px] shadow-lg transition-transform duration-200 group-hover:scale-110 ${isDark ? 'border-[#090915]' : 'border-white'}`}>
                      <Camera size={14} />
                    </span>
                  </motion.div>

                  <h3 className="font-cinzel gold-text font-black text-xl sm:text-2xl mt-4 leading-tight max-w-full truncate px-2">
                    {profile?.name || "Vedoxa Reader"}
                  </h3>
                  <p className={`text-xs mt-0.5 font-medium max-w-full truncate px-3 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    {user?.email}
                  </p>

                  <div className="flex items-center gap-2 mt-2.5 flex-wrap justify-center">
                    <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/[0.14] border border-amber-500/35 text-amber-400 shadow-[0_0_18px_rgba(212,146,26,0.18)]">
                      <Sparkles size={12} className="text-amber-400 animate-pulse" />
                      <span className="text-[11px] font-extrabold tracking-wide">{readerTier}</span>
                    </div>
                    <button
                      onClick={() => setShowAvatarPicker(true)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 transition ${isDark ? 'bg-white/[0.04] border-white/[0.08] text-gray-300 hover:bg-white/[0.09]' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
                    >
                      <Edit3 size={10} /> Avatar
                    </button>
                  </div>

                  {/* Consciousness Progress Bar */}
                  <div className={`w-full mt-4 p-3 rounded-2xl border text-left ${sideCard}`}>
                    <div className="flex justify-between items-center text-[11px] font-bold mb-1.5">
                      <span className={isDark ? "text-gray-300" : "text-slate-700"}>Reading Aura</span>
                      <span className="text-amber-500">{readerProgress}% Awakened</span>
                    </div>
                    <div className={`w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-white/[0.07]" : "bg-slate-200"}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${readerProgress}%` }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                      />
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {sidebarTab === "overview" ? (
                    <motion.div
                      key="overview-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Live stats (from existing state) - interactive to switch to shelf */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <motion.div
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSidebarTab("shelf")}
                          className={`rounded-2xl border p-3.5 cursor-pointer transition-all hover:border-emerald-500/40 ${sideCard}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                              <BookMarked size={17}/>
                            </span>
                            <ChevronRight size={14} className={isDark ? "text-gray-600" : "text-slate-400"} />
                          </div>
                          <div className="text-2xl font-black leading-none">{purchasedBookIds.length}</div>
                          <div className={`text-[11px] font-semibold mt-1.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Books Owned</div>
                        </motion.div>

                        <motion.div
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSidebarTab("shelf")}
                          className={`rounded-2xl border p-3.5 cursor-pointer transition-all hover:border-rose-500/40 ${sideCard}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400/25 to-rose-600/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
                              <Heart size={17} className="fill-rose-500/30"/>
                            </span>
                            <ChevronRight size={14} className={isDark ? "text-gray-600" : "text-slate-400"} />
                          </div>
                          <div className="text-2xl font-black leading-none">{favorites.length}</div>
                          <div className={`text-[11px] font-semibold mt-1.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Favorites</div>
                        </motion.div>
                      </div>

                      {/* Reward points */}
                      <Link href="/reward-points" className="group relative mt-3 flex items-center gap-3.5 rounded-2xl p-4 overflow-hidden border border-amber-500/35 bg-gradient-to-br from-amber-500/[0.22] via-amber-500/[0.08] to-transparent hover:border-amber-500/60 transition-all shadow-[0_8px_28px_rgba(212,146,26,0.14)]">
                        <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center shrink-0 shadow-[0_6px_20px_rgba(212,146,26,0.45)] group-hover:scale-105 transition-transform">
                          <Coins size={22}/>
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-xs font-bold text-amber-500">Reward Points</span>
                          <span className="block text-3xl font-black leading-tight">{profile?.reward_points || 0}</span>
                        </span>
                        <span className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          <ArrowUpRight size={16} />
                        </span>
                      </Link>

                      {/* Preferences: segmented switches */}
                      <div className={`mt-3 rounded-2xl border p-3.5 flex flex-col gap-3.5 ${sideCard}`}>
                        <div className="flex justify-between items-center gap-2">
                          <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold"><Globe size={15} className="text-amber-500"/> Language / भाषा</span>
                          <div className={`flex p-0.5 rounded-full border ${isDark ? 'bg-black/30 border-white/[0.08]' : 'bg-white border-slate-200'}`}>
                            <button onClick={() => setLang("EN")} className={segBtn(lang === "EN")}>EN</button>
                            <button onClick={() => setLang("HI")} className={segBtn(lang === "HI")}>हिन्दी</button>
                          </div>
                        </div>
                        {/* THEME TOGGLE */}
                        <div className="flex justify-between items-center gap-2">
                          <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold">{isDark ? <Moon size={15} className="text-amber-500"/> : <Sun size={15} className="text-amber-500"/>} Theme / थीम</span>
                          <div className={`flex p-0.5 rounded-full border ${isDark ? 'bg-black/30 border-white/[0.08]' : 'bg-white border-slate-200'}`}>
                            <button onClick={() => { if (isDark) toggleTheme(); }} className={segBtn(!isDark)}><Sun size={13}/> Light</button>
                            <button onClick={() => { if (!isDark) toggleTheme(); }} className={segBtn(isDark)}><Moon size={13}/> Dark</button>
                          </div>
                        </div>
                      </div>

                      {/* Quick links */}
                      <div className="mt-3 flex flex-col gap-2.5">
                        <Link href="/explore" className={`group flex items-center gap-3 rounded-2xl border p-3 transition-all ${sideCard} hover:border-amber-500/40 hover:translate-x-0.5`}>
                          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400/25 to-indigo-500/10 text-sky-400 border border-sky-400/20 flex items-center justify-center shrink-0"><Compass size={19}/></span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-bold">Explore</span>
                            <span className={`block text-[11px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Discover more books</span>
                          </span>
                          <ChevronRight size={16} className={`transition-transform duration-200 group-hover:translate-x-0.5 ${isDark ? "text-gray-500" : "text-slate-400"}`} />
                        </Link>

                        <Link href="/quiz" className={`group flex items-center gap-3 rounded-2xl border p-3 transition-all ${sideCard} hover:border-amber-500/40 hover:translate-x-0.5`}>
                          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400/25 to-fuchsia-500/10 text-violet-400 border border-violet-400/20 flex items-center justify-center shrink-0"><Brain size={19}/></span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-bold">Quiz</span>
                            <span className={`block text-[11px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Play the quiz</span>
                          </span>
                          <ChevronRight size={16} className={`transition-transform duration-200 group-hover:translate-x-0.5 ${isDark ? "text-gray-500" : "text-slate-400"}`} />
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    /* INTERACTIVE QUICK SHELF TAB INSIDE DASHBOARD */
                    <motion.div
                      key="shelf-tab"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 flex flex-col gap-4"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <BookMarked size={13} /> Owned Books ({ownedBooksList.length})
                          </span>
                        </div>
                        {ownedBooksList.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {ownedBooksList.map((b) => (
                              <div
                                key={b.id}
                                onClick={() => { setIsSidebarOpen(false); openWebReader(b); }}
                                className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition hover:border-emerald-500/40 ${sideCard}`}
                              >
                                <div className="w-10 h-12 rounded-lg overflow-hidden bg-amber-500/10 border border-amber-500/20 shrink-0 flex items-center justify-center">
                                  {b.cover_path ? (
                                    <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${b.cover_path}`} alt={b.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <BookOpen size={16} className="text-amber-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold truncate">{b.title}</div>
                                  <div className={`text-[10px] truncate ${isDark ? "text-gray-400" : "text-slate-500"}`}>by {b.author}</div>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold shrink-0">
                                  Read
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={`rounded-2xl border p-4 text-center text-xs ${sideCard} ${isDark ? "text-gray-500" : "text-slate-500"}`}>
                            No purchased books yet. Unlock any book to read it instantly!
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                            <Heart size={13} /> Saved Favorites ({favoriteBooksList.length})
                          </span>
                        </div>
                        {favoriteBooksList.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {favoriteBooksList.map((b) => (
                              <div
                                key={b.id}
                                onClick={() => { setIsSidebarOpen(false); openBookDetails(b); }}
                                className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition hover:border-amber-500/40 ${sideCard}`}
                              >
                                <div className="w-10 h-12 rounded-lg overflow-hidden bg-amber-500/10 border border-amber-500/20 shrink-0 flex items-center justify-center">
                                  {b.cover_path ? (
                                    <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${b.cover_path}`} alt={b.title} className="w-full h-full object-cover" />
                                  ) : (
                                    <BookOpen size={16} className="text-amber-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold truncate">{b.title}</div>
                                  <div className={`text-[10px] truncate ${isDark ? "text-gray-400" : "text-slate-500"}`}>₹{b.final_price}</div>
                                </div>
                                <ChevronRight size={15} className="text-amber-500 shrink-0" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={`rounded-2xl border p-4 text-center text-xs ${sideCard} ${isDark ? "text-gray-500" : "text-slate-500"}`}>
                            Tap the heart icon on any book to save it here.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer / Logout (No scroll) */}
              <div className={`relative shrink-0 p-4 border-t ${isDark ? 'border-white/[0.06] bg-black/30' : 'border-slate-200 bg-slate-50/90'}`}>
                {showLogoutConfirm ? (
                  <div className="bg-red-500/[0.08] border border-red-500/[0.22] p-3.5 rounded-2xl text-center">
                    <p className={`text-xs font-bold mb-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Are you sure you want to log out?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setShowLogoutConfirm(false)} className={`flex-1 text-xs font-bold py-2 rounded-xl transition ${isDark ? 'bg-white/[0.07] text-white hover:bg-white/[0.12]' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}>Cancel</button>
                      <button onClick={confirmLogout} className="flex-1 bg-red-500/85 text-white text-xs font-bold py-2 rounded-xl hover:bg-red-500 transition">Yes, Logout</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowLogoutConfirm(true)} className={`w-full font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition text-xs sm:text-sm border ${isDark ? 'bg-white/[0.03] border-white/[0.07] text-red-400/85 hover:bg-red-500/10 hover:text-red-400' : 'bg-white border-slate-200 text-red-500 hover:bg-red-50'}`}>
                    <LogOut size={15}/> Logout securely
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
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent rounded-full" />
              <button onClick={() => setShowAvatarPicker(false)} className={`absolute top-4 right-4 transition p-1.5 rounded-xl ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/[0.08]' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}>
                <X size={18}/>
              </button>
              <h3 className={`text-lg font-bold text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>Choose your Avatar</h3>
              <p className={`text-xs text-center mt-1 mb-6 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Pick the one that feels like you</p>
              <div className="grid grid-cols-3 gap-4">
                {AVATARS.map((url, idx) => {
                  const isCurrent = profile?.avatar_url === url;
                  return (
                    <button key={idx} onClick={() => handleSaveAvatar(url)} className={`relative aspect-square rounded-full border-2 hover:border-amber-500/70 hover:scale-110 hover:shadow-[0_0_22px_rgba(212,146,26,0.35)] transition-all duration-200 ${isCurrent ? 'border-amber-500 shadow-[0_0_22px_rgba(212,146,26,0.4)]' : (isDark ? 'border-white/[0.1]' : 'border-slate-200')}`}>
                      <img src={url} alt={`avatar-${idx}`} loading="lazy" decoding="async" className="w-full h-full object-cover rounded-full" />
                      {isCurrent && (
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center border-2 border-[#0c0c1a]"><Check size={13} strokeWidth={3} /></span>
                      )}
                    </button>
                  );
                })}
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

      {/* Auth Modal - HIGH-CONVERSION GOOGLE / GMAIL HERO DESIGN */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowAuthModal(false)}
            className={`fixed inset-0 z-[2000] backdrop-blur-xl flex items-end sm:items-center justify-center p-0 sm:p-4 ${isDark ? 'bg-black/85' : 'bg-slate-900/60'}`}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.94, y: 40, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.94, y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 28 }}
              className={`border rounded-t-[2rem] sm:rounded-[2rem] p-6 sm:p-8 w-full max-w-md relative shadow-[0_25px_90px_rgba(0,0,0,0.75)] overflow-hidden ${isDark ? 'bg-[#0b0b18] border-amber-500/20' : 'bg-white border-slate-200'}`}
            >
              {/* Soft Top Aura */}
              <div
                className="absolute inset-x-0 top-0 h-44 pointer-events-none"
                style={{
                  background: isDark
                    ? "radial-gradient(110% 90% at 50% 0%, rgba(245,158,11,0.20) 0%, rgba(59,130,246,0.08) 55%, transparent 80%)"
                    : "radial-gradient(110% 90% at 50% 0%, rgba(251,191,36,0.28) 0%, rgba(59,130,246,0.08) 55%, transparent 80%)"
                }}
              />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-[2px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent rounded-full" />

              {/* Mobile Drag Handle Pill */}
              <div className="w-10 h-1 rounded-full bg-gray-500/30 mx-auto mb-3 sm:hidden" />

              <button onClick={() => setShowAuthModal(false)} className={`absolute top-4 right-4 p-2 rounded-2xl transition z-10 ${isDark ? 'bg-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.12]' : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}>
                <X size={17} />
              </button>

              <div className="relative text-center mb-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[11px] font-extrabold mb-2">
                  <Sparkles size={12} /> VEDOXA SECURE ACCESS
                </div>
                <h2 className={`text-2xl sm:text-[1.65rem] font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {authForm.mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
                </h2>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  Unlock your digital library & reward points instantly
                </p>
              </div>

              {/* #1 SPOTLIGHT CTA: CONTINUE WITH GOOGLE (GMAIL) */}
              <div className="relative mb-5">
                <div className="flex justify-center -mb-2.5 relative z-10">
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-500 text-[#150800] shadow-[0_4px_14px_rgba(245,158,11,0.45)]">
                    <Zap size={10} className="fill-current" /> Recommended • 1-Tap Gmail Login
                  </span>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className={`google-hero-btn btn-shine w-full py-3.5 px-4 rounded-2xl flex items-center justify-between gap-3 transition-all font-extrabold text-sm sm:text-base border-2 cursor-pointer ${
                    isDark
                      ? 'bg-gradient-to-r from-white via-[#fffdf7] to-[#fef3c7] text-slate-900 border-amber-400/80 hover:border-amber-300'
                      : 'bg-gradient-to-r from-slate-900 via-[#1e293b] to-slate-900 text-white border-amber-500/80 hover:border-amber-400'
                  }`}
                >
                  <span className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md border border-slate-200/80">
                    {isGoogleLoading ? (
                      <RefreshCw size={18} className="animate-spin text-amber-500" />
                    ) : (
                      <svg viewBox="0 0 48 48" className="w-5 h-5">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      </svg>
                    )}
                  </span>

                  <span className="flex-1 text-center">
                    {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
                  </span>

                  <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isDark ? "bg-amber-500/20 text-amber-700" : "bg-white/15 text-amber-300"}`}>
                    <ChevronRight size={16} />
                  </span>
                </motion.button>

                <div className="flex items-center justify-center gap-3 mt-2 text-[11px] font-semibold">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 size={12} /> No password needed
                  </span>
                  <span className={isDark ? "text-gray-600" : "text-slate-300"}>•</span>
                  <span className={isDark ? "text-gray-400" : "text-slate-500"}>
                    95% readers choose Gmail
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 my-4">
                <div className={`h-px flex-1 ${isDark ? 'bg-white/[0.08]' : 'bg-slate-200'}`} />
                <span className={`text-[10px] font-extrabold uppercase tracking-widest ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>
                  OR USE EMAIL
                </span>
                <div className={`h-px flex-1 ${isDark ? 'bg-white/[0.08]' : 'bg-slate-200'}`} />
              </div>

              {/* NEW ADDITION: last used email suggestion, one tap to fill */}
              {savedEmail && !authForm.email && (
                <button
                  type="button"
                  onClick={() => { setAuthForm({ ...authForm, email: savedEmail }); setTimeout(() => document.getElementById("vedoxa-auth-password")?.focus(), 60); }}
                  className={`mb-3 flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border text-left transition ${isDark ? 'bg-amber-500/[0.06] border-amber-500/25 hover:bg-amber-500/[0.12]' : 'bg-amber-50 border-amber-300/60 hover:bg-amber-100'}`}
                >
                  <span className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center text-xs font-black shrink-0">{savedEmail.charAt(0).toUpperCase()}</span>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-[10px] font-semibold ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Continue as</span>
                    <span className={`block text-xs sm:text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{savedEmail}</span>
                  </span>
                  <ChevronRight size={16} className="text-amber-500 shrink-0" />
                </button>
              )}

              <form onSubmit={handleAuth} className="flex flex-col gap-2.5">
                <input required type="email" name="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="Email address" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className={`w-full px-4 py-3 rounded-xl outline-none focus:border-amber-500/50 transition text-sm border ${isDark ? 'bg-white/[0.04] border-white/[0.09] text-white placeholder-gray-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`} />
                
                <div className="relative">
                  <input required id="vedoxa-auth-password" type={showPassword ? "text" : "password"} name="password" autoComplete={authForm.mode === 'login' ? 'current-password' : 'new-password'} placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} className={`w-full pl-4 pr-16 py-3 rounded-xl outline-none focus:border-amber-500/50 transition text-sm border ${isDark ? 'bg-white/[0.04] border-white/[0.09] text-white placeholder-gray-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold px-2 py-1 rounded-lg transition ${isDark ? "text-gray-400 hover:text-white bg-white/[0.05]" : "text-slate-500 hover:text-slate-800 bg-slate-200/70"}`}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <button type="submit" className="btn-gold py-3 rounded-xl font-bold text-sm mt-1">
                  {authForm.mode === 'login' ? 'Login with Email' : 'Sign Up with Email'}
                </button>
              </form>

              <p className={`text-center mt-5 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                {authForm.mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <span onClick={() => setAuthForm({...authForm, mode: authForm.mode === 'login' ? 'signup' : 'login'})} className="text-amber-500 font-extrabold cursor-pointer hover:text-amber-400 transition underline underline-offset-4">
                  {authForm.mode === 'login' ? 'Sign Up' : 'Login'}
                </span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal: book summary on top, sticky Pay button, coupon collapsed for a faster purchase */}
      <AnimatePresence>
        {showCheckout && selectedBook && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShowCheckout(false)}
            className={`fixed inset-0 z-[3000] backdrop-blur-lg flex items-end sm:items-center justify-center sm:p-4 ${isDark ? 'bg-black/88' : 'bg-slate-900/60'}`}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 360, damping: 32 }}
              className={`border w-full sm:max-w-md max-h-[94vh] flex flex-col relative shadow-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden ${isDark ? 'bg-[#0d0d1c] border-amber-500/[0.18] text-white' : 'bg-white border-amber-500/30 text-slate-900'}`}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent rounded-full" />

              {/* Header + book summary */}
              <div className={`shrink-0 px-5 pt-5 pb-4 border-b ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`}>
                <button onClick={() => setShowCheckout(false)} className={`absolute top-4 right-4 p-2 rounded-xl transition ${isDark ? 'bg-white/[0.05] text-gray-500 hover:text-white hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}>
                  <X size={17} />
                </button>
                <h2 className="text-lg md:text-xl font-extrabold tracking-tight mb-3.5">{t.checkout}</h2>
                <div className={`flex items-center gap-3.5 rounded-2xl p-3 border ${isDark ? 'bg-white/[0.035] border-white/[0.07]' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="w-14 h-[4.5rem] shrink-0 rounded-lg overflow-hidden flex items-center justify-center bg-amber-500/[0.08] border border-amber-500/20">
                    {selectedBook.cover_path ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${selectedBook.cover_path}`}
                        alt={selectedBook.title} decoding="async" className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen size={22} className="text-amber-500/70" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-cinzel text-sm md:text-base font-bold leading-snug line-clamp-2">{selectedBook.title}</h3>
                    <p className={`text-xs truncate mt-0.5 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>by {selectedBook.author}</p>
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500"><Zap size={12}/> Instant access after payment</div>
                  </div>
                </div>
              </div>

              <form onSubmit={handlePayment} className="flex flex-col min-h-0 flex-1">
                {/* Scrollable fields */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-4 flex flex-col gap-3">

                  {!user && (
                    <button type="button" onClick={() => { setShowCheckout(false); setShowAuthModal(true); }} className="flex items-center justify-between gap-2 w-full px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] text-amber-500 text-sm font-bold hover:bg-amber-500/[0.14] transition">
                      <span className="flex items-center gap-2"><UserCircle size={17}/> Login to continue your purchase</span>
                      <ChevronRight size={16} />
                    </button>
                  )}

                  <input name="name" autoComplete="name" placeholder="Full Name (Optional)" value={checkoutData.name} onChange={(e) => setCheckoutData({...checkoutData, name: e.target.value})} className={`w-full px-4 py-3 rounded-xl outline-none focus:border-amber-500/40 transition text-sm border ${isDark ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`} />

                  <div className="flex gap-2">
                    <select value={checkoutData.countryCode} onChange={(e) => setCheckoutData({...checkoutData, countryCode: e.target.value})} className={`w-24 px-2 py-3 rounded-xl outline-none focus:border-amber-500/40 transition cursor-pointer appearance-none text-sm border ${isDark ? 'bg-white/[0.04] border-white/[0.08] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
                      <option value="+91" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>🇮🇳 +91</option>
                      <option value="+1" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>🇺🇸 +1</option>
                      <option value="+44" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>🇬🇧 +44</option>
                      <option value="+61" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>🇦🇺 +61</option>
                      <option value="+971" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>🇦🇪 +971</option>
                    </select>
                    <input required autoFocus={!checkoutData.phone} type="tel" name="phone" autoComplete="tel-national" inputMode="numeric" placeholder="Phone Number" value={checkoutData.phone} onChange={(e) => setCheckoutData({...checkoutData, phone: e.target.value.replace(/\D/g, '')})} maxLength={checkoutData.countryCode === '+91' ? 10 : 15} className={`flex-1 px-4 py-3 rounded-xl outline-none focus:border-amber-500/40 transition text-sm border ${isDark ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`} />
                  </div>

                  {/* Coupon: collapsed by default, Enter applies the coupon (does not submit the payment) */}
                  {(showCoupon || appliedCoupon) ? (
                    <div className="flex gap-2">
                      <input placeholder={t.haveCoupon} value={checkoutData.coupon} onChange={(e) => setCheckoutData({...checkoutData, coupon: e.target.value})} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); verifyCoupon(); } }} className="flex-1 px-4 py-3 rounded-xl bg-amber-500/[0.04] border border-dashed border-amber-500/25 text-amber-500 placeholder-amber-900 outline-none focus:border-amber-500/50 text-sm" />
                      <button type="button" onClick={verifyCoupon} className="px-5 rounded-xl bg-amber-500/[0.1] text-amber-500 font-bold hover:bg-amber-500/[0.2] transition text-sm border border-amber-500/20">
                        {t.apply}
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setShowCoupon(true)} className="flex items-center gap-2 text-xs font-bold text-amber-500 hover:text-amber-400 transition w-max">
                      <Tag size={14}/> {t.haveCoupon} <ChevronDown size={14}/>
                    </button>
                  )}

                  {profile?.reward_points > 0 && (
                    <label className="flex items-center gap-3 bg-emerald-500/[0.05] p-3 rounded-xl border border-emerald-500/[0.18] cursor-pointer hover:bg-emerald-500/[0.08] transition">
                      <input type="checkbox" checked={useRewards} onChange={(e) => setUseRewards(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                      <span className="text-emerald-400 text-sm font-medium">{t.redeemPoints} ({profile.reward_points} pts)</span>
                    </label>
                  )}

                  <div className={`p-4 rounded-2xl border ${isDark ? 'bg-white/[0.035] border-white/[0.07]' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between text-gray-500 text-sm mb-2"><span>Price:</span> <span>₹{selectedBook.final_price}</span></div>
                    {partnerData && <div className="flex justify-between text-blue-400 font-bold text-sm mb-2"><span>Partner Discount ({partnerData.discount_pct}%):</span><span>- ₹{partnerDiscountAmount}</span></div>}
                    {appliedCoupon && <div className="flex justify-between text-emerald-400 text-sm mb-2"><span>Coupon Discount:</span> <span>- ₹{couponDiscountAmount}</span></div>}
                    {useRewards && profile?.reward_points > 0 && <div className="flex justify-between text-emerald-400 text-sm mb-2"><span>Points Applied:</span> <span>- ₹{profile.reward_points}</span></div>}
                    <div className={`flex justify-between text-lg font-extrabold border-t pt-2 mt-2 ${isDark ? 'text-white border-white/[0.08]' : 'text-slate-900 border-slate-200'}`}>
                      <span>Total to Pay:</span> <span>₹{clientFinalPrice}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1.5">
                      {totalSaved > 0 ? (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/[0.12] text-emerald-500 border border-emerald-500/25">You save ₹{totalSaved}</span>
                      ) : <span />}
                      <span className="text-xs text-amber-500 font-medium">{t.rewardEarn}: {earnedPoints} pts</span>
                    </div>
                  </div>
                </div>

                {/* Sticky footer: Pay button always visible */}
                <div className={`shrink-0 px-5 pt-3 pb-5 border-t ${isDark ? 'border-white/[0.07] bg-[#0d0d1c]' : 'border-slate-100 bg-white'}`}>
                  <button type="submit" disabled={isProcessing} className="btn-gold btn-shine w-full py-4 rounded-2xl flex justify-center items-center gap-2 text-base font-extrabold">
                    {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <Lock size={18} />}
                    {isProcessing ? "Processing..." : (clientFinalPrice === 0 ? "Unlock Book for Free" : `${t.pay} ₹${clientFinalPrice}`)}
                  </button>

                  <div className="flex justify-center items-center gap-3 mt-3 opacity-60">
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
      <div className={`min-h-screen flex flex-col overflow-x-hidden selection:bg-amber-500/20 page-root transition-colors duration-300 ${isDark ? 'bg-[#07070d] text-gray-200' : 'bg-[#f8fafc] text-slate-800'}`}>

        {partnerData && (
          <div className="w-full bg-blue-500/[0.12] border-b border-blue-500/25 py-2 px-4 text-center flex items-center justify-center gap-2">
            <Handshake size={15} className="text-blue-400"/>
            <span className="text-blue-300/90 text-xs md:text-sm font-bold tracking-wide uppercase">
              Partner Discount of {partnerData.discount_pct}% has been applied to all books!
            </span>
          </div>
        )}

        {/* Responsive Navbar with Soft Glass & Luxury Profile Capsule */}
        <nav className={`sticky top-0 z-[500] px-3.5 py-3 md:px-8 md:py-3.5 backdrop-blur-2xl border-b flex justify-between items-center transition-colors duration-300 ${isDark ? 'bg-[#07070d]/85 border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.4)]' : 'bg-white/88 border-slate-200/90 shadow-sm'}`}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />

          <Link href="/brand" className="flex items-center gap-2.5 md:gap-3 group shrink-0">
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full border border-amber-500/50 flex items-center justify-center shadow-[0_0_16px_rgba(212,146,26,0.45)] group-hover:shadow-[0_0_25px_rgba(212,146,26,0.8)] transition-all duration-300 ${isDark ? 'bg-[#0c0c1a]' : 'bg-white'}`}>
              <span className="font-cinzel text-lg md:text-xl font-black gold-text">V</span>
            </div>
            <span className={`font-cinzel text-base sm:text-lg md:text-2xl font-black tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {t.brand}
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search Box with Outside-Click Close & Clear Button */}
            <div
              ref={searchContainerRef}
              className={`relative flex items-center border rounded-full px-3 py-1.5 transition-all duration-300 ease-out ${isSearchOpen ? 'w-44 sm:w-56 md:w-64 ring-2 ring-amber-500/25 border-amber-500/40' : 'w-10 hover:border-amber-500/35'} ${isDark ? 'bg-white/[0.045] border-white/[0.09]' : 'bg-slate-100/90 border-slate-200'}`}
            >
              <Search size={16} className="text-amber-500/80 cursor-pointer shrink-0 hover:text-amber-400 transition" onClick={() => setIsSearchOpen(!isSearchOpen)} />
              {isSearchOpen && (
                <>
                  <input autoFocus type="text" placeholder="Search books..." className={`bg-transparent border-none outline-none text-xs ml-2 w-full ${isDark ? 'text-white placeholder-gray-500' : 'text-slate-900 placeholder-slate-400'}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-amber-500 p-0.5 shrink-0">
                      <X size={13} />
                    </button>
                  )}
                  {/* DROP DOWN SEARCH SUGGESTIONS */}
                  {searchQuery && (
                    <div className={`absolute top-full mt-3 right-0 w-64 sm:w-72 max-h-72 overflow-y-auto custom-scrollbar rounded-2xl border shadow-2xl z-[600] flex flex-col backdrop-blur-2xl ${isDark ? 'bg-[#0c0c1a]/95 border-white/[0.1]' : 'bg-white/95 border-slate-200'}`}>
                      {filteredBooks.length > 0 ? (
                        filteredBooks.slice(0, 5).map(book => (
                          <div key={book.id} onClick={() => { openBookDetails(book); setIsSearchOpen(false); setSearchQuery(""); }} className={`px-3.5 py-2.5 text-sm cursor-pointer border-b last:border-b-0 transition-colors flex items-center gap-3 ${isDark ? 'border-white/[0.05] text-white hover:bg-white/[0.06]' : 'border-slate-100 text-slate-800 hover:bg-slate-50'}`}>
                            <div className="w-8 h-10 rounded-md overflow-hidden bg-amber-500/10 border border-amber-500/20 shrink-0 flex items-center justify-center">
                              {book.cover_path ? (
                                <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${book.cover_path}`} alt={book.title} className="w-full h-full object-cover" />
                              ) : (
                                <Search size={13} className="text-amber-500/70" />
                              )}
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <div className="font-bold text-xs truncate">{book.title}</div>
                              <div className="text-[10px] opacity-70 truncate">by {book.author}</div>
                            </div>
                            <span className="text-xs font-extrabold text-amber-500 shrink-0">₹{book.final_price}</span>
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

            {/* Quick Theme Pill on Mobile/Desktop Navbar */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition shrink-0 ${
                isDark
                  ? "bg-white/[0.04] border-white/[0.09] text-amber-400 hover:bg-white/[0.09]"
                  : "bg-slate-100 border-slate-200 text-amber-600 hover:bg-slate-200"
              }`}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </motion.button>

            {/* Upgraded Luxury Profile Capsule / Login CTA */}
            {user ? (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsSidebarOpen(true)}
                className={`group relative flex items-center gap-2 border pl-1 pr-2.5 sm:pr-3 py-1 rounded-full transition-all shrink-0 shadow-[0_4px_20px_rgba(212,146,26,0.16)] ${
                  isDark
                    ? 'bg-gradient-to-r from-amber-500/[0.12] via-white/[0.05] to-white/[0.03] border-amber-500/35 hover:border-amber-400/60'
                    : 'bg-gradient-to-r from-amber-50 via-white to-slate-50 border-amber-400/50 hover:border-amber-500'
                }`}
              >
                {/* Avatar with spinning conic gold ring + mini crown + online dot */}
                <span className="relative shrink-0">
                  <span className="avatar-ring absolute -inset-[2px] rounded-full opacity-95" />
                  <span className={`relative flex w-8 h-8 rounded-full overflow-hidden items-center justify-center border-2 ${isDark ? 'border-[#0c0c1a] bg-[#0c0c1a]' : 'border-white bg-white'}`}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    ) : (
                      <UserCircle size={20} className="text-amber-500/80" />
                    )}
                  </span>
                  <span className="absolute -top-1.5 -left-1 w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center shadow-sm">
                    <Crown size={9} />
                  </span>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 ${isDark ? 'border-[#07070d]' : 'border-white'}`} />
                </span>

                {/* Mini Points & Name Chip */}
                <span className="flex items-center gap-1 text-[11px] font-extrabold text-amber-500 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full">
                  <Coins size={11} />
                  <span>{profile?.reward_points || 0}</span>
                </span>

                <Menu size={16} className={`transition-colors group-hover:text-amber-500 ${isDark ? "text-gray-300" : "text-slate-600"}`} />
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => setShowAuthModal(true)}
                className="btn-gold btn-shine px-4 sm:px-5 py-2 rounded-full text-xs font-extrabold shrink-0 flex items-center gap-1.5"
              >
                <Sparkles size={13} />
                <span>Login</span>
              </motion.button>
            )}
          </div>
        </nav>

        {/* Hero section: separate component (components/HeroSection.jsx), also available as its own page at /hero */}
        <HeroSection isDark={isDark} lang={lang} />

        {/* ─── Dynamic Book Library Grid (Upgraded with Mobile-First Controls & 3D Showcase Cards) ─── */}
        <section className="px-3.5 sm:px-6 pt-10 pb-8 md:pt-16 md:pb-14 w-full max-w-7xl mx-auto relative z-10">
          
          <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center mb-7 md:mb-10">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[11px] font-extrabold tracking-widest uppercase mb-3">
              <Sparkles size={12} /> Curated Digital Editions
            </div>

            <h2 className="font-cinzel text-2xl sm:text-3xl md:text-4xl font-bold text-center tracking-wide">
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

          {/* NEW INTERACTIVE MOBILE-FIRST BOOK FILTER & SORT BAR */}
          <div className={`mb-7 p-2.5 sm:p-3 rounded-3xl border backdrop-blur-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 ${
            isDark ? 'bg-white/[0.025] border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.3)]' : 'bg-white/90 border-slate-200/90 shadow-sm'
          }`}>
            {/* Scrollable Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 px-0.5">
              {[
                { id: "all", label: "All Books", icon: BookOpen, count: books.length },
                { id: "trending", label: "Trending", icon: Flame, count: books.length },
                { id: "favorites", label: "Saved", icon: Heart, count: favorites.length },
                { id: "owned", label: "My Library", icon: BookMarked, count: purchasedBookIds.length }
              ].map((tab) => {
                const IconComp = tab.icon;
                const active = activeBookFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveBookFilter(tab.id)}
                    className={`relative px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-all ${
                      active
                        ? "text-[#150800] shadow-[0_4px_16px_rgba(212,146,26,0.35)]"
                        : isDark
                        ? "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="activeBookFilterBubble"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 -z-10"
                      />
                    )}
                    <IconComp size={13} className={active ? "text-[#150800]" : "text-amber-500"} />
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                      active
                        ? "bg-black/15 text-[#150800]"
                        : isDark
                        ? "bg-white/[0.06] text-gray-400"
                        : "bg-slate-200/80 text-slate-600"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Inline Quick Search + Sort Selector */}
            <div className="flex items-center gap-2">
              <div className={`flex-1 md:w-48 flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs ${
                isDark ? "bg-black/30 border-white/[0.08] text-white" : "bg-slate-50 border-slate-200 text-slate-800"
              }`}>
                <Search size={14} className="text-amber-500 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter by title or author..."
                  className="bg-transparent border-none outline-none w-full text-xs placeholder:opacity-60"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")} className="text-gray-400 hover:text-amber-500">
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className={`relative flex items-center px-3 py-2 rounded-2xl border text-xs font-bold shrink-0 ${
                isDark ? "bg-black/30 border-white/[0.08] text-gray-300" : "bg-slate-50 border-slate-200 text-slate-700"
              }`}>
                <SlidersHorizontal size={13} className="text-amber-500 mr-1.5 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent border-none outline-none cursor-pointer text-xs font-bold pr-1 appearance-none"
                >
                  <option value="default" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>Featured</option>
                  <option value="popular" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>Most Popular</option>
                  <option value="price_low" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>Price: Low → High</option>
                  <option value="price_high" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>Price: High → Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Book Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 md:gap-8">
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className={`border rounded-[1.75rem] p-5 sm:p-6 h-[430px] flex flex-col gap-4 animate-pulse ${isDark ? 'bg-white/[0.025] border-white/[0.06]' : 'bg-white border-slate-200'}`}>
                  <div className={`w-full h-52 rounded-2xl ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                  <div className={`w-3/4 h-5 rounded-lg mt-2 ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                  <div className={`w-1/2 h-4 rounded-lg ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                  <div className={`w-full h-12 rounded-2xl mt-auto ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />
                </div>
              ))
            ) : displayedBooks.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`col-span-full rounded-3xl border p-10 text-center flex flex-col items-center justify-center gap-3 ${
                  isDark ? "bg-white/[0.02] border-white/[0.07]" : "bg-white border-slate-200"
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-500 flex items-center justify-center">
                  <BookOpen size={26} />
                </div>
                <h3 className="font-cinzel text-lg font-bold">No Books Found Here Yet</h3>
                <p className={`text-xs max-w-sm ${isDark ? "text-gray-400" : "text-slate-500"}`}>
                  {activeBookFilter === "favorites"
                    ? "Tap the heart icon on any book card to save your favorite reads here."
                    : activeBookFilter === "owned"
                    ? "Books you unlock will appear right here for instant 1-tap reading."
                    : "Try clearing your search or switching back to All Books."}
                </p>
                <button
                  type="button"
                  onClick={() => { setActiveBookFilter("all"); setSearchQuery(""); setSortBy("default"); }}
                  className="btn-gold px-5 py-2.5 rounded-xl text-xs font-extrabold mt-1"
                >
                  Show All Books
                </button>
              </motion.div>
            ) : (
              displayedBooks.map((book, i) => {
                const isPurchased = purchasedBookIds.includes(book.id);
                const isFav = favorites.includes(book.id);
                const originalPrice = book.final_price;
                const pDiscount = partnerData ? Math.round(originalPrice * (partnerData.discount_pct / 100)) : 0;
                const displayPrice = originalPrice - pDiscount;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-30px" }} transition={{ duration: 0.48, delay: Math.min(i * 0.06, 0.28), ease: [0.16, 1, 0.3, 1] }}
                    key={book.id} onClick={() => openBookDetails(book)}
                    className={`luminary-card border rounded-[1.75rem] p-5 sm:p-6 relative flex flex-col h-full group cursor-pointer fast-anim hover:-translate-y-2 active:scale-[0.99] ${
                      isDark
                        ? 'bg-gradient-to-b from-white/[0.04] via-white/[0.02] to-[#0a0a16]/90 border-white/[0.08] hover:border-amber-500/35 shadow-[0_10px_35px_rgba(0,0,0,0.45)]'
                        : 'bg-white border-slate-200/90 shadow-[0_10px_30px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_50px_rgba(212,146,26,0.16)] hover:border-amber-500/45'
                    }`}
                  >
                    {/* Top Floating Badges Row */}
                    {book.discount > 0 && !isPurchased && !partnerData && (
                      <div className="absolute top-3.5 right-3.5 discount-badge px-3 py-1 rounded-full text-[11px] z-20 flex items-center gap-1">
                        <Flame size={12} className="text-amber-600 fill-amber-500" />
                        {book.discount}% OFF
                      </div>
                    )}
                    {partnerData && !isPurchased && (
                      <div className="absolute top-3.5 right-3.5 bg-blue-500/20 backdrop-blur-md text-blue-300 px-3 py-1 rounded-full text-[11px] font-black border border-blue-400/40 z-20 shadow-[0_0_14px_rgba(59,130,246,0.3)]">
                        -{partnerData.discount_pct}% (Partner)
                      </div>
                    )}
                    {isPurchased && (
                      <div className="absolute top-3.5 right-3.5 bg-emerald-500/20 backdrop-blur-md text-emerald-300 px-3 py-1 rounded-full text-[11px] font-black border border-emerald-400/40 z-20 flex items-center gap-1">
                        <CheckCircle2 size={12} /> Unlocked
                      </div>
                    )}

                    {/* Upgraded 3D Showcase Stage for Book Cover */}
                    <div className={`w-full h-52 mb-5 shrink-0 rounded-2xl relative overflow-hidden flex items-center justify-center p-3 border transition-colors ${
                      isDark
                        ? 'bg-gradient-to-b from-amber-500/[0.07] via-white/[0.015] to-black/40 border-white/[0.06] group-hover:border-amber-500/25'
                        : 'bg-gradient-to-b from-amber-50/70 via-slate-50 to-slate-100/70 border-slate-200/70 group-hover:border-amber-300/70'
                    }`}>
                      {/* Soft Radial Pedestal Glow Behind Book */}
                      <div
                        className="absolute w-36 h-36 rounded-full blur-2xl opacity-50 group-hover:opacity-85 transition-opacity duration-500 pointer-events-none"
                        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.38) 0%, transparent 70%)" }}
                      />

                      {/* Top-Left Verified Rating Pill */}
                      <div className={`absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold backdrop-blur-md border ${
                        isDark ? "bg-black/55 border-white/10 text-amber-300" : "bg-white/85 border-slate-200 text-amber-600 shadow-sm"
                      }`}>
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        <span>4.9</span>
                      </div>

                      {book.cover_path ? (
                        <div className="w-full h-full relative flex items-center justify-center">
                          <img 
                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${book.cover_path}`} 
                            alt={book.title} 
                            loading={i < 2 ? "eager" : "lazy"} 
                            decoding="async"
                            className="max-h-full max-w-full object-contain rounded-lg shadow-[0_12px_28px_rgba(0,0,0,0.55)] transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1" 
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center rounded-xl">
                          <BookOpen size={48} className="text-amber-500/60" />
                        </div>
                      )}

                      {/* Subtle Tap-to-Preview Pill on Hover */}
                      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-10">
                        <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-black/75 text-amber-300 border border-amber-400/30 backdrop-blur-md flex items-center gap-1 whitespace-nowrap shadow-lg">
                          <Sparkles size={10} /> Tap for Details & Reviews
                        </span>
                      </div>
                    </div>

                    {/* Book Title */}
                    <h3 className={`font-cinzel text-lg sm:text-xl font-bold mb-1.5 leading-snug line-clamp-2 min-h-[3.1rem] group-hover:text-amber-500 transition-colors ${isDark ? 'text-white/95' : 'text-slate-900'}`}>
                      {book.title}
                    </h3>
                    
                    {/* Author + Animated Heart Button */}
                    <div className="flex justify-between items-center mb-4">
                      <p className={`text-xs sm:text-sm font-medium truncate pr-2 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                        by <span className={isDark ? "text-gray-300" : "text-slate-700"}>{book.author}</span>
                      </p>
                      <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={(e) => toggleFavorite(e, book.id)}
                        className={`relative focus:outline-none hover:scale-110 transition-all shrink-0 w-9 h-9 rounded-full border flex items-center justify-center ${
                          isFav
                            ? "bg-rose-500/15 border-rose-500/35"
                            : isDark
                            ? "bg-white/[0.03] border-white/[0.08] hover:border-rose-500/30"
                            : "bg-slate-50 border-slate-200 hover:border-rose-300"
                        }`}
                        title="Add to Favorites"
                      >
                        {likedBurstId === book.id && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60" />
                        )}
                        <Heart size={16} className={`transition-colors duration-300 ${isFav ? 'text-red-500 fill-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]' : (isDark ? 'text-gray-400 hover:text-red-400' : 'text-slate-400 hover:text-red-500')}`} />
                      </motion.button>
                    </div>

                    {/* Price + Buy / Read Now CTA Row */}
                    <div className={`mt-auto flex justify-between items-center border-t pt-4 gap-3 ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`}>
                      <div>
                        {book.discount > 0 && !isPurchased && !partnerData && (
                          <div className={`text-[11px] line-through font-semibold ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>₹{book.base_price}</div>
                        )}
                        {partnerData && !isPurchased && (
                          <div className={`text-[11px] line-through font-semibold ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>₹{originalPrice}</div>
                        )}
                        <div className={`text-2xl font-black tracking-tight leading-none ${isPurchased ? (isDark ? "text-emerald-400" : "text-emerald-600") : (isDark ? "text-white" : "text-slate-900")}`}>
                          {isPurchased ? 'Owned' : `₹${displayPrice}`}
                        </div>
                      </div>

                      {isPurchased ? (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={(e) => { e.stopPropagation(); openWebReader(book); }}
                          className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm bg-emerald-500/[0.14] text-emerald-400 border border-emerald-500/35 flex items-center gap-2 font-extrabold hover:bg-emerald-500/[0.22] transition shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
                        >
                          <CheckCircle2 size={15} /> {t.readNow}
                        </motion.button>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.96 }}
                          onClick={(e) => { e.stopPropagation(); setSelectedBook(book); setShowCheckout(true); }}
                          className="btn-gold btn-shine px-5 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-1.5 font-extrabold"
                        >
                          {t.buyNow} <ChevronRight size={15} />
                        </motion.button>
                      )}
                    </div>
                    
                    {/* NEW VIEWS & LIKES UI BELOW BUY BUTTON (Refined Pill Metrics) */}
                    <div className={`flex justify-between items-center mt-3.5 pt-3 border-t border-dashed ${isDark ? 'border-white/[0.08]' : 'border-slate-200'}`}>
                      <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${isDark ? 'bg-blue-500/[0.08] text-blue-300/90' : 'bg-blue-50 text-blue-700'}`}>
                        <Eye size={13} className="text-blue-400" />
                        <span>{book.views || 0} Views</span>
                      </div>
                      <div className={`flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${isDark ? 'bg-rose-500/[0.08] text-rose-300/90' : 'bg-rose-50 text-rose-700'}`}>
                        <Heart size={13} className="text-red-500 fill-red-500/25" />
                        <span>{book.likes || 0} Likes</span>
                      </div>
                    </div>

                  </motion.div>
                );
              })
            )}
          </div>
        </section>

        {/* Compact, Animated Glassmorphic Footer Dock (About Us, Safe & Secure, Instant PDF, Share Page) */}
        <footer className={`py-6 px-4 w-full flex flex-col items-center border-t mt-auto relative z-10 ${isDark ? 'bg-gradient-to-b from-[#07070d] to-[#0a0a16] border-white/[0.06]' : 'bg-gradient-to-b from-slate-50 to-slate-100/80 border-slate-200'}`}>
          <div className={`w-full max-w-3xl rounded-3xl border p-3 sm:p-4 backdrop-blur-xl ${
            isDark
              ? 'bg-white/[0.025] border-white/[0.08] shadow-[0_12px_40px_rgba(0,0,0,0.45)]'
              : 'bg-white/90 border-slate-200/90 shadow-[0_10px_30px_rgba(15,23,42,0.05)]'
          }`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* 1. About Us */}
              <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.96 }}>
                <Link
                  href="/about"
                  className={`footer-action-pill h-full w-full px-3 py-2.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-extrabold shadow-sm ${
                    isDark
                      ? 'bg-white/[0.04] border-white/[0.09] text-gray-200 hover:border-amber-500/40 hover:text-amber-400'
                      : 'bg-slate-50/90 border-slate-200 text-slate-700 hover:border-amber-500/40 hover:text-amber-600'
                  }`}
                >
                  <span className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
                    <Sparkles size={13} />
                  </span>
                  <span className="truncate">About Us</span>
                </Link>
              </motion.div>

              {/* 2. Safe & Secure */}
              <motion.div
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => addToast("100% Verified & SSL Encrypted Library 🛡️", "success")}
                className={`footer-action-pill cursor-pointer px-3 py-2.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-extrabold shadow-sm ${
                  isDark
                    ? 'bg-white/[0.04] border-white/[0.09] text-gray-200 hover:border-emerald-500/40 hover:text-emerald-400'
                    : 'bg-slate-50/90 border-slate-200 text-slate-700 hover:border-emerald-500/40 hover:text-emerald-600'
                }`}
              >
                <span className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={13} />
                </span>
                <span className="truncate">{t.secure}</span>
              </motion.div>

              {/* 3. Instant PDF Auto-Download */}
              <motion.button
                type="button"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => user ? setIsSidebarOpen(true) : setShowAuthModal(true)}
                className={`footer-action-pill cursor-pointer px-3 py-2.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-extrabold shadow-sm ${
                  isDark
                    ? 'bg-white/[0.04] border-white/[0.09] text-gray-200 hover:border-amber-500/40 hover:text-amber-400'
                    : 'bg-slate-50/90 border-slate-200 text-slate-700 hover:border-amber-500/40 hover:text-amber-600'
                }`}
              >
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                  <Zap size={13} />
                </span>
                <span className="truncate">{t.instant}</span>
              </motion.button>

              {/* 4. Share Page */}
              <motion.button
                type="button"
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="footer-action-pill btn-shine cursor-pointer px-3 py-2.5 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 text-amber-400 hover:border-amber-400 flex items-center justify-center gap-2 text-xs font-extrabold shadow-[0_4px_18px_rgba(212,146,26,0.18)]"
              >
                <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center shrink-0 shadow-sm">
                  <Share2 size={12} />
                </span>
                <span className="truncate">Share Page</span>
              </motion.button>
            </div>
          </div>
        </footer>

        {/* Scrolling Line Loop */}
        <div className="w-full bg-amber-500/[0.03] border-t border-amber-500/[0.12] overflow-hidden cursor-pointer py-2 relative z-10" onClick={() => window.location.reload()}>
          <div className={`animate-scroll text-[10px] tracking-[0.25em] uppercase font-black flex w-max ${isDark ? 'text-amber-500/40' : 'text-amber-500/60'}`}>
            <span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span><span className="px-8">Vedoxa Library</span>
          </div>
        </div>

        {/* PURE SVG TRUST LOGOS SECTION */}
        <div className={`w-full py-5 flex flex-col items-center border-b relative z-10 ${isDark ? 'bg-[#090914] border-white/[0.04]' : 'bg-slate-100 border-slate-200'}`}>
          <p className={`text-[10px] font-bold mb-3.5 tracking-widest uppercase ${isDark ? 'text-gray-600' : 'text-slate-500'}`}>Trusted By & Verified Secure</p>
          <div className="flex flex-wrap justify-center items-center gap-5 md:gap-10 opacity-75 hover:opacity-100 transition-all duration-500 px-4">
            <div className={`flex items-center gap-2 font-bold tracking-wide text-xs sm:text-sm ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
              <svg viewBox="0 0 48 48" className="h-4 sm:h-5 w-auto grayscale hover:grayscale-0 transition-all cursor-pointer">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Google Verified
            </div>
            <div className="flex items-center gap-1 font-bold tracking-wide text-xs sm:text-sm">
              <svg viewBox="0 0 100 24" className="h-3.5 sm:h-4 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.44 19H7.13L16 2.776h5.36L12.44 19z" fill={isDark ? "#fff" : "#334155"}/>
                <path d="M2.57 18.99l9-16.216h5.21l-9 16.216H2.57z" fill="#3395FF"/>
                <text x="24" y="17" fill={isDark ? "#fff" : "#334155"} fontSize="16" fontWeight="bold" fontFamily="sans-serif">razorpay</text>
              </svg>
            </div>
            <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
              <ShieldCheck className="text-green-500" size={17}/> McAfee Secure
            </div>
            <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
              <Lock className="text-amber-500" size={17}/> SSL 256-bit
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
