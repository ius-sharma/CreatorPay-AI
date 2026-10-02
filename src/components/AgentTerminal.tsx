'use client';

import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronRight, Activity, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { AgentLog } from '@/lib/types';

interface AgentTerminalProps {
  logs: AgentLog[];
}

export const AgentTerminal: React.FC<AgentTerminalProps> = ({ logs }) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  const getBadgeStyle = (type: AgentLog['type']) => {
    switch (type) {
      case 'thought':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'action':
        return 'bg-blue-500/10 text-sky-400 border-blue-500/20';
      case 'webhook':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'verification':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'payout':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[520px]">
      {/* Terminal Top Bar */}
      <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="h-4 w-px bg-slate-800 mx-1" />
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
            <Terminal className="w-3.5 h-3.5 text-sky-400" />
            <span>creatorpay-agent.trace</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span>Autonomous Loop Active</span>
        </div>
      </div>

      {/* Terminal Logs Body */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3 font-mono text-xs scrollbar-thin scrollbar-thumb-slate-800">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs">
            <Activity className="w-6 h-6 mb-2 animate-pulse text-slate-600" />
            <p>Agent is idle. Submit a deal prompt to begin execution.</p>
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 transition-all text-slate-300"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getBadgeStyle(log.type)}`}>
                      {log.type}
                    </span>
                    <span className="font-semibold text-white tracking-wide">{log.title}</span>
                  </div>
                  {log.toolCall && (
                    <button
                      onClick={() => toggleExpand(log.id)}
                      className="text-slate-400 hover:text-white flex items-center space-x-1 text-[11px] ml-2"
                    >
                      <span className="text-[10px] text-sky-400 font-mono">{log.toolCall.name}</span>
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                <p className="mt-1.5 text-slate-300 text-xs leading-relaxed font-sans pl-1">
                  {log.description}
                </p>

                {/* Expandable Tool Call Inspector */}
                {isExpanded && log.toolCall && (
                  <div className="mt-3 p-3 rounded-lg bg-black/60 border border-slate-800 text-[11px] font-mono text-slate-300">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] mb-2 border-b border-slate-800 pb-1">
                      <span>TOOL: {log.toolCall.name}</span>
                      <span className="text-emerald-400">STATUS: 200 OK</span>
                    </div>
                    {log.toolCall.params && (
                      <div className="mb-2">
                        <span className="text-sky-400 font-bold block mb-0.5">Parameters:</span>
                        <pre className="text-slate-400 overflow-x-auto text-[10px]">
                          {JSON.stringify(log.toolCall.params, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.toolCall.result && (
                      <div>
                        <span className="text-emerald-400 font-bold block mb-0.5">Returned Payload:</span>
                        <pre className="text-emerald-300/90 overflow-x-auto text-[10px]">
                          {JSON.stringify(log.toolCall.result, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
