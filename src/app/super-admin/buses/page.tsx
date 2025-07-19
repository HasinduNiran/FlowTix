'use client';

import { useState, useEffect } from 'react';
import { BusService, Bus } from '@/services/bus.service';
import DataTable from '@/components/dashboard/DataTable';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import React from 'react';
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

  const handleViewDetails = (bus: Bus) => {
    setSelectedBus(bus);
    setShowDetailsModal(true);
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
          <div className="flex justify-center">
            <button 
              onClick={() => handleViewDetails(row)}
              className="text-blue-600 hover:text-blue-800 p-1"
              title="View Details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Buses</h1>
        <p className="text-gray-600 mt-1">View and manage all buses in the system</p>
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
