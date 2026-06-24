/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ColumnProfile,
  ColumnQuality,
  ColumnStats,
  ColumnType,
  DatasetSummary,
  AutoInsight,
  DataRecommendation,
  FrequencyItem,
  StatisticsMetrics
} from '../types';

// Detect the practical data type of a column based on its values.
export function inferColumnType(values: any[], columnName: string): ColumnType {
  const nonNulls = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNulls.length === 0) return 'text';

  const cleanName = columnName.toLowerCase().trim();

  // If column name indicates an ID or Key (e.g. ID, uuid, code, number where it's unique keys)
  const isIdName = cleanName === 'id' || cleanName.endsWith('_id') || cleanName.endsWith('id') || cleanName === 'uuid' || cleanName === 'uid' || cleanName.endsWith('key') || cleanName.endsWith('code');
  
  // Check if boolean (true/false, yes/no, or only 0/1)
  const uniqueVals = Array.from(new Set(nonNulls));
  const uniqueValsLower = uniqueVals.map(v => String(v).toLowerCase().trim());
  const isBooleanLike = uniqueValsLower.every(v => ['true', 'false', 'yes', 'no', '1', '0', 'y', 'n', 'active', 'inactive'].includes(v)) && uniqueValsLower.length <= 3;
  
  if (isBooleanLike) {
    return 'boolean';
  }

  // Count how many values can be parsed as dates
  let dateParseableCount = 0;
  let numberParseableCount = 0;

  for (const val of nonNulls) {
    if (val instanceof Date) {
      dateParseableCount++;
      continue;
    }
    // Check if numeric serial number or date string
    const strVal = String(val).trim();
    
    // Check if it's a date standard format: YYYY-MM-DD, MM/DD/YYYY, DD-MM-YYYY, etc.
    const dateRegex = /^\d{1,4}[-/.]\d{1,2}[-/.]\d{1,4}(\s+\d{1,2}:\d{2}(:\d{2})?)?$/;
    const isIsoDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(strVal);
    
    if (dateRegex.test(strVal) || isIsoDate || (!isNaN(Date.parse(strVal)) && isNaN(Number(strVal)) && strVal.length > 5)) {
      dateParseableCount++;
    }

    if (!isNaN(Number(strVal)) && strVal !== '') {
      numberParseableCount++;
    }
  }

  const threshold = 0.75; // 75% of non-null values
  
  if (dateParseableCount / nonNulls.length >= threshold) {
    return 'date';
  }

  if (numberParseableCount / nonNulls.length >= threshold) {
    // If column name suggests ID even though it's numeric, count as ID (like customer_id)
    if (isIdName && uniqueVals.length / nonNulls.length > 0.5) {
      return 'id';
    }
    return 'numerical';
  }

  // If high cardinality and looks like ID
  if (isIdName || (uniqueVals.length / nonNulls.length > 0.95 && uniqueVals.length > 15)) {
    // Determine between id or text
    const maxLen = Math.max(...nonNulls.map(v => String(v).length));
    if (maxLen < 20) {
      return 'id';
    }
    return 'text';
  }

  // If average string length is high, it's text.
  const averageLen = nonNulls.reduce((sum, v) => sum + String(v).length, 0) / nonNulls.length;
  if (averageLen > 40 && uniqueVals.length / nonNulls.length > 0.8) {
    return 'text';
  }

  // Otherwise, it represents categorical categories
  return 'categorical';
}

