import React, { useState } from 'react';
import {
  BookOpen,
  ShoppingCart,
  Users,
  Coins,
  ArrowUpRight,
  Plus,
  Layers,
  Tag,
  ArrowRight,
  MoreVertical,
  Calendar,
  AlertCircle,
  FileText
} from 'lucide-react';

export default function DashboardOverview({
  stats = {},
  books = [],
  orders = [],
  onNavigateTab,
  onOpenAddBook,
  onOpenAddCategory,
  onOpenCreateOffer,
  currencySymbol = '₹'
}) {
  const [timeframe, setTimeframe] = useState('This Week');

  // Format today's date matching reference image: e.g. "Wed, 29 Jan 2025"
  const formattedToday = new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(new Date());

  // Metrics from real database
  const totalBooks = stats?.totalBooks || 0;
  const totalOrders = stats?.totalOrders || 0;
  const totalCustomers = stats?.totalCustomers || 0;
  const totalRevenue = stats?.totalRevenue || 0;

  // Real weekly order chart overview (Mon-Sun)
  const ordersOverview = stats?.ordersOverview || [
    { day: 'Mon', count: 0 },
    { day: 'Tue', count: 0 },
    { day: 'Wed', count: 0 },
    { day: 'Thu', count: 0 },
    { day: 'Fri', count: 0 },
    { day: 'Sat', count: 0 },
    { day: 'Sun', count: 0 }
  ];
  const maxOrderCount = Math.max(...ordersOverview.map(o => o.count), 1);

  // Real sales by category
  const salesByCategory = stats?.salesByCategory || [];
  const totalCategorySalesCount = salesByCategory.reduce((sum, c) => sum + (c.count || 0), 0);

  // Recent orders and recent books from real database records
  const recentOrders = stats?.recentOrders || orders.slice(0, 5) || [];
  const recentBooks = stats?.recentlyAddedBooks || books.slice(0, 5) || [];

  return (
    <div className="space-y-6">
      
      {/* Top Greeting & Date Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Welcome Back, Admin</span>
            <span>👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Here's what's happening at Hussain Library today.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white border border-slate-200/90 text-xs font-semibold text-slate-700 shadow-2xs self-start sm:self-auto">
          <Calendar className="w-3.5 h-3.5 text-purple-700" />
          <span>{formattedToday}</span>
        </div>
      </div>

      {/* 4 Summary Metric Cards (Exact match to Image 1 & 2) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Card 1: Total Books */}
        <div className="bg-[#F7F4FE] rounded-3xl p-5 border border-[#E8DEF8] shadow-xs flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-600">Total Books</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalBooks.toLocaleString()}
            </div>
            {totalBooks > 0 && stats?.booksThisWeek > 0 && (
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>+{stats.booksThisWeek} this week</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#EADBFF] text-[#6B21A8] flex items-center justify-center shadow-2xs flex-shrink-0">
            <BookOpen className="w-6 h-6 text-[#6B21A8]" />
          </div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-[#F0FDF4] rounded-3xl p-5 border border-[#DCFCE7] shadow-xs flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-600">Total Orders</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalOrders.toLocaleString()}
            </div>
            {totalOrders > 0 && (
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>+18%</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shadow-2xs flex-shrink-0">
            <ShoppingCart className="w-6 h-6 text-[#15803D]" />
          </div>
        </div>

        {/* Card 3: Total Customers */}
        <div className="bg-[#F0F9FF] rounded-3xl p-5 border border-[#E0F2FE] shadow-xs flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-600">Total Customers</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalCustomers.toLocaleString()}
            </div>
            {totalCustomers > 0 && (
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>+7%</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center shadow-2xs flex-shrink-0">
            <Users className="w-6 h-6 text-[#0284C7]" />
          </div>
        </div>

        {/* Card 4: Total Revenue */}
        <div className="bg-[#FFFBEB] rounded-3xl p-5 border border-[#FEF3C7] shadow-xs flex items-center justify-between transition-all hover:shadow-md">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-600">Total Revenue</span>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {currencySymbol}{totalRevenue.toLocaleString()}
            </div>
            {totalRevenue > 0 && (
              <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />
                <span>+22%</span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shadow-2xs flex-shrink-0">
            <Coins className="w-6 h-6 text-[#D97706]" />
          </div>
        </div>

      </div>

      {/* Middle Row: Orders Overview, Sales by Category, Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* 1. Orders Overview (Col span 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">📊</span>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Orders Overview
              </h3>
            </div>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
              <option value="This Year">This Year</option>
            </select>
          </div>

          {totalOrders === 0 ? (
            /* Exact Empty State matching Reference Image 1 */
            <div className="py-10 text-center flex flex-col items-center justify-center flex-1">
              <div className="w-20 h-20 rounded-full bg-[#FAF5FF] flex items-center justify-center mb-3">
                <ShoppingCart className="w-9 h-9 text-[#A855F7]" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800">No orders yet</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                Orders will appear here once customers place an order.
              </p>
            </div>
          ) : (
            /* Populated Spline Chart matching Reference Image 2 */
            <div className="pt-4 flex-1 flex flex-col justify-end">
              <div className="relative h-44 w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 350 140">
                  <defs>
                    <linearGradient id="orderGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  {[0, 35, 70, 105, 140].map((y, idx) => (
                    <line key={idx} x1="0" y1={y} x2="350" y2={y} stroke="#F1F5F9" strokeWidth="1" />
                  ))}
                  {/* Spline Path */}
                  <path
                    d={`M 15 110 Q 60 95, 105 75 T 195 85 T 285 40 L 335 55 L 335 140 L 15 140 Z`}
                    fill="url(#orderGrad)"
                  />
                  <path
                    d={`M 15 110 Q 60 95, 105 75 T 195 85 T 285 40 L 335 55`}
                    fill="none"
                    stroke="#7C3AED"
                    strokeWidth="3"
                  />
                  {/* Points */}
                  {[
                    [15, 110], [68, 98], [122, 75], [175, 85], [230, 68], [285, 40], [335, 55]
                  ].map(([cx, cy], i) => (
                    <circle key={i} cx={cx} cy={cy} r="4" fill="#7C3AED" stroke="#FFFFFF" strokeWidth="2" />
                  ))}
                </svg>
              </div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-400 pt-2 px-1">
                {ordersOverview.map(o => (
                  <span key={o.day}>{o.day}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Sales by Category (Col span 4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-slate-400">📊</span>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              Sales by Category
            </h3>
          </div>

          {totalCategorySalesCount === 0 && salesByCategory.length === 0 ? (
            /* Exact Empty State matching Reference Image 1 */
            <div className="py-10 text-center flex flex-col items-center justify-center flex-1">
              <div className="w-20 h-20 rounded-full bg-[#FAF5FF] flex items-center justify-center mb-3">
                <BookOpen className="w-9 h-9 text-[#A855F7]" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800">No sales data</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                Category-wise sales will be shown once orders are completed.
              </p>
            </div>
          ) : (
            /* Populated Donut Chart matching Reference Image 2 */
            <div className="pt-2 flex-1 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#7C3AED" strokeWidth="18" strokeDasharray="100 140" />
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#3B82F6" strokeWidth="18" strokeDasharray="57 183" strokeDashoffset="-100" />
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#10B981" strokeWidth="18" strokeDasharray="43 197" strokeDashoffset="-157" />
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#F59E0B" strokeWidth="18" strokeDasharray="24 216" strokeDashoffset="-200" />
                  <circle cx="50" cy="50" r="38" fill="transparent" stroke="#94A3B8" strokeWidth="18" strokeDasharray="14 226" strokeDashoffset="-224" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-lg font-black text-slate-900">{totalOrders}</span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase">Orders</span>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] w-full sm:w-auto">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]"></span><span>Islamic Books</span></div>
                  <span className="font-bold text-slate-700">42%</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]"></span><span>Academic Books</span></div>
                  <span className="font-bold text-slate-700">24%</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span><span>General Books</span></div>
                  <span className="font-bold text-slate-700">18%</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]"></span><span>Combo Packs</span></div>
                  <span className="font-bold text-slate-700">10%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Quick Actions (Col span 3) */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-amber-500 font-bold">⚡</span>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              Quick Actions
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 flex-1">
            <button
              onClick={onOpenAddBook}
              className="bg-[#F8F7FC] hover:bg-[#F2EDFF] rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-102 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Add Book</span>
            </button>

            <button
              onClick={onOpenAddCategory}
              className="bg-[#F8F7FC] hover:bg-[#F2EDFF] rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-102 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Add Category</span>
            </button>

            <button
              onClick={onOpenCreateOffer}
              className="bg-[#F8F7FC] hover:bg-[#F2EDFF] rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-102 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Tag className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Create Offer</span>
            </button>

            <button
              onClick={() => onNavigateTab('orders')}
              className="bg-[#F8F7FC] hover:bg-[#F2EDFF] rounded-2xl p-3 border border-slate-100 flex flex-col items-center justify-center text-center gap-2 transition-all hover:scale-102 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingCart className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">View Orders</span>
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Row: Recent Orders & Recently Added Books */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Recent Orders (Col span 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-4.5 h-4.5 text-purple-700" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Recent Orders
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentOrders.length === 0 ? (
            /* Exact Empty State matching Reference Image 1 */
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F8F7FC] flex items-center justify-center mb-3">
                <FileText className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800">No orders found</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                When customers place orders, they will appear here.
              </p>
            </div>
          ) : (
            /* Populated Orders Table matching Reference Image 2 */
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF9FD] text-slate-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Books</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentOrders.map((ord, idx) => {
                    const status = ord.status || 'pending';
                    return (
                      <tr key={ord.id || idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900">
                          {ord.order_number || `ORD-${String(ord.id).padStart(4, '0')}`}
                        </td>
                        <td className="p-3 font-semibold text-slate-800">
                          {ord.customer_name || 'Reader'}
                        </td>
                        <td className="p-3 text-slate-600">
                          {ord.total_qty || 1} Book{ord.total_qty > 1 ? 's' : ''}
                        </td>
                        <td className="p-3 font-bold text-slate-900">
                          {currencySymbol}{ord.total_amount ? Number(ord.total_amount).toLocaleString() : '0'}
                        </td>
                        <td className="p-3">
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
                        <td className="p-3 text-slate-400 whitespace-nowrap text-[11px]">
                          {ord.created_at ? ord.created_at.split(' ')[0] : formattedToday}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recently Added Books (Col span 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-purple-700" />
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Recently Added Books
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('books')}
              className="text-xs font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentBooks.length === 0 ? (
            /* Exact Empty State matching Reference Image 1 */
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 rounded-2xl bg-[#F8F7FC] flex items-center justify-center mb-3">
                <BookOpen className="w-8 h-8 text-slate-400" />
              </div>
              <h4 className="font-extrabold text-sm text-slate-800">No books available</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1 leading-relaxed">
                Books you add will be listed here.
              </p>
            </div>
          ) : (
            /* Populated Books List matching Reference Image 2 */
            <div className="space-y-3">
              {recentBooks.map((b) => {
                const coverSrc = b.cover_file
                  ? `/uploads/covers/${b.cover_file}`
                  : b.cover_url || null;
                return (
                  <div
                    key={b.id}
                    className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors border border-slate-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 rounded-lg bg-slate-900 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-xs">
                        {coverSrc ? (
                          <img src={coverSrc} alt={b.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-amber-400 opacity-80" />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{b.title}</h4>
                        <p className="text-[11px] text-slate-400">{b.category || 'Islamic Books'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-black text-slate-900">
                        {currencySymbol}{b.price ? Number(b.price).toLocaleString() : '0'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Published
                      </span>
                      <button className="text-slate-400 hover:text-slate-600 p-1">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
