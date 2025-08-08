'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { TicketService, Ticket } from '@/services/ticket.service';
import { RouteService } from '@/services/route.service';
import { BusService } from '@/services/bus.service';
import { StopService } from '@/services/stop.service';
import { TripService } from '@/services/trip.service';
import { DataTable } from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';

export default function TicketsPage() {
  const router = useRouter();
  const busSearchRef = useRef<HTMLDivElement>(null);
  const routeSearchRef = useRef<HTMLDivElement>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [fromStopFilter, setFromStopFilter] = useState<string>('all');
  const [toStopFilter, setToStopFilter] = useState<string>('all');
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalTickets, setTotalTickets] = useState<number>(0);
  const itemsPerPage = 15;
  
  const [selectedBus, setSelectedBus] = useState<string>('');
  const [busSearchTerm, setBusSearchTerm] = useState<string>('');
  const [showBusSuggestions, setShowBusSuggestions] = useState<boolean>(false);
  const [selectedRoute, setSelectedRoute] = useState<string>('');
  const [routeSearchTerm, setRouteSearchTerm] = useState<string>('');
  const [showRouteSuggestions, setShowRouteSuggestions] = useState<boolean>(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [buses, setBuses] = useState<any[]>([]);
  const [routeStops, setRouteStops] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<string>(new Date().toISOString().split('T')[0]); // Default to today
  const [tripNumberFilter, setTripNumberFilter] = useState<string>('latest');
  const [availableTrips, setAvailableTrips] = useState<number[]>([]);
  const [toast, setToast] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info'
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    id: string | null;
    ticketNumber: string | null;
  }>({
    isOpen: false,
    id: null,
    ticketNumber: null
  });

  // Fetch initial data on component mount
  useEffect(() => {
    fetchRoutes();
    fetchBuses();
    fetchTicketsWithPagination(); // Load tickets on page load
  }, []);

  // Fetch tickets with pagination when page changes
  useEffect(() => {
    if (currentPage >= 1) {
      if (searchTerm) {
        fetchTicketsWithSearch();
      } else {
        fetchTicketsWithPagination();
      }
    }
  }, [currentPage]);

  // Handle search term changes - reset to page 1 when searching
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm !== '') {
        setCurrentPage(1);
        fetchTicketsWithSearch();
      } else if (searchTerm === '') {
        setCurrentPage(1);
        fetchTicketsWithPagination();
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  // Handle filter changes - reset to page 1 and refetch
  useEffect(() => {
    if (selectedBus || paymentMethodFilter !== 'all' || fromStopFilter !== 'all' || toStopFilter !== 'all' || dateFilter || tripNumberFilter !== 'latest') {
      setCurrentPage(1);
      if (searchTerm) {
        fetchTicketsWithSearch();
      } else {
        fetchTicketsWithPagination();
      }
    }
  }, [selectedBus, paymentMethodFilter, fromStopFilter, toStopFilter, dateFilter, tripNumberFilter]);

  // Legacy support - keep some of the old functionality for route stops
  useEffect(() => {
    if (selectedBus) {
      fetchRouteStops(selectedBus);
      fetchAvailableTrips(selectedBus);
    } else if (selectedRoute) {
      // If no bus selected but route is selected, fetch stops for that route
      fetchRouteStopsById(selectedRoute);
      setAvailableTrips([]);
    } else {
      // If neither bus nor route selected, fetch all stops for search functionality
      fetchAllRouteStops();
      setAvailableTrips([]);
    }
  }, [selectedBus, selectedRoute, dateFilter, tripNumberFilter]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (busSearchRef.current && !busSearchRef.current.contains(event.target as Node)) {
        setShowBusSuggestions(false);
      }
      if (routeSearchRef.current && !routeSearchRef.current.contains(event.target as Node)) {
        setShowRouteSuggestions(false);
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

  // New pagination functions
  const fetchTicketsWithPagination = async () => {
    setLoading(true);
    try {
      console.log(`Fetching tickets for page ${currentPage}`);
      const filters = buildFilters();
      const result = await TicketService.getTicketsWithPagination(currentPage, itemsPerPage, '', filters);
      
      setTickets(result.tickets);
      setTotalPages(result.totalPages);
      setTotalTickets(result.total);
      setError(null);
      console.log(`Fetched ${result.tickets.length} tickets, total pages: ${result.totalPages}`);
    } catch (err) {
      console.error('Failed to fetch tickets with pagination:', err);
      setError('Failed to load tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketsWithSearch = async () => {
    setLoading(true);
    try {
      console.log(`Searching tickets for "${searchTerm}" on page ${currentPage}`);
      const filters = buildFilters();
      const result = await TicketService.getTicketsWithPagination(currentPage, itemsPerPage, searchTerm, filters);
      
      setTickets(result.tickets);
      setTotalPages(result.totalPages);
      setTotalTickets(result.total);
      setError(null);
      
      if (!result.hasResults && searchTerm) {
        console.log(`No tickets found for search term: "${searchTerm}"`);
      }
    } catch (err) {
      console.error('Failed to search tickets:', err);
      setError('Error: Failed to load tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const buildFilters = () => {
    const filters: any = {};
    
    if (selectedBus) {
      filters.busId = selectedBus;
    }
    
    if (paymentMethodFilter !== 'all') {
      filters.paymentMethod = paymentMethodFilter;
    }
    
    if (dateFilter) {
      filters.startDate = dateFilter;
      filters.endDate = dateFilter;
    }
    
    if (tripNumberFilter !== 'latest' && tripNumberFilter !== 'all') {
      filters.tripNumber = parseInt(tripNumberFilter);
    }
    
    return filters;
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
      console.log('Routes fetched:', routeData); // Debug log
      setRoutes(routeData);
    } catch (err) {
      console.error('Error fetching routes:', err);
    }
  };

  const fetchBuses = async () => {
    try {
      const busData = await BusService.getAllBuses();
      console.log('Buses fetched:', busData); // Debug log
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
      console.log('Fetching route stops for bus:', busId);
      
      // First, get the bus data to find its route
      const busData = await BusService.getBusById(busId);
      console.log('Bus data fetched:', busData);
      
      if (busData && busData.routeId) {
        // Handle both populated route object and route ID string
        const routeId = typeof busData.routeId === 'string' ? busData.routeId : busData.routeId._id;
        console.log('Fetching stops for route:', routeId);
        
        // Get stops for the specific route
        const stopData = await StopService.getStopsByRoute(routeId);
        console.log('Route stops fetched:', stopData);
        setRouteStops(stopData);
      } else {
        console.log('Bus has no route assigned');
        setRouteStops([]);
      }
    } catch (err) {
      console.error('Error fetching route stops:', err);
      setRouteStops([]);
    }
  };

  const fetchRouteStopsById = async (routeId: string) => {
    try {
      console.log('Fetching stops for route ID:', routeId);
      const stopData = await StopService.getStopsByRoute(routeId);
      console.log('Route stops fetched:', stopData);
      setRouteStops(stopData);
    } catch (err) {
      console.error('Error fetching route stops by ID:', err);
      setRouteStops([]);
    }
  };

  const fetchAllRouteStops = async () => {
    try {
      console.log('Fetching all stops across all routes');
      const stopData = await StopService.getAllStops();
      console.log('All stops fetched:', stopData);
      setRouteStops(stopData);
    } catch (err) {
      console.error('Error fetching all stops:', err);
      setRouteStops([]);
    }
  };

  const fetchTicketsByBusAndFilters = async (busId: string) => {
    setLoading(true);
    try {
      const data = await TicketService.getAllTickets();
      
      // Filter tickets by selected bus, date, and trip number
      let filteredTickets = data.filter((ticket: Ticket) => ticket.busId === busId);
      
      // Filter by date
      if (dateFilter) {
        const filterDate = new Date(dateFilter).toDateString();
        filteredTickets = filteredTickets.filter((ticket: Ticket) => {
          const ticketDate = new Date(ticket.dateTime).toDateString();
          return ticketDate === filterDate;
        });
      }
      
      // Filter by trip number
      if (tripNumberFilter !== 'all') {
        if (tripNumberFilter === 'latest') {
          // Get the latest (highest) trip number from filtered tickets
          const latestTripNumber = Math.max(...filteredTickets.map(t => t.tripNumber));
          if (latestTripNumber !== -Infinity) {
            filteredTickets = filteredTickets.filter((ticket: Ticket) => ticket.tripNumber === latestTripNumber);
          }
        } else {
          const tripNum = parseInt(tripNumberFilter);
          filteredTickets = filteredTickets.filter((ticket: Ticket) => ticket.tripNumber === tripNum);
        }
      }
      
      setTickets(filteredTickets);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
      setError('Failed to load tickets. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTrips = async (busId: string) => {
    try {
      const data = await TicketService.getAllTickets();
      
      // Filter tickets by selected bus and date
      let busTickets = data.filter((ticket: Ticket) => ticket.busId === busId);
      
      if (dateFilter) {
        const filterDate = new Date(dateFilter).toDateString();
        busTickets = busTickets.filter((ticket: Ticket) => {
          const ticketDate = new Date(ticket.dateTime).toDateString();
          return ticketDate === filterDate;
        });
      }
      
      // Get unique trip numbers and sort them
      const tripNumbers = [...new Set(busTickets.map(ticket => ticket.tripNumber))].sort((a, b) => b - a);
      setAvailableTrips(tripNumbers);
      
      // Auto-select the latest trip if 'latest' is selected and trips are available
      if (tripNumberFilter === 'latest' && tripNumbers.length > 0) {
        // The latest trip is already selected by the filtering logic
      }
    } catch (err) {
      console.error('Error fetching available trips:', err);
      setAvailableTrips([]);
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

  const confirmDelete = (ticketId: string) => {
    const ticket = tickets.find(ticket => ticket._id === ticketId);
    setDeleteConfirmation({
      isOpen: true,
      id: ticketId,
      ticketNumber: `#${ticket?._id?.substring(0, 8)}` || 'this ticket'
    });
  };

  const handleDeleteTicket = async (ticketId: string) => {
    try {
      await TicketService.deleteTicket(ticketId);
      // Refresh the current page
      if (searchTerm) {
        fetchTicketsWithSearch();
      } else {
        fetchTicketsWithPagination();
      }
      showToast('Success', 'Ticket has been deleted successfully', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to delete ticket', 'error');
    } finally {
      setDeleteConfirmation({
        isOpen: false,
        id: null,
        ticketNumber: null
      });
    }
  };

  const handleViewDetails = (ticketId: string) => {
    router.push(`/super-admin/tickets/${ticketId}`);
  };

  const getRouteName = (routeId: string | { _id: string; routeName: string; routeNumber: string }) => {
    if (typeof routeId === 'string') {
      const route = routes.find(route => route._id === routeId);
      return route?.name || route?.routeName || 'Unknown Route';
    }
    return routeId?.routeName || 'Unknown Route';
  };

  const getBusNumber = (busId: string | { _id: string; busNumber: string; busName: string }) => {
    if (typeof busId === 'string') {
      const bus = buses.find(bus => bus._id === busId);
      return bus?.busNumber || 'Unknown Bus';
    }
    return busId?.busNumber || 'Unknown Bus';
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

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Get unique stops for dropdowns (prioritize route stops, fallback to ticket stops)
  const getUniqueStops = () => {
    const uniqueStopsMap = new Map();
    
    // First, add all route stops data (preferred source as it's complete)
    console.log('Route stops for dropdown:', routeStops.length);
    routeStops.forEach((stop: any) => {
      uniqueStopsMap.set(stop._id, {
        _id: stop._id,
        stopName: stop.stopName,
        sectionNumber: stop.sectionNumber
      });
    });
    
    // Then add stops from tickets (only if not already added)
    // This ensures we have stops even if route stops failed to load
    tickets.forEach(ticket => {
      if (ticket.fromStop && !uniqueStopsMap.has(ticket.fromStop.stopId)) {
        uniqueStopsMap.set(ticket.fromStop.stopId, {
          _id: ticket.fromStop.stopId,
          stopName: ticket.fromStop.stopName,
          sectionNumber: ticket.fromStop.sectionNumber
        });
      }
      if (ticket.toStop && !uniqueStopsMap.has(ticket.toStop.stopId)) {
        uniqueStopsMap.set(ticket.toStop.stopId, {
          _id: ticket.toStop.stopId,
          stopName: ticket.toStop.stopName,
          sectionNumber: ticket.toStop.sectionNumber
        });
      }
    });
    
    const stops = Array.from(uniqueStopsMap.values()).sort((a: any, b: any) => {
      // First sort by section number (ascending)
      if (a.sectionNumber !== b.sectionNumber) {
        return (a.sectionNumber || 0) - (b.sectionNumber || 0);
      }
      // Then sort by stop name if section numbers are equal
      return a.stopName.localeCompare(b.stopName);
    });
    
    console.log('Unique stops for dropdown:', stops.length);
    return stops;
  };

  const uniqueStops = getUniqueStops();

  // Handle route search and selection
  const handleRouteSearch = (value: string) => {
    setRouteSearchTerm(value);
    setShowRouteSuggestions(value.length > 0);
    
    // If the value exactly matches a route name or number, select it
    const exactMatch = routes.find(route => 
      route.name?.toLowerCase() === value.toLowerCase() ||
      route.routeName?.toLowerCase() === value.toLowerCase() ||
      route.routeNumber?.toLowerCase() === value.toLowerCase() ||
      route.code?.toLowerCase() === value.toLowerCase()
    );
    if (exactMatch && selectedRoute !== exactMatch._id) {
      setSelectedRoute(exactMatch._id);
    } else if (!exactMatch && selectedRoute) {
      // Clear selection if no exact match and something was previously selected
      setSelectedRoute('');
    }
  };

  const handleRouteSelect = (route: any) => {
    setSelectedRoute(route._id);
    const routeName = route.name || route.routeName || 'Unknown Route';
    const routeNumber = route.routeNumber || route.code || '';
    setRouteSearchTerm(`${routeName}${routeNumber ? ` (${routeNumber})` : ''}`);
    setShowRouteSuggestions(false);
    // Reset bus and other filters when route changes
    setSelectedBus('');
    setBusSearchTerm('');
    setFromStopFilter('all');
    setToStopFilter('all');
    setSearchTerm('');
    setPaymentMethodFilter('all');
    setTripNumberFilter('latest');
  };

  // Filter routes based on search term
  const getFilteredRoutes = () => {
    if (!routeSearchTerm) return [];
    return routes.filter(route => {
      const routeName = route.name || route.routeName || '';
      const routeNumber = route.routeNumber || route.code || '';
      return routeName.toLowerCase().includes(routeSearchTerm.toLowerCase()) ||
             routeNumber.toLowerCase().includes(routeSearchTerm.toLowerCase());
    }).slice(0, 5); // Limit to 5 suggestions
  };

  const filteredRoutes = getFilteredRoutes();

  // Handle bus search and selection
  const handleBusSearch = (value: string) => {
    setBusSearchTerm(value);
    setShowBusSuggestions(value.length > 0);
    
    // Get available buses based on route selection
    const availableBuses = getAvailableBuses();
    
    // If the value exactly matches a bus number, select it
    const exactMatch = availableBuses.find(bus => bus.busNumber.toLowerCase() === value.toLowerCase());
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
    setTripNumberFilter('latest');
  };

  // Get available buses based on route selection
  const getAvailableBuses = () => {
    if (selectedRoute) {
      console.log('Filtering buses for route:', selectedRoute); // Debug log
      const filtered = buses.filter(bus => {
        // Handle both string and object routeId
        const busRouteId = typeof bus.routeId === 'string' ? bus.routeId : bus.routeId?._id;
        console.log('Bus:', bus.busNumber, 'RouteId:', busRouteId, 'Selected:', selectedRoute); // Debug log
        return busRouteId === selectedRoute;
      });
      console.log('Filtered buses:', filtered); // Debug log
      return filtered;
    }
    return buses; // Show all buses if no route selected
  };

  // Filter buses based on search term and route selection
  const getFilteredBuses = () => {
    if (!busSearchTerm) return [];
    const availableBuses = getAvailableBuses();
    return availableBuses.filter(bus => 
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
            onClick={() => confirmDelete(id)}
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
                  <span className="text-blue-800 font-bold">{totalTickets}</span>
                </div>
                <Button 
                  onClick={() => {
                    if (searchTerm) {
                      fetchTicketsWithSearch();
                    } else {
                      fetchTicketsWithPagination();
                    }
                  }}
                  variant="outline"
                  className="flex items-center space-x-2"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-3">
              <div className="relative" ref={routeSearchRef}>
                <label htmlFor="routeSearch" className="block text-xs font-medium text-gray-700 mb-1">
                  Route (Optional)
                </label>
                <div className="relative">
                  <Input
                    id="routeSearch"
                    type="text"
                    value={routeSearchTerm}
                    onChange={(e) => handleRouteSearch(e.target.value)}
                    onFocus={() => setShowRouteSuggestions(routeSearchTerm.length > 0)}
                    placeholder="Type route name or number..."
                    className="w-full text-sm px-2 py-1.5"
                    autoComplete="off"
                  />
                  
                  {/* Route Suggestions Dropdown */}
                  {showRouteSuggestions && filteredRoutes.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {filteredRoutes.map((route) => {
                        const routeName = route.name || route.routeName || 'Unknown Route';
                        const routeNumber = route.routeNumber || route.code || '';
                        return (
                          <button
                            key={route._id}
                            onClick={() => handleRouteSelect(route)}
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-blue-900">
                                {routeName}
                              </span>
                              {routeNumber && (
                                <span className="text-sm text-gray-500">({routeNumber})</span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* No results message */}
                  {showRouteSuggestions && routeSearchTerm && filteredRoutes.length === 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg p-3">
                      <div className="text-gray-500 text-sm">No routes found matching "{routeSearchTerm}"</div>
                    </div>
                  )}
                  
                  {/* Selected route indicator */}
                  {selectedRoute && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Clear route button */}
                  {selectedRoute && (
                    <button
                      onClick={() => {
                        setSelectedRoute('');
                        setRouteSearchTerm('');
                        setSelectedBus('');
                        setBusSearchTerm('');
                        setFromStopFilter('all');
                        setToStopFilter('all');
                        setSearchTerm('');
                        setPaymentMethodFilter('all');
                        setTripNumberFilter('latest');
                        setDateFilter(new Date().toISOString().split('T')[0]);
                      }}
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="relative" ref={busSearchRef}>
                <label htmlFor="busSearch" className="block text-xs font-medium text-gray-700 mb-1">
                  Bus *
                </label>
                <div className="relative">
                  <Input
                    id="busSearch"
                    type="text"
                    value={busSearchTerm}
                    onChange={(e) => handleBusSearch(e.target.value)}
                    onFocus={() => setShowBusSuggestions(busSearchTerm.length > 0)}
                    placeholder="Type bus number..."
                    className="w-full text-sm px-2 py-1.5"
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
                      <div className="text-gray-500 text-sm">
                        {selectedRoute 
                          ? `No buses found for selected route matching "${busSearchTerm}"` 
                          : `No buses found matching "${busSearchTerm}"`
                        }
                      </div>
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
                {selectedRoute && (
                  <div className="text-xs text-blue-600 mt-1">
                    Showing buses for: {getRouteName(selectedRoute)}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="dateFilter" className="block text-xs font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <Input
                  id="dateFilter"
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full text-sm px-2 py-1.5"
                />
              </div>

              <div>
                <label htmlFor="tripNumber" className="block text-xs font-medium text-gray-700 mb-1">
                  Trip
                </label>
                <select
                  id="tripNumber"
                  value={tripNumberFilter}
                  onChange={(e) => setTripNumberFilter(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  disabled={!selectedBus}
                >
                  <option value="latest">Latest Trip</option>
                  <option value="all">All Trips</option>
                  {availableTrips.map((tripNum) => (
                    <option key={tripNum} value={tripNum.toString()}>
                      Trip {tripNum}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="search" className="block text-xs font-medium text-gray-700 mb-1">
                  Search
                </label>
                <Input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by ticket ID, route, bus..."
                  className="w-full text-sm px-2 py-1.5"
                />
              </div>
              
              <div>
                <label htmlFor="fromStop" className="block text-xs font-medium text-gray-700 mb-1">
                  From
                </label>
                <select
                  id="fromStop"
                  value={fromStopFilter}
                  onChange={(e) => setFromStopFilter(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                <label htmlFor="toStop" className="block text-xs font-medium text-gray-700 mb-1">
                  To
                </label>
                <select
                  id="toStop"
                  value={toStopFilter}
                  onChange={(e) => setToStopFilter(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                <label htmlFor="paymentMethod" className="block text-xs font-medium text-gray-700 mb-1">
                  Payment
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
                    setTripNumberFilter('latest');
                    setCurrentPage(1);
                    // Don't reset date as it should stay as today by default
                  }}
                  variant="outline"
                  className="w-full flex items-center justify-center space-x-1 text-sm px-2 py-1.5 h-[34px]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>Clear</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Data Table */}
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg inline-block">
                  <strong className="font-bold">Error: </strong>
                  <span>{error}</span>
                  <div className="mt-4">
                    <Button onClick={() => {
                      if (searchTerm) {
                        fetchTicketsWithSearch();
                      } else {
                        fetchTicketsWithPagination();
                      }
                    }} variant="primary">
                      Retry
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <DataTable
                    columns={columns}
                    data={tickets}
                    emptyMessage={searchTerm ? `No tickets found matching "${searchTerm}". Try a different search term.` : "No tickets found for the selected criteria."}
                    keyExtractor={(ticket) => ticket._id}
                  />
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="text-sm text-gray-600">
                      <span>
                        Showing page {currentPage} of {totalPages} • Total: {totalTickets} tickets
                        {searchTerm && ` matching "${searchTerm}"`}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Previous Button */}
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          currentPage === 1
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                        }`}
                      >
                        Previous
                      </button>
                      
                      {/* Page Numbers */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-2 rounded-lg font-medium transition-all ${
                                pageNum === currentPage
                                  ? 'bg-blue-600 text-white shadow-lg'
                                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      {/* Next Button */}
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          currentPage === totalPages
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 shadow-sm'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Filter Summary */}
          {(selectedRoute || fromStopFilter !== 'all' || toStopFilter !== 'all' || paymentMethodFilter !== 'all' || searchTerm) && (
            <div className="bg-blue-50 border-t border-blue-200 p-4">
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="text-blue-700 font-medium">Active Filters:</span>
                {selectedRoute && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    Route: {getRouteName(selectedRoute)}
                  </span>
                )}
                {selectedBus && (
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                    Bus: {getBusNumber(selectedBus)}
                  </span>
                )}
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
      
      {/* Toast Notification */}
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
              Are you sure you want to delete ticket <span className="font-semibold">{deleteConfirmation.ticketNumber}</span>? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmation({ isOpen: false, id: null, ticketNumber: null })}
                className="px-4 py-2 border-gray-300 text-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={() => deleteConfirmation.id && handleDeleteTicket(deleteConfirmation.id)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
