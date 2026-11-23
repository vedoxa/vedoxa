// @ts-nocheck
"use client";
import Link from "next/link";
import {
  ShieldCheck, Globe, BookOpen, Lock, X, Zap, Search,
  ChevronRight, LogOut, UserCircle, Coins, Share2, Menu, Edit3, Heart, Sun, Moon, Crown, Sparkles,
  LayoutDashboard, Compass, Brain, BookMarked, Camera, ArrowUpRight, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function VedoxaDashboard({
  isSidebarOpen,
  setIsSidebarOpen,
  isDark,
  sidebarTab,
  setSidebarTab,
  purchasedBookIds,
  favorites,
  setShowAvatarPicker,
  profile,
  user,
  readerTier,
  readerProgress,
  nextTierText,
  sideCard,
  segBtn,
  lang,
  setLang,
  toggleTheme,
  ownedBooksList,
  favoriteBooksList,
  openWebReader,
  openBookDetails,
  supabaseUrl,
  showLogoutConfirm,
  setShowLogoutConfirm,
  confirmLogout,
  showAvatarPicker,
  AVATARS,
  handleSaveAvatar
}) {
  return (
    <>
      {/* Sidebar Dashboard (solid panel + GPU slide = opens instantly, no blur lag) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/65 z-[5000]"
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              style={{ willChange: "transform" }}
              className={`fixed inset-y-0 right-0 w-[23.5rem] max-w-[92vw] border-l z-[5001] shadow-[-14px_0_44px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden rounded-l-[2.25rem] ${isDark ? 'bg-[#090915] border-white/[0.1] text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
              {/* Soft Aurora Glow Behind Profile */}
              <div
                className="absolute inset-x-0 top-0 h-72 pointer-events-none"
                style={{ background: isDark
                  ? 'radial-gradient(125% 95% at 50% 0%, rgba(212,146,26,0.24) 0%, rgba(139,92,246,0.10) 48%, transparent 78%)'
                  : 'radial-gradient(125% 95% at 50% 0%, rgba(245,184,75,0.36) 0%, rgba(167,139,250,0.12) 48%, transparent 78%)' }}
              />

              {/* Header (No scroll) */}
              <div className="relative shrink-0 px-5 pt-5 pb-3 flex justify-between items-center border-b border-transparent">
                <span className="flex items-center gap-2.5 text-sm font-extrabold tracking-wide">
                  <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-amber-400/25 to-amber-600/10 border border-amber-500/40 text-amber-400 flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.2)]">
                    <LayoutDashboard size={16}/>
                  </span>
                  <span>Reader Hub</span>
                </span>

                {/* Mini Tab Switcher inside Dashboard Header */}
                <div className={`flex p-1 rounded-full border text-[11px] font-bold ${isDark ? 'bg-black/45 border-white/[0.09]' : 'bg-slate-100 border-slate-200/90'}`}>
                  <button
                    type="button"
                    onClick={() => setSidebarTab("overview")}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${sidebarTab === "overview" ? "bg-gradient-to-r from-amber-300 to-amber-500 text-[#150800] font-extrabold shadow-sm" : (isDark ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-900")}`}
                  >
                    Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarTab("shelf")}
                    className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 cursor-pointer ${sidebarTab === "shelf" ? "bg-gradient-to-r from-amber-300 to-amber-500 text-[#150800] font-extrabold shadow-sm" : (isDark ? "text-gray-400 hover:text-white" : "text-slate-500 hover:text-slate-900")}`}
                  >
                    Shelf
                    {(purchasedBookIds.length + favorites.length) > 0 && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${sidebarTab === "shelf" ? "bg-black/20 text-[#150800]" : "bg-amber-500/20 text-amber-400"}`}>
                        {purchasedBookIds.length + favorites.length}
                      </span>
                    )}
                  </button>
                </div>

                <motion.button
                  type="button"
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Close dashboard"
                  className={`p-2 rounded-2xl border transition-colors cursor-pointer ${isDark ? 'bg-white/[0.04] border-white/[0.09] text-gray-400 hover:text-white hover:bg-white/[0.1]' : 'bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-200/70'}`}
                >
                  <X size={17}/>
                </motion.button>
              </div>

              {/* Scrollable Content Area */}
              <div className="relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar px-5 pb-6">

                {/* Profile Section: gold ring + crown + camera chip */}
                <div className="flex flex-col items-center text-center pt-5">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className="relative w-28 h-28 group cursor-pointer"
                    onClick={() => setShowAvatarPicker(true)}
                  >
                    <div className="avatar-ring absolute -inset-1.5 rounded-full opacity-95" />
                    <div className={`absolute inset-0 rounded-full ${isDark ? 'bg-[#090915]' : 'bg-white'}`} />
                    <div className="absolute inset-[4px] rounded-full overflow-hidden flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="avatar" decoding="async" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <UserCircle size={52} className="text-amber-500/50" />
                      )}
                    </div>
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 -rotate-6 w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-[#150800] flex items-center justify-center shadow-[0_3px_12px_rgba(212,146,26,0.55)] ring-2 ring-white/30">
                      <Crown size={15} />
                    </span>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-9 h-9 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center border-[3px] shadow-md transition-transform group-hover:scale-110 ${isDark ? 'border-[#090915]' : 'border-white'}`}>
                      <Camera size={14} />
                    </span>
                  </motion.div>

                  <h3 className="font-cinzel gold-text font-black text-xl sm:text-2xl mt-4 leading-tight max-w-full truncate px-2">
                    {profile?.name || "Vedoxa Reader"}
                  </h3>
                  <p className={`text-xs mt-0.5 font-medium max-w-full truncate px-3 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                    {user?.email}
                  </p>

                  <div className="flex items-center gap-2 mt-2.5 flex-wrap justify-center">
                    <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/[0.15] border border-amber-500/40 text-amber-400 shadow-[0_2px_10px_rgba(245,158,11,0.15)]">
                      <Sparkles size={12} className="text-amber-400" />
                      <span className="text-[11px] font-extrabold tracking-wide">{readerTier}</span>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowAvatarPicker(true)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors cursor-pointer ${isDark ? 'bg-white/[0.04] border-white/[0.09] text-gray-300 hover:bg-white/[0.1]' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'}`}
                    >
                      <Edit3 size={10} /> Avatar
                    </motion.button>
                  </div>

                  {/* Consciousness Progress Bar */}
                  <div className={`w-full mt-4 p-3.5 rounded-2xl border text-left ${sideCard}`}>
                    <div className="flex justify-between items-center text-[11px] font-bold mb-1.5">
                      <span className={isDark ? "text-gray-300" : "text-slate-700"}>Reading Aura</span>
                      <span className="text-amber-500 font-extrabold">{readerProgress}% Awakened</span>
                    </div>
                    <div className={`w-full h-2.5 rounded-full overflow-hidden p-0.5 ${isDark ? "bg-white/[0.07]" : "bg-slate-200/90"}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${readerProgress}%` }}
                        transition={{ duration: 0.85, ease: "easeOut" }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                      />
                    </div>
                    <p className={`mt-1.5 text-[10px] font-semibold ${isDark ? "text-gray-400" : "text-slate-500"}`}>{nextTierText}</p>
                  </div>
                </div>

                <AnimatePresence mode="wait" initial={false}>
                  {sidebarTab === "overview" ? (
                    <motion.div
                      key="overview-tab"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
                    >
                      {/* Live stats (from existing state) - interactive to switch to shelf */}
                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <motion.div
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSidebarTab("shelf")}
                          className={`rounded-2xl border p-3.5 cursor-pointer transition-all hover:border-emerald-500/45 ${sideCard}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400/25 to-emerald-600/10 text-emerald-400 flex items-center justify-center border border-emerald-500/25">
                              <BookMarked size={17}/>
                            </span>
                            <ChevronRight size={14} className={isDark ? "text-gray-500" : "text-slate-400"} />
                          </div>
                          <div className="text-2xl font-black leading-none">{purchasedBookIds.length}</div>
                          <div className={`text-[11px] font-semibold mt-1.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Books Owned</div>
                        </motion.div>

                        <motion.div
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setSidebarTab("shelf")}
                          className={`rounded-2xl border p-3.5 cursor-pointer transition-all hover:border-rose-500/45 ${sideCard}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-400/25 to-rose-600/10 text-rose-400 flex items-center justify-center border border-rose-500/25">
                              <Heart size={17} className="fill-rose-500/30"/>
                            </span>
                            <ChevronRight size={14} className={isDark ? "text-gray-500" : "text-slate-400"} />
                          </div>
                          <div className="text-2xl font-black leading-none">{favorites.length}</div>
                          <div className={`text-[11px] font-semibold mt-1.5 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Favorites</div>
                        </motion.div>
                      </div>

                      {/* Reward points */}
                      <Link href="/reward-points" onClick={() => setIsSidebarOpen(false)} className="group relative mt-3 flex items-center gap-3.5 rounded-2xl p-4 overflow-hidden border border-amber-500/40 bg-gradient-to-br from-amber-500/[0.22] via-amber-500/[0.08] to-transparent hover:border-amber-400/70 transition-all shadow-[0_6px_20px_rgba(212,146,26,0.12)]">
                        <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center shrink-0 shadow-[0_4px_14px_rgba(212,146,26,0.4)]">
                          <Coins size={22}/>
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-xs font-extrabold text-amber-500">Reward Points</span>
                          <span className="block text-3xl font-black leading-tight">{profile?.reward_points || 0}</span>
                        </span>
                        <span className="w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-amber-400 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                          <ArrowUpRight size={16} />
                        </span>
                      </Link>

                      {/* Preferences: segmented switches */}
                      <div className={`mt-3 rounded-2xl border p-3.5 flex flex-col gap-3.5 ${sideCard}`}>
                        <div className="flex justify-between items-center gap-2">
                          <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold"><Globe size={15} className="text-amber-500"/> Language / भाषा</span>
                          <div className={`flex p-0.5 rounded-full border ${isDark ? 'bg-black/35 border-white/[0.08]' : 'bg-white border-slate-200'}`}>
                            <button type="button" onClick={() => setLang("EN")} className={segBtn(lang === "EN")}>EN</button>
                            <button type="button" onClick={() => setLang("HI")} className={segBtn(lang === "HI")}>हिन्दी</button>
                          </div>
                        </div>
                        {/* THEME TOGGLE */}
                        <div className="flex justify-between items-center gap-2">
                          <span className="flex items-center gap-2 text-xs sm:text-sm font-semibold">{isDark ? <Moon size={15} className="text-amber-500"/> : <Sun size={15} className="text-amber-500"/>} Theme / थीम</span>
                          <div className={`flex p-0.5 rounded-full border ${isDark ? 'bg-black/35 border-white/[0.08]' : 'bg-white border-slate-200'}`}>
                            <button type="button" onClick={() => { if (isDark) toggleTheme(); }} className={segBtn(!isDark)}><Sun size={13}/> Light</button>
                            <button type="button" onClick={() => { if (!isDark) toggleTheme(); }} className={segBtn(isDark)}><Moon size={13}/> Dark</button>
                          </div>
                        </div>
                      </div>

                      {/* Quick links (now close the dashboard when tapped) */}
                      <div className="mt-3 flex flex-col gap-2.5">
                        <Link href="/explore" onClick={() => setIsSidebarOpen(false)} className={`group flex items-center gap-3 rounded-2xl border p-3 transition-all ${sideCard} hover:border-amber-500/45`}>
                          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400/25 to-indigo-500/10 text-sky-400 border border-sky-400/25 flex items-center justify-center shrink-0"><Compass size={19}/></span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-bold">Explore</span>
                            <span className={`block text-[11px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Discover more books</span>
                          </span>
                          <ChevronRight size={16} className={`transition-transform duration-200 group-hover:translate-x-0.5 ${isDark ? "text-gray-500" : "text-slate-400"}`} />
                        </Link>

                        <Link href="/quiz" onClick={() => setIsSidebarOpen(false)} className={`group flex items-center gap-3 rounded-2xl border p-3 transition-all ${sideCard} hover:border-amber-500/45`}>
                          <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-400/25 to-fuchsia-500/10 text-violet-400 border border-violet-400/25 flex items-center justify-center shrink-0"><Brain size={19}/></span>
                          <span className="flex-1 min-w-0">
                            <span className="block text-sm font-bold">Quiz</span>
                            <span className={`block text-[11px] ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>Play the quiz</span>
                          </span>
                          <ChevronRight size={16} className={`transition-transform duration-200 group-hover:translate-x-0.5 ${isDark ? "text-gray-500" : "text-slate-400"}`} />
                        </Link>
                      </div>
                    </motion.div>
                  ) : (
                    /* INTERACTIVE QUICK SHELF TAB INSIDE DASHBOARD */
                    <motion.div
                      key="shelf-tab"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
                      className="mt-4 flex flex-col gap-4"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                            <BookMarked size={13} /> Owned Books ({ownedBooksList.length})
                          </span>
                        </div>
                        {ownedBooksList.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {ownedBooksList.map((b) => (
                              <motion.div
                                key={b.id}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setIsSidebarOpen(false); openWebReader(b); }}
                                className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-colors hover:border-emerald-500/45 ${sideCard}`}
                              >
                                <div className="w-10 h-12 rounded-lg overflow-hidden bg-amber-500/10 border border-amber-500/20 shrink-0 flex items-center justify-center">
                                  {b.cover_path ? (
                                    <img src={`${supabaseUrl}/storage/v1/object/public/books-covers/${b.cover_path}`} alt={b.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                  ) : (
                                    <BookOpen size={16} className="text-amber-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold truncate">{b.title}</div>
                                  <div className={`text-[10px] truncate ${isDark ? "text-gray-400" : "text-slate-500"}`}>by {b.author}</div>
                                </div>
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-[10px] font-extrabold shrink-0">
                                  Read
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className={`rounded-2xl border p-4 text-center text-xs ${sideCard} ${isDark ? "text-gray-500" : "text-slate-500"}`}>
                            No purchased books yet. Unlock any book to read it instantly!
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                            <Heart size={13} /> Saved Favorites ({favoriteBooksList.length})
                          </span>
                        </div>
                        {favoriteBooksList.length > 0 ? (
                          <div className="flex flex-col gap-2">
                            {favoriteBooksList.map((b) => (
                              <motion.div
                                key={b.id}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => { setIsSidebarOpen(false); openBookDetails(b); }}
                                className={`flex items-center gap-3 p-2.5 rounded-2xl border cursor-pointer transition-colors hover:border-amber-500/45 ${sideCard}`}
                              >
                                <div className="w-10 h-12 rounded-lg overflow-hidden bg-amber-500/10 border border-amber-500/20 shrink-0 flex items-center justify-center">
                                  {b.cover_path ? (
                                    <img src={`${supabaseUrl}/storage/v1/object/public/books-covers/${b.cover_path}`} alt={b.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                                  ) : (
                                    <BookOpen size={16} className="text-amber-500" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-xs font-bold truncate">{b.title}</div>
                                  <div className={`text-[10px] truncate ${isDark ? "text-gray-400" : "text-slate-500"}`}>₹{b.final_price}</div>
                                </div>
                                <ChevronRight size={15} className="text-amber-500 shrink-0" />
                              </motion.div>
                            ))}
                          </div>
                        ) : (
                          <div className={`rounded-2xl border p-4 text-center text-xs ${sideCard} ${isDark ? "text-gray-500" : "text-slate-500"}`}>
                            Tap the heart icon on any book to save it here.
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer / Logout (No scroll) */}
              <div className={`relative shrink-0 p-4 border-t ${isDark ? 'border-white/[0.07] bg-black/35' : 'border-slate-200 bg-slate-50/90'}`} style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}>
                {showLogoutConfirm ? (
                  <div className="bg-red-500/[0.09] border border-red-500/[0.26] p-3.5 rounded-2xl text-center">
                    <p className={`text-xs font-bold mb-2.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>Are you sure you want to log out?</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setShowLogoutConfirm(false)} className={`flex-1 text-xs font-bold py-2 rounded-xl transition-colors cursor-pointer ${isDark ? 'bg-white/[0.07] text-white hover:bg-white/[0.12]' : 'bg-slate-200 text-slate-800 hover:bg-slate-300'}`}>Cancel</button>
                      <button type="button" onClick={confirmLogout} className="flex-1 bg-red-500/90 text-white text-xs font-bold py-2 rounded-xl hover:bg-red-500 transition-colors cursor-pointer">Yes, Logout</button>
                    </div>
                  </div>
                ) : (
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowLogoutConfirm(true)}
                    className={`w-full font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors text-xs sm:text-sm border cursor-pointer ${isDark ? 'bg-white/[0.03] border-white/[0.08] text-red-400/90 hover:bg-red-500/10 hover:text-red-400' : 'bg-white border-slate-200 text-red-500 hover:bg-red-50'}`}
                  >
                    <LogOut size={15}/> Logout securely
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Avatar Picker Modal */}
      <AnimatePresence>
        {showAvatarPicker && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}
            onClick={() => setShowAvatarPicker(false)}
            className={`fixed inset-0 z-[6000] flex items-center justify-center p-4 ${isDark ? 'bg-black/85' : 'bg-slate-900/60'}`}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className={`border rounded-3xl p-6 w-full max-w-sm relative shadow-2xl ${isDark ? 'bg-[#0c0c1a] border-white/[0.1]' : 'bg-white border-slate-200'}`}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-amber-500/60 to-transparent rounded-full" />
              <button type="button" onClick={() => setShowAvatarPicker(false)} aria-label="Close" className={`absolute top-4 right-4 transition-colors p-1.5 rounded-xl cursor-pointer ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/[0.08]' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'}`}>
                <X size={18}/>
              </button>
              <h3 className={`text-lg font-bold text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>Choose your Avatar</h3>
              <p className={`text-xs text-center mt-1 mb-6 ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Pick the one that feels like you</p>
              <div className="grid grid-cols-3 gap-4">
                {AVATARS.map((url, idx) => {
                  const isCurrent = profile?.avatar_url === url;
                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      whileHover={{ scale: 1.07 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleSaveAvatar(url)}
                      className={`relative aspect-square rounded-full border-2 hover:border-amber-500/80 transition-all duration-200 cursor-pointer ${isCurrent ? 'border-amber-500 shadow-[0_0_18px_rgba(212,146,26,0.4)]' : (isDark ? 'border-white/[0.1]' : 'border-slate-200')}`}
                    >
                      <img src={url} alt={`avatar-${idx}`} loading="lazy" decoding="async" className="w-full h-full object-cover rounded-full" />
                      {isCurrent && (
                        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center border-2 border-[#0c0c1a]"><Check size={13} strokeWidth={3} /></span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function VedoxaNavbar({
  isDark,
  t,
  searchContainerRef,
  isSearchOpen,
  setIsSearchOpen,
  searchQuery,
  setSearchQuery,
  filteredBooks,
  openBookDetails,
  supabaseUrl,
  toggleTheme,
  user,
  profile,
  setIsSidebarOpen,
  setShowAuthModal
}) {
  return (
    /* Responsive Navbar: solid on phones (fast), soft glass on desktop */
    <nav className={`sticky top-0 z-[500] px-3.5 py-3 md:px-8 md:py-3.5 md:backdrop-blur-xl border-b flex justify-between items-center transition-colors duration-300 ${isDark ? 'bg-[#07070d]/95 border-white/[0.08] shadow-[0_8px_28px_rgba(0,0,0,0.45)]' : 'bg-white/95 border-slate-200/90 shadow-sm'}`} style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}>
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-500/45 to-transparent" />

      <Link href="/brand" className="flex items-center gap-2.5 md:gap-3 group shrink-0">
        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-full border border-amber-500/55 flex items-center justify-center shadow-[0_0_14px_rgba(212,146,26,0.38)] group-hover:shadow-[0_0_22px_rgba(245,158,11,0.65)] group-hover:scale-105 transition-all duration-300 ${isDark ? 'bg-[#0c0c1a]' : 'bg-white'}`}>
          <span className="font-cinzel text-lg md:text-xl font-black gold-text">V</span>
        </div>
        <span className={`font-cinzel text-base sm:text-lg md:text-2xl font-black tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {t.brand}
        </span>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Box with Outside-Click Close & Clear Button */}
        <div
          ref={searchContainerRef}
          className={`relative flex items-center border rounded-full px-3 py-1.5 transition-[width,border-color,box-shadow] duration-300 ease-out ${isSearchOpen ? 'w-44 sm:w-56 md:w-64 ring-2 ring-amber-500/30 border-amber-500/50' : 'w-10 hover:border-amber-500/45'} ${isDark ? 'bg-white/[0.05] border-white/[0.1]' : 'bg-slate-100/90 border-slate-200'}`}
        >
          <Search size={16} className="text-amber-500/90 cursor-pointer shrink-0 hover:text-amber-400 transition-colors" onClick={() => setIsSearchOpen(!isSearchOpen)} />
          {isSearchOpen && (
            <>
              <input autoFocus type="text" placeholder="Search books..." className={`bg-transparent border-none outline-none text-xs ml-2 w-full ${isDark ? 'text-white placeholder-gray-500' : 'text-slate-900 placeholder-slate-400'}`} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery("")} aria-label="Clear search" className="text-gray-400 hover:text-amber-500 p-0.5 shrink-0 cursor-pointer">
                  <X size={13} />
                </button>
              )}
              {/* DROP DOWN SEARCH SUGGESTIONS */}
              {searchQuery && (
                <div className={`absolute top-full mt-3 right-0 w-64 sm:w-72 max-h-72 overflow-y-auto custom-scrollbar rounded-2xl border shadow-[0_20px_50px_rgba(0,0,0,0.55)] z-[600] flex flex-col ${isDark ? 'bg-[#0c0c1a] border-white/[0.12]' : 'bg-white border-slate-200'}`}>
                  {filteredBooks.length > 0 ? (
                    filteredBooks.slice(0, 5).map(book => (
                      <div key={book.id} onClick={() => { openBookDetails(book); setIsSearchOpen(false); setSearchQuery(""); }} className={`px-3.5 py-2.5 text-sm cursor-pointer border-b last:border-b-0 transition-colors flex items-center gap-3 ${isDark ? 'border-white/[0.06] text-white hover:bg-white/[0.06]' : 'border-slate-100 text-slate-800 hover:bg-slate-50'}`}>
                        <div className="w-8 h-10 rounded-md overflow-hidden bg-amber-500/10 border border-amber-500/20 shrink-0 flex items-center justify-center">
                          {book.cover_path ? (
                            <img src={`${supabaseUrl}/storage/v1/object/public/books-covers/${book.cover_path}`} alt={book.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          ) : (
                            <Search size={13} className="text-amber-500/70" />
                          )}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="font-bold text-xs truncate">{book.title}</div>
                          <div className="text-[10px] opacity-70 truncate">by {book.author}</div>
                        </div>
                        <span className="text-xs font-extrabold text-amber-500 shrink-0">₹{book.final_price}</span>
                      </div>
                    ))
                  ) : (
                    <div className={`px-4 py-4 text-xs text-center ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>No matching books found</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Quick Theme Pill on Mobile/Desktop Navbar */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.06, rotate: 12 }}
          whileTap={{ scale: 0.9 }}
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className={`w-9 h-9 rounded-full border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
            isDark
              ? "bg-white/[0.05] border-white/[0.1] text-amber-400 hover:bg-white/[0.1] hover:border-amber-400/40"
              : "bg-slate-100 border-slate-200 text-amber-600 hover:bg-slate-200"
          }`}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </motion.button>

        {/* Luxury Profile Capsule / Login CTA */}
        {user ? (
          <motion.button
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open dashboard"
            className={`group relative flex items-center gap-2 border pl-1 pr-2.5 sm:pr-3 py-1 rounded-full transition-all shrink-0 cursor-pointer shadow-[0_4px_14px_rgba(212,146,26,0.16)] ${
              isDark
                ? 'bg-gradient-to-r from-amber-500/[0.14] via-white/[0.05] to-white/[0.03] border-amber-500/40 hover:border-amber-400/70'
                : 'bg-gradient-to-r from-amber-50 via-white to-slate-50 border-amber-400/55 hover:border-amber-500'
            }`}
          >
            {/* Avatar with static conic gold ring + mini crown + online dot */}
            <span className="relative shrink-0">
              <span className="avatar-ring-static absolute -inset-[2px] rounded-full opacity-95" />
              <span className={`relative flex w-8 h-8 rounded-full overflow-hidden items-center justify-center border-2 ${isDark ? 'border-[#0c0c1a] bg-[#0c0c1a]' : 'border-white bg-white'}`}>
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" decoding="async" className="w-full h-full object-cover" />
                ) : (
                  <UserCircle size={20} className="text-amber-500/80" />
                )}
              </span>
              <span className="absolute -top-1.5 -left-1 w-4 h-4 rounded-full bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center shadow-sm">
                <Crown size={9} />
              </span>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 ${isDark ? 'border-[#07070d]' : 'border-white'}`} />
            </span>

            {/* Mini Points & Name Chip */}
            <span className="flex items-center gap-1 text-[11px] font-extrabold text-amber-500 bg-amber-500/12 border border-amber-500/30 px-2 py-0.5 rounded-full">
              <Coins size={11} />
              <span>{profile?.reward_points || 0}</span>
            </span>

            <Menu size={16} className={`transition-colors group-hover:text-amber-500 ${isDark ? "text-gray-300" : "text-slate-600"}`} />
          </motion.button>
        ) : (
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setShowAuthModal(true)}
            className="btn-gold btn-shine px-4 sm:px-5 py-2 rounded-full text-xs font-extrabold shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={13} />
            <span>Login</span>
          </motion.button>
        )}
      </div>
    </nav>
  );
}

export function VedoxaFooter({
  isDark,
  t,
  addToast,
  user,
  setIsSidebarOpen,
  setShowAuthModal,
  handleShare
}) {
  return (
    <>
      {/* Compact, Animated Footer Dock (About Us, Safe & Secure, Instant PDF, Share Page) */}
      <footer className={`py-6 px-4 w-full flex flex-col items-center border-t mt-auto relative z-10 ${isDark ? 'bg-gradient-to-b from-[#07070d] to-[#0a0a16] border-white/[0.07]' : 'bg-gradient-to-b from-slate-50 to-slate-100/80 border-slate-200'}`}>
        <div className={`w-full max-w-3xl rounded-3xl border p-3 sm:p-4 ${
          isDark
            ? 'bg-white/[0.03] border-white/[0.09] shadow-[0_10px_32px_rgba(0,0,0,0.45)]'
            : 'bg-white/95 border-slate-200/90 shadow-[0_8px_24px_rgba(15,23,42,0.06)]'
        }`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* 1. About Us */}
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/about"
                className={`footer-action-pill h-full w-full px-3 py-2.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-extrabold shadow-sm ${
                  isDark
                    ? 'bg-white/[0.04] border-white/[0.09] text-gray-200 hover:border-amber-500/45 hover:text-amber-400'
                    : 'bg-slate-50/90 border-slate-200 text-slate-700 hover:border-amber-500/45 hover:text-amber-600'
                }`}
              >
                <span className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center shrink-0">
                  <Sparkles size={13} />
                </span>
                <span className="truncate">About Us</span>
              </Link>
            </motion.div>

            {/* 2. Safe & Secure */}
            <motion.div
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => addToast("100% Verified & SSL Encrypted Library 🛡️", "success")}
              className={`footer-action-pill cursor-pointer px-3 py-2.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-extrabold shadow-sm ${
                isDark
                  ? 'bg-white/[0.04] border-white/[0.09] text-gray-200 hover:border-emerald-500/45 hover:text-emerald-400'
                  : 'bg-slate-50/90 border-slate-200 text-slate-700 hover:border-emerald-500/45 hover:text-emerald-600'
              }`}
            >
              <span className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck size={13} />
              </span>
              <span className="truncate">{t.secure}</span>
            </motion.div>

            {/* 3. Instant PDF Auto-Download */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => user ? setIsSidebarOpen(true) : setShowAuthModal(true)}
              className={`footer-action-pill cursor-pointer px-3 py-2.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-extrabold shadow-sm ${
                isDark
                  ? 'bg-white/[0.04] border-white/[0.09] text-gray-200 hover:border-amber-500/45 hover:text-amber-400'
                  : 'bg-slate-50/90 border-slate-200 text-slate-700 hover:border-amber-500/45 hover:text-amber-600'
              }`}
            >
              <span className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <Zap size={13} />
              </span>
              <span className="truncate">{t.instant}</span>
            </motion.button>

            {/* 4. Share Page */}
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleShare}
              className="footer-action-pill btn-shine cursor-pointer px-3 py-2.5 rounded-2xl border border-amber-500/45 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 text-amber-400 hover:border-amber-400 flex items-center justify-center gap-2 text-xs font-extrabold shadow-[0_3px_14px_rgba(212,146,26,0.18)]"
            >
              <span className="w-6 h-6 rounded-lg bg-gradient-to-br from-amber-300 to-amber-600 text-[#150800] flex items-center justify-center shrink-0 shadow-sm">
                <Share2 size={12} />
              </span>
              <span className="truncate">Share Page</span>
            </motion.button>
          </div>
        </div>
      </footer>

      {/* Scrolling Line Loop */}
      <div className="w-full bg-amber-500/[0.03] border-t border-amber-500/[0.14] overflow-hidden cursor-pointer py-2 relative z-10" onClick={() => window.location.reload()}>
        <div className={`animate-scroll text-[10px] tracking-[0.25em] uppercase font-black flex w-max ${isDark ? 'text-amber-500/45' : 'text-amber-600/65'}`}>
          <span className="px-8">✦ Vedoxa Library</span><span className="px-8">✦ Vedoxa Library</span><span className="px-8">✦ Vedoxa Library</span><span className="px-8">✦ Vedoxa Library</span><span className="px-8">✦ Vedoxa Library</span><span className="px-8">✦ Vedoxa Library</span><span className="px-8">✦ Vedoxa Library</span><span className="px-8">✦ Vedoxa Library</span><span className="px-8">✦ Vedoxa Library</span><span className="px-8">✦ Vedoxa Library</span><span className="px-8">✦ Vedoxa Library</span><span className="px-8">✦ Vedoxa Library</span>
        </div>
      </div>

      {/* PURE SVG TRUST LOGOS SECTION */}
      <div className={`w-full py-5 flex flex-col items-center border-b relative z-10 ${isDark ? 'bg-[#090914] border-white/[0.04]' : 'bg-slate-100 border-slate-200'}`} style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}>
        <p className={`text-[10px] font-bold mb-3.5 tracking-widest uppercase ${isDark ? 'text-gray-500' : 'text-slate-500'}`}>Trusted By & Verified Secure</p>
        <div className="flex flex-wrap justify-center items-center gap-5 md:gap-10 opacity-80 hover:opacity-100 transition-opacity duration-500 px-4">
          <div className={`flex items-center gap-2 font-bold tracking-wide text-xs sm:text-sm ${isDark ? 'text-white/85' : 'text-slate-700'}`}>
            <svg viewBox="0 0 48 48" className="h-4 sm:h-5 w-auto grayscale hover:grayscale-0 transition-all cursor-pointer">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.7 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Google Verified
          </div>
          <div className="flex items-center gap-1 font-bold tracking-wide text-xs sm:text-sm">
            <svg viewBox="0 0 100 24" className="h-3.5 sm:h-4 w-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.44 19H7.13L16 2.776h5.36L12.44 19z" fill={isDark ? "#fff" : "#334155"}/>
              <path d="M2.57 18.99l9-16.216h5.21l-9 16.216H2.57z" fill="#3395FF"/>
              <text x="24" y="17" fill={isDark ? "#fff" : "#334155"} fontSize="16" fontWeight="bold" fontFamily="sans-serif">razorpay</text>
            </svg>
          </div>
          <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${isDark ? 'text-white/85' : 'text-slate-700'}`}>
            <ShieldCheck className="text-green-500" size={17}/> McAfee Secure
          </div>
          <div className={`flex items-center gap-1.5 text-xs sm:text-sm font-bold ${isDark ? 'text-white/85' : 'text-slate-700'}`}>
            <Lock className="text-amber-500" size={17}/> SSL 256-bit
          </div>
        </div>
      </div>
    </>
  );
                          }
