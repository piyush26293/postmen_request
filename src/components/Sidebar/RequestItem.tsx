import React, { useState } from 'react'
import { SavedRequest, Collection } from '../../types'
import { classNames } from '../../utils/helpers'
import { RequestRunner } from '../../services/requestRunner'

interface RequestItemProps {
  request: SavedRequest
  isSelected: boolean
  onSelect: (request: SavedRequest) => void
  onDelete: (requestId: string) => void
  onDuplicate: (requestId: string) => void
  onToggleFavorite: (requestId: string) => void
  onMoveToCollection: (requestId: string, collectionId: string | null) => void
  collections: Collection[]
}

export function RequestItem({
  request,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleFavorite,
  onMoveToCollection,
  collections
}: RequestItemProps) {
  const [showContextMenu, setShowContextMenu] = useState(false)

  const methodColors = RequestRunner.getMethodColor(request.method)

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setShowContextMenu(true)
  }

  return (
    <div className="relative">
      <div
        className={classNames(
          'flex items-center justify-between px-2 py-2 rounded-md cursor-pointer transition-colors group',
          isSelected
            ? 'bg-blue-50 border border-blue-200 dark:bg-blue-900/30 dark:border-blue-700'
            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        )}
        onClick={() => onSelect(request)}
        onContextMenu={handleContextMenu}
      >
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <span
            className={classNames(
              'px-2 py-1 text-xs font-medium rounded',
              methodColors
            )}
          >
            {request.method}
          </span>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {request.name}
              </span>
              {request.favorite && (
                <svg className="w-3 h-3 text-yellow-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {request.url || 'No URL'}
            </div>
          </div>
        </div>

        {/* Context Menu Button */}
        <button
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity"
          onClick={handleContextMenu}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>

      {/* Context Menu */}
      {showContextMenu && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowContextMenu(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-1 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg py-1">
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              onClick={() => {
                onDuplicate(request.id)
                setShowContextMenu(false)
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Duplicate</span>
            </button>

            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              onClick={() => {
                onToggleFavorite(request.id)
                setShowContextMenu(false)
              }}
            >
              {request.favorite ? (
                <>
                  <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  <span>Remove from favorites</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                  <span>Add to favorites</span>
                </>
              )}
            </button>

            {/* Move to Collection submenu */}
            <div className="relative group">
              <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <span>Move to collection</span>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="absolute left-full top-0 w-48 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => {
                    onMoveToCollection(request.id, null)
                    setShowContextMenu(false)
                  }}
                >
                  Uncategorized
                </button>
                {collections.map(collection => (
                  <button
                    key={collection.id}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => {
                      onMoveToCollection(request.id, collection.id)
                      setShowContextMenu(false)
                    }}
                  >
                    {collection.name}
                  </button>
                ))}
              </div>
            </div>

            <hr className="my-1 border-gray-200 dark:border-gray-600" />

            <button
              className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              onClick={() => {
                onDelete(request.id)
                setShowContextMenu(false)
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}