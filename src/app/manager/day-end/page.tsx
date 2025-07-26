'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface DayEndReport {
  id: string;
  date: string;
  busId: string;
  busName: string;
  conductorName: string;
  totalTrips: number;
  totalTickets: number;
  totalRevenue: number;
  cashCollected: number;
  digitalPayments: number;
  expenses: number;
  netAmount: number;
  status: 'pending' | 'submitted' | 'approved' | 'rejected';
  submittedAt?: string;
  submittedBy?: string;
  remarks?: string;
}

export default function ManagerDayEndPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<DayEndReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    const fetchDayEndReports = async () => {
      try {
        // In real implementation, fetch only day-end reports for the assigned bus
        setTimeout(() => {
          const mockReports: DayEndReport[] = [
            {
              id: 'DE001',
              date: '2025-01-26',
              busId: 'B001',
              busName: 'Express Line 1',
              conductorName: 'John Silva',
              totalTrips: 4,
              totalTickets: 165,
              totalRevenue: 49500,
              cashCollected: 35000,
              digitalPayments: 14500,
              expenses: 2500,
              netAmount: 47000,
              status: 'submitted',
              submittedAt: '2025-01-26 23:30:00',
              submittedBy: 'John Silva',
              remarks: 'All trips completed successfully'
            },
            {
              id: 'DE002',
              date: '2025-01-25',
              busId: 'B001',
              busName: 'Express Line 1',
              conductorName: 'John Silva',
              totalTrips: 4,
              totalTickets: 158,
              totalRevenue: 47400,
              cashCollected: 32000,
              digitalPayments: 15400,
              expenses: 1800,
              netAmount: 45600,
              status: 'approved',
              submittedAt: '2025-01-25 23:45:00',
              submittedBy: 'John Silva',
              remarks: 'Good performance'
            },
            {
              id: 'DE003',
              date: '2025-01-24',
              busId: 'B001',
              busName: 'Express Line 1',
              conductorName: 'John Silva',
              totalTrips: 3,
              totalTickets: 142,
              totalRevenue: 42600,
              cashCollected: 28000,
              digitalPayments: 14600,
              expenses: 2200,
              netAmount: 40400,
              status: 'approved',
              submittedAt: '2025-01-24 23:20:00',
              submittedBy: 'John Silva'
            }
          ];
          setReports(mockReports);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching day-end reports:', error);
        setError('Failed to load day-end reports');
        setLoading(false);
      }
    };

    fetchDayEndReports();
  }, [selectedPeriod]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✅';
      case 'submitted':
        return '📊';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      default:
        return '📄';
    }
  };

  const handleApproveReport = async (reportId: string) => {
    try {
      // In real implementation, call API to approve the report
      setReports(reports.map(report => 
        report.id === reportId 
          ? { ...report, status: 'approved' as const }
          : report
      ));
    } catch (error) {
      console.error('Error approving report:', error);
    }
  };

  const handleRejectReport = async (reportId: string) => {
    try {
      // In real implementation, call API to reject the report
      const remarks = prompt('Please enter rejection reason:');
      if (remarks) {
        setReports(reports.map(report => 
          report.id === reportId 
            ? { ...report, status: 'rejected' as const, remarks }
            : report
        ));
      }
    } catch (error) {
      console.error('Error rejecting report:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Day End Reports</h1>
            <p className="text-gray-600">
              Review and approve day-end reports for your assigned bus.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="all">All Reports</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Reports</h3>
              <p className="text-2xl font-semibold text-gray-900">{reports.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Approved</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {reports.filter(r => r.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Pending Review</h3>
              <p className="text-2xl font-semibold text-gray-900">
                {reports.filter(r => r.status === 'submitted').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
              <p className="text-2xl font-semibold text-gray-900">
                LKR {reports.reduce((sum, report) => sum + report.totalRevenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Daily Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Report ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conductor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trips
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tickets
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Net Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{report.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{report.conductorName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.totalTrips}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.totalTickets}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    LKR {report.totalRevenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    LKR {report.netAmount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                      <span className="mr-1">{getStatusIcon(report.status)}</span>
                      {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        View Details
                      </button>
                      {report.status === 'submitted' && (
                        <>
                          <button 
                            onClick={() => handleApproveReport(report.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleRejectReport(report.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {reports.length === 0 && (
          <div className="text-center py-12">
            <span className="text-4xl mb-4 block">📊</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500">No day-end reports available for the selected period.</p>
          </div>
        )}
      </div>

      {/* Manager Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <span className="text-2xl mr-3">💡</span>
          <div>
            <h3 className="text-lg font-semibold text-blue-800 mb-2">Manager Responsibilities</h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• Review day-end reports submitted by your bus conductor</li>
              <li>• Verify ticket counts and revenue figures</li>
              <li>• Approve reports after thorough verification</li>
              <li>• Reject reports with discrepancies and provide feedback</li>
              <li>• Monitor daily performance and revenue trends</li>
            </ul>
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
              You can only view and manage day-end reports for your assigned bus. All reports shown are specific to your bus operations only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
