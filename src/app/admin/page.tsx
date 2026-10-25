// @ts-nocheck
/* eslint-disable */
"use client";
import { useState, useEffect, useRef } from "react";
import {
  ShieldCheck, Upload, BookOpen, Lock, Percent, Users, Settings,
  LogOut, Eye, EyeOff, Trash2, Plus, X, Check, AlertCircle,
  BarChart3, TrendingUp, Zap, DollarSign, Tag, Mail, Phone, MapPin, CreditCard,
  Download, Filter, Search, Edit3, Copy, Loader, ChevronDown, Calendar, Star,
  TrendingDown, Activity, Bell, Menu, ChevronRight, Sparkles, ArrowUpRight, ArrowDownLeft, LineChart, PieChart,
  Handshake, Key, MessageSquare, Send, Crown, RefreshCw, Award, ExternalLink, CheckCircle2, Clock, ThumbsUp, ThumbsDown
} from "lucide-react";
import { createClient } from '@supabase/supabase-js';
import BlogManager from "../../components/admin/BlogManager";
import SeoTools from "../../components/admin/SeoTools";
import SalesInsights from "../../components/admin/SalesInsights";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy-url.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";
const lookerStudioUrl = process.env.NEXT_PUBLIC_LOOKER_STUDIO_URL || "";
const supabase = createClient(supabaseUrl, supabaseKey);

