export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=3600'); // cache 1 hour

  try {
    const r = await fetch('https://netskraning.is', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Kalenda/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      }
    });
    
    if (!r.ok) return res.status(502).json({ ok: false, error: `HTTP ${r.status}` });
    
    const html = await r.text();
    const events = [];

    // Parse event blocks
    const blocks = html.split(/<tr[^>]*>/);
    let currentDate = '';
    
    for (const block of blocks) {
      // Month headers
      const monthMatch = block.match(/<th[^>]*>(\w+ \d{4})<\/th>/);
      if (monthMatch) continue;
      
      // Date
      const dateMatch = block.match(/(\d+)\.\s*(jan|feb|mar|apr|maí|jún|júl|ágú|sep|okt|nóv|des)[^\d]*(\d{4})/i);
      if (dateMatch) currentDate = dateMatch[0];
      
      // Title and link
      const titleMatch = block.match(/<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/);
      const typeMatch = block.match(/<td[^>]*class="[^"]*type[^"]*"[^>]*>([^<]+)<\/td>/i);
      const locationMatch = block.match(/<td[^>]*class="[^"]*location[^"]*"[^>]*>([^<]+)<\/td>/i);
      
      if (titleMatch && currentDate) {
        events.push({
          title: titleMatch[2].trim(),
          url: `https://netskraning.is${titleMatch[1]}`,
          date: currentDate.trim(),
          type: typeMatch ? typeMatch[1].trim() : '',
          location: locationMatch ? locationMatch[1].trim() : '',
        });
      }
    }

    res.json({ ok: true, count: events.length, events, ts: Date.now() });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
}
