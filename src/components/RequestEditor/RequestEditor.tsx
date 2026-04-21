import React, { useState, useEffect } from 'react'
import { SavedRequest, HttpMethod, BodyType, KeyValuePair, RunResult } from '../../types'
import { Button } from '../Common/Button'
import { Input } from '../Common/Input'
import { Select } from '../Common/Select'
import { HeadersEditor } from './HeadersEditor'
import { QueryParamsEditor } from './QueryParamsEditor'
import { BodyEditor } from './BodyEditor'
import { AuthEditor } from './AuthEditor'
import { RequestRunner } from '../../services/requestRunner'
import { useEnvironments } from '../../hooks/useEnvironments'
import { useRequests } from '../../hooks/useRequests'
import { useHistory } from '../../hooks/useHistory'
import { useToast } from '../../contexts/ToastContext'
import { v4 as uuidv4 } from 'uuid'
import { classNames } from '../../utils/helpers'

interface RequestEditorProps {
  request: SavedRequest | null
  onResponse: (result: RunResult) => void
  onRequestChange?: (request: SavedRequest) => void
}

export function RequestEditor({ request, onResponse, onRequestChange }: RequestEditorProps) {
  const [activeTab, setActiveTab] = useState<'params' | 'headers' | 'body' | 'auth' | 'settings' | 'notes'>('params')
  const [isRunning, setIsRunning] = useState(false)
  const [localRequest, setLocalRequest] = useState<SavedRequest | null>(null)
  
  const { activeEnvironment } = useEnvironments()
  const { updateRequest } = useRequests()
  const { addToHistory } = useHistory()
  const { success, error } = useToast()

  useEffect(() => {
    setLocalRequest(request)
  }, [request])

  const httpMethods: { value: HttpMethod; label: string }[] = [
    { value: 'GET', label: 'GET' },
    { value: 'POST', label: 'POST' },
    { value: 'PUT', label: 'PUT' },
    { value: 'PATCH', label: 'PATCH' },
    { value: 'DELETE', label: 'DELETE' }
  ]

  const handleFieldChange = async (field: keyof SavedRequest, value: any) => {
    if (!localRequest) return

    const updated = { ...localRequest, [field]: value }
    setLocalRequest(updated)
    
    // Auto-save changes
    try {
      await updateRequest(localRequest.id, { [field]: value })
      onRequestChange?.(updated)
    } catch (err) {
      console.error('Failed to save request:', err)
    }
  }

  const handleQueryParamsChange = (queryParams: KeyValuePair[]) => {
    handleFieldChange('queryParams', queryParams)
  }

  const handleHeadersChange = (headers: KeyValuePair[]) => {
    handleFieldChange('headers', headers)
  }

  const handleRunRequest = async () => {
    if (!localRequest) return

    // Validate request
    const validationErrors = RequestRunner.validateRequest(localRequest)
    if (validationErrors.length > 0) {
      error(validationErrors[0])
      return
    }

    setIsRunning(true)
    
    try {
      const result = await RequestRunner.executeRequest(localRequest, activeEnvironment)
      
      // Add to history
      await addToHistory({
        id: uuidv4(),
        requestId: localRequest.id,
        requestName: localRequest.name,
        method: localRequest.method,
        url: localRequest.url,
        statusCode: result.statusCode,
        duration: result.duration,
        timestamp: new Date().toISOString(),
        responseBody: result.responseBody,
        responseHeaders: result.responseHeaders,
        error: result.error
      })

      onResponse(result)
      
      if (result.error) {
        error(`Request failed: ${result.error}`)
      } else {
        success(`Request completed: ${result.statusCode} ${result.statusText}`)
      }
    } catch (err: any) {
      error(`Request failed: ${err.message}`)
      onResponse({
        statusCode: 0,
        statusText: 'Error',
        duration: 0,
        responseBody: '',
        responseHeaders: {},
        size: 0,
        error: err.message
      })
    } finally {
      setIsRunning(false)
    }
  }

  if (!localRequest) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <p className="text-lg font-medium mb-2">No request selected</p>
          <p>Select or create a request to start testing your API</p>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'params', label: 'Params', count: localRequest.queryParams.filter(p => p.enabled && p.key).length },
    { id: 'headers', label: 'Headers', count: localRequest.headers.filter(h => h.enabled && h.key).length },
    { id: 'body', label: 'Body', count: localRequest.bodyType !== 'none' && localRequest.body ? 1 : 0 },
    { id: 'auth', label: 'Auth', count: 0 },
    { id: 'settings', label: 'Settings', count: 0 },
    { id: 'notes', label: 'Notes', count: localRequest.notes ? 1 : 0 }
  ]

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <Input
            value={localRequest.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            placeholder="Request name"
            className="flex-1"
          />
          <Button
            variant={localRequest.favorite ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => handleFieldChange('favorite', !localRequest.favorite)}
            title={localRequest.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg className="w-4 h-4" fill={localRequest.favorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </Button>
        </div>

        <div className="flex items-center space-x-3 mb-4">
          <Select
            value={localRequest.method}
            onChange={(e) => handleFieldChange('method', e.target.value as HttpMethod)}
            options={httpMethods}
            className="w-32"
          />
          <Input
            value={localRequest.url}
            onChange={(e) => handleFieldChange('url', e.target.value)}
            placeholder="Enter request URL"
            className="flex-1"
          />
          <Button
            onClick={handleRunRequest}
            loading={isRunning}
            disabled={!localRequest.url.trim()}
          >
            {isRunning ? 'Running...' : 'Send'}
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={classNames(
                'px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap flex items-center space-x-1',
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
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'params' && (
          <QueryParamsEditor
            queryParams={localRequest.queryParams}
            onChange={handleQueryParamsChange}
          />
        )}
        
        {activeTab === 'headers' && (
          <HeadersEditor
            headers={localRequest.headers}
            onChange={handleHeadersChange}
          />
        )}
        
        {activeTab === 'body' && (
          <BodyEditor
            bodyType={localRequest.bodyType}
            body={localRequest.body}
            onBodyTypeChange={(bodyType) => handleFieldChange('bodyType', bodyType)}
            onBodyChange={(body) => handleFieldChange('body', body)}
          />
        )}
        
        {activeTab === 'auth' && (
          <AuthEditor
            headers={localRequest.headers}
            onChange={handleHeadersChange}
          />
        )}
        
        {activeTab === 'settings' && (
          <div className="p-4">
            <div className="max-w-md">
              <Input
                type="number"
                label="Request Timeout (ms)"
                value={localRequest.timeout.toString()}
                onChange={(e) => handleFieldChange('timeout', parseInt(e.target.value) || 30000)}
                min={1000}
                max={300000}
                helpText="Timeout between 1 second (1000ms) and 5 minutes (300000ms)"
              />
            </div>
          </div>
        )}
        
        {activeTab === 'notes' && (
          <div className="p-4">
            <textarea
              className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              placeholder="Add notes about this request..."
              value={localRequest.notes}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  )
}