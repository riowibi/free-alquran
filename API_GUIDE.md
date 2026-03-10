# API Integration Guide

Panduan untuk mengintegrasikan berbagai Quran API dan data sources.

## Current API: Al-Quran Cloud

**Base URL**: `https://api.alquran.cloud/v1`

### Kenapa Al-Quran Cloud?
- ✅ Free, no auth required
- ✅ Reliable & fast
- ✅ Complete 114 surahs data
- ✅ Multiple translations available
- ✅ Good API documentation
- ❌ Tidak ada tajweed highlighting built-in

### Current Implementation

```typescript
// services/quran-api.ts

// Endpoints used
GET /surah              // List all surahs
GET /surah/:number      // Get specific surah with all verses
```

### Response Example

```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "number": 1,
    "name": "الفاتحة",
    "englishName": "Al-Fatiha",
    "englishNameTranslation": "The Opening",
    "numberOfAyahs": 7,
    "revelationType": "Meccan",
    "ayahs": [
      {
        "number": 1,
        "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        "numberInSurah": 1,
        "juz": 1,
        "manzil": 1,
        "page": 1,
        "ruku": 1,
        "hizbQuarter": 1,
        "sajdah": false
      }
    ]
  }
}
```

---

## Alternative APIs

### 1. QuranAPI.dev (With Tajweed)

**Pros**:
- ✅ Built-in tajweed highlighting with colors
- ✅ Multiple recitations
- ✅ Detailed metadata

**Cons**:
- ❌ Requires API key
- ❌ Rate limited (free tier)
- ❌ Slower for bulk queries

**How to integrate**:
```typescript
// Replace in services/quran-api.ts
const API_KEY = process.env.EXPO_PUBLIC_QURAN_API_KEY;
const endpoint = `https://api.quranapi.dev/v4/chapters/${surahNum}?apiKey=${API_KEY}`;
```

**Base URL**: `https://api.quranapi.dev/v4`

---

### 2. Quran.com API

**Pros**:
- ✅ Comprehensive data
- ✅ Multiple translations
- ✅ Tafsir (explanation)
- ✅ Word-by-word translation

**Cons**:
- ❌ Complex data structure
- ❌ Requires registration for some features
- ❌ Large response sizes

**Endpoints**:
```
GET /api/v4/chapters              // All surahs
GET /api/v4/chapters/:id          // Specific surah
GET /api/v4/verses                // All verses
GET /api/v4/verses/:id/translations  // Translations
```

---

### 3. Islamic.Network API

**Pros**:
- ✅ Free & no auth
- ✅ Multiple editions available
- ✅ Good uptime

**Cons**:
- ❌ Limited metadata
- ❌ Slower responses

**Endpoints**:
```
GET /quran/chapters                // List surahs
GET /quran/chapter/:id             // Specific surah
GET /quran/chapter/:id/verses/:edition  // With translation
```

---

## Tajweed Implementation

### Current Approach
```typescript
// Manual color mapping
const TAJWEED_COLORS = {
  ikhfa: '#F7971E',
  ghunnah: '#BF1133',
  madda: '#1CCCBC',
  // ... etc
};

// Apply colors based on text matching rules
function colorizeVerse(text: string): ColoredText {
  // This would need proper tajweed rule detection
  // Could use regex patterns or machine learning
}
```

### QuranAPI.dev Approach (More Advanced)

QuranAPI.dev provides tajweed data with HTML markup:

```json
{
  "text_tajweed": "<span class=\"ikhfa\">ن</span> بِسْمِ..."
}
```

Can extract and apply colors:
```typescript
function parseHTMLTajweed(htmlText: string) {
  // Parse HTML and create styled components
  const tajweedRules = {
    'ikhfa': '#F7971E',
    'ghunnah': '#BF1133',
    // ... map class names to colors
  };
}
```

---

## Data Caching Strategy

### Current Approach (AsyncStorage)
```
Pros:  Fast, offline, simple
Cons:  Limited to ~5-10MB, slow for large queries
```

### For Large Data, Consider SQLite

```typescript
import { openDatabaseAsync } from 'expo-sqlite';

const db = await openDatabaseAsync('alquran.db');

// Create tables
await db.execAsync(`
  CREATE TABLE IF NOT EXISTS surahs (
    id INTEGER PRIMARY KEY,
    number INTEGER UNIQUE,
    name TEXT,
    englishName TEXT,
    numberOfAyahs INTEGER
  );
  
  CREATE TABLE IF NOT EXISTS verses (
    id INTEGER PRIMARY KEY,
    surahId INTEGER,
    number INTEGER,
    text TEXT,
    FOREIGN KEY (surahId) REFERENCES surahs(id)
  );
`);
```

**Migration Path**:
1. Keep current AsyncStorage for bookmarks/progress
2. Use SQLite for Quran data (much faster for large queries)
3. Both work offline

---

## Switching APIs

To switch from Al-Quran Cloud to another API:

### 1. Update service/quran-api.ts

```typescript
// OLD
const ALQURAN_API_BASE = 'https://api.alquran.cloud/v1';

// NEW
const QURAN_API_BASE = 'https://api.quranapi.dev/v4';
const API_KEY = process.env.EXPO_PUBLIC_QURAN_API_KEY;
```

### 2. Update Response Types

```typescript
// OLD
interface SurahResponse {
  data: { ayahs?: AyahData[] };
}

// NEW
interface SurahResponse {
  data: { verses?: VerseData[] };
}
```

### 3. Update Mapping Logic

```typescript
// OLD
const verses = (surah.ayahs || []).map(ayah => ({...}));

// NEW
const verses = (surah.verses || []).map(verse => ({...}));
```

### 4. Restart the app

The QuranProvider will re-fetch fresh data with the new API.

---

## Performance Comparison

| API | Speed | Data Size | Tajweed | Auth | Cost |
|-----|-------|-----------|---------|------|------|
| Al-Quran Cloud | ⭐⭐⭐⭐ | 4MB | ❌ | ❌ | Free |
| QuranAPI.dev | ⭐⭐⭐ | 8MB | ✅ | ✅ | Free/Paid |
| Quran.com | ⭐⭐⭐ | 12MB+ | ✅ | ⚠️ | Free |
| Islamic.Network | ⭐⭐⭐⭐ | 3MB | ❌ | ❌ | Free |

---

## Recommendations

### For MVP (Current)
✅ Use **Al-Quran Cloud** - Simple, reliable, works great

### For Production with More Features
1. Add **Quran.com API** for translations + tafsir
2. Move data to **SQLite** for performance
3. Add **QuranAPI.dev** for tajweed support

### Ultimate Stack
```
Frontend: Expo/React Native
Backend: Combine multiple APIs
Database: SQLite (device) + Cloud sync
Caching: SQLite + conditional API calls
```

---

## Environment Variables

```bash
# .env.local
EXPO_PUBLIC_QURAN_API_KEY=your_key_here
EXPO_PUBLIC_API_BASE_URL=https://api.example.com
```

Access in code:
```typescript
const apiKey = process.env.EXPO_PUBLIC_QURAN_API_KEY;
```

---

## Testing Different APIs

```typescript
// Test new API without breaking current code
async function testNewAPI() {
  try {
    const testSurah = await fetch('https://api.example.com/test');
    const data = await testSurah.json();
    console.log('New API response:', data);
    // Compare with current QuranAPI.fetchSurah(1)
  } catch (err) {
    console.error('New API failed:', err);
  }
}
```

---

**Last Updated**: March 2026
**Current Status**: Stable with Al-Quran Cloud API
**Next Enhancement**: Add QuranAPI.dev for tajweed support
