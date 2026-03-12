import React from 'react';
import { View, Text, useColorScheme, Platform } from 'react-native';
import { Colors, Fonts } from '@/constants/theme';

interface TajwidDisplayProps {
  text: string;
  fontSize?: number;
  lineHeight?: number;
}

/**
 * Tajweed Color Display Component
 * 
 * Displays Quranic text with tajweed rule coloring
 * Analyzes text character by character and applies appropriate colors
 */
export function TajwidDisplay({ 
  text, 
  fontSize = 20, 
  lineHeight = 32 
}: TajwidDisplayProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Tajweed color mapping - Eye-friendly palette
  const TAJWEED_COLORS: { [key: string]: string } = {
    ghunnah: '#C85C53', // Warm reddish - Nun/Mim with Shadda
    ikhfa: '#D4A574', // Burnt sienna - Ikhfa rule
    madda: '#7CBFB8', // Muted teal - Long vowels
    qalab: '#A485B3', // Soft purple - Iqlab
    imala: '#C87A6A', // Warm rust - Imala
    hamza: '#7FA3A8', // Muted blue-grey - Hamza wasl
    meem: '#6B9F7F', // Sage green - Meem sakinah
    noon: '#7CB8A0', // Soft teal-green - Noon sakinah
    diacritic: '#5A5A5A', // Soft grey - Diacritical marks
  };

  // Unicode diacriticals
  const SHADDA = '\u0651';
  const SUKUN = '\u0652';
  const MADDA = '\u0653';
  const FATHA = '\u064B';
  const DAMMA = '\u064C';
  const KASRA = '\u064D';
  const FATHATAN = '\u064B';
  const DAMMATAN = '\u064C';
  const KASRATAN = '\u064D';

  // Defined character sets
  const GHUNNAH_CHARS = ['ن', 'م'];
  const IKHFA_CHARS = ['ت', 'ث', 'ج', 'د', 'ذ', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ف', 'ق', 'ك'];
  const QALQALAH_CHARS = ['ق', 'ط', 'ب', 'ج', 'د'];
  const MEEM_CHARS = ['م'];
  const NOON_CHARS = ['ن'];

  // Diacritical chars
  const DIACRITICAL_CHARS = [FATHA, DAMMA, KASRA, FATHATAN, DAMMATAN, KASRATAN, SUKUN, SHADDA];

  const getCharacterColor = (char: string, nextChar: string | null, prevChar: string | null): string => {
    // Diacritical marks
    if (DIACRITICAL_CHARS.includes(char)) {
      return TAJWEED_COLORS.diacritic;
    }

    // Ghunnah: Nun or Mim + Shadda
    if (GHUNNAH_CHARS.includes(char) && nextChar === SHADDA) {
      return TAJWEED_COLORS.ghunnah;
    }

    // Madda: explicit madda mark
    if (char === MADDA || nextChar === MADDA) {
      return TAJWEED_COLORS.madda;
    }

    // Qalqalah: Qalqalah chars with Sukun
    if (QALQALAH_CHARS.includes(char)) {
      if (nextChar === SUKUN || nextChar === null) {
        return TAJWEED_COLORS.qalab; // Color for emphasis
      }
    }

    // Meem sakinah rules
    if (MEEM_CHARS.includes(char) && prevChar === SUKUN) {
      return TAJWEED_COLORS.meem;
    }

    // Noon sakinah rules
    if (NOON_CHARS.includes(char) && prevChar === SUKUN) {
      // Ikhfa rule: noon sakinah before ikhfa letters
      if (nextChar && IKHFA_CHARS.includes(nextChar)) {
        return TAJWEED_COLORS.ikhfa;
      }
      // Default noon sakinah
      return TAJWEED_COLORS.noon;
    }

    // Ikhfa: After tanwin or noon sakinah
    if (IKHFA_CHARS.includes(char)) {
      if (prevChar === FATHATAN || prevChar === DAMMATAN || prevChar === KASRATAN) {
        return TAJWEED_COLORS.ikhfa;
      }
    }

    // Default: no coloring
    return colors.text;
  };

  // Split text into characters for processing
  const chars = Array.from(text);

  // Group consecutive characters with same color to preserve Arabic shaping & ligatures
  const colorGroups: { color: string; text: string }[] = [];
  let currentGroup = { color: '', text: '' };

  chars.forEach((char, idx) => {
    const nextChar = idx < chars.length - 1 ? chars[idx + 1] : null;
    const prevChar = idx > 0 ? chars[idx - 1] : null;
    const charColor = getCharacterColor(char, nextChar, prevChar);

    if (charColor === currentGroup.color) {
      // Same color as current group, accumulate
      currentGroup.text += char;
    } else {
      // Different color, save current group and start new one
      if (currentGroup.text) {
        colorGroups.push({ ...currentGroup });
      }
      currentGroup = { color: charColor, text: char };
    }
  });

  // Add last group
  if (currentGroup.text) {
    colorGroups.push(currentGroup);
  }

  const fontFamily = Platform.select({
    ios: 'KFGQPC Uthman Taha Naskh',
    // Android: Try system fonts first, then fallback kalu expo go
    android: 'Noto Sans Arabic, Droid Naskh Arabic, sans-serif',
    default: 'serif',
    web: '"KFGQPC Uthman Taha Naskh", "Noto Sans Arabic", serif',
  });

  const baseStyle = {
    fontSize,
    lineHeight,
    fontFamily,
  };

  return (
    <Text
      style={{
        fontSize,
        lineHeight,
        textAlign: 'right',
        fontWeight: '400',
        color: colors.text,
        direction: 'rtl',
        writingDirection: 'rtl',
        fontFamily,
        letterSpacing: 0.5,
        // allowFontScaling: false,
      }}>
      {colorGroups.map((group, idx) => (
        <Text
          key={idx}
          style={{
            color: group.color,
            ...baseStyle,
          }}>
          {group.text}
        </Text>
      ))}
    </Text>
  );
}
