/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ColumnProfile, ColumnQuality } from '../types';

export interface CleaningLog {
  action: string;
  details: string;
}

export function cleanDataset(
  originalRows: any[],
  columns: string[],
  profiles: ColumnProfile[],
  qualities: ColumnQuality[],
  options: {
    removeDuplicates: boolean;
    fillMissingNumerical: 'none' | 'mean' | 'median' | 'zero';
    fillMissingCategorical: 'none' | 'mode' | 'unknown';
    standardizeText: boolean;
    trimWhitespace: boolean;
    standardizeHeaders: boolean;
    removeEmptyColumns: boolean;
  }
): { cleanedRows: any[]; newColumns: string[]; logs: CleaningLog[] } {
  let rows = originalRows.map(r => ({ ...r }));
  let currentColumns = [...columns];
  const logs: CleaningLog[] = [];

  if (rows.length === 0) {
    return { cleanedRows: rows, newColumns: currentColumns, logs };
  }

  // 1. Remove duplicate rows
  if (options.removeDuplicates) {
    const unique = new Set<string>();
    const filtered: any[] = [];
    let dupCount = 0;

    for (const r of rows) {
      // Create a value-based fingerprint
      const str = JSON.stringify(r);
      if (!unique.has(str)) {
        unique.add(str);
        filtered.push(r);
      } else {
        dupCount++;
      }
    }

    if (dupCount > 0) {
      rows = filtered;
      logs.push({
        action: 'Removed Duplicate Rows',
        details: `Purged ${dupCount} identical rows from the spreadsheet, keeping original instances.`
      });
    } else {
      logs.push({
        action: 'Check Duplicates',
        details: 'No redundant value-matching row duplicates found.'
      });
    }
  }

  // 2. Remove sparsely populated columns (> 75% missing)
  if (options.removeEmptyColumns) {
    const colsToRemove = qualities
      .filter(q => q.missingPercentage > 75)
      .map(q => q.name);

    if (colsToRemove.length > 0) {
      currentColumns = currentColumns.filter(c => !colsToRemove.includes(c));
      rows = rows.map(r => {
        const cleanedRow = { ...r };
        for (const col of colsToRemove) {
          delete cleanedRow[col];
        }
        return cleanedRow;
      });
      logs.push({
        action: 'Pruned Sparsely Populated Columns',
        details: `Deleted columns with >75% missing rates: ${colsToRemove.join(', ')}`
      });
    }
  }

  // 3. Trim whitespace & Standardize Text Casing
  if (options.trimWhitespace || options.standardizeText) {
    let trimCount = 0;
    let recasingCount = 0;

    rows = rows.map(r => {
      const updated = { ...r };
      for (const col of currentColumns) {
        const profile = profiles.find(p => p.name === col);
        const val = updated[col];
        
        if (typeof val === 'string') {
          let cleanedVal = val;
          if (options.trimWhitespace) {
            cleanedVal = cleanedVal.trim().replace(/\s+/g, ' ');
            if (cleanedVal !== val) trimCount++;
          }
          if (options.standardizeText && profile && (profile.type === 'categorical' || profile.type === 'text')) {
            // Apply Title Case: e.g. "completed" -> "Completed"
            if (cleanedVal.length > 0) {
              const oldVal = cleanedVal;
              cleanedVal = cleanedVal
                .toLowerCase()
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
              if (oldVal !== cleanedVal) recasingCount++;
            }
          }
          updated[col] = cleanedVal;
        }
      }
      return updated;
    });

    if (options.trimWhitespace && trimCount > 0) {
      logs.push({
        action: 'Trimmed Cell Text Whitespaces',
        details: `Trimmed and collapsed multi-spaces in ${trimCount} text cells.`
      });
    }
    if (options.standardizeText && recasingCount > 0) {
      logs.push({
        action: 'Standardized Casing Casing (Title Case)',
        details: `Standardized casing for ${recasingCount} categorical values to uniform Title Case.`
      });
    }
  }

  // 4. Fill missing values (imputation)
  if (options.fillMissingNumerical !== 'none') {
    let fillCount = 0;
    rows = rows.map(r => {
      const updated = { ...r };
      for (const col of currentColumns) {
        const profile = profiles.find(p => p.name === col);
        if (profile && profile.type === 'numerical' && (updated[col] === null || updated[col] === undefined || updated[col] === '')) {
          // Find standard statistics
          const nonNulls = originalRows
            .map(x => Number(x[col]))
            .filter(x => !isNaN(x) && x !== null && x !== undefined);

          let replacement = 0;
          if (options.fillMissingNumerical === 'mean' && nonNulls.length > 0) {
            replacement = nonNulls.reduce((a, b) => a + b, 0) / nonNulls.length;
          } else if (options.fillMissingNumerical === 'median' && nonNulls.length > 0) {
            const sorted = [...nonNulls].sort((a,b) => a - b);
            replacement = sorted[Math.floor(sorted.length / 2)];
          }

          updated[col] = Number(replacement.toFixed(2));
          fillCount++;
        }
      }
      return updated;
    });

    if (fillCount > 0) {
      logs.push({
        action: 'Imputed Missing Numeric Fields',
        details: `Populated ${fillCount} empty cell(s) inside numeric columns using: "${options.fillMissingNumerical.toUpperCase()}"`
      });
    }
  }

  if (options.fillMissingCategorical !== 'none') {
    let fillCount = 0;
    rows = rows.map(r => {
      const updated = { ...r };
      for (const col of currentColumns) {
        const profile = profiles.find(p => p.name === col);
        if (profile && (profile.type === 'categorical' || profile.type === 'text') && (updated[col] === null || updated[col] === undefined || String(updated[col]).trim() === '')) {
          let replacement = 'Unknown';
          if (options.fillMissingCategorical === 'mode') {
            replacement = profile.mostFrequentValue ? String(profile.mostFrequentValue) : 'Unknown';
          }
          updated[col] = replacement;
          fillCount++;
        }
      }
      return updated;
    });

    if (fillCount > 0) {
      logs.push({
        action: 'Imputed Missing Categorical Fields',
        details: `Populated ${fillCount} empty categorical cell(s) using format: "${options.fillMissingCategorical.toUpperCase() === 'MODE' ? 'MODE: ' + logs.length : 'Unknown'}"`
      });
    }
  }

  // 5. Standardize headers (camelCase or Title_Case, removing invalid characters)
  if (options.standardizeHeaders) {
    const keyMap: Record<string, string> = {};
    const standardizedColumns = currentColumns.map(col => {
      // Convert to "Capital Case" or "Snake_Case" but let's standardise to "Proper spacing Title Case" with letters and digits only
      const cleanCol = col
        .replace(/[^a-zA-Z0-9\s-_]/g, '') // remove weird symbols
        .trim();
      
      // Capitalize first letters of parts
      const formatted = cleanCol
        .split(/[\s-_]+/)
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join(' ');
      
      keyMap[col] = formatted || col;
      return formatted || col;
    });

    // Remap rows
    rows = rows.map(r => {
      const updated: any = {};
      for (const col of currentColumns) {
        const newKey = keyMap[col];
        updated[newKey] = r[col];
      }
      return updated;
    });

    currentColumns = standardizedColumns;
    logs.push({
      action: 'Standardized Column Name Formats',
      details: 'Reformated and cleaned syntax of all dataset column headers to standard spaced Proper Case.'
    });
  }

  return {
    cleanedRows: rows,
    newColumns: currentColumns,
    logs
  };
}
