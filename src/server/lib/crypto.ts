import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96-bit IV for AES-GCM
const MASTER_SECRET = 'prepforge-secure-credential-vault-2026!';

function getEncryptionKey(): Buffer {
  const seed = process.env.ENCRYPTION_KEY || MASTER_SECRET;
  return crypto.createHash('sha256').update(seed).digest();
}

/**
 * Encrypts sensitive string data using AES-256-GCM.
 * Output format: "enc:iv:authTag:ciphertext" (all base64)
 */
export function encryptCredential(plainText: string): string {
  if (!plainText) return '';
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  let encrypted = cipher.update(plainText, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  const authTag = cipher.getAuthTag().toString('base64');

  return `enc:${iv.toString('base64')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts data encrypted with encryptCredential.
 * If data is not encrypted (e.g. legacy plain text), returns plain text directly.
 */
export function decryptCredential(cipherText: string): string {
  if (!cipherText) return '';
  if (!cipherText.startsWith('enc:')) {
    // Unencrypted legacy fallback
    return cipherText;
  }

  try {
    const parts = cipherText.split(':');
    if (parts.length !== 4) return cipherText;

    const iv = Buffer.from(parts[1], 'base64');
    const authTag = Buffer.from(parts[2], 'base64');
    const encryptedText = parts[3];

    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err: any) {
    console.error('[PrepForge Crypto] Failed to decrypt credential:', err.message);
    return cipherText;
  }
}
