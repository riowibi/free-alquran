import { useMemo } from 'react';
import { QuranSurah, JuzGroup } from '@/types/quran';

export function useJuzGroups(surahs: QuranSurah[]): JuzGroup[] {
  return useMemo(() => {
    const groups: { [key: number]: JuzGroup } = {};

    // Build juz groups from surahs
    surahs.forEach((surah) => {
      const versesByJuz = new Map<number, any[]>();

      // Group verses by juz
      surah.verses.forEach((verse) => {
        const juzNum = verse.juz;
        if (juzNum) {
          if (!versesByJuz.has(juzNum)) {
            versesByJuz.set(juzNum, []);
          }
          versesByJuz.get(juzNum)!.push(verse);
        }
      });

      // Add surah to each juz
      versesByJuz.forEach((verses, juzNum) => {
        if (!groups[juzNum]) {
          groups[juzNum] = {
            juzNumber: juzNum,
            surahs: [],
          };
        }

        // Avoid duplicates
        const surahExists = groups[juzNum].surahs.some(
          (s) => s.surahNumber === surah.number
        );

        if (!surahExists) {
          groups[juzNum].surahs.push({
            surahNumber: surah.number,
            surahName: surah.name,
            verses,
          });
        }
      });
    });

    // Sort and return
    Object.values(groups).forEach((group) => {
      group.surahs.sort((a, b) => a.surahNumber - b.surahNumber);
    });

    return Object.values(groups).sort(
      (a, b) => a.juzNumber - b.juzNumber
    );
  }, [surahs]);
}
