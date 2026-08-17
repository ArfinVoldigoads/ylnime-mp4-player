const https = require('https');

const options = {
  hostname: 'ylnime.com',
  path: '/index.php?series=mao-sub-indo&episode=al-153303-1',
  method: 'GET',
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    require('fs').writeFileSync('ylnime_full.html', data);
    console.log('Saved', data.length, 'bytes');
    
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
      const matches = data.match(regex);
      if (matches) {
        console.log(`\n=== ${pattern} ===`);
        console.log([...new Set(matches)].slice(0, 20).join('\n'));
      }
    });
  });
});

req.on('error', (e) => console.error(e));
req.end();