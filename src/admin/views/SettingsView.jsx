import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { api } from '../../api';

export default function SettingsView() {
  const [currencySymbol, setCurrencySymbol] = useState('₹');
  const [dailyFineRate, setDailyFineRate] = useState('1.00');
  const [defaultLoanDays, setDefaultLoanDays] = useState('14');
  const [maxRenewals, setMaxRenewals] = useState('3');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    api.getSettings().then((cfg) => {
      if (cfg.currency_symbol) setCurrencySymbol(cfg.currency_symbol);
      if (cfg.daily_fine_rate) setDailyFineRate(cfg.daily_fine_rate);
      if (cfg.default_loan_days) setDefaultLoanDays(cfg.default_loan_days);
      if (cfg.max_renewals) setMaxRenewals(cfg.max_renewals);
    }).catch(console.error);
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ type: '', message: '' });

    try {
      await api.updateSettings({
        currency_symbol: currencySymbol,
        daily_fine_rate: dailyFineRate,
        default_loan_days: defaultLoanDays,
        max_renewals: maxRenewals
      });
      setFeedback({ type: 'success', message: 'Settings saved successfully!' });
      setTimeout(() => setFeedback({ type: '', message: '' }), 3000);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Website & Library Policies
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure default loan parameters, currency representation, and circulation rules.
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

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Currency Symbol</label>
            <input
              type="text"
              value={currencySymbol}
              onChange={(e) => setCurrencySymbol(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">Default: ₹ (INR)</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Daily Overdue Fine Rate (₹)</label>
            <input
              type="number"
              step="0.5"
              value={dailyFineRate}
              onChange={(e) => setDailyFineRate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">Charged per physical copy per overdue day</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Default Loan Duration (Days)</label>
            <input
              type="number"
              value={defaultLoanDays}
              onChange={(e) => setDefaultLoanDays(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">Default: 14 days</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Loan Renewals</label>
            <input
              type="number"
              value={maxRenewals}
              onChange={(e) => setMaxRenewals(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
            />
            <p className="text-[10px] text-slate-400 mt-1">Limit renewals before requiring shelf check-in</p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-md shadow-[#7C3AED]/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
