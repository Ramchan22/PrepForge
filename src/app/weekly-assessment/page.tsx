'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Award, BarChart3, AlertCircle, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';

interface Section {
  id: string;
  name: string;
  questionCount: number;
  weightPercent: number;
}

const SECTIONS: Section[] = [
  { id: 'SEC_A', name: 'Section A — Java Core & JVM Internals', questionCount: 10, weightPercent: 15 },
  { id: 'SEC_B', name: 'Section B — Spring Boot & Spring Security', questionCount: 10, weightPercent: 15 },
  { id: 'SEC_C', name: 'Section C — Relational Database & SQL', questionCount: 5, weightPercent: 10 },
  { id: 'SEC_D', name: 'Section D — Microservices & Distributed Patterns', questionCount: 5, weightPercent: 15 },
  { id: 'SEC_E', name: 'Section E — System Design Architecture Blueprint', questionCount: 1, weightPercent: 15 },
  { id: 'SEC_F', name: 'Section F — Live Coding & Problem Solving', questionCount: 2, weightPercent: 10 },
  { id: 'SEC_G', name: 'Section G — Project Deep Dive (WealthServ / eSign)', questionCount: 5, weightPercent: 10 },
  { id: 'SEC_H', name: 'Section H — Behavioral & Engineering Leadership', questionCount: 3, weightPercent: 10 },
];

export default function WeeklyAssessmentPage() {
  const [activeSectionId, setActiveSectionId] = useState<string>(SECTIONS[0].id);
  const [isAssessmentStarted, setIsAssessmentStarted] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const activeSection = SECTIONS.find((s) => s.id === activeSectionId) || SECTIONS[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Weekly Comprehensive Assessment
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Rigorous 8-section senior software engineer evaluation (Sections A–H) generating your multidimensional readiness radar.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5" />
          <span>Scheduled Every 7 Days</span>
        </div>
      </div>

      {!isAssessmentStarted ? (
        /* Assessment Overview & Readiness Checklist */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-xl">
            <div>
              <h2 className="text-lg font-bold text-white">8-Section Assessment Structure</h2>
              <p className="text-xs text-slate-400 mt-1">
                Standard senior software engineering evaluation blueprint covering theoretical mechanics, hands-on coding, and system design.
              </p>
            </div>

            <div className="space-y-3">
              {SECTIONS.map((sec, idx) => (
                <div
                  key={sec.id}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded-md bg-indigo-600/20 text-indigo-400 font-mono text-[11px] font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold text-slate-200">{sec.name}</h4>
                      <span className="text-slate-500 text-[11px]">{sec.questionCount} Questions</span>
                    </div>
                  </div>
                  <span className="font-mono text-indigo-300 font-bold bg-slate-900 px-2.5 py-1 rounded border border-slate-800">
                    Weight: {sec.weightPercent}%
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsAssessmentStarted(true)}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Launch Weekly Mock Assessment (90 Minutes) →
              </button>
            </div>
          </div>

          {/* Right 4 cols: Historical Radar & Passing Threshold */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Evaluation Standards
              </h3>
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Score:</span>
                  <strong className="text-emerald-400">&gt;= 75% for L5/Senior</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <strong className="text-slate-200">90 Minutes</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Coding Rounds:</span>
                  <strong className="text-slate-200">2 Hands-on Problems</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">System Design:</span>
                  <strong className="text-slate-200">1 Full Architecture</strong>
                </div>
              </div>

              <div className="pt-2 text-xs text-slate-400 leading-relaxed">
                Completing weekly assessments dynamically updates your <strong>Interview Readiness Score</strong> and recalibrates daily practice questions toward remaining blind spots.
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Active Weekly Test Interface */
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <span className="text-xs font-mono font-bold text-indigo-400">{activeSection.name}</span>
              <h2 className="text-lg font-bold text-white mt-1">Section Question 1 of {activeSection.questionCount}</h2>
            </div>
            <button
              onClick={() => setIsAssessmentStarted(false)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Exit to Overview
            </button>
          </div>

          <div className="p-4 rounded-xl bg-[#070b14] border border-slate-800 text-xs text-slate-300 leading-relaxed font-mono">
            // Weekly Assessment Section Active. Full question suite loaded from curriculum seed bank.
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                const nextIdx = (SECTIONS.findIndex((s) => s.id === activeSectionId) + 1) % SECTIONS.length;
                setActiveSectionId(SECTIONS[nextIdx].id);
              }}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
            >
              Next Section →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
