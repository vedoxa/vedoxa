// @ts-nocheck
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronDown, Coins, PlayCircle, RefreshCw, AlertTriangle, CheckCircle2,
  Wallet, Users, Sparkles, ArrowRight, Copy, Share2, Clock, ShieldCheck, LogIn,
} from "lucide-react";

// Run rewards-setup.sql once in Supabase before using this page.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
);

const MONETAG_DIRECT_LINK = "https://omg10.com/4/10927258";
const SITE_URL = "https://www.vedoxa.shop";
const DAILY_AD_LIMIT = 5;
const COINS_PER_AD = 10;
const AD_SECONDS = 10;

const money = (n) => (Number(n) || 0).toFixed(2);
const msToReset = () => 86400000 - ((Date.now() + 19800000) % 86400000); // midnight IST
const fmtReset = (ms) => `${Math.floor(ms / 3600000)}h ${String(Math.floor((ms % 3600000) / 60000)).padStart(2, "0")}m`;

const REASONS = {
  limit: "Daily limit reached · आज की सीमा पूरी",
  too_early: "Stay on the ad a bit longer · थोड़ा और रुकें",
  expired: "Ad session expired. Try again · दोबारा प्रयास करें",
  no_session: "Ad session not found. Try again · दोबारा प्रयास करें",
  min: "Minimum 10 coins needed · कम से कम 10 कॉइन चाहिए",
};

const FAQ = [
  ["My coins didn’t arrive. Why?", "Keep the ad tab open until the 10-second timer ends. Coins are verified on our server, so a closed or blocked ad page won’t count."],
  ["When does my daily limit reset?", "Every day at 12:00 AM IST. The timer at the top of the page shows how long is left."],
  ["Where can I use my rupees?", "Converted rupees stay in your wallet and are applied automatically at checkout on eligible books."],
];

