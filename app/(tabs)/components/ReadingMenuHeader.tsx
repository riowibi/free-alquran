import { TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ReadingMenuHeaderProps {
  onBacaQuran: () => void;
  onTerakhirBaca: () => void;
  hasReadingHistory: boolean;
  tintColor: string;
  textColor: string;
  backgroundColor: string;
}

export function ReadingMenuHeader({
  onBacaQuran,
  onTerakhirBaca,
  hasReadingHistory,
  tintColor,
  textColor,
  backgroundColor,
}: ReadingMenuHeaderProps) {
  return (
    <ThemedView
      style={{
        backgroundColor,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: tintColor,
        flexDirection: 'row',
        gap: 8,
      }}>
      {/* Baca Quran Button */}
      <TouchableOpacity
        onPress={onBacaQuran}
        style={{
          flex: 1,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: tintColor,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}>
        <IconSymbol name="book.fill" size={16} color={backgroundColor} />
        <ThemedText
          style={{
            color: backgroundColor,
            fontWeight: '600',
            fontSize: 13,
          }}>
          Baca Quran
        </ThemedText>
      </TouchableOpacity>

      {/* Terakhir Baca Button */}
      <TouchableOpacity
        onPress={onTerakhirBaca}
        disabled={!hasReadingHistory}
        style={{
          flex: 1,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: hasReadingHistory ? tintColor : `${tintColor}40`,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          opacity: hasReadingHistory ? 1 : 0.5,
        }}>
        <IconSymbol
          name="clock.fill"
          size={16}
          color={backgroundColor}
        />
        <ThemedText
          style={{
            color: backgroundColor,
            fontWeight: '600',
            fontSize: 13,
          }}>
          Terakhir
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}
