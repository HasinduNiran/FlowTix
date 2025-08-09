/*
 * UserModal Component
 * 
 * Features:
 * - Create/Edit users with username, password, and role
 * - Bus assignment for managers (shows only available buses)
 * - Form validation including manager bus assignment requirement
 * - Role-specific UI (bus assignment for managers, info for conductors)
 * - Supports super-admin access to assign any available buses
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BackendUser, BackendUserRole } from '@/types/auth';
import { BusService } from '@/services/bus.service';

interface Bus {
  _id: string;
  busNumber: string;
  busName: string;
  isActive: boolean;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => Promise<void>;
  user?: BackendUser | null;
  title: string;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  title
}) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'conductor' as BackendUserRole,
    assignedBuses: [] as string[],
    permissions: {},
  });
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [busesLoading, setBusesLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busSearchTerm, setBusSearchTerm] = useState('');

  const fetchAvailableBuses = async () => {
    try {
      setBusesLoading(true);
      // Use the new available buses endpoint for assignment
      // This automatically filters out buses already assigned to other managers
      // and respects role-based access (admin gets all available buses)
      // When editing a user, pass their ID to include their currently assigned buses
      const excludeUserId = user?._id || undefined;
      console.log('Fetching available buses for assignment, excludeUserId:', excludeUserId);
      
      const busesData = await BusService.getAvailableBusesForAssignment(excludeUserId);
      console.log('Received buses data:', busesData);
      
      // Transform to match our interface and filter active buses
      const availableBuses = busesData
        .filter(bus => bus.status === 'active')
        .map(bus => ({
          _id: bus._id,
          busNumber: bus.busNumber,
          busName: bus.busName,
          isActive: bus.status === 'active'
        }));
      
      console.log('Transformed available buses:', availableBuses);
      setBuses(availableBuses);
    } catch (error) {
      console.error('Error fetching available buses:', error);
      setBuses([]);
    } finally {
      setBusesLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Handle assignedBuses - could be array of IDs or populated objects
      let assignedBusIds: string[] = [];
      if (user.assignedBuses) {
        assignedBusIds = user.assignedBuses.map((bus: any) => 
          typeof bus === 'string' ? bus : bus._id
        );
        console.log('Loading user for edit:', {
          username: user.username,
          role: user.role,
          rawAssignedBuses: user.assignedBuses,
          extractedBusIds: assignedBusIds
        });
      }
      
      setFormData({
        username: user.username || '',
        password: '', // Never prefill password
        role: user.role || 'conductor',
        assignedBuses: assignedBusIds,
        permissions: user.permissions || {},
      });
    } else {
      setFormData({
        username: '',
        password: '',
        role: 'conductor',
        assignedBuses: [],
        permissions: {},
      });
    }
    setErrors({});
    
    // Fetch available buses when modal opens
    if (isOpen) {
      fetchAvailableBuses();
    }
  }, [user, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }

    if (!user && !formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!user && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Validate manager has at least one bus assigned
    if (formData.role === 'manager' && formData.assignedBuses.length === 0) {
      newErrors.assignedBuses = 'Managers must be assigned to at least one bus';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBusToggle = (busId: string) => {
    setFormData(prev => {
      const isCurrentlyAssigned = prev.assignedBuses.includes(busId);
      const newAssignedBuses = isCurrentlyAssigned
        ? prev.assignedBuses.filter(id => id !== busId) // Remove bus (untick)
        : [...prev.assignedBuses, busId]; // Add bus (tick)
      
      console.log(`Bus ${busId} ${isCurrentlyAssigned ? 'removed from' : 'assigned to'} manager`);
      console.log('Updated assigned buses:', newAssignedBuses);
      
      return {
        ...prev,
        assignedBuses: newAssignedBuses
      };
    });
    
    // Clear bus assignment error when user selects buses
    if (errors.assignedBuses) {
      setErrors(prev => ({ ...prev, assignedBuses: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const submitData: any = { ...formData };
      // Remove password if editing and password is empty
      if (user && !formData.password.trim()) {
        delete submitData.password;
      }
      
      // Clear assigned buses for conductors since they don't need pre-assignment
      if (formData.role === 'conductor') {
        submitData.assignedBuses = [];
      }
      
      console.log('Submitting user data:', {
        username: submitData.username,
        role: submitData.role,
        assignedBuses: submitData.assignedBuses,
        isEdit: !!user
      });
      
      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {title}
          </h2>
          <p className="text-sm text-gray-500 mt-1">Configure user details and permissions</p>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
        >
          <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Form Content */}
      <div className="p-6">
        <form id="userForm" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter username"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Password {user && '(leave empty to keep current)'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              placeholder={user ? "Leave empty to keep current" : "Enter password (min 8 characters)"}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value as BackendUserRole)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">Select a role</option>
              <option value="conductor">Conductor</option>
              <option value="manager">Manager</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Bus Assignment - Only for Managers */}
          {formData.role === 'manager' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Assign Buses <span className="text-red-500">*</span>
                <span className="text-xs font-normal text-gray-500 block mt-1">
                  Managers can oversee multiple buses and their operations
                </span>
              </label>
              
              {busesLoading ? (
                <div className="flex items-center justify-center p-8 text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600 mr-3"></div>
                  Loading available buses...
                </div>
              ) : (
                <>
                  {/* Bus Search Bar */}
                  <div className="mb-3">
                    <Input
                      type="text"
                      placeholder="Search buses by bus number..."
                      value={busSearchTerm}
                      onChange={(e) => setBusSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto p-1 border border-gray-200 rounded-lg">
                    {buses
                      .filter(bus => bus.isActive)
                      .filter(bus => 
                        bus.busNumber.toLowerCase().includes(busSearchTerm.toLowerCase()) ||
                        bus.busName.toLowerCase().includes(busSearchTerm.toLowerCase())
                      )
                      .map((bus) => {
                      const isAssigned = formData.assignedBuses.includes(bus._id);
                      console.log(`Bus ${bus.busNumber} (${bus._id}): ${isAssigned ? 'CHECKED' : 'unchecked'}`);
                      
                      return (
                        <label
                          key={bus._id}
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                            isAssigned
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={() => handleBusToggle(bus._id)}
                            className="rounded border-gray-300 text-blue-600 mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{bus.busNumber}</div>
                            <div className="text-sm text-gray-600">{bus.busName}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  {(() => {
                    const activeBuses = buses.filter(bus => bus.isActive);
                    const filteredBuses = activeBuses.filter(bus => 
                      bus.busNumber.toLowerCase().includes(busSearchTerm.toLowerCase()) ||
                      bus.busName.toLowerCase().includes(busSearchTerm.toLowerCase())
                    );
                    
                    if (activeBuses.length === 0) {
                      return (
                        <p className="text-gray-500 text-sm italic p-4 text-center border border-gray-200 rounded-lg">
                          No available buses for assignment. All buses are currently assigned to other managers.
                        </p>
                      );
                    } else if (filteredBuses.length === 0 && busSearchTerm) {
                      return (
                        <p className="text-gray-500 text-sm italic p-4 text-center border border-gray-200 rounded-lg">
                          No buses found matching "{busSearchTerm}". Try a different search term.
                        </p>
                      );
                    }
                    return null;
                  })()}
                </>
              )}
              
              {errors.assignedBuses && (
                <p className="mt-1 text-sm text-red-600">{errors.assignedBuses}</p>
              )}
            </div>
          )}

          {/* Info for Conductors */}
          {formData.role === 'conductor' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-blue-800 mb-1">Conductor Assignment</h4>
                  <p className="text-sm text-blue-700">
                    Conductors will be assigned to specific buses during trip scheduling. 
                    No pre-assignment needed at account creation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional permissions or settings can be added here */}
        </form>
      </div>
      
      {/* Footer */}
      <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-lg font-medium transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          form="userForm"
          disabled={loading}
          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          )}
          {user ? 'Update User' : 'Create User'}
        </button>
      </div>
    </>
  );
};

export default UserModal;
