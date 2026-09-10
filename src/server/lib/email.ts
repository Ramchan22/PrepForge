import nodemailer from 'nodemailer';
import { prisma } from './prisma';
import { decryptCredential } from './crypto';

export interface EmailOptions {
  to: string;
  subject: string;
  templateName: string;
  html: string;
}

export async function getTransporter() {
  // Check if there is dynamic SMTP config in DB
  let smtpConfig = null;
  try {
    smtpConfig = await prisma.smtpConfig.findUnique({
      where: { id: 'default' },
    });
  } catch (e) {
    // If DB is not yet ready, fallback to env vars
  }

  const host = smtpConfig?.host || process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = smtpConfig?.port || parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = smtpConfig?.secure ?? (process.env.SMTP_SECURE === 'true');
  const user = smtpConfig?.username || process.env.SMTP_USER || '';
  const rawPass = smtpConfig?.passwordEncrypted || process.env.SMTP_PASSWORD || '';
  const pass = decryptCredential(rawPass);

  const hasRealCredentials = Boolean(
    user &&
    pass &&
    !user.includes('notifications@prepforge.dev') &&
    pass !== 'demo_password'
  );

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });

  const senderName = smtpConfig?.senderName || process.env.SMTP_FROM_NAME || 'PrepForge Interview Coach';
  const senderEmail = smtpConfig?.senderEmail || process.env.SMTP_FROM_EMAIL || 'coach@prepforge.dev';

  return { transporter, from: `"${senderName}" <${senderEmail}>`, hasRealCredentials };
}

export async function sendEmail({ to, subject, templateName, html }: EmailOptions) {
  try {
    const { transporter, from, hasRealCredentials } = await getTransporter();

    // If no real production credentials configured yet, simulate email delivery & record log
    if (!hasRealCredentials) {
      console.log(`[PrepForge SMTP Simulation] Sent "${subject}" to ${to}`);
      try {
        await prisma.emailLog.create({
          data: {
            recipientEmail: to,
            templateName,
            subject,
            status: 'SENT',
          },
        });
      } catch (e) {}
      return { success: true, simulated: true, message: `Simulated dispatch to ${to} (credentials not yet configured)` };
    }

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    try {
      await prisma.emailLog.create({
        data: {
          recipientEmail: to,
          templateName,
          subject,
          status: 'SENT',
        },
      });
    } catch (e) {}

    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('[PrepForge SMTP Error]', error);
    try {
      await prisma.emailLog.create({
        data: {
          recipientEmail: to,
          templateName,
          subject,
          status: 'FAILED',
          error: error.message || 'Unknown SMTP error',
        },
      });
    } catch (e) {}
    return { success: false, error: error.message };
  }
}

// Reusable HTML Email Template for Daily Prep Briefing
export function renderDailyPrepEmail(params: {
  candidateName: string;
  currentSession: string;
  currentTopic: string;
  completionPercentage: number;
  weakTopics: string[];
  streak: number;
  studyLink: string;
}) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #090d16; color: #f8fafc; padding: 40px 20px; max-width: 600px; margin: 0 auto; border-radius: 12px; border: 1px solid #1e293b;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #818cf8; margin: 0; font-size: 24px;">PrepForge Interview Operating System</h1>
        <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Daily High-Yield Senior Preparation Briefing</p>
      </div>
      <div style="background-color: #0f172a; border-radius: 8px; padding: 20px; border: 1px solid #334155; margin-bottom: 20px;">
        <h2 style="color: #f1f5f9; font-size: 18px; margin-top: 0;">Good Morning, ${params.candidateName} 👋</h2>
        <p style="color: #cbd5e1; line-height: 1.6;">Your customized curriculum focus for today:</p>
        <div style="border-left: 4px solid #6366f1; padding-left: 12px; margin: 16px 0;">
          <strong style="color: #a5b4fc; font-size: 16px;">${params.currentSession}</strong><br/>
          <span style="color: #e2e8f0;">Target Topic: ${params.currentTopic}</span>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">Curriculum Progress: <strong>${params.completionPercentage}%</strong> | Current Streak: 🔥 <strong>${params.streak} Days</strong></p>
      </div>
      ${params.weakTopics.length > 0 ? `
      <div style="background-color: rgba(244, 63, 94, 0.1); border: 1px solid rgba(244, 63, 94, 0.3); border-radius: 8px; padding: 16px; margin-bottom: 20px;">
        <strong style="color: #f43f5e; font-size: 14px;">Targeted Weak Areas to Revise Today:</strong>
        <ul style="color: #fecdd3; font-size: 13px; margin: 8px 0 0 0; padding-left: 20px;">
          ${params.weakTopics.map(t => `<li>${t}</li>`).join('')}
        </ul>
      </div>` : ''}
      <div style="text-align: center; margin-top: 30px;">
        <a href="${params.studyLink}" style="background-color: #4f46e5; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-weight: 600; display: inline-block;">Start Today's Session & Daily Test</a>
      </div>
      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 16px;">
        PrepForge — Personalized for Senior Backend & System Architecture Interviews
      </div>
    </div>
  `;
}
