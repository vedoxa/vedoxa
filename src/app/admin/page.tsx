// @ts-nocheck
/* eslint-disable */
"use client";
import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck, Upload, BookOpen, Lock, Percent, Users, Settings,
  LogOut, Eye, EyeOff, Trash2, Plus, X, Check, AlertCircle,
  BarChart3, TrendingUp, Zap, DollarSign, Tag, Mail, Phone, MapPin, CreditCard,
  Download, Filter, Search, Edit3, Copy, Loader, ChevronDown, Calendar, Star,
  TrendingDown, Activity, Bell, Menu, ChevronRight, Sparkles, ArrowUpRight, ArrowDownLeft, LineChart, PieChart
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy-url.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";
const lookerStudioUrl = process.env.NEXT_PUBLIC_LOOKER_STUDIO_URL || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PremiumAdminDashboard() {
  // AUTH & SECURITY
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // NAVIGATION
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // BOOK MANAGEMENT
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("VEDOXA");
  const [pages, setPages] = useState("");
  const [language, setLanguage] = useState("English");
  const [tags, setTags] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [bookSearch, setBookSearch] = useState("");
  
  // DISCOUNT MANAGEMENT
  const [discounts, setDiscounts] = useState([]);
  const [discountName, setDiscountName] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountStartDate, setDiscountStartDate] = useState("");
  const [discountEndDate, setDiscountEndDate] = useState("");
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [discountSearch, setDiscountSearch] = useState("");
  
  // COUPON MANAGEMENT
  const [coupons, setCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLimit, setCouponLimit] = useState(1);
  const [couponExpiry, setCouponExpiry] = useState("");
  const [couponSearch, setCouponSearch] = useState("");
  
  // CUSTOMER DATA
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [searchCustomer, setSearchCustomer] = useState("");
  
  // SETTINGS & SECURITY
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // MODALS
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showAddDiscountModal, setShowAddDiscountModal] = useState(false);
  const [showAddCouponModal, setShowAddCouponModal] = useState(false);

  // NOTIFICATIONS
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadAllData();
      const interval = setInterval(loadAllData, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) setIsAuthenticated(true);
    } catch (error) {
      console.log("Session check failed:", error);
    }
  };

  const loadAllData = async () => {
    if (!isAuthenticated) return;
    try {
      const [booksData, discountsData, couponsData, ordersData, customersData] = await Promise.all([
        supabase.from('books').select('*'),
        supabase.from('discounts').select('*'),
        supabase.from('coupons').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('customers').select('*')
      ]);

      if (booksData.data) setBooks(booksData.data);
      if (discountsData.data) setDiscounts(discountsData.data);
      if (couponsData.data) setCoupons(couponsData.data);
      if (ordersData.data) setOrders(ordersData.data);
      if (customersData.data) setCustomers(customersData.data);
    } catch (error) {
      console.log("Data load error:", error);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    setIsLoggingIn(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoginError("❌ Invalid credentials. Please try again.");
      } else if (data.user) {
        setIsAuthenticated(true);
        setEmail("");
        setPassword("");
        addNotification("Welcome back! 👋", "success");
      }
    } catch (error) {
      setLoginError("Login failed: " + error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const addNotification = (message, type = "info") => {
    const id = Date.now();
    setNotifications([...notifications, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const handlePublishBook = async () => {
    if (!title || basePrice <= 0 || !file) {
      setUploadStatus("❌ Title, Price and PDF file are required!");
      return;
    }

    setIsUploading(true);
    setUploadStatus("🖼️ Uploading Cover Image...");

    try {
      let coverFileName = null;
      if (coverFile) {
        coverFileName = `${Date.now()}-cover-${Math.random().toString(36).substring(2)}.${coverFile.name.split('.').pop()}`;
        const { error: coverError } = await supabase.storage
          .from('books-covers')
          .upload(coverFileName, coverFile);
          
        if (coverError) throw coverError;
      }

      setUploadStatus("🔒 Securing and Uploading PDF...");
      const pdfFileName = `${Date.now()}-book-${Math.random().toString(36).substring(2)}.pdf`;
      const { error: storageError } = await supabase.storage
        .from('books-pdfs')
        .upload(pdfFileName, file);

      if (storageError) throw storageError;

      setUploadStatus("✅ Files Uploaded! Saving details...");

      const finalPrice = basePrice - (basePrice * discount / 100);
      const bookData = {
        title,
        description,
        author,
        pages: pages ? Number(pages) : null,
        language,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        base_price: basePrice,
        discount: discount,
        final_price: finalPrice,
        pdf_path: pdfFileName,
        cover_path: coverFileName,
        created_at: new Date().toISOString(),
        format: "pdf"
      };

      const { error: dbError } = editingBookId 
        ? await supabase.from('books').update(bookData).eq('id', editingBookId)
        : await supabase.from('books').insert([bookData]);

      if (dbError) throw dbError;

      setUploadStatus("🎉 Book published successfully!");
      addNotification("Book added successfully! 📚", "success");
      
      resetBookForm();
      loadAllData();
    } catch (error) {
      setUploadStatus("❌ Upload failed: " + error.message);
      addNotification("Upload failed: " + error.message, "error");
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(""), 4000);
    }
  };

  const resetBookForm = () => {
    setTitle("");
    setDescription("");
    setAuthor("VEDOXA");
    setPages("");
    setLanguage("English");
    setTags("");
    setBasePrice(0);
    setDiscount(0);
    setFile(null);
    setCoverFile(null);
    setEditingBookId(null);
    setShowAddBookModal(false);
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm("Are you sure? This cannot be undone.")) {
      try {
        const { error } = await supabase.from('books').delete().eq('id', id);
        if (error) throw error;
        setBooks(books.filter(b => b.id !== id));
        addNotification("Book deleted successfully! 🗑️", "success");
      } catch (error) {
        addNotification("Delete failed: " + error.message, "error");
      }
    }
  };

  const handleAddDiscount = async () => {
    if (!discountName || discountPercentage <= 0 || !discountStartDate || !discountEndDate) {
      addNotification("All fields are required!", "error");
      return;
    }

    try {
      const { error } = await supabase.from('discounts').insert([{
        name: discountName,
        percentage: discountPercentage,
        startDate: discountStartDate,
        endDate: discountEndDate,
        appliedBooks: selectedBooks,
        created_at: new Date().toISOString()
      }]);

      if (error) throw error;

      setDiscountName("");
      setDiscountPercentage(0);
      setDiscountStartDate("");
      setDiscountEndDate("");
      setSelectedBooks([]);
      setShowAddDiscountModal(false);
      addNotification("Discount created successfully! 💰", "success");
      loadAllData();
    } catch (error) {
      addNotification("Error: " + error.message, "error");
    }
  };

  const handleAddCoupon = async () => {
    if (!couponCode || couponDiscount <= 0 || couponLimit <= 0 || !couponExpiry) {
      addNotification("All fields are required!", "error");
      return;
    }

    try {
      const { error } = await supabase.from('coupons').insert([{
        code: couponCode.toUpperCase(),
        discount: couponDiscount,
        limit_count: couponLimit,
        used: 0,
        expiry: couponExpiry,
        created_at: new Date().toISOString()
      }]);

      if (error) throw error;

      setCouponCode("");
      setCouponDiscount(0);
      setCouponLimit(1);
      setCouponExpiry("");
      setShowAddCouponModal(false);
      addNotification("Coupon created successfully! 🎟️", "success");
      loadAllData();
    } catch (error) {
      addNotification("Error: " + error.message, "error");
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm("Delete this coupon?")) {
      try {
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) throw error;
        setCoupons(coupons.filter(c => c.id !== id));
        addNotification("Coupon deleted! 🗑️", "success");
      } catch (error) {
        addNotification("Delete failed: " + error.message, "error");
      }
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!newPassword || !confirmPassword) {
      setPasswordError("All fields are required!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match!");
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters!");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      setPasswordSuccess("✅ Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      addNotification("Password updated! 🔐", "success");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (error) {
      setPasswordError("❌ Error: " + error.message);
    }
  };

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        setEmail("");
        setPassword("");
        addNotification("Logged out successfully! 👋", "success");
      } catch (error) {
        console.log("Logout error:", error);
      }
    }
  };

  const filteredBooks = books.filter(b =>
    b.title?.toLowerCase().includes(bookSearch.toLowerCase()) ||
    b.author?.toLowerCase().includes(bookSearch.toLowerCase())
  );

  const filteredDiscounts = discounts.filter(d =>
    d.name?.toLowerCase().includes(discountSearch.toLowerCase())
  );

  const filteredCoupons = coupons.filter(c =>
    c.code?.toLowerCase().includes(couponSearch.toLowerCase())
  );

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchCustomer.toLowerCase())
  );

  const totalRevenue = orders.reduce((sum, order) => sum + (order.final_price || 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 flex items-center justify-center p-4 font-sans overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500 to-rose-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-40 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative max-w-md w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/30 to-pink-600/30 rounded-3xl blur-2xl opacity-100"></div>
          
          <div className="relative bg-slate-900/70 backdrop-blur-3xl border border-white/20 p-10 rounded-3xl shadow-[0_0_50px_rgba(139,92,246,0.3)]">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 rounded-2xl blur-lg opacity-80 group-hover:opacity-100 transition animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl shadow-xl border border-white/10">
                  <ShieldCheck size={40} className="text-white drop-shadow-md" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 mb-2">VEDOXA</h1>
            <p className="text-center text-blue-200 text-sm font-semibold mb-8">Premium Books Management System</p>
            
            <form onSubmit={handleAdminLogin} className="space-y-5">
              {loginError && (
                <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 text-red-200 text-sm font-bold flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]">
                  <AlertCircle size={18} /> {loginError}
                </div>
              )}
              
              <div className="group">
                <label className="block text-xs font-bold text-indigo-300 mb-3 uppercase tracking-widest">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/40 to-purple-500/40 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300"></div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative w-full bg-slate-900/60 border border-indigo-500/30 hover:border-indigo-400/70 focus:border-blue-400 rounded-xl px-5 py-4 text-white placeholder-slate-400 outline-none transition duration-300 shadow-inner"
                    placeholder="admin@vedoxa.com"
                  />
                  <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-400 pointer-events-none" size={18} />
                </div>
              </div>
              
              <div className="group">
                <label className="block text-xs font-bold text-indigo-300 mb-3 uppercase tracking-widest">Secret Passkey</label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/40 to-pink-500/40 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300"></div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative w-full bg-slate-900/60 border border-indigo-500/30 hover:border-indigo-400/70 focus:border-purple-400 rounded-xl px-5 py-4 text-white placeholder-slate-400 outline-none transition duration-300 pr-12 shadow-inner"
                    placeholder="••••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-indigo-400 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoggingIn}
                className="relative w-full mt-8 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl blur-md group-hover:blur-xl opacity-80 group-hover:opacity-100 transition duration-300 group-disabled:opacity-50"></div>
                <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 border border-white/20 disabled:opacity-50 text-white font-black py-4 rounded-xl transition transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg">
                  {isLoggingIn ? (
                    <>
                      <Loader size={20} className="animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      <Lock size={20} /> Unlock System
                    </>
                  )}
                </div>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950/40 to-slate-950 text-slate-200 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-pulse"></div>
        <div className="absolute top-40 right-1/4 w-[30rem] h-[30rem] bg-purple-600/20 rounded-full mix-blend-screen filter blur-[120px] animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-600/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse animation-delay-4000"></div>
      </div>

      <header className="relative border-b border-indigo-500/20 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-40 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800 rounded-lg transition text-indigo-300">
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2.5 rounded-lg shadow-lg border border-white/10">
                <ShieldCheck size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">VEDOXA</h1>
                <p className="text-xs text-indigo-300 font-medium">Admin Control Center</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-rose-600/20 hover:from-red-500/40 hover:to-rose-600/40 text-red-300 px-5 py-2.5 rounded-lg font-bold text-sm transition border border-red-500/30 hover:border-red-400/60 shadow-lg"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="relative border-b border-indigo-500/20 bg-slate-900/40 backdrop-blur-md sticky top-[73px] z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {[
              { id: "dashboard", label: "Dashboard & Analytics", icon: "📊" },
              { id: "books", label: "Books", icon: "📚" },
              { id: "discounts", label: "Discounts", icon: "💰" },
              { id: "coupons", label: "Coupons", icon: "🎟️" },
              { id: "customers", label: "Customers", icon: "👥" },
              { id: "settings", label: "Settings", icon: "⚙️" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-5 font-bold text-sm whitespace-nowrap border-b-2 transition duration-300 ${
                  activeTab === tab.id
                    ? "border-blue-400 text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 drop-shadow-md"
                    : "border-transparent text-slate-400 hover:text-indigo-200 hover:bg-white/5"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-10 z-10">
        <div className="fixed bottom-6 right-6 space-y-3 z-50">
          {notifications.map(notif => (
            <div key={notif.id} className={`px-5 py-3 rounded-xl font-bold text-sm flex items-center gap-3 backdrop-blur-xl border shadow-2xl ${
              notif.type === 'success' ? 'bg-green-900/60 text-green-200 border-green-500/50 shadow-green-500/20' :
              notif.type === 'error' ? 'bg-red-900/60 text-red-200 border-red-500/50 shadow-red-500/20' :
              'bg-blue-900/60 text-blue-200 border-blue-500/50 shadow-blue-500/20'
            } animate-in fade-in slide-in-from-right-4 duration-300`}>
              {notif.type === 'success' && <Check size={20} className="text-green-400" />}
              {notif.type === 'error' && <AlertCircle size={20} className="text-red-400" />}
              {notif.message}
            </div>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-indigo-500/30 hover:border-blue-400/70 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-indigo-300 text-sm font-bold tracking-wider">TOTAL BOOKS</span>
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg border border-white/20">
                    <BookOpen className="text-white" size={22} />
                  </div>
                </div>
                <p className="text-4xl font-black text-white mb-2">{books.length}</p>
              </div>

              <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-indigo-500/30 hover:border-green-400/70 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(34,197,94,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-indigo-300 text-sm font-bold tracking-wider">TOTAL ORDERS</span>
                  <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl shadow-lg border border-white/20">
                    <CreditCard className="text-white" size={22} />
                  </div>
                </div>
                <p className="text-4xl font-black text-white mb-2">{totalOrders}</p>
              </div>

              <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-indigo-500/30 hover:border-purple-400/70 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(168,85,247,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-indigo-300 text-sm font-bold tracking-wider">TOTAL REVENUE</span>
                  <div className="bg-gradient-to-br from-purple-500 to-fuchsia-600 p-3 rounded-xl shadow-lg border border-white/20">
                    <DollarSign className="text-white" size={22} />
                  </div>
                </div>
                <p className="text-4xl font-black text-white mb-2">₹{(totalRevenue).toFixed(0)}</p>
              </div>

              <div className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-indigo-500/30 hover:border-pink-400/70 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(236,72,153,0.2)]">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-indigo-300 text-sm font-bold tracking-wider">CUSTOMERS</span>
                  <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-3 rounded-xl shadow-lg border border-white/20">
                    <Users className="text-white" size={22} />
                  </div>
                </div>
                <p className="text-4xl font-black text-white mb-2">{totalCustomers}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/40 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h3 className="text-2xl font-black text-white flex items-center gap-3">
                  <PieChart className="text-blue-400" size={28} /> Google Analytics 4 Dashboard
                </h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
                <div className="lg:col-span-3 bg-slate-900/80 rounded-2xl border border-indigo-500/30 overflow-hidden min-h-[400px] flex flex-col">
                  <div className="p-3 bg-slate-800/80 border-b border-indigo-500/30 flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                  </div>
                  <div className="flex-1 w-full bg-slate-900">
                    {/* 👇 REPLACE 'YOUR_LOOKER_STUDIO_EMBED_URL' WITH YOUR ACTUAL GA4 LINK 👇 */}
                    <iframe 
                        width="100%" 
                        height="100%" 
                        src={lookerStudioUrl} 
                        frameBorder="0" 
                        style={{ border: 0, minHeight: '500px' }} 
                        allowFullScreen 
                        sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox">
                    </iframe> 
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-indigo-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Activity className="text-cyan-400" /> Recent Sales Activity
              </h3>
              <div className="overflow-x-auto rounded-xl border border-indigo-500/20">
                <table className="w-full">
                  <thead className="bg-slate-800/80 border-b border-indigo-500/30">
                    <tr>
                      <th className="text-left py-4 px-6 text-xs font-black text-indigo-300 uppercase tracking-wider">Customer</th>
                      <th className="text-left py-4 px-6 text-xs font-black text-indigo-300 uppercase tracking-wider">Book</th>
                      <th className="text-left py-4 px-6 text-xs font-black text-indigo-300 uppercase tracking-wider">Amount</th>
                      <th className="text-left py-4 px-6 text-xs font-black text-indigo-300 uppercase tracking-wider">Date</th>
                      <th className="text-left py-4 px-6 text-xs font-black text-indigo-300 uppercase tracking-wider">Coupon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-indigo-500/10">
                    {orders.slice(0, 8).map(order => (
                      <tr key={order.id} className="hover:bg-indigo-500/10 transition duration-200">
                        <td className="py-4 px-6 text-white font-bold text-sm flex items-center gap-3">
                           {order.customer_name || "Guest"}
                        </td>
                        <td className="py-4 px-6 text-slate-300 text-sm">{order.book_title || "—"}</td>
                        <td className="py-4 px-6 text-green-400 font-bold text-sm">₹{order.final_price || 0}</td>
                        <td className="py-4 px-6 text-slate-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-4 px-6">
                          {order.coupon_used ? (
                            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-md text-xs font-bold border border-purple-500/30">{order.coupon_used}</span>
                          ) : (
                            <span className="text-slate-600">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "books" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-indigo-500/20 backdrop-blur-md">
              <div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300 flex items-center gap-2">
                  <Sparkles className="text-purple-400" /> Book Inventory
                </h2>
                <p className="text-indigo-300 text-sm mt-1">Manage your digital products and covers.</p>
              </div>
              <button
                onClick={() => {
                  resetBookForm();
                  setShowAddBookModal(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black px-6 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.4)] transform hover:scale-105 group"
              >
                <Plus size={20} className="group-hover:rotate-90 transition duration-300" /> Add New Book
              </button>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none"></div>
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-indigo-400" size={20} />
              <input
                type="text"
                placeholder="Search books by title or author..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="relative w-full bg-slate-900/60 border border-indigo-500/30 hover:border-indigo-400/60 focus:border-blue-400 rounded-xl px-5 pl-14 py-4 text-white placeholder-slate-400 outline-none transition duration-300 shadow-inner"
              />
            </div>

            {showAddBookModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 border border-indigo-500/50 rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                  <div className="flex justify-between items-center mb-6 border-b border-indigo-500/20 pb-4">
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-purple-300">Publish New Book</h3>
                    <button onClick={() => setShowAddBookModal(false)} className="p-2 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-white">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wide">Title *</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full bg-slate-800/80 border border-indigo-500/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition shadow-inner" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wide">Author</label>
                        <input value={author} onChange={(e) => setAuthor(e.target.value)} type="text" className="w-full bg-slate-800/80 border border-indigo-500/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition shadow-inner" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wide">Description</label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-800/80 border border-indigo-500/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition shadow-inner h-24 resize-none" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 bg-slate-800/40 p-5 rounded-2xl border border-indigo-500/10">
                      <div>
                        <label className="block text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wide">Pages</label>
                        <input value={pages} onChange={(e) => setPages(e.target.value)} type="number" className="w-full bg-slate-900/80 border border-indigo-500/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wide">Language</label>
                        <input value={language} onChange={(e) => setLanguage(e.target.value)} type="text" className="w-full bg-slate-900/80 border border-indigo-500/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wide">Price (₹) *</label>
                        <input value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} type="number" className="w-full bg-slate-900/80 border border-indigo-500/30 focus:border-green-400 rounded-xl px-4 py-3 text-white outline-none transition text-green-300 font-bold" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wide">Discount %</label>
                        <input value={discount} onChange={(e) => setDiscount(Number(e.target.value))} type="number" className="w-full bg-slate-900/80 border border-indigo-500/30 focus:border-pink-400 rounded-xl px-4 py-3 text-white outline-none transition text-pink-300 font-bold" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-indigo-300 mb-2 uppercase tracking-wide">Tags (comma separated)</label>
                      <input value={tags} onChange={(e) => setTags(e.target.value)} type="text" placeholder="Psychology, Focus, Growth" className="w-full bg-slate-800/80 border border-indigo-500/30 focus:border-blue-400 rounded-xl px-4 py-3 text-white outline-none transition shadow-inner" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-800/40 p-5 rounded-2xl border border-indigo-500/20">
                      <div className="border-r border-indigo-500/20 pr-0 md:pr-4">
                        <label className="block text-xs font-black text-pink-400 mb-3 uppercase flex items-center gap-2">
                          <BookOpen size={16} /> 1. Upload Cover Image
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                            className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-pink-500/20 file:text-pink-300 file:font-bold hover:file:bg-pink-500/30 cursor-pointer transition"
                          />
                        </div>
                      </div>

                      <div className="pl-0 md:pl-4 mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-indigo-500/20">
                        <label className="block text-xs font-black text-blue-400 mb-3 uppercase flex items-center gap-2">
                          <Upload size={16} /> 2. Upload Book PDF *
                        </label>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-600/20 file:text-blue-300 file:font-bold hover:file:bg-blue-600/30 cursor-pointer transition"
                        />
                      </div>
                    </div>

                    {uploadStatus && (
                      <div className={`p-4 rounded-xl text-sm font-bold border flex items-center gap-2 animate-pulse ${
                        uploadStatus.includes("🎉") || uploadStatus.includes("✅") ? "bg-green-900/60 text-green-300 border-green-500/50" :
                        uploadStatus.includes("❌") ? "bg-red-900/60 text-red-300 border-red-500/50" :
                        "bg-blue-900/60 text-blue-300 border-blue-500/50"
                      }`}>
                        {uploadStatus.includes("❌") ? <AlertCircle size={18}/> : <Sparkles size={18}/>}
                        {uploadStatus}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-indigo-500/20 mt-4">
                      <button
                        onClick={handlePublishBook}
                        disabled={isUploading}
                        className="flex-[2] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white font-black py-4 rounded-xl transition duration-300 flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg transform hover:scale-[1.02] active:scale-95"
                      >
                        {isUploading ? <Loader size={20} className="animate-spin" /> : <Upload size={20} />}
                        {isUploading ? "Processing..." : "Publish Book"}
                      </button>
                      <button
                        onClick={() => setShowAddBookModal(false)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-xl transition duration-300 uppercase tracking-widest border border-slate-600 hover:border-slate-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBooks.map(book => (
                <div key={book.id} className="group bg-slate-900/60 border border-indigo-500/20 hover:border-blue-400/60 rounded-2xl p-6 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_10px_40px_rgba(99,102,241,0.2)] transform hover:-translate-y-2 flex flex-col h-full relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all duration-500 pointer-events-none"></div>
                  
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex-1 flex gap-4">
                      <div className="w-16 h-20 bg-slate-800 rounded-lg flex-shrink-0 flex items-center justify-center border border-indigo-500/30 overflow-hidden shadow-md">
                        {book.cover_path ? (
                          <div className="w-full h-full bg-cover bg-center" style={{backgroundImage: `url(${supabaseUrl}/storage/v1/object/public/books-covers/${book.cover_path})`}}></div>
                        ) : (
                          <BookOpen size={24} className="text-indigo-400/50" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-black text-white text-lg line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-300 group-hover:to-purple-300 transition">{book.title}</h3>
                        <p className="text-xs text-indigo-300 mt-1 font-medium">by {book.author}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  <p className="text-sm text-slate-400 mb-6 flex-1 line-clamp-3 relative z-10">{book.description || "No description provided."}</p>
                  
                  <div className="space-y-3 relative z-10">
                    <div className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-indigo-500/10">
                       <span className="text-xs font-bold text-slate-400">PAGES</span>
                       <span className="text-sm font-bold text-white">{book.pages || "—"}</span>
                    </div>
                    
                    <div className="flex justify-between items-center bg-gradient-to-r from-slate-800/50 to-indigo-900/30 p-3 rounded-xl border border-indigo-500/20">
                      <span className="text-xs font-bold text-slate-400">PRICE</span>
                      <p className="flex items-center gap-2">
                        {book.discount > 0 && <span className="text-xs line-through text-slate-500">₹{book.base_price}</span>}
                        <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300">₹{book.final_price || book.base_price}</span>
                        {book.discount > 0 && <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded-md font-bold">{book.discount}% OFF</span>}
                      </p>
                    </div>
                  </div>

                  {book.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4 relative z-10 pt-4 border-t border-indigo-500/20">
                      {book.tags.map((tag, i) => (
                        <span key={i} className="text-[10px] uppercase font-bold tracking-wider bg-indigo-500/20 text-indigo-200 px-3 py-1.5 rounded-full border border-indigo-500/30">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "discounts" && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-green-500/20 backdrop-blur-md">
              <div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 flex items-center gap-2">
                  <Percent className="text-green-400" /> Deals & Discounts
                </h2>
              </div>
              <button
                onClick={() => setShowAddDiscountModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(34,197,94,0.3)] transform hover:scale-105 flex items-center gap-2"
              >
                <Plus size={20} /> Create Discount
              </button>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none"></div>
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-green-400" size={20} />
              <input
                type="text"
                placeholder="Search discounts..."
                value={discountSearch}
                onChange={(e) => setDiscountSearch(e.target.value)}
                className="relative w-full bg-slate-900/60 border border-green-500/30 hover:border-green-400/60 focus:border-green-400 rounded-xl px-5 pl-14 py-4 text-white placeholder-slate-400 outline-none transition duration-300 shadow-inner"
              />
            </div>

            {showAddDiscountModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 border border-green-500/50 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                  <div className="flex justify-between items-center mb-6 border-b border-green-500/20 pb-4">
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">New Discount</h3>
                    <button onClick={() => setShowAddDiscountModal(false)} className="p-2 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-white">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-green-300 mb-2 uppercase">Discount Name *</label>
                      <input value={discountName} onChange={(e) => setDiscountName(e.target.value)} type="text" placeholder="Summer Sale" className="w-full bg-slate-800/80 border border-green-500/30 focus:border-green-400 rounded-xl px-4 py-3 text-white outline-none transition shadow-inner" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-green-300 mb-2 uppercase">Percentage % *</label>
                      <input value={discountPercentage} onChange={(e) => setDiscountPercentage(Number(e.target.value))} type="number" className="w-full bg-slate-800/80 border border-green-500/30 focus:border-green-400 rounded-xl px-4 py-3 text-white outline-none transition shadow-inner" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-green-300 mb-2 uppercase">Start Date *</label>
                        <input value={discountStartDate} onChange={(e) => setDiscountStartDate(e.target.value)} type="date" className="w-full bg-slate-800/80 border border-green-500/30 focus:border-green-400 rounded-xl px-4 py-3 text-white outline-none transition shadow-inner" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-green-300 mb-2 uppercase">End Date *</label>
                        <input value={discountEndDate} onChange={(e) => setDiscountEndDate(e.target.value)} type="date" className="w-full bg-slate-800/80 border border-green-500/30 focus:border-green-400 rounded-xl px-4 py-3 text-white outline-none transition shadow-inner" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-green-300 mb-3 uppercase">Select Books</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto bg-slate-800/40 p-3 rounded-xl border border-green-500/20">
                        {books.map(book => (
                          <label key={book.id} className="flex items-center gap-3 p-3 hover:bg-slate-800/80 rounded-lg cursor-pointer transition">
                            <input
                              type="checkbox"
                              checked={selectedBooks.includes(book.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedBooks([...selectedBooks, book.id]);
                                } else {
                                  setSelectedBooks(selectedBooks.filter(id => id !== book.id));
                                }
                              }}
                              className="w-4 h-4 rounded accent-green-500"
                            />
                            <span className="text-sm text-slate-300">{book.title}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-green-500/20">
                      <button
                        onClick={handleAddDiscount}
                        className="flex-[2] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest shadow-lg transform hover:scale-[1.02]"
                      >
                        Create Discount
                      </button>
                      <button
                        onClick={() => setShowAddDiscountModal(false)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-xl transition border border-slate-600 uppercase"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDiscounts.map(discount => {
                const isActive = new Date() >= new Date(discount.startDate) && new Date() <= new Date(discount.endDate);
                return (
                  <div key={discount.id} className={`border rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group transition-all duration-300 hover:shadow-lg ${
                    isActive
                      ? "bg-gradient-to-br from-green-900/40 to-emerald-900/20 border-green-500/40 hover:border-green-400/70 shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                      : "bg-gradient-to-br from-slate-900/60 to-slate-800/40 border-slate-700/50 hover:border-slate-500/50"
                  }`}>
                    <div className="absolute top-4 right-4">
                      {isActive ? (
                        <span className="bg-green-500/20 text-green-300 text-xs font-black px-3 py-1.5 rounded-md border border-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.2)]">✅ ACTIVE</span>
                      ) : (
                        <span className="bg-slate-700/50 text-slate-300 text-xs font-black px-3 py-1.5 rounded-md border border-slate-600/50">⏰ UPCOMING</span>
                      )}
                    </div>

                    <div className="mb-4">
                      <h3 className="font-black text-white text-xl">{discount.name}</h3>
                    </div>

                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <p className="text-xs text-slate-400 mb-1 font-bold">DISCOUNT</p>
                        <p className={`text-4xl font-black ${isActive ? "text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300" : "text-slate-300"}`}>{discount.percentage}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400 mb-1 font-bold">BOOKS APPLIED</p>
                        <p className="text-2xl font-black text-white">{discount.appliedBooks?.length || 0}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 text-xs text-slate-400 border-t border-slate-700/50 pt-4">
                      <p className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-700/30">
                        <Calendar size={14} className={isActive ? "text-green-400" : ""} /> {new Date(discount.startDate).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-1.5 bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-700/30">
                        <Calendar size={14} className={isActive ? "text-red-400" : ""} /> {new Date(discount.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "coupons" && (
           <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-2xl border border-pink-500/20 backdrop-blur-md">
             <div>
               <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-300 flex items-center gap-2">
                 <Tag className="text-pink-400" /> Promo Codes
               </h2>
             </div>
             <button
               onClick={() => setShowAddCouponModal(true)}
               className="bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-black px-6 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] transform hover:scale-105 flex items-center gap-2"
             >
               <Plus size={20} /> Generate Code
             </button>
           </div>

           <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none"></div>
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-pink-400" size={20} />
              <input
                type="text"
                placeholder="Search coupons..."
                value={couponSearch}
                onChange={(e) => setCouponSearch(e.target.value)}
                className="relative w-full bg-slate-900/60 border border-pink-500/30 hover:border-pink-400/60 focus:border-pink-400 rounded-xl px-5 pl-14 py-4 text-white placeholder-slate-400 outline-none transition duration-300 shadow-inner"
              />
            </div>

            {showAddCouponModal && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 border border-pink-500/50 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(236,72,153,0.2)]">
                  <div className="flex justify-between items-center mb-6 border-b border-pink-500/20 pb-4">
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-rose-400">New Coupon</h3>
                    <button onClick={() => setShowAddCouponModal(false)} className="p-2 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-white">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-pink-300 mb-2 uppercase">Coupon Code *</label>
                      <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} type="text" placeholder="SAVE20" className="w-full bg-slate-800/80 border border-pink-500/30 focus:border-pink-400 rounded-xl px-4 py-3 text-white outline-none transition shadow-inner font-black tracking-widest text-lg" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-pink-300 mb-2 uppercase">Discount %*</label>
                        <input value={couponDiscount} onChange={(e) => setCouponDiscount(Number(e.target.value))} type="number" className="w-full bg-slate-800/80 border border-pink-500/30 focus:border-pink-400 rounded-xl px-4 py-3 text-white outline-none transition shadow-inner" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-pink-300 mb-2 uppercase">Usage Limit *</label>
                        <input value={couponLimit} onChange={(e) => setCouponLimit(Number(e.target.value))} type="number" className="w-full bg-slate-800/80 border border-pink-500/30 focus:border-pink-400 rounded-xl px-4 py-3 text-white outline-none transition shadow-inner" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-pink-300 mb-2 uppercase">Expiry Date *</label>
                      <input value={couponExpiry} onChange={(e) => setCouponExpiry(e.target.value)} type="date" className="w-full bg-slate-800/80 border border-pink-500/30 focus:border-pink-400 rounded-xl px-4 py-3 text-white outline-none transition shadow-inner" />
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-pink-500/20">
                      <button
                        onClick={handleAddCoupon}
                        className="flex-[2] bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-black py-4 rounded-xl transition-all uppercase tracking-widest shadow-lg transform hover:scale-[1.02]"
                      >
                        Create Coupon
                      </button>
                      <button
                        onClick={() => setShowAddCouponModal(false)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-xl transition border border-slate-600 uppercase"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoupons.map(coupon => {
                const isExpired = new Date(coupon.expiry) < new Date();
                const isExhausted = coupon.used >= coupon.limit_count;
                const usagePercent = (coupon.used / coupon.limit_count) * 100;

                return (
                  <div key={coupon.id} className={`border rounded-2xl p-6 backdrop-blur-xl relative overflow-hidden group transition-all duration-300 ${
                    isExpired || isExhausted
                      ? "bg-slate-900/40 border-slate-700/30 opacity-60 grayscale hover:grayscale-0"
                      : "bg-gradient-to-br from-pink-900/40 to-rose-900/20 border-pink-500/40 hover:border-pink-400/70 shadow-[0_0_15px_rgba(236,72,153,0.1)] hover:shadow-[0_0_25px_rgba(236,72,153,0.2)]"
                  }`}>
                    {isExpired && <div className="absolute top-3 right-3 bg-red-500/20 text-red-300 text-[10px] font-black px-2 py-1 rounded border border-red-500/30">EXPIRED</div>}
                    {isExhausted && <div className="absolute top-3 right-3 bg-yellow-500/20 text-yellow-300 text-[10px] font-black px-2 py-1 rounded border border-yellow-500/30">EXHAUSTED</div>}

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-black text-white text-3xl tracking-widest">{coupon.code}</h3>
                        <p className="text-sm text-pink-300 mt-1 font-bold">{coupon.discount}% Discount</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="space-y-4 mb-2">
                      <div className="bg-slate-900/50 p-3 rounded-xl border border-pink-500/10">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-400 font-bold">Usage</span>
                          <span className="text-white font-black">{coupon.used} / {coupon.limit_count}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2.5 shadow-inner overflow-hidden border border-slate-700/50">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500 relative"
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          >
                             <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse"></div>
                          </div>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 flex items-center gap-2 bg-slate-800/50 px-3 py-2 rounded-md border border-slate-700/30 w-fit">
                        <Calendar size={14} className={isExpired ? "text-red-400" : "text-pink-400"} /> Expires: {new Date(coupon.expiry).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
         </div>
        )}

        {activeTab === "customers" && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="bg-slate-900/50 p-6 rounded-2xl border border-amber-500/20 backdrop-blur-md">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 flex items-center gap-2">
                <Users className="text-amber-400" /> Customer Database
              </h2>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none"></div>
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-amber-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                className="relative w-full bg-slate-900/60 border border-amber-500/30 hover:border-amber-400/60 focus:border-amber-400 rounded-xl px-5 pl-14 py-4 text-white placeholder-slate-400 outline-none transition duration-300 shadow-inner"
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {filteredCustomers.map(customer => {
                const customerOrders = orders.filter(o => o.customer_id === customer.id);
                const totalSpent = customerOrders.reduce((sum, o) => sum + (o.final_price || 0), 0);

                return (
                  <div key={customer.id} className="bg-gradient-to-r from-slate-900/80 to-slate-800/60 border border-amber-500/20 hover:border-amber-400/50 rounded-3xl p-8 backdrop-blur-xl transition-all duration-300 hover:shadow-[0_10px_30px_rgba(245,158,11,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-center relative z-10">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg border border-white/20 transform rotate-3">
                          {customer.name?.[0] || "?"}
                        </div>
                        <div>
                          <h3 className="font-black text-white text-xl">{customer.name || "Anonymous"}</h3>
                          <p className="text-sm text-slate-400 flex items-center gap-1.5 mt-1">
                            <Mail size={14} className="text-amber-400/70" /> {customer.email || "No email"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2 bg-slate-900/50 p-4 rounded-2xl border border-slate-700/30">
                        <p className="text-[10px] text-amber-300 font-bold uppercase tracking-widest">Contact Info</p>
                        <p className="text-sm text-white flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" /> {customer.phone || "—"}
                        </p>
                        <p className="text-sm text-white flex items-center gap-2">
                          <MapPin size={14} className="text-slate-400" /> {customer.city || "—"}
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/20 rounded-2xl p-5 border border-green-500/30 shadow-inner">
                        <p className="text-[10px] text-green-300 font-bold uppercase tracking-widest mb-2">Total Value</p>
                        <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">₹{totalSpent.toFixed(0)}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 rounded-2xl p-4 border border-blue-500/20">
                          <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">Orders</p>
                          <p className="text-2xl font-black text-white mt-1">{customerOrders.length}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-2xl p-4 border border-purple-500/20">
                          <p className="text-[10px] text-purple-300 font-bold uppercase tracking-widest">Joined</p>
                          <p className="text-sm font-bold text-white mt-2">{new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>

                    {customerOrders.length > 0 && (
                      <div className="mt-8 pt-6 border-t border-amber-500/10 relative z-10">
                        <p className="text-xs font-bold text-amber-400/80 mb-4 uppercase tracking-widest flex items-center gap-2">
                           <BookOpen size={14} /> Purchase History
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {customerOrders.slice(0, 4).map((order, i) => (
                            <div key={i} className="bg-slate-900/80 border border-slate-700/50 hover:border-amber-500/40 rounded-xl px-4 py-2.5 text-sm transition-colors duration-300 flex items-center gap-3">
                              <span className="text-white font-bold">{order.book_title}</span>
                              <span className="text-green-400 bg-green-500/10 px-2 py-0.5 rounded text-xs font-black">₹{order.final_price}</span>
                            </div>
                          ))}
                          {customerOrders.length > 4 && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-amber-300 font-bold flex items-center">
                              +{customerOrders.length - 4} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
             <div className="bg-slate-900/50 p-6 rounded-2xl border border-red-500/20 backdrop-blur-md">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 flex items-center gap-2">
                <Settings className="text-red-400" /> Settings & Security
              </h2>
            </div>

            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/60 border border-red-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
              
              <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3 relative z-10">
                <Lock className="text-orange-400" /> Change Password
              </h3>

              <div className="space-y-6 relative z-10">
                <div>
                  <label className="block text-xs font-bold text-orange-300 mb-2 uppercase tracking-wide">Current Password</label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300 pointer-events-none"></div>
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="relative w-full bg-slate-900/80 border border-red-500/30 focus:border-orange-400 rounded-xl px-5 py-4 text-white outline-none transition duration-300 pr-12 shadow-inner"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition"
                    >
                      {showCurrentPass ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-orange-300 mb-2 uppercase tracking-wide">New Password</label>
                    <div className="relative group">
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-900/80 border border-red-500/30 focus:border-orange-400 rounded-xl px-5 py-4 text-white outline-none transition duration-300 pr-12 shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition"
                      >
                        {showNewPass ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-orange-300 mb-2 uppercase tracking-wide">Confirm Password</label>
                    <div className="relative group">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-900/80 border border-red-500/30 focus:border-orange-400 rounded-xl px-5 py-4 text-white outline-none transition duration-300 pr-12 shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition"
                      >
                        {showConfirmPass ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-4 rounded-xl bg-red-900/60 border border-red-500/50 text-red-200 text-sm font-bold flex items-center gap-2 shadow-lg animate-pulse">
                    <AlertCircle size={18} /> {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-4 rounded-xl bg-green-900/60 border border-green-500/50 text-green-200 text-sm font-bold flex items-center gap-2 shadow-lg">
                    <Check size={18} /> {passwordSuccess}
                  </div>
                )}

                <button
                  onClick={handleChangePassword}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black py-4 rounded-xl transition duration-300 flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg transform hover:scale-[1.02] active:scale-95 mt-4"
                >
                  <Lock size={20} /> Update Password
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-blue-500/30 rounded-3xl p-8 backdrop-blur-xl">
              <h3 className="text-xl font-black text-blue-300 mb-6 flex items-center gap-3">
                <Zap size={24} className="text-yellow-400" /> Security Guidelines
              </h3>
              <ul className="space-y-4 text-sm text-slate-300">
                <li className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                  <Check size={20} className="text-green-400 flex-shrink-0" />
                  <span>Use strong passwords with at least 8 characters, mixing letters, numbers, and symbols</span>
                </li>
                <li className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                  <Check size={20} className="text-green-400 flex-shrink-0" />
                  <span>Change your password every 30 days for maximum security</span>
                </li>
                <li className="flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                  <Check size={20} className="text-green-400 flex-shrink-0" />
                  <span>Never share your login credentials with anyone</span>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
