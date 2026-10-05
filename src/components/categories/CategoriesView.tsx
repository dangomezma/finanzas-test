import React, { useState } from 'react';
import { Plus, Tags, Trash2, X, Check } from 'lucide-react';
import type { Category, CategoryType } from '../../core/types/category.types';
import { IconResolver } from '../common/IconResolver';

interface CategoriesViewProps {
  expenseCategories: Category[];
  incomeCategories: Category[];
  onCreateCategory: (cat: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
  onDeleteCategory: (id: string) => Promise<void>;
}

const CATEGORY_COLORS = [
  '#f97316', '#06b6d4', '#6366f1', '#ec4899', '#8b5cf6',
  '#10b981', '#3b82f6', '#eab308', '#ef4444', '#14b8a6',
];

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  expenseCategories,
  incomeCategories,
  onCreateCategory,
  onDeleteCategory,
}) => {
  const [activeTab, setActiveTab] = useState<CategoryType>('expense');
  const [isAdding, setIsAdding] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatColor, setNewCatColor] = useState(CATEGORY_COLORS[0]);
  const [subcatInput, setSubcatInput] = useState('');
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const currentList = activeTab === 'expense' ? expenseCategories : incomeCategories;

  const handleAddSubcat = () => {
    if (!subcatInput.trim()) return;
    setSubcategories([...subcategories, subcatInput.trim()]);
    setSubcatInput('');
  };

  const handleRemoveSubcat = (index: number) => {
    setSubcategories(subcategories.filter((_, i) => i !== index));
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      setError('Indica un nombre para la categoría.');
      return;
    }

    try {
      await onCreateCategory({
        name: newCatName.trim(),
        type: activeTab,
        color: newCatColor,
        icon: activeTab === 'expense' ? 'ShoppingBag' : 'TrendingUp',
        isSystemDefault: false,
        subcategories: subcategories.map((s, idx) => ({ id: `sub-${Date.now()}-${idx}`, name: s })),
      });

      setNewCatName('');
      setSubcategories([]);
      setIsAdding(false);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Error al crear la categoría.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
            Categorías y Subcategorías
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Personaliza cómo se clasifican tus ingresos y gastos para adaptarlos a tu presupuesto.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium px-4 py-2.5 rounded-xl shadow-sm text-sm cursor-pointer transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Selector de Pestaña: Gastos vs Ingresos */}
      <div className="flex space-x-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
        <button
          onClick={() => setActiveTab('expense')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-colors ${
            activeTab === 'expense'
              ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Categorías de Gastos ({expenseCategories.length})
        </button>
        <button
          onClick={() => setActiveTab('income')}
          className={`px-4 py-2 text-sm font-semibold rounded-xl cursor-pointer transition-colors ${
            activeTab === 'income'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
              : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
          }`}
        >
          Categorías de Ingresos ({incomeCategories.length})
        </button>
      </div>

      {/* Formulario desplegable para nueva categoría */}
      {isAdding && (
        <form
          onSubmit={handleSaveCategory}
          className="bg-white dark:bg-zinc-900 border border-emerald-500/50 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Crear Categoría de {activeTab === 'expense' ? 'Gasto' : 'Ingreso'}
            </h4>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && <p className="text-xs text-rose-600">{error}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Nombre
              </label>
              <input
                type="text"
                placeholder="Ej. Cuidado Personal, Mascota..."
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                Color
              </label>
              <div className="flex items-center space-x-2">
                {CATEGORY_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewCatColor(c)}
                    className={`w-6 h-6 rounded-full cursor-pointer transition-transform ${
                      newCatColor === c ? 'scale-125 ring-2 ring-zinc-900 dark:ring-white ring-offset-2' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Subcategorías */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Agregar Subcategorías (Opcional)
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Ej. Veterinaria, Alimento, Peluquería..."
                value={subcatInput}
                onChange={(e) => setSubcatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubcat();
                  }
                }}
                className="flex-1 px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
              />
              <button
                type="button"
                onClick={handleAddSubcat}
                className="px-4 py-2 bg-zinc-200 dark:bg-zinc-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Agregar
              </button>
            </div>

            {subcategories.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {subcategories.map((sub, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                  >
                    <span>{sub}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubcat(i)}
                      className="text-zinc-400 hover:text-rose-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 text-sm text-zinc-500 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-xl text-sm cursor-pointer"
            >
              Guardar Categoría
            </button>
          </div>
        </form>
      )}

      {/* Grid de Categorías Existentes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentList.map((cat) => (
          <div
            key={cat.id}
            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: cat.color }}
                  >
                    <IconResolver name={cat.icon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-base">
                      {cat.name}
                    </h4>
                    <span className="text-xs text-zinc-400">
                      {cat.subcategories.length} subcategorías
                    </span>
                  </div>
                </div>

                {!cat.isSystemDefault && (
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    title="Eliminar categoría"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Lista de subcategorías */}
              {cat.subcategories.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {cat.subcategories.map((sub) => (
                    <span
                      key={sub.id}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300"
                    >
                      {sub.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
