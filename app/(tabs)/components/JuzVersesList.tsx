import { ScrollView, Alert, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { JuzGroup, ReadingProgress } from '@/types/quran';
import { VerseCard } from './VerseCard';
import { useVerseScroll } from '../hooks/useVerseScroll';

interface JuzVersesListProps {
  juzGroup: JuzGroup;
  isFromExternalNav: boolean;
  lastReadProgress: ReadingProgress | null;
  isVerseBookmarked: (surahNum: number, verseNum: number) => boolean;
  onVersePress: (surahNum: number, verseNum: number) => void;
  onVerseLongPress: (verseNum: number, text: string, surahNum: number) => void;
  onBookmarkPress: (surahNum: number, verseNum: number, text: string) => Promise<void>;
  tintColor: string;
  textColor: string;
  backgroundColor: string;
  externalScrollPosition?: number; // scrollPosition from URL params
}

export function JuzVersesList({
  juzGroup,
  isFromExternalNav,
  lastReadProgress,
  isVerseBookmarked,
  onVersePress,
  onVerseLongPress,
  onBookmarkPress,
  tintColor,
  textColor,
  backgroundColor,
  externalScrollPosition,
}: JuzVersesListProps) {
  const { scrollRef, storeVersePosition, checkAndScroll } = useVerseScroll({
    isFromExternalNav,
    lastReadProgress,
    selectedId: juzGroup.juzNumber,
    externalScrollPosition,
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
          marginTop: 56,
        }}>
        <ThemedText
          type="title"
          style={{ fontWeight: '700', textAlign: 'left', color: textColor }}>
          Juz {juzGroup.juzNumber}
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
          {juzGroup.surahs.length} Surah{juzGroup.surahs.length > 1 ? 's' : ''} •{' '}
          {juzGroup.surahs[0]?.surahName}
          {juzGroup.surahs.length > 1 &&
            ` - ${juzGroup.surahs[juzGroup.surahs.length - 1]?.surahName}`}
        </ThemedText>
      </ThemedView>

      {/* Verses Container */}
      <ThemedView
        style={{
          paddingHorizontal: 16,
          paddingVertical: 20,
          paddingBottom: 32,
        }}>
        {juzGroup.surahs.map((surahData, surahIdx) => (
          <View key={surahData.surahNumber}>
            {/* Surah Separator */}
            {surahIdx > 0 && (
              <ThemedView
                style={{ marginBottom: 16, marginTop: 20 }}>
                <ThemedView
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 12,
                  }}>
                  <ThemedView
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: tintColor,
                      opacity: 0.3,
                    }}
                  />
                  <ThemedText
                    style={{
                      fontSize: 13,
                      fontWeight: '600',
                      color: tintColor,
                      opacity: 0.8,
                    }}>
                    {surahData.surahName}
                  </ThemedText>
                  <ThemedView
                    style={{
                      flex: 1,
                      height: 1,
                      backgroundColor: tintColor,
                      opacity: 0.3,
                    }}
                  />
                </ThemedView>
              </ThemedView>
            )}

            {/* Verses */}
            {surahData.verses.map((verse, verseIdx) => (
              <VerseCard
                key={verse.number}
                verse={verse}
                surahNumber={surahData.surahNumber}
                isLastVerse={verseIdx === surahData.verses.length - 1}
                lastReadProgress={lastReadProgress}
                isBookmarked={isVerseBookmarked(
                  surahData.surahNumber,
                  verse.numberInSurah
                )}
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
          </View>
        ))}
      </ThemedView>
    </ScrollView>
  );
}
