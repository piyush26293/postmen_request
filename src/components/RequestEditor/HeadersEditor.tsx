import React, { useState } from 'react'
import { KeyValuePair, HeaderTemplate } from '../../types'
import { Button } from '../Common/Button'
import { Input } from '../Common/Input'
import { Select } from '../Common/Select'
import { Modal } from '../Common/Modal'
import { v4 as uuidv4 } from 'uuid'
import { store } from '../../storage/store'
import { useToast } from '../../contexts/ToastContext'

interface HeadersEditorProps {
  headers: KeyValuePair[]
  onChange: (headers: KeyValuePair[]) => void
}

export function HeadersEditor({ headers, onChange }: HeadersEditorProps) {
  const [templates, setTemplates] = useState<HeaderTemplate[]>([])
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [newTemplateName, setNewTemplateName] = useState('')
  const { success, error } = useToast()

  React.useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const data = await store.getHeaderTemplates()
      setTemplates(data)
    } catch (err) {
      console.error('Failed to load header templates:', err)
    }
  }

  const addHeader = () => {
    const newHeader: KeyValuePair = {
      id: uuidv4(),
      key: '',
      value: '',
      enabled: true
    }
    onChange([...headers, newHeader])
  }

  const updateHeader = (id: string, updates: Partial<KeyValuePair>) => {
    onChange(headers.map(header => 
      header.id === id ? { ...header, ...updates } : header
    ))
  }

  const removeHeader = (id: string) => {
    onChange(headers.filter(header => header.id !== id))
  }

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (!template) return

    const newHeaders = template.headers.map(header => ({
      ...header,
      id: uuidv4() // Generate new IDs
    }))

    onChange([...headers, ...newHeaders])
    success('Template applied successfully')
  }

  const saveAsTemplate = async () => {
    if (!newTemplateName.trim()) {
      error('Template name is required')
      return
    }

    const enabledHeaders = headers.filter(h => h.enabled && h.key.trim())
    if (enabledHeaders.length === 0) {
      error('No headers to save as template')
      return
    }

    try {
      const template: HeaderTemplate = {
        id: uuidv4(),
        name: newTemplateName.trim(),
        headers: enabledHeaders.map(h => ({ ...h, id: uuidv4() })),
        createdAt: new Date().toISOString()
      }

      await store.saveHeaderTemplate(template)
      await loadTemplates()
      setShowTemplateModal(false)
      setNewTemplateName('')
      success('Template saved successfully')
    } catch (err) {
      error('Failed to save template')
    }
  }

  const commonHeaders = [
    'Accept',
    'Authorization',
    'Content-Type',
    'User-Agent',
    'X-API-Key',
    'X-Requested-With'
  ]

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Headers
        </h3>
        <div className="flex space-x-2">
          {templates.length > 0 && (
            <Select
              value=""
              onChange={(e) => e.target.value && applyTemplate(e.target.value)}
              options={[
                { value: '', label: 'Apply template...' },
                ...templates.map(t => ({ value: t.id, label: t.name }))
              ]}
              className="w-40"
            />
          )}
          <Button size="sm" variant="ghost" onClick={() => setShowTemplateModal(true)}>
            Save Template
          </Button>
          <Button size="sm" onClick={addHeader}>
            Add Header
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {headers.map((header, index) => (
          <div key={header.id} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
            <input
              type="checkbox"
              checked={header.enabled}
              onChange={(e) => updateHeader(header.id, { enabled: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            
            <div className="flex-1">
              <input
                list={`headers-${index}`}
                placeholder="Header name"
                value={header.key}
                onChange={(e) => updateHeader(header.id, { key: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
              <datalist id={`headers-${index}`}>
                {commonHeaders.map(name => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
            
            <Input
              placeholder="Value"
              value={header.value}
              onChange={(e) => updateHeader(header.id, { value: e.target.value })}
              className="flex-1"
            />
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeHeader(header.id)}
              className="text-red-600 hover:text-red-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          </div>
        ))}

        {headers.length === 0 && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>No headers</p>
            <p className="text-sm">Click "Add Header" to get started</p>
          </div>
        )}
      </div>

      {headers.some(h => h.enabled && h.key) && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            Active Headers:
          </h4>
          <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
            {headers
              .filter(h => h.enabled && h.key)
              .map(h => (
                <div key={h.id} className="font-mono">
                  <span className="font-medium">{h.key}:</span> {h.value || '(empty)'}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      <Modal
        isOpen={showTemplateModal}
        onClose={() => {
          setShowTemplateModal(false)
          setNewTemplateName('')
        }}
        title="Save Header Template"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Template Name"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            placeholder="Enter template name"
            autoFocus
          />
          
          <div className="text-sm text-gray-600 dark:text-gray-400">
            This will save {headers.filter(h => h.enabled && h.key.trim()).length} enabled headers as a reusable template.
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowTemplateModal(false)
                setNewTemplateName('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={saveAsTemplate}>
              Save Template
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}