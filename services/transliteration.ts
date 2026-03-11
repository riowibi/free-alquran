/**
 * Indonesian Transliteration Service
 * Berdasarkan SKB 2 Menteri & Standar Transliterasi Kemenag RI
 */

export class TransliterationService {
  /**
   * Mapping utama untuk sistem formal (dengan diakritik)
   */
  private static readonly FORMAL_MAPPINGS: [RegExp, string][] = [
    // 1. Specific words (High Priority)
    [/bismillah/gi, 'Bismillāh'],
    [/alif-laam-meem/gi, 'Alif Lām Mīm'],
    
    // 2. Consonants (Arabic -> Indo Standard)
    [/th/gi, 'ṡ'],    // ث
    [/kh/gi, 'kh'],   // خ
    [/dh/gi, 'ż'],    // ذ (English 'dh' sering jadi 'ż' di Indo, 'ḍ' adalah ض)
    [/dz/gi, 'ż'],    // Alternatif English 'dz'
    [/sh/gi, 'sy'],   // ش
    [/ṣh/gi, 'ṣ'],    // ص (Standard dot below)
    [/dl/gi, 'ḍ'],    // ض (Sering ditulis dl di Indo lama)
    [/dh(?![aeiou])/gi, 'ḍ'], // ض jika di akhir
    [/zh/gi, 'ẓ'],    // ظ
    [/'/g, '‘'],      // ‘Ain
    [/`/g, '’'],      // Hamzah

    // 3. Long Vowels (Mad) - Menggunakan Macron sesuai standar Kemenag
    [/aa/gi, 'ā'],
    [/ii/gi, 'ī'],
    [/uu/gi, 'ū'],

    // 4. Clean up
    [/\s\s+/g, ' '],
  ];

  /**
   * Convert English transliteration to Indonesian (Formal)
   */
  static toIndonesian(text: string): string {
    if (!text) return '';

    let result = text;
    this.FORMAL_MAPPINGS.forEach(([regex, replacement]) => {
      result = result.replace(regex, (match) => {
        // Menjaga casing (Huruf kapital di awal kata)
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    });

    return result;
  }

  /**
   * Versi sederhana tanpa simbol diakritik (Mudah dibaca awam)
   */
  static toSimpleIndonesian(text: string): string {
    if (!text) return '';

    const simpleMappings: [RegExp, string][] = [
      [/th/gi, 'ts'],
      [/dh/gi, 'dz'],
      [/sh/gi, 'sy'],
      [/zh/gi, 'z'],
      [/aa/gi, 'a'],
      [/ii/gi, 'i'],
      [/uu/gi, 'u'],
      [/[’‘'´`]/g, ''], // Hapus apostrof
    ];

    let result = text;
    simpleMappings.forEach(([regex, replacement]) => {
      result = result.replace(regex, replacement);
    });

    return this.capitalizeSentences(result);
  }

  /**
   * Helper untuk merapikan kapitalisasi
   */
  private static capitalizeSentences(text: string): string {
    return text
      .toLowerCase()
      .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase())
      .trim();
  }
}