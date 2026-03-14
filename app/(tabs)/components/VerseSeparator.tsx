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
  onBookmarkPress: (surahNum: number, verseNum: number, text: string) => void;
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
  if (isLastVerse) return null;

  return (
    <ThemedView
      style={{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
        gap: 12,
      }}>
      <ThemedView
        style={{ flex: 1, height: 1, backgroundColor: tintColor, opacity: 0.15 }}
      />

      {/* Last Read Button */}
      <QuickButtonLastRead
        surahNumber={surahNumber}
        verseNumber={verseNumber}
        lastReadProgress={lastReadProgress}
        onPress={() => onQuickButtonPress(surahNumber, verseNumber)}
        tintColor={tintColor}
        textColor={textColor}
      />

      {/* Verse Number */}
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

      {/* Bookmark Button */}
      <TouchableOpacity
        onPress={() => {
          onBookmarkPress(surahNumber, verseNumber, text);
          Alert.alert('Success', 'Verse bookmarked successfully');
        }}
        style={{ padding: 6, opacity: 0.7 }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <IconSymbol
          name={isBookmarked ? 'bookmark.fill' : 'bookmark'}
          size={16}
          color={textColor}
        />
      </TouchableOpacity>

      <ThemedView
        style={{ flex: 1, height: 1, backgroundColor: tintColor, opacity: 0.15 }}
      />
    </ThemedView>
  );
}
