# Optimization Tips & Best Practices untuk Virtual Verse Lists

## 1. Monitoring Performance

### Menggunakan React DevTools Profiler
```typescript
// app/(tabs)/read.tsx
import { Profiler } from 'react';

export default function ReadScreen() {
  const onRender = (id, phase, actualDuration) => {
    console.log(`[PERF] ${id} (${phase}) took ${actualDuration}ms`);
  };

  return (
    <Profiler id="ReadScreen" onRender={onRender}>
      {/* Your components */}
    </Profiler>
  );
}
```

### Tracking Frame Rate
```typescript
// Gunakan React Native Performance Monitor
import { PerformanceObserver } from 'react-native-performance';

// Akan log jika frame rate drop
PerformanceObserver.observe({
  name: 'scroll',
  callback: ({ name, duration }) => {
    if (duration > 16.7) { // 60 FPS = 16.7ms per frame
      console.warn(`[SLOW_FRAME] ${duration}ms`);
    }
  }
});
```

## 2. FlatList Tuning

### Untuk Device Lama (Performa Rendah)
```typescript
// Di VERSE_LIST_CONFIG untuk device tua
initialNumToRender: 5,        // Render hanya 5 pertama
maxToRenderPerBatch: 3,       // Batch 3 per update
windowSize: 5,                // Buffer lebih kecil
updateCellsBatchingPeriod: 100 // Update lebih jarang
```

### Untuk Device Baru (Performa Tinggi)
```typescript
initialNumToRender: 15,       // Lebih banyak render initial
maxToRenderPerBatch: 10,
windowSize: 15,
updateCellsBatchingPeriod: 30 // Update lebih sering
```

### Adaptive Configuration
```typescript
// hooks/useDevicePerformance.ts
import { Platform } from 'react-native';

export function getOptimalFlatListConfig() {
  const isHighEndDevice = Platform.OS === 'android' 
    ? false // Assume Android bisa lower-end
    : true;  // iOS usually more consistent
  
  return isHighEndDevice ? HIGH_END_CONFIG : LOW_END_CONFIG;
}
```

## 3. Memory Optimization

### Memo untuk VerseCard (Prevent Re-render)
```typescript
// components/VerseCard.tsx
import { memo } from 'react';

export const VerseCard = memo(function VerseCard(props: VerseCardProps) {
  // Component...
}, (prev, next) => {
  // Custom comparison untuk prevention unnecessary re-render
  return (
    prev.verse.number === next.verse.number &&
    prev.isBookmarked === next.isBookmarked &&
    prev.backgroundColor === next.backgroundColor
  );
});
```

### Lazy Load Image/Assets
```typescript
// Jika ada image di VerseCard
import { Image } from 'expo-image';

// Gunakan blurhash jika available
<Image
  source={imageUri}
  placeholder={blurhashString}
  contentFit="cover"
  // Won't load sampai item visible
/>
```

## 4. Batch Update Optimization

### Non-Blocking Re-renders
```typescript
// useVirtualizedVerseList.ts
const recordVerseHeight = useCallback((verseIndex: number, height: number) => {
  // Jangan state update untuk setiap verse
  // Gunakan ref dan batch update
  verseHeightsRef.current.set(verseIndex, height);
  
  // Batch update every 500ms
  batchUpdateTimerRef.current = setTimeout(() => {
    setVerseHeights(new Map(verseHeightsRef.current));
  }, 500);
}, []);
```

## 5. Smooth Scrolling

### Scroll Event Throttling
```typescript
// Sudah implemented
scrollEventThrottle={16} // Update every 16ms (60 FPS)

// Untuk device lama
scrollEventThrottle={32} // Update setiap 32ms (30 FPS)
```

### Momentum Scroll
```typescript
// app/(tabs)/components/VersesList.tsx
<FlatList
  decelerationRate="fast"
  scrollEventThrottle={16}
  onScroll={Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollYAnim } } }],
    { 
      listener: handleScroll,
      useNativeDriver: true // Off-thread animation
    }
  )}
/>
```

## 6. Testing Dengan Performa Rendah

### Simulate Low-End Device di Android Studio
1. Open Android Studio Emulator
2. Extended controls → Throttle
3. Set Network: Slow 4G
4. Set CPU: Throttle

### Profiling Commands
```bash
# React Native Debugger
react-native log-ios    # iOS console logs
react-native log-android # Android Logcat

# Expo tools
npx exp logs              # Real-time logs
```

## 7. Bookmark & Progress Integration

### Efficient Storage Update
```typescript
// Jangan update setiap scroll event
// Batching update setiap 5 detik
const updateProgressThrottled = useCallback(() => {
  const delay = setTimeout(() => {
    updateReadingProgress({
      surahNumber,
      verseNumber: currentVerse,
      scrollPosition: scrollY.value,
    });
  }, 5000);
  
  return () => clearTimeout(delay);
}, []);
```

## 8. Common Issues & Solutions

### Issue: Scroll Position Lost Saat Switch Tab
**Solution**:
```typescript
// hooks/useVerseScroll.ts
useEffect(() => {
  // Save scroll position sebelum unmount
  return () => {
    updateReadingProgress({
      ...lastReadProgress,
      scrollPosition: flatListRef.current?.scrollOffset,
    });
  };
}, []);
```

### Issue: Jumping Scroll Saat Loading Data
**Solution**:
```typescript
// Disable scroll sampai data fully loaded
<FlatList
  scrollEnabled={!isLoading}
  data={verses}
  // ...
/>
```

### Issue: White Flash Saat FlatList Re-render
**Solution**:
```typescript
// Maintain scroll position
<FlatList
  maintainVisibleContentPosition={{
    minIndexForVisible: 0,
    autoscrollToTopThreshold: 10,
  }}
  // ...
/>
```

## 9. Advanced: Virtualization dengan Sections

Jika nanti butuh section headers (e.g., Juz number header):

```typescript
// Gunakan SectionList instead of FlatList
import { SectionList } from 'react-native';

const sections = [
  {
    title: 'Juz 1',
    data: [verse1, verse2, ...],
  },
  {
    title: 'Juz 2',
    data: [verse30, verse31, ...],
  },
];

<SectionList
  sections={sections}
  renderItem={({ item }) => <VerseCard verse={item} />}
  renderSectionHeader={({ section: { title } }) => <Header title={title} />}
  // ... FlatList config applies same
/>
```

## 10. Monitoring in Production

### Crash Analytics (performance)
```typescript
// Sentry atau similar
import * as Sentry from "sentry-expo";

Sentry.captureException(new Error("Slow scroll detected"));

// Track performa
Sentry.captureMessage('Verse load time: 250ms', 'info');
```

## Checklist Optimization

- [ ] Verse card di-memoize
- [ ] FlatList config sesuai device capability
- [ ] Scroll position persisted
- [ ] No memory leaks (cleanup useEffect)
- [ ] Batch updates implemented
- [ ] Error boundary untuk verse card
- [ ] Testing di low-end device
- [ ] Profiling di DevTools

## Resources
- [React Native Performance Tips](https://reactnative.dev/docs/performance)
- [FlatList Advanced Configuration](https://reactnative.dev/docs/flatlist#updatecellsbatchingperiod)
- [Reanimated 2 for Smooth Animation](https://docs.swmansion.com/react-native-reanimated/)
