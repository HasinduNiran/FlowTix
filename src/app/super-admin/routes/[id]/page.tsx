'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RouteService, Route, Section } from '@/services/route.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DataTable } from '@/components/dashboard/DataTable';

export default function RouteDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [route, setRoute] = useState<Route | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedRoute, setEditedRoute] = useState<Partial<Route>>({});
  const [showAddSectionModal, setShowAddSectionModal] = useState<boolean>(false);
  const [availableSections, setAvailableSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [sectionOrder, setSectionOrder] = useState<number>(1);

  useEffect(() => {
    fetchRouteDetails();
    fetchAllSections();
  }, [id]);

  const fetchRouteDetails = async () => {
    setLoading(true);
    try {
      const routeData = await RouteService.getRouteById(id);
      setRoute(routeData);
      setEditedRoute(routeData);
      
      // Fetch sections associated with this route
      const routeSections = await RouteService.getRouteSections(id);
      
      // For each route section, fetch the section details
      const sectionDetails = await Promise.all(
        routeSections.map(async (rs) => {
          return await RouteService.getSectionById(rs.section);
        })
      );
      
      setSections(sectionDetails);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch route details:', err);
      setError('Failed to load route details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSections = async () => {
    try {
      const allSections = await RouteService.getAllSections();
      setAvailableSections(allSections);
    } catch (err) {
      console.error('Failed to fetch sections:', err);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await RouteService.updateRoute(id, editedRoute);
      setRoute({...route, ...editedRoute} as Route);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Failed to update route:', err);
      setError('Failed to update route. Please try again.');
    }
  };

  const handleAddSection = async () => {
    if (!selectedSection) {
      setError('Please select a section to add');
      return;
    }

    try {
      await RouteService.addSectionToRoute(id, selectedSection, sectionOrder);
      setShowAddSectionModal(false);
      setSelectedSection('');
      setSectionOrder(1);
      fetchRouteDetails(); // Refresh the route details
    } catch (err) {
      console.error('Failed to add section to route:', err);
      setError('Failed to add section. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedRoute(route || {});
  };

  const sectionColumns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Code', accessor: 'code' },
    { header: 'Distance (km)', accessor: 'distance' },
    { header: 'Fare', accessor: 'fare' },
    { header: 'Status', accessor: 'isActive', cell: (isActive: boolean) => isActive ? 'Active' : 'Inactive' }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !route) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
        <div className="mt-4">
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.push('/super-admin/routes')} 
          className="mr-4 text-blue-500 hover:text-blue-700"
        >
          ← Back to Routes
        </button>
        <h1 className="text-2xl font-bold">Route Details</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Route Information</h2>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Route</Button>
          ) : (
            <div className="space-x-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route Name</label>
            {isEditing ? (
              <Input
                type="text"
                value={editedRoute.name || ''}
                onChange={(e) => setEditedRoute({...editedRoute, name: e.target.value})}
              />
            ) : (
              <p className="text-gray-900">{route?.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Route Code</label>
            {isEditing ? (
              <Input
                type="text"
                value={editedRoute.code || ''}
                onChange={(e) => setEditedRoute({...editedRoute, code: e.target.value})}
              />
            ) : (
              <p className="text-gray-900">{route?.code}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Location</label>
            {isEditing ? (
              <Input
                type="text"
                value={editedRoute.startLocation || ''}
                onChange={(e) => setEditedRoute({...editedRoute, startLocation: e.target.value})}
              />
            ) : (
              <p className="text-gray-900">{route?.startLocation}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Location</label>
            {isEditing ? (
              <Input
                type="text"
                value={editedRoute.endLocation || ''}
                onChange={(e) => setEditedRoute({...editedRoute, endLocation: e.target.value})}
              />
            ) : (
              <p className="text-gray-900">{route?.endLocation}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Distance (km)</label>
            {isEditing ? (
              <Input
                type="number"
                value={editedRoute.distance || 0}
                onChange={(e) => setEditedRoute({...editedRoute, distance: parseFloat(e.target.value)})}
              />
            ) : (
              <p className="text-gray-900">{route?.distance}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (min)</label>
            {isEditing ? (
              <Input
                type="number"
                value={editedRoute.estimatedDuration || 0}
                onChange={(e) => setEditedRoute({...editedRoute, estimatedDuration: parseFloat(e.target.value)})}
              />
            ) : (
              <p className="text-gray-900">{route?.estimatedDuration}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            {isEditing ? (
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                value={editedRoute.isActive ? 'true' : 'false'}
                onChange={(e) => setEditedRoute({...editedRoute, isActive: e.target.value === 'true'})}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            ) : (
              <p className="text-gray-900">{route?.isActive ? 'Active' : 'Inactive'}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
            <p className="text-gray-900">{new Date(route?.createdAt || '').toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
            <p className="text-gray-900">{new Date(route?.updatedAt || '').toLocaleString()}</p>
          </div>
        </div>

        {isEditing && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              value={editedRoute.description || ''}
              onChange={(e) => setEditedRoute({...editedRoute, description: e.target.value})}
              rows={3}
            />
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Route Sections</h2>
          <Button onClick={() => setShowAddSectionModal(true)}>Add Section</Button>
        </div>

        <DataTable
          columns={sectionColumns}
          data={sections}
          emptyMessage="No sections assigned to this route"
        />
      </div>

      {/* Add Section Modal */}
      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add Section to Route</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Section</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                >
                  <option value="">-- Select a section --</option>
                  {availableSections.map((section) => (
                    <option key={section._id} value={section._id}>
                      {section.name} ({section.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Order</label>
                <Input
                  type="number"
                  min={1}
                  value={sectionOrder}
                  onChange={(e) => setSectionOrder(parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowAddSectionModal(false)}>Cancel</Button>
              <Button onClick={handleAddSection}>Add Section</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 