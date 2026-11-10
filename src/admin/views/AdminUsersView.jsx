import React, { useState } from 'react';
import { Shield, Key, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { api } from '../../api';

export default function AdminUsersView({ currentUser }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    if (newPassword.length < 8) {
      setFeedback({ type: 'error', message: 'New password must be at least 8 characters long' });
      return;
    }

    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword
      });
      setFeedback({ type: 'success', message: 'Master admin password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setFeedback({ type: '', message: '' }), 4000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update password' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Admin Profile & Security
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Master authentication credentials and cryptographic protection.
        </p>
      </div>

      {feedback.message && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Account Info Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-[#180d2d] text-white flex items-center justify-center font-bold text-xl shadow-md">
            {currentUser?.name?.charAt(0) || 'A'}
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900">{currentUser?.name || 'Administrator'}</h3>
            <p className="text-xs text-slate-500">@{currentUser?.username || 'admin'}</p>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#7C3AED] border border-purple-200 mt-1 uppercase">
              Role: {currentUser?.role || 'Owner'}
            </span>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Official Contact:</span>
            <span className="font-semibold text-slate-800">{currentUser?.email || 'abdulmalequeaby@gmail.com'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Password Hashing:</span>
            <span className="font-mono text-emerald-600 font-bold">Argon2id / PBKDF2 (SHA-512)</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Session Guard:</span>
            <span className="font-semibold text-slate-800">JWT + Rate Limiter Active</span>
          </div>
        </div>
      </div>

      {/* Password Change Form */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="w-4 h-4 text-purple-700" />
          <h3 className="font-extrabold text-sm text-slate-900">Change Master Password</h3>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Min 8 characters) *</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-[#7C3AED]/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <Key className="w-4 h-4" />
              <span>{saving ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
