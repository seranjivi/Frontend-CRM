import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'sonner';
import EmployeeListPanel from '../components/employees/EmployeeListPanel';
import EmployeeDetailsPanel from '../components/employees/EmployeeDetailsPanel';
import EmployeeForm from '../components/EmployeeForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

const EmployeesPerformance = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [proposals, setProposals] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchEmployeePerformance(selectedEmployee.id, selectedMonth);
    }
  }, [selectedEmployee, selectedMonth]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      // Fetch employees with proposal counts
      const response = await api.get('/employees/proposal-counts');
      setEmployees(response.data);
      
      // Auto-select first employee
      if (response.data.length > 0 && !selectedEmployee) {
        setSelectedEmployee(response.data[0]);
      }
    } catch (error) {
      toast.error('Failed to fetch employees');
      console.error('Fetch employees error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployeePerformance = async (employeeId, month) => {
    try {
      // Fetch real performance data from backend
      const params = month !== 'all' ? { month } : {};
      const response = await api.get(`/employees/${employeeId}/performance`, { params });
      
      setKpis(response.data.kpis);
      setProposals(response.data.proposals);
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
      toast.error('Failed to load performance data');
      
      // Set empty data on error
      setKpis({
        totalProposals: 0,
        proposalsWon: 0,
        winRate: 0,
        totalDealValue: 0,
        averageDeal: 0,
        open: 0,
        lost: 0,
        onHold: 0
      });
      setProposals([]);
    }
  };

  const handleAddEmployee = () => {
    setEditingUser(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingUser(null);
    fetchEmployees();
  };

  const handleExportPerson = () => {
    toast.success(`Exporting data for ${selectedEmployee?.full_name}...`);
    // TODO: Implement actual CSV export
  };

  const handleExportAll = () => {
    toast.success('Exporting data for all employees...');
    // TODO: Implement actual CSV export
  };

  if (loading && employees.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2C6AA6]"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" data-testid="employees-performance-page">
      {/* Page Header - Compact */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900 font-['Manrope']">Employees — Sales Performances</h1>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        {/* Left Panel - Employee List (30%) */}
        <div className="col-span-3 h-full overflow-hidden">
          <EmployeeListPanel
            employees={employees}
            selectedEmployee={selectedEmployee}
            onSelectEmployee={setSelectedEmployee}
            onAddEmployee={handleAddEmployee}
            onRefresh={fetchEmployees}
            loading={loading}
          />
        </div>

        {/* Right Panel - Employee Details (70%) */}
        <div className="col-span-9 h-full overflow-y-auto">
          <EmployeeDetailsPanel
            employee={selectedEmployee}
            kpis={kpis}
            proposals={proposals}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onExportPerson={handleExportPerson}
            onExportAll={handleExportAll}
          />
        </div>
      </div>

      {/* Add/Edit Employee Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          </DialogHeader>
          <EmployeeForm user={editingUser} onClose={handleFormClose} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeesPerformance;
