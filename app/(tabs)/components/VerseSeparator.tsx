import { Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { QuickButtonLastRead } from './QuickButtonLastRead';
import { TouchableOpacity } from 'react-native';
import { ReadingProgress } from '@/types/quran';

interface VerseSeparatorProps {
  verseNumber: number;
  surahNumber: number;
  text: string;
  lastReadProgress: ReadingProgress | null;
  isLastVerse: boolean;
  onQuickButtonPress: (surahNum: number, verseNum: number) => void;
  onBookmarkPress: (surahNum: number, verseNum: number, text: string) => Promise<void>;
  isBookmarked: boolean;
  tintColor: string;
  textColor: string;
  backgroundColor: string;
}

export function VerseSeparator({
  verseNumber,
  surahNumber,
  text,
  lastReadProgress,
  isLastVerse,
  onQuickButtonPress,
  onBookmarkPress,
  isBookmarked,
  tintColor,
  textColor,
  backgroundColor,
}: VerseSeparatorProps) {
  return (
    <ThemedView
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        gap: 12,
      }}>
      {/* Left line - only for non-last verses */}
      {!isLastVerse && (
        <ThemedView
          style={{ flex: 1, height: 1, backgroundColor: tintColor, opacity: 0.15 }}
        />
      )}

      {/* Last Read Button - always show */}
      <QuickButtonLastRead
        surahNumber={surahNumber}
        verseNumber={verseNumber}
        lastReadProgress={lastReadProgress}
        onPress={() => {
          console.log('[VERSE_SEPARATOR] Quick button (Last Read) pressed - Surah:', surahNumber, 'Verse:', verseNumber);
          onQuickButtonPress(surahNumber, verseNumber);
        }}
        tintColor={tintColor}
        textColor={textColor}
      />

      {/* Verse Number - always show */}
      <ThemedView
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: tintColor,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ThemedText
          style={{ color: backgroundColor, fontSize: 12, fontWeight: '600' }}>
          {verseNumber}
        </ThemedText>
      </ThemedView>

      {/* Bookmark Button - always show */}
      <TouchableOpacity
        onPress={async () => {
          console.log('[VERSE_SEPARATOR] Bookmark button pressed - Surah:', surahNumber, 'Verse:', verseNumber, 'Is Bookmarked:', isBookmarked);
          await onBookmarkPress(surahNumber, verseNumber, text);
          Alert.alert('Success', isBookmarked ? 'Bookmark removed' : 'Verse bookmarked successfully');
        }}
        style={{ padding: 6, opacity: 0.7 }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <IconSymbol
          name={isBookmarked ? 'bookmark.fill' : 'bookmark'}
          size={16}
          color={textColor}
        />
      </TouchableOpacity>

      {/* Right line - only for non-last verses */}
      {!isLastVerse && (
        <ThemedView
          style={{ flex: 1, height: 1, backgroundColor: tintColor, opacity: 0.15 }}
        />
      )}
    </ThemedView>
  );
}
