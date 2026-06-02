"use client";

import { useCallback, useEffect, useMemo, useState } from "react"; import Link from "next/link"; import Image from "next/image"; import { createClient, Session, User } from "@supabase/supabase-js"; import { AnimatePresence, motion } from "framer-motion"; import NProgress from "nprogress"; import "nprogress/nprogress.css"; import { ShieldCheck, Globe, BookOpen, Lock, X, Zap, ChevronRight, RefreshCw, CheckCircle2, LogOut, UserCircle, Coins, MessageSquare, Star, Share2, Menu, Edit3, Settings, Handshake, } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co"; const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"; const supabase = createClient(supabaseUrl, supabaseKey);

const AVATARS = [ "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Vedoxa1&backgroundColor=eab308", "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Karma&backgroundColor=059669", "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Dharma&backgroundColor=dc2626", "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Moksha&backgroundColor=2563eb", "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=Gyan&backgroundColor=7c3aed", ];

const dict = { EN: { brand: "VEDOXA", login: "Login / Sign Up", heroTitle: "Awaken Your Consciousness", heroSub: "100% original, verified digital books on spirituality & psychology.", secure: "Safe & Secure", instant: "Instant PDF Auto-Download", premiumLib: "Premium Library", buyNow: "Buy Now", readNow: "Read Now", checkout: "Complete Purchase", haveCoupon: "Have a Coupon Code?", apply: "Apply", pay: "Secure Pay", rewardPoints: "Reward Points", redeemPoints: "Redeem Points", rewardEarn: "You will earn", pdfReader: "Web Reader", close: "Close", reviews: "Customer Reviews", writeReview: "Write a Review", submitReview: "Submit", updateReview: "Update", noReviews: "No reviews yet. Be the first to review after purchasing!", journeyText: "True knowledge begins when you look within. Start your journey today.", dashboard: "Dashboard", explore: "Explore", quiz: "Quiz", logout: "Logout securely", chooseAvatar: "Choose your Avatar", welcomeBack: "Welcome Back", createAccount: "Create Account", continueGoogle: "Continue with Google", owned: "Owned", processing: "Processing...", loadingReviews: "Loading reviews...", partnerActive: "Partner Code Active", partnerDiscountBanner: (pct: number) => Partner Discount of ${pct}% has been applied to all books!, }, HI: { brand: "वेडोक्सा", login: "लॉगिन / साइन अप", heroTitle: "अपनी चेतना को जागृत करें", heroSub: "आध्यात्मिकता और मनोविज्ञान पर 100% मूल, सत्यापित डिजिटल पुस्तकें।", secure: "सुरक्षित और भरोसेमंद", instant: "त्वरित पीडीएफ डाउनलोड", premiumLib: "प्रीमियम पुस्तकालय", buyNow: "अभी खरीदें", readNow: "अभी पढ़ें", checkout: "खरीदारी पूरी करें", haveCoupon: "क्या आपके पास कूपन है?", apply: "लागू करें", pay: "सुरक्षित भुगतान", rewardPoints: "इनाम अंक", redeemPoints: "अंक भुनाएं", rewardEarn: "आपको मिलेंगे", pdfReader: "वेब रीडर", close: "बंद करें", reviews: "ग्राहक समीक्षा", writeReview: "समीक्षा लिखें", submitReview: "जमा करें", updateReview: "अपडेट करें", noReviews: "अभी तक कोई समीक्षा नहीं। खरीदने के बाद पहली समीक्षा लिखें!", journeyText: "सच्चा ज्ञान तब शुरू होता है जब आप अपने भीतर झांकते हैं। आज ही अपनी यात्रा शुरू करें।", dashboard: "डैशबोर्ड", explore: "एक्सप्लोर", quiz: "क्विज़", logout: "सुरक्षित लॉगआउट", chooseAvatar: "अपना अवतार चुनें", welcomeBack: "वापसी पर स्वागत है", createAccount: "खाता बनाएं", continueGoogle: "Google से जारी रखें", owned: "खरीदा गया", processing: "प्रोसेस हो रहा है...", loadingReviews: "समीक्षाएँ लोड हो रही हैं...", partnerActive: "पार्टनर कोड सक्रिय", partnerDiscountBanner: (pct: number) => पार्टनर डिस्काउंट ${pct}% सभी पुस्तकों पर लागू है!, }, } as const;

type Lang = keyof typeof dict;

type Book = { id: string; title: string; author: string; description?: string | null; base_price: number; final_price: number; pdf_path: string; cover_path?: string | null; discount?: number | null; created_at?: string; };

type Profile = { id: string; name?: string | null; avatar_url?: string | null; reward_points?: number | null; };

type ReviewRow = { id: string; review_text: string; created_at: string; user_id: string; profiles?: { name?: string | null } | null; };

type AffiliateCode = { code: string; discount_pct: number; commission_pct: number; is_claimed: boolean; };

type CouponRow = { code: string; discount: number; expiry: string; used: number; limit_count: number; };

type ToastItem = { id: number; message: string; type: "success" | "error" | "info"; };

function loadRazorpayScript() { return new Promise<boolean>((resolve) => { if (typeof window !== "undefined" && (window as any).Razorpay) return resolve(true); const script = document.createElement("script"); script.src = "https://checkout.razorpay.com/v1/checkout.js"; script.onload = () => resolve(true); script.onerror = () => resolve(false); document.body.appendChild(script); }); }

function money(amount: number) { return ₹${Math.max(0, Math.round(amount || 0))}; }

function clamp(n: number, min: number, max: number) { return Math.max(min, Math.min(max, n)); }

function cx(...classes: Array<string | false | null | undefined>) { return classes.filter(Boolean).join(" "); }

function useBodyLock(locked: boolean) { useEffect(() => { if (!locked) { document.body.style.overflow = "unset"; return; } document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = "unset"; }; }, [locked]); }

function useToasts() { const [toasts, setToasts] = useState<ToastItem[]>([]);

const addToast = useCallback((message: string, type: ToastItem["type"] = "info") => { const id = Date.now() + Math.floor(Math.random() * 1000); setToasts((prev) => [...prev, { id, message, type }]); window.setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, 4000); }, []);

return { toasts, addToast }; }

