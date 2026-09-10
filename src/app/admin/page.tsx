import React from 'react';
import { AdminConsole } from '@/components/admin/AdminConsole';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Administrator Command Console
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage outgoing SMTP gateways, session lock overrides, and candidate progression criteria thresholds.
        </p>
      </div>

      <AdminConsole />
    </div>
  );
}
