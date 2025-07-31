'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface MonthlyFee {
  id: string;
  month: string;
  year: number;
  busId: string;
  busName: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  paymentMethod?: string;
  transactionId?: string;
  lateFee?: number;
}

export default function ManagerMonthlyFeesPage() {
  const { user } = useAuth();
  const [monthlyFees, setMonthlyFees] = useState<MonthlyFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedYear, setSelectedYear] = useState<number>(2025);

  useEffect(() => {
    const fetchMonthlyFees = async () => {
      try {
        // In real implementation, fetch only monthly fees for the assigned bus
        setTimeout(() => {
          const mockFees: MonthlyFee[] = [
            {
              id: 'MF001',
              month: 'January',
              year: 2025,
              busId: 'B001',
              busName: 'Express Line 1',
              amount: 25000,
              dueDate: '2025-01-31',
              paidDate: '2025-01-28',
              status: 'paid',
              paymentMethod: 'Bank Transfer',
              transactionId: 'TXN001234567'
            },
            {
              id: 'MF002',
              month: 'February',
              year: 2025,
              busId: 'B001',
              busName: 'Express Line 1',
              amount: 25000,
              dueDate: '2025-02-28',
              status: 'pending'
            },
            {
              id: 'MF003',
              month: 'December',
              year: 2024,
              busId: 'B001',
              busName: 'Express Line 1',
              amount: 25000,
              dueDate: '2024-12-31',
              paidDate: '2024-12-30',
              status: 'paid',
              paymentMethod: 'Cash',
              transactionId: 'TXN001234566'
            },
            {
              id: 'MF004',
              month: 'November',
              year: 2024,
              busId: 'B001',
              busName: 'Express Line 1',
              amount: 25000,
              dueDate: '2024-11-30',
              paidDate: '2024-12-05',
              status: 'paid',
              paymentMethod: 'Bank Transfer',
              transactionId: 'TXN001234565',
              lateFee: 2500
            }
          ];
          setMonthlyFees(mockFees);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching monthly fees:', error);
        setError('Failed to load monthly fees data');
        setLoading(false);
      }
    };

    fetchMonthlyFees();
  }, [selectedYear]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return '✅';
      case 'pending':
        return '⏳';
      case 'overdue':
        return '⚠️';
      case 'partial':
        return '🔄';
      default:
        return '📄';
    }
  };

  const filteredFees = monthlyFees.filter(fee => fee.year === selectedYear);
  const totalPaid = filteredFees.filter(fee => fee.status === 'paid').reduce((sum, fee) => sum + fee.amount + (fee.lateFee || 0), 0);
  const totalPending = filteredFees.filter(fee => fee.status === 'pending').reduce((sum, fee) => sum + fee.amount, 0);
  const totalOverdue = filteredFees.filter(fee => fee.status === 'overdue').reduce((sum, fee) => sum + fee.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Monthly Fees</h1>
            <p className="text-gray-600">
              Track monthly fee payments for your assigned bus.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Paid</h3>
              <p className="text-2xl font-semibold text-gray-900">LKR {totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pending</h3>
              <p className="text-2xl font-semibold text-gray-900">LKR {totalPending.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
              <p className="text-2xl font-semibold text-gray-900">LKR {totalOverdue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Payment Rate</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredFees.length > 0 ? Math.round((filteredFees.filter(f => f.status === 'paid').length / filteredFees.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Fees List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Fee Payment History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bus
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paid Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFees.map((fee) => (
                <tr key={fee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{fee.month} {fee.year}</div>
                    <div className="text-sm text-gray-500">Fee ID: {fee.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{fee.busName}</div>
                    <div className="text-sm text-gray-500">{fee.busId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">LKR {fee.amount.toLocaleString()}</div>
                    {fee.lateFee && (
                      <div className="text-sm text-red-600">+ LKR {fee.lateFee.toLocaleString()} (late fee)</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {fee.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {fee.paidDate || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{fee.paymentMethod || '-'}</div>
                    {fee.transactionId && (
                      <div className="text-sm text-gray-500">TXN: {fee.transactionId}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(fee.status)}`}>
                      <span className="mr-1">{getStatusIcon(fee.status)}</span>
                      {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        View Details
                      </button>
                      {fee.status === 'pending' && (
                        <button className="text-green-600 hover:text-green-900">
                          Mark as Paid
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredFees.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">💰</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No fee records found</h3>
            <p className="text-gray-500">No monthly fee records available for {selectedYear}.</p>
          </div>
        )}
      </div>

      {/* Payment Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <span className="text-2xl mr-3">💡</span>
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Payment Information</h3>
            <div className="text-blue-700 space-y-2 text-sm">
              <p>• Monthly fees are due by the end of each month</p>
              <p>• Late payments may incur additional charges</p>
              <p>• Payment methods: Bank Transfer, Cash, Online Payment</p>
              <p>• Contact administration for payment assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Manager Access Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-xl mr-3">ℹ️</span>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Manager Access</h3>
            <p className="text-sm text-amber-700">
              You can view monthly fee payment history for your assigned bus. For payment processing or disputes, contact your supervisor or administration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
