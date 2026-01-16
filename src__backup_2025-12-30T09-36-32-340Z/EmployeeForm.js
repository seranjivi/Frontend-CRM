import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import DateField from './DateField';

const EmployeeForm = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'SalesRep',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        password: '', // Don't pre-fill password for security
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // For updates, only send fields that are filled
        const updateData = {
          email: formData.email,
          full_name: formData.full_name,
          role: formData.role,
        };
        // Only include password if it's been changed
        if (formData.password) {
          updateData.password = formData.password;
        }
        await api.put(`/users/${user.id}`, updateData);
        toast.success('Employee updated successfully');
      } else {
        // For new users, password is required
        if (!formData.password) {
          toast.error('Password is required for new employees');
          setLoading(false);
          return;
        }
        await api.post('/users', formData);
        toast.success('Employee created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save employee');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="full_name">Full Name *</Label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
            data-testid="employee-name-input"
          />
        </div>
        <DateField createdAt={user?.created_at} isNew={!user} />
        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            data-testid="employee-email-input"
          />
        </div>
        <div>
          <Label htmlFor="role">Role *</Label>
          <Select
            name="role"
            value={formData.role}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, role: value }))}
          >
            <SelectTrigger data-testid="employee-role-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Manager">Manager</SelectItem>
              <SelectItem value="SalesRep">Sales Representative</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="password">
            Password {user ? '(leave blank to keep current)' : '*'}
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required={!user}
            data-testid="employee-password-input"
            placeholder={user ? 'Enter new password to change' : 'Enter password'}
          />
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> {user ? 'Updating an employee will modify their access rights. Leave password blank to keep the current password.' : 'The new employee will be able to log in with the provided email and password.'}
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} data-testid="employee-form-cancel">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          data-testid="employee-form-submit"
          className="bg-[#0A2A43] hover:bg-[#0A2A43]/90"
        >
          {loading ? 'Saving...' : user ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;