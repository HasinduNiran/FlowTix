'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Expense {
  id: string;
  type: string;
  description: string;
  amount: number;
  date: string;
  category: 'fuel' | 'maintenance' | 'insurance' | 'permit' | 'other';
  busId: string;
  submittedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  receiptUrl?: string;
}

export default function ManagerExpensesPage() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('month');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'fuel' | 'maintenance' | 'insurance' | 'permit' | 'other'>('all');

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        // In real implementation, fetch only expenses for the assigned bus
        setTimeout(() => {
          const mockExpenses: Expense[] = [
            {
              id: 'EXP001',
              type: 'Fuel',
              description: 'Diesel fuel for daily operations',
              amount: 15000,
              date: '2025-01-26',
              category: 'fuel',
              busId: 'B001',
              submittedBy: 'John Silva',
              status: 'pending'
            },
            {
              id: 'EXP002',
              type: 'Oil Change',
              description: 'Engine oil and filter replacement',
              amount: 8500,
              date: '2025-01-25',
              category: 'maintenance',
              busId: 'B001',
              submittedBy: 'John Silva',
              status: 'approved'
            },
            {
              id: 'EXP003',
              type: 'Tire Repair',
              description: 'Front tire puncture repair',
              amount: 2500,
              date: '2025-01-24',
              category: 'maintenance',
              busId: 'B001',
              submittedBy: 'John Silva',
              status: 'approved'
            },
            {
              id: 'EXP004',
              type: 'Insurance Premium',
              description: 'Monthly insurance payment',
              amount: 12000,
              date: '2025-01-20',
              category: 'insurance',
              busId: 'B001',
              submittedBy: 'Manager System',
              status: 'approved'
            },
            {
              id: 'EXP005',
              type: 'Cleaning Supplies',
              description: 'Bus cleaning materials and supplies',
              amount: 3500,
              date: '2025-01-22',
              category: 'other',
              busId: 'B001',
              submittedBy: 'John Silva',
              status: 'approved'
            }
          ];
          setExpenses(mockExpenses);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching expenses:', error);
        setError('Failed to load expenses data');
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [filter, categoryFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fuel':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'insurance':
        return 'bg-purple-100 text-purple-800';
      case 'permit':
        return 'bg-green-100 text-green-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'fuel':
        return '⛽';
      case 'maintenance':
        return '🔧';
      case 'insurance':
        return '🛡️';
      case 'permit':
        return '📋';
      case 'other':
        return '📦';
      default:
        return '💰';
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    if (categoryFilter !== 'all' && expense.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  const handleApproveExpense = async (expenseId: string) => {
    try {
      setExpenses(expenses.map(expense => 
        expense.id === expenseId 
          ? { ...expense, status: 'approved' as const }
          : expense
      ));
    } catch (error) {
      console.error('Error approving expense:', error);
    }
  };

  const handleRejectExpense = async (expenseId: string) => {
    try {
      const reason = prompt('Please enter rejection reason:');
      if (reason) {
        setExpenses(expenses.map(expense => 
          expense.id === expenseId 
            ? { ...expense, status: 'rejected' as const }
            : expense
        ));
      }
    } catch (error) {
      console.error('Error rejecting expense:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Bus Expenses</h1>
            <p className="text-gray-600">
              Monitor and approve expenses for your assigned bus.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="fuel">Fuel</option>
              <option value="maintenance">Maintenance</option>
              <option value="insurance">Insurance</option>
              <option value="permit">Permit</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
              <p className="text-2xl font-semibold text-gray-900">
                LKR {filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Approved</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredExpenses.filter(e => e.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredExpenses.filter(e => e.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <span className="text-2xl">⛽</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Fuel Costs</h3>
              <p className="text-2xl font-semibold text-gray-900">
                LKR {filteredExpenses.filter(e => e.category === 'fuel').reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Expense Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expense ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{expense.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{expense.type}</div>
                    <div className="text-sm text-gray-500">{expense.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                      <span className="mr-1">{getCategoryIcon(expense.category)}</span>
                      {expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    LKR {expense.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.submittedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expense.status)}`}>
                      {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        View Receipt
                      </button>
                      {expense.status === 'pending' && (
                        <>
                          <button 
                            onClick={() => handleApproveExpense(expense.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectExpense(expense.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredExpenses.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">💰</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses found</h3>
            <p className="text-gray-500">No expenses match your current filter criteria.</p>
          </div>
        )}
      </div>

      {/* Manager Access Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-xl mr-3">ℹ️</span>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Manager Access</h3>
            <p className="text-sm text-amber-700">
              You can only view and approve expenses for your assigned bus. All expense data shown is specific to your bus operations only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
