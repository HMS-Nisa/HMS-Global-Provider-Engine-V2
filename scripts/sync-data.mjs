// Merges the upstream Google Sheet into src/data/providers.csv.
//
// The committed CSV is the master. The sheet is a convenient editing surface,
// not the authority: this script lets the sheet ADD providers and UPDATE fields
// with real values, but a BLANK cell in the sheet never wipes a value the master
// already holds (so enriched addresses survive), and it refuses to run if the
// sheet suddenly returns far fewer rows than the master (corruption guard).
//
// Run with `npm run sync-data`, then review the diff and commit.
//
// Env overrides:
//   SYNC_MIN_RATIO   min sheet/master row ratio before aborting (default 0.9)
//   SYNC_FORCE=1     bypass the corruption guard (use for legit bulk removals)

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { parse } from 'csv-parse/sync';

const SHEET_ID = '1KgN-6huSau90xLvkQ-7e2oQwhdexdqGD5n0vz3SYfFM';
const SHEET_GID = '1218302279';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

const COLS = ['Country', 'Province / State', 'City', 'Provider Name', 'Service Type', 'Address'];
const EXPECTED_HEADER = COLS.join(',');
const MIN_RATIO = Number(process.env.SYNC_MIN_RATIO ?? 0.9);
const FORCE = process.env.SYNC_FORCE === '1';

const destination = fileURLToPath(new URL('../src/data/providers.csv', import.meta.url));

const norm = (s) => String(s ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
const blank = (v) => !String(v ?? '').trim();
const rowKey = (r) => [norm(r.Country), norm(r['Province / State']), norm(r.City), norm(r['Provider Name'])].join('|');

// Serialize to the exact byte format of the Google Sheets CSV export: minimal
// quoting (only fields containing comma / quote / newline), \r\n row terminators,
// no trailing newline. Proven byte-identical to the upstream export.
const quote = (v) => {
  v = String(v ?? '');
  return /[",\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
};
const serialize = (rows) =>
  [EXPECTED_HEADER, ...rows.map((r) => COLS.map((c) => quote(r[c])).join(','))].join('\r\n');

// --- fetch the sheet ---
const response = await fetch(CSV_URL, { redirect: 'follow' });
if (!response.ok) {
  throw new Error(`Sheet request failed: ${response.status} ${response.statusText}`);
}
const csv = await response.text();

// Google serves an HTML error/redirect page with a 200 when the sheet is not
// publicly readable. Bail before touching the master if we did not get real CSV.
const header = csv.split('\n', 1)[0].trim();
if (header !== EXPECTED_HEADER) {
  throw new Error(
    `Unexpected response - the sheet may no longer be publicly readable.\n` +
      `Expected header: ${EXPECTED_HEADER}\n` +
      `Received:        ${header.slice(0, 200)}`,
  );
}

const sheetRows = parse(csv, { columns: true, skip_empty_lines: true, trim: true });
if (sheetRows.length < 1) {
  throw new Error('Sheet returned no data rows; refusing to overwrite the master.');
}

// --- load the current master (may not exist on a first run) ---
let masterRows = [];
try {
  masterRows = parse(await readFile(destination, 'utf8'), {
    columns: true, skip_empty_lines: true, relax_column_count: true,
  });
} catch (err) {
  if (err.code !== 'ENOENT') throw err;
  console.log('No existing master found; writing the sheet as the initial master.');
}

// Corruption guard: a sheet that suddenly shrank is more likely broken than real.
if (masterRows.length && !FORCE && sheetRows.length < masterRows.length * MIN_RATIO) {
  throw new Error(
    `Refusing to sync: sheet has ${sheetRows.length} rows vs master ${masterRows.length} ` +
      `(below ${Math.round(MIN_RATIO * 100)}%). If this drop is intentional, re-run with SYNC_FORCE=1.`,
  );
}

// Preserve master values so a blank sheet cell never wipes real data.
const masterByKey = new Map();
const addrByName = new Map(); // fallback for address when city changed; only kept if unambiguous
for (const r of masterRows) {
  if (!masterByKey.has(rowKey(r))) masterByKey.set(rowKey(r), r);
  const n = norm(r['Provider Name']);
  if (!blank(r.Address)) {
    if (addrByName.has(n)) addrByName.set(n, null); // ambiguous → disable fallback for this name
    else addrByName.set(n, r.Address);
  }
}

let preservedCells = 0;
let addressFallbacks = 0;
const merged = sheetRows.map((row) => {
  const out = {};
  for (const c of COLS) out[c] = row[c] ?? '';
  const prev = masterByKey.get(rowKey(row));
  if (prev) {
    for (const c of COLS) {
      if (blank(out[c]) && !blank(prev[c])) { out[c] = prev[c]; preservedCells++; }
    }
  } else if (blank(out.Address)) {
    const fb = addrByName.get(norm(out['Provider Name']));
    if (fb) { out.Address = fb; addressFallbacks++; }
  }
  return out;
});

// --- stats ---
const sheetKeys = new Set(merged.map(rowKey));
const masterKeys = new Set(masterRows.map(rowKey));
const added = [...sheetKeys].filter((k) => !masterKeys.has(k)).length;
const removed = [...masterKeys].filter((k) => !sheetKeys.has(k)).length;

await writeFile(destination, serialize(merged));

console.log(
  `Wrote ${merged.length} providers to src/data/providers.csv\n` +
    `  added: ${added}  removed: ${removed}  ` +
    `preserved cells: ${preservedCells} (address fallbacks: ${addressFallbacks})`,
);
