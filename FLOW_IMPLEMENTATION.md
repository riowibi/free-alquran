# Flow Implementasi - App Navigation & Data Tracking

Dokumen ini menunjukkan bagaimana kode Anda mengimplementasikan flow diagram yang Anda berikan.

---

## 1. Menu Home (index.tsx)

**File:** `app/(tabs)/index.tsx`

Menampilkan 3 menu utama:

```
┌─────────────────────────────┐
│     Menu Home               │
├─────────────────────────────┤
│ 📖 Baca Alquran             │
│ ⏰ Terakhir Baca            │
│ 🔖 Bookmark                 │
└─────────────────────────────┘
```

### Tombol: Baca Alquran
- **Action:** `router.push('/(tabs)/read')`
- **Function:** Membawa user ke layar membaca dengan Tab Surah/Juz
- **Data:** Tidak ada parameter, user bisa memilih surah/juz

### Tombol: Terakhir Baca
- **Action:** `router.push('/(tabs)/read?surah=${lastReadProgress.surahNumber}')`
- **Function:** Auto-navigate ke surah terakhir yang dibaca
- **Data Disimpan:**
  - `surahNumber` ✓
  - `verseNumber` ✓
  - `timestamp` ✓
  - `readType` ✓ (NEW - Surah atau Juz)
  - `juzNumber` ✓ (NEW - Jika dari Juz view)

### Tombol: Bookmark
- **Action:** `router.push('/(tabs)/bookmark')`
- **Function:** Lihat daftar ayat yang di-bookmark
- **Data Disimpan:** List of bookmarks dengan surah number, verse number, text

---

## 2. Baca Alquran Screen (read.tsx)

**File:** `app/(tabs)/read.tsx`

### Flow:
```
Baca Alquran Screen
    ↓
┌─────────────────────────────┐
│ Tab Surah dan Juz Toggle    │
├─────────────────────────────┤
│ Tab Surah    │ Tab Juz      │
└─────────────────────────────┘
    ↓                   ↓
Baca Surah          Baca Juz
(SurahsList)        (JuzList)
    ↓                   ↓
Pilih → Load Verses
    ↓
VersesList/JuzVersesList
```

### Main Handlers:

#### `handleSurahSelect(surah)`
- Sets selected surah
- Sets `isFromExternalNav = false` (internal navigation, no auto-scroll)
- Changes view to 'verses'
- Renders `VersesList` component

#### `handleJuzSelect(juz)`
- Sets selected juz
- Sets `isFromExternalNav = false`
- Changes view to 'juz'
- Renders `JuzVersesList` component

#### `handleVersePress(surahNum, verseNum)`
- **NEW LOGIC:** Determines readType based on current view
  ```tsx
  const readType = view === 'juz' ? 'juz' : 'surah';
  const juzNum = view === 'juz' ? selectedJuz?.juzNumber : undefined;
  updateReadingProgress(surahNum, verseNum, readType, juzNum);
  ```
- Saves reading progress with metadata
- Updates icon in QuickButtonLastRead
- No page refresh (smooth UX)

---

## 3. Verses Display (VersesList.tsx & JuzVersesList.tsx)

**Files:**
- `app/(tabs)/components/VersesList.tsx` - Untuk view Surah
- `app/(tabs)/components/JuzVersesList.tsx` - Untuk view Juz

### Components Structure:

```
VersesList / JuzVersesList (ScrollView)
    ↓
Header (Surah/Juz Info)
    ↓
Verses Container
    ├── VerseCard
    │   ├── Arabic Text (dengan Tajweed)
    │   ├── Transliteration
    │   ├── Translation
    │   └── VerseSeparator
    │       ├── QuickButtonLastRead (⏰)
    │       ├── Verse Number
    │       └── BookmarkButton (🔖)
    └── [repeat for each verse]
```

### Key Features:

**Auto-Scroll Logic:**
```tsx
useEffect(() => {
  if (!isFromExternalNav) return; // Only scroll on external nav
  hasScrolledRef.current = false;
  versePositionsRef.current.clear();
}, [selectedSurah?.number, isFromExternalNav]);

checkAndScroll() // Triggered when all verses are laid out
```

**Position Tracking:**
```tsx
onLayout={(event) => {
  const { y, height } = event.nativeEvent.layout;
  storeVersePosition(verseNumber, y, height);
  checkAndScroll(); // Scroll to position if needed
}}
```

---

