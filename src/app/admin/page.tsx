// @ts-nocheck
/* eslint-disable */
"use client";
import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck, Upload, BookOpen, Lock, Percent, Users, Settings,
  LogOut, Eye, EyeOff, Trash2, Plus, X, Check, AlertCircle,
  BarChart3, TrendingUp, Zap, DollarSign, Tag, Mail, Phone, MapPin, CreditCard,
  Download, Filter, Search, Edit3, Copy, Loader, ChevronDown, Calendar, Star,
  TrendingDown, Activity, Bell, Menu, ChevronRight, Sparkles, ArrowUpRight, ArrowDownLeft
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy-url.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";
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
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
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
  const [showCustomerModal, setShowCustomerModal] = useState(false);

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
    setUploadStatus("🔒 Securing and Uploading PDF...");

    try {
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.pdf`;
      
      const { error: storageError } = await supabase.storage
        .from('books-pdfs')
        .upload(fileName, file);

      if (storageError) throw storageError;

      setUploadStatus("✅ PDF Uploaded! Saving details...");

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
        pdf_path: fileName,
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
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders) : 0;

  // LOGIN PAGE
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center p-4 font-sans overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gradient-to-r from-pink-500 to-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        {/* Login Card */}
        <div className="relative max-w-md w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-purple-600/20 to-pink-600/30 rounded-3xl blur-3xl opacity-75"></div>
          
          <div className="relative bg-slate-900/80 backdrop-blur-2xl border border-white/10 p-10 rounded-3xl shadow-2xl">
            {/* Header Animation */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 p-4 rounded-2xl">
                  <ShieldCheck size={40} className="text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 mb-2">VEDOXA</h1>
            <p className="text-center text-slate-300 text-sm font-semibold mb-8">Premium Books Management System</p>
            <p className="text-center text-xs text-slate-400 mb-8">Advanced Admin Dashboard</p>
            
            <form onSubmit={handleAdminLogin} className="space-y-5">
              {loginError && (
                <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-bold flex items-center gap-2 animate-pulse">
                  <AlertCircle size={18} /> {loginError}
                </div>
              )}
              
              {/* Email Input */}
              <div className="group">
                <label className="block text-xs font-bold text-slate-300 mb-3 uppercase tracking-widest">Admin Email</label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300"></div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="relative w-full bg-slate-800/50 border border-slate-600/50 hover:border-slate-500/70 focus:border-blue-500/70 rounded-xl px-5 py-4 text-white placeholder-slate-500 outline-none transition duration-300"
                    placeholder="admin@vedoxa.com"
                  />
                  <Mail className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
              
              {/* Password Input */}
              <div className="group">
                <label className="block text-xs font-bold text-slate-300 mb-3 uppercase tracking-widest">Secret Passkey</label>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-300"></div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="relative w-full bg-slate-800/50 border border-slate-600/50 hover:border-slate-500/70 focus:border-purple-500/70 rounded-xl px-5 py-4 text-white placeholder-slate-500 outline-none transition duration-300 pr-12"
                    placeholder="••••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200 transition"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoggingIn}
                className="relative w-full mt-8 group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-xl blur-lg group-hover:blur-xl opacity-75 group-hover:opacity-100 transition duration-300 group-disabled:opacity-50"></div>
                <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-black py-4 rounded-xl transition transform hover:scale-105 flex items-center justify-center gap-2 uppercase tracking-wider">
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

              {/* Footer Text */}
              <p className="text-center text-xs text-slate-500 mt-6">
                Enterprise-grade security • Encrypted connections • Real-time sync
              </p>
            </form>
          </div>
        </div>

        {/* Notifications */}
        <div className="fixed bottom-6 right-6 space-y-3 z-50">
          {notifications.map(notif => (
            <div key={notif.id} className={`px-4 py-3 rounded-lg font-bold text-sm flex items-center gap-2 animate-pulse ${
              notif.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
              notif.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
              'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              {notif.type === 'success' && <Check size={16} />}
              {notif.type === 'error' && <AlertCircle size={16} />}
              {notif.message}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ADMIN DASHBOARD
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-300 font-sans">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/3 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
        <div className="absolute bottom-20 left-1/4 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-5"></div>
      </div>

      {/* HEADER */}
      <header className="relative border-b border-slate-700/30 bg-slate-900/40 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-800/50 rounded-lg transition">
              <Menu size={24} className="text-slate-400" />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-lg">
                <ShieldCheck size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">VEDOXA</h1>
                <p className="text-xs text-slate-400">Admin Control Center</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative">
              <Bell className="text-slate-400 cursor-pointer hover:text-slate-200 transition" size={22} />
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 text-red-400 px-5 py-2.5 rounded-lg font-bold text-sm transition border border-red-500/30 hover:border-red-500/50"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* TABS NAVIGATION */}
      <div className="relative border-b border-slate-700/30 bg-slate-900/20 backdrop-blur-sm sticky top-[69px] z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: "dashboard", label: "Dashboard", icon: "📊" },
              { id: "books", label: "Books", icon: "📚" },
              { id: "discounts", label: "Discounts", icon: "💰" },
              { id: "coupons", label: "Coupons", icon: "🎟️" },
              { id: "customers", label: "Customers", icon: "👥" },
              { id: "settings", label: "Settings", icon: "⚙️" }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-5 font-bold text-sm whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-gradient-to-r border-blue-500 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative max-w-7xl mx-auto px-6 py-10">
        {/* NOTIFICATIONS */}
        <div className="fixed bottom-6 right-6 space-y-3 z-50">
          {notifications.map(notif => (
            <div key={notif.id} className={`px-5 py-3 rounded-lg font-bold text-sm flex items-center gap-2 backdrop-blur-xl border ${
              notif.type === 'success' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
              notif.type === 'error' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
              'bg-blue-500/20 text-blue-300 border-blue-500/30'
            } animate-in fade-in slide-in-from-right-4`}>
              {notif.type === 'success' && <Check size={18} />}
              {notif.type === 'error' && <AlertCircle size={18} />}
              {notif.message}
            </div>
          ))}
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="group bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 hover:border-blue-500/50 rounded-2xl p-6 backdrop-blur transition transform hover:scale-105 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400 text-sm font-bold">TOTAL BOOKS</span>
                  <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 p-3 rounded-lg">
                    <BookOpen className="text-blue-400" size={22} />
                  </div>
                </div>
                <p className="text-4xl font-black text-white mb-2">{books.length}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <ArrowUpRight size={14} className="text-green-400" /> Available Now
                </p>
              </div>

              <div className="group bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 hover:border-green-500/50 rounded-2xl p-6 backdrop-blur transition transform hover:scale-105 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400 text-sm font-bold">TOTAL ORDERS</span>
                  <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 p-3 rounded-lg">
                    <CreditCard className="text-green-400" size={22} />
                  </div>
                </div>
                <p className="text-4xl font-black text-white mb-2">{totalOrders}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <ArrowUpRight size={14} className="text-green-400" /> This Month
                </p>
              </div>

              <div className="group bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 hover:border-purple-500/50 rounded-2xl p-6 backdrop-blur transition transform hover:scale-105 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400 text-sm font-bold">TOTAL REVENUE</span>
                  <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 p-3 rounded-lg">
                    <DollarSign className="text-purple-400" size={22} />
                  </div>
                </div>
                <p className="text-4xl font-black text-white mb-2">₹{(totalRevenue/1000).toFixed(1)}K</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <ArrowUpRight size={14} className="text-green-400" /> +12.5% Growth
                </p>
              </div>

              <div className="group bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 hover:border-pink-500/50 rounded-2xl p-6 backdrop-blur transition transform hover:scale-105 hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-400 text-sm font-bold">CUSTOMERS</span>
                  <div className="bg-gradient-to-br from-pink-500/20 to-pink-600/20 p-3 rounded-lg">
                    <Users className="text-pink-400" size={22} />
                  </div>
                </div>
                <p className="text-4xl font-black text-white mb-2">{totalCustomers}</p>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <ArrowUpRight size={14} className="text-green-400" /> Active Users
                </p>
              </div>
            </div>

            {/* Charts & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 rounded-2xl p-8 backdrop-blur">
                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                  <TrendingUp className="text-green-400" /> Revenue Trend
                </h3>
                <div className="h-64 bg-slate-900/50 rounded-xl flex items-center justify-center border border-slate-700/30">
                  <p className="text-slate-500">📊 Analytics Chart - Integration Ready</p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur">
                <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                  <Star className="text-yellow-400" /> Quick Stats
                </h3>
                <div className="space-y-4">
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/30">
                    <p className="text-xs text-slate-400 mb-1">Avg Order Value</p>
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">₹{avgOrderValue.toFixed(0)}</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/30">
                    <p className="text-xs text-slate-400 mb-1">Active Discounts</p>
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">{discounts.length}</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700/30">
                    <p className="text-xs text-slate-400 mb-1">Active Coupons</p>
                    <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-400">{coupons.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 rounded-2xl p-8 backdrop-blur">
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Activity className="text-cyan-400" /> Recent Orders
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700/50">
                      <th className="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase">Customer</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase">Book</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase">Amount</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase">Date</th>
                      <th className="text-left py-4 px-4 text-xs font-bold text-slate-400 uppercase">Coupon</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 8).map(order => (
                      <tr key={order.id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition">
                        <td className="py-4 px-4 text-white font-bold text-sm">{order.customer_name || "Guest"}</td>
                        <td className="py-4 px-4 text-slate-300 text-sm">{order.book_title || "—"}</td>
                        <td className="py-4 px-4 text-green-400 font-bold text-sm">₹{order.final_price || 0}</td>
                        <td className="py-4 px-4 text-slate-400 text-xs">{new Date(order.created_at).toLocaleDateString()}</td>
                        <td className="py-4 px-4">
                          {order.coupon_used ? (
                            <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold border border-purple-500/30">{order.coupon_used}</span>
                          ) : (
                            <span className="text-slate-500">—</span>
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

        {/* BOOKS TAB */}
        {activeTab === "books" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-2">
                <Sparkles /> Books Management
              </h2>
              <button
                onClick={() => {
                  resetBookForm();
                  setShowAddBookModal(true);
                }}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-black px-6 py-3 rounded-lg transition flex items-center gap-2 group"
              >
                <Plus size={20} className="group-hover:rotate-90 transition" /> Add New Book
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search books by title or author..."
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/70 focus:border-blue-500/70 rounded-xl px-5 pl-12 py-4 text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* Add Book Modal */}
            {showAddBookModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Add New Book</h3>
                    <button onClick={() => setShowAddBookModal(false)} className="p-2 hover:bg-slate-800 rounded-lg transition">
                      <X size={24} className="text-slate-400" />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Title *</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/70 rounded-lg px-4 py-3 text-white outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Author</label>
                        <input value={author} onChange={(e) => setAuthor(e.target.value)} type="text" className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/70 rounded-lg px-4 py-3 text-white outline-none transition" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Description</label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/70 rounded-lg px-4 py-3 text-white outline-none transition h-24" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Pages</label>
                        <input value={pages} onChange={(e) => setPages(e.target.value)} type="number" className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/70 rounded-lg px-4 py-3 text-white outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Language</label>
                        <input value={language} onChange={(e) => setLanguage(e.target.value)} type="text" className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/70 rounded-lg px-4 py-3 text-white outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Price (₹) *</label>
                        <input value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} type="number" className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/70 rounded-lg px-4 py-3 text-white outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Discount %</label>
                        <input value={discount} onChange={(e) => setDiscount(Number(e.target.value))} type="number" className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/70 rounded-lg px-4 py-3 text-white outline-none transition" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Tags (comma separated)</label>
                      <input value={tags} onChange={(e) => setTags(e.target.value)} type="text" placeholder="Psychology, Focus, Growth" className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-blue-500/70 rounded-lg px-4 py-3 text-white outline-none transition" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Upload PDF *</label>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600/20 file:text-blue-400 file:font-bold cursor-pointer"
                      />
                    </div>

                    {uploadStatus && (
                      <div className={`p-4 rounded-lg text-sm font-bold border ${
                        uploadStatus.includes("🎉") ? "bg-green-500/20 text-green-400 border-green-500/30" :
                        uploadStatus.includes("❌") ? "bg-red-500/20 text-red-400 border-red-500/30" :
                        "bg-blue-500/20 text-blue-400 border-blue-500/30"
                      }`}>
                        {uploadStatus}
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handlePublishBook}
                        disabled={isUploading}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-black py-3 rounded-lg transition flex items-center justify-center gap-2 uppercase"
                      >
                        {isUploading ? <Loader size={18} className="animate-spin" /> : <Upload size={18} />}
                        {isUploading ? "Publishing..." : "Publish Book"}
                      </button>
                      <button
                        onClick={() => setShowAddBookModal(false)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black py-3 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Books Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBooks.map(book => (
                <div key={book.id} className="group bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-6 backdrop-blur transition hover:shadow-xl hover:shadow-blue-500/10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="font-black text-white line-clamp-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-purple-400 transition">{book.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">by {book.author}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteBook(book.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded transition"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 line-clamp-2">{book.description}</p>
                  <div className="space-y-2 text-sm text-slate-400 mb-4">
                    <p>📄 {book.pages} pages</p>
                    <p className="flex items-center gap-2">
                      <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">₹{book.final_price || book.base_price}</span>
                      {book.discount > 0 && <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded">{book.discount}% OFF</span>}
                    </p>
                  </div>
                  {book.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {book.tags.map((tag, i) => (
                        <span key={i} className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full border border-blue-500/30">
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

        {/* DISCOUNTS TAB */}
        {activeTab === "discounts" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400 flex items-center gap-2">
                <Sparkles /> Discount Management
              </h2>
              <button
                onClick={() => setShowAddDiscountModal(true)}
                className="bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-black px-6 py-3 rounded-lg transition flex items-center gap-2"
              >
                <Plus size={20} /> New Discount
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search discounts..."
                value={discountSearch}
                onChange={(e) => setDiscountSearch(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/70 focus:border-green-500/70 rounded-xl px-5 pl-12 py-4 text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* Add Discount Modal */}
            {showAddDiscountModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 max-w-md w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">New Discount</h3>
                    <button onClick={() => setShowAddDiscountModal(false)} className="p-2 hover:bg-slate-800 rounded-lg transition">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Discount Name *</label>
                      <input value={discountName} onChange={(e) => setDiscountName(e.target.value)} type="text" placeholder="Summer Sale" className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-green-500/70 rounded-lg px-4 py-3 text-white outline-none transition" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Percentage % *</label>
                      <input value={discountPercentage} onChange={(e) => setDiscountPercentage(Number(e.target.value))} type="number" className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-green-500/70 rounded-lg px-4 py-3 text-white outline-none transition" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Start Date *</label>
                        <input value={discountStartDate} onChange={(e) => setDiscountStartDate(e.target.value)} type="date" className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-green-500/70 rounded-lg px-4 py-3 text-white outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">End Date *</label>
                        <input value={discountEndDate} onChange={(e) => setDiscountEndDate(e.target.value)} type="date" className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-green-500/70 rounded-lg px-4 py-3 text-white outline-none transition" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-3 uppercase">Select Books</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {books.map(book => (
                          <label key={book.id} className="flex items-center gap-3 p-3 hover:bg-slate-800/50 rounded-lg cursor-pointer transition">
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

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleAddDiscount}
                        className="flex-1 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-700 hover:to-cyan-700 text-white font-black py-3 rounded-lg transition uppercase"
                      >
                        Create Discount
                      </button>
                      <button
                        onClick={() => setShowAddDiscountModal(false)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black py-3 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Discounts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDiscounts.map(discount => {
                const isActive = new Date() >= new Date(discount.startDate) && new Date() <= new Date(discount.endDate);
                return (
                  <div key={discount.id} className={`border rounded-2xl p-6 backdrop-blur relative overflow-hidden group ${
                    isActive
                      ? "bg-gradient-to-br from-green-500/20 to-cyan-500/10 border-green-500/30 hover:border-green-500/50"
                      : "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50 hover:border-slate-600/50"
                  }`}>
                    <div className="absolute top-4 right-4">
                      {isActive ? (
                        <span className="bg-green-500/30 text-green-300 text-xs font-black px-3 py-1 rounded-full border border-green-500/50">✅ ACTIVE</span>
                      ) : (
                        <span className="bg-slate-600/30 text-slate-300 text-xs font-black px-3 py-1 rounded-full border border-slate-600/50">⏰ UPCOMING</span>
                      )}
                    </div>

                    <div className="mb-4">
                      <h3 className="font-black text-white text-xl">{discount.name}</h3>
                    </div>

                    <div className="flex items-end justify-between mb-6">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">DISCOUNT</p>
                        <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">{discount.percentage}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">BOOKS</p>
                        <p className="text-2xl font-black text-slate-300">{discount.appliedBooks?.length || 0}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-400 border-t border-slate-700/30 pt-4">
                      <p className="flex items-center gap-2">
                        <Calendar size={14} /> {new Date(discount.startDate).toLocaleDateString()}
                      </p>
                      <p className="flex items-center gap-2">
                        <Calendar size={14} /> {new Date(discount.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* COUPONS TAB */}
        {activeTab === "coupons" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-400 flex items-center gap-2">
                <Sparkles /> Coupon Management
              </h2>
              <button
                onClick={() => setShowAddCouponModal(true)}
                className="bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-black px-6 py-3 rounded-lg transition flex items-center gap-2"
              >
                <Plus size={20} /> New Coupon
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search coupons..."
                value={couponSearch}
                onChange={(e) => setCouponSearch(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/70 focus:border-pink-500/70 rounded-xl px-5 pl-12 py-4 text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* Add Coupon Modal */}
            {showAddCouponModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-slate-900 border border-slate-700/50 rounded-2xl p-8 max-w-md w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-red-400">New Coupon</h3>
                    <button onClick={() => setShowAddCouponModal(false)} className="p-2 hover:bg-slate-800 rounded-lg transition">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Coupon Code *</label>
                      <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} type="text" placeholder="SAVE20" className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-pink-500/70 rounded-lg px-4 py-3 text-white outline-none transition font-bold" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Discount %*</label>
                        <input value={couponDiscount} onChange={(e) => setCouponDiscount(Number(e.target.value))} type="number" className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-pink-500/70 rounded-lg px-4 py-3 text-white outline-none transition" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Usage Limit *</label>
                        <input value={couponLimit} onChange={(e) => setCouponLimit(Number(e.target.value))} type="number" className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-pink-500/70 rounded-lg px-4 py-3 text-white outline-none transition" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Expiry Date *</label>
                      <input value={couponExpiry} onChange={(e) => setCouponExpiry(e.target.value)} type="date" className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-pink-500/70 rounded-lg px-4 py-3 text-white outline-none transition" />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleAddCoupon}
                        className="flex-1 bg-gradient-to-r from-pink-600 to-red-600 hover:from-pink-700 hover:to-red-700 text-white font-black py-3 rounded-lg transition uppercase"
                      >
                        Create Coupon
                      </button>
                      <button
                        onClick={() => setShowAddCouponModal(false)}
                        className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-black py-3 rounded-lg transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Coupons Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoupons.map(coupon => {
                const isExpired = new Date(coupon.expiry) < new Date();
                const isExhausted = coupon.used >= coupon.limit_count;
                const usagePercent = (coupon.used / coupon.limit_count) * 100;

                return (
                  <div key={coupon.id} className={`border rounded-2xl p-6 backdrop-blur relative overflow-hidden group ${
                    isExpired || isExhausted
                      ? "bg-slate-800/30 border-slate-700/30 opacity-60"
                      : "bg-gradient-to-br from-pink-500/20 to-red-500/10 border-pink-500/30 hover:border-pink-500/50"
                  }`}>
                    {isExpired && <div className="absolute top-3 right-3 bg-red-500/30 text-red-300 text-xs font-black px-3 py-1 rounded">EXPIRED</div>}
                    {isExhausted && <div className="absolute top-3 right-3 bg-yellow-500/30 text-yellow-300 text-xs font-black px-3 py-1 rounded">EXHAUSTED</div>}

                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-black text-white text-2xl">{coupon.code}</h3>
                        <p className="text-sm text-slate-400 mt-1">{coupon.discount}% Discount</p>
                      </div>
                      <button
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-slate-400">Usage</span>
                          <span className="text-slate-300 font-bold">{coupon.used}/{coupon.limit_count}</span>
                        </div>
                        <div className="w-full bg-slate-700/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(usagePercent, 100)}%` }}
                          />
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 flex items-center gap-2">
                        <Calendar size={14} /> Expires: {new Date(coupon.expiry).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 flex items-center gap-2">
              <Sparkles /> Customer Management
            </h2>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700/50 hover:border-slate-600/70 focus:border-yellow-500/70 rounded-xl px-5 pl-12 py-4 text-white placeholder-slate-500 outline-none transition"
              />
            </div>

            {/* Customers Grid */}
            <div className="grid grid-cols-1 gap-4">
              {filteredCustomers.map(customer => {
                const customerOrders = orders.filter(o => o.customer_id === customer.id);
                const totalSpent = customerOrders.reduce((sum, o) => sum + (o.final_price || 0), 0);

                return (
                  <div key={customer.id} className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-700/50 hover:border-yellow-500/50 rounded-2xl p-6 backdrop-blur transition hover:shadow-lg hover:shadow-yellow-500/10">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-black text-lg">
                          {customer.name?.[0] || "?"}
                        </div>
                        <div>
                          <h3 className="font-black text-white text-lg">{customer.name || "Anonymous"}</h3>
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail size={12} /> {customer.email || "No email"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-slate-400 font-bold uppercase">CONTACT</p>
                        <p className="text-sm text-slate-300 flex items-center gap-2">
                          <Phone size={14} /> {customer.phone || "—"}
                        </p>
                        <p className="text-sm text-slate-300 flex items-center gap-2">
                          <MapPin size={14} /> {customer.city || "—"}
                        </p>
                      </div>

                      <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                        <p className="text-xs text-slate-400 font-bold uppercase mb-2">Total Spending</p>
                        <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">₹{totalSpent.toFixed(0)}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                          <p className="text-xs text-slate-400 font-bold uppercase">Orders</p>
                          <p className="text-2xl font-black text-blue-400">{customerOrders.length}</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/30">
                          <p className="text-xs text-slate-400 font-bold uppercase">Member Since</p>
                          <p className="text-sm font-bold text-slate-300">{new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</p>
                        </div>
                      </div>
                    </div>

                    {customerOrders.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-slate-700/30">
                        <p className="text-xs font-bold text-slate-400 mb-3 uppercase">📚 Recent Purchases</p>
                        <div className="flex flex-wrap gap-2">
                          {customerOrders.slice(0, 3).map((order, i) => (
                            <div key={i} className="bg-slate-800/50 border border-slate-700/30 rounded-lg px-3 py-2 text-xs">
                              <p className="text-slate-300 font-bold">{order.book_title}</p>
                              <p className="text-green-400">₹{order.final_price}</p>
                            </div>
                          ))}
                          {customerOrders.length > 3 && (
                            <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg px-3 py-2 text-xs text-slate-400 font-bold">
                              +{customerOrders.length - 3} more
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

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-8 max-w-3xl">
            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400 flex items-center gap-2">
              <Sparkles /> Settings & Security
            </h2>

            {/* Change Password Section */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 rounded-2xl p-8 backdrop-blur">
              <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
                <Lock className="text-orange-400" /> Change Password
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-orange-500/70 rounded-lg px-4 py-3 text-white outline-none transition pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPass(!showCurrentPass)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-orange-500/70 rounded-lg px-4 py-3 text-white outline-none transition pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700/50 focus:border-orange-500/70 rounded-lg px-4 py-3 text-white outline-none transition pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                      >
                        {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-bold flex items-center gap-2">
                    <AlertCircle size={18} /> {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-4 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-bold flex items-center gap-2">
                    <Check size={18} /> {passwordSuccess}
                  </div>
                )}

                <button
                  onClick={handleChangePassword}
                  className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-black py-4 rounded-lg transition flex items-center justify-center gap-2 uppercase tracking-wider"
                >
                  <Lock size={20} /> Change Password
                </button>
              </div>
            </div>

            {/* Security Info */}
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 rounded-2xl p-8 backdrop-blur">
              <h3 className="text-xl font-black text-blue-300 mb-5 flex items-center gap-2">
                <Zap size={24} /> Security Guidelines
              </h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Use strong passwords with at least 8 characters, mixing letters, numbers, and symbols</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Change your password every 30 days for maximum security</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Never share your login credentials with anyone</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Always log out when finished, especially on shared computers</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check size={18} className="text-green-400 flex-shrink-0 mt-0.5" />
                  <span>Enable two-factor authentication when available</span>
                </li>
              </ul>
            </div>

            {/* System Info */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8 backdrop-blur">
              <h3 className="text-xl font-black text-purple-300 mb-5">System Information</h3>
              <div className="space-y-3 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-bold text-white">1.0.0 - Production</span>
                </div>
                <div className="flex justify-between">
                  <span>Database:</span>
                  <span className="font-bold text-white">Supabase PostgreSQL</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Backup:</span>
                  <span className="font-bold text-white">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Admin User:</span>
                  <span className="font-bold text-white">{email || "Not Available"}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
