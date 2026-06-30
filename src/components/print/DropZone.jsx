import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileType, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const DropZone = ({ onFileSelect }) => {
  const { t } = useLanguage();

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/gif': [],
      'image/bmp': [],
      'image/webp': [],
      'image/tiff': [],
      'image/svg+xml': [],
      'application/pdf': []
    },
    maxFiles: 1
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "group relative border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[600px] bg-[#0f0f10]",
        isDragActive 
          ? "border-amber-500 bg-amber-500/5" 
          : "border-gray-800 hover:border-gray-600 hover:bg-[#151516]"
      )}
    >
      <input {...getInputProps()} />
      
      {/* Decorative background glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2rem] pointer-events-none" />

      <div className="relative z-10 mb-8 w-24 h-24 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 group-hover:border-amber-500/30">
         {isDragActive ? (
           <UploadCloud className="w-10 h-10 text-amber-500 animate-bounce" />
         ) : (
           <div className="relative">
             <FileType className="w-10 h-10 text-gray-500 group-hover:text-gray-300 transition-colors" />
             <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black rounded-full p-0.5">
               <Plus className="w-3 h-3" />
             </div>
           </div>
         )}
      </div>
      
      <h3 className="text-3xl font-black text-white mb-4 tracking-tight">
        {isDragActive ? t('printer.drop_active') : t('printer.upload_title')}
      </h3>
      
      <p className="text-gray-400 mb-8 max-w-sm mx-auto text-lg leading-relaxed">
        {t('printer.upload_desc')}
      </p>

      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {['PDF', 'JPG', 'PNG'].map(type => (
          <span key={type} className="px-3 py-1 bg-gray-900 rounded-md text-xs font-mono text-gray-500 border border-gray-800">
            {type}
          </span>
        ))}
      </div>
      
      <button className="px-8 py-4 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold transition-all shadow-lg shadow-amber-500/20 hover:scale-105 active:scale-95 flex items-center gap-2">
        <UploadCloud className="w-5 h-5" />
        {t('printer.upload_btn')}
      </button>
    </div>
  );
};

export default DropZone;