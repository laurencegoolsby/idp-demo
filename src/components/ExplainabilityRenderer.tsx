interface ExplainabilityRendererProps {
  explainabilityInfo: any;
}

export default function ExplainabilityRenderer({ explainabilityInfo }: ExplainabilityRendererProps) {
  const getConfidenceClass = (confidence: number): string => {
    if (confidence > 0.9) return 'confidence-high';
    if (confidence >= 0.6) return 'confidence-medium';
    return 'confidence-low';
  };

  const confidenceValues: number[] = [];
  
  const flattenFields = (obj: any, prefix: string = ''): JSX.Element[] => {
    const items: JSX.Element[] = [];
    
    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix} ${key}` : key;
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if ((value as any).confidence !== undefined) {
          confidenceValues.push((value as any).confidence);
          items.push(
            <div key={fullKey} className="field-item">
              <span className="field-key">{fullKey}:</span>
              <span className="field-value">{(value as any).value}</span>
              <span className={`field-confidence ${getConfidenceClass((value as any).confidence)}`}>
                ({Math.round((value as any).confidence * 100)}%)
              </span>
            </div>
          );
        } else {
          items.push(...flattenFields(value, fullKey));
        }
      }
    });
    
    return items;
  };

  const fields = flattenFields(explainabilityInfo);
  
  const avgConfidence = confidenceValues.length > 0 ? confidenceValues.reduce((a, b) => a + b, 0) / confidenceValues.length : 0;
  const minConfidence = confidenceValues.length > 0 ? Math.min(...confidenceValues) : 0;
  const maxConfidence = confidenceValues.length > 0 ? Math.max(...confidenceValues) : 0;
  const medianConfidence = confidenceValues.length > 0 ? (() => {
    const sorted = [...confidenceValues].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  })() : 0;

  const getBackgroundColor = (confidence: number): string => {
    if (confidence > 0.9) return '#e8f5e8';
    if (confidence >= 0.6) return '#fff8e1';
    return '#ffeaea';
  };

  const getConfidenceLevel = (confidence: number): string => {
    if (confidence > 0.9) return 'High';
    if (confidence >= 0.6) return 'Medium';
    return 'Low';
  };

  return (
    <div className="explainability-content" style={{backgroundColor: getBackgroundColor(avgConfidence)}}>
      <div className="confidence-stats">
        <h4>Confidence Statistics</h4>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Confidence:</span>
            <span className={`stat-value ${getConfidenceClass(avgConfidence)}`}>{getConfidenceLevel(avgConfidence)}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Minimum:</span>
            <span className={`stat-value ${getConfidenceClass(minConfidence)}`}>{Math.round(minConfidence * 100)}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Median:</span>
            <span className={`stat-value ${getConfidenceClass(medianConfidence)}`}>{Math.round(medianConfidence * 100)}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Average:</span>
            <span className={`stat-value ${getConfidenceClass(avgConfidence)}`}>{Math.round(avgConfidence * 100)}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Maximum:</span>
            <span className={`stat-value ${getConfidenceClass(maxConfidence)}`}>{Math.round(maxConfidence * 100)}%</span>
          </div>
        </div>
      </div>
      <div className="field-details">
        {fields}
      </div>
    </div>
  );
}