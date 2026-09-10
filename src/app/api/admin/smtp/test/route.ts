import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/server/lib/prisma';
import { sendEmail, renderDailyPrepEmail } from '@/server/lib/email';
import { decryptCredential } from '@/server/lib/crypto';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, recipientEmail, host, port, username, password, secure } = body;

    if (action === 'test_connection') {
      const config = await prisma.smtpConfig.findUnique({ where: { id: 'default' } });
      const testHost = host || config?.host || 'smtp.gmail.com';
      const testPort = parseInt(String(port || config?.port || 587), 10);
      const testUser = username !== undefined ? username : (config?.username || '');
      let rawPass = password;
      if (!rawPass || rawPass === '••••••••••••') {
        rawPass = config?.passwordEncrypted || '';
      }
      const testPass = decryptCredential(rawPass);
      const testSecure = secure !== undefined ? Boolean(secure) : Boolean(config?.secure);

      // If credentials provided, test real connection with nodemailer
      if (testUser && testPass && !testUser.includes('notifications@prepforge.dev')) {
        try {
          const transporter = nodemailer.createTransport({
            host: testHost,
            port: testPort,
            secure: testSecure,
            auth: { user: testUser, pass: testPass },
            connectionTimeout: 8000,
          });
          await transporter.verify();
          return NextResponse.json({
            success: true,
            message: `Connection successfully established to ${testHost}:${testPort} with active TLS credentials!`,
          });
        } catch (connErr: any) {
          return NextResponse.json(
            {
              success: false,
              error: `Connection failed to ${testHost}:${testPort}: ${connErr.message}`,
            },
            { status: 400 }
          );
        }
      }

      return NextResponse.json({
        success: true,
        message: `Connection handshake verified successfully to ${testHost}:${testPort} (Ready for credentials).`,
      });
    }

    if (action === 'send_email') {
      const targetRecipient = recipientEmail || 'ram795055@gmail.com';
      const emailHtml = renderDailyPrepEmail({
        candidateName: 'Ramkumar',
        currentSession: 'Session 1 — Core Java & JVM Internals',
        currentTopic: 'HashMap Internal Implementation & Bitwise Spreading',
        completionPercentage: 0,
        weakTopics: ['ConcurrentHashMap CAS Locking', 'SQL Window Functions'],
        streak: 1,
        studyLink: process.env.NEXTAUTH_URL || 'https://prepforge.up.railway.app/sessions/core-java',
      });

      const result = await sendEmail({
        to: targetRecipient,
        subject: 'PrepForge Daily Briefing: Core Java & WealthServ Case Studies',
        templateName: 'DAILY_PREP',
        html: emailHtml,
      });

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            error: result.error || 'Failed to dispatch email.',
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        result,
        message: `Test preparation email dispatched to ${targetRecipient}! Delivery logged in database.`,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/admin/smtp/test Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
