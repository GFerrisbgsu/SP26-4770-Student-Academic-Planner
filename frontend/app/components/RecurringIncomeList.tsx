import { Trash2, Edit2, Pause, Play, Check } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { type RecurringIncomeDTO } from '~/services/budgetService';

interface RecurringIncomeListProps {
  recurringIncomes: RecurringIncomeDTO[];
  onEdit: (income: RecurringIncomeDTO) => void;
  onDelete: (id: number) => void;
  onToggle: (id: number, isActive: boolean) => void;
  selectedIds?: Set<number>;
  onSelectionChange?: (id: number, selected: boolean) => void;
  onBulkDelete?: () => void;
  onBulkDisable?: () => void;
  onBulkEnable?: () => void;
  isLoading?: boolean;
}

const FREQUENCY_LABELS: Record<string, string> = {
  WEEKLY: 'Weekly',
  BIWEEKLY: 'Bi-weekly',
  MONTHLY: 'Monthly',
};

export function RecurringIncomeList({
  recurringIncomes,
  onEdit,
  onDelete,
  onToggle,
  selectedIds = new Set(),
  onSelectionChange,
  onBulkDelete,
  onBulkDisable,
  onBulkEnable,
  isLoading = false,
}: RecurringIncomeListProps) {
  const hasSelection = selectedIds.size > 0;
  const hasInactive = Array.from(selectedIds).some(id => 
    recurringIncomes.find(ri => ri.id === id)?.isActive === false
  );
  const hasActive = Array.from(selectedIds).some(id => 
    recurringIncomes.find(ri => ri.id === id)?.isActive === true
  );
  if (recurringIncomes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No recurring income set up yet.</p>
        <p className="text-xs mt-1">Create one to automate your income tracking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk Actions Bar */}
      {hasSelection && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-900">
            {selectedIds.size} selected
          </span>
          <div className="flex gap-2">
            {hasInactive && (
              <Button
                size="sm"
                variant="outline"
                onClick={onBulkEnable}
                disabled={isLoading}
                className="text-green-600 hover:text-green-700"
              >
                <Play className="w-3 h-3 mr-1" />
                Resume
              </Button>
            )}
            {hasActive && (
              <Button
                size="sm"
                variant="outline"
                onClick={onBulkDisable}
                disabled={isLoading}
                className="text-yellow-600 hover:text-yellow-700"
              >
                <Pause className="w-3 h-3 mr-1" />
                Pause
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (confirm(`Delete ${selectedIds.size} recurring income(s)?`)) {
                  onBulkDelete?.();
                }
              }}
              disabled={isLoading}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="space-y-2">
        {recurringIncomes.map((income) => {
          const isSelected = selectedIds?.has(income.id);
          return (
            <div
              key={income.id}
              className={`p-3 border rounded-lg flex items-center justify-between transition ${
                isSelected
                  ? 'bg-blue-50 border-blue-300'
                  : income.isActive
                  ? 'bg-green-50 border-green-200'
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}
            >
              {/* Checkbox */}
              {onSelectionChange && (
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={(e) => onSelectionChange(income.id, e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 mr-3 flex-shrink-0"
                />
              )}

              {/* Income Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {income.categoryColor && (
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: income.categoryColor }}
                  title={income.categoryName || 'No category'}
                />
              )}
              {!income.categoryColor && (
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 bg-gray-300"
                  title="No category"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">
                  {income.description}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {income.categoryName || 'Uncategorized'} • {FREQUENCY_LABELS[income.frequency]}
                </p>
              </div>
            </div>
          </div>

          {/* Amount */}
          <div className="text-right mx-4 flex-shrink-0">
            <p className="font-semibold text-green-600">
              +${parseFloat(income.amount).toFixed(2)}
            </p>
            <p className="text-xs text-gray-600">
              {new Date(income.nextDate).toLocaleDateString()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Toggle Active/Pause Button */}
            <button
              onClick={() => onToggle(income.id, !income.isActive)}
              disabled={isLoading}
              className={`p-1.5 rounded transition ${
                income.isActive
                  ? 'hover:bg-yellow-100 text-yellow-600'
                  : 'hover:bg-green-100 text-green-600'
              } disabled:opacity-50`}
              title={income.isActive ? 'Pause' : 'Resume'}
            >
              {income.isActive ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Play className="w-4 h-4" />
              )}
            </button>

            {/* Edit Button */}
            <button
              onClick={() => onEdit(income)}
              disabled={isLoading}
              className="p-1.5 rounded hover:bg-blue-100 text-blue-600 transition disabled:opacity-50"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Delete Button */}
            <button
              onClick={() => {
                if (confirm('Are you sure you want to delete this recurring income?')) {
                  onDelete(income.id);
                }
              }}
              disabled={isLoading}
              className="p-1.5 rounded hover:bg-red-100 text-red-600 transition disabled:opacity-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
