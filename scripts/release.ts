// `bun run release [patch|minor|major]`: one GitHub release per push to main (docs/adrs/0002-release-format.md).
// Steps: gate -> bump -> CHANGELOG via git-cliff -> release commit + tag -> push -> gh release with the version's notes.
// Re-running after a failure resumes: an existing release commit/tag is pushed and released, never bumped again.
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

type Bump = 'patch' | 'minor' | 'major';

function run(cmd: string[], inherit = false): string {
	const r = Bun.spawnSync(cmd, { stdout: inherit ? 'inherit' : 'pipe', stderr: 'inherit' });
	if (r.exitCode !== 0) throw new Error(`failed: ${cmd.join(' ')}`);
	return inherit ? '' : (r.stdout?.toString() ?? '').trim();
}

function succeeds(cmd: string[]): boolean {
	return Bun.spawnSync(cmd, { stdout: 'ignore', stderr: 'ignore' }).exitCode === 0;
}

function next(version: string, bump: Bump): string {
	const [major, minor, patch] = version.split('.').map(Number);
	if (bump === 'major') return `${major + 1}.0.0`;
	if (bump === 'minor') return `${major}.${minor + 1}.0`;
	return `${major}.${minor}.${patch + 1}`;
}

function notesFor(tag: string, unreleased: boolean): string {
	const range = unreleased ? ['--unreleased', '--tag', tag] : ['--current'];
	return run(['bunx', 'git-cliff', '--config', 'cliff.toml', ...range, '--strip', 'all'])
		.replace(/^## \[.*\n+/, '')
		.trim();
}

const arg = process.argv[2] ?? 'patch';
if (arg !== 'patch' && arg !== 'minor' && arg !== 'major') throw new Error(`invalid bump: ${arg}`);

if (run(['git', 'branch', '--show-current']) !== 'main') throw new Error('release only from main');
if (run(['git', 'status', '--porcelain', '--untracked-files=no']) !== '')
	throw new Error('working tree is not clean');

const pkg = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string };
const head = run(['git', 'log', '-1', '--format=%s']);
const resumeTag = head.startsWith('chore(release): v') ? head.slice('chore(release): '.length) : '';
let tag: string;
let notes: string;

if (resumeTag !== '') {
	tag = resumeTag;
	if (!succeeds(['git', 'rev-parse', '--verify', `refs/tags/${tag}`])) {
		run(['git', 'tag', '-a', tag, '-m', tag]);
	}
	notes = notesFor(tag, false);
	console.log(`resuming ${tag}`);
} else {
	run(['bun', 'run', 'ci'], true);
	const lastTag = succeeds(['git', 'describe', '--tags', '--abbrev=0'])
		? run(['git', 'describe', '--tags', '--abbrev=0'])
		: '';
	if (lastTag !== '' && lastTag !== `v${pkg.version}`) {
		throw new Error(`package.json version ${pkg.version} does not match last tag ${lastTag}`);
	}
	// The first release ships the version already in package.json (0.0.1) instead of bumping past it.
	const version = lastTag === '' ? pkg.version : next(pkg.version, arg);
	tag = `v${version}`;
	notes = notesFor(tag, true);
	if (notes === '') {
		throw new Error(
			'no releasable commits since the last tag (feat/fix/perf/refactor/revert/docs)',
		);
	}
	pkg.version = version;
	writeFileSync('package.json', `${JSON.stringify(pkg, null, '\t')}\n`);
	run(['bunx', 'git-cliff', '--config', 'cliff.toml', '--tag', tag, '--output', 'CHANGELOG.md']);
	run(['bunx', 'markdownlint-cli2', '--fix', 'CHANGELOG.md']);
	run(['git', 'add', 'package.json', 'CHANGELOG.md']);
	run(['git', 'commit', '-m', `chore(release): ${tag}`]);
	run(['git', 'tag', '-a', tag, '-m', tag]);
}

run(['git', 'push', 'origin', 'main', '--follow-tags'], true);

if (succeeds(['gh', 'release', 'view', tag])) {
	console.log(`release ${tag} already exists`);
} else {
	const notesFile = join(tmpdir(), `release-notes-${tag}.md`);
	writeFileSync(notesFile, `${notes}\n`);
	try {
		run([
			'gh',
			'release',
			'create',
			tag,
			'--title',
			tag,
			'--notes-file',
			notesFile,
			'--verify-tag',
		]);
	} finally {
		rmSync(notesFile, { force: true });
	}
	console.log(`released ${tag}`);
}