export default function VedoxaHome(): JSX.Element { const [lang, setLang] = useState<Lang>("EN"); const t = dict[lang];

const { toasts, addToast } = useToasts();

const [books, setBooks] = useState<Book[]>([]); const [loadingBooks, setLoadingBooks] = useState(true);

const [user, setUser] = useState<User | null>(null); const [profile, setProfile] = useState<Profile | null>(null); const [purchasedBookIds, setPurchasedBookIds] = useState<string[]>([]);

const [showAuthModal, setShowAuthModal] = useState(false); const [authForm, setAuthForm] = useState({ email: "", password: "", mode: "login" as "login" | "signup" });

const [selectedBook, setSelectedBook] = useState<Book | null>(null); const [showBookDetails, setShowBookDetails] = useState(false);

const [showCheckout, setShowCheckout] = useState(false); const [checkoutData, setCheckoutData] = useState({ name: "", email: "", phone: "", countryCode: "+91", coupon: "", }); const [appliedCoupon, setAppliedCoupon] = useState<CouponRow | null>(null); const [useRewards, setUseRewards] = useState(false); const [isProcessing, setIsProcessing] = useState(false);

const [showReader, setShowReader] = useState(false); const [readerUrl, setReaderUrl] = useState("");

const [reviews, setReviews] = useState<ReviewRow[]>([]); const [loadingReviews, setLoadingReviews] = useState(false); const [newReviewText, setNewReviewText] = useState(""); const [userExistingReview, setUserExistingReview] = useState<ReviewRow | null>(null);

const [showAvatarPicker, setShowAvatarPicker] = useState(false); const [isSidebarOpen, setIsSidebarOpen] = useState(false); const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

const [partnerData, setPartnerData] = useState<AffiliateCode | null>(null);

useBodyLock(showBookDetails || showCheckout || showAuthModal || showReader || isSidebarOpen || showAvatarPicker);

const hasPurchasedSelectedBook = !!selectedBook && purchasedBookIds.includes(selectedBook.id);

const partnerDiscountAmount = useMemo(() => { if (!selectedBook || !partnerData) return 0; return Math.round(selectedBook.final_price * (partnerData.discount_pct / 100)); }, [selectedBook, partnerData]);

const clientBasePrice = useMemo(() => { if (!selectedBook) return 0; return Math.max(0, selectedBook.final_price - partnerDiscountAmount); }, [selectedBook, partnerDiscountAmount]);

const couponDiscountAmount = useMemo(() => { if (!selectedBook || !appliedCoupon) return 0; return Math.round(clientBasePrice * (appliedCoupon.discount / 100)); }, [clientBasePrice, appliedCoupon, selectedBook]);

const rewardPointsAvailable = profile?.reward_points ?? 0; const rewardDiscountAmount = useMemo(() => { if (!useRewards) return 0; return clamp(rewardPointsAvailable, 0, Math.max(0, clientBasePrice - couponDiscountAmount)); }, [useRewards, rewardPointsAvailable, clientBasePrice, couponDiscountAmount]);

const clientFinalPrice = useMemo(() => { if (!selectedBook) return 0; return Math.max(0, clientBasePrice - couponDiscountAmount - rewardDiscountAmount); }, [selectedBook, clientBasePrice, couponDiscountAmount, rewardDiscountAmount]);

const earnedPoints = useMemo(() => { if (!selectedBook) return 0; return Math.floor(clientBasePrice * 0.019); }, [selectedBook, clientBasePrice]);

const fetchBooks = useCallback(async () => { setLoadingBooks(true); NProgress.start(); try { const { data, error } = await supabase.from("books").select("*").order("created_at", { ascending: false }); if (error) throw error; setBooks((data || []) as Book[]); } catch (err: any) { addToast(err?.message || "Failed to load books.", "error"); } finally { setLoadingBooks(false); NProgress.done(); } }, [addToast]);

const fetchReviews = useCallback( async (bookId: string) => { setLoadingReviews(true); try { const { data, error } = await supabase .from("reviews") .select("id, review_text, created_at, user_id, profiles(name)") .eq("book_id", bookId) .order("created_at", { ascending: false }); if (error) throw error;

const rows = (data || []) as ReviewRow[];
    setReviews(rows);

    if (user) {
      const existing = rows.find((r) => r.user_id === user.id) || null;
      setUserExistingReview(existing);
      setNewReviewText(existing?.review_text || "");
    } else {
      setUserExistingReview(null);
      setNewReviewText("");
    }
  } catch (err: any) {
    addToast(err?.message || "Failed to load reviews.", "error");
  } finally {
    setLoadingReviews(false);
  }
},
[addToast, user]

);

const handleUserLogin = useCallback( async (loggedUser: User) => { setUser(loggedUser); setCheckoutData((prev) => ({ ...prev, email: loggedUser.email || prev.email }));

try {
    const { data: prof, error: profError } = await supabase.from("profiles").select("*").eq("id", loggedUser.id).maybeSingle();
    if (profError) throw profError;

    let nextProfile: Profile | null = prof || null;

    if (nextProfile && !nextProfile.avatar_url) {
      const randomAvatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
      const { error: avatarError } = await supabase.from("profiles").update({ avatar_url: randomAvatar }).eq("id", loggedUser.id);
      if (!avatarError) nextProfile = { ...nextProfile, avatar_url: randomAvatar };
    }

    setProfile(nextProfile);
  } catch (err) {
    setProfile(null);
  }

  try {
    const { data: orders, error } = await supabase.from("orders").select("book_id").eq("customer_id", loggedUser.id);
    if (error) throw error;
    setPurchasedBookIds((orders || []).map((o: any) => o.book_id));
  } catch (err) {
    setPurchasedBookIds([]);
  }
},
[]

);

const initPartnerSystem = useCallback(async () => { if (typeof window === "undefined") return;

const urlParams = new URLSearchParams(window.location.search);
let pCode = urlParams.get("partner");

if (pCode) {
  localStorage.setItem("vedoxa_partner", pCode.toUpperCase());
} else {
  pCode = localStorage.getItem("vedoxa_partner");
}

if (!pCode) return;

try {
  const { data, error } = await supabase
    .from("affiliate_codes")
    .select("*")
    .eq("code", pCode.toUpperCase())
    .eq("is_claimed", true)
    .single();

  if (error || !data) {
    localStorage.removeItem("vedoxa_partner");
    return;
  }

  const affiliate = data as AffiliateCode;
  setPartnerData(affiliate);

  const viewKey = `viewed_${affiliate.code}`;
  if (!sessionStorage.getItem(viewKey)) {
    sessionStorage.setItem(viewKey, "true");
    const { data: aff } = await supabase.from("affiliates").select("clicks").eq("partner_code", affiliate.code).single();
    if (aff) {
      await supabase.from("affiliates").update({ clicks: (aff.clicks || 0) + 1 }).eq("partner_code", affiliate.code);
    }
  }
} catch {
  localStorage.removeItem("vedoxa_partner");
}

}, []);

useEffect(() => { const preventZoom = (e: Event) => e.preventDefault(); document.addEventListener("gesturestart", preventZoom, { passive: false } as any); document.addEventListener("gesturechange", preventZoom, { passive: false } as any);

NProgress.configure({ showSpinner: false, speed: 400 });

fetchBooks();
initPartnerSystem();

supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: Session | null } }) => {
  if (session?.user) await handleUserLogin(session.user);
});

const {
  data: { subscription },
} = supabase.auth.onAuthStateChange(async (_event, session) => {
  if (session?.user) {
    await handleUserLogin(session.user);
  } else {
    setUser(null);
    setProfile(null);
    setPurchasedBookIds([]);
    setIsSidebarOpen(false);
  }
});

return () => {
  document.removeEventListener("gesturestart", preventZoom as any);
  document.removeEventListener("gesturechange", preventZoom as any);
  subscription.unsubscribe();
};

}, [fetchBooks, handleUserLogin, initPartnerSystem]);

const openBookDetails = useCallback( (book: Book) => { setSelectedBook(book); setShowCheckout(false); setShowBookDetails(true); fetchReviews(book.id); }, [fetchReviews] );

const openWebReader = useCallback( async (book: Book) => { try { NProgress.start(); const { data, error } = await supabase.storage.from("books-pdfs").createSignedUrl(book.pdf_path, 3600); if (error) throw error; if (!data?.signedUrl) throw new Error("Could not create secure reader URL.");

const secureViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(data.signedUrl)}&embedded=true`;
    setReaderUrl(secureViewerUrl);
    setShowReader(true);
  } catch (err: any) {
    addToast(err?.message || "Failed to load secure reader.", "error");
  } finally {
    NProgress.done();
  }
},
[addToast]

);

const verifyCoupon = useCallback(async () => { if (!checkoutData.coupon.trim()) return;

try {
  const { data, error } = await supabase.from("coupons").select("*").eq("code", checkoutData.coupon.trim().toUpperCase()).single();
  if (error || !data) throw new Error("Invalid coupon");

  const coupon = data as CouponRow;
  const expired = new Date(coupon.expiry) <= new Date();
  const exhausted = coupon.used >= coupon.limit_count;

  if (expired || exhausted) throw new Error("Invalid or expired coupon");

  setAppliedCoupon(coupon);
  addToast("Coupon applied! 🎉", "success");
} catch (err: any) {
  setAppliedCoupon(null);
  addToast(err?.message || "Coupon could not be applied.", "error");
}

}, [checkoutData.coupon, addToast]);

const handleSaveAvatar = useCallback( async (avatarUrl: string) => { if (!user) return; try { const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", user.id); if (error) throw error; setProfile((prev) => (prev ? { ...prev, avatar_url: avatarUrl } : prev)); setShowAvatarPicker(false); addToast("Profile picture updated!", "success"); } catch (err: any) { addToast(err?.message || "Error saving avatar.", "error"); } }, [addToast, user] );

const handleSubmitReview = useCallback(async () => { if (!user || !selectedBook || !newReviewText.trim()) return; try { if (userExistingReview) { const { error } = await supabase.from("reviews").update({ review_text: newReviewText.trim() }).eq("id", userExistingReview.id); if (error) throw error; addToast("Review updated successfully!", "success"); } else { const { error } = await supabase.from("reviews").insert([ { book_id: selectedBook.id, user_id: user.id, review_text: newReviewText.trim() }, ]); if (error) throw error; addToast("Review submitted successfully!", "success"); } await fetchReviews(selectedBook.id); } catch (err: any) { addToast(err?.message || "Failed to save review.", "error"); } }, [addToast, fetchReviews, newReviewText, selectedBook, user, userExistingReview]);

const creditAffiliate = useCallback(async (amountPaid: number) => { if (!partnerData || amountPaid <= 0) return; const commission = Math.round(amountPaid * (partnerData.commission_pct / 100)); try { const { data: aff, error } = await supabase.from("affiliates").select("sales, total_earned").eq("partner_code", partnerData.code).single(); if (error || !aff) return;

await supabase
    .from("affiliates")
    .update({
      sales: (aff.sales || 0) + 1,
      total_earned: (aff.total_earned || 0) + commission,
    })
    .eq("partner_code", partnerData.code);
} catch {
  // silent on purpose
}

}, [partnerData]);

const confirmLogout = useCallback(async () => { await supabase.auth.signOut(); setShowLogoutConfirm(false); setIsSidebarOpen(false); addToast("Logged out securely", "info"); }, [addToast]);

const handleAuth = useCallback( async (e: React.FormEvent) => { e.preventDefault(); NProgress.start(); try { const res = authForm.mode === "signup" ? await supabase.auth.signUp({ email: authForm.email, password: authForm.password }) : await supabase.auth.signInWithPassword({ email: authForm.email, password: authForm.password });

if (res.error) throw res.error;
    addToast(`Successfully ${authForm.mode === "signup" ? "signed up" : "logged in"}!`, "success");
    setShowAuthModal(false);
  } catch (err: any) {
    addToast(err?.message || "Authentication failed.", "error");
  } finally {
    NProgress.done();
  }
},
[addToast, authForm.email, authForm.mode, authForm.password]

);

const handlePayment = useCallback( async (e: React.FormEvent) => { e.preventDefault();

if (!selectedBook) return;
  if (!user) {
    addToast("Please login to purchase", "error");
    setShowCheckout(false);
    setShowAuthModal(true);
    return;
  }
  if (!checkoutData.name.trim() || !checkoutData.phone.trim()) {
    addToast("Fill all details", "error");
    return;
  }
  if (checkoutData.countryCode === "+91" && checkoutData.phone.length !== 10) {
    addToast("Please enter a valid 10-digit Indian phone number.", "error");
    return;
  }

  setIsProcessing(true);
  NProgress.start();

  try {
    if (clientFinalPrice === 0) {
      const { error } = await supabase.from("orders").insert([
        {
          customer_id: user.id,
          customer_name: checkoutData.name.trim(),
          customer_email: user.email,
          book_id: selectedBook.id,
          book_title: selectedBook.title,
          base_price: selectedBook.base_price,
          final_price: 0,
          amount: 0,
          coupon_used: appliedCoupon?.code || null,
          payment_method: "free_coupon",
          points_used: rewardDiscountAmount,
        },
      ]);
      if (error) throw error;

      if (useRewards && rewardDiscountAmount > 0 && profile?.reward_points != null) {
        await supabase.from("profiles").update({ reward_points: Math.max(0, profile.reward_points - rewardDiscountAmount) }).eq("id", user.id);
      }

      if (partnerData) {
        await creditAffiliate(0);
      }

      setPurchasedBookIds((prev) => Array.from(new Set([...prev, selectedBook.id])));
      addToast("Book unlocked successfully! 🎉", "success");
      setShowCheckout(false);
      setShowBookDetails(false);
      await openWebReader(selectedBook);
      return;
    }

    const loaded = await loadRazorpayScript();
    if (!loaded) throw new Error("Payment gateway failed. Check network.");

    const orderRes = await fetch("/api/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create_order",
        bookId: selectedBook.id,
        couponCode: appliedCoupon?.code,
        useRewards,
        userId: user.id,
        finalAmountOverride: clientFinalPrice,
      }),
    });

    if (!orderRes.ok) throw new Error("Order creation failed");
    const orderData = await orderRes.json();

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount * 100,
      currency: "INR",
      name: "VEDOXA",
      description: selectedBook.title,
      order_id: orderData.rzpOrderId,
      prefill: {
        name: checkoutData.name.trim(),
        email: user.email,
        contact: `${checkoutData.countryCode}${checkoutData.phone}`,
      },
      theme: { color: "#eab308" },
      handler: async function (response: any) {
        try {
          addToast("Verifying payment...", "info");
          const verifyRes = await fetch("/api/payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "verify",
              rzpOrderId: response.razorpay_order_id,
              rzpPaymentId: response.razorpay_payment_id,
              rzpSignature: response.razorpay_signature,
              orderData: {
                customer_id: user.id,
                customer_name: checkoutData.name.trim(),
                customer_email: user.email,
                book_id: selectedBook.id,
                book_title: selectedBook.title,
                base_price: selectedBook.base_price,
                final_price: orderData.amount,
                coupon_used: appliedCoupon?.code || null,
                points_used: rewardDiscountAmount,
                payment_method: "razorpay",
              },
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyData.success) throw new Error("Security verification failed!");

          if (useRewards && rewardDiscountAmount > 0 && profile?.reward_points != null) {
            await supabase.from("profiles").update({ reward_points: Math.max(0, profile.reward_points - rewardDiscountAmount) }).eq("id", user.id);
          }

          if (partnerData) await creditAffiliate(orderData.amount);

          setPurchasedBookIds((prev) => Array.from(new Set([...prev, selectedBook.id])));
          addToast("Payment Verified! Unlocking book...", "success");
          setShowCheckout(false);
          setShowBookDetails(false);
          await openWebReader(selectedBook);
        } catch (err: any) {
          addToast(err?.message || "Verification failed.", "error");
        }
      },
    };

    const rzp = new (window as any).Razorpay(options);
    rzp.on("payment.failed", (res: any) => addToast(res?.error?.description || "Payment failed.", "error"));
    rzp.open();
  } catch (err: any) {
    addToast(err?.message || "Payment failed.", "error");
  } finally {
    setIsProcessing(false);
    NProgress.done();
  }
},
[
  addToast,
  appliedCoupon?.code,
  clientFinalPrice,
  confirmLogout,
  creditAffiliate,
  checkoutData.countryCode,
  checkoutData.name,
  checkoutData.phone,
  creditAffiliate,
  openWebReader,
  partnerData,
  profile?.reward_points,
  rewardDiscountAmount,
  selectedBook,
  useRewards,
  user,
]

);

const handleShare = useCallback(async () => { const urlObj = new URL(window.location.href); if (partnerData) urlObj.searchParams.set("partner", partnerData.code);

const shareData = {
  title: "VEDOXA Premium Library",
  text: "Awaken Your Consciousness with original, verified digital books on spirituality & psychology.",
  url: urlObj.toString(),
};

try {
  if (navigator.share) {
    await navigator.share(shareData);
  } else {
    await navigator.clipboard.writeText(shareData.url);
    addToast("Website link copied to clipboard! 📋", "success");
  }
} catch {
  // ignore share cancellation
}

}, [addToast, partnerData]);

const heroHeadline = useMemo(() => { if (lang === "EN") { const parts = t.heroTitle.split(" "); return ( <> {parts[0]} <span className="gold-text">{parts[1]}</span> {parts.slice(2).join(" ")} </> ); } return ( <> <span className="gold-text">अपनी चेतना</span> को जागृत करें </> ); }, [lang, t.heroTitle]);

return ( <> <style>{html, body { touch-action: pan-y; -webkit-text-size-adjust: 100%; overscroll-behavior-y: none; } @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,700;1,400&display=swap'); .font-cinzel { font-family: 'Cinzel', serif; } .gold-text { background: linear-gradient(135deg, #f59e0b 0%, #eab308 40%, #fcd34d 70%, #d97706 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; } .btn-gold { background: linear-gradient(135deg, #eab308, #d97706); color: #000; transition: all 0.25s ease; box-shadow: 0 4px 15px rgba(234,179,8,0.2); } .btn-gold:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(234,179,8,0.45); } #nprogress .bar { background: #eab308 !important; height: 3px !important; } #nprogress .peg { box-shadow: 0 0 10px #eab308, 0 0 5px #eab308 !important; } @keyframes scrollLeft { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } } .animate-scroll { animation: scrollLeft 20s linear infinite; display: inline-block; white-space: nowrap; }}</style>

<div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
    <AnimatePresence>
      {toasts.map((toast) => (
        <motion.div
          key={toast.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={cx(
            "px-5 py-3 rounded-xl text-sm font-bold backdrop-blur-md border",
            toast.type === "success"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : toast.type === "error"
              ? "bg-red-500/15 border-red-500/30 text-red-400"
              : "bg-yellow-500/15 border-yellow-500/30 text-yellow-400"
          )}
        >
          {toast.message}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>

  <AnimatePresence>
    {isSidebarOpen && (
      <>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[5000]"
        />
        <motion.aside
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="fixed top-0 right-0 w-80 h-full bg-[#0a0a0d] border-l border-white/10 z-[5001] shadow-2xl flex flex-col"
        >
          <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/40">
            <span className="font-bold text-white flex items-center gap-2">
              <Settings size={18} /> {t.dashboard}
            </span>
            <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 flex flex-col items-center gap-4 border-b border-white/5">
            <div className="relative group cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
              <div className="w-24 h-24 rounded-full border-2 border-yellow-500/50 overflow-hidden bg-white/5 flex items-center justify-center">
                {profile?.avatar_url ? <img src={profile.avatar_url} alt="avatar" className="w-full h-full object-cover" /> : <UserCircle size={48} className="text-yellow-500 opacity-50" />}
              </div>
              <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 size={20} className="text-white" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-bold text-white text-lg">{profile?.name || "Vedoxa Reader"}</h3>
              <p className="text-gray-500 text-xs">{user?.email}</p>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-4">
            <Link href="/reward-points" className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-yellow-500/20 transition">
              <div className="flex items-center gap-2 text-yellow-500 font-bold">
                <Coins size={20} /> {t.rewardPoints}
              </div>
              <span className="text-xl font-black text-white">{rewardPointsAvailable}</span>
            </Link>

            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
              <span className="text-gray-300 font-bold text-sm">Language / भाषा</span>
              <button onClick={() => setLang(lang === "EN" ? "HI" : "EN")} className="border border-yellow-500/30 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold hover:bg-yellow-500/10 transition">
                {lang === "EN" ? "Switch to हिन्दी" : "Switch to English"}
              </button>
            </div>

            <Link href="/explore" className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-white/10 transition">
              <span className="text-gray-300 font-bold text-sm">{t.explore}</span>
              <ChevronRight size={16} className="text-gray-500" />
            </Link>

            <Link href="/quiz" className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-white/10 transition">
              <span className="text-gray-300 font-bold text-sm">{t.quiz}</span>
              <ChevronRight size={16} className="text-gray-500" />
            </Link>
          </div>

          <div className="mt-auto p-6 border-t border-white/10">
            {showLogoutConfirm ? (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl text-center">
                <p className="text-sm font-bold text-white mb-3">Are you sure you want to log out?</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-white/10 text-white text-xs font-bold py-2 rounded-xl">
                    Cancel
                  </button>
                  <button onClick={confirmLogout} className="flex-1 bg-red-500 text-white text-xs font-bold py-2 rounded-xl">
                    Yes, Logout
                  </button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowLogoutConfirm(true)} className="w-full bg-white/5 border border-white/10 text-red-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition">
                <LogOut size={18} /> {t.logout}
              </button>
            )}
          </div>
        </motion.aside>
      </>
    )}
  </AnimatePresence>

  <AnimatePresence>
    {showAvatarPicker && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[6000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-[#0a0a0d] border border-white/10 rounded-3xl p-6 w-full max-w-sm relative">
          <button onClick={() => setShowAvatarPicker(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">
            <X size={20} />
          </button>
          <h3 className="text-lg font-bold text-white mb-6 text-center">{t.chooseAvatar}</h3>
          <div className="grid grid-cols-3 gap-4">
            {AVATARS.map((url, idx) => (
              <button key={idx} onClick={() => handleSaveAvatar(url)} className="aspect-square rounded-full border-2 border-white/10 hover:border-yellow-500 hover:scale-105 transition overflow-hidden bg-white/5">
                <img src={url} alt={`avatar-${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    )}
  </AnimatePresence>

  <AnimatePresence>
    {showBookDetails && selectedBook && (
      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.35, ease: "easeOut" }} className="fixed inset-0 z-[800] bg-black/90 backdrop-blur-xl flex flex-col md:flex-row overflow-y-auto">
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => {
            setShowBookDetails(false);
            setSelectedBook(null);
            setShowCheckout(false);
          }}
          className="fixed top-6 right-6 z-[850] p-3 bg-white/10 rounded-full text-white hover:bg-red-500/80 transition-colors shadow-lg"
        >
          <X size={24} />
        </motion.button>

        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center border-r border-white/10 relative">
          {partnerData && !hasPurchasedSelectedBook && (
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="absolute top-8 left-8 bg-blue-500/20 border border-blue-500/50 text-blue-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <Handshake size={16} /> {t.partnerActive} (-{partnerData.discount_pct}%)
            </motion.div>
          )}

          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.5 }} className="w-full h-64 md:h-96 mb-8 mt-10 md:mt-0 relative">
            <div className="absolute inset-0 bg-yellow-500/20 blur-[60px] rounded-full animate-pulse" />
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="w-full h-full relative z-10 shadow-2xl rounded-3xl">
              {selectedBook.cover_path ? (
                <div className="w-full h-full relative overflow-hidden rounded-3xl">
                  <img
                    src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${selectedBook.cover_path}`}
                    alt={selectedBook.title}
                    className="w-full h-full object-contain transition-transform duration-300 hover:scale-105 drop-shadow-[0_0_15px_rgba(234,179,8,0.2)]"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 flex items-center justify-center rounded-3xl border border-yellow-500/20">
                  <BookOpen size={64} className="text-yellow-500 opacity-80" />
                </div>
              )}
            </motion.div>
          </motion.div>

          <motion.h1 initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="font-cinzel text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">
            {selectedBook.title}
          </motion.h1>
          <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="text-xl text-yellow-500 mb-6 drop-shadow-md">
            by {selectedBook.author}
          </motion.p>
          <motion.p initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="text-gray-400 leading-relaxed mb-8 text-sm md:text-base">
            {selectedBook.description || "Immerse yourself in this profound work. Verified and 100% original content."}
          </motion.p>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="flex items-center gap-6 mt-auto">
            <div>
              {partnerData && !hasPurchasedSelectedBook && <span className="text-lg text-gray-500 line-through mr-3">{money(selectedBook.final_price)}</span>}
              <span className="text-4xl font-black text-white">{money(clientBasePrice - couponDiscountAmount - rewardDiscountAmount)}</span>
            </div>
            {hasPurchasedSelectedBook ? (
              <button onClick={() => openWebReader(selectedBook)} className="flex-1 px-8 py-4 rounded-2xl text-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex justify-center items-center gap-3 font-bold hover:bg-emerald-500/25 transition shadow-lg">
                <CheckCircle2 size={24} /> {t.readNow}
              </button>
            ) : (
              <button onClick={() => setShowCheckout(true)} className="flex-1 btn-gold px-8 py-4 rounded-2xl text-lg flex justify-center items-center gap-3 font-black">
                <Lock size={20} /> {t.buyNow}
              </button>
            )}
          </motion.div>
        </div>

        <motion.div initial={{ x: 50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15, duration: 0.5 }} className="w-full md:w-1/2 p-8 md:p-16 bg-[#0a0a0d] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 blur-[100px] pointer-events-none" />
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <MessageSquare className="text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">{t.reviews}</h2>
          </div>

          {hasPurchasedSelectedBook && (
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl mb-8 relative z-10 shadow-lg">
              <h3 className="text-sm font-bold text-emerald-400 mb-3 flex items-center gap-2">
                <CheckCircle2 size={16} /> {userExistingReview ? "Update your review" : "You own this book"}
              </h3>
              <textarea
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                placeholder={t.writeReview}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-sm outline-none focus:border-yellow-500 resize-none h-24 mb-3 transition"
              />
              <button onClick={handleSubmitReview} className="btn-gold px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 ml-auto">
                {userExistingReview ? t.updateReview : t.submitReview}
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4 relative z-10">
            {loadingReviews ? (
              <div className="text-gray-500 text-sm animate-pulse">{t.loadingReviews}</div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => (
                <div key={review.id} className="bg-white/5 border border-white/5 p-5 rounded-2xl relative hover:bg-white/10 transition duration-300">
                  {review.user_id === user?.id && <div className="absolute top-4 right-4 text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">Your Review</div>}
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-white text-sm flex items-center gap-2">
                      <UserCircle size={16} className="text-gray-400" />
                      {review.profiles?.name || "Vedoxa Reader"}
                    </div>
                  </div>
                  <div className="flex text-yellow-500 mb-2">
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                    <Star size={12} fill="currentColor" />
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{review.review_text}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl bg-white/5">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p>{t.noReviews}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

  <AnimatePresence>
    {showAuthModal && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-[#0a0a0d] border border-white/10 rounded-3xl p-8 w-full max-w-md relative shadow-2xl">
          <button onClick={() => setShowAuthModal(false)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition">
            <X size={18} />
          </button>
          <h2 className="text-2xl font-extrabold text-white mb-6 text-center">{authForm.mode === "login" ? t.welcomeBack : t.createAccount}</h2>

          <form onSubmit={handleAuth} className="flex flex-col gap-4">
            <input required type="email" placeholder="Email" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-500 transition" />
            <input required type="password" placeholder="Password" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-500 transition" />
            <button type="submit" className="btn-gold py-3 rounded-xl font-bold text-base mt-2">
              {authForm.mode === "login" ? "Login" : "Sign Up"}
            </button>
          </form>

          <div className="my-5 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">OR</div>
          <button onClick={() => supabase.auth.signInWithOAuth({ provider: "google" })} className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white flex justify-center items-center gap-3 hover:bg-white/10 transition">
            <Globe size={18} /> {t.continueGoogle}
          </button>

          <p className="text-center mt-6 text-sm text-gray-400">
            {authForm.mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <span onClick={() => setAuthForm({ ...authForm, mode: authForm.mode === "login" ? "signup" : "login" })} className="text-yellow-500 font-bold cursor-pointer hover:underline">
              {authForm.mode === "login" ? "Sign Up" : "Login"}
            </span>
          </p>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

  <AnimatePresence>
    {showCheckout && selectedBook && (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }} className="bg-[#0d0d10] border border-yellow-500/20 rounded-3xl p-6 md:p-8 w-full max-w-md relative shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
          <button onClick={() => setShowCheckout(false)} className="absolute top-4 right-4 p-2 bg-white/5 rounded-full text-gray-400 hover:text-white transition">
            <X size={18} />
          </button>
          <h2 className="text-xl md:text-2xl font-extrabold text-white mb-2">{t.checkout}</h2>
          <p className="text-xs md:text-sm text-gray-400 mb-6">
            {t.brand}: <span className="text-yellow-500 font-bold">{selectedBook.title}</span>
          </p>

          <form onSubmit={handlePayment} className="flex flex-col gap-4">
            <input required placeholder="Full Name" value={checkoutData.name} onChange={(e) => setCheckoutData({ ...checkoutData, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-500 transition" />

            <div className="flex gap-2">
              <select value={checkoutData.countryCode} onChange={(e) => setCheckoutData({ ...checkoutData, countryCode: e.target.value })} className="w-24 px-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-500 transition cursor-pointer appearance-none">
                <option value="+91" className="bg-black">🇮🇳 +91</option>
                <option value="+1" className="bg-black">🇺🇸 +1</option>
                <option value="+44" className="bg-black">🇬🇧 +44</option>
                <option value="+61" className="bg-black">🇦🇺 +61</option>
                <option value="+971" className="bg-black">🇦🇪 +971</option>
              </select>
              <input required type="tel" placeholder="Phone Number" value={checkoutData.phone} onChange={(e) => setCheckoutData({ ...checkoutData, phone: e.target.value.replace(/\D/g, "") })} maxLength={checkoutData.countryCode === "+91" ? 10 : 15} className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white outline-none focus:border-yellow-500 transition" />
            </div>

            <div className="flex gap-2">
              <input placeholder={t.haveCoupon} value={checkoutData.coupon} onChange={(e) => setCheckoutData({ ...checkoutData, coupon: e.target.value })} className="flex-1 px-4 py-3 rounded-xl bg-yellow-500/5 border border-dashed border-yellow-500/30 text-yellow-500 outline-none focus:border-yellow-500" />
              <button type="button" onClick={verifyCoupon} className="px-5 rounded-xl bg-yellow-500/15 text-yellow-500 font-bold hover:bg-yellow-500/25 transition">
                {t.apply}
              </button>
            </div>

            {rewardPointsAvailable > 0 && (
              <label className="flex items-center gap-3 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20 cursor-pointer">
                <input type="checkbox" checked={useRewards} onChange={(e) => setUseRewards(e.target.checked)} className="accent-emerald-500 w-4 h-4" />
                <span className="text-emerald-400 text-sm font-medium">
                  {t.redeemPoints} ({rewardPointsAvailable} pts)
                </span>
              </label>
            )}

            <div className="bg-white/5 p-4 rounded-xl mt-2">
              <div className="flex justify-between text-gray-400 text-sm mb-2">
                <span>Price:</span> <span>{money(selectedBook.final_price)}</span>
              </div>
              {partnerData && (
                <div className="flex justify-between text-blue-400 font-bold text-sm mb-2">
                  <span>Partner Discount ({partnerData.discount_pct}%):</span> <span>- {money(partnerDiscountAmount)}</span>
                </div>
              )}
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-400 text-sm mb-2">
                  <span>Coupon Discount:</span> <span>- {money(couponDiscountAmount)}</span>
                </div>
              )}
              {useRewards && rewardDiscountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 text-sm mb-2">
                  <span>Points Applied:</span> <span>- {money(rewardDiscountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-white text-lg font-extrabold border-t border-white/10 pt-2 mt-2">
                <span>Total to Pay:</span> <span>{money(clientFinalPrice)}</span>
              </div>
              <div className="text-right text-xs text-yellow-500 mt-1 font-medium">
                {t.rewardEarn}: {earnedPoints} pts
              </div>
            </div>

            <button type="submit" disabled={isProcessing} className="btn-gold w-full py-4 rounded-xl flex justify-center items-center gap-2 text-base font-extrabold mt-2 disabled:opacity-60">
              {isProcessing ? <RefreshCw className="animate-spin" size={18} /> : <Lock size={18} />}
              {isProcessing ? t.processing : `${t.pay} ${money(clientFinalPrice)}`}
            </button>

            <div className="flex justify-center items-center gap-3 mt-3 opacity-60">
              <div className="flex items-center gap-1 font-bold text-white tracking-wide text-[10px] md:text-xs">
                <svg viewBox="0 0 100 24" className="h-3 md:h-4 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12.44 19H7.13L16 2.776h5.36L12.44 19z" fill="#fff" />
                  <path d="M2.57 18.99l9-16.216h5.21l-9 16.216H2.57z" fill="#3395FF" />
                  <text x="24" y="17" fill="#fff" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
                    razorpay
                  </text>
                </svg>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 border border-white/20 px-1.5 py-0.5 rounded">
                <ShieldCheck size={10} className="text-green-500" /> 256-BIT SSL
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>

  <AnimatePresence>
    {showReader && (
      <motion.div initial={{ opacity: 0, y: "100%" }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: "100%" }} transition={{ type: "spring", damping: 25 }} className="fixed inset-0 z-[4000] bg-[#06060a] flex flex-col">
        <div className="px-4 py-4 md:px-6 md:py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <BookOpen className="text-yellow-500" /> <span className="font-bold text-white text-lg">{t.pdfReader}</span>
          </div>
          <button onClick={() => setShowReader(false)} className="bg-red-500/10 text-red-400 px-4 py-2 rounded-lg font-bold hover:bg-red-500/20 transition">
            {t.close}
          </button>
        </div>
        <iframe src={readerUrl} className="flex-1 w-full border-none bg-white" title="Web Reader" />
      </motion.div>
    )}
  </AnimatePresence>

  <div className="min-h-screen flex flex-col bg-[#06060a] text-gray-200 overflow-x-hidden selection:bg-yellow-500/30">
    {partnerData && (
      <div className="w-full bg-blue-500/20 border-b border-blue-500/40 py-2 px-4 text-center flex items-center justify-center gap-2">
        <Handshake size={16} className="text-blue-400" />
        <span className="text-blue-300 text-xs md:text-sm font-bold tracking-wide uppercase">{t.partnerDiscountBanner(partnerData.discount_pct)}</span>
      </div>
    )}

    <nav className="sticky top-0 z-[500] px-4 py-4 md:px-8 bg-black/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center">
      <Link href="/brand" className="flex items-center gap-3 group">
        <div className="w-9 h-9 md:w-11 md:h-11 relative rounded-full p-0.5 border border-yellow-500/20 group-hover:border-yellow-500/50 transition overflow-hidden">
          <Image src="/logo.svg" alt="Vedoxa Brand Logo" fill priority className="object-contain" />
        </div>
        <span className="font-cinzel text-lg md:text-2xl font-black tracking-widest text-white">{t.brand}</span>
      </Link>

      <div className="flex items-center gap-3 md:gap-6">
        {!user && (
          <button onClick={() => setLang(lang === "EN" ? "HI" : "EN")} className="border border-white/20 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-white/10 transition">
            {lang === "EN" ? "हिन्दी" : "English"}
          </button>
        )}

        {user ? (
          <button onClick={() => setIsSidebarOpen(true)} className="flex items-center gap-2 bg-white/5 border border-white/10 px-2 py-1.5 md:px-3 rounded-full hover:bg-white/10 hover:border-yellow-500/30 transition">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-yellow-500/20 flex items-center justify-center overflow-hidden">
              {profile?.avatar_url ? <img src={profile.avatar_url} alt="profile" className="w-full h-full object-cover" /> : <UserCircle size={18} className="text-yellow-500" />}
            </div>
            <Menu size={18} className="text-gray-400 mr-1" />
          </button>
        ) : (
          <button onClick={() => setShowAuthModal(true)} className="btn-gold px-4 py-2 md:px-5 md:py-2.5 rounded-full text-xs md:text-sm flex items-center gap-2 font-bold">
            <UserCircle size={16} /> <span className="hidden sm:inline">{t.login}</span>
            <span className="sm:hidden">Login</span>
          </button>
        )}
      </div>
    </nav>

    <section className="relative px-4 pt-10 pb-8 md:pt-16 md:pb-12 text-center flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150vw] md:w-[800px] h-[300px] md:h-[600px] bg-yellow-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: "easeOut" }} className="font-cinzel text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-tight mb-4 max-w-4xl mx-auto">
        {heroHeadline}
      </motion.h1>
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-gray-400 max-w-2xl mx-auto text-sm md:text-lg px-2">
        {t.heroSub}
      </motion.p>
    </section>

    <section className="w-full max-w-4xl mx-auto px-4 py-2 md:py-4 flex flex-col items-center opacity-80">
      <div className="h-8 md:h-12 w-px bg-gradient-to-b from-yellow-500/0 via-yellow-500/50 to-yellow-500/0 animate-pulse" />
      <div className="border border-yellow-500/30 bg-yellow-500/5 px-6 py-2 rounded-full text-xs md:text-sm font-bold text-yellow-500 mt-2 tracking-widest uppercase text-center shadow-[0_0_15px_rgba(234,179,8,0.1)]">
        {t.journeyText}
      </div>
      <div className="h-4 md:h-8 w-px bg-gradient-to-b from-yellow-500/0 via-yellow-500/50 to-yellow-500/0 mt-2" />
    </section>

    <section className="px-4 py-8 md:py-12 w-full max-w-7xl mx-auto">
      <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="font-cinzel text-2xl md:text-4xl font-bold mb-10 md:mb-16 text-center">
        {t.premiumLib.split(" ")[0]} <span className="gold-text">{t.premiumLib.split(" ")[1]}</span>
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {loadingBooks ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="bg-white/5 border border-white/10 rounded-3xl p-6 h-[380px] flex flex-col gap-4 animate-pulse">
              <div className="w-full h-44 bg-white/10 rounded-2xl" />
              <div className="w-3/4 h-6 bg-white/10 rounded mt-2" />
              <div className="w-1/2 h-4 bg-white/10 rounded" />
              <div className="w-full h-12 bg-white/10 rounded-xl mt-auto" />
            </div>
          ))
        ) : (
          books.map((book, i) => {
            const isPurchased = purchasedBookIds.includes(book.id);
            const originalPrice = book.final_price;
            const discountFromPartner = partnerData ? Math.round(originalPrice * (partnerData.discount_pct / 100)) : 0;
            const displayPrice = Math.max(0, originalPrice - discountFromPartner);

            return (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                key={book.id}
                onClick={() => openBookDetails(book)}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 relative flex flex-col group cursor-pointer hover:bg-white/10 hover:border-yellow-500/30 transition-all duration-300 hover:-translate-y-2 shadow-lg"
              >
                {book.discount && book.discount > 0 && !isPurchased && !partnerData && (
                  <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-500 px-3 py-1 rounded-lg text-xs font-black border border-yellow-500/30 z-10">
                    {book.discount}% OFF
                  </div>
                )}
                {partnerData && !isPurchased && (
                  <div className="absolute top-4 right-4 bg-blue-500/20 text-blue-400 px-3 py-1 rounded-lg text-xs font-black border border-blue-500/40 z-10 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    -{partnerData.discount_pct}% (Partner)
                  </div>
                )}

                <div className="w-full h-44 mb-6">
                  {book.cover_path ? (
                    <div className="w-full h-full relative overflow-hidden rounded-xl bg-black/20">
                      <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${book.cover_path}`} alt={book.title} className="w-full h-full object-contain transition-transform duration-300 hover:scale-105" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 flex items-center justify-center rounded-xl border border-yellow-500/20">
                      <BookOpen size={48} className="text-yellow-500 opacity-80" />
                    </div>
                  )}
                </div>

                <h3 className="font-cinzel text-xl font-bold mb-2 text-white leading-snug">{book.title}</h3>
                <p className="text-gray-400 text-sm mb-6">by {book.author}</p>

                <div className="mt-auto flex justify-between items-end border-t border-white/10 pt-5">
                  <div>
                    {(book.discount || 0) > 0 && !isPurchased && !partnerData && <div className="text-xs text-gray-500 line-through mb-1">{money(book.base_price)}</div>}
                    {partnerData && !isPurchased && <div className="text-xs text-gray-500 line-through mb-1">{money(originalPrice)}</div>}
                    <div className={cx("text-2xl font-black", isPurchased ? "text-emerald-400" : "text-white")}>{isPurchased ? t.owned : money(displayPrice)}</div>
                  </div>

                  {isPurchased ? (
                    <button onClick={(e) => { e.stopPropagation(); openWebReader(book); }} className="px-5 py-2.5 rounded-xl text-sm bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-2 font-bold hover:bg-emerald-500/25 transition">
                      <CheckCircle2 size={16} /> {t.readNow}
                    </button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); setSelectedBook(book); setShowCheckout(true); setShowBookDetails(true); fetchReviews(book.id); }} className="btn-gold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 font-bold">
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

    <footer className="py-10 w-full flex flex-col items-center gap-6 border-t border-white/10 mt-auto bg-black/20">
      <Link href="/about" className="bg-white/5 border border-white/10 px-8 py-3 rounded-full text-sm font-bold text-gray-300 hover:bg-white/10 hover:text-yellow-500 hover:border-yellow-500/30 transition-all shadow-lg">
        About Us
      </Link>

      <div className="flex justify-center gap-4 md:gap-8 flex-wrap px-4 mb-4">
        <div className="flex items-center gap-2 text-gray-400 text-xs md:text-sm font-semibold bg-white/5 px-4 py-2 rounded-full border border-white/10">
          <ShieldCheck size={16} className="text-yellow-500" /> {t.secure}
        </div>
        <button onClick={() => (user ? setIsSidebarOpen(true) : setShowAuthModal(true))} className="flex items-center gap-2 text-gray-400 text-xs md:text-sm font-semibold bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 transition cursor-pointer">
          <Zap size={16} className="text-yellow-500" /> {t.instant}
        </button>
      </div>
    </footer>

    <div className="w-full bg-yellow-500/5 border-t border-yellow-500/20 overflow-hidden cursor-pointer py-1.5" onClick={() => window.location.reload()}>
      <div className="animate-scroll text-[10px] text-yellow-500/60 tracking-[0.2em] uppercase font-black flex w-max">
        {Array.from({ length: 12 }).map((_, idx) => (
          <span key={idx} className="px-8">Vedoxa Library</span>
        ))}
      </div>
    </div>

    <div className="w-full py-6 flex flex-col items-center bg-[#0a0a0d] border-b border-white/5">
      <p className="text-gray-500 text-[10px] font-bold mb-4 tracking-widest uppercase">Trusted By & Verified Secure</p>
      <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10 opacity-70 hover:opacity-100 transition-all duration-300">
        <div className="flex items-center gap-2 font-bold text-white tracking-wide text-sm">
          <svg viewBox="0 0 48 48" className="h-5 md:h-6 w-auto grayscale hover:grayscale-0 transition-all cursor-pointer">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
          Google Verified
        </div>

        <div className="flex items-center gap-1 font-bold text-white tracking-wide text-sm">
          <svg viewBox="0 0 100 24" className="h-4 md:h-5 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.44 19H7.13L16 2.776h5.36L12.44 19z" fill="#fff" />
            <path d="M2.57 18.99l9-16.216h5.21l-9 16.216H2.57z" fill="#3395FF" />
            <text x="24" y="17" fill="#fff" fontSize="16" fontWeight="bold" fontFamily="sans-serif">
              razorpay
            </text>
          </svg>
        </div>

        <div className="flex items-center gap-1.5 text-sm font-bold text-white">
          <ShieldCheck className="text-green-500" size={20} /> McAfee Secure
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold text-white">
          <Lock className="text-yellow-500" size={20} /> SSL 256-bit
        </div>
      </div>
    </div>

    <div className="fixed bottom-12 right-8 z-[4000] flex flex-col gap-4 items-center">
      <button onClick={handleShare} className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:scale-110 transition-all shadow-lg" title="Share Website">
        <Share2 size={20} />
      </button>
    </div>
  </div>
</>

); }
