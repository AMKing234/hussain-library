import React, { useState } from 'react';
import { ShoppingCart, Search, Filter, Eye, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
import { api } from '../../api';

export default function OrdersView({
  orders = [],
  refreshOrders,
  currencySymbol = '₹'
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      if (refreshOrders) refreshOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const filtered = orders.filter(o => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        o.order_number?.toLowerCase().includes(q) ||
        o.customer_name?.toLowerCase().includes(q) ||
        o.customer_email?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Orders & Purchases
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track reader checkouts, Bagisto eCommerce transactions, and delivery fulfillment.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order ID, customer name, or email..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F7FC] rounded-xl text-xs font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#F8F7FC] border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">All Statuses ({orders.length})</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table or Zero State */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F8F7FC] flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-800">
              {orders.length === 0 ? 'No orders have been received.' : 'No matching orders found'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {orders.length === 0
                ? 'Your library is operating with zero mock records. As readers purchase books, transactions will appear here.'
                : 'Try adjusting your search query or status filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF9FD] text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Books Quantity</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ord) => {
                  const status = ord.status || 'pending';
                  return (
                    <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {ord.order_number || `ORD-${String(ord.id).padStart(4, '0')}`}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{ord.customer_name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{ord.customer_email}</div>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">
                        {ord.total_qty || 1} Item{ord.total_qty > 1 ? 's' : ''}
                      </td>
                      <td className="p-4 font-black text-slate-900">
                        {currencySymbol}{ord.total_amount ? Number(ord.total_amount).toLocaleString() : '0'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                            status === 'completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : status === 'processing'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : status === 'cancelled'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 text-[11px] whitespace-nowrap">
                        {ord.created_at || '—'}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 text-[#7C3AED] hover:bg-purple-100 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {selectedOrder.order_number || `Order #${selectedOrder.id}`}
                </h3>
                <p className="text-[11px] text-slate-400">{selectedOrder.created_at}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Customer</div>
                <div className="font-bold text-slate-900">{selectedOrder.customer_name}</div>
                <div className="text-slate-600 font-mono">{selectedOrder.customer_email}</div>
                {selectedOrder.customer_phone && <div className="text-slate-600">{selectedOrder.customer_phone}</div>}
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Total Amount</div>
                  <div className="text-lg font-black text-slate-900">
                    {currencySymbol}{selectedOrder.total_amount ? Number(selectedOrder.total_amount).toLocaleString() : '0'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold text-right mb-1">Status</div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold capitalize bg-purple-100 text-purple-900">
                    {selectedOrder.status || 'pending'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Update Order Status</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                    className="py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 transition-colors cursor-pointer"
                  >
                    Processing
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                    className="py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                  >
                    Completed
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                    className="py-2 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
