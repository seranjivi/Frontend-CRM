import React, { useState, useEffect } from 'react';
import opportunityService from '../services/opportunityService';
import rfpService from '../services/rfpService';
import clientService from '../services/clientService';
import sowService from '../services/sowService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Search, ChevronDown, Loader2 } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { toast } from 'sonner';
import { Plus, Trash2 } from 'lucide-react';
import MultiFileUpload from './attachments/MultiFileUpload';
import DateField from './DateField';
import PropTypes from 'prop-types';

const OpportunityFormTabbed = ({ opportunity, onClose, onSuccess, showOnlyRFP = false, showOnlyDetails = false, showOnlySOW = false }) => {
  // Reset form when opportunity changes
  useEffect(() => {
    if (!opportunity) {
      setFormData(defaultFormData);
    }
  }, [opportunity]);

  // Set active tab based on showOnlyRFP, showOnlySOW, or showOnlyDetails
  useEffect(() => {
    if (showOnlySOW) {
      setActiveTab('sow');
    } else if (showOnlyRFP) {
      setActiveTab('rfp');
    } else if (showOnlyDetails) {
      setActiveTab('details');
    }
  }, [showOnlyRFP, showOnlyDetails, showOnlySOW]);

  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [nextStepInput, setNextStepInput] = useState('');
  const [isSubmittingNextStep, setIsSubmittingNextStep] = useState(false);
  const [clients, setClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);

  const LEAD_SOURCES = [
    'Advertisement', 'Cold Call', 'Employee Referral', 'External Referral',
    'Online Store', 'Partner Organization', 'Partner Individual',
    'Public Relations', 'Sales Email Alias', 'Seminar Partner',
    'Internal Seminar', 'Trade Show', 'Web Download', 'Web Research', 'Chat', 'Portal'
  ];

  const CURRENCIES = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' }
  ];

  const OPPORTUNITY_TYPES = ['New Business', 'Existing Business', 'Upsell', 'Renewal', 'Cross-sell', 'Referral'];
  const PIPELINE_STATUSES = [
    'Proposal Work-in-Progress',
    'Proposal Review',
    'Price Negotiation',
    'Won',
    'Lost'
  ];
  const RFP_STATUSES = ['Draft', 'Submitted', 'Won', 'Lost', 'In Progress'];
  const SOW_STATUSES = ['Draft', 'Submitted', 'Won', 'Lost', 'In Progress'];
  
  const TRIAGED_OPTIONS = [
    { value: 'Proceed', label: 'Proceed (Go)' },
    { value: 'Hold', label: 'Hold (Neutral)' },
    { value: 'Drop', label: 'Drop (No-Go)' }
  ];

  const getWinProbability = (status) => {
    const statusProbabilities = {
      'Proposal Work-in-Progress': 20,
      'Proposal Review': 40,
      'Price Negotiation': 70,
      'Won': 100,
      'Lost': 0
    };
    return statusProbabilities[status] || 0;
  };

  const handlePipelineStatusChange = (status) => {
    updateOpportunityData('pipelineStatus', status);
    const currentWinProbability = formData.opportunity.winProbability;
    const autoWinProbability = getWinProbability(status);
    
    const isAutoValue = Object.values({
      'Proposal Work-in-Progress': 20,
      'Proposal Review': 40,
      'Price Negotiation': 70,
      'Won': 100,
      'Lost': 0
    }).includes(currentWinProbability);
    
    if (isAutoValue || currentWinProbability === undefined) {
      updateOpportunityData('winProbability', autoWinProbability);
    }
  };

  // Initialize form data with default values
  const defaultFormData = {
    opportunity: {
      opportunity_name: '',
      client_name: '',
      closeDate: '',
      start_date: '',
      sales_owner: '',
      technical_poc: '',
      presales_poc: '',
      amount: '',
      currency: 'USD',
      leadSource: '',
      partnerOrganization: '',
      partnerIndividual: '',
      type: 'New Business',
      triaged: 'Hold',
      pipelineStatus: 'Proposal Work-in-Progress',
      winProbability: 20,
      nextSteps: [],
      createdBy: ''
    },
    rfpDetails: {
      rfpTitle: '',
      rfpStatus: 'Draft',
      submissionDeadline: '',
      bidManager: '',
      submissionMode: '',
      portalUrl: '',
      qaLogs: []
    },
    sowDetails: {
      sowTitle: '',
      sowStatus: 'Draft',
      contractValue: 0,
      currency: 'USD',
      targetKickoffDate: '',
      linkedProposalRef: '',
      scopeOverview: ''
    },
    rfpDocuments: [],
    sowDocuments: []
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Fetch users for dropdowns
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        // Replace this with your actual API call to fetch users
        // const response = await userService.getUsers();
        // setUsers(response.data);
        setUsers([
          { id: '1', name: 'John Doe', role: 'sales' },
          { id: '2', name: 'Jane Smith', role: 'technical' },
          { id: '3', name: 'Mike Johnson', role: 'presales' },
        ]);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  // Update form data when opportunity prop changes
  useEffect(() => {
    if (opportunity) {
      setFormData({
        opportunity: {
          ...defaultFormData.opportunity,
          ...(opportunity.opportunity || {}),
          // Ensure required fields have proper defaults
          opportunity_name: opportunity.opportunity?.opportunity_name || '',
          client_name: opportunity.opportunity?.client_name || 'Unknown Client',
          closeDate: opportunity.opportunity?.closeDate || '',
          amount: opportunity.opportunity?.amount || '',
          currency: opportunity.opportunity?.currency || 'USD',
          leadSource: opportunity.opportunity?.leadSource || '',
          type: opportunity.opportunity?.type || 'New Business',
          triaged: opportunity.opportunity?.triaged || 'Hold',
          pipelineStatus: opportunity.opportunity?.pipelineStatus || 'Proposal Work-in-Progress',
          winProbability: opportunity.opportunity?.winProbability || 20,
          nextSteps: Array.isArray(opportunity.opportunity?.nextSteps) 
            ? opportunity.opportunity.nextSteps 
            : [],
          createdBy: opportunity.opportunity?.createdBy || 'System',
          id: opportunity.opportunity?.id || ''
        },
        rfpDetails: {
          ...defaultFormData.rfpDetails,
          ...(opportunity.rfpDetails || {})
        },
        sowDetails: {
          ...defaultFormData.sowDetails,
          ...(opportunity.sowDetails || {})
        },
        rfpDocuments: Array.isArray(opportunity.rfpDocuments) ? opportunity.rfpDocuments : [],
        sowDocuments: Array.isArray(opportunity.sowDocuments) ? opportunity.sowDocuments : []
      });
    }
  }, [opportunity]);

  const updateOpportunityData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      opportunity: {
        ...prev.opportunity,
        [field]: value
      }
    }));
  };

  const updateRfpDetails = (field, value) => {
    setFormData(prev => ({
      ...prev,
      rfpDetails: {
        ...prev.rfpDetails,
        [field]: value
      }
    }));
  };

  const updateSowDetails = (field, value) => {
    setFormData(prev => ({
      ...prev,
      sowDetails: {
        ...prev.sowDetails,
        [field]: value
      }
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    if (!formData.opportunity.opportunity_name?.trim()) {
      errors.opportunity_name = 'Opportunity name is required';
    }
    if (!formData.opportunity.client_name) {
      errors.client_name = 'Client selection is required';
    }
    if (!formData.opportunity.closeDate) {
      errors.closeDate = 'Close date is required';
    }
    if (formData.opportunity.amount === '' || formData.opportunity.amount === null || formData.opportunity.amount === undefined) {
      errors.amount = 'Amount is required';
    } else if (parseFloat(formData.opportunity.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    if (formData.opportunity.triaged !== 'Drop' && !formData.opportunity.pipelineStatus) {
      errors.pipelineStatus = 'Pipeline status is required';
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Handle SOW creation if in SOW tab
      if (activeTab === 'sow') {
        setLoading(true);
        const authToken = localStorage.getItem('authToken');
        const authUser = JSON.parse(localStorage.getItem('user'));

        try {
          // 1. First, get the RFP for this opportunity
          const opportunityId = opportunity?.id || opportunity?.opportunity?.id;
          const rfpResponse = await rfpService.getRFPsByOpportunityId(opportunityId);
          
          if (!rfpResponse.data || !rfpResponse.data.id) {
            throw new Error('No RFP found for this opportunity');
          }

          const rfpId = rfpResponse.data.id;

          // 2. Prepare SOW data with the RFP ID
          const sowData = {
            title: formData.sowDetails.sowTitle || `SOW for ${formData.opportunity.opportunity_name}`,
            status: formData.sowDetails.sowStatus || 'Draft',
            contractValue: parseFloat(formData.sowDetails.contractValue) || 0,
            currency: formData.sowDetails.currency || 'USD',
            targetKickoffDate: formData.sowDetails.targetKickoffDate || null,
            linkedProposalRef: formData.sowDetails.linkedProposalRef || '',
            scopeOverview: formData.sowDetails.scopeOverview || '',
            opportunityId: opportunityId,
            rfbId: rfpId, // Use the RFP ID from the API response
            userId: authUser?.id,
            documents: formData.sowDocuments || []
          };

          // 3. Create the SOW with the RFP ID
          const result = await sowService.createSOW(sowData, {
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          });
          
          toast.success('SOW created successfully!');
          if (onSuccess) onSuccess(result);
          if (onClose) onClose();
          // Redirect to /sows page after successful creation
          window.location.href = '/sows';
          
        } catch (error) {
          console.error('Error in SOW creation flow:', error);
          toast.error(error.response?.data?.message || 'Failed to create SOW');
        } finally {
          setLoading(false);
        }
        return;
      }

      // Handle RFP creation if in RFP tab
      if (activeTab === 'rfp') {
        const rfpData = {
          opportunityName: formData.opportunity.opportunity_name || 'New RFP',
          title: formData.rfpDetails?.rfpTitle || formData.opportunity.opportunity_name || 'New RFP',
          rfpStatus: formData.rfpDetails?.rfpStatus || 'Draft',
          rfpManager: formData.rfpDetails?.bidManager || formData.opportunity.assignedTo || '',
          submissionDeadline: formData.rfpDetails?.submissionDeadline || formData.opportunity.closeDate || new Date().toISOString().split('T')[0],
          opportunityId: opportunity?.id || opportunity?.opportunity?.id,
          rfpDocuments: formData.rfpDocuments || []
        };

        const result = await rfpService.createRFP(rfpData);
        toast.success('RFP created successfully!');
        window.location.href = '/rfp-details';

        if (onSuccess && typeof onSuccess === 'function') {
          onSuccess(result);
        }
        
        if (onClose) onClose();
        return;
      }

      // Original opportunity creation/update logic
      const isEdit = !!opportunity?.id || !!opportunity?.opportunity?.id;
      const opportunityId = opportunity?.id || opportunity?.opportunity?.id;
      
      // Check for existing opportunity with the same name for new records
      if (!isEdit) {
        try {
          const existingOpportunities = await opportunityService.getOpportunities();
          const duplicate = existingOpportunities.data.some(
            opp => opp.opportunity_name.toLowerCase() === formData.opportunity.opportunity_name.toLowerCase()
          );
          
          if (duplicate) {
            toast.error('An opportunity with this name already exists');
            return;
          }
        } catch (error) {
          console.error('Error checking for duplicate opportunities:', error);
          toast.error('Error checking for duplicate opportunities');
          return;
        }
      }

      // Format the closeDate properly
      let closeDate = formData.opportunity.closeDate;
      if (!closeDate) {
        closeDate = new Date().toISOString().split('T')[0]; // Default to today if not provided
      } else if (closeDate instanceof Date) {
        closeDate = closeDate.toISOString().split('T')[0];
      } else if (typeof closeDate === 'string') {
        // Ensure we have a valid date string
        closeDate = closeDate.split('T')[0];
      }
      
      // Format amount - convert empty string to null
      const amount = formData.opportunity.amount === '' ? null : parseFloat(formData.opportunity.amount);

      // Format start_date to YYYY-MM-DD only
      let startDate = null;
      if (formData.opportunity.start_date) {
        if (formData.opportunity.start_date instanceof Date) {
          startDate = formData.opportunity.start_date.toISOString().split('T')[0];
        } else if (typeof formData.opportunity.start_date === 'string') {
          startDate = formData.opportunity.start_date.split('T')[0];
        }
      }

      // Prepare the data with all required fields
      const opportunityData = {
        // Required fields
        opportunity_name: formData.opportunity.opportunity_name || 'New Opportunity',
        client_name: formData.opportunity.client_name || 'Unknown Client',
        close_date: closeDate,
        amount: amount,
        amount_currency: formData.opportunity.currency || 'USD',
        
        // Optional fields with defaults
        lead_source: formData.opportunity.leadSource || null,
        opportunity_type: formData.opportunity.type || 'New Business',
        triaged_status: formData.opportunity.triaged === 'Proceed' ? 'Proceed' : 
                       (formData.opportunity.triaged === 'Drop' ? 'Drop' : 'Hold'),
        pipeline_status: formData.opportunity.pipelineStatus || 'Proposal Work-in-Progress',
        win_probability: parseInt(formData.opportunity.winProbability) || 20,
        user_name: formData.opportunity.createdBy || 'System',
        start_date: startDate,
        sales_owner: formData.opportunity.sales_owner || null,
        technical_poc: formData.opportunity.technical_poc || null,
        presales_poc: formData.opportunity.presales_poc || null
      };

      console.log('Submitting opportunity data:', JSON.stringify({
        isEdit,
        opportunityId,
        ...opportunityData
      }, null, 2));

      let result;
      if (isEdit) {
        // For update, make sure we're using the correct ID
        const updateId = opportunityId || formData.opportunity.id;
        if (!updateId) {
          throw new Error('No opportunity ID provided for update');
        }
        result = await opportunityService.updateOpportunity(updateId, opportunityData);
        toast.success('Opportunity updated successfully!');
      } else {
        // For create
        result = await opportunityService.createOpportunity(opportunityData);
        toast.success('Opportunity created successfully!');
      }

      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(result.data);
      }
      
      if (onClose) onClose();
      
    } catch (error) {
      console.error('Error saving opportunity:', error);
      let errorMessage = 'Failed to save opportunity';
      
      if (error.response) {
        console.error('Error response data:', error.response.data);
        if (Array.isArray(error.response.data?.detail)) {
          errorMessage = error.response.data.detail.map(d => d.msg || JSON.stringify(d)).join(', ');
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data?.detail) {
          errorMessage = typeof error.response.data.detail === 'string' 
            ? error.response.data.detail 
            : JSON.stringify(error.response.data.detail);
        }
        console.error('Status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage = 'No response from server';
      } else {
        console.error('Error:', error.message);
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    }
  };

  const handleClientSelect = (e) => {
    updateOpportunityData('client_name', e.target.value);
  };

  // Fetch clients when component mounts
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoadingClients(true);
      try {
        const clientsData = await clientService.getClients();
        setClients(clientsData);
      } catch (error) {
        console.error('Error fetching clients:', error);
        toast.error('Failed to load clients');
      } finally {
        setIsLoadingClients(false);
      }
    };

    fetchClients();
  }, []);

  const addNextStep = async () => {
    if (!nextStepInput.trim()) return;
    
    setIsSubmittingNextStep(true);
    try {
      const newStep = {
        id: Date.now().toString(),
        description: nextStepInput.trim(),
        createdBy: 'Current User', 
        createdAt: new Date().toISOString(),
        userName: 'Current User' 
      };
      
      updateOpportunityData('nextSteps', [...formData.opportunity.nextSteps, newStep]);
      setNextStepInput('');
    } catch (error) {
      console.error('Error adding next step:', error);
      toast.error('Failed to add next step');
    } finally {
      setIsSubmittingNextStep(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch (e) {
      console.error('Error formatting date for input:', e);
      return '';
    }
  };

  const parseDateInput = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date.toISOString();
    } catch (e) {
      console.error('Error parsing date:', e);
      return null;
    }
  };

  return (
    <div className="space-y-6">
      {Object.keys(formErrors).length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Please fix the following errors:
                <ul className="list-disc pl-5 mt-1">
                  {Object.entries(formErrors).map(([field, error]) => (
                    <li key={field} className="text-sm">{error}</li>
                  ))}
                </ul>
              </p>
            </div>
          </div>
        </div>
      )}
      <Tabs value={activeTab} onValueChange={!showOnlyRFP && !showOnlyDetails && !showOnlySOW ? setActiveTab : undefined} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger 
            value="details" 
            disabled={showOnlyRFP || showOnlySOW}
          >
            Details
          </TabsTrigger>
          <TabsTrigger 
            value="rfp"
            disabled={showOnlyDetails || showOnlySOW}
          >
            RFP Details
          </TabsTrigger>
          <TabsTrigger 
            value="sow" 
            disabled={showOnlyRFP || showOnlyDetails}
          >
            SOW Details
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit} className="space-y-6">
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Opportunity Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="opportunity_name">Opportunity Name *</Label>
                    <Input
                      id="opportunity_name"
                      value={formData.opportunity.opportunity_name}
                      onChange={(e) => updateOpportunityData('opportunity_name', e.target.value)}
                      placeholder="Enter opportunity name"
                      className={`w-full ${formErrors.opportunity_name ? 'border-red-500' : ''}`}
                    />
                    {formErrors.opportunity_name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.opportunity_name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="client">Client *</Label>
                    <select
                      id="client"
                      value={formData.opportunity.client_name || ''}
                      onChange={handleClientSelect}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      disabled={isLoadingClients}
                      required
                    >
                      <option value="">
                        {isLoadingClients ? 'Loading clients...' : 'Select a client...'}
                      </option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.client_name}>
                          {client.client_name}
                        </option>
                      ))}
                    </select>
                    {formErrors.client_name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.client_name}</p>
                    )}
                  </div>

                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div>
                      <Label>Start Date</Label>
                      <input
                        type="date"
                        value={formatDateForInput(formData.opportunity.start_date)}
                        onChange={(e) => {
                          const selectedDate = parseDateInput(e.target.value);
                          updateOpportunityData('start_date', selectedDate);
                        }}
                        max={formData.opportunity.closeDate ? formatDateForInput(formData.opportunity.closeDate) : ''}
                        className="w-full p-2 border rounded border-gray-300"
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <Label>Close Date *</Label>
                      {formErrors.closeDate && (
                        <p className="text-sm text-red-600 mb-1">{formErrors.closeDate}</p>
                      )}
                      <input
                        type="date"
                        value={formatDateForInput(formData.opportunity.closeDate)}
                        onChange={(e) => {
                          const selectedDate = parseDateInput(e.target.value);
                          updateOpportunityData('closeDate', selectedDate);
                          if (formErrors.closeDate) {
                            setFormErrors(prev => {
                              const newErrors = { ...prev };
                              delete newErrors.closeDate;
                              return newErrors;
                            });
                          }
                        }}
                        min={formatDateForInput(new Date())}
                        className={`w-full p-2 border rounded ${formErrors.closeDate ? 'border-red-500' : 'border-gray-300'}`}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <div>
                      <Label htmlFor="amount">Amount *</Label>
                      {formErrors.amount && (
                        <p className="text-sm text-red-600 mb-1">{formErrors.amount}</p>
                      )}
                      <div className="flex">
                        <Select
                          value={formData.opportunity.currency}
                          onValueChange={(value) => updateOpportunityData('currency', value)}
                        >
                          <SelectTrigger className="w-[120px] rounded-r-none border-r-0">
                            <SelectValue placeholder="Currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {CURRENCIES.map((currency) => (
                              <SelectItem key={currency.code} value={currency.code}>
                                {currency.code} ({currency.symbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.opportunity.amount}
                          onChange={(e) => updateOpportunityData('amount', e.target.value === '' ? '' : parseFloat(e.target.value) || '')}
                          placeholder="0.00"
                          className="rounded-l-none"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <Label htmlFor="type">Type *</Label>
                    <Select
                      value={formData.opportunity.type}
                      onValueChange={(value) => updateOpportunityData('type', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New Business">New Business</SelectItem>
                        <SelectItem value="Existing Business">Existing Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lead Source */}
                  <div>
                    <Label htmlFor="leadSource">Lead Source *</Label>
                    <Select
                      value={formData.opportunity.leadSource}
                      onValueChange={(value) => updateOpportunityData('leadSource', value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select lead source" />
                      </SelectTrigger>
                      <SelectContent>
                        {LEAD_SOURCES.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Partner Organization (Conditional) */}
                  {formData.opportunity.leadSource === 'Partner Organization' && (
                    <div>
                      <Label htmlFor="partnerOrganization">Partner Organization *</Label>
                      <Input
                        id="partnerOrganization"
                        value={formData.opportunity.partnerOrganization}
                        onChange={(e) => updateOpportunityData('partnerOrganization', e.target.value)}
                        placeholder="Enter partner organization name"
                        required
                      />
                    </div>
                  )}

                  {/* Partner Individual (Conditional) */}
                  {formData.opportunity.leadSource === 'Partner Individual' && (
                    <div>
                      <Label htmlFor="partnerIndividual">Partner Name *</Label>
                      <Input
                        id="partnerIndividual"
                        value={formData.opportunity.partnerIndividual}
                        onChange={(e) => updateOpportunityData('partnerIndividual', e.target.value)}
                        placeholder="Enter partner name"
                        required
                      />
                    </div>
                  )}
    <div>
                    <Label htmlFor="sales_owner">Sales Owner</Label>
                    <Select
                      value={formData.opportunity.sales_owner}
                      onValueChange={(value) => updateOpportunityData('sales_owner', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sales owner" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.filter(user => user.role === 'sales').map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="technical_poc">Technical POC</Label>
                    <Select
                      value={formData.opportunity.technical_poc}
                      onValueChange={(value) => updateOpportunityData('technical_poc', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select technical POC" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.filter(user => user.role === 'technical').map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="presales_poc">Presales POC</Label>
                    <Select
                      value={formData.opportunity.presales_poc}
                      onValueChange={(value) => updateOpportunityData('presales_poc', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select presales POC" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.filter(user => user.role === 'presales').map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Triaged */}
                  <div>
                    <Label htmlFor="triaged">Triaged *</Label>
                    <Select
                      value={formData.opportunity.triaged}
                      onValueChange={(value) => {
                        updateOpportunityData('triaged', value);
                        if (value === 'Drop') {
                          updateOpportunityData('pipelineStatus', '');
                        } else if (!formData.opportunity.pipelineStatus) {
                          const defaultStatus = 'Proposal Work-in-Progress';
                          updateOpportunityData('pipelineStatus', defaultStatus);
                          updateOpportunityData('winProbability', getWinProbability(defaultStatus));
                        }
                      }}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select triage status" />
                      </SelectTrigger>
                      <SelectContent>
                        {TRIAGED_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Pipeline Status - Only show if not 'Drop' */}
                  {formData.opportunity.triaged !== 'Drop' && (
                    <div>
                      <Label htmlFor="pipelineStatus">Pipeline Status *</Label>
                      {formErrors.pipelineStatus && (
                        <p className="text-sm text-red-600 mb-1">{formErrors.pipelineStatus}</p>
                      )}
                      <Select
                        value={formData.opportunity.pipelineStatus}
                        onValueChange={(status) => {
                          updateOpportunityData('pipelineStatus', status);
                          const newWinProbability = getWinProbability(status);
                          updateOpportunityData('winProbability', newWinProbability);
                        }}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {PIPELINE_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Win Probability - Only show if not 'Drop' */}
                  {formData.opportunity.triaged !== 'Drop' && (
                    <div className="md:col-span-2">
                      <div className="flex justify-between items-center mb-2">
                        <Label htmlFor="winProbability">
                          Win Probability: {formData.opportunity.winProbability}%
                        </Label>
                        <div className="text-sm text-muted-foreground">
                          {formData.opportunity.pipelineStatus && (
                            <span className="text-xs text-muted-foreground">
                              Auto: {getWinProbability(formData.opportunity.pipelineStatus)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <Slider
                        id="winProbability"
                        min={0}
                        max={100}
                        step={10}
                        value={[formData.opportunity.winProbability || 0]}
                        onValueChange={([value]) => updateOpportunityData('winProbability', value)}
                        className="w-full"
                        disabled={['Won', 'Lost'].includes(formData.opportunity.pipelineStatus)}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>0%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  )}

                  {/* Next Steps */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <Label>Add Next Step</Label>
                      <div className="flex space-x-2 mt-1">
                        <Input
                          value={nextStepInput}
                          onChange={(e) => setNextStepInput(e.target.value)}
                          placeholder="Add a next step..."
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              addNextStep();
                            }
                          }}
                        />
                        <Button 
                          type="button"
                          onClick={addNextStep}
                          disabled={!nextStepInput.trim() || isSubmittingNextStep}
                        >
                          {isSubmittingNextStep ? 'Adding...' : 'Add'}
                        </Button>
                      </div>
                    </div>

                    {/* Next Steps List */}
                    <div className="space-y-4 mt-4">
                      {formData.opportunity.nextSteps
                        .slice()
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((step) => (
                          <div 
                            key={step.id} 
                            className="p-4 border rounded-lg bg-white shadow-sm hover:shadow transition-shadow"
                          >
                            <div className="flex justify-between items-start">
                              <div className="space-y-1">
                                <div className="font-semibold text-sm">
                                  {step.userName || 'User'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(step.createdAt)}
                                </div>
                                <p className="text-sm mt-1">
                                  {step.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      
                      {formData.opportunity.nextSteps.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          No next steps added yet. Add one above.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* RFP Details Tab */}
          <TabsContent value="rfp" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>RFP Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* RFP Title */}
                  <div className="md:col-span-2">
                    <Label htmlFor="rfpTitle">RFP Title</Label>
                    <Input
                      id="rfpTitle"
                      value={formData.rfpDetails.rfpTitle}
                      onChange={(e) => updateRfpDetails('rfpTitle', e.target.value)}
                    />
                  </div>

                  {/* RFP Status */}
                  <div>
                    <Label htmlFor="rfpStatus">Status</Label>
                    <Select
                      value={formData.rfpDetails.rfpStatus}
                      onValueChange={(value) => updateRfpDetails('rfpStatus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {RFP_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Submission Deadline */}
                  <div>
                    <Label>Submission Deadline</Label>
                    <DateField
                      selected={formData.rfpDetails.submissionDeadline ? new Date(formData.rfpDetails.submissionDeadline) : null}
                      onChange={(date) => updateRfpDetails('submissionDeadline', date)}
                      minDate={new Date()}
                      placeholderText="Select deadline"
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                    />
                  </div>

                  {/* Bid Manager */}
                  <div>
                    <Label htmlFor="bidManager">Bid Manager</Label>
                    <Input
                      id="bidManager"
                      value={formData.rfpDetails.bidManager}
                      onChange={(e) => updateRfpDetails('bidManager', e.target.value)}
                    />
                  </div>

                  {/* Submission Mode */}
                  <div>
                    <Label htmlFor="submissionMode">Submission Mode</Label>
                    <Input
                      id="submissionMode"
                      value={formData.rfpDetails.submissionMode}
                      onChange={(e) => updateRfpDetails('submissionMode', e.target.value)}
                      placeholder="e.g., Email, Portal, etc."
                    />
                  </div>

                  {/* Portal URL */}
                  <div>
                    <Label htmlFor="portalUrl">Portal URL</Label>
                    <Input
                      id="portalUrl"
                      type="url"
                      value={formData.rfpDetails.portalUrl}
                      onChange={(e) => updateRfpDetails('portalUrl', e.target.value)}
                      placeholder="https://"
                    />
                  </div>

                  {/* Q&A Logs */}
                  <div className="md:col-span-2">
                    <Label>Q&A Log</Label>
                    <div className="space-y-2">
                      {formData.rfpDetails.qaLogs?.map((qa, index) => (
                        <div key={qa.id || index} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="space-y-2 flex-1">
                              <div className="font-medium">{qa.question}</div>
                              {qa.answer && (
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium">Answer:</span> {qa.answer}
                                </div> 
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                const newQaLogs = formData.rfpDetails.qaLogs.filter((_, i) => i !== index);
                                updateRfpDetails('qaLogs', newQaLogs);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Asked by {qa.askedBy} on {new Date(qa.askedAt).toLocaleString()}
                            {qa.answeredBy && (
                              <>
                                <br />
                                Answered by {qa.answeredBy} on {new Date(qa.answeredAt).toLocaleString()}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => {
                          const newQa = {
                            id: Date.now().toString(),
                            question: '',
                            askedBy: 'current_user',
                            askedAt: new Date().toISOString()
                          };
                          updateRfpDetails('qaLogs', [...(formData.rfpDetails.qaLogs || []), newQa]);
                        }}
                      >
                        <Plus className="mr-2 h-4 w-4" /> Add Q&A
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RFP Documents */}
            <Card>
              <CardHeader>
                <CardTitle>RFP Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <MultiFileUpload
                  files={formData.rfpDocuments}
                  onChange={(files) => setFormData(prev => ({ ...prev, rfpDocuments: files }))}
                  allowedTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                  maxSize={10 * 1024 * 1024} // 10MB
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* SOW Details Tab */}
          <TabsContent value="sow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Statement of Work Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* SOW Title */}
                  <div className="md:col-span-2">
                    <Label htmlFor="sowTitle">SOW Title</Label>
                    <Input
                      id="sowTitle"
                      value={formData.sowDetails.sowTitle}
                      onChange={(e) => updateSowDetails('sowTitle', e.target.value)}
                    />
                  </div>

                  {/* SOW Status */}
                  <div>
                    <Label htmlFor="sowStatus">Status</Label>
                    <Select
                      value={formData.sowDetails.sowStatus}
                      onValueChange={(value) => updateSowDetails('sowStatus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        {SOW_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Contract Value */}
                  <div>
                    <Label>Contract Value</Label>
                    <div className="flex">
                      <Select
                        value={formData.sowDetails.currency || 'USD'}
                        onValueChange={(value) => updateSowDetails('currency', value)}
                      >
                        <SelectTrigger className="w-[120px] rounded-r-none border-r-0">
                          <SelectValue placeholder="Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} ({currency.symbol})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.sowDetails.contractValue || ''}
                        onChange={(e) => updateSowDetails('contractValue', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="rounded-l-none"
                      />
                    </div>
                  </div>

                  {/* Target Kickoff Date */}
                  <div>
                    <Label>Target Kickoff Date</Label>
                    <DateField
                      selected={formData.sowDetails.targetKickoffDate ? new Date(formData.sowDetails.targetKickoffDate) : null}
                      onChange={(date) => updateSowDetails('targetKickoffDate', date)}
                      minDate={new Date()}
                      placeholderText="Select kickoff date"
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="MMMM d, yyyy h:mm aa"
                    />
                  </div>

                  {/* Linked Proposal Reference */}
                  <div className="md:col-span-2">
                    <Label htmlFor="linkedProposalRef">Linked Proposal Reference</Label>
                    <Input
                      id="linkedProposalRef"
                      value={formData.sowDetails.linkedProposalRef}
                      onChange={(e) => updateSowDetails('linkedProposalRef', e.target.value)}
                      placeholder="Reference ID or name of the linked proposal"
                    />
                  </div>

                  {/* Scope Overview */}
                  <div className="md:col-span-2">
                    <Label htmlFor="scopeOverview">Scope Overview</Label>
                    <Textarea
                      id="scopeOverview"
                      value={formData.sowDetails.scopeOverview}
                      onChange={(e) => updateSowDetails('scopeOverview', e.target.value)}
                      placeholder="Brief overview of the project scope, deliverables, and timeline"
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SOW Documents */}
            <Card>
              <CardHeader>
                <CardTitle>SOW Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <MultiFileUpload
                  files={formData.sowDocuments}
                  onChange={(files) => setFormData(prev => ({ ...prev, sowDocuments: files }))}
                  allowedTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                  maxSize={10 * 1024 * 1024} // 10MB
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Form Actions */}
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {opportunity ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    {activeTab === 'sow' ? 'Add SOW' : 
                     activeTab === 'rfp' ? 'Add RFB' : 
                     (opportunity ? 'Update Opportunity' : 'Create Opportunity')}
                  </>
                )}
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  );
};

OpportunityFormTabbed.propTypes = {
  showOnlyRFP: PropTypes.bool,
  showOnlyDetails: PropTypes.bool,
  showOnlySOW: PropTypes.bool,
  opportunity: PropTypes.shape({
    opportunityId: PropTypes.string,
    // Add other opportunity properties as needed
  }),
  onClose: PropTypes.func,
  onSuccess: PropTypes.func
};

export default OpportunityFormTabbed;