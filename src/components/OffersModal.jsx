import React from 'react';
import { Tag, Sparkles, BookOpen, Layers, CheckCircle2, ArrowRight, X } from 'lucide-react';

export default function OffersModal({ isOpen, onClose, onBrowseCatalog }) {
  if (!isOpen) return null;

  const offers = [
    {
      title: 'Scholars Classical Reading Pass',
      badge: 'POPULAR',
      badgeColor: 'bg-amber-100 text-amber-800',
      desc: 'Unlimited free digital reading of open-access rare manuscripts and reference publications.',
      perks: ['Full PDF & EPUB in-browser reader', 'Zero subscription fees', 'Instant citation export']
    },
    {
      title: 'Digital & Physical Combo Pack',
      badge: 'LIBRARY EXCLUSIVE',
      badgeColor: 'bg-purple-100 text-purple-800',
      desc: 'Check out the physical edition at the desk and receive instant digital access token for off-site research.',
      perks: ['Shelf-location guided checkout', '30-day multi-device token', 'Physical copy loan protection']
    },
    {
      title: 'Academic Research Reserve',
      badge: 'STUDENT SPECIAL',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      desc: 'Reserve in-demand academic volumes for study hall usage with priority allocation.',
      perks: ['Queue reservation notifications', 'Guaranteed shelf hold for 48 hours', 'Zero late return fees for scholars']
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-[#131127] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-purple-900/30 relative max-h-[90vh] overflow-y-auto transition-colors">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-purple-900/40 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F2EDFF] dark:bg-purple-950/60 text-[#33216B] dark:text-purple-300 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#D9A441]" />
            <span>Library Privileges & Offers</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17143D] dark:text-white">
            Curated Reading Packs & Offers
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Explore active reading privileges, multi-format bundles, and research access available at Hussain Library.
          </p>
        </div>

        <div className="space-y-4 mb-6">
          {offers.map((offer, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-r from-slate-50 via-white to-[#FAF8FC] dark:from-[#181433] dark:via-[#1c173d] dark:to-[#181433] rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-purple-900/30 hover:border-[#33216B]/40 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${offer.badgeColor}`}>
                  {offer.badge}
                </span>
                <Tag className="w-4 h-4 text-[#D9A441]" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1">{offer.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">{offer.desc}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {offer.perks.map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            onClose();
            if (onBrowseCatalog) onBrowseCatalog();
          }}
          className="w-full py-3 bg-[#17143D] dark:bg-purple-700 hover:bg-[#251f5c] dark:hover:bg-purple-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#17143D]/20 transition-all cursor-pointer"
        >
          <span>Explore Books in Catalog</span>
          <ArrowRight className="w-4 h-4 text-[#D9A441]" />
        </button>
      </div>
    </div>
  );
}
