# tokenmeter-site

Marketing and docs site for Tokenmeter. Static HTML built by a 40-line Node script and served from Cloudflare Workers static assets, same build as serkan.fyi. The landing page follows brew.sh's structure: one-line install with copy button and OS switcher, then alternating feature rows with terminal examples.

## Edit

- `src/pages/*.html` — one file per page. The comment lines at the top set the title and description. `index.html` becomes `/`, `install.html` becomes `/install/`, and so on. `{{version}}` is replaced with the version from `../tokenmeter/pyproject.toml`.
- `src/layout.html` — shared head, header and footer.
- `src/static/` — copied to the site root as-is: `style.css`, `favicon.svg`, `og.png`, `dashboard.png`, `demo.gif`, `robots.txt`, `llms.txt`.

`sitemap.xml`, `robots.txt` and the `aria-current` nav state are generated.

## Run locally

```bash
npm install
npm run dev
```

Opens on http://localhost:8787.

## Deploy

```bash
npm run deploy
```

Builds `public/` and pushes it to Cloudflare. First time on a machine: `npx wrangler login`. The site is served on tokenmeter.fyi and www.tokenmeter.fyi through `routes` in `wrangler.toml`; Cloudflare creates the DNS records and certificates. Canonical URLs and the sitemap use the default in `build.mjs`.

## Refresh the screenshots

Never capture from real usage data. Generate the synthetic dataset from the main repo and run a demo instance on port 7801:

```bash
python3 ../tokenmeter/release/demo_data.py /tmp/tm-demo
CLAUDE_CONFIG_DIR=/tmp/tm-demo/claude CODEX_HOME=/tmp/tm-demo/codex COPILOT_DB=/tmp/tm-demo/copilot/session-store.db TOKENMETER_DIR=/tmp/tm-demo/tokenmeter python3 -m tokenmeter --port 7801 --user demo
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --hide-scrollbars --window-size=1280,860 --virtual-time-budget=8000 --screenshot=src/static/dashboard.png "http://127.0.0.1:7801/#range=30&theme=light"
```

`og.png` is rendered the same way from a small HTML card. `demo.gif` is copied from the main repo's `docs/`.