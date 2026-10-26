// Local quality gate: `bun run ci`. Same steps run in .github/workflows/ci.yml.
import { existsSync } from 'node:fs';

const steps: [string, string[], boolean][] = [
	['biome', ['bunx', 'biome', 'ci', '.'], true],
	['markdownlint', ['bunx', 'markdownlint-cli2', '**/*.md'], true],
	// Steps below start existing in the STRUCTURE phase; skipped until their inputs exist.
	['typecheck', ['bun', 'check'], existsSync('tsconfig.json')],
	['unit+integration', ['bun', 'test', 'tests/unit', 'tests/integration'], existsSync('tests')],
	['build', ['bunx', 'vite', 'build'], existsSync('index.html')],
];

for (const [name, cmd, enabled] of steps) {
	if (!enabled) {
		console.log(`- ${name}: skipped (not set up yet)`);
		continue;
	}
	console.log(`> ${name}: ${cmd.join(' ')}`);
	const { exitCode } = Bun.spawnSync(cmd, { stdout: 'inherit', stderr: 'inherit' });
	if (exitCode !== 0) {
		console.error(`x ${name} failed (exit ${exitCode})`);
		process.exit(exitCode ?? 1);
	}
}
console.log('ci: ok');
