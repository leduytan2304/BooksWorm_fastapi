import React, { useEffect } from 'react';

export default function Notification({ message, type = 'success', isVisible, onClose, duration = 3000 }) {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  const bgColor = type === 'success' ? 'bg-green-500' : 
                 type === 'error' ? 'bg-red-500' : 
                 type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in-down">
      <div className={`${bgColor} text-white px-4 py-2 rounded-md shadow-lg flex items-center max-w-xs`}>
        <span className="flex-grow">{message}</span>
        <button 
          onClick={onClose} 
          className="ml-2 text-white hover:text-gray-200 focus:outline-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}