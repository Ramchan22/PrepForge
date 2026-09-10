const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const MASTER_SECRET = 'prepforge-secure-credential-vault-2026!';

function getEncryptionKey() {
  const seed = process.env.ENCRYPTION_KEY || MASTER_SECRET;
  return crypto.createHash('sha256').update(seed).digest();
}

function encrypt(plainText) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
  let enc = cipher.update(plainText, 'utf8', 'base64');
  enc += cipher.final('base64');
  const tag = cipher.getAuthTag().toString('base64');
  return `enc:${iv.toString('base64')}:${tag}:${enc}`;
}

function decrypt(cipherText) {
  if (!cipherText || !cipherText.startsWith('enc:')) return cipherText;
  const parts = cipherText.split(':');
  const iv = Buffer.from(parts[1], 'base64');
  const authTag = Buffer.from(parts[2], 'base64');
  const encryptedText = parts[3];
  const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

async function main() {
  const plainPassword = 'Im5h8KcAPkj2Z4r1';
  const encryptedPassword = encrypt(plainPassword);
  console.log('[PrepForge Brevo SMTP] Encrypted payload:', encryptedPassword);
  console.log('[PrepForge Brevo SMTP] Self-check decryption:', decrypt(encryptedPassword));

  const updated = await prisma.smtpConfig.upsert({
    where: { id: 'default' },
    create: {
      id: 'default',
      host: 'smtp-relay.brevo.com',
      port: 465,
      username: 'hari@fintuple.com',
      passwordEncrypted: encryptedPassword,
      secure: true,
      senderEmail: 'hari@fintuple.com',
      senderName: 'PrepForge Interview Coach',
    },
    update: {
      host: 'smtp-relay.brevo.com',
      port: 465,
      username: 'hari@fintuple.com',
      passwordEncrypted: encryptedPassword,
      secure: true,
      senderEmail: 'hari@fintuple.com',
      senderName: 'PrepForge Interview Coach',
    },
  });

  console.log('[PrepForge Brevo SMTP] ✅ Database record updated successfully! ID:', updated.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
