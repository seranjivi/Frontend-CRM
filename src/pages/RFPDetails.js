import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Filter, Upload, Download, Search, Bell, Plus, Eye, Edit, Trash2, Loader2 } from 'lucide-react';
import { Input } from '../components/ui/input';
import { saveAs } from 'file-saver';
import DataTable from '../components/DataTable';
import rfpService from '../services/rfpService';
import { toast } from 'react-toastify';

const RFPDetails = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch RFPs on component mount
  useEffect(() => {
    const fetchRFPs = async () => {
      try {
        setLoading(true);
        const response = await rfpService.getRFPs();
        // Transform the API response to match our table structure if needed
        const formattedData = response.map(item => ({
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
  const handleView = (item) => {
    console.log('View item:', item);
    // Add your view logic here
  };

  const handleEdit = (item) => {
    console.log('Edit item:', item);
    // Add your edit logic here
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Are you sure you want to delete ${item.opportunityName}?`)) {
      try {
        await rfpService.deleteRFP(item.id);
        setData(data.filter(d => d.id !== item.id));
        toast.success('RFP deleted successfully');
      } catch (error) {
        console.error('Error deleting RFP:', error);
        toast.error('Failed to delete RFP');
      }
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

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">RFP DETAILS PORTFOLIO</h1>
          <p className="text-sm text-gray-500">Procurement and Submission Tracking</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center space-x-2">
            <Button 
              variant="outline" 
              className="h-9 text-gray-700 border-gray-300 whitespace-nowrap"
              onClick={handleDownloadTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              Sample Template
            </Button>
            <div className="relative">
              <Button 
                variant="outline" 
                className="h-9 text-gray-700 border-gray-300"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".csv,.xlsx,.xls"
                className="hidden"
              />
            </div>
            <Button 
              variant="outline" 
              className="h-9 text-gray-700 border-gray-300"
              onClick={handleExportData}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
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
          title="RFP Details"
        />
      </div>
    </div>
  );
};

export default RFPDetails;
