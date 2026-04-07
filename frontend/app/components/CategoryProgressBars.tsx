import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { Progress } from '~/components/ui/progress';
import type { CategorySpending } from '~/types/budget';

interface CategoryProgressBarsProps {
  categories: CategorySpending[];
  isLoading?: boolean;
}

export function CategoryProgressBars({
  categories,
  isLoading,
}: CategoryProgressBarsProps) {
  // Filter to only show categories with budget limits set
  const categoriesWithBudgets = categories.filter(
    (cat) => {
      const budget = typeof cat.budget === 'string' 
        ? parseFloat(cat.budget) 
        : cat.budget;
      return budget > 0;
    }
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Category Spending Progress
        </h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2 w-1/3" />
              <div className="h-2 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (categoriesWithBudgets.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Category Spending Progress
        </h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-900">
              No budget limits set yet
            </p>
            <p className="text-sm text-blue-700">
              Set budget limits for your categories above to see spending progress.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Category Spending Progress
      </h3>

      <div className="space-y-6">
        {categoriesWithBudgets.map((category) => {
          const budget = typeof category.budget === 'string' 
            ? parseFloat(category.budget) 
            : category.budget;
          const spent = typeof category.spent === 'string' 
            ? parseFloat(category.spent) 
            : category.spent;
          const percentageUsed = category.percentageUsed || 0;
          const isOverBudget = spent > budget;
          const isWarning = percentageUsed > 75 && percentageUsed <= 100;
          const isHealthy = percentageUsed <= 75;

          return (
            <div key={category.categoryId} className="space-y-3">
              {/* Category header with name and stats */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: category.categoryColor }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {category.categoryName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {category.transactionCount} transaction{category.transactionCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {/* Status indicator */}
                <div className="flex items-center gap-2">
                  {isHealthy && (
                    <TrendingDown className="w-4 h-4 text-green-600" />
                  )}
                  {isWarning && (
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                  )}
                  {isOverBudget && (
                    <TrendingUp className="w-4 h-4 text-red-600" />
                  )}
                  <span
                    className={`text-sm font-semibold ${
                      isOverBudget
                        ? 'text-red-600'
                        : isWarning
                          ? 'text-amber-600'
                          : 'text-gray-900'
                    }`}
                  >
                    {Math.min(Math.round(percentageUsed), 100)}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="relative">
                <Progress
                  value={Math.min(percentageUsed, 100)}
                  className="h-2"
                />
              </div>

              {/* Amount details */}
              <div className="flex justify-between text-sm">
                <div className="space-y-1">
                  <p className="text-gray-600">
                    Spent: <span className="font-medium text-gray-900">${spent.toFixed(2)}</span>
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="text-gray-600">
                    Budget: <span className="font-medium text-gray-900">${budget.toFixed(2)}</span>
                  </p>
                </div>
              </div>

              {/* Remaining amount */}
              <div className="flex justify-between gap-2 pt-1">
                <span className="text-xs text-gray-600">Remaining:</span>
                <span
                  className={`text-sm font-semibold ${
                    isOverBudget
                      ? 'text-red-600'
                      : isHealthy
                        ? 'text-green-600'
                        : 'text-amber-600'
                  }`}
                >
                  {isOverBudget ? '-' : ''}${Math.abs(budget - spent).toFixed(2)}
                </span>
              </div>

              {/* Alerts */}
              {isOverBudget && (
                <div className="bg-red-50 border border-red-200 rounded p-2 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700">
                    Over budget by ${(spent - budget).toFixed(2)}
                  </p>
                </div>
              )}

              {isWarning && !isOverBudget && (
                <div className="bg-amber-50 border border-amber-200 rounded p-2 flex gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    ${(budget - spent).toFixed(2)} remaining ({Math.round(100 - percentageUsed)}%)
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
