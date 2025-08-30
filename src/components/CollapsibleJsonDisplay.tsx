import { useState } from 'react';

interface CollapsibleJsonDisplayProps {
  data: any;
  title?: string;
}

export default function CollapsibleJsonDisplay({ 
  data, 
  title = "Document Processing Response" 
}: CollapsibleJsonDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="collapsible-container">
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="collapsible-header"
      >
        <h4 className="collapsible-title">
          {title}
        </h4>
        <span className="collapsible-arrow">
          {isExpanded ? '▼' : '▶'}
        </span>
      </div>
      {isExpanded && (
        <div className="collapsible-content">
          <pre className="json-display">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}