import React, { useState, useEffect, useRef } from 'react';
import { Search, Book, BookOpen, Layers, MapPin, X, ArrowRight, CornerDownLeft } from 'lucide-react';

export default function SpotlightSearch({ isOpen, onClose, books = [], onSelectBook }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const results = books.filter((b) => {
    if (!query.trim()) return false;
    const q = query.toLowerCase();
    return (
      b.title?.toLowerCase().includes(q) ||
      b.author?.toLowerCase().includes(q) ||
      b.isbn?.toLowerCase().includes(q) ||
      b.category?.toLowerCase().includes(q) ||
      b.shelf_location?.toLowerCase().includes(q)
    );
  }).slice(0, 8); // limit to top 8 results

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (results.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % (results.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectBook(results[selectedIndex]);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-start justify-center pt-20 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type book title, author, shelf, or category..."
            className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-[11px] font-mono text-slate-400 hover:text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
          {!query.trim() ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Start typing to search titles across physical stacks and digital archives...
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching books found for "{query}".
            </div>
          ) : (
            results.map((book, idx) => {
              const isSelected = idx === selectedIndex;
              const isDigital = book.type === 'digital' || book.type === 'both';
              const isPhysical = book.type === 'physical' || book.type === 'both';

              return (
                <div
                  key={book.id}
                  onClick={() => {
                    onSelectBook(book);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-indigo-50/80 text-indigo-950' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-10 rounded bg-slate-900 text-amber-400 flex items-center justify-center flex-shrink-0 shadow-sm text-xs font-bold">
                      {isDigital ? <BookOpen className="w-4 h-4 text-indigo-300" /> : <Book className="w-4 h-4 text-amber-300" />}
                    </div>

                    <div className="min-w-0">
                      <div className="font-semibold text-xs truncate">{book.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">by {book.author}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isPhysical && (
                      <span className="text-[10px] font-mono bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        {book.shelf_location || 'Main'}
                      </span>
                    )}
                    {isDigital && (
                      <span className="text-[10px] font-semibold uppercase bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded">
                        {book.file_format || 'PDF'}
                      </span>
                    )}
                    <CornerDownLeft className="w-3.5 h-3.5 text-slate-400 opacity-60" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Tip: Press <kbd className="font-mono bg-white border border-slate-300 px-1 rounded text-[10px]">Ctrl</kbd> + <kbd className="font-mono bg-white border border-slate-300 px-1 rounded text-[10px]">K</kbd> anywhere to open</span>
          <span><kbd className="font-mono">↑↓</kbd> to navigate • <kbd className="font-mono">↵</kbd> to select</span>
        </div>

      </div>
    </div>
  );
}
