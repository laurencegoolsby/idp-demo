import { useState, useEffect } from 'react';
import './FilePreview.css';

interface FilePreviewProps {
  file: File | null;
  className?: string;
}

export default function FilePreview({ file, className = '' }: FilePreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    setIsLoading(true);
    
    if (file.type.startsWith('image/')) {
      // For images, create object URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setIsLoading(false);
      
      return () => URL.revokeObjectURL(url);
    } else if (file.type === 'application/pdf') {
      // For PDFs, show PDF icon
      setPreviewUrl('pdf');
      setIsLoading(false);
    } else {
      // For other files, show generic document icon
      setPreviewUrl('document');
      setIsLoading(false);
    }
  }, [file]);

  if (!file) {
    return (
      <div className={`file-preview empty ${className}`}>
        <div className="preview-placeholder">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
          </svg>
          <p>No file selected</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`file-preview loading ${className}`}>
        <div className="preview-placeholder">
          <div className="spinner"></div>
          <p>Loading preview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`file-preview ${className}`}>
      <div className="preview-header">
        <h4>{file.name}</h4>
        <span className="file-size">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
      </div>
      
      <div className="preview-content">
        {file.type.startsWith('image/') && previewUrl && previewUrl !== 'pdf' && previewUrl !== 'document' ? (
          <img 
            src={previewUrl} 
            alt={file.name}
            className="image-preview"
          />
        ) : file.type === 'application/pdf' ? (
          <div className="file-icon pdf">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" fill="#dc3545"/>
              <polyline points="14,2 14,8 20,8" fill="#fff"/>
              <text x="12" y="16" textAnchor="middle" fill="white" fontSize="6" fontWeight="bold">PDF</text>
            </svg>
            <p>PDF Document</p>
          </div>
        ) : (
          <div className="file-icon document">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6c757d">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
            <p>Document</p>
          </div>
        )}
      </div>
    </div>
  );
}