import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Clock, CheckCircle, XCircle, AlertCircle, History } from 'lucide-react';
import api from '../utils/api';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';

const LeadStatusBadge = ({ leadId, status, stage, nextFollowup, className = "" }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const getStatusConfig = (status) => {
    const configs = {
      'Active': {
        color: 'bg-blue-100 text-blue-700',
        icon: Clock,
        tooltip: `Lead is active. Stage: ${stage}`
      },
      'Delayed': {
        color: 'bg-orange-100 text-orange-700',
        icon: AlertCircle,
        tooltip: `Follow-up date (${nextFollowup}) has passed. Follow-up required.`
      },
      'Completed': {
        color: 'bg-green-100 text-green-700',
        icon: CheckCircle,
        tooltip: `Lead qualified and moved to opportunities. Stage: ${stage}`
      },
      'Rejected': {
        color: 'bg-gray-100 text-gray-700',
        icon: XCircle,
        tooltip: `Lead unqualified. Stage: ${stage}`
      }
    };
    return configs[status] || configs['Active'];
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const fetchStatusHistory = async () => {
    if (!leadId) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/leads/${leadId}/status-history`);
      setStatusHistory(response.data.status_history || []);
    } catch (error) {
      toast.error('Failed to load status history');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusClick = () => {
    if (leadId) {
      fetchStatusHistory();
      setShowHistory(true);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        className={`p-1 h-auto cursor-help ${className}`}
        onClick={handleStatusClick}
        title={config.tooltip}
        disabled={!leadId}
      >
        <Badge className={config.color}>
          <Icon className="w-3 h-3 mr-1" />
          {status}
        </Badge>
      </Button>

      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Lead Status Timeline
            </DialogTitle>
          </DialogHeader>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2C6AA6]"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {statusHistory.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  No status changes recorded yet.
                </div>
              ) : (
                <div className="relative">
                  {/* Timeline line */}
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200"></div>
                  
                  {/* Timeline entries */}
                  {statusHistory.map((log, index) => (
                    <div key={index} className="relative flex items-start space-x-4 pb-4">
                      {/* Timeline dot */}
                      <div className="flex-shrink-0 w-8 h-8 bg-white border-2 border-slate-300 rounded-full flex items-center justify-center z-10">
                        {getTimelineIcon(log.reason)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="bg-slate-50 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-slate-900">
                                {log.new_status}
                              </span>
                              {log.previous_status && (
                                <span className="text-slate-500">
                                  from {log.previous_status}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500">
                              {formatDate(log.changed_at)}
                            </span>
                          </div>
                          
                          <div className="text-sm text-slate-600">
                            <div className="font-medium capitalize">
                              {log.reason.toLowerCase()}
                            </div>
                            <div className="text-xs text-slate-500 mt-1">
                              by {log.changed_by_user_name}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const getTimelineIcon = (reason) => {
  const icons = {
    'Stage change': <div className="w-2 h-2 bg-blue-500 rounded-full"></div>,
    'Date exceeded': <div className="w-2 h-2 bg-orange-500 rounded-full"></div>,
    'Date updated': <div className="w-2 h-2 bg-green-500 rounded-full"></div>,
    'Lead created': <div className="w-2 h-2 bg-purple-500 rounded-full"></div>,
  };
  return icons[reason] || <div className="w-2 h-2 bg-slate-500 rounded-full"></div>;
};

export default LeadStatusBadge;
