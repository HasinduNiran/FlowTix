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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Trip Management</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Trips</h3>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => fetchTrips(1)}
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
            <h1 className="text-2xl font-bold text-gray-900">Trip Management</h1>
            <p className="text-gray-600 mt-1">
              Monitor bus trips and their performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Total Trips: <span className="font-semibold text-gray-900">{pagination.total}</span>
            </div>
            <button 
              onClick={() => fetchTrips(pagination.page)}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select 
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Trips</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>

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

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Trip Records ({filteredTrips.length} of {trips.length})
          </h3>
        </div>
        
        {filteredTrips.length === 0 ? (
          <div className="p-6 text-center">
            <span className="text-4xl mb-4 block">🚍</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {trips.length === 0 ? 'No Trips Found' : 'No Trips Match Filter'}
            </h3>
            <p className="text-gray-500">
              {trips.length === 0 
                ? 'No trips have been recorded for your buses yet.' 
                : 'No trips found for the selected filters.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                  <tr key={trip._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🚍</span>
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
                      <div className="text-sm text-gray-900">
                        Fare: LKR {trip.totalFare.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Cash: LKR {trip.cashInHand.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 px-3 py-1 text-sm border border-blue-600 rounded">
                          View Details
                        </button>
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
  );
}
