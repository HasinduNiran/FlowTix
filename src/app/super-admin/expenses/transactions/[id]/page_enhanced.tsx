'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { ExpenseTransactionService } from '@/services/expense.service';
import { BusService } from '@/services/bus.service';

export default function TransactionDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [transaction, setTransaction] = useState(null);
  const [expenseType, setExpenseType] = useState(null);
  const [bus, setBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const data = await ExpenseTransactionService.getById(id);
      setTransaction(data);
    } catch (err) {
      console.error('Error fetching transaction:', err);
      setError('Failed to load transaction details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      try {
        await ExpenseTransactionService.delete(id);
        router.push('/super-admin/expenses');
      } catch (err) {
        console.error('Error deleting transaction:', err);
        alert('Failed to delete transaction. Please try again.');
      }
    }
  };

  const getExpenseTypeDisplay = () => {
    if (typeof transaction.expenseTypeId === 'object' && transaction.expenseTypeId !== null) {
      return transaction.expenseTypeId.name || 'N/A';
    }
    return expenseType?.name || 'Loading...';
  };

  const getBusDisplay = () => {
    if (typeof transaction.busId === 'object' && transaction.busId !== null) {
      return transaction.busId.busNumber || 'N/A';
    }
    return bus?.busNumber || 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-12 border border-white/50">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mb-6"></div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Loading Transaction</h3>
            <p className="text-gray-600">Please wait while we fetch the details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-rose-50 flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm shadow-2xl rounded-3xl p-12 border border-white/50 max-w-md mx-auto text-center">
          <div className="bg-red-100 p-4 rounded-full w-fit mx-auto mb-6">
            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Transaction Not Found</h3>
          <p className="text-gray-600 mb-6">{error || 'This transaction could not be found or may have been deleted.'}</p>
          <Button
            onClick={() => router.push('/super-admin/expenses')}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Breadcrumb */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-white/50">
            {/* Breadcrumb */}
            <nav className="flex mb-6" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <button
                    onClick={() => router.push('/super-admin/expenses')}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                    Expenses
                  </button>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Transactions</span>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-emerald-600 md:ml-2 truncate">Rs. {transaction.amount.toLocaleString()}</span>
                  </div>
                </li>
              </ol>
            </nav>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center">
                <div className="relative">
                  <div className="bg-gradient-to-br from-emerald-500 to-cyan-500 p-6 rounded-3xl shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full ${
                      transaction.isActive 
                        ? 'bg-green-100 text-green-800 ring-2 ring-green-200' 
                        : 'bg-red-100 text-red-800 ring-2 ring-red-200'
                    }`}>
                      {transaction.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="ml-6">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    Rs. {transaction.amount.toLocaleString()}
                  </h1>
                  <p className="text-gray-600 text-lg">{getExpenseTypeDisplay()}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
                    </svg>
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="bg-white/80 hover:bg-white border-gray-200 shadow-lg backdrop-blur-sm"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </Button>
                <Button
                  onClick={() => router.push(`/super-admin/expenses/transactions/${id}/edit`)}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Transaction
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Transaction Details Card */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 px-8 py-6">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Transaction Information
                </h2>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Amount</label>
                      <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 p-4 rounded-2xl border border-emerald-200 group-hover:shadow-md transition-shadow">
                        <p className="text-2xl font-bold text-emerald-600">Rs. {transaction.amount.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Expense Type</label>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-200 group-hover:shadow-md transition-shadow">
                        <p className="text-lg font-semibold text-blue-700">{getExpenseTypeDisplay()}</p>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Date</label>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-200 group-hover:shadow-md transition-shadow">
                        <p className="text-lg font-semibold text-purple-700">
                          {new Date(transaction.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Notes</label>
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-2xl border border-gray-200 group-hover:shadow-md transition-shadow">
                        <p className="text-gray-700 leading-relaxed">{transaction.notes || 'No notes provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Bus Information</label>
                      <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl border border-amber-200 group-hover:shadow-md transition-shadow">
                        <p className="text-lg font-semibold text-amber-700">{getBusDisplay()}</p>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Status</label>
                      <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-2xl border border-gray-200 group-hover:shadow-md transition-shadow">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold shadow-sm ${
                          transaction.isActive 
                            ? 'bg-green-100 text-green-800 ring-2 ring-green-200' 
                            : 'bg-red-100 text-red-800 ring-2 ring-red-200'
                        }`}>
                          <span className={`w-2 h-2 rounded-full mr-2 ${
                            transaction.isActive ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          {transaction.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Receipt</label>
                      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-200 group-hover:shadow-md transition-shadow">
                        {transaction.uploadedBill ? (
                          <a 
                            href={transaction.uploadedBill} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-xl hover:bg-indigo-200 transition-colors shadow-sm"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            View Receipt
                          </a>
                        ) : (
                          <p className="text-gray-500 italic">No receipt uploaded</p>
                        )}
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">Timestamps</label>
                      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-2xl border border-teal-200 group-hover:shadow-md transition-shadow space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-600">Created:</span>
                          <span className="text-xs font-semibold text-teal-600">
                            {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-gray-600">Updated:</span>
                          <span className="text-xs font-semibold text-teal-600">
                            {new Date(transaction.updatedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <Button
                  onClick={() => router.push(`/super-admin/expenses/transactions/${id}/edit`)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all duration-200 py-3 rounded-2xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Transaction
                </Button>
                
                <Button
                  onClick={handleDelete}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-200 py-3 rounded-2xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Transaction
                </Button>
                
                <hr className="border-gray-200 my-4" />
                
                <Button
                  onClick={() => router.push('/super-admin/expenses')}
                  variant="outline"
                  className="w-full bg-white/80 hover:bg-white border-gray-200 shadow-md backdrop-blur-sm py-3 rounded-2xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  Go to Dashboard
                </Button>
              </div>
            </div>

            {/* Transaction Stats */}
            <div className="mt-6 bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden">
              <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-6 py-4">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Summary
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl">
                  <span className="text-sm font-medium text-gray-600">Created</span>
                  <span className="text-sm font-semibold text-emerald-600">
                    {new Date(transaction.createdAt || transaction.date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl">
                  <span className="text-sm font-medium text-gray-600">Last Updated</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {new Date(transaction.updatedAt || transaction.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
