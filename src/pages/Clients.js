import React, { useState, useEffect, useRef } from 'react';
import { Plus, Download, X, Search, Upload } from 'lucide-react';
import DataTable from '../components/DataTable';
import ClientForm from '../components/ClientForm';
import { Dialog, DialogContent } from '../components/ui/dialog';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';
import { Button } from '../components/ui/button';
import ImportCSVModal from '../components/ImportCSVModal';
import clientService from '../services/clientService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [filters, setFilters] = useState({
    region: '',
    client_status: '',
    client_tier: '',
    date_range: 'all',
    search: '',
    client_name: ''
  });
  const fileInputRef = useRef(null);

  // Get unique values for filters
  const filterOptions = {
    region: [...new Set(clients.map(client => client.region).filter(Boolean))],
    client_status: ['Active', 'Inactive', 'Prospect'],
    client_tier: ['A', 'B', 'C', 'D']
  };

  const statusOptions = ['All Status', 'Active', 'Inactive'];

  // Filter clients based on all active filters
  const filteredClients = clients.filter(client => {
    const now = new Date();
    const clientDate = new Date(client.created_at);
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfYear = new Date(now.getFullYear(), 0, 1);
    const firstDayOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const firstDayOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const lastDayOfLastYear = new Date(now.getFullYear() - 1, 11, 31);

    let dateInRange = true;
    switch (filters.date_range) {
      case 'this_month':
        dateInRange = clientDate >= firstDayOfMonth;
        break;
      case 'this_year':
        dateInRange = clientDate >= firstDayOfYear;
        break;
      case 'last_month':
        dateInRange = clientDate >= firstDayOfLastMonth && clientDate <= lastDayOfLastMonth;
        break;
      case 'last_year':
        dateInRange = clientDate >= firstDayOfLastYear && clientDate <= lastDayOfLastYear;
        break;
      case 'all':
      default:
        dateInRange = true;
    }

    // Client name filter (case-insensitive search)
    const matchesSearch = !filters.search || 
      (client.client_name && client.client_name.toLowerCase().includes(filters.search.toLowerCase()));

    // Client name dropdown filter (exact match)
    const matchesClientName = !filters.client_name || 
      (client.client_name && client.client_name === filters.client_name);

    // Status filter
    const matchesStatus = !filters.client_status || 
      filters.client_status === '' ||
      filters.client_status === 'All Status' ||
      (filters.client_status === 'Active' && client.client_status === 'Active') ||
      (filters.client_status === 'Inactive' && (!client.client_status || client.client_status === 'Inactive'));

    return (
      matchesSearch &&
      matchesClientName &&
      (filters.region === '' || client.region === filters.region) &&
      matchesStatus &&
      (filters.client_tier === '' || client.client_tier === filters.client_tier) &&
      dateInRange
    );
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      region: '',
      client_status: '',
      client_tier: '',
      date_range: 'all'
    });
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const data = await clientService.getClients();
      setClients(data);
    } catch (error) {
      toast.error('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (client) => {
    if (window.confirm(`Are you sure you want to delete ${client.client_name}?`)) {
      try {
        // Check for different possible ID fields
        const clientId = client.id || client._id || client.client_id;
        if (!clientId) {
          throw new Error('Client ID not found');
        }
        await clientService.deleteClient(clientId);
        toast.success('Client deleted successfully');
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error(error.message || 'Failed to delete client');
      }
    }
  };

  const handleView = async (client, e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    
    try {
      console.log('Client object (view):', client);
      const clientId = client.id || client._id || client.client_id;
      if (!clientId) {
        throw new Error('Client ID not found');
      }
      console.log('Using client ID (view):', clientId);
      const response = await clientService.getClientById(clientId);
      console.log('API Response (view):', response);
      
      if (response) {
        const clientData = response.data || response;
        console.log('Client data (view):', clientData);
        
        const formData = {
          id: clientData.id || clientData._id || clientData.client_id,
          client_name: clientData.client_name || '',
          contact_email: clientData.contact_email || clientData.email || '',
          website: clientData.website || '',
          industry: clientData.industry || '',
          customer_type: clientData.customer_type || 'Direct Customer',
          gst_tax_id: clientData.gst_tax_id || clientData.tax_id || '',
          client_status: clientData.status === 'active' || clientData.client_status === 'Active' ? 'Active' : 'Inactive',
          notes: clientData.notes || '',
          account_owner: clientData.account_owner || clientData.user_id || '',
          addresses: clientData.addresses && clientData.addresses.length > 0 
            ? clientData.addresses.map(addr => ({
                address_line1: addr.address_line1 || '',
                address_line2: addr.address_line2 || '',
                city: addr.city || '',
                region: addr.region_state || '',
                country: addr.country || '',
                postal_code: addr.postal_code || '',
                is_primary: addr.is_primary || false
              }))
            : [{ address_line1: '', country: '', region: '', is_primary: true }],
          contact_persons: clientData.contacts && clientData.contacts.length > 0
            ? clientData.contacts.map(contact => ({
                name: contact.name || '',
                email: contact.email || '',
                phone: contact.phone || '',
                position: contact.position || '',
                is_primary: contact.is_primary || false
              }))
            : [{ name: '', email: '', phone: '', position: '', is_primary: false }]
        };
        
        setViewingClient(formData);
        setIsViewMode(true);
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error fetching client details (view):', error);
      toast.error('Failed to load client details');
    }
  };

  const handleEdit = async (client, e) => {
    if (e && typeof e.stopPropagation === 'function') {
      e.stopPropagation();
    }
    
    try {
      console.log('Client object (edit):', client);
      const clientId = client.id || client._id || client.client_id;
      if (!clientId) {
        throw new Error('Client ID not found');
      }
      console.log('Using client ID (edit):', clientId);
      const response = await clientService.getClientById(clientId);
      console.log('API Response (edit):', response);
      
      if (response) {
        const clientData = response.data || response;
        console.log('Client data (edit):', clientData);
        
        const formData = {
          id: clientData.id || clientData._id || clientData.client_id,
          client_name: clientData.client_name || '',
          contact_email: clientData.contact_email || clientData.email || '',
          website: clientData.website || '',
          industry: clientData.industry || '',
          customer_type: clientData.customer_type || 'Direct Customer',
          gst_tax_id: clientData.gst_tax_id || clientData.tax_id || '',
          client_status: clientData.status === 'active' || clientData.client_status === 'Active' ? 'Active' : 'Inactive',
          notes: clientData.notes || '',
          account_owner: clientData.account_owner || clientData.user_id || '',
          addresses: clientData.addresses && clientData.addresses.length > 0 
            ? clientData.addresses.map(addr => ({
                address_line1: addr.address_line1 || '',
                address_line2: addr.address_line2 || '',
                city: addr.city || '',
                region: addr.region_state || '',
                country: addr.country || '',
                postal_code: addr.postal_code || '',
                is_primary: addr.is_primary || false
              }))
            : [{ address_line1: '', country: '', region: '', is_primary: true }],
          contact_persons: clientData.contacts && clientData.contacts.length > 0
            ? clientData.contacts.map(contact => ({
                name: contact.name || '',
                email: contact.email || '',
                phone: contact.phone || '',
                position: contact.position || '',
                is_primary: contact.is_primary || false
              }))
            : [{ name: '', email: '', phone: '', position: '', is_primary: false }]
        };
        
        setEditingClient(formData);
        setIsViewMode(false);
        setShowForm(true);
      }
    } catch (error) {
      console.error('Error fetching client details (edit):', error);
      toast.error('Failed to load client details');
    }
  };

  const handleFormClose = (shouldRefresh = false) => {
    setShowForm(false);
    setEditingClient(null);
    setViewingClient(null);
    setIsViewMode(false);
    if (shouldRefresh) {
      fetchClients();
    }
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'name',
      'industry',
      'region',
      'country',
      'website',
      'address',
      'status',
      'account_manager',
      'notes'
    ];

    const csvContent = [
      headers.join(','),
      headers.map(() => '').join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_import_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleExport = async () => {
    if (clients.length === 0) {
      toast.warning('No clients to export');
      return;
    }

    try {
      const csvContent = clientService.exportClients(clients);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to export clients: ' + error.message);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

 
    const validTypes = ['text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    if (!validTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast.error('Please upload a valid CSV or XLSX file');
      return;
    }
 
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result;
        const rows = text.split('\n').filter(row => row.trim());
       
        if (rows.length < 2) {
          toast.error('File must contain at least a header row and one data row');
          return;
        }
 
        const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
        const dataRows = rows.slice(1);
 
        let successCount = 0;
        let errorCount = 0;
 
        for (const row of dataRows) {
          const values = row.split(',').map(v => v.trim());
          const clientData = {
            name: values[headers.indexOf('name')] || '',
            industry: values[headers.indexOf('industry')] || '',
            region: values[headers.indexOf('region')] || '',
            country: values[headers.indexOf('country')] || '',
            website: values[headers.indexOf('website')] || '',
            address: values[headers.indexOf('address')] || '',
            status: values[headers.indexOf('status')] || 'Active',
            account_manager: values[headers.indexOf('account_manager')] || '',
            notes: values[headers.indexOf('notes')] || '',
            contacts: [],
          };
 
          if (!clientData.name) {
            errorCount++;
            continue;
          }
 
          try {
            await api.post('/clients', clientData);
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }
 
        if (successCount > 0) {
          toast.success(`Successfully imported ${successCount} client(s)`);
          fetchClients();
        }
        if (errorCount > 0) {
          toast.warning(`${errorCount} row(s) failed to import`);
        }
      } catch (error) {
        toast.error('Failed to process file. Please check the format.');
      }
    };
 
    reader.readAsText(file);
    event.target.value = '';
  };
 
  const columns = [
    {
      key: 'client_code',
      header: 'Client ID',
      render: (value) => (
        <span className="text-blue-600">
          {value}
        </span>
      ),
    },
    {
      key: 'client_name',
      header: 'Client Name',
      render: (value) => <span className="font-medium">{value}</span>,
    },
    {
      key: 'industry',
      header: 'Industry',
      render: (value) => <span className="text-sm">{value || '-'}</span>,
    },
    {
      key: 'customer_type',
      header: 'Customer Type',
      render: (value) => <span className="text-sm">{value || '-'}</span>,
    },
    {
      key: 'email',
      header: 'Email',
      render: (value) => value ? (
        <a href={`mailto:${value}`} className="text-blue-600 hover:underline text-sm">
          {value}
        </a>
      ) : '-',
    },
    {
      key: 'account_owner',
      header: 'Account Owner',
      render: (value) => <span className="text-sm">{value || '-'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (_, row) => {
        // Check both 'status' and 'client_status' fields
        const statusValue = row.status || row.client_status;
        if (!statusValue) return <span className="px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700">-</span>;
        
        const status = String(statusValue).toLowerCase();
        const statusText = status.charAt(0).toUpperCase() + status.slice(1);
        return (
          <span
            className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              status === 'active' ? 'bg-green-100 text-green-800' :
              status === 'inactive' ? 'bg-red-100 text-red-800' :
              'bg-slate-100 text-slate-800'
            }`}
          >
            {statusText}
          </span>
        );
      },
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (value) => <span className="text-sm text-slate-700">{formatDate(value)}</span>
    },
  ];
 
  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
          <div className="pt-1">
            <div className="flex items-baseline gap-2">
              <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
              <span className="text-sm text-slate-500">
                ({clients.length} {clients.length === 1 ? 'record' : 'records'})
              </span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-sm text-slate-600 mt-0.5">Manage your client accounts</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <div className="relative flex items-center">
              <Search className="absolute left-3 h-4 w-4 text-gray-500" />
              <input
                type="search"
                placeholder="Search..."
                className="pl-9 w-[180px] h-9 text-sm rounded-md border border-input bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
              {filters.search && (
                <X
                  className="absolute right-2.5 h-4 w-4 text-muted-foreground cursor-pointer"
                  onClick={() => handleFilterChange('search', '')}
                />
              )}
            </div>
            <Select 
              value={filters.client_name || ''}
              onValueChange={(value) => handleFilterChange('client_name', value === 'All Clients' ? '' : value)}
            >
              <SelectTrigger className="w-[150px] h-9 text-sm">
                <SelectValue placeholder="Client Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Clients">All Clients</SelectItem>
                {Array.from(new Set(clients.map(c => c.client_name).filter(Boolean))).map((name) => (
                  <SelectItem key={name} value={name}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select 
              value={filters.status} 
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger className="w-[130px] h-9 text-sm">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportModal(true)}
              className="h-9 text-xs sm:text-sm whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5 mr-1.5 rotate-180" />
              Import
            </Button> */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={clients.length === 0}
              className="h-9 text-xs sm:text-sm whitespace-nowrap"
            >
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
            <Button
              onClick={() => {
                setEditingClient(null);
                setShowForm(true);
              }}
              className="h-9 text-xs sm:text-sm whitespace-nowrap bg-[#0A2A43] hover:bg-[#0A2A43]/90"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Client
            </Button>
          </div>
        </div>

       
        <DataTable
          data={filteredClients}
          columns={columns}
          onView={handleView}
          onEdit={(client) => handleEdit(client)}
          onDelete={handleDelete}
          testId="clients-table"
          loading={loading}
          hideAddButton={true}
          viewButtonClass="h-8 w-8 p-0 text-gray-600 hover:text-gray-800"
          editButtonClass="h-8 w-8 p-0 text-blue-600 hover:text-blue-800"
          deleteButtonClass="h-8 w-8 p-0 text-red-600 hover:text-red-800"
        />
      </div>
 
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
          <ClientForm
            client={isViewMode ? viewingClient : editingClient}
            viewMode={isViewMode}
            onSuccess={() => {
              fetchClients();
              setShowForm(false);
            }}
            onClose={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      <ImportCSVModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onFileSelect={handleFileSelect}
        title="Import Clients"
      />
    </div>
  );
};

export default Clients;