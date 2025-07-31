'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ManagerService } from '@/services/manager.service';
import { Toast } from '@/components/ui/Toast';

interface ManagerRoute {
  _id: string;
  name: string;
  code: string;
  routeName: string;
  routeNumber: string;
  startLocation?: string;
  endLocation?: string;
}

interface ManagerRouteSection {
  _id: string;
  routeId: {
    _id: string;
    routeName: string;
    routeNumber: string;
    startPoint: string;
    endPoint: string;
    distance: number;
    estimatedDuration: number;
    isActive: boolean;
  };
  stopId: {
    _id: string;
    stopCode: string;
    stopName: string;
    sectionNumber: number;
    isActive: boolean;
  };
  category: string;
  fare: number;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ManagerRouteSectionsPage() {
  const { user } = useAuth();
  const [routeSections, setRouteSections] = useState<ManagerRouteSection[]>([]);
  const [managerRoutes, setManagerRoutes] = useState<ManagerRoute[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [loading, setLoading] = useState(false); // Changed to false initially
  const [loadingRoutes, setLoadingRoutes] = useState(true); // Added separate loading for routes
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Check permissions - only managers should access this page
  useEffect(() => {
    if (user && user.role !== 'manager') {
      setToast({ message: 'Access denied. Only managers can access this page.', type: 'error' });
      return;
    }
  }, [user]);

  const fetchManagerRoutes = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoadingRoutes(true);
      const routes = await ManagerService.getRoutesByManager();
      setManagerRoutes(routes);
    } catch (error) {
      console.error('Error fetching manager routes:', error);
      setToast({ message: 'Failed to load your assigned routes', type: 'error' });
    } finally {
      setLoadingRoutes(false);
    }
  }, [user?.id]);

  const fetchRouteSections = useCallback(async (routeId: string) => {
    if (!user?.id || !routeId) return;

    try {
      setLoading(true);
      // Fetch sections for specific route only
      const sections = await ManagerService.getRouteSectionsByRouteId(routeId);
      setRouteSections(sections);
      setToast({ message: 'Route sections loaded successfully', type: 'success' });
    } catch (error) {
      console.error('Error fetching route sections:', error);
      setToast({ message: 'Failed to load route sections', type: 'error' });
      setRouteSections([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.role === 'manager') {
      fetchManagerRoutes();
    }
  }, [user, fetchManagerRoutes]);

  // Handle route selection change
  const handleRouteChange = (routeId: string) => {
    setSelectedRoute(routeId);
    setRouteSections([]); // Clear previous sections
    
    if (routeId) {
      fetchRouteSections(routeId);
    }
  };

  // No filter needed since we only load sections for selected route
  const filteredRouteSections = routeSections;

  // Only show the page if user is a manager
  if (user && user.role !== 'manager') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">Only managers can access this page.</p>
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
            Select a route to view its sections and fare structures. Route sections will only load after you select a specific route.
          </p>
        </div>
      </div>

      {/* Route Filter */}
      {managerRoutes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Select Route to View Sections:</label>
            <select
              value={selectedRoute}
              onChange={(e) => handleRouteChange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">-- Select a Route --</option>
              {managerRoutes.map(route => (
                <option key={route._id} value={route._id}>
                  {route.code || route.routeNumber} - {route.name || route.routeName}
                </option>
              ))}
            </select>
            {selectedRoute && (
              <span className="text-sm text-green-600 font-medium">
                ✓ {routeSections.length} sections loaded
              </span>
            )}
          </div>
        </div>
      )}

      {/* No Routes Message */}
      {managerRoutes.length === 0 && !loadingRoutes && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-6xl mb-4 block">🚌</span>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Routes Assigned</h3>
          <p className="text-gray-500 mb-6">
            You don't have any buses assigned to routes yet. Contact your administrator to get bus routes assigned.
          </p>
        </div>
      )}

      {/* Loading Routes */}
      {loadingRoutes && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading your assigned routes...</p>
        </div>
      )}

      {/* Route Sections List */}
      {managerRoutes.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Route Sections</h2>
          </div>

          {!selectedRoute ? (
            <div className="p-8 text-center">
              <span className="text-4xl mb-4 block">🛣️</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a Route</h3>
              <p className="text-gray-500">
                Please select a route from the dropdown above to view its sections and fare structure.
              </p>
            </div>
          ) : loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading route sections...</p>
            </div>
          ) : filteredRouteSections.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-4xl mb-4 block">📍</span>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Route Sections</h3>
              <p className="text-gray-500">
                No route sections have been configured for the selected route yet.
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
                  {filteredRouteSections
                    .sort((a, b) => a.order - b.order)
                    .map((section) => (
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

      {/* Manager Access Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-xl mr-3">ℹ️</span>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Manager Access</h3>
            <p className="text-sm text-amber-700">
              You can view route sections for your assigned bus route. This information is read-only and helps you understand the pricing structure and route details for better management.
            </p>
          </div>
        </div>
      </div>

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
