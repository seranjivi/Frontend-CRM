import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import DateField from './DateField';
import RegionDropdown from './RegionDropdown';
import CountryDropdown from './CountryDropdown';

const ClientForm = ({ client, onClose }) => {
  const [formData, setFormData] = useState({
    client_name: '',
    contact_email: '',
    country: '',
    region: '',
    service_type: [], 
    client_tier: 'Normal',
    client_status: 'Active',
    notes: '',
    website: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData({
        ...client,
        service_type: Array.isArray(client.service_type) ? client.service_type : []
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleServiceTypeChange = (value) => {
    const currentServiceType = formData.service_type || [];
    const serviceArray = value ? [value] : [];
    
    if (JSON.stringify(currentServiceType) !== JSON.stringify(serviceArray)) {
      setFormData(prev => ({ ...prev, service_type: serviceArray }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.client_name || !formData.contact_email || !formData.country) {
      toast.error('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      if (client) {
        await api.put(`/clients/${client.id}`, formData);
        toast.success('Client updated successfully');
      } else {
        await api.post('/clients', formData);
        toast.success('Client created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Client form error:', error);
      toast.error(error.response?.data?.detail || 'Failed to save client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="client_name">Client Name *</Label>
          <Input
            id="client_name"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            required
            data-testid="client-name-input"
          />
        </div>
        <div>
          <Label htmlFor="contact_email">Email *</Label>
          <Input
            id="contact_email"
            name="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={handleChange}
            required
            data-testid="client-email-input"
          />
        </div>
        <div>
          <Label htmlFor="region">Region</Label>
          <RegionDropdown
            value={formData.region}
            onChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
            placeholder="Select region..."
            data-testid="client-region-dropdown"
          />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <CountryDropdown
            value={formData.country}
            onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
            region={formData.region}
            placeholder="Select country..."
            required={true}
            showRequiredIndicator={true}
            data-testid="client-country-dropdown"
          />
        </div>
        <div>
          <Label htmlFor="service_type">Service Type</Label>
          <Select
            value={formData.service_type && formData.service_type.length > 0 ? formData.service_type[0] : ''}
            onValueChange={(value) => handleServiceTypeChange(value)}
            data-testid="client-service-type-select"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select service type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Projects">Projects</SelectItem>
              <SelectItem value="Product Professional Services">Product Professional Services</SelectItem>
              <SelectItem value="Staffing">Staffing</SelectItem>
              <SelectItem value="Training">Training</SelectItem>
              <SelectItem value="Consulting">Consulting</SelectItem>
              <SelectItem value="Partners">Partners</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="client_tier">Client Tier</Label>
          <Select
            value={formData.client_tier}
            onValueChange={(value) => setFormData(prev => ({ ...prev, client_tier: value }))}
            data-testid="client-tier-select"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Normal">Normal</SelectItem>
              <SelectItem value="Key Client">Key Client</SelectItem>
              <SelectItem value="Strategic">Strategic</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="client_status">Client Status</Label>
          <Select
            value={formData.client_status}
            onValueChange={(value) => setFormData(prev => ({ ...prev, client_status: value }))}
            data-testid="client-status-select"
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
              <SelectItem value="Prospect">Prospect</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            data-testid="client-website-input"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          data-testid="client-notes-input"
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} data-testid="client-form-cancel">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          data-testid="client-form-submit"
          className="bg-[#0A2A43] hover:bg-[#0A2A43]/90"
        >
          {loading ? 'Saving...' : client ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default ClientForm;
