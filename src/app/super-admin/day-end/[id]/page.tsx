'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DayEndService, DayEnd } from '@/services/dayEnd.service';
import { BusService } from '@/services/bus.service';
import { Button } from '@/components/ui/Button';

export default function DayEndDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dayEndId = params.id as string;
  
  const [dayEnd, setDayEnd] = useState<DayEnd | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [buses, setBuses] = useState<any[]>([]);

  useEffect(() => {
    if (dayEndId) {
      fetchDayEnd();
      fetchBuses();
    }
  }, [dayEndId]);

  const fetchDayEnd = async () => {
    setLoading(true);
    try {
      const data = await DayEndService.getDayEndById(dayEndId);
      setDayEnd(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch day end record:', err);
      setError('Failed to load day end record. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    try {
      const busData = await BusService.getAllBuses();
      setBuses(busData);
    } catch (err) {
      console.error('Error fetching buses:', err);
    }
  };

  const handleStatusUpdate = async (newStatus: 'approved' | 'rejected') => {
    if (!dayEnd) return;
    
    if (window.confirm(`Are you sure you want to ${newStatus} this day end record?`)) {
      try {
        await DayEndService.updateDayEndStatus(dayEnd._id, newStatus);
        fetchDayEnd(); // Refresh the data
      } catch (err: any) {
        alert(err.message || `Failed to ${newStatus} day end record`);
      }
    }
  };

  const getBusNumber = (busId: string | any) => {
    if (typeof busId === 'object' && busId) {
      return busId.busNumber || busId.regNumber || 'Unknown Bus';
    }
    const bus = buses.find(bus => bus._id === busId);
    return bus?.busNumber || 'Unknown Bus';
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleTimeString();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !dayEnd) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex justify-center items-center">
        <div className="text-center py-12">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg inline-block">
            <strong className="font-bold">Error: </strong>
            <span>{error || 'Day end record not found'}</span>
            <div className="mt-4">
              <Button onClick={() => router.push('/super-admin/day-end')} variant="primary">
                Back to Day End List
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <Button 
                onClick={() => router.push('/super-admin/day-end')}
                variant="outline"
                className="mb-4"
              >
                ← Back to Day End List
              </Button>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Day End Details
              </h1>
              <p className="text-gray-600 mt-2">
                Day end report for {getBusNumber(dayEnd.busId)} on {formatDate(dayEnd.date)}
              </p>
            </div>
            <div className={`px-4 py-2 rounded-full border ${getStatusColor(dayEnd.status)}`}>
              <span className="font-semibold">
                {dayEnd.status.charAt(0).toUpperCase() + dayEnd.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bus:</span>
                  <span className="font-medium">{getBusNumber(dayEnd.busId)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(dayEnd.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Trips:</span>
                  <span className="font-medium text-blue-600">{dayEnd.tripDetails.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Conductor:</span>
                  <span className="font-medium">
                    {typeof dayEnd.conductorId === 'object' && dayEnd.conductorId 
                      ? (dayEnd.conductorId.username || 'Unknown Conductor')
                      : 'Unknown Conductor'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Financial Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="font-medium text-green-600">Rs. {dayEnd.totalRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Expenses:</span>
                  <span className="font-medium text-red-600">Rs. {dayEnd.totalExpenses.toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Profit/Loss:</span>
                  <span className={dayEnd.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    Rs. {dayEnd.profit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {dayEnd.status === 'pending' && (
              <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Actions</h2>
                <div className="space-y-3">
                  <Button
                    onClick={() => handleStatusUpdate('approved')}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Approve Day End
                  </Button>
                  <Button
                    onClick={() => handleStatusUpdate('rejected')}
                    variant="outline"
                    className="w-full border-red-600 text-red-600 hover:bg-red-50"
                  >
                    Reject Day End
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Details */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Trip Details</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trip #
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Start Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        End Time
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Passengers
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Fare
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cash in Hand
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dayEnd.tripDetails.map((trip, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          #{trip.tripNumber}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(trip.startTime)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatTime(trip.endTime)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {trip.passengerCount}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                          Rs. {trip.totalFare.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                          Rs. {trip.cashInHand.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expenses */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Expenses</h2>
              </div>
              <div className="overflow-x-auto">
                {dayEnd.expenses.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expense Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dayEnd.expenses.map((expense, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                            {expense.expenseName}
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                            Rs. {expense.amount.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No expenses recorded for this day
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {dayEnd.notes && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Notes</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{dayEnd.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
