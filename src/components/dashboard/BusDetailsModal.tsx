'use client';

import React from 'react';
import { Bus } from '@/services/bus.service';

interface BusDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bus: Bus | null;
}

export default function BusDetailsModal({ isOpen, onClose, bus }: BusDetailsModalProps) {
  if (!isOpen || !bus) return null;

  // Helper functions to get display values
  const getOwnerName = () => {
    if (typeof bus.ownerId === 'object' && bus.ownerId?.username) {
      return bus.ownerId.username;
    }
    return typeof bus.ownerId === 'string' ? bus.ownerId : 'Not assigned';
  };

  const getConductorName = () => {
    if (typeof bus.conductorId === 'object' && bus.conductorId?.username) {
      return bus.conductorId.username;
    }
    return typeof bus.conductorId === 'string' ? bus.conductorId : 'Not assigned';
  };

  const getRouteName = () => {
    if (typeof bus.routeId === 'object' && bus.routeId?.routeName) {
      return bus.routeId.routeName;
    }
    return typeof bus.routeId === 'string' ? bus.routeId : 'Not assigned';
  };

  const getRouteNumber = () => {
    if (typeof bus.routeId === 'object' && bus.routeId?.routeNumber) {
      return bus.routeId.routeNumber;
    }
    return 'Not assigned';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Bus Details</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Basic Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Bus Number</label>
                  <p className="text-gray-900 font-medium">{bus.busNumber}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Bus Name</label>
                  <p className="text-gray-900">{bus.busName}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Telephone Number</label>
                  <p className="text-gray-900">{bus.telephoneNumber}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Category</label>
                  <p className="text-gray-900 capitalize">{bus.category}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    bus.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Personnel Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Owner's Username</label>
                  <p className="text-gray-900">{getOwnerName()}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Driver Name</label>
                  <p className="text-gray-900">{bus.driverName || 'Not assigned'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Conductor's Username</label>
                  <p className="text-gray-900">{getConductorName()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Route Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Route Name</label>
                  <p className="text-gray-900">{getRouteName()}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Route Number</label>
                  <p className="text-gray-900">{getRouteNumber()}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Specifications</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Seat Capacity</label>
                  <p className="text-gray-900">{bus.seatCapacity} seats</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Information</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Notes</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{bus.notes || 'No notes available'}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-gray-900">{new Date(bus.createdAt).toLocaleDateString()}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="text-gray-900">{new Date(bus.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