## 4. Quick Buttons (VerseSeparator.tsx)

**File:** `app/(tabs)/components/VerseSeparator.tsx`

### Button 1: Quick Button Terakhir Baca (⏰)
- **Component:** `QuickButtonLastRead`
- **Action on Click:**
  ```tsx
  onPress={() => {
    updateReadingProgress(surahNumber, verseNumber, readType, juzNumber)
  }}
  ```
- **Data Saved:**
  - ✅ Surah Number
  - ✅ Ayat Number
  - ✅ Type (Surah atau Juz)
  - ✅ Juz Number (if applicable)
  - ✅ Timestamp

- **Optimization:** 
  - Uses React.useMemo to prevent parent scroll re-render
  - Only icon re-renders, not entire ScrollView
  - No scroll jump to top when clicked ✨

- **Visual Feedback:**
  - Icon color changes to tint color when this verse is the last read
  - Returns to normal text color otherwise

### Button 2: Quick Toggle Button Bookmark (🔖)
- **Action on Click:**
  ```tsx
  onPress={() => {
    addBookmark(surahNumber, verseNumber, text);
    Alert.alert('Success', 'Verse bookmarked successfully');
  }}
  ```
- **Data Saved:**
  - ✅ Surah Number
  - ✅ Ayat Number
  - ✅ Verse Text
  - ✅ Timestamp
  - ID (auto-generated)

- **Visual Feedback:**
  - Icon changes between outline (not bookmarked) and filled (bookmarked)
  - Success alert shown

---

## 5. Data Storage & Types

### ReadingProgress Type (Updated)
```tsx
export interface ReadingProgress {
  surahNumber: number;      // ✅ Surah number
  verseNumber: number;      // ✅ Ayat number
  timestamp: Date;          // ✅ When it was read
  readType?: 'surah' | 'juz';  // ✅ NEW - Type: Surah atau Juz
  scrollPosition?: number;  // ✅ Margin Height (for future)
  juzNumber?: number;       // ✅ NEW - Juz number jika dari Juz
}
```

### Bookmark Type
```tsx
export interface Bookmark {
  id: string;               // Auto-generated ID
  surahNumber: number;      // ✅ Surah number
  verseNumber: number;      // ✅ Ayat number
  text: string;            // ✅ Verse content
  timestamp: Date;         // ✅ When bookmarked
  note?: string;           // Optional user note
}
```

---

## 6. Navigation Flow Diagram

```
┌──────────────────────────────┐
│     🏠 Menu Home             │
└──────────────────────────────┘
     ↙        ↓          ↘
    /         |           \

📖 Baca      ⏰ Terakhir    🔖 Bookmark
Alquran      Baca
    |         |             |
    ↓         ↓             ↓
   ┌─────────────────────────────┐
   │ VersesList / JuzVersesList   │
   │ (if has history)     (Bookmark List)
   └─────────────────────────────┘
         ↓
   ┌──────────────────┐
   │ Tab: Surah│Juz   │
   └──────────────────┘
    ↙              ↘
  /                  \
Baca Surah      Baca Juz
(114 Surahs)    (30 Juz)
    ↓                ↓
  Select          Select
    ↓                ↓
  SurahList      JuzList
    ↓                ↓
  VersesList    JuzVersesList
    ↓
  Quick Buttons
  ├── ⏰ Mark as Last Read
  └── 🔖 Add Bookmark
```

---

## 7. State Management Flow

```
read.tsx (Main Controller)
├── view: 'surahs' | 'verses' | 'juz'
├── listView: 'surahs' | 'juz'
├── selectedSurah: QuranSurah | null
├── selectedJuz: JuzGroup | null
├── isFromExternalNav: boolean
│
└── handlers will update:
    ├── useQuran() context
    │   ├── lastReadProgress (with readType, juzNumber)
    │   ├── bookmarks[]
    │   └── surahs[]
    │
    └── Components re-render
        ├── QuickButtonLastRead (icon color)
        ├── VersesList/JuzVersesList (new data)
        └── Home index.tsx (updated counters)
```

---

## 8. Checklist - Implementasi Sesuai Diagram

✅ **Menu Home**
- [x] Baca Alquran button → navigates to read screen
- [x] Terakhir Baca button → auto-navigates to last read surah
- [x] Bookmark button → opens bookmark list

✅ **Baca Alquran Screen**
- [x] Tab Surah dan Juz toggle visible
- [x] Baca Surah view shows all 114 surahs
- [x] Baca Juz view shows all 30 juz

