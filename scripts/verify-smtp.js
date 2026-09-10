const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();
const ALGORITHM = 'aes-256-gcm';
const MASTER_SECRET = 'prepforge-secure-credential-vault-2026!';

function getEncryptionKey() {
  const seed = process.env.ENCRYPTION_KEY || MASTER_SECRET;
  return crypto.createHash('sha256').update(seed).digest();
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

async function verifyAndSend() {
  const cfg = await prisma.smtpConfig.findUnique({ where: { id: 'default' } });
  const pass = decrypt(cfg.passwordEncrypted);
  console.log('[Verify SMTP] Host:', cfg.host);
  console.log('[Verify SMTP] Port:', cfg.port);
  console.log('[Verify SMTP] Username:', cfg.username);
  console.log('[Verify SMTP] Secure (SSL):', cfg.secure);
  console.log('[Verify SMTP] Decrypted Password Match:', pass === 'Im5h8KcAPkj2Z4r1' ? 'YES (MATCH)' : 'NO');

  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.username, pass: pass },
    connectionTimeout: 10000,
  });

  await transporter.verify();
  console.log('🎉 SUCCESS! Transporter handshake verified with decrypted DB password on Brevo SMTP!');

  const info = await transporter.sendMail({
    from: `"${cfg.senderName}" <${cfg.senderEmail}>`,
    to: 'ram795055@gmail.com',
    subject: 'PrepForge System Test: Brevo Production SMTP Active',
    html: `
      <div style="font-family: sans-serif; background: #0b1120; color: #f8fafc; padding: 24px; border-radius: 8px;">
        <h2 style="color: #6366f1;">PrepForge Interview Operating System</h2>
        <p>Your Brevo production SMTP gateway has been successfully encrypted, connected, and verified!</p>
        <p><strong>Host:</strong> ${cfg.host}:${cfg.port}</p>
        <p><strong>Sender:</strong> ${cfg.senderEmail}</p>
        <p><strong>Status:</strong> Active & Delivering</p>
      </div>
    `,
  });

  console.log('🚀 LIVE EMAIL DISPATCHED! Message ID:', info.messageId);
}

verifyAndSend()
  .then(() => prisma.$disconnect())
  .catch((err) => {
    console.error('Verification error:', err);
    prisma.$disconnect();
  });
