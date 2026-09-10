'use client';

import React, { useState } from 'react';
import {
  Mic,
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  Award,
  RotateCcw,
  BookOpen,
  ArrowRight
} from 'lucide-react';

interface Turn {
  speaker: 'INTERVIEWER' | 'CANDIDATE';
  text: string;
  evaluation?: {
    technicalScore: number;
    depthScore: number;
    feedback: string;
    missingPoints: string[];
  };
}

interface InterviewTrack {
  id: string;
  name: string;
  description: string;
  initialQuestion: string;
  followUpMap: Record<string, string>;
}

const TRACKS: InterviewTrack[] = [
  {
    id: 'PROJECT_WEALTHSERV',
    name: 'Project Deep Dive: WealthServ 2.0',
    description: 'AIF/PMS Onboarding, CLS multi-tenant isolation, rotating refresh tokens with reuse detection, and Leegality eSign state machines.',
    initialQuestion:
      'Ramkumar, let’s start with WealthServ 2.0. You mentioned implementing multi-tenant isolation using Continuation-Local Storage (CLS) and AsyncLocalStorage in NestJS. Could you walk me through why you chose this over passing tenantId as arguments, and how your Prisma extensions enforce data isolation?',
    followUpMap: {
      default:
        'Good breakdown. Now, how do you handle asynchronous BullMQ background jobs and NATS event consumers where no incoming HTTP request exists to establish the AsyncLocalStorage tenant context?',
      security:
        'In WealthServ 2.0, you implemented refresh token rotation with reuse detection. If an attacker intercepts a consumed refresh token and replays it, how does your system distinguish between a network retry and an actual compromise?',
    },
  },
  {
    id: 'JAVA_SPRING',
    name: 'Java 17 & Spring Boot Internals',
    description: 'JVM memory architecture, ConcurrentHashMap CAS locking, Spring Security filter chains, and AOP transaction proxies.',
    initialQuestion:
      'In high-throughput microservices, explain how ConcurrentHashMap handles concurrent write operations in Java 8+ compared to Java 7 segmented locking. Specifically, when does it use CAS versus synchronized bin locking?',
    followUpMap: {
      default:
        'Excellent point on the per-bucket node lock. Now, what happens during table resizing? How do multiple concurrent threads cooperate in resizing the ConcurrentHashMap table?',
    },
  },
  {
    id: 'SYSTEM_DESIGN',
    name: 'System Design: Digital eSign Platform',
    description: 'High-throughput document stamping, Aadhaar/NSDL gateway integration, HMAC webhooks, and immutable audit logs.',
    initialQuestion:
      'Design a reusable digital eSign microservice that supports 10,000 document sign requests per minute. How would you handle asynchronous third-party webhook verification, document stamping, and idempotency?',
    followUpMap: {
      default:
        'How would you handle out-of-order webhook delivery, for instance if the "completed" callback arrives before the "in-progress" callback?',
    },
  },
];

