import React, { useState } from 'react';
import { X, CheckCircle, AlertCircle, Calendar, Book, User } from 'lucide-react';
import { api } from '../api';

export default function IssueLoanModal({ books = [], members = [], preselectedBook = null, onClose, onIssued }) {
  // Only physical books with available copies > 0 can be issued
  const eligibleBooks = books.filter(b => (b.type === 'physical' || b.type === 'both') && b.available_copies > 0);

  const [bookId, setBookId] = useState(preselectedBook ? preselectedBook.id : (eligibleBooks[0]?.id || ''));
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [dueDays, setDueDays] = useState(14);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const selectedBook = books.find(b => b.id === Number(bookId));
  const selectedMember = members.find(m => m.id === Number(memberId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!bookId) {
      setError('Please select an eligible physical book with available copies.');
      return;
    }
    if (!memberId) {
      setError('Please select a member. (If no members exist, register a member first).');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.issueLoan({
        book_id: Number(bookId),
        member_id: Number(memberId),
        due_days: Number(dueDays),
        notes: notes.trim()
      });
      onIssued();
    } catch (err) {
      setError(err.message || 'Failed to issue book');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base sm:text-lg">Issue Physical Book (Circulation Desk)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="m-6 mb-0 p-3 rounded-lg bg-red-50 text-red-700 text-sm flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Select Book */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Book to Issue *
            </label>
            {eligibleBooks.length === 0 ? (
              <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-lg border border-amber-200">
                ⚠️ No physical books with available stock are currently in the library catalog. Add books or return existing loans first.
              </div>
            ) : (
              <select
                value={bookId}
                onChange={(e) => setBookId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {eligibleBooks.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.title} — by {b.author} ({b.available_copies} available on shelf {b.shelf_location ? `• ${b.shelf_location}` : ''})
                  </option>
                ))}
              </select>
            )}

            {selectedBook && (
              <div className="mt-1 text-xs text-slate-500 flex items-center justify-between">
                <span>Location: <strong className="text-slate-700">{selectedBook.shelf_location || 'General Stacks'}</strong></span>
                <span className="text-emerald-700 font-semibold">{selectedBook.available_copies} copy(ies) on shelf</span>
              </div>
            )}
          </div>

          {/* Select Member */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Select Library Member / Patron *
            </label>
            {members.length === 0 ? (
              <div className="p-3 bg-amber-50 text-amber-900 text-xs rounded-lg border border-amber-200">
                ⚠️ No members registered yet. Please add a member in the Members tab first before issuing books.
              </div>
            ) : (
              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} [{m.membership_id}] {m.phone ? `• ${m.phone}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Loan Period */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Loan Duration *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { days: 7, label: '7 Days' },
                { days: 14, label: '14 Days (Standard)' },
                { days: 30, label: '30 Days (Extended)' }
              ].map(({ days, label }) => (
                <button
                  type="button"
                  key={days}
                  onClick={() => setDueDays(days)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                    dueDays === days
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Notes / Condition (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Pristine condition, issued with dust jacket..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || eligibleBooks.length === 0 || members.length === 0}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Issuing Book...' : 'Issue Book Now'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
