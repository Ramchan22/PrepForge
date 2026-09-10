import { NextResponse } from 'next/server';
import { prisma } from '@/server/lib/prisma';

export async function GET() {
  try {
    // Fetch default candidate user
    const user = await prisma.user.findFirst({
      where: { email: 'ram795055@gmail.com' },
      include: {
        conceptProgress: {
          include: { concept: true },
        },
        sessionProgress: {
          include: { session: true },
        },
        testAttempts: {
          orderBy: { completedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'User not found',
      }, { status: 404 });
    }

    const totalConcepts = await prisma.concept.count();
    const completedConcepts = user.conceptProgress.filter((cp) => cp.isCompleted).length;

    // Get Session 1 progress
    const session1 = await prisma.session.findFirst({
      where: { order: 1 },
      include: { topics: true },
    });

    const session1TopicsCount = session1?.topics.length || 4;
    // Calculate how many concepts in session 1 are completed
    const session1Progress = user.sessionProgress.find((sp) => sp.sessionId === session1?.id);
    const session1Percent = session1Progress?.completionPercent || 0;

    // Weak areas from test attempts
    const weakAreasSet = new Set<string>();
    user.testAttempts.forEach((attempt) => {
      try {
        const parsed = JSON.parse(attempt.weakAreasJson || '[]');
        if (Array.isArray(parsed)) {
          parsed.forEach((w: string) => weakAreasSet.add(w));
        }
      } catch (e) { }
    });

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        streak: user.streak,
        interviewReadinessScore: user.interviewReadinessScore,
        completedConceptsCount: completedConcepts,
        totalConceptsCount: totalConcepts,
      },
      currentSession: {
        title: session1?.title || 'Core Java & JVM Internals',
        slug: session1?.slug || 'core-java',
        completionPercent: session1Percent,
        topicsCount: session1TopicsCount,
      },
      weakAreas: Array.from(weakAreasSet),
      hasTakenTest: user.testAttempts.length > 0,
      recentTestScore: user.testAttempts[0]?.score ?? null,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, readinessScore, session1Percent, streak } = body;

    const user = await prisma.user.findFirst({
      where: { email: 'ram795055@gmail.com' },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    if (action === 'reset') {
      // Reset candidate to fresh 0% state
      await prisma.user.update({
        where: { id: user.id },
        data: {
          interviewReadinessScore: 0.0,
          streak: 0,
        },
      });

      await prisma.userSessionProgress.updateMany({
        where: { userId: user.id },
        data: {
          completionPercent: 0.0,
        },
      });

      await prisma.userConceptProgress.deleteMany({
        where: { userId: user.id },
      });

      await prisma.testAttempt.deleteMany({
        where: { userId: user.id },
      });

      return NextResponse.json({ success: true, message: 'Candidate preparation progress reset to 0% fresh baseline.' });
    }

    // Update with specific values if passed
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        interviewReadinessScore: readinessScore !== undefined ? readinessScore : user.interviewReadinessScore,
        streak: streak !== undefined ? streak : user.streak,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
