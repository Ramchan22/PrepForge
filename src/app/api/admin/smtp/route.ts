import { NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';
import { encryptCredential } from '@/server/lib/crypto';

// GET: Fetch saved SMTP configuration
export async function GET() {
  try {
    let config = await prisma.smtpConfig.findUnique({
      where: { id: 'default' },
    });

    if (!config) {
      config = await prisma.smtpConfig.create({
        data: {
          id: 'default',
          host: 'smtp.gmail.com',
          port: 587,
          username: 'notifications@prepforge.dev',
          passwordEncrypted: '',
          secure: false,
          senderEmail: 'coach@prepforge.dev',
          senderName: 'PrepForge Interview Coach',
        },
      });
    }

    return NextResponse.json({
      success: true,
      config: {
        host: config.host,
        port: String(config.port),
        username: config.username,
        hasPassword: !!config.passwordEncrypted,
        password: config.passwordEncrypted ? '••••••••••••' : '',
        secure: config.secure,
        senderEmail: config.senderEmail,
        senderName: config.senderName,
        updatedAt: config.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('[API /api/admin/smtp GET Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch SMTP configuration' },
      { status: 500 }
    );
  }
}

// POST: Save or update SMTP configuration in database
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      host,
      port,
      username,
      password,
      secure,
      senderEmail,
      senderName,
    } = body;

    if (!host || !port) {
      return NextResponse.json(
        { success: false, error: 'SMTP Host and Port are required.' },
        { status: 400 }
      );
    }

    // Get existing config to preserve password if user didn't change it (e.g. still masked)
    const existing = await prisma.smtpConfig.findUnique({
      where: { id: 'default' },
    });

    let finalPassword = existing?.passwordEncrypted || '';
    if (password && password !== '••••••••••••') {
      finalPassword = encryptCredential(password);
    }

    const updated = await prisma.smtpConfig.upsert({
      where: { id: 'default' },
      create: {
        id: 'default',
        host: host.trim(),
        port: parseInt(String(port), 10) || 587,
        username: (username || '').trim(),
        passwordEncrypted: finalPassword,
        secure: Boolean(secure),
        senderEmail: (senderEmail || 'coach@prepforge.dev').trim(),
        senderName: (senderName || 'PrepForge Interview Coach').trim(),
      },
      update: {
        host: host.trim(),
        port: parseInt(String(port), 10) || 587,
        username: (username || '').trim(),
        passwordEncrypted: finalPassword,
        secure: Boolean(secure),
        senderEmail: (senderEmail || 'coach@prepforge.dev').trim(),
        senderName: (senderName || 'PrepForge Interview Coach').trim(),
      },
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          action: 'UPDATE_SMTP_CONFIG',
          entity: 'SmtpConfig',
          entityId: 'default',
          metadataJson: JSON.stringify({
            host: updated.host,
            port: updated.port,
            username: updated.username,
            secure: updated.secure,
            senderEmail: updated.senderEmail,
            senderName: updated.senderName,
          }),
        },
      });
    } catch (e) {}

    return NextResponse.json({
      success: true,
      message: 'SMTP configuration successfully encrypted and saved to database.',
      config: {
        host: updated.host,
        port: String(updated.port),
        username: updated.username,
        hasPassword: !!updated.passwordEncrypted,
        password: updated.passwordEncrypted ? '••••••••••••' : '',
        secure: updated.secure,
        senderEmail: updated.senderEmail,
        senderName: updated.senderName,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error: any) {
    console.error('[API /api/admin/smtp POST Error]', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save SMTP configuration' },
      { status: 500 }
    );
  }
}
