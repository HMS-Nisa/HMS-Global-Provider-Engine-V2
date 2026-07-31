// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Production origin. Required for canonical URLs, Open Graph tags, robots.txt
// and the sitemap. Set SITE_URL in the Netlify build environment
// (Site configuration -> Environment variables) to the real production domain.
// When unset, those tags are omitted rather than pointing at a wrong domain.
const SITE_URL = process.env.SITE_URL;

if (!SITE_URL) {
  console.warn(
    '[config] SITE_URL is not set - canonical URL, Open Graph tags and sitemap will be skipped.'
  );
}

export default defineConfig({
  site: SITE_URL,
  integrations: [tailwind(), sitemap()],
});
