import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import DataTable from '../components/DataTable';
import ActionItemForm from '../components/ActionItemForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';

const ActionItems = () => {
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchActionItems();
  }, []);

  const fetchActionItems = async () => {
    try {
      const response = await api.get('/action-items');
      setActionItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch action items');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    if (!window.confirm('Are you sure you want to delete this action item?')) return;

    try {
      await api.delete(`/action-items/${item.id}`);
      toast.success('Action item deleted');
      fetchActionItems();
    } catch (error) {
      toast.error('Failed to delete action item');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingItem(null);
    fetchActionItems();
  };

  const columns = [
    {
      key: 'task_id',
      header: 'Task ID',
      render: (value) => (
        <span className="font-['JetBrains_Mono'] text-xs font-semibold text-[#2C6AA6]">
          {value || 'N/A'}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (value) => <span className="text-xs text-slate-700">{formatDate(value)}</span>
    },
    { key: 'task_title', header: 'Task Title' },
    { 
      key: 'linked_to_type', 
      header: 'Linked To',
      render: (value, row) => value ? `${value}: ${row.linked_to?.slice(0, 8)}` : 'N/A'
    },
    { key: 'assigned_to', header: 'Assigned To' },
    {
      key: 'due_date',
      header: 'Due Date',
      render: (value) => value ? formatDate(value) : 'N/A'
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (value) => {
        const colors = {
          Low: 'bg-slate-100 text-slate-700',
          Medium: 'bg-amber-100 text-amber-700',
          High: 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value] || 'bg-slate-100 text-slate-700'}`}>
            {value}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (value) => {
        const colors = {
          'Not Started': 'bg-slate-100 text-slate-700',
          'In Progress': 'bg-blue-100 text-blue-700',
          'Completed': 'bg-emerald-100 text-emerald-700',
          'Overdue': 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value] || 'bg-slate-100 text-slate-700'}`}>
            {value}
          </span>
        );
      },
    },
  ];

  const filterOptions = {
    priority: ['Low', 'Medium', 'High'],
    status: ['Not Started', 'In Progress', 'Completed', 'Overdue'],
    linked_to_type: ['Lead', 'Opportunity', 'Partner'],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6AA6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="action-items-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Manrope']">Action Items (Tasks)</h1>
          <p className="text-sm text-slate-600 mt-0.5">Manage and track all tasks</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          data-testid="add-action-item-btn"
          className="bg-[#0A2A43] hover:bg-[#0A2A43]/90 h-9 text-sm"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Task
        </Button>
      </div>

      <DataTable
        data={actionItems}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        filterOptions={filterOptions}
        testId="action-items-table"
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Action Item' : 'Add New Action Item'}</DialogTitle>
          </DialogHeader>
          <ActionItemForm actionItem={editingItem} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActionItems;