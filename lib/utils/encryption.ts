import { scryptSync, createCipheriv, createDecipheriv, randomBytes } from 'crypto'

// Get or generate encryption key
function getEncryptionKey(): Buffer {
  const keyString = process.env.ENCRYPTION_KEY

  if (!keyString) {
    throw new Error('ENCRYPTION_KEY environment variable must be set')
  }

  if (keyString.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters long')
  }

  // Use scrypt to derive a 32-byte (256-bit) key from the environment variable
  // Using a fixed salt for reproducibility (in production, consider unique salts per deployment)
  const salt = Buffer.from('marqdex-salt-2024', 'utf-8')
  return scryptSync(keyString, salt, 32)
}

/**
 * Encrypt plaintext using AES-256-GCM
 * @param plaintext - The text to encrypt
 * @returns Base64 encoded string containing IV:authTag:encrypted
 */
export function encrypt(plaintext: string): string {
  try {
    const key = getEncryptionKey()
    const iv = randomBytes(16) // 16 bytes IV for GCM
    const cipher = createCipheriv('aes-256-gcm', key, iv)

    let encrypted = cipher.update(plaintext, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const authTag = cipher.getAuthTag()

    // Return format: iv:authTag:encrypted (all hex encoded)
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
  } catch (error) {
    console.error('Encryption error:', error)
    throw new Error('Failed to encrypt data')
  }
}

/**
 * Decrypt ciphertext that was encrypted with encrypt()
 * @param ciphertext - The encrypted string in format iv:authTag:encrypted
 * @returns The decrypted plaintext
 */
export function decrypt(ciphertext: string): string {
  try {
    if (!ciphertext) {
      return ''
    }

    const parts = ciphertext.split(':')

    if (parts.length !== 3) {
      // Try to decrypt as legacy base64 (for migration)
      try {
        return Buffer.from(ciphertext, 'base64').toString('utf-8')
      } catch {
        return ''
      }
    }

    const [ivHex, authTagHex, encrypted] = parts
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    const key = getEncryptionKey()
    const decipher = createDecipheriv('aes-256-gcm', key, iv)
    decipher.setAuthTag(authTag)

    let decrypted = decipher.update(encrypted, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    // Return empty string on error to prevent crashes
    return ''
  }
}

/**
 * Check if a string is encrypted (in our format)
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false
  const parts = value.split(':')
  return parts.length === 3 &&
    parts[0].length === 32 && // IV is 16 bytes = 32 hex chars
    parts[1].length === 32 && // AuthTag is 16 bytes = 32 hex chars
    parts[2].length > 0 && parts[2].length % 2 === 0 // Encrypted data (even length hex)
}
