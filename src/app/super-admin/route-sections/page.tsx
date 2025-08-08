'use client';

import { useState, useEffect } from 'react';
import { RouteSectionService, type RouteSection } from '@/services/routeSection.service';
import { RouteService, type Route } from '@/services/route.service';
import { StopService, type Stop } from '@/services/stop.service';
import { Toast } from '@/components/ui/Toast';

  // RouteSectionsManager component
function RouteSectionsManager() {
  const [routeSections, setRouteSections] = useState<RouteSection[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [filteredStops, setFilteredStops] = useState<Stop[]>([]);
  const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
  const [routeSearchTerm, setRouteSearchTerm] = useState('');
  const [isRouteDropdownOpen, setIsRouteDropdownOpen] = useState(false);
  const [formRouteSearchTerm, setFormRouteSearchTerm] = useState('');
  const [isFormRouteDropdownOpen, setIsFormRouteDropdownOpen] = useState(false);
  const [generateRouteSearchTerm, setGenerateRouteSearchTerm] = useState('');
  const [isGenerateRouteDropdownOpen, setIsGenerateRouteDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRouteSection, setSelectedRouteSection] = useState<RouteSection | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRoute, setFilterRoute] = useState('');
  const [sortBy, setSortBy] = useState<'route' | 'order' | 'fare' | 'createdAt'>('order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateFormData, setGenerateFormData] = useState({
    routeId: '',
    category: 'normal',
    fareMultiplier: 1.0,
    overwriteExisting: false
  });  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15, // Changed to 15 items per page as requested
    total: 0,
    totalPages: 0
  });

  // Toast state
  const [toast, setToast] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  // Form state
  const [formData, setFormData] = useState({
    routeId: '',
    stopId: '',
    category: '',
    fare: 0,
    order: 0,
    isActive: true
  });

  // Toast helper function
  const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setToast({
      isOpen: true,
      title,
      message,
      type
    });
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Helper function for route filtering
  const filterRoutesByTerm = (term: string) => {
    if (term === '') {
      return routes;
    } else {
      return routes.filter(route => 
        (route.routeName && route.routeName.toLowerCase().includes(term.toLowerCase())) ||
        (route.routeNumber && route.routeNumber.toLowerCase().includes(term.toLowerCase())) ||
        (route.code && route.code.toLowerCase().includes(term.toLowerCase())) ||
        (route.name && route.name.toLowerCase().includes(term.toLowerCase())) ||
        (route.startPoint && route.startPoint.toLowerCase().includes(term.toLowerCase())) ||
        (route.endPoint && route.endPoint.toLowerCase().includes(term.toLowerCase())) ||
        (route.startLocation && route.startLocation.toLowerCase().includes(term.toLowerCase())) ||
        (route.endLocation && route.endLocation.toLowerCase().includes(term.toLowerCase()))
      );
    }
  };
  
  // Filter routes based on search term for main dropdown
  useEffect(() => {
    setFilteredRoutes(filterRoutesByTerm(routeSearchTerm));
  }, [routeSearchTerm, routes]);
  
  // Filter routes based on search term for form dropdowns
  useEffect(() => {
    if (formRouteSearchTerm) {
      setFilteredRoutes(filterRoutesByTerm(formRouteSearchTerm));
    } else if (generateRouteSearchTerm) {
      setFilteredRoutes(filterRoutesByTerm(generateRouteSearchTerm));
    }
  }, [formRouteSearchTerm, generateRouteSearchTerm, routes]);

  // Debug logging
  useEffect(() => {
    console.log('Current filterRoute:', filterRoute);
    console.log('Total routeSections:', routeSections.length);
  }, [filterRoute, routeSections]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching initial data...');
      
      // Fetch routes, stops, and all route sections initially
      const [routesData, stopsData, routeSectionsData] = await Promise.all([
        RouteService.getAllRoutes(),
        StopService.getAllStops(),
        RouteSectionService.getAllRouteSections()
      ]);

      console.log('Fetched routes:', routesData);
      console.log('Fetched stops:', stopsData);
      console.log('Fetched route sections:', routeSectionsData);

      setRoutes(routesData);
      setFilteredRoutes(routesData); // Initialize filtered routes with all routes
      setStops(stopsData);
      setRouteSections(routeSectionsData); // Load all route sections initially
      setFilterRoute('all'); // Set default filter to show all routes
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setRoutes([]);
      setStops([]);
      setRouteSections([]);
      showToast('Error', 'Failed to load initial data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllRouteSections = async () => {
    try {
      setLoading(true);
      console.log('Fetching all route sections...');
      
      const routeSectionsData = await RouteSectionService.getAllRouteSections();
      console.log('All fetched route sections:', routeSectionsData);
      console.log('Total route sections count:', routeSectionsData.length);
      
      setRouteSections(routeSectionsData);
    } catch (error) {
      console.error('Error fetching all route sections:', error);
      setRouteSections([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRouteSections = async (routeId: string) => {
    try {
      setLoading(true);
      console.log('Fetching route sections for route:', routeId);
      
      const routeSectionsData = await RouteSectionService.getAllRouteSections();
      console.log('All fetched route sections:', routeSectionsData);
      console.log('Total route sections count:', routeSectionsData.length);
      
      // Always set all route sections - filtering will be handled by the filter logic
      setRouteSections(routeSectionsData);
    } catch (error) {
      console.error('Error fetching route sections:', error);
      setRouteSections([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stops by route for the modal
  const fetchStopsByRoute = async (routeId: string) => {
    try {
      console.log('Fetching stops for route:', routeId);
      const stopsData = await StopService.getStopsByRoute(routeId);
      console.log('Fetched stops for route:', stopsData);
      setFilteredStops(stopsData);
    } catch (error) {
      console.error('Error fetching stops by route:', error);
      setFilteredStops([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedRouteSection) {
        await RouteSectionService.updateRouteSection(selectedRouteSection._id, formData);
        showToast('Success', 'Route section updated successfully!', 'success');
      } else {
        await RouteSectionService.createRouteSection(formData);
        showToast('Success', 'Route section created successfully!', 'success');
      }
      
      // Refresh data based on current filter state
      if (filterRoute === 'all') {
        await fetchAllRouteSections();
      } else if (filterRoute && filterRoute !== '') {
        await fetchRouteSections(filterRoute);
      }
      // If filterRoute is empty, don't fetch anything - user must select a route
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast('Error', 'Error saving route section. Please try again.', 'error');
    }
  };

  const handleEdit = async (routeSection: RouteSection) => {
    setSelectedRouteSection(routeSection);
    setFormData({
      routeId: routeSection.routeId._id,
      stopId: routeSection.stopId._id,
      category: routeSection.category,
      fare: routeSection.fare,
      order: routeSection.order,
      isActive: routeSection.isActive
    });
    
    // Fetch stops for the selected route
    await fetchStopsByRoute(routeSection.routeId._id);
    
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this route section?')) {
      try {
        await RouteSectionService.deleteRouteSection(id);
        
        showToast('Success', 'Route section deleted successfully!', 'success');
        
        // Refresh data based on current filter state
        if (filterRoute === 'all') {
          await fetchAllRouteSections();
        } else if (filterRoute && filterRoute !== '') {
          await fetchRouteSections(filterRoute);
        }
        // If filterRoute is empty, don't fetch anything - user must select a route
      } catch (error) {
        console.error('Error deleting route section:', error);
        showToast('Error', 'Error deleting route section. Please try again.', 'error');
      }
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateFormData.routeId) {
      showToast('Validation Error', 'Please select a route to generate sections for.', 'warning');
      return;
    }

    try {
      setGenerating(true);
      console.log('Generating route sections for route:', generateFormData.routeId);
      
      // Use intelligent auto-generate with Section model pricing
      const result = await RouteSectionService.autoGenerateRouteSections(
        generateFormData.routeId, 
        generateFormData.category, 
        generateFormData.fareMultiplier,
        generateFormData.overwriteExisting
      );
      
      console.log('Intelligent generation result:', result);
      
      // Show detailed success message with workflow information
      const message = result.data.workflow ? 
        `🎯 Intelligent Route Sections Generated Successfully!\n\n` +
        `📋 Workflow Completed:\n` +
        `${result.data.workflow.step1}\n` +
        `${result.data.workflow.step2}\n` +
        `${result.data.workflow.step3}\n` +
        `${result.data.workflow.step4}\n` +
        `${result.data.workflow.step5}\n\n` +
        `📊 Generation Results:\n` +
        `✅ Created: ${result.data.stats.totalGenerated}\n` +
        `⏭️ Skipped: ${result.data.stats.totalSkipped}\n` +
        `❌ Errors: ${result.data.stats.totalErrors}\n\n` +
        `🔗 Section Mapping:\n` +
        `📍 Stops Processed: ${result.data.stats.stopsProcessed}\n` +
        `🎯 Sections Matched: ${result.data.stats.sectionsMatched}\n` +
        `� Unique Section Numbers: ${result.data.stats.uniqueSectionNumbers}\n\n` +
        `${generateFormData.fareMultiplier !== 1.0 ? `💰 Fare Multiplier Applied: ${generateFormData.fareMultiplier}x\n` : ''}` +
        `🔄 Processing Mode: ${generateFormData.overwriteExisting ? 'Overwrite Existing' : 'Skip Existing'}`
        :
        `Route sections generated successfully!\n` +
        `Generated: ${result.data.stats?.totalGenerated || result.data.generated?.length || 0}\n` +
        `Skipped: ${result.data.stats?.totalSkipped || result.data.skipped?.length || 0}\n` +
        `Errors: ${result.data.stats?.totalErrors || result.data.errors?.length || 0}`;
      
      showToast(
        'Generation Complete!', 
        message, 
        'success'
      );
      
      setShowGenerateModal(false);
      setGenerateFormData({ 
        routeId: '', 
        category: 'normal', 
        fareMultiplier: 1.0, 
        overwriteExisting: false 
      });
      
      // Refresh data based on current filter state
      if (filterRoute === 'all') {
        await fetchAllRouteSections();
      } else if (filterRoute && filterRoute !== '') {
        await fetchRouteSections(filterRoute);
      } else if (generateFormData.routeId) {
        // If no filter is set, set it to the generated route and fetch its sections
        setFilterRoute(generateFormData.routeId);
        await fetchRouteSections(generateFormData.routeId);
      }
      
    } catch (error) {
      console.error('Error generating route sections:', error);
      showToast('Generation Failed', 'Error generating route sections. Please try again.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      routeId: '',
      stopId: '',
      category: '',
      fare: 0,
      order: 0,
      isActive: true
    });
    setSelectedRouteSection(null);
    setFilteredStops([]); // Clear filtered stops when resetting form
    setFormRouteSearchTerm(''); // Clear form route search
    setIsFormRouteDropdownOpen(false);
    setGenerateRouteSearchTerm(''); // Clear generate route search
    setIsGenerateRouteDropdownOpen(false);
  };

  const filteredAndSortedRouteSections = routeSections
    .filter(rs => {
      const matchesSearch = searchTerm === '' || 
        (rs.stopId && rs.stopId.stopName ? rs.stopId.stopName.toLowerCase().includes(searchTerm.toLowerCase()) : false) ||
        (rs.category ? rs.category.toLowerCase().includes(searchTerm.toLowerCase()) : false);
      
      // If filterRoute is empty (Select a Route), show nothing
      // If filterRoute is 'all', show all route sections
      // Otherwise, filter by specific route ID
      const matchesRoute = filterRoute === '' ? false : 
                          filterRoute === 'all' ? true : 
                          (rs.routeId && rs.routeId._id ? rs.routeId._id === filterRoute : false);
      
      return matchesSearch && matchesRoute;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'route':
          aValue = a.routeId.routeName || '';
          bValue = b.routeId.routeName || '';
          break;
        case 'order':
          aValue = a.order;
          bValue = b.order;
          break;
        case 'fare':
          aValue = a.fare;
          bValue = b.fare;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Update pagination totals
  const totalFiltered = filteredAndSortedRouteSections.length;
  const effectiveLimit = pagination.limit === 9999 ? totalFiltered : pagination.limit;
  const totalPages = pagination.limit === 9999 ? 1 : Math.ceil(totalFiltered / pagination.limit);
  const startIndex = pagination.limit === 9999 ? 0 : (pagination.page - 1) * pagination.limit;
  const endIndex = pagination.limit === 9999 ? totalFiltered : startIndex + pagination.limit;
  const paginatedRouteSections = filteredAndSortedRouteSections.slice(startIndex, endIndex);

  // Update pagination state when filter changes
  useEffect(() => {
    const correctedTotalPages = pagination.limit === 9999 ? 1 : Math.ceil(totalFiltered / pagination.limit);
    setPagination(prev => ({
      ...prev,
      total: totalFiltered,
      totalPages: correctedTotalPages,
      page: Math.min(prev.page, Math.max(1, correctedTotalPages)) // Reset to page 1 if current page exceeds total pages
    }));
  }, [totalFiltered, pagination.limit]);

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleLimitChange = (newLimit: number) => {
    setPagination(prev => ({
      ...prev,
      limit: newLimit,
      page: 1 // Reset to first page when changing limit
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Route Sections Management</h1>
                <p className="text-gray-600 text-sm">
                  Manage route sections, assign stops to routes, and configure fare structures
                </p>
              </div>
              <div className="text-3xl text-gray-300">
                🚌
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">

              
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-grow lg:w-80">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search stops or categories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div className="relative flex-grow lg:w-80">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search routes..."
                      value={routeSearchTerm}
                      onChange={(e) => {
                        setRouteSearchTerm(e.target.value);
                        setIsRouteDropdownOpen(true);
                      }}
                      onFocus={() => setIsRouteDropdownOpen(true)}
                      onBlur={(e) => {
                        // Use a slight delay to allow click events to fire before closing dropdown
                        setTimeout(() => setIsRouteDropdownOpen(false), 200);
                      }}
                      className="pl-12 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                    
                    {isRouteDropdownOpen && (
                      <div className="absolute inset-x-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        <div 
                          className={`p-3 cursor-pointer hover:bg-blue-50 ${filterRoute === '' ? 'bg-blue-50' : ''}`}
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevents blur event from firing first
                            setFilterRoute('');
                            setRouteSearchTerm('');
                            setIsRouteDropdownOpen(false);
                            // Clear route sections
                            console.log('Clearing route sections - user must select a route');
                            setRouteSections([]);
                          }}
                        >
                          <span className="font-medium text-gray-700">Select a Route</span>
                        </div>
                        
                        <div 
                          className={`p-3 cursor-pointer hover:bg-blue-50 ${filterRoute === 'all' ? 'bg-blue-50' : ''}`}
                          onMouseDown={(e) => {
                            e.preventDefault(); // Prevents blur event from firing first
                            setFilterRoute('all');
                            setRouteSearchTerm('All Routes');
                            setIsRouteDropdownOpen(false);
                            // Fetch all route sections
                            console.log('Fetching all route sections');
                            fetchAllRouteSections();
                          }}
                        >
                          <span className="font-medium text-gray-700">All Routes</span>
                        </div>

                        <div className="border-t border-gray-200"></div>
                        
                        {filteredRoutes.map((route) => (
                          <div 
                            key={route._id}
                            className={`p-3 cursor-pointer hover:bg-blue-50 ${filterRoute === route._id ? 'bg-blue-50' : ''}`}
                            onMouseDown={(e) => {
                              e.preventDefault(); // Prevents blur event from firing first
                              setFilterRoute(route._id);
                              setRouteSearchTerm(`${route.routeNumber || route.code || ''} - ${route.routeName || route.name || ''}`);
                              setIsRouteDropdownOpen(false);
                              // Fetch sections for specific route
                              console.log('Fetching sections for specific route:', route._id);
                              fetchRouteSections(route._id);
                            }}
                          >
                            <div className="font-medium text-gray-800">
                              {route.routeNumber || route.code} - {route.routeName || route.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ({(route.startPoint || route.startLocation)} → {(route.endPoint || route.endLocation)})
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={async () => {
                    resetForm();
                    // If a specific route is selected (not 'all' or ''), pre-populate the route
                    if (filterRoute && filterRoute !== 'all' && filterRoute !== '') {
                      setFormData(prev => ({...prev, routeId: filterRoute}));
                      await fetchStopsByRoute(filterRoute);
                    }
                    setShowModal(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Route Section
                </button>

                <button
                  onClick={() => {
                    setGenerateFormData({ 
                      routeId: filterRoute && filterRoute !== 'all' ? filterRoute : '', 
                      category: 'normal', 
                      fareMultiplier: 1.0, 
                      overwriteExisting: false 
                    });
                    setShowGenerateModal(true);
                  }}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  Generate Sections
                </button>
              </div>
            </div>

            {/* Sort Controls - Only show when there are route sections */}
            {filteredAndSortedRouteSections.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-blue-800 font-medium text-lg">
                      Showing {pagination.limit === 9999 ? 'all' : Math.min(pagination.limit, totalFiltered)} of {totalFiltered} route {totalFiltered === 1 ? 'section' : 'sections'}
                      {filterRoute === 'all' ? (
                        <span className="text-blue-600 ml-1">
                          from all routes
                        </span>
                      ) : filterRoute && filterRoute !== '' ? (
                        <span className="text-blue-600 ml-1">
                          for selected route
                        </span>
                      ) : null}
                      {pagination.limit !== 9999 && (
                        <span className="text-blue-600 ml-1">
                          (Page {pagination.page} of {pagination.totalPages})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-blue-700 font-medium">Sort by:</span>
                    {['order', 'fare', 'createdAt'].map((field) => (
                      <button
                        key={field}
                        onClick={() => {
                          if (sortBy === field) {
                            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                          } else {
                            setSortBy(field as typeof sortBy);
                            setSortOrder('asc');
                          }
                        }}
                        className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                          sortBy === field
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-blue-600 hover:bg-blue-100 border border-blue-200'
                        }`}
                      >
                        {field === 'createdAt' ? 'Created' : field.charAt(0).toUpperCase() + field.slice(1)}
                        {sortBy === field && (
                          <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Route Sections Table */}
            {paginatedRouteSections.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Stop
                        </th>
                        {(filterRoute === '' || filterRoute === 'all') && (
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Route
                          </th>
                        )}
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Fare
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedRouteSections.map((routeSection) => (
                        <tr key={routeSection._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 font-bold text-sm">
                                  {routeSection.order}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {routeSection.stopId && routeSection.stopId.stopName ? routeSection.stopId.stopName : 'Unknown Stop'}
                              </div>
                              <div className="text-sm text-gray-500">
                                Section {routeSection.stopId && routeSection.stopId.sectionNumber ? routeSection.stopId.sectionNumber : 'N/A'}
                              </div>
                            </div>
                          </td>
                          {(filterRoute === '' || filterRoute === 'all') && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {routeSection.routeId && routeSection.routeId.routeName ? routeSection.routeId.routeName : 'Unknown Route'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {routeSection.routeId && routeSection.routeId.routeNumber ? routeSection.routeId.routeNumber : 'N/A'}
                              </div>
                            </td>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-3 py-1 text-xs font-medium bg-gray-100 text-gray-900 rounded-full">
                              {routeSection.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-blue-600">
                              Rs. {routeSection.fare.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              routeSection.isActive
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {routeSection.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleEdit(routeSection)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                title="Edit Route Section"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(routeSection._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete Route Section"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {paginatedRouteSections.length > 0 && pagination.totalPages > 1 && pagination.limit !== 9999 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                <div className="flex items-center justify-between">
                  {/* Results info */}
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-gray-700">
                      Showing {startIndex + 1} to {Math.min(endIndex, totalFiltered)} of {totalFiltered} results
                    </p>
                    
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-700">Show:</label>
                      <select
                        value={pagination.limit}
                        onChange={(e) => handleLimitChange(Number(e.target.value))}
                        className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={9999}>All</option>
                      </select>
                      <span className="text-sm text-gray-700">per page</span>
                    </div>
                  </div>

                  {/* Pagination buttons */}
                  <div className="flex items-center space-x-2">
                    {/* Previous button */}
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center space-x-1">
                      {/* First page */}
                      {pagination.page > 3 && (
                        <>
                          <button
                            onClick={() => handlePageChange(1)}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            1
                          </button>
                          {pagination.page > 4 && (
                            <span className="px-2 py-2 text-sm text-gray-500">...</span>
                          )}
                        </>
                      )}

                      {/* Current page and surrounding pages */}
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = Math.max(1, Math.min(pagination.totalPages - 4, pagination.page - 2)) + i;
                        if (page > pagination.totalPages) return null;
                        
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-md ${
                              page === pagination.page
                                ? 'bg-blue-600 text-white border border-blue-600'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      {/* Last page */}
                      {pagination.page < pagination.totalPages - 2 && (
                        <>
                          {pagination.page < pagination.totalPages - 3 && (
                            <span className="px-2 py-2 text-sm text-gray-500">...</span>
                          )}
                          <button
                            onClick={() => handlePageChange(pagination.totalPages)}
                            className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            {pagination.totalPages}
                          </button>
                        </>
                      )}
                    </div>

                    {/* Next button */}
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Items per page selector for "All" view */}
            {paginatedRouteSections.length > 0 && pagination.limit === 9999 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-700">
                    Showing all {totalFiltered} results
                  </p>
                  
                  {/* Items per page selector */}
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-700">Show:</label>
                    <select
                      value={pagination.limit}
                      onChange={(e) => handleLimitChange(Number(e.target.value))}
                      className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={15}>15</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                      <option value={9999}>All</option>
                    </select>
                    <span className="text-sm text-gray-700">per page</span>
                  </div>
                </div>
              </div>
            )}

            {totalFiltered === 0 && !loading && filterRoute !== '' && (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a3 3 0 0 0-3 3v6a2 2 0 0 0 2 2h1v1a1 1 0 0 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1h1a2 2 0 0 0 2-2v-6a3 3 0 0 0-3-3zM10 6h4v1h-4V6zm-4 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Route Sections Found</h3>
                  <p className="text-gray-600 mb-4">
                    {filterRoute === 'all' 
                      ? 'No route sections exist in the system yet.'
                      : 'This route has no sections yet. Create the first one to get started.'
                    }
                  </p>
                  <button
                    onClick={async () => {
                      resetForm();
                      if (filterRoute && filterRoute !== 'all') {
                        setFormData(prev => ({...prev, routeId: filterRoute}));
                        await fetchStopsByRoute(filterRoute);
                      }
                      setShowModal(true);
                    }}
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Add Route Section
                  </button>
                </div>
              </div>
            )}

            {/* Default state - no route selected */}
            {filterRoute === '' && !loading && (
              <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl border-2 border-dashed border-blue-300">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Select a Route</h3>
                  <p className="text-gray-600 mb-4">
                    Please select a route from the dropdown above to view its sections, or choose "All Routes" to see all route sections.
                  </p>
                </div>
              </div>
            )}

            {routeSections.length > 0 && totalFiltered === 0 && !loading && (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Matching Route Sections</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm
                      ? 'No route sections match your search criteria. Try adjusting your search.'
                      : filterRoute === 'all'
                      ? 'No route sections found in the system.'
                      : 'This route has no sections yet. Create the first one to get started.'}
                  </p>
                  {(!searchTerm || (filterRoute && filterRoute !== 'all')) && (
                    <button
                      onClick={async () => {
                        resetForm();
                        if (filterRoute && filterRoute !== 'all') {
                          setFormData(prev => ({...prev, routeId: filterRoute}));
                          await fetchStopsByRoute(filterRoute);
                        }
                        setShowModal(true);
                      }}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Route Section
                    </button>
                  )}
                </div>
              </div>
            )}

      {/* Add Route Section Modal */}
      {showModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowModal(false);
              resetForm();
            }
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all duration-300 ease-out scale-100 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {selectedRouteSection ? 'Edit Route Section' : 'Create New Route Section'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">Configure route section details</p>
              </div>
              <button 
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
              >
                <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Form Content */}
            <div className="p-6">
              <form id="routeSectionForm" onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Route
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search routes..."
                      value={formData.routeId ? routes.find(r => r._id === formData.routeId) ? 
                        `${routes.find(r => r._id === formData.routeId)?.routeNumber || routes.find(r => r._id === formData.routeId)?.code || ''} - ${routes.find(r => r._id === formData.routeId)?.routeName || routes.find(r => r._id === formData.routeId)?.name || ''}` 
                        : '' : formRouteSearchTerm}
                      onChange={(e) => {
                        const term = e.target.value;
                        // Just update the search text, don't change the selection yet
                        setFormRouteSearchTerm(term);
                        setIsFormRouteDropdownOpen(true);
                      }}
                      onFocus={() => setIsFormRouteDropdownOpen(true)}
                      onBlur={(e) => {
                        // Use a slight delay to allow click events to fire before closing dropdown
                        setTimeout(() => setIsFormRouteDropdownOpen(false), 200);
                      }}
                      className="pl-12 pr-4 py-3 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      required
                    />
                    
                    {isFormRouteDropdownOpen && (
                      <div className="absolute inset-x-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        <div className="p-3 text-sm text-gray-500 italic">
                          Select a route to continue
                        </div>
                        
                        <div className="border-t border-gray-200"></div>
                        
                        {filteredRoutes.map((route) => (
                          <div 
                            key={route._id}
                            className={`p-3 cursor-pointer hover:bg-blue-50 ${formData.routeId === route._id ? 'bg-blue-50' : ''}`}
                            onMouseDown={async (e) => {
                              e.preventDefault(); // Prevents blur event from firing first
                              setFormData({ ...formData, routeId: route._id, stopId: '' });
                              setFormRouteSearchTerm('');
                              setIsFormRouteDropdownOpen(false);
                              
                              // Fetch stops for the selected route
                              if (route._id) {
                                await fetchStopsByRoute(route._id);
                              } else {
                                setFilteredStops([]);
                              }
                            }}
                          >
                            <div className="font-medium text-gray-800">
                              {route.routeNumber || route.code} - {route.routeName || route.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ({(route.startPoint || route.startLocation)} → {(route.endPoint || route.endLocation)})
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Stop
                  </label>
                  <select
                    value={formData.stopId}
                    onChange={(e) => setFormData({ ...formData, stopId: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="">Select a stop</option>
                    {filteredStops.map((stop) => (
                      <option key={stop._id} value={stop._id}>
                        {stop.stopName} - Section {stop.sectionNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    placeholder="e.g., Regular, Express, VIP"
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fare (Rs.)
                    </label>
                    <input
                      type="number"
                      value={formData.fare}
                      onChange={(e) => setFormData({ ...formData, fare: Number(e.target.value) })}
                      required
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                      required
                      min="0"
                      placeholder="1"
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({...formData, isActive: e.target.value === 'true'})}
                  >
                    <option value="true">✅ Active</option>
                    <option value="false">❌ Inactive</option>
                  </select>
                </div>
              </form>
            </div>
            
            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="routeSectionForm"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                {selectedRouteSection ? 'Update Route Section' : 'Create Route Section'}
              </button>
            </div>
          </div>
        </div>
            )}

      {/* Generate Route Sections Modal */}
      {showGenerateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowGenerateModal(false);
              setGenerateFormData({ 
                routeId: '', 
                category: 'normal', 
                fareMultiplier: 1.0, 
                overwriteExisting: false 
              });
            }
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-out scale-100 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Auto Generate Route Sections</h2>
                <p className="text-sm text-gray-500 mt-1">Automatically create sections based on stops</p>
              </div>
              <button 
                onClick={() => {
                  setShowGenerateModal(false);
                  setGenerateFormData({ 
                    routeId: '', 
                    category: 'normal', 
                    fareMultiplier: 1.0, 
                    overwriteExisting: false 
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
              >
                <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Form Content */}
            <div className="p-6">
              <form id="generateForm" onSubmit={handleGenerate} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Route *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Search routes..."
                      value={generateFormData.routeId ? routes.find(r => r._id === generateFormData.routeId) ? 
                        `${routes.find(r => r._id === generateFormData.routeId)?.routeNumber || routes.find(r => r._id === generateFormData.routeId)?.code || ''} - ${routes.find(r => r._id === generateFormData.routeId)?.routeName || routes.find(r => r._id === generateFormData.routeId)?.name || ''}` 
                        : '' : generateRouteSearchTerm}
                      onChange={(e) => {
                        const term = e.target.value;
                        // Just update the search text, don't change the selection yet
                        setGenerateRouteSearchTerm(term);
                        setIsGenerateRouteDropdownOpen(true);
                      }}
                      onFocus={() => setIsGenerateRouteDropdownOpen(true)}
                      onBlur={(e) => {
                        // Use a slight delay to allow click events to fire before closing dropdown
                        setTimeout(() => setIsGenerateRouteDropdownOpen(false), 200);
                      }}
                      className="pl-12 pr-4 py-3 w-full rounded-lg border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      required
                    />
                    
                    {isGenerateRouteDropdownOpen && (
                      <div className="absolute inset-x-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        <div className="p-3 text-sm text-gray-500 italic">
                          Select a route to continue
                        </div>
                        
                        <div className="border-t border-gray-200"></div>
                        
                        {filteredRoutes.map((route) => (
                          <div 
                            key={route._id}
                            className={`p-3 cursor-pointer hover:bg-blue-50 ${generateFormData.routeId === route._id ? 'bg-blue-50' : ''}`}
                            onMouseDown={(e) => {
                              e.preventDefault(); // Prevents blur event from firing first
                              setGenerateFormData({ ...generateFormData, routeId: route._id });
                              setGenerateRouteSearchTerm('');
                              setIsGenerateRouteDropdownOpen(false);
                            }}
                          >
                            <div className="font-medium text-gray-800">
                              {route.routeNumber || route.code} - {route.routeName || route.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              ({(route.startPoint || route.startLocation)} → {(route.endPoint || route.endLocation)})
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={generateFormData.category}
                    onChange={(e) => setGenerateFormData({ ...generateFormData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                  >
                    <option value="normal">Normal</option>
                    <option value="luxury">Luxury</option>
                    <option value="semi_luxury">Semi Luxury</option>
                    <option value="high_luxury">High Luxury</option>
                    <option value="sisu_sariya">Sisu Sariya</option>
                    <option value="express">Express</option>
                  </select>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="text-blue-600 text-lg">🎯</span>
                    <h4 className="text-sm font-semibold text-blue-800">Intelligent Auto-Generation</h4>
                  </div>
                  <div className="text-xs text-blue-700 leading-relaxed space-y-2">
                    <p className="font-medium">How it works:</p>
                    <div className="pl-3 space-y-1">
                      <p>• <strong>Step 1:</strong> Select route and category</p>
                      <p>• <strong>Step 2:</strong> System fetches stops with section numbers</p>
                      <p>• <strong>Step 3:</strong> Matches Section model pricing by category</p>
                      <p>• <strong>Step 4:</strong> Automatically generates route sections</p>
                    </div>
                    <p className="mt-2 p-2 bg-white rounded border border-blue-200">
                      <span className="font-medium text-blue-800">💡 No manual fare input required!</span><br/>
                      Pricing comes directly from your Section model.
                    </p>
                  </div>
                </div>

                {/* Advanced Options - Always Available */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Fare Multiplier
                  </label>
                  <input
                    type="number"
                    value={generateFormData.fareMultiplier}
                        onChange={(e) => setGenerateFormData({ ...generateFormData, fareMultiplier: Number(e.target.value) })}
                        min="0.1"
                        max="10"
                        step="0.1"
                        placeholder="1.0"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Multiplier to adjust fares (1.0 = no change, 1.5 = 50% increase)
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={generateFormData.overwriteExisting}
                          onChange={(e) => setGenerateFormData({ ...generateFormData, overwriteExisting: e.target.checked })}
                          className="mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-semibold text-gray-700">Overwrite Existing</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-1">
                        Update existing route sections instead of skipping them
                      </p>
                    </div>
              </form>
            </div>
            
            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <button
                type="button"
                onClick={() => {
                  setShowGenerateModal(false);
                  setGenerateFormData({ 
                    routeId: '', 
                    category: 'normal', 
                    fareMultiplier: 1.0, 
                    overwriteExisting: false 
                  });
                  setGenerateRouteSearchTerm('');
                  setIsGenerateRouteDropdownOpen(false);
                }}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-lg font-medium transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="generateForm"
                disabled={generating}
                className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Generate Sections
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Notification */}
      {toast.isOpen && (
        <Toast
          isOpen={toast.isOpen}
          onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
          title={toast.title}
          message={toast.message}
          type={toast.type}
          duration={5000}
        />
      )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RouteSectionsPage() {
  return (
    <RouteSectionsManager />
  );
}
