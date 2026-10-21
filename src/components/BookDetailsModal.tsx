// @ts-nocheck
"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Handshake, BookOpen, CheckCircle2, Lock, MessageSquare,
  Star, Eye, ThumbsUp, ThumbsDown, ArrowLeft, Share2, Edit3, FileText, Tag, Download,
  Zap, Sparkles, ChevronDown
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

/* ---------- Small helpers (module level = no re-mount, no lag) ---------- */

const MODAL_CSS = `
@keyframes bdm-float { 0%,100% { transform: translate3d(0,0,0); } 50% { transform: translate3d(0,-8px,0); } }
@keyframes bdm-glow { 0%,100% { opacity: .55; transform: scale(1); } 50% { opacity: 1; transform: scale(1.07); } }
@keyframes bdm-shine { 0% { transform: translateX(-150%) skewX(-20deg); } 55%,100% { transform: translateX(350%) skewX(-20deg); } }
.bdm-float { animation: bdm-float 5s ease-in-out infinite; will-change: transform; }
.bdm-glow { animation: bdm-glow 2.2s ease-in-out infinite; will-change: transform, opacity; }
.bdm-shine { animation: bdm-shine 3.4s ease-in-out infinite; will-change: transform; }
.bdm-noscroll { scrollbar-width: none; -ms-overflow-style: none; }
.bdm-noscroll::-webkit-scrollbar { display: none; }
@media (prefers-reduced-motion: reduce) {
  .bdm-float, .bdm-glow, .bdm-shine { animation: none !important; }
}
`;

const AVATAR_GRADIENTS = [
  "from-violet-400 to-fuchsia-500",
  "from-amber-300 to-orange-500",
  "from-sky-400 to-indigo-500",
  "from-emerald-300 to-teal-500",
  "from-rose-300 to-pink-500",
];

const getGradient = (name = "") => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 997;
  return AVATAR_GRADIENTS[h % AVATAR_GRADIENTS.length];
};

const MOODS = {
  1: { emoji: "😞", label: "Poor" },
  2: { emoji: "😕", label: "Fair" },
  3: { emoji: "🙂", label: "Good" },
  4: { emoji: "😄", label: "Great" },
  5: { emoji: "🤩", label: "Loved it" },
};

const QUICK_TAGS = ["Well written", "Easy to understand", "Worth the price", "Must read"];

const formatDate = (d) => {
  if (!d) return "";
  const x = new Date(d);
  return isNaN(x.getTime())
    ? ""
    : x.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
};

function Stars({ value, size = 14 }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= value ? "text-amber-400 fill-amber-400" : "text-white/20"}
        />
      ))}
    </div>
  );
}

// Glowing buy button - glow uses only transform/opacity so it stays smooth on phones
function GlowBuyButton({ onClick, children, className = "", compact = false }) {
  return (
    <div className={`relative ${className}`}>
      <span
        aria-hidden="true"
        className="bdm-glow pointer-events-none absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 opacity-70 blur-xl"
      />
      <button
        onClick={onClick}
        className={`relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500 px-6 font-black text-white ring-1 ring-white/30 shadow-lg transition-transform duration-200 hover:-translate-y-0.5 active:scale-[0.97] ${
          compact ? "py-3.5 text-base" : "py-4 text-lg"
        }`}
      >
        <span
          aria-hidden="true"
          className="bdm-shine pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-white/30 blur-md"
        />
        <Zap size={compact ? 18 : 20} className="relative fill-white" />
        <span className="relative">{children}</span>
      </button>
    </div>
  );
}

