'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TicketService, Ticket } from '@/services/ticket.service';
import { RouteService } from '@/services/route.service';
import { BusService } from '@/services/bus.service';
import { StopService } from '@/services/stop.service';
import { DataTable } from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function TicketsPage() {
  const router = useRouter();
  const busSearchRef = useRef<HTMLDivElement>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [fromStopFilter, setFromStopFilter] = useState<string>('all');
  const [toStopFilter, setToStopFilter] = useState<string>('all');
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [busSearchTerm, setBusSearchTerm] = useState<string>('');
  const [showBusSuggestions, setShowBusSuggestions] = useState<boolean>(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [routeStops, setRouteStops] = useState<any[]>([]);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchRoutes();
    fetchBuses();
  }, []);

  // Fetch tickets when bus is selected
  useEffect(() => {
    if (selectedBus) {
      fetchTicketsByBus(selectedBus);
      fetchRouteStops(selectedBus);
    } else {
      setTickets([]);
      setRouteStops([]);
    }
  }, [selectedBus]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (busSearchRef.current && !busSearchRef.current.contains(event.target as Node)) {
        setShowBusSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await TicketService.getAllTickets();
      setTickets(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setError('Failed to load tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketsByBus = async (busId: string) => {
    setLoading(true);
    try {
      const data = await TicketService.getAllTickets();
      // Filter tickets by selected bus
      const busTickets = data.filter((ticket: Ticket) => ticket.busId === busId);
      setTickets(busTickets);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setError('Failed to load tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const routeData = await RouteService.getAllRoutes();
      setRoutes(routeData);
    } catch (err) {
      console.error('Error fetching routes:', err);
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

  const fetchStops = async () => {
    try {
      const stopData = await StopService.getAllStops();
      // This function is not needed anymore as we'll use fetchRouteStops
    } catch (err) {
      console.error('Error fetching stops:', err);
    }
  };

  const fetchRouteStops = async (busId: string) => {
    try {
      // Find the selected bus to get its route
      const selectedBusData = buses.find(bus => bus._id === busId);
      if (selectedBusData && selectedBusData.routeId) {
        // Get stops for the specific route
        const stopData = await StopService.getStopsByRoute(selectedBusData.routeId);
        setRouteStops(stopData);
      } else {
        setRouteStops([]);
      }
    } catch (err) {
      console.error('Error fetching route stops:', err);
      setRouteStops([]);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await TicketService.deleteTicket(ticketId);
        fetchTickets(); // Refresh the list
      } catch (err: any) {
        alert(err.message || 'Failed to delete ticket');
      }
    }
  };

  const handleViewDetails = (ticketId: string) => {
    router.push(`/super-admin/tickets/${ticketId}`);
  };

  const getRouteName = (routeId: string) => {
    const route = routes.find(route => route._id === routeId);
    return route?.name || 'Unknown Route';
  };

  const getBusNumber = (busId: string) => {
    const bus = buses.find(bus => bus._id === busId);
    return bus?.busNumber || 'Unknown Bus';
  };

  const getStopName = (stopId: string) => {
    const stop = routeStops.find((stop: any) => stop._id === stopId);
    return stop?.stopName || 'Unknown Stop';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + new Date(dateString).toLocaleTimeString();
  };

  const getPaymentMethodColor = (paymentMethod: string) => {
    switch (paymentMethod?.toLowerCase()) {
      case 'cash':
        return 'text-green-600 bg-green-50';
      case 'card':
        return 'text-blue-600 bg-blue-50';
      case 'online':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  // Filter tickets based on all filters
  const filteredTickets = tickets.filter(ticket => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      ticket.ticketId?.toLowerCase().includes(searchLower) ||
      ticket.fromStop?.stopName?.toLowerCase().includes(searchLower) ||
      ticket.toStop?.stopName?.toLowerCase().includes(searchLower) ||
      getRouteName(ticket.routeId).toLowerCase().includes(searchLower) ||
      getBusNumber(ticket.busId).toLowerCase().includes(searchLower);
    
    const matchesPaymentMethod = paymentMethodFilter === 'all' || ticket.paymentMethod === paymentMethodFilter;
    const matchesFromStop = fromStopFilter === 'all' || ticket.fromStop?.stopId === fromStopFilter;
    const matchesToStop = toStopFilter === 'all' || ticket.toStop?.stopId === toStopFilter;
    
    return matchesSearch && matchesPaymentMethod && matchesFromStop && matchesToStop;
  });

  // Get unique stops for dropdowns (from route stops only)
  const getUniqueStops = () => {
    const uniqueStopsMap = new Map();
    
    // Add stops from tickets for the selected bus
    tickets.forEach(ticket => {
      if (ticket.fromStop) {
        uniqueStopsMap.set(ticket.fromStop.stopId, {
          _id: ticket.fromStop.stopId,
          stopName: ticket.fromStop.stopName,
          sectionNumber: ticket.fromStop.sectionNumber
        });
      }
      if (ticket.toStop) {
        uniqueStopsMap.set(ticket.toStop.stopId, {
          _id: ticket.toStop.stopId,
          stopName: ticket.toStop.stopName,
          sectionNumber: ticket.toStop.sectionNumber
        });
      }
    });
    
    // Add stops from route stops data (for the selected bus's route)
    routeStops.forEach((stop: any) => {
      uniqueStopsMap.set(stop._id, stop);
    });
    
    return Array.from(uniqueStopsMap.values()).sort((a: any, b: any) => {
      // First sort by section number (ascending)
      if (a.sectionNumber !== b.sectionNumber) {
        return (a.sectionNumber || 0) - (b.sectionNumber || 0);
      }
      // Then sort by stop name if section numbers are equal
      return a.stopName.localeCompare(b.stopName);
    });
  };

  const uniqueStops = getUniqueStops();

  // Handle bus search and selection
  const handleBusSearch = (value: string) => {
    setBusSearchTerm(value);
    setShowBusSuggestions(value.length > 0);
    
    // If the value exactly matches a bus number, select it
    const exactMatch = buses.find(bus => bus.busNumber.toLowerCase() === value.toLowerCase());
    if (exactMatch && selectedBus !== exactMatch._id) {
      setSelectedBus(exactMatch._id);
    } else if (!exactMatch && selectedBus) {
      // Clear selection if no exact match and something was previously selected
      setSelectedBus('');
    }
  };

  const handleBusSelect = (bus: any) => {
    setSelectedBus(bus._id);
    setBusSearchTerm(bus.busNumber);
    setShowBusSuggestions(false);
    // Reset filters when bus changes
    setFromStopFilter('all');
    setToStopFilter('all');
    setSearchTerm('');
    setPaymentMethodFilter('all');
  };

  // Filter buses based on search term
  const getFilteredBuses = () => {
    if (!busSearchTerm) return [];
    return buses.filter(bus => 
      bus.busNumber.toLowerCase().includes(busSearchTerm.toLowerCase())
    ).slice(0, 5); // Limit to 5 suggestions
  };

  const filteredBuses = getFilteredBuses();

  // Table columns configuration
  const columns = [
    { header: 'Ticket ID', accessor: 'ticketId' as keyof Ticket },
    { 
      header: 'Route', 
      accessor: 'routeId' as keyof Ticket,
      cell: (value: any) => (
        <div className="text-sm font-medium">{getRouteName(value)}</div>
      )
    },
    { 
      header: 'Journey', 
      accessor: 'fromStop' as keyof Ticket,
      cell: (value: any, row?: Ticket) => (
        <div>
          <div className="text-sm">{value?.stopName} → {row?.toStop?.stopName}</div>
          <div className="text-xs text-gray-500">
            Section {value?.sectionNumber} → {row?.toStop?.sectionNumber}
          </div>
        </div>
      )
    },
    { 
      header: 'Bus', 
      accessor: 'busId' as keyof Ticket,
      cell: (value: any) => (
        <span className="text-sm font-medium">{getBusNumber(value)}</span>
      )
    },
    { 
      header: 'Passengers', 
      accessor: 'totalPassengers' as keyof Ticket,
      cell: (value: any) => (
        <span className="font-medium">{value || 0}</span>
      )
    },
    { 
      header: 'Fare', 
      accessor: 'farePaid' as keyof Ticket,
      cell: (value: any) => (
        <span className="font-medium text-green-600">Rs. {typeof value === 'number' ? value.toFixed(2) : '0.00'}</span>
      )
    },
    { 
      header: 'Payment Method', 
      accessor: 'paymentMethod' as keyof Ticket,
      cell: (value: any) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(value)}`}>
          {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'Unknown'}
        </span>
      )
    },
    { 
      header: 'Date & Time', 
      accessor: 'dateTime' as keyof Ticket,
      cell: (value: any) => (
        <div className="text-sm">
          <div>{formatDate(value)}</div>
          <div className="text-xs text-gray-500">{new Date(value).toLocaleTimeString()}</div>
        </div>
      )
    },
    {
      header: 'Actions',
      accessor: '_id' as keyof Ticket,
      cell: (id: any) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewDetails(id)}
            className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
            title="View Details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteTicket(id)}
            className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
            title="Delete Ticket"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Tickets Management
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage and view all bus tickets in the system
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-blue-50 px-4 py-2 rounded-full">
                  <span className="text-blue-600 font-semibold">Total:</span>
                  <span className="text-blue-800 font-bold">{filteredTickets.length}</span>
                </div>
                <Button 
                  onClick={() => selectedBus ? fetchTicketsByBus(selectedBus) : null}
                  variant="outline"
                  className="flex items-center space-x-2"
                  disabled={!selectedBus}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  <span>Refresh</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-gray-50 border-b border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div className="relative" ref={busSearchRef}>
                <label htmlFor="busSearch" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bus *
                </label>
                <div className="relative">
                  <Input
                    id="busSearch"
                    type="text"
                    value={busSearchTerm}
                    onChange={(e) => handleBusSearch(e.target.value)}
                    onFocus={() => setShowBusSuggestions(busSearchTerm.length > 0)}
                    placeholder="Type bus number..."
                    className="w-full"
                    autoComplete="off"
                  />
                  
                  {/* Bus Suggestions Dropdown */}
                  {showBusSuggestions && filteredBuses.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredBuses.map((bus) => (
                        <button
                          key={bus._id}
                          onClick={() => handleBusSelect(bus)}
                          className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-blue-900">{bus.busNumber}</span>
                            {bus.routeId && getRouteName(bus.routeId) !== 'Unknown Route' && (
                              <span className="text-sm text-gray-500">{getRouteName(bus.routeId)}</span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* No results message */}
                  {showBusSuggestions && busSearchTerm && filteredBuses.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
                      <div className="text-gray-500 text-sm">No buses found matching "{busSearchTerm}"</div>
                    </div>
                  )}
                  
                  {/* Selected bus indicator */}
                  {selectedBus && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  Search Tickets
                </label>
                <Input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ticket ID, route, bus..."
                  className="w-full"
                  disabled={!selectedBus}
                />
              </div>
              
              <div>
                <label htmlFor="fromStop" className="block text-sm font-medium text-gray-700 mb-2">
                  From Stop
                </label>
                <select
                  id="fromStop"
                  value={fromStopFilter}
                  onChange={(e) => setFromStopFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={!selectedBus}
                >
                  <option value="all">All From Stops</option>
                  {uniqueStops.map((stop) => (
                    <option key={`from-${stop._id}`} value={stop._id}>
                      {stop.stopName} (Section {stop.sectionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="toStop" className="block text-sm font-medium text-gray-700 mb-2">
                  To Stop
                </label>
                <select
                  id="toStop"
                  value={toStopFilter}
                  onChange={(e) => setToStopFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={!selectedBus}
                >
                  <option value="all">All To Stops</option>
                  {uniqueStops.map((stop) => (
                    <option key={`to-${stop._id}`} value={stop._id}>
                      {stop.stopName} (Section {stop.sectionNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={!selectedBus}
                >
                  <option value="all">All Methods</option>
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="online">Online</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setPaymentMethodFilter('all');
                    setFromStopFilter('all');
                    setToStopFilter('all');
                  }}
                  variant="outline"
                  className="w-full"
                  disabled={!selectedBus}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="p-6">
            {!selectedBus ? (
              <div className="text-center py-12">
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-6 py-4 rounded-lg inline-block">
                  <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Please select a bus to view its tickets</span>
                  </div>
                </div>
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg inline-block">
                  <strong className="font-bold">Error: </strong>
                  <span>{error}</span>
                  <div className="mt-4">
                    <Button onClick={() => fetchTicketsByBus(selectedBus)} variant="primary">
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={filteredTickets}
                emptyMessage={`No tickets found for the selected bus${fromStopFilter !== 'all' || toStopFilter !== 'all' || paymentMethodFilter !== 'all' || searchTerm ? ' matching your criteria' : ''}`}
                keyExtractor={(ticket) => ticket._id}
              />
            )}
          </div>

          {/* Filter Summary */}
          {(fromStopFilter !== 'all' || toStopFilter !== 'all' || paymentMethodFilter !== 'all' || searchTerm) && (
            <div className="bg-blue-50 border-t border-blue-200 p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-blue-700 font-medium">Active Filters:</span>
                {fromStopFilter !== 'all' && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    From: {uniqueStops.find(s => s._id === fromStopFilter)?.stopName}
                  </span>
                )}
                {toStopFilter !== 'all' && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    To: {uniqueStops.find(s => s._id === toStopFilter)?.stopName}
                  </span>
                )}
                {paymentMethodFilter !== 'all' && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Payment: {paymentMethodFilter.charAt(0).toUpperCase() + paymentMethodFilter.slice(1)}
                  </span>
                )}
                {searchTerm && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Search: "{searchTerm}"
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
