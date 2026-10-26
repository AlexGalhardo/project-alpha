// Act 1 simulation with the greedy bot (GDD 14.1, 20).
// usage: bun run sim -- [--runs 1000] [--seed 1] [--party shieldbearer,confessor,marksman]
//                       [--enemy-hp 1] [--enemy-dmg 1] [--hero-hp 1] [--json]
// --runs is per party composition (all 10 compositions of 3 out of 5 unless --party is given).

import type { HeroClass, RunOptions, RunState } from '../src/core/index.ts';
import { apply, chooseBotCommand, createRun } from '../src/core/index.ts';
import { HERO_CLASSES, HEROES } from '../src/data/index.ts';

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

function compositions(): HeroClass[][] {
	const custom = opt('--party', '');
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

function playRun(seed: number, party: HeroClass[]): RunState {
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

const mean = (a: number[]): number => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const pct = (a: number[], p: number): number => {
	if (!a.length) return 0;
	const s = [...a].sort((x, y) => x - y);
	return s[Math.min(s.length - 1, Math.floor(p * s.length))] as number;
};
const f = (x: number, d = 1): string => x.toFixed(d);

const turns: Record<'common' | 'elite' | 'boss', number[]> = { common: [], elite: [], boss: [] };
const heroWins: Record<string, number> = {};
const heroRuns: Record<string, number> = {};
const deathRow: Record<string, number> = {};
let total = 0;
let wins = 0;
let collapseRuns = 0;
let falls = 0;
let embers = 0;
const rows: { party: string; win: number; rounds: number; collapse: number }[] = [];
const t0 = performance.now();

for (const party of compositions()) {
	let w = 0;
	let rounds = 0;
	let col = 0;
	for (let i = 0; i < runs; i++) {
		const s = playRun(seed0 + i, party);
		total++;
		rounds += s.roundsCleared;
		falls += s.stats.falls;
		if (s.stats.collapses > 0) {
			col++;
			collapseRuns++;
		}
		for (const c of s.stats.combats) if (c.won || c.kind) turns[c.kind].push(c.turns);
		for (const h of party) heroRuns[h] = (heroRuns[h] ?? 0) + 1;
		if (s.phase === 'victory') {
			w++;
			wins++;
			for (const h of party) heroWins[h] = (heroWins[h] ?? 0) + 1;
		} else {
			const row = String(s.currentNode?.row ?? 0);
			deathRow[row] = (deathRow[row] ?? 0) + 1;
		}
		embers += s.roundsCleared * 2 + s.elitesWon * 5 + s.bossesWon * 15;
	}
	rows.push({
		party: party.join('+'),
		win: w / runs,
		rounds: rounds / runs,
		collapse: col / runs,
	});
}

if (args.includes('--json')) {
	console.log(
		JSON.stringify(
			{
				runs: total,
				winRate: wins / total,
				rows,
				turns: {
					common: mean(turns.common),
					elite: mean(turns.elite),
					boss: mean(turns.boss),
				},
			},
			null,
			1,
		),
	);
	process.exit(0);
}

console.log(
	`Act 1 sim: ${total} runs (${runs} per composition), seed ${seed0}, options ${JSON.stringify(options)}, ${f((performance.now() - t0) / 1000)} s`,
);
console.log(
	'\nparty                                    win%   rounds cleared  runs with collapse%',
);
for (const r of rows)
	console.log(
		`${r.party.padEnd(40)} ${f(r.win * 100).padStart(5)}  ${f(r.rounds).padStart(13)}  ${f(r.collapse * 100).padStart(18)}`,
	);
console.log(`\noverall win rate ${f((wins / total) * 100)}%   (target 35-60%)`);
console.log(`runs with >= 1 collapse ${f((collapseRuns / total) * 100)}%   (target >= 40%)`);
console.log(`hero falls per run ${f(falls / total, 2)}   embers per run ${f(embers / total)}`);
console.log('\nturns per combat      mean   median   p90   n');
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
		.sort((a, b) => Number(a[0]) - Number(b[0]))
		.map(([r, n]) => `${r}:${n}`)
		.join('  '),
);
