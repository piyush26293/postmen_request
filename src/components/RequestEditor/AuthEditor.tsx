import React, { useState } from 'react'
import { KeyValuePair, AuthType } from '../../types'
import { Button } from '../Common/Button'
import { Input } from '../Common/Input'
import { Select } from '../Common/Select'
import { v4 as uuidv4 } from 'uuid'

interface AuthEditorProps {
  headers: KeyValuePair[]
  onChange: (headers: KeyValuePair[]) => void
}

export function AuthEditor({ headers, onChange }: AuthEditorProps) {
  const [authType, setAuthType] = useState<AuthType>('none')
  const [bearerToken, setBearerToken] = useState('')
  const [apiKeyName, setApiKeyName] = useState('X-API-Key')
  const [apiKeyValue, setApiKeyValue] = useState('')

  const authTypes = [
    { value: 'none' as AuthType, label: 'No Auth' },
    { value: 'bearer' as AuthType, label: 'Bearer Token' },
    { value: 'api-key' as AuthType, label: 'API Key' },
    { value: 'custom' as AuthType, label: 'Custom (Manual)' }
  ]

  // Detect existing auth from headers
  React.useEffect(() => {
    const authHeader = headers.find(h => 
      h.enabled && h.key.toLowerCase() === 'authorization'
    )
    
    if (authHeader?.value.startsWith('Bearer ')) {
      setAuthType('bearer')
      setBearerToken(authHeader.value.replace('Bearer ', ''))
    } else {
      const apiKeyHeader = headers.find(h => 
        h.enabled && (
          h.key.toLowerCase().includes('api') || 
          h.key.toLowerCase().includes('key') ||
          h.key.toLowerCase().includes('token')
        )
      )
      
      if (apiKeyHeader) {
        setAuthType('api-key')
        setApiKeyName(apiKeyHeader.key)
        setApiKeyValue(apiKeyHeader.value)
      }
    }
  }, [headers])

  const applyAuth = () => {
    // Remove existing auth headers
    const filteredHeaders = headers.filter(h => 
      !(h.key.toLowerCase() === 'authorization' || 
        h.key.toLowerCase() === apiKeyName.toLowerCase())
    )

    let newHeaders = [...filteredHeaders]

    if (authType === 'bearer' && bearerToken.trim()) {
      newHeaders.push({
        id: uuidv4(),
        key: 'Authorization',
        value: `Bearer ${bearerToken.trim()}`,
        enabled: true
      })
    } else if (authType === 'api-key' && apiKeyName.trim() && apiKeyValue.trim()) {
      newHeaders.push({
        id: uuidv4(),
        key: apiKeyName.trim(),
        value: apiKeyValue.trim(),
        enabled: true
      })
    }

    onChange(newHeaders)
  }

  const clearAuth = () => {
    const filteredHeaders = headers.filter(h => 
      !(h.key.toLowerCase() === 'authorization' || 
        (authType === 'api-key' && h.key.toLowerCase() === apiKeyName.toLowerCase()))
    )
    onChange(filteredHeaders)
    setAuthType('none')
    setBearerToken('')
    setApiKeyValue('')
  }

  const currentAuthHeader = headers.find(h => 
    h.enabled && (
      h.key.toLowerCase() === 'authorization' ||
      (authType === 'api-key' && h.key.toLowerCase() === apiKeyName.toLowerCase())
    )
  )

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
          Authentication
        </h3>
        <Select
          value={authType}
          onChange={(e) => setAuthType(e.target.value as AuthType)}
          options={authTypes}
          className="w-48"
        />
      </div>

      {authType === 'none' && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <p>No authentication configured</p>
          <p className="text-sm">Select an auth type from the dropdown above</p>
        </div>
      )}

      {authType === 'bearer' && (
        <div className="space-y-4 max-w-md">
          <Input
            label="Bearer Token"
            type="password"
            value={bearerToken}
            onChange={(e) => setBearerToken(e.target.value)}
            placeholder="Enter your bearer token"
            helpText="The token will be sent as 'Authorization: Bearer <token>'"
          />
          
          <div className="flex space-x-3">
            <Button onClick={applyAuth} disabled={!bearerToken.trim()}>
              Apply Token
            </Button>
            {currentAuthHeader && (
              <Button variant="secondary" onClick={clearAuth}>
                Clear Auth
              </Button>
            )}
          </div>
        </div>
      )}

      {authType === 'api-key' && (
        <div className="space-y-4 max-w-md">
          <Input
            label="Header Name"
            value={apiKeyName}
            onChange={(e) => setApiKeyName(e.target.value)}
            placeholder="e.g., X-API-Key, Authorization"
          />
          
          <Input
            label="API Key Value"
            type="password"
            value={apiKeyValue}
            onChange={(e) => setApiKeyValue(e.target.value)}
            placeholder="Enter your API key"
          />
          
          <div className="flex space-x-3">
            <Button 
              onClick={applyAuth} 
              disabled={!apiKeyName.trim() || !apiKeyValue.trim()}
            >
              Apply API Key
            </Button>
            {currentAuthHeader && (
              <Button variant="secondary" onClick={clearAuth}>
                Clear Auth
              </Button>
            )}
          </div>
        </div>
      )}

      {authType === 'custom' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              Custom Authentication
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              For custom authentication, manually add the required headers in the Headers tab. 
              Common examples include:
            </p>
            <ul className="mt-2 text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• <code>Authorization: Basic {btoa('username:password')}</code></li>
              <li>• <code>X-Auth-Token: your-token</code></li>
              <li>• <code>Cookie: session=abc123</code></li>
            </ul>
          </div>
        </div>
      )}

      {/* Current Auth Status */}
      {currentAuthHeader && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
          <h4 className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">
            Current Authentication:
          </h4>
          <div className="font-mono text-sm text-green-800 dark:text-green-200">
            <span className="font-medium">{currentAuthHeader.key}:</span> {
              currentAuthHeader.value.length > 50 
                ? currentAuthHeader.value.slice(0, 50) + '...'
                : currentAuthHeader.value
            }
          </div>
        </div>
      )}

      {/* Auth Templates */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
          Quick Templates:
        </h4>
        <div className="grid grid-cols-1 gap-3 max-w-md">
          <button
            className="text-left p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => {
              setAuthType('bearer')
              setBearerToken('')
            }}
          >
            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
              Bearer Token (OAuth 2.0)
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Authorization: Bearer &lt;token&gt;
            </div>
          </button>
          
          <button
            className="text-left p-3 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            onClick={() => {
              setAuthType('api-key')
              setApiKeyName('X-API-Key')
              setApiKeyValue('')
            }}
          >
            <div className="font-medium text-sm text-gray-900 dark:text-gray-100">
              API Key
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              X-API-Key: &lt;key&gt;
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}