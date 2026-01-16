import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Loader2, AlertCircle } from 'lucide-react';
import masterDataService from '../services/masterDataService';

const CountryDropdown = ({ 
  value, 
  onChange, 
  region,
  placeholder = "Select country...",
  required = false,
  disabled = false,
  className = "",
  showRequiredIndicator = false
}) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (region) {
      loadCountries(region);
    } else {
      loadAllCountries();
    }
  }, [region]);

  const loadAllCountries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const allCountries = await masterDataService.getCountries();
      const countryNames = allCountries.map(country => country.name || country.country_name);
      setCountries(countryNames);
    } catch (err) {
      setError('Failed to load countries');
      console.error('Error loading all countries:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async (selectedRegion) => {
    try {
      setLoading(true);
      setError(null);
      
      const regionCountries = await masterDataService.getCountryNamesByRegion(selectedRegion);
      setCountries(regionCountries);
      
      // Clear country if it's not in the new region's countries
      if (value && !regionCountries.includes(value)) {
        onChange('');
      }
    } catch (err) {
      setError('Failed to load countries');
      console.error('Error loading countries:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = (selectedValue) => {
    onChange(selectedValue);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-500 text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading countries...
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

  if (countries.length === 0) {
    return (
      <div className="text-slate-500 text-sm">
        No countries available
      </div>
    );
  }

  return (
    <Select 
      value={value} 
      onValueChange={handleCountryChange}
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
        {countries.map((country) => (
          <SelectItem key={country} value={country}>
            {country}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountryDropdown;
