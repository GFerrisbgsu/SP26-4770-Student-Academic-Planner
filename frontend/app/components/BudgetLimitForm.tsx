import { useState } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';

interface Category {
  id: number;
  name: string;
  color: string;
}

interface BudgetLimit {
  id: number;
  categoryId: number;
  categoryName: string;
  limitAmount: string;
}

interface BudgetLimitFormProps {
  categories: Category[];
  existingLimits: BudgetLimit[];
  onSubmit: (data: { categoryId: number; limitAmount: string }) => Promise<void>;
  onEdit: (limit: BudgetLimit) => void;
  onDelete: (limitId: number) => Promise<void>;
  isLoading?: boolean;
}

export function BudgetLimitForm({
  categories,
  existingLimits,
  onSubmit,
  onEdit,
  onDelete,
  isLoading,
}: BudgetLimitFormProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedCategoryId) {
      setError('Category is required');
      return;
    }

    if (!limitAmount || parseFloat(limitAmount) <= 0) {
      setError('Limit amount must be greater than 0');
      return;
    }

    try {
      await onSubmit({
        categoryId: parseInt(selectedCategoryId),
        limitAmount,
      });

      setSelectedCategoryId('');
      setLimitAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set budget limit');
    }
  };

  const selectedCategory = categories.find(
    (c) => String(c.id) === selectedCategoryId
  );
  const existingLimit = existingLimits.find(
    (l) => l.categoryId === parseInt(selectedCategoryId)
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Set Budget Limits
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="limit-category">Category</Label>
            <Select
              value={selectedCategoryId}
              onValueChange={setSelectedCategoryId}
              disabled={isLoading}
            >
              <SelectTrigger id="limit-category">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit-amount">Limit Amount ($)</Label>
            <Input
              id="limit-amount"
              type="number"
              step="0.01"
              min="0"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              placeholder="0.00"
              disabled={isLoading}
            />
          </div>

          <div className="flex items-end">
            <Button type="submit" disabled={isLoading || !selectedCategoryId} className="w-full">
              {isLoading ? 'Setting...' : 'Set Limit'}
            </Button>
          </div>
        </div>

        {selectedCategory && existingLimit && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-900">
              <strong>{selectedCategory.name}</strong> already has a limit of{' '}
              <strong>${parseFloat(existingLimit.limitAmount).toFixed(2)}</strong>.
              Setting a new limit will update it.
            </p>
          </div>
        )}
      </form>

      {/* Display existing limits */}
      {existingLimits.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3">Current Limits</h4>
          <div className="space-y-2">
            {existingLimits.map((limit) => {
              const category = categories.find((c) => c.id === limit.categoryId);
              return (
                <div
                  key={limit.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={
                        category
                          ? { backgroundColor: category.color }
                          : undefined
                      }
                    />
                    <span className="font-medium text-gray-900">
                      {limit.categoryName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      ${parseFloat(limit.limitAmount).toFixed(2)}
                    </span>
                    <button
                      onClick={() => onEdit(limit)}
                      className="p-1 hover:bg-white rounded-md transition-colors"
                      title="Edit limit"
                      aria-label={`Edit ${limit.categoryName} limit`}
                    >
                      <Edit2 className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
