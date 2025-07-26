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

  // New states for autocomplete functionality
  const [busSearchQuery, setBusSearchQuery] = useState('');
  const [showBusDropdown, setShowBusDropdown] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
  
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      fetchOwnerBuses();
    }
  }, [user]);

  // Filter buses based on search query
  useEffect(() => {
    if (ownerBuses.length > 0) {
      if (busSearchQuery.trim() === '') {
        setFilteredBuses(ownerBuses);
      } else {
        const filtered = ownerBuses.filter(bus =>
          bus.busNumber.toLowerCase().includes(busSearchQuery.toLowerCase()) ||
          bus.busName.toLowerCase().includes(busSearchQuery.toLowerCase())
        );
        setFilteredBuses(filtered);
      }
    }
  }, [ownerBuses, busSearchQuery]);

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

  const validateForm = (): boolean => {
    if (!formData.busId || !selectedBus) {
      setError('Please select a bus from the dropdown');
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-gradient-to-r from-blue-200 to-indigo-200 border-t-blue-600 mx-auto mb-6"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 opacity-20 animate-pulse"></div>
              </div>
              <div className="space-y-2">
                <p className="text-gray-700 text-xl font-semibold">Loading your buses...</p>
                <p className="text-gray-500 text-sm">Please wait while we fetch your bus information</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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
                    <span className="ml-1 text-sm font-medium text-gray-900">Create Expense Type</span>
                  </div>
                </li>
              </ol>
            </nav>

            <div className="flex items-center">
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-6 rounded-3xl shadow-lg">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
              <div className="ml-6">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Create New Expense Type</h1>
                <p className="text-gray-600 text-lg">Add a new expense category for one of your buses</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl border border-white/50 overflow-hidden">
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
              <div className="text-center py-16">
                <div className="relative">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-3xl w-24 h-24 mx-auto mb-6 shadow-lg">
                    <svg className="w-12 h-12 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Buses Found</h3>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">You need to have at least one bus to create expense types. Please add your first bus to get started.</p>
                <Button
                  onClick={() => router.push('/bus-owner/buses/create')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Your First Bus
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Bus Selection Section */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl mr-4">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Bus Selection</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-8">
                    {/* Bus Selection with Autocomplete */}
                    <div className="relative">
                      <label htmlFor="busSearch" className="block text-sm font-semibold text-gray-900 mb-3">
                        Select Bus <span className="text-red-500">*</span>
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white text-gray-900"
                          autoComplete="off"
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
                        Type bus number or name to search and select the bus this expense type applies to
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expense Information Section */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-3 rounded-xl mr-4">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Expense Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
                </div>

                {/* Description Section */}
                <div>
                  <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl mr-4">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Description</h2>
                  </div>

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
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
