// @ts-nocheck
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, Globe, BookOpen, Lock, X, Star, Zap, 
  ChevronRight, AlertCircle, RefreshCw, CheckCircle2, Tag,
  LogOut, UserCircle, Coins
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

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

// Translations
const dict = {
  EN: { brand: "VEDOXA", login: "Login / Sign Up", heroTitle: "Awaken Your Consciousness", heroSub: "100% original, verified digital books on spirituality & psychology.", secure: "256-bit Secure", instant: "Instant PDF Auto-Download", premiumLib: "Premium Library", buyNow: "Buy Now", readNow: "Read Now", checkout: "Complete Purchase", haveCoupon: "Have a Coupon Code?", apply: "Apply", pay: "Secure Pay", rewardPoints: "Reward Points", redeemPoints: "Redeem Points", rewardEarn: "You will earn", pdfReader: "Web Reader", close: "Close" },
  HI: { brand: "वेडोक्सा", login: "लॉगिन / साइन अप", heroTitle: "अपनी चेतना को जागृत करें", heroSub: "आध्यात्मिकता और मनोविज्ञान पर 100% मूल, सत्यापित डिजिटल पुस्तकें।", secure: "256-बिट सुरक्षित", instant: "त्वरित पीडीएफ डाउनलोड", premiumLib: "प्रीमियम पुस्तकालय", buyNow: "अभी खरीदें", readNow: "अभी पढ़ें", checkout: "खरीदारी पूरी करें", haveCoupon: "क्या आपके पास कूपन है?", apply: "लागू करें", pay: "सुरक्षित भुगतान", rewardPoints: "इनाम अंक", redeemPoints: "अंक भुनाएं", rewardEarn: "आपको मिलेंगे", pdfReader: "वेब रीडर", close: "बंद करें" }
};

