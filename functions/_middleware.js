export async function onRequest(context) {
  const url = new URL(context.request.url);
  const pathname = url.pathname.toLowerCase();

  // 1. Výjimka pro oficiální instalátor launcheru
  if (pathname === '/install.sh') {
    const assetRes = await context.env.ASSETS.fetch(context.request);
    if (assetRes.status === 200) {
      return new Response(assetRes.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }
  }

  // 2. Ochrana citlivých cest a sondování - pro neexistující/systémové soubory vracíme vždy 404 (místo SPA 200 fallbacku)
  if (
    pathname.startsWith('/.') ||
    pathname.includes('/.') ||
    pathname.endsWith('.env') ||
    pathname.endsWith('.sql') ||
    pathname.endsWith('.bak') ||
    pathname.endsWith('.conf') ||
    pathname.endsWith('.config') ||
    pathname.endsWith('.ini') ||
    pathname.endsWith('.log') ||
    pathname.endsWith('.sh') ||
    pathname.endsWith('.yml') ||
    pathname.endsWith('.yaml') ||
    pathname === '/config.js'
  ) {
    return new Response('Not Found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }

  // 2. Požadavky na statické assety s příponou (mimo .html)
  // Pokud soubor v balíčku neexistuje, vrátit skutečnou 404 místo index.html s kódem 200
  const fileExtMatch = pathname.match(/\.([a-z0-9]+)$/i);
  if (fileExtMatch) {
    const ext = fileExtMatch[1].toLowerCase();
    if (ext !== 'html') {
      const assetRes = await context.env.ASSETS.fetch(context.request);
      if (assetRes.status === 404) {
        return new Response('File Not Found', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
      return assetRes;
    }
  }

  // 3. Transparentní reverzní proxy pro /api cesty přímo na backend bot serveru
  if (pathname.startsWith('/api/')) {
    const backendUrl = new URL(url.pathname + url.search, 'https://api.6767111.xyz');
    try {
      return await fetch(new Request(backendUrl, context.request));
    } catch (e) {
      return new Response(JSON.stringify({ error: 'Backend unreachable' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
      });
    }
  }

  // 4. Pro aplikační SPA cesty (např. /modtest, /rules, /media) obsloužit index.html
  return context.next();
}
