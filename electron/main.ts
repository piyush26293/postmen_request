import { app, BrowserWindow, ipcMain, shell } from 'electron'
import { join } from 'path'
import Store from 'electron-store'
import axios from 'axios'

// Initialize electron-store
const store = new Store()

const isDev = process.env.NODE_ENV === 'development'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    show: false
  })

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  // Load the app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// App event handlers
app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// IPC Handlers

// Storage operations
ipcMain.handle('store:get', (_, key: string) => {
  return store.get(key)
})

ipcMain.handle('store:set', (_, key: string, value: any) => {
  store.set(key, value)
})

ipcMain.handle('store:delete', (_, key: string) => {
  store.delete(key)
})

ipcMain.handle('store:clear', () => {
  store.clear()
})

// HTTP request execution
ipcMain.handle('request:run', async (_, requestData: any) => {
  const { method, url, headers, data, timeout } = requestData
  const startTime = Date.now()
  
  try {
    const response = await axios({
      method: method.toLowerCase(),
      url,
      headers,
      data,
      timeout: timeout || 30000,
      validateStatus: () => true // Don't throw on any status code
    })
    
    const duration = Date.now() - startTime
    
    return {
      statusCode: response.status,
      statusText: response.statusText,
      duration,
      responseBody: typeof response.data === 'object' 
        ? JSON.stringify(response.data, null, 2) 
        : String(response.data),
      responseHeaders: response.headers,
      size: JSON.stringify(response.data).length,
      error: null
    }
  } catch (error: any) {
    const duration = Date.now() - startTime
    return {
      statusCode: error.response?.status || 0,
      statusText: error.response?.statusText || 'Error',
      duration,
      responseBody: error.response?.data ? JSON.stringify(error.response.data, null, 2) : '',
      responseHeaders: error.response?.headers || {},
      size: 0,
      error: error.message
    }
  }
})

// App info
ipcMain.handle('app:getVersion', () => {
  return app.getVersion()
})