import React, { useState, useEffect } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const HiringRequestStatusKPI = ({ onStatusFilter, activeFilters, hiringRequests }) => {
  const [kpiData, setKpiData] = useState({
    Draft: 0,
    Open: 0,
    Interviewing: 0,
    Offered: 0,
    Filled: 0,
    Cancelled: 0
  });
  const [loading, setLoading] = useState(true);

  const statusConfig = {
    Draft: {
      color: 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100',
      dotColor: 'bg-gray-500',
      activeColor: 'bg-gray-100 text-gray-800 border-gray-300 ring-2 ring-gray-500 ring-offset-1'
    },
    Open: {
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
      dotColor: 'bg-blue-500',
      activeColor: 'bg-blue-100 text-blue-800 border-blue-300 ring-2 ring-blue-500 ring-offset-1'
    },
    Interviewing: {
      color: 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100',
      dotColor: 'bg-yellow-500',
      activeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300 ring-2 ring-yellow-500 ring-offset-1'
    },
    Offered: {
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
      dotColor: 'bg-purple-500',
      activeColor: 'bg-purple-100 text-purple-800 border-purple-300 ring-2 ring-purple-500 ring-offset-1'
    },
    Filled: {
      color: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
      dotColor: 'bg-green-500',
      activeColor: 'bg-green-100 text-green-800 border-green-300 ring-2 ring-green-500 ring-offset-1'
    },
    Cancelled: {
      color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
      dotColor: 'bg-red-500',
      activeColor: 'bg-red-100 text-red-800 border-red-300 ring-2 ring-red-500 ring-offset-1'
    }
  };

  useEffect(() => {
    calculateKPIFromHiringRequests();
  }, [hiringRequests]);

  const calculateKPIFromHiringRequests = () => {
    if (!hiringRequests || hiringRequests.length === 0) {
      setKpiData({
        Draft: 0,
        Open: 0,
        Interviewing: 0,
        Offered: 0,
        Filled: 0,
        Cancelled: 0
      });
      setLoading(false);
      return;
    }

    const counts = {
      Draft: 0,
      Open: 0,
      Interviewing: 0,
      Offered: 0,
      Filled: 0,
      Cancelled: 0
    };

    hiringRequests.forEach(request => {
      const status = request.status || 'Draft';
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

export default HiringRequestStatusKPI;
