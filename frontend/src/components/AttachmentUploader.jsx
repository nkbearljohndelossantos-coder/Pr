import React, { useState } from 'react';
import { UploadCloud, File, X, CheckCircle2, Info, ZoomIn } from 'lucide-react';

const getFileName = (file) => {
  if (!file) return 'Attachment';
  return file.name || file.original_name || file.filename || 'Attachment';
};

const getFileExt = (file) => {
  const name = getFileName(file);
  return name.includes('.') ? name.split('.').pop().toUpperCase() : 'FILE';
};

const isImage = (file) => {
  if (!file) return false;
  const name = getFileName(file);
  const type = file.type || file.file_type || '';
  return type.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(name);
};

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

  return (
    <div className="space-y-4">
      {/* Header & Informative Note */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <span>Attachments & Supporting Documents</span>
          <span className="text-slate-400 font-normal">({files.length} attached)</span>
        </label>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50/80 border border-blue-200 text-blue-800 text-[11px] font-medium rounded-lg">
          <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          <span>Note: Uploading supporting documents or pictures (quotations, specs, photos) is recommended for faster approval.</span>
        </div>
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
        </label>
      </div>

      {/* Visual File Card & Image Thumbnail Gallery */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
          {files.map((file, idx) => {
            const hasImage = isImage(file);
            const fileName = getFileName(file);
            const fileExt = getFileExt(file);
            const previewUrl = hasImage
              ? (file instanceof File ? URL.createObjectURL(file) : `/uploads/${file.filename}`)
              : null;
            const fileSizeKB = file.size || file.file_size ? `${(((file.size || file.file_size) / 1024)).toFixed(1)} KB` : '';

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
                  {hasImage && previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 p-2 text-slate-500">
                      <File className="w-8 h-8 text-indigo-500" />
                      <span className="text-[10px] font-bold uppercase text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                        {fileExt}
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
                    <p className="text-[11px] font-semibold text-slate-800 truncate" title={fileName}>
                      {fileName}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {fileSizeKB}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors shrink-0"
                    title="Remove File"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
