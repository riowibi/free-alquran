import { FlatList, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { QuranSurah } from '@/types/quran';
import { useMemo } from 'react';

interface SurahsListProps {
  surahs: QuranSurah[];
  onSurahSelect: (surah: QuranSurah) => void;
  tintColor: string;
  textColor: string;
  backgroundColor: string;
  iconColor: string;
}

export function SurahsList({
  surahs,
  onSurahSelect,
  tintColor,
  textColor,
  backgroundColor,
  iconColor,
}: SurahsListProps) {
  const uniqueSurahs = useMemo(() => {
    const seenNumbers = new Set<number>();
    return surahs
      .filter((surah) => {
        if (seenNumbers.has(surah.number)) {
          return false;
        }
        seenNumbers.add(surah.number);
        return true;
      })
      .sort((a, b) => a.number - b.number);
  }, [surahs]);

  return (
    <FlatList
      data={uniqueSurahs}
      keyExtractor={(item) => item.number.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={{
            borderWidth: 2,
            borderRadius: 14,
            padding: 16,
            marginBottom: 12,
            borderColor: tintColor,
            backgroundColor,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 3,
          }}
          onPress={() => onSurahSelect(item)}>
          <ThemedView
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <ThemedView
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: tintColor,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ThemedText
                style={{ color: backgroundColor, fontWeight: '700' }}>
                {item.number}
              </ThemedText>
            </ThemedView>
            <ThemedView style={{ flex: 1, marginLeft: 12 }}>
              <ThemedText
                style={{ marginTop: 4, opacity: 1, fontSize: 16, color: textColor }}>
                {item.englishName} • {item.numberOfAyahs} Ayat
              </ThemedText>
            </ThemedView>
            <IconSymbol name="chevron.right" size={24} color={iconColor} />
          </ThemedView>
        </TouchableOpacity>
      )}
      scrollEnabled={true}
      contentContainerStyle={{
        paddingHorizontal: 16,
        paddingVertical: 20,
      }}
    />
  );
}
