import { useState, useCallback } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  Alert,
  SectionList,
  View,
} from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { TajwidDisplay } from '@/components/tajweed-display';
import { useQuran } from '@/hooks/use-quran';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Bookmark } from '@/types/quran';

interface BookmarkSection {
  surahNumber: number;
  title: string;
  data: Bookmark[];
}

export default function BookmarkScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { bookmarks, removeBookmark, getSurah } = useQuran();
  const [refreshing, setRefreshing] = useState(false);

  // Group bookmarks by surah
  const groupedBookmarks = useCallback((): BookmarkSection[] => {
    const groups = new Map<number, Bookmark[]>();

    bookmarks.forEach(bookmark => {
      if (!groups.has(bookmark.surahNumber)) {
        groups.set(bookmark.surahNumber, []);
      }
      groups.get(bookmark.surahNumber)!.push(bookmark);
    });

    return Array.from(groups.entries())
      .map(([surahNumber, verses]) => ({
        surahNumber,
        title: `${getSurah(surahNumber)?.name || `Surah ${surahNumber}`}`,
        data: verses.sort((a, b) => a.verseNumber - b.verseNumber),
      }))
      .sort((a, b) => a.surahNumber - b.surahNumber);
  }, [bookmarks, getSurah]);

  const handleDeleteBookmark = (bookmarkId: string) => {
    Alert.alert('Delete Bookmark', 'Are you sure you want to delete this bookmark?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: () => {
          removeBookmark(bookmarkId);
          Alert.alert('Success', 'Bookmark deleted successfully');
        },
        style: 'destructive',
      },
    ]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const renderBookmarkItem = ({ item }: { item: Bookmark }) => (
    <ThemedView style={[styles.bookmarkCard, { borderColor: colors.icon }]}>
      <ThemedView style={styles.bookmarkContent}>
        <ThemedView style={styles.verseInfo}>
          <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
            Ayat {item.verseNumber}
          </ThemedText>
          <View style={{ marginTop: 8 }}>
            <TajwidDisplay 
              text={item.text} 
              fontSize={16}
              lineHeight={26}
            />
          </View>
          {item.note && (
            <ThemedView style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.icon }}>
              <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Note:</ThemedText>
              <ThemedText style={{ marginTop: 4, fontStyle: 'italic' }}>{item.note}</ThemedText>
            </ThemedView>
          )}
          <ThemedText style={{ fontSize: 11, marginTop: 8, opacity: 0.5 }}>
            {new Date(item.timestamp).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </ThemedText>
        </ThemedView>
        <TouchableOpacity
          onPress={() => handleDeleteBookmark(item.id)}
          style={[styles.deleteButton, { backgroundColor: colors.icon }]}>
          <IconSymbol name="trash" size={16} color={colors.background} />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );

  const renderSectionHeader = ({ section }: { section: BookmarkSection }) => (
    <ThemedView style={[styles.sectionHeader, { backgroundColor: colors.tint }]}>
      <ThemedText style={{ color: colors.background, fontWeight: '600' }}>
        {section.title}
      </ThemedText>
      <ThemedText style={{ color: colors.background, fontSize: 12, marginTop: 2, opacity: 0.8 }}>
        {section.data.length} {section.data.length === 1 ? 'bookmark' : 'bookmarks'}
      </ThemedText>
    </ThemedView>
  );

  const sections = groupedBookmarks();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Bookmark</ThemedText>
        <ThemedText style={{ marginTop: 8, opacity: 0.7 }}>
          {bookmarks.length > 0
            ? `Anda memiliki ${bookmarks.length} bookmark`
            : 'Belum ada bookmark'}
        </ThemedText>
      </ThemedView>

      {bookmarks.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <IconSymbol name="bookmark" size={48} color={colors.icon} />
          <ThemedText type="subtitle" style={{ marginTop: 16, textAlign: 'center' }}>
            Belum ada bookmark
          </ThemedText>
          <ThemedText style={{ marginTop: 8, opacity: 0.7, textAlign: 'center' }}>
            Panjangkan ayat selama membaca untuk menambahkan bookmark
          </ThemedText>
        </ThemedView>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.id + index}
          renderItem={renderBookmarkItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  bookmarkCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  bookmarkContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  verseInfo: {
    flex: 1,
    marginRight: 12,
  },
  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
