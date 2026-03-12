import { QuranSurah, QuranVerse } from '@/types/quran';

/**
 * Offline Quran Data Service
 * 
 * Service ini mengelola data Quran dari file JSON lokal
 * Menggunakan import statik untuk Expo React Native
 */

// Import offline data - Juz 1-30
const JUZ_1_DATA = require('@/assets/data/quran-juz-1.json');
const JUZ_2_DATA = require('@/assets/data/quran-juz-2.json');
const JUZ_3_DATA = require('@/assets/data/quran-juz-3.json');
const JUZ_4_DATA = require('@/assets/data/quran-juz-4.json');
const JUZ_5_DATA = require('@/assets/data/quran-juz-5.json');
const JUZ_6_DATA = require('@/assets/data/quran-juz-6.json');
const JUZ_7_DATA = require('@/assets/data/quran-juz-7.json');
const JUZ_8_DATA = require('@/assets/data/quran-juz-8.json');
const JUZ_9_DATA = require('@/assets/data/quran-juz-9.json');
const JUZ_10_DATA = require('@/assets/data/quran-juz-10.json');
const JUZ_11_DATA = require('@/assets/data/quran-juz-11.json');
const JUZ_12_DATA = require('@/assets/data/quran-juz-12.json');
const JUZ_13_DATA = require('@/assets/data/quran-juz-13.json');
const JUZ_14_DATA = require('@/assets/data/quran-juz-14.json');
const JUZ_15_DATA = require('@/assets/data/quran-juz-15.json');
const JUZ_16_DATA = require('@/assets/data/quran-juz-16.json');
const JUZ_17_DATA = require('@/assets/data/quran-juz-17.json');
const JUZ_18_DATA = require('@/assets/data/quran-juz-18.json');
const JUZ_19_DATA = require('@/assets/data/quran-juz-19.json');
const JUZ_20_DATA = require('@/assets/data/quran-juz-20.json');
const JUZ_21_DATA = require('@/assets/data/quran-juz-21.json');
const JUZ_22_DATA = require('@/assets/data/quran-juz-22.json');
const JUZ_23_DATA = require('@/assets/data/quran-juz-23.json');
const JUZ_24_DATA = require('@/assets/data/quran-juz-24.json');
const JUZ_25_DATA = require('@/assets/data/quran-juz-25.json');
const JUZ_26_DATA = require('@/assets/data/quran-juz-26.json');
const JUZ_27_DATA = require('@/assets/data/quran-juz-27.json');
const JUZ_28_DATA = require('@/assets/data/quran-juz-28.json');
const JUZ_29_DATA = require('@/assets/data/quran-juz-29.json');
const JUZ_30_DATA = require('@/assets/data/quran-juz-30.json');

interface OfflineQuranData {
  juzNumber: number;
  surahRange: [number, number];
  totalSurahs: number;
  scrapedAt: string;
  surahs: Array<{
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: string;
    verses: Array<{
      number: number;
      text: string;
      transliteration: string;
      indonesianTranslation: string;
      juz?: number;
      page?: number;
      ruku?: number;
    }>;
  }>;
}

/**
 * Mapping untuk semua data Juz yang tersedia (Juz 1-30)
 */
const OFFLINE_DATA_MAP: { [key: number]: OfflineQuranData } = {
  1: JUZ_1_DATA,
  2: JUZ_2_DATA,
  3: JUZ_3_DATA,
  4: JUZ_4_DATA,
  5: JUZ_5_DATA,
  6: JUZ_6_DATA,
  7: JUZ_7_DATA,
  8: JUZ_8_DATA,
  9: JUZ_9_DATA,
  10: JUZ_10_DATA,
  11: JUZ_11_DATA,
  12: JUZ_12_DATA,
  13: JUZ_13_DATA,
  14: JUZ_14_DATA,
  15: JUZ_15_DATA,
  16: JUZ_16_DATA,
  17: JUZ_17_DATA,
  18: JUZ_18_DATA,
  19: JUZ_19_DATA,
  20: JUZ_20_DATA,
  21: JUZ_21_DATA,
  22: JUZ_22_DATA,
  23: JUZ_23_DATA,
  24: JUZ_24_DATA,
  25: JUZ_25_DATA,
  26: JUZ_26_DATA,
  27: JUZ_27_DATA,
  28: JUZ_28_DATA,
  29: JUZ_29_DATA,
  30: JUZ_30_DATA,
};

