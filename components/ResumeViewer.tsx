import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface ResumeProps {
  resumeLink: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ResumeViewer = ({ resumeLink, isOpen, onClose }: ResumeProps) => {
  const [processedLink, setProcessedLink] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (resumeLink) {
      let finalLink = resumeLink;
      
      // First get the direct download URL from Google Drive link
      if (resumeLink.includes('drive.google.com/file/d/')) {
        const fileId = resumeLink.split('/file/d/')[1].split('/')[0];
        const directLink = `https://drive.google.com/uc?export=view&id=${fileId}`;
        // Use Google Docs Viewer with the direct link
        finalLink = `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(directLink)}`;
      } else if (resumeLink.includes('drive.google.com/open?id=')) {
        const fileId = resumeLink.split('id=')[1];
        const directLink = `https://drive.google.com/uc?export=view&id=${fileId}`;
        finalLink = `https://docs.google.com/viewer?embedded=true&url=${encodeURIComponent(directLink)}`;
      }
      
      setProcessedLink(finalLink);
    }
  }, [resumeLink]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="fixed inset-4 md:inset-8 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Resume Preview</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 relative bg-gray-50">
          
               {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="animate-pulse flex flex-col items-center">
                    <div className="h-2 w-96 bg-gray-200 rounded mb-2.5"></div>
                    <div className="h-2 w-80 bg-gray-200 rounded"></div>
                  </div>
                </div>
              )}
          
          
          {processedLink ? (
            <iframe
              src={processedLink}
              className="absolute inset-0 w-full h-full rounded-b-2xl"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              onLoad={() => setIsLoading(false)}
              allowFullScreen
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              No resume link provided
            </div>
          )}
        </div>
      </div>
    </div>
  );
};