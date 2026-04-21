import { Collection, SavedRequest, Environment, HeaderTemplate, RunHistoryItem, AppSettings } from '../types'
import { store } from '../storage/store'
import { downloadJson, uploadJson, sanitizeFilename } from './helpers'

export class ExportImport {
  static async exportAll(options: { 
    includePinHash?: boolean
    includeHistory?: boolean 
  } = {}): Promise<void> {
    try {
      const [collections, requests, environments, templates, history, settings] = await Promise.all([
        store.getCollections(),
        store.getRequests(), 
        store.getEnvironments(),
        store.getHeaderTemplates(),
        options.includeHistory ? store.getHistory() : Promise.resolve([]),
        store.getSettings()
      ])

      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        metadata: {
          totalCollections: collections.length,
          totalRequests: requests.length,
          totalEnvironments: environments.length,
          totalTemplates: templates.length,
          totalHistory: history.length
        },
        collections,
        requests,
        environments,
        templates,
        ...(options.includeHistory && { history }),
        settings: {
          ...settings,
          ...(options.includePinHash ? {} : { pinHash: null, pinEnabled: false })
        }
      }

      const filename = `request-runner-export-${new Date().toISOString().split('T')[0]}`
      downloadJson(exportData, filename)
    } catch (error) {
      console.error('Export failed:', error)
      throw new Error('Failed to export data')
    }
  }

  static async exportCollection(collectionId: string): Promise<void> {
    try {
      const [collections, requests] = await Promise.all([
        store.getCollections(),
        store.getRequests()
      ])

      const collection = collections.find(c => c.id === collectionId)
      if (!collection) {
        throw new Error('Collection not found')
      }

      const collectionRequests = requests.filter(r => r.collectionId === collectionId)

      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        type: 'collection',
        collection,
        requests: collectionRequests
      }

      const filename = `collection-${sanitizeFilename(collection.name)}`
      downloadJson(exportData, filename)
    } catch (error) {
      console.error('Collection export failed:', error)
      throw new Error('Failed to export collection')
    }
  }

  static async exportRequest(requestId: string): Promise<void> {
    try {
      const requests = await store.getRequests()
      const request = requests.find(r => r.id === requestId)
      
      if (!request) {
        throw new Error('Request not found')
      }

      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        type: 'request',
        request
      }

      const filename = `request-${sanitizeFilename(request.name)}`
      downloadJson(exportData, filename)
    } catch (error) {
      console.error('Request export failed:', error)
      throw new Error('Failed to export request')
    }
  }

  static async exportEnvironments(): Promise<void> {
    try {
      const environments = await store.getEnvironments()

      const exportData = {
        version: '1.0.0',
        exportedAt: new Date().toISOString(),
        type: 'environments',
        environments
      }

      const filename = 'request-runner-environments'
      downloadJson(exportData, filename)
    } catch (error) {
      console.error('Environments export failed:', error)
      throw new Error('Failed to export environments')
    }
  }

  static async importData(options: { 
    merge?: boolean
    skipValidation?: boolean 
  } = {}): Promise<{
    success: boolean
    imported: {
      collections: number
      requests: number
      environments: number
      templates: number
      history: number
    }
    errors: string[]
  }> {
    try {
      const data = await uploadJson()
      
      // Validate import data
      if (!options.skipValidation) {
        const validationErrors = this.validateImportData(data)
        if (validationErrors.length > 0) {
          return {
            success: false,
            imported: { collections: 0, requests: 0, environments: 0, templates: 0, history: 0 },
            errors: validationErrors
          }
        }
      }

      const imported = {
        collections: 0,
        requests: 0,
        environments: 0,
        templates: 0,
        history: 0
      }

      // Clear existing data if not merging
      if (!options.merge) {
        await store.clearAll()
      }

      // Import collections
      if (data.collections && Array.isArray(data.collections)) {
        for (const collection of data.collections) {
          await store.saveCollection(collection)
          imported.collections++
        }
      }

      // Import single collection (from collection export)
      if (data.type === 'collection' && data.collection) {
        await store.saveCollection(data.collection)
        imported.collections++
      }

      // Import requests
      if (data.requests && Array.isArray(data.requests)) {
        for (const request of data.requests) {
          await store.saveRequest(request)
          imported.requests++
        }
      }

      // Import single request (from request export)
      if (data.type === 'request' && data.request) {
        await store.saveRequest(data.request)
        imported.requests++
      }

      // Import environments
      if (data.environments && Array.isArray(data.environments)) {
        for (const environment of data.environments) {
          await store.saveEnvironment(environment)
          imported.environments++
        }
      }

      // Import templates
      if (data.templates && Array.isArray(data.templates)) {
        for (const template of data.templates) {
          await store.saveHeaderTemplate(template)
          imported.templates++
        }
      }

      // Import history
      if (data.history && Array.isArray(data.history)) {
        for (const item of data.history) {
          await store.addHistoryItem(item)
          imported.history++
        }
      }

      // Import settings (only if not merging and settings exist)
      if (!options.merge && data.settings) {
        const importedSettings = { 
          ...data.settings,
          // Security: don't import PIN settings
          pinHash: null,
          pinEnabled: false
        }
        await store.saveSettings(importedSettings)
      }

      return {
        success: true,
        imported,
        errors: []
      }
    } catch (error: any) {
      console.error('Import failed:', error)
      return {
        success: false,
        imported: { collections: 0, requests: 0, environments: 0, templates: 0, history: 0 },
        errors: [error.message || 'Import failed']
      }
    }
  }

  private static validateImportData(data: any): string[] {
    const errors: string[] = []

    if (!data || typeof data !== 'object') {
      errors.push('Invalid file format')
      return errors
    }

    // Check version compatibility
    if (data.version && data.version !== '1.0.0') {
      errors.push('Unsupported file version')
    }

    // Validate structure based on type
    if (data.type === 'collection') {
      if (!data.collection || !data.collection.id || !data.collection.name) {
        errors.push('Invalid collection data')
      }
      if (data.requests && !Array.isArray(data.requests)) {
        errors.push('Invalid requests data in collection')
      }
    } else if (data.type === 'request') {
      if (!data.request || !data.request.id || !data.request.name) {
        errors.push('Invalid request data')
      }
    } else if (data.type === 'environments') {
      if (!data.environments || !Array.isArray(data.environments)) {
        errors.push('Invalid environments data')
      }
    } else {
      // Full export validation
      const requiredArrays = ['collections', 'requests', 'environments']
      requiredArrays.forEach(field => {
        if (data[field] && !Array.isArray(data[field])) {
          errors.push(`Invalid ${field} format`)
        }
      })
    }

    return errors
  }

  static async createBackup(): Promise<void> {
    try {
      await this.exportAll({ 
        includePinHash: false, 
        includeHistory: true 
      })
    } catch (error) {
      console.error('Backup creation failed:', error)
      throw new Error('Failed to create backup')
    }
  }

  static async restoreFromBackup(): Promise<boolean> {
    try {
      const result = await this.importData({ merge: false })
      return result.success
    } catch (error) {
      console.error('Restore failed:', error)
      return false
    }
  }

  static convertToPostman(data: any): any {
    // Basic Postman collection conversion
    // This is a simplified conversion - full Postman compatibility would require more work
    
    const postmanCollection = {
      info: {
        name: 'Request Runner Export',
        description: `Exported from Request Runner on ${new Date().toISOString()}`,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [] as any[]
    }

    if (data.collections && data.requests) {
      data.collections.forEach((collection: Collection) => {
        const collectionRequests = data.requests.filter((r: SavedRequest) => 
          r.collectionId === collection.id
        )

        const postmanFolder = {
          name: collection.name,
          description: collection.description,
          item: collectionRequests.map((request: SavedRequest) => ({
            name: request.name,
            request: {
              method: request.method,
              header: request.headers
                .filter(h => h.enabled)
                .map(h => ({ key: h.key, value: h.value })),
              url: {
                raw: request.url,
                query: request.queryParams
                  .filter(p => p.enabled)
                  .map(p => ({ key: p.key, value: p.value }))
              },
              body: request.bodyType !== 'none' ? {
                mode: request.bodyType === 'json' ? 'raw' : request.bodyType,
                raw: request.body
              } : undefined
            }
          }))
        }

        postmanCollection.item.push(postmanFolder)
      })
    }

    return postmanCollection
  }
}