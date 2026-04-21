/**
 * Simple encryption/decryption for stored sensitive values
 * Note: This is basic obfuscation, not cryptographic security
 * For production use, consider implementing proper encryption
 */

export class Encryption {
  private static readonly SALT = 'request-runner-salt'
  
  static encrypt(value: string): string {
    if (!value) return value
    
    try {
      // Simple Base64 encoding with salt for basic obfuscation
      const combined = `${this.SALT}:${value}`
      return btoa(combined)
    } catch {
      return value
    }
  }
  
  static decrypt(encryptedValue: string): string {
    if (!encryptedValue) return encryptedValue
    
    try {
      const decoded = atob(encryptedValue)
      if (decoded.startsWith(`${this.SALT}:`)) {
        return decoded.slice(this.SALT.length + 1)
      }
      return encryptedValue
    } catch {
      return encryptedValue
    }
  }
  
  static obfuscateValue(value: string, showSecrets: boolean = false): string {
    if (!value || showSecrets) return value
    
    // Obfuscate tokens and API keys
    if (this.isSensitiveValue(value)) {
      const visibleChars = Math.min(4, Math.floor(value.length * 0.2))
      const hiddenChars = value.length - visibleChars
      return value.slice(0, visibleChars) + '*'.repeat(Math.max(8, hiddenChars))
    }
    
    return value
  }
  
  private static isSensitiveValue(value: string): boolean {
    if (!value || value.length < 8) return false
    
    const sensitivePatterns = [
      /^[a-zA-Z0-9]{20,}$/, // Long alphanumeric strings (likely tokens)
      /^[A-Za-z0-9+/]{20,}={0,2}$/, // Base64 patterns
      /bearer\s+/i, // Bearer tokens
      /api[_-]?key/i, // API key references
      /token/i, // Token references
      /secret/i, // Secret references
      /auth/i // Auth references
    ]
    
    return sensitivePatterns.some(pattern => pattern.test(value))
  }
  
  static hashPin(pin: string): string {
    // Simple hash for PIN storage (not cryptographically secure)
    let hash = 0
    for (let i = 0; i < pin.length; i++) {
      const char = pin.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }
  
  static validatePin(pin: string, storedHash: string): boolean {
    return this.hashPin(pin) === storedHash
  }
}