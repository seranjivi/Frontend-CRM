import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import DateField from './DateField';

const ActionItemForm = ({ actionItem, onClose }) => {
  const [formData, setFormData] = useState({
    task_title: '',
    linked_to: '',
    linked_to_type: '',
    assigned_to: '',
    due_date: '',
    priority: 'Medium',
    status: 'Not Started',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (actionItem) {
      setFormData({
        ...actionItem,
        due_date: actionItem.due_date?.split('T')[0] || '',
      });
    }
  }, [actionItem]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = { ...formData };

      if (actionItem) {
        await api.put(`/action-items/${actionItem.id}`, payload);
        toast.success('Action item updated successfully');
      } else {
        await api.post('/action-items', payload);
        toast.success('Action item created successfully');
      }
      onClose();
    } catch (error) {
      console.error('Action item form error:', error);
      toast.error('Failed to save action item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="task_title">Task Title *</Label>
          <Input
            id="task_title"
            name="task_title"
            value={formData.task_title}
            onChange={handleChange}
            required
            placeholder="Enter task title"
          />
        </div>

        <DateField createdAt={actionItem?.created_at} isNew={!actionItem} />

        {actionItem && actionItem.task_id && (
          <div>
            <Label htmlFor="task_id">Task ID</Label>
            <Input
              id="task_id"
              value={actionItem.task_id}
              readOnly
              disabled
              className="bg-slate-50 cursor-not-allowed font-['JetBrains_Mono'] font-semibold"
            />
          </div>
        )}

        <div>
          <Label htmlFor="linked_to_type">Linked To Type</Label>
          <Select
            name="linked_to_type"
            value={formData.linked_to_type}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, linked_to_type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lead">Lead</SelectItem>
              <SelectItem value="Opportunity">Opportunity</SelectItem>
              <SelectItem value="Partner">Partner</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="linked_to">Linked To ID</Label>
          <Input
            id="linked_to"
            name="linked_to"
            value={formData.linked_to}
            onChange={handleChange}
            placeholder="Enter Lead/Opportunity/Partner ID"
          />
        </div>

        <div>
          <Label htmlFor="assigned_to">Assigned To</Label>
          <Input
            id="assigned_to"
            name="assigned_to"
            value={formData.assigned_to}
            onChange={handleChange}
            placeholder="User name or email"
          />
        </div>

        <div>
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select
            name="priority"
            value={formData.priority}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            name="status"
            value={formData.status}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Not Started">Not Started</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="md:col-span-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Additional notes..."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-[#0A2A43] hover:bg-[#0A2A43]/90">
          {loading ? 'Saving...' : actionItem ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default ActionItemForm;