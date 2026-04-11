// @ts-nocheck
"use client";
import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck, Upload, BookOpen, Lock, Percent, Users, Settings,
  LogOut, Eye, EyeOff, Trash2, Edit2, Plus, X, Check, AlertCircle,
  Download, Filter, Search, BarChart3, TrendingUp, Zap, FileText,
  Calendar, DollarSign, Tag, Mail, Phone, MapPin, CreditCard
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy-url.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function SecureAdminDashboard() {
  // AUTH & SECURITY
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // NAVIGATION
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // BOOK MANAGEMENT
  const [books, setBooks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [author, setAuthor] = useState("VEDOXA");
  const [pages, setPages] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [tags, setTags] = useState("");
  const [basePrice, setBasePrice] = useState(0);
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  
  // DISCOUNT MANAGEMENT
  const [discounts, setDiscounts] = useState([]);
  const [discountName, setDiscountName] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountStartDate, setDiscountStartDate] = useState("");
  const [discountEndDate, setDiscountEndDate] = useState("");
  const [selectedBooks, setSelectedBooks] = useState([]);
  
  // COUPON MANAGEMENT
  const [coupons, setCoupons] = useState([]);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponLimit, setCouponLimit] = useState(1);
  const [couponUsed, setCouponUsed] = useState(0);
  const [couponExpiry, setCouponExpiry] = useState("");
  
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

  const finalPrice = basePrice - (basePrice * (discounts.find(d => new Date() >= new Date(d.startDate) && new Date() <= new Date(d.endDate))?.percentage || 0) / 100);

  useEffect(() => {
    checkSession();
    loadAllData();
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
      // Load books
      const { data: booksData } = await supabase.from('books').select('*');
      if (booksData) setBooks(booksData);

      // Load discounts
      const { data: discountsData } = await supabase.from('discounts').select('*');
      if (discountsData) setDiscounts(discountsData);

      // Load coupons
      const { data: couponsData } = await supabase.from('coupons').select('*');
      if (couponsData) setCoupons(couponsData);

      // Load orders
      const { data: ordersData } = await supabase.from('orders').select('*');
      if (ordersData) setOrders(ordersData);

      // Load customers from orders
      const { data: customersData } = await supabase.from('customers').select('*');
      if (customersData) setCustomers(customersData);
    } catch (error) {
      console.log("Data load error:", error);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setLoginError("\u274c \u063a\u0644\u0637 credentials - \u062f\u0648\u0628\u0627\u0631\u06c1 \u06a9\u0648\u0634\u0634 \u06a9\u0631\u06cc\u06ba");
      else if (data.user) {
        setIsAuthenticated(true);
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      setLoginError("Login failed: " + error.message);
    }
  };

  const handlePublishBook = async () => {
    if (!title || basePrice <= 0 || !file) {
      setUploadStatus("\u274c Title, Price \u0627\u0648\u0631 PDF file \u0636\u0631\u0648\u0631\u06cc \u06c1\u06cc\u06ba!");
      return;
    }

    setIsUploading(true);
    setUploadStatus("\ud83d\udd12 PDF \u0645\u062d\u0641\u0648\u0638 \u06a9\u0631 \u0631\u06c1\u06d2 \u06c1\u06cc\u06ba...");

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.pdf`;
      
      // Upload to Supabase storage
      const { data: storageData, error: storageError } = await supabase.storage
        .from('books-pdfs')
        .upload(fileName, file);

      if (storageError) throw storageError;

      setUploadStatus("\u2705 PDF \u0627\u067e \u0644\u0648\u0688 \u06c1\u0648 \u06af\u0626\u06cc! \u062a\u0641\u0635\u06cc\u0644\u0627\u062a \u0645\u062d\u0641\u0648\u0638 \u06a9\u0631 \u0631\u06c1\u06d2 \u06c1\u06cc\u06ba...");

      const bookData = {
        title,
        description,
        author,
        pages: pages ? Number(pages) : null,
        language,
        tags: tags ? tags.split(',').map(t => t.trim()) : [],
        base_price: basePrice,
        pdf_path: fileName,
        created_at: new Date(),
        format: "pdf"
      };

      if (editingBookId) {
        const { error: dbError } = await supabase.from('books').update(bookData).eq('id', editingBookId);
        if (dbError) throw dbError;
      } else {
        const { error: dbError } = await supabase.from('books').insert([bookData]);
        if (dbError) throw dbError;
      }

      setUploadStatus("\ud83c\udf89 \u06a9\u062a\u0627\u0628 \u06a9\u0627\u0645\u06cc\u0627\u0628\u06cc \u0633\u06d2 \u0634\u0627\u0626\u0639 \u06c1\u0648\u0626\u06cc!");
      
      // Reset form
      setTitle("");
      setDescription("");
      setAuthor("VEDOXA");
      setPages("");
      setLanguage("Hindi");
      setTags("");
      setBasePrice(0);
      setFile(null);
      setEditingBookId(null);
      setShowAddBookModal(false);
      
      loadAllData();
    } catch (error) {
      setUploadStatus("\u274c \u0627\u067e \u0644\u0648\u0688 \u0646\u0627\u06a9\u0627\u0645: " + error.message);
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadStatus(""), 4000);
    }
  };

  const handleDeleteBook = async (id) => {
    if (window.confirm("\u06a9\u06cc\u0627 \u0622\u067e \u06cc\u0642\u06cc\u0646\u06cc \u06c1\u06cc\u06ba\u061f")) {
      try {
        const { error } = await supabase.from('books').delete().eq('id', id);
        if (error) throw error;
        setBooks(books.filter(b => b.id !== id));
      } catch (error) {
        alert("Delete failed: " + error.message);
      }
    }
  };

  const handleAddDiscount = async () => {
    if (!discountName || discountPercentage <= 0 || !discountStartDate || !discountEndDate) {
      setUploadStatus("\u274c \u062a\u0645\u0627\u0645 \u0641\u06cc\u0644\u0688\u0632 \u0636\u0631\u0648\u0631\u06cc \u06c1\u06cc\u06ba!");
      return;
    }

    try {
      const { error } = await supabase.from('discounts').insert([{
        name: discountName,
        percentage: discountPercentage,
        startDate: discountStartDate,
        endDate: discountEndDate,
        appliedBooks: selectedBooks,
        created_at: new Date()
      }]);

      if (error) throw error;

      setDiscountName("");
      setDiscountPercentage(0);
      setDiscountStartDate("");
      setDiscountEndDate("");
      setSelectedBooks([]);
      setShowAddDiscountModal(false);
      setUploadStatus("\u2705 \u0688\u0633\u06a9\u0627\u0624\u0646\u0679 \u0634\u0627\u0645\u0644 \u06c1\u0648\u0627!");
      
      loadAllData();
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (error) {
      setUploadStatus("\u274c Error: " + error.message);
    }
  };

  const handleAddCoupon = async () => {
    if (!couponCode || couponDiscount <= 0 || couponLimit <= 0 || !couponExpiry) {
      setUploadStatus("\u274c \u062a\u0645\u0627\u0645 \u0641\u06cc\u0644\u0688\u0632 \u0636\u0631\u0648\u0631\u06cc \u06c1\u06cc\u06ba!");
      return;
    }

    try {
      const { error } = await supabase.from('coupons').insert([{
        code: couponCode.toUpperCase(),
        discount: couponDiscount,
        limit: couponLimit,
        used: 0,
        expiry: couponExpiry,
        created_at: new Date()
      }]);

      if (error) throw error;

      setCouponCode("");
      setCouponDiscount(0);
      setCouponLimit(1);
      setCouponExpiry("");
      setShowAddCouponModal(false);
      setUploadStatus("\u2705 \u06a9\u0648\u067e\u0646 \u0634\u0627\u0645\u0644 \u06c1\u0648\u0627!");
      
      loadAllData();
      setTimeout(() => setUploadStatus(""), 3000);
    } catch (error) {
      setUploadStatus("\u274c Error: " + error.message);
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (window.confirm("\u06a9\u0648\u067e\u0646 \u062d\u0630\u0641 \u06a9\u0631\u06cc\u06ba?")) {
      try {
        const { error } = await supabase.from('coupons').delete().eq('id', id);
        if (error) throw error;
        setCoupons(coupons.filter(c => c.id !== id));
      } catch (error) {
        alert("Delete failed: " + error.message);
      }
    }
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("\u062a\u0645\u0627\u0645 \u0641\u06cc\u0644\u0688\u0632 \u0636\u0631\u0648\u0631\u06cc \u06c1\u06cc\u06ba!");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("\u0646\u06cc\u0627 \u067e\u0627\u0633 \u0648\u0631\u0688 match \u0646\u06c1\u06cc\u06ba \u06c1\u06d2!");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("\u067e\u0627\u0633 \u0648\u0631\u0688 \u06a9\u0645 \u0627\u0632 \u06a9\u0645 6 characters \u06c1\u0648\u0646\u0627 \u0686\u0627\u06c1\u06cc\u06d2!");
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      
      setPasswordSuccess("\u2705 \u067e\u0627\u0633 \u0648\u0631\u0688 \u06a9\u0627\u0645\u06cc\u0627\u0628\u06cc \u0633\u06d2 \u062a\u0628\u062f\u06cc\u0644 \u06c1\u0648\u0627!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (error) {
      setPasswordError("\u274c Error: " + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  const filteredCustomers = customers.filter(c =>
    c.name?.toLowerCase().includes(searchCustomer.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchCustomer.toLowerCase())
  );

  const totalRevenue = orders.reduce((sum, order) => sum + (order.final_price || 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 font-sans overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        
        <div className="relative max-w-md w-full">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl"></div>
          
          <div className="relative bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-10 rounded-3xl shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-2xl">
                <ShieldCheck size={36} className="text-white" />
              </div>
            </div>
            
            <h1 className="text-3xl font-black text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">SECURE ADMIN</h1>
            <p className="text-center text-slate-400 text-sm mb-8">VEDOXA Premium Books Platform</p>
            
            <form onSubmit={handleAdminLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} /> {loginError}
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">ADMIN EMAIL</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-yellow-500/50 transition"
                  placeholder="admin@vedoxa.com"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">SECRET KEY</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-yellow-500/50 transition pr-10"
                    placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black py-3 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Lock size={18} /> UNLOCK SYSTEM
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 font-sans">
      {/* HEADER */}
      <header className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-lg">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">VEDOXA ADMIN</h1>
              <p className="text-xs text-slate-400">Secure Premium Platform</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg font-bold text-sm transition border border-red-500/30"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      {/* TABS */}
      <div className="border-b border-slate-700/50 bg-slate-800/20 backdrop-blur-sm sticky top-[70px] z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-8 overflow-x-auto">
            {[
              { id: "dashboard", label: "\ud83d\udcca Dashboard", icon: BarChart3 },
              { id: "books", label: "\ud83d\udcda Books", icon: BookOpen },
              { id: "discounts", label: "\ud83d\udcb0 Discounts", icon: Percent },
              { id: "coupons", label: "\ud83c\udf9f\ufe0f Coupons", icon: Tag },
              { id: "customers", label: "\ud83d\udc65 Customers", icon: Users },
              { id: "settings", label: "\u2699\ufe0f Settings", icon: Settings }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-3 font-bold text-sm whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? "border-yellow-500 text-yellow-400"
                    : "border-transparent text-slate-400 hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-bold">\u06a9\u0644 \u06a9\u062a\u0627\u0628\u06cc\u06ba</span>
                  <BookOpen className="text-yellow-400" size={20} />
                </div>
                <p className="text-3xl font-black text-white">{books.length}</p>
                <p className="text-xs text-slate-400 mt-2">\u0641\u06cc \u0627\u0644\u0648\u0642\u062a \u062f\u0633\u062a\u06cc\u0627\u0628</p>
              </div>

              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-bold">\u06a9\u0644 \u0622\u0631\u0688\u0631\u0632</span>
                  <CreditCard className="text-green-400" size={20} />
                </div>
                <p className="text-3xl font-black text-white">{totalOrders}</p>
                <p className="text-xs text-slate-400 mt-2">\u06a9\u0644 \u0641\u0631\u0648\u062e\u062a</p>
              </div>

              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-bold">\u06a9\u0644 \u0622\u0645\u062f\u0646\u06cc</span>
                  <DollarSign className="text-blue-400" size={20} />
                </div>
                <p className="text-3xl font-black text-white">\u20b9{totalRevenue.toFixed(0)}</p>
                <p className="text-xs text-slate-400 mt-2">\u062e\u0627\u0644\u0635 \u0631\u0642\u0645</p>
              </div>

              <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-bold">\u0635\u0627\u0631\u0641\u06cc\u0646</span>
                  <Users className="text-purple-400" size={20} />
                </div>
                <p className="text-3xl font-black text-white">{totalCustomers}</p>
                <p className="text-xs text-slate-400 mt-2">\u0641\u06cc \u0627\u0644\u0648\u0642\u062a \u0631\u062c\u0633\u0679\u0631\u0688</p>
              </div>
            </div>

            {/* RECENT ORDERS */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 rounded-2xl p-6 backdrop-blur">
              <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
                <TrendingUp className="text-green-400" /> \u062d\u0627\u0644\u06cc\u06c1 \u0622\u0631\u0688\u0631\u0632
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-slate-700/50">
                    <tr className="text-slate-400 font-bold">
                      <th className="text-left py-3 px-4">\u0635\u0627\u0631\u0641</th>
                      <th className="text-left py-3 px-4">\u06a9\u062a\u0627\u0628</th>
                      <th className="text-left py-3 px-4">\u0631\u0642\u0645</th>
                      <th className="text-left py-3 px-4">\u062a\u0627\u0631\u06cc\u062e</th>
                      <th className="text-left py-3 px-4">\u06a9\u0648\u067e\u0646</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition">
                        <td className="py-3 px-4 text-white font-bold">{order.customer_name || "\u2014"}</td>
                        <td className="py-3 px-4 text-slate-300">{order.book_title || "\u2014"}</td>
                        <td className="py-3 px-4 text-green-400 font-bold">\u20b9{order.final_price || 0}</td>
                        <td className="py-3 px-4 text-slate-400 text-xs">{new Date(order.created_at).toLocaleDateString('ur-PK')}</td>
                        <td className="py-3 px-4 text-yellow-400 font-bold">{order.coupon_used || "\u2014"}</td>
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
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <BookOpen className="text-yellow-400" /> \u06a9\u062a\u0627\u0628\u0648\u06ba \u06a9\u0627 \u0627\u0646\u062a\u0638\u0627\u0645
              </h2>
              <button
                onClick={() => {
                  setShowAddBookModal(true);
                  setEditingBookId(null);
                  setTitle("");
                  setDescription("");
                  setBasePrice(0);
                  setFile(null);
                }}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-black px-6 py-3 rounded-lg transition flex items-center gap-2"
              >
                <Plus size={18} /> \u0646\u0626\u06cc \u06a9\u062a\u0627\u0628 \u0634\u0627\u0645\u0644 \u06a9\u0631\u06cc\u06ba
              </button>
            </div>

            {/* ADD BOOK MODAL */}
            {showAddBookModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-white">\u0646\u0626\u06cc \u06a9\u062a\u0627\u0628 \u0634\u0627\u0645\u0644 \u06a9\u0631\u06cc\u06ba</h3>
                    <button onClick={() => setShowAddBookModal(false)} className="text-slate-400 hover:text-white">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">\u0639\u0646\u0648\u0627\u0646</label>
                      <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-500/50" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">\u062a\u0641\u0635\u06cc\u0644</label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-500/50 h-24" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2">\u0645\u0635\u0646\u0641</label>
                        <input value={author} onChange={(e) => setAuthor(e.target.value)} type="text" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2">\u0635\u0641\u062d\u0627\u062a</label>
                        <input value={pages} onChange={(e) => setPages(e.target.value)} type="number" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-500/50" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2">\u0632\u0628\u0627\u0646</label>
                        <input value={language} onChange={(e) => setLanguage(e.target.value)} type="text" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-500/50" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 mb-2">\u0679\u06cc\u06af\u0632</label>
                        <input value={tags} onChange={(e) => setTags(e.target.value)} type="text" placeholder="\u0645\u062b\u0627\u0644: \u0633\u0627\u0626\u0646\u0633, \u0641\u0644\u0633\u0641\u06c1" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-500/50" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">\u0628\u0646\u06cc\u0627\u062f\u06cc \u0642\u06cc\u0645\u062a (\u20b9)</label>
                      <input value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} type="number" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-yellow-500/50" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">PDF \u0627\u067e \u0644\u0648\u0688 \u06a9\u0631\u06cc\u06ba</label>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.epub"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-500/20 file:text-yellow-400 file:font-bold cursor-pointer"
                      />
                      <p className="text-xs text-slate-400 mt-2">\u0645\u0639\u0627\u0648\u0646 \u0641\u0627\u0631\u0645\u06cc\u0679\u0633: PDF, DOC, DOCX, EPUB</p>
                    </div>

                    {uploadStatus && (
                      <div className={`p-3 rounded-lg text-sm font-bold ${
                        uploadStatus.includes("\u2705") ? "bg-green-500/20 text-green-400" :
                        uploadStatus.includes("\u274c") ? "bg-red-500/20 text-red-400" :
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {uploadStatus}
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handlePublishBook}
                        disabled={isUploading}
                        className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:opacity-50 text-black font-black py-3 rounded-lg transition flex items-center justify-center gap-2"
                      >
                        {isUploading ? "\ud83d\udd04 \u067e\u0631\u0648\u0633\u06cc\u0633 \u06c1\u0648 \u0631\u06c1\u0627 \u06c1\u06d2..." : <><Upload size={18} /> \u0634\u0627\u0626\u0639 \u06a9\u0631\u06cc\u06ba</>}
                      </button>
                      <button
                        onClick={() => setShowAddBookModal(false)}
                        className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-white font-black py-3 rounded-lg transition"
                      >
                        \u0645\u0646\u0633\u0648\u062e \u06a9\u0631\u06cc\u06ba
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* BOOKS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {books.map(book => (
                <div key={book.id} className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 rounded-xl p-4 backdrop-blur hover:border-yellow-500/30 transition">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-black text-white text-sm flex-1 line-clamp-2">{book.title}</h3>
                    <div className="flex gap-2 ml-2">
                      <button
                        onClick={() => handleDeleteBook(book.id)}
                        className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">{book.description}</p>
                  <div className="space-y-1 text-xs text-slate-400 mb-3">
                    <p>\u270d\ufe0f {book.author || "VEDOXA"}</p>
                    <p>\ud83d\udcc4 {book.pages} \u0635\u0641\u062d\u0627\u062a</p>
                    <p>\ud83d\udcb0 \u20b9{book.base_price}</p>
                    <p>\ud83c\udff7\ufe0f {book.language}</p>
                  </div>
                  {book.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {book.tags.map((tag, i) => (
                        <span key={i} className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-500">\ud83d\udcc5 {new Date(book.created_at).toLocaleDateString('ur-PK')}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DISCOUNTS TAB */}
        {activeTab === "discounts" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Percent className="text-green-400" /> \u0688\u0633\u06a9\u0627\u0624\u0646\u0679 \u06a9\u0627 \u0627\u0646\u062a\u0638\u0627\u0645
              </h2>
              <button
                onClick={() => setShowAddDiscountModal(true)}
                className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-black font-black px-6 py-3 rounded-lg transition flex items-center gap-2"
              >
                <Plus size={18} /> \u0646\u06cc\u0627 \u0688\u0633\u06a9\u0627\u0624\u0646\u0679
              </button>
            </div>

            {/* ADD DISCOUNT MODAL */}
            {showAddDiscountModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-8 max-w-md w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-white">\u0646\u06cc\u0627 \u0688\u0633\u06a9\u0627\u0624\u0646\u0679</h3>
                    <button onClick={() => setShowAddDiscountModal(false)} className="text-slate-400 hover:text-white">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">\u0688\u0633\u06a9\u0627\u0624\u0646\u0679 \u06a9\u0627 \u0646\u0627\u0645</label>
                      <input value={discountName} onChange={(e) => setDiscountName(e.target.value)} type="text" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-green-500/50" placeholder="\u0645\u062b\u0627\u0644: \u0633\u0645\u0631 \u0633\u06cc\u0644" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">\u0688\u0633\u06a9\u0627\u0624\u0646\u0679 \u0641\u06cc\u0635\u062f (%)</label>
                      <input value={discountPercentage} onChange={(e) => setDiscountPercentage(Number(e.target.value))} type="number" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-green-500/50" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">\u0634\u0631\u0648\u0639 \u062a\u0627\u0631\u06cc\u062e</label>
                      <input value={discountStartDate} onChange={(e) => setDiscountStartDate(e.target.value)} type="date" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-green-500/50" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">\u062e\u062a\u0645 \u062a\u0627\u0631\u06cc\u062e</label>
                      <input value={discountEndDate} onChange={(e) => setDiscountEndDate(e.target.value)} type="date" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-green-500/50" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-3">\u06a9\u062a\u0627\u0628\u06cc\u06ba \u0645\u0646\u062a\u062e\u0628 \u06a9\u0631\u06cc\u06ba</label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {books.map(book => (
                          <label key={book.id} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-slate-700/30 rounded">
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
                              className="w-4 h-4 rounded"
                            />
                            <span className="text-sm text-slate-300">{book.title}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {uploadStatus && (
                      <div className={`p-3 rounded-lg text-sm font-bold ${
                        uploadStatus.includes("\u2705") ? "bg-green-500/20 text-green-400" :
                        uploadStatus.includes("\u274c") ? "bg-red-500/20 text-red-400" :
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {uploadStatus}
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleAddDiscount}
                        className="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-black font-black py-3 rounded-lg transition"
                      >
                        \u0634\u0627\u0645\u0644 \u06a9\u0631\u06cc\u06ba
                      </button>
                      <button
                        onClick={() => setShowAddDiscountModal(false)}
                        className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-white font-black py-3 rounded-lg transition"
                      >
                        \u0645\u0646\u0633\u0648\u062e \u06a9\u0631\u06cc\u06ba
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* DISCOUNTS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {discounts.map(discount => {
                const isActive = new Date() >= new Date(discount.startDate) && new Date() <= new Date(discount.endDate);
                return (
                  <div key={discount.id} className={`border rounded-xl p-4 backdrop-blur ${
                    isActive
                      ? "bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-green-500/30"
                      : "bg-gradient-to-br from-slate-800/50 to-slate-700/30 border-slate-700/50"
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-black text-white">{discount.name}</h3>
                        <p className={`text-sm font-bold ${isActive ? "text-green-400" : "text-slate-400"}`}>
                          {isActive ? "\u2705 \u0641\u0639\u0627\u0644" : "\u23f0 \u0622\u0646\u06d2 \u0648\u0627\u0644\u0627"}
                        </p>
                      </div>
                      <span className="text-2xl font-black text-yellow-400">{discount.percentage}%</span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-400 mb-3">
                      <p>\ud83d\udcc5 \u0634\u0631\u0648\u0639: {new Date(discount.startDate).toLocaleDateString('ur-PK')}</p>
                      <p>\ud83d\udcc5 \u062e\u062a\u0645: {new Date(discount.endDate).toLocaleDateString('ur-PK')}</p>
                      <p>\ud83d\udcda {discount.appliedBooks?.length || 0} \u06a9\u062a\u0627\u0628\u06cc\u06ba</p>
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
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <Tag className="text-blue-400" /> \u06a9\u0648\u067e\u0646 \u06a9\u0627 \u0627\u0646\u062a\u0638\u0627\u0645
              </h2>
              <button
                onClick={() => setShowAddCouponModal(true)}
                className="bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-black font-black px-6 py-3 rounded-lg transition flex items-center gap-2"
              >
                <Plus size={18} /> \u0646\u06cc\u0627 \u06a9\u0648\u067e\u0646
              </button>
            </div>

            {/* ADD COUPON MODAL */}
            {showAddCouponModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-8 max-w-md w-full">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-black text-white">\u0646\u06cc\u0627 \u06a9\u0648\u067e\u0646</h3>
                    <button onClick={() => setShowAddCouponModal(false)} className="text-slate-400 hover:text-white">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">\u06a9\u0648\u067e\u0646 \u06a9\u0648\u0688</label>
                      <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} type="text" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500/50 font-bold" placeholder="\u0645\u062b\u0627\u0644: SAVE20" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">\u0688\u0633\u06a9\u0627\u0624\u0646\u0679 (%)</label>
                      <input value={couponDiscount} onChange={(e) => setCouponDiscount(Number(e.target.value))} type="number" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500/50" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">\u0627\u0633\u062a\u0639\u0645\u0627\u0644 \u06a9\u06cc \u062d\u062f</label>
                      <input value={couponLimit} onChange={(e) => setCouponLimit(Number(e.target.value))} type="number" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500/50" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 mb-2">\u062e\u062a\u0645 \u06c1\u0648\u0646\u06d2 \u06a9\u06cc \u062a\u0627\u0631\u06cc\u062e</label>
                      <input value={couponExpiry} onChange={(e) => setCouponExpiry(e.target.value)} type="date" className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-blue-500/50" />
                    </div>

                    {uploadStatus && (
                      <div className={`p-3 rounded-lg text-sm font-bold ${
                        uploadStatus.includes("\u2705") ? "bg-green-500/20 text-green-400" :
                        uploadStatus.includes("\u274c") ? "bg-red-500/20 text-red-400" :
                        "bg-yellow-500/20 text-yellow-400"
                      }`}>
                        {uploadStatus}
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={handleAddCoupon}
                        className="flex-1 bg-gradient-to-r from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600 text-black font-black py-3 rounded-lg transition"
                      >
                        \u0634\u0627\u0645\u0644 \u06a9\u0631\u06cc\u06ba
                      </button>
                      <button
                        onClick={() => setShowAddCouponModal(false)}
                        className="flex-1 bg-slate-700/50 hover:bg-slate-700 text-white font-black py-3 rounded-lg transition"
                      >
                        \u0645\u0646\u0633\u0648\u062e \u06a9\u0631\u06cc\u06ba
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* COUPONS LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.map(coupon => {
                const isExpired = new Date(coupon.expiry) < new Date();
                const isExhausted = coupon.used >= coupon.limit;
                return (
                  <div key={coupon.id} className={`border rounded-xl p-4 backdrop-blur relative overflow-hidden ${
                    isExpired || isExhausted
                      ? "bg-gradient-to-br from-slate-800/30 to-slate-700/20 border-slate-700/50 opacity-60"
                      : "bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border-blue-500/30"
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-black text-white text-lg">{coupon.code}</h3>
                        <p className="text-sm text-slate-400">{coupon.discount}% \u0688\u0633\u06a9\u0627\u0624\u0646\u0679</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-400 mb-3">
                      <p>\ud83d\udcca \u0627\u0633\u062a\u0639\u0645\u0627\u0644: {coupon.used}/{coupon.limit}</p>
                      <p>\ud83d\udcc5 \u062e\u062a\u0645: {new Date(coupon.expiry).toLocaleDateString('ur-PK')}</p>
                    </div>

                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-400 to-cyan-500 h-2 rounded-full transition-all"
                        style={{ width: `${(coupon.used / coupon.limit) * 100}%` }}
                      />
                    </div>

                    {isExpired && <div className="absolute top-2 right-2 bg-red-500/30 text-red-300 text-xs font-bold px-2 py-1 rounded">\u062e\u062a\u0645</div>}
                    {isExhausted && <div className="absolute top-2 right-2 bg-yellow-500/30 text-yellow-300 text-xs font-bold px-2 py-1 rounded">\u0645\u06a9\u0645\u0644</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* CUSTOMERS TAB */}
        {activeTab === "customers" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black text-white flex items-center gap-2 mb-4">
                <Users className="text-purple-400" /> \u0635\u0627\u0631\u0641\u06cc\u0646 \u06a9\u06cc \u062a\u0641\u0635\u06cc\u0644\u0627\u062a
              </h2>
              <input
                type="text"
                placeholder="\u0646\u0627\u0645 \u06cc\u0627 \u0627\u06cc \u0645\u06cc\u0644 \u0633\u06d2 \u062a\u0644\u0627\u0634 \u06a9\u0631\u06cc\u06ba..."
                value={searchCustomer}
                onChange={(e) => setSearchCustomer(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 outline-none focus:border-purple-500/50"
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredCustomers.map(customer => {
                const customerOrders = orders.filter(o => o.customer_id === customer.id);
                const totalSpent = customerOrders.reduce((sum, o) => sum + (o.final_price || 0), 0);
                return (
                  <div key={customer.id} className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 rounded-xl p-6 backdrop-blur hover:border-purple-500/30 transition">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                            {customer.name?.[0] || "?"}
                          </div>
                          <div>
                            <h3 className="font-black text-white">{customer.name || "\u0646\u0627\u0645 \u0646\u06c1\u06cc\u06ba"}</h3>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                              <Mail size={12} /> {customer.email || "\u0627\u06cc \u0645\u06cc\u0644 \u0646\u06c1\u06cc\u06ba"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 text-sm text-slate-400">
                        <p className="flex items-center gap-2">
                          <Phone size={14} /> {customer.phone || "\u2014"}
                        </p>
                        <p className="flex items-center gap-2">
                          <MapPin size={14} /> {customer.city || "\u2014"}
                        </p>
                        <p className="text-xs">\ud83d\udcc5 \u0634\u0627\u0645\u0644: {new Date(customer.created_at).toLocaleDateString('ur-PK')}</p>
                      </div>

                      <div className="space-y-2">
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">\u06a9\u0644 \u062e\u0631\u06cc\u062f\u0627\u0631\u06cc</p>
                          <p className="text-2xl font-black text-green-400">\u20b9{totalSpent.toFixed(0)}</p>
                        </div>
                        <div className="bg-slate-700/30 rounded-lg p-3">
                          <p className="text-xs text-slate-400 mb-1">\u06a9\u062a\u0627\u0628\u06cc\u06ba</p>
                          <p className="text-2xl font-black text-blue-400">{customerOrders.length}</p>
                        </div>
                      </div>
                    </div>

                    {/* PURCHASE HISTORY */}
                    {customerOrders.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-700/50">
                        <p className="text-xs font-bold text-slate-400 mb-2">\ud83d\udcda \u062e\u0631\u06cc\u062f\u0627\u0631\u06cc \u06a9\u06cc \u062a\u0627\u0631\u06cc\u062e:</p>
                        <div className="space-y-1">
                          {customerOrders.map((order, i) => (
                            <div key={i} className="flex justify-between items-center text-xs bg-slate-700/20 p-2 rounded">
                              <span className="text-slate-300">{order.book_title}</span>
                              <span className="text-yellow-400 font-bold">\u20b9{order.final_price} {order.coupon_used && `(${order.coupon_used})`}</span>
                            </div>
                          ))}
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
          <div className="space-y-6 max-w-2xl">
            <h2 className="text-2xl font-black text-white flex items-center gap-2">
              <Settings className="text-orange-400" /> \u0633\u06cc\u0679\u0646\u06af\u0632
            </h2>

            {/* PASSWORD CHANGE SECTION */}
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-700/30 border border-slate-700/50 rounded-2xl p-8 backdrop-blur">
              <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Lock className="text-red-400" /> \u067e\u0627\u0633 \u0648\u0631\u0688 \u062a\u0628\u062f\u06cc\u0644 \u06a9\u0631\u06cc\u06ba
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">\u0645\u0648\u062c\u0648\u062f\u06c1 \u067e\u0627\u0633 \u0648\u0631\u0688</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-red-500/50 pr-10"
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

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-2">\u0646\u06cc\u0627 \u067e\u0627\u0633 \u0648\u0631\u0688</label>
                  <div className="relative">
                    <input
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-red-500/50 pr-10"
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
                  <label className="block text-xs font-bold text-slate-400 mb-2">\u067e\u0627\u0633 \u0648\u0631\u0688 \u062f\u0648\u0628\u0627\u0631\u06c1 \u062f\u0631\u062c \u06a9\u0631\u06cc\u06ba</label>
                  <div className="relative">
                    <input
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-4 py-3 text-white outline-none focus:border-red-500/50 pr-10"
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

                {passwordError && (
                  <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-300 text-sm font-bold flex items-center gap-2">
                    <AlertCircle size={16} /> {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3 rounded-lg bg-green-500/20 border border-green-500/30 text-green-300 text-sm font-bold flex items-center gap-2">
                    <Check size={16} /> {passwordSuccess}
                  </div>
                )}

                <button
                  onClick={handleChangePassword}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-black py-3 rounded-lg transition flex items-center justify-center gap-2 mt-6"
                >
                  <Lock size={18} /> \u067e\u0627\u0633 \u0648\u0631\u0688 \u062a\u0628\u062f\u06cc\u0644 \u06a9\u0631\u06cc\u06ba
                </button>
              </div>
            </div>

            {/* SECURITY INFO */}
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 border border-blue-500/30 rounded-2xl p
