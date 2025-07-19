'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { StopService, Stop } from '@/services/stop.service';
import { RouteService, Route } from '@/services/route.service';
import { Button } from '@/components/ui/Button';

export default function StopsPage() {
  const [stops, setStops] = useState<Stop[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [filteredStops, setFilteredStops] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterStops();
  }, [stops, searchTerm, selectedRoute, selectedStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [stopsData, routesData] = await Promise.all([
        StopService.getAllStops(),
        RouteService.getAllRoutes()
      ]);
      setStops(stopsData);
      setRoutes(routesData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterStops = () => {
    // Don't show any stops by default - only when a route is selected
    if (!selectedRoute) {
      setFilteredStops([]);
      return;
    }

    let filtered = stops;

    if (searchTerm) {
      filtered = filtered.filter(stop =>
        stop.stopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stop.stopCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRoute && selectedRoute !== 'all') {
      filtered = filtered.filter(stop =>
        stop.routeId && (typeof stop.routeId === 'string' ? stop.routeId === selectedRoute : stop.routeId._id === selectedRoute)
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(stop => 
        selectedStatus === 'active' ? stop.isActive : !stop.isActive
      );
    }

    setFilteredStops(filtered);
  };

  const handleDeleteStop = async (stopId: string) => {
    if (!confirm('Are you sure you want to delete this stop?')) return;

    try {
      await StopService.deleteStop(stopId);
      setStops(stops.filter(stop => stop._id !== stopId));
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
                onClick={() => router.push('/super-admin/stops/create')}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Route <span className="text-red-500">*</span></label>
              <select
                value={selectedRoute}
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              >
                <option value="">Select a route to view stops</option>
                <option value="all">All Routes</option>
                {routes.map((route) => (
                  <option key={route._id} value={route._id}>
                    {route.code} - {route.name}
                  </option>
                ))}
              </select>
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

        {/* Stops Table */}
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stop Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Section
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStops.map((stop) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        stop.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {stop.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(stop.createdAt).toLocaleDateString()}
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
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredStops.length === 0 && !loading && (
          <div className="bg-white shadow-lg rounded-2xl p-12 text-center border border-gray-200">
            <div className="bg-gray-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No stops found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedRoute || selectedStatus !== 'all' 
                ? 'Try adjusting your filters to see more results.' 
                : 'Get started by creating your first bus stop.'}
            </p>
            <Button 
              onClick={() => router.push('/super-admin/stops/create')}
              className="bg-red-600 hover:bg-red-700"
            >
              Add New Stop
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
