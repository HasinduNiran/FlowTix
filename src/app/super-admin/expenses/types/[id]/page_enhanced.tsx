'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ExpenseTypeService, ExpenseType } from '@/services/expense.service';
import { Toast } from '@/components/ui/Toast';

export default function ExpenseTypeDetailPage() {
  const [expenseType, setExpenseType] = useState<ExpenseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastState, setToastState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'info' | 'warning'
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const titles = {
      success: 'Success',
      error: 'Error',
      info: 'Information',
      warning: 'Warning'
    };
    
    setToastState({
      isOpen: true,
      title: titles[type],
      message,
      type
    });
  };

  useEffect(() => {
    fetchExpenseType();
  }, [id]);

  const fetchExpenseType = async () => {
    try {
      setLoading(true);
      const data = await ExpenseTypeService.getExpenseTypeById(id);
      setExpenseType(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch expense type details. Please try again later.');
      console.error('Error fetching expense type:', err);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteExpenseType = () => {
    setDeleteConfirmation(true);
  };

  const handleDelete = async () => {
    if (!expenseType) return;
    
    try {
      setLoading(true);
      await ExpenseTypeService.deleteExpenseType(id);
      showToast('Expense type deleted successfully.', 'success');
      router.push('/super-admin/expenses?tab=types');
    } catch (err) {
      showToast('Failed to delete expense type. Please try again.', 'error');
      console.error('Error deleting expense type:', err);
      setLoading(false);
    } finally {
      setDeleteConfirmation(false);
    }
  };

  const getBusDisplay = () => {
    if (!expenseType?.busId) {
      return 'No bus assigned';
    }
    
    if (typeof expenseType.busId === 'object' && expenseType.busId) {
      return `${expenseType.busId.busNumber} - ${expenseType.busId.busName}`;
    }
    
    return 'Bus information unavailable';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-gradient-to-r from-purple-200 to-pink-200 border-t-purple-600 mx-auto mb-6"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 opacity-20 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700 text-xl font-semibold">Loading expense type details...</p>
                <p className="text-gray-500 text-sm">Please wait while we fetch the information</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !expenseType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-red-100 p-8">
            <div className="text-center">
              <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto mb-6">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
              <p className="text-gray-600 mb-6">{error || 'Expense type not found'}</p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => router.back()} variant="outline" className="bg-gray-50 hover:bg-gray-100">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Go Back
                </Button>
                <Button onClick={() => router.push('/super-admin/expenses')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      {toastState.isOpen && (
        <Toast 
          isOpen={toastState.isOpen}
          title={toastState.title}
          message={toastState.message}
          type={toastState.type}
          onClose={() => setToastState(prev => ({ ...prev, isOpen: false }))}
        />
      )}
      
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
                <svg className="h-10 w-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Delete Expense Type</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete this expense type? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-3">
                <Button
                  onClick={() => setDeleteConfirmation(false)}
                  variant="outline"
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors"
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
                    <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Expense Types</span>
                  </div>
                </li>
                <li aria-current="page">
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-purple-600 md:ml-2 truncate">{expenseType.expenseName}</span>
                  </div>
                </li>
              </ol>
            </nav>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center">
                <div className="relative">
                  <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-6 rounded-3xl shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full ${
                      expenseType.isActive 
                        ? 'bg-green-100 text-green-800 ring-2 ring-green-200' 
                        : 'bg-red-100 text-red-800 ring-2 ring-red-200'
                    }`}>
                      {expenseType.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="ml-6">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {expenseType.expenseName}
                  </h1>
                  <p className="text-gray-600 text-lg">{expenseType.description}</p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
                    </svg>
                    {getBusDisplay()}
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
                  onClick={() => router.push(`/super-admin/expenses/types/${id}/edit`)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Type
                </Button>
                <Button
                  onClick={confirmDeleteExpenseType}
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

        {/* Details Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Information Card */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                <h3 className="text-2xl font-bold text-white flex items-center">
                  <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Expense Type Information
                </h3>
              </div>
              
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Expense Name
                      </label>
                      <div className="flex items-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100">
                        <svg className="w-5 h-5 text-purple-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <p className="text-xl font-bold text-gray-900">{expenseType.expenseName}</p>
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Associated Bus
                      </label>
                      <div className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                        <svg className="w-5 h-5 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2 2H6a2 2 0 01-2-2v0a2 2 0 01-2-2V9a2 2 0 012-2h2z" />
                        </svg>
                        <p className="text-lg font-semibold text-gray-900">{getBusDisplay()}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Status
                      </label>
                      <div className={`inline-flex items-center px-6 py-3 text-lg font-bold rounded-2xl border-2 ${
                        expenseType.isActive 
                          ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200' 
                          : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-200'
                      }`}>
                        <div className={`w-3 h-3 rounded-full mr-3 ${
                          expenseType.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        {expenseType.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>

                    <div className="group">
                      <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Created Date
                      </label>
                      <div className="flex items-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-100">
                        <svg className="w-5 h-5 text-amber-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v8a2 2 0 002 2h2" />
                        </svg>
                        <p className="text-lg font-semibold text-gray-900">
                          {new Date(expenseType.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Description
                  </label>
                  <div className="p-6 bg-gradient-to-r from-gray-50 to-slate-50 rounded-2xl border border-gray-100">
                    <p className="text-gray-900 text-lg leading-relaxed">
                      {expenseType.description || 'No description provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Card */}
          <div className="space-y-6">
            <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Quick Stats
                </h3>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-2xl mb-4">
                    <svg className="w-8 h-8 text-purple-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                  <p className="text-sm text-gray-500">Total Transactions</p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs text-gray-400 text-center">
                    Last updated: {new Date(expenseType.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    onClick={() => router.push('/super-admin/expenses/transactions/create')}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Transaction
                  </Button>
                  <Button
                    onClick={() => router.push('/super-admin/expenses?tab=types')}
                    variant="outline"
                    className="w-full border-gray-200 hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                    View All Types
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
