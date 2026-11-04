import { Request, Response } from 'express';
import { store } from '../../database/index.js';
import { AppError } from '../../middleware/errorHandler.js';

export async function listCategories(req: Request, res: Response) {
  const activeCategories = store.categories
    .filter((c) => c.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((c) => {
      const productCount = store.products.filter(
        (p) => p.categoryId === c.id && p.status === 'published'
      ).length;
      return {
        ...c,
        productCount,
      };
    });

  return res.json({
    success: true,
    data: activeCategories,
  });
}

export async function getCategory(req: Request, res: Response) {
  const { slug } = req.params;
  const category = store.categories.find(
    (c) => c.slug.toLowerCase() === slug.toLowerCase() || c.id === slug
  );

  if (!category) {
    throw new AppError('Category not found', 404);
  }

  const productCount = store.products.filter(
    (p) => p.categoryId === category.id && p.status === 'published'
  ).length;

  return res.json({
    success: true,
    data: {
      ...category,
      productCount,
    },
  });
}

export async function createCategory(req: Request, res: Response) {
  const { name, slug, description, imageUrl, displayOrder } = req.body;
  if (!name || !slug || !description) {
    throw new AppError('Name, slug, and description are required for category creation', 400);
  }

  const existing = store.categories.find((c) => c.slug.toLowerCase() === slug.toLowerCase());
  if (existing) {
    throw new AppError('A category with this slug already exists', 400);
  }

  const newCategory = {
    id: `cat-${Date.now()}`,
    name,
    slug,
    description,
    imageUrl: imageUrl || '',
    isActive: true,
    displayOrder: displayOrder || store.categories.length + 1,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  store.categories.push(newCategory);

  return res.status(201).json({
    success: true,
    data: newCategory,
  });
}
