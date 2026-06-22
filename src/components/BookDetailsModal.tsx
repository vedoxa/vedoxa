// @ts-nocheck
"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
  const [userInteraction, setUserInteraction] = useState(null); // 'like', 'dislike', or null
  const [isUpdatingStat, setIsUpdatingStat] = useState(false);

  useEffect(() => {
    // 1. Increment View Count
    incrementView();
    // 2. Fetch User's previous like/dislike status
    if (user) fetchUserInteraction();
  }, [selectedBook.id, user]);

  const incrementView = async () => {
    // Session storage taaki ek session me ek hi view count ho
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
        // User clicked the same button again to remove their reaction
        await supabase.from('user_interactions').delete().eq('book_id', selectedBook.id).eq('user_id', user.id);
        
        if (type === 'like') {
          const newLikes = Math.max(0, stats.likes - 1);
          setStats(prev => ({ ...prev, likes: newLikes }));
          await supabase.from('books').update({ likes: newLikes }).eq('id', selectedBook.id);
        } else {
          // Decrement dislikes in DB
          const { data: bookData } = await supabase.from('books').select('dislikes').eq('id', selectedBook.id).single();
          await supabase.from('books').update({ dislikes: Math.max(0, (bookData?.dislikes || 0) - 1) }).eq('id', selectedBook.id);
        }
        setUserInteraction(null);
      } else {
        // User is adding a new reaction or changing it
        await supabase.from('user_interactions').upsert({
          user_id: user.id,
          book_id: selectedBook.id,
          interaction_type: type
        }, { onConflict: 'user_id, book_id' });

        if (type === 'like') {
          const newLikes = stats.likes + 1;
          setStats(prev => ({ ...prev, likes: newLikes }));
          await supabase.from('books').update({ likes: newLikes }).eq('id', selectedBook.id);
          
          // If they changed from dislike to like, reduce dislikes
          if (userInteraction === 'dislike') {
            const { data: bookData } = await supabase.from('books').select('dislikes').eq('id', selectedBook.id).single();
            await supabase.from('books').update({ dislikes: Math.max(0, (bookData?.dislikes || 0) - 1) }).eq('id', selectedBook.id);
          }
        } else if (type === 'dislike') {
          // They disliked. If they previously liked, reduce likes.
          if (userInteraction === 'like') {
            const newLikes = Math.max(0, stats.likes - 1);
            setStats(prev => ({ ...prev, likes: newLikes }));
            await supabase.from('books').update({ likes: newLikes }).eq('id', selectedBook.id);
          }
          // Increment dislikes in DB
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

  // NEW DIRECT BOOK SHARE LOGIC
  const handleShareBook = async () => {
    // Generate direct link with the book ID
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

  return (
    <motion.div 
      key="book-details-modal"
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.98 }} 
      transition={{ duration: 0.15, ease: "easeOut" }}
      className="fixed inset-0 z-[800] bg-[#0a0a0d] overflow-y-auto"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="flex flex-col md:flex-row min-h-full w-full relative">
          
          {/* TOP LEFT ARROW (REPLACED CROSS) */}
          <motion.button 
             initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
             onClick={() => setShowBookDetails(false)} 
             className="fixed top-5 left-5 md:top-8 md:left-8 z-[850] p-2 md:p-2.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-white/20 transition-all shadow-lg flex items-center justify-center"
          >
             <ArrowLeft size={20} className="md:w-6 md:h-6" />
          </motion.button>

          {/* TOP RIGHT SHARE BUTTON */}
          <motion.button 
             initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
             onClick={handleShareBook} 
             className="fixed top-5 right-5 md:top-8 md:right-8 z-[850] p-2 md:p-2.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-white hover:bg-yellow-500/20 hover:text-yellow-500 hover:border-yellow-500/50 hover:scale-105 transition-all shadow-lg flex items-center justify-center"
             title="Share this book"
          >
             <Share2 size={18} className="md:w-5 md:h-5" />
          </motion.button>

          {/* Book Info Section */}
          <div className="w-full md:w-1/2 p-5 md:p-16 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 relative shrink-0">
             
             {partnerData && !purchasedBookIds.includes(selectedBook.id) && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="absolute top-20 md:top-8 left-1/2 md:left-8 -translate-x-1/2 md:translate-x-0 bg-blue-500/20 border border-blue-500/50 text-blue-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 whitespace-nowrap">
                 <Handshake size={16}/> Partner Code Active (-{partnerData.discount_pct}%)
               </motion.div>
             )}

             <motion.div 
               initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }}
               className="w-full h-64 md:h-96 mb-6 mt-16 md:mt-0 relative"
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

             {/* PAGES AND TAGS DETAILS UI ADDED HERE */}
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

             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex flex-col md:flex-row items-center gap-6 mt-auto">
               <div className="text-center md:text-left">
                 {partnerData && !purchasedBookIds.includes(selectedBook.id) && (
                   <span className="text-lg text-gray-500 line-through mr-3">₹{originalPrice}</span>
                 )}
                 <span className="text-4xl font-black text-white">₹{displayPrice}</span>
               </div>
               {purchasedBookIds.includes(selectedBook.id) ? (
                  <button onClick={() => { setShowBookDetails(false); openWebReader(selectedBook); }} className="w-full md:flex-1 px-8 py-4 rounded-2xl text-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex justify-center items-center gap-3 font-bold hover:bg-emerald-500/25 transition shadow-lg">
                    <CheckCircle2 size={24} /> {t.readNow}
                  </button>
                ) : (
                  <button onClick={() => setShowCheckout(true)} className="w-full md:flex-1 bg-gradient-to-r from-violet-500 to-purple-700 hover:from-violet-400 hover:to-purple-600 text-white px-8 py-4 rounded-2xl text-lg flex justify-center items-center gap-3 font-black transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.45)] hover:shadow-[0_0_30px_rgba(139,92,246,0.65)] transform hover:-translate-y-1">
                    <Lock size={20}/> Pay Now
                  </button>
               )}
             </motion.div>
          </div>

          {/* Reviews Section */}
          <motion.div 
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
             className="w-full md:w-1/2 p-5 md:p-16 bg-[#0a0a0d] relative overflow-hidden shrink-0 flex flex-col"
          >
             <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 blur-[100px] pointer-events-none" />
             
             <div className="flex items-center gap-3 mb-8 relative z-10">
               <MessageSquare className="text-yellow-500" />
               <h2 className="text-2xl font-bold text-white">{t.reviews}</h2>
             </div>

             {purchasedBookIds.includes(selectedBook.id) && (
               <div className="bg-white/5 border border-white/10 p-4 rounded-xl mb-6 relative z-10 shadow-lg">
                 <h3 className="text-xs font-bold text-emerald-400 mb-2 flex items-center gap-2">
                   <CheckCircle2 size={16}/> {userExistingReview ? "Update your review" : "You own this book"}
                 </h3>
                 <textarea 
                   value={newReviewText}
                   onChange={(e) => setNewReviewText(e.target.value)}
                   placeholder={t.writeReview}
                   className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-xs outline-none focus:border-yellow-500 resize-none h-20 mb-3 transition"
                 />
                 
                 {/* SMALL PENCIL BUTTON REPLACED TEXT HERE */}
                 <button 
                   onClick={handleSubmitReview} 
                   className={`btn-gold ml-auto flex items-center justify-center transition-transform hover:scale-105 ${userExistingReview ? 'p-2.5 rounded-full' : 'px-5 py-2 rounded-lg text-xs font-bold gap-2'}`}
                   title={userExistingReview ? "Update Review" : "Submit Review"}
                 >
                   {userExistingReview ? <Edit3 size={16} /> : t.submitReview}
                 </button>
               </div>
             )}

             <div className="flex flex-col gap-3 relative z-10">
               {loadingReviews ? (
                  <div className="text-gray-500 text-sm animate-pulse">Loading reviews...</div>
               ) : reviews.length > 0 ? (
                  reviews.map(review => (
                    <div key={review.id} className="bg-white/5 border border-white/5 p-4 rounded-xl relative hover:bg-white/10 transition duration-300">
                      {review.user_id === user?.id && <div className="absolute top-3 right-3 text-[10px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full">Your Review</div>}
                      <div className="flex justify-between items-start mb-2">
                         <div className="font-bold text-white text-sm flex items-center gap-2">
                           <UserCircle size={16} className="text-gray-400"/>
                           {review.profiles?.name || "Vedoxa Reader"}
                         </div>
                      </div>
                      <div className="flex text-yellow-500 mb-2 gap-0.5"><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/><Star size={12} fill="currentColor"/></div>
                      <p className="text-gray-300 text-xs leading-relaxed">{review.review_text}</p>
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
      </div>
    </motion.div>
  );
}
