import { useState } from 'react';
import FileUpload from './components/FileUpload';
import Header from './layouts/Header';
import Footer from './layouts/Footer';
import Alert from './components/Alert';

import FilesList from './components/FilesList';
import ResultsDisplay from './components/ResultsDisplay';
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
  const [uploadingFile, setUploadingFile] = useState<any>(null);
  
  const alert = useAlert();
  const fileUpload = useFileUpload();

  const handleSignOut = () => {
    console.log('Sign out clicked');
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
      id: Date.now().toString(),
      name: file.name,
      size: file.size
    };
    
    fileUpload.setUploadInProgress(true);
    fileUpload.setUploadProgress(0);
    setUploadingFile(newFile);
    
    try {
      const responseData = await uploadFile(file, fileUpload.setUploadProgress);
      
      setTimeout(async () => {
        fileUpload.setUploadProgress(100);
        fileUpload.setUploadInProgress(false);
        fileUpload.addFile(newFile);
        fileUpload.updateFileWithResponse(newFile.id, responseData);
        
        // Fetch processed result from S3 if presigned URL exists
        if (responseData.data?.presignedurl) {
          try {
            const s3Response = await fetch(responseData.data.presignedurl, {
              method: 'GET',
              mode: 'cors',
              headers: {
                'Accept': 'application/json',
              }
            });
            
            if (!s3Response.ok) {
              throw new Error(`S3 fetch failed: ${s3Response.status}`);
            }
            
            const s3Data = await s3Response.json();
            fileUpload.updateFileWithResponse(newFile.id, { 
              ...responseData, 
              s3Result: s3Data
            });
          } catch (s3Error) {
            console.error('Failed to fetch S3 result:', s3Error);
            fileUpload.updateFileWithResponse(newFile.id, { ...responseData, s3Error: true });
          }
        } else {
          fileUpload.updateFileWithResponse(newFile.id, { ...responseData, s3Error: true });
        }
        
        setUploadingFile(null);
        alert.showAlertMessage('Document uploaded successfully!', 'success');
      }, 500);
    } catch (error) {
      console.error('Failed to send document upload notification:', error);
      setTimeout(() => {
        fileUpload.setUploadInProgress(false);
        let errorMessage = 'Upload failed. Please try again later.';
        
        if (error instanceof Error) {
          if (error.message === 'Request timeout') {
            errorMessage = 'Upload service is currently unavailable. Please try again later.';
          } else if (error.message.includes('HTTP error')) {
            const statusMatch = error.message.match(/status: (\d+)/);
            const status = statusMatch ? parseInt(statusMatch[1]) : 0;
            
            if (status >= 400 && status < 500) {
              errorMessage = 'This file cannot be processed. Please try a different file.';
            } else if (status >= 500) {
              errorMessage = 'Upload service is currently unavailable. Please try again later.';
            } else {
              errorMessage = 'Upload failed. Please try again later.';
            }
          }
        }

        setUploadingFile(null);
        alert.showAlertMessage(errorMessage, 'error');
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
        <div className="upload-section">
          <h2 className="section-title">Document Upload</h2>          
          <div className="upload-controls">
            <div className="upload-wrapper">
              <FileUpload onUploadComplete={() => {}} onFileSelect={addFile} disabled={fileUpload.uploadInProgress} />
            </div>
          </div>
          
          <FilesList 
            files={fileUpload.uploadedFiles}
            selectedFile={fileUpload.selectedFile}
            onFileSelect={fileUpload.setSelectedFile}
            formatFileSize={formatFileSize}
          />
        </div>
        
        <div className="results-section">
          <h2 className="section-title">Intelligent Document Processing Results</h2>
          <ResultsDisplay 
            uploadedFiles={fileUpload.uploadedFiles}
            selectedFile={uploadingFile || fileUpload.selectedFile}
            uploadInProgress={fileUpload.uploadInProgress}
            uploadProgress={fileUpload.uploadProgress}
            processingResult={null}
            showResults={false}
          />
        </div>
      </main>

      <Footer />
      

    </div>
  );
}

export default App;
