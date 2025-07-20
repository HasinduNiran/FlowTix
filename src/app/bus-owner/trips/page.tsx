'use client';

import { useState, useEffect } from 'react';

interface Trip {
  id: string;
  tripNumber: string;
  busNumber: string;
  route: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  conductor: string;
  ticketsSold: number;
  revenue: number;
  date: string;
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'>('all');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        // Simulate API call - replace with actual backend call
        setTimeout(() => {
          const mockData: Trip[] = [
            {
              id: '1',
              tripNumber: 'T001',
              busNumber: 'WP-CAB-1234',
              route: 'Colombo - Kandy',
              startTime: '08:00',
              endTime: '12:00',
              status: 'completed',
              conductor: 'John Doe',
              ticketsSold: 42,
              revenue: 8400,
              date: '2025-01-20',
            },
            {
              id: '2',
              tripNumber: 'T002',
              busNumber: 'WP-CAB-5678',
              route: 'Colombo - Galle',
              startTime: '10:00',
              endTime: '13:30',
              status: 'in-progress',
              conductor: 'Mike Smith',
              ticketsSold: 28,
              revenue: 5600,
              date: '2025-01-20',
            },
            {
              id: '3',
              tripNumber: 'T003',
              busNumber: 'WP-CAB-9012',
              route: 'Kandy - Matara',
              startTime: '14:00',
              endTime: '18:30',
              status: 'scheduled',
              conductor: 'Sarah Johnson',
              ticketsSold: 0,
              revenue: 0,
              date: '2025-01-20',
            },
          ];
          setTrips(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching trips:', error);
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const filteredTrips = trips.filter(trip => 
    filter === 'all' || trip.status === filter
  );

  const getStatusBadge = (status: Trip['status']) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
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
            <h1 className="text-2xl font-bold text-gray-900">Trip Management</h1>
            <p className="text-gray-600 mt-1">
              Schedule and monitor bus trips
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            Schedule New Trip
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {(['all', 'scheduled', 'in-progress', 'completed', 'cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
              {tab !== 'all' && (
                <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                  {trips.filter(trip => trip.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Trips List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Trip Records</h3>
        </div>
        
        {filteredTrips.length === 0 ? (
          <div className="p-6 text-center">
            <span className="text-4xl mb-4 block">🚍</span>
            <p className="text-gray-500">No trips found for the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Route
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conductor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrips.map((trip) => (
                  <tr key={trip.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🚍</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {trip.tripNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            Bus: {trip.busNumber}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.route}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {trip.startTime} - {trip.endTime}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(trip.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.conductor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(trip.status)}`}>
                        {trip.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {trip.ticketsSold} tickets
                      </div>
                      <div className="text-sm text-gray-500">
                        LKR {trip.revenue.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900 px-3 py-1 text-sm border border-blue-600 rounded">
                          View Details
                        </button>
                        {trip.status === 'scheduled' && (
                          <button className="text-red-600 hover:text-red-900 px-3 py-1 text-sm border border-red-600 rounded">
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
        )}
      </div>
    </div>
  );
}
