'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ExpenseTypeService } from '@/services/expense.service';
import { BusService } from '@/services/bus.service';

interface ExpenseType {
  _id: string;
  expenseName: string;
  description: string;
  busId: {
    _id: string;
    busNumber: string;
    busName: string;
  } | string;
  isActive: boolean;
}

interface Bus {
  _id: string;
  busNumber: string;
  busName: string;
  seatCapacity: number;
  status: string;
}

export default function EditExpenseTypePage() {
  const [formData, setFormData] = useState({
    expenseName: '',
    description: '',
    busId: '',
    isActive: true
  });
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [expenseTypeData, busesData] = await Promise.all([
        ExpenseTypeService.getExpenseTypeById(id),
        BusService.getAllBuses()
      ]);

      setFormData({
        expenseName: expenseTypeData.expenseName,
        description: expenseTypeData.description || '',
        busId: typeof expenseTypeData.busId === 'object' ? expenseTypeData.busId._id : expenseTypeData.busId || '',
        isActive: expenseTypeData.isActive
      });
      setBuses(busesData);
      setError(null);
    } catch (err) {
      setError('Failed to load expense type data. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.expenseName.trim()) {
      setError('Expense name is required');
      return;
    }

    try {
      setSubmitting(true);
      await ExpenseTypeService.updateExpenseType(id, formData);
      router.push(`/super-admin/expenses/types/${id}`);
    } catch (err) {
      setError('Failed to update expense type. Please try again.');
      console.error('Error updating expense type:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading expense type...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center mb-6 md:mb-0">
                <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-2xl mr-6">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Expense Type</h1>
                  <p className="text-gray-600">Update expense type information</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="hover:bg-gray-50"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-2xl border border-gray-200 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expense Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expense Name *
                </label>
                <Input
                  type="text"
                  name="expenseName"
                  value={formData.expenseName}
                  onChange={handleInputChange}
                  placeholder="Enter expense name"
                  required
                />
              </div>

              {/* Bus Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Bus
                </label>
                <select
                  name="busId"
                  value={formData.busId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                >
                  <option value="">Select a bus</option>
                  {buses.map(bus => (
                    <option key={bus._id} value={bus._id}>
                      {bus.busNumber} - {bus.busName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter expense description"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
              />
            </div>

            {/* Status */}
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">Active</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-gray-50 px-8 py-4 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-md hover:shadow-lg transition-all duration-200"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Updating...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Update Expense Type
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
