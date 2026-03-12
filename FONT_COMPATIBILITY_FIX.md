# Arabic Font Fix - Changelog

## Latest Update: KFGQPC Uthman Taha Naskh 🎉
**Date**: March 13, 2026
**Status**: ✅ Configured & Ready

### What's New
- Changed to **KFGQPC Uthman Taha Naskh** - Font khusus AlQuran
- Better diacritical marks rendering
- Professional Quran appearance
- Optimized for both Android & iOS

**Setup Guide**: See [SETUP_KFGQPC_FONT.md](./SETUP_KFGQPC_FONT.md)

---

## Perbaikan yang Sudah Dilakukan ✅

### 1. **RTL (Right-to-Left) Text Direction** 
**Status**: ✅ Fixed

**Masalah Lama**:
- Text Arabic masih mepet dari kiri
- Arah baca tidak benar

**Solusi Applied**:
- Tambah `direction: 'rtl'` di Text component
- Tambah `writingDirection: 'rtl'` untuk kompatibilitas lebih baik
- Hapus wrapping `View` yang tidak support RTL

**File**: `components/tajweed-display.tsx`

---

### 2. **Font Compatibility Android/iOS**
**Status**: ✅ Optimized with KFGQPC Uthman Taha Naskh

**Font Configuration**:
```
iOS:     KFGQPC Uthman Taha Naskh (built-in/custom)
Android: KFGQPC Uthman Taha Naskh (custom)
Web:     KFGQPC Uthman Taha Naskh > Arial (fallback)
```

**Font Quality**:
- KFGQPC Uthman Taha Naskh: ⭐⭐⭐⭐⭐ (Quran-specific design)

---

### 3. **Font Files Setup**
**Status**: ✅ Folder Created

**Dibuat**:
- `assets/fonts/` - Folder untuk custom font files
- `hooks/use-prepare-arabic-fonts.ts` - Hook untuk load fonts
- `FONT_SETUP.md` - Panduan lengkap setup

---

### 4. **App Configuration**
**Status**: ✅ Updated

**Update di `app.json`**:
- Tambah `"expo-font"` plugin
- Config iOS UIAppFonts untuk custom fonts
- Prepare untuk custom font loading

---

## Untuk Hasil Terbaik - Steps Berikutnya

### Step 1: Install Expo Font (Jika belum)
```bash
expo install expo-font expo-splash-screen
```

### Step 2: Download Custom Fonts
Dari link di `FONT_SETUP.md`:
1. Download `Amiri-Regular.ttf` 
2. Copy ke `assets/fonts/`

### Step 3: Update Hook usePrepareArabicFonts
```typescript
// Uncomment di hooks/use-prepare-arabic-fonts.ts
const [fontsLoaded, fontError] = useFonts({
  'Amiri': require('../assets/fonts/Amiri-Regular.ttf'),
  'Amiri-Bold': require('../assets/fonts/Amiri-Bold.ttf'),
});
```

### Step 4: Test
```bash
expo prebuild --clean
expo run:android
# atau
expo run:ios
```

---

## Testing Checklist

- [ ] Teks Arabic dari kanan ke kiri ✅
- [ ] Tidak mepet dari kiri anymore ✅
- [ ] Diacritical marks lengkap
- [ ] Font smooth & professional
- [ ] Sama tampilan di Android dan iOS

---

## Technical Details

### RTL Implementation
```tsx
<Text
  style={{
    direction: 'rtl',           // RTL text direction
    writingDirection: 'rtl',    // Better RTL support
    textAlign: 'right',         // Right alignment
  }}
>
  {"النص العربي"}             // Arabic text
</Text>
```

### Font Fallback Chain
```
1. Custom Amiri*        (if available)
   ↓
2. System Amiri        (Android native)
   ↓
3. Arabic Typesetting  (iOS native)
   ↓
4. Generic serif       (Fallback)
```

### Line Height & Diacriticals
- Min line height: 40px (untuk diacriticals tidak tertekan)
- Font size: 26px (untuk readability)
- Letter spacing: 0.3 (untuk breathing room)

---

## Troubleshooting Commands

```bash
# Clear cache dan rebuild
expo prebuild --clean

# Rebuild Android
expo run:android

# Rebuild iOS
expo run:ios

# View logs
expo logs

# Reset node_modules
rm -rf node_modules
npm install
```

---

## File Changes Summary

| File | Change | Status |
|------|--------|--------|
| `components/tajweed-display.tsx` | RTL + Font config | ✅ |
| `app.json` | Plugin + Font config | ✅ |
| `hooks/use-prepare-arabic-fonts.ts` | NEW - Font loader | ✅ |
| `assets/fonts/` | NEW - Font folder | ✅ |
| `FONT_SETUP.md` | NEW - Setup guide | ✅ |

---

## Next Phase (Optional Improvements)

### Phase 2 - Advanced Rendering
- [ ] Use native Arabic text engine untuk better shaping
- [ ] Implement Harfbuzz integration (jika needed)
- [ ] Cache diacritical color mapping untuk performance

### Phase 3 - Advanced Features
- [ ] Font size adjustment UI
- [ ] Font family selection UI
- [ ] Line height adjustment UI
- [ ] Text rendering mode options

---

## References

- React Native Text Docs: https://reactnative.dev/docs/text
- Expo Font: https://docs.expo.dev/develop/user-interface/fonts/
- Amiri Font: https://aliftype.com/
- RTL Best Practices: https://www.w3.org/International/questions/qa-html-dir
