import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { formatPrice, getMediaUrl, isVideoMedia } from '../../utils/formatters.js';
import { useToast } from '../../context/ToastContext.js';
import { Plus, Edit, Archive, Search, Package, Play } from 'lucide-react';

export const ProductListPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { success, error } = useToast();

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await api.getProducts({ limit: 50, search });
      if (res.success) {
        setProducts(res.data);
      }
    } catch (err: any) {
      error('Error', err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  const handleArchive = async (id: string, name: string) => {
    if (!window.confirm(`Archive creation "${name}"? It will no longer be visible on the public storefront.`)) {
      return;
    }

    try {
      const res = await api.archiveProduct(id);
      if (res.success) {
        success('Product Archived', `"${name}" was archived.`);
        loadProducts();
      }
    } catch (err: any) {
      error('Archive Error', err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Create button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-espresso-900 font-medium">
            Product Catalog
          </h1>
          <p className="text-xs text-charcoal tracking-editorial uppercase mt-0.5">
            Manage luxury horology, jewellery, and fragrance inventory
          </p>
        </div>

        <Link
          to="/admin/products/new"
          className="px-4 py-2.5 bg-espresso-900 hover:bg-espresso-800 text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-colors inline-flex items-center space-x-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Product</span>
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white border border-stone p-4">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-stone-muted absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search by name, SKU, or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-ivory-50 border border-stone pl-9 pr-3 py-2 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-charcoal tracking-editorial uppercase">
            Loading catalog items...
          </div>
        ) : products.length === 0 ? (
          <div className="p-16 text-center space-y-2">
            <p className="font-serif text-xl text-espresso-900">No products found</p>
            <p className="text-xs text-charcoal">Create your first product to populate the catalog.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ivory-50 text-charcoal uppercase tracking-editorial text-[10px] font-semibold border-b border-stone/50">
                <tr>
                  <th className="py-3 px-4">Creation</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone/40">
                {products.map((p) => {
                  const img = p.images?.[0]?.imageUrl || '';
                  return (
                    <tr key={p.id} className="hover:bg-ivory-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-12 bg-stone-light shrink-0 overflow-hidden border border-stone/50 relative">
                            {img ? (
                              isVideoMedia(img) ? (
                                <div className="relative w-full h-full bg-espresso-950 flex items-center justify-center">
                                  <video
                                    src={getMediaUrl(img)}
                                    className="w-full h-full object-cover opacity-80"
                                    muted
                                    preload="metadata"
                                  />
                                  <Play className="w-3 h-3 text-ivory-100 absolute fill-ivory-100/50" />
                                </div>
                              ) : (
                                <img
                                  src={getMediaUrl(img)}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                  }}
                                />
                              )
                            ) : (
                              <Package className="w-4 h-4 text-stone-muted m-auto" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-espresso-900 font-serif">{p.name}</p>
                            <p className="text-[10px] text-charcoal/70 font-mono">
                              SKU: {p.sku} {p.brand ? `• ${p.brand}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">{p.category?.name || 'Unassigned'}</td>
                      <td className="py-3 px-4 font-sans font-medium text-espresso-900">
                        {formatPrice(p.price)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-mono font-medium ${
                            p.stockQuantity <= 0
                              ? 'text-red-700'
                              : p.stockQuantity <= p.lowStockThreshold
                              ? 'text-amber-700 font-bold'
                              : 'text-espresso-900'
                          }`}
                        >
                          {p.stockQuantity} in stock
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {p.isFeatured ? (
                          <span className="text-[9px] uppercase tracking-wider bg-espresso-900 text-ivory-100 px-2 py-0.5 font-semibold">
                            Featured
                          </span>
                        ) : (
                          <span className="text-stone-muted text-xs">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[9px] uppercase tracking-wider px-2 py-0.5 font-semibold ${
                            p.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'draft'
                              ? 'bg-stone text-charcoal'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <Link
                          to={`/admin/products/${p.id}/edit`}
                          className="p-1.5 text-stone-muted hover:text-espresso-900 inline-block"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleArchive(p.id, p.name)}
                          className="p-1.5 text-stone-muted hover:text-red-700 inline-block"
                          title="Archive Product"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
