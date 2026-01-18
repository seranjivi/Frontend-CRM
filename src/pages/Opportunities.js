import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import opportunityService from '../services/opportunityService';
import { Button } from '../components/ui/button';
import { Plus, ArrowRight, Filter, Upload, Download, Search, CheckCircle } from 'lucide-react';
import DataTable from '../components/DataTable';
import OpportunityFormTabbed from '../components/OpportunityFormTabbed';
import AttachmentCell from '../components/attachments/AttachmentCell';
import AttachmentPreviewModal from '../components/attachments/AttachmentPreviewModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';
import { saveAs } from 'file-saver';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [isRFPView, setIsRFPView] = useState(false);
  const [showOnlyDetails, setShowOnlyDetails] = useState(false);
  const fileInputRef = useRef(null);

  // State for filters
  const [filters, setFilters] = useState({
    opportunityName: 'All Opportunities',
    status: 'All Status',
    client: 'All Clients',
    closeDate: 'All Dates',
    type: 'All Opportunities'
  });

  const statusOptions = ['All Status', 'Active', 'Inactive', 'Won', 'Lost', 'In Progress'];
  const [opportunityTypeOptions, setOpportunityTypeOptions] = useState(['All Opportunities']);

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Filter opportunities based on all active filters
  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opp => {
      // Filter by opportunity name (search)
      const matchesSearch = filters.opportunityName === 'All Opportunities' || 
        !filters.opportunityName ||
        (opp.opportunity_name && 
         opp.opportunity_name.toLowerCase().includes(filters.opportunityName.toLowerCase()));
      
      // Filter by status
      const matchesStatus = filters.status === 'All Status' || 
        (opp.status && opp.status === filters.status);
      
      // Filter by opportunity type (using opportunity_name as type)
      const matchesType = filters.type === 'All Opportunities' || 
        (opp.opportunity_name && opp.opportunity_name === filters.type);
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [opportunities, filters]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      opportunityName: 'All Opportunities',
      status: 'All Status',
      client: 'All Clients',
      closeDate: 'All Dates',
      type: 'All Opportunities'
    });
  };

  // Handle download sample template
  const handleDownloadTemplate = () => {
    const template = [
      ['Opportunity ID', 'Opportunity Name', 'Client', 'Status', 'Amount', 'Close Date', 'Created By'],
      // Add more sample data if needed
    ];
    
    const csvContent = template.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'opportunity_template.csv');
  };

  // Handle file import
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        console.log('File content:', content);
        // Add your import logic here
        toast.success(`File "${file.name}" imported successfully!`);
      };
      reader.readAsText(file);
    }
    // Reset the file input
    event.target.value = '';
  };

  // Handle export data
  const handleExportData = () => {
    if (opportunities.length === 0) {
      toast.warning('No data to export!');
      return;
    }
    
    const headers = Object.keys(opportunities[0]);
    const csvContent = [
      headers.join(','),
      ...opportunities.map(row => 
        headers.map(fieldName => 
          JSON.stringify(row[fieldName] || '', (key, value) => 
            value === null ? '' : value
          )
        ).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `opportunities_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Sample data for demonstration
  const sampleData = [
    {
      id: 'opp-1001',
      opportunity_id: 'OPP-2024-001',
      created_at: new Date().toISOString(),
      client_name: 'Acme Corporation',
      opportunity_name: 'Enterprise Software License',
      amount: 75000,
      currency: 'USD',
      win_probability: 70,
      lead_source: 'Website',
      type: 'New Business',
      pipeline_status: 'Proposal',
      close_date: '2024-03-15',
      created_by: 'John Doe',
      internal_recommendation: 'High potential client',
      next_steps: 'Schedule demo',
      status: 'Active',
      updated_at: new Date().toISOString()
    },
    {
      id: 'opp-1002',
      opportunity_id: 'OPP-2024-002',
      created_at: new Date().toISOString(),
      client_name: 'Globex Inc',
      opportunity_name: 'Annual Support Contract',
      amount: 25000,
      currency: 'USD',
      win_probability: 90,
      lead_source: 'Referral',
      type: 'Existing Business',
      pipeline_status: 'Negotiation',
      close_date: '2024-02-28',
      created_by: 'Jane Smith',
      internal_recommendation: 'Upsell opportunity',
      next_steps: 'Send contract',
      status: 'Active',
      updated_at: new Date().toISOString()
    }
  ];

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const response = await opportunityService.getOpportunities();
      setOpportunities(response.data || []);
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to load opportunities');
      // Fallback to sample data if API fails
      setOpportunities(sampleData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  // Update opportunity type options when opportunities data changes
  useEffect(() => {
    if (opportunities && opportunities.length > 0) {
      // Get unique opportunity names from the data
      const uniqueOpportunityNames = [...new Set(
        opportunities
          .map(opp => opp.opportunity_name)
          .filter(Boolean) // Remove any undefined/null values
      )];
      
      // Keep 'All Opportunities' as first option, then add the unique names
      setOpportunityTypeOptions(['All Opportunities', ...uniqueOpportunityNames]);
    }
  }, [opportunities]);

  const handleDelete = async (opportunity) => {
    if (window.confirm(`Are you sure you want to delete this opportunity?`)) {
      try {
        await opportunityService.deleteOpportunity(opportunity.id);
        toast.success('Opportunity deleted successfully');
        fetchOpportunities();
      } catch (error) {
        toast.error('Failed to delete opportunity');
      }
    }
  };

  const handleEdit = async (opportunity) => {
    try {
      setLoading(true);
      setIsRFPView(false); // Not in RFP view when using edit
      setShowOnlyDetails(true); // Show only Details tab when editing
      // Fetch the latest opportunity data by ID
      const response = await opportunityService.getOpportunityById(opportunity.id || opportunity.opportunity_id);
      
      console.log('API Response:', response); // Debug log
      
      // The API response has the data in response.data
      const apiData = response.data?.data || opportunity;
      console.log('API Data:', apiData); // Debug log
      
      // Format the data to match the form's expected structure
      const formattedData = {
        opportunity: {
          opportunity_name: apiData.opportunity_name || '',
          clientId: apiData.client_id || '',
          client_name: apiData.client_name || 'Unknown Client',
          closeDate: apiData.close_date ? new Date(apiData.close_date).toISOString().split('T')[0] : '',
          amount: parseFloat(apiData.amount) || 0,
          currency: apiData.amount_currency || 'USD',
          leadSource: apiData.lead_source || '',
          type: apiData.opportunity_type || 'New Business',
          triaged: apiData.triaged_status || 'Hold',
          pipelineStatus: apiData.pipeline_status || 'Proposal Work-in-Progress',
          winProbability: apiData.win_probability || 20,
          nextSteps: [], // Default empty array for next steps
          createdBy: apiData.user_name || 'System',
          description: '',
          id: apiData.id || opportunity.id || ''
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
          currency: apiData.amount_currency || 'USD',
          targetKickoffDate: '',
          linkedProposalRef: '',
          scopeOverview: ''
        },
        rfpDocuments: [],
        sowDocuments: []
      };
      
      console.log('Formatted Data for Form:', formattedData); // Debug log
      
      setEditingOpportunity(formattedData);
      setShowForm(true);
    } catch (error) {
      console.error('Error fetching opportunity details:', error);
      toast.error('Failed to load opportunity details');
      // Fallback to the existing opportunity data if API call fails
      setEditingOpportunity(opportunity);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    // Add a small delay to allow the modal animation to complete before resetting the form
    setTimeout(() => {
      setEditingOpportunity(null);
      setIsRFPView(false); // Reset RFP view state when closing the form
      setShowOnlyDetails(false); // Reset showOnlyDetails state when closing the form
    }, 100);
    fetchOpportunities();
  };

  // Handle the dialog's open change to ensure form resets when closed via X or clicking outside
  const handleDialogOpenChange = (open) => {
    if (!open) {
      handleFormClose();
    } else {
      setShowForm(true);
    }
  };

  const navigate = useNavigate();

  const handleView = (opportunity) => {
    // Open the form in RFB-only mode
    setIsRFPView(true);
    setEditingOpportunity(opportunity);
    setShowForm(true);
  };

  const handleViewAttachments = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowAttachments(true);
  };

  const columns = [
    {
      key: 'opportunity_name',
      header: 'Opportunity Name',
      headerClassName: 'text-[18px] font-medium',
      render: (value) => (
        <span className="font-medium text-sm">
          {value || 'N/A'}
        </span>
      )
    },
    { 
      key: 'client_name', 
      header: 'Client',
      headerClassName: 'text-[18px] font-medium',
      render: (value) => (
        <span className="text-sm">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      headerClassName: 'text-[18px] font-medium',
      render: (value) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
          }`}
        >
          {value || 'N/A'}
        </span>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      headerClassName: 'text-[18px] font-medium',
      render: (value, row) => (
        <span className="font-medium text-sm">
          {row.currency || 'USD'} {(value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'close_date',
      header: 'Close Date',
      headerClassName: 'text-[18px] font-medium',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-[18px] font-medium',
      render: (_, row) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            className="h-8 w-8 p-0"
            title="Edit"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(row)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleView(row)}
            className="h-8 text-xs whitespace-nowrap"
            title="Level 2 Approval – RFB"
          >
            Level 2 Approval – RFB
          </Button>
        </div>
      )
    }
  ];

  const filterOptions = {
    pipeline_status: ['Prospecting', 'Needs Analysis', 'Proposal', 'Negotiation', 'Closed'],
    status: ['Active', 'Closed'],
    type: ['New Business', 'Existing Business'],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6AA6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="opportunities-page">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-baseline space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 font-['Manrope']">Opportunities</h1>
            <span className="text-sm text-slate-500">({filteredOpportunities.length} records)</span>
          </div>
          <p className="text-sm text-slate-600 mt-0.5">Manage sales opportunities and track progress</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center space-x-2">
            <Search className="absolute left-3 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 w-[180px] text-sm"
              value={filters.opportunityName === 'All Opportunities' ? '' : filters.opportunityName}
              onChange={(e) => handleFilterChange('opportunityName', e.target.value)}
            />
            
            {/* Status Filter */}
            <Select 
              value={filters.status} 
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-[130px] h-9 text-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Opportunity Type Filter */}
            <Select 
              value={filters.type} 
              onValueChange={(value) => handleFilterChange('type', value)}
            >
              <SelectTrigger className="w-[150px] h-9 text-sm">
                <SelectValue placeholder="All Opportunities" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {opportunityTypeOptions.map((type) => (
                  <SelectItem key={type} value={type} className="text-sm">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <div className="relative">
              <Button 
                variant="outline" 
                className="h-9 text-gray-700 border-gray-300"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".csv,.xlsx,.xls"
                className="hidden"
              />
            </div>
            <Button 
              variant="outline" 
              className="h-9 text-gray-700 border-gray-300"
              onClick={handleExportData}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <Button
            onClick={() => {
              setIsRFPView(false); // Not in RFP view when adding new opportunity
              setShowOnlyDetails(true); // Show only Details tab when adding new opportunity
              setEditingOpportunity(null);
              setShowForm(true);
            }}
            data-testid="add-opportunity-btn"
            className="bg-[#0A2A43] hover:bg-[#0A2A43]/90 h-9 text-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Opportunity
          </Button>
        </div>
      </div>

      <DataTable
        data={filteredOpportunities}
        columns={columns}
        // onImport={handleImport}
        filterOptions={filterOptions}
        testId="opportunities-table"
      />
 
      <Dialog open={showForm} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isRFPView ? 'RFP Details' : editingOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}</DialogTitle>
          </DialogHeader>
          <OpportunityFormTabbed 
            opportunity={editingOpportunity} 
            onClose={handleFormClose} 
            showOnlyRFP={isRFPView}
            showOnlyDetails={showOnlyDetails}
          />
        </DialogContent>
      </Dialog>
 
      <AttachmentPreviewModal
        isOpen={showAttachments}
        onClose={() => setShowAttachments(false)}
        attachments={selectedOpportunity?.attachments || []}
        entityName={selectedOpportunity?.opportunity_name || 'Opportunity'}
      />
    </div>
  );
};
 
export default Opportunities;