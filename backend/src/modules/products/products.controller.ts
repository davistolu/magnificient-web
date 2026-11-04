import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { productCreateSchema } from '../../shared/index.js';
import { store } from '../../database/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { verifyFileSignature } from '../../middleware/upload.js';
import { storageService } from '../../services/storage.service.js';

export async function listProducts(req: Request, res: Response) {
  const {
    category,
    minPrice,
    maxPrice,
    brand,
    gender,
    occasion,
    search,
    sort = 'featured',
    page = '1',
    limit = '12',
    status,
  } = req.query;

  let queryList = [...store.products];

  // Admin status filter vs public storefront
  if (status && req.user?.role === 'admin') {
    queryList = queryList.filter((p) => p.status === status);
  } else {
    // Default public: only published products
    queryList = queryList.filter((p) => p.status === 'published');
  }

  // Category filter
  if (category && category !== 'all') {
    const cat = store.categories.find(
      (c) => c.slug.toLowerCase() === String(category).toLowerCase() || c.id === category
    );
    if (cat) {
      queryList = queryList.filter((p) => p.categoryId === cat.id);
    }
  }

  // Price range filters
  if (minPrice) {
    const min = parseFloat(String(minPrice));
    if (!isNaN(min)) {
      queryList = queryList.filter((p) => p.price >= min);
    }
  }
  if (maxPrice) {
    const max = parseFloat(String(maxPrice));
    if (!isNaN(max)) {
      queryList = queryList.filter((p) => p.price <= max);
    }
  }

  // Brand filter
  if (brand) {
    queryList = queryList.filter(
      (p) => p.brand && p.brand.toLowerCase() === String(brand).toLowerCase()
    );
  }

  // Gender filter
  if (gender) {
    queryList = queryList.filter(
      (p) => p.gender === gender || p.gender === 'unisex'
    );
  }

  // Occasion filter
  if (occasion) {
    queryList = queryList.filter(
      (p) => Array.isArray(p.occasion) && p.occasion.includes(String(occasion))
    );
  }

  // Search filter
  if (search && String(search).trim()) {
    const term = String(search).toLowerCase().trim();
    queryList = queryList.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.shortDescription.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.sku.toLowerCase().includes(term) ||
        (p.brand && p.brand.toLowerCase().includes(term))
    );
  }

  // Sorting
  switch (sort) {
    case 'price_asc':
      queryList.sort((a, b) => a.price - b.price);
      break;
    case 'price_desc':
      queryList.sort((a, b) => b.price - a.price);
      break;
    case 'name_asc':
      queryList.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'newest':
      queryList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'featured':
    default:
      queryList.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      break;
  }

  const total = queryList.length;
  const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
  const limitNum = Math.max(1, parseInt(String(limit), 10) || 12);
  const totalPages = Math.ceil(total / limitNum) || 1;
  const offset = (pageNum - 1) * limitNum;

  const paginated = queryList.slice(offset, offset + limitNum).map((p) => {
    const categoryObj = store.categories.find((c) => c.id === p.categoryId);
    const images = store.productImages
      .filter((img) => img.productId === p.id)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    return {
      ...p,
      category: categoryObj,
      images,
    };
  });

  return res.json({
    success: true,
    data: paginated,
    meta: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    },
  });
}

export async function getProduct(req: Request, res: Response) {
  const { slugOrId } = req.params;
  const product = store.products.find(
    (p) => p.slug.toLowerCase() === slugOrId.toLowerCase() || p.id === slugOrId
  );

  if (!product) {
    throw new AppError('Product not found in catalog', 404);
  }

  const categoryObj = store.categories.find((c) => c.id === product.categoryId);
  const images = store.productImages
    .filter((img) => img.productId === product.id)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // Find related products in same category
  const related = store.products
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id && p.status === 'published')
    .slice(0, 4)
    .map((rp) => ({
      ...rp,
      category: categoryObj,
      images: store.productImages.filter((img) => img.productId === rp.id),
    }));

  return res.json({
    success: true,
    data: {
      ...product,
      category: categoryObj,
      images,
      related,
    },
  });
}

export async function getFeaturedProducts(req: Request, res: Response) {
  const featured = store.products
    .filter((p) => p.isFeatured && p.status === 'published')
    .slice(0, 6)
    .map((p) => {
      const categoryObj = store.categories.find((c) => c.id === p.categoryId);
      const images = store.productImages
        .filter((img) => img.productId === p.id)
        .sort((a, b) => a.displayOrder - b.displayOrder);
      return {
        ...p,
        category: categoryObj,
        images,
      };
    });

  return res.json({
    success: true,
    data: featured,
  });
}

