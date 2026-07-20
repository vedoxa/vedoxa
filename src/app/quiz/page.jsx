"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  Sparkles, 
  BookOpen, 
  User, 
  Briefcase, 
  Brain, 
  Heart,
  ArrowRight,
  Loader2,
  CheckCircle2
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Supabase Setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key";
const supabase = createClient(supabaseUrl, supabaseKey);

// --- QUIZ DATA ---
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
      { label: "Under 18", value: "under_18", sub: "Teenager" },
      { label: "18 - 24", value: "18_24", sub: "Youth" },
      { label: "25 - 35", value: "25_35", sub: "Adult" },
      { label: "35+", value: "above_35", sub: "Experienced" },
    ]
  },
  {
    id: "profession",
    type: "choice",
    title: "What do you do?",
    subtitle: "Aap kya karte hain?",
    icon: Briefcase,
    options: [
      { label: "Student", value: "student", sub: "Padhai kar rahe hain" },
      { label: "Professional", value: "professional", sub: "Job karte hain" },
      { label: "Business", value: "business", sub: "Apna vyapar hai" },
      { label: "Homemaker / Other", value: "other", sub: "Ghar sambhalte hain" },
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
      { label: "Peace of Mind", value: "peace", sub: "Dimaagi shanti" },
      { label: "Motivation", value: "motivation", sub: "Aage badhne ki prerna" },
      { label: "Focus & Productivity", value: "focus", sub: "Kaam me dhyan" },
      { label: "Relaxation", value: "relax", sub: "Bas thoda sukoon" },
    ]
  }
];

// --- BOOK DATABASE (Mock Data) ---
const MOCK_BOOKS = [
  {
    title: "The Bhagavad Gita As It Is",
    author: "A.C. Bhaktivedanta Swami Prabhupada",
    tags: ["spiritual", "peace", "relax", "student", "professional", "business", "other"],
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=800&auto=format&fit=crop",
    desc: "Find ultimate peace and answers to life's toughest questions. (Zindagi ke har sawal ka jawab)"
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    tags: ["self_help", "focus", "motivation", "student", "professional"],
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=800&auto=format&fit=crop",
    desc: "Build good habits and break bad ones. (Apni aadatein badlein aur aage badhein)"
  },
  {
    title: "Rich Dad Poor Dad",
    author: "Robert Kiyosaki",
    tags: ["business", "focus", "professional"],
    image: "https://images.unsplash.com/photo-1554774853-719586f82d77?q=80&w=800&auto=format&fit=crop",
    desc: "Learn the secrets of financial literacy. (Paise ke baare me wo jo school nahi sikhata)"
  },
  {
    title: "Jeet Aapki",
    author: "Shiv Khera",
    tags: ["self_help", "motivation", "student", "business", "other"],
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=800&auto=format&fit=crop",
    desc: "A positive attitude can change your life. (Kamyabi ki or ek kadam)"
  }
];

