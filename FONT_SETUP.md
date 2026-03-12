# Setup Font Arabic untuk Kompatibilitas iOS dan Android
## ✨ Recommended: KFGQPC Uthman Taha Naskh

**Sudah dikonfigurasi untuk menggunakan**: **KFGQPC Uthman Taha Naskh**
- Dirancang khusus untuk AlQuran
- Diacritical marks sempurna
- Ligatures optimal untuk Arabic
- Professional appearance

**Setup guide lengkap**: [SETUP_KFGQPC_FONT.md](./SETUP_KFGQPC_FONT.md)

---
## Masalah yang Diperbaiki ✅

- ✅ RTL (Right-to-Left) text alignment
- ✅ Diacritical marks (tashkeel) rendering
- ✅ Arabic font compatibility di Android
- ✅ Font shaping dan ligatures

## Install Custom Arabic Fonts

### Cara 1: Menggunakan Google Fonts (Recommended - Instant)

Fonts sudah dikonfigurasi di `tajweed-display.tsx` untuk menggunakan:
- **iOS**: Arabic Typesetting (built-in)
- **Android**: Amiri (fallback ke serif)
- **Web**: Scheherazade New, Amiri

Untuk hasil terbaik di Android, unduh dan copy font files ke folder ini:

### Cara 2: Manual Setup dengan Custom Fonts

#### Step 1: Download Font Files
Unduh font Amiri (.ttf) dari:
- https://github.com/aliftype/amiri/releases
- Atau https://fonts.google.com/?query=amiri

#### Step 2: Copy Font Files
Copy file `.ttf` ke folder `assets/fonts/`:
```
assets/
  └── fonts/
      ├── Amiri-Regular.ttf
      ├── Amiri-Bold.ttf
      └── Scheherazade-Regular.ttf
```

#### Step 3: Update app.json
Tambahkan plugin `expo-font-loader` di `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-font",
        {
          "fonts": [
            "./assets/fonts/Amiri-Regular.ttf",
            "./assets/fonts/Amiri-Bold.ttf",
            "./assets/fonts/Scheherazade-Regular.ttf"
          ]
        }
      ]
    ]
  }
}
```

#### Step 4: Install Dependencies
```bash
expo install expo-font
```

#### Step 5: Load Fonts di App

Gunakan hook `useFonts` dari `expo-font`:

```tsx
import * as Font from 'expo-font';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Di dalam component
const [fontsLoaded] = useFonts({
  'Amiri': require('./assets/fonts/Amiri-Regular.ttf'),
  'Amiri-Bold': require('./assets/fonts/Amiri-Bold.ttf'),
});

if (!fontsLoaded) {
  return null; // Show loading
}
```

## Font Names untuk Reference

| Platform | Font Name | Diacriticals Support |
|----------|-----------|----------------------|
| iOS | Arabic Typesetting | ✅ Excellent |
| Android | Amiri | ✅ Very Good |
| Android | Noto Naskh Arabic | ✅ Very Good |
| Web | Scheherazade New | ✅ Excellent |
| Web | Amiri | ✅ Very Good |

## Troubleshooting

### Masalah: Teks masih dari kiri ke kanan
✅ **Fix**: Sudah diperbaiki dengan `direction: 'rtl'` dan `writingDirection: 'rtl'`

### Masalah: Diacriticals hilang di Android
✅ **Solutions**:
1. Install font Amiri custom (recommended)
2. Gunakan `Noto Naskh Arabic` (Google Fonts)
3. Ensure line-height cukup besar (min 40px)

### Masalah: Font tidak berubah setelah install
- Clear cache: `expo prebuild --clean`
- Rebuild: `expo run:android` atau `expo run:ios`
- Restart development server

## Testing

Untuk testing font rendering:
1. Buka app di emulator/device
2. Buka halaman "Baca Alquran"
3. Pilih surah apapun
4. Verifikasi:
   - ✅ Teks Arabic dari kanan ke kiri
   - ✅ Diacritical marks tampil lengkap
   - ✅ Font smooth dan professional

## Font Recommendations

**Terbaik untuk Quran:**
1. **Amiri** - Liberal license, excellent diacriticals
2. **Scheherazade** - Excellent readability
3. **Noto Naskh Arabic** - Google Fonts, consistent

**Hindari:**
- Generic serif (Android default) - Poor diacritical support
- Sans-serif fonts - Kurang cocok untuk Arabic

## References

- Amiri Font: https://aliftype.com/
- Google Fonts: https://fonts.google.com/?query=arabic
- Expo Font: https://docs.expo.dev/develop/user-interface/fonts/
