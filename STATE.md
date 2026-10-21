# Project State — HMS Global Provider (global.healthmetrics.com)

_Last updated: 2026-10-21_

## Hosting

- **Live on Cloudflare Workers** (static assets), worker `global-healthmetrics`,
  HealthMetrics account `8e292940df0e13870c713d7fe7c5eb78` (khairul@healthmetrics.com,
  email verified 2026-10-20).
- Custom domain `global.healthmetrics.com` attached to the worker; old Netlify
  CNAME deleted on 2026-10-20.
- Staging URL: https://global-healthmetrics.global-hms.workers.dev
- **Rollback:** Netlify project `hms-global-provider-network` left intact.
  Re-create CNAME `global` → `hms-global-provider-network.netlify.app` (DNS only)
  to revert.
- `netlify.toml` is legacy; `wrangler.jsonc` is the deploy config.
  Deploy = `npm run build` then `npx wrangler deploy`.

## Data pipeline

- **Master: `src/data/providers.json`** (8,127 providers, normalised fields,
  name-sorted, tab-indented). The Astro build imports it directly.
- `src/data/providers.csv` is a frozen legacy copy (kept by request, no longer
  read by anything).
- Scripts (`scripts/`):
  - `provider.mjs` — `npm run provider -- add|remove|find` edits the master
    with duplicate/ambiguity guards.
  - `sync-data.mjs` — `npm run sync-data` merges the Google Sheet into the
    JSON master (blank cells never wipe data; corruption guard below 90%).
  - `build-finder-data.mjs` — `npm run build-finder` regenerates
    `site/finder-data.js` (hospitals + specialist centres, currently 1,681)
    for the new Assistance site's finder.
  - `provider-store.mjs` — shared load/save/normalise helpers.
  - `convert-csv-to-json.mjs` — the one-off CSV→JSON conversion (done).

## Current site (deployed)

- Astro directory site in `src/`, built to `dist/`, served by the worker.
- Tags live: Clarity `xtd9vn6v4x`. GA4/GTM not enabled (stubs in place).
  Full inventory: `MIGRATION-TAGS.md`.

## Pending

1. **New UI swap** — HealthMetrics Assistance site (from Max's artifact) sits
   ready in `site/` with tags, SEO, robots/sitemap and analytics events
   injected. Swap = point `wrangler.jsonc` assets at `./site`, deploy.
   Waiting on Khairul's review. Note: its finder covers hospitals/specialists
   only — GP/dental/optical intentionally not listed.
2. **SharePoint co-maintenance** — colleague edits an Excel on SharePoint,
   synced into providers.json. Options scoped (Claude-driven sync now, or
   Cloudflare cron + KV later; cron needs an "anyone with link" share or a
   Graph app registration). Khairul to confirm tenant sharing settings.
3. **Commit** — branch `new-ui-migration` holds all of the above, uncommitted
   at Khairul's request.

## Session log

See [ACTIONS.md](ACTIONS.md) for the 2026-10-20/21 migration session, and the
stegg-brain (`projects/HMS Global Provider/log.md`) for ongoing history.
