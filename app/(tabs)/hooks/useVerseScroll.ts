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
}

export function useVerseScroll(props: UseVerseScrollProps) {
  const { isFromExternalNav, lastReadProgress, selectedId } = props;
  
  const scrollRef = useRef<ScrollView>(null);
  const versePositionsRef = useRef<Map<number, VersePosition>>(new Map());
  const hasScrolledRef = useRef(false);

  // Reset scroll state when surah/juz changes
  useEffect(() => {
    if (!isFromExternalNav) {
      hasScrolledRef.current = true;
      return;
    }
    hasScrolledRef.current = false;
    versePositionsRef.current.clear();
  }, [selectedId, isFromExternalNav]);

  // Store verse position
  const storeVersePosition = useCallback(
    (verseNumber: number, y: number, height: number) => {
      versePositionsRef.current.set(verseNumber, { y, height });
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

    const versePos = versePositionsRef.current.get(lastReadProgress.verseNumber);
    if (versePos) {
      hasScrolledRef.current = true;
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          y: Math.max(0, versePos.y - 100),
          animated: true,
        });
      }, 50);
    }
  }, [isFromExternalNav, lastReadProgress]);

  return {
    scrollRef,
    storeVersePosition,
    checkAndScroll,
  };
}