export default function QuizPage() {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = Intro, 0...N = Quiz, N+1 = Loading, N+2 = Result
  const [answers, setAnswers] = useState({});
  const [recommendedBook, setRecommendedBook] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Smooth scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const handleOptionSelect = (stepId, value) => {
    setAnswers(prev => ({ ...prev, [stepId]: value }));
    setTimeout(() => handleNext(), 400); // Small delay for animation feel
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
    setCurrentStep(QUIZ_STEPS.length); // Trigger Loading State
    
    // 1. Logic to find the best book
    let bestMatch = MOCK_BOOKS[0]; // Default
    let maxScore = -1;

    MOCK_BOOKS.forEach(book => {
      let score = 0;
      if (book.tags.includes(answers.interest)) score += 3;
      if (book.tags.includes(answers.mood)) score += 2;
      if (book.tags.includes(answers.profession)) score += 1;
      
      if (score > maxScore) {
        maxScore = score;
        bestMatch = book;
      }
    });

    setRecommendedBook(bestMatch);

    // 2. Save to Supabase
    try {
      setIsSubmitting(true);
      await supabase.from("user_book_preferences").insert([
        {
          name: answers.name || "Anonymous",
          age_group: answers.age,
          profession: answers.profession,
          interest: answers.interest,
          current_mood: answers.mood,
          recommended_book: bestMatch.title,
        }
      ]);
    } catch (error) {
      console.error("Error saving to Supabase:", error);
    } finally {
      setIsSubmitting(false);
      // Fake loading delay to make it feel like AI is thinking
      setTimeout(() => {
        setCurrentStep(QUIZ_STEPS.length + 1); // Show Result
      }, 2000);
    }
  };

  // --- RENDERERS ---

  const renderIntro = () => (
    <div className="flex flex-col items-center justify-center text-center animate-[slideUp_0.8s_ease-out_forwards] py-12">
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-yellow-500/30 blur-[40px] rounded-full group-hover:bg-yellow-500/40 transition duration-700"></div>
        <div className="relative bg-gradient-to-br from-[#1a1a24] to-[#0d0d14] p-6 rounded-[2rem] border border-white/10 shadow-2xl">
          <Sparkles size={48} className="text-yellow-400" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4 tracking-tight">
        Find Your Perfect Book
      </h1>
      <h2 className="text-xl md:text-2xl font-medium text-yellow-500/90 mb-6">
        Apni Perfect Book Khojein
      </h2>
      <p className="text-gray-400 max-w-md mx-auto mb-10 text-sm md:text-base leading-relaxed">
        We'll ask you a few simple questions about your life, mood, and interests to recommend a book that can truly help you right now.
      </p>

      <button 
        onClick={() => setCurrentStep(0)}
        className="group relative overflow-hidden bg-white text-black px-8 py-4 rounded-full font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
      >
        <span className="relative z-10 flex items-center gap-2">
          Start The Quiz <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
    </div>
  );

  const renderQuestion = () => {
    const step = QUIZ_STEPS[currentStep];
    const Icon = step.icon;
    const isAnswered = answers[step.id] && answers[step.id].trim() !== "";

    return (
      <div key={currentStep} className="w-full max-w-2xl mx-auto animate-[fadeIn_0.5s_ease-out_forwards]">
        {/* Progress Bar */}
        <div className="mb-12 flex items-center justify-center gap-2">
          {QUIZ_STEPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentStep ? "w-8 bg-yellow-500" : 
                idx < currentStep ? "w-4 bg-yellow-500/50" : "w-4 bg-white/10"
              }`}
            />
          ))}
        </div>

        <div className="bg-white/[0.03] border border-white/[0.08] p-8 md:p-12 rounded-[2.5rem] shadow-2xl backdrop-blur-sm">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.15)]">
              <Icon size={28} />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{step.title}</h2>
            <p className="text-gray-400 font-medium text-lg">{step.subtitle}</p>
          </div>

          {step.type === "input" ? (
            <div className="flex flex-col gap-6">
              <input 
                type="text"
                placeholder="Enter your name / Apna naam likhein"
                value={answers[step.id] || ""}
                onChange={(e) => handleInputChange(step.id, e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && isAnswered && handleNext()}
                className="w-full bg-white/5 border border-white/10 focus:border-yellow-500/50 rounded-2xl px-6 py-4 text-white text-lg outline-none transition-all text-center focus:bg-white/10"
                autoFocus
              />
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-4 rounded-2xl transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Next <ArrowRight size={20} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {step.options.map((opt, i) => {
                const isSelected = answers[step.id] === opt.value;
                return (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(step.id, opt.value)}
                    className={`relative p-6 rounded-2xl text-left transition-all duration-300 border flex flex-col gap-1 overflow-hidden group
                      ${isSelected 
                        ? "bg-yellow-500/10 border-yellow-500 text-white shadow-[0_0_20px_rgba(234,179,8,0.2)]" 
                        : "bg-white/5 border-white/5 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:scale-[1.02]"
                      }`}
                  >
                    <span className="font-semibold text-lg">{opt.label}</span>
                    <span className={`text-sm ${isSelected ? "text-yellow-200" : "text-gray-500"}`}>{opt.sub}</span>
                    
                    {isSelected && (
                      <CheckCircle2 className="absolute top-4 right-4 text-yellow-500" size={20} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLoading = () => (
    <div className="flex flex-col items-center justify-center text-center py-20 animate-[fadeIn_0.5s_ease-out_forwards]">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
        <Brain className="absolute inset-0 m-auto text-yellow-500 animate-pulse" size={32} />
      </div>
      <h2 className="text-3xl font-bold text-white mb-2">Analyzing your profile...</h2>
      <p className="text-gray-400">Aapki profile ke hisaab se best book dhoondh rahe hain...</p>
    </div>
  );

  const renderResult = () => (
    <div className="max-w-3xl mx-auto w-full animate-[slideUp_0.8s_ease-out_forwards] pb-12">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-green-500/10 text-green-400 px-4 py-2 rounded-full font-medium mb-6 border border-green-500/20">
          <CheckCircle2 size={18} /> Match Found for {answers.name || "You"}
        </div>
        <h2 className="text-4xl font-black text-white mb-4">Your Perfect Book</h2>
        <p className="text-gray-400">Based on your mood and interests, we highly recommend this for you.</p>
      </div>

      <div className="bg-gradient-to-b from-white/[0.08] to-transparent border border-white/10 rounded-[3rem] p-8 md:p-12 backdrop-blur-md relative overflow-hidden flex flex-col md:flex-row gap-8 items-center">
        {/* Glow behind book */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 blur-[80px] rounded-full"></div>
        
        {/* Book Cover mock */}
        <div className="w-48 md:w-64 aspect-[2/3] bg-gray-900 rounded-lg shadow-2xl relative z-10 overflow-hidden border border-white/10 shrink-0 transform hover:scale-105 transition-transform duration-500">
           {recommendedBook?.image ? (
             <img src={recommendedBook.image} alt="Cover" className="w-full h-full object-cover opacity-80 mix-blend-overlay" />
           ) : null}
           <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
              <p className="text-white font-bold leading-tight">{recommendedBook?.title}</p>
              <p className="text-yellow-500 text-xs mt-1">{recommendedBook?.author}</p>
           </div>
        </div>

        {/* Book Details */}
        <div className="flex-1 relative z-10 text-center md:text-left">
          <h3 className="text-3xl font-bold text-white mb-2">{recommendedBook?.title}</h3>
          <p className="text-yellow-500 font-medium mb-6">By {recommendedBook?.author}</p>
          
          <div className="bg-black/30 rounded-2xl p-6 border border-white/5 mb-8">
            <p className="text-gray-300 text-lg leading-relaxed italic">
              "{recommendedBook?.desc}"
            </p>
          </div>

          <Link href="/explore" className="inline-flex items-center justify-center gap-2 w-full md:w-auto bg-white text-black font-bold py-4 px-8 rounded-full hover:bg-gray-200 transition-colors shadow-xl">
             Explore this Book <ArrowRight size={20} />
          </Link>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <button onClick={() => {setCurrentStep(-1); setAnswers({});}} className="text-gray-500 hover:text-white transition-colors text-sm">
          Take Quiz Again (Dobara shuru karein)
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#02040A] text-gray-200 flex flex-col relative overflow-hidden font-sans selection:bg-yellow-500/30">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-yellow-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-20 p-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white font-medium hover:bg-white/5 px-4 py-2 rounded-xl transition">
          <ChevronLeft size={20} /> Home
        </Link>
        {currentStep >= 0 && currentStep < QUIZ_STEPS.length && (
          <span className="text-sm font-bold text-yellow-500 bg-yellow-500/10 px-4 py-1.5 rounded-full border border-yellow-500/20">
            Step {currentStep + 1} of {QUIZ_STEPS.length}
          </span>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 w-full h-full">
        {currentStep === -1 && renderIntro()}
        {currentStep >= 0 && currentStep < QUIZ_STEPS.length && renderQuestion()}
        {currentStep === QUIZ_STEPS.length && renderLoading()}
        {currentStep === QUIZ_STEPS.length + 1 && renderResult()}
      </main>

      {/* Global CSS for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
      `}} />
    </div>
  );
}
