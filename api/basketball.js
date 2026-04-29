export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=300');

  try {
    const r = await fetch('https://www.karfan.is/', {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Kalenda/1.0)' }
    });
    const html = await r.text();

    // Parse headlines from karfan.is (WordPress blog posts)
    const games = [];
    
    // Match article titles and links
    const articleRe = /<h\d[^>]*class="[^"]*entry-title[^"]*"[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
    let m;
    while ((m = articleRe.exec(html)) !== null) {
      const url = m[1];
      const title = m[2].replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').trim();
      if (title && url && url.includes('karfan.is')) {
        games.push({ title, url });
      }
    }

    // Also try simpler title extraction
    if (games.length === 0) {
      const simpleRe = /<h[12][^>]*><a[^>]+href="(https?:\/\/[^"]*karfan[^"]*)"[^>]*>([^<]+)<\/a>/gi;
      while ((m = simpleRe.exec(html)) !== null) {
        games.push({ title: m[2].trim(), url: m[1] });
      }
    }

    res.json({ ok: true, posts: games.slice(0, 15), ts: Date.now() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
