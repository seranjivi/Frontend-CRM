import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import DataTable from '../components/DataTable';
import UserForm from '../components/UserForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      console.log('Fetching users from UserManagement page...');
      console.log('API URL:', process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000/api');
      
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token length:', token ? token.length : 0);
      
      const response = await api.get('/users');
      console.log('Users API response status:', response.status);
      console.log('Users API response:', response);
      console.log('Users data:', response.data);
      console.log('Number of users:', response.data.length);
      
      // Check status field for each user
      response.data.forEach(user => {
        console.log(`User: ${user.full_name}, Status: "${user.status}"`);
      });
      
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (user) => {
    if (window.confirm(`Are you sure you want to delete ${user.full_name}?`)) {
      try {
        await api.delete(`/users/${user.id}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUser(null);
    fetchUsers();
  };

  const handleToggleStatus = async (user, newStatus) => {
    try {
      const endpoint = newStatus === 'Active' ? 'activate' : 'deactivate';
      await api.post(`/users/${user.id}/${endpoint}`);
      toast.success(`User ${newStatus.toLowerCase()}d successfully`);
      fetchUsers();
    } catch (error) {
      toast.error(`Failed to ${newStatus.toLowerCase()} user`);
    }
  };

  const columns = [
    { key: 'full_name', header: 'Full Name' },
    { key: 'email', header: 'Email Address' },
    { 
      key: 'role', 
      header: 'Access Role',
      render: (value) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {value}
        </span>
      ),
    },
    {
      key: 'assigned_regions',
      header: 'Assigned Regions',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value && value.length > 0 ? (
            value.map((region, index) => (
              <span key={index} className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                {region}
              </span>
            ))
          ) : (
            <span className="text-xs text-gray-500">No regions assigned</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {value}
        </span>
      ),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (value) => <span className="text-xs text-slate-700">{formatDate(value)}</span>
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6AA6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="user-management-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Manrope']">User Management</h1>
          <p className="text-sm text-slate-600 mt-0.5">Manage user accounts and permissions</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          data-testid="add-user-btn"
          className="bg-[#0A2A43] hover:bg-[#0A2A43]/90 h-9 text-sm"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add User
        </Button>
      </div>

      <DataTable
        data={users}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        filterOptions={{}}
        testId="users-table"
        customActions={(user) => (
          <div className="flex gap-2">
            {user.status === 'Active' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleStatus(user, 'Inactive')}
                className="text-red-600 hover:text-red-700"
              >
                <UserX className="h-3 w-3 mr-1" />
                Deactivate
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleToggleStatus(user, 'Active')}
                className="text-green-600 hover:text-green-700"
              >
                <UserCheck className="h-3 w-3 mr-1" />
                Activate
              </Button>
            )}
          </div>
        )}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Register Member'}</DialogTitle>
          </DialogHeader>
          <UserForm user={editingUser} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
