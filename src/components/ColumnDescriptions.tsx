/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ColumnProfile, ColumnType } from '../types';
import { BadgeHelp, HelpCircle, Layers, Link, ShieldCheck, Tag } from 'lucide-react';

interface ColumnDescriptionsProps {
  profiles: ColumnProfile[];
}

export function getTypeBadgeColor(type: ColumnType): string {
  switch (type) {
    case 'numerical':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 rounded-full';
    case 'categorical':
      return 'bg-blue-50 text-blue-700 border-blue-200 rounded-full';
    case 'date':
      return 'bg-purple-50 text-purple-700 border-purple-200 rounded-full';
    case 'id':
      return 'bg-sky-50 text-sky-700 border-sky-200 rounded-full';
    case 'boolean':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 rounded-full';
    case 'text':
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200 rounded-full';
  }
}

export function getTypeBadgeLabel(type: ColumnType): string {
  switch (type) {
    case 'numerical':
      return 'NUMERICAL';
    case 'categorical':
      return 'CATEGORICAL';
    case 'date':
      return 'DATE / TIME';
    case 'id':
      return 'UNIQUE ID';
    case 'boolean':
      return 'BOOLEAN';
    case 'text':
    default:
      return 'FREE TEXT';
  }
}

export default function ColumnDescriptions({ profiles }: ColumnDescriptionsProps) {
  return (
    <div id="column-desc-container" className="space-y-6 animate-fade-in">
      <div id="desc-header" className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
        <h2 className="text-2xl font-extrabold text-slate-800 uppercase tracking-tight font-sans">Variable Profiling Dictionary</h2>
        <p className="text-xs text-slate-500 font-mono font-medium leading-relaxed">
          ✨ DYNAMIC SCHEMA ANALYSIS LOG: Automated profiling models mapping database types, semantic meanings, and statistical properties of active dimensions.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/85 border-b border-slate-250 text-slate-600 font-mono font-extrabold uppercase tracking-wide text-[10px]">
                <th className="py-4 px-6 w-[200px] border-r border-slate-150 font-black">Column Name</th>
                <th className="py-4 px-6 w-[150px] border-r border-[#141414]/5 font-black">Detected Type</th>
                <th className="py-4 px-6 w-[180px] border-r border-[#141414]/5 font-black">Statistical Details</th>
                <th className="py-4 px-6 border-r border-[#141414]/5 font-black">Semantic Meaning & Actionable Business Use</th>
                <th className="py-4 px-6 font-black">Sample Values</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {profiles.map((profile) => (
                <tr key={profile.name} className="hover:bg-slate-50/50 transition duration-150">
                  {/* Name */}
                  <td className="py-5 px-6 font-black text-slate-800 align-top border-r border-[#141414]/5">
                    <p className="break-all text-[12px]" title={profile.name}>{profile.name}</p>
                  </td>

                  {/* Type */}
                  <td className="py-5 px-6 align-top border-r border-[#141414]/5">
                    <span className={`inline-flex items-center px-3 py-1 text-[9px] font-mono font-black border uppercase tracking-wider ${getTypeBadgeColor(profile.type)}`}>
                      {getTypeBadgeLabel(profile.type)}
                    </span>
                  </td>

                  {/* Frequency unique */}
                  <td className="py-5 px-6 text-[11px] space-y-2 align-top border-r border-[#141414]/5">
                    <div className="space-y-1.5">
                      <p>
                        <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Uniques:</span> <span className="font-extrabold text-slate-800">{profile.uniqueCount}</span>
                      </p>
                      {profile.mostFrequentValue !== null && profile.mostFrequentValue !== undefined && profile.mostFrequentValue !== '' && (
                        <p className="max-w-[150px] leading-relaxed" title={String(profile.mostFrequentValue)}>
                          <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">Top Value:</span>
                          <span className="font-extrabold text-slate-700">"{String(profile.mostFrequentValue)}"</span> 
                          <span className="text-[9px] text-indigo-500 font-black ml-1">({profile.mostFrequentFreq}x)</span>
                        </p>
                      )}
                    </div>
                  </td>

                  {/* Meanings */}
                  <td className="py-5 px-6 text-[11px] space-y-4 align-top max-w-[350px] border-r border-[#141414]/5">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <BadgeHelp className="h-4 w-4 text-indigo-500 shrink-0" />
                        Inferred Concept
                      </p>
                      <p className="text-slate-600 text-[12px] leading-relaxed font-sans font-medium">{profile.inferredMeaning}</p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                        Suggested Action / Use Case
                      </p>
                      <p className="text-slate-600 text-[12px] leading-relaxed italic font-sans font-medium">{profile.suggestedBusinessUse}</p>
                    </div>
                  </td>

                  {/* Samples */}
                  <td className="py-5 px-6 align-top">
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                      {profile.sampleValues.length > 0 ? (
                        profile.sampleValues.map((v, i) => {
                          let strVal = valToString(v);
                          if (!strVal.trim()) return null;
                          return (
                            <span key={i} className="px-2 py-1 text-[10px] font-mono bg-slate-50 text-slate-600 border border-slate-150 rounded-lg truncate max-w-[150px]" title={strVal}>
                              {strVal}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400 italic font-semibold">No samples</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function valToString(val: any): string {
  if (val instanceof Date) {
    return val.toLocaleDateString();
  }
  if (val === null || val === undefined) return '';
  return typeof val === 'object' ? JSON.stringify(val) : String(val);
}
