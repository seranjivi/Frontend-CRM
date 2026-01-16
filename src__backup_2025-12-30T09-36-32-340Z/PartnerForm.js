import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import DateField from './DateField';

const PartnerForm = ({ partner, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    partner_type: 'Vendor',
    category: '',
    region: '',
    website: '',
    address: '',
    status: 'Active',
    interaction_history: '',
    notes: '',
    contacts: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (partner) {
      setFormData(partner);
    }
  }, [partner]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (partner) {
        await api.put(`/partners/${partner.id}`, formData);
        toast.success('Partner updated successfully');
      } else {
        await api.post('/partners', formData);
        toast.success('Partner created successfully');
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save partner');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Partner Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            data-testid="partner-name-input"
          />
        </div>
        <DateField createdAt={partner?.created_at} isNew={!partner} />
        <div>
          <Label htmlFor="partner_type">Partner Type</Label>
          <Select 
            name="partner_type" 
            value={formData.partner_type} 
            onValueChange={(value) => setFormData((prev) => ({ ...prev, partner_type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Channel">Channel</SelectItem>
              <SelectItem value="Tech">Tech</SelectItem>
              <SelectItem value="Vendor">Vendor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            data-testid="partner-category-input"
            placeholder="e.g., Cloud Services, Software"
          />
        </div>
        <div>
          <Label htmlFor="region">Region</Label>
          <Input
            id="region"
            name="region"
            value={formData.region}
            onChange={handleChange}
            data-testid="partner-region-input"
          />
        </div>
        <div>
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            data-testid="partner-website-input"
            placeholder="https://..."
          />
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            name="status"
            value={formData.status}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger data-testid="partner-status-select">
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
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          data-testid="partner-address-input"
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="interaction_history">Interaction History</Label>
        <Textarea
          id="interaction_history"
          name="interaction_history"
          value={formData.interaction_history}
          onChange={handleChange}
          placeholder="Log partner interactions, calls, meetings..."
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          data-testid="partner-notes-input"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} data-testid="partner-form-cancel">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          data-testid="partner-form-submit"
          className="bg-[#0A2A43] hover:bg-[#0A2A43]/90"
        >
          {loading ? 'Saving...' : partner ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default PartnerForm;