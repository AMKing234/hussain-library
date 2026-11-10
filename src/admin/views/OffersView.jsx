import React, { useState, useEffect } from 'react';
import { Tag, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { api } from '../../api';

export default function OffersView({ currencySymbol = '₹', autoOpenCreate = false, onClearAutoOpen }) {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [originalPrice, setOriginalPrice] = useState('2199');
  const [offerPrice, setOfferPrice] = useState('1499');
  const [badge, setBadge] = useState('Save 30%');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const loadCombos = async () => {
    try {
      setLoading(true);
      const data = await api.getCombos();
      setCombos(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCombos();
  }, []);

  useEffect(() => {
    if (autoOpenCreate) {
      setModalOpen(true);
      if (onClearAutoOpen) onClearAutoOpen();
    }
  }, [autoOpenCreate]);

  const handleCreateCombo = async (e) => {
    e.preventDefault();
    if (!title.trim() || !offerPrice) return;

    setSubmitting(true);
    setFeedback({ type: '', message: '' });

    try {
      await api.createCombo({
        title: title.trim(),
        description: description.trim(),
        original_price: parseFloat(originalPrice) || 0,
        offer_price: parseFloat(offerPrice) || 0,
        badge: badge.trim()
      });
      setFeedback({ type: 'success', message: 'Combo offer created successfully!' });
      setTitle('');
      setDescription('');
      loadCombos();
      setTimeout(() => setModalOpen(false), 1200);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create offer' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCombo = async (id) => {
    if (!window.confirm('Delete this combo offer?')) return;
    try {
      await api.deleteCombo(id);
      loadCombos();
    } catch (err) {
      alert(err.message || 'Failed to delete offer');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Offers & Book Combos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure multi-volume bundles, discounts, and study packages.
          </p>
        </div>

        <button
          onClick={() => {
            setFeedback({ type: '', message: '' });
            setModalOpen(true);
          }}
          className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#7C3AED]/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Offer</span>
        </button>
      </div>

      {combos.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/90 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-[#F8F7FC] flex items-center justify-center mx-auto mb-3">
            <Tag className="w-8 h-8 text-slate-400" />
          </div>
          <h4 className="font-extrabold text-sm text-slate-800">No combo offers created yet</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Create book bundles and promotional discount packs for your readers.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {combos.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-[#7C3AED] px-2.5 py-1 rounded-lg border border-purple-100">
                    {c.badge || 'Bundle Offer'}
                  </span>
                  <button
                    onClick={() => handleDeleteCombo(c.id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mb-1">{c.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{c.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-lg font-black text-slate-900">
                    {currencySymbol}{Number(c.offer_price).toLocaleString()}
                  </span>
                  {c.original_price > 0 && (
                    <span className="text-xs text-slate-400 line-through ml-2">
                      {currencySymbol}{Number(c.original_price).toLocaleString()}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-sm text-slate-900">Create Combo Pack</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            {feedback.message && (
              <div
                className={`p-3 rounded-xl mb-4 text-xs font-semibold flex items-center gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                <span>{feedback.message}</span>
              </div>
            )}

            <form onSubmit={handleCreateCombo} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bundle Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Tafsir & Hadith Treasury"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details of books included in this bundle..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Offer Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  placeholder="e.g. Save 30%, Bestseller"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Offer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
