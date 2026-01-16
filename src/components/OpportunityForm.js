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
    opportunity_name: '',
    account_id: '',
    primary_contact_id: '',
    owner_id: '',
    amount: 0,
    currency_code: 'USD',
    close_date: '',
    stage_name: 'Prospect',
    probability: 10,
    type: 'New Business',
    lead_source: '',
    next_step: '',
    loss_reason: '',
    description: '',
    // Keep existing fields for backward compatibility
    client_name: '',
    created_at: '',
    deal_value: 0,
    probability_percent: 0,
    win_loss_reason: '',
    last_interaction: '',
    next_action: '',
    partner_org: '',
    partner_org_contact: '',
    industry: '',
    region: '',
    country: '',
    solution: '',
    estimated_value: 0,
    currency: 'USD',
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
        // Map new fields
        opportunity_name: opportunity.opportunity_name || '',
        account_id: opportunity.account_id || '',
        primary_contact_id: opportunity.primary_contact_id || '',
        owner_id: opportunity.owner_id || '',
        amount: opportunity.amount || 0,
        currency_code: opportunity.currency_code || 'USD',
        close_date: opportunity.close_date?.split('T')[0] || '',
        stage_name: opportunity.stage_name || 'Prospect',
        probability: opportunity.probability || 10,
        type: opportunity.type || 'New Business',
        lead_source: opportunity.lead_source || '',
        next_step: opportunity.next_step || '',
        loss_reason: opportunity.loss_reason || '',
        description: opportunity.description || '',
        // Keep existing fields for backward compatibility
        client_name: opportunity.client_name || '',
        created_at: opportunity.created_at?.split('T')[0] || '',
        deal_value: opportunity.deal_value || 0,
        probability_percent: opportunity.probability_percent || 0,
        win_loss_reason: opportunity.win_loss_reason || '',
        last_interaction: opportunity.last_interaction?.split('T')[0] || '',
        next_action: opportunity.next_action || '',
        partner_org: opportunity.partner_org || '',
        partner_org_contact: opportunity.partner_org_contact || '',
        industry: opportunity.industry || '',
        region: opportunity.region || '',
        country: opportunity.country || '',
        solution: opportunity.solution || '',
        estimated_value: opportunity.estimated_value || 0,
        currency: opportunity.currency || 'USD',
        stage: opportunity.stage || 'Prospecting',
        expected_closure_date: opportunity.expected_closure_date?.split('T')[0] || '',
        sales_owner: opportunity.sales_owner || '',
        technical_poc: opportunity.technical_poc || '',
        presales_poc: opportunity.presales_poc || '',
        key_stakeholders: opportunity.key_stakeholders || '',
        competitors: opportunity.competitors || '',
        next_steps: opportunity.next_steps || '',
        risks: opportunity.risks || '',
        status: opportunity.status || 'Active',
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
    
    // Auto-update probability based on stage
    if (name === 'stage_name') {
      const stageProbabilityMap = {
        'Prospect': 10,
        'Needs Analysis – Discovery': 20,
        'Proposal / Price Quote': 30,
        'Demo': 40,
        'Negotiation': 50,
        'Closed Won': 100,
        'Closed Lost': 0
      };
      setFormData((prev) => ({ 
        ...prev, 
        [name]: value,
        probability: stageProbabilityMap[value] || 10 
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      
      // Map new standardized fields to backend format
      const submitPayload = {
        // Core fields
        opportunity_name: payload.opportunity_name,
        account_id: payload.account_id,
        primary_contact_id: payload.primary_contact_id,
        owner_id: payload.owner_id,
        amount: parseFloat(payload.amount) || 0,
        currency_code: payload.currency_code,
        close_date: payload.close_date,
        stage_name: payload.stage_name,
        probability: parseInt(payload.probability) || 10,
        type: payload.type,
        lead_source: payload.lead_source,
        next_step: payload.next_step,
        loss_reason: payload.stage_name === 'Closed Lost' ? payload.loss_reason : null,
        description: payload.description,
        // Keep backward compatibility fields
        client_name: payload.account_id, // Map account_id to client_name for compatibility
        created_at: payload.created_at,
        deal_value: parseFloat(payload.amount) || 0,
        probability_percent: parseInt(payload.probability) || 0,
        win_loss_reason: payload.stage_name === 'Closed Lost' ? payload.loss_reason : '',
        last_interaction: payload.close_date,
        next_action: payload.next_step,
        partner_org: payload.partner_org,
        partner_org_contact: payload.partner_org_contact,
        industry: payload.industry,
        region: payload.region,
        country: payload.country,
        solution: payload.solution,
        estimated_value: parseFloat(payload.amount) || 0,
        currency: payload.currency_code,
        stage: payload.stage_name,
        expected_closure_date: payload.close_date,
        sales_owner: payload.owner_id, // Map owner_id to sales_owner
        technical_poc: payload.technical_poc,
        presales_poc: payload.presales_poc,
        key_stakeholders: payload.key_stakeholders,
        competitors: payload.competitors,
        next_steps: payload.next_step,
        risks: payload.risks,
        status: payload.stage_name === 'Closed Won' ? 'Won' : payload.stage_name === 'Closed Lost' ? 'Lost' : 'Active'
      };

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

      submitPayload.attachments = attachmentMetadata;

      if (opportunity) {
        await api.put(`/opportunities/${opportunity.id}`, submitPayload);
        toast.success('Opportunity updated successfully');
        if (submitPayload.stage_name === 'Closed Won') {
          toast.success('Opportunity automatically converted to SOW!');
        }
      } else {
        await api.post('/opportunities', submitPayload);
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
          <Label htmlFor="account_id">Account *</Label>
          <Input
            id="account_id"
            name="account_id"
            value={formData.account_id}
            onChange={handleChange}
            required
            data-testid="opportunity-account-input"
          />
        </div>
        <div>
          <Label htmlFor="primary_contact_id">Primary Contact</Label>
          <Input
            id="primary_contact_id"
            name="primary_contact_id"
            value={formData.primary_contact_id}
            onChange={handleChange}
            placeholder="Select contact..."
            data-testid="opportunity-contact-input"
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
        
        <div>
          <Label htmlFor="owner_id">PreSales Owner *</Label>
          <Input
            id="owner_id"
            name="owner_id"
            value={formData.owner_id}
            onChange={handleChange}
            required
            placeholder="Assign owner..."
            data-testid="opportunity-owner-input"
          />
        </div>
        
        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            placeholder="Enter amount"
            data-testid="opportunity-amount-input"
          />
        </div>
        
        <div>
          <Label htmlFor="probability">Probability (%)</Label>
          <Input
            id="probability"
            name="probability"
            type="number"
            min="0"
            max="100"
            value={formData.probability}
            onChange={handleChange}
            placeholder="Auto-populated based on Stage"
            readOnly
            className="bg-slate-50 cursor-not-allowed"
            data-testid="opportunity-probability-input"
          />
        </div>
        
        <div>
          <Label htmlFor="close_date">Close Date</Label>
          <Input
            id="close_date"
            name="close_date"
            type="date"
            value={formData.close_date}
            onChange={handleChange}
            data-testid="opportunity-close-date-input"
          />
        </div>
        
        <div>
          <Label htmlFor="type">Type</Label>
          <Select name="type" value={formData.type} onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New Business">New Business</SelectItem>
              <SelectItem value="Existing">Existing</SelectItem>
              <SelectItem value="Renewal">Renewal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="lead_source">Lead Source</Label>
          <Select name="lead_source" value={formData.lead_source} onValueChange={(value) => setFormData((prev) => ({ ...prev, lead_source: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Web">Web</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
              <SelectItem value="Partner">Partner</SelectItem>
              <SelectItem value="Cold Call">Cold Call</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Social">Social Media</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="next_step">Next Step</Label>
          <Input
            id="next_step"
            name="next_step"
            value={formData.next_step}
            onChange={handleChange}
            placeholder="Immediate follow-up action"
            data-testid="opportunity-next-step-input"
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
          <Input id="industry" name="industry" value={formData.industry} onChange={handleChange} />
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
        
        {formData.stage_name === 'Closed Lost' && (
          <div>
            <Label htmlFor="loss_reason">Loss Reason *</Label>
            <Select name="loss_reason" value={formData.loss_reason} onValueChange={(value) => setFormData((prev) => ({ ...prev, loss_reason: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Price">Price</SelectItem>
                <SelectItem value="Competition">Competition</SelectItem>
                <SelectItem value="Timing">Timing</SelectItem>
                <SelectItem value="Requirements">Requirements</SelectItem>
                <SelectItem value="Relationship">Relationship</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        
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
        
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            placeholder="Internal notes"
            data-testid="opportunity-description-input"
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
      </div>
    </form>
  );
};

export default OpportunityForm;