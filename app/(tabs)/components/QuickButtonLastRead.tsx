import { useMemo } from 'react';
import { TouchableOpacity } from 'react-native';
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

  return (
    <TouchableOpacity
      onPress={onPress}
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
