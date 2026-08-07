import React from 'react';
import { UploadCloud, File, X } from 'lucide-react';

export default function AttachmentUploader({ files, setFiles }) {
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Supporting Attachments (PDF, Excel, Word, Images)</h4>

      <label className="border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/20 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all duration-200">
        <UploadCloud className="w-8 h-8 text-blue-600 mb-2" />
        <span className="text-xs font-semibold text-slate-700">Click to upload or drag & drop files</span>
        <span className="text-[10px] text-slate-400 mt-1">Maximum file size: 10MB per document</span>
        <input type="file" multiple onChange={handleFileChange} className="hidden" />
      </label>

      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
          {files.map((file, idx) => (
            <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-lg flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                <File className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-xs font-medium text-slate-700 truncate">{file.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
