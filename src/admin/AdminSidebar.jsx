import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  LayoutGrid,
  ShoppingCart,
  Users,
  Tag,
  BarChart3,
  Settings,
  Shield,
  Clock,
  LogOut,
  ChevronRight,
  X
} from 'lucide-react';

export default function AdminSidebar({
  activeTab,
  setActiveTab,
  onLogout,
  isOpen,
  onClose,
  stats = null
}) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'books', label: 'Books', icon: BookOpen, hasChevron: true },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'orders', label: 'Orders', icon: ShoppingCart, badge: stats?.totalOrders || 0 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'offers', label: 'Offers & Combos', icon: Tag },
    { id: 'reports', label: 'Reports', icon: BarChart3, hasChevron: true },
    { id: 'settings', label: 'Website Settings', icon: Settings },
    { id: 'admin-users', label: 'Admin Users', icon: Shield },
    { id: 'activity-logs', label: 'Activity Logs', icon: Clock }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gradient-to-b from-[#180d2d] via-[#1f103b] to-[#120824] text-white flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-white/5 shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header Section */}
        <div className="p-5 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src="/logo.jpg"
                alt="Hussain Library"
                className="h-10 w-auto object-contain rounded-lg bg-white p-1"
              />
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-white leading-tight">
                  HUSSAIN LIBRARY
                </h1>
                <p className="text-[10px] font-serif italic text-purple-200/70">
                  Knowledge Beyond Pages
                </p>
              </div>
            </div>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Admin Panel Badge */}
          <div className="mt-4 pt-3 border-t border-white/10 text-center">
            <span className="text-[11px] font-semibold text-purple-200/90 tracking-wider uppercase">
              Admin Panel
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 no-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-[#7C3AED]/30 font-bold'
                    : 'text-purple-200/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-300'}`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="bg-[#E11D48] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {item.badge}
                    </span>
                  )}
                  {item.hasChevron && (
                    <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-purple-400'}`} />
                  )}
                </div>
              </button>
            );
          })}

          {/* Logout Button */}
          <div className="pt-2">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </nav>

        {/* Bottom Silhouette & Ambient Glow (Mosque Skyline matching Image 1 & 2) */}
        <div className="relative h-28 overflow-hidden pointer-events-none mt-auto">
          {/* Golden Ambient Radial Glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-28 bg-[#D9A441]/20 rounded-full blur-2xl"></div>
          
          {/* Mosque Minarets and Domes SVG Silhouette */}
          <svg
            className="absolute bottom-0 w-full h-24 text-[#D9A441]/35 fill-current opacity-80"
            viewBox="0 0 300 120"
            preserveAspectRatio="none"
          >
            {/* Soft Crescent Moon */}
            <circle cx="210" cy="20" r="10" fill="#FDE047" opacity="0.6" />
            <circle cx="214" cy="18" r="9" fill="#130924" />

            {/* Left Minaret */}
            <rect x="25" y="30" width="8" height="90" rx="2" />
            <polygon points="21,30 29,10 37,30" />
            <rect x="23" y="55" width="12" height="3" rx="1" />
            <circle cx="29" cy="8" r="2" fill="#FDE047" />

            {/* Small Dome Left */}
            <path d="M 50 120 L 50 80 Q 70 50 90 80 L 90 120 Z" />
            <circle cx="70" cy="50" r="2.5" fill="#FDE047" />

            {/* Grand Central Dome */}
            <path d="M 100 120 L 100 70 Q 150 25 200 70 L 200 120 Z" />
            <rect x="148" y="22" width="4" height="15" />
            <circle cx="150" cy="20" r="3" fill="#FDE047" />

            {/* Right Dome */}
            <path d="M 210 120 L 210 75 Q 235 48 260 75 L 260 120 Z" />
            <circle cx="235" cy="48" r="2.5" fill="#FDE047" />

            {/* Far Right Minaret */}
            <rect x="275" y="25" width="8" height="95" rx="2" />
            <polygon points="271,25 279,5 287,25" />
            <rect x="273" y="50" width="12" height="3" rx="1" />
            <circle cx="279" cy="4" r="2" fill="#FDE047" />
          </svg>
        </div>
      </aside>
    </>
  );
}
