import { FlatList, Alert, View } from 'react-native';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { QuranSurah, ReadingProgress, QuranVerse, JuzGroup } from '@/types/quran';
import { VerseCard } from './VerseCard';
import { ContinueReadingCarousel } from './ContinueReadingCarousel';
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
  onSurahChange?: (surah: QuranSurah) => void;
  onJuzChange?: (juz: JuzGroup) => void;
  allSurahs?: QuranSurah[];
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
  onSurahChange,
  onJuzChange,
  allSurahs,
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

  const [showContinueReading, setShowContinueReading] = useState(false);
  const [currentViewableIndex, setCurrentViewableIndex] = useState(0);
  const loadedRangeRef = useRef(loadedRange);

  // Filter verses based on loaded range (range-based lazy loading)
  const visibleVerses = useMemo(() => {
    return surah.verses.slice(loadedRange.start, loadedRange.end);
  }, [surah.verses, loadedRange]);

  // Keep ref in sync with current loaded range
  useEffect(() => {
    loadedRangeRef.current = loadedRange;
  }, [loadedRange]);

  // Detect if viewing the last verse
  useEffect(() => {
    const isLastVerseVisible =
      loadedRange.end === surah.verses.length && currentViewableIndex >= surah.verses.length - 3;

    if (isLastVerseVisible && surah.number < 114) {
      // Don't show for Surah 114 (last surah)
      setShowContinueReading(true);
    } else {
      setShowContinueReading(false);
    }
  }, [loadedRange, currentViewableIndex, surah.number, surah.verses.length]);

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

  // Render footer with continue reading carousel
  const renderFooter = () => {
    if (!showContinueReading || !onSurahChange || !allSurahs) {
      return <View style={{ height: 32 }} />;
    }

    return (
      <ContinueReadingCarousel
        currentSurah={surah}
        currentJuz={juzGroups[0] || null}
        readMode="surah"
        allSurahs={allSurahs}
        allJuzGroups={juzGroups}
        onSelectSurah={onSurahChange}
        onSelectJuz={onJuzChange || (() => {})}
        tintColor={tintColor}
        textColor={textColor}
        backgroundColor={backgroundColor}
      />
    );
  };

  // Track viewable items to detect when viewing last verses - FULLY STABLE CALLBACK
  const handleViewableItemsChangedWithTracking = useCallback(
    (info: any) => {
      if (info.viewableItems.length > 0) {
        const lastViewableIndex = info.viewableItems[info.viewableItems.length - 1].index || 0;
        setCurrentViewableIndex(lastViewableIndex + loadedRangeRef.current.start);
      }
      handleViewableItemsChanged(info);
    },
    [handleViewableItemsChanged]
  );

  return (
    <FlatList
      ref={flatListRef}
      data={visibleVerses}
      renderItem={renderVerseCard}
      keyExtractor={(item) => `verse-${item.number}`}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      scrollEventThrottle={16}
      onViewableItemsChanged={handleViewableItemsChangedWithTracking}
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
