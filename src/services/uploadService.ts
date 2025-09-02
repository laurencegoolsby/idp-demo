export const uploadFile = async (
  file: File, 
  onProgress: (progress: number | ((prev: number) => number)) => void
): Promise<any> => {
  const endpoint = import.meta.env.VITE_UPLOAD_DOCUMENT_ENDPOINT;
  const mockMode = import.meta.env.VITE_MOCK_UPLOAD === 'true';
  
  if (!endpoint && !mockMode) {
    throw new Error('Upload endpoint not configured. Please set VITE_UPLOAD_DOCUMENT_ENDPOINT environment variable.');
  }
  
  // Mock upload for testing when backend is down
  if (mockMode) {
    return simulateMockUpload(file, onProgress);
  }
  
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileName', file.name);
  formData.append('fileSize', file.size.toString());
  formData.append('documentType', 'Document');
  formData.append('contentType', file.type);
  formData.append('timestamp', new Date().toISOString());
  
  // Cycling progress simulation with randomized increments
  let cycleStartTime = Date.now();
  let cycleDuration = Math.random() * 10000 + 10000; // 10-20 seconds
  let pauseDuration = Math.random() * 2000 + 1000; // 1-3 seconds
  let isPausing = false;
  let pauseStartTime = 0;
  
  const progressInterval = setInterval(() => {
    onProgress((prev: number) => {
      const elapsed = Date.now() - cycleStartTime;
      
      if (isPausing) {
        const pauseElapsed = Date.now() - pauseStartTime;
        if (pauseElapsed >= pauseDuration) {
          // End pause, start new cycle
          isPausing = false;
          cycleStartTime = Date.now();
          cycleDuration = Math.random() * 10000 + 10000; // 10-20 seconds
          return 0; // Reset to 0 for new cycle
        }
        return 100; // Stay at 100% during pause
      }
      
      const cycleProgress = Math.min(elapsed / cycleDuration, 1);
      
      if (cycleProgress >= 1) {
        // Start pause
        isPausing = true;
        pauseStartTime = Date.now();
        pauseDuration = Math.random() * 2000 + 1000; // 1-3 seconds
        return 100;
      }
      
      // Randomized progress with variable increments
      const baseProgress = cycleProgress * 100;
      const randomVariation = (Math.random() - 0.5) * 10; // ±5% variation
      const newProgress = Math.max(0, Math.min(100, baseProgress + randomVariation));
      
      // Ensure progress generally moves forward
      return Math.max(prev, newProgress - 5); // Allow small backwards movement
    });
  }, 150 + Math.random() * 100); // Randomize update interval
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
    
    const response = await fetch(endpoint, {
      method: 'POST',
      mode: 'cors',
      body: formData,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    clearInterval(progressInterval);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearInterval(progressInterval);
    onProgress(100);
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
};

const simulateMockUpload = async (
  file: File,
  onProgress: (progress: number | ((prev: number) => number)) => void
): Promise<any> => {
  // Simulate realistic upload progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 15 + 5; // 5-20% increments
    if (progress >= 100) {
      progress = 100;
      clearInterval(progressInterval);
    }
    onProgress(progress);
  }, 200 + Math.random() * 300); // 200-500ms intervals
  
  // Wait for progress to complete
  await new Promise(resolve => {
    const checkProgress = () => {
      if (progress >= 100) {
        resolve(undefined);
      } else {
        setTimeout(checkProgress, 100);
      }
    };
    checkProgress();
  });
  
  // Randomly select a mock response file
  const mockFiles = [
    'document-processing-result-high-confidence.json',
    'document-processing-result-low-confidence.json',
    'misc-document-result-high-confidence.json',
    'misc-document-result-low-confidence.json',
    'personal-info-result-high-confidence.json',
    'personal-info-result-low-confidence.json'
  ];
  
  const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
  
  try {
    const response = await fetch(`/mocks/sample_responses/${randomFile}`);
    if (!response.ok) {
      throw new Error(`Failed to load mock file: ${randomFile}`);
    }
    const mockData = await response.json();
    
    // Return mock response with metadata
    return {
      success: true,
      message: 'Document processed successfully',
      fileId: `mock-${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      uploadTime: new Date().toISOString(),
      processingStatus: 'completed',
      s3Result: mockData
    };
  } catch (error) {
    console.error('Failed to load mock response:', error);
    // Fallback to simple mock if file loading fails
    return {
      success: true,
      message: 'Document processed successfully (fallback)',
      fileId: `mock-${Date.now()}`,
      fileName: file.name,
      fileSize: file.size,
      uploadTime: new Date().toISOString(),
      processingStatus: 'completed',
      s3Result: {
        documentType: 'unknown',
        confidence: 0.5,
        fields: {},
        rawText: 'Mock processing failed to load sample data'
      }
    };
  }
};