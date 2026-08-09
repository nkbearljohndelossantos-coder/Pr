import React, { useEffect } from 'react';
import { X, ExternalLink, Download, Image as ImageIcon, FileText } from 'lucide-react';

export default function FilePreviewModal({ isOpen, file, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  const fileName = file.original_name || file.name || 'Attachment Preview';
  const fileSize = file.file_size || file.size ? `${((file.file_size || file.size) / 1024).toFixed(1)} KB` : '';
  const fileType = file.file_type || file.type || '';

  const isImage =
    fileType.startsWith('image/') ||
    /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(fileName);

  const previewUrl =
    file.previewUrl ||
    (file.filename ? `/uploads/${file.filename}` : file instanceof File ? URL.createObjectURL(file) : '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0 pr-4">
            {isImage ? (
              <ImageIcon className="w-5 h-5 text-blue-400 shrink-0" />
            ) : (
              <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
            )}
            <div className="truncate">
              <h3 className="text-sm font-bold text-slate-100 truncate">{fileName}</h3>
              <p className="text-[11px] text-slate-400 font-mono">{fileSize} • {fileType || 'Document'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {previewUrl && (
              <a
                href={previewUrl}
                download={fileName}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 text-xs"
                title="Download / Open Original"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline font-semibold">Download</span>
              </a>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-auto bg-slate-950/90 p-4 flex items-center justify-center min-h-[350px]">
          {isImage ? (
            <div className="relative flex items-center justify-center w-full h-full">
              <img
                src={previewUrl}
                alt={fileName}
                className="max-h-[70vh] max-w-full object-contain rounded shadow-lg border border-slate-800"
              />
            </div>
          ) : fileType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf') ? (
            <iframe
              src={previewUrl}
              title={fileName}
              className="w-full h-[70vh] rounded border border-slate-800 bg-white"
            />
          ) : (
            <div className="text-center p-8 text-slate-300 space-y-4 max-w-md">
              <FileText className="w-16 h-16 text-indigo-400 mx-auto opacity-80" />
              <div>
                <h4 className="text-base font-bold text-white mb-1">{fileName}</h4>
                <p className="text-xs text-slate-400">
                  Direct inline preview is not supported for this document format ({fileType || 'file'}).
                </p>
              </div>
              <a
                href={previewUrl}
                download={fileName}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-md transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open / Download File</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
