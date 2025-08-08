'use client';

import React, { useState, useEffect } from 'react';
import { Stop, CreateStopData, UpdateStopData, StopService } from '@/services/stop.service';
import { RouteService, Route } from '@/services/route.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

interface StopFormProps {
  initialData?: Stop | null;
  isEdit?: boolean;
  onSuccess?: () => void;
}

export default function StopForm({ 
  initialData = null, 
  isEdit = false,
  onSuccess
}: StopFormProps) {
  const [formData, setFormData] = useState({
    stopCode: '',
    stopName: '',
    sectionNumber: 0,
    routeId: '',
    isActive: true
  });

  const [availableRoutes, setAvailableRoutes] = useState<Route[]>([]);
  const [routesLoading, setRoutesLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [routeSearchTerm, setRouteSearchTerm] = useState('');
  const [showRouteSuggestions, setShowRouteSuggestions] = useState(false);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchAvailableRoutes();
  }, []);

  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        stopCode: initialData.stopCode,
        stopName: initialData.stopName,
        sectionNumber: initialData.sectionNumber,
        routeId: typeof initialData.routeId === 'string' ? initialData.routeId : initialData.routeId._id,
        isActive: initialData.isActive
      });
      
      // Set route search term for editing
      if (typeof initialData.routeId === 'object') {
        setRouteSearchTerm(`${initialData.routeId.routeNumber} - ${initialData.routeId.routeName}`);
      }
    }
  }, [initialData, isEdit]);

  useEffect(() => {
    // Filter routes based on search term
    if (routeSearchTerm.trim()) {
      const filtered = availableRoutes.filter(route =>
        (route.code && route.code.toLowerCase().includes(routeSearchTerm.toLowerCase())) ||
        (route.name && route.name.toLowerCase().includes(routeSearchTerm.toLowerCase()))
      );
      setFilteredRoutes(filtered.slice(0, 5)); // Limit to 5 suggestions
    } else {
      setFilteredRoutes([]);
    }
  }, [routeSearchTerm, availableRoutes]);

  const fetchAvailableRoutes = async () => {
    try {
      setRoutesLoading(true);
      const routes = await RouteService.getAllRoutes();
      setAvailableRoutes(routes.filter(route => route.isActive));
    } catch (error) {
      console.error('Error fetching routes:', error);
      setError('Failed to load available routes');
    } finally {
      setRoutesLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.stopCode.trim()) {
      setError('Stop code is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.stopName.trim()) {
      setError('Stop name is required');
      setIsSubmitting(false);
      return;
    }

    if (!formData.routeId) {
      setError('Please select a route');
      setIsSubmitting(false);
      return;
    }

    if (formData.sectionNumber < 0) {
      setError('Section number must be 0 or greater');
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEdit && initialData) {
        // Update existing stop
        await StopService.updateStop(initialData._id, formData as UpdateStopData);
        setSuccess('Stop updated successfully!');
      } else {
        // Create new stop
        await StopService.createStop(formData as CreateStopData);
        setSuccess('Stop created successfully!');
      }

      // Handle success callback or navigation
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        setTimeout(() => {
          router.push('/super-admin/stops');
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error submitting form:', error);
      const errorMessage = error?.response?.data?.message || error.message || `Failed to ${isEdit ? 'update' : 'create'} stop`;
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEdit && initialData) {
      router.push(`/super-admin/stops/${initialData._id}`);
    } else {
      router.push('/super-admin/stops');
    }
  };

  const handleBackClick = () => {
    if (isEdit && initialData) {
      router.push(`/super-admin/stops/${initialData._id}`);
    } else {
      router.push('/super-admin/stops');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              onClick={handleBackClick} 
              variant="outline" 
              className="mr-4 hover:bg-gray-50 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </Button>
          </div>
          
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-red-100 to-pink-100 p-4 rounded-2xl mr-6">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 616 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isEdit ? 'Edit Stop Details' : 'Add New Stop'}
                </h1>
                <p className="text-gray-600">
                  {isEdit ? 'Update stop information and settings' : 'Create a new bus stop in the system'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information Card */}
              <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-2xl border border-red-100">
                <div className="flex items-center mb-4">
                  <div className="bg-red-100 p-3 rounded-xl mr-3">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Stop Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stop Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.stopCode}
                      onChange={(e) => setFormData({ ...formData, stopCode: e.target.value })}
                      placeholder="Enter stop code"
                      required
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stop Name <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.stopName}
                      onChange={(e) => setFormData({ ...formData, stopName: e.target.value })}
                      placeholder="Enter stop name"
                      required
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      value={formData.sectionNumber}
                      onChange={(e) => setFormData({ ...formData, sectionNumber: parseInt(e.target.value) || 0 })}
                      placeholder="Enter section number"
                      min="0"
                      required
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Route Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-xl mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Route Assignment</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Route <span className="text-red-500">*</span>
                    </label>
                    {routesLoading ? (
                      <div className="flex items-center justify-center p-4 bg-white rounded-lg border border-blue-200">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-2"></div>
                        <span className="text-sm text-gray-600">Loading routes...</span>
                      </div>
                    ) : (
                      <div className="relative">
                        <Input
                          type="text"
                          value={routeSearchTerm}
                          onChange={(e) => {
                            setRouteSearchTerm(e.target.value);
                            setShowRouteSuggestions(true);
                          }}
                          onFocus={() => {
                            if (filteredRoutes.length > 0) {
                              setShowRouteSuggestions(true);
                            }
                          }}
                          onBlur={() => {
                            // Delay hiding to allow clicking on suggestions
                            setTimeout(() => setShowRouteSuggestions(false), 200);
                          }}
                          placeholder="Type route number or name..."
                          required
                          className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                        />
                        
                        {/* Route Suggestions Dropdown */}
                        {showRouteSuggestions && filteredRoutes.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-blue-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {filteredRoutes.map((route) => (
                              <div
                                key={route._id}
                                className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                                onMouseDown={(e) => {
                                  e.preventDefault(); // Prevent blur event
                                  setFormData({ ...formData, routeId: route._id });
                                  setRouteSearchTerm(`${route.code} - ${route.name}`);
                                  setShowRouteSuggestions(false);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium text-gray-900">{route.code} - {route.name}</div>
                                    <div className="text-sm text-gray-500">
                                      {route.startLocation} → {route.endLocation}
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                      route.isActive 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {route.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* No results message */}
                        {showRouteSuggestions && filteredRoutes.length === 0 && routeSearchTerm.trim().length >= 1 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-blue-300 rounded-lg shadow-lg">
                            <div className="px-4 py-3 text-center text-gray-500">
                              <div className="flex items-center justify-center">
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                No routes found
                              </div>
                              <div className="text-xs mt-1">
                                Try searching with different terms
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Clear route button */}
                        {routeSearchTerm && (
                          <button
                            type="button"
                            onClick={() => {
                              setRouteSearchTerm('');
                              setFormData({ ...formData, routeId: '' });
                              setShowRouteSuggestions(false);
                            }}
                            className="absolute right-2 top-2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    )}
                    <p className="mt-1 text-xs text-gray-500">
                      Start typing to search for available routes
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.isActive ? 'true' : 'false'}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center transform hover:scale-105"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || routesLoading}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isEdit ? 'Update Stop' : 'Create Stop'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
