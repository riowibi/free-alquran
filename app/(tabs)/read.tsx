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
import { ReadingMenuHeader } from './components/ReadingMenuHeader';
import { useJuzGroups } from './hooks/useJuzGroups';

export default function ReadScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const params = useLocalSearchParams();

  const {
    surahs,
    isLoading,
    updateReadingProgress,
    toggleBookmark,
    isVerseBookmarked,
    lastReadProgress,
  } = useQuran();

  // State management
  const [view, setView] = useState<'surahs' | 'verses' | 'juz'>('surahs');
  const [listView, setListView] = useState<'surahs' | 'juz'>('surahs');
  const [selectedSurah, setSelectedSurah] = useState<QuranSurah | null>(null);
  const [selectedJuz, setSelectedJuz] = useState<JuzGroup | null>(null);
  const [isFromExternalNav, setIsFromExternalNav] = useState(false);
  const [externalScrollPosition, setExternalScrollPosition] = useState<number | undefined>();

  // Generate juz groups
  const juzGroups = useJuzGroups(surahs);

  // Reset state when screen comes into focus (to handle external navigation properly)
  useFocusEffect(
    useCallback(() => {
      console.log('[READ] Screen focused - Checking for external navigation params');
      
      if (params.surah && surahs.length > 0 && juzGroups.length > 0) {
        const surahNum = parseInt(params.surah as string);
        const readType = (params.readType as string) || 'surah';
        const juzNum = params.juz ? parseInt(params.juz as string) : undefined;
        const scrollPosition = params.scrollPosition ? parseInt(params.scrollPosition as string) : undefined;
        
        console.log('[READ] Focus - External navigation detected - Params:', {
          surahNum,
          readType,
          juzNum,
          scrollPosition,
        });
        
        // Store external scroll position
        setExternalScrollPosition(scrollPosition);
        console.log('[READ] Focus - External scroll position set:', scrollPosition);
        
        // Handle Juz view navigation
        if (readType === 'juz' && juzNum && juzNum > 0) {
          const juzGroup = juzGroups.find((j) => j.juzNumber === juzNum);
          if (juzGroup) {
            console.log('[READ] Focus - Loading Juz view - Juz:', juzNum);
            setSelectedJuz(juzGroup);
            setSelectedSurah(null);
            setIsFromExternalNav(true);
            setView('juz');
            return;
          }
        }
        
        // Handle Surah view navigation (default)
        const surah = surahs.find((s) => s.number === surahNum);
        if (surah) {
          console.log('[READ] Focus - Loading Surah view - Surah:', surahNum);
          setSelectedSurah(surah);
          setSelectedJuz(null);
          setIsFromExternalNav(true);
          setView('verses');
        }
      } else if (!params.surah) {
        // No params - reset to surahs selection view
        console.log('[READ] Focus - No params detected, resetting to surahs view');
        setView('surahs');
        setListView('surahs');
        setSelectedSurah(null);
        setSelectedJuz(null);
        setIsFromExternalNav(false);
        setExternalScrollPosition(undefined);
      }
    }, [params.surah, params.readType, params.juz, params.scrollPosition, surahs, juzGroups])
  );

  // Handle external navigation from Home menu (on mount)
  useEffect(() => {
    if (params.surah && surahs.length > 0 && juzGroups.length > 0) {
      const surahNum = parseInt(params.surah as string);
      const readType = (params.readType as string) || 'surah';
      const juzNum = params.juz ? parseInt(params.juz as string) : undefined;
      const scrollPosition = params.scrollPosition ? parseInt(params.scrollPosition as string) : undefined;
      
      console.log('[READ] Mount - External navigation detected - Params:', {
        surahNum,
        readType,
        juzNum,
        scrollPosition,
      });
      
      // Store external scroll position
      setExternalScrollPosition(scrollPosition);
      console.log('[READ] Mount - External scroll position set:', scrollPosition);
      
      // Handle Juz view navigation
      if (readType === 'juz' && juzNum && juzNum > 0) {
        const juzGroup = juzGroups.find((j) => j.juzNumber === juzNum);
        if (juzGroup) {
          console.log('[READ] Mount - Loading Juz view - Juz:', juzNum);
          setSelectedJuz(juzGroup);
          setSelectedSurah(null);
          setIsFromExternalNav(true);
          setView('juz');
          return;
        }
      }
      
      // Handle Surah view navigation (default)
      const surah = surahs.find((s) => s.number === surahNum);
      if (surah) {
        console.log('[READ] Mount - Loading Surah view - Surah:', surahNum);
        setSelectedSurah(surah);
        setSelectedJuz(null);
        setIsFromExternalNav(true);
        setView('verses');
      }
    }
  }, [params.surah, params.readType, params.juz, params.scrollPosition, surahs, juzGroups]);

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
    console.log('[READ] Juz selected - Juz Number:', juz.juzNumber, 'Surahs:', juz.surahs);
    setSelectedJuz(juz);
    setIsFromExternalNav(false);
    setView('juz');
  }, []);

  const handleVersePress = useCallback(
    (surahNum: number, verseNum: number, scrollPosition?: number) => {
      // Determine read type based on current view
      const readType = view === 'juz' ? 'juz' : 'surah';
      const juzNum = view === 'juz' ? selectedJuz?.juzNumber : undefined;
      console.log('[READ] Verse pressed - Data:', {
        surahNum,
        verseNum,
        readType,
        juzNum,
        scrollPosition,
      });
      updateReadingProgress(surahNum, verseNum, readType, juzNum, scrollPosition);
    },
    [updateReadingProgress, view, selectedJuz]
  );

  const handleVerseLongPress = useCallback(
    (verseNumber: number, text: string, surahNum: number) => {
      // Handle long press - can be used for context menu or copy
      console.log('[READ] Verse long pressed - Verse:', verseNumber, 'Surah:', surahNum);
    },
    []
  );

  const handleBookmarkPress = useCallback(
    async (surahNum: number, verseNum: number, text: string) => {
      console.log('[READ] Bookmark button pressed - Data:', {
        surahNum,
        verseNum,
        textLength: text.length,
      });
      await toggleBookmark(surahNum, verseNum, text);
    },
    [toggleBookmark]
  );

  // Handle surah selection from continue reading carousel
  const handleSurahChange = useCallback((surah: QuranSurah) => {
    console.log('[READ] Surah changed from carousel - Surah:', surah.number);
    setSelectedSurah(surah);
    setSelectedJuz(null);
    setIsFromExternalNav(false);
    setView('verses');
  }, []);

  // Handle juz selection from continue reading carousel
  const handleJuzChange = useCallback((juz: JuzGroup) => {
    console.log('[READ] Juz changed from carousel - Juz:', juz.juzNumber);
    setSelectedJuz(juz);
    setSelectedSurah(null);
    setIsFromExternalNav(false);
    setView('juz');
  }, []);

  // Handle Baca Quran menu - Go back to surahs list
  const handleBacaQuran = useCallback(() => {
    console.log('[READ] Baca Quran menu pressed - Returning to surahs list');
    setView('surahs');
    setListView('surahs');
    setSelectedSurah(null);
    setSelectedJuz(null);
    setIsFromExternalNav(false);
  }, []);

  // Handle Terakhir Baca menu - Navigate to last read progress
  const handleTerakhirBaca = useCallback(() => {
    console.log('[READ] Terakhir Baca menu pressed - Navigating to last read');
    if (lastReadProgress) {
      const readType = lastReadProgress.readType || 'surah';
      
      if (readType === 'juz' && lastReadProgress.juzNumber) {
        // Navigate to last read juz
        const juzGroup = juzGroups.find((j) => j.juzNumber === lastReadProgress.juzNumber);
        if (juzGroup) {
          console.log('[READ] Loading Juz view - Juz:', lastReadProgress.juzNumber);
          setSelectedJuz(juzGroup);
          setSelectedSurah(null);
          setIsFromExternalNav(true); // Enable scroll to saved position
          setView('juz');
          return;
        }
      }
      
      // Navigate to last read surah (default)
      const surah = surahs.find((s) => s.number === lastReadProgress.surahNumber);
      if (surah) {
        console.log('[READ] Loading Surah view - Surah:', lastReadProgress.surahNumber);
        setSelectedSurah(surah);
        setSelectedJuz(null);
        setIsFromExternalNav(true); // Enable scroll to saved position
        setView('verses');
      }
    }
  }, [lastReadProgress, surahs, juzGroups]);

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
        <ReadingMenuHeader
          onBacaQuran={handleBacaQuran}
          onTerakhirBaca={handleTerakhirBaca}
          hasReadingHistory={!!lastReadProgress}
          tintColor={colors.tint}
          textColor={colors.text}
          backgroundColor={colors.background}
        />
        <VersesList
          surah={selectedSurah}
          juzGroups={juzGroups}
          isFromExternalNav={isFromExternalNav}
          lastReadProgress={lastReadProgress}
          isVerseBookmarked={isVerseBookmarked}
          onVersePress={handleVersePress}
          onVerseLongPress={handleVerseLongPress}
          onBookmarkPress={handleBookmarkPress}
          onSurahChange={handleSurahChange}
          onJuzChange={handleJuzChange}
          allSurahs={surahs}
          tintColor={colors.tint}
          textColor={colors.text}
          backgroundColor={colors.background}
          externalScrollPosition={externalScrollPosition}
        />
      </ThemedView>
    );
  }

  if (view === 'juz' && selectedJuz) {
    return (
      <ThemedView style={styles.container}>
        <ReadingMenuHeader
          onBacaQuran={handleBacaQuran}
          onTerakhirBaca={handleTerakhirBaca}
          hasReadingHistory={!!lastReadProgress}
          tintColor={colors.tint}
          textColor={colors.text}
          backgroundColor={colors.background}
        />
        <JuzVersesList
          juzGroup={selectedJuz}
          isFromExternalNav={isFromExternalNav}
          lastReadProgress={lastReadProgress}
          isVerseBookmarked={isVerseBookmarked}
          onVersePress={handleVersePress}
          onVerseLongPress={handleVerseLongPress}
          onBookmarkPress={handleBookmarkPress}
          onSurahChange={handleSurahChange}
          onJuzChange={handleJuzChange}
          allSurahs={surahs}
          allJuzGroups={juzGroups}
          tintColor={colors.tint}
          textColor={colors.text}
          backgroundColor={colors.background}
          externalScrollPosition={externalScrollPosition}
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