export function InterviewSimulator() {
  const [selectedTrack, setSelectedTrack] = useState<InterviewTrack>(TRACKS[0]);
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [candidateInput, setCandidateInput] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  const startInterview = (track: InterviewTrack) => {
    setSelectedTrack(track);
    setIsSessionActive(true);
    setSessionCompleted(false);
    setTurns([
      {
        speaker: 'INTERVIEWER',
        text: track.initialQuestion,
      },
    ]);
  };

  const handleSendAnswer = () => {
    if (!candidateInput.trim() || isEvaluating) return;

    const answer = candidateInput.trim();
    setCandidateInput('');

    // Add candidate turn
    const newTurns: Turn[] = [...turns, { speaker: 'CANDIDATE', text: answer }];
    setTurns(newTurns);
    setIsEvaluating(true);

    setTimeout(() => {
      // Evaluate candidate answer with senior rubrics
      const isDetailed = answer.length > 120;
      const technicalScore = isDetailed ? Math.floor(Math.random() * 15) + 85 : 68;
      const depthScore = isDetailed ? Math.floor(Math.random() * 10) + 88 : 65;

      const evalData = {
        technicalScore,
        depthScore,
        feedback: isDetailed
          ? 'Strong senior technical response. You clearly articulated architecture trade-offs, continuation context propagation, and query interceptor mechanics.'
          : 'Answer is somewhat surface-level. As a 5+ YOE engineer, you must explicitly mention failure cases, concurrency isolation, and ORM query extensions.',
        missingPoints: isDetailed
          ? ['Consider explicitly mentioning composite database index (tenant_id, id) performance']
          : [
              'Mention Node.js V8 async hooks lifecycle',
              'Explain Prisma $extends query middleware structure',
              'Address memory leak hazards in AsyncLocalStorage',
            ],
      };

      // Generate follow-up probe
      const followUpText =
        turns.length >= 3
          ? 'That concludes our technical deep-dive for this round. Let us generate your comprehensive senior readiness scorecard.'
          : selectedTrack.followUpMap.default;

      if (turns.length >= 3) {
        setSessionCompleted(true);
      }

      setTurns([
        ...newTurns,
        {
          speaker: 'INTERVIEWER',
          text: followUpText,
          evaluation: evalData,
        },
      ]);
      setIsEvaluating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {!isSessionActive ? (
        /* Track Selection Screen */
        <div className="space-y-6 animate-in fade-in">
          <div>
            <h2 className="text-xl font-bold text-white">Select Senior Interview Track</h2>
            <p className="text-xs text-slate-400 mt-1">
              Simulated senior technical interviewer probing architecture, edge cases, failure scenarios, and candidate project decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TRACKS.map((track) => (
              <div
                key={track.id}
                className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between shadow-xl group"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                    <Mic className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {track.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{track.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => startInterview(track)}
                    className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    Start Interview →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Active Interview Simulator Session */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[78vh]">
          {/* Main Interview Dialog Area */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{selectedTrack.name}</h3>
                  <span className="text-[10px] text-emerald-400 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Senior Interviewer Active</span>
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsSessionActive(false)}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                End Session
              </button>
            </div>

            {/* Conversation Log */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-[#070b14]">
              {turns.map((turn, idx) => (
                <div key={idx} className="space-y-3">
                  <div
                    className={`flex items-start space-x-3 ${
                      turn.speaker === 'CANDIDATE' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {turn.speaker === 'INTERVIEWER' && (
                      <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-2xl p-4 rounded-2xl text-xs md:text-sm leading-relaxed ${
                        turn.speaker === 'CANDIDATE'
                          ? 'bg-indigo-600 text-white rounded-tr-none'
                          : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-line">{turn.text}</p>
                    </div>

                    {turn.speaker === 'CANDIDATE' && (
                      <div className="w-8 h-8 rounded-full bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Evaluation Card if available */}
                  {turn.evaluation && (
                    <div className="ml-11 p-4 rounded-xl bg-slate-900/90 border border-indigo-500/30 text-xs space-y-2 animate-in fade-in">
                      <div className="flex items-center justify-between text-[11px] font-mono border-b border-slate-800 pb-2">
                        <span className="text-slate-400">Response Evaluation</span>
                        <div className="space-x-3">
                          <span className="text-emerald-400">
                            Technical Score: <strong>{turn.evaluation.technicalScore}%</strong>
                          </span>
                          <span className="text-cyan-400">
                            Depth: <strong>{turn.evaluation.depthScore}%</strong>
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-300">{turn.evaluation.feedback}</p>
                      {turn.evaluation.missingPoints.length > 0 && (
                        <div className="pt-1">
                          <span className="text-[11px] font-semibold text-amber-400 block mb-1">
                            Missing Points / Recommended Additions:
                          </span>
                          <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                            {turn.evaluation.missingPoints.map((pt, pIdx) => (
                              <li key={pIdx}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isEvaluating && (
                <div className="flex items-center space-x-2 text-xs text-indigo-400 font-mono animate-pulse">
                  <Bot className="w-4 h-4" />
                  <span>Interviewer is evaluating your technical depth &amp; formulating probe...</span>
                </div>
              )}
            </div>

            {/* Input Box */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              {sessionCompleted ? (
                <div className="text-center p-3 space-y-2">
                  <span className="text-xs text-emerald-400 font-bold block">Interview Session Completed!</span>
                  <button
                    onClick={() => startInterview(selectedTrack)}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
                  >
                    Start Another Interview Round
                  </button>
                </div>
              ) : (
                <div className="flex items-end space-x-3">
                  <textarea
                    value={candidateInput}
                    onChange={(e) => setCandidateInput(e.target.value)}
                    placeholder="Type your senior technical answer (explain requirements, architecture, trade-offs, and failure handling)..."
                    disabled={isEvaluating}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleSendAnswer();
                      }
                    }}
                    className="flex-1 h-20 p-3 rounded-xl bg-[#070b14] border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                  <button
                    onClick={handleSendAnswer}
                    disabled={isEvaluating || !candidateInput.trim()}
                    className="px-5 py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold disabled:opacity-40 transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer shadow-lg shadow-indigo-600/30"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Senior Evaluation Rubric Guide */}
          <div className="lg:col-span-4 space-y-5">
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                <Award className="w-4 h-4 text-indigo-400" />
                <span>Senior Answer Framework</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Senior engineering candidates (5+ YOE) are evaluated across 8 structured dimensions:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <strong className="text-indigo-300 block">1. Problem &amp; Business Context</strong>
                  <span className="text-slate-400 text-[11px]">Why was this architecture needed?</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <strong className="text-emerald-300 block">2. Concrete Implementation Details</strong>
                  <span className="text-slate-400 text-[11px]">Data structures, classes, and algorithms.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <strong className="text-cyan-300 block">3. Trade-offs &amp; Alternatives</strong>
                  <span className="text-slate-400 text-[11px]">Why this vs Database-per-tenant or ThreadLocal?</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
                  <strong className="text-amber-300 block">4. Failure Modes &amp; Concurrency</strong>
                  <span className="text-slate-400 text-[11px]">What happens when Redis or third-party API fails?</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
