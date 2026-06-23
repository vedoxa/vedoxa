// @ts-nocheck
"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Send, Users, ShieldAlert, Smile } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

// 🚫 BAD WORDS LIST (Gali blocker system)
const FORBIDDEN_WORDS = ["gali1", "gali2", "badword3", "fraud", "scam"]; 

export default function SoulCirclePage() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [onlineCount, setOnlineCount] = useState(1); // Real-time presence simulation
  const chatEndRef = useRef(null);

  useEffect(() => {
    initChatSystem();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
  }, [messages]);

  const initChatSystem = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (prof) setProfile(prof);
    }

    // Fetch existing chats
    const { data } = await supabase.from('soul_circle_chats').select('*').order('created_at', { ascending: true });
    if (data) setMessages(data);

    // Subscribe to Live real-time database updates
    const channel = supabase.channel('soul_circle_live')
      .on('postgres_changes', { event: 'INSERT', table: 'soul_circle_chats' }, (payload) => {
        setMessages(prev => [...prev, payload.new]);
      })
      .subscribe();

    // Online presence tracking system simulation
    setOnlineCount(Math.floor(Math.random() * 14) + 8); 

    return () => { supabase.removeChannel(channel); };
  };

  const handleSendMessage = async () => {
    if (!input.trim() || !user) return;

    // 🔴 PROFANITY SYSTEM FILTERING Logic
    const messageLower = input.toLowerCase();
    const containsBadWord = FORBIDDEN_WORDS.some(word => messageLower.includes(word));

    if (containsBadWord) {
      alert("Warning: Inappropriate words are strictly not allowed! (गलत शब्दों का प्रयोग वर्जित है।)");
      setInput("");
      return; // Stop processing -> Block insertion completely
    }

    const chatPayload = {
      user_id: user.id,
      user_name: profile?.name || "Seeker",
      message: input
    };

    setInput("");
    await supabase.from('soul_circle_chats').insert([chatPayload]);
  };

  return (
    <div className="min-h-screen bg-[#06060a] text-gray-200 flex flex-col font-sans">
      
      {/* Top Header Navbar */}
      <header className="bg-black/40 border-b border-white/10 p-4 sticky top-0 backdrop-blur-md z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/explore" className="inline-flex items-center gap-1 text-gray-400 font-bold hover:text-white transition text-sm">
            <ChevronLeft size={16} /> Exit Circle
          </Link>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full text-emerald-400 font-bold text-xs">
            <Users size={14} /> {onlineCount} Seekers Online
          </div>
        </div>
      </header>

      {/* Chat Messages Log Area */}
      <div ref={chatEndRef} className="flex-1 max-w-3xl w-full mx-auto overflow-y-auto p-6 flex flex-col gap-4 scroll-smooth">
        {messages.map((msg, idx) => {
          const isMe = msg.user_id === user?.id;
          return (
            <div key={idx} className={`flex flex-col max-w-[75%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
              <span className="text-[10px] text-gray-500 font-bold mb-1 px-1">{msg.user_name}</span>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-semibold rounded-tr-none shadow-lg' : 'bg-white/5 border border-white/5 text-gray-200 rounded-tl-none'}`}>
                {msg.message}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="m-auto text-gray-500 text-center text-sm">The Circle is calm. Start the transmission...</div>
        )}
      </div>

      {/* Input Message Bar Area */}
      <div className="p-4 bg-black/40 border-t border-white/10 sticky bottom-0 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input 
            type="text" 
            placeholder={user ? "Type your transmission..." : "Please log in to chat..."}
            disabled={!user}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-yellow-500 transition"
          />
          <button 
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 rounded-2xl transition disabled:opacity-50 flex items-center justify-center font-bold"
          >
            <Send size={18}/>
          </button>
        </div>
      </div>

    </div>
  );
}