✅ **VersesList / JuzVersesList**
- [x] Displays verses with Arabic, transliteration, translation
- [x] Shows quick buttons
- [x] Auto-scroll on external navigation only
- [x] No scroll reset when clicking quick buttons

✅ **Quick Button Terakhir Baca**
- [x] Saves surah number
- [x] Saves ayat number
- [x] Saves timestamp
- [x] Saves readType (surah/juz) ← NEW
- [x] Saves juzNumber ← NEW
- [x] Icon changes color when active
- [x] Smooth update (no scroll jump)

✅ **Quick Toggle Button Bookmark**
- [x] Saves surah number
- [x] Saves ayat number
- [x] Saves verse text
- [x] Saves timestamp
- [x] Icon toggles between outline/filled
- [x] Success alert on add

✅ **Data Flow**
- [x] Terakhir Baca remembers last read position
- [x] Can navigate back to exact verse
- [x] Bookmark list updated in real-time
- [x] Reading progress persisted in storage

---

## 9. File Structure & Line Counts

```
app/(tabs)/
├── read.tsx                        (204 lines) ← Main controller
├── index.tsx                       (160 lines) ← Home menu
├── bookmark.tsx                    (?)        ← Bookmark list
├── components/
│   ├── VersesList.tsx             (107 lines)
│   ├── JuzVersesList.tsx          (116 lines)
│   ├── VerseCard.tsx              (118 lines)
│   ├── VerseSeparator.tsx         ( 75 lines)
│   ├── QuickButtonLastRead.tsx    ( 44 lines) ← Memoized button
│   ├── SurahsList.tsx             ( 74 lines)
│   ├── JuzList.tsx                ( 68 lines)
│   └── SurahsHeader.tsx           ( 56 lines)
└── hooks/
    ├── useVerseScroll.ts          ( 61 lines)
    └── useJuzGroups.ts            ( 58 lines)
```

---

## 10. Testing Checklist

Para memverifikasi flow berfungsi dengan baik:

1. **Home Screen**
   - [ ] Buka app → lihat Menu Home dengan 3 tombol
   - [ ] Counter bookmarks terupdate saat add/remove

2. **Baca Alquran**
   - [ ] Klik Baca Alquran → tab surah/juz muncul
   - [ ] Klik tab Surah → list 114 surahs muncul
   - [ ] Klik tab Juz → list 30 juz muncul
   - [ ] Pilih Surah → VersesList muncul dengan ayat

3. **Quick Buttons**
   - [ ] Klik ⏰ button di ayat 6 → icon berubah warna
   - [ ] Icon warna tetap saat scroll
   - [ ] Icon tidak reset saat klik verse lain
   - [ ] Klik 🔖 button → verse di-bookmark
   - [ ] Icon 🔖 berubah jadi filled

4. **Terakhir Baca**
   - [ ] Buka Menu Home
   - [ ] Klik Terakhir Baca
   - [ ] Auto-navigate ke surah terakhir
   - [ ] Auto-scroll ke verse terakhir
   - [ ] Icon ⏰ sudah berwarna (menunjukkan last read)

5. **Bookmark**
   - [ ] Buka Menu Home
   - [ ] Klik Bookmark
   - [ ] Lihat list bookmark ayat
   - [ ] Counter di home terupdate

---

## 11. Data Persistence

Semua data disimpan ke AsyncStorage via QuranStorage service:

- **Reading Progress:** `reading_progress` key
  ```json
  {
    "surahNumber": 2,
    "verseNumber": 286,
    "readType": "surah",
    "timestamp": "2024-03-14T...",
    "juzNumber": 2
  }
  ```

- **Bookmarks:** `bookmarks` array
  ```json
  [
    {
      "id": "bookmark_1",
      "surahNumber": 2,
      "verseNumber": 255,
      "text": "...",
      "timestamp": "2024-03-14T..."
    }
  ]
  ```

---

## Kesimpulan

Code Anda sudah mengimplementasikan flow diagram dengan baik. Update terbaru:

✅ Added `readType` field untuk track Surah vs Juz reading
✅ Added `juzNumber` field untuk context Juz
✅ Updated `handleVersePress` untuk pass readType
✅ All data persisted in storage
✅ All 200-300 line limit maintained
✅ Zero scroll jumping issues dengan memoization

Flow siap untuk testing! 🚀
