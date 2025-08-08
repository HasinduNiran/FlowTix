'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { ExpenseTransactionService, ExpenseTransaction } from '@/services/expense.service';

export default function TransactionDetailPage() {
  const [transaction, setTransaction] = useState<ExpenseTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Toast states
  const [showToastFlag, setShowToastFlag] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success', title?: string) => {
    setToastConfig({
      type,
      title: title || (type === 'error' ? 'Error' : 'Success'),
      message
    });
    setShowToastFlag(true);
  };

  const hideToast = () => {
    setShowToastFlag(false);
  };
  
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    fetchTransaction();
  }, [id]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const data = await ExpenseTransactionService.getExpenseTransactionById(id);
      setTransaction(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch transaction details. Please try again later.');
      console.error('Error fetching transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await ExpenseTransactionService.deleteExpenseTransaction(id);
      showToast('Transaction deleted successfully!', 'success');
      router.push('/super-admin/expenses?tab=transactions');
    } catch (err) {
      setError('Failed to delete transaction. Please try again.');
      showToast('Failed to delete transaction. Please try again.', 'error');
      console.error('Error deleting transaction:', err);
    } finally {
      setIsDeleting(false);
      setShowConfirmModal(false);
    }
  };

  const getExpenseTypeDisplay = () => {
    if (!transaction?.expenseTypeId) return 'Unknown';
    if (typeof transaction.expenseTypeId === 'object' && transaction.expenseTypeId) {
      return transaction.expenseTypeId.expenseName;
    }
    return 'Unknown';
  };

  const getBusDisplay = () => {
    if (!transaction?.expenseTypeId || typeof transaction.expenseTypeId !== 'object' || !transaction.expenseTypeId) {
      return 'N/A';
    }
    
    if ('busId' in transaction.expenseTypeId && transaction.expenseTypeId.busId && typeof transaction.expenseTypeId.busId === 'object') {
      return `${transaction.expenseTypeId.busId.busNumber} - ${transaction.expenseTypeId.busId.busName}`;
    }
    
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-gradient-to-r from-emerald-200 to-cyan-200 border-t-emerald-600 mx-auto mb-6"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-100 to-cyan-100 opacity-20 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700 text-xl font-semibold">Loading transaction details...</p>
                <p className="text-gray-500 text-sm">Please wait while we fetch the information</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-cyan-50 to-blue-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-red-100 p-8">
            <div className="text-center">
              <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-6">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
              <p className="text-gray-600 mb-6">{error || 'Transaction not found'}</p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => router.back()} variant="outline" className="bg-gray-50 hover:bg-gray-100">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Go Back
                </Button>
                <Button onClick={() => router.push('/super-admin/expenses')} className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  </svg>
                  Back to Dashboard
                </Button>
              </div>
            </div>
          </div>
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
                  onClick={confirmDelete}
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

        {/* Details Card */}
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Transaction Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">
                  Transaction Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Amount
                  </label>
                  <p className="text-2xl font-bold text-green-600">Rs. {transaction.amount.toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Transaction Date
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Expense Type
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{getExpenseTypeDisplay()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Status
                  </label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    transaction.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">
                  Additional Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Associated Bus
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{getBusDisplay()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Notes
                  </label>
                  <p className="text-gray-900">{transaction.notes || 'No notes provided'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Receipt
                  </label>
                  {transaction.uploadedBill ? (
                    <div className="flex items-center space-x-2">
                      <a 
                        href={transaction.uploadedBill} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        View Receipt
                      </a>
                    </div>
                  ) : (
                    <p className="text-gray-500">No receipt uploaded</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Created Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(transaction.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Last Updated
                  </label>
                  <p className="text-gray-900">
                    {new Date(transaction.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Toast Component */}
      {showToastFlag && (
        <Toast
          isOpen={showToastFlag}
          type={toastConfig.type}
          title={toastConfig.title}
          message={toastConfig.message}
          onClose={hideToast}
        />
      )}
      
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <ConfirmationModal 
          isOpen={showConfirmModal}
          title="Delete Transaction"
          message="Are you sure you want to delete this transaction? This action cannot be undone."
          confirmText={isDeleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          isLoading={isDeleting}
          onConfirm={handleDelete}
          onClose={() => setShowConfirmModal(false)}
          type="danger"
        />
      )}
    </div>
  );
}
