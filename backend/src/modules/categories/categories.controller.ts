import { Request, Response } from 'express';
import { store } from '../../database/index.js';
import { AppError } from '../../middleware/errorHandler.js';
import { INITIAL_CATEGORIES } from '../../database/seed-data.js';

export async function listCategories(req: Request, res: Response) {
  let categoriesToUse = store.categories;
  if (!categoriesToUse || categoriesToUse.length === 0) {
    categoriesToUse = INITIAL_CATEGORIES;
  }

  const activeCategories = categoriesToUse
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .map((c) => {
      const productCount = store.products.filter(
        (p) => (p.categoryId === c.id || p.categoryId === c.slug) && p.status === 'published'
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

  await store.saveCategory(newCategory);

  return res.status(201).json({
    success: true,
    data: newCategory,
  });
}
