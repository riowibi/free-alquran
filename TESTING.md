# Testing Quran App on Android

Dokumentasi lengkap untuk test aplikasi Quran di Android device dan ensure API fetching berhasil.

## 📱 Prerequisites

```bash
# Ensure you have:
1. Android Studio installed
2. Android Emulator running (or Physical Device connected)
3. Node.js & npm installed
4. Expo CLI installed globally: npm install -g expo-cli
```

## 🚀 Running on Android

### Option 1: Using Emulator (Recommended)
```bash
# 1. Start Android Emulator from Android Studio
#    - Open Android Studio
#    - Tools > Device Manager > Select Device > Play

# 2. In terminal, run:
cd free-alquran
npm run android

# 3. Wait for Expo to compile and app to load on emulator
```

### Option 2: Using Physical Device
```bash
# 1. Connect Android phone to computer via USB
# 2. Enable Developer Mode & USB Debugging
# 3. Run:
npm run android

# 4. App will be built and ran on your device
```

### Option 3: Manual Expo Start
```bash
# 1. In terminal:
npm start

# 2. Press 'a' for Android in the terminal
# 3. Wait for Expo to compile and app can then be opened
```

## 🔍 Checking API Fetch Success

### Method 1: Console Logs (Recommended)
The app now has detailed logging for debugging. Check logs with:

```bash
# If using emulator/physical device:
npx expo start  # Keep this running in terminal
# Logs will appear in the terminal window

# Look for messages like:
# ✅ Fetching surahs list from API...
# 📖 Starting to fetch all surahs from API...
# ✅ Surah 1 (الفاتحة) - 7 verses
# 📝 Saving 114 surahs to AsyncStorage...
# ✅ Successfully saved 114 surahs to AsyncStorage
```

### Method 2: Using React Native Debugger
```bash
# 1. Install React Native Debugger
#    Windows: https://github.com/jhen0409/react-native-debugger/releases

# 2. Open the debugger

# 3. In your Android emulator/device:
#    - Press Ctrl+M (cmd+D on iOS) to open Developer Menu
#    - Select "Open Debugger"

# 4. Go to Console tab to see all logs
```

### Method 3: Chrome DevTools
```bash
# 1. In Android device Dev Menu (Ctrl+M):
#    Select "Debug"

# 2. Browser opens at: http://localhost:8081/debugger-ui/

# 3. Open Console to see logs
```

## ✅ Expected Console Output on First Run

```
📱 Initializing Quran data...
💾 Checking local storage...
⚠️ No surahs found in AsyncStorage
🌐 Local storage empty, fetching from API...
📡 Fetching surahs list from API...
✅ Fetched 114 surahs list
📚 Fetching 114 surahs...
✅ Surah 1 (الفاتحة) - 7 verses
✅ Surah 2 (البقرة) - 286 verses
✅ Surah 3 (آل عمران) - 200 verses
...
⏳ Progress: 10/114 surahs loaded
⏳ Progress: 20/114 surahs loaded
⏳ Progress: 30/114 surahs loaded
...
🎉 Quran data loaded: 114 surahs (0 failed) in 12345ms
✅ API fetch successful: 114 surahs
💾 Saving to local storage...
📝 Saving 114 surahs to AsyncStorage...
📊 Data size: 4523.45 KB
✅ Successfully saved 114 surahs to AsyncStorage
✅ Data saved to local storage
📊 Loaded: 0 bookmarks, last read progress: No
```

## 📊 Timeline for First Run

| Stage | Duration | What Happens |
|-------|----------|--------------|
| Check Local Storage | < 1s | Look for cached data |
| Fetch Surahs List | 1-2s | Get list of 114 surahs from API |
| Fetch All Verses | 10-30s | Download all verses (50ms delay between requests) |
| Save to AsyncStorage | 2-5s | Write ~4.5MB data to device storage |
| **Total** | **15-40s** | Depending on network speed |

## 🔧 Troubleshooting

### Problem: "Loading Quran data..." stuck forever

**Solution:**
```bash
# 1. Clear Metro cache:
npm start --clear

# 2. Or restart terminal and run:
npm run android
```

### Problem: Network Error - Cannot fetch API

**Checks:**
```bash
# 1. Ensure emulator/device has internet:
#    - Emulator can access internet (usually auto-proxied)
#    - Physical device has WiFi/Mobile data enabled

# 2. Test API directly:
#    Open browser in emulator/device and visit:
#    https://api.alquran.cloud/v1/surah

# 3. Check if API is reachable:
#    From Android Dev Tools menu:
#    - Check network logs
#    - Or use Charles Proxy to monitor requests
```

### Problem: AsyncStorage Save Failed

