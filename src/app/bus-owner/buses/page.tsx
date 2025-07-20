'use client';

import { useState, useEffect } from 'react';

interface Bus {
  id: string;
  registrationNumber: string;
  capacity: number;
  model: string;
  year: number;
  status: 'active' | 'maintenance' | 'inactive';
  routeAssigned?: string;
  lastService: string;
  nextService: string;
}

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'maintenance' | 'inactive'>('all');

  useEffect(() => {
    const fetchBuses = async () => {
      try {
        // Simulate API call - replace with actual backend call
        setTimeout(() => {
          const mockData: Bus[] = [
            {
              id: '1',
              registrationNumber: 'WP-CAB-1234',
              capacity: 45,
              model: 'Tata LP 1618',
              year: 2022,
              status: 'active',
              routeAssigned: 'Colombo - Kandy',
              lastService: '2025-01-01',
              nextService: '2025-04-01',
            },
            {
              id: '2',
              registrationNumber: 'WP-CAB-5678',
              capacity: 38,
              model: 'Ashok Leyland Viking',
              year: 2021,
              status: 'maintenance',
              routeAssigned: 'Colombo - Galle',
              lastService: '2024-12-15',
              nextService: '2025-03-15',
            },
            {
              id: '3',
              registrationNumber: 'WP-CAB-9012',
              capacity: 42,
              model: 'Tata LP 1618',
              year: 2023,
              status: 'active',
              routeAssigned: 'Kandy - Matara',
              lastService: '2025-01-10',
              nextService: '2025-04-10',
            },
          ];
          setBuses(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching buses:', error);
        setLoading(false);
      }
    };

    fetchBuses();
  }, []);

  const filteredBuses = buses.filter(bus => 
    filter === 'all' || bus.status === filter
  );

  const getStatusBadge = (status: Bus['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bus Fleet Management</h1>
            <p className="text-gray-600 mt-1">
              Manage your bus fleet and monitor their status
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            Add New Bus
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {(['all', 'active', 'maintenance', 'inactive'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== 'all' && (
                <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                  {buses.filter(bus => bus.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Buses Grid */}
      {filteredBuses.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <span className="text-6xl mb-4 block">🚌</span>
          <p className="text-gray-500">No buses found for the selected filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBuses.map((bus) => (
            <div key={bus.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">🚌</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {bus.registrationNumber}
                    </h3>
                    <p className="text-sm text-gray-500">{bus.model} ({bus.year})</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(bus.status)}`}>
                  {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Capacity:</span>
                  <span className="text-sm font-medium text-gray-900">{bus.capacity} passengers</span>
                </div>
                
                {bus.routeAssigned && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Route:</span>
                    <span className="text-sm font-medium text-gray-900">{bus.routeAssigned}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Last Service:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(bus.lastService).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Next Service:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(bus.nextService).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex space-x-2">
                <button className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  View Details
                </button>
                <button className="flex-1 bg-gray-50 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  Edit
                </button>
                {bus.status === 'active' && (
                  <button className="bg-yellow-50 text-yellow-600 hover:bg-yellow-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                    Maintenance
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
