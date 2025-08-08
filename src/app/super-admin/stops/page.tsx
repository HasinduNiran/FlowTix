'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StopService, Stop } from '@/services/stop.service';
import { RouteService, Route } from '@/services/route.service';
import { Button } from '@/components/ui/Button';
import StopModal from '@/components/dashboard/StopModal';

export default function StopsPage() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredStops, setFilteredStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState(''); // Empty by default, user must select a route
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sectionSortOrder, setSectionSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [stopNameSortOrder, setStopNameSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [routeSortOrder, setRouteSortOrder] = useState<'asc' | 'desc' | null>(null);
  const [routeSearchTerm, setRouteSearchTerm] = useState('');
  const [showRouteSuggestions, setShowRouteSuggestions] = useState(false);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalStops, setTotalStops] = useState<number>(0);
  const itemsPerPage = 15;
  
  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  
  const router = useRouter();

  useEffect(() => {
    // Only fetch data if a route is selected or to get the initial routes list
    fetchData();
  }, [currentPage, searchTerm, selectedRoute, selectedStatus, sectionSortOrder, stopNameSortOrder, routeSortOrder]);

  useEffect(() => {
    // Filter routes based on search term
    if (routeSearchTerm.trim()) {
      const filtered = routes.filter(route =>
        route.code.toLowerCase().includes(routeSearchTerm.toLowerCase()) ||
        route.name.toLowerCase().includes(routeSearchTerm.toLowerCase())
      );
      setFilteredRoutes(filtered.slice(0, 5)); // Limit to 5 suggestions
      setShowRouteSuggestions(true); // Show suggestions when typing
    } else {
      setFilteredRoutes([]);
      setShowRouteSuggestions(false);
    }
  }, [routeSearchTerm, routes]);

  // Reset to page 1 when filters change (but not when page changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedRoute, selectedStatus, searchTerm]);

  const handleStopAdded = () => {
    fetchData(); // Reload data after adding new stop
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Always fetch routes
      const routesData = await RouteService.getAllRoutes();
      setRoutes(routesData);
      
      // Only fetch stops if a route is selected
      if (selectedRoute) {
        const stopsResponse = await StopService.getStopsWithPagination({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          routeId: selectedRoute, // Always pass the selected route
          isActive: selectedStatus !== 'all' ? selectedStatus : undefined,
          sort: sectionSortOrder ? 'sectionNumber' : 
                stopNameSortOrder ? 'stopName' : 
                routeSortOrder ? 'routeId' : 'stopName',
          order: sectionSortOrder || stopNameSortOrder || routeSortOrder || 'asc'
        });
        
        setStops(stopsResponse.data);
        setFilteredStops(stopsResponse.data);
        setTotalStops(stopsResponse.count);
        setTotalPages(stopsResponse.totalPages);
        
        if (currentPage > stopsResponse.totalPages && stopsResponse.totalPages > 0) {
          setCurrentPage(1); // Reset to page 1 if current page is out of bounds
        }
        
        setError(null);
      } else {
        // Clear stops when no route is selected
        setStops([]);
        setFilteredStops([]);
        setTotalStops(0);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data. Please try again later.');
      setStops([]);
      setFilteredStops([]);
    } finally {
      setLoading(false);
    }
  };

  // We no longer need to filter stops manually since filtering is handled by the backend API
  const filterStops = () => {
    // This is now just a placeholder to maintain compatibility
    // All filtering is now done in the fetchData method via API parameters
    if (!stops) {
      setFilteredStops([]);
    } else {
      setFilteredStops(stops);
    }
  };

  const handleSectionSort = () => {
    // Set new sort order
    const newOrder = (sectionSortOrder === null || sectionSortOrder === 'desc') ? 'asc' : 'desc';
    
    // Clear other sort orders
    setStopNameSortOrder(null);
    setRouteSortOrder(null);
    setSectionSortOrder(newOrder);
    
    // Reset to first page when sorting
    setCurrentPage(1);
  };

  const handleStopNameSort = () => {
    // Set new sort order
    const newOrder = (stopNameSortOrder === null || stopNameSortOrder === 'desc') ? 'asc' : 'desc';
    
    // Clear other sort orders
    setSectionSortOrder(null);
    setRouteSortOrder(null);
    setStopNameSortOrder(newOrder);
    
    // Reset to first page when sorting
    setCurrentPage(1);
  };

  const handleRouteSort = () => {
    // Set new sort order
    const newOrder = (routeSortOrder === null || routeSortOrder === 'desc') ? 'asc' : 'desc';
    
    // Clear other sort orders
    setSectionSortOrder(null);
    setStopNameSortOrder(null);
    setRouteSortOrder(newOrder);
    
    // Reset to first page when sorting
    setCurrentPage(1);
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm('Are you sure you want to delete this stop?')) return;

    try {
      await StopService.deleteStop(stopId);
      // Refresh data to get updated list from the backend
      fetchData();
    } catch (err) {
      setError('Failed to delete stop. Please try again.');
      console.error('Error deleting stop:', err);
    }
  };

  const getRouteDisplay = (routeId: string | { _id: string; routeName: string; routeNumber: string }) => {
    if (typeof routeId === 'string') {
      const route = routes.find(r => r._id === routeId);
      return route ? `${route.code} - ${route.name}` : 'Unknown Route';
    }
    return `${routeId.routeNumber} - ${routeId.routeName}`;
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getSelectedRouteDisplay = () => {
    if (!selectedRoute || selectedRoute === '') {
      return '';
    }
    if (selectedRoute === 'all') {
      return 'All Routes';
    }
    const route = routes.find(r => r._id === selectedRoute);
    return route ? `${route.code} - ${route.name}` : '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading stops...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center mb-6 md:mb-0">
                <div className="bg-red-100 p-4 rounded-2xl mr-6">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Bus Stops Management</h1>
                  <p className="text-gray-600">Manage bus stops, routes, and sections</p>
                </div>
              </div>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Stop
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow-lg rounded-2xl p-6 mb-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                placeholder="Search by name or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center">
                  Route Filter <span className="text-red-500 ml-1">*</span>
                  <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">Required</span>
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Select a route to view stops..."
                  value={routeSearchTerm || getSelectedRouteDisplay()}
                  onChange={(e) => {
                    setRouteSearchTerm(e.target.value);
                    setShowRouteSuggestions(true);
                    // Clear selected route if input is cleared
                    if (!e.target.value) {
                      setSelectedRoute('');
                    }
                  }}
                  onFocus={() => {
                    if (filteredRoutes.length > 0 || routeSearchTerm.trim() || routes.length > 0) {
                      setShowRouteSuggestions(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding to allow clicking on suggestions
                    setTimeout(() => setShowRouteSuggestions(false), 300);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
                />
                
                {/* Route Suggestions Dropdown */}
                {showRouteSuggestions && (routeSearchTerm ? filteredRoutes.length > 0 : routes.length > 0) && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                    {(routeSearchTerm ? filteredRoutes : routes.slice(0, 10)).map((route) => (
                      <div
                        key={route._id}
                        className="px-3 py-2 hover:bg-red-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent blur event
                          setSelectedRoute(route._id);
                          setRouteSearchTerm('');
                          setShowRouteSuggestions(false);
                        }}
                      >
                        <div className="font-medium text-gray-900">{route.code} - {route.name}</div>
                        <div className="text-sm text-gray-500">
                          Status: {route.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Clear route button */}
                {(routeSearchTerm || selectedRoute) && (
                  <button
                    type="button"
                    onClick={() => {
                      setRouteSearchTerm('');
                      setSelectedRoute('');
                      setShowRouteSuggestions(false);
                      setFilteredRoutes([]);
                    }}
                    className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex items-end">
              <Button
                onClick={fetchData}
                variant="outline"
                className="w-full hover:bg-gray-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Status and Pagination Info */}
        {!loading && (
          <div className="mb-6 p-4 bg-white rounded-2xl shadow-md border border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-900">{filteredStops.length}</span> stops
                {totalStops > 0 && (
                  <> out of <span className="font-medium text-gray-900">{totalStops}</span> total</>
                )}
                {selectedRoute !== 'all' && selectedRoute !== '' && (
                  <> in route <span className="font-medium text-gray-900">{getSelectedRouteDisplay()}</span></>
                )}
                {selectedStatus !== 'all' && (
                  <> with status <span className="font-medium text-gray-900">{selectedStatus}</span></>
                )}
                {searchTerm && (
                  <> matching <span className="font-medium text-gray-900">"{searchTerm}"</span></>
                )}
              </div>
              <div className="text-sm text-gray-600">
                Page <span className="font-medium text-gray-900">{currentPage}</span> of{" "}
                <span className="font-medium text-gray-900">{totalPages || 1}</span>
              </div>
            </div>
          </div>
        )}

        {/* Stops Table */}
        {(filteredStops.length > 0 || loading) && (
          <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={handleStopNameSort}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Stop Details</span>
                      <div className="flex flex-col">
                        <svg 
                          className={`w-3 h-3 ${stopNameSortOrder === 'asc' ? 'text-red-600' : 'text-gray-400'} transition-colors`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <svg 
                          className={`w-3 h-3 -mt-1 ${stopNameSortOrder === 'desc' ? 'text-red-600' : 'text-gray-400'} transition-colors`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={handleRouteSort}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Route</span>
                      <div className="flex flex-col">
                        <svg 
                          className={`w-3 h-3 ${routeSortOrder === 'asc' ? 'text-red-600' : 'text-gray-400'} transition-colors`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <svg 
                          className={`w-3 h-3 -mt-1 ${routeSortOrder === 'desc' ? 'text-red-600' : 'text-gray-400'} transition-colors`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                    onClick={handleSectionSort}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Section</span>
                      <div className="flex flex-col">
                        <svg 
                          className={`w-3 h-3 ${sectionSortOrder === 'asc' ? 'text-red-600' : 'text-gray-400'} transition-colors`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                        </svg>
                        <svg 
                          className={`w-3 h-3 -mt-1 ${sectionSortOrder === 'desc' ? 'text-red-600' : 'text-gray-400'} transition-colors`} 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                        <span className="ml-3 text-gray-600">Loading stops...</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredStops.map((stop) => (
                  <tr key={stop._id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg mr-3 ${stop.isActive ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <svg className={`w-5 h-5 ${stop.isActive ? 'text-green-600' : 'text-gray-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{stop.stopName}</div>
                          <div className="text-sm text-gray-500">Code: {stop.stopCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getRouteDisplay(stop.routeId!)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        #{stop.sectionNumber}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        {/* View Button */}
                        <button
                          onClick={() => router.push(`/super-admin/stops/${stop._id}`)}
                          className="group relative p-3 text-gray-500 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                          title="View Stop Details"
                        >
                          <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                        
                        {/* Edit Button */}
                        <button
                          onClick={() => router.push(`/super-admin/stops/${stop._id}/edit`)}
                          className="group relative p-3 text-gray-500 hover:text-emerald-600 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-100 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                          title="Edit Stop"
                        >
                          <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-green-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                        
                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteStop(stop._id)}
                          className="group relative p-3 text-gray-500 hover:text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-100 rounded-xl transition-all duration-300 transform hover:scale-110 hover:shadow-md"
                          title="Delete Stop"
                        >
                          <svg className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-400 to-pink-500 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Status and Pagination Info */}
        {!loading && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-blue-800 font-medium text-lg">
                {`Showing ${filteredStops.length} of ${totalStops} stops for ${getSelectedRouteDisplay()}
                ${selectedStatus !== 'all' ? ` (${selectedStatus} only)` : ''}
                ${totalPages > 1 ? ` (Page ${currentPage} of ${totalPages})` : ''}`}
              </p>
            </div>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center text-sm text-gray-700">
              <span>
                Showing page {currentPage} of {totalPages} ({itemsPerPage} items per page)
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === 1
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPage === page
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                {totalPages > 5 && (
                  <>
                    <span className="px-2 py-2 text-gray-500">...</span>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        currentPage === totalPages
                          ? 'bg-red-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>
              
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentPage === totalPages
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {filteredStops.length === 0 && !loading && (
          <div className="bg-white shadow-lg rounded-2xl p-12 text-center border border-gray-200">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
              </svg>
            </div>
            {!selectedRoute ? (
              <>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Please Select a Route First</h3>
                <p className="text-gray-600 mb-6">
                  You must select a route to view its stops. Use the Route Filter above to select a route.
                </p>
                <div className="flex justify-center">
                  <div className="animate-pulse flex items-center mt-4">
                    <svg className="w-6 h-6 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    <span className="text-red-500 font-medium">Select a route above</span>
                  </div>
                </div>
              </>
            ) : filteredStops.length === 0 && totalStops === 0 ? (
              <>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Stops Available</h3>
                <p className="text-gray-600 mb-6">
                  No bus stops have been created yet for the selected route: <span className="font-medium">{getSelectedRouteDisplay()}</span>
                </p>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Add New Stop
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No stops found</h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || selectedStatus !== 'all' 
                    ? 'Try adjusting your filters to see more results.' 
                    : `No stops found for the selected route: ${getSelectedRouteDisplay()}`}
                </p>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Add Stop Modal */}
      <StopModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onStopAdded={handleStopAdded}
      />
    </div>
  );
}
