import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, FileText, Upload, Download, ChevronDown } from 'lucide-react';
import rfpService from '../services/rfpService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { format, parseISO } from 'date-fns';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner';

const RFPViewDialog = ({ 
  open, 
  onClose, 
  rfpData,
  mode = 'view',
  onSave
}) => {
  const [formData, setFormData] = useState({
    rfpTitle: '',
    rfpType: 'RFP',
    rfpStatus: 'Draft',
    rfpDescription: '',
    solutionDescription: '',
    submissionDeadline: '',
    bidManager: '',
    submissionMode: 'Email',
    portalUrl: 'https://',
    questionSubmissionDate: '',
    responseSubmissionDate: '',
    comments: '',
    documents: {
      commercial: [],
      proposal: [],
      presentation: [],
      other: [],
      qa: []
    }
  });

  const [isQaExpanded, setIsQaExpanded] = useState(false);

  // Update form data when rfpData changes
  useEffect(() => {
    if (rfpData) {
      const updatedData = {
        ...rfpData,
        rfpDescription: rfpData.rfpDescription || rfpData.rfbDescription || '',
        documents: {
          commercial: rfpData.documents?.commercial || [],
          proposal: rfpData.documents?.proposal || [],
          presentation: rfpData.documents?.presentation || [],
          other: rfpData.documents?.other || [],
          qa: rfpData.documents?.qa || []
        }
      };
      setFormData(updatedData);
      setIsQaExpanded(
        updatedData.questionSubmissionDate || 
        updatedData.responseSubmissionDate || 
        updatedData.comments || 
        (updatedData.documents?.qa && updatedData.documents.qa.length > 0)
      );
    }
  }, [rfpData]);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDocumentUpload = (section, files) => {
    setFormData(prev => ({
      ...prev,
      documents: {
        ...prev.documents,
        [section]: [...(prev.documents[section] || []), ...files]
      }
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    if (mode === 'edit' && rfpData?.id) {
      // Format the data according to the required API payload structure
      const payload = {
        opportunityName: formData.opportunityName || '',
        title: formData.rfpTitle || '',
        rfp_type: formData.rfpType || 'RFP',
        rfp_status: formData.rfpStatus || 'Draft',
        rfp_description: formData.rfpDescription || '',
        solution_description: formData.solutionDescription || '',
        submission_deadline: formData.submissionDeadline ? new Date(formData.submissionDeadline).toISOString() : null,
        bid_manager: formData.bidManager || '',
        submission_mode: formData.submissionMode || 'Email',
        portal_url: formData.portalUrl || '',
        question_submission_date: formData.questionSubmissionDate ? new Date(formData.questionSubmissionDate).toISOString() : null,
        response_submission_date: formData.responseSubmissionDate ? new Date(formData.responseSubmissionDate).toISOString() : null,
        comments: formData.comments || '',
        opportunity_id: rfpData.opportunityId || null,
        rfpDocuments: []
      };

      // Call the updateRFP API with the formatted payload
      const response = await rfpService.updateRFP(rfpData.id, payload);
      
      if (response && response.status === 'success') {
        // Format the response data to match the parent's expected format
        const formattedResponse = {
          ...response.data,
          rfpTitle: response.data.title,
          rfpStatus: response.data.rfp_status,
          rfpDescription: response.data.rfp_description,
          solutionDescription: response.data.solution_description,
          submissionDeadline: response.data.submission_deadline,
          rfpManager: response.data.bid_manager,
          submissionMode: response.data.submission_mode,
          portalUrl: response.data.portal_url,
          questionSubmissionDate: response.data.question_submission_date,
          responseSubmissionDate: response.data.response_submission_date,
          comments: response.data.comments
        };

        // Call onSave with the formatted response
        onSave?.(formattedResponse);
      } else {
        throw new Error(response?.message || 'Failed to update RFP');
      }
    }
  } catch (error) {
    console.error('Error updating RFP:', error);
    toast.error(error.message || 'Failed to update RFP');
  }
};

  const renderField = (label, value, field, isTextArea = false) => {
    if (mode === 'edit') {
      if (isTextArea) {
        return (
          <Textarea
            value={value}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full mt-1"
            rows={4}
          />
        );
      }
      return (
        <Input
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full mt-1"
        />
      );
    }
    return <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm min-h-[40px]">{value || 'Not specified'}</div>;
  };

  const renderSelectField = (label, value, field, options) => {
    if (mode === 'edit') {
      return (
        <Select
          value={value}
          onValueChange={(value) => handleInputChange(field, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
          </SelectTrigger>
          <SelectContent>
            {options.map(option => (
              <SelectItem key={option} value={option}>{option}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    return <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200 text-sm">{value || 'Not specified'}</div>;
  };

  const RFP_TYPES = ['RFP'];
  const RFP_STATUSES = [
    'Draft', 'In Progress', 'Submitted', 'Won', 'Lost', 'Withdrawn', 'Cancelled'
  ];

  const documentSections = [
    { key: 'commercial', label: 'Commercial' },
    { key: 'proposal', label: 'Proposal' },
    { key: 'presentation', label: 'Presentation' },
    { key: 'other', label: 'Other' }
  ];

  if (!rfpData) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{mode === 'edit' ? 'Edit RFP' : 'View RFP'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="opportunity-rfp" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="details" disabled>Details</TabsTrigger>
              <TabsTrigger value="opportunity-rfp">Opportunity-RFP</TabsTrigger>
              <TabsTrigger value="sow-details" disabled>SOW Details</TabsTrigger>
            </TabsList>
            
            <TabsContent value="opportunity-rfp">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Opportunity-RFP Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-6">
                      {/* First Row - Type and Status Side by Side */}
                      <div className="grid grid-cols-2 gap-4">
                        {/* RFP Type */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Type</Label>
                          {renderSelectField('Type', formData.rfpType, 'rfpType', RFP_TYPES)}
                        </div>

                        {/* RFP Status */}
                        <div>
                          <Label className="text-sm font-medium text-gray-700">Status</Label>
                          {renderSelectField('Status', formData.rfpStatus, 'rfpStatus', RFP_STATUSES)}
                        </div>
                      </div>

                      {/* RFP and Solution Descriptions Side by Side */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* RFP Description */}
                        <div className="space-y-1">
                          <Label className="block text-sm font-medium text-gray-700 mb-1">RFP Description</Label>
                          {renderField('RFP Description', formData.rfpDescription, 'rfpDescription', true)}
                        </div>

                        {/* Solution Description */}
                        <div className="space-y-1">
                          <Label className="block text-sm font-medium text-gray-700 mb-1">Solution Description</Label>
                          {renderField('Solution Description', formData.solutionDescription, 'solutionDescription', true)}
                        </div>
                      </div>

                      {/* Next 4 Fields in 2x2 Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Submission Deadline */}
                        <div className="space-y-1">
                          <Label className="block text-sm font-medium text-gray-700">Submission Deadline</Label>
                          {mode === 'edit' ? (
                            <Input
                              type="date"
                              value={formData.submissionDeadline ? formatDateForDisplay(formData.submissionDeadline) : ''}
                              onChange={(e) => handleInputChange('submissionDeadline', e.target.value)}
                              className="w-full mt-1"
                            />
                          ) : (
                            <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                              {formData.submissionDeadline ? formatDateForDisplay(formData.submissionDeadline) : 'Not specified'}
                            </div>
                          )}
                        </div>

                        {/* Response Owner */}
                        <div className="space-y-1">
                          <Label className="block text-sm font-medium text-gray-700">Response Owner</Label>
                          {renderField('Response Owner', formData.bidManager, 'bidManager')}
                        </div>

                        {/* Submission Mode */}
                        <div className="space-y-1">
                          <Label className="block text-sm font-medium text-gray-700">Submission Mode</Label>
                          {renderField('Submission Mode', formData.submissionMode, 'submissionMode')}
                        </div>

                        {/* Portal URL */}
                        <div className="space-y-1">
                          <Label className="block text-sm font-medium text-gray-700">Portal URL</Label>
                          {renderField('Portal URL', formData.portalUrl, 'portalUrl')}
                        </div>
                      </div>

                      {/* Q&A Section */}
                      <div className="pt-2">
                        <Button 
                          type="button"
                          variant="outline" 
                          className="mb-4 bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200"
                          onClick={() => setIsQaExpanded(!isQaExpanded)}
                        >
                          Q&A
                        </Button>
                        
                        {isQaExpanded && (
                          <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Question Submission Date</Label>
                                {mode === 'edit' ? (
                                  <Input
                                    type="date"
                                    value={formData.questionSubmissionDate ? formatDateForDisplay(formData.questionSubmissionDate) : ''}
                                    onChange={(e) => handleInputChange('questionSubmissionDate', e.target.value)}
                                    className="w-full mt-1"
                                  />
                                ) : (
                                  <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                                    {formData.questionSubmissionDate ? formatDateForDisplay(formData.questionSubmissionDate) : 'Not specified'}
                                  </div>
                                )}
                              </div>
                              
                              <div>
                                <Label className="text-sm font-medium text-gray-700">Response Submission Date</Label>
                                {mode === 'edit' ? (
                                  <Input
                                    type="date"
                                    value={formData.responseSubmissionDate ? formatDateForDisplay(formData.responseSubmissionDate) : ''}
                                    onChange={(e) => handleInputChange('responseSubmissionDate', e.target.value)}
                                    className="w-full mt-1"
                                  />
                                ) : (
                                  <div className="p-2 bg-gray-50 rounded border border-gray-200 text-sm">
                                    {formData.responseSubmissionDate ? formatDateForDisplay(formData.responseSubmissionDate) : 'Not specified'}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium text-gray-700">Comments</Label>
                              {renderField('Comments', formData.comments, 'comments', true)}
                            </div>
                            
                            <div className="md:col-span-2">
                              <Label className="text-sm font-medium text-gray-700">QA Document Upload</Label>
                              <div className="mt-1 flex flex-col items-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md bg-gray-50">
                                <div className="space-y-1 text-center">
                                  <div className="flex text-sm text-gray-500 justify-center">
                                    <span className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                                      Upload a file
                                    </span>
                                    <p className="pl-1 text-gray-500">or drag and drop</p>
                                  </div>
                                  <p className="text-xs text-gray-500">
                                    PDF, DOC, DOCX up to 10MB
                                  </p>
                                </div>
                                
                                {formData.documents?.qa?.length > 0 && (
                                  <div className="mt-4 w-full">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</p>
                                    <ul className="space-y-2">
                                      {formData.documents.qa.map((file, index) => (
                                        <li key={index} className="flex items-center justify-between p-2 border rounded bg-white">
                                          <div className="flex items-center space-x-2">
                                            <FileText className="h-4 w-4 text-blue-500" />
                                            <span className="text-sm text-gray-700 truncate max-w-xs">
                                              {file.name || `Document ${index + 1}`}
                                            </span>
                                            {file.size && (
                                              <span className="text-xs text-gray-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                              </span>
                                            )}
                                          </div>
                                          <a 
                                            href={file.url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-sm"
                                            title="Download"
                                          >
                                            <Download className="h-4 w-4" />
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Documents</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documentSections.map((section) => (
                      <div key={section.key} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h4 className="font-medium text-gray-700 text-sm">{section.label}</h4>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {formData.documents?.[section.key]?.length || 0} files
                          </span>
                        </div>
                        <div className="space-y-2">
                          {formData.documents?.[section.key]?.length > 0 ? (
                            formData.documents[section.key].map((file, index) => (
                              <div 
                                key={index} 
                                className="flex items-center justify-between p-2 bg-white rounded border border-gray-200 text-sm"
                              >
                                <div className="flex items-center min-w-0">
                                  <FileText className="h-4 w-4 text-gray-400 mr-2 flex-shrink-0" />
                                  <span className="truncate text-gray-700">
                                    {file.name || `Document ${index + 1}`}
                                  </span>
                                </div>
                                <a 
                                  href={file.url} 
                                  download
                                  className="text-gray-500 hover:text-gray-700 ml-2 flex-shrink-0"
                                  title="Download"
                                >
                                  <Download className="h-4 w-4" />
                                </a>
                              </div>
                            ))
                          ) : (
                            <div className="p-3 bg-gray-50 rounded border border-gray-200">
                              <p className="text-sm text-gray-500 text-center">No {section.label.toLowerCase()} documents</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {mode === 'edit' && (
            <DialogFooter className="border-t pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Update RFP</Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RFPViewDialog;