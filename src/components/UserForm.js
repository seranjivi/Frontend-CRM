import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import roleService from '../services/roleService';

/* ------------------ CONSTANTS ------------------ */

const REGIONS = [
  { id: 1, name: 'Atlantic' },
  { id: 2, name: 'Asia Pacific' },
  { id: 3, name: 'Europe' },
  { id: 4, name: 'North America' },
  { id: 5, name: 'South America' },
  { id: 6, name: 'Middle East' },
  { id: 7, name: 'Africa' },
  { id: 8, name: 'Oceania' },
];

/* ------------------ COMPONENT ------------------ */

const UserForm = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: '',
    roleName: '',
    status: 'active', // Default to active
    assigned_regions: [],
  });

  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);

  /* ------------------ INIT FORM DATA ------------------ */

  useEffect(() => {
    if (user) {
      // Normalize status to match the expected values in the Select component
      const normalizedStatus = user.status 
        ? user.status.trim().toLowerCase() === 'inactive' ? 'inactive' : 'active'
        : 'active';
      
      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        role: user.role_id || '',
        roleName: user.role || '',
        status: normalizedStatus,
        assigned_regions: Array.isArray(user.regions)
          ? user.regions.map((r) => r.id)
          : [],
      });
    }
  }, [user]);

  /* ------------------ FETCH ROLES ------------------ */

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);
        const res = await roleService.getRoles();
        const roles = res?.data || res || [];
        setAvailableRoles(roles);

        if (user) {
          const matchedRole = roles.find(
            (r) => r.id === user.role_id || r.name === user.role
          );
          if (matchedRole) {
            setFormData((prev) => ({
              ...prev,
              role: matchedRole.id,
              roleName: matchedRole.name,
            }));
          }
        }
      } catch (err) {
        toast.error('Failed to load roles');
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, [user]);

  /* ------------------ HANDLERS ------------------ */

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value) => {
    const selected = availableRoles.find(
      (r) => r.id.toString() === value
    );
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        role: selected.id,
        roleName: selected.name,
      }));
    }
  };

  const handleRegionChange = (regionId, checked) => {
    setFormData((prev) => ({
      ...prev,
      assigned_regions: checked
        ? [...prev.assigned_regions, regionId]
        : prev.assigned_regions.filter((id) => id !== regionId),
    }));
  };

  /* ------------------ SUBMIT ------------------ */

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      full_name: formData.full_name,
      email: formData.email,
      role: formData.roleName,
      status: formData.status, // ✅ active / inactive
      regions: formData.assigned_regions,
    };

    try {
      if (user) {
        await api.put(`/users/${user.id}`, payload);
        toast.success('User updated successfully');
      } else {
        await api.post('/users', payload);
        toast.success('User created successfully');
      }
      onClose();
    } catch (err) {
      toast.error('Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ UI ------------------ */

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-center text-xl font-bold">
        EMPLOYEE PROFILE & PERMISSIONS
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label>Full Name</Label>
          <Input
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label>Email</Label>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <Label>Access Role</Label>
          <Select
            value={formData.role?.toString()}
            onValueChange={handleRoleChange}
            disabled={loadingRoles}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map((r) => (
                <SelectItem key={r.id} value={r.id.toString()}>
                  {r.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Status</Label>
          <Select
            value={formData.status}
            onValueChange={(v) =>
              setFormData((p) => ({ ...p, status: v }))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Assigned Regions</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          {REGIONS.map((r) => (
            <div key={r.id} className="flex items-center gap-2">
              <Checkbox
                checked={formData.assigned_regions.includes(r.id)}
                onCheckedChange={(c) =>
                  handleRegionChange(r.id, c)
                }
              />
              <span>{r.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading}
          className="bg-[#0A2A43] hover:bg-[#0A2A43]/90 text-white"
        >
          {loading ? 'Saving...' : (user ? 'Update' : 'Create User')}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
