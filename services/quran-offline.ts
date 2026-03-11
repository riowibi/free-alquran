import { QuranSurah, QuranVerse } from '@/types/quran';

/**
 * Offline Quran Data Service
 * 
 * Service ini mengelola data Quran dari file JSON lokal
 * Menggunakan import statik untuk Expo React Native
 */

// Import offline data
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
 * Mapping untuk semua data Juz yang tersedia
 */
const OFFLINE_DATA_MAP: { [key: number]: OfflineQuranData } = {
  30: JUZ_30_DATA,
};

export class QuranOfflineService {
  /**
   * Fetch surah dari data offline
   */
  static getSurah(surahNumber: number): QuranSurah | null {
    try {
      // Cari surah di semua data yang tersedia
      for (const juzData of Object.values(OFFLINE_DATA_MAP)) {
        const surahData = juzData.surahs.find(s => s.number === surahNumber);
        
        if (surahData) {
          return this.transformToQuranSurah(surahData);
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
   * Fetch semua surah dari data offline
   */
  static getAllSurahs(): QuranSurah[] {
    try {
      const allSurahs: QuranSurah[] = [];
      
      for (const juzData of Object.values(OFFLINE_DATA_MAP)) {
        for (const surahData of juzData.surahs) {
          allSurahs.push(this.transformToQuranSurah(surahData));
        }
      }
      
      console.log(`✅ Loaded ${allSurahs.length} surahs from offline data`);
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
      
      return juzData.surahs.map(s => this.transformToQuranSurah(s));
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
  private static transformToQuranSurah(surahData: any): QuranSurah {
    const verses: QuranVerse[] = surahData.verses.map((verse: any) => ({
      number: verse.number,
      text: verse.text,
      numberInSurah: verse.number,
      juz: verse.juz || Math.ceil(surahData.number / 15),
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
