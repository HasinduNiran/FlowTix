'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MonthlyFee, CreateMonthlyFeeRequest, UpdateMonthlyFeeRequest } from '@/services/monthlyFee.service';
import { BusService, Bus } from '@/services/bus.service';

interface MonthlyFeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  monthlyFee?: MonthlyFee | null;
  title: string;
}

const MonthlyFeeModal: React.FC<MonthlyFeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  monthlyFee,
  title
}) => {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loadingBuses, setLoadingBuses] = useState(false);
  const [formData, setFormData] = useState({
    busId: '',
    ownerId: '',
    month: '',
    amount: '',
    paidAmount: '',
    status: 'unpaid' as 'paid' | 'unpaid' | 'partial',
    paymentDate: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load buses on component mount
  useEffect(() => {
    const fetchBuses = async () => {
      try {
        setLoadingBuses(true);
        const fetchedBuses = await BusService.getAllBuses();
        setBuses(fetchedBuses);
      } catch (error) {
        console.error('Error fetching buses:', error);
      } finally {
        setLoadingBuses(false);
      }
    };

    if (isOpen) {
      fetchBuses();
    }
  }, [isOpen]);

  // Update form data when monthlyFee prop changes
  useEffect(() => {
    if (monthlyFee) {
      setFormData({
        busId: monthlyFee.busId._id || '',
        ownerId: monthlyFee.ownerId._id || '',
        month: monthlyFee.month || '',
        amount: monthlyFee.amount?.toString() || '',
        paidAmount: monthlyFee.paidAmount?.toString() || '',
        status: monthlyFee.status || 'unpaid',
        paymentDate: monthlyFee.paymentDate ? new Date(monthlyFee.paymentDate).toISOString().split('T')[0] : '',
        notes: monthlyFee.notes || ''
      });
    } else {
      // Reset form for new monthly fee
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      setFormData({
        busId: '',
        ownerId: '',
        month: currentMonth,
        amount: '',
        paidAmount: '',
        status: 'unpaid',
        paymentDate: '',
        notes: ''
      });
    }
    setErrors({});
  }, [monthlyFee, isOpen]);

  const handleBusChange = (busId: string) => {
    const selectedBus = buses.find(bus => bus._id === busId);
    const ownerId = typeof selectedBus?.ownerId === 'object' 
      ? selectedBus.ownerId._id 
      : selectedBus?.ownerId || '';
    
    setFormData(prev => ({
      ...prev,
      busId,
      ownerId
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.busId.trim()) {
      newErrors.busId = 'Bus selection is required';
    }
    if (!formData.month.trim()) {
      newErrors.month = 'Month is required';
    }
    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be a positive number';
    }
    
    if (formData.paidAmount && (isNaN(Number(formData.paidAmount)) || Number(formData.paidAmount) < 0)) {
      newErrors.paidAmount = 'Paid amount must be a non-negative number';
    }

    if (formData.status === 'paid' && (!formData.paidAmount || Number(formData.paidAmount) === 0)) {
      newErrors.paidAmount = 'Paid amount is required when status is paid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const submitData = {
        ...formData,
        amount: Number(formData.amount),
        paidAmount: formData.paidAmount ? Number(formData.paidAmount) : 0,
        paymentDate: formData.paymentDate || undefined
      };

      await onSave(submitData);
      onClose();
    } catch (error: any) {
      console.error('Error saving monthly fee:', error);
      // Handle validation errors from backend
      if (error.response?.data?.details) {
        setErrors(error.response.data.details);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bus Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bus <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.busId}
              onChange={(e) => handleBusChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.busId ? 'border-red-300' : 'border-gray-300'
              }`}
              disabled={loadingBuses || !!monthlyFee}
            >
              <option value="">Select a bus</option>
              {buses.map(bus => (
                <option key={bus._id} value={bus._id}>
                  {bus.busNumber} - {bus.busName}
                </option>
              ))}
            </select>
            {errors.busId && <p className="mt-1 text-sm text-red-600">{errors.busId}</p>}
          </div>

          {/* Month */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month <span className="text-red-500">*</span>
            </label>
            <input
              type="month"
              value={formData.month}
              onChange={(e) => handleInputChange('month', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.month ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.month && <p className="mt-1 text-sm text-red-600">{errors.month}</p>}
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Fee Amount <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter fee amount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.amount ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.amount && <p className="mt-1 text-sm text-red-600">{errors.amount}</p>}
          </div>

          {/* Paid Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paid Amount
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter paid amount"
              value={formData.paidAmount}
              onChange={(e) => handleInputChange('paidAmount', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.paidAmount ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.paidAmount && <p className="mt-1 text-sm text-red-600">{errors.paidAmount}</p>}
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date
            </label>
            <input
              type="date"
              value={formData.paymentDate}
              onChange={(e) => handleInputChange('paymentDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            rows={3}
            placeholder="Enter any additional notes..."
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-vertical"
          />
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="px-6 py-2"
          >
            Cancel
          </Button>
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </div>
            ) : (
              monthlyFee ? 'Update Fee' : 'Create Fee'
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default MonthlyFeeModal;
