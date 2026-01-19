import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import masterDataService from '../services/masterDataService';

const RegionDropdown = ({ 
  value, 
  onChange, 
  countryId,
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
    const fetchRegions = async () => {
      if (!countryId) {
        setRegions([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const regionsData = await masterDataService.getRegionsByCountryId(countryId);
        setRegions(regionsData);
        
        // Clear selected region if it's not in the new list
        if (value && !regionsData.some(r => r.name === value)) {
          onChange('');
        }
      } catch (err) {
        setError('Failed to load regions');
        console.error('Error loading regions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRegions();
  }, [countryId]);

  if (!countryId) {
    return (
      <div className="w-full">
        <Select disabled>
          <SelectTrigger className={`w-full opacity-50 ${className}`}>
            <SelectValue placeholder="Select a country first" />
          </SelectTrigger>
        </Select>
      </div>
    );
  }
  if (error) {
    return (
      <div className="w-full">
        <div className="flex items-center p-2 text-sm text-red-500">
          <AlertCircle className="w-4 h-4 mr-2" />
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full">
        <Select disabled>
          <SelectTrigger className={`w-full ${className}`}>
            <div className="flex items-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading regions...
            </div>
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Select 
        key={`region-${countryId || 'no-country'}-${value || 'empty'}`}
        defaultValue={value}
        onValueChange={onChange}
        disabled={disabled || loading}
        required={required}
      >
        <SelectTrigger className={`w-full ${className}`}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {regions.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No regions available</div>
          ) : (
            regions.map((region) => (
              <SelectItem 
                key={region.id || region.name}
                value={region.name}
              >
                {region.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {showRequiredIndicator && !value && (
        <p className="mt-1 text-sm text-red-500">Region is required</p>
      )}
    </div>
  );
};

export default RegionDropdown;
