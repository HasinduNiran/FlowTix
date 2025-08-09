'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import UserTable from '@/components/admin/UserTable';
import UserModal from '@/components/admin/UserModal';
import { UserService, CreateUserRequest } from '@/services/user.service';
import { BackendUser } from '@/types/auth';

export default function UsersPage() {
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<BackendUser | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [usersByRole, setUsersByRole] = useState<Record<string, number>>({});
  const itemsPerPage = 15;
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  
  // Toast state
  const [toast, setToast] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    show: false,
    title: '',
    message: '',
    type: 'info'
  });

  const showToast = (title: string, message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({ show: true, title, message, type });
  };

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers(1);
  }, []);

  // Fetch users when page changes
  useEffect(() => {
    if (currentPage >= 1) {
      fetchUsers(currentPage);
    }
  }, [currentPage]);

  // Reset to page 1 when role filter changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      fetchUsers(1);
    }
  }, [filterRole]);

  // Handle search term changes with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage !== 1) {
        setCurrentPage(1);
      } else {
        fetchUsers(1);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchUsers = async (page: number = 1) => {
    try {
      setLoading(true);
      const filters = {
        role: filterRole,
        search: searchTerm
      };
      
      const [result, countsData] = await Promise.all([
        UserService.getUsersWithPagination(page, itemsPerPage, filters),
        UserService.getAllUsersCount()
      ]);
      
      setUsers(result.users);
      setCurrentPage(result.currentPage);
      setTotalPages(result.totalPages);
      setTotalUsers(countsData.totalUsers);
      setUsersByRole(countsData.usersByRole);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      showToast('Error', 'Failed to fetch users. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      setActionLoading(true);
      const newUser = await UserService.createUser(userData);
      showToast('Success', 'User created successfully', 'success');
      closeModals();
      fetchUsers(currentPage); // Refresh current page
    } catch (error: any) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create user';
      showToast('Error', errorMessage, 'error');
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async (userData: any) => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      const updatedUser = await UserService.updateUser(selectedUser._id, userData);
      showToast('Success', 'User updated successfully', 'success');
      closeModals();
      fetchUsers(currentPage); // Refresh current page
    } catch (error: any) {
      console.error('Error updating user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user';
      showToast('Error', errorMessage, 'error');
      throw error; // Re-throw to prevent modal from closing
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: BackendUser) => {
    try {
      const newStatus = !user.isActive;
      const updatedUser = await UserService.toggleUserStatus(user._id, newStatus);
      showToast('Success', `User ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
      fetchUsers(currentPage); // Refresh current page
    } catch (error: any) {
      console.error('Error toggling user status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user status';
      showToast('Error', errorMessage, 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      setActionLoading(true);
      await UserService.deleteUser(selectedUser._id);
      closeModals();
      showToast('Success', 'User deleted successfully', 'success');
      fetchUsers(currentPage); // Refresh current page
    } catch (error: any) {
      console.error('Error deleting user:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete user';
      showToast('Error', errorMessage, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (user: BackendUser) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const openDeleteModal = (user: BackendUser) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setSelectedUser(null);
  };

  const handleRefresh = () => {
    fetchUsers(currentPage);
    showToast('Info', 'Refreshing users...', 'info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header Section */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-1">User Management</h1>
                <p className="text-gray-600 text-sm">
                  Manage system users and their permissions across all roles
                </p>
              </div>
              <div className="text-3xl text-gray-300">
                👥
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  System Users
                </h2>
                <p className="text-gray-600">
                  View and manage all users in the system
                </p>
              </div>
              
              <div className="flex items-center gap-4 w-full lg:w-auto">
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={loading}
                  className="px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Refresh
                </Button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-3 whitespace-nowrap"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add User
                </button>
              </div>
            </div>

            {/* Filters Section */}
            <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-grow lg:w-80">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                  />
                </div>
                
                <div className="relative flex-grow lg:w-80">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value)}
                    className="pl-12 pr-4 py-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white appearance-none cursor-pointer"
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                    <option value="manager">Manager</option>
                    <option value="conductor">Conductor</option>
                  </select>
                </div>

                {(searchTerm || filterRole) && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setFilterRole('');
                    }}
                    className="px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-all flex items-center gap-2 whitespace-nowrap"
                  >
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Clear Filters
                  </button>
                )}
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                Showing {users.length} of {totalUsers} users
                {totalPages > 1 && <span> • Page {currentPage} of {totalPages}</span>}
                {searchTerm && <span> • Filtered by: "{searchTerm}"</span>}
                {filterRole && <span> • Role: {filterRole}</span>}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-full">
                  <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-blue-800 font-medium text-lg">
                  Showing {users.length} of {totalUsers} users (Page {currentPage} of {totalPages})
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {users.filter(u => u.isActive).length}
                  </div>
                  <div className="text-sm text-blue-700 font-medium">Active (Current Page)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {usersByRole.admin || 0}
                  </div>
                  <div className="text-sm text-purple-700 font-medium">Total Admins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {usersByRole.owner || 0}
                  </div>
                  <div className="text-sm text-green-700 font-medium">Total Bus Owners</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {usersByRole.conductor || 0}
                  </div>
                  <div className="text-sm text-orange-700 font-medium">Total Conductors</div>
                </div>
              </div>
            </div>

            {/* Users Table */}
            {users.length > 0 ? (
              <UserTable
                users={users}
                loading={loading}
                onEdit={openEditModal}
                onToggleStatus={handleToggleUserStatus}
                onDelete={openDeleteModal}
              />
            ) : !loading ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {searchTerm || filterRole ? 'No matching users found' : 'No Users Found'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || filterRole 
                      ? 'Try adjusting your search criteria or filters to find users.'
                      : 'No users exist in the system yet. Create the first user to get started.'
                    }
                  </p>
                  {!searchTerm && !filterRole && (
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mx-auto"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add User
                    </button>
                  )}
                </div>
              </div>
            ) : null}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 px-4 py-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center text-sm text-gray-700">
                  <span>
                    Showing page {currentPage} of {totalPages} ({itemsPerPage} items per page)
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            currentPage === page
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    {totalPages > 5 && (
                      <>
                        <span className="px-2 py-2 text-gray-500">...</span>
                        <button
                          onClick={() => handlePageChange(totalPages)}
                          className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                            currentPage === totalPages
                              ? 'bg-blue-600 text-white'
                              : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Create User Modal */}
            {showCreateModal && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    closeModals();
                  }
                }}
              >
                <div 
                  className="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all duration-300 ease-out scale-100 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <UserModal
                    isOpen={showCreateModal}
                    onClose={closeModals}
                    onSave={handleCreateUser}
                    title="Create New User"
                  />
                </div>
              </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
              <div 
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    closeModals();
                  }
                }}
              >
                <div 
                  className="bg-white rounded-xl shadow-xl w-full max-w-lg transform transition-all duration-300 ease-out scale-100 max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  <UserModal
                    isOpen={showEditModal}
                    onClose={closeModals}
                    onSave={handleEditUser}
                    user={selectedUser}
                    title="Edit User"
                  />
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
              isOpen={showDeleteModal}
              onClose={closeModals}
              onConfirm={handleDeleteUser}
              title="Delete User"
              message={`Are you sure you want to delete user "${selectedUser?.username}"? This action cannot be undone.`}
              confirmText="Delete"
              cancelText="Cancel"
              type="danger"
              isLoading={actionLoading}
            />

            {/* Toast Notifications */}
            <Toast
              isOpen={toast.show}
              onClose={() => setToast(prev => ({ ...prev, show: false }))}
              title={toast.title}
              message={toast.message}
              type={toast.type}
            />
          </div>
        </div>
      </div>
    </div>
  );
}