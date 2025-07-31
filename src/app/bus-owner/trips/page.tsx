'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TripService, Trip } from '@/services/trip.service';
import { BusService, Bus } from '@/services/bus.service';

export default function TripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchTrips = async (page: number = 1) => {
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
        sort: '-startTime'
      };
      
      if (selectedBus) filters.busId = selectedBus;
      if (selectedDate) filters.date = selectedDate;
      
      console.log('Fetching trips with filters:', filters);
      console.log('Owner ID:', user.id);
      
      const result = await TripService.getTripsByOwner(user.id, filters);
      console.log('Trips result:', result);
      
      setTrips(result.trips);
      setPagination({
        page: result.currentPage,
        limit: pagination.limit,
        total: result.total,
        totalPages: result.totalPages
      });
    } catch (error: any) {
      console.error('Error fetching trips:', error);
      setError(error.message || 'Failed to fetch trips');
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
    fetchTrips(1);
  }, [user?.id, selectedBus, selectedDate]);

  const filteredTrips = trips.filter(trip => {
    if (filter === 'all') return true;
    
    // Determine trip status based on endTime
    const isCompleted = trip.endTime != null;
    const status = isCompleted ? 'completed' : 'active';
    
    return filter === status;
  });

  const getStatusBadge = (trip: Trip) => {
    const isCompleted = trip.endTime != null;
    const status = isCompleted ? 'completed' : 'active';
    
    switch (status) {
      case 'active':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (trip: Trip) => {
    const isCompleted = trip.endTime != null;
    return isCompleted ? 'Completed' : 'Active';
  };

  const formatDateTime = (dateTime: string | Date) => {
    return new Date(dateTime).toLocaleString();
  };

  const formatTime = (dateTime: string | Date) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getBusDisplay = (busData: any) => {
    if (typeof busData === 'object' && busData) {
      return busData.busNumber || busData.busName || 'Unknown Bus';
    }
    return 'Unknown Bus';
  };

  const getRouteDisplay = (routeData: any) => {
    if (typeof routeData === 'object' && routeData) {
      return routeData.routeName || routeData.routeNumber || 'Unknown Route';
    }
    return 'Unknown Route';
  };

  if (loading && trips.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-xl border border-gray-100 p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Trip Management</h1>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Trips</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button 
                onClick={() => fetchTrips(1)}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-medium transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-white border-b border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col space-y-4 lg:space-y-0 lg:flex-row lg:justify-between lg:items-start">
                <div className="flex items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 truncate">
                      Trip Management
                    </h1>
                    <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-relaxed">
                      Monitor bus trips and their performance
                    </p>
                  </div>
                  <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a3 3 0 0 0-3 3v6a2 2 0 0 0 2 2h1v1a1 1 0 0 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1h1a2 2 0 0 0 2-2v-6a3 3 0 0 0-3-3zM10 6h4v1h-4V6zm-4 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                    </svg>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                  <div className="text-sm text-gray-500">
                    Total Trips: <span className="font-semibold text-gray-900">{pagination.total}</span>
                  </div>
                  <button 
                    onClick={() => fetchTrips(pagination.page)}
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
                  >
                    {loading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as any)}
                    className="pl-10 pr-8 py-2.5 sm:py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none text-sm sm:text-base"
                  >
                    <option value="all">All Trips</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Bus Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bus</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <select 
                    value={selectedBus}
                    onChange={(e) => setSelectedBus(e.target.value)}
                    className="pl-10 pr-8 py-2.5 sm:py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none text-sm sm:text-base"
                  >
                    <option value="">All Buses</option>
                    {buses.map((bus) => (
                      <option key={bus._id} value={bus._id}>
                        {bus.busNumber} - {bus.busName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2.5 sm:py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                />
              </div>

              {/* Clear Filters */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSelectedBus('');
                    setSelectedDate('');
                    setFilter('all');
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* Trips List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-blue-100 rounded-full flex-shrink-0">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Trip Records
                  </h3>
                  <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                    {filteredTrips.length} of {trips.length}
                  </span>
                </div>

                {/* Enhanced View Toggle Buttons */}
                {filteredTrips.length > 0 && (
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
                )}
              </div>
            </div>
            
            {filteredTrips.length === 0 ? (
              <div className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a3 3 0 0 0-3 3v6a2 2 0 0 0 2 2h1v1a1 1 0 0 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1h1a2 2 0 0 0 2-2v-6a3 3 0 0 0-3-3zM10 6h4v1h-4V6zm-4 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                  {trips.length === 0 ? 'No Trips Found' : 'No Trips Match Filter'}
                </h3>
                <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                  {trips.length === 0 
                    ? 'No trips have been recorded for your buses yet.' 
                    : 'No trips found for the selected filters.'
                  }
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
                            Trip Details
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Route & Direction
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Schedule
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Performance
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTrips.map((trip) => (
                          <tr key={trip._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a3 3 0 0 0-3 3v6a2 2 0 0 0 2 2h1v1a1 1 0 0 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1h1a2 2 0 0 0 2-2v-6a3 3 0 0 0-3-3zM10 6h4v1h-4V6zm-4 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                                  </svg>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    Trip #{trip.tripNumber}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Bus: {getBusDisplay(trip.busId)}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {getRouteDisplay(trip.routeId)}
                              </div>
                              <div className="text-sm text-gray-500">
                                Direction: {trip.direction.charAt(0).toUpperCase() + trip.direction.slice(1)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                Start: {formatTime(trip.startTime)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {trip.endTime ? `End: ${formatTime(trip.endTime)}` : 'In Progress'}
                              </div>
                              <div className="text-sm text-gray-400">
                                {new Date(trip.date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(trip)}`}>
                                {getStatusDisplay(trip)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                Passengers: {trip.passengerCount}
                              </div>
                              <div className="text-sm font-bold text-blue-600">
                                Fare: LKR {trip.totalFare.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                Cash: LKR {trip.cashInHand.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button className="text-blue-600 hover:text-blue-900 px-3 py-2 text-sm border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                                View Details
                              </button>
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
                        {filteredTrips.map((trip) => (
                          <div key={trip._id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a3 3 0 0 0-3 3v6a2 2 0 0 0 2 2h1v1a1 1 0 0 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1h1a2 2 0 0 0 2-2v-6a3 3 0 0 0-3-3zM10 6h4v1h-4V6zm-4 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                                  </svg>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    Trip #{trip.tripNumber}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    {getBusDisplay(trip.busId)}
                                  </p>
                                </div>
                              </div>
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusBadge(trip)}`}>
                                {getStatusDisplay(trip)}
                              </span>
                            </div>

                            {/* Route Info */}
                            <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                              <div className="text-sm font-medium text-gray-900">
                                {getRouteDisplay(trip.routeId)}
                              </div>
                              <div className="text-sm text-gray-500">
                                Direction: {trip.direction.charAt(0).toUpperCase() + trip.direction.slice(1)}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Schedule</dt>
                                <dd className="text-sm text-gray-900">
                                  Start: {formatTime(trip.startTime)}
                                </dd>
                                <dd className="text-sm text-gray-500">
                                  {trip.endTime ? `End: ${formatTime(trip.endTime)}` : 'In Progress'}
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Performance</dt>
                                <dd className="text-sm text-gray-900">
                                  Passengers: {trip.passengerCount}
                                </dd>
                                <dd className="text-sm font-bold text-blue-600">
                                  LKR {trip.totalFare.toLocaleString()}
                                </dd>
                              </div>
                            </div>

                            <div className="flex justify-end">
                              <button className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                View Details
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mobile Cards */}
                    <div className={`${viewMode === 'card' ? 'lg:hidden' : ''} divide-y divide-gray-200`}>
                      {filteredTrips.map((trip) => (
                        <div key={trip._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a3 3 0 0 0-3 3v6a2 2 0 0 0 2 2h1v1a1 1 0 0 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1h1a2 2 0 0 0 2-2v-6a3 3 0 0 0-3-3zM10 6h4v1h-4V6zm-4 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                                </svg>
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                  Trip #{trip.tripNumber}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {getBusDisplay(trip.busId)}
                                </p>
                              </div>
                            </div>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${getStatusBadge(trip)}`}>
                              {getStatusDisplay(trip)}
                            </span>
                          </div>

                          {/* Route & Direction */}
                          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                            <div className="text-sm font-medium text-gray-900">
                              {getRouteDisplay(trip.routeId)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Direction: {trip.direction.charAt(0).toUpperCase() + trip.direction.slice(1)}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Schedule</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                Start: {formatTime(trip.startTime)}
                              </dd>
                              <dd className="text-sm text-gray-500">
                                {trip.endTime ? `End: ${formatTime(trip.endTime)}` : 'In Progress'}
                              </dd>
                              <dd className="text-xs text-gray-400">
                                {new Date(trip.date).toLocaleDateString()}
                              </dd>
                            </div>
                            <div>
                              <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                Passengers: {trip.passengerCount}
                              </dd>
                              <dd className="text-sm font-bold text-blue-600">
                                Fare: LKR {trip.totalFare.toLocaleString()}
                              </dd>
                              <dd className="text-sm text-gray-500">
                                Cash: LKR {trip.cashInHand.toLocaleString()}
                              </dd>
                            </div>
                          </div>

                          <div className="flex justify-end">
                            <button className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                              View Details
                            </button>
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
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} trips
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchTrips(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchTrips(pagination.page + 1)}
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
      </div>
    </div>
  );
}
