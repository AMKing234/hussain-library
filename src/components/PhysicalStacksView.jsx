import React, { useState } from 'react';
import {
  Layers,
  MapPin,
  Search,
  Book,
  Calendar,
  Eye,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  Hash,
  Printer
} from 'lucide-react';

export default function PhysicalStacksView({
  books = [],
  onOpenDetail,
  onOpenReserve,
  onOpenShelfTag,
  onNavigateToCatalog
}) {
  const physicalBooks = books.filter(b => b.type === 'physical' || b.type === 'both');
  const [searchTerm, setSearchTerm] = useState('');
  const [shelfFilter, setShelfFilter] = useState('all');

  // Extract distinct shelf locations
  const shelves = Array.from(new Set(physicalBooks.map(b => b.shelf_location).filter(Boolean)));

  const filtered = physicalBooks.filter(b => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTitle = b.title?.toLowerCase().includes(q);
      const matchAuthor = b.author?.toLowerCase().includes(q);
      const matchShelf = b.shelf_location?.toLowerCase().includes(q);
      const matchIsbn = b.isbn?.toLowerCase().includes(q);
      if (!matchTitle && !matchAuthor && !matchShelf && !matchIsbn) return false;
    }

    if (shelfFilter !== 'all') {
      if (b.shelf_location !== shelfFilter) return false;
    }

    return true;
  });

  const totalCopiesSum = physicalBooks.reduce((sum, b) => sum + (b.total_copies || 0), 0);
  const availableCopiesSum = physicalBooks.reduce((sum, b) => sum + (b.available_copies || 0), 0);
  const issuedCopiesSum = totalCopiesSum - availableCopiesSum;

  return (
    <div className="space-y-6">
      
      {/* Physical Stacks Header */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold mb-3 border border-amber-500/30">
            <Layers className="w-3.5 h-3.5" />
            <span>Library Stacks & Physical Inventory</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Physical Stacks & Shelf Locator
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            Find the exact shelf location and live physical availability for volumes in the Hussain Library reading halls.
          </p>

          {/* Metrics summary banner */}
          <div className="grid grid-cols-3 gap-3 max-w-lg bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-800">
            <div className="text-center">
              <div className="text-xs text-slate-400">Physical Titles</div>
              <div className="text-xl font-bold text-white">{physicalBooks.length}</div>
            </div>
            <div className="text-center border-x border-slate-800">
              <div className="text-xs text-emerald-400">On Shelves</div>
              <div className="text-xl font-bold text-emerald-400">{availableCopiesSum}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-amber-400">On Loan</div>
              <div className="text-xl font-bold text-amber-400">{issuedCopiesSum}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-[#131127] rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-purple-900/30 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400 dark:text-purple-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search titles or shelf tags..."
            className="w-full pl-10 pr-3 py-2 rounded-xl border border-slate-300 dark:border-purple-800/60 bg-white dark:bg-[#1a1636] text-slate-800 dark:text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        {shelves.length > 0 && (
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs text-slate-600 dark:text-slate-300">
            <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Shelf:</span>
            <select
              value={shelfFilter}
              onChange={(e) => setShelfFilter(e.target.value)}
              className="bg-slate-50 dark:bg-purple-950/60 border border-slate-300 dark:border-purple-800/60 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="all">All Shelves ({shelves.length})</option>
              {shelves.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Books Table / Grid */}
      {physicalBooks.length === 0 ? (
        <div className="bg-white dark:bg-[#131127] rounded-3xl p-10 sm:p-16 text-center border border-dashed border-slate-300 dark:border-purple-900/40 shadow-sm max-w-2xl mx-auto my-8 transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-8 h-8 opacity-80" />
          </div>

          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No Physical Books in Stacks
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
            There are currently no physical books listed in this section. You can browse all available books and request new titles directly from the catalog.
          </p>

          <button
            onClick={onNavigateToCatalog}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#17143D] dark:bg-purple-700 hover:bg-[#251f5c] dark:hover:bg-purple-600 text-white font-bold rounded-xl text-sm shadow-md shadow-[#17143D]/20 transition-all cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#D9A441]" />
            <span>Return to Catalog</span>
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-8 text-center text-slate-500 dark:text-slate-400 bg-white dark:bg-[#131127] rounded-2xl border border-slate-200 dark:border-purple-900/30">
          No books found matching your shelf or search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((b) => {
            const isAvail = b.available_copies > 0;
            const coverSrc = b.cover_file
              ? `/uploads/covers/${b.cover_file}`
              : b.cover_url || null;

            return (
              <div
                key={b.id}
                className="bg-white dark:bg-[#131127] rounded-2xl border border-slate-200 dark:border-purple-900/30 shadow-sm hover:shadow-md transition-all p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-14 h-20 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200 dark:border-purple-900/40">
                      {coverSrc ? (
                        <img src={coverSrc} alt={b.title} className="w-full h-full object-cover" />
                      ) : (
                        <Book className="w-6 h-6 text-amber-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] uppercase font-bold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                        {b.category || 'General'}
                      </span>
                      <h3
                        onClick={() => onOpenDetail(b)}
                        className="font-bold text-slate-900 dark:text-slate-100 text-sm mt-1 truncate hover:text-indigo-600 dark:hover:text-purple-400 cursor-pointer"
                        title={b.title}
                      >
                        {b.title}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">by {b.author}</p>
                      {b.isbn && (
                        <p className="text-[11px] font-mono text-slate-400 dark:text-slate-500 mt-0.5">ISBN: {b.isbn}</p>
                      )}
                    </div>
                  </div>

                  {/* Shelf Location Box */}
                  <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl p-3 space-y-1.5 my-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
                        Shelf Location:
                      </span>
                      <strong className="font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-[#1a1636] px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
                        {b.shelf_location || 'Main Stacks'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-200/60 dark:border-amber-900/30">
                      <span className="text-slate-600 dark:text-slate-300">Available on Shelf:</span>
                      <span className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                        isAvail ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300' : 'bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300'
                      }`}>
                        {b.available_copies} of {b.total_copies} Copies
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onOpenDetail(b)}
                    className="flex-1 py-1.5 px-3 bg-slate-100 dark:bg-purple-950/60 hover:bg-slate-200 dark:hover:bg-purple-900/50 text-slate-700 dark:text-purple-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Stacks</span>
                  </button>

                  {onOpenShelfTag && (
                    <button
                      onClick={() => onOpenShelfTag(b)}
                      title="Print Shelf Tag"
                      className="p-1.5 bg-slate-100 dark:bg-purple-950/60 hover:bg-slate-200 dark:hover:bg-purple-900/50 text-slate-700 dark:text-purple-200 rounded-lg text-xs transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onOpenReserve(b)}
                    className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold rounded-lg text-xs flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Reserve</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
