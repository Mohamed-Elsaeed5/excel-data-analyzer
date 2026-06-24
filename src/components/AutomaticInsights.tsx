/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AutoInsight } from '../types';
import { Sparkles, CheckCircle2, AlertTriangle, AlertCircle, Info, FileText } from 'lucide-react';

interface AutomaticInsightsProps {
  insights: AutoInsight[];
}

export default function AutomaticInsights({ insights }: AutomaticInsightsProps) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />;
      case 'danger':
        return <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-indigo-500 shrink-0" />;
    }
  };

  const getInsightBgClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50/50 border-emerald-150/80 hover:border-emerald-300';
      case 'warning':
        return 'bg-amber-50/50 border-amber-150/80 hover:border-amber-300';
      case 'danger':
        return 'bg-rose-50/50 border-rose-150/80 hover:border-rose-300';
      case 'info':
      default:
        return 'bg-indigo-50/30 border-indigo-150/80 hover:border-indigo-300';
    }
  };

  return (
    <div id="automatic-insights-tab" className="space-y-6 animate-fade-in">
      <div id="insights-header" className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-850 uppercase tracking-tight font-sans">Automated Data Insights Engine</h2>
          <p className="text-xs text-slate-500 font-mono font-medium leading-relaxed">
            ✨ ANALYTICS RIG: Automatically compiles key logical trends, record volume biases, and data spread rates from metrics profiles without manual logic.
          </p>
        </div>
        <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center shrink-0">
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-5 rounded-2xl border transition duration-300 flex gap-4 shadow-3xs hover:-translate-y-0.5 hover:shadow-xs cursor-default ${getInsightBgClass(insight.type)}`}
          >
            <div className="pt-0.5 shrink-0">
              {getInsightIcon(insight.type)}
            </div>
            
            <div className="space-y-2 leading-relaxed font-mono text-xs w-full">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="font-extrabold text-slate-800 text-[12px] uppercase">
                  {insight.title}
                </h4>
                {insight.column && (
                  <span className="px-2.5 py-0.5 text-[9px] font-mono font-black bg-indigo-55 text-indigo-700 border border-indigo-100 rounded-full uppercase">
                    {insight.column}
                  </span>
                )}
              </div>
              <p
                className="text-[11px] text-slate-600 uppercase leading-normal font-sans font-medium"
                dangerouslySetInnerHTML={{
                  __html: insight.message.replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-950 font-sans">$1</strong>')
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {insights.length === 0 && (
        <div className="p-12 text-center bg-white/90 rounded-2xl border border-slate-200 shadow-3xs space-y-3 font-mono">
          <FileText className="h-8 w-8 text-slate-400 mx-auto animate-pulse" />
          <p className="text-slate-500 text-xs uppercase font-bold">No automatic insight trends generated for this worksheet.</p>
        </div>
      )}
    </div>
  );
}
