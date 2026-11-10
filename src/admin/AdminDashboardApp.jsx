import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import {
  Search,
  X,
  BookOpen,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  Settings,
  Shield,
  Clock,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  api,
  getCurrentUser,
  setCurrentUser,
  setAuthToken,
  getAuthToken
} from '../api';

// Admin Components
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import DashboardOverview from './DashboardOverview';
import BooksView from './views/BooksView';
import CategoriesView from './views/CategoriesView';
import OrdersView from './views/OrdersView';
import CustomersView from './views/CustomersView';
import OffersView from './views/OffersView';
import ReportsView from './views/ReportsView';
import SettingsView from './views/SettingsView';
import AdminUsersView from './views/AdminUsersView';
import ActivityLogsView from './views/ActivityLogsView';

export default function AdminDashboardApp() {
  const [currentUser, setUser] = useState(getCurrentUser());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Quick action modal auto-open flags
  const [autoOpenBook, setAutoOpenBook] = useState(false);
  const [autoOpenOffer, setAutoOpenOffer] = useState(false);

  // App Data states
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [members, setMembers] = useState([]);
  const [settings, setSettings] = useState({ currency_symbol: '₹' });
  const [loadingData, setLoadingData] = useState(false);

  // Login Form states (for standalone admin login)
  const [loginEmail, setLoginEmail] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('Hussain@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Load all admin data from real database
  const loadData = async () => {
    try {
      setLoadingData(true);
      const [statsRes, booksRes, catsRes, ordersRes, membersRes, settingsRes] = await Promise.allSettled([
        api.getStats(),
        api.getBooks(),
        api.getCategories(),
        api.getOrders(),
        api.getMembers(),
        api.getSettings()
      ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value);
      if (booksRes.status === 'fulfilled') setBooks(booksRes.value || []);
      if (catsRes.status === 'fulfilled') setCategories(catsRes.value || []);
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value || []);
      if (membersRes.status === 'fulfilled') setMembers(membersRes.value || []);
      if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value || { currency_symbol: '₹' });
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  // Verify token on mount or load data
  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      api.getMe()
        .then((res) => {
          if (res?.user && res.user.role === 'admin') {
            setUser(res.user);
            setCurrentUser(res.user);
            loadData();
          } else {
            setUser(null);
            setCurrentUser(null);
          }
        })
        .catch(() => {
          // Token expired or invalid
          setUser(null);
          setCurrentUser(null);
        });
    }
  }, []);

  // Keyboard shortcut Ctrl + K for Spotlight Search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle Admin Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoggingIn(true);

    try {
      const res = await api.login({
        username: loginEmail.trim(),
        email: loginEmail.trim(),
        password: loginPassword
      });
      if (res?.user && res.user.role === 'admin') {
        setAuthToken(res.token);
        setCurrentUser(res.user);
        setUser(res.user);
        await loadData();
      } else {
        setLoginError('Access denied: You must be an administrator to access the Admin Panel.');
        setAuthToken(null);
        setCurrentUser(null);
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoggingIn(false);
    }
  };

  // Handle Admin Logout
  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setUser(null);
    setActiveTab('dashboard');
  };

  // -------------------------------------------------------------
  // Unauthenticated Admin Login Screen
  // -------------------------------------------------------------
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#120824] via-[#1a0e33] to-[#0d0517] flex flex-col justify-between text-white relative overflow-hidden select-none">
        <Analytics />
        {/* Ambient background glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#D9A441]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Navbar */}
        <header className="px-6 py-5 flex items-center justify-between border-b border-white/5 relative z-10">
          <div className="flex items-center gap-3">
            <img
              src="/logo.jpg"
              alt="Hussain Library Logo"
              className="h-10 w-auto rounded-lg bg-white p-1 shadow-md"
            />
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">
                HUSSAIN LIBRARY
              </span>
              <span className="text-[10px] font-serif italic text-purple-200/70">
                Knowledge Beyond Pages
              </span>
            </div>
          </div>

          <a
            href="http://localhost:3000"
            className="flex items-center gap-1.5 text-xs text-purple-200/80 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-xl border border-white/10"
          >
            <span>Visit Bookstore (Port 3000)</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </header>

        {/* Center Login Box */}
        <main className="flex-1 flex items-center justify-center p-4 relative z-10">
          <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-[11px] font-semibold text-purple-200 mb-6">
              <Shield className="w-3.5 h-3.5 text-purple-300" />
              <span>Dedicated Admin Portal • Port 3010</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2">
              Administrator Access
            </h2>
            <p className="text-xs text-purple-200/70 mb-8 leading-relaxed">
              Sign in with your verified administrator credentials to manage books, orders, inventory, and customer activity.
            </p>

            {loginError && (
              <div className="mb-6 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-start gap-2.5 text-rose-200 text-xs animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-purple-200/90 mb-1.5">
                  Username or Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="admin or abdulmalequeaby@gmail.com"
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/15 rounded-2xl text-white placeholder-purple-300/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-purple-200/90 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-purple-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full pl-10 pr-10 py-3 bg-white/10 border border-white/15 rounded-2xl text-white placeholder-purple-300/40 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loggingIn}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white rounded-2xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {loggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Admin Panel</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-between text-[11px] text-purple-300/60">
              <span>Security: Argon2id + JWT</span>
              <span>Port: 3010 (Standalone)</span>
            </div>
          </div>
        </main>

        {/* Skyline Footer at bottom of login */}
        <div className="relative h-24 overflow-hidden pointer-events-none">
          <svg
            className="absolute bottom-0 w-full h-20 text-[#D9A441]/20 fill-current"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <circle cx="950" cy="20" r="14" fill="#FDE047" opacity="0.5" />
            <circle cx="955" cy="18" r="13" fill="#0d0517" />
            <path d="M 0 120 L 0 90 L 120 90 L 140 60 L 160 90 L 300 90 L 340 40 Q 400 10 460 40 L 500 90 L 700 90 L 730 50 Q 800 20 870 50 L 900 90 L 1200 90 L 1200 120 Z" />
          </svg>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Authenticated Admin Portal
  // -------------------------------------------------------------
  const currencySymbol = settings?.currency_symbol || '₹';

  // Quick Spotlight filter
  const filteredBooks = searchQuery
    ? books.filter(b => b.title?.toLowerCase().includes(searchQuery.toLowerCase()) || b.author?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];
  const filteredOrders = searchQuery
    ? orders.filter(o => o.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) || o.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="min-h-screen bg-[#F5F3FF] flex font-sans antialiased text-slate-800">
      <Analytics />
      
      {/* Deep Royal Purple Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        stats={stats}
      />

      {/* Main Content Area (offset left by sidebar width 64 = 16rem on large screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all">
        
        {/* Top Header */}
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenSearch={() => setSearchOpen(true)}
        />

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              stats={stats}
              books={books}
              orders={orders}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenAddBook={() => {
                setAutoOpenBook(true);
                setActiveTab('books');
              }}
              onOpenAddCategory={() => setActiveTab('categories')}
              onOpenCreateOffer={() => {
                setAutoOpenOffer(true);
                setActiveTab('offers');
              }}
              currencySymbol={currencySymbol}
            />
          )}

          {activeTab === 'books' && (
            <BooksView
              books={books}
              categories={categories}
              refreshBooks={loadData}
              currencySymbol={currencySymbol}
              autoOpenAdd={autoOpenBook}
              onClearAutoOpen={() => setAutoOpenBook(false)}
            />
          )}

          {activeTab === 'categories' && (
            <CategoriesView
              categories={categories}
              books={books}
              refreshCategories={loadData}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={orders}
              refreshOrders={loadData}
              currencySymbol={currencySymbol}
            />
          )}

          {activeTab === 'customers' && (
            <CustomersView
              members={members}
              orders={orders}
              refreshMembers={loadData}
            />
          )}

          {activeTab === 'offers' && (
            <OffersView
              currencySymbol={currencySymbol}
              autoOpenCreate={autoOpenOffer}
              onClearAutoOpen={() => setAutoOpenOffer(false)}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              stats={stats}
              currencySymbol={currencySymbol}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView />
          )}

          {activeTab === 'admin-users' && (
            <AdminUsersView
              currentUser={currentUser}
            />
          )}

          {activeTab === 'activity-logs' && (
            <ActivityLogsView />
          )}
        </main>
      </div>

      {/* -------------------------------------------------------------
          Spotlight Global Search Modal (Ctrl + K)
         ------------------------------------------------------------- */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 animate-in fade-in">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Input Bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-purple-600 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                placeholder="Search books, orders, customers, or jump to section..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-hidden"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Results / Navigation Shortcuts */}
            <div className="overflow-y-auto p-4 space-y-4">
              {!searchQuery ? (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Quick Navigation
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
                      { id: 'books', label: 'Books Catalog', icon: BookOpen },
                      { id: 'categories', label: 'Categories', icon: Tag },
                      { id: 'orders', label: 'Orders Management', icon: ShoppingCart },
                      { id: 'customers', label: 'Customers', icon: Users },
                      { id: 'offers', label: 'Offers & Combos', icon: Tag },
                      { id: 'reports', label: 'Reports & Export', icon: BarChart3 },
                      { id: 'settings', label: 'Settings', icon: Settings },
                      { id: 'activity-logs', label: 'Activity Logs', icon: Clock }
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setSearchOpen(false);
                          }}
                          className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-purple-50 hover:text-purple-700 text-xs font-semibold text-slate-600 transition-colors text-left"
                        >
                          <Icon className="w-4 h-4 text-purple-600" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Matching Books */}
                  {filteredBooks.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Books ({filteredBooks.length})
                      </p>
                      <div className="space-y-1.5">
                        {filteredBooks.slice(0, 4).map((b) => (
                          <div
                            key={b.id}
                            onClick={() => {
                              setActiveTab('books');
                              setSearchOpen(false);
                            }}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <BookOpen className="w-4 h-4 text-purple-600" />
                              <div>
                                <p className="text-xs font-bold text-slate-800">{b.title}</p>
                                <p className="text-[10px] text-slate-400">{b.author} • {b.category}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-purple-700">{currencySymbol}{b.price || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Matching Orders */}
                  {filteredOrders.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Orders ({filteredOrders.length})
                      </p>
                      <div className="space-y-1.5">
                        {filteredOrders.slice(0, 4).map((o) => (
                          <div
                            key={o.id}
                            onClick={() => {
                              setActiveTab('orders');
                              setSearchOpen(false);
                            }}
                            className="flex items-center justify-between p-2.5 rounded-xl hover:bg-purple-50 cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <ShoppingCart className="w-4 h-4 text-purple-600" />
                              <div>
                                <p className="text-xs font-bold text-slate-800">{o.order_number}</p>
                                <p className="text-[10px] text-slate-400">{o.customer_name} • {o.items?.length || 1} items</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-purple-700">{currencySymbol}{o.total_amount || 0}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredBooks.length === 0 && filteredOrders.length === 0 && (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No matching records found for "{searchQuery}".
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Press <kbd className="font-mono bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[10px]">Esc</kbd> to exit</span>
              <span>Hussain Library Admin</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
