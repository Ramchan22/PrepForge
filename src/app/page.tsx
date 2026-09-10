'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Lock,
  Clock,
  Code,
  Mic,
  AlertTriangle,
  Layers,
  Sparkles,
  TrendingUp,
  RotateCcw,
  Compass,
  Play
} from 'lucide-react';
import { ALL_SESSIONS } from '@/data/curriculum/sessionsData';

interface UserProgressData {
  user: {
    name: string;
    email: string;
    streak: number;
    interviewReadinessScore: number;
    completedConceptsCount: number;
    totalConceptsCount: number;
  };
  currentSession: {
    title: string;
    slug: string;
    completionPercent: number;
    topicsCount: number;
  };
  weakAreas: string[];
  hasTakenTest: boolean;
  recentTestScore: number | null;
}

export default function DashboardPage() {
  const [data, setData] = useState<UserProgressData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/user/progress');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, []);

  const currentSession = ALL_SESSIONS[0]; // Session 1: Core Java
  const totalSessions = ALL_SESSIONS.length;

  const readinessScore = data?.user?.interviewReadinessScore ?? 0;
  const streak = data?.user?.streak ?? 0;
  const session1Percent = data?.currentSession?.completionPercent ?? 0;
  const weakAreas = data?.weakAreas ?? [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome Banner */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0e1628] to-slate-900 border border-slate-800 relative overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-indigo-600/10 to-transparent pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Personalized Senior Preparation Track • 5+ YOE</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Good Morning, Ramkumar 👋
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Targeted curriculum focused on high-concurrency Java/Spring Boot, NestJS microservices, distributed systems, and real case studies from your WealthServ 2.0 and eSign platforms.
            </p>
          </div>

          {/* Radial / Scorecard Badge */}
          <div className="flex items-center space-x-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800/90 shrink-0">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-indigo-500 stroke-current"
                  strokeDasharray={`${readinessScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-xs font-bold text-white font-mono">{readinessScore.toFixed(1)}%</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block tracking-wider">Interview Readiness</span>
              {readinessScore === 0 ? (
                <>
                  <span className="text-sm font-bold text-slate-300">Baseline Pending</span>
                  <span className="text-[10px] text-amber-400 block mt-0.5">Take test to calibrate</span>
                </>
              ) : (
                <>
                  <span className="text-sm font-bold text-emerald-400">Senior L5 Ready</span>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Calibrated by test</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row: Current Focus, Weak Areas, Daily Test */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Active Session */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-indigo-500/40 transition-all">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-indigo-400 font-semibold">SESSION 1 OF {totalSessions}</span>
              <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active</span>
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-100">{currentSession.title}</h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{currentSession.description}</p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Session Completion</span>
                <span className="font-mono text-indigo-400 font-bold">{session1Percent}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${session1Percent}%` }}></div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {session1Percent === 0 ? 'Ready to Start Topic 1' : 'In Progress'}
            </span>
            <Link
              href={`/sessions/${currentSession.slug}`}
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>{session1Percent === 0 ? 'Start Session 1' : 'Continue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Card 2: Weak Areas Targeted */}
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between hover:border-rose-500/40 transition-all">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400 mb-2">
              <AlertTriangle className="w-4 h-4" />
              <span>Targeted Weak Areas</span>
            </div>

            {weakAreas.length === 0 ? (
              <div className="space-y-3 py-2">
                <p className="text-xs text-slate-400 leading-relaxed">
                  No weak areas detected yet. Your technical blind spots will be diagnosed and tracked here automatically as you take practice tests and mock interviews.
                </p>
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400">
                  Tip: Complete today&apos;s 10-question practice test to establish your topic accuracy baseline.
                </div>
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-400 mb-3">
                  Adaptive system identified topics needing reinforcement based on recent practice tests:
                </p>
                <div className="space-y-2">
                  {weakAreas.map((area, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between"
                    >
                      <span className="line-clamp-1">{area}</span>
                      <span className="text-[10px] font-mono text-rose-400 font-bold shrink-0 ml-2">Needs Review</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              {weakAreas.length === 0 ? 'Ready for calibration' : 'Auto-injected into today\'s test'}
            </span>
            <Link
              href={weakAreas.length === 0 ? '/daily-practice' : '/revision'}
              className="text-xs font-semibold text-rose-400 hover:text-rose-300"
            >
              {weakAreas.length === 0 ? 'Start Diagnostic Test →' : 'Revise Now →'}
            </Link>
          </div>
        </div>

        {/* Card 3: Today's Test & Next Assessment */}
        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0c1426] to-[#0a0f1d] border border-indigo-500/30 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-mono text-emerald-400 font-semibold">DAILY ASSESSMENT</span>
              <span className="text-slate-400">10 Questions • 25m</span>
            </div>
            <h3 className="text-base font-bold text-white">Today&apos;s Adaptive Practice Test</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Curated 10-question evaluation covering Core Java, HashMap internals, SQL indexing, and WealthServ onboarding scenarios.
            </p>

            <div className="mt-4 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Next Weekly Assessment:</span>
                <strong className="text-slate-200">Sunday 10:00 AM</strong>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Passing Threshold:</span>
                <strong className="text-indigo-300">70% Required to Unlock Session 2</strong>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/80">
            <Link
              href="/daily-practice"
              className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold text-center block shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Start Daily Test →
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Launchpad to Practice Engines */}
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
          Interactive Preparation Engines
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/interview"
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200 group-hover:text-indigo-300">AI Senior Interviewer</h4>
            <p className="text-xs text-slate-400 mt-1">Live mock interview with dynamic follow-up probes and senior scoring rubrics.</p>
          </Link>

          <Link
            href="/resume-deep-dive"
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 hover:bg-slate-800/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200 group-hover:text-emerald-300">Project Deep-Dive</h4>
            <p className="text-xs text-slate-400 mt-1">WealthServ 2.0, Barjeel MF, Foreign Custody &amp; Reusable eSign architecture breakdown.</p>
          </Link>

          <Link
            href="/playground"
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Code className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300">Code &amp; SQL Playground</h4>
            <p className="text-xs text-slate-400 mt-1">Java 17, SQL window functions, and TypeScript challenge test runner.</p>
          </Link>

          <Link
            href="/analytics"
            className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-800/40 transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200 group-hover:text-purple-300">Readiness Radar</h4>
            <p className="text-xs text-slate-400 mt-1">Weighted readiness breakdown across Java, Spring, Microservices, and System Design.</p>
          </Link>
        </div>
      </div>

      {/* 23-Session Curriculum Progression Matrix */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-100">23-Session Progression Curriculum</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Sessions unlock progressively upon meeting 90% concept completion, test pass, and coding challenge requirements.
            </p>
          </div>
          <Link href="/sessions" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1">
            <span>View All 23 Sessions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ALL_SESSIONS.slice(0, 6).map((session) => {
            const isUnlocked = session.order === 1;
            return (
              <div
                key={session.slug}
                className={`p-5 rounded-xl border transition-all ${
                  isUnlocked
                    ? 'bg-slate-900/90 border-indigo-500/40 hover:border-indigo-500 shadow-md'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    Session {session.order}
                  </span>
                  {isUnlocked ? (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-100">{session.title}</h4>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{session.description}</p>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-mono">{session.topics.length} Technical Topics</span>
                  {isUnlocked ? (
                    <Link
                      href={`/sessions/${session.slug}`}
                      className="font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                    >
                      <span>Study Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="text-slate-600">Requires Session {session.order - 1} Pass</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
