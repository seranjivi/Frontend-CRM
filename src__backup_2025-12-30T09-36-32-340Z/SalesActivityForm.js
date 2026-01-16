import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import DateField from './DateField';

const SalesActivityForm = ({ activity, onClose }) => {
  const [formData, setFormData] = useState({
    activity_type: 'Call',
    activity_owner: '',
    activity_date: '',
    linked_account: '',
    linked_lead: '',
    linked_opportunity: '',
    summary: '',
    outcome: '',
    next_step: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activity) {
      setFormData({
        ...activity,
        activity_date: activity.activity_date?.split('T')[0] || '',
      });
    }
  }, [activity]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };
      if (payload.activity_date) {
        payload.activity_date = new Date(payload.activity_date).toISOString();
      }

      if (activity) {
        await api.put(`/sales-activities/${activity.id}`, payload);
        toast.success('Sales activity updated successfully');
      } else {
        await api.post('/sales-activities', payload);
        toast.success('Sales activity logged successfully');
      }
      onClose();
    } catch (error) {
      console.error('Sales activity form error:', error);
      toast.error('Failed to save activity');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateField createdAt={activity?.created_at} isNew={!activity} />

        {activity && activity.task_id && (
          <div>
            <Label htmlFor="task_id">Task ID</Label>
            <Input
              id="task_id"
              value={activity.task_id}
              readOnly
              disabled
              className="bg-slate-50 cursor-not-allowed font-['JetBrains_Mono'] font-semibold"
            />
          </div>
        )}

        <div>
          <Label htmlFor="activity_type">Activity Type *</Label>
          <Select
            name="activity_type"
            value={formData.activity_type}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, activity_type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Call">Call</SelectItem>
              <SelectItem value="Meeting">Meeting</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="activity_owner">Activity Owner</Label>
          <Input
            id="activity_owner"
            name="activity_owner"
            value={formData.activity_owner}
            onChange={handleChange}
            placeholder="Who logged this activity?"
          />
        </div>

        <div>
          <Label htmlFor="activity_date">Activity Date & Time</Label>
          <Input
            id="activity_date"
            name="activity_date"
            type="datetime-local"
            value={formData.activity_date}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="linked_account">Linked Account/Client</Label>
          <Input
            id="linked_account"
            name="linked_account"
            value={formData.linked_account}
            onChange={handleChange}
            placeholder="Client or account name"
          />
        </div>

        <div>
          <Label htmlFor="linked_lead">Linked Lead ID</Label>
          <Input
            id="linked_lead"
            name="linked_lead"
            value={formData.linked_lead}
            onChange={handleChange}
            placeholder="Lead ID (optional)"
          />
        </div>

        <div>
          <Label htmlFor="linked_opportunity">Linked Opportunity ID</Label>
          <Input
            id="linked_opportunity"
            name="linked_opportunity"
            value={formData.linked_opportunity}
            onChange={handleChange}
            placeholder="Opportunity ID (optional)"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="summary">Summary *</Label>
          <Textarea
            id="summary"
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            required
            rows={2}
            placeholder="Brief summary of the activity"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="outcome">Outcome</Label>
          <Textarea
            id="outcome"
            name="outcome"
            value={formData.outcome}
            onChange={handleChange}
            rows={2}
            placeholder="What was the outcome?"
          />
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="next_step">Next Step</Label>
          <Textarea
            id="next_step"
            name="next_step"
            value={formData.next_step}
            onChange={handleChange}
            rows={2}
            placeholder="What's the next action?"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-[#0A2A43] hover:bg-[#0A2A43]/90">
          {loading ? 'Saving...' : activity ? 'Update' : 'Log Activity'}
        </Button>
      </div>
    </form>
  );
};

export default SalesActivityForm;