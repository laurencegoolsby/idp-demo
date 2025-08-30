import './Alert.css';

interface AlertProps {
  show: boolean;
  message: string;
  type: 'success' | 'error';
  fading: boolean;
  onClose: () => void;
}

export default function Alert({ show, message, type, fading, onClose }: AlertProps) {
  if (!show) return null;

  return (
    <div className={`alert alert-${type} ${fading ? 'alert-fading' : ''}`}>
      <span className="alert-message">{message}</span>
      <button onClick={onClose} className="alert-close">
        ×
      </button>
    </div>
  );
}