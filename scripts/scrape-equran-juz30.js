/**
 * Script untuk scrape data Quran Juz 30 dari equran.id API
 * Fetch semua surah dari Juz 30 (Surah 78-114)
 * 
 * API: https://equran.id/api/v2/surat/${number}
 * 
 * Penggunaan: node scripts/scrape-equran-juz30.js
 */

const fs = require('fs');
const path = require('path');

const EQURAN_API = 'https://equran.id/api/v2/surat';
const DATA_DIR = path.join(__dirname, '../assets/data');
const DELAY_MS = 300; // Delay antara request

// Juz 30 surahs
const JUZ_30_SURAHS = [78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114];

/**
 * Fetch satu surah dari equran.id API
 */
async function fetchSurahFromEquran(number) {
  try {
    const url = `${EQURAN_API}/${number}`;
    console.log(`📥 Fetching Surah ${number}...`);
    
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

    console.log(`✅ Surah ${number} - ${data.data.namaLatin} (${data.data.arti}) - ${data.data.jumlahAyat} ayat`);
    return data.data;
  } catch (error) {
    console.error(`❌ Error Surah ${number}:`, error.message);
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
 * Main scraper untuk Juz 30
 */
async function scrapeJuz30() {
  console.log(`\n🚀 Scraping Quran Juz 30 (Surah 78-114) from equran.id\n`);

  // Create data directory if not exists
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const surahs = [];
  let successCount = 0;
  let failCount = 0;

  // Fetch all surahs in Juz 30
  for (let i = 0; i < JUZ_30_SURAHS.length; i++) {
    const surahNumber = JUZ_30_SURAHS[i];
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

    // Delay between requests (except last one)
    if (i < JUZ_30_SURAHS.length - 1) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  // Save to file
  const filename = 'quran-juz-30.json';
  const filepath = path.join(DATA_DIR, filename);

  const output = {
    juzNumber: 30,
    surahRange: [78, 114],
    totalSurahs: surahs.length,
    scrapedAt: new Date().toISOString(),
    surahs,
  };

  fs.writeFileSync(filepath, JSON.stringify(output, null, 2), 'utf-8');

  // Summary
  console.log(`\n📊 Hasil Scraping Juz 30:`);
  console.log(`   ✅ Berhasil: ${successCount}/${JUZ_30_SURAHS.length} surah`);
  console.log(`   ❌ Gagal: ${failCount} surah`);
  console.log(`   📁 Disimpan ke: ${filepath}`);
  console.log(`   📊 Total verses: ${surahs.reduce((sum, s) => sum + s.numberOfAyahs, 0)}`);
  console.log(`\n`);

  // Show sample data from first surah
  if (surahs.length > 0) {
    const sample = surahs[0];
    console.log(`📖 Sample - ${sample.englishName} (${sample.name}):`);
    console.log(`   Arti: ${sample.englishNameTranslation}`);
    console.log(`   Jenis: ${sample.revelationType}`);
    if (sample.verses.length > 0) {
      const verse = sample.verses[0];
      console.log(`\n   Verse 1:`);
      console.log(`   Arabic: ${verse.text.substring(0, 60)}...`);
      console.log(`   Transliteration: ${verse.transliteration.substring(0, 60)}...`);
      console.log(`   Indonesian: ${verse.indonesianTranslation.substring(0, 60)}...\n`);
    }
  }

  return output;
}

// Run scraper
scrapeJuz30().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
