'use client';

import { BusService, Bus } from '@/services/bus.service';
import BusForm from '@/components/dashboard/BusForm';

export default function CreateBusPage() {
  const handleCreateBus = async (busData: Partial<Bus>) => {
    try {
      await BusService.createBus(busData as Omit<Bus, '_id' | 'createdAt' | 'updatedAt'>);
    } catch (err: any) {
      // More specific error handling
      const errorMessage = err?.response?.data?.message || err.message || 'Failed to create bus';
      
      // Log the full error for debugging
      console.error('Full error details:', err?.response?.data || err);
      
      throw new Error(errorMessage);
    }
  };

  return (
    <BusForm
      isEditing={false}
      onSubmit={handleCreateBus}
    />
  );
}
