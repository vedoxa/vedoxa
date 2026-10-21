// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  Send,
  Users,
  ShieldAlert,
  Smile,
  Sparkles,
  Info,
  Loader2,
  ArrowDown,
  X,
  Heart,
  RefreshCw,
  Lock,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/* ------------------------------------------------------------------ */
/*  Supabase                                                           */
/* ------------------------------------------------------------------ */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

/* ------------------------------------------------------------------ */
/*  Settings                                                           */
/* ------------------------------------------------------------------ */

// 🚫 Gali blocker: yaha apne hisaab se aur shabd jod sakte hain (lowercase me).
const FORBIDDEN_WORDS = ["gali1", "gali2", "badword3", "fraud", "scam"];

const MAX_LEN = 500; // ek message ki max length
const COOLDOWN_MS = 1200; // spam rokne ke liye do messages ke beech ka gap
const GROUP_GAP_MS = 5 * 60 * 1000; // is gap ke andar ke messages ek group me dikhte hain
const RULES_KEY = "soul_circle_rules_v1";

const EMOJIS = ["😊", "🙏", "💛", "🌿", "✨", "🌸", "😌", "🥹", "🤗", "🔥", "🌅", "🌙", "💫", "🕉️", "❤️", "👏", "😂", "🙌", "🌈", "☀️", "🤍"];

// 💡 Suggestions: tap karte hi input me bhar jaate hain
const STARTERS = [
  { emoji: "🌿", label: "Aaj ka din", text: "Aaj mera din aisa raha: " },
  { emoji: "🙏", label: "Gratitude", text: "Aaj main is baat ke liye grateful hoon: " },
  { emoji: "💭", label: "Mann ki baat", text: "Mere mann me abhi ye vichaar chal raha hai: " },
  { emoji: "🌅", label: "Chhota goal", text: "Aaj ka mera ek chhota sa goal: " },
  { emoji: "✨", label: "Muskaan", text: "Aaj kisi ne mujhe muskurane ka mauka diya: " },
  { emoji: "🤝", label: "Saath chahiye", text: "Kya koi aaj mere saath baat karna chahega? " },
];

// 🌸 Roz ka reflection (din ke hisaab se badalta hai)
const REFLECTIONS = [
  "Aaj aap kis baat ke liye shukriya kehna chahenge? 🙏",
  "Ek gehri saans lijiye… ab batayiye, abhi aap kaisa mehsoos kar rahe hain? 🌿",
  "Aaj aapne khud ke liye kya accha kiya? ✨",
  "Woh kaun si cheez hai jo aapko sukoon deti hai? 🌅",
  "Aaj ki koi ek chhoti si jeet share kijiye 💛",
  "Mann ka bojh halka karna ho to yahan likh dijiye. Yahan sab sunne wale hain 🤍",
  "Kis insaan ne aapko aaj muskurana sikhaya? 🌸",
];

const RULES = [
  { emoji: "🙏", text: "Sabka samman kijiye. Gali, taane ya apmaan ki yahan jagah nahi hai." },
  { emoji: "💛", text: "Dusron ki baat dhyan se suniye. Judge mat kijiye, saath dijiye." },
  { emoji: "🔒", text: "Phone number, bank details ya address yahan share na karein." },
  { emoji: "🚫", text: "Spam, promotion aur fraud links allowed nahi hain." },
  { emoji: "🌿", text: "Agar aap bahut pareshaan hain, to Tele-MANAS 14416 (free, 24x7) par baat kar sakte hain." },
];

const AVATAR_GRADIENTS = [
  "from-fuchsia-300 to-purple-500",
  "from-sky-300 to-indigo-500",
  "from-emerald-300 to-teal-500",
  "from-amber-200 to-orange-400",
  "from-rose-300 to-pink-500",
  "from-cyan-200 to-blue-500",
];