// Generate an automatic human-like description of the column meaning and business use
export function getInferredMeaningAndUse(columnName: string, type: ColumnType): { meaning: string; businessUse: string } {
  const col = columnName.toLowerCase().trim();

  // Basic lookups based on column name matched with semantic patterns
  if (col.includes('sales') || col.includes('revenue') || col.includes('profit') || col.includes('income') || col.includes('amount') || col.includes('price')) {
    return {
      meaning: 'Financial metric capturing transactional income, Pricing details, or revenue scale.',
      businessUse: 'Perform gross revenue modeling, margin optimization, and identify pricing vulnerabilities or high-value trends.'
    };
  }
  if (col.includes('cost') || col.includes('expense') || col.includes('spend') || col.includes('fee')) {
    return {
      meaning: 'Operational expense tracking associated with production, logistics, or custom fees.',
      businessUse: 'Conduct overhead audits, unit cost reduction analysis, and budget forecasting optimizations.'
    };
  }
  if (col.includes('quantity') || col.includes('qty') || col.includes('count') || col.includes('units') || col.includes('volume')) {
    return {
      meaning: 'Quantitative count representing product volumes, transaction weights, or units sold.',
      businessUse: 'Optimize inventory control limits, evaluate sales team velocity, and detect supply chain bottlenecks.'
    };
  }
  if (col.includes('date') || col.includes('time') || col.includes('created') || col.includes('timestamp') || col.includes('updated')) {
    return {
      meaning: 'Temporal record capturing precise event logging, checkout dates, or activity timeframes.',
      businessUse: 'Conduct seasonal cohort models, discover peak operational hours, and plot year-over-year growth charts.'
    };
  }
  if (col.includes('customer') || col.includes('client') || col.includes('user') || col.includes('buyer') || col.includes('subscriber')) {
    return {
      meaning: 'Identifiable attributes corresponding to target segment buyers, subscriber profiles, or users.',
      businessUse: 'Analyze customer lifetime value (LTV), segment active cohorts, and design personalized retention campaigns.'
    };
  }
  if (col.includes('product') || col.includes('item') || col.includes('sku') || col.includes('category') || col.includes('brand')) {
    return {
      meaning: 'Product portfolio tracking, categorization groups, or stock keeping unit descriptors.',
      businessUse: 'Benchmark product performance, evaluate catalog profitability, and run cross-selling promotions.'
    };
  }
  if (col.includes('status') || col.includes('state') || col.includes('stage') || col.includes('phase')) {
    return {
      meaning: 'Process workflow flag capturing active, pending, or finished transactional states.',
      businessUse: 'Evaluate funnel conversion drop-offs, bottleneck durations, and operational velocity diagnostics.'
    };
  }
  if (col.includes('country') || col.includes('city') || col.includes('state') || col.includes('region') || col.includes('location') || col.includes('address')) {
    return {
      meaning: 'Geographic markers indicating client locations, supply hubs, or operational regions.',
      businessUse: 'Conduct regional market penetration maps, regional pricing strategies, and local logistics planning.'
    };
  }
  if (col.includes('id') || col.includes('key') || col.includes('code') || col.includes('index')) {
    return {
      meaning: 'Unique relational identifier or database key mapping back to master tables.',
      businessUse: 'Perform granular row audit checks, track distinct relationships, and join auxiliary datasets.'
    };
  }

  // Fallbacks based on technical data type
  switch (type) {
    case 'numerical':
      return {
        meaning: 'Continuous numerical value tracking metric benchmarks or system volumes.',
        businessUse: 'Track frequency distributions, calculate average baselines, and detect anomalous performance peaks.'
      };
    case 'categorical':
      return {
        meaning: 'Categorical grouping factor classifying records into distinct business bins.',
        businessUse: 'Drill down core operational KPIs across groups and evaluate segment proportion distributions.'
      };
    case 'date':
      return {
        meaning: 'Chronological timeline field aligning transactional milestones.',
        businessUse: 'Perform timeline tracking, seasonality analysis, and lead time calculation.'
      };
    case 'boolean':
      return {
        meaning: 'Binary condition indicator tracking toggles or logical outcomes.',
        businessUse: 'Evaluate partition ratio analysis (e.g. Success vs Failure rate checks).'
      };
    case 'id':
      return {
        meaning: 'Entity identifier for unique items, users, or records.',
        businessUse: 'Uniquely select individual cases and audit database referential integrity.'
      };
    case 'text':
    default:
      return {
        meaning: 'Free-form textual annotations or descriptive comments.',
        businessUse: 'Perform textual pattern matching, keyword searches, or categorizations.'
      };
  }
}

