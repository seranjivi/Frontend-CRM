import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Upload, Download, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { saveAs } from 'file-saver';
import { Progress } from './ui/progress';
import api from '../utils/api';

const LeadImportModal = ({ isOpen, onClose, onImportSuccess }) => {
    const [file, setFile] = useState(null);
    const [previewData, setPreviewData] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [importStats, setImportStats] = useState({ total: 0, success: 0, failed: 0, errors: [] });
    const [step, setStep] = useState('upload'); // 'upload', 'preview', 'processing', 'result'
    const fileInputRef = useRef(null);

    // CSV Headers matching Lead entity
    const csvHeaders = [
        'Lead Name',
        'Client Name',
        'Contact Person',
        'Email',
        'Phone',
        'Deal Type',
        'Status',
        'Estimated Value',
        'Currency',
        'Region',
        'Country',
        'Description'
    ];

    const handleDownloadTemplate = () => {
        const csvContent = [
            csvHeaders.join(','),
            'Sample Deal 1,Infosys,John Doe,john@infosys.com,+1-555-0123,RFP,New Lead,50000,USD,North America,United States,Sample description',
            'Sample Deal 2,Wipro,Jane Smith,jane@wipro.com,+91-9876543210,PoC,Qualified,100000,INR,APAC,India,Another sample'
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, 'lead_import_template.csv');
    };

    const parseCSV = (text) => {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            if (!lines[i].trim()) continue;

            const obj = {};
            // Handle quoted strings correctly if simple split fails, but sticking to simple split for now as per plan
            // A more robust regex split: .split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
            const currentline = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(val => val.trim().replace(/^"|"$/g, ''));

            // Map CSV headers to API fields
            headers.forEach((header, index) => {
                const value = currentline[index];
                switch (header) {
                    case 'Lead Name': obj.lead_name = value; break;
                    case 'Client Name': obj.client_name = value; break;
                    case 'Contact Person': obj.primary_contact = value; break;
                    case 'Email': obj.contact_email = value; break;
                    case 'Phone': obj.contact_phone = value; break;
                    case 'Deal Type': obj.deal_type = value; break;
                    case 'Status': obj.lead_status = value; break; // Map to lead_status (frontend) -> status (backend)
                    case 'Estimated Value': obj.estimated_deal_value = parseFloat(value) || 0; break;
                    case 'Currency': obj.currency = value; break;
                    case 'Region': obj.region = value; break;
                    case 'Country': obj.country = value; break;
                    case 'Description': obj.description = value; break;
                    default: break;
                }
            });
            result.push(obj);
        }
        return result;
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
                toast.error('Please upload a valid CSV file');
                return;
            }
            setFile(selectedFile);
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsed = parseCSV(event.target.result);
                    setPreviewData(parsed.slice(0, 5)); // Preview first 5
                    setStep('preview');
                } catch (error) {
                    toast.error('Failed to parse CSV file');
                    console.error(error);
                }
            };
            reader.readAsText(selectedFile);
        }
    };

    const processImport = async () => {
        setUploading(true);
        setStep('processing');
        setProgress(0);

        // Re-read file to get full data
        const reader = new FileReader();
        reader.onload = async (event) => {
            const allData = parseCSV(event.target.result);
            const total = allData.length;
            let success = 0;
            let failed = 0;
            const errors = [];

            setImportStats({ total, success: 0, failed: 0, errors: [] });

            for (let i = 0; i < total; i++) {
                const row = allData[i];

                // Construct API payload
                const payload = {
                    ...row,
                    // Ensure required defaults
                    priority: 'Medium',
                    lead_status: row.lead_status || 'New Lead',
                    status: row.lead_status || 'New', // Check mapping
                    activity_history: []
                };

                try {
                    // Using POST /leads based on REST convention
                    await api.post('/leads', payload);
                    success++;
                } catch (error) {
                    failed++;
                    errors.push(`Row ${i + 2}: ${error.response?.data?.message || error.message}`);
                }

                const currentProgress = Math.round(((i + 1) / total) * 100);
                setProgress(currentProgress);
                setImportStats(prev => ({ ...prev, success, failed, errors }));
            }

            setUploading(false);
            setStep('result');
            if (success > 0) {
                onImportSuccess(); // Refresh parent list
            }
        };
        reader.readAsText(file);
    };

    const resetModal = () => {
        setFile(null);
        setPreviewData([]);
        setStep('upload');
        setImportStats({ total: 0, success: 0, failed: 0, errors: [] });
        if (fileInputRef.current) fileInputRef.current.value = '';
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !uploading && resetModal()}>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Import Leads</DialogTitle>
                </DialogHeader>

                <div className="py-4">
                    {step === 'upload' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
                                <div>
                                    <h4 className="font-medium text-blue-800">Use the Template</h4>
                                    <p className="text-sm text-blue-600 mt-1">
                                        Download our CSV template to ensure your data is formatted correctly.
                                    </p>
                                </div>
                                <Button variant="outline" onClick={handleDownloadTemplate} className="border-blue-300 text-blue-700 hover:bg-blue-100">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                            </div>

                            <div
                                className="border-2 border-dashed border-slate-300 rounded-lg p-10 text-center hover:bg-slate-50 transition-colors cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Upload className="h-6 w-6 text-slate-500" />
                                </div>
                                <h3 className="text-lg font-medium text-slate-900">Click to upload CSV</h3>
                                <p className="text-sm text-slate-500 mt-1">or drag and drop file here</p>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>
                    )}

                    {step === 'preview' && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                    <FileText className="h-8 w-8 text-green-600" />
                                    <div>
                                        <p className="font-medium text-slate-900">{file?.name}</p>
                                        <p className="text-xs text-slate-500">{(file?.size / 1024).toFixed(1)} KB</p>
                                    </div>
                                </div>
                                <Button variant="ghost" size="sm" onClick={() => {
                                    setFile(null);
                                    setStep('upload');
                                }}>
                                    <X className="h-4 w-4" />
                                    Change File
                                </Button>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <div className="bg-slate-50 px-4 py-2 border-b text-xs font-semibold text-slate-500 uppercase">
                                    Preview (First 5 Rows)
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 text-slate-500">
                                            <tr>
                                                {csvHeaders.slice(0, 5).map(h => <th key={h} className="px-4 py-2 font-medium">{h}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {previewData.map((row, i) => (
                                                <tr key={i}>
                                                    <td className="px-4 py-2">{row.lead_name}</td>
                                                    <td className="px-4 py-2">{row.client_name}</td>
                                                    <td className="px-4 py-2">{row.primary_contact}</td>
                                                    <td className="px-4 py-2">{row.contact_email}</td>
                                                    <td className="px-4 py-2">{row.contact_phone}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 'processing' && (
                        <div className="py-10 text-center space-y-4">
                            <h3 className="text-lg font-medium">Importing Leads...</h3>
                            <Progress value={progress} className="w-full h-2" />
                            <p className="text-sm text-slate-500">Processed {importStats.success + importStats.failed} of {importStats.total}</p>
                        </div>
                    )}

                    {step === 'result' && (
                        <div className="text-center space-y-6">
                            <div className="flex justify-center gap-8">
                                <div className="bg-green-50 p-4 rounded-lg border border-green-100 w-32">
                                    <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-green-700">{importStats.success}</div>
                                    <div className="text-sm text-green-600">Successful</div>
                                </div>
                                {importStats.failed > 0 && (
                                    <div className="bg-red-50 p-4 rounded-lg border border-red-100 w-32">
                                        <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                                        <div className="text-2xl font-bold text-red-700">{importStats.failed}</div>
                                        <div className="text-sm text-red-600">Failed</div>
                                    </div>
                                )}
                            </div>

                            {importStats.errors.length > 0 && (
                                <div className="text-left bg-slate-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                                    <p className="font-medium text-red-600 text-sm mb-2">Error Log:</p>
                                    <ul className="text-xs text-slate-600 space-y-1">
                                        {importStats.errors.map((err, i) => <li key={i}>{err}</li>)}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    {step === 'upload' && (
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                    )}
                    {step === 'preview' && (
                        <>
                            <Button variant="outline" onClick={onClose}>Cancel</Button>
                            <Button onClick={processImport} className="bg-[#0A2A43]">
                                Start Import
                            </Button>
                        </>
                    )}
                    {step === 'result' && (
                        <Button onClick={resetModal} className="bg-[#0A2A43]">Done</Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default LeadImportModal; 