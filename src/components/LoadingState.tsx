interface LoadingStateProps {
  progress: number;
}

export default function LoadingState({ progress }: LoadingStateProps) {
  return (
    <div className="file-display">
      <div className="loading-container">
        <div className="loading-text">Processing ... {Math.round(progress)}%</div>
        <div className="progress-bar">
          <div className="progress-fill" style={{width: `${progress}%`}}></div>
        </div>
      </div>
    </div>
  );
}