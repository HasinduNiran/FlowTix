'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BusService, Bus } from '@/services/bus.service';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import BusFormModal from '@/components/dashboard/BusFormModal';

export default function BusOwnerBusDetailPage() {
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
      
      // Check if this bus belongs to the logged-in owner
      if (data.ownerId !== user?._id) {
        setError('You do not have permission to view this bus.');
        setBus(null);
      } else {
        setBus(data);
        setError(null);
      }
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
            ← Back to My Buses
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
          ← Back to My Buses
        </Button>
        <h1 className="text-2xl font-semibold text-gray-800">
          Bus Details: {bus.busNumber}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Bus Information */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">{bus.busName}</h2>
                  <p className="text-gray-600">Bus #{bus.busNumber}</p>
                </div>
                <Button onClick={handleEditBus} variant="secondary">
                  Edit Bus
                </Button>
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
                      <p className="text-xs text-gray-500">Conductor</p>
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
                    {/* Route details would go here */}
                  </div>
                </div>

                {bus.notes && (
                  <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                    <p className="text-sm">{bus.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar with Quick Stats */}
        <div>
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Stats</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-xs text-blue-500 font-medium">TODAY'S TRIPS</p>
                  <p className="text-2xl font-bold text-blue-700">0</p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-md">
                  <p className="text-xs text-green-500 font-medium">TODAY'S REVENUE</p>
                  <p className="text-2xl font-bold text-green-700">$0.00</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-md">
                  <p className="text-xs text-purple-500 font-medium">TICKETS SOLD (TODAY)</p>
                  <p className="text-2xl font-bold text-purple-700">0</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
              
              <div className="space-y-3">
                <Button className="w-full">Schedule Trip</Button>
                <Button className="w-full" variant="secondary">View Tickets</Button>
                <Button className="w-full" variant="outline">Maintenance Log</Button>
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