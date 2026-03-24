import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart as PieChartIcon, Trash2, Edit2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
// ...existing code...

interface Transaction {
  id: string;
  category: string;
  amount: number;
  description: string;
  date: Date;
  type: 'income' | 'expense';
}

interface BudgetCategory {
  name: string;
  budgeted: number;
  spent: number;
  color: string;
}

const EXPENSE_CATEGORIES = [
  { name: 'Tuition & School', color: '#3B82F6' },
  { name: 'Housing & Rent', color: '#10B981' },
  { name: 'Food & Groceries', color: '#F59E0B' },
  { name: 'Transportation', color: '#EF4444' },
  { name: 'Books & Supplies', color: '#8B5CF6' },
  { name: 'Entertainment', color: '#EC4899' },
  { name: 'Personal & Other', color: '#6B7280' },
];

export function BudgetPlanner() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      category: 'Food & Groceries',
      amount: 45.50,
      description: 'Grocery shopping',
      date: new Date(2026, 0, 20),
      type: 'expense'
    },
    {
      id: '2',
      category: 'Transportation',
      amount: 60.00,
      description: 'Monthly bus pass',
      date: new Date(2026, 0, 15),
      type: 'expense'
    },
    {
      id: '3',
      category: 'Income',
      amount: 800.00,
      description: 'Part-time job',
      date: new Date(2026, 0, 1),
      type: 'income'
    },
    {
      id: '4',
      category: 'Entertainment',
      amount: 25.00,
      description: 'Movie tickets',
      date: new Date(2026, 0, 18),
      type: 'expense'
    },
    {
      id: '5',
      category: 'Books & Supplies',
      amount: 120.00,
      description: 'Textbooks',
      date: new Date(2026, 0, 10),
      type: 'expense'
    },
  ]);

  const [budgets, setBudgets] = useState<Record<string, number>>({
    'Tuition & School': 0,
    'Housing & Rent': 800,
    'Food & Groceries': 300,
    'Transportation': 100,
    'Books & Supplies': 200,
    'Entertainment': 150,
    'Personal & Other': 100,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);

  // Calculate totals
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  // Calculate spending by category
  const spendingByCategory = EXPENSE_CATEGORIES.map(cat => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category === cat.name)
      .reduce((sum, t) => sum + t.amount, 0);
    
    return {
      name: cat.name,
      budgeted: budgets[cat.name] || 0,
      spent: spent,
      color: cat.color,
      remaining: (budgets[cat.name] || 0) - spent
    };
  });

  // Prepare pie chart data
  const pieChartData = spendingByCategory
    .filter(cat => cat.spent > 0)
    .map(cat => ({
      name: cat.name,
      value: cat.spent,
      color: cat.color
    }));

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleUpdateBudget = (category: string, amount: number) => {
    setBudgets(prev => ({ ...prev, [category]: amount }));
    setEditingBudget(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Side Navigation Bar */}
      {/* Side Navigation Bar handled by root layout */}

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Planner</h1>
            <p className="text-gray-600">Track your income, expenses, and stay on budget</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Income</span>
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Total Expenses</span>
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-red-600">${totalExpenses.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Balance</span>
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              ${balance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Charts and Budget Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Spending Breakdown Chart */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5" />
              Spending Breakdown
            </h2>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-gray-400">
                No expenses yet
              </div>
            )}
          </div>

          {/* Budget vs Actual Chart */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget vs Actual</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={spendingByCategory.filter(c => c.budgeted > 0)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                <Legend />
                <Bar dataKey="budgeted" fill="#93C5FD" name="Budgeted" />
                <Bar dataKey="spent" fill="#3B82F6" name="Spent" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Categories */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Categories</h2>
          <div className="space-y-4">
            {spendingByCategory.map(category => {
              const percentUsed = category.budgeted > 0 
                ? (category.spent / category.budgeted) * 100 
                : 0;
              const isOverBudget = category.spent > category.budgeted && category.budgeted > 0;

              return (
                <div key={category.name} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }}></div>
                      <span className="font-medium text-gray-900">{category.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-sm ${isOverBudget ? 'text-red-600' : 'text-gray-600'}`}>
                        ${category.spent.toFixed(2)} / ${category.budgeted.toFixed(2)}
                      </span>
                      {editingBudget === category.name ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            defaultValue={category.budgeted}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleUpdateBudget(category.name, parseFloat(e.currentTarget.value));
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingBudget(null)}
                            className="text-xs text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingBudget(category.name)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isOverBudget ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(percentUsed, 100)}%` }}
                    ></div>
                  </div>
                  {category.budgeted > 0 && (
                    <p className={`text-xs mt-1 ${isOverBudget ? 'text-red-600' : 'text-gray-500'}`}>
                      {isOverBudget 
                        ? `Over budget by $${(category.spent - category.budgeted).toFixed(2)}`
                        : `$${category.remaining.toFixed(2)} remaining`
                      }
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>

          <div className="space-y-2">
            {transactions
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {transaction.type === 'income' ? (
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.description}</p>
                      <p className="text-sm text-gray-500">
                        {transaction.category} • {transaction.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </span>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onAdd={(transaction) => {
            setTransactions(prev => [...prev, { ...transaction, id: `custom-${Date.now()}` }]);
            setShowAddModal(false);
          }}
          categories={EXPENSE_CATEGORIES}
        />
      )}
    </div>
  );
}

interface AddTransactionModalProps {
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  categories: { name: string; color: string }[];
}

function AddTransactionModal({ onClose, onAdd, categories }: AddTransactionModalProps) {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState(categories[0].name);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !description) {
      alert('Please fill in all fields');
      return;
    }

    onAdd({
      type,
      category: type === 'income' ? 'Income' : category,
      amount: parseFloat(amount),
      description,
      date: new Date(date)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Add Transaction</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                  type === 'expense'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                Expense
              </button>
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all ${
                  type === 'income'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                Income
              </button>
            </div>
          </div>

          {type === 'expense' && (
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(cat => (
                  <option key={cat.name} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <input
              type="number"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              step="0.01"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <input
              type="text"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="What was this for?"
              required
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
