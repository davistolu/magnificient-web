import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { formatPrice, formatDate } from '../../utils/formatters.js';
import { Users, Mail, Phone, ShoppingBag } from 'lucide-react';

export const CustomerListPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await api.getCustomers();
        if (res.success) {
          setCustomers(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-stone">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-espresso-900 font-medium">
            Client Registry
          </h1>
          <p className="text-xs text-charcoal tracking-editorial uppercase mt-0.5">
            Client relationship directory, order frequency, and verified lifetime expenditure
          </p>
        </div>
        <span className="text-xs text-charcoal font-medium font-mono">
          {customers.length} Registered Clients
        </span>
      </div>

      <div className="bg-white border border-stone overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-charcoal tracking-editorial uppercase">
            Loading client profiles...
          </div>
        ) : customers.length === 0 ? (
          <div className="p-16 text-center text-charcoal">No customer records found yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-50 text-charcoal uppercase tracking-editorial text-[10px] font-semibold border-b border-stone/50">
                <tr>
                  <th className="py-3 px-4">Client Name</th>
                  <th className="py-3 px-4">Contact Information</th>
                  <th className="py-3 px-4">Orders Placed</th>
                  <th className="py-3 px-4">Verified Lifetime Spend</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/40">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-ivory-50/60 transition-colors">
                    <td className="py-3 px-4 font-serif font-medium text-base text-espresso-900">
                      {c.fullName}
                    </td>
                    <td className="py-3 px-4 space-y-0.5">
                      <p className="flex items-center space-x-1 text-espresso-900 font-mono">
                        <Mail className="w-3 h-3 text-stone-muted" />
                        <span>{c.email}</span>
                      </p>
                      {c.phone && c.phone !== 'N/A' && (
                        <p className="flex items-center space-x-1 text-stone-muted font-mono text-[11px]">
                          <Phone className="w-3 h-3" />
                          <span>{c.phone}</span>
                        </p>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-espresso-900">
                      {c.orderCount}
                    </td>
                    <td className="py-3 px-4 font-sans font-bold text-emerald-800">
                      {formatPrice(c.totalConfirmedSpend)}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-muted">
                      {c.lastOrderDate ? formatDate(c.lastOrderDate) : 'No orders yet'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-semibold ${
                          c.isRegistered ? 'bg-champagne/30 text-espresso-900' : 'bg-stone text-charcoal'
                        }`}
                      >
                        {c.isRegistered ? 'Registered' : 'Guest Client'}
                      </span>
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
