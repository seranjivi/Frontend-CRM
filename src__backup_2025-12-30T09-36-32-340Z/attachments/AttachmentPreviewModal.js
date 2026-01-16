import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Download, FileText, Image, File, ExternalLink } from 'lucide-react';

const AttachmentPreviewModal = ({ isOpen, onClose, attachments, entityName }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop().toLowerCase();
    if (['png', 'jpg', 'jpeg'].includes(ext)) return <Image className="h-5 w-5 text-blue-500" />;
    if (ext === 'pdf') return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-slate-500" />;
  };

  const handleDownload = (attachment) => {
    // For now, show toast. In production, implement actual download
    console.log('Download:', attachment);
    // TODO: Implement actual file download from backend
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Attachments - {entityName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {attachments && attachments.length > 0 ? (
            attachments.map((attachment, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(attachment.name)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">
                      {attachment.name}
                    </p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <p className="text-xs text-slate-500">
                        {formatFileSize(attachment.size)}
                      </p>
                      {attachment.uploadedAt && (
                        <>
                          <span className="text-xs text-slate-400">•</span>
                          <p className="text-xs text-slate-500">
                            {new Date(attachment.uploadedAt).toLocaleDateString()}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(attachment)}
                    className="h-8 w-8 p-0"
                    title="Download"
                  >
                    <Download className="h-4 w-4 text-slate-600" />
                  </Button>
                  {attachment.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(attachment.url, '_blank')}
                      className="h-8 w-8 p-0"
                      title="Open"
                    >
                      <ExternalLink className="h-4 w-4 text-slate-600" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-500">
              <File className="h-12 w-12 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No attachments</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentPreviewModal;