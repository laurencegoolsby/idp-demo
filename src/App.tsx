import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import Header from './layouts/Header';
import Footer from './layouts/Footer';
import Alert from './components/Alert';

import FilesList from './components/FilesList';
import ResultsDisplay from './components/ResultsDisplay';
import FilePreview from './components/FilePreview';
import CollapsibleJsonDisplay from './components/CollapsibleJsonDisplay';
import { useAlert } from './hooks/useAlert';
import { useFileUpload } from './hooks/useFileUpload';
import { uploadFile } from './services/uploadService';
import { formatFileSize, validateFileSize, validateFileType } from './utils/fileUtils';
import './styles/globals.css';
import './styles/layout.css';
import './styles/typography.css';

import './styles/file-info.css';
import './styles/upload-controls.css';
import './styles/modal.css';

function App() {
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [fileObjects, setFileObjects] = useState<Map<string, File>>(new Map());
  
  const alert = useAlert();
  const fileUpload = useFileUpload();

  // Cleanup fileObjects when files are removed
  useEffect(() => {
    const uploadedFileIds = new Set(fileUpload.uploadedFiles.map(f => f.id));
    setFileObjects(prev => {
      const cleaned = new Map();
      for (const [id, file] of prev) {
        if (uploadedFileIds.has(id)) {
          cleaned.set(id, file);
        }
      }
      return cleaned;
    });
  }, [fileUpload.uploadedFiles]);

  const handleSignOut = () => {
    console.log('Sign out clicked');
  };
  
  const handleFileSelect = (file: any) => {
    fileUpload.setSelectedFile(file);
    // Update preview to show the selected file
    const originalFile = fileObjects.get(file.id);
    if (originalFile) {
      setPreviewFile(originalFile);
    }
  };
  const fetchS3Data = async (presignedUrl: string) => {
    // Validate URL to prevent SSRF attacks
    try {
      const url = new URL(presignedUrl);
      if (!['https:', 'http:'].includes(url.protocol)) {
        throw new Error('Invalid URL protocol');
      }
    } catch {
      throw new Error('Invalid presigned URL format');
    }
    
    const s3Response = await fetch(presignedUrl, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!s3Response.ok) {
      throw new Error(`S3 fetch failed: ${s3Response.status}`);
    }
    
    try {
      return await s3Response.json();
    } catch (jsonError) {
      throw new Error('Invalid JSON response from S3');
    }
  };

  const processUploadResponse = async (responseData: any, isMockUpload: boolean) => {
    if (isMockUpload) {
      return responseData;
    }
    
    if (responseData.data?.presignedurl) {
      try {
        const s3Data = await fetchS3Data(responseData.data.presignedurl);
        return { ...responseData, s3Result: s3Data };
      } catch (s3Error) {
        console.error('Failed to fetch S3 result:', s3Error);
        return { ...responseData, s3Error: true };
      }
    }
    
    return { ...responseData, s3Error: true };
  };

  const getErrorMessage = (error: unknown): string => {
    if (!(error instanceof Error)) {
      return 'Upload failed. Please try again later.';
    }
    
    if (error.message === 'Request timeout') {
      return 'Upload service is currently unavailable. Please try again later.';
    }
    
    if (error.message.includes('HTTP error')) {
      const statusMatch = error.message.match(/status: (\d+)/);
      const status = statusMatch ? parseInt(statusMatch[1]) : 0;
      
      if (status >= 400 && status < 500) {
        return 'This file cannot be processed. Please try a different file.';
      }
      if (status >= 500) {
        return 'Upload service is currently unavailable. Please try again later.';
      }
    }
    
    return 'Upload failed. Please try again later.';
  };

  const addFile = async (file: File) => {
    if (!validateFileType(file)) {
      alert.showAlertMessage('Please select a PDF or image file. Only PDF documents and images are supported.', 'error');
      return;
    }
    
    if (!validateFileSize(file)) {
      alert.showAlertMessage('File size exceeds 10MB limit. Please choose a smaller file.', 'error');
      return;
    }

    const newFile = {
      id: crypto.randomUUID(),
      name: file.name,
      size: file.size
    };
    
    fileUpload.setUploadInProgress(true);
    fileUpload.setUploadProgress(0);
    setFileObjects(prev => new Map(prev).set(newFile.id, file));
    
    try {
      const responseData = await uploadFile(file, fileUpload.setUploadProgress);
      const isMockUpload = import.meta.env.VITE_MOCK_UPLOAD === 'true';
      
      setTimeout(async () => {
        try {
          fileUpload.setUploadProgress(100);
          fileUpload.setUploadInProgress(false);
          fileUpload.addFile(newFile);
          
          const finalResponseData = await processUploadResponse(responseData, isMockUpload);
          fileUpload.updateFileWithResponse(newFile.id, finalResponseData);
          
          const updatedFile = { ...newFile, apiResponse: finalResponseData };
          fileUpload.setSelectedFile(updatedFile);
          setPreviewFile(file);
          alert.showAlertMessage('Document uploaded successfully!', 'success');
        } catch (processingError) {
          console.error('Failed to process upload response:', processingError);
          alert.showAlertMessage('Upload completed but processing failed. Please try again.', 'error');
        }
      }, 500);
    } catch (error) {
      console.error('Failed to send document upload notification:', error);
      setTimeout(() => {
        fileUpload.setUploadInProgress(false);
        alert.showAlertMessage(getErrorMessage(error), 'error');
      }, 500);
    }
  };





  return (
    <div className="app-container">
      <Alert 
        show={alert.showAlert}
        message={alert.alertMessage}
        type={alert.alertType}
        fading={alert.alertFading}
        onClose={alert.closeAlert}
      />
      <Header onSignOut={handleSignOut} />
      
      <main className="main-content">
        <div className="grid-container">
          <div className="grid-item upload-section">
            <h2 className="section-title">Document Upload</h2>          
            <div className="upload-controls">
              <div className="upload-wrapper">
                <FileUpload onUploadComplete={() => {}} onFileSelect={addFile} disabled={fileUpload.uploadInProgress} />
              </div>
            </div>
          </div>
          
          <div className="grid-item results-section">
            <h2 className="section-title">Document Processing Results{import.meta.env.VITE_MOCK_UPLOAD === 'true' ? ' (Mock)' : ''}</h2>
            <ResultsDisplay 
              uploadedFiles={fileUpload.uploadedFiles}
              selectedFile={fileUpload.selectedFile}
              uploadInProgress={fileUpload.uploadInProgress}
              uploadProgress={fileUpload.uploadProgress}
              processingResult={null}
              showResults={false}
              previewFile={previewFile}
            />
          </div>
          
          <div className="grid-item files-section">
            <h2 className="section-title">Uploaded Files{import.meta.env.VITE_MOCK_UPLOAD === 'true' ? ' (Mock)' : ''}</h2>
            {fileUpload.uploadedFiles.length === 0 ? (
              <p className="section-description">
                Upload a document to see processing results here
              </p>
            ) : (
              <FilesList 
                files={fileUpload.uploadedFiles}
                selectedFile={fileUpload.selectedFile}
                onFileSelect={handleFileSelect}
                formatFileSize={formatFileSize}
              />
            )}
          </div>
          
          <div className="grid-item preview-section">
            <h2 className="section-title">Selected File</h2>
            {previewFile ? (
              <FilePreview file={previewFile} />
            ) : (
              <p className="section-description">
                Upload a document to see processing results here
              </p>
            )}
          </div>
          
          <div className="grid-item json-section">
            <h2 className="section-title">Diagnostic Info{import.meta.env.VITE_MOCK_UPLOAD === 'true' ? ' (Mock)' : ''}</h2>
            {fileUpload.selectedFile?.apiResponse ? (
              <CollapsibleJsonDisplay 
                data={fileUpload.selectedFile.apiResponse.s3Result || fileUpload.selectedFile.apiResponse}
                title={`Document Processing Response JSON${import.meta.env.VITE_MOCK_UPLOAD === 'true' ? ' (Mock)' : ''}`}
              />
            ) : (
              <p className="section-description">
                Upload a document to see processing results here
              </p>
            )}
          </div>
        </div>
      </main>

      <Footer />
      

    </div>
  );
}

export default App;
