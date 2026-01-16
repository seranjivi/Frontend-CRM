import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ArrowLeft, Mail, Phone, Calendar, User, Building, Globe, Target, Activity, FileText, Paperclip } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import AttachmentCell from './attachments/AttachmentCell';
import AttachmentPreviewModal from './attachments/AttachmentPreviewModal';

const LeadDetail = ({ lead, onBack, onEdit, onDelete }) => {
  const [showAttachments, setShowAttachments] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete this lead?`)) {
      onDelete(lead);
    }
  };

  const getLeadScoreColor = (score) => {
    if (score >= 70) return 'bg-green-100 text-green-700';
    if (score >= 40) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getLeadStatusColor = (status) => {
    const colors = {
      New: 'bg-blue-100 text-blue-700',
      Qualified: 'bg-emerald-100 text-emerald-700',
      Dormant: 'bg-amber-100 text-amber-700',
      Lost: 'bg-red-100 text-red-700',
      Converted: 'bg-purple-100 text-purple-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getSalesStageColor = (stage) => {
    const colors = {
      Qualification: 'bg-blue-100 text-blue-700',
      Proposal: 'bg-yellow-100 text-yellow-700',
      Negotiation: 'bg-orange-100 text-orange-700',
      'Closed Won': 'bg-green-100 text-green-700',
      'Closed Lost': 'bg-red-100 text-red-700',
    };
    return colors[stage] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{lead.opportunity_name}</h1>
            <p className="text-slate-600">{lead.client_name}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => onEdit(lead)} variant="outline">
            Edit Lead
          </Button>
          <Button onClick={handleDelete} variant="destructive" size="sm">
            Delete
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Lead Score</p>
                <p className="text-2xl font-bold">{lead.lead_score || 0}</p>
              </div>
              <Badge className={getLeadScoreColor(lead.lead_score)}>
                {lead.lead_score >= 70 ? 'Hot' : lead.lead_score >= 40 ? 'Warm' : 'Cold'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Probability</p>
                <p className="text-2xl font-bold">{lead.probability || 0}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                <div 
                  className="w-10 h-10 rounded-full bg-blue-600" 
                  style={{width: `${(lead.probability || 0) / 100 * 48}px`, height: `${(lead.probability || 0) / 100 * 48}px`}}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Est. Value</p>
                <p className="text-2xl font-bold">{lead.currency || 'USD'} {lead.estimated_value?.toLocaleString() || 0}</p>
              </div>
              <Target className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Status</p>
                <Badge className={getLeadStatusColor(lead.lead_status)}>
                  {lead.lead_status}
                </Badge>
              </div>
              <Badge className={getSalesStageColor(lead.sales_stage)}>
                {lead.sales_stage}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="contact">Contact Details</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
          <TabsTrigger value="notes">Notes & Attachments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Lead Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Client:</span>
                  <span className="font-medium">{lead.client_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Opportunity:</span>
                  <span className="font-medium">{lead.opportunity_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Owner:</span>
                  <span className="font-medium">{lead.sales_poc}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Source:</span>
                  <span className="font-medium">{lead.lead_source}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Industry:</span>
                  <span className="font-medium">{lead.industry}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Region:</span>
                  <span className="font-medium">{lead.region}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Country:</span>
                  <span className="font-medium">{lead.country}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Created:</span>
                  <span className="font-medium">{formatDate(lead.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Next Follow-up:</span>
                  <span className="font-medium">{lead.next_followup ? formatDate(lead.next_followup) : 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Expected Closure:</span>
                  <span className="font-medium">{lead.expected_closure_date ? formatDate(lead.expected_closure_date) : 'Not set'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Last Updated:</span>
                  <span className="font-medium">{lead.last_updated ? formatDate(lead.last_updated) : 'Never'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Next Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{lead.next_action || 'No next action defined'}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Person</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">{lead.contact_person || 'Not specified'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Email:</span>
                  <span className="font-medium">{lead.contact_email || 'Not provided'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <span className="text-sm text-slate-600">Phone:</span>
                  <span className="font-medium">{lead.contact_phone || 'Not provided'}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-slate-500">
                <Activity className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                <p>No activities recorded yet</p>
                <p className="text-sm">Activities will appear here as you interact with this lead</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Sales Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600 whitespace-pre-wrap">{lead.sales_notes || 'No sales notes available'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Paperclip className="h-5 w-5" />
                  Attachments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AttachmentCell
                  attachments={lead.attachments}
                  onClick={() => setShowAttachments(true)}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <AttachmentPreviewModal
        isOpen={showAttachments}
        onClose={() => setShowAttachments(false)}
        attachments={lead.attachments || []}
        entityName={lead.opportunity_name || 'Lead'}
      />
    </div>
  );
};

export default LeadDetail;
