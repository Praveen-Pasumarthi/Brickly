import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');

const assets = [
  'index.html',
  'style.css',
  'js',
  'assets'
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const asset of assets) {
  await cp(join(root, asset), join(dist, asset), { recursive: true });
}

console.log(`Built Brickly mobile web assets in ${dist}`);
