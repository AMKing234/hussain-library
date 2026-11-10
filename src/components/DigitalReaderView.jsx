import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Download,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Book,
  FileText,
  Sparkles,
  Type,
  Sun,
  Moon,
  Coffee,
  PlusCircle,
  Bookmark,
  BookmarkCheck,
  StickyNote,
  Sliders
} from 'lucide-react';

export default function DigitalReaderView({
  books = [],
  activeBook = null,
  setActiveBook,
  onNavigateToAdmin
}) {
  const digitalBooks = books.filter(b => (b.type === 'digital' || b.type === 'both') && b.file_path);

  // Selected book state
  const [selectedBook, setSelectedBook] = useState(
    activeBook || digitalBooks[0] || null
  );

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingTheme, setReadingTheme] = useState('paper'); // 'paper', 'night', 'sepia'
  const [fontSize, setFontSize] = useState('text-base'); // 'text-sm', 'text-base', 'text-lg', 'text-xl'
  const [textContent, setTextContent] = useState('');
  const [loadingText, setLoadingText] = useState(false);

  // Bookmarks & Notes state (persisted in localStorage)
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [notes, setNotes] = useState('');
  const [bookmarks, setBookmarks] = useState([]);
  const [newBookmarkLabel, setNewBookmarkLabel] = useState('');

  // Load bookmarks & notes for selected book
  useEffect(() => {
    if (!selectedBook) return;
    const storageKey = `hl_notes_${selectedBook.id}`;
    const savedNotes = localStorage.getItem(storageKey) || '';
    setNotes(savedNotes);

    const bmKey = `hl_bookmarks_${selectedBook.id}`;
    const savedBm = JSON.parse(localStorage.getItem(bmKey) || '[]');
    setBookmarks(savedBm);
  }, [selectedBook]);

  const handleSaveNotes = (text) => {
    setNotes(text);
    if (selectedBook) {
      localStorage.setItem(`hl_notes_${selectedBook.id}`, text);
    }
  };

  const handleAddBookmark = (e) => {
    e.preventDefault();
    if (!newBookmarkLabel.trim() || !selectedBook) return;
    const newBm = {
      id: Date.now(),
      label: newBookmarkLabel.trim(),
      date: new Date().toLocaleDateString()
    };
    const updated = [newBm, ...bookmarks];
    setBookmarks(updated);
    localStorage.setItem(`hl_bookmarks_${selectedBook.id}`, JSON.stringify(updated));
    setNewBookmarkLabel('');
  };

  const handleRemoveBookmark = (id) => {
    if (!selectedBook) return;
    const updated = bookmarks.filter(b => b.id !== id);
    setBookmarks(updated);
    localStorage.setItem(`hl_bookmarks_${selectedBook.id}`, JSON.stringify(updated));
  };

  useEffect(() => {
    if (activeBook) {
      setSelectedBook(activeBook);
    } else if (!selectedBook && digitalBooks.length > 0) {
      setSelectedBook(digitalBooks[0]);
    }
  }, [activeBook, digitalBooks]);

  // If text or markdown file, fetch its text content for rich readable rendering
  useEffect(() => {
    if (!selectedBook) return;
    const format = selectedBook.file_format?.toLowerCase();
    if (format === 'txt' || format === 'md') {
      setLoadingText(true);
      fetch(`/api/books/${selectedBook.id}/read`)
        .then(res => res.text())
        .then(text => {
          setTextContent(text);
          setLoadingText(false);
        })
        .catch(() => {
          setTextContent('Failed to load text file content.');
          setLoadingText(false);
        });
    } else {
      setTextContent('');
    }
  }, [selectedBook]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const isPdf = selectedBook?.file_format?.toLowerCase() === 'pdf';
  const isText = ['txt', 'md'].includes(selectedBook?.file_format?.toLowerCase());

  // Empty state when no digital books exist
  if (digitalBooks.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 sm:p-16 text-center border border-dashed border-slate-300 shadow-sm max-w-2xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-8 h-8 opacity-80" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          No Digital Books Cataloged Yet
        </h3>

        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6 leading-relaxed">
          The digital reading repository currently has no uploaded digital book files. You can upload PDF, EPUB, or TXT manuscripts through the Admin Portal.
        </p>

        <button
          onClick={onNavigateToAdmin}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-indigo-600/20 transition-all"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Upload Digital Book in Admin Portal</span>
        </button>
      </div>
    );
  }

  const themeClasses = {
    paper: 'bg-white text-slate-900 border-slate-200',
    night: 'bg-slate-900 text-slate-100 border-slate-800',
    sepia: 'bg-amber-50 text-amber-950 border-amber-200'
  };

  return (
    <div className={`space-y-4 ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-950 p-4 overflow-y-auto' : ''}`}>
      
      {/* Reader Top Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Book Selector Dropdown */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase text-slate-400">Currently Reading</div>
            <select
              value={selectedBook?.id || ''}
              onChange={(e) => {
                const book = digitalBooks.find(b => b.id === Number(e.target.value));
                if (book) setSelectedBook(book);
              }}
              className="font-bold text-slate-900 text-sm bg-transparent border-none focus:outline-none focus:ring-0 p-0 cursor-pointer"
            >
              {digitalBooks.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} — {b.author} ({b.file_format?.toUpperCase() || 'PDF'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action and theme tools */}
        <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
          {/* Theme toggles for text reader */}
          {isText && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs gap-1">
              <button
                onClick={() => setReadingTheme('paper')}
                title="Paper White"
                className={`p-1.5 rounded-lg ${readingTheme === 'paper' ? 'bg-white shadow text-slate-900' : 'text-slate-500'}`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReadingTheme('sepia')}
                title="Warm Sepia"
                className={`p-1.5 rounded-lg ${readingTheme === 'sepia' ? 'bg-amber-100 shadow text-amber-900' : 'text-slate-500'}`}
              >
                <Coffee className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setReadingTheme('night')}
                title="Night Mode"
                className={`p-1.5 rounded-lg ${readingTheme === 'night' ? 'bg-slate-800 shadow text-white' : 'text-slate-500'}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Font size toggle for text reader */}
          {isText && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs gap-1">
              <button
                onClick={() => setFontSize('text-sm')}
                className={`px-2 py-1 rounded-lg ${fontSize === 'text-sm' ? 'bg-white font-bold shadow' : 'text-slate-500'}`}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('text-base')}
                className={`px-2 py-1 rounded-lg ${fontSize === 'text-base' ? 'bg-white font-bold shadow' : 'text-slate-500'}`}
              >
                A
              </button>
              <button
                onClick={() => setFontSize('text-lg')}
                className={`px-2 py-1 rounded-lg ${fontSize === 'text-lg' ? 'bg-white font-bold shadow' : 'text-slate-500'}`}
              >
                A+
              </button>
            </div>
          )}

          {/* Notes & Bookmarks Toggle */}
          <button
            onClick={() => setShowNotesDrawer(!showNotesDrawer)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              showNotesDrawer
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Notes & Bookmarks ({bookmarks.length})</span>
          </button>

          {/* Download button */}
          {selectedBook && (
            <a
              href={`/api/books/${selectedBook.id}/download`}
              download
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>
          )}

          {/* Fullscreen toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Reader Container & Notes Drawer Layout */}
      {selectedBook && (
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          
          {/* Main Document Viewer */}
          <div className={`flex-1 rounded-3xl shadow-xl overflow-hidden border border-slate-200 ${
            isFullscreen ? 'h-[calc(100vh-120px)]' : 'h-[750px]'
          } flex flex-col bg-slate-900 transition-all`}>
            
            {isPdf ? (
              <iframe
                src={`/api/books/${selectedBook.id}/read#toolbar=1&navpanes=1`}
                title={selectedBook.title}
                className="w-full h-full border-none bg-slate-800"
              />
            ) : isText ? (
              <div className={`w-full h-full overflow-y-auto p-6 sm:p-12 font-serif leading-relaxed ${themeClasses[readingTheme]} ${fontSize}`}>
                <div className="max-w-3xl mx-auto">
                  <div className="mb-8 pb-4 border-b border-current/20 text-center">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
                      {selectedBook.title}
                    </h1>
                    <p className="text-sm opacity-75 italic">by {selectedBook.author}</p>
                  </div>
                  {loadingText ? (
                    <div className="py-20 text-center opacity-60">Loading book content...</div>
                  ) : (
                    <pre className="whitespace-pre-wrap font-sans font-normal leading-relaxed">
                      {textContent}
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              /* Other digital file types like EPUB */
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-white bg-slate-900">
                <Book className="w-16 h-16 text-amber-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">{selectedBook.title}</h2>
                <p className="text-sm text-slate-400 max-w-md mb-6">
                  This digital edition is packaged in <strong className="text-indigo-400 uppercase">{selectedBook.file_format || 'EPUB'}</strong> format. You can download the file to view on your favorite e-reader application.
                </p>
                <a
                  href={`/api/books/${selectedBook.id}/download`}
                  download
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                >
                  <Download className="w-4 h-4" />
                  Download {selectedBook.file_format?.toUpperCase()} Edition
                </a>
              </div>
            )}

          </div>

          {/* Collapsible Notes & Bookmarks Drawer */}
          {showNotesDrawer && (
            <div className="lg:w-80 bg-white rounded-3xl p-5 border border-slate-200 shadow-xl flex flex-col space-y-4 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <StickyNote className="w-4 h-4 text-amber-500" />
                  <span>Reader Notebook</span>
                </h3>
                <button
                  onClick={() => setShowNotesDrawer(false)}
                  className="text-xs text-slate-400 hover:text-slate-700 font-semibold"
                >
                  Close
                </button>
              </div>

              {/* Bookmarks Section */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase text-slate-500">Bookmarks</div>
                <form onSubmit={handleAddBookmark} className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Chapter 4 quote..."
                    value={newBookmarkLabel}
                    onChange={(e) => setNewBookmarkLabel(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="px-2.5 py-1 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    + Add
                  </button>
                </form>

                {bookmarks.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic py-1">No bookmarks added yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {bookmarks.map((bm) => (
                      <div
                        key={bm.id}
                        className="p-2 bg-slate-50 rounded-lg border border-slate-200/70 text-xs flex items-center justify-between group"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-semibold text-slate-800 truncate">{bm.label}</div>
                          <div className="text-[10px] text-slate-400">{bm.date}</div>
                        </div>
                        <button
                          onClick={() => handleRemoveBookmark(bm.id)}
                          className="text-slate-400 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Reading Notes Notepad */}
              <div className="flex-1 flex flex-col space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Personal Notes & Quotes</span>
                  <span className="text-[10px] text-emerald-600 font-medium">Auto-saved</span>
                </div>
                <textarea
                  rows={8}
                  value={notes}
                  onChange={(e) => handleSaveNotes(e.target.value)}
                  placeholder="Record insights, citations, reflections, or page reminders..."
                  className="w-full flex-1 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 bg-amber-50/30 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none font-sans leading-relaxed"
                />
              </div>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
