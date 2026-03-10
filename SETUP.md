# Aplikasi Quran - Expo Android SDK 54

Aplikasi Quran modern dengan fitur reading, bookmark, dan tracking progress bacaan. Semua data disimpan secara lokal di perangkat untuk akses offline.

## Fitur Utama

- **Baca Alquran**: Jelajahi dan baca semua 114 surah dengan layout yang indah
- **Terakhir Baca**: Otomatis melacak progress bacaan Anda dan dapat kembali ke posisi terakhir
- **Bookmark**: Tandai ayat-ayat penting dengan catatan pribadi

## Struktur Proyek

```
free-alquran/
├── app/
│   ├── (tabs)/
│   │   ├── _layout.tsx         # Tab layout dengan QuranProvider
│   │   ├── index.tsx           # Home screen dengan 3 menu
│   │   ├── read.tsx            # Screen baca Quran
│   │   └── bookmark.tsx        # Screen bookmark
│   ├── _layout.tsx             # Root layout
│   └── modal.tsx               # Modal screen
├── hooks/
│   ├── use-quran.tsx           # Global Quran context & hooks
│   ├── use-color-scheme.ts
│   └── use-theme-color.ts
├── services/
│   ├── quran-api.ts            # API service untuk fetch data Quran
│   └── quran-storage.ts        # Local storage service
├── types/
│   └── quran.ts                # TypeScript types untuk Quran data
├── components/                 # Reusable components
├── constants/
│   └── theme.ts                # Color & font constants
├── assets/                     # Images & icons
└── package.json
```

## Tech Stack

- **Expo SDK 54**: Framework React Native terbaru
- **React Native**: Build native Android apps
- **TypeScript**: Type-safe development
- **Expo Router**: File-based routing
- **AsyncStorage**: Data persistence lokal
- **Al-Quran Cloud API**: Free Quran data API

## Setup & Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Jalankan Development Server

```bash
# Untuk Android
npm run android

# Atau langsung dengan expo
expo start
```

Kemudian pilih `a` untuk Android atau gunakan Android Emulator.

### 3. Build APK untuk Production

```bash
eas build --platform android
```

## Cara Kerja Aplikasi

### Inisialisasi Data Quran
1. Saat pertama kali membuka app, sistem akan:
   - Cek apakah data Quran sudah tersimpan di local storage
   - Jika belum, fetch data dari Al-Quran Cloud API
   - Simpan semua 114 surah + verses ke AsyncStorage

2. Selanjutnya, data otomatis digunakan secara offline

### Fitur Home Screen
- **Baca Alquran**: Navigasi ke daftar surah → pilih surah → baca verses
- **Terakhir Baca**: Jika ada history, langsung ke ayat terakhir yang dibaca
- **Bookmark**: Lihat semua bookmark yang sudah dibuat, dikelompokkan per surah

### Menggunakan Fitur Bookmark
1. Buka surah dan pilih ayat
2. Hold/long press ayat tersebut
3. Pilih "Add Bookmark"
4. Bookmark akan otomatis tersimpan dan bisa ditambah catatan

## API Data

Aplikasi menggunakan **Al-Quran Cloud API**:
- Endpoint: `https://api.alquran.cloud/v1`
- Tidak memerlukan API key
- Gratis untuk penggunaan commercial
- Data tersedia dalam Arabic dengan berbagai terjemahan

Contoh response:
```json
{
  "code": 200,
  "status": "OK",
  "data": {
    "number": 1,
    "name": "الفاتحة",
    "englishName": "Al-Fatiha",
    "numberOfAyahs": 7,
    "ayahs": [
      {
        "number": 1,
        "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        "numberInSurah": 1,
        ...
      }
    ]
  }
}
```

## Local Storage Schema

### Surahs (ALQURAN_DATA)
```typescript
QuranSurah[] - Array of all 114 surahs dengan verses lengkap
```

### Last Read Progress (ALQURAN_LAST_READ)
```typescript
{
  surahNumber: number,
  verseNumber: number,
  timestamp: number
}
```

### Bookmarks (ALQURAN_BOOKMARKS)
```typescript
Bookmark[] = {
  id: string,
  surahNumber: number,
  verseNumber: number,
  text: string,
  timestamp: number,
  note?: string
}
```

## Custom Hooks

### useQuran()
```typescript
const {
  surahs,                    // Array semua surah
  bookmarks,                 // Array semua bookmark
  lastReadProgress,          // Progress terakhir dibaca
  isLoading,                 // Loading state
  isInitialized,             // Data sudah siap
  error,                     // Error message jika ada
  initializeQuran,           // Inisialisasi data
  updateReadingProgress,     // Update progress
  addBookmark,               // Tambah bookmark
  removeBookmark,            // Hapus bookmark
  getSurah,                  // Get surah by number
  isVerseBookmarked,         // Check if verse bookmarked
} = useQuran();
```

## Customization

### Mengubah Tajweed Colors
Edit `services/quran-api.ts`:
```typescript
const TAJWEED_COLORS: { [key: string]: string } = {
  ikhfa: '#F7971E',  // Orange
  ghunnah: '#BF1133', // Red
  madda: '#1CCCBC',  // Teal
  // ... tambah/ubah warna sesuai kebutuhan
};
```

### Mengubah Theme Colors
Edit `constants/theme.ts`:
```typescript
const tintColorLight = '#0a7ea4';  // Ubah warna primary
// ... customize colors untuk light/dark mode
```

## Troubleshooting

### Data Quran Tidak Muncul
1. Pastikan internet terkoneksi saat pertama kali membuka
2. Check AsyncStorage: `QuranStorage.getSurahs()`
3. Try retry dari error screen

### UI Issues
1. Clear cache: `npm run reset-project`
2. Restart development server
3. Clear metro bundle cache: `npx expo start --clear`

### Performance
- Data Quran (~4KB per verse) disimpan terkompresi di AsyncStorage
- Loading penuh 114 surah pertama kali: ~10-30 detik tergantung koneksi
- Setelah itu, akses offline sangat cepat

## Next Steps / Enhancement Ideas

1. **Search & Filter**: Cari surah/verse berdasarkan teks atau nomor
2. **Audio Quran**: Integrase dengan API audio Quran (Misalnya: Qur'an.com)
3. **Translations**: Tampilkan terjemahan dalam berbagai bahasa
4. **Tajweed Rules**: Highlight dan penjelasan untuk setiap tajweed rule
5. **Notes**: Catatan detail per verse dengan RichText editor
6. **Sharing**: Share verse via WhatsApp, Telegram, dll
7. **Statistics**: Track reading statistics & consistency
8. **Dark Mode**: Full dark mode support dengan animations
9. **Cloud Sync**: Sync bookmarks ke cloud (Firebase/Supabase)
10. **Offline Maps**: Lokasi-lokasi penting dalam Quran

## Resources

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev)
- [Al-Quran Cloud API](https://alquran.cloud/api)
- [Expo Router Guide](https://docs.expo.dev/routing/introduction/)

## License

MIT License - Bebas untuk digunakan dan dimodifikasi

---

**Semoga aplikasi ini bermanfaat dalam mempelajari Al-Quran!** 📖✨
