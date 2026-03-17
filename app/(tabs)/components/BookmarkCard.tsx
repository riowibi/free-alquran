import { View, TouchableOpacity, Alert, Platform } from 'react-native';
import React, { useRef, useCallback, memo } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { TajwidDisplay } from '@/components/tajweed-display';
import { TransliterationService } from '@/services/transliteration';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Bookmark } from '@/types/quran';

// Debug flag
const DEBUG_BOOKMARK_CARD = false;

interface BookmarkCardProps {
  bookmark: Bookmark;
  surahName: string;
  transliteration?: string;
  translation?: string;
  isLastBookmark: boolean;
  onBookmarkPress: (bookmarkId: string) => Promise<void>;
  tintColor: string;
  textColor: string;
  backgroundColor: string;
}

/**
 * Memo comparison for BookmarkCard optimization
 */
const arePropsEqual = (prevProps: BookmarkCardProps, nextProps: BookmarkCardProps) => {
  return (
    prevProps.bookmark.id === nextProps.bookmark.id &&
    prevProps.bookmark.verseNumber === nextProps.bookmark.verseNumber &&
    prevProps.surahName === nextProps.surahName &&
    prevProps.isLastBookmark === nextProps.isLastBookmark &&
    prevProps.tintColor === nextProps.tintColor &&
    prevProps.textColor === nextProps.textColor &&
    prevProps.backgroundColor === nextProps.backgroundColor
  );
};

function BookmarkCardComponent({
  bookmark,
  surahName,
  transliteration,
  translation,
  isLastBookmark,
  onBookmarkPress,
  tintColor,
  textColor,
  backgroundColor,
}: BookmarkCardProps) {
  const isProcessing = useRef(false);

  const handleRemoveBookmark = useCallback(async () => {
    if (isProcessing.current) return;

    const performDelete = async () => {
      isProcessing.current = true;
      try {
        DEBUG_BOOKMARK_CARD && console.log('🗑️ Removing bookmark:', bookmark.id);
        await onBookmarkPress(bookmark.id);
        if (Platform.OS !== 'web') {
          Alert.alert('Berhasil', 'Bookmark berhasil dihapus');
        }
      } finally {
        isProcessing.current = false;
      }
    };

    // Cross-platform confirmation
    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Apakah Anda yakin ingin menghapus bookmark ini?');
      if (confirmed) {
        await performDelete();
      }
    } else {
      Alert.alert(
        'Konfirmasi Hapus',
        'Apakah Anda yakin ingin menghapus bookmark ini?',
        [
          { text: 'Tidak', onPress: () => {}, style: 'cancel' },
          { text: 'Ya', onPress: performDelete, style: 'destructive' },
        ]
      );
    }
  }, [bookmark.id, onBookmarkPress]);

  return (
    <ThemedView
      style={{
        padding: 20,
        borderRadius: 16,
        marginBottom: isLastBookmark ? 0 : 20,
        borderWidth: 2,
        backgroundColor,
        borderColor: tintColor,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
      }}>
      {/* Header with Verse Number Badge and Controls */}
      <ThemedView
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
          gap: 12,
        }}>
        {/* Surah Name */}
        <ThemedText
          style={{
            flex: 1,
            fontSize: 12,
            opacity: 0.7,
            textAlign: 'right',
          }}>
          Ayat
        </ThemedText>

        {/* Verse Number Badge - circular */}
        <ThemedView
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: tintColor,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ThemedText
            style={{
              color: backgroundColor,
              fontSize: 12,
              fontWeight: '600',
            }}>
            {bookmark.verseNumber}
          </ThemedText>
        </ThemedView>

        {/* Remove Bookmark Button */}
        <TouchableOpacity
          onPress={handleRemoveBookmark}
          style={{ padding: 6, opacity: 0.7 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <IconSymbol name="bookmark.fill" size={16} color={textColor} />
        </TouchableOpacity>
      </ThemedView>

      {/* Decorative line */}
      <ThemedView
        style={{
          height: 1,
          backgroundColor: tintColor,
          opacity: 0.15,
          marginBottom: 16,
        }}
      />

      {/* Arabic Text */}
      <View style={{ marginBottom: 12 }}>
        <TajwidDisplay text={bookmark.text} fontSize={26} lineHeight={40} />
      </View>

      {/* Transliteration */}
      <ThemedText
        style={{
          fontSize: 14,
          lineHeight: 22,
          textAlign: 'left',
          fontStyle: 'italic',
          opacity: 0.9,
          color: tintColor,
          marginBottom: 12,
        }}>
        {transliteration && transliteration.length > 0
          ? TransliterationService.toSimpleIndonesian(transliteration)
          : '(Transliterasi tidak tersedia)'}
      </ThemedText>

      {/* Indonesian Translation */}
      <ThemedText
        style={{
          fontSize: 14,
          lineHeight: 24,
          textAlign: 'left',
          opacity: 0.9,
          fontWeight: '500',
          color: textColor,
          marginBottom: 12,
        }}>
        {translation && translation.length > 0
          ? translation
          : '(Terjemahan tidak tersedia)'}
      </ThemedText>

      {/* Note if exists */}
      {bookmark.note && (
        <ThemedView style={{ marginBottom: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: tintColor, opacity: 0.8 }}>
          <ThemedText style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
            Catatan:
          </ThemedText>
          <ThemedText style={{ fontStyle: 'italic', color: textColor }}>
            {bookmark.note}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

// Export memoized component for better performance
export const BookmarkCard = memo(BookmarkCardComponent, arePropsEqual);
