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
    const fetchCountries = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Always fetch all countries from the API
        const allCountries = await masterDataService.getCountries();
        
        // If a region is provided, filter countries by that region
        const filteredCountries = region
          ? allCountries.filter(country => 
              country.region === region || 
              country.region_name === region
            )
          : allCountries;

        setCountries(filteredCountries);
      } catch (err) {
        setError('Failed to load countries');
        console.error('Error loading countries:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, [region]);
      
  return (
    <div className="w-full">
      <Select 
        key={`country-${value || 'empty'}`}
        defaultValue={value}
        onValueChange={(selectedName) => {
          const selectedCountry = countries.find(c => c.name === selectedName);
          onChange(selectedName, selectedCountry?.id);
        }}
        required={required}
        disabled={disabled || loading}
      >
        <SelectTrigger className={`w-full !bg-transparent ${className}`} style={{ backgroundColor: 'transparent !important' }}>
          <SelectValue placeholder={
            loading ? "Loading countries..." : 
            error ? "Error loading countries" : 
            placeholder
          } />
          {required && showRequiredIndicator && (
            <span className="text-red-500 ml-1">*</span>
          )}
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <div className="flex items-center justify-center p-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Loading countries...
            </div>
          ) : error ? (
            <div className="flex items-center p-2 text-sm text-red-500">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          ) : countries.length === 0 ? (
            <div className="p-2 text-sm text-gray-500">No countries available</div>
          ) : (
            countries.map((country) => (
              <SelectItem 
                key={country.id || country.code || country.name} 
                value={country.name}
              >
                {country.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {showRequiredIndicator && !value && (
        <p className="mt-1 text-sm text-red-500">Country is required</p>
      )}
    </div>
  );
};

export default CountryDropdown;
