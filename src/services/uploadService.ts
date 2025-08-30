export const uploadFile = async (
  file: File, 
  onProgress: (progress: number | ((prev: number) => number)) => void
): Promise<any> => {
  const endpoint = import.meta.env.VITE_UPLOAD_DOCUMENT_ENDPOINT;
  
  if (!endpoint) {
    throw new Error('Upload endpoint not configured. Please set VITE_UPLOAD_DOCUMENT_ENDPOINT environment variable.');
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