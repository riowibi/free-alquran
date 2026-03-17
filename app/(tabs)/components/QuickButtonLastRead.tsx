import { useMemo, useCallback } from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ReadingProgress } from '@/types/quran';

interface QuickButtonLastReadProps {
  surahNumber: number;
  verseNumber: number;
  lastReadProgress: ReadingProgress | null;
  onPress: () => void;
  tintColor: string;
  textColor: string;
}

export function QuickButtonLastRead({
  surahNumber,
  verseNumber,
  lastReadProgress,
  onPress,
  tintColor,
  textColor,
}: QuickButtonLastReadProps) {
  const isLastRead = useMemo(() => {
    return (
      lastReadProgress?.surahNumber === surahNumber &&
      lastReadProgress?.verseNumber === verseNumber
    );
  }, [lastReadProgress, surahNumber, verseNumber]);

  // Handle save with confirmation dialog
  const handleSaveLastRead = useCallback(() => {
    Alert.alert(
      'Simpan Terakhir Baca',
      `Simpan ayat ini sebagai bacaan terakhir?\n\nSurah ${surahNumber} : ${verseNumber}`,
      [
        {
          text: 'Batal',
          onPress: () => console.log('[QUICK_BUTTON] User cancelled save'),
          style: 'cancel',
        },
        {
          text: 'Simpan',
          onPress: () => {
            console.log('[QUICK_BUTTON] User confirmed save - Surah:', surahNumber, 'Verse:', verseNumber);
            onPress();
          },
          style: 'default',
        },
      ],
      { cancelable: true }
    );
  }, [surahNumber, verseNumber, onPress]);

  return (
    <TouchableOpacity
      onPress={handleSaveLastRead}
      style={{ padding: 6, opacity: 1 }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
      <IconSymbol
        name="clock.fill"
        size={16}
        color={isLastRead ? tintColor : textColor}
      />
    </TouchableOpacity>
  );
}
