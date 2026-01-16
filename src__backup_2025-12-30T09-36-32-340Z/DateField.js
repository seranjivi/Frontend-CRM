import React from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Calendar } from 'lucide-react';
import { formatDate, getTodayFormatted } from '../utils/dateUtils';

/**
 * Editable Date field component for forms
 * Allows users to select a date using a date picker
 * Shows created date for existing records or today's date for new records as default
 */
const DateField = ({ createdAt, isNew = false, value, onChange, name = "date", label = "Date", required = false, disabled = false, readOnly = false }) => {
  // If readOnly or disabled prop is explicitly passed as true, show read-only field
  if (readOnly || disabled) {
    const displayDate = isNew ? getTodayFormatted() : formatDate(createdAt);
    return (
      <div>
        <Label htmlFor="createdDate">{label}</Label>
        <div className="relative">
          <Input
            id="createdDate"
            value={displayDate}
            readOnly
            disabled
            className="bg-slate-50 cursor-not-allowed text-slate-600 pr-10"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        </div>
        <p className="text-xs text-slate-500 mt-1">
          {isNew ? 'Will be set to today\'s date when saved' : 'Record created on this date'}
        </p>
      </div>
    );
  }

  // Editable date field
  // Convert date to YYYY-MM-DD format for input[type="date"]
  const getInputValue = () => {
    if (value) {
      // If value is already in YYYY-MM-DD format
      if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return value;
      }
      // If value is ISO string, extract date part
      if (typeof value === 'string' && value.includes('T')) {
        return value.split('T')[0];
      }
      return value;
    }
    
    // Default to today's date in YYYY-MM-DD format
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <div>
      <Label htmlFor={name}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type="date"
        value={getInputValue()}
        onChange={handleDateChange}
        required={required}
        className="cursor-pointer"
        data-testid={`${name}-input`}
      />
      <p className="text-xs text-slate-500 mt-1">
        Select a date using the date picker
      </p>
    </div>
  );
};

export default DateField;
