import React, { useState } from 'react';
import {
  Search,
  Filter,
  Book,
  BookOpen,
  Layers,
  MapPin,
  Download,
  Eye,
  Calendar,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  PlusCircle,
  Sparkles,
  Star,
  ShoppingBag,
  Heart,
  Tag,
  ArrowRight,
  BookPlus,
  Mail,
  Send,
  Award,
  Check,
  ExternalLink,
  MessageSquare,
  LayoutGrid
} from 'lucide-react';
import { api } from '../api';
import CustomComboBuilder from './CustomComboBuilder';

export default function CatalogView({
  books = [],
  categories = [],
  loading = false,
  searchTerm = '',
  setSearchTerm,
  typeFilter = 'all',
  setTypeFilter,
  categoryFilter = 'all',
  setCategoryFilter,
  availableOnly = false,
  setAvailableOnly,
  onOpenDetail,
  onOpenReader,
  onOpenReserve,
  onAddToCart,
  wishlist = [],
  onToggleWishlist,
  onOpenOffers,
  onOpenRequestBook
}) {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState({ type: '', message: '' });
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) {
      setNewsletterStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }
    setSubscribing(true);
    setNewsletterStatus({ type: '', message: '' });
    try {
      const res = await api.subscribeNewsletter(newsletterEmail.trim());
      setNewsletterStatus({ type: 'success', message: res.message || 'Thank you for subscribing to Hussain Library!' });
      setNewsletterEmail('');
    } catch (err) {
      setNewsletterStatus({ type: 'error', message: err.message || 'Subscription failed.' });
    } finally {
      setSubscribing(false);
    }
  };
  const filteredBooks = books.filter((book) => {
    // Search match
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = book.title?.toLowerCase().includes(q);
      const matchAuthor = book.author?.toLowerCase().includes(q);
      const matchIsbn = book.isbn?.toLowerCase().includes(q);
      const matchDesc = book.description?.toLowerCase().includes(q);
      const matchShelf = book.shelf_location?.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchIsbn && !matchDesc && !matchShelf) {
        return false;
      }
    }

    // Type filter
    if (typeFilter === 'digital') {
      if (book.type !== 'digital' && book.type !== 'both') return false;
    } else if (typeFilter === 'physical') {
      if (book.type !== 'physical' && book.type !== 'both') return false;
    }

    // Category filter
    if (categoryFilter !== 'all') {
      if (book.category !== categoryFilter) return false;
    }

    // Available only filter
    if (availableOnly) {
      if (book.type === 'physical' || book.type === 'both') {
        if ((book.available_copies || 0) <= 0) return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Premium Hero Section matching Exact Reference Image */}
      <section id="section-hero" className="bg-gradient-to-br from-[#FAF8FC] via-[#FFFFFF] to-[#F2EDFF]/40 rounded-3xl p-5 sm:p-8 lg:p-12 border border-slate-200/80 shadow-xs relative overflow-hidden scroll-mt-24">
        
        {/* Ambient background glow accents */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#F2EDFF] rounded-full blur-3xl pointer-events-none opacity-60"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#D9A441]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Content Area */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-5">
            
            {/* Badge: "Digital Book Library" */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F2EDFF] text-[#33216B] text-xs font-semibold border border-[#d8cbf5] shadow-2xs">
              <BookOpen className="w-3.5 h-3.5 text-[#33216B]" />
              <span>Digital Book Library</span>
            </div>

            {/* Main Heading: "Hussain Library" */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#17143D] leading-tight sm:leading-[1.08] font-sans">
              Hussain Library
            </h1>

            {/* Tagline: "Knowledge Beyond Pages" */}
            <div className="flex items-center gap-3 my-1">
              <span className="h-[2px] w-10 sm:w-16 bg-[#17143D]/70 rounded-full"></span>
              <span className="text-xl sm:text-2xl lg:text-3xl font-serif italic text-[#17143D] font-medium tracking-wide">
                Knowledge Beyond Pages
              </span>
              <span className="h-[2px] w-10 sm:w-16 bg-[#17143D]/70 rounded-full"></span>
            </div>

            {/* Description */}
            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-xl">
              Explore a wide collection of eBooks, study materials, academic resources and rare books. Read, learn and grow — anytime, anywhere.
            </p>

            {/* Feature Highlights: 4 Interactive Feature Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pt-1">
              {/* Card 1: E-Books (PDF) */}
              <div
                onClick={() => {
                  setTypeFilter('digital');
                  const el = document.getElementById('section-books');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-xs hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 transition-all flex flex-col items-center text-center gap-1.5 sm:gap-2 group cursor-pointer"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F2EDFF] text-[#33216B] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#17143D]">E-Books</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">(PDF)</div>
                </div>
              </div>

              {/* Card 2: Book Combos */}
              <div
                onClick={() => {
                  const el = document.getElementById('section-combos');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-xs hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 transition-all flex flex-col items-center text-center gap-1.5 sm:gap-2 group cursor-pointer"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F2EDFF] text-[#33216B] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Layers className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#17143D]">Book</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Combos</div>
                </div>
              </div>

              {/* Card 3: Secure Access */}
              <div
                onClick={() => {
                  const el = document.getElementById('section-books');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-xs hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 transition-all flex flex-col items-center text-center gap-1.5 sm:gap-2 group cursor-pointer"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F2EDFF] text-[#33216B] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#17143D]">Secure</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Access</div>
                </div>
              </div>

              {/* Card 4: Instant Download */}
              <div
                onClick={() => {
                  setTypeFilter('digital');
                  const el = document.getElementById('section-books');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white rounded-2xl p-3.5 sm:p-4 border border-slate-100 shadow-xs hover:shadow-md hover:border-purple-200 hover:-translate-y-0.5 transition-all flex flex-col items-center text-center gap-1.5 sm:gap-2 group cursor-pointer"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F2EDFF] text-[#33216B] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Download className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-[#17143D]">Instant</div>
                  <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium">Download</div>
                </div>
              </div>
            </div>

            {/* Call-to-Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              {/* Primary Button: Browse Books */}
              <button
                onClick={() => {
                  const el = document.getElementById('section-books');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto justify-center bg-[#17143D] hover:bg-[#251f5c] text-white font-semibold text-sm px-7 py-3.5 rounded-xl flex items-center gap-2.5 shadow-md shadow-[#17143D]/20 hover:shadow-lg transition-all cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[#D9A441]" />
                <span>Browse Books →</span>
              </button>

              {/* Secondary Button: Combo Packs */}
              <button
                onClick={() => {
                  const el = document.getElementById('section-combos');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto justify-center bg-white hover:bg-slate-50 text-[#17143D] border-2 border-[#17143D] font-semibold text-sm px-6 py-3.5 rounded-xl flex items-center gap-2 shadow-2xs transition-all cursor-pointer"
              >
                <Tag className="w-4 h-4 text-[#33216B]" />
                <span>Combo Packs & Bundles</span>
              </button>
            </div>

          </div>

          {/* Right Side — Dedicated Cinematic Visual (No nested website preview!) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md lg:max-w-none aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden shadow-xl border-4 border-white/95 group">
              <img
                src="/hero-illustration.webp"
                alt="Hussain Library Classical Repository and Reading Atmosphere"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17143D]/20 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>

        </div>
      </section>

      {/* Books Catalog Section Header & Search Bar */}
      <div id="section-books" className="scroll-mt-24 space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2EDFF] text-[#33216B] text-xs font-semibold mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Library Catalog</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#17143D] tracking-tight">
              Browse Books & Publications
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500">
            {filteredBooks.length} of {books.length} volumes shown
          </span>
        </div>

        {/* Search Bar */}
        <div id="catalog-search-bar" className="relative flex items-center">
        <Search className="absolute left-4 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title, author, category, ISBN, or shelf location..."
          className="w-full pl-12 pr-20 py-3.5 rounded-2xl bg-white text-slate-900 placeholder-slate-400 border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-[#17143D] text-sm shadow-xs transition-all"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-4 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Filter and Control Bar (Touch-friendly & Responsive) */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-xs border border-slate-200/80 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
        
        {/* Type Filter Chips (Horizontal swipe on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 md:pb-0 text-xs">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-[#17143D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Collections ({books.length})
          </button>
          <button
            onClick={() => setTypeFilter('digital')}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              typeFilter === 'digital'
                ? 'bg-[#33216B] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Digital Books ({books.filter(b => b.type === 'digital' || b.type === 'both').length})
          </button>
          <button
            onClick={() => setTypeFilter('physical')}
            className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap flex items-center gap-1.5 transition-all cursor-pointer ${
              typeFilter === 'physical'
                ? 'bg-[#D9A441] text-slate-950 font-bold shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Physical Stacks ({books.filter(b => b.type === 'physical' || b.type === 'both').length})
          </button>
        </div>

        {/* Category & Availability Dropdowns */}
        <div className="flex items-center gap-3 justify-between sm:justify-end flex-wrap sm:flex-nowrap pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          {/* Category Filter */}
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#17143D] font-medium cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Available copies toggle */}
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="rounded text-[#17143D] focus:ring-[#17143D] border-slate-300"
            />
            <span className="font-medium">In-Stock Only</span>
          </label>
        </div>

      </div>

      {/* Books Display */}
      {loading ? (
        <div className="py-12 sm:py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-[#17143D] border-t-transparent"></div>
          <p className="mt-3 text-xs sm:text-sm text-slate-500 font-medium">Connecting to library catalog...</p>
        </div>
      ) : filteredBooks.length === 0 ? (
        /* Compact, Premium Empty State matching Phase 8 */
        <div className="bg-gradient-to-b from-white to-[#FAF8FC] rounded-3xl p-6 sm:p-10 text-center border border-slate-200/80 shadow-xs max-w-lg mx-auto my-6">
          <div className="w-14 h-14 rounded-2xl bg-[#F2EDFF] text-[#33216B] flex items-center justify-center mx-auto mb-3 shadow-2xs">
            <BookOpen className="w-7 h-7 text-[#33216B]" />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-[#17143D] mb-1.5">
            {books.length === 0 ? 'Welcome to Hussain Library' : 'No Matching Titles Found'}
          </h3>

          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto mb-4 leading-relaxed">
            {books.length === 0
              ? 'Our catalog is currently in active curation by the administrator. Physical editions and digital publications will appear here as soon as they are added.'
              : 'No volumes matched your search or category filter. Try clearing your query to view the full library collection.'}
          </p>

          <div className="flex items-center justify-center gap-2.5 flex-wrap">
            {searchTerm || categoryFilter !== 'all' || typeFilter !== 'all' || availableOnly ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setCategoryFilter('all');
                  setTypeFilter('all');
                  setAvailableOnly(false);
                }}
                className="px-4 py-2 bg-[#17143D] text-white text-xs font-semibold rounded-xl hover:bg-[#251f5c] transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                onClick={() => {
                  if (onOpenOffers) onOpenOffers();
                }}
                className="px-4 py-2 bg-[#F2EDFF] text-[#33216B] border border-[#d8cbf5] text-xs font-semibold rounded-xl hover:bg-[#e8dffd] transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Explore Reading Privileges</span>
              </button>
            )}

            <button
              onClick={() => {
                if (onOpenRequestBook) onOpenRequestBook();
              }}
              className="px-4 py-2 bg-[#17143D] text-white text-xs font-semibold rounded-xl hover:bg-[#251f5c] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <BookPlus className="w-3.5 h-3.5 text-[#D9A441]" />
              <span>Request a Book</span>
            </button>
          </div>
        </div>
      ) : (
        /* Book Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map((book) => {
            const isDigital = book.type === 'digital' || book.type === 'both';
            const isPhysical = book.type === 'physical' || book.type === 'both';
            const coverSrc = book.cover_file
              ? `/uploads/covers/${book.cover_file}`
              : book.cover_url || null;
            const isAvailable = book.available_copies > 0;

            return (
              <div
                key={book.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group"
              >
                {/* Book Cover Area */}
                <div
                  onClick={() => onOpenDetail(book)}
                  className="relative h-48 sm:h-52 bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center overflow-hidden cursor-pointer"
                >
                  {coverSrc ? (
                    <img
                      src={coverSrc}
                      alt={book.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="p-4 text-center text-slate-300">
                      <Book className="w-10 h-10 text-amber-400 mx-auto mb-2 opacity-80 group-hover:scale-110 transition-transform" />
                      <div className="font-serif italic text-xs line-clamp-2 text-slate-200 px-2">
                        {book.title}
                      </div>
                    </div>
                  )}

                  {/* Badges on top */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {isDigital && (
                      <span className="text-[10px] font-bold bg-indigo-900/90 text-indigo-200 backdrop-blur-md px-2 py-0.5 rounded-md border border-indigo-400/30 flex items-center gap-1 shadow-sm">
                        <BookOpen className="w-3 h-3 text-indigo-300" /> Digital
                      </span>
                    )}
                    {isPhysical && (
                      <span className="text-[10px] font-bold bg-amber-900/90 text-amber-200 backdrop-blur-md px-2 py-0.5 rounded-md border border-amber-400/30 flex items-center gap-1 shadow-sm">
                        <Layers className="w-3 h-3 text-amber-300" /> Physical
                      </span>
                    )}
                  </div>

                  {/* Wishlist Heart Button (Bagisto style) */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(book.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white backdrop-blur-sm transition-colors"
                    title={wishlist.includes(book.id) ? "Remove from Wishlist" : "Save to Wishlist"}
                  >
                    <Heart className={`w-3.5 h-3.5 ${wishlist.includes(book.id) ? 'fill-red-500 text-red-500' : 'text-slate-300'}`} />
                  </button>

                  {/* Category Pill & Rating */}
                  <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
                    {book.average_rating && (
                      <span className="text-[10px] font-bold bg-amber-500 text-slate-950 backdrop-blur-md px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-sm">
                        <Star className="w-2.5 h-2.5 fill-slate-950" />
                        <span>{book.average_rating}</span>
                      </span>
                    )}
                    <span className="text-[10px] font-semibold bg-slate-900/80 text-white backdrop-blur-md px-2 py-0.5 rounded-md border border-slate-700/80">
                      {book.category || 'General'}
                    </span>
                  </div>
                </div>

                {/* Body Details */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3
                      onClick={() => onOpenDetail(book)}
                      className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors cursor-pointer"
                      title={book.title}
                    >
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                      by {book.author}
                    </p>

                    {/* Physical shelf information */}
                    {isPhysical && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-600 flex-shrink-0" />
                          <span className="font-mono text-slate-700 font-medium truncate max-w-[110px]" title={book.shelf_location || 'Main Stacks'}>
                            {book.shelf_location || 'Main Stacks'}
                          </span>
                        </span>

                        <span className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                          isAvailable ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                        }`}>
                          {isAvailable ? `${book.available_copies}/${book.total_copies} Avail` : 'Out of Stock'}
                        </span>
                      </div>
                    )}

                    {/* Digital details */}
                    {isDigital && (
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="uppercase font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded text-[10px]">
                          {book.file_format || 'PDF'}
                        </span>
                        <span>{book.read_count || 0} reads</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => onOpenDetail(book)}
                      title="View details"
                      className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Details</span>
                    </button>

                    {onAddToCart && (
                      <button
                        onClick={() => onAddToCart(book)}
                        title="Add to library cart"
                        className="py-1.5 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-colors border border-indigo-200"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>+ Cart</span>
                      </button>
                    )}

                    {isDigital && book.file_path && (
                      <button
                        onClick={() => onOpenReader(book)}
                        title="Read online now"
                        className="py-1.5 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1 shadow-sm transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Read</span>
                      </button>
                    )}

                    {isPhysical && (
                      <button
                        onClick={() => onOpenReserve(book)}
                        title="Reserve physical copy"
                        className="py-1.5 px-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1 shadow-sm transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Reserve</span>
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* ========================================================================= */}
      {/* 1. POPULAR CATEGORIES SECTION                                            */}
      {/* ========================================================================= */}
      <section id="section-categories" className="pt-8 sm:pt-12 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2EDFF] text-[#33216B] text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Curated Collections</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17143D] tracking-tight">
              Popular Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore volumes grouped by scholarship, discipline, and historical era.
            </p>
          </div>
          {categories.length > 0 && (
            <button
              onClick={() => {
                setCategoryFilter('all');
                const el = document.getElementById('section-books');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-bold text-[#33216B] hover:text-[#17143D] flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {categories.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center max-w-xl mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-[#F2EDFF] text-[#33216B] flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <LayoutGrid className="w-6 h-6 text-[#33216B]" />
            </div>
            <h3 className="text-base font-bold text-[#17143D] mb-1">No Categories Added Yet</h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Categories added by the administrator in the Admin Panel will be displayed here automatically.
            </p>
            <a
              href="http://localhost:3010"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#17143D] hover:bg-[#251f5c] text-white text-xs font-semibold rounded-xl shadow-xs transition-all"
            >
              <span>Open Admin Panel (Port 3010)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat, idx) => {
              const matchingCount = books.filter(b => b.category?.toLowerCase() === cat.toLowerCase()).length;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    setCategoryFilter(cat);
                    const el = document.getElementById('section-books');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-purple-300 transition-all duration-200 hover:-translate-y-1 hover:shadow-md cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-[#F2EDFF] text-[#33216B] shadow-2xs flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                      <LayoutGrid className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-[#17143D] leading-snug mb-1">
                      {cat}
                    </h3>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                    <span>{matchingCount} {matchingCount === 1 ? 'Volume' : 'Volumes'}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform text-[#33216B]" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 2. BOOK COMBO OFFERS & CUSTOM STUDY BUNDLES                              */}
      {/* ========================================================================= */}
      <section className="pt-8 sm:pt-12">
        <CustomComboBuilder
          books={books}
          currencySymbol="₹"
          onAddToCart={onAddToCart}
        />
      </section>

      {/* ========================================================================= */}
      {/* 3. REQUEST BOOK PROMINENT BANNER (Reader Acquisition)                   */}
      {/* ========================================================================= */}
      <section id="section-request-book" className="pt-8 sm:pt-10 scroll-mt-24">
        <div className="bg-gradient-to-r from-[#FAF8FC] via-[#F2EDFF] to-white rounded-3xl p-6 sm:p-8 border border-[#d8cbf5] flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#17143D] text-[#D9A441] flex items-center justify-center shadow-md flex-shrink-0">
              <BookPlus className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-[11px] font-bold text-[#33216B] uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-[#D9A441]" />
                <span>Custom Reader Acquisition</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#17143D]">
                Looking for a Specific Book or Rare Manuscript?
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-xl mt-1 leading-relaxed">
                If the volume you need is not yet in our catalog, submit a request. Our acquisitions team reviews every entry and procures copies for library members.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (onOpenRequestBook) onOpenRequestBook();
            }}
            className="w-full md:w-auto px-6 py-3.5 bg-[#17143D] hover:bg-[#251f5c] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2.5 shadow-md shadow-[#17143D]/15 transition-all whitespace-nowrap cursor-pointer flex-shrink-0"
          >
            <BookPlus className="w-4 h-4 text-[#D9A441]" />
            <span>Request a Book Now →</span>
          </button>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. NEWSLETTER SUBSCRIPTION SECTION                                       */}
      {/* ========================================================================= */}
      <section id="section-newsletter" className="pt-8 sm:pt-12 scroll-mt-24">
        <div className="bg-gradient-to-br from-[#FAF8FC] via-white to-[#F2EDFF]/60 rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xs text-center relative overflow-hidden">
          <div className="max-w-xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-[#F2EDFF] text-[#33216B] flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Mail className="w-6 h-6 text-[#33216B]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17143D] tracking-tight">
              Stay Informed with Hussain Library
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 mb-6 leading-relaxed">
              Subscribe to receive weekly catalog additions, rare manuscript highlights, study bundle discounts, and academic reading lists.
            </p>

            {newsletterStatus.message && (
              <div
                className={`p-3 rounded-2xl mb-4 text-xs font-medium flex items-center justify-center gap-2 ${
                  newsletterStatus.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {newsletterStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                )}
                <span>{newsletterStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row items-stretch gap-2.5 max-w-md mx-auto">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#17143D]"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-6 py-3 bg-[#17143D] hover:bg-[#251f5c] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#17143D]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-4 h-4 text-[#D9A441]" />
                <span>{subscribing ? 'Subscribing...' : 'Subscribe'}</span>
              </button>
            </form>

            <p className="text-[11px] text-slate-400 mt-3">
              We respect your inbox. Unsubscribe anytime with one click.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. PROFESSIONAL MULTI-COLUMN FOOTER                                      */}
      {/* ========================================================================= */}
      <footer className="mt-12 sm:mt-16 pt-10 pb-6 border-t border-slate-200 text-slate-600">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img src="/logo.jpg" alt="Hussain Library" className="h-10 w-auto object-contain" />
              <div>
                <div className="text-base font-extrabold text-[#17143D]">HUSSAIN LIBRARY</div>
                <div className="text-[10px] font-serif italic text-slate-500">Knowledge Beyond Pages</div>
              </div>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              A comprehensive hybrid repository dedicated to preserving classical Islamic heritage, academic research publications, and modern study literature.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>ECC & R.E.A Security Hardened</span>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div>
            <h4 className="text-xs font-bold text-[#17143D] uppercase tracking-wider mb-3">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('section-hero');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#17143D] transition-colors cursor-pointer"
                >
                  Home Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('section-books');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#17143D] transition-colors cursor-pointer"
                >
                  Books Catalog
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('section-categories');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#17143D] transition-colors cursor-pointer"
                >
                  Popular Categories
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    const el = document.getElementById('section-combos');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="hover:text-[#17143D] transition-colors cursor-pointer"
                >
                  Book Combo Packs & Bundles
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (onOpenRequestBook) onOpenRequestBook();
                  }}
                  className="hover:text-[#17143D] transition-colors cursor-pointer text-[#33216B] font-semibold flex items-center gap-1"
                >
                  <BookPlus className="w-3 h-3 text-[#D9A441]" />
                  <span>Request a Book</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Reader Services */}
          <div>
            <h4 className="text-xs font-bold text-[#17143D] uppercase tracking-wider mb-3">
              Reader Services
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-500">In-Browser PDF Reader</span>
              </li>
              <li>
                <span className="text-slate-500">Physical Copy Reservation</span>
              </li>
              <li>
                <span className="text-slate-500">Shelf QR & Call-Number System</span>
              </li>
              <li>
                <span className="text-slate-500">Member Borrowing Cards</span>
              </li>
              <li>
                <span className="text-slate-500">Inter-Library Loan & Requests</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Administrator & Custodian Info */}
          <div>
            <h4 className="text-xs font-bold text-[#17143D] uppercase tracking-wider mb-3">
              Administration & Custody
            </h4>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Chief Custodian</span>
                <span className="font-bold text-[#17143D]">ABDUL MALEQUE</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Official Inquiries</span>
                <a
                  href="mailto:abdulmalequeaby@gmail.com"
                  className="text-[#33216B] font-medium hover:underline break-all"
                >
                  abdulmalequeaby@gmail.com
                </a>
              </div>
              <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Repository Status</span>
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            © 2026 Hussain Library. All rights reserved. Knowledge Beyond Pages.
          </div>
          <div className="flex items-center gap-4">
            <span>Clean Zero-Demo Initial State</span>
            <span>•</span>
            <span>Secured via Argon2id & JWT</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
