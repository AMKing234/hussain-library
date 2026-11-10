import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Upload,
  Eye,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Tag
} from 'lucide-react';
import { api } from '../../api';

export default function BooksView({
  books = [],
  categories = [],
  refreshBooks,
  currencySymbol = '₹',
  autoOpenAdd = false,
  onClearAutoOpen
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [category, setCategory] = useState('Islamic Books');
  const [type, setType] = useState('both');
  const [price, setPrice] = useState('450');
  const [totalCopies, setTotalCopies] = useState('5');
  const [shelfLocation, setShelfLocation] = useState('Main Stacks A-1');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('published');
  const [coverFile, setCoverFile] = useState(null);
  const [digitalFile, setDigitalFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleOpenAdd = () => {
    setEditingBook(null);
    setTitle('');
    setAuthor('');
    setIsbn('');
    setCategory(categories[0] || 'Islamic Books');
    setType('both');
    setPrice('450');
    setTotalCopies('5');
    setShelfLocation('Main Stacks A-1');
    setDescription('');
    setStatus('published');
    setCoverFile(null);
    setDigitalFile(null);
    setFeedback({ type: '', message: '' });
    setModalOpen(true);
  };

  useEffect(() => {
    if (autoOpenAdd) {
      handleOpenAdd();
      if (onClearAutoOpen) onClearAutoOpen();
    }
  }, [autoOpenAdd]);

  const handleOpenEdit = (b) => {
    setEditingBook(b);
    setTitle(b.title || '');
    setAuthor(b.author || '');
    setIsbn(b.isbn || '');
    setCategory(b.category || 'Islamic Books');
    setType(b.type || 'both');
    setPrice(String(b.price || 0));
    setTotalCopies(String(b.total_copies || 1));
    setShelfLocation(b.shelf_location || '');
    setDescription(b.description || '');
    setStatus(b.status || 'published');
    setCoverFile(null);
    setDigitalFile(null);
    setFeedback({ type: '', message: '' });
    setModalOpen(true);
  };

  const handleDelete = async (id, bTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${bTitle}"?`)) return;
    try {
      await api.deleteBook(id);
      refreshBooks();
    } catch (err) {
      alert(err.message || 'Failed to delete book');
    }
  };

  const handleSaveBook = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setFeedback({ type: 'error', message: 'Title and Author are required.' });
      return;
    }

    setSaving(true);
    setFeedback({ type: '', message: '' });

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('author', author.trim());
    formData.append('isbn', isbn.trim());
    formData.append('category', category);
    formData.append('type', type);
    formData.append('price', price);
    formData.append('total_copies', totalCopies);
    formData.append('shelf_location', shelfLocation);
    formData.append('description', description);
    formData.append('status', status);

    if (coverFile) formData.append('coverFile', coverFile);
    if (digitalFile) formData.append('digitalFile', digitalFile);

    try {
      if (editingBook) {
        await api.updateBook(editingBook.id, formData);
        setFeedback({ type: 'success', message: 'Book updated successfully!' });
      } else {
        await api.createBook(formData);
        setFeedback({ type: 'success', message: 'Book created successfully!' });
      }
      refreshBooks();
      setTimeout(() => {
        setModalOpen(false);
      }, 1000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Operation failed' });
    } finally {
      setSaving(false);
    }
  };

  const filtered = books.filter((b) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        b.title?.toLowerCase().includes(q) ||
        b.author?.toLowerCase().includes(q) ||
        b.isbn?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (categoryFilter !== 'all' && b.category !== categoryFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Book Catalog Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Add new physical volumes, upload digital PDFs, and manage prices.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-[#7C3AED]/20 transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title, author, or ISBN..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F7FC] rounded-xl text-xs font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#F8F7FC] border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">All Categories ({books.length})</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Books Table or Zero State */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F8F7FC] flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-800">
              {books.length === 0 ? 'No books available yet.' : 'No matching books found'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {books.length === 0
                ? 'Your library catalog is running with a clean, zero-data initial state. Click "Add New Book" to catalog your first volume.'
                : 'Try adjusting your search query or category filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF9FD] text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Book Title & Cover</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Copies</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b) => {
                  const coverSrc = b.cover_file
                    ? `/uploads/covers/${b.cover_file}`
                    : b.cover_url || null;
                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-13 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-xs">
                            {coverSrc ? (
                              <img src={coverSrc} alt={b.title} className="w-full h-full object-cover" />
                            ) : (
                              <BookOpen className="w-5 h-5 text-amber-400 opacity-80" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 line-clamp-1">{b.title}</div>
                            {b.isbn && <div className="text-[10px] font-mono text-slate-400">ISBN: {b.isbn}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{b.author}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-lg bg-purple-50 text-[#7C3AED] font-semibold text-[10px] border border-purple-100">
                          {b.category || 'General'}
                        </span>
                      </td>
                      <td className="p-4 capitalize text-slate-600 font-medium">{b.type}</td>
                      <td className="p-4 font-black text-slate-900">
                        {currencySymbol}{b.price ? Number(b.price).toLocaleString() : '0'}
                      </td>
                      <td className="p-4 text-slate-600">
                        {b.type === 'digital' ? (
                          <span className="text-purple-600 font-semibold">PDF eBook</span>
                        ) : (
                          `${b.available_copies}/${b.total_copies}`
                        )}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                          {b.status || 'published'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-[#7C3AED] hover:bg-purple-50 transition-colors"
                            title="Edit Book"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id, b.title)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Book"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Book Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <h3 className="font-extrabold text-base text-slate-900">
                {editingBook ? 'Edit Book Details' : 'Catalog New Book'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center text-xs"
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

            <form onSubmit={handleSaveBook} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Book Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Seerat un Nabi (S.A.W)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Author <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    placeholder="e.g. Allama Shibli Nomani"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ISBN</label>
                  <input
                    type="text"
                    value={isbn}
                    onChange={(e) => setIsbn(e.target.value)}
                    placeholder="978-..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    {!categories.includes('Islamic Books') && <option value="Islamic Books">Islamic Books</option>}
                    {!categories.includes('Academic Books') && <option value="Academic Books">Academic Books</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Format Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                  >
                    <option value="both">Both (Physical & PDF)</option>
                    <option value="digital">Digital Only (PDF)</option>
                    <option value="physical">Physical Stack Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Copies</label>
                  <input
                    type="number"
                    value={totalCopies}
                    onChange={(e) => setTotalCopies(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Shelf Location</label>
                  <input
                    type="text"
                    value={shelfLocation}
                    onChange={(e) => setShelfLocation(e.target.value)}
                    placeholder="e.g. Stacks A-1, Shelf 3"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                  />
                </div>
              </div>

              {/* Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Cover Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Digital PDF File</label>
                  <input
                    type="file"
                    accept=".pdf,.epub"
                    onChange={(e) => setDigitalFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of the book content and significance..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-2xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingBook ? 'Update Book' : 'Catalog Book'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
