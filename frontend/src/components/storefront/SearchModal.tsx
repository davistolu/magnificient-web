import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { formatPrice } from '../../utils/formatters.js';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.getProducts({ search: query, limit: 6 });
        if (res.success) {
          setResults(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
      <div
        className="fixed inset-0 bg-espresso-900/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl bg-white border border-stone shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-6 border-b border-stone flex items-center space-x-3 bg-ivory-50">
          <Search className="w-5 h-5 text-stone-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search timepieces, fine jewels, extraits, or gift sets..."
            className="flex-1 bg-transparent border-none text-espresso-900 placeholder-charcoal/50 text-base sm:text-lg font-serif focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-stone-muted hover:text-espresso-900 text-xs uppercase tracking-editorial"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 text-stone-muted hover:text-espresso-900"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results / Quick Navigation */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-charcoal tracking-editorial uppercase">
              Searching Magnificent catalog...
            </div>
          ) : query.trim() ? (
            results.length > 0 ? (
              <div className="space-y-4">
                <p className="text-[11px] uppercase tracking-editorial text-charcoal font-semibold">
                  Matching Creations ({results.length})
                </p>
                <div className="divide-y divide-stone/40">
                  {results.map((product) => {
                    const img = product.images?.[0]?.imageUrl || '';
                    return (
                      <Link
                        key={product.id}
                        to={`/products/${product.slug}`}
                        onClick={onClose}
                        className="flex items-center space-x-4 py-3 group hover:bg-ivory-50 px-2 transition-colors"
                      >
                        <div className="w-12 h-14 bg-stone-light shrink-0 overflow-hidden border border-stone/50">
                          <img src={img} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] uppercase tracking-widest text-charcoal/70">
                            {product.brand || product.category?.name}
                          </p>
                          <h4 className="font-serif text-sm font-medium text-espresso-900 group-hover:text-champagne-dark transition-colors">
                            {product.name}
                          </h4>
                          <span className="text-xs font-semibold text-espresso-900 font-sans mt-0.5 inline-block">
                            {formatPrice(product.price)}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-stone-muted group-hover:text-espresso-900 transition-colors" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="font-serif text-base text-espresso-900">No creations matched "{query}"</p>
                <p className="text-xs text-charcoal mt-1">Try searching by brand, material, or category.</p>
              </div>
            )
          ) : (
            <div>
              <p className="text-[11px] uppercase tracking-editorial text-charcoal font-semibold mb-3">
                Curated Collections
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { name: 'Wristwatches', slug: 'watches' },
                  { name: 'Fine Jewellery', slug: 'jewellery' },
                  { name: 'Niche Perfumes', slug: 'perfumes' },
                  { name: 'Curated Gift Sets', slug: 'gift-sets' },
                ].map((cat) => (
                  <Link
                    key={cat.slug}
                    to={`/${cat.slug}`}
                    onClick={onClose}
                    className="p-3 bg-ivory-50 border border-stone/60 hover:border-champagne text-center group transition-colors"
                  >
                    <span className="font-serif text-xs text-espresso-900 group-hover:text-champagne-dark transition-colors block">
                      {cat.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
