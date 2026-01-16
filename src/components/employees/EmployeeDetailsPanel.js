import React from 'react';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';
import KPICards from './KPICards';
import MonthFilter from './MonthFilter';
import ProposalTable from './ProposalTable';

const EmployeeDetailsPanel = ({ 
  employee, 
  kpis, 
  proposals, 
  selectedMonth, 
  onMonthChange,
  onExportPerson,
  onExportAll 
}) => {
  if (!employee) {
    return (
      <div className="h-full flex items-center justify-center text-slate-500">
        <div className="text-center">
          <p className="text-sm">Select an employee to view their performance</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header with Employee Info and Actions */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-['Manrope']">{employee.full_name}</h2>
          <p className="text-sm text-slate-600 mt-0.5">{employee.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <MonthFilter value={selectedMonth} onChange={onMonthChange} />
          <Button
            variant="default"
            size="sm"
            onClick={onExportPerson}
            className="bg-[#2C6AA6] hover:bg-[#2C6AA6]/90 h-8 text-xs px-3"
          >
            <Download className="h-3 w-3 mr-1.5" />
            Export CSV (this person)
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExportAll}
            className="h-8 text-xs px-3"
          >
            <Download className="h-3 w-3 mr-1.5" />
            Export CSV (all)
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards kpis={kpis} />

      {/* Proposals Table */}
      <div className="flex-1 overflow-hidden">
        <ProposalTable proposals={proposals} />
      </div>
    </div>
  );
};

export default EmployeeDetailsPanel;