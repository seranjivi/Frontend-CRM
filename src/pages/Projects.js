import React, { useState } from 'react';
import DataTable from '../components/DataTable';
import ProjectStatusKPI from '../components/ProjectStatusKPI';
import { Button } from '../components/ui/button';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Projects = () => {
  const [projects] = useState([
    {
      id: 1,
      name: 'E-Commerce Platform',
      client: 'Tech Corp',
      status: 'Active',
      startDate: '2024-01-15',
      endDate: '2024-06-30',
      value: '$250,000',
      manager: 'John Smith'
    },
    {
      id: 2,
      name: 'Mobile Banking App',
      client: 'Finance Inc',
      status: 'Planning',
      startDate: '2024-03-01',
      endDate: '2024-09-30',
      value: '$180,000',
      manager: 'Sarah Johnson'
    },
    {
      id: 3,
      name: 'CRM System',
      client: 'Sales Corp',
      status: 'Completed',
      startDate: '2023-10-01',
      endDate: '2024-01-15',
      value: '$120,000',
      manager: 'Mike Davis'
    },
    {
      id: 4,
      name: 'Payment Gateway',
      client: 'Finance Inc',
      status: 'OnHold',
      startDate: '2024-02-01',
      endDate: '2024-08-30',
      value: '$200,000',
      manager: 'Lisa Chen'
    }
  ]);
  const [activeFilters, setActiveFilters] = useState([]);

  const columns = [
    { key: 'name', header: 'Project Name', label: 'Project Name' },
    { key: 'client', header: 'Client', label: 'Client' },
    { key: 'status', header: 'Status', label: 'Status' },
    { key: 'startDate', header: 'Start Date', label: 'Start Date' },
    { key: 'endDate', header: 'End Date', label: 'End Date' },
    { key: 'value', header: 'Value', label: 'Value' },
    { key: 'manager', header: 'Project Manager', label: 'Project Manager' }
  ];

  const handleStatusFilter = (column, values) => {
    if (values.length === 0) {
      setActiveFilters(activeFilters.filter(f => f.column !== column));
    } else {
      const existingFilter = activeFilters.find(f => f.column === column);
      if (existingFilter) {
        setActiveFilters(activeFilters.map(f => 
          f.column === column ? { ...f, values } : f
        ));
      } else {
        setActiveFilters([...activeFilters, { column, values }]);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 font-['Manrope']">Projects</h2>
          <p className="text-sm text-slate-600">Project workspace for delivery and resource planning.</p>
        </div>
        <Button className="h-9">
          <Plus className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>

      <ProjectStatusKPI 
        projects={projects}
        activeFilters={activeFilters}
        onStatusFilter={handleStatusFilter}
      />

      <DataTable
        data={projects}
        columns={columns}
        onEdit={(item) => console.log('Edit project:', item)}
        onDelete={(item) => console.log('Delete project:', item)}
        testId="projects-table"
        activeFilters={activeFilters}
        onFilterChange={handleStatusFilter}
      />
    </div>
  );
};

export default Projects;
