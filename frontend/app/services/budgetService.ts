import { apiFetch } from '~/services/apiClient';

// ==================== HELPER FUNCTIONS ====================

/**
 * Parse error response from backend and extract meaningful error message
 */
async function parseErrorResponse(response: Response, defaultMessage: string): Promise<string> {
  try {
    const errorData = await response.json();
    return errorData.message || errorData.error || defaultMessage;
  } catch {
    // Response wasn't JSON or couldn't be parsed
    return defaultMessage;
  }
}

// ==================== TYPES ====================

export type TransactionType = 'EXPENSE' | 'INCOME';

// ==================== CATEGORIES ====================

export async function getUserCategories(userId: number) {
  const res = await apiFetch(`/budget/categories`);
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function createCategory(userId: number, data: {
  name: string;
  color: string;
}) {
  const res = await apiFetch(`/budget/categories`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create category");
  return res.json();
}

export async function updateCategory(userId: number, categoryId: number, data: {
  name: string;
  color: string;
}) {
  const res = await apiFetch(`/budget/categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update category");
  return res.json();
}

export async function deleteCategory(userId: number, categoryId: number) {
  const res = await apiFetch(`/budget/categories/${categoryId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete category");
  
  // 204 No Content has no response body, so don't try to parse JSON
  if (res.status === 204) {
    return null;
  }
  
  return res.json();
}

// ==================== TRANSACTIONS ====================

export async function getTransactionsByMonth(userId: number, month: number, year: number) {
  const res = await apiFetch(`/budget/transactions?month=${month}&year=${year}`);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function createTransaction(userId: number, data: {
  categoryId: number | null;
  amount: string;
  description?: string;
  transactionDate: string;
  type: TransactionType;
}) {
  const res = await apiFetch(`/budget/transactions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorMessage = await parseErrorResponse(res, "Failed to create transaction");
    throw new Error(errorMessage);
  }
  
  return res.json();
}

export async function updateTransaction(userId: number, transactionId: number, data: {
  categoryId: number | null;
  amount: string;
  description?: string;
  transactionDate: string;
  type: TransactionType;
}) {
  const res = await apiFetch(`/budget/transactions/${transactionId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const errorMessage = await parseErrorResponse(res, "Failed to update transaction");
    throw new Error(errorMessage);
  }
  
  return res.json();
}

export async function deleteTransaction(userId: number, transactionId: number) {
  const res = await apiFetch(`/budget/transactions/${transactionId}`, {
    method: "DELETE",
  });
  
  if (!res.ok) {
    const errorMessage = await parseErrorResponse(res, "Failed to delete transaction");
    throw new Error(errorMessage);
  }
  
  // 204 No Content has no response body, so don't try to parse JSON
  if (res.status === 204) {
    return null;
  }
  
  return res.json();
}

// ==================== BUDGET LIMITS ====================

export async function getBudgetLimits(userId: number, month: number, year: number) {
  const res = await apiFetch(`/budget/limits?month=${month}&year=${year}`);
  if (!res.ok) throw new Error("Failed to fetch budget limits");
  return res.json();
}

export async function setBudgetLimit(userId: number, month: number, year: number, data: {
  categoryId: number;
  limitAmount: string;
}) {
  const res = await apiFetch(`/budget/limits?month=${month}&year=${year}`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to set budget limit");
  return res.json();
}

export async function deleteBudgetLimit(userId: number, limitId: number) {
  const res = await apiFetch(`/budget/limits/${limitId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete budget limit");
  
  // 204 No Content has no response body, so don't try to parse JSON
  if (res.status === 204) {
    return null;
  }
  
  return res.json();
}

export async function copyLimitsFromPreviousMonth(userId: number, month: number, year: number) {
  const res = await apiFetch(`/budget/limits/copy-from-previous?month=${month}&year=${year}`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to copy budget limits from previous month");
  return res.json();
}


// ==================== BUDGET SUMMARY ====================

export async function getBudgetSummary(userId: number, month: number, year: number) {
  const res = await apiFetch(`/budget/summary?month=${month}&year=${year}`);
  if (!res.ok) throw new Error("Failed to fetch budget summary");
  return res.json();
}

// ==================== RECURRING INCOME ====================

export type RecurringIncomeFrequency = 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';

export interface RecurringIncomeDTO {
  id: number;
  categoryId: number | null;
  categoryName: string | null;
  categoryColor: string | null;
  amount: string;
  description: string;
  frequency: RecurringIncomeFrequency;
  nextDate: string; // ISO 8601 date string
  isActive: boolean;
  created_at: string;
  updated_at: string;
}

export async function getRecurringIncomes(userId: number) {
  const res = await apiFetch(`/budget/recurring-income`);
  if (!res.ok) throw new Error("Failed to fetch recurring incomes");
  return res.json();
}

export async function createRecurringIncome(userId: number, data: {
  categoryId: number | null;
  amount: string;
  description: string;
  frequency: RecurringIncomeFrequency;
  nextDate: string; // ISO 8601 date string
}) {
  const res = await apiFetch(`/budget/recurring-income`, {
    method: "POST",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create recurring income");
  return res.json();
}

export async function updateRecurringIncome(userId: number, id: number, data: {
  categoryId: number | null;
  amount: string;
  description: string;
  frequency: RecurringIncomeFrequency;
  nextDate: string; // ISO 8601 date string
}) {
  const res = await apiFetch(`/budget/recurring-income/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update recurring income");
  return res.json();
}

export async function deleteRecurringIncome(userId: number, id: number) {
  const res = await apiFetch(`/budget/recurring-income/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete recurring income");
}

export async function disableRecurringIncome(userId: number, id: number) {
  const res = await apiFetch(`/budget/recurring-income/${id}/disable`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to disable recurring income");
}

export async function enableRecurringIncome(userId: number, id: number) {
  const res = await apiFetch(`/budget/recurring-income/${id}/enable`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to enable recurring income");
}

// ==================== BULK RECURRING INCOME OPERATIONS ====================

export async function disableBulkRecurringIncomes(userId: number, ids: number[]) {
  const res = await apiFetch(`/budget/recurring-income/bulk/disable`, {
    method: "POST",
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error("Failed to disable recurring incomes");
}

export async function enableBulkRecurringIncomes(userId: number, ids: number[]) {
  const res = await apiFetch(`/budget/recurring-income/bulk/enable`, {
    method: "POST",
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error("Failed to enable recurring incomes");
}

export async function deleteBulkRecurringIncomes(userId: number, ids: number[]) {
  const res = await apiFetch(`/budget/recurring-income/bulk/delete`, {
    method: "POST",
    body: JSON.stringify(ids),
  });
  if (!res.ok) throw new Error("Failed to delete recurring incomes");
}

// ==================== TRANSACTION HISTORY ====================

export async function getRecurringIncomeTransactionHistory(userId: number, recurringIncomeId: number) {
  const res = await apiFetch(`/budget/recurring-income/${recurringIncomeId}/history`);
  if (!res.ok) throw new Error("Failed to fetch transaction history");
  return res.json();
}
