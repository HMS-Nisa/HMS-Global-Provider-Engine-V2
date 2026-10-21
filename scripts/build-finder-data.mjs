// Generates site/finder-data.js (the hospital finder dataset of the new
// Assistance site) from the provider master, src/data/providers.json.
//
// The finder deliberately lists hospitals and specialist centres only -
// GP, dental and optical panels stay off the public site (the finder page
// says so). Run after any change to the master:  npm run build-finder
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { loadProviders } from './provider-store.mjs';

const OUT = fileURLToPath(new URL('../site/finder-data.js', import.meta.url));

// Country name (as stored in the master) → ISO code used by finder.js's ccName map.
const COUNTRY_CODES = {
  MALAYSIA: 'MY',
  INDONESIA: 'ID',
  SINGAPORE: 'SG',
  THAILAND: 'TH',
  CAMBODIA: 'KH',
  MYANMAR: 'MM',
  INDIA: 'IN',
  CHINA: 'CN',
  TURKEY: 'TR',
};

const TYPE_CODES = { Hospital: 'H', Specialist: 'S' };

const toTitleCase = (str) => str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());

const providers = await loadProviders();

const unknownCountries = new Set();
const rows = providers
  .filter((p) => TYPE_CODES[p.serviceType])
  .map((p) => {
    const cc = COUNTRY_CODES[p.country.toUpperCase()];
    if (!cc) unknownCountries.add(p.country);
    return [p.name, toTitleCase(p.city), toTitleCase(p.province), cc, TYPE_CODES[p.serviceType]];
  })
  .filter((r) => r[3]);

if (unknownCountries.size) {
  console.warn(`Skipped countries with no ISO code mapping: ${[...unknownCountries].join(', ')}`);
}

await writeFile(OUT, `window.P=${JSON.stringify(rows)};\n`);
console.log(`Wrote ${rows.length} hospitals/specialist centres to site/finder-data.js`);
