// Shared helpers for reading and writing the provider master,
// src/data/providers.json. Every script that touches the master goes
// through here so normalisation and the on-disk format stay identical.
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const JSON_PATH = fileURLToPath(new URL('../src/data/providers.json', import.meta.url));

export const SERVICE_TYPES = ['GP', 'Hospital', 'Dental', 'Specialist', 'Other'];

const toTitleCase = (str) => str.toLowerCase().replace(/\b\w/g, (s) => s.toUpperCase());

// Canonical form of one provider record. Accepts loose input (sheet rows,
// CLI arguments) and returns the shape stored in the master.
export function normaliseProvider(input) {
  const rawName = String(input.name ?? '').replace(/^["'!]+|["'!]+$/g, '').trim();
  const rawType = String(input.serviceType ?? '').trim().toUpperCase();
  const type = SERVICE_TYPES.find((t) => t.toUpperCase() === rawType) || 'Other';
  return {
    name: rawName === rawName.toUpperCase() ? toTitleCase(rawName) : rawName,
    serviceType: type,
    address: String(input.address ?? '').trim(),
    city: String(input.city ?? '').trim(),
    province: String(input.province ?? '').trim(),
    country: String(input.country ?? '').trim(),
  };
}

// Identity of a provider for dedupe/merge: country + province + city + name.
const norm = (s) => String(s ?? '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
export function providerKey(p) {
  return [norm(p.country), norm(p.province), norm(p.city), norm(p.name)].join('|');
}

export async function loadProviders({ allowMissing = false } = {}) {
  try {
    return JSON.parse(await readFile(JSON_PATH, 'utf8'));
  } catch (err) {
    if (allowMissing && err.code === 'ENOENT') return [];
    throw err;
  }
}

export async function saveProviders(providers) {
  const sorted = [...providers].sort(
    (a, b) => a.name.localeCompare(b.name) || a.city.localeCompare(b.city),
  );
  await writeFile(JSON_PATH, JSON.stringify(sorted, null, '\t') + '\n');
}
