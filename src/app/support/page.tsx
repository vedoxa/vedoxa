"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, User, Send, Ticket, ShieldCheck, CheckCircle2 } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// ✅ Vercel build ke time error na de isliye placeholder add kiya hai
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SupportPage() {
  const [user, setUser] = useState<any>(null);
  const [messages, setMessages] = useState<{sender: 'bot'|'user', text: string}[]>([
    { sender: 'bot', text: "Hello! 🙏 Welcome to Vedoxa Help & Support. How can I assist you today?" }
  ]);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketData, setTicketData] = useState({ subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState(false);

  const faqs = [
    { q: "Payment was deducted but the book didn't unlock?", a: "Please log out and log back into your account. If it still doesn't unlock, click on 'Raise a Ticket' below." },
    { q: "How can I download the book's PDF?", a: "For security reasons, we do not allow direct PDF downloads. You can read the book anytime using our fast and secure 'Web Reader'." },
    { q: "Where will my purchased books appear?", a: "A 'Read Now' button will appear under your purchased books in the Premium Library section on the Home page." }
  ];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user);
    });
  }, []);

  const handleFAQClick = (faq: any) => {
    setMessages(prev => [...prev, { sender: 'user', text: faq.q }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { sender: 'bot', text: faq.a }]);
    }, 600);
  };

  const submitTicket = async (e: any) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first to raise a support ticket.");
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from('tickets').insert([
      { 
        user_id: user.id, 
        user_email: user.email,
        subject: ticketData.subject,
        message: ticketData.message
      }
    ]);

    setIsSubmitting(false);
    if (!error) {
      setTicketSuccess(true);
      setMessages(prev => [...prev, { sender: 'bot', text: "Your ticket has been successfully submitted. Our team will review and resolve your issue within 48 hours." }]);
      setShowTicketForm(false);
    } else {
      alert("Error submitting the ticket. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#06060a] text-gray-200 font-sans flex flex-col">
      {/* Header */}
      <nav className="sticky top-0 z-50 px-4 py-4 md:px-8 bg-black/80 backdrop-blur-xl border-b border-white/10 flex items-center gap-4">
        <Link href="/" className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition"><ArrowLeft size={20} /></Link>
        <div className="flex items-center gap-2">
          <Bot className="text-yellow-500 w-8 h-8" />
          <div>
            <h1 className="font-bold text-white leading-tight">Vedoxa Bot</h1>
            <p className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online Support</p>
          </div>
        </div>
      </nav>

      {/* Chat Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 md:p-8 flex flex-col gap-6 overflow-y-auto pb-32">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.sender === 'bot' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-blue-500/10 text-blue-400'}`}>
              {msg.sender === 'bot' ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div className={`p-4 rounded-2xl max-w-[80%] text-sm md:text-base ${msg.sender === 'bot' ? 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm' : 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-50 rounded-tr-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}

        {ticketSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-400 max-w-[80%]">
            <CheckCircle2 className="shrink-0" />
            <span className="text-sm font-bold">Ticket Submitted! Check back in 48 hrs.</span>
          </div>
        )}

        {/* Ticket Form */}
        {showTicketForm && !ticketSuccess && (
          <div className="bg-white/5 border border-white/10 p-6 rounded-3xl ml-12 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Ticket className="text-yellow-500"/> Raise a Support Ticket</h3>
            <form onSubmit={submitTicket} className="flex flex-col gap-4">
              <input required placeholder="Problem Title (eg. Payment Issue)" value={ticketData.subject} onChange={e => setTicketData({...ticketData, subject: e.target.value})} className="bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-yellow-500" />
              <textarea required placeholder="Describe your problem in detail..." value={ticketData.message} onChange={e => setTicketData({...ticketData, message: e.target.value})} className="bg-black/50 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-yellow-500 h-24 resize-none" />
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowTicketForm(false)} className="px-4 py-2 rounded-xl text-sm font-bold bg-white/5 text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 bg-yellow-500 text-black font-bold py-2 rounded-xl text-sm flex justify-center items-center gap-2">
                  {isSubmitting ? 'Submitting...' : <><Send size={16}/> Submit Ticket</>}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Options Panel (Bottom) */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0d] border-t border-white/10 p-4 z-40">
        <div className="max-w-3xl mx-auto flex flex-wrap gap-2 md:gap-3 justify-center">
          {!showTicketForm && faqs.map((faq, i) => (
            <button key={i} onClick={() => handleFAQClick(faq)} className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-full text-xs md:text-sm text-gray-300 hover:bg-white/10 hover:border-yellow-500/30 transition text-left">
              {faq.q}
            </button>
          ))}
          {!showTicketForm && !ticketSuccess && (
            <button onClick={() => setShowTicketForm(true)} className="bg-red-500/10 border border-red-500/20 px-5 py-2.5 rounded-full text-xs md:text-sm text-red-400 font-bold hover:bg-red-500/20 transition flex items-center gap-2">
              <ShieldCheck size={16} /> Raise Ticket (Manually)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
