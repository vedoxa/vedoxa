// @ts-nocheck
"use client";
import { motion } from "framer-motion";
import { X, Handshake, BookOpen, CheckCircle2, Lock, MessageSquare, UserCircle, Star } from "lucide-react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";

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
          <motion.button 
             initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
             onClick={() => setShowBookDetails(false)} 
             className="fixed top-6 right-6 z-[850] p-3 bg-white/10 rounded-full text-white hover:bg-red-500/80 transition-colors shadow-lg"
          >
             <X size={24} />
          </motion.button>

          {/* Book Info Section */}
          <div className="w-full md:w-1/2 p-5 md:p-16 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 relative shrink-0">
             
             {partnerData && !purchasedBookIds.includes(selectedBook.id) && (
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="absolute top-8 left-8 bg-blue-500/20 border border-blue-500/50 text-blue-300 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                 <Handshake size={16}/> Partner Code Active (-{partnerData.discount_pct}%)
               </motion.div>
             )}

             <motion.div 
               initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.2 }}
               className="w-full h-64 md:h-96 mb-8 mt-10 md:mt-0 relative"
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

             <motion.h1 initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="font-cinzel text-3xl md:text-5xl font-black text-white mb-4 drop-shadow-lg">{selectedBook.title}</motion.h1>
             <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="text-xl text-yellow-500 mb-6 drop-shadow-md">by {selectedBook.author}</motion.p>
             <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="text-gray-400 leading-relaxed mb-8 text-sm md:text-base">
               {selectedBook.description || "Immerse yourself in this profound work. Verified and 100% original content."}
             </motion.p>

             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }} className="flex items-center gap-6 mt-auto">
               <div>
                 {partnerData && !purchasedBookIds.includes(selectedBook.id) && (
                   <span className="text-lg text-gray-500 line-through mr-3">₹{originalPrice}</span>
                 )}
                 <span className="text-4xl font-black text-white">₹{displayPrice}</span>
               </div>
               {purchasedBookIds.includes(selectedBook.id) ? (
                  <button onClick={() => { setShowBookDetails(false); openWebReader(selectedBook); }} className="flex-1 px-8 py-4 rounded-2xl text-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex justify-center items-center gap-3 font-bold hover:bg-emerald-500/25 transition shadow-lg">
                    <CheckCircle2 size={24} /> {t.readNow}
                  </button>
                ) : (
                  <button onClick={() => setShowCheckout(true)} className="flex-1 btn-gold px-8 py-4 rounded-2xl text-lg flex justify-center items-center gap-3 font-black">
                    <Lock size={20}/> {t.buyNow}
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
                 <button onClick={handleSubmitReview} className="btn-gold px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ml-auto">
                   {userExistingReview ? t.updateReview : t.submitReview}
                 </button>
               </div>
             )}

             <div className="flex flex-col gap-2 relative z-10">
               {loadingReviews ? (
                  <div className="text-gray-500 text-sm animate-pulse">Loading reviews...</div>
               ) : reviews.length > 0 ? (
                  reviews.map(review => (
                    <div key={review.id} className="bg-white/5 border border-white/5 p-2.5 rounded-xl relative hover:bg-white/10 transition duration-300">
                      {review.user_id === user?.id && <div className="absolute top-2 right-2 text-[9px] font-bold text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded">Your Review</div>}
                      <div className="flex justify-between items-start mb-1">
                         <div className="font-bold text-white text-[11px] flex items-center gap-1.5">
                           <UserCircle size={12} className="text-gray-400"/>
                           {review.profiles?.name || "Vedoxa Reader"}
                         </div>
                      </div>
                      <div className="flex text-yellow-500 mb-1"><Star size={8} fill="currentColor"/><Star size={8} fill="currentColor"/><Star size={8} fill="currentColor"/><Star size={8} fill="currentColor"/><Star size={8} fill="currentColor"/></div>
                      <p className="text-gray-300 text-[10px] leading-relaxed">{review.review_text}</p>
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
