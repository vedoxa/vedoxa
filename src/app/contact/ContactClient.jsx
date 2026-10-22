"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import {
  Mail, Clock, LifeBuoy, Copy, Check, Send, ShieldAlert, ChevronDown,
  CreditCard, KeyRound, BookOpen, MessageSquare, Sparkles, ArrowRight, Info, Download,
} from "lucide-react";

/* ───────── Yahin se apni details badlo ───────── */
const SITE = {
  brand: "VEDOXA",
  email: "vedoxa1@gmail.com",
  responseTime: "24-48 Business Hours",
  grievanceOfficer: "", // optional: apna/officer ka naam likho, khali ho to "VEDOXA Support Team" dikhega
};

const TOPICS = [
  { id: "file", label: "File / Download issue", icon: Download },
  { id: "payment", label: "Payment deducted, no access", icon: CreditCard },
  { id: "login", label: "Login / Account", icon: KeyRound },
  { id: "content", label: "Book or content query", icon: BookOpen },
  { id: "other", label: "Something else", icon: MessageSquare },
];

const FAQS = [
  {
    q: "I paid but I can't access my book.",
    a: "Wait a couple of minutes, refresh your library page and sign in again. If the book still doesn't appear, write to us with your transaction ID and registered email so we can check the delivery.",
  },
  {
    q: "My downloaded file won't open.",
    a: "Use an up-to-date browser or PDF reader and make sure the download finished fully. If it still fails, tell us your device, browser and what you see on screen, and we'll guide you.",
  },
  {
    q: "How long does support take to reply?",
    a: `Our typical response time is ${SITE.responseTime}. One clear email with all details gets the fastest answer, so there's no need to send repeat messages.`,
  },
  {
    q: "Can I request a refund or cancellation?",
    a: "No. As per our platform policies, all sales of successfully delivered digital goods are final. Support is limited to technical assistance for file access.",
  },
  {
    q: "What should I include in my message?",
    a: "Your registered email, the order or transaction ID, the book title, your device and browser, and a short description (or the exact error text) of what is going wrong.",
  },
];

const CHECKLIST = [
  "Your name and registered email",
  "Order or transaction ID (from your payment confirmation)",
  "Title of the book",
  "Device, browser and the exact error you see",
];

const STEPS = [
  { t: "Send your details", d: "Use the form or email us directly." },
  { t: "We review your case", d: "Our team checks your order and file delivery." },
  { t: "You get a reply", d: `Within ${SITE.responseTime.toLowerCase()} with the next steps.` },
];

/* ───────── helpers ───────── */
const EASE = [0.16, 1, 0.3, 1];
const fadeUp = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const REFUND_RE = /refund|cancel|money back|paise wapas|wapas chahiye|chargeback/i;

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); return true; }
  } catch {}
  try {
    const ta = document.createElement("textarea");
    ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch { return false; }
}

function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = "Please enter your name.";
  if (!EMAIL_RE.test(f.email.trim())) e.email = "Enter a valid email address.";
  if (f.message.trim().length < 10) e.message = "Please describe the issue (at least 10 characters).";
  return e;
}

function Section({ children, className = "" }) {
  return (
    <motion.section variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-70px" }} className={className}>
      {children}
    </motion.section>
  );
}

function SpotCard({ children, className = "", ...rest }) {
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
    e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  return (
    <motion.div variants={fadeUp} onMouseMove={onMove} className={`ct-card ${className}`} {...rest}>
      {children}
    </motion.div>
  );
}