const ORBS = [
  { color: "bg-violet-400/25", size: "h-[26rem] w-[26rem]", pos: "-top-28 -left-24", x: 40, y: 30, d: 22 },
  { color: "bg-rose-300/20", size: "h-[22rem] w-[22rem]", pos: "top-1/3 -right-28", x: -40, y: 40, d: 26 },
  { color: "bg-teal-300/20", size: "h-[24rem] w-[24rem]", pos: "-bottom-32 left-1/4", x: 30, y: -40, d: 30 },
  { color: "bg-amber-200/15", size: "h-72 w-72", pos: "bottom-1/4 -left-24", x: 36, y: -24, d: 24 },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
const keyOf = (m) => m._tempId ?? m.id ?? `${m.user_id}_${m.created_at}`;

const mergeMessages = (list) => {
  const seen = new Map();
  list.forEach((m) => seen.set(keyOf(m), m));
  return Array.from(seen.values()).sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
};

const hasForbiddenWord = (text) => {
  const lower = String(text).toLowerCase().normalize("NFKC");
  const splitter = /[^\p{L}\p{M}\p{N}]+/u;
  const tokens = [
    ...lower.split(splitter),
    // "s.c.a.m" jaise chhupe hue shabd bhi pakad me aayein
    ...lower.replace(/[._\-*@$#]+/g, "").split(splitter),
  ].filter(Boolean);
  return tokens.some((t) => FORBIDDEN_WORDS.some((w) => t.includes(w.toLowerCase())));
};

const isValidDate = (d) => !Number.isNaN(new Date(d).getTime());

const dayKey = (d) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${x.getMonth()}-${x.getDate()}`;
};

const dayLabel = (d) => {
  if (!isValidDate(d)) return "";
  const x = new Date(d);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(x) === dayKey(today)) return "Aaj";
  if (dayKey(x) === dayKey(yesterday)) return "Kal";
  return x.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const timeLabel = (d) =>
  isValidDate(d)
    ? new Date(d).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true })
    : "";

const hashString = (s = "") => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/* ------------------------------------------------------------------ */
/*  Small components                                                   */
/* ------------------------------------------------------------------ */
function Avatar({ name, seed, size = "h-8 w-8", text = "text-xs", ring = false }) {
  const initial = (Array.from(String(name || "S").trim())[0] || "S").toUpperCase();
  const gradient = AVATAR_GRADIENTS[hashString(String(seed || name || "")) % AVATAR_GRADIENTS.length];
  return (
    <div
      title={name}
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradient} ${size} ${text} font-bold text-white/95 shadow-md ${
        ring ? "ring-2 ring-[#1a1636]" : ""
      }`}
    >
      {initial}
    </div>
  );
}

