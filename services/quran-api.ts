import { QuranSurah, QuranVerse } from '@/types/quran';
import { QuranOfflineService } from './quran-offline';
import { logDebug } from './utils';

// Using alquran.cloud API for better Indonesian translations
const ALQURAN_CLOUD_API = 'https://api.alquran.cloud/v1/surah';

// Tajweed color mapping - Eye-friendly palette for comfortable long reading
const TAJWEED_COLORS: { [key: string]: string } = {
  ikhfa: '#D4A574',
  ikhfaSiffah: '#D4A574',
  ghunnah: '#C85C53',
  madda: '#7CBFB8',
  maddaPermissible: '#7CBFB8',
  maddaNecessary: '#7CBFB8',
  maddaJaiz: '#7CBFB8',
  qalab: '#A485B3',
  imalaNormal: '#C87A6A',
  imalaAlternative: '#B87060',
  hamzaWasl: '#7FA3A8',
  meem: '#6B9F7F',
  laam: '#6B9F7F',
  raa: '#8FA5B5',
  noon: '#7CB8A0',
  tanween: '#7CB8A0',
  fatha: '#5A5A5A',
  damma: '#5A5A5A',
  kasra: '#5A5A5A',
  sukun: '#5A5A5A',
  shadda: '#5A5A5A',
};

const MODULE_NAME = 'QuranAPI';

export class QuranAPI {
  private static useOfflineMode = true;

  /**
   * Set whether to use offline or online mode
   */
  static setOfflineMode(enabled: boolean) {
    this.useOfflineMode = enabled;
    logDebug(MODULE_NAME, `Mode: ${enabled ? 'OFFLINE 📴' : 'ONLINE 🌐'}`);
  }

  /**
   * Check if offline mode is active
   */
  static isOfflineMode(): boolean {
    return this.useOfflineMode;
  }

  /**
   * Fetch all Quran surahs metadata
   */
  static async fetchSurahsList(): Promise<Array<{ nomor: number; nama: string; nama_latin: string; jumlah_ayat: number }>> {
    try {
      if (this.useOfflineMode && QuranOfflineService.isOfflineAvailable()) {
        logDebug(MODULE_NAME, '📥 Surahs list from offline');
        const surahs = QuranOfflineService.getAllSurahs();
        const surahsList = surahs.map(s => ({
          nomor: s.number,
          nama: s.name,
          nama_latin: s.englishName,
          jumlah_ayat: s.numberOfAyahs,
        }));
        logDebug(MODULE_NAME, `✅ Fetched ${surahsList.length} surahs`);
        return surahsList;
      }

      logDebug(MODULE_NAME, '📥 Surahs list from online API');
      const response = await fetch('https://api.alquran.cloud/v1/surahs');
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      logDebug(MODULE_NAME, `✅ Fetched ${data.data?.length || 0} surahs online`);
      return data.data || [];
    } catch (error) {
      console.error(`❌ [${MODULE_NAME}] Error fetching surahs:`, error);
      
      if (!this.useOfflineMode && QuranOfflineService.isOfflineAvailable()) {
        logDebug(MODULE_NAME, '⚠️ Falling back to offline');
        return this.fetchSurahsList();
      }
      
      return [];
    }
  }

