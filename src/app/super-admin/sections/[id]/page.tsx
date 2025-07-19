'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SectionService, Section, SectionCategory } from '@/services/section.service';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SectionDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [section, setSection] = useState<Section | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedSection, setEditedSection] = useState<Partial<Section>>({});

  useEffect(() => {
    fetchSectionDetails();
  }, [id]);

  const fetchSectionDetails = async () => {
    setLoading(true);
    try {
      const sectionData = await SectionService.getSectionById(id);
      setSection(sectionData);
      setEditedSection(sectionData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch section details:', err);
      setError('Failed to load section details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      await SectionService.updateSection(id, editedSection);
      setSection({...section, ...editedSection} as Section);
      setIsEditing(false);
      setError(null);
    } catch (err) {
      console.error('Failed to update section:', err);
      setError('Failed to update section. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedSection(section || {});
  };

  const formatCategory = (category: string) => {
    return category
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get icon for category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'normal':
        return '🚍';
      case 'semi_luxury':
        return '🚌';
      case 'luxury':
        return '🚐';
      case 'high_luxury':
        return '🚘';
      case 'sisu_sariya':
        return '🚸';
      default:
        return '🚌';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !section) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
        <div className="flex">
          <div className="py-1">
            <svg className="h-6 w-6 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-base">Error</p>
            <p className="text-base">{error}</p>
            <div className="mt-4">
              <Button 
                onClick={() => router.back()}
                className="bg-blue-600 hover:bg-blue-700 text-base flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.push('/super-admin/sections')} 
          className="mr-4 text-blue-600 hover:text-blue-800 flex items-center text-base"
        >
          <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Sections
        </button>
        <h1 className="text-2xl font-bold text-gray-800">Section Details</h1>
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
              <p className="font-bold text-base">Error</p>
              <p className="text-base">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="text-4xl mr-4">
              {section?.category && getCategoryIcon(section.category)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                {section?.category && formatCategory(section.category)} Section #{section?.sectionNumber}
              </h2>
              <p className="text-gray-600 text-lg">
                Fare: Rs. {section?.fare.toFixed(2)}
              </p>
            </div>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Section
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Cancel
              </button>
              <button
                onClick={handleSaveChanges}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Save Changes
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-base font-medium text-gray-700 mb-1">Section Number</label>
            {isEditing ? (
              <Input
                type="number"
                min={0}
                value={editedSection.sectionNumber || 0}
                onChange={(e) => setEditedSection({...editedSection, sectionNumber: parseInt(e.target.value)})}
                className="w-full text-base"
              />
            ) : (
              <p className="text-gray-900 font-semibold text-lg">{section?.sectionNumber}</p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-base font-medium text-gray-700 mb-1">Category</label>
            {isEditing ? (
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-base"
                value={editedSection.category}
                onChange={(e) => setEditedSection({...editedSection, category: e.target.value as SectionCategory})}
              >
                {Object.values(SectionCategory).map((category) => (
                  <option key={category} value={category}>
                    {formatCategory(category)}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-gray-900 font-semibold text-lg">
                <span className={`px-3 py-1 rounded-full text-base font-semibold ${
                  section?.category === SectionCategory.NORMAL ? 'bg-gray-100 text-gray-800' :
                  section?.category === SectionCategory.LUXURY ? 'bg-purple-100 text-purple-800' :
                  section?.category === SectionCategory.SEMI_LUXURY ? 'bg-blue-100 text-blue-800' :
                  section?.category === SectionCategory.HIGH_LUXURY ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {section?.category && formatCategory(section.category)}
                </span>
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-base font-medium text-gray-700 mb-1">Fare (Rs.)</label>
            {isEditing ? (
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={editedSection.fare || 0}
                onChange={(e) => setEditedSection({...editedSection, fare: parseFloat(e.target.value)})}
                className="w-full text-base"
              />
            ) : (
              <p className="text-gray-900 font-semibold text-lg">Rs. {section?.fare.toFixed(2)}</p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-base font-medium text-gray-700 mb-1">Status</label>
            {isEditing ? (
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-base"
                value={editedSection.isActive ? 'true' : 'false'}
                onChange={(e) => setEditedSection({...editedSection, isActive: e.target.value === 'true'})}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            ) : (
              <p className="text-gray-900">
                <span className={`px-3 py-1 rounded-full text-base font-semibold ${
                  section?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {section?.isActive ? 'Active' : 'Inactive'}
                </span>
              </p>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-base font-medium text-gray-700 mb-1">Created At</label>
            <p className="text-gray-900 text-base">{new Date(section?.createdAt || '').toLocaleString()}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <label className="block text-base font-medium text-gray-700 mb-1">Last Updated</label>
            <p className="text-gray-900 text-base">{new Date(section?.updatedAt || '').toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 p-4 rounded-md">
          <label className="block text-base font-medium text-gray-700 mb-1">Description</label>
          {isEditing ? (
            <textarea
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-base"
              value={editedSection.description || ''}
              onChange={(e) => setEditedSection({...editedSection, description: e.target.value})}
              rows={3}
            />
          ) : (
            <p className="text-gray-900 text-base">{section?.description}</p>
          )}
        </div>
      </div>
    </div>
  );
} 