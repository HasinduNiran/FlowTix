'use client';

import React, { useState, useEffect } from 'react';
import { Bus } from '@/services/bus.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface BusFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (busData: Partial<Bus>) => Promise<void>;
  initialData?: Bus | null;
  isEditing: boolean;
}

export default function BusFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null, 
  isEditing = false 
}: BusFormModalProps) {
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } else {
      // Reset form for add mode
      setFormData({
        busNumber: '',
        busName: '',
        telephoneNumber: '',
        category: '',
        ownerId: '',
        routeId: '',
        seatCapacity: 0,
        driverName: '',
        conductorId: '',
        status: 'active',
        notes: ''
      });
    }
    setError(null);
  }, [initialData, isEditing, isOpen]);

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

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred while saving the bus');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center">
              <div className="bg-white bg-opacity-20 p-3 rounded-2xl mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-2a2 2 0 00-2-2H8z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {isEditing ? 'Edit Bus Details' : 'Add New Bus'}
                </h2>
                <p className="text-blue-100 text-sm">
                  {isEditing ? 'Update bus information and settings' : 'Create a new bus entry in the system'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-xl p-2 transition-all duration-200"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8 max-h-[calc(95vh-120px)] overflow-y-auto">
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
                      Bus hu *
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
                      <option value="luxury">Luxury</option>
                      <option value="semi_luxury">Semi Luxury</option>
                      <option value="normal">Normal</option>
                      <option value="express">Express</option>
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
                      Owner ID *
                    </label>
                    <Input
                      type="text"
                      value={formData.ownerId}
                      onChange={(e) => handleInputChange('ownerId', e.target.value)}
                      placeholder="e.g., OWN001"
                      required
                      className="bg-white border-2 border-green-200 focus:border-green-400 rounded-xl px-4 py-3 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Conductor ID *
                    </label>
                    <Input
                      type="text"
                      value={formData.conductorId}
                      onChange={(e) => handleInputChange('conductorId', e.target.value)}
                      placeholder="e.g., CON001"
                      required
                      className="bg-white border-2 border-green-200 focus:border-green-400 rounded-xl px-4 py-3 transition-all duration-200"
                    />
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
                      Route ID *
                    </label>
                    <Input
                      type="text"
                      value={formData.routeId}
                      onChange={(e) => handleInputChange('routeId', e.target.value)}
                      placeholder="e.g., RT001"
                      required
                      className="bg-white border-2 border-purple-200 focus:border-purple-400 rounded-xl px-4 py-3 transition-all duration-200"
                    />
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

            {/* Enhanced Footer */}
            <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl font-medium transition-all duration-200"
              >
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
