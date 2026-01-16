import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import DataTable from '../components/DataTable';
import SOWForm from '../components/SOWForm';
import AttachmentCell from '../components/attachments/AttachmentCell';
import AttachmentPreviewModal from '../components/attachments/AttachmentPreviewModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';

const SOWs = () => {
  const [sows, setSOWs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSOW, setEditingSOW] = useState(null);
  const [showAttachments, setShowAttachments] = useState(false);
  const [selectedSOW, setSelectedSOW] = useState(null);

  useEffect(() => {
    fetchSOWs();
  }, []);

  const fetchSOWs = async () => {
    try {
      const response = await api.get('/sows');
      setSOWs(response.data);
    } catch (error) {
      toast.error('Failed to fetch SOWs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sow) => {
    if (window.confirm(`Are you sure you want to delete this SOW?`)) {
      try {
        await api.delete(`/sows/${sow.id}`);
        toast.success('SOW deleted successfully');
        fetchSOWs();
      } catch (error) {
        toast.error('Failed to delete SOW');
      }
    }
  };

  const handleEdit = (sow) => {
    setEditingSOW(sow);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingSOW(null);
    fetchSOWs();
  };

  const handleImport = () => {
    toast.info('Import functionality coming soon! You can upload CSV files to bulk import SOWs.');
  };

  const handleViewAttachments = (sow) => {
    setSelectedSOW(sow);
    setShowAttachments(true);
  };

  const columns = [
    { 
      key: 'id', 
      header: 'SOW ID',
      render: (value) => <span className="font-['JetBrains_Mono'] text-xs">{value?.slice(0, 8)}</span>
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (value) => <span className="text-xs text-slate-700">{formatDate(value)}</span>
    },
    { key: 'client_name', header: 'Client' },
    { key: 'project_name', header: 'Project Name' },
    { key: 'sow_title', header: 'SOW Title' },
    { 
      key: 'sow_type', 
      header: 'Type',
      render: (value) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {value}
        </span>
      )
    },
    { 
      key: 'start_date', 
      header: 'Start Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    { 
      key: 'end_date', 
      header: 'End Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
    {
      key: 'value',
      header: 'Value',
      render: (value, row) => (
        <span className="font-['JetBrains_Mono'] text-sm">
          {row.currency} {value?.toLocaleString() || 0}
        </span>
      ),
    },
    { key: 'currency', header: 'Currency' },
    { key: 'billing_type', header: 'Billing Type' },
    {
      key: 'status',
      header: 'Status',
      render: (value) => {
        const colors = {
          Active: 'bg-emerald-100 text-emerald-700',
          Completed: 'bg-blue-100 text-blue-700',
          'On Hold': 'bg-amber-100 text-amber-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value] || 'bg-slate-100 text-slate-700'}`}>
            {value}
          </span>
        );
      },
    },
    { key: 'owner', header: 'Owner / AM' },
    { key: 'delivery_spoc', header: 'Delivery SPOC' },
    { key: 'milestones', header: 'Milestones' },
    { key: 'po_number', header: 'PO Number' },
    { key: 'invoice_plan', header: 'Invoice Plan' },
    { key: 'documents_link', header: 'Documents Link' },
    { key: 'notes', header: 'Notes / Next Steps' },
    {
      key: 'attachments',
      header: 'Attachments',
      render: (value, row) => (
        <AttachmentCell
          attachments={value}
          onClick={() => handleViewAttachments(row)}
        />
      )
    },
    { 
      key: 'updated_at', 
      header: 'Last Updated',
      render: (value) => value ? new Date(value).toLocaleDateString() : 'N/A'
    },
  ];

  const filterOptions = {
    status: ['Active', 'Completed', 'On Hold'],
    sow_type: ['New', 'Renewal', 'CO'],
    billing_type: ['Fixed', 'T&M', 'Milestone'],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6AA6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="sows-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Manrope']">Statement of Work</h1>
          <p className="text-sm text-slate-600 mt-0.5">Manage SOWs and project delivery</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          data-testid="add-sow-btn"
          className="bg-[#0A2A43] hover:bg-[#0A2A43]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add SOW
        </Button>
      </div>

      <DataTable
        data={sows}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onImport={handleImport}
        filterOptions={filterOptions}
        testId="sows-table"
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingSOW ? 'Edit SOW' : 'Add New SOW'}</DialogTitle>
          </DialogHeader>
          <SOWForm sow={editingSOW} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>

      <AttachmentPreviewModal
        isOpen={showAttachments}
        onClose={() => setShowAttachments(false)}
        attachments={selectedSOW?.attachments || []}
        entityName={selectedSOW?.sow_title || 'SOW'}
      />
    </div>
  );
};

export default SOWs;