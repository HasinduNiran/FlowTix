'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { OwnerExpenseTransactionService, OwnerExpenseTypeService, OwnerExpenseType, CreateOwnerExpenseTransactionData } from '@/services/ownerExpense.service';
import { BusService, Bus } from '@/services/bus.service';
import { useAuth } from '@/context/AuthContext';

export default function CreateTransactionPage() {
  const [formData, setFormData] = useState<CreateOwnerExpenseTransactionData>({
    expenseTypeId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0], // Today's date as default
    notes: ''
  });
  
  const [expenseTypes, setExpenseTypes] = useState<OwnerExpenseType[]>([]);
  const [ownerBuses, setOwnerBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Autocomplete states for expense type selection
  const [expenseTypeSearchQuery, setExpenseTypeSearchQuery] = useState('');
  const [showExpenseTypeDropdown, setShowExpenseTypeDropdown] = useState(false);
  const [selectedExpenseType, setSelectedExpenseType] = useState<OwnerExpenseType | null>(null);
  const [filteredExpenseTypes, setFilteredExpenseTypes] = useState<OwnerExpenseType[]>([]);
  
  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  });
  
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchOwnerData();
    }
  }, [user]);

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

  const fetchOwnerData = async () => {
    try {
      setIsLoadingData(true);
      const [expenseTypesData, busesData] = await Promise.all([
        OwnerExpenseTypeService.getOwnerExpenseTypes(),
        BusService.getBusesByOwner(user!.id)
      ]);
      setExpenseTypes(expenseTypesData);
      setOwnerBuses(busesData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch your data. Please try again later.');
      console.error('Error fetching owner data:', err);
    } finally {
      setIsLoadingData(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.expenseTypeId || !selectedExpenseType) {
      setError('Please select an expense type from the dropdown');
      return false;
    }
    if (!formData.amount || formData.amount <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (!formData.date) {
      setError('Please select a transaction date');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await OwnerExpenseTransactionService.createExpenseTransaction(formData);
      
      setToastConfig({
        type: 'success',
        title: 'Transaction Created',
        message: `Transaction for Rs. ${formData.amount.toLocaleString()} has been created successfully.`
      });
      setShowToast(true);

      // Wait a moment before redirecting
      setTimeout(() => {
        router.push('/bus-owner/expenses');
      }, 1500);

    } catch (err: any) {
      console.error('Error creating transaction:', err);
      
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Failed to create transaction. Please try again.';
      
      setToastConfig({
        type: 'error',
        title: 'Creation Failed',
        message: errorMessage
      });
      setShowToast(true);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/bus-owner/expenses');
  };

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading your expense data...</p>
            </div>
          </div>
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
                    <span className="ml-1 text-sm font-medium text-gray-900">Create Transaction</span>
                  </div>
                </li>
              </ol>
            </nav>

            <div className="flex items-center">
              <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-4 rounded-2xl mr-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Transaction</h1>
                <p className="text-gray-600">Add a new expense transaction to your records</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {expenseTypes.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Expense Types Found</h3>
                <p className="text-gray-600 mb-6">You need to have at least one expense type to create transactions. Please add an expense type first.</p>
                <Button
                  onClick={() => router.push('/bus-owner/expenses/types/create')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Create Expense Type
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Expense Type with Autocomplete */}
                    <div className="relative">
                      <label htmlFor="expenseTypeSearch" className="block text-sm font-semibold text-gray-900 mb-3">
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors pr-10"
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

                    {/* Amount */}
                    <div>
                      <label htmlFor="amount" className="block text-sm font-semibold text-gray-900 mb-3">
                        Amount (Rs.) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="amount"
                        name="amount"
                        value={formData.amount || ''}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Enter the transaction amount in Pakistani Rupees
                      </p>
                    </div>

                    {/* Date */}
                    <div>
                      <label htmlFor="date" className="block text-sm font-semibold text-gray-900 mb-3">
                        Transaction Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Select the date when this expense occurred
                      </p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Notes */}
                    <div>
                      <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-3">
                        Notes
                      </label>
                      <textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        rows={6}
                        maxLength={500}
                        placeholder="Add any additional notes about this transaction..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                      />
                      <p className="mt-2 text-sm text-gray-500">
                        Optional details about the transaction ({formData.notes?.length || 0}/500 characters)
                      </p>
                    </div>

                    {/* Selected Expense Type Info */}
                    {selectedExpenseType && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">Selected Expense Type</h4>
                        <div className="space-y-1">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Type:</span> {selectedExpenseType.expenseName}
                          </p>
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">Bus:</span> {
                              typeof selectedExpenseType.busId === 'object' && selectedExpenseType.busId
                                ? `${selectedExpenseType.busId.busNumber} - ${selectedExpenseType.busId.busName}`
                                : 'Unknown Bus'
                            }
                          </p>
                          {selectedExpenseType.description && (
                            <p className="text-sm text-blue-700 mt-2">
                              <span className="font-medium">Description:</span> {selectedExpenseType.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-200">
                  <Button
                    type="button"
                    onClick={handleCancel}
                    variant="outline"
                    className="w-full sm:w-auto bg-gray-50 hover:bg-gray-100 border-gray-300"
                    disabled={loading}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Create Transaction
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>

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
