import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '~/components/ui/dialog';
import { Button } from '~/components/ui/button';
import { type RecurringIncomeFrequency, type RecurringIncomeDTO } from '~/services/budgetService';

interface BudgetCategory {
  id: number;
  name: string;
  color: string;
}

interface AddRecurringIncomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: BudgetCategory[];
  onSubmit: (data: {
    categoryId: number | null;
    amount: string;
    description: string;
    frequency: RecurringIncomeFrequency;
    nextDate: string; // ISO 8601 format
  }) => Promise<void>;
  initialData?: RecurringIncomeDTO; // For edit mode
  isLoading?: boolean;
}

const FREQUENCY_OPTIONS: { value: RecurringIncomeFrequency; label: string }[] = [
  { value: 'WEEKLY', label: 'Weekly (Every 7 days)' },
  { value: 'BIWEEKLY', label: 'Bi-weekly (Every 14 days)' },
  { value: 'MONTHLY', label: 'Monthly (Same day each month)' },
];

export function AddRecurringIncomeModal({
  open,
  onOpenChange,
  categories,
  onSubmit,
  initialData,
  isLoading = false,
}: AddRecurringIncomeModalProps) {
  const [categoryId, setCategoryId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [frequency, setFrequency] = useState<RecurringIncomeFrequency>('WEEKLY');
  const [nextDate, setNextDate] = useState<string>('');
  const [error, setError] = useState<string>('');

  const isEditMode = !!initialData;
  const modalTitle = isEditMode ? 'Edit Recurring Income' : 'Set Up Recurring Income';
  const buttonText = isEditMode ? 'Update Recurring Income' : 'Create Recurring Income';

  // Set default next date to today or use initial data
  useEffect(() => {
    if (isEditMode && initialData) {
      setCategoryId(String(initialData.categoryId));
      setAmount(initialData.amount);
      setDescription(initialData.description);
      setFrequency(initialData.frequency);
      setNextDate(initialData.nextDate);
    } else {
      const today = new Date().toISOString().split('T')[0];
      setNextDate(today);
    }
  }, [open, isEditMode, initialData]);

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setCategoryId('');
      setAmount('');
      setDescription('');
      setFrequency('WEEKLY');
      setError('');
      const today = new Date().toISOString().split('T')[0];
      setNextDate(today);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation - category is now optional
    if (!amount || Number(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!description.trim()) {
      setError('Please enter a description');
      return;
    }
    if (!nextDate) {
      setError('Please select a start date');
      return;
    }

    try {
      await onSubmit({
        categoryId: categoryId ? Number(categoryId) : null,
        amount,
        description,
        frequency,
        nextDate,
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create recurring income');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Income Category (Optional)
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <option value="">No category (Uncategorized)</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Paycheck, Allowance, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Frequency *
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as RecurringIncomeFrequency)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {FREQUENCY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Next Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              First Payment Date *
            </label>
            <input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              The date when this recurring income will first be applied
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? `${isEditMode ? 'Updating' : 'Creating'}...` : buttonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
