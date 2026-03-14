import { TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

interface SurahsHeaderProps {
  listView: 'surahs' | 'juz';
  onToggleSurahs: () => void;
  onToggleJuz: () => void;
  tintColor: string;
  textColor: string;
  backgroundColor: string;
}

export function SurahsHeader({
  listView,
  onToggleSurahs,
  onToggleJuz,
  tintColor,
  textColor,
  backgroundColor,
}: SurahsHeaderProps) {
  return (
    <ThemedView
      style={{
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 12,
        marginTop: 56,
      }}>
      <ThemedView style={{ marginBottom: 12 }}>
        <ThemedText type="title" style={{ color: textColor }}>
          Baca Alquran
        </ThemedText>
        <ThemedText
          style={{
            marginTop: 8,
            opacity: 0.7,
            color: textColor,
          }}>
          Pilih {listView === 'surahs' ? 'surah' : 'juz'} untuk membaca
        </ThemedText>
      </ThemedView>

      {/* Toggle Buttons */}
      <ThemedView
        style={{
          flexDirection: 'row',
          gap: 8,
          marginBottom: 4,
        }}>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#ccc',
            backgroundColor:
              listView === 'surahs' ? tintColor : backgroundColor,
          }}
          onPress={onToggleSurahs}>
          <ThemedText
            style={{
              color:
                listView === 'surahs' ? backgroundColor : textColor,
              fontWeight: '600',
              fontSize: 12,
            }}>
            Surahs
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 10,
            paddingHorizontal: 12,
            borderRadius: 8,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: '#ccc',
            backgroundColor: listView === 'juz' ? tintColor : backgroundColor,
          }}
          onPress={onToggleJuz}>
          <ThemedText
            style={{
              color: listView === 'juz' ? backgroundColor : textColor,
              fontWeight: '600',
              fontSize: 12,
            }}>
            Juz
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}
