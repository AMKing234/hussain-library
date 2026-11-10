import React, { useState, useEffect } from 'react';
import { Clock, Shield, RefreshCw } from 'lucide-react';
import { api } from '../../api';

export default function ActivityLogsView() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const data = await api.getActivityLogs();
      setLogs(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Security & Activity Audit Logs
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time trail of administrator actions, catalog edits, and security events.
          </p>
        </div>

        <button
          onClick={loadLogs}
          disabled={loading}
          className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-2xl border border-slate-200 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Logs</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {logs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F8F7FC] flex items-center justify-center mx-auto mb-3">
              <Clock className="w-8 h-8 text-slate-400" />
            </div>
            <h4 className="font-extrabold text-sm text-slate-800">No activity logs recorded yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Actions performed in this session will automatically be recorded here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#FAF9FD] text-slate-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                      {l.created_at}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-[#7C3AED] border border-purple-100">
                        {l.action}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-slate-900">{l.username || 'Admin'}</td>
                    <td className="p-4 text-slate-600 max-w-md">{l.details || '—'}</td>
                    <td className="p-4 font-mono text-slate-400 text-[11px]">{l.ip_address || '127.0.0.1'}</td>
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
