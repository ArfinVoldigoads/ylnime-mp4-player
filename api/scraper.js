export default async function handler(req, res) {
  const { url: targetUrl } = req.query;

  if (!targetUrl) {
    return res.status(400).json({ error: 'URL parameter required' });
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      },
    });

    const html = await response.text();

    // Try to find MP4 source in HTML
    const mp4Match = html.match(/src=["']([^"']*\.mp4)["']/i) ||
                    html.match(/<source[^>]*src=["']([^"']*\.mp4)["']/i);

    if (mp4Match) {
      return res.status(200).json({
        success: true,
        videoUrl: mp4Match[1],
        title: 'Mao Sub Indo',
        episode: 'al-153303-1'
      });
    }

    // Fallback: if no direct MP4, try to return the original URL
    return res.status(200).json({
      success: true,
      videoUrl: targetUrl,
      note: 'No direct MP4 found, using provided URL'
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}