import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, BookOpen, Clock, CheckCircle2, Lock, ArrowRight, Award, Shield } from 'lucide-react';
import { ALL_SESSIONS } from '@/data/curriculum/sessionsData';

export default function SessionDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const session = ALL_SESSIONS.find((s) => s.slug === params.slug);
  if (!session) {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Back button */}
      <Link
        href="/sessions"
        className="inline-flex items-center space-x-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Curriculum Sessions</span>
      </Link>

      {/* Session Header Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0e1628] to-slate-900 border border-slate-800 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 mb-2 font-bold">
              <span>SESSION {session.order} OF {ALL_SESSIONS.length}</span>
              <span>•</span>
              <span className="text-emerald-400">ACTIVE CURRICULUM</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">{session.title}</h1>
            <p className="text-xs md:text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
              {session.description}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs space-y-1.5 shrink-0">
            <div className="flex justify-between text-slate-400">
              <span>Estimated Duration:</span>
              <strong className="text-slate-200">{session.estimatedHours} Hours</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Topics Count:</span>
              <strong className="text-slate-200">{session.topics.length} Technical Topics</strong>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Completion Target:</span>
              <strong className="text-indigo-400">&gt;= 90% Concepts + 70% Test</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Topics List */}
      <div>
        <h2 className="text-base font-bold text-slate-100 mb-3 flex items-center space-x-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Technical Deep-Dive Topics</span>
        </h2>

        <div className="space-y-3">
          {session.topics.map((topic, index) => {
            // Determine concept link: map to seed concepts if available or to topic slug
            const conceptSlug =
              topic.slug === 'hashmap-internal-implementation'
                ? 'hashmap-internals-treeification'
                : topic.slug === 'jwt-rotating-refresh-token-reuse'
                ? 'jwt-rotating-refresh-tokens-reuse-detection'
                : topic.slug === 'cls-asynclocalstorage-multitenancy'
                ? 'cls-asynclocalstorage-multitenancy-deepdive'
                : `${topic.slug}-deepdive`;

            return (
              <div
                key={topic.slug}
                className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="flex items-start space-x-3.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-800 text-indigo-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-200 group-hover:text-indigo-300 transition-colors">
                        {topic.title}
                      </h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          topic.difficulty === 'EXPERT'
                            ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                            : topic.difficulty === 'ADVANCED'
                            ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                            : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {topic.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {topic.description}
                    </p>
                  </div>
                </div>

                <Link
                  href={`/concepts/${topic.slug}/${conceptSlug}`}
                  className="px-4 py-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 self-end md:self-center"
                >
                  <span>Read Concept Deep Dive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