export default function PremiumAdminDashboard() {
  // ==========================================
  // AUTH & SECURITY (WITH is_admin CHECK)
  // ==========================================
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [adminEmailDisplay, setAdminEmailDisplay] = useState("Royal Sovereign");
  
  // NAVIGATION & UI HELPERS
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showGa4Panel, setShowGa4Panel] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [copiedText, setCopiedText] = useState("");

  // CUSTOM ROYAL CONFIRMATION MODAL (Replaces native confirm)
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null
  });

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
  
  // STATS CONTROL
  const [bookViews, setBookViews] = useState(0);
  const [bookLikes, setBookLikes] = useState(0);
  const [bookDislikes, setBookDislikes] = useState(0);

  const [file, setFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [editingBookId, setEditingBookId] = useState(null);
  const [bookSearch, setBookSearch] = useState("");
  
  // FAKE REVIEWS & DEDICATED REVIEW STUDIO
  const [fakeReviewName, setFakeReviewName] = useState("");
  const [fakeReviewText, setFakeReviewText] = useState("");
  const [fakeReviewRating, setFakeReviewRating] = useState(5);
  const [bookReviews, setBookReviews] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [selectedReviewBookId, setSelectedReviewBookId] = useState("");
  const [allReviewsList, setAllReviewsList] = useState([]);
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [hoverStar, setHoverStar] = useState(0);

  // DISCOUNT MANAGEMENT
  const [discounts, setDiscounts] = useState([]);
  const [discountName, setDiscountName] = useState("");
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [discountStartDate, setDiscountStartDate] = useState("");
  const [discountEndDate, setDiscountEndDate] = useState("");
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [discountSearch, setDiscountSearch] = useState("");
  const [editingDiscountId, setEditingDiscountId] = useState(null);
  
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
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // NOTIFICATIONS
  const [notifications, setNotifications] = useState([]);

  // ==========================================
  // PARTNERS & AFFILIATES MANAGEMENT 
  // ==========================================
  const [affiliateCodes, setAffiliateCodes] = useState([]);
  const [affiliates, setAffiliates] = useState([]);
  const [affiliateMessages, setAffiliateMessages] = useState([]);
  
  const [newCommission, setNewCommission] = useState(40);
  const [newCodeDiscount, setNewCodeDiscount] = useState(10);
  const [payAmount, setPayAmount] = useState({});
  const [selectedAffiliateId, setSelectedAffiliateId] = useState(null);
  const [adminChatInput, setAdminChatInput] = useState("");
  const chatRef = useRef(null);
  
  // PARTNER EDIT STATE
  const [editingPartner, setEditingPartner] = useState(null);

  // Live Clock Effect
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 15000);
    return () => clearInterval(timer);
  }, []);

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

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [affiliateMessages, selectedAffiliateId]);

  // Auto-select first book in Dedicated Reviews Studio if none selected
  useEffect(() => {
    if (books.length > 0 && !selectedReviewBookId) {
      setSelectedReviewBookId(books[0].id);
      fetchBookReviews(books[0].id);
    }
  }, [books]);

  // Helper for custom Royal Confirmation Dialog
  const askConfirmation = (title, message, onConfirmCallback) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm: async () => {
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        await onConfirmCallback();
      }
    });
  };

  // Helper for Copy to Clipboard
  const copyToClipboard = (text, label = "Code") => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    addNotification(`${label} copied: ${text} ✨`, "success");
    setTimeout(() => setCopiedText(""), 2000);
  };

  // Helper to Export CSV
  const exportOrdersToCSV = () => {
    if (!orders || orders.length === 0) {
      addNotification("No orders to export yet!", "error");
      return;
    }
    const headers = ["Order ID", "Customer", "Book Title", "Final Price (INR)", "Coupon", "Date"];
    const rows = orders.map(o => [
      o.id,
      `"${(o.customer_name || "Guest").replace(/"/g, '""')}"`,
      `"${(o.book_title || "Book").replace(/"/g, '""')}"`,
      o.final_price || 0,
      o.coupon_used || "None",
      new Date(o.created_at).toLocaleDateString()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `vedoxa_royal_sales_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addNotification("Sales report exported to CSV! 📊", "success");
  };

  // ==========================================
  // SESSION & LOGIN WITH is_admin VERIFICATION
  // ==========================================
  const checkSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.session.user.id)
          .single();

        if (!profileError && profile?.is_admin) {
          setIsAuthenticated(true);
          setAdminEmailDisplay(data.session.user.email || "Royal Admin");
        } else {
          await supabase.auth.signOut();
          setIsAuthenticated(false);
        }
      }
    } catch (error) {
      console.log("Session check failed:", error);
    }
  };

  const loadAllData = async (manual = false) => {
    if (!isAuthenticated) return;
    if (manual) setIsRefreshing(true);
    try {
      const [booksData, discountsData, couponsData, ordersData, customersData, affCodesData, affData, affMsgsData, allReviewsData] = await Promise.all([
        supabase.from('books').select('*'),
        supabase.from('discounts').select('*'),
        supabase.from('coupons').select('*'),
        supabase.from('orders').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*'),
        supabase.from('affiliate_codes').select('*').order('created_at', { ascending: false }),
        supabase.from('affiliates').select('*').order('joined_at', { ascending: false }),
        supabase.from('affiliate_messages').select('*').order('created_at', { ascending: true }),
        supabase.from('reviews').select('id, book_id, review_text, rating, fake_author_name, created_at, profiles(name)').order('created_at', { ascending: false })
      ]);

      if (booksData.data) setBooks(booksData.data);
      if (discountsData.data) setDiscounts(discountsData.data);
      if (couponsData.data) setCoupons(couponsData.data);
      if (ordersData.data) setOrders(ordersData.data);
      if (customersData.data) setCustomers(customersData.data);
      
      if (affCodesData.data) setAffiliateCodes(affCodesData.data);
      if (affData.data) setAffiliates(affData.data);
      if (affMsgsData.data) setAffiliateMessages(affMsgsData.data);
      if (allReviewsData.data) setAllReviewsList(allReviewsData.data);

      if (manual) addNotification("Royal data synchronized! ✨", "success");
    } catch (error) {
      console.log("Data load error:", error);
    } finally {
      if (manual) setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const fetchBookReviews = async (bookId) => {
    if (!bookId) return;
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('id, book_id, review_text, rating, fake_author_name, created_at, profiles(name)')
        .eq('book_id', bookId)
        .order('created_at', { ascending: false });
      if (!error && data) setBookReviews(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
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
        // Verify is_admin flag in profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', data.user.id)
          .single();

        if (profileError || !profile?.is_admin) {
          await supabase.auth.signOut();
          setLoginError("👑 Access Denied: This account does not have Royal Admin (is_admin) privileges.");
          setIsLoggingIn(false);
          return;
        }

        setIsAuthenticated(true);
        setAdminEmailDisplay(data.user.email || "Royal Admin");
        setEmail("");
        setPassword("");
        addNotification("Welcome to the Royal Suite! 👑", "success");
      }
    } catch (error) {
      setLoginError("Login failed: " + error.message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const addNotification = (message, type = "info") => {
    const id = Date.now() + Math.random();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const handlePublishBook = async () => {
    if (!title || basePrice <= 0 || (!file && !editingBookId)) {
      setUploadStatus("❌ Title, Price and PDF file are required!");
      return;
    }

    setIsUploading(true);
    let coverFileName = null;
    let pdfFileName = null;

    try {
      if (coverFile) {
        setUploadStatus("🖼️ Uploading Cover Image...");
        coverFileName = `${Date.now()}-cover-${Math.random().toString(36).substring(2)}.${coverFile.name.split('.').pop()}`;
        const { error: coverError } = await supabase.storage
          .from('books-covers')
          .upload(coverFileName, coverFile);
          
        if (coverError) throw coverError;
      }

      if (file) {
        setUploadStatus("🔒 Securing and Uploading PDF...");
        pdfFileName = `${Date.now()}-book-${Math.random().toString(36).substring(2)}.pdf`;
        const { error: storageError } = await supabase.storage
          .from('books-pdfs')
          .upload(pdfFileName, file);

        if (storageError) throw storageError;
      }

      setUploadStatus("✅ Saving details...");

      const finalPrice = basePrice - (basePrice * discount / 100);
      const bookData = {
        title,
        description,
        author,
        pages: pages ? Number(pages) : null,
        language,
        tags: tags ? (typeof tags === 'string' ? tags.split(',').map(t => t.trim()) : tags) : [],
        base_price: basePrice,
        discount: discount,
        final_price: finalPrice,
        format: "pdf",
        views: bookViews,
        likes: bookLikes,
        dislikes: bookDislikes
      };

      if (pdfFileName) bookData.pdf_path = pdfFileName;
      if (coverFileName) bookData.cover_path = coverFileName;

      let dbError;
      if (editingBookId) {
        const { error } = await supabase.from('books').update(bookData).eq('id', editingBookId);
        dbError = error;
      } else {
        bookData.created_at = new Date().toISOString();
        const { error } = await supabase.from('books').insert([bookData]);
        dbError = error;
      }

      if (dbError) throw dbError;

      setUploadStatus(editingBookId ? "🎉 Book updated successfully!" : "🎉 Book published successfully!");
      addNotification(editingBookId ? "Book updated successfully! 📚" : "Book added successfully! 📚", "success");
      
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

  const handleAddFakeReview = async (targetBookIdOverride = null) => {
    const activeBookId = targetBookIdOverride || editingBookId || selectedReviewBookId;
    if (!activeBookId) {
      addNotification("Please select a book first!", "error");
      return;
    }
    if (!fakeReviewName || !fakeReviewText) {
      addNotification("Customer Name and Review text are required!", "error");
      return;
    }
    try {
      if (editingReviewId) {
        const { error } = await supabase.from('reviews').update({
          fake_author_name: fakeReviewName,
          review_text: fakeReviewText,
          rating: fakeReviewRating
        }).eq('id', editingReviewId);
        if (error) throw error;
        addNotification("Review Updated Successfully! 🌟", "success");
      } else {
        const { error } = await supabase.from('reviews').insert([{
          book_id: activeBookId,
          fake_author_name: fakeReviewName,
          review_text: fakeReviewText,
          rating: fakeReviewRating
        }]);
        if (error) throw error;
        addNotification("5-Star Royal Review Injected! 🌟", "success");
      }
      setFakeReviewName("");
      setFakeReviewText("");
      setFakeReviewRating(5);
      setEditingReviewId(null);
      fetchBookReviews(activeBookId);
      loadAllData();
    } catch (err) {
      addNotification("Review Error: " + err.message, "error");
    }
  };

  const handleDeleteReview = async (reviewId, bookIdToRefresh = null) => {
    askConfirmation(
      "Delete Customer Review?",
      "Are you sure you want to permanently remove this review from the book?",
      async () => {
        try {
          const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
          if (error) throw error;
          setBookReviews(prev => prev.filter(r => r.id !== reviewId));
          setAllReviewsList(prev => prev.filter(r => r.id !== reviewId));
          if (bookIdToRefresh) fetchBookReviews(bookIdToRefresh);
          addNotification("Review deleted successfully!", "success");
        } catch (err) {
          addNotification("Delete failed: " + err.message, "error");
        }
      }
    );
  };

  const handleQuickUpdateBookStats = async (bookId, newViews, newLikes, newDislikes) => {
    try {
      const { error } = await supabase.from('books').update({
        views: Number(newViews),
        likes: Number(newLikes),
        dislikes: Number(newDislikes)
      }).eq('id', bookId);
      if (error) throw error;
      addNotification("Book social proof updated! ✨", "success");
      loadAllData();
    } catch (err) {
      addNotification("Failed to update stats: " + err.message, "error");
    }
  };

  const handleEditBookClick = (book) => {
    setTitle(book.title || "");
    setDescription(book.description || "");
    setAuthor(book.author || "VEDOXA");
    setPages(book.pages || "");
    setLanguage(book.language || "English");
    setTags(book.tags ? book.tags.join(', ') : "");
    setBasePrice(book.base_price || 0);
    setDiscount(book.discount || 0);
    setBookViews(book.views || 0);
    setBookLikes(book.likes || 0);
    setBookDislikes(book.dislikes || 0);
    setEditingBookId(book.id);
    setShowAddBookModal(true);
    fetchBookReviews(book.id);
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
    setBookViews(0);
    setBookLikes(0);
    setBookDislikes(0);
    setFile(null);
    setCoverFile(null);
    setEditingBookId(null);
    setFakeReviewName("");
    setFakeReviewText("");
    setFakeReviewRating(5);
    setEditingReviewId(null);
    setBookReviews([]);
    setShowAddBookModal(false);
  };

  const handleDeleteBook = async (id) => {
    askConfirmation(
      "Remove Book from Vault?",
      "Are you sure you want to delete this book? This action cannot be undone.",
      async () => {
        try {
          const { error } = await supabase.from('books').delete().eq('id', id);
          if (error) throw error;
          setBooks(prev => prev.filter(b => b.id !== id));
          addNotification("Book deleted successfully! 🗑️", "success");
        } catch (error) {
          addNotification("Delete failed: " + error.message, "error");
        }
      }
    );
  };

  const handleAddDiscount = async () => {
    if (!discountName || discountPercentage <= 0 || !discountStartDate || !discountEndDate) {
      addNotification("All fields are required!", "error");
      return;
    }

    try {
      const discountData = {
        name: discountName,
        percentage: discountPercentage,
        startDate: discountStartDate,
        endDate: discountEndDate,
        appliedBooks: selectedBooks,
      };

      let dbError;
      if (editingDiscountId) {
        const { error } = await supabase.from('discounts').update(discountData).eq('id', editingDiscountId);
        dbError = error;
      } else {
        discountData.created_at = new Date().toISOString();
        const { error } = await supabase.from('discounts').insert([discountData]);
        dbError = error;
      }

      if (dbError) throw dbError;

      // Ensure actual books are updated so website reflects discount
      for (const bookId of selectedBooks) {
        const book = books.find(b => b.id === bookId);
        if (book) {
          const newFinalPrice = book.base_price - (book.base_price * discountPercentage / 100);
          await supabase.from('books').update({
            discount: discountPercentage,
            final_price: newFinalPrice
          }).eq('id', bookId);
        }
      }

      // If editing, revert books that were removed from the selection
      if (editingDiscountId) {
        const originalDiscount = discounts.find(d => d.id === editingDiscountId);
        if (originalDiscount && originalDiscount.appliedBooks) {
          const removedBooks = originalDiscount.appliedBooks.filter(id => !selectedBooks.includes(id));
          for (const bookId of removedBooks) {
            const book = books.find(b => b.id === bookId);
            if (book) {
              await supabase.from('books').update({
                discount: 0,
                final_price: book.base_price
              }).eq('id', bookId);
            }
          }
        }
      }

      resetDiscountForm();
      addNotification(editingDiscountId ? "Discount updated successfully! 💰" : "Discount created successfully! 💰", "success");
      loadAllData();
    } catch (error) {
      addNotification("Error: " + error.message, "error");
    }
  };

  const handleEditDiscountClick = (discount) => {
    setDiscountName(discount.name || "");
    setDiscountPercentage(discount.percentage || 0);
    setDiscountStartDate(discount.startDate || "");
    setDiscountEndDate(discount.endDate || "");
    setSelectedBooks(discount.appliedBooks || []);
    setEditingDiscountId(discount.id);
    setShowAddDiscountModal(true);
  };

  const handleDeleteDiscount = async (id) => {
    askConfirmation(
      "End Discount Campaign?",
      "Deleting this campaign will restore the original prices on all associated books.",
      async () => {
        try {
          const discountToDelete = discounts.find(d => d.id === id);
          const { error } = await supabase.from('discounts').delete().eq('id', id);
          if (error) throw error;
          
          if (discountToDelete && discountToDelete.appliedBooks) {
            for (const bookId of discountToDelete.appliedBooks) {
              const book = books.find(b => b.id === bookId);
              if (book) {
                await supabase.from('books').update({
                  discount: 0,
                  final_price: book.base_price
                }).eq('id', bookId);
              }
            }
          }

          setDiscounts(prev => prev.filter(d => d.id !== id));
          addNotification("Discount deleted & prices restored! 🗑️", "success");
          loadAllData();
        } catch (error) {
          addNotification("Delete failed: " + error.message, "error");
        }
      }
    );
  };

  const resetDiscountForm = () => {
    setDiscountName("");
    setDiscountPercentage(0);
    setDiscountStartDate("");
    setDiscountEndDate("");
    setSelectedBooks([]);
    setEditingDiscountId(null);
    setShowAddDiscountModal(false);
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
    askConfirmation(
      "Delete Promo Coupon?",
      "Customers will no longer be able to apply this promo code at checkout.",
      async () => {
        try {
          const { error } = await supabase.from('coupons').delete().eq('id', id);
          if (error) throw error;
          setCoupons(prev => prev.filter(c => c.id !== id));
          addNotification("Coupon deleted! 🗑️", "success");
        } catch (error) {
          addNotification("Delete failed: " + error.message, "error");
        }
      }
    );
  };

  // ==========================================
  // AFFILIATE SYSTEM ACTIONS
  // ==========================================
  const generateAffiliateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  };

  const handleCreateAffiliateCode = async () => {
    const code = generateAffiliateCode();
    try {
      const { error } = await supabase.from('affiliate_codes').insert([{
        code,
        commission_pct: newCommission,
        discount_pct: newCodeDiscount
      }]);
      if (error) throw error;
      addNotification(`New Partner Code Generated: ${code}`, "success");
      loadAllData();
    } catch (err) {
      addNotification("Error creating code: " + err.message, "error");
    }
  };

  const handlePayAffiliate = async (affiliateId, currentPaid) => {
    const amount = Number(payAmount[affiliateId] || 0);
    if (amount <= 0) return addNotification("Enter a valid payout amount!", "error");
    
    try {
      const { error } = await supabase.from('affiliates').update({
        total_paid: Number(currentPaid) + amount
      }).eq('user_id', affiliateId);
      
      if (error) throw error;
      setPayAmount(prev => ({ ...prev, [affiliateId]: "" }));
      addNotification(`Successfully paid ₹${amount} to partner!`, "success");
      loadAllData();
    } catch (err) {
      addNotification("Error marking payment: " + err.message, "error");
    }
  };

  const handleUpdatePartner = async () => {
    if (!editingPartner) return;
    try {
      const { error } = await supabase.from('affiliates').update({
        full_name: editingPartner.full_name,
        channel_name: editingPartner.channel_name,
        payment_upi: editingPartner.payment_upi,
        commission_pct: editingPartner.commission_pct
      }).eq('user_id', editingPartner.user_id);
      
      if (error) throw error;
      
      setEditingPartner(null);
      addNotification("Partner details updated!", "success");
      loadAllData();
    } catch (err) {
      addNotification("Failed to update: " + err.message, "error");
    }
  };

  const handleDeletePartner = async (affiliateId, partnerCode) => {
    askConfirmation(
      "Remove Affiliate Partner?",
      "WARNING: This will delete the partner, their stats, and invalidate their partner code!",
      async () => {
        try {
          await supabase.from('affiliate_codes').delete().eq('code', partnerCode);
          const { error } = await supabase.from('affiliates').delete().eq('user_id', affiliateId);
          if (error) throw error;
          
          if (selectedAffiliateId === affiliateId) setSelectedAffiliateId(null);
          addNotification("Partner removed successfully!", "success");
          loadAllData();
        } catch (err) {
          addNotification("Delete Failed: " + err.message, "error");
        }
      }
    );
  };

  const handleSendAdminMessage = async () => {
    if (!adminChatInput.trim() || !selectedAffiliateId) return;
    try {
      const { error } = await supabase.from('affiliate_messages').insert([{
        affiliate_id: selectedAffiliateId,
        sender_type: 'admin',
        message: adminChatInput
      }]);
      if (error) throw error;
      setAdminChatInput("");
      loadAllData();
    } catch (err) {
      addNotification("Message failed: " + err.message, "error");
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

  const handleLogoutConfirm = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setEmail("");
      setPassword("");
      setShowLogoutModal(false);
      addNotification("Logged out successfully! 👋", "success");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  // ==========================================
  // COMPUTED METRICS & FILTERS
  // ==========================================
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

  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.final_price) || 0), 0);
  const totalOrders = orders.length;
  const totalCustomers = customers.length;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Today's revenue calculation
  const todayStr = new Date().toDateString();
  const todayRevenue = orders
    .filter(o => o.created_at && new Date(o.created_at).toDateString() === todayStr)
    .reduce((sum, o) => sum + (Number(o.final_price) || 0), 0);

  // Pending affiliate payouts
  const totalPendingPayouts = affiliates.reduce((sum, aff) => {
    const pending = (Number(aff.total_earned) || 0) - (Number(aff.total_paid) || 0);
    return sum + (pending > 0 ? pending : 0);
  }, 0);

  // Average rating across all reviews
  const globalAverageRating = allReviewsList.length > 0
    ? (allReviewsList.reduce((acc, r) => acc + (Number(r.rating) || 5), 0) / allReviewsList.length).toFixed(1)
    : "5.0";

  const selectedBookObject = books.find(b => String(b.id) === String(selectedReviewBookId));

  // Navigation Items Configuration
  const navItems = [
    { id: "dashboard", label: "Royal Overview", icon: Crown, badge: null },
    { id: "books", label: "Book Vault", icon: BookOpen, badge: books.length },
    { id: "reviews", label: "Reviews & Stars", icon: Star, badge: `${globalAverageRating}★` },
    { id: "discounts", label: "Royal Deals", icon: Percent, badge: discounts.length || null },
    { id: "coupons", label: "Promo Codes", icon: Tag, badge: coupons.length || null },
    { id: "customers", label: "Members", icon: Users, badge: totalCustomers || null },
    { id: "affiliates", label: "Partners", icon: Handshake, badge: affiliates.length || null },
    { id: "blog", label: "Editorial Blog", icon: Edit3, badge: null },
    { id: "seo", label: "SEO Engine", icon: Search, badge: null },
    { id: "insights", label: "Deep Insights", icon: LineChart, badge: null },
    { id: "settings", label: "Vault Security", icon: Settings, badge: null }
  ];

  // ==========================================
  // ROYAL LOGIN SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#07090E] flex items-center justify-center p-4 font-sans overflow-hidden relative selection:bg-amber-500/30 selection:text-amber-200">
        {/* Soft Royal Ambient Glows */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 left-1/4 w-[28rem] h-[28rem] bg-amber-500/10 rounded-full blur-[130px]"></div>
          <div className="absolute top-1/2 -right-20 w-[26rem] h-[26rem] bg-indigo-500/10 rounded-full blur-[130px]"></div>
          <div className="absolute -bottom-24 left-1/3 w-[24rem] h-[24rem] bg-purple-500/10 rounded-full blur-[130px]"></div>
        </div>

        <div className="relative max-w-md w-full">
          <div className="relative bg-[#0D111A]/90 backdrop-blur-2xl border border-amber-500/20 p-10 rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.75)]">
            {/* Top Crown Crest */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400/25 rounded-2xl blur-xl"></div>
                <div className="relative bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-4 rounded-2xl shadow-lg border border-amber-200/40">
                  <Crown size={34} className="text-slate-950" />
                </div>
              </div>
            </div>
            
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold tracking-widest uppercase mb-3">
                <Sparkles size={12} /> Imperial Access Only
              </span>
              <h1 className="text-3xl font-black tracking-tight text-white">
                VEDOXA <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">ROYAL</span>
              </h1>
              <p className="text-slate-400 text-xs font-medium mt-1.5">Executive Publishing & Sovereign Suite</p>
            </div>
            
            <form onSubmit={handleAdminLogin} className="space-y-5">
              {loginError && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200 text-xs font-semibold flex items-start gap-2.5 leading-relaxed">
                  <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}
              
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-2 uppercase tracking-wider">Sovereign Email</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#131926] border border-slate-800 hover:border-amber-500/30 focus:border-amber-400 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition"
                    placeholder="admin@vedoxa.com"
                  />
                  <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={17} />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-2 uppercase tracking-wider">Royal Passkey</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#131926] border border-slate-800 hover:border-amber-500/30 focus:border-amber-400 rounded-xl px-4 py-3.5 text-sm text-white placeholder-slate-500 outline-none transition pr-11"
                    placeholder="••••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-300 transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full mt-4 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 hover:from-amber-300 hover:to-yellow-500 disabled:opacity-50 text-slate-950 font-black py-3.5 rounded-xl transition shadow-[0_10px_25px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2 text-sm tracking-wide"
              >
                {isLoggingIn ? (
                  <>
                    <Loader size={18} className="animate-spin" /> Verifying Royal Crest...
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} /> Enter Royal Chamber
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5"><Lock size={12} className="text-amber-400/80" /> Protected by `is_admin` Guard</span>
              <span>v3.5 Imperial</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN ROYAL ADMIN INTERFACE
  // ==========================================
  return (
    <div className="min-h-screen bg-[#07090E] text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-200 flex flex-col">
      
      {/* CUSTOM ROYAL CONFIRMATION DIALOG */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
          <div className="bg-[#0E131F] border border-amber-500/30 rounded-3xl p-7 max-w-sm w-full shadow-2xl text-center">
            <div className="mx-auto w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-4 border border-amber-500/30">
              <AlertCircle size={28} className="text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1.5">{confirmDialog.title}</h3>
            <p className="text-slate-400 mb-6 text-xs leading-relaxed">{confirmDialog.message}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDialog({ isOpen: false, title: "", message: "", onConfirm: null })}
                className="flex-1 bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold py-2.5 rounded-xl text-xs transition border border-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0E131F] border border-amber-500/30 rounded-3xl p-7 max-w-sm w-full shadow-2xl text-center">
            <div className="mx-auto w-14 h-14 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-4 border border-rose-500/30">
              <LogOut size={26} className="text-rose-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1.5">Leave Royal Suite?</h3>
            <p className="text-slate-400 mb-6 text-xs leading-relaxed">Are you sure you want to securely sign out of the VEDOXA Royal Control Center?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold py-2.5 rounded-xl text-xs transition border border-slate-700">Stay Here</button>
              <button onClick={handleLogoutConfirm} className="flex-1 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg">Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATIONS */}
      <div className="fixed bottom-5 right-5 space-y-2.5 z-[90]">
        {notifications.map(notif => (
          <div key={notif.id} className={`px-4 py-3 rounded-2xl font-semibold text-xs flex items-center gap-2.5 backdrop-blur-xl border shadow-xl ${
            notif.type === 'success' ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/40' :
            notif.type === 'error' ? 'bg-rose-950/90 text-rose-200 border-rose-500/40' :
            'bg-slate-900/90 text-amber-200 border-amber-500/40'
          }`}>
            {notif.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
            {notif.type === 'error' && <AlertCircle size={16} className="text-rose-400 shrink-0" />}
            <span>{notif.message}</span>
          </div>
        ))}
      </div>

      {/* TOP ROYAL HEADER */}
      <header className="border-b border-slate-800/80 bg-[#0A0E17]/85 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-slate-800/70 rounded-xl transition text-slate-300 hover:text-amber-300 border border-transparent hover:border-slate-700"
              title="Toggle Royal Navigation"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 p-2 rounded-xl shadow-md">
                <Crown size={18} className="text-slate-950" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-black tracking-tight text-white">VEDOXA</h1>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                    Royal Suite
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">{adminEmailDisplay}</p>
              </div>
            </div>
          </div>
          
          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            {currentTime && (
              <div className="hidden md:flex items-center gap-1.5 bg-[#111726] border border-slate-800 px-3 py-1.5 rounded-xl text-xs text-slate-300">
                <Clock size={13} className="text-amber-400" />
                <span>{currentTime}</span>
              </div>
            )}

            <button
              onClick={() => loadAllData(true)}
              className="p-2 bg-[#111726] hover:bg-slate-800 text-slate-300 hover:text-amber-300 rounded-xl border border-slate-800 transition"
              title="Sync Live Data"
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin text-amber-400" : ""} />
            </button>

            <button
              onClick={() => setActiveTab("reviews")}
              className="hidden sm:flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-xl font-semibold text-xs transition border border-amber-500/25"
            >
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span>{globalAverageRating}</span>
            </button>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 px-3.5 py-1.5 rounded-xl font-semibold text-xs transition border border-rose-500/25"
            >
              <LogOut size={14} /> <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* BODY LAYOUT: SIDEBAR + MAIN CONTENT */}
      <div className="flex-1 max-w-[1440px] w-full mx-auto flex relative">
        
        {/* LEFT ROYAL SIDEBAR (Desktop) */}
        {sidebarOpen && (
          <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-slate-800/80 bg-[#0A0E17]/60 p-4 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 px-3 mb-2">
              Imperial Navigation
            </div>
            <nav className="space-y-1 flex-1">
              {navItems.map(item => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-300 border border-amber-500/30 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <IconComponent size={16} className={isActive ? "text-amber-400" : "text-slate-400"} />
                      {item.label}
                    </span>
                    {item.badge !== null && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        isActive ? "bg-amber-400 text-slate-950" : "bg-slate-800 text-slate-400"
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Quick Royal Status Card in Sidebar */}
            <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-[#111827] to-[#0D1320] border border-amber-500/20">
              <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold mb-1">
                <span className="flex items-center gap-1"><ShieldCheck size={13} /> Admin Verified</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-400">Today's Sales: <strong className="text-white">₹{todayRevenue}</strong></p>
            </div>
          </aside>
        )}

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          
          {/* MOBILE / COMPACT TOP PILL BAR (Always accessible on smaller screens or when sidebar is closed) */}
          <div className={`${sidebarOpen ? "lg:hidden" : "block"} mb-6 overflow-x-auto pb-2`}>
            <div className="flex gap-1.5">
              {navItems.map(item => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                      isActive
                        ? "bg-amber-500 text-slate-950 font-bold shadow-sm"
                        : "bg-[#111726] text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    <IconComponent size={14} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =========================================
              1. COMPACT & CLEAR ROYAL DASHBOARD TAB
              ========================================= */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              
              {/* Compact Royal Greeting & Quick Actions Bar */}
              <div className="bg-gradient-to-r from-[#111827] via-[#131B2E] to-[#111827] border border-amber-500/25 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                    <Crown size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      Royal Executive Overview
                    </h2>
                    <p className="text-xs text-slate-400">
                      Clean, real-time snapshot of your store performance & quick actions.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => { resetBookForm(); setActiveTab("books"); setShowAddBookModal(true); }}
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Plus size={14} /> Add Book
                  </button>
                  <button
                    onClick={() => setActiveTab("reviews")}
                    className="bg-[#182032] hover:bg-slate-800 text-amber-300 border border-amber-500/25 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Star size={14} /> Review Studio
                  </button>
                  <button
                    onClick={() => { setActiveTab("coupons"); setShowAddCouponModal(true); }}
                    className="bg-[#182032] hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition"
                  >
                    <Tag size={14} /> + Coupon
                  </button>
                  <button
                    onClick={exportOrdersToCSV}
                    className="bg-[#182032] hover:bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition"
                    title="Download Sales CSV"
                  >
                    <Download size={14} /> CSV
                  </button>
                </div>
              </div>

              {/* Compact 4+2 KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-6 gap-3.5">
                <div className="bg-[#0E131F] border border-slate-800/90 hover:border-amber-500/30 rounded-2xl p-4 transition">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold mb-1.5">
                    <span>REVENUE</span>
                    <DollarSign size={15} className="text-emerald-400" />
                  </div>
                  <p className="text-2xl font-black text-white">₹{totalRevenue.toLocaleString('en-IN')}</p>
                  <p className="text-[11px] text-emerald-400 mt-1">Today: ₹{todayRevenue}</p>
                </div>

                <div className="bg-[#0E131F] border border-slate-800/90 hover:border-amber-500/30 rounded-2xl p-4 transition">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold mb-1.5">
                    <span>ORDERS</span>
                    <CreditCard size={15} className="text-blue-400" />
                  </div>
                  <p className="text-2xl font-black text-white">{totalOrders}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Avg: ₹{avgOrderValue}/order</p>
                </div>

                <div className="bg-[#0E131F] border border-slate-800/90 hover:border-amber-500/30 rounded-2xl p-4 transition">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold mb-1.5">
                    <span>BOOKS VAULT</span>
                    <BookOpen size={15} className="text-amber-400" />
                  </div>
                  <p className="text-2xl font-black text-white">{books.length}</p>
                  <p className="text-[11px] text-amber-300/80 mt-1">{discounts.length} Active Deals</p>
                </div>

                <div className="bg-[#0E131F] border border-slate-800/90 hover:border-amber-500/30 rounded-2xl p-4 transition">
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold mb-1.5">
                    <span>CUSTOMERS</span>
                    <Users size={15} className="text-purple-400" />
                  </div>
                  <p className="text-2xl font-black text-white">{totalCustomers}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Verified Readers</p>
                </div>

                <div
                  onClick={() => setActiveTab("reviews")}
                  className="bg-[#0E131F] border border-slate-800/90 hover:border-amber-500/40 rounded-2xl p-4 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold mb-1.5">
                    <span>TRUST SCORE</span>
                    <Star size={15} className="text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-2xl font-black text-amber-300">{globalAverageRating} ★</p>
                  <p className="text-[11px] text-slate-400 mt-1">{allReviewsList.length} Total Reviews</p>
                </div>

                <div
                  onClick={() => setActiveTab("affiliates")}
                  className="bg-[#0E131F] border border-slate-800/90 hover:border-amber-500/40 rounded-2xl p-4 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between text-slate-400 text-[11px] font-semibold mb-1.5">
                    <span>PARTNER DUE</span>
                    <Handshake size={15} className="text-cyan-400" />
                  </div>
                  <p className="text-2xl font-black text-white">₹{totalPendingPayouts}</p>
                  <p className="text-[11px] text-cyan-400 mt-1">{affiliates.length} Active Partners</p>
                </div>
              </div>

              {/* Clean 2-Column Split: Recent Orders (Left) & Top Books + GA4 Toggle (Right) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recent Sales Activity (Compact Table) */}
                <div className="lg:col-span-2 bg-[#0E131F] border border-slate-800/90 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Activity size={16} className="text-amber-400" /> Recent Royal Orders
                    </h3>
                    <span className="text-[11px] text-slate-400">Showing latest {Math.min(orders.length, 6)} of {orders.length}</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-[11px] text-slate-400 uppercase">
                          <th className="py-2.5 px-3">Customer</th>
                          <th className="py-2.5 px-3">Book</th>
                          <th className="py-2.5 px-3">Amount</th>
                          <th className="py-2.5 px-3">Coupon</th>
                          <th className="py-2.5 px-3 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 text-xs">
                        {orders.slice(0, 6).map(order => (
                          <tr key={order.id} className="hover:bg-slate-800/30 transition">
                            <td className="py-3 px-3 font-semibold text-white">{order.customer_name || "Guest Reader"}</td>
                            <td className="py-3 px-3 text-slate-300 max-w-[180px] truncate">{order.book_title || "—"}</td>
                            <td className="py-3 px-3 text-emerald-400 font-bold">₹{order.final_price || 0}</td>
                            <td className="py-3 px-3">
                              {order.coupon_used ? (
                                <span className="bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded text-[10px] font-bold border border-amber-500/30">
                                  {order.coupon_used}
                                </span>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-slate-400 text-right">{new Date(order.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                        {orders.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500 text-xs">No orders recorded yet.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right Column: Top Books Quick List & Collapsible GA4 */}
                <div className="space-y-4">
                  <div className="bg-[#0E131F] border border-slate-800/90 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3.5">
                      <h3 className="text-sm font-bold text-white flex items-center gap-2">
                        <Award size={16} className="text-amber-400" /> Top Vault Books
                      </h3>
                      <button onClick={() => setActiveTab("books")} className="text-[11px] text-amber-400 hover:underline">View All</button>
                    </div>
                    <div className="space-y-2.5">
                      {books.slice(0, 4).map(book => (
                        <div key={book.id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#131A29] border border-slate-800/70">
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-bold text-white truncate">{book.title}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span>👁️ {book.views || 0}</span>
                              <span>❤️ {book.likes || 0}</span>
                            </p>
                          </div>
                          <span className="text-xs font-black text-emerald-400 shrink-0">₹{book.final_price || book.base_price}</span>
                        </div>
                      ))}
                      {books.length === 0 && (
                        <p className="text-xs text-slate-500 text-center py-4">No books published yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Clean Toggleable GA4 Card so it never clutters the dashboard unless needed */}
                  <div className="bg-[#0E131F] border border-slate-800/90 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <PieChart size={16} className="text-indigo-400" />
                        <div>
                          <h4 className="text-xs font-bold text-white">Google Analytics 4 Live</h4>
                          <p className="text-[11px] text-slate-400">Looker Studio Embed</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowGa4Panel(!showGa4Panel)}
                        className="px-3 py-1.5 rounded-xl bg-[#161F30] hover:bg-slate-800 text-xs font-semibold text-amber-300 border border-slate-700 transition"
                      >
                        {showGa4Panel ? "Hide Studio" : "Open Studio"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Collapsible GA4 Embed Panel */}
              {showGa4Panel && (
                <div className="bg-[#0E131F] border border-indigo-500/30 rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <PieChart className="text-indigo-400" size={16} /> Google Analytics 4 Live Stream
                    </h3>
                    <button onClick={() => setShowGa4Panel(false)} className="text-xs text-slate-400 hover:text-white">Close</button>
                  </div>
                  <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950 min-h-[420px]">
                    <iframe
                      width="100%"
                      height="420"
                      src={lookerStudioUrl}
                      frameBorder="0"
                      style={{ border: 0 }}
                      allowFullScreen
                      sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* =========================================
              2. DEDICATED REVIEWS & STARS STUDIO TAB (NEW!)
              ========================================= */}
          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="bg-[#0E131F] border border-amber-500/25 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">Social Proof Engine</span>
                  <h2 className="text-xl font-black text-white flex items-center gap-2 mt-0.5">
                    <Star className="text-amber-400 fill-amber-400" size={20} /> Royal Star & Review Studio
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select any book, click the stars, and add or manage customer reviews & social stats in one click.
                  </p>
                </div>
                <div className="flex items-center gap-3 bg-[#141C2B] px-4 py-2.5 rounded-xl border border-slate-800">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Store Rating</p>
                    <p className="text-lg font-black text-amber-300">{globalAverageRating} / 5.0</p>
                  </div>
                  <div className="h-8 w-[1px] bg-slate-800"></div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Total Reviews</p>
                    <p className="text-lg font-black text-white">{allReviewsList.length}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column: Interactive Star & Review Composer + Quick Social Proof */}
                <div className="bg-[#0E131F] border border-slate-800 rounded-2xl p-5 space-y-5 h-fit">
                  <div>
                    <label className="block text-[11px] font-bold text-amber-300 mb-2 uppercase tracking-wider">1. Select Target Book</label>
                    <select
                      value={selectedReviewBookId}
                      onChange={(e) => {
                        setSelectedReviewBookId(e.target.value);
                        fetchBookReviews(e.target.value);
                        setEditingReviewId(null);
                      }}
                      className="w-full bg-[#141C2B] border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none cursor-pointer"
                    >
                      <option value="">-- Choose a Book --</option>
                      {books.map(b => (
                        <option key={b.id} value={b.id}>{b.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Quick Views/Likes Booster for the Selected Book */}
                  {selectedBookObject && (
                    <div className="bg-[#131A29] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-300">Quick Social Counters</span>
                        <span className="text-[10px] text-amber-400">Instant Save</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">👁️ Views</label>
                          <input
                            type="number"
                            defaultValue={selectedBookObject.views || 0}
                            onBlur={(e) => handleQuickUpdateBookStats(selectedBookObject.id, e.target.value, selectedBookObject.likes || 0, selectedBookObject.dislikes || 0)}
                            className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">👍 Likes</label>
                          <input
                            type="number"
                            defaultValue={selectedBookObject.likes || 0}
                            onBlur={(e) => handleQuickUpdateBookStats(selectedBookObject.id, selectedBookObject.views || 0, e.target.value, selectedBookObject.dislikes || 0)}
                            className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 block mb-1">👎 Dislikes</label>
                          <input
                            type="number"
                            defaultValue={selectedBookObject.dislikes || 0}
                            onBlur={(e) => handleQuickUpdateBookStats(selectedBookObject.id, selectedBookObject.views || 0, selectedBookObject.likes || 0, e.target.value)}
                            className="w-full bg-[#0B0F19] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Interactive Star Clicker & Review Form */}
                  <div className="pt-2 border-t border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        {editingReviewId ? "✏️ Edit Selected Review" : "✨ Add New Customer Review"}
                      </span>
                      {editingReviewId && (
                        <button
                          onClick={() => {
                            setEditingReviewId(null);
                            setFakeReviewName("");
                            setFakeReviewText("");
                            setFakeReviewRating(5);
                          }}
                          className="text-[11px] text-rose-400 hover:underline"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    {/* Interactive Clickable Stars */}
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Click Star Rating ({fakeReviewRating} Stars)</label>
                      <div className="flex items-center gap-2 bg-[#141C2B] p-3 rounded-xl border border-slate-800 justify-center">
                        {[1, 2, 3, 4, 5].map(starVal => {
                          const active = (hoverStar || fakeReviewRating) >= starVal;
                          return (
                            <button
                              key={starVal}
                              type="button"
                              onMouseEnter={() => setHoverStar(starVal)}
                              onMouseLeave={() => setHoverStar(0)}
                              onClick={() => setFakeReviewRating(starVal)}
                              className="p-1 transition transform hover:scale-110"
                            >
                              <Star
                                size={26}
                                className={active ? "text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" : "text-slate-600"}
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Reader Name</label>
                      <input
                        type="text"
                        value={fakeReviewName}
                        onChange={(e) => setFakeReviewName(e.target.value)}
                        placeholder="e.g. Aarav Singhania"
                        className="w-full bg-[#141C2B] border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1.5">Review Comment</label>
                      <textarea
                        value={fakeReviewText}
                        onChange={(e) => setFakeReviewText(e.target.value)}
                        placeholder="Write an authentic, high-converting reader review..."
                        className="w-full bg-[#141C2B] border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none h-24 resize-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddFakeReview(selectedReviewBookId)}
                      className="w-full bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-600 hover:from-amber-300 hover:to-yellow-500 text-slate-950 font-black py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2"
                    >
                      <Star size={15} className="fill-slate-950" />
                      {editingReviewId ? "Save Review Changes" : "Publish Review Instantly"}
                    </button>
                  </div>
                </div>

                {/* Right 2 Columns: Live Reviews Feed for Selected Book */}
                <div className="lg:col-span-2 bg-[#0E131F] border border-slate-800 rounded-2xl p-5 flex flex-col">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Reviews for: <span className="text-amber-300">{selectedBookObject?.title || "Selected Book"}</span>
                      </h3>
                      <p className="text-[11px] text-slate-400">{bookReviews.length} reviews on this book</p>
                    </div>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input
                        type="text"
                        value={reviewSearchQuery}
                        onChange={(e) => setReviewSearchQuery(e.target.value)}
                        placeholder="Filter reviews..."
                        className="bg-[#141C2B] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[520px] pr-1">
                    {bookReviews
                      .filter(r =>
                        (r.fake_author_name || r.profiles?.name || "").toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
                        (r.review_text || "").toLowerCase().includes(reviewSearchQuery.toLowerCase())
                      )
                      .map(review => (
                        <div key={review.id} className="bg-[#131A29] border border-slate-800/80 hover:border-amber-500/30 rounded-xl p-4 flex justify-between items-start gap-4 transition">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center">
                                {(review.fake_author_name || review.profiles?.name || "U")[0]}
                              </span>
                              <div>
                                <p className="text-xs font-bold text-white">{review.fake_author_name || review.profiles?.name || "Verified Reader"}</p>
                                <div className="flex items-center gap-1 mt-0.5">
                                  {[...Array(5)].map((_, idx) => (
                                    <Star
                                      key={idx}
                                      size={11}
                                      className={idx < (review.rating || 5) ? "text-amber-400 fill-amber-400" : "text-slate-700"}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed pl-9">{review.review_text}</p>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingReviewId(review.id);
                                setFakeReviewName(review.fake_author_name || review.profiles?.name || "");
                                setFakeReviewText(review.review_text || "");
                                setFakeReviewRating(review.rating || 5);
                              }}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition"
                              title="Edit Review"
                            >
                              <Edit3 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReview(review.id, selectedReviewBookId)}
                              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition"
                              title="Delete Review"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}

                    {bookReviews.length === 0 && (
                      <div className="text-center py-12 text-slate-500 text-xs">
                        No reviews yet for this book. Use the Star Studio on the left to add the first review!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              3. BOOKS VAULT TAB
              ========================================= */}
          {activeTab === "books" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0E131F] p-5 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <BookOpen className="text-amber-400" size={20} /> Royal Book Vault
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Manage digital editions, pricing, PDFs, and social proof.</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                    <input
                      type="text"
                      placeholder="Search books..."
                      value={bookSearch}
                      onChange={(e) => setBookSearch(e.target.value)}
                      className="bg-[#141C2B] border border-slate-800 focus:border-amber-400 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      resetBookForm();
                      setShowAddBookModal(true);
                    }}
                    className="bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm shrink-0"
                  >
                    <Plus size={16} /> Add Book
                  </button>
                </div>
              </div>

              {/* Add / Edit Book Modal */}
              {showAddBookModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#0E131F] border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <Crown size={18} className="text-amber-400" />
                        {editingBookId ? "Edit Book Edition" : "Publish New Royal Edition"}
                      </h3>
                      <button onClick={resetBookForm} className="p-1.5 hover:bg-slate-800 rounded-full transition text-slate-400 hover:text-white">
                        <X size={20} />
                      </button>
                    </div>

                    <div className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase">Title *</label>
                          <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" className="w-full bg-[#141C2B] border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase">Author</label>
                          <input value={author} onChange={(e) => setAuthor(e.target.value)} type="text" className="w-full bg-[#141C2B] border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full bg-[#141C2B] border border-slate-700 focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none h-20 resize-none" />
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#131A29] p-4 rounded-2xl border border-slate-800">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Pages</label>
                          <input value={pages} onChange={(e) => setPages(e.target.value)} type="number" className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">Language</label>
                          <input value={language} onChange={(e) => setLanguage(e.target.value)} type="text" className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-emerald-400 mb-1 uppercase">Price (₹) *</label>
                          <input value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} type="number" className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3 py-2 text-xs text-emerald-300 font-bold outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-amber-400 mb-1 uppercase">Discount %</label>
                          <input value={discount} onChange={(e) => setDiscount(Number(e.target.value))} type="number" className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-300 font-bold outline-none" />
                        </div>
                      </div>

                      {/* Social Proof Override */}
                      <div className="grid grid-cols-3 gap-4 bg-[#131A29] p-4 rounded-2xl border border-slate-800">
                        <div className="col-span-3"><label className="block text-[10px] font-bold text-amber-400 uppercase">Social Proof Counters (Manual Override)</label></div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Views</label>
                          <input value={bookViews} onChange={(e) => setBookViews(Number(e.target.value))} type="number" className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Likes</label>
                          <input value={bookLikes} onChange={(e) => setBookLikes(Number(e.target.value))} type="number" className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-400 mb-1">Dislikes</label>
                          <input value={bookDislikes} onChange={(e) => setBookDislikes(Number(e.target.value))} type="number" className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                        </div>
                      </div>

                      {/* Review Injector inside Modal (Preserved & Upgraded with Interactive Stars) */}
                      {editingBookId && (
                        <div className="bg-amber-500/5 p-4 rounded-2xl border border-amber-500/25">
                          <label className="block text-[11px] font-bold text-amber-300 mb-3 uppercase flex items-center gap-1.5">
                            <Star size={14} className="fill-amber-400" /> {editingReviewId ? "Edit Review" : "Quick Review Injector"}
                          </label>
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row gap-3">
                              <input value={fakeReviewName} onChange={(e) => setFakeReviewName(e.target.value)} type="text" placeholder="Customer Name (e.g. Rahul Sharma)" className="flex-1 bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none" />
                              <div className="flex items-center gap-1 bg-[#0B0F19] border border-slate-700 rounded-xl px-3 py-1.5">
                                {[1, 2, 3, 4, 5].map(st => (
                                  <button key={st} type="button" onClick={() => setFakeReviewRating(st)}>
                                    <Star size={16} className={st <= fakeReviewRating ? "text-amber-400 fill-amber-400" : "text-slate-600"} />
                                  </button>
                                ))}
                              </div>
                            </div>
                            <textarea value={fakeReviewText} onChange={(e) => setFakeReviewText(e.target.value)} placeholder="Write review text here..." className="w-full bg-[#0B0F19] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none h-16 resize-none" />
                            <div className="flex gap-2">
                              <button onClick={() => handleAddFakeReview(editingBookId)} type="button" className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold py-2 rounded-xl text-xs transition">
                                {editingReviewId ? "Update Review" : "Add Review Now"}
                              </button>
                              {editingReviewId && (
                                <button onClick={() => { setEditingReviewId(null); setFakeReviewName(""); setFakeReviewText(""); setFakeReviewRating(5); }} type="button" className="bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs">
                                  Cancel
                                </button>
                              )}
                            </div>
                          </div>

                          {bookReviews.length > 0 && (
                            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-1">
                              {bookReviews.map(review => (
                                <div key={review.id} className="bg-[#0B0F19] p-2.5 rounded-xl border border-slate-800 flex justify-between items-start gap-3">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs font-bold text-white">{review.fake_author_name || review.profiles?.name || "User"}</p>
                                      <span className="flex text-amber-400">
                                        {[...Array(review.rating || 5)].map((_, i) => <Star key={i} size={10} className="fill-current" />)}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{review.review_text}</p>
                                  </div>
                                  <div className="flex gap-1.5 shrink-0">
                                    <button type="button" onClick={() => {
                                      setEditingReviewId(review.id);
                                      setFakeReviewName(review.fake_author_name || review.profiles?.name || "");
                                      setFakeReviewText(review.review_text || "");
                                      setFakeReviewRating(review.rating || 5);
                                    }} className="text-amber-400 bg-amber-500/10 p-1.5 rounded"><Edit3 size={12} /></button>
                                    <button type="button" onClick={() => handleDeleteReview(review.id, editingBookId)} className="text-rose-400 bg-rose-500/10 p-1.5 rounded"><Trash2 size={12} /></button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase">Tags (comma separated)</label>
                        <input value={tags} onChange={(e) => setTags(e.target.value)} type="text" placeholder="Psychology, Focus, Wealth" className="w-full bg-[#141C2B] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#131A29] p-4 rounded-2xl border border-slate-800">
                        <div>
                          <label className="block text-[11px] font-bold text-amber-300 mb-2 uppercase">1. Cover Image {editingBookId && '(Optional)'}</label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-amber-500/20 file:text-amber-300 file:font-semibold cursor-pointer"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-blue-300 mb-2 uppercase">2. Book PDF {editingBookId ? '(Optional)' : '*'}</label>
                          <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                            className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-500/20 file:text-blue-300 file:font-semibold cursor-pointer"
                          />
                        </div>
                      </div>

                      {uploadStatus && (
                        <div className="p-3.5 rounded-xl text-xs font-bold bg-[#141C2B] border border-amber-500/30 text-amber-200 flex items-center gap-2">
                          <Sparkles size={15} /> {uploadStatus}
                        </div>
                      )}

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handlePublishBook}
                          disabled={isUploading}
                          className="flex-[2] bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 disabled:opacity-50 text-slate-950 font-black py-3 rounded-xl text-xs transition flex items-center justify-center gap-2"
                        >
                          {isUploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
                          {isUploading ? "Processing..." : (editingBookId ? "Save Changes" : "Publish to Vault")}
                        </button>
                        <button
                          onClick={resetBookForm}
                          className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Books Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredBooks.map(book => (
                  <div key={book.id} className="bg-[#0E131F] border border-slate-800/90 hover:border-amber-500/40 rounded-2xl p-5 transition flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-3 mb-3.5">
                        <div className="flex gap-3.5 min-w-0">
                          <div className="w-14 h-20 bg-[#141C2B] rounded-xl shrink-0 flex items-center justify-center border border-slate-800 overflow-hidden">
                            {book.cover_path ? (
                              <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url(${supabaseUrl}/storage/v1/object/public/books-covers/${book.cover_path})` }}></div>
                            ) : (
                              <BookOpen size={20} className="text-slate-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-white text-sm line-clamp-2">{book.title}</h3>
                            <p className="text-[11px] text-amber-400/90 mt-0.5">by {book.author}</p>
                            <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2">
                              <span>👁️ {book.views || 0}</span>
                              <span>❤️ {book.likes || 0}</span>
                              <span>📄 {book.pages || "—"}p</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setSelectedReviewBookId(book.id);
                              fetchBookReviews(book.id);
                              setActiveTab("reviews");
                            }}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                            title="Manage Reviews & Stars"
                          >
                            <Star size={16} />
                          </button>
                          <button
                            onClick={() => handleEditBookClick(book)}
                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                            title="Edit Book"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                            title="Delete Book"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 mb-4">{book.description || "No description provided."}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-black text-emerald-400">₹{book.final_price || book.base_price}</span>
                        {book.discount > 0 && (
                          <>
                            <span className="text-xs line-through text-slate-500">₹{book.base_price}</span>
                            <span className="text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded font-bold">{book.discount}% OFF</span>
                          </>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedReviewBookId(book.id);
                          fetchBookReviews(book.id);
                          setActiveTab("reviews");
                        }}
                        className="text-[11px] font-semibold text-amber-300 hover:underline flex items-center gap-1"
                      >
                        <Star size={12} className="fill-amber-400 text-amber-400" /> Add Review
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =========================================
              4. AFFILIATE / PARTNERS TAB
              ========================================= */}
          {activeTab === "affiliates" && (
            <div className="space-y-6">
              <div className="bg-[#0E131F] p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Handshake className="text-amber-400" size={20} /> Royal Partners & Affiliates
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Generate partner codes, track payouts, and chat with influencers.</p>
                </div>
                <div className="bg-[#141C2B] px-4 py-2 rounded-xl border border-slate-800 text-xs">
                  <span className="text-slate-400">Total Unpaid Dues: </span>
                  <strong className="text-amber-300">₹{totalPendingPayouts}</strong>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* CODE GENERATOR */}
                <div className="bg-[#0E131F] border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Key size={16} className="text-amber-400" /> Generate Partner Code</h3>
                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">Commission (%)</label>
                      <input type="number" value={newCommission} onChange={(e) => setNewCommission(Number(e.target.value))} className="w-full bg-[#141C2B] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">Customer Discount (%)</label>
                      <input type="number" value={newCodeDiscount} onChange={(e) => setNewCodeDiscount(Number(e.target.value))} className="w-full bg-[#141C2B] border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none focus:border-amber-400" />
                    </div>
                    <button onClick={handleCreateAffiliateCode} className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black py-3 rounded-xl text-xs hover:from-amber-300 hover:to-yellow-400 transition">
                      Generate Secret Code
                    </button>
                  </div>
                </div>

                {/* CODES LIST WITH COPY BUTTON */}
                <div className="lg:col-span-2 bg-[#0E131F] border border-slate-800 rounded-2xl p-5 flex flex-col">
                  <h3 className="text-sm font-bold text-white mb-3.5">Active & Claimed Partner Codes</h3>
                  <div className="overflow-y-auto space-y-2.5 max-h-[240px] pr-1">
                    {affiliateCodes.map((codeObj, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-[#131A29] border border-slate-800">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono font-black tracking-widest text-amber-300">{codeObj.code}</span>
                          <button
                            onClick={() => copyToClipboard(codeObj.code, "Partner Code")}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                            title="Copy Code"
                          >
                            <Copy size={12} />
                          </button>
                          <span className="text-xs text-slate-400">
                            Comm: <strong className="text-emerald-400">{codeObj.commission_pct}%</strong> · Disc: <strong className="text-amber-300">{codeObj.discount_pct}%</strong>
                          </span>
                        </div>
                        <div>
                          {codeObj.is_claimed ? (
                            <span className="bg-emerald-500/15 text-emerald-300 px-2.5 py-1 rounded-md text-[10px] font-bold border border-emerald-500/30">CLAIMED</span>
                          ) : (
                            <span className="bg-slate-800 text-slate-400 px-2.5 py-1 rounded-md text-[10px] font-bold">UNCLAIMED</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {affiliateCodes.length === 0 && <p className="text-slate-500 text-xs text-center py-8">No partner codes generated yet.</p>}
                  </div>
                </div>
              </div>

              {/* EDIT PARTNER MODAL */}
              {editingPartner && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#0E131F] border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white">Edit Partner Details</h3>
                      <button onClick={() => setEditingPartner(null)} className="text-slate-400 hover:text-white"><X size={18} /></button>
                    </div>
                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Full Name</label>
                        <input value={editingPartner.full_name} onChange={(e) => setEditingPartner({ ...editingPartner, full_name: e.target.value })} className="w-full bg-[#141C2B] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">Channel Name</label>
                        <input value={editingPartner.channel_name} onChange={(e) => setEditingPartner({ ...editingPartner, channel_name: e.target.value })} className="w-full bg-[#141C2B] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1">UPI ID</label>
                        <input value={editingPartner.payment_upi} onChange={(e) => setEditingPartner({ ...editingPartner, payment_upi: e.target.value })} className="w-full bg-[#141C2B] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none" />
                      </div>
                      <button onClick={handleUpdatePartner} className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2.5 rounded-xl text-xs mt-2 transition">Save Partner</button>
                    </div>
                  </div>
                </div>
              )}

              {/* AFFILIATES LIST & CHAT */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#0E131F] border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-white mb-4">Registered Partners ({affiliates.length})</h3>
                  <div className="space-y-3.5 overflow-y-auto max-h-[520px] pr-1">
                    {affiliates.map(aff => {
                      const pendingPayout = (aff.total_earned || 0) - (aff.total_paid || 0);
                      return (
                        <div key={aff.user_id} className="bg-[#131A29] border border-slate-800 rounded-2xl p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h4 className="text-sm font-bold text-white">{aff.full_name}</h4>
                              <p className="text-xs text-amber-400">{aff.channel_name}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[11px] text-slate-400 font-mono">UPI: {aff.payment_upi}</span>
                                {aff.payment_upi && (
                                  <button onClick={() => copyToClipboard(aff.payment_upi, "UPI ID")} className="text-slate-400 hover:text-white">
                                    <Copy size={11} />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setSelectedAffiliateId(aff.user_id)}
                                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition ${
                                  selectedAffiliateId === aff.user_id ? 'bg-amber-400 text-slate-950' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                              >
                                Chat
                              </button>
                              <button onClick={() => setEditingPartner(aff)} className="p-1.5 bg-slate-800 text-slate-300 hover:text-amber-300 rounded-lg"><Edit3 size={14} /></button>
                              <button onClick={() => handleDeletePartner(aff.user_id, aff.partner_code)} className="p-1.5 bg-slate-800 text-slate-300 hover:text-rose-400 rounded-lg"><Trash2 size={14} /></button>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2 mb-3">
                            <div className="bg-[#0B0F19] p-2 rounded-lg text-center">
                              <p className="text-[10px] text-slate-500 uppercase">Clicks</p>
                              <p className="text-xs font-bold text-white">{aff.clicks || 0}</p>
                            </div>
                            <div className="bg-[#0B0F19] p-2 rounded-lg text-center">
                              <p className="text-[10px] text-slate-500 uppercase">Sales</p>
                              <p className="text-xs font-bold text-emerald-400">{aff.sales || 0}</p>
                            </div>
                            <div className="bg-[#0B0F19] p-2 rounded-lg text-center">
                              <p className="text-[10px] text-slate-500 uppercase">Earned</p>
                              <p className="text-xs font-bold text-white">₹{aff.total_earned || 0}</p>
                            </div>
                            <div className="bg-amber-500/10 p-2 rounded-lg text-center border border-amber-500/20">
                              <p className="text-[10px] text-amber-300 uppercase">Pending</p>
                              <p className="text-xs font-bold text-amber-300">₹{pendingPayout}</p>
                            </div>
                          </div>

                          {pendingPayout > 0 && (
                            <div className="flex gap-2 items-center pt-2 border-t border-slate-800">
                              <input
                                type="number"
                                placeholder="Amount sent (₹)"
                                value={payAmount[aff.user_id] || ""}
                                onChange={(e) => setPayAmount({ ...payAmount, [aff.user_id]: e.target.value })}
                                className="bg-[#0B0F19] border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs outline-none flex-1"
                              />
                              <button onClick={() => handlePayAffiliate(aff.user_id, aff.total_paid || 0)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition">
                                Mark Paid
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    {affiliates.length === 0 && <p className="text-slate-500 text-xs text-center py-10">No partners registered yet.</p>}
                  </div>
                </div>

                {/* Partner Chat Panel */}
                <div className="bg-[#0E131F] border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[560px]">
                  {!selectedAffiliateId ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                      <MessageSquare size={36} className="text-slate-600 mb-3" />
                      <p className="text-slate-400 text-xs font-semibold">Select a partner to open live support chat.</p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-[#131A29] border-b border-slate-800 p-3.5">
                        <h3 className="font-bold text-xs text-white">Partner Direct Line</h3>
                        <p className="text-[11px] text-amber-400">{affiliates.find(a => a.user_id === selectedAffiliateId)?.full_name}</p>
                      </div>
                      <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3">
                        {affiliateMessages.filter(m => m.affiliate_id === selectedAffiliateId).map(msg => (
                          <div key={msg.id} className={`max-w-[85%] p-2.5 rounded-xl text-xs ${
                            msg.sender_type === 'admin'
                              ? 'bg-amber-400 text-slate-950 font-medium ml-auto'
                              : 'bg-[#141C2B] border border-slate-800 text-slate-200 mr-auto'
                          }`}>
                            {msg.message}
                          </div>
                        ))}
                      </div>
                      <div className="p-3 bg-[#131A29] border-t border-slate-800 flex gap-2">
                        <input
                          type="text"
                          value={adminChatInput}
                          onChange={(e) => setAdminChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendAdminMessage()}
                          placeholder="Type message..."
                          className="flex-1 bg-[#0B0F19] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none"
                        />
                        <button
                          onClick={handleSendAdminMessage}
                          disabled={!adminChatInput.trim()}
                          className="bg-amber-400 hover:bg-amber-300 text-slate-950 p-2.5 rounded-xl disabled:opacity-50 transition"
                        >
                          <Send size={15} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              5. DISCOUNTS TAB
              ========================================= */}
          {activeTab === "discounts" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0E131F] p-5 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Percent className="text-amber-400" size={20} /> Royal Deals & Campaigns
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Run time-limited discount campaigns on selected books.</p>
                </div>
                <button
                  onClick={() => {
                    resetDiscountForm();
                    setShowAddDiscountModal(true);
                  }}
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <Plus size={16} /> Create Discount
                </button>
              </div>

              {showAddDiscountModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#0E131F] border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white">{editingDiscountId ? "Edit Discount" : "New Discount Campaign"}</h3>
                      <button onClick={resetDiscountForm} className="text-slate-400 hover:text-white"><X size={18} /></button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase">Campaign Name *</label>
                        <input value={discountName} onChange={(e) => setDiscountName(e.target.value)} type="text" placeholder="Royal Diwali Sale" className="w-full bg-[#141C2B] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase">Discount % *</label>
                        <input value={discountPercentage} onChange={(e) => setDiscountPercentage(Number(e.target.value))} type="number" className="w-full bg-[#141C2B] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase">Start Date *</label>
                          <input value={discountStartDate} onChange={(e) => setDiscountStartDate(e.target.value)} type="date" className="w-full bg-[#141C2B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase">End Date *</label>
                          <input value={discountEndDate} onChange={(e) => setDiscountEndDate(e.target.value)} type="date" className="w-full bg-[#141C2B] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">Select Books</label>
                        <div className="space-y-1.5 max-h-40 overflow-y-auto bg-[#131A29] p-2.5 rounded-xl border border-slate-800">
                          {books.map(book => (
                            <label key={book.id} className="flex items-center gap-2.5 p-2 hover:bg-slate-800/60 rounded-lg cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedBooks.includes(book.id)}
                                onChange={(e) => {
                                  if (e.target.checked) setSelectedBooks([...selectedBooks, book.id]);
                                  else setSelectedBooks(selectedBooks.filter(id => id !== book.id));
                                }}
                                className="rounded accent-amber-400"
                              />
                              <span className="text-xs text-slate-200">{book.title}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2.5 pt-2">
                        <button onClick={handleAddDiscount} className="flex-[2] bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2.5 rounded-xl text-xs">
                          {editingDiscountId ? "Update Campaign" : "Launch Campaign"}
                        </button>
                        <button onClick={resetDiscountForm} className="flex-1 bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {filteredDiscounts.map(discount => {
                  const isActive = new Date() >= new Date(discount.startDate) && new Date() <= new Date(discount.endDate);
                  return (
                    <div key={discount.id} className="bg-[#0E131F] border border-slate-800 rounded-2xl p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isActive ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                            {isActive ? "ACTIVE" : "SCHEDULED"}
                          </span>
                          <h3 className="font-bold text-white text-base mt-1.5">{discount.name}</h3>
                        </div>
                        <div className="flex gap-1">
                          <button onClick={() => handleEditDiscountClick(discount)} className="p-1.5 text-slate-400 hover:text-amber-300 bg-slate-800/70 rounded-lg"><Edit3 size={14} /></button>
                          <button onClick={() => handleDeleteDiscount(discount.id)} className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800/70 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </div>
                      <div className="flex items-end justify-between my-4">
                        <p className="text-3xl font-black text-amber-300">{discount.percentage}% OFF</p>
                        <p className="text-xs text-slate-400">{discount.appliedBooks?.length || 0} Books</p>
                      </div>
                      <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-800 flex justify-between">
                        <span>{new Date(discount.startDate).toLocaleDateString()}</span>
                        <span>→</span>
                        <span>{new Date(discount.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================
              6. COUPONS TAB (With One-Click Copy)
              ========================================= */}
          {activeTab === "coupons" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0E131F] p-5 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Tag className="text-amber-400" size={20} /> Promo Codes & Vouchers
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Create and copy checkout promo codes in one click.</p>
                </div>
                <button
                  onClick={() => setShowAddCouponModal(true)}
                  className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black px-4 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
                >
                  <Plus size={16} /> Generate Coupon
                </button>
              </div>

              {showAddCouponModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="bg-[#0E131F] border border-amber-500/30 rounded-3xl p-6 max-w-md w-full shadow-2xl">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
                      <h3 className="text-base font-bold text-white">New Promo Code</h3>
                      <button onClick={() => setShowAddCouponModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase">Coupon Code *</label>
                        <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} type="text" placeholder="ROYAL25" className="w-full bg-[#141C2B] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono font-bold text-amber-300 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase">Discount % *</label>
                          <input value={couponDiscount} onChange={(e) => setCouponDiscount(Number(e.target.value))} type="number" className="w-full bg-[#141C2B] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase">Usage Limit *</label>
                          <input value={couponLimit} onChange={(e) => setCouponLimit(Number(e.target.value))} type="number" className="w-full bg-[#141C2B] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1 uppercase">Expiry Date *</label>
                        <input value={couponExpiry} onChange={(e) => setCouponExpiry(e.target.value)} type="date" className="w-full bg-[#141C2B] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white outline-none" />
                      </div>
                      <div className="flex gap-2.5 pt-2">
                        <button onClick={handleAddCoupon} className="flex-[2] bg-amber-400 hover:bg-amber-300 text-slate-950 font-black py-2.5 rounded-xl text-xs">Create Coupon</button>
                        <button onClick={() => setShowAddCouponModal(false)} className="flex-1 bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs">Cancel</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {filteredCoupons.map(coupon => {
                  const isExpired = new Date(coupon.expiry) < new Date();
                  const isExhausted = coupon.used >= coupon.limit_count;
                  const usagePercent = (coupon.used / coupon.limit_count) * 100;

                  return (
                    <div key={coupon.id} className="bg-[#0E131F] border border-slate-800 rounded-2xl p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-mono font-black text-white text-xl tracking-wider">{coupon.code}</h3>
                          <button
                            onClick={() => copyToClipboard(coupon.code, "Coupon Code")}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 transition"
                            title="Copy Coupon"
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                        <button onClick={() => handleDeleteCoupon(coupon.id)} className="p-1.5 text-slate-400 hover:text-rose-400"><Trash2 size={15} /></button>
                      </div>
                      <p className="text-xs font-bold text-amber-300 mb-3">{coupon.discount}% Instant Discount</p>
                      <div className="bg-[#131A29] p-3 rounded-xl border border-slate-800 mb-3">
                        <div className="flex justify-between text-[11px] mb-1.5">
                          <span className="text-slate-400">Redeemed</span>
                          <span className="text-white font-bold">{coupon.used} / {coupon.limit_count}</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${Math.min(usagePercent, 100)}%` }}></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>Expires: {new Date(coupon.expiry).toLocaleDateString()}</span>
                        {(isExpired || isExhausted) && (
                          <span className="text-rose-400 font-bold">{isExpired ? "EXPIRED" : "FULL"}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================
              7. CUSTOMERS TAB
              ========================================= */}
          {activeTab === "customers" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0E131F] p-5 rounded-2xl border border-slate-800">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <Users className="text-amber-400" size={20} /> Royal Member Directory
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">Reader profiles, lifetime spend, and purchase history.</p>
                </div>
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={15} />
                  <input
                    type="text"
                    placeholder="Search readers..."
                    value={searchCustomer}
                    onChange={(e) => setSearchCustomer(e.target.value)}
                    className="bg-[#141C2B] border border-slate-800 focus:border-amber-400 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-3.5">
                {filteredCustomers.map(customer => {
                  const customerOrders = orders.filter(o => o.customer_id === customer.id);
                  const totalSpent = customerOrders.reduce((sum, o) => sum + (Number(o.final_price) || 0), 0);

                  return (
                    <div key={customer.id} className="bg-[#0E131F] border border-slate-800 hover:border-amber-500/30 rounded-2xl p-5 transition">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                        <div className="flex items-center gap-3.5">
                          <div className="w-11 h-11 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center text-slate-950 font-black text-base overflow-hidden shrink-0">
                            {customer.avatar_url ? (
                              <img src={customer.avatar_url} alt={customer.name} className="w-full h-full object-cover" />
                            ) : (
                              customer.name?.[0] || "R"
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-white text-sm truncate">{customer.name || "Vedoxa Reader"}</h3>
                              {customer.is_admin && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 truncate">{customer.email || "No email"}</p>
                          </div>
                        </div>

                        <div className="text-xs text-slate-300 space-y-1">
                          <p className="flex items-center gap-1.5"><Phone size={12} className="text-slate-500" /> {customer.phone || "—"}</p>
                          <p className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-500" /> {customer.city || "—"}</p>
                        </div>

                        <div className="bg-[#131A29] rounded-xl p-3 border border-slate-800">
                          <p className="text-[10px] text-slate-400 uppercase font-bold">Lifetime Spend</p>
                          <p className="text-lg font-black text-emerald-400">₹{totalSpent.toFixed(0)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="bg-[#131A29] rounded-xl p-3 border border-slate-800 text-center">
                            <p className="text-[10px] text-slate-400 uppercase">Orders</p>
                            <p className="text-sm font-black text-white">{customerOrders.length}</p>
                          </div>
                          <div className="bg-[#131A29] rounded-xl p-3 border border-slate-800 text-center">
                            <p className="text-[10px] text-slate-400 uppercase">Points</p>
                            <p className="text-sm font-black text-amber-300">{customer.reward_points || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* =========================================
              8. EXTERNAL ADMIN MODULES (PRESERVED 100%)
              ========================================= */}
          {activeTab === "blog" && (
            <BlogManager supabase={supabase} addNotification={addNotification} books={books} />
          )}
          {activeTab === "seo" && (
            <SeoTools supabase={supabase} addNotification={addNotification} books={books} onSaved={loadAllData} />
          )}
          {activeTab === "insights" && (
            <SalesInsights orders={orders} books={books} customers={customers} />
          )}

          {/* =========================================
              9. SETTINGS & VAULT SECURITY TAB
              ========================================= */}
          {activeTab === "settings" && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-[#0E131F] p-5 rounded-2xl border border-slate-800">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Settings className="text-amber-400" size={20} /> Royal Vault Security
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Update your sovereign passkey and security preferences.</p>
              </div>

              <div className="bg-[#0E131F] border border-slate-800 rounded-2xl p-6 space-y-5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock size={16} className="text-amber-400" /> Change Admin Password
                </h3>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPass ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-[#141C2B] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-xs text-white outline-none pr-10"
                    />
                    <button type="button" onClick={() => setShowCurrentPass(!showCurrentPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      {showCurrentPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPass ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-[#141C2B] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-xs text-white outline-none pr-10"
                      />
                      <button type="button" onClick={() => setShowNewPass(!showNewPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        {showNewPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPass ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-[#141C2B] border border-slate-700 focus:border-amber-400 rounded-xl px-4 py-3 text-xs text-white outline-none pr-10"
                      />
                      <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                </div>

                {passwordError && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle size={15} /> {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <Check size={15} /> {passwordSuccess}
                  </div>
                )}

                <button
                  onClick={handleChangePassword}
                  className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black py-3 rounded-xl text-xs transition"
                >
                  Update Royal Passkey
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
  }
