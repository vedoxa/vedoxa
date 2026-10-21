// @ts-nocheck
"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronLeft, Sparkles, BookOpen, User, Briefcase, Heart, ArrowRight,
  CheckCircle2, Check, Star, Target, Zap, Gift, RefreshCw, Clock, Share2, Shuffle
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Supabase Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

/* =========================================================
   QUIZ DATA (Bilingual - English & Hinglish)
   ========================================================= */
const QUIZ_STEPS = [
  {
    id: "name", type: "input", icon: User,
    title: "What should we call you?",
    subtitle: "Aapka shubh naam kya hai?",
    placeholder: "Type your name / Apna naam likhein",
  },
  {
    id: "age", type: "choice", icon: Sparkles,
    title: "What is your age group?",
    subtitle: "Aapki umar kitni hai?",
    options: [
      { label: "Under 18", value: "under_18", sub: "Teenager (Kishor)", emoji: "🌱" },
      { label: "18 - 24", value: "18_24", sub: "Youth (Yuva)", emoji: "✨" },
      { label: "25 - 35", value: "25_35", sub: "Adult (Vayask)", emoji: "🚀" },
      { label: "35+", value: "above_35", sub: "Experienced (Anubhavi)", emoji: "🌳" },
      { label: "Prefer not to say", value: "not_say", sub: "Bataana nahi chahte", emoji: "🙂" },
    ],
  },
  {
    id: "profession", type: "choice", icon: Briefcase,
    title: "What do you do?",
    subtitle: "Aap kya karte hain?",
    options: [
      { label: "Student", value: "Student", sub: "Padhai kar rahe hain", emoji: "🎓" },
      { label: "Professional", value: "Professional", sub: "Job karte hain", emoji: "💼" },
      { label: "Business Owner", value: "Business", sub: "Apna vyapar hai", emoji: "🏪" },
      { label: "Homemaker", value: "Homemaker", sub: "Ghar sambhalte hain", emoji: "🏡" },
      { label: "Freelancer / Creator", value: "Creator", sub: "Apna creative kaam", emoji: "🎨" },
      { label: "Job Seeker", value: "Job Seeker", sub: "Naukri ki talaash me", emoji: "🔍" },
    ],
  },
  {
    id: "interest", type: "choice", multi: true, max: 3, icon: BookOpen,
    title: "What kind of books do you love?",
    subtitle: "Aapko kaisi kitabein pasand hain? (3 tak chunein)",
    options: [
      { label: "Self-Help", value: "self_help", sub: "Khud ko behtar banane ke liye", emoji: "🌟" },
      { label: "Spiritual", value: "spiritual", sub: "Dharmik aur shanti ke liye", emoji: "🕉️" },
      { label: "Business & Finance", value: "business", sub: "Paisa aur career", emoji: "📈" },
      { label: "Stories & Fiction", value: "fiction", sub: "Kahaniyan aur manoranjan", emoji: "📖" },
      { label: "Health & Wellness", value: "health", sub: "Sehat aur fitness", emoji: "🧘" },
      { label: "Love & Relationships", value: "relationships", sub: "Rishte aur parivaar", emoji: "💞" },
      { label: "Study & Knowledge", value: "learning", sub: "Padhai aur gyan", emoji: "🧠" },
      { label: "Poetry & Shayari", value: "poetry", sub: "Kavita aur shayari", emoji: "✍️" },
    ],
  },
  {
    id: "mood", type: "choice", icon: Heart,
    title: "What are you looking for right now?",
    subtitle: "Abhi aap zindagi me kya chahte hain?",
    options: [
      { label: "Peace of Mind", value: "Peace", sub: "Dimaagi shanti", emoji: "🕊️" },
      { label: "Motivation", value: "Motivation", sub: "Aage badhne ki prerna", emoji: "🔥" },
      { label: "Focus & Growth", value: "Focus", sub: "Kaam me dhyan", emoji: "🎯" },
      { label: "Relaxation", value: "Relaxation", sub: "Bas thoda sukoon", emoji: "☕" },
      { label: "Confidence", value: "Confidence", sub: "Khud par bharosa", emoji: "💪" },
      { label: "Healing", value: "Healing", sub: "Purane dard se aage badhna", emoji: "🌼" },
    ],
  },
  {
    id: "read_time", type: "choice", icon: Clock,
    title: "How much time can you give to reading?",
    subtitle: "Roz kitna waqt padh sakte hain?",
    options: [
      { label: "10 min a day", value: "10", sub: "Thoda sa waqt, bas shuruaat", emoji: "🌙" },
      { label: "20 min a day", value: "20", sub: "Chai ke saath ek chhoti si baithak", emoji: "☕" },
      { label: "45 min a day", value: "45", sub: "Aaram se, dhyan se", emoji: "📚" },
      { label: "1 hour+ a day", value: "60", sub: "Kitabon ka asli shauk", emoji: "🌅" },
    ],
  },
];

const TOTAL = QUIZ_STEPS.length;

// Chhote encouragement messages (user ko comfortable feel karane ke liye)
const CHEER = [
  "Chaliye shuru karte hain 🌱",
  "Bahut badhiya! Aage badhte hain ✨",
  "Aadha raasta tay ho gaya 🎯",
  "Aap bahut achha kar rahe hain 💛",
  "Bas ek aur sawaal 🌟",
  "Last step! 🎉",
];

const LOADING_STEPS = [
  "Aapke jawab padh rahe hain",
  "Library me kitaabein dhoondh rahe hain",
  "Aapke liye best pick chun rahe hain",
];

// Design Themes (book ke hisaab se fixed, random nahi - taaki flicker na ho)
const CARD_THEMES = [
  { theme: "from-orange-500 to-amber-600", shadow: "shadow-orange-500/30" },
  { theme: "from-blue-500 to-cyan-600", shadow: "shadow-blue-500/30" },
  { theme: "from-emerald-500 to-green-600", shadow: "shadow-emerald-500/30" },
  { theme: "from-purple-500 to-pink-600", shadow: "shadow-purple-500/30" },
];

