import { TrendingUp, AlertCircle } from 'lucide-react';
import { Progress } from '~/components/ui/progress';

interface BudgetSummaryCardProps {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  month: string;
  year: number;
}

export function BudgetSummaryCard({
  totalBudget,
  totalSpent,
  remainingBudget,
  month,
  year,
}: BudgetSummaryCardProps) {
  const percentageSpent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const isOverBudget = totalSpent > totalBudget;
  const isWarning = percentageSpent > 75 && percentageSpent <= 100;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {month} {year}
          </h2>
          <p className="text-sm text-gray-500">Monthly Budget Overview</p>
        </div>
        <div className="p-3 bg-blue-100 rounded-lg">
          <TrendingUp className="w-6 h-6 text-blue-600" />
        </div>
      </div>

      {/* Budget Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Total Budget</p>
          <p className="text-2xl font-bold text-gray-900">
            ${totalBudget.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Spent</p>
          <p
            className={`text-2xl font-bold ${
              isOverBudget ? 'text-red-600' : 'text-gray-900'
            }`}
          >
            ${totalSpent.toFixed(2)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-600 mb-1">Remaining</p>
          <p
            className={`text-2xl font-bold ${
              isOverBudget
                ? 'text-red-600'
                : remainingBudget > 0
                  ? 'text-green-600'
                  : 'text-gray-900'
            }`}
          >
            ${remainingBudget.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">
            Budget Usage
          </span>
          <span className="text-sm font-medium text-gray-600">
            {Math.min(Math.round(percentageSpent), 100)}%
          </span>
        </div>
        <Progress value={Math.min(percentageSpent, 100)} className="h-2" />
      </div>

      {/* Alerts */}
      {totalBudget === 0 && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              Set Your Budget
            </p>
            <p className="text-sm text-blue-700">
              You haven't set any budget limits yet. Scroll down to set budget limits for your categories to get started.
            </p>
          </div>
        </div>
      )}

      {isOverBudget && totalBudget > 0 && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">
              Over Budget
            </p>
            <p className="text-sm text-red-700">
              You've exceeded your budget by ${(totalSpent - totalBudget).toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {isWarning && !isOverBudget && (
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-900">
              Caution
            </p>
            <p className="text-sm text-amber-700">
              You've spent over 75% of your budget
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
