'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { MonthlyFeeService, MonthlyFee } from '@/services/monthlyFee.service';
import { BusService, Bus } from '@/services/bus.service';
import { Toast } from '@/components/ui/Toast';

export default function MonthlyFeesPage() {
  const { user } = useAuth();
  const [monthlyFees, setMonthlyFees] = useState<MonthlyFee[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [toast, setToast] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    currentPage: 1
  });

  const fetchMonthlyFees = async (page: number = 1) => {
    if (!user?.id) {
      setError('User information not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const filters: any = {
        page,
        limit: pagination.limit
      };
      
      if (selectedBus) filters.busId = selectedBus;
      if (selectedStatus) filters.status = selectedStatus;
      if (selectedMonth) filters.month = selectedMonth;
      
      console.log('Fetching monthly fees with filters:', filters);
      console.log('Owner ID:', user.id);
      
      const result = await MonthlyFeeService.getMonthlyFeesByOwner(user.id, filters);
      console.log('Monthly fees result:', result);
      
      setMonthlyFees(result.data || []);
      setPagination({
        page: result.currentPage || page,
        limit: pagination.limit,
        total: result.total || 0,
        totalPages: result.totalPages || 1,
        currentPage: result.currentPage || page
      });
    } catch (error: any) {
      console.error('Error fetching monthly fees:', error);
      setError(error.message || 'Failed to fetch monthly fees');
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Fetching buses for owner ID:', user.id);
      const ownerBuses = await BusService.getBusesByOwner(user.id);
      console.log('Owner buses:', ownerBuses);
      setBuses(ownerBuses);
    } catch (error: any) {
      console.error('Error fetching buses:', error);
      // Don't set error state for buses as monthly fees can still load
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [user?.id]);

  useEffect(() => {
    fetchMonthlyFees(1);
  }, [user?.id, selectedBus, selectedStatus, selectedMonth]);

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const handleDownloadBill = async (monthlyFee: MonthlyFee) => {
    if (monthlyFee.status !== 'paid') {
      showToast('Action Not Allowed', 'Bill can only be downloaded for paid fees', 'warning');
      return;
    }

    try {
      setDownloadingId(monthlyFee._id);
      const busNumber = typeof monthlyFee.busId === 'object' ? monthlyFee.busId.busNumber : 'Unknown';
      await MonthlyFeeService.downloadBill(monthlyFee._id, busNumber, monthlyFee.month);
      showToast('Download Successful', 'The bill has been downloaded successfully', 'success');
    } catch (error: any) {
      console.error('Error downloading bill:', error);
      showToast('Download Failed', 'Failed to download bill: ' + (error.message || error), 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const getBusDisplay = (busData: any) => {
    if (typeof busData === 'object' && busData) {
      return `${busData.busNumber} - ${busData.busName}`;
    }
    return 'Unknown Bus';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Paid';
      case 'partial':
        return 'Partially Paid';
      case 'unpaid':
        return 'Unpaid';
      default:
        return status;
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const formatMonth = (month: string) => {
    try {
      const date = new Date(month);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    } catch {
      return month;
    }
  };

  // Generate month options for the last 12 months
  const generateMonthOptions = () => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = date.toISOString().substring(0, 7); // YYYY-MM format
      const displayStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      months.push({ value: monthStr, display: displayStr });
    }
    return months;
  };

  if (loading && monthlyFees.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Monthly Fees</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Monthly Fees</h3>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => fetchMonthlyFees(1)}
            disabled={loading}
            className="mt-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
          >
            {loading ? 'Loading...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Toast 
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Monthly Fees</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage monthly fees for your buses created by admin
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <div className="text-sm text-gray-500">
              Total Fees: <span className="font-semibold text-gray-900">{pagination.total}</span>
            </div>
            <button 
              onClick={() => fetchMonthlyFees(pagination.currentPage)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Bus Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bus</label>
            <select 
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Buses</option>
              {buses.map((bus) => (
                <option key={bus._id} value={bus._id}>
                  {bus.busNumber} - {bus.busName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="partial">Partially Paid</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Months</option>
              {generateMonthOptions().map((month) => (
                <option key={month.value} value={month.value}>
                  {month.display}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedBus('');
                setSelectedStatus('');
                setSelectedMonth('');
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Filter Info */}
        {(selectedBus || selectedStatus || selectedMonth) && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Active Filters:</span>
              {selectedBus && <span className="ml-2">Bus: {buses.find(b => b._id === selectedBus)?.busNumber}</span>}
              {selectedStatus && <span className="ml-2">Status: {getStatusDisplay(selectedStatus)}</span>}
              {selectedMonth && <span className="ml-2">Month: {generateMonthOptions().find(m => m.value === selectedMonth)?.display}</span>}
            </p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📄</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Fees</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">💰</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">
                LKR {monthlyFees.reduce((sum, fee) => sum + fee.amount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Amount</p>
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                LKR {monthlyFees.reduce((sum, fee) => sum + fee.paidAmount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⏳</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-xl sm:text-2xl font-bold text-red-600">
                LKR {monthlyFees.reduce((sum, fee) => sum + (fee.amount - fee.paidAmount), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Fees List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Monthly Fee Records ({monthlyFees.length})
          </h3>
          
          {/* Enhanced View Toggle Buttons */}
          {monthlyFees.length > 0 && (
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
        
        {monthlyFees.length === 0 ? (
          <div className="p-6 text-center">
            <span className="text-4xl mb-4 block">📄</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Monthly Fees Found
            </h3>
            <p className="text-gray-500">
              No monthly fees have been created by the admin for your buses yet.
            </p>
          </div>
        ) : viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fee Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Bus Information
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Payment Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthlyFees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">📄</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatMonth(fee.month)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Created: {formatDate(fee.createdAt)}
                          </div>
                          <div className="md:hidden text-sm text-gray-500 mt-1">
                            {getBusDisplay(fee.busId)}
                          </div>
                          {fee.notes && (
                            <div className="text-xs text-gray-400 mt-1">
                              {fee.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm text-gray-900">
                        {getBusDisplay(fee.busId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Total: LKR {fee.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Paid: LKR {fee.paidAmount.toLocaleString()}
                      </div>
                      {fee.amount !== fee.paidAmount && (
                        <div className="text-sm text-red-600">
                          Outstanding: LKR {(fee.amount - fee.paidAmount).toLocaleString()}
                        </div>
                      )}
                      <div className="lg:hidden text-sm text-gray-500 mt-1">
                        {fee.paymentDate ? formatDate(fee.paymentDate) : 'Not paid'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                      <div className="text-sm text-gray-900">
                        {fee.paymentDate ? formatDate(fee.paymentDate) : 'Not paid'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(fee.status)}`}>
                        {getStatusDisplay(fee.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0">
                        {fee.status === 'paid' && (
                          <button
                            onClick={() => handleDownloadBill(fee)}
                            disabled={downloadingId === fee._id}
                            className="text-green-600 hover:text-green-900 px-3 py-1 text-sm border border-green-600 rounded disabled:opacity-50 whitespace-nowrap"
                          >
                            {downloadingId === fee._id ? 'Downloading...' : 'Download Bill'}
                          </button>
                        )}
                        <button className="text-blue-600 hover:text-blue-900 px-3 py-1 text-sm border border-blue-600 rounded whitespace-nowrap">
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {monthlyFees.map((fee) => (
              <div key={fee._id} className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover:border-blue-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-3xl mr-3">📄</span>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {formatMonth(fee.month)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {getBusDisplay(fee.busId)}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusBadge(fee.status)}`}>
                    {getStatusDisplay(fee.status)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-blue-700">Total Amount</span>
                      <span className="font-bold text-blue-900">LKR {fee.amount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-green-700">Paid Amount</span>
                      <span className="font-bold text-green-900">LKR {fee.paidAmount.toLocaleString()}</span>
                    </div>
                    {fee.amount !== fee.paidAmount && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-red-700">Outstanding</span>
                        <span className="font-bold text-red-900">LKR {(fee.amount - fee.paidAmount).toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-sm text-gray-600">
                    <div className="flex justify-between py-1">
                      <span>Created:</span>
                      <span>{formatDate(fee.createdAt)}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Payment Date:</span>
                      <span>{fee.paymentDate ? formatDate(fee.paymentDate) : 'Not paid'}</span>
                    </div>
                    {fee.notes && (
                      <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                        <span className="font-medium">Notes:</span> {fee.notes}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-2 pt-3 border-t border-gray-200">
                    {fee.status === 'paid' && (
                      <button
                        onClick={() => handleDownloadBill(fee)}
                        disabled={downloadingId === fee._id}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        {downloadingId === fee._id ? 'Downloading...' : 'Download Bill'}
                      </button>
                    )}
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-gray-500 text-center sm:text-left">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to {Math.min(pagination.currentPage * pagination.limit, pagination.total)} of {pagination.total} fees
            </div>
            <div className="flex justify-center sm:justify-end space-x-2">
              <button
                onClick={() => fetchMonthlyFees(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1 || loading}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchMonthlyFees(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages || loading}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}