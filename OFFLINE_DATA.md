# Offline Quran Data

## Deskripsi

Aplikasi Free-Alquran mendukung mode **offline** dan **online**. Data Quran dapat dimuat dari file JSON lokal (offline), atau dari API online jika diperlukan data surah yang belum tersedia di lokal.

## File Offline Data

- **Lokasi**: `assets/data/quran-juz-30.json`
- **Konten**: Semua 37 surah dalam Juz 30 (Juz Amma) - Surah 78-114
- **Data**: Teks Arab, Transliterasi Latin, dan Terjemahan Bahasa Indonesia
- **Sumber**: Scraped dari API alquran.cloud
- **Ukuran**: ~190 KB

## Struktur File JSON

```json
{
  "juzNumber": 30,
  "surahRange": [78, 114],
  "totalSurahs": 37,
  "scrapedAt": "2026-03-12T...",
  "surahs": [
    {
      "number": 78,
      "name": "An-Naba",
      "englishName": "An-Naba",
      "englishNameTranslation": "The News",
      "numberOfAyahs": 40,
      "revelationType": "Meccan",
      "verses": [
        {
          "number": 1,
          "text": "ن الم يأتِ على الإنسان حين من الدهر",
          "transliteration": "Alif-Laam-Meem",
          "indonesianTranslation": "Apakah belum datang ...",
          "juz": 30,
          "page": 580,
          "ruku": 1
        }
        // ... more verses
      ]
    }
    // ... more surahs
  ]
}
```

## Cara Penggunaan

### 1. Mode Offline (Default)

Aplikasi secara default menggunakan mode offline untuk performa terbaik:

```typescript
import { QuranAPI } from '@/services/quran-api';

// Fetch surah dari offline data (cepat!)
const surah = await QuranAPI.fetchSurah(103); // Al-Asr (Juz 30)
```

**Keuntungan**:
- ✅ **Cepat**: Tidak perlu internet, loading instant
- ✅ **Hemat Data**: Tidak ada download tambahan
- ✅ **Reliable**: Tidak bergantung pada API uptime

### 2. Mode Online

Untuk menggunakan API online atau fallback ke online jika data offline tidak tersedia:

```typescript
import { QuranAPI } from '@/services/quran-api';

// Switch ke mode online
QuranAPI.setOfflineMode(false);

// Fetch dari API
const surah = await QuranAPI.fetchSurah(2); // Al-Baqarah (tidak ada di Juz 30)
```

**Keuntungan**:
- ✅ Akses semua 114 surah
- ✅ Data selalu terbaru dari API

### 3. Auto-Fallback (Hybrid Mode)

Jika terjadi error di mode online, otomatis fallback ke offline:

```typescript
QuranAPI.setOfflineMode(false);
// Jika fetch gagal, otomatis menggunakan data offline jika tersedia
const surah = await QuranAPI.fetchSurah(103);
```

## Menambah Data Juz Lain

Untuk menambah data offline untuk juz lain:

### Step 1: Jalankan Script Scraper

```bash
# Scrape Juz 1
node scripts/scrape-quran-data.js 1

# Scrape Juz 15
node scripts/scrape-quran-data.js 15

# Scrape semua juz (custom)
# Edit scripts/scrape-quran-data.js untuk menambah entries di JUZ_RANGES
```

### Step 2: Pindahkan File JSON ke Assets

```bash
# File akan tersimpan di data/quran-juz-{number}.json
mv data/quran-juz-1.json assets/data/
```

### Step 3: Update `quran-offline.ts`

Tambahkan import di `services/quran-offline.ts`:

```typescript
// Import offline data
const JUZ_30_DATA = require('@/assets/data/quran-juz-30.json');
const JUZ_1_DATA = require('@/assets/data/quran-juz-1.json');
const JUZ_15_DATA = require('@/assets/data/quran-juz-15.json');

const OFFLINE_DATA_MAP: { [key: number]: OfflineQuranData } = {
  1: JUZ_1_DATA,
  15: JUZ_15_DATA,
  30: JUZ_30_DATA,
};
```

## API Reference

### QuranAPI Methods

```typescript
// Set mode: offline (true) atau online (false)
QuranAPI.setOfflineMode(boolean)

// Check mode aktif
QuranAPI.isOfflineMode(): boolean

// Fetch daftar surah
await QuranAPI.fetchSurahsList(): Promise<Surah[]>

// Fetch surah spesifik
await QuranAPI.fetchSurah(surahNumber): Promise<QuranSurah | null>

// Fetch semua surah (dari offline jika available, atau API)
await QuranAPI.fetchAllSurahs(): Promise<QuranSurah[]>
```

### QuranOfflineService Methods

```typescript
// Fetch surah dari offline data
QuranOfflineService.getSurah(surahNumber): QuranSurah | null

// Fetch semua surah offline
QuranOfflineService.getAllSurahs(): QuranSurah[]

// Fetch surah dalam juz spesifik
QuranOfflineService.getSurahInJuz(juzNumber): QuranSurah[]

// Get list juz yang tersedia
QuranOfflineService.getAvailableJuz(): number[]

// Check apakah offline data tersedia
QuranOfflineService.isOfflineAvailable(): boolean

// Get metadata offline data
QuranOfflineService.getOfflineMetadata(): {
  available: boolean
  totalJuz: number
  totalSurahs: number
  juzRanges: { [juzNumber]: [startSurah, endSurah] }
  lastUpdated: string
}
```

## Performance

**Benchmark** (dari offline):
- Fetch satu surah (Juz 30): **< 5ms** ✨
- Fetch semua surah (Juz 30): **< 50ms** 🚀

Dibandingkan dengan **online**:
- Fetch satu surah: **500-1000ms** (tergantung koneksi)
- Fetch semua surah: **20-40 detik**

## Troubleshooting

### Q: Data offline tidak loading?

**A**: Pastikan:
1. File `assets/data/quran-juz-30.json` ada
2. Import di `quran-offline.ts` sudah benar
3. Restart Expo app

### Q: Ingin gunakan online mode?

```typescript
import { QuranAPI } from '@/services/quran-api';
QuranAPI.setOfflineMode(false);
```

### Q: Error "Cannot find module"?

Pastikan path import benar (gunakan `@/` alias untuk path relative):

```typescript
const JUZ_30_DATA = require('@/assets/data/quran-juz-30.json');
```

## Catatan

- API source: https://api.alquran.cloud/v1
- Memiliki terjemahan Indonesia yang akurat
- Pencacahan ayat mengikuti standar Al-Quran
- Data di-cache di file JSON, cocok untuk offline-first app
