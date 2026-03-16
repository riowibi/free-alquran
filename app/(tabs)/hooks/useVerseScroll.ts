import { useRef, useCallback, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { ReadingProgress, QuranVerse } from '@/types/quran';

export interface VersePosition {
  y: number;
  height: number;
}

interface UseVerseScrollProps {
  isFromExternalNav: boolean;
  lastReadProgress: ReadingProgress | null;
  selectedId: number | null; // surahNumber or juzNumber
  externalScrollPosition?: number; // scrollPosition from URL params
}

export function useVerseScroll(props: UseVerseScrollProps) {
  const { isFromExternalNav, lastReadProgress, selectedId, externalScrollPosition } = props;
  
  const scrollRef = useRef<ScrollView>(null);
  const versePositionsRef = useRef<Map<number, VersePosition>>(new Map());
  const hasScrolledRef = useRef(false);

  // Reset scroll state when surah/juz changes
  useEffect(() => {
    if (!isFromExternalNav) {
      hasScrolledRef.current = true;
      console.log('[VERSE_SCROLL] External nav disabled, scroll state reset');
      return;
    }
    console.log('[VERSE_SCROLL] Changed surah/juz, clearing scroll positions');
    hasScrolledRef.current = false;
    versePositionsRef.current.clear();
  }, [selectedId, isFromExternalNav]);

  // Store verse position
  const storeVersePosition = useCallback(
    (verseNumber: number, y: number, height: number) => {
      versePositionsRef.current.set(verseNumber, { y, height });
      console.log('[VERSE_SCROLL] Position stored - Verse:', verseNumber, 'Y:', y, 'Height:', height);
    },
    []
  );

  // Check and scroll to last read verse
  const checkAndScroll = useCallback(() => {
    if (
      hasScrolledRef.current ||
      !isFromExternalNav ||
      !lastReadProgress ||
      versePositionsRef.current.size === 0
    ) {
      return;
    }

    // Priority 1: Use external scrollPosition from URL params
    if (externalScrollPosition !== undefined && externalScrollPosition > 0) {
      hasScrolledRef.current = true;
      console.log('[VERSE_SCROLL] Scrolling to EXTERNAL position - External ScrollPosition:', externalScrollPosition, 'Verse:', lastReadProgress.verseNumber);
      // Use longer timeout to ensure content is rendered
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, externalScrollPosition - 100),
          animated: false,
        });
        console.log('[VERSE_SCROLL] EXTERNAL scroll executed - Y:', externalScrollPosition - 100);
      }, 300);
      return;
    }

    // Priority 2: Prefer stored scrollPosition if available
    if (lastReadProgress.scrollPosition !== undefined && lastReadProgress.scrollPosition > 0) {
      hasScrolledRef.current = true;
      console.log('[VERSE_SCROLL] Scrolling to STORED position - ScrollPosition:', lastReadProgress.scrollPosition, 'Verse:', lastReadProgress.verseNumber);
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, lastReadProgress.scrollPosition! - 100),
          animated: false,
        });
        console.log('[VERSE_SCROLL] STORED scroll executed - Y:', (lastReadProgress.scrollPosition ?? 0) - 100);
      }, 300);
      return;
    }

    // Priority 3: Fallback - calculate from verse positions
    if (versePositionsRef.current.size > 0) {
      const versePos = versePositionsRef.current.get(lastReadProgress.verseNumber);
      if (versePos) {
        hasScrolledRef.current = true;
        console.log('[VERSE_SCROLL] Scrolling to CALCULATED position - Verse:', lastReadProgress.verseNumber, 'Calculated Y:', versePos.y);
        setTimeout(() => {
          scrollRef.current?.scrollTo({
            y: Math.max(0, versePos.y - 100),
            animated: false,
          });
          console.log('[VERSE_SCROLL] CALCULATED scroll executed - Y:', versePos.y - 100);
        }, 300);
      }
    }
  }, [isFromExternalNav, lastReadProgress, externalScrollPosition]);

  return {
    scrollRef,
    storeVersePosition,
    checkAndScroll,
  };
}
