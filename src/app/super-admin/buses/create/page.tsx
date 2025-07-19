'use client';

import { BusService, Bus } from '@/services/bus.service';
import BusForm from '@/components/dashboard/BusForm';

export default function CreateBusPage() {
  const handleCreateBus = async (busData: Partial<Bus>) => {
    try {
      await BusService.createBus(busData as Omit<Bus, '_id' | 'createdAt' | 'updatedAt'>);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create bus');
    }
  };

  return (
    <BusForm
      isEditing={false}
      onSubmit={handleCreateBus}
    />
  );
}
