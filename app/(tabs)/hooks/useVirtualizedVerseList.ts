import { useRef, useCallback, useEffect, useState } from 'react';
import { FlatList } from 'react-native';
import { ReadingProgress } from '@/types/quran';

interface UseVirtualizedVerseListProps {
  isFromExternalNav: boolean;
  lastReadProgress: ReadingProgress | null;
  selectedId: number | null; // surahNumber or juzNumber
  externalScrollPosition?: number;
  totalItems: number; // Total number of verses
}

interface LoadedRange {
  start: number;
  end: number;
}

// Estimated item height (header + verse card + padding)
const ESTIMATED_ITEM_HEIGHT = 180; // pixels
const INITIAL_RANGE_SIZE = 50; // Load 50 items around target (increased from 20)
const PRELOAD_THRESHOLD = 10; // Preload when 10 items away from boundary (increased from 5)
const LOAD_MORE_SIZE = 30; // Load 30 more items per direction (increased from 10)

export function useVirtualizedVerseList(props: UseVirtualizedVerseListProps) {
  const { isFromExternalNav, lastReadProgress, selectedId, externalScrollPosition, totalItems } = props;

  const flatListRef = useRef<FlatList>(null);
  const hasScrolledRef = useRef(false);
  const verseHeightsRef = useRef<Map<number, number>>(new Map());
  
  // Track loaded range with ref (keep callback reference stable)
  const loadedRangeRef = useRef<LoadedRange>({ start: 0, end: INITIAL_RANGE_SIZE });
  const [loadedRange, setLoadedRange] = useState<LoadedRange>({ start: 0, end: INITIAL_RANGE_SIZE });
  const isLoadingRef = useRef(false);
  const isSwitchingContentRef = useRef(false); // Flag to prevent callback during content switch

  // Reset scroll state when surah/juz changes
  useEffect(() => {
    if (!isFromExternalNav) {
      hasScrolledRef.current = true;
      return;
    }
    
    // Flag: switching content, disable callbacks temporarily
    isSwitchingContentRef.current = true;
    
    hasScrolledRef.current = false;
    verseHeightsRef.current.clear();
    const newRange = { start: 0, end: INITIAL_RANGE_SIZE };
    loadedRangeRef.current = newRange;
    setLoadedRange(newRange);
    
    // Re-enable callbacks after a brief delay
    setTimeout(() => {
      isSwitchingContentRef.current = false;
    }, 100);
  }, [selectedId, isFromExternalNav]);

  // Store verse height for scroll calculation
  const recordVerseHeight = useCallback((verseIndex: number, height: number) => {
    verseHeightsRef.current.set(verseIndex, height);
  }, []);

  // Calculate estimated offset based on item heights
  const calculateEstimatedOffset = useCallback((targetIndex: number) => {
    let totalHeight = 0;
    
    // Sum heights of items before target
    for (let i = 0; i < targetIndex; i++) {
      const height = verseHeightsRef.current.get(i) || ESTIMATED_ITEM_HEIGHT;
      totalHeight += height;
    }
    
    return totalHeight;
  }, []);

  // Handle viewable items changed - FULLY STABLE CALLBACK (empty deps)
  // Use ref to access current state without dependency
  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      // Skip if switching content between surahs/juz
      if (isSwitchingContentRef.current) return;
      
      if (viewableItems.length === 0) return;

      const firstVisibleIndex = viewableItems[0]?.index;
      const lastVisibleIndex = viewableItems[viewableItems.length - 1]?.index;

      if (firstVisibleIndex === null || lastVisibleIndex === null) return;

      // Use ref to always have current range (no dependency needed)
      const currentRange = loadedRangeRef.current;
      if (!currentRange) return;

      // Load before jika dekat dengan start
      if (firstVisibleIndex < currentRange.start + PRELOAD_THRESHOLD) {
        if (isLoadingRef.current || currentRange.start <= 0) return;
        
        isLoadingRef.current = true;
        setTimeout(() => {
          const newRange = {
            start: Math.max(0, currentRange.start - LOAD_MORE_SIZE),
            end: currentRange.end,
          };
          loadedRangeRef.current = newRange;
          setLoadedRange(newRange);
          isLoadingRef.current = false;
        }, 0);
      }

      // Load after jika dekat dengan end
      if (lastVisibleIndex > currentRange.end - PRELOAD_THRESHOLD) {
        if (isLoadingRef.current || currentRange.end >= totalItems) return;
        
        isLoadingRef.current = true;
        setTimeout(() => {
          const newRange = {
            start: currentRange.start,
            end: Math.min(totalItems, currentRange.end + LOAD_MORE_SIZE),
          };
          loadedRangeRef.current = newRange;
          setLoadedRange(newRange);
          isLoadingRef.current = false;
        }, 0);
      }
    },
    [] // ← EMPTY! Callback never changes reference
  );

  // Scroll to verse position dengan range-based loading
  const scrollToVerse = useCallback(() => {
    if (hasScrolledRef.current || !isFromExternalNav || !lastReadProgress) {
      return;
    }

    hasScrolledRef.current = true;

    // Priority 1: Use external scroll position
    if (externalScrollPosition !== undefined && externalScrollPosition > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: Math.max(0, externalScrollPosition - 100),
          animated: false,
        });
      }, 100);
      return;
    }

    // Priority 2: Scroll to last read verse (using stored scroll position)
    if (lastReadProgress.scrollPosition !== undefined && lastReadProgress.scrollPosition > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: Math.max(0, (lastReadProgress.scrollPosition ?? 0) - 100),
          animated: false,
        });
      }, 100);
      return;
    }

    // Priority 3: Calculate from verse position with range loading
    const versePosition = lastReadProgress.verseNumber || 0;
    if (versePosition > 0 && versePosition <= totalItems) {
      // Calculate range around target verse
      const halfRange = Math.floor(INITIAL_RANGE_SIZE / 2);
      const newStart = Math.max(0, versePosition - halfRange);
      const newEnd = Math.min(totalItems, versePosition + halfRange);
      
      // Update loaded range first
      const newRange = { start: newStart, end: newEnd };
      loadedRangeRef.current = newRange;
      setLoadedRange(newRange);

      // Then scroll to target
      setTimeout(() => {
        try {
          const indexInRange = versePosition - 1 - newStart; // Position within loaded range
          flatListRef.current?.scrollToIndex({
            index: indexInRange,
            viewPosition: 0.3,
            animated: false,
          });
        } catch (e) {
          // Fallback to offset calculation
          const estimatedOffset = calculateEstimatedOffset(versePosition - 1);
          flatListRef.current?.scrollToOffset({
            offset: Math.max(0, estimatedOffset - 100),
            animated: false,
          });
        }
      }, 200);
    }
  }, [isFromExternalNav, lastReadProgress, externalScrollPosition, totalItems, calculateEstimatedOffset]);

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return {
    flatListRef,
    scrollToVerse,
    recordVerseHeight,
    handleViewableItemsChanged,
    viewabilityConfig,
    loadedRange,
  };
}

// FlatList optimization config (for range-based lazy loading)
export const VERSE_LIST_CONFIG = {
  initialNumToRender: 25, // Render 25 items from loaded range (increased from 15)
  maxToRenderPerBatch: 10, // Max 10 per batch (increased from 5)
  windowSize: 10, // Keep 10 screens worth buffered
  updateCellsBatchingPeriod: 50, // Update every 50ms
  removeClippedSubviews: true, // Remove views outside viewport
};
