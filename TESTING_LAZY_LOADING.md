# Testing Guide untuk Virtual Scrolling Implementation

## Quick Setup

```bash
# 1. Install dependencies (sudah ada)
npm install

# 2. Start Expo
npx expo start

# 3. Open di Android/iOS device atau emulator
# Press 'a' untuk Android, 'i' untuk iOS
```

## Manual Testing Scenarios

### Scenario 1: Basic Verse Loading ✅

**Steps**:
1. Buka app → Navigate ke "Baca"
2. Pilih Surah (misal Surah Al-Baqarah dengan 286 ayat)
3. Lihat halaman membaca

**Expected**:
- Page loads quickly (< 1 detik)
- First 10 verses visible immediately
- Header (judul surah) terlihat
- Scrolling smooth tanpa lag

**Failure Signs**:
- ❌ Page loading > 2 detik
- ❌ Visible ayat terputus (white space)
- ❌ Memory meningkat drastis

---

### Scenario 2: Smooth Scrolling dengan 200+ Ayat 🎯

**Steps**:
1. Buka Juz (e.g., Juz 1 dengan ~180 ayat)
2. Scroll slowly dari top ke bottom
3. Pantau frame rate dengan React DevTools

**Expected**:
- Frame rate 55-60 FPS (smooth)
- Tidak ada lag atau janky frames
- FlatList load more ayat seiring scroll
- Memory stable <10MB

**Failure Signs**:
- ❌ Frame drop < 30 FPS
- ❌ Ayat tidak load saat scroll
- ❌ Memory ramp up ke 50MB+

**Debug**:
```typescript
// Add ini di VersesList untuk debug
const handleScroll = (event) => {
  const offset = event.nativeEvent.contentOffset.y;
  console.log(`[SCROLL] Offset: ${offset}px`);
};

<FlatList onScroll={handleScroll} ... />
```

---

### Scenario 3: "Continue Reading" Feature 📖

**Steps**:
1. Buka Surah dan scroll ke tengah (misal ayat ke 100)
2. Tap surah lain
3. Kembali ke surah yang sebelumnya

**Expected**:
- Auto scroll kembali ke ayat ke-100
- Smooth scroll transition
- Position preserved

**Failure Signs**:
- ❌ Scroll ke top, bukan position terakhir
- ❌ Scroll abrupt/jerky
- ❌ Position lost saat reload

---

### Scenario 4: Bookmark Integration 🔖

**Steps**:
1. Long press suatu ayat
2. Pilih "Bookmark"
3. Navigate ke page lain
4. Back ke ayat yang di-bookmark
5. Verify bookmark icon highlighted

**Expected**:
- Bookmark tersimpan
- Icon berubah state setelah bookmark
- Quick action masih responsive

**Failure Signs**:
- ❌ Bookmark tidak tersimpan
- ❌ UI lag saat bookmark
- ❌ Icon tidak update

---

### Scenario 5: Juz View dengan Multiple Surahs 📚

**Steps**:
1. Pilih Juz view (misal Juz 29)
2. Scroll through entire juz
3. Verify surah separators muncul di tempat yang tepat

**Expected**:
- Separators terlihat antara surah
- Surah names display correctly
- No duplicate ayat atau separator
- Smooth transition antar surah

**Failure Signs**:
- ❌ Separator di tempat wrong
- ❌ Duplicate ayat
- ❌ Missing separator antara surah

---

### Scenario 6: Search/Navigation Performance 🔍

**Steps**:
1. Dari halaman list, tap "Kembali" ke surah list
2. Switch antara Surah view dan Juz view
3. Monitor loading time

**Expected**:
- Switch view instant (< 500ms)
- No visible lag
- Memory properly cleaned up

**Failure Signs**:
- ❌ Memory leak (memory tidak decrease)
- ❌ Slow switch (> 1 detik)
- ❌ Crash saat switch

---

### Scenario 7: Low-End Device Simulation 📱

**Steps** (Android Emulator):
1. Buka Android Studio Emulator
2. Extended controls → CPU Throttle
3. Buka Juz dengan 200+ ayat
4. Scroll fast

**Expected**:
- Tetap bisa digunakan, meskipun lambat
- No crash
- Graceful degradation

**Failure Signs**:
- ❌ App freeze
- ❌ Out of memory crash
- ❌ ANR (Application Not Responding)

---

## Automated Testing

