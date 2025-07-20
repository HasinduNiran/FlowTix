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

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const fetchedUsers = await UserService.getAllUsers();
      setUsers(fetchedUsers);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      showToast('Error', 'Failed to fetch users. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (userData: CreateUserRequest) => {
    try {
      setActionLoading(true);
      const newUser = await UserService.createUser(userData);
      setUsers(prev => [...prev, newUser]);
      showToast('Success', 'User created successfully', 'success');
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
      setUsers(prev => 
        prev.map(user => user._id === selectedUser._id ? updatedUser : user)
      );
      showToast('Success', 'User updated successfully', 'success');
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
      setUsers(prev => 
        prev.map(u => u._id === user._id ? updatedUser : u)
      );
      showToast('Success', `User ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
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
      setUsers(prev => prev.filter(user => user._id !== selectedUser._id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      showToast('Success', 'User deleted successfully', 'success');
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
    fetchUsers();
    showToast('Info', 'Refreshing users...', 'info');
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
          <p className="text-gray-600 mt-1">Manage system users and their permissions</p>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            Create User
          </Button>
        </div>
      </div>

      <div className="mb-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {users.filter(u => u.isActive).length}
              </div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {users.filter(u => u.role === 'admin').length}
              </div>
              <div className="text-sm text-gray-600">Admins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => u.role === 'owner').length}
              </div>
              <div className="text-sm text-gray-600">Bus Owners</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {users.filter(u => u.role === 'conductor').length}
              </div>
              <div className="text-sm text-gray-600">Conductors</div>
            </div>
          </div>
        </div>
      </div>

      <UserTable
        users={users}
        loading={loading}
        onEdit={openEditModal}
        onToggleStatus={handleToggleUserStatus}
        onDelete={openDeleteModal}
      />

      {/* Create User Modal */}
      <UserModal
        isOpen={showCreateModal}
        onClose={closeModals}
        onSave={handleCreateUser}
        title="Create New User"
      />

      {/* Edit User Modal */}
      <UserModal
        isOpen={showEditModal}
        onClose={closeModals}
        onSave={handleEditUser}
        user={selectedUser}
        title="Edit User"
      />

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
  );
}