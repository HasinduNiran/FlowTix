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
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Route Management</h1>
          <p className="text-gray-600 text-lg">
            Manage bus routes and their details. Each route connects different locations.
          </p>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            Routes
          </h2>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <Input
                type="text"
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full text-base"
              />
            </div>
            <Button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-base flex items-center gap-2 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Route
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <div className="flex">
              <div className="py-1">
                <svg className="h-6 w-6 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-blue-600 text-base">
                Showing {filteredRoutes.length} {filteredRoutes.length === 1 ? 'route' : 'routes'}
              </p>
            </div>

            <DataTable
              columns={columns}
              data={filteredRoutes}
              emptyMessage="No routes found"
            />
          </>
        )}
      </div>

      {/* Add Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) setShowAddModal(false);
        }}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add New Route</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700">Route Name</label>
                <Input
                  type="text"
                  value={newRoute.name}
                  onChange={(e) => setNewRoute({...newRoute, name: e.target.value})}
                  className="w-full text-base"
                />
              </div>
              
              <div>
                <label className="block text-base font-medium text-gray-700">Route Code</label>
                <Input
                  type="text"
                  value={newRoute.code}
                  onChange={(e) => setNewRoute({...newRoute, code: e.target.value})}
                  className="w-full text-base"
                />
              </div>
              
              <div>
                <label className="block text-base font-medium text-gray-700">Start Location</label>
                <Input
                  type="text"
                  value={newRoute.startLocation}
                  onChange={(e) => setNewRoute({...newRoute, startLocation: e.target.value})}
                  className="w-full text-base"
                />
              </div>
              
              <div>
                <label className="block text-base font-medium text-gray-700">End Location</label>
                <Input
                  type="text"
                  value={newRoute.endLocation}
                  onChange={(e) => setNewRoute({...newRoute, endLocation: e.target.value})}
                  className="w-full text-base"
                />
              </div>
              
              <div>
                <label className="block text-base font-medium text-gray-700">Distance (km)</label>
                <Input
                  type="number"
                  value={newRoute.distance}
                  onChange={(e) => setNewRoute({...newRoute, distance: parseFloat(e.target.value)})}
                  className="w-full text-base"
                />
              </div>
              
              <div>
                <label className="block text-base font-medium text-gray-700">Estimated Duration (min)</label>
                <Input
                  type="number"
                  value={newRoute.estimatedDuration}
                  onChange={(e) => setNewRoute({...newRoute, estimatedDuration: parseFloat(e.target.value)})}
                  className="w-full text-base"
                />
              </div>
              
              <div>
                <label className="block text-base font-medium text-gray-700">Description (optional)</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-base"
                  value={newRoute.description}
                  onChange={(e) => setNewRoute({...newRoute, description: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(false)}
                className="border-gray-300 text-gray-700 text-base"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddRoute}
                className="bg-blue-600 hover:bg-blue-700 text-base flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Route
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 