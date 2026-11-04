import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { formatPrice } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.js';
import { Tag, Plus, Check, X } from 'lucide-react';

export const DiscountManagerPage: React.FC = () => {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '10',
    minOrderAmount: '200000',
    usageLimit: '100',
  });

  const { success, error } = useToast();

  const loadDiscounts = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDiscounts();
      if (res.success) {
        setDiscounts(res.data);
      }
    } catch (err: any) {
      error('Error', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDiscounts();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      const res = await api.toggleDiscount(id);
      if (res.success) {
        success('Status Changed', res.message);
        loadDiscounts();
      }
    } catch (err: any) {
      error('Error', err.message);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.createDiscount({
        code: form.code,
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : undefined,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit, 10) : undefined,
      });

      if (res.success) {
        success('Promotional Code Created', `Code ${form.code} is now active.`);
        setIsModalOpen(false);
        setForm({ code: '', discountType: 'percentage', discountValue: '10', minOrderAmount: '200000', usageLimit: '100' });
        loadDiscounts();
      }
    } catch (err: any) {
      error('Failed to create code', err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-espresso-900 font-medium">
            Promotional Privileges & Codes
          </h1>
          <p className="text-xs text-charcoal tracking-editorial uppercase mt-0.5">
            Configure private client invitation codes and percentage concessions
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-espresso-900 hover:bg-espresso-800 text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-colors inline-flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>New Privilege Code</span>
        </button>
      </div>

      <div className="bg-white border border-stone overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-ivory-50 text-charcoal uppercase tracking-editorial text-[10px] font-semibold border-b border-stone/50">
              <tr>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Benefit</th>
                <th className="py-3 px-4">Minimum Order</th>
                <th className="py-3 px-4">Redemptions</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Toggle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone/40">
              {discounts.map((d) => (
                <tr key={d.id} className="hover:bg-ivory-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-espresso-900">
                    {d.code}
                  </td>
                  <td className="py-3 px-4 font-semibold text-espresso-900">
                    {d.discountType === 'percentage'
                      ? `${d.discountValue}% Off`
                      : `${formatPrice(d.discountValue)} Off`}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {d.minOrderAmount ? formatPrice(d.minOrderAmount) : 'None'}
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {d.usageCount} {d.usageLimit ? `/ ${d.usageLimit}` : 'unlimited'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-semibold ${
                        d.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone text-charcoal'
                      }`}
                    >
                      {d.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggle(d.id)}
                      className={`px-3 py-1 border text-[11px] font-medium transition-colors ${
                        d.isActive
                          ? 'border-red-300 text-red-700 hover:bg-red-50'
                          : 'border-emerald-300 text-emerald-800 hover:bg-emerald-50'
                      }`}
                    >
                      {d.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-espresso-900/80" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white border border-stone p-6 space-y-4 z-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone/50 pb-2">
              <h3 className="font-serif text-lg text-espresso-900 font-medium">Create Promo Privilege</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Code String (Uppercase) *
                </label>
                <input
                  type="text"
                  required
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SUMMERPRIVILEGE"
                  className="w-full bg-ivory-50 border border-stone px-3 py-2 font-mono uppercase text-espresso-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                    Concession Type
                  </label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                    className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Sum (₦)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                    Value *
                  </label>
                  <input
                    type="number"
                    required
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                    placeholder="10"
                    className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                    Minimum Spend (₦)
                  </label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })}
                    placeholder="200000"
                    className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                    Usage Cap
                  </label>
                  <input
                    type="number"
                    value={form.usageLimit}
                    onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                    placeholder="100"
                    className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone text-xs uppercase tracking-editorial"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-espresso-900 text-ivory-100 text-xs uppercase tracking-editorial font-semibold"
                >
                  Save Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
