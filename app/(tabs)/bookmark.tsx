import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useQuran } from '@/hooks/use-quran';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BookmarkCard } from './components/BookmarkCard';
import { Bookmark, QuranSurah } from '@/types/quran';

interface BookmarkGroup {
  surahNumber: number;
  surah: QuranSurah | undefined;
  bookmarks: Bookmark[];
}

export default function BookmarkScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { bookmarks, toggleBookmark, getSurah } = useQuran();

  useEffect(() => {
    console.log('[BOOKMARK] Component loaded - Total bookmarks:', bookmarks.length);
  }, [bookmarks]);

  // Group bookmarks by surah
  const groupedBookmarks = useCallback((): BookmarkGroup[] => {
    const groups = new Map<number, Bookmark[]>();

    bookmarks.forEach(bookmark => {
      if (!groups.has(bookmark.surahNumber)) {
        groups.set(bookmark.surahNumber, []);
      }
      groups.get(bookmark.surahNumber)!.push(bookmark);
    });

    return Array.from(groups.entries())
      .map(([surahNumber, bookmarksInSurah]) => ({
        surahNumber,
        surah: getSurah(surahNumber),
        bookmarks: bookmarksInSurah.sort((a, b) => a.verseNumber - b.verseNumber),
      }))
      .sort((a, b) => a.surahNumber - b.surahNumber);
  }, [bookmarks, getSurah]);

  const handleRemoveBookmark = useCallback(
    async (bookmarkId: string) => {
      console.log('[BOOKMARK] Removing bookmark - ID:', bookmarkId);
      const bookmark = bookmarks.find(b => b.id === bookmarkId);
      if (bookmark) {
        await toggleBookmark(bookmark.surahNumber, bookmark.verseNumber, bookmark.text, bookmark.note);
      }
    },
    [bookmarks, toggleBookmark]
  );

  // Helper to get verse data (transliteration and translation)
  const getVerseData = useCallback((surahNumber: number, verseNumber: number) => {
    const surah = getSurah(surahNumber);
    if (!surah) return { transliteration: '', translation: '' };
    
    const verse = surah.verses.find(v => v.numberInSurah === verseNumber);
    if (!verse) return { transliteration: '', translation: '' };
    
    return {
      transliteration: verse.transliteration || '',
      translation: verse.indonesianTranslation || '',
    };
  }, [getSurah]);

  const groups = groupedBookmarks();

  return (
    <ThemedView style={styles.container}>
      {bookmarks.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="bookmark" size={48} color={colors.icon} />
          <ThemedText type="subtitle" style={{ marginTop: 16, textAlign: 'center' }}>
            Simpan ayat untuk dibaca dan dipahami kembali nanti
          </ThemedText>
          <ThemedText style={{ marginTop: 8, opacity: 0.7, textAlign: 'center' }}>
            Bookmark ayat saat membaca untuk disimpan di sini
          </ThemedText>
        </ThemedView>
      ) : (
        <ScrollView style={{ flex: 1 }} scrollEventThrottle={16}>
          {/* Header */}
          <ThemedView style={styles.header}>
            <ThemedText type="title" style={{ fontWeight: '700' }}>
              Bookmark
            </ThemedText>
            <ThemedText style={{ marginTop: 8, opacity: 0.7 }}>
              {bookmarks.length} {bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
            </ThemedText>
          </ThemedView>

          {/* Bookmarks grouped by surah */}
          <ThemedView style={styles.bookmarksContainer}>
            {groups.map((group, groupIdx) => (
              <View key={`group-${group.surahNumber}`}>
                {/* Surah Header */}
                <ThemedView style={[styles.surahHeader, { backgroundColor: colors.tint }]}>
                  <ThemedText style={{ color: colors.background, fontWeight: '700', fontSize: 16 }}>
                    {group.surah?.englishName || `Surah ${group.surahNumber}`}
                  </ThemedText>
                  <ThemedText style={{ color: colors.background, fontSize: 12, marginTop: 2, opacity: 0.8 }}>
                    {group.bookmarks.length} {group.bookmarks.length === 1 ? 'bookmark' : 'bookmarks'}
                  </ThemedText>
                </ThemedView>

                {/* Bookmarks in this surah */}
                <ThemedView style={styles.surahBookmarksContainer}>
                  {group.bookmarks.map((bookmark, idx) => {
                    const verseData = getVerseData(bookmark.surahNumber, bookmark.verseNumber);
                    return (
                      <BookmarkCard
                        key={bookmark.id}
                        bookmark={bookmark}
                        surahName={group.surah?.englishName || `Surah ${group.surahNumber}`}
                        transliteration={verseData.transliteration}
                        translation={verseData.translation}
                        isLastBookmark={idx === group.bookmarks.length - 1}
                        onBookmarkPress={handleRemoveBookmark}
                        tintColor={colors.tint}
                        textColor={colors.text}
                        backgroundColor={colors.background}
                      />
                    );
                  })}
                </ThemedView>
              </View>
            ))}
          </ThemedView>
        </ScrollView>
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
    paddingTop: 28,
    paddingBottom: 16,
    marginTop: 28,
  },
  bookmarksContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 32,
  },
  surahHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
    marginTop: 16,
  },
  surahBookmarksContainer: {
    marginBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 64,
  },
});
