# Ember

A dark, premium, iPhone-first web app (PWA) for watching your own **Xtream Codes** IPTV subscription: Live TV with now/next, TV Guide grid, Films, Series, search, watchlist/favourites, continue watching, profiles with PIN.

**No credentials or keys are stored in this repo.** Each person signs in on their own device; their login, proxy URL and access key are kept only in that browser's `localStorage`.

- Series pages show TVmaze info (status, network, next episode) — keyless, info only, never touches playback or the proxy.
- Demo (fake data): `?demo`
- Install on iPhone: Safari → Share → **Add to Home Screen**.

## Why a proxy
GitHub Pages is HTTPS; browsers block `http://` requests from HTTPS pages. Ember never rewrites the provider to https. Every http:// request (API, guide, artwork, live/VOD/series video, HLS playlists and segments) goes to your Cloudflare Worker over HTTPS, and the Worker fetches the provider over http exactly as given.

## Cloudflare Worker setup (`proxy/worker.js`)
1. dash.cloudflare.com → **Workers & Pages** → your `ember-proxy` Worker → **Edit code** → replace everything with `proxy/worker.js` → **Deploy**.
2. Worker → **Settings → Variables and Secrets** → **Add**:
   - Type **Secret**, name `ACCESS_KEY`, value: a long random phrase you choose (don't share it publicly).
   - Type **Text**, name `ALLOWED_HOSTS`, value `*` (all servers; this is also the default if unset). To restrict instead, use a comma list with wildcards, e.g. `apexdfg.com,*.theperspex.com`. Private/local addresses are always blocked.
   - Remove any old `ALLOW_ANY` variable.
3. **Deploy**.
4. If a channel says *Proxy says: Blocked host: X*, set `ALLOWED_HOSTS` to `*` (or add `X`).
5. Optional rate limit: add a **Rate Limiting** binding named `RATE_LIMITER` (e.g. 600 requests / 60 s). HLS uses many requests, so keep it generous.

## Share link for friends
`https://sfxhewitt.github.io/ember-tv/#k=YOUR_ACCESS_KEY`

Opening it saves the key on their phone and prefills the proxy; they then enter their own username/password. Send it privately.

## Where the settings are
- Sign-in screen: Server URL, Username, Password, **Proxy URL**, **Proxy access key**.
- After sign-in: **Settings → Connection** (top of Settings): Server URL, Proxy URL, Proxy access key, **Allow HTTP streams (via proxy)** (on by default), Save connection.

## Playback robustness
- hls.js tuned for live (3-segment sync, 30 s forward buffer, 15 s back buffer, conservative ABR start, fast switching).
- Silent recovery: media-error recovery and codec swap, network retries with backoff (1–8 s), stall watchdog (skip buffer gaps, jump to live edge, reload source keeping VOD position), then automatic m3u8 ⇄ ts format switch.
- Settings → General → **Show stream stats** for a bitrate/buffer overlay.

## Limits (honest)
- Cloudflare Workers free plan: **100,000 requests/day**. HLS makes ~1 request per segment (every 2–10 s), so roughly 150–400 viewer-hours/day shared by everyone using the key. Paid plan ($5/mo) removes this.
- CPU: bodies are streamed, not buffered, so the 10 ms CPU limit only matters for playlist rewriting (tiny).
- Picture quality, provider connection limits (max_connections) and provider-side buffering can't be fixed by the app or proxy.
- iPhone can't play raw MPEG-TS natively; m3u8 is used there. TS fallback (mpegts.js) only works where Media Source exists.
