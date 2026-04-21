import React from 'react'
import { BodyType } from '../../types'
import { Select } from '../Common/Select'
import { Button } from '../Common/Button'
import { isValidJson, prettifyJson } from '../../utils/helpers'
import { useToast } from '../../contexts/ToastContext'

interface BodyEditorProps {
  bodyType: BodyType
  body: string
  onBodyTypeChange: (bodyType: BodyType) => void
  onBodyChange: (body: string) => void
}

export function BodyEditor({ bodyType, body, onBodyTypeChange, onBodyChange }: BodyEditorProps) {
  const { error } = useToast()

  const bodyTypes = [
    { value: 'none' as BodyType, label: 'None' },
    { value: 'json' as BodyType, label: 'JSON' },
    { value: 'form-urlencoded' as BodyType, label: 'Form URL Encoded' },
    { value: 'raw' as BodyType, label: 'Raw Text' }
  ]

  const formatJson = () => {
    if (!body.trim()) return
    
    try {
      const formatted = prettifyJson(body)
      onBodyChange(formatted)
    } catch {
      error('Invalid JSON format')
    }
  }

  const minifyJson = () => {
    if (!body.trim()) return
    
    try {
      const parsed = JSON.parse(body)
      onBodyChange(JSON.stringify(parsed))
    } catch {
      error('Invalid JSON format')
    }
  }

  const insertTemplate = (template: string) => {
    onBodyChange(template)
  }

  const jsonTemplates = [
    {
      name: 'Empty Object',
      template: '{\n  \n}'
    },
    {
      name: 'Array',
      template: '[\n  \n]'
    },
    {
      name: 'User Object',
      template: JSON.stringify({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      }, null, 2)
    },
    {
      name: 'API Response',
      template: JSON.stringify({
        success: true,
        data: {},
        message: 'Operation completed successfully'
      }, null, 2)
    }
  ]

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Request Body
        </h3>
        <Select
          value={bodyType}
          onChange={(e) => onBodyTypeChange(e.target.value as BodyType)}
          options={bodyTypes}
          className="w-48"
        />
      </div>

      {bodyType === 'none' && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p>This request doesn't have a body</p>
        </div>
      )}

      {bodyType === 'json' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button size="sm" variant="ghost" onClick={formatJson}>
              Format JSON
            </Button>
            <Button size="sm" variant="ghost" onClick={minifyJson}>
              Minify JSON
            </Button>
            <div className="flex-1" />
            <Select
              value=""
              onChange={(e) => e.target.value && insertTemplate(e.target.value)}
              options={[
                { value: '', label: 'Insert template...' },
                ...jsonTemplates.map(t => ({ value: t.template, label: t.name }))
              ]}
              className="w-40"
            />
          </div>

          <textarea
            className="w-full h-96 p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none font-mono text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Enter JSON body..."
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
          />

          {body && !isValidJson(body) && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-red-700 dark:text-red-300">
                  Invalid JSON format
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {bodyType === 'form-urlencoded' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Enter form data as key=value pairs, one per line or separated by &
          </div>
          
          <textarea
            className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none font-mono text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
            placeholder="key1=value1&#10;key2=value2&#10;or&#10;key1=value1&key2=value2"
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
          />

          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              Content-Type Header:
            </h4>
            <code className="text-sm text-blue-800 dark:text-blue-200">
              application/x-www-form-urlencoded
            </code>
          </div>
        </div>
      )}

      {bodyType === 'raw' && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Raw text body - will be sent as-is
          </div>
          
          <textarea
            className="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-md resize-none font-mono text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
            placeholder="Enter raw text body..."
            value={body}
            onChange={(e) => onBodyChange(e.target.value)}
          />
        </div>
      )}

      {(bodyType !== 'none' && body) && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Body size: {new Blob([body]).size} bytes
          </div>
        </div>
      )}
    </div>
  )
}