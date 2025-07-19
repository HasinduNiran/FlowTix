'use client';

import { useState, useEffect } from 'react';
import { RouteSectionService, type RouteSection } from '@/services/routeSection.service';
import { RouteService, type Route } from '@/services/route.service';
import { StopService, type Stop } from '@/services/stop.service';

// RouteSectionsManager component
function RouteSectionsManager() {
  const [routeSections, setRouteSections] = useState<RouteSection[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRouteSection, setSelectedRouteSection] = useState<RouteSection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoute, setFilterRoute] = useState('');
  const [sortBy, setSortBy] = useState<'route' | 'order' | 'fare' | 'createdAt'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form state
  const [formData, setFormData] = useState({
    routeId: '',
    stopId: '',
    category: '',
    fare: 0,
    order: 0,
    isActive: true
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Current filterRoute:', filterRoute);
    console.log('Total routeSections:', routeSections.length);
  }, [filterRoute, routeSections]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching initial data...');
      
      // Only fetch routes and stops initially, not route sections
      const [routesData, stopsData] = await Promise.all([
        RouteService.getAllRoutes(),
        StopService.getAllStops()
      ]);

      console.log('Fetched routes:', routesData);
      console.log('Fetched stops:', stopsData);

      setRoutes(routesData);
      setStops(stopsData);
      setRouteSections([]); // Start with empty route sections - user must select a route
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setRoutes([]);
      setStops([]);
      setRouteSections([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRouteSections = async () => {
    try {
      setLoading(true);
      console.log('Fetching all route sections...');
      
      const routeSectionsData = await RouteSectionService.getAllRouteSections();
      console.log('All fetched route sections:', routeSectionsData);
      
      setRouteSections(routeSectionsData);
    } catch (error) {
      console.error('Error fetching all route sections:', error);
      setRouteSections([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteSections = async (routeId: string) => {
    try {
      setLoading(true);
      console.log('Fetching route sections for route:', routeId);
      
      const routeSectionsData = await RouteSectionService.getAllRouteSections();
      console.log('All fetched route sections:', routeSectionsData);
      
      // Always set all route sections - filtering will be handled by the filter logic
      setRouteSections(routeSectionsData);
    } catch (error) {
      console.error('Error fetching route sections:', error);
      setRouteSections([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedRouteSection) {
        await RouteSectionService.updateRouteSection(selectedRouteSection._id, formData);
      } else {
        await RouteSectionService.createRouteSection(formData);
      }
      
      // Refresh data based on current filter state
      if (filterRoute === 'all') {
        await fetchAllRouteSections();
      } else if (filterRoute && filterRoute !== '') {
        await fetchRouteSections(filterRoute);
      }
      // If filterRoute is empty, don't fetch anything - user must select a route
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error saving route section. Please try again.');
    }
  };

  const handleEdit = (routeSection: RouteSection) => {
    setSelectedRouteSection(routeSection);
    setFormData({
      routeId: routeSection.routeId._id,
      stopId: routeSection.stopId._id,
      category: routeSection.category,
      fare: routeSection.fare,
      order: routeSection.order,
      isActive: routeSection.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this route section?')) {
      try {
        await RouteSectionService.deleteRouteSection(id);
        
        // Refresh data based on current filter state
        if (filterRoute === 'all') {
          await fetchAllRouteSections();
        } else if (filterRoute && filterRoute !== '') {
          await fetchRouteSections(filterRoute);
        }
        // If filterRoute is empty, don't fetch anything - user must select a route
      } catch (error) {
        console.error('Error deleting route section:', error);
        alert('Error deleting route section. Please try again.');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      routeId: '',
      stopId: '',
      category: '',
      fare: 0,
      order: 0,
      isActive: true
    });
    setSelectedRouteSection(null);
  };

  const filteredAndSortedRouteSections = routeSections
    .filter(rs => {
      const matchesSearch = searchTerm === '' || 
        rs.stopId.stopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rs.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      // If filterRoute is empty (Select a Route), show nothing
      // If filterRoute is 'all', show all route sections
      // Otherwise, filter by specific route ID
      const matchesRoute = filterRoute === '' ? false : 
                          filterRoute === 'all' ? true : 
                          rs.routeId._id === filterRoute;
      
      return matchesSearch && matchesRoute;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'route':
          aValue = a.routeId.routeName || '';
          bValue = b.routeId.routeName || '';
          break;
        case 'order':
          aValue = a.order;
          bValue = b.order;
          break;
        case 'fare':
          aValue = a.fare;
          bValue = b.fare;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Route Sections Management</h1>
                <p className="text-gray-600 text-sm">
                  Manage route sections, assign stops to routes, and configure fare structures
                </p>
              </div>
              <div className="text-3xl text-gray-300">
                🚌
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Route Sections
                </h2>
                <p className="text-gray-600">
                  View all route sections or filter by specific route
                </p>
              </div>
              
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-grow lg:w-80">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search stops or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="relative flex-grow lg:w-80">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <select
                    value={filterRoute}
                    onChange={(e) => {
                      const selectedRoute = e.target.value;
                      console.log('Route filter changed to:', selectedRoute);
                      setFilterRoute(selectedRoute);
                      
                      if (selectedRoute === '') {
                        // "Select a Route" - clear route sections
                        console.log('Clearing route sections - user must select a route');
                        setRouteSections([]);
                      } else if (selectedRoute === 'all') {
                        // "All Routes" selected - fetch all route sections
                        console.log('Fetching all route sections');
                        fetchAllRouteSections();
                      } else {
                        // Specific route selected - fetch sections for that route only
                        console.log('Fetching sections for specific route:', selectedRoute);
                        fetchRouteSections(selectedRoute);
                      }
                    }}
                    className="pl-12 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none"
                  >
                    <option value="">Select a Route</option>
                    <option value="all">All Routes</option>
                    {routes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.code} - {route.name} ({route.startLocation} → {route.endLocation})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Route Section
                </button>
              </div>
            </div>

            {/* Sort Controls - Only show when there are route sections */}
            {filteredAndSortedRouteSections.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-blue-800 font-medium text-lg">
                      Showing {filteredAndSortedRouteSections.length} route {filteredAndSortedRouteSections.length === 1 ? 'section' : 'sections'}
                      {filterRoute === 'all' ? (
                        <span className="text-blue-600 ml-1">
                          from all routes
                        </span>
                      ) : filterRoute && filterRoute !== '' ? (
                        <span className="text-blue-600 ml-1">
                          for selected route
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-blue-700 font-medium">Sort by:</span>
                    {['order', 'fare', 'createdAt'].map((field) => (
                      <button
                        key={field}
                        onClick={() => {
                          if (sortBy === field) {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy(field as typeof sortBy);
                            setSortOrder('asc');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          sortBy === field
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-blue-600 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        {field === 'createdAt' ? 'Created' : field.charAt(0).toUpperCase() + field.slice(1)}
                        {sortBy === field && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Route Sections Table */}
            {filteredAndSortedRouteSections.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Stop
                        </th>
                        {(filterRoute === '' || filterRoute === 'all') && (
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Route
                          </th>
                        )}
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Fare
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredAndSortedRouteSections.map((routeSection) => (
                        <tr key={routeSection._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">
                                  {routeSection.order}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {routeSection.stopId.stopName}
                              </div>
                              <div className="text-sm text-gray-500">
                                Section {routeSection.stopId.sectionNumber}
                              </div>
                            </div>
                          </td>
                          {(filterRoute === '' || filterRoute === 'all') && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {routeSection.routeId.routeName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {routeSection.routeId.routeNumber}
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-3 py-1 text-xs font-medium bg-gray-100 text-gray-900 rounded-full">
                              {routeSection.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-blue-600">
                              Rs. {routeSection.fare.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              routeSection.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {routeSection.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleEdit(routeSection)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Edit Route Section"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(routeSection._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete Route Section"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {routeSections.length === 0 && !loading && filterRoute !== '' && (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a3 3 0 0 0-3 3v6a2 2 0 0 0 2 2h1v1a1 1 0 0 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1h1a2 2 0 0 0 2-2v-6a3 3 0 0 0-3-3zM10 6h4v1h-4V6zm-4 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Route Sections Found</h3>
                  <p className="text-gray-600 mb-4">
                    {filterRoute === 'all' 
                      ? 'No route sections exist in the system yet.'
                      : 'This route has no sections yet. Create the first one to get started.'
                    }
                  </p>
                  <button
                    onClick={() => {
                      resetForm();
                      if (filterRoute && filterRoute !== 'all') {
                        setFormData(prev => ({...prev, routeId: filterRoute}));
                      }
                      setShowModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Route Section
                  </button>
                </div>
              </div>
            )}

            {/* Default state - no route selected */}
            {filterRoute === '' && !loading && (
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border-2 border-dashed border-blue-300">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Route</h3>
                  <p className="text-gray-600 mb-4">
                    Please select a route from the dropdown above to view its sections, or choose "All Routes" to see all route sections.
                  </p>
                </div>
              </div>
            )}

            {routeSections.length > 0 && filteredAndSortedRouteSections.length === 0 && !loading && (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Matching Route Sections</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm
                      ? 'No route sections match your search criteria. Try adjusting your search.'
                      : filterRoute === 'all'
                      ? 'No route sections found in the system.'
                      : 'This route has no sections yet. Create the first one to get started.'}
                  </p>
                  {(!searchTerm || (filterRoute && filterRoute !== 'all')) && (
                    <button
                      onClick={() => {
                        resetForm();
                        if (filterRoute && filterRoute !== 'all') {
                          setFormData(prev => ({...prev, routeId: filterRoute}));
                        }
                        setShowModal(true);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Route Section
                    </button>
                  )}
                </div>
              </div>
            )}

      {/* Add Route Section Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              resetForm();
            }
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all duration-300 ease-out scale-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedRouteSection ? 'Edit Route Section' : 'Create New Route Section'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Configure route section details</p>
              </div>
              <button 
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
              >
                <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Form Content */}
            <div className="p-6">
              <form id="routeSectionForm" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Route
                  </label>
                  <select
                    value={formData.routeId}
                    onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select a route</option>
                    {routes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.routeNumber} - {route.routeName} ({route.startPoint} → {route.endPoint})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stop
                  </label>
                  <select
                    value={formData.stopId}
                    onChange={(e) => setFormData({ ...formData, stopId: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select a stop</option>
                    {stops.map((stop) => (
                      <option key={stop._id} value={stop._id}>
                        {stop.stopName} - Section {stop.sectionNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    placeholder="e.g., Regular, Express, VIP"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fare (Rs.)
                    </label>
                    <input
                      type="number"
                      value={formData.fare}
                      onChange={(e) => setFormData({ ...formData, fare: Number(e.target.value) })}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                      required
                      min="0"
                      placeholder="1"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  >
                    <option value="true">✅ Active</option>
                    <option value="false">❌ Inactive</option>
                  </select>
                </div>
              </form>
            </div>
            
            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="routeSectionForm"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {selectedRouteSection ? 'Update Route Section' : 'Create Route Section'}
              </button>
            </div>
          </div>
        </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}export default function RouteSectionsPage() {
  return (
    <RouteSectionsManager />
  );
}
