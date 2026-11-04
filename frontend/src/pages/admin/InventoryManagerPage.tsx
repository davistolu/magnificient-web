import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { formatDateTime } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.js';
import {
  Layers,
  AlertTriangle,
  History,
  CheckCircle2,
  X,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export const InventoryManagerPage: React.FC = () => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ totalSkus: 0, lowStockCount: 0, outOfStockCount: 0 });
  const [movements, setMovements] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'levels' | 'movements'>('levels');
  const [isLoading, setIsLoading] = useState(true);

  // Stock Adjustment Modal
  const [adjustingProduct, setAdjustingProduct] = useState<any>(null);
  const [quantityDelta, setQuantityDelta] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { success, error } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [invRes, movRes] = await Promise.all([
        api.getInventoryOverview(),
        api.getInventoryMovements(),
      ]);

      if (invRes.success) {
        setInventory(invRes.data.items);
        setStats(invRes.data.stats);
      }
      if (movRes.success) {
        setMovements(movRes.data);
      }
    } catch (err: any) {
      error('Failed to load inventory', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct || quantityDelta === 0) return;
    if (!adjustReason.trim() || adjustReason.trim().length < 3) {
      error('Mandatory Reason', 'Please specify a clear reason of at least 3 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.adjustStock({
        productId: adjustingProduct.id,
        quantityChange: Number(quantityDelta),
        reason: adjustReason.trim(),
      });

      if (res.success) {
        success('Stock Adjusted', res.message);
        setAdjustingProduct(null);
        setQuantityDelta(0);
        setAdjustReason('');
        loadData();
      }
    } catch (err: any) {
      error('Adjustment Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-espresso-900 font-medium">
            Inventory & Stock Control
          </h1>
          <p className="text-xs text-charcoal tracking-editorial uppercase mt-0.5">
            Audit inventory levels and manual warehouse adjustments
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center space-x-2 bg-white border border-stone p-1">
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-3 py-1.5 text-xs uppercase tracking-editorial font-medium transition-colors ${
              activeTab === 'levels'
                ? 'bg-espresso-900 text-ivory-100'
                : 'text-charcoal hover:text-espresso-900'
            }`}
          >
            Live Quantities
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-1.5 text-xs uppercase tracking-editorial font-medium transition-colors ${
              activeTab === 'movements'
                ? 'bg-espresso-900 text-ivory-100'
                : 'text-charcoal hover:text-espresso-900'
            }`}
          >
            Audit Movements ({movements.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white border border-stone p-6 space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-charcoal/70 font-semibold">
            Tracked SKUs
          </span>
          <p className="font-serif text-2xl font-bold text-espresso-900 font-mono">
            {stats.totalSkus}
          </p>
        </div>

        <div className="bg-white border border-stone p-6 space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-charcoal/70 font-semibold">
            Low Stock Alerts (&le; Threshold)
          </span>
          <p className="font-serif text-2xl font-bold text-amber-700 font-mono">
            {stats.lowStockCount}
          </p>
        </div>

        <div className="bg-white border border-stone p-6 space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-charcoal/70 font-semibold">
            Depleted / Sold Out SKUs
          </span>
          <p className="font-serif text-2xl font-bold text-red-700 font-mono">
            {stats.outOfStockCount}
          </p>
        </div>
      </div>

      {/* Content depending on active tab */}
      {activeTab === 'levels' ? (
        <div className="bg-white border border-stone overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-50 text-charcoal uppercase tracking-editorial text-[10px] font-semibold border-b border-stone/50">
                <tr>
                  <th className="py-3 px-4">SKU / Code</th>
                  <th className="py-3 px-4">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Available Quantity</th>
                  <th className="py-3 px-4">Threshold</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/40">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-ivory-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-espresso-900">
                      {item.sku}
                    </td>
                    <td className="py-3 px-4 font-serif font-medium text-espresso-900">
                      {item.name}
                    </td>
                    <td className="py-3 px-4">{item.categoryName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-sm text-espresso-900">
                      {item.stockQuantity}
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-muted">
                      {item.lowStockThreshold}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-semibold ${
                          item.stockStatus === 'in_stock'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.stockStatus === 'low_stock'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.stockStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setAdjustingProduct(item);
                          setQuantityDelta(0);
                          setAdjustReason('');
                        }}
                        className="px-2.5 py-1 bg-ivory-50 hover:bg-espresso-900 hover:text-ivory-100 border border-stone text-espresso-900 text-[11px] font-medium transition-colors"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Movements Log */
        <div className="bg-white border border-stone overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-50 text-charcoal uppercase tracking-editorial text-[10px] font-semibold border-b border-stone/50">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Change</th>
                  <th className="py-3 px-4">Movement Type</th>
                  <th className="py-3 px-4">Reason / Reference</th>
                  <th className="py-3 px-4 text-right">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/40">
                {movements.map((mov) => (
                  <tr key={mov.id} className="hover:bg-ivory-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono text-[10px] text-stone-muted">
                      {formatDateTime(mov.createdAt)}
                    </td>
                    <td className="py-3 px-4 font-medium text-espresso-900">
                      {mov.productName || mov.productId}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">
                      <span
                        className={`inline-flex items-center space-x-1 ${
                          mov.quantityChange > 0 ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {mov.quantityChange > 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {mov.quantityChange > 0 ? `+${mov.quantityChange}` : mov.quantityChange}
                        </span>
                      </span>
                    </td>
                    <td className="py-3 px-4 uppercase tracking-wider font-mono text-[10px]">
                      {mov.movementType.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-charcoal font-light">
                      {mov.reason || mov.referenceId || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-espresso-900">
                      {mov.createdBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-espresso-900/80" onClick={() => setAdjustingProduct(null)} />
          <div className="relative w-full max-w-md bg-white border border-stone p-6 space-y-4 z-10 animate-in zoom-in-95">
            <div className="flex justify-between items-center border-b border-stone/50 pb-2">
              <h3 className="font-serif text-lg text-espresso-900 font-medium">
                Adjust Inventory: {adjustingProduct.name}
              </h3>
              <button onClick={() => setAdjustingProduct(null)} className="text-stone-muted">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <p className="text-charcoal font-light">
                Current available quantity: <strong className="font-mono text-espresso-900">{adjustingProduct.stockQuantity}</strong>
              </p>

              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Quantity Adjustment (+ or -) *
                </label>
                <input
                  type="number"
                  required
                  value={quantityDelta}
                  onChange={(e) => setQuantityDelta(parseInt(e.target.value, 10) || 0)}
                  placeholder="e.g. +5 or -2"
                  className="w-full bg-ivory-50 border border-stone px-3 py-2 font-mono text-espresso-900 text-base"
                />
                <span className="text-[10px] text-stone-muted mt-0.5 block">
                  New stock will be: {adjustingProduct.stockQuantity + quantityDelta}
                </span>
              </div>

              <div>
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                  Mandatory Auditable Reason *
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="e.g. Received new shipment from Swiss atelier"
                  className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 border border-stone text-xs uppercase tracking-editorial"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || quantityDelta === 0}
                  className="px-5 py-2 bg-espresso-900 hover:bg-espresso-800 disabled:opacity-50 text-ivory-100 text-xs uppercase tracking-editorial font-semibold"
                >
                  Confirm Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
