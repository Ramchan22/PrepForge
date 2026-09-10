import React from 'react';
import Link from 'next/link';
import { Lock, Unlock, CheckCircle2, ArrowRight, Clock, BookOpen, ShieldAlert } from 'lucide-react';
import { ALL_SESSIONS } from '@/data/curriculum/sessionsData';

export default function SessionsListPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">23 Curriculum Sessions</h1>
          <p className="text-xs text-slate-400 mt-1">
            Progression-locked preparation track engineered for senior software engineers (5+ YOE). Each session unlocks only after satisfying completion criteria.
          </p>
        </div>

        <Link
          href="/admin"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-indigo-300 hover:border-indigo-500/40 transition-colors flex items-center space-x-1.5 shrink-0"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          <span>Admin Unlock Controls</span>
        </Link>
      </div>

      {/* Grid of all 23 sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {ALL_SESSIONS.map((session) => {
          const isUnlocked = session.order === 1; // Default: Session 1 unlocked
          return (
            <div
              key={session.slug}
              className={`rounded-xl border transition-all flex flex-col justify-between p-5 ${
                isUnlocked
                  ? 'bg-slate-900/90 border-indigo-500/40 hover:border-indigo-500 shadow-lg shadow-indigo-500/5'
                  : 'bg-slate-950/60 border-slate-800/80 opacity-80'
              }`}
            >
              <div>
                {/* Header tag */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-indigo-300">
                    SESSION {session.order}
                  </span>
                  {isUnlocked ? (
                    <span className="text-xs font-semibold text-emerald-400 flex items-center space-x-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/25">
                      <Unlock className="w-3 h-3" />
                      <span>Unlocked</span>
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-slate-500 flex items-center space-x-1 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/80">
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-100">{session.title}</h3>
                <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {session.description}
                </p>

                {/* Topics list preview */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">
                    Core Technical Topics ({session.topics.length}):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {session.topics.slice(0, 3).map((t) => (
                      <span
                        key={t.slug}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-800/70 border border-slate-700/50 text-slate-300 line-clamp-1"
                      >
                        {t.title}
                      </span>
                    ))}
                    {session.topics.length > 3 && (
                      <span className="text-[10px] text-slate-500 self-center">
                        +{session.topics.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action footer */}
              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>~{session.estimatedHours} Hours</span>
                </span>

                {isUnlocked ? (
                  <Link
                    href={`/sessions/${session.slug}`}
                    className="font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                  >
                    <span>Enter Session</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <span className="text-slate-600 text-[11px]">
                    Pass Session {session.order - 1} to Unlock
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
