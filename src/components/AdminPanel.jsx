import React, { useState, useEffect } from 'react';
import {
  Shield,
  Book,
  BookOpen,
  Layers,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Plus,
  Trash2,
  Edit,
  RotateCcw,
  Search,
  Filter,
  UserCheck,
  TrendingUp,
  Download,
  Clock,
  Sparkles,
  Info,
  ShoppingBag
} from 'lucide-react';
import { api } from '../api';

export default function AdminPanel({
  currentUser,
  onLoginSuccess,
  onLogout,
  systemStatus,
  refreshSystemStatus,
  books = [],
  refreshBooks,
  onOpenBookModal,
  onOpenIssueModal,
  onOpenMemberModal
}) {
  // If system is uninitialized (first run)
  const [setupName, setSetupName] = useState('');
  const [setupUsername, setSetupUsername] = useState('admin');
  const [setupPassword, setSetupPassword] = useState('');
  const [setupEmail, setSetupEmail] = useState('');
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState('');

  // Login form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Admin sub-navigation tabs
  const [adminTab, setAdminTab] = useState('dashboard'); // 'dashboard', 'books', 'loans', 'members', 'reservations', 'settings'

  // Admin data states
  const [stats, setStats] = useState(null);
  const [loans, setLoans] = useState([]);
  const [members, setMembers] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [bookRequests, setBookRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({
    daily_fine_rate: '1.00',
    currency_symbol: '$',
    default_loan_days: '14',
    max_renewals: '3'
  });
  const [loadingData, setLoadingData] = useState(false);
  const [loanFilter, setLoanFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionMessage, setActionMessage] = useState('');

  // Fetch admin stats & collections
  const loadAdminData = async () => {
    if (!currentUser) return;
    setLoadingData(true);
    try {
      const [s, l, m, r, o, cfg, reqs] = await Promise.all([
        api.getStats().catch(() => null),
        api.getLoans('all').catch(() => []),
        api.getMembers().catch(() => []),
        api.getReservations().catch(() => []),
        api.getOrders().catch(() => []),
        api.getSettings().catch(() => ({})),
        api.getBookRequests().catch(() => [])
      ]);
      setStats(s);
      setLoans(l || []);
      setMembers(m || []);
      setReservations(r || []);
      setOrders(o || []);
      setBookRequests(reqs || []);
      if (cfg && Object.keys(cfg).length > 0) {
        setSettings(prev => ({ ...prev, ...cfg }));
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadAdminData();
    }
  }, [currentUser]);

  // Handle first-time admin setup
  const handleSetup = async (e) => {
    e.preventDefault();
    setSetupLoading(true);
    setSetupError('');
    try {
      const res = await api.setupAdmin({
        name: setupName,
        username: setupUsername,
        password: setupPassword,
        email: setupEmail
      });
      onLoginSuccess(res.token, res.user);
      refreshSystemStatus();
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setSetupError('Cannot connect to library server. Please verify the backend is running on http://localhost:3000.');
      } else {
        setSetupError(err.message || 'Failed to setup admin account');
      }
    } finally {
      setSetupLoading(false);
    }
  };

  // Handle standard login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');
    try {
      const res = await api.login({
        username: loginUsername,
        password: loginPassword
      });
      onLoginSuccess(res.token, res.user);
    } catch (err) {
      if (err.message === 'Failed to fetch') {
        setLoginError('Cannot connect to library server. Please verify the backend is running on http://localhost:3000.');
      } else {
        setLoginError(err.message || 'Invalid username or password');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  // Delete a book
  const handleDeleteBook = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.deleteBook(id);
      setActionMessage(`"${title}" deleted successfully.`);
      refreshBooks();
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete book');
    }
  };

  // Update book request status
  const handleBookRequestStatus = async (requestId, status) => {
    try {
      await api.updateBookRequestStatus(requestId, status);
      setActionMessage(`Book request marked as ${status}.`);
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update request');
    }
  };

  // Return a loan
  const handleReturnLoan = async (loanId) => {
    try {
      await api.returnLoan(loanId);
      setActionMessage('Book copy marked as returned and restored to shelf.');
      refreshBooks();
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to return loan');
    }
  };

  // Renew a loan
  const handleRenewLoan = async (loanId) => {
    try {
      const res = await api.renewLoan(loanId, parseInt(settings.default_loan_days, 10) || 14);
      setActionMessage(res.message || 'Loan renewed successfully.');
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to renew loan');
    }
  };

  // Save library policy settings
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      await api.updateSettings(settings);
      setActionMessage('Library policies and fine rates saved successfully.');
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    }
  };

  // Delete a member
  const handleDeleteMember = async (memberId, name) => {
    if (!window.confirm(`Are you sure you want to remove member "${name}"?`)) return;
    try {
      await api.deleteMember(memberId);
      setActionMessage(`Member "${name}" removed.`);
      loadAdminData();
      setTimeout(() => setActionMessage(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to remove member');
    }
  };

  // Fulfill/cancel reservation
  const handleReservationStatus = async (id, status) => {
    try {
      await api.updateReservationStatus(id, status);
      loadAdminData();
    } catch (err) {
      alert(err.message || 'Failed to update reservation');
    }
  };

  // 1. Initial Admin Setup Screen (Zero admin users exist)
  if (!systemStatus?.initialized) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-amber-500/20">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Initialize Admin Portal</h2>
          <p className="text-xs text-slate-500 mt-1">
            Welcome to Hussain Library. Create the master administrator profile to begin.
          </p>
        </div>

        {setupError && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{setupError}</span>
          </div>
        )}

        <form onSubmit={handleSetup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Admin Full Name *
            </label>
            <input
              type="text"
              required
              value={setupName}
              onChange={(e) => setSetupName(e.target.value)}
              placeholder="e.g. Chief Librarian"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Admin Username *
            </label>
            <input
              type="text"
              required
              value={setupUsername}
              onChange={(e) => setSetupUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password *
            </label>
            <input
              type="password"
              required
              minLength={5}
              value={setupPassword}
              onChange={(e) => setSetupPassword(e.target.value)}
              placeholder="Minimum 5 characters"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Email (Optional)
            </label>
            <input
              type="email"
              value={setupEmail}
              onChange={(e) => setSetupEmail(e.target.value)}
              placeholder="admin@hussainlibrary.org"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="submit"
            disabled={setupLoading}
            className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            {setupLoading ? 'Creating Master Account...' : 'Complete Setup & Sign In'}
          </button>
        </form>
      </div>
    );
  }

  // 2. Admin Login Screen (Admin user exists but logged out)
  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-3xl p-8 shadow-xl border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-slate-900 text-amber-400 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Sign In</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access Hussain Library management & circulation desk
          </p>
        </div>

        {loginError && (
          <div className="p-3 mb-4 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={loginUsername}
              onChange={(e) => setLoginUsername(e.target.value)}
              placeholder="Enter username"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loginLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50"
          >
            {loginLoading ? 'Authenticating...' : 'Sign In to Admin Portal'}
          </button>
        </form>
      </div>
    );
  }

  // 3. Authenticated Admin Dashboard & Operations
  return (
    <div className="space-y-6">
      
      {/* Admin Header Banner */}
      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>Administrator Control Center</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1">
            Hussain Library Admin Portal
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Logged in as <strong className="text-slate-200">{currentUser.name || currentUser.username}</strong> ({currentUser.role})
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenBookModal()}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Book</span>
          </button>

          <button
            onClick={() => onOpenIssueModal()}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Calendar className="w-4 h-4" />
            <span>Issue Loan</span>
          </button>

          <button
            onClick={() => onOpenMemberModal()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium rounded-xl text-xs flex items-center gap-1.5 transition-colors"
          >
            <Users className="w-4 h-4" />
            <span>New Member</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-xl border border-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 text-sm">
        <button
          onClick={() => setAdminTab('dashboard')}
          className={`px-4 py-2 font-semibold rounded-xl text-xs whitespace-nowrap transition-all ${
            adminTab === 'dashboard'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📊 Overview & Metrics
        </button>
        <button
          onClick={() => setAdminTab('books')}
          className={`px-4 py-2 font-semibold rounded-xl text-xs whitespace-nowrap transition-all ${
            adminTab === 'books'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📚 Book Catalog ({books.length})
        </button>
        <button
          onClick={() => setAdminTab('loans')}
          className={`px-4 py-2 font-semibold rounded-xl text-xs whitespace-nowrap transition-all ${
            adminTab === 'loans'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ⚡ Circulation & Loans ({loans.filter(l => l.status === 'active' || l.status === 'overdue').length} active)
        </button>
        <button
          onClick={() => setAdminTab('members')}
          className={`px-4 py-2 font-semibold rounded-xl text-xs whitespace-nowrap transition-all ${
            adminTab === 'members'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          👥 Members Directory ({members.length})
        </button>
        <button
          onClick={() => setAdminTab('reservations')}
          className={`px-4 py-2 font-semibold rounded-xl text-xs whitespace-nowrap transition-all ${
            adminTab === 'reservations'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🔖 Patron Requests ({reservations.filter(r => r.status === 'pending').length} pending)
        </button>
        <button
          onClick={() => setAdminTab('orders')}
          className={`px-4 py-2 font-semibold rounded-xl text-xs whitespace-nowrap transition-all ${
            adminTab === 'orders'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🛍️ Bagisto Orders ({orders.length})
        </button>
        <button
          onClick={() => setAdminTab('settings')}
          className={`px-4 py-2 font-semibold rounded-xl text-xs whitespace-nowrap transition-all ${
            adminTab === 'settings'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          ⚙️ Policies & Fine Rates
        </button>
      </div>

      {/* ----------------- TAB 1: DASHBOARD OVERVIEW ----------------- */}
      {adminTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Books</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">{stats?.totalBooks || 0}</div>
              <div className="text-[10px] text-slate-400 mt-1">Cataloged titles</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-semibold text-indigo-600 uppercase">Digital Books</div>
              <div className="text-2xl font-bold text-indigo-700 mt-1">{stats?.digitalBooks || 0}</div>
              <div className="text-[10px] text-slate-400 mt-1">{stats?.totalReads || 0} reads total</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-semibold text-amber-700 uppercase">Physical Titles</div>
              <div className="text-2xl font-bold text-amber-800 mt-1">{stats?.physicalBooks || 0}</div>
              <div className="text-[10px] text-slate-400 mt-1">{stats?.totalCopies || 0} copies total</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-semibold text-emerald-600 uppercase">Available Copies</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{stats?.availableCopies || 0}</div>
              <div className="text-[10px] text-slate-400 mt-1">Ready on shelves</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-semibold text-blue-600 uppercase">Active Loans</div>
              <div className="text-2xl font-bold text-blue-700 mt-1">{stats?.activeLoans || 0}</div>
              <div className="text-[10px] text-red-500 mt-1 font-semibold">{stats?.overdueLoans || 0} overdue</div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-[11px] font-semibold text-purple-600 uppercase">Members</div>
              <div className="text-2xl font-bold text-purple-700 mt-1">{stats?.totalMembers || 0}</div>
              <div className="text-[10px] text-slate-400 mt-1">Registered patrons</div>
            </div>
          </div>

          {/* Quick Actions & Data Export Toolbar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-700 font-semibold">
              <Download className="w-4 h-4 text-indigo-600" />
              <span>Export Library Data (CSV Backup):</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={api.getExportUrl('books')}
                download="hussain_library_books.csv"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <span>Export Books CSV</span>
              </a>
              <a
                href={api.getExportUrl('loans')}
                download="hussain_library_loans.csv"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <span>Export Loans CSV</span>
              </a>
              <a
                href={api.getExportUrl('members')}
                download="hussain_library_members.csv"
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <span>Export Members CSV</span>
              </a>
            </div>
          </div>

          {/* Quick Info & Zero-Data State Guide */}
          {books.length === 0 && (
            <div className="bg-gradient-to-r from-amber-50 to-indigo-50 border border-amber-200 rounded-3xl p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Your Library is Ready (Zero Demo Data)
                  </h3>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Hussain Library is operating with an empty database as requested. Follow these 3 simple steps to populate your real catalog:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                      <strong className="text-slate-900 block mb-1">1. Add Books</strong>
                      Click <span className="font-semibold text-indigo-600">+ Add Book</span> to enter physical books with shelf locations or upload digital PDFs.
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                      <strong className="text-slate-900 block mb-1">2. Register Members</strong>
                      Click <span className="font-semibold text-indigo-600">+ New Member</span> to add library patrons with custom IDs and contact info.
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs">
                      <strong className="text-slate-900 block mb-1">3. Issue & Return</strong>
                      Use the <span className="font-semibold text-amber-700">Circulation Desk</span> to issue physical volumes and manage loan due dates.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recent Circulation Activity */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-bold text-base text-slate-900 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Recent Loans & Circulation</span>
            </h3>

            {loans.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4">No loans issued yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Book</th>
                      <th className="p-3">Member</th>
                      <th className="p-3">Due Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loans.slice(0, 5).map(l => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900">{l.book_title}</td>
                        <td className="p-3 text-slate-600">{l.member_name} ({l.membership_id})</td>
                        <td className="p-3 font-mono">{l.due_date}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            l.status === 'returned'
                              ? 'bg-slate-100 text-slate-600'
                              : l.status === 'overdue'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {l.status !== 'returned' && (
                            <button
                              onClick={() => handleReturnLoan(l.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium"
                            >
                              Return
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB 2: BOOK CATALOG MANAGER ----------------- */}
      {adminTab === 'books' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <h3 className="font-bold text-base text-slate-900">Manage Books Catalog</h3>
            <button
              onClick={() => onOpenBookModal()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add Book</span>
            </button>
          </div>

          {books.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Book className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">No books cataloged yet</p>
              <p className="text-xs text-slate-500 mt-0.5">Click "Add Book" above to enter your first title.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Title & Author</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Shelf / Copies</th>
                    <th className="p-3">Digital File</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {books.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium text-slate-900">
                        <div className="font-bold text-slate-900">{b.title}</div>
                        <div className="text-slate-500 text-[11px]">by {b.author}</div>
                        {b.isbn && <div className="text-[10px] font-mono text-slate-400">ISBN: {b.isbn}</div>}
                      </td>
                      <td className="p-3">
                        <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {b.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{b.category || 'General'}</td>
                      <td className="p-3">
                        {b.type !== 'digital' ? (
                          <div>
                            <span className="font-mono text-slate-800">{b.shelf_location || 'Main'}</span>
                            <div className="text-[11px] text-slate-500">
                              {b.available_copies} / {b.total_copies} available
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400">N/A (Digital)</span>
                        )}
                      </td>
                      <td className="p-3">
                        {b.file_path ? (
                          <span className="text-indigo-600 font-semibold uppercase">{b.file_format || 'PDF'}</span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenBookModal(b)}
                            title="Edit book"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBook(b.id, b.title)}
                            title="Delete book"
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 3: CIRCULATION DESK (LOANS) ----------------- */}
      {adminTab === 'loans' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Circulation Desk (Book Loans)</h3>
              <p className="text-xs text-slate-500">Issue, track due dates, and record returns</p>
            </div>
            <button
              onClick={() => onOpenIssueModal()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Issue New Loan</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            {['all', 'active', 'overdue', 'returned'].map(status => (
              <button
                key={status}
                onClick={() => setLoanFilter(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                  loanFilter === status
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {loans.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">No loans on record</p>
              <p className="text-xs text-slate-500 mt-0.5">Use "Issue New Loan" to check out a physical book to a patron.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Book Title</th>
                    <th className="p-3">Member Details</th>
                    <th className="p-3">Issue Date</th>
                    <th className="p-3">Due Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Circulation Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans
                    .filter(l => loanFilter === 'all' || l.status === loanFilter)
                    .map((l) => (
                      <tr key={l.id} className="hover:bg-slate-50">
                        <td className="p-3 font-medium text-slate-900">
                          <div className="font-bold">{l.book_title}</div>
                          <div className="text-[11px] text-slate-500 font-mono">Shelf: {l.shelf_location || 'Main'}</div>
                        </td>
                        <td className="p-3 text-slate-700">
                          <div className="font-semibold">{l.member_name}</div>
                          <div className="text-[10px] font-mono text-slate-500">{l.membership_id}</div>
                          {l.member_phone && <div className="text-[10px] text-slate-400">{l.member_phone}</div>}
                        </td>
                        <td className="p-3 font-mono text-slate-600">{l.issue_date}</td>
                        <td className="p-3 font-mono">
                          <span className={l.status === 'overdue' ? 'text-red-600 font-bold' : 'text-slate-800'}>
                            {l.due_date}
                          </span>
                          {l.status === 'overdue' && l.fine_amount > 0 && (
                            <div className="text-[10px] text-red-600 font-semibold mt-0.5">
                              Fine: {l.currency_symbol || '$'}{l.fine_amount.toFixed(2)} ({l.overdue_days}d late)
                            </div>
                          )}
                          {(l.renew_count || 0) > 0 && (
                            <div className="text-[10px] text-indigo-600 font-medium">
                              Renewed {l.renew_count}x
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            l.status === 'returned'
                              ? 'bg-slate-100 text-slate-600'
                              : l.status === 'overdue'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          {l.status !== 'returned' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleRenewLoan(l.id)}
                                title="Extend due date by default loan period"
                                className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium transition-colors"
                              >
                                Renew (+{settings.default_loan_days || 14}d)
                              </button>
                              <button
                                onClick={() => handleReturnLoan(l.id)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                              >
                                Return Book
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">
                              Returned on {l.return_date}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 4: MEMBERS DIRECTORY ----------------- */}
      {adminTab === 'members' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Members & Patrons Directory</h3>
              <p className="text-xs text-slate-500">Manage registered members eligible for physical borrowing</p>
            </div>
            <button
              onClick={() => onOpenMemberModal()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Register Member</span>
            </button>
          </div>

          {members.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">No members registered yet</p>
              <p className="text-xs text-slate-500 mt-0.5">Click "Register Member" to add your first library patron.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Name & ID</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Address / Details</th>
                    <th className="p-3">Active Loans</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{m.name}</div>
                        <div className="text-[10px] font-mono text-indigo-700">{m.membership_id}</div>
                      </td>
                      <td className="p-3 text-slate-600">
                        {m.phone && <div>{m.phone}</div>}
                        {m.email && <div className="text-slate-400">{m.email}</div>}
                      </td>
                      <td className="p-3 text-slate-500">{m.address || '—'}</td>
                      <td className="p-3">
                        <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                          m.active_loans_count > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {m.active_loans_count} active
                        </span>
                      </td>
                      <td className="p-3">
                        <span className="capitalize px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenMemberModal(m)}
                            title="Edit member"
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(m.id, m.name)}
                            title="Delete member"
                            className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 5: PATRON RESERVATIONS ----------------- */}
      {adminTab === 'reservations' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-slate-900">Patron Reservation Requests</h3>
          
          {reservations.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">No reservation requests</p>
              <p className="text-xs text-slate-500 mt-0.5">When patrons reserve physical copies, requests will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Book Requested</th>
                    <th className="p-3">Patron Name</th>
                    <th className="p-3">Contact</th>
                    <th className="p-3">Notes</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="p-3 font-semibold text-slate-900">{r.book_title}</td>
                      <td className="p-3 text-slate-800">{r.member_name}</td>
                      <td className="p-3 text-slate-600 font-mono">{r.member_contact}</td>
                      <td className="p-3 text-slate-500">{r.notes || '—'}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          r.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : r.status === 'fulfilled'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {r.status === 'pending' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleReservationStatus(r.id, 'fulfilled')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium"
                            >
                              Fulfill
                            </button>
                            <button
                              onClick={() => handleReservationStatus(r.id, 'cancelled')}
                              className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px] font-medium"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reader Acquisition Requests (Book Requests for uncataloged titles) */}
          <div className="pt-6 border-t border-slate-200 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Reader Book Acquisition Requests</h4>
                <p className="text-xs text-slate-500">Titles and treatises requested by patrons that are not yet in the catalog.</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-[#F2EDFF] text-[#33216B] rounded-full">
                {bookRequests.length} Total Requests
              </span>
            </div>

            {bookRequests.length === 0 ? (
              <div className="py-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <BookOpen className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                <p className="text-xs font-medium text-slate-600">No reader book requests submitted yet</p>
                <p className="text-[11px] text-slate-400">When readers submit titles through the "Request a Book" dialog, they will appear here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Title & Author</th>
                      <th className="p-3">Format</th>
                      <th className="p-3">Requester</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Notes</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{req.title}</div>
                          {req.author && <div className="text-[11px] text-slate-500">by {req.author}</div>}
                        </td>
                        <td className="p-3">
                          <span className="capitalize px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            {req.format_preference || 'any'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-800">{req.requester_name || 'Anonymous'}</td>
                        <td className="p-3 text-slate-600 font-mono text-[11px]">{req.requester_contact}</td>
                        <td className="p-3 text-slate-500 max-w-xs truncate">{req.notes || '—'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                            req.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : req.status === 'in-review'
                              ? 'bg-blue-100 text-blue-800'
                              : req.status === 'acquired'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {req.status === 'pending' && (
                              <button
                                onClick={() => handleBookRequestStatus(req.id, 'in-review')}
                                className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[10px] font-semibold"
                              >
                                Review
                              </button>
                            )}
                            {req.status !== 'acquired' && (
                              <button
                                onClick={() => handleBookRequestStatus(req.id, 'acquired')}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold"
                              >
                                Mark Acquired
                              </button>
                            )}
                            {req.status !== 'unavailable' && (
                              <button
                                onClick={() => handleBookRequestStatus(req.id, 'unavailable')}
                                className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[10px] font-semibold"
                              >
                                Unavailable
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB 6: BAGISTO ECOMMERCE & DIGITAL ORDERS ----------------- */}
      {adminTab === 'orders' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-slate-900">Patron Orders & Digital Licenses</h3>
              <p className="text-xs text-slate-500">Bagisto-modeled order registry with digital download quota tokens</p>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-medium text-slate-700">No customer orders placed yet</p>
              <p className="text-xs text-slate-500 mt-0.5">When patrons checkout physical or digital books from the Cart, orders appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="p-3">Order Number</th>
                    <th className="p-3">Customer Details</th>
                    <th className="p-3">Ordered Items</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="p-3 font-mono font-bold text-indigo-700">
                        {o.order_number}
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-slate-900">{o.customer_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{o.customer_email}</div>
                        {o.customer_phone && <div className="text-[10px] text-slate-400">{o.customer_phone}</div>}
                      </td>
                      <td className="p-3 space-y-1">
                        {o.items?.map((it, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-medium text-slate-800">{it.book_title}</span>
                            <span className="text-[9px] uppercase font-semibold px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                              {it.book_type}
                            </span>
                          </div>
                        ))}
                      </td>
                      <td className="p-3 text-slate-500 font-mono">{o.created_at}</td>
                      <td className="p-3">
                        <select
                          value={o.status}
                          onChange={async (e) => {
                            await api.updateOrderStatus(o.id, e.target.value);
                            loadAdminData();
                          }}
                          className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-[11px] font-semibold text-slate-800"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => window.print()}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium"
                        >
                          Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TAB 7: LIBRARY POLICIES & FINE RATES ----------------- */}
      {adminTab === 'settings' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 max-w-2xl">
          <div>
            <h3 className="font-bold text-base text-slate-900">Library Circulation Policies & Fines</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure loan duration, renewal limits, and automated overdue penalty calculations.
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Daily Overdue Fine Rate
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-500 font-mono">{settings.currency_symbol || '$'}</span>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={settings.daily_fine_rate}
                    onChange={(e) => setSettings({ ...settings, daily_fine_rate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <span className="text-[10px] text-slate-400">Assessed per day overdue</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={settings.currency_symbol}
                  onChange={(e) => setSettings({ ...settings, currency_symbol: e.target.value })}
                  placeholder="$, Rs, PKR, etc."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Default Loan Period (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={settings.default_loan_days}
                  onChange={(e) => setSettings({ ...settings, default_loan_days: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Max Renewals Per Loan
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={settings.max_renewals}
                  onChange={(e) => setSettings({ ...settings, max_renewals: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm transition-colors"
              >
                Save Circulation Policies
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
