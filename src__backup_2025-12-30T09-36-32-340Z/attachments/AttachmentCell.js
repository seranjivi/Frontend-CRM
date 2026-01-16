import React from 'react';
import { Paperclip } from 'lucide-react';

const AttachmentCell = ({ attachments, onClick }) => {
  const count = attachments?.length || 0;

  if (count === 0) {
    return (
      <div className="flex items-center space-x-1 text-slate-400">
        <Paperclip className="h-3.5 w-3.5 opacity-50" />
        <span className="text-xs">No Files</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-1.5 text-[#2C6AA6] hover:text-[#2C6AA6]/80 transition-colors"
    >
      <Paperclip className="h-3.5 w-3.5" />
      <span className="text-xs font-medium">{count}</span>
    </button>
  );
};

export default AttachmentCell;