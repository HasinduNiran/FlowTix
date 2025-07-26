'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Ticket {
  id: string;
  passengerName: string;
  fromStop: string;
  toStop: string;
  price: number;
  tripId: string;
  routeName: string;
  seatNumber: string;
  bookingTime: string;
  status: 'booked' | 'used' | 'cancelled' | 'refunded';
  paymentMethod: 'cash' | 'card' | 'digital';
}

export default function ManagerTicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'today' | 'week'>('today');
  const [statusFilter, setStatusFilter] = useState<'all' | 'booked' | 'used' | 'cancelled'>('all');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // In real implementation, fetch only tickets for the assigned bus
        setTimeout(() => {
          const mockTickets: Ticket[] = [
            {
              id: 'TKT001',
              passengerName: 'Kamal Perera',
              fromStop: 'Colombo Fort',
              toStop: 'Kandy',
              price: 300,
              tripId: 'T001',
              routeName: 'Colombo - Kandy',
              seatNumber: 'A1',
              bookingTime: '2025-01-26 05:45:00',
              status: 'used',
              paymentMethod: 'cash'
            },
            {
              id: 'TKT002',
              passengerName: 'Nimal Silva',
              fromStop: 'Pettah',
              toStop: 'Peradeniya',
              price: 280,
              tripId: 'T001',
              routeName: 'Colombo - Kandy',
              seatNumber: 'A2',
              bookingTime: '2025-01-26 05:50:00',
              status: 'used',
              paymentMethod: 'card'
            },
            {
              id: 'TKT003',
              passengerName: 'Sunil Fernando',
              fromStop: 'Kandy',
              toStop: 'Colombo Fort',
              price: 300,
              tripId: 'T002',
              routeName: 'Kandy - Colombo',
              seatNumber: 'B1',
              bookingTime: '2025-01-26 10:30:00',
              status: 'used',
              paymentMethod: 'digital'
            },
            {
              id: 'TKT004',
              passengerName: 'Amara Wijesinghe',
              fromStop: 'Colombo Fort',
              toStop: 'Kandy',
              price: 300,
              tripId: 'T003',
              routeName: 'Colombo - Kandy',
              seatNumber: 'C1',
              bookingTime: '2025-01-26 15:45:00',
              status: 'booked',
              paymentMethod: 'cash'
            },
            {
              id: 'TKT005',
              passengerName: 'Priya Jayawardena',
              fromStop: 'Pettah',
              toStop: 'Peradeniya',
              price: 280,
              tripId: 'T003',
              routeName: 'Colombo - Kandy',
              seatNumber: 'C2',
              bookingTime: '2025-01-26 15:50:00',
              status: 'booked',
              paymentMethod: 'card'
            }
          ];
          setTickets(mockTickets);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setError('Failed to load tickets data');
        setLoading(false);
      }
    };

    fetchTickets();
  }, [filter, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'used':
        return 'bg-green-100 text-green-800';
      case 'booked':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'used':
        return '✅';
      case 'booked':
        return '🎫';
      case 'cancelled':
        return '❌';
      case 'refunded':
        return '💰';
      default:
        return '📄';
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return '💵';
      case 'card':
        return '💳';
      case 'digital':
        return '📱';
      default:
        return '💰';
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    if (statusFilter !== 'all' && ticket.status !== statusFilter) {
      return false;
    }
    return true;
  });

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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Bus Tickets</h1>
            <p className="text-gray-600">
              Monitor ticket sales and passenger information for your assigned bus.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="all">All Time</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="booked">Booked</option>
              <option value="used">Used</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">🎫</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Tickets</h3>
              <p className="text-2xl font-semibold text-gray-900">{filteredTickets.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Used Tickets</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {filteredTickets.filter(t => t.status === 'used').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-semibold text-gray-900">
                LKR {filteredTickets.reduce((sum, ticket) => sum + ticket.price, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Avg Ticket Price</h3>
              <p className="text-2xl font-semibold text-gray-900">
                LKR {filteredTickets.length > 0 ? Math.round(filteredTickets.reduce((sum, ticket) => sum + ticket.price, 0) / filteredTickets.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Ticket Details</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ticket ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Passenger
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Seat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{ticket.id}</div>
                    <div className="text-sm text-gray-500">Trip: {ticket.tripId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ticket.passengerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{ticket.fromStop}</div>
                    <div className="text-sm text-gray-500">↓ {ticket.toStop}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {ticket.seatNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    LKR {ticket.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center text-sm text-gray-900">
                      <span className="mr-1">{getPaymentIcon(ticket.paymentMethod)}</span>
                      {ticket.paymentMethod.charAt(0).toUpperCase() + ticket.paymentMethod.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                      <span className="mr-1">{getStatusIcon(ticket.status)}</span>
                      {ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(ticket.bookingTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        View
                      </button>
                      {ticket.status === 'booked' && (
                        <button className="text-red-600 hover:text-red-900">
                          Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredTickets.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">🎫</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
            <p className="text-gray-500">No tickets match your current filter criteria.</p>
          </div>
        )}
      </div>

      {/* Manager Access Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-xl mr-3">ℹ️</span>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Manager Access</h3>
            <p className="text-sm text-amber-700">
              You can only view and manage tickets for trips operated by your assigned bus. All ticket data shown is specific to your bus operations only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
