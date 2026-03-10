import { Platform } from 'react-native';
import { QuranSurah, ReadingProgress, Bookmark } from '@/types/quran';

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
      console.log(`📝 Saving ${surahs.length} surahs to storage...`);
      const jsonString = JSON.stringify(surahs);
      const sizeInKB = new Blob([jsonString]).size / 1024;
      console.log(`📊 Data size: ${sizeInKB.toFixed(2)} KB`);
      
      await this.setItem(STORAGE_KEYS.QURAN_DATA, jsonString);
      await this.setItem(STORAGE_KEYS.SYNC_TIMESTAMP, JSON.stringify(new Date().toISOString()));
      
      console.log(`✅ Successfully saved ${surahs.length} surahs to storage`);
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
      console.log('📖 Retrieving surahs from storage...');
      const data = await this.getItem(STORAGE_KEYS.QURAN_DATA);
      
      if (data) {
        const surahs = JSON.parse(data) as QuranSurah[];
        console.log(`✅ Retrieved ${surahs.length} surahs from storage`);
        return surahs;
      }
      
      console.log('⚠️ No surahs found in storage');
      return [];
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
      console.error(`Error retrieving Surah ${surahNumber}:`, error);
      return null;
    }
  }

  /**
   * Save reading progress
   */
  static async saveReadingProgress(
    surahNumber: number,
    verseNumber: number
  ): Promise<void> {
    try {
      const progress: ReadingProgress = {
        surahNumber,
        verseNumber,
        timestamp: new Date(),
      };
      
      await this.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(progress));
      
      console.log(`✅ Reading progress saved: Surah ${surahNumber}, Verse ${verseNumber}`);
    } catch (error) {
      console.error('Error saving reading progress:', error);
      throw error;
    }
  }

  /**
   * Get last reading progress
   */
  static async getReadingProgress(): Promise<ReadingProgress | null> {
    try {
      const data = await this.getItem(STORAGE_KEYS.LAST_READ);
      
      if (data) {
        const progress = JSON.parse(data) as ReadingProgress;
        console.log(`✅ Reading progress loaded: Surah ${progress.surahNumber}`);
        return progress;
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving reading progress:', error);
      return null;
    }
  }

  /**
   * Add a bookmark
   */
  static async addBookmark(
    surahNumber: number,
    verseNumber: number,
    text: string,
    note?: string
  ): Promise<Bookmark> {
    try {
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
      await this.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));

      return bookmark;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  /**
   * Get all bookmarks
   */
  static async getBookmarks(): Promise<Bookmark[]> {
    try {
      const data = await this.getItem(STORAGE_KEYS.BOOKMARKS);
      
      if (data) {
        const bookmarks = JSON.parse(data) as Bookmark[];
        console.log(`✅ Retrieved ${bookmarks.length} bookmarks`);
        return bookmarks;
      }
      
      console.log('ℹ️ No bookmarks found');
      return [];
    } catch (error) {
      console.error('Error retrieving bookmarks:', error);
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
      console.error(`Error retrieving bookmarks for Surah ${surahNumber}:`, error);
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
      await this.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting bookmark:', error);
      throw error;
    }
  }

  /**
   * Check if Quran data is already synced (to avoid unnecessary downloads)
   */
  static async getLastSyncTime(): Promise<Date | null> {
    try {
      const data = await this.getItem(STORAGE_KEYS.SYNC_TIMESTAMP);
      
      if (data) {
        const timestamp = JSON.parse(data) as string;
        return new Date(timestamp);
      }
      
      return null;
    } catch (error) {
      console.error('Error retrieving sync timestamp:', error);
      return null;
    }
  }

  /**
   * Clear all data
   */
  static async clearAllData(): Promise<void> {
    try {
      console.log('🗑️ Clearing all stored data...');
      
      const keys = Object.values(STORAGE_KEYS);
      for (const key of keys) {
        await this.removeItem(key);
      }
      
      console.log('✅ All data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
}
