import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Minus,
  Check,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  BookOpen,
  Send,
  Loader2,
  ArrowRight,
  Trash2,
  Percent
} from 'lucide-react';
import { api } from '../api';

export default function CustomComboBuilder({
  books = [],
  currencySymbol = '₹',
  onAddToCart
}) {
  const [adminCombos, setAdminCombos] = useState([]);
  const [loadingCombos, setLoadingCombos] = useState(true);

  // Selected books for custom bundle
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Request form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Load official combos from database
  const loadCombos = async () => {
    try {
      setLoadingCombos(true);
      const res = await api.getCombos();
      setAdminCombos(res || []);
    } catch (err) {
      console.error('Failed to load combos:', err);
    } finally {
      setLoadingCombos(false);
    }
  };

  useEffect(() => {
    loadCombos();
  }, []);

  const toggleSelectBook = (book) => {
    setSelectedBooks((prev) => {
      const exists = prev.find((b) => b.id === book.id);
      if (exists) {
        return prev.filter((b) => b.id !== book.id);
      } else {
        return [...prev, book];
      }
    });
  };

  const removeSelectedBook = (bookId) => {
    setSelectedBooks((prev) => prev.filter((b) => b.id !== bookId));
  };

  // Pricing calculations
  const originalTotal = selectedBooks.reduce((sum, b) => sum + (parseFloat(b.price) || 450), 0);
  
  // Tiered discount based on quantity
  let discountPercent = 0;
  if (selectedBooks.length === 2) discountPercent = 10;
  else if (selectedBooks.length === 3) discountPercent = 15;
  else if (selectedBooks.length >= 4) discountPercent = 20;

  const discountAmount = Math.round((originalTotal * discountPercent) / 100);
  const finalComboPrice = originalTotal - discountAmount;

  // Handle Form Submit
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setFeedback({ type: 'error', message: 'Name and email are required.' });
      return;
    }
    if (selectedBooks.length === 0) {
      setFeedback({ type: 'error', message: 'Please select at least 1 book to build your custom combo pack.' });
      return;
    }

    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      const payload = {
        customer_name: name.trim(),
        customer_email: email.trim(),
        customer_phone: phone.trim() || null,
        customer_address: address.trim() || null,
        selected_books: selectedBooks.map(b => ({
          id: b.id,
          title: b.title,
          author: b.author,
          price: b.price || 450
        })),
        total_original_price: originalTotal,
        combo_discount_percent: discountPercent,
        combo_price: finalComboPrice,
        notes: notes.trim() || null
      };

      const res = await api.requestCustomCombo(payload);
      setFeedback({
        type: 'success',
        message: `Your custom combo request #${res.id} has been submitted! Our librarian will contact you shortly with confirmed pricing and delivery.`
      });
      setSelectedBooks([]);
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setNotes('');
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit combo request.' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCatalogBooks = books.filter(b => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return b.title?.toLowerCase().includes(q) || b.author?.toLowerCase().includes(q) || b.category?.toLowerCase().includes(q);
  });

  return (
    <div id="section-combos" className="space-y-8 scroll-mt-24">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2EDFF] text-[#33216B] text-xs font-semibold mb-2">
            <Tag className="w-3.5 h-3.5" />
            <span>Personalized Study Bundles</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17143D] tracking-tight">
            Book Combo Packs & Custom Bundles
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Choose individual volumes from our library collection to create your own discounted study pack, or browse official curated sets.
          </p>
        </div>
      </div>

      {/* Official Admin Combos (Only rendered if actual records exist in DB) */}
      {adminCombos.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
            Featured Curated Sets
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {adminCombos.map((combo) => (
              <div
                key={combo.id}
                className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-[#33216B] px-2.5 py-1 rounded-lg border border-purple-100">
                      {combo.badge || 'Combo Deal'}
                    </span>
                    {combo.original_price > combo.offer_price && (
                      <span className="text-xs font-extrabold text-emerald-600">
                        Save {Math.round(((combo.original_price - combo.offer_price) / combo.original_price) * 100)}%
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 mb-1.5">
                    {combo.title}
                  </h4>
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-3">
                    {combo.description || 'Special collection bundle curated by library scholars.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-lg font-extrabold text-[#17143D]">
                      {currencySymbol}{combo.offer_price}
                    </span>
                    {combo.original_price > combo.offer_price && (
                      <span className="text-xs text-slate-400 line-through ml-2">
                        {currencySymbol}{combo.original_price}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      // Pre-fill request form with this combo's title
                      setNotes(`I want to request the curated combo pack: "${combo.title}" (${currencySymbol}${combo.offer_price})`);
                      const formEl = document.getElementById('custom-combo-form');
                      if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3.5 py-1.5 bg-[#17143D] hover:bg-[#251f5c] text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Request This Pack
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Interactive "Build Your Own Custom Combo Pack" Feature           */}
      {/* ----------------------------------------------------------------- */}
      <div className="bg-gradient-to-br from-[#17143D] via-[#21174d] to-[#33216B] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D9A441]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-white/10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#D9A441] text-xs font-semibold mb-2 border border-white/10">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Custom Bundle Studio</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Build & Request Your Own Combo Pack
              </h3>
              <p className="text-xs sm:text-sm text-purple-200/80 mt-1 max-w-xl">
                Select 2 or more books below. Enjoy automatic bundle discounts (up to 20% off) and submit your request directly to our acquisitions desk.
              </p>
            </div>

            {/* Live Discount Tiers Indicator */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 p-2.5 rounded-2xl text-xs text-purple-200 flex-shrink-0">
              <span className={`px-2 py-1 rounded-lg font-bold ${selectedBooks.length >= 2 ? 'bg-[#D9A441] text-slate-950' : 'bg-white/10 text-purple-300'}`}>
                2 Books: 10%
              </span>
              <span className={`px-2 py-1 rounded-lg font-bold ${selectedBooks.length >= 3 ? 'bg-[#D9A441] text-slate-950' : 'bg-white/10 text-purple-300'}`}>
                3 Books: 15%
              </span>
              <span className={`px-2 py-1 rounded-lg font-bold ${selectedBooks.length >= 4 ? 'bg-[#D9A441] text-slate-950' : 'bg-white/10 text-purple-300'}`}>
                4+ Books: 20%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 7 cols: Book Selection Catalog */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-200/80">
                  Select Books for Your Bundle ({books.length} Available in Library)
                </span>
                {books.length > 0 && (
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search books to add..."
                    className="px-3 py-1.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-purple-300/40 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#D9A441] w-48 sm:w-60"
                  />
                )}
              </div>

              {books.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-purple-200/70">
                  <BookOpen className="w-8 h-8 text-purple-300/60 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-white">No books in catalog yet</p>
                  <p className="text-[11px] mt-1 text-purple-200/60 max-w-md mx-auto">
                    Once books are added to the library catalog, they will appear here and can be selected for custom combo packs.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1 no-scrollbar">
                  {filteredCatalogBooks.map((book) => {
                    const isSelected = selectedBooks.some((b) => b.id === book.id);
                    const coverSrc = book.cover_file
                      ? `/uploads/covers/${book.cover_file}`
                      : book.cover_url || null;

                    return (
                      <div
                        key={book.id}
                        onClick={() => toggleSelectBook(book)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-purple-600/30 border-[#D9A441] shadow-md ring-1 ring-[#D9A441]'
                            : 'bg-white/5 hover:bg-white/10 border-white/10'
                        }`}
                      >
                        <div className="w-12 h-16 rounded-lg bg-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {coverSrc ? (
                            <img src={coverSrc} alt={book.title} className="w-full h-full object-cover" />
                          ) : (
                            <BookOpen className="w-5 h-5 text-purple-300/60" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{book.title}</p>
                          <p className="text-[10px] text-purple-200/70 truncate">by {book.author}</p>
                          <div className="mt-1 flex items-center justify-between">
                            <span className="text-xs font-extrabold text-[#D9A441]">
                              {currencySymbol}{book.price || 450}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              isSelected ? 'bg-[#D9A441] text-slate-950' : 'bg-white/10 text-purple-200'
                            }`}>
                              {isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                              <span>{isSelected ? 'Added' : 'Select'}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right 5 cols: Bundle Summary & Request Form */}
            <div id="custom-combo-form" className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/15 flex flex-col justify-between">
              
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#D9A441]" />
                    <span>Your Selected Pack</span>
                  </h4>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#D9A441] text-slate-950">
                    {selectedBooks.length} Books
                  </span>
                </div>

                {/* Selected Books List */}
                {selectedBooks.length === 0 ? (
                  <div className="py-6 text-center text-purple-200/60 text-xs">
                    Tap any book on the left to add it to your custom combo pack.
                  </div>
                ) : (
                  <div className="space-y-2 mb-4 max-h-40 overflow-y-auto no-scrollbar">
                    {selectedBooks.map((b) => (
                      <div key={b.id} className="flex items-center justify-between bg-white/5 p-2 rounded-xl text-xs">
                        <span className="text-white font-medium truncate max-w-[180px]">{b.title}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#D9A441] font-bold">{currencySymbol}{b.price || 450}</span>
                          <button
                            onClick={() => removeSelectedBook(b.id)}
                            className="text-purple-300 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Pricing Calculation Summary */}
                <div className="bg-white/5 rounded-xl p-3.5 space-y-1.5 text-xs text-purple-200 border border-white/10 mb-5">
                  <div className="flex justify-between">
                    <span>Individual Books Total:</span>
                    <span className="font-semibold text-white">{currencySymbol}{originalTotal}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-emerald-400 font-semibold">
                      <span>Combo Discount ({discountPercent}%):</span>
                      <span>- {currencySymbol}{discountAmount}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-extrabold text-white">
                    <span>Estimated Bundle Price:</span>
                    <span className="text-[#D9A441] text-base">{currencySymbol}{finalComboPrice}</span>
                  </div>
                </div>

                {/* Request Form */}
                <form onSubmit={handleRequestSubmit} className="space-y-3">
                  {feedback.message && (
                    <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                      feedback.type === 'success'
                        ? 'bg-emerald-500/20 border border-emerald-400 text-emerald-200'
                        : 'bg-rose-500/20 border border-rose-400 text-rose-200'
                    }`}>
                      {feedback.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                      )}
                      <span>{feedback.message}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your Full Name *"
                      className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-white placeholder-purple-300/50 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#D9A441]"
                    />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email Address *"
                      className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-white placeholder-purple-300/50 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#D9A441]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="Phone / WhatsApp Number"
                      className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-white placeholder-purple-300/50 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#D9A441]"
                    />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Delivery City / Address"
                      className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-white placeholder-purple-300/50 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#D9A441]"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special requests or specific edition requirements..."
                    className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-xl text-white placeholder-purple-300/50 text-xs focus:outline-hidden focus:ring-1 focus:ring-[#D9A441]"
                  />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 bg-[#D9A441] hover:bg-[#c99534] text-slate-950 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Request This Custom Combo Pack</span>
                      </>
                    )}
                  </button>
                </form>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
