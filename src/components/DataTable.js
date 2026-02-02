import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, ChevronLeft, ChevronRight, Download, Filter, Edit2, Trash2, FilterX, Eye, Plus, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import ColumnFilter from './ColumnFilter';
//

const DataTable = ({
  data = [],
  columns = [],
  onEdit,
  onDelete,
  onView,
  onExport,
  onImport,
  testId,
  filterOptions = {},
  ColumnFilterComponent,
  activeFilters = [],
  onFilterChange,
  renderToolbarActions,
  customActions,
  showEdit = true,
  viewButtonClass = 'h-8 w-8 p-0 text-gray-600 hover:text-gray-800',
  editButtonClass = 'h-8 w-8 p-0 text-blue-600 hover:text-blue-800',
  deleteButtonClass = 'h-8 w-8 p-0 text-red-600 hover:text-red-800',
  title = 'Data Table'
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const itemsPerPage = 10;

  // 1. Sort data FIRST
  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // 2. Apply search filter on sorted data
  let filteredData = sortedData.filter((item) => {
    const searchStr = searchTerm.toLowerCase();
    if (!searchStr) return true;

    return columns.some((col) => {
      const value = item[col.key];
      return value?.toString().toLowerCase().includes(searchStr);
    });
  });

  // 3. Apply pagination on filtered and sorted data
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key) => {
    if (key === 'actions') return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="ml-2 h-4 w-4 text-gray-400" />;
    return sortConfig.direction === 'asc'
      ? <ArrowUp className="ml-2 h-4 w-4 text-gray-900" />
      : <ArrowDown className="ml-2 h-4 w-4 text-gray-900" />;
  };

  const handleExport = () => {
    if (onExport) {
      onExport(filteredData); // Export all filtered data, not just paginated
    } else {
      // Default CSV export
      const csvContent = [
        columns.map((col) => col.header).join(','),
        ...filteredData.map((row) => columns.map((col) => {
          const val = row[col.key] || '';
          return typeof val === 'string' && val.includes(',') ? `"${val}"` : val;
        }).join(',')),
      ].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export_${Date.now()}.csv`;
      a.click();
    }
  };

  return (
    <div className="space-y-4">

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={`bg-blue-50 ${column.key !== 'actions' ? 'cursor-pointer hover:bg-blue-100 transition-colors' : ''}`}
                >
                  <div className="flex items-center justify-between font-medium text-sm text-gray-900">
                    <div
                      className="flex items-center flex-1"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.header}
                      {column.key !== 'actions' && getSortIcon(column.key)}
                    </div>
                    {column.filterable && (
                      <ColumnFilter
                        column={column}
                        data={data}
                        onFilterChange={onFilterChange}
                        activeFilters={activeFilters}
                      />
                    )}
                  </div>
                </TableHead>
              ))}
              {(onEdit || onDelete || onView || customActions) && (
                <TableHead className="bg-blue-50 text-left">
                  <span className="font-medium text-sm text-gray-900">Actions</span>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={`${rowIndex}-${column.key}`}>
                      {column.render
                        ? column.render(item[column.key], item)
                        : item[column.key]}
                    </TableCell>
                  ))}
                  <TableCell className="text-left">
                    <div className="flex gap-1">
                      {customActions ? (
                        customActions(item)
                      ) : (
                        <>
                          {onView && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onView(item);
                              }}
                              className={viewButtonClass}
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          {showEdit && onEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onEdit(item);
                              }}
                              className={editButtonClass}
                              title="Edit"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                            </Button>
                          )}
                          {onDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item);
                              }}
                              className={deleteButtonClass}
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {filteredData.length > itemsPerPage && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(startIndex + itemsPerPage, filteredData.length)}
            </span>{' '}
            of <span className="font-medium">{filteredData.length}</span> entries
          </div>
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            {/* Page numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5 || currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              if (pageNum > totalPages) return null;

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 w-8 p-0 ${currentPage === pageNum ? 'bg-blue-600 text-white' : ''}`}
                >
                  {pageNum}
                </Button>
              );
            })}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <span className="px-2">...</span>
            )}

            {totalPages > 5 && currentPage < totalPages - 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(totalPages)}
                className="h-8 w-8 p-0"
              >
                {totalPages}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 px-2 text-sm"
            >
              Last
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;