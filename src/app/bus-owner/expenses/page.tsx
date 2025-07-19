'use client';

import React, { useState, useEffect } from 'react';
import { ExpenseTransactionService, ExpenseTypeService } from '@/services/expense.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';

// Simple interfaces for the components we need
interface ExpenseTransaction {
  _id: string;
  amount: number;
  date: string;
  description: string;
  expenseType: {
    name: string;
  };
}

interface ExpenseType {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

export default function BusOwnerExpensesPage() {
  const [transactions, setTransactions] = useState<ExpenseTransaction[]>([]);
  const [types, setTypes] = useState<ExpenseType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('transactions');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [transactionsData, typesData] = await Promise.all([
        expenseService.getTransactions(),
        expenseService.getTypes()
      ]);
      setTransactions(transactionsData);
      setTypes(typesData);
    } catch (error) {
      console.error('Error loading expenses data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction =>
    transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.amount?.toString().includes(searchTerm) ||
    transaction.expenseType?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpenses = transactions.reduce((sum, transaction) => sum + (transaction.amount || 0), 0);
  const thisMonthExpenses = transactions
    .filter(t => new Date(t.date).getMonth() === new Date().getMonth())
    .reduce((sum, transaction) => sum + (transaction.amount || 0), 0);

  const handleRefresh = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-lg font-medium">Loading expenses...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            My Bus Expenses
          </h1>
          <p className="text-gray-600 mt-2">
            Track and manage your bus operational expenses
          </p>
        </div>
        <div className="flex space-x-3">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            🔄 Refresh
          </Button>
          <Link href="/bus-owner/expenses/transactions/create">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              ➕ Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border-l-4 border-l-blue-500 bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">₹{totalExpenses.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">All time expenses</p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>

        <div className="border-l-4 border-l-green-500 bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">₹{thisMonthExpenses.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Current month expenses</p>
            </div>
            <div className="text-2xl">📅</div>
          </div>
        </div>

        <div className="border-l-4 border-l-purple-500 bg-white p-6 rounded-lg shadow-sm hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expense Types</p>
              <p className="text-2xl font-bold text-gray-900">{types.length}</p>
              <p className="text-xs text-gray-500 mt-1">Available categories</p>
            </div>
            <div className="text-2xl">📋</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('transactions')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'transactions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📉 Transactions
            </button>
            <button
              onClick={() => setActiveTab('types')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'types'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📋 Categories
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'transactions' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    🔍
                  </span>
                </div>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No transactions found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'No transactions match your search.' : 'Start by adding your first expense transaction.'}
                  </p>
                  <Link href="/bus-owner/expenses/transactions/create">
                    <Button>
                      ➕ Add Transaction
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((transaction) => (
                        <tr key={transaction._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">
                              {transaction.description}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {transaction.expenseType?.name || 'N/A'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-red-600">
                              ₹{transaction.amount?.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'types' && (
            <div>
              {types.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No expense types found</h3>
                  <p className="text-gray-500">
                    Contact your administrator to set up expense categories.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {types.map((type) => (
                    <div key={type._id} className="border-l-4 border-l-blue-500 bg-gray-50 p-4 rounded-lg hover:shadow-md transition-shadow">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {type.name}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {type.description || 'No description available'}
                      </p>
                      <div className="flex items-center justify-between">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            type.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {type.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
