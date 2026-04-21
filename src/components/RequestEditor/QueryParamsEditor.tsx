import React from 'react'
import { KeyValuePair } from '../../types'
import { Button } from '../Common/Button'
import { Input } from '../Common/Input'
import { v4 as uuidv4 } from 'uuid'

interface QueryParamsEditorProps {
  queryParams: KeyValuePair[]
  onChange: (params: KeyValuePair[]) => void
}

export function QueryParamsEditor({ queryParams, onChange }: QueryParamsEditorProps) {
  const addParam = () => {
    const newParam: KeyValuePair = {
      id: uuidv4(),
      key: '',
      value: '',
      enabled: true
    }
    onChange([...queryParams, newParam])
  }

  const updateParam = (id: string, updates: Partial<KeyValuePair>) => {
    onChange(queryParams.map(param => 
      param.id === id ? { ...param, ...updates } : param
    ))
  }

  const removeParam = (id: string) => {
    onChange(queryParams.filter(param => param.id !== id))
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Query Parameters
        </h3>
        <Button size="sm" onClick={addParam}>
          Add Parameter
        </Button>
      </div>

      <div className="space-y-2">
        {queryParams.map((param, index) => (
          <div key={param.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
            <input
              type="checkbox"
              checked={param.enabled}
              onChange={(e) => updateParam(param.id, { enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            
            <Input
              placeholder="Key"
              value={param.key}
              onChange={(e) => updateParam(param.id, { key: e.target.value })}
              className="flex-1"
            />
            
            <Input
              placeholder="Value"
              value={param.value}
              onChange={(e) => updateParam(param.id, { value: e.target.value })}
              className="flex-1"
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeParam(param.id)}
              className="text-red-600 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        ))}

        {queryParams.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No query parameters</p>
            <p className="text-sm">Click "Add Parameter" to get started</p>
          </div>
        )}
      </div>

      {queryParams.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            Query String Preview:
          </h4>
          <code className="text-sm text-blue-800 dark:text-blue-200">
            {queryParams
              .filter(p => p.enabled && p.key)
              .map(p => `${encodeURIComponent(p.key)}=${encodeURIComponent(p.value || '')}`)
              .join('&') || '(none)'}
          </code>
        </div>
      )}
    </div>
  )
}