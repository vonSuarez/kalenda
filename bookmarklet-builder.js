// Kalenda.is Bookmarklet Builder
// This creates bookmarklets for each blocked site

const VERCEL_API = 'https://www.kalenda.is/api/ingest';

const sites = {
  'stubb.is': {
    name: 'Stubbur',
    parser: `
      const events = [];
      document.querySelectorAll('.event-card, [class*="event"], article').forEach(card => {
        const title = card.querySelector('h1,h2,h3,h4,[class*="title"]')?.textContent?.trim();
        const date = card.querySelector('[class*="date"],time')?.textContent?.trim();
        const place = card.querySelector('[class*="venue"],[class*="location"],[class*="place"]')?.textContent?.trim();
        const price = card.querySelector('[class*="price"]')?.textContent?.trim();
        const url = card.querySelector('a')?.href;
        if(title && date) events.push({title,date,place,price,url,source:'stubb.is'});
      });
      return events;
    `
  },
  'midix.is': {
    name: 'MidiX',
    parser: `
      const events = [];
      document.querySelectorAll('.event, .show, [class*="event-item"], li.item').forEach(card => {
        const title = card.querySelector('h1,h2,h3,h4,[class*="title"]')?.textContent?.trim();
        const date = card.querySelector('[class*="date"],time,.date')?.textContent?.trim();
        const place = card.querySelector('[class*="venue"],[class*="location"]')?.textContent?.trim();
        const price = card.querySelector('[class*="price"]')?.textContent?.trim();
        const url = card.querySelector('a')?.href;
        if(title && date) events.push({title,date,place,price,url,source:'midix.is'});
      });
      return events;
    `
  },
  'kki.is': {
    name: 'KKÍ körfubolti',
    parser: `
      const events = [];
      document.querySelectorAll('table tr, .match, .game, [class*="match"]').forEach(row => {
        const cells = row.querySelectorAll('td');
        if(cells.length >= 3) {
          const date = cells[0]?.textContent?.trim();
          const teams = cells[1]?.textContent?.trim() || row.querySelector('[class*="team"]')?.textContent?.trim();
          const place = cells[2]?.textContent?.trim();
          const time = row.querySelector('[class*="time"]')?.textContent?.trim();
          if(date && teams) events.push({title:teams,date,place,time,source:'kki.is'});
        }
      });
      return events;
    `
  },
  'karfan.is': {
    name: 'Karfan körfubolti',
    parser: `
      const events = [];
      document.querySelectorAll('.match, .game, table tr, [class*="fixture"]').forEach(row => {
        const title = row.querySelector('[class*="team"],[class*="match-title"],h3,h4')?.textContent?.trim();
        const date = row.querySelector('[class*="date"],time')?.textContent?.trim();
        const place = row.querySelector('[class*="venue"],[class*="location"]')?.textContent?.trim();
        if(title && date) events.push({title,date,place,source:'karfan.is'});
      });
      return events;
    `
  },
  'hlaup.is': {
    name: 'Hlaup.is',
    parser: `
      const events = [];
      document.querySelectorAll('.event, article, [class*="race"], [class*="event-item"]').forEach(card => {
        const title = card.querySelector('h1,h2,h3,[class*="title"]')?.textContent?.trim();
        const date = card.querySelector('[class*="date"],time')?.textContent?.trim();
        const place = card.querySelector('[class*="location"],[class*="venue"]')?.textContent?.trim();
        const url = card.querySelector('a')?.href;
        if(title) events.push({title,date,place,url,source:'hlaup.is'});
      });
      return events;
    `
  },
  'xd.is': {
    name: 'Sjálfstæðisflokkurinn',
    parser: `
      const events = [];
      document.querySelectorAll('.event, article, [class*="event"]').forEach(card => {
        const title = card.querySelector('h1,h2,h3,h4')?.textContent?.trim();
        const date = card.querySelector('[class*="date"],time')?.textContent?.trim();
        const place = card.querySelector('[class*="location"],[class*="venue"]')?.textContent?.trim();
        const url = card.querySelector('a')?.href;
        if(title && date) events.push({title,date,place,url,source:'xd.is'});
      });
      return events;
    `
  },
  'gamlabio.is': {
    name: 'Gamla Bíó',
    parser: `
      const events = [];
      document.querySelectorAll('article, .event, [class*="event"]').forEach(card => {
        const title = card.querySelector('h1,h2,h3')?.textContent?.trim();
        const date = card.querySelector('[class*="date"],time')?.textContent?.trim();
        const price = card.querySelector('[class*="price"]')?.textContent?.trim();
        const url = card.querySelector('a')?.href;
        if(title) events.push({title,date,price,url,source:'gamlabio.is'});
      });
      return events;
    `
  },
  'facebook.com/events': {
    name: 'Facebook Events',
    parser: `
      const events = [];
      // Facebook is complex - just grab visible event data
      document.querySelectorAll('[role="article"], [class*="event"]').forEach(card => {
        const title = card.querySelector('h1,h2,[class*="title"]')?.textContent?.trim();
        const date = card.querySelector('[class*="date"],[class*="time"]')?.textContent?.trim();
        const place = card.querySelector('[class*="location"],[class*="venue"]')?.textContent?.trim();
        if(title) events.push({title,date,place,source:'facebook/events',url:window.location.href});
      });
      return events;
    `
  }
};

// Build the bookmarklet code for each site
Object.entries(sites).forEach(([domain, config]) => {
  const code = `
    (function(){
      try {
        ${config.parser.replace('return events;', '')}
        if(!events.length){ alert('Kalenda: Fann engar færslur á þessari síðu.\\nReyndu að vera á viðburðasíðunni.'); return; }
        const json = JSON.stringify({events, page: window.location.href, site: '${domain}'});
        const ta = document.createElement('textarea');
        ta.value = json;
        ta.style.cssText = 'position:fixed;top:10px;left:10px;width:90%;height:300px;z-index:999999;font-size:11px;';
        document.body.appendChild(ta);
        ta.select();
        const btn = document.createElement('button');
        btn.textContent = 'Loka';
        btn.style.cssText = 'position:fixed;top:10px;right:10px;z-index:9999999;padding:10px 20px;background:#1B3D8F;color:white;border:none;border-radius:6px;font-size:14px;cursor:pointer;';
        btn.onclick = ()=>{ ta.remove(); btn.remove(); copy_div.remove(); };
        const copy_div = document.createElement('div');
        copy_div.style.cssText = 'position:fixed;bottom:10px;left:10px;z-index:9999999;background:#1B3D8F;color:white;padding:12px 20px;border-radius:8px;font-family:sans-serif;font-size:13px;';
        copy_div.innerHTML = '<strong>Kalenda.is</strong> – Fundust ' + events.length + ' viðburðir á ${domain}.<br>Afritaðu textann hér að ofan og sendu í spjall.';
        document.body.appendChild(ta);
        document.body.appendChild(btn);
        document.body.appendChild(copy_div);
        document.execCommand('copy');
      } catch(e) { alert('Villa: ' + e.message); }
    })();
  `;
  console.log(`\n=== ${config.name} (${domain}) ===`);
  console.log('javascript:' + encodeURIComponent(code.trim().replace(/\s+/g, ' ')));
});

