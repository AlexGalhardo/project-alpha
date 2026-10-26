// Act 1 simulation with the greedy bot (GDD 14.1, 20). One worker per party composition.
// usage: bun run sim -- [--runs 1000] [--seed 1] [--party shieldbearer,confessor,marksman]
//                       [--enemy-hp 1] [--enemy-dmg 1] [--hero-hp 1] [--json]
//                       [--set ENEMIES.bell_maw.hp=80 ...]   (dev only: patch a data value in memory)
//                       [--acts 2]   (play Act 1 and Act 2; the shipped default is ACT_RULES.acts)
// --runs is per party composition (all 10 compositions of 3 out of 5 unless --party is given).
import { isMainThread, parentPort, Worker, workerData } from 'node:worker_threads';
import type { HeroClass, RunOptions, RunState } from '../src/core/index.ts';
import { apply, chooseBotCommand, createRun } from '../src/core/index.ts';
import * as data from '../src/data/index.ts';
import { HERO_CLASSES, HEROES } from '../src/data/index.ts';

interface Job {
	party: HeroClass[];
	runs: number;
	seed0: number;
	options: RunOptions;
	sets: string[];
}

interface PartyResult {
	party: string;
	runs: number;
	wins: number;
	act1Clears: number;
	rounds: number;
	collapseRuns: number;
	falls: number;
	embers: number;
	turns: Record<'common' | 'elite' | 'boss', number[]>;
	deathRow: Record<string, number>;
}

/** `ENEMIES.bell_maw.hp=80` sets a numeric value of a data table in this process. */
function applySets(sets: string[]): void {
	for (const spec of sets) {
		const [path, raw] = spec.split('=');
		const keys = (path ?? '').split('.');
		let obj: unknown = data;
		for (const k of keys.slice(0, -1)) obj = (obj as Record<string, unknown>)[k];
		const last = keys[keys.length - 1] as string;
		if (typeof obj !== 'object' || obj === null || !(last in obj)) {
			throw new Error(`--set: unknown path ${path}`);
		}
		(obj as Record<string, unknown>)[last] = Number(raw);
	}
}

function playRun(seed: number, party: HeroClass[], options: RunOptions): RunState {
	let s = createRun(seed, party, options);
	for (let steps = 0; steps < 50000; steps++) {
		const cmd = chooseBotCommand(s);
		if (!cmd) return s;
		const r = apply(s, cmd);
		if (r.events.some((e) => e.type === 'invalid')) {
			throw new Error(
				`bot issued an invalid command ${JSON.stringify(cmd)} in phase ${s.phase}`,
			);
		}
		s = r.state;
	}
	throw new Error('run did not finish');
}

function runParty(job: Job): PartyResult {
	applySets(job.sets);
	const res: PartyResult = {
		party: job.party.join('+'),
		runs: job.runs,
		wins: 0,
		act1Clears: 0,
		rounds: 0,
		collapseRuns: 0,
		falls: 0,
		embers: 0,
		turns: { common: [], elite: [], boss: [] },
		deathRow: {},
	};
	for (let i = 0; i < job.runs; i++) {
		const s = playRun(job.seed0 + i, job.party, job.options);
		res.rounds += s.roundsCleared;
		res.falls += s.stats.falls;
		if (s.stats.collapses > 0) res.collapseRuns++;
		for (const c of s.stats.combats) res.turns[c.kind].push(c.turns);
		if (s.bossesWon >= 1) res.act1Clears++;
		if (s.phase === 'victory') res.wins++;
		else {
			const row = `A${s.act ?? 1}R${s.currentNode?.row ?? 0}`;
			res.deathRow[row] = (res.deathRow[row] ?? 0) + 1;
		}
		res.embers += s.roundsCleared * 2 + s.elitesWon * 5 + s.bossesWon * 15;
	}
	return res;
}

function compositions(custom: string): HeroClass[][] {
	if (custom) return [custom.split(',') as HeroClass[]];
	const out: HeroClass[][] = [];
	for (let a = 0; a < 5; a++) {
		for (let b = a + 1; b < 5; b++) {
			for (let c = b + 1; c < 5; c++) {
				const trio = [HERO_CLASSES[a], HERO_CLASSES[b], HERO_CLASSES[c]] as HeroClass[];
				out.push(trio.sort((x, y) => HEROES[x].frontOrder - HEROES[y].frontOrder));
			}
		}
	}
	return out;
}

const mean = (a: number[]): number => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const pct = (a: number[], p: number): number => {
	if (!a.length) return 0;
	const s = [...a].sort((x, y) => x - y);
	return s[Math.min(s.length - 1, Math.floor(p * s.length))] as number;
};
const f = (x: number, d = 1): string => x.toFixed(d);

