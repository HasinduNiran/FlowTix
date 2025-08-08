'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TicketService, Ticket } from '@/services/ticket.service';
import { RouteService } from '@/services/route.service';
import { BusService } from '@/services/bus.service';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

export default function TicketDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;
  
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [route, setRoute] = useState<any>(null);
  const [bus, setBus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
  }>({
    isOpen: false
  });

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails();
    }
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      setLoading(true);
      const ticketData = await TicketService.getTicketById(ticketId);
      setTicket(ticketData);
      
      // Fetch route details
      if (ticketData.routeId) {
        const routeId = typeof ticketData.routeId === 'string' 
          ? ticketData.routeId 
          : ticketData.routeId._id;
        const routeData = await RouteService.getRouteById(routeId);
        setRoute(routeData);
      }
      
      // Fetch bus details
      if (ticketData.busId) {
        const busId = typeof ticketData.busId === 'string'
          ? ticketData.busId
          : ticketData.busId._id;
        const busData = await BusService.getBusById(busId);
        setBus(busData);
      }
      
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch ticket details');
      console.error('Error fetching ticket details:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getPaymentMethodColor = (paymentMethod: string) => {
    switch (paymentMethod?.toLowerCase()) {
      case 'cash':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'card':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'online':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({
      isOpen: true,
      title,
      message,
      type
    });
  };

  const confirmDeleteTicket = () => {
    setDeleteConfirmation({
      isOpen: true
    });
  };

  const handleDeleteTicket = async () => {
    try {
      await TicketService.deleteTicket(ticketId);
      showToast('Success', 'Ticket deleted successfully', 'success');
      // Set a small delay before redirecting to show the toast
      setTimeout(() => {
        router.push('/super-admin/tickets');
      }, 1500);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete ticket', 'error');
      setDeleteConfirmation({
        isOpen: false
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="text-center py-12">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg inline-block">
                <strong className="font-bold">Error: </strong>
                <span>{error || 'Ticket not found'}</span>
                <div className="mt-4 flex space-x-2">
                  <Button 
                    onClick={() => router.back()}
                    variant="secondary"
                  >
                    Go Back
                  </Button>
                  <Button 
                    onClick={fetchTicketDetails}
                    variant="primary"
                  >
                    Retry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Toast 
        isOpen={toast.isOpen}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
        title={toast.title}
        message={toast.message}
        type={toast.type}
      />

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 transform transition-all duration-300 ease-out scale-100">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-2 rounded-full">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="ml-3 text-lg font-semibold text-gray-900">Confirm Delete</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this ticket? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmation({ isOpen: false })}
                className="px-4 py-2 border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteTicket}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.back()}
                    className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    title="Go Back"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Ticket Details
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Ticket #{ticket.ticketId}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getPaymentMethodColor(ticket.paymentMethod)}`}>
                  {ticket.paymentMethod?.charAt(0).toUpperCase() + ticket.paymentMethod?.slice(1) || 'Unknown'}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Ticket Information */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="text-2xl mr-2">🎫</span>
                  Ticket Information
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <label className="text-sm font-medium text-gray-500">Ticket ID</label>
                    <p className="text-lg font-semibold text-gray-900">{ticket.ticketId}</p>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <label className="text-sm font-medium text-gray-500">Payment Method</label>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(ticket.paymentMethod)}`}>
                      {ticket.paymentMethod?.charAt(0).toUpperCase() + ticket.paymentMethod?.slice(1) || 'Unknown'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <label className="text-sm font-medium text-gray-500">Fare Paid</label>
                    <p className="text-lg font-semibold text-green-600">Rs. {ticket.farePaid.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <label className="text-sm font-medium text-gray-500">Amount Paid</label>
                    <p className="text-lg font-semibold text-blue-600">Rs. {ticket.paidAmount.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <label className="text-sm font-medium text-gray-500">Balance</label>
                    <p className="text-lg font-semibold text-orange-600">Rs. {ticket.balance.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <label className="text-sm font-medium text-gray-500">Trip Number</label>
                    <p className="text-lg font-semibold text-gray-900">{ticket.tripNumber}</p>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <label className="text-sm font-medium text-gray-500">Date & Time</label>
                    <p className="text-gray-900">{formatDate(ticket.dateTime)}</p>
                  </div>
                </div>
              </div>

              {/* Right Column - Journey & Bus Information */}
              <div className="bg-blue-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="text-2xl mr-2">🚌</span>
                  Journey Information
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <label className="text-sm font-medium text-gray-500">Route</label>
                    <p className="text-gray-900 font-medium">{route?.name || 'Loading...'}</p>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <label className="text-sm font-medium text-gray-500">Bus Number</label>
                    <p className="text-gray-900 font-medium">{bus?.busNumber || 'Loading...'}</p>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <label className="text-sm font-medium text-gray-500">From Stop</label>
                    <div className="text-right">
                      <p className="text-gray-900 font-medium">{ticket.fromStop.stopName}</p>
                      <p className="text-sm text-gray-500">Section {ticket.fromStop.sectionNumber}</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-start">
                    <label className="text-sm font-medium text-gray-500">To Stop</label>
                    <div className="text-right">
                      <p className="text-gray-900 font-medium">{ticket.toStop.stopName}</p>
                      <p className="text-sm text-gray-500">Section {ticket.toStop.sectionNumber}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-start">
                    <label className="text-sm font-medium text-gray-500">Total Passengers</label>
                    <p className="text-gray-900 font-medium">{ticket.totalPassengers}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Passengers Details */}
            {ticket.passengers && ticket.passengers.length > 0 && (
              <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="text-xl mr-2">👥</span>
                  Passenger Details
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fare Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fare per Unit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {ticket.passengers.map((passenger, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            <span className="capitalize">{passenger.fareType}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {passenger.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            Rs. {passenger.farePerUnit.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            Rs. {passenger.subtotal.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Created on {formatDate(ticket.createdAt)} • Last updated {formatDate(ticket.updatedAt)}
                </div>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
                    </svg>
                    <span>Print Ticket</span>
                  </Button>
                  <Button
                    onClick={confirmDeleteTicket}
                    variant="outline"
                    className="text-red-600 border-red-300 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <span>Delete Ticket</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
