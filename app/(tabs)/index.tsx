import { useEffect, useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useQuran } from '@/hooks/use-quran';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const { initializeQuran, isLoading, error, lastReadProgress, bookmarks } = useQuran();
  const [showError, setShowError] = useState(false);

  const colors = Colors[colorScheme ?? 'light'];

  useEffect(() => {
    initializeQuran();
  }, [initializeQuran]);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  const handleMenuPress = (route: string) => {
    if (isLoading) return;
    router.push(route as any);
  };

  const handleRetry = () => {
    setShowError(false);
    initializeQuran();
  };

  if (showError && error) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.circle" size={48} color={colors.icon} />
          <ThemedText type="title" style={{ marginTop: 16, textAlign: 'center' }}>
            Error
          </ThemedText>
          <ThemedText style={{ marginTop: 8, textAlign: 'center', marginHorizontal: 16 }}>
            {error}
          </ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.tint }]}
            onPress={handleRetry}
            disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <ThemedText style={{ color: colors.background, fontWeight: '600' }}>Retry</ThemedText>
            )}
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ThemedView style={styles.container}>
        {/* Header */}
        <ThemedView style={styles.headerSection}>
          <ThemedText type="title" style={{ fontSize: 32 }}>
            Quran
          </ThemedText>
          <ThemedText type="subtitle" style={{ marginTop: 8, opacity: 0.7 }}>
            Baca dan pelajari Al-Quran dengan tajweed
          </ThemedText>
        </ThemedView>

        {/* Loading Indicator */}
        {isLoading && (
          <ThemedView style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={colors.tint}
              style={{ marginVertical: 20 }}
            />
            <ThemedText style={{ textAlign: 'center' }}>
              Loading Quran data...
            </ThemedText>
          </ThemedView>
        )}

        {/* Menu Items */}
        {!isLoading && (
          <ThemedView style={styles.menuContainer}>
            {/* Baca Alquran */}
            <TouchableOpacity
              style={[styles.menuCard, { borderColor: colors.tint }]}
              onPress={() => handleMenuPress('/(tabs)/read')}
              activeOpacity={0.7}>
              <ThemedView style={styles.menuCardHeader}>
                <IconSymbol
                  name="book.fill"
                  size={32}
                  color={colors.tint}
                  style={styles.menuIcon}
                />
              </ThemedView>
              <ThemedText type="subtitle" style={{ marginTop: 12 }}>
                Baca Alquran
              </ThemedText>
              <ThemedText style={{ marginTop: 6, opacity: 0.7, fontSize: 13 }}>
                Mulai membaca Al-Quran dari awal atau surah pilihan Anda
              </ThemedText>
            </TouchableOpacity>

            {/* Terakhir Baca */}
            <TouchableOpacity
              style={[styles.menuCard, { borderColor: colors.tint }]}
              onPress={() => {
                if (lastReadProgress) {
                  handleMenuPress(
                    `/(tabs)/read?surah=${lastReadProgress.surahNumber}&verse=${lastReadProgress.verseNumber}`
                  );
                } else {
                  Alert.alert(
                    'No History',
                    'You have not read anything yet. Start reading to track your progress.'
                  );
                }
              }}
              activeOpacity={0.7}>
              <ThemedView style={styles.menuCardHeader}>
                <IconSymbol
                  name="clock.fill"
                  size={32}
                  color={colors.tint}
                  style={styles.menuIcon}
                />
              </ThemedView>
              <ThemedText type="subtitle" style={{ marginTop: 12 }}>
                Terakhir Baca
              </ThemedText>
              <ThemedText style={{ marginTop: 6, opacity: 0.7, fontSize: 13 }}>
                {lastReadProgress
                  ? `Surah ke-${lastReadProgress.surahNumber}, Ayat ${lastReadProgress.verseNumber}`
                  : 'Belum ada history bacaan'}
              </ThemedText>
            </TouchableOpacity>

            {/* Bookmark */}
            <TouchableOpacity
              style={[styles.menuCard, { borderColor: colors.tint }]}
              onPress={() => handleMenuPress('/(tabs)/bookmark')}
              activeOpacity={0.7}>
              <ThemedView style={styles.menuCardHeader}>
                <IconSymbol
                  name="bookmark.fill"
                  size={32}
                  color={colors.tint}
                  style={styles.menuIcon}
                />
              </ThemedView>
              <ThemedText type="subtitle" style={{ marginTop: 12 }}>
                Bookmark
              </ThemedText>
              <ThemedText style={{ marginTop: 6, opacity: 0.7, fontSize: 13 }}>
                {bookmarks.length > 0
                  ? `Anda memiliki ${bookmarks.length} bookmark`
                  : 'Belum ada bookmark'}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerSection: {
    marginTop: 20,
    marginBottom: 32,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  retryButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    alignItems: 'center',
  },
  menuContainer: {
    gap: 16,
    marginBottom: 32,
  },
  menuCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 20,
  },
  menuCardHeader: {
    alignItems: 'flex-start',
  },
  menuIcon: {
    marginBottom: 4,
  },
});
