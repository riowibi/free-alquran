import { QuranSurah, QuranVerse } from '@/types/quran';

const ALQURAN_API_BASE = 'https://api.alquran.cloud/v1';

// Tajweed color mapping for different rules
const TAJWEED_COLORS: { [key: string]: string } = {
  ikhfa: '#F7971E', // Orange
  ikhfaSiffah: '#F7971E',
  ghunnah: '#BF1133', // Dark Red
  madda: '#1CCCBC', // Teal
  maddaPermissible: '#1CCCBC',
  maddaNecessary: '#1CCCBC',
  maddaJaiz: '#1CCCBC',
  qalab: '#8064A2', // Purple
  imalaNormal: '#FB4C2F', // Red
  imalaAlternative: '#D9453F',
  hamzaWasl: '#5EB3B6', // Cyan
  meem: '#1E40AF', // Blue
  laam: '#1E40AF',
  raa: '#AF7AC5', // Light Purple
  noon: '#2E7D32', // Green
  tanween: '#2E7D32',
  fatha: '#000000',
  damma: '#000000',
  kasra: '#000000',
  sukun: '#000000',
  shadda: '#000000',
};

interface SurahResponse {
  code: number;
  status: string;
  data: {
    number: number;
    name: string;
    englishName: string;
    englishNameTranslation: string;
    numberOfAyahs: number;
    revelationType: 'Meccan' | 'Medinan';
    ayahs?: {
      number: number;
      text: string;
      numberInSurah: number;
      juz: number;
      manzil: number;
      page: number;
      ruku: number;
      hizbQuarter: number;
      sajdah: boolean | null;
    }[];
  };
}



export class QuranAPI {
  /**
   * Fetch all Quran surahs metadata
   */
  static async fetchSurahsList() {
    try {
      console.log('📥 Fetching surahs list from API...');
      const response = await fetch(`${ALQURAN_API_BASE}/surah`);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`✅ Fetched ${data.data?.length || 0} surahs list`);
      return data.data || [];
    } catch (error) {
      console.error('❌ Error fetching Quran surahs list:', error);
      return [];
    }
  }

  /**
   * Fetch a specific surah with all verses
   */
  static async fetchSurah(surahNumber: number): Promise<QuranSurah | null> {
    try {
      const url = `${ALQURAN_API_BASE}/surah/${surahNumber}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data: SurahResponse = await response.json();
      
      if (data.code !== 200 || !data.data) {
        console.warn(`⚠️ Invalid response for Surah ${surahNumber}:`, data.code);
        return null;
      }

      const surah = data.data;
      const verses: QuranVerse[] = (surah.ayahs || []).map((ayah: any) => ({
        number: ayah.number,
        text: ayah.text,
        numberInSurah: ayah.numberInSurah,
        juz: ayah.juz,
        manzil: ayah.manzil,
        page: ayah.page,
        ruku: ayah.ruku,
        hizbQuarter: ayah.hizbQuarter,
        sajdah: ayah.sajdah,
      }));

      console.log(`✅ Surah ${surahNumber} (${surah.name}) - ${verses.length} verses`);
      
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
      return null;
    }
  }

  /**
   * Fetch all surahs with verses
   */
  static async fetchAllSurahs(): Promise<QuranSurah[]> {
    try {
      console.log('🚀 Starting to fetch all surahs from API...');
      const startTime = Date.now();
      
      const surahsList = await this.fetchSurahsList();
      if (surahsList.length === 0) {
        throw new Error('Failed to fetch surahs list');
      }

      console.log(`📚 Fetching ${surahsList.length} surahs...`);
      const surahs: QuranSurah[] = [];
      let successCount = 0;
      let failCount = 0;

      for (let i = 0; i < surahsList.length; i++) {
        const surah = surahsList[i];
        const surahData = await this.fetchSurah(surah.number);
        
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
