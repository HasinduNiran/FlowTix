'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface RouteSection {
  id: string;
  routeName: string;
  fromStop: string;
  toStop: string;
  distance: number;
  basePrice: number;
  estimatedTime: number;
  status: 'active' | 'inactive';
  busId: string;
}

export default function ManagerRouteSectionsPage() {
  const { user } = useAuth();
  const [routeSections, setRouteSections] = useState<RouteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRouteSections = async () => {
      try {
        // In real implementation, fetch only route sections for the assigned bus
        setTimeout(() => {
          const mockRouteSections: RouteSection[] = [
            {
              id: 'RS001',
              routeName: 'Colombo - Kandy Express',
              fromStop: 'Colombo Fort',
              toStop: 'Pettah',
              distance: 3.2,
              basePrice: 50,
              estimatedTime: 15,
              status: 'active',
              busId: 'B001'
            },
            {
              id: 'RS002',
              routeName: 'Colombo - Kandy Express',
              fromStop: 'Pettah',
              toStop: 'Maradana',
              distance: 2.8,
              basePrice: 40,
              estimatedTime: 12,
              status: 'active',
              busId: 'B001'
            },
            {
              id: 'RS003',
              routeName: 'Colombo - Kandy Express',
              fromStop: 'Maradana',
              toStop: 'Kelaniya',
              distance: 8.5,
              basePrice: 80,
              estimatedTime: 25,
              status: 'active',
              busId: 'B001'
            },
            {
              id: 'RS004',
              routeName: 'Colombo - Kandy Express',
              fromStop: 'Kelaniya',
              toStop: 'Gampaha',
              distance: 12.4,
              basePrice: 120,
              estimatedTime: 35,
              status: 'active',
              busId: 'B001'
            },
            {
              id: 'RS005',
              routeName: 'Colombo - Kandy Express',
              fromStop: 'Gampaha',
              toStop: 'Veyangoda',
              distance: 15.3,
              basePrice: 150,
              estimatedTime: 40,
              status: 'active',
              busId: 'B001'
            },
            {
              id: 'RS006',
              routeName: 'Colombo - Kandy Express',
              fromStop: 'Veyangoda',
              toStop: 'Peradeniya',
              distance: 45.2,
              basePrice: 220,
              estimatedTime: 90,
              status: 'active',
              busId: 'B001'
            },
            {
              id: 'RS007',
              routeName: 'Colombo - Kandy Express',
              fromStop: 'Peradeniya',
              toStop: 'Kandy',
              distance: 8.1,
              basePrice: 80,
              estimatedTime: 20,
              status: 'active',
              busId: 'B001'
            }
          ];
          setRouteSections(mockRouteSections);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching route sections:', error);
        setError('Failed to load route sections');
        setLoading(false);
      }
    };

    fetchRouteSections();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
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

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  const totalDistance = routeSections.reduce((sum, section) => sum + section.distance, 0);
  const totalTime = routeSections.reduce((sum, section) => sum + section.estimatedTime, 0);
  const avgPrice = routeSections.length > 0 ? routeSections.reduce((sum, section) => sum + section.basePrice, 0) / routeSections.length : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Route Sections</h1>
        <p className="text-gray-600">
          View route sections and pricing for your assigned bus route.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">🗺️</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Sections</h3>
              <p className="text-2xl font-semibold text-gray-900">{routeSections.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">📏</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Distance</h3>
              <p className="text-2xl font-semibold text-gray-900">{totalDistance.toFixed(1)} km</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">⏰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Time</h3>
              <p className="text-2xl font-semibold text-gray-900">{Math.round(totalTime / 60)}h {totalTime % 60}m</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Avg Section Price</h3>
              <p className="text-2xl font-semibold text-gray-900">LKR {Math.round(avgPrice)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Route Sections List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Route Section Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  From - To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Distance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Est. Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price per km
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {routeSections.map((section, index) => (
                <tr key={section.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-800 font-semibold text-sm mr-3">
                        {index + 1}
                      </div>
                      <div className="text-sm font-medium text-gray-900">{section.id}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      <div className="font-medium">{section.fromStop}</div>
                      <div className="text-gray-500 flex items-center">
                        <span className="mr-1">↓</span>
                        {section.toStop}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {section.distance.toFixed(1)} km
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    LKR {section.basePrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {section.estimatedTime} min
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    LKR {(section.basePrice / section.distance).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(section.status)}`}>
                      {section.status.charAt(0).toUpperCase() + section.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Route Map Visualization */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Route Visualization</h2>
        <div className="relative">
          {/* This would typically be a map component */}
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <div className="flex flex-col space-y-4">
              {routeSections.map((section, index) => (
                <div key={section.id} className="flex items-center">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <div className="flex-1 h-1 bg-blue-200 mx-2"></div>
                      <div className="text-sm font-medium text-gray-700">
                        {section.fromStop} → {section.toStop}
                      </div>
                      <div className="flex-1 h-1 bg-blue-200 mx-2"></div>
                      <div className="text-sm text-gray-500">
                        {section.distance}km | LKR {section.basePrice}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manager Access Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-xl mr-3">ℹ️</span>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Manager Access</h3>
            <p className="text-sm text-amber-700">
              You can view route sections for your assigned bus route. This information is read-only and helps you understand the pricing structure and route details for better management.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
