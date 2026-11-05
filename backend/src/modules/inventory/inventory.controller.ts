import { Request, Response } from 'express';
import crypto from 'crypto';
import { stockAdjustmentSchema } from '../../shared/index.js';
import { store } from '../../database/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function getInventoryOverview(req: Request, res: Response) {
  const inventoryList = store.products.map((p) => {
    let stockStatus: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
    if (p.stockQuantity <= 0) {
      stockStatus = 'out_of_stock';
    } else if (p.stockQuantity <= p.lowStockThreshold) {
      stockStatus = 'low_stock';
    }

    const categoryObj = store.categories.find((c) => c.id === p.categoryId);

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      categoryName: categoryObj?.name || 'Unassigned',
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold,
      price: p.price,
      status: p.status,
      stockStatus,
    };
  });

  const lowStockCount = inventoryList.filter((i) => i.stockStatus === 'low_stock').length;
  const outOfStockCount = inventoryList.filter((i) => i.stockStatus === 'out_of_stock').length;

  return res.json({
    success: true,
    data: {
      stats: {
        totalSkus: inventoryList.length,
        lowStockCount,
        outOfStockCount,
      },
      items: inventoryList,
    },
  });
}

export async function getInventoryMovements(req: Request, res: Response) {
  const { productId } = req.query;

  let movements = [...store.inventoryMovements];
  if (productId) {
    movements = movements.filter((m) => m.productId === productId);
  }

  // Newest movements first
  movements.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return res.json({
    success: true,
    data: movements,
  });
}

export async function adjustStock(req: Request, res: Response) {
  const validated = stockAdjustmentSchema.parse(req.body);

  const product = store.products.find((p) => p.id === validated.productId);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const newStock = product.stockQuantity + validated.quantityChange;
  if (newStock < 0) {
    throw new AppError(
      `Cannot adjust stock below 0. Current stock is ${product.stockQuantity}, attempted change is ${validated.quantityChange}.`,
      400
    );
  }

  product.stockQuantity = newStock;
  product.updatedAt = new Date();
  await store.saveProduct(product);

  const movement = {
    id: crypto.randomUUID(),
    productId: product.id,
    productName: product.name,
    quantityChange: validated.quantityChange,
    movementType: 'manual_adjustment' as const,
    reason: validated.reason,
    referenceId: null,
    createdBy: req.user?.fullName || 'Admin',
    createdAt: new Date(),
  };

  await store.saveInventoryMovement(movement);

  await store.saveAuditLog({
    id: crypto.randomUUID(),
    actorId: req.user?.id || 'admin',
    actorName: req.user?.fullName || 'Admin',
    action: 'inventory_adjust',
    resourceType: 'product',
    resourceId: product.id,
    metadata: {
      sku: product.sku,
      previousStock: product.stockQuantity - validated.quantityChange,
      newStock,
      reason: validated.reason,
    },
    createdAt: new Date(),
  });

  return res.json({
    success: true,
    message: `Stock for ${product.name} adjusted by ${validated.quantityChange}. Current available: ${newStock}.`,
    data: {
      productId: product.id,
      stockQuantity: product.stockQuantity,
      movement,
    },
  });
}
