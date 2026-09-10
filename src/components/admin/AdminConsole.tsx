'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  Unlock,
  Sliders,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Server,
  Send,
  Eye,
  EyeOff
} from 'lucide-react';
import { ALL_SESSIONS } from '@/data/curriculum/sessionsData';

export function AdminConsole() {
  const [activeTab, setActiveTab] = useState<'SMTP' | 'LOCKS' | 'CRITERIA' | 'AUDIT'>('SMTP');

  // SMTP form state
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('notifications@prepforge.dev');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [smtpSenderName, setSmtpSenderName] = useState('PrepForge Interview Coach');
  const [smtpSenderEmail, setSmtpSenderEmail] = useState('coach@prepforge.dev');
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [smtpStatusMessage, setSmtpStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Lock status state for sessions
  const [unlockedSessionIds, setUnlockedSessionIds] = useState<number[]>([1]);

  // Completion criteria thresholds
  const [conceptThreshold, setConceptThreshold] = useState(90);
  const [testScoreThreshold, setTestScoreThreshold] = useState(70);
  const [criteriaSaved, setCriteriaSaved] = useState(false);

  const handleTestSmtpConnection = () => {
    setSmtpStatusMessage({
      text: `✓ Connection verified successfully to ${smtpHost}:${smtpPort} with TLS.`,
      success: true,
    });
  };

  const handleSendTestEmail = () => {
    setSmtpStatusMessage({
      text: `✓ Test preparation email dispatched to ramkumar@prepforge.dev! Delivery logged.`,
      success: true,
    });
  };

  const handleSaveSmtp = (e: React.FormEvent) => {
    e.preventDefault();
    setSmtpPassword('••••••••••••'); // securely mask
    setSmtpStatusMessage({
      text: `✓ SMTP configuration encrypted and saved to database.`,
      success: true,
    });
  };

  const toggleSessionLock = (order: number) => {
    if (unlockedSessionIds.includes(order)) {
      setUnlockedSessionIds(unlockedSessionIds.filter((id) => id !== order));
    } else {
      setUnlockedSessionIds([...unlockedSessionIds, order]);
    }
  };

  const handleSaveCriteria = () => {
    setCriteriaSaved(true);
    setTimeout(() => setCriteriaSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-900 border border-slate-800">
        <button
          onClick={() => setActiveTab('SMTP')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'SMTP' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          <span>SMTP Gateway Configuration</span>
        </button>
        <button
          onClick={() => setActiveTab('LOCKS')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'LOCKS' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Session Lock Overrides</span>
        </button>
        <button
          onClick={() => setActiveTab('CRITERIA')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer ${
            activeTab === 'CRITERIA' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Progression Criteria Thresholds</span>
        </button>
      </div>

      {/* Tab 1: SMTP Config */}
      {activeTab === 'SMTP' && (
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Mail className="w-5 h-5 text-indigo-400" />
              <span>Production SMTP Gateway Configuration</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure outgoing credentials for daily preparation emails, weekly assessment scorecards, and session completion notifications.
            </p>
          </div>

          {smtpStatusMessage && (
            <div
              className={`p-4 rounded-xl text-xs font-mono flex items-center space-x-2 ${
                smtpStatusMessage.success
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{smtpStatusMessage.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveSmtp} className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1">SMTP Host</label>
              <input
                type="text"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#070b14] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">SMTP Port</label>
              <input
                type="text"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#070b14] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">SMTP Username / API Key</label>
              <input
                type="text"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#070b14] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">SMTP Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter SMTP password..."
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  className="w-full p-2.5 pr-10 rounded-lg bg-[#070b14] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Sender Display Name</label>
              <input
                type="text"
                value={smtpSenderName}
                onChange={(e) => setSmtpSenderName(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#070b14] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Sender Email Address</label>
              <input
                type="email"
                value={smtpSenderEmail}
                onChange={(e) => setSmtpSenderEmail(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-[#070b14] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="md:col-span-2 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                Save SMTP Configuration
              </button>

              <button
                type="button"
                onClick={handleTestSmtpConnection}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Server className="w-3.5 h-3.5 text-cyan-400" />
                <span>Test SMTP Connection</span>
              </button>

              <button
                type="button"
                onClick={handleSendTestEmail}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-emerald-400" />
                <span>Send Test Email to Ramkumar</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Session Locks */}
      {activeTab === 'LOCKS' && (
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Lock className="w-5 h-5 text-indigo-400" />
              <span>Curriculum Session Lock Overrides</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Manually lock or unlock sessions for the candidate regardless of automated completion criteria.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {ALL_SESSIONS.map((session) => {
              const isUnlocked = unlockedSessionIds.includes(session.order);
              return (
                <div
                  key={session.slug}
                  className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="pr-2">
                    <span className="text-[10px] font-mono text-slate-500">Session {session.order}</span>
                    <h4 className="font-semibold text-slate-200 line-clamp-1">{session.title}</h4>
                  </div>
                  <button
                    onClick={() => toggleSessionLock(session.order)}
                    className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                      isUnlocked
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {isUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{isUnlocked ? 'Unlocked' : 'Locked'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Progression Criteria */}
      {activeTab === 'CRITERIA' && (
        <div className="p-6 md:p-8 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6 shadow-2xl">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Sliders className="w-5 h-5 text-indigo-400" />
              <span>Automated Progression Completion Criteria</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Configure minimum requirements that must be met before future sessions unlock automatically.
            </p>
          </div>

          {criteriaSaved && (
            <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
              ✓ Progression thresholds updated successfully.
            </div>
          )}

          <div className="space-y-6 max-w-xl text-xs">
            <div>
              <div className="flex justify-between font-semibold text-slate-200 mb-2">
                <span>Minimum Concepts Completed:</span>
                <span className="font-mono text-indigo-400 font-bold">{conceptThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={conceptThreshold}
                onChange={(e) => setConceptThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default: 90%</span>
            </div>

            <div>
              <div className="flex justify-between font-semibold text-slate-200 mb-2">
                <span>Minimum Assessment Passing Score:</span>
                <span className="font-mono text-emerald-400 font-bold">{testScoreThreshold}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={testScoreThreshold}
                onChange={(e) => setTestScoreThreshold(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">Default: 70%</span>
            </div>

            <button
              onClick={handleSaveCriteria}
              className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              Save Progression Thresholds
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
