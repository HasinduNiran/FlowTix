import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = true, className = '', ...props }, ref) => {
    const inputClasses = `
      block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm 
      focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
      ${className}
    `;

    const containerClasses = `
      ${fullWidth ? 'w-full' : ''}
      ${props.disabled ? 'opacity-70' : ''}
    `;

    return (
      <div className={containerClasses}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <input ref={ref} className={inputClasses} {...props} />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
); 