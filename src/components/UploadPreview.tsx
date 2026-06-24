/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Eye, ChevronLeft, ChevronRight, RefreshCw, Layers } from 'lucide-react';
import { SheetDataState, DatasetSummary } from '../types';
import { analyzeDataset, generateAutoInsights, generateRecommendations } from '../utils/analyzer';

interface UploadPreviewProps {
  sheetState: SheetDataState | null;
  setSheetState: (state: SheetDataState | null) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  onTabChange: (tab: string) => void;
}

export default function UploadPreview({
  sheetState,
  setSheetState,
  loading,
  setLoading,
  onTabChange
}: UploadPreviewProps) {
  const [dragActive, setDragActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rowsPerPage = 10;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension !== 'xlsx' && extension !== 'xls') {
      alert('Unsupported file format. Please upload a valid Excel (.xlsx, .xls) file.');
      return;
    }

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let workbook: XLSX.WorkBook;

        if (data instanceof ArrayBuffer) {
          workbook = XLSX.read(new Uint8Array(data), { type: 'array', cellDates: true });
        } else {
          workbook = XLSX.read(data, { type: 'binary', cellDates: true });
        }

        const sheetNames = workbook.SheetNames;
        if (sheetNames.length === 0) {
          throw new Error('This Excel file does not contain any worksheets.');
        }

        const firstSheet = sheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        
        // Parse rows including empty cells correctly
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        if (rawJson.length === 0) {
          throw new Error('The selected sheet is completely empty.');
        }

        // Extract column names based on keys in parsed records
        const allKeys = new Set<string>();
        for (const row of rawJson) {
          for (const key of Object.keys(row)) {
            allKeys.add(key);
          }
        }
        const columns = Array.from(allKeys);

        // Run profiling analysis
        const { profiles, qualities, stats, summary } = analyzeDataset(rawJson, columns);
        const insights = generateAutoInsights(rawJson, columns, profiles, qualities, stats, summary);
        const recommendations = generateRecommendations(columns, profiles, qualities, stats, summary);

        // Standard workbook state initialization
        setSheetState({
          sheetNames,
          currentSheet: firstSheet,
          originalData: rawJson,
          data: rawJson,
          columns,
          columnProfiles: profiles,
          columnQualities: qualities,
          columnStats: stats,
          summary,
          insights,
          recommendations
        });
        setCurrentPage(1);

        // Store entire workbook as a window property securely to allow switching sheets without re-uploading
        (window as any).__ACTIVE_WORKBOOK__ = workbook;
      } catch (err: any) {
        alert(`Error parsing Excel file: ${err.message || err}`);
      } finally {
        setLoading(false);
      }
    };

    reader.onerror = () => {
      alert('File reading failed. Please try again.');
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleSheetChange = (sheetName: string) => {
    const workbook = (window as any).__ACTIVE_WORKBOOK__;
    if (!workbook) return;

    setLoading(true);
    setTimeout(() => {
      try {
        const worksheet = workbook.Sheets[sheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawJson.length === 0) {
          alert(`Sheet "${sheetName}" is empty.`);
          setLoading(false);
          return;
        }

        const allKeys = new Set<string>();
        for (const row of rawJson) {
          for (const key of Object.keys(row)) {
            allKeys.add(key);
          }
        }
        const columns = Array.from(allKeys);

        const { profiles, qualities, stats, summary } = analyzeDataset(rawJson, columns);
        const insights = generateAutoInsights(rawJson, columns, profiles, qualities, stats, summary);
        const recommendations = generateRecommendations(columns, profiles, qualities, stats, summary);

        setSheetState({
          sheetNames: sheetState?.sheetNames || [sheetName],
          currentSheet: sheetName,
          originalData: rawJson,
          data: rawJson,
          columns,
          columnProfiles: profiles,
          columnQualities: qualities,
          columnStats: stats,
          summary,
          insights,
          recommendations
        });
        setCurrentPage(1);
      } catch (err: any) {
        alert(`Error reloading sheet: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }, 100);
  };

  const handleReset = () => {
    setSheetState(null);
    setCurrentPage(1);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Preview Pagination logic
  const dataset = sheetState?.data || [];
  const totalPages = Math.ceil(dataset.length / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = dataset.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div id="upload-preview-container" className="space-y-6">
      {!sheetState ? (
        <div id="intro-card" className="max-w-4xl mx-auto text-center space-y-8 py-8 animate-fade-in">
          <div className="space-y-3">
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 uppercase font-sans">
              DataEngine Excel Analyzer
            </h1>
            <p className="max-w-2xl mx-auto text-[14px] text-indigo-600 font-mono font-bold tracking-wider uppercase">
              🚀 AUTOMATED DATA DIAGNOSTICS & CLEANING HUB
            </p>
          </div>

          {/* Drag & Drop Area */}
          <div
            id="drag-drop-zone"
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed p-12 rounded-3xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center space-y-6 max-w-2xl mx-auto ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50 shadow-xl shadow-indigo-500/10'
                : 'border-slate-300 bg-white hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/5 hover:bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept=".xlsx, .xls"
              className="hidden"
            />
            
            <div className="h-16 w-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Upload className="h-7 w-7" />
            </div>

            <div className="space-y-1 text-center font-mono">
              <p className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Drag & drop your Excel file here</p>
              <p className="text-[11px] text-slate-400 font-semibold uppercase">OR CLICK TO BROWSE WORKBOOKS (.xlsx, .xls)</p>
            </div>

            <button
              type="button"
              className="px-6 py-3 text-xs font-mono font-bold uppercase tracking-widest text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 hover:shadow-md transition cursor-pointer"
            >
              Browse Files
            </button>
          </div>

          {/* Quick Info Accents */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto text-left pt-6 font-mono">
            <div className="p-6 bg-white/85 rounded-2xl border border-slate-200/80 shadow-sm flex gap-4 hover:border-indigo-200 transition duration-300">
              <div className="h-10 w-10 shrink-0 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center font-bold text-sm border border-indigo-100">1</div>
              <div className="space-y-1 text-xs">
                <p className="font-extrabold text-slate-800 uppercase text-[12px]">Secure Parsing</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">Computes strictly in-browser. Private corporate records never land on external networks.</p>
              </div>
            </div>
            <div className="p-6 bg-white/85 rounded-2xl border border-slate-200/80 shadow-sm flex gap-4 hover:border-purple-200 transition duration-300">
              <div className="h-10 w-10 shrink-0 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center font-bold text-sm border border-purple-100">2</div>
              <div className="space-y-1 text-xs">
                <p className="font-extrabold text-slate-800 uppercase text-[12px]">Deep Auditing</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">Scans missing values, checks inconsistent text casing, isolates outliers, and profiles ranges.</p>
              </div>
            </div>
            <div className="p-6 bg-white/85 rounded-2xl border border-slate-200/80 shadow-sm flex gap-4 hover:border-pink-200 transition duration-300">
              <div className="h-10 w-10 shrink-0 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center font-bold text-sm border border-pink-100">3</div>
              <div className="space-y-1 text-xs">
                <p className="font-extrabold text-slate-800 uppercase text-[12px]">Interactive BI</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">Offers custom distributions, linear trend indexes, automatic takeaways, and clean-up modules.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div id="loaded-preview-card" className="space-y-6 animate-fade-in">
          {/* Active File Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200/60 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-tr from-indigo-500 to-indigo-650 text-white rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/10">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div className="space-y-0.5 font-mono">
                <div className="flex items-center flex-wrap gap-2">
                  <h2 className="font-black text-slate-800 text-md uppercase">ACTIVE WORKSHEET: {sheetState.currentSheet}</h2>
                  <span className="px-2.5 py-0.5 text-[9px] text-emerald-800 bg-emerald-50 font-bold uppercase border border-emerald-250 rounded-full">
                    LOADED SUCCESS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">
                  Available sheets: {sheetState.sheetNames.length} | Dimensions: {sheetState.data.length} rows × {sheetState.columns.length} columns.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-150 rounded-xl transition cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reload Workbook
              </button>
            </div>
          </div>

          {/* Multiple Sheets Selection bar (if available) */}
          {sheetState.sheetNames.length > 1 && (
            <div id="multiple-sheets" className="bg-white/90 p-6 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-2 mb-3">
                <Layers className="h-4.5 w-4.5 text-indigo-600" />
                <span className="text-[11px] font-mono font-bold text-slate-700 uppercase tracking-wider">Select worksheet to analyze:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {sheetState.sheetNames.map((name) => {
                  const isActive = name === sheetState.currentSheet;
                  return (
                    <button
                      key={name}
                      onClick={() => handleSheetChange(name)}
                      className={`px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider transition rounded-xl cursor-pointer ${
                        isActive
                          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-500/20'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/20'
                      }`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Core KPIs Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-150/80 shadow-3xs hover:border-slate-300 transition duration-300">
              <p className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-slate-400 mb-1">Total Rows</p>
              <p className="text-3xl font-mono font-black text-slate-800 tracking-tight">{sheetState.data.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-150/80 shadow-3xs hover:border-slate-300 transition duration-300">
              <p className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-slate-400 mb-1">Total Columns</p>
              <p className="text-3xl font-mono font-black text-slate-800 tracking-tight">{sheetState.columns.length}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-150/80 shadow-3xs hover:border-slate-300 transition duration-300">
              <p className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-slate-400 mb-1">Duplicate Rows</p>
              <p className={`text-3xl font-mono font-black tracking-tight ${sheetState.summary.duplicateRows > 0 ? 'text-rose-500' : 'text-slate-800'}`}>
                {sheetState.summary.duplicateRows}
              </p>
            </div>
            <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-100 shadow-3xs hover:border-emerald-250 transition duration-300">
              <p className="text-[10px] uppercase font-mono font-extrabold tracking-wider text-emerald-800 mb-1">Dataset Quality Score</p>
              <div className="flex items-center gap-2">
                <p className={`text-3xl font-mono font-black tracking-tight ${
                  sheetState.summary.overallColor === 'green'
                    ? 'text-emerald-700'
                    : sheetState.summary.overallColor === 'yellow'
                    ? 'text-amber-600'
                    : 'text-rose-600'
                }`}>
                  {sheetState.summary.overallQualityScore}%
                </p>
                <span className={`h-3 w-3 rounded-full border border-current inline-block animate-pulse ${
                  sheetState.summary.overallColor === 'green'
                    ? 'bg-emerald-500'
                    : sheetState.summary.overallColor === 'yellow'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}></span>
              </div>
            </div>
          </div>

          {/* Table Preview */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-150 flex justify-between items-center bg-slate-50/50 font-mono text-xs">
              <div className="flex items-center gap-2">
                <Eye className="h-4.5 w-4.5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-700 text-xs uppercase tracking-wider">DATASET MATRIX GRID PREVIEW</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-bold uppercase bg-slate-100 px-3 py-1 rounded-full">
                Rows {startIndex + 1}-{Math.min(startIndex + rowsPerPage, dataset.length)} of {dataset.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-mono uppercase tracking-wide text-[10px]">
                    <th className="py-3 px-4 text-center w-12 border-r border-slate-150 bg-slate-100 font-extrabold">#</th>
                    {sheetState.columns.map((col) => (
                      <th key={col} className="py-3 px-4 font-black border-r border-slate-150 last:border-0 min-w-[150px]">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {paginatedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition">
                      <td className="py-2.5 px-4 text-center text-[10px] text-slate-400 bg-slate-50/55 border-r border-slate-150 font-black">
                        {startIndex + idx + 1}
                      </td>
                      {sheetState.columns.map((col) => {
                        const cellVal = row[col];
                        let renderedVal = '';
                        if (cellVal instanceof Date) {
                          renderedVal = cellVal.toLocaleDateString();
                        } else if (cellVal !== null && cellVal !== undefined) {
                          renderedVal = typeof cellVal === 'object' ? JSON.stringify(cellVal) : String(cellVal);
                        }
                        
                        return (
                          <td key={col} className={`py-2.5 px-4 text-slate-700 border-r border-slate-100 last:border-0 truncate max-w-[240px] ${renderedVal === '' ? 'text-amber-650 bg-amber-500/5 italic text-[11px]' : ''}`}>
                            {renderedVal === '' ? 'Empty' : renderedVal}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between font-mono text-xs">
              <p className="font-extrabold uppercase text-slate-500">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 transition cursor-pointer rounded-lg"
                >
                  <ChevronLeft className="h-4.5 w-4.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-slate-200 bg-white hover:border-indigo-300 hover:text-indigo-600 disabled:opacity-30 transition cursor-pointer rounded-lg"
                >
                  <ChevronRight className="h-4.5 w-4.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={() => onTabChange('column-description')}
              className="px-6 py-3.5 font-mono text-xs font-black uppercase tracking-widest text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition inline-flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/20"
            >
              Analyze Column Profiles
              <ChevronRight className="h-4 w-4 text-indigo-350" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