export async function createProduct(req: Request, res: Response) {
  const validated = productCreateSchema.parse(req.body);

  let slug = validated.slug;
  if (!slug || slug.trim() === '') {
    slug = validated.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }

  let finalSlug = slug;
  if (store.products.some((p) => p.slug === finalSlug)) {
    finalSlug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
  }

  let sku = validated.sku;
  if (!sku || sku.trim() === '') {
    const category = store.categories.find((c) => c.id === validated.categoryId);
    let catCode = 'ITM';
    if (category?.slug) {
      if (category.slug.includes('watch')) catCode = 'WAT';
      else if (category.slug.includes('jewel')) catCode = 'JWL';
      else if (category.slug.includes('perfume') || category.slug.includes('fragrance')) catCode = 'PRF';
      else if (category.slug.includes('gift')) catCode = 'GFT';
      else catCode = category.slug.substring(0, 3).toUpperCase();
    }
    const rand = Math.floor(1000 + Math.random() * 9000);
    sku = `MAG-${catCode}-${rand}`;
  }

  const existingSku = store.products.find((p) => p.sku === sku);
  if (existingSku) {
    sku = `MAG-${Date.now().toString().slice(-6)}`;
  }

  const productId = `prod-${Date.now()}`;
  const newProduct = {
    id: productId,
    categoryId: validated.categoryId,
    name: validated.name,
    slug: finalSlug,
    sku,
    shortDescription: validated.shortDescription,
    description: validated.description,
    price: validated.price,
    compareAtPrice: validated.compareAtPrice || null,
    stockQuantity: validated.stockQuantity,
    lowStockThreshold: validated.lowStockThreshold,
    status: validated.status,
    isFeatured: validated.isFeatured,
    brand: validated.brand || 'Magnificent',
    gender: 'unisex',
    specifications: validated.specifications,
    tags: [],
    occasion: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.saveProduct(newProduct, validated.images);

  // Record initial inventory movement
  store.saveInventoryMovement({
    id: `inv-${Date.now()}`,
    productId,
    productName: validated.name,
    quantityChange: validated.stockQuantity,
    movementType: 'initial_stock',
    reason: 'Initial catalog creation',
    referenceId: sku,
    createdBy: req.user?.fullName || 'Administrator',
    createdAt: new Date(),
  });

  // Log audit
  store.saveAuditLog({
    id: `aud-${Date.now()}`,
    actorId: req.user?.id || 'admin',
    actorName: req.user?.fullName || 'Admin',
    action: 'product_create',
    resourceType: 'product',
    resourceId: productId,
    metadata: { name: validated.name, sku },
    createdAt: new Date(),
  });

  return res.status(201).json({
    success: true,
    data: newProduct,
  });
}

export async function updateProduct(req: Request, res: Response) {
  const { id } = req.params;
  const productIndex = store.products.findIndex((p) => p.id === id);
  if (productIndex === -1) {
    throw new AppError('Product not found', 404);
  }

  const existing = store.products[productIndex];
  const updates = req.body;

  // Prevent changing to an already taken slug or sku
  if (updates.slug && updates.slug !== existing.slug) {
    if (store.products.some((p) => p.slug === updates.slug && p.id !== id)) {
      throw new AppError('A product with this slug already exists', 400);
    }
  }
  if (updates.sku && updates.sku !== existing.sku) {
    if (store.products.some((p) => p.sku === updates.sku && p.id !== id)) {
      throw new AppError('A product with this SKU already exists', 400);
    }
  }

  const updatedProduct = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };

  const imagesToSave = Array.isArray(updates.images) ? updates.images : store.productImages.filter((img) => img.productId === id);
  store.saveProduct(updatedProduct, imagesToSave);

  store.saveAuditLog({
    id: `aud-${Date.now()}`,
    actorId: req.user?.id || 'admin',
    actorName: req.user?.fullName || 'Admin',
    action: 'product_update',
    resourceType: 'product',
    resourceId: id,
    metadata: { updates: Object.keys(updates) },
    createdAt: new Date(),
  });

  return res.json({
    success: true,
    data: updatedProduct,
  });
}

export async function archiveProduct(req: Request, res: Response) {
  const { id } = req.params;
  const product = store.products.find((p) => p.id === id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  product.status = 'archived';
  product.updatedAt = new Date();
  store.saveProduct(product);

  return res.json({
    success: true,
    message: 'Product archived successfully',
  });
}

export async function deleteProduct(req: Request, res: Response) {
  const { id } = req.params;
  const product = store.products.find((p) => p.id === id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  await store.deleteProduct(id);

  store.saveAuditLog({
    id: `aud-${Date.now()}`,
    actorId: req.user?.id || 'admin',
    actorName: req.user?.fullName || 'Admin',
    action: 'product_delete',
    resourceType: 'product',
    resourceId: id,
    metadata: { name: product.name, sku: product.sku },
    createdAt: new Date(),
  });

  return res.json({
    success: true,
    message: `Product "${product.name}" permanently deleted from catalog`,
  });
}

export async function uploadProductImage(req: Request, res: Response) {
  if (!req.file) {
    throw new AppError('No media file uploaded', 400);
  }

  // Validate magic bytes
  const isValidSignature = verifyFileSignature(req.file.path);
  if (!isValidSignature) {
    try {
      fs.unlinkSync(req.file.path);
    } catch {
      // ignore unlink error
    }
    throw new AppError(
      'Invalid media binary signature. Only genuine JPEG, PNG, WebP, GIF images or MP4, WebM, MOV videos are accepted.',
      400
    );
  }

  const ext = path.extname(req.file.originalname).toLowerCase();
  const isVideo = req.file.mimetype.startsWith('video/') ||
    ['.mp4', '.webm', '.mov', '.ogg', '.m4v'].includes(ext);

  // Upload to Neon/S3 bucket if configured, or keep on local disk
  const uploadResult = await storageService.uploadProductMedia(
    req.file.path,
    req.file.filename,
    req.file.mimetype
  );

  return res.status(201).json({
    success: true,
    message: isVideo ? 'Product video uploaded successfully' : 'Product photograph uploaded successfully',
    data: {
      imageUrl: uploadResult.url,
      mediaUrl: uploadResult.url,
      storage: uploadResult.storage,
      mediaType: isVideo ? 'video' : 'image',
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    },
  });
}
