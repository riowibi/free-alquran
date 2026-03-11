/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Eye-friendly palette for comfortable reading (ages 25-50+)
 * Warm tones with reduced eye strain
 */

import { Platform } from 'react-native';

// Eye-friendly tint colors
const tintColorLight = '#B8860B'; // Golden brown - warm and professional
const tintColorDark = '#D4AF85'; // Soft gold - warm and elegant

export const Colors = {
  light: {
    // Light mode: Warm cream/beige background with dark text
    text: '#3E2723', // Very dark brown (not pure black)
    background: '#F5F1ED', // Warm cream/off-white (like aged paper)
    tint: tintColorLight,
    icon: '#A1887F', // Warm taupe
    tabIconDefault: '#A1887F',
    tabIconSelected: tintColorLight,
  },
  dark: {
    // Dark mode: Warm dark tan background with soft text
    text: '#E8DDD5', // Warm light beige (not pure white)
    background: '#0f0f0f', // Deep warm brown (not pure black)
    tint: tintColorDark,
    icon: '#8B7355', // Warm medium brown
    tabIconDefault: '#8B7355',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
