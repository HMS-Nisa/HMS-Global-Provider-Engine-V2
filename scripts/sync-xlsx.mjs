// Sync the provider master from a downloaded SharePoint workbook:
//
//   npm run sync-xlsx -- ~/Downloads/providers-master.xlsx
//
// Converts the first worksheet to CSV (expects the standard six columns)
// and hands it to sync-data.mjs --file, so the same blank-cell
// preservation and corruption guards apply.
import { spawnSync } from 'node:child_process';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const xlsx = process.argv[2];
if (!xlsx) {
  console.error('Usage: npm run sync-xlsx -- <path/to/providers-master.xlsx>');
  process.exit(1);
}

const csvPath = join(mkdtempSync(join(tmpdir(), 'hms-sync-')), 'sheet.csv');
const script = `
import sys, csv
from openpyxl import load_workbook
wb = load_workbook(sys.argv[1], read_only=True, data_only=True)
ws = wb.worksheets[0]
with open(sys.argv[2], 'w', newline='', encoding='utf-8') as f:
    w = csv.writer(f)
    for row in ws.iter_rows(values_only=True):
        w.writerow(['' if v is None else v for v in row])
print('converted', ws.max_row - 1, 'rows')
`;

// cwd is the empty temp dir so a module planted next to a downloaded
// workbook can never shadow an import (openpyxl lives in user
// site-packages, which -I would exclude).
const py = spawnSync('python3', ['-c', script, resolve(xlsx), csvPath], {
  stdio: 'inherit',
  cwd: join(csvPath, '..'),
});
if (py.status !== 0) process.exit(py.status ?? 1);

const sync = spawnSync(
  process.execPath,
  [fileURLToPath(new URL('./sync-data.mjs', import.meta.url)), '--file', csvPath],
  { stdio: 'inherit', env: process.env },
);
process.exit(sync.status ?? 1);
