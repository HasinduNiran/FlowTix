'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { ExpenseTransactionService, ExpenseTypeService, ExpenseTransaction, ExpenseType } from '@/services/expense.service';
import { BusService } from '@/services/bus.service';

interface Bus {
  _id: string;
  busNumber: string;
  busName: string;
}

interface FormData {
  expenseTypeId: string;
  amount: string;
  date: string;
  notes: string;
  isActive: boolean;
}

export default function EditTransactionPage() {
  const [transaction, setTransaction] = useState<ExpenseTransaction | null>(null);
  const [expenseTypes, setExpenseTypes] = useState<ExpenseType[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [formData, setFormData] = useState<FormData>({
    expenseTypeId: '',
    amount: '',
    date: '',
    notes: '',
    isActive: true
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
    fetchBuses();
  }, [id]);

  useEffect(() => {
    if (buses.length > 0 && formData.expenseTypeId) {
      // Find the selected expense type to get its bus ID
      const selectedExpenseType = expenseTypes.find(et => et._id === formData.expenseTypeId);
      if (selectedExpenseType && typeof selectedExpenseType.busId === 'string') {
        fetchExpenseTypesByBus(selectedExpenseType.busId);
      }
    } else if (buses.length > 0) {
      fetchAllExpenseTypes();
    }
  }, [buses, formData.expenseTypeId]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const data = await ExpenseTransactionService.getExpenseTransactionById(id);
      setTransaction(data);
      
      // Set form data
      setFormData({
        expenseTypeId: typeof data.expenseTypeId === 'string' ? data.expenseTypeId : data.expenseTypeId?._id || '',
        amount: data.amount.toString(),
        date: data.date.split('T')[0], // Convert to YYYY-MM-DD format
        notes: data.notes || '',
        isActive: data.isActive
      });
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch transaction details. Please try again later.');
      console.error('Error fetching transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
      const busResponse = await BusService.getAllBuses();
      setBuses(busResponse || []);
    } catch (err) {
      console.error('Error fetching buses:', err);
    }
  };

  const fetchAllExpenseTypes = async () => {
    try {
      const expenseTypesResponse = await ExpenseTypeService.getAllExpenseTypes();
      setExpenseTypes(expenseTypesResponse || []);
    } catch (err) {
      console.error('Error fetching expense types:', err);
    }
  };

  const fetchExpenseTypesByBus = async (busId: string) => {
    try {
      const expenseTypesResponse = await ExpenseTypeService.getExpenseTypesByBus(busId);
      setExpenseTypes(expenseTypesResponse || []);
    } catch (err) {
      console.error('Error fetching expense types by bus:', err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.expenseTypeId || !formData.amount || !formData.date) {
      setError('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const updateData = {
        expenseTypeId: formData.expenseTypeId,
        amount: parseFloat(formData.amount),
        date: formData.date,
        notes: formData.notes || undefined,
        isActive: formData.isActive
      };

      await ExpenseTransactionService.updateExpenseTransaction(id, updateData);
      showToast('Transaction updated successfully!', 'success');
      router.push(`/super-admin/expenses/transactions/${id}`);
    } catch (err) {
      setError('Failed to update transaction. Please try again.');
      showToast('Failed to update transaction. Please try again.', 'error');
      console.error('Error updating transaction:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getExpenseTypeDisplay = (expenseType: ExpenseType) => {
    const busInfo = buses.find(bus => 
      typeof expenseType.busId === 'string' 
        ? bus._id === expenseType.busId 
        : bus._id === expenseType.busId?._id
    );
    
    if (busInfo) {
      return `${expenseType.expenseName} (${busInfo.busNumber})`;
    }
    
    return expenseType.expenseName;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading transaction...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Transaction not found
          </div>
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center mb-6 md:mb-0">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl mr-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Transaction</h1>
                  <p className="text-gray-600">Update expense transaction information</p>
                </div>
              </div>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Edit Form */}
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="expenseTypeId" className="block text-sm font-medium text-gray-700 mb-2">
                      Expense Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="expenseTypeId"
                      name="expenseTypeId"
                      value={formData.expenseTypeId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    >
                      <option value="">Select an expense type</option>
                      {expenseTypes.map((expenseType) => (
                        <option key={expenseType._id} value={expenseType._id}>
                          {getExpenseTypeDisplay(expenseType)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                      Amount (Rs.) <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter amount"
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                      Transaction Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Add any additional notes..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-vertical"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                      Active Transaction
                    </label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-4 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={() => router.back()}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Updating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Update Transaction
                    </>
                  )}
                </Button>
              </div>
            </form>
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
    </div>
  );
}
