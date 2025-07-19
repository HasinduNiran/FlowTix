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
          <Button 
            variant="outline" 
            onClick={() => handleViewDetails(id)}
            className="text-blue-600 border-blue-600 hover:bg-blue-50"
          >
            View
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => handleDeleteSection(id)}
            className="bg-red-600 hover:bg-red-700"
          >
            Delete
          </Button>
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

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {formatCategory(selectedCategory)} Sections
          </h2>
          <Button 
            onClick={() => {
              setNewSection({...newSection, category: selectedCategory as SectionCategory});
              setShowAddModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-base"
          >
            Add New Section
          </Button>
        </div>

        <div className="mb-6">
          <Input
            type="text"
            placeholder="Search sections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-base"
          />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
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
                className="bg-blue-600 hover:bg-blue-700 text-base"
              >
                Add Section
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 