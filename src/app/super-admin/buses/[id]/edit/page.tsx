'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { BusService, Bus } from '@/services/bus.service';
import BusForm from '@/components/dashboard/BusForm';

export default function EditBusPage() {
  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const busId = params.id as string;

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

  const handleEditBus = async (busData: Partial<Bus>) => {
    if (!bus) return;
    
    try {
      await BusService.updateBus(
        bus._id, 
        busData as Partial<Omit<Bus, '_id' | 'createdAt' | 'updatedAt'>>
      );
    } catch (err) {
      console.error('Error updating bus:', err);
      throw err;
    }
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
    <BusForm
      initialData={bus}
      isEditing={true}
      onSubmit={handleEditBus}
    />
  );
}
