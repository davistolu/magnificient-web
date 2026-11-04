import { Request, Response } from 'express';
import { store } from '../../database/index.js';
import { CartItem, CartSummary } from '../../shared/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function verifyCart(req: Request, res: Response) {
  const { items, discountCode, shippingMethod = 'standard' } = req.body;

  if (!Array.isArray(items)) {
    throw new AppError('Invalid cart payload. Array of items is required.', 400);
  }

  const verifiedItems: CartItem[] = [];
  let subtotal = 0;
  const issues: string[] = [];

  for (const item of items) {
    const product = store.products.find((p) => p.id === item.productId);
    if (!product || product.status !== 'published') {
      issues.push(`Product "${item.name || item.productId}" is no longer available in the catalog.`);
      continue;
    }

    if (product.stockQuantity <= 0) {
      issues.push(`Product "${product.name}" is currently sold out.`);
      continue;
    }

    // Cap requested quantity to available stock
    const safeQuantity = Math.min(Math.max(1, parseInt(item.quantity, 10) || 1), product.stockQuantity);
    if (safeQuantity < item.quantity) {
      issues.push(`Requested quantity for "${product.name}" was adjusted to available stock (${product.stockQuantity}).`);
    }

    const primaryImage = store.productImages.find((img) => img.productId === product.id && img.isPrimary) ||
      store.productImages.find((img) => img.productId === product.id);

    const canonicalPrice = Number(product.price);
    const lineTotal = canonicalPrice * safeQuantity;
    subtotal += lineTotal;

    verifiedItems.push({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      sku: product.sku,
      price: canonicalPrice,
      imageUrl: primaryImage?.imageUrl || '',
      quantity: safeQuantity,
      maxStock: product.stockQuantity,
      selectedOptions: item.selectedOptions || {},
    });
  }

  // Calculate Discount
  let discountAmount = 0;
  if (discountCode && typeof discountCode === 'string') {
    const discount = store.discounts.find(
      (d) => d.code.toUpperCase() === discountCode.trim().toUpperCase() && d.isActive
    );
    if (discount) {
      if (!discount.minOrderAmount || subtotal >= Number(discount.minOrderAmount)) {
        if (discount.discountType === 'percentage') {
          discountAmount = Math.round((subtotal * Number(discount.discountValue)) / 100);
        } else {
          discountAmount = Math.min(subtotal, Number(discount.discountValue));
        }
      }
    }
  }

  // Calculate Shipping from Store Settings
  const generalSettings = store.storeSettings.get('general');
  const shippingSettings = generalSettings?.shipping || {
    standardFee: 3500,
    expressFee: 7000,
    freeShippingThreshold: 150000,
  };

  let shippingAmount = shippingMethod === 'express'
    ? shippingSettings.expressFee
    : shippingSettings.standardFee;

  if (subtotal >= shippingSettings.freeShippingThreshold && shippingMethod === 'standard') {
    shippingAmount = 0;
  }

  if (verifiedItems.length === 0) {
    shippingAmount = 0;
  }

  const total = Math.max(0, subtotal - discountAmount + shippingAmount);

  const summary: CartSummary = {
    items: verifiedItems,
    subtotal,
    discountAmount,
    shippingAmount,
    total,
    currency: generalSettings?.currency || 'NGN',
  };

  return res.json({
    success: true,
    data: summary,
    issues: issues.length > 0 ? issues : undefined,
  });
}