// Smart matching keywords (English + Hindi/Hinglish)
const INTEREST_KEYWORDS = {
  self_help: ["self help", "self-help", "habit", "mindset", "motivat", "growth", "success", "confidence", "safalta", "jeet", "aadat", "soch", "personality", "discipline"],
  spiritual: ["spiritual", "gita", "geeta", "bhagavad", "dharm", "karma", "meditat", "yoga", "shanti", "adhyatm", "bhakti", "mantra", "ramayan", "upanishad", "bhagwan"],
  business: ["business", "finance", "money", "invest", "wealth", "entrepreneur", "startup", "career", "paisa", "vyapar", "market", "stock", "sales", "leadership", "marketing"],
  fiction: ["story", "stories", "fiction", "novel", "kahani", "tale", "adventure", "mystery", "thriller", "romance", "upanyas"],
  health: ["health", "fitness", "diet", "wellness", "yoga", "sleep", "swasthya", "nutrition"],
  relationships: ["love", "relationship", "family", "marriage", "parenting", "friend", "rishte", "pyar", "dosti"],
  learning: ["learn", "study", "exam", "education", "skill", "science", "history", "knowledge", "padhai", "gyan", "english", "coding"],
  poetry: ["poem", "poetry", "shayari", "kavita", "ghazal", "shayar"],
};

const MOOD_KEYWORDS = {
  Peace: ["peace", "calm", "shanti", "sukoon", "sakoon", "meditat", "stress", "anxiety"],
  Motivation: ["motivat", "inspire", "success", "safalta", "jeet", "winner", "goal", "achieve", "prerna"],
  Focus: ["focus", "concentrat", "productiv", "deep work", "discipline", "habit", "dhyan"],
  Relaxation: ["relax", "sukoon", "sakoon", "story", "kahani", "cozy"],
  Confidence: ["confidence", "courage", "fear", "speak", "personality", "self esteem", "himmat"],
  Healing: ["heal", "grief", "heartbreak", "hope", "forgive", "trauma", "pain", "moving on", "dard"],
};

const PROFESSION_KEYWORDS = {
  Student: ["student", "exam", "study", "learn", "padhai", "school", "college"],
  Professional: ["career", "work", "job", "leadership", "productiv", "office", "communication"],
  Business: ["business", "entrepreneur", "startup", "sales", "money", "finance", "marketing", "vyapar"],
  Homemaker: ["family", "parenting", "home", "cook", "health", "relationship", "ghar"],
  Creator: ["creative", "creator", "art", "design", "writing", "freelanc", "content"],
  "Job Seeker": ["career", "interview", "resume", "job", "skills", "communication"],
};

/* =========================================================
   HELPERS (module level = fast, no re-creation on render)
   ========================================================= */
const norm = (s) => String(s || "").toLowerCase();

const toList = (v) =>
  Array.isArray(v) ? v : v ? String(v).split(",").map((s) => s.trim()).filter(Boolean) : [];

const hitCount = (hay, words) => words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0);

const LEGACY_LABELS = { "Creator/Other": "Homemaker / Other" };

const labelOf = (stepId, value) => {
  const def = QUIZ_STEPS.find((s) => s.id === stepId);
  const opt = def && def.options ? def.options.find((o) => o.value === value) : null;
  return opt ? opt.label : LEGACY_LABELS[value] || "";
};

const isValidValue = (stepId, value) => {
  const def = QUIZ_STEPS.find((s) => s.id === stepId);
  return !!(def && def.options && def.options.some((o) => o.value === value));
};

const isStepAnswered = (def, a) => {
  const v = a[def.id];
  if (def.type === "input") return String(v || "").trim() !== "";
  if (def.multi) return toList(v).length > 0;
  return !!v;
};

const themeFor = (book) => {
  const key = String(book && book.id != null ? book.id : book && book.title ? book.title : "x");
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 9973;
  return CARD_THEMES[h % CARD_THEMES.length];
};

const haptic = () => {
  try { if (navigator.vibrate) navigator.vibrate(8); } catch (e) {}
};

// Smart ranking: har book ko score do, top picks wapas karo
function rankBooks(books, a) {
  if (!Array.isArray(books) || books.length === 0) return [];
  const interests = toList(a.interest);
  const wantedMinutes = Number(a.read_time) || 0;

  const ranked = books.map((book) => {
    const tags = Array.isArray(book.tags) ? book.tags.join(" ") : book.tags;
    const hay = norm(`${book.title} ${book.author || ""} ${book.description || ""} ${tags || ""} ${book.category || ""}`);
    let score = 0;
    const reasons = [];

    interests.forEach((i) => {
      const hits = hitCount(hay, INTEREST_KEYWORDS[i] || []);
      if (hits) { score += 3 + Math.min(hits - 1, 2); reasons.push({ type: "interest", value: i }); }
    });

    const mh = hitCount(hay, MOOD_KEYWORDS[a.mood] || []);
    if (mh) { score += 2 + Math.min(mh - 1, 2) * 0.5; reasons.push({ type: "mood", value: a.mood }); }

    const ph = hitCount(hay, PROFESSION_KEYWORDS[a.profession] || []);
    if (ph) { score += 1; reasons.push({ type: "profession", value: a.profession }); }

    const pages = Number(book.pages) || 0;
    if (wantedMinutes && pages) {
      if (wantedMinutes <= 10 && pages <= 150) { score += 1; reasons.push({ type: "length", value: "short" }); }
      else if (wantedMinutes >= 45 && pages >= 150) { score += 0.5; reasons.push({ type: "length", value: "long" }); }
    }

    // Popularity sirf tie-break ke liye
    const pop = Math.min(0.9, Math.log10(1 + (Number(book.likes) || 0) * 3 + (Number(book.views) || 0) * 0.2) / 5);
    return { book, score, reasons, rank: score + pop, theme: themeFor(book) };
  });

  ranked.sort((x, y) => y.rank - x.rank);
  return ranked.slice(0, 4);
}

