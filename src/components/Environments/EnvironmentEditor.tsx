import React, { useState, useEffect } from 'react'
import { Environment, KeyValuePair } from '../../types'
import { Button } from '../Common/Button'
import { Input } from '../Common/Input'
import { useEnvironments } from '../../hooks/useEnvironments'
import { useToast } from '../../contexts/ToastContext'
import { v4 as uuidv4 } from 'uuid'
import { Validators } from '../../utils/validators'

interface EnvironmentEditorProps {
  environment: Environment
  onSave: () => void
  onCancel: () => void
}

export function EnvironmentEditor({ environment, onSave, onCancel }: EnvironmentEditorProps) {
  const [name, setName] = useState(environment.name)
  const [description, setDescription] = useState('')
  const [variables, setVariables] = useState<KeyValuePair[]>(environment.variables)
  const [errors, setErrors] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  
  const { updateEnvironment, deleteEnvironment, environments, setActive, activeEnvironment } = useEnvironments()
  const { success, error } = useToast()

  const addVariable = () => {
    const newVariable: KeyValuePair = {
      id: uuidv4(),
      key: '',
      value: '',
      enabled: true
    }
    setVariables([...variables, newVariable])
  }

  const updateVariable = (id: string, updates: Partial<KeyValuePair>) => {
    setVariables(variables.map(variable => 
      variable.id === id ? { ...variable, ...updates } : variable
    ))
  }

  const removeVariable = (id: string) => {
    setVariables(variables.filter(variable => variable.id !== id))
  }

  const duplicateVariable = (id: string) => {
    const variable = variables.find(v => v.id === id)
    if (variable) {
      const duplicate: KeyValuePair = {
        ...variable,
        id: uuidv4(),
        key: `${variable.key}_copy`
      }
      setVariables([...variables, duplicate])
    }
  }

  const validateAndSave = async () => {
    const existingNames = environments
      .filter(env => env.id !== environment.id)
      .map(env => env.name)
    
    const nameErrors = Validators.validateEnvironmentName(name, existingNames)
    const variableErrors = Validators.validateEnvironmentVariables(variables)
    
    const allErrors = [...nameErrors, ...variableErrors]
    setErrors(allErrors)
    
    if (allErrors.length > 0) {
      return
    }

    setIsSaving(true)
    try {
      await updateEnvironment(environment.id, {
        name: name.trim(),
        variables: variables.filter(v => v.key.trim()) // Remove empty variables
      })
      success('Environment saved successfully')
      onSave()
    } catch (err) {
      error('Failed to save environment')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete the "${environment.name}" environment?`)) {
      return
    }

    try {
      await deleteEnvironment(environment.id)
      success('Environment deleted successfully')
      onSave()
    } catch (err) {
      error('Failed to delete environment')
    }
  }

  const handleDuplicate = async () => {
    try {
      const newName = `${environment.name} Copy`
      const duplicatedVars = variables.map(v => ({ ...v, id: uuidv4() }))
      
      // Create through the hook which handles the update
      await updateEnvironment(uuidv4(), {
        name: newName,
        variables: duplicatedVars
      })
      success('Environment duplicated successfully')
    } catch (err) {
      error('Failed to duplicate environment')
    }
  }

  const variableCount = variables.filter(v => v.enabled && v.key.trim()).length

  return (
    <div className="space-y-6">
      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-300">
                Validation Error{errors.length > 1 ? 's' : ''}
              </h3>
              <div className="mt-2 text-sm text-red-700 dark:text-red-400">
                <ul className="list-disc pl-5 space-y-1">
                  {errors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Basic Info */}
      <div className="space-y-4">
        <Input
          label="Environment Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Development, Staging, Production"
          error={errors.find(e => e.includes('name')) ? 'Invalid name' : undefined}
        />
      </div>

      {/* Variables */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Variables ({variableCount})
          </h4>
          <Button size="sm" onClick={addVariable}>
            Add Variable
          </Button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
          {variables.map((variable, index) => (
            <div key={variable.id} className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
              <input
                type="checkbox"
                checked={variable.enabled}
                onChange={(e) => updateVariable(variable.id, { enabled: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              
              <Input
                placeholder="Variable name"
                value={variable.key}
                onChange={(e) => updateVariable(variable.id, { key: e.target.value })}
                className="flex-1"
              />
              
              <Input
                placeholder="Value"
                value={variable.value}
                onChange={(e) => updateVariable(variable.id, { value: e.target.value })}
                className="flex-1"
              />
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => duplicateVariable(variable.id)}
                title="Duplicate variable"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeVariable(variable.id)}
                className="text-red-600 hover:text-red-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            </div>
          ))}
          
          {variables.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>No variables defined</p>
              <p className="text-sm">Click "Add Variable" to create your first variable</p>
            </div>
          )}
        </div>
      </div>

      {/* Usage Info */}
      {variableCount > 0 && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md">
          <h5 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
            Usage in requests:
          </h5>
          <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
            {variables.filter(v => v.enabled && v.key.trim()).slice(0, 3).map(variable => (
              <div key={variable.id} className="font-mono">
                {`{{${variable.key}}}`} → {variable.value || '(empty)'}
              </div>
            ))}
            {variableCount > 3 && (
              <div className="text-blue-600 dark:text-blue-400">
                ... and {variableCount - 3} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
        <div className="flex space-x-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={validateAndSave} loading={isSaving}>
            Save Environment
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="ghost" onClick={handleDuplicate}>
            Duplicate
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}