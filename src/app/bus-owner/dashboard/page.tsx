'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface DashboardStats {
  totalBuses: number;
  totalTrips: number;
  totalTicketsSold: number;
  totalRevenue: number;
  activeRoutes: number;
  totalStaff: number;
}

interface RecentActivity {
  id: string;
  action: string;
  description: string;
  time: string;
  type: 'success' | 'warning' | 'info';
}

export default function BusOwnerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalBuses: 0,
    totalTrips: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    activeRoutes: 0,
    totalStaff: 0,
  });
  
  const [activities] = useState<RecentActivity[]>([
    {
      id: '1',
      action: 'New Trip Created',
      description: 'Trip #T001 from Colombo to Kandy',
      time: '2 minutes ago',
      type: 'success',
    },
    {
      id: '2',
      action: 'Day End Report',
      description: 'Conductor John completed day end report',
      time: '1 hour ago',
      type: 'info',
    },
    {
      id: '3',
      action: 'Monthly Fee Payment',
      description: 'Monthly fee payment overdue for Bus B001',
      time: '3 hours ago',
      type: 'warning',
    },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Simulate API call - replace with actual API calls
        setTimeout(() => {
          setStats({
            totalBuses: 12,
            totalTrips: 156,
            totalTicketsSold: 2840,
            totalRevenue: 284000,
            activeRoutes: 8,
            totalStaff: 24,
          });
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || user?.email}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your bus operations for today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">🚌</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Buses</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalBuses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">🚍</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Trips</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTrips}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">🎫</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Tickets Sold</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalTicketsSold.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-semibold text-gray-900">LKR {stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <span className="text-2xl">🗺️</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Routes</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.activeRoutes}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Staff</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalStaff}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-400' :
                  activity.type === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.description}</p>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
              <span className="text-2xl mb-2 block">🚌</span>
              <span className="text-sm font-medium text-gray-900">Add New Bus</span>
            </button>
            <button className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <span className="text-2xl mb-2 block">🚍</span>
              <span className="text-sm font-medium text-gray-900">Schedule Trip</span>
            </button>
            <button className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <span className="text-2xl mb-2 block">👥</span>
              <span className="text-sm font-medium text-gray-900">Manage Staff</span>
            </button>
            <button className="p-4 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors">
              <span className="text-2xl mb-2 block">📊</span>
              <span className="text-sm font-medium text-gray-900">View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
