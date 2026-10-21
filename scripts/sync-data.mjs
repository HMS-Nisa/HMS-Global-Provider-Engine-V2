// Merges the upstream Google Sheet into src/data/providers.json.
//
// The committed JSON is the master. The sheet is a convenient editing surface,
// not the authority: this script lets the sheet ADD providers and UPDATE fields
// with real values, but a BLANK cell in the sheet never wipes a value the master
// already holds (so enriched addresses survive), and it refuses to run if the
// sheet suddenly returns far fewer rows than the master (corruption guard).
//
// Run with `npm run sync-data`, then review the diff and commit.
// Direct add/remove without the sheet: `npm run provider -- add|remove ...`.
//
// Env overrides:
//   SYNC_MIN_RATIO   min sheet/master row ratio before aborting (default 0.9)
//   SYNC_FORCE=1     bypass the corruption guard (use for legit bulk removals)

import { parse } from 'csv-parse/sync';
import {
  loadProviders,
  saveProviders,
  normaliseProvider,
  providerKey,
} from './provider-store.mjs';

const SHEET_ID = '1KgN-6huSau90xLvkQ-7e2oQwhdexdqGD5n0vz3SYfFM';
const SHEET_GID = '1218302279';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

const COLS = ['Country', 'Province / State', 'City', 'Provider Name', 'Service Type', 'Address'];
const EXPECTED_HEADER = COLS.join(',');
const MIN_RATIO = Number(process.env.SYNC_MIN_RATIO ?? 0.9);
const FORCE = process.env.SYNC_FORCE === '1';

const blank = (v) => !String(v ?? '').trim();

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

// Sheet rows → canonical provider objects.
const sheetProviders = sheetRows
  .map((r) =>
    normaliseProvider({
      name: r['Provider Name'],
      serviceType: r['Service Type'],
      address: r['Address'],
      city: r['City'],
      province: r['Province / State'],
      country: r['Country'],
    }),
  )
  .filter((p) => p.name);

// --- load the current master (may not exist on a first run) ---
const masterProviders = await loadProviders({ allowMissing: true });

// Corruption guard: a sheet that suddenly shrank is more likely broken than real.
if (masterProviders.length && !FORCE && sheetProviders.length < masterProviders.length * MIN_RATIO) {
  throw new Error(
    `Refusing to sync: sheet has ${sheetProviders.length} rows vs master ${masterProviders.length} ` +
      `(below ${Math.round(MIN_RATIO * 100)}%). If this drop is intentional, re-run with SYNC_FORCE=1.`,
  );
}

// Preserve master values so a blank sheet cell never wipes real data.
const FIELDS = ['name', 'serviceType', 'address', 'city', 'province', 'country'];
const masterByKey = new Map();
const addrByName = new Map(); // fallback for address when city changed; only kept if unambiguous
for (const p of masterProviders) {
  if (!masterByKey.has(providerKey(p))) masterByKey.set(providerKey(p), p);
  const n = p.name.toUpperCase();
  if (!blank(p.address)) {
    if (addrByName.has(n)) addrByName.set(n, null); // ambiguous → disable fallback for this name
    else addrByName.set(n, p.address);
  }
}

let preservedCells = 0;
let addressFallbacks = 0;
const merged = sheetProviders.map((row) => {
  const out = { ...row };
  const prev = masterByKey.get(providerKey(row));
  if (prev) {
    for (const f of FIELDS) {
      if (blank(out[f]) && !blank(prev[f])) { out[f] = prev[f]; preservedCells++; }
    }
  } else if (blank(out.address)) {
    const fb = addrByName.get(out.name.toUpperCase());
    if (fb) { out.address = fb; addressFallbacks++; }
  }
  return out;
});

// --- stats ---
const sheetKeys = new Set(merged.map(providerKey));
const masterKeys = new Set(masterProviders.map(providerKey));
const added = [...sheetKeys].filter((k) => !masterKeys.has(k)).length;
const removed = [...masterKeys].filter((k) => !sheetKeys.has(k)).length;

await saveProviders(merged);

console.log(
  `Wrote ${merged.length} providers to src/data/providers.json\n` +
    `  added: ${added}  removed: ${removed}  ` +
    `preserved cells: ${preservedCells} (address fallbacks: ${addressFallbacks})`,
);
