// Ember proxy — Cloudflare Worker (free plan). Browser talks HTTPS to this Worker; the Worker fetches the
// provider URL exactly as given (http:// stays http://).
//
// Settings (Worker → Settings → Variables and Secrets):
//   ACCESS_KEY     (Secret, required)  shared key; app sends it as ?k=… (or header x-ember-key)
//   ALLOWED_HOSTS  (Text, optional)    default "*" (any public host). Or a comma list: "apexdfg.com,*.theperspex.com".
//                                      Private/loopback/link-local addresses are always blocked. Every redirect hop is checked.
//   RATE_LIMITER   (optional binding)  Cloudflare Rate Limiting binding; limits requests per IP.
//
// Usage: https://<worker>/?url=<encoded URL>&k=<key>
const DEFAULT_HOSTS = '*';
const PRIVATE = /^(localhost|.*\.localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|0\.|100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.|\[?(::1?|f[cd][0-9a-f]{2}:.*|fe80:.*)\]?$)/i;
const PASS_HEADERS = ['range', 'if-range', 'accept'];
const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'range, if-range, x-ember-key', 'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS', 'Access-Control-Expose-Headers': 'content-length, content-range, accept-ranges, content-type, x-ember-error' };
// Mask credentials in paths/queries for debug messages.
const mask = u => { const x = new URL(u); x.searchParams.has('password') && x.searchParams.set('password', '***'); x.searchParams.has('username') && x.searchParams.set('username', '***'); const p = x.pathname.split('/'); const i = ['live','movie','series','timeshift'].includes(p[1]) ? 2 : 1; if (p.length > i + 2) { p[i] = '***'; p[i + 1] = '***'; } return x.host + p.join('/') + (x.search || ''); };
const err = (status, msg) => new Response(msg, { status, headers: { ...CORS, 'content-type': 'text/plain', 'x-ember-error': msg } });

// '*' = any public host; '*.example.com' = example.com and any subdomain; 'example.com' = it and its subdomains.
function hostAllowed(host, list) { host = host.toLowerCase(); return list.some(h => { if (h === '*') return true; if (h.startsWith('*.')) h = h.slice(2); return host === h || host.endsWith('.' + h); }); }
function safeEq(a, b) { if (!a || !b || a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; }

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });
    if (req.method !== 'GET' && req.method !== 'HEAD') return err(405, 'Only GET/HEAD');
    const self = new URL(req.url);
    const target = self.searchParams.get('url');
    if (!target) return new Response('Ember proxy OK', { headers: CORS });

    if (!env.ACCESS_KEY) return err(500, 'ACCESS_KEY secret not set on the Worker');
    const key = self.searchParams.get('k') || req.headers.get('x-ember-key') || '';
    if (!safeEq(key, env.ACCESS_KEY)) return err(401, 'Missing or wrong access key');

    const ip = req.headers.get('cf-connecting-ip') || 'unknown';
    if (env.RATE_LIMITER) { const { success } = await env.RATE_LIMITER.limit({ key: ip }); if (!success) return err(429, 'Too many requests'); }

    const allowed = (env.ALLOWED_HOSTS || DEFAULT_HOSTS).split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    let url; try { url = new URL(target); } catch { return err(400, 'Bad url'); }

    const h = new Headers();
    for (const k of PASS_HEADERS) { const v = req.headers.get(k); if (v) h.set(k, v); }
    h.set('user-agent', 'VLC/3.0.20 LibVLC/3.0.20');

    // Follow redirects manually so every hop is checked against the allowlist.
    let r;
    for (let hop = 0; hop < 6; hop++) {
      if (!/^https?:$/.test(url.protocol)) return err(400, 'Bad scheme');
      if (PRIVATE.test(url.hostname)) return err(403, `Blocked private address: ${url.hostname}`);
      if (!hostAllowed(url.hostname, allowed)) {
        console.log('Blocked host:', url.hostname);
        return err(403, `Blocked host: ${url.hostname} (add it to ALLOWED_HOSTS, or set ALLOWED_HOSTS to *)`);
      }
      r = await fetch(url.toString(), { method: req.method, headers: h, redirect: 'manual' });
      const loc = r.status >= 300 && r.status < 400 && r.headers.get('location');
      if (!loc) break;
      url = new URL(loc, url);
      if (hop === 5) return err(508, 'Too many redirects');
    }

    if (!r.ok && r.status !== 206) {
      const msg = `Upstream ${r.status} from ${url.protocol}//${mask(url.toString())}`;
      console.log(msg);
      return err(r.status, msg);
    }
    const out = new Headers();
    for (const k of ['content-type', 'content-length', 'content-range', 'accept-ranges', 'cache-control', 'last-modified', 'etag']) { const v = r.headers.get(k); if (v) out.set(k, v); }
    for (const [k, v] of Object.entries(CORS)) out.set(k, v);

    const ct = r.headers.get('content-type') || '';
    let isPl = /mpegurl/i.test(ct) || /\.m3u8?$/i.test(url.pathname) || /\.m3u8/i.test(target);
    if (req.method === 'GET' && !isPl && /^text\//i.test(ct)) isPl = (await r.clone().text()).trimStart().startsWith('#EXTM3U');
    if (req.method === 'GET' && isPl && r.ok) {
      // Rewrite every variant/segment/key URI (absolute or relative, resolved against the final URL) through this proxy, with the key.
      const wrap = u => `${self.origin}/?k=${encodeURIComponent(key)}&url=${encodeURIComponent(new URL(u, url).toString())}`;
      const body = (await r.text()).split('\n').map(l => {
        const s = l.trim();
        if (!s) return l;
        if (s.startsWith('#')) return l.replace(/URI="([^"]+)"/g, (_, u) => `URI="${wrap(u)}"`);
        return wrap(s);
      }).join('\n');
      out.delete('content-length');
      out.set('content-type', 'application/vnd.apple.mpegurl'); out.set('cache-control', 'no-store');
      return new Response(body, { status: r.status, headers: out });
    }
    if (/\.(ts|m4s|aac|mp4|mkv|avi)$/i.test(url.pathname) && /\/(live|hls|hlsr)\//i.test(url.pathname + target)) out.set('cache-control', 'no-store');
    // Streamed as-is (never buffered in the Worker); 206 + Content-Range preserved so .mp4/.mkv seeking works. No cookies forwarded either way.
    return new Response(r.body, { status: r.status, headers: out });
  }
};
