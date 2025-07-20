'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { ExpenseTypeService } from '@/services/expense.service';
import { BusService } from '@/services/bus.service';

interface ExpenseType {
  _id: string;
  expenseName: string;
  description: string;
  busId: {
    _id: string;
    busNumber: string;
    busName: string;
  } | string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Bus {
  _id: string;
  busNumber: string;
  busName: string;
  seatCapacity: number;
  status: string;
}

export default function ExpenseTypeDetailPage() {
  const [expenseType, setExpenseType] = useState<ExpenseType | null>(null);
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

  const handleDelete = async () => {
    if (!expenseType) return;
    
    setIsDeleting(true);
    try {
      await ExpenseTypeService.deleteExpenseType(id);
      
      // Show success toast
      setToastConfig({
        type: 'success',
        title: 'Expense Type Deleted Successfully!',
        message: `"${expenseType.expenseName}" has been permanently removed from the system. All associated data has been safely deleted.`
      });
      setShowToastFlag(true);
      setShowConfirmModal(false);
      
      // Navigate after a short delay to show the toast
      setTimeout(() => {
        router.push('/super-admin/expenses?tab=types');
      }, 2000);
    } catch (err) {
      setToastConfig({
        type: 'error',
        title: 'Delete Failed',
        message: `Failed to delete "${expenseType.expenseName}". This might be due to existing transactions or dependencies. Please try again or contact support.`
      });
      setShowToastFlag(true);
      setShowConfirmModal(false);
      console.error('Error deleting expense type:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteClick = () => {
    setShowConfirmModal(true);
  };

  const getBusDisplay = () => {
    if (!expenseType?.busId) return 'N/A';
    if (typeof expenseType.busId === 'object') {
      return `${expenseType.busId.busNumber} - ${expenseType.busId.busName}`;
    }
    return 'N/A';
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
                  onClick={handleDeleteClick}
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
              {/* Basic Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">
                  Basic Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Expense Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{expenseType.expenseName}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Description
                  </label>
                  <p className="text-gray-900">{expenseType.description || 'No description provided'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Status
                  </label>
                  <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                    expenseType.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {expenseType.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Assignment Information */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">
                  Assignment Information
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Assigned Bus
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{getBusDisplay()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Created Date
                  </label>
                  <p className="text-gray-900">
                    {new Date(expenseType.createdAt).toLocaleDateString('en-US', {
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
                    {new Date(expenseType.updatedAt).toLocaleDateString('en-US', {
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
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleDelete}
        title="Delete Expense Type Permanently?"
        message={`Are you absolutely sure you want to delete "${expenseType?.expenseName}"? This action cannot be undone and will permanently remove this expense type and may affect related transaction records.`}
        confirmText="Yes, Delete Type"
        cancelText="Cancel"
        type="danger"
        isLoading={isDeleting}
      />
      
      {/* Toast Component */}
      {showToastFlag && (
        <Toast
          isOpen={showToastFlag}
          type={toastConfig.type}
          title={toastConfig.title}
          message={toastConfig.message}
          onClose={hideToast}
          duration={toastConfig.type === 'success' ? 3000 : 5000}
        />
      )}
    </div>
  );
}
