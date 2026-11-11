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
  LogOut,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onOpenAuthModal,
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

            <button
              onClick={() => handleNavClick('section-categories')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-slate-600 hover:text-[#17143D] hover:bg-[#F2EDFF]/60 transition-all cursor-pointer"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Categories</span>
            </button>

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
              onClick={() => handleNavClick('section-about')}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-600 hover:text-[#17143D] hover:bg-[#F2EDFF]/60 transition-all cursor-pointer"
            >
              <Info className="w-4 h-4" />
              <span>About Library</span>
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

            {/* Customer Auth Button: Sign In / Register OR Logged In Profile */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F2EDFF] border border-purple-200/80 text-xs text-[#17143D] font-bold">
                  <div className="w-6 h-6 rounded-full bg-[#17143D] text-white flex items-center justify-center text-[11px] uppercase font-bold">
                    {(currentUser.name || currentUser.username || 'U')[0]}
                  </div>
                  <span className="hidden sm:inline max-w-[110px] truncate">
                    {currentUser.name || currentUser.username}
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign out"
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all shadow-xs bg-[#17143D] hover:bg-[#251f5c] text-white cursor-pointer"
                title="Customer Sign In / Register"
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D9A441]" />
                <span className="hidden sm:inline">Sign In / Register</span>
                <span className="sm:hidden text-[11px]">Sign In</span>
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
            <span>Combo Packs & Bundles</span>
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

          <button
            onClick={() => handleNavClick('section-about')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-[#F2EDFF] hover:text-[#17143D]"
          >
            <Info className="w-4 h-4 text-purple-600" />
            <span>About Hussain Library</span>
          </button>

          <div className="pt-2 border-t border-slate-100">
            {currentUser ? (
              <div className="flex items-center justify-between py-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>{currentUser.name || currentUser.username}</span>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1 text-red-600 font-bold px-2 py-1 rounded-lg hover:bg-red-50"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="w-full py-2.5 bg-[#17143D] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <User className="w-4 h-4 text-[#D9A441]" />
                <span>Customer Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