// Compute Statistics for a column
export function calculateColumnStats(values: any[], type: ColumnType, columnName: string): StatisticsMetrics {
  const nonNulls = values.filter(v => v !== null && v !== undefined && v !== '');
  const metrics: StatisticsMetrics = {};

  if (nonNulls.length === 0) return metrics;

  // Text Stats
  if (type === 'text') {
    const lengths = nonNulls.map(v => String(v).length);
    const sumLen = lengths.reduce((s, l) => s + l, 0);
    metrics.avgLength = Number((sumLen / nonNulls.length).toFixed(1));
    metrics.minLength = Math.min(...lengths);
    metrics.maxLength = Math.max(...lengths);
    metrics.emptyCount = values.length - nonNulls.length;
    return metrics;
  }

  // Numerical Stats
  if (type === 'numerical') {
    const nums: number[] = nonNulls
      .map(v => Number(v))
      .filter(v => !isNaN(v))
      .sort((a, b) => a - b);

    if (nums.length === 0) return metrics;

    const count = nums.length;
    const sum = nums.reduce((acc, val) => acc + val, 0);
    const mean = sum / count;

    // Median & Quartiles
    const getPercentile = (sorted: number[], p: number): number => {
      const pos = p * (sorted.length - 1);
      const base = Math.floor(pos);
      const rest = pos - base;
      if (sorted[base + 1] !== undefined) {
        return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
      } else {
        return sorted[base];
      }
    };

    const q1 = getPercentile(nums, 0.25);
    const q2 = getPercentile(nums, 0.50); // Median
    const q3 = getPercentile(nums, 0.75);
    const iqr = q3 - q1;

    // Variance & Standard Deviation
    const sqDiffSum = nums.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0);
    const variance = sqDiffSum / (count - 1 || 1);
    const stdDev = Math.sqrt(variance);

    // Skewness
    const skewness = count > 2
      ? (nums.reduce((acc, val) => acc + Math.pow(val - mean, 3), 0) / count) / Math.pow(stdDev, 3)
      : 0;

    // Kurtosis
    const kurtosis = count > 3
      ? (nums.reduce((acc, val) => acc + Math.pow(val - mean, 4), 0) / count) / Math.pow(stdDev, 4) - 3
      : 0;

    // Mode
    const freqs: Record<number, number> = {};
    let maxFreq = 0;
    let mode: any = nums[0];
    for (const n of nums) {
      freqs[n] = (freqs[n] || 0) + 1;
      if (freqs[n] > maxFreq) {
        maxFreq = freqs[n];
        mode = n;
      }
    }

    // Outliers boundaries
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outliersList = nums.filter(n => n < lowerBound || n > upperBound);

    metrics.count = count;
    metrics.mean = Number(mean.toFixed(2));
    metrics.median = Number(q2.toFixed(2));
    metrics.mode = mode;
    metrics.min = nums[0];
    metrics.max = nums[nums.length - 1];
    metrics.range = nums[nums.length - 1] - nums[0];
    metrics.stdDev = Number(stdDev.toFixed(2));
    metrics.variance = Number(variance.toFixed(2));
    metrics.q1 = Number(q1.toFixed(2));
    metrics.q2 = Number(q2.toFixed(2));
    metrics.q3 = Number(q3.toFixed(2));
    metrics.iqr = Number(iqr.toFixed(2));
    metrics.skewness = Number(skewness.toFixed(3));
    metrics.kurtosis = Number(kurtosis.toFixed(3));
    metrics.outliers = outliersList;

    return metrics;
  }

  // Categorical or ID / Boolean Stats
  if (type === 'categorical' || type === 'boolean' || type === 'id') {
    const counts: Record<string, number> = {};
    for (const val of nonNulls) {
      const key = String(val).trim();
      counts[key] = (counts[key] || 0) + 1;
    }

    const frequencyTable: FrequencyItem[] = Object.entries(counts)
      .map(([value, count]) => ({
        value,
        count,
        percentage: Number(((count / nonNulls.length) * 100).toFixed(1))
      }))
      .sort((a, b) => b.count - a.count);

    metrics.uniqueCategories = frequencyTable.length;
    metrics.topCategory = frequencyTable[0]?.value || '';
    metrics.frequencyTable = frequencyTable;
    metrics.count = values.length;

    return metrics;
  }

  // Date Stats
  if (type === 'date') {
    const dates: Date[] = nonNulls
      .map(v => {
        if (v instanceof Date) return v;
        const d = new Date(String(v));
        return isNaN(d.getTime()) ? null : d;
      })
      .filter((d): d is Date => d !== null)
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) {
      metrics.invalidDatesCount = nonNulls.length;
      return metrics;
    }

    const minDateObj = dates[0];
    const maxDateObj = dates[dates.length - 1];
    const diffMs = maxDateObj.getTime() - minDateObj.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    // Analyze distribution by year and month
    const perMonth: Record<string, number> = {};
    const perYear: Record<string, number> = {};

    for (const d of dates) {
      const yr = String(d.getFullYear());
      const mo = `${yr}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      perYear[yr] = (perYear[yr] || 0) + 1;
      perMonth[mo] = (perMonth[mo] || 0) + 1;
    }

    metrics.count = values.length;
    metrics.earliestDate = minDateObj.toLocaleDateString();
    metrics.latestDate = maxDateObj.toLocaleDateString();
    metrics.dateRangeDays = diffDays;
    metrics.recordsPerMonth = perMonth;
    metrics.recordsPerYear = perYear;
    metrics.invalidDatesCount = nonNulls.length - dates.length;

    return metrics;
  }

  return metrics;
}

// Compute quality parameters for each column
export function calculateColumnQuality(
  columnName: string,
  type: ColumnType,
  values: any[],
  stats: StatisticsMetrics
): ColumnQuality {
  const totalRows = values.length;
  
  // 1. Missing Count & Percentage
  const missingCount = values.filter(v => v === null || v === undefined || String(v).trim() === '').length;
  const missingPercentage = totalRows > 0 ? Number(((missingCount / totalRows) * 100).toFixed(1)) : 0;

  // 2. Duplicate rows is dynamic on file, duplicate column value counts
  const nonNullValues = values.filter(v => v !== null && v !== undefined && String(v).trim() !== '');
  const uniqueCount = new Set(nonNullValues).size;
  const duplicateValuesCount = nonNullValues.length - uniqueCount;

  // 3. Negative checks for certain numeric variables
  let negativeCount = 0;
  let outlierCount = 0;
  if (type === 'numerical' && stats.outliers) {
    outlierCount = stats.outliers.length;
    negativeCount = values.filter(v => typeof v === 'number' && v < 0).length;
  }

  // 4. Case Inconsistencies for text / categorical
  let caseInconsistencies = false;
  let emptyStringCount = 0;
  if (type === 'categorical' || type === 'text') {
    const strings = nonNullValues.map(v => String(v).trim());
    emptyStringCount = values.filter(v => v !== null && v !== undefined && String(v).trim() === '').length;
    
    const lowercaseSet = new Set(strings.map(s => s.toLowerCase()));
    if (lowercaseSet.size < strings.length && lowercaseSet.size > 1) {
      // There are duplicates. Let's see if distinct casings represent the same words.
      // E.g. "Completed", "completed", "COMPLETED"
      const originalDistinct = new Set(strings);
      if (originalDistinct.size > lowercaseSet.size) {
        caseInconsistencies = true;
      }
    }
  }

  // 5. Invalid values depending on types
  let invalidCount = 0;
  if (type === 'date' && stats.invalidDatesCount) {
    invalidCount = stats.invalidDatesCount;
  }

  // 6. Assemble Issues list
  const issues: string[] = [];
  if (missingPercentage > 30) {
    issues.push(`Over ${missingPercentage}% missing cells (${missingCount} rows are empty).`);
  } else if (missingCount > 0) {
    issues.push(`${missingCount} values are missing (${missingPercentage}%).`);
  }

  if (outlierCount > 0) {
    issues.push(`Contains ${outlierCount} statistically anomalous outliers.`);
  }

  if (caseInconsistencies) {
    issues.push('Inconsistent letter capitalization detected (e.g. standard vs uppercase mix).');
  }

  if (invalidCount > 0) {
    issues.push(`${invalidCount} invalid, blank, or parse-error dates found.`);
  }

  const colNameLower = columnName.toLowerCase();
  if (negativeCount > 0 && (colNameLower.includes('sales') || colNameLower.includes('revenue') || colNameLower.includes('price') || colNameLower.includes('quantity') || colNameLower.includes('age'))) {
    issues.push(`Contains ${negativeCount} negative values which might represent illogical inputs.`);
  }

  // 7. Calculate quality score (starts at 100, drops on issues)
  let qualityScore = 100;
  qualityScore -= (missingPercentage * 1.5); // missing values severe penalty
  qualityScore -= (outlierCount / totalRows * 20); // outliers
  if (caseInconsistencies) qualityScore -= 5;
  if (invalidCount > 0) qualityScore -= (invalidCount / totalRows * 30);
  if (negativeCount > 0 && (colNameLower.includes('sales') || colNameLower.includes('price'))) qualityScore -= 10;

  qualityScore = Math.max(0, Math.min(100, Math.round(qualityScore)));

  // Color flags
  let color: 'green' | 'yellow' | 'red' = 'green';
  if (qualityScore < 60 || missingPercentage > 40) {
    color = 'red';
  } else if (qualityScore < 85 || missingPercentage > 10 || outlierCount > 0 || caseInconsistencies) {
    color = 'yellow';
  }

  return {
    name: columnName,
    totalRows,
    missingCount,
    missingPercentage,
    duplicateCount: duplicateValuesCount,
    uniqueCount,
    invalidCount,
    outlierCount,
    negativeCount,
    emptyStringCount,
    caseInconsistencies,
    qualityScore,
    color,
    issues
  };
}

// Compute the overall summary parameters of a dataset sheet
export function analyzeDataset(rows: any[], columns: string[]): {
  profiles: ColumnProfile[];
  qualities: ColumnQuality[];
  stats: ColumnStats[];
  summary: DatasetSummary;
} {
  const rowCount = rows.length;
  const colCount = columns.length;

  // Calculate profiles and stats first
  const profiles: ColumnProfile[] = [];
  const stats: ColumnStats[] = [];
  const qualities: ColumnQuality[] = [];

  let totalCellCount = rowCount * colCount;
  let totalMissingCells = 0;

  for (const col of columns) {
    const colValues = rows.map(r => r[col]);
    const type = inferColumnType(colValues, col);

    // Profile
    const nonNulls = colValues.filter(v => v !== null && v !== undefined && v !== '');
    const uniqueValSet = new Set(nonNulls);
    
    // Most frequent value
    let mostFrequent: any = null;
    let maxFreq = 0;
    const counts: Record<string, number> = {};
    for (const v of nonNulls) {
      const key = String(v);
      counts[key] = (counts[key] || 0) + 1;
      if (counts[key] > maxFreq) {
        maxFreq = counts[key];
        mostFrequent = v;
      }
    }

    const { meaning, businessUse } = getInferredMeaningAndUse(col, type);

    const profile: ColumnProfile = {
      name: col,
      type,
      inferredMeaning: meaning,
      suggestedBusinessUse: businessUse,
      sampleValues: nonNulls.slice(0, 5),
      uniqueCount: uniqueValSet.size,
      mostFrequentValue: mostFrequent,
      mostFrequentFreq: maxFreq
    };
    profiles.push(profile);

    // Stats
    const colStats = calculateColumnStats(colValues, type, col);
    stats.push({
      name: col,
      type,
      metrics: colStats
    });

    // Quality
    const quality = calculateColumnQuality(col, type, colValues, colStats);
    qualities.push(quality);

    totalMissingCells += quality.missingCount;
  }

  // Calculate duplicate rows (stringified comparison)
  let duplicateRows = 0;
  const stringifiedRows = new Set<string>();
  for (const r of rows) {
    const str = JSON.stringify(r);
    if (stringifiedRows.has(str)) {
      duplicateRows++;
    } else {
      stringifiedRows.add(str);
    }
  }

  // Overall Quality Score
  const averageColQuality = qualities.reduce((sum, q) => sum + q.qualityScore, 0) / (colCount || 1);
  const dupPenalty = rowCount > 0 ? (duplicateRows / rowCount) * 100 * 0.5 : 0;
  let overallQualityScore = Math.max(0, Math.min(100, Math.round(averageColQuality - dupPenalty)));

  let overallColor: 'green' | 'yellow' | 'red' = 'green';
  if (overallQualityScore < 60) {
    overallColor = 'red';
  } else if (overallQualityScore < 85) {
    overallColor = 'yellow';
  }

  const missingCellPercentage = totalCellCount > 0 ? Number(((totalMissingCells / totalCellCount) * 100).toFixed(1)) : 0;

  const summary: DatasetSummary = {
    rowCount,
    colCount,
    duplicateRows,
    overallQualityScore,
    overallColor,
    missingCellCount: totalMissingCells,
    totalCellCount,
    missingCellPercentage
  };

  return {
    profiles,
    qualities,
    stats,
    summary
  };
}

// Generate automatic business insights written in clean wording dynamically
export function generateAutoInsights(
  rows: any[],
  columns: string[],
  profiles: ColumnProfile[],
  qualities: ColumnQuality[],
  stats: ColumnStats[],
  summary: DatasetSummary
): AutoInsight[] {
  const insights: AutoInsight[] = [];

  // Insight 1: General quality score
  if (summary.overallQualityScore >= 90) {
    insights.push({
      id: 'ins_quality_high',
      title: 'Exceptional Dataset Health',
      message: `The uploaded dataset exhibits stellar quality metrics with an overall Score of **${summary.overallQualityScore}%**. Cell completeness is incredibly high (only ${summary.missingCellPercentage}% empty), meaning statistical modeling and visualizations will represent true real-world patterns.`,
      type: 'success'
    });
  } else if (summary.overallQualityScore < 65) {
    insights.push({
      id: 'ins_quality_low',
      title: 'Action Advised: High Error Rates',
      message: `Critical dataset gaps found with a Quality Rating of only **${summary.overallQualityScore}%**. High rates of empty fields and row duplicates could bias statistical results. Refer to the 'Cleaning Tools' tab or standardize structures before basing business decisions on this data.`,
      type: 'danger'
    });
  } else {
    insights.push({
      id: 'ins_quality_med',
      title: 'Moderate Quality: Review Recommended',
      message: `Overall dataset health score sits at a constructive **${summary.overallQualityScore}%**. Some anomalies, empty cells, or typographic casing discrepancies exist. The data is generally usable but standard cleaning is highly recommended.`,
      type: 'warning'
    });
  }

  // Insight 2: Row duplicates
  if (summary.duplicateRows > 0) {
    const dupsPct = ((summary.duplicateRows / summary.rowCount) * 100).toFixed(1);
    insights.push({
      id: 'ins_duplicates',
      title: 'Redundant Row Duplications',
      message: `We detected **${summary.duplicateRows}** duplicate rows (representing **${dupsPct}%** of the entire spreadsheet). Redundant records inflate row weights and artificially bolster transactional volumes. We recommend executing a 'Remove Duplicates' cleaning step.`,
      type: 'warning'
    });
  }

  // Insight 3: High missing rates on specific columns
  const highlyMissingCols = qualities.filter(q => q.missingPercentage > 15);
  for (const q of highlyMissingCols) {
    insights.push({
      id: `ins_missing_${q.name}`,
      title: `Sparse Completeness in "${q.name}"`,
      message: `Column **${q.name}** contains **${q.missingCount}** empty values (**${q.missingPercentage}%** missing rate). This level of missingness restricts categorical profiling or limits aggregated sums. It can be treated by imputation with statistical median or setting as 'Unknown'.`,
      type: 'warning',
      column: q.name
    });
  }

  // Insight 4: Core statistical findings (Top Categories, Dominant segments)
  const catStats = stats.filter(s => s.type === 'categorical' || s.type === 'boolean');
  for (const s of catStats) {
    const frequencies = s.metrics.frequencyTable;
    if (frequencies && frequencies.length > 0) {
      const topCat = frequencies[0];
      if (topCat.percentage > 40 && topCat.value !== '' && topCat.value !== 'null' && topCat.value !== 'undefined') {
        const readablePercentage = topCat.percentage.toFixed(0);
        insights.push({
          id: `ins_dominant_${s.name}`,
          title: `Dominant Concentration in "${s.name}"`,
          message: `Category value **"${topCat.value}"** is highly dominant, accounting for **${readablePercentage}%** (${topCat.count} records) of the entire column **${s.name}**. This suggests strong concentration and could point to a primary buyer segment, active product skew, or regional hub.`,
          type: 'info',
          column: s.name
        });
      }
    }
  }

  // Insight 5: Extreme numerical outliers
  const numStats = stats.filter(s => s.type === 'numerical');
  for (const s of numStats) {
    const outliers = s.metrics.outliers;
    if (outliers && outliers.length > 0) {
      const outliersPct = ((outliers.length / (s.metrics.count || 1)) * 100).toFixed(1);
      insights.push({
        id: `ins_outliers_${s.name}`,
        title: `Extreme Anomalies in "${s.name}"`,
        message: `Column **${s.name}** host **${outliers.length}** mathematical outliers (**${outliersPct}%** of values match this profile). Max value is **${s.metrics.max}** compared to a median of **${s.metrics.median}**. Check these records for manual billing errors or genuine luxury transactions.`,
        type: 'warning',
        column: s.name
      });
    }
  }

  // Insight 6: Correlations if more than 2 numerical fields exist
  if (numStats.length >= 2) {
    // Generate correlation estimations
    const colsToCompare = numStats.slice(0, 4); // compare up to first 4 numericals
    for (let i = 0; i < colsToCompare.length; i++) {
      for (let j = i + 1; j < colsToCompare.length; j++) {
        const colA = colsToCompare[i];
        const colB = colsToCompare[j];
        
        // Pearson correlation estimate
        const r = calculateCorrelation(rows, colA.name, colB.name);
        if (Math.abs(r) > 0.5) {
          const strength = Math.abs(r) > 0.8 ? 'exceptionally strong' : 'moderate to strong';
          const direction = r > 0 ? 'positive (direct)' : 'negative (inverse)';
          insights.push({
            id: `ins_corr_${colA.name}_${colB.name}`,
            title: `Correlated Trend: ${colA.name} vs ${colB.name}`,
            message: `There is a **${strength} ${direction} correlation (${r.toFixed(2)})** between **${colA.name}** and **${colB.name}**. As one moves, the other tracks in tandem, indicating potential operational codependency or billing scaling.`,
            type: 'success',
            column: `${colA.name} & ${colB.name}`
          });
        }
      }
    }
  }

  // Insight 7: Time-series range
  const dateCol = stats.find(s => s.type === 'date');
  if (dateCol && dateCol.metrics.earliestDate && dateCol.metrics.latestDate) {
    insights.push({
      id: 'ins_timeline',
      title: 'Dataset Chronology Span',
      message: `The records span a timeline representing **${dateCol.metrics.dateRangeDays} days** starting from **${dateCol.metrics.earliestDate}** through **${dateCol.metrics.latestDate}**. This range provides a reliable historical runway to perform seasonal trend exploration.`,
      type: 'info',
      column: dateCol.name
    });
  }

  return insights;
}

// Quick Pearson correlation coefficient computation
export function calculateCorrelation(rows: any[], colA: string, colB: string): number {
  const valsA: number[] = [];
  const valsB: number[] = [];

  for (const r of rows) {
    const valA = Number(r[colA]);
    const valB = Number(r[colB]);
    if (!isNaN(valA) && !isNaN(valB) && valA !== null && valB !== null) {
      valsA.push(valA);
      valsB.push(valB);
    }
  }

  if (valsA.length < 5) return 0;

  const n = valsA.length;
  const sumA = valsA.reduce((sum, v) => sum + v, 0);
  const sumB = valsB.reduce((sum, v) => sum + v, 0);
  const sumAB = valsA.reduce((sum, v, i) => sum + v * valsB[i], 0);
  const sumA2 = valsA.reduce((sum, v) => sum + v * v, 0);
  const sumB2 = valsB.reduce((sum, v) => sum + v * v, 0);

  const num = n * sumAB - sumA * sumB;
  const den = Math.sqrt((n * sumA2 - sumA * sumA) * (n * sumB2 - sumB * sumB));

  return den === 0 ? 0 : num / den;
}

// Generate Actionable Data Recommendations
export function generateRecommendations(
  columns: string[],
  profiles: ColumnProfile[],
  qualities: ColumnQuality[],
  stats: ColumnStats[],
  summary: DatasetSummary
): DataRecommendation[] {
  const recommendations: DataRecommendation[] = [];

  // Recommendation 1: Overall quality handling
  if (summary.overallQualityScore < 85) {
    recommendations.push({
      id: 'rec_clean_sheet',
      category: 'cleaning',
      priority: 'high',
      title: 'Execute Structural Cleansing Flow',
      problem: `The overall quality score is ${summary.overallQualityScore}%, hindered by missing values or duplicate records.`,
      actionableStep: 'Click the "Cleaning Tools" tab and run "Remove Duplicates" and "Standardize Names" to establish a clean foundation.',
      benefit: 'Prevents calculation errors in aggregate dashboards and removes artificial volumetric scaling numbers.'
    });
  }

  // Recommendation 2: Filling empty numerical variables
  const numericalColsWithGaps = qualities.filter(q => q.missingPercentage > 0 && typeOfCol(profiles, q.name) === 'numerical');
  if (numericalColsWithGaps.length > 0) {
    const list = numericalColsWithGaps.map(q => `"${q.name}"`).join(', ');
    recommendations.push({
      id: 'rec_impute_nums',
      category: 'cleaning',
      priority: 'medium',
      title: 'Impute Missing Numbers via Statistical Median',
      problem: `Numerical columns like ${list} contain missing entries that skew sum total and average formulas.`,
      actionableStep: 'Go to "Cleaning Tools" and select "Impute Missing Numbers with Median" to fill gaps without introducing outlier distortions.',
      benefit: 'Enables smooth continuous dashboard statistics without failing or omitting rows from aggregations.'
    });
  }

  // Recommendation 3: Standardizing casing on categorical variables
  const casingIssuesCols = qualities.filter(q => q.caseInconsistencies);
  if (casingIssuesCols.length > 0) {
    const list = casingIssuesCols.map(q => `"${q.name}"`).join(', ');
    recommendations.push({
      id: 'rec_text_casing',
      category: 'cleaning',
      priority: 'medium',
      title: 'Standardize Casing in Categorical Fields',
      problem: `Varying word capitalizing on columns like ${list} causes identical categories (like "Active" and "active") to be counted separately in charts.`,
      actionableStep: 'Enable "Standardize Column Values Casing" under Cleaning Tools to enforce Title Case capitalization.',
      benefit: 'Merges fragmented chart bars, reflecting genuine segment percentages and true categorization counts.'
    });
  }

  // Recommendation 4: Suggested Analytical Question
  const numColNames = profiles.filter(p => p.type === 'numerical').map(p => p.name);
  const catColNames = profiles.filter(p => p.type === 'categorical').map(p => p.name);

  if (catColNames.length > 0 && numColNames.length > 0) {
    recommendations.push({
      id: 'rec_grouped_anal',
      category: 'analysis',
      priority: 'medium',
      title: `Analyze Segment Performance of "${numColNames[0]}"`,
      problem: `The file has structured category columns like "${catColNames[0]}" and transaction metric sizes in "${numColNames[0]}".`,
      actionableStep: 'Select the grouped views in the Dashboard to compare mean volumes across segments.',
      benefit: 'Pinpoints under-performing categories and unlocks high-yield strategic planning areas.'
    });
  }

  // Recommendation 5: Business Questions answered
  let sampleQuestion = 'Which segments represent the highest concentration of records?';
  if (catColNames.length > 0 && numColNames.length > 0) {
    sampleQuestion = `Which "${catColNames[0]}" yields the highest cumulative scale of "${numColNames[0]}"?`;
  }
  recommendations.push({
    id: 'rec_business_questions',
    category: 'business',
    priority: 'high',
    title: 'Focus on High-Impact Business Questions',
    problem: 'Without structured strategic questions, team analysts can lose focus inside raw dashboards.',
    actionableStep: `Answer: (1) "${sampleQuestion}", (2) "How do outliers in numerical columns correspond to billing records?"`,
    benefit: 'Directs computational work towards highly profitable business pivots and inventory standardizations.'
  });

  // Recommendation 6: Column removal if mostly empty
  const mostlyEmptyCols = qualities.filter(q => q.missingPercentage > 75);
  if (mostlyEmptyCols.length > 0) {
    const list = mostlyEmptyCols.map(q => `"${q.name}"`).join(', ');
    recommendations.push({
      id: 'rec_remove_empty_cols',
      category: 'cleaning',
      priority: 'high',
      title: 'Discard Sparsely Populated Columns',
      problem: `Columns like ${list} are more than 75% empty, providing zero statistical variance or business benefit.`,
      actionableStep: 'Use the cleaning tool option "Remove Sparsely Populated Columns" to prune columns with >75% empty cells.',
      benefit: 'Reduces database memory footprints, standardizes reports, and eliminates analytical distractions.'
    });
  }

  // Fallback default recommendations
  if (recommendations.length < 3) {
    recommendations.push({
      id: 'rec_basic_strategy',
      category: 'strategy',
      priority: 'low',
      title: 'Integrate Regular Excel Form Hygiene',
      problem: 'Data quality naturally degrades as manual spreadsheet inputs occur inside distributed team branches.',
      actionableStep: 'Design standard validation fields or lock drop-down menus inside shared corporate template sheets.',
      benefit: 'Saves hours of downstream cleaning and ensures continuous data compatibility for dashboards.'
    });
  }

  return recommendations;
}

function typeOfCol(profiles: ColumnProfile[], name: string): ColumnType {
  const f = profiles.find(p => p.name === name);
  return f ? f.type : 'text';
}
