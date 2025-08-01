'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SectionService, Section, SectionCategory } from '@/services/section.service';
import { DataTable } from '@/components/dashboard/DataTable';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SectionsPage() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalSections, setTotalSections] = useState<number>(0);
  const [sectionsByCategory, setSectionsByCategory] = useState<Record<string, number>>({});
  const itemsPerPage = 15;
  const [newSection, setNewSection] = useState({
    sectionNumber: 0,
    fare: 0,
    category: SectionCategory.NORMAL,
    description: '',
    isActive: true
  });

  // Fetch sections on component mount
  useEffect(() => {
    fetchSections(1);
  }, []);

  // Fetch sections when page changes
  useEffect(() => {
    if (currentPage >= 1) {
      fetchSections(currentPage);
    }
  }, [currentPage]);

  // Reset to page 1 when category changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchSections(1);
    }
  }, [selectedCategory]);

  const fetchSections = async (page: number = 1) => {
    setLoading(true);
    try {
      const [result, countsData] = await Promise.all([
        SectionService.getSectionsWithPagination(page, itemsPerPage),
        SectionService.getAllSectionsCount()
      ]);
      
      setSections(result.sections);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      setTotalSections(countsData.totalSections);
      setSectionsByCategory(countsData.sectionsByCategory);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch sections:', err);
      setError('Failed to load sections. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async () => {
    try {
      await SectionService.createSection(newSection);
      setShowAddModal(false);
      setNewSection({
        sectionNumber: 0,
        fare: 0,
        category: SectionCategory.NORMAL,
        description: '',
        isActive: true
      });
      fetchSections(currentPage);
    } catch (err) {
      console.error('Failed to add section:', err);
      setError('Failed to add section. Please try again.');
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await SectionService.deleteSection(id);
        fetchSections(currentPage);
      } catch (err) {
        console.error('Failed to delete section:', err);
        setError('Failed to delete section. Please try again.');
      }
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/super-admin/sections/${id}`);
  };

  // Filter sections by search term and category (client-side filtering)
  const filteredSections = sections.filter(section => {
    const matchesSearch = 
      section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.sectionNumber.toString().includes(searchTerm);
    
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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

  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Dynamic columns based on selected category
  const getColumns = () => {
    const baseColumns: any[] = [
      { header: 'Section Number', accessor: 'sectionNumber' },
      { 
        header: 'Fare', 
        accessor: 'fare',
        cell: (value: any) => `Rs. ${value.toFixed(2)}`
      },
    ];

    // Add category column only when viewing all sections
    if (selectedCategory === 'all') {
      baseColumns.push({
        header: 'Category',
        accessor: 'category',
        cell: (value: any) => (
          <span className="inline-flex px-3 py-1 text-xs font-medium bg-blue-100 text-blue-900 rounded-full capitalize">
            {formatCategory(value)}
          </span>
        )
      });
    }

    baseColumns.push(
      { header: 'Description', accessor: 'description' },
      { 
        header: 'Status', 
        accessor: 'isActive',
        cell: (value: any) => (
          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {value ? 'Active' : 'Inactive'}
          </span>
        )
      },
      {
        header: 'Actions',
        accessor: '_id',
        cell: (value: any) => (
          <div className="flex space-x-2">
            <button
              onClick={() => handleViewDetails(value)}
            className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
            title="View Details"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => handleDeleteSection(value)}
            className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
            title="Delete Section"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => handleViewDetails(value)}
            className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
            title="Edit Section"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
        </div>
        )
      }
    );

    return baseColumns;
  };

  // Get count of sections by category (total count, not just current page)
  const getSectionCountByCategory = (category: string) => {
    if (category === 'all') {
      return totalSections;
    }
    return sectionsByCategory[category] || 0;
  };

  // Categories for tabs
  const categoryTabs = [
    { 
      id: 'all', 
      label: 'ALL SECTIONS', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z"/>
        </svg>
      )
    },
    { 
      id: 'normal', 
      label: 'NORMAL', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
        </svg>
      )
    },
    { 
      id: 'semi_luxury', 
      label: 'SEMI-LUXURY', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
          <circle cx="9" cy="9" r="0.5"/>
          <circle cx="12" cy="9" r="0.5"/>
          <circle cx="15" cy="9" r="0.5"/>
        </svg>
      )
    },
    { 
      id: 'luxury', 
      label: 'LUXURY', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a3 3 0 0 0-3 3v6a2 2 0 0 0 2 2h1v1a1 1 0 0 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1h1a2 2 0 0 0 2-2v-6a3 3 0 0 0-3-3zM10 6h4v1h-4V6zm-4 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
          <rect x="9" y="8.5" width="6" height="1" rx="0.5"/>
          <rect x="8" y="10" width="8" height="0.5" rx="0.25"/>
        </svg>
      )
    },
    { 
      id: 'high_luxury', 
      label: 'SUPER LUXURY', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l1.5 3h3.5l-2.5 2.5L16 11l-4-2.5L8 11l1.5-3.5L7 5h3.5L12 2z"/>
          <path d="M19 9h-2V7a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H5a3 3 0 0 0-3 3v5a2 2 0 0 0 2 2h1v1a1 1 0 0 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1h1a2 2 0 0 0 2-2v-5a3 3 0 0 0-3-3zM9 7h6v2H9V7zm-3 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
        </svg>
      )
    },
    { 
      id: 'sisu_sariya', 
      label: 'SISU SARIYA', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 7h-3V6a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v1H5a3 3 0 0 0-3 3v6a2 2 0 0 0 2 2h1v1a1 1 0 0 0 2 0v-1h10v1a1 1 0 0 0 2 0v-1h1a2 2 0 0 0 2-2v-6a3 3 0 0 0-3-3zM10 6h4v1h-4V6zm-4 9a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm12 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
          <circle cx="12" cy="4" r="1"/>
          <circle cx="8" cy="4" r="0.5"/>
          <circle cx="16" cy="4" r="0.5"/>
        </svg>
      )
    },
    { 
      id: 'express', 
      label: 'EXPRESS', 
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          <path d="M10 9l2-2 2 2v1h-4V9z"/>
        </svg>
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
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Section Management</h1>
                <p className="text-gray-600 text-sm">
                  Configure fare structures for different bus categories
                </p>
              </div>
              <div className="text-3xl text-gray-300">
                🚌
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {categoryTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`flex flex-col items-center px-8 py-4 text-base font-medium whitespace-nowrap transition-all duration-200 relative ${
                    selectedCategory === tab.id
                      ? 'text-blue-600 bg-blue-50 border-b-3 border-blue-600'
                      : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
                  }`}
                >
                  <div className="mb-2">{tab.icon}</div>
                  <div className="font-semibold">{tab.label}</div>
                  <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
                    selectedCategory === tab.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getSectionCountByCategory(tab.id)} sections
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {selectedCategory === 'all' ? 'All Sections' : `${formatCategory(selectedCategory)} Sections`}
                </h2>
                <p className="text-gray-600">
                  {selectedCategory === 'all' 
                    ? 'View and manage all section fare structures across all categories'
                    : `Manage fare pricing for ${formatCategory(selectedCategory).toLowerCase()} category buses`
                  }
                </p>
              </div>
              
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <div className="relative flex-grow lg:w-80">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <Input
                    type="text"
                    placeholder="Search by section number or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <Button 
                  onClick={() => {
                    setNewSection({
                      ...newSection, 
                      category: selectedCategory === 'all' ? SectionCategory.NORMAL : selectedCategory as SectionCategory
                    });
                    setShowAddModal(true);
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Section
                </Button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-6 mb-8 rounded-r-lg shadow-sm">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="font-bold text-lg">Error Occurred</h3>
                    <p className="mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex flex-col justify-center items-center h-80">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mb-4"></div>
                <p className="text-gray-600 text-lg">Loading sections...</p>
              </div>
            ) : (
              <>
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-blue-800 font-medium text-lg">
                      Showing {filteredSections.length} of {getSectionCountByCategory(selectedCategory)} {selectedCategory === 'all' ? '' : formatCategory(selectedCategory).toLowerCase()} {getSectionCountByCategory(selectedCategory) === 1 ? 'section' : 'sections'} (Page {currentPage} of {totalPages})
                    </p>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <DataTable
                    columns={getColumns()}
                    data={filteredSections}
                    emptyMessage={selectedCategory === 'all' ? 'No sections found. Create one to get started.' : `No ${formatCategory(selectedCategory).toLowerCase()} sections found. Create one to get started.`}
                  />
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center text-sm text-gray-700">
                      <span>
                        Showing page {currentPage} of {totalPages} ({itemsPerPage} items per page)
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        Previous
                      </button>
                      
                      <div className="flex space-x-1">
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                currentPage === page
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        {totalPages > 5 && (
                          <>
                            <span className="px-2 py-2 text-gray-500">...</span>
                            <button
                              onClick={() => handlePageChange(totalPages)}
                              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                currentPage === totalPages
                                  ? 'bg-blue-600 text-white'
                                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                              }`}
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>
                      
                      <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                          currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
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
        </div>
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div 
            className="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all duration-300 ease-out scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Create New Section</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedCategory === 'all' ? 'Select category for new section' : `${formatCategory(selectedCategory)} Category`}
                </p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
              >
                <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Form Content */}
            <div className="p-6">
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Section Number</label>
                    <Input
                      type="number"
                      min={1}
                      value={newSection.sectionNumber || ''}
                      onChange={(e) => setNewSection({...newSection, sectionNumber: parseInt(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="e.g., 1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Fare (Rs.)</label>
                    <Input
                      type="number"
                      min={0.01}
                      step={0.01}
                      value={newSection.fare || ''}
                      onChange={(e) => setNewSection({...newSection, fare: parseFloat(e.target.value) || 0})}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                {/* Show category selection when creating from "All" view */}
                {selectedCategory === 'all' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                      value={newSection.category}
                      onChange={(e) => setNewSection({...newSection, category: e.target.value as SectionCategory})}
                    >
                      <option value={SectionCategory.NORMAL}>Normal</option>
                      <option value={SectionCategory.SEMI_LUXURY}>Semi Luxury</option>
                      <option value={SectionCategory.LUXURY}>Luxury</option>
                      <option value={SectionCategory.HIGH_LUXURY}>Super Luxury</option>
                      <option value={SectionCategory.SISU_SARIYA}>Sisu Sariya</option>
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    value={newSection.description}
                    onChange={(e) => setNewSection({...newSection, description: e.target.value})}
                    rows={3}
                    placeholder="Enter section description..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                  <select
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    value={newSection.isActive ? 'true' : 'false'}
                    onChange={(e) => setNewSection({...newSection, isActive: e.target.value === 'true'})}
                  >
                    <option value="true">✅ Active</option>
                    <option value="false">❌ Inactive</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 pt-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(false)}
                className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 rounded-lg font-medium transition-all"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddSection}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Section
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 