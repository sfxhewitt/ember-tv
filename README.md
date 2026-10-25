# Ember

A dark, premium, iPhone-first web app (PWA) for watching your own **Xtream Codes** IPTV subscription: Live TV with now/next guide, TV Guide grid, Films, Series, search, watchlist/favourites, continue watching, profiles with PIN.

**No credentials are stored in this repo.** You sign in on the device; details are kept only in that browser's `localStorage`.

- Demo (fake data, no provider content): `?demo`
- Install on iPhone: open in Safari → Share → **Add to Home Screen**.

## HTTP / HTTPS
GitHub Pages is HTTPS, and browsers block calls to `http://` servers from HTTPS pages. So every http:// request (API, guide, artwork, live/VOD/series video) is sent through your own proxy. Deploy the tiny proxy in `proxy/worker.js`:

1. Sign in at <https://dash.cloudflare.com> (free) → **Workers & Pages** → **Create** → **Create Worker** → name it `ember-proxy` → **Deploy**.
2. **Edit code**, replace everything with `proxy/worker.js`, **Deploy**.
3. In Ember the Proxy URL is on the sign-in screen (prefilled) and in **Settings → Connection** (top of Settings), with **Allow HTTP streams (via proxy)** on by default.

The server URL is never upgraded to https; the Worker fetches it over http exactly as given. The current worker allows any public host (needed because streams redirect to other servers). Older copies of the worker needed `ALLOW_ANY=1`.

The proxy is yours alone; your login passes only through your own Cloudflare account.
