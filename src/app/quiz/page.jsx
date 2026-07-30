// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  Sparkles, 
  BookOpen, 
  User, 
  Briefcase, 
  Brain, 
  Heart,
  ArrowRight,
  CheckCircle2,
  Star,
  Target,
  Zap,
  Gift,
  RefreshCw
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Supabase Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

// --- QUIZ DATA (Bilingual - English & Hindi) ---
const QUIZ_STEPS = [
  {
    id: "name",
    type: "input",
    title: "What should we call you?",
    subtitle: "Aapka shubh naam kya hai?",
    icon: User,
  },
  {
    id: "age",
    type: "choice",
    title: "What is your age group?",
    subtitle: "Aapki umar kitni hai?",
    icon: User,
    options: [
      { label: "Under 18", value: "under_18", sub: "Teenager (Kishor)" },
      { label: "18 - 24", value: "18_24", sub: "Youth (Yuva)" },
      { label: "25 - 35", value: "25_35", sub: "Adult (V वयस्क)" },
      { label: "35+", value: "above_35", sub: "Experienced (Anubhavi)" },
    ]
  },
  {
    id: "profession",
    type: "choice",
    title: "What do you do?",
    subtitle: "Aap kya karte hain?",
    icon: Briefcase,
    options: [
      { label: "Student", value: "Student", sub: "Padhai kar rahe hain" },
      { label: "Professional", value: "Professional", sub: "Job karte hain" },
      { label: "Business Owner", value: "Business", sub: "Apna vyapar hai" },
      { label: "Homemaker / Other", value: "Creator/Other", sub: "Ghar sambhalte hain" },
    ]
  },
  {
    id: "interest",
    type: "choice",
    title: "What kind of books do you prefer?",
    subtitle: "Aapko kaisi kitabein pasand hain?",
    icon: BookOpen,
    options: [
      { label: "Self-Help", value: "self_help", sub: "Khud ko behtar banane ke liye" },
      { label: "Spiritual", value: "spiritual", sub: "Dharmik aur shanti ke liye" },
      { label: "Business & Finance", value: "business", sub: "Paisa aur career" },
      { label: "Stories & Fiction", value: "fiction", sub: "Kahania aur manoranjan" },
    ]
  },
  {
    id: "mood",
    type: "choice",
    title: "What are you looking for right now?",
    subtitle: "Abhi aap zindagi me kya chahte hain?",
    icon: Heart,
    options: [
      { label: "Peace of Mind", value: "Peace", sub: "Dimaagi shanti" },
      { label: "Motivation", value: "Motivation", sub: "Aage badhne ki prerna" },
      { label: "Focus & Growth", value: "Focus", sub: "Kaam me dhyan" },
      { label: "Relaxation", value: "Relaxation", sub: "Bas thoda sukoon" },
    ]
  }
];

// Design Themes for dynamic books
const CARD_THEMES = [
  { theme: "from-orange-500 to-amber-600", shadow: "shadow-orange-500/50" },
  { theme: "from-blue-500 to-cyan-600", shadow: "shadow-blue-500/50" },
  { theme: "from-emerald-500 to-green-600", shadow: "shadow-emerald-500/50" },
  { theme: "from-purple-500 to-pink-600", shadow: "shadow-purple-500/50" }
];

