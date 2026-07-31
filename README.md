# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

<!-- ASTRO:REMOVE:START -->

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/basics)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/basics)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/basics/devcontainer.json)

<!-- ASTRO:REMOVE:END -->

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

<!-- ASTRO:REMOVE:START -->

![just-the-basics](https://github.com/withastro/astro/assets/2244813/a0a5533c-a856-4198-8470-2d67b1d7c554)

<!-- ASTRO:REMOVE:END -->

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
| `npm run sync-data`       | Refresh `src/data/providers.csv` from the sheet  |

## 🏥 Provider data

The directory lives in **`src/data/providers.csv`**, committed to the repo and
parsed at build time. Editing that file and pushing is what changes the live
site.

It was previously fetched from a Google Sheet during the build. That meant the
deployed data was whatever the sheet happened to hold at deploy time — sheet
edits did not appear until something else triggered a rebuild, and nothing in
the repo recorded what was actually shipped. Keeping the CSV in git makes each
data change an explicit, reviewable commit.

The sheet is still the upstream source. To pull its current contents:

```sh
npm run sync-data
```

That rewrites `src/data/providers.csv`; review the diff and commit it. The
script refuses to write if the sheet stops being publicly readable (Google
serves an HTML error page with a `200` status, which would otherwise silently
overwrite the data with garbage) or if it parses to zero rows.

Expected columns: `Country`, `Province / State`, `City`, `Provider Name`,
`Service Type`, `Address`. `Service Type` is matched case-insensitively against
`GP`, `HOSPITAL`, `DENTAL` and `SPECIALIST`; anything else renders as `Other`.

## 📊 Analytics & SEO

Build-time environment variables drive everything. Set them in Netlify under
**Site configuration → Environment variables**; see `.env.example`.

| Variable | Effect when set | Effect when unset |
| :--- | :--- | :--- |
| `SITE_URL` | Canonical URL, Open Graph/Twitter tags, `robots.txt` sitemap line, `sitemap-index.xml` | All omitted (no wrong-domain tags emitted) |
| `PUBLIC_GA4_ID` | `gtag.js` loads; pageviews + custom events go to GA4 | No GA4 script; `track()` is a no-op |
| `PUBLIC_CLARITY_ID` | Microsoft Clarity loads (heatmaps, session recordings) | No Clarity script |
| `PUBLIC_GTM_ID` | Google Tag Manager loads in `<head>` + `<noscript>` fallback | No GTM script |

GA4 and Clarity load **directly** — no GTM container required. `PUBLIC_GTM_ID` is
only for the case where tag management moves into GTM instead; setting it
*alongside* `PUBLIC_GA4_ID` double-counts every pageview.

### Custom events

The site is a single URL with client-side filtering, so pageviews alone reveal
nothing. These fire via `gtag('event', …)` straight into GA4 (and are mirrored to
`window.dataLayer` for GTM, if it is ever used). Mark the useful ones as
conversions in **GA4 → Admin → Events**:

| Event | Key parameters |
| :--- | :--- |
| `directory_search` | `search_term`, `result_count` (debounced 800 ms) |
| `directory_filter` | `filter_name`, `filter_value`, `result_count`, plus all active filters |
| `directory_reset` | `result_count` |
| `directory_load_more` | `visible_count`, `result_count` |
| `provider_map_click` | `provider_name`, `provider_city`, `provider_country`, `provider_service_type` |
| `outbound_click` | `link_url`, `link_text` |

### Not covered here

Netlify Analytics (server-side pageviews) and Google Search Console verification
are dashboard tasks, not code. GSC is the only source of impressions, clicks and
search queries.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
