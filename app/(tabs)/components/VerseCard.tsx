import React, { TouchableOpacity, View } from 'react-native';
import { useRef, useCallback, memo } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { TajwidDisplay } from '@/components/tajweed-display';
import { TransliterationService } from '@/services/transliteration';
import { VerseSeparator } from './VerseSeparator';
import { QuranVerse, ReadingProgress } from '@/types/quran';

// Debug flag for performance logging
const DEBUG_VERSE_CARD = false;

interface VerseCardProps {
  verse: QuranVerse;
  surahNumber: number;
  isLastVerse: boolean;
  lastReadProgress: ReadingProgress | null;
  isBookmarked: boolean;
  onVersePress: (surahNum: number, verseNum: number) => void;
  onVerseLongPress: (verseNum: number, text: string, surahNum: number) => void;
  onLayout?: (verseNumber: number, y: number, height: number) => void;
  onQuickButtonPress: (surahNum: number, verseNum: number, scrollPosition?: number) => void;
  onBookmarkPress: (surahNum: number, verseNum: number, text: string) => Promise<void>;
  tintColor: string;
  textColor: string;
  backgroundColor: string;
}

/**
 * Custom comparison for memo optimization
 * Compares only data that affects rendering, ignoring function references
 */
const arePropsEqual = (prevProps: VerseCardProps, nextProps: VerseCardProps) => {
  return (
    prevProps.verse.number === nextProps.verse.number &&
    prevProps.surahNumber === nextProps.surahNumber &&
    prevProps.isBookmarked === nextProps.isBookmarked &&
    prevProps.isLastVerse === nextProps.isLastVerse &&
    prevProps.tintColor === nextProps.tintColor &&
    prevProps.textColor === nextProps.textColor &&
    prevProps.backgroundColor === nextProps.backgroundColor &&
    prevProps.lastReadProgress?.verseNumber === nextProps.lastReadProgress?.verseNumber &&
    prevProps.lastReadProgress?.surahNumber === nextProps.lastReadProgress?.surahNumber
  );
};

function VerseCardComponent({
  verse,
  surahNumber,
  isLastVerse,
  lastReadProgress,
  isBookmarked,
  onVersePress,
  onVerseLongPress,
  onLayout,
  onQuickButtonPress,
  onBookmarkPress,
  tintColor,
  textColor,
  backgroundColor,
}: VerseCardProps) {
  // Track Y position for scroll location
  const verseYRef = useRef<number>(0);

  // Memoize callbacks to prevent unnecessary child re-renders
  const handlePress = useCallback(() => {
    DEBUG_VERSE_CARD && console.log('📍 Verse pressed:', `${surahNumber}:${verse.numberInSurah}`);
    onVersePress(surahNumber, verse.numberInSurah);
  }, [surahNumber, verse.numberInSurah, onVersePress]);

  const handleLongPress = useCallback(() => {
    DEBUG_VERSE_CARD && console.log('📍 Verse long pressed:', `${surahNumber}:${verse.numberInSurah}`);
    onVerseLongPress(verse.numberInSurah, verse.text, surahNumber);
  }, [surahNumber, verse.numberInSurah, verse.text, onVerseLongPress]);

  const handleLayout = useCallback((event: any) => {
    const { y, height } = event.nativeEvent.layout;
    verseYRef.current = y;
    DEBUG_VERSE_CARD && console.log('📐 Layout:', `Verse ${verse.numberInSurah} at Y: ${y}`);
    onLayout?.(verse.numberInSurah, y, height);
  }, [verse.numberInSurah, onLayout]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
      onLayout={handleLayout}
      style={[
        {
          padding: 20,
          borderRadius: 16,
          marginBottom: 20,
          borderWidth: 2,
          backgroundColor,
          borderColor: tintColor,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 3,
        },
      ]}>
      {/* Arabic Text */}
      <View style={{ marginVertical: 0 }}>
        <TajwidDisplay text={verse.text} fontSize={26} lineHeight={40} />
      </View>

      {/* Decorative line */}
      <ThemedView
        style={{
          height: 1,
          backgroundColor: tintColor,
          opacity: 0.2,
          marginVertical: 8,
        }}
      />

      {/* Transliteration */}
      <ThemedText
        style={{
          fontSize: 14,
          marginTop: 4,
          lineHeight: 22,
          textAlign: 'left',
          fontStyle: 'italic',
          opacity: 0.9,
          color: tintColor,
        }}>
        {verse.transliteration && verse.transliteration.length > 0
          ? TransliterationService.toSimpleIndonesian(verse.transliteration)
          : '(Transliterasi tidak tersedia)'}
      </ThemedText>

      {/* Indonesian Translation */}
      <ThemedText
        style={{
          fontSize: 14,
          marginTop: 12,
          lineHeight: 24,
          textAlign: 'left',
          opacity: 0.9,
          fontWeight: '500',
          color: textColor,
        }}>
        {verse.indonesianTranslation && verse.indonesianTranslation.length > 0
          ? verse.indonesianTranslation
          : '(Terjemahan tidak tersedia)'}
      </ThemedText>

      {/* Verse Separator with Quick Buttons */}
      <VerseSeparator
        verseNumber={verse.numberInSurah}
        surahNumber={surahNumber}
        text={verse.text}
        lastReadProgress={lastReadProgress}
        isLastVerse={isLastVerse}
        onQuickButtonPress={(surahNum, verseNum) => 
          onQuickButtonPress(surahNum, verseNum, verseYRef.current)
        }
        onBookmarkPress={onBookmarkPress}
        isBookmarked={isBookmarked}
        tintColor={tintColor}
        textColor={textColor}
        backgroundColor={backgroundColor}
      />
    </TouchableOpacity>
  );
}

// Export memoized component for better performance
export const VerseCard = memo(VerseCardComponent, arePropsEqual);
