// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind'; // <--- Make sure this is here

export default defineConfig({
  integrations: [tailwind()], // <--- and this is inside the list
});