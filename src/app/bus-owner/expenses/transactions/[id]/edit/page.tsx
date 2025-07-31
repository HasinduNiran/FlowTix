'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { OwnerExpenseTransactionService, OwnerExpenseTypeService, OwnerExpenseTransaction, OwnerExpenseType } from '@/services/ownerExpense.service';
import { BusService, Bus } from '@/services/bus.service';
import { useAuth } from '@/context/AuthContext';

interface FormData {
  expenseTypeId: string;
  amount: string;
  date: string;
  notes: string;
}

export default function EditTransactionPage() {
  const [transaction, setTransaction] = useState<OwnerExpenseTransaction | null>(null);
  const [expenseTypes, setExpenseTypes] = useState<OwnerExpenseType[]>([]);
  const [ownerBuses, setOwnerBuses] = useState<Bus[]>([]);
  const [formData, setFormData] = useState<FormData>({
    expenseTypeId: '',
    amount: '',
    date: '',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Autocomplete states for expense type selection
  const [expenseTypeSearchQuery, setExpenseTypeSearchQuery] = useState('');
  const [showExpenseTypeDropdown, setShowExpenseTypeDropdown] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState<OwnerExpenseType | null>(null);
  const [filteredExpenseTypes, setFilteredExpenseTypes] = useState<OwnerExpenseType[]>([]);
  
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
  const { user } = useAuth();
  const id = params.id as string;

  useEffect(() => {
    if (user?.id) {
      Promise.all([fetchTransaction(), fetchOwnerBuses(), fetchExpenseTypes()]);
    }
  }, [id, user]);

  // Filter expense types based on search query
  useEffect(() => {
    if (expenseTypes.length > 0) {
      if (expenseTypeSearchQuery.trim() === '') {
        setFilteredExpenseTypes(expenseTypes);
      } else {
        const filtered = expenseTypes.filter(type =>
          type.expenseName.toLowerCase().includes(expenseTypeSearchQuery.toLowerCase()) ||
          (type.busId && typeof type.busId === 'object' && 
           type.busId.busNumber.toLowerCase().includes(expenseTypeSearchQuery.toLowerCase()))
        );
        setFilteredExpenseTypes(filtered);
      }
    }
  }, [expenseTypes, expenseTypeSearchQuery]);

  // Set initial expense type search query when form data and expense types are loaded
  useEffect(() => {
    if (formData.expenseTypeId && expenseTypes.length > 0) {
      const currentExpenseType = expenseTypes.find(type => type._id === formData.expenseTypeId);
      if (currentExpenseType) {
        setSelectedExpenseType(currentExpenseType);
        const busInfo = typeof currentExpenseType.busId === 'object' 
          ? ` (${currentExpenseType.busId.busNumber})` 
          : '';
        setExpenseTypeSearchQuery(`${currentExpenseType.expenseName}${busInfo}`);
      }
    }
  }, [formData.expenseTypeId, expenseTypes]);

  const fetchTransaction = async () => {
    try {
      setLoading(true);
      const data = await OwnerExpenseTransactionService.getExpenseTransactionById(id);
      setTransaction(data);
      
      // Set form data
      setFormData({
        expenseTypeId: typeof data.expenseTypeId === 'string' ? data.expenseTypeId : data.expenseTypeId?._id || '',
        amount: data.amount.toString(),
        date: data.date.split('T')[0], // Convert to YYYY-MM-DD format
        notes: data.notes || ''
      });
      
      setError(null);
    } catch (err) {
      setError('Failed to fetch transaction details. Please try again later.');
      console.error('Error fetching transaction:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOwnerBuses = async () => {
    try {
      const busResponse = await BusService.getBusesByOwner(user!.id);
      setOwnerBuses(busResponse || []);
    } catch (err) {
      console.error('Error fetching owner buses:', err);
    }
  };

  const fetchExpenseTypes = async () => {
    try {
      const expenseTypesResponse = await OwnerExpenseTypeService.getOwnerExpenseTypes();
      setExpenseTypes(expenseTypesResponse || []);
    } catch (err) {
      console.error('Error fetching expense types:', err);
    }
  };

  // Handle expense type search input changes
  const handleExpenseTypeSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExpenseTypeSearchQuery(value);
    setShowExpenseTypeDropdown(true);
    
    // Clear selection if user is typing
    if (selectedExpenseType) {
      const busInfo = typeof selectedExpenseType.busId === 'object' 
        ? ` (${selectedExpenseType.busId.busNumber})` 
        : '';
      const expectedValue = `${selectedExpenseType.expenseName}${busInfo}`;
      if (value !== expectedValue) {
        setSelectedExpenseType(null);
        setFormData(prev => ({ ...prev, expenseTypeId: '' }));
      }
    }
  };

  // Handle expense type selection from dropdown
  const handleExpenseTypeSelect = (expenseType: OwnerExpenseType) => {
    setSelectedExpenseType(expenseType);
    const busInfo = typeof expenseType.busId === 'object' 
      ? ` (${expenseType.busId.busNumber})` 
      : '';
    setExpenseTypeSearchQuery(`${expenseType.expenseName}${busInfo}`);
    setShowExpenseTypeDropdown(false);
    setFormData(prev => ({ ...prev, expenseTypeId: expenseType._id }));
  };

  // Handle input focus
  const handleExpenseTypeInputFocus = () => {
    setShowExpenseTypeDropdown(true);
  };

  // Handle clicking outside to close dropdown
  const handleExpenseTypeInputBlur = () => {
    // Delay hiding dropdown to allow clicking on items
    setTimeout(() => {
      setShowExpenseTypeDropdown(false);
    }, 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.expenseTypeId || !selectedExpenseType) {
      setError('Please select an expense type from the dropdown.');
      return;
    }
    
    if (!formData.amount || !formData.date) {
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
        notes: formData.notes || undefined
      };

      await OwnerExpenseTransactionService.updateExpenseTransaction(id, updateData);
      showToast('Transaction updated successfully!', 'success');
      router.push(`/bus-owner/expenses/transactions/${id}`);
    } catch (err) {
      setError('Failed to update transaction. Please try again.');
      showToast('Failed to update transaction. Please try again.', 'error');
      console.error('Error updating transaction:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const getExpenseTypeDisplay = (expenseType: OwnerExpenseType) => {
    const busInfo = typeof expenseType.busId === 'object' && expenseType.busId
      ? ` (${expenseType.busId.busNumber})`
      : '';
    return `${expenseType.expenseName}${busInfo}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
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
                    <button
                      onClick={() => router.push(`/bus-owner/expenses/transactions/${id}`)}
                      className="ml-1 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      Rs. {transaction.amount.toLocaleString()}
                    </button>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                    </svg>
                    <span className="ml-1 text-sm font-medium text-gray-900">Edit</span>
                  </div>
                </li>
              </ol>
            </nav>

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="flex items-center mb-6 lg:mb-0">
                <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-4 rounded-2xl mr-6">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Transaction</h1>
                  <p className="text-gray-600">Update your expense transaction details</p>
                </div>
              </div>
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="bg-white/80 hover:bg-white border-gray-200 shadow-lg backdrop-blur-sm"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
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
        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Expense Type with Autocomplete */}
                <div className="relative">
                  <label htmlFor="expenseTypeSearch" className="block text-sm font-semibold text-gray-700 mb-3">
                    Expense Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="expenseTypeSearch"
                      name="expenseTypeSearch"
                      value={expenseTypeSearchQuery}
                      onChange={handleExpenseTypeSearchChange}
                      onFocus={handleExpenseTypeInputFocus}
                      onBlur={handleExpenseTypeInputBlur}
                      placeholder="Type expense type or bus number to search..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80 backdrop-blur-sm pr-10"
                      autoComplete="off"
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    
                    {/* Dropdown */}
                    {showExpenseTypeDropdown && filteredExpenseTypes.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {filteredExpenseTypes.map((expenseType) => (
                          <div
                            key={expenseType._id}
                            onClick={() => handleExpenseTypeSelect(expenseType)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {expenseType.expenseName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {typeof expenseType.busId === 'object' && expenseType.busId
                                    ? `${expenseType.busId.busNumber} - ${expenseType.busId.busName}`
                                    : 'Unknown Bus'
                                  }
                                </div>
                              </div>
                              {selectedExpenseType?._id === expenseType._id && (
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* No results message */}
                    {showExpenseTypeDropdown && expenseTypeSearchQuery.trim() !== '' && filteredExpenseTypes.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg">
                        <div className="px-4 py-3 text-gray-500 text-center">
                          No expense types found matching "{expenseTypeSearchQuery}"
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Type expense type name or bus number to search and select
                  </p>
                </div>

                <div>
                  <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-3">
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-3">
                    Transaction Date <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-3">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Add any additional notes about this transaction..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80 backdrop-blur-sm resize-none"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Optional details about the transaction ({formData.notes.length}/500 characters)
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <Button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
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
              
              <Button
                type="button"
                onClick={() => router.back()}
                variant="outline"
                disabled={submitting}
                className="flex-1 bg-white/80 hover:bg-white border-gray-200 shadow-lg backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </Button>
            </div>
          </form>
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