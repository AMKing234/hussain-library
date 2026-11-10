import React from 'react';
import { BarChart3, Download, TrendingUp, BookOpen, ShoppingCart, Users, Coins } from 'lucide-react';
import { api } from '../../api';

export default function ReportsView({
  stats = {},
  currencySymbol = '₹'
}) {
  const handleExport = (type) => {
    window.open(api.getExportUrl(type), '_blank');
  };

  const totalBooks = stats?.totalBooks || 0;
  const totalOrders = stats?.totalOrders || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const totalMembers = stats?.totalMembers || 0;
  const totalReads = stats?.totalReads || 0;
  const totalDownloads = stats?.totalDownloads || 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Analytics & Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real performance summaries and exportable circulation data.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleExport('books')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Books CSV</span>
          </button>
          <button
            onClick={() => handleExport('loans')}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Loans CSV</span>
          </button>
          <button
            onClick={() => handleExport('members')}
            className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-2xl flex items-center gap-1.5 shadow-md shadow-[#7C3AED]/20 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Members CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="text-xs font-bold text-slate-500 mb-1">Gross Digital & Physical Revenue</div>
          <div className="text-2xl font-black text-slate-900">
            {currencySymbol}{totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Calculated from actual completed orders</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="text-xs font-bold text-slate-500 mb-1">Digital Engagement</div>
          <div className="text-2xl font-black text-purple-700">
            {totalReads} Reads • {totalDownloads} Downloads
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Reader interactions recorded in SQLite</p>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs">
          <div className="text-xs font-bold text-slate-500 mb-1">Circulation Velocity</div>
          <div className="text-2xl font-black text-emerald-700">
            {stats?.activeLoans || 0} Active Loans
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{stats?.returnedLoans || 0} physical returns processed</p>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
        <h3 className="font-extrabold text-sm text-slate-900 mb-4">
          Sales & Circulation by Category
        </h3>
        {(!stats?.salesByCategory || stats.salesByCategory.length === 0) ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            No category transactions yet. Data will populate as orders are completed.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF9FD] text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-3">Category</th>
                  <th className="p-3">Order Items Sold</th>
                  <th className="p-3">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.salesByCategory.map((c, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{c.category}</td>
                    <td className="p-3 text-slate-600">{c.count} Items</td>
                    <td className="p-3 font-bold text-slate-900">{currencySymbol}{c.total_amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