const describeReason = (r) => {
  if (r.type === "interest") return `Aapki pasand "${labelOf("interest", r.value)}" se match karti hai`;
  if (r.type === "mood") return `"${labelOf("mood", r.value)}" ke liye helpful lagegi`;
  if (r.type === "profession") return `${labelOf("profession", r.value)} ke liye kaam ki hai`;
  if (r.type === "length" && r.value === "short") return "Chhoti aur halki book, roz thoda padhkar bhi khatam ho jayegi";
  if (r.type === "length") return "Aaram se gehraai me padhne ke liye achhi length";
  return "";
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 5) return "Shubh ratri 🌙";
  if (h < 12) return "Shubh prabhat ☀️";
  if (h < 17) return "Namaste 🙏";
  if (h < 21) return "Shubh sandhya 🌇";
  return "Shubh ratri 🌙";
};

const QUIZ_CSS = `
@keyframes qz-float { 0%,100% { transform: translate3d(0,0,0) rotate(0deg); } 50% { transform: translate3d(0,-10px,0) rotate(4deg); } }
@keyframes qz-glow { 0%,100% { opacity: .5; transform: scale(1); } 50% { opacity: 1; transform: scale(1.07); } }
@keyframes qz-shine { 0% { transform: translateX(-150%) skewX(-20deg); } 55%,100% { transform: translateX(350%) skewX(-20deg); } }
@keyframes qz-drift-a { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(6%,5%,0); } }
@keyframes qz-drift-b { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(-6%,-4%,0); } }
.qz-float { animation: qz-float 6s ease-in-out infinite; will-change: transform; }
.qz-glow { animation: qz-glow 2.2s ease-in-out infinite; will-change: transform, opacity; }
.qz-shine { animation: qz-shine 3.4s ease-in-out infinite; will-change: transform; }
.qz-orb { position: absolute; border-radius: 9999px; will-change: transform; }
.qz-orb-a { top: -15%; left: -20%; width: 70vmax; height: 70vmax; background: radial-gradient(circle, rgba(251,191,36,.13), transparent 62%); animation: qz-drift-a 22s ease-in-out infinite; }
.qz-orb-b { bottom: -20%; right: -20%; width: 70vmax; height: 70vmax; background: radial-gradient(circle, rgba(139,92,246,.17), transparent 62%); animation: qz-drift-b 26s ease-in-out infinite; }
.qz-noscroll { scrollbar-width: none; -ms-overflow-style: none; }
.qz-noscroll::-webkit-scrollbar { display: none; }
@media (prefers-reduced-motion: reduce) {
  .qz-float, .qz-glow, .qz-shine, .qz-orb { animation: none !important; }
}
`;

const FLOATERS = [
  { Icon: BookOpen, cls: "left-[4%] top-[2%]", d: "0s", s: 26 },
  { Icon: Star, cls: "right-[6%] top-[8%]", d: "1.2s", s: 20 },
  { Icon: Heart, cls: "left-[8%] bottom-[10%]", d: "2.1s", s: 22 },
  { Icon: Sparkles, cls: "right-[8%] bottom-[14%]", d: "0.6s", s: 24 },
];

const GLOW_TONES = {
  gold: {
    glow: "from-amber-400 via-orange-400 to-rose-400",
    btn: "from-amber-300 via-orange-400 to-amber-500 text-black",
    ring: "ring-amber-200/40",
  },
  violet: {
    glow: "from-violet-500 via-fuchsia-500 to-rose-500",
    btn: "from-violet-500 via-fuchsia-500 to-rose-500 text-white",
    ring: "ring-white/30",
  },
};

/* =========================================================
   SMALL COMPONENTS
   ========================================================= */
