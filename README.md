# Ember

A dark, premium, iPhone-first web app (PWA) for watching your own **Xtream Codes** IPTV subscription: Live TV with now/next guide, TV Guide grid, Films, Series, search, watchlist/favourites, continue watching, profiles with PIN.

**No credentials are stored in this repo.** You sign in on the device; details are kept only in that browser's `localStorage`.

- Demo (fake data, no provider content): `?demo`
- Install on iPhone: open in Safari → Share → **Add to Home Screen**.

## HTTP / HTTPS
GitHub Pages is HTTPS, and browsers block calls to `http://` servers from HTTPS pages. Ember automatically upgrades the server URL to `https://`. If your provider doesn't work over HTTPS (or streams fail), deploy the tiny proxy in `proxy/worker.js`:

1. Sign in at <https://dash.cloudflare.com> (free) → **Workers & Pages** → **Create** → **Create Worker** → name it `ember-proxy` → **Deploy**.
2. **Edit code**, replace everything with `proxy/worker.js`, **Deploy**.
3. If streams still fail, Worker → **Settings → Variables** → add `ALLOW_ANY` = `1` (streams often redirect to other hosts).
4. In Ember: Settings → Provider → **Advanced: proxy URL** → paste `https://ember-proxy.<you>.workers.dev` → Save.

The proxy is yours alone; your login passes only through your own Cloudflare account.
