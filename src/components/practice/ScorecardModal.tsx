'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, XCircle, Clock, Trophy, AlertTriangle, ArrowRight, RotateCcw } from 'lucide-react';

interface ScorecardProps {
  score: number;
  totalMarks: number;
  accuracy: number;
  timeTakenSeconds: number;
  weakTopics: string[];
  onRetry: () => void;
  onClose: () => void;
}

export function ScorecardModal({
  score,
  totalMarks,
  accuracy,
  timeTakenSeconds,
  weakTopics,
  onRetry,
  onClose,
}: ScorecardProps) {
  const isPassed = (score / totalMarks) >= 0.7; // >= 70% threshold

  const minutes = Math.floor(timeTakenSeconds / 60);
  const seconds = timeTakenSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <div className="w-full max-w-lg rounded-2xl bg-[#0d1322] border border-slate-700/80 shadow-2xl p-6 md:p-8 space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header Badge */}
        <div className="text-center space-y-2">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${
              isPassed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}
          >
            {isPassed ? <Trophy className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {isPassed ? 'Daily Assessment Passed! 🎉' : 'Assessment Needs Revision ⚠️'}
          </h2>
          <p className="text-xs text-slate-400">
            {isPassed
              ? 'Great job! Your performance satisfies the completion criteria for the active session.'
              : 'Score is below the 70% progression threshold. Revise the identified weak topics below and retry.'}
          </p>
        </div>

        {/* Score metrics */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Final Score</span>
            <span className="text-xl font-black text-indigo-400 font-mono">
              {score}/{totalMarks}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Accuracy</span>
            <span className={`text-xl font-black font-mono ${accuracy >= 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {accuracy}%
            </span>
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Time Taken</span>
            <span className="text-xl font-black text-slate-200 font-mono">
              {minutes}m {seconds}s
            </span>
          </div>
        </div>

        {/* Weak Areas List */}
        {weakTopics.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center space-x-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Targeted Weak Topics Identified:</span>
            </h4>
            <div className="space-y-1.5">
              {weakTopics.map((topic, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center justify-between">
                  <span>{topic}</span>
                  <span className="text-[10px] font-mono text-rose-400 font-bold">Needs Review</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRetry}
            className="flex-1 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retry Assessment</span>
          </button>

          <Link
            href="/revision"
            className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <span>Revise Weak Areas →</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
