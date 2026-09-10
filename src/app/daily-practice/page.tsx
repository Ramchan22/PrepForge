'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react';
import { SEED_QUESTIONS } from '@/data/curriculum/questionsData';
import { ScorecardModal } from '@/components/practice/ScorecardModal';

export default function DailyPracticePage() {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60); // 25 minutes
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [showScorecard, setShowScorecard] = useState<boolean>(false);
  const [scoreData, setScoreData] = useState<{
    score: number;
    totalMarks: number;
    accuracy: number;
    timeTakenSeconds: number;
    weakTopics: string[];
  }>({
    score: 0,
    totalMarks: 100,
    accuracy: 0,
    timeTakenSeconds: 0,
    weakTopics: [],
  });

  useEffect(() => {
    if (isSubmitted) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted]);

  const questions = SEED_QUESTIONS;
  const currentQ = questions[currentIdx];

  const handleSelectOption = (optId: string) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [currentIdx]: optId }));
  };

  const handleSubmitTest = () => {
    let correctCount = 0;
    const weakList: string[] = [];

    questions.forEach((q, idx) => {
      const selected = answers[idx];
      if (selected === q.correctAnswer) {
        correctCount += 1;
      } else {
        if (q.title.includes('HashMap')) weakList.push('HashMap Internal Implementation & Bitwise Spreading');
        if (q.title.includes('Refresh Token')) weakList.push('JWT Token Rotation & Replay Attack Defense');
        if (q.title.includes('Index')) weakList.push('SQL Composite Index Optimization');
      }
    });

    const calculatedScore = Math.round((correctCount / questions.length) * 100);
    const accuracy = Math.round((correctCount / Object.keys(answers).length || 1) * 100);

    setScoreData({
      score: calculatedScore,
      totalMarks: 100,
      accuracy,
      timeTakenSeconds: 25 * 60 - timeLeft,
      weakTopics: weakList.length > 0 ? weakList : ['Concurrent Collections'],
    });

    setIsSubmitted(true);
    setShowScorecard(true);
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentIdx(0);
    setTimeLeft(25 * 60);
    setIsSubmitted(false);
    setShowScorecard(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {showScorecard && (
        <ScorecardModal
          score={scoreData.score}
          totalMarks={scoreData.totalMarks}
          accuracy={scoreData.accuracy}
          timeTakenSeconds={scoreData.timeTakenSeconds}
          weakTopics={scoreData.weakTopics}
          onRetry={handleRetry}
          onClose={() => setShowScorecard(false)}
        />
      )}

      {/* Header & Timer Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div>
          <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider block">
            Adaptive Senior Evaluation
          </span>
          <h1 className="text-xl font-bold text-white">Today&apos;s Daily Practice Test</h1>
        </div>

        <div className="flex items-center space-x-3">
          {/* Timer */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-200">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
          </div>

          <button
            onClick={handleSubmitTest}
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Submit Test
          </button>
        </div>
      </div>

      {/* Question Pagination Pills */}
      <div className="flex flex-wrap gap-2">
        {questions.map((q, idx) => {
          const isAnswered = answers[idx] !== undefined;
          const isCurrent = currentIdx === idx;
          return (
            <button
              key={idx}
              onClick={() => setCurrentIdx(idx)}
              className={`w-9 h-9 rounded-lg text-xs font-bold font-mono transition-all ${
                isCurrent
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 shadow-md'
                  : isAnswered
                  ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Main Question Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/95 border border-slate-800 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
          <span className="font-mono text-slate-400">
            QUESTION {currentIdx + 1} OF {questions.length}
          </span>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
              {currentQ.type}
            </span>
            <span
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                currentQ.difficulty === 'EXPERT'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
              }`}
            >
              {currentQ.difficulty}
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-100 leading-relaxed">{currentQ.title}</h2>
          <p className="text-sm text-slate-200 mt-2 whitespace-pre-line leading-relaxed">{currentQ.prompt}</p>
        </div>

        {/* Options */}
        {currentQ.options.length > 0 ? (
          <div className="space-y-3 pt-2">
            {currentQ.options.map((opt) => {
              const isSelected = answers[currentIdx] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`w-full p-4 rounded-xl text-left text-xs md:text-sm transition-all flex items-start space-x-3 cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/20 border-2 border-indigo-500 text-slate-100 shadow-md'
                      : 'bg-[#070b14] border border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 mt-0.5 ${
                      isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {opt.id}
                  </span>
                  <span className="leading-relaxed">{opt.text}</span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Conceptual / Open Question */
          <div className="space-y-2">
            <textarea
              placeholder="Type your architectural reasoning and technical answer here..."
              value={answers[currentIdx] || ''}
              onChange={(e) => setAnswers({ ...answers, [currentIdx]: e.target.value })}
              className="w-full h-32 p-3 rounded-lg bg-[#070b14] border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 resize-none font-sans"
            />
          </div>
        )}

        {/* Navigation bottom bar */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
            disabled={currentIdx === 0}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center space-x-1.5 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          {currentIdx < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIdx((i) => Math.min(questions.length - 1, i + 1))}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmitTest}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-emerald-600/30 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Daily Test</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
