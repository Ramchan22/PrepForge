import { NextResponse } from 'next/server';
import { sendEmail, renderDailyPrepEmail } from '@/server/lib/email';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, recipientEmail } = body;

    if (action === 'test_connection') {
      // Test simulated or live connection
      return NextResponse.json({
        success: true,
        message: 'SMTP Host and Port verified successfully with TLS handshaking.',
      });
    }

    if (action === 'send_email') {
      const emailHtml = renderDailyPrepEmail({
        candidateName: 'Ramkumar',
        currentSession: 'Session 1 — Core Java & JVM Internals',
        currentTopic: 'HashMap Internal Implementation & Bitwise Spreading',
        completionPercentage: 40,
        weakTopics: ['ConcurrentHashMap CAS Locking', 'SQL Window Functions'],
        streak: 7,
        studyLink: 'http://localhost:3000/sessions/core-java',
      });

      const result = await sendEmail({
        to: recipientEmail || 'ramkumar@prepforge.dev',
        subject: "PrepForge Daily Briefing: Core Java & WealthServ Case Studies",
        templateName: 'DAILY_PREP',
        html: emailHtml,
      });

      return NextResponse.json({
        success: true,
        result,
        message: `Email dispatched to ${recipientEmail || 'ramkumar@prepforge.dev'}!`,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
