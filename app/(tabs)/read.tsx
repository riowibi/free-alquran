import { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useQuran } from '@/hooks/use-quran';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { QuranSurah } from '@/types/quran';

export default function ReadScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const { surahs, isLoading, updateReadingProgress, addBookmark, isVerseBookmarked } = useQuran();

  const [view, setView] = useState<'surahs' | 'verses'>('surahs');
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null);

  // Get surah from params if provided
  useEffect(() => {
    if (params.surah && surahs.length > 0) {
      const surahNum = parseInt(params.surah as string);
      const surah = surahs.find(s => s.number === surahNum);
      if (surah) {
        setSelectedSurah(surah);
        setView('verses');
      }
    }
  }, [params.surah, surahs]);

  const handleSurahSelect = (surah: QuranSurah) => {
    setSelectedSurah(surah);
    setView('verses');
  };

  const handleVerseLongPress = (verseNumber: number, text: string) => {
    if (!selectedSurah) return;

    Alert.alert('Verse Options', '', [
      {
        text: 'Add Bookmark',
        onPress: () => {
          addBookmark(selectedSurah.number, verseNumber, text);
          Alert.alert('Success', 'Verse bookmarked successfully');
        },
      },
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
    ]);
  };

  const handleVersePress = useCallback(
    (surahNum: number, verseNum: number) => {
      updateReadingProgress(surahNum, verseNum);
    },
    [updateReadingProgress]
  );

  const SurahsList = () => (
    <FlatList
      data={surahs}
      keyExtractor={item => item.number.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.surahCard, { borderColor: colors.tint }]}
          onPress={() => handleSurahSelect(item)}>
          <ThemedView style={styles.surahContent}>
            <ThemedView style={[styles.surahNumber, { backgroundColor: colors.tint }]}>
              <ThemedText style={{ color: '#fff', fontWeight: '700' }}>
                {item.number}
              </ThemedText>
            </ThemedView>
            <ThemedView style={{ flex: 1, marginLeft: 12 }}>
              <ThemedText type="subtitle" numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={{ marginTop: 4, opacity: 0.7, fontSize: 12 }}>
                {item.englishName} • {item.numberOfAyahs} Ayahs
              </ThemedText>
            </ThemedView>
            <IconSymbol name="chevron.right" size={20} color={colors.icon} />
          </ThemedView>
        </TouchableOpacity>
      )}
      scrollEnabled={true}
      contentContainerStyle={styles.listContent}
    />
  );

  const VersesList = () => (
    <ScrollView style={{ flex: 1 }}>
      <ThemedView style={styles.verseHeader}>
        <TouchableOpacity onPress={() => setView('surahs')} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.tint} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1, marginLeft: 12 }}>
          <ThemedText type="title">{selectedSurah?.name}</ThemedText>
          <ThemedText style={{ opacity: 0.7, fontSize: 12 }}>
            {selectedSurah?.englishNameTranslation}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.versesContainer}>
        {selectedSurah?.verses.map(verse => (
          <TouchableOpacity
            key={verse.number}
            onPress={() => handleVersePress(selectedSurah.number, verse.numberInSurah)}
            onLongPress={() => handleVerseLongPress(verse.numberInSurah, verse.text)}
            activeOpacity={0.7}
            style={[
              styles.verseCard,
              {
                backgroundColor: colors.background,
                borderColor: colors.icon,
              },
            ]}>
            <ThemedView style={styles.verseTop}>
              <ThemedView style={[styles.verseNumber, { backgroundColor: colors.tint }]}>
                <ThemedText style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                  {verse.numberInSurah}
                </ThemedText>
              </ThemedView>
              {isVerseBookmarked(selectedSurah.number, verse.numberInSurah) && (
                <IconSymbol name="bookmark.fill" size={16} color={colors.tint} />
              )}
            </ThemedView>
            <ThemedText
              style={{
                fontSize: 20,
                marginTop: 12,
                lineHeight: 32,
                textAlign: 'right',
                fontWeight: '600',
              }}>
              {verse.text}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ScrollView>
  );

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </ThemedView>
      ) : view === 'surahs' ? (
        <>
          <ThemedView style={styles.header}>
            <ThemedText type="title">Baca Alquran</ThemedText>
            <ThemedText style={{ marginTop: 8, opacity: 0.7 }}>
              Pilih surah untuk membaca
            </ThemedText>
          </ThemedView>
          <SurahsList />
        </>
      ) : (
        <VersesList />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  surahCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  surahContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  surahNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verseHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  versesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  verseCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  verseTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  verseNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
