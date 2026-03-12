# ⚡ Quick Start - KFGQPC Uthman Taha Naskh Font

## 🚀 3 Langkah Setup (5 Menit)

### Step 1️⃣: Download Font (1 Menit)
**Download**: https://github.com/khaledhosny/uthman-taha-naskh/releases

- Screenshot atau 👉 **Direct Link**: Search "KFGQPCUthmanthTahaNaskh-Regular.ttf"
- Extract file yang di-download

### Step 2️⃣: Copy Font File (1 Menit)
```
1. Locate: KFGQPCUthmanthTahaNaskh-Regular.ttf
2. Copy ke: assets/fonts/
   (ℹ️ Folder sudah ada, tinggal paste file)
3. Verify: File ada di assets/fonts/KFGQPCUthmanthTahaNaskh-Regular.ttf
```

### Step 3️⃣: Rebuild Project (3 Menit)
```bash
# Di terminal project folder
expo prebuild --clean
expo run:android
# atau untuk iOS:
expo run:ios
```

---

## ✅ Verification

Setelah rebuild, buka app & cek:

- ✅ Teks Arab **dari kanan ke kiri**
- ✅ **Semua diacritical marks** muncul (harakat)
- ✅ Font **professional & smooth**
- ✅ **Sama tampilan** di Android & iOS

---

## 🆘 Problem?

**Font tidak tampil?**
```bash
# Clear everything & rebuild
rm -rf node_modules
npm install
expo start --clear
```

**Still not working?**
- Check filename: Must be exactly `KFGQPCUthmanthTahaNaskh-Regular.ttf`
- Check location: Must be in `assets/fonts/`
- Check Internet: Ensure expo-font installed: `expo install expo-font`

---

## 📁 File Structure Required

```
free-alquran/
├── assets/
│   └── fonts/
│       └── KFGQPCUthmanthTahaNaskh-Regular.ttf  ✅ FILE HARUS ADA
├── components/
│   └── tajweed-display.tsx  ✅ Updated
├── hooks/
│   └── use-prepare-arabic-fonts.ts  ✅ Updated
└── app.json  ✅ Updated
```

---

## 📞 Detailed Guide

Full setup guide with troubleshooting: [SETUP_KFGQPC_FONT.md](./SETUP_KFGQPC_FONT.md)

---

## Summary

| Item | Status |
|------|--------|
| Code Config | ✅ Done |
| Font Selection | ✅ KFGQPC Uthman Taha Naskh |
| Your Action | ⬇️ Download & Copy Font File |
| Rebuild | ⬇️ Run `expo run:android/ios` |

**Once you copy the font file → rebuild = DONE! 🎉**
