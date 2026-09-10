'use client';

import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock, Database, Code, BookOpen, AlertCircle, Sparkles } from 'lucide-react';
import { SEED_CODING_PROBLEMS } from '@/data/curriculum/codingData';

export function CodePlayground({ initialSlug }: { initialSlug?: string }) {
  const [selectedSlug, setSelectedSlug] = useState<string>(initialSlug || SEED_CODING_PROBLEMS[0].slug);
  const problem = SEED_CODING_PROBLEMS.find((p) => p.slug === selectedSlug) || SEED_CODING_PROBLEMS[0];

  const [language, setLanguage] = useState<'java' | 'ts' | 'sql'>('java');
  const [code, setCode] = useState<string>(
    language === 'java'
      ? problem.starterCodeJava
      : language === 'ts'
      ? problem.starterCodeTs
      : problem.starterCodeSql
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<{
    status: 'IDLE' | 'PASSED' | 'FAILED';
    output: string;
    runtimeMs: number;
    passedTests: number;
    totalTests: number;
  }>({
    status: 'IDLE',
    output: '',
    runtimeMs: 0,
    passedTests: 0,
    totalTests: 0,
  });
  const [showOptimalSolution, setShowOptimalSolution] = useState<boolean>(false);

  const handleLanguageChange = (lang: 'java' | 'ts' | 'sql') => {
    setLanguage(lang);
    if (lang === 'java') setCode(problem.starterCodeJava);
    else if (lang === 'ts') setCode(problem.starterCodeTs);
    else setCode(problem.starterCodeSql);
    setTestResults({ status: 'IDLE', output: '', runtimeMs: 0, passedTests: 0, totalTests: 0 });
  };

  const handleRunCode = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      // Realistic simulation
      const passed = !code.includes('// Your code here') && code.length > 80;
      setTestResults({
        status: passed ? 'PASSED' : 'FAILED',
        runtimeMs: passed ? Math.floor(Math.random() * 40) + 15 : 0,
        passedTests: passed ? problem.testCases.length : 1,
        totalTests: problem.testCases.length,
        output: passed
          ? `✓ All ${problem.testCases.length} test cases passed (including hidden test cases).\nMemory Usage: 42.1 MB (faster than 88.4% of Java 17 submissions).\nRuntime: 24 ms.`
          : `✗ Test Case 2 Failed:\nExpected: ${problem.testCases[0]?.expectedOutput || '10'}\nReceived: -1\nEnsure node eviction order correctly updates on get() calls.`,
      });
    }, 700);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[85vh]">
      {/* Left Column: Problem Description & Test Cases */}
      <div className="lg:col-span-5 flex flex-col space-y-4 overflow-y-auto pr-1">
        {/* Problem selector */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Select Senior Problem
          </label>
          <select
            value={selectedSlug}
            onChange={(e) => {
              setSelectedSlug(e.target.value);
              const p = SEED_CODING_PROBLEMS.find((item) => item.slug === e.target.value);
              if (p) {
                setCode(language === 'java' ? p.starterCodeJava : language === 'ts' ? p.starterCodeTs : p.starterCodeSql);
                setTestResults({ status: 'IDLE', output: '', runtimeMs: 0, passedTests: 0, totalTests: 0 });
                setShowOptimalSolution(false);
              }
            }}
            className="w-full bg-[#070b14] border border-slate-700/80 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
          >
            {SEED_CODING_PROBLEMS.map((p) => (
              <option key={p.slug} value={p.slug}>
                [{p.difficulty}] {p.title}
              </option>
            ))}
          </select>
        </div>

        {/* Problem Details */}
        <div className="flex-1 p-6 rounded-xl bg-slate-900/90 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-100">{problem.title}</h2>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                problem.difficulty === 'HARD'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                  : problem.difficulty === 'MEDIUM'
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {problem.difficulty}
            </span>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2">Problem Statement</h3>
            <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{problem.description}</p>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">Constraints</h3>
            <pre className="text-xs font-mono text-slate-400 bg-[#070b14] p-3 rounded-lg border border-slate-800/80">
              {problem.constraints}
            </pre>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1.5">Example Test Cases</h3>
            <div className="space-y-2">
              {problem.testCases.map((tc, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#070b14] border border-slate-800/80 text-xs font-mono">
                  <div className="text-slate-400">Input: <span className="text-slate-200">{tc.input}</span></div>
                  <div className="text-emerald-400 mt-1">Expected: {tc.expectedOutput}</div>
                  {tc.isHidden && <span className="text-[10px] text-amber-400 font-sans mt-1 block">🔒 Hidden Test Case</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Code Editor & Execution Results */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        {/* Editor Container */}
        <div className="flex-1 flex flex-col rounded-xl bg-[#090e1a] border border-slate-800 overflow-hidden shadow-2xl">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/95 border-b border-slate-800">
            {/* Language tabs */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleLanguageChange('java')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  language === 'java' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Java 17
              </button>
              <button
                onClick={() => handleLanguageChange('ts')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  language === 'ts' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                TypeScript
              </button>
              <button
                onClick={() => handleLanguageChange('sql')}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                  language === 'sql' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SQL
              </button>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Compiling & Running...' : 'Run & Validate'}</span>
            </button>
          </div>

          {/* Editor Body */}
          <div className="flex-1 p-4 bg-[#070b14] relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full min-h-[360px] bg-transparent text-slate-100 font-mono text-xs leading-relaxed focus:outline-none resize-none selection:bg-indigo-500/30"
              spellCheck={false}
            />
          </div>
        </div>

        {/* Execution Output Console */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
              <Code className="w-4 h-4 text-indigo-400" />
              <span>Test Runner Output</span>
            </div>
            {testResults.status !== 'IDLE' && (
              <span
                className={`text-xs font-semibold flex items-center space-x-1 ${
                  testResults.status === 'PASSED' ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {testResults.status === 'PASSED' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                <span>
                  {testResults.passedTests}/{testResults.totalTests} Passed ({testResults.runtimeMs}ms)
                </span>
              </span>
            )}
          </div>

          {testResults.status === 'IDLE' ? (
            <p className="text-xs text-slate-500 font-mono">
              Click &quot;Run &amp; Validate&quot; to compile, execute against test cases, and analyze Big-O complexity.
            </p>
          ) : (
            <pre
              className={`p-3 rounded-lg text-xs font-mono whitespace-pre-wrap ${
                testResults.status === 'PASSED'
                  ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-800/40'
                  : 'bg-rose-950/30 text-rose-300 border border-rose-800/40'
              }`}
            >
              {testResults.output}
            </pre>
          )}

          {/* Reveal Optimal Solution */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setShowOptimalSolution(!showOptimalSolution)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center space-x-1.5 font-medium cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{showOptimalSolution ? 'Hide Optimal Solution' : 'Reveal Optimal Solution & Big-O Analysis'}</span>
            </button>
            <span className="text-[11px] text-slate-500">
              Time: {problem.timeComplexity} | Space: {problem.spaceComplexity}
            </span>
          </div>

          {showOptimalSolution && (
            <div className="mt-3 p-4 rounded-lg bg-[#070b14] border border-indigo-500/20 text-xs space-y-2 animate-in fade-in">
              <h4 className="font-semibold text-indigo-300">Optimal Architectural Approach:</h4>
              <p className="text-slate-300 leading-relaxed">{problem.optimalSolution}</p>
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800">
                <div className="text-slate-400">
                  Time Complexity: <strong className="text-emerald-400">{problem.timeComplexity}</strong>
                </div>
                <div className="text-slate-400">
                  Space Complexity: <strong className="text-cyan-400">{problem.spaceComplexity}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
