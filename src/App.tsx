import React, { useState, useEffect } from 'react'
import { ToastProvider, useToast } from './contexts/ToastContext'
import { ToastContainer } from './components/Common/Toast'
import { MainView } from './pages/MainView'
import { SettingsView } from './pages/SettingsView'
import { useSettings } from './hooks/useSettings'

function AppContent() {
  const [currentView, setCurrentView] = useState<'main' | 'settings'>('main')
  const { messages, removeToast } = useToast()
  const { settings, loading } = useSettings()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading Request Runner...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      {currentView === 'main' && (
        <MainView onNavigateToSettings={() => setCurrentView('settings')} />
      )}
      {currentView === 'settings' && (
        <SettingsView onNavigateBack={() => setCurrentView('main')} />
      )}
      
      <ToastContainer messages={messages} onClose={removeToast} />
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  )
}

export default App