import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import DataTable from '../components/DataTable';
import PartnerForm from '../components/PartnerForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { toast } from 'sonner';
import { formatDate } from '../utils/dateUtils';

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      const response = await api.get('/partners');
      setPartners(response.data);
    } catch (error) {
      toast.error('Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (partner) => {
    if (window.confirm(`Are you sure you want to delete ${partner.name}?`)) {
      try {
        await api.delete(`/partners/${partner.id}`);
        toast.success('Partner deleted successfully');
        fetchPartners();
      } catch (error) {
        toast.error('Failed to delete partner');
      }
    }
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPartner(null);
    fetchPartners();
  };

  const handleImport = () => {
    fileInputRef.current?.click();
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
          const partnerData = {
            name: values[headers.indexOf('name')] || '',
            category: values[headers.indexOf('category')] || '',
            region: values[headers.indexOf('region')] || '',
            website: values[headers.indexOf('website')] || '',
            address: values[headers.indexOf('address')] || '',
            status: values[headers.indexOf('status')] || 'Active',
            notes: values[headers.indexOf('notes')] || '',
            contacts: [],
          };

          if (!partnerData.name) {
            errorCount++;
            continue;
          }

          try {
            await api.post('/partners', partnerData);
            successCount++;
          } catch (error) {
            errorCount++;
          }
        }

        if (successCount > 0) {
          toast.success(`Successfully imported ${successCount} partner(s)`);
          fetchPartners();
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
    { key: 'name', header: 'Partner Name' },
    {
      key: 'created_at',
      header: 'Date',
      render: (value) => <span className="text-xs text-slate-700">{formatDate(value)}</span>
    },
    { 
      key: 'partner_type', 
      header: 'Type',
      render: (value) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {value || 'Vendor'}
        </span>
      )
    },
    { key: 'category', header: 'Category' },
    { key: 'region', header: 'Region' },
    {
      key: 'status',
      header: 'Status',
      render: (value) => (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
          {value}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6AA6]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="partners-page">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 font-['Manrope']">Partners</h1>
          <p className="text-sm text-slate-600 mt-0.5">Manage partner relationships</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          data-testid="add-partner-btn"
          className="bg-[#0A2A43] hover:bg-[#0A2A43]/90"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Partner
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <DataTable
        data={partners}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onImport={handleImport}
        filterOptions={{}}
        testId="partners-table"
      />

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPartner ? 'Edit Partner' : 'Add New Partner'}</DialogTitle>
          </DialogHeader>
          <PartnerForm partner={editingPartner} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Partners;