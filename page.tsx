import { useState, useEffect, useRef } from "react";
import { ShieldCheck, Globe, Search, ShoppingCart, Star, BookOpen, Menu, X, ChevronDown, Lock, Zap, Heart } from "lucide-react";

/* ─── Google Font via style injection ─── */
const fontStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:wght@300;400;500;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body { 
    background: #060608; 
    color: #e2e2e5; 
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
  }

  ::selection { background: #eab308; color: #000; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0a0a0d; }
  ::-webkit-scrollbar-thumb { background: #eab308; border-radius: 99px; }

  /* ── Keyframe Animations ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-12px); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(234,179,8,0.3); }
    50%       { box-shadow: 0 0 45px rgba(234,179,8,0.6); }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes scaleIn {
    from { opacity: 0; transform: scale(0.92); }
    to   { opacity: 1; transform: scale(1); }
  }

  .anim-fade-up   { animation: fadeUp 0.75s ease both; }
  .anim-fade-up-2 { animation: fadeUp 0.75s 0.15s ease both; }
  .anim-fade-up-3 { animation: fadeUp 0.75s 0.3s ease both; }
  .anim-fade-up-4 { animation: fadeUp 0.75s 0.45s ease both; }
  .anim-scale-in  { animation: scaleIn 0.6s 0.2s ease both; }
  .anim-fade-in   { animation: fadeIn 1s ease both; }

  .float { animation: float 4s ease-in-out infinite; }
  .float-2 { animation: float 5s 1s ease-in-out infinite; }
  .float-3 { animation: float 6s 2s ease-in-out infinite; }

  /* ── Gradient Text ── */
  .gold-text {
    background: linear-gradient(135deg, #f59e0b, #eab308, #fcd34d, #d97706);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer 3s linear infinite;
  }

  /* ── Card hover lift ── */
  .card-hover {
    transition: transform 0.35s cubic-bezier(.22,.68,0,1.2), box-shadow 0.35s ease;
  }
  .card-hover:hover {
    transform: translateY(-10px);
    box-shadow: 0 24px 60px rgba(234,179,8,0.15);
  }

  /* ── Button styles ── */
  .btn-gold {
    background: linear-gradient(135deg, #eab308, #d97706);
    color: #000;
    border: none;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-weight: 700;
    transition: all 0.25s ease;
    animation: pulse-glow 2.5s ease-in-out infinite;
  }
  .btn-gold:hover {
    background: linear-gradient(135deg, #fbbf24, #eab308);
    transform: translateY(-2px);
    animation: none;
    box-shadow: 0 8px 30px rgba(234,179,8,0.5);
  }

  .btn-outline {
    background: transparent;
    color: #e2e2e5;
    border: 1px solid rgba(255,255,255,0.15);
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    transition: all 0.25s ease;
  }
  .btn-outline:hover {
    background: rgba(234,179,8,0.1);
    border-color: #eab308;
    color: #eab308;
  }

  /* ── Noise texture overlay ── */
  .noise::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    opacity: 0.35;
  }

  /* ── Marquee strip ── */
  .marquee-wrapper { overflow: hidden; }
  .marquee-track {
    display: flex;
    width: max-content;
    animation: marquee 25s linear infinite;
  }

  /* ── Mobile menu ── */
  .mobile-menu {
    transition: all 0.35s cubic-bezier(.22,.68,0,1.2);
  }

  /* ── Review card ── */
  .review-card {
    background: linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01));
    border: 1px solid rgba(255,255,255,0.08);
    transition: border-color 0.3s ease, transform 0.3s ease;
  }
  .review-card:hover {
    border-color: rgba(234,179,8,0.3);
    transform: translateY(-4px);
  }

  /* ── Section divider ── */
  .section-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(234,179,8,0.4), transparent);
    margin: 0 auto;
    max-width: 600px;
  }
