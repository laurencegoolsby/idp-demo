import { UploadedFile } from '../hooks/useFileUpload';
import ExplainabilityRenderer from './ExplainabilityRenderer';
import ValidationBox from './ValidationBox';
import CollapsibleJsonDisplay from './CollapsibleJsonDisplay';
import LoadingState from './LoadingState';
import { validateDocument } from '../utils/documentValidation';
import './ResultsDisplay.css';

interface ResultsDisplayProps {
  uploadedFiles: UploadedFile[];
  selectedFile: UploadedFile | null;
  uploadInProgress: boolean;
  uploadProgress: number;
  processingResult: any;
  showResults: boolean;
}

export default function ResultsDisplay({ 
  uploadedFiles, 
  selectedFile, 
  uploadInProgress, 
  uploadProgress, 
  processingResult, 
  showResults 
}: ResultsDisplayProps) {
  if (uploadInProgress && selectedFile) {
    return <LoadingState progress={uploadProgress} />;
  }

  if (uploadedFiles.length === 0) {
    return (
      <p className="section-description">
        Upload a document to see processing results here
      </p>
    );
  }

  if (!selectedFile) {
    return (
      <p className="section-description">
        Click on a file to view details
      </p>
    );
  }

  return (
    <div className="file-display">
      {selectedFile?.apiResponse ? (
        <div className="results-container">
          {selectedFile.apiResponse.s3Error ? (
            <div className="unavailable-message">
              <p>
                Processing results are unavailable. Please try again in a few moments.
              </p>
            </div>
          ) : (
            <>
              {selectedFile.apiResponse.s3Result && (
                <div className="validation-container">
                  <ValidationBox 
                    validation={validateDocument(selectedFile.apiResponse.s3Result)}
                    fileName={selectedFile.name}
                  />
                </div>
              )}
              <CollapsibleJsonDisplay 
                data={selectedFile.apiResponse.s3Result || selectedFile.apiResponse}
                title="Document Processing Response JSON"
              />
            </>
          )}
        </div>
      ) : processingResult && showResults ? (
        <div className="processing-result" style={processingResult.explainability_info ? {
          backgroundColor: (() => {
            const confidenceValues: number[] = [];
            const extractConfidence = (obj: any) => {
              Object.values(obj).forEach((value: any) => {
                if (typeof value === 'object' && value !== null) {
                  if (value.confidence !== undefined) {
                    confidenceValues.push(value.confidence);
                  } else {
                    extractConfidence(value);
                  }
                }
              });
            };
            extractConfidence(processingResult.explainability_info);
            const avgConfidence = confidenceValues.length > 0 ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length : 0;
            if (avgConfidence > 0.9) return '#e8f5e8';
            if (avgConfidence >= 0.6) return '#fff8e1';
            return '#ffeaea';
          })()
        } : {}}>
          {processingResult.explainability_info ? 
            <ExplainabilityRenderer explainabilityInfo={processingResult.explainability_info} /> :
            <pre>{JSON.stringify(processingResult, null, 2)}</pre>
          }
        </div>
      ) : null}
    </div>
  );
}