### Performance Test Script
```typescript
// __tests__/verses-rendering.test.tsx
import { render, screen, waitFor } from '@testing-library/react-native';
import { VersesList } from '../VersesList';

describe('VersesList Performance', () => {
  it('should render initial 10 verses', async () => {
    const mockSurah = {
      number: 2,
      englishName: 'Al-Baqarah',
      verses: Array(286).fill({}).map((_, i) => ({
        number: i + 1,
        numberInSurah: i + 1,
        text: 'Test verse',
      })),
    };

    render(
      <VersesList
        surah={mockSurah}
        juzGroups={[]}
        isFromExternalNav={false}
        lastReadProgress={null}
        // ... other props
      />
    );

    // Initial render should show only first 10
    await waitFor(() => {
      const verseElements = screen.getAllByTestId('verse-card');
      expect(verseElements.length).toBeLessThanOrEqual(15); // 10 + buffer
    });
  });

  it('should handle scroll events efficiently', async () => {
    // Performance monitoring
    const startTime = performance.now();
    
    // Simulate scroll
    fireEvent.scroll(screen.getByTestId('verse-flatlist'), {
      nativeEvent: { contentOffset: { y: 1000 } },
    });

    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(100); // < 100ms
  });
});
```

---

## Memory Profiling

### Using React Native Debugger

1. **Setup**:
   ```bash
   npm install -g react-native-debugger
   react-native-debugger
   ```

2. **Connect**:
   - Run app dengan debugger mode
   - Debugger akan auto connect

3. **Memory Profiler**:
   - Open DevTools → Memory tab
   - Take snapshot di awal
   - Scroll through verses
   - Take snapshot di akhir
   - Compare growth

**Expected Growth**: < 10MB dari snapshot awal ke akhir

### Manually Track Memory
```typescript
// Add di VersesList
import { getMemoryUsage } from '@react-native-community/hooks';

const { usedMemory } = getMemoryUsage();

useEffect(() => {
  console.log(`[MEMORY] Used: ${usedMemory}MB`);
}, [usedMemory]);
```

---

## Frame Rate Monitoring

### Using Frame Rate Monitor
```typescript
// Install
npm install react-native-frame-rate-monitor

// Use in VersesList
import { enableFrameRateMonitor } from 'react-native-frame-rate-monitor';

useEffect(() => {
  enableFrameRateMonitor(30); // Warn if < 30 FPS
}, []);
```

---

## Regression Testing Checklist

Sebelum push ke production, verify:

- [ ] Initial load < 1.5 detik
- [ ] Scroll frame rate > 50 FPS
- [ ] Memory < 15MB saat listing 200+ ayat
- [ ] No console errors
- [ ] Bookmark functionality intact
- [ ] Continue reading works
- [ ] Juz separators display correct
- [ ] No duplicate ayat
- [ ] Back button works
- [ ] App tidak crash dengan 300+ ayat
- [ ] RTL layout tetap correct
- [ ] Dark theme intact
- [ ] Light theme intact
- [ ] Share functionality works (jika ada)

---

## Edge Cases Testing

### 1. Open Full Quran (114 Surahs)
```typescript
// This should NOT load all at once
const allSurahs = surahs.map(s => ({...s}));
render(<SurahsList surahs={allSurahs} />);
// Expected: Only visible surahs rendered
```

### 2. Rapid Switching
```typescript
// Quick switch antara verses dan juz
for (let i = 0; i < 5; i++) {
  navigate('read', { type: 'surah', id: 2 });
  navigate('read', { type: 'juz', id: 1 });
}
// Expected: No memory leak, no crash
```

### 3. Long Press While Scrolling
```typescript
// Simulate long press while momentum scroll
fireEvent.scroll(flatList, { offset: 500 });
fireEvent.longPress(verseCard);
// Expected: Bookmark dialog appear, no overlap
```

---

## Performance Benchmarks

Record baseline untuk future comparison:

```typescript
// benchmarks.ts
export const BASELINE = {
  initialLoadTime: 800, // ms
  scrollFrameRate: 55, // fps
  memoryUsage: 8, // MB
  bookmarkTime: 100, // ms
};

// Compare di test
const currentPerf = measurePerformance();
expect(currentPerf.initialLoadTime).toBeLessThan(BASELINE.initialLoadTime * 1.2);
```

---

## Quick Debug Commands

```typescript
// Enable all logs
expo DEBUG=* npm start

// Connect debugger
ctrl + m (Android) → Remote debugging

// Clear cache
expo start --clear

// Hard reset
rm -rf node_modules && npm install && expo start --clear
```

---

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| White flashing | Re-render | Add `key` prop, use `memo` |
| Scroll jank | Too many renders | Increase `updateCellsBatchingPeriod` |
| Memory leak | Not removing listeners | Check cleanup in useEffect |
| Items not loading | Wrong `windowSize` | Increase `windowSize` config |
| Bookmarks lost | Not persisted | Check AsyncStorage |

---

## Success Metrics

✅ **Implementation berhasil jika**:
1. Page load < 1 detik
2. Scroll 60 FPS consistently
3. Memory < 10MB untuk 200 ayat
4. No yellow warnings
5. All features work correctly

