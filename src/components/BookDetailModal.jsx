import React, { useState } from 'react';
import { X, Book, Download, BookOpen, MapPin, CheckCircle2, AlertTriangle, Layers, Calendar, User, Star, MessageSquare, Printer, Send, ShoppingBag } from 'lucide-react';
import { api } from '../api';

export default function BookDetailModal({ book, onClose, onOpenReader, onOpenReserve, onOpenShelfTag, onReviewSubmitted, onAddToCart }) {
  if (!book) return null;

  const [reviews, setReviews] = useState(book.reviews || []);
  const [rating, setRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const isDigital = book.type === 'digital' || book.type === 'both';
  const isPhysical = book.type === 'physical' || book.type === 'both';
  const hasDigitalFile = !!book.file_path;
  const isAvailable = book.available_copies > 0;

  const coverSrc = book.cover_file
    ? `/uploads/covers/${book.cover_file}`
    : book.cover_url || null;

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewerName.trim()) {
      setReviewError('Please enter your name.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const newReview = await api.submitReview(book.id, {
        reviewer_name: reviewerName.trim(),
        rating,
        comment: reviewComment.trim()
      });
      setReviews([newReview, ...reviews]);
      setReviewerName('');
      setReviewComment('');
      setReviewSuccess('Review published successfully!');
      if (onReviewSubmitted) onReviewSubmitted();
      setTimeout(() => setReviewSuccess(''), 4000);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header bar */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
              {book.category || 'General'}
            </span>
            {book.isbn && (
              <span className="text-xs text-slate-500 font-mono">
                ISBN: {book.isbn}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-6">
            
            {/* Book Cover */}
            <div className="sm:w-48 flex-shrink-0 flex flex-col items-center">
              <div className="w-40 sm:w-full h-56 rounded-xl overflow-hidden bg-gradient-to-tr from-indigo-900 to-slate-800 shadow-md flex items-center justify-center relative border border-slate-200">
                {coverSrc ? (
                  <img
                    src={coverSrc}
                    alt={book.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-center text-slate-300">
                    <Book className="w-12 h-12 text-amber-400 mb-2 opacity-80" />
                    <span className="text-xs font-serif italic line-clamp-3 text-slate-300">
                      {book.title}
                    </span>
                  </div>
                )}
              </div>

              {/* Type pill */}
              <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                {isDigital && (
                  <span className="text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Digital
                  </span>
                )}
                {isPhysical && (
                  <span className="text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Layers className="w-3 h-3" /> Physical
                  </span>
                )}
              </div>
            </div>

            {/* Book Metadata */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                    {book.title}
                  </h2>
                  {book.average_rating && (
                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs font-bold text-amber-900">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{book.average_rating}</span>
                      <span className="text-slate-400 font-normal">({reviews.length})</span>
                    </div>
                  )}
                </div>
                <p className="text-base text-slate-600 font-medium mt-0.5">
                  by <span className="text-slate-800">{book.author}</span>
                </p>
              </div>

              {/* Description */}
              <div className="text-sm text-slate-600 leading-relaxed bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                {book.description || 'No summary or description provided for this catalog entry.'}
              </div>

              {/* Physical details block */}
              {isPhysical && (
                <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-amber-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Physical Inventory
                    </span>
                    <span className={`font-semibold px-2 py-0.5 rounded-full ${
                      isAvailable ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {isAvailable ? `${book.available_copies} of ${book.total_copies} Copies Available` : 'All Copies Checked Out'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-slate-700">
                    <MapPin className="w-3.5 h-3.5 text-amber-700" />
                    <span>Shelf Location: </span>
                    <strong className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                      {book.shelf_location || 'Main Stacks (Unassigned)'}
                    </strong>
                  </div>
                </div>
              )}

              {/* Digital details block */}
              {isDigital && (
                <div className="bg-indigo-50/60 border border-indigo-200/70 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-indigo-900 uppercase tracking-wide flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" /> Digital Edition
                    </span>
                    <span className="text-slate-600 font-medium">
                      Format: <span className="uppercase font-semibold text-indigo-700">{book.file_format || 'PDF'}</span> ({formatFileSize(book.file_size)})
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-slate-600">
                    <span>Reads: <strong className="text-slate-900">{book.read_count || 0}</strong></span>
                    <span>Downloads: <strong className="text-slate-900">{book.download_count || 0}</strong></span>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Reader Reviews & Ratings Section */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span>Reader Reviews & Ratings ({reviews.length})</span>
            </h4>

            {reviewSuccess && (
              <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{reviewSuccess}</span>
              </div>
            )}

            {reviewError && (
              <div className="mb-3 p-2.5 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                {reviewError}
              </div>
            )}

            {/* Leave a review form */}
            <form onSubmit={handleReviewSubmit} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 mb-4 space-y-2.5">
              <div className="text-xs font-semibold text-slate-700">Leave a Review & Rating</div>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="text"
                  required
                  placeholder="Your Name / Member Handle"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white flex-1 min-w-[150px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-0.5 text-slate-300 hover:text-amber-400 focus:outline-none"
                    >
                      <Star className={`w-4 h-4 ${star <= rating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors disabled:opacity-50"
                >
                  <Send className="w-3 h-3" />
                  <span>{submittingReview ? 'Posting...' : 'Post Review'}</span>
                </button>
              </div>

              <textarea
                rows={2}
                placeholder="Share your thoughts on this volume (optional)..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </form>

            {/* Reviews List */}
            {reviews.length > 0 && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {reviews.map((r) => (
                  <div key={r.id} className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-800 font-semibold">{r.reviewer_name}</strong>
                      <div className="flex items-center gap-0.5">
                        {[...Array(r.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-500" />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="text-slate-600 text-[11px] leading-relaxed">{r.comment}</p>}
                    <div className="text-[10px] text-slate-400 font-mono">{r.created_at}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Catalog ID: #{book.id} • Added on {book.created_at ? new Date(book.created_at).toLocaleDateString() : 'N/A'}
          </div>

          <div className="flex items-center gap-2">
            {onAddToCart && (
              <button
                onClick={() => {
                  onAddToCart(book);
                  onClose();
                }}
                className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-semibold flex items-center gap-1.5 border border-indigo-200 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>+ Cart</span>
              </button>
            )}

            {isDigital && hasDigitalFile && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenReader(book);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  Read Online
                </button>

                <a
                  href={`/api/books/${book.id}/download`}
                  download
                  className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download
                </a>
              </>
            )}

            {isPhysical && (
              <>
                <button
                  onClick={() => {
                    onClose();
                    onOpenShelfTag(book);
                  }}
                  title="Print standardized shelf label & barcode"
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Shelf Tag</span>
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onOpenReserve(book);
                  }}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-sm flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Reserve Copy
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
