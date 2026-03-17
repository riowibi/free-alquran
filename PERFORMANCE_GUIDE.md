# 🎯 Performance & Best Practices Guide

## Table of Contents
1. [Component Optimization](#component-optimization)
2. [Hook Best Practices](#hook-best-practices)
3. [Service Layer Guidelines](#service-layer-guidelines)
4. [Cross-Platform Considerations](#cross-platform-considerations)
5. [Debugging & Performance Monitoring](#debugging--performance-monitoring)

---

## Component Optimization

### ✅ DO: Use React.memo for Expensive Components

```typescript
import { memo, useCallback } from 'react';

interface Props {
  data: VersData;
  onPress: (id: number) => void;
  color: string;
}

function VerseItemImpl({ data, onPress, color }: Props) {
  const handlePress = useCallback(() => {
    onPress(data.id);
  }, [data.id, onPress]);

  return (
    <TouchableOpacity onPress={handlePress}>
      {/* Render */}
    </TouchableOpacity>
  );
}

// Custom comparison for optimization
const arePropsEqual = (prev: Props, next: Props) => {
  return (
    prev.data.id === next.data.id &&
    prev.color === next.color
  );
};

export const VerseItem = memo(VerseItemImpl, arePropsEqual);
```

### ❌ DON'T: Inline Function Definitions

```typescript
// ❌ BAD - Creates new function on every render
<TouchableOpacity onPress={() => handlePress(item.id)}>
  
// ✅ GOOD - Memoized with useCallback
const handlePress = useCallback(() => {
  onPress(item.id);
}, [item.id, onPress]);

<TouchableOpacity onPress={handlePress}>
```

### ✅ DO: Use useMemo for Expensive Calculations

```typescript
const uniqueSurahs = useMemo(() => {
  const seen = new Set<number>();
  return surahs
    .filter(s => {
      if (seen.has(s.number)) return false;
      seen.add(s.number);
      return true;
    })
    .sort((a, b) => a.number - b.number);
}, [surahs]);
```

### ❌ DON'T: Calculate in Render

```typescript
// ❌ BAD - Recalculates every render
const sorted = surahs.sort((a, b) => a.number - b.number).filter(...);

// ✅ GOOD - Only recalculates when surahs change
const sorted = useMemo(() => 
  surahs.sort((a, b) => a.number - b.number).filter(...)
, [surahs]);
```

---

## Hook Best Practices

### ✅ DO: Memoize Callback Dependencies

```typescript
const getSurah = useCallback((surahNumber: number) => {
  return surahs.find(s => s.number === surahNumber);
}, [surahs]);

const isVerseBookmarked = useCallback(
  (surahNumber: number, verseNumber: number) => {
    return bookmarks.some(
      b => b.surahNumber === surahNumber && b.verseNumber === verseNumber
    );
  },
  [bookmarks]
);
```

### ✅ DO: Use Caching in Services

```typescript
// In QuranStorage service
let cachedBookmarks: Bookmark[] | null = null;

static async getBookmarks(): Promise<Bookmark[]> {
  if (cachedBookmarks !== null) {
    return cachedBookmarks;
  }
  const bookmarks = await this.loadFromStorage();
  cachedBookmarks = bookmarks;
  return bookmarks;
}

// Clear cache when data changes
static async setBookmarks(bookmarks: Bookmark[]): Promise<void> {
  await this.saveToStorage(bookmarks);
  cachedBookmarks = bookmarks; // Update cache
}
```

### ❌ DON'T: Overuse useEffect

```typescript
// ❌ BAD - Multiple effects, hard to track
useEffect(() => { /* load */ }, []);
useEffect(() => { /* save */ }, [data]);
useEffect(() => { /* cleanup */ }, [data]);

// ✅ GOOD - Consolidate related effects
useEffect(() => {
  const load = async () => {
    const savedData = await storage.getData();
    setData(savedData);
  };
  load();
  
  return () => {
    // Cleanup
  };
}, []);
```

---

## Service Layer Guidelines

### ✅ DO: Consolidate Similar Logic

```typescript
// ✅ GOOD - Reusable utility
export const deduplicateBookmarks = (bookmarks: Bookmark[]) => {
  const uniqueMap = new Map<string, Bookmark>();
  const duplicates: string[] = [];
  
  bookmarks.forEach(bm => {
    const key = `${bm.surahNumber}-${bm.verseNumber}`;
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, bm);
    } else {
      duplicates.push(bm.id);
    }
  });
  
  return { unique: Array.from(uniqueMap.values()), duplicates };
};

// Use in multiple places
const { unique, duplicates } = deduplicateBookmarks(bookmarks);
```

### ✅ DO: Use Conditional Logging for Debugging

```typescript
// In services/utils.ts
export const DEBUG = {
  VERBOSE: false,
  PERFORMANCE: false,
};

export const logDebug = (module: string, message: string, data?: any) => {
  if (DEBUG.VERBOSE) {
    console.log(`[${module}] ${message}`, data || '');
  }
};

// Usage
logDebug('MODULE_NAME', 'Operation completed', { result });
```

### ❌ DON'T: Scatter Console.logs Everywhere

```typescript
// ❌ BAD - 50+ console.logs in production build
console.log('Loading data...');
console.log('Data loaded:', data);
console.log('Processing verse:', verse);

// ✅ GOOD - Centralized debug control
if (DEBUG.VERBOSE) {
  console.log('[SERVICE] Operation:', data);
}
```

### ✅ DO: Handle Async Operations Properly

```typescript
// ✅ GOOD - Proper error handling
static async getBookmarks(): Promise<Bookmark[]> {
  try {
    if (cachedBookmarks !== null) {
      return cachedBookmarks;
    }
    
    const data = await this.getItem(STORAGE_KEYS.BOOKMARKS);
    cachedBookmarks = data ? JSON.parse(data) : [];
    return cachedBookmarks;
  } catch (error) {
    console.error('❌ Error retrieving bookmarks:', error);
    return [];
  }
}
```

---

## Cross-Platform Considerations

### ✅ DO: Detect Platform Correctly

```typescript
import { Platform } from 'react-native';

// Platform-specific logic
if (Platform.OS === 'web') {
  // Web-specific implementation
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(key, value);
  }
} else if (Platform.OS === 'ios' || Platform.OS === 'android') {
  // Native-specific implementation
  await FileSystem.writeAsStringAsync(filepath, value);
}
```

### ✅ DO: Provide Fallbacks

```typescript
// Storage service with fallback
const memoryStorage: { [key: string]: string } = {};

export class QuranStorage {
  private static async setItem(key: string, value: string): Promise<void> {
    try {
      // Try primary storage
      if (Platform.OS === 'web') {
        localStorage.setItem(key, value);
      } else {
        await FileSystem.writeAsStringAsync(path, value);
      }
    } catch (error) {
      // Fallback to memory storage
      console.warn(`⚠️ Failed to write ${key}, using memory storage`);
      memoryStorage[key] = value;
    }
  }
}
```

### ✅ DO: Test on All Platforms

```bash
# Test on Android
expo run:android

# Test on iOS
expo run:ios

# Test on Web
expo start --web
```

---

## Debugging & Performance Monitoring

### Enable Debug Mode

```typescript
// In services/utils.ts
export const DEBUG = {
  VERBOSE: true,   // Change to enable detailed logging
  PERFORMANCE: true, // Change to enable performance metrics
};
```

### Use Performance Measurement

```typescript
import { measurePerformance } from '@/services/utils';

// Measure async operation
const result = await measurePerformance(
  'MODULE_NAME',
  'Operation Name',
  async () => {
    // Your operation
    return await someAsyncFunction();
  }
);

// Output: ⚡ [MODULE_NAME] Operation Name: 125.45ms
```

### Monitor Component Renders

```typescript
// Use React DevTools Profiler
import { Profiler } from 'react';

<Profiler id="VerseCard" onRender={onRenderCallback}>
  <VerseCard {...props} />
</Profiler>
```

### Check Memory Usage

```typescript
// React Native Performance Monitor
import { PerformanceMonitor } from '@react-navigation/bottom-tabs';

// Monitor in __DEV__ only
if (__DEV__) {
  console.log('Memory:', Math.round(process.memoryUsage().heapUsed / 1024 / 1024), 'MB');
}
```

---

## Common Performance Patterns

### Pattern 1: Optimized List Rendering

```typescript
import { FlatList } from 'react-native';
import { memo } from 'react';

const VerseItem = memo((props) => <VersCard {...props} />, areEqual);

export function VersesList({ verses }: Props) {
  return (
    <FlatList
      data={verses}
      keyExtractor={(v) => v.number.toString()}
      renderItem={({ item }) => <VerseItem verse={item} />}
      maxToRenderPerBatch={15}
      updateCellsBatchingPeriod={50}
      initialNumToRender={20}
      removeClippedSubviews={true}
    />
  );
}
```

### Pattern 2: Lazy Data Loading

```typescript
// Load data on demand, not all at once
async function loadSurah(surahNumber: number) {
  const cached = cache.get(surahNumber);
  if (cached) return cached;
  
  const surah = await QuranAPI.fetchSurah(surahNumber);
  cache.set(surahNumber, surah);
  return surah;
}
```

### Pattern 3: Debounced Operations

```typescript
import { useCallback, useRef } from 'react';

export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

// Usage
const debouncedSearch = useDebounce((query: string) => {
  performSearch(query);
}, 300);
```

---

## Performance Checklist

### Before Commit
- [ ] No unnecessary console.logs in production code
- [ ] All components hitting render are memoized if expensive
- [ ] useCallback used for all callback props
- [ ] useMemo used for expensive calculations
- [ ] No array/object created inline in render
- [ ] FlatList has keyExtractor and optimizations
- [ ] No memory leaks in useEffect

### Before Release
- [ ] Profiler shows no unexpected renders
- [ ] Bundle size verified
- [ ] Performance acceptable on low-end device
- [ ] Memory usage stable over 5 minutes
- [ ] No console errors or warnings
- [ ] All platforms tested
- [ ] Offline mode works smoothly

---

## Resources

- [React Performance Optimization](https://react.dev/reference/react/memo)
- [React Native Optimization](https://reactnative.dev/docs/performance)
- [Expo Performance Tips](https://docs.expo.dev/guides/performance/)
- [React DevTools Profiler](https://react-devtools-profiler.vercel.app/)

---

**Last Updated**: March 17, 2026
**Version**: 1.0
**Status**: Active & Maintained
