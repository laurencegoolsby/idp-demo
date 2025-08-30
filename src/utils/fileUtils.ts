export const formatFileSize = (bytes: number): string => {
  const mb = bytes / 1024 / 1024;
  return mb < 1 ? `${(bytes / 1024).toFixed(0)} KB` : `${mb.toFixed(2)} MB`;
};

export const validateFileSize = (file: File, maxSizeMB: number = 10): boolean => {
  const maxSize = maxSizeMB * 1024 * 1024;
  return file.size <= maxSize;
};

export const validateFileType = (file: File): boolean => {
  return file.type === 'application/pdf' || file.type.startsWith('image/');
};