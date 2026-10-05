import { db } from '../schema';
import type { Category } from '../../core/types/category.types';
import { initializeDatabaseIfNeeded } from './accountRepository';

export async function getAllCategories(): Promise<Category[]> {
  await initializeDatabaseIfNeeded();
  return db.categories.toArray();
}

export async function createCategory(category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
  const newCat: Category = {
    ...category,
    id: `cat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await db.categories.add(newCat);
  return newCat;
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
  await db.categories.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  await db.categories.delete(id);
}
