import React, { useState } from 'react'
import { RunResult } from '../../types'
import { ResponseHeaders } from './ResponseHeaders'
import { ResponseBody } from './ResponseBody'
import { Button } from '../Common/Button'
import { Badge } from '../Common/Badge'
import { formatDuration, formatBytes, classNames } from '../../utils/helpers'
import { RequestRunner } from '../../services/requestRunner'

interface ResponseViewerProps {
  result: RunResult | null
  isLoading?: boolean
  onRetry?: () => void
}

export function ResponseViewer({ result, isLoading = false, onRetry }: ResponseViewerProps) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers' | 'preview'>('body')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Sending request...</p>
        </div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium mb-2">No response yet</p>
          <p>Send a request to see the response here</p>
        </div>
      </div>
    )
  }

  const getStatusVariant = (statusCode: number) => {
    if (statusCode >= 200 && statusCode < 300) return 'success'
    if (statusCode >= 300 && statusCode < 400) return 'info'
    if (statusCode >= 400 && statusCode < 500) return 'warning'
    if (statusCode >= 500) return 'error'
    return 'default'
  }

  const tabs = [
    { id: 'body', label: 'Response Body', count: result.responseBody ? 1 : 0 },
    { id: 'headers', label: 'Headers', count: Object.keys(result.responseHeaders).length },
    { id: 'preview', label: 'Preview', count: 0 }
  ]

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Response
          </h3>
          {onRetry && (
            <Button size="sm" variant="ghost" onClick={onRetry}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0V9a8 8 0 1115.357 2m-15.357-2H15" />
              </svg>
              Retry
            </Button>
          )}
        </div>

        {/* Status and Stats */}
        <div className="flex items-center space-x-4 mb-4">
          <Badge variant={getStatusVariant(result.statusCode)} size="md">
            {result.statusCode} {result.statusText}
          </Badge>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Time:</span> {formatDuration(result.duration)}
          </div>
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <span className="font-medium">Size:</span> {formatBytes(result.size)}
          </div>

          {result.error && (
            <Badge variant="error" size="md">
              Error
            </Badge>
          )}
        </div>

        {/* Error Message */}
        {result.error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
            <div className="flex items-start space-x-2">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-medium text-red-900 dark:text-red-300">Request Failed</h4>
                <p className="text-sm text-red-700 dark:text-red-400">{result.error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={classNames(
                'px-3 py-2 text-sm font-medium rounded-md flex items-center space-x-1',
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
              )}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="bg-blue-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-4 text-center">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'body' && (
          <ResponseBody 
            body={result.responseBody}
            contentType={result.responseHeaders['content-type']}
            error={result.error}
          />
        )}
        
        {activeTab === 'headers' && (
          <ResponseHeaders headers={result.responseHeaders} />
        )}
        
        {activeTab === 'preview' && (
          <div className="p-4 h-full overflow-y-auto">
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <p>Preview not available</p>
              <p className="text-sm">Preview features coming soon</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}