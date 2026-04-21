import React, { useState } from 'react'
import { Environment } from '../../types'
import { Button } from '../Common/Button'
import { Select } from '../Common/Select'
import { Modal } from '../Common/Modal'
import { EnvironmentEditor } from './EnvironmentEditor'
import { useEnvironments } from '../../hooks/useEnvironments'
import { useToast } from '../../contexts/ToastContext'

export function EnvironmentSelector() {
  const [showEditor, setShowEditor] = useState(false)
  const [editingEnvironment, setEditingEnvironment] = useState<Environment | null>(null)
  
  const { environments, activeEnvironment, setActive, createEnvironment } = useEnvironments()
  const { success } = useToast()

  const environmentOptions = [
    { value: '', label: 'No Environment' },
    ...environments.map(env => ({ value: env.id, label: env.name }))
  ]

  const handleEnvironmentChange = async (environmentId: string) => {
    const environment = environments.find(env => env.id === environmentId) || null
    await setActive(environment)
    if (environment) {
      success(`Switched to ${environment.name} environment`)
    }
  }

  const handleCreateEnvironment = async () => {
    const newEnv = await createEnvironment('New Environment')
    setEditingEnvironment(newEnv)
    setShowEditor(true)
  }

  const handleEditEnvironment = () => {
    if (activeEnvironment) {
      setEditingEnvironment(activeEnvironment)
      setShowEditor(true)
    }
  }

  const handleCloseEditor = () => {
    setShowEditor(false)
    setEditingEnvironment(null)
  }

  return (
    <>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
          </svg>
          <span>Environment:</span>
        </div>

        <Select
          value={activeEnvironment?.id || ''}
          onChange={(e) => handleEnvironmentChange(e.target.value)}
          options={environmentOptions}
          className="w-48"
        />

        {activeEnvironment && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditEnvironment}
            title="Edit environment"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleCreateEnvironment}
          title="Create new environment"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Button>
      </div>

      {/* Environment Editor Modal */}
      <Modal
        isOpen={showEditor}
        onClose={handleCloseEditor}
        title={editingEnvironment ? `Edit ${editingEnvironment.name}` : 'New Environment'}
        size="lg"
      >
        {editingEnvironment && (
          <EnvironmentEditor
            environment={editingEnvironment}
            onSave={handleCloseEditor}
            onCancel={handleCloseEditor}
          />
        )}
      </Modal>
    </>
  )
}