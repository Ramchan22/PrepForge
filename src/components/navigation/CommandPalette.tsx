'use client';

import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, Code, Award, Compass, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SearchItem {
  id: string;
  title: string;
  category: 'Session' | 'Concept' | 'Project' | 'Playground';
  href: string;
  description: string;
}

const SEARCH_ITEMS: SearchItem[] = [
  { id: '1', title: 'Core Java & JVM Internals', category: 'Session', href: '/sessions/core-java', description: 'Session 1: Memory layout, Stack/Heap, Metaspace, GC roots, JIT.' },
  { id: '2', title: 'HashMap Internal Implementation & Treeification', category: 'Concept', href: '/concepts/hashmap-internal-implementation/hashmap-internals-treeification', description: 'Bitwise hash spread, capacity power of 2, Red-Black tree conversion.' },
  { id: '3', title: 'JWT Access Token & Rotating Refresh Tokens', category: 'Concept', href: '/concepts/jwt-rotating-refresh-token-reuse/jwt-rotating-refresh-tokens-reuse-detection', description: 'Stateless JWT, RTR, reuse detection, token family revocation.' },
  { id: '4', title: 'CLS (AsyncLocalStorage) Multi-Tenancy in NestJS', category: 'Concept', href: '/concepts/cls-asynclocalstorage-multitenancy/cls-asynclocalstorage-multitenancy-deepdive', description: 'Tenant context binding across async boundaries, Prisma query filters.' },
  { id: '5', title: 'WealthServ 2.0 — AIF/PMS Investor Onboarding', category: 'Project', href: '/resume-deep-dive#wealthserv-2', description: '6-stage onboarding, CLS multi-tenancy, Leegality eSign, BullMQ, NATS.' },
  { id: '6', title: 'Barjeel MF Investor Onboarding Platform', category: 'Project', href: '/resume-deep-dive#barjeel-mf-onboarding', description: 'DigiLocker, CKYC, S3 signed URLs, RBAC compliance workflows.' },
  { id: '7', title: 'LRU Cache with TTL Eviction', category: 'Playground', href: '/playground?slug=lru-cache-with-ttl', description: 'Hard Java problem: Doubly-linked list + HashMap + timestamp expiration.' },
  { id: '8', title: 'SQL Investor Running Balance & Lead/Lag', category: 'Playground', href: '/playground?slug=sql-investor-running-balance', description: 'Medium SQL problem: Window functions, PARTITION BY, running balance.' },
  { id: '9', title: 'AI Mock Interview Simulator', category: 'Session', href: '/interview', description: 'Interactive senior interview mode with dynamic follow-ups.' },
  { id: '10', title: 'Admin Console & SMTP Settings', category: 'Session', href: '/admin', description: 'Manage progression locks, test SMTP, audit logs.' }
];

export function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose(); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = SEARCH_ITEMS.filter(item =>
    item.title.toLowerCase().includes(query.toLowerCase()) ||
    item.description.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#0d1322] border border-slate-700/80 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-[#090d16]">
          <Search className="w-5 h-5 text-indigo-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search sessions, concepts, candidate projects, coding problems... (ESC to exit)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-sm"
            autoFocus
          />
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No matching curriculum topics or projects found for &quot;{query}&quot;.
            </div>
          ) : (
            filtered.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-start space-x-3">
                  <div className="p-2 rounded-md bg-slate-800 text-indigo-400 group-hover:bg-indigo-600/20 group-hover:text-indigo-300 transition-colors mt-0.5">
                    {item.category === 'Session' && <Compass className="w-4 h-4" />}
                    {item.category === 'Concept' && <BookOpen className="w-4 h-4" />}
                    {item.category === 'Project' && <Award className="w-4 h-4" />}
                    {item.category === 'Playground' && <Code className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-slate-200 text-sm group-hover:text-indigo-300">
                        {item.title}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-indigo-400 transition-transform group-hover:translate-x-1" />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
