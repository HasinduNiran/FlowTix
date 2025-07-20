'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { OwnerExpenseTypeService, OwnerExpenseType } from '@/services/ownerExpense.service';
import { BusService, Bus } from '@/services/bus.service';
import { useAuth } from '@/context/AuthContext';

export default function OwnerExpenseTypeDetailPage() {
  const [expenseType, setExpenseType] = useState<OwnerExpenseType | null>(null);
  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  });

  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const id = params.id as string;

  useEffect(() => {
    if (id && user?.id) {
      fetchExpenseTypeDetails();
    }
  }, [id, user]);

  const fetchExpenseTypeDetails = async () => {
    try {
      setLoading(true);
      const typeData = await OwnerExpenseTypeService.getExpenseTypeById(id);
      setExpenseType(typeData);
      
      // Fetch bus details if busId is available
      if (typeData.busId) {
        const busId = typeof typeData.busId === 'string' ? typeData.busId : typeData.busId._id;
        try {
          const busData = await BusService.getBusById(busId);
          setBus(busData);
        } catch (busErr) {
          console.warn('Failed to fetch bus details:', busErr);
        }
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching expense type:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Failed to fetch expense type details.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!expenseType) return;

    try {
      setDeleteLoading(true);
      await OwnerExpenseTypeService.deleteExpenseType(expenseType._id);
      
      setToastConfig({
        type: 'success',
        title: 'Expense Type Deleted',
        message: `${expenseType.expenseName} has been permanently removed from your account.`
      });
      setShowToast(true);

      // Redirect after showing success message
      setTimeout(() => {
        router.push('/bus-owner/expenses');
      }, 1500);

    } catch (err: any) {
      console.error('Error deleting expense type:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Failed to delete expense type. Please try again.';
      
      setToastConfig({
        type: 'error',
        title: 'Delete Failed',
        message: errorMessage
      });
      setShowToast(true);
    } finally {
      setDeleteLoading(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading expense type details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white shadow-lg rounded-2xl p-12 text-center border border-gray-200">
            <div className="bg-red-100 p-4 rounded-2xl mx-auto w-fit mb-4">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Expense Type</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={() => router.back()} variant="outline" className="bg-gray-50 hover:bg-gray-100">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Go Back
              </Button>
              <Button onClick={() => router.push('/bus-owner/expenses')} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                Back to Expenses
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Breadcrumb */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-white/50">
            {/* Breadcrumb */}
            <nav className="flex mb-6" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <button
                    onClick={() => router.push('/bus-owner/expenses')}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <svg className="mr-2 w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                    </svg>
                    My Expenses
                  </button>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-500">Expense Types</span>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-900">{expenseType?.expenseName}</span>
                  </div>
                </li>
              </ol>
            </nav>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="flex items-center mb-6 lg:mb-0">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl mr-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{expenseType?.expenseName}</h1>
                  <p className="text-gray-600">Expense Type Details & Management</p>
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
                  onClick={() => router.push(`/bus-owner/expenses/types/${id}/edit`)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit
                </Button>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 shadow-lg backdrop-blur-sm"
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Primary Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Details */}
            <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-white/50">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Expense Name
                  </label>
                  <p className="text-xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {expenseType?.expenseName}
                  </p>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Associated Bus
                  </label>
                  <div className="flex items-center">
                    <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-2 rounded-lg mr-3">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-4a2 2 0 00-2-2H8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">
                        {bus ? `${bus.busNumber} - ${bus.busName}` : 
                         (typeof expenseType?.busId === 'object' && expenseType?.busId ? 
                          `${expenseType.busId.busNumber} - ${expenseType.busId.busName}` : 
                          'Bus information not available')}
                      </p>
                      {bus && (
                        <p className="text-sm text-gray-500">Capacity: {bus.seatCapacity} seats</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Description
                </label>
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <p className="text-gray-800 leading-relaxed">
                    {expenseType?.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status & Meta Information */}
          <div className="space-y-8">
            {/* Status Card */}
            <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-6 border border-white/50">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Status</h3>
              </div>
              
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Status
                  </label>
                  <div className={`inline-flex items-center px-6 py-3 text-lg font-bold rounded-2xl border-2 ${
                    expenseType?.isActive 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200' 
                      : 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-200'
                  }`}>
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      expenseType?.isActive ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    {expenseType?.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Created Date
                  </label>
                  <p className="text-lg font-semibold text-gray-800">
                    {expenseType?.createdAt ? new Date(expenseType.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </p>
                </div>

                {expenseType?.updatedAt && expenseType.updatedAt !== expenseType.createdAt && (
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Last Updated
                    </label>
                    <p className="text-lg font-semibold text-gray-800">
                      {new Date(expenseType.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-xl rounded-3xl p-6 border border-blue-100">
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Quick Actions</h3>
              </div>
              
              <div className="space-y-4">
                <Button
                  onClick={() => router.push('/bus-owner/expenses/transactions/create')}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Transaction
                </Button>
                
                <Button
                  onClick={() => router.push('/bus-owner/expenses?tab=types')}
                  variant="outline"
                  className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
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

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
          title="Delete Expense Type?"
          message={`Are you sure you want to delete "${expenseType?.expenseName}"? This action cannot be undone and will also remove all associated transactions.`}
          confirmText="Delete Permanently"
          cancelText="Cancel"
          type="danger"
          isLoading={deleteLoading}
        />

        {/* Toast Notification */}
        <Toast
          isOpen={showToast}
          onClose={() => setShowToast(false)}
          title={toastConfig.title}
          message={toastConfig.message}
          type={toastConfig.type}
          duration={toastConfig.type === 'success' ? 3000 : 5000}
        />
      </div>
    </div>
  );
}
