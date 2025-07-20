'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { OwnerExpenseTypeService, CreateOwnerExpenseTypeData } from '@/services/ownerExpense.service';
import { BusService, Bus } from '@/services/bus.service';
import { useAuth } from '@/context/AuthContext';

export default function CreateOwnerExpenseTypePage() {
  const [formData, setFormData] = useState<CreateOwnerExpenseTypeData>({
    busId: '',
    expenseName: '',
    description: '',
    isActive: true,
  });

  const [ownerBuses, setOwnerBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingBuses, setIsLoadingBuses] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
      fetchOwnerBuses();
    }
  }, [user]);

  const fetchOwnerBuses = async () => {
    try {
      setIsLoadingBuses(true);
      const buses = await BusService.getBusesByOwner(user!.id);
      setOwnerBuses(buses);
      setError(null);
    } catch (err) {
      setError('Failed to fetch your buses. Please try again later.');
      console.error('Error fetching owner buses:', err);
    } finally {
      setIsLoadingBuses(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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

  const validateForm = (): boolean => {
    if (!formData.busId) {
      setError('Please select a bus');
      return false;
    }
    if (!formData.expenseName.trim()) {
      setError('Please enter an expense name');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description');
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
      await OwnerExpenseTypeService.createExpenseType(formData);
      
      setToastConfig({
        type: 'success',
        title: 'Expense Type Created',
        message: `${formData.expenseName} expense type has been created successfully for your bus.`
      });
      setShowToast(true);

      // Wait a moment before redirecting
      setTimeout(() => {
        router.push('/bus-owner/expenses');
      }, 1500);

    } catch (err: any) {
      console.error('Error creating expense type:', err);
      
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Failed to create expense type. Please try again.';
      
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

  if (isLoadingBuses) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading your buses...</p>
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
                    <span className="ml-1 text-sm font-medium text-gray-900">Create Expense Type</span>
                  </div>
                </li>
              </ol>
            </nav>

            <div className="flex items-center">
              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-4 rounded-2xl mr-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Expense Type</h1>
                <p className="text-gray-600">Add a new expense category for one of your buses</p>
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

            {ownerBuses.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Buses Found</h3>
                <p className="text-gray-600 mb-6">You need to have at least one bus to create expense types. Please add a bus first.</p>
                <Button
                  onClick={() => router.push('/bus-owner/buses/create')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Add Your First Bus
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Bus Selection */}
                  <div className="md:col-span-2">
                    <label htmlFor="busId" className="block text-sm font-semibold text-gray-900 mb-3">
                      Select Bus <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="busId"
                      name="busId"
                      value={formData.busId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-gray-50 text-gray-900"
                    >
                      <option value="">Choose a bus...</option>
                      {ownerBuses.map((bus) => (
                        <option key={bus._id} value={bus._id}>
                          {bus.busNumber} - {bus.busName} ({bus.seatCapacity} seats)
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-sm text-gray-500">
                      Select the bus this expense type applies to
                    </p>
                  </div>

                  {/* Expense Name */}
                  <div>
                    <label htmlFor="expenseName" className="block text-sm font-semibold text-gray-900 mb-3">
                      Expense Type Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="expenseName"
                      name="expenseName"
                      value={formData.expenseName}
                      onChange={handleInputChange}
                      required
                      maxLength={100}
                      placeholder="e.g., Fuel, Maintenance, Insurance"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Enter a clear, descriptive name for this expense category
                    </p>
                  </div>

                  {/* Active Status */}
                  <div className="flex items-start space-x-3 pt-8">
                    <div className="flex items-center h-5">
                      <input
                        id="isActive"
                        name="isActive"
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                    <div className="text-sm">
                      <label htmlFor="isActive" className="font-medium text-gray-900">
                        Active Expense Type
                      </label>
                      <p className="text-gray-500">
                        Active expense types can be used for new transactions
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-3">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    maxLength={500}
                    placeholder="Describe what this expense type covers and any specific guidelines..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Provide details about what expenses fall under this category ({formData.description.length}/500 characters)
                  </p>
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
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200"
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
                        Create Expense Type
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
