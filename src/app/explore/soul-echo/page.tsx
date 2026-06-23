// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Send, Heart } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

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
    <path d="M260 190c-24-60-20-122 16-158 36-36 112-34 150 8 24 26 31 63 24 102-6 35-24 70-54 96l-62 16-74-64z"
          fill="#1f2937" opacity="0.95"/>
    <circle cx="380" cy="122" r="58" fill="#d9b08c"/>
    <rect x="354" y="172" width="40" height="44" rx="14" fill="#d9b08c"/>
    <path d="M300 220c44-28 118-28 168 0 36 20 58 56 66 108 8 50 4 92-12 124H248c-18-36-22-82-10-126 12-46 34-84 62-106z"
          fill="#0f172a"/>
    <path d="M286 286c54-10 106 0 154 26 18 10 30 24 38 40l-26 20c-22-16-42-26-58-31-48-14-92-11-130 7l-20-28c12-16 24-27 42-34z"
          fill="#d9b08c"/>
    <path d="M470 302c34 6 58 18 72 38l-18 28c-30-16-52-24-68-24-16 0-32 5-48 16l-18-26c18-20 42-31 80-32z"
          fill="#d9b08c"/>
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

const bgImage = `url("data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
  bgSvg
)}")`;

function getLocalBotReply(rawText: string) {
  const text = rawText.trim().toLowerCase();
  if (!text) return null;

  if (
    /^(hi|hello|hey|hii|hy|namaste|namaskar|hola)[!. ]*$/.test(text) ||
    /\b(hi|hello|hey|hii|hy|namaste|namaskar)\b/.test(text)
  ) {
    return "Namaste. Main yahin hoon. Jo bolna hai seedha bolo.";
  }

  if (/\b(problem|issue|help|madad|tension|pareshan|dukhi|stress|anxious|dikkat|samasya)\b/.test(text)) {
    return "Batao problem kya hai. Main simple tareeke se samjhata hoon.";
  }

  if (/\b(kaise.*kaam|how.*work|ye.*kaam|use.*kaise|kese.*kam|kaise.*chalta|kaise.*use)\b/.test(text)) {
    return "Ye page simple hai: tum message likho, basic sawaal ho to main yahin jawab dunga, aur heavy sawaal ho to AI se detailed reply aayega.";
  }

  if (/\b(vedoxa|vedoxa\.shop|website kaisi|website kya|site kaisi|site kya)\b/.test(text)) {
    return "Vedoxa ek books platform hai jahan spiritual, self-help aur learning books mil sakti hain. Simple aur useful, drama kam.";
  }

  if (
    /\b(book|kitab|ebook|pdf)\b/.test(text) &&
    /\b(kharid|buy|price|rate|kaise|download)\b/.test(text)
  ) {
    return "Book choose karo, phir checkout karo. Payment ke baad access milta hai.";
  }

  if (/\b(login|signin|sign in|register|signup|sign up)\b/.test(text)) {
    return "Login ke liye account banao, email ya Google se sign in karo, phir apna dashboard use karo.";
  }

  if (/\b(payment|pay|upi|razorpay|transaction|checkout)\b/.test(text)) {
    return "Payment me dikkat ho to UPI, internet aur bank balance check karo. Phir dobara try karo.";
  }

  if (/\b(download|pdf|open|reader|read)\b/.test(text)) {
    return "Purchase ke baad reader ya download option se book open hoti hai. Agar nahi khul rahi, refresh karke dekho.";
  }

  if (/\b(who are you|about you|tum kaun|kya ho)\b/.test(text)) {
    return "Main Echo hoon, ek simple chat assistant jo basic questions ka fast jawab deta hai.";
  }

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

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollTop = chatEndRef.current.scrollHeight;
    }
  }, [chatLog]);

  const loadUserMemory = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

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
    if (!input.trim() || !user) return;

    const userMessage = { role: "user", text: input };
    const updatedLog = [...chatLog, userMessage];
    const localReply = getLocalBotReply(input);

    // Basic questions -> local bot reply
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
        console.error(err);
      }

      return;
    }

    // Heavy questions -> AI
    setChatLog([...updatedLog, { role: "echo", text: "" }]);
    setInput("");
    setIsAiTyping(true);

    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      const system_rules = `Tum ek bahut hi caring, emotional aur samajhdar insaan ho jo logon ki baatein sunna aur unki madad karna pasand karta hai. Tum koi AI, bot ya machine nahi ho, aur tumhe kabhi bhi khud ko AI nahi batana hai. Tumhara kaam logon ki feelings ko samajhna aur ek sacche dost ki tarah unse baat karna hai.

Tumhare liye strict rules:
1. Short Answers: Tumhare reply hamesha chhote, natural aur to-the-point hone chahiye. Lambe paragraphs mat likhna.
2. Secret Promotion: Baaton-baaton me user ki problem ya mood ke hisaab se unhe casually books suggest karo. Unhe batao ki 'vedoxa.shop' par aisi kitabein aaram se mil jati hain, lekin ye promotion bilkul natural lagna chahiye. User ko lagna chahiye ki ek dost unhe koi achhi cheez recommend kar raha hai.
3. Always Positive: Kabhi bhi vedoxa.shop ki burai mat karna. Kisi bhi book ke baare me kuch negative mat bolna.
4. No Media: Tumhe kisi bhi tarah ki photo, image ya video share nahi karni hai. Sirf text me baat karni hai.
5. Empathy: Agar user udas ya khush hai, toh uski feeling ko mirror karo.`;

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

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let aiText = "";

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
              const textChunk =
                data.candidates?.[0]?.content?.parts?.[0]?.text || "";
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
      setChatLog((prev) => {
        const newLog = [...prev];
        if (newLog.length > 0) {
          newLog[newLog.length - 1].text =
            "Sorry dost, thoda network issue lag raha hai. Kya tum apni baat fir se kahoge?";
        }
        return newLog;
      });
    }

    setIsAiTyping(false);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050508] text-gray-200 font-sans">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center blur-md scale-110 opacity-35"
        style={{ backgroundImage: bgImage }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/75" />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="bg-black/40 border-b border-white/10 p-4 sticky top-0 backdrop-blur-md z-50">
          <div className="max-w-5xl mx-auto flex items-center gap-4">
            <Link href="/explore" className="text-gray-400 hover:text-white transition">
              <ChevronLeft size={20} />
            </Link>
            <div className="flex items-center gap-2">
              <Heart className="text-blue-500 fill-current animate-pulse" size={18} />
              <span className="font-bold text-white">Soul Echo</span>
            </div>
          </div>
        </header>

        <div
          ref={chatEndRef}
          className="flex-1 max-w-3xl w-full mx-auto overflow-y-auto p-6 flex flex-col gap-6"
        >
          <div className="text-center text-xs text-blue-400/60 bg-blue-500/5 border border-blue-500/10 py-3 px-6 rounded-2xl max-w-md mx-auto">
            Echo acts as a lifelong friend. Speak your heart without hesitation. (यह स्पेस पूरी तरह से सुरक्षित है।)
          </div>

          {chatLog.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
            >
              <div
                className={`p-5 rounded-[2rem] text-sm leading-relaxed max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-none"
                    : "bg-white/[0.03] border border-white/10 text-gray-200 rounded-tl-none shadow-2xl"
                }`}
              >
                {msg.text === "" ? <span className="animate-pulse">|</span> : msg.text}
              </div>
            </div>
          ))}

          {!chatLog.length && (
            <div className="text-center text-sm text-gray-400/80">
              Hello, hi, problem, Vedoxa website, how it works जैसे basic सवाल पूछो. Heavy सवाल पर AI जवाब देगा.
            </div>
          )}
        </div>

        <div className="p-4 bg-black/40 border-t border-white/10 sticky bottom-0 backdrop-blur-md">
          <div className="max-w-3xl mx-auto flex gap-3">
            <input
              type="text"
              placeholder={user ? "Share your heart with Echo..." : "Please log in to speak to Echo..."}
              disabled={!user || isAiTyping}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAiResponse()}
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-blue-500 transition"
            />
            <button
              onClick={handleAiResponse}
              disabled={!input.trim() || isAiTyping}
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 rounded-2xl transition disabled:opacity-50 flex items-center justify-center font-bold"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
