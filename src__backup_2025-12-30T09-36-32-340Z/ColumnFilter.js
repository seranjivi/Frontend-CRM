import React, { useState, useEffect, useRef } from 'react';
import { Filter, X } from 'lucide-react';
import masterDataService from '../services/masterDataService';
import DateFilter from './DateFilter';

const ColumnFilter = ({ column, data, onFilterChange, activeFilters = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValues, setSelectedValues] = useState([]);
  const [uniqueValues, setUniqueValues] = useState([]);
  const dropdownRef = useRef(null);

  // Extract unique values from data
  useEffect(() => {
    if (data && column.key) {
      const extractValues = async () => {
        if (column.key === 'region') {
          // For Region column, use master data service
          try {
            const regionNames = await masterDataService.getRegionNames();
            setUniqueValues(regionNames);
          } catch (error) {
            console.error('Error fetching regions for filter:', error);
            // Fallback to data-based extraction
            const values = new Set();
            data.forEach(row => {
              const value = row.region;
              if (value && value !== 'N/A' && value !== '') {
                values.add(value);
              }
            });
            setUniqueValues(Array.from(values).sort());
          }
        } else if (column.key === 'country') {
          // For Country column, use master data service
          try {
            const countries = await masterDataService.getCountries();
            const countryNames = countries.map(c => c.name || c.country_name);
            setUniqueValues(countryNames);
          } catch (error) {
            console.error('Error fetching countries for filter:', error);
            // Fallback to data-based extraction
            const values = new Set();
            data.forEach(row => {
              const value = row.country;
              if (value && value !== 'N/A' && value !== '') {
                values.add(value);
              }
            });
            setUniqueValues(Array.from(values).sort());
          }
        } else {
          // For other columns, extract from data
          const values = new Set();
          data.forEach(row => {
            let value = row[column.key];
            
            // Handle special cases for combined columns
            if (column.key === 'contact_details' && (row.contact_email || row.contact_phone)) {
              value = `${row.contact_email || ''} ${row.contact_phone || ''}`.trim();
            }
            
            if (value && value !== 'N/A' && value !== '') {
              values.add(value);
            }
          });
          
          const sortedValues = Array.from(values).sort((a, b) => {
            if (typeof a === 'string' && typeof b === 'string') {
              return a.localeCompare(b);
            }
            return a - b;
          });
          
          setUniqueValues(sortedValues);
        }
      };

      extractValues();
    }
  }, [data, column.key]);

  // Initialize selected values from active filters
  useEffect(() => {
    const currentFilter = activeFilters.find(f => f.column === column.key);
    if (currentFilter) {
      setSelectedValues(currentFilter.values || []);
    } else {
      setSelectedValues([]);
    }
  }, [activeFilters, column.key]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter values based on search term
  const filteredValues = uniqueValues.filter(value => {
    if (!searchTerm) return true;
    return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
    setSearchTerm('');
  };

  const handleToggleValue = (value) => {
    const newSelectedValues = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    
    setSelectedValues(newSelectedValues);
    onFilterChange(column.key, newSelectedValues);
  };

  const handleClearFilter = () => {
    setSelectedValues([]);
    onFilterChange(column.key, []);
    setSearchTerm('');
  };

  const hasActiveFilter = selectedValues.length > 0;

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
        <div className="absolute top-full left-0 mt-1 w-72 bg-white border border-slate-200 rounded-lg shadow-lg z-50 p-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-xs">Filter by {column.header}</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-3 w-3" />
              </button>
            </div>

            {/* Use DateFilter for date columns, otherwise use regular filter */}
            {column.key === 'created_at' ? (
              <DateFilter
                column={column}
                onFilterChange={onFilterChange}
                activeFilters={activeFilters}
              />
            ) : (
              <>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="max-h-48 overflow-y-auto space-y-1">
                  {filteredValues.length === 0 ? (
                    <div className="text-center py-4 text-slate-500 text-sm">
                      No results found
                    </div>
                  ) : (
                    filteredValues.map((value) => (
                      <label key={value} className="flex items-center gap-2 px-2 py-1 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedValues.includes(value)}
                          onChange={(e) => handleToggleValue(value)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-slate-700">{value}</span>
                      </label>
                    ))
                  )}
                </div>

                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <button
                    onClick={() => setSelectedValues(filteredValues)}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedValues([])}
                    className="text-xs text-slate-600 hover:text-slate-800"
                  >
                    Clear All
                  </button>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => onFilterChange(column.key, selectedValues)}
                    className="flex-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700"
                  >
                    Apply Filter
                  </button>
                  <button
                    onClick={handleClearFilter}
                    className="px-3 py-1.5 border border-slate-300 rounded text-sm hover:bg-slate-50"
                  >
                    Clear
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnFilter;
