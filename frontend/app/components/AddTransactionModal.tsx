import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import type { TransactionType } from '~/services/budgetService';
import type { CategorySpending } from '~/types/budget';

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

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    categoryId: number | null;
    amount: string;
    description: string;
    transactionDate: string;
    type: TransactionType;
  }) => Promise<void>;
  categories: Category[];
  isLoading?: boolean;
  defaultType?: TransactionType;
  budgetLimits?: BudgetLimit[];
  categoryBreakdown?: CategorySpending[];
}

export function AddTransactionModal({
  open,
  onOpenChange,
  onSubmit,
  categories,
  isLoading,
  defaultType = 'EXPENSE',
  budgetLimits = [],
  categoryBreakdown = [],
}: AddTransactionModalProps) {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [type, setType] = useState<TransactionType>(defaultType);
  const [error, setError] = useState('');

  // Calculate budget warning
  const calculateBudgetWarning = () => {
    // Only show warnings for expenses
    if (type !== 'EXPENSE' || !categoryId || !amount) {
      return null;
    }

    const selectedCategoryId = parseInt(categoryId);
    const budgetLimit = budgetLimits.find((limit) => limit.categoryId === selectedCategoryId);

    if (!budgetLimit) {
      return null; // No budget limit set for this category
    }

    const limit = parseFloat(budgetLimit.limitAmount);
    const newAmount = parseFloat(amount);
    const categorySpending = categoryBreakdown.find((cat) => cat.categoryId === selectedCategoryId);
    const currentSpent = categorySpending
      ? parseFloat(categorySpending.spent.toString())
      : 0;
    const newTotal = currentSpent + newAmount;

    if (newTotal > limit) {
      return {
        exceedsBy: newTotal - limit,
        currentSpent,
        limit,
        categoryName: budgetLimit.categoryName,
      };
    }

    return null;
  };

  const budgetWarning = calculateBudgetWarning();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!transactionDate) {
      setError('Transaction date is required');
      return;
    }

    try {
      await onSubmit({
        categoryId: categoryId ? parseInt(categoryId) : null,
        amount,
        description: description.trim(),
        transactionDate,
        type,
      });

      // Reset form
      setCategoryId('');
      setAmount('');
      setDescription('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setType(defaultType);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create transaction');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCategoryId('');
      setAmount('');
      setDescription('');
      setTransactionDate(new Date().toISOString().split('T')[0]);
      setType(defaultType);
      setError('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{type === 'INCOME' ? 'Add Income' : 'Add Expense'}</DialogTitle>
          <DialogDescription>
            {type === 'INCOME' ? 'Record incoming money' : 'Record a spending transaction'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as TransactionType)} disabled={isLoading}>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXPENSE">Expense</SelectItem>
                <SelectItem value="INCOME">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category (Optional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
              <SelectTrigger id="category">
                <SelectValue placeholder="Select a category or leave blank for uncategorized" />
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
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {budgetWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900">
                  Budget Exceeded for {budgetWarning.categoryName}
                </p>
                <p className="text-amber-800 mt-1">
                  Current spending: ${budgetWarning.currentSpent.toFixed(2)} + ${parseFloat(amount).toFixed(2)} = ${(budgetWarning.currentSpent + parseFloat(amount)).toFixed(2)}
                </p>
                <p className="text-amber-800">
                  Budget limit: ${budgetWarning.limit.toFixed(2)} (exceeds by ${budgetWarning.exceedsBy.toFixed(2)})
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Weekly groceries"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={transactionDate}
              onChange={(e) => setTransactionDate(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Recording...' : 'Record Transaction'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
