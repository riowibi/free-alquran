import { createContext, useCallback, useContext, useState } from 'react';
import { QuranSurah, Bookmark, ReadingProgress } from '@/types/quran';
import { QuranAPI } from '@/services/quran-api';
import { QuranStorage } from '@/services/quran-storage';

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
   * Initialize Quran data
   */
  const initializeQuran = useCallback(async () => {
    try {
      console.log('📱 Initializing Quran data...');
      setIsLoading(true);
      setError(null);

      // Try to get data from local storage first
      console.log('💾 Checking local storage...');
      const savedSurahs = await QuranStorage.getSurahs();
      
      if (savedSurahs.length > 0) {
        // Data already synced
        console.log(`✅ Found ${savedSurahs.length} surahs in local storage`);
        setSurahs(savedSurahs);
        setIsInitialized(true);
      } else {
        // Fetch from API and save to storage
        console.log('🌐 Local storage empty, fetching from API...');
        const fetchedSurahs = await QuranAPI.fetchAllSurahs();
        
        if (fetchedSurahs.length > 0) {
          console.log(`✅ API fetch successful: ${fetchedSurahs.length} surahs`);
          console.log('💾 Saving to local storage...');
          await QuranStorage.saveSurahs(fetchedSurahs);
          setSurahs(fetchedSurahs);
          setIsInitialized(true);
          console.log('✅ Data saved to local storage');
        } else {
          const errorMsg = 'Unable to load Quran data. Please check your internet connection.';
          console.error('❌ ' + errorMsg);
          setError(errorMsg);
        }
      }

      // Load reading progress and bookmarks
      const progress = await QuranStorage.getReadingProgress();
      let savedBookmarks = await QuranStorage.getBookmarks();
      
      // Deduplicate bookmarks (keep only the first one for each surah/verse combination)
      const uniqueBookmarks = new Map<string, Bookmark>();
      const duplicatesFound: string[] = [];
      
      savedBookmarks.forEach(bookmark => {
        const key = `${bookmark.surahNumber}-${bookmark.verseNumber}`;
        if (!uniqueBookmarks.has(key)) {
          uniqueBookmarks.set(key, bookmark);
        } else {
          duplicatesFound.push(bookmark.id);
        }
      });

      // If duplicates were found, save the cleaned list
      if (duplicatesFound.length > 0) {
        console.warn(`🧹 Found ${duplicatesFound.length} duplicate bookmarks, removing...`);
        const cleanedBookmarks = Array.from(uniqueBookmarks.values());
        await QuranStorage.setBookmarks(cleanedBookmarks);
        savedBookmarks = cleanedBookmarks;
        console.log(`✅ Bookmarks cleaned - ${cleanedBookmarks.length} unique bookmarks remain`);
      }
      
      setLastReadProgress(progress);
      setBookmarks(savedBookmarks);
      console.log(`📊 Loaded: ${savedBookmarks.length} bookmarks, last read progress: ${progress ? 'Yes' : 'No'}`);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMsg);
      console.error('❌ Error initializing Quran:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update reading progress
   */
  const updateReadingProgress = useCallback(async (surahNumber: number, verseNumber: number, readType?: 'surah' | 'juz', juzNumber?: number, scrollPosition?: number) => {
    try {
      console.log('[QURAN_CONTEXT] Updating reading progress - Surah:', surahNumber, 'Verse:', verseNumber, 'ReadType:', readType, 'Juz:', juzNumber, 'ScrollPos:', scrollPosition);
      // Save to storage with all parameters
      await QuranStorage.saveReadingProgress(surahNumber, verseNumber, readType, juzNumber, scrollPosition);
      
      // Update context state
      setLastReadProgress({
        surahNumber,
        verseNumber,
        timestamp: new Date(),
        readType: readType || 'surah',
        juzNumber: juzNumber,
        scrollPosition: scrollPosition,
      });
      console.log('[QURAN_CONTEXT] Reading progress updated successfully');
    } catch (err) {
      console.error('[QURAN_CONTEXT] Error updating reading progress:', err);
    }
  }, []);

  /**
   * Add bookmark
   */
  const addBookmark = useCallback(async (surahNumber: number, verseNumber: number, text: string, note?: string) => {
    try {
      console.log('[QURAN_CONTEXT] Adding bookmark - Surah:', surahNumber, 'Verse:', verseNumber, 'Has Note:', !!note);
      const bookmark = await QuranStorage.addBookmark(surahNumber, verseNumber, text, note);
      if (bookmark) {
        setBookmarks(prev => [...prev, bookmark]);
        console.log('[QURAN_CONTEXT] Bookmark added - ID:', bookmark.id);
      } else {
        console.log('[QURAN_CONTEXT] Bookmark already exists, not adding duplicate');
      }
    } catch (err) {
      console.error('[QURAN_CONTEXT] Error adding bookmark:', err);
    }
  }, []);

  /**
   * Toggle bookmark (add if not exists, remove if exists)
   */
  const toggleBookmark = useCallback(async (surahNumber: number, verseNumber: number, text: string, note?: string) => {
    try {
      console.log('[QURAN_CONTEXT] Toggling bookmark - Surah:', surahNumber, 'Verse:', verseNumber);
      const { isBookmarked, bookmark } = await QuranStorage.toggleBookmark(surahNumber, verseNumber, text, note);
      
      if (isBookmarked && bookmark) {
        // Bookmark was added
        setBookmarks(prev => [...prev, bookmark]);
        console.log('[QURAN_CONTEXT] Bookmark added - ID:', bookmark.id);
      } else {
        // Bookmark was removed
        setBookmarks(prev => prev.filter(b => b.surahNumber !== surahNumber || b.verseNumber !== verseNumber));
        console.log('[QURAN_CONTEXT] Bookmark removed');
      }
      
      return isBookmarked;
    } catch (err) {
      console.error('[QURAN_CONTEXT] Error toggling bookmark:', err);
      return false;
    }
  }, []);

  /**
   * Remove bookmark
   */
  const removeBookmark = useCallback(async (bookmarkId: string) => {
    try {
      console.log('[QURAN_CONTEXT] Removing bookmark - ID:', bookmarkId);
      await QuranStorage.deleteBookmark(bookmarkId);
      setBookmarks(prev => prev.filter(b => b.id !== bookmarkId));
      console.log('[QURAN_CONTEXT] Bookmark removed successfully');
    } catch (err) {
      console.error('[QURAN_CONTEXT] Error removing bookmark:', err);
    }
  }, []);

  /**
   * Get surah by number
   */
  const getSurah = useCallback((surahNumber: number) => {
    return surahs.find(s => s.number === surahNumber);
  }, [surahs]);

  /**
   * Check if a verse is bookmarked
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
