'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import MonthlyFeeTable from '@/components/admin/MonthlyFeeTable';
import MonthlyFeeModal from '@/components/admin/MonthlyFeeModal';
import PaymentModal from '@/components/admin/PaymentModal';
import { MonthlyFeeService, MonthlyFee, CreateMonthlyFeeRequest, UpdateMonthlyFeeRequest } from '@/services/monthlyFee.service';
import { BusService, Bus } from '@/services/bus.service';

export default function MonthlyFeesPage() {
  const [monthlyFees, setMonthlyFees] = useState<MonthlyFee[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<MonthlyFee | null>(null);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBus, setFilterBus] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  
  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({ show: true, title, message, type });
  };

  const fetchMonthlyFees = async () => {
    try {
      setLoading(true);
      const response = await MonthlyFeeService.getAllMonthlyFees({
        page: 1,
        limit: 100
      });
      setMonthlyFees(response.data);
    } catch (error: any) {
      console.error('Error fetching monthly fees:', error);
      showToast('Error', 'Failed to fetch monthly fees. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
      const fetchedBuses = await BusService.getAllBuses();
      setBuses(fetchedBuses);
    } catch (error) {
      console.error('Error fetching buses:', error);
    }
  };

  useEffect(() => {
    fetchMonthlyFees();
    fetchBuses();
  }, []);

  const handleCreateFee = async (feeData: CreateMonthlyFeeRequest) => {
    try {
      setActionLoading(true);
      const newFee = await MonthlyFeeService.createMonthlyFee(feeData);
      setMonthlyFees(prev => [newFee, ...prev]);
      showToast('Success', 'Monthly fee created successfully', 'success');
    } catch (error: any) {
      console.error('Error creating monthly fee:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create monthly fee';
      showToast('Error', errorMessage, 'error');
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditFee = async (feeData: UpdateMonthlyFeeRequest) => {
    if (!selectedFee) return;
    
    try {
      setActionLoading(true);
      const updatedFee = await MonthlyFeeService.updateMonthlyFee(selectedFee._id, feeData);
      setMonthlyFees(prev => 
        prev.map(fee => fee._id === selectedFee._id ? updatedFee : fee)
      );
      showToast('Success', 'Monthly fee updated successfully', 'success');
    } catch (error: any) {
      console.error('Error updating monthly fee:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update monthly fee';
      showToast('Error', errorMessage, 'error');
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFee = async () => {
    if (!selectedFee) return;
    
    try {
      setActionLoading(true);
      await MonthlyFeeService.deleteMonthlyFee(selectedFee._id);
      setMonthlyFees(prev => prev.filter(fee => fee._id !== selectedFee._id));
      setShowDeleteModal(false);
      setSelectedFee(null);
      showToast('Success', 'Monthly fee deleted successfully', 'success');
    } catch (error: any) {
      console.error('Error deleting monthly fee:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete monthly fee';
      showToast('Error', errorMessage, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAsPaid = async (paidAmount: number, paymentDate: string) => {
    if (!selectedFee) return;
    
    try {
      setActionLoading(true);
      const updatedFee = await MonthlyFeeService.markAsPaid(selectedFee._id, paidAmount, paymentDate);
      setMonthlyFees(prev => 
        prev.map(fee => fee._id === selectedFee._id ? updatedFee : fee)
      );
      setShowPaymentModal(false);
      setSelectedFee(null);
      showToast('Success', 'Payment recorded successfully', 'success');
    } catch (error: any) {
      console.error('Error recording payment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to record payment';
      showToast('Error', errorMessage, 'error');
      throw error;
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateBill = async (fee: MonthlyFee) => {
    try {
      const blob = await MonthlyFeeService.generateBill(fee._id);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `monthly-fee-bill-${fee.busId.busNumber}-${fee.month}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showToast('Success', 'Bill generated and downloaded successfully', 'success');
    } catch (error: any) {
      console.error('Error generating bill:', error);
      const errorMessage = error.response?.data?.message || 'Failed to generate bill';
      showToast('Error', errorMessage, 'error');
    }
  };

  const openEditModal = (fee: MonthlyFee) => {
    setSelectedFee(fee);
    setShowEditModal(true);
  };

  const openDeleteModal = (fee: MonthlyFee) => {
    setSelectedFee(fee);
    setShowDeleteModal(true);
  };

  const openPaymentModal = (fee: MonthlyFee) => {
    setSelectedFee(fee);
    setShowPaymentModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowPaymentModal(false);
    setSelectedFee(null);
  };

  const handleRefresh = () => {
    fetchMonthlyFees();
    showToast('Info', 'Refreshing monthly fees...', 'info');
  };

  // Filter monthly fees based on search term and filters
  const filteredFees = monthlyFees.filter(fee => {
    const matchesSearch = searchTerm === '' || 
      fee.busId.busNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.busId.busName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fee.ownerId.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesBus = filterBus === '' || fee.busId._id === filterBus;
    const matchesStatus = filterStatus === '' || fee.status === filterStatus;
    const matchesMonth = filterMonth === '' || fee.month === filterMonth;
    
    return matchesSearch && matchesBus && matchesStatus && matchesMonth;
  });

  // Calculate stats
  const stats = {
    total: monthlyFees.length,
    paid: monthlyFees.filter(f => f.status === 'paid').length,
    unpaid: monthlyFees.filter(f => f.status === 'unpaid').length,
    partial: monthlyFees.filter(f => f.status === 'partial').length,
    totalAmount: monthlyFees.reduce((sum, f) => sum + f.amount, 0),
    totalPaid: monthlyFees.reduce((sum, f) => sum + f.paidAmount, 0)
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Monthly Fee Management</h1>
                <p className="text-gray-600 text-sm">
                  Track and manage monthly fees collected from bus owners
                </p>
              </div>
              <div className="text-3xl text-gray-300">
                💰
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Monthly Fees
                </h2>
                <p className="text-gray-600">
                  Manage bus monthly fees and payment tracking
                </p>
              </div>
              
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Refresh
                </Button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Monthly Fee
                </button>
              </div>
            </div>

            {/* Filters Section */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by bus or owner..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
                
                <select
                  value={filterBus}
                  onChange={(e) => setFilterBus(e.target.value)}
                  className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">All Buses</option>
                  {buses.map(bus => (
                    <option key={bus._id} value={bus._id}>
                      {bus.busNumber} - {bus.busName}
                    </option>
                  ))}
                </select>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="unpaid">Unpaid</option>
                </select>

                <input
                  type="month"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                  className="px-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                />
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Showing {filteredFees.length} of {monthlyFees.length} monthly fees
                </div>
                {(searchTerm || filterBus || filterStatus || filterMonth) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterBus('');
                      setFilterStatus('');
                      setFilterMonth('');
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all flex items-center gap-2 text-sm"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-sm text-blue-700 font-medium">Total Fees</div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
                <div className="text-sm text-green-700 font-medium">Paid</div>
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.partial}</div>
                <div className="text-sm text-yellow-700 font-medium">Partial</div>
              </div>
              
              <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-600">{stats.unpaid}</div>
                <div className="text-sm text-red-700 font-medium">Unpaid</div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-purple-600">{formatCurrency(stats.totalAmount)}</div>
                <div className="text-sm text-purple-700 font-medium">Total Amount</div>
              </div>
              
              <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-indigo-600">{formatCurrency(stats.totalPaid)}</div>
                <div className="text-sm text-indigo-700 font-medium">Total Collected</div>
              </div>
            </div>

            {/* Monthly Fees Table */}
            {filteredFees.length > 0 ? (
              <MonthlyFeeTable
                monthlyFees={filteredFees}
                loading={loading}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
                onMarkPaid={openPaymentModal}
                onGenerateBill={handleGenerateBill}
              />
            ) : !loading ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    {searchTerm || filterBus || filterStatus || filterMonth ? 'No matching fees found' : 'No monthly fees found'}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || filterBus || filterStatus || filterMonth
                      ? 'Try adjusting your search criteria or filters to find fees.'
                      : 'Get started by creating your first monthly fee entry.'
                    }
                  </p>
                  {!searchTerm && !filterBus && !filterStatus && !filterMonth && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 mx-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Monthly Fee
                    </button>
                  )}
                </div>
              </div>
            ) : null}

            {/* Create Monthly Fee Modal */}
            {showCreateModal && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    closeModals();
                  }
                }}
              >
                <div 
                  className="bg-white rounded-xl shadow-xl w-full max-w-4xl transform transition-all duration-300 ease-out scale-100 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MonthlyFeeModal
                    isOpen={showCreateModal}
                    onClose={closeModals}
                    onSave={handleCreateFee}
                    title="Create Monthly Fee"
                  />
                </div>
              </div>
            )}

            {/* Edit Monthly Fee Modal */}
            {showEditModal && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    closeModals();
                  }
                }}
              >
                <div 
                  className="bg-white rounded-xl shadow-xl w-full max-w-4xl transform transition-all duration-300 ease-out scale-100 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MonthlyFeeModal
                    isOpen={showEditModal}
                    onClose={closeModals}
                    onSave={handleEditFee}
                    monthlyFee={selectedFee}
                    title="Edit Monthly Fee"
                  />
                </div>
              </div>
            )}

            {/* Payment Modal */}
            <PaymentModal
              isOpen={showPaymentModal}
              onClose={closeModals}
              onConfirm={handleMarkAsPaid}
              monthlyFee={selectedFee}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
              isOpen={showDeleteModal}
              onClose={closeModals}
              onConfirm={handleDeleteFee}
              title="Delete Monthly Fee"
              message={`Are you sure you want to delete this monthly fee for "${selectedFee?.busId.busNumber}"? This action cannot be undone.`}
              confirmText="Delete"
              cancelText="Cancel"
              type="danger"
              isLoading={actionLoading}
            />

            {/* Toast Notifications */}
            <Toast
              isOpen={toast.show}
              onClose={() => setToast(prev => ({ ...prev, show: false }))}
              title={toast.title}
              message={toast.message}
              type={toast.type}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
