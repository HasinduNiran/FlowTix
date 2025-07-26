'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ManagerService, ManagerTicket } from '@/services/manager.service';
import { Toast } from '@/components/ui/Toast';

// Define comprehensive Ticket interface
interface Ticket {
  _id: string;
  ticketId: string;
  ticketNumber: string;
  passengerName: string;
  fromStopId?: string;
  toStopId?: string;
  fromStopName: string;
  toStopName: string;
  fromStop: string;
  toStop: string;
  price: number;
  totalPrice: number;
  fare: number;
  tripId: string;
  tripNumber: string;
  busId: string;
  busNumber: string;
  busName: string;
  routeName: string;
  routeNumber: string;
  seatNumber: string;
  bookingTime: string;
  dateTime: string;
  status: string;
  paymentMethod: string;
  totalPassengers: number;
  passengers: number;
  paidAmount: number;
  balance: number;
  conductorId: string;
  conductorName: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketsResponse {
  success: boolean;
  message: string;
  count: number;
  total: number;
  page: number;
  totalPages: number;
  data: Ticket[];
}

interface FilterOptions {
  startDate: string; // Changed from dateRange to startDate
  endDate: string; // Added endDate
  status: string;
  paymentMethod: string;
  busId: string; // Add busId filter
  fromStopId: string; // Add fromStopId filter
  toStopId: string; // Add toStopId filter
  page: number;
  limit: number;
}

// Add Bus interface for the bus filter dropdown
interface Bus {
  _id: string;
  busId: string;
  busNumber: string;
  busName: string;
  displayName: string;
  routeName: string;
  routeNumber: string;
}

// Add Stop interface for the stop filter dropdowns
interface Stop {
  _id: string;
  stopId: string;
  stopName: string;
  stopCode?: string;
  displayName: string;
  location?: string;
  routeInfo?: {
    routeId: string;
    routeName: string;
    routeNumber: string;
  };
}

const ManagerTicketsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalTickets, setTotalTickets] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Bus filter state
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loadingBuses, setLoadingBuses] = useState(true);

  // Stop filter state
  const [stops, setStops] = useState<Stop[]>([]);
  const [loadingStops, setLoadingStops] = useState(true);

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
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  };
  
  // Filter states
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: '', // Changed from dateRange to startDate (empty means no filter)
    endDate: '', // Added endDate (empty means no filter)
    status: 'all',
    paymentMethod: 'all',
    busId: 'all', // Add busId filter with default 'all'
    fromStopId: 'all', // Add fromStopId filter with default 'all'
    toStopId: 'all', // Add toStopId filter with default 'all'
    page: 1,
    limit: 50
  });

  // Statistics
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalTickets: 0,
    averageTicketPrice: 0,
    cashPayments: 0,
    digitalPayments: 0
  });

  // Check authentication and role
  useEffect(() => {
    if (!isAuthenticated || !user) {
      setError('Authentication required');
      return;
    }
    
    if (user.role !== 'manager') {
      setError('Access denied. Manager role required.');
      return;
    }
  }, [isAuthenticated, user]);

  // Fetch assigned buses for filter dropdown
  const fetchBuses = async () => {
    try {
      setLoadingBuses(true);
      const busList = await ManagerService.getAssignedBusesList();
      setBuses(busList);
    } catch (err: any) {
      console.error('Error fetching buses:', err);
      showToast('Warning', 'Failed to load buses list', 'warning');
    } finally {
      setLoadingBuses(false);
    }
  };

  // Fetch assigned buses stops for filter dropdown
  const fetchStops = async (selectedBusId?: string) => {
    try {
      setLoadingStops(true);
      const stopsList = await ManagerService.getAssignedBusesStops(selectedBusId);
      setStops(stopsList);
    } catch (err: any) {
      console.error('Error fetching stops:', err);
      showToast('Warning', 'Failed to load stops list', 'warning');
    } finally {
      setLoadingStops(false);
    }
  };

  // Fetch tickets function
  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build filter object for the API call
      const filterObject: {
        status?: 'all' | 'booked' | 'used' | 'cancelled';
        startDate?: string;
        endDate?: string;
        busId?: string;
        fromStopId?: string;
        toStopId?: string;
      } = {};
      
      // Add custom date filters
      if (filters.startDate) {
        filterObject.startDate = filters.startDate;
      }
      
      if (filters.endDate) {
        filterObject.endDate = filters.endDate;
      }
      
      if (filters.status && filters.status !== 'all') {
        filterObject.status = filters.status as 'booked' | 'used' | 'cancelled';
      }

      if (filters.busId && filters.busId !== 'all') {
        filterObject.busId = filters.busId;
      }

      if (filters.fromStopId && filters.fromStopId !== 'all') {
        filterObject.fromStopId = filters.fromStopId;
      }

      if (filters.toStopId && filters.toStopId !== 'all') {
        filterObject.toStopId = filters.toStopId;
      }

      const response = await ManagerService.getTickets(filterObject);
      
      // The response is directly an array of ManagerTickets
      if (Array.isArray(response)) {
        // Transform backend ManagerTicket[] to frontend Ticket[] format
        const transformedTickets: Ticket[] = response.map((ticket: ManagerTicket) => ({
          _id: ticket._id || '',
          ticketId: ticket.ticketNumber || '',
          ticketNumber: ticket.ticketNumber || '',
          passengerName: ticket.passengerName || 'N/A',
          fromStopId: ticket.fromStopId || '',
          toStopId: ticket.toStopId || '',
          fromStopName: ticket.fromStopName || 'Unknown',
          toStopName: ticket.toStopName || 'Unknown',
          fromStop: ticket.fromStopName || 'Unknown',
          toStop: ticket.toStopName || 'Unknown',
          price: ticket.price || 0,
          totalPrice: ticket.price || 0,
          fare: ticket.price || 0,
          tripId: ticket.tripId || '',
          tripNumber: ticket.tripId || '',
          busId: ticket.busId || '',
          busNumber: 'Unknown', // This would need to be populated from bus data
          busName: 'Unknown', // This would need to be populated from bus data
          routeName: ticket.routeName || 'N/A',
          routeNumber: '',
          seatNumber: ticket.seatNumber || 'N/A',
          bookingTime: ticket.bookingTime || ticket.createdAt || '',
          dateTime: ticket.bookingTime || ticket.createdAt || '',
          status: ticket.status || 'used',
          paymentMethod: ticket.paymentMethod || 'cash',
          totalPassengers: 1, // ManagerTicket doesn't have this field
          passengers: 1, // ManagerTicket doesn't have this field
          paidAmount: ticket.price || 0,
          balance: 0, // ManagerTicket doesn't have this field
          conductorId: '', // ManagerTicket doesn't have this field
          conductorName: 'Unknown', // ManagerTicket doesn't have this field
          createdAt: ticket.createdAt || '',
          updatedAt: ticket.updatedAt || ''
        }));

        setTickets(transformedTickets);
        setTotalTickets(transformedTickets.length);
        setCurrentPage(1); // Since we don't have pagination from backend yet
        setTotalPages(1); // Since we don't have pagination from backend yet

        // Calculate statistics
        calculateStatistics(transformedTickets);

        showToast('Success', `Loaded ${transformedTickets.length} tickets`, 'success');
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('Error fetching tickets:', err);
      setError(err.message || 'Failed to load tickets');
      showToast('Error', err.message || 'Failed to load tickets', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics from tickets
  const calculateStatistics = (ticketList: Ticket[]) => {
    const totalRevenue = ticketList.reduce((sum, ticket) => sum + (ticket.totalPrice || 0), 0);
    const cashPayments = ticketList.filter(ticket => ticket.paymentMethod === 'cash').length;
    const digitalPayments = ticketList.filter(ticket => ticket.paymentMethod !== 'cash').length;
    const averageTicketPrice = ticketList.length > 0 ? totalRevenue / ticketList.length : 0;

    setStats({
      totalRevenue,
      totalTickets: ticketList.length,
      averageTicketPrice,
      cashPayments,
      digitalPayments
    });
  };

  // Handle filter changes
  const handleFilterChange = (filterName: keyof FilterOptions, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
      // Reset page when changing filters
      ...(filterName !== 'page' && filterName !== 'limit' ? { page: 1 } : {}),
      // Reset stop filters when bus changes
      ...(filterName === 'busId' ? { fromStopId: 'all', toStopId: 'all' } : {})
    }));

    // Refetch stops when bus selection changes
    if (filterName === 'busId') {
      const busId = value === 'all' ? undefined : value as string;
      fetchStops(busId);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      status: 'all',
      paymentMethod: 'all',
      busId: 'all',
      fromStopId: 'all',
      toStopId: 'all',
      page: 1,
      limit: 50
    });
    // Reload all stops when clearing filters
    fetchStops();
  };

  // Get today's date in YYYY-MM-DD format for date inputs
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Set quick date filters
  const setQuickDateFilter = (type: 'today' | 'week' | 'month') => {
    const today = new Date();
    let startDate = '';
    let endDate = getTodayDate();

    switch (type) {
      case 'today':
        startDate = getTodayDate();
        break;
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        startDate = weekStart.toISOString().split('T')[0];
        break;
      case 'month':
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        startDate = monthStart.toISOString().split('T')[0];
        break;
    }

    setFilters(prev => ({
      ...prev,
      startDate,
      endDate,
      page: 1
    }));
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      handleFilterChange('page', newPage);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  // Fetch buses and stops when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.role === 'manager') {
      fetchBuses();
      fetchStops(); // Load all stops initially
    }
  }, [isAuthenticated, user]);

  // Fetch tickets when filters change
  useEffect(() => {
    if (isAuthenticated && user?.role === 'manager') {
      fetchTickets();
    }
  }, [filters, isAuthenticated, user]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading tickets...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manager Tickets</h1>
          <p className="text-gray-600 mt-2">View and manage tickets for your assigned buses</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTickets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Ticket Price</p>
                <p className="text-2xl font-semibold text-gray-900">{formatCurrency(stats.averageTicketPrice)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cash Payments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.cashPayments}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Digital Payments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.digitalPayments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Filter Tickets</h2>
            <div className="flex gap-2">
              {/* Quick date filter buttons */}
              <button
                onClick={() => setQuickDateFilter('today')}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              >
                Today
              </button>
              <button
                onClick={() => setQuickDateFilter('week')}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              >
                This Week
              </button>
              <button
                onClick={() => setQuickDateFilter('month')}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
              >
                This Month
              </button>
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bus</label>
              <select
                value={filters.busId}
                onChange={(e) => handleFilterChange('busId', e.target.value)}
                disabled={loadingBuses}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="all">All Buses</option>
                {buses.map((bus) => (
                  <option key={bus._id} value={bus._id}>
                    {bus.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">From Stop</label>
              <select
                value={filters.fromStopId}
                onChange={(e) => handleFilterChange('fromStopId', e.target.value)}
                disabled={loadingStops}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="all">
                  {loadingStops ? 'Loading stops...' : 'All From Stops'}
                </option>
                {stops.map((stop) => (
                  <option key={`from-${stop._id}`} value={stop._id}>
                    {stop.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">To Stop</label>
              <select
                value={filters.toStopId}
                onChange={(e) => handleFilterChange('toStopId', e.target.value)}
                disabled={loadingStops}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="all">
                  {loadingStops ? 'Loading stops...' : 'All To Stops'}
                </option>
                {stops.map((stop) => (
                  <option key={`to-${stop._id}`} value={stop._id}>
                    {stop.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                min={filters.startDate || undefined}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="used">Used</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="digital">Digital</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Results per page</label>
              <select
                value={filters.limit}
                onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Tickets ({totalTickets} total)</h2>
          </div>

          {tickets.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
              <p className="mt-1 text-sm text-gray-500">No tickets match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">From - To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bus</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Passengers</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fare</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conductor</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket, index) => (
                    <tr key={ticket._id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {ticket.ticketNumber || ticket.ticketId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{ticket.routeName}</div>
                          {ticket.routeNumber && (
                            <div className="text-gray-500 text-xs">#{ticket.routeNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{ticket.fromStop}</div>
                          <div className="text-gray-500 text-xs">↓</div>
                          <div>{ticket.toStop}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{ticket.busNumber}</div>
                          {ticket.tripNumber && (
                            <div className="text-gray-500 text-xs">Trip: {ticket.tripNumber}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.totalPassengers || ticket.passengers || 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{formatCurrency(ticket.totalPrice || ticket.fare)}</div>
                          {ticket.balance > 0 && (
                            <div className="text-red-500 text-xs">Balance: {formatCurrency(ticket.balance)}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          ticket.paymentMethod === 'cash' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ticket.paymentMethod?.toUpperCase() || 'CASH'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(ticket.dateTime || ticket.bookingTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.conductorName || 'Unknown'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page {currentPage} of {totalPages} ({totalTickets} total tickets)
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${
                          pageNum === currentPage
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toast component */}
      <Toast
        isOpen={toast.show}
        title={toast.title}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default ManagerTicketsPage;
