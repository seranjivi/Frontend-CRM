import React, { useState, useEffect, useMemo } from 'react';
import opportunityService from '../services/opportunityService';
import rfpService from '../services/rfpService';
import clientService from '../services/clientService';
import sowService from '../services/sowService';
import { getUsers } from '../services/userService';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Search, ChevronDown, Loader2, Plus, Trash2, Calendar } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { toast } from 'sonner';
import { format } from "date-fns";
import MultiFileUpload from './attachments/MultiFileUpload';
import DateField from './DateField';
import PropTypes from 'prop-types';
import { FileText, X } from 'lucide-react';

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
  const [newQaQuestion, setNewQaQuestion] = useState('');
  const [isQaExpanded, setIsQaExpanded] = useState(false);
  const [clients, setClients] = useState([]);
  const [isLoadingClients, setIsLoadingClients] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleClients, setVisibleClients] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
const [selectedFiles, setSelectedFiles] = useState([]);

  // Filter clients based on search term
  const filteredClients = useMemo(() => {
    if (!searchTerm) return clients;
    const term = searchTerm.toLowerCase();
    return clients.filter(client => 
      client.client_name?.toLowerCase().includes(term) ||
      client.email?.toLowerCase().includes(term) ||
      client.phone?.toLowerCase().includes(term)
    );
  }, [clients, searchTerm]);

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

