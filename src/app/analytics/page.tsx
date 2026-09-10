'use client';

import React from 'react';
import { BarChart3, TrendingUp, Award, Clock, Code, CheckCircle2, Shield, Flame } from 'lucide-react';

interface ReadinessWeight {
  category: string;
  weight: number;
  score: number;
  grade: string;
}

const CATEGORY_BREAKDOWN: ReadinessWeight[] = [
  { category: 'Core Java & JVM', weight: 15, score: 84, grade: 'Strong' },
  { category: 'Spring Boot & Framework', weight: 15, score: 82, grade: 'Strong' },
  { category: 'Microservices & Distributed Patterns', weight: 15, score: 76, grade: 'Proficient' },
  { category: 'System Design Architecture', weight: 15, score: 78, grade: 'Proficient' },
  { category: 'SQL & Database Optimization', weight: 10, score: 72, grade: 'Proficient' },
  { category: 'Enterprise Security & Authentication', weight: 10, score: 88, grade: 'Strong' },
  { category: 'Hands-on Coding & Algorithms', weight: 10, score: 70, grade: 'Improving' },
  { category: 'Candidate Project Knowledge', weight: 10, score: 92, grade: 'Mastery' },
];

export default function AnalyticsPage() {
  // Weighted overall readiness calculation
  const weightedReadiness = Math.round(
    CATEGORY_BREAKDOWN.reduce((acc, curr) => acc + (curr.score * curr.weight) / 100, 0)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Interview Readiness Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">
          Multidimensional competency matrix and weighted readiness scoring calibrated for Senior Software Engineer (5+ YOE) interviews.
        </p>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Composite Readiness</span>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">{weightedReadiness}%</div>
          <span className="text-[11px] text-emerald-400 font-medium">Senior L5 Qualified</span>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Daily Practice Streak</span>
          <div className="text-2xl font-extrabold text-amber-400 font-mono flex items-center space-x-1.5">
            <Flame className="w-5 h-5 fill-amber-400" />
            <span>7 Days</span>
          </div>
          <span className="text-[11px] text-slate-500">Target: 30-Day Milestone</span>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Study Time</span>
          <div className="text-2xl font-extrabold text-slate-100 font-mono">18.5 Hrs</div>
          <span className="text-[11px] text-indigo-400 font-medium">+4.2 hrs this week</span>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Average Test Accuracy</span>
          <div className="text-2xl font-extrabold text-emerald-400 font-mono">81.4%</div>
          <span className="text-[11px] text-slate-500">Across 14 practice tests</span>
        </div>
      </div>

      {/* Category Breakdown Table & Weights */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white">Weighted Competency Matrix</h2>
          <p className="text-xs text-slate-400 mt-1">
            Readiness scoring is distributed according to senior software engineering interview benchmarks:
          </p>
        </div>

        <div className="space-y-3">
          {CATEGORY_BREAKDOWN.map((item) => (
            <div
              key={item.category}
              className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1 min-w-[240px]">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-200">{item.category}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      item.grade === 'Mastery'
                        ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                        : item.grade === 'Strong'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {item.grade}
                  </span>
                </div>
                <span className="text-slate-500 text-[11px]">Weight in final score: {item.weight}%</span>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 max-w-md w-full">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Proficiency</span>
                  <span className="font-mono text-indigo-400 font-bold">{item.score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      item.score >= 80 ? 'bg-emerald-500' : item.score >= 70 ? 'bg-indigo-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
