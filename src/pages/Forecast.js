import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import DataTable from '../components/DataTable';
import ForecastForm from '../components/ForecastForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';

const Forecast = () => {
  const [forecasts, setForecasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingForecast, setEditingForecast] = useState(null);

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    try {
      const response = await api.get('/forecasts');
      setForecasts(response.data);
    } catch (error) {
      toast.error('Failed to fetch forecasts');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (forecast) => {
    setEditingForecast(forecast);
    setShowForm(true);
  };

  const handleDelete = async (forecast) => {
    if (!window.confirm('Are you sure you want to delete this forecast?')) return;

    try {
      await api.delete(`/forecasts/${forecast.id}`);
      toast.success('Forecast deleted');
      fetchForecasts();
    } catch (error) {
      toast.error('Failed to delete forecast');
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingForecast(null);
    fetchForecasts();
  };

  // Calculate totals
  const totalDealValue = forecasts.reduce((sum, f) => sum + (f.deal_value || 0), 0);
  const totalForecastAmount = forecasts.reduce((sum, f) => sum + (f.forecast_amount || 0), 0);

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
    { key: 'opportunity_name', header: 'Opportunity Name' },
    {
      key: 'deal_value',
      header: 'Deal Value',
      render: (value) => (
        <span className="font-['JetBrains_Mono'] font-semibold text-slate-900">
          ${value?.toLocaleString() || 0}
        </span>
      ),
    },
    { 
      key: 'probability_percent', 
      header: 'Probability',
      render: (value) => `${value || 0}%`
    },
    {
      key: 'forecast_amount',
      header: 'Forecast Amount',
      render: (value) => (
        <span className="font-['JetBrains_Mono'] font-semibold text-emerald-700">
          ${value?.toLocaleString() || 0}
        </span>
      ),
    },
    { key: 'salesperson', header: 'Salesperson' },
    { key: 'stage', header: 'Stage' },
    { key: 'forecast_month', header: 'Month' },
    { key: 'forecast_quarter', header: 'Quarter' },
  ];

  const filterOptions = {
    forecast_quarter: [...new Set(forecasts.map(f => f.forecast_quarter).filter(Boolean))],
    stage: [...new Set(forecasts.map(f => f.stage).filter(Boolean))],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6AA6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="forecast-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Manrope']">Forecast Tracker</h1>
          <p className="text-sm text-slate-600 mt-0.5">Revenue forecasting and pipeline analysis</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          data-testid="add-forecast-btn"
          className="bg-[#0A2A43] hover:bg-[#0A2A43]/90 h-9 text-sm"
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Forecast
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-600 mb-1">Total Deal Value</p>
          <p className="text-2xl font-bold text-slate-900 font-['JetBrains_Mono']">
            ${totalDealValue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-600 mb-1">Total Forecast Amount</p>
          <p className="text-2xl font-bold text-emerald-700 font-['JetBrains_Mono']">
            ${totalForecastAmount.toLocaleString()}
          </p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-4">
          <p className="text-xs text-slate-600 mb-1">Total Opportunities</p>
          <p className="text-2xl font-bold text-slate-900 font-['JetBrains_Mono']">
            {forecasts.length}
          </p>
        </div>
      </div>

      <DataTable
        data={forecasts}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        filterOptions={filterOptions}
        testId="forecast-table"
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingForecast ? 'Edit Forecast' : 'Add New Forecast'}</DialogTitle>
          </DialogHeader>
          <ForecastForm forecast={editingForecast} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Forecast;