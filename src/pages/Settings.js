import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Switch } from '../components/ui/switch';
import { Plus, X, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSettings, setEditingSettings] = useState({});
  
  // User Roles state
  const [roles, setRoles] = useState([
    { id: '1', name: 'Admin', description: 'Full access to all modules and settings', defaultAccess: 'Full access' },
    { id: '2', name: 'Sales', description: 'Access to Leads, Opportunities, Clients, SOW', defaultAccess: 'Read/Write: Leads, Opportunities, Clients, SOW' },
    { id: '3', name: 'Presales', description: 'Limited access to pre-sales activities', defaultAccess: 'Read/Write: Opportunities, SOW; Read: Leads' },
    { id: '4', name: 'Delivery', description: 'Project delivery and execution', defaultAccess: 'Read/Write: SOW, Activities' },
    { id: '5', name: 'Viewer', description: 'Read-only access to all modules', defaultAccess: 'Read-only access' },
  ]);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  
  // Currency Settings state
  const [currencySettings, setCurrencySettings] = useState({
    defaultCurrency: 'USD',
    multiCurrencyEnabled: false,
  });
  
  // Company Profile state
  const [companyProfile, setCompanyProfile] = useState({
    companyName: 'SightSpectrum',
    companyLogo: 'https://customer-assets.emergentagent.com/job_4424ce99-107e-4271-9ac9-bef9add8255c/artifacts/7ou0bag7_download.jpg',
    address: '',
    contactEmail: '',
    contactPhone: '',
  });

  useEffect(() => {
    fetchSettings();
    loadCurrencySettings();
    loadCompanyProfile();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data);
      
      // Initialize editing state
      const editState = {};
      response.data.forEach(setting => {
        editState[setting.setting_type] = {
          values: [...setting.values],
          newValue: ''
        };
      });
      setEditingSettings(editState);
    } catch (error) {
      toast.error('Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrencySettings = () => {
    const saved = localStorage.getItem('currencySettings');
    if (saved) {
      setCurrencySettings(JSON.parse(saved));
    }
  };

  const loadCompanyProfile = () => {
    const saved = localStorage.getItem('companyProfile');
    if (saved) {
      setCompanyProfile(JSON.parse(saved));
    }
  };

  const handleAddValue = (settingType) => {
    const newValue = editingSettings[settingType]?.newValue?.trim();
    if (!newValue) {
      toast.error('Please enter a value');
      return;
    }

    setEditingSettings(prev => ({
      ...prev,
      [settingType]: {
        ...prev[settingType],
        values: [...prev[settingType].values, newValue],
        newValue: ''
      }
    }));
  };

  const handleRemoveValue = (settingType, valueIndex) => {
    setEditingSettings(prev => ({
      ...prev,
      [settingType]: {
        ...prev[settingType],
        values: prev[settingType].values.filter((_, idx) => idx !== valueIndex)
      }
    }));
  };

  const handleSave = async (settingType) => {
    try {
      const values = editingSettings[settingType].values;
      await api.put(`/settings/${settingType}`, { values });
      toast.success('Settings updated successfully');
      fetchSettings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update settings');
    }
  };

  // Role Management
  const handleAddRole = () => {
    setEditingRole(null);
    setShowRoleForm(true);
  };

  const handleEditRole = (role) => {
    setEditingRole(role);
    setShowRoleForm(true);
  };

  const handleDeleteRole = (roleId) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      setRoles(roles.filter(r => r.id !== roleId));
      toast.success('Role deleted successfully');
    }
  };

  const handleSaveRole = (roleData) => {
    if (editingRole) {
      setRoles(roles.map(r => r.id === editingRole.id ? { ...editingRole, ...roleData } : r));
      toast.success('Role updated successfully');
    } else {
      setRoles([...roles, { ...roleData, id: Date.now().toString() }]);
      toast.success('Role created successfully');
    }
    setShowRoleForm(false);
    setEditingRole(null);
  };

  // Currency Settings
  const handleSaveCurrencySettings = () => {
    localStorage.setItem('currencySettings', JSON.stringify(currencySettings));
    toast.success('Currency settings saved successfully');
  };

  // Company Profile
  const handleSaveCompanyProfile = () => {
    localStorage.setItem('companyProfile', JSON.stringify(companyProfile));
    toast.success('Company profile saved successfully');
  };

  const settingTitles = {
    lead_stages: 'Lead Stages',
    opportunity_stages: 'Opportunity Stages',
    regions: 'Regions',
    industries: 'Industries',
    lead_sources: 'Lead Sources',
    currencies: 'Currencies'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6AA6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 font-['Manrope']">Settings</h1>
        <p className="text-slate-600 mt-1">Configure system settings and preferences</p>
      </div>

      {/* Company Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>Manage your company information and branding</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={companyProfile.companyName}
                onChange={(e) => setCompanyProfile({ ...companyProfile, companyName: e.target.value })}
                placeholder="Enter company name"
                data-testid="company-name-input"
              />
            </div>
            <div>
              <Label htmlFor="companyLogo">Company Logo URL</Label>
              <Input
                id="companyLogo"
                value={companyProfile.companyLogo}
                onChange={(e) => setCompanyProfile({ ...companyProfile, companyLogo: e.target.value })}
                placeholder="https://..."
                data-testid="company-logo-input"
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={companyProfile.contactEmail}
                onChange={(e) => setCompanyProfile({ ...companyProfile, contactEmail: e.target.value })}
                placeholder="contact@company.com"
                data-testid="company-email-input"
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={companyProfile.contactPhone}
                onChange={(e) => setCompanyProfile({ ...companyProfile, contactPhone: e.target.value })}
                placeholder="+1 (555) 123-4567"
                data-testid="company-phone-input"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={companyProfile.address}
              onChange={(e) => setCompanyProfile({ ...companyProfile, address: e.target.value })}
              placeholder="Company address..."
              rows={3}
              data-testid="company-address-input"
            />
          </div>
          <Button
            onClick={handleSaveCompanyProfile}
            className="bg-[#0A2A43] hover:bg-[#0A2A43]/90"
            data-testid="save-company-profile-btn"
          >
            Save Company Profile
          </Button>
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Currency Settings</CardTitle>
          <CardDescription>Configure default currency and multi-currency options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Select
                value={currencySettings.defaultCurrency}
                onValueChange={(value) => setCurrencySettings({ ...currencySettings, defaultCurrency: value })}
              >
                <SelectTrigger data-testid="default-currency-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                  <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                  <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500 mt-1">
                This currency will be used across Dashboard, SOW, and Opportunities
              </p>
            </div>
            <div>
              <Label htmlFor="multiCurrency">Multi-Currency Support</Label>
              <div className="flex items-center space-x-2 mt-2">
                <Switch
                  id="multiCurrency"
                  checked={currencySettings.multiCurrencyEnabled}
                  disabled
                  data-testid="multi-currency-toggle"
                />
                <span className="text-sm text-slate-500">Enable multi-currency (coming soon)</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Allow users to work with multiple currencies simultaneously
              </p>
            </div>
          </div>
          <Button
            onClick={handleSaveCurrencySettings}
            className="bg-[#0A2A43] hover:bg-[#0A2A43]/90"
            data-testid="save-currency-settings-btn"
          >
            Save Currency Settings
          </Button>
        </CardContent>
      </Card>

      {/* User Roles & Permissions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>User Roles & Permissions</CardTitle>
              <CardDescription>Manage user roles and their access levels</CardDescription>
            </div>
            <Button
              onClick={handleAddRole}
              size="sm"
              className="bg-[#0A2A43] hover:bg-[#0A2A43]/90"
              data-testid="add-role-btn"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Role
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Role Name</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Default Access</TableHead>
                  <TableHead className="font-semibold w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.description}</TableCell>
                    <TableCell className="text-sm text-slate-600">{role.defaultAccess}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditRole(role)}
                          className="h-8 w-8 p-0 text-[#2C6AA6] hover:bg-[#2C6AA6]/10"
                          title="Edit"
                          data-testid={`edit-role-${role.id}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRole(role.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                          title="Delete"
                          data-testid={`delete-role-${role.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Existing Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settings.map((setting) => (
          <Card key={setting.setting_type}>
            <CardHeader>
              <CardTitle className="text-lg">
                {settingTitles[setting.setting_type] || setting.setting_type.replace('_', ' ')}
              </CardTitle>
              <CardDescription>Manage {settingTitles[setting.setting_type]?.toLowerCase() || setting.setting_type} options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Values */}
              <div className="flex flex-wrap gap-2">
                {editingSettings[setting.setting_type]?.values.map((value, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-100 rounded-full text-sm"
                  >
                    <span>{value}</span>
                    <button
                      onClick={() => handleRemoveValue(setting.setting_type, idx)}
                      className="text-red-600 hover:text-red-700"
                      data-testid={`remove-${setting.setting_type}-${idx}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Value */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add new value"
                  value={editingSettings[setting.setting_type]?.newValue || ''}
                  onChange={(e) =>
                    setEditingSettings(prev => ({
                      ...prev,
                      [setting.setting_type]: {
                        ...prev[setting.setting_type],
                        newValue: e.target.value
                      }
                    }))
                  }
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddValue(setting.setting_type);
                    }
                  }}
                  data-testid={`add-input-${setting.setting_type}`}
                />
                <Button
                  size="sm"
                  onClick={() => handleAddValue(setting.setting_type)}
                  data-testid={`add-btn-${setting.setting_type}`}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Save Button */}
              <Button
                onClick={() => handleSave(setting.setting_type)}
                className="w-full bg-[#0A2A43] hover:bg-[#0A2A43]/90"
                data-testid={`save-btn-${setting.setting_type}`}
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>Company Profile: Update your organization details and branding</li>
            <li>Currency Settings: Select default currency for financial values across the CRM</li>
            <li>User Roles: Define and manage access levels for different user types</li>
            <li>Dropdown Settings: Add or remove values by typing and clicking + or pressing Enter</li>
            <li>All settings are saved and will be available throughout the CRM</li>
          </ul>
        </CardContent>
      </Card>

      {/* Role Form Dialog */}
      <Dialog open={showRoleForm} onOpenChange={setShowRoleForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRole ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          </DialogHeader>
          <RoleForm
            role={editingRole}
            onSave={handleSaveRole}
            onCancel={() => setShowRoleForm(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Role Form Component
const RoleForm = ({ role, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: role?.name || '',
    description: role?.description || '',
    defaultAccess: role?.defaultAccess || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.description || !formData.defaultAccess) {
      toast.error('All fields are required');
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="roleName">Role Name *</Label>
        <Input
          id="roleName"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Sales Manager"
          required
          data-testid="role-name-input"
        />
      </div>
      <div>
        <Label htmlFor="roleDescription">Description *</Label>
        <Textarea
          id="roleDescription"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe the role and responsibilities..."
          rows={3}
          required
          data-testid="role-description-input"
        />
      </div>
      <div>
        <Label htmlFor="defaultAccess">Default Access *</Label>
        <Textarea
          id="defaultAccess"
          value={formData.defaultAccess}
          onChange={(e) => setFormData({ ...formData, defaultAccess: e.target.value })}
          placeholder="e.g., Read/Write: Leads, Opportunities; Read: Clients"
          rows={2}
          required
          data-testid="role-access-input"
        />
        <p className="text-xs text-slate-500 mt-1">
          Describe what modules and permissions this role has access to
        </p>
      </div>
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} data-testid="role-form-cancel">
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-[#0A2A43] hover:bg-[#0A2A43]/90"
          data-testid="role-form-submit"
        >
          {role ? 'Update Role' : 'Create Role'}
        </Button>
      </div>
    </form>
  );
};

export default Settings;