'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RotateCcw, AlertTriangle, Bookmark, HelpCircle, ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';

interface RevisionItem {
  id: string;
  type: 'WEAK_TOPIC' | 'BOOKMARK' | 'FAILED_QUESTION';
  title: string;
  category: string;
  summary: string;
  actionUrl: string;
}

const REVISION_ITEMS: RevisionItem[] = [
  {
    id: '1',
    type: 'WEAK_TOPIC',
    title: 'ConcurrentHashMap CAS Mechanics & Treeification',
    category: 'Collections Framework',
    summary: 'Accuracy on recent daily tests dropped below 45%. Review CAS compare-and-swap loop, volatile bin root, and table resize transfer.',
    actionUrl: '/concepts/hashmap-internal-implementation/hashmap-internals-treeification',
  },
  {
    id: '2',
    type: 'WEAK_TOPIC',
    title: 'SQL Window Functions (LEAD / LAG / Running Totals)',
    category: 'Relational Database',
    summary: 'Missed question on PARTITION BY vs ORDER BY window frame buffering. Practice investor portfolio running balance problem.',
    actionUrl: '/playground?slug=sql-investor-running-balance',
  },
  {
    id: '3',
    type: 'FAILED_QUESTION',
    title: 'Spring Security Rotating Refresh Token Reuse Detection',
    category: 'Spring Security',
    summary: 'Selected option Coexist instead of Revoke Entire Family on replay attack. Review RFC 6749 BCP security guidelines.',
    actionUrl: '/concepts/jwt-rotating-refresh-token-reuse/jwt-rotating-refresh-tokens-reuse-detection',
  },
  {
    id: '4',
    type: 'BOOKMARK',
    title: 'CLS (AsyncLocalStorage) Multi-Tenancy Architecture in NestJS',
    category: 'Node.js & NestJS',
    summary: 'Bookmarked for review before upcoming WealthServ 2.0 system architecture mock interview round.',
    actionUrl: '/concepts/cls-asynclocalstorage-multitenancy/cls-asynclocalstorage-multitenancy-deepdive',
  },
];

export default function RevisionModePage() {
  const [filter, setFilter] = useState<'ALL' | 'WEAK_TOPIC' | 'BOOKMARK' | 'FAILED_QUESTION'>('ALL');

  const filteredItems = filter === 'ALL' ? REVISION_ITEMS : REVISION_ITEMS.filter((item) => item.type === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Revision Mode</h1>
          <p className="text-xs text-slate-400 mt-1">
            Targeted review workspace filtering exclusively for your active weak areas, previously incorrect questions, and bookmarked concepts.
          </p>
        </div>

        <Link
          href="/daily-practice"
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Launch Adaptive Revision Quiz</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'ALL' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Items ({REVISION_ITEMS.length})
        </button>
        <button
          onClick={() => setFilter('WEAK_TOPIC')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'WEAK_TOPIC' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Weak Areas (2)
        </button>
        <button
          onClick={() => setFilter('FAILED_QUESTION')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'FAILED_QUESTION' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Failed Questions (1)
        </button>
        <button
          onClick={() => setFilter('BOOKMARK')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filter === 'BOOKMARK' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Bookmarks (1)
        </button>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start space-x-3.5">
              <div className="p-2 rounded-lg bg-slate-800 text-slate-300 mt-0.5 shrink-0">
                {item.type === 'WEAK_TOPIC' && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                {item.type === 'FAILED_QUESTION' && <RotateCcw className="w-4 h-4 text-amber-400" />}
                {item.type === 'BOOKMARK' && <Bookmark className="w-4 h-4 text-cyan-400" />}
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.summary}</p>
              </div>
            </div>

            <Link
              href={item.actionUrl}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 self-end md:self-center"
            >
              <span>Review Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
