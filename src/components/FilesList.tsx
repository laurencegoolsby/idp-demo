import { UploadedFile } from '../hooks/useFileUpload';

interface FilesListProps {
  files: UploadedFile[];
  selectedFile: UploadedFile | null;
  onFileSelect: (file: UploadedFile) => void;
  formatFileSize: (bytes: number) => string;
}

export default function FilesList({ files, selectedFile, onFileSelect, formatFileSize }: FilesListProps) {
  if (files.length === 0) return null;

  return (
    <div className="files-list">
      {files.map((file) => (
        <div 
          key={file.id} 
          className={`file-item ${selectedFile?.id === file.id ? 'selected' : ''}`} 
          onClick={() => onFileSelect(file)}
        >
          <div className="file-details">
            <p><strong>Name:</strong> {file.name}</p>
            <p><strong>Size:</strong> {formatFileSize(file.size)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}