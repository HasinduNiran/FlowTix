'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import DataTable from '@/components/dashboard/DataTable';

export default function SuperAdminDashboard() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Mock data for stats
  const stats = [
    {
      title: 'Total Bus Companies',
      value: 24,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      change: '12%',
      changeType: 'increase' as const,
      bgColor: 'bg-blue-500',
    },
    {
      title: 'Active Buses',
      value: 156,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      change: '8%',
      changeType: 'increase' as const,
      bgColor: 'bg-green-500',
    },
    {
      title: 'Total Routes',
      value: 42,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      change: '5%',
      changeType: 'increase' as const,
      bgColor: 'bg-purple-500',
    },
    {
      title: 'Tickets Sold (Today)',
      value: 1284,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      change: '3%',
      changeType: 'decrease' as const,
      bgColor: 'bg-yellow-500',
    },
  ];

  // Mock data for recent activities
  const activities = [
    {
      id: '1',
      title: 'New Bus Company Registered',
      description: 'Metro Express has registered as a new bus company',
      time: '2 hours ago',
      status: 'success' as const,
    },
    {
      id: '2',
      title: 'Route Added',
      description: 'New route added: City Center to Airport',
      time: '4 hours ago',
      status: 'info' as const,
    },
    {
      id: '3',
      title: 'System Alert',
      description: 'High ticket sales volume detected on Route #42',
      time: '6 hours ago',
      status: 'warning' as const,
    },
    {
      id: '4',
      title: 'User Reported Issue',
      description: 'Payment gateway timeout reported by multiple users',
      time: '1 day ago',
      status: 'error' as const,
    },
  ];

  // Mock data for recent bus companies
  const busCompanies = [
    { id: '1', name: 'Metro Express', buses: 12, routes: 8, status: 'Active', joinedDate: '2023-01-15' },
    { id: '2', name: 'City Liner', buses: 24, routes: 15, status: 'Active', joinedDate: '2023-02-20' },
    { id: '3', name: 'Rapid Transit', buses: 18, routes: 10, status: 'Active', joinedDate: '2023-03-05' },
    { id: '4', name: 'Golden Bus', buses: 8, routes: 5, status: 'Inactive', joinedDate: '2023-04-10' },
    { id: '5', name: 'Royal Coaches', buses: 15, routes: 12, status: 'Active', joinedDate: '2023-05-22' },
  ];

  const companyColumns = [
    { header: 'Company Name', accessor: 'name' },
    { header: 'Buses', accessor: 'buses' },
    { header: 'Routes', accessor: 'routes' },
    {
      header: 'Status',
      accessor: (company: any) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            company.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}
        >
          {company.status}
        </span>
      ),
    },
    { header: 'Joined Date', accessor: 'joinedDate' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            change={stat.change}
            changeType={stat.changeType}
            bgColor={stat.bgColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DataTable
            columns={companyColumns}
            data={busCompanies}
            title="Recent Bus Companies"
            keyExtractor={(item) => item.id}
            onRowClick={(company) => console.log('Clicked company:', company)}
          />
        </div>
        <div>
          <RecentActivityCard activities={activities} />
        </div>
      </div>
    </div>
  );
}
