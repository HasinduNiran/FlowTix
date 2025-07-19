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

  const filteredSections = sections.filter(section => 
    section.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    section.sectionNumber.toString().includes(searchTerm)
  );

  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const columns = [
    { header: 'Section Number', accessor: 'sectionNumber' },
    { 
      header: 'Category', 
      accessor: 'category',
      cell: (value: string) => formatCategory(value)
    },
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
        <span className={value ? 'text-green-600' : 'text-red-600'}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: '_id',
      cell: (id: string) => (
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleViewDetails(id)}>View</Button>
          <Button variant="destructive" onClick={() => handleDeleteSection(id)}>Delete</Button>
        </div>
      )
    }
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Sections Management</h1>
        <Button onClick={() => setShowAddModal(true)}>Add New Section</Button>
      </div>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search sections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={filteredSections}
          emptyMessage="No sections found"
        />
      )}

      {/* Add Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Section</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Section Number</label>
                <Input
                  type="number"
                  min={0}
                  value={newSection.sectionNumber}
                  onChange={(e) => setNewSection({...newSection, sectionNumber: parseInt(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  value={newSection.category}
                  onChange={(e) => setNewSection({...newSection, category: e.target.value as SectionCategory})}
                >
                  {Object.values(SectionCategory).map((category) => (
                    <option key={category} value={category}>
                      {formatCategory(category)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Fare (Rs.)</label>
                <Input
                  type="number"
                  min={0.01}
                  step={0.01}
                  value={newSection.fare}
                  onChange={(e) => setNewSection({...newSection, fare: parseFloat(e.target.value)})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  value={newSection.description}
                  onChange={(e) => setNewSection({...newSection, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                  value={newSection.isActive ? 'true' : 'false'}
                  onChange={(e) => setNewSection({...newSection, isActive: e.target.value === 'true'})}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleAddSection}>Add Section</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 