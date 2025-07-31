'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { OwnerExpenseTypeService, OwnerExpenseType } from '@/services/ownerExpense.service';
import { BusService, Bus } from '@/services/bus.service';
import { useAuth } from '@/context/AuthContext';

export default function EditOwnerExpenseTypePage() {
  const [formData, setFormData] = useState({
    expenseName: '',
    description: '',
    busId: '',
    isActive: true
  });
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastConfig, setToastConfig] = useState({
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: ''
  });

  // Autocomplete states for bus selection
  const [busSearchQuery, setBusSearchQuery] = useState('');
  const [showBusDropdown, setShowBusDropdown] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);

  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const id = params.id as string;

  useEffect(() => {
    if (user?.id && id) {
      Promise.all([fetchExpenseType(), fetchOwnerBuses()]);
    }
  }, [user, id]);

  // Filter buses based on search query
  useEffect(() => {
    if (buses.length > 0) {
      if (busSearchQuery.trim() === '') {
        setFilteredBuses(buses);
      } else {
        const filtered = buses.filter(bus =>
          bus.busNumber.toLowerCase().includes(busSearchQuery.toLowerCase()) ||
          bus.busName.toLowerCase().includes(busSearchQuery.toLowerCase())
        );
        setFilteredBuses(filtered);
      }
    }
  }, [buses, busSearchQuery]);

  // Set initial bus search query when form data and buses are loaded
  useEffect(() => {
    if (formData.busId && buses.length > 0) {
      const currentBus = buses.find(bus => bus._id === formData.busId);
      if (currentBus) {
        setSelectedBus(currentBus);
        setBusSearchQuery(`${currentBus.busNumber} - ${currentBus.busName}`);
      }
    }
  }, [formData.busId, buses]);

  const fetchExpenseType = async () => {
    try {
      const expenseType = await OwnerExpenseTypeService.getExpenseTypeById(id);
      setFormData({
        expenseName: expenseType.expenseName,
        description: expenseType.description || '',
        busId: typeof expenseType.busId === 'string' ? expenseType.busId : expenseType.busId._id,
        isActive: expenseType.isActive
      });
    } catch (err: any) {
      console.error('Error fetching expense type:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Failed to fetch expense type details.';
      setError(errorMessage);
    }
  };

  const fetchOwnerBuses = async () => {
    try {
      const busData = await BusService.getBusesByOwner(user!.id);
      setBuses(busData);
    } catch (err: any) {
      console.error('Error fetching buses:', err);
      setToastConfig({
        type: 'warning',
        title: 'Warning',
        message: 'Failed to load your buses. Please refresh the page.'
      });
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle bus search input changes
  const handleBusSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBusSearchQuery(value);
    setShowBusDropdown(true);
    
    // Clear selection if user is typing
    if (selectedBus && value !== `${selectedBus.busNumber} - ${selectedBus.busName}`) {
      setSelectedBus(null);
      setFormData(prev => ({ ...prev, busId: '' }));
    }
  };

  // Handle bus selection from dropdown
  const handleBusSelect = (bus: Bus) => {
    setSelectedBus(bus);
    setBusSearchQuery(`${bus.busNumber} - ${bus.busName}`);
    setShowBusDropdown(false);
    setFormData(prev => ({ ...prev, busId: bus._id }));
  };

  // Handle input focus
  const handleBusInputFocus = () => {
    setShowBusDropdown(true);
  };

  // Handle clicking outside to close dropdown
  const handleBusInputBlur = () => {
    // Delay hiding dropdown to allow clicking on items
    setTimeout(() => {
      setShowBusDropdown(false);
    }, 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.expenseName.trim()) {
      setToastConfig({
        type: 'error',
        title: 'Validation Error',
        message: 'Expense name is required.'
      });
      setShowToast(true);
      return;
    }

    if (!formData.busId || !selectedBus) {
      setToastConfig({
        type: 'error',
        title: 'Validation Error',
        message: 'Please select a bus from the dropdown for this expense type.'
      });
      setShowToast(true);
      return;
    }

    try {
      setSubmitting(true);
      
      await OwnerExpenseTypeService.updateExpenseType(id, {
        expenseName: formData.expenseName.trim(),
        description: formData.description.trim() || undefined,
        busId: formData.busId,
        isActive: formData.isActive
      });

      setToastConfig({
        type: 'success',
        title: 'Expense Type Updated',
        message: `${formData.expenseName} has been successfully updated.`
      });
      setShowToast(true);

      // Redirect to detail page after successful update
      setTimeout(() => {
        router.push(`/bus-owner/expenses/types/${id}`);
      }, 1500);

    } catch (err: any) {
      console.error('Error updating expense type:', err);
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Failed to update expense type. Please try again.';
      
      setToastConfig({
        type: 'error',
        title: 'Update Failed',
        message: errorMessage
      });
      setShowToast(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
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
        <div className="max-w-4xl mx-auto">
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
                      onClick={() => router.push(`/bus-owner/expenses/types/${id}`)}
                      className="ml-1 text-sm font-medium text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      {formData.expenseName || 'Expense Type'}
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
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Expense Type</h1>
                  <p className="text-gray-600">Update your expense type details</p>
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

        {/* Edit Form */}
        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl p-8 border border-white/50">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Expense Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="expenseName" className="block text-sm font-semibold text-gray-700 mb-3">
                    Expense Name *
                  </label>
                  <input
                    type="text"
                    id="expenseName"
                    name="expenseName"
                    value={formData.expenseName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80 backdrop-blur-sm"
                    placeholder="Enter expense type name"
                    required
                  />
                </div>

                <div className="relative">
                  <label htmlFor="busSearch" className="block text-sm font-semibold text-gray-700 mb-3">
                    Associated Bus *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="busSearch"
                      name="busSearch"
                      value={busSearchQuery}
                      onChange={handleBusSearchChange}
                      onFocus={handleBusInputFocus}
                      onBlur={handleBusInputBlur}
                      placeholder="Type bus number or name to search..."
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
                    {showBusDropdown && filteredBuses.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {filteredBuses.map((bus) => (
                          <div
                            key={bus._id}
                            onClick={() => handleBusSelect(bus)}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-medium text-gray-900">
                                  {bus.busNumber} - {bus.busName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {bus.seatCapacity} seats
                                </div>
                              </div>
                              {selectedBus?._id === bus._id && (
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
                    {showBusDropdown && busSearchQuery.trim() !== '' && filteredBuses.length === 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg">
                        <div className="px-4 py-3 text-gray-500 text-center">
                          No buses found matching "{busSearchQuery}"
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Type bus number or name to search and select the associated bus
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-3">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white/80 backdrop-blur-sm resize-none"
                  placeholder="Provide details about this expense type (optional)"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <div className="flex items-center mb-6">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Status Settings</h2>
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label htmlFor="isActive" className="ml-4 flex items-center">
                    <span className="text-lg font-semibold text-gray-900">Active Status</span>
                    <span className="ml-3 text-sm text-gray-600">
                      {formData.isActive ? 'This expense type is currently active and available for use' : 'This expense type is inactive and cannot be used for new transactions'}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Form Actions */}
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
                    Update Expense Type
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
