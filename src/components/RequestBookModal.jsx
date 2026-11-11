import React, { useState } from 'react';
import { X, BookPlus, Send, CheckCircle2, AlertCircle, BookOpen, Layers } from 'lucide-react';
import { api } from '../api';

export default function RequestBookModal({ isOpen, onClose }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [format, setFormat] = useState('any');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatus({ type: 'error', message: 'Please enter the title of the book you are looking for.' });
      return;
    }
    if (!contact.trim()) {
      setStatus({ type: 'error', message: 'Please provide your email or phone number so we can notify you.' });
      return;
    }

    setSubmitting(true);
    setStatus({ type: '', message: '' });

    try {
      const res = await api.requestBook({
        title,
        author,
        format_preference: format,
        requester_name: name,
        requester_contact: contact,
        notes
      });

      setStatus({
        type: 'success',
        message: res.message || 'Book request submitted successfully! Our curators will acquire it soon.'
      });

      setTimeout(() => {
        setTitle('');
        setAuthor('');
        setFormat('any');
        setName('');
        setContact('');
        setNotes('');
        setStatus({ type: '', message: '' });
        onClose();
      }, 2400);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to submit book request. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-[#131127] rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-purple-900/30 relative max-h-[90vh] overflow-y-auto transition-colors">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-purple-950/60 hover:bg-slate-200 dark:hover:bg-purple-900/50 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-[#F2EDFF] dark:bg-purple-950/60 text-[#33216B] dark:text-purple-300 flex items-center justify-center shadow-2xs">
            <BookPlus className="w-6 h-6 text-[#33216B] dark:text-purple-300" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#17143D] dark:text-white">Request a Book</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Can't find a volume in our stacks? Let us procure it for you.</p>
          </div>
        </div>

        {status.message && (
          <div
            className={`p-3.5 rounded-2xl mb-4 text-xs font-medium flex items-center gap-2.5 ${
              status.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Book Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Ihya Ulum al-Din, The Road to Mecca, Principles of Economics"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-800/60 bg-white dark:bg-[#1a1636] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#17143D] dark:focus:ring-purple-600 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Author / Translator / Edition (Optional)
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="e.g. Imam Al-Ghazali / Muhammad Asad"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-800/60 bg-white dark:bg-[#1a1636] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#17143D] dark:focus:ring-purple-600 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Format Preference</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('any')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  format === 'any'
                    ? 'bg-[#17143D] dark:bg-purple-700 text-white border-[#17143D] dark:border-purple-700'
                    : 'bg-white dark:bg-[#1a1636] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-purple-900/40 hover:bg-slate-50 dark:hover:bg-purple-950/50'
                }`}
              >
                Any Format
              </button>
              <button
                type="button"
                onClick={() => setFormat('digital')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  format === 'digital'
                    ? 'bg-[#33216B] dark:bg-purple-600 text-white border-[#33216B] dark:border-purple-600'
                    : 'bg-white dark:bg-[#1a1636] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-purple-900/40 hover:bg-slate-50 dark:hover:bg-purple-950/50'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>eBook (PDF)</span>
              </button>
              <button
                type="button"
                onClick={() => setFormat('physical')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  format === 'physical'
                    ? 'bg-[#D9A441] text-slate-950 font-bold border-[#D9A441]'
                    : 'bg-white dark:bg-[#1a1636] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-purple-900/40 hover:bg-slate-50 dark:hover:bg-purple-950/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Physical</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Abdul Maleque"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-800/60 bg-white dark:bg-[#1a1636] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#17143D] dark:focus:ring-purple-600 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Contact Info <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Email or Mobile Phone"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-800/60 bg-white dark:bg-[#1a1636] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#17143D] dark:focus:ring-purple-600 text-xs font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Notes / Special Instructions</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Needed for research thesis, urgent requirement, or specific publication year"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-purple-800/60 bg-white dark:bg-[#1a1636] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#17143D] dark:focus:ring-purple-600 text-xs font-medium"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-[#17143D] dark:bg-purple-700 hover:bg-[#251f5c] dark:hover:bg-purple-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#17143D]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5 text-[#D9A441]" />
              <span>{submitting ? 'Submitting Request...' : 'Submit Book Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
