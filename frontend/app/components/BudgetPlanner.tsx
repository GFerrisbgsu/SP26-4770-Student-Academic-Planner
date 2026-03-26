import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { useAuth } from '~/context/AuthContext';
import { Button } from '~/components/ui/button';
import { BudgetSummaryCard } from '~/components/BudgetSummaryCard';
import { SpendingChart } from '~/components/SpendingChart';
import { CategoryList } from '~/components/CategoryList';
import { AddCategoryModal } from '~/components/AddCategoryModal';
import { EditCategoryModal } from '~/components/EditCategoryModal';
import { TransactionTable } from '~/components/TransactionTable';
import { AddTransactionModal } from '~/components/AddTransactionModal';
import { AddRecurringIncomeModal } from '~/components/AddRecurringIncomeModal';
import { RecurringIncomeList } from '~/components/RecurringIncomeList';
import { BudgetLimitForm } from '~/components/BudgetLimitForm';
import * as budgetService from '~/services/budgetService';
import type { TransactionType, RecurringIncomeDTO } from '~/services/budgetService';

interface Category {
  id: number;
  name: string;
  color: string;
  isPredefined: boolean;
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

interface BudgetLimit {
  id: number;
  categoryId: number;
  categoryName: string;
  limitAmount: string;
}

interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
}

