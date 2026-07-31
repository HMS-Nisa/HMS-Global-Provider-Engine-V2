// Refreshes src/data/providers.csv from the source Google Sheet.
//
// The directory data is committed to the repo rather than fetched at build
// time, so refreshing it is a deliberate step: run this, review the diff,
// commit. Run with `npm run sync-data`.

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';

const SHEET_ID = '1KgN-6huSau90xLvkQ-7e2oQwhdexdqGD5n0vz3SYfFM';
const SHEET_GID = '1218302279';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

const EXPECTED_HEADER = 'Country,Province / State,City,Provider Name,Service Type,Address';

const destination = fileURLToPath(new URL('../src/data/providers.csv', import.meta.url));

const response = await fetch(CSV_URL, { redirect: 'follow' });

if (!response.ok) {
	throw new Error(`Sheet request failed: ${response.status} ${response.statusText}`);
}

const csv = await response.text();

// Google serves an HTML error/redirect page with a 200 when the sheet is not
// publicly readable. Writing that over the real data would be silent corruption,
// so check we actually got the expected CSV before touching the file.
const header = csv.split('\n', 1)[0].trim();
if (header !== EXPECTED_HEADER) {
	throw new Error(
		`Unexpected response - the sheet may no longer be publicly readable.\n` +
			`Expected header: ${EXPECTED_HEADER}\n` +
			`Received:        ${header.slice(0, 200)}`
	);
}

// Parse before writing: this both counts records accurately (addresses contain
// newlines inside quoted fields, so line count overstates it) and proves the
// file the build will read is well-formed.
const records = parse(csv, { columns: true, skip_empty_lines: true, trim: true });

if (records.length < 1) {
	throw new Error('Sheet returned no data rows; refusing to overwrite existing data.');
}

await writeFile(destination, csv);
console.log(`Wrote ${records.length} providers to src/data/providers.csv`);
