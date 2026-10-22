// @ts-nocheck
"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  ChevronLeft,
  Zap,
  ShieldAlert,
  Sparkles,
  Rocket,
  KeyRound,
  UserPlus,
  TrendingUp,
  Eye,
  DollarSign,
  WalletCards,
  Send,
  Mail,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  QrCode,
  Calculator,
  Award,
  Share2,
  Youtube,
  Instagram,
  MessageSquare,
  Flame,
  Crown,
  Sliders,
  EyeOff,
  Edit3,
  ExternalLink,
  Layers,
  ArrowUpRight,
  Gift,
  HelpCircle,
  Wand2
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

const supabaseUrl =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_URL) ||
  "https://placeholder.supabase.co";
const supabaseKey =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
  "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

// Safe Link wrapper that works seamlessly in Next.js and isolated previews
const Link = ({ href, className, children, ...props }) => (
  <a href={href} className={className} {...props}>
    {children}
  </a>
);

const CREATOR_TIERS = [
  {
    name: "Rising Creator",
    minSales: 0,
    maxSales: 25,
    commission: "40%",
    color: "from-blue-400 to-cyan-400",
    border: "border-blue-500/30",
    badgeBg: "bg-blue-500/10 text-blue-300",
    perk: "40% Base Commission + Weekly UPI Payouts"
  },
  {
    name: "Silver Influencer",
    minSales: 25,
    maxSales: 100,
    commission: "42%",
    color: "from-indigo-400 to-purple-400",
    border: "border-purple-500/30",
    badgeBg: "bg-purple-500/10 text-purple-300",
    perk: "Priority Support + Custom Discount Banner"
  },
  {
    name: "Gold Icon",
    minSales: 100,
    maxSales: 300,
    commission: "45%",
    color: "from-amber-300 to-orange-500",
    border: "border-amber-500/40",
    badgeBg: "bg-amber-500/10 text-amber-300",
    perk: "45% Boosted Cut + Instant Express Payouts"
  },
  {
    name: "Diamond Legend",
    minSales: 300,
    maxSales: 1000,
    commission: "50%",
    color: "from-fuchsia-400 via-pink-400 to-rose-400",
    border: "border-pink-500/40",
    badgeBg: "bg-pink-500/10 text-pink-300",
    perk: "50% VIP Revenue Share + Dedicated Manager"
  }
];

