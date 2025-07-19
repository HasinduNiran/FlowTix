'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BusService, Bus } from '@/services/bus.service';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import BusFormModal from '@/components/dashboard/BusFormModal';

export default function BusDetailPage() {
  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const router = useRouter();
  const params = useParams();
  const busId = params.id as string;
  const { user } = useAuth();

  useEffect(() => {
    fetchBusDetails();
  }, [busId]);

  const fetchBusDetails = async () => {
    try {
      setLoading(true);
      const data = await BusService.getBusById(busId);
      setBus(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch bus details. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBus = () => {
    setShowEditModal(true);
  };

  const handleEditSubmit = async (busData: Partial<Bus>) => {
    if (!bus) return;
    
    try {
      await BusService.updateBus(
        bus._id, 
        busData as Partial<Omit<Bus, '_id' | 'createdAt' | 'updatedAt'>>
      );
      fetchBusDetails(); // Refresh the data
      setShowEditModal(false);
    } catch (err) {
      console.error('Error updating bus:', err);
      throw err;
    }
  };

  const handleDeleteBus = async () => {
    if (!bus) return;
    
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await BusService.deleteBus(bus._id);
        router.push('/super-admin/buses');
      } catch (err) {
        setError('Failed to delete bus. Please try again.');
        console.error(err);
      }
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !bus) {
    return (
      <div className="p-6">
        <div className="mb-4">
          <Button onClick={handleBackClick} variant="outline">
            ← Back to Buses
          </Button>
        </div>
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error || 'Bus not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center">
        <Button onClick={handleBackClick} variant="outline" className="mr-4">
          ← Back to Buses
        </Button>
        <h1 className="text-2xl font-semibold text-gray-800">
          Bus Details: {bus.busNumber}
        </h1>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">{bus.busName}</h2>
              <p className="text-gray-600">Bus #{bus.busNumber}</p>
            </div>
            <div className="flex space-x-3">
              <Button onClick={handleEditBus} variant="secondary">
                Edit Bus
              </Button>
              <Button onClick={handleDeleteBus} className="bg-red-600 hover:bg-red-700">
                Delete Bus
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Bus Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Bus Number</p>
                  <p className="text-sm font-medium">{bus.busNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Bus Name</p>
                  <p className="text-sm font-medium">{bus.busName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Category</p>
                  <p className="text-sm font-medium capitalize">{bus.category.replace('_', ' ')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    bus.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Seat Capacity</p>
                  <p className="text-sm font-medium">{bus.seatCapacity}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Contact Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Telephone</p>
                  <p className="text-sm font-medium">{bus.telephoneNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Driver</p>
                  <p className="text-sm font-medium">{bus.driverName}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Owner ID</p>
                  <p className="text-sm font-medium">{bus.ownerId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Conductor ID</p>
                  <p className="text-sm font-medium">{bus.conductorId}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Route Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Route ID</p>
                  <p className="text-sm font-medium">{bus.routeId}</p>
                </div>
              </div>
            </div>

            {bus.notes && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                <p className="text-sm">{bus.notes}</p>
              </div>
            )}

            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500 mb-2">System Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Created At</p>
                  <p className="text-sm font-medium">
                    {new Date(bus.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm font-medium">
                    {new Date(bus.updatedAt).toLocaleString()}
                  </p>
                </div>
                {bus.lastDayEndDate && (
                  <div>
                    <p className="text-xs text-gray-500">Last Day End</p>
                    <p className="text-sm font-medium">
                      {new Date(bus.lastDayEndDate).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Bus Modal */}
      {bus && (
        <BusFormModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditSubmit}
          initialData={bus}
          isEditing={true}
        />
      )}
    </div>
  );
} 