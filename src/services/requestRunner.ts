import { SavedRequest, Environment, RunResult, KeyValuePair } from '../types'

export class RequestRunner {
  static async executeRequest(
    request: SavedRequest,
    environment: Environment | null
  ): Promise<RunResult> {
    try {
      // Resolve environment variables in URL and headers
      const resolvedUrl = this.resolveEnvironmentVariables(request.url, environment)
      const resolvedHeaders = this.resolveHeadersVariables(request.headers, environment)
      
      // Build query parameters
      const queryString = this.buildQueryString(request.queryParams)
      const finalUrl = queryString ? `${resolvedUrl}?${queryString}` : resolvedUrl
      
      // Prepare request data
      let requestData: any = {}
      
      if (request.bodyType === 'json' && request.body) {
        try {
          requestData = JSON.parse(request.body)
        } catch {
          throw new Error('Invalid JSON in request body')
        }
      } else if (request.bodyType === 'form-urlencoded' && request.body) {
        requestData = new URLSearchParams(request.body)
      } else if (request.bodyType === 'raw' && request.body) {
        requestData = request.body
      }
      
      // Convert headers to object
      const headersObj: Record<string, string> = {}
      resolvedHeaders.forEach(header => {
        if (header.enabled && header.key && header.value) {
          headersObj[header.key] = header.value
        }
      })
      
      // Execute request via Electron IPC
      const result = await window.electronAPI.request.run({
        method: request.method,
        url: finalUrl,
        headers: headersObj,
        data: requestData,
        timeout: request.timeout
      })
      
      return result
    } catch (error: any) {
      return {
        statusCode: 0,
        statusText: 'Error',
        duration: 0,
        responseBody: '',
        responseHeaders: {},
        size: 0,
        error: error.message || 'Unknown error occurred'
      }
    }
  }
  
  private static resolveEnvironmentVariables(
    text: string, 
    environment: Environment | null
  ): string {
    if (!environment) return text
    
    let resolved = text
    environment.variables.forEach(variable => {
      if (variable.enabled && variable.key && variable.value) {
        const regex = new RegExp(`{{\\s*${variable.key}\\s*}}`, 'g')
        resolved = resolved.replace(regex, variable.value)
      }
    })
    
    return resolved
  }
  
  private static resolveHeadersVariables(
    headers: KeyValuePair[],
    environment: Environment | null
  ): KeyValuePair[] {
    if (!environment) return headers
    
    return headers.map(header => ({
      ...header,
      value: this.resolveEnvironmentVariables(header.value, environment)
    }))
  }
  
  private static buildQueryString(queryParams: KeyValuePair[]): string {
    const enabledParams = queryParams.filter(param => 
      param.enabled && param.key
    )
    
    if (enabledParams.length === 0) return ''
    
    const searchParams = new URLSearchParams()
    enabledParams.forEach(param => {
      searchParams.append(param.key, param.value || '')
    })
    
    return searchParams.toString()
  }
  
  static validateRequest(request: SavedRequest): string[] {
    const errors: string[] = []
    
    if (!request.name.trim()) {
      errors.push('Request name is required')
    }
    
    if (!request.url.trim()) {
      errors.push('URL is required')
    } else {
      try {
        // Basic URL validation - allow environment variables
        const urlWithoutVars = request.url.replace(/{{[^}]+}}/g, 'placeholder')
        new URL(urlWithoutVars.startsWith('http') ? urlWithoutVars : `http://${urlWithoutVars}`)
      } catch {
        errors.push('Invalid URL format')
      }
    }
    
    if (request.bodyType === 'json' && request.body) {
      try {
        JSON.parse(request.body)
      } catch {
        errors.push('Invalid JSON in request body')
      }
    }
    
    if (request.timeout < 1000 || request.timeout > 300000) {
      errors.push('Timeout must be between 1 and 300 seconds')
    }
    
    return errors
  }
  
  static formatResponseBody(body: string, contentType?: string): string {
    if (!body) return ''
    
    try {
      // Try to parse as JSON for pretty printing
      const parsed = JSON.parse(body)
      return JSON.stringify(parsed, null, 2)
    } catch {
      // Return as-is if not valid JSON
      return body
    }
  }
  
  static getStatusColor(statusCode: number): string {
    if (statusCode >= 200 && statusCode < 300) return 'text-green-600'
    if (statusCode >= 300 && statusCode < 400) return 'text-blue-600' 
    if (statusCode >= 400 && statusCode < 500) return 'text-orange-600'
    if (statusCode >= 500) return 'text-red-600'
    return 'text-gray-600'
  }
  
  static getMethodColor(method: string): string {
    switch (method.toUpperCase()) {
      case 'GET': return 'text-blue-600 bg-blue-50'
      case 'POST': return 'text-green-600 bg-green-50'
      case 'PUT': return 'text-orange-600 bg-orange-50'
      case 'PATCH': return 'text-yellow-600 bg-yellow-50'
      case 'DELETE': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }
}