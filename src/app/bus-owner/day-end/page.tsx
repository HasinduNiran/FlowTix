'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { DayEndService, DayEnd } from '@/services/dayEnd.service';
import { BusService, Bus } from '@/services/bus.service';

export default function DayEndPage() {
  const { user } = useAuth();
  const [dayEnds, setDayEnds] = useState<DayEnd[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchDayEnds = async (page: number = 1) => {
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
        limit: pagination.limit,
        sort: '-date'
      };
      
      if (selectedBus) filters.busId = selectedBus;
      if (selectedStatus) filters.status = selectedStatus;
      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      
      console.log('Fetching day ends with filters:', filters);
      console.log('Owner ID:', user.id);
      
      const result = await DayEndService.getDayEndsByOwner(user.id, filters);
      console.log('Day ends result:', result);
      
      setDayEnds(result.dayEnds);
      setPagination({
        page: result.currentPage,
        limit: pagination.limit,
        total: result.total,
        totalPages: result.totalPages
      });
    } catch (error: any) {
      console.error('Error fetching day ends:', error);
      setError(error.message || 'Failed to fetch day end records');
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
      setError(`Failed to fetch buses: ${error.message || error}`);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [user?.id]);

  useEffect(() => {
    fetchDayEnds(1);
  }, [user?.id, selectedBus, selectedStatus, startDate, endDate]);

  const getBusDisplay = (busData: any) => {
    if (typeof busData === 'object' && busData) {
      return busData.busNumber || busData.busName || 'Unknown Bus';
    }
    return 'Unknown Bus';
  };

  const getConductorDisplay = (conductorData: any) => {
    if (typeof conductorData === 'object' && conductorData) {
      return conductorData.username || 'Unknown Conductor';
    }
    return 'Unknown Conductor';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString();
  };

  const formatDateTime = (dateTime: string | Date) => {
    return new Date(dateTime).toLocaleString();
  };

  if (loading && dayEnds.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Day End Reports</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Day End Reports</h3>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => fetchDayEnds(1)}
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
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Day End Reports</h1>
            <p className="text-gray-600 mt-1">
              Review daily operational reports from conductors for your buses
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Total Reports: <span className="font-semibold text-gray-900">{pagination.total}</span>
            </div>
            <button 
              onClick={() => fetchDayEnds(pagination.page)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedBus('');
                setSelectedStatus('');
                setStartDate(new Date().toISOString().split('T')[0]);
                setEndDate(new Date().toISOString().split('T')[0]);
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Filter Info */}
        {(selectedBus || selectedStatus || startDate !== endDate) && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Active Filters:</span>
              {selectedBus && <span className="ml-2">Bus: {buses.find(b => b._id === selectedBus)?.busNumber}</span>}
              {selectedStatus && <span className="ml-2">Status: {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}</span>}
              {startDate !== endDate && <span className="ml-2">Date Range: {formatDate(startDate)} - {formatDate(endDate)}</span>}
            </p>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📊</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">💰</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                LKR {dayEnds.reduce((sum, dayEnd) => sum + dayEnd.totalRevenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">💸</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-900">
                LKR {dayEnds.reduce((sum, dayEnd) => sum + dayEnd.totalExpenses, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📈</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Profit</p>
              <p className="text-2xl font-bold text-gray-900">
                LKR {dayEnds.reduce((sum, dayEnd) => sum + dayEnd.profit, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Day End Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Day End Reports ({dayEnds.length})
          </h3>
        </div>
        
        {dayEnds.length === 0 ? (
          <div className="p-6 text-center">
            <span className="text-4xl mb-4 block">🌅</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Day End Reports Found
            </h3>
            <p className="text-gray-500">
              No day end reports found for the selected filters. Reports will appear here once conductors submit their daily reports.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus & Conductor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trips
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Financial Summary
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
                {dayEnds.map((dayEnd) => (
                  <tr key={dayEnd._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🌅</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(dayEnd.date)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Submitted: {formatDateTime(dayEnd.createdAt)}
                          </div>
                          {dayEnd.notes && (
                            <div className="text-xs text-gray-400 mt-1">
                              Note: {dayEnd.notes.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Bus: {getBusDisplay(dayEnd.busId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        Conductor: {getConductorDisplay(dayEnd.conductorId)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {dayEnd.tripDetails.length} trips
                      </div>
                      <div className="text-sm text-gray-500">
                        {dayEnd.tripDetails.reduce((sum, trip) => sum + trip.passengerCount, 0)} passengers
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Revenue: LKR {dayEnd.totalRevenue.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Expenses: LKR {dayEnd.totalExpenses.toLocaleString()}
                      </div>
                      <div className={`text-sm font-medium ${dayEnd.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        Profit: LKR {dayEnd.profit.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(dayEnd.status)}`}>
                        {dayEnd.status.charAt(0).toUpperCase() + dayEnd.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 px-3 py-1 text-sm border border-blue-600 rounded">
                          View Details
                        </button>
                        {dayEnd.status === 'pending' && (
                          <>
                            <button className="text-green-600 hover:text-green-900 px-3 py-1 text-sm border border-green-600 rounded">
                              Approve
                            </button>
                            <button className="text-red-600 hover:text-red-900 px-3 py-1 text-sm border border-red-600 rounded">
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} reports
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchDayEnds(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchDayEnds(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
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
