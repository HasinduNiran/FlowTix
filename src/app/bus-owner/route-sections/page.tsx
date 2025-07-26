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
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Route Sections</h1>
          <p className="text-gray-600 mt-1">
            Manage route sections and fare structures for your bus routes
          </p>
        </div>
      </div>

      {/* Route Filter */}
      {ownerRoutes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Route:</label>
            <select
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
      )}

      {/* No Routes Message */}
      {ownerRoutes.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-6xl mb-4 block">🚌</span>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Routes Found</h3>
          <p className="text-gray-500 mb-6">
            You don't have any buses assigned to routes yet. Contact your administrator to get bus routes assigned.
          </p>
        </div>
      )}

      {/* Route Sections List */}
      {ownerRoutes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Route Sections</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading route sections...</p>
            </div>
          ) : filteredRouteSections.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-4xl mb-4 block">📍</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Route Sections</h3>
              <p className="text-gray-500">
                {selectedRoute 
                  ? 'No route sections found for the selected route.' 
                  : 'No route sections have been configured yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stop
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
                  {filteredRouteSections.map((section) => (
                    <tr key={section._id} className="hover:bg-gray-50">
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
                          <div className="text-sm text-gray-500">
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
                        <div className="text-sm text-gray-900">
                          {section.fare.toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {section.order}
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
  );
}
