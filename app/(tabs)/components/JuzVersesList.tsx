import { FlatList, Alert, View } from 'react-native';
import { useEffect, useMemo } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { JuzGroup, ReadingProgress, QuranVerse } from '@/types/quran';
import { VerseCard } from './VerseCard';
import { useVirtualizedVerseList, VERSE_LIST_CONFIG } from '../hooks/useVirtualizedVerseList';

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
  tintColor,
  textColor,
  backgroundColor,
  externalScrollPosition,
}: JuzVersesListProps) {
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

  // Filter data based on loaded range
  const visibleData = useMemo(() => {
    return flatData.slice(loadedRange.start, loadedRange.end);
  }, [flatData, loadedRange]);

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

  return (
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
