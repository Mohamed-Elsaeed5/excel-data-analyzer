/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { DataRecommendation } from '../types';
import { CheckSquare, TrendingUp, Compass, ArrowRight, HelpCircle, Lightbulb } from 'lucide-react';

interface RecommendationsProps {
  recommendations: DataRecommendation[];
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  const getPriorityBadgeClass = (prio: string) => {
    switch (prio) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200 rounded-full';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200 rounded-full';
      case 'low':
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200 rounded-full';
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'cleaning':
        return <CheckSquare className="h-4.5 w-4.5 text-indigo-600 shrink-0" />;
      case 'analysis':
        return <TrendingUp className="h-4.5 w-4.5 text-purple-600 shrink-0 text-emerald-600" />;
      case 'strategy':
        return <Compass className="h-4.5 w-4.5 text-pink-600 shrink-0 text-sky-600" />;
      case 'business':
      default:
        return <Lightbulb className="h-4.5 w-4.5 text-amber-500 shrink-0" />;
    }
  };

  return (
    <div id="recommendations-tab" className="space-y-6 animate-fade-in">
      <div id="recs-header" className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-850 uppercase tracking-tight font-sans">Tactical Recommendations Checklist</h2>
        <p className="text-xs text-slate-500 font-mono font-medium leading-relaxed font-sans">
          ✨ MODEL OPTIMIZATIONS: Curated execution procedures designed to structure missing value biases and streamline reporting metrics.
        </p>
      </div>

      <div className="space-y-5">
        {recommendations.map((rec) => (
          <div
            key={rec.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-3xs p-6 flex flex-col md:flex-row gap-6 hover:shadow-xs hover:-translate-y-0.5 transition duration-300"
          >
            {/* Left Header info */}
            <div className="flex md:flex-col items-start gap-2.5 md:w-[220px] shrink-0 font-mono text-xs">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-xl px-3 py-1.5 font-bold">
                {getCategoryIcon(rec.category)}
                <span className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">
                  {rec.category}
                </span>
              </div>
              
              <div className="flex gap-2 md:block md:space-y-2 mt-1.5">
                <span className={`inline-flex items-center px-3 py-1 text-[9px] font-black uppercase border tracking-wider ${getPriorityBadgeClass(rec.priority)}`}>
                  {rec.priority} Priority
                </span>
              </div>
            </div>

            {/* Right details content */}
            <div className="flex-1 space-y-4">
              <div className="space-y-1.5">
                <h4 className="text-md font-black text-slate-800 uppercase tracking-tight font-sans text-lg">{rec.title}</h4>
                <p className="text-xs text-slate-400 font-mono uppercase text-[11px] font-bold">
                  <span className="text-slate-500">IDENTIFIED DISCREPANCY:</span> {rec.problem}
                </p>
              </div>

              {/* Action and Benefit split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 bg-indigo-50/20 border border-indigo-150/60 rounded-xl space-y-2">
                  <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest flex items-center gap-1.5">
                    <ArrowRight className="h-4 w-4" />
                    RECOMMENDED ACTION STEP
                  </p>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-sans font-medium capitalize">
                    {rec.actionableStep.toLowerCase()}
                  </p>
                </div>

                <div className="p-4 bg-emerald-500/5 border border-emerald-150 rounded-xl space-y-2">
                  <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1.5">
                    ✓ EXPECTED STRATEGIC BENEFIT
                  </p>
                  <p className="text-[11px] text-slate-650 leading-relaxed font-sans font-medium capitalize">
                    {rec.benefit.toLowerCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Corporate Guidance Callout */}
      <div className="p-6 bg-slate-900 text-slate-300 rounded-2xl border border-slate-800 shadow-3xs space-y-2.5 font-mono text-xs">
        <h4 className="font-extrabold text-sm text-slate-100 flex items-center gap-2 uppercase">
          <HelpCircle className="h-4.5 w-4.5 text-indigo-300" />
          Note on Business Decisioning via Spreadsheets
        </h4>
        <p className="text-[11px] text-slate-450 leading-relaxed uppercase">
          While dynamic algorithms can detect numeric anomalies, strategic context is uniquely human. Before removing outliers, consult with individual branch log managers to ensure they do not represent seasonal discounts or batch orders that are vital for business reporting.
        </p>
      </div>
    </div>
  );
}
