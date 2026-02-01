// scripts/warmup.js
// Pre-compiles all pages by visiting them once after dev server starts

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// All pages to pre-compile
const PAGES = [
  '/',
  '/cv-maker',
  '/cv-analyzer',
  '/interview',
  '/issues',
  '/job-admin',
];

async function warmupPage(path) {
  return new Promise((resolve) => {
    const url = BASE_URL + path;
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`✓ Warmed up: ${path} (${res.statusCode})`);
        resolve(true);
      });
    }).on('error', (err) => {
      console.log(`✗ Failed: ${path} - ${err.message}`);
      resolve(false);
    });
  });
}

async function waitForServer(maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      await new Promise((resolve, reject) => {
        http.get(BASE_URL, (res) => {
          resolve(true);
        }).on('error', reject);
      });
      return true;
    } catch {
      console.log(`Waiting for server... (${i + 1}/${maxAttempts})`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return false;
}

async function main() {
  console.log('\n🔥 Page Warmup Script');
  console.log('━'.repeat(40));
  
  console.log('Waiting for dev server to be ready...');
  const serverReady = await waitForServer();
  
  if (!serverReady) {
    console.log('❌ Server not ready after 30 seconds');
    process.exit(1);
  }
  
  console.log('✓ Server is ready!\n');
  console.log('Pre-compiling pages...\n');
  
  const startTime = Date.now();
  
  // Warm up pages sequentially to avoid overwhelming the server
  for (const page of PAGES) {
    await warmupPage(page);
    // Small delay between requests
    await new Promise(r => setTimeout(r, 100));
  }
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log('\n' + '━'.repeat(40));
  console.log(`✅ All ${PAGES.length} pages warmed up in ${duration}s`);
  console.log('━'.repeat(40) + '\n');
}

main().catch(console.error);
