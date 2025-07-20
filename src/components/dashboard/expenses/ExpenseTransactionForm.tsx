'use client';

import React, { useState, useEffect } from 'react';
import { ExpenseTransaction, CreateExpenseTransactionData, UpdateExpenseTransactionData, ExpenseTransactionService } from '@/services/expense.service';
import { ExpenseTypeService, ExpenseType } from '@/services/expense.service';
import { BusService, Bus } from '@/services/bus.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

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
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    expenseTypeId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    uploadedBill: '',
    notes: '',
    isActive: true
  });

  const [availableExpenseTypes, setAvailableExpenseTypes] = useState<ExpenseType[]>([]);
  const [availableBuses, setAvailableBuses] = useState<Bus[]>([]);
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
  const [filteredExpenseTypes, setFilteredExpenseTypes] = useState<ExpenseType[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [busSearchTerm, setBusSearchTerm] = useState('');
  const [showBusSuggestions, setShowBusSuggestions] = useState(false);
  const [selectedBusIndex, setSelectedBusIndex] = useState(-1);
  const [expenseTypesLoading, setExpenseTypesLoading] = useState(false);
  const [busesLoading, setBusesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [billFile, setBillFile] = useState<File | null>(null);
  const [billPreview, setBillPreview] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    fetchAvailableExpenseTypes();
    fetchAvailableBuses();
  }, []);

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        expenseTypeId: initialData.expenseTypeId ? 
          (typeof initialData.expenseTypeId === 'string' ? 
            initialData.expenseTypeId : 
            initialData.expenseTypeId._id) : '',
        amount: initialData.amount,
        date: new Date(initialData.date).toISOString().split('T')[0],
        uploadedBill: initialData.uploadedBill || '',
        notes: initialData.notes || '',
        isActive: initialData.isActive
      });
      
      // If we have an existing receipt URL, set it as preview
      if (initialData.uploadedBill) {
        setBillPreview(initialData.uploadedBill);
      }
    }
  }, [initialData, isEdit]);

  const fetchAvailableExpenseTypes = async () => {
    try {
      setExpenseTypesLoading(true);
      const expenseTypes = await ExpenseTypeService.getAllExpenseTypes();
      setAvailableExpenseTypes(expenseTypes.filter(type => type.isActive));
      setFilteredExpenseTypes(expenseTypes.filter(type => type.isActive));
    } catch (error) {
      console.error('Error fetching expense types:', error);
      if (error instanceof Error && error.message.includes('401')) {
        setError('Authentication failed. Please log in again.');
        return;
      }
      setError('Failed to load available expense types');
    } finally {
      setExpenseTypesLoading(false);
    }
  };

  const fetchAvailableBuses = async () => {
    if (!user) return;

    try {
      setBusesLoading(true);
      const buses = await BusService.getAllBuses();
      setAvailableBuses(buses);
      setFilteredBuses(buses);
    } catch (error) {
      console.error('Error fetching buses:', error);
      if (error instanceof Error && error.message.includes('401')) {
        setError('Authentication failed. Please log in again.');
        return;
      }
      setError('Failed to load buses');
    } finally {
      setBusesLoading(false);
    }
  };

  // Filter expense types based on selected bus
  useEffect(() => {
    if (selectedBusId) {
      const filtered = availableExpenseTypes.filter(expenseType => 
        expenseType.busId === selectedBusId
      );
      setFilteredExpenseTypes(filtered);
      
      // Reset expense type selection if current selection doesn't match the bus
      const currentExpenseType = availableExpenseTypes.find(et => et._id === formData.expenseTypeId);
      if (currentExpenseType && currentExpenseType.busId !== selectedBusId) {
        setFormData(prev => ({ ...prev, expenseTypeId: '' }));
      }
    } else {
      setFilteredExpenseTypes(availableExpenseTypes);
    }
  }, [selectedBusId, availableExpenseTypes, formData.expenseTypeId]);

  // Filter buses based on search term
  useEffect(() => {
    if (busSearchTerm) {
      const filtered = availableBuses.filter(bus =>
        bus.busNumber.toLowerCase().includes(busSearchTerm.toLowerCase())
      );
      setFilteredBuses(filtered);
    } else {
      setFilteredBuses(availableBuses);
    }
  }, [busSearchTerm, availableBuses]);

  // Handle bus selection
  const handleBusSelect = (bus: Bus) => {
    setSelectedBusId(bus._id);
    setBusSearchTerm(bus.busNumber);
    setShowBusSuggestions(false);
    setSelectedBusIndex(-1);
  };

  // Handle bus keyboard navigation
  const handleBusKeyDown = (e: React.KeyboardEvent) => {
    if (!showBusSuggestions || filteredBuses.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedBusIndex(prev => 
          prev < filteredBuses.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedBusIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedBusIndex >= 0) {
          handleBusSelect(filteredBuses[selectedBusIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowBusSuggestions(false);
        setSelectedBusIndex(-1);
        break;
    }
  };

  // Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBillFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setBillPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove uploaded file
  const removeFile = () => {
    setBillFile(null);
    setBillPreview('');
    setFormData(prev => ({ ...prev, uploadedBill: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!selectedBusId) {
      setError('Please select a bus');
      setIsSubmitting(false);
      return;
    }

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
      let billUrl = formData.uploadedBill;

      // If there's a file to upload, handle it here
      // Note: In a real implementation, you would upload the file to your server/cloud storage
      // and get back a URL. For now, we'll use the preview URL or existing URL
      if (billFile && billPreview) {
        // In a real app, you would upload to your server here:
        // billUrl = await uploadFile(billFile);
        billUrl = billPreview; // Using preview for now
      }

      const submitData = {
        ...formData,
        uploadedBill: billUrl,
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
      if (error?.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
      } else {
        const errorMessage = error?.response?.data?.message || error.message || `Failed to ${isEdit ? 'update' : 'create'} expense transaction`;
        setError(errorMessage);
      }
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
                  {/* Bus Number Field */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bus Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={busSearchTerm}
                        onChange={(e) => {
                          setBusSearchTerm(e.target.value);
                          setShowBusSuggestions(true);
                          setSelectedBusIndex(-1);
                        }}
                        onKeyDown={handleBusKeyDown}
                        onFocus={() => setShowBusSuggestions(true)}
                        onBlur={() => {
                          // Delay hiding suggestions to allow for click
                          setTimeout(() => setShowBusSuggestions(false), 200);
                        }}
                        placeholder="Type bus number..."
                        required
                        className="w-full border-green-300 focus:ring-green-500 focus:border-green-500"
                      />
                      
                      {/* Loading indicator for buses */}
                      {busesLoading && (
                        <div className="absolute right-3 top-2">
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-green-600 border-t-transparent"></div>
                        </div>
                      )}
                    </div>

                    {/* Bus suggestions dropdown */}
                    {showBusSuggestions && filteredBuses.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-green-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredBuses.map((bus, index) => (
                          <div
                            key={bus._id}
                            className={`px-4 py-2 cursor-pointer transition-colors ${
                              index === selectedBusIndex
                                ? 'bg-green-50 text-green-800'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleBusSelect(bus)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{bus.busNumber}</div>
                                <div className="text-sm text-gray-500">
                                  {bus.busName} • Capacity: {bus.seatCapacity}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  bus.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : bus.status === 'inactive'
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {bus.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* No buses found */}
                    {showBusSuggestions && busSearchTerm && filteredBuses.length === 0 && !busesLoading && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                        No buses found matching "{busSearchTerm}"
                      </div>
                    )}
                  </div>

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
                        disabled={!selectedBusId}
                        className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors bg-white disabled:bg-gray-50 disabled:text-gray-500"
                      >
                        <option value="">
                          {selectedBusId ? "Select an expense type" : "Select a bus first"}
                        </option>
                        {filteredExpenseTypes.map((type) => (
                          <option key={type._id} value={type._id}>
                            {type.expenseName} - {type.description}
                          </option>
                        ))}
                      </select>
                    )}
                    {selectedBusId && filteredExpenseTypes.length === 0 && (
                      <p className="text-sm text-amber-600 mt-1">
                        No expense types found for the selected bus.
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-green-600 font-medium">Rs.</span>
                      <Input
                        type="number"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                        className="w-full pl-12 border-green-300 focus:ring-green-500 focus:border-green-500"
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
                      Receipt/Bill Upload
                    </label>
                    <div className="space-y-3">
                      {/* File input */}
                      <div className="flex items-center space-x-3">
                        <label className="relative cursor-pointer bg-white border border-blue-300 rounded-lg px-4 py-2 hover:bg-blue-50 transition-colors">
                          <span className="text-sm font-medium text-blue-600">Choose File</span>
                          <input
                            type="file"
                            accept="image/*,.pdf"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </label>
                        <span className="text-sm text-gray-500">
                          {billFile ? billFile.name : 'No file selected'}
                        </span>
                      </div>

                      {/* Preview */}
                      {billPreview && (
                        <div className="relative bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Preview:</span>
                            <button
                              type="button"
                              onClick={removeFile}
                              className="text-red-600 hover:text-red-800 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                          {billPreview.startsWith('data:image') ? (
                            <img
                              src={billPreview}
                              alt="Receipt preview"
                              className="max-w-full max-h-40 object-contain rounded-lg"
                            />
                          ) : (
                            <div className="flex items-center space-x-2 text-gray-600">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>Document uploaded</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Or manual URL input */}
                      <div className="border-t border-gray-200 pt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Or enter URL manually:
                        </label>
                        <Input
                          type="url"
                          value={formData.uploadedBill}
                          onChange={(e) => setFormData({ ...formData, uploadedBill: e.target.value })}
                          placeholder="https://example.com/receipt.pdf"
                          className="w-full border-blue-300 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Upload an image or PDF of the receipt/bill, or provide a URL</p>
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
                className="px-8 py-3 bg-red-100 text-red-700 hover:bg-red-200 border border-red-200 hover:border-red-300 rounded-xl font-medium transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || expenseTypesLoading || !selectedBusId}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
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
