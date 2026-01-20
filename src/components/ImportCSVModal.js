import React, { useCallback, useState, useRef } from 'react';
import { X, Upload, FileText } from 'lucide-react';
import { Button } from './ui/button';

export default function ImportCSVModal({ isOpen, onClose, onFileSelect, title = 'Import Data' }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        onFileSelect(selectedFile);
      } else {
        alert('Please upload a valid CSV file');
      }
    }
  }, [onFileSelect]);

  const handleFileInput = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'text/csv' || selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        onFileSelect(selectedFile);
      } else {
        alert('Please upload a valid CSV file');
      }
    }
  };

  const handleImport = () => {
    // Handle import logic here
    if (file) {
      console.log('Importing file:', file.name);
      // Process the file
    }
  };

  const downloadTemplate = () => {
    // Create a sample CSV content
    const csvContent = [
      'Client Name,Email,Phone,Status,Region',
      'Example Client,example@client.com,1234567890,Active,North',
      'Another Client,another@client.com,0987654321,Inactive,South'
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'client_import_template.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          
          <div 
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload size={24} className="text-gray-400" />
              <p className="font-medium">Drag and drop your file here</p>
              <p className="text-sm text-gray-500">
                Supports .csv files only (Max 10MB)
              </p>
              <p className="text-sm text-gray-500 mt-2">
                or
              </p>
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                Browse Files
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileInput}
              />
            </div>
          </div>

          {file && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md flex items-center">
              <FileText className="text-blue-500 mr-2" size={20} />
              <span className="text-sm flex-1 truncate">{file.name}</span>
              <button 
                onClick={() => setFile(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <button 
              onClick={downloadTemplate}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Download sample CSV template
            </button>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport}
              disabled={!file}
              className={`${!file ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Import
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
