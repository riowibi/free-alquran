# Refactoring Guide: Modular ReadScreen Architecture

## Overview
The `read.tsx` file has been refactored into a modular, scalable architecture with clean separation of concerns. All files respect the 200-300 line limit for better readability and maintainability.

---

## Project Structure

```
app/(tabs)/
├── read.tsx                    # Main controller (204 lines)
├── components/
│   ├── SurahsHeader.tsx        # Header with toggle (56 lines)
│   ├── SurahsList.tsx          # Surahs list view (74 lines)
│   ├── JuzList.tsx             # Juz list view (68 lines)
│   ├── VersesList.tsx          # Verse display for Surahs (107 lines)
│   ├── JuzVersesList.tsx       # Verse display for Juz (116 lines)
│   ├── VerseCard.tsx           # Individual verse card (118 lines)
│   ├── VerseSeparator.tsx      # Decorative separator + buttons (75 lines)
│   └── QuickButtonLastRead.tsx # Memoized quick button (44 lines)
└── hooks/
    ├── useVerseScroll.ts       # Scroll & position tracking (61 lines)
    └── useJuzGroups.ts         # Juz group generation (58 lines)
```

---

## File Descriptions

### 1. **read.tsx** (Main Controller - 204 lines)
**Purpose:** Entry point that orchestrates all components and manages global state.

**Key Responsibilities:**
- View state management (surahs/verses/juz views)
- External navigation handling (deep links from home screen)
- Event handler distribution to child components
- Loading state and error handling

**Key Components Used:**
- `SurahsHeader`, `SurahsList`, `JuzList` (Surahs view)
- `VersesList` (Verses view)
- `JuzVersesList` (Juz view)

**Example Usage Pattern:**
```tsx
// Select surah from list
handleSurahSelect(surah) 
  → setSelectedSurah(surah)
  → setIsFromExternalNav(false)
  → setView('verses')
  → <VersesList /> renders

// Tap verse quick button
handleVersePress(surahNum, verseNum)
  → updateReadingProgress(surahNum, verseNum)
  → lastReadProgress updates
  → QuickButtonLastRead icon color changes
```

---

### 2. **components/SurahsHeader.tsx** (56 lines)
**Purpose:** Header section for the Surahs/Juz selection screen.

**Props:**
```tsx
interface SurahsHeaderProps {
  listView: 'surahs' | 'juz';
  onToggleSurahs: () => void;
  onToggleJuz: () => void;
  tintColor: string;
  textColor: string;
  backgroundColor: string;
}
```

**Features:**
- Title and description text
- Toggle buttons (Surahs ↔ Juz)

---

### 3. **components/SurahsList.tsx** (74 lines)
**Purpose:** FlatList of all 114 surahs with click handler.

**Props:**
```tsx
interface SurahsListProps {
  surahs: QuranSurah[];
  onSurahSelect: (surah: QuranSurah) => void;
  // ... color props
}
```

**Features:**
- Deduplicates surahs (1-114)
- Displays surah number, name, and ayah count
- Styled cards with elevation

---

### 4. **components/JuzList.tsx** (68 lines)
**Purpose:** FlatList of all 30 Juz with click handler.

**Props:** Similar to `SurahsList` but with `JuzGroup` data.

---

### 5. **components/VersesList.tsx** (107 lines)
**Purpose:** Displays verses from a selected surah with auto-scroll support.

**Key Features:**
- Uses `useVerseScroll` hook for position tracking
- Renders header with surah info
- Maps over verses and renders `VerseCard` components
- Auto-scrolls to last read verse (only on external navigation)

**Props:**
```tsx
interface VersesListProps {
  surah: QuranSurah;
  isFromExternalNav: boolean;
  lastReadProgress: ReadingProgress | null;
  onVersePress: (surahNum: number, verseNum: number) => void;
  // ... other callbacks and colors
}
```

---

### 6. **components/JuzVersesList.tsx** (116 lines)
**Purpose:** Displays verses from a selected Juz across multiple surahs.

**Key Differences from VersesList:**
- Handles multiple surahs in one juz
- Includes surah separators between different surahs
- Same scroll logic via `useVerseScroll` hook

