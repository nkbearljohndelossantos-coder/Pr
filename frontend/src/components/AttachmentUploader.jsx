import React, { useState } from 'react';
import { UploadCloud, File, X, CheckCircle2, AlertCircle, ZoomIn, Image as ImageIcon } from 'lucide-react';
import FilePreviewModal from './FilePreviewModal';

export default function AttachmentUploader({ files = [], onFilesChange }) {
  const [dragOver, setDragOver] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

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

  const isImage = (file) => {
    return file.type?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file.name);
  };

  const minRequired = 3;
  const isSatisfied = files.length >= minRequired;

  return (
    <div className="space-y-4">
      {/* Header & Status Indicator */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <span>Attachments & Supporting Documents</span>
          <span className="text-rose-500 font-bold">* (Minimum 3 Required)</span>
        </label>

        {isSatisfied ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Requirement Met ({files.length} attached)</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-full">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>{files.length}/{minRequired} attached ({minRequired - files.length} more required)</span>
          </span>
        )}
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          dragOver ? 'border-blue-600 bg-blue-50/60' : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
        }`}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg,.webp"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload-input"
        />
        <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center gap-2">
          <div className="w-12 h-12 bg-blue-100/80 rounded-full flex items-center justify-center text-blue-600">
            <UploadCloud className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold text-slate-800">
            Click to upload or drag & drop files here
          </span>
          <span className="text-[11px] text-slate-500 max-w-sm">
            Supported Formats: Quotations, Specs, Invoices, PDF, Excel, Word, PNG, JPG (Max 10 MB per file).
          </span>
          <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 mt-1">
            ⚠️ Rule: Must attach at least 3 supporting files.
          </span>
        </label>
      </div>

      {/* Visual File Card & Image Thumbnail Gallery */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
          {files.map((file, idx) => {
            const hasImage = isImage(file);
            const previewUrl = hasImage ? URL.createObjectURL(file) : null;

            return (
              <div
                key={idx}
                className="relative group border border-slate-200 rounded-lg overflow-hidden bg-white shadow-2xs hover:shadow-md transition-all flex flex-col"
              >
                {/* Visual Thumbnail or Icon */}
                <div
                  onClick={() => setPreviewFile(file)}
                  className="h-28 bg-slate-100 flex items-center justify-center relative cursor-pointer overflow-hidden"
                >
                  {hasImage ? (
                    <img
                      src={previewUrl}
                      alt={file.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 p-2 text-slate-500">
                      <File className="w-8 h-8 text-indigo-500" />
                      <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                        {file.name.split('.').pop()}
                      </span>
                    </div>
                  )}

                  {/* Hover Overlay Zoom Icon */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white gap-1 font-bold text-xs">
                    <ZoomIn className="w-5 h-5" />
                    <span>Enlarge</span>
                  </div>
                </div>

                {/* File Metadata & Delete */}
                <div className="p-2 flex items-center justify-between gap-1 bg-white border-t border-slate-100">
                  <div className="truncate min-w-0 pr-1">
                    <p className="text-[11px] font-semibold text-slate-800 truncate" title={file.name}>
                      {file.name}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(idx);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors shrink-0"
                    title="Remove attachment"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Enlarged Image Lightbox Modal */}
      <FilePreviewModal
        isOpen={!!previewFile}
        file={previewFile}
        onClose={() => setPreviewFile(null)}
      />
    </div>
  );
}
