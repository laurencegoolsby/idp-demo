import { useState, useRef } from 'react';

export const useAlert = () => {
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error'>('success');
  const [alertFading, setAlertFading] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showAlertMessage = (message: string, type: 'success' | 'error') => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setAlertFading(false);
    
    timeoutRef.current = setTimeout(() => {
      setAlertFading(true);
      setTimeout(() => {
        setShowAlert(false);
        setAlertFading(false);
        timeoutRef.current = null;
      }, 300);
    }, 4000);
  };

  const closeAlert = () => {
    // Clear the auto-close timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    setAlertFading(true);
    setTimeout(() => {
      setShowAlert(false);
      setAlertFading(false);
    }, 300);
  };

  return {
    showAlert,
    alertMessage,
    alertType,
    alertFading,
    showAlertMessage,
    closeAlert
  };
};