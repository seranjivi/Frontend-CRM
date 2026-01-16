import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import DataTable from '../components/DataTable';
import SalesActivityForm from '../components/SalesActivityForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';

const SalesActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/sales-activities');
      setActivities(response.data);
    } catch (error) {
      toast.error('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setShowForm(true);
  };

  const handleDelete = async (activity) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) return;

    try {
      await api.delete(`/sales-activities/${activity.id}`);
      toast.success('Activity deleted');
      fetchActivities();
    } catch (error) {
      toast.error('Failed to delete activity');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingActivity(null);
    fetchActivities();
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
    {
      key: 'activity_type',
      header: 'Type',
      render: (value) => {
        const colors = {
          Call: 'bg-blue-100 text-blue-700',
          Meeting: 'bg-purple-100 text-purple-700',
          Email: 'bg-amber-100 text-amber-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value] || 'bg-slate-100 text-slate-700'}`}>
            {value}
          </span>
        );
      },
    },
    { key: 'activity_owner', header: 'Owner' },
    {
      key: 'activity_date',
      header: 'Activity Date',
      render: (value) => value ? new Date(value).toLocaleString() : 'N/A'
    },
    { key: 'linked_account', header: 'Account' },
    { key: 'summary', header: 'Summary' },
    { key: 'outcome', header: 'Outcome' },
    { key: 'next_step', header: 'Next Step' },
  ];

  const filterOptions = {
    activity_type: ['Call', 'Meeting', 'Email'],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6AA6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="sales-activity-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Manrope']">Sales Activity Tracker</h1>
          <p className="text-sm text-slate-600 mt-0.5">Log and track all sales activities</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          data-testid="add-activity-btn"
          className="bg-[#0A2A43] hover:bg-[#0A2A43]/90 h-9 text-sm"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Log Activity
        </Button>
      </div>

      <DataTable
        data={activities}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        filterOptions={filterOptions}
        testId="sales-activity-table"
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingActivity ? 'Edit Sales Activity' : 'Log New Sales Activity'}</DialogTitle>
          </DialogHeader>
          <SalesActivityForm activity={editingActivity} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SalesActivity;