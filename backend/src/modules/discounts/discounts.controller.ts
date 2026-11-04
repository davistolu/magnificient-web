import { Request, Response } from 'express';
import { store } from '../../database/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function validateDiscount(req: Request, res: Response) {
  const { code, subtotal } = req.body;
  if (!code) {
    throw new AppError('Discount code is required', 400);
  }

  const discount = store.discounts.find(
    (d) => d.code.toUpperCase() === String(code).trim().toUpperCase()
  );

  if (!discount || !discount.isActive) {
    throw new AppError('Invalid or inactive promotional code', 400);
  }

  if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
    throw new AppError('This promotional code has reached its maximum redemptions', 400);
  }

  const orderSubtotal = Number(subtotal) || 0;
  if (discount.minOrderAmount && orderSubtotal < Number(discount.minOrderAmount)) {
    throw new AppError(
      `This code requires a minimum spend of ₦${Number(discount.minOrderAmount).toLocaleString()}`,
      400
    );
  }

  let discountAmount = 0;
  if (discount.discountType === 'percentage') {
    discountAmount = Math.round((orderSubtotal * Number(discount.discountValue)) / 100);
  } else {
    discountAmount = Math.min(orderSubtotal, Number(discount.discountValue));
  }

  return res.json({
    success: true,
    data: {
      code: discount.code,
      discountType: discount.discountType,
      discountValue: discount.discountValue,
      discountAmount,
    },
  });
}

export async function listDiscounts(req: Request, res: Response) {
  return res.json({
    success: true,
    data: store.discounts,
  });
}

export async function createDiscount(req: Request, res: Response) {
  const { code, discountType, discountValue, minOrderAmount, usageLimit } = req.body;
  if (!code || !discountType || discountValue === undefined) {
    throw new AppError('Code, discountType, and discountValue are required', 400);
  }

  const existing = store.discounts.find((d) => d.code.toUpperCase() === code.trim().toUpperCase());
  if (existing) {
    throw new AppError('A discount code with this name already exists', 400);
  }

  const newDiscount = {
    id: `disc-${Date.now()}`,
    code: code.trim().toUpperCase(),
    discountType,
    discountValue: Number(discountValue),
    minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
    usageLimit: usageLimit ? Number(usageLimit) : null,
    usageCount: 0,
    isActive: true,
    createdAt: new Date(),
  };

  store.discounts.push(newDiscount);

  return res.status(201).json({
    success: true,
    data: newDiscount,
  });
}

export async function toggleDiscountStatus(req: Request, res: Response) {
  const { id } = req.params;
  const discount = store.discounts.find((d) => d.id === id);
  if (!discount) {
    throw new AppError('Discount not found', 404);
  }

  discount.isActive = !discount.isActive;

  return res.json({
    success: true,
    message: `Discount code ${discount.code} is now ${discount.isActive ? 'active' : 'inactive'}`,
    data: discount,
  });
}
