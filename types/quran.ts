/**
 * Quran Data Types
 */

export interface QuranVerse {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajdah: boolean | null;
  tajweedKind?: string;
  colorCode?: string; // Hex color for tajweed
}

export interface QuranSurah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  verses: QuranVerse[];
  bookmarked?: boolean;
  lastReadVerse?: number;
  lastReadTimestamp?: number;
}

export interface ReadingProgress {
  surahNumber: number;
  verseNumber: number;
  timestamp: Date;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  verseNumber: number;
  text: string;
  timestamp: Date;
  note?: string;
}

export interface QuranData {
  surah: QuranSurah[];
  lastReadProgress?: ReadingProgress;
  bookmarks: Bookmark[];
}
