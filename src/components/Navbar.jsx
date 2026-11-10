import React, { useState } from 'react';
import {
  Home,
  BookOpen,
  LayoutGrid,
  Tag,
  BookPlus,
  Info,
  Mail,
  Search,
  ShoppingBag,
  User,
  Shield,
  LogOut,
  ChevronDown,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  systemStatus,
  onOpenSpotlight,
  cartCount = 0,
  onOpenCart,
  categories = [],
  onSelectCategory,
  onOpenAbout,
  onOpenOffers,
  onOpenContact,
  onOpenRequestBook,
  onScrollToSection
}) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    setMobileMenuOpen(false);
    if (activeTab !== 'catalog') {
      setActiveTab('catalog');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 text-slate-800 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Left Side — Mobile Menu Toggle & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-[#17143D] hover:bg-slate-100 transition-colors"
              title="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div 
              onClick={() => handleNavClick('section-hero')} 
              className="flex items-center gap-2 sm:gap-3 cursor-pointer group py-1 flex-shrink-0"
            >
              <img
                src="/logo.jpg"
                alt="Hussain Library — Knowledge Beyond Pages"
                className="h-10 sm:h-14 w-auto max-w-[130px] sm:max-w-none object-contain group-hover:scale-102 transition-transform duration-200"
              />
            </div>
          </div>

          {/* Center — Navigation Menu (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1.5 text-sm font-medium">
            <button
              onClick={() => handleNavClick('section-hero')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all cursor-pointer ${
                activeTab === 'catalog'
                  ? 'bg-[#17143D] text-white font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-[#17143D] hover:bg-[#F2EDFF]/60'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => handleNavClick('section-books')}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-600 hover:text-[#17143D] hover:bg-[#F2EDFF]/60 transition-all cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Books</span>
            </button>

            {/* Categories Section Button & Dropdown */}
            <div className="relative">
              <button
                onClick={() => handleNavClick('section-categories')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-slate-600 hover:text-[#17143D] hover:bg-[#F2EDFF]/60 transition-all cursor-pointer"
              >
                <LayoutGrid className="w-4 h-4" />
                <span>Categories</span>
              </button>
            </div>

            <button
              onClick={() => handleNavClick('section-combos')}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-600 hover:text-[#17143D] hover:bg-[#F2EDFF]/60 transition-all cursor-pointer"
            >
              <Tag className="w-4 h-4" />
              <span>Combo Packs</span>
            </button>

            <button
              onClick={() => {
                if (onOpenRequestBook) onOpenRequestBook();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-slate-600 hover:text-[#17143D] hover:bg-[#F2EDFF]/60 transition-all cursor-pointer"
              title="Request a book not in catalog"
            >
              <BookPlus className="w-4 h-4 text-[#D9A441]" />
              <span>Request Book</span>
            </button>

            <button
              onClick={() => {
                if (onOpenAbout) onOpenAbout();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-600 hover:text-[#17143D] hover:bg-[#F2EDFF]/60 transition-all cursor-pointer"
            >
              <Info className="w-4 h-4" />
              <span>About</span>
            </button>

            <button
              onClick={() => {
                if (onOpenContact) onOpenContact();
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-600 hover:text-[#17143D] hover:bg-[#F2EDFF]/60 transition-all cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </button>
          </nav>

          {/* Right Side — Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            {/* Search Icon Button */}
            <button
              onClick={onOpenSpotlight}
              title="Search Books (Ctrl + K)"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-[#17143D] hover:bg-[#F2EDFF] transition-all cursor-pointer"
            >
              <Search className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
            </button>

            {/* Shopping Cart Icon with Quantity Badge */}
            <button
              onClick={onOpenCart}
              title="View Cart"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-[#17143D] hover:bg-[#F2EDFF] transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
              <span className="absolute top-0.5 right-0.5 bg-[#E11D48] text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            </button>

            {/* Standalone Admin Portal Button (Port 3010) */}
            <a
              href="http://localhost:3010"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs bg-[#17143D] hover:bg-[#251f5c] text-white cursor-pointer"
              title="Open Dedicated Admin Panel on Port 3010"
            >
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D9A441]" />
              <span className="hidden sm:inline">Admin Portal</span>
              <span className="sm:hidden text-[11px]">Admin</span>
            </a>

            {currentUser && (
              <button
                onClick={onLogout}
                title="Sign out"
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top-2">
          <button
            onClick={() => handleNavClick('section-hero')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#F2EDFF] hover:text-[#17143D]"
          >
            <Home className="w-4 h-4 text-purple-600" />
            <span>Home</span>
          </button>

          <button
            onClick={() => handleNavClick('section-books')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#F2EDFF] hover:text-[#17143D]"
          >
            <BookOpen className="w-4 h-4 text-purple-600" />
            <span>Books Catalog</span>
          </button>

          <button
            onClick={() => handleNavClick('section-categories')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#F2EDFF] hover:text-[#17143D]"
          >
            <LayoutGrid className="w-4 h-4 text-purple-600" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => handleNavClick('section-combos')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#F2EDFF] hover:text-[#17143D]"
          >
            <Tag className="w-4 h-4 text-purple-600" />
            <span>Combo Packs & Custom Bundles</span>
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              if (onOpenRequestBook) onOpenRequestBook();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#17143D] bg-purple-50 hover:bg-purple-100"
          >
            <BookPlus className="w-4 h-4 text-[#D9A441]" />
            <span>Request a Book</span>
          </button>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenAbout) onOpenAbout();
              }}
              className="py-1 px-2 hover:text-[#17143D]"
            >
              About
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenContact) onOpenContact();
              }}
              className="py-1 px-2 hover:text-[#17143D]"
            >
              Contact
            </button>
            <a
              href="http://localhost:3010"
              target="_blank"
              rel="noreferrer"
              className="py-1 px-2 text-purple-700 font-bold flex items-center gap-1"
            >
              <span>Admin (3010)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
