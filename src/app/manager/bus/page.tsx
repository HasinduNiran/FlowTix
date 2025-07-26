'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ManagerService, ManagerBus } from '@/services/manager.service';

export default function ManagerBusPage() {
  const { user } = useAuth();
  const [bus, setBus] = useState<ManagerBus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAssignedBus = async () => {
      try {
        setLoading(true);
        const busData = await ManagerService.getAssignedBus();
        setBus(busData);
      } catch (error: any) {
        console.error('Error fetching bus data:', error);
        setError(error.message || 'Failed to load bus information');
        
        // Fallback to sample data if API fails
        setBus({
          _id: 'B001',
          busNumber: 'B001',
          busName: 'Express Line 1',
          telephoneNumber: '+94771234567',
          category: 'Luxury',
          ownerId: 'owner1',
          routeId: 'route1',
          seatCapacity: 45,
          driverName: 'Driver Silva',
          conductorId: 'conductor1',
          status: 'active',
          notes: 'Well maintained bus',
          plateNumber: 'CAR-1234',
          busType: 'Luxury',
          capacity: 45,
          conductorName: 'John Silva',
          routeName: 'Colombo - Kandy',
          lastMaintenanceDate: '2024-12-15',
          nextMaintenanceDate: '2025-02-15',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedBus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        No bus assigned to your account. Please contact your administrator.
      </div>
    );
  }

  const getStatusColor = (status: string) => {
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

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <span className="text-xl mr-3">⚠️</span>
            <div>
              <h3 className="font-semibold">Connection Issue</h3>
              <p className="text-sm">{error} - Showing sample data</p>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Assigned Bus</h1>
        <p className="text-gray-600">
          Manage and monitor your assigned bus information and status.
        </p>
      </div>

      {/* Bus Details Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Bus Information</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(bus.status)}`}>
            {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Plate Number
              </label>
              <p className="text-lg font-semibold text-gray-900">{bus.plateNumber || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Bus Name
              </label>
              <p className="text-lg font-semibold text-gray-900">{bus.busName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Bus Number
              </label>
              <p className="text-lg font-semibold text-gray-900">{bus.busNumber}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Bus Type/Category
              </label>
              <p className="text-lg font-semibold text-gray-900">{bus.busType || bus.category}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Capacity
              </label>
              <p className="text-lg font-semibold text-gray-900">{bus.capacity || bus.seatCapacity} passengers</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Contact Number
              </label>
              <p className="text-lg font-semibold text-gray-900">{bus.telephoneNumber || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Assigned Conductor
              </label>
              <p className="text-lg font-semibold text-gray-900">{bus.conductorName || 'Not assigned'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Driver Name
              </label>
              <p className="text-lg font-semibold text-gray-900">{bus.driverName || 'Not assigned'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Route
              </label>
              <p className="text-lg font-semibold text-gray-900">{bus.routeName || 'Not assigned'}</p>
            </div>
          </div>
        </div>

        {bus.notes && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Notes</h3>
            <p className="text-gray-900">{bus.notes}</p>
          </div>
        )}
      </div>

      {/* Maintenance Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Maintenance Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-600 mb-1">Last Maintenance</h3>
            <p className="text-lg font-semibold text-blue-900">
              {bus.lastMaintenanceDate ? new Date(bus.lastMaintenanceDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <h3 className="text-sm font-medium text-orange-600 mb-1">Next Maintenance Due</h3>
            <p className="text-lg font-semibold text-orange-900">
              {bus.nextMaintenanceDate ? new Date(bus.nextMaintenanceDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
            <span className="text-3xl mb-2 block">🚍</span>
            <span className="text-sm font-medium text-gray-900">Schedule Trip</span>
          </button>
          <button className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
            <span className="text-3xl mb-2 block">🎫</span>
            <span className="text-sm font-medium text-gray-900">View Tickets</span>
          </button>
          <button className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
            <span className="text-3xl mb-2 block">🌅</span>
            <span className="text-sm font-medium text-gray-900">Day End Report</span>
          </button>
          <button className="p-4 text-center bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
            <span className="text-3xl mb-2 block">📊</span>
            <span className="text-sm font-medium text-gray-900">Bus Reports</span>
          </button>
        </div>
      </div>

      {/* Manager Access Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-xl mr-3">ℹ️</span>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Manager Access</h3>
            <p className="text-sm text-amber-700">
              You can only view and manage this specific bus assigned to you. For access to additional buses or administrative functions, contact your supervisor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
