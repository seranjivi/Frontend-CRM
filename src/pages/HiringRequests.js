import React from 'react';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';

const HiringRequests = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 font-['Manrope']">Hiring Requests</h2>
          <p className="text-sm text-slate-600">Manage project-based hiring requirements.</p>
        </div>
        <Button className="h-9" onClick={() => window.alert('Create Hiring Request form will be added next.')}>
          <Plus className="h-4 w-4 mr-2" />
          Create
        </Button>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-700">List view + create form will be added next (with configurable Status/Priority and role-based access).</p>
      </div>
    </div>
  );
};

export default HiringRequests;
