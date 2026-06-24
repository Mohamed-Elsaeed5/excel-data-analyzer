/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet, Database, ShieldAlert, BarChart3, Sparkles, CheckSquare,
  HelpCircle, Lightbulb, FileDown, Layers, Loader2, ArrowRight
} from 'lucide-react';
import { SheetDataState } from './types';
import UploadPreview from './components/UploadPreview';
import ColumnDescriptions from './components/ColumnDescriptions';
import DataQuality from './components/DataQuality';
import ColumnStatistics from './components/ColumnStatistics';
import DashboardInsights from './components/DashboardInsights';
import AutomaticInsights from './components/AutomaticInsights';
import Recommendations from './components/Recommendations';
import CleaningTools from './components/CleaningTools';
import ExportReport from './components/ExportReport';

type TabType =
  | 'upload-preview'
  | 'column-description'
  | 'data-quality'
  | 'statistics'
  | 'dashboard'
  | 'insights'
  | 'recommendations'
  | 'cleaning-tools'
  | 'export';

export default function App() {
  const [sheetState, setSheetState] = useState<SheetDataState | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('upload-preview');
  const [loading, setLoading] = useState<boolean>(false);

  const tabsList: { id: TabType; label: string; icon: React.ReactNode; requiresFile: boolean }[] = [
    {
      id: 'upload-preview',
      label: 'Upload & Preview',
      icon: <Database className="h-4 w-4" />,
      requiresFile: false
    },
    {
      id: 'column-description',
      label: 'Column Description',
      icon: <Layers className="h-4 w-4" />,
      requiresFile: true
    },
    {
      id: 'data-quality',
      label: 'Data Quality',
      icon: <ShieldAlert className="h-4 w-4" />,
      requiresFile: true
    },
    {
      id: 'statistics',
      label: 'Statistics',
      icon: <BarChart3 className="h-4 w-4" />,
      requiresFile: true
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Layers className="h-4 w-4" />,
      requiresFile: true
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: <Sparkles className="h-4 w-4" />,
      requiresFile: true
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      icon: <Lightbulb className="h-4 w-4" />,
      requiresFile: true
    },
    {
      id: 'cleaning-tools',
      label: 'Cleaning Tools',
      icon: <CheckSquare className="h-4 w-4" />,
      requiresFile: true
    },
    {
      id: 'export',
      label: 'Export Report',
      icon: <FileDown className="h-4 w-4" />,
      requiresFile: true
    }
  ];

  const handleTabSelect = (tabId: TabType) => {
    if (tabsList.find(t => t.id === tabId)?.requiresFile && !sheetState) {
      alert('Please upload a valid Excel file first before entering this tab.');
      return;
    }
    setActiveTab(tabId);
  };

  return (
    <div id="full-app-root" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-600 selection:text-white print:bg-white relative">
      
      {/* Decorative colorful glowing backdrops */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none print:hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-100/60 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-[40%] right-[-10%] w-[35rem] h-[35rem] bg-purple-100/50 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s' }} />
        <div className="absolute bottom-[-10%] left-[15%] w-[45rem] h-[45rem] bg-pink-50/75 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s' }} />
      </div>

      {/* Upper Navigation Row */}
      <header id="app-nav-header" className="bg-white/70 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl flex items-center justify-center border border-indigo-100/20 shadow-lg shadow-indigo-500/20">
            <FileSpreadsheet className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-xl font-sans">DataEngine</h1>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider font-semibold">Dynamic Excel Audit & Cleaning Suite</p>
          </div>
        </div>

        {/* Current status markers */}
        {sheetState && (
          <div id="active-pills" className="flex items-center gap-2 font-mono text-[11px]">
            <span className="px-3 py-1 bg-white text-indigo-700 border border-slate-200 shadow-xs rounded-full font-bold truncate max-w-[150px] uppercase text-[10px]" title={sheetState.currentSheet}>
              📊 SHEET: {sheetState.currentSheet}
            </span>
            <span className="px-3 py-1 bg-white text-purple-700 border border-slate-200 shadow-xs rounded-full font-bold uppercase text-[10px]">
              🔥 {sheetState.data.length} ROWS
            </span>
            <span className="px-3 py-1 bg-white text-pink-700 border border-slate-200 shadow-xs rounded-full font-bold uppercase text-[10px]">
              ⚡ {sheetState.columns.length} COLS
            </span>
          </div>
        )}
      </header>

      {/* Main Grid View */}
      <div className="flex-1 flex flex-col lg:flex-row print:block">
        
        {/* Left-hand Tab Rail bar */}
        <nav id="left-sidebar-navigation" className="bg-white/65 backdrop-blur-md border-b lg:border-b-0 lg:border-r border-slate-200/80 lg:w-[270px] p-5 shrink-0 flex gap-2 overflow-x-auto lg:overflow-x-visible lg:flex-col print:hidden select-none">
          <div className="hidden lg:block pb-4 mb-3 border-b border-slate-200/60">
            <span className="text-[10px] uppercase tracking-widest font-mono font-bold text-slate-400">Workspace Tasks</span>
          </div>

          {tabsList.map((tab) => {
            const isActive = tab.id === activeTab;
            const isDisabled = tab.requiresFile && !sheetState;

            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                disabled={isDisabled}
                className={`flex items-center gap-2.5 px-4 py-3 text-xs font-mono uppercase tracking-wider rounded-xl transition-all text-left whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold shadow-md shadow-indigo-500/25'
                    : isDisabled
                    ? 'text-slate-300 bg-transparent opacity-50 cursor-not-allowed'
                    : 'text-slate-600 hover:text-indigo-600 hover:bg-white shadow-3xs border border-transparent hover:border-slate-100 bg-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {isDisabled && (
                  <span className="ml-auto text-[8px] font-mono tracking-widest text-slate-400 border border-slate-200 px-1.5 py-0.5 rounded-md uppercase bg-slate-50/50">
                    Lock
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Support Badge in Sidebar */}
          <div className="hidden lg:block mt-auto p-4 bg-gradient-to-br from-indigo-50/80 to-purple-50/60 border border-indigo-100 rounded-xl text-slate-600 text-[11px] leading-relaxed font-mono">
            <p className="font-bold text-indigo-950 mb-1 flex items-center gap-1.5">
              <HelpCircle className="h-3.5 w-3.5 text-indigo-600" />
              CLIENT-ONLY SECURITY
            </p>
            <p className="font-medium opacity-85 leading-normal">Data modeling runs fully in local browser memory space. No Excel rows are transmitted to internal remote hosting environments.</p>
          </div>
        </nav>

        {/* Content Sheet Arena */}
        <main id="main-content-arena" className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full relative print:p-0 print:max-w-none print:mx-0">
          
          {/* Global Loading Spinner */}
          {loading && (
            <div id="loading-spinner" className="absolute inset-0 bg-slate-50/60 backdrop-blur-md flex flex-col items-center justify-center z-50">
              <div className="bg-white/90 p-8 rounded-2xl border border-slate-150 shadow-xl flex flex-col items-center gap-4 max-w-sm text-center">
                <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-bold font-mono uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Profiling Excel Sheets...</p>
                <p className="text-xs text-slate-500 font-sans leading-relaxed">Reading columns, evaluating mathematical distribution skewness, checking outliers and text consistency...</p>
              </div>
            </div>
          )}

          {/* Tab Route Switching router */}
          {activeTab === 'upload-preview' && (
            <UploadPreview
              sheetState={sheetState}
              setSheetState={setSheetState}
              loading={loading}
              setLoading={setLoading}
              onTabChange={(tab: string) => handleTabSelect(tab as TabType)}
            />
          )}

          {activeTab === 'column-description' && sheetState && (
            <ColumnDescriptions profiles={sheetState.columnProfiles} />
          )}

          {activeTab === 'data-quality' && sheetState && (
            <DataQuality
              qualities={sheetState.columnQualities}
              summary={sheetState.summary}
              onTabChange={(tab: string) => handleTabSelect(tab as TabType)}
            />
          )}

          {activeTab === 'statistics' && sheetState && (
            <ColumnStatistics stats={sheetState.columnStats} />
          )}

          {activeTab === 'dashboard' && sheetState && (
            <DashboardInsights sheetState={sheetState} />
          )}

          {activeTab === 'insights' && sheetState && (
            <AutomaticInsights insights={sheetState.insights} />
          )}

          {activeTab === 'recommendations' && sheetState && (
            <Recommendations recommendations={sheetState.recommendations} />
          )}

          {activeTab === 'cleaning-tools' && sheetState && (
            <CleaningTools
              sheetState={sheetState}
              setSheetState={setSheetState}
              setLoading={setLoading}
            />
          )}

          {activeTab === 'export' && sheetState && (
            <ExportReport sheetState={sheetState} />
          )}

        </main>
      </div>

      {/* Bottom Footer bar */}
      <footer id="global-application-footer" className="bg-white border-t border-slate-200 py-4 px-6 text-center text-[11px] font-medium text-slate-400 font-sans mt-auto print:hidden">
        <p>© 2026 Corporate Data Audit Hub • Designed with strict client-side data privacy • Open Source & Fully Configured</p>
      </footer>

    </div>
  );
}
