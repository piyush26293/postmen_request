import { useState, useEffect } from 'react'
import { Collection } from '../types'
import { store } from '../storage/store'
import { v4 as uuidv4 } from 'uuid'

export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCollections()
  }, [])

  const loadCollections = async () => {
    try {
      setLoading(true)
      const data = await store.getCollections()
      setCollections(data)
    } catch (error) {
      console.error('Failed to load collections:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCollection = async (name: string, description: string = '') => {
    const newCollection: Collection = {
      id: uuidv4(),
      name,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await store.saveCollection(newCollection)
    setCollections(prev => [...prev, newCollection])
    return newCollection
  }

  const updateCollection = async (id: string, updates: Partial<Collection>) => {
    const collection = collections.find(c => c.id === id)
    if (!collection) return

    const updatedCollection = {
      ...collection,
      ...updates,
      updatedAt: new Date().toISOString()
    }

    await store.saveCollection(updatedCollection)
    setCollections(prev => prev.map(c => c.id === id ? updatedCollection : c))
    return updatedCollection
  }

  const deleteCollection = async (id: string) => {
    await store.deleteCollection(id)
    setCollections(prev => prev.filter(c => c.id !== id))
  }

  return {
    collections,
    loading,
    createCollection,
    updateCollection,
    deleteCollection,
    refresh: loadCollections
  }
}