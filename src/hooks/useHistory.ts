import { useState, useEffect } from 'react'
import { RunHistoryItem } from '../types'
import { store } from '../storage/store'

export function useHistory() {
  const [history, setHistory] = useState<RunHistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<RunHistoryItem | null>(null)

  useEffect(() => {
    loadHistory()
  }, [])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const data = await store.getHistory()
      setHistory(data)
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToHistory = async (item: RunHistoryItem) => {
    await store.addHistoryItem(item)
    setHistory(prev => [item, ...prev.slice(0, 99)]) // Keep only 100 items
  }

  const clearHistory = async () => {
    await store.clearHistory()
    setHistory([])
    setSelectedHistoryItem(null)
  }

  const selectHistoryItem = (item: RunHistoryItem | null) => {
    setSelectedHistoryItem(item)
  }

  const getHistoryByRequest = (requestId: string): RunHistoryItem[] => {
    return history.filter(item => item.requestId === requestId)
  }

  const getRecentHistory = (limit: number = 10): RunHistoryItem[] => {
    return history.slice(0, limit)
  }

  const getHistoryStats = () => {
    const total = history.length
    const successful = history.filter(item => 
      item.statusCode !== null && item.statusCode >= 200 && item.statusCode < 300
    ).length
    const failed = history.filter(item => 
      (item.statusCode !== null && item.statusCode >= 400) || !!item.error
    ).length

    return {
      total,
      successful,
      failed,
      successRate: total > 0 ? Math.round((successful / total) * 100) : 0
    }
  }

  const filterHistory = (filters: {
    requestId?: string
    method?: string
    status?: 'success' | 'error'
    dateRange?: { start: Date; end: Date }
  }): RunHistoryItem[] => {
    let filtered = [...history]

    if (filters.requestId) {
      filtered = filtered.filter(item => item.requestId === filters.requestId)
    }

    if (filters.method) {
      filtered = filtered.filter(item => item.method === filters.method)
    }

    if (filters.status) {
      if (filters.status === 'success') {
        filtered = filtered.filter(item => 
          item.statusCode !== null && item.statusCode >= 200 && item.statusCode < 300 && !item.error
        )
      } else if (filters.status === 'error') {
        filtered = filtered.filter(item => 
          (item.statusCode !== null && item.statusCode >= 400) || !!item.error
        )
      }
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange
      filtered = filtered.filter(item => {
        const itemDate = new Date(item.timestamp)
        return itemDate >= start && itemDate <= end
      })
    }

    return filtered
  }

  return {
    history,
    selectedHistoryItem,
    loading,
    addToHistory,
    clearHistory,
    selectHistoryItem,
    getHistoryByRequest,
    getRecentHistory,
    getHistoryStats,
    filterHistory,
    refresh: loadHistory
  }
}