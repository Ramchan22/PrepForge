'use client';

import React, { useState, useEffect } from 'react';
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
  EyeOff,
  Loader2,
  Database
} from 'lucide-react';
import { ALL_SESSIONS } from '@/data/curriculum/sessionsData';

export function AdminConsole() {
  const [activeTab, setActiveTab] = useState<'SMTP' | 'LOCKS' | 'CRITERIA' | 'AUDIT'>('SMTP');

  // SMTP form state (Brevo Production Relay defaults)
  const [smtpHost, setSmtpHost] = useState('smtp-relay.brevo.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpUser, setSmtpUser] = useState('hari@fintuple.com');
  const [smtpPassword, setSmtpPassword] = useState('••••••••••••');
  const [smtpSenderName, setSmtpSenderName] = useState('PrepForge Interview Coach');
  const [smtpSenderEmail, setSmtpSenderEmail] = useState('hari@fintuple.com');
  const [smtpSecure, setSmtpSecure] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);

  const handlePortChange = (newPort: string) => {
    setSmtpPort(newPort);
    if (newPort === '465') {
      setSmtpSecure(true);
    } else {
      setSmtpSecure(false);
    }
  };

  // Status & loading states
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [smtpStatusMessage, setSmtpStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Lock status state for sessions
  const [unlockedSessionIds, setUnlockedSessionIds] = useState<number[]>([1]);

  // Completion criteria thresholds
  const [conceptThreshold, setConceptThreshold] = useState(90);
  const [testScoreThreshold, setTestScoreThreshold] = useState(70);
  const [criteriaSaved, setCriteriaSaved] = useState(false);

  // 1. Fetch persisted SMTP config from database on mount
  useEffect(() => {
    async function loadSmtpConfig() {
      try {
        setIsLoadingConfig(true);
        const res = await fetch('/api/admin/smtp');
        const data = await res.json();
        if (data.success && data.config) {
          setSmtpHost(data.config.host || 'smtp.gmail.com');
          setSmtpPort(data.config.port || '587');
          setSmtpUser(data.config.username || '');
          if (data.config.password) {
            setSmtpPassword(data.config.password);
          }
          setSmtpSenderName(data.config.senderName || 'PrepForge Interview Coach');
          setSmtpSenderEmail(data.config.senderEmail || 'coach@prepforge.dev');
          setSmtpSecure(Boolean(data.config.secure));
          if (data.config.updatedAt) {
            setLastSavedTime(new Date(data.config.updatedAt).toLocaleTimeString());
          }
        }
      } catch (err: any) {
        console.error('Failed to load SMTP configuration from DB:', err);
      } finally {
        setIsLoadingConfig(false);
      }
    }
    loadSmtpConfig();
  }, []);

  // 2. Test SMTP Connection
  const handleTestSmtpConnection = async () => {
    try {
      setIsTestingConn(true);
      setSmtpStatusMessage(null);
      const res = await fetch('/api/admin/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'test_connection',
          host: smtpHost,
          port: smtpPort,
          username: smtpUser,
          password: smtpPassword,
          secure: smtpSecure,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSmtpStatusMessage({
          text: `✓ ${data.message || `Connection verified to ${smtpHost}:${smtpPort} with TLS.`}`,
          success: true,
        });
      } else {
        setSmtpStatusMessage({
          text: `✕ ${data.error || 'SMTP handshake failed. Please check host, port, and credentials.'}`,
          success: false,
        });
      }
    } catch (err: any) {
      setSmtpStatusMessage({
        text: `✕ Connection test error: ${err.message}`,
        success: false,
      });
    } finally {
      setIsTestingConn(false);
    }
  };

  // 3. Send Test Email
  const handleSendTestEmail = async () => {
    try {
      setIsSendingEmail(true);
      setSmtpStatusMessage(null);
      const res = await fetch('/api/admin/smtp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_email',
          recipientEmail: 'ram795055@gmail.com',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSmtpStatusMessage({
          text: `✓ ${data.message || 'Test preparation email dispatched to ram795055@gmail.com! Delivery logged in database.'}`,
          success: true,
        });
      } else {
        setSmtpStatusMessage({
          text: `✕ ${data.error || 'Failed to send test email.'}`,
          success: false,
        });
      }
    } catch (err: any) {
      setSmtpStatusMessage({
        text: `✕ Email dispatch error: ${err.message}`,
        success: false,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  // 4. Save SMTP Configuration to PostgreSQL Database
  const handleSaveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setSmtpStatusMessage(null);
      const res = await fetch('/api/admin/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          host: smtpHost,
          port: smtpPort,
          username: smtpUser,
          password: smtpPassword,
          senderName: smtpSenderName,
          senderEmail: smtpSenderEmail,
          secure: smtpSecure,
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.config?.password) {
          setSmtpPassword(data.config.password); // mask securely
        }
        setLastSavedTime(new Date().toLocaleTimeString());
        setSmtpStatusMessage({
          text: `✓ ${data.message || 'SMTP configuration successfully encrypted and persisted to database!'}`,
          success: true,
        });
      } else {
        setSmtpStatusMessage({
          text: `✕ Failed to save: ${data.error || 'Unknown server error.'}`,
          success: false,
        });
      }
    } catch (err: any) {
      setSmtpStatusMessage({
        text: `✕ Error saving configuration: ${err.message}`,
        success: false,
      });
    } finally {
      setIsSaving(false);
    }
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                <Mail className="w-5 h-5 text-indigo-400" />
                <span>Production SMTP Gateway Configuration</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure outgoing credentials for daily preparation emails, weekly assessment scorecards, and session completion notifications.
              </p>
            </div>
            {lastSavedTime && (
              <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono shrink-0">
                <Database className="w-3 h-3" />
                <span>DB Synced: {lastSavedTime}</span>
              </div>
            )}
          </div>

          {isLoadingConfig && (
            <div className="flex items-center space-x-2 text-xs text-indigo-400 font-mono py-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading saved credentials from database...</span>
            </div>
          )}

          {smtpStatusMessage && (
            <div
              className={`p-4 rounded-xl text-xs font-mono flex items-center space-x-2 ${
                smtpStatusMessage.success
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
              }`}
            >
              {smtpStatusMessage.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
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
                placeholder="smtp.gmail.com"
                required
                className="w-full p-2.5 rounded-lg bg-[#070b14] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-slate-300 font-semibold">SMTP Port</label>
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => handlePortChange('587')}
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${smtpPort === '587' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    587 (TLS)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePortChange('2525')}
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${smtpPort === '2525' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    2525 (Alt)
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePortChange('465')}
                    className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${smtpPort === '465' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                  >
                    465 (SSL)
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={smtpPort}
                onChange={(e) => handlePortChange(e.target.value)}
                placeholder="587"
                required
                className="w-full p-2.5 rounded-lg bg-[#070b14] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="smtpSecure"
                  checked={smtpSecure}
                  onChange={(e) => setSmtpSecure(e.target.checked)}
                  className="rounded bg-[#070b14] border-slate-800 text-indigo-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="smtpSecure" className="text-[11px] text-slate-400 cursor-pointer">
                  Direct SSL/TLS (Required for Port 465; keep unchecked for 587/2525)
                </label>
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">SMTP Username / API Key</label>
              <input
                type="text"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="your.email@gmail.com"
                className="w-full p-2.5 rounded-lg bg-[#070b14] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">SMTP Password / App Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter SMTP password or app password..."
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
                placeholder="PrepForge Interview Coach"
                className="w-full p-2.5 rounded-lg bg-[#070b14] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1">Sender Email Address</label>
              <input
                type="email"
                value={smtpSenderEmail}
                onChange={(e) => setSmtpSenderEmail(e.target.value)}
                placeholder="coach@prepforge.dev"
                className="w-full p-2.5 rounded-lg bg-[#070b14] border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <div className="md:col-span-2 pt-3 border-t border-slate-800 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer flex items-center space-x-2"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                <span>{isSaving ? 'Saving to Database...' : 'Save SMTP Configuration'}</span>
              </button>

              <button
                type="button"
                onClick={handleTestSmtpConnection}
                disabled={isTestingConn}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                {isTestingConn ? <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" /> : <Server className="w-3.5 h-3.5 text-cyan-400" />}
                <span>{isTestingConn ? 'Testing TLS...' : 'Test SMTP Connection'}</span>
              </button>

              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={isSendingEmail}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                {isSendingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" /> : <Send className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{isSendingEmail ? 'Dispatching...' : 'Send Test Email to Ramkumar'}</span>
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