/* ------------------------------------------------------------------ */
export default function RewardsPage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [toast, setToast] = useState(null);
  const [adLeft, setAdLeft] = useState(null); // null = idle, number = seconds left
  const [converting, setConverting] = useState(false);
  const [refInput, setRefInput] = useState("");
  const [applying, setApplying] = useState(false);
  const [resetIn, setResetIn] = useState(null);
  const toastTimer = useRef(null);
  const adTimer = useRef(null);

  const notify = useCallback((msg, type = "info") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 3800);
  }, []);

  const loadProfile = useCallback(async (u) => {
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", u.id).maybeSingle();
      if (error || !data) throw error || new Error("no profile");
      let p = data;
      const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
      if (String(p.last_ad_date) !== today) p = { ...p, ads_watched_today: 0 }; // server resets on next ad
      if (!p.referral_code) {
        const code = u.id.replace(/-/g, "").substring(0, 6).toUpperCase();
        await supabase.from("profiles").update({ referral_code: code }).eq("id", u.id);
        p = { ...p, referral_code: code };
      }
      setProfile(p);
      setLoadError(false);
      return p;
    } catch {
      setLoadError(true);
      return null;
    }
  }, []);

  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!alive) return;
      setUser(session?.user ?? null);
      if (session?.user) await loadProfile(session.user);
      if (alive) setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "INITIAL_SESSION") return;
      setUser(session?.user ?? null);
      if (session?.user) loadProfile(session.user);
      else setProfile(null);
    });
    return () => { alive = false; subscription.unsubscribe(); clearInterval(adTimer.current); clearTimeout(toastTimer.current); };
  }, [loadProfile]);

  useEffect(() => {
    const tick = () => setResetIn(msToReset());
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  const patch = (x) => setProfile((p) => ({ ...p, ...x }));
  const coins = Number(profile?.ad_coins) || 0;
  const adsToday = Number(profile?.ads_watched_today) || 0;
  const limitHit = adsToday >= DAILY_AD_LIMIT;
  const convertible = Math.floor(coins / 10) * 10;
  const watching = adLeft !== null;

  /* ---- Watch ad (verified on the server) ---- */
  const handleWatchAd = async () => {
    if (!user) return notify("Login first · पहले लॉग इन करें", "error");
    if (watching) return;
    if (limitHit) return notify(REASONS.limit, "error");

    window.open(MONETAG_DIRECT_LINK, "_blank", "noopener,noreferrer"); // must run synchronously on click
    setAdLeft(AD_SECONDS);
    const { data, error } = await supabase.rpc("start_ad");
    if (error || !data?.ok) {
      setAdLeft(null);
      return notify(REASONS[data?.reason] || "Couldn’t start the ad. Try again.", "error");
    }
    notify("Ad opened. Stay on it until the timer ends · टाइमर खत्म होने तक रुकें");

    let left = AD_SECONDS;
    clearInterval(adTimer.current);
    adTimer.current = setInterval(async () => {
      left -= 1;
      setAdLeft(left);
      if (left > 0) return;
      clearInterval(adTimer.current);
      const { data: r, error: e } = await supabase.rpc("claim_ad");
      setAdLeft(null);
      if (e || !r?.ok) return notify(REASONS[r?.reason] || "Network error. Try again.", "error");
      patch({ ad_coins: r.ad_coins, ads_watched_today: r.ads_watched_today });
      notify(`+${COINS_PER_AD} coins added · ${COINS_PER_AD} कॉइन जुड़े`, "success");
    }, 1000);
  };

  /* ---- Convert coins → rupees ---- */
  const handleConvert = async () => {
    if (!user || convertible < 10 || converting) return notify(REASONS.min, "error");
    setConverting(true);
    const { data, error } = await supabase.rpc("convert_coins");
    setConverting(false);
    if (error || !data?.ok) return notify(REASONS[data?.reason] || "Conversion failed. Try again.", "error");
    patch({ ad_coins: data.ad_coins, reward_points: data.reward_points });
    notify(`₹${money(data.rupees)} added to your wallet · वॉलेट में जुड़े`, "success");
  };

  /* ---- Referral ---- */
  const handleApplyReferral = async () => {
    const code = refInput.trim().toUpperCase();
    if (code.length < 4) return notify("Enter a valid code · सही कोड डालें", "error");
    if (code === profile?.referral_code) return notify("You can’t use your own code · अपना कोड नहीं लगा सकते", "error");
    setApplying(true);
    try {
      const { data, error } = await supabase.rpc("process_referral", { ref_code: code, new_user_id: user.id });
      if (error) throw new Error("Server error. Try again later.");
      if (data === "invalid_code") throw new Error("Invalid code · गलत कोड");
      const p = await loadProfile(user); // confirm it really saved
      if (!p?.referred_by) throw new Error("Code couldn’t be applied. Try again.");
      setRefInput("");
      notify("Code applied! Your friend earned ₹10 · रेफरल कोड लग गया", "success");
    } catch (err) {
      notify(err.message, "error");
    }
    setApplying(false);
  };

  const shareText = `Join Vedoxa Library and use my referral code ${profile?.referral_code} — ${SITE_URL}`;
  const copyCode = async () => {
    try { await navigator.clipboard.writeText(profile?.referral_code || ""); notify("Code copied · कोड कॉपी हुआ", "success"); }
    catch { notify("Couldn’t copy. Select the code manually.", "error"); }
  };
  const shareCode = async () => {
    if (!navigator.share) return copyCode();
    try { await navigator.share({ title: "Vedoxa Referral", text: shareText }); } catch { /* cancelled */ }
  };

  /* ------------------------------------------------------------------ */
  return (
    <div className="min-h-screen bg-[#07070b] font-sans text-gray-200 [background-image:radial-gradient(900px_420px_at_50%_-120px,rgba(234,179,8,0.10),transparent)]">
      <Toast toast={toast} />

      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#07070b]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 py-2 pl-3 pr-4 text-sm font-semibold text-white transition hover:bg-white/10 active:scale-95">
            <ChevronLeft size={18} /> Home
          </Link>
          <Link href="/self" className="group relative inline-flex rounded-full bg-gradient-to-r from-sky-400 via-indigo-400 to-fuchsia-400 p-px shadow-[0_0_24px_-6px_rgba(129,140,248,0.7)] transition hover:shadow-[0_0_32px_-4px_rgba(129,140,248,0.95)] active:scale-95">
            <span className="flex items-center gap-2 rounded-full bg-[#0b0b12] px-4 py-2 text-sm font-bold text-white">
              <Sparkles size={16} className="text-indigo-300" /> Self
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20 pt-10">
        {/* Hero */}
        <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="mb-10 text-center">
          <h1 className="font-serif text-4xl font-black text-white md:text-5xl">Earn free books</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-400">
            Watch short ads, collect coins and turn them into real discounts.<br />
            विज्ञापन देखें, कॉइन्स जमा करें और असली छूट पाएं।
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs font-semibold text-gray-400">
            <Chip icon={<PlayCircle size={14} />}>{DAILY_AD_LIMIT} ads / day</Chip>
            <Chip icon={<Coins size={14} />}>10 coins = ₹0.10</Chip>
            <Chip icon={<Clock size={14} />}>Resets in {resetIn === null ? "--" : fmtReset(resetIn)}</Chip>
          </div>
        </motion.section>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[0, 1].map((i) => <div key={i} className="h-72 animate-pulse rounded-3xl border border-white/5 bg-white/[0.03]" />)}
          </div>
        ) : !user ? (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] px-6 py-16 text-center">
            <LogIn className="mx-auto mb-4 text-yellow-500" size={32} />
            <p className="mb-5 text-gray-400">Log in to start earning coins.<br />कॉइन्स कमाने के लिए लॉग इन करें।</p>
            <Link href="/" className="inline-block rounded-full bg-yellow-500 px-6 py-3 font-bold text-black transition hover:bg-yellow-400 active:scale-95">Go to login</Link>
          </div>
        ) : loadError || !profile ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 px-6 py-14 text-center">
            <AlertTriangle className="mx-auto mb-3 text-red-400" size={30} />
            <p className="mb-5 text-gray-300">We couldn’t load your profile. Check your connection and try again.</p>
            <button onClick={() => { setLoading(true); loadProfile(user).finally(() => setLoading(false)); }} className="inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 font-bold text-white transition hover:bg-white/20 active:scale-95">
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        ) : (
          <>
            <div className="mb-5 grid gap-5 md:grid-cols-2">
              {/* Earn */}
              <Card className="p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">Ad coins</p>
                    <p className="mt-1 flex items-center gap-2 text-5xl font-black text-white">{coins}<Coins size={26} className="text-yellow-500" /></p>
                    <p className="mt-2 text-xs text-gray-500">+{COINS_PER_AD} coins per ad · हर ऐड पर {COINS_PER_AD} कॉइन</p>
                  </div>
                  <Ring value={adsToday} max={DAILY_AD_LIMIT} />
                </div>

                <button
                  onClick={handleWatchAd}
                  disabled={watching || limitHit}
                  className="relative mt-6 flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 py-4 font-extrabold text-black shadow-[0_14px_30px_-12px_rgba(234,179,8,0.7)] transition hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {watching && (
                    <motion.span className="absolute inset-y-0 left-0 bg-black/15" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: AD_SECONDS, ease: "linear" }} />
                  )}
                  <span className="relative flex items-center gap-2.5">
                    {watching ? <><RefreshCw size={20} className="animate-spin" /> Stay on the ad… {adLeft}s</> : limitHit ? <>Come back tomorrow</> : <><PlayCircle size={22} /> Watch ad &amp; earn</>}
                  </span>
                </button>
                <p className="mt-3 text-center text-xs text-gray-500">
                  {limitHit ? `Limit reached. New ads in ${resetIn === null ? "--" : fmtReset(resetIn)}` : `${DAILY_AD_LIMIT - adsToday} of ${DAILY_AD_LIMIT} ads left today`}
                </p>
              </Card>

              {/* Wallet */}
              <Card className="border-emerald-500/20 bg-emerald-500/[0.03] p-7">
                <p className="text-xs font-semibold text-emerald-400/80">Wallet balance</p>
                <p className="mt-1 flex items-center gap-2 text-5xl font-black text-white">₹{money(profile.reward_points)}<Wallet size={26} className="text-emerald-500" /></p>

                <div className="mt-5 rounded-2xl border border-emerald-500/15 bg-black/30 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Ready to convert</span>
                    <span className="font-bold text-emerald-400">{convertible} coins → ₹{money(convertible / 100)}</span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <motion.div className="h-full rounded-full bg-emerald-500" animate={{ width: `${(coins % 10) * 10}%` }} transition={{ duration: 0.5 }} />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    {convertible >= 10 ? "Convert now, or keep earning for more." : `${10 - coins} more coins to unlock conversion`}
                  </p>
                </div>

                <button
                  onClick={handleConvert}
                  disabled={converting || convertible < 10}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-4 font-extrabold text-black transition hover:-translate-y-0.5 hover:bg-emerald-400 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <RefreshCw size={18} className={converting ? "animate-spin" : ""} /> Convert to rupees
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-gray-500">
                  <ShieldCheck size={13} /> Applied automatically at checkout
                </p>
              </Card>
            </div>

            {/* How it works */}
            <div className="mb-5 grid gap-3 sm:grid-cols-3">
              {[["Watch", "Open an ad and stay for 10 seconds."], ["Collect", "Coins are added after server verification."], ["Convert", "Swap coins for rupees and save on books."]].map(([t, d], i) => (
                <div key={t} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-500/15 text-sm font-bold text-yellow-500">{i + 1}</span>
                  <div><p className="text-sm font-bold text-white">{t}</p><p className="text-xs leading-relaxed text-gray-500">{d}</p></div>
                </div>
              ))}
            </div>

            {/* Refer & earn */}
            <Card className="mb-5 p-7">
              <h2 className="flex items-center gap-2.5 text-xl font-black text-white"><Users className="text-yellow-500" size={22} /> Refer &amp; earn · रेफर करें और कमाएं</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-400">
                When a friend enters your code, you get ₹10 in your wallet. दोस्त के कोड डालते ही आपको ₹10 मिलेंगे।
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
                  <p className="mb-2 text-xs font-semibold text-gray-500">Your code</p>
                  <button onClick={copyCode} aria-label="Copy referral code" className="flex w-full items-center justify-between gap-3 rounded-xl border border-dashed border-yellow-500/40 bg-white/5 px-4 py-3 transition hover:border-yellow-500">
                    <span className="font-mono text-xl font-bold tracking-[0.25em] text-yellow-500">{profile.referral_code || "------"}</span>
                    <Copy size={18} className="text-gray-400" />
                  </button>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <a href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-bold text-black transition hover:brightness-110 active:scale-95">WhatsApp</a>
                    <button onClick={shareCode} className="flex items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-bold text-white transition hover:bg-white/20 active:scale-95"><Share2 size={16} /> Share</button>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/30 p-5">
                  <p className="mb-2 text-xs font-semibold text-gray-500">Have a referral code?</p>
                  {profile.referred_by ? (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-400">
                      <CheckCircle2 size={18} /> Code used: {profile.referred_by}
                    </div>
                  ) : (
                    <>
                      <div className="flex gap-2">
                        <input
                          value={refInput}
                          onChange={(e) => setRefInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))}
                          onKeyDown={(e) => e.key === "Enter" && handleApplyReferral()}
                          placeholder="Enter code"
                          maxLength={6}
                          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono uppercase tracking-widest text-white outline-none transition focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10"
                        />
                        <button onClick={handleApplyReferral} disabled={applying || refInput.length < 4} className="flex w-24 items-center justify-center rounded-xl bg-yellow-500 font-bold text-black transition hover:bg-yellow-400 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50">
                          {applying ? <RefreshCw size={18} className="animate-spin" /> : "Apply"}
                        </button>
                      </div>
                      <p className="mt-3 text-xs text-gray-500">One referral code per account.</p>
                    </>
                  )}
                </div>
              </div>
            </Card>
          </>
        )}

        {/* About + FAQ */}
        <Card className="p-7">
          <h2 className="mb-3 text-lg font-bold text-white">Why we show ads · हम विज्ञापन क्यों दिखाते हैं</h2>
          <div className="space-y-3 text-sm leading-relaxed text-gray-400">
            <p>We want spiritual and psychological knowledge to be accessible to everyone. Ads help us run our servers and library, and you get real discounts in return.</p>
            <p>हमारा उद्देश्य आध्यात्मिक और मनोवैज्ञानिक ज्ञान को सब तक पहुँचाना है। विज्ञापन देखने से मिले कॉइन्स को रुपयों में बदलकर आप प्रीमियम किताबों पर छूट पा सकते हैं।</p>
          </div>
          <div className="mt-5 border-t border-white/5">
            {FAQ.map(([q, a]) => <FaqRow key={q} q={q} a={a} />)}
          </div>
        </Card>
      </main>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function Card({ children, className = "" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className={`relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-[0_24px_60px_-34px_rgba(0,0,0,0.9)] ${className}`}>
      {children}
    </motion.div>
  );
}