export default function BookDetailsModal({
  selectedBook,
  onBookChange,
  partnerData,
  purchasedBookIds,
  t,
  user,
  userExistingReview,
  newReviewText,
  setNewReviewText,
  loadingReviews,
  reviews,
  handleSubmitReview,
  setShowBookDetails,
  openWebReader,
  setShowCheckout,
  theme, // props passed from VedoxaHome
  isDark // props passed from VedoxaHome
}) {
  // Safe values (no crash if parent sends undefined)
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const isPurchased = Array.isArray(purchasedBookIds) && purchasedBookIds.includes(selectedBook.id);

  const originalPrice = Number(selectedBook.final_price) || 0;
  const pDiscount = partnerData ? Math.round(originalPrice * (partnerData.discount_pct / 100)) : 0;
  const displayPrice = originalPrice - pDiscount;
  const showDiscount = !!partnerData && !isPurchased;

  // Social Stats State
  const [stats, setStats] = useState({ views: selectedBook.views || 0, likes: selectedBook.likes || 0 });
  const [userInteraction, setUserInteraction] = useState(null);
  const [isUpdatingStat, setIsUpdatingStat] = useState(false);

  // State for limiting visible reviews
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(4);

  // Advanced States
  const [userRating, setUserRating] = useState(userExistingReview?.rating || 5);
  const [helpfulVotes, setHelpfulVotes] = useState({});
  const [isPhotoFullScreen, setIsPhotoFullScreen] = useState(false);
  const [suggestedBooks, setSuggestedBooks] = useState([]);

  // New UI-only states
  const [ratingFilter, setRatingFilter] = useState("all");
  const [expandedReviews, setExpandedReviews] = useState({});
  const [descExpanded, setDescExpanded] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const [showStickyBuy, setShowStickyBuy] = useState(false);

  // Free Sample States
  const [showSampleReader, setShowSampleReader] = useState(false);
  const [samplePage, setSamplePage] = useState(0);
  const maxSamplePages = 3;

  // PDF Download State
  const [isDownloading, setIsDownloading] = useState(false);

  // Refs
  const scrollContainerRef = useRef(null);
  const reviewsRef = useRef(null);
  const ctaRef = useRef(null);

  // Lock background scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Jab bhi selectedBook change ho, scroll top par + UI states reset
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setVisibleReviewsCount(4);
    setRatingFilter("all");
    setExpandedReviews({});
    setDescExpanded(false);
    setCoverError(false);
    setSamplePage(0);
  }, [selectedBook.id]);

  useEffect(() => {
    setUserRating(userExistingReview?.rating || 5);
  }, [userExistingReview]);

  useEffect(() => {
    let cancelled = false;
    const isCancelled = () => cancelled;

    incrementView();
    if (user) {
      fetchUserInteraction(isCancelled);
    } else {
      setUserInteraction(null);
    }
    fetchSuggestedBooks(isCancelled);

    return () => {
      cancelled = true;
    };
  }, [selectedBook.id, user?.id]);

  // Show sticky mobile buy bar only when the main buy card is out of view
  useEffect(() => {
    if (isPurchased) {
      setShowStickyBuy(false);
      return;
    }
    if (typeof IntersectionObserver === "undefined" || !ctaRef.current) {
      setShowStickyBuy(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyBuy(!entry.isIntersecting),
      { root: scrollContainerRef.current, threshold: 0 }
    );
    observer.observe(ctaRef.current);
    return () => observer.disconnect();
  }, [isPurchased, selectedBook.id]);

  const incrementView = async () => {
    let alreadyViewed = false;
    const viewKey = `viewed_book_${selectedBook.id}`;
    try {
      alreadyViewed = !!sessionStorage.getItem(viewKey);
      if (!alreadyViewed) sessionStorage.setItem(viewKey, "true");
    } catch (e) {
      alreadyViewed = true; // storage blocked -> don't spam the DB
    }

    if (!alreadyViewed) {
      const newViews = (selectedBook.views || 0) + 1;
      setStats({ views: newViews, likes: selectedBook.likes || 0 });
      try {
        await supabase.from("books").update({ views: newViews }).eq("id", selectedBook.id);
      } catch (e) {
        console.error("View update failed", e);
      }
    } else {
      setStats({ views: selectedBook.views || 0, likes: selectedBook.likes || 0 });
    }
  };

  const fetchUserInteraction = async (isCancelled) => {
    try {
      const { data } = await supabase
        .from("user_interactions")
        .select("interaction_type")
        .eq("book_id", selectedBook.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (isCancelled && isCancelled()) return;
      setUserInteraction(data ? data.interaction_type : null);
    } catch (error) {
      console.error("Failed to fetch interaction", error);
    }
  };

  const fetchSuggestedBooks = async (isCancelled) => {
    try {
      const { data } = await supabase
        .from("books")
        .select("*")
        .neq("id", selectedBook.id)
        .limit(10);
      if (isCancelled && isCancelled()) return;
      if (data) setSuggestedBooks(data);
    } catch (error) {
      console.error("Failed to fetch suggestions", error);
    }
  };

  const handleInteraction = async (type) => {
    if (!user) {
      alert("Please login to react to this book.");
      return;
    }
    if (isUpdatingStat) return;
    setIsUpdatingStat(true);

    try {
      if (userInteraction === type) {
        await supabase.from("user_interactions").delete().eq("book_id", selectedBook.id).eq("user_id", user.id);

        if (type === "like") {
          const newLikes = Math.max(0, stats.likes - 1);
          setStats((prev) => ({ ...prev, likes: newLikes }));
          await supabase.from("books").update({ likes: newLikes }).eq("id", selectedBook.id);
        } else {
          const { data: bookData } = await supabase.from("books").select("dislikes").eq("id", selectedBook.id).single();
          await supabase.from("books").update({ dislikes: Math.max(0, (bookData?.dislikes || 0) - 1) }).eq("id", selectedBook.id);
        }
        setUserInteraction(null);
      } else {
        await supabase.from("user_interactions").upsert(
          {
            user_id: user.id,
            book_id: selectedBook.id,
            interaction_type: type,
          },
          { onConflict: "user_id,book_id" }
        );

        if (type === "like") {
          const newLikes = stats.likes + 1;
          setStats((prev) => ({ ...prev, likes: newLikes }));
          await supabase.from("books").update({ likes: newLikes }).eq("id", selectedBook.id);

          if (userInteraction === "dislike") {
            const { data: bookData } = await supabase.from("books").select("dislikes").eq("id", selectedBook.id).single();
            await supabase.from("books").update({ dislikes: Math.max(0, (bookData?.dislikes || 0) - 1) }).eq("id", selectedBook.id);
          }
        } else if (type === "dislike") {
          if (userInteraction === "like") {
            const newLikes = Math.max(0, stats.likes - 1);
            setStats((prev) => ({ ...prev, likes: newLikes }));
            await supabase.from("books").update({ likes: newLikes }).eq("id", selectedBook.id);
          }
          const { data: bookData } = await supabase.from("books").select("dislikes").eq("id", selectedBook.id).single();
          await supabase.from("books").update({ dislikes: (bookData?.dislikes || 0) + 1 }).eq("id", selectedBook.id);
        }
        setUserInteraction(type);
      }
    } catch (error) {
      console.error("Interaction failed", error);
    } finally {
      setIsUpdatingStat(false);
    }
  };

  const handleShareBook = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?book=${selectedBook.id}`;

    const shareData = {
      title: `${selectedBook.title} - Vedoxa`,
      text: `Check out this amazing book: ${selectedBook.title} by ${selectedBook.author}`,
      url: shareUrl,
    };

    if (navigator.share) {
      try { await navigator.share(shareData); } catch (err) {}
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Book link copied to clipboard! 📋");
      } catch (err) {
        alert(shareUrl);
      }
    }
  };

  // ===== Rating calculations =====
  const totalReviewsCount = safeReviews.length;
  const ratingStats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalStars = 0;

  safeReviews.forEach((r) => {
    const rStar = r.rating || 5;
    ratingStats[rStar] = (ratingStats[rStar] || 0) + 1;
    totalStars += rStar;
  });
  const avgNum = totalReviewsCount > 0 ? totalStars / totalReviewsCount : 0;
  const avgRating = avgNum.toFixed(1);

  const sentiment =
    avgNum >= 4.5 ? "Readers absolutely love this book"
    : avgNum >= 4 ? "Highly rated by readers"
    : avgNum >= 3 ? "Readers find this book good"
    : "Readers have mixed feelings";

  const filteredReviews =
    ratingFilter === "all" ? safeReviews : safeReviews.filter((r) => (r.rating || 5) === ratingFilter);

  const applyFilter = (f) => {
    setRatingFilter(f);
    setVisibleReviewsCount(4);
  };

  const scrollToReviews = () => {
    if (reviewsRef.current) reviewsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const mood = MOODS[userRating] || MOODS[5];

  const addQuickTag = (tag) => {
    const base = (newReviewText || "").trim();
    if (base.toLowerCase().includes(tag.toLowerCase())) return;
    setNewReviewText(base ? `${base}. ${tag}` : tag);
  };

  // ===== PDF DOWNLOAD LOGIC =====
  const handleDownloadPDF = async () => {
    if (isDownloading) return;

    try {
      if (!selectedBook.pdf_path) {
        alert("PDF file not available for this book yet.");
        return;
      }

      setIsDownloading(true);

      // Sirf invalid filename characters hatao (Hindi/Unicode titles safe rahenge)
      const cleanName = (selectedBook.title || "").replace(/[\\/:*?"<>|]/g, "_").trim() || "Vedoxa_Book";
      const fileName = `${cleanName}.pdf`;

      const { data, error } = await supabase.storage
        .from("books-pdfs")
        .createSignedUrl(selectedBook.pdf_path, 3600, {
          download: fileName,
        });

      if (error || !data?.signedUrl) {
        throw new Error("Could not generate secure download link.");
      }

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = data.signedUrl;

      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download PDF safely. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const coverUrl = selectedBook.cover_path
    ? `${supabaseUrl}/storage/v1/object/public/books-covers/${selectedBook.cover_path}`
    : null;

  const tagList = selectedBook.tags
    ? (Array.isArray(selectedBook.tags) ? selectedBook.tags : String(selectedBook.tags).split(","))
        .map((tg) => String(tg).trim())
        .filter(Boolean)
    : [];

  const description =
    selectedBook.description || "Immerse yourself in this profound work. Verified and 100% original content.";
  const descIsLong = description.length > 180;

  return (
    <>
      <style>{MODAL_CSS}</style>

      {/* Free Sample Book Reader Modal */}
      <AnimatePresence>
        {showSampleReader && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 md:p-8"
            onClick={() => setShowSampleReader(false)}
          >
            <button
              onClick={() => setShowSampleReader(false)}
              aria-label="Close sample"
              className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-3 text-white transition-all hover:bg-white/20"
              style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
            >
              <X size={22} />
            </button>

            <div
              onClick={(e) => e.stopPropagation()}
              className="relative flex h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-l-lg rounded-r-3xl bg-[#fbf7ef] shadow-[0_20px_80px_rgba(139,92,246,0.25)] md:h-[85vh]"
              style={{ perspective: "2000px" }}
            >
              <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-20 w-8 bg-gradient-to-r from-black/20 via-black/5 to-transparent" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={samplePage}
                  initial={{ rotateY: 90, opacity: 0, originX: 0 }}
                  animate={{ rotateY: 0, opacity: 1, originX: 0 }}
                  exit={{ rotateY: -90, opacity: 0, originX: 0 }}
                  transition={{ duration: 0.45, ease: "easeInOut" }}
                  className="relative flex flex-1 flex-col overflow-y-auto bg-gradient-to-br from-[#fbf7ef] to-[#f3ecdc] p-8 pb-20 pl-12 text-gray-900 md:p-12 md:pb-20 md:pl-16"
                >
                  {samplePage === 0 && (
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <h2 className="font-cinzel mb-4 text-3xl font-black text-black md:text-4xl">{selectedBook.title}</h2>
                      <p className="border-b border-gray-400 pb-2 text-lg italic text-gray-700 md:text-xl">by {selectedBook.author}</p>
                      <div className="mt-14 inline-block rounded-full border border-gray-400 px-4 py-1 text-xs font-bold text-gray-500">Free sample</div>
                    </div>
                  )}
                  {samplePage === 1 && (
                    <div className="flex-1">
                      <h3 className="mb-6 border-b border-gray-300 pb-2 text-2xl font-bold text-black">Chapter 1</h3>
                      <p className="mb-4 text-justify font-serif text-lg leading-relaxed text-gray-800 first-letter:float-left first-letter:mr-1 first-letter:text-5xl first-letter:font-bold">
                        {selectedBook.description || "The journey begins here. You are currently reading a special preview of this exclusive content..."}
                      </p>
                      <p className="mb-4 text-justify font-serif text-lg leading-relaxed text-gray-800">
                        In this opening section, the author sets the stage for an incredible journey. The themes explored here will resonate throughout the entire work, drawing you deeper into the narrative.
                      </p>
                    </div>
                  )}
                  {samplePage === 2 && (
                    <div className="flex-1">
                      <p className="mb-4 text-justify font-serif text-lg leading-relaxed text-gray-800">
                        As you delve deeper, the story begins to unfold, revealing complex ideas and intriguing concepts. Every page brings a new discovery, challenging your thoughts and captivating your imagination.
                      </p>
                      <div className="my-8 h-px w-full bg-gray-300"></div>
                      <p className="text-center font-serif italic text-gray-500">
                        ...The text continues in the full version.
                      </p>
                    </div>
                  )}
                  {samplePage === 3 && (
                    <div className="flex flex-1 flex-col items-center justify-center text-center">
                      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 shadow-inner">
                        <Lock size={36} className="text-gray-500" />
                      </div>
                      <h3 className="mb-4 text-2xl font-black text-black">End of free sample</h3>
                      <p className="mb-8 max-w-xs text-gray-600">You've reached the end of this preview. Purchase the book now to unlock the full experience instantly.</p>
                      <GlowBuyButton
                        className="w-full max-w-xs"
                        onClick={() => {
                          setShowSampleReader(false);
                          setShowCheckout(true);
                        }}
                      >
                        Buy Now
                      </GlowBuyButton>
                    </div>
                  )}

                  <div className="absolute bottom-5 left-0 right-0 text-center font-serif text-xs font-bold text-gray-400">
                    - {samplePage + 1} -
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="pointer-events-none absolute bottom-3 left-4 right-4 z-30 flex justify-between">
                <button
                  onClick={() => setSamplePage((prev) => Math.max(0, prev - 1))}
                  disabled={samplePage === 0}
                  aria-label="Previous page"
                  className={`pointer-events-auto rounded-full border border-gray-200 bg-white p-3 text-gray-800 shadow-lg transition-all ${samplePage === 0 ? "opacity-0" : "hover:scale-110 hover:bg-gray-50"}`}
                >
                  <ArrowLeft size={20} />
                </button>
                <button
                  onClick={() => setSamplePage((prev) => Math.min(maxSamplePages, prev + 1))}
                  disabled={samplePage === maxSamplePages}
                  aria-label="Next page"
                  className={`pointer-events-auto rounded-full border border-gray-200 bg-white p-3 text-gray-800 shadow-lg transition-all ${samplePage === maxSamplePages ? "opacity-0" : "hover:scale-110 hover:bg-gray-50"}`}
                >
                  <ArrowLeft size={20} className="rotate-180" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Screen Photo Modal */}
      <AnimatePresence>
        {isPhotoFullScreen && coverUrl && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex cursor-pointer items-center justify-center bg-black/90 p-4"
            onClick={() => setIsPhotoFullScreen(false)}
          >
            <button
              aria-label="Close photo"
              className="absolute right-4 rounded-full bg-white/10 p-3 text-white transition-all hover:bg-white/20"
              style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
            >
              <X size={22} />
            </button>
            <img
              src={coverUrl}
              alt={selectedBook.title}
              className="max-h-[90vh] max-w-full cursor-default rounded-2xl object-contain shadow-[0_0_60px_rgba(139,92,246,0.35)]"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MAIN MODAL ================= */}
      <motion.div
        key="book-details-modal"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="fixed inset-0 z-[800] bg-[#0c0a14]"
      >
        <div
          ref={scrollContainerRef}
          className="h-full w-full overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div className="relative flex min-h-full flex-col">

            {/* Soft ambient light (static gradient = zero lag) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 top-0 h-[560px]"
              style={{
                backgroundImage:
                  "radial-gradient(60% 60% at 15% 0%, rgba(139,92,246,0.22), transparent), radial-gradient(50% 50% at 92% 8%, rgba(236,72,153,0.12), transparent)",
              }}
            />

            {/* Floating top buttons (stay visible while scrolling) */}
            <div className="sticky top-0 z-[900] h-0 shrink-0">
              <button
                onClick={() => setShowBookDetails(false)}
                aria-label="Go back"
                className="absolute left-4 flex items-center justify-center rounded-full border border-white/10 bg-[#14111f]/90 p-2.5 text-white shadow-lg transition-all hover:bg-white/15 md:left-8"
                style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={handleShareBook}
                aria-label="Share this book"
                title="Share this book"
                className="absolute right-4 flex items-center justify-center rounded-full border border-white/10 bg-[#14111f]/90 p-2.5 text-white shadow-lg transition-all hover:scale-105 hover:border-amber-400/50 hover:text-amber-300 md:right-8"
                style={{ top: "calc(env(safe-area-inset-top, 0px) + 1rem)" }}
              >
                <Share2 size={18} />
              </button>
            </div>

            <div className="relative flex w-full flex-1 flex-col md:flex-row">

              {/* ============ LEFT: BOOK INFO ============ */}
              <div className="relative flex w-full shrink-0 flex-col justify-center border-b border-white/[0.06] px-5 pb-10 pt-20 md:w-1/2 md:border-b-0 md:border-r md:p-14 md:pt-16">

                {showDiscount && (
                  <div className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full border border-sky-400/30 bg-sky-400/10 px-4 py-2 text-sm font-bold text-sky-200 md:mx-0">
                    <Handshake size={16} /> Partner code active (-{partnerData.discount_pct}%)
                  </div>
                )}

                {/* Cover */}
                <div
                  className="relative mx-auto mb-7 w-44 cursor-pointer sm:w-52 md:w-60"
                  onClick={() => coverUrl && !coverError && setIsPhotoFullScreen(true)}
                  title="Tap to view full screen"
                >
                  <div className="absolute -inset-5 rounded-[2.5rem] bg-gradient-to-br from-violet-500/30 via-fuchsia-500/10 to-amber-400/20 blur-2xl" />
                  <div className="bdm-float relative">
                    <div className="relative aspect-[2/3] w-full overflow-hidden rounded-2xl bg-white/[0.04] shadow-[0_20px_50px_rgba(0,0,0,0.55)] ring-1 ring-white/15">
                      {coverUrl && !coverError ? (
                        <img
                          src={coverUrl}
                          alt={selectedBook.title}
                          decoding="async"
                          onError={() => setCoverError(true)}
                          className="h-full w-full object-contain transition-transform duration-300 hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-500/15 to-amber-400/10">
                          <BookOpen size={56} className="text-amber-400/80" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Views / likes */}
                <div className="mx-auto mb-7 flex w-fit items-center gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1.5 text-sm font-bold text-gray-300">
                  <div className="flex items-center gap-2 px-3.5 py-1.5 text-sky-300">
                    <Eye size={17} /> {stats.views}
                  </div>
                  <div className="h-4 w-px bg-white/15" />
                  <button
                    onClick={() => handleInteraction("like")}
                    aria-label="Like this book"
                    className={`flex items-center gap-2 rounded-full px-3.5 py-1.5 transition active:scale-95 ${userInteraction === "like" ? "bg-amber-400/15 text-amber-300" : "hover:bg-white/10 hover:text-white"}`}
                  >
                    <ThumbsUp size={17} className={userInteraction === "like" ? "fill-current" : ""} /> {stats.likes}
                  </button>
                  <button
                    onClick={() => handleInteraction("dislike")}
                    aria-label="Dislike this book"
                    className={`flex items-center rounded-full px-3.5 py-1.5 transition active:scale-95 ${userInteraction === "dislike" ? "bg-rose-500/15 text-rose-300" : "hover:bg-white/10 hover:text-white"}`}
                  >
                    <ThumbsDown size={17} className={userInteraction === "dislike" ? "fill-current" : ""} />
                  </button>
                </div>

                {/* Title + author */}
                <h1 className="font-cinzel mb-3 text-center text-3xl font-black leading-tight text-white md:text-left md:text-5xl">
                  {selectedBook.title}
                </h1>
                <p className="mb-4 text-center text-lg text-amber-300 md:text-left md:text-xl">by {selectedBook.author}</p>

                {/* Quick rating link */}
                {totalReviewsCount > 0 && (
                  <button
                    onClick={scrollToReviews}
                    className="mx-auto mb-5 flex w-fit items-center gap-2 rounded-full bg-white/[0.04] px-3.5 py-1.5 text-sm text-gray-300 transition hover:bg-white/10 md:mx-0"
                  >
                    <Star size={15} className="fill-amber-400 text-amber-400" />
                    <span className="font-bold text-white">{avgRating}</span>
                    <span className="text-gray-400">({totalReviewsCount} reviews)</span>
                  </button>
                )}

                {/* Description */}
                <div className="mb-6 text-center md:text-left">
                  <p className={`text-sm leading-relaxed text-gray-400 md:text-base ${!descExpanded && descIsLong ? "line-clamp-4" : ""}`}>
                    {description}
                  </p>
                  {descIsLong && (
                    <button
                      onClick={() => setDescExpanded((v) => !v)}
                      className="mt-1.5 text-sm font-bold text-amber-300 hover:text-amber-200"
                    >
                      {descExpanded ? "Show less" : "Read more"}
                    </button>
                  )}
                </div>

                {/* Meta chips */}
                {(selectedBook.pages || tagList.length > 0) && (
                  <div className="mb-8 flex flex-wrap items-center justify-center gap-2.5 md:justify-start">
                    {selectedBook.pages && (
                      <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-gray-300">
                        <FileText size={14} className="text-amber-400" /> {selectedBook.pages} Pages
                      </div>
                    )}
                    {tagList.length > 0 && (
                      <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                        <Tag size={14} className="text-amber-400" />
                        {tagList.map((tag, idx) => (
                          <span key={idx} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[11px] font-bold text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* PRICE AND ACTION BUTTONS */}
                <div className="mt-auto rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.07] to-white/[0.025] p-5 shadow-xl shadow-black/30">
                  <div className="mb-5 flex items-end justify-between gap-3">
                    <div>
                      <span className="mb-1 block text-sm font-semibold text-gray-400">Total price</span>
                      <div className="flex items-baseline gap-2.5">
                        <span className="text-4xl font-black text-white">₹{displayPrice}</span>
                        {showDiscount && (
                          <span className="text-base text-gray-500 line-through">₹{originalPrice}</span>
                        )}
                      </div>
                    </div>
                    {showDiscount && pDiscount > 0 && (
                      <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 text-xs font-bold text-emerald-300">
                        You save ₹{pDiscount}
                      </span>
                    )}
                  </div>

                  {isPurchased ? (
                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => { setShowBookDetails(false); openWebReader(selectedBook); }}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-500/25 to-teal-500/20 px-6 py-4 text-lg font-bold text-emerald-200 shadow-[0_0_24px_rgba(16,185,129,0.2)] transition active:scale-[0.97] hover:from-emerald-500/35"
                      >
                        <CheckCircle2 size={20} /> {t?.readNow || "Read Now"}
                      </button>
                      <button
                        onClick={handleDownloadPDF}
                        disabled={isDownloading}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-400/30 bg-sky-400/10 px-5 py-3.5 text-base font-bold text-sky-300 transition hover:bg-sky-400/20 active:scale-[0.98] disabled:opacity-50"
                      >
                        <Download size={18} /> {isDownloading ? "Downloading..." : "Download PDF"}
                      </button>
                    </div>
                  ) : (
                    <>
                      <div ref={ctaRef}>
                        <GlowBuyButton onClick={() => setShowCheckout(true)}>Buy Now</GlowBuyButton>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs font-semibold text-gray-400">
                        <span className="flex items-center gap-1.5"><Zap size={13} className="text-amber-400" /> Instant access</span>
                        <span className="flex items-center gap-1.5"><BookOpen size={13} className="text-amber-400" /> Read online</span>
                        <span className="flex items-center gap-1.5"><Download size={13} className="text-amber-400" /> PDF download</span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-2.5">
                        <button
                          onClick={() => {
                            setSamplePage(0);
                            setShowSampleReader(true);
                          }}
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-3 text-sm font-bold text-emerald-300 transition hover:bg-emerald-400/20 active:scale-[0.97]"
                        >
                          <BookOpen size={15} /> Free sample
                        </button>
                        <button
                          onClick={() => setShowCheckout(true)}
                          className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-sm font-bold text-gray-400 transition hover:bg-white/10 active:scale-[0.97]"
                        >
                          <Lock size={15} /> Download PDF
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* ============ RIGHT: RATINGS & REVIEWS ============ */}
              <section
                ref={reviewsRef}
                className="relative flex w-full shrink-0 scroll-mt-4 flex-col px-5 pb-6 pt-10 md:w-1/2 md:p-14"
              >
                <h2 className="mb-5 flex items-center gap-2.5 text-xl font-extrabold text-white md:text-2xl">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400/10 text-amber-400">
                    <MessageSquare size={18} />
                  </span>
                  Ratings and reviews
                </h2>

                {/* Summary card */}
                <div className="mb-5 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex items-center gap-5">
                    <div className="flex shrink-0 flex-col items-center">
                      <span className="bg-gradient-to-b from-white to-amber-200 bg-clip-text text-5xl font-black leading-none text-transparent">
                        {avgRating}
                      </span>
                      <div className="my-2"><Stars value={Math.round(avgNum)} /></div>
                      <span className="text-[11px] text-gray-400">{totalReviewsCount.toLocaleString()} reviews</span>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-1.5 border-l border-white/10 pl-5">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = ratingStats[star] || 0;
                        const percentage = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
                        const dimmed = ratingFilter !== "all" && ratingFilter !== star;
                        return (
                          <button
                            key={star}
                            onClick={() => applyFilter(ratingFilter === star ? "all" : star)}
                            aria-label={`Show ${star} star reviews`}
                            className={`flex items-center gap-2.5 text-xs font-bold text-gray-400 transition-opacity ${dimmed ? "opacity-40" : "opacity-100"}`}
                          >
                            <span className="w-2.5 text-right">{star}</span>
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400"
                              />
                            </div>
                            <span className="w-5 text-right text-[11px] font-semibold text-gray-500">{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {totalReviewsCount > 0 && (
                    <p className="mt-4 flex items-center gap-2 rounded-xl bg-white/[0.04] px-3 py-2 text-xs text-gray-300">
                      <Sparkles size={14} className="shrink-0 text-amber-400" /> {sentiment}
                    </p>
                  )}
                </div>

                {/* Filter chips */}
                {totalReviewsCount > 0 && (
                  <div className="bdm-noscroll -mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
                    {["all", 5, 4, 3, 2, 1].map((f) => {
                      const active = ratingFilter === f;
                      const count = f === "all" ? totalReviewsCount : ratingStats[f] || 0;
                      return (
                        <button
                          key={f}
                          onClick={() => applyFilter(f)}
                          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
                            active
                              ? "border-amber-400 bg-amber-400 text-black"
                              : "border-white/10 bg-white/[0.04] text-gray-300 hover:bg-white/10"
                          }`}
                        >
                          {f === "all" ? "All" : (<>{f}<Star size={12} className="fill-current" /></>)}
                          <span className="opacity-60">{count}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Write a review (only buyers) */}
                {isPurchased && (
                  <div className="mb-6 rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/[0.14] via-white/[0.03] to-transparent p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <h3 className="flex items-center gap-2 text-sm font-bold text-white">
                        <CheckCircle2 size={18} className="text-emerald-400" />
                        {userExistingReview ? "Update your review" : "Rate this book"}
                      </h3>
                      <motion.span
                        key={userRating}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-1.5 text-sm font-bold text-amber-300"
                      >
                        <span className="text-2xl leading-none">{mood.emoji}</span> {mood.label}
                      </motion.span>
                    </div>

                    <div className="mb-4 flex items-center justify-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setUserRating(star)}
                          aria-label={`Rate ${star} stars`}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none active:scale-90"
                        >
                          <Star
                            size={34}
                            className={star <= userRating ? "fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.45)]" : "text-white/20"}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="bdm-noscroll -mx-1 mb-3 flex gap-2 overflow-x-auto px-1 pb-1">
                      {QUICK_TAGS.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => addQuickTag(tag)}
                          className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs font-semibold text-gray-300 transition hover:border-amber-400/40 hover:text-amber-200"
                        >
                          + {tag}
                        </button>
                      ))}
                    </div>

                    <textarea
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Describe your experience (optional)"
                      className="mb-4 h-24 w-full resize-none rounded-2xl border border-white/10 bg-black/30 p-3.5 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-amber-400/60"
                    />

                    <button
                      onClick={() => {
                        handleSubmitReview(userRating);
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-orange-400 px-6 py-3 text-sm font-black text-black shadow-[0_8px_24px_rgba(251,191,36,0.25)] transition active:scale-[0.97] sm:ml-auto sm:w-auto"
                    >
                      {userExistingReview ? (<><Edit3 size={16} /> Update review</>) : "Post review"}
                    </button>
                  </div>
                )}

                {/* Review list */}
                <div className="relative flex flex-col gap-3.5 pb-8">
                  {loadingReviews ? (
                    <div className="animate-pulse text-sm text-gray-500">Loading reviews...</div>
                  ) : filteredReviews.length > 0 ? (
                    <>
                      {filteredReviews.slice(0, visibleReviewsCount).map((review) => {
                        const name = review.fake_author_name || review.profiles?.name || "Vedoxa Reader";
                        const rating = review.rating || 5;
                        const text = review.review_text || "";
                        const isLong = text.length > 160;
                        const expanded = !!expandedReviews[review.id];
                        const mine = !!user && review.user_id === user.id;
                        const date = formatDate(review.created_at);

                        return (
                          <div
                            key={review.id}
                            className={`rounded-2xl border p-4 ${mine ? "border-amber-400/30 bg-amber-400/[0.05]" : "border-white/[0.07] bg-white/[0.035]"}`}
                          >
                            <div className="mb-3 flex items-center gap-3">
                              <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${getGradient(name)} text-base font-black text-white shadow-md`}>
                                {name.trim().charAt(0).toUpperCase() || "V"}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-bold text-white">{name}</div>
                                <div className="mt-0.5 flex items-center gap-2">
                                  <Stars value={rating} size={13} />
                                  {date && <span className="text-[11px] text-gray-500">{date}</span>}
                                </div>
                              </div>
                              {mine && (
                                <span className="shrink-0 rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-bold text-amber-300">
                                  Your review
                                </span>
                              )}
                            </div>

                            {text && (
                              <>
                                <p className={`whitespace-pre-line break-words text-sm leading-relaxed text-gray-300 ${!expanded && isLong ? "line-clamp-4" : ""}`}>
                                  {text}
                                </p>
                                {isLong && (
                                  <button
                                    onClick={() => setExpandedReviews((prev) => ({ ...prev, [review.id]: !prev[review.id] }))}
                                    className="mt-1 text-xs font-bold text-amber-300 hover:text-amber-200"
                                  >
                                    {expanded ? "Show less" : "Read more"}
                                  </button>
                                )}
                              </>
                            )}

                            <div className="mt-3.5 flex items-center gap-2 text-xs text-gray-400">
                              <span className="mr-1">Was this helpful?</span>
                              <button
                                onClick={() => setHelpfulVotes((prev) => ({ ...prev, [review.id]: "yes" }))}
                                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-all active:scale-95 ${helpfulVotes[review.id] === "yes" ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-200" : "border-white/10 hover:bg-white/10 hover:text-white"}`}
                              >
                                <ThumbsUp size={12} /> Yes
                              </button>
                              <button
                                onClick={() => setHelpfulVotes((prev) => ({ ...prev, [review.id]: "no" }))}
                                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-all active:scale-95 ${helpfulVotes[review.id] === "no" ? "border-rose-400/50 bg-rose-400/15 text-rose-200" : "border-white/10 hover:bg-white/10 hover:text-white"}`}
                              >
                                <ThumbsDown size={12} /> No
                              </button>
                            </div>
                          </div>
                        );
                      })}

                      {filteredReviews.length > visibleReviewsCount && (
                        <button
                          onClick={() => setVisibleReviewsCount((prev) => prev + 4)}
                          className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] py-3 text-sm font-bold text-amber-300 transition-colors hover:bg-white/10"
                        >
                          Show more reviews <ChevronDown size={16} />
                        </button>
                      )}
                    </>
                  ) : totalReviewsCount > 0 ? (
                    <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] py-10 text-center text-sm text-gray-500">
                      No {ratingFilter}-star reviews yet.
                      <button onClick={() => applyFilter("all")} className="mt-2 block w-full font-bold text-amber-300">
                        Show all reviews
                      </button>
                    </div>
                  ) : (
                    <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] py-12 text-center text-gray-500">
                      <MessageSquare className="mx-auto mb-3 h-8 w-8 opacity-30" />
                      <p>{t?.noReviews || "No reviews yet."}</p>
                    </div>
                  )}
                </div>
              </section>
            </div>

            {/* ============ SUGGESTED BOOKS ============ */}
            {suggestedBooks.length > 0 && (
              <div className="relative z-10 w-full border-t border-white/[0.06] bg-[#08070d] p-6 pb-14 md:p-12">
                <h3 className="mb-6 flex items-center gap-2.5 text-xl font-black text-white md:text-2xl">
                  <BookOpen className="text-amber-400" size={24} />
                  More books you might like
                </h3>

                <div className="bdm-noscroll flex snap-x gap-4 overflow-x-auto pb-4 md:gap-6">
                  {suggestedBooks.map((book) => (
                    <div
                      key={book.id}
                      className="group w-32 flex-none cursor-pointer snap-start md:w-40"
                      onClick={() => onBookChange && onBookChange(book)}
                    >
                      <div className="relative mb-3 aspect-[2/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg transition-all duration-300 group-hover:border-amber-400/50 group-hover:shadow-[0_0_20px_rgba(251,191,36,0.2)]">
                        {book.cover_path ? (
                          <img
                            src={`${supabaseUrl}/storage/v1/object/public/books-covers/${book.cover_path}`}
                            alt={book.title}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <BookOpen size={24} className="text-gray-600" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/90 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <span className="text-xs font-bold text-amber-300">View book</span>
                        </div>
                      </div>
                      <h4 className="line-clamp-1 text-sm font-bold text-gray-200 transition-colors group-hover:text-amber-300" title={book.title}>{book.title}</h4>
                      <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">{book.author}</p>
                      <div className="mt-1.5 text-sm font-black text-white">
                        ₹{book.final_price || book.price || 0}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============ STICKY BUY BAR (mobile) ============ */}
            <AnimatePresence>
              {!isPurchased && showStickyBuy && (
                <motion.div
                  key="sticky-buy"
                  initial={{ y: 80, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 80, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="sticky bottom-0 z-[850] flex items-center gap-3 border-t border-white/10 bg-[#0d0b16]/95 px-4 pt-3 md:hidden"
                  style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 0.75rem)" }}
                >
                  <div className="min-w-0">
                    <span className="block text-[11px] font-semibold text-gray-400">Total price</span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-black text-white">₹{displayPrice}</span>
                      {showDiscount && <span className="text-xs text-gray-500 line-through">₹{originalPrice}</span>}
                    </div>
                  </div>
                  <GlowBuyButton compact className="flex-1" onClick={() => setShowCheckout(true)}>
                    Buy Now
                  </GlowBuyButton>
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
      </motion.div>
    </>
  );
}
