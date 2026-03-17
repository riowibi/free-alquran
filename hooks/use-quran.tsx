import { createContext, useCallback, useContext, useState, useMemo } from 'react';
import { QuranSurah, Bookmark, ReadingProgress } from '@/types/quran';
import { QuranAPI } from '@/services/quran-api';
import { QuranStorage } from '@/services/quran-storage';
import { deduplicateBookmarks, logDebug, measurePerformance } from '@/services/utils';

const MODULE_NAME = 'QuranContext';

interface QuranContextType {
  surahs: QuranSurah[];
  bookmarks: Bookmark[];
  lastReadProgress: ReadingProgress | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  initializeQuran: () => Promise<void>;
  updateReadingProgress: (surahNumber: number, verseNumber: number, readType?: 'surah' | 'juz', juzNumber?: number, scrollPosition?: number) => Promise<void>;
  addBookmark: (surahNumber: number, verseNumber: number, text: string, note?: string) => Promise<void>;
  removeBookmark: (bookmarkId: string) => Promise<void>;
  toggleBookmark: (surahNumber: number, verseNumber: number, text: string, note?: string) => Promise<boolean>;
  getSurah: (surahNumber: number) => QuranSurah | undefined;
  isVerseBookmarked: (surahNumber: number, verseNumber: number) => boolean;
}

const QuranContext = createContext<QuranContextType | undefined>(undefined);

export function QuranProvider({ children }: { children: React.ReactNode }) {
  const [surahs, setSurahs] = useState<QuranSurah[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [lastReadProgress, setLastReadProgress] = useState<ReadingProgress | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize Quran data - optimized with less verbose logging
   */
  const initializeQuran = useCallback(async () => {
    try {
      logDebug(MODULE_NAME, '📱 Initializing Quran data...');
      setIsLoading(true);
      setError(null);

      // Try to get data from local storage first
      const savedSurahs = await measurePerformance(MODULE_NAME, 'Load from storage', () =>
        QuranStorage.getSurahs()
      );
      
      if (savedSurahs.length > 0) {
        logDebug(MODULE_NAME, `✅ Found ${savedSurahs.length} surahs in local storage`);
        setSurahs(savedSurahs);
        setIsInitialized(true);
      } else {
        // Fetch from API and save to storage
        logDebug(MODULE_NAME, '🌐 Local storage empty, fetching from API...');
        const fetchedSurahs = await measurePerformance(MODULE_NAME, 'Fetch from API', () =>
          QuranAPI.fetchAllSurahs()
        );
        
        if (fetchedSurahs.length > 0) {
          logDebug(MODULE_NAME, `✅ API fetch successful: ${fetchedSurahs.length} surahs`);
          await QuranStorage.saveSurahs(fetchedSurahs);
          setSurahs(fetchedSurahs);
          setIsInitialized(true);
        } else {
          const errorMsg = 'Unable to load Quran data. Please check your internet connection.';
          console.error(`❌ [${MODULE_NAME}] ${errorMsg}`);
          setError(errorMsg);
        }
      }

      // Load reading progress and bookmarks
      const progress = await QuranStorage.getReadingProgress();
      let savedBookmarks = await QuranStorage.getBookmarks();
      
      // Deduplicate bookmarks efficiently
      const { unique: uniqueBookmarks, duplicates } = deduplicateBookmarks(savedBookmarks);
      
      if (duplicates.length > 0) {
        console.warn(`🧹 [${MODULE_NAME}] Found ${duplicates.length} duplicate bookmarks, removing...`);
        await QuranStorage.setBookmarks(uniqueBookmarks);
        savedBookmarks = uniqueBookmarks;
      }
      
      setLastReadProgress(progress);
      setBookmarks(savedBookmarks);
      logDebug(MODULE_NAME, `📊 Loaded: ${savedBookmarks.length} bookmarks`);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMsg);
      console.error(`❌ [${MODULE_NAME}] Error initializing Quran:`, err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update reading progress - optimized
   */
  const updateReadingProgress = useCallback(async (surahNumber: number, verseNumber: number, readType?: 'surah' | 'juz', juzNumber?: number, scrollPosition?: number) => {
    try {
      logDebug(MODULE_NAME, `📍 Updating progress: ${surahNumber}:${verseNumber}`);
      
      await QuranStorage.saveReadingProgress(surahNumber, verseNumber, readType, juzNumber, scrollPosition);
      
      setLastReadProgress({
        surahNumber,
        verseNumber,
        timestamp: new Date(),
        readType: readType || 'surah',
        juzNumber: juzNumber,
        scrollPosition: scrollPosition,
      });
    } catch (err) {
      console.error(`❌ [${MODULE_NAME}] Error updating reading progress:`, err);
    }
  }, []);

  /**
   * Add bookmark
   */
  const addBookmark = useCallback(async (surahNumber: number, verseNumber: number, text: string, note?: string) => {
    try {
      logDebug(MODULE_NAME, `🔖 Adding bookmark: ${surahNumber}:${verseNumber}`);
      const bookmark = await QuranStorage.addBookmark(surahNumber, verseNumber, text, note);
      if (bookmark) {
        setBookmarks(prev => [...prev, bookmark]);
      }
    } catch (err) {
      console.error(`❌ [${MODULE_NAME}] Error adding bookmark:`, err);
    }
  }, []);

  /**
   * Toggle bookmark (add if not exists, remove if exists)
   */
  const toggleBookmark = useCallback(async (surahNumber: number, verseNumber: number, text: string, note?: string) => {
    try {
      logDebug(MODULE_NAME, `🔀 Toggling bookmark: ${surahNumber}:${verseNumber}`);
      const { isBookmarked, bookmark } = await QuranStorage.toggleBookmark(surahNumber, verseNumber, text, note);
      
      if (isBookmarked && bookmark) {
        setBookmarks(prev => [...prev, bookmark]);
      } else {
        setBookmarks(prev => prev.filter(b => b.surahNumber !== surahNumber || b.verseNumber !== verseNumber));
      }
      
      return isBookmarked;
    } catch (err) {
      console.error(`❌ [${MODULE_NAME}] Error toggling bookmark:`, err);
      return false;
    }
  }, []);

  /**
   * Remove bookmark
   */
  const removeBookmark = useCallback(async (bookmarkId: string) => {
    try {
      logDebug(MODULE_NAME, `🗑️ Removing bookmark: ${bookmarkId}`);
      await QuranStorage.deleteBookmark(bookmarkId);
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
    } catch (err) {
      console.error(`❌ [${MODULE_NAME}] Error removing bookmark:`, err);
    }
  }, []);

  /**
   * Get surah by number - memoized for performance
   */
  const getSurah = useCallback((surahNumber: number) => {
    return surahs.find(s => s.number === surahNumber);
  }, [surahs]);

  /**
   * Check if a verse is bookmarked - memoized lookup
   */
  const isVerseBookmarked = useCallback((surahNumber: number, verseNumber: number) => {
    return bookmarks.some(b => b.surahNumber === surahNumber && b.verseNumber === verseNumber);
  }, [bookmarks]);

  const value: QuranContextType = {
    surahs,
    bookmarks,
    lastReadProgress,
    isLoading,
    isInitialized,
    error,
    initializeQuran,
    updateReadingProgress,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    getSurah,
    isVerseBookmarked,
  };

  return (
    <QuranContext.Provider value={value}>
      {children}
    </QuranContext.Provider>
  );
}

/**
 * Hook to use the Quran context
 */
export function useQuran() {
  const context = useContext(QuranContext);
  if (!context) {
    throw new Error('useQuran must be used within a QuranProvider');
  }
  return context;
}
