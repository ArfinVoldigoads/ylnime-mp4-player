export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // Web Player Page
    if (pathname === '/' || pathname === '/index.html') {
      return new Response(HTML_PAGE, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // Scraper API
    if (pathname === '/api/scraper') {
      const targetUrl = url.searchParams.get('url');
      if (!targetUrl) {
        return Response.json({ error: 'URL parameter required' }, { status: 400, headers: corsHeaders });
      }

      try {
        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
        });
        const html = await response.text();

        // Extract MP4 source
        const mp4Match = html.match(/src=["']([^"']*\.mp4)["']/i) ||
                        html.match(/<source[^>]*src=["']([^"']*\.mp4)["']/i);

        if (mp4Match) {
          return Response.json({
            success: true,
            videoUrl: mp4Match[1],
            title: 'Mao Sub Indo',
            episode: 'al-153303-1',
          }, { headers: corsHeaders });
        }

        // Also try m3u8
        const m3u8Match = html.match(/src=["']([^"']*\.m3u8)["']/i) ||
                         html.match(/<source[^>]*src=["']([^"']*\.m3u8)["']/i);
        if (m3u8Match) {
          return Response.json({
            success: true,
            videoUrl: m3u8Match[1],
            format: 'm3u8',
          }, { headers: corsHeaders });
        }

        return Response.json({
          success: true,
          videoUrl: targetUrl,
          note: 'No direct MP4 found, using provided URL',
        }, { headers: corsHeaders });

      } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500, headers: corsHeaders });
      }
    }

    // Stream proxy
    if (pathname === '/api/stream') {
      const targetUrl = url.searchParams.get('url') || 'https://storage.animekita.org/ro/f6ed-1786184742343.mp4';
      try {
        const response = await fetch(targetUrl);
        return new Response(response.body, {
          status: response.status,
          headers: {
            'Content-Type': response.headers.get('content-type') || 'video/mp4',
            'Content-Length': response.headers.get('content-length') || '',
            'Accept-Ranges': 'bytes',
            ...corsHeaders,
          },
        });
      } catch (error) {
        return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
      }
    }

    // 404
    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};

const HTML_PAGE = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mao Sub Indo - Video Player</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: #0b0e14;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 16px;
    }
    .player-card {
      width: 100%;
      max-width: 900px;
      background: #151d2a;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
      border: 1px solid #233044;
    }
    .video-container {
      position: relative;
      width: 100%;
      aspect-ratio: 16/9;
      background: #000;
    }
    video {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .info-section {
      padding: 20px;
    }
    .title {
      font-size: 20px;
      font-weight: 700;
      color: #f8fafc;
      margin-bottom: 6px;
    }
    .subtitle {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 16px;
    }
    .controls-row {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      align-items: center;
    }
    .btn {
      background: #3b82f6;
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 13px;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn:hover {
      background: #2563eb;
    }
    .btn-secondary {
      background: #243147;
      color: #cbd5e1;
    }
    .btn-secondary:hover {
      background: #33435e;
    }
    .url-box {
      margin-top: 16px;
      padding: 12px;
      background: #0b0e14;
      border-radius: 6px;
      word-break: break-all;
      font-family: monospace;
      font-size: 12px;
      color: #38bdf8;
      border: 1px solid #1e293b;
    }
    .scraper-section {
      margin-top: 20px;
      padding: 16px;
      background: #0b0e14;
      border-radius: 8px;
      border: 1px solid #1e293b;
    }
    .scraper-section h3 {
      font-size: 14px;
      color: #94a3b8;
      margin-bottom: 10px;
    }
    .scraper-input {
      width: 100%;
      padding: 10px;
      background: #151d2a;
      border: 1px solid #233044;
      border-radius: 6px;
      color: #e2e8f0;
      font-size: 13px;
      margin-bottom: 10px;
    }
    .scraper-result {
      margin-top: 10px;
      padding: 10px;
      background: #151d2a;
      border-radius: 6px;
      font-family: monospace;
      font-size: 12px;
      color: #38bdf8;
      word-break: break-all;
      display: none;
    }
  </style>
</head>
<body>
  <div class="player-card">
    <div class="video-container">
      <video id="vplayer" controls autoplay playsinline preload="auto">
        <source src="https://storage.animekita.org/ro/f6ed-1786184742343.mp4" type="video/mp4">
        Browser Anda tidak mendukung video tag.
      </video>
    </div>
    <div class="info-section">
      <div class="title">Mao Sub Indo - Episode al-153303-1</div>
      <div class="subtitle">Direct Stream Link | Source: AnimeKita / Ylnime</div>
      <div class="controls-row">
        <a id="downloadBtn" href="https://storage.animekita.org/ro/f6ed-1786184742343.mp4" target="_blank" download class="btn">
          ⬇️ Download MP4
        </a>
        <button onclick="copyUrl()" class="btn btn-secondary">
          📋 Salin URL Video
        </button>
      </div>
      <div class="url-box" id="mp4UrlDisplay">
        https://storage.animekita.org/ro/f6ed-1786184742343.mp4
      </div>

      <div class="scraper-section">
        <h3>🔍 Scraper API - Masukkan URL Ylnime</h3>
        <input type="text" class="scraper-input" id="scraperUrl" placeholder="https://ylnime.com/index.php?series=..." />
        <button onclick="scrapeUrl()" class="btn">Scrape URL</button>
        <div class="scraper-result" id="scraperResult"></div>
      </div>
    </div>
  </div>

  <script>
    function copyUrl() {
      const url = document.getElementById('mp4UrlDisplay').innerText.trim();
      navigator.clipboard.writeText(url).then(() => {
        alert('URL Video berhasil disalin!');
      });
    }

    async function scrapeUrl() {
      const url = document.getElementById('scraperUrl').value.trim();
      const result = document.getElementById('scraperResult');
      if (!url) { result.style.display = 'block'; result.innerText = 'Masukkan URL dulu!'; return; }
      result.style.display = 'block';
      result.innerText = 'Loading...';
      try {
        const res = await fetch('/api/scraper?url=' + encodeURIComponent(url));
        const data = await res.json();
        result.innerText = JSON.stringify(data, null, 2);
      } catch(e) {
        result.innerText = 'Error: ' + e.message;
      }
    }
  </script>
</body>
</html>`;