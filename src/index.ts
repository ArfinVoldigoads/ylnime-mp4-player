export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/scraper') {
      const targetUrl = url.searchParams.get('url');
      
      if (!targetUrl) {
        return new Response(JSON.stringify({ error: 'URL parameter required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      try {
        const response = await fetch(targetUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        });

        const html = await response.text();
        
        // Extract video URL from <source src="...">
        const videoMatch = html.match(/<source[^>]*src="([^"]*\.mp4)"[^>]*>/i);
        
        if (videoMatch) {
          return new Response(JSON.stringify({
            success: true,
            videoUrl: videoMatch[1],
            title: 'Mao Sub Indo',
            episode: 'al-153303-1',
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }

        // Try to find iframe or other video sources
        const iframeMatch = html.match(/<iframe[^>]*src="([^"]+)"[^>]*>/i);
        if (iframeMatch) {
          return new Response(JSON.stringify({
            success: true,
            iframeUrl: iframeMatch[1],
            note: 'Video embedded in iframe',
          }), {
            headers: { 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({
          success: false,
          error: 'Video URL not found',
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    return new Response('Not found', { status: 404 });
  },
};