export default function QuizPage() {
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(-1); 
  const [answers, setAnswers] = useState({});
  const [recommendedBook, setRecommendedBook] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Database States
  const [dbBooks, setDbBooks] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [isFetchingApp, setIsFetchingApp] = useState(true);

  // Fetch Books and User Profile on Load
  useEffect(() => {
    const initQuiz = async () => {
      setIsFetchingApp(true);
      
      // 1. Fetch Books from Database
      const { data: booksData } = await supabase.from("books").select("*");
      if (booksData) setDbBooks(booksData);

      // 2. Fetch User & Preferences
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Get name from profiles table
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profile) setUserProfile(profile);

        // Get old preferences to Auto-Fill
        const { data: prefs } = await supabase
          .from("user_book_preferences")
          .select("*")
          .eq("name", profile?.name || session.user.email) // Fallback matching
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (prefs) {
          setAnswers({
            name: prefs.name || profile?.name || "",
            age: prefs.age_group || "",
            profession: prefs.profession || "",
            interest: prefs.interest || "",
            mood: prefs.current_mood || ""
          });
        }
      }
      setIsFetchingApp(false);
    };

    initQuiz();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleOptionSelect = (stepId, value) => {
    setAnswers(prev => ({ ...prev, [stepId]: value }));
    setTimeout(() => handleNext(), 300);
  };

  const handleInputChange = (stepId, value) => {
    setAnswers(prev => ({ ...prev, [stepId]: value }));
  };

  const handleNext = () => {
    if (currentStep < QUIZ_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setCurrentStep(QUIZ_STEPS.length); 
    
    // SMART MATCHING ALGORITHM (Database Books ke sath)
    let bestMatch = dbBooks.length > 0 ? dbBooks[0] : null; 
    let maxScore = -1;

    if (dbBooks.length > 0) {
      dbBooks.forEach(book => {
        let score = 0;
        const searchString = `${book.title} ${book.description || ''}`.toLowerCase();
        
        // Mapping answers to keywords
        if (searchString.includes(answers.interest?.toLowerCase() || '')) score += 3;
        if (searchString.includes(answers.mood?.toLowerCase() || '')) score += 2;
        if (searchString.includes(answers.profession?.toLowerCase() || '')) score += 1;
        
        // Hindi/English Keyword Matching Logic
        if (answers.mood === "Peace" && (searchString.includes('shanti') || searchString.includes('peace'))) score += 3;
        if (answers.mood === "Motivation" && (searchString.includes('safalta') || searchString.includes('motivate') || searchString.includes('jeet'))) score += 3;
        
        if (score > maxScore) {
          maxScore = score;
          bestMatch = book;
        }
      });
    }

    // Assign random visual theme for UI
    if (bestMatch) {
      const randomTheme = CARD_THEMES[Math.floor(Math.random() * CARD_THEMES.length)];
      bestMatch.theme = randomTheme.theme;
      bestMatch.shadow = randomTheme.shadow;
    }

    setRecommendedBook(bestMatch);

    // Save/Update in Database
    try {
      setIsSubmitting(true);
      await supabase.from("user_book_preferences").insert([
        {
          name: answers.name || "Anonymous",
          age_group: answers.age,
          profession: answers.profession,
          interest: answers.interest,
          current_mood: answers.mood,
          recommended_book: bestMatch?.title || "Unknown",
        }
      ]);
    } catch (error) {
      console.error("Error saving to Supabase:", error);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setCurrentStep(QUIZ_STEPS.length + 1); 
      }, 2500); // Suspense animation
    }
  };

  // --- RENDERERS ---

  const renderIntro = () => (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
      className="flex flex-col items-center justify-center text-center py-12"
    >
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-pink-500 blur-[50px] rounded-full opacity-50 group-hover:opacity-80 transition duration-700 animate-pulse"></div>
        <div className="relative bg-gradient-to-br from-[#1a1a24] to-[#0d0d14] p-6 rounded-[2rem] border border-white/10 shadow-2xl">
          <Sparkles size={48} className="text-amber-400" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-500 mb-4 tracking-tight">
        Discover Your Perfect Book
      </h1>
      <h2 className="text-xl md:text-2xl font-medium text-amber-500/90 mb-6">
        Apne Liye Ek Sahi Kitaab Chunein
      </h2>
      <p className="text-gray-400 max-w-md mx-auto mb-10 text-sm md:text-base leading-relaxed">
        Hum aapki zindagi, mood, aur zarooraton ke hisaab se humari premium library se aapke liye sabse perfect book select karenge.
      </p>

      {isFetchingApp ? (
        <div className="flex items-center gap-2 text-amber-500 font-bold"><RefreshCw className="animate-spin" /> Loading Library...</div>
      ) : (
        <button 
          onClick={() => setCurrentStep(0)}
          className="group relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 text-black px-10 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(245,158,11,0.4)]"
        >
          <span className="relative z-10 flex items-center gap-2">
            Start The Magic <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </button>
      )}
    </motion.div>
  );

  const renderQuestion = () => {
    const step = QUIZ_STEPS[currentStep];
    const Icon = step.icon;
    const isAnswered = answers[step.id] && answers[step.id].trim() !== "";

    return (
      <AnimatePresence mode="wait">
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-2xl mx-auto"
        >
          {/* Progress Bar */}
          <div className="mb-12 flex items-center justify-center gap-3">
            {QUIZ_STEPS.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-2 rounded-full transition-all duration-500 ${
                  idx === currentStep ? "w-10 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]" : 
                  idx < currentStep ? "w-4 bg-amber-500/50" : "w-4 bg-white/10"
                }`}
              />
            ))}
          </div>

          <div className="bg-white/[0.02] border border-white/[0.08] p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="flex flex-col items-center text-center mb-10 relative z-10">
              <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
                className="w-20 h-20 bg-gradient-to-br from-amber-500/20 to-pink-500/20 text-amber-400 rounded-3xl flex items-center justify-center mb-6 border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.2)]"
              >
                <Icon size={36} />
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">{step.title}</h2>
              <p className="text-amber-500/80 font-medium text-lg">{step.subtitle}</p>
            </div>

            {step.type === "input" ? (
              <div className="flex flex-col gap-6 relative z-10">
                {/* SMART SUGGESTION FROM PROFILE */}
                {userProfile?.name && (
                   <button 
                     onClick={() => { handleInputChange(step.id, userProfile.name); handleNext(); }}
                     className="bg-amber-500/10 border border-amber-500/30 text-amber-400 py-3 rounded-xl font-bold hover:bg-amber-500/20 transition flex items-center justify-center gap-2"
                   >
                     Continue as {userProfile.name} <CheckCircle2 size={18} />
                   </button>
                )}
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 opacity-50">OR</div>
                  <input 
                    type="text"
                    placeholder="Type your name / Apna naam likhein"
                    value={answers[step.id] || ""}
                    onChange={(e) => handleInputChange(step.id, e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && isAnswered && handleNext()}
                    className="w-full bg-black/40 border border-white/10 focus:border-amber-500/80 rounded-2xl px-6 py-5 text-white text-xl outline-none transition-all text-center focus:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                    autoFocus
                  />
                </div>
                
                <button
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold py-5 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg shadow-lg"
                >
                  Continue <ArrowRight size={20} />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                {step.options.map((opt, i) => {
                  const isSelected = answers[step.id] === opt.value;
                  return (
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      key={i}
                      onClick={() => handleOptionSelect(step.id, opt.value)}
                      className={`relative p-6 rounded-2xl text-left transition-all duration-300 border flex flex-col gap-1.5 overflow-hidden group
                        ${isSelected 
                          ? "bg-amber-500/15 border-amber-500 text-white shadow-[0_0_30px_rgba(245,158,11,0.25)]" 
                          : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-amber-500/30"
                        }`}
                    >
                      <span className="font-bold text-xl">{opt.label}</span>
                      <span className={`text-sm ${isSelected ? "text-amber-300" : "text-gray-400"}`}>{opt.sub}</span>
                      
                      {isSelected && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-5 right-5">
                          <CheckCircle2 className="text-amber-500" size={24} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  };

  const renderLoading = () => (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center text-center py-20"
    >
      <div className="relative w-32 h-32 mb-10">
        <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin shadow-[0_0_30px_rgba(245,158,11,0.5)]"></div>
        <div className="absolute inset-0 flex items-center justify-center bg-amber-500/10 rounded-full">
          <Sparkles className="text-amber-400 animate-ping" size={40} />
        </div>
      </div>
      <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-amber-200 mb-3">
        Analyzing your aura...
      </h2>
      <p className="text-amber-500/80 font-medium text-lg">Humari library se aapki zaroorat ke hisaab se best book nikal rahe hain...</p>
    </motion.div>
  );

  const renderResult = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}
      className="max-w-4xl mx-auto w-full pb-12"
    >
      <div className="text-center mb-10">
        <motion.div 
          initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-5 py-2.5 rounded-full font-bold mb-6 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
        >
          <CheckCircle2 size={20} /> 100% Match Found for {answers.name || "You"}
        </motion.div>
        
        <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
          Aapki Perfect Book Mil Gayi Hai! 🎉
        </h2>
        
        {/* PERSONALIZED REASONING MESSAGE */}
        <div className="max-w-2xl mx-auto bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 md:p-6 mb-8 text-amber-200">
          <p className="text-lg">
            "Kyunki aap ek <span className="font-bold text-white bg-amber-500/20 px-2 py-0.5 rounded">{answers.profession}</span> hain, aur is waqt apni life me <span className="font-bold text-white bg-amber-500/20 px-2 py-0.5 rounded">{answers.mood}</span> chahte hain, humari library se <span className="font-bold text-white underline decoration-amber-500">{recommendedBook?.title || 'yeh book'}</span> aapke liye ekdum sahi (perfect) saabit hogi."
          </p>
        </div>
      </div>

      <div className={`bg-gradient-to-br ${recommendedBook?.theme || 'from-amber-500 to-orange-500'} p-[1px] rounded-[3rem] shadow-2xl relative overflow-hidden`}>
        <div className="bg-[#0a0a10]/95 backdrop-blur-2xl rounded-[3rem] p-8 md:p-12 relative flex flex-col md:flex-row gap-10 items-center">
          
          <div className={`absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 ${recommendedBook?.theme || 'from-amber-500 to-orange-500'} opacity-20 blur-[100px] rounded-full`}></div>
          
          <motion.div 
            whileHover={{ scale: 1.05, rotateY: -10 }} transition={{ type: "spring" }}
            className={`w-56 md:w-72 aspect-[2/3] bg-gray-900 rounded-xl shadow-2xl relative z-10 overflow-hidden border border-white/20 shrink-0 ${recommendedBook?.shadow || 'shadow-amber-500/50'}`}
            style={{ transformPerspective: 1000 }}
          >
             {recommendedBook?.cover_path ? (
               <img src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/books-covers/${recommendedBook.cover_path}`} alt="Cover" className="w-full h-full object-contain bg-white opacity-90 transition-transform duration-700 hover:scale-110" />
             ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-800"><BookOpen size={64} className="text-gray-500"/></div>
             )}
             <div className="absolute inset-0 flex flex-col justify-end p-5 bg-gradient-to-t from-black via-black/40 to-transparent">
                <p className="text-white font-extrabold text-xl leading-tight">{recommendedBook?.title}</p>
                <p className="text-amber-400 font-medium text-sm mt-1">{recommendedBook?.author}</p>
             </div>
          </motion.div>

          <div className="flex-1 relative z-10 w-full text-left">
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-amber-500 fill-amber-500" size={18} />
              <Star className="text-amber-500 fill-amber-500" size={18} />
              <Star className="text-amber-500 fill-amber-500" size={18} />
              <Star className="text-amber-500 fill-amber-500" size={18} />
              <Star className="text-amber-500 fill-amber-500" size={18} />
              <span className="text-amber-500 font-bold ml-2 text-sm">Top Match (Sarvashreshth)</span>
            </div>

            <h3 className="text-3xl md:text-4xl font-black text-white mb-2">{recommendedBook?.title}</h3>
            <p className="text-gray-400 font-medium mb-6">By {recommendedBook?.author || 'Vedoxa Library'}</p>
            
            <div className="mb-8">
              <h4 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
                <Gift className="text-amber-500" /> Yeh Book Aapko Kyu Padhni Chahiye?
              </h4>
              <ul className="space-y-4">
                  <motion.li initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="flex items-start gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                    <div className="bg-amber-500/20 p-1.5 rounded-full shrink-0 mt-0.5"><Target size={16} className="text-amber-400" /></div>
                    <span className="text-gray-200 font-medium text-sm md:text-base">Aapki profile aur zarurato ke hisaab se best match karti hai.</span>
                  </motion.li>
                  <motion.li initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="flex items-start gap-3 bg-white/5 border border-white/10 p-3.5 rounded-2xl">
                    <div className="bg-amber-500/20 p-1.5 rounded-full shrink-0 mt-0.5"><Target size={16} className="text-amber-400" /></div>
                    <span className="text-gray-200 font-medium text-sm md:text-base">Isme diye gaye concepts aapko apne goals achieve karne me madad karenge.</span>
                  </motion.li>
              </ul>
            </div>

            {/* DIRECTING USER TO HOME PAGE FOR PURCHASE */}
            <button 
              onClick={() => router.push(`/?search=${encodeURIComponent(recommendedBook?.title)}`)}
              className={`inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r ${recommendedBook?.theme || 'from-amber-500 to-orange-500'} text-white font-black text-lg py-5 px-8 rounded-2xl hover:brightness-110 transition-all shadow-[0_10px_30px_rgba(0,0,0,0.5)] transform hover:-translate-y-1`}
            >
               Buy Now & Start Reading <Zap size={22} className="fill-white" />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-10 text-center flex flex-col gap-3 justify-center items-center">
        <button onClick={() => {setCurrentStep(-1);}} className="text-gray-500 hover:text-white transition-colors text-sm font-medium border border-gray-800 px-6 py-2 rounded-full hover:bg-white/5">
          Review Previous Answers (Apne purane answers dekhein)
        </button>
        <button onClick={() => {setCurrentStep(-1); setAnswers({});}} className="text-red-500/70 hover:text-red-400 transition-colors text-xs font-medium">
          Start Fresh (Naye sire se shuru karein)
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-[#05050A] text-gray-200 flex flex-col relative overflow-hidden font-sans selection:bg-amber-500/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-amber-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.04] mix-blend-overlay"></div>
      </div>

      <nav className="relative z-20 p-6 flex items-center justify-between max-w-6xl mx-auto w-full border-b border-white/5">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-bold hover:bg-white/10 px-5 py-2.5 rounded-full transition border border-transparent hover:border-white/10">
          <ChevronLeft size={20} /> Back to Library
        </Link>
        {currentStep >= 0 && currentStep < QUIZ_STEPS.length && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm font-bold text-amber-500 bg-amber-500/10 px-5 py-2 rounded-full border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Zap size={16} className="fill-amber-500" /> Step {currentStep + 1} of {QUIZ_STEPS.length}
          </motion.div>
        )}
      </nav>

      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 w-full h-full min-h-[80vh]">
        <AnimatePresence mode="wait">
          {currentStep === -1 && <motion.div key="intro" exit={{ opacity: 0, y: -20 }}>{renderIntro()}</motion.div>}
          {currentStep >= 0 && currentStep < QUIZ_STEPS.length && <div key="quiz">{renderQuestion()}</div>}
          {currentStep === QUIZ_STEPS.length && <motion.div key="loading" exit={{ opacity: 0, scale: 0.9 }}>{renderLoading()}</motion.div>}
          {currentStep === QUIZ_STEPS.length + 1 && <motion.div key="result">{renderResult()}</motion.div>}
        </AnimatePresence>
      </main>
    </div>
  );
}
