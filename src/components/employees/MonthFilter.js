import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Calendar } from 'lucide-react';

const MonthFilter = ({ value, onChange }) => {
  const getMonthOptions = () => {
    const months = [];
    const currentDate = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthValue = date.toISOString().slice(0, 7);
      const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      months.push({ value: monthValue, label });
    }
    return months;
  };

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-slate-500" />
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-48 h-8 text-xs">
          <SelectValue placeholder="Select month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">All Months</SelectItem>
          {getMonthOptions().map(({ value, label }) => (
            <SelectItem key={value} value={value} className="text-xs">
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MonthFilter;