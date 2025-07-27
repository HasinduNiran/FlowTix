'use client';

import { useState, useEffect } from 'react';
import { BusService, Bus } from '@/services/bus.service';
import DataTable from '@/components/dashboard/DataTable';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import React from 'react';

interface TableColumn {
  header: string;
  accessor: string;
  cell?: (value: any, row?: Bus) => React.ReactNode;
  className?: string;
}

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const router = useRouter();
  const { user } = useAuth();

  const busCategories = [
    { key: 'all', label: 'All Buses', icon: '🚌', color: 'blue' },
    { key: 'normal', label: 'Normal', icon: '🚎', color: 'green' },
    { key: 'luxury', label: 'Luxury', icon: '🚐', color: 'purple' },
    { key: 'semi_luxury', label: 'Semi Luxury', icon: '🚍', color: 'orange' },
    { key: 'high_luxury', label: 'High Luxury', icon: '🚌', color: 'red' },
    { key: 'sisu_sariya', label: 'Sisu Sariya', icon: '🚛', color: 'indigo' },
  ];

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const data = await BusService.getAllBuses();
      setBuses(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch buses. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter buses based on selected category
  const filteredBuses = activeCategory === 'all' 
    ? buses 
    : buses.filter(bus => bus.category === activeCategory);

  const getCategoryCount = (category: string) => {
    if (category === 'all') return buses.length;
    return buses.filter(bus => bus.category === category).length;
  };

  const handleViewDetails = (bus: Bus) => {
    router.push(`/super-admin/buses/${bus._id}`);
  };

  const openAddModal = () => {
    router.push('/super-admin/buses/create');
  };

  const columns: TableColumn[] = [
    { 
      header: 'Bus Number', 
      accessor: 'busNumber',
      className: 'font-semibold text-gray-900'
    },
    { 
      header: 'Bus Name', 
      accessor: 'busName',
      className: 'text-gray-800'
    },
    {
      header: 'Category',
      accessor: 'category',
      cell: (value: string) => {
        const category = busCategories.find(c => c.key === value);
        if (!category) return value;
        
        const colorClasses = {
          blue: 'bg-blue-100 text-blue-800 border border-blue-200',
          green: 'bg-green-100 text-green-800 border border-green-200',
          purple: 'bg-purple-100 text-purple-800 border border-purple-200',
          orange: 'bg-orange-100 text-orange-800 border border-orange-200',
          red: 'bg-red-100 text-red-800 border border-red-200',
          indigo: 'bg-indigo-100 text-indigo-800 border border-indigo-200'
        };
        
        return (
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            colorClasses[category.color as keyof typeof colorClasses]
          }`}>
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </span>
        );
      }
    },
    { 
      header: 'Status', 
      accessor: 'status',
      cell: (value: string) => (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
          value === 'active' 
            ? 'bg-green-100 text-green-800 border border-green-200' 
            : 'bg-red-100 text-red-800 border border-red-200'
        }`}>
          <div className={`w-2 h-2 rounded-full mr-2 ${
            value === 'active' ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          {value.charAt(0).toUpperCase() + value.slice(1)}
        </span>
      )
    },
    { 
      header: 'Telephone', 
      accessor: 'telephoneNumber',
      cell: (value: string) => (
        <div className="flex items-center text-gray-700">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {value}
        </div>
      )
    },
    { 
      header: 'Actions',
      accessor: '_id',
      cell: (id: string, row?: Bus) => {
        if (!row) return null;
        return (
          <div className="flex justify-center">
            <button 
              onClick={() => handleViewDetails(row)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 p-2 rounded-xl border border-blue-200 transition-all duration-200 hover:shadow-md"
              title="View Details"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        );
      }
    }
  ];

  // Card View Component
  const BusCard = ({ bus }: { bus: Bus }) => {
    const category = busCategories.find(c => c.key === bus.category);
    
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      purple: 'from-purple-500 to-purple-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600',
      indigo: 'from-indigo-500 to-indigo-600'
    };

    const statusColorClasses = {
      active: 'bg-green-100 text-green-800 border-green-200',
      inactive: 'bg-red-100 text-red-800 border-red-200'
    };

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        {/* Card Header with Gradient */}
        <div className={`bg-gradient-to-r ${category ? colorClasses[category.color as keyof typeof colorClasses] : 'from-gray-500 to-gray-600'} p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">{category?.icon || '🚌'}</span>
              <div>
                <h3 className="text-xl font-bold">{bus.busNumber}</h3>
                <p className="text-white/80 text-sm">{bus.busName}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              bus.status === 'active' 
                ? 'bg-white/20 text-white border-white/30' 
                : 'bg-red-100 text-red-800 border-red-200'
            }`}>
              <div className={`inline-block w-2 h-2 rounded-full mr-2 ${
                bus.status === 'active' ? 'bg-white' : 'bg-red-500'
              }`}></div>
              {bus.status.charAt(0).toUpperCase() + bus.status.slice(1)}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-6">
          <div className="space-y-4">
            {/* Category Badge */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Category</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                category ? (() => {
                  const categoryColorClasses = {
                    blue: 'bg-blue-100 text-blue-800 border border-blue-200',
                    green: 'bg-green-100 text-green-800 border border-green-200',
                    purple: 'bg-purple-100 text-purple-800 border border-purple-200',
                    orange: 'bg-orange-100 text-orange-800 border border-orange-200',
                    red: 'bg-red-100 text-red-800 border border-red-200',
                    indigo: 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  };
                  return categoryColorClasses[category.color as keyof typeof categoryColorClasses];
                })() : 'bg-gray-100 text-gray-800 border border-gray-200'
              }`}>
                <span className="mr-2">{category?.icon}</span>
                {category?.label || bus.category}
              </span>
            </div>

            {/* Phone Number */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Contact</span>
              <div className="flex items-center text-gray-700">
                <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="font-medium">{bus.telephoneNumber}</span>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-gray-200">
              <button 
                onClick={() => handleViewDetails(bus)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buses</h1>
          <p className="text-gray-600 mt-2">Manage all buses in the system</p>
        </div>
        <Button
          onClick={openAddModal}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Bus
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center">
          <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Category Tabs */}
      <div className="mb-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {busCategories.map((category) => {
              const isActive = activeCategory === category.key;
              const count = getCategoryCount(category.key);
              const colorClasses = {
                blue: {
                  active: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-200',
                  inactive: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                },
                green: {
                  active: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-200',
                  inactive: 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                },
                purple: {
                  active: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-200',
                  inactive: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                },
                orange: {
                  active: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200',
                  inactive: 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200'
                },
                red: {
                  active: 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-200',
                  inactive: 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                },
                indigo: {
                  active: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-200',
                  inactive: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                }
              };
              
              const currentColor = colorClasses[category.color as keyof typeof colorClasses];
              
              return (
                <button
                  key={category.key}
                  onClick={() => setActiveCategory(category.key)}
                  className={`
                    relative p-4 rounded-xl font-medium text-sm transition-all duration-300 transform hover:scale-105 
                    ${isActive ? currentColor.active : currentColor.inactive}
                    ${isActive ? 'ring-2 ring-opacity-50' : ''}
                  `}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-2xl">{category.icon}</span>
                      {count > 0 && (
                        <span className={`
                          inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold min-w-[20px] h-5
                          ${isActive 
                            ? 'bg-white/20 text-white' 
                            : 'bg-gray-100 text-gray-600'
                          }
                        `}>
                          {count}
                        </span>
                      )}
                    </div>
                    <span className="font-semibold leading-tight text-center">
                      {category.label}
                    </span>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse"></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Category Stats */}
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <span className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              Showing {filteredBuses.length} of {buses.length} buses
            </span>
            {activeCategory !== 'all' && (
              <span className="text-gray-400">
                • Filtered by {busCategories.find(c => c.key === activeCategory)?.label}
              </span>
            )}
          </div>
          
          {activeCategory !== 'all' && (
            <button
              onClick={() => setActiveCategory('all')}
              className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          {/* Buses Data Section Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Bus Fleet ({filteredBuses.length})
                </h3>
                
                {/* Enhanced View Toggle Buttons */}
                {filteredBuses.length > 0 && (
                  <div className="relative">
                    <div className="flex bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-1.5 shadow-sm">
                      <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 transform ${
                          viewMode === 'table'
                            ? 'bg-white text-blue-700 shadow-lg scale-105 border border-blue-200'
                            : 'text-blue-600 hover:text-blue-800 hover:bg-white/50'
                        }`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h10v2H7v-2z"/>
                        </svg>
                        Table View
                      </button>
                      <button
                        onClick={() => setViewMode('card')}
                        className={`flex items-center px-4 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 transform ${
                          viewMode === 'card'
                            ? 'bg-white text-blue-700 shadow-lg scale-105 border border-blue-200'
                            : 'text-blue-600 hover:text-blue-800 hover:bg-white/50'
                        }`}
                      >
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h8v8h-8v-8zm2 2v4h4v-4h-4z"/>
                        </svg>
                        Card View
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {viewMode === 'table' ? (
            <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
              <DataTable 
                data={filteredBuses} 
                columns={columns} 
                keyExtractor={(item) => item._id}
                emptyMessage={
                  activeCategory === 'all' 
                    ? "No buses found" 
                    : `No ${busCategories.find(c => c.key === activeCategory)?.label.toLowerCase()} buses found`
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBuses.length > 0 ? (
                filteredBuses.map((bus) => (
                  <BusCard key={bus._id} bus={bus} />
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500">
                  <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 0v10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                  </svg>
                  <p className="text-lg font-medium">
                    {activeCategory === 'all' 
                      ? "No buses found" 
                      : `No ${busCategories.find(c => c.key === activeCategory)?.label.toLowerCase()} buses found`
                    }
                  </p>
                  <p className="text-sm mt-2">Start by adding a new bus to the system</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