  /**
   * Fetch a specific surah with all verses and Indonesian translations
   */
  static async fetchSurah(surahNumber: number): Promise<QuranSurah | null> {
    try {
      // Offline mode
      if (this.useOfflineMode && QuranOfflineService.isOfflineAvailable()) {
        logDebug(MODULE_NAME, `📡 Surah ${surahNumber} from offline`);
        const surah = QuranOfflineService.getSurah(surahNumber);
        
        if (surah) {
          logDebug(MODULE_NAME, `✅ Surah ${surahNumber} loaded (${surah.numberOfAyahs} verses)`);
          return surah;
        }
      }

      // Online mode
      logDebug(MODULE_NAME, `📡 Surah ${surahNumber} from online API`);
      
      const responses = await Promise.all([
        fetch(`${ALQURAN_CLOUD_API}/${surahNumber}`),
        fetch(`${ALQURAN_CLOUD_API}/${surahNumber}/id.indonesian`),
      ]);

      if (!responses[0].ok || !responses[1].ok) {
        throw new Error(`HTTP ${responses[0].status}`);
      }

      const dataArab = await responses[0].json();
      const dataIndo = await responses[1].json();

      if (dataArab.code !== 200 || !dataArab.data) {
        console.warn(`⚠️ Invalid response for Surah ${surahNumber}`);
        return null;
      }

      const surah = dataArab.data;
      const surahIndo = dataIndo.data;

      const verses: QuranVerse[] = (surah.ayahs || []).map((ayah: any, index: number) => {
        const ayahIndo = surahIndo.ayahs?.[index];
        return {
          number: ayah.number.inSurah,
          text: ayah.text || '',
          numberInSurah: ayah.number.inSurah,
          juz: ayah.juz,
          manzil: 1,
          page: ayah.page,
          ruku: ayah.ruku,
          hizbQuarter: 1,
          sajdah: null,
          transliteration: ayah.transliteration || '',
          indonesianTranslation: ayahIndo?.text || '',
          englishTranslation: undefined,
        };
      });

      logDebug(MODULE_NAME, `✅ Surah ${surahNumber} loaded (${verses.length} verses)`);

      return {
        number: surah.number,
        name: surah.name,
        englishName: surah.englishName,
        englishNameTranslation: surah.englishNameTranslation,
        numberOfAyahs: surah.numberOfAyahs,
        revelationType: surah.revelationType,
        verses,
        bookmarked: false,
      };
    } catch (error) {
      console.error(`❌ [${MODULE_NAME}] Error fetching Surah ${surahNumber}:`, error);
      
      if (!this.useOfflineMode && QuranOfflineService.isOfflineAvailable()) {
        logDebug(MODULE_NAME, '⚠️ Falling back to offline');
        return this.fetchSurah(surahNumber);
      }
      
      return null;
    }
  }

  /**
   * Fetch all surahs with verses - optimized
   */
  static async fetchAllSurahs(): Promise<QuranSurah[]> {
    try {
      const startTime = Date.now();
      
      if (this.useOfflineMode && QuranOfflineService.isOfflineAvailable()) {
        logDebug(MODULE_NAME, '📦 Using offline mode');
        const allSurahs = QuranOfflineService.getAllSurahs();
        const duration = Date.now() - startTime;
        logDebug(MODULE_NAME, `✅ All surahs loaded in ${duration}ms`);
        return allSurahs;
      }

      logDebug(MODULE_NAME, '🌐 Using online mode');
      const surahsList = await this.fetchSurahsList();
      if (surahsList.length === 0) {
        throw new Error('Failed to fetch surahs list');
      }

      logDebug(MODULE_NAME, `📚 Fetching ${surahsList.length} surahs from API`);
      const surahs: QuranSurah[] = [];
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < surahsList.length; i++) {
        const surah = surahsList[i];
        const surahData = await this.fetchSurah(surah.nomor);

        if (surahData) {
          surahs.push(surahData);
          successCount++;
        } else {
          failCount++;
        }

        if ((i + 1) % 10 === 0) {
          logDebug(MODULE_NAME, `⏳ Progress: ${i + 1}/${surahsList.length}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const duration = Date.now() - startTime;
      logDebug(MODULE_NAME, `✅ Loaded ${successCount} surahs in ${duration}ms`);

      return surahs;
    } catch (error) {
      console.error(`❌ [${MODULE_NAME}] Error fetching all surahs:`, error);
      
      if (!this.useOfflineMode && QuranOfflineService.isOfflineAvailable()) {
        logDebug(MODULE_NAME, '⚠️ Falling back to offline');
        return this.fetchAllSurahs();
      }
      
      return [];
    }
  }

  /**
   * Get color for tajweed rule
   */
  static getTajweedColor(rule: string): string {
    return TAJWEED_COLORS[rule] || '#000000';
  }

  /**
   * Convert Quran verse text with tajweed markers
   */
  static colorizeVerse(text: string): string {
    return text;
  }
}
