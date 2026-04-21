import React, { useState } from 'react'
import { Button } from '../Common/Button'
import { copyToClipboard, isValidJson, prettifyJson } from '../../utils/helpers'
import { useToast } from '../../contexts/ToastContext'

interface ResponseBodyProps {
  body: string
  contentType?: string
  error?: string | null
}

export function ResponseBody({ body, contentType, error }: ResponseBodyProps) {
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted')
  const { success } = useToast()

  const handleCopy = async () => {
    const copied = await copyToClipboard(body)
    if (copied) {
      success('Response copied to clipboard')
    }
  }

  const isJson = contentType?.includes('application/json') || isValidJson(body)
  
  const formatResponseBody = (text: string): string => {
    if (!text) return ''
    
    if (isJson && viewMode === 'formatted') {
      try {
        return prettifyJson(text)
      } catch {
        return text
      }
    }
    
    return text
  }

  const highlightJson = (text: string): string => {
    if (!isJson || viewMode === 'raw') return text
    
    // Simple JSON syntax highlighting
    return text
      .replace(/"([^"\\]*(\\.[^"\\]*)*)"/g, '<span class="json-string">"$1"</span>')
      .replace(/\b(-?\d+\.?\d*)\b/g, '<span class="json-number">$1</span>')
      .replace(/\b(true|false)\b/g, '<span class="json-boolean">$1</span>')
      .replace(/\bnull\b/g, '<span class="json-null">null</span>')
      .replace(/("[^"]+")(\s*:)/g, '<span class="json-key">$1</span>$2')
  }

  if (error && !body) {
    return (
      <div className="p-4 h-full">
        <div className="h-full bg-red-50 dark:bg-red-900/20 border-2 border-dashed border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-700 dark:text-red-300 font-medium">Request failed</p>
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!body) {
    return (
      <div className="p-4 h-full">
        <div className="h-full bg-gray-50 dark:bg-gray-700/50 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-lg flex items-center justify-center">
          <div className="text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No response body</p>
          </div>
        </div>
      </div>
    )
  }

  const formattedBody = formatResponseBody(body)

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center space-x-2">
          {isJson && (
            <div className="flex bg-white dark:bg-gray-800 rounded-md border dark:border-gray-600">
              <button
                className={`px-3 py-1 text-sm rounded-l-md transition-colors ${
                  viewMode === 'formatted'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setViewMode('formatted')}
              >
                Formatted
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-r-md transition-colors ${
                  viewMode === 'raw'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'
                }`}
                onClick={() => setViewMode('raw')}
              >
                Raw
              </button>
            </div>
          )}
          
          {contentType && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {contentType}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {body.length} characters
          </span>
          <Button size="sm" variant="ghost" onClick={handleCopy}>
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy
          </Button>
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-hidden">
        {isJson && viewMode === 'formatted' ? (
          <pre
            className="h-full w-full p-4 overflow-auto text-sm font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 custom-scrollbar"
            dangerouslySetInnerHTML={{
              __html: highlightJson(formattedBody)
            }}
          />
        ) : (
          <pre className="h-full w-full p-4 overflow-auto text-sm font-mono bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 whitespace-pre-wrap custom-scrollbar">
            {formattedBody}
          </pre>
        )}
      </div>
    </div>
  )
}