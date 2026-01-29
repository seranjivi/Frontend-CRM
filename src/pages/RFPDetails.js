import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Filter, Upload, Download, Search, Bell, Plus, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { saveAs } from 'file-saver';
import DataTable from '../components/DataTable';
import rfpService from '../services/rfpService';
import { toast } from 'sonner';
import OpportunityFormTabbed from '../components/OpportunityFormTabbed';

const RFPDetails = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddRFPDialogOpen, setIsAddRFPDialogOpen] = useState(false);
  const [viewRFPDialogOpen, setViewRFPDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRFP, setSelectedRFP] = useState(null);
  const [newRFP, setNewRFP] = useState({
    opportunityName: '',
    rfpTitle: '',
    rfpStatus: 'Draft',
    rfpManager: '',
    submissionDeadline: new Date().toISOString().split('T')[0]
  });

  // Fetch RFPs on component mount
  useEffect(() => {
    const fetchRFPs = async () => {
      try {
        setLoading(true);
        const response = await rfpService.getRFPs();        
        // Check if the response is an array, if not, use response.data or fallback to empty array
        const responseData = Array.isArray(response) ? response : 
                          (response?.data && Array.isArray(response.data) ? response.data : []);
        
        const formattedData = responseData.map(item => ({
          id: item.id,
          opportunityName: item.opportunityName || 'N/A',
          rfpTitle: item.rfpTitle || 'N/A',
          rfpStatus: item.rfpStatus || 'Draft',
          rfpManager: item.rfpManager || 'N/A',
          submissionDeadline: item.submissionDeadline || 'N/A',
          createdOn: item.createdOn || new Date().toISOString().split('T')[0]
        }));
        
        setData(formattedData);
      } catch (err) {
        console.error('Error fetching RFPs:', err);
        setError('Failed to load RFP data. Please try again later.');
        toast.error('Failed to load RFP data');
      } finally {
        setLoading(false);
      }
    };

    fetchRFPs();
  }, []);

  // Table columns configuration
  const columns = [
    {
      key: 'opportunityName',
      header: 'Opportunity Name',
    },
    {
      key: 'rfpTitle',
      header: 'RFP Title',
    },
    {
      key: 'rfpStatus',
      header: 'RFP Status',
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
          value === 'In Progress' ? 'bg-blue-100 text-blue-800' :
          'bg-green-100 text-green-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'rfpManager',
      header: 'RFP Manager',
    },
    {
      key: 'submissionDeadline',
      header: 'Submission Deadline',
    },
    {
      key: 'createdOn',
      header: 'Created On',
    }
  ];

  // State for filters
  const [filters, setFilters] = useState({
    opportunityName: 'All Opportunities',
    rfpStatus: 'All Status',
    rfpManager: 'All Managers',
    submissionDeadline: 'All Deadlines'
  });

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      opportunityName: 'All Opportunities',
      rfpStatus: 'All Status',
      rfpManager: 'All Managers',
      submissionDeadline: 'All Deadlines'
    });
  };

  // Create a ref for the file input
  const fileInputRef = useRef(null);

  // Handle download sample template
  const handleDownloadTemplate = async () => {
    try {
      const response = await rfpService.exportRFPs();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `rfp_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('RFP template downloaded successfully');
    } catch (error) {
      console.error('Error downloading template:', error);
      toast.error('Failed to download template');
    }
  };

  // Handle file import
  const handleFileImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      await rfpService.importRFPs(file);
      // Refresh the data after successful import
      const response = await rfpService.getRFPs();
      setData(response);
      toast.success('RFPs imported successfully');
    } catch (error) {
      console.error('Error importing RFPs:', error);
      toast.error('Failed to import RFPs');
    } finally {
      // Reset the file input
      event.target.value = '';
    }
  };

  // Handle export data
  const handleExportData = () => {
    // Get the data you want to export (this is just a sample)
    const data = [
      // Add your data here
    ];
    
    if (data.length === 0) {
      alert('No data to export!');
      return;
    }
    
    // Convert to CSV
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(fieldName => 
          JSON.stringify(row[fieldName], (key, value) => 
            value === null ? '' : value
          )
        ).join(',')
      )
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `rfp_export_${new Date().toISOString().split('T')[0]}.csv`);
  };
  // Handlers for table actions
  const handleView = async (item) => {
    try {
      setLoading(true);
      setIsEditMode(false);
      console.log('Fetching RFP with ID:', item.id);
      const response = await rfpService.getRFPById(item.id);
      console.log('Raw API Response:', response);
      
      // Extract the data from the response
      const rfpData = response.data?.data || response.data || response;
      console.log('Extracted RFP Data:', rfpData);
      
      if (!rfpData) {
        console.error('No data received from API');
        throw new Error('No data received from API');
      }
      // Map the RFP data to match the OpportunityFormTabbed component's structure
      const mappedRFP = {
        // Opportunity fields
        opportunity: {
          id: rfpData.opportunityId || rfpData.opportunity?.id || '',
          opportunity_name: rfpData.opportunityName || rfpData.opportunity?.name || '',
          client_name: rfpData.clientName || rfpData.opportunity?.client_name || '',
          // Add other opportunity fields as needed
          ...(rfpData.opportunity || {})
        },
        
        // RFP Details
        rfpDetails: {
          rfpTitle: rfpData.rfpTitle || '',
          rfpType: rfpData.rfpType || 'RFP',
          rfpStatus: rfpData.rfpStatus || 'Draft',
          rfbDescription: rfpData.rfpDescription || rfpData.description || '',
          solutionDescription: rfpData.solutionDescription || '',
          submissionDeadline: rfpData.submissionDeadline || '',
          bidManager: rfpData.bidManager || '',
          submissionMode: rfpData.submissionMode || 'Email',
          portalUrl: rfpData.portalUrl || '',
          questionSubmissionDate: rfpData.questionSubmissionDate || '',
          responseSubmissionDate: rfpData.responseSubmissionDate || '',
          comments: rfpData.comments || '',
          qaLogs: rfpData.qaLogs || []
        },
        
        // Documents
        rfpDocuments: Array.isArray(rfpData.documents) ? rfpData.documents : [],
        
        // View mode flag
        isViewMode: true,
        
        // Map direct fields for backward compatibility
        id: rfpData.id,
        rfpTitle: rfpData.rfpTitle || '',
        rfpDescription: rfpData.rfpDescription || '',
        solutionDescription: rfpData.solutionDescription || '',
        submissionDeadline: rfpData.submissionDeadline || '',
        bidManager: rfpData.bidManager || '',
        submissionMode: rfpData.submissionMode || 'Email',
        portalUrl: rfpData.portalUrl || '',
        questionSubmissionDate: rfpData.questionSubmissionDate || '',
        responseSubmissionDate: rfpData.responseSubmissionDate || '',
        comments: rfpData.comments || '',
        documents: Array.isArray(rfpData.documents) ? rfpData.documents : []
      };
      
      console.log('Mapped RFP Data:', mappedRFP); // For debugging
      setSelectedRFP(mappedRFP);
      setViewRFPDialogOpen(true);
    } catch (error) {
      console.error('Error fetching RFP details:', error);
      toast.error('Failed to load RFP details');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (item) => {
    try {
      setLoading(true);
      setIsEditMode(true);
      console.log('Fetching RFP for edit with ID:', item.id);
      const response = await rfpService.getRFPById(item.id);
      console.log('Edit API Response:', response);
      
      // Extract the data from the response
      const rfpData = response.data?.data || response.data || response;
      console.log('Edit Extracted RFP Data:', rfpData);
      
      if (!rfpData) {
        console.error('No data received from API for edit');
        throw new Error('No data received from API for edit');
      }
      
      // Use the same mapping logic as handleView
      const mappedRFP = {
        // Opportunity fields
        opportunity: {
          id: rfpData.opportunityId || rfpData.opportunity?.id || '',
          opportunity_name: rfpData.opportunityName || rfpData.opportunity?.name || '',
          client_name: rfpData.clientName || rfpData.opportunity?.client_name || '',
          ...(rfpData.opportunity || {})
        },
        
        // RFP Details
        rfpDetails: {
          rfpTitle: rfpData.rfpTitle || '',
          rfpType: rfpData.rfpType || 'RFP',
          rfpStatus: rfpData.rfpStatus || 'Draft',
          rfbDescription: rfpData.rfpDescription || rfpData.description || '',
          solutionDescription: rfpData.solutionDescription || '',
          submissionDeadline: rfpData.submissionDeadline || '',
          bidManager: rfpData.bidManager || '',
          submissionMode: rfpData.submissionMode || 'Email',
          portalUrl: rfpData.portalUrl || '',
          questionSubmissionDate: rfpData.questionSubmissionDate || '',
          responseSubmissionDate: rfpData.responseSubmissionDate || '',
          comments: rfpData.comments || '',
          qaLogs: rfpData.qaLogs || []
        },
        
        // Documents
        rfpDocuments: Array.isArray(rfpData.documents) ? rfpData.documents : [],
        
        // Edit mode flag (different from view mode)
        isViewMode: false,
        
        // Map direct fields for backward compatibility
        id: rfpData.id,
        rfpTitle: rfpData.rfpTitle || '',
        rfpDescription: rfpData.rfpDescription || '',
        solutionDescription: rfpData.solutionDescription || '',
        submissionDeadline: rfpData.submissionDeadline || '',
        bidManager: rfpData.bidManager || '',
        submissionMode: rfpData.submissionMode || 'Email',
        portalUrl: rfpData.portalUrl || '',
        questionSubmissionDate: rfpData.questionSubmissionDate || '',
        responseSubmissionDate: rfpData.responseSubmissionDate || '',
        comments: rfpData.comments || '',
        documents: Array.isArray(rfpData.documents) ? rfpData.documents : []
      };
      
      console.log('Mapped Edit RFP Data:', mappedRFP);
      setSelectedRFP(mappedRFP);
      setViewRFPDialogOpen(true);
    } catch (error) {
      console.error('Error fetching RFP details for edit:', error);
      toast.error('Failed to load RFP details for editing');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete ${item.opportunityName || 'this RFP'}?`)) {
      try {
        setLoading(true);
        await rfpService.deleteRFP(item.id);
        // Remove the deleted RFP from the list
        setData(prevData => prevData.filter(d => d.id !== item.id));
        toast.success('RFP deleted successfully');
      } catch (error) {
        console.error('Error deleting RFP:', error);
        toast.error(error.response?.data?.message || 'Failed to delete RFP');
      } finally {
        setLoading(false);
      }
    }
  };

  const fetchOpportunities = async () => {
    try {
      setIsLoadingOpportunities(true);
      const response = await opportunityService.getOpportunities();
      setOpportunities(Array.isArray(response) ? response : (response?.data || []));
    } catch (error) {
      console.error('Error fetching opportunities:', error);
      toast.error('Failed to load opportunities');
    } finally {
      setIsLoadingOpportunities(false);
    }
  };

  const handleAddRFP = async () => {
    try {
      await rfpService.createRFP(newRFP);
      // Refresh the RFP list
      fetchRFPs();
      // Close the dialog
      setIsAddRFPDialogOpen(false);
      // Reset form
      setNewRFP({
        opportunityName: '',
        rfpTitle: '',
        rfpStatus: 'Draft',
        rfpManager: '',
        submissionDeadline: new Date().toISOString().split('T')[0]
      });
      toast.success('RFP created successfully');
    } catch (error) {
      console.error('Error creating RFP:', error);
      toast.error('Failed to create RFP');
    }
  };

  // Add this function to fetch RFPs
  const fetchRFPs = async () => {
    try {
      setLoading(true);
      const response = await rfpService.getRFPs();
      const responseData = Array.isArray(response) ? response : 
                        (response?.data && Array.isArray(response.data) ? response.data : []);
      
      const formattedData = responseData.map(item => ({
        id: item.id,
        opportunityName: item.opportunityName || 'N/A',
        rfpTitle: item.rfpTitle || 'N/A',
        rfpStatus: item.rfpStatus || 'Draft',
        rfpManager: item.rfpManager || 'N/A',
        submissionDeadline: item.submissionDeadline || 'N/A',
        createdOn: item.createdOn || new Date().toISOString().split('T')[0]
      }));
      
      setData(formattedData);
    } catch (err) {
      console.error('Error fetching RFPs:', err);
      setError('Failed to load RFP data. Please try again later.');
      toast.error('Failed to load RFP data');
    } finally {
      setLoading(false);
    }
  };

  // Custom actions for the table
  const customActions = (item) => (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleView(item)}
        className="h-8 w-8 p-0 hover:bg-gray-100"
      >
        <Eye className="h-4 w-4 text-gray-500" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleEdit(item)}
        className="h-8 w-8 p-0 hover:bg-gray-100"
      >
        <Edit className="h-4 w-4 text-gray-500" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleDelete(item)}
        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading RFPs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Add RFP Dialog Component
  const AddRFPDialog = () => (
    <Dialog open={isAddRFPDialogOpen} onOpenChange={setIsAddRFPDialogOpen}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add New RFP</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new RFP.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="opportunityName" className="text-right">
              Opportunity Name
            </Label>
            <Input
              id="opportunityName"
              value={newRFP.opportunityName}
              onChange={(e) => setNewRFP({...newRFP, opportunityName: e.target.value})}
              className="col-span-3"
              placeholder="Enter opportunity name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rfpTitle" className="text-right">
              RFP Title
            </Label>
            <Input
              id="rfpTitle"
              value={newRFP.rfpTitle}
              onChange={(e) => setNewRFP({...newRFP, rfpTitle: e.target.value})}
              className="col-span-3"
              placeholder="Enter RFP title"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rfpStatus" className="text-right">
              Status
            </Label>
            <Select
              value={newRFP.rfpStatus}
              onValueChange={(value) => setNewRFP({...newRFP, rfpStatus: value})}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="rfpManager" className="text-right">
              RFP Manager
            </Label>
            <Input
              id="rfpManager"
              value={newRFP.rfpManager}
              onChange={(e) => setNewRFP({...newRFP, rfpManager: e.target.value})}
              className="col-span-3"
              placeholder="Enter manager name"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="submissionDeadline" className="text-right">
              Submission Deadline
            </Label>
            <Input
              id="submissionDeadline"
              type="date"
              value={newRFP.submissionDeadline}
              onChange={(e) => setNewRFP({...newRFP, submissionDeadline: e.target.value})}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsAddRFPDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddRFP}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading RFPs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-semibold">Opportunity-RFP Details Portfolio</h1>
            <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
              {loading ? 'Loading...' : `(${data.length} ${data.length === 1 ? 'record' : 'records'})`}
            </span>
          </div>
          <p className="text-sm text-gray-500">Procurement and Submission Tracking</p>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            className="h-9 text-gray-700 border-gray-300"
            onClick={handleExportData}
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".csv,.xlsx,.xls"
            className="hidden"
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <DataTable
          data={data}
          columns={columns}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          customActions={customActions}
          title="Opportunity-RFP Details"
        />
      </div>
      <AddRFPDialog />
      
      {/* View/Edit RFP Dialog */}
      <Dialog open={viewRFPDialogOpen} onOpenChange={setViewRFPDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode ? 'Edit RFP' : 'View RFP Details'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {selectedRFP && (
             <OpportunityFormTabbed
  showOnlyRFP={true}
  onClose={() => {
    setViewRFPDialogOpen(false);
    setIsEditMode(false);
  }}
  onSuccess={() => {
    setViewRFPDialogOpen(false);
    setIsEditMode(false);
    fetchRFPs();
  }}
  // Hide Add button in edit mode
  hideAddButton={isEditMode}
  // Set view mode based on edit mode
  isViewMode={!isEditMode}
  // Set edit mode
  isEditMode={isEditMode}
  // Pass the opportunity data
  opportunity={{
    ...selectedRFP,
    // Ensure we're not in view mode when editing
    isViewMode: !isEditMode
  }}
  // Set the button text based on the mode
  buttonText={isEditMode ? 'Update' : 'View'}
/>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RFPDetails;
