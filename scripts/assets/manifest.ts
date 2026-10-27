// Rebuilds public/assets/sprites/manifest.json: basenames (no .png) of every game sprite in the folder.
// Run: bun scripts/assets/manifest.ts
import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const DIR = join(import.meta.dir, '..', '..', 'public', 'assets', 'sprites');
const keys = readdirSync(DIR)
	.filter((f) => f.endsWith('.png'))
	.map((f) => f.slice(0, -4))
	.filter((k) => !k.startsWith('anim.'))
	.filter((k) => !k.startsWith('icon.') || /^icon\.(node|item)\./.test(k))
	.sort();
writeFileSync(join(DIR, 'manifest.json'), `${JSON.stringify(keys, null, 2)}\n`);
console.log(`manifest.json: ${keys.length} sprites`);
