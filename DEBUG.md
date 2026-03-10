# Quick Debug Checklist untuk Android

Checklist cepat untuk memastikan API fetching berhasil pada device Android.

## ✅ Pre-Run Checklist

- [ ] Android Emulator running atau Physical device connected
- [ ] Device terhubung ke internet (WiFi/Mobile data)
- [ ] Terminal open di folder `free-alquran`
- [ ] Node modules installed: `npm install`
- [ ] No syntax errors: Clear terminal & no error message saat startup

## ✅ Running the App

```bash
# Start:
npm run android

# Or alternative:
npm start
# Then press 'a' in terminal
```

## ✅ First Run - Watch For These Logs

### ❌ If you see:
```
❌ Error fetching Quran surahs list
❌ Unable to load Quran data
⚠️ Network Error
```
**Action:** Check internet connection on device / API server status

### ✅ If you see:
```
📱 Initializing Quran data...
💾 Checking local storage...
⚠️ No surahs found in AsyncStorage
🌐 Local storage empty, fetching from API...
📡 Fetching surahs list from API...
✅ Fetched 114 surahs list
📚 Fetching 114 surahs...
```
**Status:** ✅ API fetch dalam progress. **WAIT 15-40 seconds.**

### ✅ If you see:
```
✅ Surah 1 (الفاتحة) - 7 verses
✅ Surah 2 (البقرة) - 286 verses
✅ Surah 3 (آل عمران) - 200 verses
...
⏳ Progress: 10/114 surahs loaded
⏳ Progress: 20/114 surahs loaded
```
**Status:** ✅ Fetching surahs one by one. **WAIT patiently.**

### ✅ If you see:
```
🎉 Quran data loaded: 114 surahs (0 failed) in 12345ms
📝 Saving 114 surahs to AsyncStorage...
📊 Data size: 4523.45 KB
✅ Successfully saved 114 surahs to AsyncStorage
```
**Status:** ✅ **COMPLETE! App ready!**

## ✅ On Device Screen

### ❌ Should NOT see:
- "Welcome React" template
- Generic Expo placeholder
- Error message or red screen

### ✅ Should see:
1. **Home Screen** with title "Quran"
2. Subtitle: "Baca dan pelajari Al-Quran dengan tajweed"
3. **Three Cards:**
   - 📖 Baca Alquran
   - ⏰ Terakhir Baca
   - 🔖 Bookmark

## ✅ Second Run (After First Success)

### Expected behavior:
```
📱 Initializing Quran data...
💾 Checking local storage...
✅ Found 114 surahs in local storage
---
✅ Successfully opened! (< 1 second)
```

**Should load INSTANTLY from AsyncStorage** - no API calls needed!

## 🔧 Troubleshooting Quick Fixes

### Problem: Stuck on "Loading Quran data..."

**Quick Fix 1:** Close and restart
```bash
# In terminal:
# Press Ctrl+C to stop
# Then: npm run android
```

**Quick Fix 2:** Clear cache
```bash
npm start --clear
# Wait for rebuild, then press 'a' for Android
```

**Quick Fix 3:** Check network
- Emulator: Should auto have internet
- Physical Device: 
  - Enable WiFi or Mobile Data
  - Test: Open browser, visit google.com

### Problem: Seeing React template instead of Quran app

**Solution:** 
```bash
# Stop dev server (Ctrl+C)
# Clear cache:
npm start --clear
# Wait for recompile, press 'a'
# Should see Quran home screen
```

### Problem: Network Error in logs

**Check:**
1. Is API server up? Test in browser:
   ```
   https://api.alquran.cloud/v1/surah
   ```
   Should return JSON with 114 surahs

2. Device internet working?
   - Emulator: Check Network settings in AVD Manager
   - Physical: Open browser on device, test WiFi

3. Try later (server issue?)
   - API might be temporarily down
   - Check: https://status.alquran.cloud

### Problem: "AsyncStorage Save Failed"

**Solution:**
1. Check device storage: Settings > Storage > Available space (need 5MB+)
2. Clear app data: Settings > Apps > free-alquran > Clear Storage
3. Restart: `npm run android`

## 📱 Testing on Device

### Option A: Android Emulator (Easiest)
```bash
# 1. Open Android Studio
# 2. Tools > Device Manager > Select device > Play
# 3. Wait for emulator to start
# 4. In terminal: npm run android
```

### Option B: Physical Android Phone
```bash
# 1. Connect phone to computer with USB
# 2. Enable Developer Mode & USB Debugging:
#    Settings > About Phone > Tap Build Number 7x > Developer Options > USB Debugging ON
# 3. In terminal: npm run android
```

## 📊 Timeline

| Time | What Should Happen |
|------|-------------------|
| 0-5s | App loads, shows "Loading Quran data..." |
| 5-40s | Downloading surahs from API (watch logs) |
| 40-45s | Saving to device storage |
| 45s+ | App ready! See home screen with 3 cards |

## 🎯 Success Indicators

✅ **All Good If:**
- [ ] Console shows: `✅ Successfully saved 114 surahs to AsyncStorage`
- [ ] Screen shows: Home screen with 3 menu cards
- [ ] Can tap: "Baca Alquran" → See surah list
- [ ] Can tap: Surah → See verses in Arabic
- [ ] Long-press verse → Bookmark works
- [ ] Close app & reopen → Loads instantly

❌ **Has Issues If:**
- [ ] Stuck on loading forever
- [ ] Red error screen
- [ ] Seeing React template
- [ ] Network error in logs
- [ ] AsyncStorage save error

## 🔗 Useful Links

**API Tester:** https://api.alquran.cloud/v1/surah

**Check API Status:** Manually visit link above in emulator/device browser

**React Native DevTools:**
- React Flipper (best): https://fbflipper.com/
- React DevTools: Built into Expo Dev Tools

## 📞 Still Having Issues?

**Check TESTING.md for detailed debugging guide:**
```
- Detailed console output explanation
- Manual API testing steps
- Chrome DevTools + React Native Debugger
- Performance metrics to watch
```

---

**Good luck! The app should fetch all 114 surahs successfully! 🚀📖**
