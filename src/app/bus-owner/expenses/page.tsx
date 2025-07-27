'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { OwnerExpenseTypeService, OwnerExpenseTransactionService, OwnerExpenseType, OwnerExpenseTransaction } from '@/services/ownerExpense.service';
import { BusService, Bus } from '@/services/bus.service';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { useAuth } from '@/context/AuthContext';

export default function OwnerExpensesPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'types' | 'transactions'>('overview');
  const [expenseTypes, setExpenseTypes] = useState<OwnerExpenseType[]>([]);
  const [expenseTransactions, setExpenseTransactions] = useState<OwnerExpenseTransaction[]>([]);
  const [ownerBuses, setOwnerBuses] = useState<Bus[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string>('');
  const [busSearchTerm, setBusSearchTerm] = useState<string>('');
  const [filteredBuses, setFilteredBuses] = useState<Bus[]>([]);
  const [showBusSuggestions, setShowBusSuggestions] = useState(false);
  const [selectedBusIndex, setSelectedBusIndex] = useState(-1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  
  // Confirmation Modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmModalConfig, setConfirmModalConfig] = useState({
    title: '',
    message: '',
    confirmText: '',
    onConfirm: () => {},
    isLoading: false
  });
  
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

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      const [typesData, transactionsData, busesData] = await Promise.all([
        OwnerExpenseTypeService.getOwnerExpenseTypes(),
        OwnerExpenseTransactionService.getOwnerExpenseTransactions({ limit: 50 }),
        BusService.getBusesByOwner(user!.id)
      ]);
      setExpenseTypes(typesData);
      setExpenseTransactions(transactionsData);
      setOwnerBuses(busesData);
      setFilteredBuses(busesData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch your expense data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpenseType = async (typeId: string) => {
    const expenseTypeToDelete = expenseTypes.find(type => type._id === typeId);
    const expenseTypeName = expenseTypeToDelete?.expenseName || 'expense type';
    
    setConfirmModalConfig({
      title: 'Delete Expense Type Permanently?',
      message: `Are you sure you want to delete the expense type "${expenseTypeName}"? This action cannot be undone and will also remove all associated transactions.`,
      confirmText: 'Delete Permanently',
      onConfirm: () => confirmDeleteExpenseType(typeId, expenseTypeName),
      isLoading: false
    });
    setShowConfirmModal(true);
  };

  const confirmDeleteExpenseType = async (typeId: string, expenseTypeName: string) => {
    try {
      setConfirmModalConfig(prev => ({ ...prev, isLoading: true }));
      
      await OwnerExpenseTypeService.deleteExpenseType(typeId);
      await fetchOwnerData();
      
      setToastConfig({
        type: 'success',
        title: 'Expense Type Deleted',
        message: `${expenseTypeName} expense type has been permanently removed from your account.`
      });
      setShowToast(true);
      setShowConfirmModal(false);
      
    } catch (err) {
      console.error('Error deleting expense type:', err);
      
      setToastConfig({
        type: 'error',
        title: 'Delete Failed',
        message: `Unable to delete the ${expenseTypeName} expense type. Please check your connection and try again.`
      });
      setShowToast(true);
      setShowConfirmModal(false);
      setError('Failed to delete expense type. Please try again.');
    } finally {
      setConfirmModalConfig(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    const transactionToDelete = expenseTransactions.find(transaction => transaction._id === transactionId);
    const amount = transactionToDelete?.amount || 0;
    const expenseTypeId = typeof transactionToDelete?.expenseTypeId === 'string' 
      ? transactionToDelete?.expenseTypeId 
      : transactionToDelete?.expenseTypeId?._id;
    const expenseType = expenseTypes.find(type => type._id === expenseTypeId);
    const expenseTypeName = expenseType?.expenseName || 'Unknown';
    
    setConfirmModalConfig({
      title: 'Delete Transaction Permanently?',
      message: `Are you sure you want to delete this ${expenseTypeName} transaction worth Rs. ${amount.toLocaleString()}? This action cannot be undone.`,
      confirmText: 'Delete Permanently',
      onConfirm: () => confirmDeleteTransaction(transactionId, expenseTypeName, amount),
      isLoading: false
    });
    setShowConfirmModal(true);
  };

  const confirmDeleteTransaction = async (transactionId: string, expenseTypeName: string, amount: number) => {
    try {
      setConfirmModalConfig(prev => ({ ...prev, isLoading: true }));
      
      await OwnerExpenseTransactionService.deleteExpenseTransaction(transactionId);
      await fetchOwnerData();
      
      setToastConfig({
        type: 'success',
        title: 'Transaction Deleted',
        message: `${expenseTypeName} transaction worth Rs. ${amount.toLocaleString()} has been permanently removed from your records.`
      });
      setShowToast(true);
      setShowConfirmModal(false);
      
    } catch (err) {
      console.error('Error deleting transaction:', err);
      
      setToastConfig({
        type: 'error',
        title: 'Delete Failed',
        message: `Unable to delete the ${expenseTypeName} transaction. Please check your connection and try again.`
      });
      setShowToast(true);
      setShowConfirmModal(false);
      setError('Failed to delete transaction. Please try again.');
    } finally {
      setConfirmModalConfig(prev => ({ ...prev, isLoading: false }));
    }
  };

  const getTotalExpenses = () => {
    return expenseTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  };

  const getExpenseTypeDisplay = (expenseTypeId: any) => {
    if (typeof expenseTypeId === 'object' && expenseTypeId && expenseTypeId.expenseName) {
      return expenseTypeId.expenseName;
    }
    const expenseType = expenseTypes.find(type => type._id === expenseTypeId);
    return expenseType?.expenseName || 'Unknown Expense Type';
  };

  const handleBusSelect = (bus: Bus) => {
    setSelectedBusId(bus._id);
    setBusSearchTerm(bus.busNumber);
    setShowBusSuggestions(false);
    setSelectedBusIndex(-1);
  };

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

  const clearBusSelection = () => {
    setSelectedBusId('');
    setBusSearchTerm('');
    setShowBusSuggestions(false);
    setSelectedBusIndex(-1);
  };

  // Filter buses based on search term
  useEffect(() => {
    if (busSearchTerm) {
      const filtered = ownerBuses.filter(bus =>
        bus.busNumber.toLowerCase().includes(busSearchTerm.toLowerCase())
      );
      setFilteredBuses(filtered);
    } else {
      setFilteredBuses(ownerBuses);
    }
  }, [busSearchTerm, ownerBuses]);

  // Get filtered data based on selected bus
  const getFilteredExpenseTypes = () => {
    if (!selectedBusId) return [];
    return expenseTypes.filter(type => {
      const busId = typeof type.busId === 'string' ? type.busId : type.busId?._id;
      return busId === selectedBusId;
    });
  };

  const getFilteredTransactions = () => {
    if (!selectedBusId) return [];
    const busExpenseTypes = getFilteredExpenseTypes();
    const busExpenseTypeIds = busExpenseTypes.map(type => type._id);
    
    return expenseTransactions.filter(transaction => {
      const expenseTypeId = typeof transaction.expenseTypeId === 'string' 
        ? transaction.expenseTypeId 
        : transaction.expenseTypeId?._id;
      return busExpenseTypeIds.includes(expenseTypeId || '');
    });
  };

  const getFilteredTotalExpenses = () => {
    const filteredTransactions = getFilteredTransactions();
    return filteredTransactions.reduce((total, transaction) => total + transaction.amount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading your expenses...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-white shadow-lg rounded-2xl p-6 sm:p-8 border border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 sm:p-4 rounded-2xl mr-4 sm:mr-6">
                  <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Expenses</h1>
                  <p className="text-gray-600 text-sm sm:text-base">Track and manage expenses for your buses</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <Button 
                  onClick={() => router.push('/bus-owner/expenses/types/create')}
                  variant="secondary"
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 hover:from-blue-100 hover:to-indigo-100 border-blue-200 w-full sm:w-auto"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Expense Type
                </Button>
                <Button 
                  onClick={() => router.push('/bus-owner/expenses/transactions/create')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all duration-200 w-full sm:w-auto"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Transaction
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="bg-white shadow-lg rounded-2xl p-1 sm:p-2 border border-gray-200">
            <div className="flex flex-col sm:flex-row sm:space-x-1 space-y-1 sm:space-y-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 flex items-center justify-center px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="hidden sm:inline">Overview</span>
                <span className="sm:hidden">Overview</span>
              </button>
              <button
                onClick={() => setActiveTab('types')}
                className={`flex-1 flex items-center justify-center px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
                  activeTab === 'types'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span className="hidden sm:inline">Expense Types ({expenseTypes.length})</span>
                <span className="sm:hidden">Types ({expenseTypes.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('transactions')}
                className={`flex-1 flex items-center justify-center px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
                  activeTab === 'transactions'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
                }`}
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="hidden sm:inline">Transactions ({expenseTransactions.length})</span>
                <span className="sm:hidden">Trans ({expenseTransactions.length})</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Bus Selection */}
            <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                <h3 className="text-lg font-semibold text-gray-900">Select Bus for Overview</h3>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
                  <div className="relative flex-1 lg:flex-none">
                    <input
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
                        setTimeout(() => setShowBusSuggestions(false), 200);
                      }}
                      placeholder="Type bus number..."
                      className="w-full lg:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />

                    {/* Bus suggestions dropdown */}
                    {showBusSuggestions && filteredBuses.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredBuses.map((bus, index) => (
                          <div
                            key={bus._id}
                            className={`px-4 py-2 cursor-pointer transition-colors ${
                              index === selectedBusIndex
                                ? 'bg-blue-50 text-blue-800'
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
                                    : 'bg-gray-100 text-gray-800'
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
                    {showBusSuggestions && busSearchTerm && filteredBuses.length === 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
                        No buses found matching "{busSearchTerm}"
                      </div>
                    )}
                  </div>

                  {selectedBusId && (
                    <button
                      onClick={clearBusSelection}
                      className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors"
                    >
                      Clear Selection
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Statistics Cards - Show only when bus is selected */}
            {selectedBusId ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-2 sm:p-3 rounded-xl">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Total Expenses</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">Rs. {getFilteredTotalExpenses().toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-xl">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Transactions</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">{getFilteredTransactions().length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-2 sm:p-3 rounded-xl">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Expense Types</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">{getFilteredExpenseTypes().length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center">
                    <div className="bg-orange-100 p-2 sm:p-3 rounded-xl">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-3 sm:ml-4">
                      <p className="text-xs sm:text-sm font-medium text-gray-500">Average</p>
                      <p className="text-lg sm:text-2xl font-bold text-gray-900">
                        Rs. {getFilteredTransactions().length > 0 ? (getFilteredTotalExpenses() / getFilteredTransactions().length).toFixed(2) : '0.00'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-12 text-center">
                <div className="bg-gray-100 p-4 rounded-2xl mx-auto w-fit mb-4">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a Bus to View Overview</h3>
                <p className="text-gray-600">Choose one of your buses from the dropdown above to see detailed expense statistics and recent transactions.</p>
              </div>
            )}

            {/* Recent Transactions - Show only when bus is selected */}
            {selectedBusId && (
              <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Recent Transactions for {busSearchTerm}</h3>
                  <Button
                    onClick={() => setActiveTab('transactions')}
                    variant="outline"
                    className="text-blue-600 border-blue-200 hover:bg-blue-50"
                  >
                    View All
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expense Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredTransactions().slice(0, 5).map((transaction) => (
                        <tr key={transaction._id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getExpenseTypeDisplay(transaction.expenseTypeId)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            Rs. {transaction.amount.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                            {transaction.notes || 'No notes'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Expense Types Tab */}
        {activeTab === 'types' && (
          <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center space-y-4 xl:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full xl:w-auto gap-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Your Expense Types</h3>
                  
                  {/* Enhanced View Toggle Buttons */}
                  {expenseTypes.length > 0 && (
                    <div className="relative">
                      <div className="flex bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-1.5 shadow-sm">
                        <button
                          onClick={() => setViewMode('table')}
                          className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 transform ${
                            viewMode === 'table'
                              ? 'bg-white text-blue-700 shadow-lg scale-105 border border-blue-200'
                              : 'text-blue-600 hover:text-blue-800 hover:bg-white/50'
                          }`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z"/>
                          </svg>
                          Table
                        </button>
                        <button
                          onClick={() => setViewMode('card')}
                          className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 transform ${
                            viewMode === 'card'
                              ? 'bg-white text-blue-700 shadow-lg scale-105 border border-blue-200'
                              : 'text-blue-600 hover:text-blue-800 hover:bg-white/50'
                          }`}
                        >
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h8v8h-8v-8zm2 2v4h4v-4h-4z"/>
                          </svg>
                          Cards
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full xl:w-auto">
                  {/* Bus selection */}
                  <div className="relative">
                    <input
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
                        setTimeout(() => setShowBusSuggestions(false), 200);
                      }}
                      placeholder="Filter by bus number..."
                      className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />

                    {/* Bus suggestions dropdown */}
                    {showBusSuggestions && filteredBuses.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredBuses.map((bus, index) => (
                          <div
                            key={bus._id}
                            className={`px-4 py-2 cursor-pointer transition-colors ${
                              index === selectedBusIndex
                                ? 'bg-blue-50 text-blue-800'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleBusSelect(bus)}
                          >
                            <div className="font-medium text-gray-900">{bus.busNumber}</div>
                            <div className="text-sm text-gray-500">{bus.busName}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedBusId && (
                      <button
                        onClick={clearBusSelection}
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Search expense types..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <Button
                    onClick={fetchOwnerData}
                    variant="outline"
                    className="hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
            
            {viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expense Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Bus
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(selectedBusId ? getFilteredExpenseTypes() : expenseTypes)
                      .filter(type => 
                        type.expenseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        type.description.toLowerCase().includes(searchTerm.toLowerCase())
                      ).map((type) => (
                      <tr key={type._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{type.expenseName}</div>
                            <div className="text-sm text-gray-500">{type.description}</div>
                            <div className="sm:hidden text-xs text-gray-400 mt-1">
                              Bus: {typeof type.busId === 'object' && type.busId ? type.busId.busNumber : 'N/A'}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                          {typeof type.busId === 'object' && type.busId ? type.busId.busNumber : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex flex-col sm:flex-row justify-end space-y-1 sm:space-y-0 sm:space-x-2">
                            <button
                              onClick={() => router.push(`/bus-owner/expenses/types/${type._id}`)}
                              className="group relative p-2 sm:p-3 text-gray-500 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                              title="View Details"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => router.push(`/bus-owner/expenses/types/${type._id}/edit`)}
                              className="group relative p-2 sm:p-3 text-gray-500 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-100 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                              title="Edit Type"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteExpenseType(type._id)}
                              className="group relative p-2 sm:p-3 text-gray-500 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-100 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                              title="Delete Type"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {(selectedBusId ? getFilteredExpenseTypes() : expenseTypes)
                  .filter(type => 
                    type.expenseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    type.description.toLowerCase().includes(searchTerm.toLowerCase())
                  ).map((type) => (
                  <div key={type._id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🏷️</span>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {type.expenseName}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-blue-700">Bus Number</span>
                          <span className="font-bold text-blue-900">
                            {typeof type.busId === 'object' && type.busId ? type.busId.busNumber : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => router.push(`/bus-owner/expenses/types/${type._id}`)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => router.push(`/bus-owner/expenses/types/${type._id}/edit`)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteExpenseType(type._id)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center space-y-4 xl:space-y-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full xl:w-auto gap-4">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Your Expense Transactions</h3>
                  
                  {/* Enhanced View Toggle Buttons */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-1 rounded-lg border border-blue-200 shadow-sm">
                    <div className="flex">
                      <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 transform hover:scale-105 ${
                          viewMode === 'table'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                            : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                        }`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 6h18m-9 8h9" />
                        </svg>
                        Table
                      </button>
                      <button
                        onClick={() => setViewMode('card')}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-300 transform hover:scale-105 ${
                          viewMode === 'card'
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                            : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                        }`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
                        </svg>
                        Cards
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full xl:w-auto">
                  {/* Bus selection */}
                  <div className="relative">
                    <input
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
                        setTimeout(() => setShowBusSuggestions(false), 200);
                      }}
                      placeholder="Filter by bus number..."
                      className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />

                    {/* Bus suggestions dropdown */}
                    {showBusSuggestions && filteredBuses.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredBuses.map((bus, index) => (
                          <div
                            key={bus._id}
                            className={`px-4 py-2 cursor-pointer transition-colors ${
                              index === selectedBusIndex
                                ? 'bg-blue-50 text-blue-800'
                                : 'hover:bg-gray-50'
                            }`}
                            onClick={() => handleBusSelect(bus)}
                          >
                            <div className="font-medium text-gray-900">{bus.busNumber}</div>
                            <div className="text-sm text-gray-500">{bus.busName}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {selectedBusId && (
                      <button
                        onClick={clearBusSelection}
                        className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <Button
                    onClick={fetchOwnerData}
                    variant="outline"
                    className="hover:bg-gray-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
            
            {viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                        Expense Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                        Notes
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(selectedBusId ? getFilteredTransactions() : expenseTransactions)
                      .filter(transaction => 
                        getExpenseTypeDisplay(transaction.expenseTypeId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (transaction.notes && transaction.notes.toLowerCase().includes(searchTerm.toLowerCase()))
                      ).map((transaction) => (
                      <tr key={transaction._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(transaction.date).toLocaleDateString()}
                          </div>
                          <div className="sm:hidden text-sm text-gray-500 mt-1">
                            {getExpenseTypeDisplay(transaction.expenseTypeId)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                          {getExpenseTypeDisplay(transaction.expenseTypeId)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-green-600">
                            Rs. {transaction.amount.toLocaleString()}
                          </div>
                          <div className="lg:hidden text-xs text-gray-500 mt-1 max-w-xs truncate">
                            {transaction.notes || 'No notes'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate hidden lg:table-cell">
                          {transaction.notes || 'No notes'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex flex-col sm:flex-row justify-end space-y-1 sm:space-y-0 sm:space-x-2">
                            <button
                              onClick={() => router.push(`/bus-owner/expenses/transactions/${transaction._id}`)}
                              className="group relative p-2 sm:p-3 text-gray-500 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                              title="View Details"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => router.push(`/bus-owner/expenses/transactions/${transaction._id}/edit`)}
                              className="group relative p-2 sm:p-3 text-gray-500 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-100 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                              title="Edit Transaction"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(transaction._id)}
                              className="group relative p-2 sm:p-3 text-gray-500 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-100 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                              title="Delete Transaction"
                            >
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {(selectedBusId ? getFilteredTransactions() : expenseTransactions)
                  .filter(transaction => 
                    getExpenseTypeDisplay(transaction.expenseTypeId).toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (transaction.notes && transaction.notes.toLowerCase().includes(searchTerm.toLowerCase()))
                  ).map((transaction) => (
                  <div key={transaction._id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">💰</span>
                        <div>
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {getExpenseTypeDisplay(transaction.expenseTypeId)}
                          </h4>
                          <p className="text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-green-50 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-green-700">Amount</span>
                          <span className="font-bold text-green-900 text-lg">Rs. {transaction.amount.toLocaleString()}</span>
                        </div>
                      </div>

                      {transaction.notes && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <span className="text-sm font-medium text-gray-700 block mb-1">Notes:</span>
                          <p className="text-sm text-gray-600">{transaction.notes}</p>
                        </div>
                      )}

                      <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200">
                        <button
                          onClick={() => router.push(`/bus-owner/expenses/transactions/${transaction._id}`)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          View Details
                        </button>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => router.push(`/bus-owner/expenses/transactions/${transaction._id}/edit`)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(transaction._id)}
                            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {((activeTab === 'types' && expenseTypes.length === 0) || 
          (activeTab === 'transactions' && expenseTransactions.length === 0)) && (
          <div className="bg-white shadow-lg rounded-2xl p-12 text-center border border-gray-200">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No {activeTab === 'types' ? 'expense types' : 'transactions'} found
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'types' 
                ? 'Create your first expense type to categorize your expenses.' 
                : 'Add your first expense transaction to start tracking expenses.'
              }
            </p>
            <Button
              onClick={() => router.push(
                activeTab === 'types' 
                  ? '/bus-owner/expenses/types/create' 
                  : '/bus-owner/expenses/transactions/create'
              )}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add {activeTab === 'types' ? 'Expense Type' : 'Transaction'}
            </Button>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={confirmModalConfig.onConfirm}
          title={confirmModalConfig.title}
          message={confirmModalConfig.message}
          confirmText={confirmModalConfig.confirmText}
          cancelText="Cancel"
          type="danger"
          isLoading={confirmModalConfig.isLoading}
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
