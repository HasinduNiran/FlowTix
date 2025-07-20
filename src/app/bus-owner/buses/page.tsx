'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { BusService, Bus } from '@/services/bus.service';

export default function BusesPage() {
  const { user } = useAuth();
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const fetchBuses = async () => {
    if (!user?.id) {
      setError('User information not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const fetchedBuses = await BusService.getBusesByOwner(user.id);
      setBuses(fetchedBuses);
    } catch (error: any) {
      console.error('Error fetching buses:', error);
      setError(error.response?.data?.message || 'Failed to fetch buses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [user?.id]);

  const filteredBuses = buses.filter(bus => 
    filter === 'all' || bus.status === filter
  );

  const getStatusBadge = (status: Bus['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDisplay = (status: Bus['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleStatusToggle = async (busId: string, currentStatus: Bus['status']) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      setLoading(true);
      const updatedBus = await BusService.updateBusStatus(busId, newStatus);
      
      // Update the bus in the local state
      setBuses(prevBuses => 
        prevBuses.map(bus => 
          bus._id === busId ? { ...bus, status: updatedBus.status } : bus
        )
      );
    } catch (error: any) {
      console.error('Error updating bus status:', error);
      setError(error.response?.data?.message || 'Failed to update bus status');
    } finally {
      setLoading(false);
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
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Bus Fleet Management</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Buses</h3>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={fetchBuses} 
            disabled={loading}
            className="mt-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
          >
            {loading ? 'Loading...' : 'Retry'}
          </button>
        </div>
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
              Monitor your bus fleet and their status
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Total Buses: <span className="font-semibold text-gray-900">{buses.length}</span>
            </div>
            <button 
              onClick={fetchBuses}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {(['all', 'active', 'inactive'] as const).map((tab) => (
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {buses.length === 0 ? 'No Buses Found' : 'No Buses Match Filter'}
          </h3>
          <p className="text-gray-500">
            {buses.length === 0 
              ? 'You don\'t have any buses registered in the system yet.' 
              : 'No buses found for the selected filter.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredBuses.map((bus) => (
            <div key={bus._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <span className="text-3xl mr-3">🚌</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {bus.busNumber}
                    </h3>
                    <p className="text-sm text-gray-500">{bus.busName}</p>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(bus.status)}`}>
                  {getStatusDisplay(bus.status)}
                </span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Category:</span>
                  <span className="text-sm font-medium text-gray-900">{bus.category}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Capacity:</span>
                  <span className="text-sm font-medium text-gray-900">{bus.seatCapacity} passengers</span>
                </div>
                
                {typeof bus.routeId === 'object' && bus.routeId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Route:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {bus.routeId.routeName || bus.routeId.routeNumber}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Driver:</span>
                  <span className="text-sm font-medium text-gray-900">{bus.driverName}</span>
                </div>
                
                {typeof bus.conductorId === 'object' && bus.conductorId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Conductor:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {bus.conductorId.username}
                    </span>
                  </div>
                )}
                
                {bus.telephoneNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Phone:</span>
                    <span className="text-sm font-medium text-gray-900">{bus.telephoneNumber}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 flex space-x-2">
                <button className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  View Details
                </button>
                <button className="flex-1 bg-gray-50 text-gray-600 hover:bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium transition-colors">
                  Edit
                </button>
                <button 
                  onClick={() => handleStatusToggle(bus._id, bus.status)}
                  disabled={loading}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    bus.status === 'active'
                      ? 'bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50'
                      : 'bg-green-50 text-green-600 hover:bg-green-100 disabled:opacity-50'
                  }`}
                >
                  {bus.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>

              {bus.notes && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600">
                    <span className="font-medium">Notes:</span> {bus.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
