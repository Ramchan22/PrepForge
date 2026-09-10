'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Code2,
  FileText,
  AlertOctagon,
  HelpCircle,
  Sparkles,
  Layers,
  ChevronDown,
  ChevronUp,
  Share2,
  Check
} from 'lucide-react';
import { MermaidViewer } from '@/components/diagrams/MermaidViewer';
import { SEED_CONCEPTS } from '@/data/curriculum/conceptsData';
import { ALL_SESSIONS } from '@/data/curriculum/sessionsData';

export default function ConceptViewerPage({
  params,
}: {
  params: { topicSlug: string; conceptSlug: string };
}) {
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);
  const [noteText, setNoteText] = useState<string>('');
  const [noteSaved, setNoteSaved] = useState<boolean>(false);

  // Find concept from seed concepts or fallback synthesis
  const concept =
    SEED_CONCEPTS.find((c) => c.slug === params.conceptSlug || c.topicSlug === params.topicSlug) ||
    SEED_CONCEPTS[0];

  // Find parent session
  const parentSession = ALL_SESSIONS.find((s) =>
    s.topics.some((t) => t.slug === params.topicSlug)
  ) || ALL_SESSIONS[0];

  const handleSaveNote = () => {
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumb navigation */}
      <div className="flex items-center space-x-2 text-xs text-slate-400">
        <Link href="/sessions" className="hover:text-slate-200 transition-colors">Curriculum</Link>
        <span>/</span>
        <Link href={`/sessions/${parentSession.slug}`} className="hover:text-slate-200 transition-colors">
          {parentSession.title}
        </Link>
        <span>/</span>
        <span className="text-slate-200 truncate">{concept.title}</span>
      </div>

      {/* Concept Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main 12-Section Content */}
        <div className="lg:col-span-8 space-y-8">
          {/* Header Title & Actions */}
          <div className="pb-4 border-b border-slate-800">
            <span className="text-[11px] font-mono text-indigo-400 font-semibold uppercase tracking-wider block mb-1">
              Senior Concept Deep-Dive
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {concept.title}
            </h1>
          </div>

          {/* Section 1: What is it? */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-indigo-600/20 text-indigo-400 text-xs flex items-center justify-center font-mono">1</span>
              <span>What is it?</span>
            </h2>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 text-slate-200 text-xs md:text-sm leading-relaxed">
              {concept.summary}
            </div>
          </section>

          {/* Section 2: Why does it exist? */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-indigo-600/20 text-indigo-400 text-xs flex items-center justify-center font-mono">2</span>
              <span>Why does it exist? (Problem it Solves)</span>
            </h2>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 text-slate-200 text-xs md:text-sm leading-relaxed">
              {concept.whyExists}
            </div>
          </section>

          {/* Section 3: How does it work? */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-indigo-600/20 text-indigo-400 text-xs flex items-center justify-center font-mono">3</span>
              <span>How does it work? (Internal Mechanics)</span>
            </h2>
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800/90 text-slate-200 text-xs md:text-sm leading-relaxed whitespace-pre-line font-sans">
              {concept.howItWorks}
            </div>
          </section>

          {/* Section 4: Internal Flow (Interactive Mermaid Diagram) */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-indigo-600/20 text-indigo-400 text-xs flex items-center justify-center font-mono">4</span>
              <span>Internal Flow Architecture</span>
            </h2>
            <MermaidViewer chart={concept.internalFlowMermaid} id={concept.slug} />
          </section>

          {/* Section 5: Real-World Example */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-indigo-600/20 text-indigo-400 text-xs flex items-center justify-center font-mono">5</span>
              <span>Real-World Fintech Production Scenario</span>
            </h2>
            <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-slate-200 text-xs md:text-sm leading-relaxed">
              <strong className="text-indigo-300 block mb-1">Production Case Study Context:</strong>
              {concept.fintechExample}
            </div>
          </section>

          {/* Section 6 & 7: Code Example & Code Walkthrough */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-indigo-600/20 text-indigo-400 text-xs flex items-center justify-center font-mono">6</span>
              <span>Production Code Implementation</span>
            </h2>
            <div className="rounded-xl bg-[#090e1a] border border-slate-800 overflow-hidden shadow-2xl">
              <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
                <span>{concept.codeLanguage.toUpperCase()}</span>
                <span className="text-indigo-400">Enterprise Standard</span>
              </div>
              <pre className="p-4 text-xs font-mono text-slate-100 overflow-x-auto leading-relaxed bg-[#070b14]">
                <code>{concept.codeSnippet}</code>
              </pre>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-2">
                <span className="w-4 h-4 rounded bg-indigo-600/20 text-indigo-400 text-[10px] flex items-center justify-center font-mono">7</span>
                <span>Line-by-Line Code Walkthrough</span>
              </h3>
              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                {concept.codeWalkthrough}
              </p>
            </div>
          </section>

          {/* Section 8: Common Mistakes */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-rose-500/20 text-rose-400 text-xs flex items-center justify-center font-mono">8</span>
              <span>Common Pitfalls &amp; Interview Traps</span>
            </h2>
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-500/25 space-y-2">
              <ul className="space-y-2 text-xs text-slate-200">
                {concept.commonMistakes.map((mistake, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-rose-400 font-bold shrink-0">✕</span>
                    <span>{mistake}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 9: Interview Questions */}
          <section className="space-y-3">
            <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-mono">9</span>
              <span>Curated Interview Questions (Beginner → Expert)</span>
            </h2>
            <div className="space-y-2">
              {concept.interviewQuestions.map((q, idx) => {
                const isExpanded = expandedQuestion === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-800 bg-slate-900/90 overflow-hidden transition-colors"
                  >
                    <button
                      onClick={() => setExpandedQuestion(isExpanded ? null : idx)}
                      className="w-full px-4 py-3 text-left flex items-center justify-between text-xs md:text-sm font-semibold text-slate-100 hover:text-indigo-300 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                          {q.difficulty}
                        </span>
                        <span>{q.question}</span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 bg-slate-950/40">
                        <strong className="text-emerald-400 block mb-1">Model Senior Answer:</strong>
                        {q.idealAnswer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 10: Follow-up Questions */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-mono">10</span>
              <span>Interviewer Follow-Up Probes</span>
            </h2>
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/25 space-y-2">
              <ul className="space-y-2 text-xs text-slate-200">
                {concept.followUpQuestions.map((fq, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold shrink-0">?</span>
                    <span>{fq}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Section 11: Quick Revision */}
          <section className="space-y-2">
            <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-indigo-600/20 text-indigo-400 text-xs flex items-center justify-center font-mono">11</span>
              <span>Quick Revision (High-Yield Checklist)</span>
            </h2>
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              {concept.quickRevision.map((bullet, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-200">
                  <span className="text-indigo-400 font-bold shrink-0">✓</span>
                  <span>{bullet}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Section 12: Related Topics */}
          <section className="space-y-2 pb-8">
            <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-2">
              <span className="w-5 h-5 rounded bg-indigo-600/20 text-indigo-400 text-xs flex items-center justify-center font-mono">12</span>
              <span>Related Technical Topics</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {concept.relatedTopics.map((topicName, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300 hover:border-indigo-500/40 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  {topicName}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* Right Sidebar: Progress & Actions */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 sticky top-24 shadow-xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Study Status &amp; Actions
            </h3>

            {/* Mark Completed Button */}
            <button
              onClick={() => setIsCompleted(!isCompleted)}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                isCompleted
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompleted ? 'Completed ✓' : 'Mark as Completed'}</span>
            </button>

            {/* Bookmark & Notes */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`flex-1 py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors ${
                  isBookmarked
                    ? 'border-amber-500/50 bg-amber-500/10 text-amber-300'
                    : 'border-slate-800 hover:bg-slate-800 text-slate-400'
                }`}
              >
                {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
              </button>
            </div>

            {/* Personal Notes Box */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <label className="text-[11px] font-semibold text-slate-400 block">Personal Interview Notes</label>
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write interview memory aids or personal examples..."
                className="w-full h-24 p-2.5 rounded-lg bg-[#070b14] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                onClick={handleSaveNote}
                className="w-full py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
              >
                {noteSaved ? 'Note Saved ✓' : 'Save Personal Note'}
              </button>
            </div>

            {/* Quick Practice Link */}
            <div className="pt-2 border-t border-slate-800/80">
              <Link
                href="/daily-practice"
                className="w-full py-2 px-3 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-xs font-semibold text-slate-200 flex items-center justify-center space-x-2 transition-colors block text-center"
              >
                <span>Take Practice Test on this Topic →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
