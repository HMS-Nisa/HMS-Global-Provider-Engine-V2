# global.healthmetrics.com — Tag Inventory & Migration Prep

Re-identified 2026-10-20 from live HTML + repo source. Purpose: everything the
new UI version must carry over when the current global directory is migrated.

## 1. Analytics / tracking tags (live today)

| Tag | Status | ID / source |
|---|---|---|
| Microsoft Clarity | **ACTIVE on live site** | `xtd9vn6v4x` — pinned in `netlify.toml` → `PUBLIC_CLARITY_ID`, injected in `src/layouts/Layout.astro` |
| GA4 (gtag.js) | NOT live | `PUBLIC_GA4_ID` commented out in `netlify.toml`. Layout supports it; events already wired (below) |
| GTM | NOT live | `PUBLIC_GTM_ID` optional. Warning in config: loading GA4 both directly and via GTM double-counts pageviews |

`Layout.astro` initialises `window.dataLayer` + `gtag()` stub unconditionally,
so all custom events below are safe no-ops until GA4/GTM is enabled.

## 2. Custom events (src/pages/index.astro)

All fire via `track()` → `gtag('event', …)` + `dataLayer.push`:

- `directory_search` — `{ search_term, result_count }` (debounced)
- `directory_filter` — `{ filter_name, filter_value, result_count, active_country, active_city, active_province, active_service_type }`
- `directory_load_more` — `{ visible_count, result_count }`
- `provider_map_click` — `{ provider_name, provider_city, provider_country, provider_service_type }` (delegated on `[data-map-link]`)
- `outbound_click` — `{ link_url: 'https://healthmetrics.com', link_text: 'Visit Main Site' }` (on `#mainSiteLink`)
- `directory_reset` — `{ result_count }` (on `#resetBtn`)

New UI must keep these element hooks (or re-wire the events): `#searchInput`,
`#countrySelect` / `#provinceSelect` / `#citySelect` / `#serviceTypeSelect`,
`#resetBtn`, `#mainSiteLink`, load-more button, `[data-map-link]` on cards.

## 3. SEO / meta tags (live HTML, served from Layout.astro)

- `<title>` HealthMetrics - Direct Contract Facility Directory
- Meta description: "Search the HealthMetrics global network of direct contract hospitals, GPs, dental and specialist clinics. Filter by country, city, province and service type."
- Canonical: `https://global.healthmetrics.com/` (derived from `SITE_URL`)
- Open Graph: `og:type=website`, `og:site_name=HealthMetrics`, `og:title`, `og:description`, `og:url`, `og:image=/logo.png`
- Twitter: `summary_large_image` + title/description/image
- JSON-LD (`application/ld+json`): `Organization` (HealthMetrics Sdn Bhd) + `CollectionPage` + `ItemList` of **8,127 facilities** with full PostalAddress each — generated at build from `src/data/providers.csv`
- `robots.txt.ts` + sitemap via `@astrojs/sitemap` (both depend on `SITE_URL`)
- Fonts: Google Fonts Inter (preconnect + stylesheet)
- Favicon `/favicon.png`, logo `/logo.png`

## 4. Build environment (Netlify)

```toml
SITE_URL = "https://global.healthmetrics.com"   # required — canonical/OG/robots/sitemap
PUBLIC_CLARITY_ID = "xtd9vn6v4x"
# PUBLIC_GA4_ID = "G-XXXXXXXXXX"                # enable when GA4 property ready
```

## 5. Migration checklist (new UI swap)

- [ ] Receive new-UI artifact; replace page/components
- [ ] Carry over `Layout.astro` head block (Clarity/GA4/GTM injection, meta, OG, JSON-LD) or equivalent
- [ ] Re-wire the six custom events to the new UI's controls
- [ ] Keep data source `src/data/providers.csv` (8,127 rows, current master from CJ, deployed live)
- [ ] Keep `SITE_URL` + `PUBLIC_CLARITY_ID` env values
- [ ] Verify after deploy: title/canonical/OG present, Clarity tag `xtd9vn6v4x` loads, JSON-LD count matches CSV, sitemap + robots OK