**Solution:**
```bash
# If you see: "❌ Error saving Quran data to AsyncStorage"

# 1. Check device storage space:
#    Settings > Storage > Check Available Space
#    Need: ~5MB minimum free

# 2. Clear app data:
#    Settings > Apps > free-alquran > Clear Cache/Storage
#    Then restart app

# 3. Rebuild app:
npm run android
```

### Problem: All data downloading but no surahs showing

**Checks:**
```bash
# 1. Watch console for completion message:
#    "🎉 Quran data loaded: 114 surahs"

# 2. If not showing, check:
#    - Are there parsing errors? (look for ❌)
#    - Is initialization finishing? (look for setIsInitialized)

# 3. Force refresh with:
#    Press R in emulator when Expo is running
```

## 🧪 Manual API Test

### Test Fetch Directly from Device
```bash
# In Android emulator/device browser, visit:
https://api.alquran.cloud/v1/surah

# Should see JSON response with 114 surahs
# Each surah has: number, name, englishName, numberOfAyahs
```

### Test Specific Surah
```bash
# Fetch Surah Al-Fatiha (1)
https://api.alquran.cloud/v1/surah/1

# Response will have:
{
  "code": 200,
  "status": "OK",
  "data": {
    "number": 1,
    "name": "الفاتحة",
    "englishName": "Al-Fatiha",
    "numberOfAyahs": 7,
    "ayahs": [ ... array of 7 verses ]
  }
}
```

## 📈 Performance Metrics to Watch

| Metric | Expected | Warning |
|--------|----------|---------|
| Fetch All Surahs List | 1-2s | > 5s = slow network |
| Fetch Individual Surah | 100-500ms | > 1s = slow network |
| Total Fetch Time | 15-40s | > 60s = network issues |
| AsyncStorage Save | 2-5s | > 10s = device storage slow |
| Subsequent Open | < 1s | > 2s = storage read slow |

## 🎯 Success Criteria

✅ **App is working correctly if:**
1. Logs show: `✅ Successfully saved 114 surahs to AsyncStorage`
2. Device displays: "Quran" title with "Baca dan pelajari Al-Quran dengan tajweed"
3. Shows 3 cards: "Baca Alquran", "Terakhir Baca", "Bookmark"
4. Can tap cards and navigate to surahs
5. Subsequent app opens load instantly (data from AsyncStorage)

❌ **Failed if:**
1. Error message: "Unable to load Quran data..."
2. Stuck on "Loading Quran data..." forever
3. Network errors in console
4. AsyncStorage save errors in logs

## 🐛 Debug Commands

### View All Console Logs
```bash
# 1. Start with: npm start
# 2. Press: Shift+M (iOS) or Ctrl+M (Android)
# 3. Select: Debug JS Remotely
# 4. Open: http://localhost:8081/debugger-ui/
# 5. Go to Console tab
```

### Check Storage Contents
```bash
# In your app, call this in console:
import { QuranStorage } from '@/services/quran-storage';
const data = await QuranStorage.getSurahs();
console.log('Stored surahs:', data.length);
```

### Force Clear Storage
```bash
# In app DEV menu, you can manually clear:
import { QuranStorage } from '@/services/quran-storage';
await QuranStorage.clearAllData();
// Then restart app to refetch
```

## 📝 Logging Levels

- `📱` - Initialization start
- `💾` - Storage operations
- `🌐` - Network/API calls
- `📖` - Data retrieval
- `📊` - Data statistics
- `✅` - Success operations
- `⚠️` - Warnings
- `❌` - Errors
- `⏳` - Progress updates
- `🎉` - Completion

## 🔗 API Information

**Base URL:** `https://api.alquran.cloud/v1`

**Endpoints Used:**
- `GET /surah` - List all 114 surahs (metadata only)
- `GET /surah/:number` - Get specific surah with all verses

**Data Size:**
- Surahs List: ~4 KB
- Average per Surah: ~40 KB
- Total 114 Surahs: ~4.5 MB
- AsyncStorage Limit: ~5-10 MB (usually sufficient)

**Rate Limiting:**
- No auth required
- No official rate limit (free to use)
- Considerate delay: 50ms between requests (to avoid overwhelming server)

## 🚀 Next Steps

1. Once you see all 114 surahs fetched successfully
2. Test navigation:
   - Tap "Baca Alquran" → See surah list → Tap surah → Read verses
   - Long-press a verse → Bookmark it → See it in Bookmark screen
   - Progress is auto-saved to "Terakhir Baca"

3. Close and reopen app:
   - Should load instantly from AsyncStorage
   - No network request needed (offline mode)

**Happy Testing!** 📖✨
