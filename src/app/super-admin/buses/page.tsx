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

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const data = await BusService.getAllBuses();
      setBuses(data);
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

  const handleDeleteBus = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await BusService.deleteBus(id);
        fetchBuses(); // Refresh the list
      } catch (err) {
        setError('Failed to delete bus. Please try again.');
        console.error(err);
      }
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/super-admin/buses/${id}`);
  };

  const handleAddSubmit = async (busData: Partial<Bus>) => {
    try {
      await BusService.createBus(busData as Omit<Bus, '_id' | 'createdAt' | 'updatedAt'>);
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
          <button 
            onClick={() => handleDeleteBus(row._id)}
            className="text-red-600 hover:text-red-800"
          >
            Delete
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
          <h2 className="text-2xl font-semibold text-gray-800">All Buses</h2>
          <p className="text-gray-600">Manage and monitor all buses in the system</p>
        </div>
        <Button onClick={handleAddBus} className="bg-blue-600 hover:bg-blue-700">
          Add New Bus
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
          <DataTable 
            data={buses} 
            columns={columns} 
            keyExtractor={(item) => item._id}
            emptyMessage="No buses found"
          />
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