"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Send, Heart, Sparkles } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Supabase Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

// Background SVG (Kept intact as requested)
const bgSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900">
  <defs>
    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1020"/>
      <stop offset="100%" stop-color="#050508"/>
    </linearGradient>
    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1b3a6b" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#0f172a" stop-opacity="0.05"/>
    </linearGradient>
    <filter id="blur">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>
  <rect width="1600" height="900" fill="url(#g1)"/>
  <circle cx="1260" cy="170" r="220" fill="#2563eb" opacity="0.12" filter="url(#blur)"/>
  <circle cx="320" cy="760" r="280" fill="#60a5fa" opacity="0.08" filter="url(#blur)"/>
  <circle cx="820" cy="420" r="180" fill="#38bdf8" opacity="0.06" filter="url(#blur)"/>
  <rect x="0" y="0" width="1600" height="900" fill="url(#g2)"/>
  <g opacity="0.28" filter="url(#blur)">
    <rect x="1030" y="240" rx="28" ry="28" width="210" height="92" fill="#ffffff"/>
    <rect x="1085" y="380" rx="28" ry="28" width="250" height="92" fill="#60a5fa"/>
    <rect x="980" y="520" rx="28" ry="28" width="230" height="92" fill="#ffffff"/>
  </g>
  <g transform="translate(180,180)" opacity="0.9">
    <path d="M260 190c-24-60-20-122 16-158 36-36 112-34 150 8 24 26 31 63 24 102-6 35-24 70-54 96l-62 16-74-64z" fill="#1f2937" opacity="0.95"/>
    <circle cx="380" cy="122" r="58" fill="#d9b08c"/>
    <rect x="354" y="172" width="40" height="44" rx="14" fill="#d9b08c"/>
    <path d="M300 220c44-28 118-28 168 0 36 20 58 56 66 108 8 50 4 92-12 124H248c-18-36-22-82-10-126 12-46 34-84 62-106z" fill="#0f172a"/>
    <path d="M286 286c54-10 106 0 154 26 18 10 30 24 38 40l-26 20c-22-16-42-26-58-31-48-14-92-11-130 7l-20-28c12-16 24-27 42-34z" fill="#d9b08c"/>
    <path d="M470 302c34 6 58 18 72 38l-18 28c-30-16-52-24-68-24-16 0-32 5-48 16l-18-26c18-20 42-31 80-32z" fill="#d9b08c"/>
    <g transform="translate(362,292) rotate(-6)">
      <rect x="0" y="0" width="150" height="110" rx="16" fill="#ffffff"/>
      <rect x="8" y="8" width="66" height="94" rx="10" fill="#e5eefc"/>
      <rect x="76" y="8" width="66" height="94" rx="10" fill="#dbeafe"/>
      <rect x="72" y="8" width="6" height="94" fill="#93c5fd"/>
      <path d="M22 30h36M22 48h28M90 30h34M90 48h26" stroke="#64748b" stroke-width="6" stroke-linecap="round"/>
    </g>
    <circle cx="440" cy="344" r="130" fill="#60a5fa" opacity="0.10" filter="url(#blur)"/>
  </g>
  <rect x="0" y="780" width="1600" height="120" fill="#020617" opacity="0.55"/>
