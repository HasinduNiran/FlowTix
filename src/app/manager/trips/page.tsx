'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ManagerService } from '@/services/manager.service';
import { Toast } from '@/components/ui/Toast';

interface Trip {
  id: string;
  routeName: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  ticketsSold: number;
  revenue: number;
  conductor: string;
  date: string;
}

export default function ManagerTripsPage() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('today');
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
    const fetchTrips = async () => {
      try {
        setLoading(true);
        const tripsData = await ManagerService.getTrips();
        
        if (tripsData && Array.isArray(tripsData)) {
          setTrips(tripsData);
          showToast('Success', 'Trips loaded successfully', 'success');
        } else {
          // Fallback data
          const mockTrips: Trip[] = [
            {
              id: 'T001',
              routeName: 'Colombo - Kandy',
              startTime: '06:00',
              endTime: '10:30',
              status: 'completed',
              ticketsSold: 42,
              revenue: 12600,
              conductor: 'John Silva',
              date: '2025-01-26'
            },
            {
              id: 'T002',
              routeName: 'Kandy - Colombo',
              startTime: '11:00',
              endTime: '15:30',
              status: 'completed',
              ticketsSold: 38,
              revenue: 11400,
              conductor: 'John Silva',
              date: '2025-01-26'
            },
            {
              id: 'T003',
              routeName: 'Colombo - Kandy',
              startTime: '16:00',
              endTime: '20:30',
              status: 'in-progress',
              ticketsSold: 35,
              revenue: 10500,
              conductor: 'John Silva',
              date: '2025-01-26'
            },
            {
              id: 'T004',
              routeName: 'Kandy - Colombo',
              startTime: '21:00',
              endTime: '01:30',
              status: 'scheduled',
              ticketsSold: 0,
              revenue: 0,
              conductor: 'John Silva',
              date: '2025-01-26'
            }
          ];
          setTrips(mockTrips);
          showToast('Info', 'Using sample data - connect to backend for real trips', 'info');
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
        setError('Failed to load trips data');
        showToast('Error', 'Failed to load trips data', 'error');
        
        // Show fallback data on error
        const mockTrips: Trip[] = [
          {
            id: 'T001',
            routeName: 'Colombo - Kandy',
            startTime: '06:00',
            endTime: '10:30',
            status: 'completed',
            ticketsSold: 42,
            revenue: 12600,
            conductor: 'John Silva',
            date: '2025-01-26'
          },
          {
            id: 'T002',
            routeName: 'Kandy - Colombo',
            startTime: '11:00',
            endTime: '15:30',
            status: 'completed',
            ticketsSold: 38,
            revenue: 11400,
            conductor: 'John Silva',
            date: '2025-01-26'
          }
        ];
        setTrips(mockTrips);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'in-progress':
        return '🚍';
      case 'scheduled':
        return '⏰';
      case 'cancelled':
        return '❌';
      default:
        return '📅';
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Bus Trips</h1>
            <p className="text-gray-600">
              Monitor and manage trips for your assigned bus.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Trips</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">🚍</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Trips</h3>
              <p className="text-2xl font-semibold text-gray-900">{trips.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {trips.filter(t => t.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">🎫</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Tickets</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {trips.reduce((sum, trip) => sum + trip.ticketsSold, 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-semibold text-gray-900">
                LKR {trips.reduce((sum, trip) => sum + trip.revenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Trip Schedule</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trip
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conductor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{trip.id}</div>
                    <div className="text-sm text-gray-500">{trip.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{trip.routeName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{trip.startTime} - {trip.endTime}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                      <span className="mr-1">{getStatusIcon(trip.status)}</span>
                      {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trip.ticketsSold}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    LKR {trip.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {trip.conductor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        View Details
                      </button>
                      {trip.status === 'scheduled' && (
                        <button className="text-red-600 hover:text-red-900">
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manager Access Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-xl mr-3">ℹ️</span>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Manager Access</h3>
            <p className="text-sm text-amber-700">
              You can only view and manage trips for your assigned bus. All data shown is specific to your bus operations only.
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
