/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ColumnStats, StatisticsMetrics, ColumnType } from '../types';
import { ChevronRight, BarChart3, Clock, FileText, Settings, Hash, Compass, ArrowUpDown, Flame } from 'lucide-react';
import { getTypeBadgeColor, getTypeBadgeLabel } from './ColumnDescriptions';

interface ColumnStatisticsProps {
  stats: ColumnStats[];
}

export default function ColumnStatistics({ stats }: ColumnStatisticsProps) {
  const [activeColName, setActiveColName] = useState<string>(stats[0]?.name || '');

  const activeStat = stats.find(s => s.name === activeColName) || stats[0];

  if (!activeStat) {
    return (
      <div className="p-8 text-center bg-white border border-[#141414] shadow-[4px_4px_0px_#141414]">
        <p className="font-mono text-xs text-[#141414]">No statistics variables loaded.</p>
      </div>
    );
  }

  const { name, type, metrics } = activeStat;

  // Numerical metrics
  const hasOutliers = metrics.outliers && metrics.outliers.length > 0;

  return (
    <div id="col-statistics-container" className="space-y-6 animate-fade-in">
      {/* Variable Selector */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-extrabold text-slate-850 uppercase tracking-tight font-sans">Descriptive Statistical Summary</h2>
          <p className="text-xs text-slate-500 font-mono font-medium leading-relaxed">
            ✨ DYNAMIC METRICS GRID: Query column profiles and mathematical aggregates dynamically from loaded headers.
          </p>
        </div>

        {/* Dropdown */}
        <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
          <label className="font-extrabold text-slate-700 uppercase tracking-wider">Target Variable:</label>
          <select
            value={activeColName}
            onChange={(e) => setActiveColName(e.target.value)}
            className="px-4 py-2.5 font-bold text-slate-700 bg-white hover:border-indigo-400 border border-slate-205 outline-none rounded-xl text-xs uppercase tracking-wider cursor-pointer transition focus:ring-4 focus:ring-indigo-100"
          >
            {stats.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name} ({s.type.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-3xs flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-gradient-to-tr from-indigo-500 to-purple-600 text-white rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            {type === 'numerical' && <Hash className="h-5 w-5" />}
            {type === 'categorical' && <BarChart3 className="h-5 w-5" />}
            {type === 'date' && <Clock className="h-5 w-5" />}
            {type === 'text' && <FileText className="h-5 w-5" />}
            {type === 'boolean' && <Settings className="h-5 w-5" />}
            {type === 'id' && <Flame className="h-5 w-5" />}
          </div>
          <div>
            <h3 className="font-black text-slate-850 font-sans text-md uppercase tracking-tight text-lg">{name}</h3>
            <p className="text-[11px] font-mono text-slate-450 uppercase font-semibold">INFERRED PROFILE: <strong className="text-slate-700">{getTypeBadgeLabel(type)}</strong></p>
          </div>
        </div>

        <span className={`px-3 py-1 text-[10px] font-mono font-black uppercase rounded-full border ${getTypeBadgeColor(type)}`}>
          {type.toUpperCase()}
        </span>
      </div>

      {/* Main Stats Display Sheets */}
      {type === 'numerical' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Central Tendency & Dispersion Cards */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
              <h4 className="font-extrabold text-slate-800 font-mono text-xs uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <Compass className="h-4.5 w-4.5 text-indigo-500" />
                CENTRAL TENDENCY METRICS
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 text-center font-mono rounded-xl transition">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Avg (Mean)</p>
                  <p className="text-base font-black text-indigo-600 mt-1">{metrics.mean}</p>
                </div>
                <div className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 text-center font-mono rounded-xl transition">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Median (Q2)</p>
                  <p className="text-base font-black text-slate-800 mt-1">{metrics.median}</p>
                </div>
                <div className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-150 text-center font-mono rounded-xl transition">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Mode</p>
                  <p className="text-base font-black text-slate-800 mt-1 truncate" title={String(metrics.mode)}>{String(metrics.mode)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
              <h4 className="font-extrabold text-slate-800 font-mono text-xs uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <ArrowUpDown className="h-4.5 w-4.5 text-indigo-500" />
                DISPERSION & EXTREME BOUNDS
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-2 bg-slate-50/50 border border-slate-150 text-center font-mono rounded-xl">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Minimum</p>
                  <p className="text-sm font-black text-slate-800 mt-1">{metrics.min}</p>
                </div>
                <div className="p-2 bg-slate-50/50 border border-slate-150 text-center font-mono rounded-xl">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Maximum</p>
                  <p className="text-sm font-black text-slate-800 mt-1">{metrics.max}</p>
                </div>
                <div className="p-2 bg-slate-50/50 border border-slate-150 text-center font-mono rounded-xl">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Std Dev</p>
                  <p className="text-sm font-black text-slate-800 mt-1">{metrics.stdDev}</p>
                </div>
                <div className="p-2 bg-slate-50/50 border border-slate-150 text-center font-mono rounded-xl">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Variance</p>
                  <p className="text-sm font-black text-slate-800 mt-1">{metrics.variance}</p>
                </div>
              </div>
              <p className="text-[11px] font-mono text-slate-400 text-center pt-2 uppercase font-medium">
                Total Spread Range (Max - Min): <strong className="text-slate-700 font-black">{metrics.range}</strong>
              </p>
            </div>
          </div>

          {/* Quartiles & Shape Parameters */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
              <h4 className="font-extrabold text-slate-800 font-mono text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
                QUARTILES & SPREAD INTERVALS
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center font-mono">
                <div className="p-2.5 bg-slate-50/50 border border-slate-150 rounded-xl">
                  <p className="text-[8px] uppercase font-bold text-slate-400 leading-none">Q1 (25%)</p>
                  <p className="text-xs font-black text-slate-700 mt-1">{metrics.q1}</p>
                </div>
                <div className="p-2.5 bg-slate-50/50 border border-slate-150 rounded-xl">
                  <p className="text-[8px] uppercase font-bold text-slate-400 leading-none">Q2 (50%)</p>
                  <p className="text-xs font-black text-slate-700 mt-1">{metrics.q2}</p>
                </div>
                <div className="p-2.5 bg-slate-50/50 border border-slate-150 rounded-xl">
                  <p className="text-[8px] uppercase font-bold text-slate-400 leading-none">Q3 (75%)</p>
                  <p className="text-xs font-black text-slate-700 mt-1">{metrics.q3}</p>
                </div>
                <div className="p-2.5 bg-indigo-50 border border-indigo-150 rounded-xl text-indigo-700">
                  <p className="text-[8px] uppercase font-black leading-none">IQR</p>
                  <p className="text-xs font-black mt-1">{metrics.iqr}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
              <h4 className="font-extrabold text-slate-800 font-mono text-xs uppercase tracking-wider pb-2 border-b border-slate-100 font-sans">
                DISTRIBUTION COEFFICIENTS
              </h4>
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-3.5 bg-slate-50/50 border border-slate-150 text-center rounded-xl">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Skewness</p>
                  <p className="text-base font-black text-indigo-600 mt-1">{metrics.skewness}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">
                    {metrics.skewness! > 1 ? 'Right Skew ↗' : metrics.skewness! < -1 ? 'Left Skew ↖' : 'Symmetric ↔'}
                  </p>
                </div>
                <div className="p-3.5 bg-slate-50/50 border border-slate-150 text-center rounded-xl">
                  <p className="text-[9px] uppercase font-bold text-slate-400">Kurtosis</p>
                  <p className="text-base font-black text-purple-600 mt-1">{metrics.kurtosis}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">
                    {metrics.kurtosis! > 1 ? 'Heavy Peak ⌃' : 'Flat Trail ⌄'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Outlier Summary */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs md:col-span-2 space-y-4 font-mono text-xs">
            <h4 className="font-extrabold text-slate-800 font-mono text-xs uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1">
              IQR BIAS BIOMARKER & ANOMALY DETECTIONS
            </h4>
            <div className="flex flex-col sm:flex-row gap-5 items-center">
              <div className={`p-4 text-center shrink-0 w-36 rounded-xl border border-dashed ${hasOutliers ? 'bg-amber-500/5 border-amber-200 text-amber-700' : 'bg-emerald-500/5 border-emerald-250 text-emerald-800'}`}>
                <p className="text-[9px] uppercase font-black opacity-60">Outliers Count</p>
                <p className="text-3xl font-black mt-1.5">{metrics.outliers?.length || 0}</p>
              </div>
              <div className="text-[11px] text-slate-500 space-y-2 leading-relaxed font-medium">
                <p>
                  Identifies values falling beyond <strong className="text-slate-700">Q1 - 1.5 × IQR</strong> ({((metrics.q1 || 0) - 1.5 * (metrics.iqr || 0)).toFixed(2)}) or above <strong className="text-slate-700">Q3 + 1.5 × IQR</strong> ({((metrics.q3 || 0) + 1.5 * (metrics.iqr || 0)).toFixed(2)}).
                </p>
                {hasOutliers ? (
                  <p className="text-[10px] bg-slate-50 p-2.5 border border-slate-150 rounded-xl leading-normal text-slate-600 font-bold select-all max-h-16 overflow-y-auto">
                    Values: {metrics.outliers?.slice(0, 15).join(', ')} {metrics.outliers!.length > 15 ? '...' : ''}
                  </p>
                ) : (
                  <p className="text-emerald-700 font-black uppercase tracking-wider text-[10px] flex items-center gap-1">
                    ✓ No anomalous deviations. All values are balanced within traditional bounds.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categorical or ID / Boolean Stats */}
      {(type === 'categorical' || type === 'boolean' || type === 'id') && (
        <div id="cat-stats-sheets" className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          {/* Summary KPIs */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distinct Categories</p>
              <p className="text-4xl font-black text-indigo-600 font-sans">{metrics.uniqueCategories}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-1.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Most Frequent Segment</p>
              <p className="text-xl font-black text-slate-800 truncate" title={metrics.topCategory}>"{metrics.topCategory}"</p>
              {metrics.frequencyTable && metrics.frequencyTable[0] && (
                <p className="text-[11px] text-slate-500 font-medium capitalize">
                  Appears <span className="text-indigo-600 font-bold">{metrics.frequencyTable[0].count}</span> times (<span className="text-slate-700 font-black">{metrics.frequencyTable[0].percentage}%</span> prevalence)
                </p>
              )}
            </div>
          </div>

          {/* Table distribution bar */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs md:col-span-2 space-y-4">
            <h4 className="font-extrabold text-slate-850 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
              Categorical frequency & Percentage distribution (Top 10 skew)
            </h4>

            {metrics.frequencyTable && metrics.frequencyTable.length > 0 ? (
              <div className="space-y-4.5">
                {metrics.frequencyTable.slice(0, 10).map((item, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-slate-700 truncate max-w-[200px]" title={item.value}>
                        {item.value || '[EMPTY FIELD]'}
                      </span>
                      <span className="text-slate-450 text-[10px] font-black">
                        {item.count} rows ({item.percentage}%)
                      </span>
                    </div>

                    <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
                
                {metrics.frequencyTable.length > 10 && (
                  <p className="text-right text-[10px] text-slate-400 uppercase italic font-medium">
                    Top 10 of {metrics.frequencyTable.length} dimensions displayed.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No values reported.</p>
            )}
          </div>
        </div>
      )}

      {/* Date Stats */}
      {type === 'date' && (
        <div id="date-stats-sheets" className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-5">
            <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">Chronological Milestones</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-50/55 border border-slate-150 text-center rounded-xl">
                <p className="text-[9px] uppercase font-bold text-slate-400">Earliest Record</p>
                <p className="text-xs font-black text-slate-700 mt-1">{metrics.earliestDate}</p>
              </div>
              <div className="p-3 bg-slate-50/55 border border-slate-150 text-center rounded-xl">
                <p className="text-[9px] uppercase font-bold text-slate-400">Latest Record</p>
                <p className="text-xs font-black text-slate-700 mt-1">{metrics.latestDate}</p>
              </div>
            </div>

            <div className="p-5 bg-indigo-50/20 text-center border-2 border-dashed border-indigo-200 rounded-2xl shadow-3xs">
              <p className="text-[10px] uppercase font-extrabold text-indigo-750">Total Span In Days</p>
              <p className="text-3xl font-black text-indigo-600 mt-1.5 font-sans">{metrics.dateRangeDays} DAYS</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h4 className="font-extrabold text-slate-850 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">Time-Series Volumes</h4>
            
            <div className="space-y-2 max-h-[190px] overflow-y-auto scrollbar-thin">
              {metrics.recordsPerYear && Object.keys(metrics.recordsPerYear).length > 0 ? (
                Object.entries(metrics.recordsPerYear).sort().map(([year, count]) => (
                  <div key={year} className="flex justify-between items-center text-xs border-b border-slate-100 pb-2 last:border-none last:pb-0">
                    <span className="font-extrabold text-slate-600">Year {year}</span>
                    <span className="bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-750 text-indigo-600 py-0.5 px-2.5 font-black text-[10px] rounded-full transition">{count} rows</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No historical volumes found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Text Stats */}
      {type === 'text' && (
        <div id="text-stats-sheets" className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
            <h4 className="font-extrabold text-slate-850 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">String Character Scale</h4>
            <div className="grid grid-cols-3 gap-3 text-center font-bold">
              <div className="p-3 bg-slate-50/50 border border-slate-150 rounded-xl">
                <p className="text-[9px] uppercase text-slate-400">Avg Length</p>
                <p className="text-md mt-1.5 text-indigo-600 font-extrabold">{metrics.avgLength} ch</p>
              </div>
              <div className="p-3 bg-slate-50/50 border border-slate-150 rounded-xl">
                <p className="text-[9px] uppercase text-slate-400">Min Length</p>
                <p className="text-md mt-1.5 text-slate-700 font-extrabold">{metrics.minLength} ch</p>
              </div>
              <div className="p-3 bg-slate-50/50 border border-slate-150 rounded-xl">
                <p className="text-[9px] uppercase text-slate-400">Max Length</p>
                <p className="text-md mt-1.5 text-slate-700 font-extrabold">{metrics.maxLength} ch</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4 flex flex-col justify-center">
            <h4 className="font-extrabold text-slate-850 text-xs uppercase tracking-wider pb-2 border-b border-slate-100">Blank Fields Check</h4>
            <div className="p-5 bg-indigo-50/20 border border-indigo-150 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-indigo-700 uppercase">Omits / Null Strings</p>
                <p className="text-[9px] text-slate-400 uppercase font-medium mt-0.5">Empty spaces inside cells</p>
              </div>
              <p className="text-xl font-black text-slate-750 font-sans">{metrics.emptyCount} CELLS</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
