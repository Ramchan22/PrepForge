import { NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';

export async function GET() {
  try {
    // Quick DB check
    const userCount = await prisma.user.count();
    return NextResponse.json({
      status: 'HEALTHY',
      service: 'PrepForge API',
      timestamp: new Date().toISOString(),
      database: 'CONNECTED',
      userCount,
      environment: process.env.NODE_ENV || 'development',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'DEGRADED',
        service: 'PrepForge API',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 500 }
    );
  }
}
