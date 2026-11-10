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
      <div className="relative bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-amber-500 text-slate-950">
          <div className="flex items-center gap-2 font-bold">
            <Calendar className="w-5 h-5" />
            <span>Reserve Physical Book</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-900 hover:bg-amber-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Reservation Confirmed!</h3>
            <p className="text-sm text-slate-600">
              Your reservation request for <strong className="text-slate-800">"{book.title}"</strong> has been submitted to Hussain Library staff.
            </p>
            <div className="bg-slate-50 p-3 rounded-lg text-xs text-slate-500 border border-slate-100 text-left">
              📍 <strong>Location:</strong> {book.shelf_location || 'Main Stacks'}<br/>
              🏷️ <strong>Status:</strong> {book.available_copies > 0 ? `${book.available_copies} copies currently available on shelf` : 'Held in queue for next return'}
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Book Info Summary */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
              <Book className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <div className="font-semibold text-slate-900 line-clamp-1">{book.title}</div>
                <div className="text-slate-500">by {book.author}</div>
                <div className="mt-1 text-slate-600">
                  Shelf: <span className="font-mono font-medium text-slate-800">{book.shelf_location || 'Main Stacks'}</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Ali Raza"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Contact Number or Email *
              </label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g., +92 300 1234567 or email@domain.com"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Notes / Preferred Pickup Date (Optional)
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Will pick up this Saturday afternoon..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-sm transition-colors shadow-sm disabled:opacity-50"
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
