/**
 * Budget-related TypeScript types
 * Mirrors backend DTOs for type safety
 */

export interface CategorySpending {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  budget: number | string;
  spent: number | string;
  remaining: number | string;
  transactionCount: number;
  percentageUsed: number;
}

export interface BudgetSummary {
  month: number;
  year: number;
  totalBudget: number | string;
  totalSpent: number | string;
  remainingBudget: number | string;
  categoryBreakdown?: CategorySpending[];
}
