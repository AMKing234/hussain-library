import React, { useState } from 'react';
import { LayoutGrid, Plus, Trash2, CheckCircle2, AlertCircle, BookOpen } from 'lucide-react';
import { api } from '../../api';

export default function CategoriesView({
  categories = [],
  books = [],
  refreshCategories
}) {
  const [newCatName, setNewCatName] = useState('');
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setAdding(true);
    setFeedback({ type: '', message: '' });

    try {
      await api.createCategory(newCatName.trim());
      setFeedback({ type: 'success', message: `Category "${newCatName.trim()}" added!` });
      setNewCatName('');
      if (refreshCategories) refreshCategories();
      setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to add category' });
    } finally {
      setAdding(false);
    }
  };

  const handleDeleteCategory = async (catName) => {
    if (!window.confirm(`Delete category "${catName}"?`)) return;
    try {
      await api.deleteCategory(catName);
      if (refreshCategories) refreshCategories();
    } catch (err) {
      alert(err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Categories & Classifications
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Organize catalog volumes by subject matter, academic discipline, and genre.
          </p>
        </div>
      </div>

      {feedback.message && (
        <div
          className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Add Category Form */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
        <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 mb-3">
          Create New Category
        </h3>
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="e.g. Quranic Sciences, Islamic History, Rare Treatises..."
            className="flex-1 px-4 py-2.5 rounded-2xl bg-[#F8F7FC] border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
          />
          <button
            type="submit"
            disabled={adding}
            className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#7C3AED]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{adding ? 'Adding...' : 'Add Category'}</span>
          </button>
        </form>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((cat, idx) => {
          const matchingBooks = books.filter(b => b.category === cat);
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-[#7C3AED] flex items-center justify-center group-hover:scale-105 transition-transform">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{cat}</h4>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {matchingBooks.length} Volume{matchingBooks.length === 1 ? '' : 's'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleDeleteCategory(cat)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete Category"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
