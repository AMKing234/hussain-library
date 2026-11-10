import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  CheckCircle2,
  Download,
  Printer,
  Book,
  BookOpen,
  Layers,
  MapPin,
  AlertCircle,
  FileText
} from 'lucide-react';
import { api } from '../api';

export default function CartModal({
  isOpen,
  onClose,
  cart = [],
  onRemoveFromCart,
  onClearCart,
  onOrderCompleted
}) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [completedOrder, setCompletedOrder] = useState(null);

  if (!isOpen) return null;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!customerName.trim() || !customerEmail.trim()) {
      setError('Please provide your name and email address.');
      return;
    }

    setSubmitting(true);
    setError('');

    const payload = {
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim(),
      customer_phone: customerPhone.trim(),
      notes: notes.trim(),
      items: cart.map(item => ({
        book_id: item.id,
        type: item.selectedType || item.type,
        qty: 1
      }))
    };

    try {
      const res = await api.createOrder(payload);
      setCompletedOrder(res);
      onClearCart();
      if (onOrderCompleted) onOrderCompleted();
    } catch (err) {
      setError(err.message || 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2 font-bold text-base">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>Library Cart & Checkout (Bagisto Pattern)</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Order Completed -> Invoice & Download Screen */}
        {completedOrder ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Order Confirmed!</h2>
              <p className="text-xs text-slate-500">
                Order <strong className="font-mono text-indigo-700">{completedOrder.order?.order_number}</strong> has been processed.
              </p>
            </div>

            {/* Printable Invoice Container */}
            <div id="printable-order-invoice" className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 sm:p-5 text-xs space-y-3">
              <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                <div>
                  <div className="font-bold text-slate-900 text-sm">Hussain Library</div>
                  <div className="text-[11px] text-slate-500">Circulation & Digital Order Receipt</div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-slate-800">{completedOrder.order?.order_number}</div>
                  <div className="text-[10px] text-slate-400">{completedOrder.order?.created_at}</div>
                </div>
              </div>

              <div>
                <div className="text-slate-500">Patron Name: <strong className="text-slate-800">{completedOrder.order?.customer_name}</strong></div>
                <div className="text-slate-500">Email: <span className="font-mono text-slate-700">{completedOrder.order?.customer_email}</span></div>
              </div>

              {/* Order Items List */}
              <div className="border-t border-slate-200 pt-2 space-y-1.5">
                <div className="font-bold uppercase text-[10px] text-slate-400 tracking-wider">Ordered Items</div>
                {completedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-none">
                    <span className="font-semibold text-slate-800">{item.book_title}</span>
                    <span className="capitalize text-slate-500 font-mono text-[11px]">
                      {item.book_type} {item.shelf_location ? `(${item.shelf_location})` : ''}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bagisto-style Digital Download Tokens */}
              {completedOrder.download_tokens && completedOrder.download_tokens.length > 0 && (
                <div className="border-t border-indigo-200 pt-3 space-y-2 bg-indigo-50/60 p-3 rounded-xl">
                  <div className="font-bold text-indigo-900 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Your Secure Digital Download Links</span>
                  </div>
                  <div className="space-y-1.5">
                    {completedOrder.download_tokens.map((dt, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-indigo-200/80">
                        <div>
                          <div className="font-semibold text-slate-800">{dt.book_title}</div>
                          <div className="text-[10px] text-slate-400">
                            {dt.downloads_remaining} downloads remaining • Valid for 30 days
                          </div>
                        </div>
                        <a
                          href={`/api/downloads/${dt.token}`}
                          download
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handlePrintInvoice}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={() => {
                  setCompletedOrder(null);
                  onClose();
                }}
                className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        ) : cart.length === 0 ? (
          /* Empty Cart */
          <div className="p-12 text-center space-y-3">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Your Cart is Empty</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Browse the library catalog and tap "Add to Cart" on physical or digital titles to checkout.
            </p>
            <button
              onClick={onClose}
              className="mt-3 px-5 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
            >
              Explore Catalog
            </button>
          </div>
        ) : (
          /* Cart Items & Checkout Form */
          <form onSubmit={handleCheckout} className="p-6 space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
              {cart.map((item) => {
                const isDigital = item.selectedType === 'digital' || item.type === 'digital';
                const isPhysical = item.selectedType === 'physical' || item.type === 'physical';

                return (
                  <div
                    key={item.id}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-10 bg-slate-900 rounded text-amber-400 flex items-center justify-center flex-shrink-0">
                        {isDigital ? <BookOpen className="w-4 h-4 text-indigo-300" /> : <Layers className="w-4 h-4 text-amber-300" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{item.title}</div>
                        <div className="text-[11px] text-slate-500">by {item.author}</div>
                        <div className="mt-0.5">
                          {isDigital ? (
                            <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                              Digital License (Direct Download Token)
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              Physical Copy • {item.shelf_location || 'Main Stacks'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveFromCart(item.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Customer Details Form */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Customer & Patron Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Abdul Maleque"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Email Address * (For Digital Licenses)
                  </label>
                  <input
                    type="email"
                    required
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Contact Phone (Optional)
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+92 300 1234567"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Pickup / Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Will pick up physical copies from Main Desk..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Total Items: <strong>{cart.length}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Processing Order...' : 'Complete Order'}
                </button>
              </div>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
