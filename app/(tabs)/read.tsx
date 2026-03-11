import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  SectionList,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TajwidDisplay } from '@/components/tajweed-display';
import { useQuran } from '@/hooks/use-quran';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { TransliterationService } from '@/services/transliteration';
import { QuranSurah, QuranVerse } from '@/types/quran';

interface JuzGroup {
  juzNumber: number;
  surahs: { surahNumber: number; surahName: string; verses: QuranVerse[] }[];
}

export default function ReadScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();
  const { surahs, isLoading, updateReadingProgress, addBookmark, isVerseBookmarked } = useQuran();

  const [view, setView] = useState<'surahs' | 'verses' | 'juz'>('surahs');
  const [listView, setListView] = useState<'surahs' | 'juz'>('surahs');
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null);
  const [selectedJuz, setSelectedJuz] = useState<JuzGroup | null>(null);

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

  // Group surahs by juz
  const juzGroups = useMemo(() => {
    const groups: { [key: number]: JuzGroup } = {};
    
    surahs.forEach(surah => {
      surah.verses.forEach(verse => {
        const juzNum = verse.juz;
        
        if (!groups[juzNum]) {
          groups[juzNum] = {
            juzNumber: juzNum,
            surahs: [],
          };
        }
        
        let surahInJuz = groups[juzNum].surahs.find(s => s.surahNumber === surah.number);
        if (!surahInJuz) {
          surahInJuz = {
            surahNumber: surah.number,
            surahName: surah.name,
            verses: [],
          };
          groups[juzNum].surahs.push(surahInJuz);
        }
        
        if (!surahInJuz.verses.find(v => v.number === verse.number)) {
          surahInJuz.verses.push(verse);
        }
      });
    });
    
    return Object.values(groups).sort((a, b) => a.juzNumber - b.juzNumber);
  }, [surahs]);

  const handleSurahSelect = (surah: QuranSurah) => {
    setSelectedSurah(surah);
    setView('verses');
  };

  const handleJuzSelect = (juz: JuzGroup) => {
    setSelectedJuz(juz);
    setView('juz');
  };

  const handleVerseLongPress = (verseNumber: number, text: string, surahNum: number) => {
    Alert.alert('Verse Options', '', [
      {
        text: 'Add Bookmark',
        onPress: () => {
          addBookmark(surahNum, verseNumber, text);
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
              <ThemedText style={{ color: colors.background, fontWeight: '700' }}>
                {item.number}
              </ThemedText>
            </ThemedView>
            <ThemedView style={{ flex: 1, marginLeft: 12 }}>
              {/* <ThemedText type="subtitle" numberOfLines={1}>
                {item.name}
              </ThemedText> */}
              <ThemedText style={{ marginTop: 4, opacity: 1, fontSize: 16 }}>
                {item.englishName} • {item.numberOfAyahs} Ayat
              </ThemedText>
            </ThemedView>
            <IconSymbol name="chevron.right" size={24} color={colors.icon} />
          </ThemedView>
        </TouchableOpacity>
      )}
      scrollEnabled={true}
      contentContainerStyle={styles.listContent}
    />
  );

  const JuzList = () => (
    <FlatList
      data={juzGroups}
      keyExtractor={item => item.juzNumber.toString()}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[styles.juzCard, { borderColor: colors.tint }]}
          onPress={() => handleJuzSelect(item)}>
          <ThemedView style={styles.juzContent}>
            <ThemedView style={[styles.juzNumber, { backgroundColor: colors.tint }]}>
              <ThemedText style={{ color: colors.background, fontWeight: '700', fontSize: 16 }}>
                {item.juzNumber}
              </ThemedText>
            </ThemedView>
            <ThemedView style={{ flex: 1, marginLeft: 12 }}>
              <ThemedText type="subtitle">
                Juz {item.juzNumber}
              </ThemedText>
              <ThemedText style={{ marginTop: 4, opacity: 0.7, fontSize: 12 }}>
                {item.surahs.length > 0 && `${item.surahs[0].surahName}`}
                {item.surahs.length > 1 && ` - ${item.surahs[item.surahs.length - 1].surahName}`}
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
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedView style={{ flex: 1, marginLeft: 12 }}>
          <ThemedText type="title" style={{ fontWeight: '700', textAlign: 'center' }}>
            {selectedSurah?.englishName}
          </ThemedText>
          <ThemedText style={{ opacity: 1, fontSize: 16, textAlign: 'center', marginTop: 4 }}>
            Juz - {juzGroups[0]?.juzNumber}  •  {selectedSurah?.englishNameTranslation}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.versesContainer}>
        {selectedSurah?.verses.map((verse, idx) => {
          // Debug: log first verse
          if (idx === 0) {
            console.log('🔍 Rendering first verse:', {
              numberInSurah: verse.numberInSurah,
              text: verse.text?.substring(0, 30),
              transliteration: verse.transliteration?.substring(0, 30),
              indonesianTranslation: verse.indonesianTranslation?.substring(0, 30),
            });
          }
          
          return (
            <TouchableOpacity
              key={verse.number}
              onPress={() => handleVersePress(selectedSurah.number, verse.numberInSurah)}
              onLongPress={() => handleVerseLongPress(verse.numberInSurah, verse.text, selectedSurah.number)}
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
                  <ThemedText style={{ color: colors.background, fontSize: 12, fontWeight: '600' }}>
                    {verse.numberInSurah}
                  </ThemedText>
                </ThemedView>
                {isVerseBookmarked(selectedSurah.number, verse.numberInSurah) && (
                  <IconSymbol name="bookmark.fill" size={16} color={colors.tint} />
                )}
              </ThemedView>

              {/* Ayat (Arabic) with Tajweed Coloring */}
              <View style={{ marginTop: 12 }}>
                <TajwidDisplay 
                  text={verse.text} 
                  fontSize={24}
                  lineHeight={36}
                />
              </View>

              {/* Indonesian Transliteration */}
              <ThemedText
                style={{
                  fontSize: 14,
                  marginTop: 12,
                  lineHeight: 22,
                  textAlign: 'left',
                  fontStyle: 'italic',
                  opacity: 0.85,
                }}>
                {verse.transliteration && verse.transliteration.length > 0 
                  ? TransliterationService.toSimpleIndonesian(verse.transliteration)
                  : '(Transliterasi tidak tersedia)'}
              </ThemedText>

              {/* Artinya (Indonesian Translation) */}
              <ThemedText
                style={{
                  fontSize: 14,
                  marginTop: 10,
                  lineHeight: 22,
                  textAlign: 'left',
                  opacity: 0.9,
                }}>
                {verse.indonesianTranslation && verse.indonesianTranslation.length > 0 
                  ? verse.indonesianTranslation 
                  : '(Terjemahan tidak tersedia)'}
              </ThemedText>
            </TouchableOpacity>
          );
        })}
      </ThemedView>
    </ScrollView>
  );

  const JuzVersesList = () => {
    if (!selectedJuz) return null;

    return (
      <ScrollView style={{ flex: 1 }}>
        <ThemedView style={styles.verseHeader}>
          <TouchableOpacity onPress={() => setView('surahs')} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.tint} />
          </TouchableOpacity>
          <ThemedView style={{ flex: 1, marginLeft: 12 }}>
            <ThemedText type="title">Juz {selectedJuz.juzNumber}</ThemedText>
            <ThemedText style={{ opacity: 0.7, fontSize: 12 }}>
              Multiple Surahs
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.versesContainer}>
          {selectedJuz.surahs.map(surahData =>
            surahData.verses.map(verse => (
              <TouchableOpacity
                key={verse.number}
                onPress={() => handleVersePress(surahData.surahNumber, verse.numberInSurah)}
                onLongPress={() => handleVerseLongPress(verse.numberInSurah, verse.text, surahData.surahNumber)}
                activeOpacity={0.7}
                style={[
                  styles.verseCard,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.icon,
                  },
                ]}>
                <ThemedView style={styles.verseTop}>
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ThemedView style={[styles.verseNumber, { backgroundColor: colors.tint }]}>
                      <ThemedText style={{ color: '#fff', fontSize: 12, fontWeight: '600' }}>
                        {verse.numberInSurah}
                      </ThemedText>
                    </ThemedView>
                    <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                      {surahData.surahName}
                    </ThemedText>
                  </ThemedView>
                  {isVerseBookmarked(surahData.surahNumber, verse.numberInSurah) && (
                    <IconSymbol name="bookmark.fill" size={16} color={colors.tint} />
                  )}
                </ThemedView>

                {/* Ayat (Arabic) */}
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

                {/* Latin Ayat */}
                <ThemedText
                  style={{
                    fontSize: 14,
                    marginTop: 10,
                    lineHeight: 22,
                    textAlign: 'left',
                    fontStyle: 'italic',
                    opacity: 0.8,
                  }}>
                  {verse.transliteration && verse.transliteration.length > 0 
                    ? verse.transliteration 
                    : '(Transliteration not available)'}
                </ThemedText>

                {/* Artinya (Indonesian Translation) */}
                <ThemedText
                  style={{
                    fontSize: 14,
                    marginTop: 10,
                    lineHeight: 22,
                    textAlign: 'left',
                    opacity: 0.9,
                  }}>
                  {verse.indonesianTranslation && verse.indonesianTranslation.length > 0 
                    ? verse.indonesianTranslation 
                    : '(Terjemahan tidak tersedia)'}
                </ThemedText>
              </TouchableOpacity>
            ))
          )}
        </ThemedView>
      </ScrollView>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {isLoading ? (
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </ThemedView>
      ) : view === 'surahs' ? (
        <>
          <ThemedView style={styles.header}>
            <ThemedView style={styles.headerTop}>
              <ThemedText type="title">Baca Alquran</ThemedText>
              <ThemedText style={{ marginTop: 8, opacity: 0.7 }}>
                Pilih {listView === 'surahs' ? 'surah' : 'juz'} untuk membaca
              </ThemedText>
            </ThemedView>
            
            {/* Toggle Button */}
            <ThemedView style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  listView === 'surahs' && { backgroundColor: colors.tint },
                ]}
                onPress={() => setListView('surahs')}>
                <ThemedText
                  style={{
                    color: listView === 'surahs' ? colors.background : colors.text,
                    fontWeight: '600',
                    fontSize: 12,
                  }}>
                  Surahs
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  listView === 'juz' && { backgroundColor: colors.tint },
                ]}
                onPress={() => setListView('juz')}>
                <ThemedText
                  style={{
                    color: listView === 'juz' ? colors.background : colors.text,
                    fontWeight: '600',
                    fontSize: 12,
                  }}>
                  Juz
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>
          {listView === 'surahs' ? <SurahsList /> : <JuzList />}
        </>
      ) : view === 'verses' ? (
        <VersesList />
      ) : (
        <JuzVersesList />
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
  headerTop: {
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
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
  juzCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  juzContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  juzNumber: {
    width: 50,
    height: 50,
    borderRadius: 25,
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
