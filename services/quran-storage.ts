import { Platform } from 'react-native';
import { QuranSurah, ReadingProgress, Bookmark } from '@/types/quran';
import { logDebug } from './utils';

// Storage keys for both file system and web storage
const STORAGE_KEYS = {
  QURAN_DATA: 'alquran_data',
  LAST_READ: 'alquran_last_read',
  BOOKMARKS: 'alquran_bookmarks',
  SYNC_TIMESTAMP: 'alquran_sync_timestamp',
};

let FileSystem: any = null;
let isFileSystemAvailable = false;

// Try to load expo-file-system for native platforms
if (Platform.OS !== 'web') {
  try {
    FileSystem = require('expo-file-system');
    isFileSystemAvailable = true;
  } catch (e) {
    console.warn('⚠️ FileSystem not available, using fallback storage');
  }
}

// In-memory fallback storage for web and when FileSystem is unavailable
const memoryStorage: { [key: string]: string } = {};

// Add simple caching to avoid repeated file reads
let cachedBookmarks: Bookmark[] | null = null;
let cachedProgress: ReadingProgress | null | undefined;

export class QuranStorage {
  /**
   * Set item in storage (automatically chooses FileSystem for native, localStorage for web)
   */
  private static async setItem(key: string, value: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(key, value);
        } else {
          memoryStorage[key] = value;
        }
      } else if (isFileSystemAvailable && FileSystem) {
        // Use FileSystem on native
        const dir = `${FileSystem.documentDirectory}quran_data/`;
        const dirInfo = await FileSystem.getInfoAsync(dir);
        if (!dirInfo.exists) {
          await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        }
        const filePath = `${dir}${key}.json`;
        await FileSystem.writeAsStringAsync(filePath, value);
      } else {
        // Fallback to memory storage
        memoryStorage[key] = value;
      }
    } catch (error) {
      console.warn(`⚠️ Failed to write to ${key}, using memory storage:`, error);
      memoryStorage[key] = value;
    }
  }

  /**
   * Get item from storage
   */
  private static async getItem(key: string): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        // Use localStorage on web
        if (typeof localStorage !== 'undefined') {
          return localStorage.getItem(key);
        }
        return memoryStorage[key] || null;
      } else if (isFileSystemAvailable && FileSystem) {
        // Use FileSystem on native
        const dir = `${FileSystem.documentDirectory}quran_data/`;
        const filePath = `${dir}${key}.json`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists) {
          return await FileSystem.readAsStringAsync(filePath);
        }
        return null;
      } else {
        // Fallback to memory storage
        return memoryStorage[key] || null;
      }
    } catch (error) {
      console.warn(`⚠️ Failed to read from ${key}:`, error);
      return memoryStorage[key] || null;
    }
  }

  /**
   * Remove item from storage
   */
  private static async removeItem(key: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(key);
        }
        delete memoryStorage[key];
      } else if (isFileSystemAvailable && FileSystem) {
        const dir = `${FileSystem.documentDirectory}quran_data/`;
        const filePath = `${dir}${key}.json`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(filePath);
        }
      } else {
        delete memoryStorage[key];
      }
    } catch (error) {
      console.warn(`⚠️ Failed to remove ${key}:`, error);
      delete memoryStorage[key];
    }
  }

  /**
   * Save all surahs data to local storage
   */
  static async saveSurahs(surahs: QuranSurah[]): Promise<void> {
    try {
      logDebug('STORAGE', `📝 Saving ${surahs.length} surahs...`);
      await this.setItem(STORAGE_KEYS.QURAN_DATA, JSON.stringify(surahs));
      await this.setItem(STORAGE_KEYS.SYNC_TIMESTAMP, JSON.stringify(new Date().toISOString()));
    } catch (error) {
      console.error('❌ Error saving Quran data to storage:', error);
      throw error;
    }
  }

  /**
   * Get all surahs from local storage
   */
  static async getSurahs(): Promise<QuranSurah[]> {
    try {
      logDebug('STORAGE', '📖 Retrieving surahs...');
      const data = await this.getItem(STORAGE_KEYS.QURAN_DATA);
      return data ? (JSON.parse(data) as QuranSurah[]) : [];
    } catch (error) {
      console.error('❌ Error retrieving Quran data from storage:', error);
      return [];
    }
  }

  /**
   * Get a specific surah by number
   */
  static async getSurah(surahNumber: number): Promise<QuranSurah | null> {
    try {
      const surahs = await this.getSurahs();
      return surahs.find(s => s.number === surahNumber) || null;
    } catch (error) {
      console.error(`❌ Error retrieving Surah ${surahNumber}:`, error);
      return null;
    }
  }

  /**
   * Save reading progress
   */
  static async saveReadingProgress(
    surahNumber: number,
    verseNumber: number,
    readType?: 'surah' | 'juz',
    juzNumber?: number,
    scrollPosition?: number
  ): Promise<void> {
    try {
      const progress: ReadingProgress = {
        surahNumber,
        verseNumber,
        timestamp: new Date(),
        readType: readType || 'surah',
        juzNumber: juzNumber,
        scrollPosition: scrollPosition,
      };
      
      await this.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(progress));
      cachedProgress = progress; // Update cache
      logDebug('STORAGE', `📍 Progress saved: ${surahNumber}:${verseNumber}`);
    } catch (error) {
      console.error('❌ Error saving reading progress:', error);
      throw error;
    }
  }

  /**
   * Get last reading progress - with caching
   */
  static async getReadingProgress(): Promise<ReadingProgress | null> {
    try {
      // Return cached value if available
      if (cachedProgress !== undefined) {
        return cachedProgress;
      }

      const data = await this.getItem(STORAGE_KEYS.LAST_READ);
      cachedProgress = data ? (JSON.parse(data) as ReadingProgress) : null;
      logDebug('STORAGE', `📖 Progress loaded`);
      return cachedProgress;
    } catch (error) {
      console.error('❌ Error retrieving reading progress:', error);
      cachedProgress = null;
      return null;
    }
  }

  /**
   * Set all bookmarks (for cleanup/deduplication)
   */
  static async setBookmarks(bookmarks: Bookmark[]): Promise<void> {
    try {
      await this.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
      cachedBookmarks = bookmarks; // Update cache
      logDebug('STORAGE', `📌 Bookmarks updated: ${bookmarks.length} items`);
    } catch (error) {
      console.error('❌ Error updating bookmarks:', error);
      throw error;
    }
  }

  /**
   * Get bookmark for a specific surah/verse - optimized with caching
   */
  private static async getBookmarkForVerse(surahNumber: number, verseNumber: number): Promise<Bookmark | null> {
    const bookmarks = await this.getBookmarks();
    return bookmarks.find(b => b.surahNumber === surahNumber && b.verseNumber === verseNumber) || null;
  }

  /**
   * Add a bookmark (prevent duplicates)
   */
  static async addBookmark(
    surahNumber: number,
    verseNumber: number,
    text: string,
    note?: string
  ): Promise<Bookmark | null> {
    try {
      const existing = await this.getBookmarkForVerse(surahNumber, verseNumber);
      if (existing) {
        logDebug('STORAGE', `⚠️ Bookmark already exists: ${surahNumber}:${verseNumber}`);
        return null;
      }

      const bookmark: Bookmark = {
        id: `${surahNumber}-${verseNumber}-${Date.now()}`,
        surahNumber,
        verseNumber,
        text,
        timestamp: new Date(),
        note,
      };

      const bookmarks = await this.getBookmarks();
      bookmarks.push(bookmark);
      await this.setBookmarks(bookmarks);
      logDebug('STORAGE', `✅ Bookmark added: ${surahNumber}:${verseNumber}`);
      return bookmark;
    } catch (error) {
      console.error('❌ Error adding bookmark:', error);
      throw error;
    }
  }

  /**
   * Toggle bookmark (add if not exists, remove if exists)
   */
  static async toggleBookmark(
    surahNumber: number,
    verseNumber: number,
    text: string,
    note?: string
  ): Promise<{ isBookmarked: boolean; bookmark: Bookmark | null }> {
    try {
      const existing = await this.getBookmarkForVerse(surahNumber, verseNumber);

      if (existing) {
        await this.deleteBookmark(existing.id);
        logDebug('STORAGE', `🗑️ Bookmark removed: ${surahNumber}:${verseNumber}`);
        return { isBookmarked: false, bookmark: null };
      } else {
        const bookmark: Bookmark = {
          id: `${surahNumber}-${verseNumber}-${Date.now()}`,
          surahNumber,
          verseNumber,
          text,
          timestamp: new Date(),
          note,
        };

        const bookmarks = await this.getBookmarks();
        bookmarks.push(bookmark);
        await this.setBookmarks(bookmarks);
        logDebug('STORAGE', `✅ Bookmark added: ${surahNumber}:${verseNumber}`);
        return { isBookmarked: true, bookmark };
      }
    } catch (error) {
      console.error('❌ Error toggling bookmark:', error);
      throw error;
    }
  }

  /**
   * Get all bookmarks - with caching
   */
  static async getBookmarks(): Promise<Bookmark[]> {
    try {
      // Return cached bookmarks if available
      if (cachedBookmarks !== null) {
        return cachedBookmarks;
      }

      const data = await this.getItem(STORAGE_KEYS.BOOKMARKS);
      cachedBookmarks = data ? (JSON.parse(data) as Bookmark[]) : [];
      return cachedBookmarks;
    } catch (error) {
      console.error('❌ Error retrieving bookmarks:', error);
      return [];
    }
  }

  /**
   * Get bookmarks for a specific surah
   */
  static async getSurahBookmarks(surahNumber: number): Promise<Bookmark[]> {
    try {
      const bookmarks = await this.getBookmarks();
      return bookmarks.filter(b => b.surahNumber === surahNumber);
    } catch (error) {
      console.error(`❌ Error retrieving bookmarks for Surah ${surahNumber}:`, error);
      return [];
    }
  }

  /**
   * Delete a bookmark
   */
  static async deleteBookmark(bookmarkId: string): Promise<void> {
    try {
      const bookmarks = await this.getBookmarks();
      const filtered = bookmarks.filter(b => b.id !== bookmarkId);
      await this.setBookmarks(filtered);
      logDebug('STORAGE', `🗑️ Bookmark deleted: ${bookmarkId}`);
    } catch (error) {
      console.error('❌ Error deleting bookmark:', error);
      throw error;
    }
  }

  /**
   * Get last sync time
   */
  static async getLastSyncTime(): Promise<Date | null> {
    try {
      const data = await this.getItem(STORAGE_KEYS.SYNC_TIMESTAMP);
      return data ? new Date(JSON.parse(data)) : null;
    } catch (error) {
      console.error('❌ Error retrieving sync timestamp:', error);
      return null;
    }
  }

  /**
   * Clear all data and cache
   */
  static async clearAllData(): Promise<void> {
    try {
      logDebug('STORAGE', '🗑️ Clearing all data...');
      const keys = Object.values(STORAGE_KEYS);
      for (const key of keys) {
        await this.removeItem(key);
      }
      // Clear caches
      cachedBookmarks = null;
      cachedProgress = undefined;
      logDebug('STORAGE', '✅ All data cleared');
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      throw error;
    }
  }
}
