'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TripService, Trip } from '@/services/trip.service';

export default function ManagerTripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    limit: 10
  });

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user?.id) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        // Prepare filters based on current filter selection
        const filters: any = {
          page: pagination.currentPage,
          limit: pagination.limit,
          sort: '-startTime'
        };

        // Add date filters based on selected filter
        if (filter === 'today') {
          const today = new Date().toISOString().split('T')[0];
          filters.date = today;
        } else if (filter === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          filters.startDate = weekAgo.toISOString().split('T')[0];
        } else if (filter === 'month') {
          const monthAgo = new Date();
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          filters.startDate = monthAgo.toISOString().split('T')[0];
        }

        console.log('Fetching manager trips with filters:', filters);
        console.log('User details:', { id: user.id, role: user.role });
        
        const result = await TripService.getTripsByManager(user.id, filters);
        
        console.log('Manager trips result:', result);
        console.log('Trips data:', result.trips);
        
        setTrips(result.trips);
        setPagination(prev => ({
          ...prev,
          total: result.total,
          totalPages: result.totalPages,
          currentPage: result.currentPage
        }));

      } catch (err: any) {
        console.error('Error fetching manager trips:', err);
        setError(err.message || 'Failed to fetch trips');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [user?.id, filter, pagination.currentPage, pagination.limit]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-8 py-6 rounded-2xl shadow-lg max-w-md mx-auto text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">Error</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="relative">
              <div className="absolute -left-4 -top-4 w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-pulse"></div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent mb-3">
                Trip Management
              </h1>
              <p className="text-gray-600 text-lg">
                Monitor bus trips and their performance
              </p>
            </div>
            <div className="mt-6 sm:mt-0 flex items-center space-x-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200">
                <span className="text-sm font-semibold text-blue-700">
                  Total Trips: <span className="text-blue-900">{pagination.total}</span>
                </span>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Refresh</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-blue-600 transition-colors">
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <span>Status</span>
                </span>
              </label>
              <select
                value={filter === 'all' ? 'All Trips' : filter}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'All Trips') setFilter('all');
                  else setFilter(value as any);
                }}
                className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 py-3 px-4 bg-gradient-to-r from-white to-gray-50"
              >
                <option value="All Trips">All Trips</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-blue-600 transition-colors">
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0M9 17h6" />
                  </svg>
                  <span>Bus</span>
                </span>
              </label>
              <select className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 py-3 px-4 bg-gradient-to-r from-white to-gray-50">
                <option>All Buses</option>
              </select>
            </div>
            
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-3 group-hover:text-blue-600 transition-colors">
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4H8zM8 7v8a2 2 0 002 2h4a2 2 0 002-2V7M8 7H5a2 2 0 00-2 2v6a2 2 0 002 2h3m5-8h3a2 2 0 012 2v6a2 2 0 01-2 2h-3" />
                  </svg>
                  <span>Date</span>
                </span>
              </label>
              <input
                type="date"
                defaultValue="2025-07-18"
                className="w-full rounded-xl border-2 border-gray-200 shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 py-3 px-4 bg-gradient-to-r from-white to-gray-50"
              />
            </div>
            
            <div className="flex justify-center">
              <button className="group px-6 py-3 text-blue-600 hover:text-blue-800 font-semibold rounded-xl border-2 border-blue-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 transform hover:scale-105">
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span>Clear Filters</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Trip Records Header */}
        <div className="bg-gradient-to-r from-white to-blue-50 rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Trip Records ({trips.length} of {pagination.total})
            </h2>
          </div>
        </div>

        {/* Enhanced Trip Cards */}
        {trips.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-blue-100 rounded-full flex items-center justify-center">
                <span className="text-4xl">📅</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No trips found</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                {filter === 'today' 
                  ? 'No trips found for today. Try changing the filter to see trips from other periods.'
                  : `No trips found for the selected ${filter} period.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {trips.map((trip, index) => (
              <div 
                key={trip._id} 
                className="group bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
                  {/* Trip Details */}
                  <div className="lg:col-span-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>TRIP DETAILS</span>
                    </h3>
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <span className="text-white text-xl">🚍</span>
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-lg">Trip #{trip.tripNumber}</p>
                        <p className="text-sm text-gray-600 font-medium">
                          Bus: {typeof trip.busId === 'object' && trip.busId?.busNumber 
                            ? trip.busId.busNumber 
                            : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Route & Direction */}
                  <div className="lg:col-span-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>ROUTE & DIRECTION</span>
                    </h3>
                    <div className="space-y-2">
                      <p className="font-bold text-gray-900 text-lg">
                        {typeof trip.routeId === 'object' && trip.routeId?.routeName 
                          ? trip.routeId.routeName 
                          : 'Route Info N/A'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Direction:</span>
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700 capitalize">
                          {trip.direction}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="lg:col-span-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span>SCHEDULE</span>
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Start:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(trip.startTime).toLocaleTimeString('en-US', { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">End:</span>
                        <span className="font-semibold text-gray-900">
                          {trip.endTime 
                            ? new Date(trip.endTime).toLocaleTimeString('en-US', { 
                                hour: '2-digit', 
                                minute: '2-digit',
                                hour12: true 
                              })
                            : 'Ongoing'}
                        </span>
                      </div>
                      <div className="mt-3">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                          {new Date(trip.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="lg:col-span-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>STATUS</span>
                    </h3>
                    <div className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200 shadow-sm">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      {trip.endTime ? 'Completed' : 'Active'}
                    </div>
                  </div>

                  {/* Performance */}
                  <div className="lg:col-span-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span>PERFORMANCE</span>
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Passengers:</span>
                        <span className="font-bold text-gray-900">{trip.passengerCount || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Fare:</span>
                        <span className="font-bold text-green-600">LKR {(trip.totalFare || 0).toFixed(1)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Cash:</span>
                        <span className="font-bold text-blue-600">LKR {trip.cashInHand || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="lg:col-span-1">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span>ACTIONS</span>
                    </h3>
                    <button className="group w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300">
                      <span className="flex items-center justify-center space-x-2">
                        <svg className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>View Details</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
