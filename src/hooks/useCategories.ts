import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/schema';
import { createCategory, updateCategory, deleteCategory } from '../db/repositories/categoryRepository';

export function useCategories() {
  const categories = useLiveQuery(() => db.categories.toArray(), []);

  const expenseCategories = categories?.filter((c) => c.type === 'expense') || [];
  const incomeCategories = categories?.filter((c) => c.type === 'income') || [];

  return {
    categories: categories || [],
    expenseCategories,
    incomeCategories,
    isLoading: !categories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
