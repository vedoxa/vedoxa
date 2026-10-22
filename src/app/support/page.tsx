// @ts-nocheck
"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Bot, Send, Ticket, Inbox, X, CheckCircle2, AlertTriangle, Clock, LogIn, Mail } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
);

const SUPPORT_EMAIL = ""; // optional: add your support email to show an "Email us" button

const CATEGORIES = ["Payment", "Book access", "Account", "Rewards", "Other"];

// k = keywords (English + Hinglish) used to match what the user types
const FAQS = [
  { label: "Payment issue", q: "Payment was deducted but the book didn’t unlock?", a: "Please log out and log back in. If the book still doesn’t unlock, raise a ticket and include your payment ID so we can verify it quickly.", ticket: true, k: ["payment", "paid", "deduct", "unlock", "paisa", "kat gaya", "money", "refund", "razorpay"] },
  { label: "PDF download", q: "How can I download the book’s PDF?", a: "For security reasons we don’t allow direct PDF downloads. You can read your book anytime in our fast, secure Web Reader.", k: ["pdf", "download", "offline", "save", "reader"] },
  { label: "My books", q: "Where will my purchased books appear?", a: "A “Read Now” button appears under your purchased books in the Premium Library section on the Home page.", href: { label: "Go to Home", to: "/" }, k: ["purchased", "bought", "library", "read now", "kitab", "khareed", "where"] },
  { label: "Coins & rewards", q: "My ad coins didn’t arrive.", a: "Stay on the ad until the 10-second timer ends. Coins are verified on our server, so a closed or blocked ad page won’t count. You can watch up to 5 ads a day, and the limit resets at 12 AM IST.", ticket: true, k: ["coin", "reward", "ad ", "ads", "wallet", "convert", "points"] },
  { label: "Referral", q: "How does referral work?", a: "Share your code from the Rewards page. When a friend enters it, you get ₹10 in your wallet. Each account can use only one referral code.", k: ["referral", "refer", "invite", "code", "friend", "dost"] },
  { label: "Login help", q: "I can’t log in.", a: "Log out, close the tab and sign in again with the same account you registered with. If it still fails, raise a ticket with the email you’re using.", ticket: true, k: ["login", "log in", "password", "account", "signin", "sign in", "otp"] },
];

const norm = (s) => ` ${s.toLowerCase().replace(/[^a-z0-9\u0900-\u097f\s]/g, " ")} `;
const findFaq = (text) => {
  const t = norm(text);
  let best = null, top = 0;
  FAQS.forEach((f) => { const n = f.k.filter((w) => t.includes(w)).length; if (n > top) { top = n; best = f; } });
  return best;
};
const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) : "");

