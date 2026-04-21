import { useState, useEffect } from 'react'
import { SavedRequest, KeyValuePair, HttpMethod, BodyType } from '../types'
import { store } from '../storage/store'
import { v4 as uuidv4 } from 'uuid'

export function useRequests() {
  const [requests, setRequests] = useState<SavedRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
  }, [])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const data = await store.getRequests()
      setRequests(data)
    } catch (error) {
      console.error('Failed to load requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const createRequest = async (name: string = 'New Request'): Promise<SavedRequest> => {
    const newRequest: SavedRequest = {
      id: uuidv4(),
      name,
      method: 'GET',
      url: '',
      queryParams: [],
      headers: [],
      bodyType: 'none',
      body: '',
      timeout: 30000,
      collectionId: null,
      notes: '',
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await store.saveRequest(newRequest)
    setRequests(prev => [...prev, newRequest])
    return newRequest
  }

  const updateRequest = async (id: string, updates: Partial<SavedRequest>) => {
    const request = requests.find(r => r.id === id)
    if (!request) return

    const updatedRequest = {
      ...request,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await store.saveRequest(updatedRequest)
    setRequests(prev => prev.map(r => r.id === id ? updatedRequest : r))
    return updatedRequest
  }

  const duplicateRequest = async (id: string): Promise<SavedRequest | null> => {
    const request = requests.find(r => r.id === id)
    if (!request) return null

    const duplicated: SavedRequest = {
      ...request,
      id: uuidv4(),
      name: `${request.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await store.saveRequest(duplicated)
    setRequests(prev => [...prev, duplicated])
    return duplicated
  }

  const deleteRequest = async (id: string) => {
    await store.deleteRequest(id)
    setRequests(prev => prev.filter(r => r.id !== id))
  }

  const toggleFavorite = async (id: string) => {
    const request = requests.find(r => r.id === id)
    if (!request) return

    const updated = await updateRequest(id, { favorite: !request.favorite })
    return updated
  }

  const moveToCollection = async (requestId: string, collectionId: string | null) => {
    return await updateRequest(requestId, { collectionId })
  }

  // Utility functions
  const addQueryParam = (request: SavedRequest): KeyValuePair[] => {
    return [
      ...request.queryParams,
      { id: uuidv4(), key: '', value: '', enabled: true }
    ]
  }

  const addHeader = (request: SavedRequest): KeyValuePair[] => {
    return [
      ...request.headers,
      { id: uuidv4(), key: '', value: '', enabled: true }
    ]
  }

  const updateQueryParam = (
    request: SavedRequest,
    paramId: string,
    updates: Partial<KeyValuePair>
  ): KeyValuePair[] => {
    return request.queryParams.map(param =>
      param.id === paramId ? { ...param, ...updates } : param
    )
  }

  const updateHeader = (
    request: SavedRequest,
    headerId: string,
    updates: Partial<KeyValuePair>
  ): KeyValuePair[] => {
    return request.headers.map(header =>
      header.id === headerId ? { ...header, ...updates } : header
    )
  }

  const removeQueryParam = (request: SavedRequest, paramId: string): KeyValuePair[] => {
    return request.queryParams.filter(param => param.id !== paramId)
  }

  const removeHeader = (request: SavedRequest, headerId: string): KeyValuePair[] => {
    return request.headers.filter(header => header.id !== headerId)
  }

  return {
    requests,
    loading,
    createRequest,
    updateRequest,
    duplicateRequest,
    deleteRequest,
    toggleFavorite,
    moveToCollection,
    addQueryParam,
    addHeader,
    updateQueryParam,
    updateHeader,
    removeQueryParam,
    removeHeader,
    refresh: loadRequests
  }
}