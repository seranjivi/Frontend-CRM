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
import { ChevronDown, Check } from 'lucide-react';
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
    roles: [],
    roleNames: [],
    status: 'active', // Default to active
    assigned_regions: [],
  });

  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  /* ------------------ INIT FORM DATA ------------------ */

  // In UserForm.js, update the useEffect that initializes form data
useEffect(() => {
  if (user) {
    // Normalize status to match the expected values
    const normalizedStatus = user.status 
      ? user.status.trim().toLowerCase() === 'inactive' ? 'inactive' : 'active'
      : 'active';
    
    // Handle both array and single role cases
    const roleNames = user.roleNames || 
                     (Array.isArray(user.roles) ? user.roles : []);
    
    setFormData({
      full_name: user.full_name || user.name || '',
      email: user.email || '',
      roles: roleNames, // Use the role names directly
      roleNames: roleNames,
      status: normalizedStatus,
      assigned_regions: Array.isArray(user.assigned_regions)
        ? user.assigned_regions
        : (Array.isArray(user.regions) ? user.regions.map(r => r.id || r) : [])
    });
  }
}, [user, availableRoles]);
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

  const toggleRole = (role) => {
    setFormData(prev => {
      const roleIndex = prev.roles.indexOf(role.id);
      let newRoles, newRoleNames;
      
      if (roleIndex === -1) {
        // Add role
        newRoles = [...prev.roles, role.id];
        newRoleNames = [...prev.roleNames, role.name];
      } else {
        // Remove role
        newRoles = prev.roles.filter(id => id !== role.id);
        newRoleNames = prev.roleNames.filter(name => name !== role.name);
      }
      
      return {
        ...prev,
        roles: newRoles,
        roleNames: newRoleNames
      };
    });
  };
  
  const isRoleSelected = (roleId) => {
    return formData.roles.includes(roleId);
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
      roles: formData.roleNames,
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

        <div className="relative">
          <Label>Access Roles</Label>
          <div 
            className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 cursor-pointer"
            onClick={() => !loadingRoles && setIsRoleDropdownOpen(!isRoleDropdownOpen)}
          >
            <span className="text-muted-foreground">
              {formData.roleNames.length > 0 
                ? formData.roleNames.join(', ')
                : 'Select roles'}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
          
          {isRoleDropdownOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80">
              <div className="p-1 max-h-60 overflow-auto">
                {availableRoles.map((role) => (
                  <div 
                    key={role.id}
                    className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleRole(role);
                    }}
                  >
                    <span className={`absolute left-2 flex h-3.5 w-3.5 items-center justify-center ${isRoleSelected(role.id) ? 'opacity-100' : 'opacity-0'}`}>
                      <Check className="h-4 w-4" />
                    </span>
                    {role.name}
                  </div>
                ))}
                {availableRoles.length === 0 && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No roles available
                  </div>
                )}
              </div>
            </div>
          )}
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
