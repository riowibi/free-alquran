import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
  // Catch any errors from preventing the splash screen from hiding
});

/**
 * Hook untuk prepare Arabic fonts
 * Memastikan font Arabic (Amiri, Scheherazade) loaded sebelum app render
 * 
 * Usage:
 * const isFontsLoaded = usePrepareArabicFonts();
 * if (!isFontsLoaded) return null;
 */
export function usePrepareArabicFonts() {
  const [fontsLoaded, fontError] = useFonts({
    // KFGQPC Uthman Taha Naskh - Font khusus Quran dengan diacriticals sempurna
    'KFGQPC Uthman Taha Naskh': require('../assets/fonts/KFGQPCUthmanthTahaNaskh-Regular.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync().catch(() => {
        // Catch any errors from hiding the splash screen
      });
    }
  }, [fontsLoaded, fontError]);

  return fontsLoaded && !fontError;
}

/**
 * Alternative hook: Load Arabic fonts dengan fallback ke system fonts
 * Lebih fleksibel untuk saat custom fonts belum tersedia
 */
export function useArabicFontsWithFallback() {
  try {
    const [fontsLoaded, fontError] = useFonts({
      // Custom fonts jika tersedia
      // Uncomment ketika sudah setup:
      // 'Amiri': require('../assets/fonts/Amiri-Regular.ttf'),
    });

    useEffect(() => {
      if (fontsLoaded || fontError) {
        SplashScreen.hideAsync().catch(() => {});
      }
    }, [fontsLoaded, fontError]);

    // Return true jika fonts loaded ATAU jika ada error (fallback ke system fonts)
    return true;
  } catch (error) {
    // Fallback ke system fonts jika ada error
    console.warn('Font loading error, using system fonts:', error);
    return true;
  }
}
