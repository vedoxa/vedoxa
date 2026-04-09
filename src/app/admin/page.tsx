"use client";
import { useState } from "react";
import { ShieldCheck, Upload, Users, IndianRupee, BookOpen, Settings } from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="min-h-screen bg-[#060608] text-gray-200 font-sans flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0d] border-r border-white/10 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-12">
          <ShieldCheck color="#eab308" size={28} />
          <span className="font-bold text-xl tracking-widest text-white">VEDOXA <span className="text-[#eab308] text-sm">ADMIN</span></span>
        </div>

        <nav className="flex flex-col gap-4">
          <button onClick={() => setActiveTab("dashboard")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "dashboard" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : "hover:bg-white/5"}`}>
            <IndianRupee size={20} /> Overview
          </button>
          <button onClick={() => setActiveTab("upload")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "upload" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : "hover:bg-white/5"}`}>
            <Upload size={20} /> Upload Book
          </button>
          <button onClick={() => setActiveTab("users")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "users" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : "hover:bg-white/5"}`}>
            <Users size={20} /> Customers
          </button>
          <button onClick={() => setActiveTab("settings")} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "settings" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : "hover:bg-white/5"}`}>
            <Settings size={20} /> Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-10 pb-6 border-b border-white/10">
          <h1 className="text-3xl font-bold text-white capitalize">{activeTab}</h1>
          <div className="px-4 py-2 bg-yellow-500/20 text-yellow-500 rounded-full text-sm font-bold border border-yellow-500/30">
            System Online
          </div>
        </header>

        {/* Dynamic Content Based on Tab */}
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
              <div className="text-3xl font-bold text-white">3</div>
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
