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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {selectedRouteSection ? 'Edit Route Section' : 'Add Route Section'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route
                </label>
                <select
                  value={formData.routeId}
                  onChange={(e) => setFormData({ ...formData, routeId: e.target.value })}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stop
                </label>
                <select
                  value={formData.stopId}
                  onChange={(e) => setFormData({ ...formData, stopId: e.target.value })}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  placeholder="e.g., Regular, Express, VIP"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fare (Rs.)
                </label>
                <input
                  type="number"
                  value={formData.fare}
                  onChange={(e) => setFormData({ ...formData, fare: Number(e.target.value) })}
                  required
                  min="0"
                  step="0.01"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  required
                  min="0"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  Active
                </label>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {selectedRouteSection ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
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
