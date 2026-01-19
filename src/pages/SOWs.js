import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Plus, Search, Download, Upload, FileText, Eye, Edit2, MoreHorizontal } from 'lucide-react';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import SOWForm from '../components/SOWForm';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import DataTable from '../components/DataTable';

const SOWs = () => {
  const navigate = useNavigate();
  const [sows, setSOWs] = useState([]);
  const [loading, setLoading] = useState(false); // Set to false to show empty state
  const [showForm, setShowForm] = useState(false);
  const [editingSOW, setEditingSOW] = useState(null);
  const [filters, setFilters] = useState({
    status: 'All Status',
    client: 'All Clients'
  });

  // Mock data for SOWs
  const mockSOWs = [
    {
      id: 'SOW-001',
      title: 'Website Redesign Project',
      client: 'Acme Corp',
      status: 'Active',
      startDate: '2025-01-15',
      endDate: '2025-06-15',
      value: 75000,
      currency: 'USD',
      lastUpdated: '2025-01-10T14:30:00Z',
    },
    {
      id: 'SOW-002',
      title: 'E-commerce Platform Development',
      client: 'Retail Plus',
      status: 'Draft',
      startDate: '2025-02-01',
      endDate: '2025-08-01',
      value: 120000,
      currency: 'USD',
      lastUpdated: '2025-01-18T09:15:00Z',
    },
    {
      id: 'SOW-003',
      title: 'Mobile App Development',
      client: 'Tech Innovators',
      status: 'Expired',
      startDate: '2024-06-01',
      endDate: '2024-12-31',
      value: 95000,
      currency: 'USD',
      lastUpdated: '2024-12-15T16:45:00Z',
    },
    {
      id: 'SOW-004',
      title: 'Cloud Migration Services',
      client: 'Global Systems',
      status: 'In Review',
      startDate: '2025-01-20',
      endDate: '2025-07-20',
      value: 185000,
      currency: 'USD',
      lastUpdated: '2025-01-18T11:20:00Z',
    },
  ];

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSOWs, setFilteredSOWs] = useState(mockSOWs);

  useEffect(() => {
    const fetchSOWs = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setSOWs(mockSOWs);
        setFilteredSOWs(mockSOWs);
      } catch (error) {
        console.error('Error fetching SOWs:', error);
        toast.error('Failed to load SOWs');
      } finally {
        setLoading(false);
      }
    };

    fetchSOWs();
  }, []);

  useEffect(() => {
    const filtered = mockSOWs.filter(sow => {
      const matchesSearch = sow.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sow.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sow.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filters.status === 'All Status' || sow.status === filters.status;
      return matchesSearch && matchesStatus;
    });
    setFilteredSOWs(filtered);
  }, [searchTerm, filters.status]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'Draft':
        return <Badge variant="outline" className="border-amber-300 text-amber-700">Draft</Badge>;
      case 'In Review':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Review</Badge>;
      case 'Expired':
        return <Badge variant="destructive">Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleCreateSOW = () => {
    setEditingSOW(null);
    setShowForm(true);
  };

  const handleViewSOW = (sow) => {
    navigate(`/sow/${sow.id}`);
  };

  const handleEditSOW = (sow) => {
    setEditingSOW(sow);
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    // Refresh the SOWs list
    // fetchSOWs();
  };

  const handleImportSOW = () => {
    // Handle import SOW
    console.log('Import SOW');
  };

  const columns = [
    {
      key: 'title',
      header: 'SOW Title',
      render: (_, row) => (
        <div className="flex items-center space-x-2">
          <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
          <div>
            <div className="font-medium text-gray-900">{row.id}</div>
            <div className="text-sm text-gray-500">{row.title}</div>
          </div>
        </div>
      ),
    },
    { key: 'client', header: 'Client' },
    {
      key: 'status',
      header: 'Status',
      render: (status) => getStatusBadge(status),
    },
    {
      key: 'startDate',
      header: 'Start Date',
      render: (date) => format(parseISO(date), 'MMM d, yyyy'),
    },
    {
      key: 'endDate',
      header: 'End Date',
      render: (date) => format(parseISO(date), 'MMM d, yyyy'),
    },
    {
      key: 'value',
      header: 'Value',
      render: (value, row) => formatCurrency(value, row.currency),
      className: 'text-right',
    },
  ];

  const handleDelete = (sow) => {
    if (window.confirm(`Are you sure you want to delete ${sow.title}?`)) {
      // Handle delete logic here
      toast.success('SOW deleted successfully');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6AA6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SOWs</h1>
          <p className="text-sm text-slate-600 mt-0.5">Manage Statements of Work</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative flex items-center space-x-2">
            <Search className="absolute left-3 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search SOWs..."
              className="pl-9 w-[200px] text-sm"
              value={searchTerm}
              onChange={handleSearch}
            />
            
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="h-9 px-3 py-1.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All Status">All Status</option>
              <option value="Draft">Draft</option>
              <option value="In Review">In Review</option>
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
            </select>
            
            <Button 
              variant="outline" 
              className="h-9 text-gray-700 border-gray-300"
              onClick={handleImportSOW}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button 
              variant="outline" 
              className="h-9 text-gray-700 border-gray-300"
              disabled={sows.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
          <Button
            onClick={handleCreateSOW}
            className="bg-[#0A2A43] hover:bg-[#0A2A43]/90 h-9 text-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create SOW
          </Button>
        </div>
      </div>

      {filteredSOWs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="bg-gray-100 p-4 rounded-full">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No SOWs found</h3>
            <p className="text-sm text-gray-500 max-w-md">
              Get started by creating a new SOW or importing existing ones to manage your statements of work.
            </p>
            <div className="flex space-x-3 pt-2">
              <Button
                onClick={handleCreateSOW}
                className="bg-[#0A2A43] hover:bg-[#0A2A43]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create SOW
              </Button>
              <Button
                variant="outline"
                onClick={handleImportSOW}
              >
                <Upload className="h-4 w-4 mr-2" />
                Import SOWs
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <DataTable
          data={filteredSOWs}
          columns={columns}
          onView={handleViewSOW}
          onEdit={handleEditSOW}
          onDelete={handleDelete}
          onExport={() => {
            // Handle export logic here
            toast.success('Exporting SOWs...');
          }}
          onImport={handleImportSOW}
          filterOptions={{
            search: {
              placeholder: 'Search SOWs...',
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
            },
            status: {
              label: 'Status',
              options: [
                { value: 'All Status', label: 'All Status' },
                { value: 'Draft', label: 'Draft' },
                { value: 'In Review', label: 'In Review' },
                { value: 'Active', label: 'Active' },
                { value: 'Expired', label: 'Expired' },
              ],
              value: filters.status,
              onChange: (value) => handleFilterChange('status', value),
            },
          }}
          emptyState={{
            title: 'No SOWs found',
            description: 'Get started by creating a new SOW or importing existing ones to manage your statements of work.',
            actions: [
              {
                label: 'Create SOW',
                onClick: handleCreateSOW,
                variant: 'default',
                icon: Plus,
              },
              {
                label: 'Import SOWs',
                onClick: handleImportSOW,
                variant: 'outline',
                icon: Upload,
              },
            ],
          }}
        />
      )}

      {/* SOW Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <SOWForm 
            sow={editingSOW} 
            onClose={() => setShowForm(false)} 
            onSuccess={handleFormSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SOWs;