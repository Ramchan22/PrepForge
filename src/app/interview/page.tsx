import React from 'react';
import { InterviewSimulator } from '@/components/interview/InterviewSimulator';

export default function InterviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          AI Senior Technical Interview Simulator
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Interactive mock interview sessions tailored for 5+ YOE candidates across Java/Spring Boot, System Design, Microservices, and your production projects.
        </p>
      </div>

      <InterviewSimulator />
    </div>
  );
}
