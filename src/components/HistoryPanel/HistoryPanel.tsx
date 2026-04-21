import React, { useState } from 'react'
import { SavedRequest } from '../../types'
import { HistoryItem } from './HistoryItem'
import { Button } from '../Common/Button'
import { Input } from '../Common/Input'
import { Select } from '../Common/Select'
import { useHistory } from '../../hooks/useHistory'
import { useToast } from '../../contexts/ToastContext'

interface HistoryPanelProps {
  selectedRequest: SavedRequest | null
  onSelectRequest: (request: SavedRequest) => void
  onClose: () => void
}

export function HistoryPanel({ selectedRequest, onSelectRequest, onClose }: HistoryPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all')
  
  const { history, clearHistory, selectHistoryItem, selectedHistoryItem } = useHistory()
  const { success, error } = useToast()

  const filteredHistory = history.filter(item => {
    // Text search
    if (searchTerm && !item.requestName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !item.url.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }

    // Status filter
    if (statusFilter === 'success' && ((item.statusCode === null) || item.statusCode < 200 || item.statusCode >= 300 || item.error)) {
      return false
    }
    if (statusFilter === 'error' && (!item.error && item.statusCode !== null && item.statusCode >= 200 && item.statusCode < 300)) {
      return false
    }

    // Request filter (if a request is selected)
    if (selectedRequest && item.requestId !== selectedRequest.id) {
      return false
    }

    return true
  })

  const handleClearHistory = async () => {
    if (!confirm('Are you sure you want to clear all history?')) return
    
    try {
      await clearHistory()
      success('History cleared successfully')
    } catch (err) {
      error('Failed to clear history')
    }
  }

  const statusOptions = [
    { value: 'all', label: 'All Requests' },
    { value: 'success', label: 'Successful (2xx)' },
    { value: 'error', label: 'Failed (4xx, 5xx, Errors)' }
  ]

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 border-l dark:border-gray-700">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Request History
          </h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="space-y-3">
          <Input
            placeholder="Search history..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <div className="flex space-x-2">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              options={statusOptions}
              className="flex-1"
            />
            
            {history.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="text-red-600 hover:text-red-700"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        {selectedRequest && (
          <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
            <div className="text-sm text-blue-800 dark:text-blue-200">
              Showing history for: <span className="font-medium">{selectedRequest.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredHistory.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            {history.length === 0 ? (
              <>
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="mb-2">No history yet</p>
                <p className="text-sm">Your request history will appear here</p>
              </>
            ) : (
              <>
                <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="mb-2">No matching history</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {filteredHistory.map((item) => (
              <HistoryItem
                key={item.id}
                item={item}
                isSelected={selectedHistoryItem?.id === item.id}
                onSelect={selectHistoryItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      {history.length > 0 && (
        <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredHistory.length} of {history.length} requests
            {selectedRequest && (
              <span className="ml-2">
                • Filtered by "{selectedRequest.name}"
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}