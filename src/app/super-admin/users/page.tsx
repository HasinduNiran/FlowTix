'use client';

import { useState, useEffect } from 'react';

export default function UsersPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
        <p className="text-gray-600 mt-1">Manage system users</p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <p className="text-gray-600">Users management coming soon...</p>
      </div>
    </div>
  );
}