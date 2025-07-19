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
          <Button variant="outline" onClick={() => handleViewDetails(id)}>View</Button>
          <Button variant="destructive" onClick={() => handleDeleteRoute(id)}>Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Routes Management</h1>
        <Button onClick={() => setShowAddModal(true)}>Add New Route</Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search routes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredRoutes}
          emptyMessage="No routes found"
        />
      )}

      {/* Add Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Route</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Route Name</label>
                <Input
                  type="text"
                  value={newRoute.name}
                  onChange={(e) => setNewRoute({...newRoute, name: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Route Code</label>
                <Input
                  type="text"
                  value={newRoute.code}
                  onChange={(e) => setNewRoute({...newRoute, code: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Location</label>
                <Input
                  type="text"
                  value={newRoute.startLocation}
                  onChange={(e) => setNewRoute({...newRoute, startLocation: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">End Location</label>
                <Input
                  type="text"
                  value={newRoute.endLocation}
                  onChange={(e) => setNewRoute({...newRoute, endLocation: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Distance (km)</label>
                <Input
                  type="number"
                  value={newRoute.distance}
                  onChange={(e) => setNewRoute({...newRoute, distance: parseFloat(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Estimated Duration (min)</label>
                <Input
                  type="number"
                  value={newRoute.estimatedDuration}
                  onChange={(e) => setNewRoute({...newRoute, estimatedDuration: parseFloat(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description (optional)</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  value={newRoute.description}
                  onChange={(e) => setNewRoute({...newRoute, description: e.target.value})}
                  rows={3}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleAddRoute}>Add Route</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 