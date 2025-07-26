'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DayEndService, DayEnd } from '@/services/dayEnd.service';
import { BusService } from '@/services/bus.service';
import { DataTable } from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function DayEndPage() {
  const router = useRouter();
  const [dayEndRecords, setDayEndRecords] = useState<DayEnd[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
  const [endDateFilter, setEndDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
  const [buses, setBuses] = useState<any[]>([]);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchDayEndRecords();
    fetchBuses();
  }, []);

  // Fetch day end records when date filters change
  useEffect(() => {
    fetchDayEndRecords();
  }, [startDateFilter, endDateFilter]);

  const fetchDayEndRecords = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (startDateFilter) filters.startDate = startDateFilter;
      if (endDateFilter) filters.endDate = endDateFilter;
      
      const data = await DayEndService.getAllDayEnds(filters);
      setDayEndRecords(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch day end records:', err);
      setError('Failed to load day end records. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
      const busData = await BusService.getAllBuses();
      setBuses(busData);
    } catch (err) {
      console.error('Error fetching buses:', err);
    }
  };

  const handleDeleteDayEnd = async (dayEndId: string) => {
    if (window.confirm('Are you sure you want to delete this day end record?')) {
      try {
        await DayEndService.deleteDayEnd(dayEndId);
        fetchDayEndRecords(); // Refresh the list
      } catch (err: any) {
        alert(err.message || 'Failed to delete day end record');
      }
    }
  };

  const handleStatusUpdate = async (dayEndId: string, newStatus: 'approved' | 'rejected') => {
    if (window.confirm(`Are you sure you want to ${newStatus} this day end record?`)) {
      try {
        await DayEndService.updateDayEndStatus(dayEndId, newStatus);
        fetchDayEndRecords(); // Refresh the list
      } catch (err: any) {
        alert(err.message || `Failed to ${newStatus} day end record`);
      }
    }
  };

  const getBusNumber = (busId: string | any) => {
    if (typeof busId === 'object' && busId) {
      return busId.busNumber || busId.regNumber || 'Unknown Bus';
    }
    const bus = buses.find(bus => bus._id === busId);
    return bus?.busNumber || 'Unknown Bus';
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Filter day end records based on all filters
  const filteredDayEndRecords = dayEndRecords.filter(record => {
    const searchLower = searchTerm.toLowerCase();
    const busNumber = getBusNumber(record.busId).toLowerCase();
    
    const matchesSearch = 
      busNumber.includes(searchLower) ||
      record.notes?.toLowerCase().includes(searchLower) ||
      record.totalRevenue.toString().includes(searchLower);
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Table columns configuration
  const columns = [
    { 
      header: 'Date', 
      accessor: 'date' as keyof DayEnd,
      cell: (value: any) => (
        <div className="text-sm font-medium">{formatDate(value)}</div>
      )
    },
    { 
      header: 'Bus', 
      accessor: 'busId' as keyof DayEnd,
      cell: (value: any) => (
        <span className="text-sm font-medium">{getBusNumber(value)}</span>
      )
    },
    { 
      header: 'Conductor', 
      accessor: 'conductorId' as keyof DayEnd,
      cell: (value: any) => (
        <div className="text-sm">
          {typeof value === 'object' && value 
            ? (value.username || 'Unknown Conductor')
            : 'Unknown Conductor'
          }
        </div>
      )
    },
    { 
      header: 'Trips', 
      accessor: 'tripDetails' as keyof DayEnd,
      cell: (value: any) => (
        <span className="font-medium text-blue-600">{value?.length || 0}</span>
      )
    },
    { 
      header: 'Total Revenue', 
      accessor: 'totalRevenue' as keyof DayEnd,
      cell: (value: any) => (
        <span className="font-medium text-green-600">Rs. {typeof value === 'number' ? value.toFixed(2) : '0.00'}</span>
      )
    },
    { 
      header: 'Total Expenses', 
      accessor: 'totalExpenses' as keyof DayEnd,
      cell: (value: any) => (
        <span className="font-medium text-red-600">Rs. {typeof value === 'number' ? value.toFixed(2) : '0.00'}</span>
      )
    },
    { 
      header: 'Profit/Loss', 
      accessor: 'profit' as keyof DayEnd,
      cell: (value: any) => (
        <span className={`font-medium ${
          typeof value === 'number' 
            ? value >= 0 
              ? 'text-green-600' 
              : 'text-red-600'
            : 'text-gray-600'
        }`}>
          Rs. {typeof value === 'number' ? value.toFixed(2) : '0.00'}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'status' as keyof DayEnd,
      cell: (value: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Pending'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: '_id' as keyof DayEnd,
      cell: (id: any, row?: DayEnd) => (
        <div className="flex space-x-2 justify-center">
          {row?.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusUpdate(id, 'approved')}
                className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                title="Approve Day End"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <button
                onClick={() => handleStatusUpdate(id, 'rejected')}
                className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                title="Reject Day End"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={() => router.push(`/super-admin/day-end/${id}`)}
            className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
            title="View Details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteDayEnd(id)}
            className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
            title="Delete Day End"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Day End Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Review and manage daily bus operations reports
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
                  <span className="text-blue-600 font-semibold">Total:</span>
                  <span className="text-blue-800 font-bold">{filteredDayEndRecords.length}</span>
                </div>
                <Button 
                  onClick={fetchDayEndRecords}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-gray-50 border-b border-gray-200 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label htmlFor="startDateFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <Input
                  id="startDateFilter"
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="endDateFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <Input
                  id="endDateFilter"
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Records
                </label>
                <Input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by bus, revenue, notes..."
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    const today = new Date().toISOString().split('T')[0];
                    setStartDateFilter(today);
                    setEndDateFilter(today);
                  }}
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>Clear Filters</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg inline-block">
                  <strong className="font-bold">Error: </strong>
                  <span>{error}</span>
                  <div className="mt-4">
                    <Button onClick={fetchDayEndRecords} variant="primary">
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredDayEndRecords}
                emptyMessage="No day end records found matching your criteria"
                keyExtractor={(record) => record._id}
              />
            )}
          </div>

          {/* Filter Summary */}
          {(statusFilter !== 'all' || searchTerm) && (
            <div className="bg-blue-50 border-t border-blue-200 p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-blue-700 font-medium">Active Filters:</span>
                {statusFilter !== 'all' && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Status: {statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
                  </span>
                )}
                {searchTerm && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Search: "{searchTerm}"
                  </span>
                )}
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Date Range: {formatDate(startDateFilter)} - {formatDate(endDateFilter)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
