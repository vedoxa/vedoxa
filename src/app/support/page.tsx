// @ts-nocheck
"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Send, Ticket, Inbox, X, CheckCircle2, AlertTriangle, Clock, LogIn, Mail, Mic, Volume2, VolumeX,
  Copy, ThumbsUp, ThumbsDown, RotateCcw, ChevronDown, RefreshCw, WifiOff, Sparkles, Info,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key"
);

const SUPPORT_EMAIL = ""; // optional: add your support email to show an "Email us" button

/* ================================================================== */
/*  TEXT (English · हिन्दी · Hinglish)                                  */
/* ================================================================== */
const T = {
  en: {
    title: "Vedoxa Help & Support", online: "Online · replies instantly", myTickets: "My tickets", ph: "Type your question…", listening: "Listening… speak now",
    raise: "Raise a ticket", login: "Log in to raise and track tickets", loginAsk: "Please log in first so we can link the ticket to your account.", goLogin: "Go to login",
    newChat: "New chat", helpful: "Helpful?", related: "You may also ask", offline: "You’re offline. Please check your internet.",
    ticketTitle: "Raise a support ticket", about: "What is it about?", orderPh: "Payment / Order ID (optional)", subPh: "Problem title (e.g. Book not unlocked)", msgPh: "Describe your problem in detail…",
    replyTo: (e) => `We’ll reply to ${e} within 48 hours.`, submit: "Submit ticket", submitting: "Submitting…", submitErr: "Couldn’t submit the ticket. Please try again.", toastSent: "Ticket submitted ✓",
    loadFail: "Couldn’t load your tickets right now. Please try again later.", none: "No tickets yet. Hopefully you won’t need one 🙏", teamReply: "Team reply",
    st: ["Open", "In review", "Resolved"], copied: "Copied ✓", noVoice: "Voice input isn’t supported in this browser.", noTts: "Voice reading isn’t supported in this browser.", thanksFb: "Thanks for the feedback 💛", emailUs: "Email us", down: "Latest",
    hero: ["Hi! I’m Veda 👋 your support buddy", "Ask in English, हिंदी or Hinglish", "I’m here — ask me anything!", "Tap me, I’ll smile 😄"],
    nudge: ["I’m here! 👋", "Need help? Ask me!", "Psst… pick a topic 👇"],
    greet: "Hello! 🙏 Welcome to Vedoxa Help & Support. I’m Veda. Pick a topic below or type your question in English, हिंदी or Hinglish.",
    hello: "Hi there! 😊 What do you need help with today?",
    thanks: "You’re most welcome! 🙏 I’m here if you need anything else.",
    bye: "Goodbye! 👋 Come back anytime you need help.",
    who: "I’m Veda, Vedoxa’s support bot 🤖 I can answer questions about payments, books, rewards, login and more, in English, हिंदी and Hinglish.",
    how: "I’m doing great, thanks for asking! 😄 How can I help you?",
    menu: "Here’s what I can help with 👇",
    close: "I’m not fully sure what you mean. Did you mean one of these?",
    nomatch: "I couldn’t find an exact answer for that. Here are some popular questions. Or raise a ticket and our team will reply within 48 hours.",
    fbDown: "Sorry that didn’t help 🙏 Please raise a ticket and our team will look into it personally.",
    sent: (id) => `Your ticket has been submitted${id ? ` (#${String(id).slice(0, 8)})` : ""}. Our team will review it and reply within 48 hours. You can track it under “My tickets”.`,
  },
  hi: {
    title: "Vedoxa सहायता केंद्र", online: "ऑनलाइन · तुरंत जवाब", myTickets: "मेरे टिकट", ph: "अपना सवाल लिखें…", listening: "सुन रहा हूँ… बोलिए",
    raise: "टिकट बनाएं", login: "टिकट बनाने और ट्रैक करने के लिए लॉग इन करें", loginAsk: "कृपया पहले लॉग इन करें ताकि हम टिकट आपके अकाउंट से जोड़ सकें।", goLogin: "लॉग इन पर जाएं",
    newChat: "नई चैट", helpful: "मददगार?", related: "आप ये भी पूछ सकते हैं", offline: "आप ऑफलाइन हैं। कृपया इंटरनेट जाँचें।",
    ticketTitle: "सपोर्ट टिकट बनाएं", about: "विषय क्या है?", orderPh: "पेमेंट / ऑर्डर ID (वैकल्पिक)", subPh: "समस्या का शीर्षक (जैसे: किताब अनलॉक नहीं हुई)", msgPh: "अपनी समस्या विस्तार से लिखें…",
    replyTo: (e) => `हम ${e} पर 48 घंटे में जवाब देंगे।`, submit: "टिकट जमा करें", submitting: "जमा हो रहा है…", submitErr: "टिकट जमा नहीं हो सका। कृपया दोबारा कोशिश करें।", toastSent: "टिकट जमा हो गया ✓",
    loadFail: "अभी आपके टिकट लोड नहीं हो सके। कृपया बाद में कोशिश करें।", none: "अभी कोई टिकट नहीं है। उम्मीद है आपको ज़रूरत भी न पड़े 🙏", teamReply: "टीम का जवाब",
    st: ["खुला", "जाँच में", "हल हुआ"], copied: "कॉपी हो गया ✓", noVoice: "इस ब्राउज़र में वॉइस इनपुट सपोर्ट नहीं है।", noTts: "इस ब्राउज़र में आवाज़ में पढ़ना सपोर्ट नहीं है।", thanksFb: "फीडबैक के लिए धन्यवाद 💛", emailUs: "ईमेल करें", down: "नीचे",
    hero: ["नमस्ते! मैं वेदा हूँ 👋", "हिंदी, English या Hinglish में पूछिए", "मैं यहाँ हूँ — कुछ भी पूछिए!", "मुझे छुइए, मैं मुस्कुराऊँगा 😄"],
    nudge: ["मैं यहाँ हूँ! 👋", "मदद चाहिए? मुझसे पूछिए!", "ज़रा नीचे विषय चुनिए 👇"],
    greet: "नमस्ते! 🙏 Vedoxa सहायता केंद्र में आपका स्वागत है। मैं वेदा हूँ। नीचे से कोई विषय चुनें या अपना सवाल हिंदी, English या Hinglish में लिखें।",
    hello: "नमस्ते! 😊 आज मैं आपकी क्या मदद कर सकता हूँ?",
    thanks: "आपका बहुत स्वागत है! 🙏 कुछ और चाहिए तो मैं यहीं हूँ।",
    bye: "अलविदा! 👋 जब भी मदद चाहिए, वापस आइए।",
    who: "मैं वेदा हूँ, Vedoxa का सपोर्ट बॉट 🤖 मैं पेमेंट, किताबों, रिवॉर्ड, लॉगिन और बहुत कुछ के सवालों का जवाब हिंदी, English और Hinglish में दे सकता हूँ।",
    how: "मैं बढ़िया हूँ, पूछने के लिए धन्यवाद! 😄 मैं आपकी क्या मदद करूँ?",
    menu: "मैं इन विषयों में मदद कर सकता हूँ 👇",
    close: "मैं पक्का नहीं समझ पाया कि आप क्या पूछ रहे हैं। क्या आपका मतलब इनमें से कोई था?",
    nomatch: "इसका सटीक जवाब मुझे नहीं मिला। ये कुछ लोकप्रिय सवाल हैं। या टिकट बनाइए, हमारी टीम 48 घंटे में जवाब देगी।",
    fbDown: "माफ़ कीजिए, जवाब काम नहीं आया 🙏 कृपया टिकट बनाइए, हमारी टीम खुद इसे देखेगी।",
    sent: (id) => `आपका टिकट जमा हो गया है${id ? ` (#${String(id).slice(0, 8)})` : ""}। हमारी टीम इसे देखकर 48 घंटे में जवाब देगी। आप “मेरे टिकट” में इसे ट्रैक कर सकते हैं।`,
  },
  hg: {
    title: "Vedoxa Help & Support", online: "Online · turant reply", myTickets: "Mere tickets", ph: "Apna sawal likhiye…", listening: "Sun raha hoon… boliye",
    raise: "Ticket raise karein", login: "Ticket raise aur track karne ke liye login kijiye", loginAsk: "Pehle login kijiye taaki hum ticket aapke account se jod sakein.", goLogin: "Login par jayein",
    newChat: "Nayi chat", helpful: "Helpful?", related: "Aap ye bhi puch sakte hain", offline: "Aap offline hain. Internet check kijiye.",
    ticketTitle: "Support ticket raise karein", about: "Kis baare me hai?", orderPh: "Payment / Order ID (optional)", subPh: "Problem ka title (jaise: Book unlock nahi hui)", msgPh: "Apni problem detail me likhiye…",
    replyTo: (e) => `Hum ${e} par 48 ghante me reply denge.`, submit: "Ticket submit karein", submitting: "Submit ho raha hai…", submitErr: "Ticket submit nahi ho paya. Dobara try kijiye.", toastSent: "Ticket submit ho gaya ✓",
    loadFail: "Abhi aapke tickets load nahi ho paye. Baad me try kijiye.", none: "Abhi koi ticket nahi hai. Umeed hai zarurat bhi na pade 🙏", teamReply: "Team ka reply",
    st: ["Open", "Review me", "Resolved"], copied: "Copy ho gaya ✓", noVoice: "Is browser me voice input support nahi hai.", noTts: "Is browser me awaaz me padhna support nahi hai.", thanksFb: "Feedback ke liye shukriya 💛", emailUs: "Email karein", down: "Neeche",
    hero: ["Namaste! Main Veda hoon 👋", "Hindi, English ya Hinglish me poochiye", "Main yahin hoon — kuch bhi poochiye!", "Mujhe tap kijiye, main muskuraunga 😄"],
    nudge: ["Main yahin hoon! 👋", "Help chahiye? Mujhse poochiye!", "Neeche topic chuniye 👇"],
    greet: "Namaste! 🙏 Vedoxa Help & Support me aapka swagat hai. Main Veda hoon. Neeche se koi topic chuniye ya apna sawal Hindi, English ya Hinglish me likhiye.",
    hello: "Namaste! 😊 Aaj main aapki kya madad kar sakta hoon?",
    thanks: "Aapka bahut swagat hai! 🙏 Kuch aur chahiye to main yahin hoon.",
    bye: "Alvida! 👋 Jab bhi madad chahiye, wapas aaiye.",
    who: "Main Veda hoon, Vedoxa ka support bot 🤖 Main payment, books, rewards, login aur bahut kuch ke sawalon ka jawab Hindi, English aur Hinglish me de sakta hoon.",
    how: "Main badhiya hoon, poochne ke liye shukriya! 😄 Main aapki kya madad karoon?",
    menu: "Main in topics me madad kar sakta hoon 👇",
    close: "Main pakka nahi samajh paya ki aap kya puch rahe hain. Kya aapka matlab inme se koi tha?",
    nomatch: "Iska exact jawab mujhe nahi mila. Ye kuch popular sawal hain. Ya ticket raise kijiye, hamari team 48 ghante me reply degi.",
    fbDown: "Maaf kijiye, jawab kaam nahi aaya 🙏 Please ticket raise kijiye, hamari team khud ise dekhegi.",
    sent: (id) => `Aapka ticket submit ho gaya hai${id ? ` (#${String(id).slice(0, 8)})` : ""}. Hamari team ise dekhkar 48 ghante me reply degi. Aap “Mere tickets” me ise track kar sakte hain.`,
  },
};

const CATS = [
  ["Payment", { en: "Payment", hi: "पेमेंट", hg: "Payment" }],
  ["Book access", { en: "Book access", hi: "किताब एक्सेस", hg: "Book access" }],
  ["Account", { en: "Account", hi: "अकाउंट", hg: "Account" }],
  ["Rewards", { en: "Rewards", hi: "रिवॉर्ड", hg: "Rewards" }],
  ["Other", { en: "Other", hi: "अन्य", hg: "Other" }],
];

const LANGS = [["auto", "Auto 🌐"], ["en", "English"], ["hi", "हिन्दी"], ["hg", "Hinglish"]];

/* ================================================================== */
/*  KNOWLEDGE BASE  (k = keywords in English + Hinglish + हिन्दी)       */
/*  Edit answers here. Check refund / account answers match your policy */
/* ================================================================== */
const KB = [
  {
    id: "payment", ticket: "Payment", rel: ["refund", "mybooks"],
    k: ["payment", "paid", "deduct", "unlock", "paisa", "paise", "pese", "kat gaya", "kat gaye", "money", "razorpay", "transaction", "upi", "पेमेंट", "भुगतान", "पैसे", "पैसा", "कट गए", "कट गया", "अनलॉक"],
    l: {
      en: { label: "Payment issue", q: "Payment was deducted but the book didn’t unlock", a: "Please log out and log back in. If the book still doesn’t unlock, raise a ticket and include your payment ID so we can verify it quickly." },
      hi: { label: "पेमेंट की समस्या", q: "पैसे कट गए लेकिन किताब अनलॉक नहीं हुई", a: "कृपया लॉग आउट करके दोबारा लॉग इन करें। फिर भी किताब अनलॉक न हो तो टिकट बनाएं और अपना पेमेंट ID ज़रूर लिखें, ताकि हम जल्दी जाँच कर सकें।" },
      hg: { label: "Payment problem", q: "Paisa kat gaya par book unlock nahi hui", a: "Pehle logout karke dobara login kijiye. Phir bhi book unlock na ho to ticket raise kijiye aur apna payment ID zaroor likhiye, taaki hum jaldi check kar sakein." },
    },
  },
  {
    id: "refund", ticket: "Payment", rel: ["payment", "ticket"],
    k: ["refund", "money back", "return money", "cancel order", "wapas", "vapas", "paise wapas", "रिफंड", "वापस", "पैसे वापस"],
    l: {
      en: { label: "Refund", q: "How do I get a refund?", a: "Our team reviews every refund request after verifying your payment. Please raise a ticket with your payment ID and the reason, and we’ll reply within 48 hours." },
      hi: { label: "रिफंड", q: "रिफंड कैसे मिलेगा?", a: "हमारी टीम हर रिफंड रिक्वेस्ट को पेमेंट वेरिफाई करने के बाद देखती है। कृपया अपना पेमेंट ID और कारण लिखकर टिकट बनाएं, हम 48 घंटे में जवाब देंगे।" },
      hg: { label: "Refund", q: "Refund kaise milega?", a: "Hamari team har refund request ko payment verify karke dekhti hai. Apna payment ID aur reason likhkar ticket raise kijiye, hum 48 ghante me reply denge." },
    },
  },
  {
    id: "pdf", rel: ["mybooks", "reader"],
    k: ["pdf", "download", "offline", "save", "डाउनलोड", "पीडीएफ", "ऑफलाइन"],
    l: {
      en: { label: "PDF download", q: "How can I download the book’s PDF?", a: "For security reasons we don’t allow direct PDF downloads. You can read your book anytime in our fast, secure Web Reader." },
      hi: { label: "PDF डाउनलोड", q: "किताब का PDF कैसे डाउनलोड करूँ?", a: "सुरक्षा कारणों से सीधे PDF डाउनलोड की सुविधा नहीं है। आप अपनी किताब कभी भी हमारे तेज़ और सुरक्षित वेब रीडर में पढ़ सकते हैं।" },
      hg: { label: "PDF download", q: "Book ka PDF kaise download karein?", a: "Security ki wajah se direct PDF download allow nahi hai. Aap apni book kabhi bhi hamare fast aur secure Web Reader me padh sakte hain." },
    },
  },
  {
    id: "mybooks", rel: ["reader", "pdf"],
    href: { to: "/", l: { en: "Go to Home", hi: "होम पर जाएं", hg: "Home par jayein" } },
    k: ["purchased", "bought", "library", "read now", "where", "kitab", "kitaab", "khareed", "kharid", "meri book", "my book", "किताब", "खरीद", "लाइब्रेरी", "कहाँ", "कहां"],
    l: {
      en: { label: "My books", q: "Where will my purchased books appear?", a: "A “Read Now” button appears under your purchased books in the Premium Library section on the Home page." },
      hi: { label: "मेरी किताबें", q: "खरीदी हुई किताबें कहाँ दिखेंगी?", a: "होम पेज के Premium Library सेक्शन में आपकी खरीदी हुई किताबों के नीचे “Read Now” बटन दिखाई देता है।" },
      hg: { label: "Meri books", q: "Kharidi hui books kahan dikhengi?", a: "Home page ke Premium Library section me aapki kharidi hui books ke neeche “Read Now” button dikhta hai." },
    },
  },
  {
    id: "reader", ticket: "Book access", rel: ["mybooks", "login"],
    k: ["not opening", "not loading", "won't open", "wont open", "loading", "slow", "blank", "stuck", "reader", "error", "crash", "hang", "khul nahi", "nahi khul", "khul nhi", "load nahi", "लोड", "नहीं खुल", "खुल नहीं", "एरर", "अटक", "हैंग"],
    l: {
      en: { label: "Reader not loading", q: "The book isn’t opening or loading slowly", a: "Please check your internet connection, refresh the page and try again. If it still doesn’t open, try another browser or clear your browser cache. Still stuck? Raise a ticket with your device and browser name." },
      hi: { label: "रीडर नहीं खुल रहा", q: "किताब खुल नहीं रही या धीरे लोड हो रही है", a: "कृपया इंटरनेट कनेक्शन जाँचें, पेज रिफ्रेश करें और फिर कोशिश करें। फिर भी न खुले तो दूसरा ब्राउज़र आज़माएं या ब्राउज़र का कैश साफ़ करें। समस्या बनी रहे तो अपने डिवाइस और ब्राउज़र का नाम लिखकर टिकट बनाएं।" },
      hg: { label: "Reader nahi khul raha", q: "Book khul nahi rahi ya slow load ho rahi hai", a: "Internet connection check kijiye, page refresh karke dobara try kijiye. Phir bhi na khule to doosra browser try kijiye ya browser ka cache clear kijiye. Problem rahe to apne device aur browser ka naam likhkar ticket raise kijiye." },
    },
  },
  {
    id: "coins", ticket: "Rewards", rel: ["referral", "ticket"],
    k: ["coin", "coins", "reward", "rewards", "ads", "ad", "wallet", "convert", "points", "advertisement", "सिक्के", "कॉइन", "विज्ञापन", "रिवॉर्ड", "वॉलेट", "एड"],
    l: {
      en: { label: "Coins & rewards", q: "My ad coins didn’t arrive", a: "Stay on the ad until the 10-second timer ends. Coins are verified on our server, so a closed or blocked ad page won’t count. You can watch up to 5 ads a day, and the limit resets at 12 AM IST." },
      hi: { label: "कॉइन और रिवॉर्ड", q: "विज्ञापन देखने के कॉइन नहीं मिले", a: "विज्ञापन पर 10 सेकंड का टाइमर खत्म होने तक रुकें। कॉइन हमारे सर्वर पर वेरिफाई होते हैं, इसलिए पेज बंद करने या ब्लॉक होने पर वे नहीं गिने जाते। आप रोज़ अधिकतम 5 विज्ञापन देख सकते हैं और लिमिट रात 12 बजे (IST) रीसेट होती है।" },
      hg: { label: "Coins & rewards", q: "Ad dekhne ke coins nahi mile", a: "Ad par 10 second ka timer khatam hone tak ruke rahiye. Coins hamare server par verify hote hain, isliye ad page band karne ya block hone par count nahi hote. Aap din me max 5 ads dekh sakte hain aur limit raat 12 baje (IST) reset hoti hai." },
    },
  },
  {
    id: "referral", rel: ["coins", "ticket"],
    k: ["referral", "refer", "invite", "code", "friend", "dost", "share", "दोस्त", "रेफरल", "इनवाइट", "कोड"],
    l: {
      en: { label: "Referral", q: "How does referral work?", a: "Share your code from the Rewards page. When a friend enters it, you get ₹10 in your wallet. Each account can use only one referral code." },
      hi: { label: "रेफरल", q: "रेफरल कैसे काम करता है?", a: "Rewards पेज से अपना कोड शेयर करें। जब कोई दोस्त उसे डालता है तो आपके वॉलेट में ₹10 आ जाते हैं। हर अकाउंट सिर्फ एक रेफरल कोड इस्तेमाल कर सकता है।" },
      hg: { label: "Referral", q: "Referral kaise kaam karta hai?", a: "Rewards page se apna code share kijiye. Jab dost use daalta hai to aapke wallet me ₹10 aa jaate hain. Ek account sirf ek referral code use kar sakta hai." },
    },
  },
  {
    id: "login", ticket: "Account", rel: ["account", "reader"],
    k: ["login", "log in", "password", "signin", "sign in", "otp", "logout", "can't login", "cant login", "लॉगिन", "पासवर्ड", "साइन इन"],
    l: {
      en: { label: "Login help", q: "I can’t log in", a: "Log out, close the tab and sign in again with the same account you registered with. If it still fails, raise a ticket with the email you’re using." },
      hi: { label: "लॉगिन में मदद", q: "मैं लॉग इन नहीं कर पा रहा हूँ", a: "लॉग आउट करें, टैब बंद करें और जिस अकाउंट से रजिस्टर किया था उसी से दोबारा साइन इन करें। फिर भी न हो तो जो ईमेल इस्तेमाल कर रहे हैं उसके साथ टिकट बनाएं।" },
      hg: { label: "Login help", q: "Mujhse login nahi ho raha", a: "Logout kijiye, tab band kijiye aur jis account se register kiya tha usi se dobara sign in kijiye. Phir bhi na ho to jo email use kar rahe hain uske saath ticket raise kijiye." },
    },
  },
  {
    id: "account", ticket: "Account", rel: ["login", "ticket"],
    k: ["account", "email", "delete", "change email", "profile", "name change", "अकाउंट", "ईमेल", "डिलीट", "बदल", "badlo", "badalna", "hata"],
    l: {
      en: { label: "Account help", q: "How do I change my email or delete my account?", a: "For safety, account changes like updating your email or deleting your account are handled by our team. Please raise a ticket from the account you registered with and tell us what you’d like changed." },
      hi: { label: "अकाउंट सहायता", q: "ईमेल बदलना या अकाउंट डिलीट कैसे करें?", a: "सुरक्षा के लिए ईमेल बदलने या अकाउंट डिलीट जैसे बदलाव हमारी टीम करती है। कृपया रजिस्टर किए गए अकाउंट से टिकट बनाएं और बताएं कि आप क्या बदलना चाहते हैं।" },
      hg: { label: "Account help", q: "Email change ya account delete kaise karein?", a: "Safety ke liye email change ya account delete jaise badlav hamari team karti hai. Register kiye hue account se ticket raise kijiye aur batayein ki aap kya change karna chahte hain." },
    },
  },
  {
    id: "ticket", ticket: "Other", act: "mine", rel: ["payment", "coins"],
    k: ["ticket", "status", "track", "reply", "response", "contact", "support", "complaint", "48", "tikat", "टिकट", "स्टेटस", "शिकायत", "संपर्क", "जवाब", "shikayat", "sampark"],
    l: {
      en: { label: "Ticket status", q: "How do I track my ticket? How long will a reply take?", a: "You can see every ticket and its status under “My tickets”. Our team replies within 48 hours." },
      hi: { label: "टिकट स्टेटस", q: "मैं अपना टिकट कैसे ट्रैक करूँ? जवाब कितने समय में मिलेगा?", a: "आप “मेरे टिकट” में अपने सभी टिकट और उनका स्टेटस देख सकते हैं। हमारी टीम 48 घंटे में जवाब देती है।" },
      hg: { label: "Ticket status", q: "Ticket track kaise karein? Reply kitne time me milega?", a: "Aap “Mere tickets” me apne saare tickets aur unka status dekh sakte hain. Hamari team 48 ghante me reply deti hai." },
    },
  },
];
const TOPICS = Object.fromEntries(KB.map((f) => [f.id, f]));
const POPULAR = ["payment", "pdf", "coins", "login"];

/* ================================================================== */
/*  SMART MATCHING                                                      */
/* ================================================================== */
const norm = (s) => ` ${s.toLowerCase().replace(/[^a-z0-9\u0900-\u097f\s]/g, " ").replace(/\s+/g, " ")} `;
const HG = new Set(["mera", "meri", "mere", "nahi", "nahin", "nhi", "kya", "kaise", "kese", "kyu", "kyun", "hai", "hain", "hua", "gaya", "gayi", "kab", "kahan", "kaha", "karo", "karna", "karein", "mujhe", "aap", "tum", "toh", "wala", "hoga", "chahiye", "batao", "bataiye", "madad", "raha", "rahi", "abhi", "bhi", "aur", "kitab", "kharid", "khareed", "milega", "mila", "kaun", "kitne", "kitna", "sawal", "paisa", "dikh", "hoon", "ho"]);
const detect = (s) => {
  if (/[\u0900-\u097f]/.test(s)) return "hi";
  const toks = norm(s).trim().split(" ");
  return toks.some((w) => HG.has(w)) ? "hg" : "en";
};
const lev = (a, b) => {
  if (Math.abs(a.length - b.length) > 2) return 9;
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
};
const scoreOf = (f, t, toks) => {
  let s = 0;
  for (const w of f.k) {
    const strong = w.length >= 6 || w.includes(" ");
    const hit = w.length < 4 ? t.includes(` ${w} `) : t.includes(w);
    if (hit) s += strong ? 2 : 1;
    else if (/^[a-z]{5,}$/.test(w) && toks.some((x) => /^[a-z]{4,}$/.test(x) && lev(x, w) <= (w.length > 7 ? 2 : 1))) s += 1; // typo tolerance
  }
  return s;
};
const rank = (text) => {
  const t = norm(text), toks = t.trim().split(" ");
  return KB.map((f) => ({ f, s: scoreOf(f, t, toks) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
};
const SMALL = {
  greet: ["hi", "hii", "hiii", "hello", "hey", "hlo", "namaste", "namaskar", "नमस्ते", "हैलो", "हेलो", "हाय"],
  thanks: ["thanks", "thank you", "thankyou", "thx", "shukriya", "dhanyavad", "dhanyawad", "धन्यवाद", "शुक्रिया"],
  bye: ["bye", "goodbye", "alvida", "tata", "अलविदा"],
  who: ["who are you", "your name", "kaun ho", "kon ho", "aap kaun", "tum kaun", "naam kya", "तुम कौन", "आप कौन", "नाम क्या", "are you a bot"],
  how: ["how are you", "kaise ho", "kese ho", "आप कैसे हैं", "कैसे हो"],
  menu: ["help", "menu", "options", "madad", "sahayata", "मदद", "सहायता"],
};

/* ================================================================== */
/*  HELPERS                                                             */
/* ================================================================== */
const store = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtDate = (v) => (v ? new Date(v).toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) : "");
const stageOf = (s) => { const x = String(s || "open").toLowerCase(); return ["resolved", "closed", "done"].includes(x) ? 2 : /review|progress|process|pending/.test(x) ? 1 : 0; };
const textOf = (m, ml) => {
  if (m.topic) return TOPICS[m.topic].l[ml].a;
  const v = T[ml][m.greet ? "greet" : m.key];
  return typeof v === "function" ? v(m.arg) : v;
};
const GREET = { id: 0, sender: "bot", greet: true, ts: Date.now() };

/* ================================================================== */
/*  BOT AVATAR  (pure SVG + CSS animation: floats, blinks, looks       */
/*  around, waves, thinks, talks, listens, gets happy)                 */
/* ================================================================== */
const STYLES = `
@keyframes vx-float{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-7%) rotate(2deg)}}
@keyframes vx-hop{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-9%) scale(1.04,.97)}}
@keyframes vx-tilt{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg) translateY(-3%)}}
@keyframes vx-blink{0%,92%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}
@keyframes vx-look{0%,100%{transform:translate(0,0)}20%{transform:translate(-3px,0)}45%{transform:translate(3px,-1px)}70%{transform:translate(2px,2px)}}
@keyframes vx-talk{0%,100%{transform:scaleY(.35) scaleX(.9)}50%{transform:scaleY(1.15) scaleX(1.1)}}
@keyframes vx-wave{0%,100%{transform:rotate(0)}25%{transform:rotate(38deg)}50%{transform:rotate(6deg)}75%{transform:rotate(38deg)}}
@keyframes vx-pulse{0%,100%{opacity:.6;transform:scale(1)}50%{opacity:1;transform:scale(1.35)}}
@keyframes vx-dot{0%,100%{opacity:.2;transform:translateY(0)}50%{opacity:1;transform:translateY(-3px)}}
@keyframes vx-caret{50%{opacity:0}}
.vx-bot{display:block;animation:vx-float 3.4s ease-in-out infinite}
.vx-bot.talk{animation:vx-hop .45s ease-in-out infinite}
.vx-bot.think{animation:vx-tilt 1.4s ease-in-out infinite}
.vx-bot.happy{animation:vx-hop .6s ease-in-out 4}
.vx-bot.still{animation:none}
.vx-bot.still.talk{animation:vx-hop .45s ease-in-out infinite}
.vx-eyes{animation:vx-look 7s ease-in-out infinite}
.vx-eye{transform-box:fill-box;transform-origin:center;animation:vx-blink 4.5s infinite}
.vx-bot.still .vx-eyes,.vx-bot.still .vx-eye,.vx-bot.still .vx-ant{animation:none}
.vx-mouth{transform-box:fill-box;transform-origin:center;animation:vx-talk .26s ease-in-out infinite}
.vx-arm{transform-box:fill-box;transform-origin:50% 100%}
.vx-bot.wave .vx-arm{animation:vx-wave 1s ease-in-out infinite}
.vx-ant,.vx-ear{transform-box:fill-box;transform-origin:center}
.vx-ant{animation:vx-pulse 1.8s ease-in-out infinite}
.vx-bot.think .vx-ant,.vx-bot.talk .vx-ant{animation-duration:.6s}
.vx-bot.listen .vx-ear{animation:vx-pulse .8s ease-in-out infinite}
.vx-dot{animation:vx-dot 1s ease-in-out infinite}
.vx-caret{display:inline-block;width:2px;height:1em;margin-left:2px;vertical-align:-2px;background:currentColor;animation:vx-caret 1s steps(2) infinite}
@media (prefers-reduced-motion:reduce){.vx-bot,.vx-bot *{animation:none!important}}
`;

function BotFace({ mood = "idle", size = 40, still = false }) {
  const happy = mood === "happy";
  return (
    <div className={`vx-bot ${mood} ${still ? "still" : ""}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id="vxg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#fde047" /><stop offset="1" stopColor="#d97706" /></linearGradient>
        </defs>
        <line x1="50" y1="22" x2="50" y2="11" stroke="#b45309" strokeWidth="3" strokeLinecap="round" />
        <circle className="vx-ant" cx="50" cy="9" r="4.5" fill="#fef08a" />
        <rect className="vx-ear" x="6" y="42" width="9" height="20" rx="4.5" fill="#b45309" />
        <rect className="vx-ear" x="85" y="42" width="9" height="20" rx="4.5" fill="#b45309" />
        <g><rect x="4" y="64" width="6" height="18" rx="3" fill="#b45309" /><circle cx="7" cy="62" r="5" fill="#fcd34d" /></g>
        <g className="vx-arm"><rect x="89" y="64" width="6" height="18" rx="3" fill="#b45309" /><circle cx="92" cy="62" r="5.5" fill="#fcd34d" /></g>
        <rect x="12" y="22" width="76" height="60" rx="26" fill="url(#vxg)" />
        <rect x="20" y="30" width="60" height="44" rx="20" fill="#0b0b12" />
        <g className="vx-eyes">
          {happy ? (
            <>
              <path d="M32 51 Q38 42 44 51" stroke="#facc15" strokeWidth="4" fill="none" strokeLinecap="round" />
              <path d="M56 51 Q62 42 68 51" stroke="#facc15" strokeWidth="4" fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse className="vx-eye" cx="38" cy="49" rx="5" ry="7" fill="#facc15" />
              <ellipse className="vx-eye" cx="62" cy="49" rx="5" ry="7" fill="#facc15" style={{ animationDelay: ".08s" }} />
            </>
          )}
        </g>
        <circle cx="29" cy="63" r="3.5" fill="#fb7185" opacity=".5" />
        <circle cx="71" cy="63" r="3.5" fill="#fb7185" opacity=".5" />
        {mood === "talk" ? <ellipse className="vx-mouth" cx="50" cy="63" rx="6" ry="4.5" fill="#fb7185" />
          : mood === "think" ? <circle cx="50" cy="63" r="2.6" fill="#facc15" />
          : happy ? <path d="M41 60 Q50 73 59 60 Z" fill="#fb7185" />
          : <path d="M43 62 Q50 68 57 62" stroke="#facc15" strokeWidth="3" fill="none" strokeLinecap="round" />}
        {mood === "think" && [0, 1, 2].map((i) => <circle key={i} className="vx-dot" style={{ animationDelay: `${i * 0.2}s` }} cx={78 + i * 8} cy={12 - i * 4} r={2 + i * 0.8} fill="#fde047" />)}
      </svg>
    </div>
  );
}

function Burst() {
  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      {Array.from({ length: 10 }).map((_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return <motion.span key={i} className="absolute left-1/2 top-1/2 text-sm" initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }} animate={{ x: Math.cos(a) * 50, y: Math.sin(a) * 50 - 10, opacity: 0, scale: 1.2 }} transition={{ duration: 1.1, ease: "easeOut" }}>{["💛", "✨", "🎉"][i % 3]}</motion.span>;
      })}
    </div>
  );
}

/* Types the bot's answer out letter by letter (avatar "talks" meanwhile) */
function Typed({ text, fresh, onStart, onTick, onDone }) {
  const [n, setN] = useState(fresh ? 0 : text.length);
  useEffect(() => {
    if (!fresh) return;
    onStart?.();
    let i = 0;
    const step = Math.max(1, Math.ceil(text.length / 90));
    const id = setInterval(() => {
      i += step;
      if (i >= text.length) { clearInterval(id); setN(text.length); onDone?.(); } else { setN(i); onTick?.(); }
    }, 22);
    return () => clearInterval(id);
    // eslint-disable-next-line
  }, [fresh]);
  return <>{fresh ? text.slice(0, n) : text}{fresh && n < text.length && <span className="vx-caret" />}</>;
}

/* ================================================================== */
export default function SupportPage() {
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState("auto"); // auto | en | hi | hg
  const [detected, setDetected] = useState("en");
  const [messages, setMessages] = useState([GREET]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [outSpeaking, setOutSpeaking] = useState(false);
  const [ttsId, setTtsId] = useState(null);
  const [listening, setListening] = useState(false);
  const [happy, setHappy] = useState(false);
  const [nudge, setNudge] = useState(null);
  const [heroIdx, setHeroIdx] = useState(0);
  const [burst, setBurst] = useState(0);
  const [sheet, setSheet] = useState(null); // null | 'ticket' | 'mine'
  const [preset, setPreset] = useState("Payment");
  const [toast, setToast] = useState(null);
  const [myTickets, setMyTickets] = useState(null); // null = loading, [] = none, false = unavailable
  const [online, setOnline] = useState(true);
  const [showDown, setShowDown] = useState(false);

  const L = mode === "auto" ? detected : mode;
  const t = T[L];
  const bottom = useRef(null), scroller = useRef(null), stick = useRef(true);
  const idRef = useRef(1), timers = useRef([]), recRef = useRef(null), live = useRef({});

  const speakingNow = outSpeaking || ttsId !== null;
  const mood = speakingNow ? "talk" : typing ? "think" : listening ? "listen" : happy ? "happy" : nudge ? "wave" : "idle";
  live.current = { L, busy: typing || speakingNow || listening || !!sheet };

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const notify = useCallback((msg, type = "info") => { setToast({ msg, type }); timers.current.push(setTimeout(() => setToast(null), 3000)); }, []);
  const flashHappy = () => { setHappy(true); setBurst((b) => b + 1); later(() => setHappy(false), 2600); };
  const toBottom = (smooth = true) => bottom.current?.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "end" });

  /* ---------- mount: auth, saved chat, saved language, online state ---------- */
  useEffect(() => {
    const saved = store.get("vx_support_chat", null);
    if (Array.isArray(saved) && saved.length) { setMessages(saved); idRef.current = Math.max(...saved.map((m) => m.id)) + 1; }
    const savedMode = store.get("vx_support_lang", "auto");
    setMode(savedMode);
    if (savedMode === "auto" && typeof navigator !== "undefined" && /^hi/i.test(navigator.language || "")) setDetected("hi");
    setOnline(navigator.onLine);
    setMounted(true);
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setUser(s?.user ?? null));
    return () => {
      subscription.unsubscribe(); timers.current.forEach(clearTimeout);
      window.removeEventListener("online", on); window.removeEventListener("offline", off);
      try { window.speechSynthesis?.cancel(); recRef.current?.abort(); } catch {}
    };
  }, []);

  useEffect(() => { if (mounted) store.set("vx_support_chat", messages.slice(-30).map(({ fresh, ...m }) => m)); }, [messages, mounted]);
  useEffect(() => { if (mounted) store.set("vx_support_lang", mode); }, [mode, mounted]);
  useEffect(() => { if (stick.current) toBottom(); }, [messages, typing]);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setSheet(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /* ---------- "I'm here!" – the bot keeps moving, waves and speaks up ---------- */
  useEffect(() => {
    if (!mounted) return;
    const pop = () => {
      if (live.current.busy) return;
      const arr = T[live.current.L].nudge;
      setNudge(arr[Math.floor(Math.random() * arr.length)]);
      timers.current.push(setTimeout(() => setNudge(null), 3400));
    };
    const first = setTimeout(pop, 2200);
    const id = setInterval(pop, 9000);
    const hero = setInterval(() => setHeroIdx((i) => i + 1), 3600);
    return () => { clearTimeout(first); clearInterval(id); clearInterval(hero); };
  }, [mounted]);

  const onScroll = () => {
    const el = scroller.current; if (!el) return;
    const near = el.scrollHeight - el.scrollTop - el.clientHeight < 140;
    stick.current = near; setShowDown((p) => (p === !near ? p : !near));
  };

  /* ---------- chat engine ---------- */
  const push = (sender, extra = {}) => setMessages((m) => [...m, { id: idRef.current++, sender, ts: Date.now(), ...extra }]);
  const botSay = (extra, lg) => {
    setTyping(true);
    later(() => { setTyping(false); push("bot", { ...extra, lang: lg, fresh: true }); }, 550 + Math.random() * 450);
  };
  const answer = (id, lg, sug) => botSay({ topic: id, sug }, lg);

  const ask = (text, id, forceLang) => {
    const clean = text.trim().slice(0, 200);
    if (!clean) return;
    const lg = forceLang || (mode === "auto" ? detect(clean) : mode);
    if (mode === "auto" && !forceLang) setDetected(lg);
    push("user", { text: clean, lang: lg });
    if (id) return answer(id, lg);

    const r = rank(clean);
    if (r[0] && r[0].s >= 2) {
      const second = r[1] && r[1].s >= 1.5 ? [r[1].f.id] : [];
      return answer(r[0].f.id, lg, [...new Set([...second, ...TOPICS[r[0].f.id].rel])].slice(0, 3));
    }
    const n = norm(clean), toks = n.trim().split(" ");
    const has = (arr) => arr.some((w) => n.includes(` ${w} `));
    if (toks.length <= 4 && has(SMALL.greet)) return botSay({ key: "hello" }, lg);
    if (has(SMALL.thanks)) { flashHappy(); return botSay({ key: "thanks" }, lg); }
    if (has(SMALL.bye)) return botSay({ key: "bye" }, lg);
    if (has(SMALL.who)) return botSay({ key: "who" }, lg);
    if (has(SMALL.how)) return botSay({ key: "how" }, lg);
    if (toks.length <= 2 && has(SMALL.menu)) return botSay({ key: "menu", sug: POPULAR }, lg);
    if (r[0]) return botSay({ key: "close", sug: r.slice(0, 3).map((x) => x.f.id) }, lg);
    return botSay({ key: "nomatch", ticket: "Other", sug: POPULAR.slice(0, 3) }, lg);
  };

  const send = (e) => { e.preventDefault(); ask(input); setInput(""); };
  const askTopic = (id, lg) => ask(TOPICS[id].l[lg].q, id, lg);

  const feedback = (m, v) => {
    setMessages((all) => all.map((x) => (x.id === m.id ? { ...x, fb: v } : x)));
    if (v === "up") { flashHappy(); notify(t.thanksFb, "success"); }
    else botSay({ key: "fbDown", ticket: TOPICS[m.topic]?.ticket || "Other" }, m.lang || L);
  };
  const copyMsg = async (txt) => { try { await navigator.clipboard.writeText(txt); notify(t.copied, "success"); } catch {} };

  const speak = (m, txt, ml) => {
    const s = window.speechSynthesis;
    if (!s) return notify(t.noTts, "error");
    if (ttsId === m.id) { s.cancel(); return setTtsId(null); }
    s.cancel();
    const u = new SpeechSynthesisUtterance(txt);
    u.lang = ml === "hi" ? "hi-IN" : "en-IN";
    u.onstart = () => setTtsId(m.id); u.onend = () => setTtsId(null); u.onerror = () => setTtsId(null);
    s.speak(u);
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return notify(t.noVoice, "error");
    if (listening) return recRef.current?.stop();
    const r = new SR();
    r.lang = L === "hi" ? "hi-IN" : "en-IN"; r.interimResults = true; r.continuous = false;
    r.onstart = () => setListening(true); r.onend = () => setListening(false); r.onerror = () => setListening(false);
    r.onresult = (e) => {
      const txt = Array.from(e.results).map((x) => x[0].transcript).join("");
      setInput(txt);
      if (e.results[e.results.length - 1].isFinal) { ask(txt); setInput(""); }
    };
    recRef.current = r; r.start();
  };

  const resetChat = () => {
    try { window.speechSynthesis?.cancel(); } catch {}
    setTtsId(null); setTyping(false); setOutSpeaking(false);
    setMessages([{ ...GREET, id: idRef.current++, ts: Date.now() }]);
    stick.current = true;
  };

  /* ---------- tickets ---------- */
  const loadTickets = useCallback(async () => {
    if (!user) return;
    setMyTickets(null);
    let res = await supabase.from("tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20);
    if (res.error) res = await supabase.from("tickets").select("*").eq("user_id", user.id).limit(20);
    setMyTickets(res.error ? false : res.data || []);
  }, [user]);

  const openMine = () => { setSheet("mine"); loadTickets(); };
  const openTicket = (cat = "Other") => { setPreset(cat); setSheet("ticket"); };
  const onTicketSent = (id) => {
    setSheet(null); notify(t.toastSent, "success"); flashHappy();
    push("bot", { key: "sent", arg: id, lang: L, fresh: true });
  };

  const liveSug = useMemo(() => (input.trim().length >= 3 ? rank(input).slice(0, 3) : []), [input]);
  const lastId = messages[messages.length - 1]?.id;

  /* ---------------------------------------------------------------- */
  return (
    <div className="flex h-[100dvh] flex-col bg-[#07070b] font-sans text-gray-200 [background-image:radial-gradient(800px_360px_at_50%_-100px,rgba(234,179,8,0.09),transparent)]">
      <style>{STYLES}</style>
      <Toast toast={toast} />

      {/* Header */}
      <header className="z-30 shrink-0 border-b border-white/5 bg-[#07070b]/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          <Link href="/" aria-label="Back to home" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:bg-white/10 active:scale-95">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button type="button" onClick={flashHappy} aria-label="Veda" className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-yellow-500/15 ring-1 ring-yellow-500/20">
              <BotFace mood={mood} size={34} />
              {burst > 0 && <Burst key={burst} />}
              <AnimatePresence>
                {nudge && (
                  <motion.span initial={{ opacity: 0, y: -4, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4 }} className="pointer-events-none absolute left-12 top-[3.1rem] z-40 whitespace-nowrap rounded-2xl rounded-tl-sm border border-yellow-500/30 bg-[#17130a] px-3 py-1.5 text-xs font-semibold text-yellow-200 shadow-xl">
                    {nudge}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold text-white">{t.title}</h1>
              <p className="flex items-center gap-1.5 truncate text-xs text-emerald-400"><span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-emerald-400" /> {t.online}</p>
            </div>
          </div>
          <button onClick={resetChat} aria-label={t.newChat} title={t.newChat} className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-300 transition hover:bg-white/10 active:scale-95"><RotateCcw size={16} /></button>
          <button onClick={openMine} className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-gray-300 transition hover:bg-white/10 active:scale-95">
            <Inbox size={15} /> <span className="hidden sm:inline">{t.myTickets}</span>
          </button>
        </div>
        {/* Language switch */}
        <div className="mx-auto flex max-w-3xl gap-1.5 overflow-x-auto px-4 pb-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {LANGS.map(([v, label]) => (
            <button key={v} onClick={() => setMode(v)} className={`shrink-0 rounded-full border px-3.5 py-1 text-[11px] font-semibold transition active:scale-95 ${mode === v ? "border-yellow-500 bg-yellow-500 text-black" : "border-white/10 bg-white/5 text-gray-400 hover:text-white"}`}>{label}</button>
          ))}
        </div>
        {!online && <div className="flex items-center justify-center gap-1.5 bg-red-500/10 py-1.5 text-xs text-red-300"><WifiOff size={13} /> {t.offline}</div>}
      </header>

      {/* Conversation */}
      <main ref={scroller} onScroll={onScroll} className="relative flex-1 overflow-y-auto overscroll-contain">
        <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-6">

          {/* Hero bot: keeps moving and says "I'm here" */}
          <div className="flex flex-col items-center pb-1 text-center">
            <div className="mb-3 flex min-h-[44px] max-w-[280px] items-end justify-center">
              <AnimatePresence mode="wait">
                <motion.div key={`${L}-${heroIdx % t.hero.length}`} initial={{ opacity: 0, y: 8, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="relative rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-xs font-semibold text-yellow-200 shadow-lg">
                  {t.hero[heroIdx % t.hero.length]}
                  <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-yellow-500/30 bg-[#14110a]" />
                </motion.div>
              </AnimatePresence>
            </div>
            <button type="button" onClick={flashHappy} aria-label="Veda" className="relative rounded-full active:scale-95">
              <span className="absolute inset-0 rounded-full bg-yellow-500/20 blur-2xl" />
              <BotFace mood={mood === "idle" ? "wave" : mood} size={112} />
            </button>
            <span className="mt-1 h-2 w-16 animate-pulse rounded-full bg-black/70 blur-sm" />
          </div>

          {messages.map((m) => {
            const bot = m.sender === "bot";
            const ml = m.greet ? L : m.lang || L;
            const tp = m.topic ? TOPICS[m.topic] : null;
            const body = bot ? textOf(m, ml) : m.text;
            const settled = bot && !m.fresh;
            const sug = settled && m.id === lastId ? m.sug || tp?.rel || [] : [];
            const cat = settled ? m.ticket || tp?.ticket : null;
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className={`flex items-end gap-2.5 ${bot ? "" : "flex-row-reverse"}`}>
                {bot && <div className="mb-5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-yellow-500/15"><BotFace mood={m.fresh ? "talk" : "idle"} size={28} still /></div>}
                <div className={`flex max-w-[84%] flex-col gap-2 ${bot ? "items-start" : "items-end"}`}>
                  <div className={`whitespace-pre-line break-words rounded-3xl px-4 py-3 text-sm leading-relaxed shadow-sm md:text-[15px] ${bot ? "rounded-bl-md border border-white/10 bg-white/[0.05] text-gray-100" : "rounded-br-md bg-yellow-500 font-medium text-black"}`}>
                    {bot ? <Typed text={body} fresh={!!m.fresh} onStart={() => setOutSpeaking(true)} onTick={() => stick.current && toBottom(false)} onDone={() => { setOutSpeaking(false); setMessages((all) => all.map((x) => (x.id === m.id ? { ...x, fresh: false } : x))); }} /> : body}
                  </div>

                  {settled && (cat || tp?.href || tp?.act) && (
                    <div className="flex flex-wrap gap-2">
                      {cat && <button onClick={() => openTicket(cat)} className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3.5 py-1.5 text-xs font-bold text-yellow-400 transition hover:bg-yellow-500/20 active:scale-95"><Ticket size={14} /> {T[ml].raise}</button>}
                      {tp?.act === "mine" && <button onClick={openMine} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-gray-200 transition hover:bg-white/10 active:scale-95"><Inbox size={14} /> {T[ml].myTickets}</button>}
                      {tp?.href && <Link href={tp.href.to} className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-bold text-gray-200 transition hover:bg-white/10 active:scale-95">{tp.href.l[ml]}</Link>}
                    </div>
                  )}

                  {settled && (
                    <div className="flex items-center gap-1 px-1 text-gray-500">
                      {mounted && <span className="mr-1 text-[10px] text-gray-600">{fmtTime(m.ts)}</span>}
                      <IconBtn label="Listen" onClick={() => speak(m, body, ml)} active={ttsId === m.id}>{ttsId === m.id ? <VolumeX size={13} /> : <Volume2 size={13} />}</IconBtn>
                      <IconBtn label="Copy" onClick={() => copyMsg(body)}><Copy size={13} /></IconBtn>
                      {tp && <>
                        <IconBtn label="Helpful" onClick={() => feedback(m, "up")} active={m.fb === "up"}><ThumbsUp size={13} /></IconBtn>
                        <IconBtn label="Not helpful" onClick={() => feedback(m, "down")} active={m.fb === "down"}><ThumbsDown size={13} /></IconBtn>
                      </>}
                    </div>
                  )}
                  {!bot && mounted && <span className="px-1 text-[10px] text-gray-600">{fmtTime(m.ts)}</span>}

                  {sug.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex w-full flex-col gap-1.5">
                      <p className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-gray-500"><Sparkles size={12} className="text-yellow-500" /> {m.key === "close" || m.key === "nomatch" || m.key === "menu" ? "" : T[ml].related}</p>
                      {sug.map((id) => <button key={id} onClick={() => askTopic(id, ml)} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-left text-xs text-gray-200 transition hover:border-yellow-500/40 hover:text-white active:scale-[0.98]">{TOPICS[id].l[ml].q}</button>)}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {typing && (
            <div className="flex items-end gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-yellow-500/15"><BotFace mood="think" size={28} still /></div>
              <div className="flex gap-1 rounded-3xl rounded-bl-md border border-white/10 bg-white/[0.05] px-4 py-4" aria-label="Bot is typing">
                {[0, 1, 2].map((i) => <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}
          <div ref={bottom} />
        </div>

        <AnimatePresence>
          {showDown && (
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={() => { stick.current = true; toBottom(); }} aria-label={t.down} className="sticky bottom-3 left-full mr-4 flex h-10 w-10 -translate-y-1 items-center justify-center rounded-full border border-yellow-500/40 bg-[#14110a] text-yellow-400 shadow-xl">
              <ChevronDown size={18} />
            </motion.button>
          )}
        </AnimatePresence>
      </main>

      {/* Composer */}
      <footer className="z-30 shrink-0 border-t border-white/5 bg-[#09090e] pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto max-w-3xl px-4">
          {!user && mounted && (
            <Link href="/" className="mb-3 flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] py-2 text-xs text-gray-400 transition hover:text-white">
              <LogIn size={14} /> {t.login}
            </Link>
          )}

          {liveSug.length > 0 ? (
            <div className="mb-3 flex flex-col gap-1.5">
              {liveSug.map(({ f }) => (
                <button key={f.id} onClick={() => { askTopic(f.id, L); setInput(""); }} className="flex items-center gap-2 rounded-2xl border border-yellow-500/20 bg-yellow-500/[0.06] px-3.5 py-2 text-left text-xs text-gray-200 transition hover:border-yellow-500/50 active:scale-[0.98]">
                  <Sparkles size={13} className="shrink-0 text-yellow-500" /> <span className="min-w-0 truncate">{f.l[L].q}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {KB.filter((f) => f.id !== "ticket").map((f) => (
                <button key={f.id} onClick={() => askTopic(f.id, L)} className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300 transition hover:border-yellow-500/40 hover:text-white active:scale-95">{f.l[L].label}</button>
              ))}
              <button onClick={() => openTicket("Other")} className="flex shrink-0 items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-xs font-bold text-yellow-400 transition hover:bg-yellow-500/20 active:scale-95"><Ticket size={14} /> {t.raise}</button>
              {SUPPORT_EMAIL && <a href={`mailto:${SUPPORT_EMAIL}`} className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-gray-300"><Mail size={14} /> {t.emailUs}</a>}
            </div>
          )}

          <form onSubmit={send} className={`flex items-center gap-1.5 rounded-full border bg-white/[0.04] p-1.5 pl-5 transition focus-within:border-yellow-500/50 focus-within:ring-4 focus-within:ring-yellow-500/10 ${listening ? "border-yellow-500/60 ring-4 ring-yellow-500/10" : "border-white/10"}`}>
            <input value={input} onChange={(e) => setInput(e.target.value)} maxLength={200} placeholder={listening ? t.listening : t.ph} aria-label={t.ph} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-500" />
            <button type="button" onClick={startVoice} aria-label="Voice input" className={`relative flex h-10 w-10 items-center justify-center rounded-full transition active:scale-90 ${listening ? "bg-red-500 text-white" : "text-gray-400 hover:bg-white/10 hover:text-white"}`}>
              {listening && <span className="absolute inset-0 animate-ping rounded-full bg-red-500/50" />}
              <Mic size={17} className="relative" />
            </button>
            <button type="submit" disabled={!input.trim()} aria-label="Send" className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500 text-black transition hover:bg-yellow-400 active:scale-90 disabled:opacity-40"><Send size={17} /></button>
          </form>
        </div>
      </footer>

      {/* Sheets */}
      <AnimatePresence>
        {sheet === "ticket" && (
          <Sheet title={t.ticketTitle} onClose={() => setSheet(null)}>
            {user ? <TicketForm user={user} L={L} preset={preset} onSent={onTicketSent} onError={(m) => notify(m, "error")} /> : <LoginPrompt t={t} />}
          </Sheet>
        )}
        {sheet === "mine" && (
          <Sheet title={t.myTickets} onClose={() => setSheet(null)} action={user && <button onClick={loadTickets} aria-label="Refresh" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"><RefreshCw size={16} /></button>}>
            {!user ? <LoginPrompt t={t} /> : myTickets === null ? (
              <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/5" />)}</div>
            ) : myTickets === false ? (
              <p className="py-6 text-center text-sm text-gray-400">{t.loadFail}</p>
            ) : myTickets.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-400">{t.none}</p>
            ) : (
              <ul className="space-y-3">
                {myTickets.map((k) => {
                  const st = stageOf(k.status);
                  const reply = k.reply || k.admin_reply || k.response;
                  return (
                    <li key={k.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-white">{k.subject}</p>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${st === 2 ? "bg-emerald-500/15 text-emerald-400" : "bg-yellow-500/15 text-yellow-400"}`}>{t.st[st]}</span>
                      </div>
                      <div className="mt-3 flex gap-1.5">{[0, 1, 2].map((i) => <span key={i} className={`h-1 flex-1 rounded-full ${i <= st ? (st === 2 ? "bg-emerald-400" : "bg-yellow-500") : "bg-white/10"}`} />)}</div>
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-500"><Clock size={12} /> {fmtDate(k.created_at)}</p>
                      {reply && <p className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-3 text-xs leading-relaxed text-gray-300"><span className="mb-1 block font-bold text-emerald-400">{t.teamReply}</span>{String(reply)}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
function IconBtn({ children, onClick, label, active }) {
  return <button type="button" onClick={onClick} aria-label={label} className={`flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white active:scale-90 ${active ? "text-yellow-400" : ""}`}>{children}</button>;
}

function TicketForm({ user, L, preset, onSent, onError }) {
  const t = T[L];
  const [form, setForm] = useState({ category: preset || "Payment", orderId: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const valid = form.subject.trim().length >= 4 && form.message.trim().length >= 10;

  const submit = async (e) => {
    e.preventDefault();
    if (!valid || busy) return;
    setBusy(true);
    // Category and payment ID are folded into the existing columns, so no table changes are needed.
    const { data, error } = await supabase.from("tickets").insert([{
      user_id: user.id,
      user_email: user.email,
      subject: `[${form.category}] ${form.subject.trim()}`,
      message: `${form.orderId.trim() ? `Order/Payment ID: ${form.orderId.trim()}\n\n` : ""}${form.message.trim()}`,
    }]).select().maybeSingle();
    setBusy(false);
    if (error) return onError(t.submitErr);
    onSent(data?.id);
  };

  const field = "w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/10";
  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <p className="mb-2 text-xs font-semibold text-gray-500">{t.about}</p>
        <div className="flex flex-wrap gap-2">
          {CATS.map(([v, labels]) => (
            <button type="button" key={v} onClick={() => setForm((f) => ({ ...f, category: v }))} className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition active:scale-95 ${form.category === v ? "border-yellow-500 bg-yellow-500 text-black" : "border-white/10 bg-white/5 text-gray-300 hover:border-yellow-500/40"}`}>{labels[L]}</button>
          ))}
        </div>
      </div>
      <input value={form.orderId} onChange={set("orderId")} maxLength={60} placeholder={t.orderPh} className={field} />
      <input value={form.subject} onChange={set("subject")} maxLength={80} placeholder={t.subPh} className={field} required />
      <div>
        <textarea value={form.message} onChange={set("message")} maxLength={600} placeholder={t.msgPh} className={`${field} h-28 resize-none`} required />
        <p className="mt-1 text-right text-[11px] text-gray-600">{form.message.length}/600</p>
      </div>
      <p className="flex items-center gap-1.5 text-xs text-gray-500"><Mail size={13} /> {t.replyTo(user.email)}</p>
      <button type="submit" disabled={!valid || busy} className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-amber-600 py-3.5 text-sm font-extrabold text-black shadow-[0_12px_28px_-12px_rgba(234,179,8,0.7)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50">
        {busy ? t.submitting : <><Send size={16} /> {t.submit}</>}
      </button>
    </form>
  );
}

function LoginPrompt({ t }) {
  return (
    <div className="py-8 text-center">
      <LogIn className="mx-auto mb-3 text-yellow-500" size={28} />
      <p className="mb-5 text-sm text-gray-400">{t.loginAsk}</p>
      <Link href="/" className="inline-block rounded-full bg-yellow-500 px-6 py-2.5 text-sm font-bold text-black transition hover:bg-yellow-400 active:scale-95">{t.goLogin}</Link>
    </div>
  );
}

function Sheet({ title, onClose, action, children }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <motion.div
        role="dialog" aria-label={title}
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="relative max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] border border-white/10 bg-[#0d0d14] p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:rounded-[2rem]"
      >
        <div className="mb-5 flex items-center justify-between gap-2">
          <h2 className="flex min-w-0 flex-1 items-center gap-2 text-lg font-bold text-white"><Ticket size={20} className="shrink-0 text-yellow-500" /> <span className="truncate">{title}</span></h2>
          {action}
          <button onClick={onClose} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-gray-400 transition hover:bg-white/10 hover:text-white"><X size={18} /></button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Toast({ toast }) {
  const tone = !toast ? "" : toast.type === "success" ? "border-emerald-500/40 bg-emerald-950/80 text-emerald-300" : toast.type === "error" ? "border-red-500/40 bg-red-950/80 text-red-300" : "border-yellow-500/40 bg-yellow-950/80 text-yellow-200";
  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-[9999] flex justify-center px-4" aria-live="polite">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold shadow-2xl backdrop-blur-md ${tone}`}>
            {toast.type === "success" ? <CheckCircle2 size={18} /> : toast.type === "error" ? <AlertTriangle size={18} /> : <Info size={18} />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
