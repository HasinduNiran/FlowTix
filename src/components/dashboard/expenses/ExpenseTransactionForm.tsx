'use client';

import React, { useState, useEffect } from 'react';
import { ExpenseTransaction, CreateExpenseTransactionData, UpdateExpenseTransactionData, ExpenseTransactionService } from '@/services/expense.service';
import { ExpenseTypeService, ExpenseType } from '@/services/expense.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

interface ExpenseTransactionFormProps {
  initialData?: ExpenseTransaction | null;
  isEdit?: boolean;
  onSuccess?: () => void;
}

export default function ExpenseTransactionForm({ 
  initialData = null, 
  isEdit = false,
  onSuccess
}: ExpenseTransactionFormProps) {
  const [formData, setFormData] = useState({
    expenseTypeId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    uploadedBill: '',
    notes: '',
    isActive: true
  });

  const [availableExpenseTypes, setAvailableExpenseTypes] = useState<ExpenseType[]>([]);
  const [expenseTypesLoading, setExpenseTypesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAvailableExpenseTypes();
  }, []);

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        expenseTypeId: typeof initialData.expenseTypeId === 'string' ? initialData.expenseTypeId : initialData.expenseTypeId._id,
        amount: initialData.amount,
        date: new Date(initialData.date).toISOString().split('T')[0],
        uploadedBill: initialData.uploadedBill || '',
        notes: initialData.notes || '',
        isActive: initialData.isActive
      });
    }
  }, [initialData, isEdit]);

  const fetchAvailableExpenseTypes = async () => {
    try {
      setExpenseTypesLoading(true);
      const expenseTypes = await ExpenseTypeService.getAllExpenseTypes();
      setAvailableExpenseTypes(expenseTypes.filter(type => type.isActive));
    } catch (error) {
      console.error('Error fetching expense types:', error);
      setError('Failed to load available expense types');
    } finally {
      setExpenseTypesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.expenseTypeId) {
      setError('Please select an expense type');
      setIsSubmitting(false);
      return;
    }

    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      setIsSubmitting(false);
      return;
    }

    if (!formData.date) {
      setError('Date is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const submitData = {
        ...formData,
        date: new Date(formData.date).toISOString()
      };

      if (isEdit && initialData) {
        // Update existing expense transaction
        await ExpenseTransactionService.updateExpenseTransaction(initialData._id, submitData as UpdateExpenseTransactionData);
        setSuccess('Expense transaction updated successfully!');
      } else {
        // Create new expense transaction
        await ExpenseTransactionService.createExpenseTransaction(submitData as CreateExpenseTransactionData);
        setSuccess('Expense transaction created successfully!');
      }

      // Handle success callback or navigation
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setTimeout(() => {
          router.push('/super-admin/expenses');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage = error?.response?.data?.message || error.message || `Failed to ${isEdit ? 'update' : 'create'} expense transaction`;
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEdit && initialData) {
      router.push(`/super-admin/expenses/transactions/${initialData._id}`);
    } else {
      router.push('/super-admin/expenses');
    }
  };

  const handleBackClick = () => {
    if (isEdit && initialData) {
      router.push(`/super-admin/expenses/transactions/${initialData._id}`);
    } else {
      router.push('/super-admin/expenses');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              onClick={handleBackClick} 
              variant="outline" 
              className="group mr-4 hover:bg-gray-50 transition-all duration-300 hover:shadow-md transform hover:-translate-x-1"
            >
              <svg className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Expenses
            </Button>
          </div>
          
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-2xl mr-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isEdit ? 'Edit Expense Transaction' : 'Add New Expense Transaction'}
                </h1>
                <p className="text-gray-600">
                  {isEdit ? 'Update transaction details and information' : 'Record a new expense transaction'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Transaction Details Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-xl mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Transaction Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expense Type <span className="text-red-500">*</span>
                    </label>
                    {expenseTypesLoading ? (
                      <div className="flex items-center justify-center p-4 bg-white rounded-lg border border-green-200">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent mr-2"></div>
                        <span className="text-sm text-gray-600">Loading expense types...</span>
                      </div>
                    ) : (
                      <select
                        value={formData.expenseTypeId}
                        onChange={(e) => setFormData({ ...formData, expenseTypeId: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white"
                      >
                        <option value="">Select an expense type</option>
                        {availableExpenseTypes.map((type) => (
                          <option key={type._id} value={type._id}>
                            {type.expenseName} - {type.description}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-green-600 font-medium">$</span>
                      <Input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                        className="w-full pl-8 border-green-300 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                      className="w-full border-green-300 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-xl mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Additional Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Receipt/Bill URL
                    </label>
                    <Input
                      type="url"
                      value={formData.uploadedBill}
                      onChange={(e) => setFormData({ ...formData, uploadedBill: e.target.value })}
                      placeholder="https://example.com/receipt.pdf"
                      className="w-full border-blue-300 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Optional: URL link to the receipt or bill</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes about this expense..."
                      rows={4}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.isActive ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || expenseTypesLoading}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    {isEdit ? 'Updating...' : 'Recording...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isEdit ? 'Update Transaction' : 'Record Expense'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
