import React from 'react';
import { ProjectDeepDiveExplorer } from '@/components/resume/ProjectDeepDiveExplorer';

export default function ResumeDeepDivePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Candidate Production Project Deep-Dive
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed technical exploration of your 6 real-world enterprise architectures: WealthServ 2.0, Barjeel MF, Foreign Custody NRI, Reusable eSign, Workflow Management, and UPEX/IESCMS.
        </p>
      </div>

      <ProjectDeepDiveExplorer />
    </div>
  );
}
