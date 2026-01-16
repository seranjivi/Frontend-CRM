import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import masterDataService from '../services/masterDataService';

const RegionDropdown = ({ 
  value, 
  onChange, 
  placeholder = "Select region...",
  required = false,
  disabled = false,
  className = "",
  showRequiredIndicator = false
}) => {
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    try {
      setLoading(true);
      setError(null);
      const regionNames = await masterDataService.getRegionNames();
      setRegions(regionNames);
    } catch (err) {
      setError('Failed to load regions');
      console.error('Error loading regions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionChange = (selectedValue) => {
    onChange(selectedValue);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading regions...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-red-500 text-sm">
        <AlertCircle className="h-4 w-4" />
        {error}
      </div>
    );
  }

  if (regions.length === 0) {
    return (
      <div className="text-slate-500 text-sm">
        No regions available
      </div>
    );
  }

  return (
    <Select 
      value={value} 
      onValueChange={handleRegionChange}
      disabled={disabled}
      required={required}
    >
      <SelectTrigger className={`w-full ${className}`}>
        <SelectValue placeholder={placeholder} />
        {required && showRequiredIndicator && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </SelectTrigger>
      <SelectContent>
        {regions.map((region) => (
          <SelectItem key={region} value={region}>
            {region}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default RegionDropdown;
