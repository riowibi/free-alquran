import { FlatList, Alert, View, Animated } from 'react-native';
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { JuzGroup, ReadingProgress, QuranVerse, QuranSurah } from '@/types/quran';
import { VerseCard } from './VerseCard';
// import { ContinueReadingCarousel } from './ContinueReadingCarousel';
import { SurahMinimalHeader } from './SurahMinimalHeader';
import { useVirtualizedVerseList, VERSE_LIST_CONFIG } from '../hooks/useVirtualizedVerseList';

interface JuzVersesListProps {
  juzGroup: JuzGroup;
  isFromExternalNav: boolean;
  lastReadProgress: ReadingProgress | null;
  isVerseBookmarked: (surahNum: number, verseNum: number) => boolean;
  onVersePress: (surahNum: number, verseNum: number) => void;
  onVerseLongPress: (verseNum: number, text: string, surahNum: number) => void;
  onBookmarkPress: (surahNum: number, verseNum: number, text: string) => Promise<void>;
  onSurahChange?: (surah: QuranSurah) => void;
  onJuzChange?: (juz: JuzGroup) => void;
  allSurahs?: QuranSurah[];
  allJuzGroups?: JuzGroup[];
  tintColor: string;
  textColor: string;
  backgroundColor: string;
  externalScrollPosition?: number; // scrollPosition from URL params
}

interface VerseItem {
  type: 'separator' | 'verse';
  surahNumber?: number;
  surahName?: string;
  verseData?: QuranVerse;
  verseIndex?: number;
  isLastVerse?: boolean;
}

