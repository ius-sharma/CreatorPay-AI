'use client';

import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronRight, Activity } from 'lucide-react';
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
        return 'bg-brand-50 text-brand-700 border-brand-200';
      case 'action':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'webhook':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'verification':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'payout':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white border border-brand-100 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[520px]">
      {/* Terminal Top Bar */}
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between select-none">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" />
          </div>
          <div className="h-4 w-px bg-slate-300 mx-1" />
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-slate-700">
            <Terminal className="w-3.5 h-3.5 text-brand-600" />
            <span>creatorpay-agent.trace</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          <span className="font-semibold text-emerald-700">Autonomous Loop Active</span>
        </div>
      </div>

      {/* Terminal Logs Body */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3 font-mono text-xs scrollbar-thin">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <Activity className="w-6 h-6 mb-2 animate-pulse text-brand-400" />
            <p>Agent is idle. Submit a deal prompt to begin execution.</p>
          </div>
        ) : (
          logs.map((log) => {
            const isExpanded = expandedLogId === log.id;
            return (
              <div
                key={log.id}
                className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-200 hover:border-brand-200 transition-all text-slate-800"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getBadgeStyle(log.type)}`}>
                      {log.type}
                    </span>
                    <span className="font-bold text-slate-900 tracking-tight">{log.title}</span>
                  </div>
                  {log.toolCall && (
                    <button
                      onClick={() => toggleExpand(log.id)}
                      className="text-slate-500 hover:text-brand-700 flex items-center space-x-1 text-[11px] ml-2 cursor-pointer font-semibold"
                    >
                      <span className="text-[10px] text-brand-600 font-mono">{log.toolCall.name}</span>
                      {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                  )}
                </div>

                <p className="mt-1.5 text-slate-600 text-xs leading-relaxed font-sans pl-0.5">
                  {log.description}
                </p>

                {/* Expandable Tool Call Inspector */}
                {isExpanded && log.toolCall && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-900 text-[11px] font-mono text-slate-200 shadow-inner">
                    <div className="flex items-center justify-between text-slate-400 text-[10px] mb-2 border-b border-slate-800 pb-1">
                      <span>TOOL: <span className="text-brand-400 font-bold">{log.toolCall.name}</span></span>
                      <span className="text-emerald-400 font-bold">STATUS: 200 OK</span>
                    </div>
                    {log.toolCall.params && (
                      <div className="mb-2.5">
                        <span className="text-brand-400 font-bold block mb-0.5">Parameters:</span>
                        <pre className="text-slate-300 overflow-x-auto text-[10px] bg-slate-950/80 p-2 rounded-lg">
                          {JSON.stringify(log.toolCall.params, null, 2)}
                        </pre>
                      </div>
                    )}
                    {log.toolCall.result && (
                      <div>
                        <span className="text-emerald-400 font-bold block mb-0.5">Returned Payload:</span>
                        <pre className="text-emerald-300 overflow-x-auto text-[10px] bg-slate-950/80 p-2 rounded-lg">
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
