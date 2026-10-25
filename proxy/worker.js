// Ember proxy — Cloudflare Worker (free plan). Lets the HTTPS web app reach an http:// Xtream server.
// Only forwards to hosts in ALLOWED (set below or via the ALLOWED env var, comma-separated).
// Usage: https://<worker>/?url=<encoded http(s) URL>
const DEFAULT_ALLOWED = ['apexdfg.com', 'ourperspex.com'];
export default {
  async fetch(req, env) {
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS', 'Access-Control-Expose-Headers': '*' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const self = new URL(req.url);
    const target = self.searchParams.get('url');
    if (!target) return new Response('Ember proxy OK', { headers: cors });
    let t; try { t = new URL(target); } catch { return new Response('bad url', { status: 400, headers: cors }); }
    const allowed = (env.ALLOWED ? env.ALLOWED.split(',') : DEFAULT_ALLOWED).map(s => s.trim()).filter(Boolean);
    // Streams are often redirected to load-balancer IPs, so allow any host once ALLOW_ANY=1.
    if (env.ALLOW_ANY !== '1' && !allowed.some(h => t.hostname === h || t.hostname.endsWith('.' + h)))
      return new Response('host not allowed', { status: 403, headers: cors });
    const h = new Headers(); for (const k of ['range', 'user-agent', 'accept']) { const v = req.headers.get(k); if (v) h.set(k, v); }
    if (!h.get('user-agent')) h.set('user-agent', 'VLC/3.0');
    const r = await fetch(t.toString(), { headers: h, redirect: 'follow' });
    const out = new Headers(r.headers); for (const [k, v] of Object.entries(cors)) out.set(k, v);
    const final = new URL(r.url || t.toString());
    const ct = r.headers.get('content-type') || '';
    if (/mpegurl/i.test(ct) || /\.m3u8$/i.test(final.pathname)) {
      // Rewrite every URI in the playlist so segments also go through the proxy.
      const wrap = u => self.origin + '/?url=' + encodeURIComponent(new URL(u, final).toString());
      const body = (await r.text()).split('\n').map(l => {
        const s = l.trim();
        if (!s) return l;
        if (s.startsWith('#')) return l.replace(/URI="([^"]+)"/g, (_, u) => `URI="${wrap(u)}"`);
        return wrap(s);
      }).join('\n');
      out.delete('content-length'); out.set('content-type', 'application/vnd.apple.mpegurl');
      return new Response(body, { status: r.status, headers: out });
    }
    return new Response(r.body, { status: r.status, headers: out });
  }
};
