// One-off: convert src/data/providers.csv to src/data/providers.json.
//
// The JSON becomes the committed master. Values are normalised here, once,
// so every consumer (Astro build, finder-data generator, sync script) reads
// clean canonical fields instead of re-cleaning on every build:
//   - name: stray quotes stripped, title-cased
//   - serviceType: one of GP | Hospital | Dental | Specialist | Other
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';

const csvPath = fileURLToPath(new URL('../src/data/providers.csv', import.meta.url));
const jsonPath = fileURLToPath(new URL('../src/data/providers.json', import.meta.url));

const records = parse(await readFile(csvPath, 'utf8'), {
  columns: true,
  skip_empty_lines: true,
  trim: true,
});

const toTitleCase = (str) => str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());

const SERVICE_TYPES = { GP: 'GP', HOSPITAL: 'Hospital', DENTAL: 'Dental', SPECIALIST: 'Specialist' };

const providers = records
  .map((record) => {
    const rawName = record['Provider Name'] || '';
    const name = toTitleCase(rawName.replace(/^["'!]+|["'!]+$/g, '').trim());
    return {
      name,
      serviceType: SERVICE_TYPES[(record['Service Type'] || '').trim().toUpperCase()] || 'Other',
      address: record['Address'] || '',
      city: record['City'] || '',
      province: record['Province / State'] || '',
      country: record['Country'] || '',
    };
  })
  .filter((p) => p.name);

providers.sort((a, b) => a.name.localeCompare(b.name) || a.city.localeCompare(b.city));

await writeFile(jsonPath, JSON.stringify(providers, null, '\t') + '\n');
console.log(`Wrote ${providers.length} providers to src/data/providers.json`);
