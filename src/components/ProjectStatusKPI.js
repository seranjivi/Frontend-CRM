import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const ProjectStatusKPI = ({ onStatusFilter, activeFilters, projects }) => {
  const [kpiData, setKpiData] = useState({
    Active: 0,
    Planning: 0,
    Completed: 0,
    OnHold: 0
  });
  const [loading, setLoading] = useState(true);

  const statusConfig = {
    Active: {
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      dotColor: 'bg-blue-500',
      activeColor: 'bg-blue-100 text-blue-800 border-blue-300 ring-2 ring-blue-500 ring-offset-1'
    },
    Planning: {
      color: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
      dotColor: 'bg-orange-500',
      activeColor: 'bg-orange-100 text-orange-800 border-orange-300 ring-2 ring-orange-500 ring-offset-1'
    },
    Completed: {
      color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      dotColor: 'bg-green-500',
      activeColor: 'bg-green-100 text-green-800 border-green-300 ring-2 ring-green-500 ring-offset-1'
    },
    OnHold: {
      color: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
      dotColor: 'bg-gray-500',
      activeColor: 'bg-gray-100 text-gray-800 border-gray-300 ring-2 ring-gray-500 ring-offset-1'
    }
  };

  useEffect(() => {
    calculateKPIFromProjects();
  }, [projects]);

  const calculateKPIFromProjects = () => {
    if (!projects || projects.length === 0) {
      setKpiData({
        Active: 0,
        Planning: 0,
        Completed: 0,
        OnHold: 0
      });
      setLoading(false);
      return;
    }

    const counts = {
      Active: 0,
      Planning: 0,
      Completed: 0,
      OnHold: 0
    };

    projects.forEach(project => {
      const status = project.status || 'Active';
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });

    setKpiData(counts);
    setLoading(false);
  };

  const handleStatusClick = (status) => {
    // Check if this status is already filtered
    const existingFilter = activeFilters.find(f => f.column === 'status');
    
    if (existingFilter && existingFilter.values.includes(status)) {
      // Remove filter
      onStatusFilter('status', []);
    } else {
      // Add or update filter
      onStatusFilter('status', [status]);
    }
  };

  const isStatusActive = (status) => {
    const existingFilter = activeFilters.find(f => f.column === 'status');
    return existingFilter && existingFilter.values.includes(status);
  };

  if (loading) {
    return (
      <div className="flex gap-2 mb-3">
        {Object.keys(statusConfig).map(status => (
          <div key={status} className="h-6 w-16 bg-gray-100 rounded-full animate-pulse"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 mb-3 flex-wrap items-center">
      <span className="text-xs text-slate-500 mr-1">Status:</span>
      {Object.entries(statusConfig).map(([status, config]) => {
        const count = kpiData[status];
        const isActive = isStatusActive(status);
        
        return (
          <Button
            key={status}
            variant="outline"
            size="sm"
            onClick={() => handleStatusClick(status)}
            className={`
              h-5 px-2 py-0.5 text-xs font-medium rounded-full border 
              transition-all duration-200 cursor-pointer whitespace-nowrap
              ${isActive 
                ? config.activeColor 
                : config.color
              }
            `}
          >
            <span className={`w-1 h-1 rounded-full mr-1 inline-block ${config.dotColor}`}></span>
            {status} {count}
          </Button>
        );
      })}
    </div>
  );
};

export default ProjectStatusKPI;
