// Add, remove or list providers in the master, src/data/providers.json.
//
//   npm run provider -- add --name "Klinik X" --type GP --country MALAYSIA \
//     --province SELANGOR --city "PETALING JAYA" --address "12 Jalan Y"
//
//   npm run provider -- remove --name "Klinik X" [--city "PETALING JAYA"]
//
//   npm run provider -- find --name "klinik x"
//
// remove and find match the name case-insensitively as a substring; remove
// refuses to act when the match is ambiguous, so narrow it with --city /
// --country until exactly one provider matches.
import {
  loadProviders,
  saveProviders,
  normaliseProvider,
  SERVICE_TYPES,
} from './provider-store.mjs';

const [command, ...rest] = process.argv.slice(2);

const args = {};
for (let i = 0; i < rest.length; i += 2) {
  if (!rest[i].startsWith('--') || rest[i + 1] === undefined) {
    console.error(`Bad argument pair: ${rest[i]} ${rest[i + 1] ?? ''}`);
    process.exit(1);
  }
  args[rest[i].slice(2)] = rest[i + 1];
}

const providers = await loadProviders();

const matches = () =>
  providers.filter(
    (p) =>
      (!args.name || p.name.toUpperCase().includes(args.name.toUpperCase())) &&
      (!args.city || p.city.toUpperCase() === args.city.toUpperCase()) &&
      (!args.country || p.country.toUpperCase() === args.country.toUpperCase()),
  );

const describe = (p) => `${p.name} — ${p.serviceType}, ${p.city}, ${p.country}`;

if (command === 'add') {
  for (const field of ['name', 'type', 'country', 'city']) {
    if (!args[field]) {
      console.error(`--${field} is required for add`);
      process.exit(1);
    }
  }
  if (!SERVICE_TYPES.some((t) => t.toUpperCase() === args.type.toUpperCase())) {
    console.error(`--type must be one of: ${SERVICE_TYPES.join(', ')}`);
    process.exit(1);
  }
  const provider = normaliseProvider({
    name: args.name,
    serviceType: args.type,
    address: args.address,
    city: args.city,
    province: args.province,
    country: args.country,
  });
  const dup = providers.find(
    (p) => p.name.toUpperCase() === provider.name.toUpperCase() && p.city.toUpperCase() === provider.city.toUpperCase(),
  );
  if (dup) {
    console.error(`Already in master: ${describe(dup)}`);
    process.exit(1);
  }
  providers.push(provider);
  await saveProviders(providers);
  console.log(`Added: ${describe(provider)} (${providers.length} total)`);
} else if (command === 'remove') {
  if (!args.name) {
    console.error('--name is required for remove');
    process.exit(1);
  }
  const found = matches();
  if (found.length === 0) {
    console.error('No matching provider.');
    process.exit(1);
  }
  if (found.length > 1) {
    console.error(`Ambiguous - ${found.length} matches. Narrow with --city / --country:`);
    for (const p of found.slice(0, 10)) console.error(`  ${describe(p)}`);
    process.exit(1);
  }
  const remaining = providers.filter((p) => p !== found[0]);
  await saveProviders(remaining);
  console.log(`Removed: ${describe(found[0])} (${remaining.length} total)`);
} else if (command === 'find') {
  const found = matches();
  for (const p of found.slice(0, 25)) console.log(describe(p));
  console.log(`${found.length} match(es)`);
} else {
  console.error('Usage: npm run provider -- add|remove|find --name ... [--type --country --province --city --address]');
  process.exit(1);
}
