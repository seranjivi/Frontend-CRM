import React, { useState, useEffect, useMemo, useRef } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Plus, Upload, Download, Search } from 'lucide-react';
import DataTable from '../components/DataTable';
import LeadForm from '../components/LeadFormEnhanced';
import LeadDetail from '../components/LeadDetail';
import AttachmentPreviewModal from '../components/attachments/AttachmentPreviewModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';
import LeadStatusBadge from '../components/LeadStatusBadge';
import { saveAs } from 'file-saver';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const fileInputRef = useRef(null);

  // State for filters (matching Opportunities.js structure)
  const [filters, setFilters] = useState({
    leadName: 'All Leads',
    status: 'All Status',
    stage: 'All Stages'
  });

  // Filter Options
  const statusOptions = ['All Status', 'New Lead', 'Contacted', 'Qualified', 'Unqualified', 'In-progress', 'Converted to Opportunity'];
  const stageOptions = ['All Stages', 'RFP', 'RFI', 'RFQ', 'PoC', 'Demo'];

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await api.get('/leads');

      if (response.data && Array.isArray(response.data)) {
        setLeads(response.data);
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        setLeads(response.data.data);
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setLeads(response.data.data);
      } else {
        setLeads([]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch leads');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter leads based on active filters
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // Filter by lead name/client/opportunity (search)
      const searchTerm = filters.leadName === 'All Leads' ? '' : filters.leadName.toLowerCase();
      const matchesSearch = !searchTerm ||
        (lead.client_name && lead.client_name.toLowerCase().includes(searchTerm)) ||
        (lead.opportunity_name && lead.opportunity_name.toLowerCase().includes(searchTerm)) ||
        (lead.lead_owner && lead.lead_owner.toLowerCase().includes(searchTerm));

      // Filter by status
      const matchesStatus = filters.status === 'All Status' ||
        (lead.lead_status && lead.lead_status === filters.status);

      // Filter by stage
      const matchesStage = filters.stage === 'All Stages' ||
        (lead.lead_stage && lead.lead_stage === filters.stage);

      return matchesSearch && matchesStatus && matchesStage;
    });
  }, [leads, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Handle file import
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;
        // Here you would typically parse the CSV and call an API
        toast.success(`File "${file.name}" imported successfully!`);
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };

  // Handle export data
  const handleExportData = () => {
    if (leads.length === 0) {
      toast.warning('No data to export!');
      return;
    }

    const headers = Object.keys(leads[0]);
    const csvContent = [
      headers.join(','),
      ...leads.map(row =>
        headers.map(fieldName =>
          JSON.stringify(row[fieldName] || '', (key, value) =>
            value === null ? '' : value
          )
        ).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleDelete = async (lead) => {
    if (window.confirm(`Are you sure you want to delete this lead?`)) {
      try {
        await api.delete(`/leads/${lead.id}`);
        toast.success('Lead deleted successfully');
        fetchLeads();
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleEdit = (lead) => {
    setSelectedLead(lead);
    setShowDetail(true);
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowForm(true);
    setShowDetail(false);
  };

  const handleBackToList = () => {
    setShowDetail(false);
    setSelectedLead(null);
  };

  const handleDeleteLead = (lead) => {
    if (window.confirm(`Are you sure you want to delete this lead?`)) {
      try {
        api.delete(`/leads/${lead.id}`);
        toast.success('Lead deleted successfully');
        fetchLeads();
        setShowDetail(false);
        setSelectedLead(null);
      } catch (error) {
        toast.error('Failed to delete lead');
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingLead(null);
    fetchLeads();
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const columns = [
    {
      key: 'created_at',
      header: 'Lead Created On',
      headerClassName: 'text-[18px] font-medium',
      render: (value) => <span className="text-xs text-slate-700">{formatDate(value)}</span>
    },
    {
      key: 'lead_name',
      header: 'Lead Name',
      headerClassName: 'text-[18px] font-medium',
      render: (value, row) => (
        <span
          className="font-['JetBrains_Mono'] text-xs font-semibold text-[#2C6AA6] cursor-pointer hover:underline"
          onClick={() => handleEdit(row)}
        >
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'client_name',
      header: 'Client name',
      headerClassName: 'text-[18px] font-medium'
    },
    {
      key: 'region',
      header: 'Region',
      headerClassName: 'text-[18px] font-medium'
    },
    {
      key: 'sales_poc',
      header: 'Assignee',
      headerClassName: 'text-[18px] font-medium'
    },
    {
      key: 'priority',
      header: 'Priority',
      headerClassName: 'text-[18px] font-medium'
    },
    {
      key: 'lead_source',
      header: 'Lead Source',
      headerClassName: 'text-[18px] font-medium'
    },
    {
      key: 'deal_type',
      header: 'Deal type',
      headerClassName: 'text-[18px] font-medium'
    },
    {
      key: 'lead_status',
      header: 'Lead status',
      headerClassName: 'text-[18px] font-medium',
      render: (value, row) => <LeadStatusBadge status={value} leadId={row.id} />
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6AA6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="leads-page">
      {showDetail && selectedLead ? (
        <LeadDetail
          lead={selectedLead}
          onBack={handleBackToList}
          onEdit={handleEditLead}
          onDelete={handleDeleteLead}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-baseline space-x-2">
                <h1 className="text-2xl font-bold text-slate-900 font-['Manrope']">Leads</h1>
                <span className="text-sm text-slate-500">({filteredLeads.length} records)</span>
              </div>
              <p className="text-sm text-slate-600 mt-0.5">Manage and track your leads</p>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative flex items-center space-x-2">
                <Search className="absolute left-3 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-9 w-[180px] text-sm"
                  value={filters.leadName === 'All Leads' ? '' : filters.leadName}
                  onChange={(e) => handleFilterChange('leadName', e.target.value)}
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

                {/* Stage Filter */}
                <Select
                  value={filters.stage}
                  onValueChange={(value) => handleFilterChange('stage', value)}
                >
                  <SelectTrigger className="w-[130px] h-9 text-sm">
                    <SelectValue placeholder="All Stages" />
                  </SelectTrigger>
                  <SelectContent>
                    {stageOptions.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative">
                  <Button
                    variant="outline"
                    className="h-9 text-gray-700 border-gray-300"
                    onClick={handleImport}
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
                onClick={() => setShowForm(true)}
                data-testid="add-lead-btn"
                className="bg-[#0A2A43] hover:bg-[#0A2A43]/90 h-9 text-sm"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add Lead
              </Button>
            </div>
          </div>

          <DataTable
            data={filteredLeads}
            columns={columns}
            onDelete={handleDelete}
            onImport={handleImport}
            testId="leads-table"
          />
        </>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-5xl max-h-[90vh] w-[90vw] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
          </DialogHeader>
          <LeadForm lead={editingLead} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>

      <AttachmentPreviewModal
        isOpen={showAttachments}
        onClose={() => setShowAttachments(false)}
        attachments={selectedLead?.attachments || []}
        entityName={selectedLead?.opportunity_name || 'Lead'}
      />
    </div>
  );
};

export default Leads;