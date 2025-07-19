'use client';

import React, { useEffect, useState } from 'react';

export interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  showCloseButton?: boolean;
}

export const Toast: React.FC<ToastProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  duration = 5000,
  showCloseButton = true
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
      
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-50 border-green-200',
          icon: 'text-green-600',
          title: 'text-green-800',
          message: 'text-green-700',
          iconPath: 'M5 13l4 4L19 7'
        };
      case 'error':
        return {
          bg: 'bg-red-50 border-red-200',
          icon: 'text-red-600',
          title: 'text-red-800',
          message: 'text-red-700',
          iconPath: 'M6 18L18 6M6 6l12 12'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-600',
          title: 'text-yellow-800',
          message: 'text-yellow-700',
          iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      default: // info
        return {
          bg: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-600',
          title: 'text-blue-800',
          message: 'text-blue-700',
          iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
    }
  };

  if (!isVisible) return null;

  const styles = getTypeStyles();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full">
      <div
        className={`
          ${styles.bg} border rounded-2xl shadow-lg p-6 
          transform transition-all duration-300 ease-in-out
          ${isClosing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}
        `}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className={`w-6 h-6 ${styles.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={styles.iconPath} />
            </svg>
          </div>
          <div className="ml-4 flex-1">
            <h4 className={`text-sm font-semibold ${styles.title} mb-1`}>
              {title}
            </h4>
            <p className={`text-sm ${styles.message}`}>
              {message}
            </p>
          </div>
          {showCloseButton && (
            <button
              onClick={handleClose}
              className="flex-shrink-0 ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
