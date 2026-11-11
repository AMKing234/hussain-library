import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import CatalogView from './components/CatalogView';
import DigitalReaderView from './components/DigitalReaderView';
import PhysicalStacksView from './components/PhysicalStacksView';
import CustomerAuthModal from './components/CustomerAuthModal';
import ReservationModal from './components/ReservationModal';
import BookDetailModal from './components/BookDetailModal';
import ShelfTagModal from './components/ShelfTagModal';
import SpotlightSearch from './components/SpotlightSearch';
import CartModal from './components/CartModal';
import OffersModal from './components/OffersModal';
import ContactModal from './components/ContactModal';
import RequestBookModal from './components/RequestBookModal';
import WishlistModal from './components/WishlistModal';
import CustomerProfileModal from './components/CustomerProfileModal';
import { Home, BookOpen, Layers, Tag, User, BookPlus, Sun, Moon } from 'lucide-react';

import {
  api,
  getCurrentUser,
  setCurrentUser,
  setAuthToken
} from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('catalog');
  const [systemStatus, setSystemStatus] = useState(null);
  const [currentUser, setCurrentUserState] = useState(getCurrentUser());
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Theme state (light / dark)
  const [theme, setTheme] = useState(() => localStorage.getItem('hl_theme') || 'light');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('hl_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  // Search & Filter state for catalog
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);

  // Spotlight search state
  const [spotlightOpen, setSpotlightOpen] = useState(false);

  // Digital Reader active book
  const [activeReaderBook, setActiveReaderBook] = useState(null);

  // Customer Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Wishlist & Profile modal state
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Modals state
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // Bagisto-style Shopping Cart & Wishlist state
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hl_cart') || '[]');
    } catch {
      return [];
    }
  });
  const [cartModalOpen, setCartModalOpen] = useState(false);

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hl_wishlist') || '[]');
    } catch {
      return [];
    }
  });

  const handleAddToCart = (book, selectedType = null) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === book.id);
      let updated;
      if (exists) {
        updated = prev;
      } else {
        updated = [...prev, { ...book, selectedType: selectedType || book.type }];
      }
      localStorage.setItem('hl_cart', JSON.stringify(updated));
      return updated;
    });
    setCartModalOpen(true);
  };

  const handleRemoveFromCart = (bookId) => {
    setCart(prev => {
      const updated = prev.filter(item => item.id !== bookId);
      localStorage.setItem('hl_cart', JSON.stringify(updated));
      return updated;
    });
  };

  const handleClearCart = () => {
    setCart([]);
    localStorage.removeItem('hl_cart');
  };

  const handleToggleWishlist = (bookId) => {
    setWishlist(prev => {
      const exists = prev.includes(bookId);
      const updated = exists ? prev.filter(id => id !== bookId) : [...prev, bookId];
      localStorage.setItem('hl_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [preselectedLoanBook, setPreselectedLoanBook] = useState(null);

  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);

  const [reserveModalOpen, setReserveModalOpen] = useState(false);
  const [reservingBook, setReservingBook] = useState(null);

  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailBook, setDetailBook] = useState(null);

  const [shelfTagModalOpen, setShelfTagModalOpen] = useState(false);
  const [shelfTagBook, setShelfTagBook] = useState(null);
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [offersModalOpen, setOffersModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [requestBookModalOpen, setRequestBookModalOpen] = useState(false);

  // Load system status and books
  const loadSystemStatus = async () => {
    try {
      const status = await api.getSystemStatus();
      setSystemStatus(status);
    } catch (err) {
      console.error('System status error:', err);
    }
  };

  const loadBooks = async () => {
    try {
      setLoading(true);
      const [bookList, catList] = await Promise.all([
        api.getBooks(),
        api.getCategories()
      ]);
      setBooks(bookList || []);
      setCategories(catList || []);
    } catch (err) {
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMembers = async () => {
    if (!currentUser) return;
    try {
      const list = await api.getMembers();
      setMembers(list || []);
    } catch (err) {
      console.error('Error fetching members:', err);
    }
  };

  useEffect(() => {
    loadSystemStatus();
    loadBooks();
  }, []);

  // Global shortcut for Spotlight (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSpotlightOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (currentUser) {
      loadMembers();
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLoginSuccess = (token, user) => {
    setAuthToken(token);
    setCurrentUser(user);
    setCurrentUserState(user);
    loadMembers();
    loadBooks();
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    setCurrentUserState(null);
    setMembers([]);
    if (activeTab === 'admin') {
      setActiveTab('catalog');
    }
  };

  // Open Handlers
  const handleOpenDetail = (book) => {
    setDetailBook(book);
    setDetailModalOpen(true);
  };

  const handleOpenReader = (book) => {
    setActiveReaderBook(book);
    setActiveTab('reader');
  };

  const handleOpenReserve = (book) => {
    setReservingBook(book);
    setReserveModalOpen(true);
  };

  const handleOpenShelfTag = (book) => {
    setShelfTagBook(book);
    setShelfTagModalOpen(true);
  };

  const handleOpenBookModal = (book = null) => {
    setEditingBook(book);
    setBookModalOpen(true);
  };

  const handleOpenIssueModal = (book = null) => {
    setPreselectedLoanBook(book);
    setIssueModalOpen(true);
  };

  const handleOpenMemberModal = (member = null) => {
    setEditingMember(member);
    setMemberModalOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#0B0A1A] text-slate-900 dark:text-slate-100 selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        systemStatus={systemStatus}
        onOpenSpotlight={() => setSpotlightOpen(true)}
        cartCount={cart.length}
        onOpenCart={() => setCartModalOpen(true)}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setWishlistModalOpen(true)}
        categories={categories}
        onSelectCategory={(cat) => {
          setCategoryFilter(cat);
          setActiveTab('catalog');
        }}
        onOpenAbout={() => setAboutModalOpen(true)}
        onOpenOffers={() => setOffersModalOpen(true)}
        onOpenContact={() => setContactModalOpen(true)}
        onOpenRequestBook={() => setRequestBookModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-24 lg:pb-8">
        {activeTab === 'catalog' && (
          <CatalogView
            books={books}
            categories={categories}
            loading={loading}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            availableOnly={availableOnly}
            setAvailableOnly={setAvailableOnly}
            onOpenDetail={handleOpenDetail}
            onOpenReader={handleOpenReader}
            onOpenReserve={handleOpenReserve}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onOpenOffers={() => setOffersModalOpen(true)}
            onOpenRequestBook={() => setRequestBookModalOpen(true)}
          />
        )}

        {activeTab === 'reader' && (
          <DigitalReaderView
            books={books}
            activeBook={activeReaderBook}
            setActiveBook={setActiveReaderBook}
            onNavigateToCatalog={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'physical' && (
          <PhysicalStacksView
            books={books}
            onOpenDetail={handleOpenDetail}
            onOpenReserve={handleOpenReserve}
            onOpenShelfTag={handleOpenShelfTag}
            onNavigateToCatalog={() => setActiveTab('catalog')}
          />
        )}
      </main>

      {/* Minimal Footer on non-catalog views */}
      {activeTab !== 'catalog' && (
        <footer className="bg-white dark:bg-[#131127] border-t border-slate-200/80 dark:border-purple-900/30 py-6 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-medium text-slate-700 dark:text-slate-300">
              <span>📚 Hussain Library</span>
              <span>•</span>
              <span className="text-slate-400 dark:text-slate-500">Digital & Physical Repository</span>
            </div>
            <div className="text-slate-400">
              Clean Initial State (Zero Demo Data) • Running on Local Node.js
            </div>
          </div>
        </footer>
      )}

      {/* Modals */}
      {detailModalOpen && (
        <BookDetailModal
          book={detailBook}
          onClose={() => setDetailModalOpen(false)}
          onOpenReader={handleOpenReader}
          onOpenReserve={handleOpenReserve}
          onOpenShelfTag={handleOpenShelfTag}
          onReviewSubmitted={loadBooks}
          onAddToCart={handleAddToCart}
        />
      )}

      <CartModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        cart={cart}
        onRemoveFromCart={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onOrderCompleted={loadBooks}
      />

      {shelfTagModalOpen && (
        <ShelfTagModal
          book={shelfTagBook}
          onClose={() => setShelfTagModalOpen(false)}
        />
      )}

      <SpotlightSearch
        isOpen={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        books={books}
        onSelectBook={handleOpenDetail}
      />

      {reserveModalOpen && (
        <ReservationModal
          book={reservingBook}
          onClose={() => setReserveModalOpen(false)}
          onSuccess={() => {}}
        />
      )}

      {/* About Modal matching Brand */}
      {aboutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#131127] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-purple-900/30 relative">
            <button
              onClick={() => setAboutModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-purple-950/40 transition-colors"
            >
              ✕
            </button>
            <div className="text-center mb-6">
              <img src="/logo.jpg" alt="Hussain Library" className="h-16 w-auto mx-auto mb-3 object-contain" />
              <h3 className="text-2xl font-black text-[#1a2744] dark:text-white">Hussain Library</h3>
              <p className="text-sm font-serif italic text-slate-600 dark:text-slate-400 mt-0.5">— Knowledge Beyond Pages —</p>
            </div>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <p>
                Welcome to <strong>Hussain Library</strong>, your premier repository for both rare physical volumes and instant digital publications.
              </p>
              <div className="bg-slate-50 dark:bg-purple-950/40 p-4 rounded-2xl border border-slate-200/60 dark:border-purple-900/30 space-y-2 text-xs">
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Chief Administrator:</span><span className="font-semibold text-slate-800 dark:text-slate-200">ABDUL MALEQUE</span></div>
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Official Contact:</span><span className="font-semibold text-slate-800 dark:text-slate-200">abdulmalequeaby@gmail.com</span></div>
                <div className="flex justify-between"><span className="text-slate-500 dark:text-slate-400">Security Architecture:</span><span className="font-semibold text-emerald-600 dark:text-emerald-400">ECC & R.E.A Hardened</span></div>
              </div>
            </div>
            <button
              onClick={() => setAboutModalOpen(false)}
              className="mt-6 w-full py-2.5 bg-[#17143D] hover:bg-[#251f5c] text-white rounded-xl font-medium text-sm transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Offers Modal */}
      <OffersModal
        isOpen={offersModalOpen}
        onClose={() => setOffersModalOpen(false)}
        onBrowseCatalog={() => {
          setActiveTab('catalog');
          const el = document.getElementById('catalog-search-bar');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
      />

      {/* Request Book Modal */}
      <RequestBookModal
        isOpen={requestBookModalOpen}
        onClose={() => setRequestBookModalOpen(false)}
      />

      {/* Customer Auth Modal (Login / Register) */}
      <CustomerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUserState(user);
        }}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={wishlistModalOpen}
        onClose={() => setWishlistModalOpen(false)}
        wishlistIds={wishlist}
        books={books}
        onAddToCart={handleAddToCart}
        onRemoveFromWishlist={handleToggleWishlist}
      />

      {/* Customer Profile Modal */}
      <CustomerProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Mobile Bottom Navigation Bar (Fixed, Touch-friendly, Safe-Area aware) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#131127]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-purple-900/30 shadow-2xl px-2 py-1.5 flex items-center justify-around text-[11px] font-medium transition-colors">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'catalog' ? 'text-[#17143D] dark:text-purple-300 font-bold bg-[#F2EDFF] dark:bg-purple-950/60' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </button>

        <button
          onClick={() => setActiveTab('reader')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'reader' ? 'text-[#17143D] dark:text-purple-300 font-bold bg-[#F2EDFF] dark:bg-purple-950/60' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-5 h-5" />
          <span>Reader</span>
        </button>

        <button
          onClick={() => setActiveTab('physical')}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'physical' ? 'text-[#17143D] dark:text-purple-300 font-bold bg-[#F2EDFF] dark:bg-purple-950/60' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Stacks</span>
        </button>

        <button
          onClick={toggleTheme}
          className="flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-[#17143D] dark:hover:text-purple-300 transition-all cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-[#D9A441]" /> : <Moon className="w-5 h-5 text-purple-700" />}
          <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
        </button>

        <button
          onClick={() => {
            if (currentUser) setProfileModalOpen(true);
            else setAuthModalOpen(true);
          }}
          className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
            currentUser ? 'text-purple-700 dark:text-purple-300 font-bold bg-[#F2EDFF] dark:bg-purple-950/60' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <User className="w-5 h-5 text-[#D9A441]" />
          <span>{currentUser ? (currentUser.name ? currentUser.name.split(' ')[0] : 'Account') : 'Sign In'}</span>
        </button>
      </nav>

    </div>
  );
}
