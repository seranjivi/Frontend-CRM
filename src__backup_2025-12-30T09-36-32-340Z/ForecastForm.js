import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import DateField from './DateField';

const ForecastForm = ({ forecast, onClose }) => {
  const [formData, setFormData] = useState({
    opportunity_name: '',
    opportunity_id: '',
    deal_value: 0,
    probability_percent: 0,
    forecast_amount: 0,
    salesperson: '',
    stage: '',
    forecast_month: '',
    forecast_quarter: '',
    expected_closure_date: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (forecast) {
      setFormData({
        ...forecast,
        expected_closure_date: forecast.expected_closure_date?.split('T')[0] || '',
      });
    }
  }, [forecast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      // Auto-calculate forecast amount
      if (name === 'deal_value' || name === 'probability_percent') {
        const dealValue = parseFloat(name === 'deal_value' ? value : updated.deal_value) || 0;
        const probability = parseFloat(name === 'probability_percent' ? value : updated.probability_percent) || 0;
        updated.forecast_amount = Math.round((dealValue * probability) / 100);
      }
      
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      payload.deal_value = parseFloat(payload.deal_value);
      payload.probability_percent = parseInt(payload.probability_percent);
      payload.forecast_amount = parseFloat(payload.forecast_amount);

      if (forecast) {
        await api.put(`/forecasts/${forecast.id}`, payload);
        toast.success('Forecast updated successfully');
      } else {
        await api.post('/forecasts', payload);
        toast.success('Forecast created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Forecast form error:', error);
      toast.error('Failed to save forecast');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="opportunity_name">Opportunity Name *</Label>
          <Input
            id="opportunity_name"
            name="opportunity_name"
            value={formData.opportunity_name}
            onChange={handleChange}
            required
            placeholder="Enter opportunity name"
          />
        </div>

        <DateField createdAt={forecast?.created_at} isNew={!forecast} />

        {forecast && forecast.task_id && (
          <div>
            <Label htmlFor="task_id">Task ID</Label>
            <Input
              id="task_id"
              value={forecast.task_id}
              readOnly
              disabled
              className="bg-slate-50 cursor-not-allowed font-['JetBrains_Mono'] font-semibold"
            />
          </div>
        )}

        <div>
          <Label htmlFor="opportunity_id">Opportunity ID</Label>
          <Input
            id="opportunity_id"
            name="opportunity_id"
            value={formData.opportunity_id}
            onChange={handleChange}
            placeholder="Link to opportunity"
          />
        </div>

        <div>
          <Label htmlFor="deal_value">Deal Value *</Label>
          <Input
            id="deal_value"
            name="deal_value"
            type="number"
            value={formData.deal_value}
            onChange={handleChange}
            required
            placeholder="Enter deal value"
          />
        </div>

        <div>
          <Label htmlFor="probability_percent">Probability % *</Label>
          <Input
            id="probability_percent"
            name="probability_percent"
            type="number"
            min="0"
            max="100"
            value={formData.probability_percent}
            onChange={handleChange}
            required
            placeholder="0-100"
          />
        </div>

        <div>
          <Label htmlFor="forecast_amount">Forecast Amount (Auto)</Label>
          <Input
            id="forecast_amount"
            name="forecast_amount"
            type="number"
            value={formData.forecast_amount}
            readOnly
            disabled
            className="bg-slate-50 cursor-not-allowed font-['JetBrains_Mono'] font-semibold text-emerald-700"
          />
        </div>

        <div>
          <Label htmlFor="salesperson">Salesperson</Label>
          <Input
            id="salesperson"
            name="salesperson"
            value={formData.salesperson}
            onChange={handleChange}
            placeholder="Assigned salesperson"
          />
        </div>

        <div>
          <Label htmlFor="stage">Stage</Label>
          <Input
            id="stage"
            name="stage"
            value={formData.stage}
            onChange={handleChange}
            placeholder="Current stage"
          />
        </div>

        <div>
          <Label htmlFor="forecast_month">Forecast Month</Label>
          <Input
            id="forecast_month"
            name="forecast_month"
            type="month"
            value={formData.forecast_month}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="forecast_quarter">Forecast Quarter</Label>
          <Input
            id="forecast_quarter"
            name="forecast_quarter"
            value={formData.forecast_quarter}
            onChange={handleChange}
            placeholder="e.g., Q1 2025"
          />
        </div>

        <div>
          <Label htmlFor="expected_closure_date">Expected Closure Date</Label>
          <Input
            id="expected_closure_date"
            name="expected_closure_date"
            type="date"
            value={formData.expected_closure_date}
            onChange={handleChange}
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Additional forecast notes..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-[#0A2A43] hover:bg-[#0A2A43]/90">
          {loading ? 'Saving...' : forecast ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default ForecastForm;