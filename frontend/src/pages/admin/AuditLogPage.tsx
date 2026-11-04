import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { formatDateTime } from '../../utils/formatters.js';
import { ShieldCheck, Clock, User } from 'lucide-react';

export const AuditLogPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await api.getAuditLogs();
        if (res.success) {
          setLogs(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-stone">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-espresso-900 font-medium">
            Administrative Audit Trail
          </h1>
          <p className="text-xs text-charcoal tracking-editorial uppercase mt-0.5">
            Immutable log of sensitive actions, payment verifications, and inventory adjustments
          </p>
        </div>
        <span className="text-xs text-charcoal font-mono">{logs.length} Logged Events</span>
      </div>

      <div className="bg-white border border-stone overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-charcoal tracking-editorial uppercase">
            Loading security audit entries...
          </div>
        ) : logs.length === 0 ? (
          <div className="p-16 text-center text-charcoal">No audit records recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-50 text-charcoal uppercase tracking-editorial text-[10px] font-semibold border-b border-stone/50">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Administrator / Actor</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Context Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/40">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-ivory-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[10px] text-stone-muted">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-medium text-espresso-900">
                      {log.actorName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono uppercase text-[10px] bg-espresso-900 text-ivory-100 px-2 py-0.5 font-semibold">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-charcoal font-mono text-[11px]">
                      {log.resourceType}: {log.resourceId}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-stone-muted truncate max-w-xs">
                      {log.metadata ? JSON.stringify(log.metadata) : '—'}
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
};
