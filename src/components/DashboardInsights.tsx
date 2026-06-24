/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, ScatterChart, Scatter
} from 'recharts';
import { SheetDataState } from '../types';
import { BarChart3, TrendingUp, Grid, Sparkles, Target, Layers } from 'lucide-react';
import { calculateCorrelation } from '../utils/analyzer';

interface DashboardInsightsProps {
  sheetState: SheetDataState;
}

export default function DashboardInsights({ sheetState }: DashboardInsightsProps) {
  const { data, columns, columnProfiles, summary } = sheetState;

  // Identify available numeric and categorical columns
  const numericCols = columnProfiles.filter(p => p.type === 'numerical').map(p => p.name);
  const categoricalCols = columnProfiles.filter(p => p.type === 'categorical' || p.type === 'boolean').map(p => p.name);
  const dateCols = columnProfiles.filter(p => p.type === 'date').map(p => p.name);

  // Active column states for custom analytics
  const [activeNumCol, setActiveNumCol] = useState<string>(numericCols[0] || '');
  const [activeCatCol, setActiveCatCol] = useState<string>(categoricalCols[0] || '');

  // Calculate histogram bins for active numeric column
  const getHistogramData = (colName: string) => {
    if (!colName) return [];
    const nums = data
      .map(r => Number(r[colName]))
      .filter(n => !isNaN(n) && n !== null && n !== undefined)
      .sort((a, b) => a - b);

    if (nums.length === 0) return [];
    
    const min = nums[0];
    const max = nums[nums.length - 1];
    const range = max - min;
    const numBins = Math.min(8, Math.max(5, Math.ceil(Math.sqrt(nums.length))));
    const binWidth = range / (numBins || 1);
    
    const bins = Array.from({ length: numBins }, (_, i) => {
      const bMin = min + i * binWidth;
      const bMax = bMin + binWidth;
      return {
        name: `${bMin.toFixed(1)}-${bMax.toFixed(1)}`,
        min: bMin,
        max: bMax,
        count: 0
      };
    });

    for (const n of nums) {
      let allocated = false;
      for (let i = 0; i < bins.length; i++) {
        if (n >= bins[i].min && (i === bins.length - 1 ? n <= bins[i].max : n < bins[i].max)) {
          bins[i].count++;
          allocated = true;
          break;
        }
      }
      if (!allocated && bins.length > 0) {
        bins[bins.length - 1].count++;
      }
    }

    return bins;
  };

  // Convert categorical frequencies to recharts format
  const getCategoricalChartData = (colName: string) => {
    if (!colName) return [];
    const counts: Record<string, number> = {};
    let nonNullsCount = 0;
    
    for (const r of data) {
      const val = String(r[colName] || '').trim();
      if (val) {
        counts[val] = (counts[val] || 0) + 1;
        nonNullsCount++;
      }
    }

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Number(((count / (nonNullsCount || 1)) * 100).toFixed(1))
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8); // Display top 8 categories
  };

  // Convert date frequencies to chart series
  const getDateChartData = (colName: string) => {
    if (!colName) return [];
    const counts: Record<string, number> = {};
    for (const r of data) {
      const cell = r[colName];
      if (cell) {
        let d: Date;
        if (cell instanceof Date) {
          d = cell;
        } else {
          d = new Date(String(cell));
        }

        if (!isNaN(d.getTime())) {
          const yr = d.getFullYear();
          const mo = `${yr}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          counts[mo] = (counts[mo] || 0) + 1;
        }
      }
    }

    return Object.entries(counts)
      .sort((a,b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));
  };

  // Grouped numeric performance by categories
  const getGroupedData = (catCol: string, numCol: string) => {
    if (!catCol || !numCol) return [];
    const groups: Record<string, { sum: number; count: number }> = {};
    for (const r of data) {
      const catVal = String(r[catCol] || 'Unknown').trim();
      const numVal = Number(r[numCol]);
      if (!isNaN(numVal) && numVal !== null && numVal !== undefined) {
        if (!groups[catVal]) {
          groups[catVal] = { sum: 0, count: 0 };
        }
        groups[catVal].sum += numVal;
        groups[catVal].count++;
      }
    }

    return Object.entries(groups)
      .map(([name, stat]) => ({
        name,
        average: Number((stat.sum / stat.count).toFixed(2)),
        count: stat.count
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 8);
  };

  // Numeric to Numeric relationship coordinates
  const getScatterData = (colX: string, colY: string) => {
    if (!colX || !colY) return [];
    return data
      .map(r => ({
        x: Number(r[colX]),
        y: Number(r[colY])
      }))
      .filter(pts => !isNaN(pts.x) && !isNaN(pts.y));
  };

  return (
    <div id="dashboard-tab-container" className="space-y-8 animate-fade-in">
      {/* KPI Overviews */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/90 p-5 rounded-2xl border border-slate-200 shadow-3xs font-mono text-center hover:shadow-xs transition duration-300">
          <p className="text-[9px] uppercase font-bold text-slate-400">Total Rows</p>
          <p className="text-2xl font-black text-slate-800 mt-1 font-sans">{data.length}</p>
        </div>
        <div className="bg-white/90 p-5 rounded-2xl border border-slate-200 shadow-3xs font-mono text-center hover:shadow-xs transition duration-300">
          <p className="text-[9px] uppercase font-bold text-slate-400">Total Columns</p>
          <p className="text-2xl font-black text-slate-800 mt-1 font-sans">{columns.length}</p>
        </div>
        <div className="bg-white/90 p-5 rounded-2xl border border-slate-200 shadow-3xs font-mono text-center hover:shadow-xs transition duration-300">
          <p className="text-[9px] uppercase font-bold text-slate-400">Null Fields</p>
          <p className="text-2xl font-black text-amber-600 mt-1 font-sans">{summary.missingCellCount}</p>
        </div>
        <div className="bg-white/90 p-5 rounded-2xl border border-slate-200 shadow-3xs font-mono text-center hover:shadow-xs transition duration-300">
          <p className="text-[9px] uppercase font-bold text-slate-400">Duplicates</p>
          <p className="text-2xl font-black text-red-500 mt-1 font-sans">{summary.duplicateRows}</p>
        </div>
        <div className="bg-emerald-500/5 p-5 rounded-2xl border border-emerald-150 font-mono text-center hover:shadow-xs transition duration-300">
          <p className="text-[9px] uppercase font-bold text-emerald-800">Health Rating</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <p className="text-2xl font-black text-emerald-950 font-sans">{summary.overallQualityScore}%</p>
            <span className={`h-2.5 w-2.5 rounded-full ${
              summary.overallColor === 'green' ? 'bg-emerald-500' : summary.overallColor === 'yellow' ? 'bg-amber-500' : 'bg-rose-500'
            }`} />
          </div>
        </div>
      </div>

      {/* Dynamic Histograms and Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Numerical Histograms */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
              <BarChart3 className="h-4.5 w-4.5 text-indigo-600" />
              Numerical Histogram Density
            </h3>
            {numericCols.length > 0 ? (
              <select
                value={activeNumCol}
                onChange={(e) => setActiveNumCol(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 bg-white font-mono text-[10px] font-bold uppercase rounded-xl select-none cursor-pointer outline-none shrink-0 hover:border-indigo-400"
              >
                {numericCols.map(col => (
                  <option key={col} value={col}>{col.toUpperCase()}</option>
                ))}
              </select>
            ) : (
              <span className="text-[10px] uppercase font-mono text-slate-400 italic font-semibold">No quantitative metrics</span>
            )}
          </div>

          {activeNumCol ? (
            <div className="h-64 font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getHistogramData(activeNumCol)}>
                  <defs>
                    <linearGradient id="numGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.4} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.6} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" tickLine={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9', fillOpacity: 0.6 }} contentStyle={{ fontSize: 10, fontFamily: 'monospace', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }} />
                  <Bar dataKey="count" fill="url(#numGradient)" radius={[4, 4, 0, 0]} name="Records Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-[11px] font-mono uppercase text-slate-400 text-center py-24 border border-dashed border-slate-200 rounded-2xl">No Quantitative Measures Found.</p>
          )}
        </div>

        {/* Categorical horizontal distributions */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Layers className="h-4.5 w-4.5 text-indigo-600" />
              Categorical Prevalence (Top 8)
            </h3>
            {categoricalCols.length > 0 ? (
              <select
                value={activeCatCol}
                onChange={(e) => setActiveCatCol(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 bg-white font-mono text-[10px] font-bold uppercase rounded-xl select-none cursor-pointer outline-none shrink-0 hover:border-indigo-400"
              >
                {categoricalCols.map(col => (
                  <option key={col} value={col}>{col.toUpperCase()}</option>
                ))}
              </select>
            ) : (
              <span className="text-[10px] uppercase font-mono text-slate-400 italic text-right font-semibold">No categorical coordinates</span>
            )}
          </div>

          {activeCatCol ? (
            <div className="h-64 font-mono text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getCategoricalChartData(activeCatCol)} layout="vertical">
                  <defs>
                    <linearGradient id="catGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#818cf8" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#c084fc" stopOpacity={0.6} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#cbd5e1" strokeOpacity={0.6} />
                  <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" tickLine={false} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 8, fill: '#64748b' }} stroke="#cbd5e1" tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: 10, fontFamily: 'monospace', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
                  <Bar dataKey="count" fill="url(#catGradient)" radius={[0, 4, 4, 0]} name="Frequency" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-[11px] font-mono uppercase text-slate-400 text-center py-24 border border-dashed border-slate-200 rounded-2xl">No qualitative partitions located.</p>
          )}
        </div>
      </div>

      {/* Grouped averages BarChart (Categorical + Numerical analysis) */}
      {categoricalCols.length > 0 && numericCols.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-indigo-500 animate-pulse" />
              Segment average profiling: {activeNumCol || numericCols[0]} grouped by {activeCatCol || categoricalCols[0]}
            </h3>
            <p className="text-[11px] font-mono uppercase text-slate-400 font-bold leading-normal mt-1">
              [Mathematical cross-joins computing mean value across partitions]
            </p>
          </div>

          <div className="h-72 font-mono text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getGroupedData(activeCatCol || categoricalCols[0], activeNumCol || numericCols[0])}>
                <defs>
                  <linearGradient id="groupedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.6} />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 10, fontFamily: 'monospace', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
                <Bar dataKey="average" fill="url(#groupedGradient)" radius={[4, 4, 0, 0]} name="Mean Aggregate" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Date Trends AreaChart */}
      {dateCols.length > 0 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-850 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
              <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
              Chronological period density timeline (Active Coordinate: {dateCols[0]})
            </h3>
            <p className="text-[11px] font-mono uppercase text-slate-400 font-bold mt-1">Tracks record counts across chronological blocks.</p>
          </div>

          <div className="h-60 font-mono text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={getDateChartData(dateCols[0])}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.6} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 10, fontFamily: 'monospace', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#areaGradient)" name="Volume" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Multi-Numerical Pearson Correlation Grid (N x N) */}
      {numericCols.length >= 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Grid className="h-4.5 w-4.5 text-indigo-500" />
              Linear Pearson Correlation Matrix
            </h3>
            <p className="text-[11px] font-mono uppercase text-slate-400 font-bold leading-normal mt-1">
              Computes relationship weights from <strong>-1.00</strong> (perf inverse) to <strong>+1.00</strong> (perf direct). Direct correlations imply direct linear trends.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200 overflow-hidden">
            <table className="w-full text-center text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 text-slate-700 border-b border-slate-200 uppercase">
                  <th className="py-3.5 px-4 text-left font-black border-r border-slate-200">Feature Matrix</th>
                  {numericCols.slice(0, 5).map(c => (
                    <th key={c} className="py-3.5 px-4 font-black border-r border-slate-200 last:border-0">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {numericCols.slice(0, 5).map(rowCol => (
                  <tr key={rowCol} className="hover:bg-indigo-50/10 transition">
                    <td className="py-3.5 px-4 font-black text-slate-800 text-left border-r border-slate-250 bg-slate-50/30">
                      {rowCol}
                    </td>
                    {numericCols.slice(0, 5).map(colCol => {
                      const corr = calculateCorrelation(data, rowCol, colCol);
                      const absCorr = Math.abs(corr);
                      let bgStyle = "bg-transparent text-slate-600";
                      
                      if (rowCol === colCol) {
                        bgStyle = "bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-black";
                      } else if (absCorr > 0.70) {
                        bgStyle = "bg-indigo-100 text-indigo-805 font-bold rounded";
                      } else if (absCorr > 0.40) {
                        bgStyle = "bg-indigo-50 text-indigo-700 rounded";
                      }
                      
                      return (
                        <td key={colCol} className={`py-3.5 px-4 border-r border-slate-100 last:border-0 font-bold font-mono transition text-[11px] ${bgStyle}`}>
                          {corr.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Numeric vs Numeric Relationship Scatter */}
      {numericCols.length >= 2 && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
              <Target className="h-4.5 w-4.5 text-indigo-600" />
              Co-dependency relationship scatter
            </h3>
            <div className="flex gap-2">
              <select
                value={activeNumCol}
                onChange={(e) => setActiveNumCol(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 bg-white font-mono text-[10px] font-bold uppercase rounded-xl hover:border-indigo-400 select-none cursor-pointer outline-none"
              >
                {numericCols.map(col => (
                  <option key={col} value={col}>X: {col.toUpperCase()}</option>
                ))}
              </select>
              <select
                value={numericCols[1] === activeNumCol ? numericCols[0] : numericCols[1]}
                onChange={(e) => {}}
                disabled
                className="px-3 py-1.5 border border-slate-200 bg-slate-50 text-slate-450 font-mono text-[10px] font-bold uppercase rounded-xl cursor-not-allowed"
              >
                <option>Y: {(numericCols[1] === activeNumCol ? numericCols[0] : numericCols[1]).toUpperCase()}</option>
              </select>
            </div>
          </div>

          <div className="h-64 font-mono text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.6} />
                <XAxis type="number" dataKey="x" name={activeNumCol} tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" tickLine={false} />
                <YAxis type="number" dataKey="y" name={numericCols[1] === activeNumCol ? numericCols[0] : numericCols[1]} tick={{ fontSize: 9, fill: '#64748b' }} stroke="#cbd5e1" tickLine={false} />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ fontSize: 10, fontFamily: 'monospace', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px' }} />
                <Scatter name="Points" data={getScatterData(activeNumCol, numericCols[1] === activeNumCol ? numericCols[0] : numericCols[1])} fill="#6366f1" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
