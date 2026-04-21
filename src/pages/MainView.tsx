import React, { useState, useEffect } from 'react'
import { SavedRequest, RunResult } from '../types'
import { Sidebar } from '../components/Sidebar/Sidebar'
import { RequestEditor } from '../components/RequestEditor/RequestEditor'
import { ResponseViewer } from '../components/ResponseViewer/ResponseViewer'
import { HistoryPanel } from '../components/HistoryPanel/HistoryPanel'
import { EnvironmentSelector } from '../components/Environments/EnvironmentSelector'
import { Button } from '../components/Common/Button'
import { useRequests } from '../hooks/useRequests'
import { useSettings } from '../hooks/useSettings'

interface MainViewProps {
  onNavigateToSettings: () => void
}

export function MainView({ onNavigateToSettings }: MainViewProps) {
  const [selectedRequest, setSelectedRequest] = useState<SavedRequest | null>(null)
  const [currentResponse, setCurrentResponse] = useState<RunResult | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  
  const { requests, createRequest } = useRequests()
  const { settings } = useSettings()

  // Auto-select first request if none selected
  useEffect(() => {
    if (!selectedRequest && requests.length > 0) {
      setSelectedRequest(requests[0])
    }
  }, [requests, selectedRequest])

  const handleCreateRequest = async () => {
    const newRequest = await createRequest()
    setSelectedRequest(newRequest)
    setCurrentResponse(null)
  }

  const handleRequestChange = (updatedRequest: SavedRequest) => {
    setSelectedRequest(updatedRequest)
  }

  const handleResponse = (result: RunResult) => {
    setCurrentResponse(result)
    setIsRunning(false)
  }

  const handleRetryRequest = () => {
    // Trigger re-run by clearing and setting response
    setCurrentResponse(null)
    setIsRunning(true)
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
      {/* Top Bar */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Request Runner
            </h1>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
            
            <EnvironmentSelector />
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className={showHistory ? 'bg-gray-100 dark:bg-gray-700' : ''}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onNavigateToSettings}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          selectedRequest={selectedRequest}
          onSelectRequest={setSelectedRequest}
          onCreateRequest={handleCreateRequest}
          className="w-80 flex-shrink-0"
        />

        {/* Main Panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Request Editor */}
          <div className="flex-1 min-h-0">
            <RequestEditor
              request={selectedRequest}
              onResponse={handleResponse}
              onRequestChange={handleRequestChange}
            />
          </div>

          {/* Response Viewer */}
          <div className="flex-1 min-h-0 border-t dark:border-gray-700">
            <ResponseViewer
              result={currentResponse}
              isLoading={isRunning}
              onRetry={selectedRequest ? handleRetryRequest : undefined}
            />
          </div>
        </div>

        {/* History Panel */}
        {showHistory && (
          <div className="w-80 flex-shrink-0 border-l dark:border-gray-700">
            <HistoryPanel
              selectedRequest={selectedRequest}
              onSelectRequest={setSelectedRequest}
              onClose={() => setShowHistory(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}