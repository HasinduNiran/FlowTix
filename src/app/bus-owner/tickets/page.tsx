'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TicketService, Ticket } from '@/services/ticket.service';
import { BusService, Bus } from '@/services/bus.service';
import { StopService, Stop } from '@/services/stop.service';
import { RouteService, Route } from '@/services/route.service';

interface RouteStop {
  _id: string;
  stopName: string;
  sectionNumber: number;
}

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeStops, setRouteStops] = useState<Stop[]>([]);
  const [availableTripNumbers, setAvailableTripNumbers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedFromStop, setSelectedFromStop] = useState<string>('');
  const [selectedToStop, setSelectedToStop] = useState<string>('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [selectedTripNumber, setSelectedTripNumber] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchTickets = async (page: number = 1) => {
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
        sort: '-createdAt'
      };
      
      if (selectedBus) filters.busId = selectedBus;
      if (selectedDate) filters.date = selectedDate;
      // Make sure the stop filters are only applied when a bus is selected
      if (selectedBus) {
        if (selectedFromStop) filters.fromStopId = selectedFromStop;
        if (selectedToStop) filters.toStopId = selectedToStop;
      }
      if (selectedPaymentMethod) filters.paymentMethod = selectedPaymentMethod;
      if (selectedTripNumber) filters.tripNumber = selectedTripNumber;
      
      console.log('Fetching tickets with filters:', filters);
      console.log('Owner ID:', user.id);
      
      const result = await TicketService.getTicketsByOwner(user.id, filters);
      console.log('Tickets result:', result);
      
      setTickets(result.tickets);
      
      // Extract unique trip numbers from the results for the trip number filter
      const uniqueTripNumbers = [...new Set(result.tickets.map(ticket => ticket.tripNumber))]
        .filter(num => num != null)
        .sort((a, b) => b - a); // Sort descending (newest first)
      setAvailableTripNumbers(uniqueTripNumbers);
      
      setPagination({
        page: result.currentPage,
        limit: pagination.limit,
        total: result.total,
        totalPages: result.totalPages
      });
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      setError(error.message || 'Failed to fetch tickets');
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

  const fetchRouteStops = async (busId: string) => {
    if (!busId) {
      setRouteStops([]);
      return;
    }

    try {
      const bus = buses.find(b => b._id === busId);
      if (!bus) return;

      let routeId: string;
      if (typeof bus.routeId === 'object' && bus.routeId) {
        routeId = bus.routeId._id;
      } else {
        routeId = bus.routeId as string;
      }

      if (routeId) {
        console.log('Fetching stops for route:', routeId);
        const stops = await StopService.getStopsByRoute(routeId);
        console.log('Route stops:', stops);
        setRouteStops(stops.sort((a, b) => a.sectionNumber - b.sectionNumber));
      }
    } catch (error: any) {
      console.error('Error fetching route stops:', error);
      // Don't set error state for stops as it's not critical
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [user?.id]);

  useEffect(() => {
    fetchTickets(1);
  }, [user?.id, selectedBus, selectedDate, selectedFromStop, selectedToStop, selectedPaymentMethod, selectedTripNumber]);

  useEffect(() => {
    fetchRouteStops(selectedBus);
    // Clear stop filters when bus changes
    if (selectedBus) {
      setSelectedFromStop('');
      setSelectedToStop('');
    }
  }, [selectedBus, buses]);
  
  // Add additional data loading for resolving "Unknown" fields
  useEffect(() => {
    // Look through tickets and ensure we have bus and route data for display
    if (tickets.length > 0 && buses.length > 0) {
      // Get unique route IDs from tickets that might need to be fetched
      const routeIds = tickets
        .filter(ticket => typeof ticket.routeId === 'string')
        .map(ticket => ticket.routeId as string);
        
      if (routeIds.length > 0) {
        fetchRoutesData(routeIds);
      }
      
      console.log('Ticket data is available for display', tickets.length, 'tickets');
    }
  }, [tickets, buses]);
  
  const fetchRoutesData = async (routeIds: string[]) => {
    try {
      // Get unique route IDs only
      const uniqueRouteIds = [...new Set(routeIds)];
      console.log('Fetching route data for IDs:', uniqueRouteIds);
      
      // Fetch routes from owner's buses or all routes if necessary
      const routeData = await RouteService.getAllRoutes();
      console.log('Routes fetched:', routeData.length);
      setRoutes(routeData);
    } catch (error) {
      console.error('Error fetching routes data:', error);
    }
  };
  
  // Conductor data handling removed

  const handleBusChange = (busId: string) => {
    setSelectedBus(busId);
    // Reset stop-related filters when bus changes
    setSelectedFromStop('');
    setSelectedToStop('');
  };

  const getBusDisplay = (busData: any) => {
    if (typeof busData === 'object' && busData) {
      return busData.busNumber || busData.busName || 'Unknown Bus';
    } else if (typeof busData === 'string') {
      // If it's a string ID, find the bus in the buses array
      const bus = buses.find(b => b._id === busData);
      return bus ? bus.busNumber || bus.busName : 'Unknown Bus';
    }
    return 'Unknown Bus';
  };

  const getRouteDisplay = (routeData: any) => {
    if (typeof routeData === 'object' && routeData) {
      return routeData.routeName || routeData.routeNumber || routeData.name || routeData.code || 'Unknown Route';
    } else if (typeof routeData === 'string') {
      // First, check in our routes array which has complete data
      const route = routes.find(r => r._id === routeData);
      if (route) {
        return route.routeName || route.name || route.routeNumber || route.code || 'Unknown Route';
      }
      
      // If not found in routes array, try to find in buses that have route information
      const bus = buses.find(b => b.routeId && 
        (typeof b.routeId === 'object' ? b.routeId._id === routeData : b.routeId === routeData));
      
      if (bus && typeof bus.routeId === 'object') {
        return bus.routeId.routeName || bus.routeId.routeNumber || 'Unknown Route';
      }
    }
    return 'Unknown Route';
  };

  // Conductor display function removed

  const formatDateTime = (dateTime: string | Date) => {
    return new Date(dateTime).toLocaleString();
  };

  const formatTime = (dateTime: string | Date) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 text-green-800';
      case 'card':
        return 'bg-blue-100 text-blue-800';
      case 'online':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
              <p className="text-gray-600">Loading tickets...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Ticket Management</h1>
            </div>
            <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Tickets</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button 
                onClick={() => fetchTickets(1)}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {loading ? 'Loading...' : 'Retry'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="bg-gradient-to-r from-white to-blue-50/50 rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                  Ticket Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Monitor ticket sales and booking data for your buses
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                
                <div className="flex items-center gap-3 order-1 sm:order-1">
                  <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-3 py-2 rounded-lg">
                    <span className="font-medium text-gray-900">{pagination.total}</span> tickets
                  </div>
                  <button 
                    onClick={() => fetchTickets(pagination.page)}
                    disabled={loading}
                    className="flex items-center bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                    {loading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-gradient-to-r from-white to-gray-50/50 rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center mb-4 sm:mb-6">
              <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/>
              </svg>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Filter Tickets</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {/* Bus Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bus</label>
                <select 
                  value={selectedBus}
                  onChange={(e) => handleBusChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">All Buses</option>
                  {buses.map((bus) => (
                    <option key={bus._id} value={bus._id}>
                      {bus.busNumber} - {bus.busName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                />
              </div>

              {/* From Stop Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">From Stop</label>
                <select 
                  value={selectedFromStop}
                  onChange={(e) => setSelectedFromStop(e.target.value)}
                  disabled={!selectedBus || routeStops.length === 0}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
                >
                  <option value="">All From Stops</option>
                  {routeStops.map((stop) => (
                    <option key={stop._id} value={stop._id}>
                      {stop.stopName} (Section {stop.sectionNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* To Stop Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To Stop</label>
                <select 
                  value={selectedToStop}
                  onChange={(e) => setSelectedToStop(e.target.value)}
                  disabled={!selectedBus || routeStops.length === 0}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed bg-white"
                >
                  <option value="">All To Stops</option>
                  {routeStops.map((stop) => (
                    <option key={stop._id} value={stop._id}>
                      {stop.stopName} (Section {stop.sectionNumber})
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Method Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select 
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                </select>
              </div>

              {/* Trip Number Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trip Number</label>
                <select 
                  value={selectedTripNumber}
                  onChange={(e) => setSelectedTripNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">All Trip Numbers</option>
                  {availableTripNumbers.map((tripNumber) => (
                    <option key={tripNumber} value={tripNumber.toString()}>
                      Trip #{tripNumber}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <div className="flex items-end sm:col-span-2 lg:col-span-1">
                <button
                  onClick={() => {
                    setSelectedBus('');
                    setSelectedDate(new Date().toISOString().split('T')[0]);
                    setSelectedFromStop('');
                    setSelectedToStop('');
                    setSelectedPaymentMethod('');
                    setSelectedTripNumber('');
                    setRouteStops([]);
                    setAvailableTripNumbers([]);
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                  </svg>
                  Clear Filters
                </button>
              </div>
            </div>

            {/* Filter Info */}
            {(selectedBus || selectedFromStop || selectedToStop || selectedPaymentMethod || selectedTripNumber) && (
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Active Filters:</span>
                  {selectedBus && <span className="ml-2">Bus: {buses.find(b => b._id === selectedBus)?.busNumber}</span>}
                  {selectedFromStop && <span className="ml-2">From: {routeStops.find(s => s._id === selectedFromStop)?.stopName}</span>}
                  {selectedToStop && <span className="ml-2">To: {routeStops.find(s => s._id === selectedToStop)?.stopName}</span>}
                  {selectedPaymentMethod && <span className="ml-2">Payment: {selectedPaymentMethod.toUpperCase()}</span>}
                  {selectedTripNumber && <span className="ml-2">Trip: #{selectedTripNumber}</span>}
                </p>
              </div>
            )}
          </div>

          {/* Summary Cards */}
          <div className="flex flex-nowrap gap-3 sm:gap-2 overflow-x-auto pb-2">
            <div className="flex-1 min-w-[160px] bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zM13 17.5h-2v-2h2v2zm0-4h-2v-6h2v6z"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Total Tickets</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{pagination.total}</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-[160px] bg-gradient-to-br from-white to-green-50 rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-6h13v-2.5c0-1.1-.9-2-2-2h-2L9.5 6.5C9.88 6.19 10 5.61 10 5s-.39-1-.89-1H4c-.55 0-1 .45-1 1v2c0 .55.45 1 1 1h2.5l4.5 4.5h2c.28 0 .5.22.5.5V18H4z"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Passengers</p>
                  <p className="text-lg sm:text-2xl font-bold text-gray-900 truncate">
                    {tickets.reduce((sum, ticket) => sum + ticket.totalPassengers, 0)}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-[160px] bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Total</p>
                  <p className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                    LKR {tickets.reduce((sum, ticket) => sum + ticket.farePaid, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-[160px] bg-gradient-to-br from-white to-yellow-50 rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 15h7c0 1.08.81 2 1.8 2H18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v14l3-3zm5-8c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 1c0 1.25.77 2.32 1.86 2.77C11.28 11.24 11 11.74 11 12.31V14h2v-1.69c0-.38.21-.73.55-.88.55-.25.95-.81.95-1.43 0-.88-.72-1.6-1.6-1.6H12c-.88 0-1.6.72-1.6 1.6H9c0-1.66 1.34-3 3-3s3 1.34 3 3c0 1.26-.79 2.4-1.97 2.83-.14.05-.28.1-.42.17H15c.55 0 1 .45 1 1s-.45 1-1 1h-3c-.55 0-1-.45-1-1v-2c0-.35.18-.66.46-.84.37-.25.54-.68.54-1.16z"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Cash</p>
                  <p className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                    LKR {tickets.filter(ticket => ticket.paymentMethod === 'cash').reduce((sum, ticket) => sum + ticket.farePaid, 0).toLocaleString()}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    {tickets.filter(ticket => ticket.paymentMethod === 'cash').length} tickets
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-[160px] bg-gradient-to-br from-white to-blue-50 rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Card</p>
                  <p className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                    LKR {tickets.filter(ticket => ticket.paymentMethod === 'card').reduce((sum, ticket) => sum + ticket.farePaid, 0).toLocaleString()}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    {tickets.filter(ticket => ticket.paymentMethod === 'card').length} tickets
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 min-w-[160px] bg-gradient-to-br from-white to-purple-50 rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                    <path d="M12 16.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z"/>
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Online</p>
                  <p className="text-sm sm:text-lg lg:text-xl font-bold text-gray-900 truncate">
                    LKR {tickets.filter(ticket => ticket.paymentMethod === 'online').reduce((sum, ticket) => sum + ticket.farePaid, 0).toLocaleString()}
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    {tickets.filter(ticket => ticket.paymentMethod === 'online').length} tickets
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tickets List */}
          <div className="bg-gradient-to-r from-white to-gray-50/50 rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Ticket Records ({tickets.length})
                </h3>
                
                {/* Enhanced View Toggle Buttons */}
                {tickets.length > 0 && (
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
                        Table View
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
                        Card View
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {tickets.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zM13 17.5h-2v-2h2v2zm0-4h-2v-6h2v6z"/>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  No Tickets Found
                </h3>
                <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                  No ticket records found for the selected date and bus filters.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                {viewMode === 'table' && (
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ticket Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Journey
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Passengers
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Payment
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trip Info
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {tickets.map((ticket) => (
                          <tr key={ticket._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zM13 17.5h-2v-2h2v2zm0-4h-2v-6h2v6z"/>
                                  </svg>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {ticket.ticketId}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Bus: {getBusDisplay(ticket.busId)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 font-medium">
                                Route: {getRouteDisplay(ticket.routeId)}
                              </div>
                              <div className="text-sm text-gray-500">
                                From: {ticket.fromStop.stopName}
                              </div>
                              <div className="text-sm text-gray-500">
                                To: {ticket.toStop.stopName}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                Total: {ticket.totalPassengers}
                              </div>
                              {ticket.passengers.map((passenger, index) => (
                                <div key={index} className="text-xs text-gray-500">
                                  {passenger.fareType}: {passenger.quantity} × LKR {passenger.farePerUnit}
                                </div>
                              ))}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                LKR {ticket.farePaid.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                Paid: LKR {ticket.paidAmount.toLocaleString()}
                              </div>
                              {ticket.balance !== 0 && (
                                <div className="text-sm text-red-600">
                                  Balance: LKR {ticket.balance.toLocaleString()}
                                </div>
                              )}
                              <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodBadge(ticket.paymentMethod)}`}>
                                {ticket.paymentMethod.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                Trip #{ticket.tripNumber}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {formatTime(ticket.dateTime)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(ticket.dateTime).toLocaleDateString()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Card View */}
                {(viewMode === 'card' || true) && (
                  <div className={`${viewMode === 'table' ? 'lg:hidden' : ''} divide-y divide-gray-200`}>
                    {/* Desktop Cards */}
                    {viewMode === 'card' && (
                      <div className="hidden lg:grid lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6 p-6">
                        {tickets.map((ticket) => (
                          <div key={ticket._id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zM13 17.5h-2v-2h2v2zm0-4h-2v-6h2v6z"/>
                                  </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {ticket.ticketId}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {getBusDisplay(ticket.busId)}
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getPaymentMethodBadge(ticket.paymentMethod)}`}>
                                {ticket.paymentMethod.toUpperCase()}
                              </span>
                            </div>

                            {/* Journey Info */}
                            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                              <div className="text-sm font-medium text-gray-900">
                                Route: {getRouteDisplay(ticket.routeId)}
                              </div>
                              <div className="text-sm text-gray-500">
                                From: {ticket.fromStop.stopName}
                              </div>
                              <div className="text-sm text-gray-500">
                                To: {ticket.toStop.stopName}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Passengers</dt>
                                <dd className="text-sm text-gray-900">
                                  Total: {ticket.totalPassengers}
                                </dd>
                                {ticket.passengers.map((passenger, index) => (
                                  <dd key={index} className="text-xs text-gray-500">
                                    {passenger.fareType}: {passenger.quantity}
                                  </dd>
                                ))}
                              </div>
                              <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Payment</dt>
                                <dd className="text-sm font-bold text-blue-600">
                                  LKR {ticket.farePaid.toLocaleString()}
                                </dd>
                                <dd className="text-sm text-gray-500">
                                  Paid: LKR {ticket.paidAmount.toLocaleString()}
                                </dd>
                              </div>
                            </div>

                            <div className="flex justify-between items-center">
                              <div className="text-xs text-gray-500">
                                Trip #{ticket.tripNumber} • {formatTime(ticket.dateTime)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mobile Cards */}
                    <div className={`${viewMode === 'card' ? 'lg:hidden' : ''} divide-y divide-gray-200`}>
                      {tickets.map((ticket) => (
                        <div key={ticket._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M22 10V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v4c1.1 0 2 .9 2 2s-.9 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zM13 17.5h-2v-2h2v2zm0-4h-2v-6h2v6z"/>
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                  {ticket.ticketId}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  Bus: {getBusDisplay(ticket.busId)}
                                </p>
                              </div>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getPaymentMethodBadge(ticket.paymentMethod)}`}>
                              {ticket.paymentMethod.toUpperCase()}
                            </span>
                          </div>

                          {/* Journey & Route */}
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-900">
                              {getRouteDisplay(ticket.routeId)}
                            </div>
                            <div className="text-sm text-gray-500">
                              From: {ticket.fromStop.stopName}
                            </div>
                            <div className="text-sm text-gray-500">
                              To: {ticket.toStop.stopName}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Passengers</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                Total: {ticket.totalPassengers}
                              </dd>
                              {ticket.passengers.map((passenger, index) => (
                                <dd key={index} className="text-xs text-gray-500">
                                  {passenger.fareType}: {passenger.quantity} × LKR {passenger.farePerUnit}
                                </dd>
                              ))}
                            </div>
                            <div>
                              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</dt>
                              <dd className="mt-1 text-sm font-medium text-gray-900">
                                LKR {ticket.farePaid.toLocaleString()}
                              </dd>
                              <dd className="text-sm text-gray-500">
                                Paid: LKR {ticket.paidAmount.toLocaleString()}
                              </dd>
                              {ticket.balance !== 0 && (
                                <dd className="text-sm text-red-600">
                                  Balance: LKR {ticket.balance.toLocaleString()}
                                </dd>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>Trip #{ticket.tripNumber}</span>
                            <span>
                              {formatTime(ticket.dateTime)} • {new Date(ticket.dateTime).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-sm text-gray-500 order-2 sm:order-1">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tickets
                </div>
                <div className="flex items-center space-x-2 order-1 sm:order-2">
                  <button
                    onClick={() => fetchTickets(pagination.page - 1)}
                    disabled={pagination.page <= 1 || loading}
                    className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                    </svg>
                    Previous
                  </button>
                  <span className="px-3 py-2 text-sm bg-gray-100 rounded-lg">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => fetchTickets(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages || loading}
                    className="flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50 transition-colors"
                  >
                    Next
                    <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
