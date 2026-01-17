import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import DataTable from '../components/DataTable';
import UserForm from '../components/UserForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';
import * as userService from '../services/userService';


const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

const fetchUsers = async () => {
  try {
    const response = await userService.getUsers();
    // Ensure we're working with an array
    const usersData = Array.isArray(response) ? response : 
                     (response?.data ? response.data : []);
    setUsers(usersData);
  } catch (error) {
    console.error('Error fetching users:', error);
    toast.error('Failed to fetch users');
    setUsers([]); // Ensure we set an empty array on error
  } finally {
    setLoading(false);
  }
};

  const handleDelete = async (user) => {
  if (window.confirm(`Are you sure you want to delete ${user.full_name}?`)) {
    try {
      await userService.deleteUser(user.id);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  }
};

  const handleEdit = async (user) => {
    try {
      console.log('Starting to edit user:', user);
      const response = await userService.getUserById(user.id);
      const userData = response.data;  // Extract data from response
      console.log('Raw user data from API:', userData);
      
      // Transform the data to match the expected format
      const formattedUser = {
        ...userData,
        full_name: userData.full_name || userData.name || '',
        email: userData.email || '',
        role: userData.role_id || userData.role?.id || '',
        role_id: userData.role_id || userData.role?.id || '',
        role_name: userData.role_name || userData.role?.name || '',
        status: (userData.status || 'active').toLowerCase(),
        regions: userData.regions || userData.assigned_regions || [],
        id: userData.id || user.id
      };
      
      console.log('Formatted user data for edit:', formattedUser);
      setEditingUser(formattedUser);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to fetch user details');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUser(null);
    fetchUsers();
  };

  const handleToggleStatus = async (user, newStatus) => {
  try {
    await userService.toggleUserStatus(user.id, newStatus);
    toast.success(`User ${newStatus.toLowerCase()}d successfully`);
    fetchUsers();
  } catch (error) {
    console.error(`Error toggling user status:`, error);
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
        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-700">
          {value}
        </span>
      ),
    },
    {
      key: 'assigned_regions',
      header: 'Assigned Regionss',
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
      render: (value) => {
        const displayStatus = value ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() : '';
        const isActive = value?.toLowerCase() === 'active';
        return (
          <span className={`text-sm font-medium px-2 py-1 rounded ${
            isActive 
              ? 'bg-[#E0FFF6] text-[#00B69B]' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {displayStatus}
          </span>
        );
      },
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

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  // Apply filters to users
  const filteredUsers = users.filter(user => {
    if (activeFilters.status && user.status !== activeFilters.status) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4" data-testid="user-management-page">
      <DataTable
        title="User Management"
        data={filteredUsers}
        columns={columns}
        showEdit={false}
        onDelete={handleDelete}
        testId="users-table"
        filterOptions={[
          {
            key: 'status',
            placeholder: 'All Status',
            options: [
              { value: undefined, label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' }
            ]
          }
        ]}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onCreateNew={() => {
          setEditingUser(null);
          setShowForm(true);
        }}
        customActions={(user) => (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(user);
              }}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(user);
              }}
              className="h-8 w-8 p-0 hover:bg-red-50 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        )}
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          </DialogHeader>
          <UserForm user={editingUser} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
