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
  BackHandler,
} from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
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

  // Handle Android back button and browser back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        // If we're viewing verses or juz, go back to surahs list
        if (view !== 'surahs') {
          setView('surahs');
          return true; // Prevent default back action
        }
        // If we're already on surahs list, allow default back behavior
        return false;
      };

      const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        backHandler.remove();
      };
    }, [view])
  );

  // Group surahs by juz with deduplication
  const juzGroups = useMemo(() => {
    const groups: { [key: number]: JuzGroup } = {};
    
    // Iterate through all surahs and their verses to build juz groups
    surahs.forEach(surah => {
      // Group verses by juz for this surah
      const versesByJuz = new Map<number, QuranVerse[]>();
      
      surah.verses.forEach(verse => {
        const juzNum = verse.juz;
        if (juzNum) {
          if (!versesByJuz.has(juzNum)) {
            versesByJuz.set(juzNum, []);
          }
          versesByJuz.get(juzNum)!.push(verse);
        }
      });
      
      // Add surah to each juz it belongs to
      versesByJuz.forEach((verses, juzNum) => {
        if (!groups[juzNum]) {
          groups[juzNum] = {
            juzNumber: juzNum,
            surahs: [],
          };
        }
        
        // Check if surah already exists in this juz (deduplication)
        const surahExists = groups[juzNum].surahs.some(s => s.surahNumber === surah.number);
        
        if (!surahExists) {
          groups[juzNum].surahs.push({
            surahNumber: surah.number,
            surahName: surah.name,
            verses: verses, // Only verses that belong to this juz
          });
        }
      });
    });
    
    // Sort surahs within each juz by surah number
    Object.values(groups).forEach(group => {
      group.surahs.sort((a, b) => a.surahNumber - b.surahNumber);
    });
    
    // Return sorted juz groups (1-30)
    const sortedGroups = Object.values(groups).sort((a, b) => a.juzNumber - b.juzNumber);
    console.log(`✅ Loaded Juz groups: ${sortedGroups.map(g => g.juzNumber).join(', ')}`);
    return sortedGroups;
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

  const SurahsList = () => {
    // Deduplicate and sort surahs (1-114)
    const uniqueSurahs = useMemo(() => {
      const seenNumbers = new Set<number>();
      const deduplicated = surahs.filter(surah => {
        if (seenNumbers.has(surah.number)) {
          return false; // Skip duplicate
        }
        seenNumbers.add(surah.number);
        return true;
      });
      // Sort by surah number (1-114)
      return deduplicated.sort((a, b) => a.number - b.number);
    }, [surahs]);

    return (
      <FlatList
        data={uniqueSurahs}
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
  };

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
            <IconSymbol name="chevron.right" size={24} color={colors.icon} />
          </ThemedView>
        </TouchableOpacity>
      )}
      scrollEnabled={true}
      contentContainerStyle={styles.listContent}
    />
  );


  const VersesList = () => (
    <ScrollView style={{ flex: 1 }}>
      <ThemedView style={[styles.verseHeader, { backgroundColor: colors.background, paddingTop: 56 }]}>
        <ThemedView style={{ flex: 1}}>
          <ThemedText type="title" style={{ fontWeight: '700', textAlign: 'left', color: colors.text }}>
            {selectedSurah?.englishName}
          </ThemedText>
          {/* <ThemedView style={{ height: 1, width: '60%', backgroundColor: colors.text, marginVertical: 12, opacity: 0.4 }} /> */}
          <ThemedText style={{ fontSize: 18, textAlign: 'left', color: colors.text, marginTop:4, fontWeight: '600'   }}>
            {selectedSurah?.englishNameTranslation}
          </ThemedText>
          <ThemedText style={{ fontSize: 14, textAlign: 'left', color: colors.text, fontStyle: 'italic', opacity: 0.8}}>
            Juz {juzGroups[0]?.juzNumber} • Surat {selectedSurah?.number} • {selectedSurah?.numberOfAyahs} Ayat • {selectedSurah?.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah'}
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
                  borderColor: colors.tint,
                },
              ]}>
              <View style={{ marginVertical: 0 }}>
                <TajwidDisplay 
                  text={verse.text} 
                  fontSize={26}
                  lineHeight={40}
                />
              </View>

              {/* Decorative line below Arabic text */}
              <ThemedView style={{ height: 1, backgroundColor: colors.tint, opacity: 0.2, marginVertical: 8 }} />

              {/* Indonesian Transliteration */}
              <ThemedText
                style={{
                  fontSize: 14,
                  marginTop: 4,
                  lineHeight: 22,
                  textAlign: 'left',
                  fontStyle: 'italic',
                  opacity: 0.9,
                  color: colors.tint,
                }}>
                {verse.transliteration && verse.transliteration.length > 0 
                  ? TransliterationService.toSimpleIndonesian(verse.transliteration)
                  : '(Transliterasi tidak tersedia)'}
              </ThemedText>

              {/* Artinya (Indonesian Translation) */}
              <ThemedText
                style={{
                  fontSize: 14,
                  marginTop: 12,
                  lineHeight: 24,
                  textAlign: 'left',
                  opacity: 0.9,
                  fontWeight: '500',
                }}>
                {verse.indonesianTranslation && verse.indonesianTranslation.length > 0 
                  ? verse.indonesianTranslation 
                  : '(Terjemahan tidak tersedia)'}
              </ThemedText>

              {/* Decorative element at bottom */}
              {idx < selectedSurah.verses.length - 1 && (
                <ThemedView style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
                  <ThemedView style={{ flex: 1, height: 1, backgroundColor: colors.tint, opacity: 0.15 }} />
                  <ThemedText style={{ marginHorizontal: 12, fontSize: 16, opacity: 0.5 }}>
                    <ThemedView style={[styles.verseNumber, { backgroundColor: colors.tint }]}>
                      <ThemedText style={{ color: colors.background, fontSize: 12, fontWeight: '600' }}>
                        {verse.numberInSurah}
                      </ThemedText>
                    </ThemedView>
                    {isVerseBookmarked(selectedSurah.number, verse.numberInSurah) && (
                      <IconSymbol name="bookmark.fill" size={16} color={colors.tint} />
                    )}
                  </ThemedText>
                  <ThemedView style={{ flex: 1, height: 1, backgroundColor: colors.tint, opacity: 0.15 }} />
                </ThemedView>
              )}
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
        <ThemedView style={[styles.verseHeader, { backgroundColor: colors.background, paddingTop: 56 }]}>
          <ThemedView style={{ flex: 1 }}>
            <ThemedText type="title" style={{ fontWeight: '700', textAlign: 'left', color: colors.text }}>
              Juz {selectedJuz.juzNumber}
            </ThemedText>
            <ThemedText style={{ fontSize: 14, textAlign: 'left', color: colors.text, fontStyle: 'italic', opacity: 0.8, marginTop: 4 }}>
              {selectedJuz.surahs.length} Surah{selectedJuz.surahs.length > 1 ? 's' : ''} • {selectedJuz.surahs[0]?.surahName}
              {selectedJuz.surahs.length > 1 && ` - ${selectedJuz.surahs[selectedJuz.surahs.length - 1]?.surahName}`}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedView style={styles.versesContainer}>
          {selectedJuz.surahs.map((surahData, surahIdx) => (
            <View key={surahData.surahNumber}>
              {/* Surah Header in Juz View */}
              {surahIdx > 0 && (
                <ThemedView style={{ marginBottom: 16, marginTop: 20 }}>
                  <ThemedView style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <ThemedView style={{ flex: 1, height: 1, backgroundColor: colors.tint, opacity: 0.3 }} />
                    <ThemedText style={{ fontSize: 13, fontWeight: '600', color: colors.tint, opacity: 0.8 }}>
                      {surahData.surahName}
                    </ThemedText>
                    <ThemedView style={{ flex: 1, height: 1, backgroundColor: colors.tint, opacity: 0.3 }} />
                  </ThemedView>
                </ThemedView>
              )}

              {surahData.verses.map((verse, verseIdx) => (
                <TouchableOpacity
                  key={verse.number}
                  onPress={() => handleVersePress(surahData.surahNumber, verse.numberInSurah)}
                  onLongPress={() => handleVerseLongPress(verse.numberInSurah, verse.text, surahData.surahNumber)}
                  activeOpacity={0.7}
                  style={[
                    styles.verseCard,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.tint,
                    },
                  ]}>
                  <View style={{ marginVertical: 0 }}>
                    <TajwidDisplay 
                      text={verse.text} 
                      fontSize={26}
                      lineHeight={40}
                    />
                  </View>

                  {/* Decorative line below Arabic text */}
                  <ThemedView style={{ height: 1, backgroundColor: colors.tint, opacity: 0.2, marginVertical: 8 }} />

                  {/* Indonesian Transliteration */}
                  <ThemedText
                    style={{
                      fontSize: 14,
                      marginTop: 4,
                      lineHeight: 22,
                      textAlign: 'left',
                      fontStyle: 'italic',
                      opacity: 0.9,
                      color: colors.tint,
                    }}>
                    {verse.transliteration && verse.transliteration.length > 0 
                      ? TransliterationService.toSimpleIndonesian(verse.transliteration)
                      : '(Transliterasi tidak tersedia)'}
                  </ThemedText>

                  {/* Artinya (Indonesian Translation) */}
                  <ThemedText
                    style={{
                      fontSize: 14,
                      marginTop: 12,
                      lineHeight: 24,
                      textAlign: 'left',
                      opacity: 0.9,
                      fontWeight: '500',
                    }}>
                    {verse.indonesianTranslation && verse.indonesianTranslation.length > 0 
                      ? verse.indonesianTranslation 
                      : '(Terjemahan tidak tersedia)'}
                  </ThemedText>

                  {/* Decorative element at bottom */}
                  {verseIdx < surahData.verses.length - 1 && (
                    <ThemedView style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 }}>
                      <ThemedView style={{ flex: 1, height: 1, backgroundColor: colors.tint, opacity: 0.15 }} />
                      <ThemedText style={{ marginHorizontal: 12, fontSize: 16, opacity: 0.5 }}>
                        <ThemedView style={[styles.verseNumber, { backgroundColor: colors.tint }]}>
                          <ThemedText style={{ color: colors.background, fontSize: 12, fontWeight: '600' }}>
                            {verse.numberInSurah}
                          </ThemedText>
                        </ThemedView>
                        {isVerseBookmarked(surahData.surahNumber, verse.numberInSurah) && (
                          <IconSymbol name="bookmark.fill" size={16} color={colors.tint} />
                        )}
                      </ThemedText>
                      <ThemedView style={{ flex: 1, height: 1, backgroundColor: colors.tint, opacity: 0.15 }} />
                    </ThemedView>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ))}
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
          <ThemedView style={[styles.header, { marginTop: 56 }]}>
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
    paddingVertical: 20,
  },
  surahCard: {
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
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
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
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
    padding: 10,
    borderRadius: 10,
    marginLeft: 0,
  },
  versesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 32,
  },
  verseCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
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
