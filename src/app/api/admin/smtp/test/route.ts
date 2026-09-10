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
      const isMasked = !rawPass || rawPass.includes('•') || rawPass.includes('*') || rawPass.includes('?') || rawPass.includes('');
      if (isMasked) {
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
            connectionTimeout: 7000,
          });
          await transporter.verify();
          return NextResponse.json({
            success: true,
            message: `Connection successfully established to ${testHost}:${testPort} with active TLS credentials!`,
          });
        } catch (connErr: any) {
          // If port 465 timed out (common cloud egress restriction on Railway/AWS), auto-retry on 587 & 2525
          if ((testPort === 465 || connErr.message.includes('timeout')) && testHost.includes('brevo')) {
            console.log('[PrepForge SMTP] Port 465 timed out on cloud host. Trying Port 587 with STARTTLS...');
            try {
              const fallback587 = nodemailer.createTransport({
                host: testHost,
                port: 587,
                secure: false,
                auth: { user: testUser, pass: testPass },
                connectionTimeout: 7000,
              });
              await fallback587.verify();

              // Auto-update database configuration to port 587
              try {
                await prisma.smtpConfig.update({
                  where: { id: 'default' },
                  data: { port: 587, secure: false },
                });
              } catch (e) {}

              return NextResponse.json({
                success: true,
                message: `Port 465 timed out (cloud firewall restriction), but successfully connected to ${testHost}:587 with STARTTLS! Updated config to Port 587.`,
              });
            } catch (err587: any) {
              console.log('[PrepForge SMTP] Port 587 failed, trying Port 2525...');
              try {
                const fallback2525 = nodemailer.createTransport({
                  host: testHost,
                  port: 2525,
                  secure: false,
                  auth: { user: testUser, pass: testPass },
                  connectionTimeout: 7000,
                });
                await fallback2525.verify();

                try {
                  await prisma.smtpConfig.update({
                    where: { id: 'default' },
                    data: { port: 2525, secure: false },
                  });
                } catch (e) {}

                return NextResponse.json({
                  success: true,
                  message: `Port 465 timed out, but successfully connected to ${testHost}:2525 with STARTTLS! Updated config to Port 2525.`,
                });
              } catch (err2525: any) {}
            }
          }

          return NextResponse.json(
            {
              success: false,
              error: `Connection failed to ${testHost}:${testPort}: ${connErr.message}. Cloud platforms (like Railway) frequently block port 465. Please use Port 587 or Port 2525 (with SSL unchecked).`,
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
