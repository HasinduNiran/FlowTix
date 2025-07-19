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
  const [selectedCategory, setSelectedCategory] = useState<string>('normal');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newSection, setNewSection] = useState({
    sectionNumber: 0,
    fare: 0,
    category: SectionCategory.NORMAL,
    description: '',
    isActive: true
  });

  // Fetch sections on component mount
  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await SectionService.getAllSections();
      setSections(data);
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
      fetchSections();
    } catch (err) {
      console.error('Failed to add section:', err);
      setError('Failed to add section. Please try again.');
    }
  };

  const handleDeleteSection = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this section?')) {
      try {
        await SectionService.deleteSection(id);
        fetchSections();
      } catch (err) {
        console.error('Failed to delete section:', err);
        setError('Failed to delete section. Please try again.');
      }
    }
  };

  const handleViewDetails = (id: string) => {
    router.push(`/super-admin/sections/${id}`);
  };

  // Filter sections by search term and category
  const filteredSections = sections.filter(section => {
    const matchesSearch = 
      section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.sectionNumber.toString().includes(searchTerm);
    
    const matchesCategory = selectedCategory === 'all' || section.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const columns = [
    { header: 'Section Number', accessor: 'sectionNumber' },
    { 
      header: 'Fare', 
      accessor: 'fare',
      cell: (value: number) => `Rs. ${value.toFixed(2)}`
    },
    { header: 'Description', accessor: 'description' },
    { 
      header: 'Status', 
      accessor: 'isActive',
      cell: (value: boolean) => (
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (id: string) => (
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
            onClick={() => handleDeleteSection(id)}
            className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
            title="Delete Section"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={() => handleViewDetails(id)}
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
  ];

  // Get count of sections by category
  const getSectionCountByCategory = (category: string) => {
    return sections.filter(section => section.category === category).length;
  };

  // Categories for tabs
  const categoryTabs = [
    { id: 'normal', label: 'NORMAL', icon: '🚍' },
    { id: 'semi_luxury', label: 'SEMI-LUXURY', icon: '🚌' },
    { id: 'luxury', label: 'LUXURY', icon: '🚐' },
    { id: 'high_luxury', label: 'SUPER LUXURY', icon: '🚘' }
  ];

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Section Management</h1>
          <p className="text-gray-600 text-lg">
            Manage bus sections by category. Each category has its own fare structure.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex overflow-x-auto mb-8 border-b">
          {categoryTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`flex flex-col items-center px-6 py-3 text-lg font-medium whitespace-nowrap ${
                selectedCategory === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-blue-500'
              }`}
            >
              <div className="text-2xl mb-1">{tab.icon}</div>
              <div>{tab.label}</div>
              <div className="text-sm mt-1 font-normal">
                {getSectionCountByCategory(tab.id)} sections
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl font-bold text-gray-800">
            {formatCategory(selectedCategory)} Sections
          </h2>
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <Input
                type="text"
                placeholder="Search sections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full text-base"
              />
            </div>
            <Button 
              onClick={() => {
                setNewSection({...newSection, category: selectedCategory as SectionCategory});
                setShowAddModal(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-base flex items-center gap-2 whitespace-nowrap"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Add Section
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <div className="flex">
              <div className="py-1">
                <svg className="h-6 w-6 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
              <p className="text-blue-600 text-base">
                Showing {filteredSections.length} {formatCategory(selectedCategory)} {filteredSections.length === 1 ? 'section' : 'sections'}
              </p>
            </div>

            <DataTable
              columns={columns}
              data={filteredSections}
              emptyMessage={`No ${formatCategory(selectedCategory)} sections found`}
            />
          </>
        )}
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
          if (e.target === e.currentTarget) setShowAddModal(false);
        }}>
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Add New {formatCategory(selectedCategory)} Section</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700">Section Number</label>
                <Input
                  type="number"
                  min={0}
                  value={newSection.sectionNumber}
                  onChange={(e) => setNewSection({...newSection, sectionNumber: parseInt(e.target.value)})}
                  className="w-full text-base"
                />
              </div>
              
              <div>
                <label className="block text-base font-medium text-gray-700">Fare (Rs.)</label>
                <Input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={newSection.fare}
                  onChange={(e) => setNewSection({...newSection, fare: parseFloat(e.target.value)})}
                  className="w-full text-base"
                />
              </div>
              
              <div>
                <label className="block text-base font-medium text-gray-700">Description</label>
                <textarea
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-base"
                  value={newSection.description}
                  onChange={(e) => setNewSection({...newSection, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-base font-medium text-gray-700">Status</label>
                <select
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-base"
                  value={newSection.isActive ? 'true' : 'false'}
                  onChange={(e) => setNewSection({...newSection, isActive: e.target.value === 'true'})}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowAddModal(false)}
                className="border-gray-300 text-gray-700 text-base"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAddSection}
                className="bg-blue-600 hover:bg-blue-700 text-base flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Section
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 