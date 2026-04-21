import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  store: {
    get: (key: string) => ipcRenderer.invoke('store:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('store:set', key, value),
    delete: (key: string) => ipcRenderer.invoke('store:delete', key),
    clear: () => ipcRenderer.invoke('store:clear')
  },
  request: {
    run: (requestData: any) => ipcRenderer.invoke('request:run', requestData)
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion')
  }
})