async function main(): Promise<void> {
	const args = process.argv.slice(2);
	const opt = (k: string, d: string): string => {
		const i = args.indexOf(k);
		return i >= 0 ? (args[i + 1] ?? d) : d;
	};
	const runs = Number(opt('--runs', '1000'));
	const seed0 = Number(opt('--seed', '1'));
	const options: RunOptions = {
		enemyHpMul: Number(opt('--enemy-hp', '1')),
		enemyDmgMul: Number(opt('--enemy-dmg', '1')),
		heroHpMul: Number(opt('--hero-hp', '1')),
	};
	const sets: string[] = [];
	args.forEach((a, i) => {
		if (a === '--set') sets.push(args[i + 1] ?? '');
		if (a === '--acts') sets.push(`ACT_RULES.acts=${args[i + 1] ?? '1'}`);
	});
	const t0 = performance.now();
	const parties = compositions(opt('--party', ''));
	const results = await Promise.all(
		parties.map(
			(party) =>
				new Promise<PartyResult>((resolve, reject) => {
					const w = new Worker(new URL(import.meta.url), {
						workerData: { party, runs, seed0, options, sets } satisfies Job,
					});
					w.on('message', (m: PartyResult) => resolve(m));
					w.on('error', reject);
				}),
		),
	);

	const total = results.reduce((a, r) => a + r.runs, 0);
	const wins = results.reduce((a, r) => a + r.wins, 0);
	const collapseRuns = results.reduce((a, r) => a + r.collapseRuns, 0);
	const falls = results.reduce((a, r) => a + r.falls, 0);
	const embers = results.reduce((a, r) => a + r.embers, 0);
	const turns = { common: [] as number[], elite: [] as number[], boss: [] as number[] };
	const deathRow: Record<string, number> = {};
	const heroWins: Record<string, number> = {};
	const heroRuns: Record<string, number> = {};
	for (const r of results) {
		for (const k of ['common', 'elite', 'boss'] as const) turns[k].push(...r.turns[k]);
		for (const [row, n] of Object.entries(r.deathRow)) deathRow[row] = (deathRow[row] ?? 0) + n;
		for (const h of r.party.split('+')) {
			heroRuns[h] = (heroRuns[h] ?? 0) + r.runs;
			heroWins[h] = (heroWins[h] ?? 0) + r.wins;
		}
	}
	const noTank = results.filter((r) => !r.party.includes('shieldbearer'));
	const noTankWin =
		noTank.reduce((a, r) => a + r.wins, 0) / (noTank.reduce((a, r) => a + r.runs, 0) || 1);

	if (args.includes('--json')) {
		console.log(
			JSON.stringify({
				runs: total,
				winRate: wins / total,
				noTankWinRate: noTankWin,
				collapseRate: collapseRuns / total,
				turns: {
					common: mean(turns.common),
					elite: mean(turns.elite),
					boss: mean(turns.boss),
				},
				heroShare: Object.fromEntries(
					HERO_CLASSES.map((h) => [h, wins ? (heroWins[h] ?? 0) / wins : 0]),
				),
				rows: results.map((r) => ({ party: r.party, win: r.wins / r.runs })),
			}),
		);
		return;
	}

	console.log(
		`Act 1 sim: ${total} runs (${runs} per composition), seed ${seed0}, options ${JSON.stringify(options)}${sets.length ? `, set ${sets.join(' ')}` : ''}, ${f((performance.now() - t0) / 1000)} s`,
	);
	console.log(
		'\nparty                                    win%   rounds cleared  runs with collapse%',
	);
	for (const r of results) {
		console.log(
			`${r.party.padEnd(40)} ${f((r.wins / r.runs) * 100).padStart(5)}  ${f(r.rounds / r.runs).padStart(13)}  ${f((r.collapseRuns / r.runs) * 100).padStart(18)}`,
		);
	}
	const act1 = results.reduce((a, r) => a + r.act1Clears, 0);
	console.log(
		`\nrun win rate ${f((wins / total) * 100)}%   (target 35-60% for 1 act, 25-45% for 2 acts)`,
	);
	console.log(
		`Act 1 cleared ${f((act1 / total) * 100)}%   run won when Act 1 cleared ${f(act1 ? (wins / act1) * 100 : 0)}%`,
	);
	console.log(`parties without the Shieldbearer win ${f(noTankWin * 100)}%   (target >= 25%)`);
	console.log(`runs with >= 1 collapse ${f((collapseRuns / total) * 100)}%   (target >= 40%)`);
	console.log(`hero falls per run ${f(falls / total, 2)}   embers per run ${f(embers / total)}`);
	console.log(
		'\nturns per combat      mean   median   p90   n   (targets: common 3-6, elite 5-7, boss 7-10)',
	);
	for (const k of ['common', 'elite', 'boss'] as const) {
		console.log(
			`${k.padEnd(18)} ${f(mean(turns[k])).padStart(6)} ${f(pct(turns[k], 0.5), 0).padStart(7)} ${f(pct(turns[k], 0.9), 0).padStart(5)} ${String(turns[k].length).padStart(6)}`,
		);
	}
	console.log('\nhero share of winning parties (target >= 15%)');
	for (const h of HERO_CLASSES) {
		const share = wins ? ((heroWins[h] ?? 0) / wins) * 100 : 0;
		console.log(
			`${h.padEnd(12)} ${f(share).padStart(5)}%   win rate when present ${f(((heroWins[h] ?? 0) / (heroRuns[h] ?? 1)) * 100)}%`,
		);
	}
	console.log('\nrun ended in defeat at round (count)');
	console.log(
		Object.entries(deathRow)
			.sort((a, b) => a[0].localeCompare(b[0], undefined, { numeric: true }))
			.map(([r, n]) => `${r}:${n}`)
			.join('  '),
	);
}

if (!isMainThread) {
	parentPort?.postMessage(runParty(workerData as Job));
} else {
	await main();
}
