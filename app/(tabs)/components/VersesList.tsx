import { ScrollView, Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { QuranSurah, ReadingProgress } from '@/types/quran';
import { VerseCard } from './VerseCard';
import { useVerseScroll } from '../hooks/useVerseScroll';

interface VersesListProps {
  surah: QuranSurah;
  juzGroups: any[];
  isFromExternalNav: boolean;
  lastReadProgress: ReadingProgress | null;
  isVerseBookmarked: (surahNum: number, verseNum: number) => boolean;
  onVersePress: (surahNum: number, verseNum: number) => void;
  onVerseLongPress: (verseNum: number, text: string, surahNum: number) => void;
  onBookmarkPress: (surahNum: number, verseNum: number, text: string) => void;
  tintColor: string;
  textColor: string;
  backgroundColor: string;
}

export function VersesList({
  surah,
  juzGroups,
  isFromExternalNav,
  lastReadProgress,
  isVerseBookmarked,
  onVersePress,
  onVerseLongPress,
  onBookmarkPress,
  tintColor,
  textColor,
  backgroundColor,
}: VersesListProps) {
  const { scrollRef, storeVersePosition, checkAndScroll } = useVerseScroll({
    isFromExternalNav,
    lastReadProgress,
    selectedId: surah.number,
  });

  return (
    <ScrollView ref={scrollRef} style={{ flex: 1 }} scrollEventThrottle={16}>
      {/* Header */}
      <ThemedView
        style={{
          backgroundColor,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
          paddingVertical: 0,
          marginTop: 56,
        }}>
        <ThemedText
          type="title"
          style={{
            fontWeight: '700',
            textAlign: 'left',
            color: textColor,
          }}>
          {surah.englishName}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 18,
            textAlign: 'left',
            color: textColor,
            marginTop: 4,
            fontWeight: '600',
          }}>
          {surah.englishNameTranslation}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 14,
            textAlign: 'left',
            color: textColor,
            fontStyle: 'italic',
            opacity: 0.8,
            marginTop: 4,
          }}>
          Juz {juzGroups[0]?.juzNumber} • Surat {surah.number} • {surah.numberOfAyahs}{' '}
          Ayat • {surah.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah'}
        </ThemedText>
      </ThemedView>

      {/* Verses Container */}
      <ThemedView
        style={{
          paddingHorizontal: 16,
          paddingVertical: 20,
          paddingBottom: 32,
        }}>
        {surah.verses.map((verse, idx) => (
          <VerseCard
            key={verse.number}
            verse={verse}
            surahNumber={surah.number}
            isLastVerse={idx === surah.verses.length - 1}
            lastReadProgress={lastReadProgress}
            isBookmarked={isVerseBookmarked(surah.number, verse.numberInSurah)}
            onVersePress={onVersePress}
            onVerseLongPress={onVerseLongPress}
            onLayout={(verseNumber, y, height) => {
              storeVersePosition(verseNumber, y, height);
              checkAndScroll();
            }}
            onQuickButtonPress={onVersePress}
            onBookmarkPress={onBookmarkPress}
            tintColor={tintColor}
            textColor={textColor}
            backgroundColor={backgroundColor}
          />
        ))}
      </ThemedView>
    </ScrollView>
  );
}
