import React from 'react';
import { Button } from '../ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { Card } from '../ui/card';

const EmployeeListPanel = ({ employees, selectedEmployee, onSelectEmployee, onAddEmployee, onRefresh, loading }) => {
  return (
    <Card className="h-full flex flex-col border-slate-200">
      {/* Header */}
      <div className="p-3 border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-slate-900">Salespeople</h3>
          <div className="flex gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={onAddEmployee}
              className="h-7 text-xs px-2"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-7 text-xs px-2"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Employee List - Scrollable */}
      <div className="flex-1 overflow-y-auto p-2">
        {employees.length === 0 ? (
          <div className="text-center py-8 text-sm text-slate-500">
            No employees found
          </div>
        ) : (
          <div className="space-y-1">
            {employees.map((employee) => {
              const isSelected = selectedEmployee?.id === employee.id;
              return (
                <button
                  key={employee.id}
                  onClick={() => onSelectEmployee(employee)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    isSelected
                      ? 'bg-[#2C6AA6] text-white shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-900'
                  }`}
                >
                  <div className="font-medium text-sm">{employee.full_name}</div>
                  <div className={`text-xs mt-0.5 ${
                    isSelected ? 'text-blue-100' : 'text-slate-500'
                  }`}>
                    {employee.role}
                  </div>
                  <div className={`text-xs mt-1 ${
                    isSelected ? 'text-blue-50' : 'text-slate-400'
                  }`}>
                    {employee.proposalCount || 0} proposals
                  </div>
                </button>
              );
            })}
          </div>
        )
        }
      </div>

      {/* Helper Text */}
      <div className="p-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
        <p className="text-xs text-slate-600">
          Tip: select a salesperson to view individual KPIs and proposals. Use the month filter to see performance for a specific period.
        </p>
      </div>
    </Card>
  );
};

export default EmployeeListPanel;