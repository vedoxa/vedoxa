"use client";
import { useState, useEffect } from "react";
import { ShieldCheck, Upload, Users, IndianRupee, BookOpen, Settings, Lock, Percent, Eye, Trash2 } from "lucide-react";
import { createClient } from '@supabase/supabase-js';

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

  const [title, setTitle] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  
  const finalPrice = basePrice - (basePrice * discount / 100);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) setIsAuthenticated(true);
      setIsLoading(false);
    };
    checkSession();
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError("Invalid Credentials");
    else if (data.user) setIsAuthenticated(true);
  };

  if (isLoading) return <div className="min-h-screen bg-[#060608] flex items-center justify-center text-yellow-500 font-bold tracking-widest animate-pulse">VEDOXA SECURING...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full bg-[#0a0a0d] border border-white/5 p-10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,1)] relative">
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-yellow-500 rounded-full blur-[80px] opacity-20"></div>
          <div className="flex flex-col items-center mb-10">
            <ShieldCheck size={48} className="text-yellow-500 mb-4" />
            <h1 className="text-3xl font-black text-white tracking-tighter">ADMIN LOGIN</h1>
            <p className="text-gray-500 text-sm mt-2">Enter Vedoxa secure terminal</p>
          </div>
          <form onSubmit={handleAdminLogin} className="space-y-5">
            {loginError && <div className="text-red-400 text-xs bg-red-400/10 p-3 rounded-lg border border-red-400/20 text-center">{loginError}</div>}
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-yellow-500/50 outline-none transition-all" placeholder="Admin Email" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-yellow-500/50 outline-none transition-all" placeholder="Secret Key" />
            <button className="w-full bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black py-4 rounded-xl shadow-[0_10px_30px_rgba(234,179,8,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all">UNLOCK SYSTEM</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] text-gray-300 flex font-sans">
      <aside className="w-72 bg-[#09090b] border-r border-white/5 p-8 flex flex-col sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12 group cursor-pointer">
          <div className="p-2 bg-yellow-500/10 rounded-lg group-hover:bg-yellow-500/20 transition">
            <ShieldCheck className="text-yellow-500" size={24} />
          </div>
          <span className="font-black text-xl tracking-tighter text-white">VEDOXA <span className="text-yellow-500 text-xs tracking-normal block opacity-70">CONTROL CENTER</span></span>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'dashboard', label: 'Overview', icon: IndianRupee },
            { id: 'upload', label: 'Book Manager', icon: Upload },
            { id: 'users', label: 'Customers', icon: Users },
          ].map((item) => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${activeTab === item.id ? "bg-yellow-500 text-black shadow-lg shadow-yellow-500/20" : "hover:bg-white/5 text-gray-500 hover:text-white"}`}>
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>

        <button onClick={async () => { await supabase.auth.signOut(); setIsAuthenticated(false); }} className="flex items-center gap-4 px-5 py-4 text-red-400 font-bold hover:bg-red-400/10 rounded-2xl transition-all border border-transparent hover:border-red-400/10">
          <Lock size={18} /> Secure Logout
        </button>
      </aside>

      <main className="flex-1 p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black text-white capitalize tracking-tight">{activeTab}</h1>
            <p className="text-gray-500 mt-1">Management and real-time operations</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/5 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                <span className="text-xs font-bold tracking-widest text-green-500 uppercase">Server Active</span>
             </div>
          </div>
        </header>

        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-white/10 to-transparent p-8 rounded-3xl border border-white/10 hover:border-yellow-500/20 transition-all">
              <div className="w-12 h-12 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-6"><IndianRupee className="text-yellow-500" /></div>
              <div className="text-gray-400 font-bold text-sm uppercase tracking-widest">Total Sales</div>
              <div className="text-4xl font-black text-white mt-2">₹0.00</div>
            </div>
            <div className="bg-gradient-to-br from-white/10 to-transparent p-8 rounded-3xl border border-white/10 hover:border-yellow-500/20 transition-all">
               <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6"><Users className="text-blue-500" /></div>
              <div className="text-gray-400 font-bold text-sm uppercase tracking-widest">Active Users</div>
              <div className="text-4xl font-black text-white mt-2">0</div>
            </div>
            <div className="bg-gradient-to-br from-white/10 to-transparent p-8 rounded-3xl border border-white/10 hover:border-yellow-500/20 transition-all">
               <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6"><BookOpen className="text-purple-500" /></div>
              <div className="text-gray-400 font-bold text-sm uppercase tracking-widest">Books Hosted</div>
              <div className="text-4xl font-black text-white mt-2">0</div>
            </div>
          </div>
        )}

        {activeTab === "upload" && (
          <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="bg-[#0a0a0d] border border-white/5 p-10 rounded-[32px] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10"><BookOpen size={100} /></div>
               <h2 className="text-2xl font-black mb-8 text-white flex items-center gap-3">
                 <div className="w-2 h-8 bg-yellow-500 rounded-full"></div> New Publication
               </h2>
               
               <div className="space-y-6">
                 <div>
                   <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Book Title</label>
                   <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-yellow-500/50 outline-none transition-all" placeholder="Enter title..." />
                 </div>

                 <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Base Price (₹)</label>
                      <input value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} type="number" className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-yellow-500/50 outline-none transition-all font-bold" />
                    </div>
                    <div>
                      <label className="text-xs font-black text-yellow-500 uppercase tracking-widest mb-2 block">Discount (%)</label>
                      <div className="relative">
                        <input value={discount} onChange={(e) => setDiscount(Number(e.target.value))} type="number" className="w-full bg-yellow-500/5 border border-yellow-500/20 rounded-2xl px-6 py-4 text-yellow-500 focus:border-yellow-500 outline-none transition-all font-bold" />
                        <Percent size={16} className="absolute right-6 top-1/2 -translate-y-1/2 opacity-50" />
                      </div>
                    </div>
                 </div>

                 <div className="p-6 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center">
                    <span className="font-bold text-gray-400">Final Price for Customer:</span>
                    <span className="text-2xl font-black text-white">₹{finalPrice.toFixed(2)}</span>
                 </div>

                 <button className="w-full bg-white text-black font-black py-5 rounded-2xl hover:bg-yellow-500 transition-all flex items-center justify-center gap-3 group">
                   <Upload size={20} className="group-hover:-translate-y-1 transition-transform" /> PUBLISH TO VEDOXA
                 </button>
               </div>
            </div>

            {/* Preview Section */}
            <div className="bg-white/5 border border-white/5 p-10 rounded-[32px] flex flex-col items-center justify-center text-center">
                <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                   <Eye size={32} className="text-gray-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-500">Live Preview</h3>
                <p className="text-sm text-gray-600 mt-2 max-w-[200px]">How the book will appear on the main website.</p>
                {title && (
                   <div className="mt-8 bg-white/10 p-6 rounded-2xl border border-yellow-500/30 w-full animate-in fade-in zoom-in duration-300">
                      <div className="text-xs text-yellow-500 font-black mb-1">VERIFIED BOOK</div>
                      <div className="text-lg font-black text-white mb-2">{title}</div>
                      <div className="text-xl font-bold">₹{finalPrice} <span className="text-xs text-gray-500 line-through ml-2">₹{basePrice}</span></div>
                   </div>
                )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
