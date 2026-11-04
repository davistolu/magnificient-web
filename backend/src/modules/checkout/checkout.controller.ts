import { Request, Response } from 'express';
import { checkoutSchema } from '../../shared/index.js';
import { store } from '../../database/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import crypto from 'crypto';

export async function processCheckout(req: Request, res: Response) {
  const validated = checkoutSchema.parse(req.body);

  // 1. Verify all products and available stock
  const validatedItems: Array<{
    product: any;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
    selectedOptions: Record<string, string>;
    primaryImage: string;
  }> = [];

  let subtotal = 0;

  for (const item of validated.items) {
    const product = store.products.find((p) => p.id === item.productId);
    if (!product || product.status !== 'published') {
      throw new AppError(`Item "${item.productId}" is not available for purchase.`, 400);
    }

    if (product.stockQuantity < item.quantity) {
      throw new AppError(
        `Insufficient stock for "${product.name}". Only ${product.stockQuantity} piece(s) available.`,
        400
      );
    }

    const unitPrice = Number(product.price);
    const lineTotal = unitPrice * item.quantity;
    subtotal += lineTotal;

    const primaryImage = store.productImages.find((img) => img.productId === product.id && img.isPrimary) ||
      store.productImages.find((img) => img.productId === product.id);

    validatedItems.push({
      product,
      quantity: item.quantity,
      unitPrice,
      lineTotal,
      selectedOptions: item.selectedOptions || {},
      primaryImage: primaryImage?.imageUrl || '',
    });
  }

  // 2. Calculate Discounts
  let discountAmount = 0;
  let appliedDiscount: any = null;
  if (validated.discountCode) {
    appliedDiscount = store.discounts.find(
      (d) => d.code.toUpperCase() === validated.discountCode?.trim().toUpperCase() && d.isActive
    );
    if (appliedDiscount) {
      if (!appliedDiscount.minOrderAmount || subtotal >= Number(appliedDiscount.minOrderAmount)) {
        if (appliedDiscount.discountType === 'percentage') {
          discountAmount = Math.round((subtotal * Number(appliedDiscount.discountValue)) / 100);
        } else {
          discountAmount = Math.min(subtotal, Number(appliedDiscount.discountValue));
        }
        appliedDiscount.usageCount += 1;
      }
    }
  }

  // 3. Calculate Shipping Fee from Store Settings
  const generalSettings = store.storeSettings.get('general');
  const shippingSettings = generalSettings?.shipping || {
    standardFee: 3500,
    expressFee: 7000,
    freeShippingThreshold: 150000,
  };

  let shippingAmount = validated.shippingMethod === 'express'
    ? shippingSettings.expressFee
    : shippingSettings.standardFee;

  if (subtotal >= shippingSettings.freeShippingThreshold && validated.shippingMethod === 'standard') {
    shippingAmount = 0;
  }

  const totalAmount = Math.max(0, subtotal - discountAmount + shippingAmount);

  // 4. Generate Unique Order Number & Guest Access Token
  const year = new Date().getFullYear();
  const randomSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  const orderNumber = `MAG-${year}-${randomSuffix}`;
  const guestAccessToken = crypto.randomUUID();
  const orderId = `ord-${Date.now()}-${randomSuffix}`;

  const matchingCustomer = req.user?.id
    ? store.users.find((u) => u.id === req.user?.id)
    : store.users.find((u) => u.email.toLowerCase() === validated.customerEmail.toLowerCase());
  const customerId = matchingCustomer?.id || null;

  // 5. Deduct Stock & Record Inventory Movement
  for (const item of validatedItems) {
    item.product.stockQuantity -= item.quantity;

    store.saveInventoryMovement({
      id: `inv-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
      productId: item.product.id,
      productName: item.product.name,
      quantityChange: -item.quantity,
      movementType: 'sale',
      reason: `Order placed: ${orderNumber}`,
      referenceId: orderNumber,
      createdBy: 'Customer Checkout',
      createdAt: new Date(),
    });
  }

  // 6. Create Order and Order Items
  const newOrder = {
    id: orderId,
    orderNumber,
    guestAccessToken,
    customerId,
    customerName: validated.customerName,
    customerEmail: validated.customerEmail,
    customerPhone: validated.customerPhone,
    deliveryAddress: validated.deliveryAddress,
    deliveryCity: validated.deliveryCity,
    deliveryState: validated.deliveryState,
    deliveryInstructions: validated.deliveryInstructions || null,
    subtotal,
    discountAmount,
    shippingAmount,
    totalAmount,
    currency: generalSettings?.currency || 'NGN',
    paymentMethod: validated.paymentMethod,
    paymentStatus: 'unpaid' as const,
    orderStatus: 'pending_payment' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createdOrderItems = validatedItems.map((item, idx) => ({
    id: `itm-${orderId}-${idx}`,
    orderId,
    productId: item.product.id,
    productNameSnapshot: item.product.name,
    skuSnapshot: item.product.sku,
    unitPrice: item.unitPrice,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
    selectedOptionsSnapshot: item.selectedOptions,
    productImageSnapshot: item.primaryImage,
    createdAt: new Date(),
  }));

  store.saveOrder(newOrder, createdOrderItems);

  // 7. Record Order Status History
  store.saveOrderStatusHistory({
    id: `osh-${Date.now()}`,
    orderId,
    previousStatus: null,
    newStatus: 'pending_payment',
    changedBy: 'Checkout System',
    note: `Order initialized via ${validated.paymentMethod === 'bank_transfer' ? 'Manual Bank Transfer' : 'Direct WhatsApp Concierge'}`,
    createdAt: new Date(),
  });

  // 8. In-App Notification for Store Admin
  store.notifications.push({
    id: `notif-${Date.now()}`,
    recipientRole: 'admin',
    title: `New Luxury Order Placed: ${orderNumber}`,
    message: `${validated.customerName} placed order ${orderNumber} for ₦${totalAmount.toLocaleString()} (${validated.paymentMethod})`,
    type: 'order',
    isRead: false,
    orderId: orderNumber,
    createdAt: new Date(),
  });

  // 9. If WhatsApp ordering, generate prefilled WhatsApp link
  let whatsappUrl: string | null = null;
  if (validated.paymentMethod === 'whatsapp') {
    const rawNumber = generalSettings?.whatsappNumber || '+2348000000000';
    const cleanNumber = rawNumber.replace(/[^0-9]/g, '');

    const itemsSummary = validatedItems
      .map((i) => `• ${i.product.name} (Qty: ${i.quantity}) - ₦${i.lineTotal.toLocaleString()}`)
      .join('\n');

    const msg = [
      `Hello Magnificent Concierge,`,
      `I would like to complete my luxury order:`,
      `Order Reference: ${orderNumber}`,
      `Customer: ${validated.customerName} (${validated.customerPhone})`,
      `Delivery Destination: ${validated.deliveryCity}, ${validated.deliveryState}`,
      `\nItems:`,
      itemsSummary,
      `\nEstimated Total: ₦${totalAmount.toLocaleString()}`,
      `\nPlease confirm delivery schedule and assist me with finishing this order.`,
    ].join('\n');

    whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(msg)}`;
  }

  return res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: {
      order: {
        ...newOrder,
        items: createdOrderItems,
      },
      guestAccessToken,
      whatsappUrl,
      bankDetails: generalSettings?.bankDetails || null,
    },
  });
}
