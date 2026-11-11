import React from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  BookOpen
} from 'lucide-react';

export default function WishlistModal({
  isOpen,
  onClose,
  wishlistIds = [],
  books = [],
  onAddToCart,
  onRemoveFromWishlist
}) {
  if (!isOpen) return null;

  const wishlistBooks = books.filter(b => wishlistIds.includes(b.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#131127] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-purple-900/30 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#17143D] via-[#2A1E5C] to-[#3B1F7E] p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-rose-400">
              <Heart className="w-5 h-5 fill-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Your Reading Wishlist</h3>
              <p className="text-xs text-purple-200/80">
                {wishlistBooks.length} {wishlistBooks.length === 1 ? 'saved book' : 'saved books'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-3">
          {wishlistBooks.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3">
                <Heart className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">Your wishlist is empty</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">
                Explore our catalog and click the heart icon on any title to save it for later.
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-[#17143D] dark:bg-purple-600 hover:bg-[#251f5c] text-white text-xs font-semibold rounded-xl transition-all cursor-pointer"
              >
                Explore Books
              </button>
            </div>
          ) : (
            wishlistBooks.map((book) => (
              <div
                key={book.id}
                className="flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 dark:border-purple-900/30 bg-slate-50/60 dark:bg-purple-950/20 hover:bg-white dark:hover:bg-purple-900/20 transition-all group"
              >
                {/* Book Cover */}
                <div className="w-12 h-16 rounded-xl bg-slate-200 dark:bg-slate-800 overflow-hidden shrink-0 flex items-center justify-center border border-slate-200/60 dark:border-slate-700">
                  {book.cover_image ? (
                    <img
                      src={book.cover_image}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookOpen className="w-5 h-5 text-purple-400" />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    {book.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {book.author || 'Unknown Author'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs font-extrabold text-[#17143D] dark:text-[#D9A441]">
                      ₹{book.price || 0}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 font-medium">
                      {book.category || 'General'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      onAddToCart(book);
                      onRemoveFromWishlist(book.id);
                    }}
                    title="Move to Cart"
                    className="p-2 rounded-xl bg-[#17143D] dark:bg-purple-600 hover:bg-[#251f5c] text-white transition-all cursor-pointer shadow-xs"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveFromWishlist(book.id)}
                    title="Remove from Wishlist"
                    className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {wishlistBooks.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-purple-900/30 bg-slate-50 dark:bg-[#181533] flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Total Items: <strong className="text-slate-800 dark:text-slate-200">{wishlistBooks.length}</strong>
            </span>
            <button
              onClick={() => {
                wishlistBooks.forEach(b => onAddToCart(b));
                onClose();
              }}
              className="px-4 py-2 bg-[#17143D] dark:bg-purple-600 hover:bg-[#251f5c] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Add All to Cart</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
