import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import MultiFileUpload from './attachments/MultiFileUpload';
import DateField from './DateField';
import RegionDropdown from './RegionDropdown';
import CountryDropdown from './CountryDropdown';
import LeadStatusBadge from './LeadStatusBadge';
import { Plus, Search, User } from 'lucide-react';

const LeadFormEnhanced = ({ lead, onClose }) => {
  const [formData, setFormData] = useState({
    client_name: '',
    opportunity_name: '',
    lead_score: 0,
    sales_poc: '', // Lead Assignee
    lead_owner: '', // System-controlled lead owner
    next_followup: '',
    created_at: '',
    lead_source: '',
    region: '',
    country: '',
    industry: '',
    contact_person: '',
    contact_details: '',
    solution: '',
    estimated_value: 0,
    currency: 'USD',
    stage: 'New',
    probability: 0,
    expected_closure_date: '',
    owner: '',
    next_action: '',
    notes: '',
    comments: '',
    status: 'New',
  });
  
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);
  const [newClientData, setNewClientData] = useState({
    client_name: '',
    region: '',
    country: '',
    industry: '',
    contact_email: '',
    contact_phone: '',
    service_type: [],
    client_tier: 'Standard',
    client_status: 'Active',
    notes: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showClientDropdown, setShowClientDropdown] = useState(false);

  // Sales-related roles for Lead Assignee selection
  const salesRoles = ['Sales Head', 'Presales Consultant', 'Presales Lead', 'Presales Manager', 'Account Manager'];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (lead) {
      setFormData({
        ...lead,
        expected_closure_date: lead.expected_closure_date?.split('T')[0] || '',
        next_followup: lead.next_followup?.split('T')[0] || '',
        created_at: lead.created_at?.split('T')[0] || '',
      });
      if (lead.attachments) {
        setAttachments(lead.attachments);
      }
    } else {
      // Set today's date and current user for new leads
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setFormData(prev => ({
        ...prev,
        created_at: `${year}-${month}-${day}`,
        lead_owner: currentUser?.full_name || ''
      }));
    }
  }, [lead, currentUser]);

  const fetchInitialData = async () => {
    try {
      console.log('=== Starting fetchInitialData ===');
      
      // Fetch current user
      const userResponse = await api.get('/auth/me');
      console.log('Current user response:', userResponse);
      setCurrentUser(userResponse.data);
      
      // Fetch clients
      const clientsResponse = await api.get('/clients');
      console.log('Clients response:', clientsResponse);
      setClients(clientsResponse.data);
      
      // Fetch users for Lead Assignee dropdown
      console.log('Fetching users for Lead Assignee...');
      const usersResponse = await api.get('/users');
      
      const filteredUsers = usersResponse.data.filter(user => {
        const isSalesRole = salesRoles.includes(user.role);
        const isActive = user.status === 'Active';
        console.log(`${user.full_name}: role="${user.role}" -> ${isSalesRole ? '✓' : '✗'} | status="${user.status}" -> ${isActive ? '✓' : '✗'}`);
        return isSalesRole && isActive;
      });
      
      console.log(`Filtered ${filteredUsers.length} users for Lead Assignee:`, filteredUsers.map(u => u.full_name));
      setUsers(filteredUsers);
      
      // Set lead owner for new leads
      if (!lead) {
        setFormData(prev => ({
          ...prev,
          lead_owner: userResponse.data.full_name
        }));
      }
      
      console.log('=== fetchInitialData completed ===');
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
      toast.error('Failed to load form data');
    }
  };

  const handleClientSelection = async (clientId) => {
    if (clientId === 'new') {
      setShowNewClientDialog(true);
      setShowClientDropdown(false);
      return;
    }

    try {
      const clientResponse = await api.get(`/clients/${clientId}`);
      const client = clientResponse.data;
      
      // Auto-populate form with client data
      setFormData(prev => ({
        ...prev,
        client_name: client.client_name,
        region: client.region || '',
        country: client.country || '',
        industry: client.industry || '',
        contact_person: client.contact_person || '',
        contact_details: client.contact_email || client.contact_phone || '',
        opportunity_name: ''
      }));
      setShowClientDropdown(false);
      setSearchTerm(client.client_name);
    } catch (error) {
      toast.error('Failed to load client details');
    }
  };

  const handleCreateNewClient = async () => {
    try {
      const response = await api.post('/clients', newClientData);
      const newClient = response.data;
      
      // Add to clients list
      setClients(prev => [...prev, newClient]);
      
      // Auto-populate form with new client data
      setFormData(prev => ({
        ...prev,
        client_name: newClient.client_name,
        region: newClient.region || '',
        country: newClient.country || '',
        industry: newClient.industry || '',
        contact_person: newClient.contact_person || '',
        contact_details: newClient.contact_email || newClient.contact_phone || '',
        opportunity_name: ''
      }));
      
      // Close dialog and reset form
      setShowNewClientDialog(false);
      setShowClientDropdown(false);
      setNewClientData({
        client_name: '',
        region: '',
        country: '',
        industry: '',
        contact_email: '',
        contact_phone: '',
        service_type: [],
        client_tier: 'Standard',
        client_status: 'Active',
        notes: ''
      });
      
      toast.success('Client created successfully');
    } catch (error) {
      toast.error('Failed to create client');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      
      // Ensure lead_owner is set to current user
      if (!payload.lead_owner && currentUser) {
        payload.lead_owner = currentUser.full_name;
      }
      
      // Convert numeric fields
      if (payload.estimated_value) payload.estimated_value = parseFloat(payload.estimated_value);
      if (payload.probability) payload.probability = parseInt(payload.probability);

      // Handle attachments
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
          };
        }
      });

      payload.attachments = attachmentMetadata;

      if (lead) {
        await api.put(`/leads/${lead.id}`, payload);
        toast.success('Lead updated successfully');
      } else {
        await api.post('/leads', payload);
        toast.success('Lead created successfully');
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving lead:', error);
      toast.error('Failed to save lead');
    } finally {
      setLoading(false);
    }
  };

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Client / Account Selection */}
        <div>
          <Label htmlFor="client_selection">Client / Account *</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              id="client_selection"
              placeholder="Search and select client..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowClientDropdown(true);
              }}
              onFocus={() => setShowClientDropdown(true)}
              className="pl-10"
            />
          </div>
          
          {/* Client Selection Dropdown */}
          {showClientDropdown && (
            <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto bg-white shadow-lg">
              {filteredClients.map(client => (
                <div
                  key={client.id}
                  onClick={() => handleClientSelection(client.id)}
                  className="p-2 hover:bg-slate-50 cursor-pointer flex items-center justify-between"
                >
                  <span>{client.client_name}</span>
                  <span className="text-xs text-slate-500">{client.region}</span>
                </div>
              ))}
              <div
                onClick={() => handleClientSelection('new')}
                className="p-2 hover:bg-blue-50 cursor-pointer flex items-center text-blue-600 border-t"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Client
              </div>
            </div>
          )}
        </div>

        {/* Lead Owner (System-Controlled) */}
        <div>
          <Label htmlFor="lead_owner">Lead Owner</Label>
          <Input
            id="lead_owner"
            name="lead_owner"
            value={formData.lead_owner}
            readOnly
            disabled
            className="bg-slate-50 cursor-not-allowed"
            title="Automatically set to current user"
          />
        </div>

        {/* Lead Assignee (Sales POC) */}
        <div>
          <Label htmlFor="sales_poc">Lead Assignee</Label>
          <Select
            name="sales_poc"
            value={formData.sales_poc}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, sales_poc: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select lead assignee..." />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.full_name}>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {user.full_name}
                    <span className="ml-2 text-xs text-slate-500">({user.role})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="opportunity_name">Opportunity Name *</Label>
          <Input
            id="opportunity_name"
            name="opportunity_name"
            value={formData.opportunity_name}
            onChange={handleChange}
            required
            data-testid="lead-opportunity-input"
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
        {lead && lead.task_id && (
          <div>
            <Label htmlFor="task_id">Task ID</Label>
            <Input
              id="task_id"
              value={lead.task_id}
              readOnly
              disabled
              className="bg-slate-50 cursor-not-allowed font-['JetBrains_Mono'] font-semibold"
            />
          </div>
        )}

        <div>
          <Label htmlFor="lead_score">Lead Score (0-100)</Label>
          <Input
            id="lead_score"
            name="lead_score"
            type="number"
            min="0"
            max="100"
            value={formData.lead_score}
            onChange={handleChange}
            placeholder="Enter score 0-100"
          />
        </div>

        <div>
          <Label htmlFor="next_followup">Next Follow-up Date</Label>
          <Input
            id="next_followup"
            name="next_followup"
            type="date"
            value={formData.next_followup}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="lead_source">Lead Source</Label>
          <Select
            name="lead_source"
            value={formData.lead_source}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, lead_source: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Web">Web</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Referral">Referral</SelectItem>
              <SelectItem value="Partner">Partner</SelectItem>
              <SelectItem value="Cold Call">Cold Call</SelectItem>
              <SelectItem value="Event">Event</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Auto-populated fields from client selection */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="region">Region</Label>
            <RegionDropdown
              value={formData.region}
              onChange={(value) => setFormData(prev => ({ ...prev, region: value }))}
              placeholder="Select region..."
              disabled={!!formData.client_name} // Disable if client is selected
              className={formData.client_name ? 'bg-slate-50' : ''}
            />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <CountryDropdown
              value={formData.country}
              onChange={(value) => setFormData(prev => ({ ...prev, country: value }))}
              placeholder="Select country..."
              disabled={!!formData.client_name} // Disable if client is selected
              className={formData.client_name ? 'bg-slate-50' : ''}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            name="industry"
            value={formData.industry}
            onChange={handleChange}
            disabled={!!formData.client_name} // Disable if client is selected
            className={formData.client_name ? 'bg-slate-50' : ''}
            placeholder="Industry"
          />
        </div>

        <div>
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleChange}
            placeholder="Contact person"
          />
        </div>

        <div>
          <Label htmlFor="contact_details">Contact Details</Label>
          <Input
            id="contact_details"
            name="contact_details"
            value={formData.contact_details}
            onChange={handleChange}
            placeholder="Email or phone"
          />
        </div>

        <div>
          <Label htmlFor="solution">Solution</Label>
          <Input
            id="solution"
            name="solution"
            value={formData.solution}
            onChange={handleChange}
            placeholder="Solution"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="estimated_value">Estimated Value</Label>
            <Input
              id="estimated_value"
              name="estimated_value"
              type="number"
              min="0"
              step="0.01"
              value={formData.estimated_value}
              onChange={handleChange}
              placeholder="0.00"
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select
              name="currency"
              value={formData.currency}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
            >
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
        </div>

        <div>
          <Label htmlFor="stage">Stage</Label>
          <Select
            name="stage"
            value={formData.stage}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, stage: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Unqualified">Unqualified</SelectItem>
            </SelectContent>
          </Select>
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
            placeholder="0-100"
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
          <Label htmlFor="next_action">Next Action</Label>
          <Input
            id="next_action"
            name="next_action"
            value={formData.next_action}
            onChange={handleChange}
            placeholder="Next action"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Additional notes"
            rows={3}
          />
        </div>

        {/* Lead Status Display (Read-only) */}
        <div>
          <Label>Lead Status</Label>
          <LeadStatusBadge 
            status={formData.lead_status || 'Active'} 
            leadId={lead?.id}
          />
        </div>

        {/* Attachments */}
        <div>
          <Label>Attachments</Label>
          <MultiFileUpload
            files={attachments}
            onFilesChange={setAttachments}
            maxFiles={5}
            maxSize={5 * 1024 * 1024} // 5MB
          />
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : (lead ? 'Update Lead' : 'Create Lead')}
          </Button>
        </div>
      </form>

      {/* New Client Dialog */}
      <Dialog open={showNewClientDialog} onOpenChange={setShowNewClientDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new_client_name">Client Name *</Label>
              <Input
                id="new_client_name"
                value={newClientData.client_name}
                onChange={(e) => setNewClientData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="Enter client name"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new_region">Region *</Label>
                <RegionDropdown
                  value={newClientData.region}
                  onChange={(value) => setNewClientData(prev => ({ ...prev, region: value }))}
                  placeholder="Select region"
                  required
                />
              </div>
              <div>
                <Label htmlFor="new_country">Country *</Label>
                <CountryDropdown
                  value={newClientData.country}
                  onChange={(value) => setNewClientData(prev => ({ ...prev, country: value }))}
                  placeholder="Select country"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="new_industry">Industry</Label>
              <Input
                id="new_industry"
                value={newClientData.industry}
                onChange={(e) => setNewClientData(prev => ({ ...prev, industry: e.target.value }))}
                placeholder="Industry"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new_contact_email">Contact Email</Label>
                <Input
                  id="new_contact_email"
                  type="email"
                  value={newClientData.contact_email}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="Email address"
                />
              </div>
              <div>
                <Label htmlFor="new_contact_phone">Contact Phone</Label>
                <Input
                  id="new_contact_phone"
                  value={newClientData.contact_phone}
                  onChange={(e) => setNewClientData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="new_notes">Notes</Label>
              <Textarea
                id="new_notes"
                value={newClientData.notes}
                onChange={(e) => setNewClientData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Client notes"
                rows={3}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowNewClientDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleCreateNewClient}
                disabled={!newClientData.client_name || !newClientData.region || !newClientData.country}
              >
                Create Client
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeadFormEnhanced;
