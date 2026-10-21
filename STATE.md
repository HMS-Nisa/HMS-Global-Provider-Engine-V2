# Project State — HMS Global Provider (global.healthmetrics.com)

_Last updated: 2026-10-21 (new UI live)_

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

## Live since 2026-10-21

The Assistance site IS the live site (worker version ee3d137c): new UI at
the root with motion layer, hero globe and homepage directory strip; full
directory at /directory/ (8,127); hospital finder at /network (1,681);
Atlas beta removed per Max's update. Workers serves clean URLs
(.html 307s to extensionless).

## Pending
1. **SharePoint co-maintenance** — LIVE surface: providers-master.xlsx on
   the marketing2 site (Shared Documents/Global Provider Network/Master
   List). Colleagues co-edit there; sync = download the file, then
   `npm run sync-xlsx -- <path>` (same guards as sync-data). Composio
   SharePoint is off-limits and the MS connector truncates xlsx reads, so
   the download step stays manual. Daily cron: tenant blocks "Anyone with link" (confirmed 2026-10-21),
   so the only route is an Azure AD app registration (Graph
   `Sites.Selected`, read on marketing2, client-credentials) — ask IT,
   then a Cloudflare cron worker closes the loop.
2. **Merge to main** — all work is committed and pushed on
   `new-ui-migration`; PR/merge to main still open.
3. **CJ check** — ~9 possible new sheet rows (ID +4, SG +4, CN +1) to
   confirm before merging into the master; the Google Sheet itself is
   stale (pre-CJ dataset) and should be refreshed or retired.

## Session log

See [ACTIONS.md](ACTIONS.md) for the 2026-10-20/21 migration session, and the
stegg-brain (`projects/HMS Global Provider/log.md`) for ongoing history.