export default function SelfPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dashboard States: LOADING, UNAUTHORIZED, ENTER_CODE, SETUP_PROFILE, DASHBOARD
  const [viewState, setViewState] = useState("LOADING");
  const [affiliateData, setAffiliateData] = useState(null);

  // Forms & Inputs
  const [codeInput, setCodeInput] = useState("");
  const [setupForm, setSetupForm] = useState({
    fullName: "",
    channelName: "",
    paymentUpi: ""
  });
  const [toast, setToast] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Chat States
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatRef = useRef(null);

  const [activeTab, setActiveTab] = useState("OVERVIEW"); // OVERVIEW, PROMO_KIT, CALCULATOR, SUPPORT
  const [copiedKey, setCopiedKey] = useState(null);
  const [selectedSourceTag, setSelectedSourceTag] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [streamerPrivacyMode, setStreamerPrivacyMode] = useState(false);

  // Interactive Earnings Calculator States
  const [calcViews, setCalcViews] = useState(25000);
  const [calcCtr, setCalcCtr] = useState(4.5); // % of viewers who click link
  const [calcConv, setCalcConv] = useState(6.0); // % of clicks that buy
  const [bookPrice, setBookPrice] = useState(299); // Avg book price in ₹

  // Inline UPI Editor State
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [newUpiInput, setNewUpiInput] = useState("");

  // Demo / Preview Sandbox Controller (auto-detects if Supabase is placeholder)
  const isPlaceholderSupabase = supabaseUrl.includes("placeholder.supabase.co");
  const [demoModeBarOpen, setDemoModeBarOpen] = useState(isPlaceholderSupabase);

  useEffect(() => {
    checkPartnerStatus();
  }, []);

  useEffect(() => {
    // Scroll chat to bottom when new messages arrive
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const copyToClipboard = (text, label = "Copied to clipboard!", key = "main") => {
    try {
      if (navigator?.clipboard?.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const el = document.createElement("textarea");
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2200);
      showToast(label, "success");
    } catch (e) {
      showToast("Could not copy automatically", "error");
    }
  };

  const checkPartnerStatus = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession();

      if (sessionError || !session?.user) {
        // If running in preview with placeholder Supabase, load interactive preview experience
        if (isPlaceholderSupabase) {
          const mockUser = { id: "demo-influencer-01", email: "creator@vedoxa.shop" };
          setUser(mockUser);
          const demoAff = {
            user_id: mockUser.id,
            partner_code: "VDX8A9B2",
            full_name: "Aarav Sharma",
            channel_name: "Spiritual Mind & Growth",
            payment_upi: "aaravcreator@okaxis",
            clicks: 4820,
            sales: 142,
            total_earned: 17040,
            total_paid: 12500
          };
          setAffiliateData(demoAff);
          setNewUpiInput(demoAff.payment_upi);
          setMessages([
            {
              affiliate_id: mockUser.id,
              sender_type: "admin",
              message:
                "Welcome to Vedoxa VIP Partner Studio, Aarav! 🎉 Your custom 40% commission link is active.",
              created_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
              affiliate_id: mockUser.id,
              sender_type: "affiliate",
              message: "Thank you! Dropping a new YouTube video tomorrow with the link in description.",
              created_at: new Date(Date.now() - 42000000).toISOString()
            },
            {
              affiliate_id: mockUser.id,
              sender_type: "admin",
              message:
                "Awesome! Let us know if you need any custom promo banners or early review copies.",
              created_at: new Date(Date.now() - 3600000).toISOString()
            }
          ]);
          setViewState("DASHBOARD");
          setLoading(false);
          return;
        }

        setViewState("UNAUTHORIZED");
        setLoading(false);
        return;
      }

      setUser(session.user);

      // Check if user is already an affiliate
      const { data: aff, error } = await supabase
        .from("affiliates")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (aff && !error) {
        setAffiliateData(aff);
        setNewUpiInput(aff.payment_upi || "");
        fetchMessages(session.user.id);
        setViewState("DASHBOARD");
      } else {
        setViewState("ENTER_CODE");
      }
    } catch (err) {
      setViewState("UNAUTHORIZED");
    }
    setLoading(false);
  };

  const fetchMessages = async (userId) => {
    try {
      const { data } = await supabase
        .from("affiliate_messages")
        .select("*")
        .eq("affiliate_id", userId)
        .order("created_at", { ascending: true });
      if (data) setMessages(data);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const handleVerifyCode = async () => {
    if (codeInput.length !== 8) {
      return showToast("Code must be 8 characters long!", "error");
    }
    setIsProcessing(true);

    try {
      // Demo fallback if using placeholder URL
      if (isPlaceholderSupabase && codeInput.toUpperCase() === "VDX8A9B2") {
        setTimeout(() => {
          showToast("Code Verified! Please complete your profile.", "success");
          setViewState("SETUP_PROFILE");
          setIsProcessing(false);
        }, 600);
        return;
      }

      // Check code in database
      const { data: codeData, error } = await supabase
        .from("affiliate_codes")
        .select("*")
        .eq("code", codeInput.toUpperCase())
        .single();

      if (error || !codeData) {
        showToast("Invalid Partner Code!", "error");
      } else if (codeData.is_claimed) {
        showToast("This code has already been claimed!", "error");
      } else {
        showToast("Code Verified! Please complete your profile.", "success");
        setViewState("SETUP_PROFILE");
      }
    } catch (err) {
      showToast("Verification error. Please try again.", "error");
    }
    setIsProcessing(false);
  };

  const handleSetupProfile = async () => {
    if (!setupForm.fullName || !setupForm.channelName || !setupForm.paymentUpi) {
      return showToast("Please fill all details", "error");
    }
    setIsProcessing(true);

    try {
      const cleanCode = (codeInput || "VDX8A9B2").toUpperCase();
      const currentUserId = user?.id || "demo-influencer-01";

      if (!isPlaceholderSupabase) {
        // 1. Mark code as claimed
        await supabase
          .from("affiliate_codes")
          .update({ is_claimed: true, claimed_by: currentUserId })
          .eq("code", cleanCode);
      }

      // 2. Create Affiliate Profile
      const newAffiliate = {
        user_id: currentUserId,
        partner_code: cleanCode,
        full_name: setupForm.fullName,
        channel_name: setupForm.channelName,
        payment_upi: setupForm.paymentUpi,
        clicks: 0,
        sales: 0,
        total_earned: 0,
        total_paid: 0
      };

      if (!isPlaceholderSupabase) {
        const { error } = await supabase.from("affiliates").insert([
          {
            user_id: newAffiliate.user_id,
            partner_code: newAffiliate.partner_code,
            full_name: newAffiliate.full_name,
            channel_name: newAffiliate.channel_name,
            payment_upi: newAffiliate.payment_upi
          }
        ]);
        if (error) throw error;
      }

      setAffiliateData(newAffiliate);
      setNewUpiInput(newAffiliate.payment_upi);
      showToast("Welcome to the Partner Program! 🎉", "success");
      setViewState("DASHBOARD");
    } catch (err) {
      showToast(err.message || "Setup failed", "error");
    }
    setIsProcessing(false);
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = typeof customText === "string" ? customText : chatInput;
    if (!textToSend.trim()) return;

    const currentUserId = user?.id || affiliateData?.user_id || "demo-influencer-01";
    const newMsg = {
      affiliate_id: currentUserId,
      sender_type: "affiliate",
      message: textToSend.trim()
    };

    // Optimistic UI update
    setMessages((prev) => [
      ...prev,
      { ...newMsg, created_at: new Date().toISOString() }
    ]);
    if (typeof customText !== "string") setChatInput("");

    if (!isPlaceholderSupabase) {
      await supabase.from("affiliate_messages").insert([newMsg]);
    }
  };

  const handleUpdateUpi = async () => {
    if (!newUpiInput.trim()) return showToast("Please enter a valid UPI ID", "error");
    setIsProcessing(true);
    try {
      if (!isPlaceholderSupabase && user?.id) {
        const { error } = await supabase
          .from("affiliates")
          .update({ payment_upi: newUpiInput.trim() })
          .eq("user_id", user.id);
        if (error) throw error;
      }
      setAffiliateData((prev) => ({ ...prev, payment_upi: newUpiInput.trim() }));
      setIsEditingUpi(false);
      showToast("Payout UPI ID updated successfully!", "success");
    } catch (err) {
      showToast("Could not update UPI ID", "error");
    }
    setIsProcessing(false);
  };

  const baseAffiliateLink = `https://vedoxa.shop/?partner=${
    affiliateData?.partner_code || "VDX8A9B2"
  }`;
  const fullAffiliateLink = selectedSourceTag
    ? `${baseAffiliateLink}&utm_source=${selectedSourceTag}`
    : baseAffiliateLink;

  const handleCopyLink = () => {
    copyToClipboard(fullAffiliateLink, "Magic Affiliate Link Copied! ✨", "main_link");
  };

  const stats = useMemo(() => {
    const clicks = Number(affiliateData?.clicks || 0);
    const sales = Number(affiliateData?.sales || 0);
    const totalEarned = Number(affiliateData?.total_earned || 0);
    const totalPaid = Number(affiliateData?.total_paid || 0);
    const pendingPayout = Math.max(0, totalEarned - totalPaid);
    const conversionRate = clicks > 0 ? ((sales / clicks) * 100).toFixed(1) : "0.0";
    const epc = clicks > 0 ? (totalEarned / clicks).toFixed(1) : "0.0";

    // Determine current tier & next tier
    let currentTierIndex = 0;
    for (let i = 0; i < CREATOR_TIERS.length; i++) {
      if (sales >= CREATOR_TIERS[i].minSales) {
        currentTierIndex = i;
      }
    }
    const currentTier = CREATOR_TIERS[currentTierIndex];
    const nextTier = CREATOR_TIERS[currentTierIndex + 1] || null;
    const progressPercent = nextTier
      ? Math.min(
          100,
          Math.round(
            ((sales - currentTier.minSales) /
              (nextTier.minSales - currentTier.minSales)) *
              100
          )
        )
      : 100;

    return {
      clicks,
      sales,
      totalEarned,
      totalPaid,
      pendingPayout,
      conversionRate,
      epc,
      currentTier,
      nextTier,
      progressPercent
    };
  }, [affiliateData]);

  // Viral Calculator Projections
  const calcProjections = useMemo(() => {
    const estimatedClicks = Math.round(calcViews * (calcCtr / 100));
    const estimatedSales = Math.round(estimatedClicks * (calcConv / 100));
    const commissionPerBook = Math.round(bookPrice * 0.4); // 40% commission
    const estimatedEarnings = estimatedSales * commissionPerBook;
    const monthlyPotential = estimatedEarnings * 4; // Assuming 4 videos/reels a month
    return {
      estimatedClicks,
      estimatedSales,
      commissionPerBook,
      estimatedEarnings,
      monthlyPotential
    };
  }, [calcViews, calcCtr, calcConv, bookPrice]);

  // Ready-to-use promotional templates for influencers
  const promoTemplates = useMemo(
    () => [
      {
        id: "yt_desc",
        platform: "YouTube Description",
        icon: Youtube,
        accent: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        title: "High-Converting Video Description Box",
        text: `📚 Transform Your Mindset — Grab the Exclusive eBook Bundle here (Special Partner Discount Applied!): \n👉 ${fullAffiliateLink}\n\n✨ Use my official partner link above to unlock instant access & bonus chapters!`
      },
      {
        id: "yt_pin",
        platform: "Pinned Comment",
        icon: MessageSquare,
        accent: "text-blue-400 bg-blue-500/10 border-blue-500/20",
        title: "Pinned Comment Hook (Boosts Clicks by 3x)",
        text: `🔥 Many of you were asking for the book link I mentioned in the video! Get it here with an exclusive discount: ${fullAffiliateLink} ❤️`
      },
      {
        id: "ig_story",
        platform: "Instagram Bio / Story",
        icon: Instagram,
        accent: "text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/20",
        title: "Instagram Story Sticker / Bio CTA",
        text: `⚡ Must-Read Life Changing Book! Tap here for my follower-only discount 👇\n${fullAffiliateLink}`
      },
      {
        id: "wa_tg",
        platform: "Telegram / WhatsApp Channel",
        icon: Share2,
        accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        title: "Community Broadcast Post",
        text: `Hey fam! 🌟 Calling out everyone who wants to level up this week. I've partnered with Vedoxa to bring you a special deal on their bestselling books.\n\nClaim yours now 👉 ${fullAffiliateLink}`
      }
    ],
    [fullAffiliateLink]
  );

  return (
    <div className="min-h-screen bg-[#050509] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Multi-layered Soft Ambient Aura Background */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[650px] h-[650px] bg-indigo-600/12 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute top-1/3 -right-32 w-[550px] h-[550px] bg-purple-600/10 blur-[140px] rounded-full" />
        <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px"
          }}
        />
      </div>

      {/* Floating Glass Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 420, damping: 28 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none"
          >
            <div
              className={`px-5 py-3 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl font-semibold text-sm border flex items-center gap-3 ${
                toast.type === "success"
                  ? "bg-emerald-950/80 text-emerald-300 border-emerald-500/40"
                  : toast.type === "error"
                  ? "bg-rose-950/80 text-rose-300 border-rose-500/40"
                  : "bg-indigo-950/80 text-indigo-300 border-indigo-500/40"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle size={18} className="text-rose-400 shrink-0" />
              )}
              <span>{toast.msg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal for Influencers */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQrModal(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0d0e17] border border-white/15 rounded-[2rem] p-7 max-w-sm w-full text-center shadow-[0_0_70px_rgba(99,102,241,0.25)] relative overflow-hidden"
            >
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-44 h-44 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-3">
                <Sparkles size={13} /> Creator Overlay QR
              </div>
              <h3 className="text-xl font-black text-white mb-1">
                Scan to Shop on Vedoxa
              </h3>
              <p className="text-xs text-slate-400 mb-5">
                Add this QR code to your YouTube videos, Shorts, or Instagram Stories!
              </p>

              <div className="bg-white p-4 rounded-3xl inline-block shadow-2xl mb-5">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                    fullAffiliateLink
                  )}&margin=8`}
                  alt="Partner Affiliate QR Code"
                  className="w-48 h-48 rounded-xl"
                />
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 truncate mb-5">
                {fullAffiliateLink}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  <Copy size={15} /> Copy Link
                </button>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="px-5 bg-white/10 hover:bg-white/15 text-slate-200 font-bold py-3 rounded-xl text-sm transition"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Glass Header Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#050509]/70 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/20 px-4 py-2.5 rounded-2xl text-white font-semibold text-sm transition-all duration-200 shadow-sm"
          >
            <ChevronLeft
              size={18}
              className="text-slate-400 group-hover:text-white group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2.5">
            {viewState === "DASHBOARD" && (
              <button
                onClick={() => {
                  setStreamerPrivacyMode(!streamerPrivacyMode);
                  showToast(
                    !streamerPrivacyMode
                      ? "Creator Flex Mode On: Personal UPI hidden for screen recording!"
                      : "Privacy Mode Off: Full details visible",
                    "info"
                  );
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
                  streamerPrivacyMode
                    ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                    : "bg-white/[0.04] text-slate-400 border-white/[0.08] hover:text-white"
                }`}
                title="Hide sensitive UPI ID while taking screenshots or recording reels"
              >
                {streamerPrivacyMode ? <EyeOff size={15} /> : <Eye size={15} />}
                <span className="hidden sm:inline">
                  {streamerPrivacyMode ? "Streamer Safe Mode" : "Flex Mode"}
                </span>
              </button>
            )}

            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-xs font-bold text-indigo-300">
              <Crown size={14} className="text-amber-400" />
              <span>Vedoxa Creator Studio</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-6xl mx-auto w-full flex-1 flex flex-col px-4 sm:px-6 py-8">
        {}
        {loading || viewState === "LOADING" ? (
          <div className="flex-1 flex flex-col items-center justify-center py-32">
            <div className="relative mb-6">
              <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(99,102,241,0.2)]">
                <RefreshCw className="animate-spin text-indigo-400" size={34} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-4 border-[#050509] animate-ping" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">
              Syncing Creator Studio...
            </h3>
            <p className="text-slate-400 text-sm">
              Verifying your exclusive partner credentials
            </p>
          </div>
        ) : viewState === "UNAUTHORIZED" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="my-auto text-center py-16 px-6 bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/10 rounded-[2.5rem] max-w-lg mx-auto w-full backdrop-blur-2xl shadow-2xl relative overflow-hidden"
          >
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-56 h-56 bg-rose-500/15 blur-3xl rounded-full pointer-events-none" />
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-6 text-rose-400 shadow-lg">
              <ShieldAlert size={38} />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-bold uppercase tracking-wider mb-3">
              Members Only Zone
            </span>
            <h2 className="text-3xl font-black text-white mb-2">
              Creator Access Required
            </h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              Please sign in to your Vedoxa account to unlock your Influencer
              Partner Portal, track real-time royalties, and grab your custom link.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-[0_10px_30px_rgba(79,70,229,0.35)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Go to Login</span>
              <ArrowUpRight size={18} />
            </Link>
          </motion.div>
        ) : viewState === "ENTER_CODE" ? (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="max-w-md mx-auto w-full my-auto py-8"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-3xl border border-indigo-500/30 text-indigo-400 mb-6 shadow-[0_0_40px_rgba(99,102,241,0.2)]"
              >
                <KeyRound size={36} />
              </motion.div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold mb-3">
                <Sparkles size={12} /> VIP Invitation Portal
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
                Unlock Partner Studio
              </h1>
              <p className="text-slate-400 text-sm">
                Enter your 8-character secret invitation code provided by the
                Vedoxa Admin team.
              </p>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-7 sm:p-8 rounded-[2rem] shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Secret Partner Code
                </label>
                <span className="text-xs font-mono text-indigo-400">
                  {codeInput.length}/8 chars
                </span>
              </div>

              <input
                type="text"
                placeholder="VDX8A9B2"
                maxLength={8}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) =>
                  e.key === "Enter" && codeInput.length === 8 && handleVerifyCode()
                }
                className="w-full bg-black/60 border border-white/15 focus:border-indigo-500 rounded-2xl px-4 py-4 text-white text-center font-mono text-2xl tracking-[0.45em] outline-none mb-4 uppercase transition-all shadow-inner placeholder:text-slate-700"
              />

              {/* Visual 8-character indicator pills */}
              <div className="grid grid-cols-8 gap-1.5 mb-6">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      idx < codeInput.length
                        ? "bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={isProcessing || codeInput.length < 8}
                className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:opacity-95 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(79,70,229,0.3)]"
              >
                {isProcessing ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <Zap size={18} />
                  </>
                )}
              </button>

              {isPlaceholderSupabase && (
                <button
                  onClick={() => setCodeInput("VDX8A9B2")}
                  className="w-full mt-3 py-2 text-xs text-indigo-300/80 hover:text-indigo-200 font-medium transition"
                >
                  ✨ Tap to auto-fill demo code:{" "}
                  <span className="font-mono font-bold underline">VDX8A9B2</span>
                </button>
              )}
            </div>
          </motion.div>
        ) : viewState === "SETUP_PROFILE" ? (
          <motion.div
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="max-w-lg mx-auto w-full my-auto py-6"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500/15 rounded-3xl border border-purple-500/30 text-purple-400 mb-4 shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <UserPlus size={30} />
              </div>
              <h1 className="text-3xl font-black text-white mb-2">
                Creator Profile Setup
              </h1>
              <p className="text-slate-400 text-sm">
                Tell us about your creator channel & where we should send your
                weekly 40% royalties.
              </p>
            </div>

            <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/10 p-7 sm:p-8 rounded-[2rem] shadow-2xl flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Your Full Name / Creator Alias
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={setupForm.fullName}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, fullName: e.target.value })
                  }
                  className="w-full bg-black/50 border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3.5 text-white outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  YouTube Channel / Instagram Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. @SpiritualWisdomOfficial"
                  value={setupForm.channelName}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, channelName: e.target.value })
                  }
                  className="w-full bg-black/50 border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3.5 text-white outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                  Instant Payout UPI ID / Bank Handle
                </label>
                <input
                  type="text"
                  placeholder="yourname@okaxis"
                  value={setupForm.paymentUpi}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, paymentUpi: e.target.value })
                  }
                  className="w-full bg-black/50 border border-white/10 focus:border-purple-500 rounded-2xl px-4 py-3.5 text-white font-mono outline-none transition"
                />
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Payouts are processed automatically every week to this UPI ID.
                </p>
              </div>

              <button
                onClick={handleSetupProfile}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-bold py-4 rounded-2xl mt-2 transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(147,51,234,0.3)]"
              >
                {isProcessing ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Launch My Creator Studio</span>
                    <Rocket size={18} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-7 w-full pb-16"
          >
            {/* 1. LUXURY HERO CREATOR BANNER + TIER BADGE */}
            <div className="relative bg-gradient-to-br from-[#0d0f1d] via-[#090a12] to-[#110c1d] border border-white/10 rounded-[2.25rem] p-6 sm:p-10 overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.65)]">
              {/* Soft animated spotlights */}
              <div className="absolute -top-24 left-1/3 w-96 h-96 bg-indigo-500/15 blur-[100px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-24 right-10 w-80 h-80 bg-purple-500/15 blur-[90px] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* Left: Verified Influencer Identity */}
                <div className="text-center lg:text-left flex-1">
                  <div className="inline-flex flex-wrap items-center justify-center lg:justify-start gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-wider uppercase">
                      <Sparkles size={13} className="text-indigo-400" /> Verified
                      Creator Partner
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold ${stats.currentTier.badgeBg} ${stats.currentTier.border}`}
                    >
                      <Award size={13} /> {stats.currentTier.name} (
                      {stats.currentTier.commission} Cut)
                    </span>
                  </div>

                  <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-indigo-200 tracking-tight leading-none mb-3">
                    {affiliateData?.full_name || "Creator Partner"}
                  </h1>

                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-slate-400">
                    <span className="inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.07] px-3.5 py-1.5 rounded-xl">
                      <Youtube size={15} className="text-rose-400" />
                      <span>Channel:</span>
                      <strong className="text-white">
                        {affiliateData?.channel_name}
                      </strong>
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white/[0.04] border border-white/[0.07] px-3.5 py-1.5 rounded-xl font-mono text-xs">
                      <span>Code:</span>
                      <strong className="text-indigo-400">
                        {affiliateData?.partner_code}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Right: Creator Tier Milestone Progress Card */}
                <div className="w-full lg:w-80 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-5 shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Flame size={14} className="text-amber-400" /> Creator Level
                    </span>
                    <span className="text-xs font-bold text-indigo-300">
                      {stats.sales} / {stats.nextTier ? stats.nextTier.minSales : "MAX"}{" "}
                      Sales
                    </span>
                  </div>

                  <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden mb-2.5 p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.progressPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${stats.currentTier.color}`}
                    />
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    {stats.nextTier ? (
                      <>
                        Sell{" "}
                        <strong className="text-white">
                          {stats.nextTier.minSales - stats.sales} more books
                        </strong>{" "}
                        to unlock{" "}
                        <span className="text-amber-300 font-semibold">
                          {stats.nextTier.name} ({stats.nextTier.commission} Cut)
                        </span>
                      </>
                    ) : (
                      <span className="text-emerald-300 font-semibold">
                        🏆 Maximum Diamond Legend Tier Unlocked!
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. MAGIC AFFILIATE LINK & SMART CAMPAIGN TAGGER */}
            <div className="bg-gradient-to-r from-indigo-950/30 via-white/[0.03] to-purple-950/30 backdrop-blur-2xl border border-indigo-500/25 rounded-[2rem] p-6 sm:p-7 shadow-xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                    <Wand2 size={14} /> High-Conversion Partner Link
                  </div>
                  <h3 className="text-xl font-black text-white">
                    Your Magic Affiliate Link
                  </h3>
                  <p className="text-sm text-slate-400">
                    Anyone who buys through this link gets an automatic{" "}
                    <span className="text-white font-semibold">
                      Partner Discount
                    </span>
                    , and you earn an instant{" "}
                    <span className="text-emerald-400 font-bold">
                      40% commission
                    </span>
                    !
                  </p>
                </div>

                {/* Link Box + Copy + QR Code Actions */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
                  <div className="bg-black/60 border border-indigo-500/30 text-indigo-300 px-4 py-3.5 rounded-2xl font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap flex-1 lg:w-80 flex items-center justify-between gap-2 shadow-inner">
                    <span className="truncate">{fullAffiliateLink}</span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={handleCopyLink}
                      className="flex-1 sm:flex-initial bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition whitespace-nowrap flex items-center justify-center gap-2 shadow-[0_10px_25px_rgba(79,70,229,0.35)]"
                    >
                      {copiedKey === "main_link" ? (
                        <>
                          <Check size={17} /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={17} /> Copy Link
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowQrModal(true)}
                      className="bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-white p-3.5 rounded-2xl transition flex items-center justify-center"
                      title="Generate Video / Story QR Code"
                    >
                      <QrCode size={20} />
                    </motion.button>
                  </div>
                </div>
              </div>

              {/* Quick Platform Tracking Tag Pills */}
              <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 mr-1">
                  Platform Tag (Optional):
                </span>
                {[
                  { label: "Default Link", value: "" },
                  { label: "🎬 YouTube Video", value: "youtube" },
                  { label: "⚡ YT Shorts", value: "yt_shorts" },
                  { label: "📸 Instagram Bio", value: "ig_bio" },
                  { label: "💬 Pinned Comment", value: "pinned_comment" }
                ].map((tag) => (
                  <button
                    key={tag.value}
                    onClick={() => setSelectedSourceTag(tag.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedSourceTag === tag.value
                        ? "bg-indigo-500/25 text-indigo-200 border border-indigo-500/50"
                        : "bg-white/[0.03] text-slate-400 border border-white/[0.06] hover:text-white hover:bg-white/[0.07]"
                    }`}
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. CORE STATS GRID + CONVERSION INSIGHTS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Link Views */}
              <motion.div
                whileHover={{ y: -3 }}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-blue-500/30 p-5 sm:p-6 rounded-3xl transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                    <Eye size={22} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300">
                    Live Traffic
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Link Views
                </p>
                <p className="text-3xl sm:text-4xl font-black text-white">
                  {stats.clicks.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Avg ₹{stats.epc} earned per click
                </p>
              </motion.div>

              {/* Books Sold */}
              <motion.div
                whileHover={{ y: -3 }}
                className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] hover:border-purple-500/30 p-5 sm:p-6 rounded-3xl transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <TrendingUp size={22} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300">
                    {stats.conversionRate}% Conv.
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Books Sold
                </p>
                <p className="text-3xl sm:text-4xl font-black text-white">
                  {stats.sales.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Verified partner orders
                </p>
              </motion.div>

              {/* Total Earned */}
              <motion.div
                whileHover={{ y: -3 }}
                className="bg-gradient-to-br from-emerald-950/40 via-[#08120e] to-black border border-emerald-500/25 hover:border-emerald-500/45 p-5 sm:p-6 rounded-3xl transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                    <DollarSign size={22} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300">
                    40% Royalty
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Total Earned
                </p>
                <p className="text-3xl sm:text-4xl font-black text-emerald-400">
                  ₹{stats.totalEarned.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-emerald-500/70 mt-2">
                  ₹{stats.totalPaid.toLocaleString("en-IN")} already paid out
                </p>
              </motion.div>

              {/* Pending Payout */}
              <motion.div
                whileHover={{ y: -3 }}
                className="bg-gradient-to-br from-amber-950/40 via-[#140e06] to-black border border-amber-500/25 hover:border-amber-500/45 p-5 sm:p-6 rounded-3xl transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                    <WalletCards size={22} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300">
                    Weekly Cycle
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Pending Payout
                </p>
                <p className="text-3xl sm:text-4xl font-black text-amber-400">
                  ₹{stats.pendingPayout.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-amber-500/70 mt-2">
                  Direct to your saved UPI
                </p>
              </motion.div>
            </div>

            {/* 4. CREATOR TOOLKIT NAVIGATION TABS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/[0.08]">
              {[
                {
                  id: "OVERVIEW",
                  label: "Live Support & Payout Info",
                  icon: MessageSquare
                },
                {
                  id: "PROMO_KIT",
                  label: "Viral Captions & Promo Kit",
                  icon: Sparkles,
                  badge: "NEW"
                },
                {
                  id: "CALCULATOR",
                  label: "Influencer Earnings Calculator",
                  icon: Calculator
                },
                {
                  id: "TIERS",
                  label: "Creator Tiers & Perks",
                  icon: Crown
                }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-5 py-3.5 rounded-t-2xl font-bold text-sm transition-all flex items-center gap-2.5 whitespace-nowrap ${
                      isActive
                        ? "text-white bg-white/[0.06] border-t border-x border-white/10"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.02]"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={isActive ? "text-indigo-400" : "text-slate-500"}
                    />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
                        {tab.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeCreatorTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {}
            {activeTab === "OVERVIEW" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-3 gap-6 lg:h-[540px]"
              >
                {/* Left Column: Partner Payout Info & Editable UPI */}
                <div className="lg:col-span-1 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col gap-5 justify-between">
                  <div className="space-y-5">
                    <div>
                      <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                        <Rocket size={14} /> Payout Settings
                      </div>
                      <h3 className="text-xl font-black text-white">
                        Partner Info & UPI
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Your royalties are cleared every week directly to your
                        registered UPI handle with zero processing fees.
                      </p>
                    </div>

                    {/* UPI Card with Privacy Mode + Edit option */}
                    <div className="bg-black/50 border border-white/10 p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                          Saved Payout UPI ID
                        </p>
                        <button
                          onClick={() => setIsEditingUpi(!isEditingUpi)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                        >
                          <Edit3 size={12} /> {isEditingUpi ? "Cancel" : "Edit"}
                        </button>
                      </div>

                      {isEditingUpi ? (
                        <div className="flex gap-2 mt-2">
                          <input
                            type="text"
                            value={newUpiInput}
                            onChange={(e) => setNewUpiInput(e.target.value)}
                            placeholder="yourname@upi"
                            className="flex-1 bg-white/5 border border-indigo-500/40 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                          />
                          <button
                            onClick={handleUpdateUpi}
                            disabled={isProcessing}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm font-mono text-emerald-300 break-all font-semibold">
                          {streamerPrivacyMode
                            ? "••••••••••@upi (Hidden)"
                            : affiliateData?.payment_upi || "Not configured"}
                        </p>
                      )}
                    </div>

                    {/* Quick Influencer Tips Box */}
                    <div className="bg-indigo-500/[0.07] border border-indigo-500/20 rounded-2xl p-4 space-y-2">
                      <p className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                        <Zap size={14} /> Pro Influencer Tip
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        Pinning your magic link in the{" "}
                        <strong className="text-white">Top Comment</strong> of
                        your YouTube video or Reel increases book sales by up to{" "}
                        <span className="text-emerald-400 font-bold">3.2x</span>!
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/[0.06]">
                    <p className="text-xs text-slate-500 text-center mb-3">
                      Need formal invoice or priority sponsorship support?
                    </p>
                    <a
                      href="mailto:vedoxa1@gmail.com"
                      className="w-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-white text-sm font-bold transition"
                    >
                      <Mail size={17} className="text-indigo-400" /> Email VIP
                      Support
                    </a>
                  </div>
                </div>

                {/* Right Column: Direct Live Chat with Admin */}
                <div className="lg:col-span-2 bg-[#0b0c14] border border-indigo-500/25 rounded-3xl flex flex-col overflow-hidden relative shadow-[0_0_40px_rgba(79,70,229,0.08)] h-[480px] lg:h-full">
                  {/* Chat Header */}
                  <div className="bg-black/50 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm">
                          VX
                        </div>
                        <span className="w-3 h-3 bg-emerald-500 border-2 border-[#0b0c14] rounded-full absolute -bottom-0.5 -right-0.5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                          Direct VIP Admin Concierge
                        </h3>
                        <p className="text-xs text-indigo-400">
                          Dedicated Partner Manager • Replies within hours
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        user?.id && !isPlaceholderSupabase && fetchMessages(user.id)
                      }
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition"
                      title="Refresh messages"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>

                  {/* Chat Messages Scroll Container */}
                  <div
                    ref={chatRef}
                    className="flex-1 overflow-y-auto p-5 sm:p-6 flex flex-col gap-3.5 scroll-smooth"
                  >
                    <div className="text-center text-[11px] text-slate-500 bg-white/[0.02] border border-white/[0.05] rounded-full py-1 px-4 mx-auto my-1">
                      🔒 End-to-End Encrypted Partner Concierge Channel
                    </div>

                    {messages.map((msg, i) => {
                      const isMe = msg.sender_type === "affiliate";
                      return (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={i}
                          className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                            isMe
                              ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white self-end rounded-tr-xs shadow-lg"
                              : "bg-white/[0.07] border border-white/10 text-slate-200 self-start rounded-tl-xs"
                          }`}
                        >
                          <p>{msg.message}</p>
                          {msg.created_at && (
                            <span
                              className={`block text-[10px] mt-1 ${
                                isMe ? "text-indigo-200/80 text-right" : "text-slate-500"
                              }`}
                            >
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </span>
                          )}
                        </motion.div>
                      );
                    })}

                    {messages.length === 0 && (
                      <div className="m-auto text-center max-w-xs space-y-2">
                        <MessageSquare
                          size={32}
                          className="text-indigo-400/50 mx-auto"
                        />
                        <p className="text-slate-300 font-semibold text-sm">
                          Start a conversation with Admin!
                        </p>
                        <p className="text-slate-500 text-xs">
                          Ask about payouts, custom promo graphics, or special
                          giveaway copies for your subscribers.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick One-Tap Influencer Message Chips */}
                  <div className="px-4 py-2 bg-black/30 border-t border-white/[0.05] flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {[
                      "👋 Requesting weekly payout status",
                      "🎨 Need promo banners for my next video",
                      "🚀 Just posted a new video with link!"
                    ].map((quickMsg, idx) => (
                      <button
                        key={idx}
                        onClick={() => setChatInput(quickMsg)}
                        className="text-[11px] bg-white/[0.04] hover:bg-indigo-500/20 border border-white/[0.08] hover:border-indigo-500/40 text-slate-300 px-3 py-1.5 rounded-full whitespace-nowrap transition"
                      >
                        {quickMsg}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input Bar */}
                  <div className="p-4 bg-black/60 border-t border-white/10 flex gap-2.5">
                    <input
                      type="text"
                      placeholder="Message your Partner Manager..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 bg-white/[0.05] border border-white/10 focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm text-white outline-none transition"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!chatInput.trim()}
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-5 rounded-2xl transition disabled:opacity-40 flex items-center justify-center shadow-lg"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {}
            {activeTab === "PROMO_KIT" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-2 gap-5"
              >
                {promoTemplates.map((tpl) => {
                  const Icon = tpl.icon;
                  return (
                    <div
                      key={tpl.id}
                      className="bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-indigo-500/30 rounded-3xl p-6 flex flex-col justify-between gap-4 transition-all"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${tpl.accent}`}
                          >
                            <Icon size={14} /> {tpl.platform}
                          </span>
                          <span className="text-[11px] text-slate-500 font-medium">
                            Auto-filled with your code
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white mb-2">
                          {tpl.title}
                        </h4>
                        <pre className="bg-black/50 border border-white/[0.07] rounded-2xl p-4 text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
                          {tpl.text}
                        </pre>
                      </div>

                      <button
                        onClick={() =>
                          copyToClipboard(
                            tpl.text,
                            `${tpl.platform} script copied!`,
                            tpl.id
                          )
                        }
                        className="w-full bg-white/[0.06] hover:bg-indigo-600 text-white font-bold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-2 border border-white/10 hover:border-indigo-500"
                      >
                        {copiedKey === tpl.id ? (
                          <>
                            <Check size={15} /> Copied Script!
                          </>
                        ) : (
                          <>
                            <Copy size={15} /> Copy Ready-to-Post Caption
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {}
            {activeTab === "CALCULATOR" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 grid lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-7 space-y-6">
                  <div>
                    <div className="inline-flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
                      <Sliders size={14} /> Revenue Simulator
                    </div>
                    <h3 className="text-2xl font-black text-white">
                      Estimate Your Next Video / Reel Payout
                    </h3>
                    <p className="text-sm text-slate-400">
                      Slide to see how much you can earn at{" "}
                      <strong className="text-emerald-400">40% commission</strong>{" "}
                      from a single shoutout!
                    </p>
                  </div>

                  {/* Slider 1: Expected Views */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 font-semibold">
                        Expected Video / Reel Views
                      </span>
                      <span className="font-mono font-black text-indigo-400">
                        {calcViews.toLocaleString("en-IN")} views
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1000}
                      max={500000}
                      step={1000}
                      value={calcViews}
                      onChange={(e) => setCalcViews(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  {/* Slider 2: Link Click-Through Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 font-semibold">
                        Link Click-Through Rate (CTR)
                      </span>
                      <span className="font-mono font-black text-purple-400">
                        {calcCtr}% ({calcProjections.estimatedClicks.toLocaleString("en-IN")}{" "}
                        clicks)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.5}
                      max={15}
                      step={0.5}
                      value={calcCtr}
                      onChange={(e) => setCalcCtr(Number(e.target.value))}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* Slider 3: Purchase Conversion Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 font-semibold">
                        Buyer Conversion Rate
                      </span>
                      <span className="font-mono font-black text-emerald-400">
                        {calcConv}% ({calcProjections.estimatedSales} sales)
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={20}
                      step={0.5}
                      value={calcConv}
                      onChange={(e) => setCalcConv(Number(e.target.value))}
                      className="w-full accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Output Card */}
                <div className="lg:col-span-5 bg-gradient-to-br from-indigo-950/60 via-[#0b0d1a] to-purple-950/50 border border-indigo-500/30 rounded-3xl p-6 sm:p-7 text-center space-y-5 shadow-2xl">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                    Estimated Creator Royalty (1 Video)
                  </span>

                  <div>
                    <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      ₹{calcProjections.estimatedEarnings.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5">
                      Based on ~{calcProjections.estimatedSales} books sold @ ₹
                      {calcProjections.commissionPerBook} commission/book
                    </p>
                  </div>

                  <div className="bg-black/40 border border-white/10 rounded-2xl p-4">
                    <p className="text-xs text-slate-400 mb-1">
                      If you post 4 videos/reels a month:
                    </p>
                    <p className="text-2xl font-black text-emerald-400">
                      ₹{calcProjections.monthlyPotential.toLocaleString("en-IN")}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        / month
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={handleCopyLink}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl text-sm transition flex items-center justify-center gap-2"
                  >
                    <Copy size={16} /> Copy My Link & Start Promoting
                  </button>
                </div>
              </motion.div>
            )}

            {}
            {activeTab === "TIERS" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
              >
                {CREATOR_TIERS.map((tier, idx) => {
                  const isUnlocked = stats.sales >= tier.minSales;
                  const isCurrent = stats.currentTier.name === tier.name;
                  return (
                    <div
                      key={tier.name}
                      className={`rounded-3xl p-6 border transition-all flex flex-col justify-between relative overflow-hidden ${
                        isCurrent
                          ? "bg-gradient-to-b from-indigo-950/50 to-black border-indigo-500/50 shadow-[0_0_35px_rgba(99,102,241,0.15)]"
                          : isUnlocked
                          ? "bg-white/[0.04] border-emerald-500/30"
                          : "bg-white/[0.02] border-white/[0.07] opacity-75"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${tier.badgeBg} ${tier.border}`}
                          >
                            Tier {idx + 1}
                          </span>
                          {isCurrent ? (
                            <span className="text-[11px] font-black text-indigo-300 uppercase">
                              ● Current
                            </span>
                          ) : isUnlocked ? (
                            <span className="text-[11px] font-bold text-emerald-400">
                              ✓ Unlocked
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500">
                              {tier.minSales}+ Sales
                            </span>
                          )}
                        </div>

                        <h4 className="text-lg font-black text-white mb-1">
                          {tier.name}
                        </h4>
                        <p
                          className={`text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r ${tier.color} mb-3`}
                        >
                          {tier.commission} Cut
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {tier.perk}
                        </p>
                      </div>

                      <div className="mt-5 pt-3 border-t border-white/[0.06] text-[11px] text-slate-400 font-mono">
                        Requirement: {tier.minSales} Books Sold
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}
          </motion.div>
        )}
      </main>

      {}
      <div className="fixed bottom-4 right-4 z-50">
        {demoModeBarOpen ? (
          <div className="bg-[#0e101c]/95 backdrop-blur-2xl border border-indigo-500/30 rounded-2xl p-3 shadow-2xl flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-indigo-300 px-2 flex items-center gap-1">
              <Layers size={13} /> Preview Screen:
            </span>
            {[
              { id: "DASHBOARD", label: "VIP Dashboard" },
              { id: "ENTER_CODE", label: "Enter Code" },
              { id: "SETUP_PROFILE", label: "Setup Profile" },
              { id: "UNAUTHORIZED", label: "Locked View" }
            ].map((st) => (
              <button
                key={st.id}
                onClick={() => {
                  setLoading(false);
                  if (st.id === "DASHBOARD" && !affiliateData) {
                    setAffiliateData({
                      user_id: "demo-influencer-01",
                      partner_code: "VDX8A9B2",
                      full_name: "Aarav Sharma",
                      channel_name: "Spiritual Mind & Growth",
                      payment_upi: "aaravcreator@okaxis",
                      clicks: 4820,
                      sales: 142,
                      total_earned: 17040,
                      total_paid: 12500
                    });
                  }
                  setViewState(st.id);
                }}
                className={`px-2.5 py-1.5 rounded-xl font-semibold transition ${
                  viewState === st.id
                    ? "bg-indigo-600 text-white"
                    : "bg-white/5 text-slate-400 hover:text-white"
                }`}
              >
                {st.label}
              </button>
            ))}
            <button
              onClick={() => setDemoModeBarOpen(false)}
              className="ml-1 px-2 py-1 text-slate-400 hover:text-white"
              title="Minimize preview bar"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setDemoModeBarOpen(true)}
            className="bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 backdrop-blur-xl text-indigo-300 px-3.5 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 transition"
          >
            <Layers size={13} /> Switch Portal View
          </button>
        )}
      </div>
    </div>
  );
}
