'use client';

import { useState, useEffect } from 'react';

interface MonthlyFee {
  id: string;
  busNumber: string;
  busId: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentDate?: string;
  month: string;
  year: number;
}

export default function MonthlyFeesPage() {
  const [monthlyFees, setMonthlyFees] = useState<MonthlyFee[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  useEffect(() => {
    const fetchMonthlyFees = async () => {
      try {
        // Simulate API call - replace with actual backend call
        setTimeout(() => {
          const mockData: MonthlyFee[] = [
            {
              id: '1',
              busNumber: 'B001',
              busId: 'bus1',
              dueDate: '2025-01-31',
              amount: 15000,
              status: 'paid',
              paymentDate: '2025-01-15',
              month: 'January',
              year: 2025,
            },
            {
              id: '2',
              busNumber: 'B002',
              busId: 'bus2',
              dueDate: '2025-01-31',
              amount: 15000,
              status: 'pending',
              month: 'January',
              year: 2025,
            },
            {
              id: '3',
              busNumber: 'B003',
              busId: 'bus3',
              dueDate: '2024-12-31',
              amount: 15000,
              status: 'overdue',
              month: 'December',
              year: 2024,
            },
          ];
          setMonthlyFees(mockData);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching monthly fees:', error);
        setLoading(false);
      }
    };

    fetchMonthlyFees();
  }, []);

  const filteredFees = monthlyFees.filter(fee => 
    filter === 'all' || fee.status === filter
  );

  const getStatusBadge = (status: MonthlyFee['status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monthly Fees</h1>
            <p className="text-gray-600 mt-1">
              Manage monthly fee payments for your buses
            </p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
            Make Payment
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          {(['all', 'paid', 'pending', 'overdue'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab !== 'all' && (
                <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded-full">
                  {monthlyFees.filter(fee => fee.status === tab).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Fees List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Fee Records</h3>
        </div>
        
        {filteredFees.length === 0 ? (
          <div className="p-6 text-center">
            <span className="text-4xl mb-4 block">💰</span>
            <p className="text-gray-500">No monthly fees found for the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bus
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Date
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
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🚌</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {fee.busNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {fee.busId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fee.month} {fee.year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      LKR {fee.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(fee.status)}`}>
                        {fee.status.charAt(0).toUpperCase() + fee.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-2">
                        {fee.status === 'pending' || fee.status === 'overdue' ? (
                          <button className="text-blue-600 hover:text-blue-900 px-3 py-1 text-sm border border-blue-600 rounded">
                            Pay Now
                          </button>
                        ) : null}
                        <button className="text-gray-600 hover:text-gray-900 px-3 py-1 text-sm border border-gray-300 rounded">
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
