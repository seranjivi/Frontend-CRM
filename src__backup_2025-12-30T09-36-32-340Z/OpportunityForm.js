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

const OpportunityForm = ({ opportunity, onClose }) => {
  const [formData, setFormData] = useState({
    client_name: '',
    opportunity_name: '',
    created_at: '', // Editable Date field - sent to backend
    // New fields
    deal_value: 0,
    probability_percent: 0,
    win_loss_reason: '',
    last_interaction: '',
    next_action: '',
    partner_org: '',
    partner_org_contact: '',
    // Existing fields
    industry: '',
    region: '',
    country: '',
    solution: '',
    estimated_value: 0,
    currency: 'USD',
    probability: 0,
    stage: 'Prospecting',
    expected_closure_date: '',
    sales_owner: '',
    technical_poc: '',
    presales_poc: '',
    key_stakeholders: '',
    competitors: '',
    next_steps: '',
    risks: '',
    status: 'Active',
  });
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  useEffect(() => {
    if (opportunity) {
      setFormData({
        ...opportunity,
        expected_closure_date: opportunity.expected_closure_date?.split('T')[0] || '',
        created_at: opportunity.created_at?.split('T')[0] || '',
      });
      if (opportunity.attachments) {
        setAttachments(opportunity.attachments);
      }
    } else {
      // Set today's date as default for new opportunities
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setFormData(prev => ({
        ...prev,
        created_at: `${year}-${month}-${day}`
      }));
    }
  }, [opportunity]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      if (payload.estimated_value) payload.estimated_value = parseFloat(payload.estimated_value);
      if (payload.probability) payload.probability = parseInt(payload.probability);

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

      if (opportunity) {
        await api.put(`/opportunities/${opportunity.id}`, payload);
        toast.success('Opportunity updated successfully');
        if (payload.stage === 'Closed Won') {
          toast.success('Opportunity automatically converted to SOW!');
        }
      } else {
        await api.post('/opportunities', payload);
        toast.success('Opportunity created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Opportunity form error:', error);
      const errorDetail = error.response?.data?.detail;
      let errorMessage = 'Failed to save opportunity';
      
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
          <Label htmlFor="client_name">Client / Account *</Label>
          <Input
            id="client_name"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            required
            data-testid="opportunity-client-input"
          />
        </div>
        <div>
          <Label htmlFor="opportunity_name">Opportunity Name *</Label>
          <Input
            id="opportunity_name"
            name="opportunity_name"
            value={formData.opportunity_name}
            onChange={handleChange}
            required
            data-testid="opportunity-name-input"
          />
        </div>
        <DateField 
          name="created_at"
          label="Date"
          value={formData.created_at}
          onChange={handleChange}
          required={true}
        />
        
        {/* Task ID Display (Read-only) */}
        {opportunity && opportunity.task_id && (
          <div>
            <Label htmlFor="task_id">Task ID</Label>
            <Input
              id="task_id"
              value={opportunity.task_id}
              readOnly
              disabled
              className="bg-slate-50 cursor-not-allowed font-['JetBrains_Mono'] font-semibold"
            />
          </div>
        )}
        
        {/* New Fields */}
        <div>
          <Label htmlFor="deal_value">Deal Value *</Label>
          <Input
            id="deal_value"
            name="deal_value"
            type="number"
            value={formData.deal_value}
            onChange={handleChange}
            required
            placeholder="Enter deal value"
          />
        </div>
        
        <div>
          <Label htmlFor="probability_percent">Probability % *</Label>
          <Input
            id="probability_percent"
            name="probability_percent"
            type="number"
            min="0"
            max="100"
            value={formData.probability_percent}
            onChange={handleChange}
            required
            placeholder="0-100"
          />
        </div>
        
        <div>
          <Label htmlFor="last_interaction">Last Interaction Date</Label>
          <Input
            id="last_interaction"
            name="last_interaction"
            type="date"
            value={formData.last_interaction?.split('T')[0] || ''}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <Label htmlFor="next_action">Next Action</Label>
          <Input
            id="next_action"
            name="next_action"
            value={formData.next_action}
            onChange={handleChange}
            placeholder="What's the next step?"
          />
        </div>
        
        <div>
          <Label htmlFor="partner_org">Partner Org</Label>
          <Input
            id="partner_org"
            name="partner_org"
            value={formData.partner_org}
            onChange={handleChange}
            placeholder="Partner organization name"
          />
        </div>
        
        <div>
          <Label htmlFor="partner_org_contact">Partner Org Contact</Label>
          <Input
            id="partner_org_contact"
            name="partner_org_contact"
            value={formData.partner_org_contact}
            onChange={handleChange}
            placeholder="Contact person at partner org"
          />
        </div>
        
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="region">Region</Label>
          <Input id="region" name="region" value={formData.region} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" value={formData.country} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="solution">Solution / Offering</Label>
          <Input id="solution" name="solution" value={formData.solution} onChange={handleChange} />
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
          <Label htmlFor="stage">Stage *</Label>
          <Select name="stage" value={formData.stage} onValueChange={(value) => setFormData((prev) => ({ ...prev, stage: value }))}>
            <SelectTrigger data-testid="opportunity-stage-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Prospecting">Prospecting</SelectItem>
              <SelectItem value="Needs Analysis">Needs Analysis</SelectItem>
              <SelectItem value="Proposal">Proposal</SelectItem>
              <SelectItem value="Negotiation">Negotiation</SelectItem>
              <SelectItem value="Closed">Closed (Move to Action Items)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="win_loss_reason">Win/Loss Reason</Label>
          <Input
            id="win_loss_reason"
            name="win_loss_reason"
            value={formData.win_loss_reason}
            onChange={handleChange}
            placeholder="Why won or lost?"
          />
        </div>
        <div>
          <Label htmlFor="expected_closure_date">Expected Closure Date</Label>
          <Input
            id="expected_closure_date"
            name="expected_closure_date"
            type="date"
            value={formData.expected_closure_date}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="sales_owner">Sales Owner</Label>
          <Input id="sales_owner" name="sales_owner" value={formData.sales_owner} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="technical_poc">Technical PoC</Label>
          <Input id="technical_poc" name="technical_poc" value={formData.technical_poc} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="presales_poc">Presales PoC</Label>
          <Input id="presales_poc" name="presales_poc" value={formData.presales_poc} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="key_stakeholders">Key Stakeholders</Label>
          <Input id="key_stakeholders" name="key_stakeholders" value={formData.key_stakeholders} onChange={handleChange} />
        </div>
        <div>
          <Label htmlFor="competitors">Competitors</Label>
          <Input id="competitors" name="competitors" value={formData.competitors} onChange={handleChange} />
        </div>
      </div>

      <div>
        <Label htmlFor="next_steps">Next Steps</Label>
        <Textarea
          id="next_steps"
          name="next_steps"
          value={formData.next_steps}
          onChange={handleChange}
          rows={2}
        />
      </div>

      <div>
        <Label htmlFor="risks">Risks / Blockers</Label>
        <Textarea
          id="risks"
          name="risks"
          value={formData.risks}
          onChange={handleChange}
          rows={2}
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
          data-testid="opportunity-form-submit"
          className="bg-[#0A2A43] hover:bg-[#0A2A43]/90"
        >
          {loading ? 'Saving...' : opportunity ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default OpportunityForm;