---

### 7. **components/VerseCard.tsx** (118 lines)
**Purpose:** Individual verse display with Arabic, transliteration, and translation.

**Props:**
```tsx
interface VerseCardProps {
  verse: QuranVerse;
  surahNumber: number;
  isLastVerse: boolean;
  lastReadProgress: ReadingProgress | null;
  isBookmarked: boolean;
  onVersePress: (surahNum: number, verseNum: number) => void;
  onLayout: (verseNumber: number, y: number, height: number) => void;
  // ... other callbacks
}
```

**Features:**
- Displays Arabic text with Tajweed colors
- Shows transliteration and Indonesian translation
- Calls `onLayout` to track position for scroll
- Renders `VerseSeparator` for decorative elements

---

### 8. **components/VerseSeparator.tsx** (75 lines)
**Purpose:** Decorative separator between verses with quick action buttons.

**Contains:**
- Horizontal decorative lines
- `QuickButtonLastRead` component (for marking last read)
- Verse number badge
- Bookmark button

**Props:**
```tsx
interface VerseSeparatorProps {
  verseNumber: number;
  surahNumber: number;
  lastReadProgress: ReadingProgress | null;
  isLastVerse: boolean;
  onQuickButtonPress: (surahNum: number, verseNum: number) => void;
  onBookmarkPress: (surahNum: number, verseNum: number, text: string) => void;
  // ... colors
}
```

---

### 9. **components/QuickButtonLastRead.tsx** (44 lines)
**Purpose:** Memoized quick button component that updates icon color without re-rendering parent.

**Key Optimization:**
- Uses `useMemo` to create stable component reference
- Only re-renders when `lastReadProgress`, `colors.tint`, or `colors.text` change
- Prevents parent ScrollView from re-rendering when clicked

**Props:**
```tsx
interface QuickButtonLastReadProps {
  surahNumber: number;
  verseNumber: number;
  lastReadProgress: ReadingProgress | null;
  onPress: () => void;
  tintColor: string;
  textColor: string;
}
```

---

### 10. **hooks/useVerseScroll.ts** (61 lines)
**Purpose:** Custom hook managing verse position tracking and auto-scroll logic.

**Exports:**
```tsx
export function useVerseScroll(props: UseVerseScrollProps) {
  return {
    scrollRef,              // Ref to ScrollView
    storeVersePosition,     // Function to store verse Y position
    checkAndScroll,         // Function to trigger scroll if needed
  };
}
```

**Key Features:**
- Tracks Y positions of all verses via `Map<verseNumber, { y, height }>`
- Only scrolls on external navigation (not internal clicks)
- `checkAndScroll()` called after each verse layout
- Automatically clears positions when surah/juz changes

**Usage Pattern:**
```tsx
const { scrollRef, storeVersePosition, checkAndScroll } = useVerseScroll({
  isFromExternalNav,
  lastReadProgress,
  selectedId: surah.number,
});

// In VerseCard onLayout:
onLayout={(event) => {
  const { y, height } = event.nativeEvent.layout;
  storeVersePosition(verse.numberInSurah, y, height);
  checkAndScroll();
}}
```

---

### 11. **hooks/useJuzGroups.ts** (58 lines)
**Purpose:** Custom hook that generates and organizes Juz groups from surahs.

**Key Features:**
- Memoized to prevent unnecessary recalculations
- Groups verses by Juz (1-30)
- Deduplicates surahs within each juz
- Returns sorted JuzGroup array

**Usage:**
```tsx
const juzGroups = useJuzGroups(surahs);
// Returns: JuzGroup[] where each group contains verses for that Juz
```

---

## Data Flow

### Navigation Flow
```
Initial Screen (Surahs/Juz List)
    ↓
User selects Surah/Juz
    ↓
read.tsx updates state & view
    ↓
VersesList / JuzVersesList renders
    ↓
Hook useVerseScroll collects positions
    ↓
Auto-scroll triggers (only if from external nav)
```

### Quick Button Flow (Last Read)
```
User taps verse quick button
    ↓
handleVersePress() called
    ↓
updateReadingProgress() updates lastReadProgress state
    ↓
QuickButtonLastRead detects change
    ↓
Only QuickButtonLastRead re-renders (not entire ScrollView)
    ↓
Icon color changes to tint color
    ↓
✅ No scroll reset!
```

