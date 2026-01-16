import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import DataTable from '../components/DataTable';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await api.get('/activities');
      setActivities(response.data);
    } catch (error) {
      toast.error('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: 'title', header: 'Title' },
    {
      key: 'created_at',
      header: 'Date',
      render: (value) => <span className="text-xs text-slate-700">{formatDate(value)}</span>
    },
    { key: 'activity_type', header: 'Type' },
    { key: 'related_to', header: 'Related To' },
    { key: 'assigned_to', header: 'Assigned To' },
    {
      key: 'status',
      header: 'Status',
      render: (value) => {
        const colors = {
          Pending: 'bg-amber-100 text-amber-700',
          Completed: 'bg-emerald-100 text-emerald-700',
          Cancelled: 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[value]}`}>
            {value}
          </span>
        );
      },
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6AA6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="activities-page">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 font-['Manrope']">Activities</h1>
        <p className="text-sm text-slate-600 mt-0.5">Track calls, meetings, and follow-ups</p>
      </div>

      <DataTable
        data={activities}
        columns={columns}
        filterOptions={{
          status: ['Pending', 'Completed', 'Cancelled'],
          activity_type: ['Call', 'Meeting', 'Email', 'Demo', 'Follow-up'],
        }}
        testId="activities-table"
      />
    </div>
  );
};

export default Activities;