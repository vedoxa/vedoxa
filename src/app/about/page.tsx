import React from "react";
import Link from "next/link";
// UI Icons ke liye lucide-react
import { 
  ShieldCheck, 
  MessageCircle, 
  ArrowLeft,
  BookOpen,
  Sparkles
} from "lucide-react";
// Social Media Icons ke liye react-icons (FontAwesome 6)
import { 
  FaInstagram, 
  FaYoutube, 
  FaXTwitter, 
  FaFacebook 
} from "react-icons/fa6";

export default function AboutPage() {
  const socialLinks = [
    { name: "Instagram", icon: <FaInstagram size={24} />, url: "https://www.instagram.com/vedoxa.shop?utm_source=qr&igsh=ZnNrbjUxeGI0NTM3", color: "hover:text-pink-500" },
    { name: "YouTube", icon: <FaYoutube size={24} />, url: "https://www.youtube.com/@vedoxa1", color: "hover:text-red-500" },
    { name: "X (Twitter)", icon: <FaXTwitter size={24} />, url: "https://x.com/Vedoxa", color: "hover:text-blue-400" },
    { name: "Facebook", icon: <FaFacebook size={24} />, url: "https://www.facebook.com/share/1AvX47PdWn/", color: "hover:text-blue-600" },
    { name: "ShareChat", icon: <MessageCircle size={24} />, url: "https://sharechat.com/profile/vedoxa?d=n", color: "hover:text-yellow-400" }
  ];

  return (
    <div className="min-h-screen bg-[#06060a] text-gray-200 selection:bg-yellow-500/30 font-sans">
      
      {/* Simple Header */}
      <nav className="sticky top-0 z-[500] px-4 py-4 md:px-8 bg-black/80 backdrop-blur-xl border-b border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-2 md:gap-3">
          <ShieldCheck className="text-yellow-500 w-6 h-6 md:w-8 md:h-8" />
          <span className="font-serif text-lg md:text-2xl font-black tracking-widest text-white uppercase">Vedoxa</span>
        </div>
        <Link href="/" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-yellow-500 transition">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
        
        {/* Title Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 font-serif">
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">Vedoxa</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Awakening minds through the power of authentic spiritual and psychological knowledge.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-12 mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 blur-[80px] rounded-full pointer-events-none -z-10" />
          
          <div className="flex items-center gap-4 mb-6">
            <BookOpen className="text-yellow-500 w-8 h-8" />
            <h2 className="text-2xl font-bold text-white">Our Mission</h2>
          </div>
          
          <div className="space-y-4 text-gray-300 leading-relaxed text-sm md:text-base">
            <p>
              वेडोक्सा (Vedoxa) सिर्फ एक डिजिटल ई-बुक स्टोर नहीं है, बल्कि यह आत्म-ज्ञान और मानसिक विकास की एक यात्रा है। हमारा मुख्य उद्देश्य आपको आध्यात्मिकता (Spirituality) और मनोविज्ञान (Psychology) का वो गहरा ज्ञान प्रदान करना है, जो जीवन को देखने का नज़रिया बदल सके।
            </p>
            <p>
              हम मानते हैं कि सही ज्ञान इंसान की चेतना (Consciousness) को जागृत कर सकता है। इसीलिए हम 100% ऑरिजिनल, वेरिफाइड और उच्च गुणवत्ता वाली ई-बुक्स आपके लिए लाते हैं, ताकि आप जीवन की उलझनों को समझ सकें और मानसिक शांति प्राप्त कर सकें।
            </p>
          </div>
        </div>

        {/* Why Trust Us Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-yellow-500/30 transition duration-300">
            <ShieldCheck className="text-yellow-500 w-8 h-8 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">100% Secure & Verified</h3>
            <p className="text-gray-400 text-sm">Our digital library ensures bank-grade 256-bit secure payments and authentic content verified by experts.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-yellow-500/30 transition duration-300">
            <Sparkles className="text-yellow-500 w-8 h-8 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Instant Access</h3>
            <p className="text-gray-400 text-sm">Experience seamless learning with instant auto-downloads and our specialized built-in web reader.</p>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Join Our Community</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {socialLinks.map((social, index) => (
              <a 
                key={index} 
                href={social.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-4 rounded-xl text-gray-300 font-semibold transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-[0_10px_20px_rgba(234,179,8,0.1)] ${social.color}`}
              >
                {social.icon}
                <span>{social.name}</span>
              </a>
            ))}
          </div>
          <p className="text-gray-500 text-sm mt-8">
            Stay connected with us on social media for daily insights, new book launches, and spiritual awakening quotes.
          </p>
        </div>

      </main>
    </div>
  );
}
