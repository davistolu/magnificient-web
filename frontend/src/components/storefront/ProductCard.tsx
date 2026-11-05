import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice, getMediaUrl, isVideoMedia } from '../../utils/formatters.js';
import { useCart } from '../../context/CartContext.js';
import { useToast } from '../../context/ToastContext.js';
import { ShoppingBag, Play, Share2, Check } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    sku: string;
    price: number | string;
    compareAtPrice?: number | string | null;
    stockQuantity: number;
    lowStockThreshold: number;
    brand?: string;
    isFeatured?: boolean;
    images?: Array<{ imageUrl: string; altText: string; isPrimary: boolean }>;
  };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addItem } = useCart();
  const { success } = useToast();
  const [copied, setCopied] = useState(false);

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.imageUrl ||
    product.images?.[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop';

  const secondaryImage =
    product.images?.[1]?.imageUrl || primaryImage;

  const isSoldOut = product.stockQuantity <= 0;
  const isLowStock = !isSoldOut && product.stockQuantity <= product.lowStockThreshold;
  const isPrimaryVideo = isVideoMedia(primaryImage);

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://magnifiscent.site';
    const shareUrl = `${origin}/products/${product.slug}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | MagnifiScent`,
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

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSoldOut) return;

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: Number(product.price),
      imageUrl: primaryImage,
      maxStock: product.stockQuantity,
    });
  };

  return (
    <div className="group relative flex flex-col bg-white border border-stone/50 hover:border-stone transition-all duration-300">
      {/* Product Image Frame */}
      <Link
        to={`/products/${product.slug}`}
        className="relative block aspect-[4/5] overflow-hidden bg-stone-light"
      >
        {isPrimaryVideo ? (
          <div className="relative w-full h-full">
            <video
              src={getMediaUrl(primaryImage)}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-xs text-[9px] font-mono text-white flex items-center space-x-1 z-10">
              <Play className="w-2.5 h-2.5 fill-white" />
              <span>VIDEO</span>
            </div>
          </div>
        ) : (
          <img
            src={getMediaUrl(primaryImage)}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop';
            }}
          />
        )}

        {/* Secondary image crossfade if available and not a video */}
        {!isPrimaryVideo && secondaryImage !== primaryImage && !isVideoMedia(secondaryImage) && (
          <img
            src={getMediaUrl(secondaryImage)}
            alt={`${product.name} detail`}
            className="absolute inset-0 w-full h-full object-cover object-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop';
            }}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-1 z-10">
          {product.isFeatured && (
            <span className="bg-espresso-900/90 text-ivory-100 text-[9px] uppercase tracking-editorial px-2.5 py-1 font-medium backdrop-blur-xs">
              Signature Edit
            </span>
          )}
          {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
            <span className="bg-champagne-dark text-white text-[9px] uppercase tracking-editorial px-2.5 py-1 font-medium">
              Curated Offer
            </span>
          )}
        </div>

        {/* Share & Copy Link Button */}
        <button
          type="button"
          onClick={handleShare}
          className={`absolute top-3 right-3 p-2 bg-white/95 hover:bg-white text-espresso-900 shadow-sm border transition-all duration-200 z-20 backdrop-blur-xs flex items-center justify-center ${
            copied
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50 opacity-100'
              : 'border-stone/60 hover:border-champagne-dark sm:opacity-0 sm:group-hover:opacity-100'
          }`}
          title={copied ? 'Link Copied!' : 'Share piece link'}
          aria-label={`Share ${product.name}`}
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-700 stroke-[2.5]" />
          ) : (
            <Share2 className="w-3.5 h-3.5 stroke-[1.75]" />
          )}
        </button>

        {/* Stock Alert Badge */}
        {isSoldOut ? (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
            <span className="font-serif text-xs uppercase tracking-editorial text-espresso-900 bg-white px-3 py-1.5 border border-stone font-semibold">
              Sold Out
            </span>
          </div>
        ) : isLowStock ? (
          <span className="absolute bottom-3 left-3 bg-white/95 text-charcoal text-[9px] uppercase tracking-editorial px-2 py-0.5 border border-stone/80">
            Only {product.stockQuantity} remaining
          </span>
        ) : null}

        {/* Quick Add Button on Hover */}
        {!isSoldOut && (
          <button
            onClick={handleQuickAdd}
            className="absolute bottom-3 right-3 p-2.5 bg-espresso-900 text-ivory-100 hover:bg-champagne-dark transition-all duration-200 opacity-0 group-hover:opacity-100 shadow-md"
            title="Quick add to bag"
            aria-label={`Add ${product.name} to bag`}
          >
            <ShoppingBag className="w-4 h-4 stroke-[1.5]" />
          </button>
        )}
      </Link>

      {/* Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {product.brand && (
            <p className="text-[10px] tracking-widest text-charcoal/70 uppercase font-sans mb-1">
              {product.brand}
            </p>
          )}
          <Link
            to={`/products/${product.slug}`}
            className="font-serif text-sm sm:text-base font-medium text-espresso-900 hover:text-champagne-dark transition-colors line-clamp-2 leading-snug"
          >
            {product.name}
          </Link>
        </div>

        <div className="mt-3 pt-3 border-t border-stone/40 flex items-center justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-sm font-semibold text-espresso-900 font-sans tracking-tight">
              {formatPrice(product.price)}
            </span>
            {product.compareAtPrice && Number(product.compareAtPrice) > Number(product.price) && (
              <span className="text-xs text-charcoal/60 line-through font-sans">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleShare}
            className="text-stone-muted hover:text-champagne-dark transition-colors p-1"
            title={copied ? 'Link Copied!' : 'Share or copy piece link'}
            aria-label={`Share or copy link for ${product.name}`}
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-700" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
