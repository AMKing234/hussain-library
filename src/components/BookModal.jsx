import React, { useState, useEffect } from 'react';
import { X, Upload, Book, Layers, BookOpen, AlertCircle, Check } from 'lucide-react';
import { api } from '../api';

export default function BookModal({ book, categories = [], onClose, onSaved }) {
  const isEditing = !!book;

  const [title, setTitle] = useState(book?.title || '');
  const [author, setAuthor] = useState(book?.author || '');
  const [isbn, setIsbn] = useState(book?.isbn || '');
  const [category, setCategory] = useState(book?.category || 'Literature');
  const [customCategory, setCustomCategory] = useState('');
  const [type, setType] = useState(book?.type || 'physical');
  const [description, setDescription] = useState(book?.description || '');
  const [shelfLocation, setShelfLocation] = useState(book?.shelf_location || '');
  const [totalCopies, setTotalCopies] = useState(book?.total_copies || 1);
  const [coverUrl, setCoverUrl] = useState(book?.cover_url || '');

  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [digitalFile, setDigitalFile] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [autofilling, setAutofilling] = useState(false);
  const [autofillSuccess, setAutofillSuccess] = useState('');

  const isPhysical = type === 'physical' || type === 'both';
  const isDigital = type === 'digital' || type === 'both';

  const handleAutofillIsbn = async () => {
    const cleanIsbn = isbn.replace(/[^0-9X]/gi, '').trim();
    if (!cleanIsbn) {
      setError('Please enter a valid ISBN number first (e.g. 9780140449136).');
      return;
    }

    setAutofilling(true);
    setError('');
    setAutofillSuccess('');

    try {
      const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`;
      const res = await fetch(url);
      const data = await res.json();
      const bookData = data[`ISBN:${cleanIsbn}`];

      if (!bookData) {
        setError(`No book record found in Open Library for ISBN: ${cleanIsbn}. You can still enter details manually.`);
        return;
      }

      if (bookData.title) setTitle(bookData.title);
      if (bookData.authors && bookData.authors.length > 0) {
        setAuthor(bookData.authors.map(a => a.name).join(', '));
      }
      if (bookData.cover?.large || bookData.cover?.medium) {
        setCoverUrl(bookData.cover.large || bookData.cover.medium);
      }
      if (bookData.notes || bookData.subtitle) {
        setDescription(bookData.notes || bookData.subtitle);
      }

      setAutofillSuccess(`Auto-filled: "${bookData.title}"!`);
      setTimeout(() => setAutofillSuccess(''), 5000);
    } catch (err) {
      setError('Failed to reach Open Library service. Please enter metadata manually.');
    } finally {
      setAutofilling(false);
    }
  };

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleDigitalFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDigitalFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) {
      setError('Title and Author are required.');
      return;
    }

    if (isPhysical && (!totalCopies || totalCopies < 1)) {
      setError('Physical books must have at least 1 copy.');
      return;
    }

    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('author', author.trim());
    if (isbn) formData.append('isbn', isbn.trim());
    
    const finalCategory = category === '__custom__' ? customCategory.trim() : category;
    formData.append('category', finalCategory || 'General');
    formData.append('type', type);
    if (description) formData.append('description', description.trim());
    
    if (isPhysical) {
      formData.append('shelf_location', shelfLocation.trim());
      formData.append('total_copies', totalCopies.toString());
    }

    if (coverUrl) formData.append('cover_url', coverUrl.trim());
    if (coverFile) formData.append('coverFile', coverFile);
    if (digitalFile) formData.append('digitalFile', digitalFile);

    try {
      if (isEditing) {
        await api.updateBook(book.id, formData);
      } else {
        await api.createBook(formData);
      }
      onSaved();
    } catch (err) {
      setError(err.message || 'Failed to save book.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <Book className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base sm:text-lg">
              {isEditing ? `Edit Book: ${book.title}` : 'Add New Book to Hussain Library'}
            </h3>
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

        {autofillSuccess && (
          <div className="m-6 mb-0 p-3 rounded-lg bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 border border-emerald-200">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{autofillSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Format / Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Book Format / Storage Type *
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setType('physical')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  type === 'physical'
                    ? 'border-amber-500 bg-amber-50/70 text-amber-950 font-bold ring-2 ring-amber-400/50'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <Layers className="w-5 h-5 mb-1 text-amber-600" />
                <span className="text-xs">Physical Only</span>
                <span className="text-[10px] text-slate-500 font-normal">On Library Shelf</span>
              </button>

              <button
                type="button"
                onClick={() => setType('digital')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  type === 'digital'
                    ? 'border-indigo-500 bg-indigo-50/70 text-indigo-950 font-bold ring-2 ring-indigo-400/50'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <BookOpen className="w-5 h-5 mb-1 text-indigo-600" />
                <span className="text-xs">Digital Only</span>
                <span className="text-[10px] text-slate-500 font-normal">PDF / EPUB / TXT</span>
              </button>

              <button
                type="button"
                onClick={() => setType('both')}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  type === 'both'
                    ? 'border-emerald-500 bg-emerald-50/70 text-emerald-950 font-bold ring-2 ring-emerald-400/50'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <div className="flex gap-1 mb-1">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-xs">Hybrid (Both)</span>
                <span className="text-[10px] text-slate-500 font-normal">Physical & Digital</span>
              </button>
            </div>
          </div>

          {/* Primary Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Book Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Nahjul Balagha"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Author / Writer *
              </label>
              <input
                type="text"
                required
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Sharif Razi"
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Category / Genre
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="Literature">Literature</option>
                <option value="Philosophy">Philosophy & Ethics</option>
                <option value="History">History & Civilization</option>
                <option value="Science">Science & Technology</option>
                <option value="Islamic Studies">Islamic Studies</option>
                <option value="Poetry">Poetry</option>
                <option value="Biography">Biography & Memoir</option>
                <option value="General">General / Reference</option>
                {categories.map((c) => (
                  !['Literature', 'Philosophy', 'History', 'Science', 'Islamic Studies', 'Poetry', 'Biography', 'General'].includes(c) && (
                    <option key={c} value={c}>{c}</option>
                  )
                ))}
                <option value="__custom__">+ Add Custom Category...</option>
              </select>

              {category === '__custom__' && (
                <input
                  type="text"
                  required
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="Enter new category name"
                  className="mt-2 w-full px-3.5 py-1.5 rounded-lg border border-indigo-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  ISBN or Call Number
                </label>
                <button
                  type="button"
                  onClick={handleAutofillIsbn}
                  disabled={autofilling || !isbn}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 disabled:opacity-40"
                >
                  <span>⚡ Autofill via ISBN</span>
                </button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  placeholder="e.g. 9780140449136"
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Physical Inventory Details (if physical or both) */}
          {isPhysical && (
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/80 space-y-3">
              <div className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-700" />
                Physical Library Stacks & Inventory
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Shelf Location *
                  </label>
                  <input
                    type="text"
                    required={isPhysical}
                    value={shelfLocation}
                    onChange={(e) => setShelfLocation(e.target.value)}
                    placeholder="e.g. Rack A-3, Shelf 2"
                    className="w-full px-3.5 py-2 rounded-lg border border-amber-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Total Copies in Stacks *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    required={isPhysical}
                    value={totalCopies}
                    onChange={(e) => setTotalCopies(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3.5 py-2 rounded-lg border border-amber-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Digital File Upload (if digital or both) */}
          {isDigital && (
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200/80 space-y-3">
              <div className="text-xs font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-700" />
                Digital File (PDF, EPUB, TXT)
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <label className="cursor-pointer border-2 border-dashed border-indigo-300 hover:border-indigo-500 rounded-xl p-4 flex flex-col items-center justify-center w-full text-center bg-white transition-colors">
                  <Upload className="w-6 h-6 text-indigo-500 mb-1" />
                  <span className="text-xs font-medium text-slate-700">
                    {digitalFile ? digitalFile.name : 'Click to select PDF or digital book file'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-0.5">
                    Supports PDF, EPUB, TXT (up to 50MB)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.epub,.txt,.docx"
                    onChange={handleDigitalFileChange}
                    className="hidden"
                  />
                </label>

                {book?.file_path && !digitalFile && (
                  <div className="text-xs text-indigo-900 bg-white p-3 rounded-lg border border-indigo-200 flex-shrink-0">
                    <div>Current file attached:</div>
                    <strong className="font-mono">{book.file_path}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cover Image Upload & Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Cover Image (Upload or URL)
              </label>
              
              <div className="flex items-center gap-3">
                <label className="cursor-pointer border border-slate-300 hover:border-slate-400 bg-slate-50 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="hidden"
                  />
                </label>

                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="Or paste image URL"
                  className="flex-1 px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {(coverPreview || book?.cover_file || book?.cover_url) && (
                <div className="mt-2 flex items-center gap-2">
                  <img
                    src={coverPreview || (book?.cover_file ? `/uploads/covers/${book.cover_file}` : book?.cover_url)}
                    alt="Preview"
                    className="w-10 h-14 object-cover rounded shadow border border-slate-200"
                  />
                  <span className="text-[11px] text-slate-500">Cover preview</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Description / Summary
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary, table of contents, or keywords..."
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Action buttons */}
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
              disabled={submitting}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm disabled:opacity-50"
            >
              {submitting ? 'Saving...' : isEditing ? 'Update Book' : 'Add to Catalog'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
