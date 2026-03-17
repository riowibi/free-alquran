import React, { useState, useRef } from 'react';
import { FlatList, TouchableOpacity, View, Dimensions } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { QuranSurah, JuzGroup } from '@/types/quran';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface ContinueReadingCarouselProps {
  currentSurah: QuranSurah | null;
  currentJuz: JuzGroup | null;
  readMode: 'surah' | 'juz'; // current reading mode
  allSurahs: QuranSurah[];
  allJuzGroups: JuzGroup[];
  onSelectSurah: (surah: QuranSurah) => void;
  onSelectJuz: (juz: JuzGroup) => void;
  tintColor: string;
  textColor: string;
  backgroundColor: string;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 64; // accounting for padding

export function ContinueReadingCarousel({
  currentSurah,
  currentJuz,
  readMode,
  allSurahs,
  allJuzGroups,
  onSelectSurah,
  onSelectJuz,
  tintColor,
  textColor,
  backgroundColor,
}: ContinueReadingCarouselProps) {
  const [mode, setMode] = useState<'surah' | 'juz'>(readMode); // can switch between modes in carousel
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Get items based on current mode
  const items =
    mode === 'surah'
      ? currentSurah
        ? allSurahs.slice(currentSurah.number) // from current surah onwards
        : allSurahs
      : currentJuz
      ? allJuzGroups.slice(currentJuz.juzNumber) // from current juz onwards
      : allJuzGroups;

  // Get title based on mode
  const getItemTitle = (index: number) => {
    if (mode === 'surah') {
      const surah = items[index] as QuranSurah;
      return `${surah.englishName}`;
    } else {
      const juz = items[index] as JuzGroup;
      return `Juz ${juz.juzNumber}`;
    }
  };

  // Get subtitle
  const getItemSubtitle = (index: number) => {
    if (mode === 'surah') {
      const surah = items[index] as QuranSurah;
      return `${surah.numberOfAyahs} Ayat • ${surah.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah'}`;
    } else {
      const juz = items[index] as JuzGroup;
      return `${juz.surahs.length} Surah`;
    }
  };

  // Handle carousel scroll for pagination indicators
  const handleScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / (CARD_WIDTH + 32)); // 32 is the gap
    setCurrentIndex(Math.min(index, items.length - 1));
  };

  // Handle item selection
  const handleSelectItem = (index: number) => {
    if (mode === 'surah') {
      onSelectSurah(items[index] as QuranSurah);
    } else {
      onSelectJuz(items[index] as JuzGroup);
    }
  };

  // Render carousel item
  const renderItem = ({ item, index }: { item: any; index: number }) => (
    <TouchableOpacity
      onPress={() => handleSelectItem(index)}
      style={{
        width: CARD_WIDTH,
        marginRight: 16,
      }}>
      <ThemedView
        style={{
          backgroundColor: tintColor,
          borderRadius: 16,
          padding: 20,
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 160,
        }}>
        {/* Title */}
        <ThemedText
          style={{
            fontSize: 24,
            fontWeight: '700',
            color: backgroundColor,
            textAlign: 'center',
          }}>
          {getItemTitle(index)}
        </ThemedText>

        {/* Subtitle */}
        <ThemedText
          style={{
            fontSize: 14,
            color: backgroundColor,
            textAlign: 'center',
            marginTop: 8,
            opacity: 0.9,
          }}>
          {getItemSubtitle(index)}
        </ThemedText>

        {/* Arrow indicator */}
        <View style={{ marginTop: 12 }}>
          <IconSymbol name="arrow.right" size={20} color={backgroundColor} />
        </View>
      </ThemedView>
    </TouchableOpacity>
  );

  return (
    <ThemedView
      style={{
        paddingVertical: 20,
        paddingHorizontal: 16,
        backgroundColor,
        borderTopWidth: 1,
        borderTopColor: tintColor,
        marginTop: 8,
      }}>
      {/* Header */}
      <ThemedView
        style={{
          marginBottom: 16,
        }}>
        <ThemedText
          style={{
            fontSize: 16,
            fontWeight: '700',
            color: textColor,
            marginBottom: 12,
          }}>
          Lanjutkan Membaca
        </ThemedText>

        {/* Mode Toggle Buttons */}
        <ThemedView
          style={{
            flexDirection: 'row',
            gap: 8,
          }}>
          <TouchableOpacity
            onPress={() => {
              setMode('surah');
              setCurrentIndex(0);
              if (flatListRef.current) {
                flatListRef.current.scrollToIndex({ index: 0, animated: true });
              }
            }}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: mode === 'surah' ? tintColor : 'transparent',
              borderWidth: mode === 'surah' ? 0 : 1,
              borderColor: mode === 'surah' ? 'transparent' : tintColor,
            }}>
            <ThemedText
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: mode === 'surah' ? backgroundColor : tintColor,
                textAlign: 'center',
              }}>
              Surah
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setMode('juz');
              setCurrentIndex(0);
              if (flatListRef.current) {
                flatListRef.current.scrollToIndex({ index: 0, animated: true });
              }
            }}
            style={{
              flex: 1,
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: mode === 'juz' ? tintColor : 'transparent',
              borderWidth: mode === 'juz' ? 0 : 1,
              borderColor: mode === 'juz' ? 'transparent' : tintColor,
            }}>
            <ThemedText
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: mode === 'juz' ? backgroundColor : tintColor,
                textAlign: 'center',
              }}>
              Juz
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        keyExtractor={(item, index) => `item-${index}`}
        contentContainerStyle={{
          paddingHorizontal: 0,
        }}
      />

      {/* Pagination Dots */}
      <ThemedView
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 6,
          marginTop: 12,
        }}>
        {items.slice(0, Math.min(5, items.length)).map((_, index) => (
          <View
            key={index}
            style={{
              width: currentIndex === index ? 24 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: currentIndex === index ? tintColor : tintColor,
              opacity: currentIndex === index ? 1 : 0.3,
            }}
          />
        ))}
        {items.length > 5 && (
          <ThemedText
            style={{
              fontSize: 12,
              opacity: 0.6,
              marginLeft: 4,
            }}>
            ...
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );
}
