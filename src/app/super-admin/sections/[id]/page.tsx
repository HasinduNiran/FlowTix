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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error && !section) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
        <div className="mt-4">
          <Button onClick={() => router.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.push('/super-admin/sections')} 
          className="mr-4 text-blue-500 hover:text-blue-700"
        >
          ← Back to Sections
        </button>
        <h1 className="text-2xl font-bold">Section Details</h1>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Section Information</h2>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)}>Edit Section</Button>
          ) : (
            <div className="space-x-2">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Section Number</label>
            {isEditing ? (
              <Input
                type="number"
                min={0}
                value={editedSection.sectionNumber || 0}
                onChange={(e) => setEditedSection({...editedSection, sectionNumber: parseInt(e.target.value)})}
              />
            ) : (
              <p className="text-gray-900">{section?.sectionNumber}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            {isEditing ? (
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
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
              <p className="text-gray-900">{section?.category ? formatCategory(section.category) : ''}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fare (Rs.)</label>
            {isEditing ? (
              <Input
                type="number"
                min={0.01}
                step={0.01}
                value={editedSection.fare || 0}
                onChange={(e) => setEditedSection({...editedSection, fare: parseFloat(e.target.value)})}
              />
            ) : (
              <p className="text-gray-900">Rs. {section?.fare.toFixed(2)}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            {isEditing ? (
              <select
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                value={editedSection.isActive ? 'true' : 'false'}
                onChange={(e) => setEditedSection({...editedSection, isActive: e.target.value === 'true'})}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            ) : (
              <p className={`text-gray-900 ${section?.isActive ? 'text-green-600' : 'text-red-600'}`}>
                {section?.isActive ? 'Active' : 'Inactive'}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
            <p className="text-gray-900">{new Date(section?.createdAt || '').toLocaleString()}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
            <p className="text-gray-900">{new Date(section?.updatedAt || '').toLocaleString()}</p>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          {isEditing ? (
            <textarea
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              value={editedSection.description || ''}
              onChange={(e) => setEditedSection({...editedSection, description: e.target.value})}
              rows={3}
            />
          ) : (
            <p className="text-gray-900">{section?.description}</p>
          )}
        </div>
      </div>
    </div>
  );
} 