function GlowButton({ onClick, children, tone = "violet", className = "", disabled = false }) {
  const c = GLOW_TONES[tone] || GLOW_TONES.violet;
  return (
    <div className={`relative ${className}`}>
      <span
        aria-hidden="true"
        className={`qz-glow pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r ${c.glow} opacity-70 blur-xl`}
      />
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r ${c.btn} px-6 py-4 text-lg font-black shadow-lg ring-1 ${c.ring} transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50`}
      >
        <span
          aria-hidden="true"
          className="qz-shine pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-white/30 blur-md"
        />
        <span className="relative flex items-center gap-2.5">{children}</span>
      </button>
    </div>
  );
}

function BookCover({ path, title, className = "" }) {
  const [err, setErr] = useState(false);
  useEffect(() => { setErr(false); }, [path]);

  if (!path || err) {
    return (
      <div className={`grid place-items-center bg-white/[0.04] ${className}`}>
        <BookOpen size={44} className="text-amber-400/70" />
      </div>
    );
  }
  return (
    <img
      src={`${supabaseUrl}/storage/v1/object/public/books-covers/${path}`}
      alt={title || "Book cover"}
      loading="lazy"
      decoding="async"
      onError={() => setErr(true)}
      className={className}
    />
  );
}

const CONFETTI_COLORS = ["#fbbf24", "#f472b6", "#a78bfa", "#34d399", "#60a5fa"];

function Confetti() {
  const height = typeof window !== "undefined" ? window.innerHeight : 800;
  const pieces = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        left: (i / 18) * 100 + ((i * 37) % 7),
        delay: (i % 6) * 0.08,
        rot: (i * 53) % 360,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + (i % 3) * 3,
        drift: ((i * 29) % 60) - 30,
        dur: 2.4 + (i % 5) * 0.2,
      })),
    []
  );
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: height + 40, x: p.drift, opacity: [1, 1, 0], rotate: p.rot + 360 }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeIn" }}
          className="absolute top-0 rounded-[2px]"
          style={{ left: `${p.left}%`, width: p.size, height: p.size * 1.6, background: p.color }}
        />
      ))}
    </div>
  );
}

/* =========================================================
   MAIN PAGE
   ========================================================= */
export default function QuizPage() {
  const router = useRouter();
  const reduce = useReducedMotion();

  // Flow: -1 intro | 0..TOTAL-1 questions | TOTAL loading | TOTAL+1 result
  const [step, setStep] = useState(-1);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState({});
  const [picks, setPicks] = useState([]);
  const [pickIndex, setPickIndex] = useState(0);
  const [saveState, setSaveState] = useState("idle");

  // Database / UI states
  const [userProfile, setUserProfile] = useState(null);
  const [isReturning, setIsReturning] = useState(false);
  const [isFetchingApp, setIsFetchingApp] = useState(true);
  const [bookCount, setBookCount] = useState(0);
  const [greeting, setGreeting] = useState("Namaste 🙏");
  const [toast, setToast] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  // Refs (stale-closure bugs se bachne ke liye)
  const stepRef = useRef(-1);
  const answersRef = useRef({});
  const lockRef = useRef(false);
  const finishingRef = useRef(false);
  const mountedRef = useRef(true);
  const timerRef = useRef(null);
  const toastTimerRef = useRef(null);
  const confettiTimerRef = useRef(null);
  const booksRef = useRef([]);
  const booksPromiseRef = useRef(null);
  const handlersRef = useRef({});

  const slide = useMemo(
    () => ({
      enter: (d) => ({ opacity: 0, x: reduce ? 0 : d > 0 ? 36 : -36 }),
      center: { opacity: 1, x: 0 },
      exit: (d) => ({ opacity: 0, x: reduce ? 0 : d > 0 ? -36 : 36 }),
    }),
    [reduce]
  );

  // ---------- helpers that touch state ----------
  const updateAnswers = (patch) => {
    const next = { ...answersRef.current, ...patch };
    answersRef.current = next;
    setAnswers(next);
    return next;
  };

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 2000);
  };

  const goTo = (n, dir = 1) => {
    clearTimeout(timerRef.current);
    lockRef.current = false;
    stepRef.current = n;
    setDirection(dir);
    setStep(n);
  };

  const goBack = () => {
    const s = stepRef.current;
    if (s < 0 || s >= TOTAL) return;
    goTo(s - 1, -1);
  };

  const advance = (finalAnswers) => {
    const s = stepRef.current;
    if (s < 0 || s >= TOTAL) return;
    if (s < TOTAL - 1) goTo(s + 1, 1);
    else finishQuiz(finalAnswers);
  };

  const continueStep = () => {
    const s = stepRef.current;
    if (s < 0 || s >= TOTAL) return;
    const def = QUIZ_STEPS[s];
    if (!isStepAnswered(def, answersRef.current)) return;
    if (def.type === "input") {
      advance(updateAnswers({ [def.id]: String(answersRef.current[def.id]).trim() }));
    } else {
      advance(answersRef.current);
    }
  };

  const skipStep = () => advance(answersRef.current);

  const pick = (def, value) => {
    if (lockRef.current) return;
    haptic();

    if (def.multi) {
      const cur = toList(answersRef.current[def.id]);
      if (cur.includes(value)) {
        updateAnswers({ [def.id]: cur.filter((v) => v !== value) });
      } else if (cur.length >= (def.max || 3)) {
        showToast(`Zyada se zyada ${def.max || 3} chunein`);
      } else {
        updateAnswers({ [def.id]: [...cur, value] });
      }
      return;
    }

    lockRef.current = true;
    const next = updateAnswers({ [def.id]: value });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      lockRef.current = false;
      advance(next);
    }, 280);
  };

  // ---------- FINISH: rank, save, suspense ----------
  const finishQuiz = async (finalAnswers) => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    goTo(TOTAL, 1);
    setSaveState("idle");
    const started = Date.now();

    try {
      // Books abhi load ho rahi ho to wait karo
      try { if (booksPromiseRef.current) await booksPromiseRef.current; } catch (e) {}
      const ranked = rankBooks(booksRef.current, finalAnswers);
      if (!mountedRef.current) return;
      setPicks(ranked);
      setPickIndex(0);

      // Save in Database (error par alert nahi, sirf console)
      let ok = false;
      try {
        const { error } = await supabase.from("user_book_preferences").insert([
          {
            name: finalAnswers.name || "Anonymous",
            age_group: finalAnswers.age || "",
            profession: finalAnswers.profession || "",
            interest: toList(finalAnswers.interest).join(","),
            current_mood: finalAnswers.mood || "",
            recommended_book: (ranked[0] && ranked[0].book && ranked[0].book.title) || "Unknown",
          },
        ]);
        if (error) console.error("Supabase Error:", error);
        else ok = true;
      } catch (err) {
        console.error("Code Execution Error:", err);
      }
      if (mountedRef.current) setSaveState(ok ? "saved" : "failed");

      // Suspense animation kam se kam ~2.4 sec
      const wait = Math.max(0, 2400 - (Date.now() - started));
      timerRef.current = setTimeout(() => {
        if (mountedRef.current) goTo(TOTAL + 1, 1);
      }, wait);
    } finally {
      finishingRef.current = false;
    }
  };

  // ---------- LOAD books + profile (never gets stuck) ----------
  useEffect(() => {
    let cancelled = false;
    mountedRef.current = true;
    setGreeting(getGreeting());

    const loadBooks = async () => {
      try {
        const { data, error } = await supabase.from("books").select("*");
        if (error) console.error("Books error:", error);
        if (!cancelled && Array.isArray(data)) {
          booksRef.current = data;
          setBookCount(data.length);
        }
      } catch (e) {
        console.error("Books load failed:", e);
      }
    };

    const loadProfile = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const session = sessionData && sessionData.session;
        if (!session || !session.user || cancelled) return;

        const { data: profile } = await supabase
          .from("profiles").select("*").eq("id", session.user.id).maybeSingle();
        if (cancelled) return;
        if (profile) setUserProfile(profile);

        const { data: prefs } = await supabase
          .from("user_book_preferences")
          .select("*")
          .eq("name", (profile && profile.name) || session.user.email)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (cancelled || !prefs) return;

        // Sirf wahi fields bharo jo user ne abhi tak nahi bhari
        const cur = answersRef.current;
        const patch = {};
        const prefName = prefs.name || (profile && profile.name) || "";
        if (!cur.name && prefName) patch.name = prefName;
        if (!cur.age && isValidValue("age", prefs.age_group)) patch.age = prefs.age_group;
        if (!cur.profession && isValidValue("profession", prefs.profession)) patch.profession = prefs.profession;
        if (!cur.mood && isValidValue("mood", prefs.current_mood)) patch.mood = prefs.current_mood;
        if (!toList(cur.interest).length) {
          const list = toList(prefs.interest).filter((v) => isValidValue("interest", v));
          if (list.length) patch.interest = list.slice(0, 3);
        }
        if (Object.keys(patch).length) {
          updateAnswers(patch);
          setIsReturning(true);
        }
      } catch (e) {
        console.error("Profile load failed:", e);
      }
    };

    booksPromiseRef.current = loadBooks();
    Promise.all([booksPromiseRef.current, loadProfile()]).finally(() => {
      if (!cancelled) setIsFetchingApp(false);
    });

    return () => {
      cancelled = true;
      mountedRef.current = false;
      clearTimeout(timerRef.current);
      clearTimeout(toastTimerRef.current);
      clearTimeout(confettiTimerRef.current);
    };
  }, []);

  // Scroll top on every screen change
  useEffect(() => {
    stepRef.current = step;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }, [step]);

  // Confetti sirf result par ek baar
  useEffect(() => {
    if (step === TOTAL + 1 && !reduce && picks.length > 0) {
      setShowConfetti(true);
      clearTimeout(confettiTimerRef.current);
      confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 3600);
    }
  }, [step]);

  // Keyboard shortcuts (1-9 option chunne ke liye, <- peeche, Enter aage)
  handlersRef.current = { step, pick, goBack, continueStep };
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      const tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || e.metaKey || e.ctrlKey || e.altKey) return;
      const h = handlersRef.current;
      if (h.step < 0 || h.step >= TOTAL) return;
      const def = QUIZ_STEPS[h.step];
      if (def.type === "choice") {
        const n = parseInt(e.key, 10);
        if (n >= 1 && n <= def.options.length) {
          e.preventDefault();
          h.pick(def, def.options[n - 1].value);
          return;
        }
      }
      if (e.key === "ArrowLeft") h.goBack();
      else if (e.key === "Enter" && tag !== "BUTTON") h.continueStep();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Desktop par name input auto-focus, mobile par keyboard zabardasti nahi kholna
  const focusInput = useCallback((el) => {
    if (!el) return;
    try {
      if (window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
        setTimeout(() => { try { el.focus({ preventScroll: true }); } catch (e) {} }, 350);
      }
    } catch (e) {}
  }, []);

  const sharePick = async (book) => {
    if (!book) return;
    const url = `${window.location.origin}/?search=${encodeURIComponent(book.title)}`;
    const data = { title: `${book.title} - Vedoxa`, text: `Maine Vedoxa par "${book.title}" dhoondhi hai. Aap bhi apni perfect book dhoondhein!`, url };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(url);
        showToast("Link copy ho gaya ✓");
      }
    } catch (e) {}
  };

  /* =========================================================
     RENDERERS
     ========================================================= */
  const displayName = answers.name || "Dost";

  const renderIntro = () => (
    <div className="relative flex w-full max-w-2xl flex-col items-center py-8 text-center">
      {FLOATERS.map(({ Icon, cls, d, s }, i) => (
        <span key={i} aria-hidden="true" className={`qz-float absolute ${cls} text-amber-300/40`} style={{ animationDelay: d }}>
          <Icon size={s} />
        </span>
      ))}

      <motion.div
        initial={reduce ? false : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 220, damping: 18 }}
        className="relative mb-7"
      >
        <div className="qz-glow absolute -inset-3 rounded-[2rem] bg-gradient-to-r from-amber-400/40 to-rose-400/30 blur-2xl" />
        <div className="relative rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#1b1626] to-[#0e0b17] p-6 shadow-2xl">
          <Sparkles size={46} className="text-amber-300" />
        </div>
      </motion.div>

      <motion.p
        initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="mb-4 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-1.5 text-sm font-semibold text-amber-200"
      >
        {greeting} Vedoxa me aapka swagat hai
      </motion.p>

      <motion.h1
        initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="mb-3 text-4xl font-black leading-tight tracking-tight text-white md:text-6xl"
      >
        Discover your perfect book
      </motion.h1>
      <motion.h2
        initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
        className="mb-5 text-xl font-medium text-amber-300/90 md:text-2xl"
      >
        Apne liye ek sahi kitaab chunein
      </motion.h2>
      <motion.p
        initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.34 }}
        className="mx-auto mb-7 max-w-md text-sm leading-relaxed text-gray-400 md:text-base"
      >
        Bas kuch chhote sawaal. Koi sahi ya galat jawab nahi hai, aap bas apne mann ki baat batayein. Hum library me se aapke liye ek achhi kitaab dhoondh denge.
      </motion.p>

      {isReturning && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
          className="mb-6 max-w-md rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-3 text-sm text-emerald-100"
        >
          Wapas swagat hai, {answers.name || (userProfile && userProfile.name) || "dost"}! 🌿 Humne aapke pichhle jawab yaad rakhe hain, aap kuch bhi badal sakte hain.
        </motion.div>
      )}

      <motion.div
        initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.42 }}
        className="mb-8 flex flex-wrap items-center justify-center gap-2.5"
      >
        {["⏱️ Sirf 1 minute", "💛 Koi galat jawab nahi", "⏭️ Kabhi bhi skip karein"].map((c) => (
          <span key={c} className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-gray-300">
            {c}
          </span>
        ))}
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="w-full max-w-xs"
      >
        <GlowButton tone="gold" onClick={() => goTo(0, 1)}>
          <Sparkles size={20} /> Start the magic <ArrowRight size={20} />
        </GlowButton>
      </motion.div>

      <p className="mt-5 h-5 text-xs font-medium text-gray-500">
        {isFetchingApp ? "Library taiyaar ho rahi hai..." : bookCount > 0 ? `${bookCount} books aapka intezaar kar rahi hain` : ""}
      </p>

      <Link href="/" className="mt-2 text-sm font-semibold text-gray-400 underline-offset-4 transition hover:text-white hover:underline">
        Quiz chhodkar library dekhein
      </Link>
    </div>
  );

  const renderQuestion = () => {
    const def = QUIZ_STEPS[step];
    if (!def) return null;
    const Icon = def.icon;
    const answered = isStepAnswered(def, answers);
    const selectedList = def.multi ? toList(answers[def.id]) : [];
    const progress = ((step + 0.35) / TOTAL) * 100;
    const nameValue = answers[def.id] || "";

    return (
      <div className="mx-auto w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-400">
            <span>{CHEER[step] || ""}</span>
            <span>{step + 1} / {TOTAL}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: reduce ? 0 : 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400"
            />
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-white/[0.03] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(251,191,36,.10), transparent 65%)" }}
          />

          {/* Heading */}
          <div className="relative mb-7 flex flex-col items-center text-center">
            <motion.div
              initial={reduce ? false : { scale: 0, rotate: -12 }} animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 260, damping: 16 }}
              className="mb-5 grid h-16 w-16 place-items-center rounded-2xl border border-amber-300/25 bg-gradient-to-br from-amber-300/20 to-rose-400/15 text-amber-300"
            >
              <Icon size={30} />
            </motion.div>
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">{def.title}</h2>
            <p className="text-base font-medium text-amber-200/80">{def.subtitle}</p>
          </div>

          {/* Input step */}
          {def.type === "input" ? (
            <div className="relative flex flex-col gap-4">
              {userProfile && userProfile.name && answers.name !== userProfile.name && (
                <button
                  type="button"
                  onClick={() => advance(updateAnswers({ name: userProfile.name }))}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-amber-300/30 bg-amber-300/10 py-3.5 font-bold text-amber-200 transition hover:bg-amber-300/20 active:scale-[0.98]"
                >
                  Continue as {userProfile.name} <CheckCircle2 size={18} />
                </button>
              )}

              <input
                ref={focusInput}
                type="text"
                maxLength={40}
                placeholder={def.placeholder}
                value={nameValue}
                onChange={(e) => updateAnswers({ [def.id]: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); continueStep(); } }}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-5 py-4 text-center text-lg text-white outline-none transition placeholder:text-gray-500 focus:border-amber-300/60 focus:shadow-[0_0_24px_rgba(251,191,36,0.15)] sm:text-xl"
              />

              <div className="h-6 text-center text-sm font-semibold text-amber-200">
                <AnimatePresence mode="wait">
                  {nameValue.trim() && (
                    <motion.span key="hi" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                      Namaste, {nameValue.trim()}! 🙏
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-2">
              {def.options.map((opt, i) => {
                const selected = def.multi ? selectedList.includes(opt.value) : answers[def.id] === opt.value;
                return (
                  <motion.button
                    key={opt.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => pick(def, opt.value)}
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduce ? 0 : 0.05 * i, duration: 0.28, ease: "easeOut" }}
                    whileTap={{ scale: 0.97 }}
                    className={`flex items-center gap-3.5 rounded-2xl border p-4 text-left transition-colors duration-200 ${
                      selected
                        ? "border-amber-300/70 bg-amber-300/[0.12] shadow-[0_0_24px_rgba(251,191,36,0.15)]"
                        : "border-white/[0.07] bg-white/[0.04] hover:border-amber-300/30 hover:bg-white/[0.07]"
                    }`}
                  >
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/[0.06] text-2xl">{opt.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold text-white">{opt.label}</span>
                      <span className={`block text-xs ${selected ? "text-amber-200" : "text-gray-400"}`}>{opt.sub}</span>
                    </span>
                    <span
                      className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors ${
                        selected ? "border-amber-300 bg-amber-300 text-black" : "border-white/20 text-transparent"
                      }`}
                    >
                      <Check size={14} strokeWidth={3} />
                    </span>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Footer: Back / Skip / Continue */}
          <div className="relative mt-7 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goBack}
              className="flex items-center gap-1 rounded-full px-3.5 py-2.5 text-sm font-semibold text-gray-400 transition hover:bg-white/5 hover:text-white"
            >
              <ChevronLeft size={16} /> Back
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={skipStep}
                className="rounded-full px-3.5 py-2.5 text-sm font-semibold text-gray-400 transition hover:bg-white/5 hover:text-white"
              >
                Skip
              </button>
              {(def.type === "input" || def.multi || answered) && (
                <button
                  type="button"
                  onClick={continueStep}
                  disabled={!answered}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-orange-400 px-5 py-2.5 text-sm font-extrabold text-black shadow-lg transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Continue <ArrowRight size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="mt-4 hidden text-center text-xs text-gray-500 md:block">
          Tip: option chunne ke liye number key dabayein, peeche jaane ke liye ← dabayein
        </p>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="flex w-full max-w-md flex-col items-center py-16 text-center">
      <div className="relative mb-9 h-28 w-28">
        <div className="absolute inset-0 rounded-full border-4 border-white/5" />
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-amber-300 border-t-transparent" />
        <motion.div
          animate={reduce ? undefined : { scale: [1, 1.15, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 grid place-items-center"
        >
          <Sparkles className="text-amber-300" size={36} />
        </motion.div>
      </div>

      <h2 className="mb-2 text-2xl font-black text-white sm:text-3xl">{displayName}, bas thoda sa intezaar...</h2>
      <p className="mb-7 text-base font-medium text-amber-200/80">Aapke liye sabse achhi kitaab dhoondh rahe hain</p>

      <div className="mb-7 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          initial={{ width: 0 }} animate={{ width: "100%" }}
          transition={{ duration: 2.3, ease: "easeInOut" }}
          className="h-full rounded-full bg-gradient-to-r from-amber-300 to-rose-400"
        />
      </div>

      <ul className="flex w-full flex-col gap-2.5 text-left">
        {LOADING_STEPS.map((txt, i) => (
          <motion.li
            key={txt}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.8, duration: 0.3 }}
            className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-sm text-gray-300"
          >
            <motion.span
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ delay: i * 0.8 + 0.6, type: "spring", stiffness: 300, damping: 14 }}
              className="text-emerald-400"
            >
              <CheckCircle2 size={18} />
            </motion.span>
            {txt}
          </motion.li>
        ))}
      </ul>
    </div>
  );

  const renderResult = () => {
    const current = picks[pickIndex] || picks[0];

    // Library khaali / load nahi hui
    if (!current) {
      return (
        <div className="mx-auto flex w-full max-w-md flex-col items-center py-16 text-center">
          <div className="mb-5 grid h-20 w-20 place-items-center rounded-3xl border border-white/10 bg-white/[0.04]">
            <BookOpen size={36} className="text-amber-300" />
          </div>
          <h2 className="mb-2 text-2xl font-black text-white">Abhi koi kitaab nahi mil payi</h2>
          <p className="mb-6 text-sm text-gray-400">Library load nahi ho paayi. Kripya thodi der baad phir se try karein ya seedhe library dekhein.</p>
          <Link href="/" className="rounded-full bg-gradient-to-r from-amber-300 to-orange-400 px-6 py-3 font-extrabold text-black">
            Library dekhein
          </Link>
          <button onClick={() => goTo(-1, -1)} className="mt-4 text-sm font-semibold text-gray-400 hover:text-white">
            Quiz dobara shuru karein
          </button>
        </div>
      );
    }

    const book = current.book;
    const a = answers;
    const profLabel = labelOf("profession", a.profession);
    const moodLabel = labelOf("mood", a.mood);
    const intro = [profLabel && `aap ${profLabel} hain`, moodLabel && `is waqt "${moodLabel}" chahte hain`]
      .filter(Boolean).join(", ");
    const message = intro
      ? `Kyunki ${intro}, humari library me "${book.title}" aapke liye sabse achha match lagi.`
      : `Humari library me "${book.title}" aapke liye ek achhi shuruaat hai.`;

    const reasonTexts = current.reasons.map(describeReason).filter(Boolean).slice(0, 3);
    const reasonList = reasonTexts.length ? reasonTexts : ["Humne aapke liye library se ek achhi shuruaat chuni hai"];

    const pages = Number(book.pages) || 0;
    const minutes = Number(a.read_time) || 0;
    const days = pages && minutes ? Math.max(1, Math.ceil((pages * 1.5) / minutes)) : 0;
    const price = book.final_price || book.price;

    return (
      <div className="mx-auto w-full max-w-4xl pb-12">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={reduce ? false : { y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-300/10 px-5 py-2.5 text-sm font-bold text-emerald-200"
          >
            <CheckCircle2 size={18} /> {displayName}, aapki pick taiyaar hai
          </motion.div>
          <h2 className="mb-5 text-3xl font-black leading-tight text-white md:text-5xl">
            Aapki perfect book mil gayi hai! 🎉
          </h2>
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="mx-auto max-w-2xl rounded-2xl border border-amber-300/20 bg-amber-300/[0.08] p-4 text-base text-amber-100 md:p-5 md:text-lg"
          >
            {message}
          </motion.div>
        </div>

        {/* Hero card */}
        <motion.div
          key={book.id || book.title}
          initial={reduce ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`rounded-[2rem] bg-gradient-to-br ${current.theme.theme} p-px shadow-2xl`}
        >
          <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-[#0e0b17] p-5 sm:p-8 md:p-10">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-12 top-1/3 h-72 w-72 rounded-full opacity-30"
              style={{ background: "radial-gradient(circle, rgba(251,191,36,.35), transparent 65%)" }}
            />

            <div className="relative flex flex-col items-center gap-7 md:flex-row md:items-start md:gap-10">
              <div className="qz-float w-48 shrink-0 sm:w-56 md:w-64">
                <motion.div
                  whileHover={reduce ? undefined : { y: -4, rotate: -1 }}
                  className={`relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-white/20 bg-white/[0.04] shadow-2xl ${current.theme.shadow}`}
                >
                  <BookCover path={book.cover_path} title={book.title} className="h-full w-full object-contain" />
                </motion.div>
              </div>

              <div className="w-full flex-1 text-left">
                <div className="mb-2 flex items-center gap-1.5">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1.5 text-sm font-bold text-amber-300">
                    {current.score > 0 ? "Best match for you" : "Our pick for you"}
                  </span>
                </div>

                <h3 className="font-cinzel mb-1.5 text-3xl font-black leading-tight text-white md:text-4xl">{book.title}</h3>
                <p className="mb-4 font-medium text-gray-400">By {book.author || "Vedoxa Library"}</p>

                <div className="mb-6 flex flex-wrap items-center gap-2">
                  {price ? (
                    <span className="rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-black text-white">₹{price}</span>
                  ) : null}
                  {pages ? (
                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-gray-300">{pages} Pages</span>
                  ) : null}
                  {current.score > 0 ? (
                    <span className="rounded-full border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 text-xs font-bold text-emerald-200">
                      Aapke {current.reasons.length} jawab match hue
                    </span>
                  ) : null}
                </div>

                <h4 className="mb-3 flex items-center gap-2 text-lg font-bold text-white">
                  <Gift className="text-amber-400" size={20} /> Yeh book aapko kyun padhni chahiye?
                </h4>
                <ul className="mb-5 space-y-2.5">
                  {reasonList.map((txt, i) => (
                    <motion.li
                      key={txt}
                      initial={reduce ? false : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.35 + i * 0.12 }}
                      className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3.5"
                    >
                      <span className="mt-0.5 shrink-0 rounded-full bg-amber-300/20 p-1.5"><Target size={15} className="text-amber-300" /></span>
                      <span className="text-sm font-medium text-gray-200 md:text-base">{txt}</span>
                    </motion.li>
                  ))}
                </ul>

                {days > 0 && (
                  <p className="mb-6 flex items-center gap-2 text-sm text-gray-400">
                    <Clock size={15} className="text-amber-400" />
                    Roz {minutes} min padhne par lagbhag {days} din me khatam (andaaza)
                  </p>
                )}

                {/* DIRECTING USER TO HOME PAGE FOR PURCHASE */}
                <GlowButton
                  tone="violet"
                  onClick={() => router.push(`/?search=${encodeURIComponent(book.title)}`)}
                >
                  Buy Now &amp; Start Reading <Zap size={22} className="fill-white" />
                </GlowButton>

                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => sharePick(book)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-bold text-gray-300 transition hover:bg-white/10 active:scale-[0.97]"
                  >
                    <Share2 size={16} /> Share my pick
                  </button>
                  {picks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setPickIndex((i) => (i + 1) % picks.length)}
                      className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-bold text-gray-300 transition hover:bg-white/10 active:scale-[0.97]"
                    >
                      <Shuffle size={16} /> Another pick
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* More picks */}
        {picks.length > 1 && (
          <div className="mt-9">
            <h4 className="mb-3 px-1 text-lg font-bold text-white">Aur bhi kitaabein jo aapko pasand aa sakti hain</h4>
            <div className="qz-noscroll flex snap-x gap-3.5 overflow-x-auto pb-2">
              {picks.map((p, i) =>
                i === pickIndex ? null : (
                  <button
                    key={p.book.id || p.book.title}
                    type="button"
                    onClick={() => { setPickIndex(i); window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); }}
                    className="group w-32 shrink-0 snap-start text-left md:w-36"
                  >
                    <div className="relative mb-2.5 aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] transition group-hover:border-amber-300/50">
                      <BookCover path={p.book.cover_path} title={p.book.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <p className="line-clamp-1 text-sm font-bold text-gray-200 group-hover:text-amber-200">{p.book.title}</p>
                    <p className="line-clamp-1 text-xs text-gray-500">{p.book.author}</p>
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div className="mt-9 flex flex-col items-center gap-3 text-center">
          {saveState === "saved" && (
            <p className="text-xs font-medium text-emerald-300/80">✓ Aapke jawab save ho gaye hain</p>
          )}
          <button
            type="button"
            onClick={() => goTo(0, -1)}
            className="rounded-full border border-white/10 px-6 py-2.5 text-sm font-medium text-gray-400 transition hover:bg-white/5 hover:text-white"
          >
            Apne jawab badlein
          </button>
          <button
            type="button"
            onClick={() => { answersRef.current = {}; setAnswers({}); setPicks([]); setPickIndex(0); goTo(-1, -1); }}
            className="flex items-center gap-1.5 text-xs font-medium text-rose-300/70 transition hover:text-rose-300"
          >
            <RefreshCw size={12} /> Naye sire se shuru karein
          </button>
        </div>
      </div>
    );
  };

  /* =========================================================
     PAGE SHELL
     ========================================================= */
  const screenKey =
    step < 0 ? "intro" : step < TOTAL ? `q-${step}` : step === TOTAL ? "loading" : "result";

  let screen = null;
  if (step < 0) screen = renderIntro();
  else if (step < TOTAL) screen = renderQuestion();
  else if (step === TOTAL) screen = renderLoading();
  else screen = renderResult();

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-x-hidden bg-[#0b0912] font-sans text-gray-200 selection:bg-amber-300/30">
      <style>{QUIZ_CSS}</style>

      {/* Soft living background (gradients only, no heavy blur) */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="qz-orb qz-orb-a" />
        <div className="qz-orb qz-orb-b" />
      </div>

      {showConfetti && <Confetti />}

      <nav className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between border-b border-white/5 p-4 sm:p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-transparent px-4 py-2.5 text-sm font-bold text-gray-400 transition hover:border-white/10 hover:bg-white/10 hover:text-white"
        >
          <ChevronLeft size={18} /> Back to Library
        </Link>
        {step >= 0 && step < TOTAL && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-2 rounded-full border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm font-bold text-amber-200"
          >
            <Zap size={15} className="fill-amber-300 text-amber-300" /> Step {step + 1} of {TOTAL}
          </motion.div>
        )}
      </nav>

      <main className="relative z-10 flex min-h-[80vh] w-full flex-1 flex-col items-center justify-center p-4 sm:p-6">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={screenKey}
            custom={direction}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduce ? 0 : 0.26, ease: "easeOut" }}
            className="flex w-full flex-col items-center"
          >
            {screen}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
        <AnimatePresence>
          {toast && (
            <motion.div
              key={toast}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
              className="rounded-full border border-white/10 bg-[#1b1626] px-5 py-2.5 text-sm font-semibold text-white shadow-xl"
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
