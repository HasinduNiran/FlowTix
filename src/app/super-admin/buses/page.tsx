'use client';

import { useState, useEffect } from 'react';
import { BusService, Bus } from '@/services/bus.service';
import DataTable from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import React from 'react';
import BusFormModal from '@/components/dashboard/BusFormModal';
import BusDetailsModal from '@/components/dashboard/BusDetailsModal';

interface TableColumn {
  header: string;
  accessor: string;
  cell?: (value: any, row?: Bus) => React.ReactNode;
  className?: string;
}

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
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

  const handleViewDetails = (bus: Bus) => {
    setSelectedBus(bus);
    setShowDetailsModal(true);
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

  const columns: TableColumn[] = [
    { header: 'Bus Number', accessor: 'busNumber' },
    { header: 'Bus Name', accessor: 'busName' },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (value: string) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          value === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    { header: 'Telephone Number', accessor: 'telephoneNumber' },
    { 
      header: 'Actions',
      accessor: '_id',
      cell: (id: string, row?: Bus) => {
        if (!row) return null;
        return (
          <div className="flex space-x-3">
            <button 
              onClick={() => handleViewDetails(row)}
              className="text-blue-600 hover:text-blue-800"
              title="View Details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button 
              onClick={() => handleEditBus(row)}
              className="text-green-600 hover:text-green-800"
              title="Edit"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button 
              onClick={() => handleDeleteBus(row._id)}
              className="text-red-600 hover:text-red-800"
              title="Delete"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="p-6">
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

      {/* Details Modal */}
      <BusDetailsModal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedBus(null);
        }}
        bus={selectedBus}
      />
    </div>
  );
} 