</svg>
`;

const bgImage = `url("data:image/svg+xml;charset=UTF-8,${encodeURIComponent(bgSvg)}")`;

// HIGHLY ADVANCED LOCAL BOT LOGIC (To minimize API calls)
function getLocalBotReply(rawText) {
  const text = rawText.trim().toLowerCase();
  if (!text) return null;

  const rules = [
    // Greetings & Pleasantries
    {
      regex: /^(hi|hello|hey|hii|hy|namaste|namaskar|hola|heya)[!. ]*$/i,
      reply: "Namaste! Main Echo hoon. Aaj aap kaisa mehsoos kar rahe hain? Jo bhi dil mein ho, bina jhijhak bataiye."
    },
    {
      regex: /\b(how are you|kaise ho|kya haal|kese ho|how do you do)\b/i,
      reply: "Main bilkul theek hoon dost. Tum batao, aaj ka din kaisa chal raha hai? Sab theek?"
    },
    {
      regex: /\b(good morning|good night|good evening|good afternoon)\b/i,
      reply: "Aapko bhi! Umeed hai aapka samay achha beete. Koi baat share karni hai toh main yahi hoon."
    },
    {
      regex: /\b(thank you|thanks|shukriya|dhanyawad|thx)\b/i,
      reply: "Koi baat nahi! Ek dost hone ke naate mera yahi kaam hai. Jab bhi zarurat ho, main yahan hoon."
    },
    // Emotional Support (Sadness, Depression, Stress)
    {
      regex: /\b(sad|depress|dukhi|akela|lonely|rona|cry|broken|breakup|heart break|fail|failure|bura lag raha)\b/i,
      reply: "Mujhe sunkar bura laga... Zindagi mein aise bhaari pal aate hain. Tum akele nahi ho, main yahan sunne ke liye hoon. Agar thoda sukoon chahiye, toh Vedoxa par kuch self-help books kafi madadgar ho sakti hain. Par abhi, tum chaho to aur detail me bata sakte ho ki kya hua."
    },
    {
      regex: /\b(stress|anxious|tension|overthink|pareshan|dar|fear|ghabrahat)\b/i,
      reply: "Lamba saans lo... tension lena normal hai, par khud par haavi mat hone do. Ek kaam karo, apna focus present par lao. Kis baat ki itni tension hai? Mujhe batao, milkar sochte hain."
    },
    {
      regex: /\b(suicide|kill myself|marne ka|mar jau|end life)\b/i,
      reply: "Please ruko! Tumhari zindagi bahut keemti hai. Bura waqt humesha nahi rehta. Main ek AI/bot hoon, par insaaniyat ke naate darkhwast karta hoon ki please kisi dost, family ya professional helpline se turant baat karo. Tum akele nahi ho."
    },
    // Emotional Support (Anger, Frustration)
    {
      regex: /\b(angry|gussa|frustrat|irritat|dimag kharab|chidh)\b/i,
      reply: "Gussa aana bilkul normal hai, par us gusse mein khud ka nuksaan mat karna. Thoda paani piyo aur relax ho jao. Kisne dimag kharab kiya tumhara? Batao mujhe."
    },
    // Motivation & Work
    {
      regex: /\b(motivation|focus|study|padhai|kam|work|goal|lazy|bore|aalas|alasi)\b/i,
      reply: "Aalas aur distraction sabko hota hai! Chhote steps se shuru karo. Ek waqt me bas ek kaam. Agar focus badhana hai, toh Vedoxa ki productivity wali books try kar sakte ho. Abhi bas agle 10 minute apna 100% do!"
    },
    {
      regex: /\b(love|pyar|relationship|girlfriend|boyfriend|gf|bf|wife|husband)\b/i,
      reply: "Rishte kabhi bahut khubsurat hote hain aur kabhi bahut uljhe hue. Jo bhi feel kar rahe ho, khul kar batao. Main kisi ko judge nahi karta."
    },
    // Short Conversational Fillers
    {
      regex: /^(ok|okay|hmm|hmmm|acha|achha|yes|haan|ha|no|na|nahi|right|sahi)[. ]*$/i,
      reply: "Main samajh raha hoon. Tum aage batao, main sun raha hoon..."
    },
    {
      regex: /\b(koi nahi|kuch nahi|nothing)\b/i,
      reply: "Agar abhi baat karne ka mann nahi hai, toh koi baat nahi. Jab bhi dil halka karna ho, mujhe yahi paoge."
    },
    // Platform Queries
    {
      regex: /\b(vedoxa|website kaisi|website kya|site kaisi|site kya|what is vedoxa)\b/i,
      reply: "Vedoxa ek premium books platform hai jahan spiritual, self-help aur learning books milti hain. Ye ek shaant jagah hai apni growth par focus karne ke liye."
    },
    {
      regex: /\b(book|kitab|ebook|pdf)\b.*\b(kharid|buy|price|rate|kaise|download|cost)\b/i,
      reply: "Bahut simple hai: Apni pasand ki book choose karo, aur checkout karo. Payment ke baad instantly aapko access mil jayega padhne ya download karne ke liye."
    },
    {
      regex: /\b(login|signin|sign in|register|signup|sign up)\b/i,
      reply: "Login karne ke liye bas apna account banao ya Google se sign in karo. Uske baad apne dashboard se sab manage kar sakte ho."
    },
    {
      regex: /\b(payment|pay|upi|razorpay|transaction|checkout|fail|error)\b/i,
      reply: "Agar payment mein koi dikkat aa rahi hai, toh thodi der wait karke page refresh karein. Apni UPI ya card details check karke dobara try karein. Transaction fail hone par paise wapas aa jate hain."
    },
    {
      regex: /\b(download|pdf|open|reader|read)\b/i,
      reply: "Purchase ke baad book aapke reader ya dashboard me open ho jayegi. Agar wahan nahi khul rahi to ek baar page ko refresh kar lijiye."
    },
    // Identity & Meta
    {
      regex: /\b(who are you|about you|tum kaun|kya ho|ai|bot|chat gpt|chatgpt)\b/i,
      reply: "Main Echo hoon, tumhara apna digital dost. Mera kaam hai tumhari baatein sunna, samajhna aur ek safe space dena jahan tum khul kar baat kar sako."
    },
    {
      regex: /\b(bye|goodbye|alvida|cya|see you|tata)\b/i,
      reply: "Apna khayal rakhna dost! Jab bhi mann bhari ho ya akelepan ka ehsaas ho, main yahi rahunga."
    }
  ];

  // Search through all rules sequentially
  for (let rule of rules) {
    if (rule.regex.test(text)) {
      return rule.reply;
    }
  }

  // If nothing matches, let it return null to fall back to the API
  return null;
}

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

  // Smooth auto-scroll to the latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog, isAiTyping]);

  const loadUserMemory = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data: mem } = await supabase
        .from("soul_echo_memory")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      if (mem && mem.chat_history) {
        setMemory(mem.chat_history);
        setChatLog(mem.chat_history);
      }
    }
  };

  const handleAiResponse = async () => {
    if (!input.trim() || !user || isAiTyping) return;

    const userMessage = { role: "user", text: input };
    const updatedLog = [...chatLog, userMessage];
    
    // First, check if our advanced local bot can handle this
    const localReply = getLocalBotReply(input);

    if (localReply) {
      const finalLog = [...updatedLog, { role: "echo", text: localReply }];
      setChatLog(finalLog);
      setInput("");

      try {
        await supabase.from("soul_echo_memory").upsert(
          {
            user_id: user.id,
            chat_history: finalLog,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
        setMemory(finalLog);
      } catch (err) {
        console.error("Supabase Save Error:", err);
      }
      return;
    }

    // Heavy/Complex questions go to the Gemini API
    setChatLog(updatedLog);
    setInput("");
    setIsAiTyping(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
      
      const system_rules = `Tum ek bahut hi caring, emotional aur samajhdar insaan ho jo logon ki baatein sunna aur unki madad karna pasand karta hai. Tum koi AI, bot ya machine nahi ho. Tumhara kaam logon ki feelings ko samajhna aur ek sacche dost ki tarah unse baat karna hai.
      Rules:
      1. Short & Natural Answers: Hamesha chhote, to-the-point aur natural jawab do.
      2. Empathy: Agar user udas ya gusse me hai, toh sympathy dikhao aur uska sath do.
      3. Casual Book Suggestion: Zarurat padne par baaton-baaton me user ko 'vedoxa.shop' ki books casually suggest karo, but it should sound like a friend's advice.
      4. No Media/Links: Sirf text me baat karni hai.`;

      const apiHistory = memory.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }],
      }));

      apiHistory.push({
        role: "user",
        parts: [{ text: userMessage.text }],
      });

      const promptPayload = {
        system_instruction: { parts: [{ text: system_rules }] },
        contents: apiHistory,
        generationConfig: { temperature: 0.7 },
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}&alt=sse`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(promptPayload),
        }
      );

      // If API fails (e.g. invalid key), fallback to local friendly response
      if (!response.ok) {
        throw new Error("API Request Failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiText = "";

      // Add placeholder for AI response to allow streaming
      setChatLog([...updatedLog, { role: "echo", text: "" }]);

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

              setChatLog((prev) => {
                const newLog = [...prev];
                if (newLog.length > 0) newLog[newLog.length - 1].text = aiText;
                return newLog;
              });
            } catch (e) {
              console.error("Stream parse error", e);
            }
          }
        }
      }

      const finalLog = [...updatedLog, { role: "echo", text: aiText }];
      await supabase.from("soul_echo_memory").upsert(
        {
          user_id: user.id,
          chat_history: finalLog,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      setMemory(finalLog);

    } catch (err) {
      console.error(err);
      // Beautiful local fallback for API Key failures
      const fallbackReply = "Main tumhari baat samajh raha hoon dost. Abhi mera dimag thoda thak gaya hai (Network issue), par main humesha yahi rahunga sunne ke liye. Kuch aur baat karein?";
      
      const finalLog = [...updatedLog, { role: "echo", text: fallbackReply }];
      setChatLog(finalLog);
    } finally {
      setIsAiTyping(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#02040A] text-gray-200 font-sans selection:bg-blue-500/30">
      {/* Dynamic Background styling */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center blur-[8px] scale-110 opacity-40 transition-all duration-1000"
        style={{ backgroundImage: bgImage }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050508]/80 to-[#02040A]" />

      <div className="relative z-10 min-h-screen flex flex-col h-screen">
        {/* Sleek Glassmorphism Header */}
        <header className="bg-black/20 border-b border-white/5 p-4 sticky top-0 backdrop-blur-xl z-50 shadow-sm shadow-black/50">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/explore" 
                className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all duration-300"
              >
                <ChevronLeft size={20} />
              </Link>
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20">
                  <Heart className="text-blue-400 fill-current animate-pulse" size={16} />
                </div>
                <div>
                  <h1 className="font-semibold text-white/95 text-base tracking-wide">Soul Echo</h1>
                  <p className="text-[10px] text-blue-400/80 font-medium uppercase tracking-widest flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> Online
                  </p>
                </div>
              </div>
            </div>
            
            {/* Subtle header flair */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <Sparkles size={12} className="text-blue-400" />
              <span>Safe Space</span>
            </div>
          </div>
        </header>

        {/* Chat Area Container */}
        <div className="flex-1 max-w-4xl w-full mx-auto overflow-y-auto p-4 sm:p-6 flex flex-col gap-6 custom-scrollbar">
          
          {/* Welcoming UI / Empty State replacing the ugly text */}
          {!chatLog.length && (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] opacity-0 animate-[fadeIn_1s_ease-out_forwards]">
              <div className="w-20 h-20 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(59,130,246,0.15)]">
                <Heart className="text-blue-400 fill-blue-500/20" size={32} />
              </div>
              <h2 className="text-2xl font-semibold text-white/90 mb-2 text-center">Hi, I'm Echo</h2>
              <p className="text-gray-400 text-center max-w-md text-sm leading-relaxed px-4">
                This is your safe, judgment-free space. Share your feelings, ask questions, or just talk about your day.
              </p>
              <div className="flex gap-2 flex-wrap justify-center mt-8 opacity-70">
                {["I'm feeling sad today", "Suggest me a book", "How does Vedoxa work?", "Just wanted to say hi!"].map((pill, i) => (
                  <button 
                    key={i} 
                    onClick={() => { setInput(pill); }}
                    className="text-xs border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-full transition-all"
                  >
                    {pill}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {chatLog.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col w-full opacity-0 animate-[slideUp_0.4s_ease-out_forwards] ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`p-4 sm:p-5 rounded-3xl text-[15px] leading-relaxed max-w-[85%] sm:max-w-[75%] shadow-lg ${
                  msg.role === "user"
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-blue-900/20 border border-blue-400/20"
                    : "bg-white/[0.04] backdrop-blur-md border border-white/10 text-gray-200 rounded-tl-sm shadow-black/40"
                }`}
              >
                {/* Fallback to typing animation if API is processing streaming and text is empty */}
                {msg.text === "" ? (
                  <div className="flex gap-1.5 items-center px-2 py-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-[bounce_1s_infinite_0ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-[bounce_1s_infinite_200ms]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-[bounce_1s_infinite_400ms]" />
                  </div>
                ) : (
                  <span className="whitespace-pre-wrap">{msg.text}</span>
                )}
              </div>
            </div>
          ))}

          {/* Temporary Typing Indicator for AI before message bubble mounts */}
          {isAiTyping && chatLog[chatLog.length - 1]?.role !== "echo" && (
            <div className="flex flex-col items-start w-full opacity-0 animate-[slideUp_0.3s_ease-out_forwards]">
              <div className="p-4 sm:p-5 rounded-3xl max-w-[85%] bg-white/[0.04] backdrop-blur-md border border-white/10 rounded-tl-sm shadow-lg">
                <div className="flex gap-1.5 items-center px-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[bounce_1s_infinite_0ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[bounce_1s_infinite_200ms]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-[bounce_1s_infinite_400ms]" />
                </div>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} className="h-4 w-full" />
        </div>

        {/* Input Area */}
        <div className="bg-black/30 border-t border-white/5 sticky bottom-0 backdrop-blur-2xl px-4 py-4 sm:px-6">
          <div className="max-w-4xl mx-auto flex items-end gap-2 sm:gap-3 relative">
            <textarea
              rows={1}
              placeholder={user ? "Message Echo..." : "Please log in to chat..."}
              disabled={!user || isAiTyping}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAiResponse();
                }
              }}
              className="flex-1 bg-white/[0.05] border border-white/10 hover:border-white/20 focus:border-blue-500/50 rounded-3xl px-5 py-3.5 sm:py-4 text-white text-[15px] outline-none transition-all resize-none shadow-inner placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed max-h-32"
              style={{ minHeight: '52px' }}
            />
            <button
              onClick={handleAiResponse}
              disabled={!input.trim() || isAiTyping}
              className={`h-[52px] w-[52px] sm:w-16 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-lg shrink-0
                ${!input.trim() || isAiTyping 
                  ? 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-600/30 hover:scale-105 active:scale-95'
                }`}
            >
              <Send size={20} className={input.trim() && !isAiTyping ? "translate-x-0.5 -translate-y-0.5" : ""} />
            </button>
          </div>
          {!user && (
            <p className="text-center text-xs text-red-400/80 mt-3 font-medium">
              You need to log in to chat with Echo.
            </p>
          )}
          <div className="text-center text-[10px] text-gray-500/60 mt-3 font-medium tracking-wide">
            Echo is a supportive space. Vedoxa Team.
          </div>
        </div>
      </div>

      {/* Global Styles for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
