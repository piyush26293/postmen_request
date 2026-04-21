import React from 'react'
import { RunHistoryItem } from '../../types'
import { Badge } from '../Common/Badge'
import { formatRelativeTime, formatDuration, classNames } from '../../utils/helpers'
import { RequestRunner } from '../../services/requestRunner'

interface HistoryItemProps {
  item: RunHistoryItem
  isSelected: boolean
  onSelect: (item: RunHistoryItem) => void
}

export function HistoryItem({ item, isSelected, onSelect }: HistoryItemProps) {
  const getStatusVariant = (statusCode: number | null, error: string | null) => {
    if (error) return 'error'
    if (statusCode === null) return 'default'
    if (statusCode >= 200 && statusCode < 300) return 'success'
    if (statusCode >= 300 && statusCode < 400) return 'info'
    if (statusCode >= 400 && statusCode < 500) return 'warning'
    if (statusCode >= 500) return 'error'
    return 'default'
  }

  const methodColors = RequestRunner.getMethodColor(item.method)

  return (
    <div
      className={classNames(
        'p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50',
        isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
      )}
      onClick={() => onSelect(item)}
    >
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className={classNames('px-2 py-1 text-xs font-medium rounded', methodColors)}>
                {item.method}
              </span>
              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {item.requestName}
              </h4>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {item.url}
            </p>
          </div>
          
          <div className="flex-shrink-0 ml-2">
            <Badge variant={getStatusVariant(item.statusCode, item.error)} size="sm">
              {item.error ? 'ERROR' : item.statusCode}
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-3">
            <span title="Response time">
              <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatDuration(item.duration)}
            </span>
            
            {item.responseBody && (
              <span title="Response size">
                <svg className="w-3 h-3 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {new Blob([item.responseBody]).size} bytes
              </span>
            )}
          </div>
          
          <span title={new Date(item.timestamp).toLocaleString()}>
            {formatRelativeTime(item.timestamp)}
          </span>
        </div>

        {/* Error Message */}
        {item.error && (
          <div className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            {item.error}
          </div>
        )}

        {/* Response Preview */}
        {item.responseBody && !item.error && (
          <div className="text-xs">
            <div className="text-gray-500 dark:text-gray-400 mb-1">Response preview:</div>
            <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded font-mono text-gray-700 dark:text-gray-300 max-h-20 overflow-hidden">
              {item.responseBody.length > 200 
                ? item.responseBody.slice(0, 200) + '...'
                : item.responseBody}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}