function Chip({ icon, children }) {
  return <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">{icon}{children}</span>;
}

function Ring({ value, max }) {
  const r = 30, c = 2 * Math.PI * r, pct = Math.min(1, value / max);
  return (
    <div className="relative h-[76px] w-[76px] shrink-0" role="img" aria-label={`${value} of ${max} ads watched today`}>
      <svg viewBox="0 0 76 76" className="-rotate-90">
        <circle cx="38" cy="38" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <motion.circle cx="38" cy="38" r={r} fill="none" stroke="#eab308" strokeWidth="7" strokeLinecap="round" strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - pct) }} transition={{ duration: 0.7, ease: "easeOut" }} />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center text-sm font-black leading-none text-white">{value}/{max}<span className="mt-1 text-[9px] font-semibold text-gray-500">today</span></span>
    </div>
  );
}

function Toast({ toast }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[9999] flex justify-center px-4" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -14, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.2 }}
            className={`flex max-w-md items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold shadow-2xl backdrop-blur-md ${
              toast.type === "success" ? "border-emerald-500/40 bg-emerald-950/80 text-emerald-300" : toast.type === "error" ? "border-red-500/40 bg-red-950/80 text-red-300" : "border-yellow-500/40 bg-yellow-950/80 text-yellow-200"}`}>
            {toast.type === "success" ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertTriangle size={18} className="shrink-0" />}
            <span>{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FaqRow({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/5 last:border-0">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-white">
        {q}<ChevronDown size={18} className={`shrink-0 text-yellow-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden pb-4 text-sm leading-relaxed text-gray-400">{a}</motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
