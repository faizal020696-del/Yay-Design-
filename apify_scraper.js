import https from 'https';
import fs from 'fs';

const APIFY_TOKEN = 'apify_api_dFFn5gS0HmcGXwZrkfH6Ln08GgQ1DS2EWBsS';
// Menggunakan actor resmi yumitori untuk Etsy Listings
const ACTOR_IDENTIFIER = 'yumitori~etsy-listings-scraper';

console.log('═══════════════════════════════════════════════════════════════');
console.log('   🔍 APIFY ETSY PDF PRINTABLES RESEARCH (AGENT 1)');
console.log('═══════════════════════════════════════════════════════════════\n');

// Konfigurasi input khusus riset produk digital PDF dengan maxItems 10
const scraperInput = {
  "searchTerms": [
    "digital printables pdf download",
    "etsy digital planners pdf"
  ],
  "maxItems": 10
};

function runEtsyScraper() {
  return new Promise((resolve) => {
    const runData = JSON.stringify(scraperInput);

    const options = {
      hostname: 'api.apify.com',
      port: 443,
      path: `/v2/acts/${ACTOR_IDENTIFIER}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&maxItems=100&format=json`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(runData)
      }
    };

    console.log(`📋 Mengirim request ke actor: ${ACTOR_IDENTIFIER}`);
    console.log(`   Queries : ${JSON.stringify(scraperInput.queries)}`);
    console.log(`   MaxItems: ${scraperInput.maxItems}`);
    console.log('');

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`   Status HTTP: ${res.statusCode}`);
        try {
          const items = JSON.parse(data);
          if (Array.isArray(items) && items.length > 0) {
            console.log(`\n✅ BERHASIL! Mendapatkan ${items.length} listing produk PDF!\n`);
            
            // Preview 10 item pertama di terminal
            items.slice(0, 10).forEach((item, i) => {
              const title = item.title || item.name || 'N/A';
              const price = item.price || 'N/A';
              const rating = item.rating || 'N/A';
              const reviews = item.reviews || item.review_count || 'N/A';
              const sales = item.sales || item.nb_sales || item.favoriteCount || 'N/A';
              const url = item.url || item.link || 'N/A';
              
              console.log(`${i + 1}. ${title}`);
              console.log(`   💰 ${price} | ⭐ ${rating} (${reviews}) | 🔢 Sales/Fav: ${sales}`);
              console.log(`   🔗 ${url}`);
              console.log('');
            });

            // Pastikan direktori outputs ada
            if (!fs.existsSync('outputs')) {
              fs.mkdirSync('outputs');
            }

            // Simpan hasil murni ke output_agent1.json
            fs.writeFileSync('outputs/output_agent1.json', JSON.stringify(items, null, 2));
            console.log('💾 Data sukses disimpan ke outputs/output_agent1.json');
            resolve(items);
          } else if (items.error) {
            console.log(`   ❌ Apify Error: ${items.error.message}`);
            resolve(null);
          } else {
            console.log(`   ❌ Tidak ada hasil atau format tidak sesuai.`);
            console.log(`   Response: ${JSON.stringify(items).substring(0, 500)}`);
            resolve(null);
          }
        } catch (e) {
          console.log(`   ❌ Parse Error: ${e.message}`);
          console.log(`   Raw Data: ${data.substring(0, 500)}`);
          resolve(null);
        }
      });
    });

    req.on('error', (e) => {
      console.error(`   ❌ Network Error: ${e.message}`);
      resolve(null);
    });

    req.write(runData);
    req.end();
  });
}

// Eksekusi Utama
(async () => {
  const result = await runEtsyScraper();

  console.log('\n═══════════════════════════════════════════════════════════════');
  if (result) {
    console.log('   ✅ PROSES SELESAI - DATA PDF SIAP DIANALISIS AGENT 2');
  } else {
    console.log('   ❌ PROSES GAGAL - SILAHKAN CEK KEMBALI KONEKSI/TOKEN');
  }
  console.log('═══════════════════════════════════════════════════════════════\n');
})();