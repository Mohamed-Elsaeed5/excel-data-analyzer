/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ColumnQuality, DatasetSummary } from '../types';
import { ShieldCheck, AlertTriangle, XOctagon, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';

interface DataQualityProps {
  qualities: ColumnQuality[];
  summary: DatasetSummary;
  onTabChange: (tab: string) => void;
}

export default function DataQuality({ qualities, summary, onTabChange }: DataQualityProps) {
  // Get color scale for badges
  const getQualityColorClasses = (color: 'green' | 'yellow' | 'red') => {
    switch (color) {
      case 'green':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          text: 'text-emerald-700',
          dot: 'bg-emerald-500',
          badge: 'Clean Data'
        };
      case 'yellow':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          text: 'text-amber-700',
          dot: 'bg-amber-500',
          badge: 'Needs Review'
        };
      case 'red':
      default:
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          text: 'text-rose-700',
          dot: 'bg-rose-500',
          badge: 'Serious Issues'
        };
    }
  };

  return (
    <div id="data-quality-container" className="space-y-6 animate-fade-in">
      {/* Audit Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Overall Quality Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs flex flex-col justify-between md:col-span-2">
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-850 uppercase tracking-tight font-sans">Dataset Diagnostics & Hygiene Inspection</h2>
            <p className="text-xs text-slate-500 font-mono font-medium leading-relaxed">
              ✨ VALIDATION SCHEMA ENGINE: Profiles structural anomalies, empty values, casing formatting errors, and outlier limits dynamically.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3 transition">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div className="font-mono">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Healthy Columns</p>
                <p className="text-lg font-black text-slate-800">
                  {qualities.filter(q => q.color === 'green').length} / {qualities.length}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 rounded-2xl flex items-center gap-3 transition">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <div className="font-mono">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">At Risk Columns</p>
                <p className="text-lg font-black text-slate-800">
                  {qualities.filter(q => q.color === 'yellow').length}
                </p>
              </div>
            </div>

            <div className="p-4 bg-[#fff1f2] border border-rose-100 rounded-2xl flex items-center gap-3">
              <XOctagon className="h-5 w-5 text-rose-600 shrink-0" />
              <div className="font-mono">
                <p className="text-[9px] font-bold text-rose-400 uppercase tracking-widest leading-none mb-1">Critical Columns</p>
                <p className="text-lg font-black text-rose-700">
                  {qualities.filter(q => q.color === 'red').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Gauge Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs flex flex-col items-center justify-center space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Simple Circular Progress Chart */}
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="54"
                stroke="#cbd5e1"
                strokeWidth="8"
                fill="transparent"
                opacity="0.3"
              />
              <circle
                cx="64"
                cy="64"
                r="54"
                stroke="url(#radialCheckGradient)"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={2 * Math.PI * 54 * (1 - summary.overallQualityScore / 100)}
                strokeLinecap="round"
                style={{ filter: "drop-shadow(0px 2px 4px rgba(79, 70, 229, 0.2))" }}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="radialCheckGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center font-mono">
              <span className="text-3xl font-black text-slate-800 font-sans">{summary.overallQualityScore}%</span>
              <p className="text-[9px] uppercase tracking-wider text-slate-400 font-bold mt-0.5">HEALTH INDEX</p>
            </div>
          </div>

          <div className="text-center font-mono">
            <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full border ${
              summary.overallColor === 'green'
                ? 'bg-emerald-500/10 text-emerald-700 border-emerald-250'
                : summary.overallColor === 'yellow'
                ? 'bg-amber-500/10 text-amber-700 border-amber-250'
                : 'bg-rose-500/10 text-rose-700 border-rose-250'
            }`}>
              {summary.overallColor === 'green' ? '✓ HIGH QUALITY' : summary.overallColor === 'yellow' ? '⚠ WARNING CHECK' : '✖ REMEDIATION REQ.'}
            </span>
          </div>
        </div>
      </div>

      {/* Audit Checklist Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row justify-between items-center font-mono gap-2">
          <h3 className="font-extrabold text-slate-800 text-xs uppercase">Column Quality Diagnostics Check</h3>
          <span className="text-[10px] text-slate-450 uppercase font-bold">
            Total Missing Rate: <strong className="text-indigo-600 font-black">{summary.missingCellPercentage}%</strong> ({summary.missingCellCount} of {summary.totalCellCount} fields)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-mono font-black border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <th className="py-4 px-6 border-r border-slate-100">Column Target</th>
                <th className="py-4 px-4 w-[125px] text-center border-r border-slate-100">Quality Index</th>
                <th className="py-4 px-4 w-[140px] text-center border-r border-slate-100">Status Flag</th>
                <th className="py-4 px-4 w-[145px] text-right border-r border-slate-100">Missing Values</th>
                <th className="py-4 px-4 w-[120px] text-right border-r border-slate-100">Duplicates</th>
                <th className="py-4 px-4 w-[120px] text-right border-r border-slate-100 text-amber-700">Outliers</th>
                <th className="py-4 px-6">Specific Diagnostic Findings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {qualities.map((q) => {
                return (
                  <tr key={q.name} className="hover:bg-indigo-50/5 transition">
                    {/* Name */}
                    <td className="py-3.5 px-6 font-extrabold text-slate-800 align-top border-r border-slate-100">
                      <p className="break-all font-sans font-bold" title={q.name}>{q.name}</p>
                    </td>

                    {/* Quality Score */}
                    <td className="py-3.5 px-4 text-center font-black text-slate-850 align-top border-r border-slate-100">
                      {q.qualityScore}%
                    </td>

                    {/* Quality Badging */}
                    <td className="py-3.5 px-4 text-center align-top border-r border-slate-100">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider border rounded-full ${
                        q.color === 'green' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                        q.color === 'yellow' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          q.color === 'green' ? 'bg-emerald-500' :
                          q.color === 'yellow' ? 'bg-amber-500' :
                          'bg-rose-500'
                        }`} />
                        {q.color === 'green' ? 'CLEAN' : q.color === 'yellow' ? 'REVIEW REQ' : 'ATTENTION'}
                      </span>
                    </td>

                    {/* Missing Count */}
                    <td className="py-3.5 px-4 text-right text-[11px] align-top border-r border-slate-100">
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-slate-850">{q.missingCount}</p>
                        <p className="text-[10px] text-slate-400 font-bold">({q.missingPercentage}%)</p>
                      </div>
                    </td>

                    {/* Duplicates values */}
                    <td className="py-3.5 px-4 text-right text-[11px] align-top border-r border-slate-100 font-extrabold text-slate-800">
                      {q.duplicateCount}
                    </td>

                    {/* Outliers */}
                    <td className="py-3.5 px-4 text-right text-[11px] align-top font-black text-amber-600 border-r border-slate-100">
                      {q.outlierCount > 0 ? q.outlierCount : '0'}
                    </td>

                    {/* Findings */}
                    <td className="py-3.5 px-6 text-[11px] align-top font-sans">
                      {q.issues.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1 text-slate-600 leading-relaxed max-w-[320px] font-medium text-[11px]">
                          {q.issues.map((issue, index) => (
                            <li key={index} className="marker:text-slate-355">
                              {issue}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                          PASSED CLEANLY
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suggested Redirect banner */}
      <div className="p-6 bg-white/85 backdrop-blur-md rounded-2xl border border-slate-200 shadow-3xs flex flex-col sm:flex-row justify-between items-center gap-4 font-mono">
        <div className="text-center sm:text-left space-y-1.5 col-span-2">
          <p className="font-extrabold text-slate-805 text-sm uppercase tracking-wide">RESOLVE VALIDATION & HYGIENE FAULTS?</p>
          <p className="text-[11px] text-slate-400 leading-normal uppercase font-semibold">⚡ [INTELLIGENT RE-CASING, CELL GAP FILLING, DUPLICATION SCRUBBING AVAILABLE]</p>
        </div>
        <button
          onClick={() => onTabChange('cleaning-tools')}
          className="px-5 py-3 hover:bg-indigo-700 bg-indigo-600 border border-indigo-200 font-black text-xs uppercase tracking-wider text-white rounded-xl hover:shadow-lg hover:shadow-indigo-550/20 active:scale-95 transition cursor-pointer shrink-0"
        >
          OPEN CLEANING RIG
        </button>
      </div>
    </div>
  );
}
