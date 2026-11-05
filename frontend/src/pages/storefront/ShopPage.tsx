import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { ProductCard } from '../../components/storefront/ProductCard.js';
import { SlidersHorizontal, ChevronRight, X, RotateCcw } from 'lucide-react';
import { SEO } from '../../components/common/SEO.js';

interface ShopPageProps {
  categorySlug?: string;
}

export const ShopPage: React.FC<ShopPageProps> = ({ categorySlug: propCategorySlug }) => {
  const { category: paramCategorySlug } = useParams<{ category: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentCategorySlug = propCategorySlug || paramCategorySlug || searchParams.get('category') || 'all';

  const [products, setProducts] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>({ total: 0, page: 1, limit: 12, totalPages: 1 });
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filters state
  const sort = searchParams.get('sort') || 'featured';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const occasion = searchParams.get('occasion') || '';
  const gender = searchParams.get('gender') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Load Categories list
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.getCategories();
        if (res.success) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCategories();
  }, []);

  // Fetch Products with filters
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const params: Record<string, any> = {
          page,
          limit: 12,
          sort,
        };

        if (currentCategorySlug && currentCategorySlug !== 'all') {
          params.category = currentCategorySlug;
        }
        if (minPrice) params.minPrice = minPrice;
        if (maxPrice) params.maxPrice = maxPrice;
        if (occasion) params.occasion = occasion;
        if (gender) params.gender = gender;

        const res = await api.getProducts(params);
        if (res.success) {
          setProducts(res.data);
          setMeta(res.meta);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [currentCategorySlug, sort, minPrice, maxPrice, occasion, gender, page]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === 'all') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    // Reset to page 1 on filter change
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    const next = new URLSearchParams();
    if (currentCategorySlug && currentCategorySlug !== 'all') {
      next.set('category', currentCategorySlug);
    }
    setSearchParams(next);
  };

  const currentCategory = categories.find((c) => c.slug === currentCategorySlug);

  const getPageTitle = () => {
    if (currentCategory) return currentCategory.name;
    if (currentCategorySlug === 'watches') return 'Wristwatches';
    if (currentCategorySlug === 'jewellery') return 'Fine Jewellery';
    if (currentCategorySlug === 'perfumes') return 'Niche Fragrances';
    if (currentCategorySlug === 'gift-sets') return 'Curated Gift Sets';
    return 'The Complete Collection';
  };

  const getPageSubtitle = () => {
    if (currentCategory?.description) return currentCategory.description;
    return 'Explore the MagnifiScent catalog of chronographs, gold jewels, bespoke extraits, and gift suites.';
  };

  const getCategorySeo = () => {
    switch (currentCategorySlug) {
      case 'watches':
        return {
          title: 'Mechanical Watches & Swiss Chronographs | MagnifiScent Luxury',
          description:
            'Explore handcrafted luxury wristwatches, Swiss chronographs, and mechanical movements curated for distinguished collectors at MagnifiScent.',
          canonical: 'https://magnifiscent.site/watches',
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: 'Watches', url: '/watches' },
          ],
        };
      case 'jewellery':
        return {
          title: 'Fine Jewellery & Haute Joaillerie | MagnifiScent Luxury',
          description:
            'Discover bespoke fine jewellery, handcrafted solid gold bands, diamond eternity rings, and rare gemstones at MagnifiScent.',
          canonical: 'https://magnifiscent.site/jewellery',
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: 'Fine Jewellery', url: '/jewellery' },
          ],
        };
      case 'perfumes':
        return {
          title: 'Artisanal Perfumes & Extraits de Parfum | MagnifiScent Luxury',
          description:
            'Discover rare niche fragrances, pure perfume extraits, precious oud, and amber formulations designed for enduring luxury sillage.',
          canonical: 'https://magnifiscent.site/perfumes',
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: 'Artisanal Perfumes', url: '/perfumes' },
          ],
        };
      case 'gift-sets':
        return {
          title: 'Luxury Gift Sets & Curated Suites | MagnifiScent Luxury',
          description:
            'Curated luxury gift edits, anniversary presentations, executive boxes, and celebratory pairings curated by the MagnifiScent atelier.',
          canonical: 'https://magnifiscent.site/gift-sets',
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: 'Gift Sets', url: '/gift-sets' },
          ],
        };
      default:
        return {
          title: 'The Curated Collection | MagnifiScent Luxury',
          description:
            'Browse our full portfolio of Swiss mechanical wristwatches, fine jewellery, artisanal perfumes, and luxury gift suites.',
          canonical: 'https://magnifiscent.site/shop',
          breadcrumbs: [
            { name: 'Home', url: '/' },
            { name: 'Collection', url: '/shop' },
          ],
        };
    }
  };

  const hasActiveFilters = Boolean(minPrice || maxPrice || occasion || gender);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <SEO {...getCategorySeo()} />
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-[11px] uppercase tracking-editorial text-charcoal/70 mb-6 font-mono">
        <Link to="/" className="hover:text-espresso-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-espresso-900 transition-colors">
          Catalog
        </Link>
        {currentCategorySlug !== 'all' && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-espresso-900 font-medium">{getPageTitle()}</span>
          </>
        )}
      </nav>

      {/* Editorial Header */}
      <div className="mb-12 border-b border-stone pb-8">
        <h1 className="font-serif text-3xl sm:text-5xl text-espresso-900 font-medium tracking-wide">
          {getPageTitle()}
        </h1>
        <p className="text-xs sm:text-sm text-charcoal font-light max-w-2xl mt-2 leading-relaxed">
          {getPageSubtitle()}
        </p>

        {/* Category Pill Navigation */}
        <div className="mt-8 flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
          <Link
            to="/shop"
            className={`px-4 py-2 text-xs uppercase tracking-editorial font-medium border transition-colors shrink-0 ${
              currentCategorySlug === 'all'
                ? 'bg-espresso-900 text-ivory-100 border-espresso-900'
                : 'bg-white text-charcoal border-stone hover:border-espresso-900'
            }`}
          >
            All Pieces
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              to={`/${c.slug}`}
              className={`px-4 py-2 text-xs uppercase tracking-editorial font-medium border transition-colors shrink-0 ${
                currentCategorySlug === c.slug
                  ? 'bg-espresso-900 text-ivory-100 border-espresso-900'
                  : 'bg-white text-charcoal border-stone hover:border-espresso-900'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Controls Bar: Filter Toggle & Sort */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone/50 gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-stone text-xs uppercase tracking-editorial font-medium text-espresso-900 hover:border-espresso-900 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Refine Search</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-champagne-dark ml-1" />
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center space-x-1 text-xs text-charcoal hover:text-espresso-900 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}

          <span className="text-xs text-charcoal/70 hidden sm:inline">
            Showing {meta.total} {meta.total === 1 ? 'creation' : 'creations'}
          </span>
        </div>

        {/* Sort Selector */}
        <div className="flex items-center space-x-2">
          <label htmlFor="sort" className="text-xs text-charcoal uppercase tracking-editorial">
            Sort by:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => updateParam('sort', e.target.value)}
            className="bg-white border border-stone px-3 py-2 text-xs text-espresso-900 font-sans focus:outline-none focus:border-espresso-900"
          >
            <option value="featured">Signature Selection</option>
            <option value="newest">Newest Additions</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Alphabetical (A - Z)</option>
          </select>
        </div>
      </div>

      {/* Expandable Filter Drawer */}
      {isFilterOpen && (
        <div className="p-6 bg-white border border-stone my-6 grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in slide-in-from-top-4 duration-200">
          {/* Price Range */}
          <div>
            <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-2">
              Price Range (₦)
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => updateParam('minPrice', e.target.value)}
                className="w-full bg-ivory-50 border border-stone px-3 py-1.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
              />
              <span className="text-charcoal">-</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => updateParam('maxPrice', e.target.value)}
                className="w-full bg-ivory-50 border border-stone px-3 py-1.5 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
              />
            </div>
          </div>

          {/* Occasion */}
          <div>
            <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-2">
              Occasion
            </label>
            <select
              value={occasion}
              onChange={(e) => updateParam('occasion', e.target.value)}
              className="w-full bg-ivory-50 border border-stone px-3 py-2 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
            >
              <option value="">All Occasions</option>
              <option value="anniversary">Anniversary</option>
              <option value="birthday">Birthday</option>
              <option value="wedding">Weddings & Vows</option>
              <option value="valentines">Valentine's Day</option>
              <option value="corporate">Executive & Corporate</option>
              <option value="celebration">Celebration</option>
            </select>
          </div>

          {/* Gender */}
          <div>
            <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-2">
              Audience
            </label>
            <select
              value={gender}
              onChange={(e) => updateParam('gender', e.target.value)}
              className="w-full bg-ivory-50 border border-stone px-3 py-2 text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
            >
              <option value="">All Profiles</option>
              <option value="unisex">Unisex</option>
              <option value="men">Gentlemen</option>
              <option value="women">Ladies</option>
            </select>
          </div>
        </div>
      )}

      {/* Product Grid */}
      <div className="mt-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="aspect-[4/5] bg-stone/30 animate-pulse border border-stone" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 bg-white border border-stone space-y-4">
            <h3 className="font-serif text-2xl text-espresso-900 font-medium">
              No matching creations found
            </h3>
            <p className="text-xs text-charcoal max-w-sm mx-auto leading-relaxed">
              We could not find items matching your criteria. Try adjusting your filters or browsing all pieces.
            </p>
            <button
              onClick={clearAllFilters}
              className="px-6 py-2.5 bg-espresso-900 text-ivory-100 text-xs uppercase tracking-editorial font-medium hover:bg-champagne-dark transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      {meta.totalPages > 1 && (
        <div className="mt-16 flex items-center justify-center space-x-2">
          <button
            onClick={() => updateParam('page', String(page - 1))}
            disabled={page <= 1}
            className="px-4 py-2 border border-stone bg-white text-xs uppercase tracking-editorial disabled:opacity-40 hover:border-espresso-900 transition-colors"
          >
            Previous
          </button>
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => updateParam('page', String(p))}
              className={`w-9 h-9 border text-xs font-mono font-medium transition-colors ${
                page === p
                  ? 'bg-espresso-900 text-ivory-100 border-espresso-900'
                  : 'bg-white text-charcoal border-stone hover:border-espresso-900'
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => updateParam('page', String(page + 1))}
            disabled={page >= meta.totalPages}
            className="px-4 py-2 border border-stone bg-white text-xs uppercase tracking-editorial disabled:opacity-40 hover:border-espresso-900 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
