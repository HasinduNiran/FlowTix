'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ManagerService } from '@/services/manager.service';

interface DashboardStats {
  totalTrips: number;
  totalTickets: number;
  totalRevenue: number;
  todayTrips: number;
  todayTickets: number;
  todayRevenue: number;
  pendingReports: number;
  pendingExpenses: number;
}

interface RecentActivity {
  id: string;
  action: string;
  description: string;
  time: string;
  type: 'success' | 'warning' | 'info';
}

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTrips: 0,
    totalTickets: 0,
    totalRevenue: 0,
    todayTrips: 0,
    todayTickets: 0,
    todayRevenue: 0,
    pendingReports: 0,
    pendingExpenses: 0,
  });
  
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard statistics and recent activities in parallel
        const [statsData, activitiesData] = await Promise.all([
          ManagerService.getDashboardStats(),
          ManagerService.getRecentActivities(5)
        ]);
        
        setStats(statsData);
        setActivities(activitiesData);
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message || 'Failed to load dashboard data');
        
        // Fallback to sample data if API fails
        setStats({
          totalTrips: 12,
          totalTickets: 485,
          totalRevenue: 145500,
          todayTrips: 4,
          todayTickets: 168,
          todayRevenue: 50400,
          pendingReports: 2,
          pendingExpenses: 3,
        });
        
        setActivities([
          {
            id: '1',
            action: 'Trip Completed',
            description: 'Morning trip from Colombo to Kandy completed successfully',
            time: '2 hours ago',
            type: 'success',
          },
          {
            id: '2',
            action: 'Day End Report',
            description: 'Day end report submitted for review',
            time: '4 hours ago',
            type: 'info',
          },
          {
            id: '3',
            action: 'Expense Request',
            description: 'Fuel expense request pending approval',
            time: '6 hours ago',
            type: 'warning',
          }
        ]);
      } finally {
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
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center">
            <span className="text-xl mr-3">⚠️</span>
            <div>
              <h3 className="font-semibold">Connection Issue</h3>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name || user?.email}!
        </h1>
        <p className="text-gray-600">
          Here's an overview of your bus operations for today.
        </p>
        {user?.assignedBuses && user.assignedBuses.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Assigned Bus:</strong> {user.assignedBuses.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Today's Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">🚍</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Today's Trips</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.todayTrips}</p>
              <p className="text-xs text-gray-500">Total: {stats.totalTrips}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">🎫</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Today's Tickets</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.todayTickets}</p>
              <p className="text-xs text-gray-500">Total: {stats.totalTickets.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Today's Revenue</h3>
              <p className="text-2xl font-semibold text-gray-900">LKR {stats.todayRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Total: LKR {stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pending Tasks</h3>
              <p className="text-2xl font-semibold text-gray-900">{stats.pendingReports + stats.pendingExpenses}</p>
              <p className="text-xs text-gray-500">Reports: {stats.pendingReports} | Expenses: {stats.pendingExpenses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activities and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
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
              ))
            ) : (
              <div className="text-center py-8">
                <span className="text-4xl mb-2 block">📋</span>
                <p className="text-gray-500">No recent activities</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <a 
              href="/manager/bus"
              className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors block"
            >
              <span className="text-2xl mb-2 block">🚌</span>
              <span className="text-sm font-medium text-gray-900">View My Bus</span>
            </a>
            <a 
              href="/manager/trips"
              className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors block"
            >
              <span className="text-2xl mb-2 block">🚍</span>
              <span className="text-sm font-medium text-gray-900">Manage Trips</span>
            </a>
            <a 
              href="/manager/day-end"
              className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors block"
            >
              <span className="text-2xl mb-2 block">🌅</span>
              <span className="text-sm font-medium text-gray-900">Day End Reports</span>
            </a>
            <a 
              href="/manager/expenses"
              className="p-4 text-left bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors block"
            >
              <span className="text-2xl mb-2 block">💸</span>
              <span className="text-sm font-medium text-gray-900">Review Expenses</span>
            </a>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl mb-2">📊</div>
            <h4 className="text-sm font-medium text-green-700">Daily Average</h4>
            <p className="text-lg font-semibold text-green-900">
              {stats.totalTrips > 0 ? Math.round(stats.totalRevenue / stats.totalTrips) : 0} LKR/trip
            </p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl mb-2">🎯</div>
            <h4 className="text-sm font-medium text-blue-700">Capacity Utilization</h4>
            <p className="text-lg font-semibold text-blue-900">
              {stats.totalTrips > 0 ? Math.round((stats.totalTickets / (stats.totalTrips * 45)) * 100) : 0}%
            </p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl mb-2">⚡</div>
            <h4 className="text-sm font-medium text-purple-700">Task Completion</h4>
            <p className="text-lg font-semibold text-purple-900">
              {stats.pendingReports + stats.pendingExpenses === 0 ? '100%' : 'Pending'}
            </p>
          </div>
        </div>
      </div>

      {/* Manager Access Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center">
          <span className="text-xl mr-3">ℹ️</span>
          <div>
            <h3 className="text-sm font-semibold text-amber-800">Manager Access</h3>
            <p className="text-sm text-amber-700">
              You have manager-level access to operations for your assigned bus. All data and controls are specific to your bus operations only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
