"use client";
import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, Globe, BookOpen, Lock, X,
  Star, Zap, ChevronRight, AlertCircle, RefreshCw,
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Book {
  id: string;
  title: string;
  description: string;
  author: string;
  base_price: number;
  final_price: number;
  discount: number;
  pages: number;
  language: string;
  cover_url?: string;
  tags?: string[];
  is_active: boolean;
  created_at: string;
}

// ─── Supabase ────────────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Razorpay Script Loader ───────────────────────────────────────────────────
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Toast ───────────────────────────────────────────────────────────────────
interface Toast { id: number; message: string; type: "success" | "error" | "info" }
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const add = useCallback((message: string, type: Toast["type"] = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);
  return { toasts, add };
}

// ─── Translations ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  EN: {
    badge: "India's Most Trusted Spiritual Platform",
    heroTitle1: "Awaken Your",
    heroTitle2: "Consciousness",
    heroSub: "100% original, verified digital books on spirituality & psychology. Wisdom you won't find anywhere else.",
    libraryTitle1: "Premium",
    libraryTitle2: "Library",
    loading: "Connecting to Vault...",
    empty: "No books available right now. Admin is updating the vault.",
    buy: "Buy Securely",
    close: "Close",
    pages: "Pages",
    author: "Author",
    language: "Language",
    off: "OFF",
    originalPrice: "Original",
    payFail: "Payment gateway failed to load. Please check your connection.",
    paySuccess: "Payment Successful! 🎉",
    retry: "Retry",
    fetchError: "Failed to load books. Please try again.",
    details: "View Details",
    trusted: "256-bit Secure",
    instant: "Instant PDF",
    rated: "Highly Rated",
  },
  HI: {
    badge: "भारत का सबसे विश्वसनीय आध्यात्मिक मंच",
    heroTitle1: "जागाएं अपनी",
    heroTitle2: "चेतना",
    heroSub: "आध्यात्मिकता और मनोविज्ञान पर 100% मूल, सत्यापित डिजिटल किताबें।",
    libraryTitle1: "प्रीमियम",
    libraryTitle2: "संग्रह",
    loading: "वॉल्ट से जुड़ रहे हैं...",
    empty: "अभी कोई किताब उपलब्ध नहीं है। एडमिन जल्द अपडेट करेंगे।",
    buy: "सुरक्षित खरीदें",
    close: "बंद करें",
    pages: "पृष्ठ",
    author: "लेखक",
    language: "भाषा",
    off: "छूट",
    originalPrice: "मूल मूल्य",
    payFail: "पेमेंट गेटवे लोड नहीं हुआ। कनेक्शन जांचें।",
    paySuccess: "भुगतान सफल! 🎉",
    retry: "पुनः प्रयास",
    fetchError: "किताबें लोड नहीं हुईं। दोबारा कोशिश करें।",
    details: "विवरण देखें",
    trusted: "256-बिट सुरक्षित",
    instant: "तुरंत PDF",
    rated: "उच्च रेटेड",
  },
};

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 20, padding: 28, animation: "pulse 1.8s ease-in-out infinite",
    }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)", margin: "0 auto 20px" }} />
      <div style={{ height: 20, background: "rgba(255,255,255,0.05)", borderRadius: 8, marginBottom: 10 }} />
      <div style={{ height: 14, background: "rgba(255,255,255,0.04)", borderRadius: 8, width: "70%", margin: "0 auto 24px" }} />
      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ width: 60, height: 30, background: "rgba(255,255,255,0.05)", borderRadius: 8 }} />
        <div style={{ width: 120, height: 44, background: "rgba(234,179,8,0.08)", borderRadius: 12 }} />
      </div>
    </div>
  );
}

