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
        ownerId: initialData.ownerId,
        routeId: initialData.routeId,
        seatCapacity: initialData.seatCapacity,
        driverName: initialData.driverName,
        conductorId: initialData.conductorId,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            {isEditing ? 'Edit Bus' : 'Add New Bus'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bus Number *
                </label>
                <Input
                  type="text"
                  value={formData.busNumber}
                  onChange={(e) => handleInputChange('busNumber', e.target.value)}
                  placeholder="Enter bus number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bus Name *
                </label>
                <Input
                  type="text"
                  value={formData.busName}
                  onChange={(e) => handleInputChange('busName', e.target.value)}
                  placeholder="Enter bus name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telephone Number *
                </label>
                <Input
                  type="text"
                  value={formData.telephoneNumber}
                  onChange={(e) => handleInputChange('telephoneNumber', e.target.value)}
                  placeholder="Enter telephone number"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select category</option>
                  <option value="luxury">Luxury</option>
                  <option value="semi-luxury">Semi-Luxury</option>
                  <option value="normal">Normal</option>
                  <option value="intercity">Intercity</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Details</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner ID
                </label>
                <Input
                  type="text"
                  value={formData.ownerId}
                  onChange={(e) => handleInputChange('ownerId', e.target.value)}
                  placeholder="Enter owner ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route ID
                </label>
                <Input
                  type="text"
                  value={formData.routeId}
                  onChange={(e) => handleInputChange('routeId', e.target.value)}
                  placeholder="Enter route ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seat Capacity *
                </label>
                <Input
                  type="number"
                  value={formData.seatCapacity.toString()}
                  onChange={(e) => handleInputChange('seatCapacity', parseInt(e.target.value) || 0)}
                  placeholder="Enter seat capacity"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Driver Name
                </label>
                <Input
                  type="text"
                  value={formData.driverName}
                  onChange={(e) => handleInputChange('driverName', e.target.value)}
                  placeholder="Enter driver name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Conductor ID
                </label>
                <Input
                  type="text"
                  value={formData.conductorId}
                  onChange={(e) => handleInputChange('conductorId', e.target.value)}
                  placeholder="Enter conductor ID"
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              onClick={onClose}
              variant="secondary"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? 'Saving...' : (isEditing ? 'Update Bus' : 'Add Bus')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
