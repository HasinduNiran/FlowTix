'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push('/login');
      } else {
        // Redirect based on user role
        if (user.role === 'super-admin') {
          router.push('/super-admin/dashboard');
        } else if (user.role === 'bus-owner') {
          router.push('/bus-owner/dashboard');
        }
        // Regular users stay on home page
      }
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If authenticated as regular user, show the home page
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to FlowTix</h1>
        <p className="text-xl mb-8">Your modern bus ticket management system</p>
      </main>
    </div>
  );
}