function TypingDots() {
  return (
    <span className="ml-1.5 inline-flex items-end gap-0.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-1 w-1 rounded-full bg-current"
          animate={{ y: [0, -3, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */
export default function SoulCirclePage() {
  const reduceMotion = useReducedMotion();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [toast, setToast] = useState(null);

  const [online, setOnline] = useState([]);
  const [typing, setTyping] = useState({});
  const [connection, setConnection] = useState("connecting"); // connecting | live | offline

  const [unread, setUnread] = useState(0);
  const [showJump, setShowJump] = useState(false);
  const [reflection, setReflection] = useState(REFLECTIONS[0]);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const channelRef = useRef(null);
  const atBottomRef = useRef(true);
  const prevLenRef = useRef(0);
  const lastSentAt = useRef(0);
  const lastTypingSent = useRef(0);
  const typingTimers = useRef({});
  const toastTimer = useRef(null);
  const userIdRef = useRef(null);

  const displayName =
    profile?.name || user?.user_metadata?.full_name || user?.user_metadata?.name || "Seeker";
  userIdRef.current = user?.id ?? null;

  /* ---------------- toast ---------------- */
  const notify = (tone, text) => {
    clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), tone, text });
    toastTimer.current = setTimeout(() => setToast(null), 3400);
  };

  /* ---------------- load messages ---------------- */
  const loadMessages = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const { data, error } = await supabase
        .from("soul_circle_chats")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      const fresh = (data || []).slice().reverse();
      setMessages((prev) => mergeMessages([...fresh, ...prev]));
    } catch (e) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- first load: auth, rules, daily reflection, chats ---------------- */
  useEffect(() => {
    let active = true;

    // roz ka reflection (client par hi nikalte hain taaki hydration error na aaye)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setReflection(REFLECTIONS[dayOfYear % REFLECTIONS.length]);

    try {
      if (!localStorage.getItem(RULES_KEY)) setShowRules(true);
    } catch (e) {}

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const u = data?.session?.user ?? null;
        if (!active) return;
        setUser(u);
        if (u) {
          const { data: prof } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
          if (active && prof) setProfile(prof);
        }
      } catch (e) {
        /* guest mode me chalte raho */
      } finally {
        if (active) setAuthReady(true);
      }
    })();

    loadMessages();

    return () => {
      active = false;
      clearTimeout(toastTimer.current);
      Object.values(typingTimers.current).forEach((t) => clearTimeout(t));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- realtime: chats + presence + typing ---------------- */
  useEffect(() => {
    if (!authReady) return;

    let cancelled = false;
    let channel = null;

    // setTimeout(0): React StrictMode ke double-mount me channel do baar na bane
    const starter = setTimeout(() => {
      if (cancelled) return;

      const presenceKey = user?.id || `guest-${Math.random().toString(36).slice(2, 9)}`;
      channel = supabase.channel("soul_circle_room", {
        config: { presence: { key: presenceKey }, broadcast: { self: false } },
      });
      channelRef.current = channel;

      channel
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "soul_circle_chats" }, (payload) => {
          const row = payload.new;
          if (!row) return;
          setMessages((prev) => (prev.some((m) => !m._tempId && keyOf(m) === keyOf(row)) ? prev : [...prev, row]));
          // jisne message bheja uska "typing" hata do
          setTyping((prev) => {
            if (!prev[row.user_id]) return prev;
            const next = { ...prev };
            delete next[row.user_id];
            return next;
          });
        })
        .on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const list = Object.entries(state).map(([key, metas]) => ({
            key,
            name: (metas && metas[0] && metas[0].name) || "Seeker",
          }));
          setOnline(list);
        })
        .on("broadcast", { event: "typing" }, ({ payload }) => {
          const key = payload?.key;
          if (!key) return;
          setTyping((prev) => ({ ...prev, [key]: payload.name || "Seeker" }));
          clearTimeout(typingTimers.current[key]);
          typingTimers.current[key] = setTimeout(() => {
            setTyping((prev) => {
              const next = { ...prev };
              delete next[key];
              return next;
            });
          }, 3000);
        })
        .subscribe(async (status) => {
          if (cancelled) return;
          if (status === "SUBSCRIBED") {
            setConnection("live");
            try {
              await channel.track({ name: user ? displayName : "Guest", at: Date.now() });
            } catch (e) {}
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            setConnection("offline");
          }
        });
    }, 0);

    return () => {
      cancelled = true;
      clearTimeout(starter);
      channelRef.current = null;
      if (channel) supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, user?.id]);

  /* ---------------- auto scroll ---------------- */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const added = messages.length - prevLenRef.current;
    const initial = prevLenRef.current === 0;
    const last = messages[messages.length - 1];
    prevLenRef.current = messages.length;
    if (added <= 0) return;

    if (initial || atBottomRef.current || (last && last.user_id === userIdRef.current)) {
      el.scrollTo({ top: el.scrollHeight, behavior: initial ? "auto" : "smooth" });
      setUnread(0);
    } else {
      setUnread((u) => u + added);
    }
  }, [messages]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    atBottomRef.current = nearBottom;
    setShowJump(!nearBottom);
    if (nearBottom) setUnread(0);
  };

  const jumpToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    setUnread(0);
  };

  /* ---------------- textarea auto-grow ---------------- */
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input]);

  /* ---------------- rules modal ---------------- */
  const closeRules = () => {
    setShowRules(false);
    try {
      localStorage.setItem(RULES_KEY, "1");
    } catch (e) {}
  };

  useEffect(() => {
    if (!showRules) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeRules();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showRules]);

  /* ---------------- input handlers ---------------- */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (!user || connection !== "live" || !value.trim()) return;
    const now = Date.now();
    if (now - lastTypingSent.current < 2000) return;
    lastTypingSent.current = now;
    try {
      const p = channelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: { key: user.id, name: displayName },
      });
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  };

  const applyText = (text) => {
    setInput(text.slice(0, MAX_LEN));
    setShowEmoji(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const addEmoji = (emoji) => {
    setInput((v) => (v + emoji).slice(0, MAX_LEN));
    inputRef.current?.focus();
  };

  /* ---------------- send ---------------- */
  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text) return;
    if (!user) {
      notify("info", "Chat karne ke liye pehle login kijiye.");
      return;
    }
    if (Date.now() - lastSentAt.current < COOLDOWN_MS) {
      notify("info", "Thoda dheere… ek-ek karke bhejiye 🌿");
      return;
    }

    // 🔴 Profanity filter
    if (hasForbiddenWord(text)) {
      notify("warn", "Warning: Inappropriate words are strictly not allowed! (गलत शब्दों का प्रयोग वर्जित है।)");
      setInput("");
      return; // message insert hi nahi hoga
    }

    lastSentAt.current = Date.now();
    const tempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const optimistic = {
      _tempId: tempId,
      _pending: true,
      user_id: user.id,
      user_name: displayName,
      message: text,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    setInput("");
    setShowEmoji(false);

    try {
      const { data, error } = await supabase
        .from("soul_circle_chats")
        .insert([{ user_id: user.id, user_name: displayName, message: text }])
        .select()
        .single();
      if (error) throw error;
      setMessages((prev) => {
        const rest = prev.filter((m) => m._tempId !== tempId);
        if (!data) return rest;
        return rest.some((m) => keyOf(m) === keyOf(data)) ? rest : [...rest, data];
      });
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m._tempId !== tempId));
      setInput(text);
      notify("error", "Message nahi ja paya. Internet check karke dobara koshish kijiye.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent?.isComposing) return;
    // mobile par Enter = nayi line, bhejne ke liye send button
    const coarse = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (coarse) return;
    e.preventDefault();
    handleSendMessage();
  };

  /* ---------------- derived ---------------- */
  const onlineCount = Math.max(online.length, 1);
  const typingNames = Object.values(typing);
  const typingText =
    typingNames.length === 1
      ? `${typingNames[0]} is typing`
      : typingNames.length === 2
      ? `${typingNames[0]} & ${typingNames[1]} are typing`
      : "Several seekers are typing";

  const connectionUi = {
    live: { dot: "bg-emerald-400", label: "Live", text: "text-emerald-300" },
    connecting: { dot: "bg-amber-300", label: "Connecting", text: "text-amber-200" },
    offline: { dot: "bg-rose-400", label: "Offline", text: "text-rose-300" },
  }[connection];

  const toastStyle = {
    warn: "border-amber-300/30 bg-amber-400/15 text-amber-100",
    error: "border-rose-300/30 bg-rose-400/15 text-rose-100",
    info: "border-sky-300/30 bg-sky-400/15 text-sky-100",
  };

  /* ================================================================ */
  /*  UI                                                               */
  /* ================================================================ */
  return (
    <div className="relative isolate flex h-[100dvh] flex-col overflow-hidden bg-[#13112a] font-sans text-white/90">
      {/* 🌌 Soft twilight background */}
      <div className="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1d1844] via-[#16132f] to-[#0f1a2c]" />
        {ORBS.map((o, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full blur-3xl will-change-transform ${o.color} ${o.size} ${o.pos}`}
            animate={reduceMotion ? undefined : { x: [0, o.x, 0], y: [0, o.y, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: o.d, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.07),transparent_60%)]" />
      </div>

      {/* 🔔 Toast */}
      <div className="pointer-events-none fixed inset-x-0 top-20 z-[70] flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -14, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -14, scale: 0.97 }}
              transition={{ duration: 0.2 }}
              role="status"
              className={`pointer-events-auto flex max-w-md items-start gap-2.5 rounded-2xl border px-4 py-3 text-sm shadow-2xl backdrop-blur-xl ${
                toastStyle[toast.tone] || toastStyle.info
              }`}
            >
              {toast.tone === "info" ? (
                <Info size={18} className="mt-0.5 shrink-0" />
              ) : (
                <ShieldAlert size={18} className="mt-0.5 shrink-0" />
              )}
              <span className="leading-snug">{toast.text}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🧭 Header */}
      <header className="relative z-30 border-b border-white/10 bg-[#120f2a]/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-3 py-3 sm:px-4">
          <Link
            href="/explore"
            aria-label="Exit Circle"
            className="inline-flex h-10 items-center gap-1 rounded-full px-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft size={18} />
            <span className="hidden sm:inline">Exit Circle</span>
          </Link>

          <div className="min-w-0 flex-1">
            <h1 className="truncate font-serif text-xl leading-tight tracking-wide text-amber-100">Soul Circle</h1>
            <p className="flex items-center gap-1.5 text-[11px] text-white/45">
              <span className={`h-1.5 w-1.5 rounded-full ${connectionUi.dot} ${connection === "live" ? "animate-pulse" : ""}`} />
              <span className={connectionUi.text}>{connectionUi.label}</span>
              <span className="truncate">· Dil ki baat, dil se</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-400/10 py-1 pl-1.5 pr-3 text-xs font-semibold text-emerald-300">
              {online.length > 0 ? (
                <div className="flex -space-x-2">
                  {online.slice(0, 3).map((p) => (
                    <Avatar key={p.key} name={p.name} seed={p.key} size="h-6 w-6" text="text-[10px]" ring />
                  ))}
                </div>
              ) : (
                <Users size={14} className="ml-1.5" />
              )}
              <span>{onlineCount} Online</span>
            </div>
            <button
              type="button"
              onClick={() => setShowRules(true)}
              aria-label="Circle ke niyam"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-amber-200"
            >
              <ShieldAlert size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* 💬 Messages */}
      <div className="relative min-h-0 flex-1">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
          className="h-full overflow-y-auto overscroll-contain scroll-smooth"
        >
          <div className="mx-auto w-full max-w-3xl px-3 py-5 sm:px-4">
            {/* loading skeleton */}
            {loading && messages.length === 0 && (
              <div className="space-y-4 py-2">
                {["w-48", "w-64", "w-40", "w-56", "w-52"].map((w, i) => (
                  <div key={i} className={`flex ${i % 2 ? "justify-end" : "justify-start"}`}>
                    <div className={`h-12 animate-pulse rounded-2xl bg-white/[0.07] ${w}`} />
                  </div>
                ))}
              </div>
            )}

            {/* error */}
            {loadError && !loading && messages.length === 0 && (
              <div className="mx-auto mt-16 max-w-xs rounded-3xl border border-white/10 bg-white/[0.05] p-6 text-center backdrop-blur-md">
                <p className="text-sm leading-relaxed text-white/70">
                  Chat load nahi ho paayi. Internet check karke dobara koshish kijiye.
                </p>
                <button
                  type="button"
                  onClick={loadMessages}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-amber-300/90 px-4 py-2 text-sm font-bold text-[#2b1d0e] transition hover:bg-amber-200"
                >
                  <RefreshCw size={15} /> Dobara try karein
                </button>
              </div>
            )}

            {/* empty */}
            {!loading && !loadError && messages.length === 0 && (
              <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 text-center">
                <motion.div
                  animate={reduceMotion ? undefined : { y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-amber-200/30 to-rose-300/20 shadow-xl shadow-amber-200/10"
                >
                  <Sparkles size={26} className="text-amber-100" />
                </motion.div>
                <h2 className="font-serif text-2xl text-amber-50">The Circle is calm</h2>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-white/50">
                  Pehla transmission aapka ho sakta hai. Jo mann me hai, yahan kehiye.
                </p>

                <div className="mt-7 w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.05] p-5 text-left backdrop-blur-md">
                  <p className="text-xs font-semibold text-amber-200/80">Aaj ka reflection</p>
                  <p className="mt-2 text-[15px] leading-relaxed text-white/85">{reflection}</p>
                  {user && (
                    <button
                      type="button"
                      onClick={() => applyText(`${reflection} `)}
                      className="mt-4 rounded-full border border-amber-200/30 bg-amber-200/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-200/20"
                    >
                      Is par baat shuru karein
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* message list */}
            {messages.map((msg, i) => {
              const prev = messages[i - 1];
              const next = messages[i + 1];
              const isMe = !!user && msg.user_id === user.id;

              const newDay = !prev || dayKey(prev.created_at) !== dayKey(msg.created_at);
              const gapPrev = prev ? new Date(msg.created_at) - new Date(prev.created_at) : 0;
              const startsGroup = newDay || prev.user_id !== msg.user_id || gapPrev > GROUP_GAP_MS;

              const gapNext = next ? new Date(next.created_at) - new Date(msg.created_at) : 0;
              const endsGroup =
                !next ||
                dayKey(next.created_at) !== dayKey(msg.created_at) ||
                next.user_id !== msg.user_id ||
                gapNext > GROUP_GAP_MS;

              return (
                <div key={keyOf(msg)}>
                  {newDay && isValidDate(msg.created_at) && (
                    <div className="my-5 flex justify-center">
                      <span className="rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1 text-[11px] font-medium text-white/50 backdrop-blur-md">
                        {dayLabel(msg.created_at)}
                      </span>
                    </div>
                  )}

                  <motion.div
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className={`flex items-end gap-2 ${isMe ? "justify-end" : "justify-start"} ${
                      startsGroup && !newDay ? "mt-4" : "mt-1"
                    }`}
                  >
                    {!isMe && (
                      <div className="w-8 shrink-0">
                        {endsGroup && <Avatar name={msg.user_name} seed={msg.user_id} />}
                      </div>
                    )}

                    <div className={`flex max-w-[78%] flex-col sm:max-w-[65%] ${isMe ? "items-end" : "items-start"}`}>
                      {!isMe && startsGroup && (
                        <span className="mb-1 px-1 text-[11px] font-semibold text-white/50">{msg.user_name}</span>
                      )}

                      <div
                        className={`whitespace-pre-wrap px-4 py-2.5 text-[15px] leading-relaxed shadow-lg [overflow-wrap:anywhere] ${
                          isMe
                            ? "rounded-2xl rounded-br-md bg-gradient-to-br from-[#f8dca6] to-[#f0b66b] font-medium text-[#2b1d0e] shadow-amber-900/20"
                            : "rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.08] text-white/90 shadow-black/20 backdrop-blur-md"
                        } ${msg._pending ? "opacity-70" : ""}`}
                      >
                        {msg.message}
                      </div>

                      {endsGroup && (
                        <span className="mt-1 flex items-center gap-1 px-1 text-[10px] text-white/35">
                          {msg._pending && <Loader2 size={10} className="animate-spin" />}
                          {timeLabel(msg.created_at)}
                        </span>
                      )}
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ⬇ jump to latest */}
        <AnimatePresence>
          {showJump && (
            <motion.button
              type="button"
              onClick={jumpToBottom}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ duration: 0.18 }}
              aria-label="Latest message par jaayein"
              className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-full border border-white/15 bg-[#241f52]/90 px-3.5 py-2 text-xs font-semibold text-amber-100 shadow-xl backdrop-blur-xl transition hover:bg-[#2d2764]"
            >
              <ArrowDown size={15} />
              {unread > 0 ? `${unread} naye` : "Latest"}
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ✍️ Composer */}
      <div className="relative z-30 border-t border-white/10 bg-[#120f2a]/60 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl">
        <div className="mx-auto w-full max-w-3xl px-3 sm:px-4">
          {/* typing indicator (fixed height: layout jump nahi hoga) */}
          <div className="flex h-6 items-center px-2 text-xs text-emerald-300/80" aria-live="polite">
            {typingNames.length > 0 && (
              <span className="inline-flex items-center">
                {typingText}
                <TypingDots />
              </span>
            )}
          </div>

          {/* 💡 suggestions */}
          {user && !input && (
            <div className="mb-2 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {STARTERS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => applyText(s.text)}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3.5 py-1.5 text-xs font-medium text-white/70 transition hover:border-amber-200/40 hover:bg-amber-200/10 hover:text-amber-100 active:scale-95"
                >
                  <span>{s.emoji}</span>
                  {s.label}
                </button>
              ))}
            </div>
          )}

          {/* login banner */}
          {authReady && !user && (
            <div className="mb-2 flex items-center gap-3 rounded-2xl border border-amber-200/20 bg-amber-200/10 px-4 py-3 text-sm text-amber-100">
              <Lock size={16} className="shrink-0" />
              <span className="flex-1 leading-snug">Baat-cheet me judne ke liye login kijiye.</span>
              <Link
                href="/login"
                className="shrink-0 rounded-full bg-amber-300 px-3.5 py-1.5 text-xs font-bold text-[#2b1d0e] transition hover:bg-amber-200"
              >
                Login
              </Link>
            </div>
          )}

          <div className="relative">
            {/* emoji picker */}
            <AnimatePresence>
              {showEmoji && user && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 z-40 mb-2 grid grid-cols-7 gap-1 rounded-2xl border border-white/10 bg-[#1b1740]/95 p-2 shadow-2xl backdrop-blur-xl"
                >
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => addEmoji(e)}
                      className="h-9 w-9 rounded-xl text-xl transition hover:bg-white/10 active:scale-90"
                    >
                      {e}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-end gap-1.5 rounded-3xl border border-white/10 bg-white/[0.06] p-2 shadow-xl shadow-black/20 backdrop-blur-md transition focus-within:border-amber-200/50 focus-within:bg-white/[0.09]">
              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                disabled={!user}
                aria-label="Emoji"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/55 transition hover:bg-white/10 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Smile size={20} />
              </button>

              <textarea
                ref={inputRef}
                rows={1}
                maxLength={MAX_LEN}
                value={input}
                disabled={!user}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={user ? "Type your transmission…" : "Please log in to chat…"}
                aria-label="Message likhiye"
                className="max-h-[120px] min-h-[40px] flex-1 resize-none bg-transparent px-1 py-2.5 text-[15px] leading-snug text-white outline-none placeholder:text-white/35 disabled:cursor-not-allowed"
              />

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={!input.trim() || !user}
                aria-label="Send"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#f8dca6] to-[#f0b66b] text-[#2b1d0e] shadow-lg shadow-amber-900/30 transition hover:brightness-105 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send size={18} />
              </button>
            </div>
          </div>

          <div className="flex h-5 items-center justify-between px-3 pt-1.5 text-[10px] text-white/30">
            <span className="hidden sm:inline">Enter se bhejiye · Shift+Enter se nayi line</span>
            <span className="sm:hidden">Pyaar se baat kijiye 🤍</span>
            {input.length > MAX_LEN - 100 && (
              <span className={input.length >= MAX_LEN ? "text-rose-300" : ""}>
                {input.length}/{MAX_LEN}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 📜 Circle ke niyam */}
      <AnimatePresence>
        {showRules && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeRules}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 backdrop-blur-sm sm:items-center"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Circle ke niyam"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", damping: 26, stiffness: 260 }}
              className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#1a1636]/95 p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={closeRules}
                aria-label="Band karein"
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="mb-1 flex items-center gap-2 text-amber-100">
                <Heart size={20} />
                <h2 className="font-serif text-2xl">Circle ke niyam</h2>
              </div>
              <p className="mb-5 text-sm text-white/50">Ye jagah sabke sukoon ke liye hai.</p>

              <ul className="space-y-3">
                {RULES.map((r) => (
                  <li key={r.text} className="flex gap-3 text-sm leading-relaxed text-white/80">
                    <span className="text-lg leading-none">{r.emoji}</span>
                    <span>{r.text}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={closeRules}
                className="mt-6 w-full rounded-2xl bg-gradient-to-br from-[#f8dca6] to-[#f0b66b] py-3 text-sm font-bold text-[#2b1d0e] shadow-lg shadow-amber-900/30 transition hover:brightness-105 active:scale-[0.98]"
              >
                Samajh gaya, Circle me jaayein 🙏
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
