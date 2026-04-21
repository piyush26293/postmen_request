import React, { useState } from 'react'
import { Button } from '../components/Common/Button'
import { Input } from '../components/Common/Input'
import { Modal } from '../components/Common/Modal'
import { useSettings } from '../hooks/useSettings'
import { useToast } from '../contexts/ToastContext'
import { ExportImport } from '../utils/exportImport'
import { Encryption } from '../services/encryption'

interface SettingsViewProps {
  onNavigateBack: () => void
}

export function SettingsView({ onNavigateBack }: SettingsViewProps) {
  const [showClearDataModal, setShowClearDataModal] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pin, setPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [currentPin, setCurrentPin] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  
  const { settings, toggleTheme, toggleShowSecrets, enablePin, disablePin, clearAllData } = useSettings()
  const { success, error, info } = useToast()

  const handleEnablePin = async () => {
    if (pin.length < 4) {
      error('PIN must be at least 4 digits')
      return
    }
    
    if (pin !== confirmPin) {
      error('PINs do not match')
      return
    }

    try {
      const pinHash = Encryption.hashPin(pin)
      await enablePin(pinHash)
      success('PIN enabled successfully')
      setShowPinModal(false)
      setPin('')
      setConfirmPin('')
    } catch (err) {
      error('Failed to enable PIN')
    }
  }

  const handleDisablePin = async () => {
    if (!currentPin) {
      error('Please enter your current PIN')
      return
    }

    if (settings.pinHash && !Encryption.validatePin(currentPin, settings.pinHash)) {
      error('Incorrect PIN')
      return
    }

    try {
      await disablePin()
      success('PIN disabled successfully')
      setCurrentPin('')
    } catch (err) {
      error('Failed to disable PIN')
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await ExportImport.exportAll({ 
        includePinHash: false, 
        includeHistory: true 
      })
      success('Data exported successfully')
    } catch (err) {
      error('Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    setIsImporting(true)
    try {
      const result = await ExportImport.importData({ merge: false })
      if (result.success) {
        success(`Imported ${result.imported.collections + result.imported.requests + result.imported.environments} items successfully`)
        // Refresh the page to load new data
        window.location.reload()
      } else {
        error(`Import failed: ${result.errors.join(', ')}`)
      }
    } catch (err) {
      error('Failed to import data')
    } finally {
      setIsImporting(false)
    }
  }

  const handleClearAllData = async () => {
    try {
      await clearAllData()
      success('All data cleared successfully')
      setShowClearDataModal(false)
      // Refresh to reset app state
      window.location.reload()
    } catch (err) {
      error('Failed to clear data')
    }
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onNavigateBack}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Requests
          </Button>
          
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Settings
          </h1>
        </div>
      </div>

      {/* Settings Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-8">
          {/* Appearance */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Appearance
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">Theme</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Choose between light and dark mode
                  </p>
                </div>
                <Button onClick={toggleTheme}>
                  {settings.theme === 'light' ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                      Switch to Dark
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      Switch to Light
                    </>
                  )}
                </Button>
              </div>
            </div>
          </section>

          {/* Security */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Security & Privacy
            </h2>
            <div className="space-y-4">
              {/* Show Secrets Toggle */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Show Secrets</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Display API keys and tokens in plain text instead of masking them
                    </p>
                  </div>
                  <Button variant={settings.showSecrets ? 'danger' : 'secondary'} onClick={toggleShowSecrets}>
                    {settings.showSecrets ? 'Hide Secrets' : 'Show Secrets'}
                  </Button>
                </div>
              </div>

              {/* PIN Lock */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">PIN Lock</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {settings.pinEnabled 
                        ? 'PIN protection is currently enabled'
                        : 'Protect your data with a PIN (coming soon)'
                      }
                    </p>
                  </div>
                  {settings.pinEnabled ? (
                    <div className="flex space-x-2">
                      <Input
                        type="password"
                        placeholder="Current PIN"
                        value={currentPin}
                        onChange={(e) => setCurrentPin(e.target.value)}
                        className="w-32"
                      />
                      <Button variant="danger" onClick={handleDisablePin}>
                        Disable PIN
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setShowPinModal(true)} disabled>
                      Enable PIN (Soon)
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Data Management */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Data Management
            </h2>
            <div className="space-y-4">
              {/* Export Data */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Export Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Download all your requests, collections, and environments as JSON
                    </p>
                  </div>
                  <Button onClick={handleExport} loading={isExporting}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Data
                  </Button>
                </div>
              </div>

              {/* Import Data */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Import Data</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Import requests and collections from JSON file (will replace existing data)
                    </p>
                  </div>
                  <Button variant="secondary" onClick={handleImport} loading={isImporting}>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                    Import Data
                  </Button>
                </div>
              </div>

              {/* Clear All Data */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-800 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-red-900 dark:text-red-300">Clear All Data</h3>
                    <p className="text-sm text-red-700 dark:text-red-400">
                      Permanently delete all requests, collections, environments, and settings
                    </p>
                  </div>
                  <Button variant="danger" onClick={() => setShowClearDataModal(true)}>
                    Clear All Data
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* About */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              About
            </h2>
            <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Request Runner</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">v1.0.0</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  A modern HTTP client built with Electron, React, and TypeScript
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                  <div>• Data is stored locally on your machine</div>
                  <div>• Tokens are obfuscated (not encrypted) in storage</div>
                  <div>• No data is sent to external servers</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Clear Data Confirmation Modal */}
      <Modal
        isOpen={showClearDataModal}
        onClose={() => setShowClearDataModal(false)}
        title="Clear All Data"
        size="sm"
      >
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            This will permanently delete all your:
            <ul className="list-disc ml-6 mt-2">
              <li>Requests and collections</li>
              <li>Environments and variables</li>
              <li>Request history</li>
              <li>Settings and preferences</li>
            </ul>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium">
              This action cannot be undone!
            </p>
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setShowClearDataModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleClearAllData}>
              Yes, Clear All Data
            </Button>
          </div>
        </div>
      </Modal>

      {/* PIN Setup Modal */}
      <Modal
        isOpen={showPinModal}
        onClose={() => {
          setShowPinModal(false)
          setPin('')
          setConfirmPin('')
        }}
        title="Enable PIN Protection"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            type="password"
            label="PIN (4+ digits)"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="Enter PIN"
          />
          <Input
            type="password"
            label="Confirm PIN"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="Confirm PIN"
          />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Your PIN will be required to access the application. Use 4-8 digits.
          </div>
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowPinModal(false)
                setPin('')
                setConfirmPin('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleEnablePin} disabled={!pin || !confirmPin}>
              Enable PIN
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}