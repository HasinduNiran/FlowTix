'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RouteService, Route } from '@/services/route.service';
import { RouteSectionService, RouteSection } from '@/services/routeSection.service';
import { Toast } from '@/components/ui/Toast';

interface OwnerRouteSection extends RouteSection {
  routeInfo?: Route;
}

export default function RouteSectionsPage() {
  const { user } = useAuth();
  const [routeSections, setRouteSections] = useState<OwnerRouteSection[]>([]);
  const [ownerRoutes, setOwnerRoutes] = useState<Route[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalPages: 0
  });

  // Categories available for route sections (kept for reference but not used in editing)

  // Check permissions - only bus owners should access this page
  useEffect(() => {
    if (user && user.role !== 'bus-owner') {
      setToast({ message: 'Access denied. Only bus owners can access this page.', type: 'error' });
      return;
    }
  }, [user]);

  const fetchOwnerRoutes = useCallback(async () => {
    if (!user?.id) return;

    try {
      const routes = await RouteService.getRoutesByOwner(user.id);
      setOwnerRoutes(routes);
    } catch (error) {
      console.error('Error fetching owner routes:', error);
      setToast({ message: 'Failed to load your routes', type: 'error' });
    }
  }, [user?.id]);

  const fetchRouteSections = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const sections = await RouteSectionService.getRouteSectionsByOwner(user.id);
      setRouteSections(sections);
    } catch (error) {
      console.error('Error fetching route sections:', error);
      setToast({ message: 'Failed to load route sections', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.role === 'bus-owner') {
      fetchOwnerRoutes();
      fetchRouteSections();
    }
  }, [user, fetchOwnerRoutes, fetchRouteSections]);

  // Filter route sections by selected route
  const filteredRouteSections = selectedRoute 
    ? routeSections.filter(section => section.routeId._id === selectedRoute)
    : routeSections;
    
  // Calculate pagination values
  const totalFiltered = filteredRouteSections.length;
  const totalPages = Math.max(1, Math.ceil(totalFiltered / pagination.limit));
  
  // Update totalPages when filtered sections change
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      totalPages: totalPages
    }));
  }, [totalFiltered, pagination.limit]);
  
  // Handle page changes
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({
        ...prev,
        page: newPage
      }));
    }
  };
  
  // Handle items per page changes
  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({
      ...prev,
      limit: newLimit,
      page: 1, // Reset to first page when changing limit
      totalPages: Math.max(1, Math.ceil(totalFiltered / newLimit))
    }));
  };
  
  // Get current page items
  const startIndex = (pagination.page - 1) * pagination.limit;
  const endIndex = Math.min(startIndex + pagination.limit, totalFiltered);
  const paginatedRouteSections = pagination.limit === 9999 
    ? filteredRouteSections 
    : filteredRouteSections.slice(startIndex, endIndex);

  // Only show the page if user is a bus owner
  if (user && user.role !== 'bus-owner') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only bus owners can access this page.</p>
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
              <div className="flex items-start sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 truncate">
                    My Route Sections
                  </h1>
                  <p className="text-gray-600 text-xs sm:text-sm lg:text-base leading-relaxed">
                    Manage route sections and fare structures for your bus routes
                  </p>
                </div>
                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a3 3 0 0 0-3 3v6a2 2 0 0 0 2 2h1v1a1 1 0 0 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1h1a2 2 0 0 0 2-2v-6a3 3 0 0 0-3-3zM10 6h4v1h-4V6zm-4 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Route Filter */}
          {ownerRoutes.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:space-x-4">
                <label className="text-sm font-medium text-gray-700 flex-shrink-0">Filter by Route:</label>
                <div className="relative flex-1 sm:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <select
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    className="pl-10 pr-8 py-2.5 sm:py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none text-sm sm:text-base"
                  >
                    <option value="">All Routes</option>
                    {ownerRoutes.map(route => (
                      <option key={route._id} value={route._id}>
                        {route.code} - {route.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* No Routes Message */}
          {ownerRoutes.length === 0 && !loading && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 sm:p-12 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a3 3 0 0 0-3 3v6a2 2 0 0 0 2 2h1v1a1 1 0 0 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1h1a2 2 0 0 0 2-2v-6a3 3 0 0 0-3-3zM10 6h4v1h-4V6zm-4 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Routes Found</h3>
              <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                You don't have any buses assigned to routes yet. Contact your administrator to get bus routes assigned.
              </p>
            </div>
          )}

          {/* Route Sections List */}
          {ownerRoutes.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-blue-100 rounded-full flex-shrink-0">
                      <svg className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Route Sections</h2>
                    {filteredRouteSections.length > 0 && (
                      <span className="text-sm text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                        {filteredRouteSections.length} sections
                      </span>
                    )}
                  </div>

                  {/* Enhanced View Toggle Buttons */}
                  {filteredRouteSections.length > 0 && (
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

              {loading ? (
                <div className="p-6 sm:p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-gray-600 text-sm sm:text-base">Loading route sections...</p>
                </div>
              ) : filteredRouteSections.length === 0 ? (
                <div className="p-6 sm:p-8 text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No Route Sections</h3>
                  <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto">
                    {selectedRoute 
                      ? 'No route sections found for the selected route.' 
                      : 'No route sections have been configured yet.'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  {viewMode === 'table' && (
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Route
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Stop & Section #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Fare (LKR)
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Order
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedRouteSections.map((section) => (
                            <tr key={section._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {section.routeId.routeNumber}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {section.routeId.routeName}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {section.stopId.stopName}
                                  </div>
                                  <div className="text-sm text-gray-500 flex items-center">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
                                      Section #{section.stopId.sectionNumber || "N/A"}
                                    </span>
                                    Code: {section.stopId.stopCode}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                                  {section.category.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-bold text-blue-600">
                                  Rs. {section.fare.toFixed(2)}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <span className="text-blue-600 font-bold text-sm">
                                    {section.order}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  section.isActive 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {section.isActive ? 'Active' : 'Inactive'}
                                </span>
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
                          {paginatedRouteSections.map((section) => (
                            <div key={section._id} className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-blue-300">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-blue-600 font-bold text-lg">
                                      {section.order}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                                      {section.stopId.stopName}
                                    </h3>
                                    <div className="flex items-center">
                                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full mr-2">
                                        Section #{section.stopId.sectionNumber || "N/A"}
                                      </span>
                                      <span className="text-sm text-gray-500">
                                        Code: {section.stopId.stopCode}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                                  section.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {section.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>

                              {/* Route Info */}
                              <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                <div className="text-sm font-medium text-gray-900">
                                  {section.routeId.routeName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {section.routeId.routeNumber}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Category</dt>
                                  <dd>
                                    <span className="inline-flex px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                                      {section.category.replace('_', ' ')}
                                    </span>
                                  </dd>
                                </div>
                                <div>
                                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Fare</dt>
                                  <dd className="text-xl font-bold text-blue-600">
                                    Rs. {section.fare.toFixed(2)}
                                  </dd>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Mobile Cards */}
                      <div className={`${viewMode === 'card' ? 'lg:hidden' : ''} divide-y divide-gray-200`}>
                        {paginatedRouteSections.map((section) => (
                          <div key={section._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-blue-600 font-bold text-sm">
                                    {section.order}
                                  </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                                    {section.stopId.stopName}
                                  </h3>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                      Section #{section.stopId.sectionNumber || "N/A"}
                                    </span>
                                    <span className="text-sm text-gray-500">
                                      Code: {section.stopId.stopCode}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${
                                section.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {section.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            {/* Route Info */}
                            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                              <div className="text-sm font-medium text-gray-900">
                                {section.routeId.routeName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {section.routeId.routeNumber}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Category</dt>
                                <dd className="mt-1">
                                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                                    {section.category.replace('_', ' ')}
                                  </span>
                                </dd>
                              </div>
                              <div>
                                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wider">Fare</dt>
                                <dd className="mt-1 text-lg font-bold text-blue-600">
                                  Rs. {section.fare.toFixed(2)}
                                </dd>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          
          {/* Pagination Controls */}
          {filteredRouteSections.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mt-4 sm:mt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Results info */}
                <div className="flex items-center gap-4">
                  <p className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(endIndex, totalFiltered)} of {totalFiltered} results
                  </p>
                  
                  {/* Items per page selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Show:</label>
                    <select
                      value={pagination.limit}
                      onChange={(e) => handleLimitChange(Number(e.target.value))}
                      className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={9999}>All</option>
                    </select>
                    <span className="text-sm text-gray-700">per page</span>
                  </div>
                </div>

                {/* Pagination buttons */}
                {pagination.totalPages > 1 && pagination.limit !== 9999 && (
                  <div className="flex items-center space-x-2">
                    {/* Previous button */}
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {/* First page */}
                      {pagination.page > 3 && (
                        <>
                          <button
                            onClick={() => handlePageChange(1)}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            1
                          </button>
                          {pagination.page > 4 && (
                            <span className="px-2 py-2 text-sm text-gray-500">...</span>
                          )}
                        </>
                      )}

                      {/* Current page and surrounding pages */}
                      {pagination.totalPages > 0 && Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        // Calculate the correct starting page
                        let startPage = 1;
                        if (pagination.page > 2) {
                          if (pagination.page > pagination.totalPages - 2) {
                            // Near the end, show last 5 pages or fewer
                            startPage = Math.max(1, pagination.totalPages - 4);
                          } else {
                            // In the middle, center around current page
                            startPage = pagination.page - 2;
                          }
                        }
                        
                        const page = startPage + i;
                        if (page > pagination.totalPages) return null;
                        
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              page === pagination.page
                                ? 'bg-blue-600 text-white border border-blue-600'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      {/* Last page */}
                      {pagination.page < pagination.totalPages - 2 && (
                        <>
                          {pagination.page < pagination.totalPages - 3 && (
                            <span className="px-2 py-2 text-sm text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(pagination.totalPages)}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            {pagination.totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Next button */}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Toast Notification */}
          {toast && (
            <Toast
              isOpen={true}
              title={toast.type === 'success' ? 'Success' : 'Error'}
              message={toast.message}
              type={toast.type}
              onClose={() => setToast(null)}
              duration={5000}
            />
          )}
        </div>
      </div>
    </div>
  );
}
