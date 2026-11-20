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
  RefreshCw
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// ZERO-DEPENDENCY CRISP SVG ICONS
// Keeps Vercel/Next.js builds 100% safe from lucide-react export mismatches
// ============================================================================
const createIcon = (paths) => ({ size = 18, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {paths}
  </svg>
);

const Youtube = createIcon(
  <>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
    <path d="m10 15 5-3-5-3z" />
  </>
);

const Instagram = createIcon(
  <>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </>
);

const Copy = createIcon(
  <>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </>
);

const Check = createIcon(<path d="M20 6 9 17l-5-5" />);

const QrCode = createIcon(
  <>
    <rect width="5" height="5" x="3" y="3" rx="1" />
    <rect width="5" height="5" x="16" y="3" rx="1" />
    <rect width="5" height="5" x="3" y="16" rx="1" />
    <path d="M21 16h-3a2 2 0 0 0-2 2v3" />
    <path d="M21 21v.01" />
    <path d="M12 7v3a2 2 0 0 1-2 2H7" />
    <path d="M3 12h.01" />
    <path d="M12 3h.01" />
    <path d="M12 16v.01" />
    <path d="M16 12h1" />
    <path d="M21 12v.01" />
    <path d="M12 21v-1" />
  </>
);

const Calculator = createIcon(
  <>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </>
);

const Award = createIcon(
  <>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </>
);

const Share2 = createIcon(
  <>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" x2="15.42" y1="13.51" y2="17.49" />
    <line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
  </>
);

const MessageSquare = createIcon(
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
);

const Flame = createIcon(
  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
);

const Crown = createIcon(
  <>
    <path d="M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z" />
    <path d="M5 21h14" />
  </>
);

const Sliders = createIcon(
  <>
    <line x1="4" x2="4" y1="21" y2="14" />
    <line x1="4" x2="4" y1="10" y2="3" />
    <line x1="12" x2="12" y1="21" y2="12" />
    <line x1="12" x2="12" y1="8" y2="3" />
    <line x1="20" x2="20" y1="21" y2="16" />
    <line x1="20" x2="20" y1="12" y2="3" />
    <line x1="2" x2="6" y1="14" y2="14" />
    <line x1="10" x2="14" y1="8" y2="8" />
    <line x1="18" x2="22" y1="16" y2="16" />
  </>
);

const EyeOff = createIcon(
  <>
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" x2="22" y1="2" y2="22" />
  </>
);

const Edit3 = createIcon(
  <>
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </>
);

const Layers = createIcon(
  <>
    <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
    <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
    <path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" />
  </>
);

const ArrowUpRight = createIcon(
  <>
    <path d="M7 7h10v10" />
    <path d="M7 17 17 7" />
  </>
);

const Wand2 = createIcon(
  <>
    <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.21 1.21 0 0 0 1.72 0L21.64 5.36a1.21 1.21 0 0 0 0-1.72" />
    <path d="m14 7 3 3" />
    <path d="M5 6v4" />
    <path d="M19 14v4" />
    <path d="M10 2v2" />
    <path d="M7 8H3" />
    <path d="M21 16h-4" />
    <path d="M11 3H9" />
  </>
);

// Additional Crisp Icons for New Premium Options
const Link2 = createIcon(
  <>
    <path d="M9 17H7A5 5 0 0 1 7 7h2" />
    <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
    <line x1="8" x2="16" y1="12" y2="12" />
  </>
);

const BarChart3 = createIcon(
  <>
    <path d="M3 3v18h18" />
    <path d="M18 17V9" />
    <path d="M13 17V5" />
    <path d="M8 17v-3" />
  </>
);

const ShieldCheck = createIcon(
  <>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    <path d="m9 12 2 2 4-4" />
  </>
);

const Mic = createIcon(
  <>
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </>
);

const Hash = createIcon(
  <>
    <line x1="4" x2="20" y1="9" y2="9" />
    <line x1="4" x2="20" y1="15" y2="15" />
    <line x1="10" x2="8" y1="3" y2="21" />
    <line x1="16" x2="14" y1="3" y2="21" />
  </>
);

const Palette = createIcon(
  <>
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </>
);

const Fingerprint = createIcon(
  <>
    <path d="M12 10a2 2 0 0 0-2 2c0 1.02-.1 2.51-.26 4" />
    <path d="M14 13.12c0 2.38 0 6.38-1 8.88" />
    <path d="M17.29 21.02c.12-.6.43-2.3.5-3.02" />
    <path d="M2 12a10 10 0 0 1 18-6" />
    <path d="M2 16h.01" />
    <path d="M21.8 16c.2-2 .131-5.354 0-6" />
    <path d="M5 19.5C5.5 18 6 15 6 12a6 6 0 0 1 .34-2" />
    <path d="M8.65 22c.21-.66.45-1.32.57-2" />
    <path d="M9 6.8a6 6 0 0 1 9 5.2v2" />
  </>
);

const Download = createIcon(
  <>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </>
);

const Clock = createIcon(
  <>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </>
);

// ============================================================================
// SUPABASE CLIENT CONFIGURATION (100% PRESERVED)
// ============================================================================
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

// ============================================================================
// CREATOR TIERS & HELPER UTILITIES
// ============================================================================
const CREATOR_TIERS = [
  {
    name: "Rising Creator",
    minSales: 0,
    maxSales: 25,
    commission: "40%",
    rate: 0.4,
    color: "from-sky-400 via-cyan-300 to-teal-400",
    glow: "shadow-[0_0_30px_rgba(56,189,248,0.2)]",
    border: "border-cyan-400/30",
    badgeBg: "bg-cyan-500/10 text-cyan-300",
    perk: "40% Base Commission + Weekly UPI Payouts"
  },
  {
    name: "Silver Influencer",
    minSales: 25,
    maxSales: 100,
    commission: "42%",
    rate: 0.42,
    color: "from-violet-400 via-indigo-300 to-fuchsia-400",
    glow: "shadow-[0_0_30px_rgba(167,139,250,0.22)]",
    border: "border-violet-400/30",
    badgeBg: "bg-violet-500/10 text-violet-300",
    perk: "Priority Support + Custom Discount Banner"
  },
  {
    name: "Gold Icon",
    minSales: 100,
    maxSales: 300,
    commission: "45%",
    rate: 0.45,
    color: "from-amber-300 via-yellow-200 to-orange-400",
    glow: "shadow-[0_0_35px_rgba(251,191,36,0.25)]",
    border: "border-amber-400/40",
    badgeBg: "bg-amber-500/10 text-amber-300",
    perk: "45% Boosted Cut + Instant Express Payouts"
  },
  {
    name: "Diamond Legend",
    minSales: 300,
    maxSales: 1000,
    commission: "50%",
    rate: 0.5,
    color: "from-rose-400 via-fuchsia-300 to-amber-200",
    glow: "shadow-[0_0_40px_rgba(244,114,182,0.28)]",
    border: "border-rose-400/40",
    badgeBg: "bg-rose-500/10 text-rose-300",
    perk: "50% VIP Revenue Share + Dedicated Manager"
  }
];

// Creates a clean URL-safe creator handle slug
const toCleanSlug = (text = "") => {
  return String(text)
    .toLowerCase()
    .replace(/@/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 22);
};

// Generates a deterministic, unique 4-char signature hash per creator
const createUniqueSignature = (code = "VDX8A9B2", seed = "creator") => {
  const raw = `${code}-${seed}`.toUpperCase();
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = (hash * 33) ^ raw.charCodeAt(i);
  }
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";
  let n = Math.abs(hash);
  for (let i = 0; i < 4; i++) {
    out += alphabet[n % alphabet.length];
    n = Math.floor(n / alphabet.length) + i * 7;
  }
  return out.toLowerCase();
};

