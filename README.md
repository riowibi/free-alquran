# Aplikasi Quran - Expo SDK 54

Aplikasi Al-Quran mobile untuk Android dengan fitur reading, bookmark, dan tracking progress. Semua data disimpan secara lokal untuk akses offline.

## 🚀 Fitur Utama

- **Baca Alquran**: Jelajahi 114 surah dengan layout yang indah
- **Terakhir Baca**: Otomatis melacak progress bacaan
- **Bookmark**: Tandai ayat-ayat penting dengan catatan pribadi

## 📦 Quick Start

### Install & Run
```bash
# Install dependencies
npm install

# Run di Android
npm run android

# Atau dengan expo start
expo start  # pilih 'a' untuk Android
```

### Build APK
```bash
eas build --platform android
```

## 🏗️ Struktur
- `app/(tabs)/index.tsx` - Home screen dengan 3 menu
- `app/(tabs)/read.tsx` - Baca Quran Surah by Surah
- `app/(tabs)/bookmark.tsx` - Daftar bookmark dengan catatan
- `services/` - API & Storage services
- `hooks/use-quran.tsx` - Global Quran context
- `types/quran.ts` - Data types

## 🌐 Data Source

Data Quran dari **Al-Quran Cloud API** (gratis, no auth needed):
- 114 Surah lengkap
- Semua ayat dengan translations
- Disimpan lokal di device via AsyncStorage

## 📚 Dokumentasi Detail

Lihat [SETUP.md](./SETUP.md) untuk dokumentasi lengkap, troubleshooting, dan enhancement ideas.

## 📖 Learn More

- [Expo Documentation](https://docs.expo.dev)
- [Expo Router](https://docs.expo.dev/routing/introduction/)
- [React Native](https://reactnative.dev)
