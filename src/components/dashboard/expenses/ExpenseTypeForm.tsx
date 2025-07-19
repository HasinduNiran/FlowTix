'use client';

import React, { useState, useEffect } from 'react';
import { ExpenseType, CreateExpenseTypeData, UpdateExpenseTypeData, ExpenseTypeService } from '@/services/expense.service';
import { BusService, Bus } from '@/services/bus.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ExpenseTypeFormProps {
  initialData?: ExpenseType | null;
  isEdit?: boolean;
  onSuccess?: () => void;
}

export default function ExpenseTypeForm({ 
  initialData = null, 
  isEdit = false,
  onSuccess
}: ExpenseTypeFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    busId: '',
    expenseName: '',
    description: '',
    isActive: true
  });

  const [availableBuses, setAvailableBuses] = useState<Bus[]>([]);
  const [busesLoading, setBusesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busSearchTerm, setBusSearchTerm] = useState('');
  const [showBusSuggestions, setShowBusSuggestions] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchAvailableBuses();
  }, []);

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        busId: typeof initialData.busId === 'string' ? initialData.busId : initialData.busId._id,
        expenseName: initialData.expenseName,
        description: initialData.description,
        isActive: initialData.isActive
      });
    }
  }, [initialData, isEdit]);

  // Set bus search term when availableBuses loads and we have a selected busId
  useEffect(() => {
    if (formData.busId && availableBuses.length > 0) {
      const selectedBus = availableBuses.find(bus => bus._id === formData.busId);
      if (selectedBus) {
        setBusSearchTerm(selectedBus.busNumber);
      }
    }
  }, [formData.busId, availableBuses]);

  const fetchAvailableBuses = async () => {
    try {
      setBusesLoading(true);
      const buses = await BusService.getAllBuses();
      
      // Filter buses based on user role
      const filteredBuses = user?.role === 'super-admin' 
        ? buses.filter(bus => bus.status === 'active')
        : buses.filter(bus => bus.status === 'active' && bus.ownerId === user?.id);
      
      setAvailableBuses(filteredBuses);
    } catch (error) {
      console.error('Error fetching buses:', error);
      setError('Failed to load available buses');
    } finally {
      setBusesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.expenseName.trim()) {
      setError('Expense name is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.description.trim()) {
      setError('Description is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.busId) {
      setError('Please select a bus');
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEdit && initialData) {
        // Update existing expense type
        await ExpenseTypeService.updateExpenseType(initialData._id, formData as UpdateExpenseTypeData);
        setSuccess('Expense type updated successfully!');
      } else {
        // Create new expense type
        await ExpenseTypeService.createExpenseType(formData as CreateExpenseTypeData);
        setSuccess('Expense type created successfully!');
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
      const errorMessage = error?.response?.data?.message || error.message || `Failed to ${isEdit ? 'update' : 'create'} expense type`;
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEdit && initialData) {
      router.push(`/super-admin/expenses/types/${initialData._id}`);
    } else {
      router.push('/super-admin/expenses');
    }
  };

  const handleBackClick = () => {
    if (isEdit && initialData) {
      router.push(`/super-admin/expenses/types/${initialData._id}`);
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
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-2xl mr-6">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isEdit ? 'Edit Expense Type' : 'Add New Expense Type'}
                </h1>
                <p className="text-gray-600">
                  {isEdit ? 'Update expense type information and settings' : 'Create a new expense type for categorizing expenses'}
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
              {/* Basic Information Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-xl mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Expense Type Details</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Expense Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.expenseName}
                      onChange={(e) => setFormData({ ...formData, expenseName: e.target.value })}
                      placeholder="Enter expense name (e.g., Fuel, Maintenance, Insurance)"
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter detailed description of this expense type"
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors bg-white resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bus Assignment Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-xl mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Bus Assignment</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bus Number <span className="text-red-500">*</span>
                    </label>
                    {busesLoading ? (
                      <div className="flex items-center justify-center p-4 bg-white rounded-lg border border-blue-200">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-2"></div>
                        <span className="text-sm text-gray-600">Loading buses...</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          type="text"
                          value={busSearchTerm}
                          onChange={(e) => {
                            setBusSearchTerm(e.target.value);
                            setShowBusSuggestions(true);
                            // Clear selection if user types something different
                            if (formData.busId) {
                              const selectedBus = availableBuses.find(bus => bus._id === formData.busId);
                              if (selectedBus && e.target.value !== selectedBus.busNumber) {
                                setFormData({ ...formData, busId: '' });
                              }
                            }
                          }}
                          onFocus={() => setShowBusSuggestions(true)}
                          onBlur={() => {
                            // Delay hiding suggestions to allow clicking
                            setTimeout(() => setShowBusSuggestions(false), 200);
                          }}
                          placeholder="Type bus number (e.g., BUS-001)"
                          className="w-full"
                          required
                        />
                        
                        {showBusSuggestions && busSearchTerm && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {availableBuses
                              .filter(bus => 
                                bus.status === 'active' &&
                                bus.busNumber.toLowerCase().includes(busSearchTerm.toLowerCase())
                              )
                              .slice(0, 10) // Limit to 10 suggestions
                              .map((bus) => (
                                <div
                                  key={bus._id}
                                  className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                  onClick={() => {
                                    setBusSearchTerm(bus.busNumber);
                                    setFormData({ ...formData, busId: bus._id });
                                    setShowBusSuggestions(false);
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium text-gray-900">{bus.busNumber}</div>
                                      <div className="text-sm text-gray-500">{bus.busName}</div>
                                    </div>
                                    <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                      {bus.category}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            
                            {availableBuses
                              .filter(bus => 
                                bus.status === 'active' &&
                                bus.busNumber.toLowerCase().includes(busSearchTerm.toLowerCase())
                              ).length === 0 && (
                              <div className="px-4 py-3 text-gray-500 text-center">
                                No buses found matching "{busSearchTerm}"
                              </div>
                            )}
                          </div>
                        )}
                        
                        {formData.busId && (
                          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-center">
                              <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm text-green-700 font-medium">
                                Bus selected: {availableBuses.find(bus => bus._id === formData.busId)?.busNumber}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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

                  {/* Info Card */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Expense Type Guidelines:</p>
                        <ul className="text-xs space-y-1">
                          <li>• Choose descriptive names like "Fuel Costs", "Tire Replacement"</li>
                          <li>• Each type should be assigned to a specific bus</li>
                          <li>• Inactive types won't appear in transaction creation</li>
                        </ul>
                      </div>
                    </div>
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
                disabled={isSubmitting || busesLoading}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isEdit ? 'Update Expense Type' : 'Create Expense Type'}
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
