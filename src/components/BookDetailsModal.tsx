// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Handshake, BookOpen, CheckCircle2, Lock, MessageSquare, 
  UserCircle, Star, Eye, ThumbsUp, ThumbsDown, ArrowLeft, Share2, Edit3, FileText, Tag 
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function BookDetailsModal({
  selectedBook,
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
  setShowCheckout
}) {
  const originalPrice = selectedBook.final_price;
  const pDiscount = partnerData ? Math.round(originalPrice * (partnerData.discount_pct / 100)) : 0;
  const displayPrice = originalPrice - pDiscount;

  // Social Stats State
  const [stats, setStats] = useState({ views: selectedBook.views || 0, likes: selectedBook.likes || 0 });
  const [userInteraction, setUserInteraction] = useState(null); 
  const [isUpdatingStat, setIsUpdatingStat] = useState(false);
  
  // State for limiting visible reviews
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(4);

  // NEW: Advanced States
  const [userRating, setUserRating] = useState(5); // User's input star rating
  const [helpfulVotes, setHelpfulVotes] = useState({}); // Stores Yes/No clicks for reviews
  const [isPhotoFullScreen, setIsPhotoFullScreen] = useState(false); // Fullscreen Photo State

  useEffect(() => {
    incrementView();
    if (user) fetchUserInteraction();
  }, [selectedBook.id, user]);

  const incrementView = async () => {
    const viewKey = `viewed_book_${selectedBook.id}`;
    if (!sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, 'true');
      const newViews = (selectedBook.views || 0) + 1;
      setStats(prev => ({ ...prev, views: newViews }));
      await supabase.from('books').update({ views: newViews }).eq('id', selectedBook.id);
    } else {
      setStats({ views: selectedBook.views || 0, likes: selectedBook.likes || 0 });
    }
  };

  const fetchUserInteraction = async () => {
    const { data } = await supabase.from('user_interactions')
      .select('interaction_type')
      .eq('book_id', selectedBook.id)
      .eq('user_id', user.id).single();
    
    if (data) setUserInteraction(data.interaction_type);
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
        await supabase.from('user_interactions').delete().eq('book_id', selectedBook.id).eq('user_id', user.id);
        
        if (type === 'like') {
          const newLikes = Math.max(0, stats.likes - 1);
          setStats(prev => ({ ...prev, likes: newLikes }));
          await supabase.from('books').update({ likes: newLikes }).eq('id', selectedBook.id);
        } else {
          const { data: bookData } = await supabase.from('books').select('dislikes').eq('id', selectedBook.id).single();
          await supabase.from('books').update({ dislikes: Math.max(0, (bookData?.dislikes || 0) - 1) }).eq('id', selectedBook.id);
        }
        setUserInteraction(null);
      } else {
        await supabase.from('user_interactions').upsert({
          user_id: user.id,
          book_id: selectedBook.id,
          interaction_type: type
        }, { onConflict: 'user_id, book_id' });

        if (type === 'like') {
          const newLikes = stats.likes + 1;
          setStats(prev => ({ ...prev, likes: newLikes }));
          await supabase.from('books').update({ likes: newLikes }).eq('id', selectedBook.id);
          
          if (userInteraction === 'dislike') {
            const { data: bookData } = await supabase.from('books').select('dislikes').eq('id', selectedBook.id).single();
            await supabase.from('books').update({ dislikes: Math.max(0, (bookData?.dislikes || 0) - 1) }).eq('id', selectedBook.id);
          }
        } else if (type === 'dislike') {
          if (userInteraction === 'like') {
            const newLikes = Math.max(0, stats.likes - 1);
            setStats(prev => ({ ...prev, likes: newLikes }));
            await supabase.from('books').update({ likes: newLikes }).eq('id', selectedBook.id);
          }
          const { data: bookData } = await supabase.from('books').select('dislikes').eq('id', selectedBook.id).single();
          await supabase.from('books').update({ dislikes: (bookData?.dislikes || 0) + 1 }).eq('id', selectedBook.id);
        }
        setUserInteraction(type);
      }
    } catch (error) {
      console.error("Interaction failed", error);
    }
    setIsUpdatingStat(false);
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
      navigator.clipboard.writeText(shareUrl);
      alert("Book link copied to clipboard! 📋");
    }
  };

  // Play Store Style Rating Calculations
  const totalReviewsCount = reviews.length;
  const ratingStats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalStars = 0;
  
  reviews.forEach(r => {
    const rStar = r.rating || 5; // Fallback to 5 if db doesn't have rating yet
    ratingStats[rStar] = (ratingStats[rStar] || 0) + 1;
    totalStars += rStar;
  });
  const avgRating = totalReviewsCount > 0 ? (totalStars / totalReviewsCount).toFixed(1) : "0.0";

  return (
    <>
      {/* Full Screen Photo Modal */}
      <AnimatePresence>
        {isPhotoFullScreen && selectedBook.cover_path && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setIsPhotoFullScreen(false)}
          >
            <button className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all">
              <X size={24} />
            </button>
            <img 
              src={`${supabaseUrl}/storage/v1/object/public/books-covers/${selectedBook.cover_path}`} 
              alt={selectedBook.title}
              className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-[0_0_50px_rgba(234,179,8,0.3)] cursor-default"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        key="book-details-modal"
        initial={{ opacity: 0, scale: 0.98 }} 
        animate={{ opacity: 1, scale: 1 }} 
        exit={{ opacity: 0, scale: 0.98 }} 
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="fixed inset-0 z-[800] bg-[#0a0a0d]"
      >
        {/* FIXED TOP BUTTONS (Inhe bahar rakha hai taaki scroll karne par gayab na hon) */}
        <motion.button 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            onClick={() => setShowBookDetails(false)} 
            className="absolute top-5 left-5 md:top-8 md:left-8 z-[900] p-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/20 transition-all shadow-lg flex items-center justify-center"
        >
            <ArrowLeft size={20} className="md:w-6 md:h-6" />
        </motion.button>

        <motion.button 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
            onClick={handleShareBook} 
            className="absolute top-5 right-5 md:top-8 md:right-8 z-[900] p-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-yellow-500/20 hover:text-yellow-500 hover:border-yellow-500/50 hover:scale-105 transition-all shadow-lg flex items-center justify-center"
            title="Share this book"
        >
            <Share2 size={18} className="md:w-5 md:h-5" />
        </motion.button>

        {/* SCROLLING CONTAINER */}
        <div className="w-full h-full overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex flex-col md:flex-row min-h-full w-full relative">
              
              {/* Book Info Section */}
              <div className="w-full md:w-1/2 p-5 pt-20 md:p-16 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 relative shrink-0">
                
                {partnerData && !purchasedBookIds.includes(selectedBook.id) && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="absolute top-20 md:top-8 left-1/2 md:left-8 -translate-x-1/2 md:translate-x-0 bg-blue-500/20 border border-blue-500/50 text-blue-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap mt-4 md:mt-0">
                    <Handshake size={16}/> Partner Code Active (-{partnerData.discount_pct}%)
                  </motion.div>
                )}

                <motion.div 
                  initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }}
                  className="w-full h-64 md:h-96 mb-6 mt-16 md:mt-0 relative cursor-pointer"
                  onClick={() => setIsPhotoFullScreen(true)}
                  title="Click to view full screen"
                >
                  <div className="absolute inset-0 bg-yellow-500/20 blur-[60px] rounded-full animate-pulse" />
                  
                  <motion.div 
                    animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-full h-full relative z-10 shadow-2xl rounded-3xl"
                  >
                  {selectedBook.cover_path ? (
                    <div className="w-full h-full relative overflow-hidden rounded-3xl">
                      <img 
                        src={`${supabaseUrl}/storage/v1/object/public/books-covers/${selectedBook.cover_path}`} 
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

                {/* MODERN SOCIAL STATS BAR */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center justify-center gap-6 mb-8 text-sm text-gray-400 font-bold bg-white/5 w-fit mx-auto px-6 py-2.5 rounded-full border border-white/10 shadow-inner">
                    <div className="flex items-center gap-2 text-blue-400">
                      <Eye size={18} /> {stats.views} Views
                    </div>
                    <div className="w-px h-4 bg-white/20"></div>
                    <button 
                      onClick={() => handleInteraction('like')} 
                      className={`flex items-center gap-2 transition ${userInteraction === 'like' ? 'text-yellow-500' : 'hover:text-white'}`}
                    >
                      <ThumbsUp size={18} className={userInteraction === 'like' ? 'fill-current' : ''} /> {stats.likes}
                    </button>
                    <button 
                      onClick={() => handleInteraction('dislike')} 
                      className={`flex items-center gap-2 transition ${userInteraction === 'dislike' ? 'text-red-500' : 'hover:text-white'}`}
                    >
                      <ThumbsDown size={18} className={userInteraction === 'dislike' ? 'fill-current' : ''} />
                    </button>
                </motion.div>

                <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="font-cinzel text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-lg text-center md:text-left">{selectedBook.title}</motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="text-xl text-yellow-500 mb-6 drop-shadow-md text-center md:text-left">by {selectedBook.author}</motion.p>
                
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="text-gray-400 leading-relaxed mb-6 text-sm md:text-base text-center md:text-left">
                  {selectedBook.description || "Immerse yourself in this profound work. Verified and 100% original content."}
                </motion.p>

                {/* PAGES AND TAGS */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
                    {selectedBook.pages && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                        <FileText size={14} className="text-yellow-500" /> {selectedBook.pages} Pages
                      </div>
                    )}
                    {selectedBook.tags && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag size={14} className="text-yellow-500" />
                        {(Array.isArray(selectedBook.tags) ? selectedBook.tags : selectedBook.tags.split(',')).map((tag, idx) => (
                          <span key={idx} className="text-[10px] uppercase tracking-wider font-bold text-gray-300 bg-white/5 px-2.5 py-1.5 rounded-full border border-white/10 hover:border-yellow-500/30 transition-colors">
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                </motion.div>

                {/* PRICE ADJUSTED TO SIDE PERFECTLY */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="mt-auto bg-white/5 p-5 rounded-2xl border border-white/10 shadow-lg flex flex-row items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-400 mb-1">Total Price</span>
                    <div className="flex items-center gap-3">
                      {partnerData && !purchasedBookIds.includes(selectedBook.id) && (
                        <span className="text-base text-gray-500 line-through">₹{originalPrice}</span>
                      )}
                      <span className="text-4xl font-black text-white">₹{displayPrice}</span>
                    </div>
                  </div>
                  
                  {purchasedBookIds.includes(selectedBook.id) ? (
                      <button onClick={() => { setShowBookDetails(false); openWebReader(selectedBook); }} className="px-6 py-3 md:px-8 md:py-4 rounded-xl text-base md:text-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex justify-center items-center gap-2 font-bold hover:bg-emerald-500/25 transition shadow-lg w-auto">
                        <CheckCircle2 size={20} /> {t.readNow}
                      </button>
                    ) : (
                      <button onClick={() => setShowCheckout(true)} className="px-6 py-3 md:px-8 md:py-4 rounded-xl text-base md:text-lg bg-gradient-to-r from-violet-500 to-purple-700 hover:from-violet-400 hover:to-purple-600 text-white flex justify-center items-center gap-2 font-black transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.45)] hover:shadow-[0_0_30px_rgba(139,92,246,0.65)] transform hover:-translate-y-1 w-auto">
                        <Lock size={18}/> Pay Now
                      </button>
                  )}
                </motion.div>
              </div>

              {/* Reviews Section - Play Store Style */}
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                className="w-full md:w-1/2 p-5 md:p-16 bg-[#0a0a0d] relative overflow-hidden shrink-0 flex flex-col"
              >
                <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 blur-[100px] pointer-events-none" />
                
                <div className="flex flex-col mb-8 relative z-10">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <MessageSquare className="text-yellow-500" /> Ratings and reviews
                  </h2>

                  {/* Play Store Style Rating Overview */}
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center">
                      <h1 className="text-6xl font-black text-white leading-none">{avgRating}</h1>
                      <div className="flex text-yellow-500 my-2 gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < Math.round(avgRating) ? "currentColor" : "none"} className={i < Math.round(avgRating) ? "" : "text-gray-600"} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{totalReviewsCount.toLocaleString()} reviews</span>
                    </div>

                    <div className="flex-1 flex flex-col gap-1.5 border-l border-white/10 pl-6">
                      {[5, 4, 3, 2, 1].map(star => {
                        const percentage = totalReviewsCount > 0 ? (ratingStats[star] / totalReviewsCount) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center gap-3 text-xs text-gray-400 font-bold">
                            <span className="w-2">{star}</span>
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {purchasedBookIds.includes(selectedBook.id) && (
                  <div className="bg-white/5 border border-white/10 p-5 rounded-xl mb-8 relative z-10 shadow-lg">
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-emerald-400"/> {userExistingReview ? "Update your review" : "Rate this book"}
                    </h3>
                    
                    {/* User Dynamic Star Rating Input */}
                    <div className="flex items-center gap-2 mb-4">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => setUserRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                          <Star size={24} fill={star <= userRating ? "#EAB308" : "none"} className={star <= userRating ? "text-yellow-500" : "text-gray-600"} />
                        </button>
                      ))}
                    </div>

                    <textarea 
                      value={newReviewText}
                      onChange={(e) => setNewReviewText(e.target.value)}
                      placeholder="Describe your experience (optional)"
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm outline-none focus:border-yellow-500 resize-none h-24 mb-4 transition"
                    />
                    
                    <button 
                      onClick={() => {
                        // Agar parent ko rating pass karni ho toh parent me update kar lena, filhal UI ready hai.
                        handleSubmitReview();
                      }} 
                      className={`btn-gold ml-auto flex items-center justify-center transition-transform hover:scale-105 px-6 py-2.5 rounded-lg text-sm font-bold gap-2`}
                    >
                      {userExistingReview ? <><Edit3 size={16} /> Update</> : "Post"}
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-5 relative z-10 pb-10">
                  {loadingReviews ? (
                      <div className="text-gray-500 text-sm animate-pulse">Loading reviews...</div>
                  ) : reviews.length > 0 ? (
                      <>
                        {reviews.slice(0, visibleReviewsCount).map(review => (
                          <div key={review.id} className="bg-transparent border-b border-white/5 pb-5 relative transition duration-300">
                            {review.user_id === user?.id && <div className="absolute top-0 right-0 text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">Your Review</div>}
                            
                            {/* Increased Gap for Name */}
                            <div className="flex justify-between items-start mb-4">
                              <div className="font-bold text-white text-base flex items-center gap-3">
                                <UserCircle size={32} className="text-gray-400 bg-white/5 rounded-full p-1"/>
                                {review.fake_author_name || review.profiles?.name || "Vedoxa Reader"}
                              </div>
                            </div>
                            
                            {/* Dynamic Star Rating Display with Gap */}
                            <div className="flex text-yellow-500 mb-3 gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} size={14} fill={i < (review.rating || 5) ? "currentColor" : "none"} className={i < (review.rating || 5) ? "" : "text-gray-600"}/>
                              ))}
                            </div>
                            
                            {/* Review Text */}
                            <p className="text-gray-300 text-sm leading-relaxed mb-4">{review.review_text}</p>

                            {/* "Was this review helpful?" Section */}
                            <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                              <span>Was this review helpful?</span>
                              <button 
                                onClick={() => setHelpfulVotes(prev => ({...prev, [review.id]: 'yes'}))}
                                className={`px-4 py-1.5 rounded-full border transition-all ${helpfulVotes[review.id] === 'yes' ? 'bg-white/20 border-white/50 text-white' : 'border-white/10 hover:bg-white/10 hover:text-white'}`}
                              >
                                Yes
                              </button>
                              <button 
                                onClick={() => setHelpfulVotes(prev => ({...prev, [review.id]: 'no'}))}
                                className={`px-4 py-1.5 rounded-full border transition-all ${helpfulVotes[review.id] === 'no' ? 'bg-white/20 border-white/50 text-white' : 'border-white/10 hover:bg-white/10 hover:text-white'}`}
                              >
                                No
                              </button>
                            </div>
                          </div>
                        ))}
                        
                        {reviews.length > visibleReviewsCount && (
                          <button 
                            onClick={() => setVisibleReviewsCount(prev => prev + 4)}
                            className="mt-2 py-3 w-full bg-white/5 hover:bg-white/10 text-yellow-500 text-sm font-bold rounded-xl border border-white/10 transition-colors flex items-center justify-center gap-2"
                          >
                            See all reviews
                          </button>
                        )}
                      </>
                  ) : (
                      <div className="text-center py-12 text-gray-500 border border-dashed border-white/10 rounded-2xl bg-white/5">
                        <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
                        <p>{t.noReviews}</p>
                      </div>
                  )}
                </div>
              </motion.div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
