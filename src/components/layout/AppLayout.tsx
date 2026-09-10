'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Layers,
  CheckCircle2,
  Calendar,
  Code2,
  Mic,
  Briefcase,
  RotateCcw,
  BarChart3,
  ShieldCheck,
  Search,
  Flame,
  Sparkles,
  Menu,
  X,
  ExternalLink
} from 'lucide-react';
import { CommandPalette } from '../navigation/CommandPalette';

interface AppLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: '23 Sessions', href: '/sessions', icon: Layers },
  { label: 'Daily Practice', href: '/daily-practice', icon: CheckCircle2 },
  { label: 'Weekly Assessment', href: '/weekly-assessment', icon: Calendar },
  { label: 'Code & SQL Playground', href: '/playground', icon: Code2 },
  { label: 'AI Interview Mode', href: '/interview', icon: Mic },
  { label: 'Project Deep-Dive', href: '/resume-deep-dive', icon: Briefcase },
  { label: 'Revision Mode', href: '/revision', icon: RotateCcw },
  { label: 'Readiness Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'Admin Console', href: '/admin', icon: ShieldCheck },
];

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userStats, setUserStats] = useState<{ readiness: number; streak: number } | null>(null);

  useEffect(() => {
    fetch('/api/user/progress')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.user) {
          setUserStats({
            readiness: data.user.interviewReadinessScore,
            streak: data.user.streak,
          });
        }
      })
      .catch(() => {});
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col md:flex-row text-slate-100">
      <CommandPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#090e1a] border-r border-slate-800/80 shrink-0">
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold tracking-tight text-white text-base">Prep<span className="text-indigo-400">Forge</span></span>
              <span className="text-[10px] block font-mono text-slate-400 uppercase tracking-wider">Senior SE Coach</span>
            </div>
          </Link>
        </div>

        {/* Candidate Profile Pill */}
        <div className="px-4 py-3 m-3 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            RK
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-slate-100 truncate">Ramkumar</h4>
            <p className="text-[10px] text-emerald-400 font-medium">5+ YOE • Backend / FullStack</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>PrepForge v1.0</span>
          </span>
          <span className="text-slate-600 font-mono">Railway Ready</span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-[#090e1a]/90 backdrop-blur border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-slate-100"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Quick Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/70 text-slate-400 hover:border-indigo-500/50 hover:text-slate-200 text-xs transition-colors"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Quick search curriculum...</span>
              <kbd className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono text-slate-400">Ctrl+K</kbd>
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center space-x-3 md:space-x-5">
            {/* Streak Counter */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-semibold">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>{userStats?.streak ? `${userStats.streak} Day Streak` : 'Day 1 • Ready'}</span>
            </div>

            {/* Readiness Gauge Badge */}
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-xs">
              <span className="text-slate-400">Readiness:</span>
              <span className="font-bold text-indigo-300 font-mono">
                {userStats !== null ? `${userStats.readiness.toFixed(1)}%` : '0.0%'}
              </span>
            </div>

            {/* Session Indicator */}
            <Link
              href="/sessions"
              className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-300 hover:text-indigo-400 transition-colors"
            >
              <span className="text-slate-500">Current:</span>
              <span className="font-medium">Session 1 — Core Java</span>
              <ExternalLink className="w-3 h-3 text-slate-500" />
            </Link>
          </div>
        </header>

        {/* Mobile menu dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#090e1a] border-b border-slate-800 px-4 py-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center space-x-3 px-3 py-2 rounded text-sm text-slate-300 hover:bg-slate-800"
              >
                <item.icon className="w-4 h-4 text-indigo-400" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
