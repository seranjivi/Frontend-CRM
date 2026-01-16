import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';

const REGIONS = [
  'Atlantic',
  'Asia Pacific',
  'Europe',
  'North America',
  'South America',
  'Middle East',
  'Africa',
  'Oceania'
];

const ROLES = [
  'Super Admin',
  'Admin / Founder',
  'Presales Consultant',
  'Presales Lead',
  'Presales Manager',
  'Sales Head',
  'Delivery Manager'
];

const UserForm = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'Presales Consultant',
    status: 'Active',
    assigned_regions: [],
  });
  const [loading, setLoading] = useState(false);
  const [availableRoles, setAvailableRoles] = useState([]);

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role || 'Presales Consultant',
        status: user.status || 'Active',
        assigned_regions: user.assigned_regions || [],
      });
    }
    
    // Fetch available roles
    fetchRoles();
  }, [user]);

  const fetchRoles = async () => {
    try {
      const response = await api.get('/users/roles/config');
      setAvailableRoles(Object.keys(response.data));
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      // Fallback to hardcoded roles
      setAvailableRoles(ROLES);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleRegionChange = (region, checked) => {
    setFormData((prev) => {
      const newRegions = checked
        ? [...prev.assigned_regions, region]
        : prev.assigned_regions.filter(r => r !== region);
      return { ...prev, assigned_regions: newRegions };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('Submitting user form:', formData);

    // Validate required fields
    if (!formData.full_name || !formData.email) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      if (user) {
        await api.put(`/users/${user.id}`, formData);
        toast.success('User updated successfully');
      } else {
        await api.post('/users', formData);
        toast.success('User created successfully. Invitation email sent.');
      }
      onClose();
    } catch (error) {
      console.error('User form error:', error);
      toast.error(error.response?.data?.detail || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">EMPLOYEE PROFILE & PERMISSIONS</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="full_name">Full Name</Label>
          <Input
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            placeholder="Enter full name"
            required
            data-testid="user-full-name-input"
          />
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter email address"
            required
            data-testid="user-email-input"
          />
        </div>
        <div>
          <Label htmlFor="role">Access Role</Label>
          <Select
            value={formData.role}
            onValueChange={handleRoleChange}
            data-testid="user-role-select"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role..." />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((role) => (
                <SelectItem key={role} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Current Status</Label>
          <Select
            value={formData.status}
            onValueChange={handleStatusChange}
            data-testid="user-status-select"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Assigned Regions (SELECT MULTIPLE)</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {REGIONS.map((region) => (
            <div key={region} className="flex items-center space-x-2">
              <Checkbox
                id={`region-${region}`}
                checked={formData.assigned_regions.includes(region)}
                onCheckedChange={(checked) => handleRegionChange(region, checked)}
              />
              <Label
                htmlFor={`region-${region}`}
                className="text-sm font-normal cursor-pointer"
              >
                {region}
              </Label>
            </div>
          ))}
        </div>
        {formData.assigned_regions.length > 0 && (
          <div className="mt-3 text-sm text-slate-600">
            Selected regions: {formData.assigned_regions.join(', ')}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          data-testid="user-form-cancel"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          data-testid="user-form-submit"
          className="bg-[#0A2A43] hover:bg-[#0A2A43]/90"
        >
          {loading ? 'Saving...' : user ? 'Update' : 'Create User'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
