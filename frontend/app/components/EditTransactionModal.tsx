import { useState, useEffect } from 'react';
import { parseISO, format } from 'date-fns';
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

interface Transaction {
  id: number;
  categoryName: string;
  categoryColor: string;
  amount: string;
  description?: string;
  transactionDate: string;
  type: TransactionType;
}

interface EditTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: Transaction | null;
  onSubmit: (data: {
    categoryId: number | null;
    amount: string;
    description: string;
    transactionDate: string;
    type: TransactionType;
  }) => Promise<void>;
  categories: Category[];
  isLoading?: boolean;
  budgetLimits?: BudgetLimit[];
  categoryBreakdown?: CategorySpending[];
}

export function EditTransactionModal({
  open,
  onOpenChange,
  transaction,
  onSubmit,
  categories,
  isLoading,
  budgetLimits = [],
  categoryBreakdown = [],
}: EditTransactionModalProps) {
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [error, setError] = useState('');

  // Initialize form with transaction data when modal opens
  useEffect(() => {
    if (transaction && open) {
      setCategoryId(''); // Will be set from category lookup
      setAmount(transaction.amount);
      setDescription(transaction.description || '');
      // Format date as YYYY-MM-DD for date input
      setTransactionDate(format(parseISO(transaction.transactionDate), 'yyyy-MM-dd'));

      // Find category ID by matching category name
      const category = categories.find(cat => cat.name === transaction.categoryName);
      if (category) {
        setCategoryId(String(category.id));
      }
    }
  }, [transaction, open, categories]);

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
        type: transaction?.type || 'EXPENSE',
      });

      handleOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update transaction');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setCategoryId('');
      setAmount('');
      setDescription('');
      setTransactionDate('');
      setError('');
    }
    onOpenChange(newOpen);
  };

  // Calculate budget warning (only for expenses)
  const calculateBudgetWarning = () => {
    if (transaction?.type !== 'EXPENSE' || !categoryId || !amount) {
      return null;
    }

    const selectedCategoryId = parseInt(categoryId);
    const budgetLimit = budgetLimits.find((limit) => limit.categoryId === selectedCategoryId);

    if (!budgetLimit) {
      return null;
    }

    const limit = parseFloat(budgetLimit.limitAmount);
    const newAmount = parseFloat(amount);
    const categorySpending = categoryBreakdown.find((cat) => cat.categoryId === selectedCategoryId);
    const originalAmount = parseFloat(transaction?.amount || '0');
    
    // Calculate current spent excluding this transaction (since we're editing it)
    const currentSpent = categorySpending
      ? parseFloat(categorySpending.spent.toString()) - originalAmount
      : 0;
    
    const newTotal = currentSpent + newAmount;

    if (newTotal > limit) {
      return {
        exceedsBy: newTotal - limit,
        currentSpent: currentSpent + newAmount, // Show new total
        limit,
        categoryName: budgetLimit.categoryName,
      };
    }

    return null;
  };

  const budgetWarning = calculateBudgetWarning();

  if (!transaction) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit {transaction.type === 'INCOME' ? 'Income' : 'Expense'}</DialogTitle>
          <DialogDescription>
            Update the details of this transaction
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-category">Category (Optional)</Label>
            <Select value={categoryId} onValueChange={setCategoryId} disabled={isLoading}>
              <SelectTrigger id="edit-category">
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
            <Label htmlFor="edit-amount">Amount ($)</Label>
            <Input
              id="edit-amount"
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
                  New total: ${budgetWarning.currentSpent.toFixed(2)}
                </p>
                <p className="text-amber-800">
                  Budget limit: ${budgetWarning.limit.toFixed(2)} (exceeds by ${budgetWarning.exceedsBy.toFixed(2)})
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="edit-description">Description (Optional)</Label>
            <Input
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Weekly groceries"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-date">Date</Label>
            <Input
              id="edit-date"
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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
