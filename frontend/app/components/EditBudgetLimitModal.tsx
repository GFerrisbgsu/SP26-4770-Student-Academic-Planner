import { useState, useEffect } from 'react';
import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';

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

interface EditBudgetLimitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limit: BudgetLimit | null;
  categories: Category[];
  onSubmit: (data: { categoryId: number; limitAmount: string }) => Promise<void>;
  onDelete: () => Promise<void>;
  isLoading?: boolean;
}

export function EditBudgetLimitModal({
  open,
  onOpenChange,
  limit,
  categories,
  onSubmit,
  onDelete,
  isLoading,
}: EditBudgetLimitModalProps) {
  const [limitAmount, setLimitAmount] = useState('');
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Initialize form with limit data when modal opens
  useEffect(() => {
    if (limit && open) {
      setLimitAmount(limit.limitAmount);
      setError('');
      setIsDeleting(false);
    }
  }, [limit, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!limitAmount || parseFloat(limitAmount) <= 0) {
      setError('Limit amount must be greater than 0');
      return;
    }

    try {
      await onSubmit({
        categoryId: limit!.categoryId,
        limitAmount,
      });
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update budget limit');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete budget limit for ${limit?.categoryName}?`)) {
      return;
    }

    setError('');
    try {
      setIsDeleting(true);
      await onDelete();
      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete budget limit');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setLimitAmount('');
      setError('');
      setIsDeleting(false);
    }
    onOpenChange(newOpen);
  };

  const category = categories.find((c) => c.id === limit?.categoryId);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Budget Limit</DialogTitle>
          <DialogDescription>
            Update the budget limit for {limit?.categoryName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label>Category</Label>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {category && (
                <>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-gray-900">{category.name}</span>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit-amount-edit">Limit Amount ($)</Label>
            <Input
              id="limit-amount-edit"
              type="number"
              step="0.01"
              min="0"
              value={limitAmount}
              onChange={(e) => setLimitAmount(e.target.value)}
              placeholder="0.00"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={isLoading || !limitAmount}
            >
              {isLoading ? 'Updating...' : 'Update Limit'}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isLoading || isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