export function BudgetPlanner() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>([]);
  const [recurringIncomes, setRecurringIncomes] = useState<RecurringIncomeDTO[]>([]);
  const [summary, setSummary] = useState<BudgetSummary>({
    totalBudget: 0,
    totalSpent: 0,
    remainingBudget: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [showAddRecurringIncomeModal, setShowAddRecurringIncomeModal] = useState(false);
  const [editingRecurringIncome, setEditingRecurringIncome] = useState<RecurringIncomeDTO | undefined>();
  const [selectedRecurringIds, setSelectedRecurringIds] = useState<Set<number>>(new Set());
  const [transactionModalType, setTransactionModalType] = useState<TransactionType>('EXPENSE');
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  // Fetch data
  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const [categoriesData, transactionsData, limitsData, summaryData, recurringIncomesData] =
        await Promise.all([
          budgetService.getUserCategories(user.id),
          budgetService.getTransactionsByMonth(user.id, month, year),
          budgetService.getBudgetLimits(user.id, month, year),
          budgetService.getBudgetSummary(user.id, month, year),
          budgetService.getRecurringIncomes(user.id),
        ]);

      setCategories(categoriesData || []);
      setTransactions(transactionsData || []);
      setSummary(
        summaryData || {
          totalBudget: 0,
          totalSpent: 0,
          remainingBudget: 0,
        }
      );
      setRecurringIncomes(recurringIncomesData || []);

      // Auto-populate budget limits from the previous month if none exist for current month
      let finalLimits = limitsData || [];
      if (finalLimits.length === 0) {
        try {
          const copiedLimits = await budgetService.copyLimitsFromPreviousMonth(user.id, month, year);
          if (copiedLimits && copiedLimits.length > 0) {
            finalLimits = copiedLimits;
          }
        } catch (error) {
          console.debug('No budget limits to copy from previous month:', error);
          // Silently fail - user can manually set limits if auto-copy doesn't work
        }
      }
      
      setBudgetLimits(finalLimits);
    } catch (error) {
      console.error('Error loading budget data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, month, year]);

  // Handle add category
  const handleAddCategory = async (data: {
    name: string;
    color: string;
  }) => {
    if (!user) return;
    try {
      const newCategory = await budgetService.createCategory(user.id, data);
      setCategories([...categories, newCategory]);
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  };

  // Handle edit category
  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowEditCategoryModal(true);
  };

  // Handle update category
  const handleUpdateCategory = async (data: {
    name: string;
    color: string;
  }) => {
    if (!user || !editingCategory) return;
    try {
      const updated = await budgetService.updateCategory(user.id, editingCategory.id, data);
      setCategories(
        categories.map((c) => (c.id === editingCategory.id ? updated : c))
      );
      setShowEditCategoryModal(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  // Handle delete category
  const handleDeleteCategory = async (categoryId: number) => {
    if (!user) return;
    try {
      await budgetService.deleteCategory(user.id, categoryId);
      setCategories(categories.filter((c) => c.id !== categoryId));
      setShowEditCategoryModal(false);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  // Handle add transaction
  const handleAddTransaction = async (data: {
    categoryId: number | null;
    amount: string;
    description: string;
    transactionDate: string;
    type: TransactionType;
  }) => {
    if (!user) return;
    try {
      const newTransaction = await budgetService.createTransaction(
        user.id,
        data
      );
      setTransactions([newTransaction, ...transactions]);
      // Refresh summary
      const updatedSummary = await budgetService.getBudgetSummary(
        user.id,
        month,
        year
      );
      setSummary(updatedSummary);
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  };

  // Handle delete transaction
  const handleDeleteTransaction = async (transactionId: number) => {
    if (!user) return;
    try {
      await budgetService.deleteTransaction(user.id, transactionId);
      setTransactions(
        transactions.filter((t) => t.id !== transactionId)
      );
      // Refresh summary
      const updatedSummary = await budgetService.getBudgetSummary(
        user.id,
        month,
        year
      );
      setSummary(updatedSummary);
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // Handle set budget limit
  const handleSetBudgetLimit = async (data: {
    categoryId: number;
    limitAmount: string;
  }) => {
    if (!user) return;
    try {
      const newLimit = await budgetService.setBudgetLimit(
        user.id,
        month,
        year,
        data
      );
      // Replace or add the limit
      const existingIndex = budgetLimits.findIndex(
        (l) => l.categoryId === data.categoryId
      );
      if (existingIndex >= 0) {
        const updated = [...budgetLimits];
        updated[existingIndex] = newLimit;
        setBudgetLimits(updated);
      } else {
        setBudgetLimits([...budgetLimits, newLimit]);
      }
    } catch (error) {
      console.error('Error setting budget limit:', error);
      throw error;
    }
  };

  // Handle create recurring income
  const handleCreateRecurringIncome = async (data: {
    categoryId: number | null;
    amount: string;
    description: string;
    frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
    nextDate: string;
  }) => {
    if (!user) return;
    try {
      if (editingRecurringIncome) {
        // Update mode
        const updated = await budgetService.updateRecurringIncome(user.id, editingRecurringIncome.id, data);
        setRecurringIncomes(
          recurringIncomes.map((ri) => (ri.id === editingRecurringIncome.id ? updated : ri))
        );
        setEditingRecurringIncome(undefined);
      } else {
        // Create mode
        const newRecurringIncome = await budgetService.createRecurringIncome(user.id, data);
        setRecurringIncomes([...recurringIncomes, newRecurringIncome]);
        
        // If nextDate is today or in the past, the income is applied immediately.
        // Reload transactions to reflect the newly created transaction.
        const nextDate = new Date(data.nextDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (nextDate <= today) {
          const updatedTransactions = await budgetService.getTransactionsByMonth(user.id, month, year);
          setTransactions(updatedTransactions || []);
          const updatedSummary = await budgetService.getBudgetSummary(user.id, month, year);
          setSummary(
            updatedSummary || {
              totalBudget: 0,
              totalSpent: 0,
              remainingBudget: 0,
            }
          );
        }
      }
    } catch (error) {
      console.error('Error creating/updating recurring income:', error);
      throw error;
    }
  };

  // Handle edit recurring income
  const handleEditRecurringIncome = (income: RecurringIncomeDTO) => {
    setEditingRecurringIncome(income);
    setShowAddRecurringIncomeModal(true);
  };

  // Handle delete recurring income
  const handleDeleteRecurringIncome = async (id: number) => {
    if (!user) return;
    try {
      await budgetService.deleteRecurringIncome(user.id, id);
      setRecurringIncomes(recurringIncomes.filter((ri) => ri.id !== id));
    } catch (error) {
      console.error('Error deleting recurring income:', error);
    }
  };

  // Handle toggle recurring income (enable/disable)
  const handleToggleRecurringIncome = async (id: number, isActive: boolean) => {
    if (!user) return;
    try {
      if (isActive) {
        await budgetService.disableRecurringIncome(user.id, id);
      } else {
        await budgetService.enableRecurringIncome(user.id, id);
      }
      setRecurringIncomes(
        recurringIncomes.map((ri) =>
          ri.id === id ? { ...ri, isActive: !ri.isActive } : ri
        )
      );
    } catch (error) {
      console.error('Error toggling recurring income:', error);
    }
  };

  // Handle recurring income selection change
  const handleRecurringSelectionChange = (id: number, selected: boolean) => {
    const newSet = new Set(selectedRecurringIds);
    if (selected) {
      newSet.add(id);
    } else {
      newSet.delete(id);
    }
    setSelectedRecurringIds(newSet);
  };

  // Handle bulk delete recurring incomes
  const handleBulkDeleteRecurringIncomes = async () => {
    if (!user || selectedRecurringIds.size === 0) return;
    try {
      await budgetService.deleteBulkRecurringIncomes(
        user.id,
        Array.from(selectedRecurringIds)
      );
      setRecurringIncomes((ri) =>
        ri.filter((r) => !selectedRecurringIds.has(r.id))
      );
      setSelectedRecurringIds(new Set());
    } catch (error) {
      console.error('Error deleting bulk recurring incomes:', error);
    }
  };

  // Handle bulk disable recurring incomes
  const handleBulkDisableRecurringIncomes = async () => {
    if (!user || selectedRecurringIds.size === 0) return;
    try {
      await budgetService.disableBulkRecurringIncomes(
        user.id,
        Array.from(selectedRecurringIds)
      );
      setRecurringIncomes((ri) =>
        ri.map((r) =>
          selectedRecurringIds.has(r.id) ? { ...r, isActive: false } : r
        )
      );
      setSelectedRecurringIds(new Set());
    } catch (error) {
      console.error('Error disabling bulk recurring incomes:', error);
    }
  };

  // Handle bulk enable recurring incomes
  const handleBulkEnableRecurringIncomes = async () => {
    if (!user || selectedRecurringIds.size === 0) return;
    try {
      await budgetService.enableBulkRecurringIncomes(
        user.id,
        Array.from(selectedRecurringIds)
      );
      setRecurringIncomes((ri) =>
        ri.map((r) =>
          selectedRecurringIds.has(r.id) ? { ...r, isActive: true } : r
        )
      );
      setSelectedRecurringIds(new Set());
    } catch (error) {
      console.error('Error enabling bulk recurring incomes:', error);
    }
  };

  // Prepare chart data - only include expenses, not income
  const chartData = transactions
    .filter(tx => tx.type === 'EXPENSE')
    .reduce(
      (acc, transaction) => {
        const existing = acc.find((item) => item.name === transaction.categoryName);
        if (existing) {
          existing.value += parseFloat(transaction.amount);
        } else {
          acc.push({
            name: transaction.categoryName,
            value: parseFloat(transaction.amount),
            color: transaction.categoryColor,
          });
        }
        return acc;
      },
      [] as { name: string; value: number; color: string }[]
    );

  // Navigation handlers
  const handlePreviousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Please log in to access Budget Planner</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Budget Planner</h1>
          <p className="text-gray-600 mt-2">Track your spending and set budgets</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePreviousMonth}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-semibold text-gray-900 w-48">
              {monthName} {year}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { setTransactionModalType('EXPENSE'); setShowAddTransactionModal(true); }} disabled={isLoading}>
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {/* Summary */}
          <BudgetSummaryCard
            totalBudget={summary.totalBudget}
            totalSpent={summary.totalSpent}
            remainingBudget={summary.remainingBudget}
            month={monthName}
            year={year}
          />

          {/* Charts and Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart */}
            <div className="lg:col-span-2">
              <div className="space-y-4 mb-4">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={chartType === 'pie' ? 'default' : 'outline'}
                    onClick={() => setChartType('pie')}
                  >
                    Pie Chart
                  </Button>
                  <Button
                    size="sm"
                    variant={chartType === 'bar' ? 'default' : 'outline'}
                    onClick={() => setChartType('bar')}
                  >
                    Bar Chart
                  </Button>
                </div>
              </div>
              <SpendingChart data={chartData} chartType={chartType} />
            </div>

            {/* Categories Sidebar */}
            <div>
              <CategoryList
                categories={categories}
                onEdit={handleEditCategory}
                onDelete={(categoryId) => handleDeleteCategory(categoryId)}
                onAddNew={() => setShowAddCategoryModal(true)}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Budget Limits */}
          <BudgetLimitForm
            categories={categories}
            existingLimits={budgetLimits}
            onSubmit={handleSetBudgetLimit}
            isLoading={isLoading}
          />

          {/* Recurring Income */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recurring Income</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Set up automatic income deposits (paycheck, allowance, etc.)
                </p>
              </div>
              <Button
                onClick={() => setShowAddRecurringIncomeModal(true)}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Recurring Income
              </Button>
            </div>
            <RecurringIncomeList
              recurringIncomes={recurringIncomes}
              onEdit={handleEditRecurringIncome}
              onDelete={handleDeleteRecurringIncome}
              onToggle={handleToggleRecurringIncome}
              selectedIds={selectedRecurringIds}
              onSelectionChange={handleRecurringSelectionChange}
              onBulkDelete={handleBulkDeleteRecurringIncomes}
              onBulkDisable={handleBulkDisableRecurringIncomes}
              onBulkEnable={handleBulkEnableRecurringIncomes}
              isLoading={isLoading}
            />
          </div>

          {/* Transactions Table */}
          <TransactionTable
            transactions={transactions}
            onDelete={handleDeleteTransaction}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Modals */}
      <AddCategoryModal
        open={showAddCategoryModal}
        onOpenChange={setShowAddCategoryModal}
        onSubmit={handleAddCategory}
        isLoading={isLoading}
      />

      <EditCategoryModal
        open={showEditCategoryModal}
        onOpenChange={setShowEditCategoryModal}
        category={editingCategory}
        onSubmit={handleUpdateCategory}
        onDelete={handleDeleteCategory}
        isLoading={isLoading}
      />

      <AddTransactionModal
        open={showAddTransactionModal}
        onOpenChange={setShowAddTransactionModal}
        onSubmit={handleAddTransaction}
        categories={categories}
        isLoading={isLoading}
        defaultType={transactionModalType}
      />

      <AddRecurringIncomeModal
        open={showAddRecurringIncomeModal}
        onOpenChange={(open) => {
          setShowAddRecurringIncomeModal(open);
          if (!open) setEditingRecurringIncome(undefined);
        }}
        onSubmit={handleCreateRecurringIncome}
        categories={categories}
        initialData={editingRecurringIncome}
        isLoading={isLoading}
      />
    </div>
  );
}
