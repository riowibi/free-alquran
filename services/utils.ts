/**
 * Utility Services
 * Common functions for deduplication, logging, and data processing
 */

import { Bookmark, QuranSurah } from '@/types/quran';

// Global debug flag - can be configured
export const DEBUG = {
  VERBOSE: false, // Set to true for detailed logging
  PERFORMANCE: false, // Set to true for performance metrics
};

/**
 * Debug logger - only logs when DEBUG.VERBOSE is true
 */
export const logDebug = (module: string, message: string, data?: any) => {
  if (DEBUG.VERBOSE) {
    console.log(`[${module}] ${message}`, data || '');
  }
};

/**
 * Deduplicate bookmarks based on surah/verse combination
 * Keeps the most recent bookmark if duplicates exist
 */
export const deduplicateBookmarks = (bookmarks: Bookmark[]): { unique: Bookmark[]; duplicates: string[] } => {
  const uniqueMap = new Map<string, Bookmark>();
  const duplicates: string[] = [];

  bookmarks.forEach(bookmark => {
    const key = `${bookmark.surahNumber}-${bookmark.verseNumber}`;
    const existing = uniqueMap.get(key);

    if (!existing) {
      uniqueMap.set(key, bookmark);
    } else {
      // Keep the more recent one
      if (new Date(bookmark.timestamp) > new Date(existing.timestamp)) {
        const oldId = existing.id;
        uniqueMap.set(key, bookmark);
        duplicates.push(oldId);
      } else {
        duplicates.push(bookmark.id);
      }
    }
  });

  return {
    unique: Array.from(uniqueMap.values()),
    duplicates,
  };
};

/**
 * Deduplicate surahs based on surah number
 */
export const deduplicateSurahs = (surahs: QuranSurah[]): QuranSurah[] => {
  const seenNumbers = new Set<number>();
  return surahs.filter(surah => {
    if (seenNumbers.has(surah.number)) {
      return false;
    }
    seenNumbers.add(surah.number);
    return true;
  });
};

/**
 * Format timestamp for logging
 */
export const formatTimestamp = (): string => {
  return new Date().toISOString().split('T')[1].split('.')[0];
};

/**
 * Log with performance metrics
 */
export const logPerformance = (module: string, operation: string, duration: number) => {
  if (DEBUG.PERFORMANCE) {
    const isSlowOperation = duration > 500; // Slow if > 500ms
    const marker = isSlowOperation ? '🐌' : '⚡';
    console.log(`${marker} [${module}] ${operation}: ${duration.toFixed(2)}ms`);
  }
};

/**
 * Measure function execution time
 */
export const measurePerformance = async <T>(
  module: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> => {
  const start = Date.now();
  try {
    return await fn();
  } finally {
    const duration = Date.now() - start;
    logPerformance(module, operation, duration);
  }
};

/**
 * Memoization helper for expensive calculations
 */
export const createMemoizer = <T, U>(fn: (input: T) => U) => {
  let lastInput: T | undefined;
  let lastOutput: U | undefined;

  return (input: T): U => {
    if (lastInput === undefined || !isDeeplyEqual(lastInput, input)) {
      lastInput = input;
      lastOutput = fn(input);
    }
    return lastOutput as U;
  };
};

/**
 * Deep equality check for objects (simple version)
 */
const isDeeplyEqual = (a: any, b: any): boolean => {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, idx) => isDeeplyEqual(item, b[idx]));
  }

  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;
    return keysA.every(key => isDeeplyEqual(a[key], b[key]));
  }

  return false;
};
