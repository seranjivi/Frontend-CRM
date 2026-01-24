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
import sowService from '../services/sowService';

const SOWs = () => {
  const navigate = useNavigate();
  const [sows, setSOWs] = useState([]);
  const [loading, setLoading] = useState(false); 
  const [showForm, setShowForm] = useState(false);
  const [editingSOW, setEditingSOW] = useState(null);
  const [filters, setFilters] = useState({
    status: 'All Status',
    client: 'All Clients'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSOWs, setFilteredSOWs] = useState([]);

  useEffect(() => {
    const fetchSOWs = async () => {
      try {
        setLoading(true);
        const response = await sowService.getSOWs();
        // Map the API response to match the table's expected format
        const formattedSOWs = response.data.map(sow => ({
          id: `SOW-${sow.sow_id}`,
          title: sow.sow_title,
          client: sow.client_name || '-', // Using client_name from the API response
          status: sow.sow_status,
          targetKickoffDate: sow.target_kickoff_date,
          value: parseFloat(sow.contract_value) || 0,
          currency: sow.contract_currency,
          // Include original data for reference
          ...sow
        }));
        setSOWs(formattedSOWs);
        setFilteredSOWs(formattedSOWs);
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
    const filtered = sows.filter(sow => {
      const matchesSearch = sow.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sow.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sow.id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filters.status === 'All Status' || sow.status === filters.status;
      return matchesSearch && matchesStatus;
    });
    setFilteredSOWs(filtered);
  }, [searchTerm, filters.status, sows]);

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
    // Check if the currency is a valid 3-letter currency code
    const isValidCurrency = currency && /^[A-Z]{3}$/.test(currency);
    const currencyToUse = isValidCurrency ? currency : 'USD';
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyToUse,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    } catch (error) {
      console.warn(`Error formatting currency (${currency}):`, error);
      // Fallback to default USD formatting if there's an error
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    }
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

  const handleFormSubmit = async (sowData) => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // if (editingSOW) {
      //   await sowService.updateSOW(editingSOW.id, sowData);
      // } else {
      //   await sowService.createSOW(sowData);
      // }
      setShowForm(false);
      // Refresh the SOWs list
      // fetchSOWs();
      toast.success(`SOW ${editingSOW ? 'updated' : 'created'} successfully`);
    } catch (error) {
      console.error('Error saving SOW:', error);
      toast.error(`Failed to ${editingSOW ? 'update' : 'create'} SOW`);
    } finally {
      setLoading(false);
    }
  };

  const handleImportSOW = () => {
    // Handle import SOW
  };

  const handleDelete = async (sow) => {
    if (window.confirm(`Are you sure you want to delete ${sow.title}?`)) {
      try {
        setLoading(true);
        // TODO: Replace with actual API call
        // await sowService.deleteSOW(sow.id);
        // Refresh the SOWs list
        // fetchSOWs();
        toast.success('SOW deleted successfully');
      } catch (error) {
        console.error('Error deleting SOW:', error);
        toast.error('Failed to delete SOW');
      } finally {
        setLoading(false);
      }
    }
  };

  const columns = [
    {
      key: 'title',
      header: 'SOW Title',
      render: (_, row) => (
        <div className="font-medium text-gray-900">{row.title}</div>
      ),
    },
    { key: 'client', header: 'Client' },
    {
      key: 'status',
      header: 'Status',
      render: (status) => getStatusBadge(status),
    },

    {
      key: 'targetKickoffDate',
      header: 'Target Kickoff Date',
      render: (date) => date ? format(parseISO(date), 'MMM d, yyyy') : '-',
    },
    {
      key: 'value',
      header: 'Value',
      render: (value, row) => formatCurrency(value, row.currency),
      className: 'text-right',
    },
  ];

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
              disabled={sows.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
         
        </div>
      </div>

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