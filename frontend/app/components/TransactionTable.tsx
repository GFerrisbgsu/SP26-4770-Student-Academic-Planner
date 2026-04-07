import { format, parseISO } from 'date-fns';
import { Trash2, Edit2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';

interface Transaction {
  id: number;
  categoryName: string;
  categoryColor: string;
  amount: string;
  description?: string;
  transactionDate: string;
  type: 'EXPENSE' | 'INCOME';
}

interface TransactionTableProps {
  transactions: Transaction[];
  onDelete?: (transactionId: number) => void;
  onEdit?: (transaction: Transaction) => void;
  isLoading?: boolean;
}

export function TransactionTable({
  transactions,
  onDelete,
  onEdit,
  isLoading,
}: TransactionTableProps) {
  // Sort transactions by date (most recent first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    const dateA = parseISO(a.transactionDate).getTime();
    const dateB = parseISO(b.transactionDate).getTime();
    return dateB - dateA;
  });

  // Separate expenses and income
  const expenses = sortedTransactions.filter(tx => tx.type === 'EXPENSE');
  const income = sortedTransactions.filter(tx => tx.type === 'INCOME');

  // Only count expenses for "Total Spent"
  const totalExpenses = expenses.reduce(
    (sum, tx) => sum + parseFloat(tx.amount),
    0
  );

  const totalIncome = income.reduce(
    (sum, tx) => sum + parseFloat(tx.amount),
    0
  );

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No transactions yet</p>
        <p className="text-sm text-gray-400">
          Add transactions to track your spending
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Transactions
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({transactions.length})
          </span>
        </h3>
      </div>

      {/* Income Section */}
      {income.length > 0 && (
        <div>
          <div className="px-6 py-3 bg-green-50 border-b border-green-200">
            <h4 className="text-sm font-semibold text-green-900">Income</h4>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-green-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {(onDelete || onEdit) && <TableHead className="w-16 text-center">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {income.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-green-50">
                    <TableCell className="font-medium">
                      {format(parseISO(transaction.transactionDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: transaction.categoryColor }}
                        />
                        {transaction.categoryName}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {transaction.description || '—'}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      +${parseFloat(transaction.amount).toFixed(2)}
                    </TableCell>
                    {(onDelete || onEdit) && (
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(transaction)}
                              className="p-1 text-gray-600 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors"
                              disabled={isLoading}
                              aria-label="Edit transaction"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this transaction?')) {
                                  onDelete(transaction.id);
                                }
                              }}
                              className="p-1 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                              disabled={isLoading}
                              aria-label="Delete transaction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Expenses Section */}
      {expenses.length > 0 && (
        <div>
          <div className="px-6 py-3 bg-red-50 border-b border-red-200">
            <h4 className="text-sm font-semibold text-red-900">Expenses</h4>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-red-50">
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  {(onDelete || onEdit) && <TableHead className="w-16 text-center">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-red-50">
                    <TableCell className="font-medium">
                      {format(parseISO(transaction.transactionDate), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: transaction.categoryColor }}
                        />
                        {transaction.categoryName}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {transaction.description || '—'}
                    </TableCell>
                    <TableCell className="text-right font-medium text-red-600">
                      -${parseFloat(transaction.amount).toFixed(2)}
                    </TableCell>
                    {(onDelete || onEdit) && (
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          {onEdit && (
                            <button
                              onClick={() => onEdit(transaction)}
                              className="p-1 text-gray-600 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors"
                              disabled={isLoading}
                              aria-label="Edit transaction"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {onDelete && (
                            <button
                              onClick={() => {
                                if (window.confirm('Delete this transaction?')) {
                                  onDelete(transaction.id);
                                }
                              }}
                              className="p-1 text-gray-600 hover:bg-red-100 hover:text-red-600 rounded transition-colors"
                              disabled={isLoading}
                              aria-label="Delete transaction"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          {income.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Income</p>
              <p className="text-2xl font-bold text-green-600">
                +${totalIncome.toFixed(2)}
              </p>
            </div>
          )}
          {expenses.length > 0 && (
            <>
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">
                  -${totalExpenses.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Average per Expense</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${(totalExpenses / expenses.length).toFixed(2)}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
