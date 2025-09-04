'use client';

import { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning';
}

export default function Modal({ isOpen, onClose, title, message, type }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          bgColor: 'bg-green-600',
          borderColor: 'border-green-600',
          textColor: 'text-green-600'
        };
      case 'error':
        return {
          icon: '❌',
          bgColor: 'bg-red-600',
          borderColor: 'border-red-600',
          textColor: 'text-red-600'
        };
      case 'warning':
        return {
          icon: '⚠️',
          bgColor: 'bg-yellow-600',
          borderColor: 'border-yellow-600',
          textColor: 'text-yellow-600'
        };
      default:
        return {
          icon: 'ℹ️',
          bgColor: 'bg-blue-600',
          borderColor: 'border-blue-600',
          textColor: 'text-blue-600'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        {/* Header */}
        <div className={`${styles.bgColor} rounded-t-2xl p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{styles.icon}</span>
              <h3 className="text-xl font-bold">{title}</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 text-center leading-relaxed">
            {message}
          </p>
        </div>
        
        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className={`w-full ${styles.bgColor} hover:opacity-90 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200`}
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
