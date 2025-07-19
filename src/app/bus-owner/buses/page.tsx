'use client';

import { useState, useEffect } from 'react';
import { BusService, Bus } from '@/services/bus.service';
import DataTable from '@/components/dashboard/DataTable';
import Header from '@/components/dashboard/Header';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import React from 'react';
import BusFormModal from '@/components/dashboard/BusFormModal';

interface Column {
  header: string;
  accessor: keyof Bus | ((item: Bus) => React.ReactNode);
  cell?: (value: any, row: Bus) => React.ReactNode;
  className?: string;
}

export default function BusOwnerBusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?._id) {
      fetchBuses();
    }
  }, [user]);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      // In a real implementation, this would filter by the logged-in owner's ID
      // For now, we'll just fetch all buses and filter on the client side
      const data = await BusService.getAllBuses();
      
      // Filter buses to only show those owned by the current user
      const ownerBuses = data.filter(bus => bus.ownerId === user?._id);
      setBuses(ownerBuses);
      setError(null);
    } catch (err) {
      setError('Failed to fetch buses. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = () => {
    setShowAddModal(true);
  };

  const handleEditBus = (bus: Bus) => {
    setSelectedBus(bus);
    setShowEditModal(true);
  };

  const handleViewDetails = (id: string) => {
    router.push(`/bus-owner/buses/${id}`);
  };

  const handleAddSubmit = async (busData: Partial<Bus>) => {
    try {
      // Set the owner ID to the current user
      const busWithOwner = {
        ...busData,
        ownerId: user?._id
      };
      
      await BusService.createBus(busWithOwner as Omit<Bus, '_id' | 'createdAt' | 'updatedAt'>);
      fetchBuses();
      setShowAddModal(false);
    } catch (err) {
      console.error('Error adding bus:', err);
      throw err;
    }
  };

  const handleEditSubmit = async (busData: Partial<Bus>) => {
    if (!selectedBus) return;
    
    try {
      await BusService.updateBus(
        selectedBus._id, 
        busData as Partial<Omit<Bus, '_id' | 'createdAt' | 'updatedAt'>>
      );
      fetchBuses();
      setShowEditModal(false);
      setSelectedBus(null);
    } catch (err) {
      console.error('Error updating bus:', err);
      throw err;
    }
  };

  const columns: Column[] = [
    { header: 'Bus Number', accessor: 'busNumber' as keyof Bus },
    { header: 'Name', accessor: 'busName' as keyof Bus },
    { header: 'Category', accessor: 'category' as keyof Bus },
    { header: 'Capacity', accessor: 'seatCapacity' as keyof Bus },
    { 
      header: 'Status', 
      accessor: 'status' as keyof Bus,
      cell: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    { header: 'Driver', accessor: 'driverName' as keyof Bus },
    { 
      header: 'Actions',
      accessor: (bus: Bus) => bus._id,
      cell: (_, row: Bus) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => handleViewDetails(row._id)}
            className="text-blue-600 hover:text-blue-800"
          >
            View
          </button>
          <button 
            onClick={() => handleEditBus(row)}
            className="text-green-600 hover:text-green-800"
          >
            Edit
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <Header user={user} />
      
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">My Buses</h2>
          <p className="text-gray-600">Manage your bus fleet</p>
        </div>
        <Button onClick={handleAddBus} className="bg-blue-600 hover:bg-blue-700">
          Register New Bus
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {buses.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-400 text-5xl mb-4">🚌</div>
              <h3 className="text-xl font-medium text-gray-800 mb-2">No Buses Registered</h3>
              <p className="text-gray-600 mb-6">You haven't registered any buses yet. Start by adding your first bus.</p>
              <Button onClick={handleAddBus}>Register New Bus</Button>
            </div>
          ) : (
            <DataTable 
              data={buses} 
              columns={columns} 
              keyExtractor={(item) => item._id}
              emptyMessage="No buses found"
            />
          )}
        </div>
      )}

      {/* Add Bus Modal */}
      <BusFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddSubmit}
        isEditing={false}
      />

      {/* Edit Bus Modal */}
      {selectedBus && (
        <BusFormModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedBus(null);
          }}
          onSubmit={handleEditSubmit}
          initialData={selectedBus}
          isEditing={true}
        />
      )}
    </div>
  );
} 