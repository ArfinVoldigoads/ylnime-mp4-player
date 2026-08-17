import urllib.request
import ssl

ctx = ssl.create_default_context()
req = urllib.request.Request(
    "https://ylnime.com/index.php?series=mao-sub-indo&episode=al-153303-1",
    headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
)
try:
    resp = urllib.request.urlopen(req, context=ctx, timeout=15)
    html = resp.read().decode('utf-8', errors='replace')
    with open('episode.html', 'w') as f:
        f.write(html)
    print(f"OK: {len(html)} bytes")
except Exception as e:
    print(f"ERROR: {e}")
