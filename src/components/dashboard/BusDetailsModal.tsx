'use client';

import { Bus } from '@/services/bus.service';
import { Button } from '@/components/ui/Button';

interface BusDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bus: Bus | null;
}

export default function BusDetailsModal({
  isOpen,
  onClose,
  bus
}: BusDetailsModalProps) {
  if (!isOpen || !bus) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Bus Details
            </h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Bus Information</h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 block">Bus Number</span>
                    <span className="text-sm font-medium">{bus.busNumber}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Bus Name</span>
                    <span className="text-sm font-medium">{bus.busName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Telephone Number</span>
                    <span className="text-sm font-medium">{bus.telephoneNumber}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Category</span>
                    <span className="text-sm font-medium capitalize">{bus.category.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Capacity & Status</h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 block">Seat Capacity</span>
                    <span className="text-sm font-medium">{bus.seatCapacity}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Status</span>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      bus.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Personnel</h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 block">Owner's Username</span>
                    <span className="text-sm font-medium">{bus.ownerId}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Driver Name</span>
                    <span className="text-sm font-medium">{bus.driverName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Conductor's Username</span>
                    <span className="text-sm font-medium">{bus.conductorId}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Route Information</h3>
                <div className="mt-2 space-y-2">
                  <div>
                    <span className="text-xs text-gray-500 block">Route ID</span>
                    <span className="text-sm font-medium">{bus.routeId}</span>
                  </div>
                  {/* Route name would be displayed here if available */}
                  <div>
                    <span className="text-xs text-gray-500 block">Route Name</span>
                    <span className="text-sm font-medium">Not available</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 block">Route Number</span>
                    <span className="text-sm font-medium">Not available</span>
                  </div>
                </div>
              </div>
            </div>

            {bus.notes && (
              <div className="col-span-1 md:col-span-2">
                <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                <p className="mt-2 text-sm text-gray-600">{bus.notes}</p>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>
    </div>
  );
} 