export default function VedoxaHome() {
  const [lang, setLang] = useState("EN");
  const t = dict[lang];

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [toasts, setToasts] = useState([]);

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [purchasedBookIds, setPurchasedBookIds] = useState([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authForm, setAuthForm] = useState({ email: "", password: "", mode: "login" });

  const [showReader, setShowReader] = useState(false);
  const [readerUrl, setReaderUrl] = useState("");

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: "", email: "", phone: "", coupon: "" });
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [useRewards, setUseRewards] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  NProgress.configure({ showSpinner: false, speed: 400 });

  useEffect(() => {
    fetchBooks();
    supabase.auth.getSession().then(({ data: { session } }) => { if (session?.user) handleUserLogin(session.user); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) handleUserLogin(session.user);
      else { setUser(null); setProfile(null); setPurchasedBookIds([]); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleUserLogin = async (loggedUser) => {
    setUser(loggedUser);
    setCheckoutData(prev => ({ ...prev, email: loggedUser.email }));
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', loggedUser.id).single();
    if (prof) setProfile(prof);
    const { data: orders } = await supabase.from('orders').select('book_id').eq('customer_id', loggedUser.id);
    if (orders) setPurchasedBookIds(orders.map(o => o.book_id));
  };

  const fetchBooks = useCallback(async () => {
    NProgress.start(); setLoading(true);
    const { data } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    if (data) setBooks(data);
    setLoading(false); NProgress.done();
  }, []);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault(); NProgress.start();
    let res = authForm.mode === "signup" 
      ? await supabase.auth.signUp({ email: authForm.email, password: authForm.password })
      : await supabase.auth.signInWithPassword({ email: authForm.email, password: authForm.password });
    
    if (!res.error) { addToast(`Successfully ${authForm.mode === "signup" ? "signed up" : "logged in"}!`, "success"); setShowAuthModal(false); }
    else addToast(res.error.message, "error");
    NProgress.done();
  };

  const handleLogout = async () => { await supabase.auth.signOut(); addToast("Logged out securely", "info"); };

  const verifyCoupon = async () => {
    if (!checkoutData.coupon) return;
    const { data } = await supabase.from('coupons').select('*').eq('code', checkoutData.coupon.toUpperCase()).single();
    if (data && new Date(data.expiry) > new Date() && data.used < data.limit_count) {
      setAppliedCoupon(data); addToast("Coupon applied! 🎉", "success");
    } else { setAppliedCoupon(null); addToast("Invalid or expired coupon", "error"); }
  };

  let clientFinalPrice = appliedCoupon ? Math.round(selectedBook?.final_price - (selectedBook?.final_price * appliedCoupon.discount / 100)) : selectedBook?.final_price;
  if (useRewards && profile?.reward_points > 0) clientFinalPrice = Math.max(0, clientFinalPrice - profile.reward_points);
  const earnedPoints = selectedBook ? Math.floor(selectedBook.final_price * 0.019) : 0;

  // HACK-PROOF SECURE PAYMENT LOGIC
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) { addToast("Please login to purchase", "error"); setShowCheckout(false); setShowAuthModal(true); return; }
    if (!checkoutData.name || !checkoutData.phone) { addToast("Fill all details", "error"); return; }

    setIsProcessing(true); NProgress.start();
    const loaded = await loadRazorpayScript();
    if (!loaded) { addToast("Payment gateway failed.", "error"); setIsProcessing(false); NProgress.done(); return; }

    try {
      // Step 1: Ask Backend to create secure order ID and calculate real price
      const orderRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_order', bookId: selectedBook.id, couponCode: appliedCoupon?.code, useRewards, userId: user.id })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error("Order creation failed");

      // Step 2: Open Razorpay Popup
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount * 100,
        currency: "INR",
        name: "VEDOXA",
        description: selectedBook.title,
        order_id: orderData.rzpOrderId, // Secure ID from Backend
        prefill: { name: checkoutData.name, email: user.email, contact: checkoutData.phone },
        theme: { color: "#eab308" },
        handler: async function (response) {
          addToast("Verifying payment security...", "info");
          
          // Step 3: Verify Payment securely on Backend
          const verifyRes = await fetch('/api/payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'verify',
              rzpOrderId: response.razorpay_order_id,
              rzpPaymentId: response.razorpay_payment_id,
              rzpSignature: response.razorpay_signature,
              orderData: {
                customer_id: user.id, customer_name: checkoutData.name, customer_email: user.email,
                book_id: selectedBook.id, book_title: selectedBook.title,
                base_price: selectedBook.base_price, final_price: orderData.amount,
                coupon_used: appliedCoupon?.code || null, points_used: useRewards ? profile.reward_points : 0,
                payment_method: 'razorpay'
              }
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            addToast("Payment Verified! Unlocking book...", "success");
            setPurchasedBookIds(prev => [...prev, selectedBook.id]);
            openWebReader(selectedBook);
            setShowCheckout(false);
          } else {
            addToast("Security verification failed!", "error");
          }
        }
      };
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", () => addToast("Payment failed.", "error"));
      rzp.open();
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setIsProcessing(false); NProgress.done();
    }
  };

  const openWebReader = async (book) => {
    NProgress.start();
    const { data: pdfData } = await supabase.storage.from('books-pdfs').createSignedUrl(book.pdf_path, 3600);
    if (pdfData?.signedUrl) { setReaderUrl(pdfData.signedUrl); setShowReader(true); } 
    else addToast("Failed to load secure reader", "error");
    NProgress.done();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060a; color: #e2e2e5; font-family: 'DM Sans', sans-serif; overflow-x: hidden; scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-track { background: #06060a; } ::-webkit-scrollbar-thumb { background: rgba(234,179,8,0.3); border-radius: 10px; }
        .gold-text { background: linear-gradient(135deg, #f59e0b 0%, #eab308 40%, #fcd34d 70%, #d97706 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .btn-gold { background: linear-gradient(135deg, #eab308, #d97706); color: #000; border: none; cursor: pointer; font-weight: 700; transition: all 0.25s ease; position: relative; overflow: hidden; }
        .btn-gold:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(234,179,8,0.45); }
        .glass-panel { background: rgba(255,255,255,0.018); border: 1px solid rgba(255,255,255,0.07); backdrop-filter: blur(12px); }
        #nprogress .bar { background: #eab308 !important; height: 3px !important; }
        #nprogress .peg { box-shadow: 0 0 10px #eab308, 0 0 5px #eab308 !important; }
        .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 8px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
      `}</style>

      {/* Floating Toasts */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 9999, display: "flex", flexDirection: "column", gap: 10 }}>
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div key={toast.id} initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              style={{ padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, background: toast.type === "success" ? "rgba(16,185,129,0.15)" : toast.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.12)", border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : toast.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(234,179,8,0.3)"}`, color: toast.type === "success" ? "#34d399" : toast.type === "error" ? "#f87171" : "#fcd34d", backdropFilter: "blur(12px)" }}>
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="glass-panel" style={{ borderRadius: 24, padding: 36, maxWidth: 400, width: "100%", position: "relative", background: "#0a0a0d" }}>
              <button onClick={() => setShowAuthModal(false)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#888", cursor: "pointer" }}><X size={16} style={{margin:"0 auto"}}/></button>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 24, textAlign: "center" }}>{authForm.mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
              
              <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input required type="email" placeholder="Email" value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: "none" }} />
                <input required type="password" placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: "none" }} />
                <button type="submit" className="btn-gold" style={{ padding: "14px", borderRadius: 12, fontSize: 16 }}>{authForm.mode === 'login' ? 'Login' : 'Sign Up'}</button>
              </form>
              
              <div style={{ margin: "20px 0", textAlign: "center", color: "#666", fontSize: 12 }}>OR</div>
              <button onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })} style={{ width: "100%", padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
                <Globe size={18} /> Continue with Google
              </button>
              
              <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#888" }}>
                {authForm.mode === 'login' ? "Don't have an account? " : "Already have an account? "}
                <span onClick={() => setAuthForm({...authForm, mode: authForm.mode === 'login' ? 'signup' : 'login'})} style={{ color: "#eab308", cursor: "pointer" }}>{authForm.mode === 'login' ? 'Sign Up' : 'Login'}</span>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <AnimatePresence>
        {showCheckout && selectedBook && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
            <motion.div initial={{ scale: 0.95, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 30 }} style={{ background: "#0d0d10", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 24, padding: 36, maxWidth: 450, width: "100%", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.8)" }}>
              <button onClick={() => setShowCheckout(false)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#888", cursor: "pointer" }}><X size={16} style={{margin:"0 auto"}}/></button>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>{t.checkout}</h2>
              <p style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>{t.brand}: <span style={{color:"#eab308"}}>{selectedBook.title}</span></p>

              <form onSubmit={handlePayment} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <input required placeholder="Full Name" value={checkoutData.name} onChange={(e) => setCheckoutData({...checkoutData, name: e.target.value})} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: "none" }} />
                <input required type="tel" placeholder="Phone Number" value={checkoutData.phone} onChange={(e) => setCheckoutData({...checkoutData, phone: e.target.value})} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: "none" }} />
                
                <div style={{ display: "flex", gap: 8 }}>
                  <input placeholder={t.haveCoupon} value={checkoutData.coupon} onChange={(e) => setCheckoutData({...checkoutData, coupon: e.target.value})} style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: "rgba(234,179,8,0.05)", border: "1px dashed rgba(234,179,8,0.3)", color: "#eab308", outline: "none" }} />
                  <button type="button" onClick={verifyCoupon} style={{ padding: "0 16px", borderRadius: 12, background: "rgba(234,179,8,0.15)", color: "#eab308", border: "none", cursor: "pointer", fontWeight: "bold" }}>{t.apply}</button>
                </div>

                {profile?.reward_points > 0 && (
                  <label style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(16,185,129,0.05)", padding: "12px", borderRadius: 12, border: "1px solid rgba(16,185,129,0.2)", cursor: "pointer" }}>
                    <input type="checkbox" checked={useRewards} onChange={(e) => setUseRewards(e.target.checked)} style={{ accentColor: "#10b981", width: 18, height: 18 }} />
                    <span style={{ color: "#34d399", fontSize: 14, fontWeight: 500 }}>{t.redeemPoints} ({profile.reward_points} pts)</span>
                  </label>
                )}

                <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12, marginTop: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: 14, marginBottom: 8 }}><span>Price:</span> <span>₹{selectedBook.final_price}</span></div>
                  {appliedCoupon && <div style={{ display: "flex", justifyContent: "space-between", color: "#10b981", fontSize: 14, marginBottom: 8 }}><span>Coupon Discount:</span> <span>- ₹{selectedBook.final_price - (selectedBook.final_price - (selectedBook.final_price * appliedCoupon.discount / 100))}</span></div>}
                  {useRewards && profile?.reward_points > 0 && <div style={{ display: "flex", justifyContent: "space-between", color: "#34d399", fontSize: 14, marginBottom: 8 }}><span>Points Applied:</span> <span>- ₹{profile.reward_points}</span></div>}
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#fff", fontSize: 18, fontWeight: 800, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8 }}><span>Total to Pay:</span> <span>₹{clientFinalPrice}</span></div>
                  <div style={{ textAlign: "right", fontSize: 12, color: "#eab308", marginTop: 6 }}>{t.rewardEarn}: {earnedPoints} pts</div>
                </div>

                <button type="submit" disabled={isProcessing} className="btn-gold" style={{ width: "100%", padding: "16px", borderRadius: 12, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, fontSize: 16 }}>
                  {isProcessing ? <RefreshCw className="spinner" size={18} /> : <Lock size={18} />}
                  {isProcessing ? "Processing..." : `${t.pay} ₹${clientFinalPrice}`}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Web Reader Modal */}
      <AnimatePresence>
        {showReader && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: "fixed", inset: 0, zIndex: 3000, background: "#06060a", display: "flex", flexDirection: "column" }}>
             <div style={{ padding: "16px 24px", background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}><BookOpen color="#eab308" /> <span style={{ fontWeight: "bold", color: "#fff" }}>{t.pdfReader}</span></div>
                <button onClick={() => setShowReader(false)} style={{ background: "rgba(239,68,68,0.1)", color: "#f87171", border: "none", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: "bold" }}>{t.close}</button>
             </div>
             <iframe src={readerUrl} style={{ flex: 1, width: "100%", border: "none", background: "#fff" }} title="Web Reader" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <nav style={{ padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(6,6,10,0.80)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 500, backdropFilter: "blur(24px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck color="#eab308" size={28} />
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 900, letterSpacing: 5, color: "#fff" }}>{t.brand}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <button onClick={() => setLang(lang === "EN" ? "HI" : "EN")} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontSize: 12, fontWeight: "bold" }}>
              {lang === "EN" ? "हिन्दी" : "English"}
            </button>
            
            {user ? (
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#eab308", background: "rgba(234,179,8,0.1)", padding: "6px 12px", borderRadius: 20, fontSize: 14, fontWeight: "bold" }}>
                  <Coins size={16} /> {profile?.reward_points || 0}
                </div>
                <button onClick={handleLogout} style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer" }}><LogOut size={20} /></button>
              </div>
            ) : (
              <button onClick={() => setShowAuthModal(true)} className="btn-gold" style={{ padding: "8px 16px", borderRadius: 20, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                <UserCircle size={18} /> {t.login}
              </button>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <section style={{ textAlign: "center", padding: "90px 24px 60px", position: "relative" }}>
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }} style={{ position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)", width: 700, height: 700, background: "radial-gradient(circle, rgba(234,179,8,0.06) 0%, transparent 70%)", pointerEvents: "none" }} />
          <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(34px, 7vw, 68px)", fontWeight: 900, lineHeight: 1.15, marginBottom: 22 }}>
            {lang === "EN" ? <>{t.heroTitle.split(" ")[0]} <span className="gold-text">{t.heroTitle.split(" ")[1]}</span> {t.heroTitle.split(" ")[2]}</> : <><span className="gold-text">अपनी चेतना</span> को जागृत करें</>}
          </motion.h1>
          <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.1 }} style={{ color: "#777", maxWidth: 580, margin: "0 auto 44px", fontSize: 16, lineHeight: 1.75 }}>{t.heroSub}</motion.p>
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#666", fontSize: 13, fontWeight: 500 }}><ShieldCheck size={18} color="#eab308"/> {t.secure}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#666", fontSize: 13, fontWeight: 500 }}><Zap size={18} color="#eab308"/> {t.instant}</div>
          </motion.div>
        </section>

        {/* Dynamic Book Library */}
        <section style={{ padding: "20px 24px 100px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 30, fontWeight: 700, marginBottom: 40, textAlign: "center" }}>{t.premiumLib.split(" ")[0]} <span className="gold-text">{t.premiumLib.split(" ")[1]}</span></h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
            {loading ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="glass-panel" style={{ height: 380, borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
                  <div className="skeleton" style={{ width: "100%", height: 180, borderRadius: 12 }} />
                  <div className="skeleton" style={{ width: "80%", height: 24 }} />
                  <div className="skeleton" style={{ width: "40%", height: 16 }} />
                  <div className="skeleton" style={{ width: "100%", height: 45, marginTop: "auto" }} />
                </div>
              ))
            ) : (
              books.map((book, i) => {
                const isPurchased = purchasedBookIds.includes(book.id);
                return (
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={book.id} className="glass-panel" style={{ borderRadius: 20, padding: 28, position: "relative", display: "flex", flexDirection: "column", transition: "transform 0.3s ease", cursor: "pointer" }} whileHover={{ y: -8, boxShadow: "0 24px 60px rgba(234,179,8,0.12)", borderColor: "rgba(234,179,8,0.25)" }}>
                    {book.discount > 0 && !isPurchased && <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(234,179,8,0.1)", color: "#eab308", padding: "4px 12px", borderRadius: 8, fontSize: 12, fontWeight: 800, border: "1px solid rgba(234,179,8,0.2)" }}>{book.discount}% OFF</div>}
                    <div style={{ width: "100%", height: 180, background: "linear-gradient(to bottom right, rgba(234,179,8,0.05), rgba(255,255,255,0.01))", borderRadius: 12, border: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, overflow: "hidden", position: "relative" }}>
                       <BookOpen size={60} color="rgba(234,179,8,0.5)" />
                    </div>
                    <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 800, marginBottom: 8, color: "#fff" }}>{book.title}</h3>
                    <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>by {book.author}</p>
                    <div style={{ marginTop: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 20 }}>
                      <div>
                        {book.discount > 0 && !isPurchased && <div style={{ fontSize: 12, color: "#555", textDecoration: "line-through" }}>₹{book.base_price}</div>}
                        <div style={{ fontSize: 26, fontWeight: 900, color: isPurchased ? "#10b981" : "#fff" }}>{isPurchased ? 'Owned' : `₹${book.final_price}`}</div>
                      </div>
                      {isPurchased ? (
                        <button onClick={() => openWebReader(book)} style={{ padding: "12px 20px", borderRadius: 12, fontSize: 14, background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: "bold" }}>
                          <CheckCircle2 size={16} /> {t.readNow}
                        </button>
                      ) : (
                        <button onClick={() => { setSelectedBook(book); setShowCheckout(true); }} className="btn-gold" style={{ padding: "12px 20px", borderRadius: 12, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                          {t.buyNow} <ChevronRight size={16} />
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </>
  );
}
