import React from 'react';

const PrintableLabel = ({ fileUrl, fileType, onLoad, isPrintMode = false, iframeRef }) => {
  const isPDF = fileType === 'application/pdf';

  return (
    <div 
      className="printable-content w-full h-full flex items-center justify-center bg-white"
      style={{ overflow: 'hidden' }}
    >
      {fileUrl ? (
        isPDF ? (
          <iframe 
            ref={iframeRef}
            src={fileUrl} 
            title="Label PDF"
            onLoad={onLoad}
            className="w-full h-full border-none m-0 p-0 block"
            style={{ 
               // For PDFs, we want them interactive (scrollable) in preview,
               // but just "block" in print mode.
               display: 'block'
            }}
          />
        ) : (
          <img 
            src={fileUrl} 
            alt="Label Content" 
            onLoad={onLoad}
            className="block"
            style={{ 
              // In Print Mode: We want the image to fill the container as much as possible
              // without getting cut off (contain) or distorted.
              // Since the container is set to exact paper dimensions, 'contain' ensures
              // it fits on the paper. 
              width: '100%',
              height: '100%',
              objectFit: 'contain', 
              margin: '0 auto',
            }}
          />
        )
      ) : (
        <div className="flex items-center justify-center h-full w-full text-gray-300 font-mono text-sm bg-gray-50">
           No Content
        </div>
      )}
    </div>
  );
};

export default PrintableLabel;