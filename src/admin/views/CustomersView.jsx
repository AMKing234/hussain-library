import React, { useState } from 'react';
import { Users, Search, Mail, Phone, MapPin, CheckCircle, Shield } from 'lucide-react';

export default function CustomersView({
  members = [],
  orders = [],
  refreshMembers
}) {
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = members.filter(m => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        m.name?.toLowerCase().includes(q) ||
        m.email?.toLowerCase().includes(q) ||
        m.membership_id?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Customers & Patron Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered patrons, library cardholders, and digital readers.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patron name, email, or membership ID..."
            className="w-full pl-10 pr-4 py-2 bg-[#F8F7FC] rounded-xl text-xs font-medium border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
          />
        </div>
      </div>

      {/* Customers Table or Zero State */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F8F7FC] flex items-center justify-center mx-auto mb-3">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-800">
              {members.length === 0 ? 'No customer records available.' : 'No matching customers found'}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              {members.length === 0
                ? 'Your patron directory operates on actual records. When readers sign up or borrow physical volumes, they will appear here.'
                : 'Try adjusting your search criteria.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF9FD] text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Patron Name & ID</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Address</th>
                  <th className="p-4">Active Loans</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Joined Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{m.name}</div>
                      <div className="text-[10px] font-mono text-purple-700">{m.membership_id}</div>
                    </td>
                    <td className="p-4 text-slate-600">
                      <div>{m.email || '—'}</div>
                      {m.phone && <div className="text-slate-400 font-mono text-[11px]">{m.phone}</div>}
                    </td>
                    <td className="p-4 text-slate-500">{m.address || '—'}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                        {m.active_loans_count || 0} Active
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 capitalize">
                        {m.status || 'active'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 text-[11px] whitespace-nowrap">
                      {m.created_at ? m.created_at.split(' ')[0] : '—'}
                    </td>
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
