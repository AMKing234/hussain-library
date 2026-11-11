import React, { useState } from 'react';
import {
  X,
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { api, setCurrentUser, setAuthToken } from '../api';

export default function CustomerAuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Form states
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPhone, setRegisterPhone] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');

  if (!isOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!loginIdentifier.trim() || !loginPassword) {
      setError('Please provide your username or email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.login({
        username: loginIdentifier.trim(),
        password: loginPassword
      });

      if (res.token && res.user) {
        setAuthToken(res.token);
        setCurrentUser(res.user);
        setSuccessMsg(`Welcome back, ${res.user.name || res.user.username}!`);
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(res.user);
          onClose();
        }, 800);
      } else {
        setError('Login failed: Invalid server response.');
      }
    } catch (err) {
      setError(err.message || 'Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!registerName.trim() || !registerEmail.trim() || !registerPassword) {
      setError('Please fill in all required fields (Name, Email, Password).');
      return;
    }

    if (registerPassword.length < 8) {
      setError('Password must be at least 8 characters long with uppercase, lowercase, and a number.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.register({
        name: registerName.trim(),
        email: registerEmail.trim(),
        phone: registerPhone.trim(),
        password: registerPassword
      });

      if (res.token && res.user) {
        setAuthToken(res.token);
        setCurrentUser(res.user);
        setSuccessMsg(`Account created! Welcome to Hussain Library, ${res.user.name}!`);
        setTimeout(() => {
          if (onAuthSuccess) onAuthSuccess(res.user);
          onClose();
        }, 1000);
      } else {
        setError(res.error || 'Registration failed.');
      }
    } catch (err) {
      setError(err.message || 'Unable to register. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#131127] w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 dark:border-purple-900/30 overflow-hidden flex flex-col relative transition-colors">
        {/* Top Banner */}
        <div className="bg-gradient-to-r from-[#17143D] via-[#2A1E5C] to-[#3B1F7E] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#D9A441]">
              <BookOpen className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="text-sm font-bold tracking-tight">HUSSAIN LIBRARY</span>
              <p className="text-[10px] text-purple-200/80">Member & Reader Account</p>
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-white">
            {mode === 'login' ? 'Welcome Back!' : 'Join Hussain Library'}
          </h2>
          <p className="text-xs text-purple-100/80 mt-1">
            {mode === 'login'
              ? 'Sign in to access your digital bookshelf, track orders, and request combos.'
              : 'Create an account to order books, reserve physical copies, and read digital editions.'}
          </p>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-white/10 rounded-2xl mt-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#17143D] shadow-xs font-bold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Customer Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setError('');
                setSuccessMsg('');
              }}
              className={`py-1.5 rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-[#17143D] shadow-xs font-bold'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              New Registration
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300 animate-in slide-in-from-top-1">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Mode: Login */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="name@example.com or username"
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-[#1a1636] border border-slate-200 dark:border-purple-800/60 text-slate-800 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#1f1a42] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 dark:bg-[#1a1636] border border-slate-200 dark:border-purple-800/60 text-slate-800 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#1f1a42] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#17143D] dark:bg-purple-700 hover:bg-[#251f5c] dark:hover:bg-purple-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-purple-700 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                >
                  Register here
                </button>
              </div>
            </form>
          )}

          {/* Mode: Register */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="e.g. Tariq Ahmad"
                    className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#1a1636] border border-slate-200 dark:border-purple-800/60 text-slate-800 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#1f1a42] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#1a1636] border border-slate-200 dark:border-purple-800/60 text-slate-800 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#1f1a42] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile / Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 dark:bg-[#1a1636] border border-slate-200 dark:border-purple-800/60 text-slate-800 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#1f1a42] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Create Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Min 8 characters (letters & numbers)"
                    className="w-full pl-10 pr-10 py-2 text-xs bg-slate-50 dark:bg-[#1a1636] border border-slate-200 dark:border-purple-800/60 text-slate-800 dark:text-slate-100 rounded-xl focus:bg-white dark:focus:bg-[#1f1a42] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#17143D] dark:bg-purple-700 hover:bg-[#251f5c] dark:hover:bg-purple-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration</span>
                    <Sparkles className="w-4 h-4 text-[#D9A441]" />
                  </>
                )}
              </button>

              <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-purple-700 dark:text-purple-400 font-bold hover:underline cursor-pointer"
                >
                  Sign In here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
