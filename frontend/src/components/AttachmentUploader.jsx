import React, { useState } from 'react';
import { UploadCloud, File, X, CheckCircle2 } from 'lucide-react';

export default function AttachmentUploader({ files = [], onFilesChange }) {
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (e) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      onFilesChange([...files, ...selected]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      const dropped = Array.from(e.dataTransfer.files);
      onFilesChange([...files, ...dropped]);
    }
  };

  const removeFile = (index) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
  };

  return (
    <div className="space-y-3">
      <label className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
        Attachments & Supporting Documents
      </label>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-blue-600 bg-blue-50/50' : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
        }`}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload-input"
        />
        <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
          <UploadCloud className="w-8 h-8 text-blue-600" />
          <span className="text-xs font-semibold text-slate-700">
            Click to upload or drag & drop files here
          </span>
          <span className="text-[11px] text-slate-400">
            Supported Formats: PDF, Excel, Word, PNG, JPG (Max 10 MB per file)
          </span>
        </label>
      </div>

      {/* File List Badges */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {files.map((file, idx) => (
            <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <File className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-xs font-medium text-slate-800 truncate">{file.name}</span>
                <span className="text-[10px] text-slate-400 shrink-0">
                  ({(file.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="text-slate-400 hover:text-rose-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