export function JuzVersesList({
  juzGroup,
  isFromExternalNav,
  lastReadProgress,
  isVerseBookmarked,
  onVersePress,
  onVerseLongPress,
  onBookmarkPress,
  onSurahChange,
  onJuzChange,
  allSurahs,
  allJuzGroups,
  tintColor,
  textColor,
  backgroundColor,
  externalScrollPosition,
}: JuzVersesListProps) {
  const [showContinueReading, setShowContinueReading] = useState(false);
  const [currentViewableIndex, setCurrentViewableIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  // Navigate to previous juz
  const handlePreviousJuz = useCallback(() => {
    if (allJuzGroups && juzGroup.juzNumber > 1) {
      const previousJuz = allJuzGroups.find((j) => j.juzNumber === juzGroup.juzNumber - 1);
      if (previousJuz && onJuzChange) {
        console.log('[JUZ] Previous juz pressed - Juz:', previousJuz.juzNumber);
        // Scroll to top
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        onJuzChange(previousJuz);
      }
    }
  }, [juzGroup.juzNumber, allJuzGroups, onJuzChange]);

  // Navigate to next juz
  const handleNextJuz = useCallback(() => {
    if (allJuzGroups && juzGroup.juzNumber < 30) {
      const nextJuz = allJuzGroups.find((j) => j.juzNumber === juzGroup.juzNumber + 1);
      if (nextJuz && onJuzChange) {
        console.log('[JUZ] Next juz pressed - Juz:', nextJuz.juzNumber);
        // Scroll to top
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        onJuzChange(nextJuz);
      }
    }
  }, [juzGroup.juzNumber, allJuzGroups, onJuzChange]);

  // Wrapper for carousel surah selection - scroll to top
  const handleCarouselSurahChange = useCallback((selectedSurah: QuranSurah) => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    if (onSurahChange) {
      onSurahChange(selectedSurah);
    }
  }, [onSurahChange]);

  // Wrapper for carousel juz selection - scroll to top
  const handleCarouselJuzChange = useCallback((selectedJuz: JuzGroup) => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    if (onJuzChange) {
      onJuzChange(selectedJuz);
    }
  }, [onJuzChange]);

  // Flatten data structure for FlatList
  const flatData = useMemo(() => {
    const items: VerseItem[] = [];
    let totalVerses = 0;
    
    juzGroup.surahs.forEach((surahData, surahIdx) => {
      // Add separator (except for first surah)
      if (surahIdx > 0) {
        items.push({
          type: 'separator',
          surahNumber: surahData.surahNumber,
          surahName: surahData.surahName,
        });
      }
      
      // Add verses
      surahData.verses.forEach((verse, verseIdx) => {
        items.push({
          type: 'verse',
          surahNumber: surahData.surahNumber,
          verseData: verse,
          verseIndex: verseIdx,
          isLastVerse: verseIdx === surahData.verses.length - 1,
        });
        totalVerses++;
      });
    });
    
    return items;
  }, [juzGroup]);

  const { flatListRef, scrollToVerse, handleViewableItemsChanged, viewabilityConfig, loadedRange } = useVirtualizedVerseList({
    isFromExternalNav,
    lastReadProgress,
    selectedId: juzGroup.juzNumber,
    externalScrollPosition,
    totalItems: flatData.filter((item) => item.type === 'verse').length,
  });

  const loadedRangeRef = useRef(loadedRange);

  // Filter data based on loaded range
  const visibleData = useMemo(() => {
    // Show ALL verses - FlatList virtualization will handle rendering only visible ones
    return flatData;
  }, [flatData]);

  // Detect if viewing the last verse
  useEffect(() => {
    const isLastVerseVisible = currentViewableIndex >= flatData.length - 3;

    if (isLastVerseVisible && juzGroup.juzNumber < 30) {
      // Don't show for Juz 30 (last juz)
      setShowContinueReading(true);
    } else {
      setShowContinueReading(false);
    }
  }, [currentViewableIndex, juzGroup.juzNumber, flatData.length]);

  // Scroll to last read verse after content renders
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollToVerse();
    }, 200);
    return () => clearTimeout(timer);
  }, [scrollToVerse]);

  // Render header
  const renderHeader = () => (
    <View>
      {/* Minimal Sticky Header */}
      <SurahMinimalHeader
        surahName={`Juz ${juzGroup.juzNumber}`}
        surahNumber={juzGroup.juzNumber}
        totalSurahs={30}
        onPreviousSurah={handlePreviousJuz}
        onNextSurah={handleNextJuz}
        tintColor={tintColor}
        textColor={textColor}
        backgroundColor={backgroundColor}
      />

      {/* Full Header */}
      <ThemedView
        style={{
          backgroundColor,
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 12,
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
    </View>
  );

  // Render surah separator
  const renderSeparator = (item: VerseItem) => (
    <ThemedView style={{ marginBottom: 16, marginTop: 20 }}>
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
          {item.surahName}
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
  );

  // Render item
  const renderItem = ({ item }: { item: VerseItem }) => {
    if (item.type === 'separator') {
      return <View style={{ paddingHorizontal: 16 }}>{renderSeparator(item)}</View>;
    }

    return (
      <View style={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        <VerseCard
          verse={item.verseData!}
          surahNumber={item.surahNumber!}
          isLastVerse={item.isLastVerse!}
          lastReadProgress={lastReadProgress}
          isBookmarked={isVerseBookmarked(item.surahNumber!, item.verseData!.numberInSurah)}
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
  };

  // Render footer with continue reading carousel
  // const renderFooter = () => {
  //   if (!showContinueReading || !onJuzChange || !allJuzGroups) {
  //     return <View style={{ height: 32 }} />;
  //   }

  //   return (
  //     <ContinueReadingCarousel
  //       currentSurah={null}
  //       currentJuz={juzGroup}
  //       readMode="juz"
  //       allSurahs={allSurahs || []}
  //       allJuzGroups={allJuzGroups}
  //       onSelectSurah={handleCarouselSurahChange}
  //       onSelectJuz={handleCarouselJuzChange}
  //       tintColor={tintColor}
  //       textColor={textColor}
  //       backgroundColor={backgroundColor}
  //     />
  //   );
  // };

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

  // Handle scroll for sticky header
  const scrollOffsetY = useRef(new Animated.Value(0)).current;
  
  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    scrollOffsetY.setValue(offsetY);
    setIsScrolled(offsetY > 60);
  };

  return (
    <ThemedView style={{ flex: 1, backgroundColor }}>
      {/* Sticky Minimal Header Overlay */}
      {isScrolled && (
        <SurahMinimalHeader
          surahName={`Juz ${juzGroup.juzNumber}`}
          surahNumber={juzGroup.juzNumber}
          totalSurahs={30}
          onPreviousSurah={handlePreviousJuz}
          onNextSurah={handleNextJuz}
          tintColor={tintColor}
          textColor={textColor}
          backgroundColor={backgroundColor}
        />
      )}

      {/* Main List */}
      <FlatList
        ref={flatListRef}
        data={visibleData}
        renderItem={renderItem}
        keyExtractor={(item, index) => {
          if (item.type === 'separator') {
            return `separator-${item.surahNumber}`;
          }
          return `verse-${item.verseData?.number}`;
        }}
        ListHeaderComponent={renderHeader}
        // ListFooterComponent={renderFooter}
        scrollEventThrottle={16}
        onViewableItemsChanged={handleViewableItemsChangedWithTracking}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={VERSE_LIST_CONFIG.initialNumToRender}
        maxToRenderPerBatch={VERSE_LIST_CONFIG.maxToRenderPerBatch}
        windowSize={VERSE_LIST_CONFIG.windowSize}
        updateCellsBatchingPeriod={VERSE_LIST_CONFIG.updateCellsBatchingPeriod}
        removeClippedSubviews={VERSE_LIST_CONFIG.removeClippedSubviews}
        onScroll={handleScroll}
        contentContainerStyle={{
          flexGrow: 1,
        }}
      />
    </ThemedView>
  );
}