export class QuranOfflineService {
  /**
   * Fetch surah dari data offline
   */
  static getSurah(surahNumber: number): QuranSurah | null {
    try {
      // Cari surah di semua data yang tersedia
      for (const [juzNumStr, juzData] of Object.entries(OFFLINE_DATA_MAP)) {
        const surahData = juzData.surahs.find(s => s.number === surahNumber);
        
        if (surahData) {
          const juzNumber = parseInt(juzNumStr);
          return this.transformToQuranSurah(surahData, juzNumber);
        }
      }
      
      console.warn(`⚠️ Surah ${surahNumber} not found in offline data`);
      return null;
    } catch (error) {
      console.error('❌ Error getting surah from offline data:', error);
      return null;
    }
  }

  /**
   * Fetch semua surah dari data offline (deduplicated dan sorted 1-114)
   */
  static getAllSurahs(): QuranSurah[] {
    try {
      const surahMap = new Map<number, QuranSurah>();
      
      // Load surahs from all juz files and deduplicate by surah number
      for (const [juzNumStr, juzData] of Object.entries(OFFLINE_DATA_MAP)) {
        const juzNumber = parseInt(juzNumStr);
        for (const surahData of juzData.surahs) {
          const surahNum = surahData.number;
          // Only add if not already in map (prevents duplicates from multiple juz)
          if (!surahMap.has(surahNum)) {
            surahMap.set(surahNum, this.transformToQuranSurah(surahData, juzNumber));
          }
        }
      }
      
      // Convert to array and sort by surah number (1-114)
      const allSurahs = Array.from(surahMap.values()).sort((a, b) => a.number - b.number);
      
      console.log(`✅ Loaded ${allSurahs.length} surahs (deduplicated) from offline data`);
      return allSurahs;
    } catch (error) {
      console.error('❌ Error getting all surahs from offline data:', error);
      return [];
    }
  }

  /**
   * Fetch surah dalam Juz tertentu
   */
  static getSurahInJuz(juzNumber: number): QuranSurah[] {
    try {
      const juzData = OFFLINE_DATA_MAP[juzNumber];
      
      if (!juzData) {
        console.warn(`⚠️ Juz ${juzNumber} not available in offline data`);
        return [];
      }
      
      return juzData.surahs.map(s => this.transformToQuranSurah(s, juzNumber));
    } catch (error) {
      console.error(`❌ Error getting surahs from Juz ${juzNumber}:`, error);
      return [];
    }
  }

  /**
   * Get Juz yang tersedia
   */
  static getAvailableJuz(): number[] {
    return Object.keys(OFFLINE_DATA_MAP).map(Number).sort((a, b) => a - b);
  }

  /**
   * Check apakah data offline tersedia
   */
  static isOfflineAvailable(): boolean {
    return Object.keys(OFFLINE_DATA_MAP).length > 0;
  }

  /**
   * Get metadata tentang offline data
   */
  static getOfflineMetadata() {
    const result = {
      available: true,
      totalJuz: Object.keys(OFFLINE_DATA_MAP).length,
      totalSurahs: 0,
      juzRanges: {} as { [key: number]: [number, number] },
      lastUpdated: null as string | null,
    };

    for (const [juzNum, juzData] of Object.entries(OFFLINE_DATA_MAP)) {
      const num = parseInt(juzNum);
      result.totalSurahs += juzData.surahs.length;
      result.juzRanges[num] = juzData.surahRange;
      
      if (!result.lastUpdated || juzData.scrapedAt > result.lastUpdated) {
        result.lastUpdated = juzData.scrapedAt;
      }
    }

    return result;
  }

  /**
   * Transform data dari format offline ke format QuranSurah
   */
  private static transformToQuranSurah(surahData: any, juzNumber: number): QuranSurah {
    const verses: QuranVerse[] = surahData.verses.map((verse: any) => ({
      number: verse.number,
      text: verse.text,
      numberInSurah: verse.number,
      juz: verse.juz || juzNumber, // Use provided juzNumber if verse.juz is missing
      manzil: 1,
      page: verse.page || 1,
      ruku: verse.ruku || 1,
      hizbQuarter: 1,
      sajdah: null,
      transliteration: verse.transliteration,
      indonesianTranslation: verse.indonesianTranslation,
      englishTranslation: undefined,
    }));

    return {
      number: surahData.number,
      name: surahData.name,
      englishName: surahData.englishName,
      englishNameTranslation: surahData.englishNameTranslation,
      numberOfAyahs: surahData.numberOfAyahs,
      revelationType: surahData.revelationType,
      verses,
      bookmarked: false,
    };
  }
}
