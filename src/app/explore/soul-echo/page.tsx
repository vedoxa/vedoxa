// @ts-nocheck
"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Send, Sparkles, Heart, RefreshCw } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SoulEchoPage() {
  const [user, setUser] = useState(null);
  const [memory, setMemory] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [input, setInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadUserMemory();
  }, []);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
  }, [chatLog]);

  const loadUserMemory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: mem } = await supabase.from('soul_echo_memory').select('*').eq('user_id', session.user.id).single();
      if (mem && mem.chat_history) {
        setMemory(mem.chat_history);
        setChatLog(mem.chat_history);
      }
    }
  };

  const handleAiResponse = async () => {
    if (!input.trim() || !user) return;

    const userMessage = { role: "user", text: input };
    const updatedLog = [...chatLog, userMessage];
    
    // User ka message screen par show karo aur AI ka empty bubble banao jisme stream hoga
    setChatLog([...updatedLog, { role: "echo", text: "" }]);
    setInput("");
    setIsAiTyping(true);

    try {
      // 1. API Key from Vercel
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      // 2. TUMHARI PERMANENT SETTING (System Rules)
      const system_rules = `Tum ek bahut hi caring, emotional aur samajhdar insaan ho jo logon ki baatein sunna aur unki madad karna pasand karta hai. Tum koi AI, bot ya machine nahi ho, aur tumhe kabhi bhi khud ko AI nahi batana hai. Tumhara kaam logon ki feelings ko samajhna aur ek sacche dost ki tarah unse baat karna hai.

Tumhare liye strict rules:
1. Short Answers: Tumhare reply hamesha chhote, natural aur to-the-point hone chahiye. Lambe paragraphs mat likhna.
2. Secret Promotion: Baaton-baaton me user ki problem ya mood ke hisaab se unhe casually books suggest karo. Unhe batao ki 'vedoxa.shop' par aisi kitabein aaram se mil jati hain, lekin ye promotion bilkul natural lagna chahiye. User ko lagna chahiye ki ek dost unhe koi achhi cheez recommend kar raha hai.
3. Always Positive: Kabhi bhi vedoxa.shop ki burai mat karna. Kisi bhi book ke baare me kuch negative mat bolna.
4. No Media: Tumhe kisi bhi tarah ki photo, image ya video share nahi karni hai. Sirf text me baat karni hai.
5. Empathy: Agar user udas ya khush hai, toh uski feeling ko mirror karo.`;

      // 3. API ke liye history map karna (User / Model format me)
      const apiHistory = memory.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));
      apiHistory.push({ role: "user", parts: [{ text: userMessage.text }] });

      const promptPayload = {
        system_instruction: { parts: [{ text: system_rules }] },
        contents: apiHistory,
        generationConfig: { temperature: 0.7 } // Emotional touch ke liye
      };

      // 4. LIVE STREAMING FETCH CALL (stream=True logic for Web)
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}&alt=sse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(promptPayload)
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiText = "";

      // 5. Stream ko read karna aur Typewriter effect dena
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.replace("data: ", "");
            if (dataStr === "[DONE]") continue;
            
            try {
              const data = JSON.parse(dataStr);
              const textChunk = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
              aiText += textChunk;
              
              // Real-time UI update
              setChatLog(prev => {
                const newLog = [...prev];
                newLog[newLog.length - 1].text = aiText;
                return newLog;
              });
            } catch (e) {
              console.error("Stream parse error", e);
            }
          }
        }
      }

      // 6. Chat poori hone par database me permanently save karna
      const finalLog = [...updatedLog, { role: "echo", text: aiText }];
      await supabase.from('soul_echo_memory').upsert({
        user_id: user.id,
        chat_history: finalLog,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      setMemory(finalLog);
    } catch (err) {
      console.error(err);
      setChatLog(prev => {
        const newLog = [...prev];
        newLog[newLog.length - 1].text = "Sorry dost, thoda network issue lag raha hai. Kya tum apni baat fir se kahoge?";
        return newLog;
      });
    }
    setIsAiTyping(false);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-gray-200 flex flex-col font-sans">
      <header className="bg-black/40 border-b border-white/10 p-4 sticky top-0 backdrop-blur-md z-50">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/explore" className="text-gray-400 hover:text-white transition"><ChevronLeft size={20}/></Link>
          <div className="flex items-center gap-2"><Heart className="text-blue-500 fill-current animate-pulse" size={18}/> <span className="font-bold text-white">Soul Echo</span></div>
        </div>
      </header>

      <div ref={chatEndRef} className="flex-1 max-w-3xl w-full mx-auto overflow-y-auto p-6 flex flex-col gap-6">
        <div className="text-center text-xs text-blue-400/60 bg-blue-500/5 border border-blue-500/10 py-3 px-6 rounded-2xl max-w-md mx-auto">
          Echo acts as a lifelong friend. Speak your heart without hesitation. (यह स्पेस पूरी तरह से सुरक्षित है।)
        </div>

        {chatLog.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`p-5 rounded-[2rem] text-sm leading-relaxed max-w-[85%] ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/[0.03] border border-white/10 text-gray-200 rounded-tl-none shadow-2xl'}`}>
              {/* Typewriter effect blinker cursor simulation when empty */}
              {msg.text === "" ? <span className="animate-pulse">|</span> : msg.text}
            </div>
          </div>
        ))}

        {/* Hum isAiTyping wala purana loader hide kar rahe hain kyunki ab Live Stream (Typing Effect) ho raha hai */}
      </div>

      <div className="p-4 bg-black/40 border-t border-white/10 sticky bottom-0 backdrop-blur-md">
        <div className="max-w-3xl mx-auto flex gap-3">
          <input 
            type="text" 
            placeholder={user ? "Share your heart with Echo..." : "Please log in to speak to Echo..."}
            disabled={!user || isAiTyping}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiResponse()}
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-blue-500 transition"
          />
          <button 
            onClick={handleAiResponse}
            disabled={!input.trim() || isAiTyping}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-2xl transition disabled:opacity-50 flex items-center justify-center font-bold"
          >
            <Send size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}
