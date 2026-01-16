import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import MultiFileUpload from './attachments/MultiFileUpload';
import DateField from './DateField';

const SOWForm = ({ sow, onClose }) => {
  const [attachments, setAttachments] = useState([]);
  const [formData, setFormData] = useState({
    client_name: '',
    project_name: '',
    sow_title: '',
    sow_type: 'New',
    start_date: '',
    end_date: '',
    value: 0,
    currency: 'USD',
    billing_type: 'Fixed',
    status: 'Active',
    owner: '',
    delivery_spoc: '',
    milestones: '',
    po_number: '',
    invoice_plan: '',
    documents_link: '',
    notes: '',
    created_at: '', // Added for the editable Date field
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sow) {
      setFormData({
        ...sow,
        start_date: sow.start_date?.split('T')[0] || '',
        end_date: sow.end_date?.split('T')[0] || '',
        created_at: sow.created_at?.split('T')[0] || '',
      });
      if (sow.attachments) {
        setAttachments(sow.attachments);
      }
    } else {
      // Set today's date as default for new SOWs
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setFormData(prev => ({
        ...prev,
        created_at: `${year}-${month}-${day}`
      }));
    }
  }, [sow]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      if (payload.value) payload.value = parseFloat(payload.value);

      // Convert File objects to metadata
      const attachmentMetadata = attachments.map(file => {
        if (file.id) {
          return file;
        } else {
          return {
            id: `temp_${Date.now()}_${Math.random()}`,
            name: file.name,
            originalName: file.name,
            storedName: file.name,
            size: file.size,
            type: file.type,
            path: '',
            url: '',
            uploadedAt: new Date().toISOString()
          };
        }
      });

      payload.attachments = attachmentMetadata;

      if (sow) {
        await api.put(`/sows/${sow.id}`, payload);
        toast.success('SOW updated successfully');
        if (payload.status === 'Completed') {
          toast.success('Kickoff activity automatically created!');
        }
      } else {
        await api.post('/sows', payload);
        toast.success('SOW created successfully');
      }
      onClose();
    } catch (error) {
      console.error('SOW form error:', error);
      const errorDetail = error.response?.data?.detail;
      let errorMessage = 'Failed to save SOW';
      
      if (typeof errorDetail === 'string') {
        errorMessage = errorDetail;
      } else if (Array.isArray(errorDetail)) {
        errorMessage = errorDetail.map(err => err.msg || err.message || JSON.stringify(err)).join(', ');
      } else if (errorDetail && typeof errorDetail === 'object') {
        errorMessage = JSON.stringify(errorDetail);
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="client_name">Client *</Label>
          <Input
            id="client_name"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            required
            data-testid="sow-client-input"
          />
        </div>
        <div>
          <Label htmlFor="project_name">Project Name *</Label>
          <Input
            id="project_name"
            name="project_name"
            value={formData.project_name}
            onChange={handleChange}
            required
            data-testid="sow-project-input"
          />
        </div>
        <div>
          <Label htmlFor="sow_title">SOW Title *</Label>
          <Input
            id="sow_title"
            name="sow_title"
            value={formData.sow_title}
            onChange={handleChange}
            required
            data-testid="sow-title-input"
          />
        </div>
        <DateField 
          name="created_at"
          label="Date"
          value={formData.created_at}
          onChange={handleChange}
          required={true}
        />
        <div>
          <Label htmlFor="sow_type">Type</Label>
          <Select name="sow_type" value={formData.sow_type} onValueChange={(value) => setFormData((prev) => ({ ...prev, sow_type: value }))}>
            <SelectTrigger data-testid="sow-type-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Renewal">Renewal</SelectItem>
              <SelectItem value="CO">CO (Change Order)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={formData.end_date}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="value">Value</Label>
          <Input
            id="value"
            name="value"
            type="number"
            value={formData.value}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select name="currency" value={formData.currency} onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="EUR">EUR</SelectItem>
              <SelectItem value="GBP">GBP</SelectItem>
              <SelectItem value="INR">INR</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="billing_type">Billing Type</Label>
          <Select name="billing_type" value={formData.billing_type} onValueChange={(value) => setFormData((prev) => ({ ...prev, billing_type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fixed">Fixed</SelectItem>
              <SelectItem value="T&M">T&M (Time & Material)</SelectItem>
              <SelectItem value="Milestone">Milestone</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="status">Status</Label>
          <Select name="status" value={formData.status} onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}>
            <SelectTrigger data-testid="sow-status-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed (Creates Kickoff Activity)</SelectItem>
              <SelectItem value="On Hold">On Hold</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="owner">Owner / AM</Label>
          <Input id="owner" name="owner" value={formData.owner} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="delivery_spoc">Delivery SPOC</Label>
          <Input id="delivery_spoc" name="delivery_spoc" value={formData.delivery_spoc} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="po_number">PO Number</Label>
          <Input id="po_number" name="po_number" value={formData.po_number} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="invoice_plan">Invoice Plan</Label>
          <Input id="invoice_plan" name="invoice_plan" value={formData.invoice_plan} onChange={handleChange} placeholder="e.g., Monthly, Quarterly" />
        </div>
        <div>
          <Label htmlFor="documents_link">Documents Link</Label>
          <Input id="documents_link" name="documents_link" value={formData.documents_link} onChange={handleChange} placeholder="https://..." />
        </div>
      </div>

      <div>
        <Label htmlFor="milestones">Milestones</Label>
        <Textarea
          id="milestones"
          name="milestones"
          value={formData.milestones}
          onChange={handleChange}
          rows={2}
          placeholder="Phase 1: Design, Phase 2: Development, Phase 3: Testing"
        />
      </div>

      <div>
        <Label htmlFor="notes">Notes / Next Steps</Label>
        <Textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div>
        <Label>Attachments</Label>
        <MultiFileUpload files={attachments} onChange={setAttachments} />
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          data-testid="sow-form-submit"
          className="bg-[#0A2A43] hover:bg-[#0A2A43]/90"
        >
          {loading ? 'Saving...' : sow ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default SOWForm;