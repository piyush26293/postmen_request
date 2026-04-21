import React from 'react'
import { Button } from '../Common/Button'
import { copyToClipboard } from '../../utils/helpers'
import { useToast } from '../../contexts/ToastContext'

interface ResponseHeadersProps {
  headers: Record<string, string>
}

export function ResponseHeaders({ headers }: ResponseHeadersProps) {
  const { success } = useToast()
  
  const headerEntries = Object.entries(headers)

  const handleCopyHeader = async (name: string, value: string) => {
    const copied = await copyToClipboard(`${name}: ${value}`)
    if (copied) {
      success('Header copied to clipboard')
    }
  }

  const handleCopyAllHeaders = async () => {
    const headersText = headerEntries
      .map(([name, value]) => `${name}: ${value}`)
      .join('\n')
    
    const copied = await copyToClipboard(headersText)
    if (copied) {
      success('All headers copied to clipboard')
    }
  }

  if (headerEntries.length === 0) {
    return (
      <div className="p-4 h-full">
        <div className="h-full bg-gray-50 dark:bg-gray-700/50 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p>No response headers</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">
          Response Headers ({headerEntries.length})
        </h4>
        <Button size="sm" variant="ghost" onClick={handleCopyAllHeaders}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy All
        </Button>
      </div>

      {/* Headers List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="divide-y dark:divide-gray-700">
          {headerEntries.map(([name, value]) => (
            <div key={name} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {name}
                    </span>
                    <button
                      onClick={() => handleCopyHeader(name, value)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity"
                      title="Copy header"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 break-words font-mono">
                    {value}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Common Headers Info */}
      <div className="border-t dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/50">
        <details className="text-sm">
          <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
            Common headers explanation
          </summary>
          <div className="mt-2 space-y-2 text-gray-600 dark:text-gray-400">
            <div>
              <strong>content-type:</strong> The media type of the response body
            </div>
            <div>
              <strong>content-length:</strong> The size of the response body in bytes
            </div>
            <div>
              <strong>server:</strong> Information about the server software
            </div>
            <div>
              <strong>date:</strong> When the response was sent
            </div>
            <div>
              <strong>cache-control:</strong> Directives for caching mechanisms
            </div>
            <div>
              <strong>access-control-*:</strong> CORS (Cross-Origin Resource Sharing) headers
            </div>
          </div>
        </details>
      </div>
    </div>
  )
}