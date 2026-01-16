/**
 * Date utility functions for consistent date formatting across the CRM
 */

/**
 * Format date to DD-MM-YYYY format
 * @param {string|Date} date - Date string or Date object
 * @returns {string} Formatted date string (DD-MM-YYYY)
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) return 'N/A';
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}-${month}-${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'N/A';
  }
};

/**
 * Get today's date in DD-MM-YYYY format
 * @returns {string} Today's date formatted as DD-MM-YYYY
 */
export const getTodayFormatted = () => {
  return formatDate(new Date());
};

/**
 * Convert DD-MM-YYYY to ISO string for backend
 * @param {string} dateStr - Date string in DD-MM-YYYY format
 * @returns {string} ISO date string
 */
export const toISOString = (dateStr) => {
  if (!dateStr || dateStr === 'N/A') return null;
  
  try {
    const [day, month, year] = dateStr.split('-');
    const date = new Date(year, month - 1, day);
    return date.toISOString();
  } catch (error) {
    console.error('Error converting to ISO:', error);
    return null;
  }
};
