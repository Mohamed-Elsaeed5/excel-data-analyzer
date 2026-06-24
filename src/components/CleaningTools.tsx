/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SheetDataState, DataCleanState } from '../types';
import { cleanDataset, CleaningLog } from '../utils/cleaner';
import { analyzeDataset, generateAutoInsights, generateRecommendations } from '../utils/analyzer';
import { Sparkles, Trash2, Brush, RefreshCw, Layers, CheckCircle, Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface CleaningToolsProps {
  sheetState: SheetDataState;
  setSheetState: (state: SheetDataState | null) => void;
  setLoading: (loading: boolean) => void;
}

export default function CleaningTools({
  sheetState,
  setSheetState,
  setLoading
}: CleaningToolsProps) {
  const { data, columns, columnProfiles, columnQualities, summary } = sheetState;

  // Cleaning options toggles
  const [options, setOptions] = useState<DataCleanState>({
    removeDuplicates: summary.duplicateRows > 0,
    fillMissingNumerical: 'none',
    fillMissingCategorical: 'none',
    standardizeText: true,
    trimWhitespace: true,
    standardizeHeaders: false,
    removeEmptyColumns: columnQualities.some(q => q.missingPercentage > 75)
  });

  const [cleaningLogs, setCleaningLogs] = useState<CleaningLog[]>([]);
  const [hasCleaned, setHasCleaned] = useState(false);

  // Trigger main batch cleaning
  const handleBatchClean = () => {
    setLoading(true);
    setCleaningLogs([]);
    setHasCleaned(false);

    setTimeout(() => {
      try {
        const { cleanedRows, newColumns, logs } = cleanDataset(
          sheetState.originalData,
          sheetState.columns,
          sheetState.columnProfiles,
          sheetState.columnQualities,
          options
        );

        // Recalculate profiling and reports
        const { profiles, qualities, stats, summary: newSummary } = analyzeDataset(cleanedRows, newColumns);
        const insights = generateAutoInsights(cleanedRows, newColumns, profiles, qualities, stats, newSummary);
        const recommendations = generateRecommendations(newColumns, profiles, qualities, stats, newSummary);

        setSheetState({
          ...sheetState,
          data: cleanedRows,
          columns: newColumns,
          columnProfiles: profiles,
          columnQualities: qualities,
          columnStats: stats,
          summary: newSummary,
          insights,
          recommendations
        });

        setCleaningLogs(logs);
        setHasCleaned(true);
      } catch (err: any) {
        alert(`Error applying dataset cleaning: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }, 150);
  };

  // Quick separate triggers
  const handleQuickDuplicatesRemove = () => {
    setLoading(true);
    setTimeout(() => {
      const { cleanedRows, newColumns, logs } = cleanDataset(
        sheetState.data,
        sheetState.columns,
        sheetState.columnProfiles,
        sheetState.columnQualities,
        {
          removeDuplicates: true,
          fillMissingNumerical: 'none',
          fillMissingCategorical: 'none',
          standardizeText: false,
          trimWhitespace: false,
          standardizeHeaders: false,
          removeEmptyColumns: false
        }
      );

      const { profiles, qualities, stats, summary: newSummary } = analyzeDataset(cleanedRows, newColumns);
      const insights = generateAutoInsights(cleanedRows, newColumns, profiles, qualities, stats, newSummary);
      const recommendations = generateRecommendations(newColumns, profiles, qualities, stats, newSummary);

      setSheetState({
        ...sheetState,
        data: cleanedRows,
        columns: newColumns,
        columnProfiles: profiles,
        columnQualities: qualities,
        columnStats: stats,
        summary: newSummary,
        insights,
        recommendations
      });
      setCleaningLogs(logs);
      setHasCleaned(true);
      setLoading(false);
    }, 100);
  };

  const handleQuickImputeNulls = () => {
    setLoading(true);
    setTimeout(() => {
      const { cleanedRows, newColumns, logs } = cleanDataset(
        sheetState.data,
        sheetState.columns,
        sheetState.columnProfiles,
        sheetState.columnQualities,
        {
          removeDuplicates: false,
          fillMissingNumerical: 'median',
          fillMissingCategorical: 'unknown',
          standardizeText: false,
          trimWhitespace: false,
          standardizeHeaders: false,
          removeEmptyColumns: false
        }
      );

      const { profiles, qualities, stats, summary: newSummary } = analyzeDataset(cleanedRows, newColumns);
      const insights = generateAutoInsights(cleanedRows, newColumns, profiles, qualities, stats, newSummary);
      const recommendations = generateRecommendations(newColumns, profiles, qualities, stats, newSummary);

      setSheetState({
        ...sheetState,
        data: cleanedRows,
        columns: newColumns,
        columnProfiles: profiles,
        columnQualities: qualities,
        columnStats: stats,
        summary: newSummary,
        insights,
        recommendations
      });
      setCleaningLogs(logs);
      setHasCleaned(true);
      setLoading(false);
    }, 100);
  };

  const handleQuickHeadersStandardize = () => {
    setLoading(true);
    setTimeout(() => {
      const { cleanedRows, newColumns, logs } = cleanDataset(
        sheetState.data,
        sheetState.columns,
        sheetState.columnProfiles,
        sheetState.columnQualities,
        {
          removeDuplicates: false,
          fillMissingNumerical: 'none',
          fillMissingCategorical: 'none',
          standardizeText: false,
          trimWhitespace: false,
          standardizeHeaders: true,
          removeEmptyColumns: false
        }
      );

      const { profiles, qualities, stats, summary: newSummary } = analyzeDataset(cleanedRows, newColumns);
      const insights = generateAutoInsights(cleanedRows, newColumns, profiles, qualities, stats, newSummary);
      const recommendations = generateRecommendations(newColumns, profiles, qualities, stats, newSummary);

      setSheetState({
        ...sheetState,
        data: cleanedRows,
        columns: newColumns,
        columnProfiles: profiles,
        columnQualities: qualities,
        columnStats: stats,
        summary: newSummary,
        insights,
        recommendations
      });
      setCleaningLogs(logs);
      setHasCleaned(true);
      setLoading(false);
    }, 100);
  };

  // Download cleaned file directly to user
  const handleExportCleaned = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sheetState.data);
    XLSX.utils.book_append_sheet(wb, ws, "Cleaned_Data");
    XLSX.writeFile(wb, `${sheetState.currentSheet}_Cleaned_Report.xlsx`);
  };

  return (
    <div id="cleaning-tools-tab-container" className="space-y-6 animate-fade-in">
      {/* Overview */}
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
        <h2 className="text-2xl font-extrabold text-slate-850 uppercase tracking-tight font-sans">Advanced Data Cleaning Suite</h2>
        <p className="text-xs text-slate-500 font-mono font-medium leading-relaxed">
          ✨ RESOLUTIONS ENGINE: Execute targeted validation fixes, remove sparse variables, format records, and impute numerical coordinates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Configure options */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6 lg:col-span-2">
          <h3 className="font-extrabold text-slate-800 font-mono text-xs uppercase tracking-wider pb-3 border-b border-slate-100 flex items-center gap-1.5">
            <Brush className="h-4.5 w-4.5 text-indigo-600" />
            Configurable Cleaning Rules Matrix
          </h3>

          <div className="space-y-4">
            {/* Duplicates */}
            <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-150 bg-slate-50/30 hover:bg-indigo-50/15 duration-200 transition">
              <input
                type="checkbox"
                id="opt_dups"
                checked={options.removeDuplicates}
                onChange={(e) => setOptions({ ...options, removeDuplicates: e.target.checked })}
                className="mt-1.5 h-4.5 w-4.5 accent-indigo-600 rounded cursor-pointer"
              />
              <div className="space-y-1.5 font-mono text-xs w-full">
                <label htmlFor="opt_dups" className="font-extrabold text-slate-800 cursor-pointer flex items-center justify-between flex-wrap gap-2">
                  <span>PURGE REDUNDANT ROW DUPLICATES</span>
                  {summary.duplicateRows > 0 && (
                    <span className="px-2 py-0.5 text-[9px] bg-rose-50 text-rose-700 border border-rose-200 font-black rounded-full animate-pulse">
                      DETECTED: {summary.duplicateRows}
                    </span>
                  )}
                </label>
                <p className="text-[11px] text-slate-400 leading-normal font-medium">Deletes matching row objects across all column indexes sequentially.</p>
              </div>
            </div>

            {/* Empty values numerical */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-150 bg-slate-50/30">
              <div className="space-y-1 font-mono text-xs">
                <span className="font-extrabold text-slate-800 uppercase block">IMPUTE SPARSE NUMERICAL VALUES</span>
                <p className="text-[11px] text-slate-400 leading-normal font-medium">Populate empty numeric slots using mathematical coordinates.</p>
              </div>
              <select
                value={options.fillMissingNumerical}
                onChange={(e: any) => setOptions({ ...options, fillMissingNumerical: e.target.value })}
                className="px-3 py-2 text-xs bg-white border border-slate-200 hover:border-indigo-400 rounded-xl font-mono font-bold select-none cursor-pointer outline-none uppercase text-slate-700 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="none">OMIT IMPUTATIONS (KEEP BLANKS)</option>
                <option value="mean">REPLACE WITH ARITHMETIC MEAN</option>
                <option value="median">REPLACE WITH STATISTICAL MEDIAN</option>
                <option value="zero">FILL WITH NULL ZERO (0)</option>
              </select>
            </div>

            {/* Empty values categorical */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-150 bg-slate-50/30">
              <div className="space-y-1 font-mono text-xs">
                <span className="font-extrabold text-slate-800 uppercase block">IMPUTE SPARSE CATEGORICAL VALUES</span>
                <p className="text-[11px] text-slate-400 leading-normal font-medium">Resolve empty string coordinates gracefully with tags.</p>
              </div>
              <select
                value={options.fillMissingCategorical}
                onChange={(e: any) => setOptions({ ...options, fillMissingCategorical: e.target.value })}
                className="px-3 py-2 text-xs bg-white border border-slate-200 hover:border-indigo-400 rounded-xl font-mono font-bold select-none cursor-pointer outline-none uppercase text-slate-700 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="none">OMIT IMPUTATIONS (KEEP BLANKS)</option>
                <option value="mode">REPLACE WITH CATEGORICAL MODE</option>
                <option value="unknown">REPLACE WITH WORD "UNKNOWN"</option>
              </select>
            </div>

            {/* Text casing and trim */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-150 bg-slate-50/30 hover:bg-indigo-50/10 transition">
                <input
                  type="checkbox"
                  id="opt_casing"
                  checked={options.standardizeText}
                  onChange={(e) => setOptions({ ...options, standardizeText: e.target.checked })}
                  className="mt-1.5 h-4.5 w-4.5 accent-indigo-600 rounded cursor-pointer"
                />
                <div className="space-y-1">
                  <label htmlFor="opt_casing" className="font-extrabold text-slate-800 cursor-pointer uppercase block">
                    ENFORCE TITLE-CASE CAPITALIZATION
                  </label>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Converts casing of string dimensions uniformly (e.g. converting "active" & "ACTIVE" to "Active").</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-150 bg-slate-50/30 hover:bg-indigo-50/10 transition">
                <input
                  type="checkbox"
                  id="opt_trim"
                  checked={options.trimWhitespace}
                  onChange={(e) => setOptions({ ...options, trimWhitespace: e.target.checked })}
                  className="mt-1.5 h-4.5 w-4.5 accent-indigo-600 rounded cursor-pointer"
                />
                <div className="space-y-1">
                  <label htmlFor="opt_trim" className="font-extrabold text-slate-800 cursor-pointer uppercase block">
                    TRIM SPACES & WHITESPACES
                  </label>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Strips prefix-suffix spacing and reduces multi-space occurrences to single spaces.</p>
                </div>
              </div>
            </div>

            {/* Standardize header names and delete sparsely populated */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-150 bg-slate-50/30 hover:bg-indigo-50/10 transition">
                <input
                  type="checkbox"
                  id="opt_headers"
                  checked={options.standardizeHeaders}
                  onChange={(e) => setOptions({ ...options, standardizeHeaders: e.target.checked })}
                  className="mt-1.5 h-4.5 w-4.5 accent-indigo-600 rounded cursor-pointer"
                />
                <div className="space-y-1">
                  <label htmlFor="opt_headers" className="font-extrabold text-slate-800 cursor-pointer uppercase block">
                    STANDARDIZE COLUMN LABEL HEADERS
                  </label>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Polishes variable names, strip underscores, and capitalise title tokens automatically.</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-xl border border-slate-150 bg-slate-50/30 hover:bg-indigo-50/10 transition">
                <input
                  type="checkbox"
                  id="opt_prune"
                  checked={options.removeEmptyColumns}
                  onChange={(e) => setOptions({ ...options, removeEmptyColumns: e.target.checked })}
                  className="mt-1.5 h-4.5 w-4.5 accent-indigo-600 rounded cursor-pointer"
                />
                <div className="space-y-1">
                  <label htmlFor="opt_prune" className="font-extrabold text-slate-800 cursor-pointer uppercase block">
                    PRUNE DEAD COLUMNS (&gt;75% EMPTY)
                  </label>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Discards column vectors if they hold over 75% NULL entries across rows.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 border-t border-slate-100 flex justify-end font-mono">
            <button
              onClick={handleBatchClean}
              className="px-6 py-3 font-black uppercase tracking-widest text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition cursor-pointer text-xs shadow-md shadow-indigo-500/10"
            >
              RUN DESIRED CLEAN BATCH
            </button>
          </div>
        </div>

        {/* Right Side Quick triggers & logs */}
        <div className="space-y-6">
          {/* Quick Buttons */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-extrabold text-slate-850 font-mono text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
              One-Click Quick Actions
            </h3>

            <div className="space-y-3">
              <button
                onClick={handleQuickDuplicatesRemove}
                disabled={summary.duplicateRows === 0}
                className="w-full px-4 py-3 text-xs text-left bg-slate-55 hover:bg-indigo-50/30 border border-slate-200 text-slate-700 font-mono font-bold uppercase tracking-wider transition rounded-xl flex items-center gap-2 disabled:opacity-30 disabled:hover:bg-slate-55 cursor-pointer"
              >
                <Trash2 className="h-4 w-4 text-rose-500" />
                REMOVE DUPLICATES
              </button>

              <button
                onClick={handleQuickImputeNulls}
                disabled={summary.missingCellCount === 0}
                className="w-full px-4 py-3 text-xs text-left bg-slate-55 hover:bg-indigo-50/30 border border-slate-200 text-slate-700 font-mono font-bold uppercase tracking-wider transition rounded-xl flex items-center gap-2 disabled:opacity-30 disabled:hover:bg-slate-55 cursor-pointer"
              >
                <RefreshCw className="h-4 w-4 text-indigo-500" />
                IMPUTE SPARSE VALUES
              </button>

              <button
                onClick={handleQuickHeadersStandardize}
                className="w-full px-4 py-3 text-xs text-left bg-slate-55 hover:bg-indigo-50/30 border border-slate-200 text-slate-700 font-mono font-bold uppercase tracking-wider transition rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Layers className="h-4 w-4 text-purple-500" />
                STANDARDIZE HEADERS
              </button>
            </div>
          </div>

          {/* Cleaning Logs Terminal */}
          <div className="bg-slate-900 border border-slate-805 text-slate-100 p-6 rounded-2xl shadow-xs space-y-4 font-mono">
            <h3 className="font-black text-xs uppercase tracking-wider pb-2 border-b border-slate-800 flex items-center justify-between text-indigo-300">
              CLIPPING TERMINAL DIALOG
              {hasCleaned && (
                <span className="text-[9px] text-emerald-800 bg-emerald-400/90 hover:bg-emerald-400 px-2.0 py-0.5 font-bold uppercase rounded">
                  FINISHED
                </span>
              )}
            </h3>

            {cleaningLogs.length > 0 ? (
              <div className="space-y-3 max-h-56 overflow-y-auto text-xs scrollbar-thin scrollbar-thumb-slate-800 text-slate-300">
                {cleaningLogs.map((log, index) => (
                  <div key={index} className="space-y-1.5 border-b border-slate-800 pb-2 last:border-b-0">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                      <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                      {log.action.toUpperCase()}
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed pl-6 font-medium">{log.details}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 uppercase italic text-center py-10 border border-dashed border-slate-800/80 rounded-xl">No active adjustments run on current dataset.</p>
            )}
          </div>
        </div>
      </div>

      {/* Direct Export bar */}
      {hasCleaned && (
        <div className="p-6 bg-emerald-500/5 hover:bg-emerald-500/10 rounded-2xl border border-emerald-350 shadow-3xs flex flex-col sm:flex-row justify-between items-center gap-4 font-mono transition duration-300">
          <div className="text-center sm:text-left space-y-1">
            <p className="font-black text-emerald-950 text-sm uppercase">DOWNLOAD AUDITED EXCEL WORKBOOK</p>
            <p className="text-[11px] text-emerald-850 font-bold uppercase">[SAVES ALL VALUATION TRANSFORMS, RE-CASING, AND IMPUTATIONS SPECIFICALLY]</p>
          </div>
          <button
            onClick={handleExportCleaned}
            className="px-5 py-3 text-xs font-black uppercase tracking-widest text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition cursor-pointer inline-flex items-center gap-2 shadow-md shadow-emerald-500/10"
          >
            <Download className="h-4.5 w-4.5 text-emerald-250" />
            DOWNLOAD OUTFILE
          </button>
        </div>
      )}
    </div>
  );
}
