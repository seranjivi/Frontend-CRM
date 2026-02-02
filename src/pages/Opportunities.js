import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import opportunityService from '../services/opportunityService';
import { Button } from '../components/ui/button';
import { Plus, ArrowRight, Filter, Upload, Download, Search, CheckCircle, Edit, Eye } from 'lucide-react';
import ImportCSVModal from '../components/ImportCSVModal';
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
import DateField from '../components/DateField';

// Approval stage constants
const APPROVAL_STAGES = {
  LEVEL_1_RFB: 'LEVEL_1_RFB',
  LEVEL_2_SOW: 'LEVEL_2_SOW',
  APPROVED: 'APPROVED'
};

const Opportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);
  const [isRFPView, setIsRFPView] = useState(false);
  const [showOnlyDetails, setShowOnlyDetails] = useState(false);
  const [showOnlySOW, setShowOnlySOW] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // State for filters
  const [filters, setFilters] = useState({
    opportunityName: 'All Leads',
    status: 'All Status',
    client: 'All Clients',
    closeDate: '',
    type: 'All Leads'
  });

  const [activeTableFilters, setActiveTableFilters] = useState([]);

  const statusOptions = ['All Status', 'Active', 'Inactive', 'Won', 'Lost', 'In Progress'];
  const [opportunityTypeOptions, setOpportunityTypeOptions] = useState(['All Leads']);

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
      const matchesSearch = filters.opportunityName === 'All Leads' ||
        !filters.opportunityName ||
        (opp.opportunity_name &&
          opp.opportunity_name.toLowerCase().includes(filters.opportunityName.toLowerCase()));

      // Filter by status
      const matchesStatus = filters.status === 'All Status' ||
        (opp.status && opp.status === filters.status);

      // Filter by opportunity type (using opportunity_name as type)
      const matchesType = filters.type === 'All Leads' ||
        (opp.opportunity_name && opp.opportunity_name === filters.type);

      // Filter by close date
      let matchesDate = true;
      if (filters.closeDate) {
        if (!opp.close_date) {
          matchesDate = false;
        } else {
          const oppDate = new Date(opp.close_date).toISOString().split('T')[0];
          matchesDate = oppDate === filters.closeDate;
        }
      }

      // Filter by active table filters (from column headers)
      const matchesTableFilters = activeTableFilters.every(filter => {
        if (!filter.values || filter.values.length === 0) return true;

        const value = opp[filter.column];
        if (!value) return false;

        if (filter.column === 'close_date') {
          const oppDate = new Date(value).toISOString().split('T')[0];
          const filterValue = filter.values[0];

          if (filterValue.includes(' to ')) {
            const [from, to] = filterValue.split(' to ');
            return oppDate >= from && oppDate <= to;
          } else {
            return oppDate === filterValue;
          }
        }

        return filter.values.some(v => value.toString().toLowerCase().includes(v.toLowerCase()));
      });

      return matchesSearch && matchesStatus && matchesType && matchesDate && matchesTableFilters;
    });
  }, [opportunities, filters, activeTableFilters]);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      opportunityName: 'All Leads',
      status: 'All Status',
      client: 'All Clients',
      closeDate: 'All Dates',
      type: 'All Leads'
    });
  };

  // Handle download sample template
  const handleDownloadTemplate = () => {
    const template = [
      ['Opportunity ID', 'Opportunity Name', 'Client', 'Status', 'Amount', 'End Date', 'Created By'],
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

      // Keep 'All Leads' as first option, then add the unique names
      setOpportunityTypeOptions(['All Leads', ...uniqueOpportunityNames]);
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
      const response = await opportunityService.getOpportunityById(opportunity.id);
      setEditingOpportunity(response.data);
      setShowForm(true);
      setShowOnlyDetails(true); // Only show Details tab
      setIsRFPView(false);
    } catch (error) {
      console.error('Error fetching opportunity details:', error);
      toast.error('Failed to load opportunity details');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    // Add a small delay to allow the modal animation to complete before resetting the form
    setTimeout(() => {
      setEditingOpportunity(null);
      setIsRFPView(false); // Reset RFP view state when closing the form
      setShowOnlyDetails(false); // Reset showOnlyDetails state when closing the form
      setShowOnlySOW(false); // Reset showOnlySOW state when closing the form
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

  const handleView = async (opportunity, currentStage) => {
    try {
      // Set view states based on the currentStage
      const isRFPStage = currentStage === APPROVAL_STAGES.LEVEL_1_RFB;
      const isSOWStage = currentStage === APPROVAL_STAGES.LEVEL_2_SOW;

      // Set the appropriate view states
      setIsRFPView(isRFPStage);
      setShowOnlyDetails(!isRFPStage && !isSOWStage); // Show only Details tab if not RFP or SOW stage
      setShowOnlySOW(isSOWStage);

      // Fetch the latest opportunity data from the API
      const response = await opportunityService.getOpportunityById(opportunity.id);

      // Set the opportunity data for viewing with view mode flag
      // For RFP and SOW stages, set isViewMode to false to enable editing
      setEditingOpportunity({
        ...response.data,
        isViewMode: isRFPStage || isSOWStage ? false : true // Allow editing in both RFP and SOW views
      });

      setShowForm(true);
    } catch (error) {
      console.error('Error fetching opportunity details:', error);
      toast.error('Failed to load opportunity details');

      // Fallback to using the existing data if API call fails
      const isRFPStage = currentStage === APPROVAL_STAGES.LEVEL_1_RFB;
      const isSOWStage = currentStage === APPROVAL_STAGES.LEVEL_2_SOW;

      setIsRFPView(isRFPStage);
      setShowOnlyDetails(!isRFPStage && !isSOWStage);
      setShowOnlySOW(isSOWStage);

      setEditingOpportunity({
        ...opportunity,
        isViewMode: isRFPStage || isSOWStage ? false : true // Allow editing in both RFP and SOW views
      });
      setShowForm(true);
    }
  };

  const handleViewAttachments = (opportunity) => {
    setSelectedOpportunity(opportunity);
    setShowAttachments(true);
  };

  const columns = [
    {
      key: 'opportunity_name',
      header: 'Name',
      headerClassName: 'text-[18px] font-medium',
      sortable: true,
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
      sortable: true,
      filterable: true,
      filterType: 'text',
      render: (value) => (
        <span className="text-sm">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'approval_stage',
      header: 'Status',
      headerClassName: 'text-[18px] font-medium',
      sortable: true,
      filterable: true,
      filterType: 'select',
      render: (value) => {
        // Define status colors based on approval stage
        const statusColors = {
          'Draft': 'bg-blue-100 text-blue-800',
          'Pending Approval': 'bg-yellow-100 text-yellow-800',
          'Approved': 'bg-green-100 text-green-800',
          'Rejected': 'bg-red-100 text-red-800',
          'In Review': 'bg-purple-100 text-purple-800',
          'Level 1 Approval - RFB': 'bg-gray-100 text-gray-800'
        };

        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[value] || 'bg-gray-100 text-gray-800'
              }`}
          >
            {value || '-'}
          </span>
        );
      },
    },
    {
      key: 'amount',
      header: 'Amount',
      headerClassName: 'text-[18px] font-medium',
      sortable: true,
      render: (value, row) => (
        <span className="font-medium text-sm">
          {row.currency || 'USD'} {(value || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'close_date',
      header: 'End Date',
      headerClassName: 'text-[18px] font-medium',
      sortable: true,
      filterable: true,
      filterType: 'date',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      key: 'approval_stage',
      header: 'Approval Stage',
      headerClassName: 'text-[18px] font-medium',
      render: (_, row) => {
        const currentStage = row.approval_stage || APPROVAL_STAGES.LEVEL_1_RFB;

        if ((currentStage && currentStage.toString().toLowerCase() === 'approved') || (row.status && row.status.toString().toLowerCase() === 'approved')) {
          return (
            <div className="flex items-center space-x-1 text-emerald-600">
              <CheckCircle className="h-4 w-4" />
              <span>Approved</span>
            </div>
          );
        }

        const isLevel1 = currentStage === APPROVAL_STAGES.LEVEL_1_RFB;
        const buttonText = isLevel1
          ? 'Level 1 Approval - RFP'
          : 'Level 2 Approval - SOW';

        const buttonClass = isLevel1
          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300'
          : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200';

        return (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleView(row, currentStage)}
            className={`h-8 text-xs whitespace-nowrap ${buttonClass}`}
          >
            {buttonText}
          </Button>
        );
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      headerClassName: 'text-[18px] font-medium',
      render: (_, row) => (
        <div className="flex space-x-1">
          {/* View Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleView(row);
            }}
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-600"
            title="View"
          >
            <Eye className="h-4 w-4 text-current" />
          </Button>

          {/* Edit Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(row);
            }}
            className="h-8 w-8 p-0 text-blue-500 hover:text-blue-600"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
            title="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
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
            <h1 className="text-2xl font-bold text-slate-900">Leads</h1>
            <span className="text-sm text-slate-500">({filteredOpportunities.length} records)</span>
          </div>
          <p className="text-sm text-slate-600 mt-0.5">Manage sales Leads and track progress</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center space-x-2">
            <Search className="absolute left-3 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 w-[180px] text-sm"
              value={filters.opportunityName === 'All Leads' ? '' : filters.opportunityName}
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
                <SelectValue placeholder="All Leads" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px] overflow-y-auto">
                {opportunityTypeOptions.map((type) => (
                  <SelectItem key={type} value={type} className="text-sm">
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="w-[150px]">
              <DateField
                value={filters.closeDate}
                onChange={(e) => handleFilterChange('closeDate', e.target.value)}
                placeholder="End Date"
                label={null}
                name="filter-end-date"
              />
            </div>

            <Button
              variant="outline"
              className="h-9 text-gray-700 border-gray-300"
              onClick={() => setShowImportModal(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <ImportCSVModal
              isOpen={showImportModal}
              onClose={() => setShowImportModal(false)}
              onFileSelect={async (file) => {
                try {
                  const response = await opportunityService.importOpportunities(file);
                  toast.success('Opportunities imported successfully!');
                  fetchOpportunities();
                  setShowImportModal(false);
                  return response;
                } catch (error) {
                  console.error('Import error:', error);
                  const errorMessage = error.response?.data?.message ||
                    error.message ||
                    'Failed to import opportunities. Please try again.';
                  toast.error(`Import failed: ${errorMessage}`);
                  throw error;
                }
              }}
              onDownloadTemplate={async () => {
                try {
                  const templateBlob = await opportunityService.downloadTemplate();
                  return templateBlob;
                } catch (error) {
                  console.error('Error downloading template:', error);
                  toast.error('Failed to download template. Please try again.');
                  throw error;
                }
              }}
              title="Import Opportunities"
            />
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
            Add Lead
          </Button>
        </div>
      </div>

      <DataTable
        data={filteredOpportunities}
        columns={columns}
        // onImport={handleImport}
        filterOptions={filterOptions}
        testId="opportunities-table"
        activeFilters={activeTableFilters}
        onFilterChange={(column, values) => {
          setActiveTableFilters(prev => {
            const existing = prev.find(f => f.column === column);
            if (existing) {
              if (values.length === 0) {
                return prev.filter(f => f.column !== column);
              }
              return prev.map(f => f.column === column ? { ...f, values } : f);
            }
            if (values.length === 0) return prev;
            return [...prev, { column, values }];
          });
        }}
      />

      <Dialog open={showForm} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingOpportunity?.isViewMode
                ? (isRFPView ? 'Opportunity - RFP Details'
                  : showOnlySOW ? 'SOW Details'
                    : 'View Lead')
                : showOnlySOW ? 'SOW Details'
                  : isRFPView ? 'Opportunity-RFP'
                    : editingOpportunity ? 'Edit Lead'
                      : 'Add New Lead'}
            </DialogTitle>
          </DialogHeader>
          <OpportunityFormTabbed
            opportunity={editingOpportunity}
            onClose={handleFormClose}
            showOnlyRFP={isRFPView}
            showOnlyDetails={showOnlyDetails}
            showOnlySOW={showOnlySOW}
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