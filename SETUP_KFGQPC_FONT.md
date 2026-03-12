# Setup Font KFGQPC Uthman Taha Naskh

## Tentang Font Ini ✨

**KFGQPC Uthman Taha Naskh** adalah font khusus untuk AlQuran yang dirancang oleh King Fahd Glorious Quran Printing Complex (KFGQPC). Font ini:

- ✅ Dirancang khusus untuk menampilkan Quran dengan sempurna
- ✅ Diacritical marks (tashkeel) lengkap dan akurat
- ✅ Ligatures dan shaping Arab yang sempurna
- ✅ Digunakan di banyak aplikasi Quran professional
- ✅ Support RTL (Right-to-Left) sempurna

---

## Download Font

### Opsi 1: Download dari GitHub (RECOMMENDED ⭐)
**Link**: https://github.com/khaledhosny/uthman-taha-naskh/releases

1. Buka link di atas
2. Cari release terbaru (v0.4.0 atau lebih baru)
3. Download file `KFGQPCUthmanthTahaNaskh-Regular.ttf`
4. Extract jika dalam ZIP

### Opsi 2: Download PreBuilt Fonts
**Link**: https://fontlibrary.org/en/font/uthman-taha-naskh

Atau dari Google Fonts (jika tersedia versi terbaru)

### Opsi 3: Download dari Repository Langsung
```bash
# Jika sudah punya git
git clone https://github.com/khaledhosny/uthman-taha-naskh.git
cd uthman-taha-naskh/fonts/
# Copy file .ttf ke project
```

---

## Instalasi

### Step 1: Copy Font File
```
1. Copy file: KFGQPCUthmanthTahaNaskh-Regular.ttf
2. Paste ke: assets/fonts/
3. Verify: pastikan nama file EXACT sama
```

### Step 2: Install Dependency (Jika belum)
```bash
expo install expo-font expo-splash-screen
```

### Step 3: Rebuild Project
```bash
# Clear dan rebuild
expo prebuild --clean

# Untuk Android
expo run:android

# Untuk iOS
expo run:ios
```

---

## Troubleshooting

### Problem: Font tidak tampil di Android
**Solutions:**
1. Pastikan nama file exactly: `KFGQPCUthmanthTahaNaskh-Regular.ttf`
2. Clear gradle cache: `cd android && ./gradlew clean`
3. Rebuild: `expo run:android --clear`

### Problem: Diacriticals masih hilang
**Solutions:**
1. Pastikan line-height cukup besar (min 40px) ✅ Sudah set
2. Font scalar: Check font file valid - gunakan font viewer
3. Update Expo: `expo upgrade`

### Problem: Font size terlalu besar/kecil
**Solutions:**
Update di `read.tsx`:
```tsx
<TajwidDisplay 
  text={verse.text} 
  fontSize={26}      // Adjust ini
  lineHeight={40}    // Dan ini
/>
```

### Problem: Build error di iOS
**Solutions:**
1. Update Podfile: `cd ios && pod install`
2. Clean build: `expo prebuild --clean`
3. Rebuild: `expo run:ios`

---

## File Names Reference

Pastikan menggunakan nama file yang EXACT:

| Name | File | Status |
|------|------|--------|
| KFGQPC Uthman Taha Naskh | `KFGQPCUthmanthTahaNaskh-Regular.ttf` | ✅ Current |
| Alt name | `KFGQPCUthmantahaNaskh-Regular.ttf` | ⚠️ Case sensitive |

> **PENTING**: File names case-sensitive di Linux/Mac! 

---

## Testing Font

Setelah setup, test dengan:

1. Buka app
2. Masuk ke "Baca Alquran"
3. Pilih surah apapun
4. Verifikasi:
   - ✅ Teks Arab dari kanan ke kiri
   - ✅ Semua diacritical marks muncul
   - ✅ Font smooth dan professional
   - ✅ Sama di Android dan iOS

---

## Current Configuration

File yang sudah update untuk KFGQPC Uthman Taha Naskh:

✅ `components/tajweed-display.tsx` - Font configuration
✅ `app.json` - iOS UIAppFonts config
✅ `hooks/use-prepare-arabic-fonts.ts` - Font loader

---

## Font Comparison

| Font | Diacriticals | RTL | Quality | File Size |
|------|-------------|-----|---------|-----------|
| KFGQPC Uthman Taha Naskh | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ~500KB |
| Amiri | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ~800KB |
| Arabic Typesetting | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Built-in |

---

## References

- KFGQPC Official: https://www.qurancomplex.gov.sa/
- Font Repository: https://github.com/khaledhosny/uthman-taha-naskh
- Expo Font Docs: https://docs.expo.dev/develop/user-interface/fonts/

---

## Commands Cheat Sheet

```bash
# Install font dependencies
expo install expo-font expo-splash-screen

# Rebuild with cleaned cache
expo prebuild --clean

# Android build & run
expo run:android --clear

# iOS build & run  
expo run:ios

# View logs
expo logs -n 100

# Clear all cache
expo start --clear
```

---

## Next Steps

1. ✅ Download font file
2. ✅ Copy ke `assets/fonts/`
3. ✅ Run: `expo run:android` atau `expo run:ios`
4. ✅ Test app & verify font
5. ✅ Enjoy beautiful Quran display! 📖✨

Kalau ada pertanyaan atau issue, refer ke troubleshooting section di atas!
