'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TripService, Trip } from '@/services/trip.service';
import { RouteService } from '@/services/route.service';
import { BusService } from '@/services/bus.service';
import { DataTable } from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [directionFilter, setDirectionFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [hasResults, setHasResults] = useState<boolean>(true);
  const itemsPerPage = 15;

  // Fetch initial data on component mount
  useEffect(() => {
    fetchTrips();
    fetchRoutes();
    fetchBuses();
  }, []);

  // Fetch trips when filters change
  useEffect(() => {
    setCurrentPage(1); // Reset to first page when filters change
    fetchTrips();
  }, [dateFilter, directionFilter]);

  // Separate effect for search to handle debouncing and immediate reset to page 1
  useEffect(() => {
    if (searchTerm !== '') {
      setCurrentPage(1); // Always reset to page 1 when searching
    }
    // Debounce search
    const timeoutId = setTimeout(() => {
      fetchTrips();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fetch trips when page changes
  useEffect(() => {
    if (trips.length > 0 || currentPage === 1) { // Only fetch if we have data or it's the first page
      fetchTrips();
    }
  }, [currentPage]);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = {
        date: dateFilter,
        direction: directionFilter !== 'all' ? directionFilter : undefined,
        search: searchTerm || undefined
      };
      
      const response = await TripService.getTripsWithPagination(
        currentPage,
        itemsPerPage,
        filters
      );
      
      setTrips(response.trips || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
      setHasResults(response.hasResults !== false);
    } catch (err) {
      console.error('Failed to fetch trips:', err);
      setError('Failed to load trips. Please try again later.');
      setTrips([]);
      setTotalPages(1);
      setTotalCount(0);
      setHasResults(false);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const routeData = await RouteService.getAllRoutes();
      setRoutes(routeData);
    } catch (err) {
      console.error('Error fetching routes:', err);
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

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm('Are you sure you want to delete this trip?')) {
      try {
        await TripService.deleteTrip(tripId);
        fetchTrips(); // Refresh the list
      } catch (err: any) {
        alert(err.message || 'Failed to delete trip');
      }
    }
  };

  const getRouteName = (routeId: string | any) => {
    if (typeof routeId === 'object' && routeId) {
      return routeId.routeName || routeId.name || 'Unknown Route';
    }
    const route = routes.find(route => route._id === routeId);
    return route?.name || route?.routeName || 'Unknown Route';
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

  const getDirectionColor = (direction: string) => {
    switch (direction?.toLowerCase()) {
      case 'forward':
        return 'text-green-600 bg-green-50';
      case 'return':
        return 'text-blue-600 bg-blue-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  // Table columns configuration
  const columns = [
    { 
      header: 'Trip #', 
      accessor: 'tripNumber' as keyof Trip,
      cell: (value: any) => (
        <span className="font-bold text-blue-600">#{value}</span>
      )
    },
    { 
      header: 'Route', 
      accessor: 'routeId' as keyof Trip,
      cell: (value: any) => (
        <div className="text-sm font-medium">{getRouteName(value)}</div>
      )
    },
    { 
      header: 'Bus', 
      accessor: 'busId' as keyof Trip,
      cell: (value: any) => (
        <span className="text-sm font-medium">{getBusNumber(value)}</span>
      )
    },
    { 
      header: 'Direction', 
      accessor: 'direction' as keyof Trip,
      cell: (value: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDirectionColor(value)}`}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'}
        </span>
      )
    },
    { 
      header: 'From Section', 
      accessor: 'fromStopSection' as keyof Trip,
      cell: (value: any) => (
        <div>
          <div className="text-sm font-medium">{value?.sectionName}</div>
          <div className="text-xs text-gray-500">Section #{value?.sectionNumber}</div>
        </div>
      )
    },
    { 
      header: 'To Section', 
      accessor: 'toStopSection' as keyof Trip,
      cell: (value: any) => (
        <div>
          <div className="text-sm font-medium">{value?.sectionName || 'End of Route'}</div>
          {value?.sectionNumber && (
            <div className="text-xs text-gray-500">Section #{value.sectionNumber}</div>
          )}
        </div>
      )
    },
    { 
      header: 'Start Time', 
      accessor: 'startTime' as keyof Trip,
      cell: (value: any) => (
        <div className="text-sm">
          <div>{formatDate(value)}</div>
          <div className="text-xs text-gray-500">{formatTime(value)}</div>
        </div>
      )
    },
    { 
      header: 'Status', 
      accessor: 'endTime' as keyof Trip,
      cell: (value: any, row?: Trip) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value ? 'text-green-600 bg-green-50' : 'text-yellow-600 bg-yellow-50'
        }`}>
          {value ? 'Completed' : 'In Progress'}
        </span>
      )
    },
    { 
      header: 'Passengers', 
      accessor: 'passengerCount' as keyof Trip,
      cell: (value: any) => (
        <span className="font-medium">{value || 0}</span>
      )
    },
    { 
      header: 'Cash in Hand', 
      accessor: 'cashInHand' as keyof Trip,
      cell: (value: any) => (
        <span className="font-medium text-blue-600">Rs. {typeof value === 'number' ? value.toFixed(2) : '0.00'}</span>
      )
    },
    { 
      header: 'Total Fare', 
      accessor: 'totalFare' as keyof Trip,
      cell: (value: any) => (
        <span className="font-medium text-green-600">Rs. {typeof value === 'number' ? value.toFixed(2) : '0.00'}</span>
      )
    },
    { 
      header: 'Difference', 
      accessor: 'difference' as keyof Trip,
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
      header: 'Actions',
      accessor: '_id' as keyof Trip,
      cell: (id: any) => (
        <div className="flex space-x-2 justify-center">
          <button
            onClick={() => handleDeleteTrip(id)}
            className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
            title="Delete Trip"
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
                  Trips Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage and monitor all bus trips in the system
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
                  <span className="text-blue-600 font-semibold">Total:</span>
                  <span className="text-blue-800 font-bold">{totalCount}</span>
                </div>
                <Button 
                  onClick={fetchTrips}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <Input
                  id="dateFilter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Trips
                </label>
                <Input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by trip #, route, bus..."
                  className="w-full"
                />
              </div>
              
              <div>
                <label htmlFor="direction" className="block text-sm font-medium text-gray-700 mb-2">
                  Direction
                </label>
                <select
                  id="direction"
                  value={directionFilter}
                  onChange={(e) => setDirectionFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="all">All Directions</option>
                  <option value="forward">Forward</option>
                  <option value="return">Return</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setDirectionFilter('all');
                    setCurrentPage(1);
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
                    <Button onClick={fetchTrips} variant="primary">
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-gray-600 text-sm">
                      Showing {trips?.length || 0} of {totalCount} trips (Page {currentPage} of {totalPages})
                      {searchTerm && <span> • Filtered by: "{searchTerm}"</span>}
                    </div>
                    {!hasResults && searchTerm && <span className="text-red-600 font-medium"> • No results found</span>}
                  </div>
                  
                  <DataTable
                    columns={columns}
                    data={trips}
                    emptyMessage="No trips found matching your criteria"
                    keyExtractor={(trip) => trip._id}
                  />
                </div>

                {/* Pagination Controls */}
                {hasResults && totalPages > 1 && (
                  <div className="bg-white rounded-lg shadow-md mt-6 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing page {currentPage} of {totalPages} ({totalCount} total trips)
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center space-x-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          <span>Previous</span>
                        </button>
                        
                        {/* Page Numbers */}
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const page = i + 1;
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 text-sm rounded-md ${
                                  page === currentPage
                                    ? 'bg-blue-600 text-white'
                                    : 'border border-gray-300 hover:bg-gray-50'
                                }`}
                              >
                                {page}
                              </button>
                            );
                          })}
                        </div>
                        
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center space-x-1"
                        >
                          <span>Next</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Filter Summary */}
          {(directionFilter !== 'all' || searchTerm) && (
            <div className="bg-blue-50 border-t border-blue-200 p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-blue-700 font-medium">Active Filters:</span>
                {directionFilter !== 'all' && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Direction: {directionFilter.charAt(0).toUpperCase() + directionFilter.slice(1)}
                  </span>
                )}
                {searchTerm && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Search: "{searchTerm}"
                  </span>
                )}
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Date: {formatDate(dateFilter)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
