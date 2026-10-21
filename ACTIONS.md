# Action Log — Migration Session, 2026-10-20/21

Chronological record of what was done, in order.

## 1. Tag re-identification (prep)

- Inventoried every tag behind global.healthmetrics.com from live HTML + repo:
  Clarity `xtd9vn6v4x` (active), GA4/GTM (off, stubs ready), six custom gtag
  events, full SEO/OG/JSON-LD set, build env. Written to `MIGRATION-TAGS.md`.
- Confirmed live site already served CJ's 8,127-row master (memory said push
  was still gated — it wasn't).

## 2. New UI import

- Received HealthMetrics Assistance site (Max's Claude artifact, 31 files)
  via `~/Downloads/hms-assistance-site`; copied to `site/` on new branch
  `new-ui-migration`.
- Repaired `index.html` head (artifact export had title/meta outside `<head>`).
- Injected into all 16 pages: canonical, Open Graph, Twitter cards, Clarity
  snippet + gtag/dataLayer stub. Generated `robots.txt` + `sitemap.xml`.
- Added `analytics.js` (all pages): finder search/filter events reusing the
  old event names (`directory_search`, `directory_filter`, `outbound_click`)
  for reporting continuity; bumped service-worker cache to v3.
- Verified locally: finder works, events fire into dataLayer, console clean.

## 3. Hosting migration: Netlify → Cloudflare Workers

- Netlify draft deploy blocked (CLI logged in as nisa@, no deploy rights on
  khairul's site). Checked transfer options: UI-only, free, support-ticket
  workaround — then pivoted to Cloudflare at Khairul's request.
- Confirmed healthmetrics.com zone already on Cloudflare (Pro), `global`
  CNAME → Netlify, DNS only.
- `wrangler login` as khairul@healthmetrics.com (HealthMetrics account);
  registered workers.dev subdomain `global-hms`.
- Cloudflare email verification blocker (error 10034): resent from dash,
  pulled the link from Outlook, verified.
- Deployed worker `global-healthmetrics` serving `dist/` — byte-identical to
  Netlify production (1,932,680 bytes).
- Attached custom domain `global.healthmetrics.com`; deleted old Netlify
  CNAME (rollback value saved in STATE.md). Verified serving from Cloudflare
  edge with identical content.

## 4. Data backend: CSV → JSON

- Converted `src/data/providers.csv` → `src/data/providers.json` (8,127
  providers, normalised names/serviceType, name-sorted).
- `src/pages/index.astro` now imports the JSON directly (csv-parse dropped
  from the build path).
- Rewrote `scripts/sync-data.mjs` to merge the Google Sheet into the JSON
  master (same blank-cell preservation + corruption guard).
- New `scripts/provider.mjs` CLI: `npm run provider -- add|remove|find`
  (tested add/remove round-trip).
- New `scripts/build-finder-data.mjs`: regenerates `site/finder-data.js`
  from the master — 1,681 hospitals/specialists (replaces the artifact's
  stale 1,810-row snapshot).
- Rebuilt and verified all 8,127 records identical; deployed. Live site now
  runs the JSON-driven build (hash-verified).
- `providers.csv` kept as frozen legacy copy at Khairul's request.

## 5. Tracking / docs

- `STATE.md` (project state) and this `ACTIONS.md` written.
- Repo wired into stegg-brain auto-logging; session logged there.

## Decisions parked

- New UI go-live: after Khairul reviews `site/` (one-line wrangler change).
- SharePoint Excel co-maintenance + daily cron: pending tenant sharing check.
- Netlify account/site transfer to nisa@: moot after Cloudflare move.
- Branch `new-ui-migration`: commit held by Khairul.

## 6. Directory as subpage + nav restructure (2026-10-21)

- Astro directory now builds with `base: '/directory'`; `npm run
  build-directory` mounts it at `site/directory/` (canonical, OG and JSON-LD
  all point at /directory/).
- Nav restructured across all 16 Assistance pages (subagent): "Our Network"
  is a mega menu — Coverage & Hospital Finder / Full Provider Directory /
  Join our Network; mobile menu gained a Provider Directory entry; footer
  order is Network · Directory · How it works · Contact; network.html finder
  links members to the full directory.
- sitemap.xml gained /directory/; wrangler.jsonc switched to serve ./site.
- Verified locally: mega dropdown, mobile menu, directory page with 8,127
  records and working filters. Go-live awaits review + `wrangler deploy`.
