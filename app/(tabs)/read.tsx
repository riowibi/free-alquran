import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, ActivityIndicator, BackHandler, View } from 'react-native';
import { useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { useQuran } from '@/hooks/use-quran';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { QuranSurah, JuzGroup } from '@/types/quran';

import { SurahsHeader } from './components/SurahsHeader';
import { SurahsList } from './components/SurahsList';
import { JuzList } from './components/JuzList';
import { VersesList } from './components/VersesList';
import { JuzVersesList } from './components/JuzVersesList';
import { useJuzGroups } from './hooks/useJuzGroups';

export default function ReadScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();

  const {
    surahs,
    isLoading,
    updateReadingProgress,
    addBookmark,
    isVerseBookmarked,
    lastReadProgress,
  } = useQuran();

  // State management
  const [view, setView] = useState<'surahs' | 'verses' | 'juz'>('surahs');
  const [listView, setListView] = useState<'surahs' | 'juz'>('surahs');
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null);
  const [selectedJuz, setSelectedJuz] = useState<JuzGroup | null>(null);
  const [isFromExternalNav, setIsFromExternalNav] = useState(false);

  // Generate juz groups
  const juzGroups = useJuzGroups(surahs);

  // Handle external navigation
  useEffect(() => {
    if (params.surah && surahs.length > 0) {
      const surahNum = parseInt(params.surah as string);
      const surah = surahs.find((s) => s.number === surahNum);
      if (surah) {
        setSelectedSurah(surah);
        setIsFromExternalNav(true);
        setView('verses');
      }
    }
  }, [params.surah, surahs]);

  // Handle Android back button
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (view !== 'surahs') {
          setView('surahs');
          return true;
        }
        return false;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );
      return () => backHandler.remove();
    }, [view])
  );

  // Event handlers
  const handleSurahSelect = useCallback((surah: QuranSurah) => {
    setSelectedSurah(surah);
    setIsFromExternalNav(false);
    setView('verses');
  }, []);

  const handleJuzSelect = useCallback((juz: JuzGroup) => {
    setSelectedJuz(juz);
    setIsFromExternalNav(false);
    setView('juz');
  }, []);

  const handleVersePress = useCallback(
    (surahNum: number, verseNum: number) => {
      updateReadingProgress(surahNum, verseNum);
    },
    [updateReadingProgress]
  );

  const handleVerseLongPress = useCallback(
    (verseNumber: number, text: string, surahNum: number) => {
      // Handle long press - can be used for context menu or copy
    },
    []
  );

  const handleBookmarkPress = useCallback(
    (surahNum: number, verseNum: number, text: string) => {
      addBookmark(surahNum, verseNum, text);
    },
    [addBookmark]
  );

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  if (view === 'surahs') {
    return (
      <ThemedView style={styles.container}>
        <SurahsHeader
          listView={listView}
          onToggleSurahs={() => setListView('surahs')}
          onToggleJuz={() => setListView('juz')}
          tintColor={colors.tint}
          textColor={colors.text}
          backgroundColor={colors.background}
        />
        {listView === 'surahs' ? (
          <SurahsList
            surahs={surahs}
            onSurahSelect={handleSurahSelect}
            tintColor={colors.tint}
            textColor={colors.text}
            backgroundColor={colors.background}
            iconColor={colors.icon}
          />
        ) : (
          <JuzList
            juzGroups={juzGroups}
            onJuzSelect={handleJuzSelect}
            tintColor={colors.tint}
            textColor={colors.text}
            backgroundColor={colors.background}
            iconColor={colors.icon}
          />
        )}
      </ThemedView>
    );
  }

  if (view === 'verses' && selectedSurah) {
    return (
      <ThemedView style={styles.container}>
        <VersesList
          surah={selectedSurah}
          juzGroups={juzGroups}
          isFromExternalNav={isFromExternalNav}
          lastReadProgress={lastReadProgress}
          isVerseBookmarked={isVerseBookmarked}
          onVersePress={handleVersePress}
          onVerseLongPress={handleVerseLongPress}
          onBookmarkPress={handleBookmarkPress}
          tintColor={colors.tint}
          textColor={colors.text}
          backgroundColor={colors.background}
        />
      </ThemedView>
    );
  }

  if (view === 'juz' && selectedJuz) {
    return (
      <ThemedView style={styles.container}>
        <JuzVersesList
          juzGroup={selectedJuz}
          isFromExternalNav={isFromExternalNav}
          lastReadProgress={lastReadProgress}
          isVerseBookmarked={isVerseBookmarked}
          onVersePress={handleVersePress}
          onVerseLongPress={handleVerseLongPress}
          onBookmarkPress={handleBookmarkPress}
          tintColor={colors.tint}
          textColor={colors.text}
          backgroundColor={colors.background}
        />
      </ThemedView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
