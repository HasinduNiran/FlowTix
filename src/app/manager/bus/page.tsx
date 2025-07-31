'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ManagerService, ManagerBus } from '@/services/manager.service';
import { Toast } from '@/components/ui/Toast';

export default function ManagerBusPage() {
  const { user } = useAuth();
  const [buses, setBuses] = useState<ManagerBus[]>([]);
  const [selectedBus, setSelectedBus] = useState<ManagerBus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({ isOpen: true, title, message, type });
  };

  const closeToast = () => {
    setToast(prev => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const fetchAssignedBuses = async () => {
      try {
        setLoading(true);
        const busesData = await ManagerService.getAssignedBuses();
        
        if (busesData && Array.isArray(busesData) && busesData.length > 0) {
          setBuses(busesData);
          setSelectedBus(busesData[0]); // Select first bus by default
          showToast('Success', `Loaded ${busesData.length} assigned bus${busesData.length > 1 ? 'es' : ''}`, 'success');
        } else {
          // Fallback to sample data
          const mockBuses: ManagerBus[] = [
            {
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
            },
            {
              _id: 'B002',
              busNumber: 'B002',
              busName: 'Express Line 2',
              telephoneNumber: '+94771234568',
              category: 'Standard',
              ownerId: 'owner1',
              routeId: 'route2',
              seatCapacity: 40,
              driverName: 'Driver Fernando',
              conductorId: 'conductor2',
              status: 'active',
              notes: 'Regular service bus',
              plateNumber: 'CAR-1235',
              busType: 'Standard',
              capacity: 40,
              conductorName: 'Mike Fernando',
              routeName: 'Kandy - Matale',
              lastMaintenanceDate: '2024-12-20',
              nextMaintenanceDate: '2025-02-20',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z'
            }
          ];
          setBuses(mockBuses);
          setSelectedBus(mockBuses[0]);
          showToast('Info', 'Using sample data - connect to backend for real buses', 'info');
        }
      } catch (error: any) {
        console.error('Error fetching buses data:', error);
        setError(error.message || 'Failed to load bus information');
        showToast('Error', 'Failed to load bus information', 'error');
        
        // Show fallback data on error
        const mockBuses: ManagerBus[] = [
          {
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
          }
        ];
        setBuses(mockBuses);
        setSelectedBus(mockBuses[0]);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignedBuses();
  }, []);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '✅';
      case 'maintenance':
        return '🔧';
      case 'inactive':
        return '❌';
      default:
        return '🚌';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (buses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <span className="text-xl mr-3">⚠️</span>
            <div>
              <h3 className="font-semibold">No Buses Assigned</h3>
              <p className="text-sm">No buses are currently assigned to your account. Please contact your administrator.</p>
            </div>
          </div>
        </div>
        
        {/* Toast Notification */}
        <Toast
          isOpen={toast.isOpen}
          onClose={closeToast}
          title={toast.title}
          message={toast.message}
          type={toast.type}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Assigned Buses</h1>
            <p className="text-gray-600">
              Manage and monitor your assigned buses information and status.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="bg-blue-50 px-4 py-2 rounded-lg">
              <span className="text-sm font-medium text-blue-700">
                Total Buses: {buses.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Buses Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">🚌</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Buses</h3>
              <p className="text-2xl font-semibold text-gray-900">{buses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Buses</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {buses.filter(bus => bus.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">🔧</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Under Maintenance</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {buses.filter(bus => bus.status === 'maintenance').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Capacity</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {buses.reduce((total, bus) => total + (bus.capacity || bus.seatCapacity || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bus Selection Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {buses.map((bus) => (
              <button
                key={bus._id}
                onClick={() => setSelectedBus(bus)}
                className={`flex-shrink-0 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedBus?._id === bus._id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span>{getStatusIcon(bus.status)}</span>
                  <span>{bus.busNumber} - {bus.busName}</span>
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Selected Bus Details */}
        {selectedBus && (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedBus.busName} ({selectedBus.busNumber})
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBus.status)}`}>
                {getStatusIcon(selectedBus.status)} {selectedBus.status.charAt(0).toUpperCase() + selectedBus.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Plate Number
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedBus.plateNumber || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Bus Number
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedBus.busNumber}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Contact Number
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedBus.telephoneNumber || 'N/A'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Bus Type/Category
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedBus.busType || selectedBus.category}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Capacity
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedBus.capacity || selectedBus.seatCapacity} passengers</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Driver Name
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedBus.driverName || 'Not assigned'}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Assigned Conductor
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedBus.conductorName || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Route
                  </label>
                  <p className="text-lg font-semibold text-gray-900">{selectedBus.routeName || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Status
                  </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedBus.status)}`}>
                    {getStatusIcon(selectedBus.status)} {selectedBus.status.charAt(0).toUpperCase() + selectedBus.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {selectedBus.notes && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-600 mb-1">Notes</h3>
                <p className="text-gray-900">{selectedBus.notes}</p>
              </div>
            )}

            {/* Maintenance Information */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-medium text-blue-600 mb-1">Last Maintenance</h3>
                <p className="text-lg font-semibold text-blue-900">
                  {selectedBus.lastMaintenanceDate ? new Date(selectedBus.lastMaintenanceDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-orange-50 rounded-lg">
                <h3 className="text-sm font-medium text-orange-600 mb-1">Next Maintenance Due</h3>
                <p className="text-lg font-semibold text-orange-900">
                  {selectedBus.nextMaintenanceDate ? new Date(selectedBus.nextMaintenanceDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* All Buses List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Assigned Buses</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bus Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {buses.map((bus) => (
                <tr key={bus._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{bus.busName}</div>
                      <div className="text-sm text-gray-500">{bus.busNumber} • {bus.plateNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{bus.routeName || 'Not assigned'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bus.capacity || bus.seatCapacity} passengers
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      Driver: {bus.driverName || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Conductor: {bus.conductorName || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(bus.status)}`}>
                      {getStatusIcon(bus.status)} {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedBus(bus)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <a 
            href="/manager/trips"
            className="p-4 text-center bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors block"
          >
            <span className="text-3xl mb-2 block">🚍</span>
            <span className="text-sm font-medium text-gray-900">Manage Trips</span>
          </a>
          <a 
            href="/manager/tickets"
            className="p-4 text-center bg-green-50 hover:bg-green-100 rounded-lg transition-colors block"
          >
            <span className="text-3xl mb-2 block">🎫</span>
            <span className="text-sm font-medium text-gray-900">View Tickets</span>
          </a>
          <a 
            href="/manager/route-sections"
            className="p-4 text-center bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors block"
          >
            <span className="text-3xl mb-2 block">🛣️</span>
            <span className="text-sm font-medium text-gray-900">Route Sections</span>
          </a>
          <a 
            href="/manager/day-end"
            className="p-4 text-center bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors block"
          >
            <span className="text-3xl mb-2 block">🌅</span>
            <span className="text-sm font-medium text-gray-900">Day End Reports</span>
          </a>
        </div>
      </div>

      {/* Manager Access Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-xl mr-3">ℹ️</span>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Manager Access</h3>
            <p className="text-sm text-amber-700">
              You can view and manage {buses.length > 1 ? 'these buses' : 'this bus'} assigned to you. All operations and data shown are specific to your assigned bus{buses.length > 1 ? 'es' : ''} only.
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      <Toast
        isOpen={toast.isOpen}
        onClose={closeToast}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />
    </div>
  );
}
