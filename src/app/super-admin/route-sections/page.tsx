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

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching initial data (routes and stops only)...');
      
      const [routesData, stopsData] = await Promise.all([
        RouteService.getAllRoutes(),
        StopService.getAllStops()
      ]);

      console.log('Fetched routes:', routesData);
      console.log('Fetched stops:', stopsData);

      setRoutes(routesData);
      setStops(stopsData);
      setRouteSections([]); // Don't load route sections by default
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setRoutes([]);
      setStops([]);
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
      // Filter route sections by selected route
      const filteredSections = routeSectionsData.filter(rs => rs.routeId._id === routeId);
      
      console.log('Fetched route sections:', filteredSections);
      setRouteSections(filteredSections);
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
      
      // Refresh route sections if a route is selected
      if (filterRoute) {
        await fetchRouteSections(filterRoute);
      }
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
        // Refresh route sections if a route is selected
        if (filterRoute) {
          await fetchRouteSections(filterRoute);
        }
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
      
      return matchesSearch;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'route':
          aValue = a.routeId.routeName;
          bValue = b.routeId.routeName;
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder="Search stops or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={!filterRoute}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
            />
          </div>
          
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">🔽</span>
            <select
              value={filterRoute}
              onChange={(e) => {
                setFilterRoute(e.target.value);
                if (e.target.value) {
                  fetchRouteSections(e.target.value);
                } else {
                  setRouteSections([]);
                }
              }}
              className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
            >
              <option value="">Select a Route</option>
              {routes.map((route) => (
                <option key={route._id} value={route._id}>
                  {route.code} - {route.name} ({route.startLocation} → {route.endLocation})
                </option>
              ))}
            </select>
            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">▼</span>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <span className="text-lg">➕</span>
          <span>Add Route Section</span>
        </button>
      </div>

      {/* Sort Controls - Only show when route is selected */}
      {filterRoute && routeSections.length > 0 && (
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-600">Sort by:</span>
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
              className={`px-3 py-1 rounded ${
                sortBy === field
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {field === 'createdAt' ? 'Created' : field.charAt(0).toUpperCase() + field.slice(1)}
              {sortBy === field && (
                <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Route Sections Table */}
      {filterRoute && routeSections.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fare
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedRouteSections.map((routeSection) => (
                  <tr key={routeSection._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {routeSection.order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {routeSection.stopId.stopName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {routeSection.stopId.sectionNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {routeSection.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      Rs. {routeSection.fare}
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(routeSection)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(routeSection._id)}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Delete"
                        >
                          🗑️
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

      {!filterRoute && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-500 text-lg">📋 Select a Route</div>
          <p className="text-gray-400 mt-2">
            Choose a route from the dropdown above to view and manage its route sections
          </p>
        </div>
      )}

      {filterRoute && filteredAndSortedRouteSections.length === 0 && !loading && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-gray-500 text-lg">📍 No Route Sections Found</div>
          <p className="text-gray-400 mt-2">
            {searchTerm
              ? 'No route sections match your search criteria'
              : 'This route has no sections yet. Create the first one to get started.'}
          </p>
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
                        {route.code} - {route.name} ({route.startLocation} → {route.endLocation})
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
  );
}

export default function RouteSectionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Route Sections Management</h1>
        <p className="text-gray-600 mt-2">
          Manage route sections, assign stops to routes, and configure fare structures
        </p>
      </div>
      <RouteSectionsManager />
    </div>
  );
}
