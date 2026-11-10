import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Maximize2,
  Minimize2,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';

export default function AdminHeader({
  onToggleSidebar,
  currentUser,
  onLogout,
  onOpenSearch,
  notifications = []
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const initial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 shadow-2xs">
      {/* Left: Menu toggle & Global Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search Bar matching Image 1 & 2 */}
        <div
          onClick={onOpenSearch}
          className="relative flex-1 flex items-center bg-[#F8F7FC] hover:bg-slate-100 rounded-2xl border border-slate-200/90 px-3.5 py-2 cursor-pointer transition-colors group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-slate-600 mr-2.5 flex-shrink-0" />
          <span className="text-xs text-slate-400 font-medium truncate flex-1 select-none">
            Search books, orders, customers...
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono font-semibold bg-white text-slate-500 border border-slate-200 px-2 py-0.5 rounded-lg shadow-2xs">
            Ctrl + K
          </span>
        </div>
      </div>

      {/* Right Actions: Notifications, Fullscreen, Admin Profile */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 animate-in fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                <span className="text-[10px] font-semibold text-purple-600">Live Status</span>
              </div>
              <div className="space-y-2 text-xs text-slate-600">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[11px]">System Ready</p>
                    <p className="text-[10px] text-purple-700/80">Database online on Port 3010</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="hidden sm:flex w-9 h-9 sm:w-10 sm:h-10 rounded-full items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4.5 h-4.5" /> : <Maximize2 className="w-4.5 h-4.5" />}
        </button>

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-full sm:rounded-2xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#180d2d] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {initial}
            </div>
            <div className="hidden md:block text-left">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser?.name || 'Admin'}
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Owner</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{currentUser?.name || 'Admin'}</p>
                <p className="text-[11px] text-slate-500 font-mono truncate">{currentUser?.email || 'admin@hussainlibrary.org'}</p>
              </div>

              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Public Library (Port 3000)</span>
              </a>

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
