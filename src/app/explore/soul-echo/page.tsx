"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, Send, Heart, Sparkles, Wind, Trash2, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

/* ───────────────────────── Supabase ───────────────────────── */
const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
);

/* ───────────────────────── Background (same as before) ───────────────────────── */
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

/* ═════════════════════════ ECHO BRAIN (local engine) ═════════════════════════
   Har intent: id, w (priority), re (pattern), replies (random), chips (follow-up suggestions)
   Sabse zyada weight wala match jeetta hai. Crisis hamesha sabse upar.
*/
const pick = (a) => a[Math.floor(Math.random() * a.length)];

const DEFAULT_CHIPS = ["Mood thoda down hai", "Ek achhi book batao", "Mujhe motivate karo", "Ek joke sunao"];

const INTENTS = [
  {
    id: "crisis", w: 100,
    re: /(suicide|suicidal|kill myself|end my life|end it all|want to die|khudkushi|jaan de|jaan dena|mar jaun|mar jau|marna chahta|marna chahti|marne ka (mann|man|dil)|jeena nahi|jeene ka mann nahi|zindagi khatam|khud ko (hurt|khatam|nuksaan)|self harm|cut myself)/i,
    replies: [
      "Main tumhari baat ko bahut seriously le raha hoon, aur tumne bataya, ye hi badi himmat hai. 💙\n\nPlease abhi kisi apne ko call karo ya paas me kisi ke saath baitho. Tum akele nahi ho.\n\n📞 Tele-MANAS: 14416 (free, 24x7)\n📞 AASRA: +91-9820466726\n🚨 Emergency: 112\n\nMain yahin hoon. Kya tum safe jagah par ho abhi?",
    ],
    chips: ["Haan, main safe hoon", "Mujhe baat karni hai", "Breathing karwao"],
  },
  { id: "greet", w: 20, re: /^\s*(hi+|hello+|hey+|hy|namaste|namaskar|hola|heya|yo|sup|hii+|helo|good (morning|afternoon|evening))[\s!.?]*$/i,
    replies: ["Namaste{name}! 🌙 Main Echo hoon. Aaj mann kaisa hai? Jo bhi dil me ho, bina jhijhak kaho.", "Hey{name}! Tumse milkar achha laga. Aaj ka din kaisa chal raha hai?", "Heyy{name} ✨ Bolo, kya chal raha hai zindagi me?"],
    chips: ["Mood thoda down hai", "Bas timepass", "Ek achhi book batao"] },
  { id: "night", w: 22, re: /\b(good night|gn|shubh ratri|sone ja raha|sone ja rahi|so jaata|so jati)\b/i,
    replies: ["Good night{name} 🌙 Aaj ki thakaan ko takiye ke hawale kar do. Kal ek naya din hai. Meethe sapne!"], chips: ["Neend nahi aa rahi", "Breathing karwao"] },
  { id: "how", w: 25, re: /\b(how are you|how r u|kaise ho|kese ho|kaisi ho|kya haal|kya hal|wassup|what'?s up|sab theek)\b/i,
    replies: ["Main bilkul mast, kyunki tumse baat ho rahi hai. 😊 Tum batao, tumhara haal kaisa hai?", "Main theek hoon dost! Par asli sawal ye ki tum kaise ho aaj?"],
    chips: ["Main theek hoon", "Thoda low feel ho raha hai", "Bahut khush hoon"] },
  { id: "thanks", w: 25, re: /\b(thank(s| you| u)?|thx|shukriya|dhanyawad|dhanyavaad|tysm)\b/i,
    replies: ["Arre koi baat nahi{name}! Dost ka yahi kaam hota hai. 💙", "Mujhe khushi hui ki madad kar paya. Jab bhi zarurat ho, main yahin hoon."], chips: DEFAULT_CHIPS },
  { id: "bye", w: 25, re: /\b(bye+|goodbye|alvida|cya|see you|tata|chalta hoon|chalti hoon|phir milte)\b/i,
    replies: ["Apna khayal rakhna{name}! Jab bhi mann bhaari ho ya baat karni ho, main yahin milunga. 🌟"], chips: [] },

  // Feelings
  { id: "sad", w: 40, re: /\b(sad|udaas|udas|dukhi|dukh|depress\w*|rona|rone|ro raha|ro rahi|cry\w*|broken|toot gaya|toot gayi|hurt|bura lag|dil dukha|low feel|down hai|mood off|mood kharab|hopeless|worthless|bekar)\b/i,
    replies: [
      "Sunkar dil bhaari ho gaya{name}... Ye feelings real hain aur tumhe unhe dabana nahi hai. Main sun raha hoon, kya hua tha?",
      "Aise din bahut thaka dete hain. Tum akele nahi ho, main yahin hoon. Chaho to poori baat batao, bina kisi judgement ke. 💙",
      "Kabhi kabhi bas ro lena bhi theek hota hai. Jab ready ho, batao kis cheez ne itna tod diya?",
    ], chips: ["Batata hoon kya hua", "Breathing karwao", "Kuch achha sunao"] },
  { id: "lonely", w: 40, re: /\b(akela|akeli|lonely|alone|koi nahi hai|no friends|dost nahi|tanha|tanhai|akelapan)\b/i,
    replies: ["Akelapan bahut chubhta hai, ye main samajhta hoon. Abhi is pal me tum mere saath ho, aur main poora dhyan de raha hoon. Kab se aisa feel ho raha hai?", "Tum jitna sochte ho utna akele nahi ho{name}. Chalo thoda baat karte hain, apne din ke baare me batao."],
    chips: ["Kisi se baat nahi hoti", "Bas yunhi baat karo", "Hobby suggest karo"] },
  { id: "stress", w: 38, re: /\b(stress\w*|anxi\w*|tension|overthink\w*|pareshan|ghabra\w*|dar lag|darr|fear|nervous|panic|bechain|restless|chinta|worry|worried)\b/i,
    replies: ["Ek gehri saans lo... andar 4, rok ke 4, bahar 6. Tension tumse badi nahi hai. Kis baat ki chinta hai? Ek ek karke suljhate hain.", "Overthinking dimag ki lambi daud hai jo kahin nahi pahunchti. Chalo usse ruk kar dekhte hain. Sabse bada darr kya hai abhi?"],
    chips: ["Breathing karwao", "Batata hoon kya hua", "Mujhe distract karo"] },
  { id: "anger", w: 36, re: /\b(angry|gussa|gusse|frustrat\w*|irritat\w*|dimag kharab|chidh|naraz|furious|hate|nafrat)\b/i,
    replies: ["Gussa aana human hai{name}. Pehle thoda paani piyo aur 10 tak ginti karo. Phir batao, kisne ya kis cheez ne ye halat ki?", "Main tumhare gusse ko sun raha hoon, bina judge kiye. Nikal do sab yahan, kya hua?"],
    chips: ["Breathing karwao", "Batata hoon kya hua"] },
  { id: "sleep", w: 36, re: /\b(neend|nind|sleep\w*|insomnia|so nahi|sona hai|raat ko jag|jaag raha|jaag rahi|thak gaya|thak gayi|thaka)\b/i,
    replies: ["Neend na aana bahut pareshan karta hai. Try karo: screen band, halki roshni, 4-7-8 breathing (4 saans andar, 7 rokna, 8 bahar). Aur dimag me jo chal raha hai, yahan likh do, halka lagega. Kya soch rahe ho?"],
    chips: ["Breathing karwao", "Kuch soch raha hoon", "Good night"] },
  { id: "happy", w: 30, re: /\b(khush|happy|mast|amazing|great day|achha lag raha|accha lag raha|excited|celebrate|selected|promotion|pass ho gaya|pass ho gayi|got the job)\b/i,
    replies: ["Waah! Ye sunkar mera din ban gaya{name}! 🎉 Kya hua, poori kahani sunao!", "Bahut badhiya! Is khushi ko pura jee lo. Batao kis baat ka celebration hai?"],
    chips: ["Bahut achhi news hai", "Ek joke sunao"] },
  { id: "love", w: 34, re: /\b(love|pyar|pyaar|relationship|girlfriend|boyfriend|\bgf\b|\bbf\b|crush|breakup|break up|ex\b|dhoka|cheat\w*|shaadi|marriage|propose)\b/i,
    replies: ["Rishte dil ke sabse khoobsurat aur sabse uljhe hisse hote hain. Main bina judge kiye sun raha hoon, kya chal raha hai?", "Dil ki baat dil se kehni chahiye. Thoda detail me batao, shayad saath me clear picture mile."],
    chips: ["Breakup ho gaya", "Crush hai mujhe", "Kisi ne dhoka diya"] },
  { id: "family", w: 30, re: /\b(papa|mummy|maa|mom|dad|parents|ghar wale|family|bhai|behen|sister|brother|pitaji)\b/i,
    replies: ["Family ke saath rishte pyaar bhi dete hain aur kabhi kabhi takraav bhi. Kya hua, thoda khulke batao?"], chips: ["Ghar me jhagda hua", "Papa mummy samajhte nahi"] },
  { id: "study", w: 30, re: /\b(padhai|padhna|study|exam|result|marks|syllabus|neet|jee|upsc|board|college|school|assignment|revision|focus nahi|concentrate)\b/i,
    replies: ["Padhai ke liye Pomodoro try karo: 25 min deep focus + 5 min break. Phone dusre kamre me. Sabse mushkil topic subah ke time pehle karo. Kaunsa subject ya exam hai?", "Exam ka pressure real hai, par tum usse zyada capable ho. Chhote targets banao: aaj sirf 2 chapters. Kya prep chal rahi hai?"],
    chips: ["Focus nahi hota", "Exam se dar lagta hai", "Study plan banao"] },
  { id: "motivate", w: 30, re: /\b(motivat\w*|inspire|inspiration|himmat|haar gaya|haar gayi|give up|quit|aalas|alasi|lazy|procrastinat\w*|demotivat\w*|mann nahi lag raha|kuch karne ka mann nahi)\b/i,
    replies: ["Perfect nahi, bas shuru karo. 2 minute ka rule: koi bhi kaam sirf 2 minute ke liye karo, baaki momentum sambhal lega. Abhi pehla chhota step kya hoga?", "Giri hui mehnat bhi kabhi zaya nahi jaati{name}. Aaj bas ek kaam poora karo, kal ek aur. Chalo bataao, kis cheez me atke ho?", "Tum wahan nahi ho jahan shuru kiya tha, aur wahan bhi nahi jahan pahunchoge. Bas beech me ho. Chalte raho. 🌱"],
    chips: ["Ek quote sunao", "Goal set karna hai", "Vedoxa books batao"] },
  { id: "career", w: 28, re: /\b(job|naukri|career|interview|resume|cv|salary|business|startup|boss|office|work pressure|internship|freelanc\w*)\b/i,
    replies: ["Career ke sawal bade hote hain par suljhaye ja sakte hain. Batao: abhi kis stage par ho (student, job, switch, business) aur kya challenge hai?"],
    chips: ["Interview ki tayyari", "Job switch karna hai", "Business idea chahiye"] },
  { id: "money", w: 26, re: /\b(paisa|paise|money|loan|debt|karz|invest\w*|saving\w*|budget|emi|sip|mutual fund|crypto|share market|stock)\b/i,
    replies: ["Paise ki tension sabko hoti hai. Basic rule: pehle emergency fund (3-6 mahine kharcha), phir investment. Main general idea de sakta hoon, par bade faisle ke liye certified financial advisor se zaroor milna. Kis cheez ki baat karni hai?"],
    chips: ["Budget kaise banau", "Saving tips do"] },
  { id: "health", w: 26, re: /\b(sir dard|headache|bukhar|fever|pet dard|dard|bimar|sick|doctor|medicine|dawai|cough|khansi|cold|zukam|weight|diet|gym|exercise)\b/i,
    replies: ["Meri general advice: aaram, paani aur achhi neend. Par ye doctor ka kaam hai, agar dard zyada ho ya kai din se ho to please doctor se milo. Aur kya symptoms hain?"],
    chips: ["Diet tips", "Workout shuru karna hai"] },

  // Fun
  { id: "joke", w: 30, re: /\b(joke|chutkula|hasao|hasa do|funny|mazak|laugh)\b/i,
    replies: [
      "Teacher: Tumhare homework ko kutte ne kha liya? Student: Nahi sir, mera kutta hi nahi hai, isliye maine khud hi nahi kiya. 😂",
      "Pappu: Mummy mujhe school nahi jana. Mummy: Beta tum principal ho, jaana padega! 😄",
      "Dost: Tumhari memory itni kharab kyun hai? Main: Kaun si memory? 🙈",
      "WiFi aur tension me ek cheez common hai: bina bataye aate hain, aur jaane ka naam nahi lete. 😅",
    ], chips: ["Ek aur joke", "Shayari sunao", "Fun fact batao"] },
  { id: "shayari", w: 30, re: /\b(shayari|shayri|poem|kavita|sher|ghazal)\b/i,
    replies: [
      "Raat ke andhere me bhi ek diya jalta hai,\nJo toot ke bhi jodna sikhata hai,\nHaar maan lena aasan hai dost,\nPar jeet unki hoti hai jo gir ke uthta hai. ✨",
      "Dil ki baat labzon me kahan aati hai,\nKhamoshi bhi kabhi kabhi sab bata jaati hai,\nThoda sabr rakh, waqt badlega zaroor,\nHar raat ke baad ek subah aati hai. 🌅",
    ], chips: ["Ek aur shayari", "Quote sunao", "Ek joke sunao"] },
  { id: "quote", w: 28, re: /\b(quote|suvichar|thought|gyaan|gyan|wisdom|vichar)\b/i,
    replies: ["\"Jo tum aaj karte ho, wahi kal tumhari kahani banta hai.\" 🌟", "\"Dheere chalna galat nahi, ruk jaana galat hai.\"", "\"Tum utne toote nahi ho jitna tum sochte ho, tum bas thake hue ho.\" 💙", "\"Chhote kadam bhi manzil tak pahunchate hain.\""],
    chips: ["Ek aur quote", "Motivate karo", "Shayari sunao"] },
  { id: "fact", w: 28, re: /\b(fun fact|fact|interesting|kuch naya|kuch interesting)\b/i,
    replies: ["Fun fact: Octopus ke 3 dil hote hain aur unka khoon neela hota hai! 🐙", "Fun fact: Shahad kabhi kharab nahi hota. Misr ke maqbaron me 3000 saal purana shahad bhi khaane layak mila! 🍯", "Fun fact: Insaani dimag din me lagbhag 6000 vichar paida karta hai. Aaj ka kaun sa vichar sabse khaas tha? 🧠"],
    chips: ["Ek aur fact", "Ek joke sunao"] },
  { id: "music", w: 22, re: /\b(gaana|gana|song|music|movie|film|series|web series|netflix|anime|game|gaming|cricket)\b/i,
    replies: ["Ooh mujhe bhi ye topic pasand hai! Tum kya dekhte/sunte ho zyada? Apna favourite batao, main bhi suggestions de sakta hoon."], chips: ["Movie suggest karo", "Gaane batao"] },
  { id: "food", w: 20, re: /\b(khana|bhook|hungry|food|recipe|chai|coffee|pizza|biryani|dinner|lunch|breakfast)\b/i,
    replies: ["Bhook lagi hai? Pehle kuch achha kha lo, mood bhi sudharta hai. Chai ho to sone pe suhaga. ☕ Kya khane ka mann hai?"], chips: ["Easy recipe batao"] },

  // Actions
  { id: "breathe", w: 45, re: /\b(breath\w*|saans|relax|calm|shant|meditat\w*|dhyan|panic attack)\b/i, action: "breathe",
    replies: ["Chalo saath me saans lete hain. Maine ek breathing screen khol di hai, bas circle ke saath saans andar aur bahar karo. 🌬️"], chips: ["Ab behtar lag raha hai", "Aur baat karni hai"] },

  // Books / Vedoxa
  { id: "book", w: 32, re: /\b(book|books|kitab|kitaab|ebook|e-book|novel|padhne ke liye|reading|self.?help|spiritual|gita|suggest.*(book|kitab))\b/i,
    replies: ["Agar tumhe growth ya sukoon chahiye, to Vedoxa par self-help aur spiritual books ek baar zaroor dekho. Mood batao (motivation, shanti, focus, ya rishte), main usi hisaab se direction dunga. 📚"],
    chips: ["Motivation wali book", "Shanti wali book", "Focus wali book"] },
  { id: "vedoxa", w: 34, re: /\b(vedoxa|vedoxa kya|website kya|site kya|platform|what is vedoxa|about vedoxa)\b/i,
    replies: ["Vedoxa ek premium books platform hai jahan spiritual, self-help aur learning books milti hain. Ek shaant jagah, apni growth par focus karne ke liye. 🌿"], chips: ["Book kaise kharidu", "Payment problem hai"] },
  { id: "buy", w: 34, re: /\b(kharid\w*|buy|purchase|price|kimat|rate|cost|offer|discount|coupon|order)\b/i,
    replies: ["Bahut simple: apni pasand ki book choose karo, checkout karo, payment ke turant baad access mil jata hai padhne/download karne ke liye. Koi coupon ya offer ho to checkout par daalna."], chips: ["Payment problem hai", "Book download kaise"] },
  { id: "login", w: 34, re: /\b(login|log in|signin|sign in|register|signup|sign up|account|password|otp|google se)\b/i,
    replies: ["Login ke liye account banao ya Google se sign in karo. Password bhool gaye ho to 'Forgot password' use karo. Uske baad dashboard se sab manage ho jayega."], chips: ["Payment problem hai"] },
  { id: "payment", w: 36, re: /\b(payment|pay|upi|razorpay|transaction|checkout|paise kat|paisa kat|refund|failed|fail ho|error|nahi ho raha)\b/i,
    replies: ["Payment atak gayi? Page refresh karke 2-3 minute ruko, UPI/card details check karo aur dobara try karo. Agar paise kat gaye aur order nahi bana, to aam taur par 5-7 working days me wapas aa jaate hain. Phir bhi dikkat ho to Vedoxa support se transaction ID ke saath contact karo."],
    chips: ["Book download kaise", "Support se baat karni hai"] },
  { id: "reader", w: 34, re: /\b(download|pdf|open nahi|khul nahi|reader|read online|kaise padhu|dashboard)\b/i,
    replies: ["Purchase ke baad book tumhare dashboard/reader me khul jaati hai. Na khule to page refresh karo, dobara login karo, ya browser update karke try karo."], chips: ["Support se baat karni hai"] },
  { id: "support", w: 34, re: /\b(support|contact|help desk|customer care|complaint|shikayat)\b/i,
    replies: ["Technical ya order problem ke liye Vedoxa support ko apna registered email aur transaction ID bhejo, wo jaldi madad karenge."], chips: [] },

  // Meta
  { id: "who", w: 30, re: /\b(who are you|tum kaun|aap kaun|kaun ho tum|tera naam|tumhara naam|your name|about you|are you (a )?(bot|ai|human|real)|insaan ho|robot|chat ?gpt|gemini)\b/i,
    replies: ["Main Echo hoon, Vedoxa ka AI saathi. 💙 Main insaan nahi hoon, par tumhari baat dhyan se sunta hoon aur ek safe jagah dene ki koshish karta hoon. Zarurat padne par asli logon aur professionals ka saath bhi zaroor lena."],
    chips: ["Tum kya kar sakte ho?", "Mood thoda down hai"] },
  { id: "can", w: 30, re: /\b(kya kar sakte|what can you do|help me|madad|features|kaam kya)\b/i,
    replies: ["Main ye sab kar sakta hoon:\n💬 Dil ki baat sunna\n🌬️ Breathing/relaxation\n📚 Book suggestions\n🎯 Motivation aur study tips\n😄 Joke, shayari, quotes, fun facts\n🧮 Calculation, time/date\nBas bolo!"],
    chips: ["Breathing karwao", "Joke sunao", "Book batao"] },
  { id: "praise", w: 24, re: /\b(you are (great|good|best|nice|amazing)|tum achhe|tum acche|best bot|love you|i love you|mast ho|badhiya ho)\b/i,
    replies: ["Aww, shukriya{name}! 🥹 Tumhare ye shabd mere liye bahut matlab rakhte hain. Par asli hero tum ho jo apni baat share karne ki himmat rakhte ho."], chips: DEFAULT_CHIPS },
  { id: "rude", w: 24, re: /\b(stupid|idiot|bakwas|pagal|useless|bekar bot|shut up|chup)\b/i,
    replies: ["Lagta hai tum abhi kisi baat se pareshan ho. Koi baat nahi, main yahin hoon. Kya hua batao?"], chips: ["Gussa aa raha hai", "Breathing karwao"] },
  { id: "idk", w: 22, re: /\b(koi nahi|kuch nahi|nothing|pata nahi|dont know|don't know|samajh nahi aa raha|confused)\b/i,
    replies: ["Koi baat nahi, kabhi kabhi khud ko bhi samajh nahi aata. Chaho to sirf itna batao: aaj ka din 1 se 10 me kitna raha?", "Theek hai, jab mann ho tab batana. Main yahin hoon. Tab tak ek chhoti si baat batao: aaj sabse achhi cheez kya hui?"],
    chips: ["Din 5/10 raha", "Bas yunhi baat karo", "Mujhe distract karo"] },
  { id: "bored", w: 28, re: /\b(bore|bored|boring|timepass|time pass|kuch karna hai|kya karu)\b/i,
    replies: ["Bore ho rahe ho? Chalo kuch karte hain: ek joke, ek puzzle, shayari ya fun fact. Kya pasand karoge? 🎲", "Riddle: Aisi kaun si cheez hai jo jitni bhi baanto utni badhti hai? (Jawab: Khushi 😉) Ab tum batao, kuch aur try karein?"],
    chips: ["Joke sunao", "Fun fact batao", "Shayari sunao"] },
];

// Follow-up replies jab user chhota "haan/nahi/ok" bole
const FOLLOW = {
  sad: "Main sun raha hoon. Dheere dheere batao, jo bhi mann me hai.",
  lonely: "Theek hai. Batao, aaj ka din kaisa gaya? Chhoti chhoti baatein bhi chalengi.",
  stress: "Achha. Ek kaam karte hain: apni sabse badi tension ek line me likho, main saath sochta hoon.",
  crisis: "Main yahin hoon. Kya tum abhi kisi ke saath ho ya akele? Aur kya tum Tele-MANAS 14416 par call kar sakte ho?",
  default: "Main samajh raha hoon. Tum aage batao, main sun raha hoon...",
};
const FILLER = /^\s*(ok+|okay|hmm+|acha|achha|accha|yes|haan|han|ha|no|na|nahi|right|sahi|theek hai|ok hai|thik hai|hm+|yup|haa)[\s.!]*$/i;

function safeCalc(raw) {
  const t = raw.toLowerCase().replace(/(calculate|calc|kitna hota hai|equals?|=|\?|kya hai)/g, "").replace(/[x×]/g, "*").replace(/÷/g, "/").replace(/\^/g, "**").replace(/(\d)\s*%\s*of\s*(\d)/g, "($1/100)*$2").trim();
  if (!/^[\d\s+\-*/().%]+$/.test(t) || !/[+\-*/%]/.test(t) || !/\d/.test(t)) return null;
  try {
    const v = Function(`"use strict"; return (${t})`)();
    if (typeof v !== "number" || !isFinite(v)) return null;
    return `Jawab: ${Math.round(v * 1e6) / 1e6}`;
  } catch { return null; }
}

function getLocalBotReply(raw, ctx) {
  const text = (raw || "").trim();
  if (!text) return null;
  const name = ctx.name ? ` ${ctx.name}` : "";
  const fmt = (s) => s.replace(/\{name\}/g, name);

  // Naam yaad rakhna
  const nm = text.match(/(?:mera naam|my name is|main hoon|i am|i'm|mujhe .* bulao)\s+([a-zA-Z\u0900-\u097F]{2,20})\b/i);
  if (nm && !/(sad|happy|fine|ok|theek|udaas|dukhi|khush|tired|bore|good|bad)/i.test(nm[1])) {
    const n = nm[1][0].toUpperCase() + nm[1].slice(1);
    return { text: `Bahut achha laga milke, ${n}! 😊 Ab se main tumhe ${n} hi bulaunga. Batao, aaj kaisa feel ho raha hai?`, id: "name", setName: n, chips: DEFAULT_CHIPS };
  }

  // Calculator
  const calc = safeCalc(text);
  if (calc) return { text: calc, id: "calc", chips: ["Aur calculation", ...DEFAULT_CHIPS.slice(0, 2)] };

  // Time / Date
  if (/\b(time kya|kitne baje|abhi time|samay kya|what time|current time)\b/i.test(text))
    return { text: `Abhi ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })} ho rahe hain. ⏰`, id: "time", chips: DEFAULT_CHIPS };
  if (/\b(aaj (kya|kaun)|today'?s date|aaj ki date|tarikh|kaunsa din|what day)\b/i.test(text))
    return { text: `Aaj ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} hai. 📅`, id: "date", chips: DEFAULT_CHIPS };

  // Filler (follow-up by context)
  if (FILLER.test(text) && ctx.lastIntent) {
    return { text: FOLLOW[ctx.lastIntent] || FOLLOW.default, id: ctx.lastIntent, chips: [] };
  }

  // Score
  let best = null;
  for (const it of INTENTS) {
    if (it.re.test(text) && (!best || it.w > best.w)) best = it;
  }
  if (best) {
    return { text: fmt(pick(best.replies)), id: best.id, chips: best.chips || DEFAULT_CHIPS, action: best.action };
  }
  if (FILLER.test(text)) return { text: FOLLOW.default, id: "filler", chips: [] };
  return null;
}

// API fail hone par bhi achha jawab
const SOFT_FALLBACKS = [
  "Main tumhari baat sun raha hoon{name}. Thoda aur detail me batao, taaki main sahi se samajh sakun?",
  "Ye sochne wali baat hai. Tumhe iske baare me sabse zyada kya pareshan karta hai?",
  "Samajh raha hoon. Agar chaho to main isse chhote hisson me todke suljhane me madad kar sakta hoon. Pehle kaunsa hissa lein?",
  "Thoda network slow lag raha hai, par main yahin hoon. Tum apni baat jaari rakho, main dhyan se sun raha hoon. 💙",
];

/* ───────────────────────── UI pieces ───────────────────────── */
function Typewriter({ text, onTick }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    setN(0);
    const step = Math.max(1, Math.ceil(text.length / 140));
    const id = setInterval(() => {
      setN((p) => {
        const nx = Math.min(text.length, p + step);
        if (nx >= text.length) clearInterval(id);
        return nx;
      });
    }, 22);
    return () => clearInterval(id);
  }, [text]);
  useEffect(() => { onTick && onTick(); }, [n]); // eslint-disable-line
  return <span className="whitespace-pre-wrap">{text.slice(0, n)}</span>;
}

function Logo({ size = 40 }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-full bg-blue-500/20 animate-[ring_3s_ease-out_infinite]" />
      <span className="absolute inset-0 rounded-full bg-indigo-400/20 animate-[ring_3s_ease-out_1.5s_infinite]" />
      <span className="absolute inset-[10%] rounded-full bg-gradient-to-br from-blue-500 via-indigo-500 to-sky-400 animate-[glow_4s_ease-in-out_infinite] shadow-[0_0_25px_rgba(96,165,250,0.5)]" />
      <Heart className="relative text-white fill-white/90 animate-[beat_2.4s_ease-in-out_infinite]" size={size * 0.42} />
      <Sparkles className="absolute -top-1 -right-1 text-sky-300 animate-[twinkle_2.8s_ease-in-out_infinite]" size={size * 0.28} />
    </div>
  );
}

function BreathingModal({ onClose }) {
  const phases = [
    { t: "Saans andar lo...", s: 4000 },
    { t: "Roko...", s: 3000 },
    { t: "Dheere bahar chhodo...", s: 5000 },
  ];
  const [i, setI] = useState(0);
  const [rounds, setRounds] = useState(0);
  useEffect(() => {
    const id = setTimeout(() => {
      const next = (i + 1) % phases.length;
      if (next === 0) setRounds((r) => r + 1);
      setI(next);
    }, phases[i].s);
    return () => clearTimeout(id);
  }, [i]); // eslint-disable-line
  const scale = i === 0 ? "scale-100" : i === 1 ? "scale-100" : "scale-[0.55]";
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xl animate-[fade_0.5s_ease-out]">
      <button onClick={onClose} aria-label="Close" className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 transition">
        <X size={20} />
      </button>
      <div className="flex flex-col items-center gap-10 px-6 text-center">
        <div className="relative flex items-center justify-center w-64 h-64">
          <div className="absolute inset-0 rounded-full bg-blue-500/10 blur-2xl" />
          <div
            className={`w-56 h-56 rounded-full bg-gradient-to-br from-blue-500/40 to-indigo-500/30 border border-blue-300/30 shadow-[0_0_60px_rgba(96,165,250,0.35)] transition-transform ease-in-out ${scale}`}
            style={{ transitionDuration: `${phases[i].s}ms` }}
          />
        </div>
        <div>
          <p className="text-xl text-white/90 font-medium tracking-wide">{phases[i].t}</p>
          <p className="text-sm text-white/40 mt-2">Round {rounds + 1} · Jitna mann ho utna karo</p>
        </div>
        <button onClick={onClose} className="text-sm text-white/70 border border-white/15 hover:bg-white/10 px-6 py-2.5 rounded-full transition">
          Ho gaya, thanks
        </button>
      </div>
    </div>
  );
}

const MOODS = [
  { e: "😊", t: "Main khush hoon aaj" },
  { e: "😐", t: "Aaj bas theek hai" },
  { e: "😔", t: "Main udaas hoon" },
  { e: "😠", t: "Mujhe gussa aa raha hai" },
  { e: "😰", t: "Mujhe bahut tension hai" },
];

// Purana system: key browser se hi use hoti hai (NEXT_PUBLIC_GEMINI_API_KEY)
const GEMINI_MODEL = process.env.NEXT_PUBLIC_GEMINI_MODEL || "gemini-2.0-flash";
const SYSTEM_RULES = `Tum "Echo" ho, Vedoxa ka ek warm, samajhdar AI saathi. Hinglish (Roman Hindi + thoda English) me baat karo, user ka mood match karo.
Rules:
1. Jawab chhote aur natural rakho (2-5 line).
2. Pehle feelings samjho, phir madad karo. Judge mat karo. Ek hi follow-up sawal pucho.
3. Agar user poochhe ki tum insaan ho ya AI, saaf batao ki tum AI ho.
4. Normal sawal (padhai, coding, GK, advice, math, career) ka bhi seedha, sahi jawab do.
5. 'vedoxa.shop' ki books sirf tab casually suggest karo jab baat self-help, growth ya padhne ki ho.
6. Agar user khud ko nuksaan pahunchane ki baat kare: pyaar se lo aur turant kisi apne aur helpline (India: Tele-MANAS 14416, emergency 112) se judne ko kaho.
7. Sirf text, koi link ya media nahi.`;

const LS_KEY = "soul_echo_chat_v2";
const LS_NAME = "soul_echo_name";

/* ───────────────────────── Page ───────────────────────── */
export default function SoulEchoPage() {
  const [user, setUser] = useState(null);
  const [chatLog, setChatLog] = useState([]);
  const [input, setInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chips, setChips] = useState(DEFAULT_CHIPS);
  const [breathing, setBreathing] = useState(false);
  const [name, setName] = useState("");
  const [freshId, setFreshId] = useState(null);

  const chatEndRef = useRef(null);
  const scrollRef = useRef(null);
  const taRef = useRef(null);
  const lastIntent = useRef(null);
  const busy = useRef(false);

  const scrollDown = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  /* load: localStorage first (instant), then Supabase if logged in */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      if (Array.isArray(saved) && saved.length) setChatLog(saved);
      setName(localStorage.getItem(LS_NAME) || "");
    } catch {}

    let sub;
    (async () => {
      if (!hasSupabase) return;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) await hydrateUser(session.user);
        const res = supabase.auth.onAuthStateChange((_e, s) => { if (s?.user) hydrateUser(s.user); else setUser(null); });
        sub = res?.data?.subscription;
      } catch (e) { console.error(e); }
    })();
    return () => sub?.unsubscribe?.();
  }, []); // eslint-disable-line

  async function hydrateUser(u) {
    setUser(u);
    try {
      const { data: mem } = await supabase.from("soul_echo_memory").select("chat_history").eq("user_id", u.id).maybeSingle();
      if (mem?.chat_history?.length) {
        setChatLog(mem.chat_history);
        localStorage.setItem(LS_KEY, JSON.stringify(mem.chat_history.slice(-100)));
      }
    } catch (e) { console.error(e); }
  }

  useEffect(() => { const id = setTimeout(() => scrollDown(true), 30); return () => clearTimeout(id); }, [chatLog, isAiTyping, scrollDown]);

  // textarea auto-height
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "0px";
    ta.style.height = Math.min(ta.scrollHeight, 128) + "px";
  }, [input]);

  const persist = async (log) => {
    const trimmed = log.slice(-100);
    try { localStorage.setItem(LS_KEY, JSON.stringify(trimmed)); } catch {}
    if (user && hasSupabase) {
      try {
        await supabase.from("soul_echo_memory").upsert(
          { user_id: user.id, chat_history: trimmed, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );
      } catch (e) { console.error("Supabase Save Error:", e); }
    }
  };

  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const mk = (role, text) => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, role, text, ts: Date.now() });

  const send = async (override) => {
    const raw = (typeof override === "string" ? override : input).trim();
    if (!raw || busy.current) return;
    busy.current = true;

    const userMsg = mk("user", raw);
    const updated = [...chatLog, userMsg];
    setChatLog(updated);
    setInput("");
    setChips([]);
    setIsAiTyping(true);

    let replyText = "";
    let nextChips = DEFAULT_CHIPS;

    try {
      const local = getLocalBotReply(raw, { name, lastIntent: lastIntent.current });
      if (local) {
        await wait(500 + Math.min(900, local.text.length * 6)); // natural typing delay
        replyText = local.text;
        nextChips = local.chips?.length ? local.chips : DEFAULT_CHIPS;
        lastIntent.current = local.id;
        if (local.setName) { setName(local.setName); try { localStorage.setItem(LS_NAME, local.setName); } catch {} }
        if (local.action === "breathe") setTimeout(() => setBreathing(true), 900);
      } else {
        // Koi bhi sawal -> AI (server route)
        try {
          const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
          if (!apiKey) throw new Error("no key");
          let contents = updated.slice(-14).map((m) => ({
            role: m.role === "user" ? "user" : "model",
            parts: [{ text: String(m.text || "").slice(0, 2000) }],
          }));
          while (contents.length && contents[0].role !== "user") contents.shift();
          const ctrl = new AbortController();
          const to = setTimeout(() => ctrl.abort(), 20000);
          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: SYSTEM_RULES }] },
                contents,
                generationConfig: { temperature: 0.75, maxOutputTokens: 500 },
              }),
              signal: ctrl.signal,
            }
          );
          clearTimeout(to);
          if (!res.ok) throw new Error("api " + res.status);
          const data = await res.json();
          const aiText = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join("") || "";
          if (!aiText.trim()) throw new Error("empty");
          replyText = aiText.trim();
          lastIntent.current = "ai";
        } catch (e) {
          replyText = pick(SOFT_FALLBACKS).replace(/\{name\}/g, name ? ` ${name}` : "");
          lastIntent.current = "fallback";
        }
      }
    } catch (e) {
      console.error(e);
      replyText = "Kuch gadbad ho gayi, par main yahin hoon. Ek baar phir se likhoge?";
    }

    const echoMsg = mk("echo", replyText);
    const finalLog = [...updated, echoMsg];
    setIsAiTyping(false);
    setFreshId(echoMsg.id);
    setChatLog(finalLog);
    setChips(nextChips);
    busy.current = false;
    persist(finalLog);
  };

  const clearChat = async () => {
    setChatLog([]);
    setChips(DEFAULT_CHIPS);
    lastIntent.current = null;
    try { localStorage.removeItem(LS_KEY); } catch {}
    if (user && hasSupabase) {
      try { await supabase.from("soul_echo_memory").upsert({ user_id: user.id, chat_history: [], updated_at: new Date().toISOString() }, { onConflict: "user_id" }); } catch {}
    }
  };

  const fmtTime = (ts) => { try { return new Date(ts).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }); } catch { return ""; } };

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-[#02040A] text-gray-200 font-sans selection:bg-blue-500/30">
      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center blur-[8px] scale-110 opacity-40" style={{ backgroundImage: bgImage }} />
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-transparent via-[#050508]/80 to-[#02040A]" />
      {/* floating soft orbs */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 rounded-full bg-blue-600/10 blur-3xl animate-[drift_14s_ease-in-out_infinite]" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-10 -right-20 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl animate-[drift_18s_ease-in-out_infinite_reverse]" />

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <header className="bg-black/20 border-b border-white/5 px-4 py-3 backdrop-blur-xl shadow-sm shadow-black/50 shrink-0">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/explore" aria-label="Back" className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-full transition-all duration-300 hover:-translate-x-0.5">
                <ChevronLeft size={20} />
              </Link>
              <Logo size={42} />
              <div>
                <h1 className="font-semibold text-white/95 text-base tracking-wide leading-tight">Soul Echo</h1>
                <p className="text-[10px] text-blue-300/80 font-medium uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  {isAiTyping ? "typing..." : "Online"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setBreathing(true)} className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-2 rounded-full border border-white/5 transition-all duration-300">
                <Wind size={13} className="text-sky-300" /> <span className="hidden sm:inline">Breathe</span>
              </button>
              {chatLog.length > 0 && (
                <button onClick={clearChat} aria-label="Clear chat" className="text-white/40 hover:text-red-300 bg-white/5 hover:bg-white/10 p-2 rounded-full border border-white/5 transition-all duration-300">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Chat */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto scroll-smooth custom-scrollbar">
          <div className="max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-5 min-h-full">
            {!chatLog.length && (
              <div className="flex-1 flex flex-col items-center justify-center min-h-[55vh] animate-[fadeIn_1s_ease-out_both]">
                <div className="mb-6"><Logo size={92} /></div>
                <h2 className="text-2xl font-semibold text-white/90 mb-2 text-center">Hi{name ? `, ${name}` : ""}, main Echo hoon</h2>
                <p className="text-gray-400 text-center max-w-md text-sm leading-relaxed px-4">
                  Ye tumhari safe, judgment-free jagah hai. Dil ki baat kaho, sawal pucho, ya bas din ke baare me baat karo.
                </p>
                <p className="text-xs text-white/40 mt-7 mb-3">Aaj mood kaisa hai?</p>
                <div className="flex gap-2.5">
                  {MOODS.map((m, i) => (
                    <button key={i} onClick={() => send(m.t)} title={m.t}
                      className="text-2xl w-12 h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:-translate-y-1 hover:scale-110 active:scale-95 transition-all duration-300 animate-[slideUp_0.6s_ease-out_both]"
                      style={{ animationDelay: `${i * 80 + 300}ms` }}>
                      {m.e}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatLog.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div key={msg.id || msg.ts || msg.text} className={`flex flex-col w-full animate-[slideUp_0.45s_cubic-bezier(0.22,1,0.36,1)_both] ${isUser ? "items-end" : "items-start"}`}>
                  <div className={`flex items-end gap-2 max-w-[88%] sm:max-w-[75%] ${isUser ? "flex-row-reverse" : ""}`}>
                    {!isUser && <div className="shrink-0 mb-1"><Logo size={26} /></div>}
                    <div className={`px-4 py-3 sm:px-5 sm:py-3.5 rounded-3xl text-[15px] leading-relaxed shadow-lg break-words ${
                      isUser
                        ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-md shadow-blue-900/30 border border-blue-400/20"
                        : "bg-white/[0.05] backdrop-blur-md border border-white/10 text-gray-100 rounded-bl-md shadow-black/40"
                    }`}>
                      {!isUser && msg.id === freshId ? <Typewriter text={msg.text} onTick={() => scrollDown(false)} /> : <span className="whitespace-pre-wrap">{msg.text}</span>}
                    </div>
                  </div>
                  {msg.ts && <span className={`text-[10px] text-white/25 mt-1 ${isUser ? "mr-2" : "ml-10"}`}>{fmtTime(msg.ts)}</span>}
                </div>
              );
            })}

            {isAiTyping && (
              <div className="flex items-end gap-2 animate-[slideUp_0.3s_ease-out_both]">
                <div className="shrink-0 mb-1"><Logo size={26} /></div>
                <div className="px-5 py-4 rounded-3xl rounded-bl-md bg-white/[0.05] backdrop-blur-md border border-white/10 shadow-lg">
                  <div className="flex gap-1.5 items-center">
                    {[0, 160, 320].map((d) => <span key={d} className="w-1.5 h-1.5 rounded-full bg-blue-300/80 animate-[bounce_1.1s_infinite]" style={{ animationDelay: `${d}ms` }} />)}
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} className="h-2 w-full" />
          </div>
        </div>

        {/* Suggestions + Input */}
        <div className="bg-black/30 border-t border-white/5 backdrop-blur-2xl px-4 pt-3 pb-4 sm:px-6 shrink-0">
          <div className="max-w-4xl mx-auto">
            {chips.length > 0 && !isAiTyping && (
              <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar animate-[fadeIn_0.5s_ease-out_both]">
                {chips.map((c, i) => (
                  <button key={c} onClick={() => send(c)}
                    className="whitespace-nowrap text-xs border border-white/10 bg-white/5 hover:bg-blue-500/15 hover:border-blue-400/30 text-gray-300 hover:text-white px-4 py-2 rounded-full transition-all duration-300 hover:-translate-y-0.5 active:scale-95 animate-[slideUp_0.4s_ease-out_both]"
                    style={{ animationDelay: `${i * 70}ms` }}>
                    {c}
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-end gap-2 sm:gap-3">
              <textarea
                ref={taRef}
                rows={1}
                placeholder="Echo ko message likho..."
                disabled={isAiTyping}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                className="flex-1 bg-white/[0.05] border border-white/10 hover:border-white/20 focus:border-blue-500/50 focus:bg-white/[0.07] focus:shadow-[0_0_0_4px_rgba(59,130,246,0.08)] rounded-3xl px-5 py-3.5 text-white text-[15px] outline-none transition-all duration-300 resize-none placeholder-gray-500 disabled:opacity-60 max-h-32"
                style={{ minHeight: 52 }}
              />
              <button
                onClick={() => send()}
                disabled={!input.trim() || isAiTyping}
                aria-label="Send"
                className={`h-[52px] w-[52px] sm:w-16 rounded-3xl flex items-center justify-center transition-all duration-300 shadow-lg shrink-0 ${
                  !input.trim() || isAiTyping
                    ? "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-blue-600/30 hover:scale-105 active:scale-95"
                }`}
              >
                <Send size={20} className={input.trim() && !isAiTyping ? "translate-x-0.5 -translate-y-0.5" : ""} />
              </button>
            </div>
            {!user && hasSupabase && (
              <p className="text-center text-[11px] text-amber-300/70 mt-3">Guest mode: chat sirf is device par save hogi. Login karoge to har jagah sync hogi.</p>
            )}
            <div className="text-center text-[10px] text-gray-500/60 mt-3 font-medium tracking-wide">
              Echo ek AI saathi hai, doctor ya therapist nahi. Emergency me 112 / Tele-MANAS 14416. · Vedoxa Team
            </div>
          </div>
        </div>
      </div>

      {breathing && <BreathingModal onClose={() => setBreathing(false)} />}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.96); } to { opacity: 1; transform: scale(1); } }
        @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ring { 0% { transform: scale(0.8); opacity: 0.7; } 100% { transform: scale(1.9); opacity: 0; } }
        @keyframes glow { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.25); } }
        @keyframes beat { 0%,100% { transform: scale(1); } 15% { transform: scale(1.18); } 30% { transform: scale(1); } 45% { transform: scale(1.12); } }
        @keyframes twinkle { 0%,100% { opacity: 0.3; transform: scale(0.8) rotate(0deg); } 50% { opacity: 1; transform: scale(1.1) rotate(20deg); } }
        @keyframes drift { 0%,100% { transform: translate(0,0); } 50% { transform: translate(30px,-25px); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @media (prefers-reduced-motion: reduce) { * { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; } }
      `}} />
    </div>
  );
}
