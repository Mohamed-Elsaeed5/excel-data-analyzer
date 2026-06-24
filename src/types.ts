/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ColumnType = 'numerical' | 'categorical' | 'date' | 'text' | 'id' | 'boolean';

export interface ColumnProfile {
  name: string;
  type: ColumnType;
  inferredMeaning: string;
  suggestedBusinessUse: string;
  sampleValues: any[];
  uniqueCount: number;
  mostFrequentValue: any;
  mostFrequentFreq: number;
}

export interface ColumnQuality {
  name: string;
  totalRows: number;
  missingCount: number;
  missingPercentage: number;
  duplicateCount: number;
  uniqueCount: number;
  invalidCount: number; // For conversions or parse failures
  outlierCount: number; // For numerical columns
  negativeCount: number; // Count of negative values (if relevant)
  emptyStringCount: number; // For text/categorical
  caseInconsistencies: boolean; // Text casing issues
  qualityScore: number; // 0 to 100
  color: 'green' | 'yellow' | 'red';
  issues: string[];
}

export interface FrequencyItem {
  value: string;
  count: number;
  percentage: number;
}

export interface StatisticsMetrics {
  // Numerical
  count?: number;
  mean?: number;
  median?: number;
  mode?: any;
  min?: number;
  max?: number;
  stdDev?: number;
  variance?: number;
  range?: number;
  q1?: number;
  q2?: number;
  q3?: number;
  iqr?: number;
  skewness?: number;
  kurtosis?: number;
  outliers?: number[];

  // Categorical
  uniqueCategories?: number;
  topCategory?: string;
  frequencyTable?: FrequencyItem[];

  // Date
  earliestDate?: string;
  latestDate?: string;
  dateRangeDays?: number;
  recordsPerMonth?: Record<string, number>;
  recordsPerYear?: Record<string, number>;
  invalidDatesCount?: number;

  // Text
  avgLength?: number;
  minLength?: number;
  maxLength?: number;
  emptyCount?: number;
}

export interface ColumnStats {
  name: string;
  type: ColumnType;
  metrics: StatisticsMetrics;
}

export interface DatasetSummary {
  rowCount: number;
  colCount: number;
  duplicateRows: number;
  overallQualityScore: number;
  overallColor: 'green' | 'yellow' | 'red';
  missingCellCount: number;
  totalCellCount: number;
  missingCellPercentage: number;
}

export interface AutoInsight {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'danger';
  metricImpact?: string;
  column?: string;
}

export interface DataRecommendation {
  id: string;
  category: 'cleaning' | 'analysis' | 'strategy' | 'business';
  priority: 'high' | 'medium' | 'low';
  title: string;
  problem: string;
  actionableStep: string;
  benefit: string;
}

export interface DataCleanState {
  removeDuplicates: boolean;
  fillMissingNumerical: 'none' | 'mean' | 'median' | 'zero';
  fillMissingCategorical: 'none' | 'mode' | 'unknown';
  standardizeText: boolean;
  trimWhitespace: boolean;
  standardizeHeaders: boolean;
  removeEmptyColumns: boolean;
}

export interface SheetDataState {
  sheetNames: string[];
  currentSheet: string;
  originalData: any[]; // Array of parsed object rows
  data: any[]; // Current active data (could be cleaned)
  columns: string[];
  columnProfiles: ColumnProfile[];
  columnQualities: ColumnQuality[];
  columnStats: ColumnStats[];
  summary: DatasetSummary;
  insights: AutoInsight[];
  recommendations: DataRecommendation[];
}
