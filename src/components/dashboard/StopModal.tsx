'use client';
import React, { useState, useEffect } from 'react';
import { RouteService } from '@/services/route.service';
import { StopService } from '@/services/stop.service';

interface RouteType {
  _id: string;
  code: string;
  name: string;
  startLocation: string;
  endLocation: string;
  isActive: boolean;
}

interface StopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStopAdded: () => void;
}

const StopModal: React.FC<StopModalProps> = ({ isOpen, onClose, onStopAdded }) => {
  const [formData, setFormData] = useState({
    stopCode: '',
    stopName: '',
    sectionNumber: '',
    routeId: '',
  });
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<RouteType[]>([]);
  const [routeSearchTerm, setRouteSearchTerm] = useState('');
  const [showRouteSuggestions, setShowRouteSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load routes when modal opens
  useEffect(() => {
    if (isOpen) {
      loadRoutes();
      // Reset form when modal opens
      setFormData({
        stopCode: '',
        stopName: '',
        sectionNumber: '',
        routeId: '',
      });
      setRouteSearchTerm('');
      setErrors({});
    }
  }, [isOpen]);

  const loadRoutes = async () => {
    try {
      const response = await RouteService.getAllRoutes();
      setRoutes(response);
      setFilteredRoutes(response);
    } catch (error) {
      console.error('Error loading routes:', error);
    }
  };

  // Filter routes based on search term
  useEffect(() => {
    if (routeSearchTerm.trim() === '') {
      setFilteredRoutes(routes);
    } else {
      const searchLower = routeSearchTerm.toLowerCase();
      const filtered = routes.filter(route =>
        route.code.toLowerCase().includes(searchLower) ||
        route.name.toLowerCase().includes(searchLower) ||
        route.startLocation.toLowerCase().includes(searchLower) ||
        route.endLocation.toLowerCase().includes(searchLower)
      );
      setFilteredRoutes(filtered);
    }
  }, [routeSearchTerm, routes]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }

    // Real-time validation for section number
    if (name === 'sectionNumber' && formData.routeId && value) {
      checkSectionDuplicate(formData.routeId, parseInt(value));
    }
  };

  const checkSectionDuplicate = async (routeId: string, sectionNumber: number) => {
    if (!routeId || !sectionNumber || sectionNumber <= 0) return;
    
    try {
      const existingStops = await StopService.getStopsByRoute(routeId);
      const sectionExists = existingStops.some(stop => 
        stop.sectionNumber === sectionNumber
      );
      
      if (sectionExists) {
        setErrors(prev => ({
          ...prev,
          sectionNumber: `Section ${sectionNumber} already has a stop in this route`
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.sectionNumber;
          return newErrors;
        });
      }
    } catch (error) {
      console.error('Error checking section duplicate:', error);
    }
  };

  const handleRouteSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRouteSearchTerm(value);
    setShowRouteSuggestions(true);
    
    // If user clears the search, also clear the route selection
    if (value === '') {
      setFormData({ ...formData, routeId: '' });
    }
  };

  const validateForm = async () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.stopCode.trim()) {
      newErrors.stopCode = 'Stop code is required';
    }
    if (!formData.stopName.trim()) {
      newErrors.stopName = 'Stop name is required';
    }
    if (!formData.routeId) {
      newErrors.routeId = 'Route is required';
    }
    if (!formData.sectionNumber || parseInt(formData.sectionNumber) <= 0) {
      newErrors.sectionNumber = 'Valid section number is required';
    }

    // Check for duplicate stop code
    if (formData.stopCode.trim()) {
      try {
        const allStops = await StopService.getAllStops();
        const codeExists = allStops.some(stop => 
          stop.stopCode.toLowerCase() === formData.stopCode.trim().toLowerCase()
        );
        
        if (codeExists) {
          newErrors.stopCode = 'This stop code already exists';
        }
      } catch (error) {
        console.error('Error checking stop code:', error);
      }
    }

    // Check for duplicate section number in the same route
    if (formData.routeId && formData.sectionNumber) {
      try {
        const existingStops = await StopService.getStopsByRoute(formData.routeId);
        const sectionExists = existingStops.some(stop => 
          stop.sectionNumber === parseInt(formData.sectionNumber)
        );
        
        if (sectionExists) {
          newErrors.sectionNumber = `Section ${formData.sectionNumber} already has a stop in this route`;
        }
      } catch (error) {
        console.error('Error checking existing stops:', error);
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const stopData = {
        stopCode: formData.stopCode,
        stopName: formData.stopName,
        sectionNumber: parseInt(formData.sectionNumber),
        routeId: formData.routeId,
        isActive: true,
      };
      
      await StopService.createStop(stopData);
      onStopAdded();
      onClose();
    } catch (error: any) {
      setErrors({ general: error.message || 'Failed to create stop' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-out scale-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Add New Stop</h2>
            <p className="text-sm text-gray-500 mt-1">Create a new bus stop for the selected route</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
          >
            <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* Background gradient like section form */}
          <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6 rounded-lg border border-blue-200">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Display */}
              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{errors.general}</p>
                </div>
              )}

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stop Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stop Code *
                  </label>
                  <input
                    type="text"
                    name="stopCode"
                    value={formData.stopCode}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.stopCode ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter stop code"
                  />
                  {errors.stopCode && <p className="text-red-500 text-sm mt-1">{errors.stopCode}</p>}
                </div>

                {/* Stop Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Stop Name *
                  </label>
                  <input
                    type="text"
                    name="stopName"
                    value={formData.stopName}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.stopName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter stop name"
                  />
                  {errors.stopName && <p className="text-red-500 text-sm mt-1">{errors.stopName}</p>}
                </div>

                {/* Route Selection - Full Width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Route *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={routeSearchTerm}
                      onChange={handleRouteSearchChange}
                      onFocus={() => setShowRouteSuggestions(true)}
                      onBlur={() => {
                        // Delay hiding suggestions to allow for route selection
                        setTimeout(() => setShowRouteSuggestions(false), 200);
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                        errors.routeId ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                      placeholder="Search and select a route..."
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
                              
                              // Clear route error
                              if (errors.routeId) {
                                setErrors(prev => {
                                  const newErrors = { ...prev };
                                  delete newErrors.routeId;
                                  return newErrors;
                                });
                              }
                              
                              // Check section number if already entered
                              if (formData.sectionNumber) {
                                checkSectionDuplicate(route._id, parseInt(formData.sectionNumber));
                              }
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
                  </div>
                  {errors.routeId && <p className="text-red-500 text-sm mt-1">{errors.routeId}</p>}
                </div>

                {/* Section Number */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Section Number *
                  </label>
                  <input
                    type="number"
                    name="sectionNumber"
                    value={formData.sectionNumber}
                    onChange={handleInputChange}
                    min="1"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.sectionNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Enter section number"
                  />
                  {errors.sectionNumber && <p className="text-red-500 text-sm mt-1">{errors.sectionNumber}</p>}
                  <p className="text-gray-500 text-sm mt-1">
                    Each section number can only have one stop per route
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 font-medium transition-all"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Create Stop
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StopModal;
