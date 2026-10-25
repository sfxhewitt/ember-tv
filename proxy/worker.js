// Ember proxy — Cloudflare Worker (free plan).
// Browser -> Worker is HTTPS; Worker -> provider uses the URL exactly as given (http:// stays http://).
// Usage: https://<worker>/?url=<encoded URL>
// By default any public host is allowed, because Xtream streams usually redirect to other
// load-balancer hosts/IPs. Set env var ALLOWED="a.com,b.com" to restrict.
const PRIVATE = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|\[?::1\]?$)/i;
export default {
  async fetch(req, env) {
    const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': '*', 'Access-Control-Allow-Methods': 'GET,HEAD,OPTIONS', 'Access-Control-Expose-Headers': '*' };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    const self = new URL(req.url);
    const target = self.searchParams.get('url');
    if (!target) return new Response('Ember proxy OK', { headers: cors });
    let t; try { t = new URL(target); } catch { return new Response('bad url', { status: 400, headers: cors }); }
    if (!/^https?:$/.test(t.protocol) || PRIVATE.test(t.hostname)) return new Response('host not allowed', { status: 403, headers: cors });
    if (env.ALLOWED) {
      const allowed = env.ALLOWED.split(',').map(s => s.trim()).filter(Boolean);
      if (!allowed.some(h => t.hostname === h || t.hostname.endsWith('.' + h))) return new Response('host not allowed', { status: 403, headers: cors });
    }
    const h = new Headers();
    for (const k of ['range', 'if-range', 'accept', 'user-agent']) { const v = req.headers.get(k); if (v) h.set(k, v); }
    if (!h.get('user-agent') || /Safari|Chrome/.test(h.get('user-agent'))) h.set('user-agent', 'VLC/3.0.20 LibVLC/3.0.20');
    // Redirects (often to other hosts / http IPs) are followed here, server-side, so the browser never sees http.
    const r = await fetch(t.toString(), { method: req.method === 'HEAD' ? 'HEAD' : 'GET', headers: h, redirect: 'follow' });
    const out = new Headers(r.headers);
    for (const [k, v] of Object.entries(cors)) out.set(k, v);
    out.delete('set-cookie');
    const final = new URL(r.url || t.toString());
    const ct = r.headers.get('content-type') || '';
    let isPl = /mpegurl/i.test(ct) || /\.m3u8?$/i.test(final.pathname) || /\.m3u8/i.test(t.pathname);
    if (req.method !== 'HEAD' && !isPl && /^text\//i.test(ct)) { const txt = await r.clone().text(); isPl = txt.trimStart().startsWith('#EXTM3U'); }
    if (req.method !== 'HEAD' && isPl && r.ok) {
      // Rewrite every URI in the playlist (relative or absolute) back through this proxy, resolved against the final URL.
      const wrap = u => self.origin + '/?url=' + encodeURIComponent(new URL(u, final).toString());
      const body = (await r.text()).split('\n').map(l => {
        const s = l.trim();
        if (!s) return l;
        if (s.startsWith('#')) return l.replace(/URI="([^"]+)"/g, (_, u) => `URI="${wrap(u)}"`);
        return wrap(s);
      }).join('\n');
      out.delete('content-length'); out.delete('content-encoding');
      out.set('content-type', 'application/vnd.apple.mpegurl'); out.set('cache-control', 'no-store');
      return new Response(body, { status: r.status, headers: out });
    }
    // Body streamed as-is; status 206 + Content-Range preserved for .mp4/.mkv seeking.
    return new Response(r.body, { status: r.status, headers: out });
  }
};
