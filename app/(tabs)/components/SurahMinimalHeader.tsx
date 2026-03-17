import { TouchableOpacity, View, Alert } from 'react-native';
import { useCallback } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface SurahMinimalHeaderProps {
  surahName: string;
  surahNumber: number;
  totalSurahs: number;
  currentVerseNumber?: number;
  verseText?: string;
  isBookmarked?: boolean;
  onPreviousSurah: () => void;
  onNextSurah: () => void;
  onSaveLastRead?: () => void;
  onBookmark?: () => void;
  tintColor: string;
  textColor: string;
  backgroundColor: string;
}

export function SurahMinimalHeader({
  surahName,
  surahNumber,
  totalSurahs,
  currentVerseNumber,
  verseText,
  isBookmarked,
  onPreviousSurah,
  onNextSurah,
  onSaveLastRead,
  onBookmark,
  tintColor,
  textColor,
  backgroundColor,
}: SurahMinimalHeaderProps) {
  const canGoPrevious = surahNumber > 1;
  const canGoNext = surahNumber < totalSurahs;

  // Handle save last read with confirmation
  const handleSaveLastRead = useCallback(() => {
    Alert.alert(
      'Simpan Terakhir Baca',
      `Simpan ayat ini sebagai bacaan terakhir?\n\nSurah ${surahNumber} : ${currentVerseNumber}`,
      [
        {
          text: 'Batal',
          onPress: () => console.log('[MINIMAL_HEADER] User cancelled save'),
          style: 'cancel',
        },
        {
          text: 'Simpan',
          onPress: () => {
            console.log('[MINIMAL_HEADER] User confirmed save - Surah:', surahNumber, 'Verse:', currentVerseNumber);
            onSaveLastRead?.();
          },
          style: 'default',
        },
      ],
      { cancelable: true }
    );
  }, [surahNumber, currentVerseNumber, onSaveLastRead]);

  // Handle bookmark with confirmation
  const handleBookmark = useCallback(() => {
    Alert.alert(
      isBookmarked ? 'Hapus Bookmark' : 'Tambah Bookmark',
      isBookmarked
        ? `Hapus bookmark dari ayat ${currentVerseNumber}?`
        : `Simpan ayat ${currentVerseNumber} sebagai bookmark?`,
      [
        {
          text: 'Batal',
          onPress: () => console.log('[MINIMAL_HEADER] User cancelled bookmark'),
          style: 'cancel',
        },
        {
          text: isBookmarked ? 'Hapus' : 'Simpan',
          onPress: () => {
            console.log('[MINIMAL_HEADER] User confirmed bookmark - Surah:', surahNumber, 'Verse:', currentVerseNumber, 'IsBookmarked:', isBookmarked);
            onBookmark?.();
          },
          style: isBookmarked ? 'destructive' : 'default',
        },
      ],
      { cancelable: true }
    );
  }, [surahNumber, currentVerseNumber, isBookmarked, onBookmark]);

  return (
    <ThemedView
      style={{
        backgroundColor,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: tintColor,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}>
      {/* Previous Button */}
      <TouchableOpacity
        onPress={onPreviousSurah}
        disabled={!canGoPrevious}
        style={{
          padding: 8,
          opacity: canGoPrevious ? 1 : 0.3,
        }}>
        <IconSymbol name="chevron.left" size={24} color={textColor} />
      </TouchableOpacity>

      {/* Surah Info (Center) */}
      <View style={{ flex: 1, alignItems: 'center' }}>
        <ThemedText
          style={{
            fontSize: 14,
            fontWeight: '600',
            color: textColor,
          }}>
          {surahName}
        </ThemedText>
        <ThemedText
          style={{
            fontSize: 12,
            color: textColor,
            opacity: 0.7,
            marginTop: 2,
          }}>
          Surat {surahNumber}/{totalSurahs}
        </ThemedText>
      </View>

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
        {/* Save Last Read Button */}
        {onSaveLastRead && currentVerseNumber !== undefined && (
          <TouchableOpacity
            onPress={handleSaveLastRead}
            style={{ padding: 8 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <IconSymbol name="clock.fill" size={20} color={tintColor} />
          </TouchableOpacity>
        )}

        {/* Bookmark Button */}
        {onBookmark && currentVerseNumber !== undefined && (
          <TouchableOpacity
            onPress={handleBookmark}
            style={{ padding: 8 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <IconSymbol
              name={isBookmarked ? 'bookmark.fill' : 'bookmark'}
              size={20}
              color={textColor}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Next Button */}
      <TouchableOpacity
        onPress={onNextSurah}
        disabled={!canGoNext}
        style={{
          padding: 8,
          opacity: canGoNext ? 1 : 0.3,
        }}>
        <IconSymbol name="chevron.right" size={24} color={textColor} />
      </TouchableOpacity>
    </ThemedView>
  );
}
