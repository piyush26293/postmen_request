import React, { useState } from 'react'
import { Collection, SavedRequest } from '../../types'
import { CollectionItem } from './CollectionItem'
import { RequestItem } from './RequestItem'
import { Button } from '../Common/Button'
import { Input } from '../Common/Input'
import { useCollections } from '../../hooks/useCollections'
import { useRequests } from '../../hooks/useRequests'
import { useToast } from '../../contexts/ToastContext'
import { Modal } from '../Common/Modal'

interface SidebarProps {
  selectedRequest: SavedRequest | null
  onSelectRequest: (request: SavedRequest) => void
  onCreateRequest: () => void
  className?: string
}

export function Sidebar({ 
  selectedRequest, 
  onSelectRequest, 
  onCreateRequest,
  className = '' 
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCollections, setExpandedCollections] = useState<Set<string>>(new Set())
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  
  const { collections, createCollection } = useCollections()
  const { requests, deleteRequest, duplicateRequest, moveToCollection, toggleFavorite } = useRequests()
  const { success, error } = useToast()

  const filteredRequests = requests.filter(request =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.url.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const uncategorizedRequests = filteredRequests.filter(request => !request.collectionId)
  const favoriteRequests = filteredRequests.filter(request => request.favorite)

  const toggleCollection = (collectionId: string) => {
    const newExpanded = new Set(expandedCollections)
    if (newExpanded.has(collectionId)) {
      newExpanded.delete(collectionId)
    } else {
      newExpanded.add(collectionId)
    }
    setExpandedCollections(newExpanded)
  }

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      error('Collection name is required')
      return
    }

    try {
      await createCollection(newCollectionName.trim())
      setShowNewCollectionModal(false)
      setNewCollectionName('')
      success('Collection created successfully')
    } catch (err) {
      error('Failed to create collection')
    }
  }

  const handleDeleteRequest = async (requestId: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return
    
    try {
      await deleteRequest(requestId)
      success('Request deleted successfully')
    } catch (err) {
      error('Failed to delete request')
    }
  }

  const handleDuplicateRequest = async (requestId: string) => {
    try {
      const duplicated = await duplicateRequest(requestId)
      if (duplicated) {
        onSelectRequest(duplicated)
        success('Request duplicated successfully')
      }
    } catch (err) {
      error('Failed to duplicate request')
    }
  }

  const handleToggleFavorite = async (requestId: string) => {
    try {
      await toggleFavorite(requestId)
      success('Request favorite status updated')
    } catch (err) {
      error('Failed to update favorite status')
    }
  }

  const handleMoveToCollection = async (requestId: string, collectionId: string | null) => {
    try {
      await moveToCollection(requestId, collectionId)
      success('Request moved successfully')
    } catch (err) {
      error('Failed to move request')
    }
  }

  return (
    <div className={`flex flex-col h-full bg-white dark:bg-gray-800 border-r dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Requests
          </h2>
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowNewCollectionModal(true)}
              title="New Collection"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </Button>
            <Button size="sm" onClick={onCreateRequest}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Button>
          </div>
        </div>
        
        <Input
          placeholder="Search requests..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Request List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {/* Favorites */}
        {favoriteRequests.length > 0 && (
          <div className="px-4 py-2">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Favorites
              </span>
            </div>
            {favoriteRequests.map(request => (
              <RequestItem
                key={request.id}
                request={request}
                isSelected={selectedRequest?.id === request.id}
                onSelect={onSelectRequest}
                onDelete={handleDeleteRequest}
                onDuplicate={handleDuplicateRequest}
                onToggleFavorite={handleToggleFavorite}
                onMoveToCollection={handleMoveToCollection}
                collections={collections}
              />
            ))}
          </div>
        )}

        {/* Collections */}
        {collections.map(collection => {
          const collectionRequests = filteredRequests.filter(r => r.collectionId === collection.id)
          if (collectionRequests.length === 0 && searchTerm) return null
          
          return (
            <CollectionItem
              key={collection.id}
              collection={collection}
              requests={collectionRequests}
              isExpanded={expandedCollections.has(collection.id)}
              selectedRequest={selectedRequest}
              onToggleExpand={() => toggleCollection(collection.id)}
              onSelectRequest={onSelectRequest}
              onDeleteRequest={handleDeleteRequest}
              onDuplicateRequest={handleDuplicateRequest}
              onToggleFavorite={handleToggleFavorite}
              onMoveToCollection={handleMoveToCollection}
              allCollections={collections}
            />
          )
        })}

        {/* Uncategorized Requests */}
        {uncategorizedRequests.length > 0 && (
          <div className="px-4 py-2">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Uncategorized
              </span>
            </div>
            {uncategorizedRequests.map(request => (
              <RequestItem
                key={request.id}
                request={request}
                isSelected={selectedRequest?.id === request.id}
                onSelect={onSelectRequest}
                onDelete={handleDeleteRequest}
                onDuplicate={handleDuplicateRequest}
                onToggleFavorite={handleToggleFavorite}
                onMoveToCollection={handleMoveToCollection}
                collections={collections}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {requests.length === 0 && (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="mb-2">No requests yet</p>
            <p className="text-sm">Create your first request to get started</p>
          </div>
        )}
      </div>

      {/* New Collection Modal */}
      <Modal
        isOpen={showNewCollectionModal}
        onClose={() => {
          setShowNewCollectionModal(false)
          setNewCollectionName('')
        }}
        title="Create Collection"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Collection Name"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            placeholder="Enter collection name"
            autoFocus
          />
          
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => {
                setShowNewCollectionModal(false)
                setNewCollectionName('')
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateCollection}>
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}