/**
 * Script untuk scrape data Quran dari Kemenag API
 * Simpan ke file JSON untuk mode offline
 * 
 * Penggunaan: node scripts/scrape-quran-data.js [juz_number]
 * Default: juz 30 (Juz Amma)
 */

const fs = require('fs');
const path = require('path');

// API dengan terjemahan Indonesia
const ALQURAN_CLOUD_API = 'https://api.alquran.cloud/v1/surah';
const DATA_DIR = path.join(__dirname, '../data');
const DELAY_MS = 200; // Delay antara request untuk avoid rate limiting

// Mapping Juz ke Surah Range
const JUZ_RANGES = {
  1: [1, 1],     // Al-Fatihah (1-5 ayat)
  2: [1, 2],     // Lanjutan Al-Fatihah dan Al-Baqarah
  // ... (untuk demo, fokus ke Juz 30)
  30: [78, 114], // Juz Amma (Juz terakhir)
};

async function fetchSurah(surahNumber) {
  try {
    // Fetch Arabic text, Indonesian translation, dan English transliteration
    const promises = [
      fetch(`${ALQURAN_CLOUD_API}/${surahNumber}`),
      fetch(`${ALQURAN_CLOUD_API}/${surahNumber}/id.indonesian`),
      fetch(`${ALQURAN_CLOUD_API}/${surahNumber}/en.transliteration`),
    ];
    
    const [resArab, resIndo, resTrans] = await Promise.all(promises);
    
    if (!resArab.ok || !resIndo.ok || !resTrans.ok) {
      throw new Error(`HTTP ${resArab.status}`);
    }
    
    const dataArab = await resArab.json();
    const dataIndo = await resIndo.json();
    const dataTrans = await resTrans.json();
    
    if (dataArab.code !== 200 || !dataArab.data) {
      console.warn(`⚠️ Invalid response for Surah ${surahNumber}`);
      return null;
    }
    
    const surah = dataArab.data;
    const surahIndo = dataIndo.data;
    const surahTrans = dataTrans.data;
    
    // Transform ke format yang diinginkan
    return {
      number: surah.number,
      name: surah.name,
      englishName: surah.englishName,
      englishNameTranslation: surah.englishNameTranslation,
      numberOfAyahs: surah.numberOfAyahs,
      revelationType: surah.revelationType,
      verses: (surah.ayahs || []).map((ayah, index) => {
        const ayahIndo = surahIndo.ayahs?.[index];
        const ayahTrans = surahTrans.ayahs?.[index];
        return {
          number: ayah.number.inSurah,
          text: ayah.text || '',
          transliteration: ayahTrans?.text || '',
          indonesianTranslation: ayahIndo?.text || '',
          juz: ayah.juz,
          page: ayah.page,
          ruku: ayah.ruku,
        };
      }),
    };
  } catch (error) {
    console.error(`❌ Error fetching Surah ${surahNumber}:`, error.message);
    return null;
  }
}

async function scrapeJuz(juzNumber = 30) {
  const range = JUZ_RANGES[juzNumber];
  if (!range) {
    console.error(`❌ Juz ${juzNumber} tidak ditemukan. Available: ${Object.keys(JUZ_RANGES).join(', ')}`);
    process.exit(1);
  }

  const [startSurah, endSurah] = range;
  console.log(`\n🚀 Scraping Juz ${juzNumber} (Surah ${startSurah}-${endSurah})...\n`);

  // Buat direktori data jika belum ada
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const surahs = [];
  let successCount = 0;
  let failCount = 0;

  for (let surahNum = startSurah; surahNum <= endSurah; surahNum++) {
    const surah = await fetchSurah(surahNum);
    
    if (surah) {
      surahs.push(surah);
      successCount++;
      console.log(`✅ Surah ${surahNum} (${surah.englishName}) - ${surah.numberOfAyahs} ayat`);
    } else {
      failCount++;
      console.log(`❌ Gagal: Surah ${surahNum}`);
    }

    // Delay untuk avoid rate limiting
    if (surahNum < endSurah) {
      await new Promise(resolve => setTimeout(resolve, DELAY_MS));
    }
  }

  // Simpan ke file JSON
  const filename = `quran-juz-${juzNumber}.json`;
  const filepath = path.join(DATA_DIR, filename);
  
  const output = {
    juzNumber,
    surahRange: [startSurah, endSurah],
    totalSurahs: surahs.length,
    scrapedAt: new Date().toISOString(),
    surahs,
  };

  fs.writeFileSync(filepath, JSON.stringify(output, null, 2), 'utf-8');

  console.log(`\n📊 Hasil Scraping Juz ${juzNumber}:`);
  console.log(`   ✅ Berhasil: ${successCount} surah`);
  console.log(`   ❌ Gagal: ${failCount} surah`);
  console.log(`   📁 Disimpan ke: ${filepath}\n`);

  return output;
}

// Jalankan scraper
const juzNumber = parseInt(process.argv[2]) || 30;
scrapeJuz(juzNumber).catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
