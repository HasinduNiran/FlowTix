'use client';

import React, { useState, useEffect } from 'react';
import { Bus, User as BusUser } from '@/services/bus.service';
import { UserService, UserLookup } from '@/services/user.service';
import { RouteService, Route } from '@/services/route.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';

interface BusFormProps {
  initialData?: Bus | null;
  isEditing: boolean;
  onSubmit: (busData: Partial<Bus>) => Promise<void>;
}

export default function BusForm({ 
  initialData = null, 
  isEditing = false,
  onSubmit
}: BusFormProps) {
  const [formData, setFormData] = useState({
    busNumber: '',
    busName: '',
    telephoneNumber: '',
    category: '',
    ownerId: '',
    routeId: '',
    seatCapacity: 0,
    driverName: '',
    conductorId: '',
    status: 'active' as 'active' | 'inactive',
    notes: ''
  });

  const [ownerUsername, setOwnerUsername] = useState('');
  const [conductorUsername, setConductorUsername] = useState('');
  const [ownerSuggestions, setOwnerSuggestions] = useState<UserLookup[]>([]);
  const [conductorSuggestions, setConductorSuggestions] = useState<UserLookup[]>([]);
  const [showOwnerSuggestions, setShowOwnerSuggestions] = useState(false);
  const [showConductorSuggestions, setShowConductorSuggestions] = useState(false);
  const [ownerValidation, setOwnerValidation] = useState<{
    isValid: boolean;
    message: string;
    isLoading: boolean;
  }>({ isValid: false, message: '', isLoading: false });
  const [conductorValidation, setConductorValidation] = useState<{
    isValid: boolean;
    message: string;
    isLoading: boolean;
  }>({ isValid: false, message: '', isLoading: false });

  const [routeNumber, setRouteNumber] = useState('');
  const [routeSuggestions, setRouteSuggestions] = useState<Route[]>([]);
  const [showRouteSuggestions, setShowRouteSuggestions] = useState(false);
  const [routeValidation, setRouteValidation] = useState<{
    isValid: boolean;
    message: string;
    isLoading: boolean;
  }>({ isValid: false, message: '', isLoading: false });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (initialData && isEditing) {
      setFormData({
        busNumber: initialData.busNumber,
        busName: initialData.busName,
        telephoneNumber: initialData.telephoneNumber,
        category: initialData.category,
        ownerId: typeof initialData.ownerId === 'string' ? initialData.ownerId : initialData.ownerId._id,
        routeId: typeof initialData.routeId === 'string' ? initialData.routeId : initialData.routeId._id,
        seatCapacity: initialData.seatCapacity,
        driverName: initialData.driverName,
        conductorId: typeof initialData.conductorId === 'string' ? initialData.conductorId : initialData.conductorId._id,
        status: initialData.status,
        notes: initialData.notes || ''
      });

      // Set usernames for display when editing
      if (typeof initialData.ownerId === 'object' && initialData.ownerId.username) {
        setOwnerUsername(initialData.ownerId.username);
        setOwnerValidation({ isValid: true, message: 'Valid owner', isLoading: false });
      }
      if (typeof initialData.conductorId === 'object' && initialData.conductorId.username) {
        setConductorUsername(initialData.conductorId.username);
        setConductorValidation({ isValid: true, message: 'Valid conductor', isLoading: false });
      }
      // Set route number for display when editing
      if (typeof initialData.routeId === 'object' && initialData.routeId.routeNumber) {
        setRouteNumber(initialData.routeId.routeNumber);
        setRouteValidation({ isValid: true, message: 'Valid route', isLoading: false });
      }
    }
  }, [initialData, isEditing]);

  // Fetch owner suggestions when typing
  useEffect(() => {
    const fetchOwnerSuggestions = async () => {
      if (ownerUsername.trim().length >= 1) {
        try {
          const suggestions = await UserService.searchUsersByRole('owner', ownerUsername);
          setOwnerSuggestions(suggestions.slice(0, 5)); // Limit to 5 suggestions
        } catch (error) {
          console.error('Error fetching owner suggestions:', error);
          setOwnerSuggestions([]);
        }
      } else {
        setOwnerSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchOwnerSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [ownerUsername]);

  // Fetch conductor suggestions when typing
  useEffect(() => {
    const fetchConductorSuggestions = async () => {
      if (conductorUsername.trim().length >= 1) {
        try {
          const suggestions = await UserService.searchUsersByRole('conductor', conductorUsername);
          setConductorSuggestions(suggestions.slice(0, 5)); // Limit to 5 suggestions
        } catch (error) {
          console.error('Error fetching conductor suggestions:', error);
          setConductorSuggestions([]);
        }
      } else {
        setConductorSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchConductorSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [conductorUsername]);

  // Debounced username validation
  useEffect(() => {
    const validateOwner = async () => {
      if (!ownerUsername.trim()) {
        setOwnerValidation({ isValid: false, message: '', isLoading: false });
        setFormData(prev => ({ ...prev, ownerId: '' }));
        return;
      }

      setOwnerValidation({ isValid: false, message: '', isLoading: true });

      try {
        const user = await UserService.getUserByUsername(ownerUsername);
        if (user && (user.role === 'owner' || user.role === 'admin')) {
          setOwnerValidation({ isValid: true, message: 'Valid owner', isLoading: false });
          setFormData(prev => ({ ...prev, ownerId: user._id }));
        } else if (user) {
          setOwnerValidation({ isValid: false, message: 'User must be an owner', isLoading: false });
          setFormData(prev => ({ ...prev, ownerId: '' }));
        } else {
          setOwnerValidation({ isValid: false, message: 'User not found', isLoading: false });
          setFormData(prev => ({ ...prev, ownerId: '' }));
        }
      } catch (error) {
        setOwnerValidation({ isValid: false, message: 'Error validating user', isLoading: false });
        setFormData(prev => ({ ...prev, ownerId: '' }));
      }
    };

    const timeoutId = setTimeout(validateOwner, 500);
    return () => clearTimeout(timeoutId);
  }, [ownerUsername]);

  useEffect(() => {
    const validateConductor = async () => {
      if (!conductorUsername.trim()) {
        setConductorValidation({ isValid: false, message: '', isLoading: false });
        setFormData(prev => ({ ...prev, conductorId: '' }));
        return;
      }

      setConductorValidation({ isValid: false, message: '', isLoading: true });

      try {
        const user = await UserService.getUserByUsername(conductorUsername);
        if (user && (user.role === 'conductor' || user.role === 'admin')) {
          setConductorValidation({ isValid: true, message: 'Valid conductor', isLoading: false });
          setFormData(prev => ({ ...prev, conductorId: user._id }));
        } else if (user) {
          setConductorValidation({ isValid: false, message: 'User must be a conductor', isLoading: false });
          setFormData(prev => ({ ...prev, conductorId: '' }));
        } else {
          setConductorValidation({ isValid: false, message: 'User not found', isLoading: false });
          setFormData(prev => ({ ...prev, conductorId: '' }));
        }
      } catch (error) {
        setConductorValidation({ isValid: false, message: 'Error validating user', isLoading: false });
        setFormData(prev => ({ ...prev, conductorId: '' }));
      }
    };

    const timeoutId = setTimeout(validateConductor, 500);
    return () => clearTimeout(timeoutId);
  }, [conductorUsername]);

  // Fetch route suggestions when typing
  useEffect(() => {
    const fetchRouteSuggestions = async () => {
      if (routeNumber.trim().length >= 1) {
        try {
          const suggestions = await RouteService.searchRoutesByNumber(routeNumber);
          setRouteSuggestions(suggestions.slice(0, 5)); // Limit to 5 suggestions
        } catch (error) {
          console.error('Error fetching route suggestions:', error);
          setRouteSuggestions([]);
        }
      } else {
        setRouteSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchRouteSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [routeNumber]);

  // Debounced route validation
  useEffect(() => {
    const validateRoute = async () => {
      if (!routeNumber.trim()) {
        setRouteValidation({ isValid: false, message: '', isLoading: false });
        setFormData(prev => ({ ...prev, routeId: '' }));
        return;
      }

      setRouteValidation({ isValid: false, message: '', isLoading: true });

      try {
        const routes = await RouteService.getAllRoutes();
        const route = routes.find(r => r.code === routeNumber && r.isActive);
        if (route) {
          setRouteValidation({ isValid: true, message: 'Valid route', isLoading: false });
          setFormData(prev => ({ ...prev, routeId: route._id }));
        } else {
          setRouteValidation({ isValid: false, message: 'Route not found or inactive', isLoading: false });
          setFormData(prev => ({ ...prev, routeId: '' }));
        }
      } catch (error) {
        setRouteValidation({ isValid: false, message: 'Error validating route', isLoading: false });
        setFormData(prev => ({ ...prev, routeId: '' }));
      }
    };

    const timeoutId = setTimeout(validateRoute, 500);
    return () => clearTimeout(timeoutId);
  }, [routeNumber]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate that owner and conductor are properly set
    if (!ownerValidation.isValid || !formData.ownerId) {
      setError('Please enter a valid owner username');
      setIsSubmitting(false);
      return;
    }

    if (!conductorValidation.isValid || !formData.conductorId) {
      setError('Please enter a valid conductor username');
      setIsSubmitting(false);
      return;
    }

    // Validate that a route is selected
    if (!routeValidation.isValid || !formData.routeId) {
      setError('Please enter a valid route number');
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
      router.push('/super-admin/buses');
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the bus');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/super-admin/buses');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              onClick={handleCancel} 
              variant="outline" 
              className="mr-4 hover:bg-gray-50 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Buses
            </Button>
          </div>
          
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-4 rounded-2xl mr-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-2a2 2 0 00-2-2H8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {isEditing ? 'Edit Bus Details' : 'Add New Bus'}
                </h1>
                <p className="text-gray-600">
                  {isEditing ? 'Update bus information and settings' : 'Create a new bus entry in the system'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center">
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Basic Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-100 p-3 rounded-xl mr-3">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Basic Information</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      Bus Number *
                    </label>
                    <Input
                      type="text"
                      value={formData.busNumber}
                      onChange={(e) => handleInputChange('busNumber', e.target.value)}
                      placeholder="e.g., NB 1234"
                      required
                      className="bg-white border-2 border-blue-200 focus:border-blue-400 rounded-xl px-4 py-3 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Bus Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.busName}
                      onChange={(e) => handleInputChange('busName', e.target.value)}
                      placeholder="e.g., Express Liner"
                      required
                      className="bg-white border-2 border-blue-200 focus:border-blue-400 rounded-xl px-4 py-3 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      required
                      className="w-full bg-white border-2 border-blue-200 focus:border-blue-400 rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none"
                    >
                      <option value="">Select Category</option>
                      <option value="normal">Normal</option>
                      <option value="luxury">Luxury</option>
                      <option value="semi_luxury">Semi Luxury</option>
                      <option value="high_luxury">High Luxury</option>
                      <option value="sisu_sariya">Sisu Sariya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Seat Capacity *
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.seatCapacity}
                      onChange={(e) => handleInputChange('seatCapacity', parseInt(e.target.value) || 0)}
                      placeholder="e.g., 45"
                      required
                      className="bg-white border-2 border-blue-200 focus:border-blue-400 rounded-xl px-4 py-3 transition-all duration-200"
                    />
                  </div>
                </div>
              </div>

              {/* Contact & Personnel Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border border-green-100">
                <div className="flex items-center mb-4">
                  <div className="bg-green-100 p-3 rounded-xl mr-3">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Contact & Personnel</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      Telephone Number *
                    </label>
                    <Input
                      type="tel"
                      value={formData.telephoneNumber}
                      onChange={(e) => handleInputChange('telephoneNumber', e.target.value)}
                      placeholder="e.g., +1234567890"
                      required
                      className="bg-white border-2 border-green-200 focus:border-green-400 rounded-xl px-4 py-3 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Driver Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.driverName}
                      onChange={(e) => handleInputChange('driverName', e.target.value)}
                      placeholder="e.g., John Doe"
                      required
                      className="bg-white border-2 border-green-200 focus:border-green-400 rounded-xl px-4 py-3 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                      Owner Username *
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={ownerUsername}
                        onChange={(e) => {
                          setOwnerUsername(e.target.value);
                          setShowOwnerSuggestions(true);
                          setError(null);
                        }}
                        onFocus={() => {
                          if (ownerSuggestions.length > 0) {
                            setShowOwnerSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          // Delay hiding suggestions to allow clicking
                          setTimeout(() => setShowOwnerSuggestions(false), 200);
                        }}
                        placeholder="e.g., john_owner"
                        required
                        className={`bg-white border-2 rounded-xl px-4 py-3 pr-10 transition-all duration-200 ${
                          ownerValidation.isLoading 
                            ? 'border-yellow-300 focus:border-yellow-400' 
                            : ownerValidation.isValid 
                            ? 'border-green-300 focus:border-green-400' 
                            : ownerUsername && !ownerValidation.isValid 
                            ? 'border-red-300 focus:border-red-400'
                            : 'border-green-200 focus:border-green-400'
                        }`}
                      />
                      
                      {/* Autocomplete Suggestions */}
                      {showOwnerSuggestions && ownerSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {ownerSuggestions.map((user) => (
                            <div
                              key={user._id}
                              className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                              onClick={() => {
                                setOwnerUsername(user.username);
                                setFormData(prev => ({ ...prev, ownerId: user._id }));
                                setOwnerValidation({ isValid: true, message: 'Valid owner', isLoading: false });
                                setShowOwnerSuggestions(false);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900">{user.username}</div>
                                  <div className="text-sm text-gray-500 capitalize">Role: {user.role}</div>
                                </div>
                                <div className="flex items-center">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    user.isActive 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {ownerValidation.isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
                        ) : ownerValidation.isValid ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : ownerUsername && !ownerValidation.isValid ? (
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : null}
                      </div>
                    </div>
                    {ownerUsername && ownerValidation.message && (
                      <p className={`mt-1 text-xs ${
                        ownerValidation.isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {ownerValidation.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Conductor Username *
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={conductorUsername}
                        onChange={(e) => {
                          setConductorUsername(e.target.value);
                          setShowConductorSuggestions(true);
                          setError(null);
                        }}
                        onFocus={() => {
                          if (conductorSuggestions.length > 0) {
                            setShowConductorSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          // Delay hiding suggestions to allow clicking
                          setTimeout(() => setShowConductorSuggestions(false), 200);
                        }}
                        placeholder="e.g., jane_conductor"
                        required
                        className={`bg-white border-2 rounded-xl px-4 py-3 pr-10 transition-all duration-200 ${
                          conductorValidation.isLoading 
                            ? 'border-yellow-300 focus:border-yellow-400' 
                            : conductorValidation.isValid 
                            ? 'border-green-300 focus:border-green-400' 
                            : conductorUsername && !conductorValidation.isValid 
                            ? 'border-red-300 focus:border-red-400'
                            : 'border-green-200 focus:border-green-400'
                        }`}
                      />
                      
                      {/* Autocomplete Suggestions */}
                      {showConductorSuggestions && conductorSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {conductorSuggestions.map((user) => (
                            <div
                              key={user._id}
                              className="px-4 py-3 hover:bg-green-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                              onClick={() => {
                                setConductorUsername(user.username);
                                setFormData(prev => ({ ...prev, conductorId: user._id }));
                                setConductorValidation({ isValid: true, message: 'Valid conductor', isLoading: false });
                                setShowConductorSuggestions(false);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900">{user.username}</div>
                                  <div className="text-sm text-gray-500 capitalize">Role: {user.role}</div>
                                </div>
                                <div className="flex items-center">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    user.isActive 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {conductorValidation.isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
                        ) : conductorValidation.isValid ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : conductorUsername && !conductorValidation.isValid ? (
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : null}
                      </div>
                    </div>
                    {conductorUsername && conductorValidation.message && (
                      <p className={`mt-1 text-xs ${
                        conductorValidation.isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {conductorValidation.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Route & Status Card */}
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-100">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-100 p-3 rounded-xl mr-3">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Route & Status</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Route Number *
                    </label>
                    <div className="relative">
                      <Input
                        type="text"
                        value={routeNumber}
                        onChange={(e) => {
                          setRouteNumber(e.target.value);
                          setShowRouteSuggestions(true);
                          setError(null);
                        }}
                        onFocus={() => {
                          if (routeSuggestions.length > 0) {
                            setShowRouteSuggestions(true);
                          }
                        }}
                        onBlur={() => {
                          // Delay hiding suggestions to allow clicking
                          setTimeout(() => setShowRouteSuggestions(false), 200);
                        }}
                        placeholder="e.g., CE-001"
                        required
                        className={`bg-white border-2 rounded-xl px-4 py-3 pr-10 transition-all duration-200 ${
                          routeValidation.isLoading 
                            ? 'border-yellow-300 focus:border-yellow-400' 
                            : routeValidation.isValid 
                            ? 'border-green-300 focus:border-green-400' 
                            : routeNumber && !routeValidation.isValid 
                            ? 'border-red-300 focus:border-red-400'
                            : 'border-purple-200 focus:border-purple-400'
                        }`}
                      />
                      
                      {/* Autocomplete Suggestions */}
                      {showRouteSuggestions && routeSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {routeSuggestions.map((route) => (
                            <div
                              key={route._id}
                              className="px-4 py-3 hover:bg-purple-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                              onClick={() => {
                                setRouteNumber(route.code);
                                setFormData(prev => ({ ...prev, routeId: route._id }));
                                setRouteValidation({ isValid: true, message: 'Valid route', isLoading: false });
                                setShowRouteSuggestions(false);
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-gray-900">{route.code}</div>
                                  <div className="text-sm text-gray-600">{route.name}</div>
                                  <div className="text-xs text-gray-500">{route.startLocation} → {route.endLocation}</div>
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
                      
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        {routeValidation.isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-yellow-400 border-t-transparent"></div>
                        ) : routeValidation.isValid ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : routeNumber && !routeValidation.isValid ? (
                          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : null}
                      </div>
                    </div>
                    {routeNumber && routeValidation.message && (
                      <p className={`mt-1 text-xs ${
                        routeValidation.isValid ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {routeValidation.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Status *
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="active"
                          checked={formData.status === 'active'}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="mr-2 text-green-500 focus:ring-green-400"
                        />
                        <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">Active</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="inactive"
                          checked={formData.status === 'inactive'}
                          onChange={(e) => handleInputChange('status', e.target.value)}
                          className="mr-2 text-red-500 focus:ring-red-400"
                        />
                        <span className="text-sm font-medium text-red-700 bg-red-100 px-3 py-1 rounded-full">Inactive</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      placeholder="Additional notes or comments..."
                      rows={4}
                      className="w-full bg-white border-2 border-purple-200 focus:border-purple-400 rounded-xl px-4 py-3 transition-all duration-200 focus:outline-none resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-red-500 text-white hover:bg-red-600 rounded-xl font-medium transition-all duration-200 border-2 border-red-700 shadow-md hover:shadow-lg flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {isEditing ? 'Update Bus' : 'Create Bus'}
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