function Field({ id, label, error, hint, children }) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center justify-between text-xs font-medium tracking-wide text-gray-300 mb-2">
        <span>{label}</span>
        {hint && <span className="text-gray-500 font-normal">{hint}</span>}
      </label>
      {children}
      <AnimatePresence initial={false}>
        {error && (
          <motion.p id={`${id}-err`} role="alert" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }} className="text-xs text-rose-300/90 mt-1.5 overflow-hidden">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function FaqItem({ id, q, a, open, onToggle }) {
  return (
    <div className="border-b border-white/10 last:border-0">
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={`faq-${id}`}
        className="w-full flex items-center justify-between gap-4 py-4 text-left text-[15px] sm:text-base font-medium text-white/90 hover:text-amber-200 transition-colors">
        <span>{q}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }} className="shrink-0">
          <ChevronDown size={18} className="text-amber-300/80" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={`faq-${id}`} role="region" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: EASE }} className="overflow-hidden">
            <p className="pb-4 text-sm sm:text-[15px] leading-relaxed text-gray-400">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ───────── Contact form ───────── */
function ContactForm({ toast }) {
  const [f, setF] = useState({ name: "", email: "", topic: "file", orderId: "", message: "" });
  const [touched, setTouched] = useState({});
  const [sent, setSent] = useState(null);
  const errors = useMemo(() => validate(f), [f]);
  const set = (k) => (e) => setF((p) => ({ ...p, [k]: e.target.value }));
  const blur = (k) => () => setTouched((p) => ({ ...p, [k]: true }));
  const err = (k) => (touched[k] ? errors[k] : undefined);
  const refundish = REFUND_RE.test(f.message);

  const submit = (e) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });
    if (Object.keys(errors).length) return;
    const t = TOPICS.find((x) => x.id === f.topic) || TOPICS[0];
    const oid = f.orderId.trim();
    const subject = `[${SITE.brand} Support] ${t.label}${oid ? ` | ID: ${oid}` : ""}`;
    const body = [
      `Name: ${f.name.trim()}`,
      `Registered email: ${f.email.trim()}`,
      `Topic: ${t.label}`,
      oid ? `Order / Transaction ID: ${oid}` : null,
      "",
      f.message.trim(),
      "",
      "--",
      `Device: ${typeof navigator !== "undefined" ? navigator.userAgent : ""}`,
    ].filter((x) => x !== null).join("\n");
    const mailto = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    const gmail = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SITE.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSent({ mailto, gmail, subject, body });
    try { window.location.href = mailto; } catch {}
  };

  const reset = () => { setSent(null); setTouched({}); setF({ name: "", email: "", topic: "file", orderId: "", message: "" }); };
  const inputCls = "ct-input w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-[15px] text-white placeholder-gray-500 outline-none transition-all duration-300 hover:border-white/20 focus:border-amber-400/60 focus:bg-white/[0.06]";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {sent ? (
        <motion.div key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.45, ease: EASE }} className="text-center py-6" aria-live="polite">
          <div className="mx-auto mb-5 w-20 h-20 rounded-full bg-emerald-400/10 border border-emerald-300/30 flex items-center justify-center shadow-[0_0_50px_rgba(52,211,153,0.2)]">
            <svg viewBox="0 0 24 24" className="w-9 h-9" fill="none" stroke="#6ee7b7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.15, ease: "easeOut" }} />
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-white mb-2">Your message is ready</h3>
          <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
            Your email app should open with everything filled in. Just press <strong className="text-gray-200">Send</strong>. No mail app? Use Gmail or copy the message below.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-6">
            <a href={sent.mailto} className="ct-btn inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold"><Mail size={16} /> Open email app</a>
            <a href={sent.gmail} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-colors">Open Gmail <ArrowRight size={15} /></a>
            <button type="button" onClick={async () => toast((await copyText(`To: ${SITE.email}\nSubject: ${sent.subject}\n\n${sent.body}`)) ? "Message copied" : "Copy failed, please select and copy manually")} className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium border border-white/15 bg-white/5 hover:bg-white/10 text-white transition-colors"><Copy size={15} /> Copy message</button>
          </div>
          <button type="button" onClick={reset} className="mt-6 text-xs text-gray-500 hover:text-amber-200 transition-colors underline underline-offset-4">Write another message</button>
        </motion.div>
      ) : (
        <motion.form key="form" onSubmit={submit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-5">
          <div>
            <p className="text-xs font-medium tracking-wide text-gray-300 mb-2">What do you need help with?</p>
            <div role="radiogroup" aria-label="Topic" className="flex flex-wrap gap-2">
              {TOPICS.map((t) => {
                const on = f.topic === t.id; const Icon = t.icon;
                return (
                  <button key={t.id} type="button" role="radio" aria-checked={on} onClick={() => setF((p) => ({ ...p, topic: t.id }))}
                    className={`relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs sm:text-[13px] border transition-colors duration-300 ${on ? "text-amber-100 border-amber-300/40" : "text-gray-400 border-white/10 hover:border-white/25 hover:text-gray-200"}`}>
                    {on && <motion.span layoutId="ct-topic" transition={{ type: "spring", stiffness: 380, damping: 32 }} className="absolute inset-0 rounded-xl bg-amber-400/15" />}
                    <Icon size={14} className="relative" /><span className="relative">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <Field id="ct-name" label="Your name" error={err("name")}>
              <input id="ct-name" autoComplete="name" value={f.name} onChange={set("name")} onBlur={blur("name")} aria-invalid={!!err("name")} aria-describedby={err("name") ? "ct-name-err" : undefined} placeholder="Full name" className={inputCls} />
            </Field>
            <Field id="ct-email" label="Registered email" error={err("email")}>
              <input id="ct-email" type="email" inputMode="email" autoComplete="email" value={f.email} onChange={set("email")} onBlur={blur("email")} aria-invalid={!!err("email")} aria-describedby={err("email") ? "ct-email-err" : undefined} placeholder="you@example.com" className={inputCls} />
            </Field>
          </div>

          <Field id="ct-oid" label="Order / Transaction ID" hint="Optional">
            <input id="ct-oid" value={f.orderId} onChange={set("orderId")} placeholder="e.g. pay_XXXXXXXXXXXX" className={inputCls} />
          </Field>

          <Field id="ct-msg" label="Describe the issue" error={err("message")} hint={`${f.message.length}/1000`}>
            <textarea id="ct-msg" rows={5} maxLength={1000} value={f.message} onChange={set("message")} onBlur={blur("message")} aria-invalid={!!err("message")} aria-describedby={err("message") ? "ct-msg-err" : undefined} placeholder="What happened? Which book? Any error message you saw?" className={`${inputCls} resize-none`} />
          </Field>

          <AnimatePresence initial={false}>
            {refundish && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="flex gap-3 rounded-xl border border-amber-300/25 bg-amber-400/[0.06] p-3.5 text-xs leading-relaxed text-amber-100/90">
                  <Info size={16} className="shrink-0 mt-0.5 text-amber-300" />
                  <p>As per our platform policy, all sales of delivered digital goods are final, so refunds and cancellations can't be processed. If you were charged but can't access your book, please share the transaction ID and we'll check the delivery.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.button type="submit" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="ct-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full px-8 py-3 text-sm sm:text-base font-bold">
            <Send size={17} /> Send message
          </motion.button>
          <p className="text-[11px] text-gray-500 leading-relaxed">We never ask for your password, card number or OTP. This form opens your email app with the message pre-filled, so nothing is sent until you press Send.</p>
        </motion.form>
      )}
    </AnimatePresence>
  );
}

/* ───────── Page ───────── */
export default function ContactClient() {
  const [openFaq, setOpenFaq] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const toast = (m) => { setToastMsg(m); setTimeout(() => setToastMsg(""), 2200); };

  return (
    <MotionConfig reducedMotion="user">
      <main className="relative isolate overflow-hidden bg-[#05060d] text-gray-100 min-h-screen">
        <style>{CSS}</style>

        {/* Aurora background */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 pointer-events-none">
          <div className="ct-aurora ct-a1" /><div className="ct-aurora ct-a2" /><div className="ct-aurora ct-a3" />
          <div className="ct-grid" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
          {/* Hero */}
          <motion.header initial="hidden" animate="show" variants={stagger} className="text-center max-w-3xl mx-auto">
            <motion.div variants={fadeUp} className="relative mx-auto mb-7 w-20 h-20 flex items-center justify-center">
              <span className="ct-ring absolute inset-0 rounded-full bg-amber-400/20" />
              <span className="ct-ring absolute inset-0 rounded-full bg-amber-300/15" style={{ animationDelay: "1.5s" }} />
              <span className="ct-float relative w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_40px_rgba(245,158,11,0.45)]">
                <LifeBuoy className="text-[#2a1205]" size={30} />
              </span>
              <Sparkles size={16} className="ct-twinkle absolute -top-1 -right-2 text-amber-200" />
            </motion.div>
            <motion.p variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-400/[0.07] px-4 py-1.5 text-xs tracking-[0.18em] uppercase text-amber-200/90 mb-5">Support Desk</motion.p>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 leading-tight"><span className="ct-gold">Contact Us</span></motion.h1>
            <motion.p variants={fadeUp} className="text-base sm:text-lg leading-relaxed text-gray-300/90">
              At {SITE.brand}, we are committed to providing seamless access to our premium digital library. If you face any technical difficulties accessing your downloaded file, our support team is here to help.
            </motion.p>
          </motion.header>

          {/* Info cards */}
          <Section className="grid gap-4 sm:grid-cols-3 mt-14">
            <SpotCard className="p-6">
              <div className="ct-ico"><Mail size={20} /></div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Email</p>
              <a href={`mailto:${SITE.email}`} className="text-[17px] font-semibold text-white break-all hover:text-amber-200 transition-colors">{SITE.email}</a>
              <div className="flex gap-2 mt-4">
                <a href={`mailto:${SITE.email}`} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs text-white transition-colors">Write email <ArrowRight size={13} /></a>
                <button type="button" aria-label="Copy email address" onClick={async () => toast((await copyText(SITE.email)) ? "Email address copied" : "Copy failed")} className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 text-xs text-white transition-colors"><Copy size={13} /> Copy</button>
              </div>
            </SpotCard>
            <SpotCard className="p-6">
              <div className="ct-ico"><Clock size={20} /></div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Response Time</p>
              <p className="text-[17px] font-semibold text-white">{SITE.responseTime}</p>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">One clear email with all details gets the fastest answer.</p>
              <div className="ct-bar mt-4" aria-hidden="true" />
            </SpotCard>
            <SpotCard className="p-6">
              <div className="ct-ico"><LifeBuoy size={20} /></div>
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-1">Technical Support</p>
              <p className="text-[17px] font-semibold text-white">File access &amp; delivery</p>
              <p className="text-sm text-gray-400 mt-2 leading-relaxed">Downloads, opening your book, login, and payment-delivery issues.</p>
            </SpotCard>
          </Section>

          {/* Form + side info */}
          <Section className="grid gap-6 lg:grid-cols-5 mt-6">
            <SpotCard className="lg:col-span-3 p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-white mb-1">Technical Support Desk</h2>
              <p className="text-sm text-gray-400 mb-6">Tell us what's wrong and we'll take it from there.</p>
              <ContactForm toast={toast} />
            </SpotCard>

            <div className="lg:col-span-2 grid gap-6 content-start">
              <SpotCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Include these for a faster fix</h3>
                <ul className="space-y-3">
                  {CHECKLIST.map((c) => (
                    <li key={c} className="flex gap-3 text-sm text-gray-300 leading-relaxed">
                      <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-amber-400/15 border border-amber-300/30 flex items-center justify-center"><Check size={12} className="text-amber-300" /></span>{c}
                    </li>
                  ))}
                </ul>
              </SpotCard>
              <SpotCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-5">How it works</h3>
                <ol className="relative space-y-6">
                  <motion.span aria-hidden="true" initial={{ scaleY: 0 }} whileInView={{ scaleY: 1 }} viewport={{ once: true }} transition={{ duration: 1, ease: EASE }} style={{ originY: 0 }} className="absolute left-[13px] top-3 bottom-3 w-px bg-gradient-to-b from-amber-300/60 to-transparent" />
                  {STEPS.map((s, i) => (
                    <li key={s.t} className="relative flex gap-4">
                      <span className="relative z-10 shrink-0 w-7 h-7 rounded-full bg-[#0b0d18] border border-amber-300/40 text-amber-200 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                      <div><p className="text-sm font-semibold text-white">{s.t}</p><p className="text-sm text-gray-400 mt-0.5 leading-relaxed">{s.d}</p></div>
                    </li>
                  ))}
                </ol>
              </SpotCard>
            </div>
          </Section>

          {/* Refund notice (policy as-is) */}
          <Section className="mt-6">
            <SpotCard className="p-6 sm:p-7 !border-rose-400/25">
              <div className="flex gap-4">
                <div className="shrink-0 w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-400/30 flex items-center justify-center"><ShieldAlert size={20} className="text-rose-300" /></div>
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Important Notice Regarding Refunds</h2>
                  <p className="text-sm sm:text-[15px] leading-relaxed text-gray-300">
                    Please note that as per our platform policies, all sales are absolute and final. <strong className="text-white">Do not contact support requesting a refund or cancellation</strong>, as our system does not allow for reverse transactions on successfully delivered digital goods under any circumstances. Support is strictly limited to technical assistance for file access.
                  </p>
                </div>
              </div>
            </SpotCard>
          </Section>

          {/* FAQ */}
          <Section className="mt-16">
            <motion.div variants={fadeUp} className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white">Quick answers</h2>
              <p className="text-sm text-gray-400 mt-2">The most common questions, before you write to us.</p>
            </motion.div>
            <SpotCard className="px-6 sm:px-8 max-w-3xl mx-auto">
              {FAQS.map((x, i) => (
                <FaqItem key={x.q} id={i} q={x.q} a={x.a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
              ))}
            </SpotCard>
          </Section>

          {/* Escalation + CTA */}
          <Section className="mt-16">
            <SpotCard className="p-6 sm:p-8 text-center">
              <h2 className="text-xl font-semibold text-white mb-2">Still need help?</h2>
              <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                If your issue isn't resolved, reply to our email or write again to <a href={`mailto:${SITE.email}?subject=${encodeURIComponent(`[${SITE.brand}] Escalation`)}`} className="text-amber-200 hover:underline underline-offset-4">{SITE.email}</a> with the subject "Escalation" and your earlier details. Grievance contact: <span className="text-gray-200">{SITE.grievanceOfficer || `${SITE.brand} Support Team`}</span>.
              </p>
              <Link href="/explore" className="ct-btn mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-bold"><BookOpen size={16} /> Back to the library</Link>
            </SpotCard>
          </Section>
        </div>

        {/* Toast */}
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center pointer-events-none px-4">
          <AnimatePresence>
            {toastMsg && (
              <motion.div key={toastMsg} role="status" initial={{ opacity: 0, y: 16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.97 }} transition={{ duration: 0.3, ease: EASE }} className="flex items-center gap-2 rounded-full border border-emerald-300/30 bg-[#0b1512]/90 backdrop-blur px-4 py-2.5 text-sm text-emerald-100 shadow-xl">
                <Check size={15} className="text-emerald-300" /> {toastMsg}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </MotionConfig>
  );
}

/* ───────── Styles ───────── */
const CSS = `
.ct-aurora{position:absolute;border-radius:9999px;filter:blur(90px);will-change:transform}
.ct-a1{width:520px;height:520px;background:#f59e0b;opacity:.22;top:-170px;left:-130px;animation:ct-d1 22s ease-in-out infinite alternate}
.ct-a2{width:460px;height:460px;background:#7c3aed;opacity:.2;top:28%;right:-170px;animation:ct-d2 26s ease-in-out infinite alternate}
.ct-a3{width:420px;height:420px;background:#2563eb;opacity:.16;bottom:-150px;left:25%;animation:ct-d1 30s ease-in-out infinite alternate-reverse}
@keyframes ct-d1{to{transform:translate(70px,45px) scale(1.15)}}
@keyframes ct-d2{to{transform:translate(-80px,55px) scale(1.1)}}
.ct-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:radial-gradient(ellipse at 50% 15%,#000 25%,transparent 72%);mask-image:radial-gradient(ellipse at 50% 15%,#000 25%,transparent 72%)}

.ct-gold{background:linear-gradient(90deg,#fde68a,#f59e0b,#fff3c4,#f59e0b,#fde68a);background-size:200% auto;-webkit-background-clip:text;background-clip:text;color:transparent;animation:ct-shine 6s linear infinite;filter:drop-shadow(0 0 16px rgba(255,170,50,.35))}
@keyframes ct-shine{to{background-position:200% center}}

.ct-ring{animation:ct-ring 3s ease-out infinite}
@keyframes ct-ring{0%{transform:scale(.8);opacity:.7}100%{transform:scale(1.9);opacity:0}}
.ct-float{animation:ct-fl 6s ease-in-out infinite}
@keyframes ct-fl{50%{transform:translateY(-7px)}}
.ct-twinkle{animation:ct-tw 2.8s ease-in-out infinite}
@keyframes ct-tw{0%,100%{opacity:.3;transform:scale(.8) rotate(0)}50%{opacity:1;transform:scale(1.15) rotate(20deg)}}

.ct-card{position:relative;overflow:hidden;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.08);border-radius:1.5rem;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px);transition:border-color .35s ease,transform .35s ease,box-shadow .35s ease}
.ct-card::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(420px circle at var(--mx,50%) var(--my,0%),rgba(251,191,36,.12),transparent 45%);opacity:0;transition:opacity .35s ease}
.ct-card:hover{border-color:rgba(251,191,36,.3);box-shadow:0 20px 60px -30px rgba(245,158,11,.35)}
.ct-card:hover::before{opacity:1}
.ct-card>*{position:relative}

.ct-ico{width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:1rem;color:#fcd34d;background:linear-gradient(135deg,rgba(251,191,36,.18),rgba(251,191,36,.05));border:1px solid rgba(251,191,36,.3)}
.ct-bar{height:4px;border-radius:9999px;background:rgba(255,255,255,.08);overflow:hidden;position:relative}
.ct-bar::after{content:"";position:absolute;inset:0;width:40%;border-radius:9999px;background:linear-gradient(90deg,transparent,#fcd34d,transparent);animation:ct-bar 2.4s ease-in-out infinite}
@keyframes ct-bar{0%{transform:translateX(-100%)}100%{transform:translateX(260%)}}

.ct-input:focus{box-shadow:0 0 0 4px rgba(251,191,36,.09)}
.ct-btn{background:linear-gradient(90deg,#fcd34d,#f59e0b,#fde68a,#f59e0b);background-size:220% auto;color:#2a1205;box-shadow:0 8px 28px -8px rgba(245,158,11,.6),inset 0 1px 0 rgba(255,255,255,.5);transition:transform .25s ease,box-shadow .25s ease,background-position .6s ease}
.ct-btn:hover{background-position:100% 0;box-shadow:0 12px 34px -8px rgba(245,158,11,.75),inset 0 1px 0 rgba(255,255,255,.6)}
.ct-btn:focus-visible,.ct-card button:focus-visible,.ct-card a:focus-visible,.ct-input:focus-visible{outline:2px solid rgba(252,211,77,.7);outline-offset:2px}

@media (prefers-reduced-motion:reduce){
  .ct-aurora,.ct-gold,.ct-ring,.ct-float,.ct-twinkle,.ct-bar::after{animation:none!important}
}
`;
