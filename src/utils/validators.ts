import { SavedRequest, Environment, KeyValuePair } from '../types'

export class Validators {
  static validateRequestName(name: string): string[] {
    const errors: string[] = []
    
    if (!name.trim()) {
      errors.push('Request name is required')
    } else if (name.trim().length < 2) {
      errors.push('Request name must be at least 2 characters')
    } else if (name.length > 100) {
      errors.push('Request name must be less than 100 characters')
    }
    
    return errors
  }

  static validateUrl(url: string): string[] {
    const errors: string[] = []
    
    if (!url.trim()) {
      errors.push('URL is required')
      return errors
    }

    // Allow environment variables in URL validation
    const urlWithoutVars = url.replace(/{{[^}]+}}/g, 'placeholder')
    
    try {
      // Add protocol if missing for validation
      const testUrl = urlWithoutVars.startsWith('http') 
        ? urlWithoutVars 
        : `http://${urlWithoutVars}`
      
      new URL(testUrl)
    } catch {
      errors.push('Invalid URL format')
    }
    
    return errors
  }

  static validateJsonBody(body: string): string[] {
    const errors: string[] = []
    
    if (!body.trim()) {
      return errors // Empty body is valid
    }
    
    try {
      JSON.parse(body)
    } catch (error: any) {
      errors.push(`Invalid JSON: ${error.message}`)
    }
    
    return errors
  }

  static validateTimeout(timeout: number): string[] {
    const errors: string[] = []
    
    if (timeout < 1000) {
      errors.push('Timeout must be at least 1 second (1000ms)')
    } else if (timeout > 300000) {
      errors.push('Timeout cannot exceed 5 minutes (300000ms)')
    }
    
    return errors
  }

  static validateKeyValuePairs(pairs: KeyValuePair[], type: 'headers' | 'queryParams'): string[] {
    const errors: string[] = []
    
    pairs.forEach((pair, index) => {
      if (pair.enabled && pair.key.trim()) {
        // Check for duplicate keys
        const duplicates = pairs.filter(p => 
          p.enabled && p.key.trim().toLowerCase() === pair.key.trim().toLowerCase()
        )
        
        if (duplicates.length > 1) {
          errors.push(`Duplicate ${type === 'headers' ? 'header' : 'parameter'} key: "${pair.key}"`)
        }
        
        // Validate header names (more strict)
        if (type === 'headers' && !/^[a-zA-Z0-9\-_]+$/.test(pair.key)) {
          errors.push(`Invalid header name: "${pair.key}". Use only letters, numbers, hyphens, and underscores`)
        }
      }
    })
    
    return errors
  }

  static validateEnvironmentName(name: string, existingNames: string[] = []): string[] {
    const errors: string[] = []
    
    if (!name.trim()) {
      errors.push('Environment name is required')
    } else if (name.trim().length < 2) {
      errors.push('Environment name must be at least 2 characters')
    } else if (name.length > 50) {
      errors.push('Environment name must be less than 50 characters')
    }
    
    if (existingNames.includes(name.trim())) {
      errors.push('Environment name already exists')
    }
    
    return errors
  }

  static validateEnvironmentVariables(variables: KeyValuePair[]): string[] {
    const errors: string[] = []
    
    variables.forEach((variable) => {
      if (variable.enabled && variable.key.trim()) {
        // Check variable name format
        if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable.key)) {
          errors.push(`Invalid variable name: "${variable.key}". Must start with letter or underscore, contain only letters, numbers, and underscores`)
        }
        
        // Check for duplicate variables
        const duplicates = variables.filter(v => 
          v.enabled && v.key.trim() === variable.key.trim()
        )
        
        if (duplicates.length > 1) {
          errors.push(`Duplicate variable name: "${variable.key}"`)
        }
      }
    })
    
    return errors
  }

  static validateCollectionName(name: string, existingNames: string[] = []): string[] {
    const errors: string[] = []
    
    if (!name.trim()) {
      errors.push('Collection name is required')
    } else if (name.trim().length < 2) {
      errors.push('Collection name must be at least 2 characters')
    } else if (name.length > 100) {
      errors.push('Collection name must be less than 100 characters')
    }
    
    if (existingNames.includes(name.trim())) {
      errors.push('Collection name already exists')
    }
    
    return errors
  }

  static validateRequest(request: SavedRequest): string[] {
    const errors: string[] = []
    
    errors.push(...this.validateRequestName(request.name))
    errors.push(...this.validateUrl(request.url))
    errors.push(...this.validateTimeout(request.timeout))
    
    if (request.bodyType === 'json') {
      errors.push(...this.validateJsonBody(request.body))
    }
    
    errors.push(...this.validateKeyValuePairs(request.headers, 'headers'))
    errors.push(...this.validateKeyValuePairs(request.queryParams, 'queryParams'))
    
    return errors
  }

  static validateEnvironment(environment: Environment, existingNames: string[] = []): string[] {
    const errors: string[] = []
    
    errors.push(...this.validateEnvironmentName(environment.name, existingNames))
    errors.push(...this.validateEnvironmentVariables(environment.variables))
    
    return errors
  }

  static validateImportData(data: any): string[] {
    const errors: string[] = []
    
    if (!data || typeof data !== 'object') {
      errors.push('Invalid import data format')
      return errors
    }
    
    // Check for required structure
    const requiredFields = ['collections', 'requests', 'environments']
    requiredFields.forEach(field => {
      if (data[field] && !Array.isArray(data[field])) {
        errors.push(`Invalid ${field} format - expected array`)
      }
    })
    
    // Validate collections
    if (data.collections) {
      data.collections.forEach((collection: any, index: number) => {
        if (!collection.id || !collection.name) {
          errors.push(`Collection at index ${index} missing required fields`)
        }
      })
    }
    
    // Validate requests
    if (data.requests) {
      data.requests.forEach((request: any, index: number) => {
        if (!request.id || !request.name || !request.method || !request.url) {
          errors.push(`Request at index ${index} missing required fields`)
        }
      })
    }
    
    // Validate environments
    if (data.environments) {
      data.environments.forEach((environment: any, index: number) => {
        if (!environment.id || !environment.name || !Array.isArray(environment.variables)) {
          errors.push(`Environment at index ${index} missing required fields`)
        }
      })
    }
    
    return errors
  }

  static validatePin(pin: string): string[] {
    const errors: string[] = []
    
    if (!pin) {
      errors.push('PIN is required')
    } else if (pin.length < 4) {
      errors.push('PIN must be at least 4 digits')
    } else if (pin.length > 8) {
      errors.push('PIN must be no more than 8 digits')
    } else if (!/^\d+$/.test(pin)) {
      errors.push('PIN must contain only numbers')
    }
    
    return errors
  }
}