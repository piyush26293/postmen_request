import { useState, useEffect } from 'react'
import { AppSettings } from '../types'
import { store } from '../storage/store'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>({
    theme: 'light',
    pinEnabled: false,
    pinHash: null,
    activeEnvironmentId: null,
    showSecrets: false
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await store.getSettings()
      setSettings(data)
      
      // Apply theme to document
      if (data.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates }
    
    await store.saveSettings(newSettings)
    setSettings(newSettings)
    
    // Apply theme changes immediately
    if (updates.theme !== undefined) {
      if (updates.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
    
    return newSettings
  }

  const toggleTheme = async () => {
    const newTheme = settings.theme === 'light' ? 'dark' : 'light'
    return await updateSettings({ theme: newTheme })
  }

  const toggleShowSecrets = async () => {
    return await updateSettings({ showSecrets: !settings.showSecrets })
  }

  const enablePin = async (pinHash: string) => {
    return await updateSettings({ 
      pinEnabled: true, 
      pinHash 
    })
  }

  const disablePin = async () => {
    return await updateSettings({ 
      pinEnabled: false, 
      pinHash: null 
    })
  }

  const setActiveEnvironment = async (environmentId: string | null) => {
    return await updateSettings({ activeEnvironmentId: environmentId })
  }

  const clearAllData = async () => {
    await store.clearAll()
    // Reset to default settings
    const defaultSettings: AppSettings = {
      theme: 'light',
      pinEnabled: false,
      pinHash: null,
      activeEnvironmentId: null,
      showSecrets: false
    }
    setSettings(defaultSettings)
    document.documentElement.classList.remove('dark')
  }

  const exportData = async () => {
    try {
      const [collections, requests, environments, templates, history] = await Promise.all([
        store.getCollections(),
        store.getRequests(),
        store.getEnvironments(),
        store.getHeaderTemplates(),
        store.getHistory()
      ])

      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        collections,
        requests,
        environments,
        templates,
        history,
        settings: { ...settings, pinHash: null } // Don't export PIN
      }

      return exportData
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    }
  }

  const importData = async (data: any, options: { merge?: boolean } = {}) => {
    try {
      if (!options.merge) {
        await store.clearAll()
      }

      if (data.collections) {
        for (const collection of data.collections) {
          await store.saveCollection(collection)
        }
      }

      if (data.requests) {
        for (const request of data.requests) {
          await store.saveRequest(request)
        }
      }

      if (data.environments) {
        for (const environment of data.environments) {
          await store.saveEnvironment(environment)
        }
      }

      if (data.templates) {
        for (const template of data.templates) {
          await store.saveHeaderTemplate(template)
        }
      }

      if (data.history) {
        for (const item of data.history) {
          await store.addHistoryItem(item)
        }
      }

      if (data.settings && !options.merge) {
        const importedSettings = { 
          ...data.settings, 
          pinHash: null, // Don't import PIN
          pinEnabled: false 
        }
        await updateSettings(importedSettings)
      }

    } catch (error) {
      console.error('Failed to import data:', error)
      throw error
    }
  }

  return {
    settings,
    loading,
    updateSettings,
    toggleTheme,
    toggleShowSecrets,
    enablePin,
    disablePin,
    setActiveEnvironment,
    clearAllData,
    exportData,
    importData,
    refresh: loadSettings
  }
}