/* ------------------------------------------------------------------ */
export default function SupportPage() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState([
    { id: 0, sender: "bot", ts: Date.now(), text: "Hello! 🙏 Welcome to Vedoxa Help & Support. Pick a topic below or type your question." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [sheet, setSheet] = useState(null); // null | 'ticket' | 'mine'
  const [toast, setToast] = useState(null);
  const [myTickets, setMyTickets] = useState(null); // null = loading, [] = none, false = unavailable
  const bottom = useRef(null);
  const idRef = useRef(1);
  const timers = useRef([]);

  const notify = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    timers.current.push(setTimeout(() => setToast(null), 3500));
  }, []);

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => { subscription.unsubscribe(); timers.current.forEach(clearTimeout); };
  }, []);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, typing]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSheet(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const push = (sender, text, extra = {}) =>
    setMessages((m) => [...m, { id: idRef.current++, sender, text, ts: Date.now(), ...extra }]);

  const botSay = (text, extra) => {
    setTyping(true);
    timers.current.push(setTimeout(() => { setTyping(false); push("bot", text, extra); }, 700));
  };

  const ask = (text, faq) => {
    const clean = text.trim();
    if (!clean) return;
    push("user", clean);
    const f = faq || findFaq(clean);
    if (f) return botSay(f.a, { ticket: f.ticket, href: f.href });
    if (/^(hi+|hello|hey|namaste|नमस्ते)\b/i.test(clean)) return botSay("Hi there! 😊 What do you need help with today?");
    if (/(thank|thanks|shukriya|dhanyavad|धन्यवाद)/i.test(clean)) return botSay("You’re most welcome! 🙏 I’m here if you need anything else.");
    botSay("I couldn’t find an exact answer for that. Our team can look into it personally. Please raise a ticket and we’ll reply within 48 hours.", { ticket: true });
  };

  const send = (e) => { e.preventDefault(); ask(input); setInput(""); };

  const loadTickets = useCallback(async () => {
    if (!user) return;
    setMyTickets(null);
    let res = await supabase.from("tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    if (res.error) res = await supabase.from("tickets").select("*").eq("user_id", user.id).limit(20);
    setMyTickets(res.error ? false : res.data || []);
  }, [user]);

  const openMine = () => { setSheet("mine"); loadTickets(); };

  const onTicketSent = (id) => {
    setSheet(null);
    notify("Ticket submitted ✓", "success");
    push("bot", `Your ticket has been submitted${id ? ` (#${String(id).slice(0, 8)})` : ""}. Our team will review it and reply within 48 hours. You can track it under “My tickets”.`);
  };

  /* ---------------------------------------------------------------- */
  return (
    <div className="flex h-[100dvh] flex-col bg-[#07070b] font-sans text-gray-200 [background-image:radial-gradient(800px_360px_at_50%_-100px,rgba(234,179,8,0.09),transparent)]">
      <Toast toast={toast} />

      {/* Header */}
      <header className="z-30 shrink-0 border-b border-white/5 bg-[#07070b]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          <Link href="/" aria-label="Back to home" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10 active:scale-95">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/15 text-yellow-500"><Bot size={22} /></div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-white">Vedoxa Help &amp; Support</h1>
              <p className="flex items-center gap-1.5 text-xs text-emerald-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Online · replies instantly</p>
            </div>
          </div>
          <button onClick={openMine} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/10 active:scale-95">
            <Inbox size={15} /> <span className="hidden sm:inline">My tickets</span>
          </button>
        </div>
      </header>

      {/* Conversation */}
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">
          {messages.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={`flex items-end gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : ""}`}>
              {m.sender === "bot" && <div className="mb-5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-500/15 text-yellow-500"><Bot size={16} /></div>}
              <div className={`flex max-w-[82%] flex-col gap-2 ${m.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`whitespace-pre-line break-words rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm md:text-[15px] ${m.sender === "bot" ? "rounded-bl-md border border-white/10 bg-white/[0.05] text-gray-100" : "rounded-br-md bg-yellow-500 font-medium text-black"}`}>
                  {m.text}
                </div>
                {(m.ticket || m.href) && (
                  <div className="flex flex-wrap gap-2">
                    {m.ticket && <button onClick={() => setSheet("ticket")} className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3.5 py-1.5 text-xs font-bold text-yellow-400 transition hover:bg-yellow-500/20 active:scale-95"><Ticket size={14} /> Raise a ticket</button>}
                    {m.href && <Link href={m.href.to} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-gray-200 transition hover:bg-white/10 active:scale-95">{m.href.label}</Link>}
                  </div>
                )}
                {mounted && <span className="px-1 text-[10px] text-gray-600">{fmtTime(m.ts)}</span>}
              </div>
            </motion.div>
          ))}

          {typing && (
            <div className="flex items-end gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-500/15 text-yellow-500"><Bot size={16} /></div>
              <div className="flex gap-1 rounded-3xl rounded-bl-md border border-white/10 bg-white/[0.05] px-4 py-4" aria-label="Bot is typing">
                {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}
          <div ref={bottom} />
        </div>
      </main>

      {/* Composer */}
      <footer className="z-30 shrink-0 border-t border-white/5 bg-[#09090e] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto max-w-3xl px-4">
          {!user && mounted && (
            <Link href="/" className="mb-3 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] py-2 text-xs text-gray-400 transition hover:text-white">
              <LogIn size={14} /> Log in to raise and track tickets
            </Link>
          )}
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {FAQS.map((f) => (
              <button key={f.label} onClick={() => ask(f.q, f)} className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300 transition hover:border-yellow-500/40 hover:text-white active:scale-95">{f.label}</button>
            ))}
            <button onClick={() => setSheet("ticket")} className="flex shrink-0 items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-xs font-bold text-yellow-400 transition hover:bg-yellow-500/20 active:scale-95"><Ticket size={14} /> Raise ticket</button>
            {SUPPORT_EMAIL && <a href={`mailto:${SUPPORT_EMAIL}`} className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300"><Mail size={14} /> Email us</a>}
          </div>
          <form onSubmit={send} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1.5 pl-5 transition focus-within:border-yellow-500/50 focus-within:ring-4 focus-within:ring-yellow-500/10">
            <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={200} placeholder="Type your question…" aria-label="Type your question" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500" />
            <button type="submit" disabled={!input.trim()} aria-label="Send" className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 text-black transition hover:bg-yellow-400 active:scale-90 disabled:opacity-40"><Send size={17} /></button>
          </form>
        </div>
      </footer>

      {/* Sheets */}
      <AnimatePresence>
        {sheet === "ticket" && (
          <Sheet title="Raise a support ticket" onClose={() => setSheet(null)}>
            {user ? <TicketForm user={user} onSent={onTicketSent} onError={(m) => notify(m, "error")} /> : <LoginPrompt />}
          </Sheet>
        )}
        {sheet === "mine" && (
          <Sheet title="My tickets" onClose={() => setSheet(null)}>
            {!user ? <LoginPrompt /> : myTickets === null ? (
              <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/5" />)}</div>
            ) : myTickets === false ? (
              <p className="py-6 text-center text-sm text-gray-400">Couldn’t load your tickets right now. Please try again later.</p>
            ) : myTickets.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">No tickets yet. Hopefully you won’t need one 🙏</p>
            ) : (
              <ul className="space-y-3">
                {myTickets.map((t) => {
                  const st = String(t.status || "open").toLowerCase();
                  const done = ["resolved", "closed", "done"].includes(st);
                  return (
                    <li key={t.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{t.subject}</p>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold capitalize ${done ? "bg-emerald-500/15 text-emerald-400" : "bg-yellow-500/15 text-yellow-400"}`}>{st}</span>
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500"><Clock size={12} /> {fmtDate(t.created_at)}</p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function TicketForm({ user, onSent, onError }) {
  const [form, setForm] = useState({ category: "Payment", orderId: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.subject.trim().length >= 4 && form.message.trim().length >= 10;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    // Category and payment ID are folded into the existing columns, so no table changes are needed.
    const { data, error } = await supabase.from("tickets").insert([{
      user_id: user.id,
      user_email: user.email,
      subject: `[${form.category}] ${form.subject.trim()}`,
      message: `${form.orderId.trim() ? `Order/Payment ID: ${form.orderId.trim()}\n\n` : ""}${form.message.trim()}`,
    }]).select().maybeSingle();
    setBusy(false);
    if (error) return onError("Couldn’t submit the ticket. Please try again.");
    onSent(data?.id);
  };

  const field = "w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10";
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-gray-500">What is it about?</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button type="button" key={c} onClick={() => setForm((f) => ({ ...f, category: c }))} className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${form.category === c ? "border-yellow-500 bg-yellow-500 text-black" : "border-white/10 bg-white/5 text-gray-300 hover:border-yellow-500/40"}`}>{c}</button>
          ))}
        </div>
      </div>
      <input value={form.orderId} onChange={set("orderId")} maxLength={60} placeholder="Payment / Order ID (optional)" className={field} />
      <input value={form.subject} onChange={set("subject")} maxLength={80} placeholder="Problem title (e.g. Book not unlocked)" className={field} required />
      <div>
        <textarea value={form.message} onChange={set("message")} maxLength={600} placeholder="Describe your problem in detail…" className={`${field} h-28 resize-none`} required />
        <p className="mt-1 text-right text-[11px] text-gray-600">{form.message.length}/600</p>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-gray-500"><Mail size={13} /> We’ll reply to {user.email} within 48 hours.</p>
      <button type="submit" disabled={!valid || busy} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 py-3.5 text-sm font-extrabold text-black shadow-[0_12px_28px_-12px_rgba(234,179,8,0.7)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? "Submitting…" : <><Send size={16} /> Submit ticket</>}
      </button>
    </form>
  );
}

function LoginPrompt() {
  return (
    <div className="py-8 text-center">
      <LogIn className="mx-auto mb-3 text-yellow-500" size={28} />
      <p className="mb-5 text-sm text-gray-400">Please log in first so we can link the ticket to your account.</p>
      <Link href="/" className="inline-block rounded-full bg-yellow-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-yellow-400 active:scale-95">Go to login</Link>
    </div>
  );
}

function Sheet({ title, onClose, children }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        role="dialog" aria-label={title}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="relative max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#0d0d14] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[2rem]"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white"><Ticket size={20} className="text-yellow-500" /> {title}</h2>
          <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Toast({ toast }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[9999] flex justify-center px-4" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold shadow-2xl backdrop-blur-md ${toast.type === "success" ? "border-emerald-500/40 bg-emerald-950/80 text-emerald-300" : "border-red-500/40 bg-red-950/80 text-red-300"}`}>
            {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
