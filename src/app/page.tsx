// @ts-nocheck
"use client";
import { useState, useEffect, useCallback } from "react";
import {
  ShieldCheck, Globe, BookOpen, Lock, X, Star, Zap, 
  ChevronRight, AlertCircle, RefreshCw, CheckCircle2, Tag
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ────────────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy";
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── Razorpay Script Loader ───────────────────────────────────────────────────
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VedoxaHome() {
  const [lang, setLang] = useState("EN");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Checkout State
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutData, setCheckoutData] = useState({ name: "", email: "", phone: "", coupon: "" });
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("books").select("*").order("created_at", { ascending: false });
    if (data) setBooks(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

  // Coupon Verification
  const verifyCoupon = async () => {
    if (!checkoutData.coupon) return;
    const { data } = await supabase.from('coupons').select('*').eq('code', checkoutData.coupon.toUpperCase()).single();
    if (data && new Date(data.expiry) > new Date() && data.used < data.limit_count) {
      setAppliedCoupon(data);
      addToast("Coupon applied! 🎉", "success");
    } else {
      setAppliedCoupon(null);
      addToast("Invalid or expired coupon", "error");
    }
  };

  const finalPayablePrice = appliedCoupon 
    ? Math.round(selectedBook?.final_price - (selectedBook?.final_price * appliedCoupon.discount / 100))
    : selectedBook?.final_price;

  // Razorpay Payment & Order Saving
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!checkoutData.name || !checkoutData.email || !checkoutData.phone) {
      addToast("Please fill all details", "error");
      return;
    }

    setIsProcessing(true);
    const loaded = await loadRazorpayScript();
    if (!loaded) {
      addToast("Failed to load payment gateway.", "error");
      setIsProcessing(false);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_dummy", 
      amount: finalPayablePrice * 100,
      currency: "INR",
      name: "VEDOXA",
      description: selectedBook.title,
      prefill: { name: checkoutData.name, email: checkoutData.email, contact: checkoutData.phone },
      theme: { color: "#eab308" },
      handler: async function (response) {
        addToast("Payment Successful! Processing your PDF...", "success");
        
        try {
          // 1. Save Customer
          let customerId;
          const { data: existingCust } = await supabase.from('customers').select('id').eq('email', checkoutData.email).single();
          if (existingCust) {
            customerId = existingCust.id;
          } else {
            const { data: newCust } = await supabase.from('customers').insert([{ name: checkoutData.name, email: checkoutData.email, phone: checkoutData.phone }]).select().single();
            customerId = newCust?.id;
          }

          // 2. Save Order
          await supabase.from('orders').insert([{
            customer_id: customerId,
            customer_name: checkoutData.name,
            customer_email: checkoutData.email,
            book_id: selectedBook.id,
            book_title: selectedBook.title,
            base_price: selectedBook.base_price,
            discount_amount: selectedBook.final_price - finalPayablePrice,
            coupon_used: appliedCoupon ? appliedCoupon.code : null,
            final_price: finalPayablePrice,
            payment_status: 'completed',
            payment_method: 'razorpay'
          }]);

          // 3. Update Coupon Usage
          if (appliedCoupon) {
            await supabase.from('coupons').update({ used: appliedCoupon.used + 1 }).eq('id', appliedCoupon.id);
          }

          // 4. Download PDF Securely
          const { data: pdfData } = await supabase.storage.from('books-pdfs').createSignedUrl(selectedBook.pdf_path, 3600);
          if (pdfData?.signedUrl) {
            const link = document.createElement('a');
            link.href = pdfData.signedUrl;
            link.target = '_blank';
            link.download = `${selectedBook.title}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            addToast("PDF Download Started!", "success");
          }

          setShowCheckout(false);
          setSelectedBook(null);
        } catch (error) {
          addToast("Error delivering PDF. Please contact admin.", "error");
        }
        setIsProcessing(false);
      }
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", () => {
      addToast("Payment failed or cancelled.", "error");
      setIsProcessing(false);
    });
    rzp.open();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #06060a; color: #e2e2e5; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }
        .gold-text { background: linear-gradient(135deg, #f59e0b 0%, #eab308 40%, #fcd34d 70%, #d97706 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .card { background: rgba(255,255,255,0.018); border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 28px; cursor: pointer; transition: all 0.3s ease; }
        .card:hover { transform: translateY(-8px); box-shadow: 0 24px 60px rgba(234,179,8,0.12); border-color: rgba(234,179,8,0.25); }
        .btn-gold { background: linear-gradient(135deg, #eab308, #d97706); color: #000; border: none; cursor: pointer; font-weight: 700; transition: all 0.25s ease; }
        .btn-gold:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(234,179,8,0.45); }
        .hero-glow { position: absolute; top: -200px; left: 50%; transform: translateX(-50%); width: 700px; height: 700px; background: radial-gradient(circle, rgba(234,179,8,0.06) 0%, transparent 70%); pointer-events: none; }
      `}</style>

      {/* Toasts */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 2000, display: "flex", flexDirection: "column", gap: 10 }}>
        {toasts.map((toast) => (
          <div key={toast.id} style={{ padding: "12px 20px", borderRadius: 12, fontSize: 14, fontWeight: 600, background: toast.type === "success" ? "rgba(16,185,129,0.15)" : toast.type === "error" ? "rgba(239,68,68,0.15)" : "rgba(234,179,8,0.12)", border: `1px solid ${toast.type === "success" ? "rgba(16,185,129,0.3)" : toast.type === "error" ? "rgba(239,68,68,0.3)" : "rgba(234,179,8,0.3)"}`, color: toast.type === "success" ? "#34d399" : toast.type === "error" ? "#f87171" : "#fcd34d", backdropFilter: "blur(12px)" }}>
            {toast.message}
          </div>
        ))}
      </div>

      {/* Checkout Modal */}
      {showCheckout && selectedBook && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ background: "#0d0d10", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 24, padding: 36, maxWidth: 450, width: "100%", position: "relative" }}>
            <button onClick={() => setShowCheckout(false)} style={{ position: "absolute", top: 16, right: 16, background: "rgba(255,255,255,0.07)", border: "none", borderRadius: "50%", width: 32, height: 32, color: "#888", cursor: "pointer" }}><X size={16} style={{margin:"0 auto"}}/></button>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 6 }}>Complete Purchase</h2>
            <p style={{ fontSize: 13, color: "#888", marginBottom: 24 }}>Book: <span style={{color:"#eab308"}}>{selectedBook.title}</span></p>

            <form onSubmit={handlePayment} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <input required placeholder="Full Name" value={checkoutData.name} onChange={(e) => setCheckoutData({...checkoutData, name: e.target.value})} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: "none" }} />
              <input required type="email" placeholder="Email Address (For PDF backup)" value={checkoutData.email} onChange={(e) => setCheckoutData({...checkoutData, email: e.target.value})} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: "none" }} />
              <input required type="tel" placeholder="Phone Number" value={checkoutData.phone} onChange={(e) => setCheckoutData({...checkoutData, phone: e.target.value})} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", outline: "none" }} />
              
              <div style={{ display: "flex", gap: 8 }}>
                <input placeholder="Have a Coupon Code?" value={checkoutData.coupon} onChange={(e) => setCheckoutData({...checkoutData, coupon: e.target.value})} style={{ flex: 1, padding: "12px 16px", borderRadius: 12, background: "rgba(234,179,8,0.05)", border: "1px dashed rgba(234,179,8,0.3)", color: "#eab308", outline: "none" }} />
                <button type="button" onClick={verifyCoupon} style={{ padding: "0 16px", borderRadius: 12, background: "rgba(234,179,8,0.15)", color: "#eab308", border: "none", cursor: "pointer", fontWeight: "bold" }}>Apply</button>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: 16, borderRadius: 12, marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: 14, marginBottom: 8 }}><span>Price:</span> <span>₹{selectedBook.final_price}</span></div>
                {appliedCoupon && <div style={{ display: "flex", justifyContent: "space-between", color: "#10b981", fontSize: 14, marginBottom: 8 }}><span>Coupon Discount ({appliedCoupon.discount}%):</span> <span>- ₹{selectedBook.final_price - finalPayablePrice}</span></div>}
                <div style={{ display: "flex", justifyContent: "space-between", color: "#fff", fontSize: 18, fontWeight: 800, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 8 }}><span>Total to Pay:</span> <span>₹{finalPayablePrice}</span></div>
              </div>

              <button type="submit" disabled={isProcessing} className="btn-gold" style={{ width: "100%", padding: "16px", borderRadius: 12, display: "flex", justifyContent: "center", alignItems: "center", gap: 8, fontSize: 16 }}>
                {isProcessing ? <RefreshCw className="spinner" size={18} /> : <Lock size={18} />}
                {isProcessing ? "Processing..." : `Secure Pay ₹${finalPayablePrice}`}
              </button>
            </form>
          </div>
        </div>
      )}

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        {/* Navbar */}
        <nav style={{ padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(6,6,10,0.80)", borderBottom: "1px solid rgba(255,255,255,0.06)", position: "sticky", top: 0, zIndex: 500, backdropFilter: "blur(24px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck color="#eab308" size={28} />
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 900, letterSpacing: 5, color: "#fff" }}>VEDOXA</span>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ textAlign: "center", padding: "90px 24px 60px", position: "relative" }}>
          <div className="hero-glow" />
          <h1 style={{ fontFamily: "'Cinzel', serif", fontSize: "clamp(34px, 7vw, 68px)", fontWeight: 900, lineHeight: 1.15, marginBottom: 22 }}>
            Awaken Your <span className="gold-text">Consciousness</span>
          </h1>
          <p style={{ color: "#777", maxWidth: 580, margin: "0 auto 44px", fontSize: 16, lineHeight: 1.75 }}>
            100% original, verified digital books on spirituality & psychology.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#666", fontSize: 13, fontWeight: 500 }}><ShieldCheck size={18} color="#eab308"/> 256-bit Secure</div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#666", fontSize: 13, fontWeight: 500 }}><Zap size={18} color="#eab308"/> Instant PDF Auto-Download</div>
          </div>
        </section>

        {/* Books */}
        <section style={{ padding: "20px 24px 100px", maxWidth: 1200, margin: "0 auto", width: "100%" }}>
          <h2 style={{ fontFamily: "'Cinzel', serif", fontSize: 30, fontWeight: 700, marginBottom: 40, textAlign: "center" }}>Premium <span className="gold-text">Library</span></h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 24 }}>
            {books.map((book) => (
              <div key={book.id} className="card">
                {book.discount > 0 && <div style={{ position: "absolute", top: 16, right: 16, background: "rgba(234,179,8,0.1)", color: "#eab308", padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700, border: "1px solid rgba(234,179,8,0.2)" }}>{book.discount}% OFF</div>}
                
                <div style={{ width: 76, height: 76, borderRadius: "50%", background: "radial-gradient(circle, rgba(234,179,8,0.08), transparent)", border: "1px solid rgba(234,179,8,0.18)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <BookOpen size={34} color="#eab308" />
                </div>
                
                <h3 style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 700, marginBottom: 8, textAlign: "center", color: "#fff" }}>{book.title}</h3>
                <p style={{ color: "#666", fontSize: 13, textAlign: "center", marginBottom: 20 }}>by {book.author}</p>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: 18 }}>
                  <div>
                    {book.discount > 0 && <div style={{ fontSize: 12, color: "#555", textDecoration: "line-through" }}>₹{book.base_price}</div>}
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>₹{book.final_price}</div>
                  </div>
                  <button onClick={() => { setSelectedBook(book); setShowCheckout(true); }} className="btn-gold" style={{ padding: "10px 18px", borderRadius: 12, fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    Buy Now <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
