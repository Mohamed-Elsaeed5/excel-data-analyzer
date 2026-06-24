/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SheetDataState } from '../types';
import * as XLSX from 'xlsx';
import { Download, Printer, Award, FileSpreadsheet } from 'lucide-react';

interface ExportReportProps {
  sheetState: SheetDataState;
}

export default function ExportReport({ sheetState }: ExportReportProps) {
  const { data, originalData, columns, columnProfiles, columnQualities, summary, insights, recommendations } = sheetState;

  // Export 1: Cleaned data only
  const handleDownloadCleaned = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Cleaned_Data_Sheet");
    XLSX.writeFile(wb, `${sheetState.currentSheet}_Cleaned_Data.xlsx`);
  };

  // Export 2: Comprehensive multi-sheet report Book
  const handleDownloadReportBook = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Overview Dashboard Metrics
    const overviewData = [
      { "Dataset Audit Parameter": "Pristine Original Row Count", "Metric Output": originalData.length },
      { "Dataset Audit Parameter": "Current Active Row Count", "Metric Output": data.length },
      { "Dataset Audit Parameter": "Variables Column Count", "Metric Output": columns.length },
      { "Dataset Audit Parameter": "Identified Row Duplicates", "Metric Output": summary.duplicateRows },
      { "Dataset Audit Parameter": "Total Empty Cells Count", "Metric Output": summary.missingCellCount },
      { "Dataset Audit Parameter": "Total Cell Count Space", "Metric Output": summary.totalCellCount },
      { "Dataset Audit Parameter": "Global Gaps Density %", "Metric Output": `${summary.missingCellPercentage}%` },
      { "Dataset Audit Parameter": "Weighted Overall Quality Rating", "Metric Output": `${summary.overallQualityScore}%` },
      { "Dataset Audit Parameter": "Health Assessment Status", "Metric Output": summary.overallColor.toUpperCase() },
    ];
    const wsOverview = XLSX.utils.json_to_sheet(overviewData);
    XLSX.utils.book_append_sheet(wb, wsOverview, "Report_Overview_KPIs");

    // Sheet 2: Data Schema Dictionary
    const dictionaryData = columnProfiles.map(p => ({
      "Column Name": p.name,
      "Inferred Data Type": p.type.toUpperCase(),
      "Distinct Values Count": p.uniqueCount,
      "Most Frequent Cell": String(p.mostFrequentValue ?? ''),
      "Inferred Business Purpose": p.inferredMeaning,
      "Suggested Strategic Use": p.suggestedBusinessUse
    }));
    const wsDict = XLSX.utils.json_to_sheet(dictionaryData);
    XLSX.utils.book_append_sheet(wb, wsDict, "Variables_Dictionary");

    // Sheet 3: Quality Check Diagnostics
    const qualityData = columnQualities.map(q => ({
      "Column Target": q.name,
      "Individual Health Rating": `${q.qualityScore}%`,
      "Audit Level": q.color.toUpperCase(),
      "Missing Gaps Count": q.missingCount,
      "Missing Gaps Percentage": `${q.missingPercentage}%`,
      "Extreme Outliers Count": q.outlierCount,
      "Empty Character Counts": q.emptyStringCount,
      "Divergent Spacing Checks": q.caseInconsistencies ? 'FAIL' : 'PASS',
      "Identified Anomalies List": q.issues.join(' | ') || 'Passed audits cleanly'
    }));
    const wsQuality = XLSX.utils.json_to_sheet(qualityData);
    XLSX.utils.book_append_sheet(wb, wsQuality, "Hygiene_Inspection_Details");

    // Sheet 4: Compiled Recommendations list
    const recsData = recommendations.map((r, i) => ({
      "Sequence": i + 1,
      "Action Priority": r.priority.toUpperCase(),
      "Operation Category": r.category.toUpperCase(),
      "Step Title": r.title,
      "Target Operational Issue": r.problem,
      "Recommended Action Step": r.actionableStep,
      "Expected Strategic Benefit": r.benefit
    }));
    const wsRecs = XLSX.utils.json_to_sheet(recsData);
    XLSX.utils.book_append_sheet(wb, wsRecs, "Actionable_Recommendations");

    // Sheet 5: The Cleaned Data Array
    const wsCleaned = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, wsCleaned, "Cleaned_Dataset");

    XLSX.writeFile(wb, `${sheetState.currentSheet}_Comprehensive_Audit_Report.xlsx`);
  };

  // Export 3: Print browser view as PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div id="export-tab-container" className="space-y-6 animate-fade-in">
      {/* Overview banners */}
      <div id="export-header" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-3xs space-y-1.5">
        <h2 className="text-2xl font-black text-slate-850 uppercase tracking-tight font-sans">Export Reports and Datasets</h2>
        <p className="text-xs text-slate-500 font-mono font-medium leading-relaxed">
          ✨ DELIVERABLES: Download optimized database spreadsheets, compile comprehensive audit workbooks, or trigger local PDF print briefs.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Excel Audit Book */}
        <div className="bg-white/95 rounded-2xl border border-slate-200 p-6 shadow-3xs hover:shadow-xs transition duration-300 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-11 w-11 bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/15 flex items-center justify-center">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div className="space-y-1 font-sans">
              <h3 className="font-extrabold text-slate-800 text-[14px] uppercase tracking-wide">Multi-Sheet Audit Handbook</h3>
              <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                COMPILES FULLY SEPARATED WORKBOOK TABS: Overview KPIs, Data Dictionaries, Quality logs, recommendations lists, and cleaned row arrays.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadReportBook}
            className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-indigo-500/10 border border-indigo-500"
          >
            <Download className="h-4 w-4" />
            DOWNLOAD FULL EXP. BOOK
          </button>
        </div>

        {/* Card 2: Cleaned Dataset Spreadsheet */}
        <div className="bg-white/95 rounded-2xl border border-slate-200 p-6 shadow-3xs hover:shadow-xs transition duration-300 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-11 w-11 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-xl shadow-md shadow-emerald-500/15 flex items-center justify-center">
              <Award className="h-5 w-5" />
            </div>
            <div className="space-y-1 font-sans">
              <h3 className="font-extrabold text-slate-800 text-[14px] uppercase tracking-wide">Cleaned Worksheet Excel</h3>
              <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                CONTAINS RAW RE-STRUCTURED ROWS: Standardized formats, filled null voids, trimmed space buffers, and purged duplicate coordinate items.
              </p>
            </div>
          </div>
          <button
            onClick={handleDownloadCleaned}
            className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black uppercase tracking-wider rounded-xl transition duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 hover:shadow-lg hover:shadow-emerald-500/10 border border-emerald-500"
          >
            <Download className="h-4 w-4" />
            DOWNLOAD CLEAN ROWS
          </button>
        </div>

        {/* Card 3: Printable Executive Summary (PDF) */}
        <div className="bg-white/95 rounded-2xl border border-slate-200 p-6 shadow-3xs hover:shadow-xs transition duration-300 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="h-11 w-11 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center border border-slate-200/80">
              <Printer className="h-5 w-5" />
            </div>
            <div className="space-y-1 font-sans">
              <h3 className="font-extrabold text-slate-800 text-[14px] uppercase tracking-wide">Executive Summary Brief</h3>
              <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                STANDARDIZED PRINT DIALOGUE FORM: Fires full system print setup. Save instantly to a vector, high-density PDF file representing insights.
              </p>
            </div>
          </div>
          <button
            onClick={handlePrintPDF}
            className="w-full mt-6 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-250 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition duration-200 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5 hover:shadow-sm"
          >
            <Printer className="h-4 w-4" />
            PRINT REPORT / SAVE PDF
          </button>
        </div>
      </div>

      {/* Embedded Printable-only layout with print classes */}
      <div id="printable-report" className="hidden print:block bg-white p-8 space-y-8 text-black w-full min-h-screen font-serif">
        <div className="border-b-2 border-black pb-4 text-center space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-widest">EXECUTIVE SURVEY ANALYSIS DICTIONARY</h1>
          <p className="text-xs">DYNAMIC CORP DATA ENGINE • SYSTEM DIAGNOSTIC WORKBOOK CLIENT RUNTIME</p>
          <p className="text-xs font-bold">TARGET PROFILE ID: {sheetState.currentSheet.toUpperCase()}</p>
        </div>

        {/* Overview Row */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1">1. Operational Parameters Scale</h2>
          <table className="w-full font-mono text-xs border border-black border-collapse">
            <tbody>
              <tr className="border-b border-black divide-x divide-black">
                <td className="p-2 font-bold bg-neutral-100">Original Row Vector Count</td>
                <td className="p-2 text-right">{originalData.length}</td>
                <td className="p-2 font-bold bg-neutral-100">Cleaned Row Vector Count</td>
                <td className="p-2 text-right">{data.length}</td>
              </tr>
              <tr className="border-b border-black divide-x divide-black">
                <td className="p-2 font-bold bg-neutral-100">Identified Row Duplicates</td>
                <td className="p-2 text-right">{summary.duplicateRows}</td>
                <td className="p-2 font-bold bg-neutral-100">Weighted Quality Index</td>
                <td className="p-2 text-right font-bold">{summary.overallQualityScore}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Insights Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1">2. Logical Analytical Findings</h2>
          <div className="space-y-3 font-mono text-xs">
            {insights.slice(0, 5).map((ins, i) => (
              <div key={i} className="space-y-0.5 border border-black p-2 bg-neutral-50">
                <p className="font-extrabold">[{i+1}] {ins.title.toUpperCase()} {ins.column && `(${ins.column.toUpperCase()})`}</p>
                <p className="text-neutral-800 pr-2 pl-4 lowercase">{ins.message.replace(/\*\*/g, '').toLowerCase()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase border-b border-black pb-1">3. Executative Recommendations</h2>
          <div className="space-y-4 text-xs font-mono">
            {recommendations.slice(0, 4).map((rec, i) => (
              <div key={i} className="p-3 border-l-4 border-black space-y-1 bg-neutral-50/50">
                <p className="font-bold">{i + 1}. {rec.title.toUpperCase()} [{rec.priority.toUpperCase()} PRIORITY]</p>
                <p className="text-neutral-700"><span className="font-bold">IMPERATIVE:</span> {rec.actionableStep}</p>
                <p className="text-neutral-500 italic"><span className="font-bold">RETURN:</span> {rec.benefit}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-20 text-center text-[10px] font-mono uppercase tracking-widest text-neutral-400">
          SURVEY HUB SECURE COMPILE RUNTIME CLIENT DIALOGUE ENDS.
        </div>
      </div>
    </div>
  );
}
