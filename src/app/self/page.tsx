// @ts-nocheck
"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Zap, ShieldAlert, Sparkles, Rocket, KeyRound, UserPlus, TrendingUp, Eye, DollarSign, WalletCards, Send, Mail, CheckCircle2, AlertTriangle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SelfPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Dashboard States
  const [viewState, setViewState] = useState("LOADING"); // LOADING, ENTER_CODE, SETUP_PROFILE, DASHBOARD
  const [affiliateData, setAffiliateData] = useState(null);
  
  // Forms & Inputs
  const [codeInput, setCodeInput] = useState("");
  const [setupForm, setSetupForm] = useState({ fullName: "", channelName: "", paymentUpi: "" });
  const [toast, setToast] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Chat States
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const chatRef = useRef(null);

  useEffect(() => {
    checkPartnerStatus();
  }, []);

  useEffect(() => {
    // Scroll chat to bottom when new messages arrive
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const showToast = (msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const checkPartnerStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      setViewState("UNAUTHORIZED");
      setLoading(false);
      return;
    }
    setUser(session.user);

    // Check if user is already an affiliate
    const { data: aff, error } = await supabase.from('affiliates').select('*').eq('user_id', session.user.id).single();
    
    if (aff) {
      setAffiliateData(aff);
      fetchMessages(session.user.id);
      setViewState("DASHBOARD");
    } else {
      setViewState("ENTER_CODE");
    }
    setLoading(false);
  };

  const fetchMessages = async (userId) => {
    const { data } = await supabase.from('affiliate_messages').select('*').eq('affiliate_id', userId).order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  const handleVerifyCode = async () => {
    if (codeInput.length !== 8) return showToast("Code must be 8 characters long!", "error");
    setIsProcessing(true);
    
    // Check code in database
    const { data: codeData, error } = await supabase.from('affiliate_codes').select('*').eq('code', codeInput.toUpperCase()).single();
    
    if (error || !codeData) {
      showToast("Invalid Partner Code!", "error");
    } else if (codeData.is_claimed) {
      showToast("This code has already been claimed!", "error");
    } else {
      showToast("Code Verified! Please complete your profile.", "success");
      setViewState("SETUP_PROFILE");
    }
    setIsProcessing(false);
  };

  const handleSetupProfile = async () => {
    if (!setupForm.fullName || !setupForm.channelName || !setupForm.paymentUpi) {
      return showToast("Please fill all details", "error");
    }
    setIsProcessing(true);

    try {
      // 1. Mark code as claimed
      await supabase.from('affiliate_codes').update({ is_claimed: true, claimed_by: user.id }).eq('code', codeInput.toUpperCase());
      
      // 2. Create Affiliate Profile
      const newAffiliate = {
        user_id: user.id,
        partner_code: codeInput.toUpperCase(),
        full_name: setupForm.fullName,
        channel_name: setupForm.channelName,
        payment_upi: setupForm.paymentUpi,
      };

      const { error } = await supabase.from('affiliates').insert([newAffiliate]);
      if (error) throw error;

      setAffiliateData(newAffiliate);
      showToast("Welcome to the Partner Program!", "success");
      setViewState("DASHBOARD");
    } catch (err) {
      showToast(err.message, "error");
    }
    setIsProcessing(false);
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    const newMsg = { affiliate_id: user.id, sender_type: 'affiliate', message: chatInput };
    
    // Optimistic UI update
    setMessages(prev => [...prev, { ...newMsg, created_at: new Date().toISOString() }]);
    setChatInput("");

    await supabase.from('affiliate_messages').insert([newMsg]);
  };

  const handleCopyLink = () => {
    const link = `https://vedoxa.shop/?partner=${affiliateData?.partner_code}`;
    navigator.clipboard.writeText(link);
    showToast("Affiliate Link Copied!", "success");
  };

  return (
    <div className="min-h-screen bg-[#06060a] text-gray-200 flex flex-col p-6 font-sans relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999]">
            <div className={`px-6 py-3 rounded-full shadow-2xl font-bold text-sm border flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : toast.type === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/50' : 'bg-blue-500/20 text-blue-400 border-blue-500/50'}`}>
              {toast.type === 'success' ? <CheckCircle2 size={18}/> : <AlertTriangle size={18}/>} {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation - Fixed Back Button Link */}
      <nav className="mb-8 max-w-5xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 px-5 py-2.5 rounded-xl text-white font-bold transition shadow-lg">
          <ChevronLeft size={20} /> Back to Home
        </Link>
      </nav>

      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col">
        
        {loading || viewState === "LOADING" ? (
          <div className="flex flex-col items-center justify-center py-32">
            <RefreshCw className="animate-spin text-blue-500 mb-4" size={40} />
            <p className="text-gray-400 font-bold">Verifying Partner Access...</p>
          </div>
        ) : viewState === "UNAUTHORIZED" ? (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl max-w-xl mx-auto w-full">
             <ShieldAlert className="w-16 h-16 text-gray-500 mx-auto mb-4" />
             <h2 className="text-2xl font-bold text-white mb-2">Restricted Access</h2>
             <p className="text-gray-400 mb-6">You need to log in to access the Partner Zone.</p>
             <Link href="/" className="inline-block bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-500 transition shadow-lg">Go to Login</Link>
          </div>
        ) : viewState === "ENTER_CODE" ? (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-md mx-auto w-full mt-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-5 bg-blue-500/10 rounded-full border border-blue-500/30 text-blue-500 mb-6">
                <KeyRound size={40} />
              </div>
              <h1 className="text-3xl font-black text-white mb-2">Partner Portal</h1>
              <p className="text-gray-400 text-sm">Enter your 8-digit secret partner code provided by the Admin.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl">
              <input 
                type="text" 
                placeholder="e.g. VDX8A9B2" 
                maxLength={8}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-4 text-white text-center font-mono text-2xl tracking-[0.5em] focus:border-blue-500 outline-none mb-6 uppercase"
              />
              <button 
                onClick={handleVerifyCode}
                disabled={isProcessing || codeInput.length < 8}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? <RefreshCw className="animate-spin" size={20}/> : "Verify Code"}
              </button>
            </div>
          </motion.div>
        ) : viewState === "SETUP_PROFILE" ? (
          <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="max-w-lg mx-auto w-full mt-6">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center p-4 bg-purple-500/10 rounded-full border border-purple-500/30 text-purple-500 mb-4">
                <UserPlus size={32} />
              </div>
              <h1 className="text-3xl font-black text-white mb-2">Setup Your Profile</h1>
              <p className="text-gray-400 text-sm">Welcome! Please provide your payout and channel details.</p>
            </div>
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
                <input type="text" placeholder="John Doe" value={setupForm.fullName} onChange={(e) => setSetupForm({...setupForm, fullName: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">YouTube Channel Name / Platform</label>
                <input type="text" placeholder="e.g. Spiritual Wisdom" value={setupForm.channelName} onChange={(e) => setSetupForm({...setupForm, channelName: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Payment UPI ID / Bank Details</label>
                <input type="text" placeholder="yourname@upi" value={setupForm.paymentUpi} onChange={(e) => setSetupForm({...setupForm, paymentUpi: e.target.value})} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-purple-500 outline-none" />
              </div>
              <button 
                onClick={handleSetupProfile}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90 text-white font-bold py-4 rounded-xl mt-2 transition flex items-center justify-center gap-2"
              >
                {isProcessing ? <RefreshCw className="animate-spin" size={20}/> : "Complete Setup & Enter Dashboard"}
              </button>
            </div>
          </motion.div>
        ) : (
          /* DASHBOARD VIEW */
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-8 w-full pb-10">
            
            {/* Flashy Glowing Name Banner */}
            <div className="relative bg-gradient-to-r from-black via-[#0a0a1a] to-black border border-blue-500/20 rounded-[2rem] p-8 md:p-12 text-center overflow-hidden shadow-[0_0_50px_rgba(59,130,246,0.1)]">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />
              <p className="text-blue-400 font-bold tracking-[0.2em] uppercase text-sm mb-2 relative z-10 flex items-center justify-center gap-2"><Sparkles size={16}/> Verified Partner</p>
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 relative z-10 uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                {affiliateData?.full_name}
              </h1>
              <p className="text-gray-400 mt-2 text-lg relative z-10">Channel: <span className="text-white font-bold">{affiliateData?.channel_name}</span></p>
            </div>

            {/* Affiliate Link Section */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-1">Your Magic Affiliate Link</h3>
                <p className="text-sm text-gray-400">Share this link. Anyone who buys through it gets a discount, and you get 40% commission!</p>
              </div>
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="bg-black/50 border border-dashed border-blue-500/50 text-blue-400 px-6 py-3 rounded-xl font-mono text-sm overflow-hidden text-ellipsis whitespace-nowrap flex-1 md:w-72">
                  vedoxa.shop/?partner={affiliateData?.partner_code}
                </div>
                <button onClick={handleCopyLink} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition whitespace-nowrap">
                  Copy Link
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <div className="bg-[#0a0a14] border border-blue-500/20 p-6 rounded-3xl">
                <Eye className="text-blue-500 mb-3" size={28}/>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Link Views</p>
                <p className="text-3xl font-black text-white">{affiliateData?.clicks || 0}</p>
              </div>
              <div className="bg-[#0a0a14] border border-purple-500/20 p-6 rounded-3xl">
                <TrendingUp className="text-purple-500 mb-3" size={28}/>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Books Sold</p>
                <p className="text-3xl font-black text-white">{affiliateData?.sales || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-900/40 to-black border border-emerald-500/30 p-6 rounded-3xl">
                <DollarSign className="text-emerald-500 mb-3" size={28}/>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Earned</p>
                <p className="text-3xl font-black text-emerald-400">₹{affiliateData?.total_earned || 0}</p>
              </div>
              <div className="bg-gradient-to-br from-orange-900/40 to-black border border-orange-500/30 p-6 rounded-3xl">
                <WalletCards className="text-orange-500 mb-3" size={28}/>
                <p className="text-xs font-bold text-gray-500 uppercase mb-1">Pending Payout</p>
                <p className="text-3xl font-black text-orange-400">₹{(affiliateData?.total_earned || 0) - (affiliateData?.total_paid || 0)}</p>
              </div>
            </div>

            {/* Support & Chat Section */}
            <div className="grid md:grid-cols-3 gap-6 h-[500px]">
              
              {/* Info & Email */}
              <div className="md:col-span-1 bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Rocket className="text-blue-500"/> Partner Info</h3>
                  <p className="text-sm text-gray-400">Payments are cleared manually every week directly to your provided UPI ID.</p>
                </div>
                <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 uppercase font-bold mb-1">Saved UPI ID</p>
                  <p className="text-sm font-mono text-white break-all">{affiliateData?.payment_upi}</p>
                </div>
                <div className="mt-auto">
                  <p className="text-xs text-gray-500 text-center mb-3">Need formal support?</p>
                  <a href="mailto:admin@vedoxa.shop" className="w-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center gap-2 py-3 rounded-xl text-white font-bold transition">
                    <Mail size={18}/> Email Support
                  </a>
                </div>
              </div>

              {/* Live Chat with Admin */}
              <div className="md:col-span-2 bg-[#0d0d14] border border-blue-500/20 rounded-3xl flex flex-col overflow-hidden relative shadow-[0_0_20px_rgba(59,130,246,0.05)]">
                <div className="bg-black/40 border-b border-white/10 p-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white flex items-center gap-2">Live Chat with Admin</h3>
                    <p className="text-xs text-blue-400">We typically reply within 24 hours.</p>
                  </div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" title="System Online"></div>
                </div>
                
                {/* Chat Messages Area */}
                <div ref={chatRef} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 scroll-smooth">
                  <div className="text-center text-xs text-gray-500 my-2">Chat started • All messages are secure</div>
                  
                  {messages.map((msg, i) => (
                    <div key={i} className={`max-w-[80%] rounded-2xl p-4 text-sm ${msg.sender_type === 'affiliate' ? 'bg-blue-600 text-white self-end rounded-tr-sm' : 'bg-white/10 border border-white/5 text-gray-200 self-start rounded-tl-sm'}`}>
                      {msg.message}
                    </div>
                  ))}
                  {messages.length === 0 && (
                    <div className="m-auto text-gray-500 text-sm">Send a message to start chatting with the Admin!</div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="p-4 bg-black/40 border-t border-white/10 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                  />
                  <button 
                    onClick={handleSendMessage}
                    disabled={!chatInput.trim()}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 rounded-xl transition disabled:opacity-50 flex items-center justify-center"
                  >
                    <Send size={18}/>
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
