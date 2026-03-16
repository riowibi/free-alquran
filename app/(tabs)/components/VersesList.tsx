import { FlatList, Alert, View } from 'react-native';
import { useEffect, useMemo } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { QuranSurah, ReadingProgress, QuranVerse } from '@/types/quran';
import { VerseCard } from './VerseCard';
import { useVirtualizedVerseList, VERSE_LIST_CONFIG } from '../hooks/useVirtualizedVerseList';

interface VersesListProps {
  surah: QuranSurah;
  juzGroups: any[];
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
  externalScrollPosition,
}: VersesListProps) {
  const { flatListRef, scrollToVerse, handleViewableItemsChanged, viewabilityConfig, loadedRange } = useVirtualizedVerseList({
    isFromExternalNav,
    lastReadProgress,
    selectedId: surah.number,
    externalScrollPosition,
    totalItems: surah.verses.length,
  });

  // Filter verses based on loaded range (range-based lazy loading)
  const visibleVerses = useMemo(() => {
    return surah.verses.slice(loadedRange.start, loadedRange.end);
  }, [surah.verses, loadedRange]);

  // Scroll to last read verse after content renders
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToVerse();
    }, 200);
    return () => clearTimeout(timer);
  }, [scrollToVerse]);

  // Render header
  const renderHeader = () => (
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
  );

  // Render verse card
  const renderVerseCard = ({ item, index }: { item: QuranVerse; index: number }) => (
    <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
      <VerseCard
        verse={item}
        surahNumber={surah.number}
        isLastVerse={loadedRange.end === surah.verses.length && index === visibleVerses.length - 1}
        lastReadProgress={lastReadProgress}
        isBookmarked={isVerseBookmarked(surah.number, item.numberInSurah)}
        onVersePress={onVersePress}
        onVerseLongPress={onVerseLongPress}
        onQuickButtonPress={onVersePress}
        onBookmarkPress={onBookmarkPress}
        tintColor={tintColor}
        textColor={textColor}
        backgroundColor={backgroundColor}
      />
    </View>
  );

  return (
    <FlatList
      ref={flatListRef}
      data={visibleVerses}
      renderItem={renderVerseCard}
      keyExtractor={(item) => `verse-${item.number}`}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={<View style={{ height: 32 }} />}
      scrollEventThrottle={16}
      onViewableItemsChanged={handleViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      initialNumToRender={VERSE_LIST_CONFIG.initialNumToRender}
      maxToRenderPerBatch={VERSE_LIST_CONFIG.maxToRenderPerBatch}
      windowSize={VERSE_LIST_CONFIG.windowSize}
      updateCellsBatchingPeriod={VERSE_LIST_CONFIG.updateCellsBatchingPeriod}
      removeClippedSubviews={VERSE_LIST_CONFIG.removeClippedSubviews}
      contentContainerStyle={{
        flexGrow: 1,
      }}
    />
  );
}
