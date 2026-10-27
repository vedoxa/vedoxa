// @ts-nocheck
"use client";
import { useState, useEffect, useCallback, useRef, useMemo, useDeferredValue, memo, Component } from "react";
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

// PERF FIX: configured once at module level (was re-run on every render)
NProgress.configure({ showSpinner: false, speed: 400 });

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

// Emojis written as unicode escapes so the joiner (ZWJ) characters can never get lost when copy-pasting
const AVATARS = [
  encodeSvg("\u{1F469}\u{1F3FB}\u200D\u{1F3EB}", "\u{1F4D6}", '#fbbf24', '#d97706'), // Amber, Woman teacher
  encodeSvg("\u{1F468}\u{1F3FD}\u200D\u{1F393}", "\u{1F4D8}", '#34d399', '#047857'), // Green, Man graduate
  encodeSvg("\u{1F469}\u{1F3FE}\u200D\u{1F4BB}", "\u{1F4DA}", '#f87171', '#b91c1c'), // Red, Woman studying
  encodeSvg("\u{1F468}\u{1F3FB}\u200D\u{1F3EB}", "\u{1F4D7}", '#60a5fa', '#1d4ed8'), // Blue, Man teacher
  encodeSvg("\u{1F9D5}\u{1F3FC}", "\u{1F4D6}", '#a78bfa', '#6d28d9'),  // Purple, Diverse reading
  encodeSvg("\u{1F9D8}\u{1F3FD}\u200D\u2642\uFE0F", "\u{1FAB7}", '#f472b6', '#9d174d')  // Pink, Meditation / lotus
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

// NEW ADDITION: crash shield. If the book popup or the reader ever throws, only that part shows a
// friendly message and the rest of the website keeps working (no white screen).
class SafeBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err) { console.error("UI section crashed:", err); }
  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="fixed inset-0 z-[7000] flex items-center justify-center p-6 bg-black/80">
        <div className="w-full max-w-sm rounded-3xl border border-amber-500/30 bg-[#0d0d1c] text-white p-6 text-center">
          <p className="font-bold text-base mb-1">Something went wrong</p>
          <p className="text-xs text-gray-400 mb-4">{this.props.message || "Please try again."}</p>
          <button type="button" onClick={this.props.onClose} className="btn-gold px-5 py-2.5 rounded-xl text-sm font-extrabold">Close</button>
        </div>
      </div>
    );
  }
}

