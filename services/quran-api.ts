import { QuranSurah, QuranVerse } from '@/types/quran';
import { QuranOfflineService } from './quran-offline';

// Using alquran.cloud API for better Indonesian translations
const ALQURAN_CLOUD_API = 'https://api.alquran.cloud/v1/surah';

// Tajweed color mapping - Eye-friendly palette for comfortable long reading
// Designed for ages 25-50+ with reduced saturation and warm tones
const TAJWEED_COLORS: { [key: string]: string } = {
  ikhfa: '#D4A574', // Soft burnt sienna/tan - warm and relaxing
  ikhfaSiffah: '#D4A574',
  ghunnah: '#C85C53', // Warm reddish - softer than bright red
  madda: '#7CBFB8', // Muted teal - easy on the eyes
  maddaPermissible: '#7CBFB8',
  maddaNecessary: '#7CBFB8',
  maddaJaiz: '#7CBFB8',
  qalab: '#A485B3', // Soft purple - gentle and calming
  imalaNormal: '#C87A6A', // Warm rust
  imalaAlternative: '#B87060',
  hamzaWasl: '#7FA3A8', // Muted blue-grey - very comfortable
  meem: '#6B9F7F', // Sage green - easy on tired eyes
  laam: '#6B9F7F',
  raa: '#8FA5B5', // Muted slate blue - soft and readable
  noon: '#7CB8A0', // Soft teal-green - calming
  tanween: '#7CB8A0',
  fatha: '#5A5A5A', // Soft grey for diacritics
  damma: '#5A5A5A',
  kasra: '#5A5A5A',
  sukun: '#5A5A5A',
  shadda: '#5A5A5A',
};

export class QuranAPI {
  private static useOfflineMode = true; // Default ke offline mode

  /**
   * Set apakah menggunakan mode offline atau online
   */
  static setOfflineMode(enabled: boolean) {
    this.useOfflineMode = enabled;
    console.log(`📡 Quran API Mode: ${enabled ? 'OFFLINE 📴' : 'ONLINE 🌐'}`);
  }

  /**
   * Check apakah offline mode aktif
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
        console.log('📥 Fetching surahs list from OFFLINE data...');
        const surahs = QuranOfflineService.getAllSurahs();
        const surahsList = surahs.map(s => ({
          nomor: s.number,
          nama: s.name,
          nama_latin: s.englishName,
          jumlah_ayat: s.numberOfAyahs,
        }));
        console.log(`✅ Fetched ${surahsList.length} surahs list from offline`);
        return surahsList;
      }

      // Online mode: fetch dari API
      console.log('📥 Fetching surahs list from Online API...');
      const response = await fetch('https://api.alquran.cloud/v1/surahs');
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Fetched ${data.data?.length || 0} surahs list from online API`);
      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching Quran surahs list:', error);
      
      // Fallback ke offline jika online gagal
      if (!this.useOfflineMode && QuranOfflineService.isOfflineAvailable()) {
        console.log('⚠️ Fallback to offline data...');
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
      // Offline mode: fetch dari file JSON
      if (this.useOfflineMode && QuranOfflineService.isOfflineAvailable()) {
        console.log(`📡 Fetching Surah ${surahNumber} from OFFLINE data...`);
        const surah = QuranOfflineService.getSurah(surahNumber);
        
        if (surah) {
          console.log(`✅ Surah ${surahNumber} (${surah.englishName}) - ${surah.numberOfAyahs} verses loaded from offline`);
          return surah;
        }
      }

      // Online mode: fetch dari API
      console.log(`📡 Fetching Surah ${surahNumber} from Online API...`);
      
      const responses = await Promise.all([
        fetch(`${ALQURAN_CLOUD_API}/${surahNumber}`),
        fetch(`${ALQURAN_CLOUD_API}/${surahNumber}/id.indonesian`),
      ]);

      if (!responses[0].ok || !responses[1].ok) {
        throw new Error(`HTTP Error: ${responses[0].status}`);
      }

      const dataArab = await responses[0].json();
      const dataIndo = await responses[1].json();

      if (dataArab.code !== 200 || !dataArab.data) {
        console.warn(`⚠️ Invalid response for Surah ${surahNumber}:`, dataArab.code);
        return null;
      }

      const surah = dataArab.data;
      const surahIndo = dataIndo.data;

      // Log first verse to debug structure
      if (surah.ayahs && surah.ayahs.length > 0) {
        console.log(`🔍 First verse structure:`, JSON.stringify(surah.ayahs[0], null, 2));
      }

      const verses: QuranVerse[] = (surah.ayahs || []).map((ayah: any, index: number) => {
        const ayahIndo = surahIndo.ayahs?.[index];
        const verse: QuranVerse = {
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

        // Log first verse mapping
        if (index === 0) {
          console.log(`📝 First verse mapped:`, {
            numberInSurah: verse.numberInSurah,
            text: verse.text.substring(0, 30) + '...',
            transliteration: verse.transliteration?.substring(0, 30) + '...',
            indonesianTranslation: verse.indonesianTranslation?.substring(0, 30) + '...',
          });
        }

        return verse;
      });

      console.log(`✅ Surah ${surahNumber} (${surah.name}) - ${verses.length} verses loaded from online API`);

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
      console.error(`❌ Error fetching Surah ${surahNumber}:`, error);
      
      // Fallback ke offline jika online gagal
      if (!this.useOfflineMode && QuranOfflineService.isOfflineAvailable()) {
        console.log('⚠️ Fallback to offline data...');
        return this.fetchSurah(surahNumber);
      }
      
      return null;
    }
  }

  /**
   * Fetch all surahs with verses
   */
  static async fetchAllSurahs(): Promise<QuranSurah[]> {
    try {
      console.log('🚀 Starting to fetch all surahs...');
      const startTime = Date.now();

      // Offline mode: lebih cepat
      if (this.useOfflineMode && QuranOfflineService.isOfflineAvailable()) {
        console.log('📦 Using OFFLINE mode (fastest)...');
        const allSurahs = QuranOfflineService.getAllSurahs();
        const duration = Date.now() - startTime;
        console.log(`🎉 All surahs loaded from offline in ${duration}ms`);
        return allSurahs;
      }

      // Online mode: fetch semua dari API
      console.log('🌐 Using ONLINE mode (from API)...');
      const surahsList = await this.fetchSurahsList();
      if (surahsList.length === 0) {
        throw new Error('Failed to fetch surahs list');
      }

      console.log(`📚 Fetching ${surahsList.length} surahs from API...`);
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

        // Show progress every 10 surahs
        if ((i + 1) % 10 === 0) {
          console.log(`⏳ Progress: ${i + 1}/${surahsList.length} surahs loaded`);
        }

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const duration = Date.now() - startTime;
      console.log(`🎉 Quran data loaded: ${successCount} surahs (${failCount} failed) in ${duration}ms`);

      return surahs;
    } catch (error) {
      console.error('❌ Error fetching all surahs:', error);
      
      // Fallback ke offline jika online gagal
      if (!this.useOfflineMode && QuranOfflineService.isOfflineAvailable()) {
        console.log('⚠️ Fallback to offline data...');
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
   * Convert Quran verse text with tajweed markers to colored version
   */
  static colorizeVerse(text: string): string {
    // This is a placeholder for tajweed coloring logic
    // In production, you might want to fetch this from a dedicated tajweed API
    return text;
  }
}
