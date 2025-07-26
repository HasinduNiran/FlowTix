'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RouteService, Route } from '@/services/route.service';
import { DataTable } from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function RoutesPage() {
  const router = useRouter();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newRoute, setNewRoute] = useState({
    name: '',
    code: '',
    startLocation: '',
    endLocation: '',
    distance: 0,
    estimatedDuration: 0,
    description: ''
  });

  // Fetch routes on component mount
  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    setLoading(true);
    try {
      const data = await RouteService.getAllRoutes();
      setRoutes(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch routes:', err);
      setError('Failed to load routes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = async () => {
    try {
      await RouteService.createRoute({
        name: newRoute.name,
        code: newRoute.code,
        startLocation: newRoute.startLocation,
        endLocation: newRoute.endLocation,
        distance: newRoute.distance,
        estimatedDuration: newRoute.estimatedDuration,
        description: newRoute.description,
        isActive: true
      });
      setShowAddModal(false);
      setNewRoute({
        name: '',
        code: '',
        startLocation: '',
        endLocation: '',
        distance: 0,
        estimatedDuration: 0,
        description: ''
      });
      fetchRoutes();
    } catch (err) {
      console.error('Failed to add route:', err);
      setError('Failed to add route. Please try again.');
    }
  };

  const handleDeleteRoute = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await RouteService.deleteRoute(id);
        fetchRoutes();
      } catch (err) {
        console.error('Failed to delete route:', err);
        setError('Failed to delete route. Please try again.');
      }
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/super-admin/routes/${id}`);
  };

  const filteredRoutes = routes.filter(route => 
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.startLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.endLocation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Code', accessor: 'code' },
    { header: 'Start Location', accessor: 'startLocation' },
    { header: 'End Location', accessor: 'endLocation' },
    { header: 'Distance (km)', accessor: 'distance' },
    { header: 'Duration (min)', accessor: 'estimatedDuration' },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (id: string) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetails(id)}
            className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
            title="View Details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteRoute(id)}
            className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
            title="Delete Route"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => handleViewDetails(id)}
            className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
            title="Edit Route"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
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
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Route Management</h1>
                <p className="text-gray-600 text-sm">
                  Manage bus routes and their details. Each route connects different locations.
                </p>
              </div>
              <div className="text-3xl text-gray-300">
                🗺️
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Bus Routes
                </h2>
                <p className="text-gray-600">
                  Configure and manage all bus routes in the system
                </p>
              </div>
              
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-grow lg:w-80">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <Input
                    type="text"
                    placeholder="Search by name, code, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <Button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Route
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-6 mb-8 rounded-r-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg">Error Occurred</h3>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col justify-center items-center h-80">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                <p className="text-gray-600 text-lg">Loading routes...</p>
              </div>
            ) : (
              <>
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-blue-800 font-medium text-lg">
                      Showing {filteredRoutes.length} {filteredRoutes.length === 1 ? 'route' : 'routes'}
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <DataTable
                    columns={columns}
                    data={filteredRoutes}
                    emptyMessage="No routes found. Create one to get started."
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Add Route Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl transform transition-all duration-300 ease-out scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Create New Route</h2>
                <p className="text-sm text-gray-500 mt-1">Define a new bus route in the system</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
              >
                <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Form Content */}
            <div className="p-6">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Route Name</label>
                    <Input
                      type="text"
                      value={newRoute.name}
                      onChange={(e) => setNewRoute({...newRoute, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Colombo Express"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Route Code</label>
                    <Input
                      type="text"
                      value={newRoute.code}
                      onChange={(e) => setNewRoute({...newRoute, code: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., RT001"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Start Location</label>
                    <Input
                      type="text"
                      value={newRoute.startLocation}
                      onChange={(e) => setNewRoute({...newRoute, startLocation: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Colombo Central"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">End Location</label>
                    <Input
                      type="text"
                      value={newRoute.endLocation}
                      onChange={(e) => setNewRoute({...newRoute, endLocation: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., Kandy Central"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Distance (km)</label>
                    <Input
                      type="number"
                      min={0.1}
                      step={0.1}
                      value={newRoute.distance || ''}
                      onChange={(e) => setNewRoute({...newRoute, distance: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes)</label>
                    <Input
                      type="number"
                      min={1}
                      value={newRoute.estimatedDuration || ''}
                      onChange={(e) => setNewRoute({...newRoute, estimatedDuration: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    value={newRoute.description}
                    onChange={(e) => setNewRoute({...newRoute, description: e.target.value})}
                    rows={3}
                    placeholder="Enter route description (optional)..."
                  />
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-lg font-medium transition-all"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddRoute}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Route
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 