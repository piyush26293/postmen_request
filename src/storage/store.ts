import { 
  Collection, 
  SavedRequest, 
  Environment, 
  HeaderTemplate, 
  RunHistoryItem, 
  AppSettings 
} from '../types'

class Store {
  // Collections
  async getCollections(): Promise<Collection[]> {
    return await window.electronAPI.store.get('collections') || []
  }

  async saveCollection(collection: Collection): Promise<void> {
    const collections = await this.getCollections()
    const index = collections.findIndex(c => c.id === collection.id)
    if (index >= 0) {
      collections[index] = collection
    } else {
      collections.push(collection)
    }
    await window.electronAPI.store.set('collections', collections)
  }

  async deleteCollection(id: string): Promise<void> {
    const collections = await this.getCollections()
    const filtered = collections.filter(c => c.id !== id)
    await window.electronAPI.store.set('collections', filtered)
  }

  // Requests
  async getRequests(): Promise<SavedRequest[]> {
    return await window.electronAPI.store.get('requests') || []
  }

  async saveRequest(request: SavedRequest): Promise<void> {
    const requests = await this.getRequests()
    const index = requests.findIndex(r => r.id === request.id)
    if (index >= 0) {
      requests[index] = request
    } else {
      requests.push(request)
    }
    await window.electronAPI.store.set('requests', requests)
  }

  async deleteRequest(id: string): Promise<void> {
    const requests = await this.getRequests()
    const filtered = requests.filter(r => r.id !== id)
    await window.electronAPI.store.set('requests', filtered)
  }

  // Environments
  async getEnvironments(): Promise<Environment[]> {
    return await window.electronAPI.store.get('environments') || []
  }

  async saveEnvironment(environment: Environment): Promise<void> {
    const environments = await this.getEnvironments()
    const index = environments.findIndex(e => e.id === environment.id)
    if (index >= 0) {
      environments[index] = environment
    } else {
      environments.push(environment)
    }
    await window.electronAPI.store.set('environments', environments)
  }

  async deleteEnvironment(id: string): Promise<void> {
    const environments = await this.getEnvironments()
    const filtered = environments.filter(e => e.id !== id)
    await window.electronAPI.store.set('environments', filtered)
  }

  // Header Templates
  async getHeaderTemplates(): Promise<HeaderTemplate[]> {
    return await window.electronAPI.store.get('headerTemplates') || []
  }

  async saveHeaderTemplate(template: HeaderTemplate): Promise<void> {
    const templates = await this.getHeaderTemplates()
    const index = templates.findIndex(t => t.id === template.id)
    if (index >= 0) {
      templates[index] = template
    } else {
      templates.push(template)
    }
    await window.electronAPI.store.set('headerTemplates', templates)
  }

  async deleteHeaderTemplate(id: string): Promise<void> {
    const templates = await this.getHeaderTemplates()
    const filtered = templates.filter(t => t.id !== id)
    await window.electronAPI.store.set('headerTemplates', filtered)
  }

  // History
  async getHistory(): Promise<RunHistoryItem[]> {
    return await window.electronAPI.store.get('history') || []
  }

  async addHistoryItem(item: RunHistoryItem): Promise<void> {
    const history = await this.getHistory()
    history.unshift(item) // Add to beginning
    // Keep only last 100 items
    const trimmed = history.slice(0, 100)
    await window.electronAPI.store.set('history', trimmed)
  }

  async clearHistory(): Promise<void> {
    await window.electronAPI.store.set('history', [])
  }

  // Settings
  async getSettings(): Promise<AppSettings> {
    const defaultSettings: AppSettings = {
      theme: 'light',
      pinEnabled: false,
      pinHash: null,
      activeEnvironmentId: null,
      showSecrets: false
    }
    return await window.electronAPI.store.get('settings') || defaultSettings
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await window.electronAPI.store.set('settings', settings)
  }

  // Clear all data
  async clearAll(): Promise<void> {
    await window.electronAPI.store.clear()
  }

  // Initialize with seed data
  async initializeWithSeeds(): Promise<void> {
    const collections = await this.getCollections()
    const requests = await this.getRequests()
    const environments = await this.getEnvironments()
    const templates = await this.getHeaderTemplates()

    // Only seed if no data exists
    if (collections.length === 0 && requests.length === 0) {
      const { seedCollections, seedRequests, seedEnvironments, seedTemplates } = await import('./seeds')
      
      await window.electronAPI.store.set('collections', seedCollections)
      await window.electronAPI.store.set('requests', seedRequests)
      await window.electronAPI.store.set('environments', seedEnvironments)
      await window.electronAPI.store.set('headerTemplates', seedTemplates)
    }
  }
}

export const store = new Store()