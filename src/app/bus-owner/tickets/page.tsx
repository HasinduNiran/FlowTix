'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { TicketService, Ticket } from '@/services/ticket.service';
import { BusService, Bus } from '@/services/bus.service';

export default function TicketsPage() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const fetchTickets = async (page: number = 1) => {
    if (!user?.id) {
      setError('User information not available');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const filters: any = {
        page,
        limit: pagination.limit,
        sort: '-createdAt'
      };
      
      if (selectedBus) filters.busId = selectedBus;
      if (selectedDate) filters.date = selectedDate;
      
      console.log('Fetching tickets with filters:', filters);
      console.log('Owner ID:', user.id);
      
      const result = await TicketService.getTicketsByOwner(user.id, filters);
      console.log('Tickets result:', result);
      
      setTickets(result.tickets);
      setPagination({
        page: result.currentPage,
        limit: pagination.limit,
        total: result.total,
        totalPages: result.totalPages
      });
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      setError(error.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchBuses = async () => {
    if (!user?.id) return;
    
    try {
      console.log('Fetching buses for owner ID:', user.id);
      const ownerBuses = await BusService.getBusesByOwner(user.id);
      console.log('Owner buses:', ownerBuses);
      setBuses(ownerBuses);
    } catch (error: any) {
      console.error('Error fetching buses:', error);
      setError(`Failed to fetch buses: ${error.message || error}`);
    }
  };

  useEffect(() => {
    fetchBuses();
  }, [user?.id]);

  useEffect(() => {
    fetchTickets(1);
  }, [user?.id, selectedBus, selectedDate]);

  const getBusDisplay = (busData: any) => {
    if (typeof busData === 'object' && busData) {
      return busData.busNumber || busData.busName || 'Unknown Bus';
    }
    return 'Unknown Bus';
  };

  const getRouteDisplay = (routeData: any) => {
    if (typeof routeData === 'object' && routeData) {
      return routeData.routeName || routeData.routeNumber || 'Unknown Route';
    }
    return 'Unknown Route';
  };

  const getConductorDisplay = (conductorData: any) => {
    if (typeof conductorData === 'object' && conductorData) {
      return conductorData.fullName || conductorData.username || 'Unknown Conductor';
    }
    return 'Unknown Conductor';
  };

  const formatDateTime = (dateTime: string | Date) => {
    return new Date(dateTime).toLocaleString();
  };

  const formatTime = (dateTime: string | Date) => {
    return new Date(dateTime).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return 'bg-green-100 text-green-800';
      case 'card':
        return 'bg-blue-100 text-blue-800';
      case 'online':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && tickets.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <span className="text-4xl mb-4 block">⚠️</span>
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Tickets</h3>
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => fetchTickets(1)}
            disabled={loading}
            className="mt-4 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
          >
            {loading ? 'Loading...' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ticket Management</h1>
            <p className="text-gray-600 mt-1">
              Monitor ticket sales and booking data for your buses
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Total Tickets: <span className="font-semibold text-gray-900">{pagination.total}</span>
            </div>
            <button 
              onClick={() => fetchTickets(pagination.page)}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bus Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bus</label>
            <select 
              value={selectedBus}
              onChange={(e) => setSelectedBus(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Buses</option>
              {buses.map((bus) => (
                <option key={bus._id} value={bus._id}>
                  {bus.busNumber} - {bus.busName}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Clear Filters */}
          <div className="flex items-end">
            <button
              onClick={() => {
                setSelectedBus('');
                setSelectedDate(new Date().toISOString().split('T')[0]);
              }}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🎫</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">👥</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Passengers</p>
              <p className="text-2xl font-bold text-gray-900">
                {tickets.reduce((sum, ticket) => sum + ticket.totalPassengers, 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">💰</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                LKR {tickets.reduce((sum, ticket) => sum + ticket.farePaid, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">💵</span>
            <div>
              <p className="text-sm font-medium text-gray-600">Cash Collected</p>
              <p className="text-2xl font-bold text-gray-900">
                LKR {tickets.reduce((sum, ticket) => sum + ticket.paidAmount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Ticket Records ({tickets.length})
          </h3>
        </div>
        
        {tickets.length === 0 ? (
          <div className="p-6 text-center">
            <span className="text-4xl mb-4 block">🎫</span>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Tickets Found
            </h3>
            <p className="text-gray-500">
              No ticket records found for the selected date and bus filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Journey
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Passengers
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trip Info
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🎫</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.ticketId}
                          </div>
                          <div className="text-sm text-gray-500">
                            Bus: {getBusDisplay(ticket.busId)}
                          </div>
                          <div className="text-sm text-gray-400">
                            Conductor: {getConductorDisplay(ticket.conductorId)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Route: {getRouteDisplay(ticket.routeId)}
                      </div>
                      <div className="text-sm text-gray-500">
                        From: {ticket.fromStop.stopName}
                      </div>
                      <div className="text-sm text-gray-500">
                        To: {ticket.toStop.stopName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Total: {ticket.totalPassengers}
                      </div>
                      {ticket.passengers.map((passenger, index) => (
                        <div key={index} className="text-xs text-gray-500">
                          {passenger.fareType}: {passenger.quantity} × LKR {passenger.farePerUnit}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        LKR {ticket.farePaid.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Paid: LKR {ticket.paidAmount.toLocaleString()}
                      </div>
                      {ticket.balance !== 0 && (
                        <div className="text-sm text-red-600">
                          Balance: LKR {ticket.balance.toLocaleString()}
                        </div>
                      )}
                      <span className={`inline-flex mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getPaymentMethodBadge(ticket.paymentMethod)}`}>
                        {ticket.paymentMethod.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        Trip #{ticket.tripNumber}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatTime(ticket.dateTime)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(ticket.dateTime).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} tickets
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => fetchTickets(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => fetchTickets(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
