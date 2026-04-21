import { useState, useEffect } from 'react'
import { Environment, KeyValuePair } from '../types'
import { store } from '../storage/store'
import { v4 as uuidv4 } from 'uuid'

export function useEnvironments() {
  const [environments, setEnvironments] = useState<Environment[]>([])
  const [activeEnvironment, setActiveEnvironment] = useState<Environment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEnvironments()
  }, [])

  const loadEnvironments = async () => {
    try {
      setLoading(true)
      const [envData, settings] = await Promise.all([
        store.getEnvironments(),
        store.getSettings()
      ])
      
      setEnvironments(envData)
      
      // Set active environment
      if (settings.activeEnvironmentId) {
        const active = envData.find(env => env.id === settings.activeEnvironmentId)
        setActiveEnvironment(active || null)
      }
    } catch (error) {
      console.error('Failed to load environments:', error)
    } finally {
      setLoading(false)
    }
  }

  const createEnvironment = async (name: string): Promise<Environment> => {
    const newEnvironment: Environment = {
      id: uuidv4(),
      name,
      variables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await store.saveEnvironment(newEnvironment)
    setEnvironments(prev => [...prev, newEnvironment])
    return newEnvironment
  }

  const updateEnvironment = async (id: string, updates: Partial<Environment>) => {
    const environment = environments.find(e => e.id === id)
    if (!environment) return

    const updatedEnvironment = {
      ...environment,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await store.saveEnvironment(updatedEnvironment)
    setEnvironments(prev => prev.map(e => e.id === id ? updatedEnvironment : e))
    
    // Update active environment if it's the one being modified
    if (activeEnvironment?.id === id) {
      setActiveEnvironment(updatedEnvironment)
    }
    
    return updatedEnvironment
  }

  const deleteEnvironment = async (id: string) => {
    await store.deleteEnvironment(id)
    setEnvironments(prev => prev.filter(e => e.id !== id))
    
    // Clear active environment if it was deleted
    if (activeEnvironment?.id === id) {
      setActiveEnvironment(null)
      const settings = await store.getSettings()
      await store.saveSettings({ ...settings, activeEnvironmentId: null })
    }
  }

  const setActive = async (environment: Environment | null) => {
    setActiveEnvironment(environment)
    const settings = await store.getSettings()
    await store.saveSettings({ 
      ...settings, 
      activeEnvironmentId: environment?.id || null 
    })
  }

  // Variable management helpers
  const addVariable = (environment: Environment): KeyValuePair[] => {
    return [
      ...environment.variables,
      { id: uuidv4(), key: '', value: '', enabled: true }
    ]
  }

  const updateVariable = (
    environment: Environment,
    variableId: string,
    updates: Partial<KeyValuePair>
  ): KeyValuePair[] => {
    return environment.variables.map(variable =>
      variable.id === variableId ? { ...variable, ...updates } : variable
    )
  }

  const removeVariable = (environment: Environment, variableId: string): KeyValuePair[] => {
    return environment.variables.filter(variable => variable.id !== variableId)
  }

  const duplicateEnvironment = async (id: string): Promise<Environment | null> => {
    const environment = environments.find(e => e.id === id)
    if (!environment) return null

    const duplicated: Environment = {
      ...environment,
      id: uuidv4(),
      name: `${environment.name} (Copy)`,
      variables: environment.variables.map(v => ({ ...v, id: uuidv4() })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await store.saveEnvironment(duplicated)
    setEnvironments(prev => [...prev, duplicated])
    return duplicated
  }

  const resolveVariables = (text: string): string => {
    if (!activeEnvironment) return text

    let resolved = text
    activeEnvironment.variables.forEach(variable => {
      if (variable.enabled && variable.key && variable.value) {
        const regex = new RegExp(`{{\\s*${variable.key}\\s*}}`, 'g')
        resolved = resolved.replace(regex, variable.value)
      }
    })

    return resolved
  }

  const getVariableValue = (key: string): string | null => {
    if (!activeEnvironment) return null

    const variable = activeEnvironment.variables.find(
      v => v.enabled && v.key === key
    )
    return variable?.value || null
  }

  return {
    environments,
    activeEnvironment,
    loading,
    createEnvironment,
    updateEnvironment,
    deleteEnvironment,
    duplicateEnvironment,
    setActive,
    addVariable,
    updateVariable,
    removeVariable,
    resolveVariables,
    getVariableValue,
    refresh: loadEnvironments
  }
}