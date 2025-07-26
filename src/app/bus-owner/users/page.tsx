'use client';

import { useState, useEffect } from 'react';
import { UserService } from '@/services/user.service';
import { BusService } from '@/services/bus.service';
import { BackendUser, BackendUserRole } from '@/types/auth';
import { useAuth } from '@/context/AuthContext';

interface User {
  _id: string;
  username: string;
  role: 'manager' | 'conductor';
  isActive: boolean;
  createdAt: string;
  assignedBuses?: string[];
}

interface Bus {
  _id: string;
  busNumber: string;
  busName: string;
  isActive: boolean;
}

export default function UsersPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'manager' | 'conductor'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetchUsers();
      fetchBuses();
    }
  }, [currentUser]);

  const fetchBuses = async () => {
    if (!currentUser) {
      console.log('No current user found');
      return;
    }

    try {
      // Get buses specifically for the current owner
      const busesData = await BusService.getBusesByOwner(currentUser.id);
      
      // Transform to match our interface and filter active buses
      const ownerBuses = busesData
        .filter(bus => bus.status === 'active')
        .map(bus => ({
          _id: bus._id,
          busNumber: bus.busNumber,
          busName: bus.busName,
          isActive: bus.status === 'active'
        }));
      
      setBuses(ownerBuses);
    } catch (error) {
      console.error('Error fetching owner buses:', error);
      // Set empty array if API fails - no fallback mock data since we want owner-specific buses
      setBuses([]);
      setError('Failed to load your buses. Please try again.');
    }
  };

  const fetchUsers = async () => {
    if (!currentUser) {
      console.log('No current user found');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Get users specific to the current owner (backend will filter automatically)
      const backendUsers = await UserService.getUsersByOwner();
      
      // Filter to only show managers and conductors (not admins or owners)
      const filteredUsers = backendUsers
        .filter(user => user.role === 'manager' || user.role === 'conductor')
        .map(user => ({
          _id: user._id,
          username: user.username,
          role: user.role as 'manager' | 'conductor',
          isActive: user.isActive,
          createdAt: user.createdAt,
          // Handle assignedBuses - could be array of IDs or populated objects
          assignedBuses: (user.assignedBuses || []).map((bus: any) => 
            typeof bus === 'string' ? bus : bus._id
          )
        }));
      
      setUsers(filteredUsers);
      
      // If no users found and no buses available, show helpful message
      if (filteredUsers.length === 0 && buses.length === 0) {
        setError('Please add buses to your fleet first before creating staff members.');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load your staff members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await UserService.toggleUserStatus(userId, !currentStatus);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error toggling user status:', error);
      setError('Failed to update user status. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      await UserService.deleteUser(userId);
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user. Please try again.');
    }
  };

  const filteredUsers = users.filter(user => 
    filter === 'all' || user.role === filter
  );

  const getRoleBadge = (role: User['role']) => {
    switch (role) {
      case 'manager':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'conductor':
        return 'bg-green-100 text-green-800 border border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getUserCountByRole = (role: string) => {
    return users.filter(user => user.role === role).length;
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'manager':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 3L9 7V9L3 13V19H21V13L21 9ZM12 7.8L15.8 9.8L12 11.8L8.2 9.8L12 7.8ZM5 15.1L10 12.4V18H5V15.1ZM19 18H14V12.4L19 15.1V18Z"/>
          </svg>
        );
      case 'conductor':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,8.39C13.57,9.4 15.42,10 17.42,10C18.2,10 18.95,9.91 19.67,9.74C19.88,10.45 20,11.21 20,12C20,16.41 16.41,20 12,20C9,20 6.4,18.4 5.02,15.9L10.18,13.31C11.22,14.77 11.91,16.1 12,16.69C12.27,14.86 13.41,13.19 15.18,12.22L12,8.39Z"/>
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/>
          </svg>
        );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600 text-lg font-medium">
            {authLoading ? 'Authenticating...' : 'Loading users...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-800 p-6 m-6 rounded-r-lg shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="font-bold text-lg">Error Occurred</h3>
                  <p className="mt-1">{error}</p>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="ml-auto text-red-500 hover:text-red-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">Staff Management</h1>
                <p className="text-gray-600 text-sm">
                  Manage your managers and conductors, assign buses
                </p>
              </div>
              <div className="text-3xl text-gray-300">
                👥
              </div>
            </div>
          </div>

          {/* Role Tabs */}
          <div className="bg-white border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {[
                { id: 'all', label: 'ALL STAFF', icon: '👥' },
                { id: 'manager', label: 'MANAGERS', icon: '👨‍💼' },
                { id: 'conductor', label: 'CONDUCTORS', icon: '🚌' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as 'all' | 'manager' | 'conductor')}
                  className={`flex flex-col items-center px-8 py-4 text-base font-medium whitespace-nowrap transition-all duration-200 relative ${
                    filter === tab.id
                      ? 'text-blue-600 bg-blue-50 border-b-3 border-blue-600'
                      : 'text-gray-600 hover:text-blue-500 hover:bg-gray-50'
                  }`}
                >
                  <div className="mb-2 text-2xl">{tab.icon}</div>
                  <div className="font-semibold">{tab.label}</div>
                  <div className={`text-xs mt-1 px-2 py-1 rounded-full ${
                    filter === tab.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {tab.id === 'all' ? users.length : getUserCountByRole(tab.id)} {tab.id === 'all' ? 'total' : tab.id === 'manager' ? 'managers' : 'conductors'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {filter === 'all' ? 'All Staff Members' : 
                   filter === 'manager' ? 'Managers' : 'Conductors'}
                </h2>
                <p className="text-gray-600">
                  {filter === 'all' ? 'View and manage all your staff members' :
                   filter === 'manager' ? 'Manage managers and their permissions' :
                   'Manage conductors and their bus assignments'}
                </p>
              </div>
              
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Staff Member
              </button>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-80 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Staff Members Found</h3>
                <p className="text-gray-500 text-center mb-6">
                  {filter === 'all' 
                    ? 'You haven\'t added any staff members yet.' 
                    : `No ${filter}s found for the selected filter.`
                  }
                </p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Add Your First Staff Member
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Staff Member
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Bus Assignment
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Joined Date
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                  {user.username.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.username}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ID: {user._id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="mr-2 text-gray-600">
                                {getRoleIcon(user.role)}
                              </div>
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getRoleBadge(user.role)}`}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                              user.isActive 
                                ? 'bg-green-100 text-green-800 border border-green-200' 
                                : 'bg-red-100 text-red-800 border border-red-200'
                            }`}>
                              <div className={`w-2 h-2 rounded-full mr-2 mt-0.5 ${
                                user.isActive ? 'bg-green-400' : 'bg-red-400'
                              }`}></div>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.role === 'manager' ? (
                              user.assignedBuses && user.assignedBuses.length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {user.assignedBuses.slice(0, 2).map((busId) => {
                                    const bus = buses.find(b => b._id === busId);
                                    return (
                                      <span key={busId} className="inline-flex px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-md border border-purple-200">
                                        📋 {bus ? bus.busNumber : `Bus-${busId.slice(-4)}`}
                                      </span>
                                    );
                                  })}
                                  {user.assignedBuses.length > 2 && (
                                    <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-md">
                                      +{user.assignedBuses.length - 2} more
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">No buses assigned</span>
                              )
                            ) : (
                              <div className="flex items-center text-blue-600">
                                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-xs italic">Assigned during trips</span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => setEditingUser(user)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                                title="Edit User"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleToggleStatus(user._id, user.isActive)}
                                className={`p-2 rounded-full transition-colors ${
                                  user.isActive 
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                }`}
                                title={user.isActive ? 'Deactivate' : 'Activate'}
                              >
                                {user.isActive ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                              <button 
                                onClick={() => handleDeleteUser(user._id)}
                                className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors"
                                title="Delete User"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <AddUserModal 
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchUsers();
          }}
          buses={buses}
        />
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <EditUserModal 
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            fetchUsers();
          }}
          buses={buses}
        />
      )}
    </div>
  );
}

// Add User Modal Component
function AddUserModal({ onClose, onSuccess, buses }: { onClose: () => void; onSuccess: () => void; buses: Bus[] }) {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'conductor' as BackendUserRole,
    assignedBuses: [] as string[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.password.trim()) {
      setError('Username and password are required');
      return;
    }

    // Validate manager has at least one bus assigned
    if (formData.role === 'manager' && formData.assignedBuses.length === 0) {
      setError('Managers must be assigned to at least one bus');
      return;
    }

    // Clear assigned buses for conductors since they don't need pre-assignment
    const submitData = {
      ...formData,
      assignedBuses: formData.role === 'conductor' ? [] : formData.assignedBuses
    };

    try {
      setLoading(true);
      setError(null);
      await UserService.createUser(submitData);
      onSuccess();
    } catch (error: any) {
      console.error('Error creating user:', error);
      setError(error.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleBusToggle = (busId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedBuses: prev.assignedBuses.includes(busId)
        ? prev.assignedBuses.filter(id => id !== busId)
        : [...prev.assignedBuses, busId]
    }));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-out scale-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Add New Staff Member</h2>
            <p className="text-sm text-gray-500 mt-1">Create a new manager or conductor account</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
          >
            <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Form Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r mb-6">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'manager', label: 'Manager', icon: '👨‍💼', desc: 'Can manage operations and staff' },
                  { value: 'conductor', label: 'Conductor', icon: '🚌', desc: 'Handles ticketing and passenger service' }
                ].map((role) => (
                  <label
                    key={role.value}
                    className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === role.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as BackendUserRole })}
                      className="sr-only"
                    />
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{role.icon}</span>
                      <span className="font-semibold text-gray-900">{role.label}</span>
                    </div>
                    <span className="text-sm text-gray-600">{role.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bus Assignment - Only for Managers */}
            {formData.role === 'manager' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Assign Buses <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-gray-500 block mt-1">
                    Managers can oversee multiple buses and their operations
                  </span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto p-1">
                  {buses.filter(bus => bus.isActive).map((bus) => (
                    <label
                      key={bus._id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.assignedBuses.includes(bus._id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.assignedBuses.includes(bus._id)}
                        onChange={() => handleBusToggle(bus._id)}
                        className="rounded border-gray-300 text-blue-600 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{bus.busNumber}</div>
                        <div className="text-sm text-gray-600">{bus.busName}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {buses.filter(bus => bus.isActive).length === 0 && (
                  <p className="text-gray-500 text-sm italic">No active buses available for assignment</p>
                )}
              </div>
            )}

            {/* Info for Conductors */}
            {formData.role === 'conductor' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">Conductor Assignment</h4>
                    <p className="text-sm text-blue-700">
                      Conductors will be assigned to specific buses during trip scheduling. 
                      No pre-assignment needed at account creation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 font-medium transition-all"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Create Staff Member
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Edit User Modal Component
function EditUserModal({ user, onClose, onSuccess, buses }: { user: User; onClose: () => void; onSuccess: () => void; buses: Bus[] }) {
  const [formData, setFormData] = useState({
    username: user.username,
    role: user.role as BackendUserRole,
    isActive: user.isActive,
    assignedBuses: user.assignedBuses || []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    // Validate manager has at least one bus assigned
    if (formData.role === 'manager' && formData.assignedBuses.length === 0) {
      setError('Managers must be assigned to at least one bus');
      return;
    }

    // Clear assigned buses for conductors since they don't need pre-assignment
    const submitData = {
      ...formData,
      assignedBuses: formData.role === 'conductor' ? [] : formData.assignedBuses
    };

    try {
      setLoading(true);
      setError(null);
      await UserService.updateUser(user._id, submitData);
      onSuccess();
    } catch (error: any) {
      console.error('Error updating user:', error);
      setError(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleBusToggle = (busId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedBuses: prev.assignedBuses.includes(busId)
        ? prev.assignedBuses.filter(id => id !== busId)
        : [...prev.assignedBuses, busId]
    }));
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform transition-all duration-300 ease-out scale-100 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Edit Staff Member</h2>
            <p className="text-sm text-gray-500 mt-1">Update {user.username}'s information</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
          >
            <svg className="h-5 w-5 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Form Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded-r mb-6">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter username"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="flex items-center space-x-4">
                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.isActive ? 'border-green-500 bg-green-50' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      checked={formData.isActive}
                      onChange={() => setFormData({ ...formData, isActive: true })}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                      <span className="font-medium text-green-800">Active</span>
                    </div>
                  </label>
                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    !formData.isActive ? 'border-red-500 bg-red-50' : 'border-gray-200'
                  }`}>
                    <input
                      type="radio"
                      name="status"
                      checked={!formData.isActive}
                      onChange={() => setFormData({ ...formData, isActive: false })}
                      className="sr-only"
                    />
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-400 mr-2"></div>
                      <span className="font-medium text-red-800">Inactive</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'manager', label: 'Manager', icon: '👨‍💼', desc: 'Can manage operations and staff' },
                  { value: 'conductor', label: 'Conductor', icon: '🚌', desc: 'Handles ticketing and passenger service' }
                ].map((role) => (
                  <label
                    key={role.value}
                    className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.role === role.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as BackendUserRole })}
                      className="sr-only"
                    />
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-2">{role.icon}</span>
                      <span className="font-semibold text-gray-900">{role.label}</span>
                    </div>
                    <span className="text-sm text-gray-600">{role.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bus Assignment - Only for Managers */}
            {formData.role === 'manager' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Assign Buses <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-gray-500 block mt-1">
                    Managers can oversee multiple buses and their operations
                  </span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-40 overflow-y-auto p-1">
                  {buses.filter(bus => bus.isActive).map((bus) => (
                    <label
                      key={bus._id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                        formData.assignedBuses.includes(bus._id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.assignedBuses.includes(bus._id)}
                        onChange={() => handleBusToggle(bus._id)}
                        className="rounded border-gray-300 text-blue-600 mr-3"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{bus.busNumber}</div>
                        <div className="text-sm text-gray-600">{bus.busName}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {buses.filter(bus => bus.isActive).length === 0 && (
                  <p className="text-gray-500 text-sm italic">No active buses available for assignment</p>
                )}
              </div>
            )}

            {/* Info for Conductors */}
            {formData.role === 'conductor' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <svg className="h-5 w-5 text-blue-400 mt-0.5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-800 mb-1">Conductor Assignment</h4>
                    <p className="text-sm text-blue-700">
                      Conductors will be assigned to specific buses during trip scheduling. 
                      No pre-assignment needed at account creation.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-100 hover:border-gray-400 font-medium transition-all"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    Update Staff Member
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
