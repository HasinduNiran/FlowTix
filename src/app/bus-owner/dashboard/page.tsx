'use client';

import { useState, useEffect } from 'react';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivityCard from '@/components/dashboard/RecentActivityCard';
import DataTable from '@/components/dashboard/DataTable';

export default function BusOwnerDashboard() {
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
      title: 'Total Buses',
      value: 12,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      ),
      change: '2',
      changeType: 'increase' as const,
      bgColor: 'bg-blue-500',
    },
    {
      title: 'Active Trips',
      value: 8,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      bgColor: 'bg-green-500',
    },
    {
      title: 'Today\'s Revenue',
      value: '$1,284',
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      change: '8%',
      changeType: 'increase' as const,
      bgColor: 'bg-yellow-500',
    },
    {
      title: 'Tickets Sold (Today)',
      value: 156,
      icon: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      change: '12%',
      changeType: 'increase' as const,
      bgColor: 'bg-purple-500',
    },
  ];

  // Mock data for recent activities
  const activities = [
    {
      id: '1',
      title: 'Trip Started',
      description: 'Bus #B-123 started trip from City Center to Airport',
      time: '30 minutes ago',
      status: 'success' as const,
    },
    {
      id: '2',
      title: 'Ticket Sold',
      description: '5 tickets sold for evening trip to Downtown',
      time: '1 hour ago',
      status: 'info' as const,
    },
    {
      id: '3',
      title: 'Bus Maintenance',
      description: 'Bus #B-456 scheduled for maintenance tomorrow',
      time: '2 hours ago',
      status: 'warning' as const,
    },
    {
      id: '4',
      title: 'Driver Absent',
      description: 'Driver John Doe reported sick for today\'s shifts',
      time: '4 hours ago',
      status: 'error' as const,
    },
  ];

  // Mock data for upcoming trips
  const upcomingTrips = [
    { 
      id: '1', 
      route: 'City Center - Airport', 
      departure: '10:30 AM', 
      bus: 'B-123',
      driver: 'John Smith',
      bookedSeats: 28,
      totalSeats: 40
    },
    { 
      id: '2', 
      route: 'Central Station - Beach Resort', 
      departure: '11:45 AM', 
      bus: 'B-456',
      driver: 'Mike Johnson',
      bookedSeats: 32,
      totalSeats: 45
    },
    { 
      id: '3', 
      route: 'Downtown - Shopping Mall', 
      departure: '12:15 PM', 
      bus: 'B-789',
      driver: 'Sarah Williams',
      bookedSeats: 18,
      totalSeats: 35
    },
    { 
      id: '4', 
      route: 'University - Sports Stadium', 
      departure: '2:00 PM', 
      bus: 'B-234',
      driver: 'Robert Brown',
      bookedSeats: 25,
      totalSeats: 40
    },
    { 
      id: '5', 
      route: 'Airport - City Center', 
      departure: '3:30 PM', 
      bus: 'B-567',
      driver: 'Emily Davis',
      bookedSeats: 15,
      totalSeats: 40
    },
  ];

  const tripColumns = [
    { header: 'Route', accessor: 'route' },
    { header: 'Departure', accessor: 'departure' },
    { header: 'Bus', accessor: 'bus' },
    { header: 'Driver', accessor: 'driver' },
    { 
      header: 'Booking Status', 
      accessor: (trip: any) => (
        <div className="flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${(trip.bookedSeats / trip.totalSeats) * 100}%` }}
            ></div>
          </div>
          <span className="ml-2 text-xs">{trip.bookedSeats}/{trip.totalSeats}</span>
        </div>
      ),
    },
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
            columns={tripColumns}
            data={upcomingTrips}
            title="Today's Trips"
            keyExtractor={(item) => item.id}
            onRowClick={(trip) => console.log('Clicked trip:', trip)}
          />
        </div>
        <div>
          <RecentActivityCard activities={activities} />
        </div>
      </div>
    </div>
  );
}