`;

/* ─── DATA ─── */
const BOOKS = [
  {
    id: 1,
    title: "The Mind's Blueprint",
    titleHi: "मन का नक्शा",
    desc: "Master your emotions using ancient psychology and modern neuroscience.",
    descHi: "प्राचीन मनोविज्ञान और आधुनिक विज्ञान से अपनी भावनाओं पर नियंत्रण पाएं।",
    price: 499,
    original: 999,
    color: "#1a1208",
    accent: "#d97706",
    tag: "Bestseller",
    rating: 4.9,
    sales: "2.1k+",
  },
  {
    id: 2,
    title: "Karma & Consciousness",
    titleHi: "कर्म और चेतना",
    desc: "Unlock the hidden laws of the universe that shape your destiny every day.",
    descHi: "ब्रह्मांड के छिपे नियमों को समझें जो आपकी नियति को आकार देते हैं।",
    price: 599,
    original: 1199,
    color: "#0d1a0d",
    accent: "#16a34a",
    tag: "New",
    rating: 4.8,
    sales: "980+",
  },
  {
    id: 3,
    title: "Vedic Life Codes",
    titleHi: "वैदिक जीवन सूत्र",
    desc: "5000-year-old Vedic principles decoded for the modern seeker's daily life.",
    descHi: "5000 साल पुराने वैदिक सिद्धांतों को आधुनिक जीवन के लिए डिकोड किया गया।",
    price: 699,
    original: 1499,
    color: "#150d1a",
    accent: "#9333ea",
    tag: "Premium",
    rating: 5.0,
    sales: "1.4k+",
  },
];

const REVIEWS = [
  { name: "Arjun Mehta", loc: "Mumbai", text: "Vedoxa ne meri soch hi badal di. Books genuinely transformative hain.", rating: 5, avatar: "AM" },
  { name: "Priya Sharma", loc: "Delhi", text: "Authentic content, secure payment, instant delivery. 10/10 experience!", rating: 5, avatar: "PS" },
  { name: "Rahul Verma", loc: "Bangalore", text: "Finally ek platform jo real spiritual knowledge deta hai, bina scam ke.", rating: 5, avatar: "RV" },
  { name: "Sneha Joshi", loc: "Pune", text: "The Mind's Blueprint book ne mujhe anxiety se bahar nikala. Life-changing!", rating: 5, avatar: "SJ" },
  { name: "Vikram Nair", loc: "Chennai", text: "Vedic Life Codes padh ke samjha ki success ka asli matlab kya hai.", rating: 5, avatar: "VN" },
  { name: "Anjali Gupta", loc: "Jaipur", text: "Certified aur original — yahi toh sabse badi baat hai. Highly recommended.", rating: 4, avatar: "AG" },
];

const FEATURES = [
  { icon: ShieldCheck, title: "100% Verified", titleHi: "100% सत्यापित", desc: "Every book personally verified by Vedoxa experts.", descHi: "हर किताब Vedoxa विशेषज्ञों द्वारा प्रमाणित।" },
  { icon: Lock, title: "Secure Payments", titleHi: "सुरक्षित भुगतान", desc: "Bank-grade encryption on every transaction.", descHi: "हर लेनदेन पर बैंक-स्तरीय एन्क्रिप्शन।" },
  { icon: Zap, title: "Instant Access", titleHi: "तुरंत एक्सेस", desc: "Read anywhere, anytime — PDF delivered instantly.", descHi: "PDF तुरंत डिलीवर — कहीं भी, कभी भी पढ़ें।" },
  { icon: Heart, title: "Life-Changing", titleHi: "जीवन बदलने वाली", desc: "Real transformation backed by 10,000+ readers.", descHi: "10,000+ पाठकों द्वारा समर्थित वास्तविक परिवर्तन।" },
];

/* ─── STAR RATING ─── */
function Stars({ count }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={14} fill={i <= count ? "#eab308" : "none"} color={i <= count ? "#eab308" : "#555"} />
      ))}
    </div>
  );
}

/* ─── BOOK COVER ─── */
function BookCover({ book }) {
  return (
    <div style={{
      width: 160, height: 220,
      background: `linear-gradient(145deg, ${book.color}, #0a0a0a)`,
      borderRadius: 10,
      border: `1px solid ${book.accent}33`,
      boxShadow: `0 20px 50px ${book.accent}22, inset 0 1px 0 ${book.accent}44`,
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
      gap: 8,
    }}>
      {/* Spine line */}
      <div style={{ position: "absolute", left: 12, top: 0, bottom: 0, width: 2, background: `${book.accent}55`, borderRadius: 2 }} />
      {/* Decoration circle */}
      <div style={{
        width: 60, height: 60, borderRadius: "50%",
        border: `2px solid ${book.accent}66`,
        display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 4,
      }}>
        <BookOpen size={26} color={book.accent} />
      </div>
      <div style={{ fontFamily: "'Cinzel', serif", fontSize: 11, color: book.accent, textAlign: "center", lineHeight: 1.4, letterSpacing: 1 }}>
        VEDOXA
      </div>
      {/* Verified badge */}
      <div style={{
        position: "absolute", top: 8, right: 8,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
        borderRadius: "50%", padding: 5,
        border: "1px solid rgba(234,179,8,0.4)",
      }}>
        <ShieldCheck size={14} color="#eab308" />
      </div>
      {/* Tag */}
      <div style={{
        position: "absolute", bottom: 10,
        background: `${book.accent}22`, border: `1px solid ${book.accent}55`,
        borderRadius: 4, padding: "2px 8px",
        fontSize: 10, fontWeight: 700, color: book.accent, letterSpacing: 1,
      }}>
        {book.tag}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function VedoxaHome() {
  const [lang, setLang] = useState("EN");
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [addedMap, setAddedMap] = useState({});

  const t = (en, hi) => lang === "EN" ? en : hi;

  function addToCart(bookId) {
    setCartCount(c => c + 1);
    setAddedMap(m => ({ ...m, [bookId]: true }));
    setTimeout(() => setAddedMap(m => ({ ...m, [bookId]: false })), 1800);
  }

  return (
    <>
      <style>{fontStyle}</style>

      <div style={{ minHeight: "100vh", background: "#060608", color: "#e2e2e5", fontFamily: "'DM Sans', sans-serif", overflowX: "hidden" }}>

        {/* ══════════ NAVBAR ══════════ */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          padding: "16px 24px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          background: "rgba(6,6,8,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
        }}>
          {/* Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck color="#eab308" size={30} />
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 900, letterSpacing: 4, color: "#fff" }}>VEDOXA</span>
          </div>

          {/* Desktop Nav Links */}
          <div style={{ display: "flex", gap: 32, alignItems: "center" }} className="desktop-nav">
            {[["#books", t("Books","किताबें")], ["#features", t("Features","विशेषताएं")], ["#about", t("Our Vision","हमारा विज़न")], ["#reviews", t("Reviews","समीक्षाएं")]].map(([href, label]) => (
              <a key={href} href={href} style={{ color: "#aaa", textDecoration: "none", fontWeight: 500, fontSize: 15, transition: "color 0.2s" }}
                onMouseEnter={e => e.target.style.color = "#eab308"}
                onMouseLeave={e => e.target.style.color = "#aaa"}>
                {label}
              </a>
            ))}
          </div>

          {/* Right Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {/* Language toggle */}
            <button
              onClick={() => setLang(l => l === "EN" ? "HI" : "EN")}
              className="btn-outline"
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", borderRadius: 99, fontSize: 13 }}>
              <Globe size={14} /> {lang}
            </button>

            {/* Cart badge */}
            <div style={{ position: "relative" }}>
              <button className="btn-outline" style={{ padding: "8px 12px", borderRadius: 10, display: "flex", alignItems: "center" }}>
                <ShoppingCart size={18} />
              </button>
              {cartCount > 0 && (
                <div style={{
                  position: "absolute", top: -6, right: -6,
                  background: "#eab308", color: "#000",
                  borderRadius: "50%", width: 18, height: 18,
                  fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {cartCount}
                </div>
              )}
            </div>

            <button className="btn-gold" style={{ padding: "8px 20px", borderRadius: 8, fontSize: 14 }}>
              {t("Login","लॉगिन")}
            </button>

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(o => !o)} className="btn-outline"
              style={{ padding: "8px 10px", borderRadius: 8, display: "none" }}
              id="hamburger">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{
            position: "fixed", top: 69, left: 0, right: 0, zIndex: 99,
            background: "rgba(6,6,8,0.97)", borderBottom: "1px solid rgba(255,255,255,0.08)",
            padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16,
          }} className="mobile-menu anim-scale-in">
            {[["#books", t("Books","किताबें")], ["#features", t("Features","विशेषताएं")], ["#about", t("Our Vision","हमारा विज़न")], ["#reviews", t("Reviews","समीक्षाएं")]].map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}
                style={{ color: "#e2e2e5", textDecoration: "none", fontWeight: 600, fontSize: 18, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                {label}
              </a>
            ))}
          </div>
        )}

        {/* ══════════ HERO ══════════ */}
        <section style={{
          position: "relative", minHeight: "100vh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: "120px 24px 80px",
          overflow: "hidden",
        }} className="noise">
          {/* Glows */}
          <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 700, height: 700, background: "radial-gradient(circle, rgba(234,179,8,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ position: "absolute", top: "60%", left: "20%", width: 300, height: 300, background: "radial-gradient(circle, rgba(234,179,8,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />

          {/* Floating book covers */}
          <div style={{ position: "absolute", left: "5%", top: "30%", opacity: 0.35 }} className="float">
            <BookCover book={BOOKS[0]} />
          </div>
          <div style={{ position: "absolute", right: "5%", top: "25%", opacity: 0.35 }} className="float-2">
            <BookCover book={BOOKS[2]} />
          </div>

          {/* Badge */}
          <div className="anim-fade-up" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.3)",
            padding: "6px 16px", borderRadius: 99, marginBottom: 28,
            fontSize: 13, fontWeight: 600, color: "#eab308",
          }}>
            <ShieldCheck size={14} /> {t("India's Most Trusted Spiritual Book Platform", "भारत का सबसे विश्वसनीय आध्यात्मिक पुस्तक मंच")}
          </div>

          <h1 className="anim-fade-up-2" style={{
            fontFamily: "'Cinzel', serif",
            fontSize: "clamp(36px, 7vw, 80px)",
            fontWeight: 900, lineHeight: 1.15,
            marginBottom: 24, maxWidth: 800,
            color: "#fff", position: "relative", zIndex: 2,
          }}>
            {t("Awaken Your", "जागाएं अपनी")}{" "}
            <span className="gold-text">{t("Consciousness", "चेतना")}</span>
          </h1>

          <p className="anim-fade-up-3" style={{ fontSize: "clamp(15px, 2vw, 19px)", color: "#888", maxWidth: 600, lineHeight: 1.7, marginBottom: 40, position: "relative", zIndex: 2 }}>
            {t(
              "100% original, Vedoxa-verified digital books on spirituality, psychology & life wisdom. Profound knowledge you won't find anywhere else.",
              "आध्यात्मिकता, मनोविज्ञान और जीवन ज्ञान पर 100% मूल, Vedoxa-सत्यापित डिजिटल किताबें। गहरा ज्ञान जो आपको कहीं और नहीं मिलेगा।"
            )}
          </p>

          <div className="anim-fade-up-4" style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", position: "relative", zIndex: 2 }}>
            <a href="#books" style={{ textDecoration: "none" }}>
              <button className="btn-gold" style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 32px", borderRadius: 99, fontSize: 16 }}>
                <Search size={20} /> {t("Explore Books", "किताबें देखें")}
              </button>
            </a>
            <a href="#about" style={{ textDecoration: "none" }}>
              <button className="btn-outline" style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 28px", borderRadius: 99, fontSize: 16 }}>
                {t("Our Vision", "हमारा विज़न")} <ChevronDown size={18} />
              </button>
            </a>
          </div>

          {/* Stats row */}
          <div className="anim-fade-in" style={{ display: "flex", gap: 48, marginTop: 72, flexWrap: "wrap", justifyContent: "center", position: "relative", zIndex: 2 }}>
            {[["10,000+", t("Happy Readers","खुश पाठक")], ["50+", t("Verified Books","सत्यापित पुस्तकें")], ["100%", t("Secure & Original","सुरक्षित और मूल")]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 28, fontWeight: 900, color: "#eab308" }}>{num}</div>
                <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ MARQUEE STRIP ══════════ */}
        <div style={{ background: "#eab308", padding: "12px 0", overflow: "hidden" }} className="marquee-wrapper">
          <div className="marquee-track">
            {Array(2).fill([
              "⚡ Instant PDF Delivery","🔒 100% Secure Payment","📖 Vedoxa Verified","✨ Ancient Wisdom","🧠 Deep Psychology","🌿 Vedic Principles","⭐ 10,000+ Readers","🛡️ Money-Back Guarantee"
            ]).flat().map((item, i) => (
              <span key={i} style={{ color: "#000", fontWeight: 700, fontSize: 14, padding: "0 32px", whiteSpace: "nowrap", letterSpacing: 1 }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ══════════ BOOKS SECTION ══════════ */}
        <section id="books" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "#eab308", fontWeight: 600, letterSpacing: 3, fontSize: 13, marginBottom: 12, textTransform: "uppercase" }}>
              {t("Our Collection", "हमारा संग्रह")}
            </p>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 700, marginBottom: 16 }}>
              {t("Top Rated", "सर्वश्रेष्ठ")} <span className="gold-text">{t("Wisdom", "ज्ञान")}</span>
            </h2>
            <p style={{ color: "#666", fontSize: 16 }}>{t("Exclusively curated. Forever verified.", "विशेष रूप से चुनी गई। हमेशा सत्यापित।")}</p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 28 }}>
            {BOOKS.map((book) => (
              <div key={book.id} className="card-hover" style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 20, padding: 28,
                display: "flex", flexDirection: "column", alignItems: "center",
                position: "relative", overflow: "hidden",
              }}>
                {/* Subtle corner glow */}
                <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle at top right, ${book.accent}18, transparent 70%)`, pointerEvents: "none" }} />

                <div style={{ marginBottom: 20 }} className="float">
                  <BookCover book={book} />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Stars count={Math.round(book.rating)} />
                  <span style={{ fontSize: 13, color: "#666" }}>{book.rating} ({book.sales} {t("sold","बिके")})</span>
                </div>

                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, marginBottom: 8, textAlign: "center" }}>
                  {t(book.title, book.titleHi)}
                </h3>
                <p style={{ fontSize: 14, color: "#777", textAlign: "center", lineHeight: 1.6, marginBottom: 20 }}>
                  {t(book.desc, book.descHi)}
                </p>

                <div style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                  <div>
                    <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>₹{book.price}</span>{" "}
                    <span style={{ fontSize: 14, color: "#555", textDecoration: "line-through" }}>₹{book.original}</span>
                  </div>
                  <button
                    onClick={() => addToCart(book.id)}
                    className={addedMap[book.id] ? "btn-gold" : "btn-outline"}
                    style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", borderRadius: 10, fontSize: 14 }}>
                    <ShoppingCart size={16} />
                    {addedMap[book.id] ? t("Added ✓", "जोड़ा ✓") : t("Buy Now", "अभी खरीदें")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="section-divider" />

        {/* ══════════ FEATURES ══════════ */}
        <section id="features" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700, marginBottom: 12 }}>
              {t("Why", "क्यों चुनें")} <span className="gold-text">Vedoxa?</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24 }}>
            {FEATURES.map(({ icon: Icon, title, titleHi, desc, descHi }, i) => (
              <div key={i} className="card-hover review-card" style={{ padding: 32, borderRadius: 16, textAlign: "center" }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  margin: "0 auto 20px",
                }}>
                  <Icon size={24} color="#eab308" />
                </div>
                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 17, fontWeight: 700, marginBottom: 10 }}>
                  {t(title, titleHi)}
                </h3>
                <p style={{ fontSize: 14, color: "#666", lineHeight: 1.6 }}>{t(desc, descHi)}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="section-divider" />

        {/* ══════════ ABOUT / VISION ══════════ */}
        <section id="about" style={{ padding: "100px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
            {/* Left: Visual */}
            <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
              <div style={{
                width: 280, height: 360,
                background: "radial-gradient(ellipse at center, rgba(234,179,8,0.15), transparent 70%)",
                border: "1px solid rgba(234,179,8,0.2)",
                borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }} className="float">
                <ShieldCheck size={80} color="#eab308" strokeWidth={1.5} />
                <div style={{ position: "absolute", inset: -2, borderRadius: 22, border: "1px solid rgba(234,179,8,0.08)" }} />
                <div style={{ position: "absolute", inset: -12, borderRadius: 28, border: "1px solid rgba(234,179,8,0.04)" }} />
              </div>
            </div>

            {/* Right: Text */}
            <div>
              <p style={{ color: "#eab308", fontWeight: 600, letterSpacing: 3, fontSize: 13, marginBottom: 16, textTransform: "uppercase" }}>
                {t("Our Vision", "हमारा विज़न")}
              </p>
              <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(26px, 4vw, 42px)", fontWeight: 700, marginBottom: 20, lineHeight: 1.3 }}>
                {t("Knowledge Should Be", "ज्ञान होना चाहिए")}{" "}
                <span className="gold-text">{t("Authentic", "प्रामाणिक")}</span>
              </h2>
              <p style={{ color: "#777", fontSize: 16, lineHeight: 1.8, marginBottom: 16 }}>
                {t(
                  "In a world full of misinformation, Vedoxa was born with a single purpose — to make genuine spiritual and psychological wisdom accessible to every Indian seeker.",
                  "गलत सूचनाओं से भरी दुनिया में, Vedoxa एक ही उद्देश्य के साथ बना — हर भारतीय साधक को वास्तविक आध्यात्मिक और मनोवैज्ञानिक ज्ञान उपलब्ध कराना।"
                )}
              </p>
              <p style={{ color: "#555", fontSize: 15, lineHeight: 1.8 }}>
                {t(
                  "Every book on our platform is personally reviewed, verified for authenticity, and delivered with complete security — so you can focus on transformation, not transactions.",
                  "हमारे मंच की हर किताब व्यक्तिगत रूप से समीक्षित, प्रामाणिकता के लिए सत्यापित, और पूर्ण सुरक्षा के साथ वितरित की जाती है — ताकि आप लेनदेन नहीं, परिवर्तन पर ध्यान दे सकें।"
                )}
              </p>
            </div>
          </div>
        </section>

        <div className="section-divider" />

        {/* ══════════ REVIEWS ══════════ */}
        <section id="reviews" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "#eab308", fontWeight: 600, letterSpacing: 3, fontSize: 13, marginBottom: 12, textTransform: "uppercase" }}>
              {t("Social Proof", "सामाजिक प्रमाण")}
            </p>
            <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(26px, 4vw, 44px)", fontWeight: 700 }}>
              {t("Verified", "सत्यापित")} <span className="gold-text">{t("Reviews", "समीक्षाएं")}</span>
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20 }}>
            {REVIEWS.map((r, i) => (
              <div key={i} className="review-card" style={{ padding: 24, borderRadius: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: "linear-gradient(135deg, #eab308, #d97706)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: 14, color: "#000",
                  }}>{r.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{r.name}</div>
                    <div style={{ fontSize: 12, color: "#555" }}>{r.loc}</div>
                  </div>
                  <div style={{ marginLeft: "auto" }}><Stars count={r.rating} /></div>
                </div>
                <p style={{ fontSize: 14, color: "#888", lineHeight: 1.7, fontStyle: "italic" }}>"{r.text}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════ CTA BANNER ══════════ */}
        <section style={{ padding: "80px 24px", textAlign: "center", background: "linear-gradient(135deg, rgba(234,179,8,0.06), rgba(234,179,8,0.02))", borderTop: "1px solid rgba(234,179,8,0.1)", borderBottom: "1px solid rgba(234,179,8,0.1)" }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(24px, 4vw, 44px)", fontWeight: 700, marginBottom: 16 }}>
            {t("Begin Your Journey", "अपनी यात्रा शुरू करें")} <span className="gold-text">{t("Today", "आज")}</span>
          </h2>
          <p style={{ color: "#666", fontSize: 16, marginBottom: 36 }}>
            {t("Join 10,000+ seekers who transformed their lives with Vedoxa.", "10,000+ साधकों से जुड़ें जिन्होंने Vedoxa से अपना जीवन बदला।")}
          </p>
          <a href="#books" style={{ textDecoration: "none" }}>
            <button className="btn-gold" style={{ padding: "16px 48px", borderRadius: 99, fontSize: 17, display: "inline-flex", alignItems: "center", gap: 10 }}>
              <BookOpen size={22} /> {t("Shop All Books", "सभी किताबें देखें")}
            </button>
          </a>
        </section>

        {/* ══════════ FOOTER ══════════ */}
        <footer style={{ padding: "48px 24px 32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 32, marginBottom: 40 }}>
            {/* Brand */}
            <div style={{ maxWidth: 260 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <ShieldCheck color="#eab308" size={24} />
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 18, fontWeight: 900, letterSpacing: 3 }}>VEDOXA</span>
              </div>
              <p style={{ fontSize: 14, color: "#555", lineHeight: 1.7 }}>
                {t("Authentic wisdom. Verified books. Transformative reading.", "प्रामाणिक ज्ञान। सत्यापित किताबें। जीवन बदलने वाला पठन।")}
              </p>
            </div>

            {/* Links */}
            {[
              [t("Platform","प्लेटफॉर्म"), ["#books","#features","#about","#reviews"], [t("Books","किताबें"), t("Features","विशेषताएं"), t("Vision","विज़न"), t("Reviews","समीक्षाएं")]],
              [t("Legal","कानूनी"), ["#","#","#"], [t("Privacy Policy","गोपनीयता नीति"), t("Terms of Service","सेवा की शर्तें"), t("Refund Policy","वापसी नीति")]],
            ].map(([heading, hrefs, labels]) => (
              <div key={heading}>
                <div style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 700, color: "#eab308", letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>{heading}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {labels.map((label, i) => (
                    <a key={i} href={hrefs[i]} style={{ color: "#555", textDecoration: "none", fontSize: 14, transition: "color 0.2s" }}
                      onMouseEnter={e => e.target.style.color = "#eab308"}
                      onMouseLeave={e => e.target.style.color = "#555"}>
                      {label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 24, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <span style={{ fontSize: 13, color: "#3a3a3a" }}>© 2025 Vedoxa. {t("All rights reserved.", "सर्वाधिकार सुरक्षित।")}</span>
            <span style={{ fontSize: 13, color: "#3a3a3a" }}>
              {t("Made with", "बनाया गया")} <span style={{ color: "#eab308" }}>♥</span> {t("for seekers of truth.", "सत्य के साधकों के लिए।")}
            </span>
          </div>
        </footer>

      </div>

      {/* ── Responsive CSS fix ── */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          #hamburger { display: flex !important; }
          section > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="position: absolute; left: 5%"],
          div[style*="position: absolute; right: 5%"] {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
