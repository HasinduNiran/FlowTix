'use client';

import React, { useEffect, useState } from 'react';
import { Button } from './Button';

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger',
  isLoading = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsClosing(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    if (isLoading) return; // Prevent closing during loading
    
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 200);
  };

  const handleConfirm = () => {
    if (isLoading) return; // Prevent multiple clicks during loading
    onConfirm();
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-100',
          iconColor: 'text-red-600',
          confirmButton: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
          iconPath: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
        };
      case 'warning':
        return {
          iconBg: 'bg-yellow-100',
          iconColor: 'text-yellow-600',
          confirmButton: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
          iconPath: 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
      default: // info
        return {
          iconBg: 'bg-blue-100',
          iconColor: 'text-blue-600',
          confirmButton: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
          iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        };
    }
  };

  if (!isVisible) return null;

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className={`
          fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200
          ${isClosing ? 'opacity-0' : 'opacity-100'}
        `}
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`
            relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200
            transform transition-all duration-200 ease-out
            ${isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'}
          `}
        >
          <div className="p-8">
            {/* Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className={`${styles.iconBg} rounded-full p-4`}>
                <svg 
                  className={`w-8 h-8 ${styles.iconColor}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d={styles.iconPath} 
                  />
                </svg>
              </div>
            </div>

            {/* Content */}
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {title}
              </h3>
              <p className="text-gray-600 text-base leading-relaxed">
                {message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleClose}
                variant="outline"
                disabled={isLoading}
                className="flex-1 px-6 py-3 text-base font-medium transition-all duration-200 hover:bg-gray-50"
              >
                {cancelText}
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                isLoading={isLoading}
                className={`
                  flex-1 px-6 py-3 text-base font-medium text-white shadow-lg
                  transition-all duration-200 transform hover:scale-105 focus:scale-105
                  ${styles.confirmButton} focus:ring-2 focus:ring-offset-2
                `}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