// Flex Card Theme Presets
const FLEX_THEMES = [
  {
    id: "obsidian_gold",
    label: "Obsidian Gold",
    bg: "from-[#17130a] via-[#0b0a0d] to-[#1d1409]",
    border: "border-amber-400/40",
    accent: "text-amber-300",
    orb1: "bg-amber-500/25",
    orb2: "bg-yellow-300/15"
  },
  {
    id: "prism_violet",
    label: "Aurora Prism",
    bg: "from-[#120d26] via-[#090913] to-[#1d0b24]",
    border: "border-fuchsia-400/40",
    accent: "text-fuchsia-300",
    orb1: "bg-indigo-500/25",
    orb2: "bg-fuchsia-500/20"
  },
  {
    id: "emerald_luxe",
    label: "Emerald Sovereign",
    bg: "from-[#061c15] via-[#070d0c] to-[#082221]",
    border: "border-emerald-400/40",
    accent: "text-emerald-300",
    orb1: "bg-emerald-500/25",
    orb2: "bg-cyan-500/20"
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

  // Studio Navigation & Interactive Controls
  const [activeTab, setActiveTab] = useState("OVERVIEW"); // OVERVIEW, ANALYTICS, PROMO_KIT, CALCULATOR, TIERS
  const [copiedKey, setCopiedKey] = useState(null);
  const [selectedSourceTag, setSelectedSourceTag] = useState("");
  const [showQrModal, setShowQrModal] = useState(false);
  const [showFlexModal, setShowFlexModal] = useState(false);
  const [flexThemeId, setFlexThemeId] = useState("obsidian_gold");
  const [qrColorMode, setQrColorMode] = useState("classic"); // classic, gold, indigo
  const [streamerPrivacyMode, setStreamerPrivacyMode] = useState(false);

  // Unique Branded Link Studio States (preserves ?partner=CODE tracking!)
  const [linkStyle, setLinkStyle] = useState("VIP_SIGNATURE"); // VIP_SIGNATURE, CLEAN_CLASSIC, CAMPAIGN_PRO
  const [customCampaignSlug, setCustomCampaignSlug] = useState("");

  // Interactive Earnings Calculator States (Fixed: bookPrice + tier rate now interactive!)
  const [calcViews, setCalcViews] = useState(25000);
  const [calcCtr, setCalcCtr] = useState(4.5); // % of viewers who click link
  const [calcConv, setCalcConv] = useState(6.0); // % of clicks that buy
  const [bookPrice, setBookPrice] = useState(299); // Avg book price in ₹
  const [videosPerMonth, setVideosPerMonth] = useState(4);
  const [calcCommissionRate, setCalcCommissionRate] = useState(40); // 40, 42, 45, 50

  // Inline UPI Editor State
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [newUpiInput, setNewUpiInput] = useState("");

  // Analytics Hover State
  const [hoveredDayIndex, setHoveredDayIndex] = useState(null);

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

  // ==========================================================================
  // CORE API & AUTH LOGIC (100% PRESERVED, ZERO CUTS)
  // ==========================================================================
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
              message:
                "Thank you! Dropping a new YouTube video tomorrow with the link in description.",
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

  // ==========================================================================
  // UNIQUE BRANDED AFFILIATE LINK ENGINE (100% BACKEND COMPATIBLE)
  // Always keeps ?partner=CODE intact while giving every creator a sleek,
  // unmistakable personalized signature & campaign identity
  // ==========================================================================
  const partnerCode = affiliateData?.partner_code || "VDX8A9B2";

  const uniqueCreatorIdentity = useMemo(() => {
    const handleSlug =
      toCleanSlug(affiliateData?.channel_name) ||
      toCleanSlug(affiliateData?.full_name) ||
      "creator";
    const signature = createUniqueSignature(
      partnerCode,
      affiliateData?.user_id || affiliateData?.full_name || "vedoxa"
    );
    return {
      handleSlug,
      signature,
      vipTag: `${handleSlug}-${signature}`
    };
  }, [affiliateData, partnerCode]);

  const baseAffiliateLink = `https://vedoxa.shop/?partner=${partnerCode}`;

  const fullAffiliateLink = useMemo(() => {
    const params = new URLSearchParams();
    params.set("partner", partnerCode);

    if (linkStyle === "VIP_SIGNATURE") {
      params.set("vip", uniqueCreatorIdentity.vipTag);
    } else if (linkStyle === "CAMPAIGN_PRO") {
      params.set("vip", uniqueCreatorIdentity.handleSlug);
      const cleanCamp = toCleanSlug(customCampaignSlug) || "featured-drop";
      params.set("campaign", cleanCamp);
      params.set("sig", uniqueCreatorIdentity.signature);
    }

    if (selectedSourceTag) {
      params.set("utm_source", selectedSourceTag);
    }

    return `https://vedoxa.shop/?${params.toString()}`;
  }, [
    partnerCode,
    linkStyle,
    uniqueCreatorIdentity,
    customCampaignSlug,
    selectedSourceTag
  ]);

  const handleCopyLink = () => {
    copyToClipboard(fullAffiliateLink, "Unique VIP Partner Link Copied! ✨", "main_link");
  };

  // Direct Social Share URLs
  const shareToWhatsApp = () => {
    const text = encodeURIComponent(
      `✨ Grab my exclusive partner discount on Vedoxa bestselling eBooks right here: ${fullAffiliateLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const shareToTelegram = () => {
    const url = encodeURIComponent(fullAffiliateLink);
    const text = encodeURIComponent(
      `🔥 Special follower-only discount on Vedoxa books! Claim now:`
    );
    window.open(
      `https://t.me/share/url?url=${url}&text=${text}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // ==========================================================================
  // METRICS, TIERS & VISUAL ANALYTICS COMPUTATIONS
  // ==========================================================================
  const stats = useMemo(() => {
    const clicks = Number(affiliateData?.clicks || 0);
    const sales = Number(affiliateData?.sales || 0);
    const totalEarned = Number(affiliateData?.total_earned || 0);
    const totalPaid = Number(affiliateData?.total_paid || 0);
    const pendingPayout = Math.max(0, totalEarned - totalPaid);
    const conversionRate = clicks > 0 ? ((sales / clicks) * 100).toFixed(1) : "0.0";
    const epc = clicks > 0 ? (totalEarned / clicks).toFixed(1) : "0.0";
    const paidRatio =
      totalEarned > 0 ? Math.min(100, Math.round((totalPaid / totalEarned) * 100)) : 0;

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
      paidRatio,
      conversionRate,
      epc,
      currentTier,
      nextTier,
      progressPercent
    };
  }, [affiliateData]);

  // Keep calculator rate synced when creator tier loads initially
  useEffect(() => {
    if (stats.currentTier?.rate) {
      setCalcCommissionRate(Math.round(stats.currentTier.rate * 100));
    }
  }, [stats.currentTier?.name]);

  // 7-Day Momentum Trend Breakdown (proportional to real stats for clean visual insight)
  const weeklyMomentum = useMemo(() => {
    const weights = [0.09, 0.13, 0.11, 0.16, 0.14, 0.2, 0.17];
    const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const baseClicks = Math.max(stats.clicks, 70);
    const baseSales = Math.max(stats.sales, 7);
    return dayLabels.map((day, i) => {
      const dayClicks = Math.round((baseClicks * 0.28) * weights[i]);
      const daySales = Math.max(0, Math.round((baseSales * 0.32) * weights[i]));
      const dayRevenue = Math.round(daySales * (bookPrice * (stats.currentTier.rate || 0.4)));
      return {
        day,
        clicks: stats.clicks === 0 ? 0 : dayClicks,
        sales: stats.sales === 0 ? 0 : daySales,
        revenue: stats.sales === 0 ? 0 : dayRevenue,
        heightPct: stats.clicks === 0 ? 8 : Math.round((weights[i] / 0.2) * 100)
      };
    });
  }, [stats.clicks, stats.sales, stats.currentTier.rate, bookPrice]);

  // Viral Calculator Projections (now supports custom bookPrice, tier cut & frequency!)
  const calcProjections = useMemo(() => {
    const estimatedClicks = Math.round(calcViews * (calcCtr / 100));
    const estimatedSales = Math.round(estimatedClicks * (calcConv / 100));
    const commissionPerBook = Math.round(bookPrice * (calcCommissionRate / 100));
    const estimatedEarnings = estimatedSales * commissionPerBook;
    const monthlyPotential = estimatedEarnings * videosPerMonth;
    return {
      estimatedClicks,
      estimatedSales,
      commissionPerBook,
      estimatedEarnings,
      monthlyPotential
    };
  }, [calcViews, calcCtr, calcConv, bookPrice, calcCommissionRate, videosPerMonth]);

  // Ready-to-use promotional templates + spoken Reel script + Hashtags
  const promoTemplates = useMemo(
    () => [
      {
        id: "yt_desc",
        platform: "YouTube Description",
        icon: Youtube,
        accent: "text-rose-300 bg-rose-500/10 border-rose-500/25",
        title: "High-Converting Video Description Box",
        text: `📚 Transform Your Mindset — Grab the Exclusive Vedoxa eBook Bundle here (Special Partner Discount Applied!): \n👉 ${fullAffiliateLink}\n\n✨ Use my official creator link above to unlock instant access & bonus chapters!`
      },
      {
        id: "yt_pin",
        platform: "Pinned Comment",
        icon: MessageSquare,
        accent: "text-sky-300 bg-sky-500/10 border-sky-500/25",
        title: "Pinned Comment Hook (Boosts Clicks by 3x)",
        text: `🔥 Many of you were asking for the book link I mentioned in the video! Get it here with my exclusive follower discount: ${fullAffiliateLink} ❤️`
      },
      {
        id: "ig_story",
        platform: "Instagram Bio / Story",
        icon: Instagram,
        accent: "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/25",
        title: "Instagram Story Sticker / Bio CTA",
        text: `⚡ Must-Read Life Changing Book! Tap my unique VIP link for an instant follower-only discount 👇\n${fullAffiliateLink}`
      },
      {
        id: "wa_tg",
        platform: "Telegram / WhatsApp",
        icon: Share2,
        accent: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
        title: "Community Broadcast Post",
        text: `Hey fam! 🌟 Calling out everyone who wants to level up this week. I've partnered with Vedoxa to bring you a special deal on their bestselling books.\n\nClaim yours now 👉 ${fullAffiliateLink}`
      },
      {
        id: "reel_script",
        platform: "15-Sec Reel Voiceover",
        icon: Mic,
        accent: "text-amber-300 bg-amber-500/10 border-amber-500/25",
        title: "Spoken CTA Script for Shorts & Reels",
        text: `"If you're serious about upgrading your habits this month, don't miss the Vedoxa book I just shared. I've pinned my official VIP link in the comments & bio so you get a special discount automatically—go check it out right now!"`
      },
      {
        id: "hashtag_pack",
        platform: "Discovery Hashtags",
        icon: Hash,
        accent: "text-indigo-300 bg-indigo-500/10 border-indigo-500/25",
        title: "Viral Reach Hashtag Pack",
        text: `#VedoxaBooks #SelfGrowthIndia #MindsetShift #BookRecommendations #PersonalDevelopment #DailyWisdom #MustReadBooks #CreatorPick`
      }
    ],
    [fullAffiliateLink]
  );

  // QR Server URL with custom color options
  const qrImageUrl = useMemo(() => {
    const colorMap = {
      classic: { color: "0b0d17", bg: "ffffff" },
      gold: { color: "92400e", bg: "fffbeb" },
      indigo: { color: "312e81", bg: "eef2ff" }
    };
    const palette = colorMap[qrColorMode] || colorMap.classic;
    return `https://api.qrserver.com/v1/create-qr-code/?size=240x240&color=${palette.color}&bgcolor=${palette.bg}&data=${encodeURIComponent(
      fullAffiliateLink
    )}&margin=10`;
  }, [fullAffiliateLink, qrColorMode]);

  const activeFlexTheme =
    FLEX_THEMES.find((t) => t.id === flexThemeId) || FLEX_THEMES[0];

  const creatorInitials = useMemo(() => {
    const name = affiliateData?.full_name || "VC";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }, [affiliateData?.full_name]);

  return (
    <div className="min-h-screen bg-[#04050a] text-slate-100 flex flex-col font-sans relative overflow-x-hidden selection:bg-amber-400/30 selection:text-amber-100">
      {/* Custom Scoped Styles for Premium Scrollbars & Shimmer Effects */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .studio-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .studio-scroll::-webkit-scrollbar-track { background: transparent; }
        .studio-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.12); border-radius: 999px; }
        .studio-scroll::-webkit-scrollbar-thumb:hover { background: rgba(251,191,36,0.35); }
        @keyframes slowFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-14px) scale(1.03); }
        }
        .animate-aura { animation: slowFloat 11s ease-in-out infinite; }
      `}</style>

      {/* ====================================================================
          ULTRA-LUXURY OBSIDIAN AURORA AMBIENT BACKDROP
         ==================================================================== */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-44 left-[15%] w-[680px] h-[680px] bg-indigo-600/14 blur-[160px] rounded-full animate-aura" />
        <div className="absolute top-1/4 -right-32 w-[560px] h-[560px] bg-amber-500/10 blur-[150px] rounded-full" />
        <div className="absolute -bottom-44 left-[30%] w-[620px] h-[620px] bg-fuchsia-600/10 blur-[160px] rounded-full" />
        {/* Subtle Architectural Dot Matrix */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.65) 1px, transparent 1px)",
            backgroundSize: "30px 30px"
          }}
        />
        {/* Top Horizon Glow Line */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      </div>

      {/* ====================================================================
          FLOATING GLASS TOAST NOTIFICATION
         ==================================================================== */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -32, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -22, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 440, damping: 28 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none px-4 w-full max-w-md flex justify-center"
          >
            <div
              className={`px-5 py-3.5 rounded-2xl shadow-[0_24px_60px_rgba(0,0,0,0.75)] backdrop-blur-2xl font-semibold text-sm border flex items-center gap-3 ${
                toast.type === "success"
                  ? "bg-[#061c15]/90 text-emerald-200 border-emerald-400/40"
                  : toast.type === "error"
                  ? "bg-[#220910]/90 text-rose-200 border-rose-400/40"
                  : "bg-[#111328]/90 text-indigo-200 border-indigo-400/40"
              }`}
            >
              {toast.type === "success" ? (
                <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
              ) : toast.type === "error" ? (
                <AlertTriangle size={18} className="text-rose-400 shrink-0" />
              ) : (
                <Sparkles size={18} className="text-amber-300 shrink-0" />
              )}
              <span>{toast.msg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          UPGRADED QR CODE STUDIO MODAL
         ==================================================================== */}
      <AnimatePresence>
        {showQrModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowQrModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 18 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 18 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gradient-to-b from-[#131524] to-[#080910] border border-white/15 rounded-[2.25rem] p-7 max-w-sm w-full text-center shadow-[0_0_90px_rgba(251,191,36,0.18)] relative overflow-hidden"
            >
              <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-52 h-52 bg-amber-500/20 blur-3xl rounded-full pointer-events-none" />
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold mb-3">
                <Sparkles size={13} /> Creator Overlay QR Studio
              </div>
              <h3 className="text-xl font-black text-white mb-1">
                Scan to Shop on Vedoxa
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Drop this branded QR on your YouTube Shorts, Videos, or Stories!
              </p>

              {/* QR Theme Switcher */}
              <div className="flex items-center justify-center gap-2 mb-4">
                {[
                  { id: "classic", label: "Classic Noir" },
                  { id: "gold", label: "Royal Gold" },
                  { id: "indigo", label: "Electric Indigo" }
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setQrColorMode(opt.id)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                      qrColorMode === opt.id
                        ? "bg-amber-400 text-black"
                        : "bg-white/5 text-slate-400 hover:text-white border border-white/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="bg-white p-3.5 rounded-3xl inline-block shadow-2xl mb-4 ring-4 ring-white/10">
                <img
                  src={qrImageUrl}
                  alt="Partner Affiliate QR Code"
                  className="w-48 h-48 rounded-2xl"
                />
              </div>

              <div className="bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-[11px] font-mono text-amber-300 truncate mb-5">
                {fullAffiliateLink}
              </div>

              <div className="flex gap-2.5">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-black font-black py-3 rounded-xl text-sm transition flex items-center justify-center gap-2"
                >
                  <Copy size={15} /> Copy Link
                </button>
                <a
                  href={qrImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 bg-white/10 hover:bg-white/15 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center"
                  title="Open HD QR Image"
                >
                  <Download size={16} />
                </a>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold py-3 rounded-xl text-sm transition"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          NEW: CREATOR FLEX / VERIFIED PARTNER BADGE STUDIO MODAL
         ==================================================================== */}
      <AnimatePresence>
        {showFlexModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowFlexModal(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[999] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#0a0b12] border border-white/15 rounded-[2.25rem] p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white flex items-center gap-2">
                    <Palette size={18} className="text-amber-400" /> Official Creator Pass
                  </h3>
                  <p className="text-xs text-slate-400">
                    Screenshot & flex your Verified Vedoxa Partner Card on Stories!
                  </p>
                </div>
                <button
                  onClick={() => setShowFlexModal(false)}
                  className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Theme Picker */}
              <div className="flex items-center gap-2">
                {FLEX_THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFlexThemeId(t.id)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border transition ${
                      flexThemeId === t.id
                        ? "bg-white/15 border-white/30 text-white"
                        : "bg-white/[0.03] border-white/10 text-slate-400 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* The Shareable Holographic Creator Pass */}
              <div
                className={`relative rounded-[1.75rem] p-6 bg-gradient-to-br ${activeFlexTheme.bg} border ${activeFlexTheme.border} overflow-hidden shadow-2xl`}
              >
                <div
                  className={`absolute -top-14 -right-14 w-44 h-44 ${activeFlexTheme.orb1} blur-3xl rounded-full pointer-events-none`}
                />
                <div
                  className={`absolute -bottom-16 -left-10 w-44 h-44 ${activeFlexTheme.orb2} blur-3xl rounded-full pointer-events-none`}
                />

                <div className="relative z-10 space-y-5">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-white/90">
                      <Crown size={14} className={activeFlexTheme.accent} /> VEDOXA VIP
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold text-white">
                      {stats.currentTier.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/20 flex items-center justify-center text-xl font-black text-white shadow-lg">
                      {creatorInitials}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xl font-black text-white truncate">
                        {affiliateData?.full_name || "Creator Partner"}
                      </h4>
                      <p className="text-xs text-slate-300 truncate">
                        {affiliateData?.channel_name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2.5 pt-2">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-3 text-center">
                      <p className="text-[10px] uppercase text-slate-400 font-bold">
                        Books Sold
                      </p>
                      <p className="text-lg font-black text-white">{stats.sales}</p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-3 text-center">
                      <p className="text-[10px] uppercase text-slate-400 font-bold">
                        Royalty Cut
                      </p>
                      <p className={`text-lg font-black ${activeFlexTheme.accent}`}>
                        {stats.currentTier.commission}
                      </p>
                    </div>
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-3 text-center">
                      <p className="text-[10px] uppercase text-slate-400 font-bold">
                        Earned
                      </p>
                      <p className="text-lg font-black text-emerald-300">
                        {streamerPrivacyMode
                          ? "₹••••"
                          : `₹${stats.totalEarned.toLocaleString("en-IN")}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[11px] font-mono text-slate-300">
                    <span>ID: {partnerCode}</span>
                    <span className={activeFlexTheme.accent}>
                      #{uniqueCreatorIdentity.signature.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  copyToClipboard(
                    `🏆 Proud Verified ${stats.currentTier.name} Partner at Vedoxa! Grab my exclusive book discount here: ${fullAffiliateLink}`,
                    "Flex caption + unique link copied!",
                    "flex_copy"
                  )
                }
                className="w-full bg-gradient-to-r from-amber-400 to-orange-500 text-black font-black py-3.5 rounded-2xl text-sm transition hover:brightness-110 flex items-center justify-center gap-2"
              >
                <Share2 size={16} /> Copy Flex Caption & Link
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================================
          TOP FLOATING GLASS HEADER NAVIGATION
         ==================================================================== */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-[#04050a]/75 border-b border-white/[0.07]">
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.09] hover:border-amber-400/30 px-4 py-2.5 rounded-2xl text-white font-semibold text-sm transition-all duration-200"
          >
            <ChevronLeft
              size={18}
              className="text-slate-400 group-hover:text-amber-300 group-hover:-translate-x-0.5 transition-transform"
            />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2">
            {viewState === "DASHBOARD" && (
              <>
                <button
                  onClick={() => setShowFlexModal(true)}
                  className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold bg-amber-400/10 hover:bg-amber-400/20 text-amber-300 border border-amber-400/30 transition"
                >
                  <Award size={14} />
                  <span>Creator Pass</span>
                </button>

                <button
                  onClick={() => {
                    setStreamerPrivacyMode(!streamerPrivacyMode);
                    showToast(
                      !streamerPrivacyMode
                        ? "Creator Flex Mode On: Personal UPI & sensitive payouts masked!"
                        : "Privacy Mode Off: Full details visible",
                      "info"
                    );
                  }}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
                    streamerPrivacyMode
                      ? "bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/40 shadow-[0_0_20px_rgba(217,70,239,0.2)]"
                      : "bg-white/[0.04] text-slate-300 border-white/[0.09] hover:text-white hover:bg-white/[0.08]"
                  }`}
                  title="Hide sensitive UPI ID while taking screenshots or recording reels"
                >
                  {streamerPrivacyMode ? <EyeOff size={15} /> : <Eye size={15} />}
                  <span className="hidden sm:inline">
                    {streamerPrivacyMode ? "Streamer Safe" : "Flex Privacy"}
                  </span>
                </button>
              </>
            )}

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-fuchsia-500/15 border border-white/15 text-xs font-black tracking-wide text-white shadow-inner">
              <Crown size={14} className="text-amber-400" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-white to-indigo-200">
                Vedoxa Studio
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ====================================================================
          MAIN CONTENT CONTAINER
         ==================================================================== */}
      <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col px-4 sm:px-6 py-7">
        {loading || viewState === "LOADING" ? (
          <div className="flex-1 flex flex-col items-center justify-center py-32">
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-amber-500/15 to-indigo-500/15 border border-amber-400/30 flex items-center justify-center shadow-[0_0_55px_rgba(251,191,36,0.2)]">
                <RefreshCw className="animate-spin text-amber-300" size={36} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-400 border-4 border-[#04050a] animate-ping" />
            </div>
            <h3 className="text-xl font-black text-white mb-1 tracking-tight">
              Syncing Vedoxa Creator Studio...
            </h3>
            <p className="text-slate-400 text-sm">
              Authenticating your VIP partner identity & real-time royalties
            </p>
          </div>
        ) : viewState === "UNAUTHORIZED" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="my-auto text-center py-16 px-7 bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/15 rounded-[2.5rem] max-w-lg mx-auto w-full backdrop-blur-2xl shadow-[0_30px_90px_rgba(0,0,0,0.75)] relative overflow-hidden"
          >
            <div className="absolute -top-28 left-1/2 -translate-x-1/2 w-64 h-64 bg-rose-500/20 blur-3xl rounded-full pointer-events-none" />
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-400/30 flex items-center justify-center mx-auto mb-6 text-rose-400 shadow-lg">
              <ShieldAlert size={38} />
            </div>
            <span className="inline-block px-3.5 py-1 rounded-full bg-rose-500/15 border border-rose-400/30 text-rose-300 text-xs font-black uppercase tracking-widest mb-3">
              VIP Members Only
            </span>
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              Creator Access Required
            </h2>
            <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
              Sign in to your Vedoxa account to unlock your Influencer Partner
              Studio, mint your unique VIP link, and track instant 40%+ royalties.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:brightness-110 text-black font-black px-8 py-4 rounded-2xl transition-all shadow-[0_12px_35px_rgba(251,191,36,0.3)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Go to Sign In</span>
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
                initial={{ scale: 0.85 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400/20 via-indigo-500/20 to-fuchsia-500/20 rounded-3xl border border-amber-400/35 text-amber-300 mb-6 shadow-[0_0_45px_rgba(251,191,36,0.2)]"
              >
                <KeyRound size={36} />
              </motion.div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-bold mb-3">
                <Sparkles size={12} /> Private Invitation Vault
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">
                Unlock Partner Studio
              </h1>
              <p className="text-slate-400 text-sm">
                Enter your 8-character secret invitation code provided by the
                Vedoxa Admin team.
              </p>
            </div>

            <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-2xl border border-white/15 p-7 sm:p-8 rounded-[2.25rem] shadow-2xl relative overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Secret Partner Code
                </label>
                <span className="text-xs font-mono text-amber-300 font-bold">
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
                className="w-full bg-black/70 border border-white/15 focus:border-amber-400 rounded-2xl px-4 py-4 text-amber-200 text-center font-mono text-2xl tracking-[0.45em] outline-none mb-4 uppercase transition-all shadow-inner placeholder:text-slate-700"
              />

              {/* Visual 8-character golden progress segments */}
              <div className="grid grid-cols-8 gap-1.5 mb-6">
                {Array.from({ length: 8 }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx < codeInput.length
                        ? "bg-gradient-to-r from-amber-400 to-orange-500 shadow-[0_0_10px_rgba(251,191,36,0.8)]"
                        : "bg-white/10"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={isProcessing || codeInput.length < 8}
                className="w-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:brightness-110 text-black font-black py-4 rounded-2xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 shadow-[0_12px_35px_rgba(251,191,36,0.28)]"
              >
                {isProcessing ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <>
                    <span>Verify & Unlock Studio</span>
                    <Zap size={18} />
                  </>
                )}
              </button>

              {isPlaceholderSupabase && (
                <button
                  onClick={() => setCodeInput("VDX8A9B2")}
                  className="w-full mt-3.5 py-2 text-xs text-amber-300/85 hover:text-amber-200 font-semibold transition"
                >
                  ✨ Tap to auto-fill demo code:{" "}
                  <span className="font-mono font-black underline">VDX8A9B2</span>
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
              <div className="inline-flex items-center justify-center w-18 h-18 p-4 bg-gradient-to-br from-fuchsia-500/20 to-indigo-500/20 rounded-3xl border border-fuchsia-400/30 text-fuchsia-300 mb-4 shadow-[0_0_35px_rgba(217,70,239,0.22)]">
                <UserPlus size={30} />
              </div>
              <h1 className="text-3xl font-black text-white mb-2 tracking-tight">
                Creator Profile Setup
              </h1>
              <p className="text-slate-400 text-sm">
                Personalize your unique Vedoxa creator link & configure weekly
                UPI royalty payouts.
              </p>
            </div>

            <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-2xl border border-white/15 p-7 sm:p-8 rounded-[2.25rem] shadow-2xl flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                  Your Full Name / Creator Alias
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={setupForm.fullName}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, fullName: e.target.value })
                  }
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-2xl px-4 py-3.5 text-white outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                  YouTube Channel / Instagram Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. @SpiritualWisdomOfficial"
                  value={setupForm.channelName}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, channelName: e.target.value })
                  }
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-2xl px-4 py-3.5 text-white outline-none transition"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">
                  Instant Payout UPI ID / Bank Handle
                </label>
                <input
                  type="text"
                  placeholder="yourname@okaxis"
                  value={setupForm.paymentUpi}
                  onChange={(e) =>
                    setSetupForm({ ...setupForm, paymentUpi: e.target.value })
                  }
                  className="w-full bg-black/60 border border-white/15 focus:border-amber-400 rounded-2xl px-4 py-3.5 text-white font-mono outline-none transition"
                />
                <p className="text-[11px] text-slate-400 mt-1.5">
                  Royalties are settled automatically every week directly to this
                  UPI handle.
                </p>
              </div>

              <button
                onClick={handleSetupProfile}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-amber-400 via-orange-400 to-fuchsia-500 hover:brightness-110 text-black font-black py-4 rounded-2xl mt-2 transition-all flex items-center justify-center gap-2 shadow-[0_12px_35px_rgba(251,191,36,0.28)]"
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
          /* ==================================================================
             MAIN ROYAL CREATOR DASHBOARD
             ================================================================== */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex flex-col gap-6 w-full pb-20"
          >
            {/* 1. FLAGSHIP OBSIDIAN HERO BANNER WITH CREATOR AVATAR & TIER PROGRESS */}
            <section className="relative bg-gradient-to-br from-[#121324] via-[#090a12] to-[#17111e] border border-white/15 rounded-[2.25rem] p-6 sm:p-9 overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.75)]">
              {/* Top Metallic Rim Highlight */}
              <div className="absolute top-0 inset-x-10 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
              <div className="absolute -top-28 left-1/4 w-96 h-96 bg-indigo-500/18 blur-[110px] rounded-full pointer-events-none" />
              <div className="absolute -bottom-28 right-8 w-80 h-80 bg-amber-500/14 blur-[100px] rounded-full pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-7">
                {/* Left: Creator Avatar + Identity */}
                <div className="flex flex-col sm:flex-row items-center lg:items-start gap-5 text-center sm:text-left flex-1">
                  {/* Monogram Crest */}
                  <div className="relative shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-[1.75rem] bg-gradient-to-br from-amber-300 via-orange-400 to-fuchsia-500 p-[2px] shadow-[0_0_40px_rgba(251,191,36,0.28)]">
                      <div className="w-full h-full rounded-[1.65rem] bg-[#0b0c15] flex items-center justify-center text-2xl sm:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-br from-amber-200 to-white">
                        {creatorInitials}
                      </div>
                    </div>
                    <span
                      className="absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-xl bg-[#0b0c15] border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-lg"
                      title="Verified Vedoxa Partner"
                    >
                      <ShieldCheck size={16} />
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="inline-flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-black tracking-wider uppercase">
                        <Sparkles size={12} /> Verified VIP Partner
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${stats.currentTier.badgeBg} ${stats.currentTier.border}`}
                      >
                        <Award size={12} /> {stats.currentTier.name} •{" "}
                        {stats.currentTier.commission} Cut
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-indigo-200 tracking-tight leading-tight">
                      {affiliateData?.full_name || "Creator Partner"}
                    </h1>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 text-xs text-slate-300">
                      <span className="inline-flex items-center gap-1.5 bg-white/[0.05] border border-white/10 px-3.5 py-1.5 rounded-xl">
                        <Youtube size={14} className="text-rose-400" />
                        <strong className="text-white">
                          {affiliateData?.channel_name}
                        </strong>
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-white/[0.05] border border-white/10 px-3.5 py-1.5 rounded-xl font-mono">
                        <span className="text-slate-400">Code:</span>
                        <strong className="text-amber-300">{partnerCode}</strong>
                      </span>
                      <span className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-400/25 px-3 py-1.5 rounded-xl font-mono text-indigo-300">
                        <Fingerprint size={13} />
                        <span>UID-{uniqueCreatorIdentity.signature.toUpperCase()}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Glass Creator Level & Next Tier Card */}
                <div className="w-full lg:w-[340px] bg-black/50 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shrink-0 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                      <Flame size={15} className="text-amber-400" /> Royalty Level
                    </span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      {stats.sales} / {stats.nextTier ? stats.nextTier.minSales : "MAX"}{" "}
                      Sales
                    </span>
                  </div>

                  <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden p-0.5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.progressPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full rounded-full bg-gradient-to-r ${stats.currentTier.color}`}
                    />
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {stats.nextTier ? (
                      <>
                        Only{" "}
                        <strong className="text-white">
                          {stats.nextTier.minSales - stats.sales} more books
                        </strong>{" "}
                        to unlock{" "}
                        <span className="text-amber-300 font-bold">
                          {stats.nextTier.name} ({stats.nextTier.commission} Cut)
                        </span>
                      </>
                    ) : (
                      <span className="text-emerald-300 font-bold">
                        🏆 Maximum Diamond Legend Tier Unlocked!
                      </span>
                    )}
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock size={12} className="text-indigo-400" /> Weekly UPI Payouts
                    </span>
                    <button
                      onClick={() => setShowFlexModal(true)}
                      className="text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
                    >
                      Open Flex Card <ArrowUpRight size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* 2. UNIQUE BRANDED LINK STUDIO (PERSONALIZED + 100% TRACKING SAFE) */}
            <section className="relative bg-gradient-to-br from-[#141226]/90 via-[#0b0d17] to-[#1a1310]/80 backdrop-blur-2xl border border-amber-400/25 rounded-[2.25rem] p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 blur-[90px] rounded-full pointer-events-none" />

              <div className="relative z-10 space-y-5">
                {/* Header Row + Unique Style Selector */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
                      <Wand2 size={14} /> Unique Creator Link Studio
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white">
                      Your Signature Magic Affiliate Link
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                      Uniquely fingerprinted to{" "}
                      <span className="text-white font-semibold">
                        {affiliateData?.channel_name || "your brand"}
                      </span>{" "}
                      — unlocks automatic follower discounts & instant{" "}
                      <span className="text-emerald-400 font-bold">
                        {stats.currentTier.commission} commission
                      </span>
                      .
                    </p>
                  </div>

                  {/* Link Style Switcher Pills */}
                  <div className="inline-flex flex-wrap items-center gap-1.5 bg-black/50 p-1.5 rounded-2xl border border-white/10 self-start lg:self-auto">
                    {[
                      { id: "VIP_SIGNATURE", label: "✨ VIP Branded" },
                      { id: "CLEAN_CLASSIC", label: "⚡ Classic Clean" },
                      { id: "CAMPAIGN_PRO", label: "🎯 Custom Campaign" }
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => setLinkStyle(mode.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          linkStyle === mode.id
                            ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-md"
                            : "text-slate-400 hover:text-white"
                        }`}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Custom Campaign Name Input when in CAMPAIGN_PRO mode */}
                <AnimatePresence>
                  {linkStyle === "CAMPAIGN_PRO" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-black/40 border border-amber-400/25 rounded-2xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <span className="text-xs font-bold text-amber-300 whitespace-nowrap flex items-center gap-1.5">
                          <Link2 size={15} /> Custom Campaign Tag:
                        </span>
                        <input
                          type="text"
                          value={customCampaignSlug}
                          onChange={(e) => setCustomCampaignSlug(e.target.value)}
                          placeholder="e.g. sunday-podcast, diwali-drop, viral-reel"
                          className="flex-1 bg-white/[0.04] border border-white/10 focus:border-amber-400 rounded-xl px-3.5 py-2 text-xs text-white font-mono outline-none"
                        />
                        <span className="text-[11px] text-slate-400">
                          Auto-embeds your unique ID{" "}
                          <strong className="text-white font-mono">
                            {uniqueCreatorIdentity.signature}
                          </strong>
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Live Glowing Link Display + Action Suite */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
                  <div className="flex-1 bg-black/70 border border-amber-400/35 rounded-2xl px-4 py-3.5 flex items-center justify-between gap-3 shadow-inner overflow-hidden">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_10px_#34d399]" />
                      <span className="font-mono text-xs sm:text-sm text-amber-200 truncate select-all">
                        {fullAffiliateLink}
                      </span>
                    </div>
                    <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-400/25 shrink-0">
                      Active
                    </span>
                  </div>

                  {/* Quick Copy, QR, WhatsApp, Telegram Buttons */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={handleCopyLink}
                      className="flex-1 sm:flex-initial bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 hover:brightness-110 text-black px-6 py-3.5 rounded-2xl font-black text-sm transition whitespace-nowrap flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(251,191,36,0.3)]"
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
                      className="bg-white/[0.07] hover:bg-white/[0.14] border border-white/15 text-white px-4 py-3.5 rounded-2xl transition flex items-center gap-2 text-xs font-bold"
                      title="Generate Branded QR Code"
                    >
                      <QrCode size={18} className="text-amber-300" />
                      <span className="hidden xl:inline">QR Studio</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={shareToWhatsApp}
                      className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-emerald-300 px-3.5 py-3.5 rounded-2xl transition text-xs font-bold flex items-center gap-1.5"
                      title="Share directly on WhatsApp"
                    >
                      <Share2 size={16} />
                      <span>WhatsApp</span>
                    </motion.button>

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={shareToTelegram}
                      className="bg-sky-500/15 hover:bg-sky-500/25 border border-sky-400/30 text-sky-300 px-3.5 py-3.5 rounded-2xl transition text-xs font-bold flex items-center gap-1.5"
                      title="Share directly on Telegram"
                    >
                      <Send size={15} />
                      <span>Telegram</span>
                    </motion.button>
                  </div>
                </div>

                {/* Quick Platform Tracking Source Tags */}
                <div className="pt-3.5 border-t border-white/[0.08] flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 mr-1">
                    Source Tag:
                  </span>
                  {[
                    { label: "All Platforms", value: "" },
                    { label: "🎬 YouTube Video", value: "youtube" },
                    { label: "⚡ YT Shorts", value: "yt_shorts" },
                    { label: "📸 Instagram Bio", value: "ig_bio" },
                    { label: "💬 Pinned Comment", value: "pinned_comment" },
                    { label: "📢 Telegram", value: "telegram" }
                  ].map((tag) => (
                    <button
                      key={tag.value}
                      onClick={() => setSelectedSourceTag(tag.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedSourceTag === tag.value
                          ? "bg-indigo-500/25 text-indigo-100 border border-indigo-400/50 shadow-sm"
                          : "bg-white/[0.03] text-slate-400 border border-white/[0.07] hover:text-white hover:bg-white/[0.08]"
                      }`}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* 3. PREMIUM KPI GLASS CARDS GRID */}
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {/* Link Views */}
              <motion.div
                whileHover={{ y: -4 }}
                className="relative bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-sky-400/40 p-5 sm:p-6 rounded-3xl transition-all group overflow-hidden"
              >
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-sky-500/15 blur-2xl rounded-full group-hover:bg-sky-500/25 transition" />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-sky-500/15 border border-sky-400/25 flex items-center justify-center text-sky-300 group-hover:scale-110 transition-transform">
                    <Eye size={21} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-400/20">
                    Live Traffic
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Link Views
                </p>
                <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {stats.clicks.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Avg <strong className="text-sky-300">₹{stats.epc}</strong> earned / click
                </p>
              </motion.div>

              {/* Books Sold */}
              <motion.div
                whileHover={{ y: -4 }}
                className="relative bg-gradient-to-b from-white/[0.06] to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-fuchsia-400/40 p-5 sm:p-6 rounded-3xl transition-all group overflow-hidden"
              >
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-fuchsia-500/15 blur-2xl rounded-full group-hover:bg-fuchsia-500/25 transition" />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-fuchsia-500/15 border border-fuchsia-400/25 flex items-center justify-center text-fuchsia-300 group-hover:scale-110 transition-transform">
                    <TrendingUp size={21} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-400/20">
                    {stats.conversionRate}% Conv.
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Books Sold
                </p>
                <p className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {stats.sales.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Verified partner purchases
                </p>
              </motion.div>

              {/* Total Earned */}
              <motion.div
                whileHover={{ y: -4 }}
                className="relative bg-gradient-to-br from-emerald-950/50 via-[#081511] to-black border border-emerald-400/30 hover:border-emerald-400/55 p-5 sm:p-6 rounded-3xl transition-all group overflow-hidden"
              >
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-500/20 blur-2xl rounded-full" />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center text-emerald-300 group-hover:scale-110 transition-transform">
                    <DollarSign size={21} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-400/25">
                    {stats.currentTier.commission} Cut
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Total Earned
                </p>
                <p className="text-3xl sm:text-4xl font-black text-emerald-300 tracking-tight">
                  {streamerPrivacyMode
                    ? "₹•••••"
                    : `₹${stats.totalEarned.toLocaleString("en-IN")}`}
                </p>
                <p className="text-xs text-emerald-400/75 mt-2">
                  {streamerPrivacyMode
                    ? "Payout masked"
                    : `₹${stats.totalPaid.toLocaleString("en-IN")} settled (${stats.paidRatio}%)`}
                </p>
              </motion.div>

              {/* Pending Payout */}
              <motion.div
                whileHover={{ y: -4 }}
                className="relative bg-gradient-to-br from-amber-950/50 via-[#171006] to-black border border-amber-400/30 hover:border-amber-400/55 p-5 sm:p-6 rounded-3xl transition-all group overflow-hidden"
              >
                <div className="absolute -right-8 -top-8 w-28 h-28 bg-amber-500/20 blur-2xl rounded-full" />
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform">
                    <WalletCards size={21} />
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-400/25">
                    Weekly Cycle
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Pending Payout
                </p>
                <p className="text-3xl sm:text-4xl font-black text-amber-300 tracking-tight">
                  {streamerPrivacyMode
                    ? "₹••••"
                    : `₹${stats.pendingPayout.toLocaleString("en-IN")}`}
                </p>
                <p className="text-xs text-amber-400/75 mt-2">
                  Direct to your saved UPI
                </p>
              </motion.div>
            </section>

            {/* 4. SLEEK SEGMENTED CREATOR STUDIO TABS */}
            <nav className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar border-b border-white/[0.08]">
              {[
                {
                  id: "OVERVIEW",
                  label: "VIP Chat & Payouts",
                  icon: MessageSquare
                },
                {
                  id: "ANALYTICS",
                  label: "Performance Insights",
                  icon: BarChart3,
                  badge: "PRO"
                },
                {
                  id: "PROMO_KIT",
                  label: "Viral Scripts & Promo Kit",
                  icon: Sparkles,
                  badge: "6 READY"
                },
                {
                  id: "CALCULATOR",
                  label: "Earnings Simulator",
                  icon: Calculator
                },
                {
                  id: "TIERS",
                  label: "VIP Tiers & Perks",
                  icon: Crown
                }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative px-5 py-3.5 rounded-t-2xl font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                      isActive
                        ? "text-white bg-white/[0.07] border-t border-x border-white/15"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                    }`}
                  >
                    <Icon
                      size={16}
                      className={isActive ? "text-amber-300" : "text-slate-500"}
                    />
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-black">
                        {tab.badge}
                      </span>
                    )}
                    {isActive && (
                      <motion.div
                        layoutId="activeCreatorTabIndicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-400 via-orange-400 to-fuchsia-500"
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ==============================================================
                TAB 1: VIP CHAT CONCIERGE & PAYOUT SETTINGS
               ============================================================== */}
            {activeTab === "OVERVIEW" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-3 gap-6 lg:h-[560px]"
              >
                {/* Left Column: Payout Wallet + Editable UPI */}
                <div className="lg:col-span-1 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 flex flex-col gap-5 justify-between">
                  <div className="space-y-5">
                    <div>
                      <div className="inline-flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
                        <Rocket size={14} /> Payout Vault
                      </div>
                      <h3 className="text-xl font-black text-white">
                        Partner Info & UPI
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Zero platform fees. Royalties settle weekly directly into
                        your registered UPI handle.
                      </p>
                    </div>

                    {/* Settlement Progress Bar */}
                    <div className="bg-black/50 border border-white/10 p-4 rounded-2xl space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-semibold">
                          Lifetime Payout Settled
                        </span>
                        <span className="text-emerald-300 font-black font-mono">
                          {stats.paidRatio}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all duration-700"
                          style={{ width: `${stats.paidRatio}%` }}
                        />
                      </div>
                    </div>

                    {/* UPI Card with Privacy Mode + Inline Editor */}
                    <div className="bg-black/55 border border-white/10 p-4 rounded-2xl">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                          Saved Payout UPI ID
                        </p>
                        <button
                          onClick={() => setIsEditingUpi(!isEditingUpi)}
                          className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1"
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
                            className="flex-1 bg-white/5 border border-amber-400/50 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                          />
                          <button
                            onClick={handleUpdateUpi}
                            disabled={isProcessing}
                            className="bg-amber-400 hover:bg-amber-300 text-black text-xs font-black px-3.5 py-2 rounded-xl transition"
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

                    {/* Quick Payout Ping Action */}
                    <button
                      onClick={() =>
                        handleSendMessage(
                          `💸 Hi Admin! Requesting update on my pending payout of ₹${stats.pendingPayout.toLocaleString(
                            "en-IN"
                          )} to UPI: ${affiliateData?.payment_upi || "saved UPI"}.`
                        )
                      }
                      className="w-full bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-200 py-3 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <Zap size={14} className="text-amber-400" /> Ping Admin for
                      Payout Status
                    </button>
                  </div>

                  <div className="pt-3 border-t border-white/[0.07]">
                    <a
                      href="mailto:vedoxa1@gmail.com"
                      className="w-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 flex items-center justify-center gap-2 py-3 rounded-2xl text-white text-xs font-bold transition"
                    >
                      <Mail size={15} className="text-amber-300" /> Email VIP
                      Sponsorship Desk
                    </a>
                  </div>
                </div>

                {/* Right Column: Direct VIP Live Chat with Admin */}
                <div className="lg:col-span-2 bg-[#0a0b13] border border-white/15 rounded-3xl flex flex-col overflow-hidden relative shadow-[0_0_50px_rgba(0,0,0,0.5)] h-[500px] lg:h-full">
                  {/* Chat Header */}
                  <div className="bg-black/60 backdrop-blur-xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-fuchsia-500 flex items-center justify-center text-black font-black text-sm shadow-lg">
                          VX
                        </div>
                        <span className="w-3 h-3 bg-emerald-400 border-2 border-[#0a0b13] rounded-full absolute -bottom-0.5 -right-0.5" />
                      </div>
                      <div>
                        <h3 className="font-black text-white text-sm sm:text-base flex items-center gap-2">
                          Direct VIP Admin Concierge
                        </h3>
                        <p className="text-xs text-emerald-400">
                          ● Online • Dedicated Vedoxa Partner Desk
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        user?.id && !isPlaceholderSupabase && fetchMessages(user.id)
                      }
                      className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-amber-300 transition"
                      title="Refresh messages"
                    >
                      <RefreshCw size={16} />
                    </button>
                  </div>

                  {/* Chat Messages Scroll Container */}
                  <div
                    ref={chatRef}
                    className="flex-1 overflow-y-auto studio-scroll p-5 sm:p-6 flex flex-col gap-3.5 scroll-smooth"
                  >
                    <div className="text-center text-[11px] text-slate-400 bg-white/[0.03] border border-white/[0.07] rounded-full py-1 px-4 mx-auto my-1">
                      🔒 Direct Encrypted Partner Concierge Channel
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
                              ? "bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 text-white self-end rounded-tr-[4px] shadow-lg"
                              : "bg-white/[0.07] border border-white/10 text-slate-200 self-start rounded-tl-[4px]"
                          }`}
                        >
                          <p>{msg.message}</p>
                          {msg.created_at && (
                            <span
                              className={`block text-[10px] mt-1 ${
                                isMe
                                  ? "text-indigo-200/80 text-right"
                                  : "text-slate-500"
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
                          className="text-amber-400/50 mx-auto"
                        />
                        <p className="text-slate-200 font-bold text-sm">
                          Start a conversation with Admin!
                        </p>
                        <p className="text-slate-500 text-xs">
                          Ask about weekly payouts, custom banners, or giveaway
                          copies for your community.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quick One-Tap Influencer Message Chips */}
                  <div className="px-4 py-2.5 bg-black/40 border-t border-white/[0.06] flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {[
                      "👋 Requesting weekly payout status",
                      "🎨 Need promo banners for my next video",
                      "🚀 Just posted a new video with my VIP link!",
                      "🎁 Can I get a giveaway copy for subscribers?"
                    ].map((quickMsg, idx) => (
                      <button
                        key={idx}
                        onClick={() => setChatInput(quickMsg)}
                        className="text-[11px] bg-white/[0.04] hover:bg-amber-400/15 border border-white/[0.08] hover:border-amber-400/40 text-slate-300 hover:text-amber-200 px-3 py-1.5 rounded-full whitespace-nowrap transition"
                      >
                        {quickMsg}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input Bar */}
                  <div className="p-4 bg-black/70 border-t border-white/10 flex gap-2.5">
                    <input
                      type="text"
                      placeholder="Message your Partner Manager..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      className="flex-1 bg-white/[0.05] border border-white/10 focus:border-amber-400 rounded-2xl px-4 py-3 text-sm text-white outline-none transition"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!chatInput.trim()}
                      className="bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-black font-black px-5 rounded-2xl transition disabled:opacity-40 flex items-center justify-center shadow-lg"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==============================================================
                TAB 2: NEW PERFORMANCE INSIGHTS & CONVERSION FUNNEL
               ============================================================== */}
            {activeTab === "ANALYTICS" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid lg:grid-cols-12 gap-6"
              >
                {/* Weekly Velocity Bar Chart */}
                <div className="lg:col-span-7 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5 mb-1">
                        <BarChart3 size={14} /> 7-Day Creator Velocity
                      </span>
                      <h3 className="text-xl font-black text-white">
                        Traffic & Sales Rhythm
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-400">
                        {hoveredDayIndex !== null
                          ? `${weeklyMomentum[hoveredDayIndex].day} Snapshot`
                          : "Hover any bar for details"}
                      </p>
                      <p className="text-sm font-black text-emerald-300 font-mono">
                        {hoveredDayIndex !== null
                          ? `${weeklyMomentum[hoveredDayIndex].clicks} clicks • ${weeklyMomentum[hoveredDayIndex].sales} sales`
                          : `${stats.conversionRate}% Avg Conversion`}
                      </p>
                    </div>
                  </div>

                  {/* Interactive Animated Bars */}
                  <div className="h-52 flex items-end justify-between gap-3 pt-6 px-2">
                    {weeklyMomentum.map((item, idx) => {
                      const isHovered = hoveredDayIndex === idx;
                      return (
                        <div
                          key={item.day}
                          onMouseEnter={() => setHoveredDayIndex(idx)}
                          onMouseLeave={() => setHoveredDayIndex(null)}
                          className="flex-1 flex flex-col items-center gap-2.5 h-full justify-end cursor-pointer group"
                        >
                          <div className="relative w-full flex items-end justify-center h-full">
                            {isHovered && (
                              <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -top-9 bg-black border border-amber-400/40 text-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-lg whitespace-nowrap shadow-xl z-10"
                              >
                                ₹{item.revenue.toLocaleString("en-IN")}
                              </motion.div>
                            )}
                            <motion.div
                              initial={{ height: 0 }}
                              animate={{ height: `${Math.max(12, item.heightPct)}%` }}
                              transition={{ duration: 0.6, delay: idx * 0.06 }}
                              className={`w-full max-w-[42px] rounded-t-xl transition-all ${
                                isHovered
                                  ? "bg-gradient-to-t from-amber-500 via-orange-400 to-yellow-200 shadow-[0_0_25px_rgba(251,191,36,0.45)]"
                                  : "bg-gradient-to-t from-indigo-600/60 via-indigo-400/70 to-sky-300/80 group-hover:brightness-125"
                              }`}
                            />
                          </div>
                          <span
                            className={`text-xs font-bold ${
                              isHovered ? "text-amber-300" : "text-slate-400"
                            }`}
                          >
                            {item.day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Conversion Funnel & EPC Breakdown */}
                <div className="lg:col-span-5 bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-7 flex flex-col justify-between gap-5">
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider text-fuchsia-300 mb-1 block">
                      Audience Funnel Health
                    </span>
                    <h3 className="text-xl font-black text-white">
                      From Click to Royalty
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {[
                      {
                        step: "1. Magic Link Clicks",
                        val: stats.clicks.toLocaleString("en-IN"),
                        pct: 100,
                        bar: "from-sky-400 to-indigo-500"
                      },
                      {
                        step: "2. Checkout Intent (~24%)",
                        val: Math.round(stats.clicks * 0.24).toLocaleString("en-IN"),
                        pct: 58,
                        bar: "from-indigo-400 to-fuchsia-500"
                      },
                      {
                        step: "3. Completed Book Sales",
                        val: stats.sales.toLocaleString("en-IN"),
                        pct: Math.min(100, Math.max(14, Number(stats.conversionRate) * 6)),
                        bar: "from-amber-400 to-emerald-400"
                      }
                    ].map((row) => (
                      <div key={row.step} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-slate-300">{row.step}</span>
                          <span className="text-white font-mono">{row.val}</span>
                        </div>
                        <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${row.bar}`}
                            style={{ width: `${row.pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-400/10 border border-amber-400/25 rounded-2xl p-4 flex items-start gap-3">
                    <Zap size={18} className="text-amber-300 shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-200 leading-relaxed">
                      Creators who combine a{" "}
                      <strong className="text-white">Pinned Comment</strong> +{" "}
                      <strong className="text-amber-300">QR Overlay</strong>{" "}
                      convert up to <strong>3.2x higher</strong> than description-only
                      links.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ==============================================================
                TAB 3: UPGRADED VIRAL SCRIPTS & PROMO KIT
               ============================================================== */}
            {activeTab === "PROMO_KIT" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {promoTemplates.map((tpl) => {
                  const Icon = tpl.icon;
                  return (
                    <div
                      key={tpl.id}
                      className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/10 hover:border-amber-400/35 rounded-3xl p-6 flex flex-col justify-between gap-4 transition-all group"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${tpl.accent}`}
                          >
                            <Icon size={14} /> {tpl.platform}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono uppercase">
                            Auto-Synced
                          </span>
                        </div>
                        <h4 className="text-base font-black text-white mb-2.5">
                          {tpl.title}
                        </h4>
                        <pre className="bg-black/60 border border-white/[0.08] rounded-2xl p-4 text-xs text-slate-300 font-sans whitespace-pre-wrap leading-relaxed">
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
                        className="w-full bg-white/[0.06] hover:bg-gradient-to-r hover:from-amber-400 hover:to-orange-500 hover:text-black text-white font-bold py-3 rounded-2xl text-xs transition flex items-center justify-center gap-2 border border-white/10 hover:border-transparent"
                      >
                        {copiedKey === tpl.id ? (
                          <>
                            <Check size={15} /> Copied Script!
                          </>
                        ) : (
                          <>
                            <Copy size={15} /> Copy Ready-to-Post Script
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* ==============================================================
                TAB 4: UPGRADED INTERACTIVE EARNINGS SIMULATOR
               ============================================================== */}
            {activeTab === "CALCULATOR" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-b from-white/[0.05] to-white/[0.02] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-8 grid lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="inline-flex items-center gap-1.5 text-amber-300 text-xs font-black uppercase tracking-wider mb-1">
                        <Sliders size={14} /> Pro Revenue Simulator
                      </div>
                      <h3 className="text-2xl font-black text-white">
                        Forecast Your Creator Royalties
                      </h3>
                    </div>

                    {/* Quick Creator Size Presets */}
                    <div className="flex items-center gap-1.5">
                      {[
                        { label: "10K Reel", views: 10000, ctr: 4, conv: 5 },
                        { label: "50K Video", views: 50000, ctr: 5, conv: 6.5 },
                        { label: "250K Viral", views: 250000, ctr: 4.5, conv: 6 }
                      ].map((p) => (
                        <button
                          key={p.label}
                          onClick={() => {
                            setCalcViews(p.views);
                            setCalcCtr(p.ctr);
                            setCalcConv(p.conv);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-amber-400/20 border border-white/10 hover:border-amber-400/40 text-[11px] font-bold text-slate-300 hover:text-amber-200 transition"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Slider 1: Expected Views */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 font-semibold">
                        Expected Video / Reel Views
                      </span>
                      <span className="font-mono font-black text-amber-300">
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
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>

                  {/* Slider 2: Link Click-Through Rate */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 font-semibold">
                        Link Click-Through Rate (CTR)
                      </span>
                      <span className="font-mono font-black text-fuchsia-300">
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
                      className="w-full accent-fuchsia-400 cursor-pointer"
                    />
                  </div>

                  {/* Slider 3: Purchase Conversion Rate */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-300 font-semibold">
                        Buyer Conversion Rate
                      </span>
                      <span className="font-mono font-black text-emerald-300">
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
                      className="w-full accent-emerald-400 cursor-pointer"
                    />
                  </div>

                  {/* Slider 4: Avg Book Price + Tier Commission Selector */}
                  <div className="grid sm:grid-cols-2 gap-4 pt-1">
                    <div className="bg-black/40 border border-white/10 rounded-2xl p-3.5 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400">Avg eBook Price</span>
                        <span className="text-white font-mono">₹{bookPrice}</span>
                      </div>
                      <input
                        type="range"
                        min={99}
                        max={999}
                        step={50}
                        value={bookPrice}
                        onChange={(e) => setBookPrice(Number(e.target.value))}
                        className="w-full accent-sky-400 cursor-pointer"
                      />
                    </div>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-3.5 space-y-2">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-slate-400">Commission Tier</span>
                        <span className="text-amber-300 font-mono">
                          {calcCommissionRate}%
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-1">
                        {[40, 42, 45, 50].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => setCalcCommissionRate(rate)}
                            className={`py-1 rounded-lg text-[11px] font-bold transition ${
                              calcCommissionRate === rate
                                ? "bg-amber-400 text-black"
                                : "bg-white/5 text-slate-400 hover:text-white"
                            }`}
                          >
                            {rate}%
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Output Revenue Projection Card */}
                <div className="lg:col-span-5 bg-gradient-to-br from-[#19130a] via-[#0d0e1a] to-[#170b1f] border border-amber-400/35 rounded-3xl p-6 sm:p-7 text-center space-y-5 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
                  <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
                    Estimated Royalty (1 Video)
                  </span>

                  <div>
                    <p className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      ₹{calcProjections.estimatedEarnings.toLocaleString("en-IN")}
                    </p>
                    <p className="text-xs text-slate-400 mt-1.5">
                      ~{calcProjections.estimatedSales} books @ ₹
                      {calcProjections.commissionPerBook} royalty/book
                    </p>
                  </div>

                  <div className="bg-black/50 border border-white/10 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Videos / Reels per month:</span>
                      <div className="flex items-center gap-1">
                        {[2, 4, 8, 12].map((n) => (
                          <button
                            key={n}
                            onClick={() => setVideosPerMonth(n)}
                            className={`px-2 py-0.5 rounded-md font-bold ${
                              videosPerMonth === n
                                ? "bg-amber-400 text-black"
                                : "bg-white/10 text-slate-300"
                            }`}
                          >
                            {n}x
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-emerald-300 pt-1">
                      ₹{calcProjections.monthlyPotential.toLocaleString("en-IN")}{" "}
                      <span className="text-xs font-normal text-slate-400">
                        / month
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={handleCopyLink}
                    className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:brightness-110 text-black font-black py-3.5 rounded-2xl text-sm transition flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Copy size={16} /> Copy Unique Link & Start Promoting
                  </button>
                </div>
              </motion.div>
            )}

            {/* ==============================================================
                TAB 5: VIP CREATOR TIERS & PERKS
               ============================================================== */}
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
                          ? `bg-gradient-to-b from-[#1a1529] to-[#080910] border-amber-400/55 ${tier.glow}`
                          : isUnlocked
                          ? "bg-white/[0.04] border-emerald-400/30"
                          : "bg-white/[0.02] border-white/[0.08] opacity-75"
                      }`}
                    >
                      {isCurrent && (
                        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-orange-400 to-fuchsia-500" />
                      )}
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span
                            className={`text-xs font-bold px-3 py-1 rounded-full border ${tier.badgeBg} ${tier.border}`}
                          >
                            Tier {idx + 1}
                          </span>
                          {isCurrent ? (
                            <span className="text-[11px] font-black text-amber-300 uppercase">
                              ● Active
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

                      <div className="mt-5 pt-3 border-t border-white/[0.08] text-[11px] text-slate-400 font-mono">
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

      {/* ====================================================================
          DEMO / PREVIEW SANDBOX SWITCHER (100% PRESERVED)
         ==================================================================== */}
      <div className="fixed bottom-4 right-4 z-50">
        {demoModeBarOpen ? (
          <div className="bg-[#0d0f1a]/95 backdrop-blur-2xl border border-amber-400/35 rounded-2xl p-2.5 shadow-2xl flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-bold text-amber-300 px-2 flex items-center gap-1">
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
                className={`px-2.5 py-1.5 rounded-xl font-bold transition ${
                  viewState === st.id
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-black"
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
            className="bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/35 backdrop-blur-xl text-amber-200 px-3.5 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5 transition"
          >
            <Layers size={13} /> Switch Portal View
          </button>
        )}
      </div>
    </div>
  );
    }
