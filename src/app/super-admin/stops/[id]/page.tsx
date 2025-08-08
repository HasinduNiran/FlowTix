'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { StopService, Stop } from '@/services/stop.service';
import { RouteService, Route } from '@/services/route.service';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Toast } from '@/components/ui/Toast';

export default function StopDetailPage() {
  const [stop, setStop] = useState<Stop | null>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false
  });
  const router = useRouter();
  const params = useParams();
  const stopId = params.id as string;
  const { user } = useAuth();

  useEffect(() => {
    fetchStopDetails();
  }, [stopId]);

  const fetchStopDetails = async () => {
    try {
      setLoading(true);
      const stopData = await StopService.getStopById(stopId);
      setStop(stopData);

      // Fetch route details if routeId is available
      if (stopData.routeId) {
        const routeId = typeof stopData.routeId === 'string' ? stopData.routeId : stopData.routeId._id;
        try {
          const routeData = await RouteService.getRouteById(routeId);
          setRoute(routeData);
        } catch (routeErr) {
          console.error('Error fetching route details:', routeErr);
        }
      }

      setError(null);
    } catch (err) {
      setError('Failed to fetch stop details. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditStop = () => {
    router.push(`/super-admin/stops/${stop?._id}/edit`);
  };

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const confirmDeleteStop = () => {
    setDeleteConfirmation({
      isOpen: true
    });
  };

  const handleDeleteStop = async () => {
    if (!stop) return;
    
    try {
      await StopService.deleteStop(stop._id);
      showToast('Success', 'Stop deleted successfully', 'success');
      // Set a small delay before redirecting to show the toast
      setTimeout(() => {
        router.push('/super-admin/stops');
      }, 1500);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete stop. Please try again.', 'error');
      setDeleteConfirmation({ isOpen: false });
    }
  };

  const handleBackClick = () => {
    router.push('/super-admin/stops');
  };

  const getRouteDisplay = () => {
    if (route) {
      return {
        name: route.name,
        code: route.code,
        path: `${route.startLocation} → ${route.endLocation}`
      };
    } else if (stop && typeof stop.routeId === 'object') {
      return {
        name: stop.routeId.routeName,
        code: stop.routeId.routeNumber,
        path: 'N/A'
      };
    }
    return {
      name: 'N/A',
      code: 'N/A',
      path: 'N/A'
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading stop details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <Button 
              onClick={handleBackClick} 
              variant="outline"
              className="group hover:bg-gray-50 transition-all duration-300 hover:shadow-md transform hover:-translate-x-1"
            >
              <svg className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Stops
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
                {error || 'Stop not found'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const routeDisplay = getRouteDisplay();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <Toast 
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all duration-300 ease-out scale-100">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <span className="font-semibold">{stop?.stopName}</span>? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmation({ isOpen: false })}
                className="px-4 py-2 border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteStop}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              onClick={handleBackClick} 
              variant="outline" 
              className="group mr-4 hover:bg-gray-50 transition-all duration-300 hover:shadow-md transform hover:-translate-x-1"
            >
              <svg className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Stops
            </Button>
          </div>
          
          {/* Hero Section */}
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center mb-6 md:mb-0">
                <div className="bg-red-100 p-4 rounded-2xl mr-6">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{stop.stopName}</h1>
                  <div className="flex items-center space-x-4">
                    <span className="text-lg text-gray-600">Code: {stop.stopCode}</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      stop.isActive 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {stop.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={handleEditStop} 
                  variant="secondary"
                  className="group bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 hover:from-emerald-100 hover:to-green-100 border-emerald-200 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Edit Stop
                </Button>
                <Button 
                  onClick={confirmDeleteStop} 
                  className="group bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  <svg className="w-4 h-4 mr-2 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete Stop
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Stop Information Card */}
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-xl mr-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Stop Information</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Stop Code</span>
                <span className="text-sm font-medium text-gray-900">{stop.stopCode}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Stop Name</span>
                <span className="text-sm font-medium text-gray-900">{stop.stopName}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-sm text-gray-500">Section Number</span>
                <span className="text-sm font-medium text-gray-900 bg-gray-50 px-2 py-1 rounded-lg">#{stop.sectionNumber}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`text-sm font-medium px-2 py-1 rounded-lg ${
                  stop.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {stop.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Route Information Card */}
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-3 rounded-xl mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Route Information</h3>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="bg-blue-100 p-2 rounded-lg mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{routeDisplay.name}</h4>
                    <p className="text-sm text-blue-600 font-medium">Route #{routeDisplay.code}</p>
                  </div>
                </div>
              </div>
              {routeDisplay.path !== 'N/A' && (
                <p className="text-sm text-gray-600 mt-2">{routeDisplay.path}</p>
              )}
            </div>
          </div>

          {/* System Information Card */}
          <div className="bg-white shadow-lg rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-shadow duration-200 lg:col-span-2 xl:col-span-1">
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-3 rounded-xl mr-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">System Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Created At</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(stop.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(stop.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(stop.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(stop.updatedAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
