import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import {
  ChevronLeft,
  Plus,
  Trash2,
  Save,
  Image as ImageIcon,
  UploadCloud,
  Copy,
  Check,
  ExternalLink,
  Link2,
  Loader2,
  Star,
  RefreshCw,
  Sparkles,
  Play,
  Film,
} from 'lucide-react';
import { getMediaUrl, isVideoMedia } from '../../utils/formatters.js';

function generateAutoSku(categoryId?: string, categoriesList: any[] = []): string {
  const cat = categoriesList.find((c) => c.id === categoryId);
  let prefix = 'ITM';
  if (cat?.slug) {
    if (cat.slug.includes('watch')) prefix = 'WAT';
    else if (cat.slug.includes('jewel')) prefix = 'JWL';
    else if (cat.slug.includes('perfume') || cat.slug.includes('fragrance')) prefix = 'PRF';
    else if (cat.slug.includes('gift')) prefix = 'GFT';
    else prefix = cat.slug.substring(0, 3).toUpperCase();
  }
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `MAG-${prefix}-${randomSuffix}`;
}

export const ProductEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const isEditing = Boolean(id && id !== 'new');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showCustomSlug, setShowCustomSlug] = useState(false);
  const [showCustomSku, setShowCustomSku] = useState(false);
  const [isSkuCustomized, setIsSkuCustomized] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    sku: '',
    categoryId: '',
    shortDescription: '',
    description: '',
    price: '',
    compareAtPrice: '',
    stockQuantity: '10',
    lowStockThreshold: '2',
    status: 'published',
    isFeatured: false,
    brand: 'Magnificent',
  });

  const [images, setImages] = useState<Array<{ imageUrl: string; altText: string; isPrimary: boolean }>>([
    {
      imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=1000&auto=format&fit=crop',
      altText: 'Primary photograph',
      isPrimary: true,
    },
  ]);

  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([
    { key: 'Case Material', value: '316L Stainless Steel' },
    { key: 'Movement', value: 'Automatic Calibre' },
  ]);

  useEffect(() => {
    async function init() {
      try {
        const catRes = await api.getCategories();
        if (catRes.success) {
          setCategories(catRes.data);
          if (!isEditing && catRes.data.length > 0) {
            const defaultCatId = catRes.data[0].id;
            const autoSku = generateAutoSku(defaultCatId, catRes.data);
            setForm((f) => ({
              ...f,
              categoryId: defaultCatId,
              sku: f.sku || autoSku,
            }));
          }
        }

        if (isEditing && id) {
          const prodRes = await api.getProduct(id);
          if (prodRes.success) {
            const p = prodRes.data;
            setForm({
              name: p.name,
              slug: p.slug,
              sku: p.sku,
              categoryId: p.categoryId,
              shortDescription: p.shortDescription,
              description: p.description,
              price: String(p.price),
              compareAtPrice: p.compareAtPrice ? String(p.compareAtPrice) : '',
              stockQuantity: String(p.stockQuantity),
              lowStockThreshold: String(p.lowStockThreshold),
              status: p.status,
              isFeatured: p.isFeatured,
              brand: p.brand || 'MagnifiScent',
            });

            if (p.images && p.images.length > 0) {
              setImages(p.images.map((img: any) => ({
                imageUrl: img.imageUrl,
                altText: img.altText || 'Product photograph',
                isPrimary: img.isPrimary,
              })));
            }

            if (p.specifications) {
              setSpecs(Object.entries(p.specifications).map(([key, value]) => ({
                key,
                value: String(value),
              })));
            }
          }
        }
      } catch (err: any) {
        error('Loading Error', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [id, isEditing]);

  const handleNameChange = (name: string) => {
    setForm((prev) => {
      if (!isEditing) {
        const autoSlug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        return { ...prev, name, slug: autoSlug };
      }
      return { ...prev, name };
    });
  };

  const handleCategoryChange = (newCatId: string) => {
    setForm((prev) => {
      if (!isEditing && !isSkuCustomized) {
        return {
          ...prev,
          categoryId: newCatId,
          sku: generateAutoSku(newCatId, categories),
        };
      }
      return { ...prev, categoryId: newCatId };
    });
  };

  const handleRegenerateSku = () => {
    const newSku = generateAutoSku(form.categoryId, categories);
    setForm((prev) => ({ ...prev, sku: newSku }));
    setIsSkuCustomized(false);
    success('New SKU Generated', `Assigned ${newSku}`);
  };

  const storeBase = (import.meta.env.VITE_STORE_URL as string)?.replace(/\/+$/, '') || (typeof window !== 'undefined' ? window.location.origin : 'https://magnifiscent.luxury');
  const shareableUrl = `${storeBase}/product/${form.slug || 'piece-slug'}`;

  const handleCopyShareableLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopiedLink(true);
      success('Link Copied', 'Direct product link copied to clipboard.');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      error('Copy Failed', 'Unable to copy automatically. Please copy the URL text.');
    }
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);

    try {
      let uploadedCount = 0;
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|m4v)$/i.test(file.name);

        if (!isImage && !isVideo) {
          error('Invalid File Type', `${file.name} is not an accepted visual asset (Images: JPEG, PNG, WebP; Videos: MP4, WebM, MOV).`);
          continue;
        }

        if (file.size > 50 * 1024 * 1024) {
          error('File Exceeds Limit', `${file.name} is larger than the 50MB maximum allowed size.`);
          continue;
        }

        const res = await api.uploadProductImage(file);
        if (res.success && res.data?.imageUrl) {
          uploadedCount++;
          const isUploadedVideo = isVideoMedia(res.data.imageUrl);
          setImages((prev) => {
            const hasPrimary = prev.some((img) => img.isPrimary);
            // Replace dummy unsplash image if it's the only initial one and clean
            const filtered = prev.filter((img) => img.imageUrl.trim().length > 0);
            return [
              ...filtered,
              {
                imageUrl: res.data.imageUrl,
                altText: isUploadedVideo
                  ? `Product Video - ${file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')}`
                  : file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
                isPrimary: !hasPrimary && filtered.length === 0,
              },
            ];
          });
        }
      }
      if (uploadedCount > 0) {
        success('Upload Complete', `${uploadedCount} visual asset${uploadedCount > 1 ? 's' : ''} added.`);
      }
    } catch (err: any) {
      error('Upload Error', err.message || 'Failed to upload product media.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleAddImage = () => {
    setImages((prev) => [
      ...prev,
      { imageUrl: '', altText: 'Product angle', isPrimary: false },
    ]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const remaining = prev.filter((_, idx) => idx !== index);
      if (remaining.length > 0 && !remaining.some((img) => img.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return remaining;
    });
  };

  const handleAddSpec = () => {
    setSpecs((prev) => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const specifications: Record<string, string> = {};
      specs.forEach((s) => {
        if (s.key.trim()) specifications[s.key.trim()] = s.value.trim();
      });

      const finalSku = form.sku.trim() || generateAutoSku(form.categoryId, categories);
      const payload = {
        ...form,
        sku: finalSku,
        price: parseFloat(form.price),
        compareAtPrice: form.compareAtPrice ? parseFloat(form.compareAtPrice) : null,
        stockQuantity: parseInt(form.stockQuantity, 10),
        lowStockThreshold: parseInt(form.lowStockThreshold, 10),
        specifications,
        images: images.filter((img) => img.imageUrl.trim().length > 0),
      };

      if (isEditing && id) {
        const res = await api.updateProduct(id, payload);
        if (res.success) {
          success('Product Saved', `"${form.name}" has been updated.`);
          navigate('/admin/products');
        }
      } else {
        const res = await api.createProduct(payload);
        if (res.success) {
          success('Product Created', `"${form.name}" added to catalog.`);
          navigate('/admin/products');
        }
      }
    } catch (err: any) {
      error('Save Error', err.message || 'Validation error while saving product.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs text-charcoal uppercase tracking-editorial">
        Loading product details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <Link
        to="/admin/products"
        className="inline-flex items-center space-x-1 text-xs uppercase tracking-editorial text-charcoal hover:text-espresso-900"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        <span>Back to Product List</span>
      </Link>

      <div className="border-b border-stone pb-4">
        <h1 className="font-serif text-2xl sm:text-3xl text-espresso-900 font-medium">
          {isEditing ? `Edit Creation: ${form.name}` : 'New Catalog Creation'}
        </h1>
        <p className="text-xs text-charcoal tracking-editorial uppercase mt-0.5">
          Configure horology, fine gems, extraits, or gift suites
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Core Product Details */}
        <div className="bg-white border border-stone p-6 space-y-4 text-xs">
          <h2 className="font-serif text-base text-espresso-900 font-medium border-b border-stone/50 pb-2">
            1. Identification & Nomenclature
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Product Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. The Sovereign Automatique 40mm"
                className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900 focus:outline-none focus:border-espresso-900"
              />
            </div>

            {/* Shareable Store Link Card */}
            <div className="sm:col-span-2 bg-ivory-100/70 border border-stone/70 p-4 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Link2 className="w-4 h-4 text-champagne-dark shrink-0" />
                  <span className="text-[11px] uppercase tracking-editorial text-espresso-900 font-bold">
                    Shareable Store Link
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {isEditing && form.slug && (
                    <a
                      href={`/product/${form.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] text-charcoal hover:text-espresso-900 hover:underline"
                    >
                      <span>Preview Piece</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={handleCopyShareableLink}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-espresso-900 text-ivory-100 hover:bg-espresso-800 text-[11px] uppercase tracking-wider font-semibold transition-colors shadow-sm"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-champagne" />
                        <span>Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Shareable Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-charcoal leading-relaxed">
                Automatically created web link ready to share directly with clients on WhatsApp, Instagram, or email.
              </p>

              <div className="flex items-center space-x-2 bg-white border border-stone px-3 py-2">
                <span className="text-xs font-mono text-espresso-900 truncate flex-1 select-all">
                  {shareableUrl}
                </span>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowCustomSlug(!showCustomSlug)}
                  className="text-[10px] uppercase tracking-editorial text-stone-muted hover:text-espresso-900 underline"
                >
                  {showCustomSlug ? 'Hide custom URL address' : 'Customize web link address (optional)'}
                </button>
                {showCustomSlug && (
                  <div className="mt-2 space-y-1">
                    <label className="text-[10px] text-charcoal block">Link Address Identifier:</label>
                    <input
                      type="text"
                      value={form.slug}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
                        })
                      }
                      className="w-full bg-white border border-stone px-2.5 py-1.5 font-mono text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                      placeholder="custom-link-slug"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Category *
              </label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900 focus:outline-none focus:border-espresso-900"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Auto-Generated SKU */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold flex items-center space-x-1.5">
                  <span>SKU (Stock Keeping Unit)</span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-xs font-mono font-medium">
                    Auto-Generated
                  </span>
                </label>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={handleRegenerateSku}
                    title="Generate new random SKU"
                    className="inline-flex items-center space-x-1 text-[10px] uppercase tracking-wider text-champagne-dark hover:text-espresso-900 font-medium transition-colors"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex-1 bg-ivory-100 border border-stone px-3 py-2 font-mono text-xs font-semibold text-espresso-900 flex items-center justify-between">
                  <span>{form.sku || 'Generating...'}</span>
                  <span className="text-[10px] font-sans text-stone-muted font-normal">System managed</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomSku(!showCustomSku)}
                  className="px-2.5 py-2 border border-stone bg-ivory-50 hover:bg-ivory-200 text-charcoal hover:text-espresso-900 text-[11px] transition-colors"
                  title="Customize SKU manually"
                >
                  {showCustomSku ? 'Hide' : 'Edit'}
                </button>
              </div>

              {showCustomSku && (
                <div className="mt-2 space-y-1 animate-in fade-in duration-200">
                  <label className="text-[10px] text-charcoal">Custom SKU Override:</label>
                  <input
                    type="text"
                    value={form.sku}
                    onChange={(e) => {
                      setForm({ ...form, sku: e.target.value.toUpperCase().replace(/\s+/g, '-') });
                      setIsSkuCustomized(true);
                    }}
                    placeholder="e.g. MAG-WAT-001"
                    className="w-full bg-white border border-stone px-2.5 py-1.5 font-mono text-xs uppercase text-espresso-900 focus:outline-none focus:border-espresso-900"
                  />
                  <p className="text-[10px] text-stone-muted">
                    Leave as auto-generated or specify your internal warehouse reference.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Brand / Atelier
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="e.g. MagnifiScent Parfums / Horlogerie"
                className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900 focus:outline-none focus:border-espresso-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Short Description (Catalog Subheading) *
              </label>
              <input
                type="text"
                required
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900 focus:outline-none focus:border-espresso-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Full Editorial Description *
              </label>
              <textarea
                required
                rows={5}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-ivory-50 border border-stone px-3 py-2 text-espresso-900 focus:outline-none focus:border-espresso-900"
              />
            </div>
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white border border-stone p-6 space-y-4 text-xs">
          <h2 className="font-serif text-base text-espresso-900 font-medium border-b border-stone/50 pb-2">
            2. Financial Valuation & Allocation
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Retail Price (₦) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="1850000"
                className="w-full bg-ivory-50 border border-stone px-3 py-2 font-mono text-espresso-900 focus:outline-none focus:border-espresso-900"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Compare-at Price (₦)
              </label>
              <input
                type="number"
                min="0"
                value={form.compareAtPrice}
                onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })}
                placeholder="Optional higher price"
                className="w-full bg-ivory-50 border border-stone px-3 py-2 font-mono text-espresso-900 focus:outline-none focus:border-espresso-900"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Available Stock Quantity *
              </label>
              <input
                type="number"
                required
                min="0"
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                className="w-full bg-ivory-50 border border-stone px-3 py-2 font-mono text-espresso-900 focus:outline-none focus:border-espresso-900"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase tracking-editorial text-espresso-900 font-semibold block mb-1">
                Low Stock Warning Threshold
              </label>
              <input
                type="number"
                required
                min="0"
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                className="w-full bg-ivory-50 border border-stone px-3 py-2 font-mono text-espresso-900 focus:outline-none focus:border-espresso-900"
              />
            </div>
          </div>

          <div className="flex items-center space-x-6 pt-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="text-espresso-900 focus:ring-espresso-900"
              />
              <label htmlFor="isFeatured" className="text-xs uppercase tracking-editorial text-espresso-900 font-medium cursor-pointer">
                Signature Featured Edit
              </label>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-xs uppercase tracking-editorial text-charcoal font-medium">Status:</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="bg-ivory-50 border border-stone px-3 py-1 text-xs text-espresso-900"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Imagery & Videos */}
        <div className="bg-white border border-stone p-6 space-y-5 text-xs">
          <div className="flex justify-between items-center border-b border-stone/50 pb-2">
            <div>
              <h2 className="font-serif text-base text-espresso-900 font-medium">
                3. Visual Assets (Product Photography & Video Showcases)
              </h2>
              <p className="text-[11px] text-charcoal">
                Upload image or video files directly, or paste media URLs. Supports JPEG, PNG, WebP, GIF, MP4, WebM, and MOV up to 50MB.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddImage}
              className="text-xs text-champagne-dark hover:underline inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add URL Field</span>
            </button>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime,video/ogg,video/x-m4v"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) handleFileUpload(e.target.files);
            }}
          />

          {/* Luxury Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-champagne bg-champagne-light/20 scale-[1.01]'
                : 'border-stone/80 bg-ivory-50/70 hover:bg-ivory-100/60 hover:border-espresso-900'
            }`}
          >
            <div className="max-w-md mx-auto space-y-2">
              <div className="flex justify-center">
                {isUploadingImage ? (
                  <Loader2 className="w-8 h-8 text-champagne-dark animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-espresso-800/80 stroke-[1.5]" />
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-espresso-900 uppercase tracking-editorial">
                  {isUploadingImage ? 'Uploading Visual Asset (Photo/Video)...' : 'Click or Drag & Drop Photos & Videos Here'}
                </p>
                <p className="text-[11px] text-charcoal mt-1">
                  Upload multiple high-resolution photographs or video showcases up to 50MB each.
                </p>
              </div>
              <button
                type="button"
                disabled={isUploadingImage}
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                className="mt-2 inline-flex items-center space-x-1.5 px-4 py-2 bg-espresso-900 text-ivory-100 text-[11px] uppercase tracking-wider font-semibold hover:bg-espresso-800 transition-colors shadow-sm disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>Browse Files on Computer</span>
              </button>
            </div>
          </div>

          {/* Media Cards List */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-editorial text-charcoal font-medium">
              <span>Attached Media ({images.filter(i => i.imageUrl.trim()).length})</span>
              <span>Primary asset appears on catalog and storefront</span>
            </div>

            {images.map((img, idx) => (
              <div
                key={idx}
                className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3 bg-ivory-50 border transition-all ${
                  img.isPrimary ? 'border-champagne bg-champagne-light/10 ring-1 ring-champagne/40' : 'border-stone/60'
                }`}
              >
                {/* Thumbnail Preview */}
                <div className="w-16 h-16 bg-espresso-900 border border-stone/50 overflow-hidden shrink-0 flex items-center justify-center relative">
                  {img.imageUrl ? (
                    isVideoMedia(img.imageUrl) ? (
                      <div className="relative w-full h-full flex items-center justify-center bg-espresso-950">
                        <video
                          src={getMediaUrl(img.imageUrl)}
                          className="w-full h-full object-cover opacity-80"
                          muted
                          preload="metadata"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-espresso-900/30">
                          <Play className="w-4 h-4 text-ivory-100 fill-ivory-100/40" />
                        </div>
                        <span className="absolute bottom-0.5 left-0.5 bg-espresso-950/90 text-champagne text-[7px] font-bold tracking-wider px-1 py-0.2 rounded-xs uppercase">
                          Video
                        </span>
                      </div>
                    ) : (
                      <img
                        src={getMediaUrl(img.imageUrl)}
                        alt={img.altText || 'Product preview'}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23999" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                        }}
                      />
                    )
                  ) : (
                    <ImageIcon className="w-6 h-6 text-stone-muted" />
                  )}
                  {img.isPrimary && (
                    <span className="absolute top-0.5 right-0.5 bg-champagne text-espresso-900 text-[8px] font-bold uppercase px-1 rounded-sm z-10">
                      Main
                    </span>
                  )}
                </div>

                {/* Image Details */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <input
                    type="text"
                    required
                    placeholder="Photo/Video URL or uploaded path (/uploads/products/...)"
                    value={img.imageUrl}
                    onChange={(e) => {
                      const next = [...images];
                      next[idx].imageUrl = e.target.value;
                      setImages(next);
                    }}
                    className="w-full bg-white border border-stone px-2.5 py-1.5 font-mono text-xs text-espresso-900 focus:outline-none focus:border-espresso-900"
                  />
                  <input
                    type="text"
                    placeholder="Descriptive label/alt text (e.g. Atelier Movement Video or Dial Detail)"
                    value={img.altText}
                    onChange={(e) => {
                      const next = [...images];
                      next[idx].altText = e.target.value;
                      setImages(next);
                    }}
                    className="w-full bg-white/80 border border-stone/60 px-2 py-1 text-[11px] text-charcoal focus:outline-none focus:border-espresso-900"
                  />
                </div>

                {/* Primary Selector & Remove Action */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const next = images.map((im, i) => ({ ...im, isPrimary: i === idx }));
                      setImages(next);
                    }}
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold border transition-colors ${
                      img.isPrimary
                        ? 'bg-champagne text-espresso-900 border-champagne'
                        : 'bg-white text-charcoal border-stone hover:border-espresso-900'
                    }`}
                  >
                    <Star className="w-3 h-3" />
                    <span>{img.isPrimary ? 'Primary Image' : 'Set as Primary'}</span>
                  </button>

                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1 text-stone-muted hover:text-red-700 transition-colors inline-flex items-center space-x-1"
                      title="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span className="sm:hidden text-[10px] text-red-700">Delete</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white border border-stone p-6 space-y-4 text-xs">
          <div className="flex justify-between items-center border-b border-stone/50 pb-2">
            <h2 className="font-serif text-base text-espresso-900 font-medium">
              4. Technical Specifications
            </h2>
            <button
              type="button"
              onClick={handleAddSpec}
              className="text-xs text-champagne-dark hover:underline inline-flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Field</span>
            </button>
          </div>

          <div className="space-y-3">
            {specs.map((s, idx) => (
              <div key={idx} className="flex items-center space-x-3">
                <input
                  type="text"
                  placeholder="e.g. Case Diameter or Top Notes"
                  value={s.key}
                  onChange={(e) => {
                    const next = [...specs];
                    next[idx].key = e.target.value;
                    setSpecs(next);
                  }}
                  className="w-1/3 bg-ivory-50 border border-stone px-2.5 py-1.5 text-xs text-espresso-900"
                />
                <input
                  type="text"
                  placeholder="e.g. 40 mm or Taif Rose"
                  value={s.value}
                  onChange={(e) => {
                    const next = [...specs];
                    next[idx].value = e.target.value;
                    setSpecs(next);
                  }}
                  className="flex-1 bg-ivory-50 border border-stone px-2.5 py-1.5 text-xs text-espresso-900"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(idx)}
                  className="p-1 text-stone-muted hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-3 border border-stone text-xs uppercase tracking-editorial hover:bg-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-espresso-900 hover:bg-espresso-800 disabled:opacity-50 text-ivory-100 text-xs uppercase tracking-editorial font-semibold transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Preserving...' : 'Save Creation'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