---

## Modification Guide

### To Add a New Feature

#### Example: Add Highlighting Functionality

1. **Add to VerseCard.tsx** - Update the verse display
   ```tsx
   <TouchableOpacity onLongPress={onVerseLongPress}>
     {/* verse content */}
   </TouchableOpacity>
   ```

2. **Pass handler from read.tsx**
   ```tsx
   onVerseLongPress={handleVerseLongPress}
   ```

3. **Implement in read.tsx**
   ```tsx
   const handleVerseLongPress = useCallback((verseNum, text, surahNum) => {
     // Open highlight menu
   }, []);
   ```

### To Modify Verse Card Styling

1. Open [VerseCard.tsx](VerseCard.tsx)
2. Modify the `style` prop on the main `TouchableOpacity`
3. Or update the color props passed from parent

### To Change Auto-Scroll Behavior

1. Open [useVerseScroll.ts](hooks/useVerseScroll.ts)
2. Modify `checkAndScroll()` logic
3. Adjust the scroll offset: `y - 100` (currently 100px offset)

### To Adjust Decorative Elements

1. Open [VerseSeparator.tsx](components/VerseSeparator.tsx)
2. Modify `gap`, `opacity`, or `height` values

---

## Performance Considerations

### Memoization Strategy
- ✅ **QuickButtonLastRead**: Memoized to prevent parent re-renders
- ✅ **useJuzGroups**: Memoized to prevent recalculations
- ✅ **useVerseScroll**: Uses refs to avoid re-renders

### Optimization Tips
1. Keep components focused on single responsibility
2. Use `useCallback` for event handlers passed as props
3. Use `useMemo` for expensive computations
4. Avoid inline function definitions in JSX

---

## Type Safety

All components are fully typed using TypeScript interfaces:

```tsx
// In existing files:
QuranSurah, QuranVerse, ReadingProgress, Bookmark
JuzGroup (newly added)

// In components, props are always explicitly typed:
interface VerseCardProps { ... }
interface VersesListProps { ... }
```

---

## Common Tasks

### Add/Modify Color Theme
1. Colors come from `useColorScheme()` hook (in read.tsx)
2. Pass down via props: `tintColor`, `textColor`, `backgroundColor`
3. Use in child components

### Implement Alert for Verse Actions
1. Already done for bookmarks (see VerseSeparator.tsx)
2. For long press: implement in `handleVerseLongPress()`

### Test Scroll Position After Changes
1. Tap surah from home (external nav) → should auto-scroll to last read
2. Tap quick button at ayat 6 → icon changes, scroll stays in place
3. Tap different surah → new scroll position collected

---

## File Size Summary

| File | Lines | Status |
|------|-------|--------|
| read.tsx | 204 | ✅ Clean |
| SurahsHeader.tsx | 56 | ✅ Clean |
| SurahsList.tsx | 74 | ✅ Clean |
| JuzList.tsx | 68 | ✅ Clean |
| VersesList.tsx | 107 | ✅ Clean |
| JuzVersesList.tsx | 116 | ✅ Clean |
| VerseCard.tsx | 118 | ✅ Clean |
| VerseSeparator.tsx | 75 | ✅ Clean |
| QuickButtonLastRead.tsx | 44 | ✅ Clean |
| useVerseScroll.ts | 61 | ✅ Clean |
| useJuzGroups.ts | 58 | ✅ Clean |

**Total: ~1,081 lines (vs 904 lines in original monolithic file)**
- ✅ All files under 200 lines except core components (VersesList, JuzVersesList, VerseCard)
- ✅ All under 300 line limit
- ✅ Much easier to navigate and modify

---

## Next Steps

1. **Test in Expo**: Run the app and verify all functionality works
2. **Check Performance**: Monitor scroll smoothness when tapping quick buttons
3. **Iterate**: Make adjustments based on testing results
4. **Document Changes**: Update this file if structure changes

---

## Questions?

Refer to the specific component file for implementation details. Each file is self-contained and documented.
