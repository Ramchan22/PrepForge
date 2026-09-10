'use client';

import React, { useState } from 'react';
import { Award, Layers, Shield, CheckCircle2, ChevronRight, BookOpen, ExternalLink, HelpCircle } from 'lucide-react';
import { SEED_RESUME_PROJECTS, ResumeProjectData } from '@/data/curriculum/resumeData';
import { MermaidViewer } from '../diagrams/MermaidViewer';
import Link from 'next/link';

export function ProjectDeepDiveExplorer() {
  const [selectedSlug, setSelectedSlug] = useState<string>(SEED_RESUME_PROJECTS[0].slug);
  const project = SEED_RESUME_PROJECTS.find((p) => p.slug === selectedSlug) || SEED_RESUME_PROJECTS[0];

  return (
    <div className="space-y-6">
      {/* Project Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
        {SEED_RESUME_PROJECTS.map((p) => {
          const isSelected = p.slug === selectedSlug;
          return (
            <button
              key={p.slug}
              onClick={() => setSelectedSlug(p.slug)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 font-bold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {p.name.split('—')[0].trim()}
            </button>
          );
        })}
      </div>

      {/* Main Project Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 cols: Architecture, Data Flow, Key Highlights */}
        <div className="lg:col-span-8 space-y-6">
          {/* Header Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0e1628] to-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center space-x-2 text-xs font-mono text-indigo-400 font-bold">
              <span>CANDIDATE PRODUCTION EXPERIENCE</span>
              <span>•</span>
              <span className="text-emerald-400">FINTECH DOMAIN</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white">{project.name}</h2>
            <p className="text-xs text-slate-300 leading-relaxed">{project.subtitle}</p>

            {/* Tech Stack Badges */}
            <div className="flex flex-wrap gap-1.5 pt-2">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[11px] font-mono text-indigo-300 border border-slate-700/60"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Overview */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-2">
              <Layers className="w-4 h-4" />
              <span>Architecture &amp; System Overview</span>
            </h3>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans">{project.description}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{project.architectureOverview}</p>
          </div>

          {/* Mermaid Data Flow Diagram */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-200 flex items-center space-x-2">
              <span>Lifecycle &amp; Integration Flow Diagram</span>
            </h3>
            <MermaidViewer chart={project.dataFlowMermaid} id={`project-${project.slug}`} />
          </div>

          {/* Key Technical Highlights */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-2">
              <Shield className="w-4 h-4" />
              <span>Architectural Highlights &amp; Inventions</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {project.keyHighlights.map((highlight, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-200 flex items-start space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 cols: Deep-Dive Interview Questions & Probes */}
        <div className="lg:col-span-4 space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 sticky top-24 shadow-xl">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
              <HelpCircle className="w-4 h-4" />
              <span>Interviewer Question Bank</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Questions interviewers will ask regarding your decisions in {project.name.split('—')[0].trim()}:
            </p>

            <div className="space-y-3">
              {project.deepDiveQuestions.map((q, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-[#070b14] border border-slate-800 space-y-2 text-xs">
                  <span className="text-[10px] font-mono text-indigo-400 font-bold uppercase block">
                    {q.focusArea}
                  </span>
                  <p className="font-semibold text-slate-100">{q.question}</p>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
                    <strong className="text-emerald-400 block mb-0.5">Model Answer Guide:</strong>
                    {q.modelAnswerGuide}
                  </div>
                  <div className="pt-1 text-[11px] text-amber-300/90">
                    <strong>Interviewer Follow-Up Probe:</strong> {q.interviewerFollowUp}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <Link
                href="/interview"
                className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all block text-center cursor-pointer"
              >
                <span>Launch Mock Interview on this Project →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
