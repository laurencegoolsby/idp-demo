// Mock API utility functions for development
export const mockApiCall = async <T>(endpoint: string, delay: number = 1000): Promise<T> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, delay));
  
  try {
    const response = await fetch(`/mocks/sample_responses/${endpoint}.json`);
    if (!response.ok) {
      throw new Error(`Failed to fetch mock data: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Mock API error:', error);
    throw error;
  }
};

// Specific mock API functions
export const processDocument = async (fileName: string) => {
  const endpoint = getEndpointByFileName(fileName);
  return mockApiCall(endpoint, 2000); // 2 second delay to simulate processing
};

const getEndpointByFileName = (fileName: string): string => {
  // Remove file extension to get base name
  const baseName = fileName.replace(/\.[^/.]+$/, '');
  console.log('Mapping filename:', baseName);
  
  // Direct mapping - filename without extension should match JSON filename
  const validEndpoints = [
    'document-processing-result-high-confidence',
    'document-processing-result-low-confidence',
    'personal-info-result-high-confidence',
    'personal-info-result-low-confidence',
    'misc-document-result-high-confidence',
    'misc-document-result-low-confidence'
  ];
  
  if (validEndpoints.includes(baseName)) {
    return baseName;
  }
  
  // Default fallback
  console.log('Using default fallback for:', baseName);
  return 'document-processing-result-high-confidence';
};