// ─── Book Detail Modal ─────────────────────────────────────────────────────────
function BookModal({
  book, lang, onClose, onBuy,
}: { book: Book; lang: "EN" | "HI"; onClose: () => void; onBuy: (b: Book) => void }) {
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handleKey); };
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        animation: "fadeIn 0.2s ease",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#0d0d10", border: "1px solid rgba(234,179,8,0.2)",
          borderRadius: 24, padding: 36, maxWidth: 520, width: "100%",
          maxHeight: "90vh", overflowY: "auto",
          boxShadow: "0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(234,179,8,0.1)",
          animation: "slideUp 0.25s cubic-bezier(.22,.68,0,1.2)",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.07)",
            border: "none", borderRadius: "50%", width: 36, height: 36, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#888", transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(234,179,8,0.15)"; (e.currentTarget as HTMLButtonElement).style.color = "#eab308"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLButtonElement).style.color = "#888"; }}
        >
          <X size={16} />
        </button>

        {/* Book Icon */}
        <div style={{
          width: 100, height: 100, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(234,179,8,0.1) 0%, rgba(234,179,8,0.02) 100%)",
          border: "1px solid rgba(234,179,8,0.25)", display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 24px",
        }}>
          <BookOpen size={46} color="#eab308" />
        </div>

        {/* Discount Badge */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <span style={{
            background: "rgba(234,179,8,0.12)", color: "#eab308", padding: "4px 14px",
            borderRadius: 99, fontSize: 12, fontWeight: 700, border: "1px solid rgba(234,179,8,0.25)",
          }}>
            {book.discount}% {t.off}
          </span>
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: "'Cinzel', serif", fontSize: 26, fontWeight: 900,
          textAlign: "center", color: "#fff", marginBottom: 16, lineHeight: 1.3,
        }}>
          {book.title}
        </h2>

        {/* Tags */}
        {book.tags && book.tags.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
            {book.tags.map((tag) => (
              <span key={tag} style={{
                background: "rgba(255,255,255,0.05)", color: "#aaa",
                padding: "3px 12px", borderRadius: 99, fontSize: 12, border: "1px solid rgba(255,255,255,0.08)",
              }}>{tag}</span>
            ))}
          </div>
        )}

        {/* Description */}
        {book.description && (
          <p style={{ color: "#888", fontSize: 14, lineHeight: 1.8, marginBottom: 24, textAlign: "center" }}>
            {book.description}
          </p>
        )}

        {/* Meta Info */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 28,
          background: "rgba(255,255,255,0.02)", borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.06)", padding: 16,
        }}>
          {[
            { label: t.author, value: book.author || "VEDOXA" },
            { label: t.pages, value: book.pages ? `${book.pages}` : "—" },
            { label: t.language, value: book.language || "Hindi" },
          ].map((item) => (
            <div key={item.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>{item.label}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e2e5" }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Price + CTA */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontSize: 12, color: "#555", textDecoration: "line-through" }}>₹{book.base_price}</div>
            <div style={{ fontSize: 32, fontWeight: 900, color: "#fff", lineHeight: 1 }}>₹{book.final_price}</div>
          </div>
          <button
            onClick={() => onBuy(book)}
            style={{
              flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
              gap: 10, padding: "14px 24px", borderRadius: 14, fontSize: 15,
              fontWeight: 700, background: "linear-gradient(135deg, #eab308, #d97706)",
              color: "#000", border: "none", cursor: "pointer", transition: "all 0.25s ease",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 30px rgba(234,179,8,0.45)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = ""; (e.currentTarget as HTMLButtonElement).style.boxShadow = ""; }}
          >
            <Lock size={16} /> {t.buy}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VedoxaHome() {
  const [lang, setLang] = useState<"EN" | "HI">("EN");
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [payingId, setPayingId] = useState<string | null>(null);
  const { toasts, add: addToast } = useToast();

  const t = TRANSLATIONS[lang];

  // Fetch Books
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("books")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (err) {
      setError(t.fetchError);
    } else {
      setBooks(data as Book[]);
    }
    setLoading(false);
  }, [t.fetchError]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  // Razorpay Payment
  const handlePayment = async (book: Book) => {
    if (payingId) return;
    setPayingId(book.id);

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      addToast(t.payFail, "error");
      setPayingId(null);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: Math.round(book.final_price * 100),
      currency: "INR",
      name: "VEDOXA",
      description: book.title,
      theme: { color: "#eab308" },
      modal: { ondismiss: () => setPayingId(null) },
      handler: (response: { razorpay_payment_id: string }) => {
        addToast(`${t.paySuccess} ID: ${response.razorpay_payment_id}`, "success");
        setSelectedBook(null);
        setPayingId(null);
        // TODO: Call your backend API to verify payment & trigger PDF delivery
      },
    };

    try {
      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", () => {
        addToast("Payment failed. Please try again.", "error");
        setPayingId(null);
      });
      rzp.open();
    } catch {
      addToast(t.payFail, "error");
      setPayingId(null);
    }
  };

  const trust = [
    { icon: <ShieldCheck size={18} />, label: t.trusted },
    { icon: <Zap size={18} />, label: t.instant },
    { icon: <Star size={18} />, label: t.rated },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #06060a; color: #e2e2e5; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d0d12; }
        ::-webkit-scrollbar-thumb { background: rgba(234,179,8,0.3); border-radius: 3px; }

        .gold-text { background: linear-gradient(135deg, #f59e0b 0%, #eab308 40%, #fcd34d 70%, #d97706 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .card { background: rgba(255,255,255,0.018); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px; position: relative; cursor: pointer; transition: transform 0.3s cubic-bezier(.22,.68,0,1.1), box-shadow 0.3s ease, border-color 0.3s ease; }
        .card:hover { transform: translateY(-8px); box-shadow: 0 24px 60px rgba(234,179,8,0.12); border-color: rgba(234,179,8,0.25); }
        .btn-gold { background: linear-gradient(135deg, #eab308, #d97706); color: #000; border: none; cursor: pointer; font-weight: 700; font-family: 'DM Sans', sans-serif; transition: all 0.25s ease; }
        .btn-gold:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(234,179,8,0.45); }
        .btn-gold:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-outline { background: transparent; color: #e2e2e5; border: 1px solid rgba(255,255,255,0.12); cursor: pointer; font-weight: 600; font-family: 'DM Sans', sans-serif; transition: all 0.25s ease; }
        .btn-outline:hover { background: rgba(234,179,8,0.08); border-color: #eab308; color: #eab308; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(30px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes toastIn { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .spinner { animation: spin 0.8s linear infinite; }
        .hero-glow { position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 700px; height: 700px; background: radial-gradient(circle, rgba(234,179,8,0.06) 0%, transparent 70%); pointer-events: none; }
      `}</style>

      {/* Toast Notifications */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 2000, display: "flex", flexDirection: "column", gap: 10 }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{
            padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600,
            background: toast.type === "success" ? "rgba(16,185,129,0.15)" : toast.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.12)",
            border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : toast.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(234,179,8,0.3)"}`,
            color: toast.type === "success" ? "#34d399" : toast.type === "error" ? "#f87171" : "#fcd34d",
            backdropFilter: "blur(12px)", animation: "toastIn 0.25s ease",
            maxWidth: 340, boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}>
            {toast.message}
          </div>
        ))}
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          lang={lang}
          onClose={() => setSelectedBook(null)}
          onBuy={handlePayment}
        />
      )}

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* ─── Navbar ─── */}
        <nav style={{
          padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "rgba(6,6,10,0.80)", borderBottom: "1px solid rgba(255,255,255,0.06)",
          position: "sticky", top: 0, zIndex: 500, backdropFilter: "blur(24px)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck color="#eab308" size={28} />
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 900, letterSpacing: 5, color: "#fff" }}>VEDOXA</span>
          </div>
          <button
            onClick={() => setLang((l) => l === "EN" ? "HI" : "EN")}
            className="btn-outline"
            style={{ padding: "6px 16px", borderRadius: 99, fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}
          >
            <Globe size={14} /> {lang === "EN" ? "हिंदी" : "English"}
          </button>
        </nav>

        {/* ─── Hero ─── */}
        <section style={{ textAlign: "center", padding: "90px 24px 60px", position: "relative", overflow: "hidden" }}>
          <div className="hero-glow" />

          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(234,179,8,0.08)", border: "1px solid rgba(234,179,8,0.25)", padding: "6px 18px", borderRadius: 99, marginBottom: 30, fontSize: 13, fontWeight: 600, color: "#eab308" }}>
            <ShieldCheck size={13} /> {t.badge}
          </div>

          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(34px, 7vw, 68px)", fontWeight: 900, lineHeight: 1.15, marginBottom: 22, letterSpacing: "-0.5px" }}>
            {t.heroTitle1}&nbsp;<span className="gold-text">{t.heroTitle2}</span>
          </h1>

          <p style={{ color: "#777", maxWidth: 580, margin: "0 auto 44px", fontSize: 16, lineHeight: 1.75 }}>
            {t.heroSub}
          </p>

          {/* Trust Badges */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {trust.map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, color: "#666", fontSize: 13, fontWeight: 500 }}>
                <span style={{ color: "#eab308" }}>{item.icon}</span> {item.label}
              </div>
            ))}
          </div>
        </section>

        {/* ─── Books Grid ─── */}
        <section style={{ padding: "20px 24px 100px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 30, fontWeight: 700, marginBottom: 40, textAlign: "center" }}>
            {t.libraryTitle1} <span className="gold-text">{t.libraryTitle2}</span>
          </h2>

          {loading ? (
            <div>
              <div style={{ textAlign: "center", color: "#eab308", fontSize: 13, letterSpacing: 2, fontWeight: 600, marginBottom: 32 }}>{t.loading}</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 24 }}>
                {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
              </div>
            </div>
          ) : error ? (
            <div style={{ textAlign: "center", padding: "60px 24px" }}>
              <AlertCircle size={40} color="#ef4444" style={{ margin: "0 auto 16px" }} />
              <p style={{ color: "#888", marginBottom: 20 }}>{error}</p>
              <button onClick={fetchBooks} className="btn-gold" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 10, fontSize: 14 }}>
                <RefreshCw size={15} /> {t.retry}
              </button>
            </div>
          ) : books.length === 0 ? (
            <div style={{ textAlign: "center", color: "#555", padding: "60px 24px", border: "1px dashed rgba(255,255,255,0.08)", borderRadius: 20 }}>
              {t.empty}
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 24 }}>
              {books.map((book) => (
                <div key={book.id} className="card" onClick={() => setSelectedBook(book)}>
                  {/* Discount Badge */}
                  <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(234,179,8,0.1)", color: "#eab308", padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, border: "1px solid rgba(234,179,8,0.2)" }}>
                    {book.discount}% {t.off}
                  </div>

                  {/* Icon */}
                  <div style={{ width: 76, height: 76, borderRadius: "50%", background: "radial-gradient(circle, rgba(234,179,8,0.08), transparent)", border: "1px solid rgba(234,179,8,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                    <BookOpen size={34} color="#eab308" />
                  </div>

                  {/* Title */}
                  <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, marginBottom: 8, textAlign: "center", color: "#fff", lineHeight: 1.3 }}>
                    {book.title}
                  </h3>

                  {/* Short description */}
                  {book.description && (
                    <p style={{ color: "#666", fontSize: 13, textAlign: "center", lineHeight: 1.6, marginBottom: 4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {book.description}
                    </p>
                  )}

                  {/* View Details hint */}
                  <div style={{ textAlign: "center", marginTop: 8, marginBottom: 4 }}>
                    <span style={{ color: "#eab308", fontSize: 12, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 4, opacity: 0.8 }}>
                      {t.details} <ChevronRight size={12} />
                    </span>
                  </div>

                  {/* Price + CTA */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div>
                      <div style={{ fontSize: 12, color: "#555", textDecoration: "line-through" }}>₹{book.base_price}</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>₹{book.final_price}</div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handlePayment(book); }}
                      disabled={payingId === book.id}
                      className="btn-gold"
                      style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 12, fontSize: 14 }}
                    >
                      {payingId === book.id
                        ? <RefreshCw size={15} className="spinner" />
                        : <Lock size={15} />}
                      {t.buy}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ─── Footer ─── */}
        <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "28px 24px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
            <ShieldCheck color="#eab308" size={18} />
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 900, letterSpacing: 4, color: "#fff" }}>VEDOXA</span>
          </div>
          <p style={{ color: "#444", fontSize: 12 }}>© {new Date().getFullYear()} VEDOXA. All rights reserved. Payments secured by Razorpay.</p>
        </footer>

      </div>
    </>
  );
}
