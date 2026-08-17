import { createServer } from 'http';
import { parse } from 'url';
import fs from 'fs';

const PORT = process.env.PORT || 3000;
const VIDEO_URL = 'https://storage.animekita.org/ro/f6ed-1786184742343.mp4';
const STORAGE_DIR = 'storage';

const server = createServer(async (req, res) => {
  const { pathname } = parse(req.url, true);
  const query = parse(req.url, true).query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Web Player Page
  if (pathname === '/') {
    const html = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Player - Mao Sub Indo</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background: #0a0a0a;
      color: white;
      font-family: system-ui, sans-serif;
      overflow: hidden;
    }
    .container {
      position: relative;
      width: 100vw;
      height: 100vh;
      background: #000;
    }
    video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .controls {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
      padding: 20px;
      box-sizing: border-box;
    }
    .info {
      margin-bottom: 10px;
      font-size: 18px;
    }
    .quality {
      display: flex;
      gap: 8px;
    }
    button {
      background: #ff00aa;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
    }
    .title {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <video id="player" controls autoplay preload="metadata">
      <source src="${VIDEO_URL}" type="video/mp4">
      Browser tidak support.
    </video>
    
    <div class="controls">
      <div class="info">
        <div class="title">Mao Sub Indo</div>
        <div>Episode: al-153303-1</div>
      </div>
      
      <div class="quality">
        <button onclick="changeQuality(360)">360p</button>
        <button onclick="changeQuality(480)">480p</button>
        <button onclick="changeQuality(720)">720p</button>
        <button onclick="changeQuality(1080)">1080p</button>
      </div>
    </div>
  </div>

  <script>
    const video = document.getElementById('player');
    let currentQuality = 0;
    
    function changeQuality(quality) {
      currentQuality = quality;
      video.pause();
      video.currentTime = 0;
      video.src = "${VIDEO_URL}";
      video.load();
      video.play();
    }
    
    video.addEventListener('error', (e) => {
      console.error('Video error:', e);
    });
  </script>
</body>
</html>`;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
    return;
  }

  // Scraper API
  if (pathname === '/api/scraper') {
    const target = query.url;
    if (!target) {
      res.writeHead(400);
      res.end(JSON.stringify({ error: 'URL parameter required' }));
      return;
    }

    try {
      const response = await fetch(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      });

      const html = await response.text();

      // Extract MP4 or source
      const mp4Match = html.match(/src=["']([^"']*\.mp4)["']/i) || 
                      html.match(/<source[^>]*src=["']([^"']*\.mp4)["']/i);
      
      if (mp4Match) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          videoUrl: mp4Match[1],
          title: 'Mao Sub Indo',
          episode: 'al-153303-1'
        }));
        return;
      }

      res.writeHead(404);
      res.end(JSON.stringify({ success: false, error: 'No video found' }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
    return;
  }

  // Stream proxy (optional)
  if (pathname === '/api/stream') {
    const target = query.url || VIDEO_URL;
    try {
      const response = await fetch(target);
      const headers = response.headers;
      const status = response.status;

      res.writeHead(status, {
        'Content-Type': headers.get('content-type'),
        'Content-Length': headers.get('content-length'),
        'Accept-Ranges': 'bytes',
        'Access-Control-Allow-Origin': '*'
      });

      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
      res.end();
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});