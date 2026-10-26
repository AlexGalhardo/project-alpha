import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

// ADR 0012: src/core and src/data stay pure and deterministic (.claude/rules/engineering.md).
const FORBIDDEN: [RegExp, string][] = [
	[/from ['"]phaser['"]/, 'imports phaser'],
	[/from ['"][./]*\.\.\/(scenes|view|platform)\//, 'imports a presentation layer'],
	[/\bMath\.random\b/, 'uses Math.random'],
	[/\bDate\.now\b|\bnew Date\b/, 'uses Date'],
	[/\bperformance\.now\b/, 'uses performance.now'],
	[/\b(setTimeout|setInterval|requestAnimationFrame)\b/, 'uses timers'],
	[/\b(window|document|localStorage)\./, 'touches the DOM'],
];

function files(dir: string): string[] {
	return readdirSync(dir).flatMap((name) => {
		const path = join(dir, name);
		return statSync(path).isDirectory() ? files(path) : path.endsWith('.ts') ? [path] : [];
	});
}

describe('layer boundaries', () => {
	for (const dir of ['src/core', 'src/data']) {
		test(`${dir} is pure`, () => {
			const violations: string[] = [];
			for (const file of files(dir)) {
				const source = readFileSync(file, 'utf8');
				for (const [pattern, reason] of FORBIDDEN) {
					if (pattern.test(source)) violations.push(`${file}: ${reason}`);
				}
			}
			expect(violations).toEqual([]);
		});
	}
});
