'use client';

import { useState, useEffect } from 'react';
import { BusService, Bus } from '@/services/bus.service';
import DataTable from '@/components/dashboard/DataTable';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import React from 'react';

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
    router.push(`/super-admin/buses/${bus._id}`);
  };

  const openAddModal = () => {
    router.push('/super-admin/buses/create');
  };

  const columns: TableColumn[] = [
    { 
      header: 'Bus Number', 
      accessor: 'busNumber',
      className: 'font-semibold text-gray-900'
    },
    { 
      header: 'Bus Name', 
      accessor: 'busName',
      className: 'text-gray-800'
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (value: string) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'active' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            value === 'active' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    { 
      header: 'Telephone', 
      accessor: 'telephoneNumber',
      cell: (value: string) => (
        <div className="flex items-center text-gray-700">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {value}
        </div>
      )
    },
    { 
      header: 'Actions',
      accessor: '_id',
      cell: (id: string, row?: Bus) => {
        if (!row) return null;
        return (
          <div className="flex justify-center">
            <button 
              onClick={() => handleViewDetails(row)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 p-2 rounded-xl border border-blue-200 transition-all duration-200 hover:shadow-md"
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
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buses</h1>
          <p className="text-gray-600 mt-2">Manage all buses in the system</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Bus
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
          <DataTable 
            data={buses} 
            columns={columns} 
            keyExtractor={(item) => item._id}
            emptyMessage="No buses found"
          />
        </div>
      )}
    </div>
  );
}
