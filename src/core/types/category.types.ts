export type CategoryType = 'income' | 'expense';

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  type: CategoryType;
  icon: string;               // Nombre del icono de Lucide
  color: string;              // Color visual
  subcategories: Subcategory[];
  isSystemDefault: boolean;
  createdAt: string;
  updatedAt: string;
}