const OPPORTUNITY_TYPES = [
  'New Business', 
  'Existing Business', 
  'Upsell', 
  'Renewal', 
  'Cross-sell', 
  'Referral'
];  
const PIPELINE_STATUSES = [
    'Proposal Work-in-Progress',
    'Proposal Review',
    'Price Negotiation',
    'Won',
    'Lost'
  ];
  const RFP_TYPES = ['RFP'];
  const RFP_STATUSES = ['Draft', 'Submitted', 'Won', 'Lost', 'In Progress'];
  const SUBMISSION_MODES = ['paid', 'free'];
  const SOW_STATUSES = ['Draft', 'Submitted', 'Won', 'Lost', 'In Progress'];

  const TRIAGED_OPTIONS = [
    { value: 'Proceed', label: 'Proceed (Go)' },
    { value: 'Hold', label: 'Hold (Lead)' },
    { value: 'Drop', label: 'Drop (No-Go)' }
  ];
  
  // Helper function to normalize triage status
  const normalizeTriageStatus = (status) => {
    if (!status) return 'Hold';
    const normalized = status.toString().trim();
    if (['Proceed', 'proceed', 'PROCEED'].includes(normalized)) return 'Proceed';
    if (['Drop', 'drop', 'DROP'].includes(normalized)) return 'Drop';
    if (['Hold', 'hold', 'HOLD'].includes(normalized)) return 'Hold';
    // If we get an unexpected value, default to Hold but log a warning
    console.warn('Unexpected triage status value:', status, '- defaulting to Hold');
    return 'Hold';
  };

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
      sales_owner_name: '',
      technical_poc_name: '',
      presales_poc_name: '',
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
      rfpType: 'RFP',
      rfpStatus: 'Draft',
      rfbDescription: '',
      solutionDescription: '',
      submissionDeadline: '',
      bidManager: '',
      submissionMode: '',
      portalUrl: '',
      questionSubmissionDate: '',
      responseSubmissionDate: '',
      comments: '',
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
  const [users, setUsers] = useState({
    all: [],
    technicalPocUsers: [],
    salesPocUsers: [],
    presalesPocUsers: []
  });
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Fetch users on component mount and update form data when users are loaded
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        const response = await getUsers();
        const allUsers = Array.isArray(response?.data) ? response.data : [];
        
        // Filter users by role for each POC type
        const filterUsersByRole = (roles) => {
          if (!allUsers.length) return [];
          
          
          // If no specific roles provided, return all users with any role
          if (!roles || roles.length === 0) {
            return allUsers.filter(user => {
              const userRole = (user.role_name || (user.roles && user.roles[0]?.name) || '').toLowerCase();
              const hasRole = userRole !== '';
              return hasRole;
            });
          }
          
          return allUsers.filter(user => {
            // Handle both string role and array of roles
            let userRoles = [];
            
            // Case 1: User has role_name
            if (user.role_name) {
              userRoles.push(user.role_name.toLowerCase());
            }
            
            // Case 2: User has roles array
            if (Array.isArray(user.roles)) {
              user.roles.forEach(role => {
                if (typeof role === 'string') {
                  userRoles.push(role.toLowerCase());
                } else if (role && typeof role === 'object') {
                  if (role.name) userRoles.push(role.name.toLowerCase());
                  if (role.role_name) userRoles.push(role.role_name.toLowerCase());
                }
              });
            }
            
            // Case 3: User has a direct 'role' field
            if (user.role) {
              userRoles.push(user.role.toString().toLowerCase());
            }
            
            // Remove duplicates
            userRoles = [...new Set(userRoles)];
            
            const hasMatchingRole = roles.some(role => 
              userRoles.some(userRole => userRole === role.toLowerCase())
            );
            
            
            return hasMatchingRole;
          });
        };

        // For Technical POC, include users with 'user' role
        const technicalPocUsers = filterUsersByRole(['user']);
        
        // For Sales POC, include sales head and any user with sales in their role
        const salesPocUsers = filterUsersByRole(['sales head', 'sales']);
        
        // For Presales POC, include presales roles and any user with presales in their role
        const presalesPocUsers = filterUsersByRole(['presales lead', 'presales member', 'presales']);
        
      
        setUsers({
          all: allUsers,
          technicalPocUsers,
          salesPocUsers,
          presalesPocUsers
        });

        // After loading users, update the form data to ensure proper display of selected users
        if (opportunity) {
          const updateUserField = (field, nameField, userList) => {
            const userId = String(opportunity[field] || opportunity.opportunity?.[field] || '');
            const userName = opportunity[`${field}_name`] || opportunity.opportunity?.[`${field}_name`] || '';
            
            if (userId) {
              // First try to find in the filtered list
              let selectedUser = userList.find(user => 
                String(user.id) === userId || 
                String(user._id) === userId
              );

              // If not found, try in all users (for backward compatibility)
              if (!selectedUser) {
                selectedUser = allUsers.find(user => 
                  String(user.id) === userId || 
                  String(user._id) === userId
                );
              }

              if (selectedUser) {
                setFormData(prev => ({
                  ...prev,
                  opportunity: {
                    ...prev.opportunity,
                    [field]: String(selectedUser.id || selectedUser._id),
                    [nameField]: selectedUser.full_name || 
                                selectedUser.name || 
                                selectedUser.email || 
                                `User ${selectedUser.id || selectedUser._id}`
                  }
                }));
              } else if (userName) {
                // Keep existing selection even if not in filtered list
                setFormData(prev => ({
                  ...prev,
                  opportunity: {
                    ...prev.opportunity,
                    [field]: userId,
                    [nameField]: userName
                  }
                }));
              } else if (userId) {
                // Fallback for cases where we only have the ID
                setFormData(prev => ({
                  ...prev,
                  opportunity: {
                    ...prev.opportunity,
                    [field]: userId,
                    [nameField]: `User ${userId}`
                  }
                }));
              }
            }
          };

          // Update POC fields with their respective user lists
          updateUserField('sales_owner', 'sales_owner_name', salesPocUsers);
          updateUserField('technical_poc', 'technical_poc_name', technicalPocUsers);
          updateUserField('presales_poc', 'presales_poc_name', presalesPocUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
        setUsers({
          all: [],
          technicalPocUsers: [],
          salesPocUsers: [],
          presalesPocUsers: []
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [opportunity]); // Add opportunity to dependency array

  // Debug effect to log triaged status changes and form data
  useEffect(() => {
    if (opportunity) {
      const normalized = normalizeTriageStatus(opportunity.triaged_status);      
      // Force update the form data with the normalized value
      if (normalized && normalized !== formData.opportunity.triaged) {
        updateOpportunityData('triaged', normalized);
      }
    }
  }, [opportunity, formData.opportunity.triaged]);

  // Log form data changes
  useEffect(() => {
  }, [formData.opportunity.triaged]);

  // Update form data when opportunity prop changes
  useEffect(() => {
    if (opportunity) {
      // Create new form data object
      const newFormData = {
        opportunity: {
          ...defaultFormData.opportunity,
          // Map API fields to form fields
          opportunity_name: opportunity.opportunity_name || opportunity.opportunity?.opportunity_name || '',
          client_name: opportunity.client_name || opportunity.opportunity?.client_name || 'Unknown Client',
          closeDate: opportunity.close_date || opportunity.opportunity?.closeDate || '',
          // Handle both snake_case and camelCase date formats, and ensure proper date string format
          start_date: opportunity.start_date ||
            opportunity.opportunity?.start_date ||
            (opportunity.opportunity?.startDate ?
              new Date(opportunity.opportunity.startDate).toISOString().split('T')[0] :
              ''),
          
          // Handle sales owner data
          sales_owner: String(opportunity.sales_owner || opportunity.opportunity?.sales_owner || ''),
          sales_owner_name: opportunity.sales_owner_name || opportunity.opportunity?.sales_owner_name || 
                           (opportunity.sales_owner ? `User ${opportunity.sales_owner}` : ''),
          technical_poc: String(opportunity.technical_poc || ''), // Convert to string
          technical_poc_name: opportunity.technical_poc_name || '',
          presales_poc: String(opportunity.presales_poc || ''), // Convert to string
          presales_poc_name: opportunity.presales_poc_name || '',
          
          amount: opportunity.amount || opportunity.opportunity?.amount || '',
          currency: opportunity.amount_currency || opportunity.currency || opportunity.opportunity?.currency || 'USD',
          
          // FIX: Remove duplicate leadSource line
          leadSource: opportunity.lead_source || opportunity.leadSource || opportunity.opportunity?.leadSource || '',
          
          // FIX: Make sure these are properly mapped
          type: opportunity.opportunity_type || opportunity.type || opportunity.opportunity?.type || 'New Business',
          // Explicitly prioritize triaged_status from the API response
          // Ensure we're using the normalized value directly
          triaged: opportunity.triaged_status ? 
            normalizeTriageStatus(opportunity.triaged_status) : 
            (opportunity.opportunity?.triaged_status ? 
              normalizeTriageStatus(opportunity.opportunity.triaged_status) : 
              (opportunity.triaged ? 
                normalizeTriageStatus(opportunity.triaged) : 
                'Hold')),
          pipelineStatus: opportunity.pipeline_status || opportunity.opportunity?.pipelineStatus || 'Proposal Work-in-Progress',
          winProbability: opportunity.win_probability || opportunity.opportunity?.winProbability || 20,
          nextSteps: Array.isArray(opportunity.next_steps) ? opportunity.next_steps : 
                    (Array.isArray(opportunity.nextSteps) ? opportunity.nextSteps :
                    (Array.isArray(opportunity.opportunity?.nextSteps) ? opportunity.opportunity.nextSteps : [])),
          createdBy: opportunity.created_by || opportunity.user_name || opportunity.opportunity?.createdBy || 'System',
          description: opportunity.description || opportunity.opportunity?.description || '',
          id: opportunity.id || opportunity.opportunity?.id || '',
          // Include any other direct opportunity fields that might be at the root level
          ...(opportunity.opportunity || {})
        },
        rfpDetails: {
          ...defaultFormData.rfpDetails,
          ...(opportunity.rfpDetails || {}),
          // Map RFP details from root level if they exist
          rfpTitle: opportunity.rfp_title || opportunity.rfpDetails?.rfpTitle || '',
          rfpType: opportunity.rfp_type || opportunity.rfpDetails?.rfpType || 'RFP',
          rfpStatus: opportunity.rfp_status || opportunity.rfpDetails?.rfpStatus || 'Draft',
          rfbDescription: opportunity.rfb_description || opportunity.rfpDetails?.rfbDescription || '',
          solutionDescription: opportunity.solution_description || opportunity.rfpDetails?.solutionDescription || '',
          submissionDeadline: opportunity.submission_deadline || opportunity.rfpDetails?.submissionDeadline || '',
          bidManager: opportunity.bid_manager || opportunity.rfpDetails?.bidManager || '',
          submissionMode: opportunity.submission_mode || opportunity.rfpDetails?.submissionMode || '',
          portalUrl: opportunity.portal_url || opportunity.rfpDetails?.portalUrl || '',
          questionSubmissionDate: opportunity.question_submission_date || opportunity.rfpDetails?.questionSubmissionDate || '',
          responseSubmissionDate: opportunity.response_submission_date || opportunity.rfpDetails?.responseSubmissionDate || '',
          comments: opportunity.comments || opportunity.rfpDetails?.comments || '',
          qaLogs: Array.isArray(opportunity.qa_logs)
            ? opportunity.qa_logs
            : (Array.isArray(opportunity.rfpDetails?.qaLogs)
              ? opportunity.rfpDetails.qaLogs
              : [])
        },
        sowDetails: {
          ...defaultFormData.sowDetails,
          ...(opportunity.sowDetails || {}),
          // Map SOW details from root level if they exist
          sowTitle: opportunity.sow_title || opportunity.sowDetails?.sowTitle || '',
          sowStatus: opportunity.sow_status || opportunity.sowDetails?.sowStatus || 'Draft',
          contractValue: opportunity.contract_value || opportunity.sowDetails?.contractValue || 0,
          currency: opportunity.currency || opportunity.sowDetails?.currency || 'USD',
          targetKickoffDate: opportunity.target_kickoff_date || opportunity.sowDetails?.targetKickoffDate || '',
          linkedProposalRef: opportunity.linked_proposal_ref || opportunity.sowDetails?.linkedProposalRef || '',
          scopeOverview: opportunity.scope_overview || opportunity.sowDetails?.scopeOverview || ''
        },
        rfpDocuments: Array.isArray(opportunity.rfpDocuments)
          ? opportunity.rfpDocuments
          : [],
        sowDocuments: Array.isArray(opportunity.sowDocuments)
          ? opportunity.sowDocuments
          : []
      };
      setFormData(newFormData);
    }
  }, [opportunity]);

  const updateOpportunityData = (field, value) => {
    if (opportunity?.isViewMode) return; // Prevent updates in view mode
    setFormData(prev => ({
      ...prev,
      opportunity: {
        ...prev.opportunity,
        [field]: value
      }
    }));
  };

  const updateRfpDetails = (field, value) => {
    if (opportunity?.isViewMode) return; // Prevent updates in view mode
    setFormData(prev => ({
      ...prev,
      rfpDetails: {
        ...prev.rfpDetails,
        [field]: value,
        // Update related fields if needed
        ...(field === 'rfpTitle' && !prev.opportunity.opportunity_name && {
          opportunity: {
            ...prev.opportunity,
            opportunity_name: value
          }
        })
      }
    }));
  };

  const updateSowDetails = (field, value) => {
    if (opportunity?.isViewMode) return; // Prevent updates in view mode
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
      errors.opportunity_name = 'Name is required';
    }
    if (!formData.opportunity.client_name) {
      errors.client_name = 'Client selection is required';
    }
    if (!formData.opportunity.closeDate) {
      errors.closeDate = 'End date is required';
    }
    if (formData.opportunity.amount && parseFloat(formData.opportunity.amount) <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }
    if (formData.opportunity.triaged !== 'Drop' && formData.opportunity.triaged !== 'Hold' && !formData.opportunity.pipelineStatus) {
      errors.pipelineStatus = 'Pipeline status is required';
    }

    return errors;
  };

  const formatNextSteps = (nextSteps) => {
  if (!Array.isArray(nextSteps)) return [];
  
  return nextSteps.map(step => ({
    step: typeof step === 'string' ? step : step.description || step.step || '',
    assigned_to: step.assigned_to || step.userName || 'Unassigned',
    due_date: step.due_date || new Date().toISOString(),
    status: step.status || 'pending'
  }));
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
            status: formData.sowDetails.sowStatus || '',
            contractValue: parseFloat(formData.sowDetails.contractValue) || 0,
            currency: formData.sowDetails.currency || '',
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
            // window.location.href = '/sows';

        } catch (error) {
          console.error('Error in SOW creation flow:', error);
          toast.error(error.response?.data?.message || 'Failed to create SOW');
        } finally {
          setLoading(false);
        }
        return;
      }

      // Handle RFP creation/update if in RFP tab
      if (activeTab === 'rfp') {
        const opportunityId = opportunity?.id || opportunity?.opportunity?.id;
        const rfpData = {
          opportunityName: formData.opportunity.opportunity_name || 'New RFP',
          title: formData.rfpDetails?.rfpTitle || formData.opportunity.opportunity_name || 'New RFP',
          rfp_type: formData.rfpDetails?.rfpType || 'RFP',
          rfp_status: formData.rfpDetails?.rfpStatus || 'Draft',
          rfp_description: formData.rfpDetails?.rfbDescription || '',
          solution_description: formData.rfpDetails?.solutionDescription || '',
          submission_deadline: formData.rfpDetails?.submissionDeadline || formData.opportunity.closeDate || new Date().toISOString().split('T')[0],
          bid_manager: formData.rfpDetails?.bidManager || formData.opportunity.assignedTo || '',
          submission_mode: formData.rfpDetails?.submissionMode || 'paid',
          portal_url: formData.rfpDetails?.portalUrl || '',
          question_submission_date: formData.rfpDetails?.questionSubmissionDate || '',
          response_submission_date: formData.rfpDetails?.responseSubmissionDate || '',
          comments: formData.rfpDetails?.comments || '',
          opportunity_id: opportunityId,
          rfpDocuments: formData.rfpDocuments || []
        };

        let result;
        try {
          // First, check if an RFP already exists for this opportunity
          const existingRfps = await rfpService.getRFPsByOpportunityId(opportunityId);
          const existingRfp = Array.isArray(existingRfps?.data) ? existingRfps.data[0] : existingRfps?.data;
          
          if (existingRfp?.id) {
            // Update existing RFP
            result = await rfpService.updateRFP(existingRfp.id, rfpData);
            toast.success('RFP updated successfully!');
          } else {
            // Create new RFP if none exists
            result = await rfpService.createRFP(rfpData);
            toast.success('RFP created successfully!');
          }
        } catch (error) {
          console.error('Error checking for existing RFP:', error);
          // If there's an error checking, try to create a new one as fallback
          result = await rfpService.createRFP(rfpData);
          toast.success('RFP created successfully!');
        }

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
        opportunity_type: formData.opportunity.type || '',
        triaged_status: formData.opportunity.triaged === 'Proceed' ? 'Proceed' :
          (formData.opportunity.triaged === 'Drop' ? 'Drop' : 'Hold'),
        pipeline_status: formData.opportunity.pipelineStatus || 'Proposal Work-in-Progress',
        win_probability: parseInt(formData.opportunity.winProbability) || 20,
        user_name: formData.opportunity.createdBy || 'System',
        start_date: startDate,
        sales_owner: formData.opportunity.sales_owner || null,
        technical_poc: formData.opportunity.technical_poc || null,
        presales_poc: formData.opportunity.presales_poc || null,
        next_steps: formatNextSteps(formData.opportunity.nextSteps || [])

      };
      let result;
      if (isEdit) {
        // For update, make sure we're using the correct ID
        const updateId = opportunityId || formData.opportunity.id;
        if (!updateId) {
          throw new Error('No Lead ID provided for update');
        }
        result = await opportunityService.updateOpportunity(updateId, opportunityData);
        toast.success('Lead updated successfully!');
      } else {
        // For create
        result = await opportunityService.createOpportunity(opportunityData);
        toast.success('Lead created successfully!');
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
    if (opportunity?.isViewMode) return; // Prevent updates in view mode
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
    if (!nextStepInput.trim() || opportunity?.isViewMode) return;

    setIsSubmittingNextStep(true);
    try {
      // Get the current user from localStorage
      const authUser = JSON.parse(localStorage.getItem('user') || '{}');
      const userName = authUser?.full_name || authUser?.name || authUser?.email || 'User';

      const newStep = {
        id: Date.now().toString(),
        description: nextStepInput.trim(),
        createdBy: userName,
        createdAt: new Date().toISOString(),
        userName: userName
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

  // Helper function to get user display name
  const getUserName = (userId) => {
    if (!userId) return '';
    
    // Check if we have the name in form data
    if (formData.opportunity.sales_owner === userId) {
      return formData.opportunity.sales_owner_name;
    }
    if (formData.opportunity.technical_poc === userId) {
      return formData.opportunity.technical_poc_name;
    }
    if (formData.opportunity.presales_poc === userId) {
      return formData.opportunity.presales_poc_name;
    }
    
    return `User ${userId}`;
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
            Opportunity-RFP
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
                <CardTitle>Lead Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="opportunity_name">Name <span className="text-red-500">*</span></Label>
                    <Input
                      id="opportunity_name"
                      value={formData.opportunity.opportunity_name}
                      onChange={(e) => updateOpportunityData('opportunity_name', e.target.value)}
                      placeholder="Enter Lead name"
                      className={`w-full ${formErrors.opportunity_name ? 'border-red-500' : ''}`}
                      disabled={opportunity?.isViewMode}
                    />
                    {formErrors.opportunity_name && (
                      <p className="text-red-600 text-sm mt-1">{formErrors.opportunity_name}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="client">Client <span className="text-red-600">*</span></Label>
                    <Select
                      value={formData.opportunity.client_name || ''}
                      onValueChange={(value) => {
                        if (value === 'add_new') {
                          window.location.href = '/clients';
                          return;
                        }
                        const client = clients.find(c => c.client_name === value);
                        if (client) {
                          handleClientSelect({ target: { value: client.client_name } });
                        }
                      }}
                      disabled={isLoadingClients || opportunity?.isViewMode}
                      required
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={isLoadingClients ? 'Loading clients...' : 'Select a client...'} />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-3 py-2">
                          <input
                            type="text"
                            placeholder="Search clients..."
                            className="w-full p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            value={searchTerm}
                            disabled={opportunity?.isViewMode}
                          />
                        </div>
                        <div 
                          className="max-h-60 overflow-y-auto" 
                          onScroll={(e) => {
                            const { scrollTop, scrollHeight, clientHeight } = e.target;
                            if (scrollHeight - scrollTop === clientHeight && !isLoadingMore) {
                              setVisibleClients(prev => Math.min(prev + 10, filteredClients.length));
                            }
                          }}
                        >
                          <SelectItem value="add_new" className="font-medium text-blue-600 bg-blue-50">
                            + Add New Client
                          </SelectItem>
                          {filteredClients.slice(0, visibleClients).map((client) => (
                            <SelectItem key={client.id} value={client.client_name}>
                              {client.client_name}
                            </SelectItem>
                          ))}
                          {filteredClients.length === 0 && (
                            <div className="px-2 py-1.5 text-sm text-gray-500">
                              {searchTerm ? 'No matching clients found' : 'No clients available'}
                            </div>
                          )}
                        </div>
                      </SelectContent>
                    </Select>
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
                        className={`w-full p-2 border rounded border-gray-300 ${opportunity?.isViewMode ? 'bg-gray-100' : ''}`}
                        disabled={opportunity?.isViewMode}
                      />
                    </div>
                  </div>
                  <div>
                    <div>
                      <Label>End Date</Label>
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
                        className={`w-full p-2 border rounded border-gray-300 ${opportunity?.isViewMode ? 'bg-gray-100' : ''}`}
                        disabled={opportunity?.isViewMode}
                      />
                    </div>
                  </div>

                  <div>
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <div className="flex">
                        <Select
                          value={formData.opportunity.currency}
                          onValueChange={(value) => updateOpportunityData('currency', value)}
                          disabled={opportunity?.isViewMode}

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
                          disabled={opportunity?.isViewMode}

                          
                        />
                      </div>
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <Label htmlFor="type">Type <span className="text-red-600">*</span></Label>
                    <Select
                      value={formData.opportunity.type || opportunity?.opportunity_type || ''}
                      onValueChange={(value) => {
                        updateOpportunityData('type', value);
                      }}
                      required
                      disabled={opportunity?.isViewMode}

                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type">
                          {formData.opportunity.type || opportunity?.opportunity_type || 'Select type'}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="New Business">New Business</SelectItem>
                        <SelectItem value="Existing Business">Existing Business</SelectItem>
                        <SelectItem value="Upsell">Upsell</SelectItem>
                        <SelectItem value="Renewal">Renewal</SelectItem>
                        <SelectItem value="Cross-sell">Cross-sell</SelectItem>
                        <SelectItem value="Referral">Referral</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Lead Source */}
                  <div>
                    <Label htmlFor="leadSource">Lead Source <span className="text-red-600">*</span></Label>
                    <Select
                      value={formData.opportunity.leadSource || opportunity?.lead_source || ''}
                      onValueChange={(value) => updateOpportunityData('leadSource', value)}
                      required
                      disabled={opportunity?.isViewMode}

                    >
                      <SelectTrigger className={opportunity?.isViewMode ? 'bg-gray-100' : ''}>
                        <SelectValue placeholder="Select lead source">
                          {formData.opportunity.leadSource || opportunity?.lead_source || 'Select lead source'}
                        </SelectValue>
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
                      <Label htmlFor="partnerOrganization">Partner Organization <span className="text-red-600">*</span></Label>
                      <Input
                        id="partnerOrganization"
                        value={formData.opportunity.partnerOrganization}
                        onChange={(e) => updateOpportunityData('partnerOrganization', e.target.value)}
                        placeholder="Enter partner organization name"
                        required
                        disabled={opportunity?.isViewMode}

                      />
                    </div>
                  )}

                  {/* Partner Individual (Conditional) */}
                  {formData.opportunity.leadSource === 'Partner Individual' && (
                    <div>
                      <Label htmlFor="partnerIndividual">Partner Name <span className="text-red-600">*</span></Label>
                      <Input
                        id="partnerIndividual"
                        value={formData.opportunity.partnerIndividual}
                        onChange={(e) => updateOpportunityData('partnerIndividual', e.target.value)}
                        placeholder="Enter partner name"
                        required
                        disabled={opportunity?.isViewMode}

                      />
                    </div>
                  )}

                  {/* Sales Owner */}
                  <div>
                    <Label htmlFor="sales_owner">Sales POC</Label>
                    <Select
                      value={formData.opportunity.sales_owner || ''}
                      onValueChange={(value) => {
                        if (opportunity?.isViewMode) return;
                        const selectedUser = users.salesPocUsers.find(user => 
                          String(user.id) === String(value) || 
                          String(user._id) === String(value)
                        );

                        if (selectedUser) {
                          setFormData(prev => ({
                            ...prev,
                            opportunity: {
                              ...prev.opportunity,
                              sales_owner: String(selectedUser.id || selectedUser._id),
                              sales_owner_name: selectedUser.full_name || 
                                              selectedUser.name || 
                                              selectedUser.email || 
                                              `User ${selectedUser.id || selectedUser._id}`
                            }
                          }));
                        }
                      }}
                      disabled={opportunity?.isViewMode || isLoadingUsers}
                    >
                      <SelectTrigger className={opportunity?.isViewMode ? 'bg-gray-100' : ''}>
                        <SelectValue placeholder={isLoadingUsers ? 'Loading users...' : 'Select sales POC'}>
                          {formData.opportunity.sales_owner_name || 
                           (formData.opportunity.sales_owner
                             ? `User ${formData.opportunity.sales_owner}`
                             : 'Select sales POC'
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingUsers ? (
                          <div className="p-2 text-center">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground mt-1">Loading users...</p>
                          </div>
                        ) : users.salesPocUsers.length > 0 ? (
                          users.salesPocUsers.map((user) => {
                            const userId = user.id || user._id;
                            if (!userId) return null;
                            
                            return (
                              <SelectItem key={userId} value={String(userId)}>
                                {user.full_name || user.name || user.email || `User ${userId}`}
                              </SelectItem>
                            );
                          })
                        ) : (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            No Sales Head users found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Technical POC */}
                  <div>
                    <Label htmlFor="technical_poc">Technical POC</Label>
                    <Select
                      value={formData.opportunity.technical_poc || ''}
                      onValueChange={(value) => {
                        if (opportunity?.isViewMode) return;
                        const selectedUser = users.technicalPocUsers.find(user => 
                          String(user.id) === String(value) || 
                          String(user._id) === String(value)
                        );
                        
                        if (selectedUser) {
                          setFormData(prev => ({
                            ...prev,
                            opportunity: {
                              ...prev.opportunity,
                              technical_poc: String(selectedUser.id || selectedUser._id),
                              technical_poc_name: selectedUser.full_name || 
                                              selectedUser.name || 
                                              selectedUser.email || 
                                              `User ${selectedUser.id || selectedUser._id}`
                            }
                          }));
                        }
                      }}
                      disabled={opportunity?.isViewMode || isLoadingUsers}
                    >
                      <SelectTrigger className={opportunity?.isViewMode ? 'bg-gray-100' : ''}>
                        <SelectValue placeholder={isLoadingUsers ? 'Loading users...' : 'Select technical POC'}>
                          {formData.opportunity.technical_poc_name || 
                           (formData.opportunity.technical_poc
                             ? `User ${formData.opportunity.technical_poc}`
                             : 'Select technical POC'
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingUsers ? (
                          <div className="p-2 text-center">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground mt-1">Loading users...</p>
                          </div>
                        ) : users.technicalPocUsers.length > 0 ? (
                          users.technicalPocUsers.map((user) => {
                            const userId = user.id || user._id;
                            if (!userId) return null;
                            
                            return (
                              <SelectItem key={userId} value={String(userId)}>
                                {user.full_name || user.name || user.email || `User ${userId}`}
                              </SelectItem>
                            );
                          })
                        ) : (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            No User role users found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Presales POC */}
                  <div>
                    <Label htmlFor="presales_poc">Presales POC</Label>
                    <Select
                      value={formData.opportunity.presales_poc || ''}
                      onValueChange={(value) => {
                        if (opportunity?.isViewMode) return;
                        const selectedUser = users.presalesPocUsers.find(user => 
                          String(user.id) === String(value) || 
                          String(user._id) === String(value)
                        );
                        
                        if (selectedUser) {
                          setFormData(prev => ({
                            ...prev,
                            opportunity: {
                              ...prev.opportunity,
                              presales_poc: String(selectedUser.id || selectedUser._id),
                              presales_poc_name: selectedUser.full_name || 
                                              selectedUser.name || 
                                              selectedUser.email || 
                                              `User ${selectedUser.id || selectedUser._id}`
                            }
                          }));
                        }
                      }}
                      disabled={opportunity?.isViewMode || isLoadingUsers}
                    >
                      <SelectTrigger className={opportunity?.isViewMode ? 'bg-gray-100' : ''}>
                        <SelectValue placeholder={isLoadingUsers ? 'Loading users...' : 'Select presales POC'}>
                          {formData.opportunity.presales_poc_name || 
                           (formData.opportunity.presales_poc
                             ? `User ${formData.opportunity.presales_poc}`
                             : 'Select presales POC'
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {isLoadingUsers ? (
                          <div className="p-2 text-center">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                            <p className="text-sm text-muted-foreground mt-1">Loading users...</p>
                          </div>
                        ) : users.presalesPocUsers.length > 0 ? (
                          users.presalesPocUsers.map((user) => {
                            const userId = user.id || user._id;
                            if (!userId) return null;
                            
                            return (
                              <SelectItem key={userId} value={String(userId)}>
                                {user.full_name || user.name || user.email || `User ${userId}`}
                              </SelectItem>
                            );
                          })
                        ) : (
                          <div className="p-2 text-center text-sm text-muted-foreground">
                            No Presales users found
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Triaged */}
                  <div>
                    <Label htmlFor="triaged">Triaged <span className="text-red-600">*</span></Label>
                    <Select
                      value={formData.opportunity.triaged || 'Hold'}
                      onValueChange={(value) => {
                        if (opportunity?.isViewMode) return;
                        const normalizedValue = normalizeTriageStatus(value);
                        updateOpportunityData('triaged', normalizedValue);
                        if (normalizedValue === 'Drop') {
                          updateOpportunityData('pipelineStatus', '');
                        } else if (!formData.opportunity.pipelineStatus) {
                          const defaultStatus = 'Proposal Work-in-Progress';
                          updateOpportunityData('pipelineStatus', defaultStatus);
                          updateOpportunityData('winProbability', getWinProbability(defaultStatus));
                        }
                      }}
                      disabled={opportunity?.isViewMode}
                      required
                    >
                      <SelectTrigger className={opportunity?.isViewMode ? 'bg-gray-100' : ''}>
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
                  {(formData.opportunity.triaged !== 'Drop' && formData.opportunity.triaged !== 'Hold') && (
                    <div>
                      <Label htmlFor="pipelineStatus">Pipeline Status <span className="text-red-600">*</span></Label>
                      {formErrors.pipelineStatus && (
                        <p className="text-sm text-red-600 mb-1">{formErrors.pipelineStatus}</p>
                      )}
                      <Select
                        value={formData.opportunity.pipelineStatus}
                        onValueChange={(status) => {
                          if (opportunity?.isViewMode) return;
                          updateOpportunityData('pipelineStatus', status);
                          const newWinProbability = getWinProbability(status);
                          updateOpportunityData('winProbability', newWinProbability);
                        }}
                        disabled={opportunity?.isViewMode}
                        required
                      >
                        <SelectTrigger className={opportunity?.isViewMode ? 'bg-gray-100' : ''}>
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
                  {(formData.opportunity.triaged !== 'Drop' && formData.opportunity.triaged !== 'Hold') && (
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
                        onChange={(e) => {
                          if (opportunity?.isViewMode) return;
                          updateOpportunityData('winProbability', parseInt(e.target.value, 10));
                        }}
                        disabled={opportunity?.isViewMode || ['Won', 'Lost'].includes(formData.opportunity.pipelineStatus)}
                        className="w-full"
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
                          placeholder="Enter next step"
                          onKeyDown={(e) => e.key === 'Enter' && addNextStep()}
                          disabled={opportunity?.isViewMode}
                          className={opportunity?.isViewMode ? 'bg-gray-100' : ''}
                        />
                        <Button
                          type="button"
                          onClick={addNextStep}
                          disabled={!nextStepInput.trim() || isSubmittingNextStep || opportunity?.isViewMode}
                        >
                          {isSubmittingNextStep ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Add'
                          )}
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
                                  {step.assigned_to || 'Unassigned'}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatDate(step.due_date || step.createdAt)}
                                </div>
                                <p className="text-sm mt-1">
                                  {step.step || step.description || 'No description'}
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
                <CardTitle>Opportunity-RFP Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* RFP Type */}
                  <div>
                    <Label htmlFor="rfpType">Type</Label>
                    <Select
                      value={formData.rfpDetails.rfpType || 'RFP'}
                      onValueChange={(value) => updateRfpDetails('rfpType', value)}
                    >
                      <SelectTrigger className={opportunity?.isViewMode ? 'bg-gray-100' : ''}>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {RFP_TYPES.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* RFP Status */}
                  <div>
                    <Label htmlFor="rfpStatus">Status</Label>
                    <Select
                      value={formData.rfpDetails.rfpStatus}
                      onValueChange={(value) => updateRfpDetails('rfpStatus', value)}
                    >
                      <SelectTrigger className={opportunity?.isViewMode ? 'bg-gray-100' : ''}>
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
                  {/* RFP Status */}
                  <div>
                    <Label htmlFor="rfbDescription">RFP Description</Label>
                    <Textarea
                      id="rfbDescription"
                      value={formData.rfpDetails.rfbDescription || ''}
                      onChange={(e) => updateRfpDetails('rfbDescription', e.target.value)}
                      placeholder="Enter RFB description..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="solutionDescription">Solution Description</Label>
                    <Textarea
                      id="solutionDescription"
                      value={formData.rfpDetails.solutionDescription || ''}
                      onChange={(e) => updateRfpDetails('solutionDescription', e.target.value)}
                      placeholder="Enter solution description..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="submissionDeadline">Submission Deadline</Label>
                    <Input
                      id="submissionDeadline"
                      type="date"
                      value={
                        formData.rfpDetails.submissionDeadline
                          ? formatDateForInput(formData.rfpDetails.submissionDeadline)
                          : ''
                      }
                      onChange={(e) =>
                        updateRfpDetails('submissionDeadline', e.target.value)
                      }
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <Label htmlFor="bidManager">Response Owner</Label>
                    <Input
                      type="text"
                      value={formData.rfpDetails.bidManager || ''}
                      onChange={(e) => {
                        updateRfpDetails('bidManager', e.target.value);
                      }}
                      placeholder="Enter bid manager name"
                    />
                  </div>

                  {/* Submission Mode */}
                  <div>
                    <Label htmlFor="submissionMode">Submission Mode</Label>
                    <Input
                      id="submissionMode"
                      type="text"
                      value={formData.rfpDetails.submissionMode || ''}
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
                  <div className="md:col-span-2 -mt-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mb-2 bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200"
                      onClick={() => setIsQaExpanded(!isQaExpanded)}
                    >
                      Q&A
                    </Button>
                    
                    {isQaExpanded && (
                      <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
  <Label htmlFor="question-submission-date">Question Submission Date</Label>
  <Input
    id="question-submission-date"
    type="date"
    className="mt-1 w-full"
    value={formData.rfpDetails.questionSubmissionDate ? 
      formatDateForInput(formData.rfpDetails.questionSubmissionDate) : ''}
    onChange={(e) => {
      // Update root level date
      updateRfpDetails('questionSubmissionDate', e.target.value);
      
      // Also update qaLogs if it exists
      if (formData.rfpDetails.qaLogs?.length > 0) {
        const updatedQaLogs = [...formData.rfpDetails.qaLogs];
        updatedQaLogs[0] = {
          ...updatedQaLogs[0],
          questionSubmissionDate: e.target.value,
          askedAt: e.target.value || new Date().toISOString()
        };
        updateRfpDetails('qaLogs', updatedQaLogs);
      }
    }}
  />
</div>
                          <div>
  <Label htmlFor="response-submission-date">Response Submission Date</Label>
  <Input
    id="response-submission-date"
    type="date"
    className="mt-1 w-full"
    value={formData.rfpDetails.responseSubmissionDate ? 
      formatDateForInput(formData.rfpDetails.responseSubmissionDate) : ''}
    onChange={(e) => {
      // Update root level date
      updateRfpDetails('responseSubmissionDate', e.target.value);
      
      // Also update qaLogs if it exists
      if (formData.rfpDetails.qaLogs?.length > 0) {
        const updatedQaLogs = [...formData.rfpDetails.qaLogs];
        updatedQaLogs[0] = {
          ...updatedQaLogs[0],
          responseSubmissionDate: e.target.value
        };
        updateRfpDetails('qaLogs', updatedQaLogs);
      }
    }}
  />
</div>
                        </div>
                        
                        <div>
  <Label htmlFor="qa-comment">Comment Box</Label>
  <Textarea
    id="qa-comment"
    className="mt-1 w-full min-h-[100px]"
    placeholder="Add your comments here..."
    value={formData.rfpDetails.comments || ''}
    onChange={(e) => {
      // Update root level comments
      updateRfpDetails('comments', e.target.value);
      
      // Also update qaLogs if it exists
      if (formData.rfpDetails.qaLogs?.length > 0) {
        const updatedQaLogs = [...formData.rfpDetails.qaLogs];
        updatedQaLogs[0] = {
          ...updatedQaLogs[0],
          question: e.target.value
        };
        updateRfpDetails('qaLogs', updatedQaLogs);
      }
    }}
  />
</div>
                        
                       <div>
  <Label>QA Document Upload</Label>
  <div className="mt-1 flex flex-col items-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
    <div className="space-y-1 text-center">
      <div className="flex text-sm text-muted-foreground">
        <label
          htmlFor="file-upload"
          className="relative cursor-pointer bg-transparent rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none"
        >
          <span>Upload a file</span>
          <input
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept=".pdf,.doc,.docx"
            onChange={(e) => {
              const files = Array.from(e.target.files);
              setSelectedFiles(files);
              
              // Also update the form data if needed
              updateRfpDetails('qaDocuments', files);
            }}
          />
        </label>
        <p className="pl-1">or drag and drop</p>
      </div>
      <p className="text-xs text-muted-foreground">
        PDF, DOC, DOCX up to 10MB
      </p>
    </div>
    
    {/* Display selected files */}
    {selectedFiles.length > 0 && (
      <div className="mt-4 w-full">
        <p className="text-sm font-medium mb-2">Selected Files:</p>
        <ul className="space-y-2">
          {selectedFiles.map((file, index) => (
            <li key={index} className="flex items-center justify-between p-2 border rounded">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span className="text-sm truncate max-w-xs">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => {
                  const newFiles = [...selectedFiles];
                  newFiles.splice(index, 1);
                  setSelectedFiles(newFiles);
                  updateRfpDetails('qaDocuments', newFiles);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* RFP Documents */}
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Commercial */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Commercial</h4>
                    <MultiFileUpload
                      files={formData.rfpDocuments?.commercial || []}
                      onChange={(files) => setFormData(prev => ({
                        ...prev,
                        rfpDocuments: {
                          ...prev.rfpDocuments,
                          commercial: files
                        }
                      }))}
                      allowedTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                      maxSize={10 * 1024 * 1024} // 10MB
                    />
                  </div>

                  {/* Proposal */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Proposal</h4>
                    <MultiFileUpload
                      files={formData.rfpDocuments?.proposal || []}
                      onChange={(files) => setFormData(prev => ({
                        ...prev,
                        rfpDocuments: {
                          ...prev.rfpDocuments,
                          proposal: files
                        }
                      }))}
                      allowedTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                      maxSize={10 * 1024 * 1024} // 10MB
                    />
                  </div>

                  {/* Presentation */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Presentation</h4>
                    <MultiFileUpload
                      files={formData.rfpDocuments?.presentation || []}
                      onChange={(files) => setFormData(prev => ({
                        ...prev,
                        rfpDocuments: {
                          ...prev.rfpDocuments,
                          presentation: files
                        }
                      }))}
                      allowedTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                      maxSize={10 * 1024 * 1024} // 10MB
                    />
                  </div>

                  {/* Other */}
                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium mb-2">Other</h4>
                    <MultiFileUpload
                      files={formData.rfpDocuments?.other || []}
                      onChange={(files) => setFormData(prev => ({
                        ...prev,
                        rfpDocuments: {
                          ...prev.rfpDocuments,
                          other: files
                        }
                      }))}
                      allowedTypes={['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']}
                      maxSize={10 * 1024 * 1024} // 10MB
                    />
                  </div>
                </div>
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
                    <Label htmlFor="sowTitle">SOW Title <span className="text-red-600">*</span></Label>
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
                      <SelectTrigger className={opportunity?.isViewMode ? 'bg-gray-100' : ''}>
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
                    <Label htmlFor="targetKickoffDate">Target Kickoff Date</Label>
                    <Input
                      id="targetKickoffDate"
                      type="date"
                      value={
                        formData.sowDetails.targetKickoffDate
                          ? formatDateForInput(formData.sowDetails.targetKickoffDate)
                          : ''
                      }
                      onChange={(e) =>
                        updateSowDetails('targetKickoffDate', e.target.value)
                      }
                      min={new Date().toISOString().split('T')[0]}
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
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              disabled={loading}
            >
              {opportunity?.isViewMode && activeTab !== 'sow' ? 'Close' : 'Cancel'}
            </Button>
            
            {/* Always show Add SOW button when in SOW tab, regardless of view mode */}
            {(activeTab === 'sow' || !opportunity?.isViewMode) && (
              <Button 
                type="submit" 
                disabled={loading || (activeTab === 'sow' && !formData.sowDetails?.sowTitle)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {activeTab === 'sow' ? 'Adding...' : (opportunity ? 'Updating...' : 'Creating...')}
                  </>
                ) : (
                  activeTab === 'sow' ? 'Add SOW' :
                  activeTab === 'rfp' ? 'Add' :
                  (opportunity ? 'Update' : 'Create')
                )}
              </Button>
            )}
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