import React, { InputHTMLAttributes, forwardRef } from 'react'
import { classNames } from '../../utils/helpers'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, className, ...props }, ref) => {
    const inputClasses = classNames(
      'block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 text-sm',
      error
        ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100',
      className
    )

    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helpText && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helpText}</p>
        )}
      </div>
    )
  }
)