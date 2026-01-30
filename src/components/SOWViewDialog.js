import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const SOWViewDialog = ({
  open,
  onClose,
  sowData,
  onEdit,
  onDelete,
}) => {
  if (!sowData) return null;

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return '-';
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return amount;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'Draft':
        return <Badge variant="outline" className="border-amber-300 text-amber-700">Draft</Badge>;
      case 'In Review':
        return <Badge className="bg-blue-100 text-blue-800">In Review</Badge>;
      case 'Expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status || 'N/A'}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="space-y-1">
            <DialogTitle className="text-xl">View SOW Details</DialogTitle>
          </div>
        </DialogHeader>

        <Tabs defaultValue="sow-details" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-10 mb-2">
            <TabsTrigger value="details" disabled className="text-sm">Details</TabsTrigger>
            <TabsTrigger value="opportunity-rfp" disabled className="text-sm">Opportunity-RFP</TabsTrigger>
            <TabsTrigger value="sow-details" className="text-sm">SOW Details</TabsTrigger>
          </TabsList>

          <div className="pt-4">
            {/* SOW Details Tab */}
            <TabsContent value="sow-details" className="space-y-4">
              <Card className="border border-gray-200">
                <CardHeader className="py-3 px-6 border-b">
                  <CardTitle className="text-base font-medium">Statement of Work Details</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <p className="text-sm font-medium text-gray-700 mb-1">SOW Title <span className="text-red-600">*</span></p>
                      <div className="border rounded-md px-3 py-2 text-sm">
                        {sowData.sowTitle || sowData.title || '-'}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
                      <div className="relative">
                        <div className="flex items-center justify-between border rounded-md px-3 py-2 bg-white">
                          <span className="text-sm">
                            {sowData.sowStatus || sowData.status || 'Select status'}
                          </span>
                          <svg 
                            className="h-4 w-4 text-gray-400" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                          >
                            <path 
                              strokeLinecap="round" 
                              strokeLinejoin="round" 
                              strokeWidth={2} 
                              d="M19 9l-7 7-7-7" 
                            />
                          </svg>
                        </div>
                        {/* <div className="mt-1">
                          {getStatusBadge(sowData.sowStatus || sowData.status)}
                        </div> */}
                      </div>
                    </div>

                    {/* Contract Value */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">Contract Value</p>
                      <div className="flex">
                        <div className="border rounded-l-md px-3 py-2 text-sm w-24 flex items-center justify-center bg-gray-50">
                          {sowData.currency || 'USD'}
                        </div>
                        <div className="relative flex-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={sowData.contractValue || sowData.value || ''}
                            readOnly
                            className="w-full h-full border-t border-b border-r rounded-r-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </div>

                  {/* Target Kickoff Date */}
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Target Kickoff Date</p>
                    <div className="border rounded-md px-3 py-2 text-sm">
                      {sowData.targetKickoffDate ? formatDate(sowData.targetKickoffDate) : '-'}
                    </div>
                  </div>

                  {/* Linked Proposal Reference */}
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Linked Proposal Reference</p>
                    <div className="border rounded-md px-3 py-2 text-sm">
                      {sowData.linkedProposalRef || '-'}
                    </div>
                  </div>

                  {/* Scope Overview */}
                  <div className="md:col-span-2">
                    <p className="text-sm font-medium text-gray-700 mb-1">Scope Overview</p>
                    <div className="border rounded-md p-3">
                      <p className="text-gray-700 whitespace-pre-line text-sm">
                        {sowData.scopeOverview || 'No scope overview provided.'}
                      </p>
                    </div>
                  </div>
                  </div>
                </CardContent>
              </Card>

              {/* SOW Documents Card */}
              <Card className="border border-gray-200">
                <CardHeader className="py-3 px-6 border-b">
                  <CardTitle className="text-base font-medium">SOW Documents</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {sowData.sowDocuments?.length > 0 ? (
                    <div className="space-y-2">
                      {sowData.sowDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border-b last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-gray-500" />
                            <span className="text-sm font-medium">{doc.name}</span>
                          </div>
                          <Button variant="outline" size="sm" className="h-8">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed rounded-md">
                      <FileText className="h-10 w-10 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm text-gray-500">No documents attached</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Removed disabled tabs content */}

          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default SOWViewDialog;
