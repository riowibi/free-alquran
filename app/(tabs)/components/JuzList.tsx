import { FlatList, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { JuzGroup } from '@/types/quran';

interface JuzListProps {
  juzGroups: JuzGroup[];
  onJuzSelect: (juz: JuzGroup) => void;
  tintColor: string;
  textColor: string;
  backgroundColor: string;
  iconColor: string;
}

export function JuzList({
  juzGroups,
  onJuzSelect,
  tintColor,
  textColor,
  backgroundColor,
  iconColor,
}: JuzListProps) {
  return (
    <FlatList
      data={juzGroups}
      keyExtractor={(item) => item.juzNumber.toString()}
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
          onPress={() => onJuzSelect(item)}>
          <ThemedView
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <ThemedView
              style={{
                width: 50,
                height: 50,
                borderRadius: 25,
                backgroundColor: tintColor,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ThemedText
                style={{
                  color: backgroundColor,
                  fontWeight: '700',
                  fontSize: 16,
                }}>
                {item.juzNumber}
              </ThemedText>
            </ThemedView>
            <ThemedView style={{ flex: 1, marginLeft: 12 }}>
              <ThemedText
                type="subtitle"
                style={{ color: textColor }}>
                Juz {item.juzNumber}
              </ThemedText>
              <ThemedText
                style={{
                  marginTop: 4,
                  opacity: 0.7,
                  fontSize: 12,
                  color: textColor,
                }}>
                {item.surahs.length > 0 && `${item.surahs[0].surahName}`}
                {item.surahs.length > 1 &&
                  ` - ${item.surahs[item.surahs.length - 1].surahName}`}
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
