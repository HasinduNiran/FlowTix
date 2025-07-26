'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { StopService, Stop } from '@/services/stop.service';
import StopForm from '@/components/dashboard/StopForm';
import { Button } from '@/components/ui/Button';

export default function EditStopPage() {
  const [stop, setStop] = useState<Stop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useParams();
  const stopId = params.id as string;

  useEffect(() => {
    fetchStop();
  }, [stopId]);

  const fetchStop = async () => {
    try {
      setLoading(true);
      const stopData = await StopService.getStopById(stopId);
      setStop(stopData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch stop details. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    router.push(`/super-admin/stops/${stopId}`);
  };

  const handleUpdateSuccess = () => {
    // Navigate back to the stop detail page after successful update
    router.push(`/super-admin/stops/${stopId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200 border-t-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600 text-lg">Loading stop information...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stop) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <Button 
              onClick={handleBackClick} 
              variant="outline"
              className="hover:bg-gray-50 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Stop Detail
            </Button>
          </div>
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-red-200">
            <div className="text-center">
              <div className="bg-red-100 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h2>
              <p className="text-red-600 bg-red-50 p-4 rounded-xl">
                {error || 'Stop not found'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              onClick={handleBackClick} 
              variant="outline" 
              className="mr-4 hover:bg-gray-50 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Stop Detail
            </Button>
          </div>
          
          <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center">
              <div className="bg-blue-100 p-4 rounded-2xl mr-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Stop</h1>
                <p className="text-gray-600">Update the stop information below</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white shadow-lg rounded-2xl border border-gray-200">
          <StopForm 
            initialData={stop} 
            isEdit={true}
            onSuccess={handleUpdateSuccess}
          />
        </div>
      </div>
    </div>
  );
}
