import React, { useState } from 'react'
import { Collection, SavedRequest } from '../../types'
import { RequestItem } from './RequestItem'
import { classNames } from '../../utils/helpers'

interface CollectionItemProps {
  collection: Collection
  requests: SavedRequest[]
  isExpanded: boolean
  selectedRequest: SavedRequest | null
  onToggleExpand: () => void
  onSelectRequest: (request: SavedRequest) => void
  onDeleteRequest: (requestId: string) => void
  onDuplicateRequest: (requestId: string) => void
  onToggleFavorite: (requestId: string) => void
  onMoveToCollection: (requestId: string, collectionId: string | null) => void
  allCollections: Collection[]
}

export function CollectionItem({
  collection,
  requests,
  isExpanded,
  selectedRequest,
  onToggleExpand,
  onSelectRequest,
  onDeleteRequest,
  onDuplicateRequest,
  onToggleFavorite,
  onMoveToCollection,
  allCollections
}: CollectionItemProps) {
  const [showContextMenu, setShowContextMenu] = useState(false)

  return (
    <div className="px-4 py-1">
      <div
        className={classNames(
          'flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition-colors',
          'hover:bg-gray-100 dark:hover:bg-gray-700'
        )}
        onClick={onToggleExpand}
        onContextMenu={(e) => {
          e.preventDefault()
          setShowContextMenu(true)
        }}
      >
        <div className="flex items-center space-x-2 flex-1">
          <svg
            className={classNames(
              'w-4 h-4 text-gray-400 transform transition-transform',
              isExpanded ? 'rotate-90' : ''
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
            {collection.name}
          </span>
        </div>
        
        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 dark:text-gray-400 px-2 py-1 rounded-full">
          {requests.length}
        </span>
      </div>

      {isExpanded && (
        <div className="ml-6 mt-1 space-y-1">
          {requests.map(request => (
            <RequestItem
              key={request.id}
              request={request}
              isSelected={selectedRequest?.id === request.id}
              onSelect={onSelectRequest}
              onDelete={onDeleteRequest}
              onDuplicate={onDuplicateRequest}
              onToggleFavorite={onToggleFavorite}
              onMoveToCollection={onMoveToCollection}
              collections={allCollections}
            />
          ))}
          
          {requests.length === 0 && (
            <div className="text-xs text-gray-400 dark:text-gray-500 py-2 px-2">
              No requests in this collection
            </div>
          )}
        </div>
      )}
    </div>
  )
}