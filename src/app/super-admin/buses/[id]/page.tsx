'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { BusService, Bus, User, Route } from '@/services/bus.service';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export default function BusDetailPage() {
  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const busId = params.id as string;
  const { user } = useAuth();

  // Helper functions to display the correct value whether it's a string or populated object
  const getOwnerDisplay = (ownerId: string | User) => {
    if (typeof ownerId === 'string') return ownerId;
    if (ownerId && typeof ownerId === 'object' && ownerId.username) {
      return ownerId.username;
    }
    return 'N/A';
  };

  const getConductorDisplay = (conductorId: string | User) => {
    if (typeof conductorId === 'string') return conductorId;
    if (conductorId && typeof conductorId === 'object' && conductorId.username) {
      return conductorId.username;
    }
    return 'N/A';
  };

  const getRouteDisplay = (routeId: string | Route) => {
    if (typeof routeId === 'string') return routeId;
    if (routeId && typeof routeId === 'object' && routeId.routeName) {
      return {
        name: routeId.routeName,
        number: routeId.routeNumber,
        id: routeId._id
      };
    }
    return { name: 'N/A', number: 'N/A', id: 'N/A' };
  };

  useEffect(() => {
    fetchBusDetails();
  }, [busId]);

  const fetchBusDetails = async () => {
    try {
      setLoading(true);
      const data = await BusService.getBusById(busId);
      setBus(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch bus details. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditBus = () => {
    router.push(`/super-admin/buses/${bus?._id}/edit`);
  };

  const handleDeleteBus = async () => {
    if (!bus) return;
    
    if (window.confirm('Are you sure you want to delete this bus?')) {
      try {
        await BusService.deleteBus(bus._id);
        router.push('/super-admin/buses');
      } catch (err) {
        setError('Failed to delete bus. Please try again.');
        console.error(err);
      }
    }
  };

  const handleBackClick = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading bus details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !bus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <Button 
              onClick={handleBackClick} 
              variant="outline"
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Buses
            </Button>
          </div>
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-red-200">
            <div className="text-center">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
              <p className="text-red-600 bg-red-50 p-4 rounded-xl">
                {error || 'Bus not found'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              onClick={handleBackClick} 
              variant="outline" 
              className="mr-4 hover:bg-gray-50 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Buses
            </Button>
          </div>
          
          {/* Hero Section */}
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center mb-6 md:mb-0">
                <div className="bg-blue-100 p-4 rounded-2xl mr-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-2a2 2 0 00-2-2H8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{bus.busName}</h1>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg text-gray-600">Bus #{bus.busNumber}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      bus.status === 'active' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={handleEditBus} 
                  variant="secondary"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Bus
                </Button>
                <Button 
                  onClick={handleDeleteBus} 
                  className="bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Bus
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Bus Information Card */}
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-xl mr-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Bus Information</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Bus Number</span>
                <span className="text-sm font-medium text-gray-900">{bus.busNumber}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Bus Name</span>
                <span className="text-sm font-medium text-gray-900">{bus.busName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Category</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{bus.category.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Seat Capacity</span>
                <span className="text-sm font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded-lg">{bus.seatCapacity}</span>
              </div>
            </div>
          </div>

          {/* Contact Information Card */}
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-3 rounded-xl mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Contact Information</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Telephone</span>
                <span className="text-sm font-medium text-gray-900">{bus.telephoneNumber}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Driver</span>
                <span className="text-sm font-medium text-gray-900">{bus.driverName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Owner</span>
                <span className="text-sm font-medium text-gray-900">{getOwnerDisplay(bus.ownerId)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Conductor</span>
                <span className="text-sm font-medium text-gray-900">{getConductorDisplay(bus.conductorId)}</span>
              </div>
            </div>
          </div>

          {/* Route Information Card */}
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="bg-purple-100 p-3 rounded-xl mr-3">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Route Information</h3>
            </div>
            <div className="space-y-4">
              {(() => {
                const routeInfo = getRouteDisplay(bus.routeId);
                if (typeof routeInfo === 'string') {
                  return (
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Route</span>
                      <span className="text-sm font-medium text-gray-900">{routeInfo}</span>
                    </div>
                  );
                } else {
                  return (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-xl border border-purple-100">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="bg-purple-100 p-2 rounded-lg mr-3">
                            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800">{routeInfo.name}</h4>
                            <p className="text-sm text-purple-600 font-medium">Route #{routeInfo.number}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          </div>

          {/* Notes Card */}
          {bus.notes && (
            <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200 lg:col-span-2 xl:col-span-1">
              <div className="flex items-center mb-4">
                <div className="bg-yellow-100 p-3 rounded-xl mr-3">
                  <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Notes</h3>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-sm text-gray-700 leading-relaxed">{bus.notes}</p>
              </div>
            </div>
          )}

          {/* System Information Card */}
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200 lg:col-span-2 xl:col-span-2">
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-3 rounded-xl mr-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">System Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Created At</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(bus.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(bus.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(bus.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(bus.updatedAt).toLocaleTimeString()}
                </p>
              </div>
              {bus.lastDayEndDate && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Last Day End</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(bus.lastDayEndDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(bus.lastDayEndDate).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 