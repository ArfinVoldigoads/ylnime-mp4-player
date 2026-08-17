export default async function handler(req, res) {
  const { url: targetUrl } = req.query;

  if (!targetUrl) {
    return res.status(400).json({ error: 'URL parameter required' });
  }

  try {
    const response = await fetch(targetUrl);
    const headers = response.headers;
    const status = response.status;

    res.setHeader('Content-Type', headers.get('content-type') || 'video/mp4');
    res.setHeader('Content-Length', headers.get('content-length'));
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Access-Control-Allow-Origin', '*');

    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(value);
    }
    res.end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}