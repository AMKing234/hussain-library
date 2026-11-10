import React from 'react';
import { X, Printer, MapPin, Book, Layers, QrCode } from 'lucide-react';

export default function ShelfTagModal({ book, onClose }) {
  if (!book) return null;

  const handlePrint = () => {
    window.print();
  };

  // Generate a deterministic visual barcode pattern based on ID & ISBN/Shelf
  const codeString = `${book.isbn || `HL-${book.id}`}-${book.shelf_location || 'STACK'}`;
  const barPattern = Array.from(codeString).map((char, i) => {
    const code = char.charCodeAt(0);
    return (code % 4) + 1; // widths 1 to 4
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-base">Printable Shelf & Spine Label</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label Area */}
        <div className="p-6">
          <div className="text-xs text-slate-500 mb-4">
            Print this standardized label to paste on the book spine or shelf compartment:
          </div>

          <div
            id="printable-shelf-tag"
            className="border-2 border-dashed border-slate-800 rounded-xl p-5 bg-white text-slate-900 space-y-4 shadow-sm"
          >
            {/* Header / Brand */}
            <div className="flex items-center justify-between border-b pb-2 border-slate-800">
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tighter uppercase">Hussain Library</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                REF #{book.id}
              </span>
            </div>

            {/* Book Metadata */}
            <div>
              <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                {book.category || 'General Collection'}
              </div>
              <h2 className="text-lg font-black leading-tight text-slate-950 mt-0.5">
                {book.title}
              </h2>
              <p className="text-xs font-semibold text-slate-700 mt-0.5">
                {book.author}
              </p>
            </div>

            {/* Shelf Location High-Visibility Box */}
            <div className="bg-slate-950 text-white p-3 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-[10px] text-amber-400 uppercase font-bold tracking-widest flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Shelf Location
                </div>
                <div className="font-mono text-base font-black tracking-wide">
                  {book.shelf_location || 'Main Stacks'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Total Copies</div>
                <div className="text-base font-black text-amber-300">{book.total_copies || 1}</div>
              </div>
            </div>

            {/* Barcode Visualization */}
            <div className="pt-2 flex flex-col items-center justify-center border-t border-slate-200">
              <div className="flex items-center gap-[2px] h-10 w-full max-w-xs justify-center">
                {barPattern.map((width, idx) => (
                  <div
                    key={idx}
                    style={{ width: `${width * 2}px` }}
                    className="h-full bg-slate-900"
                  />
                ))}
              </div>
              <div className="font-mono text-[11px] font-bold text-slate-700 tracking-widest mt-1">
                {book.isbn ? `ISBN ${book.isbn}` : `HL-${book.id}-${book.shelf_location || 'STK'}`}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Standard 3" x 4" Tag Format</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-200/60 text-xs font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Label</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
