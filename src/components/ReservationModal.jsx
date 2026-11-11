import React, { useState } from 'react';
import { X, Calendar, CheckCircle2, AlertCircle, Book } from 'lucide-react';
import { api } from '../api';

export default function ReservationModal({ book, onClose, onSuccess }) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!book) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) {
      setError('Please provide your name and contact details.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.createReservation({
        book_id: book.id,
        member_name: name.trim(),
        member_contact: contact.trim(),
        notes: notes.trim()
      });
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to submit reservation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-[#131127] rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 dark:border-purple-900/30 overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 dark:border-purple-900/30 bg-amber-500 text-slate-950">
          <div className="flex items-center gap-2 font-bold">
            <Calendar className="w-5 h-5" />
            <span>Reserve Physical Book</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-900 hover:bg-amber-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Reservation Confirmed!</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Your reservation request for <strong className="text-slate-800 dark:text-slate-100">"{book.title}"</strong> has been submitted to Hussain Library staff.
            </p>
            <div className="bg-slate-50 dark:bg-[#181433] p-3 rounded-lg text-xs text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-purple-900/30 text-left">
              📍 <strong>Location:</strong> {book.shelf_location || 'Main Stacks'}<br/>
              🏷️ <strong>Status:</strong> {book.available_copies > 0 ? `${book.available_copies} copies currently available on shelf` : 'Held in queue for next return'}
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 dark:bg-purple-700 text-white font-medium rounded-xl hover:bg-slate-800 dark:hover:bg-purple-600 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Book Info Summary */}
            <div className="p-3 bg-slate-50 dark:bg-[#181433] rounded-xl border border-slate-100 dark:border-purple-900/30 flex items-start gap-3">
              <Book className="w-5 h-5 text-indigo-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{book.title}</div>
                <div className="text-slate-500 dark:text-slate-400">by {book.author}</div>
                <div className="mt-1 text-slate-600 dark:text-slate-300">
                  Shelf: <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{book.shelf_location || 'Main Stacks'}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Ali Raza"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-purple-800/60 bg-white dark:bg-[#1a1636] text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Contact Number or Email *
              </label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g., +92 300 1234567 or email@domain.com"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-purple-800/60 bg-white dark:bg-[#1a1636] text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Notes / Preferred Pickup Date (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Will pick up this Saturday afternoon..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 dark:border-purple-800/60 bg-white dark:bg-[#1a1636] text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-purple-950/50 text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Confirm Reservation'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
