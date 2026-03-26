import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';

interface Category {
  id: number;
  name: string;
  color: string;
  isPredefined: boolean;
}

interface CategoryListProps {
  categories: Category[];
  onEdit?: (category: Category) => void;
  onDelete?: (categoryId: number) => void;
  onAddNew: () => void;
  isLoading?: boolean;
}

export function CategoryList({
  categories,
  onEdit,
  onDelete,
  onAddNew,
  isLoading,
}: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500 mb-4">No categories yet</p>
        <Button onClick={onAddNew} disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Create Category
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Categories</h3>
        <Button size="sm" onClick={onAddNew} disabled={isLoading}>
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      <div className="divide-y divide-gray-200">
        {categories.map((category) => (
          <div
            key={category.id}
            className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: category.color }}
              />
              <div>
                <p className="font-medium text-gray-900">{category.name}</p>
                {category.isPredefined && (
                  <p className="text-xs text-gray-500">Predefined</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(category)}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  disabled={isLoading}
                  aria-label={`Edit ${category.name}`}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(category.id)}
                  className="p-2 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                  disabled={isLoading}
                  aria-label={`Delete ${category.name}`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
