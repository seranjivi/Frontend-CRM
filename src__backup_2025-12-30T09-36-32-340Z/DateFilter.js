import React, { useState, useEffect } from 'react';
import { Filter, X, Calendar } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';

const DateFilter = ({ column, onFilterChange, activeFilters = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filterType, setFilterType] = useState('single'); // 'single' or 'range'
  const [singleDate, setSingleDate] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const dropdownRef = React.useRef(null);

  useEffect(() => {
    // Initialize filter from active filters
    const currentFilter = activeFilters.find(f => f.column === column.key);
    if (currentFilter && currentFilter.values.length > 0) {
      const filterValue = currentFilter.values[0];
      if (filterValue.includes(' to ')) {
        setFilterType('range');
        const [from, to] = filterValue.split(' to ');
        setFromDate(from);
        setToDate(to);
      } else {
        setFilterType('single');
        setSingleDate(filterValue);
      }
    }
  }, [activeFilters, column.key]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFilterChange = () => {
    let filterValue = '';
    
    if (filterType === 'single' && singleDate) {
      filterValue = singleDate;
    } else if (filterType === 'range' && fromDate && toDate) {
      filterValue = `${fromDate} to ${toDate}`;
    }

    if (filterValue) {
      onFilterChange(column.key, [filterValue]);
    } else {
      onFilterChange(column.key, []);
    }
    setIsOpen(false);
  };

  const clearFilter = () => {
    setSingleDate('');
    setFromDate('');
    setToDate('');
    setFilterType('single');
    onFilterChange(column.key, []);
    setIsOpen(false);
  };

  const hasActiveFilter = activeFilters.some(f => f.column === column.key && f.values.length > 0);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-1 rounded hover:bg-slate-100 transition-colors ${
          hasActiveFilter ? 'text-blue-600 bg-blue-50' : 'text-slate-500'
        }`}
        title={`Filter by ${column.header}`}
      >
        <Filter className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-slate-900">Filter by {column.header}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium text-slate-700">Filter Type</Label>
              <RadioGroup value={filterType} onValueChange={setFilterType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single" className="text-sm">Single Date</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="range" id="range" />
                  <Label htmlFor="range" className="text-sm">Date Range</Label>
                </div>
              </RadioGroup>
            </div>

            {filterType === 'single' ? (
              <div className="space-y-2">
                <Label htmlFor="single-date" className="text-sm font-medium text-slate-700">
                  Select Date
                </Label>
                <Input
                  id="single-date"
                  type="date"
                  value={singleDate}
                  onChange={(e) => setSingleDate(e.target.value)}
                  className="w-full"
                />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="from-date" className="text-sm font-medium text-slate-700">
                    From Date
                  </Label>
                  <Input
                    id="from-date"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to-date" className="text-sm font-medium text-slate-700">
                    To Date
                  </Label>
                  <Input
                    id="to-date"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleFilterChange}
                size="sm"
                className="flex-1"
                disabled={
                  (filterType === 'single' && !singleDate) ||
                  (filterType === 'range' && (!fromDate || !toDate))
                }
              >
                Apply Filter
              </Button>
              <Button
                onClick={clearFilter}
                variant="outline"
                size="sm"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateFilter;
