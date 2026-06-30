import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Printer, Trash2, FileText, Loader2, StickyNote, File } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import Header from '@/components/uffi/Header';
import DropZone from '@/components/print/DropZone';
import PrintableLabel from '@/components/print/PrintableLabel';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

// Define the available formats with their dimensions and CSS equivalents
const LABEL_FORMATS = {
  'A4': {
    id: 'A4',
    label: 'A4',
    width: '210mm',
    height: '297mm',
    cssPageSize: 'A4',
    aspectRatio: 210/297,
    icon: FileText
  },
  '4x6': {
    id: '4x6',
    label: '4"x6"',
    width: '4in',
    height: '6in',
    cssPageSize: '4in 6in',
    aspectRatio: 4/6,
    icon: StickyNote // Larger label feel
  },
  '50x25': {
    id: '50x25',
    label: 'Small',
    width: '50mm',
    height: '25mm',
    cssPageSize: '50mm 25mm',
    aspectRatio: 50/25,
    icon: File // Small generic file feel
  }
};

const LabelPrinter = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // State
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [fileType, setFileType] = useState(null); // 'image/...' or 'application/pdf'
  const [imageLoaded, setImageLoaded] = useState(false);
  const [formatId, setFormatId] = useState('4x6'); 
  const [isPrinting, setIsPrinting] = useState(false);
  
  const currentFormat = LABEL_FORMATS[formatId];
  const isPDF = fileType === 'application/pdf';
  
  // Refs
  const pdfPreviewRef = useRef(null); // For direct iframe printing (PDFs)

  // Universal Print Handler
  const onPrintClick = async () => {
    if (!file || !fileUrl) {
      toast({ variant: "destructive", title: "No File", description: "Please upload a label." });
      return;
    }
    
    if (!imageLoaded) {
      toast({ title: "Please Wait", description: "Content is still loading..." });
      return;
    }

    // Visual feedback
    toast({ 
      title: t('printer.print_btn'), 
      description: "Preparing document..." 
    });

    if (isPDF) {
      // PDF Strategy: Use the iframe's native print
      if (pdfPreviewRef.current) {
        try {
          const iframeWindow = pdfPreviewRef.current.contentWindow;
          if (iframeWindow) {
            iframeWindow.focus();
            iframeWindow.print();
          } else {
            throw new Error("Cannot access PDF frame");
          }
        } catch (e) {
          console.error(e);
          toast({ 
            variant: "destructive", 
            title: "Print Error", 
            description: "Could not print PDF directly. Try downloading it." 
          });
        }
      }
    } else {
      // Image Strategy: Use DOM-based window.print()
      // We set a flag to ensure the print container is ready, although it is always in DOM now.
      setIsPrinting(true);

      // Force a slight delay to allow any React state updates or DOM repaints to settle
      // Double rAF pattern ensures the browser has painted the frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTimeout(() => {
            window.print();
            setIsPrinting(false); // Reset after dialog closes (or opens)
          }, 100);
        });
      });
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    
    setFile(selectedFile);
    
    // Improved File Type Detection
    let type = selectedFile.type || 'application/octet-stream';
    if (!type || type === '') {
       // Fallback based on extension if browser doesn't report MIME
       const ext = selectedFile.name.split('.').pop().toLowerCase();
       if (ext === 'pdf') type = 'application/pdf';
       else if (['jpg', 'jpeg'].includes(ext)) type = 'image/jpeg';
       else if (ext === 'png') type = 'image/png';
       else if (ext === 'webp') type = 'image/webp';
       else if (ext === 'gif') type = 'image/gif';
    }
    setFileType(type);
    setImageLoaded(false); // Reset loaded state
    
    const url = URL.createObjectURL(selectedFile);
    setFileUrl(url);

    toast({
      title: "File Uploaded",
      description: `Processing ${selectedFile.name}...`
    });
  };

  const clearFile = () => {
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFile(null);
    setFileUrl(null);
    setFileType(null);
    setImageLoaded(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, []);

  // CSS for dynamic page size injection
  // This ensures that when the print dialog opens, the browser defaults to the correct paper size
  useEffect(() => {
    const styleId = 'dynamic-page-size-style';
    let styleTag = document.getElementById(styleId);
    
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }
    
    // Only apply specific page size CSS if we are printing an Image
    // PDFs handle their own page size internally usually
    if (!isPDF) {
      styleTag.innerHTML = `
        @page {
          size: ${currentFormat.cssPageSize};
          margin: 0;
        }
      `;
    } else {
      styleTag.innerHTML = '';
    }
  }, [currentFormat, isPDF]);


  // Calculate dynamic preview dimensions to fit in the UI while maintaining aspect ratio
  const getPreviewStyles = () => {
    const MAX_DIM = 500;
    const ratio = currentFormat.aspectRatio;
    
    let w, h;
    if (ratio > 1) { // Landscape-ish (or wide)
       w = Math.min(MAX_DIM, 600); 
       h = w / ratio;
    } else { // Portrait
       h = Math.min(MAX_DIM, 600);
       w = h * ratio;
    }

    return {
      width: `${w}px`,
      height: `${h}px`,
    };
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans selection:bg-amber-500/30">
      <Helmet>
        <title>{t('printer.title')} - UffiSolutions</title>
      </Helmet>

      {/* Main UI - Hidden during print */}
      <div className="no-print contents">
        <Header />

        <motion.main 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex-grow pt-32 px-4 max-w-7xl mx-auto w-full pb-20"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 border-b border-gray-800 pb-8">
            <div>
              <Link to="/">
                <Button variant="ghost" className="mb-4 text-gray-400 hover:text-white hover:bg-gray-800 pl-0 transition-all group">
                  <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t('printer.back')}
                </Button>
              </Link>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight flex items-center gap-4">
                <span className="bg-amber-500/10 p-3 rounded-2xl border border-amber-500/20">
                   <Printer className="w-8 h-8 text-amber-500" />
                </span>
                {t('printer.title')}
              </h1>
              <p className="text-gray-400 mt-4 text-lg max-w-2xl leading-relaxed">
                {t('printer.subtitle')}
              </p>
            </div>
            
            {/* Format Selection - Top Right on Desktop */}
            {file && (
               <div className="flex flex-row gap-2 bg-gray-900/50 p-2 rounded-xl border border-gray-800 self-start md:self-end">
                  {Object.values(LABEL_FORMATS).map((fmt) => {
                    const Icon = fmt.icon;
                    return (
                      <button
                        key={fmt.id}
                        onClick={() => setFormatId(fmt.id)}
                        title={fmt.label}
                        className={cn(
                          "w-12 h-12 flex items-center justify-center rounded-lg transition-all border",
                          formatId === fmt.id 
                            ? "bg-amber-500 text-black border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105 z-10" 
                            : "bg-black text-gray-400 border-gray-800 hover:bg-gray-800 hover:text-gray-200"
                        )}
                      >
                        <Icon className="w-6 h-6" />
                      </button>
                    )
                  })}
               </div>
            )}
          </div>

          <div className="grid lg:grid-cols-1 gap-8">
            {/* Main Content / Drop Zone Area */}
            <div className="w-full max-w-4xl mx-auto">
              {!file ? (
                <DropZone onFileSelect={handleFileSelect} />
              ) : (
                <div className="bg-[#0f0f10] rounded-3xl p-8 md:p-12 flex flex-col items-center justify-center min-h-[600px] border border-gray-800 relative group overflow-hidden">
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none" 
                       style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }} 
                  />

                  <div className="absolute top-6 left-6 flex items-center gap-3 z-10 pointer-events-none">
                     <span className="bg-black/80 text-white text-xs font-medium px-4 py-2 rounded-full border border-gray-700 backdrop-blur-md shadow-xl flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                        {currentFormat.label} Preview
                     </span>
                  </div>
                  
                  {/* Visual Preview Container */}
                  <div className="relative z-10 flex flex-col items-center w-full">
                    <div 
                      className="bg-white shadow-2xl transition-all duration-300 relative overflow-hidden mx-auto"
                      style={getPreviewStyles()}
                    >
                       <PrintableLabel 
                          fileUrl={fileUrl} 
                          fileType={fileType} 
                          onLoad={() => setImageLoaded(true)}
                          iframeRef={isPDF ? pdfPreviewRef : null} // Pass ref for PDF printing
                       />
                    </div>
                    
                    {/* Status Indicator */}
                    <p className="mt-6 text-gray-500 text-sm font-mono flex items-center gap-2 mb-8">
                       {imageLoaded ? (
                         <span className="text-green-500 flex items-center gap-2">
                           <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Ready to print
                         </span>
                       ) : (
                         <span className="text-amber-500 flex items-center gap-2">
                           <Loader2 className="w-3 h-3 animate-spin" /> Loading content...
                         </span>
                       )}
                    </p>

                    {/* Action Buttons - Centered Below Preview */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md mx-auto">
                        <Button 
                          variant="outline" 
                          onClick={clearFile}
                          className="w-full sm:w-auto border-red-500/20 text-red-500 hover:bg-red-950/20 hover:text-red-400 hover:border-red-500/50 h-14 px-8 text-base font-semibold rounded-xl"
                        >
                          <Trash2 className="w-5 h-5 mr-2" /> 
                          Clear
                        </Button>
                        <Button 
                          onClick={onPrintClick}
                          disabled={!imageLoaded}
                          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-black h-14 px-10 text-lg font-bold shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)] border-none rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
                        >
                          {!imageLoaded ? (
                            <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                          ) : (
                            <Printer className="w-6 h-6 mr-2" /> 
                          )}
                          {t('printer.print_btn')}
                        </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.main>
      </div>

      {/* 
        --- DEDICATED PRINT CONTAINER (IMAGES ONLY) --- 
        This is ALWAYS in the DOM but usually hidden by CSS (display: none).
        When @media print is active, ONLY this container becomes visible.
        This bypasses Chrome's hidden iframe restrictions by using standard DOM.
      */}
      {!isPDF && fileUrl && (
        <div 
          id="print-container" 
          className="hidden" // Hidden in screen mode
          style={{
             display: 'none', // Overridden by @media print to 'flex'
          }}
        >
           <div 
              style={{ 
                width: currentFormat.width, 
                height: currentFormat.height, 
                overflow: 'hidden',
                backgroundColor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: 'auto'
              }}
           >
             {/* We render a duplicate PrintableLabel specifically for printing */}
             <PrintableLabel 
                fileUrl={fileUrl} 
                fileType={fileType} 
                isPrintMode={true}
             />
           </div>
        </div>
      )}
    </div>
  );
};

export default LabelPrinter;