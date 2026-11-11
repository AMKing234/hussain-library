import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Package,
  Calendar,
  ShieldCheck,
  LogOut,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  BookOpen
} from 'lucide-react';
import { api } from '../api';

export default function CustomerProfileModal({
  isOpen,
  onClose,
  currentUser,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'profile'
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    if (isOpen && currentUser) {
      loadOrders();
    }
  }, [isOpen, currentUser]);

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const allOrders = await api.getOrders();
      // Filter orders by customer email or username
      const customerOrders = (allOrders || []).filter(o => 
        (o.customer_email && currentUser.email && o.customer_email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (o.customer_name && currentUser.name && o.customer_name.toLowerCase() === currentUser.name.toLowerCase())
      );
      setOrders(customerOrders);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  if (!isOpen || !currentUser) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#131127] w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 dark:border-purple-900/30 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#17143D] via-[#2A1E5C] to-[#3B1F7E] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-extrabold text-[#D9A441]">
              {(currentUser.name || currentUser.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{currentUser.name || currentUser.username}</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified Reader</span>
                </span>
              </div>
              <p className="text-xs text-purple-200/80 mt-0.5">{currentUser.email || 'Hussain Library Patron'}</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="grid grid-cols-2 p-1 bg-white/10 rounded-2xl mt-5 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'orders'
                  ? 'bg-white text-[#17143D] shadow-xs font-bold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>My Orders ({orders.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-1.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'profile'
                  ? 'bg-white text-[#17143D] shadow-xs font-bold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Reader Profile</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1">
          {activeTab === 'orders' && (
            <div className="space-y-3">
              {loadingOrders ? (
                <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                  Loading your purchase and borrowing history...
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">No Orders Placed Yet</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-4">
                    Books or combo bundles you purchase or reserve will be tracked right here with real-time delivery status.
                  </p>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-[#17143D] dark:bg-purple-600 hover:bg-[#251f5c] text-white text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl border border-slate-200/80 dark:border-purple-900/30 bg-slate-50/50 dark:bg-[#181533] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#17143D] dark:text-purple-300">
                          #{order.order_number || `ORD-${order.id}`}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        order.order_status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : order.order_status === 'shipped'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}>
                        {order.order_status || 'Pending'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/50 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">
                        {order.items_count || (order.items ? order.items.length : 1)} {order.items_count === 1 ? 'Book' : 'Books'}
                      </span>
                      <span className="font-extrabold text-[#17143D] dark:text-[#D9A441]">
                        ₹{order.total_amount || 0}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#181533] border border-slate-200/80 dark:border-purple-900/30 space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Full Name</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser.name || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Email Address</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{currentUser.email || currentUser.username}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Account Type</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                      {currentUser.role === 'admin' ? 'Library Administrator' : 'General Reader / Member'}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full py-2.5 rounded-xl border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Account</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
