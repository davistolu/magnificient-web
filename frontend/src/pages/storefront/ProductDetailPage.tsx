import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api.js';
import { formatPrice, getMediaUrl, isVideoMedia } from '../../utils/formatters.js';
import { useCart } from '../../context/CartContext.js';
import { ProductCard } from '../../components/storefront/ProductCard.js';
import {
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  MessageSquare,
  ShoppingBag,
  CheckCircle2,
  Maximize2,
  X,
  Play,
  Film,
  Share2,
  Check,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext.js';
import { SEO } from '../../components/common/SEO.js';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { success } = useToast();

  const [product, setProduct] = useState<any>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (!product) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://magnifiscent.site';
    const shareUrl = `${origin}/products/${product.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | MagnifiScent Luxury`,
          text: `Discover ${product.name} at MagnifiScent Luxury Atelier`,
          url: shareUrl,
        });
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      success('Link Copied', `Direct link to "${product.name}" copied to clipboard.`);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      success('Link Copied', `Direct link to "${product.name}" copied to clipboard.`);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  useEffect(() => {
    async function loadProduct() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const res = await api.getProduct(slug);
        if (res.success) {
          setProduct(res.data);
          setSelectedImageIndex(0);
          setQuantity(1);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="aspect-[4/5] bg-stone/40 border border-stone" />
          <div className="space-y-6">
            <div className="h-6 w-32 bg-stone/40" />
            <div className="h-10 w-3/4 bg-stone/40" />
            <div className="h-8 w-1/3 bg-stone/40" />
            <div className="h-32 w-full bg-stone/40" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center space-y-4">
        <h2 className="font-serif text-3xl text-espresso-900 font-medium">Creation Not Found</h2>
        <p className="text-xs text-charcoal">The piece you requested could not be located in our archives.</p>
        <Link
          to="/shop"
          className="inline-block mt-4 px-6 py-3 bg-espresso-900 text-ivory-100 text-xs uppercase tracking-editorial font-medium"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=crop', altText: product.name }];

  const currentImage = images[selectedImageIndex] || images[0];
  const isSoldOut = product.stockQuantity <= 0;
  const isLowStock = !isSoldOut && product.stockQuantity <= product.lowStockThreshold;

  const handleAddToCart = () => {
    if (isSoldOut) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        price: Number(product.price),
        imageUrl: currentImage.imageUrl,
        maxStock: product.stockQuantity,
      },
      quantity
    );
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/checkout');
  };

  const buildWhatsAppInquiry = () => {
    const msg = [
      `Hello Magnificent Concierge,`,
      `I am interested in acquiring:`,
      `Product: ${product.name}`,
      `Reference SKU: ${product.sku}`,
      `Price: ${formatPrice(product.price)}`,
      `URL: ${window.location.href}`,
      `\nCould you please confirm current availability and provide ordering instructions?`,
    ].join('\n');
    return `https://wa.me/2348000000000?text=${encodeURIComponent(msg)}`;
  };

  const specs = Object.entries(product.specifications || {});

  const productImageUrl = product.images?.[0]?.imageUrl
    ? getMediaUrl(product.images[0].imageUrl)
    : 'https://magnifiscent.site/logo.png';

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images?.map((img: any) => getMediaUrl(img.imageUrl)) || [productImageUrl],
    description: product.shortDescription || product.description,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'MagnifiScent',
    },
    offers: {
      '@type': 'Offer',
      url: `https://magnifiscent.site/products/${product.slug}`,
      priceCurrency: 'NGN',
      price: product.price,
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.stockQuantity > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'MagnifiScent',
      },
    },
  };

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    {
      name: product.category?.name || 'Catalog',
      url: product.category?.slug ? `/${product.category.slug}` : '/shop',
    },
    { name: product.name, url: `/products/${product.slug}` },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <SEO
        title={`${product.name} | MagnifiScent Luxury`}
        description={product.shortDescription || product.description}
        canonical={`https://magnifiscent.site/products/${product.slug}`}
        ogImage={productImageUrl}
        ogType="product"
        breadcrumbs={breadcrumbs}
        jsonLd={productJsonLd}
      />
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-2 text-[11px] uppercase tracking-editorial text-charcoal/70 mb-8 font-mono">
        <Link to="/" className="hover:text-espresso-900 transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/shop" className="hover:text-espresso-900 transition-colors">
          Catalog
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/${product.category.slug}`} className="hover:text-espresso-900 transition-colors">
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-espresso-900 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left: Gallery Column (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Stage Media */}
          <div className="relative aspect-[4/5] bg-stone-light border border-stone overflow-hidden group">
            {isVideoMedia(currentImage.imageUrl) ? (
              <video
                key={currentImage.imageUrl}
                src={getMediaUrl(currentImage.imageUrl)}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <img
                src={getMediaUrl(currentImage.imageUrl)}
                alt={currentImage.altText || product.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1200&auto=format&fit=crop';
                }}
              />
            )}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white text-espresso-900 backdrop-blur-xs border border-stone shadow-sm transition-all z-10"
              aria-label="Enlarge media"
            >
              <Maximize2 className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          {/* Thumbnail Selector */}
          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img: any, idx: number) => {
                const isVid = isVideoMedia(img.imageUrl);
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`w-20 h-24 shrink-0 overflow-hidden border relative transition-all bg-stone-light ${
                      selectedImageIndex === idx
                        ? 'border-espresso-900 ring-1 ring-espresso-900'
                        : 'border-stone hover:border-stone-muted'
                    }`}
                  >
                    {isVid ? (
                      <div className="w-full h-full relative flex items-center justify-center bg-espresso-900">
                        <video
                          src={getMediaUrl(img.imageUrl)}
                          className="w-full h-full object-cover opacity-75"
                          muted
                          playsInline
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                          <Play className="w-4 h-4 fill-white text-white drop-shadow" />
                          <span className="text-[8px] font-mono text-white tracking-widest mt-1 uppercase font-bold">
                            VIDEO
                          </span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={getMediaUrl(img.imageUrl)}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=300&auto=format&fit=crop';
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Purchasing & Details Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-charcoal/80 font-mono mb-1">
              <div className="flex items-center space-x-2">
                <span>{product.brand || 'MagnifiScent'}</span>
                <span>•</span>
                <span>SKU: {product.sku}</span>
              </div>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center space-x-1 text-[10px] text-charcoal hover:text-champagne-dark transition-colors"
                title={copied ? 'Link Copied!' : 'Share this piece'}
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span className="text-emerald-700 font-medium">Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3 h-3" />
                    <span>Share Piece</span>
                  </>
                )}
              </button>
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl text-espresso-900 font-medium tracking-wide leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline space-x-3 pt-2 border-t border-stone/50">
            <span className="text-2xl sm:text-3xl font-semibold text-espresso-900 font-sans tracking-tight">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
              <span className="text-base text-charcoal/60 line-through font-sans">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Availability Status */}
          <div className="flex items-center space-x-2 text-xs">
            {isSoldOut ? (
              <span className="text-red-700 font-medium uppercase tracking-editorial">Sold Out</span>
            ) : isLowStock ? (
              <span className="text-amber-700 font-medium uppercase tracking-editorial">
                Limited Allocation — Only {product.stockQuantity} remaining
              </span>
            ) : (
              <div className="flex items-center space-x-1.5 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="uppercase tracking-editorial text-[11px] font-medium">
                  In Stock & Ready for Dispatch
                </span>
              </div>
            )}
          </div>

          {/* Short Description */}
          <p className="text-xs sm:text-sm text-charcoal font-light leading-relaxed">
            {product.shortDescription}
          </p>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-4 border-t border-stone/50">
            <div className="flex items-center space-x-4">
              <label htmlFor="quantity" className="text-xs uppercase tracking-editorial text-charcoal font-medium">
                Quantity:
              </label>
              <div className="flex items-center border border-stone bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1 || isSoldOut}
                  className="w-9 h-9 flex items-center justify-center text-charcoal hover:text-espresso-900 disabled:opacity-30"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-semibold text-espresso-900 font-mono">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  disabled={quantity >= product.stockQuantity || isSoldOut}
                  className="w-9 h-9 flex items-center justify-center text-charcoal hover:text-espresso-900 disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-2.5 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isSoldOut}
                className="w-full py-4 bg-espresso-900 hover:bg-espresso-800 disabled:bg-stone disabled:cursor-not-allowed text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-all shadow-md flex items-center justify-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isSoldOut ? 'Sold Out' : 'Place in Shopping Bag'}</span>
              </button>

              {!isSoldOut && (
                <button
                  onClick={handleBuyNow}
                  className="w-full py-3.5 bg-champagne hover:bg-champagne-light text-espresso-900 text-xs uppercase tracking-editorial font-semibold transition-colors"
                >
                  Buy Now with Manual Bank Wire
                </button>
              )}

              <div className="flex items-center gap-2">
                <a
                  href={buildWhatsAppInquiry()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 border border-stone bg-white hover:bg-ivory-50 text-espresso-900 text-xs uppercase tracking-editorial font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>Enquire via WhatsApp</span>
                </a>

                <button
                  type="button"
                  onClick={handleShare}
                  className={`px-4 py-3 border transition-colors flex items-center justify-center space-x-1.5 text-xs uppercase tracking-editorial font-medium shrink-0 ${
                    copied
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                      : 'border-stone bg-white hover:bg-ivory-50 text-espresso-900'
                  }`}
                  title={copied ? 'Link Copied!' : 'Share piece link'}
                  aria-label="Share or copy piece link"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-700" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 text-champagne-dark" />
                      <span>Share</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Pillars Checklist */}
          <div className="pt-6 border-t border-stone/50 space-y-3 text-xs text-charcoal">
            <div className="flex items-start space-x-3">
              <Truck className="w-4 h-4 text-champagne-dark shrink-0 mt-0.5" />
              <span>Complimentary insured shipping for orders above ₦150,000.</span>
            </div>
            <div className="flex items-start space-x-3">
              <ShieldCheck className="w-4 h-4 text-champagne-dark shrink-0 mt-0.5" />
              <span>Authenticity guaranteed. Certificate of origin & documentation included.</span>
            </div>
            <div className="flex items-start space-x-3">
              <RotateCcw className="w-4 h-4 text-champagne-dark shrink-0 mt-0.5" />
              <span>7-day return policy for unworn pieces in pristine original presentation.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Full Editorial Description & Detailed Specifications */}
      <div className="mt-20 pt-16 border-t border-stone grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-serif text-2xl text-espresso-900 font-medium">The Narrative</h3>
          <p className="text-sm text-charcoal font-light leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Specifications Table */}
        <div className="lg:col-span-5 bg-white border border-stone p-6 sm:p-8 space-y-4">
          <h3 className="font-serif text-xl text-espresso-900 font-medium">Technical Specifications</h3>
          {specs.length > 0 ? (
            <dl className="divide-y divide-stone/40 text-xs">
              {specs.map(([k, v]) => (
                <div key={k} className="py-2.5 flex justify-between items-center">
                  <dt className="text-charcoal/70 uppercase tracking-editorial font-medium">{k}</dt>
                  <dd className="font-mono text-espresso-900 text-right">{String(v)}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-xs text-charcoal">Standard Magnificent artisanal finish.</p>
          )}
        </div>
      </div>

      {/* Related Curated Pieces */}
      {product.related && product.related.length > 0 && (
        <div className="mt-24 pt-16 border-t border-stone">
          <div className="flex justify-between items-end mb-10">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-charcoal/70 font-semibold block mb-1">
                Complements & Harmonies
              </span>
              <h3 className="font-serif text-3xl text-espresso-900 font-medium">
                Related Curations
              </h3>
            </div>
            <Link
              to={`/${product.category?.slug || 'shop'}`}
              className="text-xs uppercase tracking-editorial text-espresso-900 hover:text-champagne-dark font-medium"
            >
              Explore Category
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.related.map((rp: any) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-espresso-900/95 flex items-center justify-center p-4"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 p-2 text-ivory-100 hover:text-champagne z-10"
            aria-label="Close lightbox"
          >
            <X className="w-8 h-8" />
          </button>
          <div
            className="max-h-[85vh] max-w-[90vw] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {isVideoMedia(currentImage.imageUrl) ? (
              <video
                src={getMediaUrl(currentImage.imageUrl)}
                controls
                autoPlay
                className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl"
              />
            ) : (
              <img
                src={getMediaUrl(currentImage.imageUrl)}
                alt={product.name}
                className="max-h-[85vh] max-w-[90vw] object-contain shadow-2xl"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