// PERF FIX: each book card is now its own memoized component. Opening the dashboard, typing in search,
// opening modals etc. no longer re-renders every card (this was the main reason for lag).
const BookCard = memo(function BookCard({ book, index, isDark, isPurchased, isFav, isBurst, partnerPct, readLabel, buyLabel, onOpen, onRead, onBuy, onFav }) {
  const hasPartner = partnerPct !== null && partnerPct !== undefined;
  const originalPrice = book.final_price;
  const pDiscount = hasPartner ? Math.round(originalPrice * (partnerPct / 100)) : 0;
  const displayPrice = originalPrice - pDiscount;
  const coverSrc = book.cover_path ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${book.cover_path}` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: "easeOut" } }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.06, 0.28), ease: [0.16, 1, 0.3, 1] }}
      onClick={() => onOpen(book)}
      className={`luminary-card fast-anim border rounded-[1.75rem] p-5 sm:p-6 relative flex flex-col h-full group cursor-pointer ${
        isDark
          ? 'bg-gradient-to-b from-white/[0.04] via-white/[0.02] to-[#0a0a16]/90 border-white/[0.08] hover:border-amber-500/35 shadow-[0_8px_24px_rgba(0,0,0,0.4)]'
          : 'bg-white border-slate-200/90 shadow-[0_8px_24px_rgba(15,23,42,0.06)] hover:shadow-[0_16px_36px_rgba(212,146,26,0.14)] hover:border-amber-500/45'
      }`}
    >
      {/* Top Floating Badges Row */}
      {book.discount > 0 && !isPurchased && !hasPartner && (
        <div className="absolute top-3.5 right-3.5 discount-badge px-3 py-1 rounded-full text-[11px] z-20 flex items-center gap-1">
          <Flame size={12} className="text-amber-600 fill-amber-500" />
          {book.discount}% OFF
        </div>
      )}
      {hasPartner && !isPurchased && (
        <div className="absolute top-3.5 right-3.5 bg-blue-500/25 text-blue-300 px-3 py-1 rounded-full text-[11px] font-black border border-blue-400/40 z-20">
          -{partnerPct}% (Partner)
        </div>
      )}
      {isPurchased && (
        <div className="absolute top-3.5 right-3.5 bg-emerald-500/25 text-emerald-300 px-3 py-1 rounded-full text-[11px] font-black border border-emerald-400/40 z-20 flex items-center gap-1">
          <CheckCircle2 size={12} /> Unlocked
        </div>
      )}

      {/* 3D Showcase Stage for Book Cover */}
      <div className={`w-full h-52 mb-5 shrink-0 rounded-2xl relative overflow-hidden flex items-center justify-center p-3 border transition-colors ${
        isDark
          ? 'bg-gradient-to-b from-amber-500/[0.07] via-white/[0.015] to-black/40 border-white/[0.06] group-hover:border-amber-500/25'
          : 'bg-gradient-to-b from-amber-50/70 via-slate-50 to-slate-100/70 border-slate-200/70 group-hover:border-amber-300/70'
      }`}>
        {/* Soft Radial Pedestal Glow Behind Book (no blur filter = cheap to paint) */}
        <div
          className="absolute w-40 h-40 rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.30) 0%, transparent 68%)" }}
        />

        {/* Top-Left Verified Rating Pill */}
        <div className={`absolute top-2.5 left-2.5 z-10 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
          isDark ? "bg-black/60 border-white/10 text-amber-300" : "bg-white/90 border-slate-200 text-amber-600 shadow-sm"
        }`}>
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span>4.9</span>
        </div>

        {coverSrc ? (
          <div className="w-full h-full relative flex items-center justify-center">
            <img
              src={coverSrc}
              alt={book.title}
              loading={index < 2 ? "eager" : "lazy"}
              decoding="async"
              className="max-h-full max-w-full object-contain rounded-lg shadow-[0_10px_22px_rgba(0,0,0,0.45)] transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center rounded-xl">
            <BookOpen size={48} className="text-amber-500/60" />
          </div>
        )}

        {/* Subtle Tap-to-Preview Pill on Hover (desktop only) */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-10 hidden md:block">
          <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-black/80 text-amber-300 border border-amber-400/30 flex items-center gap-1 whitespace-nowrap shadow-lg">
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
          type="button"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.82 }}
          onClick={(e) => onFav(e, book.id)}
          className={`relative focus:outline-none transition-colors shrink-0 w-9 h-9 rounded-full border flex items-center justify-center ${
            isFav
              ? "bg-rose-500/15 border-rose-500/35"
              : isDark
              ? "bg-white/[0.03] border-white/[0.08] hover:border-rose-500/30"
              : "bg-slate-50 border-slate-200 hover:border-rose-300"
          }`}
          title="Add to Favorites"
          aria-label="Add to Favorites"
        >
          {isBurst && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-60" />
          )}
          <Heart size={16} className={`transition-colors duration-300 ${isFav ? 'text-red-500 fill-red-500' : (isDark ? 'text-gray-400 hover:text-red-400' : 'text-slate-400 hover:text-red-500')}`} />
        </motion.button>
      </div>

      {/* Price + Buy / Read Now CTA Row */}
      <div className={`mt-auto flex justify-between items-center border-t pt-4 gap-3 ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`}>
        <div>
          {book.discount > 0 && !isPurchased && !hasPartner && (
            <div className={`text-[11px] line-through font-semibold ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>₹{book.base_price}</div>
          )}
          {hasPartner && !isPurchased && (
            <div className={`text-[11px] line-through font-semibold ${isDark ? 'text-gray-500' : 'text-slate-400'}`}>₹{originalPrice}</div>
          )}
          <div className={`text-2xl font-black tracking-tight leading-none ${isPurchased ? (isDark ? "text-emerald-400" : "text-emerald-600") : (isDark ? "text-white" : "text-slate-900")}`}>
            {isPurchased ? 'Owned' : `₹${displayPrice}`}
          </div>
        </div>

        {isPurchased ? (
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={(e) => { e.stopPropagation(); onRead(book); }}
            className="px-5 py-2.5 rounded-2xl text-xs sm:text-sm bg-emerald-500/[0.14] text-emerald-400 border border-emerald-500/35 flex items-center gap-2 font-extrabold hover:bg-emerald-500/[0.22] transition-colors"
          >
            <CheckCircle2 size={15} /> {readLabel}
          </motion.button>
        ) : (
          <motion.button
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={(e) => { e.stopPropagation(); onBuy(book); }}
            className="btn-gold btn-shine px-5 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-1.5 font-extrabold"
          >
            {buyLabel} <ChevronRight size={15} />
          </motion.button>
        )}
      </div>

      {/* VIEWS & LIKES (Refined Pill Metrics) */}
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
});

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
  const [isAuthLoading, setIsAuthLoading] = useState(false); // NEW: stops double-submit on login/signup
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [likedBurstId, setLikedBurstId] = useState(null);
  const deepLinkHandledRef = useRef(false);
  const loggedUserIdRef = useRef(null); // NEW: avoids re-loading the same user's data again and again
  const reviewReqRef = useRef(0); // NEW: ignores outdated review responses when switching books quickly
  const favBusyRef = useRef(new Set()); // NEW: stops double-tap on the heart from corrupting like counts

  // THEME INITIALIZATION LOGIC
  useEffect(() => {
    let savedTheme = null;
    try { savedTheme = localStorage.getItem("vedoxa_theme"); } catch (e) {}
    if (savedTheme === "light" || savedTheme === "dark") {
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

  // CLOSE SEARCH DROPDOWN ON OUTSIDE CLICK + SCROLL-TO-TOP VISIBILITY (scroll work is throttled to 1 per frame)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setShowScrollTop(window.scrollY > 520);
        ticking = false;
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
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
    try { localStorage.setItem("vedoxa_theme", newTheme); } catch (e) {}
  };

  const isDark = theme === "dark";

  // NEW ADDITION: shared style helpers for the Dashboard panel (softer shadows = lighter to paint)
  const sideCard = isDark
    ? 'bg-white/[0.035] border-white/[0.08] shadow-[0_2px_10px_rgba(0,0,0,0.2)]'
    : 'bg-slate-50/90 border-slate-200/80 shadow-[0_2px_10px_rgba(15,23,42,0.04)]';
  const segBtn = (on) => `px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors duration-200 ${on ? 'bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] shadow-md' : (isDark ? 'text-gray-400 hover:text-white' : 'text-slate-500 hover:text-slate-800')}`;

  // Books + partner + auth listener: runs ONCE (3 separate effects were merged earlier to stop re-fetching on every modal/lang change)
  useEffect(() => {
    const preventZoom = (e) => { e.preventDefault(); };
    document.addEventListener('gesturestart', preventZoom);
    document.addEventListener('gesturechange', preventZoom);

    fetchBooks();
    initPartnerSystem();

    supabase.auth.getSession().then(({ data: { session } }) => { if (session?.user) handleUserLogin(session.user); }).catch(() => {});
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // setTimeout(0): supabase-js can freeze if other supabase calls are awaited directly inside this callback
      setTimeout(() => {
        if (session?.user) handleUserLogin(session.user);
        else { loggedUserIdRef.current = null; setUser(null); setProfile(null); setPurchasedBookIds([]); setFavorites([]); setIsSidebarOpen(false); }
      }, 0);
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

  // Phone/browser BACK button closes the book popup. (FIX: no more extra history entry pushed on back)
  useEffect(() => {
    const handlePopState = () => { if (showBookDetails) setShowBookDetails(false); };
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

  // NEW ADDITION: Esc key closes the top-most open layer (desktop convenience)
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (showAvatarPicker) setShowAvatarPicker(false);
      else if (showReader) setShowReader(false);
      else if (showCheckout) setShowCheckout(false);
      else if (showAuthModal) setShowAuthModal(false);
      else if (showBookDetails) closeBookDetails();
      else if (isSidebarOpen) setIsSidebarOpen(false);
      else if (isSearchOpen) setIsSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAvatarPicker, showReader, showCheckout, showAuthModal, showBookDetails, isSidebarOpen, isSearchOpen]);

  // NEW ADDITION: offline / online notice + reset Google button when user returns with the Back button
  useEffect(() => {
    const goOffline = () => addToast("You are offline. Please check your internet.", "error");
    const goOnline = () => addToast("Back online ✅", "success");
    const onPageShow = (e) => { if (e.persisted) { setIsGoogleLoading(false); NProgress.done(); } };
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  // NEW ADDITION: readers who own a book get the reader chunk preloaded quietly, so "Read Now" opens faster
  useEffect(() => {
    if (purchasedBookIds.length === 0) return;
    const timer = setTimeout(() => { import("../components/FlipbookReader").catch(() => {}); }, 2500);
    return () => clearTimeout(timer);
  }, [purchasedBookIds.length > 0]);

  const initPartnerSystem = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let pCode = urlParams.get('partner');

      if (pCode) {
        pCode = pCode.trim().toUpperCase();
        localStorage.setItem('vedoxa_partner', pCode);
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
    } catch (err) { console.error("Partner init error:", err); }
  };

  const handleUserLogin = async (loggedUser) => {
    if (!loggedUser?.id) return;
    // Supabase fires SIGNED_IN again on tab focus / token refresh. Same user = nothing new to load.
    if (loggedUserIdRef.current === loggedUser.id) {
      setUser((prev) => (prev && prev.id === loggedUser.id ? prev : loggedUser));
      return;
    }
    loggedUserIdRef.current = loggedUser.id;
    setUser(loggedUser);
    // NEW ADDITION: remember this email so the login box can suggest it next time
    try { if (loggedUser.email) { localStorage.setItem("vedoxa_last_email", loggedUser.email); setSavedEmail(loggedUser.email); } } catch (e) {}

    try {
      // SPEED: the 3 queries used to run one after another; now they run together, so the dashboard fills up much faster.
      const [profRes, ordersRes, favsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', loggedUser.id).single(),
        supabase.from('orders').select('book_id').eq('customer_id', loggedUser.id),
        // favorites live in user_interactions exactly like BookDetailsModal
        supabase.from('user_interactions').select('book_id').eq('user_id', loggedUser.id).eq('interaction_type', 'like')
      ]);
      if (loggedUserIdRef.current !== loggedUser.id) return; // user logged out while data was loading

      const prof = profRes.data;
      if (prof) {
        if (!prof.avatar_url) {
          const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
          Promise.resolve(supabase.from('profiles').update({ avatar_url: randomAvatar }).eq('id', loggedUser.id)).catch(() => {});
          prof.avatar_url = randomAvatar;
        }
        setProfile(prof);
        setCheckoutData(prev => ({ ...prev, email: loggedUser.email, name: prof.name || prev.name, phone: prof.phone || prev.phone }));
      } else {
        setCheckoutData(prev => ({ ...prev, email: loggedUser.email }));
      }
      if (ordersRes.data) setPurchasedBookIds(ordersRes.data.map(o => o.book_id));
      if (favsRes.data) setFavorites(favsRes.data.map(f => f.book_id));
    } catch (err) {
      console.error("Login data error:", err);
      loggedUserIdRef.current = null; // allow a retry on the next auth event
    }
  };

  // SPEED: books from the last visit show instantly (cached for this tab), then fresh data replaces them silently.
  const fetchBooks = useCallback(async () => {
    let hadCache = false;
    try {
      const cached = sessionStorage.getItem("vedoxa_books_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) { setBooks(parsed); setLoading(false); hadCache = true; }
      }
    } catch (e) {}
    if (!hadCache) { NProgress.start(); setLoading(true); }
    try {
      const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false });
      if (!error && data) {
        setBooks(data);
        try { sessionStorage.setItem("vedoxa_books_cache", JSON.stringify(data)); } catch (e) {}
      }
    } catch (err) { console.error("Error fetching books:", err); }
    setLoading(false); NProgress.done();
  }, []);

  const fetchReviews = async (bookId) => {
    const reqId = ++reviewReqRef.current;
    setLoadingReviews(true);
    try {
      const { data, error } = await supabase.from("reviews").select("id, review_text, rating, created_at, user_id, profiles(name), fake_author_name").eq("book_id", bookId).order("created_at", { ascending: false });
      if (reqId !== reviewReqRef.current) return; // a newer book was opened meanwhile
      if (!error && data) {
        setReviews(data);
        const existing = user ? data.find(r => r.user_id === user.id) : null;
        if (existing) { setUserExistingReview(existing); setNewReviewText(existing.review_text); }
        else { setUserExistingReview(null); setNewReviewText(""); }
      }
    } catch (err) { console.error("Error fetching reviews:", err); }
    if (reqId === reviewReqRef.current) setLoadingReviews(false);
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

  // One shared view counter (was copy-pasted twice). Counts each book once per browser session.
  const trackBookView = async (book) => {
    const viewKey = `viewed_book_${book.id}`;
    try {
      if (sessionStorage.getItem(viewKey)) return;
      sessionStorage.setItem(viewKey, 'true');
    } catch (e) { return; }
    try {
      const newViews = (book.views || 0) + 1;
      setBooks((prev) => prev.map((b) => (b.id === book.id ? { ...b, views: newViews } : b)));
      await supabase.from("books").update({ views: newViews }).eq("id", book.id);
    } catch (err) {
      console.error("View update error", err);
    }
  };

  const openBookDetails = (book) => {
    setSelectedBook(book); fetchReviews(book.id); setShowBookDetails(true);
    if (typeof window !== "undefined") {
      try {
        // keep Next.js' own history data (...state) so the Back button never triggers a full page reload
        if (window.history.state?.modal !== "book-details") {
          window.history.pushState({ ...(window.history.state || {}), modal: "book-details" }, "", window.location.pathname + window.location.search);
        }
      } catch (e) {}
    }
    trackBookView(book);
  };

  const handleSuggestedBookChange = (book) => {
    setSelectedBook(book);
    fetchReviews(book.id);
    trackBookView(book);
  };

  const closeBookDetails = () => {
    setShowBookDetails(false);
    if (typeof window !== "undefined" && window.history.state?.modal === "book-details") window.history.back();
  };

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]); // max 3 toasts on screen
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
    e.preventDefault();
    if (isAuthLoading) return;
    setIsAuthLoading(true); NProgress.start();
    try {
      const email = authForm.email.trim();
      const res = authForm.mode === "signup"
        ? await supabase.auth.signUp({ email, password: authForm.password })
        : await supabase.auth.signInWithPassword({ email, password: authForm.password });

      if (!res.error) {
        if (authForm.mode === "signup" && !res.data?.session) addToast("Account created! Please check your email to confirm.", "success");
        else addToast(`Successfully ${authForm.mode === "signup" ? "signed up" : "logged in"}!`, "success");
        setShowAuthModal(false);
        setAuthForm((prev) => ({ ...prev, password: "" }));
      } else addToast(res.error.message, "error");
    } catch (err) {
      addToast("Something went wrong. Please try again.", "error");
    }
    setIsAuthLoading(false); NProgress.done();
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleLoading) return;
    setIsGoogleLoading(true);
    NProgress.start();
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
    } catch (err) {
      addToast("Google login error. Please try again.", "error");
      setIsGoogleLoading(false);
      NProgress.done();
    }
  };

  const confirmLogout = async () => {
    try { await supabase.auth.signOut(); } catch (e) {}
    setShowLogoutConfirm(false); setIsSidebarOpen(false); addToast("Logged out securely", "info");
  };

  const verifyCoupon = async () => {
    const code = (checkoutData.coupon || "").trim().toUpperCase();
    if (!code) return;
    try {
      const { data } = await supabase.from('coupons').select('*').eq('code', code).single();
      if (data && new Date(data.expiry) > new Date() && data.used < data.limit_count) {
        setAppliedCoupon(data); addToast("Coupon applied! 🎉", "success");
      } else { setAppliedCoupon(null); addToast("Invalid or expired coupon", "error"); }
    } catch (err) { setAppliedCoupon(null); addToast("Could not check the coupon. Please try again.", "error"); }
  };

  const handleSaveAvatar = async (avatarUrl) => {
    try {
      const { error } = await supabase.from('profiles').update({ avatar_url: avatarUrl }).eq('id', user.id);
      if (error) throw error;
      setProfile((prev) => ({ ...prev, avatar_url: avatarUrl }));
      addToast("Profile picture updated!", "success"); setShowAvatarPicker(false);
    } catch (error) { addToast("Error saving avatar.", "error"); }
  };

  // Connected toggleFavorite to Realtime Database using user_interactions like BookDetailsModal
  const toggleFavorite = async (e, bookId) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!user) {
      addToast("Please login to save favorites", "error");
      setShowAuthModal(true);
      return;
    }
    if (favBusyRef.current.has(bookId)) return; // ignore rapid double taps
    favBusyRef.current.add(bookId);

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
        const r1 = await supabase.from("user_interactions").delete().match({ user_id: user.id, book_id: bookId, interaction_type: 'like' });
        if (r1.error) throw r1.error;
        const r2 = await supabase.from("books").update({ likes: Math.max(0, currentLikes - 1) }).eq("id", bookId);
        if (r2.error) console.warn("Likes counter not updated:", r2.error.message);
      } else {
        const r1 = await supabase.from("user_interactions").upsert({
          user_id: user.id,
          book_id: bookId,
          interaction_type: 'like'
        }, { onConflict: 'user_id, book_id' });
        if (r1.error) throw r1.error;
        const r2 = await supabase.from("books").update({ likes: currentLikes + 1 }).eq("id", bookId);
        if (r2.error) console.warn("Likes counter not updated:", r2.error.message);
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
      // Revert UI if database update fails
      setFavorites((prev) => isFav ? [...prev, bookId] : prev.filter((id) => id !== bookId));
      setBooks((prev) => prev.map((b) => b.id === bookId ? { ...b, likes: currentLikes } : b));
      addToast("Failed to update like status", "error");
    } finally {
      favBusyRef.current.delete(bookId);
    }
  };

  let partnerDiscountAmount = 0;
  let baseForClient = selectedBook?.final_price || 0;

  if (partnerData && selectedBook) {
      partnerDiscountAmount = Math.round(baseForClient * ((partnerData.discount_pct || 0) / 100));
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
    if (isProcessing) return; // blocks double payment taps
    if (!user) { addToast("Please login to purchase", "error"); setShowCheckout(false); setShowAuthModal(true); return; }
    // FIX: the old code changed checkoutData directly (state mutation). Now a local value is used.
    const customerName = (checkoutData.name || "").trim() || profile?.name || "Vedoxa Reader";
    if (!checkoutData.phone) { addToast("Phone number is required", "error"); return; }
    if (checkoutData.countryCode === '+91' && checkoutData.phone.length !== 10) { addToast("Please enter a valid 10-digit Indian phone number.", "error"); return; }

    setIsProcessing(true); NProgress.start();

    try {
      await supabase.from('profiles').update({ name: customerName, phone: checkoutData.phone }).eq('id', user.id);
      setProfile(prev => ({ ...prev, name: customerName, phone: checkoutData.phone }));
    } catch (e) { console.error("Failed to update profile", e); }

    if (clientFinalPrice === 0) {
      try {
        const { error } = await supabase.from('orders').insert([{
          customer_id: user.id, customer_name: customerName, customer_email: user.email, book_id: selectedBook.id, book_title: selectedBook.title, base_price: selectedBook.base_price, final_price: 0, amount: 0, coupon_used: appliedCoupon?.code || null, payment_method: 'free_coupon', points_used: useRewards ? (profile?.reward_points || 0) : 0
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
        prefill: { name: customerName, email: user.email, contact: checkoutData.countryCode + checkoutData.phone },
        theme: { color: "#eab308" },
        handler: async function (response) {
          try {
            addToast("Verifying payment...", "info");
            const verifyRes = await fetch('/api/payment', {
              method: 'POST', headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'verify', rzpOrderId: response.razorpay_order_id, rzpPaymentId: response.razorpay_payment_id, rzpSignature: response.razorpay_signature,
                orderData: { customer_id: user.id, customer_name: customerName, customer_email: user.email, book_id: selectedBook.id, book_title: selectedBook.title, base_price: selectedBook.base_price, final_price: orderData.amount, coupon_used: appliedCoupon?.code || null, points_used: useRewards ? (profile?.reward_points || 0) : 0, payment_method: 'razorpay' }
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
    else {
      try { await navigator.clipboard.writeText(urlToShare); addToast("Website link copied to clipboard! 📋", "success"); }
      catch (err) { addToast("Could not copy the link. Please copy it from the address bar.", "error"); }
    }
  };

  // DICTIONARY STYLE SEARCH & SORTING LOGIC (null-safe). SPEED: memoized + deferred, so typing never blocks the screen.
  const deferredQuery = useDeferredValue(searchQuery);

  const filteredBooks = useMemo(() => {
    const query = (deferredQuery || "").trim().toLowerCase();
    if (!query) return books;
    const list = books.filter((b) => {
      const titleStr = (b.title || "").toLowerCase();
      const authorStr = (b.author || "").toLowerCase();
      return ( titleStr.includes(query) || authorStr.includes(query) || (b.tags && b.tags.some(tag => (tag || "").toLowerCase().includes(query))) );
    });
    list.sort((a, b) => {
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
    return list;
  }, [books, deferredQuery]);

  // DISPLAY BOOKS WITH INTERACTIVE CATEGORY PILLS & SORTING (filteredBooks stays intact for the search dropdown)
  const displayedBooks = useMemo(() => {
    const list = filteredBooks.filter((b) => {
      if (activeBookFilter === "favorites") return favorites.includes(b.id);
      if (activeBookFilter === "owned") return purchasedBookIds.includes(b.id);
      if (activeBookFilter === "trending") return (b.views || 0) >= 0;
      return true;
    });
    if (activeBookFilter === "trending" || sortBy === "popular") {
      list.sort((a, b) => ((b.views || 0) + (b.likes || 0) * 3) - ((a.views || 0) + (a.likes || 0) * 3));
    } else if (sortBy === "price_low") {
      list.sort((a, b) => (a.final_price || 0) - (b.final_price || 0));
    } else if (sortBy === "price_high") {
      list.sort((a, b) => (b.final_price || 0) - (a.final_price || 0));
    }
    return list;
  }, [filteredBooks, activeBookFilter, sortBy, favorites, purchasedBookIds]);

  // READER CONSCIOUSNESS LEVEL FOR DASHBOARD
  const ownedCount = purchasedBookIds.length;
  const readerScore = ownedCount * 35 + favorites.length * 10 + Math.min(55, profile?.reward_points || 0);
  const readerProgress = Math.min(100, Math.max(14, readerScore));
  const readerTier = ownedCount >= 5 ? "Enlightened Sage" : ownedCount >= 2 ? "Awakened Luminary" : ownedCount >= 1 ? "Conscious Reader" : "Spiritual Seeker";
  // NEW ADDITION: tells the reader how far the next level is
  const nextTierText = (() => {
    if (ownedCount >= 5) return "You reached the highest level 🌟";
    const target = ownedCount >= 2 ? 5 : ownedCount >= 1 ? 2 : 1;
    const name = target === 5 ? "Enlightened Sage" : target === 2 ? "Awakened Luminary" : "Conscious Reader";
    const left = target - ownedCount;
    return `${left} more book${left > 1 ? "s" : ""} to become ${name}`;
  })();

  // OWNED & FAVORITE BOOKS FOR DASHBOARD QUICK SHELF
  const ownedBooksList = useMemo(() => books.filter((b) => purchasedBookIds.includes(b.id)), [books, purchasedBookIds]);
  const favoriteBooksList = useMemo(() => books.filter((b) => favorites.includes(b.id)), [books, favorites]);

  // Any full-screen layer open? -> page animations underneath are paused so the layer opens smoothly (see .ui-paused)
  const overlayOpen = showBookDetails || showCheckout || showAuthModal || showReader || isSidebarOpen || showAvatarPicker;

  // Stable callbacks for the memoized cards (they always call the latest functions through the ref)
  const cardActions = useRef({});
  cardActions.current = {
    open: openBookDetails,
    read: openWebReader,
    buy: (b) => { setSelectedBook(b); setShowCheckout(true); },
    fav: toggleFavorite
  };
  const onCardOpen = useCallback((b) => cardActions.current.open(b), []);
  const onCardRead = useCallback((b) => cardActions.current.read(b), []);
  const onCardBuy = useCallback((b) => cardActions.current.buy(b), []);
  const onCardFav = useCallback((e, id) => cardActions.current.fav(e, id), []);
  const partnerPct = partnerData ? (partnerData.discount_pct || 0) : null;

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

        /* no grey flash on tap + no 300ms tap delay on phones */
        *, *::before, *::after { -webkit-tap-highlight-color: transparent; }
        button, a, select, label, [role="button"] { touch-action: manipulation; }

        .font-cinzel { font-family: 'Cinzel', serif; letter-spacing: 0.03em; }

        /* PERF: removed the heavy drop-shadow filter on gradient text */
        .gold-text {
          background: linear-gradient(130deg, #b8720e 0%, #d4921a 22%, #e8b84b 48%, #f5d880 65%, #d4921a 82%, #b8720e 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Softer gold button. Only shadow/brightness is transitioned (framer-motion owns the scale, so no double animation) */
        .btn-gold {
          background: linear-gradient(145deg, #f3ca63 0%, #c48112 52%, #df9b22 100%);
          color: #150800;
          font-weight: 800;
          letter-spacing: 0.025em;
          transition: box-shadow 0.25s ease, filter 0.25s ease;
          box-shadow: 0 1px 0 rgba(255,235,160,0.6) inset, 0 -1px 0 rgba(0,0,0,0.3) inset, 0 5px 16px rgba(180,100,10,0.22);
        }
        @media (hover: hover) and (pointer: fine) {
          .btn-gold:hover:not(:disabled) {
            filter: brightness(1.05);
            box-shadow: 0 1px 0 rgba(255,235,160,0.7) inset, 0 -1px 0 rgba(0,0,0,0.3) inset, 0 8px 24px rgba(212,146,26,0.38);
          }
        }
        .btn-gold:active:not(:disabled) { filter: brightness(0.96); }
        .btn-gold:disabled { opacity: 0.75; cursor: not-allowed; }

        #nprogress .bar { background: #d4921a !important; height: 2px !important; }
        #nprogress .peg { box-shadow: 0 0 14px #d4921a, 0 0 6px #d4921a !important; }

        @keyframes scrollLeft { 0% { transform: translate3d(0, 0, 0); } 100% { transform: translate3d(-50%, 0, 0); } }
        .animate-scroll { animation: scrollLeft 28s linear infinite; display: inline-block; white-space: nowrap; will-change: transform; }

        .discount-badge {
          background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%) !important;
          color: #92400e !important;
          box-shadow: 0 3px 10px rgba(0,0,0,0.28), 0 0 0 1px rgba(245,158,11,0.3);
          font-weight: 900; letter-spacing: 0.03em;
        }

        /* Cards: framer-motion animates the movement, CSS only softens colours/shadows (no layer-per-card, no double animation) */
        .fast-anim {
          transition: box-shadow 0.35s ease, border-color 0.3s ease, background-color 0.3s ease;
        }

        .luminary-card { position: relative; isolation: isolate; }
        .luminary-card::before {
          content: ''; position: absolute; inset: 0; border-radius: 1.75rem;
          background: radial-gradient(ellipse at 25% 0%, rgba(245,158,11,0.12) 0%, rgba(255,255,255,0.03) 38%, transparent 70%);
          pointer-events: none; z-index: 0; opacity: 0; transition: opacity 0.4s ease;
        }
        .luminary-card:hover::before { opacity: 1; }
        .luminary-card:hover {
          box-shadow: 0 0 0 1px rgba(212,146,26,0.28), 0 16px 36px rgba(0,0,0,0.3);
        }
        /* FIX: badges are position:absolute; the old rule forced them to relative */
        .luminary-card > *:not(.absolute) { position: relative; z-index: 1; }
        .luminary-card > .absolute { z-index: 20; }

        /* CINEMATIC BACKGROUND MOTION + FLOATING GOLDEN SPIRITUAL PARTICLES (used by the Hero component) */
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
          box-shadow: 0 0 10px 2px rgba(245, 158, 11, 0.55);
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

        /* PERF: the full-screen film-grain overlay (blend-mode on the whole page) was removed. It was almost invisible but forced the
           browser to re-blend the entire screen while scrolling, which caused lag on phones. */

        ::-webkit-scrollbar { width: 3px; height: 3px; background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(212,146,26,0.22); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(212,146,26,0.42); }

        .custom-scrollbar { overscroll-behavior: contain; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(212,146,26,0.25); border-radius: 10px; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; overscroll-behavior-x: contain; }

        input:focus, select:focus { outline: none; box-shadow: 0 0 0 2px rgba(212,146,26,0.22), 0 0 14px rgba(212,146,26,0.08); }

        /* NEW ADDITION: profile avatar rings + checkout button shine */
        @keyframes spinSlow { to { transform: rotate(360deg); } }
        .avatar-ring { background: conic-gradient(from 0deg, #fde68a, #b8720e, #fff3c4, #d4921a, #f59e0b, #fde68a); animation: spinSlow 7s linear infinite; will-change: transform; }
        .avatar-ring-static { background: conic-gradient(from 200deg, #fde68a, #b8720e, #fff3c4, #d4921a, #fde68a); }

        /* Shine sweep now plays once when the mouse hovers a button (was: endless loop on every button = constant repaint) */
        @keyframes shineSweep { 0% { transform: translateX(-120%) skewX(-20deg); } 100% { transform: translateX(260%) skewX(-20deg); } }
        .btn-shine { position: relative; overflow: hidden; }
        .btn-shine::after { content: ''; position: absolute; top: 0; bottom: 0; left: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent); transform: translateX(-120%) skewX(-20deg); pointer-events: none; }
        @media (hover: hover) and (pointer: fine) {
          .btn-shine:hover::after { animation: shineSweep 0.9s ease-in-out 1; }
        }

        /* GOOGLE HERO BUTTON: static soft glow (the animated box-shadow pulse repainted every frame) */
        .google-hero-btn { box-shadow: 0 10px 26px -6px rgba(245, 158, 11, 0.35), 0 0 0 1px rgba(251, 191, 36, 0.55); }

        /* FOOTER NEO-CAPSULE BUTTONS */
        .footer-action-pill {
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s ease, color 0.3s ease, background-color 0.3s ease;
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

        /* While a popup / dashboard is open the page behind it is frozen: the layer opens instantly with zero lag */
        .ui-paused *, .ui-paused *::before, .ui-paused *::after { animation-play-state: paused !important; }

        /* iPhone Safari zooms the whole page when an input is smaller than 16px: this stops it */
        @supports (-webkit-touch-callout: none) {
          input, select, textarea { font-size: 16px !important; }
        }

        /* PHONES: switch off the endless decorative loops, keep the look */
        @media (max-width: 767px) {
          .avatar-ring, .cinema-bg, .hero-glow-2, .hero-glow-3 { animation: none; }
          .golden-particle:nth-child(n+6) { display: none; }
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; }
        }
      `}</style>

      {/* Floating Toasts */}
      <div className="fixed right-4 sm:right-6 z-[9999] flex flex-col gap-2.5 pointer-events-none max-w-[90vw]" style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.92, y: 10 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
              className={`pointer-events-auto px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold border shadow-[0_10px_28px_rgba(0,0,0,0.4)] flex items-center gap-2.5 ${
                toast.type === "success" ? "bg-emerald-950/95 border-emerald-400/35 text-emerald-300"
                  : toast.type === "error" ? "bg-red-950/95 border-red-400/35 text-red-300"
                  : "bg-amber-950/95 border-amber-400/35 text-amber-300"
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${toast.type === "success" ? "bg-emerald-400" : toast.type === "error" ? "bg-red-400" : "bg-amber-400"}`} />
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
            style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
            className={`fixed left-4 sm:left-6 z-[490] w-11 h-11 rounded-2xl border flex items-center justify-center shadow-[0_8px_22px_rgba(0,0,0,0.35)] transition-colors ${
              isDark
                ? "bg-[#111122]/95 border-amber-500/35 text-amber-400 hover:bg-amber-500/15"
                : "bg-white/95 border-amber-500/40 text-amber-600 hover:bg-amber-50"
            }`}
          >
            <ArrowUp size={18} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Sidebar Dashboard (solid panel + GPU slide = opens instantly, no blur lag) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 z-[5000]"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              style={{ willChange: "transform" }}
              className={`fixed inset-y-0 right-0 w-[23.5rem] max-w-[92vw] border-l z-[5001] shadow-[-10px_0_36px_rgba(0,0,0,0.4)] flex flex-col overflow-hidden rounded-l-[2rem] ${isDark ? 'bg-[#090915] border-white/[0.09] text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              {/* Soft Aurora Glow Behind Profile */}
              <div
                className="absolute inset-x-0 top-0 h-72 pointer-events-none"
                style={{ background: isDark
                  ? 'radial-gradient(125% 95% at 50% 0%, rgba(212,146,26,0.22) 0%, rgba(139,92,246,0.09) 48%, transparent 78%)'
                  : 'radial-gradient(125% 95% at 50% 0%, rgba(245,184,75,0.34) 0%, rgba(167,139,250,0.12) 48%, transparent 78%)' }}
              />

              {/* Header (No scroll) */}
              <div className="relative shrink-0 px-5 pt-5 pb-3 flex justify-between items-center border-b border-transparent">
                <span className="flex items-center gap-2.5 text-sm font-extrabold tracking-wide">
                  <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 border border-amber-500/35 text-amber-400 flex items-center justify-center">
                    <LayoutDashboard size={16}/>
                  </span>
                  <span>Reader Hub</span>
                </span>

                {/* Mini Tab Switcher inside Dashboard Header */}
                <div className={`flex p-1 rounded-full border text-[11px] font-bold ${isDark ? 'bg-black/40 border-white/[0.08]' : 'bg-slate-100 border-slate-200/80'}`}>
                  <button
                    onClick={() => setSidebarTab("overview")}
                    className={`px-2.5 py-1 rounded-full transition-colors ${sidebarTab === "overview" ? "bg-amber-500 text-[#150800] font-extrabold shadow-sm" : (isDark ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-900")}`}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => setSidebarTab("shelf")}
                    className={`px-2.5 py-1 rounded-full transition-colors flex items-center gap-1 ${sidebarTab === "shelf" ? "bg-amber-500 text-[#150800] font-extrabold shadow-sm" : (isDark ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-900")}`}
                  >
                    Shelf
                    {(purchasedBookIds.length + favorites.length) > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${sidebarTab === "shelf" ? "bg-black/20 text-[#150800]" : "bg-amber-500/20 text-amber-400"}`}>
                        {purchasedBookIds.length + favorites.length}
                      </span>
                    )}
                  </button>
                </div>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Close dashboard"
                  className={`p-2 rounded-2xl border transition-colors ${isDark ? 'bg-white/[0.04] border-white/[0.08] text-gray-400 hover:text-white hover:bg-white/[0.1]' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'}`}
                >
                  <X size={17}/>
                </motion.button>
              </div>

              {/* Scrollable Content Area */}
              <div className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar px-5 pb-6">

                {/* Profile Section: gold ring + crown + camera chip */}
                <div className="flex flex-col items-center text-center pt-5">
                  <motion.div
                    whileTap={{ scale: 0.96 }}
                    className="relative w-28 h-28 group cursor-pointer"
                    onClick={() => setShowAvatarPicker(true)}
                  >
                    <div className="avatar-ring absolute -inset-1.5 rounded-full opacity-95" />
                    <div className={`absolute inset-0 rounded-full ${isDark ? 'bg-[#090915]' : 'bg-white'}`} />
                    <div className="absolute inset-[4px] rounded-full overflow-hidden flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="avatar" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <UserCircle size={52} className="text-amber-500/50" />
                      )}
                    </div>
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 -rotate-6 w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-[#150800] flex items-center justify-center shadow-[0_3px_10px_rgba(212,146,26,0.5)] ring-2 ring-white/30">
                      <Crown size={15} />
                    </span>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center border-[3px] shadow-md ${isDark ? 'border-[#090915]' : 'border-white'}`}>
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
                    <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/[0.14] border border-amber-500/35 text-amber-400">
                      <Sparkles size={12} className="text-amber-400" />
                      <span className="text-[11px] font-extrabold tracking-wide">{readerTier}</span>
                    </div>
                    <button
                      onClick={() => setShowAvatarPicker(true)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors ${isDark ? 'bg-white/[0.04] border-white/[0.08] text-gray-300 hover:bg-white/[0.09]' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
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
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600"
                      />
                    </div>
                    <p className={`mt-1.5 text-[10px] font-semibold ${isDark ? "text-gray-400" : "text-slate-500"}`}>{nextTierText}</p>
                  </div>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {sidebarTab === "overview" ? (
                    <motion.div
                      key="overview-tab"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
                    >
                      {/* Live stats (from existing state) - interactive to switch to shelf */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSidebarTab("shelf")}
                          className={`rounded-2xl border p-3.5 cursor-pointer transition-colors hover:border-emerald-500/40 ${sideCard}`}
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
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSidebarTab("shelf")}
                          className={`rounded-2xl border p-3.5 cursor-pointer transition-colors hover:border-rose-500/40 ${sideCard}`}
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
                      <Link href="/reward-points" onClick={() => setIsSidebarOpen(false)} className="group relative mt-3 flex items-center gap-3.5 rounded-2xl p-4 overflow-hidden border border-amber-500/35 bg-gradient-to-br from-amber-500/[0.2] via-amber-500/[0.07] to-transparent hover:border-amber-500/60 transition-colors">
                        <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(212,146,26,0.35)]">
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

                      {/* Quick links (now close the dashboard when tapped) */}
                      <div className="mt-3 flex flex-col gap-2.5">
                        <Link href="/explore" onClick={() => setIsSidebarOpen(false)} className={`group flex items-center gap-3 rounded-2xl border p-3 transition-colors ${sideCard} hover:border-amber-500/40`}>
                          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400/25 to-indigo-500/10 text-sky-400 border border-sky-400/20 flex items-center justify-center shrink-0"><Compass size={19}/></span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-bold">Explore</span>
                            <span className={`block text-[11px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Discover more books</span>
                          </span>
                          <ChevronRight size={16} className={`transition-transform duration-200 group-hover:translate-x-0.5 ${isDark ? "text-gray-500" : "text-slate-400"}`} />
                        </Link>

                        <Link href="/quiz" onClick={() => setIsSidebarOpen(false)} className={`group flex items-center gap-3 rounded-2xl border p-3 transition-colors ${sideCard} hover:border-amber-500/40`}>
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
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
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
                                className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-colors hover:border-emerald-500/40 ${sideCard}`}
                              >
                                <div className="w-10 h-12 rounded-lg overflow-hidden bg-amber-500/10 border border-amber-500/20 shrink-0 flex items-center justify-center">
                                  {b.cover_path ? (
                                    <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${b.cover_path}`} alt={b.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
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
                                className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-colors hover:border-amber-500/40 ${sideCard}`}
                              >
                                <div className="w-10 h-12 rounded-lg overflow-hidden bg-amber-500/10 border border-amber-500/20 shrink-0 flex items-center justify-center">
                                  {b.cover_path ? (
                                    <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${b.cover_path}`} alt={b.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
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
              <div className={`relative shrink-0 p-4 border-t ${isDark ? 'border-white/[0.06] bg-black/30' : 'border-slate-200 bg-slate-50/90'}`} style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
                {showLogoutConfirm ? (
                  <div className="bg-red-500/[0.08] border border-red-500/[0.22] p-3.5 rounded-2xl text-center">
                    <p className={`text-xs font-bold mb-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Are you sure you want to log out?</p>
                    <div className="flex gap-2">
                      <button onClick={() => setShowLogoutConfirm(false)} className={`flex-1 text-xs font-bold py-2 rounded-xl transition-colors ${isDark ? 'bg-white/[0.07] text-white hover:bg-white/[0.12]' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}>Cancel</button>
                      <button onClick={confirmLogout} className="flex-1 bg-red-500/85 text-white text-xs font-bold py-2 rounded-xl hover:bg-red-500 transition-colors">Yes, Logout</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowLogoutConfirm(true)} className={`w-full font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm border ${isDark ? 'bg-white/[0.03] border-white/[0.07] text-red-400/85 hover:bg-red-500/10 hover:text-red-400' : 'bg-white border-slate-200 text-red-500 hover:bg-red-50'}`}>
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            onClick={() => setShowAvatarPicker(false)}
            className={`fixed inset-0 z-[6000] flex items-center justify-center p-4 ${isDark ? 'bg-black/85' : 'bg-slate-900/60'}`}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className={`border rounded-3xl p-6 w-full max-w-sm relative shadow-2xl ${isDark ? 'bg-[#0c0c1a] border-white/[0.08]' : 'bg-white border-slate-200'}`}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent rounded-full" />
              <button onClick={() => setShowAvatarPicker(false)} aria-label="Close" className={`absolute top-4 right-4 transition-colors p-1.5 rounded-xl ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/[0.08]' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}>
                <X size={18}/>
              </button>
              <h3 className={`text-lg font-bold text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>Choose your Avatar</h3>
              <p className={`text-xs text-center mt-1 mb-6 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Pick the one that feels like you</p>
              <div className="grid grid-cols-3 gap-4">
                {AVATARS.map((url, idx) => {
                  const isCurrent = profile?.avatar_url === url;
                  return (
                    <button key={idx} onClick={() => handleSaveAvatar(url)} className={`relative aspect-square rounded-full border-2 hover:border-amber-500/70 hover:scale-105 transition-all duration-200 ${isCurrent ? 'border-amber-500 shadow-[0_0_16px_rgba(212,146,26,0.35)]' : (isDark ? 'border-white/[0.1]' : 'border-slate-200')}`}>
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

      {/* COMPONENT INTEGRATION: BOOK DETAILS MODAL (wrapped in a crash shield) */}
      <AnimatePresence>
        {showBookDetails && selectedBook && (
          <SafeBoundary onClose={closeBookDetails} message="Could not open this book. Please try again.">
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
          </SafeBoundary>
        )}
      </AnimatePresence>

      {/* Auth Modal - HIGH-CONVERSION GOOGLE / GMAIL HERO DESIGN */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            onClick={() => setShowAuthModal(false)}
            className={`fixed inset-0 z-[2000] flex items-end sm:items-center justify-center p-0 sm:p-4 ${isDark ? 'bg-black/80' : 'bg-slate-900/60'}`}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 32 }}
              className={`border rounded-t-[2rem] sm:rounded-[2rem] p-6 sm:p-8 w-full max-w-md max-h-[94dvh] relative shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-y-auto overflow-x-hidden custom-scrollbar ${isDark ? 'bg-[#0b0b18] border-amber-500/20' : 'bg-white border-slate-200'}`}
            >
              {/* Soft Top Aura */}
              <div
                className="absolute inset-x-0 top-0 h-44 pointer-events-none"
                style={{
                  background: isDark
                    ? "radial-gradient(110% 90% at 50% 0%, rgba(245,158,11,0.18) 0%, rgba(59,130,246,0.07) 55%, transparent 80%)"
                    : "radial-gradient(110% 90% at 50% 0%, rgba(251,191,36,0.26) 0%, rgba(59,130,246,0.07) 55%, transparent 80%)"
                }}
              />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-56 h-[2px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent rounded-full" />

              {/* Mobile Drag Handle Pill */}
              <div className="w-10 h-1 rounded-full bg-gray-500/30 mx-auto mb-3 sm:hidden" />

              <button onClick={() => setShowAuthModal(false)} aria-label="Close" className={`absolute top-4 right-4 p-2 rounded-2xl transition-colors z-10 ${isDark ? 'bg-white/[0.06] text-gray-400 hover:text-white hover:bg-white/[0.12]' : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}>
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
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-emerald-400 via-amber-300 to-amber-500 text-[#150800] shadow-[0_3px_10px_rgba(245,158,11,0.35)]">
                    <Zap size={10} className="fill-current" /> Recommended • 1-Tap Gmail Login
                  </span>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className={`google-hero-btn btn-shine w-full py-3.5 px-4 rounded-2xl flex items-center justify-between gap-3 transition-colors font-extrabold text-sm sm:text-base border-2 cursor-pointer disabled:opacity-80 disabled:cursor-wait ${
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
                  className={`mb-3 flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border text-left transition-colors ${isDark ? 'bg-amber-500/[0.06] border-amber-500/25 hover:bg-amber-500/[0.12]' : 'bg-amber-50 border-amber-300/60 hover:bg-amber-100'}`}
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
                <input required type="email" name="email" autoComplete="username" inputMode="email" autoCapitalize="none" spellCheck={false} placeholder="Email address" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} className={`w-full px-4 py-3 rounded-xl outline-none focus:border-amber-500/50 transition-colors text-sm border ${isDark ? 'bg-white/[0.04] border-white/[0.09] text-white placeholder-gray-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`} />

                <div className="relative">
                  <input required id="vedoxa-auth-password" type={showPassword ? "text" : "password"} name="password" autoComplete={authForm.mode === 'login' ? 'current-password' : 'new-password'} placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} className={`w-full pl-4 pr-16 py-3 rounded-xl outline-none focus:border-amber-500/50 transition-colors text-sm border ${isDark ? 'bg-white/[0.04] border-white/[0.09] text-white placeholder-gray-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`} />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${isDark ? "text-gray-400 hover:text-white bg-white/[0.05]" : "text-slate-500 hover:text-slate-800 bg-slate-200/70"}`}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                <button type="submit" disabled={isAuthLoading} className="btn-gold py-3 rounded-xl font-bold text-sm mt-1 flex items-center justify-center gap-2">
                  {isAuthLoading && <RefreshCw size={15} className="animate-spin" />}
                  {authForm.mode === 'login' ? 'Login with Email' : 'Sign Up with Email'}
                </button>
              </form>

              <p className={`text-center mt-5 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-slate-600'}`}>
                {authForm.mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <span onClick={() => setAuthForm({...authForm, mode: authForm.mode === 'login' ? 'signup' : 'login'})} className="text-amber-500 font-extrabold cursor-pointer hover:text-amber-400 transition-colors underline underline-offset-4">
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
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            onClick={() => setShowCheckout(false)}
            className={`fixed inset-0 z-[3000] flex items-end sm:items-center justify-center sm:p-4 ${isDark ? 'bg-black/85' : 'bg-slate-900/60'}`}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 34 }}
              className={`border w-full sm:max-w-md max-h-[94dvh] flex flex-col relative shadow-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden ${isDark ? 'bg-[#0d0d1c] border-amber-500/[0.18] text-white' : 'bg-white border-amber-500/30 text-slate-900'}`}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent rounded-full" />

              {/* Header + book summary */}
              <div className={`shrink-0 px-5 pt-5 pb-4 border-b ${isDark ? 'border-white/[0.07]' : 'border-slate-100'}`}>
                <button onClick={() => setShowCheckout(false)} aria-label="Close" className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${isDark ? 'bg-white/[0.05] text-gray-500 hover:text-white hover:bg-white/[0.1]' : 'bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200'}`}>
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
                    <button type="button" onClick={() => { setShowCheckout(false); setShowAuthModal(true); }} className="flex items-center justify-between gap-2 w-full px-4 py-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.08] text-amber-500 text-sm font-bold hover:bg-amber-500/[0.14] transition-colors">
                      <span className="flex items-center gap-2"><UserCircle size={17}/> Login to continue your purchase</span>
                      <ChevronRight size={16} />
                    </button>
                  )}

                  <input name="name" autoComplete="name" placeholder="Full Name (Optional)" value={checkoutData.name} onChange={(e) => setCheckoutData({...checkoutData, name: e.target.value})} className={`w-full px-4 py-3 rounded-xl outline-none focus:border-amber-500/40 transition-colors text-sm border ${isDark ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`} />

                  <div className="flex gap-2">
                    <select value={checkoutData.countryCode} onChange={(e) => setCheckoutData({...checkoutData, countryCode: e.target.value})} className={`w-24 px-2 py-3 rounded-xl outline-none focus:border-amber-500/40 transition-colors cursor-pointer appearance-none text-sm border ${isDark ? 'bg-white/[0.04] border-white/[0.08] text-white' : 'bg-slate-50 border-slate-300 text-slate-900'}`}>
                      <option value="+91" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>🇮🇳 +91</option>
                      <option value="+1" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>🇺🇸 +1</option>
                      <option value="+44" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>🇬🇧 +44</option>
                      <option value="+61" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>🇦🇺 +61</option>
                      <option value="+971" className={isDark ? "bg-[#0c0c1a]" : "bg-white"}>🇦🇪 +971</option>
                    </select>
                    <input required autoFocus={!checkoutData.phone} type="tel" name="phone" autoComplete="tel-national" inputMode="numeric" placeholder="Phone Number" value={checkoutData.phone} onChange={(e) => setCheckoutData({...checkoutData, phone: e.target.value.replace(/\D/g, '')})} maxLength={checkoutData.countryCode === '+91' ? 10 : 15} className={`flex-1 min-w-0 px-4 py-3 rounded-xl outline-none focus:border-amber-500/40 transition-colors text-sm border ${isDark ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder-gray-600' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'}`} />
                  </div>

                  {/* Coupon: collapsed by default, Enter applies the coupon (does not submit the payment) */}
                  {(showCoupon || appliedCoupon) ? (
                    <div className="flex gap-2">
                      <input placeholder={t.haveCoupon} value={checkoutData.coupon} onChange={(e) => setCheckoutData({...checkoutData, coupon: e.target.value})} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); verifyCoupon(); } }} className="flex-1 min-w-0 px-4 py-3 rounded-xl bg-amber-500/[0.04] border border-dashed border-amber-500/25 text-amber-500 placeholder-amber-900 outline-none focus:border-amber-500/50 text-sm" />
                      <button type="button" onClick={verifyCoupon} className="px-5 rounded-xl bg-amber-500/[0.1] text-amber-500 font-bold hover:bg-amber-500/[0.2] transition-colors text-sm border border-amber-500/20">
                        {t.apply}
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setShowCoupon(true)} className="flex items-center gap-2 text-xs font-bold text-amber-500 hover:text-amber-400 transition-colors w-max">
                      <Tag size={14}/> {t.haveCoupon} <ChevronDown size={14}/>
                    </button>
                  )}

                  {profile?.reward_points > 0 && (
                    <label className="flex items-center gap-3 bg-emerald-500/[0.05] p-3 rounded-xl border border-emerald-500/[0.18] cursor-pointer hover:bg-emerald-500/[0.08] transition-colors">
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

                {/* Sticky footer: Pay button always visible (respects the iPhone home bar) */}
                <div className={`shrink-0 px-5 pt-3 border-t ${isDark ? 'border-white/[0.07] bg-[#0d0d1c]' : 'border-slate-100 bg-white'}`} style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
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
            transition={{ type: "tween", duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed inset-0 z-[4000] flex flex-col ${isDark ? 'bg-[#07070d]' : 'bg-slate-50'}`}
          >
            <div className={`px-4 py-3.5 md:px-6 border-b flex justify-between items-center z-10 ${isDark ? 'bg-[#07070d] border-white/[0.07]' : 'bg-white border-slate-200'}`} style={{ paddingTop: "calc(0.875rem + env(safe-area-inset-top))" }}>
              <div className="flex items-center gap-3">
                <BookOpen className="text-amber-500" size={20}/>
                <span className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>{t.pdfReader}</span>
              </div>
              <button onClick={() => setShowReader(false)} className="bg-red-500/[0.1] border border-red-500/20 text-red-400 px-4 py-2 rounded-xl font-bold hover:bg-red-500/20 transition-colors text-sm">
                {t.close}
              </button>
            </div>

            {/* SECURE CONTAINER WITH NO-RIGHT-CLICK AND NO-SELECT */}
            <div className="flex-1 min-h-0 w-full bg-[#07070d] relative overflow-hidden flex items-center justify-center select-none pointer-events-auto" onContextMenu={(e) => e.preventDefault()}>
              <SafeBoundary onClose={() => setShowReader(false)} message="The reader could not load. Please try again.">
                <FlipbookReader pdfUrl={readerUrl} />
              </SafeBoundary>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Main Layout ─────────────────────────────────────────── */}
      <div className={`min-h-screen flex flex-col overflow-x-hidden selection:bg-amber-500/20 page-root transition-colors duration-300 ${overlayOpen ? 'ui-paused' : ''} ${isDark ? 'bg-[#07070d] text-gray-200' : 'bg-[#f8fafc] text-slate-800'}`}>

        {partnerData && (
          <div className="w-full bg-blue-500/[0.12] border-b border-blue-500/25 py-2 px-4 text-center flex items-center justify-center gap-2">
            <Handshake size={15} className="text-blue-400"/>
            <span className="text-blue-300/90 text-xs md:text-sm font-bold tracking-wide uppercase">
              Partner Discount of {partnerData.discount_pct}% has been applied to all books!
            </span>
          </div>
        )}

        {/* Responsive Navbar: solid on phones (fast), soft glass on desktop */}
        <nav className={`sticky top-0 z-[500] px-3.5 py-3 md:px-8 md:py-3.5 md:backdrop-blur-xl border-b flex justify-between items-center transition-colors duration-300 ${isDark ? 'bg-[#07070d]/95 border-white/[0.07] shadow-[0_6px_24px_rgba(0,0,0,0.35)]' : 'bg-white/95 border-slate-200/90 shadow-sm'}`} style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />

          <Link href="/brand" className="flex items-center gap-2.5 md:gap-3 group shrink-0">
            <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full border border-amber-500/50 flex items-center justify-center shadow-[0_0_12px_rgba(212,146,26,0.35)] group-hover:shadow-[0_0_20px_rgba(212,146,26,0.6)] transition-shadow duration-300 ${isDark ? 'bg-[#0c0c1a]' : 'bg-white'}`}>
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
              className={`relative flex items-center border rounded-full px-3 py-1.5 transition-[width,border-color,box-shadow] duration-300 ease-out ${isSearchOpen ? 'w-44 sm:w-56 md:w-64 ring-2 ring-amber-500/25 border-amber-500/40' : 'w-10 hover:border-amber-500/35'} ${isDark ? 'bg-white/[0.045] border-white/[0.09]' : 'bg-slate-100/90 border-slate-200'}`}
            >
              <Search size={16} className="text-amber-500/80 cursor-pointer shrink-0 hover:text-amber-400 transition-colors" onClick={() => setIsSearchOpen(!isSearchOpen)} />
              {isSearchOpen && (
                <>
                  <input autoFocus type="text" placeholder="Search books..." className={`bg-transparent border-none outline-none text-xs ml-2 w-full ${isDark ? 'text-white placeholder-gray-500' : 'text-slate-900 placeholder-slate-400'}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  {searchQuery && (
                    <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear search" className="text-gray-400 hover:text-amber-500 p-0.5 shrink-0">
                      <X size={13} />
                    </button>
                  )}
                  {/* DROP DOWN SEARCH SUGGESTIONS */}
                  {searchQuery && (
                    <div className={`absolute top-full mt-3 right-0 w-64 sm:w-72 max-h-72 overflow-y-auto custom-scrollbar rounded-2xl border shadow-2xl z-[600] flex flex-col ${isDark ? 'bg-[#0c0c1a] border-white/[0.1]' : 'bg-white border-slate-200'}`}>
                      {filteredBooks.length > 0 ? (
                        filteredBooks.slice(0, 5).map(book => (
                          <div key={book.id} onClick={() => { openBookDetails(book); setIsSearchOpen(false); setSearchQuery(""); }} className={`px-3.5 py-2.5 text-sm cursor-pointer border-b last:border-b-0 transition-colors flex items-center gap-3 ${isDark ? 'border-white/[0.05] text-white hover:bg-white/[0.06]' : 'border-slate-100 text-slate-800 hover:bg-slate-50'}`}>
                            <div className="w-8 h-10 rounded-md overflow-hidden bg-amber-500/10 border border-amber-500/20 shrink-0 flex items-center justify-center">
                              {book.cover_path ? (
                                <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${book.cover_path}`} alt={book.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
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
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors shrink-0 ${
                isDark
                  ? "bg-white/[0.04] border-white/[0.09] text-amber-400 hover:bg-white/[0.09]"
                  : "bg-slate-100 border-slate-200 text-amber-600 hover:bg-slate-200"
              }`}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </motion.button>

            {/* Luxury Profile Capsule / Login CTA */}
            {user ? (
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open dashboard"
                className={`group relative flex items-center gap-2 border pl-1 pr-2.5 sm:pr-3 py-1 rounded-full transition-colors shrink-0 shadow-[0_3px_12px_rgba(212,146,26,0.14)] ${
                  isDark
                    ? 'bg-gradient-to-r from-amber-500/[0.12] via-white/[0.05] to-white/[0.03] border-amber-500/35 hover:border-amber-400/60'
                    : 'bg-gradient-to-r from-amber-50 via-white to-slate-50 border-amber-400/50 hover:border-amber-500'
                }`}
              >
                {/* Avatar with static conic gold ring + mini crown + online dot */}
                <span className="relative shrink-0">
                  <span className="avatar-ring-static absolute -inset-[2px] rounded-full opacity-95" />
                  <span className={`relative flex w-8 h-8 rounded-full overflow-hidden items-center justify-center border-2 ${isDark ? 'border-[#0c0c1a] bg-[#0c0c1a]' : 'border-white bg-white'}`}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" decoding="async" className="w-full h-full object-cover" />
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

        {/* ─── Dynamic Book Library Grid (Mobile-First Controls & Showcase Cards) ─── */}
        <section className="px-3.5 sm:px-6 pt-10 pb-8 md:pt-16 md:pb-14 w-full max-w-7xl mx-auto relative z-10">

          <motion.div initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col items-center mb-7 md:mb-10">
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

          {/* INTERACTIVE MOBILE-FIRST BOOK FILTER & SORT BAR */}
          <div className={`mb-7 p-2.5 sm:p-3 rounded-3xl border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 ${
            isDark ? 'bg-white/[0.025] border-white/[0.07] shadow-[0_6px_22px_rgba(0,0,0,0.28)]' : 'bg-white/95 border-slate-200/90 shadow-sm'
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
                    className={`relative px-3.5 py-2 rounded-2xl text-xs font-extrabold flex items-center gap-1.5 shrink-0 transition-colors ${
                      active
                        ? "text-[#150800] shadow-[0_3px_12px_rgba(212,146,26,0.3)]"
                        : isDark
                        ? "text-gray-400 hover:text-white hover:bg-white/[0.04]"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="activeBookFilterBubble"
                        transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 -z-10"
                      />
                    )}
                    <IconComp size={13} className={active ? "text-[#150800]" : "text-amber-500"} />
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
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
                  className="bg-transparent border-none outline-none w-full min-w-0 text-xs placeholder:opacity-60"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear filter" className="text-gray-400 hover:text-amber-500">
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
                  aria-label="Sort books"
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
                initial={{ opacity: 0, scale: 0.97 }}
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
              displayedBooks.map((book, i) => (
                <BookCard
                  key={book.id}
                  book={book}
                  index={i}
                  isDark={isDark}
                  isPurchased={purchasedBookIds.includes(book.id)}
                  isFav={favorites.includes(book.id)}
                  isBurst={likedBurstId === book.id}
                  partnerPct={partnerPct}
                  readLabel={t.readNow}
                  buyLabel={t.buyNow}
                  onOpen={onCardOpen}
                  onRead={onCardRead}
                  onBuy={onCardBuy}
                  onFav={onCardFav}
                />
              ))
            )}
          </div>
        </section>

        {/* Compact, Animated Footer Dock (About Us, Safe & Secure, Instant PDF, Share Page) */}
        <footer className={`py-6 px-4 w-full flex flex-col items-center border-t mt-auto relative z-10 ${isDark ? 'bg-gradient-to-b from-[#07070d] to-[#0a0a16] border-white/[0.06]' : 'bg-gradient-to-b from-slate-50 to-slate-100/80 border-slate-200'}`}>
          <div className={`w-full max-w-3xl rounded-3xl border p-3 sm:p-4 ${
            isDark
              ? 'bg-white/[0.025] border-white/[0.08] shadow-[0_8px_28px_rgba(0,0,0,0.4)]'
              : 'bg-white/95 border-slate-200/90 shadow-[0_8px_24px_rgba(15,23,42,0.05)]'
          }`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* 1. About Us */}
              <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
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
                whileHover={{ y: -2 }}
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
                whileHover={{ y: -2 }}
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
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShare}
                className="footer-action-pill btn-shine cursor-pointer px-3 py-2.5 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 text-amber-400 hover:border-amber-400 flex items-center justify-center gap-2 text-xs font-extrabold shadow-[0_3px_12px_rgba(212,146,26,0.15)]"
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
        <div className={`w-full py-5 flex flex-col items-center border-b relative z-10 ${isDark ? 'bg-[#090914] border-white/[0.04]' : 'bg-slate-100 border-slate-200'}`} style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
          <p className={`text-[10px] font-bold mb-3.5 tracking-widest uppercase ${isDark ? 'text-gray-600' : 'text-slate-500'}`}>Trusted By & Verified Secure</p>
          <div className="flex flex-wrap justify-center items-center gap-5 md:gap-10 opacity-75 hover:opacity-100 transition-opacity duration-500 px-4">
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
