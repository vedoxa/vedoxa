"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, Upload, Users, IndianRupee, BookOpen, Settings, Lock } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

// Supabase Direct Connection (Bulletproof method)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  
  const [activeTab, setActiveTab] = useState("dashboard");

  // Load hote hi check karega ki tum pehle se login ho ya nahi
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    };
    checkSession();
  }, []);

  // Secure Login Function
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      setLoginError("Access Denied: Invalid Credentials");
    } else if (data.user) {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#060608] flex items-center justify-center text-yellow-500">Loading Secure Environment...</div>;
  }

  // 🔴 SECURITY LOCK SCREEN: Agar login nahi hai, toh sirf ye dikhega
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0a0a0d] border border-white/10 p-8 rounded-2xl shadow-[0_0_50px_rgba(234,179,8,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-600 to-yellow-400"></div>
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mb-4 border border-yellow-500/20">
              <Lock size={28} className="text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wider">VEDOXA SECURE</h1>
            <p className="text-gray-500 text-sm mt-1">Authorized Personnel Only</p>
          </div>

          <form onSubmit={handleAdminLogin} className="flex flex-col gap-4">
            {loginError && <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-2 rounded text-center">{loginError}</div>}
            <div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121214] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition" 
                placeholder="Admin Email" 
              />
            </div>
            <div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121214] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 transition" 
                placeholder="Secret Password" 
              />
            </div>
            <button type="submit" className="mt-2 bg-yellow-500 text-black font-bold py-3 rounded-lg hover:bg-yellow-400 transition shadow-[0_0_15px_rgba(234,179,8,0.2)]">
              Unlock Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // 🟢 MAIN DASHBOARD: Sahi password dalne ke baad hi ye render hoga
  return (
    <div className="min-h-screen bg-[#060608] text-gray-200 font-sans flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0d] border-r border-white/10 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <ShieldCheck color="#eab308" size={28} />
          <span className="font-bold text-xl tracking-widest text-white">VEDOXA <span className="text-[#eab308] text-sm">ADMIN</span></span>
        </div>

        <nav className="flex flex-col gap-4 flex-1">
          <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "dashboard" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : "hover:bg-white/5"}`}>
            <IndianRupee size={20} /> Overview
          </button>
          <button onClick={() => setActiveTab("upload")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "upload" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : "hover:bg-white/5"}`}>
            <Upload size={20} /> Upload Book
          </button>
          <button onClick={() => setActiveTab("users")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "users" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : "hover:bg-white/5"}`}>
            <Users size={20} /> Customers
          </button>
        </nav>

        {/* Logout Button */}
        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition mt-auto border border-transparent hover:border-red-500/20">
          <Lock size={20} /> Secure Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
          <h1 className="text-3xl font-bold text-white capitalize">{activeTab}</h1>
          <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-full text-sm font-bold border border-green-500/20 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            System Secure & Online
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <div className="text-gray-400 text-sm mb-2">Total Revenue</div>
              <div className="text-3xl font-bold text-white">₹0.00</div>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <div className="text-gray-400 text-sm mb-2">Books Sold</div>
              <div className="text-3xl font-bold text-white">0</div>
            </div>
            <div className="bg-white/5 p-6 rounded-xl border border-white/10">
              <div className="text-gray-400 text-sm mb-2">Active Books</div>
              <div className="text-3xl font-bold text-white">0</div>
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <div className="max-w-2xl bg-white/5 p-8 rounded-xl border border-white/10">
            <h2 className="text-xl font-bold mb-6 text-yellow-500">Upload New E-Book (PDF)</h2>
            <form className="flex flex-col gap-5">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Book Title</label>
                <input type="text" className="w-full bg-[#0a0a0d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500" placeholder="e.g. The Mind's Blueprint" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Selling Price (₹)</label>
                  <input type="number" className="w-full bg-[#0a0a0d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500" placeholder="499" />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Original Price (₹)</label>
                  <input type="number" className="w-full bg-[#0a0a0d] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500" placeholder="999" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Upload PDF File</label>
                <div className="w-full border-2 border-dashed border-white/20 rounded-xl p-10 flex flex-col items-center justify-center text-gray-500 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition cursor-pointer">
                  <Upload size={32} className="mb-3" />
                  <p>Click to select PDF file</p>
                  <p className="text-xs mt-1">(Secure & Encrypted Upload)</p>
                </div>
              </div>
              <button type="button" className="mt-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-bold py-3 rounded-lg hover:opacity-90 transition">
                Publish Book to Database
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
