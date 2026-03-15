import { TouchableOpacity, View } from 'react-native';
import { useRef } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { TajwidDisplay } from '@/components/tajweed-display';
import { TransliterationService } from '@/services/transliteration';
import { VerseSeparator } from './VerseSeparator';
import { QuranVerse, ReadingProgress } from '@/types/quran';

interface VerseCardProps {
  verse: QuranVerse;
  surahNumber: number;
  isLastVerse: boolean;
  lastReadProgress: ReadingProgress | null;
  isBookmarked: boolean;
  onVersePress: (surahNum: number, verseNum: number) => void;
  onVerseLongPress: (verseNum: number, text: string, surahNum: number) => void;
  onLayout: (verseNumber: number, y: number, height: number) => void;
  onQuickButtonPress: (surahNum: number, verseNum: number, scrollPosition?: number) => void;
  onBookmarkPress: (surahNum: number, verseNum: number, text: string) => Promise<void>;
  tintColor: string;
  textColor: string;
  backgroundColor: string;
}

export function VerseCard({
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

  return (
    <TouchableOpacity
      onPress={() => {
        console.log('[VERSE_CARD] Verse card pressed - Surah:', surahNumber, 'Verse:', verse.numberInSurah);
        onVersePress(surahNumber, verse.numberInSurah);
      }}
      onLongPress={() => {
        console.log('[VERSE_CARD] Verse card long pressed - Surah:', surahNumber, 'Verse:', verse.numberInSurah);
        onVerseLongPress(verse.numberInSurah, verse.text, surahNumber);
      }}
      activeOpacity={0.7}
      onLayout={(event) => {
        const { y, height } = event.nativeEvent.layout;
        verseYRef.current = y; // Store Y position
        console.log('[VERSE_CARD] Layout calculated - Verse:', verse.numberInSurah, 'Y Position:', y, 'Height:', height);
        onLayout(verse.numberInSurah, y, height);
      }}
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
