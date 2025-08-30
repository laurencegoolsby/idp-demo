import { useState } from 'react';
import './FileUpload.css';

interface FileUploadProps {
  onUploadComplete?: (result: { key: string; url: string }) => void;
  onFileSelect?: (file: File) => void;
  disabled?: boolean;
}

export default function FileUpload({ onUploadComplete, onFileSelect, disabled }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);


  const uploadFile = async (file: File) => {
    onFileSelect?.(file);
    setUploading(true);
    
    try {
      // Simulate upload process
      await new Promise(resolve => setTimeout(resolve, 1000));
      onUploadComplete?.({ key: file.name, url: '' });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFile(file);
      event.target.value = ''; // Reset input to allow same file again
    }
  };



  return (
    <div className={`upload-container ${uploading ? 'uploading' : ''} ${disabled ? 'disabled' : ''}`}>
      <div className="upload-zone">
        <input
          type="file"
          onChange={handleFileUpload}
          disabled={uploading || disabled}
          className="file-input"
          id="file-upload"
          accept="image/*,.pdf"
          capture="environment"
        />
        <label htmlFor="file-upload" className="upload-label">
          <div className="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="upload-text">
            <h3>Click to upload</h3>
            <p>PDF and image files (max 10MB)</p>
            <p className="mobile-only">Choose camera, photo library, or browse files</p>
          </div>
        </label>
        {(uploading || disabled) && (
          <div className="upload-progress">
            <div className="spinner"></div>
            <span>Processing...</span>
          </div>
        )}
      </div>
    </div>
  );
}