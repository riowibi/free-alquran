/**
 * Script untuk scrape data Quran Juz 1-19 dari equran.id API
 * Fetch semua surah untuk masing-masing Juz dan simpan ke file terpisah
 * 
 * API: https://equran.id/api/v2/surat/${number}
 * 
 * Penggunaan: node scripts/scrape-equran-juz1-19.js
 */

const fs = require('fs');
const path = require('path');

const EQURAN_API = 'https://equran.id/api/v2/surat';
const DATA_DIR = path.join(__dirname, '../assets/data');
const DELAY_MS = 300; // Delay antara request

// Juz 1-19 dengan range surah untuk masing-masing juz
const JUZ_SURAHS = {
  1: [1, 2],
  2: [2, 3],
  3: [3, 4],
  4: [4, 5],
  5: [5, 6],
  6: [6, 7],
  7: [7, 8],
  8: [8, 9],
  9: [9, 10],
  10: [10, 11],
  11: [11, 12],
  12: [12, 13],
  13: [13, 14],
  14: [14, 15, 16],
  15: [16, 17],
  16: [17, 18],
  17: [18, 19],
  18: [19, 20, 21],
  19: [21, 22, 23],
};

/**
 * Fetch satu surah dari equran.id API
 */
async function fetchSurahFromEquran(number) {
  try {
    const url = `${EQURAN_API}/${number}`;
    console.log(`   📥 Fetching Surah ${number}...`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data) {
      throw new Error('Invalid response structure');
    }

    console.log(`   ✅ Surah ${number} - ${data.data.namaLatin}`);
    return data.data;
  } catch (error) {
    console.error(`   ❌ Error Surah ${number}:`, error.message);
    return null;
  }
}

/**
 * Transform equran.id response ke format standard
 */
function transformEquranData(equranSurah) {
  if (!equranSurah) return null;

  return {
    number: equranSurah.nomor || 0,
    name: equranSurah.nama || '',
    englishName: equranSurah.namaLatin || '',
    englishNameTranslation: equranSurah.arti || '',
    numberOfAyahs: equranSurah.jumlahAyat || 0,
    revelationType: equranSurah.tempatTurun === 'Makkah' ? 'Meccan' : 'Medinan',
    verses: (equranSurah.ayat || []).map((ayah) => ({
      number: ayah.nomorAyat || ayah.nomor || 0,
      text: ayah.teksArab || ayah.teks || '',
      transliteration: ayah.teksLatin || ayah.transliterasi || '',
      indonesianTranslation: ayah.teksIndonesia || ayah.terjemahan || '',
      juz: ayah.juz || null,
      page: ayah.halaman || null,
      ruku: ayah.ruku || null,
    })),
  };
}

/**
 * Scrape satu Juz dan save ke file
 */
async function scrapeJuz(juzNumber, surahNumbers) {
  console.log(`\n🔄 Processing Juz ${juzNumber}...`);

  const surahs = [];
  let successCount = 0;
  let failCount = 0;

  // Fetch semua surah dalam Juz
  for (let i = 0; i < surahNumbers.length; i++) {
    const surahNumber = surahNumbers[i];
    const equranData = await fetchSurahFromEquran(surahNumber);
    
    if (equranData) {
      const transformed = transformEquranData(equranData);
      if (transformed && transformed.verses.length > 0) {
        surahs.push(transformed);
        successCount++;
      } else {
        failCount++;
      }
    } else {
      failCount++;
    }

    // Delay between requests
    if (i < surahNumbers.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  // Save to file
  const filename = `quran-juz-${juzNumber}.json`;
  const filepath = path.join(DATA_DIR, filename);

  const output = {
    juzNumber: juzNumber,
    surahRange: [surahNumbers[0], surahNumbers[surahNumbers.length - 1]],
    totalSurahs: surahs.length,
    scrapedAt: new Date().toISOString(),
    surahs,
  };

  fs.writeFileSync(filepath, JSON.stringify(output, null, 2), 'utf-8');

  // Summary per Juz
  console.log(`📊 Juz ${juzNumber} Results:`);
  console.log(`   ✅ Berhasil: ${successCount}/${surahNumbers.length} surah`);
  console.log(`   ❌ Gagal: ${failCount} surah`);
  console.log(`   📁 Disimpan ke: ${filepath}`);
  console.log(`   📊 Total verses: ${surahs.reduce((sum, s) => sum + s.numberOfAyahs, 0)}`);

  return output;
}

/**
 * Main scraper untuk Juz 1-19
 */
async function scrapeAllJuz() {
  console.log(`\n🚀 Scraping Quran Juz 1-19 dari equran.id\n`);

  // Create data directory jika tidak ada
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const results = [];
  let totalVersesAll = 0;

  // Scrape setiap juz
  for (const [juzNum, surahNums] of Object.entries(JUZ_SURAHS)) {
    const result = await scrapeJuz(parseInt(juzNum), surahNums);
    results.push(result);
    totalVersesAll += surahNums.length;
  }

  // Summary keseluruhan
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📊 SUMMARY - Semua Juz 1-19:`);
  console.log(`${'='.repeat(60)}`);
  results.forEach((juz) => {
    const totalVerses = juz.surahs.reduce((sum, s) => sum + s.numberOfAyahs, 0);
    console.log(`Juz ${String(juz.juzNumber).padStart(2, '0')}: ${juz.totalSurahs} surah, ${totalVerses} verses`);
  });
  console.log(`${'='.repeat(60)}`);
  console.log(`✨ Selesai! ${results.length} file juz telah disimpan ke ${DATA_DIR}\n`);

  return results;
}

// Run scraper
scrapeAllJuz().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
