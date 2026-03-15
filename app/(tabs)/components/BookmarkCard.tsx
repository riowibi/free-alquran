import { View, TouchableOpacity } from 'react-native';
import { useRef } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { TajwidDisplay } from '@/components/tajweed-display';
import { TransliterationService } from '@/services/transliteration';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Bookmark } from '@/types/quran';

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

export function BookmarkCard({
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

  const handleRemoveBookmark = async () => {
    if (isProcessing.current) return;
    isProcessing.current = true;
    try {
      await onBookmarkPress(bookmark.id);
    } finally {
      isProcessing.current = false;
    }
  };

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
      {/* Verse Number */}
      <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
        {surahName} - Ayat {bookmark.verseNumber}
      </ThemedText>

      {/* Arabic Text */}
      <View style={{ marginVertical: 12 }}>
        <TajwidDisplay text={bookmark.text} fontSize={26} lineHeight={40} />
      </View>

      {/* Decorative line */}
      <ThemedView
        style={{
          height: 1,
          backgroundColor: tintColor,
          opacity: 0.2,
          marginVertical: 8,
        }}
      />

      {/* Transliteration */}
      <ThemedText
        style={{
          fontSize: 14,
          marginTop: 8,
          lineHeight: 22,
          textAlign: 'left',
          fontStyle: 'italic',
          opacity: 0.9,
          color: tintColor,
        }}>
        {transliteration && transliteration.length > 0
          ? TransliterationService.toSimpleIndonesian(transliteration)
          : '(Transliterasi tidak tersedia)'}
      </ThemedText>

      {/* Indonesian Translation */}
      <ThemedText
        style={{
          fontSize: 14,
          marginTop: 12,
          lineHeight: 24,
          textAlign: 'left',
          opacity: 0.9,
          fontWeight: '500',
          color: textColor,
        }}>
        {translation && translation.length > 0
          ? translation
          : '(Terjemahan tidak tersedia)'}
      </ThemedText>

      {/* Note if exists */}
      {bookmark.note && (
        <ThemedView style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: tintColor }}>
          <ThemedText style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
            Catatan:
          </ThemedText>
          <ThemedText style={{ fontStyle: 'italic', color: textColor }}>
            {bookmark.note}
          </ThemedText>
        </ThemedView>
      )}

      {/* Bookmark timestamp */}
      <ThemedText style={{ fontSize: 11, marginTop: 8, opacity: 0.5 }}>
        {new Date(bookmark.timestamp).toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })}
      </ThemedText>

      {/* Remove Bookmark Button */}
      <ThemedView
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginTop: 16,
        }}>
        <TouchableOpacity
          onPress={handleRemoveBookmark}
          style={{ padding: 8 }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <IconSymbol name="bookmark.fill" size={16} color={textColor} />
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}
