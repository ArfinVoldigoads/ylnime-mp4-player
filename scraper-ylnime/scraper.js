const https = require('https');
const http = require('http');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
    req.end();
  });
}

async function main() {
  try {
    console.log('Fetching page...');
    const html = await fetchPage('https://ylnime.com/index.php?series=mao-sub-indo&episode=al-153303-1');
    console.log('Got', html.length, 'bytes');
    
    // Save to file
    require('fs').writeFileSync('ylnime_full.html', html);
    
    // Search for relevant patterns
    const patterns = [
      'animekita',
      'video',
      'player',
      'source',
      'embed',
      'iframe',
      'fetch',
      'axios',
      'api',
      'ajax',
      'videoUrl',
      'video_url',
      'mp4',
      'm3u8',
      'storage'
    ];
    
    patterns.forEach(pattern => {
      const regex = new RegExp(`${pattern}[^"'\\s]*`, 'gi');
      const matches = html.match(regex);
      if (matches) {
        console.log(`\n=== ${pattern} ===`);
        console.log([...new Set(matches)].slice(0, 20).join('\n'));
      }
    });
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();